import { CARD_BASE, CARD_NEUTRAL, GRID_LG_TWO_GAP6, ROW_BETWEEN } from './ui/styles';
import Loading from './ui/Loading';
import React from 'react';
import LazyPlot from './ui/LazyPlot';
import Info from './ui/Info';
import type { Result, Camera } from '../types';

type Props = { results: Result[]; camera: Camera | undefined };

export default function Charts({ results, camera }: Props) {
  const layoutBase = {
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: { color: 'var(--plot-font)' },
    xaxis: { gridcolor: 'var(--plot-grid)', linecolor: 'var(--plot-grid)', zerolinecolor: 'var(--plot-grid)' },
    yaxis: { gridcolor: 'var(--plot-grid)', linecolor: 'var(--plot-grid)', zerolinecolor: 'var(--plot-grid)' },
    legend: { bgcolor: 'var(--plot-legend-bg)', bordercolor: 'var(--plot-legend-border)' },
    margin: { l: 50, r: 20, b: 40, t: 20, pad: 4 }
  } as const;

  const scoreValues = results.map((r) => r.score_total);
  const cmin = scoreValues.length ? Math.min(...scoreValues) : undefined;
  const cmax = scoreValues.length ? Math.max(...scoreValues) : undefined;

  const fovData = results.length === 0 ? [] : [{
    x: results.map((r) => r.eq_focal_ff_mm),
    y: results.map((r) => r.fov_h_deg),
    text: results.map((r) => `${r.name} — Score ${r.score_total.toFixed(0)}`),
    hovertemplate: '%{text}<br>Eq. focal: %{x:.1f}mm (FF)<br>Horiz. FoV: %{y:.1f}°<extra></extra>',
    mode: 'markers',
    type: 'scatter',
    marker: {
      size: results.map((r) => Math.max(8, 26 - r.max_aperture_at_focal * 3)),
      color: results.map((r) => r.score_total),
      colorscale: 'Blues',
      cmin,
      cmax,
      showscale: true,
      colorbar: { title: 'Score', thickness: 10 }
    }
  }];

  const fovLayout = { ...layoutBase, xaxis: { ...layoutBase.xaxis, title: 'Equivalent Focal (mm, FF)' }, yaxis: { ...layoutBase.yaxis, title: 'Horizontal FoV (°)', autorange: 'reversed' } };

  const topDesc = [...results].sort((a, b) => b.score_total - a.score_total).slice(0, 15);
  const labels = topDesc.map((r) => r.name).reverse();
  const values = topDesc.map((r) => r.score_total).reverse();
  const scoreData = topDesc.length === 0 ? [] : [{
    x: values,
    y: labels,
    type: 'bar',
    orientation: 'h',
    hovertemplate: '%{y}<br>Score %{x:.0f}<extra></extra>',
    marker: { color: values, colorscale: 'Blues', cmin, cmax }
  }];
  const scoreLayout = { ...layoutBase, yaxis: { ...layoutBase.yaxis, automargin: true }, xaxis: { ...layoutBase.xaxis, title: 'Weighted Score' } };

  return (
    <div className={GRID_LG_TWO_GAP6}>
      <div className={`${CARD_BASE} ${CARD_NEUTRAL}`}>
        <div className={`mb-2 ${ROW_BETWEEN}`}>
          <h3 className="font-semibold">FoV vs Eq. Focal</h3>
          <div className="flex items-center gap-2">
            <Info text="FoV (Field of View) shows how much of a scene fits in the frame. As equivalent focal length (full‑frame) increases, the horizontal FoV decreases. This scatter lets you compare how wide/tight each lens feels on your selected camera and how that relates to overall score (color)." />
            <Info text="Eq. Focal (full‑frame equivalent focal length): focal × crop factor. Lets you compare lenses fairly across sensor sizes." />
            <Info text="Score: weighted composite based on your preset/slider choices (low‑light, blur, reach, wide, portability, value, distortion, video)." />
          </div>
        </div>
        <React.Suspense fallback={<Loading text="Loading chart…" />}>
          <LazyPlot data={fovData as any} layout={fovLayout as any} style={{ width: '100%', height: 380 }} config={{ displayModeBar: false }} />
        </React.Suspense>
      </div>
      <div className={`${CARD_BASE} ${CARD_NEUTRAL}`}>
        <div className={`mb-2 ${ROW_BETWEEN}`}>
          <h3 className="font-semibold">Scores</h3>
          <div className="flex items-center gap-2">
            <Info text="Top lenses by your current weights. Darker bars indicate higher total scores. Use this to quickly shortlist candidates." />
          </div>
        </div>
        <React.Suspense fallback={<Loading text="Loading chart…" />}>
          <LazyPlot data={scoreData as any} layout={scoreLayout as any} style={{ width: '100%', height: 380 }} config={{ displayModeBar: false }} />
        </React.Suspense>
      </div>
    </div>
  );
}


