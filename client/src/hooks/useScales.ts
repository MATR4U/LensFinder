import React from 'react';
import { scaleBand, scaleLinear } from '@visx/scale';

export default function useScales(width: number, height: number, binCount: number) {
  return React.useMemo(() => {
    // Use very small padding so bars read as a continuous histogram with thin gutters
    const x = scaleBand({ domain: Array.from({ length: binCount }, (_, i) => i), range: [0, Math.max(0, width)], paddingInner: 0.02, paddingOuter: 0.01 });
    const y = scaleLinear({ domain: [0, 1], range: [0, Math.max(0, height)] });
    return { x, y } as const;
  }, [width, height, binCount]);
}


