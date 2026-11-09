import { SERVER_CONFIG } from '../config.ts';
import { GeminiTranscriptionAdapter } from './geminiAdapter.ts';
import type { TranscriptionAdapter } from './transcriptionAdapter.ts';

export function getTranscriptionAdapter(): TranscriptionAdapter {
  switch (SERVER_CONFIG.provider) {
    case 'gemini':
    default:
      return new GeminiTranscriptionAdapter();
  }
}
