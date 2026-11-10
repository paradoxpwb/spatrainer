import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AICoachingResult,
  CoachingErrorCode,
  CoachingRequest,
  CoachingStatus,
  DesiredAnswerLevel,
  FeedbackLanguage,
} from '../types/coaching';
import { CoachingServiceError, requestCoaching } from '../services/coachingService';
import { normalizeTranscriptForComparison } from '../utils/transcriptHash';

const FEEDBACK_LANG_STORAGE_KEY = 'spa_coaching_feedback_lang';
const DESIRED_LEVEL_STORAGE_KEY = 'spa_coaching_desired_level';

export interface UseAICoachingReturn {
  status: CoachingStatus;
  isLoading: boolean;
  result: AICoachingResult | null;
  error: { code: CoachingErrorCode; message: string } | null;
  isCached: boolean;
  isStale: boolean;
  feedbackLanguage: FeedbackLanguage;
  desiredAnswerLevel: DesiredAnswerLevel;
  setFeedbackLanguage: (lang: FeedbackLanguage) => void;
  setDesiredAnswerLevel: (level: DesiredAnswerLevel) => void;
  fetchCoaching: (params: {
    questionId: string;
    question: string;
    category: string;
    difficulty: 'basic' | 'intermediate';
    transcript: string;
    recordingDurationSeconds: number;
    answerTimeLimitSeconds: number;
    metrics: CoachingRequest['metrics'];
  }) => Promise<AICoachingResult | null>;
  notifyTranscriptChanged: (newTranscript: string) => void;
  reset: () => void;
  clearError: () => void;
  setExistingCoaching: (existing: AICoachingResult, originalTranscript: string) => void;
}

export function useAICoaching(): UseAICoachingReturn {
  const [status, setStatus] = useState<CoachingStatus>('idle');
  const [result, setResult] = useState<AICoachingResult | null>(null);
  const [error, setError] = useState<{ code: CoachingErrorCode; message: string } | null>(null);
  const [isCached, setIsCached] = useState<boolean>(false);
  const [isStale, setIsStale] = useState<boolean>(false);
  const [analyzedTranscript, setAnalyzedTranscript] = useState<string>('');

  // Persisted preferences
  const [feedbackLanguage, setFeedbackLanguageState] = useState<FeedbackLanguage>(() => {
    try {
      const saved = localStorage.getItem(FEEDBACK_LANG_STORAGE_KEY);
      return saved === 'en' || saved === 'ko' ? saved : 'ko';
    } catch {
      return 'ko';
    }
  });

  const [desiredAnswerLevel, setDesiredAnswerLevelState] = useState<DesiredAnswerLevel>(() => {
    try {
      const saved = localStorage.getItem(DESIRED_LEVEL_STORAGE_KEY);
      return saved === 'current' || saved === 'one-step-better' || saved === 'challenging'
        ? saved
        : 'one-step-better';
    } catch {
      return 'one-step-better';
    }
  });

  const setFeedbackLanguage = useCallback((lang: FeedbackLanguage) => {
    setFeedbackLanguageState(lang);
    try {
      localStorage.setItem(FEEDBACK_LANG_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }, []);

  const setDesiredAnswerLevel = useCallback((level: DesiredAnswerLevel) => {
    setDesiredAnswerLevelState(level);
    try {
      localStorage.setItem(DESIRED_LEVEL_STORAGE_KEY, level);
    } catch {
      // ignore
    }
  }, []);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isRequestingRef = useRef<boolean>(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    isRequestingRef.current = false;
    setStatus('idle');
    setResult(null);
    setError(null);
    setIsCached(false);
    setIsStale(false);
    setAnalyzedTranscript('');
  }, []);

  const setExistingCoaching = useCallback(
    (existing: AICoachingResult, originalTranscript: string) => {
      setResult(existing);
      setAnalyzedTranscript(originalTranscript);
      setStatus('completed');
      setIsCached(true);
      setIsStale(false);
      setError(null);
    },
    []
  );

  const notifyTranscriptChanged = useCallback(
    (newTranscript: string) => {
      if (!analyzedTranscript) return;
      const normalizedCurrent = normalizeTranscriptForComparison(analyzedTranscript);
      const normalizedNew = normalizeTranscriptForComparison(newTranscript);
      if (normalizedCurrent !== normalizedNew) {
        setIsStale(true);
      } else {
        setIsStale(false);
      }
    },
    [analyzedTranscript]
  );

  const fetchCoaching = useCallback(
    async (params: {
      questionId: string;
      question: string;
      category: string;
      difficulty: 'basic' | 'intermediate';
      transcript: string;
      recordingDurationSeconds: number;
      answerTimeLimitSeconds: number;
      metrics: CoachingRequest['metrics'];
    }): Promise<AICoachingResult | null> => {
      // Prevent duplicate concurrent requests
      if (isRequestingRef.current) {
        return null;
      }

      // Check empty
      const rawText = params.transcript ? params.transcript.trim() : '';
      if (!rawText) {
        setError({
          code: 'TRANSCRIPT_TOO_SHORT',
          message: 'AI 코칭을 받기 전에 Transcript를 확인하거나 직접 입력해 주세요.',
        });
        setStatus('failed');
        return null;
      }

      // Check minimum 10 words
      const words = rawText.split(/\s+/).filter(Boolean);
      if (words.length < 10) {
        setError({
          code: 'TRANSCRIPT_TOO_SHORT',
          message:
            'AI 코칭을 받기에는 답변이 너무 짧습니다. 이유나 예시를 추가하여 10단어 이상 답변해 주세요.',
        });
        setStatus('failed');
        return null;
      }

      try {
        isRequestingRef.current = true;
        setError(null);
        setStatus('requesting');

        console.log('[SPA DEBUG] coaching requested');
        console.log('[SPA DEBUG] transcript available: YES');

        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        const requestPayload: CoachingRequest = {
          questionId: params.questionId,
          question: params.question,
          category: params.category,
          difficulty: params.difficulty,
          transcript: rawText,
          recordingDurationSeconds: Math.max(1, params.recordingDurationSeconds),
          metrics: params.metrics,
          feedbackLanguage,
          desiredAnswerLevel,
          answerTimeLimitSeconds: params.answerTimeLimitSeconds,
        };

        const response = await requestCoaching(requestPayload, {
          signal: controller.signal,
          timeoutMs: 45000,
        });

        console.log('[SPA DEBUG] coaching response validated: YES');
        setResult(response.result);
        setIsCached(response.isCached);
        setIsStale(false);
        setAnalyzedTranscript(rawText);
        setStatus('completed');
        isRequestingRef.current = false;
        abortControllerRef.current = null;

        return response.result;
      } catch (err: any) {
        isRequestingRef.current = false;
        abortControllerRef.current = null;

        if (err.name === 'AbortError' || err.code === 'INVALID_REQUEST') {
          return null;
        }

        console.log('[SPA DEBUG] coaching response validated: NO');
        const errorCode: CoachingErrorCode =
          err instanceof CoachingServiceError ? err.code : 'COACHING_FAILED';
        let errorMessage =
          err.message || '답변 내용은 저장되었지만 AI 분석을 완료하지 못했습니다.';

        if (errorCode === 'CONFIGURATION_ERROR') {
          errorMessage = '현재 AI 분석 서버 설정이 완료되지 않아 AI 코칭을 사용할 수 없습니다.';
        }

        setError({ code: errorCode, message: errorMessage });
        setStatus('failed');
        return null;
      }
    },
    [feedbackLanguage, desiredAnswerLevel]
  );

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const isLoading = status === 'requesting' || status === 'validating';

  return {
    status,
    isLoading,
    result,
    error,
    isCached,
    isStale,
    feedbackLanguage,
    desiredAnswerLevel,
    setFeedbackLanguage,
    setDesiredAnswerLevel,
    fetchCoaching,
    notifyTranscriptChanged,
    reset,
    clearError,
    setExistingCoaching,
  };
}
