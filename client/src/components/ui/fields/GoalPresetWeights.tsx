import React from 'react';
import RangeSlider from '../RangeSlider';
import FieldContainer from './FieldContainer';
import Info from '../Info';
import Select from '../Select';
import { TEXT_XS_MUTED, TEXT_SM } from '../styles';
import { GOAL_WEIGHT_HELP } from '../fieldHelp';

type PresetsMap = Record<string, Record<string, number>>;

type Props = {
  preset: string;
  onChangePreset: (p: string) => void;
  weights: Record<string, number>;
  onChangeWeights: (w: Record<string, number>) => void;
  presets: PresetsMap;
  label?: string;
  infoText?: string;
  step?: number;
  showWeights?: boolean;
  className?: string;
  optionSuffixMap?: Record<string, string | number>;
};

export default function GoalPresetWeights({
  preset,
  onChangePreset,
  weights,
  onChangeWeights,
  presets,
  label = 'Goal preset',
  infoText = 'A high‑level preference profile (e.g., Portraits, Travel). It adjusts scoring weights behind the scenes.',
  step = 0.05,
  showWeights = true,
  className = '',
  optionSuffixMap,
}: Props) {
  const presetKeys = React.useMemo(() => Object.keys(presets), [presets]);

  const orderedWeightKeys = React.useMemo(() => {
    const reference = presets['Balanced'] || undefined;
    const order = reference ? Object.keys(reference) : Object.keys(weights);
    const seen = new Set<string>();
    const ordered = [...order, ...Object.keys(weights)].filter((k) => {
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    return ordered;
  }, [presets, weights]);

  return (
    <FieldContainer
      label={label}
      info={infoText ? <Info text={infoText} /> : undefined}
    >
      <div className={className}>
        <Select
          value={preset}
          onChange={(p) => {
            onChangePreset(p as string);
            if (presets[p as string]) onChangeWeights({ ...presets[p as string] });
          }}
        >
          {presetKeys.map((p) => {
            const suffix = optionSuffixMap && (optionSuffixMap[p] ?? optionSuffixMap[p as string]);
            const labelText = suffix !== undefined && suffix !== null && suffix !== '' ? `${p} (${suffix})` : p;
            return <option key={p} value={p}>{labelText}</option>;
          })}
          <option value="Custom">Custom</option>
        </Select>

        {showWeights && (
          <div className="mt-3 space-y-2">
            {orderedWeightKeys.map((key) => (
              <div key={key} className="grid grid-cols-5 gap-2 items-center">
                <div className="flex items-center gap-2">
                  <span className={`${TEXT_SM} capitalize`}>{key.replace(/_/g, ' ')}</span>
                  {GOAL_WEIGHT_HELP[key] && <Info text={GOAL_WEIGHT_HELP[key]} />}
                </div>
                <RangeSlider
                  min={0}
                  max={1}
                  step={step}
                  singleValue={weights[key] ?? 0}
                  onChangeSingle={(v) => onChangeWeights({ ...weights, [key]: v })}
                  className="col-span-3"
                  showTickLabels={false}
                />
                <span className={`${TEXT_XS_MUTED} text-right`}>{(weights[key] ?? 0).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </FieldContainer>
  );
}


