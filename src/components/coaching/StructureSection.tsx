import React from 'react';
import { AICoachingResult } from '../../types/coaching';
import { PracticeRatingBadge } from './PracticeRatingBadge';
import { Check, X } from 'lucide-react';

interface StructureSectionProps {
  structure: AICoachingResult['structure'];
}

export const StructureSection: React.FC<StructureSectionProps> = ({ structure }) => {
  const parts = [
    { label: '도입 (Opening)', active: structure.hasOpening },
    { label: '세부 근거 (Details)', active: structure.hasSupportingDetails },
    { label: '구체적 예시 (Example)', active: structure.hasExample },
    { label: '마무리/결론 (Conclusion)', active: structure.hasConclusion },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Answer Structure (답변 논리 구성)
          </h3>
          <p className="text-xs text-slate-500">도입-근거-예시-결론의 유기적 흐름을 평가합니다.</p>
        </div>
        <PracticeRatingBadge rating={structure.rating} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {parts.map((p, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-semibold ${
              p.active
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
          >
            {p.active ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
            ) : (
              <X className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
            )}
            <span className="truncate">{p.label}</span>
          </div>
        ))}
      </div>

      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
        {structure.explanation}
      </p>
    </div>
  );
};
