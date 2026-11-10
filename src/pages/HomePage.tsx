import React from 'react';
import { Play, BookOpen, Clock, Mic, ShieldAlert, Award, Calendar, Sparkles, Compass } from 'lucide-react';
import { PracticeAttempt } from '../types/practiceAttempt';
import { RecentPracticeList } from '../components/RecentPracticeList';
import { DailyStudyMinutes, PaywallSource, TargetSpaLevel } from '../types/monetization';
import { PracticeAreaDefinition } from '../types/question';
import { DailyLimitBadge } from '../components/monetization/DailyLimitBadge';

interface HomePageProps {
  onStartPractice: () => void;
  onNavigateProgress?: () => void;
  onNavigateHistory?: () => void;
  onNavigateGuide?: () => void;
  onNavigateMockExam?: () => void;
  history?: PracticeAttempt[];
  onClearHistory?: () => void;
  onSelectAttempt?: (attempt: PracticeAttempt) => void;
  formattedDDay?: string;
  targetLevel?: TargetSpaLevel;
  dailyStudyMinutes?: DailyStudyMinutes;
  recommendedArea?: PracticeAreaDefinition;
  remainingPracticeCount?: number;
  practiceLimit?: number;
  remainingAiFeedbackCount?: number;
  aiFeedbackLimit?: number;
  onOpenOnboarding?: () => void;
  onOpenPaywall?: (source: PaywallSource) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onStartPractice,
  onNavigateProgress,
  onNavigateHistory,
  onNavigateGuide,
  onNavigateMockExam,
  history = [],
  onClearHistory,
  onSelectAttempt,
  formattedDDay,
  targetLevel,
  dailyStudyMinutes,
  recommendedArea,
  remainingPracticeCount = 3,
  practiceLimit = 3,
  remainingAiFeedbackCount = 1,
  aiFeedbackLimit = 1,
  onOpenOnboarding,
  onOpenPaywall,
}) => {
  return (
    <div className="py-8 sm:py-12 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Hero Section */}
      <div className="text-center space-y-5">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 dark:text-slate-50 tracking-tight text-balance">
          SPA Speaking Trainer
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed text-balance">
          질문을 듣고, 제한시간 안에 답하며 영어 말하기를 연습하세요.
        </p>

        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          질문을 받고, 제한시간 안에 영어로 답하고, 자신의 녹음을 다시 들어보며 객관적인 지표로 반복 연습합니다.
        </p>

        <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onStartPractice}
            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base rounded-xl shadow-sm hover:shadow transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 min-h-[48px] min-w-[180px]"
          >
            <Play className="w-5 h-5 fill-current" aria-hidden="true" />
            <span>연습 시작하기</span>
          </button>

          {onNavigateMockExam && (
            <button
              type="button"
              onClick={onNavigateMockExam}
              className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-base rounded-xl shadow-sm hover:shadow transition-all min-h-[48px]"
            >
              <Award className="w-5 h-5" aria-hidden="true" />
              <span>실전 모의고사 (Full-Set)</span>
            </button>
          )}

          {onNavigateGuide && (
            <button
              type="button"
              onClick={onNavigateGuide}
              className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold text-base rounded-xl shadow-xs transition-colors min-h-[48px]"
            >
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>시험 가이드</span>
            </button>
          )}

          {onNavigateProgress && (
            <button
              type="button"
              onClick={onNavigateProgress}
              className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold text-base rounded-xl shadow-xs transition-colors min-h-[48px]"
            >
              <span>성장 대시보드</span>
            </button>
          )}

          {onNavigateHistory && (
            <button
              type="button"
              onClick={onNavigateHistory}
              className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold text-base rounded-xl shadow-xs transition-colors min-h-[48px]"
            >
              <span>연습 기록</span>
            </button>
          )}
        </div>
      </div>

      {/* Sprint 1: D-Day & Daily Target & Usage Banner */}
      <div className="mt-8 bg-linear-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 dark:from-slate-900/90 dark:via-indigo-950/30 dark:to-slate-900 border border-blue-200/80 dark:border-indigo-900/50 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white text-xs font-extrabold rounded-full shadow-xs">
                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{formattedDDay || '시험일 설정'}</span>
              </span>
              {targetLevel && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-lg border border-indigo-200/60 dark:border-indigo-800">
                  <Sparkles className="w-3 h-3 text-indigo-500" aria-hidden="true" />
                  <span>
                    목표:{' '}
                    {targetLevel === 'level-3'
                      ? 'Level 3'
                      : targetLevel === 'level-4'
                      ? 'Level 4'
                      : targetLevel === 'level-5'
                      ? 'Level 5'
                      : targetLevel === 'level-6-plus'
                      ? 'Level 6+'
                      : '미정'}
                  </span>
                </span>
              )}
              {dailyStudyMinutes && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg">
                  <Clock className="w-3 h-3 text-slate-400" aria-hidden="true" />
                  <span>일일 {dailyStudyMinutes}분 목표</span>
                </span>
              )}
              {onOpenOnboarding && (
                <button
                  type="button"
                  onClick={onOpenOnboarding}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium underline underline-offset-2 ml-1"
                >
                  목표 변경
                </button>
              )}
            </div>

            {recommendedArea && (
              <div className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">오늘의 추천 집중 영역:</span>{' '}
                  <span className="text-blue-700 dark:text-blue-300 font-bold">{recommendedArea.labelKo}</span> —{' '}
                  <span className="text-slate-500 dark:text-slate-400">{recommendedArea.description}</span>
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <DailyLimitBadge
              remainingPracticeCount={remainingPracticeCount}
              practiceLimit={practiceLimit}
              remainingAiFeedbackCount={remainingAiFeedbackCount}
              aiFeedbackLimit={aiFeedbackLimit}
              variant="compact"
              onUpgradeClick={onOpenPaywall ? () => onOpenPaywall('home_limit_badge') : undefined}
            />

            {onOpenPaywall && (
              <button
                type="button"
                onClick={() => onOpenPaywall('home_hero_card')}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 rounded-lg transition-colors"
              >
                <span>요금제 보기</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3 Secondary Information Cards */}
      <div className="mt-12 sm:mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
              다양한 주제의 영어 질문
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              일상 회화부터 비즈니스 꼬리 질문, 청취 지문 요약 및 도표 분석까지 5개 영역 64개 자체 제작 문항을 제공합니다.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 font-medium">
            5개 실전 영역 · 64문항 수록
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
              실제 시험처럼 시간 제공
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              준비시간(15초~45초)과 답변시간(60초~120초)을 설정하여 실전 감각을 기르고 시간 조절 능력을 훈련합니다.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 font-medium">
            타이머 자동 연동 및 실시간 확인
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-4">
              <Mic className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
              녹음 청취 및 지표 분석
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              답변 종료 후 즉시 자신의 발화를 직접 듣고, Transcript와 WPM, 필러 표현, 반복 어휘 등 객관적 지표를 점검합니다.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 font-medium">
            Transcript 수정 및 실시간 지표 재계산
          </div>
        </div>
      </div>

      {/* Practice Steps Overview */}
      <div className="mt-12 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-7">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
          연습 진행 순서
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-start gap-2.5">
            <span className="font-mono font-bold text-blue-600 text-sm">01</span>
            <div>
              <strong className="block font-semibold text-slate-900 dark:text-slate-100">영역 및 주제 선택</strong>
              <span>연습하고 싶은 영역과 시간 옵션 설정</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="font-mono font-bold text-blue-600 text-sm">02</span>
            <div>
              <strong className="block font-semibold text-slate-900 dark:text-slate-100">문제 확인</strong>
              <span>랜덤으로 제시되는 영어 질문 파악</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="font-mono font-bold text-blue-600 text-sm">03</span>
            <div>
              <strong className="block font-semibold text-slate-900 dark:text-slate-100">준비 및 녹음</strong>
              <span>준비 타이머 후 자동으로 마이크 녹음 시작</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="font-mono font-bold text-blue-600 text-sm">04</span>
            <div>
              <strong className="block font-semibold text-slate-900 dark:text-slate-100">분석 및 점검</strong>
              <span>Transcript 확인, WPM 및 말하기 지표 분석</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Practice History Section (Sprint 2) */}
      <div className="mt-12">
        <RecentPracticeList
          history={history}
          onClearHistory={onClearHistory}
          onSelectAttempt={onSelectAttempt}
        />
      </div>

      {/* Disclaimer Section */}
      <div className="mt-10 p-4 sm:p-5 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/70 dark:bg-amber-950/30 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
          <strong className="font-semibold block mb-0.5">안내 및 주의 문구</strong>
          <span>본 서비스는 공식 SPA 시험 서비스가 아닌 비공식 연습 도구입니다.</span>
          <span className="block mt-1 text-amber-800 dark:text-amber-300">
            실제 시험 기출 문항을 무단 복제하지 않으며, 영어 말하기 자가 훈련을 위해 제작된 일반 비즈니스 및 일상 회화 연습용 질문을 제공합니다. 제공되는 지표는 객관적 발화 데이터 분석값이며 공식 SPA 등급이나 점수가 아닙니다.
          </span>
        </div>
      </div>
    </div>
  );
};
