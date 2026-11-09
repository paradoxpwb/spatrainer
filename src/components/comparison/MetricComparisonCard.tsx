import React from 'react';
import { MetricChange } from '../../types/comparison';
import { CheckCircle2, AlertTriangle, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricComparisonCardProps {
  change: MetricChange;
}

export const MetricComparisonCard: React.FC<MetricComparisonCardProps> = ({ change }) => {
  const isImproved = change.interpretation === 'improved';
  const isNeedsReview = change.interpretation === 'needs-review';

  const badgeStyle = isImproved
    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
    : isNeedsReview
    ? 'bg-amber-50 text-amber-800 border-amber-200'
    : 'bg-slate-100 text-slate-700 border-slate-200';

  const statusLabel = isImproved ? '개선됨' : isNeedsReview ? '검토 권장' : '유사 유지';

  const isPositiveChange = change.absoluteChange > 0;
  const isZeroChange = change.absoluteChange === 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold text-slate-700">{change.label}</span>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-lg border ${badgeStyle}`}
          >
            {isImproved && <CheckCircle2 className="w-3 h-3 text-emerald-600" aria-hidden="true" />}
            {isNeedsReview && (
              <AlertTriangle className="w-3 h-3 text-amber-600" aria-hidden="true" />
            )}
            {!isImproved && !isNeedsReview && (
              <Minus className="w-3 h-3 text-slate-500" aria-hidden="true" />
            )}
            <span>{statusLabel}</span>
          </span>
        </div>

        {/* Value comparison */}
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-xl sm:text-2xl font-mono font-bold text-slate-900">
            {change.currentValue}
            <span className="text-xs font-sans text-slate-500 font-normal ml-0.5">
              {change.unit}
            </span>
          </span>

          <span className="text-xs text-slate-400 font-mono">
            (이전: {change.previousValue}
            {change.unit})
          </span>
        </div>

        {/* Change delta indicator */}
        <div className="flex items-center gap-1.5 mt-1.5 text-xs font-semibold">
          {isPositiveChange && (
            <span className="inline-flex items-center text-blue-700">
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              <span>+{change.absoluteChange}</span>
            </span>
          )}
          {!isPositiveChange && !isZeroChange && (
            <span className="inline-flex items-center text-slate-700">
              <ArrowDownRight className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{change.absoluteChange}</span>
            </span>
          )}
          {isZeroChange && <span className="text-slate-500">변화 없음 (0)</span>}

          {change.percentageChange !== null && !isZeroChange && (
            <span className="text-[11px] text-slate-400 font-normal font-mono">
              ({change.percentageChange > 0 ? `+${change.percentageChange}` : change.percentageChange}
              %)
            </span>
          )}
        </div>
      </div>

      {/* Explanation note */}
      <div className="mt-3 pt-2.5 border-t border-slate-100">
        <p className="text-[11px] text-slate-600 leading-relaxed">{change.explanation}</p>
      </div>
    </div>
  );
};
