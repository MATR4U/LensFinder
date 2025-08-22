import type { FilterState } from '../../filterStore';

export function createEssentialsSlice(
  set: (partial: Partial<FilterState>) => void,
  _get: () => FilterState
) {
  return {
    useCases: [] as string[],
    budgetTarget: 1500,
    budgetFlexible: true,
    cameraMount: '',
    setUseCases: (v: string[]) => set({ useCases: v }),
    setBudgetTarget: (n: number) => set({ budgetTarget: n }),
    setBudgetFlexible: (v: boolean) => set({ budgetFlexible: v }),
    setCameraMount: (v: string) => set({ cameraMount: v }),
  } satisfies Partial<FilterState>;
}
