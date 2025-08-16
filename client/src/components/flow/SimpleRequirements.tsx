import Button from '../ui/Button';
import React from 'react';
import type { Camera, Lens } from '../../types';
import Info from '../ui/Info';
import { GRID_TWO_GAP3, INLINE_CHIPS_ROW } from '../ui/styles';
import LabeledRange from '../ui/fields/LabeledRange';
import MetricRange from './MetricRange';
import { useFilterStore } from '../../stores/filterStore';
import { PRESETS } from '../../lib/recommender';
import { shallow } from 'zustand/shallow';
import { applyFilters, buildFilterInput } from '../../lib/filters';
import GoalPresetWeights from '../ui/fields/GoalPresetWeights';
import { FIELD_HELP } from '../ui/fieldHelp';
import CollapsibleMessage from '../ui/CollapsibleMessage';
import BaseRequirements from './BaseRequirements';
import StageHeader from '../ui/StageHeader';
import StageNav from '../ui/StageNav';
import { AvailabilityProvider, useAvailability } from '../../context/AvailabilityContext';
import { computeNormalizedHistogram, gradientStyleFromNormalized } from '../../lib/hist';

type Props = {
  cameras: Camera[];
  brandsForCamera: string[];
  onContinue: () => void;
  resultsCount?: number;
  camera?: Camera;
  cameraName?: string;
  lenses?: Lens[];
};

function SimpleRequirementsBody(props: Props) {
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
    continueTo,
    resetFilters,
    softPrice, setSoftPrice,
    softWeight, setSoftWeight,
    enablePrice, setEnablePrice,
    enableWeight, setEnableWeight,
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
    continueTo: s.continueTo,
    resetFilters: s.resetFilters,
    softPrice: s.softPrice,
    setSoftPrice: s.setSoftPrice,
    softWeight: s.softWeight,
    setSoftWeight: s.setSoftWeight,
    enablePrice: s.enablePrice,
    setEnablePrice: s.setEnablePrice,
    enableWeight: s.enableWeight,
    setEnableWeight: s.setEnableWeight,
  }), shallow);

  const onBack = () => continueTo(1);
  const onReset = () => {
    if (caps) {
      resetFilters({ priceBounds: caps.priceBounds, weightBounds: caps.weightBounds });
    } else {
      resetFilters();
    }
  };

  // Density tracks for price and weight (Simple)
  const { priceTrackStyle, weightTrackStyle, currentPriceBounds, currentWeightBounds } = React.useMemo(() => {
    if (!caps || lenses.length === 0) return { priceTrackStyle: {} as React.CSSProperties, weightTrackStyle: {} as React.CSSProperties };
    const baseFilters = { brand, lensType, sealed, isMacro };
    const sObj: any = {
      lenses,
      cameraName: selectedCameraName ?? 'Any',
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
      softPrice: true,
      softWeight: true,
      softDistortion: true,
      softBreathing: true,
      enablePrice: true,
      enableWeight: true,
      enableDistortion: true,
      enableBreathing: true,
    };
    const pool = applyFilters(buildFilterInput(sObj, camera?.mount));
    const priceVals = pool.map(l => l.price_chf).filter(v => Number.isFinite(v));
    const priceNorm = computeNormalizedHistogram(priceVals, caps.priceBounds.min, caps.priceBounds.max);
    const priceTrackStyle: React.CSSProperties = gradientStyleFromNormalized(priceNorm);
    const weightVals = pool.map(l => l.weight_g).filter(v => Number.isFinite(v));
    const weightNorm = computeNormalizedHistogram(weightVals, caps.weightBounds.min, caps.weightBounds.max);
    const weightTrackStyle: React.CSSProperties = gradientStyleFromNormalized(weightNorm);
    const currentPriceBounds = priceVals.length ? { min: Math.min(...priceVals), max: Math.max(...priceVals) } : { ...caps.priceBounds };
    const currentWeightBounds = weightVals.length ? { min: Math.min(...weightVals), max: Math.max(...weightVals) } : { ...caps.weightBounds };
    return { priceTrackStyle, weightTrackStyle, currentPriceBounds, currentWeightBounds };
  }, [caps, lenses, camera, selectedCameraName, brand, lensType, sealed, isMacro]);

  const infoBlock = (
    <CollapsibleMessage variant="info" title="How to use these filters" defaultOpen={false}>
      <ul className="list-disc pl-5 text-sm space-y-1">
        <li><strong>Camera</strong>: {FIELD_HELP.cameraBody}</li>
        <li><strong>Brand/Type</strong>: Filter by maker and choose Prime (single focal length) or Zoom (range).</li>
        <li><strong>Price/Weight</strong>: {FIELD_HELP.price} {FIELD_HELP.weight}</li>
        <li><strong>Priorities</strong>: {FIELD_HELP.goalPreset}</li>
      </ul>
    </CollapsibleMessage>
  );

  const chips = (
    <>
      {brand !== 'Any' && (<Button variant="secondary" size="xs" onClick={() => setBrand('Any')}>Brand: {brand} ✕</Button>)}
      {lensType !== 'Any' && (<Button variant="secondary" size="xs" onClick={() => setLensType('Any')}>Type: {lensType} ✕</Button>)}
      {sealed && (<Button variant="secondary" size="xs" onClick={() => setSealed(false)}>Sealed ✕</Button>)}
      {isMacro && (<Button variant="secondary" size="xs" onClick={() => setIsMacro(false)}>Macro ✕</Button>)}
    </>
  );

  return (
    <BaseRequirements
      title="Your requirements"
      resultsCount={resultsCount}
      info={infoBlock}
      cameras={cameras}
      cameraName={cameraName}
      setCameraName={setCameraName}
      brandOptions={useAvailability().supBrands}
      brand={brand}
      setBrand={setBrand}
      lensTypeOptions={useAvailability().supLensTypes}
      lensType={lensType}
      setLensType={setLensType}
      showPrimarySelectors={false}
      sealed={sealed}
      setSealed={setSealed}
      isMacro={isMacro}
      setIsMacro={setIsMacro}
      chipsRow={<div className={INLINE_CHIPS_ROW}>{chips}</div>}
      onBack={onBack}
      onReset={onReset}
      onContinue={onContinue}
    >
      <StageHeader
        title="Your requirements"
        resultsCount={resultsCount}
        right={(
          <GoalPresetWeights
            preset={goalPreset}
            onChangePreset={setGoalPreset}
            weights={{}}
            onChangeWeights={() => { }}
            presets={PRESETS}
            showWeights={false}
            optionSuffixMap={React.useMemo(() => {
              const map: Record<string, number> = {};
              Object.keys(PRESETS).forEach((k) => { map[k] = resultsCount; });
              return map;
            }, [resultsCount])}
          />
        )}
        className="mb-4"
      />

      <div>
        <MetricRange metric="price" />
      </div>

      <div>
        <MetricRange metric="weight" />
      </div>
    </BaseRequirements>
  );
}

export default function SimpleRequirements(props: Props) {
  const caps = useFilterStore(s => s.availabilityCaps);
  return (
    <AvailabilityProvider cameras={props.cameras || []} caps={caps as any} brandsForCamera={props.brandsForCamera}>
      <SimpleRequirementsBody {...props} />
    </AvailabilityProvider>
  );
}


