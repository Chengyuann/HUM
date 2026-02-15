import express, { Request, Response } from 'express';
import voiceService from '../services/voiceServiceMemory';
import { sendSuccess, sendError } from '../utils/response';

const router = express.Router();

// 创建音色
router.post('/', async (req: Request, res: Response) => {
  try {
    const { fileId, text, sampleText, model, name } = req.body;

    if (!fileId || !model) {
      return sendError(res, 'fileId和model是必填项', 400);
    }

    const userId = (req as any).userId || 'default-user';
    const voice = await voiceService.createVoice(userId, fileId, model, name, text, sampleText);

    // 读取sample音频（如果存在）
    let sampleAudio: string | undefined;
    if (voice.sampleAudioPath) {
      const fs = require('fs');
      const audioBuffer = fs.readFileSync(voice.sampleAudioPath);
      sampleAudio = audioBuffer.toString('base64');
    }

    sendSuccess(res, {
      voiceId: voice.id,
      stepVoiceId: voice.stepVoiceId,
      sampleAudio,
      embeddingHash: voice.embeddingHash,
    });
  } catch (error: any) {
    console.error('Create voice error:', error);
    sendError(res, error.message || '创建音色失败', 500, error);
  }
});

// 获取角色详情
router.get('/:voiceId', async (req: Request, res: Response) => {
  try {
    const voiceId = Array.isArray(req.params.voiceId) ? req.params.voiceId[0] : req.params.voiceId;
    const voice = await voiceService.getVoice(voiceId);
    if (!voice) {
      return sendError(res, '角色不存在', 404);
    }
    sendSuccess(res, voice);
  } catch (error: any) {
    sendError(res, error.message || '获取角色失败', 500, error);
  }
});

// 列表查询
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;

    const result = await voiceService.listVoices({ page, limit, search });
    sendSuccess(res, result);
  } catch (error: any) {
    sendError(res, error.message || '查询失败', 500, error);
  }
});

// 更新角色
router.put('/:voiceId', async (req: Request, res: Response) => {
  try {
    const voiceId = Array.isArray(req.params.voiceId) ? req.params.voiceId[0] : req.params.voiceId;
    const voice = await voiceService.updateVoice(voiceId, req.body);
    if (!voice) {
      return sendError(res, '角色不存在', 404);
    }
    sendSuccess(res, voice);
  } catch (error: any) {
    sendError(res, error.message || '更新失败', 500, error);
  }
});

// 删除角色
router.delete('/:voiceId', async (req: Request, res: Response) => {
  try {
    const voiceId = Array.isArray(req.params.voiceId) ? req.params.voiceId[0] : req.params.voiceId;
    const success = await voiceService.deleteVoice(voiceId);
    if (!success) {
      return sendError(res, '角色不存在', 404);
    }
    sendSuccess(res, { deleted: true });
  } catch (error: any) {
    sendError(res, error.message || '删除失败', 500, error);
  }
});

export default router;

