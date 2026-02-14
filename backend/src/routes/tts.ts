import express, { Request, Response } from 'express';
import ttsService from '../services/ttsServiceMemory';
import { sendSuccess, sendError } from '../utils/response';
// @ts-ignore
import { paymentMiddleware } from 'x402-express';

const router = express.Router();

// X402 Paywall Configuration
const RECEIVER_ADDRESS = process.env.X402_RECEIVER || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
const NETWORK = process.env.X402_NETWORK || "base-sepolia";
const PRICE = process.env.X402_PRICE || "0.01";

// Apply X402 payment middleware
router.use(paymentMiddleware(
  RECEIVER_ADDRESS,
  {
    "/generate": {
      price: PRICE,        // Price in USDC/native token
      network: NETWORK,
      config: {
        description: "TTS Voice Generation (1 request)",
      }
    }
  }
));

// 生成TTS
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { voiceId, input, model } = req.body;

    if (!voiceId || !input || !model) {
      return sendError(res, 'voiceId、input和model是必填项', 400);
    }

    const userId = (req as any).userId || 'default-user';
    const result = await ttsService.generateTTS({
      userId,
      voiceId,
      input,
      model,
    });

    sendSuccess(res, {
      audioUrl: result.audioUrl,
      duration: result.duration,
    });
  } catch (error: any) {
    console.error('Generate TTS error:', error);
    sendError(res, error.message || '生成TTS失败', 500, error);
  }
});

export default router;

