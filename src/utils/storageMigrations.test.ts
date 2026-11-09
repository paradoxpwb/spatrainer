import { describe, it, expect, beforeEach } from 'vitest';
import {
  migrateStorageToV4,
  CURRENT_STORAGE_VERSION,
  STORAGE_KEY_V4,
  LEGACY_STORAGE_KEY_V1,
} from './storageMigrations';
import { PracticeAttempt } from '../types/practiceAttempt';

// In-memory mock for localStorage in Node.js test environment
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

if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = mockLocalStorage;
}

describe('storageMigrations', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('migrates legacy Sprint 2/3 practice history into V4 schema', () => {
    const legacyAttempts: PracticeAttempt[] = [
      {
        id: 'legacy-1',
        questionId: 'q-work-1',
        category: 'work',
        categoryLabel: '업무',
        question: 'Tell me about a challenging project.',
        recordedAt: '2026-10-30T09:00:00.000Z',
        recordingDurationSeconds: 40,
        originalTranscript: 'I managed a cross functional project.',
        editedTranscript: 'I managed a cross functional project.',
        metrics: {
          recordingDurationSeconds: 40,
          totalWords: 50,
          wordsPerMinute: 110,
          sentenceCount: 2,
          averageWordsPerSentence: 25,
          uniqueWordCount: 35,
          lexicalDiversity: 0.7,
          fillerCounts: { um: 1 },
          totalFillerCount: 1,
          fillerRatePer100Words: 2.0,
          repeatedWords: [],
          repeatedPhrases: [],
          responseLengthStatus: 'balanced',
        },
        transcriptionStatus: 'completed',
      },
    ];

    localStorage.setItem(LEGACY_STORAGE_KEY_V1, JSON.stringify(legacyAttempts));

    const migrated = migrateStorageToV4();

    expect(migrated.schemaVersion).toBe(CURRENT_STORAGE_VERSION);
    expect(migrated.attempts.length).toBe(1);
    expect(migrated.attempts[0].id).toBe('legacy-1');
    expect(migrated.attempts[0].sessionId).toBeTruthy();
    expect(migrated.attempts[0].attemptNumber).toBe(1);
    expect(migrated.sessions.length).toBe(1);
    expect(migrated.sessions[0].id).toBe(migrated.attempts[0].sessionId);
    expect(migrated.goals.length).toBe(3);
    expect(migrated.preferences).toBeDefined();

    // Verify stored in localStorage V4 key
    const rawV4 = localStorage.getItem(STORAGE_KEY_V4);
    expect(rawV4).not.toBeNull();
  });

  it('handles corrupted JSON gracefully by returning valid initial V4 state', () => {
    localStorage.setItem(STORAGE_KEY_V4, 'INVALID_JSON_{{[{');

    const result = migrateStorageToV4();

    expect(result.schemaVersion).toBe(CURRENT_STORAGE_VERSION);
    expect(Array.isArray(result.sessions)).toBe(true);
    expect(Array.isArray(result.attempts)).toBe(true);
    expect(Array.isArray(result.goals)).toBe(true);
    expect(result.goals.length).toBe(3);
    expect(result.preferences.feedbackLanguage).toBe('ko');
  });

  it('preserves existing V4 data without overwriting', () => {
    const existingV4 = {
      version: 4,
      sessions: [
        {
          id: 'sess-existing',
          questionId: 'q-1',
          question: 'Sample question',
          category: 'work',
          categoryLabel: '업무',
          difficulty: 'basic',
          targetDurationSeconds: 60,
          prepDurationSeconds: 15,
          startedAt: '2026-11-01T12:00:00.000Z',
          lastUpdatedAt: '2026-11-01T12:05:00.000Z',
          status: 'completed',
          attemptCount: 1,
          attemptIds: ['a-1'],
        },
      ],
      attempts: [],
      goals: [],
      preferences: {
        feedbackLanguage: 'en',
        targetLevel: 'Level 7',
        desiredAnswerLevel: 'Level 7',
        activePeriodFilter: '7d',
      },
    };

    localStorage.setItem(STORAGE_KEY_V4, JSON.stringify(existingV4));

    const result = migrateStorageToV4();
    expect(result.sessions.length).toBe(1);
    expect(result.sessions[0].id).toBe('sess-existing');
    expect(result.preferences.feedbackLanguage).toBe('en');
  });
});
