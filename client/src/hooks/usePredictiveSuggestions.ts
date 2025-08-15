import React from 'react';
import { applyFilters } from '../lib/filters';
import { useFilterStore } from '../stores/filterStore';
import type { Lens, Camera } from '../types';

export function usePredictiveSuggestions(args: { lenses: Lens[]; camera?: Camera; cameraName: string | undefined }) {
  const state = useFilterStore();
  return React.useMemo(() => {
    const caps = state.availabilityCaps;
    const { lenses, camera, cameraName } = args;
    if (!caps || lenses.length === 0) return null as null | Record<string, { count: number; apply: () => void; label: string }>;
    const base = {
      brand: state.brand, lensType: state.lensType, sealed: state.sealed, isMacro: state.isMacro,
      priceRange: state.priceRange, weightRange: state.weightRange,
      proCoverage: state.proCoverage,
      proFocalMin: state.proFocalMin, proFocalMax: state.proFocalMax,
      proMaxApertureF: state.proMaxApertureF,
      proRequireOIS: state.proRequireOIS,
      proRequireSealed: state.sealed,
      proRequireMacro: state.isMacro,
      proPriceMax: state.priceRange.max,
      proWeightMax: state.weightRange.max,
      proDistortionMaxPct: state.proDistortionMaxPct,
      proBreathingMinScore: state.proBreathingMinScore,
    } as const;
    const countWith = (over: Partial<typeof base>) => applyFilters({ lenses, cameraName: cameraName ?? 'Any', cameraMount: camera?.mount, ...base, ...over }).length;
    const suggestions: Record<string, { count: number; apply: () => void; label: string }> = {};
    suggestions.priceRange = { count: countWith({ priceRange: { ...caps.priceBounds } }), apply: () => useFilterStore.getState().setPriceRange({ ...caps.priceBounds }), label: `CHF ${caps.priceBounds.min}–${caps.priceBounds.max}` };
    suggestions.weightRange = { count: countWith({ weightRange: { ...caps.weightBounds } }), apply: () => useFilterStore.getState().setWeightRange({ ...caps.weightBounds }), label: `${caps.weightBounds.min}–${caps.weightBounds.max} g` };
    suggestions.focalRange = { count: countWith({ proFocalMin: caps.focalBounds.min, proFocalMax: caps.focalBounds.max }), apply: () => { const s = useFilterStore.getState(); s.setProFocalMin(caps.focalBounds.min); s.setProFocalMax(caps.focalBounds.max); }, label: `${caps.focalBounds.min}–${caps.focalBounds.max} mm` };
    suggestions.aperture = { count: countWith({ proMaxApertureF: caps.apertureMaxMax }), apply: () => useFilterStore.getState().setProMaxApertureF(caps.apertureMaxMax), label: `f/${caps.apertureMaxMax.toFixed(1)}` };
    suggestions.distortion = { count: countWith({ proDistortionMaxPct: caps.distortionMaxMax }), apply: () => useFilterStore.getState().setProDistortionMaxPct(caps.distortionMaxMax), label: `${caps.distortionMaxMax.toFixed(1)}%` };
    suggestions.breathing = { count: countWith({ proBreathingMinScore: caps.breathingMinMin }), apply: () => useFilterStore.getState().setProBreathingMinScore(caps.breathingMinMin), label: `${caps.breathingMinMin.toFixed(1)}` };
    return suggestions;
  }, [state, args.lenses, args.camera, args.cameraName]);
}


