import { useCallback, useEffect, useRef, useState } from 'react';
import { CompletedRecording, RecordingState } from '../types/recording';

export interface UseAudioRecorderReturn {
  recordingState: RecordingState;
  audioBlob: Blob | null;
  audioUrl: string | null;
  actualDuration: number;
  errorMessage: string | null;
  startRecording: () => Promise<boolean>;
  stopRecording: () => Promise<CompletedRecording | null>;
  cancelRecording: () => void;
  resetRecording: () => void;
  clearError: () => void;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [actualDuration, setActualDuration] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number | null>(null);
  const activeUrlRef = useRef<string | null>(null);
  const isStoppingRef = useRef<boolean>(false);
  const isStartingRef = useRef<boolean>(false);
  const isCompletedRef = useRef<boolean>(false);
  const stopResolverRef = useRef<((val: CompletedRecording | null) => void) | null>(null);

  // Helper: Stop all active tracks on the stream
  const releaseMediaStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore error
        }
      });
      mediaStreamRef.current = null;
    }
  }, []);

  // Helper: Revoke existing object URL to prevent memory leaks
  const revokeActiveUrl = useCallback(() => {
    if (activeUrlRef.current) {
      try {
        URL.revokeObjectURL(activeUrlRef.current);
      } catch {
        // ignore
      }
      activeUrlRef.current = null;
    }
  }, []);

  // Determine best supported MIME type
  const getSupportedMimeType = useCallback((): string | undefined => {
    if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
      return undefined;
    }

    const candidateTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/aac',
    ];

    if (typeof MediaRecorder.isTypeSupported === 'function') {
      for (const type of candidateTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          return type;
        }
      }
    }
    return undefined; // Let browser pick default
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const resetRecording = useCallback(() => {
    releaseMediaStream();
    revokeActiveUrl();
    chunksRef.current = [];
    startTimeRef.current = null;
    isStoppingRef.current = false;
    isStartingRef.current = false;
    isCompletedRef.current = false;
    stopResolverRef.current?.(null);
    stopResolverRef.current = null;
    setAudioBlob(null);
    setAudioUrl(null);
    setActualDuration(0);
    setErrorMessage(null);
    setRecordingState('idle');
  }, [releaseMediaStream, revokeActiveUrl]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.ondataavailable = null;
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    stopResolverRef.current?.(null);
    stopResolverRef.current = null;
    releaseMediaStream();
    resetRecording();
  }, [releaseMediaStream, resetRecording]);

  const startRecording = useCallback(async (): Promise<boolean> => {
    // Prevent duplicate rapid calls
    if (isStartingRef.current || isStoppingRef.current) {
      return false;
    }

    // Check browser support
    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== 'function' ||
      typeof MediaRecorder === 'undefined'
    ) {
      setErrorMessage(
        '현재 브라우저에서는 음성 녹음을 지원하지 않습니다. 최신 Chrome, Edge 또는 Safari 브라우저를 사용해 주세요.'
      );
      setRecordingState('error');
      return false;
    }

    try {
      isStartingRef.current = true;
      setErrorMessage(null);
      setRecordingState('requesting-permission');

      // Clear any prior recording state and URL
      revokeActiveUrl();
      setAudioBlob(null);
      setAudioUrl(null);
      chunksRef.current = [];

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      console.log('[SPA DEBUG] microphone permission granted');
      mediaStreamRef.current = stream;

      const mimeType = getSupportedMimeType();
      const recorderOptions: MediaRecorderOptions = mimeType ? { mimeType } : {};
      const recorder = new MediaRecorder(stream, recorderOptions);
      mediaRecorderRef.current = recorder;

      const selectedType = recorder.mimeType || mimeType || 'audio/webm';
      console.log('[SPA DEBUG] MIME type:', selectedType);

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
          console.log('[SPA DEBUG] dataavailable size:', event.data.size);
        }
      };

      recorder.onerror = (event: Event) => {
        console.error('MediaRecorder error:', event);
        setErrorMessage('녹음 진행 중 오류가 발생했습니다. 다시 시도해 주세요.');
        setRecordingState('error');
        releaseMediaStream();
        isStartingRef.current = false;
        isStoppingRef.current = false;
        stopResolverRef.current?.(null);
        stopResolverRef.current = null;
      };

      recorder.onstop = () => {
        console.log('[SPA DEBUG] recorder stopped');
        const recordedDuration = startTimeRef.current
          ? Math.max(1, Math.round((performance.now() - startTimeRef.current) / 1000))
          : 0;

        setActualDuration(recordedDuration);
        releaseMediaStream();

        const activeMime = recorder.mimeType || mimeType || 'audio/webm';
        const finalBlob = new Blob(chunksRef.current, { type: activeMime });

        console.log('[SPA DEBUG] final Blob size:', finalBlob.size);
        console.log('[SPA DEBUG] final Blob type:', activeMime);

        if (finalBlob.size === 0) {
          console.error('[SPA DEBUG] final Blob size is 0');
          setErrorMessage('녹음 데이터를 생성하지 못했습니다. 마이크 권한을 확인하고 다시 녹음해 주세요.');
          setRecordingState('error');
          isStoppingRef.current = false;
          stopResolverRef.current?.(null);
          stopResolverRef.current = null;
          return;
        }

        const newUrl = URL.createObjectURL(finalBlob);
        console.log('[SPA DEBUG] object URL created');
        activeUrlRef.current = newUrl;
        isCompletedRef.current = true;
        setAudioBlob(finalBlob);
        setAudioUrl(newUrl);
        setRecordingState('completed');
        isStoppingRef.current = false;

        const result: CompletedRecording = {
          blob: finalBlob,
          url: newUrl,
          mimeType: activeMime,
          duration: recordedDuration,
        };
        stopResolverRef.current?.(result);
        stopResolverRef.current = null;
      };

      // Start recording with timeslice to ensure data chunks are gathered periodically
      recorder.start(250);
      startTimeRef.current = performance.now();
      console.log('[SPA DEBUG] recorder state: recording');
      setRecordingState('recording');
      isStartingRef.current = false;
      return true;
    } catch (err: unknown) {
      isStartingRef.current = false;
      releaseMediaStream();
      stopResolverRef.current?.(null);
      stopResolverRef.current = null;

      const error = err as { name?: string; message?: string };
      if (
        error.name === 'NotAllowedError' ||
        error.name === 'PermissionDeniedError' ||
        error.name === 'SecurityError'
      ) {
        setErrorMessage(
          '마이크 사용 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용한 후 다시 시도해 주세요.'
        );
      } else if (
        error.name === 'NotFoundError' ||
        error.name === 'DevicesNotFoundError'
      ) {
        setErrorMessage('연결된 마이크 장치를 찾을 수 없습니다. 마이크 연결을 확인해 주세요.');
      } else if (
        error.name === 'NotReadableError' ||
        error.name === 'TrackStartError'
      ) {
        setErrorMessage(
          '다른 애플리케이션에서 마이크를 사용 중이거나 장치에 접근할 수 없습니다. 확인 후 다시 시도해 주세요.'
        );
      } else {
        setErrorMessage(
          '마이크를 시작하는 도중 오류가 발생했습니다. 브라우저 설정을 확인하고 다시 시도해 주세요.'
        );
      }

      setRecordingState('error');
      return false;
    }
  }, [getSupportedMimeType, releaseMediaStream, revokeActiveUrl]);

  const stopRecording = useCallback((): Promise<CompletedRecording | null> => {
    if (isStoppingRef.current) return Promise.resolve(null);

    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
      releaseMediaStream();
      return Promise.resolve(null);
    }

    return new Promise<CompletedRecording | null>((resolve) => {
      stopResolverRef.current = resolve;
      isStoppingRef.current = true;
      setRecordingState('processing');

      // Request data before stopping
      try {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.requestData();
        }
      } catch {
        // ignore
      }

      try {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        } else {
          resolve(null);
        }
      } catch (err) {
        console.error('Error stopping recorder:', err);
        releaseMediaStream();
        isStoppingRef.current = false;
        setRecordingState('error');
        setErrorMessage('녹음을 종료하는 도중 오류가 발생했습니다.');
        resolve(null);
      }
    });
  }, [releaseMediaStream]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      releaseMediaStream();
      // Only revoke active URL on unmount if recording was never completed or was cancelled.
      // When completed, the caller (e.g. ResultPage via App) takes over audioUrl lifecycle.
      if (!isCompletedRef.current) {
        revokeActiveUrl();
      }
    };
  }, [releaseMediaStream, revokeActiveUrl]);

  return {
    recordingState,
    audioBlob,
    audioUrl,
    actualDuration,
    errorMessage,
    startRecording,
    stopRecording,
    cancelRecording,
    resetRecording,
    clearError,
  };
}
