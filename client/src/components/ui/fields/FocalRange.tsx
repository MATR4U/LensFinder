import React from 'react';
import LabeledRange from './LabeledRange';
import { useMetricConfig } from '../../../lib/metricConfig';
import { FIELD_HELP } from '../fieldHelp';
import { parseFromUnit, formatMm } from '../../../lib/formatters';
import type { FieldStatus } from './FieldContainer';

type Props = {
  label?: string;
  idPrefix?: string;
  histogramValues?: number[];
  histogramTotalValues?: number[];
  warningTip?: string;
  status?: FieldStatus;
};

export default function FocalRange({ label, idPrefix, histogramValues, histogramTotalValues, warningTip, status }: Props) {
  const cfg = useMetricConfig('focal');
  const parse = parseFromUnit('mm');

  return (
    <LabeledRange
      label={label ?? 'Desired focal range (mm)'}
      infoText={cfg.bounds ? `${FIELD_HELP.focalRange} Available ${cfg.bounds.min}–${cfg.bounds.max} mm.` : FIELD_HELP.focalRange}
      min={cfg.bounds.min}
      max={cfg.bounds.max}
      step={cfg.step}
      value={cfg.value as any}
      onChange={cfg.set as any}
      format={(v) => `${Math.round(v)}`}
      parse={parse}
      tickFormatter={cfg.tickFormatter}
      ticks={cfg.ticks}
      snap
      idPrefix={idPrefix ?? 'focal'}
      histogramValues={histogramValues}
      histogramTotalValues={histogramTotalValues}
      warningTip={warningTip}
      status={status}
      metric="focal"
    />
  );
}



