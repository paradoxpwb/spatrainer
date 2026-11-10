/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import {
  DEFAULT_DAILY_AI_FEEDBACK_LIMIT,
  DEFAULT_DAILY_PRACTICE_LIMIT,
  DailyUsage,
  STORAGE_KEY_DAILY_USAGE,
} from '../types/monetization';
import { getTodayLocalDateString } from '../utils/dDayUtils';

export const FREE_PRACTICE_LIMIT = DEFAULT_DAILY_PRACTICE_LIMIT;
export const FREE_AI_FEEDBACK_LIMIT = DEFAULT_DAILY_AI_FEEDBACK_LIMIT;
export const DAILY_USAGE_STORAGE_KEY = STORAGE_KEY_DAILY_USAGE;

/**
 * Creates an empty initial DailyUsage object for a given local date.
 */
function createInitialDailyUsage(dateStr: string = getTodayLocalDateString()): DailyUsage {
  return {
    schemaVersion: 1,
    localDate: dateStr,
    date: dateStr,
    completedPracticeIds: [],
    completedAttemptIds: [],
    aiFeedbackRequestIds: [],
    completedAiFeedbackIds: [],
    practiceCount: 0,
    practiceAttemptsCount: 0,
    aiFeedbackCount: 0,
  };
}

/**
 * Loads daily usage from localStorage safely.
 * If the record is missing, corrupted, or from a previous calendar day,
 * initializes a fresh record for today.
 */
export function loadDailyUsage(todayDateStr: string = getTodayLocalDateString()): DailyUsage {
  if (typeof window === 'undefined' || !window.localStorage) {
    return createInitialDailyUsage(todayDateStr);
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_DAILY_USAGE);
    if (!raw) return createInitialDailyUsage(todayDateStr);

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return createInitialDailyUsage(todayDateStr);
    }

    const storedDate = parsed.localDate || parsed.date;

    // Daily reset check: if stored date is different from today's local date, reset for today
    if (storedDate !== todayDateStr) {
      const fresh = createInitialDailyUsage(todayDateStr);
      saveDailyUsage(fresh);
      return fresh;
    }

    const completedPracticeIds = Array.isArray(parsed.completedPracticeIds)
      ? parsed.completedPracticeIds.filter((id: unknown): id is string => typeof id === 'string')
      : Array.isArray(parsed.completedAttemptIds)
      ? parsed.completedAttemptIds.filter((id: unknown): id is string => typeof id === 'string')
      : [];

    const aiFeedbackRequestIds = Array.isArray(parsed.aiFeedbackRequestIds)
      ? parsed.aiFeedbackRequestIds.filter((id: unknown): id is string => typeof id === 'string')
      : Array.isArray(parsed.completedAiFeedbackIds)
      ? parsed.completedAiFeedbackIds.filter((id: unknown): id is string => typeof id === 'string')
      : [];

    const practiceCount = typeof parsed.practiceCount === 'number'
      ? parsed.practiceCount
      : typeof parsed.practiceAttemptsCount === 'number'
      ? parsed.practiceAttemptsCount
      : completedPracticeIds.length;

    const aiFeedbackCount = typeof parsed.aiFeedbackCount === 'number'
      ? parsed.aiFeedbackCount
      : aiFeedbackRequestIds.length;

    return {
      schemaVersion: 1,
      localDate: todayDateStr,
      date: todayDateStr,
      completedPracticeIds,
      completedAttemptIds: completedPracticeIds,
      aiFeedbackRequestIds,
      completedAiFeedbackIds: aiFeedbackRequestIds,
      practiceCount,
      practiceAttemptsCount: practiceCount,
      aiFeedbackCount,
    };
  } catch {
    return createInitialDailyUsage(todayDateStr);
  }
}

/**
 * Saves daily usage to localStorage safely.
 */
export function saveDailyUsage(usage: DailyUsage): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    localStorage.setItem(STORAGE_KEY_DAILY_USAGE, JSON.stringify(usage));
  } catch {
    // ignore
  }
}

export interface UseDailyUsageLimitReturn {
  practiceLimit: number;
  aiFeedbackLimit: number;
  practiceCount: number;
  aiFeedbackCount: number;
  remainingPracticeCount: number;
  remainingAiFeedbackCount: number;
  hasReachedPracticeLimit: boolean;
  hasReachedAiFeedbackLimit: boolean;
  recordPracticeCompletion: (uniqueCompletionId: string) => boolean;
  recordPracticeAttempt: (uniqueCompletionId: string) => boolean;
  recordAiFeedbackRequest: (uniqueRequestId: string) => boolean;
  recordAiFeedback: (uniqueRequestId: string) => boolean;
  resetForTesting?: () => void;
}

/**
 * Hook for tracking free tier daily practice and AI usage limits.
 * Note: In Sprint 1, this is a non-blocking indicator and tracking tool for validation.
 */
export function useDailyUsageLimit(): UseDailyUsageLimitReturn {
  const [dailyUsage, setDailyUsage] = useState<DailyUsage>(() => loadDailyUsage());

  // Check for calendar day turnover on focus or interval
  useEffect(() => {
    const checkDateTurnover = () => {
      const today = getTodayLocalDateString();
      if (dailyUsage.localDate !== today) {
        const fresh = loadDailyUsage(today);
        setDailyUsage(fresh);
      }
    };

    window.addEventListener('focus', checkDateTurnover);
    return () => window.removeEventListener('focus', checkDateTurnover);
  }, [dailyUsage.localDate]);

  const practiceLimit = DEFAULT_DAILY_PRACTICE_LIMIT;
  const aiFeedbackLimit = DEFAULT_DAILY_AI_FEEDBACK_LIMIT;

  const practiceCount = dailyUsage.practiceCount;
  const aiFeedbackCount = dailyUsage.aiFeedbackCount;

  const remainingPracticeCount = Math.max(0, practiceLimit - practiceCount);
  const remainingAiFeedbackCount = Math.max(0, aiFeedbackLimit - aiFeedbackCount);

  const hasReachedPracticeLimit = practiceCount >= practiceLimit;
  const hasReachedAiFeedbackLimit = aiFeedbackCount >= aiFeedbackLimit;

  const recordPracticeCompletion = useCallback((uniqueCompletionId: string): boolean => {
    if (!uniqueCompletionId || typeof uniqueCompletionId !== 'string') return false;

    const today = getTodayLocalDateString();
    let updated = false;

    setDailyUsage((prev) => {
      // If date turned over, reset first
      const current = prev.localDate === today ? prev : createInitialDailyUsage(today);

      if (current.completedPracticeIds.includes(uniqueCompletionId)) {
        return current; // Deduplicated: already recorded
      }

      updated = true;
      const next: DailyUsage = {
        ...current,
        completedPracticeIds: [...current.completedPracticeIds, uniqueCompletionId],
        practiceCount: current.completedPracticeIds.length + 1,
      };
      saveDailyUsage(next);
      return next;
    });

    return updated;
  }, []);

  const recordAiFeedbackRequest = useCallback((uniqueRequestId: string): boolean => {
    if (!uniqueRequestId || typeof uniqueRequestId !== 'string') return false;

    const today = getTodayLocalDateString();
    let updated = false;

    setDailyUsage((prev) => {
      const current = prev.localDate === today ? prev : createInitialDailyUsage(today);

      if (current.aiFeedbackRequestIds.includes(uniqueRequestId)) {
        return current; // Deduplicated: already recorded
      }

      updated = true;
      const next: DailyUsage = {
        ...current,
        aiFeedbackRequestIds: [...current.aiFeedbackRequestIds, uniqueRequestId],
        aiFeedbackCount: current.aiFeedbackRequestIds.length + 1,
      };
      saveDailyUsage(next);
      return next;
    });

    return updated;
  }, []);

  const resetForTesting = useCallback(() => {
    const today = getTodayLocalDateString();
    const fresh = createInitialDailyUsage(today);
    setDailyUsage(fresh);
    saveDailyUsage(fresh);
  }, []);

  return {
    practiceLimit,
    aiFeedbackLimit,
    practiceCount,
    aiFeedbackCount,
    remainingPracticeCount,
    remainingAiFeedbackCount,
    hasReachedPracticeLimit,
    hasReachedAiFeedbackLimit,
    recordPracticeCompletion,
    recordPracticeAttempt: recordPracticeCompletion,
    recordAiFeedbackRequest,
    recordAiFeedback: recordAiFeedbackRequest,
    resetForTesting,
  };
}
