/**
 * Common English contraction and word tokenization regex
 * Matches words with internal apostrophes (e.g. don't, I'm, we've, they're, user's)
 */
const WORD_REGEX = /[a-zA-Z0-9]+(?:['’][a-zA-Z0-9]+)*/g;

/**
 * Standard stop words excluded from repeated word analysis
 */
export const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'to', 'of', 'in', 'on', 'at',
  'for', 'with', 'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'our',
  'their', 'this', 'that', 'as', 'by', 'from', 'if'
]);

/**
 * Multi-word filler phrases (ordered by word count descending to match longest first)
 */
export const MULTI_WORD_FILLERS = [
  'what i mean is',
  'how can i say',
  'let me think',
  'you know',
  'i mean',
  'kind of',
  'sort of',
];

/**
 * Single-word filler words
 */
export const SINGLE_WORD_FILLERS = [
  'um',
  'uh',
  'er',
  'erm',
  'hmm',
  'well',
  'actually',
  'basically',
  'literally',
];

/**
 * Tokenize a transcript into cleaned English words.
 * Correctly treats contractions (e.g. don't, I'm, we've) as single words.
 */
export function tokenizeWords(text: string): string[] {
  if (!text || typeof text !== 'string') return [];
  const matches = text.match(WORD_REGEX);
  if (!matches) return [];
  return matches.map((w) => w.trim()).filter((w) => w.length > 0);
}

/**
 * Split transcript into sentences based on punctuation (. ! ?)
 * Handles multiple spaces, ellipses, and unpunctuated text cleanly.
 */
export function splitSentences(text: string): string[] {
  if (!text || typeof text !== 'string') return [];
  const trimmed = text.trim();
  if (!trimmed) return [];

  // Match sentences ending in ., !, ? or newline
  const rawSegments = trimmed
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (rawSegments.length > 0) {
    return rawSegments;
  }

  // Fallback heuristic: If no punctuation exists but text is long,
  // return single sentence if non-empty
  return [trimmed];
}

/**
 * Clean and normalize text for comparative analysis
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text.toLowerCase().replace(/['’]/g, "'").trim();
}
