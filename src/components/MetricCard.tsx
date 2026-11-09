import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subValue?: string;
  description: string;
  highlight?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  subValue,
  description,
  highlight = false,
}) => {
  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
        highlight
          ? 'bg-blue-50/60 border-blue-200 shadow-xs'
          : 'bg-white border-slate-200 shadow-xs'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {label}
        </span>
        {subValue && (
          <span className="text-[11px] font-medium text-slate-400 font-mono tabular-nums">
            {subValue}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-1 my-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-xs sm:text-sm font-semibold text-slate-500">
            {unit}
          </span>
        )}
      </div>

      <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed mt-1">
        {description}
      </p>
    </div>
  );
};
