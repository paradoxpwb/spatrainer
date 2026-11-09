/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PRACTICE_AREAS, TOPICS } from '../../config/practiceTaxonomy';
import { PracticeAreaId, TopicId } from '../../types/question';

export interface HistoryFilterState {
  period: 'all' | '7d' | '30d';
  practiceArea: 'all' | PracticeAreaId;
  topic: 'all' | TopicId | string;
  categoryId?: string; // legacy alias
  hasRetryOnly: boolean;
  hasCoachingOnly: boolean;
  sortBy: 'latest' | 'oldest' | 'attempts';
}

interface HistoryFiltersProps {
  filters: HistoryFilterState;
  onChangeFilters: (next: HistoryFilterState) => void;
}

export const HistoryFilters: React.FC<HistoryFiltersProps> = ({
  filters,
  onChangeFilters,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Practice Area selector */}
        <div>
          <label htmlFor="history-area-select" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Practice Area:
          </label>
          <select
            id="history-area-select"
            value={filters.practiceArea || 'all'}
            onChange={(e) =>
              onChangeFilters({
                ...filters,
                practiceArea: e.target.value as HistoryFilterState['practiceArea'],
              })
            }
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 rounded-xl focus-visible:outline-blue-600 cursor-pointer min-h-[40px]"
          >
            <option value="all">모든 Area (All Areas)</option>
            {PRACTICE_AREAS.map((area) => (
              <option key={area.id} value={area.id}>
                {area.labelKo} ({area.labelEn})
              </option>
            ))}
          </select>
        </div>

        {/* Topic selector */}
        <div>
          <label htmlFor="history-topic-select" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Topic (주제):
          </label>
          <select
            id="history-topic-select"
            value={filters.topic || filters.categoryId || 'all'}
            onChange={(e) =>
              onChangeFilters({
                ...filters,
                topic: e.target.value,
                categoryId: e.target.value,
              })
            }
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 rounded-xl focus-visible:outline-blue-600 cursor-pointer min-h-[40px]"
          >
            <option value="all">모든 Topic (전체 주제)</option>
            {TOPICS.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.labelKo} ({topic.labelEn})
              </option>
            ))}
          </select>
        </div>

        {/* Period selector */}
        <div>
          <label htmlFor="history-period-select" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            기간:
          </label>
          <select
            id="history-period-select"
            value={filters.period}
            onChange={(e) =>
              onChangeFilters({
                ...filters,
                period: e.target.value as HistoryFilterState['period'],
              })
            }
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 rounded-xl focus-visible:outline-blue-600 cursor-pointer min-h-[40px]"
          >
            <option value="all">전체 기간</option>
            <option value="7d">최근 7일</option>
            <option value="30d">최근 30일</option>
          </select>
        </div>

        {/* Sort by */}
        <div>
          <label htmlFor="history-sort-select" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            정렬:
          </label>
          <select
            id="history-sort-select"
            value={filters.sortBy}
            onChange={(e) =>
              onChangeFilters({
                ...filters,
                sortBy: e.target.value as HistoryFilterState['sortBy'],
              })
            }
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 rounded-xl focus-visible:outline-blue-600 cursor-pointer min-h-[40px]"
          >
            <option value="latest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="attempts">답변 시도 많은 순</option>
          </select>
        </div>
      </div>

      {/* Checkbox toggles */}
      <div className="flex flex-wrap items-center gap-4 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.hasRetryOnly}
            onChange={(e) => onChangeFilters({ ...filters, hasRetryOnly: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700"
          />
          <span>재도전(Retry 2회 이상)한 세션만</span>
        </label>

        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.hasCoachingOnly}
            onChange={(e) => onChangeFilters({ ...filters, hasCoachingOnly: e.target.checked })}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700"
          />
          <span>AI 코칭을 받은 세션만</span>
        </label>
      </div>
    </div>
  );
};
