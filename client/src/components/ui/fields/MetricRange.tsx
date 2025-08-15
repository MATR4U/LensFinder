import React from 'react';
import LabeledRange from './LabeledRange';
import type { FieldStatus } from './FieldContainer';
import { useMetricConfig } from '../../../lib/metricConfig';
import { tickFormatterFromUnit, formatCurrencyCHF, formatGrams, formatPercent, formatMm, parseFromUnit } from '../../../lib/formatters';
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
  const cfg = useMetricConfig(metric);
  const helpMap: Record<Metric, string> = {
    price: FIELD_HELP.price,
    weight: FIELD_HELP.weight,
    distortion: FIELD_HELP.distortionMax,
    breathing: FIELD_HELP.breathingMin,
  };
  const defaultLabels: Record<Metric, string> = {
    price: 'Price (CHF)',
    weight: 'Weight (g)',
    distortion: 'Distortion max (%)',
    breathing: 'Focus breathing score min',
  };
  const parse = cfg.unit ? parseFromUnit(cfg.unit) : undefined;
  return (
    <LabeledRange
      label={label ?? defaultLabels[metric]}
      infoText={cfg.bounds ? `${helpMap[metric]}${metric === 'price' || metric === 'weight' ? ` Available now ${cfg.bounds.min}–${cfg.bounds.max}.` : ''}` : helpMap[metric]}
      min={cfg.bounds.min}
      max={cfg.bounds.max}
      step={cfg.step}
      value={cfg.value}
      onChange={cfg.set as any}
      format={cfg.unit === 'CHF' ? formatCurrencyCHF : cfg.unit === 'g' ? (v) => `${Math.round(v)}` : cfg.unit === '%' ? formatPercent : (v) => String(v)}
      tickFormatter={cfg.tickFormatter}
      parse={parse}
      ticks={cfg.ticks}
      snap
      idPrefix={idPrefix ?? metric}
      metric={metric}
      warningTip={warningTip}
      status={status}
    />
  );
}


