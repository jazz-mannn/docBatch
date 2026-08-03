import { describe, expect, it } from 'vitest';
import { hasSeenTutorial, markTutorialSeen, resetTutorialState } from '../src/lib/onboarding';

function createMemoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe('tutorial state', () => {
  it('identifies a new visitor before completion', () => {
    const storage = createMemoryStorage();
    expect(hasSeenTutorial(storage)).toBe(false);
  });

  it('remembers completion and can be reset', () => {
    const storage = createMemoryStorage();
    markTutorialSeen(storage);
    expect(hasSeenTutorial(storage)).toBe(true);
    resetTutorialState(storage);
    expect(hasSeenTutorial(storage)).toBe(false);
  });
});
