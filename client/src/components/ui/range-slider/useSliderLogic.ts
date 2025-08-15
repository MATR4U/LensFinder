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
  const initialValues = isSingle
    ? [Math.min(Math.max(singleValue ?? min, min), max)]
    : [safeMin, safeMax];

  const [liveValues, setLiveValues] = React.useState<number[]>(initialValues);
  const [dragging, setDragging] = React.useState(false);
  const lastDirRef = React.useRef<number[]>([0, 0]);

  // Sync from props when not dragging
  React.useEffect(() => {
    if (!dragging) {
      const next = isSingle
        ? [Math.min(Math.max(singleValue ?? min, min), max)]
        : [Math.min(Math.max(rangeVal.min, min), max), Math.min(Math.max(rangeVal.max, min), max)];
      setLiveValues(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSingle, singleValue, rangeVal.min, rangeVal.max, min, max, dragging]);

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

  // Bias snapping toward pointer direction when near midpoints
  function snapWithBias(v: number, sign: number): number {
    if (!ticks || ticks.length === 0) return v;
    let idx = 0;
    for (let i = 0; i < ticks.length; i += 1) { if (v >= ticks[i]!) idx = i; }
    const a = ticks[idx]!;
    const b = ticks[Math.min(ticks.length - 1, idx + 1)]!;
    const mid = a + (b - a) / 2;
    if (sign > 0) return v >= mid ? b : snapTo(v);
    if (sign < 0) return v < mid ? a : snapTo(v);
    return snapTo(v);
  }

  const onValueChange = React.useCallback((arr: number[]) => {
    setDragging(true);
    if (isSingle) {
      let v = Math.min(Math.max(arr[0]!, min), max);
      setLiveValues([v]);
      onChangeSingle?.(v);
      return;
    }
    const [vMin, vMax] = arr as [number, number];
    let nextMin = Math.min(Math.max(vMin, min), Math.min(vMax, max));
    let nextMax = Math.max(Math.min(vMax, max), Math.max(vMin, min));
    if (minDistance > 0 && nextMax - nextMin < minDistance) {
      const curMin = liveValues[0]!; const curMax = liveValues[1]!;
      if (Math.abs(vMin - curMin) > Math.abs(vMax - curMax)) {
        nextMin = Math.min(nextMax - minDistance, Math.max(min, nextMin));
      } else {
        nextMax = Math.max(nextMin + minDistance, Math.min(max, nextMax));
      }
    }
    // Track last movement direction for biasing on commit
    const dMin = nextMin - liveValues[0]!;
    const dMax = nextMax - liveValues[1]!;
    lastDirRef.current[0] = dMin === 0 ? lastDirRef.current[0] : Math.sign(dMin);
    lastDirRef.current[1] = dMax === 0 ? lastDirRef.current[1] : Math.sign(dMax);
    setLiveValues([nextMin, nextMax]);
    onChangeRange?.({ min: nextMin, max: nextMax });
  }, [isSingle, min, max, minDistance, liveValues, onChangeRange, onChangeSingle]);

  const onValueCommit = React.useCallback((arr: number[]) => {
    if (isSingle) {
      const vRaw = Math.min(Math.max(arr[0]!, min), max);
      const v = snap && ticks && ticks.length > 0 ? snapTo(vRaw) : vRaw;
      setLiveValues([v]);
      setDragging(false);
      onChangeSingle?.(v);
      onCommit?.(v);
      return;
    }
    const [vMin, vMax] = arr as [number, number];
    let cMin = Math.min(Math.max(vMin, min), Math.min(vMax, max));
    let cMax = Math.max(Math.min(vMax, max), Math.max(vMin, min));
    if (snap && ticks && ticks.length > 0) {
      const signMin = lastDirRef.current[0] || 0;
      const signMax = lastDirRef.current[1] || 0;
      cMin = snapWithBias(cMin, signMin);
      cMax = snapWithBias(cMax, signMax);
    }
    if (minDistance > 0 && cMax - cMin < minDistance) {
      cMax = Math.min(max, cMin + minDistance);
    }
    setLiveValues([cMin, cMax]);
    setDragging(false);
    onChangeRange?.({ min: cMin, max: cMax });
    onCommit?.({ min: cMin, max: cMax });
  }, [isSingle, min, max, minDistance, snap, ticks, snapTo, onChangeRange, onChangeSingle, onCommit]);

  return { isSingle, safeMin, safeMax, values: liveValues, onValueChange, onValueCommit };
}


