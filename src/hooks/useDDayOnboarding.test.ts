import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadMonetizationProfile,
  saveMonetizationProfile,
  parseStoredProfile,
  MONETIZATION_PROFILE_STORAGE_KEY,
} from './useDDayOnboarding';
import { DEFAULT_MONETIZATION_PROFILE, MonetizationProfile } from '../types/monetization';

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

describe('useDDayOnboarding storage & logic', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads default profile when nothing is stored', () => {
    const profile = loadMonetizationProfile();
    expect(profile).toEqual(DEFAULT_MONETIZATION_PROFILE);
    expect(profile.targetLevel).toBe(DEFAULT_MONETIZATION_PROFILE.targetLevel);
    expect(profile.dailyStudyMinutes).toBe(20);
    expect(profile.examDate).toBeNull();
    expect(profile.isExamDateUndecided).toBe(true);
    expect(profile.onboardingCompleted).toBe(false);
  });

  it('saves and reloads a customized profile', () => {
    const updated: MonetizationProfile = {
      schemaVersion: 1,
      examDate: '2026-12-15',
      examDateDecided: true,
      isExamDateUndecided: false,
      targetLevel: 'level-5',
      dailyStudyMinutes: 30,
      onboardingCompleted: true,
      createdAt: '2026-11-10T00:00:00.000Z',
      updatedAt: '2026-11-10T00:00:00.000Z',
      lastUpdatedAt: '2026-11-10T00:00:00.000Z',
    };

    saveMonetizationProfile(updated);
    const loaded = loadMonetizationProfile();
    expect(loaded.examDate).toBe('2026-12-15');
    expect(loaded.isExamDateUndecided).toBe(false);
    expect(loaded.targetLevel).toBe('level-5');
    expect(loaded.dailyStudyMinutes).toBe(30);
    expect(loaded.onboardingCompleted).toBe(true);
  });

  it('parses stored profile and falls back for invalid properties', () => {
    const parsed = parseStoredProfile({
      examDate: '2026-11-20',
      targetLevel: 'invalid-level', // should fall back to not-sure
      dailyStudyMinutes: 999, // should fall back to 20
      onboardingCompleted: true,
    });

    expect(parsed.targetLevel).toBe(DEFAULT_MONETIZATION_PROFILE.targetLevel);
    expect(parsed.dailyStudyMinutes).toBe(20);
    expect(parsed.examDate).toBe('2026-11-20');
    expect(parsed.onboardingCompleted).toBe(true);
  });

  it('handles corrupted localStorage JSON gracefully', () => {
    localStorage.setItem(MONETIZATION_PROFILE_STORAGE_KEY, 'corrupted_json!@#$');
    const profile = loadMonetizationProfile();
    expect(profile).toEqual(DEFAULT_MONETIZATION_PROFILE);
  });
});
