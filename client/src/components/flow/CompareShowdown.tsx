import React from 'react';
import LazyPlot from '../ui/LazyPlot';
import type { Result, Camera } from '../../types';
import { useSelectedResults } from '../../hooks/useSelectedResults';
import { useFilterStore } from '../../stores/filterStore';
import CollapsibleMessage from '../ui/CollapsibleMessage';
import Info from '../ui/Info';
import Button from '../ui/Button';
import { CARD_BASE, CARD_NEUTRAL, TEXT_SM, TEXT_MUTED } from '../ui/styles';
import Table from '../Table';
import { useStageLifecycle } from '../../hooks/useStageLifecycle';

type Props = {
  camera?: Camera | null;
  selected: Result[];
};

export default function CompareShowdown({ camera, selected }: Props) {
  const { onEnter } = useStageLifecycle(3, { resetOnEntry: false });
  React.useEffect(() => { onEnter(); }, [onEnter]);
  const compareList = useFilterStore(s => s.compareList);
  const toggleCompare = useFilterStore(s => s.toggleCompare);
  const setSelected = useFilterStore(s => s.setSelected);
  const rows = useSelectedResults(selected);
  const table = (
    <Table data={rows as any} columnsMode="compare-minimal" onSelect={(r) => setSelected(r)} />
  );

  const pts = rows.map(r => ({ name: r.name, x: r.price_chf, y: r.score_total, label: r.name }));
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-[var(--text-color)]">Compare</h2>
      <CollapsibleMessage variant="info" title="How to read these results" defaultOpen={false}>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li><strong>Score</strong>: Overall performance matched to your priorities. Higher is better.</li>
          <li><strong>Price</strong>: In CHF. Consider value, not just cost—use the chart for price-to-performance.</li>
          <li><strong>Weight</strong>: In grams. Lower weight improves portability; trade off against Score.</li>
          <li><strong>Aperture</strong>: Lower f/ means more light and shallower depth of field.</li>
          <li><strong>Eq. Focal</strong>: 35mm-equivalent field of view. Match this to your intended framing.</li>
          <li><strong>Decision tip</strong>: Shortlist lenses with the highest <em>Score</em> you can afford. On the chart, look for points toward the top-left (better performance for less money), then break ties using <em>Weight</em> and <em>Aperture</em>.</li>
        </ul>
      </CollapsibleMessage>
      <div className={`${CARD_BASE} ${CARD_NEUTRAL} p-3`}>{table}</div>
      <div className={`${CARD_BASE} ${CARD_NEUTRAL} p-3`}>
        <div className={`flex items-center gap-2 ${TEXT_SM} font-semibold text-[var(--text-color)] mb-2`}>
          <span>Performance vs. Price</span>
          <Info text="Each dot is a lens: X = Price (CHF), Y = Score. Prefer lenses nearer the top-left for the best price-to-performance." />
        </div>
        <LazyPlot
          data={[{
            x: pts.map(p => p.x),
            y: pts.map(p => p.y),
            text: pts.map(p => p.label),
            mode: 'markers',
            type: 'scatter',
            marker: { size: 10, color: 'var(--plot-marker)' },
            hovertemplate: '%{text}<br>Price CHF %{x}<br>Score %{y:.0f}<extra></extra>'
          }] as any}
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
      </div>
    </div>
  );
}


