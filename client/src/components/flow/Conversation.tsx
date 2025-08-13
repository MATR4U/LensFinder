import React from 'react';
import { TITLE_H2, TEXT_XS_MUTED } from '../ui/styles';
import type { GoalWeights } from '../../types';
import RangeSlider from '../ui/RangeSlider';
import Button from '../ui/Button';

type Props = {
  goalPreset: string;
  goalWeights: GoalWeights;
  priceMax: number;
  onSetPreset: (p: string) => void;
  onSetWeights: (w: GoalWeights) => void;
  onSetBudgetMax: (max: number) => void;
  onContinue: () => void;
};

const STYLES: Array<{ key: string; label: string; preset: Partial<GoalWeights> }> = [
  { key: 'portraits', label: 'Portraits', preset: { low_light: 0.35, background_blur: 0.35, value: 0.1, portability: 0.2 } },
  { key: 'landscapes', label: 'Landscapes', preset: { wide: 0.4, distortion_control: 0.2, value: 0.2, portability: 0.2 } },
  { key: 'sports', label: 'Sports/Action', preset: { reach: 0.4, video_excellence: 0.2, low_light: 0.2, portability: 0.2 } },
  { key: 'travel', label: 'Travel', preset: { portability: 0.4, value: 0.3, low_light: 0.15, wide: 0.15 } },
  { key: 'video', label: 'Video', preset: { video_excellence: 0.5, portability: 0.2, value: 0.2, low_light: 0.1 } }
];

export default function Conversation({ goalPreset, goalWeights, priceMax, onSetPreset, onSetWeights, onSetBudgetMax, onContinue }: Props) {
  function applyStylePreset(preset: Partial<GoalWeights>) {
    const cleanedPreset = Object.fromEntries(
      Object.entries(preset).filter(([, v]) => typeof v === 'number')
    ) as Record<string, number>;
    const next: GoalWeights = { ...goalWeights, ...cleanedPreset };
    const sum = Object.values(next).reduce((a, b) => a + b, 0) || 1;
    const normalized = Object.fromEntries(Object.entries(next).map(([k, v]) => [k, (v as number) / sum])) as GoalWeights;
    onSetWeights(normalized);
  }

  return (
    <div className="rounded-xl border p-4 bg-[var(--card-bg)] border-[var(--card-border)]">
      <h2 className={`${TITLE_H2} mb-3`}>Let’s tailor your recommendation</h2>

      <div className="mb-4">
        <div className="text-sm font-medium text-[var(--text-color)] mb-2">What do you love to shoot?</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {STYLES.map(s => (
            <button
              key={s.key}
              onClick={() => { onSetPreset(s.label); applyStylePreset(s.preset); }}
              className="px-3 py-2 rounded-lg bg-[var(--control-bg)] border border-[var(--control-border)] text-[var(--text-color)] hover:bg-[color-mix(in_oklab,var(--control-bg),white_6%)] text-sm"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="text-sm font-medium text-[var(--text-color)] mb-1">How important is shooting in low light?</div>
        <RangeSlider
          min={0}
          max={1}
          step={0.05}
          singleValue={goalWeights.low_light ?? 0}
          onChangeSingle={(v) => onSetWeights({ ...goalWeights, low_light: v })}
          showTickLabels={false}
        />
        <div className={`${TEXT_XS_MUTED} mt-1`}>{Math.round((goalWeights.low_light ?? 0) * 100)}%</div>
      </div>

      <div className="mb-4">
        <div className="text-sm font-medium text-[var(--text-color)] mb-1">What is your lens budget?</div>
        <RangeSlider
          min={200}
          max={8000}
          step={50}
          singleValue={priceMax}
          onChangeSingle={(v) => onSetBudgetMax(Math.round(v))}
          format={(v) => `CHF ${Math.round(v)}`}
          showTickLabels={false}
        />
        <div className={`${TEXT_XS_MUTED} mt-1`}>Up to CHF {priceMax}</div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onContinue}>See recommendations</Button>
      </div>
    </div>
  );
}


