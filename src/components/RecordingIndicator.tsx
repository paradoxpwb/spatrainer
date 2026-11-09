import React from 'react';
import { formatTime } from '../utils/timeUtils';

interface RecordingIndicatorProps {
  elapsedTime: number;
  remainingTime: number;
  totalDuration: number;
}

export const RecordingIndicator: React.FC<RecordingIndicatorProps> = ({
  elapsedTime,
  remainingTime,
  totalDuration,
}) => {
  const percent = totalDuration > 0
    ? Math.min(100, Math.max(0, (elapsedTime / totalDuration) * 100))
    : 0;

  return (
    <div className="w-full bg-red-50/70 border border-red-200/80 rounded-2xl p-5 sm:p-6" aria-live="assertive">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Status badge */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="w-3.5 h-3.5 rounded-full bg-red-600 animate-ping absolute opacity-75" />
            <span className="w-3 h-3 rounded-full bg-red-600 relative" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-red-950 uppercase tracking-wide">
                Recording
              </span>
              <span className="text-xs text-red-700 font-medium">마이크 녹음 중</span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              자연스럽고 또렷한 목소리로 영어 답변을 이어가세요.
            </p>
          </div>
        </div>

        {/* Time statistics */}
        <div className="flex items-center gap-6 justify-between sm:justify-end">
          <div className="text-left sm:text-right">
            <span className="block text-[11px] font-semibold text-slate-500 uppercase">
              진행 시간
            </span>
            <span className="font-mono text-lg font-bold text-slate-900 tabular-nums">
              {formatTime(elapsedTime)}
            </span>
          </div>
          <div className="h-8 w-px bg-red-200" aria-hidden="true" />
          <div className="text-left sm:text-right">
            <span className="block text-[11px] font-semibold text-slate-500 uppercase">
              남은 시간
            </span>
            <span className="font-mono text-lg font-bold text-red-600 tabular-nums">
              {formatTime(remainingTime)}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 w-full bg-red-200/60 rounded-full h-2 overflow-hidden">
        <div
          className="bg-red-600 h-full transition-all duration-300 ease-linear rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
