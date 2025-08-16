import { useEffect, useMemo, useRef } from 'react';
import type { Lens } from '../types';
import type { Availability } from '../lib/availability';
import { computeGlobalAvailability } from '../lib/availability';
import { useFilterStore } from '../stores/filterStore';

export function useAvailabilityCapsSync(lenses: Lens[]): Availability | null {
  const availability = useMemo<Availability | null>(() => {
    if (!Array.isArray(lenses) || lenses.length === 0) return null;
    return computeGlobalAvailability(lenses);
  }, [lenses]);

  const lastCapsSigRef = useRef<string | null>(null);
  useEffect(() => {
    if (!availability) return;
    const nextCaps = {
      brands: availability.brands,
      lensTypes: availability.lensTypes,
      coverage: availability.coverage,
      priceBounds: availability.priceBounds,
      priceTicks: availability.priceTicks,
      weightBounds: availability.weightBounds,
      weightTicks: availability.weightTicks,
      focalBounds: availability.focalBounds,
      apertureMaxMax: availability.apertureMaxMax,
      distortionMaxMax: availability.distortionMaxMax,
      breathingMinMin: availability.breathingMinMin,
    } as const;
    const sig = JSON.stringify(nextCaps);
    if (lastCapsSigRef.current !== sig) {
      lastCapsSigRef.current = sig;
      useFilterStore.getState().setBoundsFromAvailability(nextCaps);
    }
  }, [availability]);

  return availability;
}


