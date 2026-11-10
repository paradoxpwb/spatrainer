/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TargetSpaLevel =
  | 'level-3'
  | 'level-4'
  | 'level-5'
  | 'level-6-plus'
  | 'not-sure';

export type DailyStudyMinutes = 10 | 20 | 30;

export interface MonetizationProfile {
  schemaVersion: 1;
  examDate: string | null; // Format: YYYY-MM-DD or null
  examDateDecided: boolean;
  isExamDateUndecided?: boolean;
  targetLevel: TargetSpaLevel;
  dailyStudyMinutes: DailyStudyMinutes;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  lastUpdatedAt?: string;
}

export interface DailyUsage {
  schemaVersion: 1;
  localDate: string; // Format: YYYY-MM-DD
  completedPracticeIds: string[];
  aiFeedbackRequestIds: string[];
  practiceCount: number;
  aiFeedbackCount: number;
  date?: string;
  practiceAttemptsCount?: number;
  completedAttemptIds?: string[];
  completedAiFeedbackIds?: string[];
}

export type MonetizationPlanId = 'mock_single' | 'pass_7d' | 'pro_monthly';

export type PlanBillingType = 'one_time' | 'seven_day' | 'monthly';

export interface MonetizationPlan {
  id: MonetizationPlanId;
  nameKo: string;
  priceKrw: number;
  billingType: PlanBillingType;
  descriptionKo: string;
  benefitsKo: string[];
  recommended?: boolean;
}

export type PaywallSource =
  | 'home_pricing'
  | 'header_badge'
  | 'progress_page'
  | 'daily_practice_limit'
  | 'daily_ai_limit'
  | 'mock_result'
  | 'locked_feedback'
  | 'other'
  | 'home_hero_card'
  | 'home_limit_badge'
  | 'progress_limit_badge'
  | 'paywall_modal';

export interface PurchaseIntent {
  schemaVersion: 1;
  id: string;
  planId: MonetizationPlanId;
  priceKrw: number;
  source: PaywallSource;
  createdAt: string;
  daysUntilExam: number | null;
  targetLevel: TargetSpaLevel;
  planName?: string;
  priceKRW?: number;
  formattedDDay?: string;
  recordedAt?: string;
}

// ---------------------------------------------------------------------------
// Storage Keys (Sprint 1 isolated from existing learning-data schemas)
// ---------------------------------------------------------------------------
export const STORAGE_KEY_MONETIZATION_PROFILE = 'spa_monetization_profile_v1';
export const STORAGE_KEY_DAILY_USAGE = 'spa_daily_usage_v1';
export const STORAGE_KEY_PURCHASE_INTENTS = 'spa_purchase_intents_v1';

// ---------------------------------------------------------------------------
// Default Free Daily Limits
// ---------------------------------------------------------------------------
export const DEFAULT_DAILY_PRACTICE_LIMIT = 3;
export const DEFAULT_DAILY_AI_FEEDBACK_LIMIT = 1;

// ---------------------------------------------------------------------------
// Immutable 3 Monetization Plans
// ---------------------------------------------------------------------------
export const MONETIZATION_PLANS: readonly MonetizationPlan[] = Object.freeze([
  {
    id: 'mock_single',
    nameKo: '모의 SPA 1회권',
    priceKrw: 2900,
    billingType: 'one_time',
    descriptionKo: '실전 환경 그대로 완성도 높은 실전 모의고사를 응시하고 분석합니다.',
    benefitsKo: [
      '실전 모의 SPA 1회',
      '전체 결과 리포트',
      '상세 개선 피드백',
    ],
  },
  {
    id: 'pass_7d',
    nameKo: '7일 집중 패스',
    priceKrw: 5900,
    billingType: 'seven_day',
    recommended: true,
    descriptionKo: '시험 직전 일주일 동안 모든 연습과 모의고사를 무제한으로 훈련합니다.',
    benefitsKo: [
      '7일간 모든 연습 이용',
      '실전 모의 SPA',
      '상세 AI 피드백',
      '취약 영역 분석',
      'D-Day 학습 계획',
    ],
  },
  {
    id: 'pro_monthly',
    nameKo: 'SPA Trainer Pro',
    priceKrw: 12900,
    billingType: 'monthly',
    descriptionKo: '지속적인 승진 및 해외 파견 대비를 위한 프리미엄 정기 학습 플랜입니다.',
    benefitsKo: [
      '장기 진도 관리',
      '전체 모의고사 기록',
      '주간 학습 리포트',
      '신규 콘텐츠 이용',
      '7일 집중 패스의 모든 기능',
    ],
  },
]);

export const DEFAULT_MONETIZATION_PROFILE: MonetizationProfile = {
  schemaVersion: 1,
  examDate: null,
  examDateDecided: false,
  isExamDateUndecided: true,
  targetLevel: 'level-5',
  dailyStudyMinutes: 20,
  onboardingCompleted: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};
