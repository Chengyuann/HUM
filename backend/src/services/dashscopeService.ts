import axios, { AxiosError } from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';

const DASHSCOPE_API_BASE = 'https://dashscope.aliyuncs.com';
const DASHSCOPE_WS_URL = 'wss://dashscope.aliyuncs.com/api-ws/v1/inference/';
const MODEL_NAME = 'cosyvoice-v3-plus';
const AUDIO_FORMAT = 'mp3';
const SAMPLE_RATE = 22050;

const getApiKey = (): string => {
  const key = process.env.DASHSCOPE_API_KEY;
  if (!key) throw new Error('DASHSCOPE_API_KEY is not configured');
  return key;
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, delayMs = 3000): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const status = (error as AxiosError).response?.status;
      if (status === 429 && attempt < maxRetries) {
        console.warn(`[DashScope] 429 限流，${delayMs / 1000}s 后重试 (${attempt}/${maxRetries})...`);
        await sleep(delayMs);
        continue;
      }
      throw error;
    }
  }
  throw new Error('withRetry: unreachable');
}

export interface UploadFileResponse {
  fileId: string;
  ossUrl: string;
}

export interface RegisterVoiceResponse {
  voiceId: string;
}

export class DashScopeService {
  /**
   * 上传本地音频文件到 DashScope，获取 OSS URL
   * 对应 Python demo 中的 upload_audio_file()
   */
  async uploadAudioFile(filePath: string): Promise<UploadFileResponse> {
    const apiKey = getApiKey();
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('purpose', 'file-extract');

    try {
      // 使用 native DashScope 端点（/api/v1/files），
      // 该端点的 GET 接口会返回 data.url（临时 OSS HTTP 链接）。
      // OpenAI 兼容端点（/compatible-mode/v1/files）不返回 URL，不能用于 voice enrollment。
      const response = await withRetry(() => axios.post(
        `${DASHSCOPE_API_BASE}/api/v1/files`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            ...formData.getHeaders(),
          },
          timeout: 60000,
        }
      ));

      // Native DashScope 格式: { data: { uploaded_files: [{ file_id, name }] } }
      let fileId: string;
      if (response.data.data?.uploaded_files?.[0]?.file_id) {
        fileId = response.data.data.uploaded_files[0].file_id;
      } else if (response.data.output?.uploaded_files?.[0]?.file_id) {
        fileId = response.data.output.uploaded_files[0].file_id;
      } else if (response.data.id) {
        fileId = response.data.id;
      } else {
        throw new Error(`File upload failed, no file_id in response: ${JSON.stringify(response.data)}`);
      }

      // 通过 native GET 获取临时 HTTP URL（data.url）
      const fileDetail = await withRetry(() => axios.get(
        `${DASHSCOPE_API_BASE}/api/v1/files/${fileId}`,
        {
          headers: { Authorization: `Bearer ${apiKey}` },
          timeout: 30000,
        }
      ));

      const ossUrl =
        fileDetail.data.data?.url ||
        fileDetail.data.output?.url ||
        fileDetail.data.url;

      if (!ossUrl || !ossUrl.startsWith('http')) {
        throw new Error(`No valid OSS URL in file detail: ${JSON.stringify(fileDetail.data)}`);
      }

      console.log(`[DashScope] 文件上传成功，fileId: ${fileId}, ossUrl: ${ossUrl.substring(0, 60)}...`);
      return { fileId, ossUrl };
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('[DashScope] 文件上传失败:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
      });
      throw new Error(`DashScope 文件上传失败: ${axiosError.message}`);
    }
  }

  /**
   * 注册声音（音色复刻）
   * 对应 Python demo 中的 register_voice()
   * 返回 voice_id，格式如 "cosyvoice-hum-xxxxx"
   */
  async registerVoice(ossUrl: string, prefix: string = 'hum'): Promise<string> {
    const apiKey = getApiKey();

    try {
      const response = await withRetry(() => axios.post(
        `${DASHSCOPE_API_BASE}/api/v1/services/audio/tts/customization`,
        {
          model: 'voice-enrollment',
          input: {
            action: 'create_voice',
            target_model: MODEL_NAME,
            prefix,
            url: ossUrl,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        }
      ));

      // 响应示例: { VoiceName: "cosyvoice-hum-xxxxx", Message: "SUCCESS", Code: 20000000 }
      const voiceId =
        response.data.VoiceName ||
        response.data.output?.voice_id ||
        response.data.voice_id;

      if (!voiceId) {
        throw new Error(`Voice registration failed, no voice_id: ${JSON.stringify(response.data)}`);
      }

      console.log(`[DashScope] 音色注册成功，voiceId: ${voiceId}`);
      return voiceId;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('[DashScope] 音色注册失败:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
      });
      throw new Error(`DashScope 音色注册失败: ${axiosError.message}`);
    }
  }

  /**
   * 上传并注册音色（一步到位）
   * 对应 Python demo 中完整的 register_voice() 流程
   */
  async uploadAndRegisterVoice(filePath: string, prefix: string = 'hum'): Promise<string> {
    console.log('[DashScope] 开始上传音频文件...');
    const { ossUrl } = await this.uploadAudioFile(filePath);

    console.log('[DashScope] 开始注册音色...');
    const voiceId = await this.registerVoice(ossUrl, prefix);

    return voiceId;
  }

  /**
   * 使用 WebSocket 生成 TTS 音频
   * CosyVoice 系列只支持 WebSocket，不支持 HTTP REST
   * 对应 Python demo 中的 SpeechSynthesizer(model, voice).call(text)
   */
  async generateSpeech(text: string, voiceId: string): Promise<Buffer> {
    const apiKey = getApiKey();

    return new Promise((resolve, reject) => {
      const taskId = uuidv4();
      const audioChunks: Buffer[] = [];
      let finished = false;

      const ws = new WebSocket(DASHSCOPE_WS_URL, {
        headers: {
          Authorization: `bearer ${apiKey}`,
          'X-DashScope-DataInspection': 'enable',
        },
      });

      const timeout = setTimeout(() => {
        if (!finished) {
          ws.terminate();
          reject(new Error('[DashScope] WebSocket TTS 合成超时'));
        }
      }, 120000);

      ws.on('open', () => {
        console.log('[DashScope] WebSocket 连接建立，发送 run-task...');
        const runTaskMsg = JSON.stringify({
          header: {
            action: 'run-task',
            task_id: taskId,
            streaming: 'duplex',
          },
          payload: {
            task_group: 'audio',
            task: 'tts',
            function: 'SpeechSynthesizer',
            model: MODEL_NAME,
            parameters: {
              text_type: 'PlainText',
              voice: voiceId,
              format: AUDIO_FORMAT,
              sample_rate: SAMPLE_RATE,
            },
            input: {},
          },
        });
        ws.send(runTaskMsg);
      });

      ws.on('message', (data: WebSocket.RawData, isBinary: boolean) => {
        if (isBinary) {
          // 接收音频二进制数据
          audioChunks.push(Buffer.isBuffer(data) ? data : Buffer.from(data as ArrayBuffer));
          return;
        }

        let message: any;
        try {
          message = JSON.parse(data.toString());
        } catch {
          return;
        }

        const event = message?.header?.event;
        console.log(`[DashScope] 收到事件: ${event}`);

        if (event === 'task-started') {
          // 发送文本
          const continueTaskMsg = JSON.stringify({
            header: {
              action: 'continue-task',
              task_id: taskId,
              streaming: 'duplex',
            },
            payload: {
              input: { text },
            },
          });
          ws.send(continueTaskMsg);

          // 立即发送 finish-task 表示输入完毕
          const finishTaskMsg = JSON.stringify({
            header: {
              action: 'finish-task',
              task_id: taskId,
              streaming: 'duplex',
            },
            payload: {
              input: {},
            },
          });
          ws.send(finishTaskMsg);
        } else if (event === 'task-finished') {
          finished = true;
          clearTimeout(timeout);
          ws.close();
          console.log(`[DashScope] TTS 合成完成，音频大小: ${audioChunks.reduce((s, c) => s + c.length, 0)} bytes`);
          resolve(Buffer.concat(audioChunks));
        } else if (event === 'task-failed') {
          finished = true;
          clearTimeout(timeout);
          ws.close();
          const errMsg = message?.header?.error_message || JSON.stringify(message);
          reject(new Error(`[DashScope] TTS 任务失败: ${errMsg}`));
        }
      });

      ws.on('error', (error) => {
        if (!finished) {
          clearTimeout(timeout);
          finished = true;
          reject(new Error(`[DashScope] WebSocket 错误: ${error.message}`));
        }
      });

      ws.on('close', (code, reason) => {
        if (!finished) {
          clearTimeout(timeout);
          finished = true;
          if (audioChunks.length > 0) {
            resolve(Buffer.concat(audioChunks));
          } else {
            reject(new Error(`[DashScope] WebSocket 意外关闭: ${code} ${reason.toString()}`));
          }
        }
      });
    });
  }

  /**
   * 列出已注册的音色（按前缀筛选）
   */
  async listVoices(prefix: string = ''): Promise<any[]> {
    const apiKey = getApiKey();
    try {
      const response = await axios.post(
        `${DASHSCOPE_API_BASE}/api/v1/services/audio/tts/customization`,
        {
          model: 'voice-enrollment',
          input: {
            action: 'list_voice',
            target_model: MODEL_NAME,
            prefix,
            page_index: 0,
            page_size: 100,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );
      return response.data.voices || response.data.output?.voices || [];
    } catch {
      return [];
    }
  }

  /**
   * 删除已注册的音色
   */
  async deleteVoice(voiceId: string): Promise<void> {
    const apiKey = getApiKey();
    await axios.post(
      `${DASHSCOPE_API_BASE}/api/v1/services/audio/tts/customization`,
      {
        model: 'voice-enrollment',
        input: {
          action: 'delete_voice',
          target_model: MODEL_NAME,
          voice_id: voiceId,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );
    console.log(`[DashScope] 音色已删除: ${voiceId}`);
  }
}

export default new DashScopeService();
