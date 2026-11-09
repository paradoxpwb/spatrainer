import React from 'react';
import { AnswerOutlineItem } from '../../types/coaching';
import { Layers } from 'lucide-react';

interface AnswerOutlineProps {
  outline: AnswerOutlineItem[];
}

export const AnswerOutline: React.FC<AnswerOutlineProps> = ({ outline }) => {
  if (!outline || outline.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-3.5">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
          <Layers className="w-4 h-4" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Answer Outline (추천 답변 구조)</h3>
          <p className="text-xs text-slate-500">모범답안을 외우기보다 구조의 흐름과 첫 문장 스타터를 연습하세요.</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {outline.map((item) => (
          <div
            key={item.order}
            className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 text-xs"
          >
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-900 font-bold flex items-center justify-center font-mono shrink-0 text-[11px]">
              {item.order}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span>{item.label}</span>
              </div>
              <p className="text-slate-600 leading-relaxed">{item.guidance}</p>
              {item.exampleStarter && (
                <div className="mt-1 pt-1 text-[11px] text-indigo-800 font-mono bg-white px-2.5 py-1 rounded border border-indigo-100">
                  <span className="font-semibold text-indigo-600 mr-1">Starter:</span>
                  <span>"{item.exampleStarter}"</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
