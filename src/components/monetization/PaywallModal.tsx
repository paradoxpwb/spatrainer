/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Check, X, ShieldAlert, Sparkles, Award, Zap, CheckCircle2 } from 'lucide-react';
import {
  MONETIZATION_PLANS,
  MonetizationPlan,
  MonetizationPlanId,
  PaywallSource,
  TargetSpaLevel,
} from '../../types/monetization';
import { recordPurchaseIntent } from '../../utils/purchaseIntentStorage';
import { trackMonetizationEvent, viewEventDeduplicator } from '../../utils/analyticsEvents';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: PaywallSource;
  daysUntilExam?: number | null;
  targetLevel?: TargetSpaLevel;
  formattedDDay?: string;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  source,
  daysUntilExam = null,
  targetLevel = 'not-sure',
  formattedDDay,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<MonetizationPlanId>('pass_7d');
  const [recordedConfirmation, setRecordedConfirmation] = useState<boolean>(false);

  const modalRef = useRef<HTMLDivElement | null>(null);
  const triggerElementRef = useRef<Element | null>(null);

  // Focus restoration & view tracking
  useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = document.activeElement;
      setRecordedConfirmation(false);
      setSelectedPlanId('pass_7d');

      // Track view event safely
      viewEventDeduplicator.triggerOnce(`paywall_${source}`, 'paywall_view', {
        paywallSource: source,
        daysUntilExam,
        targetLevel,
      });
    } else {
      viewEventDeduplicator.reset(`paywall_${source}`);
      if (triggerElementRef.current instanceof HTMLElement) {
        triggerElementRef.current.focus();
      }
    }
  }, [isOpen, source, daysUntilExam, targetLevel]);

  // Trap focus & Handle Escape & Lock scroll
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCloseModal();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Initial focus on modal
    const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable && focusable.length > 0) {
      focusable[0].focus();
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCloseModal = () => {
    trackMonetizationEvent('paywall_close', {
      paywallSource: source,
      plan: selectedPlanId,
    });
    onClose();
  };

  const handleSelectPlan = (plan: MonetizationPlan) => {
    setSelectedPlanId(plan.id);
    setRecordedConfirmation(false);

    trackMonetizationEvent('plan_select', {
      plan: plan.id,
      price: plan.priceKrw,
      paywallSource: source,
    });
  };

  const handleRegisterPurchaseIntent = () => {
    const plan = MONETIZATION_PLANS.find((p) => p.id === selectedPlanId);
    if (!plan) return;

    recordPurchaseIntent({
      planId: plan.id,
      priceKrw: plan.priceKrw,
      source,
      daysUntilExam,
      targetLevel,
    });

    trackMonetizationEvent('purchase_intent_click', {
      plan: plan.id,
      price: plan.priceKrw,
      paywallSource: source,
      daysUntilExam,
      targetLevel,
    });

    setRecordedConfirmation(true);
  };

  const selectedPlan = MONETIZATION_PLANS.find((p) => p.id === selectedPlanId) || MONETIZATION_PLANS[1];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-title"
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 my-auto space-y-6 text-slate-900 dark:text-slate-100 transition-all max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>실전 시험 목표 달성 플랜</span>
            </div>
            <h2 id="paywall-title" className="text-xl sm:text-2xl font-extrabold tracking-tight">
              SPA Speaking Trainer 프리미엄 플랜
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              실전 감각을 극대화하는 모의고사와 맞춤형 심층 분석을 준비하고 있습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCloseModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clear Soft-Paywall / Preference Survey Notice */}
        <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-900/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-bold block mb-0.5">사전 선호도 조사 안내</strong>
            <span>
              현재 결제 기능을 준비 중입니다. 아래 선택은 결제가 아닌 상품 선호도 조사에 사용됩니다.
            </span>
          </div>
        </div>

        {/* 3 Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MONETIZATION_PLANS.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => handleSelectPlan(plan)}
                className={`relative flex flex-col justify-between p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-600 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                {plan.recommended && (
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white shadow-xs">
                    추천 1위
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      {plan.nameKo}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    )}
                  </div>

                  <div className="mt-2 mb-3">
                    <span className="text-xl font-black text-slate-950 dark:text-slate-50 font-mono">
                      ₩{plan.priceKrw.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {plan.billingType === 'one_time'
                        ? '1회 응시'
                        : plan.billingType === 'seven_day'
                        ? '7일간 무제한'
                        : '월 정기 구독'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 leading-snug">
                    {plan.descriptionKo}
                  </p>
                </div>

                <ul className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-300">
                  {plan.benefitsKo.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {/* Selected Plan Action & Confirmation */}
        <div className="space-y-3 pt-2">
          {recordedConfirmation ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-bold">
                관심 상품이 기록되었습니다. 실제 결제는 진행되지 않았습니다.
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleRegisterPurchaseIntent}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm shadow-sm hover:shadow transition-all"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>
                "{selectedPlan.nameKo}" (₩{selectedPlan.priceKrw.toLocaleString()}) 출시 알림 받기
              </span>
            </button>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>개인정보(이메일/전화번호) 수집 없이 브라우저에만 기록됩니다.</span>
            <button
              type="button"
              onClick={handleCloseModal}
              className="font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
