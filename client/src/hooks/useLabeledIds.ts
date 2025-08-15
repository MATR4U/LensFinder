import React from 'react';
import { stableIdFromLabel } from '../components/ui/fields/id';

export function useLabeledIds(label?: string, idPrefix?: string) {
  const autoLblId = React.useId();
  const autoInputId = React.useId();
  const derivedPrefix = idPrefix ?? (label ? stableIdFromLabel(label) : undefined);
  const labelId = derivedPrefix ? `${derivedPrefix}-label` : autoLblId;
  const inputId = derivedPrefix ? `${derivedPrefix}-input` : autoInputId;
  return { labelId, inputId } as const;
}


