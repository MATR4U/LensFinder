import React from 'react';
import type { Camera } from '../../types';
import { TITLE_H2, CARD_PADDED, GRID_TWO_GAP3, INLINE_CHIPS_ROW, ROW_BETWEEN, BADGE_COUNT, ACTION_ROW } from '../ui/styles';
import PageBase from '../pages/PageBase';
import Button from '../ui/Button';
import LabeledSelect from '../ui/fields/LabeledSelect';
import { useStageLifecycle } from '../../hooks/useStageLifecycle';
import AvailabilitySelect from '../ui/AvailabilitySelect';
import { useFilterStore } from '../../stores/filterStore';
import CheckboxGroup from '../ui/fields/CheckboxGroup';
import StageNav from '../ui/StageNav';

type ToggleItem = { key: string; label: string; checked: boolean; onChange: (v: boolean) => void; id: string; infoText?: string };

type Props = {
  title?: string;
  resultsCount: number;
  info?: React.ReactNode;
  // Camera selection
  cameras?: Camera[];
  cameraName: string;
  setCameraName: (name: string) => void;
  // Brand / lens type
  brandOptions: string[];
  brand: string;
  setBrand: (v: string) => void;
  lensTypeOptions: string[];
  lensType: string;
  setLensType: (v: string) => void;
  // Visibility controls
  showPrimarySelectors?: boolean; // Camera/Brand/Lens Type
  // Toggles
  sealed: boolean;
  setSealed: (v: boolean) => void;
  isMacro: boolean;
  setIsMacro: (v: boolean) => void;
  extraToggles?: ToggleItem[];
  // Optional inline chips row
  chipsRow?: React.ReactNode;
  // Main content
  children?: React.ReactNode;
  // Optional goal/preset section (caller renders what it needs)
  goalSection?: React.ReactNode;
  // Actions
  onBack: () => void;
  onReset?: () => void;
  onContinue: () => void;
  // Stage number for baseline-aware resets (e.g., 2 for Requirements)
  stageNumber?: number;
};

export default function BaseRequirements(props: Props) {
  const {
    title = 'Your requirements', resultsCount, info,
    cameras, cameraName, setCameraName,
    brandOptions, brand, setBrand,
    lensTypeOptions, lensType, setLensType,
    showPrimarySelectors = true,
    sealed, setSealed, isMacro, setIsMacro, extraToggles,
    chipsRow, children, goalSection,
    onBack, onReset, onContinue, stageNumber = 2,
  } = props;

  const { onEnter } = useStageLifecycle(2, { resetOnEntry: false });
  React.useEffect(() => { onEnter(); }, [onEnter]);
  return (
    <PageBase
      title={title}
      actionsSlot={<span className={BADGE_COUNT}>{resultsCount} matches</span>}
      footerSlot={<StageNav onBack={onBack} onReset={onReset} onContinue={onContinue} stageNumber={stageNumber} />}
    >
      <div className={CARD_PADDED}>
        {info}

        {chipsRow && (
          <div className={INLINE_CHIPS_ROW}>{chipsRow}</div>
        )}

        {cameras && showPrimarySelectors && (
          <div>
            <AvailabilitySelect
              label="Camera Body"
              value={cameraName}
              onChange={setCameraName}
              options={[{ value: 'Any', label: 'Any' }, ...cameras.map(c => ({ value: c.name, label: c.name }))]}
            />
          </div>
        )}

        <div className={GRID_TWO_GAP3}>
          <div>
            <AvailabilitySelect label="Lens Brand" value={brand} onChange={setBrand} options={brandOptions.map(b => ({ value: b, label: b }))} />
          </div>
          <div>
            <AvailabilitySelect label="Lens Type" value={lensType} onChange={setLensType} options={lensTypeOptions.map(t => ({ value: t, label: t }))} />
          </div>
        </div>

        <CheckboxGroup
          label="Build features"
          items={[
            { key: 'sealed', id: 'sealed', label: 'Weather sealed', checked: sealed, onChange: setSealed },
            { key: 'macro', id: 'macro', label: 'Macro', checked: isMacro, onChange: setIsMacro },
            ...((extraToggles || []).map(t => ({ key: t.key, id: t.id, label: t.label, checked: t.checked, onChange: t.onChange, infoText: t.infoText }))),
          ]}
        />

        {goalSection}

        {children}
      </div>
    </PageBase>
  );
}


