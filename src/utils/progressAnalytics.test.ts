import { describe, it, expect } from 'vitest';
import {
  calculateStreak,
  calculateGoalProgress,
  filterAttemptsByPeriod,
  calculateCategoryProgress,
  calculateCategoryStats,
  generateRecommendations,
  calculateProgressSummary,
  filterAndSortSessions,
  deleteSessionData,
  exportPracticeData,
} from './progressAnalytics';
import { PracticeAttempt } from '../types/practiceAttempt';
import { PracticeSession, StoredPracticeData } from '../types/practiceSession';
import { PracticeGoal } from '../types/goals';

describe('progressAnalytics comprehensive tests', () => {
  const makeAttempt = (
    id: string,
    isoDate: string,
    category: string,
    retryNumber = 1,
    duration = 45,
    wpm = 110,
    fillerRate = 3.3,
    sessionId?: string
  ): PracticeAttempt => ({
    id,
    sessionId: sessionId || `session-${id}`,
    attemptNumber: retryNumber,
    questionId: `q-${category}-1`,
    category,
    categoryLabel: category,
    question: 'Sample practice question',
    recordedAt: isoDate,
    recordingDurationSeconds: duration,
    originalTranscript: 'Sample answer for testing metrics and progress.',
    editedTranscript: 'Sample answer for testing metrics and progress.',
    metrics: {
      recordingDurationSeconds: duration,
      totalWords: 60,
      wordsPerMinute: wpm,
      sentenceCount: 3,
      averageWordsPerSentence: 20,
      uniqueWordCount: 40,
      lexicalDiversity: 0.66,
      fillerCounts: { um: 2 },
      totalFillerCount: 2,
      fillerRatePer100Words: fillerRate,
      repeatedWords: [],
      repeatedPhrases: [],
      responseLengthStatus: 'balanced',
    },
    transcriptionStatus: 'completed',
  });

  const makeSession = (
    id: string,
    category: string,
    attemptIds: string[],
    createdAt: string
  ): PracticeSession => ({
    id,
    questionId: `q-${category}-1`,
    question: `Sample question for ${category}`,
    category,
    categoryLabel: category,
    difficulty: 'basic',
    createdAt,
    updatedAt: createdAt,
    attemptIds,
    originalAttemptId: attemptIds[0] || '',
    latestAttemptId: attemptIds[attemptIds.length - 1] || '',
    status: 'completed',
  });

  /* ----------------------------------------------------
   * A. Period Filter
   * ---------------------------------------------------- */
  describe('A. filterAttemptsByPeriod', () => {
    it('filters attempts by 7d, 30d, and all correctly', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      const twentyDaysAgo = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const attempts = [
        makeAttempt('a1', oneHourAgo.toISOString(), 'work'),
        makeAttempt('a2', threeDaysAgo.toISOString(), 'work'),
        makeAttempt('a3', twentyDaysAgo.toISOString(), 'work'),
        makeAttempt('a4', sixtyDaysAgo.toISOString(), 'work'),
      ];

      expect(filterAttemptsByPeriod(attempts, '7d').length).toBe(2);
      expect(filterAttemptsByPeriod(attempts, '30d').length).toBe(3);
      expect(filterAttemptsByPeriod(attempts, 'all').length).toBe(4);
    });

    it('excludes invalid dates and future dates', () => {
      const now = new Date();
      const validDate = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
      const futureDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString();
      const invalidDate = 'NOT_A_REAL_DATE';

      const attempts = [
        makeAttempt('a1', validDate, 'work'),
        makeAttempt('a2', futureDate, 'work'),
        makeAttempt('a3', invalidDate, 'work'),
      ];

      const filtered = filterAttemptsByPeriod(attempts, 'all');
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('a1');
    });
  });

  /* ----------------------------------------------------
   * B. Progress Summary
   * ---------------------------------------------------- */
  describe('B. calculateProgressSummary', () => {
    it('returns safe null values and 0 counts for empty history', () => {
      const summary = calculateProgressSummary([], [], '7d');
      expect(summary.totalAttempts).toBe(0);
      expect(summary.completedSessions).toBe(0);
      expect(summary.retryCount).toBe(0);
      expect(summary.practiceDays).toBe(0);
      expect(summary.totalRecordingSeconds).toBe(0);
      expect(summary.averageRecordingSeconds).toBeNull();
      expect(summary.averageWordsPerMinute).toBeNull();
      expect(summary.averageFillerRate).toBeNull();
    });

    it('excludes 0-second or negative duration recordings from duration average', () => {
      const now = new Date().toISOString();
      const attempts = [
        makeAttempt('a1', now, 'work', 1, 40, 120, 2.0),
        makeAttempt('a2', now, 'work', 2, 0, 100, 3.0), // 0 seconds
        makeAttempt('a3', now, 'work', 3, -10, 110, 1.0), // negative
      ];

      const summary = calculateProgressSummary(attempts, [], 'all');
      expect(summary.totalAttempts).toBe(3);
      expect(summary.totalRecordingSeconds).toBe(40);
      expect(summary.averageRecordingSeconds).toBe(40);
      expect(summary.validDurationSampleCount).toBe(1);
    });

    it('correctly calculates completedSessions without duplicate counts', () => {
      const now = new Date().toISOString();
      const a1 = makeAttempt('a1', now, 'work', 1, 45, 110, 3.0, 'session-1');
      const a2 = makeAttempt('a2', now, 'work', 2, 45, 110, 3.0, 'session-1');
      const a3 = makeAttempt('a3', now, 'daily-life', 1, 45, 110, 3.0, 'session-2');

      const s1 = makeSession('session-1', 'work', ['a1', 'a2'], now);
      const s2 = makeSession('session-2', 'daily-life', ['a3'], now);
      const s3Abandoned = {
        ...makeSession('session-3', 'opinion', [], now),
        status: 'abandoned' as const,
      };

      const summary = calculateProgressSummary([a1, a2, a3], [s1, s2, s3Abandoned], 'all');
      expect(summary.totalAttempts).toBe(3);
      expect(summary.completedSessions).toBe(2); // session-1 and session-2, abandoned excluded
      expect(summary.retryCount).toBe(1); // a2 is retry (attemptNumber: 2)
    });
  });

  /* ----------------------------------------------------
   * C. Category Stats
   * ---------------------------------------------------- */
  describe('C. calculateCategoryStats', () => {
    it('returns all 8 categories including unpracticed with null averages', () => {
      const now = new Date().toISOString();
      const attempts = [makeAttempt('a1', now, 'work', 1, 60, 130, 2.5)];

      const stats = calculateCategoryStats(attempts);
      expect(stats.length).toBe(8);

      const workCat = stats.find((c) => c.category === 'work');
      expect(workCat?.attemptCount).toBe(1);
      expect(workCat?.averageWordsPerMinute).toBe(130);
      expect(workCat?.lastPracticedAt).toBe(now);

      const unpracticed = stats.find((c) => c.category === 'self-introduction');
      expect(unpracticed).toBeDefined();
      expect(unpracticed?.attemptCount).toBe(0);
      expect(unpracticed?.lastPracticedAt).toBeNull();
      expect(unpracticed?.averageRecordingSeconds).toBeNull();
      expect(unpracticed?.averageWordsPerMinute).toBeNull();
      expect(unpracticed?.averageFillerRate).toBeNull();
    });
  });

  /* ----------------------------------------------------
   * D. Streak Calculation
   * ---------------------------------------------------- */
  describe('D. calculateStreak', () => {
    it('returns 0 streaks for empty attempts', () => {
      const streak = calculateStreak([]);
      expect(streak.currentStreak).toBe(0);
      expect(streak.longestStreak).toBe(0);
      expect(streak.practiceDates).toEqual([]);
      expect(streak.lastPracticedDate).toBeNull();
    });

    it('counts multiple attempts on the same day as 1 day in streak', () => {
      const todayIso = new Date().toISOString();
      const attempts = [
        makeAttempt('a1', todayIso, 'work'),
        makeAttempt('a2', todayIso, 'daily-life'),
        makeAttempt('a3', todayIso, 'opinion'),
      ];

      const streak = calculateStreak(attempts);
      expect(streak.currentStreak).toBe(1);
      expect(streak.practiceDates.length).toBe(1);
    });

    it('calculates consecutive active days up to today', () => {
      const now = new Date();
      const today = new Date(now.getTime() - 1000);
      const yesterday = new Date(now.getTime() - 25 * 60 * 60 * 1000);
      const twoDaysAgo = new Date(now.getTime() - 49 * 60 * 60 * 1000);

      const attempts = [
        makeAttempt('a1', twoDaysAgo.toISOString(), 'work'),
        makeAttempt('a2', yesterday.toISOString(), 'daily-life'),
        makeAttempt('a3', today.toISOString(), 'opinion'),
      ];

      const streak = calculateStreak(attempts);
      expect(streak.currentStreak).toBe(3);
      expect(streak.longestStreak).toBe(3);
    });

    it('maintains streak if user practiced yesterday but not yet today', () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 25 * 60 * 60 * 1000);
      const twoDaysAgo = new Date(now.getTime() - 49 * 60 * 60 * 1000);

      const attempts = [
        makeAttempt('a1', twoDaysAgo.toISOString(), 'work'),
        makeAttempt('a2', yesterday.toISOString(), 'daily-life'),
      ];

      const streak = calculateStreak(attempts);
      expect(streak.currentStreak).toBe(2);
    });

    it('resets current streak when a day is missing', () => {
      const now = new Date();
      const today = new Date(now.getTime() - 1000);
      const fourDaysAgo = new Date(now.getTime() - 97 * 60 * 60 * 1000);
      const fiveDaysAgo = new Date(now.getTime() - 121 * 60 * 60 * 1000);

      const attempts = [
        makeAttempt('a1', fiveDaysAgo.toISOString(), 'work'),
        makeAttempt('a2', fourDaysAgo.toISOString(), 'daily-life'),
        makeAttempt('a3', today.toISOString(), 'opinion'),
      ];

      const streak = calculateStreak(attempts);
      expect(streak.currentStreak).toBe(1);
      expect(streak.longestStreak).toBe(2);
    });
  });

  /* ----------------------------------------------------
   * E. Goal Progress
   * ---------------------------------------------------- */
  describe('E. calculateGoalProgress', () => {
    it('correctly tracks under, reached, and exceeded goals without crashing on 0', () => {
      const todayIso = new Date().toISOString();
      const attempts = [
        makeAttempt('a1', todayIso, 'work', 1),
        makeAttempt('a2', todayIso, 'work', 2),
        makeAttempt('a3', todayIso, 'work', 3),
      ];

      const goals: PracticeGoal[] = [
        {
          id: 'g-attempts',
          type: 'weekly-attempts',
          targetValue: 2,
          currentValue: 0,
          unit: '회',
          label: '주간 연습 횟수',
          active: true,
          period: 'weekly',
          createdAt: todayIso,
          updatedAt: todayIso,
        },
        {
          id: 'g-retries',
          type: 'weekly-retries',
          targetValue: 5,
          currentValue: 0,
          unit: '회',
          label: '주간 재도전',
          active: true,
          period: 'weekly',
          createdAt: todayIso,
          updatedAt: todayIso,
        },
      ];

      const evaluated = calculateGoalProgress(goals, attempts, []);
      expect(evaluated[0].currentValue).toBe(3); // exceeded (3 > 2)
      expect(evaluated[1].currentValue).toBe(2); // under (2 < 5)
    });
  });

  /* ----------------------------------------------------
   * F. Recommendation Engine
   * ---------------------------------------------------- */
  describe('F. generateRecommendations', () => {
    it('returns intro recommendation when no attempts exist', () => {
      const recs = generateRecommendations([], [], []);
      expect(recs.length).toBe(1);
      expect(recs[0].actionType).toBe('category');
      expect(recs[0].targetCategoryId).toBe('self-introduction');
    });

    it('generates at most 3 prioritized recommendations with valid labels', () => {
      const attempts = [makeAttempt('a1', new Date().toISOString(), 'work', 1)];
      const categories = calculateCategoryProgress(attempts);
      const recs = generateRecommendations(attempts, [], categories);

      expect(recs.length).toBeLessThanOrEqual(3);
      recs.forEach((rec) => {
        expect(rec.title).toBeTruthy();
        expect(rec.actionLabel).toBeTruthy();
      });
    });
  });

  /* ----------------------------------------------------
   * G. History Filter and Sort
   * ---------------------------------------------------- */
  describe('G. filterAndSortSessions', () => {
    it('filters sessions by category, retry, and coaching', () => {
      const now = new Date();
      const s1 = makeSession('s1', 'work', ['a1', 'a2'], now.toISOString());
      const s2 = makeSession('s2', 'opinion', ['a3'], now.toISOString());

      const a1 = makeAttempt('a1', now.toISOString(), 'work', 1, 45, 110, 3.3, 's1');
      const a2 = makeAttempt('a2', now.toISOString(), 'work', 2, 45, 110, 3.3, 's1');
      const a3 = makeAttempt('a3', now.toISOString(), 'opinion', 1, 45, 110, 3.3, 's2');
      a1.aiCoaching = {
        status: 'completed',
        promptVersion: 'v1',
        transcriptHash: 'h1',
        feedbackLanguage: 'ko',
        desiredAnswerLevel: 'one-step-better',
      };

      // 1. Category filter
      const catFiltered = filterAndSortSessions([s1, s2], [a1, a2, a3], {
        period: 'all',
        categoryId: 'work',
        hasRetryOnly: false,
        hasCoachingOnly: false,
        sortBy: 'latest',
      });
      expect(catFiltered.length).toBe(1);
      expect(catFiltered[0].id).toBe('s1');

      // 2. Retry only filter
      const retryFiltered = filterAndSortSessions([s1, s2], [a1, a2, a3], {
        period: 'all',
        categoryId: 'all',
        hasRetryOnly: true,
        hasCoachingOnly: false,
        sortBy: 'latest',
      });
      expect(retryFiltered.length).toBe(1);
      expect(retryFiltered[0].id).toBe('s1');

      // 3. Coaching only filter
      const coachingFiltered = filterAndSortSessions([s1, s2], [a1, a2, a3], {
        period: 'all',
        categoryId: 'all',
        hasRetryOnly: false,
        hasCoachingOnly: true,
        sortBy: 'latest',
      });
      expect(coachingFiltered.length).toBe(1);
      expect(coachingFiltered[0].id).toBe('s1');
    });
  });

  /* ----------------------------------------------------
   * H. Delete Session
   * ---------------------------------------------------- */
  describe('H. deleteSessionData', () => {
    it('removes target session and its attempts while keeping other data intact', () => {
      const s1 = makeSession('s1', 'work', ['a1'], new Date().toISOString());
      const s2 = makeSession('s2', 'opinion', ['a2'], new Date().toISOString());
      const a1 = makeAttempt('a1', new Date().toISOString(), 'work', 1, 45, 110, 3.3, 's1');
      const a2 = makeAttempt('a2', new Date().toISOString(), 'opinion', 1, 45, 110, 3.3, 's2');

      const initialData: StoredPracticeData = {
        schemaVersion: 4,
        sessions: [s1, s2],
        attempts: [a1, a2],
        goals: [],
        preferences: {
          defaultPeriod: '7d',
          showTrendCharts: true,
          feedbackLanguage: 'ko',
          desiredAnswerLevel: 'one-step-better',
          activePeriodFilter: '7d',
        },
      };

      const updated = deleteSessionData(initialData, 's1');
      expect(updated.sessions.length).toBe(1);
      expect(updated.sessions[0].id).toBe('s2');
      expect(updated.attempts.length).toBe(1);
      expect(updated.attempts[0].id).toBe('a2');
    });
  });

  /* ----------------------------------------------------
   * I. Export Practice Data
   * ---------------------------------------------------- */
  describe('I. exportPracticeData', () => {
    it('includes schemaVersion, exportedAt, sessions, and attempts without audio or keys', () => {
      const s1 = makeSession('s1', 'work', ['a1'], new Date().toISOString());
      const a1 = makeAttempt('a1', new Date().toISOString(), 'work');

      const data: StoredPracticeData = {
        schemaVersion: 4,
        sessions: [s1],
        attempts: [a1],
        goals: [],
        preferences: {
          defaultPeriod: '7d',
          showTrendCharts: true,
          feedbackLanguage: 'ko',
          desiredAnswerLevel: 'one-step-better',
          activePeriodFilter: '7d',
        },
      };

      const payload = exportPracticeData(data);
      expect(payload.schemaVersion).toBe(4);
      expect(payload.exportedAt).toBeTruthy();
      expect(payload.sessions.length).toBe(1);
      expect(payload.attempts.length).toBe(1);

      // Check that audioUrl or audioBlob are absent
      const aRaw = payload.attempts[0] as any;
      expect(aRaw.audioUrl).toBeUndefined();
      expect(aRaw.audioBlob).toBeUndefined();
    });
  });
});
