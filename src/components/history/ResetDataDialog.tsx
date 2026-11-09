import React, { useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ResetDataDialogProps {
  isOpen: boolean;
  onConfirmReset: () => void;
  onCancel: () => void;
}

export const ResetDataDialog: React.FC<ResetDataDialogProps> = ({
  isOpen,
  onConfirmReset,
  onCancel,
}) => {
  const [confirmInput, setConfirmInput] = useState<string>('');

  if (!isOpen) return null;

  const isConfirmed = confirmInput.trim() === '초기화';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-xl border border-slate-200 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" aria-hidden="true" />
        </div>

        <div>
          <h3 id="reset-dialog-title" className="text-base font-bold text-slate-900">
            전체 연습 데이터 초기화
          </h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            모든 연습 세션, 녹음 결과, 지표 기록 및 AI 코칭 캐시가 완전히 삭제됩니다. 타이머 설정과 피드백 언어 설정은 유지됩니다.
          </p>

          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label htmlFor="confirm-reset-input" className="block text-xs font-bold text-slate-800">
              초기화를 진행하려면 아래에 "<span className="text-rose-600">초기화</span>"를 직접 입력하세요:
            </label>
            <input
              id="confirm-reset-input"
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="초기화"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus-visible:outline-rose-600 min-h-[40px]"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 min-h-[44px]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => {
              if (isConfirmed) onConfirmReset();
            }}
            disabled={!isConfirmed}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-xl shadow-xs transition-colors min-h-[44px]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>데이터 초기화 확인</span>
          </button>
        </div>
      </div>
    </div>
  );
};
