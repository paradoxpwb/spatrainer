/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PracticeAreaId } from './question';

export type PeriodFilter = '7d' | '30d' | 'all';

export interface ProgressSummary {
  totalAttempts: number;
  completedSessions: number;
  retryCount: number;
  practiceDays: number;
  practiceDaysCount: number; // alias
  totalRecordingSeconds: number;
  averageRecordingSeconds: number | null;
  averageDurationSeconds: number; // rounded alias
  averageWordsPerMinute: number | null;
  averageWpm: number; // rounded alias
  averageFillerRate: number | null;
  validWpmSampleCount: number;
  validDurationSampleCount: number;
  validFillerSampleCount: number;
}

export interface TrendPoint {
  id: string;
  date: string; // YYYY-MM-DD
  displayDate: string; // MM/DD
  speakingDuration: number;
  wpm: number;
  fillerRate: number;
  totalWords: number;
  attemptNumber: number;
  questionTitle: string;
}

export type ImprovementTag =
  | 'add-example'
  | 'clarify-main-point'
  | 'explain-reason'
  | 'add-result'
  | 'improve-structure'
  | 'reduce-repetition'
  | 'grammar-tense'
  | 'grammar-article'
  | 'grammar-preposition'
  | 'use-specific-vocabulary'
  | 'answer-all-parts'
  | 'other';

export interface CategoryProgress {
  category: string;
  categoryId: string; // alias
  categoryLabel: string;
  attemptCount: number;
  practiceCount: number; // alias
  sessionCount: number;
  retryCount: number;
  lastPracticedAt: string | null;
  averageRecordingSeconds: number | null;
  averageDurationSeconds: number; // alias
  averageWordsPerMinute: number | null;
  averageWpm: number; // alias
  averageFillerRate: number | null;
  frequentImprovementTags: Array<{
    tag: ImprovementTag;
    label: string;
    count: number;
  }>;
}

export interface AreaProgress {
  areaId: PracticeAreaId;
  order: number;
  labelKo: string;
  labelEn: string;
  practiceMode: string;
  attemptCount: number;
  sessionCount: number;
  retryCount: number;
  lastPracticedAt: string | null;
  averageRecordingSeconds: number | null;
  averageWordsPerMinute: number | null;
  averageFillerRate: number | null;
}

export interface StreakSummary {
  currentStreak: number;
  longestStreak: number;
  practiceDates: string[];
}

export interface StreakData extends StreakSummary {
  lastPracticedDate: string | null;
  activityDaysLast30: number;
  dailyAttemptCounts: Record<string, number>; // YYYY-MM-DD -> count
}

export interface PracticeRecommendation {
  id: string;
  priority: number;
  type?:
    | 'unpracticed-category'
    | 'retry-pending'
    | 'short-responses'
    | 'repeated-improvement'
    | 'goal-related';
  title: string;
  explanation: string;
  reason: string; // alias for explanation
  actionLabel: string;
  actionType: 'category' | 'retry' | 'previous-question';
  category?: string;
  categoryId?: string;
  sessionId?: string;
  targetCategoryId?: string;
  targetCategoryLabel?: string;
  targetQuestionId?: string;
  targetSessionId?: string;
}
