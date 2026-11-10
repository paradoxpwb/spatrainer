/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Shared AudioContext for beep sound and audio unlocking
let sharedAudioContext: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioContext) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      sharedAudioContext = new AudioCtx();
    }
  }
  if (sharedAudioContext && sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume().catch(() => {});
  }
  return sharedAudioContext;
}

/**
 * Unlocks the Web Audio Context and prepares SpeechSynthesis
 * Must be triggered by user gesture (click event) to allow auto-play on iOS Safari / Chrome.
 */
export function unlockAudioContext(): void {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  // Pre-warm SpeechSynthesis with a silent or empty utterance
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Plays a short beep sound (880Hz high beep) indicating end of prompt / start of answer
 */
export function playBeep(frequency = 880, duration = 0.22): Promise<void> {
  return new Promise((resolve) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) {
        resolve();
        return;
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);

      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
        resolve();
      };
    } catch {
      resolve();
    }
  });
}

/**
 * Plays TTS voice for prompt text using browser SpeechSynthesis with en-US voice.
 * Returns a cancel function.
 */
export function speakMockPrompt(
  text: string,
  onEnd: () => void,
  rate = 0.95
): () => void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    // If TTS not supported, finish after a minimal duration
    const timeout = setTimeout(onEnd, 1500);
    return () => clearTimeout(timeout);
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = rate;
  utterance.pitch = 1.0;

  // Try to find natural en-US voice
  const voices = window.speechSynthesis.getVoices();
  const usVoice =
    voices.find((v) => v.lang === 'en-US' && (v.name.includes('Natural') || v.name.includes('Google'))) ||
    voices.find((v) => v.lang.startsWith('en')) ||
    null;

  if (usVoice) {
    utterance.voice = usVoice;
  }

  let ended = false;
  utterance.onend = () => {
    if (!ended) {
      ended = true;
      onEnd();
    }
  };

  utterance.onerror = () => {
    if (!ended) {
      ended = true;
      onEnd();
    }
  };

  window.speechSynthesis.speak(utterance);

  return () => {
    ended = true;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  };
}

/**
 * Preload visual image asset (SVG data URI or URL)
 */
export function preloadMockImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    if (!url) {
      resolve();
      return;
    }
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // Don't block exam start on image load fail
    img.src = url;
  });
}

/**
 * Preload question audio files
 */
export function preloadMockAudios(urls: string[]): Promise<void> {
  const promises = urls
    .filter(Boolean)
    .map(
      (url) =>
        new Promise<void>((resolve) => {
          const audio = new Audio();
          audio.preload = 'auto';
          audio.oncanplaythrough = () => resolve();
          audio.onerror = () => resolve();
          audio.src = url;
        })
    );
  return Promise.all(promises).then(() => {});
}

/**
 * Determine supported MIME type for MediaRecorder (iOS Safari vs Chromium)
 */
export function getSupportedRecordingMimeType(): string | undefined {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
    return undefined;
  }

  const candidateTypes = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/aac',
    'audio/ogg;codecs=opus',
  ];

  if (typeof MediaRecorder.isTypeSupported === 'function') {
    for (const type of candidateTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
  }

  return undefined; // browser default fallback
}
