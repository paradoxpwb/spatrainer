import { useCallback, useEffect, useState } from 'react';
import { PracticeSession, StoredPracticeData } from '../types/practiceSession';
import { PracticeAttempt } from '../types/practiceAttempt';
import { PracticeGoal, UserPreferences } from '../types/goals';
import {
  createPracticeSession,
  deletePracticeSession,
  loadStoredPracticeData,
  resetAllPracticeData,
  savePracticeAttempt,
  savePracticeGoals,
  saveUserPreferences,
} from '../utils/practiceHistoryUtils';

export interface UsePracticeSessionsReturn {
  sessions: PracticeSession[];
  attempts: PracticeAttempt[];
  goals: PracticeGoal[];
  preferences: UserPreferences;
  createNewSession: (params: {
    questionId: string;
    question: string;
    category: string;
    categoryLabel?: string;
    difficulty?: 'basic' | 'intermediate';
    practiceArea?: any;
    topic?: any;
    practiceMode?: any;
  }) => PracticeSession;
  saveAttempt: (attempt: PracticeAttempt) => void;
  deleteSession: (sessionId: string) => void;
  resetAllData: () => void;
  updateGoals: (goals: PracticeGoal[]) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  reload: () => void;
}

export function usePracticeSessions(): UsePracticeSessionsReturn {
  const [data, setData] = useState<StoredPracticeData>(() => loadStoredPracticeData());

  const reload = useCallback(() => {
    setData(loadStoredPracticeData());
  }, []);

  const createNewSession = useCallback(
    (params: {
      questionId: string;
      question: string;
      category: string;
      categoryLabel?: string;
      difficulty?: 'basic' | 'intermediate';
      practiceArea?: any;
      topic?: any;
      practiceMode?: any;
    }) => {
      const session = createPracticeSession(params);
      setData(loadStoredPracticeData());
      return session;
    },
    []
  );

  const saveAttempt = useCallback((attempt: PracticeAttempt) => {
    savePracticeAttempt(attempt);
    setData(loadStoredPracticeData());
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    const updated = deletePracticeSession(sessionId);
    setData(updated);
  }, []);

  const resetAllData = useCallback(() => {
    const updated = resetAllPracticeData();
    setData(updated);
  }, []);

  const updateGoals = useCallback((goals: PracticeGoal[]) => {
    const updated = savePracticeGoals(goals);
    setData(updated);
  }, []);

  const updatePreferences = useCallback((prefs: Partial<UserPreferences>) => {
    const updated = saveUserPreferences(prefs);
    setData(updated);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    sessions: data.sessions,
    attempts: data.attempts,
    goals: data.goals,
    preferences: data.preferences,
    createNewSession,
    saveAttempt,
    deleteSession,
    resetAllData,
    updateGoals,
    updatePreferences,
    reload,
  };
}
