import React, { useState } from 'react';
import { DesiredAnswerLevel } from '../../types/coaching';
import { BookOpen, Copy, Check } from 'lucide-react';
import { tokenizeWords } from '../../utils/transcriptUtils';

interface ImprovedAnswerProps {
  improvedAnswer: string;
  desiredAnswerLevel: DesiredAnswerLevel;
}

const LEVEL_LABELS: Record<DesiredAnswerLevel, string> = {
  current: '현재 수준 유지 (Current Level)',
  'one-step-better': '한 단계 성장 (One Step Better)',
  challenging: '도전적 수준 (Challenging)',
};

export const ImprovedAnswer: React.FC<ImprovedAnswerProps> = ({
  improvedAnswer,
  desiredAnswerLevel,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const wordCount = tokenizeWords(improvedAnswer).length;

  const handleCopy = () => {
    navigator.clipboard.writeText(improvedAnswer).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Improved Answer (개선 답변 모범안)
            </h3>
            <span className="text-[11px] font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
              {LEVEL_LABELS[desiredAnswerLevel]}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            사용자가 말한 원래 내용과 경험을 유지하며 문맥과 어휘를 보완한 완성형 답변입니다.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 font-mono self-end sm:self-auto">
          <span>{wordCount} 단어</span>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans text-xs transition-colors"
            title="개선 답변 복사"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">복사됨</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>복사</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 rounded-xl bg-slate-50/70 border border-slate-200/80">
        <p className="text-sm sm:text-base text-slate-900 leading-relaxed font-normal">
          {improvedAnswer}
        </p>
      </div>

      <p className="text-[11px] text-slate-400">
        ※ 답변 시간 제한 내에 자연스럽게 소리 내어 말할 수 있는 적정 길이로 구성되었습니다.
      </p>
    </div>
  );
};
