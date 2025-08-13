import React, { useMemo } from 'react';
import type { Camera, Lens } from '../../types';
import Info from '../ui/Info';
import RangeSlider from '../ui/RangeSlider';
import LabeledSelect from '../ui/fields/LabeledSelect';
import LabeledCheckbox from '../ui/fields/LabeledCheckbox';
import CheckboxGroup from '../ui/fields/CheckboxGroup';
import Checkbox from '../ui/Checkbox';
import LabeledRange from '../ui/fields/LabeledRange';
import LabeledSlider from '../ui/fields/LabeledSlider';
import Button from '../ui/Button';
import { TITLE_H2, TEXT_XS_MUTED, GRID_TWO_GAP3, STACK_Y, DIVIDER_T, TEXT_2XS_MUTED, INLINE_LABEL_MUTED_XS } from '../ui/styles';
import { useFilterStore } from '../../stores/filterStore';
import { PRESETS } from '../../lib/recommender';
import { shallow } from 'zustand/shallow';
import { applyFilters } from '../../lib/filters';
import GoalPresetWeights from '../ui/fields/GoalPresetWeights';
import { FIELD_HELP } from '../ui/fieldHelp';
import CollapsibleMessage from '../ui/CollapsibleMessage';
import BaseRequirements from './BaseRequirements';
// Inline warnings replace the standalone block; remove NoticeZeroResults usage

type Props = {
  cameras?: Camera[];
  brandsForCamera?: string[];
  onContinue: () => void;
  resultsCount?: number;
  camera?: Camera;
  cameraName?: string;
  lenses?: Lens[];
};

export default function ProRequirements(props: Props) {
  const { cameras, brandsForCamera, resultsCount = 0, onContinue, camera, cameraName: selectedCameraName = 'Any', lenses = [] } = props;

  const {
    cameraName, setCameraName,
    brand, setBrand,
    lensType, setLensType,
    coverage, setCoverage,
    focalMin, setFocalMin,
    focalMax, setFocalMax,
    maxApertureF, setMaxApertureF,
    requireOIS, setRequireOIS,
    sealed, setSealed,
    isMacro, setIsMacro,
    priceRange, setPriceRange,
    weightRange, setWeightRange,
    distortionMaxPct, setDistortionMaxPct,
    breathingMinScore, setBreathingMinScore,
    goalPreset, setGoalPreset,
    goalWeights, setGoalWeights,
    caps,
    undoLastFilter,
    continueTo,
    resetFilters,
    softPrice, setSoftPrice,
    softWeight, setSoftWeight,
    softDistortion, setSoftDistortion,
    softBreathing, setSoftBreathing,
  } = useFilterStore((s) => ({
    cameraName: s.cameraName,
    setCameraName: s.setCameraName,
    brand: s.brand,
    setBrand: s.setBrand,
    lensType: s.lensType,
    setLensType: s.setLensType,
    coverage: s.proCoverage,
    setCoverage: s.setProCoverage,
    focalMin: s.proFocalMin,
    setFocalMin: s.setProFocalMin,
    focalMax: s.proFocalMax,
    setFocalMax: s.setProFocalMax,
    maxApertureF: s.proMaxApertureF,
    setMaxApertureF: s.setProMaxApertureF,
    requireOIS: s.proRequireOIS,
    setRequireOIS: s.setProRequireOIS,
    sealed: s.sealed,
    setSealed: s.setSealed,
    isMacro: s.isMacro,
    setIsMacro: s.setIsMacro,
    priceRange: s.priceRange,
    setPriceRange: s.setPriceRange,
    weightRange: s.weightRange,
    setWeightRange: s.setWeightRange,
    distortionMaxPct: s.proDistortionMaxPct,
    setDistortionMaxPct: s.setProDistortionMaxPct,
    breathingMinScore: s.proBreathingMinScore,
    setBreathingMinScore: s.setProBreathingMinScore,
    goalPreset: s.goalPreset,
    setGoalPreset: s.setGoalPreset,
    goalWeights: s.goalWeights,
    setGoalWeights: s.setGoalWeights,
    caps: s.availabilityCaps,
    undoLastFilter: s.undoLastFilter,
    continueTo: s.continueTo,
    resetFilters: s.resetFilters,
    softPrice: s.softPrice,
    setSoftPrice: s.setSoftPrice,
    softWeight: s.softWeight,
    setSoftWeight: s.setSoftWeight,
    softDistortion: s.softDistortion,
    setSoftDistortion: s.setSoftDistortion,
    softBreathing: s.softBreathing,
    setSoftBreathing: s.setSoftBreathing,
  }), shallow);

  const onBack = () => continueTo(0);
  const onReset = () => {
    if (caps) {
      resetFilters({ priceBounds: caps.priceBounds, weightBounds: caps.weightBounds });
    } else {
      resetFilters();
    }
  };

  // Track the last changed filter and its human-formatted value for contextual zero-results notice
  const lastChangedLabel = React.useCallback((): string | undefined => {
    const anyState = useFilterStore.getState() as unknown as Record<string, any>;
    const hist: any[] = (anyState['__history__'] as any[]) || [];
    if (hist.length === 0) return undefined;
    const prev = hist[hist.length - 1];
    const cur = useFilterStore.getState();
    const diffs: Array<{ k: string; label: string; detail: string }> = [];
    const fmtRange = (r: { min: number; max: number }, unit?: string) => `${r.min}${unit ? ' ' + unit : ''}–${r.max}${unit ? ' ' + unit : ''}`;
    if (prev.priceRange.min !== cur.priceRange.min || prev.priceRange.max !== cur.priceRange.max) diffs.push({ k: 'priceRange', label: 'Price range', detail: `CHF ${fmtRange(cur.priceRange)}` });
    if (prev.weightRange.min !== cur.weightRange.min || prev.weightRange.max !== cur.weightRange.max) diffs.push({ k: 'weightRange', label: 'Weight range', detail: fmtRange(cur.weightRange, 'g') });
    if (prev.proFocalMin !== cur.proFocalMin || prev.proFocalMax !== cur.proFocalMax) diffs.push({ k: 'focalRange', label: 'Focal range', detail: `${cur.proFocalMin}–${cur.proFocalMax} mm` });
    if (prev.proMaxApertureF !== cur.proMaxApertureF) diffs.push({ k: 'aperture', label: 'Max aperture', detail: `f/${cur.proMaxApertureF.toFixed(1)}` });
    if (prev.proDistortionMaxPct !== cur.proDistortionMaxPct) diffs.push({ k: 'distortion', label: 'Distortion max', detail: `${cur.proDistortionMaxPct.toFixed(1)}%` });
    if (prev.proBreathingMinScore !== cur.proBreathingMinScore) diffs.push({ k: 'breathing', label: 'Breathing min score', detail: cur.proBreathingMinScore.toFixed(1) });
    if (prev.proRequireOIS !== cur.proRequireOIS) diffs.push({ k: 'ois', label: 'Require OIS', detail: cur.proRequireOIS ? 'On' : 'Off' });
    if (prev.sealed !== cur.sealed) diffs.push({ k: 'sealed', label: 'Weather sealed', detail: cur.sealed ? 'On' : 'Off' });
    if (prev.isMacro !== cur.isMacro) diffs.push({ k: 'macro', label: 'Macro capable', detail: cur.isMacro ? 'On' : 'Off' });
    const last = diffs[diffs.length - 1];
    return last?.label;
  }, []);

  const lastChangedDetail = React.useCallback((): string | undefined => {
    const anyState = useFilterStore.getState() as unknown as Record<string, any>;
    const hist: any[] = (anyState['__history__'] as any[]) || [];
    if (hist.length === 0) return undefined;
    const prev = hist[hist.length - 1];
    const cur = useFilterStore.getState();
    const diffs: Array<{ k: string; label: string; detail: string }> = [];
    const fmtRange = (r: { min: number; max: number }, unit?: string) => `${r.min}${unit ? ' ' + unit : ''}–${r.max}${unit ? ' ' + unit : ''}`;
    if (prev.priceRange.min !== cur.priceRange.min || prev.priceRange.max !== cur.priceRange.max) diffs.push({ k: 'priceRange', label: 'Price range', detail: `CHF ${fmtRange(cur.priceRange)}` });
    if (prev.weightRange.min !== cur.weightRange.min || prev.weightRange.max !== cur.weightRange.max) diffs.push({ k: 'weightRange', label: 'Weight range', detail: fmtRange(cur.weightRange, 'g') });
    if (prev.proFocalMin !== cur.proFocalMin || prev.proFocalMax !== cur.proFocalMax) diffs.push({ k: 'focalRange', label: 'Focal range', detail: `${cur.proFocalMin}–${cur.proFocalMax} mm` });
    if (prev.proMaxApertureF !== cur.proMaxApertureF) diffs.push({ k: 'aperture', label: 'Max aperture', detail: `f/${cur.proMaxApertureF.toFixed(1)}` });
    if (prev.proDistortionMaxPct !== cur.proDistortionMaxPct) diffs.push({ k: 'distortion', label: 'Distortion max', detail: `${cur.proDistortionMaxPct.toFixed(1)}%` });
    if (prev.proBreathingMinScore !== cur.proBreathingMinScore) diffs.push({ k: 'breathing', label: 'Breathing min score', detail: cur.proBreathingMinScore.toFixed(1) });
    if (prev.proRequireOIS !== cur.proRequireOIS) diffs.push({ k: 'ois', label: 'Require OIS', detail: cur.proRequireOIS ? 'On' : 'Off' });
    if (prev.sealed !== cur.sealed) diffs.push({ k: 'sealed', label: 'Weather sealed', detail: cur.sealed ? 'On' : 'Off' });
    if (prev.isMacro !== cur.isMacro) diffs.push({ k: 'macro', label: 'Macro capable', detail: cur.isMacro ? 'On' : 'Off' });
    const last = diffs[diffs.length - 1];
    return last?.detail;
  }, []);

  // Predictive impact: compute counts if this single control is relaxed to its availability bound
  const predictive = useMemo(() => {
    if (!caps || lenses.length === 0) return null as null | Record<string, { count: number; apply: () => void; label: string }>;
    const base = {
      brand, lensType, sealed, isMacro,
      priceRange, weightRange,
      proCoverage: coverage,
      proFocalMin: focalMin,
      proFocalMax: focalMax,
      proMaxApertureF: maxApertureF,
      proRequireOIS: requireOIS,
      proRequireSealed: sealed,
      proRequireMacro: isMacro,
      proPriceMax: priceRange.max,
      proWeightMax: weightRange.max,
      proDistortionMaxPct: distortionMaxPct,
      proBreathingMinScore: breathingMinScore,
    };

    const countWith = (over: Partial<typeof base>) => applyFilters({
      lenses,
      cameraName: selectedCameraName,
      cameraMount: camera?.mount,
      ...base,
      ...over,
    }).length;

    const suggestions: Record<string, { count: number; apply: () => void; label: string }> = {};
    // Price range → full bounds
    suggestions.priceRange = {
      count: countWith({ priceRange: { ...caps.priceBounds } }),
      apply: () => setPriceRange({ ...caps.priceBounds }),
      label: `CHF ${caps.priceBounds.min}–${caps.priceBounds.max}`,
    };
    // Weight range → full bounds
    suggestions.weightRange = {
      count: countWith({ weightRange: { ...caps.weightBounds } }),
      apply: () => setWeightRange({ ...caps.weightBounds }),
      label: `${caps.weightBounds.min}–${caps.weightBounds.max} g`,
    };
    // Focal range → full bounds
    suggestions.focalRange = {
      count: countWith({ proFocalMin: caps.focalBounds.min, proFocalMax: caps.focalBounds.max }),
      apply: () => { setFocalMin(caps.focalBounds.min); setFocalMax(caps.focalBounds.max); },
      label: `${caps.focalBounds.min}–${caps.focalBounds.max} mm`,
    };
    // Aperture → looser (max allowed)
    suggestions.aperture = {
      count: countWith({ proMaxApertureF: caps.apertureMaxMax }),
      apply: () => setMaxApertureF(caps.apertureMaxMax),
      label: `f/${caps.apertureMaxMax.toFixed(1)}`,
    };
    // Distortion → looser (max allowed)
    suggestions.distortion = {
      count: countWith({ proDistortionMaxPct: caps.distortionMaxMax }),
      apply: () => setDistortionMaxPct(caps.distortionMaxMax),
      label: `${caps.distortionMaxMax.toFixed(1)}%`,
    };
    // Breathing → looser (min allowed)
    suggestions.breathing = {
      count: countWith({ proBreathingMinScore: caps.breathingMinMin }),
      apply: () => setBreathingMinScore(caps.breathingMinMin),
      label: `${caps.breathingMinMin.toFixed(1)}`,
    };
    return suggestions;
  }, [caps, lenses, camera, selectedCameraName, brand, lensType, sealed, isMacro, priceRange, weightRange, coverage, focalMin, focalMax, maxApertureF, requireOIS, distortionMaxPct, breathingMinScore]);

  // Density tracks for price and weight
  const { priceTrackStyle, weightTrackStyle, currentPriceBounds, currentWeightBounds } = useMemo(() => {
    if (!caps || lenses.length === 0) return { priceTrackStyle: {} as React.CSSProperties, weightTrackStyle: {} as React.CSSProperties };
    const makeDensity = (vals: number[], minVal: number, maxVal: number, buckets = 24) => {
      if (maxVal <= minVal) return [] as number[];
      const hist = new Array(buckets).fill(0);
      const span = maxVal - minVal;
      vals.forEach(v => {
        const i = Math.min(buckets - 1, Math.max(0, Math.floor(((v - minVal) / span) * buckets)));
        hist[i] += 1;
      });
      const maxCount = Math.max(1, ...hist);
      return hist.map(h => h / maxCount);
    };
    const baseFilters = {
      brand, lensType, sealed, isMacro,
      proCoverage: coverage,
      proFocalMin: focalMin, proFocalMax: focalMax,
      proMaxApertureF: maxApertureF,
      proRequireOIS: requireOIS,
      proRequireSealed: sealed,
      proRequireMacro: isMacro,
      proDistortionMaxPct: distortionMaxPct,
      proBreathingMinScore: breathingMinScore,
    };
    // Price density: ignore current price/weight cuts
    const pricePool = applyFilters({
      lenses,
      cameraName,
      cameraMount: camera?.mount,
      ...baseFilters,
      priceRange: { ...caps.priceBounds },
      weightRange: { ...caps.weightBounds },
      proPriceMax: caps.priceBounds.max,
      proWeightMax: caps.weightBounds.max,
    });
    const priceVals = pricePool.map(l => l.price_chf).filter(v => Number.isFinite(v));
    const priceDensity = makeDensity(priceVals, caps.priceBounds.min, caps.priceBounds.max);
    const priceStops = priceDensity.map((a, i, arr) => {
      const start = (i / arr.length) * 100;
      const end = ((i + 1) / arr.length) * 100;
      const alpha = (0.1 + 0.35 * a).toFixed(3);
      return `rgba(var(--accent-rgb),${alpha}) ${start}%, rgba(var(--accent-rgb),${alpha}) ${end}%`;
    }).join(',');
    const priceTrackStyle: React.CSSProperties = priceDensity.length
      ? { backgroundImage: `linear-gradient(90deg, ${priceStops})` }
      : {};

    // Weight density
    const weightPool = pricePool; // same pool is fine
    const weightVals = weightPool.map(l => l.weight_g).filter(v => Number.isFinite(v));
    const weightDensity = makeDensity(weightVals, caps.weightBounds.min, caps.weightBounds.max);
    const weightStops = weightDensity.map((a, i, arr) => {
      const start = (i / arr.length) * 100;
      const end = ((i + 1) / arr.length) * 100;
      const alpha = (0.1 + 0.35 * a).toFixed(3);
      return `rgba(var(--accent-rgb),${alpha}) ${start}%, rgba(var(--accent-rgb),${alpha}) ${end}%`;
    }).join(',');
    const weightTrackStyle: React.CSSProperties = weightDensity.length
      ? { backgroundImage: `linear-gradient(90deg, ${weightStops})` }
      : {};

    const currentPriceBounds = priceVals.length ? { min: Math.min(...priceVals), max: Math.max(...priceVals) } : { ...caps.priceBounds };
    const currentWeightBounds = weightVals.length ? { min: Math.min(...weightVals), max: Math.max(...weightVals) } : { ...caps.weightBounds };
    return { priceTrackStyle, weightTrackStyle, currentPriceBounds, currentWeightBounds };
  }, [caps, lenses, camera, selectedCameraName, brand, lensType, sealed, isMacro, coverage, focalMin, focalMax, maxApertureF, requireOIS, distortionMaxPct, breathingMinScore]);

  return (
    <BaseRequirements
      title="Your requirements"
      resultsCount={resultsCount}
      cameras={cameras}
      cameraName={cameraName}
      setCameraName={setCameraName}
      brandOptions={(caps?.brands || (brandsForCamera || []))}
      brand={brand}
      setBrand={setBrand}
      lensTypeOptions={(caps?.lensTypes || ['Any', 'Prime', 'Zoom'])}
      lensType={lensType}
      setLensType={setLensType}
      sealed={sealed}
      setSealed={setSealed}
      isMacro={isMacro}
      setIsMacro={setIsMacro}
      onBack={onBack}
      onReset={onReset}
      onContinue={onContinue}
    >

      <CollapsibleMessage variant="info" title="How to use hard specs" defaultOpen={false}>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li><strong>Coverage</strong>: {FIELD_HELP.coverage}</li>
          <li><strong>Focal range</strong>: {FIELD_HELP.focalRange}</li>
          <li><strong>Max aperture</strong>: {FIELD_HELP.maxAperture}</li>
          <li><strong>Price/Weight</strong>: {FIELD_HELP.price} {FIELD_HELP.weight}</li>
          <li><strong>Video constraints</strong>: {FIELD_HELP.distortionMax} {FIELD_HELP.breathingMin}</li>
          <li><strong>Tip</strong>: If results hit zero, use the quick reset suggestions shown above the fields.</li>
        </ul>
      </CollapsibleMessage>

      {/* No standalone zero-results block; warnings will be integrated inline */}

      {/* brand/type selectors and camera are handled by BaseRequirements */}

      {/* Quick reset limiting filters: pick top 1–3 suggestions when results shrink or hit zero */}
      {/* Optional micro-hint row can remain for positive counts if desired; omit for now */}

      <div>
        <LabeledSelect label="Coverage" infoText={FIELD_HELP.coverage} value={coverage} onChange={setCoverage}>
          {(caps?.coverage || ['Any', 'Full Frame', 'APS-C']).map(c => <option key={c} value={c}>{c}</option>)}
        </LabeledSelect>
      </div>
      <div>
        <LabeledSlider
          label="Max aperture (f/)"
          infoText={FIELD_HELP.maxAperture}
          min={0.7}
          max={caps?.apertureMaxMax ?? 16}
          step={0.1}
          value={maxApertureF}
          onChange={(v) => setMaxApertureF(v)}
          format={(v) => `f/${v.toFixed(1)}`}
          hint={caps && maxApertureF >= (caps.apertureMaxMax ?? 16) ? 'at limit' : undefined}
          warningTip={(resultsCount === 0 && lastChangedLabel() === 'Max aperture' && lastChangedDetail()) ? `No matches after setting ${lastChangedDetail()}. Try loosening related filters.` : undefined}
          status={(function () {
            if (!caps) return undefined;
            // Tight when at bounds; normal when free
            const atEdge = maxApertureF <= 0.7 || maxApertureF >= (caps.apertureMaxMax ?? 16);
            return atEdge ? 'warning' as const : 'normal' as const;
          })()}
          // Inline hover message when results drop to zero because of latest change
          right={undefined}
        />
      </div>

      <div>
        <LabeledRange
          label="Desired focal range (mm)"
          infoText={caps?.focalBounds ? `${FIELD_HELP.focalRange} Available ${caps.focalBounds.min}–${caps.focalBounds.max} mm.` : FIELD_HELP.focalRange}
          min={caps?.focalBounds?.min ?? 8}
          max={caps?.focalBounds?.max ?? 1200}
          step={1}
          value={{ min: focalMin, max: focalMax }}
          onChange={(r) => { setFocalMin(r.min); setFocalMax(r.max); }}
          format={(v) => `${v} mm`}
          ticks={caps?.focalTicks}
          snap
          hint={caps && focalMin <= (caps.focalBounds?.min ?? -Infinity) && focalMax >= (caps.focalBounds?.max ?? Infinity) ? 'at limit' : undefined}
          warningTip={(resultsCount === 0 && lastChangedLabel() === 'Focal range' && lastChangedDetail()) ? `No matches after adjusting Focal range to ${lastChangedDetail()}.` : undefined}
          status={(function () {
            if (!caps) return undefined;
            const tight = focalMin <= (caps.focalBounds?.min ?? -Infinity) || focalMax >= (caps.focalBounds?.max ?? Infinity);
            return tight ? 'warning' as const : 'normal' as const;
          })()}
        />
      </div>

      <div className={STACK_Y}>
        <div>
          <LabeledRange
            label="Price (CHF)"
            infoText={caps ? `${FIELD_HELP.price} Available now ${currentPriceBounds?.min ?? caps.priceBounds.min}–${currentPriceBounds?.max ?? caps.priceBounds.max}.` : FIELD_HELP.price}
            min={caps?.priceBounds.min ?? 0}
            max={caps?.priceBounds.max ?? 10000}
            step={50}
            value={{ min: priceRange.min, max: priceRange.max }}
            onChange={(r) => setPriceRange(r)}
            format={(v) => `CHF ${v}`}
            ticks={caps?.priceTicks}
            snap
            trackStyle={priceTrackStyle}
            right={predictive ? <span className={TEXT_2XS_MUTED}>→ {predictive.priceRange?.count ?? 0}</span> : undefined}
            hint={undefined}
            warningTip={(function () {
              if (resultsCount !== 0) return undefined;
              const label = lastChangedLabel();
              const detail = lastChangedDetail();
              if (label === 'Price range' && detail) return `No matches after setting ${detail}.`;
              return 'No matches with the current filters. Try loosening this range.';
            })()}
            status={(function () {
              if (!caps) return undefined;
              const tight = priceRange.min <= (caps.priceBounds.min) || priceRange.max >= (caps.priceBounds.max);
              return tight ? 'warning' as const : 'normal' as const;
            })()}
            softPreference={{ checked: softPrice, onChange: setSoftPrice, id: 'soft-price', label: 'Soft preference' }}
          />
        </div>
        <div>
          <LabeledRange
            label="Weight (g)"
            infoText={caps ? `${FIELD_HELP.weight} Available now ${currentWeightBounds?.min ?? caps.weightBounds.min}–${currentWeightBounds?.max ?? caps.weightBounds.max}.` : FIELD_HELP.weight}
            min={caps?.weightBounds.min ?? 0}
            max={caps?.weightBounds.max ?? 5000}
            step={10}
            value={{ min: weightRange.min, max: weightRange.max }}
            onChange={(r) => setWeightRange(r)}
            format={(v) => `${v} g`}
            ticks={caps?.weightTicks}
            snap
            trackStyle={weightTrackStyle}
            right={predictive ? <span className={TEXT_2XS_MUTED}>→ {predictive.weightRange?.count ?? 0}</span> : undefined}
            hint={undefined}
            warningTip={(function () {
              if (resultsCount !== 0) return undefined;
              const label = lastChangedLabel();
              const detail = lastChangedDetail();
              if (label === 'Weight range' && detail) return `No matches after setting ${detail}.`;
              return 'No matches with the current filters. Try loosening this range.';
            })()}
            status={(function () {
              if (!caps) return undefined;
              const tight = weightRange.min <= (caps.weightBounds.min) || weightRange.max >= (caps.weightBounds.max);
              return tight ? 'warning' as const : 'normal' as const;
            })()}
            softPreference={{ checked: softWeight, onChange: setSoftWeight, id: 'soft-weight', label: 'Soft preference' }}
          />
        </div>
      </div>

      <div className={STACK_Y}>
        <div>
          <LabeledSlider
            label="Distortion max (%)"
            infoText={FIELD_HELP.distortionMax}
            min={0}
            max={caps?.distortionMaxMax ?? 10}
            step={0.1}
            value={distortionMaxPct}
            onChange={(v) => setDistortionMaxPct(v)}
            format={(v) => `${v.toFixed(1)}%`}
            right={undefined}
            hint={undefined}
            warningTip={(resultsCount === 0 && lastChangedLabel() === 'Distortion max' && lastChangedDetail()) ? `No matches after setting Distortion to ${lastChangedDetail()}.` : undefined}
            status={(function () {
              if (!caps) return undefined;
              const tight = distortionMaxPct >= (caps.distortionMaxMax ?? 10) || distortionMaxPct <= 0;
              return tight ? 'warning' as const : 'normal' as const;
            })()}
            softPreference={{ checked: softDistortion, onChange: setSoftDistortion, id: 'soft-distortion', label: 'Soft preference' }}
          />
        </div>
        <div>
          <LabeledSlider
            label="Focus breathing score min"
            infoText={FIELD_HELP.breathingMin}
            min={caps?.breathingMinMin ?? 0}
            max={10}
            step={0.5}
            value={breathingMinScore}
            onChange={(v) => setBreathingMinScore(v)}
            format={(v) => v.toFixed(1)}
            right={undefined}
            warningTip={(resultsCount === 0 && lastChangedLabel() === 'Breathing min score' && lastChangedDetail()) ? `No matches after setting Breathing score to ${lastChangedDetail()}.` : undefined}
            status={(function () {
              if (!caps) return undefined;
              const tight = breathingMinScore <= (caps.breathingMinMin ?? 0) || breathingMinScore >= 10;
              return tight ? 'warning' as const : 'normal' as const;
            })()}
            softPreference={{ checked: softBreathing, onChange: setSoftBreathing, id: 'soft-breathing', label: 'Soft preference' }}
          />
        </div>
      </div>

      <CheckboxGroup
        label="Build and capabilities"
        infoText="Quick toggles for key build features."
        items={[
          { key: 'sealed', label: 'Weather sealed', checked: sealed, onChange: setSealed, id: 'opt-sealed', infoText: 'Only include lenses with weather sealing/gaskets for better environmental protection.' },
          { key: 'macro', label: 'Macro', checked: isMacro, onChange: setIsMacro, id: 'opt-macro', infoText: 'Only include lenses capable of close‑focus macro work (1:1 or close).' },
          { key: 'ois', label: 'Require OIS', checked: requireOIS, onChange: setRequireOIS, id: 'opt-ois', infoText: FIELD_HELP.requireOIS },
        ]}
      />

      <div className={DIVIDER_T}>
        <GoalPresetWeights
          preset={goalPreset}
          onChangePreset={setGoalPreset}
          weights={goalWeights}
          onChangeWeights={setGoalWeights}
          presets={PRESETS}
        />
      </div>

      {/* actions rendered by BaseRequirements */}
    </BaseRequirements>
  );
}


