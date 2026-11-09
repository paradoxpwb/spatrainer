export type TranscriptionStatus =
  | 'idle'
  | 'uploading'
  | 'transcribing'
  | 'completed'
  | 'failed'
  | 'manual';

export interface TranscriptionResult {
  transcript: string;
  language: string;
  provider?: string;
  model?: string;
  createdAt: string;
}

export type TranscriptionErrorCode =
  | 'AUDIO_REQUIRED'
  | 'EMPTY_AUDIO'
  | 'UNSUPPORTED_AUDIO_TYPE'
  | 'AUDIO_TOO_LARGE'
  | 'AUDIO_TOO_SHORT'
  | 'INVALID_REQUEST'
  | 'TRANSCRIPTION_TIMEOUT'
  | 'TRANSCRIPTION_FAILED'
  | 'RATE_LIMITED'
  | 'CONFIGURATION_ERROR';

export interface TranscriptionApiResponse {
  success: boolean;
  data?: TranscriptionResult;
  error?: {
    code: TranscriptionErrorCode;
    message: string;
  };
}
