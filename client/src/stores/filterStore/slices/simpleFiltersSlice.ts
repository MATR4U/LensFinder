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
    setSealed: (v: boolean) => { const { pushHistory } = get(); set({ sealed: v }); pushHistory(); },
    setIsMacro: (v: boolean) => { const { pushHistory } = get(); set({ isMacro: v }); pushHistory(); },
    setPriceRange: (r: Range) => {
      const timerKey = '__priceRangeTimer__' as unknown as keyof FilterState;
      scheduleDebouncedRangeUpdate('priceRange' as any, r, timerKey, get, set, () => get().availabilityCaps?.priceBounds as any);
    },
    setWeightRange: (r: Range) => {
      const timerKey = '__weightRangeTimer__' as unknown as keyof FilterState;
      scheduleDebouncedRangeUpdate('weightRange' as any, r, timerKey, get, set, () => get().availabilityCaps?.weightBounds as any);
    },
  } satisfies Partial<FilterState>;
}


