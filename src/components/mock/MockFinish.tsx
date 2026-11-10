/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { CheckCircle2, ArrowRight, Clock, Award } from 'lucide-react';
import { MockExamResult } from '../../types/mockExam';

interface MockFinishProps {
  result: MockExamResult;
  onProceedToResult: () => void;
}

export const MockFinish: React.FC<MockFinishProps> = ({
  result,
  onProceedToResult,
}) => {
  // Auto-advance after 3 seconds or on button click
  useEffect(() => {
    const timer = setTimeout(() => {
      onProceedToResult();
    }, 2800);
    return () => clearTimeout(timer);
  }, [onProceedToResult]);

  const minutes = Math.floor(result.totalElapsedSeconds / 60);
  const seconds = result.totalElapsedSeconds % 60;

  return (
    <div className="max-w-xl mx-auto px-4 py-16 sm:py-24 text-center space-y-6">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-sm">
        <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          모의고사가 종료되었습니다
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          모든 문항의 녹음이 정상적으로 완료되었습니다. 결과 화면으로 이동합니다.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-around text-xs sm:text-sm">
        <div>
          <span className="text-slate-500 block text-[11px] mb-0.5">답변 문항 수</span>
          <span className="font-bold text-slate-900 dark:text-slate-100 font-mono text-base">
            {result.items.length} / {result.items.length} 문항
          </span>
        </div>
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
        <div>
          <span className="text-slate-500 block text-[11px] mb-0.5">총 소요 시간</span>
          <span className="font-bold text-slate-900 dark:text-slate-100 font-mono text-base">
            {minutes}분 {seconds}초
          </span>
        </div>
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
        <div>
          <span className="text-slate-500 block text-[11px] mb-0.5">탭 이탈 횟수</span>
          <span className="font-bold text-slate-900 dark:text-slate-100 font-mono text-base">
            {result.tabSwitchCount}회
          </span>
        </div>
      </div>

      <div className="pt-4">
        <button
          type="button"
          onClick={onProceedToResult}
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-sm transition-all"
        >
          <span>결과 및 녹음 확인하기</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
