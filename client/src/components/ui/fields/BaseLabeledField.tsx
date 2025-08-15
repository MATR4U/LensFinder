import React from 'react';
import FieldContainer, { type FieldStatus } from './FieldContainer';
import { stableIdFromLabel } from './id';
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
  // Extended a11y/validation and test hooks
  validationState?: 'none' | 'error' | 'success';
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  testId?: string;
};

export default function BaseLabeledField({ label, infoText, status, hint, right, children, labelId, htmlFor, warningTip, idPrefix, validationState = 'none', required, disabled, readOnly, testId }: Props) {
  const autoInputId = React.useId();
  const autoLabelId = React.useId();
  const base = idPrefix ?? stableIdFromLabel(label);
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
      validationState={validationState}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
      testId={testId}
    >
      {typeof children === 'function'
        ? children({ inputId: effectiveInputId, labelId: effectiveLabelId })
        : children}
    </FieldContainer>
  );
}


