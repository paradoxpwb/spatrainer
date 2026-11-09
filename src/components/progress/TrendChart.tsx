import React, { useState } from 'react';
import { TrendPoint } from '../../types/progress';
import { TrendingUp, BarChart2, Info } from 'lucide-react';

interface TrendChartProps {
  trendPoints: TrendPoint[];
}

type TrendMetric = 'wpm' | 'duration' | 'fillerRate' | 'totalWords';

export const TrendChart: React.FC<TrendChartProps> = ({ trendPoints }) => {
  const [selectedMetric, setSelectedMetric] = useState<TrendMetric>('wpm');
  const [hoveredPoint, setHoveredPoint] = useState<TrendPoint | null>(null);

  const METRIC_CONFIG: Record<
    TrendMetric,
    { label: string; unit: string; color: string; stroke: string; idealRange?: string }
  > = {
    wpm: {
      label: '발화 속도 (WPM)',
      unit: 'WPM',
      color: 'bg-blue-600',
      stroke: '#2563eb',
      idealRange: '참고 목표: 110~149 WPM',
    },
    duration: {
      label: '발화 시간',
      unit: '초',
      color: 'bg-emerald-600',
      stroke: '#059669',
      idealRange: '참고 목표: 45~90초',
    },
    fillerRate: {
      label: 'Filler 비율 (100단어당)',
      unit: '개',
      color: 'bg-amber-600',
      stroke: '#d97706',
      idealRange: '참고 목표: 3.0개 이하',
    },
    totalWords: {
      label: '총 단어 수',
      unit: '단어',
      color: 'bg-purple-600',
      stroke: '#9333ea',
      idealRange: '참고 목표: 50~120단어',
    },
  };

  const config = METRIC_CONFIG[selectedMetric];

  if (!trendPoints || trendPoints.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <TrendingUp className="w-5 h-5 text-blue-600" aria-hidden="true" />
          <h3 className="text-base font-bold text-slate-900">발화 지표 추세 (Speaking Trend)</h3>
        </div>
        <p className="text-xs text-slate-500 py-6 text-center">
          선택한 기간에 연습 기록이 없어 추세를 표시할 수 없습니다.
        </p>
      </div>
    );
  }

  if (trendPoints.length === 1) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <TrendingUp className="w-5 h-5 text-blue-600" aria-hidden="true" />
          <h3 className="text-base font-bold text-slate-900">발화 지표 추세 (Speaking Trend)</h3>
        </div>
        <div className="p-8 text-center space-y-2">
          <p className="text-xs font-semibold text-slate-700">
            추세를 확인하려면 연습 기록이 한 개 더 필요합니다.
          </p>
          <p className="text-[11px] text-slate-400">
            동일 문제에 재도전하거나 다른 질문을 한 번 더 연습해 보세요.
          </p>
        </div>
      </div>
    );
  }

  // Extract values
  const getVal = (p: TrendPoint) => {
    switch (selectedMetric) {
      case 'wpm':
        return p.wpm;
      case 'duration':
        return p.speakingDuration;
      case 'fillerRate':
        return p.fillerRate;
      case 'totalWords':
        return p.totalWords;
    }
  };

  const values = trendPoints.map(getVal);
  const maxVal = Math.max(...values, 10);
  const minVal = Math.min(...values, 0);
  const valRange = maxVal - minVal || 1;

  // SVG Chart Dimensions
  const svgWidth = 500;
  const svgHeight = 160;
  const paddingX = 35;
  const paddingY = 25;

  const points = trendPoints.map((p, idx) => {
    const x =
      paddingX + (idx / (trendPoints.length - 1)) * (svgWidth - paddingX * 2);
    const normalizedY = (getVal(p) - minVal) / valRange;
    const y = svgHeight - paddingY - normalizedY * (svgHeight - paddingY * 2);
    return { x, y, point: p, val: getVal(p) };
  });

  const pathD = points.reduce(
    (acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`,
    ''
  );

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
      {/* Header & Metric Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" aria-hidden="true" />
            <h3 className="text-base font-bold text-slate-900">
              발화 지표 추세 (Speaking Trend)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {config.idealRange}
          </p>
        </div>

        {/* Metric Selector Pills */}
        <div
          role="radiogroup"
          aria-label="추세 지표 선택"
          className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold self-start sm:self-auto"
        >
          {(
            [
              ['wpm', '속도(WPM)'],
              ['duration', '발화 시간'],
              ['fillerRate', 'Filler 비율'],
              ['totalWords', '단어 수'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={selectedMetric === key}
              onClick={() => {
                setSelectedMetric(key);
                setHoveredPoint(null);
              }}
              className={`px-2.5 py-1 rounded-lg transition-colors text-[11px] ${
                selectedMetric === key
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive SVG Line Chart */}
      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-44 sm:h-52 overflow-visible select-none"
          role="img"
          aria-label={`${config.label} 변화 추세 그래프`}
        >
          {/* Subtle Gridlines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={svgWidth - paddingX}
            y2={paddingY}
            stroke="#f1f5f9"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={svgHeight / 2}
            x2={svgWidth - paddingX}
            y2={svgHeight / 2}
            stroke="#f1f5f9"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={svgHeight - paddingY}
            x2={svgWidth - paddingX}
            y2={svgHeight - paddingY}
            stroke="#e2e8f0"
          />

          {/* Area fill */}
          <path
            d={`${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${
              points[0].x
            } ${svgHeight - paddingY} Z`}
            fill={config.stroke}
            fillOpacity="0.08"
          />

          {/* Line Path */}
          <path
            d={pathD}
            fill="none"
            stroke={config.stroke}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((pt, idx) => (
            <g key={idx} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(pt.point)}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredPoint?.id === pt.point.id ? '5' : '3.5'}
                fill="#ffffff"
                stroke={config.stroke}
                strokeWidth="2.5"
              />
              {/* Point Value Label */}
              <text
                x={pt.x}
                y={pt.y - 8}
                textAnchor="middle"
                className="text-[9px] font-mono font-bold fill-slate-700"
              >
                {pt.val}
              </text>
              {/* Date on X Axis */}
              <text
                x={pt.x}
                y={svgHeight - 8}
                textAnchor="middle"
                className="text-[9px] font-mono fill-slate-400"
              >
                {pt.point.displayDate}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Hovered point details */}
      {hoveredPoint && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-fade-in">
          <div>
            <span className="font-bold text-slate-800">
              {hoveredPoint.displayDate} ({hoveredPoint.attemptNumber}차 답변)
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-sm">
              "{hoveredPoint.questionTitle}"
            </p>
          </div>
          <div className="flex items-center gap-3 font-mono font-bold text-slate-900 shrink-0">
            <span>
              {getVal(hoveredPoint)} {config.unit}
            </span>
          </div>
        </div>
      )}

      {/* Keyboard-accessible textual fallback list */}
      <div className="pt-2 border-t border-slate-100">
        <details className="text-xs text-slate-600">
          <summary className="cursor-pointer font-semibold text-slate-500 hover:text-slate-800">
            시각 보조용 데이터 목록 보기 (Accessible Data List)
          </summary>
          <ul className="mt-2 space-y-1 pl-4 list-disc text-[11px] text-slate-500">
            {trendPoints.map((p, idx) => (
              <li key={idx}>
                {p.date}: {getVal(p)} {config.unit} (질문: {p.questionTitle})
              </li>
            ))}
          </ul>
        </details>
      </div>

      <p className="text-[11px] text-slate-400">
        * 본 추세 그래프는 발화 템포와 습관을 점검하기 위한 참고용 지표이며 공식 실력 향상 등급을 의미하지 않습니다.
      </p>
    </div>
  );
};
