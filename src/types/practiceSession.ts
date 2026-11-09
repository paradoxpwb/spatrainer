import { PracticeAttempt } from './practiceAttempt';
import { PracticeGoal, UserPreferences } from './goals';
import { PracticeAreaId, PracticeMode, TopicId } from './question';

export type SessionStatus = 'in-progress' | 'completed' | 'abandoned';

export interface PracticeSession {
  id: string;
  questionId: string;
  question: string;
  category: string;
  categoryLabel?: string;
  difficulty: 'basic' | 'intermediate';
  createdAt: string;
  updatedAt: string;
  attemptIds: string[];
  originalAttemptId: string;
  latestAttemptId: string;
  status: SessionStatus;

  // Sprint 5 additions
  practiceArea?: PracticeAreaId;
  topic?: TopicId;
  practiceMode?: PracticeMode;
}

export interface StoredPracticeData {
  schemaVersion: number;
  attempts: PracticeAttempt[];
  sessions: PracticeSession[];
  goals: PracticeGoal[];
  preferences: UserPreferences;
}
