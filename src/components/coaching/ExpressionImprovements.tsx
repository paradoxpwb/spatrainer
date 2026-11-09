import React from 'react';
import { ExpressionImprovement } from '../../types/coaching';
import { ArrowRight, Sparkles } from 'lucide-react';

interface ExpressionImprovementsProps {
  improvements: ExpressionImprovement[];
}

export const ExpressionImprovements: React.FC<ExpressionImprovementsProps> = ({
  improvements,
}) => {
  if (!improvements || improvements.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-3.5">
      <div className="pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">
          Vocabulary & Expressions (어휘 및 표현 개선)
        </h3>
        <p className="text-xs text-slate-500">
          문법적으로 틀리지 않더라도 더 자연스럽고 세련된 영어 표현을 제안합니다.
        </p>
      </div>

      <div className="space-y-3">
        {improvements.map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1">
                <span className="font-mono text-slate-500 text-xs line-through">
                  "{item.original}"
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-600 shrink-0" aria-hidden="true" />
                <span className="font-mono text-blue-900 font-bold text-xs bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  "{item.improved}"
                </span>
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed pt-0.5">{item.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
