export type ResponseLengthStatus = 'very-short' | 'short' | 'balanced' | 'long';

export interface RepeatedWord {
  word: string;
  count: number;
}

export interface RepeatedPhrase {
  phrase: string;
  count: number;
}

export interface SpeakingMetrics {
  recordingDurationSeconds: number;
  totalWords: number;
  wordsPerMinute: number;
  sentenceCount: number;
  averageWordsPerSentence: number;
  uniqueWordCount: number;
  lexicalDiversity: number; // 0 to 1
  fillerCounts: Record<string, number>;
  totalFillerCount: number;
  fillerRatePer100Words: number;
  repeatedWords: RepeatedWord[];
  repeatedPhrases: RepeatedPhrase[];
  responseLengthStatus: ResponseLengthStatus;
}
