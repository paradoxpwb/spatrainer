import React from 'react';
import { Play, BookOpen, Clock, Mic, ShieldAlert } from 'lucide-react';
import { PracticeAttempt } from '../types/practiceAttempt';
import { RecentPracticeList } from '../components/RecentPracticeList';

interface HomePageProps {
  onStartPractice: () => void;
  onNavigateProgress?: () => void;
  onNavigateHistory?: () => void;
  history?: PracticeAttempt[];
  onClearHistory?: () => void;
  onSelectAttempt?: (attempt: PracticeAttempt) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onStartPractice,
  onNavigateProgress,
  onNavigateHistory,
  history = [],
  onClearHistory,
  onSelectAttempt,
}) => {
  return (
    <div className="py-8 sm:py-12 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Hero Section */}
      <div className="text-center space-y-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200/70 rounded-full text-blue-800 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-blue-600" />
          <span>현대자동차그룹 비공식 영어 말하기 연습 도구</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight text-balance">
          SPA Speaking Trainer
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed text-balance">
          질문을 듣고, 제한시간 안에 답하며 영어 말하기를 연습하세요.
        </p>

        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          질문을 받고, 제한시간 안에 영어로 답하고, 자신의 녹음을 다시 들어보며 객관적인 지표로 반복 연습합니다.
        </p>

        <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onStartPractice}
            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base rounded-xl shadow-sm hover:shadow transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 min-h-[48px] min-w-[200px]"
          >
            <Play className="w-5 h-5 fill-current" aria-hidden="true" />
            <span>연습 시작하기</span>
          </button>

          {onNavigateProgress && (
            <button
              type="button"
              onClick={onNavigateProgress}
              className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-base rounded-xl shadow-xs transition-colors min-h-[48px]"
            >
              <span>성장 대시보드</span>
            </button>
          )}

          {onNavigateHistory && (
            <button
              type="button"
              onClick={onNavigateHistory}
              className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-base rounded-xl shadow-xs transition-colors min-h-[48px]"
            >
              <span>연습 기록</span>
            </button>
          )}
        </div>
      </div>

      {/* 3 Secondary Information Cards */}
      <div className="mt-14 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mb-4">
              <BookOpen className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              다양한 주제의 영어 질문
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              자기소개, 일상생활, 직장생활, 경험, 문제 해결 등 8개 핵심 카테고리의 64개 자체 제작 문항을 제공합니다.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
            8개 카테고리 · 64문항 수록
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              실제 시험처럼 시간 제공
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              준비시간(15초~45초)과 답변시간(60초~120초)을 설정하여 실전 감각을 기르고 시간 조절 능력을 훈련합니다.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
            타이머 자동 연동 및 실시간 확인
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <Mic className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              녹음 청취 및 지표 분석
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              답변 종료 후 즉시 자신의 발화를 직접 듣고, Transcript와 WPM, 필러 표현, 반복 어휘 등 객관적 지표를 점검합니다.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
            Transcript 수정 및 실시간 지표 재계산
          </div>
        </div>
      </div>

      {/* Practice Steps Overview */}
      <div className="mt-12 bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-7">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
          연습 진행 순서
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs text-slate-700">
          <div className="flex items-start gap-2.5">
            <span className="font-mono font-bold text-blue-600 text-sm">01</span>
            <div>
              <strong className="block font-semibold text-slate-900">카테고리 선택</strong>
              <span>연습하고 싶은 주제와 시간 옵션 설정</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="font-mono font-bold text-blue-600 text-sm">02</span>
            <div>
              <strong className="block font-semibold text-slate-900">문제 확인</strong>
              <span>랜덤으로 제시되는 영어 질문 파악</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="font-mono font-bold text-blue-600 text-sm">03</span>
            <div>
              <strong className="block font-semibold text-slate-900">준비 및 녹음</strong>
              <span>준비 타이머 후 자동으로 마이크 녹음 시작</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="font-mono font-bold text-blue-600 text-sm">04</span>
            <div>
              <strong className="block font-semibold text-slate-900">분석 및 점검</strong>
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
      <div className="mt-10 p-4 sm:p-5 rounded-xl border border-amber-200 bg-amber-50/70 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong className="font-semibold block mb-0.5">안내 및 주의 문구</strong>
          <span>본 서비스는 공식 SPA 시험 서비스가 아닌 비공식 연습 도구입니다.</span>
          <span className="block mt-1 text-amber-800">
            실제 시험 기출 문항을 무단 복제하지 않으며, 영어 말하기 자가 훈련을 위해 제작된 일반 비즈니스 및 일상 회화 연습용 질문을 제공합니다. 제공되는 지표는 객관적 발화 데이터 분석값이며 공식 SPA 등급이나 점수가 아닙니다.
          </span>
        </div>
      </div>
    </div>
  );
};
