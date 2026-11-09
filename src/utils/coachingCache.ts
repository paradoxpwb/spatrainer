import { AICoachingResult } from '../types/coaching';

class CoachingCache {
  private cache = new Map<string, { result: AICoachingResult; timestamp: number }>();
  private readonly MAX_ENTRIES = 50;

  get(key: string): AICoachingResult | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    return entry.result;
  }

  set(key: string, result: AICoachingResult): void {
    if (this.cache.size >= this.MAX_ENTRIES) {
      // Evict oldest item
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(key, { result, timestamp: Date.now() });
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const coachingCache = new CoachingCache();
