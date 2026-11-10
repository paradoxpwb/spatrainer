import React from 'react';
import { Mic, BarChart3, History, Settings, PlayCircle, BookOpen, Award, Calendar } from 'lucide-react';
import { AppStep } from '../types/recording';

interface AppHeaderProps {
  currentStep: AppStep;
  onGoHome: () => void;
  onNavigateProgress?: () => void;
  onNavigateHistory?: () => void;
  onNavigateSettings?: () => void;
  onNavigateGuide?: () => void;
  onNavigateMockExam?: () => void;
  formattedDDay?: string;
  onOpenOnboarding?: () => void;
}

const STEP_LABELS: Record<AppStep, string> = {
  home: '홈',
  setup: '연습 설정',
  'question-ready': '문제 확인',
  practice: '실전 연습',
  result: '답변 분석',
  comparison: '답변 비교',
  progress: '성장 대시보드',
  history: '연습 기록',
  'session-detail': '세션 상세',
  settings: '설정',
  guide: '시험 가이드',
  'mock-exam': '실전 모의고사',
};

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentStep,
  onGoHome,
  onNavigateProgress,
  onNavigateHistory,
  onNavigateSettings,
  onNavigateGuide,
  onNavigateMockExam,
  formattedDDay,
  onOpenOnboarding,
}) => {
  const isPracticeActive = ['home', 'setup', 'question-ready', 'practice', 'result'].includes(currentStep);
  const isProgressActive = currentStep === 'progress';
  const isHistoryActive = currentStep === 'history' || currentStep === 'session-detail';
  const isSettingsActive = currentStep === 'settings';
  const isGuideActive = currentStep === 'guide';
  const isMockExamActive = currentStep === 'mock-exam';

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand & Compact D-Day Indicator */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onGoHome}
            className="flex items-center gap-1.5 sm:gap-2 text-left focus-visible:outline-2 focus-visible:outline-indigo-600 rounded-md py-1 pr-1 transition-opacity hover:opacity-90 shrink-0"
            aria-label="SPA Speaking Trainer 홈으로 이동"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-indigo-600/20">
              <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-white" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
                SPA Trainer
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap hidden md:inline">
                영어 말하기 실전 훈련
              </span>
            </div>
          </button>

          {onOpenOnboarding && (
            <button
              type="button"
              onClick={onOpenOnboarding}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] sm:text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 hover:bg-indigo-100 transition-colors shrink-0"
              title="시험일 및 목표 등급 설정"
              aria-label={`목표 설정: ${formattedDDay || 'D-Day 설정'}`}
            >
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="font-mono">{formattedDDay || 'D-Day'}</span>
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-1.5 shrink-0 overflow-x-auto" aria-label="메인 내비게이션">
          <button
            onClick={onGoHome}
            className={`whitespace-nowrap shrink-0 inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
              isPracticeActive
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="whitespace-nowrap">연습</span>
          </button>

          {onNavigateMockExam && (
            <button
              onClick={onNavigateMockExam}
              className={`whitespace-nowrap shrink-0 inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
                isMockExamActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="whitespace-nowrap">모의고사</span>
            </button>
          )}

          {onNavigateProgress && (
            <button
              onClick={onNavigateProgress}
              className={`whitespace-nowrap shrink-0 inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
                isProgressActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="whitespace-nowrap">대시보드</span>
            </button>
          )}

          {onNavigateHistory && (
            <button
              onClick={onNavigateHistory}
              className={`whitespace-nowrap shrink-0 inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
                isHistoryActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="whitespace-nowrap">기록</span>
            </button>
          )}

          {onNavigateGuide && (
            <button
              onClick={onNavigateGuide}
              className={`whitespace-nowrap shrink-0 inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
                isGuideActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="whitespace-nowrap">가이드</span>
            </button>
          )}

          {onNavigateSettings && (
            <button
              onClick={onNavigateSettings}
              className={`whitespace-nowrap shrink-0 inline-flex items-center gap-1 sm:gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
                isSettingsActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
              title="설정"
              aria-label="설정"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">설정</span>
            </button>
          )}
        </nav>

        {/* Current Sub-step Badge (Desktop) */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
          <span className="text-slate-400">단계:</span>
          <span className="text-slate-800 dark:text-slate-200 font-semibold">{STEP_LABELS[currentStep] || currentStep}</span>
        </div>
      </div>
    </header>
  );
};
