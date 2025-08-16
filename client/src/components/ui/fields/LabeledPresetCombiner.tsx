import React from 'react';
import FieldContainer from './FieldContainer';
import Info from '../Info';
import { ACTION_ROW, INLINE_LABEL_MUTED_XS, TEXT_SM } from '../styles';

type PresetsMap = Record<string, Record<string, number>>;

type Props = {
  presets: PresetsMap;
  label?: string;
  infoText?: string;
  onApplyBlend: (weights: Record<string, number>) => void;
  initialSelected?: string[];
};

function blendWeights(selected: string[], presets: PresetsMap): Record<string, number> {
  if (selected.length === 0) return {};
  const acc: Record<string, number> = {};
  selected.forEach((k) => {
    const w = presets[k] || {};
    for (const key in w) acc[key] = (acc[key] ?? 0) + w[key];
  });
  const out: Record<string, number> = {};
  const denom = selected.length;
  for (const key in acc) out[key] = acc[key] / denom;
  return out;
}

export default function LabeledPresetCombiner({ presets, label = 'Blend presets', infoText = 'Select multiple presets to create a blended preference. We will average the weights and apply them.', onApplyBlend, initialSelected = [] }: Props) {
  const allKeys = React.useMemo(() => Object.keys(presets), [presets]);
  const [selected, setSelected] = React.useState<string[]>(initialSelected);

  const toggle = (k: string) => {
    setSelected((cur) => (cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k]));
  };

  const disabled = selected.length === 0;

  return (
    <FieldContainer
      label={label}
      info={infoText ? <Info text={infoText} /> : undefined}
    >
      <div className="flex flex-wrap gap-2">
        {allKeys.map((k) => (
          <label key={k} className="inline-flex items-center gap-2 px-2 py-1 rounded border border-[var(--control-border)] cursor-pointer select-none">
            <input
              type="checkbox"
              className="accent-[var(--accent)]"
              checked={selected.includes(k)}
              onChange={() => toggle(k)}
            />
            <span className={TEXT_SM}>{k}</span>
          </label>
        ))}
      </div>
      <div className={`${ACTION_ROW} mt-2`}>
        <button
          className="px-3 py-1.5 rounded bg-[var(--accent)] text-[var(--accent-contrast)] text-sm disabled:opacity-50"
          disabled={disabled}
          onClick={() => {
            const weights = blendWeights(selected, presets);
            onApplyBlend(weights);
          }}
        >
          Apply blend
        </button>
        <span className={INLINE_LABEL_MUTED_XS}>{disabled ? 'Select one or more presets' : `${selected.length} selected`}</span>
      </div>
    </FieldContainer>
  );
}


