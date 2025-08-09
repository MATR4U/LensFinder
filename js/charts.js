import { optics } from './optics.js';
import { recommender } from './recommender.js';

export function renderCharts(state) {
  const plotlyLayout = {
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: { color: '#d1d5db' },
    xaxis: { gridcolor: 'rgba(255,255,255,0.1)', linecolor: 'rgba(255,255,255,0.2)', zerolinecolor: 'rgba(255,255,255,0.2)' },
    yaxis: { gridcolor: 'rgba(255,255,255,0.1)', linecolor: 'rgba(255,255,255,0.2)', zerolinecolor: 'rgba(255,255,255,0.2)' },
    legend: { bgcolor: 'rgba(0,0,0,0.5)', bordercolor: '#4b5563' },
    margin: { l: 50, r: 20, b: 40, t: 20, pad: 4 }
  };

  if (state.results.length > 0) {
    const fovTrace = {
      x: state.results.map((r) => optics.equivFocalFf(r.focal_used_mm, state.filters.camera.sensor)),
      y: state.results.map((r) => optics.fovDeg(state.filters.camera.sensor, r.focal_used_mm).h),
      text: state.results.map((r) => `${r.name}<br>Score: ${r.score_total.toFixed(0)}`),
      hoverinfo: 'text',
      mode: 'markers',
      type: 'scatter',
      marker: {
        size: state.results.map((r) => Math.max(8, 25 - recommender.maxApertureAt(r, r.focal_used_mm) * 3)),
        color: state.results.map((r) => r.score_total),
        colorscale: 'Viridis',
        showscale: true,
        colorbar: { title: 'Score', thickness: 10 }
      }
    };
    const fovLayout = { ...plotlyLayout, xaxis: { ...plotlyLayout.xaxis, title: 'Equivalent Focal (mm, FF)' }, yaxis: { ...plotlyLayout.yaxis, title: 'Horizontal FOV (deg)' } };
    Plotly.newPlot('chart-fov', [fovTrace], fovLayout, { responsive: true });
  } else {
    Plotly.purge('chart-fov');
  }

  if (state.results.length > 0) {
    const sortedResults = [...state.results].sort((a, b) => a.score_total - b.score_total).slice(-15);
    const scoreTrace = {
      x: sortedResults.map((r) => r.score_total),
      y: sortedResults.map((r) => r.name),
      type: 'bar',
      orientation: 'h',
      marker: { color: sortedResults.map((r) => r.score_total), colorscale: 'Blues' }
    };
    const scoreLayout = { ...plotlyLayout, yaxis: { ...plotlyLayout.yaxis, automargin: true }, xaxis: { ...plotlyLayout.xaxis, title: 'Weighted Score' } };
    Plotly.newPlot('chart-score', [scoreTrace], scoreLayout, { responsive: true });
  } else {
    Plotly.purge('chart-score');
  }
}


