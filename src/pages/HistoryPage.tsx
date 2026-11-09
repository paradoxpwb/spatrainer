/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { PracticeSession } from '../types/practiceSession';
import { PracticeAttempt } from '../types/practiceAttempt';
import { HistoryFilters, HistoryFilterState } from '../components/history/HistoryFilters';
import { DeleteSessionDialog } from '../components/history/DeleteSessionDialog';
import { getPracticeAreaDefinition, getTopicDefinition } from '../config/practiceTaxonomy';
import {
  FileText,
  RotateCcw,
  Sparkles,
  BarChart2,
  Trash2,
  Calendar,
  Clock,
  ArrowRight,
  Headphones,
  Eye,
  Layers,
  MessageSquare,
  Mic,
} from 'lucide-react';
import { formatTime } from '../utils/timeUtils';

interface HistoryPageProps {
  sessions: PracticeSession[];
  attempts: PracticeAttempt[];
  onOpenSessionDetail: (sessionId: string) => void;
  onOpenComparison: (sessionId: string) => void;
  onRetryQuestion: (questionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onGoHome: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  sessions,
  attempts,
  onOpenSessionDetail,
  onOpenComparison,
  onRetryQuestion,
  onDeleteSession,
  onGoHome,
}) => {
  const [filters, setFilters] = useState<HistoryFilterState>({
    period: 'all',
    practiceArea: 'all',
    topic: 'all',
    categoryId: 'all',
    hasRetryOnly: false,
    hasCoachingOnly: false,
    sortBy: 'latest',
  });

  const [sessionToDelete, setSessionToDelete] = useState<PracticeSession | null>(null);

  // Filter and sort sessions
  const filteredSessions = useMemo(() => {
    let list = [...sessions];

    // Filter by period
    if (filters.period !== 'all') {
      const now = new Date().getTime();
      const days = filters.period === '7d' ? 7 : 30;
      const cutoff = now - days * 24 * 60 * 60 * 1000;
      list = list.filter((s) => new Date(s.createdAt || s.updatedAt).getTime() >= cutoff);
    }

    // Filter by practice area
    if (filters.practiceArea !== 'all') {
      list = list.filter((s) => s.practiceArea === filters.practiceArea);
    }

    // Filter by topic or legacy category
    const effectiveTopic = filters.topic !== 'all' ? filters.topic : filters.categoryId;
    if (effectiveTopic && effectiveTopic !== 'all') {
      list = list.filter(
        (s) =>
          s.topic === effectiveTopic ||
          s.category === effectiveTopic ||
          (effectiveTopic === 'workplace' && s.category === 'work') ||
          (effectiveTopic === 'work' && s.topic === 'workplace')
      );
    }

    // Filter by retry
    if (filters.hasRetryOnly) {
      list = list.filter((s) => s.attemptIds.length > 1);
    }

    // Filter by coaching
    if (filters.hasCoachingOnly) {
      list = list.filter((s) => {
        const sessionAttempts = attempts.filter((a) => a.sessionId === s.id);
        return sessionAttempts.some((a) => a.aiCoaching?.status === 'completed');
      });
    }

    // Sort
    list.sort((a, b) => {
      if (filters.sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (filters.sortBy === 'attempts') {
        return b.attemptIds.length - a.attemptIds.length;
      }
      return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
    });

    return list;
  }, [sessions, attempts, filters]);

  const getAreaBadge = (areaId?: string) => {
    if (!areaId) return null;
    const def = getPracticeAreaDefinition(areaId as any);
    if (!def) return null;

    let icon = <Mic className="w-3 h-3" />;
    let style = 'bg-blue-50 text-blue-700 border-blue-200';
    if (areaId === 'area-2-business-follow-up') {
      icon = <MessageSquare className="w-3 h-3" />;
      style = 'bg-indigo-50 text-indigo-700 border-indigo-200';
    } else if (areaId === 'area-3-opinion-extended') {
      icon = <Layers className="w-3 h-3" />;
      style = 'bg-amber-50 text-amber-700 border-amber-200';
    } else if (areaId === 'area-4-listening-summary') {
      icon = <Headphones className="w-3 h-3" />;
      style = 'bg-purple-50 text-purple-700 border-purple-200';
    } else if (areaId === 'area-5-visual-prompt') {
      icon = <Eye className="w-3 h-3" />;
      style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md border text-[11px] font-bold ${style}`}>
        {icon}
        <span>Area {def.order}</span>
      </span>
    );
  };

  return (
    <div className="py-8 sm:py-12 max-w-4xl mx-auto px-4 sm:px-6 space-y-6 animate-fade-in">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-slate-100 tracking-tight">
            연습 세션 기록 (Practice Sessions)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            질문별로 묶인 답변 시도와 AI 코칭 이력을 확인하고 비교할 수 있습니다.
          </p>
        </div>

        <span className="text-xs font-semibold text-slate-500 self-start sm:self-auto px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          총 {filteredSessions.length}개 세션
        </span>
      </div>

      {/* 2. Filters */}
      <HistoryFilters filters={filters} onChangeFilters={setFilters} />

      {/* 3. Session List */}
      {filteredSessions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">일치하는 연습 기록이 없습니다.</h3>
          <p className="text-xs text-slate-400">
            검색 필터를 변경하거나 새로운 질문 연습을 시작해 보세요.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => {
            const sessionAttempts = attempts.filter((a) => a.sessionId === session.id);
            const hasMultipleAttempts = session.attemptIds.length >= 2 || sessionAttempts.length >= 2;
            const latestAttempt =
              sessionAttempts.find((a) => a.id === session.latestAttemptId) ||
              sessionAttempts[sessionAttempts.length - 1] ||
              null;
            const hasCoaching = sessionAttempts.some((a) => a.aiCoaching?.status === 'completed');

            const dateFormatted = new Date(session.updatedAt || session.createdAt).toLocaleDateString(
              [],
              {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }
            );

            const topicDef = session.topic ? getTopicDefinition(session.topic) : undefined;
            const topicLabel = topicDef?.labelKo || session.categoryLabel || session.category;

            return (
              <div
                key={session.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-3xl p-5 sm:p-6 shadow-xs transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Area Badge */}
                      {getAreaBadge(session.practiceArea)}

                      {/* Topic Badge */}
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[11px] font-bold">
                        {topicLabel}
                      </span>

                      {/* Practice Mode */}
                      {session.practiceMode && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-mono text-[10px]">
                          {session.practiceMode}
                        </span>
                      )}

                      {hasMultipleAttempts ? (
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] border border-indigo-200 dark:border-indigo-800">
                          {sessionAttempts.length}회 시도 (Retry 완료)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium text-[11px]">
                          1회 답변
                        </span>
                      )}

                      {hasCoaching && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold text-[11px] border border-amber-200 dark:border-amber-800 inline-flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>AI 코칭 있음</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug pt-1">
                      "{session.question}"
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0 sm:text-right">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{dateFormatted}</span>
                  </div>
                </div>

                {/* Latest metrics preview */}
                {latestAttempt && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
                      <span>
                        최신 발화: <strong>{latestAttempt.recordingDurationSeconds || 0}초</strong>
                      </span>
                      <span>
                        WPM: <strong>{latestAttempt.metrics?.wordsPerMinute || 0}</strong>
                      </span>
                      <span>
                        단어 수: <strong>{latestAttempt.metrics?.totalWords || 0}단어</strong>
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400">
                      시도 #{latestAttempt.attemptNumber || sessionAttempts.length}
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenSessionDetail(session.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-white dark:text-slate-900 text-xs font-bold rounded-xl transition-colors"
                    >
                      <span>세션 상세 & 답변 이력</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    {hasMultipleAttempts && (
                      <button
                        type="button"
                        onClick={() => onOpenComparison(session.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold rounded-xl transition-colors"
                      >
                        <BarChart2 className="w-3.5 h-3.5" />
                        <span>답변 변화 비교</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onRetryQuestion(session.questionId)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>이 질문 다시 연습</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSessionToDelete(session)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="세션 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {sessionToDelete && (
        <DeleteSessionDialog
          isOpen={true}
          questionTitle={sessionToDelete.question}
          attemptCount={sessionToDelete.attemptIds?.length || 1}
          onConfirm={() => {
            onDeleteSession(sessionToDelete.id);
            setSessionToDelete(null);
          }}
          onCancel={() => setSessionToDelete(null)}
        />
      )}
    </div>
  );
};
