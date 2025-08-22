import Button from '../ui/Button';
import React from 'react';
import type { Camera, Lens } from '../../types';
import { INLINE_CHIPS_ROW } from '../ui/styles';
import MetricRange from './MetricRange';
import { useFilterStore } from '../../stores/filterStore';
import { SIMPLE_REQ_BINDINGS, useFilterBindings } from '../../hooks/useStoreBindings';
import { PRESETS } from '../../lib/recommender';
import { applyFilters, buildFilterInput } from '../../lib/filters';
import GoalPresetWeights from '../ui/fields/GoalPresetWeights';
// import { FIELD_HELP } from '../ui/fieldHelp';
// import CollapsibleMessage from '../ui/CollapsibleMessage';
import SimpleHowTo from './simple/HowTo';
import BaseRequirements from './BaseRequirements';
import { StageHeader } from '../../layout';
//
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
  const { cameras, brandsForCamera: _brandsForCamera, onContinue, resultsCount = 0, camera, cameraName: selectedCameraName = 'Any', lenses = [] } = props; // TODO: brandsForCamera currently unused by Simple

  const {
    cameraName, setCameraName,
    brand, setBrand,
    lensType, setLensType,
    sealed, setSealed,
    isMacro, setIsMacro,
    // priceRange, setPriceRange, // TODO: consider re-adding simple price range control
    // weightRange, setWeightRange, // TODO: consider re-adding simple weight range control
    goalPreset, setGoalPreset,
    // setGoalWeights, // TODO: hook up weight sliders for simple mode if desired
    caps,
    // undoLastFilter, // TODO: expose undo inline in Simple header if needed
    continueTo,
    resetFilters,
    // softPrice, setSoftPrice, // TODO: wire soft toggles in simple mode
    // softWeight, setSoftWeight,
    // enablePrice, setEnablePrice,
    // enableWeight, setEnableWeight,
  } = useFilterBindings(SIMPLE_REQ_BINDINGS);

  const onBack = () => continueTo(1);
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
    return { priceTrackStyle, weightTrackStyle };
  }, [caps, lenses, camera, selectedCameraName, brand, lensType, sealed, isMacro]); // TODO: surface track styles when controls return
  void priceTrackStyle; // TODO: currently computed for future UI use
  void weightTrackStyle;

  const infoBlock = (<SimpleHowTo />);

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
      <StageHeader title="Your requirements" resultsCount={resultsCount} className="mb-2" right={(
        <GoalPresetWeights
          preset={goalPreset}
          onChangePreset={setGoalPreset}
          weights={{}}
          onChangeWeights={() => { }}
          presets={PRESETS}
          showWeights={false}
          optionSuffixMap={undefined}
        />
      )} />

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


