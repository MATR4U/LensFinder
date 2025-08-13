import { describe, it, expect } from 'vitest';
import { useFilterStore } from '../src/stores/filterStore';

describe('Negative tests (expected to fail)', () => {
  it.fails('Beginner mode should still be true after switching to Pro (intentional)', () => {
    const s = useFilterStore.getState();
    s.setIsPro(true);
    expect(useFilterStore.getState().isPro).toBe(false);
  });

  it.fails('Compare list should include a non-existent item after toggle (intentional)', () => {
    const s = useFilterStore.getState();
    s.toggleCompare('non-existent');
    expect(useFilterStore.getState().compareList.includes('non-existent')).toBe(false);
  });
});


