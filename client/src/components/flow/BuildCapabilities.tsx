import React from 'react';
import type { Camera } from '../../types';
import { useFilterStore } from '../../stores/filterStore';
import LabeledSelect from '../ui/fields/LabeledSelect';
import CheckboxGroup from '../ui/fields/CheckboxGroup';
import { ACTION_ROW, BADGE_COUNT, CARD_PADDED, GRID_TWO_GAP3, ROW_BETWEEN, TITLE_H2 } from '../ui/styles';
import { FIELD_HELP } from '../ui/fieldHelp';
import Button from '../ui/Button';
import { coverageMatches } from '../../lib/availability';
import { applyFilters } from '../../lib/filters';
import StageHeader from '../ui/StageHeader';
import StageNav from '../ui/StageNav';
import BuildFeatures from '../ui/BuildFeatures';
import { useBuildFeatureAvailability } from '../../hooks/useBuildFeatureAvailability';
import { useAvailabilityOptions } from '../../hooks/useAvailabilityOptions';
import { useStageBaseline } from '../../hooks/useStageBaseline';
import { useStageLifecycle } from '../../hooks/useStageLifecycle';
import { useAvailabilityCounts } from '../../hooks/useAvailabilityCounts';
import { useAutoCorrectSelections } from '../../hooks/useAutoCorrectSelections';
import { useStageReset } from '../../hooks/useStageReset';
import AvailabilitySelect from '../ui/AvailabilitySelect';
import { lensTypeFromFocal } from '../../lib/optics';
import { useAvailableBodies } from '../../hooks/useAvailableBodies';
import { useCountsOptions } from '../../hooks/useCountsOptions';
import { useOptionsSuperset } from '../../hooks/useOptionsSuperset';

type Props = {
  cameras?: Camera[];
  brandsForCamera?: string[];
  resultsCount: number;
  onContinue: () => void;
};

export default function BuildCapabilities({ cameras = [], brandsForCamera = [], resultsCount, onContinue }: Props) {
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
  const resetAll = useFilterStore(s => s.resetAll);
  const resetFilters = useFilterStore(s => s.resetFilters);

  const brandOptions = caps?.brands || brandsForCamera || [];
  const lensTypeOptions = caps?.lensTypes || ['Any', 'Prime', 'Zoom'];
  const coverageOptions = caps?.coverage || ['Any', 'Full Frame', 'APS-C'];

  // Dynamic availability (react to current selections, ignoring step-2 constraints)
  const { camera, dynamicAvail, lenses } = useAvailabilityOptions({ cameras });

  // Establish stage baseline + analytics on entry
  const { onEnter } = useStageLifecycle(1, { resetOnEntry: true });
  React.useEffect(() => { onEnter(); }, [onEnter]);

  // Disable options that lead to 0; keep supersets from caps for visibility
  const { supBrands, supLensTypes, supCoverage } = useOptionsSuperset({ caps, brandsForCamera });

  // Auto-correct unavailable selections
  useAutoCorrectSelections({ dynamicAvail, brand, setBrand, lensType, setLensType, coverage, setCoverage });

  // Ensure a clean baseline on first entry handled by Mode stage; StageNav reset uses useStageBaseline

  // Compute availability of camera bodies under current selections
  const availableBodies = useAvailableBodies({ cameras, lenses, brand, lensType: lensType as any, isPro, coverage, isMacro, sealed, requireOIS });

  // Option counts under current selections (ignore step-2 constraints like ranges)
  const counts = useAvailabilityCounts({ cameras, supBrands, supLensTypes, supCoverage });

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
            { value: 'Any', label: 'Any', count: counts.cameraCounts['Any'] },
            ...cameras.map(c => ({ value: c.name, label: c.name, count: counts.cameraCounts[c.name] ?? 0, disabled: !availableBodies[c.name] }))
          ]}
        />
      </div>

      <div className={GRID_TWO_GAP3}>
        <div>
          <AvailabilitySelect
            label="Lens Brand"
            value={brand}
            onChange={setBrand}
            options={useCountsOptions('brands', supBrands, dynamicAvail as any, counts as any)}
          />
        </div>
        <div>
          <AvailabilitySelect
            label="Lens Type"
            value={lensType}
            onChange={setLensType}
            options={useCountsOptions('lensTypes', supLensTypes, dynamicAvail as any, counts as any)}
          />
        </div>
      </div>

      {isPro && (
        <div>
          <AvailabilitySelect
            label="Sensor Coverage"
            value={coverage}
            onChange={setCoverage}
            options={useCountsOptions('coverage', supCoverage, dynamicAvail as any, counts as any)}
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

      <StageNav
        className="mt-2"
        onBack={onBack}
        onReset={useStageReset(1)}
        onContinue={onContinue}
        continueLabel="Continue"
        stageNumber={1}
      />
    </div>
  );
}


