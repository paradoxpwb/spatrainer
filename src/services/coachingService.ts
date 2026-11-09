import { AICoachingResult, CoachingApiResponse, CoachingErrorCode, CoachingRequest } from '../types/coaching';
import { coachingCache } from '../utils/coachingCache';
import { generateCoachingCacheKey } from '../utils/transcriptHash';

export class CoachingServiceError extends Error {
  code: CoachingErrorCode;
  constructor(code: CoachingErrorCode, message: string) {
    super(message);
    this.name = 'CoachingServiceError';
    this.code = code;
  }
}

export interface RequestCoachingOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
  skipCache?: boolean;
}

/**
 * Request structured AI coaching for a speaking answer transcript.
 */
export async function requestCoaching(
  requestData: CoachingRequest,
  options?: RequestCoachingOptions
): Promise<{ result: AICoachingResult; isCached: boolean; cacheKey: string }> {
  const cacheKey = generateCoachingCacheKey({
    questionId: requestData.questionId,
    transcript: requestData.transcript,
    feedbackLanguage: requestData.feedbackLanguage,
    desiredAnswerLevel: requestData.desiredAnswerLevel,
  });

  // Check client-side cache first unless skipCache is set
  if (!options?.skipCache) {
    const cached = coachingCache.get(cacheKey);
    if (cached) {
      return { result: cached, isCached: true, cacheKey };
    }
  }

  const timeoutMs = options?.timeoutMs || 45000;
  const controller = new AbortController();

  if (options?.signal) {
    options.signal.addEventListener('abort', () => controller.abort());
  }

  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch('/api/coach', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
      signal: controller.signal,
    });

    clearTimeout(timer);

    let json: CoachingApiResponse;
    try {
      json = await response.json();
    } catch {
      throw new CoachingServiceError(
        'INVALID_AI_RESPONSE',
        '서버 응답을 처리하는 도중 오류가 발생했습니다. 다시 시도해 주세요.'
      );
    }

    if (!response.ok || !json.success || !json.data) {
      const code = json.error?.code || 'COACHING_FAILED';
      const message = json.error?.message || 'AI 코칭 결과를 생성하지 못했습니다. 다시 시도해 주세요.';
      throw new CoachingServiceError(code, message);
    }

    const coaching = json.data.coaching;

    // Save in cache
    coachingCache.set(cacheKey, coaching);

    return { result: coaching, isCached: false, cacheKey };
  } catch (err: any) {
    clearTimeout(timer);

    if (err instanceof CoachingServiceError) {
      throw err;
    }

    if (err.name === 'AbortError') {
      if (options?.signal?.aborted) {
        throw new CoachingServiceError('INVALID_REQUEST', '코칭 요청이 취소되었습니다.');
      }
      throw new CoachingServiceError(
        'COACHING_TIMEOUT',
        'AI 코칭 생성 시간이 초과되었습니다. 다시 시도해 주세요.'
      );
    }

    throw new CoachingServiceError(
      'COACHING_FAILED',
      '네트워크 연결을 확인한 후 다시 시도해 주세요.'
    );
  }
}
