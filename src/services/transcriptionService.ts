import { TranscriptionApiResponse, TranscriptionErrorCode, TranscriptionResult } from '../types/transcription';

export interface TranscribeAudioOptions {
  language?: string;
  signal?: AbortSignal;
  timeoutMs?: number;
}

export class TranscriptionServiceError extends Error {
  code: TranscriptionErrorCode;
  constructor(code: TranscriptionErrorCode, message: string) {
    super(message);
    this.name = 'TranscriptionServiceError';
    this.code = code;
  }
}

/**
 * Service to call the server-side /api/transcribe endpoint
 */
export async function transcribeAudioBlob(
  audioBlob: Blob,
  options?: TranscribeAudioOptions
): Promise<TranscriptionResult> {
  if (!audioBlob || audioBlob.size === 0) {
    throw new TranscriptionServiceError('EMPTY_AUDIO', '음성 파일이 비어 있습니다.');
  }

  const formData = new FormData();
  const mimeType = audioBlob.type || 'audio/webm';
  const extension = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'webm';
  formData.append('audio', audioBlob, `recording.${extension}`);
  formData.append('mimeType', mimeType);
  formData.append('language', options?.language || 'en');

  const timeoutMs = options?.timeoutMs || 30000;
  const controller = new AbortController();

  // Link caller signal if present
  if (options?.signal) {
    options.signal.addEventListener('abort', () => controller.abort());
  }

  const timeoutTimer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    console.log('[SPA DEBUG] transcription HTTP status:', response.status);

    clearTimeout(timeoutTimer);

    let json: TranscriptionApiResponse;
    try {
      json = await response.json();
    } catch {
      throw new TranscriptionServiceError(
        'TRANSCRIPTION_FAILED',
        '서버 응답을 처리하는 도중 오류가 발생했습니다. 다시 시도해 주세요.'
      );
    }

    if (!response.ok || !json.success || !json.data) {
      const code = json.error?.code || 'TRANSCRIPTION_FAILED';
      const message = json.error?.message || '음성을 텍스트로 변환하지 못했습니다. 다시 시도해 주세요.';
      throw new TranscriptionServiceError(code, message);
    }

    return json.data;
  } catch (err: any) {
    clearTimeout(timeoutTimer);

    if (err instanceof TranscriptionServiceError) {
      throw err;
    }

    if (err.name === 'AbortError') {
      if (options?.signal?.aborted) {
        throw new TranscriptionServiceError('INVALID_REQUEST', '전사 요청이 취소되었습니다.');
      }
      throw new TranscriptionServiceError(
        'TRANSCRIPTION_TIMEOUT',
        '전사 요청 시간이 초과되었습니다. 다시 시도해 주세요.'
      );
    }

    throw new TranscriptionServiceError(
      'TRANSCRIPTION_FAILED',
      '네트워크 연결을 확인한 후 다시 시도해 주세요.'
    );
  }
}
