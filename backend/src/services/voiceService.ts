import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import pool from '../config/database';
import fileService from './fileService';
import embeddingService from './embeddingService';
import dashscopeService from './dashscopeService';

export interface Voice {
  id: string;
  userId: string;
  stepVoiceId: string;
  fileId: string;
  model: string;
  text?: string;
  sampleText?: string;
  sampleAudioPath?: string;
  embeddingHash: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const SAMPLES_DIR = process.env.STORAGE_PATH
  ? path.join(process.env.STORAGE_PATH, 'samples')
  : path.join(__dirname, '../../samples');

// 确保samples目录存在
(async () => {
  try {
    await fs.mkdir(SAMPLES_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create samples directory:', error);
  }
})();

export class VoiceService {
  /**
   * 创建音色角色
   */
  async createVoice(
    userId: string,
    fileId: string,
    model: string,
    text?: string,
    sampleText?: string
  ): Promise<Voice> {
    // 检查是否已存在（幂等性）
    const existing = await pool.query(
      'SELECT * FROM voices WHERE file_id = $1 AND model = $2',
      [fileId, model]
    );

    if (existing.rows.length > 0) {
      const voice = this.mapRowToVoice(existing.rows[0]);
      return voice;
    }

    // 1. 生成embedding
    const { vector, vectorHash } = await embeddingService.generateEmbedding(fileId);
    await embeddingService.saveEmbedding(fileId, vector, vectorHash);

    // 2. 获取文件信息
    const file = await fileService.getFile(fileId);
    if (!file) {
      throw new Error('文件不存在');
    }

    // 3. 调用 DashScope CosyVoice-v3-plus 上传音频并注册音色
    console.log('[DashScope] 开始音色复刻流程...');
    const dashscopeVoiceId = await dashscopeService.uploadAndRegisterVoice(
      file.filePath,
      'hum'
    );

    // 4. 保存到数据库
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO voices (id, user_id, step_voice_id, file_id, model, text, sample_text,
       sample_audio_path, embedding_hash, metadata, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
       RETURNING *`,
      [
        id,
        userId,
        dashscopeVoiceId,  // DashScope voice_id，如 "cosyvoice-hum-xxxxx"
        fileId,
        'cosyvoice-v3-plus',
        text || null,
        sampleText || null,
        file.filePath,      // 使用原始音频作为样本
        vectorHash,
        JSON.stringify({ provider: 'dashscope', type: 'cosyvoice-v3-plus' }),
      ]
    );

    return this.mapRowToVoice(result.rows[0]);
  }

  /**
   * 获取角色详情
   */
  async getVoice(voiceId: string): Promise<Voice | null> {
    const result = await pool.query('SELECT * FROM voices WHERE id = $1', [voiceId]);
    if (result.rows.length === 0) {
      return null;
    }
    return this.mapRowToVoice(result.rows[0]);
  }

  /**
   * 列表查询
   */
  async listVoices(params: {
    page?: number;
    limit?: number;
    search?: string;
    userId?: string;
  }): Promise<{ voices: Voice[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM voices WHERE 1=1';
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (params.userId) {
      query += ` AND user_id = $${paramIndex}`;
      queryParams.push(params.userId);
      paramIndex++;
    }

    if (params.search) {
      query += ` AND (id::text LIKE $${paramIndex} OR step_voice_id LIKE $${paramIndex})`;
      queryParams.push(`%${params.search}%`);
      paramIndex++;
    }

    // 总数查询
    const countResult = await pool.query(
      query.replace('SELECT *', 'SELECT COUNT(*) as count')
    );
    const total = parseInt(countResult.rows[0].count);

    // 分页查询
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);
    const voices = result.rows.map((row) => this.mapRowToVoice(row));

    return { voices, total };
  }

  /**
   * 更新角色
   */
  async updateVoice(voiceId: string, data: Partial<Voice>): Promise<Voice | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.text !== undefined) {
      updates.push(`text = $${paramIndex}`);
      values.push(data.text);
      paramIndex++;
    }

    if (data.metadata !== undefined) {
      updates.push(`metadata = $${paramIndex}`);
      values.push(JSON.stringify(data.metadata));
      paramIndex++;
    }

    if (updates.length === 0) {
      return this.getVoice(voiceId);
    }

    updates.push(`updated_at = NOW()`);
    values.push(voiceId);

    const result = await pool.query(
      `UPDATE voices SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToVoice(result.rows[0]);
  }

  /**
   * 删除角色
   */
  async deleteVoice(voiceId: string): Promise<boolean> {
    const voice = await this.getVoice(voiceId);
    if (!voice) {
      return false;
    }

    // 删除sample音频文件
    if (voice.sampleAudioPath) {
      try {
        await fs.unlink(voice.sampleAudioPath);
      } catch (error) {
        console.error('Failed to delete sample audio:', error);
      }
    }

    await pool.query('DELETE FROM voices WHERE id = $1', [voiceId]);
    return true;
  }

  private mapRowToVoice(row: any): Voice {
    return {
      id: row.id,
      userId: row.user_id,
      stepVoiceId: row.step_voice_id,
      fileId: row.file_id,
      model: row.model,
      text: row.text,
      sampleText: row.sample_text,
      sampleAudioPath: row.sample_audio_path,
      embeddingHash: row.embedding_hash,
      metadata: row.metadata ? (typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata) : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default new VoiceService();



