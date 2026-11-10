import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadDailyUsage,
  saveDailyUsage,
  DAILY_USAGE_STORAGE_KEY,
  FREE_PRACTICE_LIMIT,
  FREE_AI_FEEDBACK_LIMIT,
} from './useDailyUsageLimit';
import { DailyUsage } from '../types/monetization';
import { getTodayLocalDateString } from '../utils/dDayUtils';

const memoryStore: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => memoryStore[key] || null,
  setItem: (key: string, value: string) => {
    memoryStore[key] = value;
  },
  removeItem: (key: string) => {
    delete memoryStore[key];
  },
  clear: () => {
    for (const key of Object.keys(memoryStore)) {
      delete memoryStore[key];
    }
  },
};

if (typeof (globalThis as any).window === 'undefined') {
  (globalThis as any).window = globalThis;
}
(globalThis as any).window.localStorage = mockLocalStorage;
(globalThis as any).localStorage = mockLocalStorage;

describe('useDailyUsageLimit storage & calculations', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads fresh daily usage with 0 counts on first visit', () => {
    const usage = loadDailyUsage();
    expect(usage.date).toBe(getTodayLocalDateString());
    expect(usage.practiceAttemptsCount).toBe(0);
    expect(usage.aiFeedbackCount).toBe(0);
    expect(usage.completedAttemptIds).toEqual([]);
    expect(usage.completedAiFeedbackIds).toEqual([]);
  });

  it('resets usage if stored date is from a previous calendar day', () => {
    const yesterdayUsage: DailyUsage = {
      schemaVersion: 1,
      localDate: '2026-11-01',
      date: '2026-11-01',
      practiceCount: 3,
      practiceAttemptsCount: 3,
      aiFeedbackCount: 1,
      completedPracticeIds: ['att-1', 'att-2', 'att-3'],
      completedAttemptIds: ['att-1', 'att-2', 'att-3'],
      aiFeedbackRequestIds: ['coach-1'],
      completedAiFeedbackIds: ['coach-1'],
    };
    saveDailyUsage(yesterdayUsage);

    const fresh = loadDailyUsage();
    expect(fresh.date).toBe(getTodayLocalDateString());
    expect(fresh.practiceAttemptsCount).toBe(0);
    expect(fresh.aiFeedbackCount).toBe(0);
    expect(fresh.completedAttemptIds).toEqual([]);
    expect(fresh.completedAiFeedbackIds).toEqual([]);
  });

  it('persists today usage accurately', () => {
    const today = getTodayLocalDateString();
    const currentUsage: DailyUsage = {
      schemaVersion: 1,
      localDate: today,
      date: today,
      practiceCount: 2,
      practiceAttemptsCount: 2,
      aiFeedbackCount: 1,
      completedPracticeIds: ['att-1', 'att-2'],
      completedAttemptIds: ['att-1', 'att-2'],
      aiFeedbackRequestIds: ['coach-1'],
      completedAiFeedbackIds: ['coach-1'],
    };
    saveDailyUsage(currentUsage);

    const loaded = loadDailyUsage();
    expect(loaded.date).toBe(today);
    expect(loaded.practiceAttemptsCount).toBe(2);
    expect(loaded.aiFeedbackCount).toBe(1);
    expect(loaded.completedAttemptIds).toEqual(['att-1', 'att-2']);
  });

  it('limits are correctly defined (3 practices, 1 AI feedback)', () => {
    expect(FREE_PRACTICE_LIMIT).toBe(3);
    expect(FREE_AI_FEEDBACK_LIMIT).toBe(1);
  });

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem(DAILY_USAGE_STORAGE_KEY, 'corrupted_json');
    const usage = loadDailyUsage();
    expect(usage.date).toBe(getTodayLocalDateString());
    expect(usage.practiceAttemptsCount).toBe(0);
    expect(usage.aiFeedbackCount).toBe(0);
  });
});
