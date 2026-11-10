/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PracticeAttempt } from '../types/practiceAttempt';
import { PracticeSession } from '../types/practiceSession';
import { PracticeGoal } from '../types/goals';
import { useProgressAnalytics } from '../hooks/useProgressAnalytics';
import { ProgressSummary } from '../components/progress/ProgressSummary';
import { GoalProgress } from '../components/progress/GoalProgress';
import { TrendChart } from '../components/progress/TrendChart';
import { AreaProgressSection } from '../components/progress/AreaProgressSection';
import { CategoryProgress } from '../components/progress/CategoryProgress';
import { ActivitySummary } from '../components/progress/ActivitySummary';
import { RecommendationList } from '../components/progress/RecommendationList';
import { Play, ShieldAlert } from 'lucide-react';
import { PracticeRecommendation } from '../types/progress';

import { TargetSpaLevel, DailyStudyMinutes, PaywallSource } from '../types/monetization';
import { PracticeAreaDefinition } from '../types/question';
import { DailyLimitBadge } from '../components/monetization/DailyLimitBadge';
import { Calendar, Sparkles, Clock, Compass } from 'lucide-react';

interface ProgressPageProps {
  attempts: PracticeAttempt[];
  sessions: PracticeSession[];
  goals: PracticeGoal[];
  onUpdateGoals: (goals: PracticeGoal[]) => void;
  onStartPractice: () => void;
  onSelectCategoryPractice: (categoryId: string) => void;
  onRetryQuestion: (questionId: string) => void;
  onGoHome: () => void;
  formattedDDay?: string;
  targetLevel?: TargetSpaLevel;
  dailyStudyMinutes?: DailyStudyMinutes;
  recommendedArea?: PracticeAreaDefinition;
  remainingPracticeCount?: number;
  practiceLimit?: number;
  remainingAiFeedbackCount?: number;
  aiFeedbackLimit?: number;
  onOpenOnboarding?: () => void;
  onOpenPaywall?: (source: PaywallSource) => void;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({
  attempts,
  sessions,
  goals,
  onUpdateGoals,
  onStartPractice,
  onSelectCategoryPractice,
  onRetryQuestion,
  onGoHome,
  formattedDDay,
  targetLevel,
  dailyStudyMinutes,
  recommendedArea,
  remainingPracticeCount = 3,
  practiceLimit = 3,
  remainingAiFeedbackCount = 1,
  aiFeedbackLimit = 1,
  onOpenOnboarding,
  onOpenPaywall,
}) => {
  const {
    periodFilter,
    setPeriodFilter,
    summary,
    trendPoints,
    areaProgress,
    categoryProgress,
    unassignedAreaCount,
    streak,
    recommendations,
    evaluatedGoals,
  } = useProgressAnalytics(attempts, sessions, goals);

  const handleTriggerRecommendation = (rec: PracticeRecommendation) => {
    if (rec.actionType === 'category' && rec.targetCategoryId) {
      onSelectCategoryPractice(rec.targetCategoryId);
    } else if (rec.actionType === 'retry' && rec.targetQuestionId) {
      onRetryQuestion(rec.targetQuestionId);
    } else {
      onStartPractice();
    }
  };

  return (
    <div className="py-8 sm:py-12 max-w-4xl mx-auto px-4 sm:px-6 space-y-8 animate-fade-in">
      {/* 1. Header with CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-slate-100 tracking-tight">
            Personal Progress Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            점수 하나가 아닌, 실제 발화 템포와 내용의 변화를 바탕으로 다음 학습 행동을 안내합니다.
          </p>
        </div>

        <button
          type="button"
          onClick={onStartPractice}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-auto min-h-[44px]"
        >
          <Play className="w-4 h-4 fill-current" aria-hidden="true" />
          <span>새 질문 연습하기</span>
        </button>
      </div>

      {/* Sprint 1: D-Day & Target Level Status Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white text-xs font-extrabold rounded-full">
                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{formattedDDay || '시험일 설정'}</span>
              </span>
              {targetLevel && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-lg border border-indigo-200/60 dark:border-indigo-800">
                  <Sparkles className="w-3 h-3 text-indigo-500" aria-hidden="true" />
                  <span>
                    목표 SPA:{' '}
                    {targetLevel === 'level-3'
                      ? 'Level 3'
                      : targetLevel === 'level-4'
                      ? 'Level 4'
                      : targetLevel === 'level-5'
                      ? 'Level 5'
                      : targetLevel === 'level-6-plus'
                      ? 'Level 6+'
                      : '미정'}
                  </span>
                </span>
              )}
              {dailyStudyMinutes && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg">
                  <Clock className="w-3 h-3 text-slate-400" aria-hidden="true" />
                  <span>일일 목표 {dailyStudyMinutes}분</span>
                </span>
              )}
              {onOpenOnboarding && (
                <button
                  type="button"
                  onClick={onOpenOnboarding}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium underline underline-offset-2 ml-1"
                >
                  수정
                </button>
              )}
            </div>

            {recommendedArea && (
              <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-blue-600 shrink-0" aria-hidden="true" />
                <span>추천 영역: <strong>{recommendedArea.labelKo}</strong></span>
              </p>
            )}
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <DailyLimitBadge
              remainingPracticeCount={remainingPracticeCount}
              practiceLimit={practiceLimit}
              remainingAiFeedbackCount={remainingAiFeedbackCount}
              aiFeedbackLimit={aiFeedbackLimit}
              variant="compact"
              onUpgradeClick={onOpenPaywall ? () => onOpenPaywall('progress_limit_badge') : undefined}
            />
          </div>
        </div>
      </div>

      {/* 2. Top Recommendations Banner (if any) */}
      <RecommendationList
        recommendations={recommendations}
        onTriggerRecommendation={handleTriggerRecommendation}
      />

      {/* 3. Progress Summary (8 Key Metrics + Period Filter) */}
      <ProgressSummary
        summary={summary}
        periodFilter={periodFilter}
        onSelectPeriod={setPeriodFilter}
      />

      {/* 4. Weekly Goals Progress */}
      <GoalProgress goals={evaluatedGoals} onUpdateGoals={onUpdateGoals} />

      {/* 5. Chronological Trend Chart */}
      <TrendChart trendPoints={trendPoints} />

      {/* 6. Activity & Streak Consistency */}
      <ActivitySummary streak={streak} />

      {/* 7. Practice Area Breakdown (5 Areas) */}
      <AreaProgressSection
        areas={areaProgress}
        legacyUnassignedCount={unassignedAreaCount}
      />

      {/* 8. Topic Breakdown (8 Topics) */}
      <CategoryProgress
        categories={categoryProgress}
        onSelectCategory={onSelectCategoryPractice}
      />

      {/* 9. Transparency & Privacy Disclaimer */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 flex items-start gap-3 text-xs text-amber-950 dark:text-amber-200">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="leading-relaxed space-y-1">
          <strong className="font-bold block">개인정보 및 집계 기준 안내</strong>
          <p>
            Progress는 이 브라우저의 <code>localStorage</code>에 저장된 연습 기록을 바탕으로 순수 로컬에서 계산됩니다. 공식 SPA 평가 결과나 타 응시자와의 비교 점수가 아니며, 로그인이나 클라우드 동기화 없이 사용자의 현재 기기에만 안전하게 보관됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};
