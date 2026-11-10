import { describe, it, expect, beforeEach } from 'vitest';
import {
  trackCustomEvent,
  trackDDaySavedEvent,
  trackPaywallViewedEvent,
  trackPurchaseIntentEvent,
  viewEventDeduplicator,
} from './analyticsEvents';

if (typeof (globalThis as any).window === 'undefined') {
  (globalThis as any).window = globalThis;
}

describe('analyticsEvents', () => {
  beforeEach(() => {
    (globalThis as any).window.dataLayer = [];
    viewEventDeduplicator.clear();
  });

  it('initializes window.dataLayer if undefined and pushes custom events', () => {
    delete (window as any).dataLayer;
    trackCustomEvent('test_event', { foo: 'bar', count: 42 });

    expect((window as any).dataLayer).toBeDefined();
    expect((window as any).dataLayer.length).toBe(1);
    expect((window as any).dataLayer[0].event).toBe('test_event');
    expect((window as any).dataLayer[0].foo).toBe('bar');
    expect((window as any).dataLayer[0].count).toBe(42);
  });

  it('sanitizes and strips non-primitive or unsafe properties', () => {
    trackCustomEvent('sanitized_event', {
      validStr: 'ok',
      validNum: 10,
      validBool: true,
      validNull: null,
      invalidFn: () => {},
      invalidObj: { nested: 'bad' },
    });

    const payload = (window as any).dataLayer[0];
    expect(payload.validStr).toBe('ok');
    expect(payload.validNum).toBe(10);
    expect(payload.validBool).toBe(true);
    expect(payload.validNull).toBeNull();
    expect(payload.invalidFn).toBeUndefined();
    expect(payload.invalidObj).toBeUndefined();
  });

  it('tracks D-Day saved event with targetLevel and formattedDDay', () => {
    trackDDaySavedEvent({
      targetLevel: 'level-4',
      daysUntilExam: 14,
      formattedDDay: 'D-14',
      dailyStudyMinutes: 20,
      isUndecided: false,
    });

    const payload = (window as any).dataLayer[0];
    expect(payload.event).toBe('spa_dday_saved');
    expect(payload.target_level).toBe('level-4');
    expect(payload.days_until_exam).toBe(14);
    expect(payload.formatted_dday).toBe('D-14');
    expect(payload.daily_study_minutes).toBe(20);
    expect(payload.is_undecided).toBe(false);
  });

  it('tracks paywall viewed event and suppresses duplicate views within cooldown', () => {
    trackPaywallViewedEvent({
      source: 'home_hero_card',
      formattedDDay: 'D-10',
    });
    expect((window as any).dataLayer.length).toBe(1);
    expect((window as any).dataLayer[0].event).toBe('spa_paywall_viewed');

    // Immediate duplicate view from same source should be deduplicated
    trackPaywallViewedEvent({
      source: 'home_hero_card',
      formattedDDay: 'D-10',
    });
    expect((window as any).dataLayer.length).toBe(1);

    // View from another source should succeed
    trackPaywallViewedEvent({
      source: 'progress_limit_badge',
      formattedDDay: 'D-10',
    });
    expect((window as any).dataLayer.length).toBe(2);
  });

  it('tracks purchase intent event without PII', () => {
    trackPurchaseIntentEvent({
      planId: 'pass_7d',
      planName: '7일 집중 패스',
      priceKRW: 5900,
      source: 'home_limit_badge',
      formattedDDay: 'D-7',
    });

    const payload = (window as any).dataLayer[0];
    expect(payload.event).toBe('spa_purchase_intent_click');
    expect(payload.plan_id).toBe('pass_7d');
    expect(payload.plan_name).toBe('7일 집중 패스');
    expect(payload.price_krw).toBe(5900);
    expect(payload.source).toBe('home_limit_badge');
    expect(payload.formatted_dday).toBe('D-7');

    const keys = Object.keys(payload);
    expect(keys).not.toContain('email');
    expect(keys).not.toContain('phone');
    expect(keys).not.toContain('creditCard');
  });
});
