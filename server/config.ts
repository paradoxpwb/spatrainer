import dotenv from 'dotenv';
dotenv.config();

export const SERVER_CONFIG = {
  port: 3000,
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  provider: process.env.TRANSCRIPTION_PROVIDER || 'gemini',
  model: process.env.TRANSCRIPTION_MODEL || 'gemini-3.5-transcribe',
  timeoutMs: parseInt(process.env.TRANSCRIPTION_TIMEOUT_MS || '30000', 10),
  maxAudioSizeBytes: parseInt(process.env.MAX_AUDIO_SIZE_MB || '10', 10) * 1024 * 1024,

  // Sprint 3 AI Coaching Configuration
  aiProvider: process.env.AI_PROVIDER || 'gemini',
  aiApiKey: process.env.AI_API_KEY || process.env.GEMINI_API_KEY || '',
  aiModel: process.env.AI_MODEL || 'gemini-3.1-flash-lite',
  aiTimeoutMs: parseInt(process.env.AI_TIMEOUT_MS || '45000', 10),
  aiMaxOutputTokens: parseInt(process.env.AI_MAX_OUTPUT_TOKENS || '2500', 10),
  coachingPromptVersion: process.env.COACHING_PROMPT_VERSION || 'v1',

  allowedMimeBases: [
    'audio/webm',
    'audio/ogg',
    'audio/mp4',
    'audio/mpeg',
    'audio/wav',
    'audio/x-wav',
    'audio/aac',
    'audio/m4a',
  ],
};
