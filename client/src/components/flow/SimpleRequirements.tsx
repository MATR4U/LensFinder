import Button from '../ui/Button';
import React from 'react';
import type { Camera, Lens } from '../../types';
import Info from '../ui/Info';
import { TITLE_H2, CARD_PADDED, GRID_TWO_GAP3, STACK_Y, ROW_BETWEEN, BADGE_COUNT, INLINE_CHIPS_ROW, ACTION_ROW } from '../ui/styles';
import RangeSlider from '../ui/RangeSlider';
import LabeledSelect from '../ui/fields/LabeledSelect';
import LabeledCheckbox from '../ui/fields/LabeledCheckbox';
import CheckboxGroup from '../ui/fields/CheckboxGroup';
import LabeledRange from '../ui/fields/LabeledRange';
import { useFilterStore } from '../../stores/filterStore';
import { PRESETS } from '../../lib/recommender';
import { shallow } from 'zustand/shallow';
import { applyFilters } from '../../lib/filters';
import GoalPresetWeights from '../ui/fields/GoalPresetWeights';
import { FIELD_HELP } from '../ui/fieldHelp';
import CollapsibleMessage from '../ui/CollapsibleMessage';

type Props = {
  cameras: Camera[];
  brandsForCamera: string[];
  onContinue: () => void;
  resultsCount?: number;
  camera?: Camera;
  cameraName?: string;
  lenses?: Lens[];
};

export default function SimpleRequirements(props: Props) {
  const { cameras, brandsForCamera, onContinue, resultsCount = 0, camera, cameraName: selectedCameraName = 'Any', lenses = [] } = props;

  const {
    cameraName, setCameraName,
    brand, setBrand,
    lensType, setLensType,
    sealed, setSealed,
    isMacro, setIsMacro,
    priceRange, setPriceRange,
    weightRange, setWeightRange,
    goalPreset, setGoalPreset,
    setGoalWeights,
    caps,
    undoLastFilter,
    resetFilters,
  } = useFilterStore((s) => ({
    cameraName: s.cameraName,
    setCameraName: s.setCameraName,
    brand: s.brand,
    setBrand: s.setBrand,
    lensType: s.lensType,
    setLensType: s.setLensType,
    sealed: s.sealed,
    setSealed: s.setSealed,
    isMacro: s.isMacro,
    setIsMacro: s.setIsMacro,
    priceRange: s.priceRange,
    setPriceRange: s.setPriceRange,
    weightRange: s.weightRange,
    setWeightRange: s.setWeightRange,
    goalPreset: s.goalPreset,
    setGoalPreset: s.setGoalPreset,
    setGoalWeights: s.setGoalWeights,
    caps: s.availabilityCaps,
    undoLastFilter: s.undoLastFilter,
    resetFilters: s.resetFilters,
  }), shallow);

  const onBack = () => undoLastFilter();
  const onReset = () => {
    if (caps) {
      resetFilters({ priceBounds: caps.priceBounds, weightBounds: caps.weightBounds });
    } else {
      resetFilters();
    }
  };

  // Density tracks for price and weight (Simple)
  const { priceTrackStyle, weightTrackStyle } = React.useMemo(() => {
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
    const baseFilters = { brand, lensType, sealed, isMacro };
    const pool = applyFilters({
      lenses,
      cameraName: selectedCameraName ?? 'Any',
      cameraMount: camera?.mount,
      ...baseFilters,
      priceRange: caps.priceBounds,
      weightRange: caps.weightBounds,
      proCoverage: 'Any',
      proFocalMin: 0,
      proFocalMax: 9999,
      proMaxApertureF: 99,
      proRequireOIS: false,
      proRequireSealed: false,
      proRequireMacro: false,
      proPriceMax: caps.priceBounds.max,
      proWeightMax: caps.weightBounds.max,
      proDistortionMaxPct: 100,
      proBreathingMinScore: 0,
    });
    const priceVals = pool.map(l => l.price_chf).filter(v => Number.isFinite(v));
    const priceDensity = makeDensity(priceVals, caps.priceBounds.min, caps.priceBounds.max);
    const priceStops = priceDensity.map((a, i, arr) => {
      const start = (i / arr.length) * 100;
      const end = ((i + 1) / arr.length) * 100;
      const alpha = (0.1 + 0.35 * a).toFixed(3);
      return `rgba(var(--accent-rgb),${alpha}) ${start}%, rgba(var(--accent-rgb),${alpha}) ${end}%`;
    }).join(',');
    const priceTrackStyle: React.CSSProperties = priceDensity.length ? { backgroundImage: `linear-gradient(90deg, ${priceStops})` } : {};
    const weightVals = pool.map(l => l.weight_g).filter(v => Number.isFinite(v));
    const weightDensity = makeDensity(weightVals, caps.weightBounds.min, caps.weightBounds.max);
    const weightStops = weightDensity.map((a, i, arr) => {
      const start = (i / arr.length) * 100;
      const end = ((i + 1) / arr.length) * 100;
      const alpha = (0.1 + 0.35 * a).toFixed(3);
      return `rgba(var(--accent-rgb),${alpha}) ${start}%, rgba(var(--accent-rgb),${alpha}) ${end}%`;
    }).join(',');
    const weightTrackStyle: React.CSSProperties = weightDensity.length ? { backgroundImage: `linear-gradient(90deg, ${weightStops})` } : {};
    return { priceTrackStyle, weightTrackStyle };
  }, [caps, lenses, camera, selectedCameraName, brand, lensType, sealed, isMacro]);

  return (
    <div className={CARD_PADDED}>
      <div className={ROW_BETWEEN}>
        <h2 className={TITLE_H2}>Your requirements</h2>
        <span className={BADGE_COUNT}>{resultsCount} matches</span>
      </div>

      <CollapsibleMessage variant="info" title="How to use these filters" defaultOpen={false}>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li><strong>Camera</strong>: {FIELD_HELP.cameraBody}</li>
          <li><strong>Brand/Type</strong>: Filter by maker and choose Prime (single focal length) or Zoom (range).</li>
          <li><strong>Price/Weight</strong>: {FIELD_HELP.price} {FIELD_HELP.weight}</li>
          <li><strong>Priorities</strong>: {FIELD_HELP.goalPreset}</li>
        </ul>
      </CollapsibleMessage>

      {/* Inline active filter chips */}
      <div className={INLINE_CHIPS_ROW}>
        {brand !== 'Any' && (<Button variant="secondary" size="xs" onClick={() => setBrand('Any')}>Brand: {brand} ✕</Button>)}
        {lensType !== 'Any' && (<Button variant="secondary" size="xs" onClick={() => setLensType('Any')}>Type: {lensType} ✕</Button>)}
        {sealed && (<Button variant="secondary" size="xs" onClick={() => setSealed(false)}>Sealed ✕</Button>)}
        {isMacro && (<Button variant="secondary" size="xs" onClick={() => setIsMacro(false)}>Macro ✕</Button>)}
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-muted)]">Camera Body <Info text={FIELD_HELP.cameraBody} /></label>
        <LabeledSelect label="Camera Body" value={cameraName} onChange={setCameraName}>
          <option key="Any" value="Any">Any</option>
          {cameras.map((c) => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
        </LabeledSelect>
      </div>

      <div className={GRID_TWO_GAP3}>
        <div>
          <label className="block text-sm font-medium text-[var(--text-muted)]">Brand <Info text="Filter by lens manufacturer. Only brands compatible with the selected mount are shown." /></label>
          <LabeledSelect label="Brand" value={brand} onChange={setBrand}>
            {(caps?.brands || brandsForCamera).map((b) => <option key={b} value={b}>{b}</option>)}
          </LabeledSelect>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-muted)]">Lens Type <Info text="Primes have a single focal length (often lighter/faster). Zooms cover a range (more flexible)." /></label>
          <LabeledSelect label="Lens Type" value={lensType} onChange={setLensType}>
            {(caps?.lensTypes || ['Any', 'Prime', 'Zoom']).map((t) => <option key={t} value={t}>{t}</option>)}
          </LabeledSelect>
        </div>
      </div>

      <CheckboxGroup
        label="Build and capabilities"
        infoText="Quick toggles for key build features."
        items={[
          { key: 'sealed', label: 'Weather sealed', checked: sealed, onChange: setSealed, id: 'opt-sealed-simple', infoText: 'Only include lenses with weather sealing/gaskets for better environmental protection.' },
          { key: 'macro', label: 'Macro', checked: isMacro, onChange: setIsMacro, id: 'opt-macro-simple', infoText: 'Only include lenses capable of close‑focus macro work (1:1 or close).' },
        ]}
      />

      <div>
        <LabeledRange
          label="Price (CHF)"
          infoText={caps ? `${FIELD_HELP.price} Available range ${caps.priceBounds.min}–${caps.priceBounds.max}.` : FIELD_HELP.price}
          min={caps?.priceBounds.min ?? 0}
          max={caps?.priceBounds.max ?? 8000}
          step={50}
          value={priceRange}
          onChange={(r) => setPriceRange(r)}
          format={(v) => `CHF ${v}`}
          ticks={caps?.priceTicks}
          snap
        />
      </div>

      <div>
        <LabeledRange
          label="Weight (g)"
          infoText={caps ? `${FIELD_HELP.weight} Available range ${caps.weightBounds.min}–${caps.weightBounds.max}.` : FIELD_HELP.weight}
          min={caps?.weightBounds.min ?? 0}
          max={caps?.weightBounds.max ?? 3000}
          step={10}
          value={weightRange}
          onChange={(r) => setWeightRange(r)}
          format={(v) => `${v} g`}
          ticks={caps?.weightTicks}
          snap
        />
      </div>

      <div>
        <GoalPresetWeights
          preset={goalPreset}
          onChangePreset={setGoalPreset}
          weights={{}}
          onChangeWeights={() => { }}
          presets={PRESETS}
          showWeights={false}
        />
      </div>

      <div className="flex justify-between">
        <div className={ACTION_ROW}>
          <Button variant="secondary" onClick={onBack}>Back</Button>
          <Button variant="secondary" onClick={onReset}>Reset</Button>
        </div>
        <Button onClick={onContinue} aria-label="See results">See results ({resultsCount})</Button>
      </div>
    </div>
  );
}


