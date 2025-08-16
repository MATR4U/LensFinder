import type { FilterState } from '../../filterStore';

export function createPricingSlice(
  set: (partial: Partial<FilterState>) => void
) {
  return {
    priceOverrides: {},
    setPriceOverrides: (overrides: Record<string, string>) => set({ priceOverrides: { ...overrides } }),
  } satisfies Partial<FilterState>;
}


