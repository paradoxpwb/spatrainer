import { useCallback, useEffect, useRef, useState } from 'react';
import { transcribeAudioBlob, TranscriptionServiceError } from '../services/transcriptionService';
import { TranscriptionErrorCode, TranscriptionResult, TranscriptionStatus } from '../types/transcription';

export interface UseTranscriptionReturn {
  status: TranscriptionStatus;
  isLoading: boolean;
  error: { code: TranscriptionErrorCode; message: string } | null;
  result: TranscriptionResult | null;
  transcribe: (audioBlob: Blob, durationSeconds: number) => Promise<string | null>;
  setManualTranscript: (text: string) => void;
  reset: () => void;
  clearError: () => void;
}

export function useTranscription(): UseTranscriptionReturn {
  const [status, setStatus] = useState<TranscriptionStatus>('idle');
  const [error, setError] = useState<{ code: TranscriptionErrorCode; message: string } | null>(null);
  const [result, setResult] = useState<TranscriptionResult | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isRequestingRef = useRef<boolean>(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    isRequestingRef.current = false;
    setStatus('idle');
    setError(null);
    setResult(null);
  }, []);

  const setManualTranscript = useCallback((text: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    isRequestingRef.current = false;
    setStatus('manual');
    setError(null);
    setResult({
      transcript: text,
      language: 'en',
      provider: 'manual',
      model: 'manual-input',
      createdAt: new Date().toISOString(),
    });
  }, []);

  const transcribe = useCallback(
    async (audioBlob: Blob, durationSeconds: number): Promise<string | null> => {
      // 1. Guard against duplicate concurrent requests
      if (isRequestingRef.current) {
        return null;
      }

      // 2. Cost protection: Enforce minimum 2-second recording duration
      if (durationSeconds < 2) {
        const errObj = {
          code: 'AUDIO_TOO_SHORT' as TranscriptionErrorCode,
          message: '분석하기에는 녹음이 너무 짧습니다. 2초 이상 답변해 주세요.',
        };
        setError(errObj);
        setStatus('failed');
        return null;
      }

      // 3. Check audio size
      if (!audioBlob || audioBlob.size === 0) {
        const errObj = {
          code: 'EMPTY_AUDIO' as TranscriptionErrorCode,
          message: '녹음된 오디오 데이터가 없습니다.',
        };
        setError(errObj);
        setStatus('failed');
        return null;
      }

      try {
        isRequestingRef.current = true;
        setError(null);
        setStatus('uploading');

        console.log('[SPA DEBUG] transcription request started');
        console.log('[SPA DEBUG] transcription audio bytes:', audioBlob.size);

        // Cancel any pending request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        // Transition to transcribing status
        setStatus('transcribing');

        const transcription = await transcribeAudioBlob(audioBlob, {
          language: 'en',
          signal: controller.signal,
          timeoutMs: 30000,
        });

        const transcriptText = transcription.transcript ? transcription.transcript.trim() : '';

        if (!transcriptText) {
          console.log('[SPA DEBUG] transcript returned: NO');
          const errObj = {
            code: 'TRANSCRIPTION_FAILED' as TranscriptionErrorCode,
            message: '녹음은 완료되었지만 음성을 텍스트로 변환하지 못했습니다.',
          };
          setError(errObj);
          setStatus('failed');
          isRequestingRef.current = false;
          abortControllerRef.current = null;
          return null;
        }

        console.log('[SPA DEBUG] transcript returned: YES');
        setResult(transcription);
        setStatus('completed');
        isRequestingRef.current = false;
        abortControllerRef.current = null;

        return transcriptText;
      } catch (err: any) {
        isRequestingRef.current = false;
        abortControllerRef.current = null;

        if (err.name === 'AbortError' || err.code === 'INVALID_REQUEST') {
          // If aborted by user navigation, stay quiet or reset
          return null;
        }

        const errorCode: TranscriptionErrorCode =
          err instanceof TranscriptionServiceError ? err.code : 'TRANSCRIPTION_FAILED';
        const errorMessage =
          err.message || '녹음은 완료되었지만 음성을 텍스트로 변환하지 못했습니다.';

        console.log('[SPA DEBUG] transcript returned: NO');
        setError({ code: errorCode, message: errorMessage });
        setStatus('failed');
        return null;
      }
    },
    []
  );

  // Clean up ongoing request on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const isLoading = status === 'uploading' || status === 'transcribing';

  return {
    status,
    isLoading,
    error,
    result,
    transcribe,
    setManualTranscript,
    reset,
    clearError,
  };
}
