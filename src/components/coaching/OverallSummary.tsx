import React from 'react';
import { Sparkles } from 'lucide-react';

interface OverallSummaryProps {
  summary: string;
}

export const OverallSummary: React.FC<OverallSummaryProps> = ({ summary }) => {
  return (
    <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/50 border border-blue-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-blue-700" aria-hidden="true" />
        <h3 className="text-sm font-bold text-blue-950 uppercase tracking-wide">
          Overall Coaching Summary
        </h3>
      </div>
      <p className="text-sm sm:text-base font-medium text-slate-800 leading-relaxed">
        {summary}
      </p>
      <p className="text-[11px] text-slate-500 mt-2">
        ※ 본 피드백은 Transcript를 바탕으로 한 자가 학습 코칭이며 공식 시험 점수나 등급이 아닙니다.
      </p>
    </div>
  );
};
