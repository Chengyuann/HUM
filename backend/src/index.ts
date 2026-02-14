import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fileRoutes from './routes/files';
import voiceRoutes from './routes/voices';
import ttsRoutes from './routes/tts';
import embeddingRoutes from './routes/embeddings';

const app = express();
const PORT = process.env.PORT || 8000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务 - 提供TTS生成的音频文件
const ttsOutputDir = process.env.STORAGE_PATH
  ? path.join(process.env.STORAGE_PATH, 'tts_outputs')
  : path.join(__dirname, '../tts_outputs');
app.use('/api/files/tts', express.static(ttsOutputDir));

// 路由
app.use('/api/files', fileRoutes);
app.use('/api/voices', voiceRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/embeddings', embeddingRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

