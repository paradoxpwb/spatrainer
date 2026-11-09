/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AreaProgress } from '../../types/progress';
import { Layers, Headphones, MessageSquare, Mic, Eye, Sparkles } from 'lucide-react';
import { PracticeAreaId } from '../../types/question';

interface AreaProgressSectionProps {
  areas: AreaProgress[];
  legacyUnassignedCount?: number;
}

export const AreaProgressSection: React.FC<AreaProgressSectionProps> = ({
  areas,
  legacyUnassignedCount = 0,
}) => {
  const getAreaIcon = (id: PracticeAreaId) => {
    switch (id) {
      case 'area-1-personal-workplace':
        return <Mic className="w-5 h-5 text-blue-600" />;
      case 'area-2-business-follow-up':
        return <MessageSquare className="w-5 h-5 text-indigo-600" />;
      case 'area-3-opinion-extended':
        return <Layers className="w-5 h-5 text-amber-600" />;
      case 'area-4-listening-summary':
        return <Headphones className="w-5 h-5 text-purple-600" />;
      case 'area-5-visual-prompt':
        return <Eye className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600" aria-hidden="true" />
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Practice Area별 연습 현황 (5개 훈련 영역)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              각 문제 유형(표준 문답, 후속 질문, 확장 논리, 듣기 요약, 시각 자료)별 누적 활동입니다.
            </p>
          </div>
        </div>

        {legacyUnassignedCount > 0 && (
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md self-start sm:self-auto">
            기존 기록: {legacyUnassignedCount}건 (Area 미지정 보존)
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {areas.map((area) => {
          const hasPracticed = area.attemptCount > 0;
          const lastDateStr = area.lastPracticedAt
            ? new Date(area.lastPracticedAt).toLocaleDateString()
            : '미연습';

          return (
            <div
              key={area.areaId}
              className={`p-4.5 rounded-2xl border transition-all ${
                hasPracticed
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs'
                  : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800/50 opacity-80'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    {getAreaIcon(area.areaId)}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      Area {area.order}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {area.labelKo}
                    </h4>
                  </div>
                </div>

                {hasPracticed ? (
                  <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-md shrink-0">
                    {area.attemptCount}회 시도
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium shrink-0">0회</span>
                )}
              </div>

              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-3 font-medium">
                {area.labelEn}
              </span>

              {hasPracticed ? (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700">
                      <span className="block text-[10px] text-slate-400 font-semibold mb-0.5">
                        세션
                      </span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {area.sessionCount}개
                      </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700">
                      <span className="block text-[10px] text-slate-400 font-semibold mb-0.5">
                        재도전
                      </span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {area.retryCount}회
                      </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700">
                      <span className="block text-[10px] text-slate-400 font-semibold mb-0.5">
                        평균 WPM
                      </span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {area.averageWordsPerMinute !== null ? area.averageWordsPerMinute : '-'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>최근: {lastDateStr}</span>
                    <span>평균시간: {area.averageRecordingSeconds !== null ? `${area.averageRecordingSeconds}초` : '-'}</span>
                  </div>
                </div>
              ) : (
                <div className="py-2 text-center text-xs text-slate-400">
                  아직 연습 기록이 없습니다.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
