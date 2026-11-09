import { beforeEach, describe, expect, it } from 'vitest';
import {
  generateCoachingCacheKey,
  normalizeTranscriptForComparison,
} from './transcriptHash';
import { coachingCache } from './coachingCache';
import { clearPracticeHistory, loadPracticeHistory, savePracticeAttempt } from './practiceHistoryUtils';
import { PracticeAttempt } from '../types/practiceAttempt';
import { AICoachingResult } from '../types/coaching';

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

const mockSampleCoachingResult: AICoachingResult = {
  version: 'v1',
  feedbackLanguage: 'ko',
  desiredAnswerLevel: 'one-step-better',
  overallSummary: '전반적으로 명확한 답변입니다.',
  relevance: {
    rating: 'effective',
    explanation: '질문에 잘 답했습니다.',
    answeredMainQuestion: true,
    missingElements: [],
    evidence: [{ quotedText: 'I prefer morning meetings.', explanation: '질문 직답' }],
  },
  structure: {
    rating: 'developing',
    explanation: '결론 부재',
    hasOpening: true,
    hasSupportingDetails: true,
    hasExample: false,
    hasConclusion: false,
    evidence: [],
  },
  strengths: [{ title: '명확한 전달', explanation: '단순하고 직접적' }],
  priorityImprovements: [
    { priority: 1, title: '예시 추가', explanation: '구체적 일화 필요', action: '구체적 상황 설명' },
  ],
  grammarCorrections: [
    { original: 'I goes', corrected: 'I go', explanation: '주어 일치', category: 'agreement' },
  ],
  expressionImprovements: [
    { original: 'It is good', improved: 'It is advantageous', explanation: '비즈니스 어휘' },
  ],
  answerOutline: [
    { order: 1, label: '도입', guidance: '의견 제시', exampleStarter: 'Personally, I believe...' },
  ],
  improvedAnswer: 'Personally, I believe morning meetings are far more productive.',
  usefulExpressions: ['in terms of efficiency', 'on a daily basis'],
  retryChecklist: [
    { id: 'chk-1', instruction: '구체적인 사례 하나를 추가하여 발화하기' },
    { id: 'chk-2', instruction: '첫 문장에서 질문에 대한 직접적인 결론 제시하기' },
    { id: 'chk-3', instruction: 'filler word(uh, um) 대신 1초간 호흡하며 말하기' },
  ],
  limitations: ['발음 평가는 포함되지 않습니다.'],
};

describe('Sprint 3 Coaching Utilities', () => {
  describe('normalizeTranscriptForComparison', () => {
    it('collapses multiple whitespace and converts to lowercase', () => {
      const a = '  Hello,   world!  How are you? ';
      const b = 'hello, world! how are you?';
      expect(normalizeTranscriptForComparison(a)).toBe(b);
    });

    it('returns empty string for nullish or empty inputs', () => {
      expect(normalizeTranscriptForComparison('')).toBe('');
      expect(normalizeTranscriptForComparison('   ')).toBe('');
    });
  });

  describe('generateCoachingCacheKey', () => {
    it('generates identical cache keys for transcripts differing only by whitespace and casing', () => {
      const key1 = generateCoachingCacheKey({
        questionId: 'q-1',
        transcript: 'I prefer working from home because it saves time.',
        feedbackLanguage: 'ko',
        desiredAnswerLevel: 'one-step-better',
        promptVersion: 'v1',
      });
      const key2 = generateCoachingCacheKey({
        questionId: 'q-1',
        transcript: '   i prefer working from home because it saves time.   ',
        feedbackLanguage: 'ko',
        desiredAnswerLevel: 'one-step-better',
        promptVersion: 'v1',
      });
      expect(key1).toBe(key2);
    });

    it('generates different keys when target level or language changes', () => {
      const text = 'I prefer working from home because it saves time.';

      const keyKo = generateCoachingCacheKey({
        questionId: 'q-1',
        transcript: text,
        feedbackLanguage: 'ko',
        desiredAnswerLevel: 'one-step-better',
        promptVersion: 'v1',
      });
      const keyEn = generateCoachingCacheKey({
        questionId: 'q-1',
        transcript: text,
        feedbackLanguage: 'en',
        desiredAnswerLevel: 'one-step-better',
        promptVersion: 'v1',
      });
      const keyChallenging = generateCoachingCacheKey({
        questionId: 'q-1',
        transcript: text,
        feedbackLanguage: 'ko',
        desiredAnswerLevel: 'challenging',
        promptVersion: 'v1',
      });

      expect(keyKo).not.toBe(keyEn);
      expect(keyKo).not.toBe(keyChallenging);
    });
  });

  describe('coachingCache', () => {
    it('stores and retrieves cached coaching results', () => {
      const key = 'test-cache-key-1';
      coachingCache.set(key, mockSampleCoachingResult);

      const retrieved = coachingCache.get(key);
      expect(retrieved).toEqual(mockSampleCoachingResult);
    });

    it('returns null for nonexistent keys', () => {
      expect(coachingCache.get('nonexistent-key-xyz')).toBeNull();
    });
  });

  describe('PracticeHistory backward compatibility', () => {
    beforeEach(() => {
      clearPracticeHistory();
    });

    it('loads legacy attempts where aiCoaching is omitted without errors', () => {
      const legacyAttempt: PracticeAttempt = {
        id: 'legacy-attempt-1',
        questionId: 'q-legacy',
        category: 'daily',
        categoryLabel: '일상생활',
        question: 'What do you like to do on weekends?',
        recordedAt: '2026-10-10T00:00:00.000Z',
        recordingDurationSeconds: 40,
        originalTranscript: 'I like reading books on weekends.',
        editedTranscript: 'I like reading books on weekends.',
        transcriptionStatus: 'completed',
        metrics: {
          recordingDurationSeconds: 40,
          totalWords: 6,
          wordsPerMinute: 9,
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
        // aiCoaching is intentionally undefined (Sprint 2 format)
      };

      savePracticeAttempt(legacyAttempt);

      const loaded = loadPracticeHistory();
      expect(loaded.length).toBe(1);
      expect(loaded[0].id).toBe('legacy-attempt-1');
      expect(loaded[0].aiCoaching).toBeUndefined();
    });

    it('stores and re-reads attempts with full aiCoaching payload', () => {
      const modernAttempt: PracticeAttempt = {
        id: 'modern-attempt-1',
        questionId: 'q-modern',
        category: 'work',
        categoryLabel: '직장생활',
        question: 'Explain how you handle tight project deadlines.',
        recordedAt: '2026-11-04T12:00:00.000Z',
        recordingDurationSeconds: 45,
        originalTranscript: 'I prioritize tasks and communicate with my team.',
        editedTranscript: 'I prioritize tasks and communicate with my team.',
        transcriptionStatus: 'completed',
        metrics: {
          recordingDurationSeconds: 45,
          totalWords: 8,
          wordsPerMinute: 11,
          sentenceCount: 1,
          averageWordsPerSentence: 8,
          uniqueWordCount: 8,
          lexicalDiversity: 1,
          fillerCounts: {},
          totalFillerCount: 0,
          fillerRatePer100Words: 0,
          repeatedWords: [],
          repeatedPhrases: [],
          responseLengthStatus: 'balanced',
        },
        aiCoaching: {
          status: 'completed',
          promptVersion: 'v1',
          transcriptHash: 'abc123hash',
          feedbackLanguage: 'ko',
          desiredAnswerLevel: 'one-step-better',
          generatedAt: '2026-11-04T12:00:15.000Z',
          result: mockSampleCoachingResult,
        },
      };

      savePracticeAttempt(modernAttempt);

      const loaded = loadPracticeHistory();
      expect(loaded.length).toBe(1);
      expect(loaded[0].aiCoaching).toBeDefined();
      expect(loaded[0].aiCoaching?.result?.overallSummary).toBe('전반적으로 명확한 답변입니다.');
    });
  });
});
