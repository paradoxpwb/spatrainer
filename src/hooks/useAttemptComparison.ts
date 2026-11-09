import { useCallback, useMemo, useState } from 'react';
import { PracticeAttempt } from '../types/practiceAttempt';
import { AIRetryComparison, AttemptComparison } from '../types/comparison';
import { createAttemptComparison } from '../utils/attemptComparison';
import { requestAIRetryComparison } from '../services/retryComparisonService';
import { FeedbackLanguage } from '../types/coaching';

export interface UseAttemptComparisonReturn {
  comparison: AttemptComparison | null;
  baseAttempt: PracticeAttempt | null;
  comparedAttempt: PracticeAttempt | null;
  setBaseAttemptId: (id: string) => void;
  setComparedAttemptId: (id: string) => void;
  isAiLoading: boolean;
  aiError: string | null;
  aiComparison: AIRetryComparison | null;
  requestAiAnalysis: (feedbackLanguage: FeedbackLanguage) => Promise<void>;
  clearAiError: () => void;
}

export function useAttemptComparison(
  attempts: PracticeAttempt[],
  initialBaseId?: string,
  initialComparedId?: string
): UseAttemptComparisonReturn {
  // Find default base (Attempt 1) and compared (Latest Attempt)
  const defaultBaseId = useMemo(() => {
    if (initialBaseId) return initialBaseId;
    if (attempts.length === 0) return '';
    const sorted = [...attempts].sort(
      (a, b) => (a.attemptNumber || 1) - (b.attemptNumber || 1)
    );
    return sorted[0].id;
  }, [attempts, initialBaseId]);

  const defaultComparedId = useMemo(() => {
    if (initialComparedId) return initialComparedId;
    if (attempts.length <= 1) return defaultBaseId;
    const sorted = [...attempts].sort(
      (a, b) => (a.attemptNumber || 1) - (b.attemptNumber || 1)
    );
    return sorted[sorted.length - 1].id;
  }, [attempts, initialComparedId, defaultBaseId]);

  const [baseAttemptId, setBaseAttemptId] = useState<string>(defaultBaseId);
  const [comparedAttemptId, setComparedAttemptId] = useState<string>(defaultComparedId);

  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiComparison, setAiComparison] = useState<AIRetryComparison | null>(null);

  const baseAttempt = useMemo(
    () => attempts.find((a) => a.id === baseAttemptId) || null,
    [attempts, baseAttemptId]
  );

  const comparedAttempt = useMemo(
    () => attempts.find((a) => a.id === comparedAttemptId) || null,
    [attempts, comparedAttemptId]
  );

  // Local metric and transcript comparison
  const comparison = useMemo(() => {
    if (!baseAttempt || !comparedAttempt || baseAttempt.id === comparedAttempt.id) {
      return null;
    }
    const comp = createAttemptComparison(baseAttempt, comparedAttempt);
    if (aiComparison) {
      comp.aiComparison = aiComparison;
    }
    return comp;
  }, [baseAttempt, comparedAttempt, aiComparison]);

  const clearAiError = useCallback(() => {
    setAiError(null);
  }, []);

  const requestAiAnalysis = useCallback(
    async (feedbackLanguage: FeedbackLanguage) => {
      if (!baseAttempt || !comparedAttempt) return;

      try {
        setIsAiLoading(true);
        setAiError(null);

        const result = await requestAIRetryComparison({
          question: comparedAttempt.question,
          baseAttemptId: baseAttempt.id,
          comparedAttemptId: comparedAttempt.id,
          baseTranscript: baseAttempt.editedTranscript || baseAttempt.originalTranscript,
          retryTranscript: comparedAttempt.editedTranscript || comparedAttempt.originalTranscript,
          baseMetrics: {
            duration: baseAttempt.recordingDurationSeconds,
            wpm: baseAttempt.metrics?.wordsPerMinute || 0,
            fillerRate: baseAttempt.metrics?.fillerRatePer100Words || 0,
            totalWords: baseAttempt.metrics?.totalWords || 0,
          },
          retryMetrics: {
            duration: comparedAttempt.recordingDurationSeconds,
            wpm: comparedAttempt.metrics?.wordsPerMinute || 0,
            fillerRate: comparedAttempt.metrics?.fillerRatePer100Words || 0,
            totalWords: comparedAttempt.metrics?.totalWords || 0,
          },
          originalPriorityImprovements:
            baseAttempt.aiCoaching?.result?.priorityImprovements?.map((p) => p.title) || [],
          originalRetryChecklist:
            baseAttempt.aiCoaching?.result?.retryChecklist?.map((c) => c.instruction) || [],
          feedbackLanguage,
        });

        setAiComparison(result);
      } catch (err: any) {
        setAiError(err.message || 'AI 비교 분석 요청에 실패했습니다.');
      } finally {
        setIsAiLoading(false);
      }
    },
    [baseAttempt, comparedAttempt]
  );

  return {
    comparison,
    baseAttempt,
    comparedAttempt,
    setBaseAttemptId,
    setComparedAttemptId,
    isAiLoading,
    aiError,
    aiComparison,
    requestAiAnalysis,
    clearAiError,
  };
}
