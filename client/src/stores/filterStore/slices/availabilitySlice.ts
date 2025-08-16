import type { FilterState } from '../../filterStore';
import { availabilityCapsEqual as capsEqual } from '../../../lib/availabilityHelpers';

export function createAvailabilitySlice(
  set: (partial: Partial<FilterState>) => void,
  get: () => FilterState
) {
  return {
    availabilityCaps: undefined,
    setAvailabilityCaps: (caps: FilterState['availabilityCaps']) => set({ availabilityCaps: caps }),
    setBoundsFromAvailability: (a: NonNullable<FilterState['availabilityCaps']>) => {
      const currentCaps = get().availabilityCaps;
      if (!currentCaps || !capsEqual(currentCaps as any, a as any)) {
        set({ availabilityCaps: a });
      }
    },
  } satisfies Partial<FilterState>;
}


