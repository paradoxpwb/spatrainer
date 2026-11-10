/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PaywallSource, TargetSpaLevel } from '../types/monetization';

// Safe TypeScript global declaration for GTM dataLayer
declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export type MonetizationAnalyticsEventName =
  | 'monetization_onboarding_view'
  | 'monetization_onboarding_complete'
  | 'exam_date_set'
  | 'target_level_set'
  | 'daily_limit_indicator_view'
  | 'paywall_view'
  | 'plan_select'
  | 'purchase_intent_click'
  | 'paywall_close';

export interface MonetizationEventProperties {
  plan?: string;
  price?: number;
  paywallSource?: PaywallSource | string;
  daysUntilExam?: number | null;
  targetLevel?: TargetSpaLevel | string;
  completedPractices?: number;
  remainingPractices?: number;
  remainingAiFeedback?: number;
}

// Strict allowlist for event properties - rejects any unapproved keys (no PII, transcripts, audio, email)
const ALLOWED_PROPERTIES = new Set<keyof MonetizationEventProperties>([
  'plan',
  'price',
  'paywallSource',
  'daysUntilExam',
  'targetLevel',
  'completedPractices',
  'remainingPractices',
  'remainingAiFeedback',
]);

/**
 * Sanitizes event properties to strictly adhere to the allowlist.
 */
function sanitizeProperties(
  props?: MonetizationEventProperties
): Record<string, unknown> {
  if (!props || typeof props !== 'object') return {};

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (ALLOWED_PROPERTIES.has(key as keyof MonetizationEventProperties) && value !== undefined) {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Pushes a sanitized monetization event to Google Tag Manager (dataLayer).
 */
export function trackMonetizationEvent(
  eventName: MonetizationAnalyticsEventName,
  properties?: MonetizationEventProperties
): void {
  const win = typeof window !== 'undefined' ? window : (globalThis as any).window;
  if (!win) return;

  const sanitizedPayload = {
    event: eventName,
    ...sanitizeProperties(properties),
    timestamp: Date.now(),
  };

  try {
    win.dataLayer = win.dataLayer || [];
    win.dataLayer.push(sanitizedPayload);
  } catch {
    // Graceful fallback if dataLayer is blocked
  }
}

/**
 * Deduplication helper for view events to prevent duplicate pushes on component re-renders.
 */
export class ViewEventDeduplicator {
  private firedKeys = new Set<string>();

  /**
   * Fires the event only once per unique key.
   */
  triggerOnce(
    key: string,
    eventName: MonetizationAnalyticsEventName,
    properties?: MonetizationEventProperties
  ): boolean {
    if (this.firedKeys.has(key)) {
      return false;
    }
    this.firedKeys.add(key);
    trackMonetizationEvent(eventName, properties);
    return true;
  }

  isFired(key: string): boolean {
    return this.firedKeys.has(key);
  }

  markFired(key: string): void {
    this.firedKeys.add(key);
  }

  /**
   * Resets the key (e.g. when a modal is explicitly closed and reopened later).
   */
  reset(key?: string): void {
    if (key) {
      this.firedKeys.delete(key);
    } else {
      this.firedKeys.clear();
    }
  }

  /**
   * Clears all fired keys (for tests).
   */
  clear(): void {
    this.firedKeys.clear();
  }
}

export const viewEventDeduplicator = new ViewEventDeduplicator();

export function trackCustomEvent(name: string, payload: Record<string, unknown>): void {
  const win = typeof window !== 'undefined' ? window : (globalThis as any).window;
  if (!win) return;
  win.dataLayer = win.dataLayer || [];
  const sanitized: Record<string, unknown> = { event: name };
  for (const [k, v] of Object.entries(payload)) {
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' || v === null) {
      sanitized[k] = v;
    }
  }
  win.dataLayer.push(sanitized);
}

export function trackDDaySavedEvent(params: {
  targetLevel: string;
  daysUntilExam: number | null;
  formattedDDay: string;
  dailyStudyMinutes: number;
  isUndecided: boolean;
}): void {
  trackCustomEvent('spa_dday_saved', {
    target_level: params.targetLevel,
    days_until_exam: params.daysUntilExam,
    formatted_dday: params.formattedDDay,
    daily_study_minutes: params.dailyStudyMinutes,
    is_undecided: params.isUndecided,
  });
}

export function trackPaywallViewedEvent(params: {
  source: string;
  formattedDDay?: string;
}): void {
  const key = `paywall-${params.source}`;
  if (!viewEventDeduplicator.isFired(key)) {
    viewEventDeduplicator.markFired(key);
    trackCustomEvent('spa_paywall_viewed', {
      source: params.source,
      formatted_dday: params.formattedDDay,
    });
  }
}

export function trackPurchaseIntentEvent(params: {
  planId: string;
  planName: string;
  priceKRW: number;
  source: string;
  formattedDDay?: string;
}): void {
  trackCustomEvent('spa_purchase_intent_click', {
    plan_id: params.planId,
    plan_name: params.planName,
    price_krw: params.priceKRW,
    source: params.source,
    formatted_dday: params.formattedDDay,
  });
}
