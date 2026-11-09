import React from 'react';
import { PracticeAttempt } from '../types/practiceAttempt';
import { Clock, MessageSquare, Gauge, Trash2 } from 'lucide-react';
import { formatTime } from '../utils/timeUtils';

interface RecentPracticeListProps {
  history: PracticeAttempt[];
  onClearHistory?: () => void;
  onSelectAttempt?: (attempt: PracticeAttempt) => void;
}

export const RecentPracticeList: React.FC<RecentPracticeListProps> = ({
  history,
  onClearHistory,
  onSelectAttempt,
}) => {
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return `${d.getMonth() + 1}월 ${d.getDate()}일 ${d.getHours().toString().padStart(2, '0')}:${d
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            최근 연습 기록 (최근 {history.length}건)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            브라우저에 저장된 최근 말하기 연습 지표입니다. (최대 20건 보관)
          </p>
        </div>

        {history.length > 0 && onClearHistory && (
          <button
            type="button"
            onClick={onClearHistory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-red-500"
            title="기록 모두 삭제"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>기록 삭제</span>
          </button>
        )}
      </div>

      {history.length > 0 ? (
        <div className="divide-y divide-slate-100">
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectAttempt?.(item)}
              className={`py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                onSelectAttempt ? 'cursor-pointer hover:bg-slate-50/80 -mx-2 px-2 rounded-xl transition-colors' : ''
              }`}
            >
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1 text-xs">
                  <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                    {item.categoryLabel || item.category}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {formatDate(item.recordedAt)}
                  </span>
                  {item.transcriptionStatus === 'manual' ? (
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      직접입력
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      음성인식
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-slate-900 truncate">
                  "{item.question}"
                </p>
                {item.editedTranscript && (
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    {item.editedTranscript}
                  </p>
                )}
              </div>

              {/* Metrics strip */}
              <div className="flex items-center gap-4 text-xs font-mono font-bold text-slate-700 shrink-0 tabular-nums">
                <div className="flex items-center gap-1" title="녹음 시간">
                  <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                  <span>{formatTime(item.recordingDurationSeconds)}</span>
                </div>
                <div className="flex items-center gap-1" title="총 단어 수">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                  <span>{item.metrics.totalWords} words</span>
                </div>
                <div className="flex items-center gap-1" title="말하기 속도 WPM">
                  <Gauge className="w-3.5 h-3.5 text-blue-500" aria-hidden="true" />
                  <span className="text-blue-700">{item.metrics.wordsPerMinute} WPM</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-slate-400">
          아직 저장된 연습 기록이 없습니다.
        </div>
      )}
    </div>
  );
};
