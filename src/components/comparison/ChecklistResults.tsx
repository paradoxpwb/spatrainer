import React from 'react';
import { ChecklistResult } from '../../types/comparison';
import { CheckCircle2, HelpCircle, CheckSquare } from 'lucide-react';

interface ChecklistResultsProps {
  results: ChecklistResult[];
}

export const ChecklistResults: React.FC<ChecklistResultsProps> = ({ results }) => {
  if (!results || results.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <CheckSquare className="w-5 h-5 text-blue-600" aria-hidden="true" />
        <div>
          <h3 className="text-base font-bold text-slate-900">
            AI 코칭 체크리스트 적용 점검
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            이전 AI 코칭에서 권장한 개선 항목이 재도전 답변에 반영되었는지 점검한 결과입니다.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {results.map((item, idx) => {
          const isApplied = item.status === 'likely-applied';
          const isNotConfirmed = item.status === 'not-confirmed';

          const badgeClass = isApplied
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : isNotConfirmed
            ? 'bg-amber-50 text-amber-800 border-amber-200'
            : 'bg-slate-100 text-slate-700 border-slate-200';

          const statusText = isApplied
            ? '적용 확인'
            : isNotConfirmed
            ? '자가 확인 권장'
            : '해당 없음';

          return (
            <div
              key={item.id || idx}
              className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 text-xs space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-bold text-slate-900">
                  #{idx + 1}. {item.instruction}
                </span>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border font-bold text-[11px] self-start sm:self-auto shrink-0 ${badgeClass}`}
                >
                  {isApplied && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                  )}
                  {isNotConfirmed && (
                    <HelpCircle className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                  )}
                  <span>{statusText}</span>
                </span>
              </div>

              {item.evidence && (
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-[11px] text-blue-800">
                  <span className="font-sans font-bold text-slate-500 mr-1.5">[근거]:</span>
                  {item.evidence}
                </div>
              )}

              <p className="text-slate-600 leading-relaxed">{item.explanation}</p>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-slate-400 pt-1">
        * 로컬 규칙으로 문맥을 완전히 판별하기 어려운 고차원적 논리 구조는 '자가 확인 권장'으로 표시됩니다.
      </p>
    </div>
  );
};
