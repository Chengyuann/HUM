import fs from 'fs/promises';
import path from 'path';
import voiceService from './voiceServiceMemory';
import dashscopeService from './dashscopeService';
import { memoryStorage } from '../storage/memoryStorage';

const TTS_OUTPUT_DIR = process.env.STORAGE_PATH
  ? path.join(process.env.STORAGE_PATH, 'tts_outputs')
  : path.join(__dirname, '../../tts_outputs');

// 确保输出目录存在
(async () => {
  try {
    await fs.mkdir(TTS_OUTPUT_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create TTS output directory:', error);
  }
})();

export interface TTSRequest {
  userId: string;
  voiceId: string;
  input: string;
  model: string;
}

export interface TTSResponse {
  audioUrl: string;
  audioPath: string;
  duration?: number;
}

export class TTSService {
  async generateTTS(request: TTSRequest): Promise<TTSResponse> {
    // 1. 获取voice信息
    const voice = await voiceService.getVoice(request.voiceId);
    if (!voice) {
      throw new Error('Voice不存在');
    }

    // 2. 调用 DashScope CosyVoice-v2 生成音频（WebSocket）
    const audioBuffer = await dashscopeService.generateSpeech(
      request.input,
      voice.stepVoiceId  // 存储的是 DashScope voice_id，格式如 "cosyvoice-hum-xxxxx"
    );

    // 3. 保存音频文件
    const timestamp = Date.now();
    const audioPath = path.join(TTS_OUTPUT_DIR, `${request.voiceId}_${timestamp}.mp3`);
    await fs.writeFile(audioPath, audioBuffer);

    // 4. 记录使用量
    await this.recordUsage(request.userId, request.voiceId, request.input, request.model, audioPath);

    // 5. 返回音频URL
    const audioUrl = `/api/files/tts/${path.basename(audioPath)}`;

    return {
      audioUrl,
      audioPath,
    };
  }

  private async recordUsage(
    userId: string,
    voiceId: string,
    inputText: string,
    model: string,
    audioPath: string
  ): Promise<void> {
    const duration = 0; // 暂时设为0
    memoryStorage.saveTTSRequest({
      userId,
      voiceId,
      inputText,
      model,
      audioPath,
      duration,
      createdAt: new Date(),
    });
  }

  async getTTSHistory(userId: string, limit: number = 20): Promise<any[]> {
    return memoryStorage.getTTSHistory(userId, limit);
  }
}

export default new TTSService();



