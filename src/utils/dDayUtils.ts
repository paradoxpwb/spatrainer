/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PRACTICE_AREAS } from '../config/practiceTaxonomy';
import { PracticeAreaDefinition } from '../types/question';
import { TargetSpaLevel } from '../types/monetization';

/**
 * Returns the current local calendar date as YYYY-MM-DD string.
 * Uses local timezone getters to avoid UTC date shifting.
 */
export function getTodayLocalDateString(refDate: Date = new Date()): string {
  const year = refDate.getFullYear();
  const month = String(refDate.getMonth() + 1).padStart(2, '0');
  const day = String(refDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Safely parses a YYYY-MM-DD string into a Date object at local midnight (00:00:00.000).
 * Avoids the standard `new Date("YYYY-MM-DD")` UTC conversion trap.
 * Validates year, month, and day (including leap year Feb 29 check).
 */
export function parseLocalDateString(dateStr: string | null | undefined): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr.trim());
  if (!match) return null;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10); // 1-12
  const day = parseInt(match[3], 10); // 1-31

  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  // Verify real calendar day for the month (e.g., handles Feb 29 on leap years, Apr 31 etc.)
  const candidate = new Date(year, month - 1, day, 0, 0, 0, 0);
  if (
    candidate.getFullYear() !== year ||
    candidate.getMonth() !== month - 1 ||
    candidate.getDate() !== day
  ) {
    return null;
  }

  return candidate;
}

/**
 * Validates that an exam date string is valid and is today or in the future
 * relative to the reference local date (defaults to today).
 */
export function isValidExamDate(
  dateStr: string | null | undefined,
  referenceDateStr?: string
): boolean {
  if (!dateStr) return false;
  const examDate = parseLocalDateString(dateStr);
  if (!examDate) return false;

  const refDate = referenceDateStr
    ? parseLocalDateString(referenceDateStr)
    : parseLocalDateString(getTodayLocalDateString());

  if (!refDate) return false;

  // Comparison in local midnight milliseconds
  return examDate.getTime() >= refDate.getTime();
}

/**
 * Calculates days remaining until the exam date based on local calendar dates.
 * Returns:
 * - null if exam date is not set or invalid
 * - 0 if exam date is today
 * - positive integer N if exam date is in the future (D-N)
 * - negative integer -N if exam date is in the past (D+N)
 */
export function calculateDaysUntilExam(
  examDateStr: string | null | undefined,
  referenceDate?: string | Date
): number | null {
  if (!examDateStr) return null;

  const examDate = parseLocalDateString(examDateStr);
  if (!examDate) return null;

  const refDateStr =
    referenceDate instanceof Date
      ? getTodayLocalDateString(referenceDate)
      : referenceDate;

  const today = refDateStr
    ? parseLocalDateString(refDateStr)
    : parseLocalDateString(getTodayLocalDateString());

  if (!today) return null;

  const diffMs = examDate.getTime() - today.getTime();
  // Standard integer difference between calendar midnights
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Formats D-Day string:
 * Can be called with either:
 * - formatDDay(daysRemaining: number | null | undefined)
 * - formatDDay(examDateDecided: boolean, examDateStr: string | null | undefined, referenceDate?: string | Date)
 */
export function formatDDay(
  examDateDecidedOrDays: boolean | number | null | undefined,
  examDateStr?: string | null | undefined,
  referenceDate?: string | Date
): string {
  if (typeof examDateDecidedOrDays === 'number') {
    if (examDateDecidedOrDays === 0) return 'D-Day';
    if (examDateDecidedOrDays > 0) return `D-${examDateDecidedOrDays}`;
    return `D+${Math.abs(examDateDecidedOrDays)}`;
  }

  if (examDateDecidedOrDays === null || examDateDecidedOrDays === undefined) {
    return '시험일 미정';
  }

  if (!examDateDecidedOrDays || !examDateStr) {
    return '시험일 미정';
  }

  const days = calculateDaysUntilExam(examDateStr, referenceDate);
  if (days === null) {
    return '시험일 미정';
  }

  if (days === 0) {
    return 'D-Day';
  }

  if (days > 0) {
    return `D-${days}`;
  }

  return `D+${Math.abs(days)}`;
}

/**
 * Creates a study recommendation mapped directly to an existing PracticeAreaDefinition
 * in `src/config/practiceTaxonomy.ts`.
 * Guaranteed to return an authentic existing item from PRACTICE_AREAS.
 */
export function getRecommendedPracticeArea(
  daysUntilExamOrRefDate?: number | null | Date,
  _targetLevel?: TargetSpaLevel
): PracticeAreaDefinition {
  // Safe fallback: Area 1 (Personal & Workplace)
  const defaultArea = PRACTICE_AREAS[0];

  if (daysUntilExamOrRefDate instanceof Date) {
    const dayIndex = daysUntilExamOrRefDate.getDate() % PRACTICE_AREAS.length;
    return PRACTICE_AREAS[dayIndex] || defaultArea;
  }

  const daysUntilExam = typeof daysUntilExamOrRefDate === 'number' ? daysUntilExamOrRefDate : null;

  if (daysUntilExam === null) {
    // Return rotating recommendation by today's calendar date
    const today = new Date();
    const dayIndex = today.getDate() % PRACTICE_AREAS.length;
    return PRACTICE_AREAS[dayIndex] || defaultArea;
  }

  if (daysUntilExam === null) {
    // Undecided: Start with Area 1 (Personal & Workplace Q&A)
    return PRACTICE_AREAS.find((a) => a.id === 'area-1-personal-workplace') || defaultArea;
  }

  if (daysUntilExam >= 15) {
    // 15일 이상: 기본 문답 (Area 1)
    return PRACTICE_AREAS.find((a) => a.id === 'area-1-personal-workplace') || defaultArea;
  }

  if (daysUntilExam >= 8) {
    // 8~14일: 비즈니스 후속 질문 훈련 (Area 2)
    return PRACTICE_AREAS.find((a) => a.id === 'area-2-business-follow-up') || defaultArea;
  }

  if (daysUntilExam >= 4) {
    // 4~7일: 지문 청취 및 요약 집중 훈련 (Area 4)
    return PRACTICE_AREAS.find((a) => a.id === 'area-4-listening-summary') || defaultArea;
  }

  if (daysUntilExam >= 2) {
    // 2~3일: 시각 자료 도표 묘사 (Area 5)
    return PRACTICE_AREAS.find((a) => a.id === 'area-5-visual-prompt') || defaultArea;
  }

  // D-1 또는 D-Day: 논리적 의견 확장 최종 점검 (Area 3)
  return PRACTICE_AREAS.find((a) => a.id === 'area-3-opinion-extended') || defaultArea;
}
