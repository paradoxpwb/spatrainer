/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Play,
  Square,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { playBeep, speakMockPrompt, unlockAudioContext, getSupportedRecordingMimeType } from '../../utils/mockAudioUtils';
import { UseMockEntitlementReturn } from '../../hooks/useMockEntitlement';

interface MockCheckProps {
  entitlement: UseMockEntitlementReturn;
  onStartExam: (mediaStream: MediaStream) => void;
  onBackToIntro: () => void;
}

export const MockCheck: React.FC<MockCheckProps> = ({
  entitlement,
  onStartExam,
  onBackToIntro,
}) => {
  // Mic state
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [micStep, setMicStep] = useState<'idle' | 'requesting' | 'recording' | 'recorded' | 'verified' | 'error'>('idle');
  const [micErrorMessage, setMicErrorMessage] = useState<string | null>(null);
  const [testAudioUrl, setTestAudioUrl] = useState<string | null>(null);
  const [testCountdown, setTestCountdown] = useState<number>(3);
  const [isPlayingTestAudio, setIsPlayingTestAudio] = useState<boolean>(false);

  // Speaker state
  const [speakerStep, setSpeakerStep] = useState<'idle' | 'playing' | 'verified'>('idle');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const countdownIntervalRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      if (testAudioUrl) {
        try {
          URL.revokeObjectURL(testAudioUrl);
        } catch {
          // ignore
        }
      }
    };
  }, [testAudioUrl]);

  // Step 1: Start 3-second Mic Test
  const handleStartMicTest = useCallback(async () => {
    setMicErrorMessage(null);
    setMicStep('requesting');

    try {
      let stream = micStream;
      if (!stream || !stream.active) {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        setMicStream(stream);
      }

      // Prepare MediaRecorder
      const mimeType = getSupportedRecordingMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const mime = mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: mime });
        if (testAudioUrl) {
          URL.revokeObjectURL(testAudioUrl);
        }
        const url = URL.createObjectURL(blob);
        setTestAudioUrl(url);
        setMicStep('recorded');
      };

      recorder.start(100);
      setMicStep('recording');
      setTestCountdown(3);

      let remaining = 3;
      countdownIntervalRef.current = window.setInterval(() => {
        remaining -= 1;
        setTestCountdown(remaining);
        if (remaining <= 0) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
          }
        }
      }, 1000);
    } catch (err: unknown) {
      const errName = err instanceof Error ? err.name : 'UnknownError';
      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        setMicErrorMessage('마이크 접근 권한이 거부되었습니다. 브라우저 주소창 왼쪽의 자물쇠 아이콘을 눌러 마이크 권한을 허용해 주세요.');
      } else {
        setMicErrorMessage('마이크 장치를 찾을 수 없거나 초기화에 실패했습니다.');
      }
      setMicStep('error');
    }
  }, [micStream, testAudioUrl]);

  // Play test audio
  const handlePlayTestRecording = useCallback(() => {
    if (!testAudioUrl) return;
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    const audio = new Audio(testAudioUrl);
    audioPlayerRef.current = audio;
    setIsPlayingTestAudio(true);
    audio.onended = () => setIsPlayingTestAudio(false);
    audio.onerror = () => setIsPlayingTestAudio(false);
    audio.play().catch(() => setIsPlayingTestAudio(false));
  }, [testAudioUrl]);

  // Confirm mic works
  const handleConfirmMic = useCallback(() => {
    setMicStep('verified');
  }, []);

  // Step 2: Speaker test
  const handleTestSpeaker = useCallback(() => {
    setSpeakerStep('playing');
    // Play short melody / beep and prompt
    playBeep(660, 0.15)
      .then(() => playBeep(880, 0.2))
      .then(() => {
        speakMockPrompt(
          'This is a sample audio test for your mock examination. Can you hear this clearly?',
          () => {
            setSpeakerStep('verified');
          }
        );
      });
  }, []);

  // Ready to begin exam
  const isEverythingVerified = micStep === 'verified' && speakerStep === 'verified' && micStream !== null;

  const handleStartExamClick = useCallback(() => {
    if (!isEverythingVerified || !micStream) return;

    // Check entitlement ticket
    // TODO: 실제 결제 검증은 서버에서 해야 함
    const hasTicket = entitlement.consumeTicket();
    if (!hasTicket) {
      alert('모의고사 응시 티켓이 부족합니다.');
      return;
    }

    // Crucial: Unlock AudioContext and speech synthesis via user gesture
    unlockAudioContext();

    onStartExam(micStream);
  }, [isEverythingVerified, micStream, entitlement, onStartExam]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          응시 환경 점검
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          원활한 시험 진행을 위해 마이크 입력과 스피커 출력을 사전에 점검합니다.
        </p>
      </div>

      <div className="space-y-5">
        {/* Check 1: Microphone Check Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                micStep === 'verified'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
              }`}>
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                  1. 마이크 입력 및 녹음 점검
                </h2>
                <p className="text-xs text-slate-500">
                  3초 동안 말한 후 녹음된 음성을 직접 확인합니다.
                </p>
              </div>
            </div>

            {micStep === 'verified' && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>점검 완료</span>
              </span>
            )}
          </div>

          {micErrorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{micErrorMessage}</span>
            </div>
          )}

          {/* Mic Actions */}
          <div className="pt-2">
            {micStep === 'idle' && (
              <button
                type="button"
                onClick={handleStartMicTest}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                <Mic className="w-4 h-4" />
                <span>마이크 권한 요청 및 3초 녹음</span>
              </button>
            )}

            {micStep === 'requesting' && (
              <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold py-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>마이크 권한 요청 중...</span>
              </div>
            )}

            {micStep === 'recording' && (
              <div className="flex items-center gap-3 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                <span className="text-xs font-bold text-rose-700 dark:text-rose-300">
                  마이크 테스트 녹음 중... 아무 문장이나 말씀하세요 ({testCountdown}초)
                </span>
              </div>
            )}

            {(micStep === 'recorded' || micStep === 'verified') && (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handlePlayTestRecording}
                  disabled={isPlayingTestAudio}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isPlayingTestAudio ? '재생 중...' : '녹음된 목소리 듣기'}</span>
                </button>

                {micStep !== 'verified' ? (
                  <button
                    type="button"
                    onClick={handleConfirmMic}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>목소리가 잘 들립니다 (확인)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartMicTest}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-slate-800 text-xs transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>다시 녹음</span>
                  </button>
                )}
              </div>
            )}

            {micStep === 'error' && (
              <button
                type="button"
                onClick={handleStartMicTest}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>다시 시도</span>
              </button>
            )}
          </div>
        </div>

        {/* Check 2: Speaker Check Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                speakerStep === 'verified'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
              }`}>
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                  2. 스피커 출력 점검
                </h2>
                <p className="text-xs text-slate-500">
                  문제 음성과 신호음(Beep)이 선명하게 들리는지 확인합니다.
                </p>
              </div>
            </div>

            {speakerStep === 'verified' && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>점검 완료</span>
              </span>
            )}
          </div>

          <div className="pt-2">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleTestSpeaker}
                disabled={speakerStep === 'playing'}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                <Volume2 className="w-4 h-4" />
                <span>{speakerStep === 'playing' ? '테스트 음성 출력 중...' : '스피커 테스트 음성 재생'}</span>
              </button>

              {speakerStep === 'verified' && (
                <span className="text-xs text-slate-500">
                  소리가 정상적으로 들림이 확인되었습니다.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Persistent Mic Notice */}
      <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/30 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
          <strong className="font-semibold block mb-0.5">안정적인 녹음 환경 보장</strong>
          <span>
            시험 시작 시 마이크 스트림이 시험 종료까지 계속 유지되므로 문항 간 녹음 지연이나 권한 팝업 없이 매끄럽게 다음 문항으로 자동 전환됩니다.
          </span>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={onBackToIntro}
          className="w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          이전으로
        </button>

        <button
          type="button"
          disabled={!isEverythingVerified}
          onClick={handleStartExamClick}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm shadow-sm transition-all ${
            isEverythingVerified
              ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white cursor-pointer hover:shadow'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
          }`}
        >
          <span>모의시험 시작하기</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
