import React from 'react';
import { AIRetryComparison } from '../../types/comparison';
import { Sparkles, RefreshCw, CheckCircle2, Bookmark, ArrowRight, ShieldAlert } from 'lucide-react';
import { FeedbackLanguage } from '../../types/coaching';

interface AIComparisonPanelProps {
  aiComparison: AIRetryComparison | null;
  isLoading: boolean;
  error: string | null;
  feedbackLanguage: FeedbackLanguage;
  onRequestComparison: () => void;
  onClearError: () => void;
}

export const AIComparisonPanel: React.FC<AIComparisonPanelProps> = ({
  aiComparison,
  isLoading,
  error,
  feedbackLanguage,
  onRequestComparison,
  onClearError,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              AI 심층 비교 분석 (선택 기능)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            두 Transcript 사이의 문맥적 흐름과 논리적 발전 양상을 AI 모델로 정밀 비교합니다.
          </p>
        </div>

        {!aiComparison && !isLoading && (
          <button
            type="button"
            onClick={onRequestComparison}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-auto min-h-[44px]"
          >
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            <span>AI로 변화 자세히 분석하기</span>
          </button>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div
          role="status"
          aria-live="polite"
          className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-3"
        >
          <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto animate-spin">
            <RefreshCw className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">
            AI가 두 답변의 변화를 심층 비교하고 있습니다...
          </h4>
          <p className="text-xs text-slate-500">
            문맥 전개, 문장 구성 및 핵심 개선사항 적용 여부를 검토 중입니다. (약 5~15초 소요)
          </p>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span>{error}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRequestComparison}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-xs"
            >
              다시 시도
            </button>
            <button
              type="button"
              onClick={onClearError}
              className="px-3 py-1.5 text-slate-600 hover:text-slate-900 font-semibold"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {aiComparison && (
        <div className="space-y-6 animate-fade-in">
          {/* Applied Improvements */}
          {aiComparison.appliedImprovements.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                확인된 개선 내용 (Applied Improvements)
              </span>
              <div className="grid grid-cols-1 gap-2.5">
                {aiComparison.appliedImprovements.map((imp, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-200 text-xs space-y-1.5"
                  >
                    <div className="flex items-center gap-2 font-bold text-purple-950">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                      <span>{imp.title}</span>
                    </div>
                    {imp.evidence && (
                      <div className="p-2 bg-white border border-purple-100 rounded-lg font-mono text-[11px] text-purple-900">
                        "{imp.evidence}"
                      </div>
                    )}
                    <p className="text-slate-600">{imp.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Maintained Strengths */}
          {aiComparison.maintainedStrengths.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                지속된 강점 (Maintained Strengths)
              </span>
              <div className="grid grid-cols-1 gap-2">
                {aiComparison.maintainedStrengths.map((str, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                  >
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <Bookmark className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{str.title}</span>
                    </div>
                    {str.evidence && (
                      <p className="text-slate-500 font-mono text-[11px]">"{str.evidence}"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Remaining Priorities & Next Action */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
            <div className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-slate-900 block">다음 답변 핵심 권장사항:</strong>
                <p className="text-slate-700 mt-0.5 leading-relaxed font-medium">
                  {aiComparison.nextAction}
                </p>
              </div>
            </div>
          </div>

          {/* Limitations notice */}
          <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500">
            <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              {aiComparison.limitations.map((lim, idx) => (
                <p key={idx}>{lim}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
