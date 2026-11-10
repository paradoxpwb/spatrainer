/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Sparkles, Target, Compass, Award, Mail, Heart } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 id="about-modal-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
                SPA Speaking Trainer 소개
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">데이터 기반 영어 말하기 자가 훈련 프로젝트</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-blue-600" />
              <span>프로젝트의 출발점: "녹음하고 직접 들어보는 진짜 말하기 훈련"</span>
            </h3>
            <p>
              많은 학습자들이 영어 말하기 시험을 준비할 때 모범 답안을 눈으로 읽거나 외우는 데 많은 시간을 소비하지만,
              정작 <strong>실전 제한시간 내에 질문을 듣고 즉시 자신의 목소리로 말해보는 연습</strong>은 충분히 하지 못합니다.
            </p>
            <p>
              SPA Speaking Trainer는 이러한 학습 격차를 해소하고자 탄생한 비공식 자가 훈련 웹 애플리케이션입니다.
              사용자가 실제 시험과 동일한 시간 압박 속에서 발화하고, 자신의 목소리를 객관적으로 모니터링하며,
              WPM과 반복 어휘 등 지표를 통해 개선점을 발견할 수 있도록 돕습니다.
            </p>
          </section>

          <section className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>핵심 학습 3단계 루프 (Feedback & Retry)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <strong className="block text-indigo-600 dark:text-indigo-400 font-bold mb-1">1. 실전 압박 발화</strong>
                <span>타이머에 맞춰 즉시 답변을 녹음하고 발화 완료</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <strong className="block text-indigo-600 dark:text-indigo-400 font-bold mb-1">2. 객관적 데이터 분석</strong>
                <span>WPM, 멈칫 비율, 반복 어휘, 텍스트 전사 정밀 점검</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <strong className="block text-indigo-600 dark:text-indigo-400 font-bold mb-1">3. 동일 문항 재도전</strong>
                <span>체크리스트를 적용하여 1차와 2차 답변의 변화 비교</span>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-600" />
              <span>독창적인 5개 영역 및 64개 자체 문항 체계</span>
            </h3>
            <p>
              본 서비스는 기출문제를 유출하거나 복제하지 않습니다. 국제 비즈니스 현장에서 요구되는 핵심 역량과
              시험 유형을 분석하여, 일상 회화부터 비즈니스 후속 질문, 논리적 의견 확장, 청취 지문 요약, 시각 자료 분석에 이르는
              5대 영역의 독자적인 훈련 문항을 자체 개발하여 제공합니다.
            </p>
          </section>

          <section className="space-y-2 p-3.5 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200/50 dark:border-blue-900/30">
            <h3 className="text-sm font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-blue-600" />
              <span>문의 및 사용자 제안</span>
            </h3>
            <p className="text-xs text-blue-900/90 dark:text-blue-300">
              문제 피드백, 기능 제안, 오류 신고 등 모든 문의를 환영합니다.
              사용자 여러분의 소중한 피드백으로 지속적으로 더 나은 훈련 도구를 만들어갑니다.
            </p>
            <div className="text-xs font-mono font-semibold text-blue-800 dark:text-blue-300 mt-1">
              Contact: support@spatrainer.app
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition-colors"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
