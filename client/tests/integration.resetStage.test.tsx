import { describe, it, expect, beforeEach } from 'vitest';
import { useFilterStore } from '../src/stores/filterStore';

describe('Reset keeps stage', () => {
  beforeEach(() => {
    const s = useFilterStore.getState();
    s.setStage(1);
    // simulate some changes
    useFilterStore.setState({ brand: 'Sigma', sealed: true });
    // capture baseline for stage 1
    s.captureStageBaseline(1);
    useFilterStore.setState({ brand: 'Sony', sealed: false });
  });
  it('resetToStageBaseline(1) does not change stage', () => {
    const s = useFilterStore.getState();
    const before = useFilterStore.getState().stage;
    s.resetToStageBaseline(1);
    const after = useFilterStore.getState().stage;
    expect(before).toBe(1);
    expect(after).toBe(1);
    // values reset
    expect(useFilterStore.getState().brand).not.toBe('Sony');
  });
});


