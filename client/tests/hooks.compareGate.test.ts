import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useCompareGate } from '../src/hooks/useCompareGate';
import { useFilterStore } from '../src/stores/filterStore';

describe('useCompareGate', () => {
  beforeEach(() => {
    useFilterStore.setState({ compareList: [] });
  });
  it('reports canCompare false for <2', () => {
    const { result } = renderHook(() => useCompareGate());
    expect(result.current.selectedCount).toBe(0);
    expect(result.current.canCompare).toBe(false);
  });
  it('reports canCompare true for >=2', () => {
    useFilterStore.setState({ compareList: ['x','y'] });
    const { result } = renderHook(() => useCompareGate());
    expect(result.current.selectedCount).toBe(2);
    expect(result.current.canCompare).toBe(true);
  });
});


