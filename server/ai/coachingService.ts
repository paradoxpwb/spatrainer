import { SERVER_CONFIG } from '../config.ts';
import type { AiProvider } from './aiProvider.ts';
import type { AICoachingResultOutput, CoachingRequestInput } from './coachingSchema.ts';
import { CoachingRequestSchema } from './coachingSchema.ts';
import { GeminiCoachingProvider } from './geminiCoachingProvider.ts';

export class CoachingService {
  private provider: AiProvider;

  constructor() {
    switch (SERVER_CONFIG.aiProvider) {
      case 'gemini':
      default:
        this.provider = new GeminiCoachingProvider();
        break;
    }
  }

  async processCoachingRequest(rawInput: unknown): Promise<AICoachingResultOutput> {
    // 1. Schema Validation
    const parsedRequest = CoachingRequestSchema.safeParse(rawInput);
    if (!parsedRequest.success) {
      const err = new Error(parsedRequest.error.issues.map((i) => i.message).join(', '));
      (err as any).code = 'INVALID_REQUEST';
      throw err;
    }

    const req = parsedRequest.data;

    // 2. Word count checks (10 to 1,500 words)
    const words = req.transcript.trim().split(/\s+/).filter(Boolean);
    if (words.length < 10) {
      const err = new Error('Transcript is too short. At least 10 words required.');
      (err as any).code = 'TRANSCRIPT_TOO_SHORT';
      throw err;
    }

    if (words.length > 1500) {
      const err = new Error('Transcript is too long. Max 1,500 words allowed.');
      (err as any).code = 'TRANSCRIPT_TOO_LONG';
      throw err;
    }

    // 3. Execute AI provider
    return await this.provider.generateCoaching(req);
  }
}

export const coachingService = new CoachingService();
