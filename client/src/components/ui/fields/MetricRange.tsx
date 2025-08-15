import React from 'react';
import LabeledRange from './LabeledRange';
import type { FieldStatus } from './FieldContainer';
import { useFilterStore } from '../../../stores/filterStore';
import { FIELD_HELP } from '../fieldHelp';

type Metric = 'price' | 'weight' | 'distortion' | 'breathing';

type Props = {
  metric: Metric;
  // Optional overrides
  label?: string;
  idPrefix?: string;
  warningTip?: string;
  status?: FieldStatus;
};

export default function MetricRange({ metric, label, idPrefix, warningTip, status }: Props) {
  const caps = useFilterStore((s) => s.availabilityCaps);

  const state = useFilterStore.getState();

  if (metric === 'price') {
    const value = state.priceRange;
    const set = useFilterStore((s) => s.setPriceRange);
    return (
      <LabeledRange
        label={label ?? 'Price (CHF)'}
        infoText={caps ? `${FIELD_HELP.price} Available now ${caps.priceBounds.min}–${caps.priceBounds.max}.` : FIELD_HELP.price}
        min={caps?.priceBounds.min ?? 0}
        max={caps?.priceBounds.max ?? 10000}
        step={50}
        value={value}
        onChange={set}
        format={(v) => String(v)}
        ticks={caps?.priceTicks}
        snap
        idPrefix={idPrefix ?? 'price'}
        metric="price"
        warningTip={warningTip}
        status={status}
      />
    );
  }

  if (metric === 'weight') {
    const value = state.weightRange;
    const set = useFilterStore((s) => s.setWeightRange);
    return (
      <LabeledRange
        label={label ?? 'Weight (g)'}
        infoText={caps ? `${FIELD_HELP.weight} Available now ${caps.weightBounds.min}–${caps.weightBounds.max}.` : FIELD_HELP.weight}
        min={caps?.weightBounds.min ?? 0}
        max={caps?.weightBounds.max ?? 5000}
        step={10}
        value={value}
        onChange={set}
        format={(v) => String(v)}
        ticks={caps?.weightTicks}
        snap
        idPrefix={idPrefix ?? 'weight'}
        metric="weight"
        warningTip={warningTip}
        status={status}
      />
    );
  }

  if (metric === 'distortion') {
    const maxVal = state.proDistortionMaxPct;
    const set = useFilterStore((s) => s.setProDistortionMaxPct);
    return (
      <LabeledRange
        label={label ?? 'Distortion max (%)'}
        infoText={FIELD_HELP.distortionMax}
        min={0}
        max={caps?.distortionMaxMax ?? 10}
        step={0.1}
        value={{ min: 0, max: maxVal }}
        onChange={(r) => set(r.max)}
        format={(v) => String(v)}
        snap
        idPrefix={idPrefix ?? 'distortion'}
        metric="distortion"
        warningTip={warningTip}
        status={status}
      />
    );
  }

  // breathing
  const minVal = state.proBreathingMinScore;
  const set = useFilterStore((s) => s.setProBreathingMinScore);
  return (
    <LabeledRange
      label={label ?? 'Focus breathing score min'}
      infoText={FIELD_HELP.breathingMin}
      min={caps?.breathingMinMin ?? 0}
      max={10}
      step={0.5}
      value={{ min: minVal, max: 10 }}
      onChange={(r) => set(r.min)}
      format={(v) => String(v)}
      snap
      idPrefix={idPrefix ?? 'breathing'}
      metric="breathing"
      warningTip={warningTip}
      status={status}
    />
  );
}


