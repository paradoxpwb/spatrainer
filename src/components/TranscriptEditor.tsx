import React, { useState, useEffect } from 'react';
import { Edit3, RotateCcw, Check, AlertCircle } from 'lucide-react';
import { tokenizeWords } from '../utils/transcriptUtils';

interface TranscriptEditorProps {
  originalTranscript: string;
  initialTranscript: string;
  onUpdateTranscript: (newTranscript: string) => void;
  isManual?: boolean;
}

export const TranscriptEditor: React.FC<TranscriptEditorProps> = ({
  originalTranscript,
  initialTranscript,
  onUpdateTranscript,
  isManual = false,
}) => {
  const [currentText, setCurrentText] = useState<string>(initialTranscript);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [justSaved, setJustSaved] = useState<boolean>(false);

  useEffect(() => {
    setCurrentText(initialTranscript);
    setHasChanges(false);
  }, [initialTranscript]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCurrentText(val);
    setHasChanges(val !== initialTranscript);
    setJustSaved(false);
  };

  const handleApplyUpdate = () => {
    const trimmed = currentText.trim();
    onUpdateTranscript(trimmed);
    setHasChanges(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const handleRevert = () => {
    setCurrentText(originalTranscript);
    onUpdateTranscript(originalTranscript);
    setHasChanges(false);
    setJustSaved(false);
  };

  const wordCount = tokenizeWords(currentText).length;
  const charCount = currentText.length;
  const isDifferentFromOriginal = originalTranscript.trim() !== currentText.trim();
  const isEmpty = currentText.trim().length === 0;

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Your Answer</h2>
            {isManual ? (
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                직접 입력됨
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                음성 인식 완료
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            음성 인식 결과를 확인하세요. 잘못 인식된 부분은 직접 수정할 수 있습니다.
          </p>
        </div>

        {/* Counts badge */}
        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono tabular-nums self-end sm:self-auto">
          <span>{wordCount} 단어</span>
          <span>·</span>
          <span>{charCount} 자</span>
        </div>
      </div>

      {/* Textarea */}
      <div className="relative">
        <label htmlFor="transcript-input" className="sr-only">
          답변 텍스트 편집
        </label>
        <textarea
          id="transcript-input"
          value={currentText}
          onChange={handleChange}
          rows={4}
          placeholder="이곳에 영어 답변 내용이 표시됩니다. 직접 입력하거나 수정할 수 있습니다."
          className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm sm:text-base leading-relaxed focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus-visible:outline-none transition-all resize-y min-h-[110px]"
        />
      </div>

      {/* Empty error notice */}
      {isEmpty && (
        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Transcript를 입력하거나 음성 전사를 다시 시도해 주세요.</span>
        </div>
      )}

      {/* Footer Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {isDifferentFromOriginal && (
            <button
              type="button"
              onClick={handleRevert}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-slate-500"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>원본으로 되돌리기</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleApplyUpdate}
          disabled={!hasChanges || isEmpty}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all focus-visible:outline-2 focus-visible:outline-blue-600 ${
            justSaved
              ? 'bg-emerald-600 text-white shadow-xs'
              : hasChanges && !isEmpty
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {justSaved ? (
            <>
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              <span>지표 업데이트 완료</span>
            </>
          ) : (
            <>
              <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>분석 지표 업데이트</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
