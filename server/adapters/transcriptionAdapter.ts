export interface TranscribeOptions {
  language?: string;
  timeoutMs?: number;
}

export interface TranscriptionAdapter {
  readonly name: string;
  readonly model: string;
  transcribe(audioBuffer: Buffer, mimeType: string, options?: TranscribeOptions): Promise<string>;
}
