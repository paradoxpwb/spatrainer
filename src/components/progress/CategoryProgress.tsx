import React from 'react';
import { CategoryProgress as CatProgressType } from '../../types/progress';
import { Layers, RotateCcw, Clock, Flame, Calendar, Tag } from 'lucide-react';

interface CategoryProgressProps {
  categories: CatProgressType[];
  onSelectCategory?: (categoryId: string) => void;
}

export const CategoryProgress: React.FC<CategoryProgressProps> = ({
  categories,
  onSelectCategory,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <Layers className="w-5 h-5 text-blue-600" aria-hidden="true" />
        <div>
          <h3 className="text-base font-bold text-slate-900">
            카테고리별 연습 현황 (Category Breakdown)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            8개 SPA 핵심 영역별 발화 경험치 및 AI 코칭 개선 테마입니다.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat) => {
          const count = cat.attemptCount ?? cat.practiceCount ?? 0;
          const hasPracticed = count > 0;
          const lastDateStr = cat.lastPracticedAt
            ? new Date(cat.lastPracticedAt).toLocaleDateString()
            : '아직 연습하지 않음';

          return (
            <div
              key={cat.categoryId}
              className={`p-4.5 rounded-2xl border transition-all ${
                hasPracticed
                  ? 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  : 'bg-slate-50/50 border-slate-200/60 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-slate-900">{cat.categoryLabel}</span>

                {hasPracticed ? (
                  <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
                    {count}회 연습 ({cat.retryCount}회 Retry)
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium">0회 (미연습)</span>
                )}
              </div>

              {hasPracticed ? (
                <div className="space-y-3">
                  {/* Metric Chips */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="block text-[10px] text-slate-400 font-semibold mb-0.5">
                        평균 시간
                      </span>
                      <span className="font-mono font-bold text-slate-800">
                        {cat.averageRecordingSeconds !== null ? `${cat.averageRecordingSeconds}초` : '데이터 없음'}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="block text-[10px] text-slate-400 font-semibold mb-0.5">
                        평균 WPM
                      </span>
                      <span className="font-mono font-bold text-slate-800">
                        {cat.averageWordsPerMinute !== null ? `${cat.averageWordsPerMinute}` : '데이터 없음'}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="block text-[10px] text-slate-400 font-semibold mb-0.5">
                        Filler 비율
                      </span>
                      <span className="font-mono font-bold text-slate-800">
                        {cat.averageFillerRate !== null ? `${cat.averageFillerRate}개` : '데이터 없음'}
                      </span>
                    </div>
                  </div>

                  {/* Frequent Improvement Tags */}
                  {cat.frequentImprovementTags.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                        자주 언급된 개선 주제:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {cat.frequentImprovementTags.map((tagItem, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-medium rounded-md"
                          >
                            <Tag className="w-2.5 h-2.5 text-slate-400" />
                            <span>
                              {tagItem.label} ({tagItem.count}회)
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>최근: {lastDateStr}</span>
                    {onSelectCategory && (
                      <button
                        type="button"
                        onClick={() => onSelectCategory(cat.categoryId)}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        이 카테고리 연습하기 →
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-2 text-center">
                  <p className="text-xs text-slate-500">아직 도전하지 않은 주제입니다.</p>
                  {onSelectCategory && (
                    <button
                      type="button"
                      onClick={() => onSelectCategory(cat.categoryId)}
                      className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800"
                    >
                      첫 번째 연습 시작하기 →
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
