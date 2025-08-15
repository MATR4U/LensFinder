import React from 'react';
import { useFilterStore } from '../stores/filterStore';

export function useLastChangedDiff() {
  const getLabel = React.useCallback((): string | undefined => {
    const anyState = useFilterStore.getState() as unknown as Record<string, any>;
    const hist: any[] = (anyState['__history__'] as any[]) || [];
    if (hist.length === 0) return undefined;
    const prev = hist[hist.length - 1];
    const cur = useFilterStore.getState();
    const diffs: Array<{ k: string; label: string; detail: string }> = [];
    const fmtRange = (r: { min: number; max: number }, unit?: string) => `${r.min}${unit ? ' ' + unit : ''}–${r.max}${unit ? ' ' + unit : ''}`;
    if (prev.priceRange.min !== cur.priceRange.min || prev.priceRange.max !== cur.priceRange.max) diffs.push({ k: 'priceRange', label: 'Price range', detail: `CHF ${fmtRange(cur.priceRange)}` });
    if (prev.weightRange.min !== cur.weightRange.min || prev.weightRange.max !== cur.weightRange.max) diffs.push({ k: 'weightRange', label: 'Weight range', detail: fmtRange(cur.weightRange, 'g') });
    if (prev.proFocalMin !== cur.proFocalMin || prev.proFocalMax !== cur.proFocalMax) diffs.push({ k: 'focalRange', label: 'Focal range', detail: `${cur.proFocalMin}–${cur.proFocalMax} mm` });
    if (prev.proMaxApertureF !== cur.proMaxApertureF) diffs.push({ k: 'aperture', label: 'Max aperture', detail: `f/${cur.proMaxApertureF.toFixed(1)}` });
    if (prev.proDistortionMaxPct !== cur.proDistortionMaxPct) diffs.push({ k: 'distortion', label: 'Distortion max', detail: `${cur.proDistortionMaxPct.toFixed(1)}%` });
    if (prev.proBreathingMinScore !== cur.proBreathingMinScore) diffs.push({ k: 'breathing', label: 'Breathing min score', detail: cur.proBreathingMinScore.toFixed(1) });
    if (prev.proRequireOIS !== cur.proRequireOIS) diffs.push({ k: 'ois', label: 'Require OIS', detail: cur.proRequireOIS ? 'On' : 'Off' });
    if (prev.sealed !== cur.sealed) diffs.push({ k: 'sealed', label: 'Weather sealed', detail: cur.sealed ? 'On' : 'Off' });
    if (prev.isMacro !== cur.isMacro) diffs.push({ k: 'macro', label: 'Macro capable', detail: cur.isMacro ? 'On' : 'Off' });
    const last = diffs[diffs.length - 1];
    return last?.label;
  }, []);

  const getDetail = React.useCallback((): string | undefined => {
    const anyState = useFilterStore.getState() as unknown as Record<string, any>;
    const hist: any[] = (anyState['__history__'] as any[]) || [];
    if (hist.length === 0) return undefined;
    const prev = hist[hist.length - 1];
    const cur = useFilterStore.getState();
    const diffs: Array<{ k: string; label: string; detail: string }> = [];
    const fmtRange = (r: { min: number; max: number }, unit?: string) => `${r.min}${unit ? ' ' + unit : ''}–${r.max}${unit ? ' ' + unit : ''}`;
    if (prev.priceRange.min !== cur.priceRange.min || prev.priceRange.max !== cur.priceRange.max) diffs.push({ k: 'priceRange', label: 'Price range', detail: `CHF ${fmtRange(cur.priceRange)}` });
    if (prev.weightRange.min !== cur.weightRange.min || prev.weightRange.max !== cur.weightRange.max) diffs.push({ k: 'weightRange', label: 'Weight range', detail: fmtRange(cur.weightRange, 'g') });
    if (prev.proFocalMin !== cur.proFocalMin || prev.proFocalMax !== cur.proFocalMax) diffs.push({ k: 'focalRange', label: 'Focal range', detail: `${cur.proFocalMin}–${cur.proFocalMax} mm` });
    if (prev.proMaxApertureF !== cur.proMaxApertureF) diffs.push({ k: 'aperture', label: 'Max aperture', detail: `f/${cur.proMaxApertureF.toFixed(1)}` });
    if (prev.proDistortionMaxPct !== cur.proDistortionMaxPct) diffs.push({ k: 'distortion', label: 'Distortion max', detail: `${cur.proDistortionMaxPct.toFixed(1)}%` });
    if (prev.proBreathingMinScore !== cur.proBreathingMinScore) diffs.push({ k: 'breathing', label: 'Breathing min score', detail: cur.proBreathingMinScore.toFixed(1) });
    if (prev.proRequireOIS !== cur.proRequireOIS) diffs.push({ k: 'ois', label: 'Require OIS', detail: cur.proRequireOIS ? 'On' : 'Off' });
    if (prev.sealed !== cur.sealed) diffs.push({ k: 'sealed', label: 'Weather sealed', detail: cur.sealed ? 'On' : 'Off' });
    if (prev.isMacro !== cur.isMacro) diffs.push({ k: 'macro', label: 'Macro capable', detail: cur.isMacro ? 'On' : 'Off' });
    const last = diffs[diffs.length - 1];
    return last?.detail;
  }, []);

  return { getLabel, getDetail } as const;
}


