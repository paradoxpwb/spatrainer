import { GoogleGenAI } from '@google/genai';
import { SERVER_CONFIG } from '../config.ts';
import { buildSystemPrompt, buildUserPrompt } from '../prompts/speakingCoachPrompt.ts';
import type { AiProvider } from './aiProvider.ts';
import { AICoachingResultSchema, type AICoachingResultOutput, type CoachingRequestInput } from './coachingSchema.ts';

export class GeminiCoachingProvider implements AiProvider {
  readonly name = 'gemini';
  readonly model = SERVER_CONFIG.aiModel;
  private ai: GoogleGenAI | null = null;

  constructor() {
    if (SERVER_CONFIG.aiApiKey) {
      this.ai = new GoogleGenAI({
        apiKey: SERVER_CONFIG.aiApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }

  async generateCoaching(request: CoachingRequestInput): Promise<AICoachingResultOutput> {
    if (!SERVER_CONFIG.aiApiKey || !this.ai) {
      const err = new Error('AI API key is not configured.');
      (err as any).code = 'CONFIGURATION_ERROR';
      throw err;
    }

    const systemPrompt = buildSystemPrompt(request.feedbackLanguage);
    const userPrompt = buildUserPrompt(request);

    const callPromise = this.ai.models.generateContent({
      model: this.model,
      contents: [{ text: userPrompt }],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      const timer = setTimeout(() => {
        const timeoutErr = new Error('AI coaching generation timed out.');
        (timeoutErr as any).code = 'COACHING_TIMEOUT';
        reject(timeoutErr);
      }, SERVER_CONFIG.aiTimeoutMs);
      if (typeof timer.unref === 'function') timer.unref();
    });

    let rawText = '';
    try {
      const response = await Promise.race([callPromise, timeoutPromise]);
      rawText = response.text || '';
    } catch (err: any) {
      if (err.code === 'COACHING_TIMEOUT') {
        throw err;
      }
      const status = err.status || err.statusCode;
      const message = String(err.message || '');

      if (status === 429 || message.includes('RESOURCE_EXHAUSTED') || message.includes('rate limit')) {
        const rateLimitErr = new Error('AI rate limit reached.');
        (rateLimitErr as any).code = 'RATE_LIMITED';
        throw rateLimitErr;
      }

      if (status === 401 || status === 403 || message.includes('API_KEY_INVALID') || message.includes('PERMISSION_DENIED')) {
        const authErr = new Error('AI provider authentication failed.');
        (authErr as any).code = 'CONFIGURATION_ERROR';
        throw authErr;
      }

      console.error('[SPA DEBUG] AI coaching provider call failed:', err?.status, err?.message || err);
      const failErr = new Error('AI coaching provider request failed.');
      (failErr as any).code = 'COACHING_FAILED';
      throw failErr;
    }

    // Try parsing and validating
    try {
      return this.parseAndValidate(rawText, request);
    } catch (parseErr) {
      console.warn('Initial AI JSON validation failed, attempting 1 recovery attempt...', parseErr);
      // Attempt 1 recovery attempt as per specification
      try {
        const recoveredText = await this.attemptJsonRecovery(rawText);
        return this.parseAndValidate(recoveredText, request);
      } catch (recoveryErr) {
        console.error('AI JSON recovery failed:', recoveryErr);
        const err = new Error('Invalid AI response schema.');
        (err as any).code = 'INVALID_AI_RESPONSE';
        throw err;
      }
    }
  }

  private parseAndValidate(raw: string, request: CoachingRequestInput): AICoachingResultOutput {
    let clean = raw.trim();
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
    }

    const parsed = JSON.parse(clean);

    // Ensure version and request echo match
    if (!parsed.version) parsed.version = SERVER_CONFIG.coachingPromptVersion;
    if (!parsed.feedbackLanguage) parsed.feedbackLanguage = request.feedbackLanguage;
    if (!parsed.desiredAnswerLevel) parsed.desiredAnswerLevel = request.desiredAnswerLevel;

    return AICoachingResultSchema.parse(parsed);
  }

  private async attemptJsonRecovery(brokenJson: string): Promise<string> {
    if (!this.ai) throw new Error('AI not configured');

    const recoveryPrompt = `Fix the following malformed JSON to make it completely valid JSON matching the coaching response structure. Output ONLY valid JSON with no markdown:\n\n${brokenJson.slice(
      0,
      3000
    )}`;

    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: [{ text: recoveryPrompt }],
      config: {
        responseMimeType: 'application/json',
      },
    });

    return response.text || '';
  }
}
