import express, { type Request, type Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { SERVER_CONFIG } from '../config.ts';
import {
  AIRetryComparisonSchema,
  CompareRetryRequestSchema,
} from '../ai/compareSchema.ts';
import {
  buildCompareSystemPrompt,
  buildCompareUserPrompt,
} from '../prompts/comparePrompt.ts';

const router = express.Router();

router.post('/compare-retry', async (req: Request, res: Response) => {
  try {
    // 1. Validate request
    const parsed = CompareRetryRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: '유효하지 않은 비교 요청입니다. 필수 항목을 확인해 주세요.',
        },
      });
    }

    const payload = parsed.data;

    if (!SERVER_CONFIG.aiApiKey) {
      return res.status(503).json({
        success: false,
        error: {
          code: 'CONFIGURATION_ERROR',
          message: 'AI API 키가 설정되지 않았습니다.',
        },
      });
    }

    const ai = new GoogleGenAI({
      apiKey: SERVER_CONFIG.aiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemPrompt = buildCompareSystemPrompt(payload.feedbackLanguage);
    const userPrompt = buildCompareUserPrompt(payload);

    const callPromise = ai.models.generateContent({
      model: SERVER_CONFIG.aiModel,
      contents: [{ text: userPrompt }],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      const timer = setTimeout(() => {
        const timeoutErr = new Error('AI compare request timed out.');
        (timeoutErr as any).code = 'COACHING_TIMEOUT';
        reject(timeoutErr);
      }, 45000);
      if (typeof timer.unref === 'function') timer.unref();
    });

    const response = await Promise.race([callPromise, timeoutPromise]);
    let clean = (response.text || '').trim();
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
    }

    const parsedJson = JSON.parse(clean);
    const validated = AIRetryComparisonSchema.parse(parsedJson);

    return res.json({
      success: true,
      data: {
        comparison: validated,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('[CompareRoute Error]:', err);
    if (err.code === 'COACHING_TIMEOUT') {
      return res.status(504).json({
        success: false,
        error: {
          code: 'COACHING_TIMEOUT',
          message: 'AI 비교 분석 시간이 초과되었습니다. 다시 시도해 주세요.',
        },
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'COACHING_FAILED',
        message: 'AI 비교 분석 결과를 생성하지 못했습니다.',
      },
    });
  }
});

export default router;
