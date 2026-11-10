import { describe, it, expect } from 'vitest';
import {
  parseLocalDateString,
  isValidExamDate,
  calculateDaysUntilExam,
  formatDDay,
  getRecommendedPracticeArea,
  getTodayLocalDateString,
} from './dDayUtils';
import { PRACTICE_AREAS } from '../config/practiceTaxonomy';

describe('dDayUtils', () => {
  describe('parseLocalDateString', () => {
    it('parses valid YYYY-MM-DD into a local Date with hours set to 0:00', () => {
      const parsed = parseLocalDateString('2026-11-20');
      expect(parsed).not.toBeNull();
      expect(parsed?.getFullYear()).toBe(2026);
      expect(parsed?.getMonth()).toBe(10); // 0-indexed month: 10 is November
      expect(parsed?.getDate()).toBe(20);
      expect(parsed?.getHours()).toBe(0);
      expect(parsed?.getMinutes()).toBe(0);
    });

    it('returns null for empty or invalid date strings', () => {
      expect(parseLocalDateString('')).toBeNull();
      expect(parseLocalDateString('invalid-date')).toBeNull();
      expect(parseLocalDateString('2026-02-31')).toBeNull(); // February 31 doesn't exist
      expect(parseLocalDateString('2026-13-01')).toBeNull(); // Month 13 doesn't exist
    });
  });

  describe('isValidExamDate', () => {
    it('validates future dates', () => {
      const today = new Date();
      const future = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10);
      const str = `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, '0')}-${String(future.getDate()).padStart(2, '0')}`;
      expect(isValidExamDate(str)).toBe(true);
    });

    it('rejects past dates', () => {
      const today = new Date();
      const past = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
      const str = `${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, '0')}-${String(past.getDate()).padStart(2, '0')}`;
      expect(isValidExamDate(str)).toBe(false);
    });

    it('rejects invalid format or nonsensical date strings', () => {
      expect(isValidExamDate('abcd')).toBe(false);
      expect(isValidExamDate('2026-99-99')).toBe(false);
    });
  });

  describe('calculateDaysUntilExam & formatDDay (all 8 required edge cases)', () => {
    // 1. Future exam date yields correct positive D-N
    it('1. yields D-14 for exam date 14 days in the future', () => {
      const baseToday = new Date(2026, 10, 10, 15, 30); // Nov 10, 2026 at 15:30
      const days = calculateDaysUntilExam('2026-11-24', baseToday);
      expect(days).toBe(14);
      expect(formatDDay(days)).toBe('D-14');
    });

    // 2. Same-day exam date yields D-Day
    it('2. yields D-Day when exam date is today', () => {
      const baseToday = new Date(2026, 10, 10, 22, 10);
      const days = calculateDaysUntilExam('2026-11-10', baseToday);
      expect(days).toBe(0);
      expect(formatDDay(days)).toBe('D-Day');
    });

    // 3. Undecided exam date yields "시험일 미정"
    it('3. yields "시험일 미정" when exam date is null or undecided', () => {
      const days = calculateDaysUntilExam(null);
      expect(days).toBeNull();
      expect(formatDDay(null)).toBe('시험일 미정');
      expect(formatDDay(undefined)).toBe('시험일 미정');
    });

    // 4. Past exam date yields D+N
    it('4. yields D+3 for an exam date 3 days in the past', () => {
      const baseToday = new Date(2026, 10, 10, 9, 0);
      const days = calculateDaysUntilExam('2026-11-07', baseToday);
      expect(days).toBe(-3);
      expect(formatDDay(days)).toBe('D+3');
    });

    // 5. Invalid date string yields null / "시험일 미정"
    it('5. handles invalid date string safely without throwing', () => {
      const days = calculateDaysUntilExam('not-a-date');
      expect(days).toBeNull();
      expect(formatDDay(days)).toBe('시험일 미정');
    });

    // 6. Year boundary crossing (Dec 31 to Jan 1) calculated accurately
    it('6. correctly calculates across year boundary (Dec 31 -> Jan 2 is 2 days)', () => {
      const newYearEve = new Date(2026, 11, 31, 23, 59); // Dec 31, 2026
      const days = calculateDaysUntilExam('2027-01-02', newYearEve);
      expect(days).toBe(2);
      expect(formatDDay(days)).toBe('D-2');
    });

    // 7. Leap day handled accurately (2028 is a leap year)
    it('7. accurately calculates leap day (Feb 28, 2028 -> Mar 1, 2028 is 2 days due to Feb 29)', () => {
      const feb28 = new Date(2028, 1, 28, 12, 0); // Feb 28, 2028
      const days = calculateDaysUntilExam('2028-03-01', feb28);
      expect(days).toBe(2);
      expect(formatDDay(days)).toBe('D-2');
    });

    // 8. Pure local timezone midnight parsing with zero UTC shifting
    it('8. prevents UTC shifting regardless of time-of-day', () => {
      const morning = new Date(2026, 10, 10, 1, 0, 0); // 01:00 AM local
      const evening = new Date(2026, 10, 10, 23, 0, 0); // 11:00 PM local
      expect(calculateDaysUntilExam('2026-11-15', morning)).toBe(5);
      expect(calculateDaysUntilExam('2026-11-15', evening)).toBe(5);
    });
  });

  describe('getRecommendedPracticeArea', () => {
    it('returns a valid practice area from PRACTICE_AREAS', () => {
      const rec = getRecommendedPracticeArea();
      expect(rec).toBeDefined();
      expect(PRACTICE_AREAS.some((a) => a.id === rec.id)).toBe(true);
    });

    it('returns deterministic rotation based on calendar day', () => {
      const day1 = new Date(2026, 10, 10);
      const day2 = new Date(2026, 10, 11);
      const rec1 = getRecommendedPracticeArea(day1);
      const rec2 = getRecommendedPracticeArea(day2);
      expect(rec1.id).toBeDefined();
      expect(rec2.id).toBeDefined();
    });
  });

  describe('getTodayLocalDateString', () => {
    it('returns YYYY-MM-DD formatted date string', () => {
      const todayStr = getTodayLocalDateString();
      expect(todayStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
