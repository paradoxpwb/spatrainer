/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SpeakingQuestion, PracticeSettings } from '../types/question';
import { QuestionCard } from '../components/QuestionCard';
import { Play, Shuffle, ArrowLeft, Clock, Mic, Headphones } from 'lucide-react';
import { formatDurationLabel } from '../utils/timeUtils';

interface QuestionReadyPageProps {
  question: SpeakingQuestion;
  settings: PracticeSettings;
  onStartPreparation: () => void;
  onChangeQuestion: () => void;
  onBackToSetup: () => void;
}

export const QuestionReadyPage: React.FC<QuestionReadyPageProps> = ({
  question,
  settings,
  onStartPreparation,
  onChangeQuestion,
  onBackToSetup,
}) => {
  const isListeningMode = question.practiceMode === 'listening-summary';

  return (
    <div className="py-8 sm:py-12 max-w-3xl mx-auto px-4 sm:px-6">
      {/* Top navigation */}
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToSetup}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600 rounded-md py-1 pr-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>설정으로 돌아가기</span>
        </button>

        <span className="text-xs text-slate-400 font-medium">
          Step 1/3 · {isListeningMode ? '청취 준비' : '문제 확인'}
        </span>
      </div>

      {/* Main Question Display */}
      <div className="mb-8">
        <QuestionCard question={question} highlight />
      </div>

      {/* Target Time Info Bar */}
      <div className="mb-8 grid grid-cols-2 gap-4 bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-xl p-4 text-center">
        <div>
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
            <span>{isListeningMode ? '지문 청취 횟수' : '준비시간'}</span>
          </div>
          <span className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
            {isListeningMode ? '총 2회 (연속 청취)' : formatDurationLabel(settings.preparationDuration)}
          </span>
        </div>

        <div className="border-l border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <Mic className="w-3.5 h-3.5 text-red-600" aria-hidden="true" />
            <span>{isListeningMode ? '요약 답변 제한시간' : '답변 제한시간'}</span>
          </div>
          <span className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
            {formatDurationLabel(settings.answerDuration)}
          </span>
        </div>
      </div>

      {/* Guidance Note */}
      <div className="mb-8 text-center text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        {isListeningMode ? (
          <p>
            "청취 시작"을 누르면 지문 음성 재생 단계로 이동합니다.
            감독관 음성으로 <strong>정확히 2회</strong> 들려준 후 요약 녹음이 활성화됩니다.
          </p>
        ) : (
          <p>
            "준비 시작"을 누르면 <strong>{settings.preparationDuration}초</strong> 카운트다운이 진행되며,
            준비시간이 끝나면 <strong>자동으로 마이크 녹음이 시작</strong>됩니다.
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={onChangeQuestion}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 min-h-[44px]"
        >
          <Shuffle className="w-4 h-4 text-slate-500" aria-hidden="true" />
          <span>다른 문제 받기</span>
        </button>

        <button
          type="button"
          onClick={onStartPreparation}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 font-bold text-base rounded-xl shadow-xs hover:shadow transition-all min-h-[48px] sm:min-w-[220px] text-white ${
            isListeningMode
              ? 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800'
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
          }`}
        >
          {isListeningMode ? (
            <>
              <Headphones className="w-5 h-5" aria-hidden="true" />
              <span>청취 시작 (2회 재생)</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" aria-hidden="true" />
              <span>준비 시작</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
