import React from 'react';
import type { Camera } from '../../types';
import { TITLE_H2, CARD_PADDED, GRID_TWO_GAP3, INLINE_CHIPS_ROW, ROW_BETWEEN, BADGE_COUNT, ACTION_ROW } from '../ui/styles';
import PageBase from '../pages/PageBase';
import Button from '../ui/Button';
import LabeledSelect from '../ui/fields/LabeledSelect';
import CheckboxGroup from '../ui/fields/CheckboxGroup';

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
  onReset: () => void;
  onContinue: () => void;
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
    onBack, onReset, onContinue,
  } = props;

  const footer = (
    <div className={`${ROW_BETWEEN}`}>
      <div className={ACTION_ROW}>
        <Button variant="secondary" onClick={onBack}>Back</Button>
        <Button variant="secondary" onClick={onReset}>Reset</Button>
      </div>
      <Button onClick={onContinue} aria-label="See results">See results ({resultsCount})</Button>
    </div>
  );

  return (
    <PageBase title={title} actionsSlot={<span className={BADGE_COUNT}>{resultsCount} matches</span>} footerSlot={footer}>
      <div className={CARD_PADDED}>
        {info}

        {chipsRow && (
          <div className={INLINE_CHIPS_ROW}>{chipsRow}</div>
        )}

        {cameras && showPrimarySelectors && (
          <div>
            <LabeledSelect label="Camera Body" value={cameraName} onChange={setCameraName}>
              <option key="Any" value="Any">Any</option>
              {cameras.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </LabeledSelect>
          </div>
        )}

        {showPrimarySelectors && (
          <div className={GRID_TWO_GAP3}>
            <div>
              <LabeledSelect label="Brand" value={brand} onChange={setBrand}>
                {brandOptions.map((b) => <option key={b} value={b}>{b}</option>)}
              </LabeledSelect>
            </div>
            <div>
              <LabeledSelect label="Lens Type" value={lensType} onChange={setLensType}>
                {lensTypeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
              </LabeledSelect>
            </div>
          </div>
        )}

        {/* Build & capabilities moved earlier in the flow (BuildCapabilities step). Keep optional extension items if provided. */}
        {extraToggles && extraToggles.length > 0 && (
          <CheckboxGroup
            label="Additional build options"
            items={extraToggles}
          />
        )}

        {children}
        {goalSection}
      </div>
    </PageBase>
  );
}


