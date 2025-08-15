import React from 'react';

export function useAriaValueText(format: (v: number) => string) {
  return React.useCallback((v: number) => format(v), [format]);
}

export function withFieldIds(idPrefix: string) {
  const labelId = `${idPrefix}-label`;
  const inputId = `${idPrefix}-input`;
  return { labelId, inputId } as const;
}


