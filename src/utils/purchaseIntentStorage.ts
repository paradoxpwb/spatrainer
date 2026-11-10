/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  MonetizationPlanId,
  PaywallSource,
  PurchaseIntent,
  STORAGE_KEY_PURCHASE_INTENTS,
  TargetSpaLevel,
} from '../types/monetization';

export const MAX_STORED_INTENTS = 50;
export const DEDUPLICATION_WINDOW_MS = 2000; // 2 seconds
export const PURCHASE_INTENTS_STORAGE_KEY = STORAGE_KEY_PURCHASE_INTENTS;

/**
 * Loads stored purchase intents from localStorage safely.
 * Gracefully handles missing or malformed JSON.
 */
export function loadPurchaseIntents(): PurchaseIntent[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_PURCHASE_INTENTS);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is PurchaseIntent =>
        item &&
        typeof item === 'object' &&
        (item.schemaVersion === 1 || item.schemaVersion === undefined) &&
        typeof item.id === 'string' &&
        typeof item.planId === 'string' &&
        (typeof item.priceKrw === 'number' || typeof (item as any).priceKRW === 'number')
    );
  } catch {
    return [];
  }
}

/**
 * Saves purchase intents to localStorage, preserving the latest 50 records.
 */
export function savePurchaseIntents(intents: PurchaseIntent[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    const capped = intents.length > MAX_STORED_INTENTS
      ? intents.slice(-MAX_STORED_INTENTS)
      : intents;
    localStorage.setItem(STORAGE_KEY_PURCHASE_INTENTS, JSON.stringify(capped));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Records a new purchase intent.
 * Deduplicates rapid double-clicks on the same plan and source within 2 seconds.
 * Returns the created PurchaseIntent if recorded, or null if deduplicated.
 */
export function recordPurchaseIntent(params: {
  planId: MonetizationPlanId;
  planName?: string;
  priceKrw?: number;
  priceKRW?: number;
  source: PaywallSource;
  daysUntilExam?: number | null;
  formattedDDay?: string;
  targetLevel?: TargetSpaLevel;
}): PurchaseIntent | null {
  const current = loadPurchaseIntents();
  const now = Date.now();

  // Deduplication check: same planId and source within last 2 seconds
  const isRapidDuplicate = current.some((item) => {
    if (item.planId === params.planId && item.source === params.source) {
      const itemTime = new Date(item.createdAt || (item as any).recordedAt).getTime();
      return now - itemTime < DEDUPLICATION_WINDOW_MS;
    }
    return false;
  });

  if (isRapidDuplicate) {
    return null;
  }

  const effectivePrice = params.priceKrw ?? params.priceKRW ?? 0;
  const isoTime = new Date().toISOString();

  const newIntent: PurchaseIntent & { priceKRW?: number; recordedAt?: string; planName?: string; formattedDDay?: string } = {
    schemaVersion: 1,
    id: `intent-${now}-${Math.random().toString(36).substring(2, 8)}`,
    planId: params.planId,
    priceKrw: effectivePrice,
    priceKRW: effectivePrice,
    source: params.source,
    createdAt: isoTime,
    recordedAt: isoTime,
    planName: params.planName,
    formattedDDay: params.formattedDDay,
    daysUntilExam: params.daysUntilExam ?? null,
    targetLevel: params.targetLevel ?? 'not-sure',
  };

  const updated = [...current, newIntent];
  savePurchaseIntents(updated);
  return newIntent;
}
