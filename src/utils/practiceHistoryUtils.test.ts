import { beforeEach, describe, expect, it } from 'vitest';
import { clearPracticeHistory, loadPracticeHistory, savePracticeAttempt } from './practiceHistoryUtils';
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

// Polyfill global localStorage for the test runner if undefined
if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = mockLocalStorage;
}

const mockAttempt = (id: string): PracticeAttempt => ({
  id,
  questionId: 'q-1',
  category: 'work',
  categoryLabel: '직장생활',
  question: 'Describe your workspace.',
  recordedAt: new Date().toISOString(),
  recordingDurationSeconds: 45,
  originalTranscript: 'I work in a nice office.',
  editedTranscript: 'I work in a nice office.',
  transcriptionStatus: 'completed',
  metrics: {
    recordingDurationSeconds: 45,
    totalWords: 6,
    wordsPerMinute: 8,
    sentenceCount: 1,
    averageWordsPerSentence: 6,
    uniqueWordCount: 6,
    lexicalDiversity: 1,
    fillerCounts: {},
    totalFillerCount: 0,
    fillerRatePer100Words: 0,
    repeatedWords: [],
    repeatedPhrases: [],
    responseLengthStatus: 'balanced',
  },
});

describe('practiceHistoryUtils', () => {
  beforeEach(() => {
    clearPracticeHistory();
  });

  it('safely recovers to empty array when localStorage contains corrupted JSON', () => {
    localStorage.setItem('spa_practice_history_v1', '{corrupted_malformed_json_here!!');
    const result = loadPracticeHistory();
    expect(result).toEqual([]);
  });

  it('limits history to max 20 items (prunes oldest 21st)', () => {
    for (let i = 1; i <= 25; i++) {
      savePracticeAttempt(mockAttempt(`attempt-${i}`));
    }
    const history = loadPracticeHistory();
    expect(history.length).toBe(20);
    // attempt-25 should be the most recent at index 0
    expect(history[0].id).toBe('attempt-25');
  });
});
