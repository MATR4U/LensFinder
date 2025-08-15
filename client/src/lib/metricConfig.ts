import { useFilterStore } from '../stores/filterStore';
import { ticksFromBounds, tickFormatterFromUnit } from './formatters';

export type Metric = 'price' | 'weight' | 'distortion' | 'breathing' | 'focal';

export function useMetricConfig(metric: Metric) {
  const s = useFilterStore();
  if (metric === 'price') {
    const bounds = s.availabilityCaps?.priceBounds ?? { min: 0, max: 10000 };
    return {
      value: s.priceRange,
      set: s.setPriceRange,
      enable: s.enablePrice,
      soft: s.softPrice,
      ticks: s.availabilityCaps?.priceTicks ?? ticksFromBounds(bounds.min, bounds.max),
      bounds,
      step: 50,
      unit: 'CHF' as const,
      tickFormatter: tickFormatterFromUnit('CHF'),
    };
  }
  if (metric === 'weight') {
    const bounds = s.availabilityCaps?.weightBounds ?? { min: 0, max: 5000 };
    return {
      value: s.weightRange,
      set: s.setWeightRange,
      enable: s.enableWeight,
      soft: s.softWeight,
      ticks: s.availabilityCaps?.weightTicks ?? ticksFromBounds(bounds.min, bounds.max),
      bounds,
      step: 10,
      unit: 'g' as const,
      tickFormatter: tickFormatterFromUnit('g'),
    };
  }
  if (metric === 'distortion') {
    const bounds = { min: 0, max: s.availabilityCaps?.distortionMaxMax ?? 10 };
    return {
      value: { min: 0, max: s.proDistortionMaxPct },
      set: (r: { min: number; max: number }) => s.setProDistortionMaxPct(r.max),
      enable: s.enableDistortion,
      soft: s.softDistortion,
      ticks: ticksFromBounds(bounds.min, bounds.max),
      bounds,
      step: 0.1,
      unit: '%' as const,
      tickFormatter: tickFormatterFromUnit('%'),
    };
  }
  if (metric === 'breathing') {
    const bounds = { min: s.availabilityCaps?.breathingMinMin ?? 0, max: 10 };
    return {
      value: { min: s.proBreathingMinScore, max: 10 },
      set: (r: { min: number; max: number }) => s.setProBreathingMinScore(r.min),
      enable: s.enableBreathing,
      soft: s.softBreathing,
      ticks: ticksFromBounds(bounds.min, bounds.max),
      bounds,
      step: 0.5,
      unit: undefined,
      tickFormatter: tickFormatterFromUnit('mm'),
    };
  }
  // focal
  const bounds = s.availabilityCaps?.focalBounds ?? { min: 8, max: 1200 };
  return {
    value: { min: s.proFocalMin, max: s.proFocalMax },
    set: (r: { min: number; max: number }) => { s.setProFocalMin(r.min); s.setProFocalMax(r.max); },
    enable: true,
    soft: false,
    ticks: s.availabilityCaps?.focalTicks ?? ticksFromBounds(bounds.min, bounds.max),
    bounds,
    step: 1,
    unit: 'mm' as const,
    tickFormatter: tickFormatterFromUnit('mm'),
  };
}


