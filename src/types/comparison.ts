export type MetricType =
  | 'recording-duration'
  | 'total-words'
  | 'words-per-minute'
  | 'filler-count'
  | 'filler-rate'
  | 'unique-words'
  | 'lexical-diversity'
  | 'repeated-words'
  | 'repeated-phrases';

export type ChangeDirection = 'increased' | 'decreased' | 'unchanged';

export type MetricInterpretation = 'improved' | 'needs-review' | 'neutral';

export interface MetricChange {
  metric: MetricType;
  label: string;
  unit: string;
  previousValue: number;
  currentValue: number;
  absoluteChange: number;
  percentageChange: number | null;
  direction: ChangeDirection;
  interpretation: MetricInterpretation;
  explanation: string;
}

export interface TranscriptComparison {
  addedSentences: string[];
  removedSentences: string[];
  retainedSentences: string[];
  addedKeyTerms: string[];
  removedKeyTerms: string[];
  similarityPercentage: number;
}

export type ChecklistStatus = 'likely-applied' | 'not-confirmed' | 'not-applicable';

export interface ChecklistResult {
  id?: string;
  instruction: string;
  status: ChecklistStatus;
  evidence?: string;
  explanation: string;
}

export interface ComparisonSummary {
  improvedAreas: string[];
  maintainedStrengths: string[];
  areasToContinue: string[];
  recommendedNextAction: string;
}

export interface AIRetryComparison {
  appliedImprovements: Array<{
    title: string;
    evidence: string;
    explanation: string;
  }>;
  maintainedStrengths: Array<{
    title: string;
    evidence: string;
  }>;
  remainingPriorities: Array<{
    title: string;
    action: string;
    evidence?: string;
  }>;
  nextAction: string;
  limitations: string[];
}

export interface AttemptComparison {
  sessionId: string;
  baseAttemptId: string;
  comparedAttemptId: string;
  generatedAt: string;
  metricChanges: MetricChange[];
  transcriptChanges: TranscriptComparison;
  checklistResults: ChecklistResult[];
  summary: ComparisonSummary;
  aiComparison?: AIRetryComparison;
}
