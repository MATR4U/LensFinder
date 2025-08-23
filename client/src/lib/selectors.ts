import type { Camera, Lens, Result } from '../types';
import { computeAvailability, type Availability } from './availability';
import { applyFilters } from './filters';
import { computeResults } from './recommender';
import { compile, filter as fcFilter } from '@lensfinder/filter-core';
import { buildSpecFromState, type Mapping } from '@lensfinder/filter-core';

export const makeBrandsForCamera = () =>
  (lenses: Lens[], camera?: Camera): string[] => {
    if (!camera) return ['Any'];
    const compat = lenses.filter(l => l.mount === camera.mount).map(l => l.brand);
    return ['Any', ...Array.from(new Set(compat)).sort()];
  };

export const makeAvailabilitySelector = () =>
  (cameraName: string, camera: Camera | undefined, lenses: Lens[], f: any): Availability =>
    computeAvailability({
      cameraName,
      camera,
      lenses,
      brand: f.brand,
      lensType: f.lensType,
      sealed: f.sealed,
      isMacro: f.isMacro,
      priceRange: f.priceRange,
      weightRange: f.weightRange,
      proCoverage: f.proCoverage,
      proFocalMin: f.proFocalMin,
      proFocalMax: f.proFocalMax,
      proMaxApertureF: f.proMaxApertureF,
      proRequireOIS: f.proRequireOIS,
      proRequireSealed: f.proRequireSealed,
      proRequireMacro: f.proRequireMacro,
      proPriceMax: f.proPriceMax,
      proWeightMax: f.proWeightMax,
      proDistortionMaxPct: f.proDistortionMaxPct,
      proBreathingMinScore: f.proBreathingMinScore,
    });

export const makeResultsSelector = () =>
  (lenses: Lens[], camera: Camera | undefined, f: any): Result[] => {
    const useFilterCore = (import.meta as any).env?.VITE_FILTER_CORE_ENABLE === 'true';

    let filtered: Lens[];
    if (useFilterCore) {
      const base = (camera && f.cameraName !== 'Any') ? lenses.filter(l => l.mount === camera.mount) : lenses.slice();
      const preLensType = base.filter(l => {
        const type = l.focal_min_mm === l.focal_max_mm ? 'Prime' : 'Zoom';
        return f.lensType === 'Any' ? true : type === f.lensType;
      });
      const mapping: Mapping = [
        { from: 'brand', to: 'brand', op: 'eq', when: (s: any) => s.brand && s.brand !== 'Any' },
        { from: 'sealed', to: 'weather_sealed', op: 'isTrue', when: (s: any) => s.sealed === true },
        { from: 'isMacro', to: 'is_macro', op: 'isTrue', when: (s: any) => s.isMacro === true },
        { from: 'priceRange', to: 'price_chf', op: 'between', mode: (st: any) => (st.softPrice ? 'soft' : 'hard'), transform: (v: any) => [ v.min, v.max ], weight: (st: any) => (st.softPrice ? 1 : undefined) },
        { from: 'weightRange', to: 'weight_g', op: 'between', mode: (st: any) => (st.softWeight ? 'soft' : 'hard'), transform: (v: any) => [ v.min, v.max ], weight: (st: any) => (st.softWeight ? 1 : undefined) },
        { from: 'proMaxApertureF', to: 'aperture_min', op: 'lte' },
        { from: 'proPriceMax', to: 'price_chf', op: 'lte' },
        { from: 'proWeightMax', to: 'weight_g', op: 'lte' },
        { from: 'proRequireOIS', to: 'ois', op: 'isTrue', when: (s: any) => s.proRequireOIS === true },
        { from: 'proRequireSealed', to: 'weather_sealed', op: 'isTrue', when: (s: any) => s.proRequireSealed === true },
        { from: 'proRequireMacro', to: 'is_macro', op: 'isTrue', when: (s: any) => s.proRequireMacro === true },
        { from: 'proDistortionMaxPct', to: 'distortion_pct', op: 'lte', mode: (st: any) => (st.softDistortion ? 'soft' : 'hard'), weight: (st: any) => (st.softDistortion ? 1 : undefined) },
        { from: 'proBreathingMinScore', to: 'focus_breathing_score', op: 'gte', mode: (st: any) => (st.softBreathing ? 'soft' : 'hard'), weight: (st: any) => (st.softBreathing ? 1 : undefined) },
      ];
      function withCoverageAnyOf(spec: any, state: any) {
        const val = state.proCoverage;
        if (!val || val === 'Any') return spec;
        const lc = String(val).toLowerCase();
        let syns: string[] = [];
        if (lc.includes('medium')) syns = ['Medium Format', 'MF'];
        else if (lc.includes('mft') || lc.includes('micro')) syns = ['MFT', 'Micro Four Thirds'];
        else if (lc.includes('aps')) syns = ['APS-C', 'APS C', 'APS'];
        else syns = ['Full Frame', 'FF'];
        const anyOf = syns.map(s => ({ path: 'coverage', op: 'includes', value: s, mode: 'hard' as const }));
        return { allOf: [ ...(spec.allOf ?? []), { anyOf } ] };
      }
      const spec0 = buildSpecFromState(f, mapping);
      const spec = withCoverageAnyOf(spec0, f);
      const exec = compile(spec);
      filtered = (fcFilter(preLensType, exec) as Lens[]);
    } else {
      filtered = applyFilters({
        lenses,
        cameraName: f.cameraName,
        cameraMount: camera?.mount,
        brand: f.brand,
        lensType: f.lensType,
        sealed: f.sealed,
        isMacro: f.isMacro,
        priceRange: f.priceRange,
        weightRange: f.weightRange,
        proCoverage: f.proCoverage,
        proFocalMin: f.proFocalMin,
        proFocalMax: f.proFocalMax,
        proMaxApertureF: f.proMaxApertureF,
        proRequireOIS: f.proRequireOIS,
        proRequireSealed: f.proRequireSealed,
        proRequireMacro: f.proRequireMacro,
        proPriceMax: f.proPriceMax,
        proWeightMax: f.proWeightMax,
        proDistortionMaxPct: f.proDistortionMaxPct,
        proBreathingMinScore: f.proBreathingMinScore,
        softPrice: f.softPrice,
        softWeight: f.softWeight,
        softDistortion: f.softDistortion,
        softBreathing: f.softBreathing,
      });
    }

    const effectiveCamera = camera ?? {
      name: 'Any', brand: 'Any', mount: 'Any', ibis: false, price_chf: 0, weight_g: 0, source_url: '',
      sensor: { name: 'FF', width_mm: 36, height_mm: 24, coc_mm: 0.03, crop: 1 },
    };
    return computeResults({
      lenses: filtered,
      camera: effectiveCamera,
      goal_weights: f.goalWeights,
      focal_choice: f.focalChoice,
      isProMode: f.isPro,
      subject_distance_m: f.subjectDistanceM,
    });
  };


