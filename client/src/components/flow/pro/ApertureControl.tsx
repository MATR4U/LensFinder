import React from 'react';
import LabeledSlider from '../../ui/fields/LabeledSlider';
import { FIELD_HELP } from '../../ui/fieldHelp';
import { useFilterBindings, PRO_REQ_BINDINGS } from '../../../hooks/useStoreBindings';

export default function ApertureControl({ maxApertureLimit }: { maxApertureLimit?: number }) {
  const { maxApertureF, setMaxApertureF } = useFilterBindings(PRO_REQ_BINDINGS);
  const values = [1.4, 1.8, 2.0, 2.8, 3.5, 4.0, 5.6, 8.0, 11.0, 16.0].filter(v => (maxApertureLimit ? v <= maxApertureLimit : true));
  const ticks = values.map(v => Number(v.toFixed(1)));
  const minTick = ticks[0] ?? 1.4;
  const maxTick = ticks[ticks.length - 1] ?? (maxApertureLimit ?? 16.0);
  return (
    <LabeledSlider
      label="Max aperture (f/)"
      infoText={FIELD_HELP.maxAperture}
      min={minTick}
      max={maxTick}
      step={0.1}
      value={maxApertureF}
      onChange={(v) => setMaxApertureF(Number(v))}
      ticks={ticks}
      snap
      format={(v) => v.toFixed(1)}
      idPrefix="aperture"
    />
  );
}


