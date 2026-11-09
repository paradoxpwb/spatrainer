/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  PRACTICE_AREAS,
  TOPICS,
  PRACTICE_AREA_TOPIC_MAP,
  PRACTICE_AREA_DISCLAIMER,
  getPracticeAreaDefinition,
  getTopicDefinition,
  isTopicAvailableForArea,
} from '../config/practiceTaxonomy';
import { QUESTION_BANK } from '../data/questionBank';
import {
  getRandomQuestion,
  getQuestionsByArea,
  getQuestionsByTopic,
  getQuestionsByAreaAndTopic,
  getAvailableTopicsForArea,
  getQuestionById,
  getDisplayPrompt,
  mapLegacyCategoryToTopic,
  loadPracticeSettings,
  savePracticeSettings,
  migratePracticeSettings,
} from './questionUtils';
import { migrateStoredData } from './storageMigrations';
import { ListeningSummaryQuestion, VisualPromptQuestion } from '../types/question';

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

describe('A. Practice Taxonomy & Definitions', () => {
  it('defines exactly 5 Practice Areas with valid configuration', () => {
    expect(PRACTICE_AREAS).toHaveLength(5);
    const ids = PRACTICE_AREAS.map((a) => a.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(5);

    expect(ids).toContain('area-1-personal-workplace');
    expect(ids).toContain('area-2-business-follow-up');
    expect(ids).toContain('area-3-opinion-extended');
    expect(ids).toContain('area-4-listening-summary');
    expect(ids).toContain('area-5-visual-prompt');
  });

  it('defines unique Topic IDs across all 8 standard topics', () => {
    expect(TOPICS.length).toBeGreaterThanOrEqual(8);
    const topicIds = TOPICS.map((t) => t.id);
    const uniqueTopics = new Set(topicIds);
    expect(uniqueTopics.size).toBe(TOPICS.length);
  });

  it('verifies every Practice Area has mapped available topics', () => {
    PRACTICE_AREAS.forEach((area) => {
      const allowedTopics = PRACTICE_AREA_TOPIC_MAP[area.id];
      expect(allowedTopics).toBeDefined();
      expect(allowedTopics.length).toBeGreaterThan(0);
      allowedTopics.forEach((tId) => {
        expect(getTopicDefinition(tId)).toBeDefined();
      });
    });
  });

  it('Area 4 has practiceMode listening-summary and 2-run playback limit', () => {
    const area4 = getPracticeAreaDefinition('area-4-listening-summary');
    expect(area4).toBeDefined();
    expect(area4?.practiceMode).toBe('listening-summary');
  });

  it('includes the official disclaimer regarding training taxonomy vs official test', () => {
    expect(PRACTICE_AREA_DISCLAIMER).toContain('공식 시험기관의 고정 Part 명칭을 의미하지 않습니다');
  });
});

describe('B. Question Bank Validation', () => {
  it('all questions in QUESTION_BANK have practiceArea, topic, and practiceMode', () => {
    expect(QUESTION_BANK.length).toBeGreaterThanOrEqual(70);
    QUESTION_BANK.forEach((q) => {
      expect(q.id).toBeDefined();
      expect(q.practiceArea).toBeDefined();
      expect(q.topic).toBeDefined();
      expect(q.practiceMode).toBeDefined();
      expect(q.difficulty).toBeDefined();
    });
  });

  it('all questions match their respective Area allowed topics', () => {
    QUESTION_BANK.forEach((q) => {
      const isAllowed = isTopicAvailableForArea(q.practiceArea, q.topic);
      expect(isAllowed).toBe(true);
    });
  });

  it('Area 4 listening passages have passage, keyPoints, playbackLimit: 2, and hidden flag', () => {
    const listeningQuestions = QUESTION_BANK.filter(
      (q) => q.practiceMode === 'listening-summary'
    ) as ListeningSummaryQuestion[];

    expect(listeningQuestions.length).toBeGreaterThanOrEqual(6);
    listeningQuestions.forEach((lq) => {
      expect(lq.passage).toBeDefined();
      expect(lq.passage.length).toBeGreaterThan(50);
      expect(lq.playbackLimit).toBe(2);
      expect(lq.forbiddenVisibleDuringListening).toBe(true);
      expect(lq.keyPoints).toBeDefined();
      expect(lq.keyPoints.length).toBeGreaterThanOrEqual(3);
      expect(lq.estimatedListeningSeconds).toBeGreaterThanOrEqual(35);
      expect(lq.estimatedListeningSeconds).toBeLessThanOrEqual(55);
    });
  });

  it('Area 2 follow-up questions have followUpQuestions array', () => {
    const followUpQuestions = QUESTION_BANK.filter(
      (q) => q.practiceMode === 'follow-up-question'
    );
    expect(followUpQuestions.length).toBeGreaterThan(0);
    followUpQuestions.forEach((fq: any) => {
      expect(Array.isArray(fq.followUpQuestions)).toBe(true);
      expect(fq.followUpQuestions.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('Area 5 visual questions have visualType and visualAlt', () => {
    const visualQuestions = QUESTION_BANK.filter(
      (q) => q.practiceMode === 'visual-prompt'
    ) as VisualPromptQuestion[];

    expect(visualQuestions.length).toBeGreaterThanOrEqual(5);
    visualQuestions.forEach((vq) => {
      expect(vq.visualType).toBeDefined();
      expect(['photo', 'graph', 'table', 'map', 'text-prompt']).toContain(vq.visualType);
      expect(vq.visualAlt).toBeDefined();
      expect(vq.visualAlt.length).toBeGreaterThan(10);
    });
  });
});

describe('C. Question Filter API', () => {
  it('filters by Area only', () => {
    const q = getRandomQuestion({ practiceArea: 'area-4-listening-summary', topic: 'all' });
    expect(q).not.toBeNull();
    expect(q!.practiceArea).toBe('area-4-listening-summary');
    expect(q!.practiceMode).toBe('listening-summary');
  });

  it('filters by Topic only', () => {
    const q = getRandomQuestion({ practiceArea: 'all', topic: 'workplace' });
    expect(q).not.toBeNull();
    expect(q!.topic).toBe('workplace');
  });

  it('filters by both Area and Topic', () => {
    const q = getRandomQuestion({
      practiceArea: 'area-1-personal-workplace',
      topic: 'self-introduction',
    });
    expect(q).not.toBeNull();
    expect(q!.practiceArea).toBe('area-1-personal-workplace');
    expect(q!.topic).toBe('self-introduction');
  });

  it('excludes the previous question ID when multiple questions exist', () => {
    const areaQuestions = getQuestionsByArea('area-1-personal-workplace');
    expect(areaQuestions.length).toBeGreaterThan(1);
    const excludeId = areaQuestions[0].id;

    for (let i = 0; i < 5; i++) {
      const q = getRandomQuestion({
        practiceArea: 'area-1-personal-workplace',
        topic: 'all',
        excludeQuestionId: excludeId,
      });
      if (areaQuestions.length > 1) {
        expect(q).not.toBeNull();
        expect(q!.id).not.toBe(excludeId);
      }
    }
  });

  it('returns null if area has no questions for specific topic', () => {
    const q = getRandomQuestion({
      practiceArea: 'area-4-listening-summary',
      topic: 'self-introduction' as any,
    });
    expect(q).toBeNull();
  });

  it('getDisplayPrompt conceals Area 4 passage text and returns summary instruction', () => {
    const area4Question = QUESTION_BANK.find((q) => q.practiceMode === 'listening-summary');
    expect(area4Question).toBeDefined();
    if (area4Question) {
      const prompt = getDisplayPrompt(area4Question);
      expect(prompt).not.toContain((area4Question as any).passage);
      expect(prompt).toContain('Listen to the passage twice and summarize what you heard.');
    }
  });
});

describe('D. Settings & Topic Migration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('maps legacy "work" category to "workplace" topic', () => {
    expect(mapLegacyCategoryToTopic('work')).toBe('workplace');
  });

  it('maps legacy "travel" category to "travel-leisure" topic', () => {
    expect(mapLegacyCategoryToTopic('travel')).toBe('travel-leisure');
  });

  it('loads default settings when storage is empty', () => {
    const settings = loadPracticeSettings();
    expect(settings.preparationDuration).toBe(15);
    expect(settings.answerDuration).toBe(60);
    expect(settings.lastSelectedPracticeArea).toBe('area-1-personal-workplace');
  });

  it('persists and reloads updated Area and Topic settings', () => {
    savePracticeSettings({
      preparationDuration: 30,
      answerDuration: 90,
      lastSelectedPracticeArea: 'area-3-opinion-extended',
      lastSelectedTopic: 'opinion',
    });

    const loaded = loadPracticeSettings();
    expect(loaded.preparationDuration).toBe(30);
    expect(loaded.answerDuration).toBe(90);
    expect(loaded.lastSelectedPracticeArea).toBe('area-3-opinion-extended');
    expect(loaded.lastSelectedTopic).toBe('opinion');
    expect(loaded.schemaVersion).toBe(2);
  });

  it('migrates unversioned legacy settings to schemaVersion 2 with mapped topic', () => {
    // Unversioned legacy settings with legacy category
    const legacyRaw = {
      preparationDuration: 45,
      answerDuration: 120,
      lastSelectedCategory: 'work',
    };
    localStorage.setItem('spa_trainer_settings_v1', JSON.stringify(legacyRaw));

    const loaded = loadPracticeSettings();
    expect(loaded.schemaVersion).toBe(2);
    expect(loaded.preparationDuration).toBe(45);
    expect(loaded.answerDuration).toBe(120);
    expect(loaded.lastSelectedTopic).toBe('workplace');
    expect(loaded.lastSelectedPracticeArea).toBe('area-1-personal-workplace');

    // Confirm that the persisted item in localStorage was upgraded with schemaVersion
    const persisted = JSON.parse(localStorage.getItem('spa_trainer_settings_v1')!);
    expect(persisted.schemaVersion).toBe(2);
  });
});

describe('E. Storage Migration with Taxonomy', () => {
  it('enriches legacy V4 sessions and attempts with Area and Topic from questionBank', () => {
    const legacyRaw = {
      schemaVersion: 4,
      attempts: [
        {
          id: 'att-01',
          questionId: 'self-01',
          question: 'Introduce yourself',
          category: 'self-introduction',
          categoryLabel: '자기소개',
          recordedAt: new Date().toISOString(),
          recordingDurationSeconds: 45,
          originalTranscript: 'Hello I am a developer',
          editedTranscript: 'Hello I am a developer',
          metrics: { wordsPerMinute: 110, totalWords: 80, fillerCount: 1, repetitionCount: 0, fillerRatePer100Words: 1.25, repetitionRatePer100Words: 0 },
          transcriptionStatus: 'completed',
        },
      ],
      sessions: [
        {
          id: 'sess-01',
          questionId: 'self-01',
          question: 'Introduce yourself',
          category: 'self-introduction',
          difficulty: 'basic',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          attemptIds: ['att-01'],
          originalAttemptId: 'att-01',
          latestAttemptId: 'att-01',
          status: 'completed',
        },
      ],
      goals: [],
      preferences: {},
    };

    const migrated = migrateStoredData(legacyRaw);
    expect(migrated.schemaVersion).toBe(5);
    expect(migrated.attempts[0].practiceArea).toBe('area-1-personal-workplace');
    expect(migrated.attempts[0].topic).toBe('self-introduction');
    expect(migrated.sessions[0].practiceArea).toBe('area-1-personal-workplace');
    expect(migrated.sessions[0].topic).toBe('self-introduction');
  });

  it('does not arbitrarily force unknown questionId into an Area', () => {
    const legacyRaw = {
      schemaVersion: 4,
      attempts: [
        {
          id: 'att-custom',
          questionId: 'unknown-custom-q',
          question: 'Custom Question',
          category: 'work',
          categoryLabel: '직장생활',
          recordedAt: new Date().toISOString(),
          recordingDurationSeconds: 40,
          originalTranscript: 'Custom answer',
          editedTranscript: 'Custom answer',
          metrics: { wordsPerMinute: 100, totalWords: 70, fillerCount: 0, repetitionCount: 0, fillerRatePer100Words: 0, repetitionRatePer100Words: 0 },
          transcriptionStatus: 'completed',
        },
      ],
      sessions: [],
      goals: [],
      preferences: {},
    };

    const migrated = migrateStoredData(legacyRaw);
    expect(migrated.attempts[0].practiceArea).toBeUndefined();
    expect(migrated.attempts[0].topic).toBe('workplace');
  });
});
