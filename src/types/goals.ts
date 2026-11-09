import { FeedbackLanguage, DesiredAnswerLevel } from './coaching';

export type GoalType =
  | 'weekly-attempts'
  | 'weekly-days'
  | 'weekly-retries'
  | 'category-target'
  | 'weekly-practice-days'
  | 'category-practice'
  | 'response-duration'
  | 'filler-rate';

export interface PracticeGoal {
  id: string;
  type: GoalType;
  label: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  category?: string;
  categoryId?: string; // alias for category
  active?: boolean;
  period?: 'weekly' | 'all-time';
  createdAt: string;
  updatedAt: string;
}

export interface ProgressPreferences {
  defaultPeriod: '7d' | '30d' | 'all';
  showTrendCharts: boolean;
}

export interface UserPreferences extends ProgressPreferences {
  feedbackLanguage: FeedbackLanguage;
  desiredAnswerLevel: DesiredAnswerLevel;
  activePeriodFilter: '7d' | '30d' | 'all';
}

export const DEFAULT_GOALS: PracticeGoal[] = [
  {
    id: 'goal-weekly-attempts',
    type: 'weekly-attempts',
    label: '주간 연습 횟수',
    targetValue: 3,
    currentValue: 0,
    unit: '회',
    active: true,
    period: 'weekly',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'goal-weekly-days',
    type: 'weekly-days',
    label: '주간 연습 일수',
    targetValue: 2,
    currentValue: 0,
    unit: '일',
    active: true,
    period: 'weekly',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'goal-weekly-retries',
    type: 'weekly-retries',
    label: '주간 재도전(Retry) 횟수',
    targetValue: 1,
    currentValue: 0,
    unit: '회',
    active: true,
    period: 'weekly',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];
