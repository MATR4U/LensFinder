import React from 'react';
import { TEXT_XS_MUTED, LINK_HOVER_ACCENT, PANEL_BASE, PANEL_NEUTRAL, TEXT_SM, CARD_PADDED, GRID_LG_TWO_GAP6 } from './ui/styles';
import BaseReport from './report/BaseReport';
import { useReportLifecycle } from './report/useReportLifecycle';
import { buildResultsCSV } from '../lib/csv';
import LazyPlot from './ui/LazyPlot';
import { usePlotConfig } from '../context/PlotProvider';
import { computeParetoFrontier } from '../lib/optics';
import type { ReportResponse } from '../lib/api';
import type { Camera, Result } from '../types';
import { useSelectedResults } from '../hooks/useSelectedResults';
import { useFilterStore } from '../stores/filterStore';
import { clientConfig } from '../config';
import SummaryHeader from './report/SummaryHeader';
import Recommendations from './report/Recommendations';
import RankingWeights from './report/RankingWeights';
import CollapsibleMessage from './ui/CollapsibleMessage';
import Info from './ui/Info';
import { useStageLifecycle } from '../hooks/useStageLifecycle';

type Props = {
  report: ReportResponse | null;
  camera?: Camera | null;
  selected?: Result | null;
  goalWeights?: Record<string, number>;
  topResults?: Result[];
  onEditPreferences?: () => void;
};

type DisplayItem = { name: string; score: number; type: string; weight_g: number; price_chf: number; rank: number };

function fromResults(results: Result[]): DisplayItem[] {
  return results.map((r, idx) => ({
    name: r.name,
    score: r.score_total,
    type: (r.focal_min_mm === r.focal_max_mm) ? 'prime' : 'zoom',
    weight_g: r.weight_g,
    price_chf: r.price_chf,
    rank: idx + 1,
  }));
}

function fromReportItems(items: ReportResponse['items']): DisplayItem[] {
  return items.map(i => ({
    name: i.name,
    score: i.score,
    type: i.type,
    weight_g: i.weight_g,
    price_chf: i.price_chf,
    rank: i.rank,
  }));
}

export default function Report({ report, camera, selected, goalWeights, topResults = [], onEditPreferences }: Props) {
  if (!report) return null;
  const { cameraName, goal, items } = report;

  useReportLifecycle('Personalized lens report', report);
  const { onEnter } = useStageLifecycle(4, { resetOnEntry: false });
  React.useEffect(() => { onEnter(); }, [onEnter]);
  const plotCfg = usePlotConfig();

  // Helpers

  // Compute derived metrics
  // Reflect current selection order if available
  const selectedNow = useSelectedResults(topResults as any);
  const selectedDisplay = fromResults(selectedNow as unknown as Result[]);
  const itemsDisplay = fromReportItems(items);
  const top3 = (selectedDisplay.length > 0 ? selectedDisplay : itemsDisplay).slice(0, 3);
  const valueScores = top3.map(i => ({ i, v: i.price_chf > 0 ? i.score / i.price_chf : 0 }));
  const bestValue = valueScores.slice().sort((a, b) => b.v - a.v)[0]?.i;
  const topPerformer = top3.slice().sort((a, b) => b.score - a.score)[0];
  const lightest = top3.slice().sort((a, b) => a.weight_g - b.weight_g)[0];

  // Normalize for simple bars (0..10)
  const maxWeight = Math.max(...top3.map(i => i.weight_g || 1), 1);
  const minWeight = Math.min(...top3.map(i => i.weight_g || 1));
  const maxValueIndex = Math.max(...valueScores.map(v => v.v), 1);
  const toBar = (v: number, max = 10) => Math.max(0, Math.min(10, v));
  const toPortabilityBar = (w: number) => {
    if (maxWeight === minWeight) return 5;
    const norm = (maxWeight - w) / (maxWeight - minWeight); // lighter -> higher
    return toBar(norm * 10);
  };

  // Build bars for recommendations
  const bars = Object.fromEntries(top3.map(t => {
    const valueIndex = t.price_chf > 0 ? (t.score / t.price_chf) : 0;
    return [t.name, {
      lowLight: toBar(Number((itemsDisplay.find(r => r.name === t.name) as any)?.low_light ?? 0)),
      video: toBar(Number((itemsDisplay.find(r => r.name === t.name) as any)?.video_excellence ?? 0)),
      portability: toPortabilityBar(t.weight_g || 0),
      value: toBar(maxValueIndex ? (valueIndex / maxValueIndex) * 10 : 0)
    }];
  }));

  return (
    <BaseReport title="Your personalized lens report" onExportCSV={() => {
      const csv = buildResultsCSV(items as any);
      if (!csv) return;
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'lens_results.csv';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }}>
      {/* Section 1: Personalized summary */}
      <SummaryHeader cameraName={cameraName} goal={goal} onEditPreferences={onEditPreferences} />

      <CollapsibleMessage variant="info" title="How to read this report" defaultOpen={false} className="mb-4">
        <ul>
          <li><strong>Score</strong>: Overall utility aligned to your preferences. Higher is better.</li>
          <li><strong>Badges</strong>: Top Performer = highest Score; Best Value = best Score÷Price; Best Portability = lightest.</li>
          <li><strong>Bars</strong>: Low Light, Video, Portability, Value are normalized 0–10 within your top picks to highlight strengths.</li>
          <li><strong>Chart</strong>: Each dot is a lens (X = Price, Y = Score). The green line marks the Pareto frontier—prefer options near the top‑left.</li>
          <li><strong>Decide</strong>: If torn, pick the best value on the frontier, then consider portability and your shooting style.</li>
        </ul>
      </CollapsibleMessage>

      {/* Top badges based on consistent definitions */}
      {top3.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2 text-xs">
          {topPerformer && (
            <span className="px-2 py-0.5 rounded bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30">Top performer: {topPerformer.name}</span>
          )}
          {bestValue && (
            <span className="px-2 py-0.5 rounded bg-[var(--badge-success-bg)] text-[var(--badge-success-text)] border border-[var(--badge-success-border)]">Best value: {bestValue.name}</span>
          )}
          {lightest && (
            <span className="px-2 py-0.5 rounded bg-[var(--badge-warning-bg)] text-[var(--badge-warning-text)] border border-[var(--badge-warning-border)]">Best portability: {lightest.name}</span>
          )}
        </div>
      )}

      {/* Section 2: Top 3 cards */}
      <Recommendations
        camera={camera}
        items={top3.map(t => ({ name: t.name, score: t.score, price_chf: t.price_chf, weight_g: t.weight_g, rank: t.rank, type: t.type }))}
        bars={bars}
      />

      {/* Section: Weights transparency */}
      <RankingWeights goalWeights={goalWeights} />

      {items.length > 0 && (
        <div className={`mt-6 ${GRID_LG_TWO_GAP6}`}>
          <div className="lg:col-span-2">
            <h4 className={`${TEXT_SM} font-semibold text-[var(--text-color)] mb-2 flex items-center gap-2`}>
              <span>Performance vs. Price</span>
              <Info text="Each dot is a lens. Prefer points nearer the top‑left; the green line shows the efficient frontier (best trade‑offs)." />
            </h4>
            <LazyPlot
              data={(function () {
                const pts = top3.map(i => ({ name: i.name, x: i.price_chf, y: i.score, label: `${i.rank}. ${i.name}` }));
                const frontier = computeParetoFrontier(pts);
                return [
                  {
                    x: pts.map(p => p.x),
                    y: pts.map(p => p.y),
                    text: pts.map(p => p.label),
                    mode: 'markers',
                    type: 'scatter',
                    marker: { size: 10, color: 'var(--plot-marker)' },
                    hovertemplate: '%{text}<br>Price CHF %{x}<br>Score %{y:.0f}<extra></extra>'
                  },
                  {
                    x: frontier.map(p => p.x),
                    y: frontier.map(p => p.y),
                    mode: 'lines+markers',
                    line: { color: 'var(--plot-frontier)', width: 2 },
                    marker: { color: 'var(--plot-frontier)', size: 6 },
                    name: 'Pareto frontier',
                    hovertemplate: 'Frontier<br>Price CHF %{x}<br>Score %{y:.0f}<extra></extra>'
                  }
                ] as any;
              })()}
              layout={{
                ...plotCfg.layoutDefaults,
                xaxis: { ...(plotCfg.layoutDefaults?.xaxis || {}), title: 'Price (CHF)' },
                yaxis: { ...(plotCfg.layoutDefaults?.yaxis || {}), title: 'Score' },
              } as any}
              style={{ width: '100%', height: 260 }}
              config={{ ...plotCfg.configDefaults }}
            />
            <p className={`${TEXT_XS_MUTED} mt-2`}>Lenses in the top‑left give you the most performance for your money.</p>
          </div>
        </div>
      )}
      {/* Final verdict with consistent definitions */}
      {top3.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-bold text-[var(--text-color)]">Final Verdict</h3>
          <ul className="list-disc list-inside">
            {topPerformer && (<li><span className="font-semibold">Top Performer:</span> <a className={LINK_HOVER_ACCENT} href={`${clientConfig.searchUrlBase}${encodeURIComponent(topPerformer.name)}`} target="_blank" rel="noopener noreferrer">{topPerformer.name}</a></li>)}
            {bestValue && (<li><span className="font-semibold">Best Value (Score ÷ Price):</span> <a className={LINK_HOVER_ACCENT} href={`${clientConfig.searchUrlBase}${encodeURIComponent(bestValue.name)}`} target="_blank" rel="noopener noreferrer">{bestValue.name}</a></li>)}
            {lightest && (<li><span className="font-semibold">Best Portability (Lightest):</span> <a className={LINK_HOVER_ACCENT} href={`${clientConfig.searchUrlBase}${encodeURIComponent(lightest.name)}`} target="_blank" rel="noopener noreferrer">{lightest.name}</a></li>)}
          </ul>
        </div>
      )}
      <p className={`${TEXT_XS_MUTED} mt-4`}>Tip: Click any lens to view prices. The bars reflect key factors; adjust weights to see how recommendations change.</p>
    </BaseReport>
  );
}


