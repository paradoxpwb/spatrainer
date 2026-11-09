import { GoogleGenAI } from '@google/genai';
import { SERVER_CONFIG } from '../config.ts';
import type { TranscriptionAdapter, TranscribeOptions } from './transcriptionAdapter.ts';

export class GeminiTranscriptionAdapter implements TranscriptionAdapter {
  readonly name = 'gemini';
  readonly model = SERVER_CONFIG.model;
  private ai: GoogleGenAI | null = null;

  constructor() {
    if (SERVER_CONFIG.geminiApiKey) {
      this.ai = new GoogleGenAI({
        apiKey: SERVER_CONFIG.geminiApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }

  async transcribe(
    audioBuffer: Buffer,
    mimeType: string,
    options?: TranscribeOptions
  ): Promise<string> {
    if (!SERVER_CONFIG.geminiApiKey || !this.ai) {
      const err = new Error('Transcription API key is not configured.');
      (err as any).code = 'CONFIGURATION_ERROR';
      throw err;
    }

    // Clean base mime type without codec parameters (e.g. "audio/webm;codecs=opus" -> "audio/webm")
    const cleanMimeType = mimeType.split(';')[0].trim().toLowerCase() || 'audio/webm';
    const timeoutMs = options?.timeoutMs || SERVER_CONFIG.timeoutMs;

    const promptText =
      "Transcribe the English speech as accurately as possible. Preserve the speaker's wording, grammatical mistakes, repetitions, and audible filler words. Do not improve, summarize, translate, or answer the content. Return only the transcript.";

    const base64Audio = audioBuffer.toString('base64');
    const audioPart = {
      inlineData: {
        mimeType: cleanMimeType,
        data: base64Audio,
      },
    };

    const callPromise = this.ai.models.generateContent({
      model: this.model,
      contents: {
        parts: [audioPart, { text: promptText }],
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      const timer = setTimeout(() => {
        const timeoutErr = new Error('Transcription request timed out.');
        (timeoutErr as any).code = 'TRANSCRIPTION_TIMEOUT';
        reject(timeoutErr);
      }, timeoutMs);
      if (typeof timer.unref === 'function') timer.unref();
    });

    try {
      const response = await Promise.race([callPromise, timeoutPromise]);
      const rawTranscript = response.text || '';

      // Clean up any leading/trailing quotes or markdown codeblocks defensively
      let cleaned = rawTranscript.trim();
      if (cleaned.startsWith('```') && cleaned.endsWith('```')) {
        cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
      }
      return cleaned;
    } catch (err: any) {
      if (err.code === 'TRANSCRIPTION_TIMEOUT') {
        throw err;
      }

      const status = err.status || err.statusCode;
      const message = String(err.message || '');

      if (status === 429 || message.includes('RESOURCE_EXHAUSTED') || message.includes('rate limit')) {
        const rateLimitErr = new Error('API rate limit exceeded.');
        (rateLimitErr as any).code = 'RATE_LIMITED';
        throw rateLimitErr;
      }

      if (status === 401 || status === 403 || message.includes('API_KEY_INVALID') || message.includes('PERMISSION_DENIED')) {
        const authErr = new Error('API authentication failed.');
        (authErr as any).code = 'CONFIGURATION_ERROR';
        throw authErr;
      }

      const failedErr = new Error('Transcription failed on provider.');
      (failedErr as any).code = 'TRANSCRIPTION_FAILED';
      throw failedErr;
    }
  }
}
