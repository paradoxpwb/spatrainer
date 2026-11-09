import { describe, it, expect } from 'vitest';
import {
  createAttemptComparison,
  interpretMetricChange,
} from './attemptComparison';
import { compareTranscripts } from './transcriptComparison';
import { attachAttemptToSession, createPracticeSession } from './practiceHistoryUtils';
import { PracticeAttempt } from '../types/practiceAttempt';
import { SpeakingMetrics } from '../types/metrics';
import { PracticeSession } from '../types/practiceSession';

describe('attemptComparison', () => {
  const mockBaseMetrics: SpeakingMetrics = {
    recordingDurationSeconds: 30,
    totalWords: 50,
    wordsPerMinute: 100,
    sentenceCount: 2,
    averageWordsPerSentence: 25,
    uniqueWordCount: 30,
    lexicalDiversity: 0.6,
    fillerCounts: { um: 4, uh: 2 },
    totalFillerCount: 6,
    fillerRatePer100Words: 12.0,
    repeatedWords: [{ word: 'think', count: 3 }],
    repeatedPhrases: [],
    responseLengthStatus: 'balanced',
  };

  const mockAttempt1: PracticeAttempt = {
    id: 'attempt-1',
    sessionId: 'session-101',
    attemptNumber: 1,
    questionId: 'q-01',
    category: 'work',
    categoryLabel: '업무 및 비즈니스',
    question: 'How do you prioritize your daily tasks at work?',
    recordedAt: '2026-11-01T10:00:00.000Z',
    recordingDurationSeconds: 30,
    originalTranscript: 'Um I think I start my day by checking emails. Uh and then I make a todo list.',
    editedTranscript: 'Um I think I start my day by checking emails. Uh and then I make a todo list.',
    metrics: mockBaseMetrics,
    transcriptionStatus: 'completed',
  };

  const mockAttempt2Improved: PracticeAttempt = {
    id: 'attempt-2',
    sessionId: 'session-101',
    attemptNumber: 2,
    parentAttemptId: 'attempt-1',
    retrySource: 'feedback',
    questionId: 'q-01',
    category: 'work',
    categoryLabel: '업무 및 비즈니스',
    question: 'How do you prioritize your daily tasks at work?',
    recordedAt: '2026-11-01T10:08:00.000Z',
    recordingDurationSeconds: 38,
    originalTranscript:
      'First I prioritize urgent client requests before checking general emails. Furthermore I categorize tasks using an urgency and importance matrix so I can meet strict deadlines.',
    editedTranscript:
      'First I prioritize urgent client requests before checking general emails. Furthermore I categorize tasks using an urgency and importance matrix so I can meet strict deadlines.',
    metrics: {
      recordingDurationSeconds: 38,
      totalWords: 75,
      wordsPerMinute: 118,
      sentenceCount: 2,
      averageWordsPerSentence: 37.5,
      uniqueWordCount: 52,
      lexicalDiversity: 0.693,
      fillerCounts: { well: 1 },
      totalFillerCount: 1,
      fillerRatePer100Words: 1.33,
      repeatedWords: [],
      repeatedPhrases: [],
      responseLengthStatus: 'balanced',
    },
    transcriptionStatus: 'completed',
    retryContext: {
      mode: 'outline-only',
      checklistItems: [
        'Use transition words like First and Furthermore',
        'State urgent tasks priority explicitly',
        'Reduce filler words like um and uh',
      ],
    },
  };

  it('correctly calculates metric differences and pedagogical interpretations', () => {
    const comparison = createAttemptComparison(mockAttempt1, mockAttempt2Improved);

    // 1. Total words increased (improved)
    const wordsChange = comparison.metricChanges.find((m) => m.metric === 'total-words');
    expect(wordsChange).toBeDefined();
    expect(wordsChange!.absoluteChange).toBe(25);
    expect(wordsChange!.interpretation).toBe('improved');

    // 2. Filler rate decreased (improved)
    const fillerChange = comparison.metricChanges.find((m) => m.metric === 'filler-rate');
    expect(fillerChange).toBeDefined();
    expect(fillerChange!.absoluteChange).toBeLessThan(0);
    expect(fillerChange!.interpretation).toBe('improved');

    // 3. Lexical diversity increased (improved)
    const diversityChange = comparison.metricChanges.find((m) => m.metric === 'lexical-diversity');
    expect(diversityChange).toBeDefined();
    expect(diversityChange!.absoluteChange).toBeGreaterThan(0);
    expect(diversityChange!.interpretation).toBe('improved');

    // 4. Check that no metric percentage change is NaN or Infinity
    comparison.metricChanges.forEach((metric) => {
      if (metric.percentageChange !== null) {
        expect(Number.isFinite(metric.percentageChange)).toBe(true);
        expect(Number.isNaN(metric.percentageChange)).toBe(false);
      }
    });
  });

  it('handles zero base values gracefully without NaN or Infinity', () => {
    const attemptWithZero: PracticeAttempt = {
      ...mockAttempt1,
      metrics: {
        ...mockBaseMetrics,
        totalFillerCount: 0,
        fillerRatePer100Words: 0,
      },
    };

    const attemptWithFiller: PracticeAttempt = {
      ...mockAttempt2Improved,
      metrics: {
        ...mockAttempt2Improved.metrics,
        totalFillerCount: 3,
        fillerRatePer100Words: 4.5,
      },
    };

    const comparison = createAttemptComparison(attemptWithZero, attemptWithFiller);
    const fillerCountMetric = comparison.metricChanges.find((m) => m.metric === 'filler-count');
    const fillerRateMetric = comparison.metricChanges.find((m) => m.metric === 'filler-rate');

    expect(fillerCountMetric?.percentageChange).toBeNull();
    expect(fillerRateMetric?.percentageChange).toBeNull();
  });

  it('evaluates retry checklist without using failure labels', () => {
    const comparison = createAttemptComparison(mockAttempt1, mockAttempt2Improved);

    expect(comparison.checklistResults.length).toBe(3);
    comparison.checklistResults.forEach((item) => {
      // Must only be 'likely-applied', 'not-confirmed', or 'not-applicable'
      expect(['likely-applied', 'not-confirmed', 'not-applicable']).toContain(item.status);
      expect((item.status as string)).not.toBe('실패');
      expect((item.status as string)).not.toBe('failed');
    });
  });

  it('detects added, removed, and retained sentences in transcript comparison', () => {
    const comparison = createAttemptComparison(mockAttempt1, mockAttempt2Improved);

    expect(comparison.transcriptChanges.addedSentences.length).toBeGreaterThan(0);
    expect(comparison.transcriptChanges.removedSentences.length).toBeGreaterThan(0);
    expect(comparison.transcriptChanges.similarityPercentage).toBeGreaterThanOrEqual(0);
    expect(comparison.transcriptChanges.similarityPercentage).toBeLessThanOrEqual(100);
  });

  it('generates summary with improved areas, maintained strengths, and recommendations', () => {
    const comparison = createAttemptComparison(mockAttempt1, mockAttempt2Improved);

    expect(comparison.summary.improvedAreas.length).toBeGreaterThan(0);
    expect(comparison.summary.recommendedNextAction).toBeTruthy();
    expect(typeof comparison.summary.recommendedNextAction).toBe('string');
  });

  describe('interpretMetricChange', () => {
    it('interprets WPM moving into reference range 110~149 as improved', () => {
      const result = interpretMetricChange('words-per-minute', 95, 125);
      expect(result.interpretation).toBe('improved');
    });

    it('flags excessively fast speech (>160 WPM) as needs-review', () => {
      const result = interpretMetricChange('words-per-minute', 120, 168);
      expect(result.interpretation).toBe('needs-review');
    });

    it('treats small WPM differences (<=5 WPM) as neutral', () => {
      const result = interpretMetricChange('words-per-minute', 120, 123);
      expect(result.interpretation).toBe('neutral');
    });

    it('interprets meaningful reduction in filler rate as improved', () => {
      const result = interpretMetricChange('filler-rate', 8.5, 3.2);
      expect(result.interpretation).toBe('improved');
    });
  });

  describe('compareTranscripts pure function', () => {
    it('handles identical transcripts with 100% similarity', () => {
      const text = 'I start my day by checking important emails.';
      const result = compareTranscripts(text, text);
      expect(result.similarityPercentage).toBe(100);
      expect(result.addedSentences.length).toBe(0);
      expect(result.removedSentences.length).toBe(0);
      expect(result.retainedSentences.length).toBe(1);
    });

    it('normalizes punctuation and case when comparing sentences', () => {
      const base = 'I check emails in the morning.';
      const retry = 'i check emails in the morning!';
      const result = compareTranscripts(base, retry);
      expect(result.retainedSentences.length).toBe(1);
      expect(result.addedSentences.length).toBe(0);
    });

    it('handles empty inputs safely', () => {
      const result = compareTranscripts('', '');
      expect(result.similarityPercentage).toBe(100);
      expect(result.addedSentences).toEqual([]);
      expect(result.removedSentences).toEqual([]);
    });
  });

  describe('attachAttemptToSession', () => {
    it('attaches attempt to session and updates timestamps and IDs', () => {
      const session: PracticeSession = {
        id: 'sess-1',
        questionId: 'q-1',
        question: 'Sample question',
        category: 'work',
        difficulty: 'basic',
        createdAt: '2026-11-01T10:00:00.000Z',
        updatedAt: '2026-11-01T10:00:00.000Z',
        attemptIds: [],
        originalAttemptId: '',
        latestAttemptId: '',
        status: 'in-progress',
      };

      const attempt: PracticeAttempt = {
        ...mockAttempt1,
        id: 'att-1',
        sessionId: 'sess-1',
      };

      const updated = attachAttemptToSession(session, attempt);
      expect(updated.attemptIds).toContain('att-1');
      expect(updated.originalAttemptId).toBe('att-1');
      expect(updated.latestAttemptId).toBe('att-1');
      expect(updated.status).toBe('completed');
    });
  });
});
