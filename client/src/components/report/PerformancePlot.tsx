import React from 'react';
import LazyPlot from '../ui/LazyPlot';
import Info from '../ui/Info';
import { TEXT_XS_MUTED } from '../ui/styles';
import { computeParetoFrontier } from '../../lib/optics';
import { usePlotConfig } from '../../context/PlotProvider';

export default function PerformancePlot({ data }: { data: Array<{ name: string; price_chf: number; score: number; rank: number }> }) {
  const plotCfg = usePlotConfig();
  const pts = data.map(i => ({ name: i.name, x: i.price_chf, y: i.score, label: `${i.rank}. ${i.name}` }));
  const frontier = computeParetoFrontier(pts);
  return (
    <div>
      <h4 className={`text-sm font-semibold text-[var(--text-color)] mb-2 flex items-center gap-2`}>
        <span>Performance vs. Price</span>
        <Info text="Each dot is a lens. Prefer points nearer the top‑left; the green line shows the efficient frontier (best trade‑offs)." />
      </h4>
      <LazyPlot
        data={[
          { x: pts.map(p => p.x), y: pts.map(p => p.y), text: pts.map(p => p.label), mode: 'markers', type: 'scatter', marker: { size: 10, color: 'var(--plot-marker)' }, hovertemplate: '%{text}<br>Price CHF %{x}<br>Score %{y:.0f}<extra></extra>' },
          { x: frontier.map(p => p.x), y: frontier.map(p => p.y), mode: 'lines+markers', line: { color: 'var(--plot-frontier)', width: 2 }, marker: { color: 'var(--plot-frontier)', size: 6 }, name: 'Pareto frontier', hovertemplate: 'Frontier<br>Price CHF %{x}<br>Score %{y:.0f}<extra></extra>' },
        ] as any}
        layout={{ ...plotCfg.layoutDefaults, xaxis: { ...(plotCfg.layoutDefaults?.xaxis || {}), title: 'Price (CHF)' }, yaxis: { ...(plotCfg.layoutDefaults?.yaxis || {}), title: 'Score' } } as any}
        style={{ width: '100%', height: 260 }}
        config={{ ...plotCfg.configDefaults }}
      />
      <p className={`${TEXT_XS_MUTED} mt-2`}>Lenses in the top‑left give you the most performance for your money.</p>
    </div>
  );
}


