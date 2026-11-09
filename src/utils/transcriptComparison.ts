import { TranscriptComparison } from '../types/comparison';

const COMMON_STOP_WORDS = new Set([
  'about', 'above', 'after', 'again', 'against', 'all', 'and', 'any', 'are', 'aren',
  'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'can', 'cannot',
  'could', 'did', 'does', 'doing', 'don', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'her', 'here', 'hers', 'herself', 'him',
  'himself', 'his', 'how', 'into', 'its', 'itself', 'just', 'more', 'most', 'myself',
  'nor', 'not', 'now', 'off', 'once', 'only', 'other', 'our', 'ours', 'ourselves',
  'out', 'over', 'own', 'same', 'she', 'should', 'some', 'such', 'than', 'that',
  'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
  'this', 'those', 'through', 'too', 'under', 'until', 'very', 'was', 'were', 'what',
  'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'won', 'would',
  'you', 'your', 'yours', 'yourself', 'yourselves',
]);

/**
 * Split transcript into meaningful sentences.
 */
function splitIntoSentences(text: string): string[] {
  if (!text || !text.trim()) return [];
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Extract normalized words from a transcript, ignoring punctuation.
 */
function extractWords(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0);
}

/**
 * Extract substantive key terms (excluding common stop words, length >= 4).
 */
function extractKeyTerms(text: string): Set<string> {
  const words = extractWords(text);
  const terms = new Set<string>();
  for (const w of words) {
    if (w.length >= 4 && !COMMON_STOP_WORDS.has(w)) {
      terms.add(w);
    }
  }
  return terms;
}

/**
 * Compares two transcripts at sentence and word levels without heavy external dependencies.
 */
export function compareTranscripts(baseText: string, retryText: string): TranscriptComparison {
  const safeBase = baseText ? baseText.trim() : '';
  const safeRetry = retryText ? retryText.trim() : '';

  // Edge Case: Both empty
  if (!safeBase && !safeRetry) {
    return {
      addedSentences: [],
      removedSentences: [],
      retainedSentences: [],
      addedKeyTerms: [],
      removedKeyTerms: [],
      similarityPercentage: 100,
    };
  }

  // Edge Case: One empty
  if (!safeBase && safeRetry) {
    const retrySentences = splitIntoSentences(safeRetry);
    const keyTerms = Array.from(extractKeyTerms(safeRetry)).slice(0, 10);
    return {
      addedSentences: retrySentences,
      removedSentences: [],
      retainedSentences: [],
      addedKeyTerms: keyTerms,
      removedKeyTerms: [],
      similarityPercentage: 0,
    };
  }

  if (safeBase && !safeRetry) {
    const baseSentences = splitIntoSentences(safeBase);
    const keyTerms = Array.from(extractKeyTerms(safeBase)).slice(0, 10);
    return {
      addedSentences: [],
      removedSentences: baseSentences,
      retainedSentences: [],
      addedKeyTerms: [],
      removedKeyTerms: keyTerms,
      similarityPercentage: 0,
    };
  }

  const baseSentences = splitIntoSentences(safeBase);
  const retrySentences = splitIntoSentences(safeRetry);

  // Normalize sentences for matching (lowercase, strip trailing punctuation and extra spaces)
  const normalizeSentence = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();

  const normalizedBaseMap = new Map<string, string>();
  baseSentences.forEach((s) => normalizedBaseMap.set(normalizeSentence(s), s));

  const normalizedRetryMap = new Map<string, string>();
  retrySentences.forEach((s) => normalizedRetryMap.set(normalizeSentence(s), s));

  const retainedSentences: string[] = [];
  const addedSentences: string[] = [];
  const removedSentences: string[] = [];

  // Check retry sentences
  for (const [normRetry, origRetry] of normalizedRetryMap.entries()) {
    if (normalizedBaseMap.has(normRetry)) {
      retainedSentences.push(origRetry);
    } else {
      addedSentences.push(origRetry);
    }
  }

  // Check base sentences for removed
  for (const [normBase, origBase] of normalizedBaseMap.entries()) {
    if (!normalizedRetryMap.has(normBase)) {
      removedSentences.push(origBase);
    }
  }

  // Key Term changes
  const baseKeyTerms = extractKeyTerms(safeBase);
  const retryKeyTerms = extractKeyTerms(safeRetry);

  const addedKeyTerms: string[] = [];
  for (const term of retryKeyTerms) {
    if (!baseKeyTerms.has(term)) {
      addedKeyTerms.push(term);
    }
  }

  const removedKeyTerms: string[] = [];
  for (const term of baseKeyTerms) {
    if (!retryKeyTerms.has(term)) {
      removedKeyTerms.push(term);
    }
  }

  // Calculate text similarity using word-level Jaccard index
  const baseWordsSet = new Set(extractWords(safeBase));
  const retryWordsSet = new Set(extractWords(safeRetry));

  let intersectionCount = 0;
  for (const word of baseWordsSet) {
    if (retryWordsSet.has(word)) {
      intersectionCount++;
    }
  }

  const unionSize = new Set([...baseWordsSet, ...retryWordsSet]).size;
  const similarityPercentage =
    unionSize > 0 ? Math.round((intersectionCount / unionSize) * 100) : 100;

  return {
    addedSentences,
    removedSentences,
    retainedSentences,
    addedKeyTerms: addedKeyTerms.slice(0, 8),
    removedKeyTerms: removedKeyTerms.slice(0, 8),
    similarityPercentage,
  };
}
