import { useMemo } from 'react';
import { shallow } from 'zustand/shallow';
import { useFilterStore, type FilterState } from '../stores/filterStore';

export type BindingSpec = {
  key: keyof FilterState;
  as?: string;
  setterKey?: keyof FilterState;
  setterAs?: string;
};

type ValueKeyOf<S extends BindingSpec> = S['as'] extends string
  ? S['as']
  : S['key'] extends string
    ? S['key']
    : never;

type SetterKeyOf<S extends BindingSpec> = S['setterAs'] extends string
  ? S['setterAs']
  : S['setterKey'] extends string
    ? S['setterKey']
    : S['key'] extends string
      ? `set${Capitalize<string & S['key']>}`
      : never;

type ValueTypeOf<S extends BindingSpec> = S['key'] extends keyof FilterState
  ? FilterState[S['key']]
  : unknown;

type SetterFuncTypeOf<S extends BindingSpec> = S['setterKey'] extends keyof FilterState
  ? FilterState[S['setterKey']]
  : `set${Capitalize<string & S['key']>}` extends keyof FilterState
    ? FilterState[`set${Capitalize<string & S['key']>}`]
    : unknown;

export type BindingResult<T extends readonly BindingSpec[]> = {
  [K in T[number] as ValueKeyOf<K>]: ValueTypeOf<K>;
} & {
  [K in T[number] as SetterKeyOf<K>]: SetterFuncTypeOf<K>;
};

export function useFilterBindings<const T extends readonly BindingSpec[]>(specs: T): BindingResult<T> {
  const selector = useMemo(() => {
    return (s: ReturnType<typeof useFilterStore.getState>) => {
      const out: Record<string, unknown> = {};
      for (const spec of specs) {
        const valueName = spec.as ?? (spec.key as string);
        out[valueName] = (s as any)[spec.key as string];

        const computedSetterKey = spec.setterKey
          ? (spec.setterKey as string)
          : `set${String(spec.key).slice(0, 1).toUpperCase()}${String(spec.key).slice(1)}`;
        const setter = (s as any)[computedSetterKey];
        if (typeof setter === 'function') {
          const setterName = spec.setterAs ?? computedSetterKey;
          out[setterName] = setter;
        }
      }
      return out;
    };
  }, [specs]);

  return useFilterStore(selector as any, shallow) as BindingResult<T>;
}

export const PRO_REQ_BINDINGS = [
  { key: 'cameraName', setterKey: 'setCameraName' },
  { key: 'brand', setterKey: 'setBrand' },
  { key: 'lensType', setterKey: 'setLensType' },
  { key: 'proCoverage', as: 'coverage', setterKey: 'setProCoverage', setterAs: 'setCoverage' },
  { key: 'proFocalMin', as: 'focalMin', setterKey: 'setProFocalMin', setterAs: 'setFocalMin' },
  { key: 'proFocalMax', as: 'focalMax', setterKey: 'setProFocalMax', setterAs: 'setFocalMax' },
  { key: 'proMaxApertureF', as: 'maxApertureF', setterKey: 'setProMaxApertureF', setterAs: 'setMaxApertureF' },
  { key: 'proRequireOIS', as: 'requireOIS', setterKey: 'setProRequireOIS', setterAs: 'setRequireOIS' },
  { key: 'sealed', setterKey: 'setSealed' },
  { key: 'isMacro', setterKey: 'setIsMacro' },
  { key: 'priceRange', setterKey: 'setPriceRange' },
  { key: 'weightRange', setterKey: 'setWeightRange' },
  { key: 'proDistortionMaxPct', as: 'distortionMaxPct', setterKey: 'setProDistortionMaxPct', setterAs: 'setDistortionMaxPct' },
  { key: 'proBreathingMinScore', as: 'breathingMinScore', setterKey: 'setProBreathingMinScore', setterAs: 'setBreathingMinScore' },
  { key: 'goalPreset', setterKey: 'setGoalPreset' },
  { key: 'goalWeights', setterKey: 'setGoalWeights' },
  { key: 'availabilityCaps', as: 'caps' },
  { key: 'undoLastFilter' },
  { key: 'continueTo' },
  { key: 'resetFilters' },
  { key: 'softPrice', setterKey: 'setSoftPrice' },
  { key: 'softWeight', setterKey: 'setSoftWeight' },
  { key: 'softDistortion', setterKey: 'setSoftDistortion' },
  { key: 'softBreathing', setterKey: 'setSoftBreathing' },
  { key: 'enablePrice', setterKey: 'setEnablePrice' },
  { key: 'enableWeight', setterKey: 'setEnableWeight' },
  { key: 'enableDistortion', setterKey: 'setEnableDistortion' },
  { key: 'enableBreathing', setterKey: 'setEnableBreathing' },
 ] as const satisfies readonly BindingSpec[];

export const REQ_STAGE_BINDINGS = [
  { key: 'isPro' },
  { key: 'continueTo' },
 ] as const satisfies readonly BindingSpec[];

export const BUILD_STAGE_BINDINGS = [
  { key: 'continueTo' },
  { key: 'captureStageBaseline' },
 ] as const satisfies readonly BindingSpec[];

export const COMPARE_STAGE_BINDINGS = [
  { key: 'compareList' },
  { key: 'continueTo' },
 ] as const satisfies readonly BindingSpec[];

export const REPORT_STAGE_BINDINGS = [
  { key: 'report' },
  { key: 'selected' },
  { key: 'continueTo' },
 ] as const satisfies readonly BindingSpec[];

export const MODE_STAGE_BINDINGS = [
  { key: 'continueTo' },
  { key: 'captureStageBaseline' },
 ] as const satisfies readonly BindingSpec[];

export const DEBUG_BINDINGS = [
  { key: 'brand' },
  { key: 'lensType' },
  { key: 'sealed' },
  { key: 'isMacro' },
  { key: 'priceRange' },
  { key: 'weightRange' },
  { key: 'proCoverage' },
  { key: 'proFocalMin' },
  { key: 'proFocalMax' },
  { key: 'proMaxApertureF' },
  { key: 'proRequireOIS' },
  { key: 'proRequireSealed' },
  { key: 'proRequireMacro' },
  { key: 'proPriceMax' },
  { key: 'proWeightMax' },
  { key: 'proDistortionMaxPct' },
  { key: 'proBreathingMinScore' },
 ] as const satisfies readonly BindingSpec[];

export const BUILD_CAPS_BINDINGS = [
  { key: 'isPro' },
  { key: 'cameraName', setterKey: 'setCameraName' },
  { key: 'brand', setterKey: 'setBrand' },
  { key: 'lensType', setterKey: 'setLensType' },
  { key: 'proCoverage', as: 'coverage', setterKey: 'setProCoverage', setterAs: 'setCoverage' },
  { key: 'sealed', setterKey: 'setSealed' },
  { key: 'isMacro', setterKey: 'setIsMacro' },
  { key: 'proRequireOIS', as: 'requireOIS', setterKey: 'setProRequireOIS', setterAs: 'setRequireOIS' },
  { key: 'continueTo' },
  { key: 'availabilityCaps', as: 'caps' },
 ] as const satisfies readonly BindingSpec[];

export const APP_BINDINGS = [
  { key: 'cameraName' },
  { key: 'isPro' },
  { key: 'goalPreset' },
  { key: 'goalWeights' },
  { key: 'focalChoice' },
  { key: 'subjectDistanceM' },
  { key: 'brand' },
  { key: 'lensType' },
  { key: 'sealed' },
  { key: 'isMacro' },
  { key: 'priceRange' },
  { key: 'weightRange' },
  { key: 'proCoverage' },
  { key: 'proFocalMin' },
  { key: 'proFocalMax' },
  { key: 'proMaxApertureF' },
  { key: 'proRequireOIS' },
  { key: 'proRequireSealed' },
  { key: 'proRequireMacro' },
  { key: 'proPriceMax' },
  { key: 'proWeightMax' },
  { key: 'proDistortionMaxPct' },
  { key: 'proBreathingMinScore' },
  { key: 'softPrice' },
  { key: 'softWeight' },
  { key: 'softDistortion' },
  { key: 'softBreathing' },
  { key: 'enablePrice' },
  { key: 'enableWeight' },
  { key: 'enableDistortion' },
  { key: 'enableBreathing' },
  { key: 'compareList' },
  { key: 'selected' },
  { key: 'report' },
  { key: 'setReport' },
  { key: 'pushHistory' },
  { key: 'stage' },
  { key: 'continueTo' },
  { key: 'captureStageBaseline' },
  { key: 'resetToStageBaseline' },
 ] as const satisfies readonly BindingSpec[];

// Additional component-specific bindings
export const SIMPLE_REQ_BINDINGS = [
  { key: 'cameraName', setterKey: 'setCameraName' },
  { key: 'brand', setterKey: 'setBrand' },
  { key: 'lensType', setterKey: 'setLensType' },
  { key: 'sealed', setterKey: 'setSealed' },
  { key: 'isMacro', setterKey: 'setIsMacro' },
  { key: 'priceRange', setterKey: 'setPriceRange' },
  { key: 'weightRange', setterKey: 'setWeightRange' },
  { key: 'goalPreset', setterKey: 'setGoalPreset' },
  { key: 'setGoalWeights' },
  { key: 'availabilityCaps', as: 'caps' },
  { key: 'undoLastFilter' },
  { key: 'continueTo' },
  { key: 'resetFilters' },
  { key: 'softPrice', setterKey: 'setSoftPrice' },
  { key: 'softWeight', setterKey: 'setSoftWeight' },
  { key: 'enablePrice', setterKey: 'setEnablePrice' },
  { key: 'enableWeight', setterKey: 'setEnableWeight' },
] as const satisfies readonly BindingSpec[];

export const PAGE_BASE_BINDINGS = [
  { key: 'historyLength' },
  { key: 'redoLength' },
  { key: 'undoLastFilter', as: 'undo' },
  { key: 'redoLastFilter', as: 'redo' },
] as const satisfies readonly BindingSpec[];

export const MODE_SELECT_BINDINGS = [
  { key: 'isPro' },
  { key: 'setIsPro' },
  { key: 'continueTo' },
] as const satisfies readonly BindingSpec[];

export const MODE_CARD_BINDINGS = [
  { key: 'isPro' },
  { key: 'setIsPro' },
] as const satisfies readonly BindingSpec[];

export const EXPLORE_GRID_BINDINGS = [
  { key: 'setSelected' },
  { key: 'compareList' },
  { key: 'toggleCompare' },
] as const satisfies readonly BindingSpec[];

export const COMPARE_SHOWDOWN_BINDINGS = [
  { key: 'compareList' },
  { key: 'toggleCompare' },
  { key: 'setSelected' },
] as const satisfies readonly BindingSpec[];

export const COMPARE_TRAY_BINDINGS = [
  { key: 'continueTo' },
] as const satisfies readonly BindingSpec[];


