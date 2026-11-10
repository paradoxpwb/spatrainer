import React from 'react';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  backLabel?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = '마이크 및 녹음 오류 안내',
  message,
  onRetry,
  onGoBack,
  backLabel = '설정으로 돌아가기',
}) => {
  return (
    <div
      role="alert"
      className="w-full bg-red-50 border border-red-200 rounded-2xl p-6 sm:p-7 text-slate-800 shadow-sm"
    >
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600">
          <AlertCircle className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-red-950">
            {title}
          </h3>
          <p className="mt-1.5 text-sm text-red-800 leading-relaxed font-normal">
            {message}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg focus-visible:outline-2 focus-visible:outline-red-600 transition-colors shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>다시 시도</span>
              </button>
            )}

            {onGoBack && (
              <button
                type="button"
                onClick={onGoBack}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg focus-visible:outline-2 focus-visible:outline-slate-600 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                <span>{backLabel}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
