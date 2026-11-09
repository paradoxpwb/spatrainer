import { DesiredAnswerLevel, FeedbackLanguage } from '../types/coaching';

export const COACHING_PROMPT_VERSION = 'v1';

/**
 * Normalizes transcript text by collapsing redundant whitespace and line breaks.
 */
export function normalizeTranscriptForComparison(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

/**
 * Generate a deterministic cache key for coaching requests.
 */
export function generateCoachingCacheKey(params: {
  questionId: string;
  transcript: string;
  feedbackLanguage: FeedbackLanguage;
  desiredAnswerLevel: DesiredAnswerLevel;
  promptVersion?: string;
}): string {
  const normalized = normalizeTranscriptForComparison(params.transcript);
  const version = params.promptVersion || COACHING_PROMPT_VERSION;
  return `${params.questionId}::${params.feedbackLanguage}::${params.desiredAnswerLevel}::${version}::${normalized}`;
}

/**
 * Simple fast string hash for compact tracking
 */
export function computeStringHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}
