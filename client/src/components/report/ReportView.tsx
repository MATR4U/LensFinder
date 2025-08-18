import React from 'react';
import { TEXT_XS_MUTED, GRID_LG_TWO_GAP6 } from '../ui/styles';
import BaseReport from './BaseReport';
import { useReportLifecycle } from './useReportLifecycle';
import { buildResultsCSV } from '../../lib/csv';
import type { ReportResponse } from '../../lib/api';
import type { Camera, Result } from '../../types';
import { useSelectedResults } from '../../hooks/useSelectedResults';
//
import SummaryHeader from './SummaryHeader';
import Recommendations from './Recommendations';
import RankingWeights from './RankingWeights';
import ReportHowTo from './ReportHowTo';
import PerformancePlot from './PerformancePlot';
import ReportBadges from './ReportBadges';
import FinalVerdict from './FinalVerdict';
import { useStageLifecycle } from '../../hooks/useStageLifecycle';

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

export default function ReportView({ report, camera, selected: _selected, goalWeights, topResults = [], onEditPreferences }: Props) {
  if (!report) return null;
  const { cameraName, goal, items } = report;

  useReportLifecycle('Personalized lens report', report);
  const { onEnter } = useStageLifecycle(4, { resetOnEntry: false });
  React.useEffect(() => { onEnter(); }, [onEnter]);

  const selectedNow = useSelectedResults(topResults as any);
  const selectedDisplay = fromResults(selectedNow as unknown as Result[]);
  const itemsDisplay = fromReportItems(items);
  const top3 = (selectedDisplay.length > 0 ? selectedDisplay : itemsDisplay).slice(0, 3);
  const valueScores = top3.map(i => ({ i, v: i.price_chf > 0 ? i.score / i.price_chf : 0 }));
  const bestValue = valueScores.slice().sort((a, b) => b.v - a.v)[0]?.i;
  const topPerformer = top3.slice().sort((a, b) => b.score - a.score)[0];
  const lightest = top3.slice().sort((a, b) => a.weight_g - b.weight_g)[0];

  const maxWeight = Math.max(...top3.map(i => i.weight_g || 1), 1);
  const minWeight = Math.min(...top3.map(i => i.weight_g || 1));
  const maxValueIndex = Math.max(...valueScores.map(v => v.v), 1);
  const toBar = (v: number, _max = 10) => Math.max(0, Math.min(10, v));
  const toPortabilityBar = (w: number) => {
    if (maxWeight === minWeight) return 5;
    const norm = (maxWeight - w) / (maxWeight - minWeight);
    return toBar(norm * 10);
  };

  const bars = Object.fromEntries(top3.map(t => {
    const valueIndex = t.price_chf > 0 ? (t.score / t.price_chf) : 0;
    return [t.name, {
      lowLight: toBar(Number((itemsDisplay.find(r => r.name === t.name) as any)?.low_light ?? 0)),
      video: toBar(Number((itemsDisplay.find(r => r.name === t.name) as any)?.video_excellence ?? 0)),
      portability: toPortabilityBar(t.weight_g || 0),
      value: toBar(maxValueIndex ? (valueIndex / maxValueIndex) * 10 : 0)
    }];
  }));

  const whyByName = new Map<string, { key: string; label: string; weight: number }[]>();
  (topResults || []).forEach(r => {
    const why = (r as any).why_recommended as ({ key: string; label: string; weight: number }[] | undefined);
    if (why && why.length) whyByName.set(r.name, why);
  });

  const top3ForCards = top3.map(t => ({
    ...t,
    why_recommended: whyByName.get(t.name),
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
      <SummaryHeader cameraName={cameraName} goal={goal} onEditPreferences={onEditPreferences} />

      <ReportHowTo />

      {top3.length > 0 && (<ReportBadges topPerformer={topPerformer} bestValue={bestValue as any} lightest={lightest} />)}

      <Recommendations
        camera={camera}
        items={top3ForCards.map(t => ({
          name: t.name,
          score: t.score,
          price_chf: t.price_chf,
          weight_g: t.weight_g,
          rank: t.rank,
          type: t.type,
          why_recommended: t.why_recommended
        }))}
        bars={bars}
      />

      <RankingWeights goalWeights={goalWeights} />

      {items.length > 0 && (
        <div className={`mt-6 ${GRID_LG_TWO_GAP6}`}>
          <div className="lg:col-span-2">
            <PerformancePlot data={top3} />
          </div>
        </div>
      )}
      {top3.length > 0 && (<FinalVerdict topPerformer={topPerformer} bestValue={bestValue} lightest={lightest} />)}
      <p className={`${TEXT_XS_MUTED} mt-4`}>Tip: Click any lens to view prices. The bars reflect key factors; adjust weights to see how recommendations change.</p>
    </BaseReport>
  );
}


