import React from 'react';
import type { Camera } from '../../types';
import { useFilterStore } from '../../stores/filterStore';
import LabeledSelect from '../ui/fields/LabeledSelect';
import CheckboxGroup from '../ui/fields/CheckboxGroup';
import { ACTION_ROW, BADGE_COUNT, CARD_PADDED, GRID_TWO_GAP3, ROW_BETWEEN, TITLE_H2 } from '../ui/styles';
import { FIELD_HELP } from '../ui/fieldHelp';
import Button from '../ui/Button';
import { getCachedSnapshot } from '../../lib/data';
import { makeAvailabilitySelector } from '../../lib/selectors';
import { coverageMatches } from '../../lib/availability';

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
  const resetToStageBaseline = useFilterStore(s => s.resetToStageBaseline);
  const captureStageBaseline = useFilterStore(s => s.captureStageBaseline);

  const brandOptions = caps?.brands || brandsForCamera || [];
  const lensTypeOptions = caps?.lensTypes || ['Any', 'Prime', 'Zoom'];
  const coverageOptions = caps?.coverage || ['Any', 'Full Frame', 'APS-C'];

  // Dynamic availability (react to current selections, ignoring stage-2 constraints)
  const lenses = getCachedSnapshot().lenses || [];
  const camera = React.useMemo(() => (cameraName === 'Any' ? undefined : cameras.find(c => c.name === cameraName)), [cameras, cameraName]);
  const availabilitySelector = React.useMemo(() => makeAvailabilitySelector(), []);
  const dynamicAvail = React.useMemo(() => availabilitySelector(
    cameraName,
    camera as Camera | undefined,
    lenses,
    {
      cameraName,
      brand,
      lensType,
      sealed,
      isMacro,
      priceRange: { min: 0, max: 1_000_000 },
      weightRange: { min: 0, max: 100_000 },
      proCoverage: coverage,
      proFocalMin: 0,
      proFocalMax: 9999,
      proMaxApertureF: 99,
      proRequireOIS: requireOIS,
      proRequireSealed: false,
      proRequireMacro: false,
      proPriceMax: 1_000_000,
      proWeightMax: 100_000,
      proDistortionMaxPct: 100,
      proBreathingMinScore: 0,
    }
  ), [availabilitySelector, cameraName, camera, lenses, brand, lensType, sealed, isMacro, coverage, requireOIS]);

  // Disable options that lead to 0; keep supersets from caps for visibility
  const supBrands = brandOptions;
  const supLensTypes = lensTypeOptions;
  const supCoverage = coverageOptions;

  // Auto-correct selected values if they become unavailable
  React.useEffect(() => {
    if (brand !== 'Any' && !dynamicAvail.brands.includes(brand)) setBrand('Any');
    if (lensType !== 'Any' && !dynamicAvail.lensTypes.includes(lensType)) setLensType('Any');
    if (coverage !== 'Any' && !dynamicAvail.coverage.includes(coverage)) setCoverage('Any');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dynamicAvail.brands.join(','), dynamicAvail.lensTypes.join(','), dynamicAvail.coverage.join(',')]);

  // Ensure Reset works even when landing directly via URL: capture a baseline on first mount
  React.useEffect(() => {
    captureStageBaseline(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute availability of camera bodies under current selections
  const availableBodies = React.useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const cam of cameras) {
      let arr = lenses.filter(l => l.mount === cam.mount);
      arr = arr
        .filter(l => (brand === 'Any' ? true : l.brand === brand))
        .filter(l => {
          const type = (l.focal_min_mm === l.focal_max_mm) ? 'Prime' : 'Zoom';
          return lensType === 'Any' ? true : type === lensType;
        })
        .filter(l => (sealed ? !!l.weather_sealed : true))
        .filter(l => (isMacro ? !!l.is_macro : true))
        .filter(l => (isPro ? coverageMatches(l.coverage, coverage) : true))
        .filter(l => (requireOIS ? !!l.ois : true));
      map[cam.name] = arr.length > 0;
    }
    return map;
  }, [cameras, lenses, brand, lensType, sealed, isMacro, isPro, coverage, requireOIS]);

  // Auto-correct camera if it becomes unavailable
  React.useEffect(() => {
    if (cameraName !== 'Any' && availableBodies[cameraName] === false) {
      setCameraName('Any');
    }
  }, [availableBodies, cameraName, setCameraName]);

  // Compute whether enabling each build feature would still yield results
  const canRequireSealed = React.useMemo(() => {
    let arr = lenses;
    if (cameraName !== 'Any' && camera) arr = arr.filter(l => l.mount === camera.mount);
    arr = arr
      .filter(l => (brand === 'Any' ? true : l.brand === brand))
      .filter(l => {
        const type = (l.focal_min_mm === l.focal_max_mm) ? 'Prime' : 'Zoom';
        return lensType === 'Any' ? true : type === lensType;
      })
      .filter(l => (/* enabling sealed */ true ? !!l.weather_sealed : true))
      .filter(l => (isMacro ? !!l.is_macro : true))
      .filter(l => (isPro ? coverageMatches(l.coverage, coverage) : true))
      .filter(l => (requireOIS ? !!l.ois : true));
    return arr.length > 0;
  }, [lenses, cameraName, camera, brand, lensType, isMacro, isPro, coverage, requireOIS]);

  const canRequireMacro = React.useMemo(() => {
    let arr = lenses;
    if (cameraName !== 'Any' && camera) arr = arr.filter(l => l.mount === camera.mount);
    arr = arr
      .filter(l => (brand === 'Any' ? true : l.brand === brand))
      .filter(l => {
        const type = (l.focal_min_mm === l.focal_max_mm) ? 'Prime' : 'Zoom';
        return lensType === 'Any' ? true : type === lensType;
      })
      .filter(l => (sealed ? !!l.weather_sealed : true))
      .filter(l => (/* enabling macro */ true ? !!l.is_macro : true))
      .filter(l => (isPro ? coverageMatches(l.coverage, coverage) : true))
      .filter(l => (requireOIS ? !!l.ois : true));
    return arr.length > 0;
  }, [lenses, cameraName, camera, brand, lensType, sealed, isPro, coverage, requireOIS]);

  const canRequireOIS = React.useMemo(() => {
    let arr = lenses;
    if (cameraName !== 'Any' && camera) arr = arr.filter(l => l.mount === camera.mount);
    arr = arr
      .filter(l => (brand === 'Any' ? true : l.brand === brand))
      .filter(l => {
        const type = (l.focal_min_mm === l.focal_max_mm) ? 'Prime' : 'Zoom';
        return lensType === 'Any' ? true : type === lensType;
      })
      .filter(l => (sealed ? !!l.weather_sealed : true))
      .filter(l => (isMacro ? !!l.is_macro : true))
      .filter(l => (isPro ? coverageMatches(l.coverage, coverage) : true))
      .filter(l => (/* enabling OIS */ true ? !!l.ois : true));
    return arr.length > 0;
  }, [lenses, cameraName, camera, brand, lensType, sealed, isMacro, isPro, coverage]);

  return (
    <div className={CARD_PADDED}>
      <div className={ROW_BETWEEN}>
        <h2 className={TITLE_H2}>Build and capabilities</h2>
        <span className={BADGE_COUNT}>{resultsCount} matches</span>
      </div>

      <div>
        <LabeledSelect label="Camera Body" value={cameraName} onChange={setCameraName}>
          <option key="Any" value="Any">Any</option>
          {cameras.map(c => (
            <option key={c.name} value={c.name} disabled={!availableBodies[c.name]}>{c.name}</option>
          ))}
        </LabeledSelect>
      </div>

      <div className={GRID_TWO_GAP3}>
        <div>
          <LabeledSelect label="Lens Brand" value={brand} onChange={setBrand}>
            {supBrands.map(b => (
              <option key={b} value={b} disabled={b !== 'Any' && !dynamicAvail.brands.includes(b)}>{b}</option>
            ))}
          </LabeledSelect>
        </div>
        <div>
          <LabeledSelect label="Lens Type" value={lensType} onChange={setLensType}>
            {supLensTypes.map(t => (
              <option key={t} value={t} disabled={t !== 'Any' && !dynamicAvail.lensTypes.includes(t)}>{t}</option>
            ))}
          </LabeledSelect>
        </div>
      </div>

      {isPro && (
        <div>
          <LabeledSelect label="Sensor Coverage" value={coverage} onChange={setCoverage}>
            {supCoverage.map(c => (
              <option key={c} value={c} disabled={c !== 'Any' && !dynamicAvail.coverage.includes(c)}>{c}</option>
            ))}
          </LabeledSelect>
        </div>
      )}

      <CheckboxGroup
        label="Build features"
        infoText="Quick toggles for key build features."
        items={[
          { key: 'sealed', label: 'Weather sealed', checked: sealed, onChange: setSealed, id: 'opt-sealed', disabled: !sealed && !canRequireSealed },
          { key: 'macro', label: 'Macro', checked: isMacro, onChange: setIsMacro, id: 'opt-macro', disabled: !isMacro && !canRequireMacro },
          ...(isPro ? [{ key: 'ois', label: 'Require OIS', checked: requireOIS, onChange: setRequireOIS, id: 'opt-ois', infoText: FIELD_HELP.requireOIS, disabled: !requireOIS && !canRequireOIS }] : []),
        ]}
      />

      <div className={ROW_BETWEEN}>
        <div className={ACTION_ROW}>
          <Button variant="secondary" onClick={onBack}>Back</Button>
          <Button
            variant="secondary"
            onClick={() => {
              // Reset only values of this stage without changing the current stage
              // Prefer resetting to captured baseline for stage 1 to avoid scroll/transition
              resetToStageBaseline(1);
            }}
          >Reset</Button>
        </div>
        <Button onClick={onContinue}>Continue</Button>
      </div>
    </div>
  );
}


