import React from 'react';

export function useSliderKeyboard({ min, max, step, isSingle, values, onValueChange, onValueCommit }: {
  min: number;
  max: number;
  step?: number;
  isSingle: boolean;
  values: number[];
  onValueChange: (arr: number[]) => void;
  onValueCommit: (arr: number[]) => void;
}) {
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    const stepBase = step || 1;
    const big = stepBase * 10;
    const k = e.key;
    if (e.shiftKey && (k === 'ArrowLeft' || k === 'ArrowRight')) {
      e.preventDefault();
      const sign = k === 'ArrowLeft' ? -1 : 1;
      const delta = big * sign;
      const next = isSingle
        ? [Math.min(max, Math.max(min, (values[0] ?? min) + delta))]
        : [Math.min(max, Math.max(min, (values[0] ?? min))), Math.min(max, Math.max(min, (values[1] ?? max) + delta))];
      onValueChange(next as number[]);
    }
    if (k === 'Home' || k === 'End') {
      e.preventDefault();
      const next = isSingle
        ? [k === 'Home' ? min : max]
        : [k === 'Home' ? min : (values[0] ?? min), k === 'Home' ? (values[1] ?? max) : max];
      onValueChange(next as number[]);
      onValueCommit(next as number[]);
    }
  }, [isSingle, max, min, onValueChange, onValueCommit, step, values]);

  return { handleKeyDown };
}


