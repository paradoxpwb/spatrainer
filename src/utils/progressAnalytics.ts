import { PracticeAttempt } from '../types/practiceAttempt';
import { PracticeSession, StoredPracticeData } from '../types/practiceSession';
import {
  AreaProgress,
  CategoryProgress,
  ImprovementTag,
  PeriodFilter,
  PracticeRecommendation,
  ProgressSummary,
  StreakData,
  TrendPoint,
} from '../types/progress';
import { PracticeGoal } from '../types/goals';
import { CATEGORIES } from '../data/questionBank';
import { PRACTICE_AREAS } from '../config/practiceTaxonomy';
import { ExportPayload, generateExportData } from './dataExport';

const QUESTION_CATEGORIES = CATEGORIES;

function safeRound(value: number, decimals: number = 1): number {
  if (!isFinite(value) || isNaN(value)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Convert ISO timestamp into local YYYY-MM-DD string.
 */
export function getLocalDateString(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
}

/**
 * Pure function 1: Filter attempts by user-selected period ('7d' | '30d' | 'all') based on local date.
 * Excludes invalid dates and future dates (with 1-minute buffer for clock skew).
 */
export function filterAttemptsByPeriod(
  attempts: PracticeAttempt[],
  period: PeriodFilter
): PracticeAttempt[] {
  if (!Array.isArray(attempts)) return [];
  const now = new Date();
  const nowMs = now.getTime();

  return attempts.filter((a) => {
    if (!a || !a.recordedAt) return false;
    const t = new Date(a.recordedAt).getTime();
    if (isNaN(t)) return false;
    // Exclude future dates (allowing 60s clock skew)
    if (t > nowMs + 60000) return false;

    if (period === 'all') return true;
    const daysLimit = period === '7d' ? 7 : 30;
    const cutoffTime = nowMs - daysLimit * 24 * 60 * 60 * 1000;
    return t >= cutoffTime;
  });
}

/**
 * Pure function: Filter sessions by user-selected period ('7d' | '30d' | 'all').
 * Excludes invalid dates and future dates.
 */
export function filterSessionsByPeriod(
  sessions: PracticeSession[],
  period: PeriodFilter
): PracticeSession[] {
  if (!Array.isArray(sessions)) return [];
  const now = new Date();
  const nowMs = now.getTime();

  return sessions.filter((s) => {
    if (!s) return false;
    const t = new Date(s.createdAt || s.updatedAt).getTime();
    if (isNaN(t)) return false;
    if (t > nowMs + 60000) return false;

    if (period === 'all') return true;
    const daysLimit = period === '7d' ? 7 : 30;
    const cutoffTime = nowMs - daysLimit * 24 * 60 * 60 * 1000;
    return t >= cutoffTime;
  });
}

/**
 * Pure function 2: Calculate the overall progress summary statistics for the selected period.
 * Strict rules:
 * - Excludes invalid and future dates
 * - Excludes 0-second and negative recordings
 * - WPM average includes only valid positive finite numbers
 * - Filler rate average includes only valid recordings with transcripts and word count > 0
 * - When valid samples are absent, returns null instead of a misleading 0
 * - Completed sessions count sessions in this period that are not 'abandoned' and have at least 1 valid attempt
 */
export function calculateProgressSummary(
  attempts: PracticeAttempt[],
  sessions: PracticeSession[],
  period: PeriodFilter
): ProgressSummary {
  const filteredAttempts = filterAttemptsByPeriod(attempts, period);

  const totalAttempts = filteredAttempts.length;

  let retryCount = 0;
  let totalRecordingSeconds = 0;
  let validDurationCount = 0;

  let totalWpm = 0;
  let wpmCount = 0;

  let totalFillerRate = 0;
  let fillerRateCount = 0;

  const uniqueDays = new Set<string>();
  const activeSessionIds = new Set<string>();

  for (const a of filteredAttempts) {
    if ((a.attemptNumber && a.attemptNumber > 1) || Boolean(a.parentAttemptId)) {
      retryCount++;
    }

    if (a.sessionId) {
      activeSessionIds.add(a.sessionId);
    }

    // Exclude 0 second or negative duration
    const dur = a.recordingDurationSeconds || a.metrics?.recordingDurationSeconds || 0;
    if (dur > 0 && isFinite(dur)) {
      totalRecordingSeconds += dur;
      validDurationCount++;
    }

    if (a.metrics) {
      const wpm = a.metrics.wordsPerMinute;
      if (typeof wpm === 'number' && wpm > 0 && isFinite(wpm)) {
        totalWpm += wpm;
        wpmCount++;
      }

      const totalWords = a.metrics.totalWords || 0;
      const fillerRate = a.metrics.fillerRatePer100Words;
      if (typeof fillerRate === 'number' && isFinite(fillerRate) && totalWords > 0) {
        totalFillerRate += fillerRate;
        fillerRateCount++;
      }
    }

    const dateStr = getLocalDateString(a.recordedAt);
    if (dateStr) {
      uniqueDays.add(dateStr);
    }
  }

  // Completed sessions rule:
  // Count sessions referenced by valid attempts in this period whose status is not 'abandoned'
  let completedSessions = 0;
  if (Array.isArray(sessions) && sessions.length > 0) {
    const sessionMap = new Map(sessions.map((s) => [s.id, s]));
    for (const sId of activeSessionIds) {
      const session = sessionMap.get(sId);
      if (session && session.status !== 'abandoned') {
        completedSessions++;
      } else if (!session) {
        // Migrated legacy attempt or independent attempt
        completedSessions++;
      }
    }
  } else {
    completedSessions = activeSessionIds.size;
  }

  const averageRecordingSeconds =
    validDurationCount > 0 ? safeRound(totalRecordingSeconds / validDurationCount, 0) : null;
  const averageWordsPerMinute =
    wpmCount > 0 ? safeRound(totalWpm / wpmCount, 1) : null;
  const averageFillerRate =
    fillerRateCount > 0 ? safeRound(totalFillerRate / fillerRateCount, 1) : null;

  return {
    totalAttempts,
    completedSessions,
    retryCount,
    practiceDays: uniqueDays.size,
    practiceDaysCount: uniqueDays.size,
    totalRecordingSeconds,
    averageRecordingSeconds,
    averageDurationSeconds: averageRecordingSeconds ?? 0,
    averageWordsPerMinute,
    averageWpm: averageWordsPerMinute ?? 0,
    averageFillerRate,
    validWpmSampleCount: wpmCount,
    validDurationSampleCount: validDurationCount,
    validFillerSampleCount: fillerRateCount,
  };
}

/**
 * Pure function 3: Calculate practice progress per category across all 8 standard categories.
 * Supports both exact user prompt property names and component aliases.
 */
export function calculateCategoryStats(
  attempts: PracticeAttempt[],
  sessions: PracticeSession[] = []
): CategoryProgress[] {
  return QUESTION_CATEGORIES.map((cat) => {
    const catAttempts = Array.isArray(attempts)
      ? attempts.filter((a) => {
          if (!a) return false;
          if (a.category === cat.id) return true;
          if (a.topic === cat.id) return true;
          if (cat.id === 'work' && a.topic === 'workplace') return true;
          if (cat.id === 'travel-leisure' && (a.topic === 'travel-leisure' || a.category === 'travel')) return true;
          return false;
        })
      : [];
    const practiceCount = catAttempts.length;

    let retryCount = 0;
    let totalDur = 0;
    let validDurCount = 0;
    let totalWpm = 0;
    let wpmCount = 0;
    let totalFiller = 0;
    let fillerCount = 0;
    let lastPracticedAt: string | null = null;
    const catSessionIds = new Set<string>();

    for (const a of catAttempts) {
      if ((a.attemptNumber && a.attemptNumber > 1) || Boolean(a.parentAttemptId)) {
        retryCount++;
      }
      if (a.sessionId) {
        catSessionIds.add(a.sessionId);
      }

      const dur = a.recordingDurationSeconds || a.metrics?.recordingDurationSeconds || 0;
      if (dur > 0 && isFinite(dur)) {
        totalDur += dur;
        validDurCount++;
      }

      if (a.metrics?.wordsPerMinute && a.metrics.wordsPerMinute > 0 && isFinite(a.metrics.wordsPerMinute)) {
        totalWpm += a.metrics.wordsPerMinute;
        wpmCount++;
      }
      if (
        typeof a.metrics?.fillerRatePer100Words === 'number' &&
        isFinite(a.metrics.fillerRatePer100Words) &&
        (a.metrics.totalWords || 0) > 0
      ) {
        totalFiller += a.metrics.fillerRatePer100Words;
        fillerCount++;
      }

      if (a.recordedAt && (!lastPracticedAt || new Date(a.recordedAt) > new Date(lastPracticedAt))) {
        lastPracticedAt = a.recordedAt;
      }
    }

    // Tag aggregation
    const tagMap = new Map<ImprovementTag, number>();
    for (const a of catAttempts) {
      const coaching = a.aiCoaching?.result;
      if (coaching) {
        coaching.priorityImprovements?.forEach((p) => {
          const title = (p.title || '').toLowerCase();
          if (title.includes('예시') || title.includes('사례')) {
            tagMap.set('add-example', (tagMap.get('add-example') || 0) + 1);
          } else if (title.includes('이유') || title.includes('근거')) {
            tagMap.set('explain-reason', (tagMap.get('explain-reason') || 0) + 1);
          } else if (title.includes('결론') || title.includes('결과')) {
            tagMap.set('add-result', (tagMap.get('add-result') || 0) + 1);
          } else if (title.includes('반복')) {
            tagMap.set('reduce-repetition', (tagMap.get('reduce-repetition') || 0) + 1);
          } else {
            tagMap.set('improve-structure', (tagMap.get('improve-structure') || 0) + 1);
          }
        });
      }
    }

    const TAG_LABELS: Record<ImprovementTag, string> = {
      'add-example': '구체적 예시 보강',
      'clarify-main-point': '핵심 주장 명확화',
      'explain-reason': '이유 및 배경 설명',
      'add-result': '결과 및 시사점 추가',
      'improve-structure': '논리 전개 구조 개선',
      'reduce-repetition': '어휘 반복 줄이기',
      'grammar-tense': '시제 일치',
      'grammar-article': '관사/전치사',
      'grammar-preposition': '전치사 활용',
      'use-specific-vocabulary': '전문 어휘 활용',
      'answer-all-parts': '질문 항목 누락 보완',
      other: '기타 개선점',
    };

    const frequentImprovementTags = Array.from(tagMap.entries())
      .map(([tag, count]) => ({
        tag,
        label: TAG_LABELS[tag] || tag,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const averageRecordingSeconds =
      validDurCount > 0 ? safeRound(totalDur / validDurCount, 0) : null;
    const averageWordsPerMinute =
      wpmCount > 0 ? safeRound(totalWpm / wpmCount, 1) : null;
    const averageFillerRate =
      fillerCount > 0 ? safeRound(totalFiller / fillerCount, 1) : null;

    return {
      category: cat.id,
      categoryId: cat.id,
      categoryLabel: cat.label,
      attemptCount: practiceCount,
      practiceCount,
      sessionCount: catSessionIds.size,
      retryCount,
      lastPracticedAt,
      averageRecordingSeconds,
      averageDurationSeconds: averageRecordingSeconds ?? 0,
      averageWordsPerMinute,
      averageWpm: averageWordsPerMinute ?? 0,
      averageFillerRate,
      frequentImprovementTags,
    };
  });
}

export const calculateCategoryProgress = calculateCategoryStats;

/**
 * Pure function: Calculate progress statistics per Practice Area (5 Areas).
 */
export function calculateAreaStats(
  attempts: PracticeAttempt[],
  sessions: PracticeSession[] = []
): AreaProgress[] {
  return PRACTICE_AREAS.map((area) => {
    const areaAttempts = Array.isArray(attempts)
      ? attempts.filter((a) => a && a.practiceArea === area.id)
      : [];
    const attemptCount = areaAttempts.length;

    let retryCount = 0;
    let totalDur = 0;
    let validDurCount = 0;
    let totalWpm = 0;
    let wpmCount = 0;
    let totalFiller = 0;
    let fillerCount = 0;
    let lastPracticedAt: string | null = null;
    const areaSessionIds = new Set<string>();

    for (const a of areaAttempts) {
      if ((a.attemptNumber && a.attemptNumber > 1) || Boolean(a.parentAttemptId)) {
        retryCount++;
      }
      if (a.sessionId) {
        areaSessionIds.add(a.sessionId);
      }

      const dur = a.recordingDurationSeconds || a.metrics?.recordingDurationSeconds || 0;
      if (dur > 0 && isFinite(dur)) {
        totalDur += dur;
        validDurCount++;
      }

      if (a.metrics?.wordsPerMinute && a.metrics.wordsPerMinute > 0 && isFinite(a.metrics.wordsPerMinute)) {
        totalWpm += a.metrics.wordsPerMinute;
        wpmCount++;
      }
      if (
        typeof a.metrics?.fillerRatePer100Words === 'number' &&
        isFinite(a.metrics.fillerRatePer100Words) &&
        (a.metrics.totalWords || 0) > 0
      ) {
        totalFiller += a.metrics.fillerRatePer100Words;
        fillerCount++;
      }

      if (a.recordedAt && (!lastPracticedAt || new Date(a.recordedAt) > new Date(lastPracticedAt))) {
        lastPracticedAt = a.recordedAt;
      }
    }

    const averageRecordingSeconds = validDurCount > 0 ? safeRound(totalDur / validDurCount, 0) : null;
    const averageWordsPerMinute = wpmCount > 0 ? safeRound(totalWpm / wpmCount, 1) : null;
    const averageFillerRate = fillerCount > 0 ? safeRound(totalFiller / fillerCount, 1) : null;

    return {
      areaId: area.id,
      order: area.order,
      labelKo: area.labelKo,
      labelEn: area.labelEn,
      practiceMode: area.practiceMode,
      attemptCount,
      sessionCount: areaSessionIds.size,
      retryCount,
      lastPracticedAt,
      averageRecordingSeconds,
      averageWordsPerMinute,
      averageFillerRate,
    };
  });
}

/**
 * Pure function 4: Calculates practice streaks using the user's local timezone.
 * Handles duplicate attempts on the same day as 1 active day.
 * Excludes future dates and invalid dates.
 */
export function calculateStreak(attempts: PracticeAttempt[]): StreakData {
  if (!Array.isArray(attempts) || attempts.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      practiceDates: [],
      lastPracticedDate: null,
      activityDaysLast30: 0,
      dailyAttemptCounts: {},
    };
  }

  const now = new Date();
  const nowMs = now.getTime();
  const dailyAttemptCounts: Record<string, number> = {};

  for (const a of attempts) {
    if (!a || !a.recordedAt) continue;
    const t = new Date(a.recordedAt).getTime();
    if (isNaN(t) || t > nowMs + 60000) continue; // skip invalid or future

    const dateStr = getLocalDateString(a.recordedAt);
    if (dateStr) {
      dailyAttemptCounts[dateStr] = (dailyAttemptCounts[dateStr] || 0) + 1;
    }
  }

  const sortedDates = Object.keys(dailyAttemptCounts).sort();
  if (sortedDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      practiceDates: [],
      lastPracticedDate: null,
      activityDaysLast30: 0,
      dailyAttemptCounts: {},
    };
  }

  const lastPracticedDate = sortedDates[sortedDates.length - 1];

  // Calculate current streak
  const todayStr = getLocalDateString(now.toISOString());
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday.toISOString());

  let currentStreak = 0;
  // If user practiced today or yesterday, streak is alive
  if (dailyAttemptCounts[todayStr] || dailyAttemptCounts[yesterdayStr]) {
    let checkDate = dailyAttemptCounts[todayStr] ? new Date(now) : new Date(yesterday);
    while (true) {
      const checkStr = getLocalDateString(checkDate.toISOString());
      if (dailyAttemptCounts[checkStr]) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak historically
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of sortedDates) {
    const currentDate = new Date(dateStr + 'T00:00:00');
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffMs = currentDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    prevDate = currentDate;
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  // Count active days in last 30 days
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = getLocalDateString(thirtyDaysAgo.toISOString());

  const activityDaysLast30 = sortedDates.filter((d) => d >= thirtyDaysAgoStr).length;

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    practiceDates: sortedDates,
    lastPracticedDate,
    activityDaysLast30,
    dailyAttemptCounts,
  };
}

/**
 * Pure function 5: Calculates current progress for personal practice goals.
 * Evaluates weekly goals against current week (starting Monday 00:00 local time).
 * Clamps target values and prevents divide-by-zero.
 */
export function calculateGoalProgress(
  goals: PracticeGoal[],
  attempts: PracticeAttempt[],
  sessions: PracticeSession[] = []
): PracticeGoal[] {
  if (!Array.isArray(goals)) return [];

  // Determine current week's cutoff (starting from Monday 00:00 local time)
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7; // 0 for Monday, 6 for Sunday
  const monday = new Date(now);
  monday.setDate(monday.getDate() - dayOfWeek);
  monday.setHours(0, 0, 0, 0);
  const weekStartMs = monday.getTime();

  const thisWeekAttempts = Array.isArray(attempts)
    ? attempts.filter((a) => {
        if (!a || !a.recordedAt) return false;
        const t = new Date(a.recordedAt).getTime();
        return !isNaN(t) && t >= weekStartMs;
      })
    : [];

  const thisWeekDays = new Set<string>();
  let thisWeekRetries = 0;
  let totalDuration = 0;
  let validDurations = 0;
  let totalFiller = 0;
  let validFillers = 0;

  for (const a of thisWeekAttempts) {
    const d = getLocalDateString(a.recordedAt);
    if (d) thisWeekDays.add(d);

    if ((a.attemptNumber && a.attemptNumber > 1) || Boolean(a.parentAttemptId)) {
      thisWeekRetries++;
    }

    const dur = a.recordingDurationSeconds || a.metrics?.recordingDurationSeconds || 0;
    if (dur > 0 && isFinite(dur)) {
      totalDuration += dur;
      validDurations++;
    }

    if (typeof a.metrics?.fillerRatePer100Words === 'number' && isFinite(a.metrics.fillerRatePer100Words)) {
      totalFiller += a.metrics.fillerRatePer100Words;
      validFillers++;
    }
  }

  return goals.map((goal) => {
    let currentValue = 0;
    const cat = goal.category || goal.categoryId;

    if (goal.type === 'weekly-attempts') {
      currentValue = thisWeekAttempts.length;
    } else if (goal.type === 'weekly-days' || goal.type === 'weekly-practice-days') {
      currentValue = thisWeekDays.size;
    } else if (goal.type === 'weekly-retries') {
      currentValue = thisWeekRetries;
    } else if ((goal.type === 'category-target' || goal.type === 'category-practice') && cat) {
      currentValue = thisWeekAttempts.filter((a) => a.category === cat).length;
    } else if (goal.type === 'response-duration') {
      currentValue = validDurations > 0 ? Math.round(totalDuration / validDurations) : 0;
    } else if (goal.type === 'filler-rate') {
      currentValue = validFillers > 0 ? safeRound(totalFiller / validFillers, 1) : 0;
    }

    // Clamp targetValue to avoid negative or extreme invalid numbers
    const safeTarget = Math.max(1, goal.targetValue || 1);

    return {
      ...goal,
      targetValue: safeTarget,
      currentValue,
      active: goal.active !== false,
    };
  });
}

/**
 * Pure function 6: Generates up to 3 prioritized, actionable recommendations based on actual user history.
 * Never calls AI; uses rule-based pedagogical heuristics.
 */
export function generateRecommendations(
  attempts: PracticeAttempt[],
  sessions: PracticeSession[] = [],
  categoryStats: CategoryProgress[] = [],
  goals: PracticeGoal[] = []
): PracticeRecommendation[] {
  const recommendations: PracticeRecommendation[] = [];

  // Rule 0: No practice yet
  if (!attempts || attempts.length === 0) {
    recommendations.push({
      id: 'rec-start-intro',
      priority: 1,
      type: 'unpracticed-category',
      title: '첫 번째 연습 시작하기',
      explanation: '아직 등록된 연습 기록이 없습니다. 자기소개 질문으로 부담 없이 시작해 보세요.',
      reason: '아직 등록된 연습 기록이 없습니다. 자기소개 질문으로 부담 없이 시작해 보세요.',
      actionLabel: '자기소개 질문 연습하기',
      actionType: 'category',
      category: 'self-introduction',
      categoryId: 'self-introduction',
      targetCategoryId: 'self-introduction',
      targetCategoryLabel: '자기소개',
    });
    return recommendations;
  }

  // Rule 1: Category unpracticed for 30+ days (or never practiced)
  const unpracticedCat = categoryStats.find((c) => (c.attemptCount ?? c.practiceCount) === 0);
  if (unpracticedCat) {
    recommendations.push({
      id: `rec-unpracticed-${unpracticedCat.categoryId}`,
      priority: 1,
      type: 'unpracticed-category',
      title: `${unpracticedCat.categoryLabel} 카테고리 연습 추천`,
      explanation: `아직 ${unpracticedCat.categoryLabel} 주제를 연습하지 않았습니다. 시험 전 다양한 주제를 경험해 보세요.`,
      reason: `아직 ${unpracticedCat.categoryLabel} 주제를 연습하지 않았습니다. 시험 전 다양한 주제를 경험해 보세요.`,
      actionLabel: `${unpracticedCat.categoryLabel} 문제 풀기`,
      actionType: 'category',
      category: unpracticedCat.categoryId,
      categoryId: unpracticedCat.categoryId,
      targetCategoryId: unpracticedCat.categoryId,
      targetCategoryLabel: unpracticedCat.categoryLabel,
    });
  }

  // Rule 2: Unretried session (completed only 1 attempt)
  const unretriedSession = sessions.find((s) => s.attemptIds.length === 1);
  if (unretriedSession && recommendations.length < 3) {
    const qShort = unretriedSession.question.length > 30
      ? `${unretriedSession.question.slice(0, 30)}...`
      : unretriedSession.question;

    recommendations.push({
      id: `rec-retry-${unretriedSession.id}`,
      priority: 2,
      type: 'retry-pending',
      title: '동일 질문 재도전(Retry) 권장',
      explanation: `"${qShort}" 질문에 첫 답변만 녹음되었습니다. 피드백을 적용해 한 번 더 말해보세요.`,
      reason: `"${qShort}" 질문에 첫 답변만 녹음되었습니다. 피드백을 적용해 한 번 더 말해보세요.`,
      actionLabel: '이 질문 재도전하기',
      actionType: 'retry',
      sessionId: unretriedSession.id,
      targetSessionId: unretriedSession.id,
      targetQuestionId: unretriedSession.questionId,
    });
  }

  // Rule 3: Short response duration check
  const recentAttempts = attempts.slice(0, 5);
  const shortAttempts = recentAttempts.filter((a) => (a.recordingDurationSeconds || 0) < 30);
  if (shortAttempts.length >= 2 && recommendations.length < 3) {
    recommendations.push({
      id: 'rec-extend-duration',
      priority: 3,
      type: 'short-responses',
      title: '구체적인 이유와 사례 1문장 추가하기',
      explanation: '최근 답변 시간이 30초 미만으로 짧았습니다. 질문 답변 후 구체적인 근거를 덧붙여 보세요.',
      reason: '최근 답변 시간이 30초 미만으로 짧았습니다. 질문 답변 후 구체적인 근거를 덧붙여 보세요.',
      actionLabel: '의견 제시 질문으로 연습',
      actionType: 'category',
      category: 'opinion',
      categoryId: 'opinion',
      targetCategoryId: 'opinion',
      targetCategoryLabel: '의견 제시',
    });
  }

  // Rule 4: High filler rate check
  const avgRecentFiller =
    recentAttempts.reduce((sum, a) => sum + (a.metrics?.fillerRatePer100Words || 0), 0) /
    (recentAttempts.length || 1);

  if (avgRecentFiller >= 5.0 && recommendations.length < 3) {
    recommendations.push({
      id: 'rec-reduce-filler',
      priority: 4,
      type: 'repeated-improvement',
      title: '침묵(Pause) 활용 및 호흡 가다듬기',
      explanation: '최근 답변에서 filler 표현(um, uh)이 다소 자주 관찰되었습니다. 1초간 호흡을 두는 연습을 해보세요.',
      reason: '최근 답변에서 filler 표현(um, uh)이 다소 자주 관찰되었습니다. 1초간 호흡을 두는 연습을 해보세요.',
      actionLabel: '직장생활 질문으로 연습',
      actionType: 'category',
      category: 'work',
      categoryId: 'work',
      targetCategoryId: 'work',
      targetCategoryLabel: '직장생활',
    });
  }

  // Fallback recommendation if still under 3
  if (recommendations.length < 3) {
    const leastPracticed = [...categoryStats]
      .filter((c) => !recommendations.some((r) => r.targetCategoryId === c.categoryId))
      .sort((a, b) => (a.attemptCount ?? a.practiceCount) - (b.attemptCount ?? b.practiceCount))[0];

    if (leastPracticed) {
      recommendations.push({
        id: `rec-least-${leastPracticed.categoryId}`,
        priority: 5,
        type: 'unpracticed-category',
        title: `${leastPracticed.categoryLabel} 균형 연습`,
        explanation: '다양한 실전 문항에 익숙해지도록 연습 빈도가 낮은 카테고리를 골고루 훈련하세요.',
        reason: '다양한 실전 문항에 익숙해지도록 연습 빈도가 낮은 카테고리를 골고루 훈련하세요.',
        actionLabel: `${leastPracticed.categoryLabel} 시작하기`,
        actionType: 'category',
        category: leastPracticed.categoryId,
        categoryId: leastPracticed.categoryId,
        targetCategoryId: leastPracticed.categoryId,
        targetCategoryLabel: leastPracticed.categoryLabel,
      });
    }
  }

  return recommendations.slice(0, 3);
}

/**
 * Pure function 7: Filter and sort PracticeSessions.
 */
export function filterAndSortSessions(
  sessions: PracticeSession[],
  attempts: PracticeAttempt[],
  filters: {
    period: PeriodFilter;
    categoryId: string;
    hasRetryOnly: boolean;
    hasCoachingOnly: boolean;
    sortBy: 'latest' | 'oldest' | 'attempts';
  }
): PracticeSession[] {
  if (!Array.isArray(sessions)) return [];

  let list = [...sessions];

  // 1. Period filter
  if (filters.period !== 'all') {
    const now = new Date().getTime();
    const days = filters.period === '7d' ? 7 : 30;
    const cutoff = now - days * 24 * 60 * 60 * 1000;
    list = list.filter((s) => {
      const t = new Date(s.createdAt || s.updatedAt).getTime();
      return !isNaN(t) && t >= cutoff;
    });
  }

  // 2. Category filter
  if (filters.categoryId !== 'all') {
    list = list.filter((s) => s.category === filters.categoryId);
  }

  // 3. Retry only filter
  if (filters.hasRetryOnly) {
    list = list.filter((s) => s.attemptIds.length > 1);
  }

  // 4. Coaching only filter
  if (filters.hasCoachingOnly) {
    const coachingSessionIds = new Set(
      attempts
        .filter((a) => a.aiCoaching?.status === 'completed')
        .map((a) => a.sessionId)
        .filter(Boolean)
    );
    list = list.filter((s) => coachingSessionIds.has(s.id));
  }

  // 5. Sorting
  list.sort((a, b) => {
    if (filters.sortBy === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (filters.sortBy === 'attempts') {
      return b.attemptIds.length - a.attemptIds.length;
    }
    // Default 'latest'
    return (
      new Date(b.updatedAt || b.createdAt).getTime() -
      new Date(a.updatedAt || a.createdAt).getTime()
    );
  });

  return list;
}

/**
 * Pure function 8: Deletes session and its linked attempts from StoredPracticeData.
 */
export function deleteSessionData(
  data: StoredPracticeData,
  sessionId: string
): StoredPracticeData {
  if (!data) return data;
  return {
    ...data,
    sessions: data.sessions.filter((s) => s.id !== sessionId),
    attempts: data.attempts.filter((a) => a.sessionId !== sessionId),
  };
}

/**
 * Pure function 9: Exports sanitized practice data (guaranteeing no audio blobs or keys).
 */
export function exportPracticeData(data: StoredPracticeData): ExportPayload {
  const sanitizedAttempts = (data.attempts || []).map((a) => ({
    id: a.id,
    sessionId: a.sessionId,
    attemptNumber: a.attemptNumber || 1,
    parentAttemptId: a.parentAttemptId,
    retrySource: a.retrySource,
    retryContext: a.retryContext,
    questionId: a.questionId,
    category: a.category,
    categoryLabel: a.categoryLabel,
    question: a.question,
    recordedAt: a.recordedAt,
    recordingDurationSeconds: a.recordingDurationSeconds,
    originalTranscript: a.originalTranscript,
    editedTranscript: a.editedTranscript,
    metrics: a.metrics,
    transcriptionStatus: a.transcriptionStatus,
    aiCoaching: a.aiCoaching
      ? {
          status: a.aiCoaching.status,
          promptVersion: a.aiCoaching.promptVersion,
          transcriptHash: a.aiCoaching.transcriptHash,
          feedbackLanguage: a.aiCoaching.feedbackLanguage,
          desiredAnswerLevel: a.aiCoaching.desiredAnswerLevel,
          generatedAt: a.aiCoaching.generatedAt,
          result: a.aiCoaching.result,
        }
      : undefined,
  }));

  return {
    schemaVersion: data.schemaVersion,
    exportedAt: new Date().toISOString(),
    app: 'SPA Speaking Trainer',
    sessions: data.sessions || [],
    attempts: sanitizedAttempts,
    goals: data.goals || [],
    preferences: data.preferences,
  };
}

/**
 * Calculates trend points for plotting chronological progression.
 */
export function calculateTrendPoints(
  attempts: PracticeAttempt[],
  period: PeriodFilter
): TrendPoint[] {
  const filtered = filterAttemptsByPeriod(attempts, period);
  // Sort chronologically (oldest to newest)
  const sorted = [...filtered].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  return sorted.map((a) => {
    const d = new Date(a.recordedAt);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const dateStr = getLocalDateString(a.recordedAt);

    return {
      id: a.id,
      date: dateStr,
      displayDate: `${month}/${day}`,
      speakingDuration: a.recordingDurationSeconds || a.metrics?.recordingDurationSeconds || 0,
      wpm: a.metrics?.wordsPerMinute || 0,
      fillerRate: safeRound(a.metrics?.fillerRatePer100Words || 0, 1),
      totalWords: a.metrics?.totalWords || 0,
      attemptNumber: a.attemptNumber || 1,
      questionTitle: a.question,
    };
  });
}
