import type { FilterState } from '../../filterStore';
import type { Range } from '../../filterStore';
import { scheduleDebouncedRangeUpdate } from '../helpers';

export function createSimpleFiltersSlice(
  set: (partial: Partial<FilterState>) => void,
  get: () => FilterState
) {
  return {
    cameraName: 'Any',
    setCameraName: (name: string) => set({ cameraName: name }),
    isPro: true,

    brand: 'Any',
    lensType: 'Any',
    sealed: false,
    isMacro: false,
    priceRange: { min: 0, max: 1_000_000 },
    weightRange: { min: 0, max: 100_000 },

    setIsPro: (v: boolean) => { get().pushHistory(); set({ isPro: v }); },
    setBrand: (v: string) => {
      get().pushHistory();
      const caps = get().availabilityCaps;
      const next = caps && !caps.brands.includes(v) ? 'Any' : v;
      set({ brand: next });
    },
    setLensType: (v: string) => {
      get().pushHistory();
      const caps = get().availabilityCaps;
      const next = caps && !caps.lensTypes.includes(v) ? 'Any' : v;
      set({ lensType: next });
    },
    setSealed: (v: boolean) => { get().pushHistory(); set({ sealed: v }); },
    setIsMacro: (v: boolean) => { get().pushHistory(); set({ isMacro: v }); },
    setPriceRange: (r: Range) => {
      const timerKey = '__priceRangeTimer__' as unknown as keyof FilterState;
      const caps = get().availabilityCaps;
      scheduleDebouncedRangeUpdate('priceRange' as any, r, timerKey, get, set, caps?.priceBounds as any);
    },
    setWeightRange: (r: Range) => {
      const timerKey = '__weightRangeTimer__' as unknown as keyof FilterState;
      const caps = get().availabilityCaps;
      scheduleDebouncedRangeUpdate('weightRange' as any, r, timerKey, get, set, caps?.weightBounds as any);
    },
  } satisfies Partial<FilterState>;
}


