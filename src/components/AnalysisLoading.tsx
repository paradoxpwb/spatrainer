import React from 'react';
import { Loader2, X } from 'lucide-react';

interface AnalysisLoadingProps {
  onCancel?: () => void;
}

export const AnalysisLoading: React.FC<AnalysisLoadingProps> = ({ onCancel }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-xs"
    >
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 mb-3">
        <Loader2 className="w-6 h-6 animate-spin" aria-hidden="true" />
      </div>

      <h3 className="text-base font-bold text-slate-900 mb-1">
        답변을 텍스트로 변환하고 있습니다.
      </h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5 leading-relaxed">
        음성을 분석 중입니다. 잠시만 기다려 주세요. (발화 길이에 따라 3~10초 소요)
      </p>

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-slate-500"
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" />
          <span>분석 취소</span>
        </button>
      )}
    </div>
  );
};
