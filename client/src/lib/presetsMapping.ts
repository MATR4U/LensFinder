import type { FilterState, Range } from '../stores/filterStore';

export type CapsLike = {
  priceBounds?: Range;
  weightBounds?: Range;
  focalBounds?: Range;
  apertureMaxMax?: number;
  distortionMaxMax?: number;
  breathingMinMin?: number;
};

export function mapWeightsToLegacyFilters(weights: Record<string, number>, cur: FilterState, caps?: CapsLike) {
  const portability = weights.portability ?? 0;
  const valueW = weights.value ?? 0;
  const lowLightOrBlur = Math.max(weights.low_light ?? 0, weights.background_blur ?? 0);
  const distortion = weights.distortion_control ?? 0;
  const video = weights.video_excellence ?? 0;
  const reach = weights.reach ?? 0;
  const wide = weights.wide ?? 0;

  // Weight
  let enableWeight = cur.enableWeight;
  let softWeight = cur.softWeight;
  let proWeightMax = cur.proWeightMax;
  if (portability >= 0.8) { enableWeight = true; softWeight = false; proWeightMax = 800; }
  else if (portability >= 0.6) { enableWeight = true; softWeight = false; proWeightMax = 1000; }
  else if (portability >= 0.4) { enableWeight = true; softWeight = true; proWeightMax = 1200; }
  else { enableWeight = false; }
  if (caps?.weightBounds) proWeightMax = Math.min(Math.max(proWeightMax, caps.weightBounds.min), caps.weightBounds.max);

  // Price
  let enablePrice = cur.enablePrice;
  let softPrice = cur.softPrice;
  let proPriceMax = cur.proPriceMax;
  if (valueW >= 0.8) { enablePrice = true; softPrice = false; proPriceMax = 1000; }
  else if (valueW >= 0.6) { enablePrice = true; softPrice = false; proPriceMax = 1500; }
  else if (valueW >= 0.4) { enablePrice = true; softPrice = true; proPriceMax = 2500; }
  else { enablePrice = false; }
  if (caps?.priceBounds) proPriceMax = Math.min(Math.max(proPriceMax, caps.priceBounds.min), caps.priceBounds.max);

  // Aperture cap
  let proMaxApertureF = cur.proMaxApertureF;
  if (lowLightOrBlur >= 0.9) proMaxApertureF = 2.0;
  else if (lowLightOrBlur >= 0.7) proMaxApertureF = 2.8;
  else proMaxApertureF = 99;
  if (caps?.apertureMaxMax) proMaxApertureF = Math.min(proMaxApertureF, caps.apertureMaxMax);

  // Focal bounds: apply only with strong intent
  let proFocalMin = 0;
  let proFocalMax = 9999;
  if (reach >= 0.7) {
    proFocalMin = reach >= 0.9 ? 100 : reach >= 0.8 ? 85 : 70;
  }
  if (wide >= 0.7) {
    proFocalMax = wide >= 0.9 ? 24 : wide >= 0.8 ? 28 : 35;
  }
  if (proFocalMin > proFocalMax) {
    const mid = Math.max(28, Math.min(85, proFocalMin));
    proFocalMin = mid - 10; proFocalMax = mid + 10;
  }
  if (caps?.focalBounds) {
    const fb = caps.focalBounds;
    // Only clamp when focal mapping is active; otherwise leave 0/9999 as true sentinels
    if (reach >= 0.7) proFocalMin = Math.min(Math.max(proFocalMin, fb.min), fb.max);
    if (wide >= 0.7) proFocalMax = Math.min(Math.max(proFocalMax, fb.min), fb.max);
    if (proFocalMin > proFocalMax) proFocalMin = fb.min;
  }

  // Distortion
  let enableDistortion = cur.enableDistortion;
  let softDistortion = cur.softDistortion;
  let proDistortionMaxPct = cur.proDistortionMaxPct;
  if (distortion >= 0.7) { enableDistortion = true; softDistortion = false; proDistortionMaxPct = 2.5; }
  else if (distortion >= 0.5) { enableDistortion = true; softDistortion = true; proDistortionMaxPct = 3.5; }
  else { enableDistortion = false; }
  if (caps?.distortionMaxMax != null) proDistortionMaxPct = Math.min(proDistortionMaxPct, caps.distortionMaxMax);

  // Breathing
  let enableBreathing = cur.enableBreathing;
  let softBreathing = cur.softBreathing;
  let proBreathingMinScore = cur.proBreathingMinScore;
  if (video >= 0.7) { enableBreathing = true; softBreathing = false; proBreathingMinScore = 7; }
  else if (video >= 0.5) { enableBreathing = true; softBreathing = true; proBreathingMinScore = 5; }
  else { enableBreathing = false; }
  if (caps?.breathingMinMin != null) proBreathingMinScore = Math.max(proBreathingMinScore, caps.breathingMinMin);

  // OIS preference
  let proRequireOIS = cur.proRequireOIS;
  if (lowLightOrBlur >= 0.85) proRequireOIS = true;

  return {
    enableWeight,
    softWeight,
    proWeightMax,
    enablePrice,
    softPrice,
    proPriceMax,
    proMaxApertureF,
    proFocalMin,
    proFocalMax,
    enableDistortion,
    softDistortion,
    proDistortionMaxPct,
    enableBreathing,
    softBreathing,
    proBreathingMinScore,
    proRequireOIS,
  } as Partial<FilterState>;
}

// Infer the closest preset to the given weight vector
export function inferPresetKey(weights: Record<string, number>, presets: Record<string, Record<string, number>>, epsilon = 0.15): string {
  let bestKey = 'Custom';
  let bestDist = Number.POSITIVE_INFINITY;
  for (const [k, v] of Object.entries(presets)) {
    let d2 = 0;
    const keys = new Set([...Object.keys(v), ...Object.keys(weights)]);
    keys.forEach((key) => {
      const a = weights[key] ?? 0;
      const b = v[key] ?? 0;
      d2 += (a - b) * (a - b);
    });
    const dist = Math.sqrt(d2 / Math.max(1, keys.size));
    if (dist < bestDist) { bestDist = dist; bestKey = k; }
  }
  return bestDist <= epsilon ? bestKey : 'Custom';
}

export function inferPresetWithHysteresis(prevPreset: string, weights: Record<string, number>, presets: Record<string, Record<string, number>>, epsilon = 0.15, hysteresis = 0.05): string {
  const current = inferPresetKey(weights, presets, epsilon);
  if (current === 'Custom') return 'Custom';
  if (prevPreset === 'Custom') return current;
  // If previous preset remains within (epsilon + hysteresis), stay on it
  const distPrev = (() => {
    let d2 = 0;
    const v = presets[prevPreset] || {};
    const keys = new Set([...Object.keys(v), ...Object.keys(weights)]);
    keys.forEach((key) => {
      const a = weights[key] ?? 0; const b = v[key] ?? 0; d2 += (a - b) * (a - b);
    });
    return Math.sqrt(d2 / Math.max(1, keys.size));
  })();
  return distPrev <= (epsilon + hysteresis) ? prevPreset : current;
}

export function encodeWeightsBase64Url(w: Record<string, number>): string {
  const ordered: Record<string, number> = {};
  Object.keys(w).sort().forEach(k => { ordered[k] = w[k]; });
  const json = JSON.stringify(ordered);
  const b64 = typeof window !== 'undefined' && window.btoa ? window.btoa(json) : Buffer.from(json, 'utf-8').toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeWeightsBase64Url(s: string | null): Record<string, number> | null {
  if (!s) return null;
  try {
    const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
    const str = typeof window !== 'undefined' && window.atob ? window.atob(b64 + pad) : Buffer.from(b64 + pad, 'base64').toString('utf-8');
    const obj = JSON.parse(str);
    if (obj && typeof obj === 'object') return obj as Record<string, number>;
    return null;
  } catch {
    return null;
  }
}

// Nudge weights in the direction implied by a filter delta
export function nudgeWeightsFromFilterDelta(delta: Partial<{
  proWeightMax: number;
  proPriceMax: number;
  proMaxApertureF: number;
  proFocalMin: number;
  proFocalMax: number;
  proDistortionMaxPct: number;
  proBreathingMinScore: number;
  proRequireOIS: boolean;
}>, caps: CapsLike | undefined, prev: Record<string, number>): Record<string, number> {
  const next = { ...prev };
  const blend = (key: string, target: number, alpha = 0.35) => {
    const cur = next[key] ?? 0;
    const t = Math.max(0, Math.min(1, target));
    next[key] = cur * (1 - alpha) + t * alpha;
  };
  if (delta.proWeightMax != null && caps?.weightBounds) {
    const { min, max } = caps.weightBounds;
    const norm = (delta.proWeightMax - min) / Math.max(1, (max - min));
    blend('portability', 1 - norm);
  }
  if (delta.proPriceMax != null && caps?.priceBounds) {
    const { min, max } = caps.priceBounds;
    const norm = (delta.proPriceMax - min) / Math.max(1, (max - min));
    blend('value', 1 - norm);
  }
  if (delta.proMaxApertureF != null && caps?.apertureMaxMax != null) {
    const norm = delta.proMaxApertureF / Math.max(1, caps.apertureMaxMax);
    const t = 1 - norm;
    blend('low_light', t);
    blend('background_blur', t * 0.8);
  }
  if ((delta.proFocalMin != null || delta.proFocalMax != null) && caps?.focalBounds) {
    const { min, max } = caps.focalBounds;
    if (delta.proFocalMin != null) {
      const norm = (delta.proFocalMin - min) / Math.max(1, (max - min));
      blend('reach', Math.max(0, Math.min(1, norm)));
    }
    if (delta.proFocalMax != null) {
      const norm = (delta.proFocalMax - min) / Math.max(1, (max - min));
      blend('wide', Math.max(0, Math.min(1, 1 - norm)));
    }
  }
  if (delta.proDistortionMaxPct != null && caps?.distortionMaxMax != null) {
    const norm = delta.proDistortionMaxPct / Math.max(1, caps.distortionMaxMax);
    blend('distortion_control', 1 - norm);
  }
  if (delta.proBreathingMinScore != null) {
    const norm = delta.proBreathingMinScore / 10;
    blend('video_excellence', norm);
  }
  if (delta.proRequireOIS != null) {
    blend('low_light', delta.proRequireOIS ? 1 : prev['low_light'] ?? 0);
  }
  return next;
}


