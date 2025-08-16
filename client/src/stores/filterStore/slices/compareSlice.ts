import type { FilterState } from '../../filterStore';

export function createCompareSlice(
  set: (partial: Partial<FilterState>) => void,
  get: () => FilterState
) {
  return {
    selected: null,
    setSelected: (r) => set({ selected: r }),
    compareList: [],
    setCompareList: (ids: string[]) => set({ compareList: [...ids] }),
    toggleCompare: (id: string) => {
      const current = get().compareList;
      const exists = current.includes(id);
      const next = exists ? current.filter((n) => n !== id) : [...current, id];
      set({ compareList: next });
    },
    clearCompare: () => set({ compareList: [] }),
  } satisfies Partial<FilterState>;
}


