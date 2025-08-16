import React, { useMemo } from 'react';
import type { Camera, Lens } from '../../types';
import Info from '../ui/Info';
import RangeSlider from '../ui/RangeSlider';
import LabeledSelect from '../ui/fields/LabeledSelect';
import LabeledCheckbox from '../ui/fields/LabeledCheckbox';
import CheckboxGroup from '../ui/fields/CheckboxGroup';
import Checkbox from '../ui/Checkbox';
import LabeledRange from '../ui/fields/LabeledRange';
import MetricRange from './MetricRange';
import LabeledSegmentedControl, { type SegmentOption } from '../ui/fields/LabeledSegmentedControl';
import LabeledSlider from '../ui/fields/LabeledSlider';
import Button from '../ui/Button';
import { TITLE_H2, TEXT_XS_MUTED, GRID_TWO_GAP3, STACK_Y, DIVIDER_T, TEXT_2XS_MUTED, INLINE_LABEL_MUTED_XS } from '../ui/styles';
import { useFilterStore } from '../../stores/filterStore';
import { PRESETS } from '../../lib/recommender';
import { shallow } from 'zustand/shallow';
import { applyFilters, buildFilterInput } from '../../lib/filters';
import { computeNormalizedHistogram, gradientStyleFromNormalized } from '../../lib/hist';
import { useLastChangedDiff } from '../../hooks/useLastChangedDiff';
import { usePredictiveSuggestions } from '../../hooks/usePredictiveSuggestions';
import GoalPresetWeights from '../ui/fields/GoalPresetWeights';
import { FIELD_HELP } from '../ui/fieldHelp';
import CollapsibleMessage from '../ui/CollapsibleMessage';
import BaseRequirements from './BaseRequirements';
import StageNav from '../ui/StageNav';
import FocalRange from './FocalRange';
import { AvailabilityProvider, useAvailability } from '../../context/AvailabilityContext';
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
    enablePrice, enableWeight, enableDistortion, enableBreathing,
    setEnablePrice, setEnableWeight, setEnableDistortion, setEnableBreathing,
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
    enablePrice: s.enablePrice,
    enableWeight: s.enableWeight,
    enableDistortion: s.enableDistortion,
    enableBreathing: s.enableBreathing,
    setEnablePrice: s.setEnablePrice,
    setEnableWeight: s.setEnableWeight,
    setEnableDistortion: s.setEnableDistortion,
    setEnableBreathing: s.setEnableBreathing,
  }), shallow);

  const onBack = () => continueTo(1);
  const onReset = () => {
    if (caps) {
      resetFilters({ priceBounds: caps.priceBounds, weightBounds: caps.weightBounds });
    } else {
      resetFilters();
    }
  };

  // Track the last changed filter and its human-formatted value for contextual zero-results notice
  const { getLabel: lastChangedLabel, getDetail: lastChangedDetail } = useLastChangedDiff();

  // Predictive impact: compute counts if this single control is relaxed to its availability bound
  const predictive = usePredictiveSuggestions({ lenses, camera, cameraName: selectedCameraName });

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
    const sObj: any = {
      lenses,
      cameraName,
      ...baseFilters,
      priceRange: { ...caps.priceBounds },
      weightRange: { ...caps.weightBounds },
      proCoverage: coverage,
      proFocalMin: focalMin,
      proFocalMax: focalMax,
      proMaxApertureF: maxApertureF,
      proRequireOIS: requireOIS,
      proRequireSealed: sealed,
      proRequireMacro: isMacro,
      proPriceMax: caps.priceBounds.max,
      proWeightMax: caps.weightBounds.max,
      proDistortionMaxPct: distortionMaxPct,
      proBreathingMinScore: breathingMinScore,
      softPrice: true,
      softWeight: true,
      softDistortion: true,
      softBreathing: true,
      enablePrice: true,
      enableWeight: true,
      enableDistortion: true,
      enableBreathing: true,
    };
    const pricePool = applyFilters(buildFilterInput(sObj, camera?.mount));
    const priceVals = pricePool.map(l => l.price_chf).filter(v => Number.isFinite(v));
    const priceNorm = computeNormalizedHistogram(priceVals, caps.priceBounds.min, caps.priceBounds.max);
    const priceTrackStyle: React.CSSProperties = gradientStyleFromNormalized(priceNorm);

    // Weight density
    const weightPool = pricePool; // same pool is fine
    const weightVals = weightPool.map(l => l.weight_g).filter(v => Number.isFinite(v));
    const weightNorm = computeNormalizedHistogram(weightVals, caps.weightBounds.min, caps.weightBounds.max);
    const weightTrackStyle: React.CSSProperties = gradientStyleFromNormalized(weightNorm);

    const currentPriceBounds = priceVals.length ? { min: Math.min(...priceVals), max: Math.max(...priceVals) } : { ...caps.priceBounds };
    const currentWeightBounds = weightVals.length ? { min: Math.min(...weightVals), max: Math.max(...weightVals) } : { ...caps.weightBounds };
    return { priceTrackStyle, weightTrackStyle, currentPriceBounds, currentWeightBounds };
  }, [caps, lenses, camera, selectedCameraName, brand, lensType, sealed, isMacro, coverage, focalMin, focalMax, maxApertureF, requireOIS, distortionMaxPct, breathingMinScore]);

  // Current filtered list for histogram foregrounds
  const currentFiltered = useMemo(() => {
    const filters = {
      cameraName: selectedCameraName,
      brand,
      lensType,
      sealed,
      isMacro,
      priceRange,
      weightRange,
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
      softPrice,
      softWeight,
      softDistortion,
      softBreathing,
    } as any;
    return applyFilters({ lenses: lenses || [], cameraName: selectedCameraName, cameraMount: camera?.mount, ...filters });
  }, [lenses, selectedCameraName, camera, brand, lensType, sealed, isMacro, priceRange, weightRange, coverage, focalMin, focalMax, maxApertureF, requireOIS, distortionMaxPct, breathingMinScore, softPrice, softWeight, softDistortion, softBreathing]);

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
      showPrimarySelectors={false}
      sealed={sealed}
      setSealed={setSealed}
      isMacro={isMacro}
      setIsMacro={setIsMacro}
      onBack={onBack}
      onReset={onReset}
      onContinue={onContinue}
    >
      <div className="mb-2">
        <GoalPresetWeights
          preset={goalPreset}
          onChangePreset={setGoalPreset}
          weights={goalWeights}
          onChangeWeights={setGoalWeights}
          presets={PRESETS}
          showWeights={false}
          optionSuffixMap={undefined}
        />
      </div>
      {/** compute foreground arrays from current filtered results */}
      {(() => null)()}
      <CollapsibleMessage variant="neutral" title="Tune your requirements" defaultOpen={false} className="max-w-3xl">
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

      {/* Coverage is selected in the Build & capabilities pre-stage */}
      <div>
        {(() => {
          const values = [1.4, 1.8, 2.0, 2.8, 3.5, 4.0, 5.6, 8.0, 11.0, 16.0].filter(v => (caps?.apertureMaxMax ? v <= caps.apertureMaxMax : true));
          const ticks = values.map(v => Number(v.toFixed(1)));
          const minTick = ticks[0] ?? 1.4;
          const maxTick = ticks[ticks.length - 1] ?? (caps?.apertureMaxMax ?? 16.0);
          return (
            <LabeledSlider
              label="Max aperture (f/)"
              infoText={FIELD_HELP.maxAperture}
              min={minTick}
              max={maxTick}
              step={0.1}
              value={maxApertureF}
              onChange={(v) => setMaxApertureF(Number(v))}
              ticks={ticks}
              snap
              format={(v) => v.toFixed(1)}
              idPrefix="aperture"
            />
          );
        })()}
      </div>

      <div>
        <FocalRange
          warningTip={(resultsCount === 0 && lastChangedLabel() === 'Focal range' && lastChangedDetail()) ? `No matches after adjusting Focal range to ${lastChangedDetail()}.` : undefined}
          status={(resultsCount === 0 && lastChangedLabel() === 'Focal range') ? 'blocking' : undefined}
        />
      </div>

      <div className={STACK_Y}>
        <div>
          <MetricRange
            metric="price"
            warningTip={resultsCount === 0
              ? (lastChangedLabel() === 'Price range' && lastChangedDetail()
                ? `No matches after adjusting Price range to ${lastChangedDetail()}.`
                : 'No matches with current filters.')
              : undefined}
            status={resultsCount === 0 && lastChangedLabel() === 'Price range' ? 'blocking' : undefined}
          />
        </div>
        <div>
          <MetricRange metric="weight" warningTip={(resultsCount === 0 && lastChangedLabel() === 'Weight range' && lastChangedDetail()) ? `No matches after adjusting Weight range to ${lastChangedDetail()}.` : undefined} status={(resultsCount === 0 && lastChangedLabel() === 'Weight range') ? 'blocking' : undefined} />
        </div>
      </div>

      <div className={STACK_Y}>
        <div>
          <MetricRange metric="distortion" warningTip={(resultsCount === 0 && lastChangedLabel() === 'Distortion max' && lastChangedDetail()) ? `No matches after adjusting Distortion max to ${lastChangedDetail()}.` : undefined} status={(resultsCount === 0 && lastChangedLabel() === 'Distortion max') ? 'blocking' : undefined} />
        </div>
        <div>
          <MetricRange metric="breathing" warningTip={(resultsCount === 0 && lastChangedLabel() === 'Breathing min score' && lastChangedDetail()) ? `No matches after adjusting Breathing min score to ${lastChangedDetail()}.` : undefined} status={(resultsCount === 0 && lastChangedLabel() === 'Breathing min score') ? 'blocking' : undefined} />
        </div>
      </div>

      {/* Build & capabilities are now part of the pre-stage screen. */}

      {/* Moved GoalPresetWeights to top */}

      <StageNav className="mt-4" onBack={onBack} onReset={onReset} onContinue={onContinue} />
    </BaseRequirements>
  );
}


