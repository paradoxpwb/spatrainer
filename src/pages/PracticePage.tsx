/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  SpeakingQuestion,
  PracticeSettings,
  ListeningSummaryQuestion,
  VisualPromptQuestion,
} from '../types/question';
import { RecordingResultData } from '../types/recording';
import { RetryContext } from '../types/coaching';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useCountdown } from '../hooks/useCountdown';
import { QuestionCard } from '../components/QuestionCard';
import { TimerDisplay } from '../components/TimerDisplay';
import { RecordingIndicator } from '../components/RecordingIndicator';
import { ErrorMessage } from '../components/ErrorMessage';
import { ListeningPassageController } from '../components/listening/ListeningPassageController';
import { VisualPromptCard } from '../components/visual/VisualPromptCard';
import {
  FastForward,
  Square,
  Mic,
  AlertCircle,
  RefreshCw,
  CheckSquare,
  Square as UncheckedSquare,
  ListOrdered,
  Sparkles,
  Layers,
  Headphones,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface PracticePageProps {
  question: SpeakingQuestion;
  settings: PracticeSettings;
  onRecordingComplete: (data: RecordingResultData) => void;
  onBackToSetup: () => void;
  retryContext?: RetryContext | null;
}

type PracticeSubStage =
  | 'listening' // Dedicated for Area 4 listening flow
  | 'listening-ready'
  | 'preparing'
  | 'transitioning'
  | 'recording'
  | 'processing'
  | 'error';

export const PracticePage: React.FC<PracticePageProps> = ({
  question,
  settings,
  onRecordingComplete,
  onBackToSetup,
  retryContext,
}) => {
  const isListeningMode = question.practiceMode === 'listening-summary';

  const [stage, setStage] = useState<PracticeSubStage>(() =>
    isListeningMode ? 'listening' : 'preparing'
  );
  const [listeningPlaybackCount, setListeningPlaybackCount] = useState<number>(0);
  const [elapsedRecordingTime, setElapsedRecordingTime] = useState<number>(0);
  const [checkedChecklist, setCheckedChecklist] = useState<Record<string, boolean>>({});
  const [recordingRefOpen, setRecordingRefOpen] = useState<boolean>(true);
  const elapsedTimerRef = useRef<number | null>(null);

  const toggleChecklist = (id: string) => {
    setCheckedChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const {
    recordingState,
    audioBlob,
    audioUrl,
    actualDuration,
    errorMessage: recorderError,
    startRecording,
    stopRecording,
    cancelRecording,
    clearError,
  } = useAudioRecorder();

  // Function to begin audio recording after preparation completes
  const handleStartSpeaking = useCallback(async () => {
    setStage('transitioning');
    const started = await startRecording();
    if (started) {
      setStage('recording');
    } else {
      setStage('error');
    }
  }, [startRecording]);

  // Preparation countdown timer
  const prepTimer = useCountdown({
    onComplete: () => {
      handleStartSpeaking();
    },
  });

  // Answer countdown timer
  const answerTimer = useCountdown({
    onComplete: () => {
      handleFinishRecording();
    },
  });

  // Track elapsed recording time
  useEffect(() => {
    if (stage === 'recording') {
      const startTime = performance.now();
      elapsedTimerRef.current = window.setInterval(() => {
        const elapsedSec = Math.floor((performance.now() - startTime) / 1000);
        setElapsedRecordingTime(elapsedSec);
      }, 250);

      // Start answer timer with configured answer duration
      answerTimer.start(settings.answerDuration);
    } else {
      if (elapsedTimerRef.current !== null) {
        clearInterval(elapsedTimerRef.current);
        elapsedTimerRef.current = null;
      }
    }

    return () => {
      if (elapsedTimerRef.current !== null) {
        clearInterval(elapsedTimerRef.current);
        elapsedTimerRef.current = null;
      }
    };
  }, [stage, settings.answerDuration]);

  // On mount: if standard/other modes, start preparation countdown immediately
  useEffect(() => {
    if (!isListeningMode) {
      prepTimer.start(settings.preparationDuration);
    }
    return () => {
      prepTimer.stop();
      answerTimer.stop();
      cancelRecording();
    };
  }, [isListeningMode]);

  // Area 4: when 2 playbacks finish in ListeningPassageController
  const handleListeningComplete = useCallback(() => {
    setStage('listening-ready');
  }, []);

  // Transition from listening to summary recording preparation
  const handleStartSummaryPrep = () => {
    setStage('preparing');
    prepTimer.start(settings.preparationDuration);
  };

  // Handle stopping recording (manual button or timeout)
  const handleFinishRecording = async () => {
    if (stage !== 'recording') return;
    setStage('processing');
    answerTimer.stop();
    if (elapsedTimerRef.current !== null) {
      clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = null;
    }
    const result = await stopRecording();
    if (result && result.blob && result.blob.size > 0) {
      console.log('[SPA DEBUG] PracticePage recording completed successfully. Blob size:', result.blob.size);
      onRecordingComplete({
        audioBlob: result.blob,
        audioUrl: result.url,
        actualDuration: result.duration || elapsedRecordingTime || 1,
        configuredDuration: settings.answerDuration,
        listeningPlaybackCount: isListeningMode ? listeningPlaybackCount : undefined,
      });
    } else {
      console.error('[SPA DEBUG] PracticePage recording produced invalid or empty Blob');
      setStage('error');
    }
  };

  // Handle user skipping preparation
  const handleSkipPreparation = () => {
    prepTimer.stop();
    handleStartSpeaking();
  };

  const handleRetryAfterError = () => {
    clearError();
    if (isListeningMode) {
      setStage('listening');
      setListeningPlaybackCount(0);
    } else {
      setStage('preparing');
      prepTimer.start(settings.preparationDuration);
    }
  };

  return (
    <div className="py-6 sm:py-10 max-w-3xl mx-auto px-4 sm:px-6">
      {/* Top Header / Progress Badge */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {question.practiceArea === 'area-4-listening-summary'
              ? 'Area 4 · 듣기 요약'
              : question.practiceArea === 'area-5-visual-prompt'
              ? 'Area 5 · 시각 자료'
              : question.categoryLabel || '실전 스피킹'}
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
            {stage === 'listening'
              ? '지문 청취 단계 (Passage Playback)'
              : stage === 'listening-ready'
              ? '청취 완료 · 요약 준비'
              : stage === 'preparing'
              ? '생각 정리 (Preparation)'
              : stage === 'recording'
              ? '실전 녹음 중 (Speaking)'
              : '처리 중'}
          </span>
        </div>

        <button
          type="button"
          onClick={onBackToSetup}
          className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          연습 취소
        </button>
      </div>

      {/* =======================================================================
          AREA 4: Dedicated Listening Stage (Passage Strictly Hidden)
          ======================================================================= */}
      {isListeningMode && (stage === 'listening' || stage === 'listening-ready') && (
        <div className="space-y-6">
          <ListeningPassageController
            question={question as ListeningSummaryQuestion}
            onListeningComplete={handleListeningComplete}
            onPlaybackCountChange={(count) => setListeningPlaybackCount(count)}
          />

          {stage === 'listening-ready' && (
            <div className="p-6 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl text-center space-y-4 animate-fade-in">
              <h3 className="text-base font-extrabold text-purple-950 dark:text-purple-200">
                2회 청취가 모두 완료되었습니다!
              </h3>
              <p className="text-xs text-purple-800 dark:text-purple-300 max-w-md mx-auto leading-relaxed">
                들은 지문의 핵심 정보(Who, What, When, Where, Why, How)를 포함하여 영어로 명확하게 요약해 주세요.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleStartSummaryPrep}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl shadow-md transition-all min-h-[48px]"
                >
                  <Mic className="w-4 h-4" />
                  <span>요약 답변 시작하기 ({settings.preparationDuration}초 준비)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =======================================================================
          Standard / Area 5 Visual / Preparation / Recording Stages
          ======================================================================= */}
      {(!isListeningMode || (stage !== 'listening' && stage !== 'listening-ready')) && (
        <>
          {/* Question Display Card */}
          <div className="mb-6">
            <QuestionCard question={question} />
          </div>

          {/* Area 3 Structure Hint Box */}
          {question.practiceMode === 'extended-response' && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs">
              <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5 mb-1.5">
                <Layers className="w-4 h-4 text-amber-600" />
                <span>답변 전개 힌트 (Extended Response Guide)</span>
              </span>
              <p className="text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
                1) 주장에 대한 명확한 의견(Opinion) → 2) 타당한 이유(Reason) → 3) 생생한 예시(Example) → 4) 한 문장 결론(Conclusion) 순서로 답변을 구성하세요.
              </p>
            </div>
          )}

          {/* Area 5 Visual Material Persistent Box while recording */}
          {question.practiceMode === 'visual-prompt' && (
            <div className="mb-6">
              <VisualPromptCard question={question as VisualPromptQuestion} compact />
            </div>
          )}

          {/* Coaching Retry Checklist (if available) */}
          {retryContext && retryContext.checklist && retryContext.checklist.length > 0 && (
            <div className="mb-6 bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold text-blue-950 dark:text-blue-200">
                    AI 코칭 재도전 체크리스트 (Retry Checklist)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setRecordingRefOpen((prev) => !prev)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {recordingRefOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {recordingRefOpen && (
                <div className="space-y-2 pt-1 border-t border-blue-100 dark:border-blue-900/40">
                  {retryContext.checklist.map((item, idx) => {
                    const isChecked = checkedChecklist[`item-${idx}`];
                    const itemText = typeof item === 'string' ? item : (item as any).instruction || (item as any).text || '';
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleChecklist(`item-${idx}`)}
                        className="w-full flex items-start gap-2.5 text-left text-xs text-blue-900 dark:text-blue-200 py-1 hover:opacity-80"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        ) : (
                          <UncheckedSquare className="w-4 h-4 text-blue-400 dark:text-blue-500 shrink-0 mt-0.5" />
                        )}
                        <span className={isChecked ? 'line-through text-blue-500 dark:text-blue-400' : 'font-medium'}>
                          {itemText}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Sub-stages: Preparing / Transitioning / Recording / Processing / Error */}
          {stage === 'preparing' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 text-center shadow-xs">
              <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider block mb-2">
                답변 준비 중 (Preparation)
              </span>

              <div className="my-6">
                <TimerDisplay
                  timeRemaining={prepTimer.timeRemaining}
                  totalDuration={settings.preparationDuration}
                  mode="preparation"
                />
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                카운트다운이 완료되면 마이크 녹음이 자동으로 시작됩니다.
              </p>

              <button
                type="button"
                onClick={handleSkipPreparation}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                <FastForward className="w-4 h-4" />
                <span>준비 완료, 바로 말하기</span>
              </button>
            </div>
          )}

          {stage === 'transitioning' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-xs animate-pulse">
              <Mic className="w-8 h-8 text-red-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                마이크 연결 중...
              </h3>
              <p className="text-xs text-slate-500 mt-1">곧 녹음이 시작됩니다.</p>
            </div>
          )}

          {stage === 'recording' && (
            <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-950/60 ring-2 ring-red-500/20 rounded-2xl p-6 sm:p-8 text-center shadow-md">
              <RecordingIndicator
                elapsedTime={elapsedRecordingTime}
                remainingTime={answerTimer.timeRemaining}
                totalDuration={settings.answerDuration}
              />

              <div className="my-6">
                <TimerDisplay
                  timeRemaining={answerTimer.timeRemaining}
                  totalDuration={settings.answerDuration}
                  mode="recording"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleFinishRecording}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm rounded-xl shadow-md transition-all min-h-[48px]"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>답변 완료 및 녹음 종료</span>
                </button>
              </div>
            </div>
          )}

          {stage === 'processing' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-xs">
              <RefreshCw className="w-8 h-8 text-blue-600 mx-auto mb-3 animate-spin" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                녹음 파일 처리 및 저장 중...
              </h3>
              <p className="text-xs text-slate-500 mt-1">잠시만 기다려 주세요.</p>
            </div>
          )}

          {stage === 'error' && (
            <div className="bg-white dark:bg-slate-900 border border-amber-200 rounded-2xl p-6 text-center shadow-xs">
              <ErrorMessage
                title="녹음 실패 안내"
                message={recorderError || '녹음 데이터를 생성하지 못했습니다. 마이크 권한을 확인하고 다시 녹음해 주세요.'}
              />
              <button
                type="button"
                onClick={handleRetryAfterError}
                className="mt-4 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                다시 시도
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
