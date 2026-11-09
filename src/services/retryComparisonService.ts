import { AIRetryComparison } from '../types/comparison';
import { FeedbackLanguage } from '../types/coaching';

interface RequestAIRetryComparisonParams {
  question: string;
  baseAttemptId: string;
  comparedAttemptId: string;
  baseTranscript: string;
  retryTranscript: string;
  baseMetrics: {
    duration: number;
    wpm: number;
    fillerRate: number;
    totalWords: number;
  };
  retryMetrics: {
    duration: number;
    wpm: number;
    fillerRate: number;
    totalWords: number;
  };
  originalPriorityImprovements: string[];
  originalRetryChecklist: string[];
  feedbackLanguage: FeedbackLanguage;
}

const aiComparisonCache = new Map<string, AIRetryComparison>();

export async function requestAIRetryComparison(
  params: RequestAIRetryComparisonParams,
  options?: { signal?: AbortSignal }
): Promise<AIRetryComparison> {
  const cacheKey = `${params.baseAttemptId}::${params.comparedAttemptId}::${params.feedbackLanguage}`;
  if (aiComparisonCache.has(cacheKey)) {
    return aiComparisonCache.get(cacheKey)!;
  }

  const response = await fetch('/api/compare-retry', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question: params.question,
      baseTranscript: params.baseTranscript,
      retryTranscript: params.retryTranscript,
      baseMetrics: params.baseMetrics,
      retryMetrics: params.retryMetrics,
      originalPriorityImprovements: params.originalPriorityImprovements,
      originalRetryChecklist: params.originalRetryChecklist,
      feedbackLanguage: params.feedbackLanguage,
    }),
    signal: options?.signal,
  });

  const body = await response.json();
  if (!response.ok || !body.success) {
    const errorMsg =
      body?.error?.message || 'AI 비교 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
    throw new Error(errorMsg);
  }

  const result: AIRetryComparison = body.data.comparison;
  aiComparisonCache.set(cacheKey, result);
  return result;
}
