import { describe, it, expect, beforeEach } from 'vitest';
import { useFilterStore } from '../src/stores/filterStore';

describe('flow machine', () => {
  beforeEach(() => {
    const s = useFilterStore.getState();
    s.setStage(0);
    s.clearCompare();
  });

  it('blocks illegal edges', () => {
    const s = useFilterStore.getState();
    s.continueTo(3); // 0 -> 3 not allowed
    expect(useFilterStore.getState().stage).toBe(0);
    s.continueTo(1);
    expect(useFilterStore.getState().stage).toBe(1);
    s.continueTo(3); // 1 -> 3 not allowed
    expect(useFilterStore.getState().stage).toBe(1);
  });

  it('allows entering compare (3) but blocks report (4) until 2+ selections', () => {
    const s = useFilterStore.getState();
    s.continueTo(1); // 0->1
    s.continueTo(2); // 1->2
    s.continueTo(3); // 2->3 allowed even with 0 selected
    expect(useFilterStore.getState().stage).toBe(3);
    // report is blocked until 2+ selections
    s.continueTo(4); // 3->4 blocked, 0 selected
    expect(useFilterStore.getState().stage).toBe(3);
    // make selections
    useFilterStore.setState({ compareList: ['a','b'] });
    s.continueTo(4);
    expect(useFilterStore.getState().stage).toBe(4);
  });
});


