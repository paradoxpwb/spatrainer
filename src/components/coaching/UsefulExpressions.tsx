import React from 'react';
import { Bookmark } from 'lucide-react';

interface UsefulExpressionsProps {
  expressions: string[];
}

export const UsefulExpressions: React.FC<UsefulExpressionsProps> = ({ expressions }) => {
  if (!expressions || expressions.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
          <Bookmark className="w-4 h-4" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Useful Expressions (유용한 표현 추천)
          </h3>
          <p className="text-xs text-slate-500">현재 질문 유형에 즉시 활용할 수 있는 핵심 구문입니다.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {expressions.map((expr, idx) => (
          <span
            key={idx}
            className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-mono font-medium text-slate-800"
          >
            "{expr}"
          </span>
        ))}
      </div>
    </div>
  );
};
