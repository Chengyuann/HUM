import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

export interface ProcessedAudio {
  path: string;
  size: number;
  format: string;
}

export class AudioPreprocessor {
  /**
   * 处理音频文件
   * - 格式转换（统一为wav）
   * - 采样率统一（16kHz）
   * - 声道处理（单声道）
   * - 音频归一化
   */
  async process(inputPath: string): Promise<ProcessedAudio> {
    const outputPath = inputPath.replace(/\.[^.]+$/, '_processed.wav');

    try {
      // 检查ffmpeg是否可用
      await execAsync('ffmpeg -version');
    } catch (error) {
      console.warn('ffmpeg not found, skipping audio preprocessing');
      // 如果没有ffmpeg，直接返回原文件
      const stats = await fs.stat(inputPath);
      return {
        path: inputPath,
        size: stats.size,
        format: path.extname(inputPath).slice(1),
      };
    }

    // 只做格式/采样率/声道转换，不做动态压缩
    // dynaudnorm 会拉平噪音导致 DashScope VAD 误判，故移除
    const ffmpegCommand = `ffmpeg -i "${inputPath}" -ar 16000 -ac 1 -y "${outputPath}"`;
    
    try {
      await execAsync(ffmpegCommand);
      
      // 删除原文件（如果不同）
      if (inputPath !== outputPath) {
        await fs.unlink(inputPath);
      }

      const stats = await fs.stat(outputPath);
      return {
        path: outputPath,
        size: stats.size,
        format: 'wav',
      };
    } catch (error) {
      console.error('Audio preprocessing failed:', error);
      // 如果处理失败，返回原文件
      const stats = await fs.stat(inputPath);
      return {
        path: inputPath,
        size: stats.size,
        format: path.extname(inputPath).slice(1),
      };
    }
  }

  /**
   * 获取音频时长（秒）
   */
  async getDuration(audioPath: string): Promise<number> {
    try {
      // 检查ffmpeg是否可用
      await execAsync('ffprobe -version');
    } catch (error) {
      // 如果没有ffprobe，返回默认值
      return 5;
    }

    try {
      const command = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"`;
      const { stdout } = await execAsync(command);
      return parseFloat(stdout.trim()) || 0;
    } catch (error) {
      console.error('Failed to get audio duration:', error);
      return 0;
    }
  }

  /**
   * 检测音频是否包含有效人声内容
   * 用 ffmpeg volumedetect 分析最大音量，低于阈值视为静音
   * max_volume < -30dB 基本是环境噪音，不含语音
   */
  async checkVoiceContent(audioPath: string): Promise<void> {
    try {
      await execAsync('ffmpeg -version');
    } catch {
      return; // 没有 ffmpeg 跳过检测
    }

    // Windows 上用 NUL，Linux/macOS 用 /dev/null
    const nullDevice = process.platform === 'win32' ? 'NUL' : '/dev/null';

    try {
      const { stderr } = await execAsync(
        `ffmpeg -i "${audioPath}" -af volumedetect -f null "${nullDevice}"`
      );
      const match = stderr.match(/max_volume:\s*([-\d.]+)\s*dB/);
      if (match) {
        const maxVolume = parseFloat(match[1]);
        // DashScope VAD 检测比较严格，使用 -25dB 作为本地预筛阈值
        if (maxVolume < -25) {
          throw new Error(`音频内容过于安静（最大音量 ${maxVolume.toFixed(1)} dB），请确保录音时有清晰的说话声，并靠近麦克风`);
        }
      }
    } catch (error: any) {
      // 只重新抛出我们自己的错误
      if (error.message?.includes('音频内容过于安静')) {
        throw error;
      }
      // ffmpeg 运行错误忽略，不阻断流程
    }
  }

  /**
   * 裁剪音频到指定时长
   */
  async trimAudio(inputPath: string, maxDuration: number = 10): Promise<string> {
    const outputPath = inputPath.replace(/\.[^.]+$/, '_trimmed.wav');

    try {
      await execAsync('ffmpeg -version');
    } catch (error) {
      return inputPath;
    }

    try {
      const command = `ffmpeg -i "${inputPath}" -t ${maxDuration} -y "${outputPath}"`;
      await execAsync(command);
      await fs.unlink(inputPath);
      return outputPath;
    } catch (error) {
      console.error('Audio trimming failed:', error);
      return inputPath;
    }
  }
}

export default new AudioPreprocessor();



