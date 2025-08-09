import React from 'react';
import Plot from 'react-plotly.js';
import type { Result, Camera } from '../types';

type Props = { results: Result[]; camera: Camera | undefined };

export default function Charts({ results, camera }: Props) {
  const layoutBase = {
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: { color: '#d1d5db' },
    xaxis: { gridcolor: 'rgba(255,255,255,0.1)', linecolor: 'rgba(255,255,255,0.2)', zerolinecolor: 'rgba(255,255,255,0.2)' },
    yaxis: { gridcolor: 'rgba(255,255,255,0.1)', linecolor: 'rgba(255,255,255,0.2)', zerolinecolor: 'rgba(255,255,255,0.2)' },
    legend: { bgcolor: 'rgba(0,0,0,0.5)', bordercolor: '#4b5563' },
    margin: { l: 50, r: 20, b: 40, t: 20, pad: 4 }
  } as const;

  const fovData = results.length === 0 ? [] : [{
    x: results.map((r) => r.eq_focal_ff_mm),
    y: results.map((r) => r.fov_h_deg),
    text: results.map((r) => `${r.name}<br>Score: ${r.score_total.toFixed(0)}`),
    hoverinfo: 'text',
    mode: 'markers',
    type: 'scatter',
    marker: { size: results.map((r) => Math.max(8, 25 - r.max_aperture_at_focal * 3)), color: results.map((r) => r.score_total), colorscale: 'Viridis', showscale: true, colorbar: { title: 'Score', thickness: 10 } }
  }];

  const fovLayout = { ...layoutBase, xaxis: { ...layoutBase.xaxis, title: 'Equivalent Focal (mm, FF)' }, yaxis: { ...layoutBase.yaxis, title: 'Horizontal FOV (deg)' } };

  const top = [...results].sort((a, b) => a.score_total - b.score_total).slice(-15);
  const scoreData = top.length === 0 ? [] : [{
    x: top.map((r) => r.score_total),
    y: top.map((r) => r.name),
    type: 'bar',
    orientation: 'h',
    marker: { color: top.map((r) => r.score_total), colorscale: 'Blues' }
  }];
  const scoreLayout = { ...layoutBase, yaxis: { ...layoutBase.yaxis, automargin: true }, xaxis: { ...layoutBase.xaxis, title: 'Weighted Score' } };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-gray-900/60 rounded-xl border border-gray-800 p-4">
        <h3 className="font-semibold mb-2">FoV vs Eq. Focal</h3>
        <Plot data={fovData as any} layout={fovLayout as any} style={{ width: '100%', height: 380 }} config={{ displayModeBar: false }} />
      </div>
      <div className="bg-gray-900/60 rounded-xl border border-gray-800 p-4">
        <h3 className="font-semibold mb-2">Scores</h3>
        <Plot data={scoreData as any} layout={scoreLayout as any} style={{ width: '100%', height: 380 }} config={{ displayModeBar: false }} />
      </div>
    </div>
  );
}


