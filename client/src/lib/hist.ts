export type HistogramBin = { start: number; end: number; count: number; height: number };

export function computeHistogram(values: number[], min: number, max: number, buckets = 24, transform: 'none' | 'sqrt' | 'log' = 'sqrt'): HistogramBin[] {
  if (max <= min) return [];
  const span = max - min;
  const hist = new Array(buckets).fill(0);
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  for (const raw of values) {
    const v = clamp(raw);
    const idx = Math.min(buckets - 1, Math.max(0, Math.floor(((v - min) / span) * buckets)));
    hist[idx] += 1;
  }
  const maxCount = Math.max(1, ...hist);
  const toHeight = (c: number) => {
    const n = c / maxCount;
    if (transform === 'sqrt') return Math.sqrt(n);
    if (transform === 'log') return Math.log1p(c) / Math.log1p(maxCount);
    return n;
  };
  const bins: HistogramBin[] = [];
  for (let i = 0; i < buckets; i += 1) {
    const start = min + (i / buckets) * span;
    const end = min + ((i + 1) / buckets) * span;
    bins.push({ start, end, count: hist[i], height: toHeight(hist[i]) });
  }
  return bins;
}

// Utility: compute normalized histogram (0..1) without bin boundaries for quick UI gradients
export function computeNormalizedHistogram(values: number[], min: number, max: number, buckets = 24): number[] {
  if (max <= min) return [];
  const span = max - min;
  const hist = new Array(buckets).fill(0);
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  for (const raw of values) {
    const v = clamp(raw);
    const idx = Math.min(buckets - 1, Math.max(0, Math.floor(((v - min) / span) * buckets)));
    hist[idx] += 1;
  }
  const maxCount = Math.max(1, ...hist);
  return hist.map((h) => h / maxCount);
}

// Utility: build a linear-gradient style from a normalized histogram for slider tracks
export function gradientStyleFromNormalized(normalized: number[], colorVar = 'var(--accent-rgb)', alphaMin = 0.1, alphaMax = 0.45): React.CSSProperties {
  if (!normalized || normalized.length === 0) return {} as React.CSSProperties;
  const parts = normalized.map((a, i, arr) => {
    const start = (i / arr.length) * 100;
    const end = ((i + 1) / arr.length) * 100;
    const alpha = (alphaMin + (alphaMax - alphaMin) * a).toFixed(3);
    return `rgba(${colorVar.replace('var(', '').replace(')', '')},${alpha}) ${start}%, rgba(${colorVar.replace('var(', '').replace(')', '')},${alpha}) ${end}%`;
  }).join(',');
  return { backgroundImage: `linear-gradient(90deg, ${parts})` } as React.CSSProperties;
}


