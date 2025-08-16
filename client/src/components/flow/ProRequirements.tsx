import React, { useMemo } from 'react';
import type { Camera, Lens } from '../../types';
//
import { PRO_REQ_BINDINGS, useFilterBindings } from '../../hooks/useStoreBindings';
// TODO: Reintroduce density computation using filters/hist when UI is finalized
import GoalsHeader from './pro/GoalsHeader';
// import { FIELD_HELP } from '../ui/fieldHelp';
// import CollapsibleMessage from '../ui/CollapsibleMessage';
import ProHowTo from './pro/HowTo';
import BaseRequirements from './BaseRequirements';
//
import ApertureControl from './pro/ApertureControl';
import FocalOnly from './pro/FocalOnly';
import PriceAndWeight from './pro/PriceAndWeight';
import VideoAndDistortion from './pro/VideoAndDistortion';
//
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
  const { cameras, brandsForCamera, resultsCount = 0, onContinue } = props;

  const {
    cameraName, setCameraName,
    brand, setBrand,
    lensType, setLensType,
    // coverage, focalMin, focalMax, maxApertureF, requireOIS, // TODO: controlled via subcomponents
    sealed, setSealed,
    isMacro, setIsMacro,
    // priceRange, setPriceRange, // TODO: reintroduce Pro price range wiring here if needed
    // weightRange, setWeightRange, // TODO: reintroduce Pro weight range wiring here if needed
    // distortionMaxPct, breathingMinScore,
    // goalPreset, setGoalPreset, // TODO: goal preset handled elsewhere
    // goalWeights, setGoalWeights, // TODO: goal weights editor moved
    caps,
    // undoLastFilter, // TODO: expose undo in Pro header if needed
    continueTo,
    resetFilters,
    // softPrice, setSoftPrice, softWeight, setSoftWeight, softDistortion, setSoftDistortion, softBreathing, setSoftBreathing, // TODO: soft toggles UI
    // enablePrice, enableWeight, enableDistortion, enableBreathing, setEnablePrice, setEnableWeight, setEnableDistortion, setEnableBreathing, // TODO: enable toggles UI
  } = useFilterBindings(PRO_REQ_BINDINGS);

  const onBack = () => continueTo(1);
  const onReset = () => {
    if (caps) {
      resetFilters({ priceBounds: caps.priceBounds, weightBounds: caps.weightBounds });
    } else {
      resetFilters();
    }
  };

  // Contextual zero-results and predictive suggestions handled elsewhere now

  // Density tracks for price and weight (deferred)
  const { priceTrackStyle, weightTrackStyle, currentPriceBounds, currentWeightBounds } = useMemo(() => {
    return {
      priceTrackStyle: {} as React.CSSProperties,
      weightTrackStyle: {} as React.CSSProperties,
      currentPriceBounds: caps ? { ...caps.priceBounds } : ({ min: 0, max: 0 } as any),
      currentWeightBounds: caps ? { ...caps.weightBounds } : ({ min: 0, max: 0 } as any),
    };
  }, [caps]);

  // TODO: surface density track styles and bounds in field components when UI is finalized
  void priceTrackStyle;
  void weightTrackStyle;
  void currentPriceBounds;
  void currentWeightBounds;

  // Removed unused foreground histogram computation

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
      <GoalsHeader />
      {/** foreground histograms are computed inside field components */}
      <ProHowTo />

      {/* No standalone zero-results block; warnings will be integrated inline */}

      {/* brand/type selectors and camera are handled by BaseRequirements */}

      {/* Quick reset limiting filters: pick top 1–3 suggestions when results shrink or hit zero */}
      {/* Optional micro-hint row can remain for positive counts if desired; omit for now */}

      {/* Coverage is selected in the Build & capabilities pre-stage */}
      <ApertureControl maxApertureLimit={caps?.apertureMaxMax} />

      <FocalOnly resultsCount={resultsCount} />
      <PriceAndWeight resultsCount={resultsCount} />
      <VideoAndDistortion resultsCount={resultsCount} />

      {/* Build & capabilities are now part of the pre-stage screen. */}

      {/* Moved GoalPresetWeights to top */}

    </BaseRequirements>
  );
}


