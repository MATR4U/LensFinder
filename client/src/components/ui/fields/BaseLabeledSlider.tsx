import React from 'react';
import FieldContainer, { type FieldStatus } from './FieldContainer';
import Info from '../Info';
import RangeSlider from '../RangeSlider';
import { SLIDER_FIELD_STACK, INLINE_LABEL_MUTED_XS } from '../styles';
import Checkbox from '../Checkbox';

type Range = { min: number; max: number };

type CommonProps = {
  label: string;
  infoText?: string;
  min: number;
  max: number;
  step?: number;
  ticks?: number[];
  snap?: boolean;
  format?: (v: number) => string;
  trackStyle?: React.CSSProperties;
  right?: React.ReactNode;
  hint?: string;
  status?: FieldStatus;
  id?: string; // optional override id for label
  idPrefix?: string; // optional deterministic id prefix
  warningTip?: string;
  // Optional soft preference checkbox shown inline on the right
  softPreference?: { checked: boolean; onChange: (v: boolean) => void; id?: string; label?: string };
};

type SingleMode = {
  singleValue: number;
  onChangeSingle: (v: number) => void;
  value?: never;
  onChange?: never;
};

type RangeMode = {
  value: Range;
  onChange: (v: Range) => void;
  singleValue?: never;
  onChangeSingle?: never;
};

type Props = CommonProps & (SingleMode | RangeMode);

export default function BaseLabeledSlider(props: Props) {
  const {
    label, infoText, min, max, step,
    ticks, snap, format, trackStyle,
    right, hint, status, id, warningTip, softPreference, idPrefix,
  } = props;

  const autoLblId = React.useId();
  const autoInputId = React.useId();
  const effectiveId = id ?? (idPrefix ? `${idPrefix}-label` : autoLblId);
  const effectiveInputId = idPrefix ? `${idPrefix}-input` : autoInputId;
  const isSingle = typeof (props as SingleMode).singleValue === 'number';

  const atEdge = isSingle
    ? ((props as SingleMode).singleValue <= min || (props as SingleMode).singleValue >= max)
    : ((props as RangeMode).value.min <= min || (props as RangeMode).value.max >= max);
  const fieldStatus: FieldStatus | undefined = atEdge ? (status ?? 'warning') : status;

  const effectiveTicks = Array.isArray(ticks) && ticks.length > 0
    ? ticks
    : [min, (min + max) / 4, (min + max) / 2, (3 * (min + max)) / 4, max];

  const composedRight = (
    <div className="flex items-center gap-2">
      {right}
      {softPreference && (
        <label htmlFor={softPreference.id} className={INLINE_LABEL_MUTED_XS}>
          <Checkbox checked={softPreference.checked} onChange={softPreference.onChange} inputProps={{ id: softPreference.id }} />
          <span>{softPreference.label ?? 'Soft preference'}</span>
        </label>
      )}
    </div>
  );

  return (
    <FieldContainer
      label={label}
      info={infoText ? <Info text={infoText} /> : undefined}
      right={composedRight}
      hint={hint}
      status={fieldStatus}
      labelId={effectiveId}
      htmlFor={effectiveInputId}
      warningTip={warningTip}
    >
      <div className={SLIDER_FIELD_STACK}>
        {isSingle ? (
          <RangeSlider
            min={min}
            max={max}
            step={step}
            singleValue={(props as SingleMode).singleValue}
            onChangeSingle={(props as SingleMode).onChangeSingle}
            ticks={effectiveTicks}
            snap={snap}
            format={format}
            ariaLabelledBy={effectiveId}
          />
        ) : (
          <RangeSlider
            min={min}
            max={max}
            step={step}
            value={(props as RangeMode).value}
            onChange={(props as RangeMode).onChange}
            ticks={effectiveTicks}
            snap={snap}
            format={format}
            trackStyle={trackStyle}
            ariaLabelledBy={effectiveId}
          />
        )}
      </div>
    </FieldContainer>
  );
}


