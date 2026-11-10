/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Shield, Lock, Cookie, Eye, Mail } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-policy-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 id="privacy-policy-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
                개인정보처리방침 (Privacy Policy)
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
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>1. 총칙 및 서비스 목적</span>
            </h3>
            <p>
              SPA Speaking Trainer(이하 '서비스')는 이용자의 개인정보 및 프라이버시를 매우 소중하게 생각하며,
              대한민국 개인정보 보호법 및 글로벌 데이터 보호 규정을 준수합니다. 본 방침은 서비스 이용 시 수집되는
              정보와 그 이용 목적, 관리 방식을 투명하게 안내합니다.
            </p>
          </section>

          <section className="space-y-2 bg-blue-50/60 dark:bg-blue-950/30 p-3.5 rounded-xl border border-blue-200/60 dark:border-blue-900/40">
            <h3 className="text-sm font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
              <Cookie className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>2. Google AdSense 및 쿠키(Cookie) 정책</span>
            </h3>
            <p className="text-blue-900 dark:text-blue-300">
              본 서비스는 지속적이고 무료인 양질의 교육 도구를 제공하기 위해 <strong>Google AdSense</strong> 광고를 게재합니다.
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-blue-900/90 dark:text-blue-300/90 mt-1.5">
              <li>
                Google을 포함한 제3자 제공업체는 쿠키를 사용하여 이용자의 이전 방문 기록(본 사이트 또는 타 웹사이트)을 바탕으로 광고를 게재합니다.
              </li>
              <li>
                Google의 광고 쿠키 사용을 통해 Google 및 파트너는 인터넷 사이트 방문 기록을 기반으로 적절한 맞춤형 광고를 제공할 수 있습니다.
              </li>
              <li>
                이용자는 언제든지 <strong>
                  <a
                    href="https://www.google.com/settings/ads"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-700 dark:text-blue-400 font-semibold hover:text-blue-800"
                  >
                    Google 광고 설정(Google Ads Settings)
                  </a>
                </strong> 페이지를 방문하여 맞춤형 광고 수신을 선택 해제(Opt-out)할 수 있습니다.
              </li>
              <li>
                또한 <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="underline text-blue-700 dark:text-blue-400 font-semibold">www.aboutads.info</a>를 방문하여 제3자 제공업체의 맞춤형 광고 쿠키 사용을 전반적으로 관리할 수 있습니다.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>3. 마이크 권한 및 음성 녹음 데이터 보호</span>
            </h3>
            <p>
              서비스는 말하기 연습 및 발화 지표(WPM, 휴지기 비율 등) 분석을 위해 이용자의 기기 마이크 접근 권한을 요청합니다.
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs mt-1">
              <li>
                <strong>로컬 처리 원칙:</strong> 녹음된 오디오 파일은 사용자의 웹 브라우저 메모리(Blob URL)에 일시적으로 유지되며, 사용자가 녹음을 다시 들어보기 위한 목적으로만 사용됩니다.
              </li>
              <li>
                음성 파일은 외부 서버에 영구적으로 수집·저장·판매되지 않으며, 브라우저 탭을 닫거나 새 연습을 시작할 때 메모리에서 즉시 해제(revokeObjectURL)됩니다.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-indigo-600" />
              <span>4. 브라우저 로컬 저장소(localStorage) 사용</span>
            </h3>
            <p>
              서비스는 별도의 회원가입이나 로그인 절차 없이도 사용자의 학습 기록을 보존하기 위해 기기 브라우저의 <code>localStorage</code>를 활용합니다.
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs mt-1">
              <li>저장 정보: 연습 시도 기록(PracticeAttempt), 세션 목록(PracticeSession), 설정값(준비시간/답변시간), 주간 목표 및 지표 통계.</li>
              <li>언제든지 서비스 내 '설정' 또는 '기록 초기화' 기능을 통해 저장된 모든 데이터를 즉시 영구 삭제할 수 있습니다.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-slate-500" />
              <span>5. 개인정보 관련 문의 및 피드백</span>
            </h3>
            <p>
              개인정보 보호와 관련된 질문, 의견 또는 개선 요청이 있으실 경우 아래의 지원 창구로 언제든지 연락해 주시기 바랍니다.
            </p>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-mono">
              이메일 문의: support@spatrainer.app / 운영 관리팀
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
