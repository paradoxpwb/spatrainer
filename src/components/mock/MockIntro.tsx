/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  Clock,
  VolumeX,
  RotateCcw,
  FastForward,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Ticket,
} from 'lucide-react';
import { MockExamBlueprint } from '../../types/mockExam';

interface MockIntroProps {
  blueprint: MockExamBlueprint;
  remainingTickets: number;
  onProceedToCheck: () => void;
  onCancel: () => void;
}

export const MockIntro: React.FC<MockIntroProps> = ({
  blueprint,
  remainingTickets,
  onProceedToCheck,
  onCancel,
}) => {
  const [agreed, setAgreed] = useState(false);

  const totalMinutes = Math.floor(blueprint.totalMaxTimeSeconds / 60);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Title & Badge */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          <Clock className="w-3.5 h-3.5" />
          <span>실제 시험 동일 환경 · 상한 {totalMinutes}분</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          {blueprint.title}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Part 1부터 Part 6까지 멈춤 없이 실제 시험처럼 진행되는 풀세트 실전 모의고사입니다.
        </p>
      </div>

      {/* Ticket / Entitlement Status Box */}
      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center gap-2.5">
          <Ticket className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            모의고사 응시 이용권
          </span>
        </div>
        <span className="px-2.5 py-1 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 font-bold font-mono">
          {remainingTickets}회 가능
        </span>
      </div>

      {/* Exam Blueprint Parts Overview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
          <span>시험 문항 구성 (총 {blueprint.parts.length}문항)</span>
          <span className="text-xs text-slate-500 font-normal">총 상한 {totalMinutes}분</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {blueprint.parts.map((part) => (
            <div
              key={part.partId}
              className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-1"
            >
              <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                <span>{part.partTitle}</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono">
                  {part.prepSeconds > 0 ? `준비 ${part.prepSeconds}s / ` : ''}답변 {part.answerMaxSeconds}s
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {part.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Strict Exam Rules Section */}
      <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>실전 모의고사 5대 응시 규정 (필독)</span>
        </div>

        <div className="space-y-2.5 text-xs text-amber-900 dark:text-amber-300">
          <div className="flex items-start gap-2">
            <VolumeX className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>1. 문제 음성 다시 듣기 불가:</strong> 실제 시험과 동일하게 음성은 1회만 재생되며, 재생 버튼이 제공되지 않습니다.
            </span>
          </div>

          <div className="flex items-start gap-2">
            <RotateCcw className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>2. 이전 문제 복귀 및 일시정지 불가:</strong> 중간에 멈추거나 이전 문제로 되돌아가 답변을 수정할 수 없습니다.
            </span>
          </div>

          <div className="flex items-start gap-2">
            <FastForward className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>3. 시간 만료 시 자동 진행:</strong> 답변 제한시간이 만료되면 녹음이 즉시 종료되고 다음 문항으로 자동 전환됩니다.
            </span>
          </div>

          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>4. 전체 시험 상한 시간 {totalMinutes}분:</strong> 상한 시간에 도달하면 현재 문항을 정리하고 시험이 자동 종료됩니다.
            </span>
          </div>

          <div className="flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>5. 비공식 연습 도구 안내:</strong> 본 모의시험은 영어 말하기 실전 자가 훈련용 도구이며, 공식 SPA 주관 기관의 점수나 등급을 보증하지 않습니다.
            </span>
          </div>
        </div>
      </div>

      {/* Agreement Checkbox */}
      <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
        />
        <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 select-none">
          <span className="font-semibold block text-slate-900 dark:text-slate-100 mb-0.5">
            위 유의사항 및 비공식 시험 규정을 모두 확인하였으며, 모의시험에 응시합니다.
          </span>
          <span className="text-slate-500 dark:text-slate-400 text-xs">
            동의 후 마이크 및 오디오 환경 점검 단계로 이동합니다.
          </span>
        </div>
      </label>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          돌아가기
        </button>

        <button
          type="button"
          disabled={!agreed}
          onClick={onProceedToCheck}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm shadow-sm transition-all ${
            agreed
              ? 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white cursor-pointer hover:shadow'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
          }`}
        >
          <span>환경 점검 시작</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
