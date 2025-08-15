import React from 'react';
import { useFilterStore } from '../stores/filterStore';
import type { FilterMode } from '../components/ui/FilterModeSwitch';

type Metric = 'price' | 'weight' | 'distortion' | 'breathing';

export function useFilterMode(metric?: Metric) {
  const state = useFilterStore();
  return React.useMemo(() => {
    if (!metric) return null as null | { value: FilterMode; onChange: (m: FilterMode) => void; disabled: boolean };
    if (metric === 'price') {
      const enable = state.enablePrice; const soft = state.softPrice;
      return { value: (enable ? (soft ? 'preferred' : 'required') : 'off') as FilterMode, onChange: (m: FilterMode) => { const s = useFilterStore.getState(); if (m === 'off') s.setEnablePrice(false); else { s.setEnablePrice(true); s.setSoftPrice(m === 'preferred'); } }, disabled: !enable };
    }
    if (metric === 'weight') {
      const enable = state.enableWeight; const soft = state.softWeight;
      return { value: (enable ? (soft ? 'preferred' : 'required') : 'off') as FilterMode, onChange: (m: FilterMode) => { const s = useFilterStore.getState(); if (m === 'off') s.setEnableWeight(false); else { s.setEnableWeight(true); s.setSoftWeight(m === 'preferred'); } }, disabled: !enable };
    }
    if (metric === 'distortion') {
      const enable = state.enableDistortion; const soft = state.softDistortion;
      return { value: (enable ? (soft ? 'preferred' : 'required') : 'off') as FilterMode, onChange: (m: FilterMode) => { const s = useFilterStore.getState(); if (m === 'off') s.setEnableDistortion(false); else { s.setEnableDistortion(true); s.setSoftDistortion(m === 'preferred'); } }, disabled: !enable };
    }
    if (metric === 'breathing') {
      const enable = state.enableBreathing; const soft = state.softBreathing;
      return { value: (enable ? (soft ? 'preferred' : 'required') : 'off') as FilterMode, onChange: (m: FilterMode) => { const s = useFilterStore.getState(); if (m === 'off') s.setEnableBreathing(false); else { s.setEnableBreathing(true); s.setSoftBreathing(m === 'preferred'); } }, disabled: !enable };
    }
    return null;
  }, [state, metric]);
}


