import React from 'react';
import { SpeakingMetrics } from '../types/metrics';
import { MetricCard } from './MetricCard';
import { formatDurationLabel } from '../utils/timeUtils';
import { getResponseLengthDescription } from '../utils/speakingMetrics';
import { Clock, MessageSquare, Gauge, Sparkles, AlertCircle } from 'lucide-react';

interface MetricsSummaryProps {
  metrics: SpeakingMetrics;
}

export const MetricsSummary: React.FC<MetricsSummaryProps> = ({ metrics }) => {
  // WPM descriptive speed text
  let wpmSpeedDesc = '측정 불가';
  if (metrics.wordsPerMinute > 0) {
    if (metrics.wordsPerMinute < 80) wpmSpeedDesc = '천천히 말한 편 (0~79 WPM)';
    else if (metrics.wordsPerMinute <= 109) wpmSpeedDesc = '비교적 여유 있는 속도 (80~109 WPM)';
    else if (metrics.wordsPerMinute <= 149) wpmSpeedDesc = '일반적인 연습 범위 (110~149 WPM)';
    else wpmSpeedDesc = '빠른 편, 명료도 확인 필요 (150+ WPM)';
  } else if (metrics.totalWords === 0) {
    wpmSpeedDesc = 'Transcript 없음';
  } else if (metrics.recordingDurationSeconds === 0) {
    wpmSpeedDesc = '녹음시간 0초';
  }

  const lexicalDiversityPercent = `${Math.round(metrics.lexicalDiversity * 100)}%`;
  const responseLengthText = getResponseLengthDescription(metrics.responseLengthStatus);

  return (
    <div className="space-y-6">
      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          label="Speaking Time"
          value={formatDurationLabel(metrics.recordingDurationSeconds)}
          subValue="실제 발화 시간"
          description="MediaRecorder로 측정된 실제 음성 녹음 시간입니다."
        />

        <MetricCard
          label="Total Words"
          value={metrics.totalWords}
          unit="words"
          subValue={`고유 어휘: ${metrics.uniqueWordCount}`}
          description="Transcript에서 추출된 전체 유효 영단어 수입니다."
        />

        <MetricCard
          label="Words per Minute"
          value={metrics.wordsPerMinute > 0 ? metrics.wordsPerMinute : (metrics.totalWords === 0 ? '-' : '0')}
          unit="WPM"
          subValue={wpmSpeedDesc.split(' ')[0]}
          description="분당 발화 속도(WPM)입니다. 일반 권장 범위는 110~149 WPM입니다."
          highlight
        />

        <MetricCard
          label="Filler Candidates"
          value={metrics.totalFillerCount}
          unit="회"
          subValue={`100단어당 ${metrics.fillerRatePer100Words}회`}
          description="um, uh, you know 등 잠재적 채움 표현의 총합입니다."
        />
      </div>

      {/* Mandatory WPM Guidance Disclaimer */}
      <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-xl text-xs text-slate-600">
        <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
        <span>
          말하기 속도와 WPM은 참고 지표이며 <strong>공식 SPA 평가 기준이나 점수가 아닙니다.</strong>
        </span>
      </div>

      {/* Secondary Metrics & Vocabulary Diversity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Sentence Metrics */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">
            문장 구성 지표
          </span>
          <div className="flex items-baseline gap-4 my-2">
            <div>
              <span className="text-xs text-slate-400 block">추정 문장 수</span>
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {metrics.sentenceCount}
              </span>
              <span className="text-xs text-slate-500 ml-1">문장</span>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <span className="text-xs text-slate-400 block">문장당 평균 단어</span>
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {metrics.averageWordsPerSentence}
              </span>
              <span className="text-xs text-slate-500 ml-1">단어</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            문장 수는 음성 인식 결과의 구두점을 기준으로 계산된 참고값입니다.
          </p>
        </div>

        {/* Lexical Diversity */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">
            어휘 다양성 (Lexical Diversity)
          </span>
          <div className="flex items-baseline gap-4 my-2">
            <div>
              <span className="text-xs text-slate-400 block">고유 단어 수</span>
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {metrics.uniqueWordCount}
              </span>
              <span className="text-xs text-slate-500 ml-1">개</span>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <span className="text-xs text-slate-400 block">다양성 비율</span>
              <span className="text-2xl font-bold font-mono text-blue-700 tabular-nums">
                {lexicalDiversityPercent}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            서로 다른 단어가 사용된 비율입니다. 답변이 짧으면 수치가 크게 달라질 수 있습니다.
          </p>
        </div>
      </div>

      {/* Response Length Guidance */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            답변 길이 피드백
          </span>
          <span
            className={`text-xs font-bold px-2.5 py-0.5 rounded-md inline-block w-fit ${
              metrics.responseLengthStatus === 'balanced'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : metrics.responseLengthStatus === 'short'
                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            {metrics.responseLengthStatus === 'very-short' && '매우 짧음 (0~14초)'}
            {metrics.responseLengthStatus === 'short' && '다소 짧음 (15~29초)'}
            {metrics.responseLengthStatus === 'balanced' && '적절한 길이 (30~90초)'}
            {metrics.responseLengthStatus === 'long' && '긴 답변 (91초 이상)'}
          </span>
        </div>
        <p className="text-sm font-medium text-slate-800 leading-relaxed">
          {responseLengthText}
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          ※ 학습 편의를 위한 권장 참고 기준이며 공식 시험 점수와는 무관합니다.
        </p>
      </div>
    </div>
  );
};
