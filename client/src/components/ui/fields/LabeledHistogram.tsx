import React from 'react';
import Histogram from '../Histogram';

type Props = {
  min: number;
  max: number;
  value: { min: number; max: number };
  onChange: (v: { min: number; max: number }) => void;
  histogramValues?: number[];
  histogramTotalValues?: number[];
  histogramShowMaxLabel?: boolean;
};

export default function LabeledHistogram({ min, max, value, onChange, histogramValues, histogramTotalValues, histogramShowMaxLabel }: Props) {
  if (!(histogramValues || histogramTotalValues)) return null;
  return (
    <Histogram
      values={histogramValues || []}
      totalValues={histogramTotalValues}
      min={min}
      max={max}
      selection={{ min: value.min, max: value.max }}
      onSelectRange={(r) => onChange({ min: Math.max(min, Math.min(max, Math.round(r.min))), max: Math.max(min, Math.min(max, Math.round(r.max))) })}
      showMaxLabel={!!histogramShowMaxLabel}
    />
  );
}


