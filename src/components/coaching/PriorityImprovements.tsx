import React from 'react';
import { ImprovementFeedback } from '../../types/coaching';
import { Target, ArrowRight, Quote } from 'lucide-react';

interface PriorityImprovementsProps {
  improvements: ImprovementFeedback[];
}

export const PriorityImprovements: React.FC<PriorityImprovementsProps> = ({
  improvements,
}) => {
  if (!improvements || improvements.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
      <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
          <Target className="w-4 h-4" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Priority Improvements (우선 개선사항)
          </h3>
          <p className="text-xs text-slate-500">다음 답변에서 즉시 적용할 핵심 개선 과제입니다.</p>
        </div>
      </div>

      <div className="space-y-4">
        {improvements.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">
                  우선순위 #{item.priority}
                </span>
                <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {item.explanation}
            </p>

            {item.evidence && (
              <div className="flex items-start gap-1.5 text-xs text-slate-500 italic bg-white p-2 rounded-lg border border-slate-200/60">
                <Quote className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span>"{item.evidence}"</span>
              </div>
            )}

            <div className="flex items-start gap-2 pt-2 border-t border-slate-200/60 text-xs font-semibold text-blue-900 bg-blue-50/50 p-2.5 rounded-lg">
              <ArrowRight className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <span className="font-bold text-blue-800 mr-1.5">실행 가이드:</span>
                <span>{item.action}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
