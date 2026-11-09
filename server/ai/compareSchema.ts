import { z } from 'zod';
import { FeedbackLanguageSchema } from './coachingSchema.ts';

export const CompareRetryRequestSchema = z.object({
  question: z.string().min(1),
  baseTranscript: z.string().min(1),
  retryTranscript: z.string().min(1),
  baseMetrics: z.object({
    duration: z.number(),
    wpm: z.number(),
    fillerRate: z.number(),
    totalWords: z.number(),
  }),
  retryMetrics: z.object({
    duration: z.number(),
    wpm: z.number(),
    fillerRate: z.number(),
    totalWords: z.number(),
  }),
  originalPriorityImprovements: z.array(z.string()).default([]),
  originalRetryChecklist: z.array(z.string()).default([]),
  feedbackLanguage: FeedbackLanguageSchema.default('ko'),
});

export const AIRetryComparisonSchema = z.object({
  appliedImprovements: z.array(
    z.object({
      title: z.string(),
      evidence: z.string(),
      explanation: z.string(),
    })
  ).default([]),
  maintainedStrengths: z.array(
    z.object({
      title: z.string(),
      evidence: z.string(),
    })
  ).default([]),
  remainingPriorities: z.array(
    z.object({
      title: z.string(),
      action: z.string(),
      evidence: z.string().optional(),
    })
  ).default([]),
  nextAction: z.string(),
  limitations: z.array(z.string()).default([]),
});

export type CompareRetryRequestInput = z.infer<typeof CompareRetryRequestSchema>;
export type AIRetryComparisonOutput = z.infer<typeof AIRetryComparisonSchema>;
