import React from 'react';
import { type FieldStatus } from './FieldContainer';
import BaseLabeledField from './BaseLabeledField';
import Checkbox from '../Checkbox';

type Props = {
  label: string;
  infoText?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  right?: React.ReactNode;
  hint?: string;
  status?: FieldStatus;
  idPrefix?: string;
};

export default function LabeledCheckbox({ label, infoText, checked, onChange, right, hint, status, idPrefix }: Props) {
  return (
    <BaseLabeledField label={label} infoText={infoText} right={right} hint={hint} status={status} idPrefix={idPrefix}>
      {({ inputId, labelId }) => (
        <div className="inline-flex items-center gap-3">
          <Checkbox
            checked={checked}
            onChange={onChange}
            inputProps={{ id: inputId, 'aria-labelledby': labelId }}
          />
        </div>
      )}
    </BaseLabeledField>
  );
}


