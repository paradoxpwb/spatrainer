/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Award,
  Play,
  RotateCcw,
  Home,
  Clock,
  ShieldAlert,
  AlertTriangle,
  Volume2,
  BarChart2,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { MockExamResult, MockRecordedItem } from '../../types/mockExam';

interface MockResultProps {
  result: MockExamResult;
  onRetakeExam: () => void;
  onGoHome: () => void;
}

export const MockResult: React.FC<MockResultProps> = ({
  result,
  onRetakeExam,
  onGoHome,
}) => {
  const [activePlayingIndex, setActivePlayingIndex] = useState<number | null>(null);

  const totalMinutes = Math.floor(result.totalElapsedSeconds / 60);
  const totalSeconds = result.totalElapsedSeconds % 60;

  // Simple heuristic speaking grade reference
  // 6문항 모두 정상 응답하고 소요시간 준수 시 참고 등급 산출
  const totalRecordedSeconds = result.items.reduce(
    (acc, item) => acc + item.durationSeconds,
    0
  );
  const averageResponseRatio =
    result.items.length > 0
      ? result.items.reduce((acc, item) => acc + item.durationSeconds / item.maxDurationSeconds, 0) /
        result.items.length
      : 0;

  let estimatedLevel = 'Level 4 (Intermediate)';
  let estimatedDescription = '기본적인 문장 구사가 가능하며 제한시간의 50% 이상을 발화했습니다.';
  if (averageResponseRatio >= 0.75 && result.tabSwitchCount === 0) {
    estimatedLevel = 'Level 5 ~ 6 (High Intermediate / Advanced)';
    estimatedDescription = '제한시간을 알차게 활용하여 충분한 분량의 어휘와 논리를 전개했습니다.';
  } else if (averageResponseRatio < 0.45) {
    estimatedLevel = 'Level 3 (Novice High)';
    estimatedDescription = '답변 시간이 다소 짧아 추가적인 문장 확장 및 구체적 근거 보강이 권장됩니다.';
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Result Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          <Award className="w-3.5 h-3.5" />
          <span>모의고사 종합 분석 보고서</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          실전 모의고사 응시 결과
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          녹음된 답변을 다시 들어보며 자신의 발화량, 시간 배분, 전달력을 점검하세요.
        </p>
      </div>

      {/* Mandatory Disclaimer Badge */}
      <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/80 dark:bg-amber-950/30 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
          <strong className="font-semibold block mb-0.5">결과 안내 및 평가 참고사항</strong>
          <span>
            화면에 표시되는 등급 및 분석치는 발화 시간 비율을 기반으로 산출된 <strong>"예상 참고치이며 공식 SPA 점수가 아님"</strong>을 명시합니다. 실제 SPA 시험은 전문 평가위원의 대면 또는 다각도 평가로 결정됩니다.
          </span>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center">
          <span className="text-[11px] text-slate-500 block mb-1">응시 문항 수</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
            {result.items.length} / 6
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center">
          <span className="text-[11px] text-slate-500 block mb-1">총 시험 시간</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
            {totalMinutes}분 {totalSeconds}초
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center">
          <span className="text-[11px] text-slate-500 block mb-1">총 발화 시간</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
            {totalRecordedSeconds}초
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center">
          <span className="text-[11px] text-slate-500 block mb-1">6번 시각 자료</span>
          <span className="text-sm sm:text-base font-bold text-indigo-600 dark:text-indigo-400 block pt-1">
            {result.visualTypePicked === 'chart' ? '데이터 차트' : '상황 사진'}
          </span>
        </div>
      </div>

      {/* Estimated Reference Tier Box */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-500">자가 진단 예상 참고 등급</span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            {estimatedLevel}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          {estimatedDescription} (답변 시간 충실도: {Math.round(averageResponseRatio * 100)}%)
        </p>
        {result.tabSwitchCount > 0 && (
          <div className="pt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>시험 중 {result.tabSwitchCount}회의 브라우저 탭 이탈이 감지되었습니다.</span>
          </div>
        )}
      </div>

      {/* Per-Question Recorded Items Review */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
          문항별 답변 및 녹음 청취
        </h2>

        <div className="space-y-4">
          {result.items.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs">
                    {item.partTitle}
                  </span>
                  {item.visual && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                      {item.visual.type === 'chart' ? <BarChart2 className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                      <span>{item.visual.type === 'chart' ? '차트' : '사진'}</span>
                    </span>
                  )}
                </div>

                <div className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400">
                  응답 시간: <span className="text-indigo-600 dark:text-indigo-400">{item.durationSeconds}초</span> / {item.maxDurationSeconds}초
                </div>
              </div>

              {/* Question Prompt Review */}
              <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong className="text-slate-900 dark:text-slate-100 block mb-0.5">질문 내용:</strong>
                <p className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  "{item.promptText}"
                </p>
              </div>

              {/* Visual Thumbnail for Part 6 */}
              {item.visual && (
                <div className="pt-1">
                  <span className="text-[11px] text-slate-500 font-medium block mb-1">제시된 시각 자료:</span>
                  <div className="w-full sm:w-64 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-2 overflow-hidden">
                    <img
                      src={item.visual.imageUrl}
                      alt={item.visual.altText}
                      className="w-full h-auto object-contain rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Audio Playback Player */}
              {item.audioUrl && (
                <div className="pt-2">
                  <audio
                    controls
                    src={item.audioUrl}
                    className="w-full h-10 rounded-xl"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={onGoHome}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>홈으로 이동</span>
        </button>

        <button
          type="button"
          onClick={onRetakeExam}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>다른 세트로 다시 응시하기</span>
        </button>
      </div>
    </div>
  );
};
