import type { FilterState } from '../../filterStore';

function toggleUnique(list: string[], id: string): string[] {
  if (list.includes(id)) return list.filter((n) => n !== id);
  return [...list, id];
}

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
      const next = toggleUnique(current, id);
      set({ compareList: next });
    },
    clearCompare: () => set({ compareList: [] }),
  } satisfies Partial<FilterState>;
}


