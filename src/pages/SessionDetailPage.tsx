import React, { useState } from 'react';
import { PracticeSession } from '../types/practiceSession';
import { PracticeAttempt } from '../types/practiceAttempt';
import { AudioPlayer } from '../components/AudioPlayer';
import { MetricsSummary } from '../components/MetricsSummary';
import { DeleteSessionDialog } from '../components/history/DeleteSessionDialog';
import {
  ArrowLeft,
  RotateCcw,
  BarChart2,
  Trash2,
  Sparkles,
  FileText,
  Clock,
  Layers,
  HelpCircle,
  PlusCircle,
  X,
} from 'lucide-react';
import { formatTime } from '../utils/timeUtils';

interface SessionDetailPageProps {
  session: PracticeSession;
  attempts: PracticeAttempt[];
  activeAudioUrl?: string | null;
  onBackToHistory: () => void;
  onOpenComparison: (sessionId: string) => void;
  onRetryInSession?: (sessionId: string, questionId: string) => void;
  onStartNewSession?: (questionId: string) => void;
  onRetryQuestion: (questionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
}

export const SessionDetailPage: React.FC<SessionDetailPageProps> = ({
  session,
  attempts,
  activeAudioUrl,
  onBackToHistory,
  onOpenComparison,
  onRetryInSession,
  onStartNewSession,
  onRetryQuestion,
  onDeleteSession,
}) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [retryModalOpen, setRetryModalOpen] = useState<boolean>(false);
  const hasMultiple = attempts.length >= 2;

  // Sort attempts by attemptNumber ascending
  const sortedAttempts = [...attempts].sort(
    (a, b) => (a.attemptNumber || 1) - (b.attemptNumber || 1)
  );

  const handleChooseRetryInSession = () => {
    setRetryModalOpen(false);
    if (onRetryInSession) {
      onRetryInSession(session.id, session.questionId);
    } else {
      onRetryQuestion(session.questionId);
    }
  };

  const handleChooseStartNewSession = () => {
    setRetryModalOpen(false);
    if (onStartNewSession) {
      onStartNewSession(session.questionId);
    } else {
      onRetryQuestion(session.questionId);
    }
  };

  return (
    <div className="py-8 sm:py-12 max-w-4xl mx-auto px-4 sm:px-6 space-y-8 animate-fade-in">
      {/* 1. Header with back button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <button
          type="button"
          onClick={onBackToHistory}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors self-start min-h-[40px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>전체 세션 목록으로 돌아가기</span>
        </button>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {hasMultiple && (
            <button
              type="button"
              onClick={() => onOpenComparison(session.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors min-h-[38px]"
            >
              <BarChart2 className="w-4 h-4" />
              <span>전후 비교 분석</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors min-h-[38px]"
            aria-label="이 세션 삭제"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Question Info Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {session.practiceArea && (
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-800 text-[11px] font-bold">
              {session.practiceArea}
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-bold">
            {session.categoryLabel || session.topic || session.category}
          </span>
          {session.practiceMode && (
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px]">
              {session.practiceMode}
            </span>
          )}
          <span className="text-xs font-semibold text-slate-400">
            총 {attempts.length}개의 발화 시도
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 leading-snug">
          "{session.question}"
        </h1>

        {session.practiceArea === 'area-4-listening-summary' && (
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900">
            <strong>Area 4 안내:</strong> 약 40~50초 Passage를 2회 청취 후 녹음된 요약 답변입니다. 지문 원문은 화면에 노출되지 않습니다.
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>생성일: {new Date(session.createdAt).toLocaleDateString()}</span>
          <button
            type="button"
            onClick={() => setRetryModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-bold text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>이 질문 다시 연습하기</span>
          </button>
        </div>
      </div>

      {/* 3. Attempts Timeline */}
      <div className="space-y-6">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          발화 시도 타임라인 ({attempts.length} Attempts)
        </h2>

        {sortedAttempts.map((attempt) => {
          const attemptNum = attempt.attemptNumber || 1;
          const isLatest = attempt.id === session.latestAttemptId;
          const coaching = attempt.aiCoaching?.result;
          const hasAudio = isLatest && activeAudioUrl;

          return (
            <div
              key={attempt.id}
              className={`bg-white border rounded-3xl p-6 shadow-xs space-y-5 ${
                isLatest ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-200'
              }`}
            >
              {/* Attempt header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold font-mono">
                    #{attemptNum}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    {attemptNum === 1 ? '첫 번째 답변 (Initial Attempt)' : `${attemptNum}차 재도전 답변 (Retry Attempt)`}
                  </h3>
                  {isLatest && (
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                      최신
                    </span>
                  )}
                  {attempt.retrySource && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      출처: {attempt.retrySource}
                    </span>
                  )}
                </div>

                <span className="text-xs text-slate-400 font-mono">
                  {new Date(attempt.recordedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>

              {/* Audio Playback or Fallback Note */}
              {hasAudio ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <AudioPlayer src={activeAudioUrl} />
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                  <span>
                    오디오는 브라우저에 영구 저장되지 않아 이 기록에서 재생할 수 없습니다. (전사 텍스트와 객관적 지표는 안전하게 보존됩니다.)
                  </span>
                </div>
              )}

              {/* Transcript */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Transcript (답변 텍스트)
                </span>
                <p className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 leading-relaxed font-sans select-text whitespace-pre-wrap">
                  "{attempt.editedTranscript || attempt.originalTranscript || '전사된 내용이 없습니다.'}"
                </p>
              </div>

              {/* Metrics Summary */}
              {attempt.metrics && <MetricsSummary metrics={attempt.metrics} />}

              {/* AI Coaching summary if present */}
              {coaching && (
                <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-purple-950">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>저장된 AI 코칭 피드백:</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{coaching.overallSummary}</p>
                  {coaching.improvedAnswer && (
                    <div className="mt-2 pt-2 border-t border-purple-100 text-[11px] text-purple-900">
                      <strong>개선 모범 답변:</strong> "{coaching.improvedAnswer}"
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Retry Mode Selection Dialog */}
      {retryModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                <RotateCcw className="w-5 h-5 text-blue-600" />
                <span>연습 재개 방식 선택</span>
              </div>
              <button
                type="button"
                onClick={() => setRetryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              이전 기록과 연결하여 발전 과정을 비교할지, 완전히 새로운 독립 연습으로 시작할지 선택해 주세요.
            </p>

            <div className="space-y-3">
              {/* Option A: Retry in same session */}
              <button
                type="button"
                onClick={handleChooseRetryInSession}
                className="w-full text-left p-4 rounded-2xl border-2 border-blue-200 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-500 transition-all space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-blue-900">
                    1. 같은 Session에서 Retry (시도 #{attempts.length + 1})
                  </span>
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                    권장
                  </span>
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  기존 세션 ID를 유지하며 새 시도를 추가합니다. 첫 번째 시도와 전후 비교 분석을 계속 진행할 수 있습니다.
                </p>
              </button>

              {/* Option B: Start as new session */}
              <button
                type="button"
                onClick={handleChooseStartNewSession}
                className="w-full text-left p-4 rounded-2xl border border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50 transition-all space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">
                    2. 새 연습으로 시작 (새 Session)
                  </span>
                  <PlusCircle className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  과거 기록과 분리하여 완전히 새로운 PracticeSession을 생성합니다. 독립된 문제 풀이로 기록됩니다.
                </p>
              </button>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setRetryModalOpen(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <DeleteSessionDialog
        isOpen={deleteModalOpen}
        questionTitle={session.question}
        attemptCount={attempts.length}
        onConfirm={() => {
          onDeleteSession(session.id);
          setDeleteModalOpen(false);
          onBackToHistory();
        }}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};
