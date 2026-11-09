import { RepeatedPhrase, RepeatedWord, ResponseLengthStatus, SpeakingMetrics } from '../types/metrics';
import {
  MULTI_WORD_FILLERS,
  normalizeText,
  SINGLE_WORD_FILLERS,
  splitSentences,
  STOP_WORDS,
  tokenizeWords,
} from './transcriptUtils';

/**
 * Calculate objective speaking metrics from a transcript and recording duration.
 * This is a pure mathematical and linguistic heuristic function running entirely in client code.
 */
export function calculateSpeakingMetrics(
  transcript: string,
  recordingDurationSeconds: number
): SpeakingMetrics {
  const safeDuration = Math.max(0, Math.round(recordingDurationSeconds));
  const rawText = transcript ? transcript.trim() : '';

  if (!rawText) {
    return {
      recordingDurationSeconds: safeDuration,
      totalWords: 0,
      wordsPerMinute: 0,
      sentenceCount: 0,
      averageWordsPerSentence: 0,
      uniqueWordCount: 0,
      lexicalDiversity: 0,
      fillerCounts: {},
      totalFillerCount: 0,
      fillerRatePer100Words: 0,
      repeatedWords: [],
      repeatedPhrases: [],
      responseLengthStatus: getResponseLengthStatus(safeDuration),
    };
  }

  // 1. Words & Sentences
  const words = tokenizeWords(rawText);
  const totalWords = words.length;
  const lowerWords = words.map((w) => normalizeText(w));

  const sentences = splitSentences(rawText);
  const sentenceCount = sentences.length > 0 ? sentences.length : (totalWords > 0 ? 1 : 0);

  // 2. Words Per Minute (WPM)
  let wordsPerMinute = 0;
  if (safeDuration >= 1 && totalWords > 0) {
    const rawWpm = (totalWords / safeDuration) * 60;
    wordsPerMinute = Number.isFinite(rawWpm) ? Math.round(rawWpm) : 0;
  }

  // 3. Average Words Per Sentence
  let averageWordsPerSentence = 0;
  if (sentenceCount > 0 && totalWords > 0) {
    averageWordsPerSentence = Math.round((totalWords / sentenceCount) * 10) / 10;
  }

  // 4. Unique Words & Lexical Diversity
  const uniqueWordSet = new Set(lowerWords);
  const uniqueWordCount = uniqueWordSet.size;
  const lexicalDiversity = totalWords > 0
    ? Math.round((uniqueWordCount / totalWords) * 1000) / 1000
    : 0;

  // 5. Filler Words Detection
  // To avoid double-counting, detect multi-word fillers first and mask them out.
  const fillerCounts: Record<string, number> = {};
  let totalFillerCount = 0;
  let textForFillers = ` ${normalizeText(rawText)} `;

  for (const multiFiller of MULTI_WORD_FILLERS) {
    const escaped = multiFiller.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'g');
    const matches = textForFillers.match(regex);
    if (matches && matches.length > 0) {
      fillerCounts[multiFiller] = matches.length;
      totalFillerCount += matches.length;
      // Mask matched multi-word fillers to prevent inner single-word collisions
      textForFillers = textForFillers.replace(regex, ' __FILLER__ ');
    }
  }

  // Detect single-word fillers in remaining text
  const remainingWords = tokenizeWords(textForFillers);
  for (const word of remainingWords) {
    const lower = normalizeText(word);
    if (SINGLE_WORD_FILLERS.includes(lower)) {
      fillerCounts[lower] = (fillerCounts[lower] || 0) + 1;
      totalFillerCount += 1;
    }
  }

  const fillerRatePer100Words = totalWords > 0
    ? Math.round((totalFillerCount / totalWords) * 100 * 10) / 10
    : 0;

  // 6. Repeated Words (frequency >= 3, excluding common stop words)
  const wordFrequencyMap: Record<string, number> = {};
  for (const w of lowerWords) {
    if (!STOP_WORDS.has(w) && w.length > 1) {
      wordFrequencyMap[w] = (wordFrequencyMap[w] || 0) + 1;
    }
  }

  const repeatedWords: RepeatedWord[] = Object.entries(wordFrequencyMap)
    .filter(([_, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => ({ word, count }));

  // 7. Repeated Phrases (2-gram and 3-gram sequences occurring >= 2 times)
  const phraseFrequencyMap: Record<string, number> = {};

  // Helper: check if n-gram is only stop words
  const isAllStopWords = (ngramWords: string[]) => ngramWords.every((w) => STOP_WORDS.has(w));

  // 2-grams
  for (let i = 0; i < lowerWords.length - 1; i++) {
    const pair = [lowerWords[i], lowerWords[i + 1]];
    if (!isAllStopWords(pair)) {
      const phrase = pair.join(' ');
      phraseFrequencyMap[phrase] = (phraseFrequencyMap[phrase] || 0) + 1;
    }
  }

  // 3-grams
  for (let i = 0; i < lowerWords.length - 2; i++) {
    const triplet = [lowerWords[i], lowerWords[i + 1], lowerWords[i + 2]];
    if (!isAllStopWords(triplet)) {
      const phrase = triplet.join(' ');
      phraseFrequencyMap[phrase] = (phraseFrequencyMap[phrase] || 0) + 1;
    }
  }

  const repeatedPhrases: RepeatedPhrase[] = Object.entries(phraseFrequencyMap)
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([phrase, count]) => ({ phrase, count }));

  // 8. Response Length Status
  const responseLengthStatus = getResponseLengthStatus(safeDuration);

  return {
    recordingDurationSeconds: safeDuration,
    totalWords,
    wordsPerMinute,
    sentenceCount,
    averageWordsPerSentence,
    uniqueWordCount,
    lexicalDiversity,
    fillerCounts,
    totalFillerCount,
    fillerRatePer100Words,
    repeatedWords,
    repeatedPhrases,
    responseLengthStatus,
  };
}

/**
 * Determine response length category based on duration
 */
export function getResponseLengthStatus(durationSeconds: number): ResponseLengthStatus {
  if (durationSeconds < 15) return 'very-short';
  if (durationSeconds <= 29) return 'short';
  if (durationSeconds <= 90) return 'balanced';
  return 'long';
}

/**
 * Korean guidance text for response length
 */
export function getResponseLengthDescription(status: ResponseLengthStatus): string {
  switch (status) {
    case 'very-short':
      return '답변이 매우 짧습니다. 이유나 구체적인 예시를 추가해 보세요.';
    case 'short':
      return '핵심 답변은 가능하지만, 배경이나 예시를 조금 더 추가할 수 있습니다.';
    case 'balanced':
      return '연습에 적절한 길이의 답변입니다.';
    case 'long':
      return '충분히 자세한 답변입니다. 핵심 내용이 반복되지 않는지 확인해 보세요.';
  }
}
