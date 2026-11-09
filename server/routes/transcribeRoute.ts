import express, { type Request, type Response } from 'express';
import multer from 'multer';
import { SERVER_CONFIG } from '../config.ts';
import { getTranscriptionAdapter } from '../adapters/index.ts';

const router = express.Router();

// Store uploaded files in memory only (never written to disk or permanent storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: SERVER_CONFIG.maxAudioSizeBytes,
    files: 1,
  },
});

const ERROR_MESSAGES: Record<string, string> = {
  AUDIO_REQUIRED: '전송된 음성 파일이 없습니다.',
  EMPTY_AUDIO: '음성 파일이 비어 있습니다.',
  UNSUPPORTED_AUDIO_TYPE: '지원하지 않는 오디오 형식입니다.',
  AUDIO_TOO_LARGE: '오디오 파일 크기가 10MB를 초과했습니다.',
  INVALID_REQUEST: '유효하지 않은 요청입니다.',
  TRANSCRIPTION_TIMEOUT: '전사 요청 시간이 초과되었습니다. 다시 시도해 주세요.',
  TRANSCRIPTION_FAILED: '음성을 텍스트로 변환하지 못했습니다. 다시 시도해 주세요.',
  RATE_LIMITED: '현재 음성 분석 요청이 많습니다. 잠시 후 다시 시도하거나 Transcript를 직접 입력해 주세요.',
  CONFIGURATION_ERROR: '음성 분석 기능이 아직 설정되지 않았습니다. Transcript를 직접 입력하여 기본 지표를 확인할 수 있습니다.',
};

router.post('/transcribe', (req: Request, res: Response): void => {
  upload.single('audio')(req, res, async (err: any) => {
    // 1. Handle Multer Upload Errors
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({
          success: false,
          error: {
            code: 'AUDIO_TOO_LARGE',
            message: ERROR_MESSAGES.AUDIO_TOO_LARGE,
          },
        });
        return;
      }
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: ERROR_MESSAGES.INVALID_REQUEST,
        },
      });
      return;
    }

    const file = req.file;

    // 2. Validate file presence
    if (!file || !file.buffer) {
      res.status(400).json({
        success: false,
        error: {
          code: 'AUDIO_REQUIRED',
          message: ERROR_MESSAGES.AUDIO_REQUIRED,
        },
      });
      return;
    }

    // 3. Validate non-empty file
    if (file.buffer.length === 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_AUDIO',
          message: ERROR_MESSAGES.EMPTY_AUDIO,
        },
      });
      return;
    }

    // 4. Validate MIME type
    const rawMime = (req.body.mimeType || file.mimetype || 'audio/webm').toLowerCase();
    const baseMime = rawMime.split(';')[0].trim();

    const isAllowed = SERVER_CONFIG.allowedMimeBases.some(
      (allowed) => baseMime === allowed || baseMime.startsWith('audio/')
    );

    if (!isAllowed) {
      res.status(415).json({
        success: false,
        error: {
          code: 'UNSUPPORTED_AUDIO_TYPE',
          message: ERROR_MESSAGES.UNSUPPORTED_AUDIO_TYPE,
        },
      });
      return;
    }

    // 5. Call Transcription Adapter
    try {
      const adapter = getTranscriptionAdapter();
      const language = req.body.language || 'en';

      const transcript = await adapter.transcribe(file.buffer, rawMime, {
        language,
        timeoutMs: SERVER_CONFIG.timeoutMs,
      });

      res.status(200).json({
        success: true,
        data: {
          transcript,
          language,
          provider: adapter.name,
          model: adapter.model,
          createdAt: new Date().toISOString(),
        },
      });
    } catch (adapterErr: any) {
      const errorCode = adapterErr.code || 'TRANSCRIPTION_FAILED';
      const statusCode =
        errorCode === 'RATE_LIMITED'
          ? 429
          : errorCode === 'CONFIGURATION_ERROR'
          ? 503
          : errorCode === 'TRANSCRIPTION_TIMEOUT'
          ? 504
          : 500;

      const userMessage = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.TRANSCRIPTION_FAILED;

      // Note: Never leak raw API keys, stack traces, or internal error objects to client
      res.status(statusCode).json({
        success: false,
        error: {
          code: errorCode,
          message: userMessage,
        },
      });
    }
  });
});

export default router;
