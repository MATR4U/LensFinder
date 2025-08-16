import type { FilterState } from '../../filterStore';

export function createJourneySlice(
  set: (partial: Partial<FilterState>) => void,
  get: () => FilterState
) {
  return {
    stage: 0,
    setStage: (n: number) => {
      const allowed = [0, 1, 2, 3, 4];
      if (!allowed.includes(n)) {
        if (import.meta?.env?.DEV) console.warn('[flow] setStage blocked: invalid stage', n);
        return;
      }
      get().pushHistory();
      set({ stage: n });
    },
    continueTo: (next: number) => {
      const cur = get().stage;
      const allowedForward = { 0: 1, 1: 2, 2: 3, 3: 4 } as Record<number, number>;
      const allowedBackward = { 1: 0, 2: 1, 3: 2, 4: 3 } as Record<number, number>;
      const isForward = next > cur;
      const ok = isForward ? allowedForward[cur] === next : allowedBackward[cur] === next;
      if (!ok) {
        if (import.meta?.env?.DEV) console.warn('[flow] continueTo blocked: ', { cur, next });
        return;
      }
      if (next >= 4 && get().compareList.length < 2) {
        if (import.meta?.env?.DEV) console.warn('[flow] blocked: need at least 2 selections');
        return;
      }
      get().pushHistory();
      set({ stage: next });
    },
  } satisfies Partial<FilterState>;
}


