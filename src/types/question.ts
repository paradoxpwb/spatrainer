/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Legacy category types kept for backward compatibility and migration
export type QuestionCategory =
  | 'self-introduction'
  | 'daily-life'
  | 'work'
  | 'experience'
  | 'situation'
  | 'opinion'
  | 'problem-solving'
  | 'travel-leisure';

// TODO: Remove legacy CategorySelection path after migration is complete
export type LegacyCategorySelection = QuestionCategory | 'all';
export type CategorySelection = LegacyCategorySelection;

export interface CategoryMetadata {
  id: QuestionCategory;
  label: string;
  englishLabel: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Sprint 5 Taxonomy: Practice Area & Topic Architecture
// ---------------------------------------------------------------------------

export type PracticeAreaId =
  | 'area-1-personal-workplace'
  | 'area-2-business-follow-up'
  | 'area-3-opinion-extended'
  | 'area-4-listening-summary'
  | 'area-5-visual-prompt';

export type TopicId =
  | 'self-introduction'
  | 'daily-life'
  | 'workplace'
  | 'experience'
  | 'situation'
  | 'opinion'
  | 'problem-solving'
  | 'travel-leisure';

export type ExtensibleTopicId =
  | TopicId
  | 'customer-service'
  | 'business'
  | 'technology'
  | 'product'
  | 'management'
  | 'social-issues';

export type PracticeMode =
  | 'standard-question'
  | 'follow-up-question'
  | 'extended-response'
  | 'listening-summary'
  | 'visual-prompt';

export type AttemptTurnType =
  | 'main-question'
  | 'follow-up'
  | 'summary'
  | 'visual-response';

export type VisualTaskType =
  | 'describe'
  | 'compare'
  | 'preference'
  | 'explain-trend'
  | 'recommendation';

export interface PracticeAreaDefinition {
  id: PracticeAreaId;
  order: number;
  labelKo: string;
  labelEn: string;
  description: string;
  practiceMode: PracticeMode;
  defaultPreparationSeconds: number;
  defaultAnswerSeconds: number;
  enabled: boolean;
  availableTopicIds: TopicId[];
}

export interface TopicDefinition {
  id: TopicId;
  labelKo: string;
  labelEn: string;
  description?: string;
  enabled: boolean;
}

export type PracticeAreaSelection = PracticeAreaId | 'all';
export type TopicSelection = TopicId | 'all';

export interface PracticeSelection {
  practiceArea: PracticeAreaSelection;
  topic: TopicSelection;
}

export interface QuestionFilter {
  practiceArea: PracticeAreaSelection;
  topic: TopicSelection;
  excludeQuestionId?: string;
  practiceMode?: PracticeMode;
}

// ---------------------------------------------------------------------------
// Discriminated Union for Speaking Questions by practiceMode
// ---------------------------------------------------------------------------

export interface BasePracticeItem {
  id: string;
  practiceArea: PracticeAreaId;
  topic: TopicId;
  difficulty: 'basic' | 'intermediate';
  title?: string;
  tags?: string[];
  // TODO: Remove legacy category fields after migration is complete
  category?: QuestionCategory;
  categoryLabel?: string;
}

export interface StandardSpeakingQuestion extends BasePracticeItem {
  practiceMode: 'standard-question';
  question: string;
}

export interface ExtendedResponseSpeakingQuestion extends BasePracticeItem {
  practiceMode: 'extended-response';
  question: string;
}

export interface FollowUpSpeakingQuestion extends BasePracticeItem {
  practiceMode: 'follow-up-question';
  question: string;
  followUpQuestions: string[];
}

export interface ListeningSummaryQuestion extends BasePracticeItem {
  practiceMode: 'listening-summary';
  /**
   * Passage content: STRICTLY HIDDEN from the learner during listening and speaking.
   * Only used internally by TTS synthesis and evaluation.
   */
  passage: string;
  passageWordCount: number;
  estimatedListeningSeconds: number;
  playbackLimit: 2;
  keyPoints: string[];
  forbiddenVisibleDuringListening: true;
  // Prompt label shown to the user instead of passage
  question?: string;
}

export interface VisualPromptQuestion extends BasePracticeItem {
  practiceMode: 'visual-prompt';
  question: string;
  visualType: 'photo' | 'graph' | 'table' | 'map' | 'text-prompt';
  visualAsset?: string;
  visualAlt: string;
  expectedElements?: string[];
  taskType?: VisualTaskType;
}

export type SpeakingQuestion =
  | StandardSpeakingQuestion
  | ExtendedResponseSpeakingQuestion
  | FollowUpSpeakingQuestion
  | ListeningSummaryQuestion
  | VisualPromptQuestion;

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export const PRACTICE_SETTINGS_SCHEMA_VERSION = 2;

export interface PracticeSettings {
  schemaVersion?: number;
  preparationDuration: number; // 15, 30, 45
  answerDuration: number; // 60, 90, 120
  lastSelectedPracticeArea?: PracticeAreaSelection | null;
  lastSelectedTopic?: TopicId | 'all' | null;
  // TODO: Remove legacy lastSelectedCategory after migration is complete
  lastSelectedCategory?: CategorySelection | null;
}
