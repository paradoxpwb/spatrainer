/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Volume2, VolumeX, CheckCircle2, Play, Square, AlertCircle, Headphones } from 'lucide-react';
import { ListeningSummaryQuestion } from '../../types/question';

interface ListeningPassageControllerProps {
  question: ListeningSummaryQuestion;
  onListeningComplete: () => void;
  onPlaybackCountChange?: (count: number) => void;
}

export const ListeningPassageController: React.FC<ListeningPassageControllerProps> = ({
  question,
  onListeningComplete,
  onPlaybackCountChange,
}) => {
  const [playbackCount, setPlaybackCount] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isPlayingRef = useRef<boolean>(false);

  const keepaliveTimerRef = useRef<number | null>(null);

  const clearKeepalive = useCallback(() => {
    if (keepaliveTimerRef.current !== null) {
      window.clearInterval(keepaliveTimerRef.current);
      keepaliveTimerRef.current = null;
    }
  }, []);

  // Check speech synthesis support and load voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSpeechSupported(false);
      setErrorMessage('이 브라우저는 음성 합성(SpeechSynthesis)을 지원하지 않습니다. Chrome 또는 Edge 브라우저를 권장합니다.');
      return;
    }

    const loadVoices = () => {
      try {
        const voices = window.speechSynthesis.getVoices();
        const enVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.lang === 'en-US'));
        if (enVoice) {
          setSelectedVoiceName(enVoice.name);
        }
      } catch {
        // ignore
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    if (typeof window.speechSynthesis.addEventListener === 'function') {
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    }

    return () => {
      clearKeepalive();
      if (typeof window.speechSynthesis.removeEventListener === 'function') {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      }
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    };
  }, [clearKeepalive]);

  const stopPlayback = useCallback(() => {
    clearKeepalive();
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
    setIsPlaying(false);
    isPlayingRef.current = false;
  }, [clearKeepalive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, [stopPlayback]);

  const handleStartPlayback = () => {
    if (playbackCount >= 2) {
      setErrorMessage('Passage 청취는 최대 2회까지만 허용됩니다.');
      return;
    }
    if (isPlayingRef.current) {
      return;
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setErrorMessage('음성 재생 기능을 사용할 수 없습니다.');
      return;
    }

    setErrorMessage(null);
    setIsPlaying(true);
    isPlayingRef.current = true;

    try {
      // In Chromium, if speech synthesis is paused, resume first
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      // If active, cancel existing queue
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(question.passage);
      utterance.lang = 'en-US';
      utterance.rate = 0.9; // Standard slightly relaxed pace for comprehension (~40-50s)
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find((v) => v.name === selectedVoiceName) ||
        voices.find((v) => v.lang === 'en-US') ||
        voices.find((v) => v.lang.startsWith('en'));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        // Chromium keepalive: SpeechSynthesis may halt after ~14s without periodic pause/resume
        clearKeepalive();
        keepaliveTimerRef.current = window.setInterval(() => {
          try {
            if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
              window.speechSynthesis.pause();
              window.speechSynthesis.resume();
            }
          } catch {
            // ignore
          }
        }, 10000);
      };

      utterance.onend = () => {
        clearKeepalive();
        setIsPlaying(false);
        isPlayingRef.current = false;
        (window as unknown as { __spaActiveUtterance?: SpeechSynthesisUtterance | null }).__spaActiveUtterance = null;
        setPlaybackCount((prev) => {
          const next = prev + 1;
          if (onPlaybackCountChange) onPlaybackCountChange(next);
          if (next >= 2) {
            onListeningComplete();
          }
          return next;
        });
      };

      utterance.onerror = (e) => {
        clearKeepalive();
        setIsPlaying(false);
        isPlayingRef.current = false;
        (window as unknown as { __spaActiveUtterance?: SpeechSynthesisUtterance | null }).__spaActiveUtterance = null;
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
          setErrorMessage('지문 음성을 재생하지 못했습니다. 다시 듣기를 눌러 주세요.');
        }
      };

      // Pin utterance globally to prevent V8 GC mid-speech
      utteranceRef.current = utterance;
      (window as unknown as { __spaActiveUtterance?: SpeechSynthesisUtterance }).__spaActiveUtterance = utterance;

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      clearKeepalive();
      setIsPlaying(false);
      isPlayingRef.current = false;
      setErrorMessage('음성을 재생할 수 없습니다. 다시 시도해 주세요.');
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
      {/* Listening Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
            <Headphones className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <span className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider block">
              Area 4 · 듣기 지문 요약
            </span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 block">
              Listening Passage Summarization
            </span>
          </div>
        </div>

        {/* Playback Badge */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full text-xs font-bold">
          <span className="text-slate-500">청취 횟수:</span>
          <span className={`font-mono text-sm ${playbackCount >= 2 ? 'text-emerald-600 dark:text-emerald-400' : 'text-purple-600 dark:text-purple-400'}`}>
            {playbackCount} / 2회
          </span>
        </div>
      </div>

      {/* Strict Hidden Passage Notice */}
      <div className="mb-6 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 rounded-xl p-4 text-xs text-purple-950 dark:text-purple-200 space-y-1.5">
        <p className="font-bold flex items-center gap-2 text-sm">
          <Volume2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" aria-hidden="true" />
          <span>시험 규정 안내: 지문 원문은 화면에 노출되지 않습니다</span>
        </p>
        <p className="text-purple-800 dark:text-purple-300/90 leading-relaxed">
          실제 시험과 동일하게 감독관 음성이 지문을 <strong>정확히 2회</strong> 들려줍니다.
          청취 중에는 노트 작성이 불가능하며, 2회 청취가 모두 끝난 후 자동으로 답변 요약 단계로 진입합니다.
        </p>
      </div>

      {/* Progress tracker */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <div
          className={`p-3 rounded-xl border transition-all text-center ${
            playbackCount >= 1
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : isPlaying && playbackCount === 0
              ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-400 text-purple-900 dark:text-purple-200 animate-pulse'
              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500'
          }`}
        >
          <span className="text-xs font-bold block">1차 청취 (First Listen)</span>
          <span className="text-[11px] block mt-0.5">
            {playbackCount >= 1
              ? '✓ 청취 완료'
              : isPlaying && playbackCount === 0
              ? '▶ 재생 진행 중...'
              : '대기 중'}
          </span>
        </div>

        <div
          className={`p-3 rounded-xl border transition-all text-center ${
            playbackCount >= 2
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : isPlaying && playbackCount === 1
              ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-400 text-purple-900 dark:text-purple-200 animate-pulse'
              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500'
          }`}
        >
          <span className="text-xs font-bold block">2차 청취 (Second Listen)</span>
          <span className="text-[11px] block mt-0.5">
            {playbackCount >= 2
              ? '✓ 청취 완료'
              : isPlaying && playbackCount === 1
              ? '▶ 재생 진행 중...'
              : '대기 중'}
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div role="alert" className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        {playbackCount < 2 && (
          <button
            type="button"
            onClick={handleStartPlayback}
            disabled={isPlaying || !speechSupported}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold rounded-xl transition-all min-h-[48px] shadow-xs ${
              isPlaying
                ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white hover:shadow'
            }`}
          >
            <Play className="w-4 h-4 fill-current" aria-hidden="true" />
            <span>
              {playbackCount === 0
                ? '첫 번째 청취 시작 (1/2)'
                : '두 번째 청취 시작 (2/2)'}
            </span>
          </button>
        )}

        {isPlaying && (
          <button
            type="button"
            onClick={stopPlayback}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 text-xs font-bold rounded-xl transition-colors min-h-[44px]"
          >
            <Square className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
            <span>재생 중단</span>
          </button>
        )}

        {playbackCount >= 2 && !isPlaying && (
          <div className="w-full p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-center text-xs font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
            <span>2회 청취가 완료되었습니다. 아래에서 요약 답변을 준비하세요.</span>
          </div>
        )}
      </div>

      {/* Meta footnote */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span>예상 소요시간: 약 {question.estimatedListeningSeconds || 45}초</span>
        <span>주제: {question.categoryLabel || question.topic}</span>
      </div>
    </div>
  );
};
