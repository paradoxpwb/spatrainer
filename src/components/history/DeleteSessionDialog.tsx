import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteSessionDialogProps {
  isOpen: boolean;
  questionTitle: string;
  attemptCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteSessionDialog: React.FC<DeleteSessionDialogProps> = ({
  isOpen,
  questionTitle,
  attemptCount,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-xl border border-slate-200 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" aria-hidden="true" />
        </div>

        <div>
          <h3 id="delete-dialog-title" className="text-base font-bold text-slate-900">
            연습 세션 삭제 확인
          </h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            이 연습 세션과 연결된 <strong>모든 답변 기록({attemptCount}개 시도)</strong>을 삭제하시겠습니까? 삭제한 기록은 복구할 수 없습니다.
          </p>
          <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 italic truncate">
            "{questionTitle}"
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
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors min-h-[44px]"
          >
            <Trash2 className="w-4 h-4" />
            <span>기록 영구 삭제</span>
          </button>
        </div>
      </div>
    </div>
  );
};
