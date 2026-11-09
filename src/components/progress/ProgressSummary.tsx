import React from 'react';
import { PeriodFilter, ProgressSummary as SummaryType } from '../../types/progress';
import { Clock, Mic, Flame, RotateCcw, Activity, Calendar, FileText } from 'lucide-react';
import { formatTime } from '../../utils/timeUtils';

interface ProgressSummaryProps {
  summary: SummaryType;
  periodFilter: PeriodFilter;
  onSelectPeriod: (p: PeriodFilter) => void;
}

export const ProgressSummary: React.FC<ProgressSummaryProps> = ({
  summary,
  periodFilter,
  onSelectPeriod,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Header & Period Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            연습 현황 요약 (Speaking Overview)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            브라우저에 저장된 객관적 발화 기록을 기반으로 집계된 학습 통계입니다.
          </p>
        </div>

        {/* Period Filter Buttons */}
        <div
          role="radiogroup"
          aria-label="연습 통계 기간 필터"
          className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-semibold self-start sm:self-auto"
        >
          <button
            type="button"
            role="radio"
            aria-checked={periodFilter === '7d'}
            onClick={() => onSelectPeriod('7d')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              periodFilter === '7d'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            최근 7일
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={periodFilter === '30d'}
            onClick={() => onSelectPeriod('30d')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              periodFilter === '30d'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            최근 30일
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={periodFilter === 'all'}
            onClick={() => onSelectPeriod('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              periodFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            전체 기록
          </button>
        </div>
      </div>

      {/* Empty State */}
      {summary.totalAttempts === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-3">
          <p className="text-sm font-semibold text-slate-600">
            선택한 기간에 연습 기록이 없습니다.
          </p>
          <p className="text-xs text-slate-400">
            질문 연습을 완료하면 이곳에 발화 시간, WPM, Filler 비율 등의 종합 지표가 집계됩니다.
          </p>
        </div>
      ) : (
        /* 8 Key Objective Metric Cards */
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Total Attempts */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs">
            <div className="flex items-center gap-2 text-slate-500 mb-1.5">
              <Mic className="w-4 h-4 text-blue-600" aria-hidden="true" />
              <span className="text-xs font-semibold">총 답변 횟수</span>
            </div>
            <div className="text-2xl font-mono font-bold text-slate-900">
              {summary.totalAttempts}
              <span className="text-xs font-sans font-normal text-slate-500 ml-1">회</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">완료된 모든 녹음 건수</p>
          </div>

          {/* 2. Completed Sessions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs">
            <div className="flex items-center gap-2 text-slate-500 mb-1.5">
              <FileText className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              <span className="text-xs font-semibold">완료한 세션</span>
            </div>
            <div className="text-2xl font-mono font-bold text-slate-900">
              {summary.completedSessions}
              <span className="text-xs font-sans font-normal text-slate-500 ml-1">개</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">도전한 고유 문제 수</p>
          </div>

          {/* 3. Retry Count */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs">
            <div className="flex items-center gap-2 text-slate-500 mb-1.5">
              <RotateCcw className="w-4 h-4 text-indigo-600" aria-hidden="true" />
              <span className="text-xs font-semibold">재도전(Retry) 횟수</span>
            </div>
            <div className="text-2xl font-mono font-bold text-slate-900">
              {summary.retryCount}
              <span className="text-xs font-sans font-normal text-slate-500 ml-1">회</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">동일 질문 2차 이상 발화</p>
          </div>

          {/* 4. Practice Days */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs">
            <div className="flex items-center gap-2 text-slate-500 mb-1.5">
              <Calendar className="w-4 h-4 text-amber-600" aria-hidden="true" />
              <span className="text-xs font-semibold">연습한 날짜</span>
            </div>
            <div className="text-2xl font-mono font-bold text-slate-900">
              {summary.practiceDaysCount}
              <span className="text-xs font-sans font-normal text-slate-500 ml-1">일</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">해당 기간 중 학습 일수</p>
          </div>

          {/* 5. Total Recording Time */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs">
            <div className="flex items-center gap-2 text-slate-500 mb-1.5">
              <Clock className="w-4 h-4 text-blue-600" aria-hidden="true" />
              <span className="text-xs font-semibold">총 발화 시간</span>
            </div>
            <div className="text-2xl font-mono font-bold text-slate-900">
              {formatTime(summary.totalRecordingSeconds)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              누적 {summary.totalRecordingSeconds}초 발화
            </p>
          </div>

          {/* 6. Average Duration */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs">
            <div className="flex items-center gap-2 text-slate-500 mb-1.5">
              <Activity className="w-4 h-4 text-purple-600" aria-hidden="true" />
              <span className="text-xs font-semibold">평균 답변 시간</span>
            </div>
            {summary.averageRecordingSeconds !== null ? (
              <div className="text-2xl font-mono font-bold text-slate-900">
                {summary.averageRecordingSeconds}
                <span className="text-xs font-sans font-normal text-slate-500 ml-1">초</span>
              </div>
            ) : (
              <div className="text-base font-bold text-slate-400 py-1">
                데이터 없음
              </div>
            )}
            <p className="text-[11px] text-slate-400 mt-1">답변당 평균 유지 시간</p>
          </div>

          {/* 7. Average WPM */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs">
            <div className="flex items-center gap-2 text-slate-500 mb-1.5">
              <Flame className="w-4 h-4 text-rose-600" aria-hidden="true" />
              <span className="text-xs font-semibold">평균 발화 속도</span>
            </div>
            {summary.averageWordsPerMinute !== null ? (
              <div className="text-2xl font-mono font-bold text-slate-900">
                {summary.averageWordsPerMinute}
                <span className="text-xs font-sans font-normal text-slate-500 ml-1">WPM</span>
              </div>
            ) : (
              <div className="text-base font-bold text-slate-400 py-1">
                데이터 없음
              </div>
            )}
            <p className="text-[11px] text-slate-400 mt-1">
              참고 범위: 110~149 WPM ({summary.validWpmSampleCount}개 분석)
            </p>
          </div>

          {/* 8. Average Filler Rate */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs">
            <div className="flex items-center gap-2 text-slate-500 mb-1.5">
              <Activity className="w-4 h-4 text-amber-600" aria-hidden="true" />
              <span className="text-xs font-semibold">평균 Filler 비율</span>
            </div>
            {summary.averageFillerRate !== null ? (
              <div className="text-2xl font-mono font-bold text-slate-900">
                {summary.averageFillerRate}
                <span className="text-xs font-sans font-normal text-slate-500 ml-1">개</span>
              </div>
            ) : (
              <div className="text-base font-bold text-slate-400 py-1">
                데이터 없음
              </div>
            )}
            <p className="text-[11px] text-slate-400 mt-1">100단어당 filler 발생 비율</p>
          </div>
        </div>
      )}
    </div>
  );
};
