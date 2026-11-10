export type RecordingState =
  | 'idle'
  | 'preparing'
  | 'requesting-permission'
  | 'ready-to-record'
  | 'recording'
  | 'processing'
  | 'completed'
  | 'error';

export type AppStep =
  | 'home'
  | 'setup'
  | 'question-ready'
  | 'practice'
  | 'result'
  | 'comparison'
  | 'progress'
  | 'history'
  | 'session-detail'
  | 'settings'
  | 'guide'
  | 'mock-exam';

export interface CompletedRecording {
  blob: Blob;
  url: string;
  mimeType: string;
  duration: number;
}

export interface RecordingResultData {
  audioBlob: Blob | null;
  audioUrl: string | null;
  actualDuration: number; // in seconds
  configuredDuration: number;
  listeningPlaybackCount?: number;
}
