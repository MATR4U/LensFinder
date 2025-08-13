import React from 'react';
import FieldContainer, { type FieldStatus } from './FieldContainer';
import Info from '../Info';

type Props = {
  label: string;
  infoText?: string;
  status?: FieldStatus;
  hint?: string;
  right?: React.ReactNode;
  children: React.ReactNode | ((ids: { inputId: string; labelId: string }) => React.ReactNode);
  labelId?: string; // optional override
  htmlFor?: string; // optional override
  warningTip?: string;
  idPrefix?: string; // optional deterministic id prefix
};

export default function BaseLabeledField({ label, infoText, status, hint, right, children, labelId, htmlFor, warningTip, idPrefix }: Props) {
  const autoInputId = React.useId();
  const autoLabelId = React.useId();
  const base = idPrefix ?? '';
  const derivedInputId = base ? `${base}-input` : autoInputId;
  const derivedLabelId = base ? `${base}-label` : autoLabelId;
  const effectiveLabelId = labelId ?? derivedLabelId;
  const effectiveInputId = htmlFor ?? derivedInputId;
  return (
    <FieldContainer
      label={label}
      info={infoText ? <Info text={infoText} /> : undefined}
      status={status}
      hint={hint}
      right={right}
      labelId={effectiveLabelId}
      htmlFor={effectiveInputId}
      warningTip={warningTip}
    >
      {typeof children === 'function'
        ? children({ inputId: effectiveInputId, labelId: effectiveLabelId })
        : children}
    </FieldContainer>
  );
}


