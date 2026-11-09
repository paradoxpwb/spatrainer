import { PracticeAttempt } from '../types/practiceAttempt';
import {
  AttemptComparison,
  ChecklistResult,
  ComparisonSummary,
  MetricChange,
  MetricInterpretation,
  MetricType,
} from '../types/comparison';
import { compareTranscripts } from './transcriptComparison';

function safeRound(value: number, decimals: number = 1): number {
  if (!isFinite(value) || isNaN(value)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

function calcPercentageChange(current: number, previous: number): number | null {
  if (!isFinite(previous) || isNaN(previous) || previous === 0) {
    return null;
  }
  const diff = current - previous;
  const pct = (diff / previous) * 100;
  if (!isFinite(pct) || isNaN(pct)) return null;
  return safeRound(pct, 1);
}

/**
 * Compare two sets of speaking metrics according to pedagogical speaking guidelines.
 */
export function compareMetrics(
  baseAttempt: PracticeAttempt,
  retryAttempt: PracticeAttempt
): MetricChange[] {
  const baseM = baseAttempt.metrics;
  const retryM = retryAttempt.metrics;

  const baseDuration = baseAttempt.recordingDurationSeconds || baseM.recordingDurationSeconds || 0;
  const retryDuration = retryAttempt.recordingDurationSeconds || retryM.recordingDurationSeconds || 0;

  // 1. Recording Duration
  const durationDiff = retryDuration - baseDuration;
  let durationInterp: MetricInterpretation = 'neutral';
  let durationExplanation = '답변 시간이 이전 시도와 유사하게 유지되었습니다.';

  if (Math.abs(durationDiff) <= 3) {
    durationInterp = 'neutral';
  } else if (baseDuration < 30 && retryDuration >= 40 && retryDuration <= 95) {
    durationInterp = 'improved';
    durationExplanation = '답변 시간이 늘어나 이유와 구체적 설명이 보강되었습니다.';
  } else if (retryDuration > 115) {
    durationInterp = 'needs-review';
    durationExplanation = '답변 제한시간에 가까워져 후반부 핵심 정리가 급해질 수 있습니다.';
  } else if (retryDuration < 25 && baseDuration >= 35) {
    durationInterp = 'needs-review';
    durationExplanation = '답변 분량이 다소 줄어들어 구체적인 설명 보강을 권장합니다.';
  } else if (durationDiff > 3) {
    durationInterp = 'improved';
    durationExplanation = '답변 시간이 충분히 확보되어 풍성하게 발화했습니다.';
  }

  // 2. Total Words
  const baseWords = baseM.totalWords || 0;
  const retryWords = retryM.totalWords || 0;
  const wordsDiff = retryWords - baseWords;
  let wordsInterp: MetricInterpretation = 'neutral';
  let wordsExplanation = '발화 단어 수가 이전과 비슷한 수준입니다.';

  if (Math.abs(wordsDiff) <= 5) {
    wordsInterp = 'neutral';
  } else if (baseWords < 35 && retryWords >= 45) {
    wordsInterp = 'improved';
    wordsExplanation = '단어 수가 증가하여 풍부한 문장 구성으로 발전했습니다.';
  } else if (wordsDiff > 10) {
    wordsInterp = 'improved';
    wordsExplanation = '발화량이 증가하여 더 많은 디테일을 전달했습니다.';
  } else if (wordsDiff < -15) {
    wordsInterp = 'needs-review';
    wordsExplanation = '발화 단어 수가 감소하여 내용이 다소 축약되었습니다.';
  }

  // 3. Words Per Minute (WPM)
  const baseWpm = baseM.wordsPerMinute || 0;
  const retryWpm = retryM.wordsPerMinute || 0;
  const wpmDiff = retryWpm - baseWpm;
  let wpmInterp: MetricInterpretation = 'neutral';
  let wpmExplanation = '발화 속도가 안정적인 페이스를 유지하고 있습니다.';

  if (Math.abs(wpmDiff) <= 5) {
    wpmInterp = 'neutral';
  } else if (retryWpm >= 110 && retryWpm <= 149) {
    if (baseWpm < 110 || baseWpm > 150) {
      wpmInterp = 'improved';
      wpmExplanation = '일반적인 영어 말하기 목표 범위(110~149 WPM)에 원활하게 진입했습니다.';
    } else {
      wpmInterp = 'improved';
      wpmExplanation = '자연스럽고 편안한 발화 속도를 유지하고 있습니다.';
    }
  } else if (retryWpm > 160) {
    wpmInterp = 'needs-review';
    wpmExplanation = '말하는 속도가 매우 빨라져 발음 명료도와 호흡 조절 점검이 필요합니다.';
  } else if (retryWpm < 90) {
    wpmInterp = 'needs-review';
    wpmExplanation = '단어 간 쉼이 길어질 수 있어 문장 단위 연결 연습을 권장합니다.';
  } else if (baseWpm < 100 && retryWpm > baseWpm) {
    wpmInterp = 'improved';
    wpmExplanation = '발화 템포가 한층 더 자연스럽게 개선되었습니다.';
  }

  // 4. Filler Rate per 100 words
  const baseFillerRate = baseM.fillerRatePer100Words || 0;
  const retryFillerRate = retryM.fillerRatePer100Words || 0;
  const fillerRateDiff = retryFillerRate - baseFillerRate;
  let fillerInterp: MetricInterpretation = 'neutral';
  let fillerExplanation = 'Filler(음..., 어...) 표현 비율에 큰 변화가 없습니다.';

  if (Math.abs(fillerRateDiff) <= 0.5) {
    fillerInterp = 'neutral';
  } else if (fillerRateDiff < -0.5) {
    fillerInterp = 'improved';
    fillerExplanation = `100단어당 filler 표현 비율이 ${safeRound(baseFillerRate)}개에서 ${safeRound(retryFillerRate)}개로 감소했습니다.`;
  } else if (fillerRateDiff > 1.2) {
    fillerInterp = 'needs-review';
    fillerExplanation = 'filler 표현 비율이 다소 증가하여 침묵을 두는 연습을 권장합니다.';
  }

  // 5. Total Filler Count
  const baseFillerCount = baseM.totalFillerCount || 0;
  const retryFillerCount = retryM.totalFillerCount || 0;
  const fillerCountDiff = retryFillerCount - baseFillerCount;

  // 6. Unique Word Count
  const baseUnique = baseM.uniqueWordCount || 0;
  const retryUnique = retryM.uniqueWordCount || 0;
  const uniqueDiff = retryUnique - baseUnique;
  let uniqueInterp: MetricInterpretation = 'neutral';
  if (uniqueDiff >= 5) {
    uniqueInterp = 'improved';
  } else if (uniqueDiff <= -6) {
    uniqueInterp = 'needs-review';
  }

  // 7. Lexical Diversity
  const baseLex = baseM.lexicalDiversity || 0;
  const retryLex = retryM.lexicalDiversity || 0;
  const lexDiff = retryLex - baseLex;
  let lexInterp: MetricInterpretation = 'neutral';
  if (Math.abs(lexDiff) <= 0.03) {
    lexInterp = 'neutral';
  } else if (lexDiff > 0.03) {
    lexInterp = 'improved';
  } else if (lexDiff < -0.05) {
    lexInterp = 'needs-review';
  }

  // 8. Repeated Words
  const baseRepWords = baseM.repeatedWords?.length || 0;
  const retryRepWords = retryM.repeatedWords?.length || 0;
  const repWordsDiff = retryRepWords - baseRepWords;
  let repWordsInterp: MetricInterpretation = 'neutral';
  if (repWordsDiff < 0) {
    repWordsInterp = 'improved';
  } else if (repWordsDiff > 1) {
    repWordsInterp = 'needs-review';
  }

  // 9. Repeated Phrases
  const baseRepPhrases = baseM.repeatedPhrases?.length || 0;
  const retryRepPhrases = retryM.repeatedPhrases?.length || 0;
  const repPhrasesDiff = retryRepPhrases - baseRepPhrases;
  let repPhrasesInterp: MetricInterpretation = 'neutral';
  if (repPhrasesDiff < 0) {
    repPhrasesInterp = 'improved';
  } else if (repPhrasesDiff > 1) {
    repPhrasesInterp = 'needs-review';
  }

  return [
    {
      metric: 'recording-duration',
      label: '발화 시간',
      unit: '초',
      previousValue: baseDuration,
      currentValue: retryDuration,
      absoluteChange: safeRound(durationDiff, 1),
      percentageChange: calcPercentageChange(retryDuration, baseDuration),
      direction: durationDiff > 1 ? 'increased' : durationDiff < -1 ? 'decreased' : 'unchanged',
      interpretation: durationInterp,
      explanation: durationExplanation,
    },
    {
      metric: 'total-words',
      label: '총 단어 수',
      unit: '단어',
      previousValue: baseWords,
      currentValue: retryWords,
      absoluteChange: wordsDiff,
      percentageChange: calcPercentageChange(retryWords, baseWords),
      direction: wordsDiff > 0 ? 'increased' : wordsDiff < 0 ? 'decreased' : 'unchanged',
      interpretation: wordsInterp,
      explanation: wordsExplanation,
    },
    {
      metric: 'words-per-minute',
      label: '발화 속도 (WPM)',
      unit: 'WPM',
      previousValue: baseWpm,
      currentValue: retryWpm,
      absoluteChange: wpmDiff,
      percentageChange: calcPercentageChange(retryWpm, baseWpm),
      direction: wpmDiff > 0 ? 'increased' : wpmDiff < 0 ? 'decreased' : 'unchanged',
      interpretation: wpmInterp,
      explanation: wpmExplanation,
    },
    {
      metric: 'filler-rate',
      label: '100단어당 Filler 비율',
      unit: '개',
      previousValue: safeRound(baseFillerRate, 1),
      currentValue: safeRound(retryFillerRate, 1),
      absoluteChange: safeRound(fillerRateDiff, 1),
      percentageChange: calcPercentageChange(retryFillerRate, baseFillerRate),
      direction: fillerRateDiff > 0.2 ? 'increased' : fillerRateDiff < -0.2 ? 'decreased' : 'unchanged',
      interpretation: fillerInterp,
      explanation: fillerExplanation,
    },
    {
      metric: 'filler-count',
      label: '총 Filler 개수',
      unit: '개',
      previousValue: baseFillerCount,
      currentValue: retryFillerCount,
      absoluteChange: fillerCountDiff,
      percentageChange: calcPercentageChange(retryFillerCount, baseFillerCount),
      direction: fillerCountDiff > 0 ? 'increased' : fillerCountDiff < 0 ? 'decreased' : 'unchanged',
      interpretation: fillerCountDiff < 0 ? 'improved' : fillerCountDiff > 1 ? 'needs-review' : 'neutral',
      explanation:
        fillerCountDiff < 0
          ? '불필요한 채움 표현이 줄었습니다.'
          : 'Filler 사용량에 큰 차이가 없습니다.',
    },
    {
      metric: 'unique-words',
      label: '고유 어휘 수',
      unit: '개',
      previousValue: baseUnique,
      currentValue: retryUnique,
      absoluteChange: uniqueDiff,
      percentageChange: calcPercentageChange(retryUnique, baseUnique),
      direction: uniqueDiff > 0 ? 'increased' : uniqueDiff < 0 ? 'decreased' : 'unchanged',
      interpretation: uniqueInterp,
      explanation:
        uniqueDiff > 0
          ? '새로운 어휘가 추가되어 표현이 다양해졌습니다.'
          : '어휘 풀이 이전과 유사합니다.',
    },
    {
      metric: 'lexical-diversity',
      label: '어휘 다양성 (TTR)',
      unit: '%',
      previousValue: safeRound(baseLex * 100, 1),
      currentValue: safeRound(retryLex * 100, 1),
      absoluteChange: safeRound(lexDiff * 100, 1),
      percentageChange: calcPercentageChange(retryLex, baseLex),
      direction: lexDiff > 0.02 ? 'increased' : lexDiff < -0.02 ? 'decreased' : 'unchanged',
      interpretation: lexInterp,
      explanation: '전체 단어 대비 고유 어휘 비율 변화입니다.',
    },
    {
      metric: 'repeated-words',
      label: '반복 단어 수 (3회+)',
      unit: '개',
      previousValue: baseRepWords,
      currentValue: retryRepWords,
      absoluteChange: repWordsDiff,
      percentageChange: calcPercentageChange(retryRepWords, baseRepWords),
      direction: repWordsDiff > 0 ? 'increased' : repWordsDiff < 0 ? 'decreased' : 'unchanged',
      interpretation: repWordsInterp,
      explanation:
        repWordsDiff < 0
          ? '과도한 단어 반복이 줄었습니다.'
          : '단어 반복 횟수가 비슷하게 유지되었습니다.',
    },
    {
      metric: 'repeated-phrases',
      label: '반복 연어구 (2회+)',
      unit: '개',
      previousValue: baseRepPhrases,
      currentValue: retryRepPhrases,
      absoluteChange: repPhrasesDiff,
      percentageChange: calcPercentageChange(retryRepPhrases, baseRepPhrases),
      direction: repPhrasesDiff > 0 ? 'increased' : repPhrasesDiff < 0 ? 'decreased' : 'unchanged',
      interpretation: repPhrasesInterp,
      explanation:
        repPhrasesDiff < 0
          ? '구문 반복 빈도가 낮아졌습니다.'
          : '구문 반복 패턴이 유지되었습니다.',
    },
  ];
}

/**
 * Evaluates whether previous coaching checklist items were applied in the retry transcript.
 * Only uses verifiable local heuristics (connectors, word occurrences, metric shifts).
 * Items that cannot be definitively proven locally are marked 'not-confirmed' (never 'failed').
 */
export function compareChecklists(
  checklistItems: string[],
  retryTranscript: string,
  metricChanges: MetricChange[]
): ChecklistResult[] {
  if (!checklistItems || checklistItems.length === 0) return [];

  const safeText = (retryTranscript || '').toLowerCase();
  const fillerRateChange = metricChanges.find((m) => m.metric === 'filler-rate');
  const durationChange = metricChanges.find((m) => m.metric === 'recording-duration');

  return checklistItems.map((instruction, idx) => {
    const lowerInstr = instruction.toLowerCase();

    // 1. Example check
    if (lowerInstr.includes('예시') || lowerInstr.includes('example') || lowerInstr.includes('사례')) {
      const hasExampleMarkers =
        safeText.includes('for example') ||
        safeText.includes('for instance') ||
        safeText.includes('such as') ||
        safeText.includes('recently') ||
        safeText.includes('in my case') ||
        safeText.includes('in my experience');

      if (hasExampleMarkers) {
        return {
          id: `chk-${idx}`,
          instruction,
          status: 'likely-applied',
          evidence: 'for example / for instance / such as 등 예시 표현 감지',
          explanation: '답변 내에 구체적 사례를 제시하는 전환 어구가 포함되었습니다.',
        };
      }
    }

    // 2. Reason / Cause check
    if (lowerInstr.includes('이유') || lowerInstr.includes('reason') || lowerInstr.includes('원인')) {
      const hasReasonMarkers =
        safeText.includes('because') ||
        safeText.includes('since') ||
        safeText.includes('due to') ||
        safeText.includes('the reason is');

      if (hasReasonMarkers) {
        return {
          id: `chk-${idx}`,
          instruction,
          status: 'likely-applied',
          evidence: 'because / since / due to 등 인과 연결어 감지',
          explanation: '주장에 대한 근거와 원인을 뒷받침하는 연결사가 확인되었습니다.',
        };
      }
    }

    // 3. Result / Conclusion check
    if (
      lowerInstr.includes('결과') ||
      lowerInstr.includes('result') ||
      lowerInstr.includes('마무리') ||
      lowerInstr.includes('결론')
    ) {
      const hasResultMarkers =
        safeText.includes('as a result') ||
        safeText.includes('therefore') ||
        safeText.includes('overall') ||
        safeText.includes('in conclusion') ||
        safeText.includes('helped me') ||
        safeText.includes('leads to');

      if (hasResultMarkers) {
        return {
          id: `chk-${idx}`,
          instruction,
          status: 'likely-applied',
          evidence: 'as a result / overall / therefore 등 결론 연결어 감지',
          explanation: '답변을 매듭짓는 귀결 또는 마무리 표현이 사용되었습니다.',
        };
      }
    }

    // 4. Filler reduction check
    if (
      lowerInstr.includes('filler') ||
      lowerInstr.includes('음') ||
      lowerInstr.includes('어') ||
      lowerInstr.includes('침묵')
    ) {
      if (fillerRateChange && fillerRateChange.interpretation === 'improved') {
        return {
          id: `chk-${idx}`,
          instruction,
          status: 'likely-applied',
          evidence: `Filler 비율 ${fillerRateChange.previousValue}개 → ${fillerRateChange.currentValue}개`,
          explanation: '100단어당 filler 표현 발생 비율이 객관적으로 감소했습니다.',
        };
      }
    }

    // 5. Length or detail check
    if (
      lowerInstr.includes('길이') ||
      lowerInstr.includes('충분') ||
      lowerInstr.includes('분량') ||
      lowerInstr.includes('구체적')
    ) {
      if (durationChange && durationChange.interpretation === 'improved') {
        return {
          id: `chk-${idx}`,
          instruction,
          status: 'likely-applied',
          evidence: `발화 시간 ${durationChange.previousValue}초 → ${durationChange.currentValue}초`,
          explanation: '답변 시간이 적정 범위로 늘어나 설명이 보강되었습니다.',
        };
      }
    }

    // Default: Local heuristic cannot prove semantic quality
    return {
      id: `chk-${idx}`,
      instruction,
      status: 'not-confirmed',
      explanation: '내용 맥락과 논리 전개는 녹음 청취를 통해 자가 점검해 보세요.',
    };
  });
}

/**
 * Generate a concise, factual summary of the comparison without hype.
 */
export function generateComparisonSummary(
  metricChanges: MetricChange[],
  checklistResults: ChecklistResult[],
  baseAttempt: PracticeAttempt,
  retryAttempt: PracticeAttempt
): ComparisonSummary {
  const improvedAreas: string[] = [];
  const maintainedStrengths: string[] = [];
  const areasToContinue: string[] = [];

  // 1. Metric Improvements
  const durationChange = metricChanges.find((m) => m.metric === 'recording-duration');
  if (durationChange && durationChange.interpretation === 'improved') {
    improvedAreas.push(
      `답변 시간이 ${durationChange.previousValue}초에서 ${durationChange.currentValue}초로 조정되어 안정적으로 설명했습니다.`
    );
  }

  const fillerChange = metricChanges.find((m) => m.metric === 'filler-rate');
  if (fillerChange && fillerChange.interpretation === 'improved') {
    improvedAreas.push(
      `100단어당 Filler 발생 빈도가 ${fillerChange.previousValue}개에서 ${fillerChange.currentValue}개로 감소했습니다.`
    );
  }

  const wpmChange = metricChanges.find((m) => m.metric === 'words-per-minute');
  if (wpmChange && wpmChange.interpretation === 'improved') {
    improvedAreas.push(
      `발화 속도가 ${wpmChange.currentValue} WPM으로 목표 연습 범위(110~149 WPM)에 가깝게 유지되었습니다.`
    );
  }

  const uniqueChange = metricChanges.find((m) => m.metric === 'unique-words');
  if (uniqueChange && uniqueChange.interpretation === 'improved') {
    improvedAreas.push(`새로운 고유 어휘가 ${uniqueChange.absoluteChange}단어 추가되었습니다.`);
  }

  // 2. Checklist items applied
  const appliedChecklist = checklistResults.filter((c) => c.status === 'likely-applied');
  appliedChecklist.forEach((item) => {
    improvedAreas.push(`체크리스트 반영: "${item.instruction}"`);
  });

  // 3. Maintained Strengths
  if (wpmChange && wpmChange.currentValue >= 105 && wpmChange.currentValue <= 150) {
    maintainedStrengths.push('자연스러운 발화 호흡과 템포가 두 답변 모두에서 안정적이었습니다.');
  }
  if (retryAttempt.metrics.totalWords >= 40 && baseAttempt.metrics.totalWords >= 40) {
    maintainedStrengths.push('질문에 대해 주어-동사를 갖춘 완전한 문장 구조를 일관되게 유지했습니다.');
  }

  // 4. Areas to continue practicing
  if (retryAttempt.metrics.totalFillerCount >= 4) {
    areasToContinue.push(
      '답변 중간 단어를 떠올릴 때 filler word 대신 1초간 자연스러운 호흡(Pause)을 두는 연습을 권장합니다.'
    );
  }
  if (retryAttempt.metrics.repeatedWords && retryAttempt.metrics.repeatedWords.length > 0) {
    const topRepeated = retryAttempt.metrics.repeatedWords[0];
    areasToContinue.push(
      `"${topRepeated.word}"(이)가 ${topRepeated.count}회 반복되었습니다. 유사한 동의어로 대체해 보세요.`
    );
  }
  if (retryAttempt.recordingDurationSeconds < 35) {
    areasToContinue.push('구체적인 경험이나 수치를 1문장 더 덧붙여 45초 이상 발화하는 연습을 해보세요.');
  }

  // Fallbacks if empty
  if (improvedAreas.length === 0) {
    improvedAreas.push('두 번째 시도를 통해 동일 질문에 대해 즉각적인 말하기를 반복 훈련했습니다.');
  }
  if (maintainedStrengths.length === 0) {
    maintainedStrengths.push('제한시간 내에 질문의 핵심 요지에 답변을 완료했습니다.');
  }
  if (areasToContinue.length === 0) {
    areasToContinue.push('현재의 안정된 구조를 유지하며 다른 카테고리의 질문에도 도전해 보세요.');
  }

  const recommendedNextAction =
    areasToContinue.length > 0
      ? areasToContinue[0]
      : '다음 질문으로 넘어가 다양한 주제에 대한 즉각적 문장 구사를 연습해 보세요.';

  return {
    improvedAreas: improvedAreas.slice(0, 4),
    maintainedStrengths: maintainedStrengths.slice(0, 3),
    areasToContinue: areasToContinue.slice(0, 3),
    recommendedNextAction,
  };
}

/**
 * Creates a comprehensive AttemptComparison between two attempts in a session.
 */
export function createAttemptComparison(
  baseAttempt: PracticeAttempt,
  retryAttempt: PracticeAttempt
): AttemptComparison {
  const metricChanges = compareMetrics(baseAttempt, retryAttempt);
  const transcriptChanges = compareTranscripts(
    baseAttempt.editedTranscript || baseAttempt.originalTranscript,
    retryAttempt.editedTranscript || retryAttempt.originalTranscript
  );

  // Extract previous checklist items if present in baseAttempt's coaching or retryContext
  const rawCtx = retryAttempt.retryContext as any;
  let checklistItems: string[] = [];
  if (Array.isArray(rawCtx?.checklistItems)) {
    checklistItems = rawCtx.checklistItems;
  } else if (Array.isArray(rawCtx?.checklist)) {
    checklistItems = rawCtx.checklist.map((c: any) => (typeof c === 'string' ? c : c.instruction));
  } else if (baseAttempt.aiCoaching?.result?.retryChecklist) {
    checklistItems = baseAttempt.aiCoaching.result.retryChecklist.map((i) => i.instruction);
  }

  const checklistResults = compareChecklists(
    checklistItems,
    retryAttempt.editedTranscript || retryAttempt.originalTranscript,
    metricChanges
  );

  const summary = generateComparisonSummary(
    metricChanges,
    checklistResults,
    baseAttempt,
    retryAttempt
  );

  return {
    sessionId: retryAttempt.sessionId || baseAttempt.sessionId || 'session-compare',
    baseAttemptId: baseAttempt.id,
    comparedAttemptId: retryAttempt.id,
    generatedAt: new Date().toISOString(),
    metricChanges,
    transcriptChanges,
    checklistResults,
    summary,
  };
}

/**
 * Pure function: Interprets the pedagogical impact of an individual metric change.
 */
export function interpretMetricChange(
  metric: MetricType,
  previousValue: number,
  currentValue: number
): { interpretation: MetricInterpretation; explanation: string } {
  const diff = currentValue - previousValue;
  switch (metric) {
    case 'recording-duration':
      if (Math.abs(diff) <= 3) {
        return { interpretation: 'neutral', explanation: '답변 시간이 이전 시도와 유사하게 유지되었습니다.' };
      }
      if (previousValue < 30 && currentValue >= 40 && currentValue <= 95) {
        return { interpretation: 'improved', explanation: '답변 시간이 늘어나 이유와 구체적 설명이 보강되었습니다.' };
      }
      if (currentValue > 115) {
        return { interpretation: 'needs-review', explanation: '답변 제한시간에 가까워져 후반부 핵심 정리가 급해질 수 있습니다.' };
      }
      if (currentValue < 25 && previousValue >= 35) {
        return { interpretation: 'needs-review', explanation: '답변 분량이 다소 줄어들어 구체적인 설명 보강을 권장합니다.' };
      }
      return { interpretation: diff > 3 ? 'improved' : 'neutral', explanation: '답변 시간이 충분히 확보되어 풍성하게 발화했습니다.' };

    case 'total-words':
      if (Math.abs(diff) <= 5) {
        return { interpretation: 'neutral', explanation: '발화 단어 수가 이전과 비슷한 수준입니다.' };
      }
      if (previousValue < 35 && currentValue >= 45) {
        return { interpretation: 'improved', explanation: '단어 수가 증가하여 풍부한 문장 구성으로 발전했습니다.' };
      }
      if (diff > 10) {
        return { interpretation: 'improved', explanation: '발화량이 증가하여 더 많은 디테일을 전달했습니다.' };
      }
      if (diff < -15) {
        return { interpretation: 'needs-review', explanation: '발화 단어 수가 감소하여 내용이 다소 축약되었습니다.' };
      }
      return { interpretation: 'neutral', explanation: '단어 수가 적정 범위를 유지하고 있습니다.' };

    case 'words-per-minute':
      if (Math.abs(diff) <= 5) {
        return { interpretation: 'neutral', explanation: '발화 속도가 안정적인 페이스를 유지하고 있습니다.' };
      }
      if (currentValue >= 110 && currentValue <= 149) {
        return {
          interpretation: 'improved',
          explanation:
            previousValue < 110 || previousValue > 150
              ? '일반적인 영어 말하기 목표 범위(110~149 WPM)에 원활하게 진입했습니다.'
              : '자연스럽고 편안한 발화 속도를 유지하고 있습니다.',
        };
      }
      if (currentValue > 160) {
        return { interpretation: 'needs-review', explanation: '말하는 속도가 매우 빨라져 발음 명료도와 호흡 조절 점검이 필요합니다.' };
      }
      if (currentValue < 90) {
        return { interpretation: 'needs-review', explanation: '단어 간 쉼이 길어질 수 있어 문장 단위 연결 연습을 권장합니다.' };
      }
      if (previousValue < 100 && currentValue > previousValue) {
        return { interpretation: 'improved', explanation: '발화 템포가 한층 더 자연스럽게 개선되었습니다.' };
      }
      return { interpretation: 'neutral', explanation: '발화 속도에 적절한 페이스를 유지하고 있습니다.' };

    case 'filler-rate':
      if (Math.abs(diff) <= 0.5) {
        return { interpretation: 'neutral', explanation: 'Filler(음..., 어...) 표현 비율에 큰 변화가 없습니다.' };
      }
      if (diff < -0.5) {
        return { interpretation: 'improved', explanation: `100단어당 filler 표현 비율이 ${safeRound(previousValue)}개에서 ${safeRound(currentValue)}개로 감소했습니다.` };
      }
      if (diff > 1.2) {
        return { interpretation: 'needs-review', explanation: 'filler 표현 비율이 다소 증가하여 침묵을 두는 연습을 권장합니다.' };
      }
      return { interpretation: 'neutral', explanation: 'filler 사용량이 안정적인 수준입니다.' };

    case 'unique-words':
      if (diff >= 5) {
        return { interpretation: 'improved', explanation: '새로운 어휘가 추가되어 표현이 다양해졌습니다.' };
      }
      if (diff <= -6) {
        return { interpretation: 'needs-review', explanation: '사용된 고유 어휘 수가 다소 감소했습니다.' };
      }
      return { interpretation: 'neutral', explanation: '어휘 풀이 이전과 유사합니다.' };

    case 'lexical-diversity':
      if (Math.abs(diff) <= 0.03) {
        return { interpretation: 'neutral', explanation: '어휘 다양성 비율이 비슷하게 유지되었습니다.' };
      }
      if (diff > 0.03) {
        return { interpretation: 'improved', explanation: '전체 단어 대비 고유 어휘 비율이 향상되었습니다.' };
      }
      return { interpretation: 'needs-review', explanation: '반복 어휘 사용 빈도가 다소 증가했습니다.' };

    case 'repeated-words':
      if (diff < 0) {
        return { interpretation: 'improved', explanation: '과도한 단어 반복이 줄었습니다.' };
      }
      if (diff > 1) {
        return { interpretation: 'needs-review', explanation: '동일 단어의 연속 사용이 늘어났습니다.' };
      }
      return { interpretation: 'neutral', explanation: '단어 반복 횟수가 비슷하게 유지되었습니다.' };

    case 'repeated-phrases':
      if (diff < 0) {
        return { interpretation: 'improved', explanation: '구문 반복 빈도가 낮아졌습니다.' };
      }
      if (diff > 1) {
        return { interpretation: 'needs-review', explanation: '동일 구문이 반복 사용되었습니다.' };
      }
      return { interpretation: 'neutral', explanation: '구문 반복 패턴이 유지되었습니다.' };

    default:
      return { interpretation: 'neutral', explanation: '지표 변화를 확인했습니다.' };
  }
}

export const evaluateRetryChecklist = compareChecklists;

