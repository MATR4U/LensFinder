import React from 'react';
import { TEXT_XS_MUTED, LINK_HOVER_ACCENT, PANEL_BASE, PANEL_NEUTRAL, TEXT_SM, CARD_PADDED, GRID_LG_TWO_GAP6 } from './ui/styles';
import LazyPlot from './ui/LazyPlot';
import { computeParetoFrontier } from '../lib/optics';
import type { ReportResponse } from '../lib/api';
import type { Camera, Result } from '../types';
import { useFilterStore } from '../stores/filterStore';
import { clientConfig } from '../config';
import SummaryHeader from './report/SummaryHeader';
import Recommendations from './report/Recommendations';
import RankingWeights from './report/RankingWeights';
import CollapsibleMessage from './ui/CollapsibleMessage';
import Info from './ui/Info';

type Props = {
  report: ReportResponse | null;
  camera?: Camera | null;
  selected?: Result | null;
  goalWeights?: Record<string, number>;
  topResults?: Result[];
  onEditPreferences?: () => void;
};

export default function Report({ report, camera, selected, goalWeights, topResults = [], onEditPreferences }: Props) {
  if (!report) return null;
  const { cameraName, goal, items } = report;

  // Helpers

  // Compute derived metrics
  const top3 = items.slice(0, 3);
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
      lowLight: toBar(Number((topResults.find(r => r.name === t.name) as any)?.low_light ?? 0)),
      video: toBar(Number((topResults.find(r => r.name === t.name) as any)?.video_excellence ?? 0)),
      portability: toPortabilityBar(t.weight_g || 0),
      value: toBar(maxValueIndex ? (valueIndex / maxValueIndex) * 10 : 0)
    }];
  }));

  return (
    <section className={`${CARD_PADDED} prose-content`}>
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
                paper_bgcolor: 'transparent', plot_bgcolor: 'transparent',
                margin: { l: 60, r: 20, t: 10, b: 50 },
                font: { color: 'var(--plot-font)' },
                xaxis: { title: 'Price (CHF)', gridcolor: 'var(--plot-grid)' },
                yaxis: { title: 'Score', gridcolor: 'var(--plot-grid)' }
              } as any}
              style={{ width: '100%', height: 260 }}
              config={{ displayModeBar: false }}
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
    </section>
  );
}


