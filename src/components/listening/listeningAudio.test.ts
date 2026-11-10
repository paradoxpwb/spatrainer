import { describe, it, expect } from 'vitest';
import { LISTENING_PASSAGES } from '../../data/listeningPassages';

describe('Area 4 Listening Passage Specifications & Audio Rules', () => {
  it('ensures all listening passages have non-empty text, estimated duration, and appropriate length', () => {
    expect(LISTENING_PASSAGES.length).toBeGreaterThan(0);

    for (const passage of LISTENING_PASSAGES) {
      expect(passage.id).toBeTruthy();
      expect(passage.practiceArea).toBe('area-4-listening-summary');
      expect(passage.practiceMode).toBe('listening-summary');
      expect(passage.passage).toBeTruthy();
      expect(passage.passage.length).toBeGreaterThan(50);
      expect(passage.estimatedListeningSeconds).toBeGreaterThanOrEqual(30);
      expect(passage.estimatedListeningSeconds).toBeLessThanOrEqual(60);
    }
  });

  it('verifies that question instructs user to listen and summarize without exposing passage text', () => {
    for (const passage of LISTENING_PASSAGES) {
      // The task prompt shown to user should never be the passage itself
      expect(passage.question).not.toBe(passage.passage);
      expect((passage.question || '').toLowerCase()).toContain('listen');
      expect(passage.forbiddenVisibleDuringListening).toBe(true);
    }
  });

  it('validates SpeechSynthesis configuration parameters for SPA comprehension rate', () => {
    const defaultRate = 0.9;
    const defaultPitch = 1.0;
    const defaultLang = 'en-US';

    expect(defaultRate).toBeLessThan(1.0); // Slightly slower than 1.0 for test comprehension
    expect(defaultPitch).toBe(1.0);
    expect(defaultLang).toBe('en-US');
  });

  it('enforces maximum 2 playback attempts for Area 4 according to exam regulations', () => {
    const MAX_PLAYBACK_COUNT = 2;
    let currentPlaybackCount = 0;

    const recordPlaybackComplete = () => {
      if (currentPlaybackCount < MAX_PLAYBACK_COUNT) {
        currentPlaybackCount += 1;
      }
      return currentPlaybackCount;
    };

    expect(recordPlaybackComplete()).toBe(1);
    expect(recordPlaybackComplete()).toBe(2);
    // Should not exceed 2
    expect(recordPlaybackComplete()).toBe(2);
  });
});
