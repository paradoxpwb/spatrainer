/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QUESTION_BANK } from '../data/questionBank';
import {
  CategorySelection,
  PRACTICE_SETTINGS_SCHEMA_VERSION,
  PracticeAreaId,
  PracticeAreaSelection,
  PracticeMode,
  PracticeSelection,
  PracticeSettings,
  QuestionCategory,
  QuestionFilter,
  SpeakingQuestion,
  TopicId,
  TopicSelection,
} from '../types/question';
import {
  PRACTICE_AREAS,
  PRACTICE_AREA_TOPIC_MAP,
  TOPICS,
} from '../config/practiceTaxonomy';

const STORAGE_KEY = 'spa_trainer_settings_v1';

export const DEFAULT_SETTINGS: PracticeSettings = {
  schemaVersion: PRACTICE_SETTINGS_SCHEMA_VERSION,
  preparationDuration: 15,
  answerDuration: 60,
  lastSelectedPracticeArea: 'area-1-personal-workplace',
  lastSelectedTopic: 'all',
  // TODO: Remove legacy lastSelectedCategory after migration period
  lastSelectedCategory: null,
};

const VALID_PREP_DURATIONS = [15, 30, 45];
const VALID_ANSWER_DURATIONS = [60, 90, 120];

const VALID_AREA_IDS: PracticeAreaId[] = [
  'area-1-personal-workplace',
  'area-2-business-follow-up',
  'area-3-opinion-extended',
  'area-4-listening-summary',
  'area-5-visual-prompt',
];

const VALID_TOPIC_IDS: TopicId[] = [
  'self-introduction',
  'daily-life',
  'workplace',
  'experience',
  'situation',
  'opinion',
  'problem-solving',
  'travel-leisure',
];

/**
 * Maps legacy category string to modern TopicId
 * TODO: Remove legacy CategorySelection path after migration is complete
 */
export function mapLegacyCategoryToTopic(cat: string | null | undefined): TopicId | 'all' {
  if (!cat || cat === 'all') return 'all';
  if (cat === 'work') return 'workplace';
  if (cat === 'travel') return 'travel-leisure';
  if (VALID_TOPIC_IDS.includes(cat as TopicId)) {
    return cat as TopicId;
  }
  return 'all';
}

/**
 * Returns human-readable label for a topic
 */
export function getTopicLabel(topicId: TopicId | string): string {
  const match = TOPICS.find((t) => t.id === topicId);
  if (match) return match.labelKo;
  if (topicId === 'work') return '직장생활';
  return topicId;
}

/**
 * Returns prompt to display or log for any question type.
 * IMPORTANT: For Listening questions, returns a summary instruction prompt
 * and NEVER exposes the secret passage text!
 */
export function getDisplayPrompt(question: SpeakingQuestion): string {
  if (question.practiceMode === 'listening-summary') {
    return question.question || 'Listen to the passage twice and summarize what you heard.';
  }
  if ('question' in question && typeof question.question === 'string') {
    return question.question;
  }
  return 'Please deliver your response.';
}

/**
 * Migrates raw stored settings to current PracticeSettings schema.
 * Handles missing schemaVersion by migrating legacy category to topic and setting schemaVersion.
 */
export function migratePracticeSettings(raw: unknown): PracticeSettings {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_SETTINGS };
  }

  const parsed = raw as Record<string, any>;

  const preparationDuration = VALID_PREP_DURATIONS.includes(parsed.preparationDuration)
    ? parsed.preparationDuration
    : DEFAULT_SETTINGS.preparationDuration;

  const answerDuration = VALID_ANSWER_DURATIONS.includes(parsed.answerDuration)
    ? parsed.answerDuration
    : DEFAULT_SETTINGS.answerDuration;

  let lastSelectedPracticeArea: PracticeAreaSelection | null = null;
  if (parsed.lastSelectedPracticeArea === 'all') {
    lastSelectedPracticeArea = 'all';
  } else if (VALID_AREA_IDS.includes(parsed.lastSelectedPracticeArea)) {
    lastSelectedPracticeArea = parsed.lastSelectedPracticeArea;
  }

  let lastSelectedTopic: TopicId | 'all' | null = null;
  if (parsed.lastSelectedTopic === 'all' || VALID_TOPIC_IDS.includes(parsed.lastSelectedTopic)) {
    lastSelectedTopic = parsed.lastSelectedTopic;
  } else if (parsed.lastSelectedCategory) {
    // TODO: Remove legacy category migration once transition window ends
    lastSelectedTopic = mapLegacyCategoryToTopic(parsed.lastSelectedCategory);
  }

  // Default area/topic if none saved (or legacy null)
  if (!lastSelectedPracticeArea) {
    lastSelectedPracticeArea = 'area-1-personal-workplace';
  }
  if (!lastSelectedTopic) {
    lastSelectedTopic = 'all';
  }

  return {
    schemaVersion: PRACTICE_SETTINGS_SCHEMA_VERSION,
    preparationDuration,
    answerDuration,
    lastSelectedPracticeArea,
    lastSelectedTopic,
    // TODO: Remove legacy lastSelectedCategory after migration period
    lastSelectedCategory: parsed.lastSelectedCategory || null,
  };
}

/**
 * Safely load practice settings from localStorage with schema versioning & migration.
 */
export function loadPracticeSettings(): PracticeSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_SETTINGS };
    }
    const parsed = JSON.parse(raw);
    const migrated = migratePracticeSettings(parsed);

    // If storage had no schemaVersion or is older, persist the updated schema
    if (!parsed.schemaVersion || parsed.schemaVersion < PRACTICE_SETTINGS_SCHEMA_VERSION) {
      savePracticeSettings(migrated);
    }

    return migrated;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Safely persist practice settings with schemaVersion to localStorage
 */
export function savePracticeSettings(settings: PracticeSettings): void {
  try {
    const toSave: PracticeSettings = {
      ...settings,
      schemaVersion: PRACTICE_SETTINGS_SCHEMA_VERSION,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (err) {
    console.warn('Failed to save settings to localStorage:', err);
  }
}

/**
 * Retrieve questions filtered by Practice Area
 */
export function getQuestionsByArea(areaId: PracticeAreaId): SpeakingQuestion[] {
  return QUESTION_BANK.filter((q) => q.practiceArea === areaId);
}

/**
 * Retrieve questions filtered by Topic
 */
export function getQuestionsByTopic(topicId: TopicId): SpeakingQuestion[] {
  return QUESTION_BANK.filter((q) => q.topic === topicId);
}

/**
 * Retrieve questions filtered by both Area and Topic
 */
export function getQuestionsByAreaAndTopic(
  areaId: PracticeAreaId,
  topicId: TopicId
): SpeakingQuestion[] {
  return QUESTION_BANK.filter((q) => q.practiceArea === areaId && q.topic === topicId);
}

/**
 * Get list of available topics for a given Practice Area that actually have questions
 */
export function getAvailableTopicsForArea(areaId: PracticeAreaId): TopicId[] {
  const allowed = PRACTICE_AREA_TOPIC_MAP[areaId] || [];
  const areaQuestions = getQuestionsByArea(areaId);
  return allowed.filter((topicId) => areaQuestions.some((q) => q.topic === topicId));
}

/**
 * Check if a question satisfies the current PracticeSelection
 */
export function isQuestionCompatibleWithSelection(
  question: SpeakingQuestion,
  selection: PracticeSelection
): boolean {
  if (selection.practiceArea !== 'all' && question.practiceArea !== selection.practiceArea) {
    return false;
  }
  if (selection.topic !== 'all' && question.topic !== selection.topic) {
    return false;
  }
  return true;
}

/**
 * Retrieve a question by its unique id from the entire question bank
 */
export function getQuestionById(id: string): SpeakingQuestion | null {
  return QUESTION_BANK.find((q) => q.id === id) || null;
}

/**
 * Select a random question for a given filter (or legacy category string),
 * excluding the previously shown question when possible.
 * Guarantees a safe fallback so the application never crashes.
 */
export function getRandomQuestion(
  filterOrCategory: QuestionFilter | CategorySelection,
  excludeId?: string
): SpeakingQuestion | null {
  let filter: QuestionFilter;

  // Support legacy signature: getRandomQuestion(category, excludeId)
  if (typeof filterOrCategory === 'string') {
    if (filterOrCategory === 'all') {
      filter = { practiceArea: 'all', topic: 'all', excludeQuestionId: excludeId };
    } else {
      const mappedTopic = mapLegacyCategoryToTopic(filterOrCategory);
      filter = { practiceArea: 'all', topic: mappedTopic, excludeQuestionId: excludeId };
    }
  } else {
    filter = filterOrCategory;
  }

  const effectiveExcludeId = filter.excludeQuestionId || excludeId;

  let pool = QUESTION_BANK.filter((q) => {
    if (filter.practiceArea !== 'all' && q.practiceArea !== filter.practiceArea) {
      return false;
    }
    if (filter.topic !== 'all' && q.topic !== filter.topic) {
      return false;
    }
    if (filter.practiceMode && q.practiceMode !== filter.practiceMode) {
      return false;
    }
    return true;
  });

  // Exclude specified question ID
  if (effectiveExcludeId) {
    pool = pool.filter((q) => q.id !== effectiveExcludeId);
  }

  if (pool.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

/**
 * Select random Area 4 listening passage
 */
export function getRandomListeningPassage(
  topic: TopicSelection = 'all',
  excludeId?: string
): SpeakingQuestion | null {
  const pool = QUESTION_BANK.filter(
    (q) =>
      q.practiceMode === 'listening-summary' &&
      (topic === 'all' || q.topic === topic) &&
      (!excludeId || q.id !== excludeId)
  );
  if (pool.length === 0) {
    const anyListening = QUESTION_BANK.filter((q) => q.practiceMode === 'listening-summary');
    return anyListening.length > 0 ? anyListening[0] : null;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Select random Area 5 visual prompt
 */
export function getRandomVisualPrompt(
  topic: TopicSelection = 'all',
  excludeId?: string
): SpeakingQuestion | null {
  const pool = QUESTION_BANK.filter(
    (q) =>
      q.practiceMode === 'visual-prompt' &&
      (topic === 'all' || q.topic === topic) &&
      (!excludeId || q.id !== excludeId)
  );
  if (pool.length === 0) {
    const anyVisual = QUESTION_BANK.filter((q) => q.practiceMode === 'visual-prompt');
    return anyVisual.length > 0 ? anyVisual[0] : null;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}
