import { z } from 'zod';

export const FeedbackLanguageSchema = z.enum(['ko', 'en']);
export const DesiredAnswerLevelSchema = z.enum(['current', 'one-step-better', 'challenging']);
export const PracticeRatingSchema = z.enum([
  'needs-development',
  'developing',
  'effective',
  'strong',
]);

export const GrammarCategorySchema = z.enum([
  'tense',
  'article',
  'preposition',
  'agreement',
  'word-order',
  'word-form',
  'plural',
  'sentence-fragment',
  'other',
]);

export const EvidenceReferenceSchema = z.object({
  quotedText: z.string().default(''),
  explanation: z.string().default(''),
});

export const StrengthFeedbackSchema = z.object({
  title: z.string(),
  explanation: z.string(),
  evidence: z.string().optional(),
});

export const ImprovementFeedbackSchema = z.object({
  priority: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  title: z.string(),
  explanation: z.string(),
  action: z.string(),
  evidence: z.string().optional(),
});

export const GrammarCorrectionSchema = z.object({
  original: z.string(),
  corrected: z.string(),
  explanation: z.string(),
  category: GrammarCategorySchema.default('other'),
});

export const ExpressionImprovementSchema = z.object({
  original: z.string(),
  improved: z.string(),
  explanation: z.string(),
});

export const AnswerOutlineItemSchema = z.object({
  order: z.number().int().min(1),
  label: z.string(),
  guidance: z.string(),
  exampleStarter: z.string().optional(),
});

export const RetryChecklistItemSchema = z.object({
  id: z.string(),
  instruction: z.string(),
});

export const AICoachingResultSchema = z.object({
  version: z.string().default('v1'),
  feedbackLanguage: FeedbackLanguageSchema,
  desiredAnswerLevel: DesiredAnswerLevelSchema,
  overallSummary: z.string().min(1),

  relevance: z.object({
    rating: PracticeRatingSchema,
    explanation: z.string(),
    answeredMainQuestion: z.boolean(),
    missingElements: z.array(z.string()).default([]),
    evidence: z.array(EvidenceReferenceSchema).default([]),
  }),

  structure: z.object({
    rating: PracticeRatingSchema,
    explanation: z.string(),
    hasOpening: z.boolean(),
    hasSupportingDetails: z.boolean(),
    hasExample: z.boolean(),
    hasConclusion: z.boolean(),
    evidence: z.array(EvidenceReferenceSchema).default([]),
  }),

  strengths: z.array(StrengthFeedbackSchema).max(3).default([]),
  priorityImprovements: z.array(ImprovementFeedbackSchema).max(3).default([]),
  grammarCorrections: z.array(GrammarCorrectionSchema).max(5).default([]),
  expressionImprovements: z.array(ExpressionImprovementSchema).max(5).default([]),
  answerOutline: z.array(AnswerOutlineItemSchema).max(5).default([]),
  improvedAnswer: z.string().min(1),
  usefulExpressions: z.array(z.string()).max(5).default([]),
  retryChecklist: z.array(RetryChecklistItemSchema).min(3).max(5),
  limitations: z.array(z.string()).default([]),
});

export const CoachingRequestSchema = z.object({
  questionId: z.string().min(1).max(100),
  question: z.string().min(1).max(500),
  category: z.string(),
  difficulty: z.enum(['basic', 'intermediate']),
  transcript: z
    .string()
    .min(1)
    .refine((text) => text.trim().split(/\s+/).filter(Boolean).length >= 10, {
      message: 'Transcript가 너무 짧습니다. 최소 10단어 이상이어야 합니다.',
    })
    .refine((text) => text.trim().split(/\s+/).filter(Boolean).length <= 1500, {
      message: 'Transcript가 너무 깁니다. 최대 1,500단어 이하이어야 합니다.',
    }),
  recordingDurationSeconds: z.number().min(1).max(600),

  metrics: z.object({
    totalWords: z.number().min(0),
    wordsPerMinute: z.number().min(0),
    totalFillerCount: z.number().min(0),
    repeatedWords: z.array(
      z.object({
        word: z.string(),
        count: z.number(),
      })
    ).default([]),
    repeatedPhrases: z.array(
      z.object({
        phrase: z.string(),
        count: z.number(),
      })
    ).default([]),
  }),

  feedbackLanguage: FeedbackLanguageSchema.default('ko'),
  desiredAnswerLevel: DesiredAnswerLevelSchema.default('one-step-better'),
  answerTimeLimitSeconds: z.number().min(15).max(300).default(60),
});

export type CoachingRequestInput = z.infer<typeof CoachingRequestSchema>;
export type AICoachingResultOutput = z.infer<typeof AICoachingResultSchema>;
