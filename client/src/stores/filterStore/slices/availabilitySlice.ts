import type { FilterState } from '../../filterStore';
import { availabilityCapsEqual as capsEqual, availabilityCapsVersion } from '../../../lib/availabilityHelpers';

export function createAvailabilitySlice(
  set: (partial: Partial<FilterState>) => void,
  get: () => FilterState
) {
  return {
    availabilityCaps: undefined,
    setAvailabilityCaps: (caps: FilterState['availabilityCaps']) => set({ availabilityCaps: caps }),
    setBoundsFromAvailability: (a: NonNullable<FilterState['availabilityCaps']>) => {
      const currentCaps = get().availabilityCaps;
      // Prefer fast version comparison; fallback to deep equal if version not comparable
      const curV = currentCaps ? availabilityCapsVersion(currentCaps as any) : undefined;
      const nextV = availabilityCapsVersion(a as any);
      if (!currentCaps || curV !== nextV || !capsEqual(currentCaps as any, a as any)) {
        set({ availabilityCaps: a });
      }
    },
  } satisfies Partial<FilterState>;
}


