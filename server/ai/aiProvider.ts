import type { AICoachingResultOutput, CoachingRequestInput } from './coachingSchema.ts';

export interface AiProvider {
  readonly name: string;
  readonly model: string;
  generateCoaching(request: CoachingRequestInput): Promise<AICoachingResultOutput>;
}
