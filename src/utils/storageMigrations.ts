/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PracticeSession, StoredPracticeData } from '../types/practiceSession';
import { PracticeAttempt } from '../types/practiceAttempt';
import { DEFAULT_GOALS, PracticeGoal, UserPreferences } from '../types/goals';
import { getQuestionById, mapLegacyCategoryToTopic } from './questionUtils';

export const CURRENT_SCHEMA_VERSION = 5;
export const STORAGE_KEY_V4 = 'spa_practice_data_v4';
export const LEGACY_STORAGE_KEY_V1 = 'spa_practice_history_v1';

export const DEFAULT_PREFERENCES: UserPreferences = {
  feedbackLanguage: 'ko',
  desiredAnswerLevel: 'one-step-better',
  activePeriodFilter: '7d',
  defaultPeriod: '7d',
  showTrendCharts: true,
};

/**
 * Enriches a PracticeAttempt with practiceArea and topic metadata from questionBank
 */
function enrichAttemptMetadata(attempt: any): PracticeAttempt {
  const qDef = attempt.questionId ? getQuestionById(attempt.questionId) : null;
  const mappedTopic = attempt.topic || (qDef ? qDef.topic : mapLegacyCategoryToTopic(attempt.category));
  const practiceArea = attempt.practiceArea || (qDef ? qDef.practiceArea : undefined);
  const practiceMode = attempt.practiceMode || (qDef ? qDef.practiceMode : undefined);

  return {
    ...attempt,
    practiceArea,
    topic: mappedTopic !== 'all' ? mappedTopic : undefined,
    practiceMode,
  };
}

/**
 * Enriches a PracticeSession with practiceArea and topic metadata from questionBank
 */
function enrichSessionMetadata(session: any): PracticeSession {
  const qDef = session.questionId ? getQuestionById(session.questionId) : null;
  const mappedTopic = session.topic || (qDef ? qDef.topic : mapLegacyCategoryToTopic(session.category));
  const practiceArea = session.practiceArea || (qDef ? qDef.practiceArea : undefined);
  const practiceMode = session.practiceMode || (qDef ? qDef.practiceMode : undefined);

  return {
    ...session,
    practiceArea,
    topic: mappedTopic !== 'all' ? mappedTopic : undefined,
    practiceMode,
  };
}

/**
 * Migrates arbitrary raw storage data into a valid StoredPracticeData object (Schema V5/V4 compatible).
 * Handles:
 * - Empty / nullish storage
 * - Corrupted or invalid JSON
 * - Sprint 2 / Sprint 3 legacy PracticeAttempt[] array format
 * - Schema V4 format
 * - Schema V5 format
 */
export function migrateStoredData(raw: unknown): StoredPracticeData {
  const fallbackData: StoredPracticeData = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    attempts: [],
    sessions: [],
    goals: [...DEFAULT_GOALS],
    preferences: { ...DEFAULT_PREFERENCES },
  };

  if (!raw) return fallbackData;

  try {
    let parsed: any = raw;
    if (typeof raw === 'string') {
      parsed = JSON.parse(raw);
    }

    if (!parsed || typeof parsed !== 'object') {
      return fallbackData;
    }

    // Case 1: Schema V4 or V5 object format
    if (parsed.schemaVersion >= 4 || parsed.version >= 4 || ('attempts' in parsed && 'sessions' in parsed)) {
      const validAttempts = Array.isArray(parsed.attempts)
        ? parsed.attempts
            .filter((a: any) => a && typeof a.id === 'string' && typeof a.questionId === 'string')
            .map(enrichAttemptMetadata)
        : [];

      const validSessions = Array.isArray(parsed.sessions)
        ? parsed.sessions
            .filter((s: any) => s && typeof s.id === 'string' && typeof s.questionId === 'string')
            .map(enrichSessionMetadata)
        : [];

      const validGoals = Array.isArray(parsed.goals) && parsed.goals.length > 0
        ? parsed.goals
        : [...DEFAULT_GOALS];

      const validPreferences: UserPreferences = {
        feedbackLanguage: parsed.preferences?.feedbackLanguage === 'en' ? 'en' : 'ko',
        desiredAnswerLevel:
          parsed.preferences?.desiredAnswerLevel === 'current' ||
          parsed.preferences?.desiredAnswerLevel === 'challenging'
            ? parsed.preferences.desiredAnswerLevel
            : 'one-step-better',
        activePeriodFilter:
          parsed.preferences?.activePeriodFilter === '30d' ||
          parsed.preferences?.activePeriodFilter === 'all'
            ? parsed.preferences.activePeriodFilter
            : '7d',
        defaultPeriod:
          parsed.preferences?.defaultPeriod === '30d' ||
          parsed.preferences?.defaultPeriod === 'all'
            ? parsed.preferences.defaultPeriod
            : (parsed.preferences?.activePeriodFilter || '7d'),
        showTrendCharts: parsed.preferences?.showTrendCharts !== false,
      };

      return {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        attempts: validAttempts,
        sessions: validSessions,
        goals: validGoals,
        preferences: validPreferences,
      };
    }

    // Case 2: Legacy Array of PracticeAttempt (Sprint 2 & 3)
    if (Array.isArray(parsed)) {
      const legacyAttempts: PracticeAttempt[] = parsed.filter(
        (a: any) => a && typeof a.id === 'string' && typeof a.questionId === 'string'
      );

      const migratedAttempts: PracticeAttempt[] = [];
      const migratedSessions: PracticeSession[] = [];

      for (const attempt of legacyAttempts) {
        const sessionId = attempt.sessionId || `session-migrated-${attempt.id}`;
        const attemptNumber = attempt.attemptNumber || 1;

        const updatedAttempt = enrichAttemptMetadata({
          ...attempt,
          sessionId,
          attemptNumber,
        });
        migratedAttempts.push(updatedAttempt);

        migratedSessions.push(
          enrichSessionMetadata({
            id: sessionId,
            questionId: attempt.questionId,
            question: attempt.question,
            category: attempt.category,
            categoryLabel: attempt.categoryLabel,
            difficulty: 'basic',
            createdAt: attempt.recordedAt || new Date().toISOString(),
            updatedAt: attempt.recordedAt || new Date().toISOString(),
            attemptIds: [attempt.id],
            originalAttemptId: attempt.id,
            latestAttemptId: attempt.id,
            status: 'completed',
          })
        );
      }

      return {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        attempts: migratedAttempts,
        sessions: migratedSessions,
        goals: [...DEFAULT_GOALS],
        preferences: { ...DEFAULT_PREFERENCES },
      };
    }

    return fallbackData;
  } catch (err) {
    console.warn('Storage migration failed, falling back to safe defaults:', err);
    return fallbackData;
  }
}

/**
 * Loads stored practice data from localStorage.
 * Checks V4 storage key first. If absent, checks legacy V1 storage key and migrates.
 */
export function loadStoredPracticeData(): StoredPracticeData {
  try {
    const v4Raw = localStorage.getItem(STORAGE_KEY_V4);
    if (v4Raw) {
      return migrateStoredData(v4Raw);
    }

    // Check legacy V1 key
    const v1Raw = localStorage.getItem(LEGACY_STORAGE_KEY_V1);
    if (v1Raw) {
      const migrated = migrateStoredData(v1Raw);
      // Persist migrated format to V4
      try {
        localStorage.setItem(STORAGE_KEY_V4, JSON.stringify(migrated));
      } catch {
        // ignore
      }
      return migrated;
    }

    return migrateStoredData(null);
  } catch (err) {
    console.warn('Failed to load stored practice data:', err);
    return migrateStoredData(null);
  }
}

/**
 * Saves stored practice data to localStorage.
 * Also keeps legacy key in sync for backwards compatibility.
 */
export function saveStoredPracticeData(data: StoredPracticeData): void {
  try {
    localStorage.setItem(STORAGE_KEY_V4, JSON.stringify(data));
    // Keep legacy array in sync (capped to 20 for legacy consumers)
    try {
      const legacySlice = data.attempts.slice(0, 20);
      localStorage.setItem(LEGACY_STORAGE_KEY_V1, JSON.stringify(legacySlice));
    } catch {
      // ignore
    }
  } catch (err) {
    console.warn('Failed to save practice data to localStorage (storage full):', err);
  }
}

export const CURRENT_STORAGE_VERSION = CURRENT_SCHEMA_VERSION;
export const migrateStorageToV4 = loadStoredPracticeData;
