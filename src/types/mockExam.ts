/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MockVisualType = 'chart' | 'photo';

export interface MockVisualItem {
  id: string;
  type: MockVisualType;
  imageUrl: string;
  promptText: string;
  audioUrl?: string;
  altText: string;
}

export type MockPartType =
  | 'personal_1'
  | 'personal_2'
  | 'passage_summary'
  | 'passage_followup'
  | 'social_opinion'
  | 'visual_description'
  | string; // Extensible for future parts like social_followup

export interface MockPartConfig {
  partNumber: number;
  partId: MockPartType;
  partTitle: string;
  prepSeconds: number;
  answerMaxSeconds: number;
  description: string;
}

export interface MockExamBlueprint {
  title: string;
  totalMaxTimeSeconds: number; // e.g. 13 * 60 = 780s
  parts: MockPartConfig[];
}

export interface MockQuestionItem {
  partNumber: number;
  partId: MockPartType;
  partTitle: string;
  promptText: string;
  audioUrl?: string;
  prepSeconds: number;
  answerMaxSeconds: number;
  visual?: MockVisualItem;
  passageText?: string;
  passageTitle?: string;
  keyPoints?: string[];
}

export type MockRunPhase =
  | 'idle'
  | 'playingPrompt'
  | 'prep'
  | 'recording'
  | 'saving';

export type MockExamStage =
  | 'intro'
  | 'check'
  | 'run'
  | 'finish'
  | 'result';

export interface MockRecordedItem {
  partNumber: number;
  partId: string;
  partTitle: string;
  promptText: string;
  audioBlob: Blob | null;
  audioUrl: string | null;
  durationSeconds: number;
  maxDurationSeconds: number;
  visual?: MockVisualItem;
}

export interface MockExamResult {
  id: string;
  startedAt: number;
  finishedAt: number;
  totalElapsedSeconds: number;
  tabSwitchCount: number;
  items: MockRecordedItem[];
  terminatedByTotalTimeout: boolean;
  visualTypePicked?: MockVisualType;
  visualItemUsed?: MockVisualItem;
}
