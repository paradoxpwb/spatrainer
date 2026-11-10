/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Clock,
  Mic,
  Volume2,
  Square,
  AlertTriangle,
  Eye,
  EyeOff,
  Sparkles,
  BarChart2,
  Image as ImageIcon,
} from 'lucide-react';
import {
  MockQuestionItem,
  MockRunPhase,
  MockRecordedItem,
  MockExamResult,
  MockExamBlueprint,
  MockVisualType,
  MockVisualItem,
} from '../../types/mockExam';
import {
  playBeep,
  speakMockPrompt,
  preloadMockImage,
  preloadMockAudios,
  getSupportedRecordingMimeType,
} from '../../utils/mockAudioUtils';

interface MockRunProps {
  blueprint: MockExamBlueprint;
  questions: MockQuestionItem[];
  pickedVisualType: MockVisualType;
  pickedVisualItem: MockVisualItem;
  mediaStream: MediaStream;
  onExamFinished: (result: MockExamResult) => void;
  onAbortExam: () => void;
}

export const MockRun: React.FC<MockRunProps> = ({
  blueprint,
  questions,
  pickedVisualType,
  pickedVisualItem,
  mediaStream,
  onExamFinished,
  onAbortExam,
}) => {
  // Question navigation
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const currentQuestion = questions[currentQuestionIndex] || questions[0];

  // State machine phase: 'idle' | 'playingPrompt' | 'prep' | 'recording' | 'saving'
  const [phase, setPhase] = useState<MockRunPhase>('idle');

  // Timers
  const [totalRemainingSeconds, setTotalRemainingSeconds] = useState<number>(
    blueprint.totalMaxTimeSeconds
  );
  const [questionRemainingSeconds, setQuestionRemainingSeconds] = useState<number>(
    currentQuestion.prepSeconds > 0
      ? currentQuestion.prepSeconds
      : currentQuestion.answerMaxSeconds
  );

  // Tab departures
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [showTabWarning, setShowTabWarning] = useState<boolean>(false);

  // Optional review toggle (hidden by default)
  const [showQuestionText, setShowQuestionText] = useState<boolean>(false);

  // Results collected
  const recordedItemsRef = useRef<MockRecordedItem[]>([]);
  const examStartedAtRef = useRef<number>(Date.now());
  const recordingStartTimeRef = useRef<number | null>(null);

  // Active audio & recorders
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const cancelPromptSpeechRef = useRef<(() => void) | null>(null);
  const activePromptAudioRef = useRef<HTMLAudioElement | null>(null);

  // Timer intervals
  const totalTimerIntervalRef = useRef<number | null>(null);
  const questionTimerIntervalRef = useRef<number | null>(null);

  // Preload visual image on mount
  useEffect(() => {
    if (pickedVisualItem?.imageUrl) {
      preloadMockImage(pickedVisualItem.imageUrl);
    }
    const audioUrls = questions.map((q) => q.audioUrl).filter(Boolean) as string[];
    if (audioUrls.length > 0) {
      preloadMockAudios(audioUrls);
    }
  }, [pickedVisualItem, questions]);

  // Tab switch & beforeunload handling
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '모의시험 진행 중 페이지를 벗어나면 시험이 무효 처리됩니다.';
      return e.returnValue;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => prev + 1);
        setShowTabWarning(true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Total Exam Timer (13 minutes hard limit)
  useEffect(() => {
    totalTimerIntervalRef.current = window.setInterval(() => {
      setTotalRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (totalTimerIntervalRef.current) {
            clearInterval(totalTimerIntervalRef.current);
            totalTimerIntervalRef.current = null;
          }
          // Hard limit reached -> conclude exam
          handleConcludeExam(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (totalTimerIntervalRef.current) {
        clearInterval(totalTimerIntervalRef.current);
      }
    };
  }, []);

  // Clean stop helper for prompt playback
  const stopPromptPlayback = useCallback(() => {
    if (cancelPromptSpeechRef.current) {
      cancelPromptSpeechRef.current();
      cancelPromptSpeechRef.current = null;
    }
    if (activePromptAudioRef.current) {
      activePromptAudioRef.current.pause();
      activePromptAudioRef.current = null;
    }
  }, []);

  // Conclude entire exam and transition to result
  const handleConcludeExam = useCallback(
    (terminatedByTotalTimeout = false) => {
      stopPromptPlayback();

      if (questionTimerIntervalRef.current) {
        clearInterval(questionTimerIntervalRef.current);
        questionTimerIntervalRef.current = null;
      }
      if (totalTimerIntervalRef.current) {
        clearInterval(totalTimerIntervalRef.current);
        totalTimerIntervalRef.current = null;
      }

      // Stop recorder if active
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // ignore
        }
      }

      // Release mic media tracks cleanly
      try {
        mediaStream.getTracks().forEach((track) => track.stop());
      } catch {
        // ignore
      }

      const finishedAt = Date.now();
      const elapsedSeconds = Math.round((finishedAt - examStartedAtRef.current) / 1000);

      const finalResult: MockExamResult = {
        id: `mock-${Date.now()}`,
        startedAt: examStartedAtRef.current,
        finishedAt,
        totalElapsedSeconds: elapsedSeconds,
        tabSwitchCount,
        items: recordedItemsRef.current,
        terminatedByTotalTimeout,
        visualTypePicked: pickedVisualType,
        visualItemUsed: pickedVisualItem,
      };

      onExamFinished(finalResult);
    },
    [stopPromptPlayback, mediaStream, tabSwitchCount, pickedVisualType, pickedVisualItem, onExamFinished]
  );

  // Transition to next question or conclude
  const handleAdvanceToNextQuestion = useCallback(() => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setPhase('idle');
    } else {
      handleConcludeExam(false);
    }
  }, [currentQuestionIndex, questions.length, handleConcludeExam]);

  // Save active recording and transition
  const handleStopRecordingAndSave = useCallback(() => {
    if (questionTimerIntervalRef.current) {
      clearInterval(questionTimerIntervalRef.current);
      questionTimerIntervalRef.current = null;
    }

    setPhase('saving');

    const duration = recordingStartTimeRef.current
      ? Math.max(1, Math.round((Date.now() - recordingStartTimeRef.current) / 1000))
      : currentQuestion.answerMaxSeconds;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.onstop = () => {
        const mime = getSupportedRecordingMimeType() || 'audio/webm';
        const blob = new Blob(recordedChunksRef.current, { type: mime });
        const url = URL.createObjectURL(blob);

        recordedItemsRef.current.push({
          partNumber: currentQuestion.partNumber,
          partId: currentQuestion.partId,
          partTitle: currentQuestion.partTitle,
          promptText: currentQuestion.promptText,
          audioBlob: blob,
          audioUrl: url,
          durationSeconds: duration,
          maxDurationSeconds: currentQuestion.answerMaxSeconds,
          visual: currentQuestion.visual,
        });

        handleAdvanceToNextQuestion();
      };

      try {
        mediaRecorderRef.current.stop();
      } catch {
        handleAdvanceToNextQuestion();
      }
    } else {
      handleAdvanceToNextQuestion();
    }
  }, [currentQuestion, handleAdvanceToNextQuestion]);

  // Start recording phase
  const startRecordingPhase = useCallback(() => {
    stopPromptPlayback();
    setPhase('recording');
    setQuestionRemainingSeconds(currentQuestion.answerMaxSeconds);
    recordingStartTimeRef.current = Date.now();

    // Initialize recorder for this question
    try {
      const mime = getSupportedRecordingMimeType();
      const recorder = mime
        ? new MediaRecorder(mediaStream, { mimeType: mime })
        : new MediaRecorder(mediaStream);

      mediaRecorderRef.current = recorder;
      recordedChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.start(100);
    } catch {
      // ignore
    }

    // Question answer countdown interval
    if (questionTimerIntervalRef.current) {
      clearInterval(questionTimerIntervalRef.current);
    }

    let remaining = currentQuestion.answerMaxSeconds;
    questionTimerIntervalRef.current = window.setInterval(() => {
      remaining -= 1;
      setQuestionRemainingSeconds(remaining);
      if (remaining <= 0) {
        if (questionTimerIntervalRef.current) {
          clearInterval(questionTimerIntervalRef.current);
          questionTimerIntervalRef.current = null;
        }
        handleStopRecordingAndSave();
      }
    }, 1000);
  }, [currentQuestion, mediaStream, stopPromptPlayback, handleStopRecordingAndSave]);

  // Start preparation phase (if prepSeconds > 0)
  const startPrepPhase = useCallback(() => {
    setPhase('prep');
    setQuestionRemainingSeconds(currentQuestion.prepSeconds);

    if (questionTimerIntervalRef.current) {
      clearInterval(questionTimerIntervalRef.current);
    }

    let remaining = currentQuestion.prepSeconds;
    questionTimerIntervalRef.current = window.setInterval(() => {
      remaining -= 1;
      setQuestionRemainingSeconds(remaining);
      if (remaining <= 0) {
        if (questionTimerIntervalRef.current) {
          clearInterval(questionTimerIntervalRef.current);
          questionTimerIntervalRef.current = null;
        }
        // Beep at prep end, then start recording
        playBeep(880, 0.25).then(() => {
          startRecordingPhase();
        });
      }
    }, 1000);
  }, [currentQuestion, startRecordingPhase]);

  // Handle prompt speech finish -> beep -> prep or recording
  const onPromptAudioFinished = useCallback(() => {
    playBeep(880, 0.25).then(() => {
      if (currentQuestion.prepSeconds > 0) {
        startPrepPhase();
      } else {
        startRecordingPhase();
      }
    });
  }, [currentQuestion, startPrepPhase, startRecordingPhase]);

  // Play prompt audio (native Audio or SpeechSynthesis fallback)
  const playCurrentQuestionPrompt = useCallback(() => {
    setPhase('playingPrompt');
    stopPromptPlayback();

    // For Part 3: Passage Listening, speak the passage text, then the instruction prompt
    const textToSpeak = currentQuestion.passageText
      ? `${currentQuestion.passageText} ... Now, please answer: ${currentQuestion.promptText}`
      : currentQuestion.promptText;

    if (currentQuestion.audioUrl) {
      const audio = new Audio(currentQuestion.audioUrl);
      activePromptAudioRef.current = audio;
      audio.onended = () => {
        activePromptAudioRef.current = null;
        onPromptAudioFinished();
      };
      audio.onerror = () => {
        // Fallback to TTS on audio load error
        cancelPromptSpeechRef.current = speakMockPrompt(textToSpeak, onPromptAudioFinished);
      };
      audio.play().catch(() => {
        cancelPromptSpeechRef.current = speakMockPrompt(textToSpeak, onPromptAudioFinished);
      });
    } else {
      // Use SpeechSynthesis
      cancelPromptSpeechRef.current = speakMockPrompt(textToSpeak, onPromptAudioFinished);
    }
  }, [currentQuestion, stopPromptPlayback, onPromptAudioFinished]);

  // Automatically start question prompt when question index changes or enters idle
  useEffect(() => {
    if (phase === 'idle') {
      const timer = setTimeout(() => {
        playCurrentQuestionPrompt();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [phase, currentQuestionIndex, playCurrentQuestionPrompt]);

  // Format mm:ss helper
  const formatTime = (secs: number) => {
    const safe = Math.max(0, Math.floor(secs));
    const m = Math.floor(safe / 60);
    const s = safe % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Top Test Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Question Counter */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold text-xs sm:text-sm">
            문항 {currentQuestion.partNumber} / {questions.length}
          </div>
          <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
            {currentQuestion.partTitle}
          </span>
        </div>

        {/* Total Time & Warning */}
        <div className="flex items-center gap-4 text-xs">
          {tabSwitchCount > 0 && (
            <div className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>이탈 {tabSwitchCount}회</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-semibold">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>전체 남은 시간: {formatTime(totalRemainingSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Tab Switch Warning Toast */}
      {showTabWarning && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>시험 중 탭 이탈이 감지되었습니다. 응시 상태를 유지해 주세요.</span>
          </div>
          <button
            type="button"
            onClick={() => setShowTabWarning(false)}
            className="text-amber-700 dark:text-amber-300 font-bold px-2 py-0.5 hover:underline"
          >
            확인
          </button>
        </div>
      )}

      {/* Main Examination Stage Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6 text-center">
        {/* Phase Indicator Badge */}
        <div className="flex justify-center">
          {phase === 'playingPrompt' && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-xs sm:text-sm border border-blue-200 dark:border-blue-900 animate-pulse">
              <Volume2 className="w-4 h-4" />
              <span>질문 음성 청취 중... 집중해서 듣고 답변을 준비하세요</span>
            </div>
          )}

          {phase === 'prep' && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold text-xs sm:text-sm border border-amber-200 dark:border-amber-900 animate-pulse">
              <Clock className="w-4 h-4" />
              <span>답변 준비 시간 (남은 시간: {questionRemainingSeconds}초)</span>
            </div>
          )}

          {phase === 'recording' && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold text-xs sm:text-sm border border-rose-200 dark:border-rose-900">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <Mic className="w-4 h-4" />
              <span>답변 녹음 진행 중... 마이크에 또렷하게 말씀하세요</span>
            </div>
          )}

          {phase === 'saving' && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm">
              <span>답변 데이터 정리 중...</span>
            </div>
          )}
        </div>

        {/* Part 6 Visual Prompt Display (Responsive, maintaining aspect ratio on mobile) */}
        {currentQuestion.visual && (phase === 'prep' || phase === 'recording' || phase === 'playingPrompt') && (
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
              <span className="inline-flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                {currentQuestion.visual.type === 'chart' ? (
                  <BarChart2 className="w-4 h-4 text-indigo-600" />
                ) : (
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                )}
                <span>제시 자료: {currentQuestion.visual.type === 'chart' ? '데이터 차트 분석' : '상황 사진 묘사'}</span>
              </span>
              <span className="text-[11px] text-slate-400">준비 및 녹음 시간 동안 계속 표시됩니다</span>
            </div>

            <div className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xs flex items-center justify-center p-2 sm:p-4">
              <img
                src={currentQuestion.visual.imageUrl}
                alt={currentQuestion.visual.altText}
                className="w-full h-auto max-h-[380px] object-contain rounded-xl"
              />
            </div>
          </div>
        )}

        {/* Listening Passage Notice for Part 3 */}
        {currentQuestion.partId === 'passage_summary' && (
          <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
            <strong className="block font-semibold text-slate-900 dark:text-slate-100 mb-1">
              [지문 청취 안내]
            </strong>
            <span>실제 시험 규정에 따라 지문 텍스트는 화면에 표시되지 않습니다. 들려오는 음성을 주의 깊게 메모하며 요약하세요.</span>
          </div>
        )}

        {/* Big Countdown Timer Circle / Card */}
        <div className="py-4">
          <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-slate-900 dark:text-slate-100">
            {formatTime(questionRemainingSeconds)}
          </div>
          <div className="text-xs sm:text-sm text-slate-500 font-medium mt-2">
            {phase === 'prep' ? '준비 제한시간' : phase === 'recording' ? '답변 제한시간' : '대기 중'}
          </div>
        </div>

        {/* Question Text Toggle (Hidden by default to simulate real exam listening pressure) */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowQuestionText(!showQuestionText)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            {showQuestionText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showQuestionText ? '질문 텍스트 숨기기' : '질문 텍스트 확인 (연습용)'}</span>
          </button>

          {showQuestionText && (
            <p className="mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 max-w-xl mx-auto leading-relaxed border border-slate-200 dark:border-slate-700">
              "{currentQuestion.promptText}"
            </p>
          )}
        </div>

        {/* Action Button: "답변 완료" during recording */}
        {phase === 'recording' && (
          <div className="pt-4 flex justify-center">
            <button
              type="button"
              onClick={handleStopRecordingAndSave}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-sm rounded-xl shadow-sm hover:shadow transition-all min-w-[200px]"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>답변 완료</span>
            </button>
          </div>
        )}
      </div>

      {/* Emergency Abort Exam Button */}
      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={() => {
            if (window.confirm('정말 모의고사를 중단하시겠습니까? 현재까지의 기록은 저장되지 않습니다.')) {
              stopPromptPlayback();
              try {
                mediaStream.getTracks().forEach((track) => track.stop());
              } catch {
                // ignore
              }
              onAbortExam();
            }
          }}
          className="text-xs text-slate-400 hover:text-rose-600 transition-colors"
        >
          모의고사 중단하고 나가기
        </button>
      </div>
    </div>
  );
};
