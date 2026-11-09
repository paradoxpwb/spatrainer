import { PracticeAttempt } from '../types/practiceAttempt';
import { PracticeSession, StoredPracticeData } from '../types/practiceSession';
import { PracticeGoal, UserPreferences } from '../types/goals';
import {
  CURRENT_SCHEMA_VERSION,
  loadStoredPracticeData,
  saveStoredPracticeData,
} from './storageMigrations';

export {
  CURRENT_SCHEMA_VERSION,
  loadStoredPracticeData,
  saveStoredPracticeData,
};

const MAX_ATTEMPTS = 50;

/**
 * Safely load practice history attempts from localStorage.
 */
export function loadPracticeHistory(): PracticeAttempt[] {
  const data = loadStoredPracticeData();
  return data.attempts.slice(0, 20);
}

/**
 * Safely load all practice sessions from localStorage.
 */
export function loadPracticeSessions(): PracticeSession[] {
  const data = loadStoredPracticeData();
  return data.sessions;
}

/**
 * Load a single session with its associated attempts.
 */
export function loadSessionWithAttempts(
  sessionId: string
): { session: PracticeSession; attempts: PracticeAttempt[] } | null {
  const data = loadStoredPracticeData();
  const session = data.sessions.find((s) => s.id === sessionId);
  if (!session) return null;

  const attempts = data.attempts.filter((a) => a.sessionId === sessionId);
  // Sort attempts by attemptNumber ascending
  attempts.sort((a, b) => (a.attemptNumber || 1) - (b.attemptNumber || 1));

  return { session, attempts };
}

/**
 * Add or update a practice attempt and its parent PracticeSession in localStorage.
 */
export function savePracticeAttempt(attempt: PracticeAttempt): PracticeAttempt[] {
  const data = loadStoredPracticeData();

  // 1. Ensure sessionId and attemptNumber
  let sessionId = attempt.sessionId;
  let attemptNumber = attempt.attemptNumber || 1;

  if (!sessionId) {
    sessionId = `session-${attempt.id}`;
    attempt.sessionId = sessionId;
    attempt.attemptNumber = 1;
  }

  // 2. Add or update attempt in data.attempts
  const existingAttemptIndex = data.attempts.findIndex((a) => a.id === attempt.id);
  let updatedAttempts: PracticeAttempt[];
  if (existingAttemptIndex >= 0) {
    updatedAttempts = [...data.attempts];
    updatedAttempts[existingAttemptIndex] = attempt;
  } else {
    updatedAttempts = [attempt, ...data.attempts];
  }

  // Cap to MAX_ATTEMPTS (most recent first)
  if (updatedAttempts.length > MAX_ATTEMPTS) {
    updatedAttempts = updatedAttempts.slice(0, MAX_ATTEMPTS);
  }

  // 3. Find or create session
  const existingSessionIndex = data.sessions.findIndex((s) => s.id === sessionId);
  let updatedSessions = [...data.sessions];

  if (existingSessionIndex >= 0) {
    const existingSession = updatedSessions[existingSessionIndex];
    const attemptIds = existingSession.attemptIds.includes(attempt.id)
      ? existingSession.attemptIds
      : [...existingSession.attemptIds, attempt.id];

    updatedSessions[existingSessionIndex] = {
      ...existingSession,
      attemptIds,
      latestAttemptId: attempt.id,
      updatedAt: attempt.recordedAt || new Date().toISOString(),
      status: 'completed',
    };
  } else {
    const newSession: PracticeSession = {
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
    };
    updatedSessions = [newSession, ...updatedSessions];
  }

  const updatedData: StoredPracticeData = {
    ...data,
    attempts: updatedAttempts,
    sessions: updatedSessions,
  };

  saveStoredPracticeData(updatedData);
  return updatedAttempts;
}

/**
 * Pure function: Attaches a PracticeAttempt to a PracticeSession.
 */
export function attachAttemptToSession(
  session: PracticeSession,
  attempt: PracticeAttempt
): PracticeSession {
  const attemptIds = session.attemptIds.includes(attempt.id)
    ? session.attemptIds
    : [...session.attemptIds, attempt.id];

  return {
    ...session,
    attemptIds,
    originalAttemptId: session.originalAttemptId || attempt.id,
    latestAttemptId: attempt.id,
    updatedAt: attempt.recordedAt || new Date().toISOString(),
    status: 'completed',
  };
}

/**
 * Create a new PracticeSession when a user begins a question.
 */
export function createPracticeSession(params: {
  questionId: string;
  question: string;
  category: string;
  categoryLabel?: string;
  difficulty?: 'basic' | 'intermediate';
  practiceArea?: any;
  topic?: any;
  practiceMode?: any;
}): PracticeSession {
  const data = loadStoredPracticeData();
  const id = `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newSession: PracticeSession = {
    id,
    questionId: params.questionId,
    question: params.question,
    category: params.category,
    categoryLabel: params.categoryLabel,
    difficulty: params.difficulty || 'basic',
    createdAt: now,
    updatedAt: now,
    attemptIds: [],
    originalAttemptId: '',
    latestAttemptId: '',
    status: 'in-progress',
    practiceArea: params.practiceArea,
    topic: params.topic,
    practiceMode: params.practiceMode,
  };

  const updatedData: StoredPracticeData = {
    ...data,
    sessions: [newSession, ...data.sessions],
  };

  saveStoredPracticeData(updatedData);
  return newSession;
}

/**
 * Delete a specific PracticeSession and all its associated attempts.
 * Leaves all other sessions untouched.
 */
export function deletePracticeSession(sessionId: string): StoredPracticeData {
  const data = loadStoredPracticeData();

  const remainingSessions = data.sessions.filter((s) => s.id !== sessionId);
  const remainingAttempts = data.attempts.filter((a) => a.sessionId !== sessionId);

  const updatedData: StoredPracticeData = {
    ...data,
    sessions: remainingSessions,
    attempts: remainingAttempts,
  };

  saveStoredPracticeData(updatedData);
  return updatedData;
}

/**
 * Reset all practice data (attempts, sessions, goals) while optionally preserving timer & language preferences.
 */
export function resetAllPracticeData(): StoredPracticeData {
  const data = loadStoredPracticeData();

  const resetData: StoredPracticeData = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    attempts: [],
    sessions: [],
    goals: data.goals.map((g) => ({ ...g, currentValue: 0, updatedAt: new Date().toISOString() })),
    preferences: data.preferences,
  };

  saveStoredPracticeData(resetData);
  return resetData;
}

/**
 * Clear all history (backwards compatibility).
 */
export function clearPracticeHistory(): void {
  resetAllPracticeData();
}

/**
 * Update practice goals in localStorage.
 */
export function savePracticeGoals(goals: PracticeGoal[]): StoredPracticeData {
  const data = loadStoredPracticeData();
  const updatedData: StoredPracticeData = {
    ...data,
    goals,
  };
  saveStoredPracticeData(updatedData);
  return updatedData;
}

/**
 * Update user preferences in localStorage.
 */
export function saveUserPreferences(prefs: Partial<UserPreferences>): StoredPracticeData {
  const data = loadStoredPracticeData();
  const updatedData: StoredPracticeData = {
    ...data,
    preferences: {
      ...data.preferences,
      ...prefs,
    },
  };
  saveStoredPracticeData(updatedData);
  return updatedData;
}
