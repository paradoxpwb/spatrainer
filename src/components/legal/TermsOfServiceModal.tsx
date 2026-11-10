/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, FileText, AlertTriangle, BookCheck } from 'lucide-react';

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 id="terms-modal-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
                서비스 이용약관 (Terms of Service)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">최종 개정일: 2026년 11월 9일</p>
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
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              제 1 조 (목적 및 정의)
            </h3>
            <p>
              본 약관은 SPA Speaking Trainer(이하 '서비스')가 제공하는 영어 말하기 훈련 인터페이스 및 관련 부가 서비스의 이용 조건 및 절차, 이용자와 서비스 제공자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section className="space-y-2 bg-amber-50/70 dark:bg-amber-950/30 p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/40">
            <h3 className="text-sm font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>제 2 조 (비공식 연습 도구 명시 및 공식 시험과의 독립성)</span>
            </h3>
            <p className="text-amber-900 dark:text-amber-300">
              본 서비스는 현대자동차그룹 또는 공식 SPA(Speaking Proficiency Assessment) 주관기관과 어떠한 공식적인 제휴나 협력 관계도 없는 <strong>비공식 자가 학습 웹 애플리케이션</strong>입니다.
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-amber-900/90 dark:text-amber-300/90 mt-1">
              <li>제공되는 문제 은행은 실제 기출문제가 아니며, 일반적인 비즈니스 및 일상 영어 회화 능력 향상을 위해 자체 연구·제작된 문항입니다.</li>
              <li>발화 지표(WPM, 어휘 다양성, 휴지기 비율 등) 및 AI 코칭 피드백은 공식 시험의 채점 점수나 등급을 대변하거나 보증하지 않습니다.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <BookCheck className="w-4 h-4 text-indigo-600" />
              <span>제 3 조 (서비스의 제공 및 지식재산권)</span>
            </h3>
            <p>
              1. 서비스에서 제공하는 UI/UX 디자인, 타이머 로직, 분석 알고리즘, 자체 제작 문제 데이터 및 해설 가이드의 저작권은 서비스 제작자에게 있습니다.
            </p>
            <p>
              2. 이용자는 서비스를 개인적인 영어 말하기 학습 목적으로 자유롭게 무료 이용할 수 있으며, 서비스의 콘텐츠를 상업적으로 무단 복제, 배포, 크롤링하는 행위는 금지됩니다.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              제 4 조 (면책조항)
            </h3>
            <p>
              1. 서비스는 브라우저 기술(음성 합성, 음성 녹음 API)의 지원 여부 및 이용자의 마이크 장치 환경에 따라 기능의 동작 차이가 발생할 수 있으며, 이로 인한 불이익에 대해 책임을 지지 않습니다.
            </p>
            <p>
              2. 이용자가 브라우저 캐시 또는 로컬 스토리지를 삭제함으로써 소실되는 학습 기록에 대해서는 서비스가 복구 책임을 부담하지 않습니다.
            </p>
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
