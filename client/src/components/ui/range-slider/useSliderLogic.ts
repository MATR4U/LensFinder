import React from 'react';

export type Range = { min: number; max: number };

export type SliderLogicParams = {
  min: number;
  max: number;
  ticks?: number[];
  snap?: boolean;
  minDistance?: number;
  // mode
  rangeValue?: Range;
  singleValue?: number;
  // callbacks
  onChangeRange?: (v: Range) => void;
  onChangeSingle?: (v: number) => void;
  onCommit?: (v: Range | number) => void;
};

export function useSliderLogic(params: SliderLogicParams) {
  const { min, max, ticks, snap, minDistance = 0, rangeValue, singleValue, onChangeRange, onChangeSingle, onCommit } = params;

  const isSingle = typeof singleValue === 'number';
  const rangeVal: Range = rangeValue ?? { min, max };
  const safeMin = Math.min(Math.max(rangeVal.min, min), max);
  const safeMax = Math.min(Math.max(rangeVal.max, min), max);
  const values = React.useMemo(() => (isSingle ? [Math.min(Math.max(singleValue ?? min, min), max)] : [safeMin, safeMax]), [isSingle, safeMin, safeMax, singleValue, min, max]);

  const snapTo = React.useCallback((v: number) => {
    if (!ticks || ticks.length === 0) return v;
    let best = ticks[0]!;
    let bestD = Math.abs(v - best);
    for (let i = 1; i < ticks.length; i += 1) {
      const d = Math.abs(v - ticks[i]!);
      if (d < bestD) { bestD = d; best = ticks[i]!; }
    }
    return best;
  }, [ticks]);

  const onValueChange = React.useCallback((arr: number[]) => {
    if (isSingle) {
      const v = Math.min(Math.max(arr[0]!, min), max);
      onChangeSingle?.(v);
      return;
    }
    const [vMin, vMax] = arr as [number, number];
    let nextMin = Math.min(Math.max(vMin, min), Math.min(vMax, max));
    let nextMax = Math.max(Math.min(vMax, max), Math.max(vMin, min));
    if (minDistance > 0 && nextMax - nextMin < minDistance) {
      const curMin = values[0]!; const curMax = values[1]!;
      if (Math.abs(vMin - curMin) > Math.abs(vMax - curMax)) {
        nextMin = Math.min(nextMax - minDistance, Math.max(min, nextMin));
      } else {
        nextMax = Math.max(nextMin + minDistance, Math.min(max, nextMax));
      }
    }
    onChangeRange?.({ min: nextMin, max: nextMax });
  }, [isSingle, min, max, minDistance, values, onChangeRange, onChangeSingle]);

  const onValueCommit = React.useCallback((arr: number[]) => {
    if (isSingle) {
      const vRaw = Math.min(Math.max(arr[0]!, min), max);
      const v = snap && ticks && ticks.length > 0 ? snapTo(vRaw) : vRaw;
      onChangeSingle?.(v);
      onCommit?.(v);
      return;
    }
    const [vMin, vMax] = arr as [number, number];
    let cMin = Math.min(Math.max(vMin, min), Math.min(vMax, max));
    let cMax = Math.max(Math.min(vMax, max), Math.max(vMin, min));
    if (snap && ticks && ticks.length > 0) {
      cMin = snapTo(cMin); cMax = snapTo(cMax);
    }
    if (minDistance > 0 && cMax - cMin < minDistance) {
      cMax = Math.min(max, cMin + minDistance);
    }
    onChangeRange?.({ min: cMin, max: cMax });
    onCommit?.({ min: cMin, max: cMax });
  }, [isSingle, min, max, minDistance, snap, ticks, snapTo, onChangeRange, onChangeSingle, onCommit]);

  return { isSingle, safeMin, safeMax, values, onValueChange, onValueCommit };
}


