import React from 'react';
import { ComparisonSummary as CompSummaryType } from '../../types/comparison';
import { Sparkles, Check, ArrowRight, RefreshCw, Bookmark } from 'lucide-react';

interface ComparisonSummaryProps {
  summary: CompSummaryType;
}

export const ComparisonSummary: React.FC<ComparisonSummaryProps> = ({ summary }) => {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
      <div className="flex items-center gap-2.5 border-b border-slate-700/80 pb-4">
        <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
          <Sparkles className="w-4 h-4" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            재도전 변화 요약 (Comparison Summary)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            이전 답변과 비교하여 실제로 달라진 점과 다음 연습 제안입니다.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Improved Areas */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Check className="w-4 h-4" aria-hidden="true" />
            <span>개선된 점 (Improved Areas)</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {summary.improvedAreas.map((area, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-emerald-400 font-bold">·</span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Maintained Strengths */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
            <Bookmark className="w-4 h-4" aria-hidden="true" />
            <span>유지된 강점 (Maintained Strengths)</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {summary.maintainedStrengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-blue-400 font-bold">·</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Areas to Continue & Recommended Next Action */}
      <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-5 space-y-4">
        <div>
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block mb-2">
            지속해서 연습할 항목 (Areas to Continue)
          </span>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {summary.areasToContinue.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-amber-400 font-bold">·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-3 border-t border-slate-700/80 flex items-start gap-2.5">
          <ArrowRight className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-xs">
            <strong className="text-blue-300 font-bold block mb-0.5">다음 답변 추천 행동:</strong>
            <span className="text-slate-200 leading-relaxed font-medium">
              {summary.recommendedNextAction}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
