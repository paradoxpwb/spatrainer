import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SpeakingQuestion, PracticeSettings } from '../types/question';
import { RecordingResultData } from '../types/recording';
import { SpeakingMetrics } from '../types/metrics';
import { PracticeAttempt } from '../types/practiceAttempt';
import { RetryContext, RetryMode } from '../types/coaching';
import { QuestionCard } from '../components/QuestionCard';
import { AudioPlayer } from '../components/AudioPlayer';
import { PrivacyNotice } from '../components/PrivacyNotice';
import { AnalysisLoading } from '../components/AnalysisLoading';
import { TranscriptEditor } from '../components/TranscriptEditor';
import { MetricsSummary } from '../components/MetricsSummary';
import { FillerAnalysis } from '../components/FillerAnalysis';
import { RepetitionAnalysis } from '../components/RepetitionAnalysis';
import { ErrorMessage } from '../components/ErrorMessage';
import { AICoachingPanel } from '../components/coaching/AICoachingPanel';
import { useTranscription } from '../hooks/useTranscription';
import { useAICoaching } from '../hooks/useAICoaching';
import { calculateSpeakingMetrics } from '../utils/speakingMetrics';
import { generateCoachingCacheKey } from '../utils/transcriptHash';
import { formatTime } from '../utils/timeUtils';
import { getDisplayPrompt, getTopicLabel } from '../utils/questionUtils';
import { Sparkles, RotateCcw, ArrowRight, Home, Edit3, HelpCircle, CheckCircle2, GitCompare, TrendingUp } from 'lucide-react';

interface ResultPageProps {
  question: SpeakingQuestion;
  settings: PracticeSettings;
  resultData: RecordingResultData;
  sessionId?: string;
  attemptNumber?: number;
  parentAttemptId?: string | null;
  retrySource?: 'direct' | 'coaching_mode_a' | 'coaching_mode_b' | 'history' | 'feedback' | null;
  retryContext?: RetryContext;
  hasComparisonAvailable?: boolean;
  onOpenComparison?: () => void;
  onRetrySameQuestion: () => void;
  onRetryWithCoaching?: (context: RetryContext) => void;
  onNextQuestion: () => void;
  onFinishPractice: () => void;
  onSaveAttempt?: (attempt: PracticeAttempt) => void;
}

export const ResultPage: React.FC<ResultPageProps> = ({
  question,
  settings,
  resultData,
  sessionId,
  attemptNumber = 1,
  parentAttemptId,
  retrySource,
  retryContext,
  hasComparisonAvailable,
  onOpenComparison,
  onRetrySameQuestion,
  onRetryWithCoaching,
  onNextQuestion,
  onFinishPractice,
  onSaveAttempt,
}) => {
  const attemptIdRef = useRef<string>(`attempt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`);

  const {
    status: transcriptionStatus,
    isLoading: isTranscribing,
    error: transcriptionError,
    transcribe,
    setManualTranscript,
    reset: resetTranscription,
    clearError,
  } = useTranscription();

  const coaching = useAICoaching();

  const [originalTranscript, setOriginalTranscript] = useState<string>('');
  const [editedTranscript, setEditedTranscript] = useState<string>('');
  const [speakingMetrics, setSpeakingMetrics] = useState<SpeakingMetrics | null>(null);
  const [isManualInputMode, setIsManualInputMode] = useState<boolean>(false);
  const [manualInputDraft, setManualInputDraft] = useState<string>('');

  const actualDurationFormatted = formatTime(resultData.actualDuration);
  const targetDurationFormatted = formatTime(resultData.configuredDuration);

  const questionPrompt = getDisplayPrompt(question);
  const questionCategory = question.category || question.topic || 'general';
  const questionCategoryLabel = question.categoryLabel || getTopicLabel(question.topic);

  // Trigger server-side transcription
  const handleStartAnalysis = useCallback(async () => {
    if (!resultData.audioBlob || isTranscribing) return;

    const transcriptText = await transcribe(resultData.audioBlob, resultData.actualDuration);

    if (transcriptText !== null) {
      setOriginalTranscript(transcriptText);
      setEditedTranscript(transcriptText);

      const metrics = calculateSpeakingMetrics(transcriptText, resultData.actualDuration);
      setSpeakingMetrics(metrics);

      // Save initial attempt to history
      if (onSaveAttempt) {
        onSaveAttempt({
          id: attemptIdRef.current,
          sessionId,
          attemptNumber,
          parentAttemptId: parentAttemptId || undefined,
          retrySource: retrySource || undefined,
          retryContext: retryContext || undefined,
          questionId: question.id,
          category: questionCategory,
          categoryLabel: questionCategoryLabel,
          question: questionPrompt,
          practiceArea: question.practiceArea,
          topic: question.topic,
          practiceMode: question.practiceMode,
          recordedAt: new Date().toISOString(),
          recordingDurationSeconds: resultData.actualDuration,
          originalTranscript: transcriptText,
          editedTranscript: transcriptText,
          metrics,
          transcriptionStatus: 'completed',
        });
      }
    }
  }, [resultData, isTranscribing, transcribe, question.id, question.practiceArea, question.topic, question.practiceMode, questionCategory, questionCategoryLabel, questionPrompt, onSaveAttempt, sessionId, attemptNumber, parentAttemptId, retrySource, retryContext]);

  // Handle user updating the transcript
  const handleUpdateTranscript = (newText: string) => {
    setEditedTranscript(newText);
    coaching.notifyTranscriptChanged(newText);
    const updatedMetrics = calculateSpeakingMetrics(newText, resultData.actualDuration);
    setSpeakingMetrics(updatedMetrics);

    // Save updated attempt to history
    if (onSaveAttempt) {
      onSaveAttempt({
        id: attemptIdRef.current,
        sessionId,
        attemptNumber,
        parentAttemptId: parentAttemptId || undefined,
        retrySource: retrySource || undefined,
        retryContext: retryContext || undefined,
        questionId: question.id,
        category: questionCategory,
        categoryLabel: questionCategoryLabel,
        question: questionPrompt,
        practiceArea: question.practiceArea,
        topic: question.topic,
        practiceMode: question.practiceMode,
        recordedAt: new Date().toISOString(),
        recordingDurationSeconds: resultData.actualDuration,
        originalTranscript,
        editedTranscript: newText,
        metrics: updatedMetrics,
        transcriptionStatus: isManualInputMode ? 'manual' : 'completed',
      });
    }
  };

  // Submit manual transcript entry
  const handleSubmitManualInput = () => {
    const trimmed = manualInputDraft.trim();
    if (!trimmed) return;

    setOriginalTranscript(trimmed);
    setEditedTranscript(trimmed);
    setManualTranscript(trimmed);
    setIsManualInputMode(false);
    coaching.notifyTranscriptChanged(trimmed);

    const metrics = calculateSpeakingMetrics(trimmed, resultData.actualDuration);
    setSpeakingMetrics(metrics);

    if (onSaveAttempt) {
      onSaveAttempt({
        id: attemptIdRef.current,
        sessionId,
        attemptNumber,
        parentAttemptId: parentAttemptId || undefined,
        retrySource: retrySource || undefined,
        retryContext: retryContext || undefined,
        questionId: question.id,
        category: questionCategory,
        categoryLabel: questionCategoryLabel,
        question: questionPrompt,
        practiceArea: question.practiceArea,
        topic: question.topic,
        practiceMode: question.practiceMode,
        recordedAt: new Date().toISOString(),
        recordingDurationSeconds: resultData.actualDuration,
        originalTranscript: trimmed,
        editedTranscript: trimmed,
        metrics,
        transcriptionStatus: 'manual',
      });
    }
  };

  // Trigger AI Coaching on user explicit demand
  const handleRequestAICoaching = async () => {
    const activeText = editedTranscript || originalTranscript;
    if (!activeText || !speakingMetrics) return;

    const coachingResult = await coaching.fetchCoaching({
      questionId: question.id,
      question: questionPrompt,
      category: questionCategoryLabel,
      difficulty: question.difficulty,
      transcript: activeText,
      recordingDurationSeconds: resultData.actualDuration,
      answerTimeLimitSeconds: settings.answerDuration,
      metrics: {
        totalWords: speakingMetrics.totalWords,
        wordsPerMinute: speakingMetrics.wordsPerMinute,
        totalFillerCount: speakingMetrics.totalFillerCount,
        repeatedWords: speakingMetrics.repeatedWords,
        repeatedPhrases: speakingMetrics.repeatedPhrases,
      },
    });

    if (coachingResult && onSaveAttempt) {
      onSaveAttempt({
        id: attemptIdRef.current,
        sessionId,
        attemptNumber,
        parentAttemptId: parentAttemptId || undefined,
        retrySource: retrySource || undefined,
        retryContext: retryContext || undefined,
        questionId: question.id,
        category: questionCategory,
        categoryLabel: questionCategoryLabel,
        question: questionPrompt,
        practiceArea: question.practiceArea,
        topic: question.topic,
        practiceMode: question.practiceMode,
        recordedAt: new Date().toISOString(),
        recordingDurationSeconds: resultData.actualDuration,
        originalTranscript,
        editedTranscript: activeText,
        metrics: speakingMetrics,
        transcriptionStatus: isManualInputMode ? 'manual' : 'completed',
        aiCoaching: {
          status: 'completed',
          promptVersion: coachingResult.version,
          transcriptHash: generateCoachingCacheKey({
            questionId: question.id,
            transcript: activeText,
            feedbackLanguage: coaching.feedbackLanguage,
            desiredAnswerLevel: coaching.desiredAnswerLevel,
            promptVersion: coachingResult.version,
          }),
          feedbackLanguage: coaching.feedbackLanguage,
          desiredAnswerLevel: coaching.desiredAnswerLevel,
          generatedAt: new Date().toISOString(),
          result: coachingResult,
        },
      });
    }
  };

  // Start retry practice based on selected Mode A or B
  const handleStartRetryPractice = (mode: RetryMode) => {
    if (!coaching.result) {
      onRetrySameQuestion();
      return;
    }
    const context: RetryContext = {
      mode,
      outline: coaching.result.answerOutline,
      checklist: coaching.result.retryChecklist,
      improvedAnswer: coaching.result.improvedAnswer,
      usefulExpressions: coaching.result.usefulExpressions,
    };
    if (onRetryWithCoaching) {
      onRetryWithCoaching(context);
    } else {
      onRetrySameQuestion();
    }
  };

  const handleOpenManualInput = () => {
    clearError();
    setIsManualInputMode(true);
  };

  const hasAnalysis = Boolean(speakingMetrics && (originalTranscript || editedTranscript));

  return (
    <div className="py-8 sm:py-12 max-w-3xl mx-auto px-4 sm:px-6">
      {/* 1. Completion Header */}
      <div className="mb-6 p-5 sm:p-6 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 text-slate-900 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-emerald-950">
              답변 녹음이 완료되었습니다.
            </h1>
            <p className="text-xs sm:text-sm text-emerald-800 mt-0.5">
              녹음된 음성을 들어보고, "답변 분석하기"를 눌러 텍스트 변환 및 객관적 지표를 확인하세요.
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Banner if multiple attempts or retry */}
      {hasComparisonAvailable && onOpenComparison && (
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <GitCompare className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
                이전 답변과 변화 비교 가능 {attemptNumber ? `(시도 #${attemptNumber})` : ''}
              </div>
              <p className="text-xs text-indigo-800 dark:text-indigo-300">
                발화량, 속도(WPM), 어휘 다양성, 채움말 변화와 추가된 핵심 문장을 직접 비교해보세요.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenComparison}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all flex-shrink-0"
          >
            <TrendingUp className="w-4 h-4" />
            <span>첫 답변과 변화 비교하기</span>
          </button>
        </div>
      )}

      {/* 2. Recording Duration Info */}
      <div className="mb-6 grid grid-cols-2 gap-4 bg-white border border-slate-200 rounded-xl p-4 text-center shadow-xs">
        <div>
          <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            실제 답변 시간
          </span>
          <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
            {actualDurationFormatted}
          </span>
          <span className="block text-[11px] text-slate-400 mt-0.5">
            ({resultData.actualDuration}초 발화)
          </span>
        </div>

        <div className="border-l border-slate-200">
          <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            설정 제한시간
          </span>
          <span className="font-mono text-2xl font-bold text-slate-600 tabular-nums">
            {targetDurationFormatted}
          </span>
          <span className="block text-[11px] text-slate-400 mt-0.5">
            ({resultData.configuredDuration}초 기준)
          </span>
        </div>
      </div>

      {/* 3. HTML Audio Player */}
      {resultData.audioUrl && (
        <div className="mb-6">
          <AudioPlayer src={resultData.audioUrl} />
        </div>
      )}

      {/* 4. Question Recap Card */}
      <div className="mb-8">
        <QuestionCard question={question} />
      </div>

      {/* 5. Analysis Trigger / Status / Error Banner */}
      {!hasAnalysis && !isTranscribing && !isManualInputMode && (
        <div className="mb-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col items-center text-center space-y-4">
          <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" aria-hidden="true" />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900">
              답변 텍스트 변환 및 말하기 지표 분석
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              녹음된 음성을 영어 텍스트로 변환하고 WPM, 단어 수, 필러 표현, 반복 어휘 등 객관적 지표를 계산합니다.
            </p>
          </div>

          <div className="w-full max-w-md">
            <PrivacyNotice />
          </div>

          {/* Analysis trigger button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
            <button
              type="button"
              onClick={handleStartAnalysis}
              disabled={isTranscribing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-xs hover:shadow transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 min-h-[46px] min-w-[200px]"
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>답변 분석하기</span>
            </button>

            <button
              type="button"
              onClick={handleOpenManualInput}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-slate-500 min-h-[46px]"
            >
              <Edit3 className="w-4 h-4 text-slate-500" aria-hidden="true" />
              <span>Transcript 직접 입력</span>
            </button>
          </div>
        </div>
      )}

      {/* Loading state during transcription */}
      {isTranscribing && (
        <div className="mb-8">
          <AnalysisLoading onCancel={resetTranscription} />
        </div>
      )}

      {/* Error state */}
      {transcriptionError && !isTranscribing && !isManualInputMode && (
        <div className="mb-8">
          <ErrorMessage
            message={transcriptionError.message}
            onRetry={handleStartAnalysis}
            onGoBack={handleOpenManualInput}
          />
        </div>
      )}

      {/* Manual Input Fallback Form */}
      {isManualInputMode && !hasAnalysis && (
        <div className="mb-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Transcript 직접 입력 모드
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              음성 인식 없이 본인이 말한 영어 답변 내용을 직접 입력하여 객관적 말하기 지표를 확인할 수 있습니다.
            </p>
          </div>

          <div>
            <label htmlFor="manual-transcript-textarea" className="sr-only">
              영어 답변 직접 입력
            </label>
            <textarea
              id="manual-transcript-textarea"
              rows={4}
              value={manualInputDraft}
              onChange={(e) => setManualInputDraft(e.target.value)}
              placeholder="예: I usually start my weekday by checking my work calendar..."
              className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm leading-relaxed focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus-visible:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setIsManualInputMode(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              취소
            </button>

            <button
              type="button"
              onClick={handleSubmitManualInput}
              disabled={!manualInputDraft.trim()}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              지표 분석 시작
            </button>
          </div>
        </div>
      )}

      {/* 6. Active Analysis Output (Transcript & Speaking Metrics) */}
      {hasAnalysis && speakingMetrics && (
        <div className="space-y-8 mb-10">
          {/* Transcript Editor */}
          <TranscriptEditor
            originalTranscript={originalTranscript}
            initialTranscript={editedTranscript}
            onUpdateTranscript={handleUpdateTranscript}
            isManual={transcriptionStatus === 'manual' || isManualInputMode}
          />

          {/* Primary Metrics Summary */}
          <MetricsSummary metrics={speakingMetrics} />

          {/* Filler Word Breakdown */}
          <FillerAnalysis
            fillerCounts={speakingMetrics.fillerCounts}
            totalFillerCount={speakingMetrics.totalFillerCount}
            fillerRatePer100Words={speakingMetrics.fillerRatePer100Words}
          />

          {/* Repetition Analysis */}
          <RepetitionAnalysis
            repeatedWords={speakingMetrics.repeatedWords}
            repeatedPhrases={speakingMetrics.repeatedPhrases}
          />

          {/* Sprint 3: AI Speaking Coach Section */}
          <AICoachingPanel
            coachingResult={coaching.result}
            isLoading={coaching.isLoading}
            isStale={coaching.isStale}
            error={coaching.error}
            feedbackLanguage={coaching.feedbackLanguage}
            desiredAnswerLevel={coaching.desiredAnswerLevel}
            onLanguageChange={coaching.setFeedbackLanguage}
            onLevelChange={coaching.setDesiredAnswerLevel}
            onRequestCoaching={handleRequestAICoaching}
            onClearError={coaching.clearError}
            onStartRetryPractice={handleStartRetryPractice}
          />
        </div>
      )}

      {/* 7. Self-Check Rubric Guide (when not yet analyzed or as supplement) */}
      {!hasAnalysis && (
        <div className="mb-10 bg-slate-50 border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3 text-slate-900 font-bold text-sm">
            <HelpCircle className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <span>자가 청취 체크포인트</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">·</span>
              <span><strong>완전한 문장:</strong> 단어 나열이 아닌 주어-동사가 갖추어진 완전한 문장으로 말했는가?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">·</span>
              <span><strong>질문 핵심 답변:</strong> 질문의 핵심 요구사항(이유, 예시, 대안 등)에 정확히 답했는가?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">·</span>
              <span><strong>유창성과 쉼:</strong> 불필요한 음... 어... (Filler words) 없이 매끄럽게 연결되었는가?</span>
            </li>
          </ul>
        </div>
      )}

      {/* 8. Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onRetrySameQuestion}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 min-h-[46px]"
        >
          <RotateCcw className="w-4 h-4 text-slate-600" aria-hidden="true" />
          <span>같은 문제 다시 연습</span>
        </button>

        {hasComparisonAvailable && onOpenComparison && (
          <button
            type="button"
            onClick={onOpenComparison}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-sm rounded-xl transition-colors min-h-[46px]"
          >
            <GitCompare className="w-4 h-4 text-indigo-600" aria-hidden="true" />
            <span>시도 간 비교 보기</span>
          </button>
        )}

        <button
          type="button"
          onClick={onNextQuestion}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 min-h-[46px]"
        >
          <span>다음 문제</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={onFinishPractice}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-slate-600 min-h-[46px]"
        >
          <Home className="w-4 h-4 text-slate-500" aria-hidden="true" />
          <span>연습 종료</span>
        </button>
      </div>
    </div>
  );
};
