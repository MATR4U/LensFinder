import React from 'react';
import { useFilterStore } from '../stores/filterStore';
import { FilterStateSchema } from '../lib/schema';
import { decodeWeightsBase64Url, encodeWeightsBase64Url } from '../lib/presetsMapping';

const paramMap = [
  ['cameraName', 'cameraName'],
  ['isPro', (v: any) => (v ? '1' : '0'), (s: any, v: string) => (v === '1' || v === 'true')],
  ['brand', 'brand'],
  ['lensType', 'lensType'],
  ['sealed', (v: any) => (v ? '1' : '0'), (s: any, v: string) => (v === '1' || v === 'true')],
  ['isMacro', (v: any) => (v ? '1' : '0'), (s: any, v: string) => (v === '1' || v === 'true')],
  ['pmin', (s: any) => s.priceRange.min, undefined, (s: any, n: number) => ({ ...s, priceRange: { ...s.priceRange, min: n } })],
  ['pmax', (s: any) => s.priceRange.max, undefined, (s: any, n: number) => ({ ...s, priceRange: { ...s.priceRange, max: n } })],
  ['wmin', (s: any) => s.weightRange.min, undefined, (s: any, n: number) => ({ ...s, weightRange: { ...s.weightRange, min: n } })],
  ['wmax', (s: any) => s.weightRange.max, undefined, (s: any, n: number) => ({ ...s, weightRange: { ...s.weightRange, max: n } })],
  ['coverage', 'proCoverage'],
  ['fmin', 'proFocalMin'],
  ['fmax', 'proFocalMax'],
  ['apmax', 'proMaxApertureF'],
  ['ois', (v: any) => (v ? '1' : '0'), (s: any, v: string) => (v === '1' || v === 'true'), 'proRequireOIS'],
  ['reqSealed', (v: any) => (v ? '1' : '0'), (s: any, v: string) => (v === '1' || v === 'true'), 'proRequireSealed'],
  ['reqMacro', (v: any) => (v ? '1' : '0'), (s: any, v: string) => (v === '1' || v === 'true'), 'proRequireMacro'],
  ['pmaxHard', 'proPriceMax'],
  ['wmaxHard', 'proWeightMax'],
  ['distMax', 'proDistortionMaxPct'],
  ['breathMin', 'proBreathingMinScore'],
  ['softPrice', (v: any) => (v ? '1' : '0'), (s: any, v: string) => (v === '1' || v === 'true')],
  ['softWeight', (v: any) => (v ? '1' : '0'), (s: any, v: string) => (v === '1' || v === 'true')],
  ['softDist', (v: any) => (v ? '1' : '0'), (s: any, v: string) => (v === '1' || v === 'true')],
  ['softBreath', (v: any) => (v ? '1' : '0'), (s: any, v: string) => (v === '1' || v === 'true')],
  ['enPrice', (v: any) => (v ? '1' : '0'), (s: any, v: string) => (v === '1' || v === 'true'), 'enablePrice'],
  ['enWeight', (v: any) => (v ? '1' : '0'), (s: any, v: string) => (v === '1' || v === 'true'), 'enableWeight'],
  ['enDist', (v: any) => (v ? '1' : '0'), (s: any, v: string) => (v === '1' || v === 'true'), 'enableDistortion'],
  ['enBreath', (v: any) => (v ? '1' : '0'), (s: any, v: string) => (v === '1' || v === 'true'), 'enableBreathing'],
  ['goal', 'goalPreset'],
] as const;

export function useUrlFiltersSync() {
  React.useEffect(() => {
    const s = useFilterStore.getState();
    const params = new URLSearchParams(window.location.search);
    const getNum = (k: string, def: number) => { const v = params.get(k); const n = v ? Number(v) : NaN; return Number.isFinite(n) ? n : def; };
    const stateDraft = {
      cameraName: params.get('cameraName') ?? s.cameraName,
      isPro: (() => { const v = params.get('isPro'); return v !== null ? (v === '1' || v === 'true') : s.isPro; })(),
      brand: params.get('brand') ?? s.brand,
      lensType: params.get('lensType') ?? s.lensType,
      sealed: (() => { const v = params.get('sealed'); return v !== null ? (v === '1' || v === 'true') : s.sealed; })(),
      isMacro: (() => { const v = params.get('isMacro'); return v !== null ? (v === '1' || v === 'true') : s.isMacro; })(),
      priceRange: { min: getNum('pmin', s.priceRange.min), max: getNum('pmax', s.priceRange.max) },
      weightRange: { min: getNum('wmin', s.weightRange.min), max: getNum('wmax', s.weightRange.max) },
      proCoverage: params.get('coverage') ?? s.proCoverage,
      proFocalMin: getNum('fmin', s.proFocalMin),
      proFocalMax: getNum('fmax', s.proFocalMax),
      proMaxApertureF: getNum('apmax', s.proMaxApertureF),
      proRequireOIS: (() => { const v = params.get('ois'); return v !== null ? (v === '1' || v === 'true') : s.proRequireOIS; })(),
      proRequireSealed: (() => { const v = params.get('reqSealed'); return v !== null ? (v === '1' || v === 'true') : s.proRequireSealed; })(),
      proRequireMacro: (() => { const v = params.get('reqMacro'); return v !== null ? (v === '1' || v === 'true') : s.proRequireMacro; })(),
      proPriceMax: getNum('pmaxHard', s.proPriceMax),
      proWeightMax: getNum('wmaxHard', s.proWeightMax),
      proDistortionMaxPct: getNum('distMax', s.proDistortionMaxPct),
      proBreathingMinScore: getNum('breathMin', s.proBreathingMinScore),
      softPrice: (() => { const v = params.get('softPrice'); return v !== null ? (v === '1' || v === 'true') : s.softPrice; })(),
      softWeight: (() => { const v = params.get('softWeight'); return v !== null ? (v === '1' || v === 'true') : s.softWeight; })(),
      softDistortion: (() => { const v = params.get('softDist'); return v !== null ? (v === '1' || v === 'true') : s.softDistortion; })(),
      softBreathing: (() => { const v = params.get('softBreath'); return v !== null ? (v === '1' || v === 'true') : s.softBreathing; })(),
      enablePrice: (() => { const v = params.get('enPrice'); return v !== null ? (v === '1' || v === 'true') : s.enablePrice; })(),
      enableWeight: (() => { const v = params.get('enWeight'); return v !== null ? (v === '1' || v === 'true') : s.enableWeight; })(),
      enableDistortion: (() => { const v = params.get('enDist'); return v !== null ? (v === '1' || v === 'true') : s.enableDistortion; })(),
      enableBreathing: (() => { const v = params.get('enBreath'); return v !== null ? (v === '1' || v === 'true') : s.enableBreathing; })(),
      goalPreset: params.get('goal') ?? s.goalPreset,
      goalWeights: (() => {
        const wh = params.get('gwh');
        const decoded = decodeWeightsBase64Url(wh);
        return decoded ?? s.goalWeights;
      })(),
    } as const;
    const parsed = FilterStateSchema.safeParse(stateDraft);
    if (!parsed.success) return; // Ignore invalid URL data; keep defaults
    const st = parsed.data;
    s.setCameraName(st.cameraName);
    s.setIsPro(st.isPro);
    s.setBrand(st.brand);
    s.setLensType(st.lensType);
    s.setSealed(st.sealed);
    s.setIsMacro(st.isMacro);
    s.setPriceRange(st.priceRange);
    s.setWeightRange(st.weightRange);
    s.setProCoverage(st.proCoverage);
    s.setProFocalMin(st.proFocalMin);
    s.setProFocalMax(st.proFocalMax);
    s.setProMaxApertureF(st.proMaxApertureF);
    s.setProRequireOIS(st.proRequireOIS);
    s.setProRequireSealed(st.proRequireSealed);
    s.setProRequireMacro(st.proRequireMacro);
    s.setProPriceMax(st.proPriceMax);
    s.setProWeightMax(st.proWeightMax);
    s.setProDistortionMaxPct(st.proDistortionMaxPct);
    s.setProBreathingMinScore(st.proBreathingMinScore);
    s.setSoftPrice(st.softPrice);
    s.setSoftWeight(st.softWeight);
    s.setSoftDistortion(st.softDistortion);
    s.setSoftBreathing(st.softBreathing);
    s.setEnablePrice(st.enablePrice);
    s.setEnableWeight(st.enableWeight);
    s.setEnableDistortion(st.enableDistortion);
    s.setEnableBreathing(st.enableBreathing);
    // Prefer explicit preset from URL, else keep weights and allow inference elsewhere
    if (st.goalPreset) s.setGoalPreset(st.goalPreset);
  }, []);

  React.useEffect(() => {
    let prev = useFilterStore.getState();
    const unsub = useFilterStore.subscribe((next) => {
      const changed = (
        prev.cameraName !== next.cameraName || prev.isPro !== next.isPro ||
        prev.brand !== next.brand || prev.lensType !== next.lensType ||
        prev.sealed !== next.sealed || prev.isMacro !== next.isMacro ||
        prev.priceRange.min !== next.priceRange.min || prev.priceRange.max !== next.priceRange.max ||
        prev.weightRange.min !== next.weightRange.min || prev.weightRange.max !== next.weightRange.max ||
        prev.goalPreset !== next.goalPreset ||
        prev.proCoverage !== next.proCoverage ||
        prev.proFocalMin !== next.proFocalMin || prev.proFocalMax !== next.proFocalMax ||
        prev.proMaxApertureF !== next.proMaxApertureF ||
        prev.proRequireOIS !== next.proRequireOIS ||
        prev.proRequireSealed !== next.proRequireSealed ||
        prev.proRequireMacro !== next.proRequireMacro ||
        prev.proPriceMax !== next.proPriceMax ||
        prev.proWeightMax !== next.proWeightMax ||
        prev.proDistortionMaxPct !== next.proDistortionMaxPct ||
        prev.proBreathingMinScore !== next.proBreathingMinScore ||
        prev.softPrice !== next.softPrice || prev.softWeight !== next.softWeight ||
        prev.softDistortion !== next.softDistortion || prev.softBreathing !== next.softBreathing ||
        prev.enablePrice !== next.enablePrice || prev.enableWeight !== next.enableWeight ||
        prev.enableDistortion !== next.enableDistortion || prev.enableBreathing !== next.enableBreathing
      );
      if (changed) {
        // Clean URL for default state on stage 0
        if (next.stage === 0) {
          const isDefault = (
            next.cameraName === 'Any' &&
            next.brand === 'Any' &&
            next.lensType === 'Any' &&
            next.sealed === false &&
            next.isMacro === false
          );
          if (isDefault) {
            const clean = window.location.pathname;
            if (window.location.search.length > 0) window.history.replaceState(null, '', clean);
            prev = next; return;
          }
        }
        const p = new URLSearchParams();
        p.set('cameraName', next.cameraName);
        p.set('isPro', next.isPro ? '1' : '0');
        p.set('brand', next.brand);
        p.set('lensType', next.lensType);
        p.set('sealed', next.sealed ? '1' : '0');
        p.set('isMacro', next.isMacro ? '1' : '0');
        p.set('pmin', String(next.priceRange.min)); p.set('pmax', String(next.priceRange.max));
        p.set('wmin', String(next.weightRange.min)); p.set('wmax', String(next.weightRange.max));
        p.set('goal', next.goalPreset);
        p.set('coverage', next.proCoverage);
        p.set('fmin', String(next.proFocalMin));
        p.set('fmax', String(next.proFocalMax));
        p.set('apmax', String(next.proMaxApertureF));
        p.set('ois', next.proRequireOIS ? '1' : '0');
        p.set('reqSealed', next.proRequireSealed ? '1' : '0');
        p.set('reqMacro', next.proRequireMacro ? '1' : '0');
        p.set('pmaxHard', String(next.proPriceMax));
        p.set('wmaxHard', String(next.proWeightMax));
        p.set('distMax', String(next.proDistortionMaxPct));
        p.set('breathMin', String(next.proBreathingMinScore));
        p.set('softPrice', next.softPrice ? '1' : '0');
        p.set('softWeight', next.softWeight ? '1' : '0');
        p.set('softDist', next.softDistortion ? '1' : '0');
        p.set('softBreath', next.softBreathing ? '1' : '0');
        p.set('enPrice', next.enablePrice ? '1' : '0');
        p.set('enWeight', next.enableWeight ? '1' : '0');
        p.set('enDist', next.enableDistortion ? '1' : '0');
        p.set('enBreath', next.enableBreathing ? '1' : '0');
        // Also encode goal weights for deep links
        p.set('gwh', encodeWeightsBase64Url(next.goalWeights));
        const nextUrl = `${window.location.pathname}?${p.toString()}`;
        window.history.replaceState(null, '', nextUrl);
      }
      prev = next;
    });
    return () => unsub();
  }, []);
}


