import React from 'react';
import { formatTime } from '../utils/timeUtils';

interface TimerDisplayProps {
  timeRemaining: number;
  totalDuration: number;
  mode: 'preparation' | 'recording';
  size?: 'md' | 'lg';
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  timeRemaining,
  totalDuration,
  mode,
  size = 'lg',
}) => {
  const isPrep = mode === 'preparation';
  const progressPercent = totalDuration > 0
    ? Math.min(100, Math.max(0, ((totalDuration - timeRemaining) / totalDuration) * 100))
    : 0;

  // SVG circular calculations
  const radius = size === 'lg' ? 76 : 56;
  const strokeWidth = size === 'lg' ? 8 : 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;
  const svgSize = (radius + strokeWidth) * 2;

  const strokeColor = isPrep ? '#2563EB' : '#DC2626'; // Blue vs Red
  const ringBgColor = isPrep ? '#DBEAFE' : '#FEE2E2';

  const isLowTime = timeRemaining <= 10 && timeRemaining > 0;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative inline-flex items-center justify-center" aria-live="polite">
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="transform -rotate-90"
          aria-hidden="true"
        >
          {/* Background circle */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke={ringBgColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-200 ease-linear"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
          <span
            className={`font-mono font-extrabold tracking-tight tabular-nums ${
              size === 'lg' ? 'text-4xl sm:text-5xl' : 'text-2xl sm:text-3xl'
            } ${
              isPrep
                ? 'text-slate-900'
                : isLowTime
                ? 'text-red-600 animate-pulse'
                : 'text-slate-900'
            }`}
          >
            {formatTime(timeRemaining)}
          </span>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1">
            남은 시간
          </span>
        </div>
      </div>

      <div className="mt-3">
        <span
          className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
            isPrep
              ? 'bg-blue-100 text-blue-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {isPrep ? '준비 시간 (Preparation)' : '답변 녹음 진행 중 (Speaking)'}
        </span>
      </div>
    </div>
  );
};
