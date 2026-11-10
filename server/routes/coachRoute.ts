import express, { type Request, type Response } from 'express';
import { coachingService } from '../ai/coachingService.ts';

const router = express.Router();

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_REQUEST: '유효하지 않은 코칭 요청입니다.',
  TRANSCRIPT_TOO_SHORT:
    'AI 코칭을 받기에는 답변이 너무 짧습니다. 이유나 예시를 추가하여 10단어 이상 답변해 주세요.',
  TRANSCRIPT_TOO_LONG: '답변이 너무 깁니다. 1,500단어 이내로 답변해 주세요.',
  RATE_LIMITED: '현재 AI 코칭 요청이 많습니다. 잠시 후 다시 시도해 주세요.',
  COACHING_TIMEOUT: 'AI 코칭 생성 시간이 초과되었습니다. 다시 시도해 주세요.',
  INVALID_AI_RESPONSE: 'AI 코칭 결과를 올바르게 처리하지 못했습니다. 다시 시도해 주세요.',
  COACHING_FAILED: 'AI 코칭 결과를 생성하지 못했습니다. 다시 시도해 주세요.',
  CONFIGURATION_ERROR:
    'AI 코칭 기능이 아직 설정되지 않았습니다. Transcript와 기본 말하기 지표는 계속 사용할 수 있습니다.',
  REQUEST_TOO_LARGE: '요청 크기가 너무 큽니다.',
};

router.post('/coach', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('[SPA DEBUG] /api/coach received request');
    const coachingResult = await coachingService.processCoachingRequest(req.body);
    console.log('[SPA DEBUG] /api/coach successfully generated coaching result');

    res.status(200).json({
      success: true,
      data: {
        coaching: coachingResult,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    const errorCode = err.code || 'COACHING_FAILED';
    const userMessage = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.COACHING_FAILED;

    const statusCode =
      errorCode === 'INVALID_REQUEST' ||
      errorCode === 'TRANSCRIPT_TOO_SHORT' ||
      errorCode === 'TRANSCRIPT_TOO_LONG'
        ? 400
        : errorCode === 'RATE_LIMITED'
        ? 429
        : errorCode === 'CONFIGURATION_ERROR'
        ? 503
        : errorCode === 'COACHING_TIMEOUT'
        ? 504
        : 500;

    res.status(statusCode).json({
      success: false,
      error: {
        code: errorCode,
        message: userMessage,
      },
    });
  }
});

export default router;
