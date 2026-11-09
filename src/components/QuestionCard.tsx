/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SpeakingQuestion } from '../types/question';
import { getPracticeAreaDefinition, getTopicDefinition } from '../config/practiceTaxonomy';
import { VisualPromptCard } from './visual/VisualPromptCard';
import { Volume2, MessageSquare, Layers, Eye, BookOpen } from 'lucide-react';
import { getDisplayPrompt } from '../utils/questionUtils';

interface QuestionCardProps {
  question: SpeakingQuestion;
  highlight?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, highlight = false }) => {
  const difficultyBadge =
    question.difficulty === 'intermediate'
      ? { label: '중급 (Intermediate)', color: 'text-amber-700 bg-amber-50 border-amber-200' }
      : { label: '기본 (Basic)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };

  const areaDef = question.practiceArea ? getPracticeAreaDefinition(question.practiceArea) : undefined;
  const topicDef = question.topic ? getTopicDefinition(question.topic) : undefined;

  const areaLabel = areaDef?.labelKo || '일반 문답';
  const topicLabel = topicDef?.labelKo || question.categoryLabel || '연습 주제';

  return (
    <div
      className={`w-full rounded-2xl bg-white dark:bg-slate-900 border p-6 sm:p-8 transition-shadow ${
        highlight
          ? 'border-blue-400 dark:border-blue-500 shadow-md ring-1 ring-blue-400/20'
          : 'border-slate-200 dark:border-slate-800 shadow-sm'
      }`}
    >
      {/* Category & Metadata header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span className="text-slate-900 dark:text-slate-100 font-bold text-sm">{areaLabel}</span>
          <span aria-hidden="true" className="text-slate-300">/</span>
          <span className="text-blue-700 dark:text-blue-400 font-bold">{topicLabel}</span>
        </div>

        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${difficultyBadge.color}`}
        >
          {difficultyBadge.label}
        </span>
      </div>

      {/* Area 4 Listening question display */}
      {question.practiceMode === 'listening-summary' ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-bold text-sm mb-1">
              <Volume2 className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>듣기 지문 요약 과제</span>
            </div>
            <p className="text-sm text-purple-800 dark:text-purple-300 font-semibold leading-relaxed">
              "{getDisplayPrompt(question)}"
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
              ※ 지문 원문은 화면에 제공되지 않습니다. 들려주는 음성에 집중하여 핵심 내용을 파악하세요.
            </p>
          </div>
        </div>
      ) : question.practiceMode === 'visual-prompt' ? (
        /* Area 5 Visual question display */
        <div className="space-y-4">
          <div className="mb-2">
            <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug tracking-tight">
              "{question.question}"
            </p>
          </div>
          <VisualPromptCard question={question} />
        </div>
      ) : (
        /* Area 1, 2, 3 questions */
        <div className="mt-2 space-y-4">
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-snug tracking-tight text-balance">
            "{getDisplayPrompt(question)}"
          </p>

          {/* Area 2 Follow-up indicator */}
          {question.practiceMode === 'follow-up-question' && (
            <div className="p-3 bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-xl text-xs text-blue-900 dark:text-blue-300 flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">비즈니스 후속 질문 연계 문항</span>
                <span className="text-[11px] text-blue-700 dark:text-blue-300/90">
                  주 질문 답변 후 실전처럼 심층 질문이 이어질 수 있습니다.
                </span>
              </div>
            </div>
          )}

          {/* Area 3 Extended response structure guidance */}
          {question.practiceMode === 'extended-response' && (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs space-y-1.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>권장 답변 전개 구조:</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px] pt-1">
                <div className="p-1.5 bg-white dark:bg-slate-900 border rounded font-semibold text-slate-700 dark:text-slate-300">
                  1. Opinion (명확한 주장)
                </div>
                <div className="p-1.5 bg-white dark:bg-slate-900 border rounded font-semibold text-slate-700 dark:text-slate-300">
                  2. Reason (구체적 근거)
                </div>
                <div className="p-1.5 bg-white dark:bg-slate-900 border rounded font-semibold text-slate-700 dark:text-slate-300">
                  3. Example (실제 사례)
                </div>
                <div className="p-1.5 bg-white dark:bg-slate-900 border rounded font-semibold text-slate-700 dark:text-slate-300">
                  4. Conclusion (결론 및 요약)
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer info */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>질문 내용을 충분히 이해하고 영어로 답변을 구성하세요.</span>
        <span className="font-mono text-[11px] text-slate-400">ID: {question.id}</span>
      </div>
    </div>
  );
};
