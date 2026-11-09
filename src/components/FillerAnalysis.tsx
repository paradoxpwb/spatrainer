import React from 'react';
import { HelpCircle } from 'lucide-react';

interface FillerAnalysisProps {
  fillerCounts: Record<string, number>;
  totalFillerCount: number;
  fillerRatePer100Words: number;
}

export const FillerAnalysis: React.FC<FillerAnalysisProps> = ({
  fillerCounts,
  totalFillerCount,
  fillerRatePer100Words,
}) => {
  const fillerEntries = Object.entries(fillerCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Filler Candidates (잠재적 채움 표현)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            생각할 시간을 벌기 위해 무의식적으로 쓴 추임새 표현입니다.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg shrink-0">
          <span>총 {totalFillerCount}회 감지</span>
          <span>·</span>
          <span>100단어당 {fillerRatePer100Words}회</span>
        </div>
      </div>

      {fillerEntries.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-4">
          {fillerEntries.map(([filler, count]) => {
            const isContextual = filler === 'well' || filler === 'actually';
            return (
              <div
                key={filler}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs"
              >
                <span className="font-semibold text-slate-800 font-mono">
                  "{filler}"
                </span>
                <span className="font-bold text-blue-700 tabular-nums">
                  {count}회
                </span>
                {isContextual && (
                  <span className="text-[10px] text-slate-400 bg-white border border-slate-200 px-1 rounded">
                    문맥 확인 필요
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4 text-center rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 mb-4">
          감지된 filler 표현이 없습니다.
        </div>
      )}

      {/* Mandatory Guidance Notice */}
      <div className="flex items-start gap-2 pt-3 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
        <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
        <span>
          일부 표현(well, actually 등)은 문맥에 따라 정상적인 강조 표현일 수 있으므로 Transcript와 함께 확인하세요.
        </span>
      </div>
    </div>
  );
};
