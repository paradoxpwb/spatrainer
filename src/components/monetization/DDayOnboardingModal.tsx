/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Target, Clock, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { DailyStudyMinutes, MonetizationProfile, TargetSpaLevel } from '../../types/monetization';
import { getTodayLocalDateString, isValidExamDate } from '../../utils/dDayUtils';
import { trackMonetizationEvent, viewEventDeduplicator } from '../../utils/analyticsEvents';

interface DDayOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (data: {
    examDate: string | null;
    examDateDecided: boolean;
    targetLevel: TargetSpaLevel;
    dailyStudyMinutes: DailyStudyMinutes;
  }) => void;
  initialProfile?: MonetizationProfile;
  initialExamDate?: string | null;
  initialExamDateDecided?: boolean;
  initialTargetLevel?: TargetSpaLevel;
  initialDailyStudyMinutes?: DailyStudyMinutes;
}

const TARGET_LEVEL_OPTIONS: Array<{ value: TargetSpaLevel; label: string; desc: string }> = [
  { value: 'level-4', label: 'Level 4', desc: '기본 비즈니스 회화' },
  { value: 'level-5', label: 'Level 5', desc: '대리/과장 승진 기준 권장' },
  { value: 'level-6-plus', label: 'Level 6 이상', desc: '해외 파견 및 주재원 수준' },
  { value: 'level-3', label: 'Level 3', desc: '입문 및 기초 표현 구사' },
  { value: 'not-sure', label: '아직 모름', desc: '학습하며 목표 설정' },
];

const STUDY_TIME_OPTIONS: Array<{ value: DailyStudyMinutes; label: string }> = [
  { value: 10, label: '10분 (가볍게 1문항)' },
  { value: 20, label: '20분 (권장 · 2~3문항 집중)' },
  { value: 30, label: '30분 이상 (실전 모의고사 수준)' },
];

export const DDayOnboardingModal: React.FC<DDayOnboardingModalProps> = ({
  isOpen,
  onClose,
  onSaveProfile,
  initialProfile,
  initialExamDate = null,
  initialExamDateDecided = false,
  initialTargetLevel = 'level-5',
  initialDailyStudyMinutes = 20,
}) => {
  const effectiveExamDate = initialProfile?.examDate ?? initialExamDate;
  const effectiveExamDateDecided = initialProfile ? initialProfile.examDateDecided : initialExamDateDecided;
  const effectiveTargetLevel = initialProfile?.targetLevel ?? initialTargetLevel;
  const effectiveDailyStudyMinutes = initialProfile?.dailyStudyMinutes ?? initialDailyStudyMinutes;

  const [examDateDecided, setExamDateDecided] = useState<boolean>(effectiveExamDateDecided);
  const [examDate, setExamDate] = useState<string>(effectiveExamDate || '');
  const [targetLevel, setTargetLevel] = useState<TargetSpaLevel>(effectiveTargetLevel);
  const [dailyStudyMinutes, setDailyStudyMinutes] = useState<DailyStudyMinutes>(effectiveDailyStudyMinutes);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement | null>(null);
  const triggerElementRef = useRef<Element | null>(null);
  const todayStr = getTodayLocalDateString();

  // Reset form when modal opens with initial values
  useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = document.activeElement;
      setExamDateDecided(effectiveExamDateDecided);
      setExamDate(effectiveExamDate || '');
      setTargetLevel(effectiveTargetLevel);
      setDailyStudyMinutes(effectiveDailyStudyMinutes);
      setErrorMessage(null);

      // Track view event safely
      viewEventDeduplicator.triggerOnce('onboarding_modal', 'monetization_onboarding_view');
    } else {
      viewEventDeduplicator.reset('onboarding_modal');
      if (triggerElementRef.current instanceof HTMLElement) {
        triggerElementRef.current.focus();
      }
    }
  }, [isOpen, initialExamDate, initialExamDateDecided, initialTargetLevel, initialDailyStudyMinutes]);

  // Trap focus & Handle Escape & Lock scroll
  useEffect(() => {
    if (!isOpen) return;

    // Body scroll lock
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Initial focus on modal
    const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, input, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable && focusable.length > 0) {
      focusable[0].focus();
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (examDateDecided) {
      if (!examDate.trim()) {
        setErrorMessage('시험 날짜를 선택해 주세요. 날짜가 정해지지 않았다면 "시험일 미정"을 체크하세요.');
        return;
      }
      if (!isValidExamDate(examDate, todayStr)) {
        setErrorMessage('시험 날짜는 오늘 이후여야 합니다. 지난 날짜는 선택할 수 없습니다.');
        return;
      }
    }

    // Fire GTM analytics events
    trackMonetizationEvent('exam_date_set', {
      daysUntilExam: examDateDecided ? undefined : null,
      targetLevel,
    });
    trackMonetizationEvent('target_level_set', { targetLevel });
    trackMonetizationEvent('monetization_onboarding_complete', {
      targetLevel,
      daysUntilExam: examDateDecided ? undefined : null,
    });

    onSaveProfile({
      examDate: examDateDecided ? examDate : null,
      examDateDecided,
      targetLevel,
      dailyStudyMinutes,
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 my-auto space-y-6 text-slate-900 dark:text-slate-100 transition-all"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
              목표 맞춤 설정
            </span>
            <h2 id="onboarding-title" className="text-xl sm:text-2xl font-extrabold tracking-tight">
              SPA 시험 목표 및 D-Day 설정
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              목표 일정과 희망 등급에 맞춰 매일 최적의 실전 연습을 추천해 드립니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question 1: Exam Date */}
          <div className="space-y-2">
            <label htmlFor="exam-date-input" className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>1. SPA 시험 예정일</span>
            </label>

            <div className="space-y-2">
              <input
                id="exam-date-input"
                type="date"
                min={todayStr}
                value={examDate}
                disabled={!examDateDecided}
                onChange={(e) => {
                  setExamDate(e.target.value);
                  setErrorMessage(null);
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border transition-colors ${
                  !examDateDecided
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600'
                }`}
              />

              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={!examDateDecided}
                  onChange={(e) => {
                    const isUndecided = e.target.checked;
                    setExamDateDecided(!isUndecided);
                    setErrorMessage(null);
                  }}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="font-medium">아직 시험 날짜가 정해지지 않았습니다 (시험일 미정)</span>
              </label>
            </div>
          </div>

          {/* Question 2: Target SPA Level */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>2. 목표 SPA 등급</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TARGET_LEVEL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTargetLevel(opt.value)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    targetLevel === opt.value
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-100 ring-1 ring-indigo-600'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span className="font-bold block text-xs">{opt.label}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5 leading-tight">
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Question 3: Daily Study Time */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>3. 하루 목표 학습 시간</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {STUDY_TIME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDailyStudyMinutes(opt.value)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    dailyStudyMinutes === opt.value
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-100 font-bold ring-1 ring-indigo-600'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span className="text-xs block">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Validation Error Banner */}
          {errorMessage && (
            <div role="alert" className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              나중에 설정
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs hover:shadow transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>목표 설정 완료</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
