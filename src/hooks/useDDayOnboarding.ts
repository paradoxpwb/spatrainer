/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useMemo } from 'react';
import {
  DEFAULT_MONETIZATION_PROFILE,
  DailyStudyMinutes,
  MonetizationProfile,
  STORAGE_KEY_MONETIZATION_PROFILE,
  TargetSpaLevel,
} from '../types/monetization';
import { calculateDaysUntilExam, formatDDay, getRecommendedPracticeArea, isValidExamDate } from '../utils/dDayUtils';
import { PracticeAreaDefinition } from '../types/question';

export const MONETIZATION_PROFILE_STORAGE_KEY = STORAGE_KEY_MONETIZATION_PROFILE;

/**
 * Validates and parses raw storage data into a valid MonetizationProfile.
 * Returns default profile if missing or malformed.
 */
export function parseStoredProfile(raw: unknown): MonetizationProfile {
  if (!raw) return { ...DEFAULT_MONETIZATION_PROFILE };

  try {
    let parsed: any = raw;
    if (typeof raw === 'string') {
      parsed = JSON.parse(raw);
    }

    if (!parsed || typeof parsed !== 'object') {
      return { ...DEFAULT_MONETIZATION_PROFILE };
    }

    const validLevels: TargetSpaLevel[] = [
      'level-3',
      'level-4',
      'level-5',
      'level-6-plus',
      'not-sure',
    ];
    const targetLevel = validLevels.includes(parsed.targetLevel)
      ? parsed.targetLevel
      : DEFAULT_MONETIZATION_PROFILE.targetLevel;

    const validMinutes: DailyStudyMinutes[] = [10, 20, 30];
    const dailyStudyMinutes = validMinutes.includes(parsed.dailyStudyMinutes)
      ? parsed.dailyStudyMinutes
      : DEFAULT_MONETIZATION_PROFILE.dailyStudyMinutes;

    const examDateDecided = typeof parsed.examDateDecided === 'boolean'
      ? parsed.examDateDecided
      : parsed.isExamDateUndecided === false || Boolean(parsed.examDate);

    const examDate = examDateDecided && typeof parsed.examDate === 'string' && parsed.examDate.trim()
      ? parsed.examDate.trim()
      : null;

    return {
      schemaVersion: 1,
      examDate,
      examDateDecided,
      isExamDateUndecided: !examDateDecided,
      targetLevel,
      dailyStudyMinutes,
      onboardingCompleted: Boolean(parsed.onboardingCompleted),
      createdAt: typeof parsed.createdAt === 'string' ? parsed.createdAt : new Date().toISOString(),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : (parsed.lastUpdatedAt || new Date().toISOString()),
      lastUpdatedAt: typeof parsed.lastUpdatedAt === 'string' ? parsed.lastUpdatedAt : (parsed.updatedAt || new Date().toISOString()),
    };
  } catch {
    return { ...DEFAULT_MONETIZATION_PROFILE };
  }
}

/**
 * Loads the current monetization profile from localStorage safely.
 */
export function loadMonetizationProfile(): MonetizationProfile {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { ...DEFAULT_MONETIZATION_PROFILE };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_MONETIZATION_PROFILE);
    return parseStoredProfile(raw);
  } catch {
    return { ...DEFAULT_MONETIZATION_PROFILE };
  }
}

/**
 * Saves monetization profile to localStorage safely.
 */
export function saveMonetizationProfile(profile: MonetizationProfile): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    localStorage.setItem(STORAGE_KEY_MONETIZATION_PROFILE, JSON.stringify(profile));
  } catch {
    // ignore
  }
}

export interface UseDDayOnboardingReturn {
  profile: MonetizationProfile;
  daysUntilExam: number | null;
  formattedDDay: string;
  recommendedArea: PracticeAreaDefinition;
  updateProfile: (updates: Partial<Omit<MonetizationProfile, 'schemaVersion' | 'createdAt'>>) => void;
  completeOnboarding: (data: {
    examDate: string | null;
    examDateDecided: boolean;
    targetLevel: TargetSpaLevel;
    dailyStudyMinutes: DailyStudyMinutes;
  }) => void;
  resetOnboarding: () => void;
}

export function useDDayOnboarding(): UseDDayOnboardingReturn {
  const [profile, setProfile] = useState<MonetizationProfile>(() => loadMonetizationProfile());

  const daysUntilExam = useMemo(() => {
    if (!profile.examDateDecided || !profile.examDate) return null;
    return calculateDaysUntilExam(profile.examDate);
  }, [profile.examDate, profile.examDateDecided]);

  const formattedDDay = useMemo(() => {
    return formatDDay(profile.examDateDecided, profile.examDate);
  }, [profile.examDate, profile.examDateDecided]);

  const recommendedArea = useMemo(() => {
    return getRecommendedPracticeArea(daysUntilExam, profile.targetLevel);
  }, [daysUntilExam, profile.targetLevel]);

  const updateProfile = useCallback(
    (updates: Partial<Omit<MonetizationProfile, 'schemaVersion' | 'createdAt'>>) => {
      setProfile((prev) => {
        const next: MonetizationProfile = {
          ...prev,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        saveMonetizationProfile(next);
        return next;
      });
    },
    []
  );

  const completeOnboarding = useCallback(
    (data: {
      examDate: string | null;
      examDateDecided: boolean;
      targetLevel: TargetSpaLevel;
      dailyStudyMinutes: DailyStudyMinutes;
    }) => {
      const now = new Date().toISOString();
      const updated: MonetizationProfile = {
        schemaVersion: 1,
        examDate: data.examDateDecided ? data.examDate : null,
        examDateDecided: data.examDateDecided,
        targetLevel: data.targetLevel,
        dailyStudyMinutes: data.dailyStudyMinutes,
        onboardingCompleted: true,
        createdAt: profile.createdAt || now,
        updatedAt: now,
      };
      setProfile(updated);
      saveMonetizationProfile(updated);
    },
    [profile.createdAt]
  );

  const resetOnboarding = useCallback(() => {
    const fresh: MonetizationProfile = {
      ...DEFAULT_MONETIZATION_PROFILE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProfile(fresh);
    saveMonetizationProfile(fresh);
  }, []);

  return {
    profile,
    daysUntilExam,
    formattedDDay,
    recommendedArea,
    updateProfile,
    completeOnboarding,
    resetOnboarding,
  };
}
