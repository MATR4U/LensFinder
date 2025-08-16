import type { FilterState } from '../../filterStore';

export function createReportSlice(
  set: (partial: Partial<FilterState>) => void
) {
  return {
    report: null,
    setReport: (r) => set({ report: r }),
  } satisfies Partial<FilterState>;
}


