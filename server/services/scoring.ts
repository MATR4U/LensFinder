import { getPool } from '../db/pg.js';

type UseCase = 'Travel' | 'Portraits' | 'Sports & Wildlife' | 'Video' | 'Macro' | 'Landscape' | 'Everyday';

type Priorities = {
  portability: number;
  lowLight: number;
  zoom: number;
};

type Budget = {
  target: number;
  isFlexible: boolean;
};

type LensRow = {
  id: number;
  name: string;
  brand: string;
  mount: string;
  coverage: string;
  focal_min_mm: number | null;
  focal_max_mm: number | null;
  aperture_min: number | null;
  aperture_max: number | null;
  weight_g: number | null;
  ois: boolean | number;
  price_chf: number | null;
  weather_sealed: boolean | number;
  is_macro: boolean | number;
  distortion_pct: number | null;
  focus_breathing_score: number | null;
  source_url: string | null;
  image_url?: string | null;
};

const USE_CASE_WEIGHTS: Record<UseCase, Priorities> = {
  Travel: { portability: 0.5, zoom: 0.4, lowLight: 0.1 },
  Portraits: { lowLight: 0.6, portability: 0.2, zoom: 0.2 },
  'Sports & Wildlife': { zoom: 0.6, lowLight: 0.25, portability: 0.15 },
  Video: { lowLight: 0.35, portability: 0.2, zoom: 0.45 },
  Macro: { lowLight: 0.4, portability: 0.3, zoom: 0.3 },
  Landscape: { portability: 0.35, zoom: 0.4, lowLight: 0.25 },
  Everyday: { portability: 0.4, zoom: 0.4, lowLight: 0.2 },
};

function averageUseCaseWeights(useCases: string[]): Priorities {
  const cases = (useCases as UseCase[]).filter((c) => USE_CASE_WEIGHTS[c as UseCase]);
  if (cases.length === 0) return { portability: 1 / 3, lowLight: 1 / 3, zoom: 1 / 3 };
  const sum = cases.reduce(
    (acc, c) => {
      const w = USE_CASE_WEIGHTS[c];
      acc.portability += w.portability;
      acc.lowLight += w.lowLight;
      acc.zoom += w.zoom;
      return acc;
    },
    { portability: 0, lowLight: 0, zoom: 0 }
  );
  return {
    portability: sum.portability / cases.length,
    lowLight: sum.lowLight / cases.length,
    zoom: sum.zoom / cases.length,
  };
}

type NormBounds = {
  minWeight: number;
  maxWeight: number;
  minAperture: number;
  maxAperture: number;
  minZoomRatio: number;
  maxZoomRatio: number;
};

function computeBounds(rows: LensRow[]): NormBounds {
  let minWeight = Infinity, maxWeight = -Infinity;
  let minAperture = Infinity, maxAperture = -Infinity;
  let minZoom = Infinity, maxZoom = -Infinity;
  for (const r of rows) {
    const w = typeof r.weight_g === 'number' ? r.weight_g : null;
    if (w !== null && Number.isFinite(w)) {
      if (w < minWeight) minWeight = w;
      if (w > maxWeight) maxWeight = w;
    }
    const ap = typeof r.aperture_min === 'number' ? r.aperture_min : null;
    if (ap !== null && Number.isFinite(ap)) {
      if (ap < minAperture) minAperture = ap;
      if (ap > maxAperture) maxAperture = ap;
    }
    const fmin = typeof r.focal_min_mm === 'number' && r.focal_min_mm && r.focal_min_mm > 0 ? r.focal_min_mm : null;
    const fmax = typeof r.focal_max_mm === 'number' ? r.focal_max_mm : null;
    const zoom = fmin && fmax ? Math.max(1, fmax / fmin) : 1;
    if (Number.isFinite(zoom)) {
      if (zoom < minZoom) minZoom = zoom;
      if (zoom > maxZoom) maxZoom = zoom;
    }
  }
  if (!Number.isFinite(minWeight) || !Number.isFinite(maxWeight) || minWeight === maxWeight) {
    minWeight = 0; maxWeight = 1;
  }
  if (!Number.isFinite(minAperture) || !Number.isFinite(maxAperture) || minAperture === maxAperture) {
    minAperture = 1.4; maxAperture = 6.3;
  }
  if (!Number.isFinite(minZoom) || !Number.isFinite(maxZoom) || minZoom === maxZoom) {
    minZoom = 1; maxZoom = 3;
  }
  return { minWeight, maxWeight, minAperture, maxAperture, minZoomRatio: minZoom, maxZoomRatio: maxZoom };
}

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function normalizePortability(weight: number | null, b: NormBounds) {
  if (weight === null || !Number.isFinite(weight)) return 0;
  if (b.maxWeight === b.minWeight) return 0.5 * 10;
  return 10 * clamp01(1 - (weight - b.minWeight) / Math.max(1, (b.maxWeight - b.minWeight)));
}

function normalizeLowLight(apMin: number | null, b: NormBounds) {
  if (apMin === null || !Number.isFinite(apMin)) return 0;
  if (b.maxAperture === b.minAperture) return 0.5 * 10;
  return 10 * clamp01((b.maxAperture - apMin) / Math.max(1e-3, (b.maxAperture - b.minAperture)));
}

function normalizeZoom(fmin: number | null, fmax: number | null, b: NormBounds) {
  const ratio = fmin && fmax && fmin > 0 ? Math.max(1, fmax / fmin) : 1;
  if (b.maxZoomRatio === b.minZoomRatio) return 0.5 * 10;
  return 10 * clamp01((ratio - b.minZoomRatio) / Math.max(1e-3, (b.maxZoomRatio - b.minZoomRatio)));
}

export type RecommendationRequest = {
  lensMount: string;
  budget: Budget;
  useCases: string[];
  priorities: Priorities;
};

export type RecommendationItem = {
  id: number;
  name: string;
  brand: string;
  lensMount: string;
  price: number | null;
  weight: number | null;
  minFocalLength: number | null;
  maxFocalLength: number | null;
  maxAperture: number | null;
  isWeatherSealed: boolean;
  hasImageStabilization: boolean;
  isMacro: boolean;
  imageUrl?: string | null;
  portabilityScore: number;
  lowLightScore: number;
  zoomScore: number;
  overallScore: number;
  valueScore: number | null;
  tags?: string[];
  greatValue?: boolean;
};

export async function getRecommendations(payload: RecommendationRequest): Promise<RecommendationItem[]> {
  const { lensMount, budget, useCases, priorities } = payload;
  const params: any[] = [lensMount];
  let sql = `
    SELECT id, name, brand, mount, coverage, focal_min_mm, focal_max_mm, aperture_min, aperture_max,
           weight_g, ois, price_chf, weather_sealed, is_macro, distortion_pct, focus_breathing_score, source_url,
           NULLIF(image_url, '') AS image_url
      FROM lenses
     WHERE mount = $1
  `;
  if (!budget?.isFlexible && Number.isFinite(budget?.target)) {
    params.push(Math.max(0, Math.floor(budget.target)));
    sql += ` AND (price_chf IS NULL OR price_chf <= $${params.length})`;
  }
  sql += ' ORDER BY brand, name';
  const { rows } = await getPool().query(sql, params);
  const list = rows as LensRow[];

  const bounds = computeBounds(list);
  const uc = averageUseCaseWeights(useCases || []);
  const p = priorities || { portability: 3, lowLight: 3, zoom: 3 };

  const scored = list.map((r) => {
    const port = normalizePortability((r.weight_g as any) ?? null, bounds);
    const low = normalizeLowLight((r.aperture_min as any) ?? null, bounds);
    const zoom = normalizeZoom((r.focal_min_mm as any) ?? null, (r.focal_max_mm as any) ?? null, bounds);

    const base = port * uc.portability + low * uc.lowLight + zoom * uc.zoom;
    const overall = port * p.portability + low * p.lowLight + zoom * p.zoom;
    const value = typeof r.price_chf === 'number' && Number.isFinite(r.price_chf) && r.price_chf > 0 ? overall / r.price_chf : null;

    const tags: string[] = [];
    if (port >= 8) tags.push('Top Portability');
    if (low >= 8) tags.push('Great in Low Light');
    if (zoom >= 8) tags.push('High Versatility');

    return {
      id: r.id,
      name: r.name,
      brand: r.brand,
      lensMount: r.mount,
      price: r.price_chf ?? null,
      weight: r.weight_g ?? null,
      minFocalLength: r.focal_min_mm ?? null,
      maxFocalLength: r.focal_max_mm ?? null,
      maxAperture: r.aperture_min ?? null,
      isWeatherSealed: !!r.weather_sealed,
      hasImageStabilization: !!r.ois,
      isMacro: !!r.is_macro,
      imageUrl: (r as any).image_url ?? null,
      portabilityScore: port,
      lowLightScore: low,
      zoomScore: zoom,
      overallScore: overall,
      valueScore: value,
      tags,
    } as RecommendationItem;
  });

  let candidates = scored;

  if (budget?.isFlexible && Number.isFinite(budget?.target)) {
    const hard = Math.max(0, Math.floor(budget.target));
    const under = candidates.filter((c) => c.price == null || (c.price as number) <= hard);
    const over = candidates.filter((c) => c.price != null && (c.price as number) > hard && (c.price as number) <= hard * 1.2);
    const values = over.map((c) => c.valueScore || 0).filter((v) => Number.isFinite(v));
    let threshold = 0;
    if (values.length > 0) {
      const sorted = [...values].sort((a, b) => a - b);
      const idx = Math.max(0, Math.floor(0.75 * (sorted.length - 1)));
      threshold = sorted[idx];
    }
    const overGood = over.filter((c) => (c.valueScore || 0) >= threshold);
    candidates = [...under, ...overGood].map((c) => ({ ...c, greatValue: c.price != null && (c.price as number) > hard && (c.valueScore || 0) >= threshold }));
  } else if (Number.isFinite(budget?.target)) {
    const hard = Math.max(0, Math.floor(budget.target));
    candidates = candidates.filter((c) => c.price == null || (c.price as number) <= hard);
  }

  candidates.sort((a, b) => (b.overallScore - a.overallScore) || ((a.price ?? Infinity) - (b.price ?? Infinity)));

  return candidates.slice(0, 15);
}
