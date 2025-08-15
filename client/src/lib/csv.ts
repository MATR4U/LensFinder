import type { Result } from '../types';

export function buildResultsCSV(rows: Result[]): string {
  if (!rows || rows.length === 0) return '';
  const headers = [
    'Name', 'Focal(mm)', 'Aperture(f/)', 'Eq.Focal(mm)', 'FoV H(deg)', 'DoF Total(m)', 'Weight(g)', 'Price(CHF)', 'Stabilized', 'Sealed', 'Macro', 'Score'
  ];
  const lines = rows.map((r) => [
    r.name,
    Math.round(r.focal_used_mm).toString(),
    r.max_aperture_at_focal.toFixed(1),
    r.eq_focal_ff_mm.toFixed(1),
    r.fov_h_deg.toFixed(1),
    r.dof_total_m === Infinity ? '∞' : r.dof_total_m.toFixed(2),
    r.weight_g.toString(),
    r.price_chf.toString(),
    r.stabilization,
    r.weather_sealed ? '✅' : '❌',
    r.is_macro ? '✅' : '❌',
    r.score_total.toFixed(0)
  ]);
  return [headers, ...lines]
    .map((line) => line.map((v) => (typeof v === 'string' && v.includes(',') ? '"' + v + '"' : v)).join(','))
    .join('\n');
}


