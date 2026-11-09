import React from 'react';
import { AICoachingResult } from '../../types/coaching';
import { PracticeRatingBadge } from './PracticeRatingBadge';
import { Check, X, AlertCircle } from 'lucide-react';

interface RelevanceSectionProps {
  relevance: AICoachingResult['relevance'];
}

export const RelevanceSection: React.FC<RelevanceSectionProps> = ({ relevance }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Answer Relevance (질문 답변 적합성)
          </h3>
          <p className="text-xs text-slate-500">질문이 요구한 핵심에 정확하게 답했는지 분석합니다.</p>
        </div>
        <PracticeRatingBadge rating={relevance.rating} />
      </div>

      <div className="flex items-center gap-2 text-xs">
        {relevance.answeredMainQuestion ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
            <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
            <span>핵심 질문에 직접 답변함</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 font-semibold border border-amber-200">
            <X className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
            <span>핵심 질문에 대한 직접적 답변 보완 필요</span>
          </span>
        )}
      </div>

      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
        {relevance.explanation}
      </p>

      {relevance.missingElements && relevance.missingElements.length > 0 && (
        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-900">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />
            <span>추가하면 좋은 보충 내용</span>
          </div>
          <ul className="list-disc list-inside text-amber-800 pl-1 space-y-0.5">
            {relevance.missingElements.map((el, i) => (
              <li key={i}>{el}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
