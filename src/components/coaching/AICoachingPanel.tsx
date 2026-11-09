import React, { useState } from 'react';
import {
  AICoachingResult,
  CoachingErrorCode,
  DesiredAnswerLevel,
  FeedbackLanguage,
  RetryMode,
} from '../../types/coaching';

export type { RetryMode };
import { OverallSummary } from './OverallSummary';
import { StrengthsSection } from './StrengthsSection';
import { PriorityImprovements } from './PriorityImprovements';
import { RelevanceSection } from './RelevanceSection';
import { StructureSection } from './StructureSection';
import { GrammarCorrections } from './GrammarCorrections';
import { ExpressionImprovements } from './ExpressionImprovements';
import { AnswerOutline } from './AnswerOutline';
import { ImprovedAnswer } from './ImprovedAnswer';
import { UsefulExpressions } from './UsefulExpressions';
import { RetryChecklist } from './RetryChecklist';
import { CoachingLimitations } from './CoachingLimitations';
import { ErrorMessage } from '../ErrorMessage';
import {
  Sparkles,
  RefreshCw,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface AICoachingPanelProps {
  coachingResult: AICoachingResult | null;
  isLoading: boolean;
  isStale: boolean;
  error: { code: CoachingErrorCode; message: string } | null;
  feedbackLanguage: FeedbackLanguage;
  desiredAnswerLevel: DesiredAnswerLevel;
  onLanguageChange: (lang: FeedbackLanguage) => void;
  onLevelChange: (level: DesiredAnswerLevel) => void;
  onRequestCoaching: () => void;
  onClearError: () => void;
  onStartRetryPractice: (mode: RetryMode) => void;
}

export const AICoachingPanel: React.FC<AICoachingPanelProps> = ({
  coachingResult,
  isLoading,
  isStale,
  error,
  feedbackLanguage,
  desiredAnswerLevel,
  onLanguageChange,
  onLevelChange,
  onRequestCoaching,
  onClearError,
  onStartRetryPractice,
}) => {
  const [retryModalOpen, setRetryModalOpen] = useState<boolean>(false);
  const [retryMode, setRetryMode] = useState<RetryMode>('outline-only');
  const [detailsExpanded, setDetailsExpanded] = useState<boolean>(true);

  return (
    <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      {/* 1. Header & Preferences */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              AI Speaking Coach
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            질문과 최종 Transcript를 바탕으로 답변 내용과 영어 표현에 대한 맞춤형 연습 피드백을 제공합니다.
          </p>
        </div>

        {/* Options Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => onLanguageChange('ko')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                feedbackLanguage === 'ko'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              한국어
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('en')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                feedbackLanguage === 'en'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              English
            </button>
          </div>

          {/* Level Selector */}
          <div className="relative">
            <label htmlFor="coaching-level-select" className="sr-only">
              개선 답변 목표 수준
            </label>
            <select
              id="coaching-level-select"
              value={desiredAnswerLevel}
              onChange={(e) => onLevelChange(e.target.value as DesiredAnswerLevel)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl focus-visible:outline-2 focus-visible:outline-blue-600 cursor-pointer"
            >
              <option value="current">수준: Current Level</option>
              <option value="one-step-better">수준: One Step Better (권장)</option>
              <option value="challenging">수준: Challenging</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Stale Warning Notice */}
      {isStale && coachingResult && (
        <div
          role="status"
          className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-xs">
              <strong className="font-bold block">Transcript가 수정되었습니다.</strong>
              <span className="text-amber-800">
                변경된 답변에 대한 새로운 코칭을 받으려면 아래 버튼을 눌러 다시 분석해 주세요.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onRequestCoaching}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>수정본 다시 분석</span>
          </button>
        </div>
      )}

      {/* 3. Error Banner */}
      {error && !isLoading && (
        <ErrorMessage
          message={error.message}
          onRetry={onRequestCoaching}
          onGoBack={onClearError}
        />
      )}

      {/* 4. Not yet requested state */}
      {!coachingResult && !isLoading && (
        <div className="py-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">
              답변 내용 및 구조에 대한 1:1 AI 코칭
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              영어 답변의 논리적 흐름, 강점, 우선 개선점, 문법 교정 및 내 경험을 유지한 모범 답변을 생성합니다.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onRequestCoaching}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-xs transition-all focus-visible:outline-2 focus-visible:outline-blue-600 min-h-[46px]"
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>AI 코칭 받기</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Loading State */}
      {isLoading && (
        <div
          role="status"
          aria-live="polite"
          className="py-12 text-center space-y-4 bg-slate-50/50 rounded-2xl border border-slate-100"
        >
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto animate-spin">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              AI가 답변을 심층 코칭하고 있습니다...
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              내용 적합성, 논리 흐름, 문법 교정 및 개선 답변을 작성 중입니다. (약 5~15초 소요)
            </p>
          </div>
        </div>
      )}

      {/* 6. Completed Results */}
      {coachingResult && (
        <div className="space-y-6 animate-fade-in">
          {/* Top 1: Overall Coaching Summary */}
          <OverallSummary summary={coachingResult.overallSummary} />

          {/* Top 2 & 3: What You Did Well & Priority Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <StrengthsSection strengths={coachingResult.strengths} />
            <PriorityImprovements improvements={coachingResult.priorityImprovements} />
          </div>

          {/* Collapsible Detailed Sections */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setDetailsExpanded(!detailsExpanded)}
              className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors"
            >
              <span>상세 분석 (적합성, 구성, 문법, 어휘, 아웃라인, 개선안)</span>
              {detailsExpanded ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>
          </div>

          {detailsExpanded && (
            <div className="space-y-6 pt-1">
              {/* Relevance & Structure */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <RelevanceSection relevance={coachingResult.relevance} />
                <StructureSection structure={coachingResult.structure} />
              </div>

              {/* Grammar Corrections */}
              <GrammarCorrections corrections={coachingResult.grammarCorrections} />

              {/* Expression Improvements */}
              <ExpressionImprovements improvements={coachingResult.expressionImprovements} />

              {/* Answer Outline */}
              <AnswerOutline outline={coachingResult.answerOutline} />

              {/* Improved Answer */}
              <ImprovedAnswer
                improvedAnswer={coachingResult.improvedAnswer}
                desiredAnswerLevel={coachingResult.desiredAnswerLevel}
              />

              {/* Useful Expressions */}
              <UsefulExpressions expressions={coachingResult.usefulExpressions} />

              {/* Retry Checklist */}
              <RetryChecklist items={coachingResult.retryChecklist} />

              {/* Limitations Notice */}
              <CoachingLimitations
                limitations={coachingResult.limitations}
                language={coachingResult.feedbackLanguage}
              />
            </div>
          )}

          {/* Retry Practice Action Bar */}
          <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-blue-950">
                코칭 내용을 바탕으로 바로 재연습하시겠습니까?
              </h3>
              <p className="text-xs text-blue-700 mt-0.5">
                아웃라인과 체크리스트를 확인하며 동일 질문에 다시 답변을 녹음합니다.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setRetryModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>피드백 보고 다시 연습</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Retry Mode Selection Modal */}
      {retryModalOpen && coachingResult && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              재연습 모드 선택
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              재연습 시 어떤 가이드를 참고하여 발화할지 선택해 주세요.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setRetryMode('outline-only')}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  retryMode === 'outline-only'
                    ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="block text-sm font-bold text-slate-900">
                  Mode A: 구조만 보고 연습 (권장)
                </span>
                <span className="block text-xs text-slate-500 mt-1">
                  Answer Outline과 Checklist만 확인하며, 모범답안을 보지 않고 스스로 문장을 구사합니다.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRetryMode('with-improved-answer')}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  retryMode === 'with-improved-answer'
                    ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="block text-sm font-bold text-slate-900">
                  Mode B: 개선 답변 참고
                </span>
                <span className="block text-xs text-slate-500 mt-1">
                  모범답안을 먼저 읽어본 후 준비 단계로 이동합니다. (녹음 중에는 모범답안이 숨겨집니다)
                </span>
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRetryModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  setRetryModalOpen(false);
                  onStartRetryPractice(retryMode);
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                연습 시작
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
