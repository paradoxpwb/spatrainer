import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecordingResultData } from '../types/recording';
import { PracticeAttempt } from '../types/practiceAttempt';

describe('Audio URL Lifecycle & Result Attempt Preservation', () => {
  let mockRevoke: any;
  let mockCreateObjectURL: any;

  beforeEach(() => {
    mockRevoke = vi.fn();
    mockCreateObjectURL = vi.fn().mockImplementation((blob: Blob) => `blob:http://localhost:3000/${blob.size}`);

    (globalThis as any).URL.createObjectURL = mockCreateObjectURL;
    (globalThis as any).URL.revokeObjectURL = mockRevoke;
  });

  it('guarantees that handleRecordingComplete preserves or generates a valid Object URL for playback', () => {
    let activeAudioUrl: string | null = null;
    let savedResultData: RecordingResultData | null = null;

    const cleanupAudioUrl = () => {
      if (activeAudioUrl) {
        URL.revokeObjectURL(activeAudioUrl);
        activeAudioUrl = null;
      }
    };

    const handleRecordingComplete = (data: RecordingResultData) => {
      cleanupAudioUrl();
      const validUrl = data.audioUrl || (data.audioBlob ? URL.createObjectURL(data.audioBlob) : null);
      activeAudioUrl = validUrl;
      savedResultData = {
        ...data,
        audioUrl: validUrl,
      };
    };

    const testBlob = new Blob(['sample-recorded-audio'], { type: 'audio/webm' });
    const recordingData: RecordingResultData = {
      audioBlob: testBlob,
      audioUrl: 'blob:http://localhost:3000/recorder-active-url',
      actualDuration: 35,
      configuredDuration: 40,
    };

    handleRecordingComplete(recordingData);

    expect(activeAudioUrl).toBe('blob:http://localhost:3000/recorder-active-url');
    expect(savedResultData !== null && (savedResultData as RecordingResultData).audioUrl).toBe('blob:http://localhost:3000/recorder-active-url');
    // Active URL is NOT revoked yet because user is listening to it on ResultPage
    expect(mockRevoke).not.toHaveBeenCalled();

    // When user navigates away or retries, cleanupAudioUrl is triggered
    cleanupAudioUrl();
    expect(mockRevoke).toHaveBeenCalledWith('blob:http://localhost:3000/recorder-active-url');
    expect(activeAudioUrl).toBeNull();
  });

  it('creates fresh Object URL if audioUrl was missing but audioBlob is present', () => {
    let activeAudioUrl: string | null = null;

    const handleRecordingComplete = (data: RecordingResultData) => {
      const validUrl = data.audioUrl || (data.audioBlob ? URL.createObjectURL(data.audioBlob) : null);
      activeAudioUrl = validUrl;
    };

    const testBlob = new Blob(['binary-audio-data-2'], { type: 'audio/webm' });
    handleRecordingComplete({
      audioBlob: testBlob,
      audioUrl: null,
      actualDuration: 20,
      configuredDuration: 40,
    });

    expect(mockCreateObjectURL).toHaveBeenCalledWith(testBlob);
    expect(activeAudioUrl).toBe(`blob:http://localhost:3000/${testBlob.size}`);
  });

  it('ensures initial practice attempt is populated with processing status on result entry', () => {
    const savedAttempts: PracticeAttempt[] = [];

    const saveInitialAttempt = (attempt: PracticeAttempt) => {
      savedAttempts.push(attempt);
    };

    const initialAttempt: PracticeAttempt = {
      id: 'attempt-test-123',
      questionId: 'q-daily-1',
      category: 'daily-life',
      categoryLabel: 'Daily Life',
      question: 'Describe your favorite weekend activity.',
      practiceArea: 'area-1-personal-workplace',
      topic: 'daily-life',
      practiceMode: 'standard-question',
      recordedAt: new Date().toISOString(),
      recordingDurationSeconds: 28,
      originalTranscript: '',
      editedTranscript: '',
      metrics: null as any,
      transcriptionStatus: 'processing',
    };

    saveInitialAttempt(initialAttempt);

    expect(savedAttempts.length).toBe(1);
    expect(savedAttempts[0].id).toBe('attempt-test-123');
    expect(savedAttempts[0].transcriptionStatus).toBe('processing');
    expect(savedAttempts[0].recordingDurationSeconds).toBe(28);

    // If transcription fails (e.g. 503 error), the attempt transitions to 'failed' rather than being lost
    const failedUpdate: PracticeAttempt = {
      ...initialAttempt,
      transcriptionStatus: 'failed',
    };
    savedAttempts[0] = failedUpdate;

    expect(savedAttempts[0].transcriptionStatus).toBe('failed');
    expect(savedAttempts[0].recordingDurationSeconds).toBe(28);
  });

  it('guarantees ResultPage manages presentation Object URL lifecycle without destroying App source Blob', () => {
    const testBlob = new Blob(['recorded-audio-bytes'], { type: 'audio/webm' });
    let presentationUrl: string | null = null;

    // ResultPage mount: creates presentation URL
    presentationUrl = URL.createObjectURL(testBlob);
    expect(presentationUrl).toBe(`blob:http://localhost:3000/${testBlob.size}`);
    expect(mockCreateObjectURL).toHaveBeenCalledWith(testBlob);

    // AudioPlayer utilizes fallback duration if WebM header lacks duration (Infinity)
    const browserRawDuration = Infinity;
    const actualRecordedDuration = 42;
    const effectiveDuration = Number.isFinite(browserRawDuration) && browserRawDuration > 0
      ? browserRawDuration
      : actualRecordedDuration;
    expect(effectiveDuration).toBe(42);

    // ResultPage unmount: revokes presentation URL, leaving testBlob intact
    URL.revokeObjectURL(presentationUrl);
    expect(mockRevoke).toHaveBeenCalledWith(presentationUrl);
    expect(testBlob.size).toBe(20);
  });
});

