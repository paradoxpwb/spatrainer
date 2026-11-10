import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadPurchaseIntents,
  savePurchaseIntents,
  recordPurchaseIntent,
  PURCHASE_INTENTS_STORAGE_KEY,
  MAX_STORED_INTENTS,
} from './purchaseIntentStorage';
import { PurchaseIntent } from '../types/monetization';

const memoryStore: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => memoryStore[key] || null,
  setItem: (key: string, value: string) => {
    memoryStore[key] = value;
  },
  removeItem: (key: string) => {
    delete memoryStore[key];
  },
  clear: () => {
    for (const key of Object.keys(memoryStore)) {
      delete memoryStore[key];
    }
  },
};

if (typeof (globalThis as any).window === 'undefined') {
  (globalThis as any).window = globalThis;
}
(globalThis as any).window.localStorage = mockLocalStorage;
(globalThis as any).localStorage = mockLocalStorage;

describe('purchaseIntentStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads empty array when storage is empty', () => {
    expect(loadPurchaseIntents()).toEqual([]);
  });

  it('records a purchase intent with valid fields', () => {
    const intent = recordPurchaseIntent({
      planId: 'pass_7d',
      planName: '7일 집중 패스',
      priceKRW: 5900,
      source: 'home_hero_card',
      formattedDDay: 'D-14',
    });

    expect(intent).not.toBeNull();
    expect(intent?.planId).toBe('pass_7d');
    expect(intent?.priceKrw).toBe(5900);
    expect(intent?.source).toBe('home_hero_card');
    expect(intent?.createdAt).toBeDefined();

    const stored = loadPurchaseIntents();
    expect(stored).toHaveLength(1);
    expect(stored[0].planId).toBe('pass_7d');
  });

  it('deduplicates rapid consecutive clicks on the same plan (<2000ms)', () => {
    const first = recordPurchaseIntent({
      planId: 'mock_single',
      planName: '1회권',
      priceKRW: 2900,
      source: 'paywall_modal',
    });
    expect(first).not.toBeNull();

    // Immediate second click
    const second = recordPurchaseIntent({
      planId: 'mock_single',
      planName: '1회권',
      priceKRW: 2900,
      source: 'paywall_modal',
    });
    expect(second).toBeNull(); // Deduplicated!

    const stored = loadPurchaseIntents();
    expect(stored).toHaveLength(1);
  });

  it('enforces maximum 50-item cap (FIFO truncate)', () => {
    const items: PurchaseIntent[] = [];
    for (let i = 0; i < 60; i++) {
      items.push({
        schemaVersion: 1,
        id: `intent-${i}`,
        planId: 'pro_monthly',
        planName: 'SPA Trainer Pro',
        priceKrw: 12900,
        priceKRW: 12900,
        source: 'paywall_modal',
        createdAt: new Date(2026, 0, 1, 0, i).toISOString(),
        recordedAt: new Date(2026, 0, 1, 0, i).toISOString(),
        daysUntilExam: null,
        targetLevel: 'not-sure',
      });
    }

    savePurchaseIntents(items);
    const loaded = loadPurchaseIntents();
    expect(loaded.length).toBe(MAX_STORED_INTENTS);
    expect(loaded.length).toBe(50);
    // Should preserve the latest 50 items (index 10 to 59)
    expect(loaded[0].id).toBe('intent-10');
    expect(loaded[49].id).toBe('intent-59');
  });

  it('guarantees zero PII in recorded intent structure', () => {
    const intent = recordPurchaseIntent({
      planId: 'pass_7d',
      planName: '7일 집중 패스',
      priceKRW: 5900,
      source: 'home_hero_card',
    });

    const keys = Object.keys(intent || {});
    expect(keys).not.toContain('email');
    expect(keys).not.toContain('phone');
    expect(keys).not.toContain('name');
    expect(keys).not.toContain('creditCard');
    expect(keys).not.toContain('paymentToken');
  });

  it('handles corrupted localStorage JSON gracefully', () => {
    localStorage.setItem(PURCHASE_INTENTS_STORAGE_KEY, '{invalid json');
    expect(loadPurchaseIntents()).toEqual([]);
  });
});
