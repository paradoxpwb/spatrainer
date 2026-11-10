/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, PlayCircle, ArrowUpRight } from 'lucide-react';
import { PaywallSource } from '../../types/monetization';

interface DailyLimitBadgeProps {
  remainingPracticeCount: number;
  practiceLimit: number;
  remainingAiFeedbackCount: number;
  aiFeedbackLimit: number;
  onOpenPaywall?: (source: PaywallSource) => void;
  onUpgradeClick?: () => void;
  compact?: boolean;
  variant?: 'compact' | 'full';
}

export const DailyLimitBadge: React.FC<DailyLimitBadgeProps> = ({
  remainingPracticeCount,
  practiceLimit,
  remainingAiFeedbackCount,
  aiFeedbackLimit,
  onOpenPaywall,
  onUpgradeClick,
  compact = false,
  variant,
}) => {
  const isCompact = variant ? variant === 'compact' : compact;
  const isPracticeExhausted = remainingPracticeCount === 0;
  const isAiExhausted = remainingAiFeedbackCount === 0;
  const isAnyLimitExhausted = isPracticeExhausted || isAiExhausted;

  const handlePaywallClick = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else if (onOpenPaywall) {
      onOpenPaywall(isPracticeExhausted ? 'daily_practice_limit' : 'header_badge');
    }
  };

  if (isCompact) {
    return (
      <button
        type="button"
        onClick={handlePaywallClick}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-indigo-600 ${
          isAnyLimitExhausted
            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
        }`}
        title="오늘의 무료 이용 잔여량"
        aria-label={`오늘의 무료 연습 ${remainingPracticeCount}/${practiceLimit}회, AI 피드백 ${remainingAiFeedbackCount}/${aiFeedbackLimit}회 남음`}
      >
        <span className="font-mono text-[11px]">
          연습 {remainingPracticeCount}/{practiceLimit}
        </span>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <span className="font-mono text-[11px] flex items-center gap-0.5">
          <Sparkles className="w-3 h-3 text-indigo-500" />
          {remainingAiFeedbackCount}/{aiFeedbackLimit}
        </span>
        {isAnyLimitExhausted && (
          <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold ml-0.5">
            플랜보기
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <span>오늘의 무료 연습 현황</span>
        </span>
        {onOpenPaywall && (
          <button
            type="button"
            onClick={() => onOpenPaywall('home_pricing')}
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <span>플랜 미리보기</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        {/* Practice Limit */}
        <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlayCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <span className="font-semibold block text-slate-800 dark:text-slate-200">
                실전 문항 연습
              </span>
              <span className="text-[11px] text-slate-400">자정 자동 갱신</span>
            </div>
          </div>
          <div className="text-right">
            <span
              className={`font-mono text-sm font-bold ${
                isPracticeExhausted
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {remainingPracticeCount} / {practiceLimit}회
            </span>
            <span className="block text-[10px] text-slate-400">남음</span>
          </div>
        </div>

        {/* AI Feedback Limit */}
        <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <div>
              <span className="font-semibold block text-slate-800 dark:text-slate-200">
                AI 정밀 코칭
              </span>
              <span className="text-[11px] text-slate-400">자정 자동 갱신</span>
            </div>
          </div>
          <div className="text-right">
            <span
              className={`font-mono text-sm font-bold ${
                isAiExhausted
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {remainingAiFeedbackCount} / {aiFeedbackLimit}회
            </span>
            <span className="block text-[10px] text-slate-400">남음</span>
          </div>
        </div>
      </div>
    </div>
  );
};
