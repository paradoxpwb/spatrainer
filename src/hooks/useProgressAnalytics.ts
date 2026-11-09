/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, useState } from 'react';
import { PracticeAttempt } from '../types/practiceAttempt';
import { PracticeSession } from '../types/practiceSession';
import { PracticeGoal } from '../types/goals';
import {
  AreaProgress,
  CategoryProgress,
  PeriodFilter,
  PracticeRecommendation,
  ProgressSummary,
  StreakData,
  TrendPoint,
} from '../types/progress';
import {
  calculateAreaStats,
  calculateCategoryProgress,
  calculateGoalProgress,
  calculateProgressSummary,
  calculateStreak,
  calculateTrendPoints,
  generateRecommendations,
} from '../utils/progressAnalytics';

export interface UseProgressAnalyticsReturn {
  periodFilter: PeriodFilter;
  setPeriodFilter: (p: PeriodFilter) => void;
  summary: ProgressSummary;
  trendPoints: TrendPoint[];
  areaProgress: AreaProgress[];
  categoryProgress: CategoryProgress[];
  unassignedAreaCount: number;
  streak: StreakData;
  recommendations: PracticeRecommendation[];
  evaluatedGoals: PracticeGoal[];
}

export function useProgressAnalytics(
  attempts: PracticeAttempt[],
  sessions: PracticeSession[],
  goals: PracticeGoal[],
  initialPeriod: PeriodFilter = '7d'
): UseProgressAnalyticsReturn {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>(initialPeriod);

  const summary = useMemo(
    () => calculateProgressSummary(attempts, sessions, periodFilter),
    [attempts, sessions, periodFilter]
  );

  const trendPoints = useMemo(
    () => calculateTrendPoints(attempts, periodFilter),
    [attempts, periodFilter]
  );

  const areaProgress = useMemo(
    () => calculateAreaStats(attempts, sessions),
    [attempts, sessions]
  );

  const categoryProgress = useMemo(
    () => calculateCategoryProgress(attempts),
    [attempts]
  );

  const unassignedAreaCount = useMemo(
    () => attempts.filter((a) => !a.practiceArea).length,
    [attempts]
  );

  const streak = useMemo(
    () => calculateStreak(attempts),
    [attempts]
  );

  const evaluatedGoals = useMemo(
    () => calculateGoalProgress(goals, attempts, sessions),
    [goals, attempts, sessions]
  );

  const recommendations = useMemo(
    () => generateRecommendations(attempts, sessions, categoryProgress),
    [attempts, sessions, categoryProgress]
  );

  return {
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
  };
}
