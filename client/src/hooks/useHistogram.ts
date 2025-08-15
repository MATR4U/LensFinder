import React from 'react';
import { computeHistogram, type HistogramBin } from '../lib/hist';

type Options = { min: number; max: number; buckets?: number; transform?: 'none' | 'sqrt' | 'log' };

export default function useHistogram(values: number[], { min, max, buckets = 24, transform = 'sqrt' }: Options) {
  const bins = React.useMemo<HistogramBin[]>(() => computeHistogram(values || [], min, max, buckets, transform), [values, min, max, buckets, transform]);
  const maxCount = React.useMemo(() => bins.reduce((m, b) => Math.max(m, b.count), 0), [bins]);
  return { bins, maxCount } as const;
}


