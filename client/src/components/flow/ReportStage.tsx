import React from 'react';
import { STACK_Y } from '../ui/styles';
import CollapsibleMessage from '../ui/CollapsibleMessage';
import Card from '../ui/Card';
import ReportView from '../report/ReportView';
import StageNav from '../ui/StageNav';
import type { Camera, Result } from '../../types';
import { REPORT_STAGE_BINDINGS, useFilterBindings } from '../../hooks/useStoreBindings';

export default function ReportStage({ camera, goalWeights, results }: { camera: Camera | undefined; goalWeights: Record<string, number> | undefined; results: Result[]; }) {
  const { report, selected, continueTo } = useFilterBindings(REPORT_STAGE_BINDINGS);
  return (
    <div className={STACK_Y}>
      <div className="mb-1 text-lg font-semibold text-[var(--text-color)]">Summary & decision</div>
      <CollapsibleMessage variant="info" title="How to make the call" defaultOpen={false}>
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li><strong>Start</strong>: Note Top Performer, Best Value, and Best Portability badges.</li>
          <li><strong>Chart</strong>: Prefer lenses near the top‑left (more Score for less CHF). Stay within budget.</li>
          <li><strong>Break ties</strong>: Use Low Light, Video, Portability, and Value bars on each card.</li>
          <li><strong>Total kit</strong>: Check combined price and weight with your camera are acceptable.</li>
          <li><strong>Refine</strong>: Adjust weights/filters or revisit Compare to inspect candidates side‑by‑side.</li>
        </ul>
      </CollapsibleMessage>
      <Card title="Report" subtitle="Generated summary">
        <ReportView
          report={report}
          camera={camera}
          selected={selected}
          goalWeights={goalWeights}
          topResults={results.slice(0, 3)}
          onEditPreferences={() => { continueTo(2); }}
        />
      </Card>
      <StageNav className="mt-2" onBack={() => continueTo(3)} onContinue={() => continueTo(0)} continueLabel="Start Over" />
    </div>
  );
}


