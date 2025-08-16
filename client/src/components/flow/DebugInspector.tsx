import React from 'react';
import DebugFilterPanel from '../../components/DebugFilterPanel';
import { useFilterStore } from '../../stores/filterStore';
import { DEBUG_BINDINGS, useFilterBindings } from '../../hooks/useStoreBindings';

export default function DebugInspector(props: {
  open: boolean;
  counts: Record<string, number> | null;
  cameraMount?: string;
  distributions?: any;
  perCameraCounts?: Record<string, number>;
}) {
  const {
    brand,
    lensType,
    sealed,
    isMacro,
    priceRange,
    weightRange,
    proCoverage,
    proFocalMin,
    proFocalMax,
    proMaxApertureF,
    proRequireOIS,
    proRequireSealed,
    proRequireMacro,
    proPriceMax,
    proWeightMax,
    proDistortionMaxPct,
    proBreathingMinScore,
  } = useFilterBindings(DEBUG_BINDINGS);

  if (!props.open || !props.counts) return null;
  return (
    <DebugFilterPanel
      counts={props.counts}
      cameraMount={props.cameraMount}
      brand={brand}
      lensType={lensType}
      sealed={sealed}
      isMacro={isMacro}
      priceRange={priceRange}
      weightRange={weightRange}
      proCoverage={proCoverage}
      proFocalMin={proFocalMin}
      proFocalMax={proFocalMax}
      proMaxApertureF={proMaxApertureF}
      proRequireOIS={proRequireOIS}
      proRequireSealed={proRequireSealed}
      proRequireMacro={proRequireMacro}
      proPriceMax={proPriceMax}
      proWeightMax={proWeightMax}
      proDistortionMaxPct={proDistortionMaxPct}
      proBreathingMinScore={proBreathingMinScore}
      distributions={props.distributions}
      perCameraCounts={props.perCameraCounts}
    />
  );
}


