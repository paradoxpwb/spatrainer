import React from 'react';
import { TranscriptComparison as TranscriptCompType } from '../../types/comparison';
import { PlusCircle, MinusCircle, Check, FileText } from 'lucide-react';

interface TranscriptComparisonProps {
  transcriptChanges: TranscriptCompType;
  baseAttemptNumber?: number;
  comparedAttemptNumber?: number;
}

export const TranscriptComparison: React.FC<TranscriptComparisonProps> = ({
  transcriptChanges,
  baseAttemptNumber = 1,
  comparedAttemptNumber = 2,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" aria-hidden="true" />
            <h3 className="text-base font-bold text-slate-900">
              답변 내용 비교 (Transcript Changes)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            #{baseAttemptNumber}차 답변과 #{comparedAttemptNumber}차 재도전 답변 사이의 문장 및 핵심 어휘 변화입니다.
          </p>
        </div>

        {/* Similarity Score Indicator */}
        <div className="flex items-center gap-2 self-start sm:self-auto px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          <span className="text-slate-500 font-semibold">어휘 유사도:</span>
          <span className="font-mono font-bold text-slate-900">
            {transcriptChanges.similarityPercentage}%
          </span>
        </div>
      </div>

      {/* Added Sentences */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
            <PlusCircle className="w-3 h-3 text-emerald-600" aria-hidden="true" />
            <span>Added (추가된 문장)</span>
          </span>
          <span className="text-xs text-slate-400">
            ({transcriptChanges.addedSentences.length}개)
          </span>
        </div>

        {transcriptChanges.addedSentences.length > 0 ? (
          <div className="space-y-2">
            {transcriptChanges.addedSentences.map((sent, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs text-emerald-950 font-sans leading-relaxed"
              >
                <span className="font-bold text-emerald-700 mr-1.5">[+]</span>
                <span>"{sent}"</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic py-1">새롭게 추가된 문장이 없습니다.</p>
        )}
      </div>

      {/* Removed Sentences */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-800 text-[11px] font-bold border border-rose-200">
            <MinusCircle className="w-3 h-3 text-rose-600" aria-hidden="true" />
            <span>Removed (제외되거나 바뀐 문장)</span>
          </span>
          <span className="text-xs text-slate-400">
            ({transcriptChanges.removedSentences.length}개)
          </span>
        </div>

        {transcriptChanges.removedSentences.length > 0 ? (
          <div className="space-y-2">
            {transcriptChanges.removedSentences.map((sent, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-rose-50/50 border border-rose-200 text-xs text-rose-950 font-sans leading-relaxed line-through opacity-80"
              >
                <span className="font-bold text-rose-700 mr-1.5">[-]</span>
                <span>"{sent}"</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic py-1">이전 답변에서 누락된 문장이 없습니다.</p>
        )}
      </div>

      {/* Retained Sentences */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200">
            <Check className="w-3 h-3 text-slate-500" aria-hidden="true" />
            <span>Retained (유지된 공통 문장)</span>
          </span>
          <span className="text-xs text-slate-400">
            ({transcriptChanges.retainedSentences.length}개)
          </span>
        </div>

        {transcriptChanges.retainedSentences.length > 0 ? (
          <div className="space-y-1.5">
            {transcriptChanges.retainedSentences.map((sent, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-sans leading-relaxed"
              >
                <span className="text-slate-400 mr-1.5 font-bold">[=]</span>
                <span>"{sent}"</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic py-1">완전히 일치하는 문장이 없습니다.</p>
        )}
      </div>

      {/* Key terms added */}
      {transcriptChanges.addedKeyTerms.length > 0 && (
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <span className="text-xs font-bold text-slate-700 block">
            새로 활용된 실질 어휘 (Newly Added Key Terms)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {transcriptChanges.addedKeyTerms.map((term, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs font-mono font-semibold text-blue-800"
              >
                +{term}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notice */}
      <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
        * 본 텍스트 차이는 음성 인식 전사 결과 또는 사용자 직접 수정에 의해 발생했을 수 있습니다.
      </p>
    </div>
  );
};
