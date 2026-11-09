import React, { useState } from 'react';
import { RetryChecklistItem } from '../../types/coaching';
import { CheckSquare, Square, ListChecks } from 'lucide-react';

interface RetryChecklistProps {
  items: RetryChecklistItem[];
  onToggleItem?: (id: string, checked: boolean) => void;
}

export const RetryChecklist: React.FC<RetryChecklistProps> = ({ items }) => {
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setCheckedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-3.5">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
          <ListChecks className="w-4 h-4" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Retry Checklist (재연습 체크리스트)
          </h3>
          <p className="text-xs text-slate-500">다음 답변에서 실천할 3~5가지 핵심 행동 지침입니다.</p>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const isChecked = Boolean(checkedMap[item.id]);
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border text-xs sm:text-sm transition-all focus-visible:outline-2 focus-visible:outline-blue-600 ${
                isChecked
                  ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900'
                  : 'bg-slate-50/70 border-slate-200/80 text-slate-800 hover:bg-slate-100/70'
              }`}
            >
              <div className="mt-0.5 shrink-0 text-slate-500">
                {isChecked ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <span className={`leading-relaxed ${isChecked ? 'line-through opacity-80' : 'font-medium'}`}>
                {item.instruction}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
