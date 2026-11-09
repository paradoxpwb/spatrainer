import { describe, expect, it } from 'vitest';
import { calculateSpeakingMetrics } from './speakingMetrics';
import { tokenizeWords } from './transcriptUtils';

describe('speakingMetrics calculation', () => {
  it('A. counts words accurately', () => {
    const input = 'I work in customer service.';
    const metrics = calculateSpeakingMetrics(input, 10);
    expect(metrics.totalWords).toBe(5);
  });

  it('B. handles English contractions without splitting into multiple broken tokens', () => {
    const input = "I'm happy because we've completed the project and don't regret it.";
    const tokens = tokenizeWords(input);
    expect(tokens).toContain("I'm");
    expect(tokens).toContain("we've");
    expect(tokens).toContain("don't");
  });

  it('C. safely returns zero metrics for empty transcript', () => {
    const metrics = calculateSpeakingMetrics('', 30);
    expect(metrics.totalWords).toBe(0);
    expect(metrics.wordsPerMinute).toBe(0);
    expect(metrics.totalFillerCount).toBe(0);
    expect(metrics.sentenceCount).toBe(0);
    expect(metrics.lexicalDiversity).toBe(0);
  });

  it('D. calculates WPM accurately based on duration and word count', () => {
    // 120 words in 60 seconds = 120 WPM
    const words = Array(120).fill('word').join(' ');
    const metrics = calculateSpeakingMetrics(words, 60);
    expect(metrics.wordsPerMinute).toBe(120);
  });

  it('E. prevents division by zero, NaN, or Infinity on 0 duration', () => {
    const input = 'This is a test answer with thirty words that should never crash the math computation.';
    const metrics = calculateSpeakingMetrics(input, 0);
    expect(metrics.wordsPerMinute).toBe(0);
    expect(Number.isFinite(metrics.wordsPerMinute)).toBe(true);
    expect(Number.isNaN(metrics.wordsPerMinute)).toBe(false);
  });

  it('F. detects single and multi-word filler expressions', () => {
    const input = 'Um, I mean, it was a difficult situation, you know.';
    const metrics = calculateSpeakingMetrics(input, 15);
    expect(metrics.fillerCounts['um']).toBe(1);
    expect(metrics.fillerCounts['i mean']).toBe(1);
    expect(metrics.fillerCounts['you know']).toBe(1);
    expect(metrics.totalFillerCount).toBe(3);
  });

  it('G. prevents multi-word filler collision from double-counting single words', () => {
    const input = 'I mean what I mean is very clear.';
    const metrics = calculateSpeakingMetrics(input, 10);
    // Should detect multi fillers without false positive single filler 'mean'
    expect(metrics.fillerCounts['what i mean is'] || metrics.fillerCounts['i mean']).toBeGreaterThan(0);
    expect(metrics.fillerCounts['mean']).toBeUndefined();
  });

  it('H. detects repeated meaningful words while ignoring stop words', () => {
    const input =
      'The customer said the service was important because the customer needed better customer service.';
    const metrics = calculateSpeakingMetrics(input, 30);
    const customer = metrics.repeatedWords.find((w) => w.word === 'customer');
    expect(customer).toBeDefined();
    expect(customer?.count).toBe(3);
  });

  it('I. detects repeated phrases (n-grams)', () => {
    const input = 'Customer service is critical. Excellent customer service builds lasting trust.';
    const metrics = calculateSpeakingMetrics(input, 25);
    const phrase = metrics.repeatedPhrases.find((p) => p.phrase === 'customer service');
    expect(phrase).toBeDefined();
    expect(phrase?.count).toBe(2);
  });
});
