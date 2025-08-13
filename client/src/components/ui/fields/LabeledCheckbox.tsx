import React from 'react';
import FieldContainer, { type FieldStatus } from './FieldContainer';
import Info from '../Info';
import Checkbox from '../Checkbox';

type Props = {
  label: string;
  infoText?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  right?: React.ReactNode;
  hint?: string;
  status?: FieldStatus;
};

export default function LabeledCheckbox({ label, infoText, checked, onChange, right, hint, status }: Props) {
  const inputId = React.useId();
  const labelId = React.useId();
  return (
    <FieldContainer
      label={label}
      info={infoText ? <Info text={infoText} /> : undefined}
      right={right}
      hint={hint}
      status={status}
      labelId={labelId}
      htmlFor={inputId}
    >
      <div className="inline-flex items-center gap-3">
        <Checkbox
          checked={checked}
          onChange={onChange}
          inputProps={{ id: inputId, 'aria-labelledby': labelId }}
        />
      </div>
    </FieldContainer>
  );
}


