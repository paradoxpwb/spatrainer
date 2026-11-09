import React from 'react';
import { PracticeAttempt } from '../types/practiceAttempt';
import { useAttemptComparison } from '../hooks/useAttemptComparison';
import { AttemptSelector } from '../components/comparison/AttemptSelector';
import { MetricComparisonCard } from '../components/comparison/MetricComparisonCard';
import { TranscriptComparison } from '../components/comparison/TranscriptComparison';
import { ChecklistResults } from '../components/comparison/ChecklistResults';
import { ComparisonSummary } from '../components/comparison/ComparisonSummary';
import { AudioPlayer } from '../components/AudioPlayer';
import { RotateCcw, ArrowLeft, Home, BarChart2, ShieldAlert, ArrowRight, Layers } from 'lucide-react';
import { FeedbackLanguage } from '../types/coaching';

interface ComparisonPageProps {
  attempts: PracticeAttempt[];
  initialBaseId?: string;
  initialComparedId?: string;
  activeAudioUrl?: string | null;
  feedbackLanguage?: FeedbackLanguage;
  onRetryQuestion: (questionId: string) => void;
  onNextQuestion?: () => void;
  onBackToSession?: () => void;
  onGoHome: () => void;
}

export const ComparisonPage: React.FC<ComparisonPageProps> = ({
  attempts,
  initialBaseId,
  initialComparedId,
  activeAudioUrl,
  onRetryQuestion,
  onNextQuestion,
  onBackToSession,
  onGoHome,
}) => {
  const {
    comparison,
    baseAttempt,
    comparedAttempt,
    setBaseAttemptId,
    setComparedAttemptId,
  } = useAttemptComparison(attempts, initialBaseId, initialComparedId);

  // If there are less than 2 attempts for this question
  if (attempts.length < 2 || !baseAttempt || !comparedAttempt || !comparison) {
    return (
      <div className="py-12 max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-4">
        <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-3">
          <BarChart2 className="w-10 h-10 text-slate-400 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">
            비교할 시도가 2개 이상 필요합니다.
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            이전 답변과 비교하려면 같은 질문에 한 번 더 답변을 녹음(Retry)해 주세요.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onGoHome}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              홈으로 이동
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Primary 4 Metrics
  const primaryMetrics = comparison.metricChanges.filter((m) =>
    ['recording-duration', 'total-words', 'words-per-minute', 'filler-rate'].includes(m.metric)
  );

  // Secondary Metrics
  const secondaryMetrics = comparison.metricChanges.filter((m) =>
    ['unique-words', 'lexical-diversity', 'repeated-words', 'repeated-phrases'].includes(m.metric)
  );

  return (
    <div className="py-8 sm:py-12 max-w-4xl mx-auto px-4 sm:px-6 space-y-8 animate-fade-in">
      {/* 1. Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-bold">
              {comparedAttempt.categoryLabel || comparedAttempt.category}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              세션 내 총 {attempts.length}회 발화 기록
            </span>
          </div>

          {onBackToSession && (
            <button
              type="button"
              onClick={onBackToSession}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>기록 상세로 돌아가기</span>
            </button>
          )}
        </div>

        <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
          "{comparedAttempt.question}"
        </h1>

        <p className="text-xs text-slate-500 leading-relaxed">
          #{baseAttempt.attemptNumber || 1}차 답변과 #{comparedAttempt.attemptNumber || 2}차 재도전 답변의 객관적 지표 및 발화 내용 변화 분석입니다.
        </p>

        {/* Audio Player if available in active session */}
        {activeAudioUrl ? (
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1">
              최근 재도전 녹음 재생:
            </span>
            <AudioPlayer src={activeAudioUrl} />
          </div>
        ) : (
          <p className="text-[11px] text-slate-400 italic pt-1">
            * 오디오는 현재 세션 종료 시 브라우저 정책에 따라 보관되지 않으므로, 텍스트 Transcript와 지표를 기반으로 비교합니다.
          </p>
        )}
      </div>

      {/* 2. Attempt Selector */}
      <AttemptSelector
        attempts={attempts}
        baseAttemptId={baseAttempt.id}
        comparedAttemptId={comparedAttempt.id}
        onSelectBase={setBaseAttemptId}
        onSelectCompared={setComparedAttemptId}
      />

      {/* 3. Overall Comparison Summary Card */}
      <ComparisonSummary summary={comparison.summary} />

      {/* 4. Primary Metrics Comparison */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            핵심 말하기 지표 변화 (Primary Metrics)
          </h3>
          <span className="text-xs text-slate-400 font-medium">객관적 수치 비교</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {primaryMetrics.map((change) => (
            <MetricComparisonCard key={change.metric} change={change} />
          ))}
        </div>
      </div>

      {/* 5. Secondary Metrics Comparison */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          어휘 및 반복 표현 변화 (Vocabulary & Patterns)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {secondaryMetrics.map((change) => (
            <MetricComparisonCard key={change.metric} change={change} />
          ))}
        </div>
      </div>

      {/* 6. Transcript Diff Comparison */}
      <TranscriptComparison
        transcriptChanges={comparison.transcriptChanges}
        baseAttemptNumber={baseAttempt.attemptNumber}
        comparedAttemptNumber={comparedAttempt.attemptNumber}
      />

      {/* 7. Checklist Results */}
      <ChecklistResults results={comparison.checklistResults} />

      {/* 8. Notice & Disclaimers */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <ShieldAlert className="w-4 h-4 text-blue-600" />
          <span>비교 안내 및 투명성 안내</span>
        </div>
        <p>
          • 이 비교는 이 브라우저에 저장된 Transcript와 말하기 지표를 바탕으로 합니다. 공식 SPA 평가나 실제 시험 점수가 아닙니다.
        </p>
        <p>
          • Transcript 수정이 비교 결과에 영향을 줄 수 있으며, filler 탐지는 문맥상 완벽하지 않을 수 있고, lexical diversity는 답변 길이에 영향을 받습니다.
        </p>
        <p>
          • 오디오 원본은 브라우저 정책상 영구 저장되지 않으며, 발음과 억양은 비교하지 않습니다.
        </p>
      </div>

      {/* 9. Bottom Navigation Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={() => onRetryQuestion(comparedAttempt.questionId)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors min-h-[46px]"
        >
          <RotateCcw className="w-4 h-4" />
          <span>같은 질문 다시 연습 (Retry)</span>
        </button>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          {onNextQuestion && (
            <button
              type="button"
              onClick={onNextQuestion}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-colors min-h-[46px]"
            >
              <span>다음 문제</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {onBackToSession && (
            <button
              type="button"
              onClick={onBackToSession}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-xl transition-colors min-h-[46px]"
            >
              <Layers className="w-4 h-4 text-slate-500" />
              <span>세션 기록으로</span>
            </button>
          )}

          <button
            type="button"
            onClick={onGoHome}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors min-h-[46px]"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span>홈으로</span>
          </button>
        </div>
      </div>
    </div>
  );
};
