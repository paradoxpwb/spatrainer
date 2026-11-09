import React from 'react';
import { StreakData } from '../../types/progress';
import { Flame, Calendar, Award, CheckCircle2 } from 'lucide-react';

interface ActivitySummaryProps {
  streak: StreakData;
}

export const ActivitySummary: React.FC<ActivitySummaryProps> = ({ streak }) => {
  // Generate last 28 days array for compact activity grid
  const days: Array<{ dateStr: string; label: string; count: number }> = [];
  const now = new Date();

  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const count = streak.dailyAttemptCounts[dateStr] || 0;
    days.push({
      dateStr,
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      count,
    });
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <Calendar className="w-5 h-5 text-blue-600" aria-hidden="true" />
        <div>
          <h3 className="text-base font-bold text-slate-900">
            연습 연속일 및 활동 캘린더 (Consistency)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            사용자의 기기 로컬 날짜 기준 매일 한 번 이상 답변 녹음을 완료한 일수입니다.
          </p>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Current Streak */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Flame className="w-4 h-4 text-orange-500" aria-hidden="true" />
            <span className="text-xs font-semibold">현재 연속일 (Streak)</span>
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900">
            {streak.currentStreak}
            <span className="text-xs font-sans font-normal text-slate-500 ml-1">일 연속</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">오늘 또는 어제 완료 기준</p>
        </div>

        {/* Longest Streak */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Award className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <span className="text-xs font-semibold">최장 연속일</span>
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900">
            {streak.longestStreak}
            <span className="text-xs font-sans font-normal text-slate-500 ml-1">일 달성</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">역대 최고 연속 연습 기록</p>
        </div>

        {/* Active Days in 30 Days */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <span className="text-xs font-semibold">최근 30일 중 연습일</span>
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900">
            {streak.activityDaysLast30}
            <span className="text-xs font-sans font-normal text-slate-500 ml-1">일 활동</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">꾸준한 발화 습관 유지율</p>
        </div>
      </div>

      {/* 28-Day Activity Heatmap Grid */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
          <span>최근 4주간 일별 발화 활동:</span>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>적음</span>
            <span className="w-2.5 h-2.5 rounded-xs bg-slate-100" />
            <span className="w-2.5 h-2.5 rounded-xs bg-blue-200" />
            <span className="w-2.5 h-2.5 rounded-xs bg-blue-500" />
            <span className="w-2.5 h-2.5 rounded-xs bg-blue-700" />
            <span>많음</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {days.map((d) => {
            let color = 'bg-slate-100 border-slate-200';
            if (d.count >= 4) color = 'bg-blue-700 border-blue-800 text-white';
            else if (d.count >= 2) color = 'bg-blue-500 border-blue-600 text-white';
            else if (d.count === 1) color = 'bg-blue-200 border-blue-300 text-blue-900';

            return (
              <div
                key={d.dateStr}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center ${color}`}
                title={`${d.dateStr}: ${d.count}회 답변 완료`}
              >
                <span className="text-[10px] font-mono opacity-80">{d.label}</span>
                <span className="text-xs font-bold font-mono mt-0.5">{d.count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
