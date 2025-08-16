import React from 'react';
import type { Camera } from '../../types';
import { useFilterStore } from '../../stores/filterStore';
import { CARD_PADDED, GRID_TWO_GAP3 } from '../ui/styles';
import StageHeader from '../ui/StageHeader';
import StageNav from '../ui/StageNav';
import StageLayout from '../ui/StageLayout';
import BuildFeatures from '../ui/BuildFeatures';
import { useBuildFeatureAvailability } from '../../hooks/useBuildFeatureAvailability';
import { useAvailabilityOptions } from '../../hooks/useAvailabilityOptions';
import { useStageLifecycle } from '../../hooks/useStageLifecycle';
import { useAutoCorrectSelections } from '../../hooks/useAutoCorrectSelections';
import { useStageReset } from '../../hooks/useStageReset';
import AvailabilitySelect from '../ui/AvailabilitySelect';
import { useAvailableBodies } from '../../hooks/useAvailableBodies';
import { useCountsOptions } from '../../hooks/useCountsOptions';
import { AvailabilityProvider, useAvailability } from '../../context/AvailabilityContext';

type Props = {
  cameras?: Camera[];
  brandsForCamera?: string[];
  resultsCount: number;
  onContinue: () => void;
};

function BuildCapabilitiesBody({ cameras = [], brandsForCamera = [], resultsCount, onContinue }: Props) {
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
    caps,
  } = useFilterStore(s => ({
    isPro: s.isPro,
    cameraName: s.cameraName,
    setCameraName: s.setCameraName,
    brand: s.brand,
    setBrand: s.setBrand,
    lensType: s.lensType,
    setLensType: s.setLensType,
    coverage: s.proCoverage,
    setCoverage: s.setProCoverage,
    sealed: s.sealed,
    setSealed: s.setSealed,
    isMacro: s.isMacro,
    setIsMacro: s.setIsMacro,
    requireOIS: s.proRequireOIS,
    setRequireOIS: s.setProRequireOIS,
    continueTo: s.continueTo,
    caps: s.availabilityCaps,
  }));

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
        <AvailabilitySelect
          label="Camera Body"
          value={cameraName}
          onChange={setCameraName}
          options={[
            { value: 'Any', label: 'Any', count: countsEff.cameraCounts['Any'] },
            ...cameras.map(c => ({ value: c.name, label: c.name, count: countsEff.cameraCounts[c.name] ?? 0, disabled: !availableBodies[c.name] }))
          ]}
        />
      </div>

      <div className={GRID_TWO_GAP3}>
        <div>
          <AvailabilitySelect
            label="Lens Brand"
            value={brand}
            onChange={setBrand}
            options={useCountsOptions('brands', supBrands, dyn, countsEff)}
          />
        </div>
        <div>
          <AvailabilitySelect
            label="Lens Type"
            value={lensType}
            onChange={setLensType}
            options={useCountsOptions('lensTypes', supLensTypes, dyn, countsEff)}
          />
        </div>
      </div>

      {isPro && (
        <div>
          <AvailabilitySelect
            label="Sensor Coverage"
            value={coverage}
            onChange={setCoverage}
            options={useCountsOptions('coverage', supCoverage, dyn, countsEff)}
          />
        </div>
      )}

      <BuildFeatures
        sealed={sealed}
        setSealed={setSealed}
        canRequireSealed={canRequireSealed}
        isMacro={isMacro}
        setIsMacro={setIsMacro}
        canRequireMacro={canRequireMacro}
        {...(isPro ? { requireOIS, setRequireOIS, canRequireOIS } : {})}
      />

      <StageNav className="mt-2" onBack={onBack} onReset={useStageReset(1)} onContinue={onContinue} continueLabel="Continue" />
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


