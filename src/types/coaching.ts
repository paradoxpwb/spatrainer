export type FeedbackLanguage = 'ko' | 'en';

export type DesiredAnswerLevel = 'current' | 'one-step-better' | 'challenging';

export type PracticeRating = 'needs-development' | 'developing' | 'effective' | 'strong';

export interface EvidenceReference {
  quotedText: string;
  explanation: string;
}

export interface StrengthFeedback {
  title: string;
  explanation: string;
  evidence?: string;
}

export interface ImprovementFeedback {
  priority: 1 | 2 | 3;
  title: string;
  explanation: string;
  action: string;
  evidence?: string;
}

export type GrammarCategory =
  | 'tense'
  | 'article'
  | 'preposition'
  | 'agreement'
  | 'word-order'
  | 'word-form'
  | 'plural'
  | 'sentence-fragment'
  | 'other';

export interface GrammarCorrection {
  original: string;
  corrected: string;
  explanation: string;
  category: GrammarCategory;
}

export interface ExpressionImprovement {
  original: string;
  improved: string;
  explanation: string;
}

export interface AnswerOutlineItem {
  order: number;
  label: string;
  guidance: string;
  exampleStarter?: string;
}

export interface RetryChecklistItem {
  id: string;
  instruction: string;
}

export type RetryMode = 'outline-only' | 'with-improved-answer';

export interface RetryContext {
  mode: RetryMode;
  outline: AnswerOutlineItem[];
  checklist: RetryChecklistItem[];
  improvedAnswer?: string;
  usefulExpressions?: string[];
}

export interface AICoachingResult {
  version: string;
  feedbackLanguage: FeedbackLanguage;
  desiredAnswerLevel: DesiredAnswerLevel;

  overallSummary: string;

  relevance: {
    rating: PracticeRating;
    explanation: string;
    answeredMainQuestion: boolean;
    missingElements: string[];
    evidence: EvidenceReference[];
  };

  structure: {
    rating: PracticeRating;
    explanation: string;
    hasOpening: boolean;
    hasSupportingDetails: boolean;
    hasExample: boolean;
    hasConclusion: boolean;
    evidence: EvidenceReference[];
  };

  strengths: StrengthFeedback[];
  priorityImprovements: ImprovementFeedback[];
  grammarCorrections: GrammarCorrection[];
  expressionImprovements: ExpressionImprovement[];
  answerOutline: AnswerOutlineItem[];
  improvedAnswer: string;
  usefulExpressions: string[];
  retryChecklist: RetryChecklistItem[];
  limitations: string[];
}

export interface CoachingRequest {
  questionId: string;
  question: string;
  category: string;
  difficulty: 'basic' | 'intermediate';
  transcript: string;
  recordingDurationSeconds: number;

  metrics: {
    totalWords: number;
    wordsPerMinute: number;
    totalFillerCount: number;
    repeatedWords: Array<{
      word: string;
      count: number;
    }>;
    repeatedPhrases: Array<{
      phrase: string;
      count: number;
    }>;
  };

  feedbackLanguage: FeedbackLanguage;
  desiredAnswerLevel: DesiredAnswerLevel;
  answerTimeLimitSeconds: number;
}

export type CoachingStatus =
  | 'idle'
  | 'validating'
  | 'requesting'
  | 'completed'
  | 'failed';

export type CoachingErrorCode =
  | 'INVALID_REQUEST'
  | 'TRANSCRIPT_TOO_SHORT'
  | 'TRANSCRIPT_TOO_LONG'
  | 'RATE_LIMITED'
  | 'COACHING_TIMEOUT'
  | 'INVALID_AI_RESPONSE'
  | 'COACHING_FAILED'
  | 'CONFIGURATION_ERROR'
  | 'REQUEST_TOO_LARGE';

export interface CoachingApiResponse {
  success: boolean;
  data?: {
    coaching: AICoachingResult;
    generatedAt: string;
  };
  error?: {
    code: CoachingErrorCode;
    message: string;
  };
}
