import { SpeakingMetrics } from './metrics';
import { AICoachingResult, DesiredAnswerLevel, FeedbackLanguage, RetryContext } from './coaching';
import { AttemptTurnType, PracticeAreaId, PracticeMode, TopicId, VisualTaskType } from './question';

export type AttemptTranscriptionStatus =
  | 'not-requested'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'manual';

export type RetrySource =
  | 'direct'
  | 'feedback'
  | 'history'
  | 'coaching_mode_a'
  | 'coaching_mode_b';

export interface PracticeAttemptAICoaching {
  status: 'not-requested' | 'completed' | 'failed';
  promptVersion: string;
  transcriptHash: string;
  feedbackLanguage: FeedbackLanguage;
  desiredAnswerLevel: DesiredAnswerLevel;
  generatedAt?: string;
  result?: AICoachingResult;
}

export interface PracticeAttempt {
  id: string;
  sessionId?: string;
  attemptNumber?: number;
  parentAttemptId?: string;
  retrySource?: RetrySource;
  retryContext?:
    | RetryContext
    | {
        mode: 'outline-only' | 'with-improved-answer' | 'direct' | string;
        checklistItems?: string[];
        checklist?: string[];
        sourceCoachingAttemptId?: string;
      };

  questionId: string;
  category: string;
  categoryLabel: string;
  question: string;
  recordedAt: string;
  recordingDurationSeconds: number;
  originalTranscript: string;
  editedTranscript: string;
  metrics: SpeakingMetrics;
  transcriptionStatus: AttemptTranscriptionStatus;
  aiCoaching?: PracticeAttemptAICoaching;

  // Sprint 5 additions
  practiceArea?: PracticeAreaId;
  topic?: TopicId;
  practiceMode?: PracticeMode;
  turnType?: AttemptTurnType;

  listeningContext?: {
    passageId: string;
    playbackCount: number;
    expectedPlaybackCount: 2;
    passageDurationSeconds?: number;
  };

  visualContext?: {
    visualType: string;
    taskType?: VisualTaskType;
    visualAsset?: string;
  };
}
