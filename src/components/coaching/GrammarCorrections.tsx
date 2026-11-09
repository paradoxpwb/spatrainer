import React from 'react';
import { GrammarCorrection } from '../../types/coaching';
import { Check, X, ShieldCheck } from 'lucide-react';

interface GrammarCorrectionsProps {
  corrections: GrammarCorrection[];
}

const CATEGORY_LABELS: Record<string, string> = {
  tense: '시제 (Tense)',
  article: '관사 (Article)',
  preposition: '전치사 (Preposition)',
  agreement: '수/일치 (Agreement)',
  'word-order': '어순 (Word Order)',
  'word-form': '품사/어형 (Word Form)',
  plural: '단/복수 (Plural)',
  'sentence-fragment': '문장 불완전 (Fragment)',
  other: '문법 (Grammar)',
};

export const GrammarCorrections: React.FC<GrammarCorrectionsProps> = ({ corrections }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-3.5">
      <div className="pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">
          Grammar Corrections (명확한 문법 교정)
        </h3>
        <p className="text-xs text-slate-500">
          음성 인식 오차를 배제한 명확한 문법 오류 교정 내용입니다.
        </p>
      </div>

      {corrections && corrections.length > 0 ? (
        <div className="space-y-3.5">
          {corrections.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-slate-500 font-mono">#0{idx + 1}</span>
                <span className="px-2 py-0.5 rounded bg-slate-200/80 text-slate-700 text-[10px] font-semibold">
                  {CATEGORY_LABELS[item.category] || item.category}
                </span>
              </div>

              {/* Side-by-side or stacked original vs corrected */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200 text-rose-900">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-rose-700 mb-0.5">
                    <X className="w-3 h-3" />
                    <span>원문 (Original)</span>
                  </div>
                  <span className="font-mono text-xs font-medium">"{item.original}"</span>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-900">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 mb-0.5">
                    <Check className="w-3 h-3" />
                    <span>교정 (Corrected)</span>
                  </div>
                  <span className="font-mono text-xs font-semibold">"{item.corrected}"</span>
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed pt-1">{item.explanation}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
          <span>Transcript에서 명확한 문법 오류가 발견되지 않았습니다.</span>
        </div>
      )}

      <p className="text-[11px] text-slate-400">
        ※ 자연스러운 표현이나 어휘 개선 제안은 아래 어휘 및 표현 섹션을 참고하세요.
      </p>
    </div>
  );
};
