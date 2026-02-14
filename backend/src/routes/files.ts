import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import fileService from '../services/fileServiceMemory';
import stepfunService from '../services/stepfunService';
import { sendSuccess, sendError } from '../utils/response';
import audioPreprocessor from '../services/audioPreprocessor';

const router = express.Router();

// 配置multer存储
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = process.env.STORAGE_PATH || path.join(__dirname, '../../uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('只支持 MP3 或 WAV 格式'));
    }
  },
});

// 上传文件
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return sendError(res, '未上传文件', 400);
    }

    // 音频预处理和校验
    const processedFile = await audioPreprocessor.process(req.file.path);

    // 获取音频时长（简化处理，实际应该使用音频库）
    const duration = await audioPreprocessor.getDuration(processedFile.path);

    // 校验时长
    if (duration < 1 || duration > 60) {
      await fs.unlink(processedFile.path);
      return sendError(res, '音频时长必须在1-60秒之间', 400);
    }

    // 保存文件信息（不上传到 StepFun，使用本地存储）
    const userId = (req as any).userId || 'default-user';
    const fileMetadata = await fileService.uploadFile(
      userId,
      req.file.originalname,
      processedFile.path,
      processedFile.size,
      duration,
      processedFile.format
    );

    sendSuccess(res, {
      fileId: fileMetadata.id,
      filename: fileMetadata.filename,
      fileSize: fileMetadata.fileSize,
      duration: fileMetadata.duration,
      format: fileMetadata.format,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    sendError(res, error.message || '上传失败', 500, error);
  }
});

// 获取文件信息
router.get('/:fileId', async (req: Request, res: Response) => {
  try {
    const fileId = Array.isArray(req.params.fileId) ? req.params.fileId[0] : req.params.fileId;
    const file = await fileService.getFile(fileId);
    if (!file) {
      return sendError(res, '文件不存在', 404);
    }
    sendSuccess(res, file);
  } catch (error: any) {
    sendError(res, error.message || '获取文件失败', 500, error);
  }
});

// 删除文件
router.delete('/:fileId', async (req: Request, res: Response) => {
  try {
    const fileId = Array.isArray(req.params.fileId) ? req.params.fileId[0] : req.params.fileId;
    const success = await fileService.deleteFile(fileId);
    if (!success) {
      return sendError(res, '文件不存在', 404);
    }
    sendSuccess(res, { deleted: true });
  } catch (error: any) {
    sendError(res, error.message || '删除失败', 500, error);
  }
});

export default router;

