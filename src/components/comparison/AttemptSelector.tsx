import React, { useState } from 'react';
import { PracticeAttempt } from '../../types/practiceAttempt';

interface AttemptSelectorProps {
  attempts: PracticeAttempt[];
  baseAttemptId: string;
  comparedAttemptId: string;
  onSelectBase: (id: string) => void;
  onSelectCompared: (id: string) => void;
}

export type PresetOption = 'attempt1-vs-latest' | 'attempt1-vs-attempt2' | 'previous-vs-latest' | 'custom';

export const AttemptSelector: React.FC<AttemptSelectorProps> = ({
  attempts,
  baseAttemptId,
  comparedAttemptId,
  onSelectBase,
  onSelectCompared,
}) => {
  const [activePreset, setActivePreset] = useState<PresetOption>('attempt1-vs-latest');

  // Sort attempts by attemptNumber ascending
  const sorted = [...attempts].sort(
    (a, b) => (a.attemptNumber || 1) - (b.attemptNumber || 1)
  );

  const attempt1 = sorted[0];
  const attempt2 = sorted.length >= 2 ? sorted[1] : null;
  const latestAttempt = sorted[sorted.length - 1];
  const previousAttempt = sorted.length >= 2 ? sorted[sorted.length - 2] : null;

  const handleApplyPreset = (preset: PresetOption) => {
    setActivePreset(preset);
    if (preset === 'attempt1-vs-latest' && attempt1 && latestAttempt) {
      onSelectBase(attempt1.id);
      onSelectCompared(latestAttempt.id);
    } else if (preset === 'attempt1-vs-attempt2' && attempt1 && attempt2) {
      onSelectBase(attempt1.id);
      onSelectCompared(attempt2.id);
    } else if (preset === 'previous-vs-latest' && previousAttempt && latestAttempt) {
      onSelectBase(previousAttempt.id);
      onSelectCompared(latestAttempt.id);
    }
  };

  const handleCustomBaseChange = (id: string) => {
    setActivePreset('custom');
    onSelectBase(id);
  };

  const handleCustomComparedChange = (id: string) => {
    setActivePreset('custom');
    onSelectCompared(id);
  };

  const isSameAttempt = baseAttemptId === comparedAttemptId;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          비교할 답변 선택 (Compare Attempts)
        </h3>
        <span className="text-[11px] text-slate-500">
          총 {sorted.length}개의 답변 중 2개를 선택하여 변화를 분석합니다.
        </span>
      </div>

      {/* Preset Quick Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 mr-1">빠른 선택:</span>
        <button
          type="button"
          onClick={() => handleApplyPreset('attempt1-vs-latest')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors min-h-[38px] ${
            activePreset === 'attempt1-vs-latest'
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          Attempt 1 vs 최신 (기본)
        </button>

        {sorted.length >= 3 && attempt2 && (
          <button
            type="button"
            onClick={() => handleApplyPreset('attempt1-vs-attempt2')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors min-h-[38px] ${
              activePreset === 'attempt1-vs-attempt2'
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            Attempt 1 vs Attempt 2
          </button>
        )}

        {sorted.length >= 3 && previousAttempt && (
          <button
            type="button"
            onClick={() => handleApplyPreset('previous-vs-latest')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors min-h-[38px] ${
              activePreset === 'previous-vs-latest'
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            직전 Attempt vs 최신 Attempt
          </button>
        )}

        <button
          type="button"
          onClick={() => setActivePreset('custom')}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors min-h-[38px] ${
            activePreset === 'custom'
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          직접 선택
        </button>
      </div>

      {/* Dropdown Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {/* Base Attempt */}
        <div>
          <label
            htmlFor="base-attempt-select"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            기준 답변 (Base Attempt):
          </label>
          <select
            id="base-attempt-select"
            value={baseAttemptId}
            onChange={(e) => handleCustomBaseChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 rounded-xl focus-visible:outline-2 focus-visible:outline-blue-600 cursor-pointer min-h-[44px]"
          >
            {sorted.map((a) => (
              <option key={a.id} value={a.id}>
                #{a.attemptNumber || 1}차 답변 ({a.recordingDurationSeconds}초 ·{' '}
                {new Date(a.recordedAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                )
              </option>
            ))}
          </select>
        </div>

        {/* Compared Attempt */}
        <div>
          <label
            htmlFor="compared-attempt-select"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            비교 대상 답변 (Compared Attempt):
          </label>
          <select
            id="compared-attempt-select"
            value={comparedAttemptId}
            onChange={(e) => handleCustomComparedChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 rounded-xl focus-visible:outline-2 focus-visible:outline-blue-600 cursor-pointer min-h-[44px]"
          >
            {sorted.map((a) => (
              <option key={a.id} value={a.id}>
                #{a.attemptNumber || 1}차 답변 ({a.recordingDurationSeconds}초 ·{' '}
                {new Date(a.recordedAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                )
              </option>
            ))}
          </select>
        </div>
      </div>

      {isSameAttempt && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium" role="alert">
          * 기준 답변과 비교 대상 답변이 동일합니다. 서로 다른 두 답변을 선택해 주세요.
        </div>
      )}
    </div>
  );
};
