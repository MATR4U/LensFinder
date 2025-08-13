import React from 'react';
import type { Camera } from '../../types';
import { TITLE_H2, CARD_PADDED, GRID_TWO_GAP3, INLINE_CHIPS_ROW, ROW_BETWEEN, BADGE_COUNT, ACTION_ROW } from '../ui/styles';
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
    sealed, setSealed, isMacro, setIsMacro, extraToggles,
    chipsRow, children, goalSection,
    onBack, onReset, onContinue,
  } = props;

  return (
    <div className={CARD_PADDED}>
      <div className={ROW_BETWEEN}>
        <h2 className={TITLE_H2}>{title}</h2>
        <span className={BADGE_COUNT}>{resultsCount} matches</span>
      </div>

      {info}

      {chipsRow && (
        <div className={INLINE_CHIPS_ROW}>{chipsRow}</div>
      )}

      {cameras && (
        <div>
          <LabeledSelect label="Camera Body" value={cameraName} onChange={setCameraName}>
            <option key="Any" value="Any">Any</option>
            {cameras.map((c) => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </LabeledSelect>
        </div>
      )}

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

      <CheckboxGroup
        label="Build and capabilities"
        infoText="Quick toggles for key build features."
        items={[
          { key: 'sealed', label: 'Weather sealed', checked: sealed, onChange: setSealed, id: 'opt-sealed' },
          { key: 'macro', label: 'Macro', checked: isMacro, onChange: setIsMacro, id: 'opt-macro' },
          ...(extraToggles || []),
        ]}
      />

      {children}

      {goalSection}

      <div className={ROW_BETWEEN}>
        <div className={ACTION_ROW}>
          <Button variant="secondary" onClick={onBack}>Back</Button>
          <Button variant="secondary" onClick={onReset}>Reset</Button>
        </div>
        <Button onClick={onContinue} aria-label="See results">See results ({resultsCount})</Button>
      </div>
    </div>
  );
}


