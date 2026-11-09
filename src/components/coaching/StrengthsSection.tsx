import React from 'react';
import { StrengthFeedback } from '../../types/coaching';
import { ThumbsUp, Quote } from 'lucide-react';

interface StrengthsSectionProps {
  strengths: StrengthFeedback[];
}

export const StrengthsSection: React.FC<StrengthsSectionProps> = ({ strengths }) => {
  if (!strengths || strengths.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
      <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
          <ThumbsUp className="w-4 h-4" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">What You Did Well (잘한 점)</h3>
          <p className="text-xs text-slate-500">답변에서 효과적으로 발휘된 강점입니다.</p>
        </div>
      </div>

      <div className="space-y-3.5">
        {strengths.map((item, idx) => (
          <div key={idx} className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-mono">
                {idx + 1}
              </span>
              <span>{item.title}</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mt-1.5 ml-7">
              {item.explanation}
            </p>
            {item.evidence && (
              <div className="mt-2 ml-7 flex items-start gap-1.5 text-xs text-slate-500 italic bg-white p-2 rounded-lg border border-slate-200/60">
                <Quote className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
                <span>"{item.evidence}"</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
