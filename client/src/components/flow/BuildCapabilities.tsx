import React from 'react';
import type { Camera } from '../../types';
import { useFilterStore } from '../../stores/filterStore';
import { BUILD_CAPS_BINDINGS, useFilterBindings } from '../../hooks/useStoreBindings';
import { CARD_PADDED } from '../ui/styles';
import StageHeader from '../ui/StageHeader';
import StageNav from '../ui/StageNav';
// TODO: Implement StageLayout if needed for layout orchestration
// TODO: Implement BuildFeatures or remove if superseded by BuildFeaturesGroup
import { useBuildFeatureAvailability } from '../../hooks/useBuildFeatureAvailability';
import { useAvailabilityOptions } from '../../hooks/useAvailabilityOptions';
import { useStageLifecycle } from '../../hooks/useStageLifecycle';
import { useAutoCorrectSelections } from '../../hooks/useAutoCorrectSelections';
import { useStageReset } from '../../hooks/useStageReset';
// TODO: Implement AvailabilitySelect if we plan to surface caps at this stage
import CameraSelect from './build/CameraSelect';
import BrandTypeSelectors from './build/BrandTypeSelectors';
import CoverageSelect from './build/CoverageSelect';
import BuildFeaturesGroup from './build/BuildFeaturesGroup';
import { useAvailableBodies } from '../../hooks/useAvailableBodies';
import { useCountsOptions } from '../../hooks/useCountsOptions';
import { AvailabilityProvider, useAvailability } from '../../context/AvailabilityContext';

type Props = {
  cameras?: Camera[];
  brandsForCamera?: string[];
  resultsCount: number;
  onContinue: () => void;
};

function BuildCapabilitiesBody({ cameras = [], brandsForCamera: _brandsForCamera = [], resultsCount, onContinue }: Props) { // TODO: brandsForCamera currently unused; integrate or remove
  const {
    isPro,
    cameraName, setCameraName,
    brand, setBrand,
    lensType, setLensType,
    coverage, setCoverage,
    sealed, setSealed,
    isMacro, setIsMacro,
    requireOIS, setRequireOIS,
    continueTo,
    caps: _caps,
  } = useFilterBindings(BUILD_CAPS_BINDINGS);

  const onBack = () => continueTo(0);

  // Dynamic availability (react to current selections, ignoring step-2 constraints)
  const { camera, dynamicAvail, lenses } = useAvailabilityOptions({ cameras });

  // Establish stage baseline + analytics on entry
  const { onEnter } = useStageLifecycle(1, { resetOnEntry: true });
  React.useEffect(() => { onEnter(); }, [onEnter]);

  // Pull from availability context
  const { dynamicAvail: availCtx, counts, supBrands, supLensTypes, supCoverage } = useAvailability();
  const dyn = (availCtx as any) || (dynamicAvail as any);

  // Auto-correct unavailable selections
  useAutoCorrectSelections({ dynamicAvail: dyn, brand, setBrand, lensType, setLensType, coverage, setCoverage });

  // Ensure a clean baseline on first entry handled by Mode stage; StageNav reset uses useStageBaseline

  // Compute availability of camera bodies under current selections
  const availableBodies = useAvailableBodies({ cameras, lenses, brand, lensType: lensType as any, isPro, coverage, isMacro, sealed, requireOIS });

  // Option counts provided by context
  const countsEff = counts as any;

  // Auto-correct camera if it becomes unavailable
  React.useEffect(() => {
    if (cameraName !== 'Any' && availableBodies[cameraName] === false) {
      setCameraName('Any');
    }
  }, [availableBodies, cameraName, setCameraName]);

  const { canRequireSealed, canRequireMacro, canRequireOIS } = useBuildFeatureAvailability({ lenses, camera: camera as any });

  return (
    <div className={CARD_PADDED}>
      <StageHeader title="Build and capabilities" resultsCount={resultsCount} />

      {/** Option counts under current selections (ignoring step-2 constraints) */}
      {(() => {
        return null;
      })()}

      <div>
        <CameraSelect cameras={cameras} cameraName={cameraName} setCameraName={setCameraName} counts={countsEff.cameraCounts} availableBodies={availableBodies} />
      </div>

      <BrandTypeSelectors
        brand={brand}
        setBrand={setBrand}
        lensType={lensType}
        setLensType={setLensType}
        brandsOptions={useCountsOptions('brands', supBrands, dyn, countsEff)}
        lensTypeOptions={useCountsOptions('lensTypes', supLensTypes, dyn, countsEff)}
      />

      {isPro && (
        <div>
          <CoverageSelect coverage={coverage} setCoverage={setCoverage} options={useCountsOptions('coverage', supCoverage, dyn, countsEff)} />
        </div>
      )}

      <BuildFeaturesGroup
        sealed={sealed}
        setSealed={setSealed}
        canRequireSealed={canRequireSealed}
        isMacro={isMacro}
        setIsMacro={setIsMacro}
        canRequireMacro={canRequireMacro}
        {...(isPro ? { requireOIS, setRequireOIS, canRequireOIS } : {})}
        isPro={isPro}
      />

      <StageNav className="mt-2" onBack={onBack} backLabel="Back to mode" onReset={useStageReset(1)} onContinue={onContinue} continueLabel="Continue" />
    </div>
  );
}

export default function BuildCapabilities(props: Props) {
  const caps = useFilterStore(s => s.availabilityCaps);
  const { cameras = [], brandsForCamera = [] } = props;
  return (
    <AvailabilityProvider cameras={cameras} caps={caps as any} brandsForCamera={brandsForCamera}>
      <BuildCapabilitiesBody {...props} />
    </AvailabilityProvider>
  );
}


