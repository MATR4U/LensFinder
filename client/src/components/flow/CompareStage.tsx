import React from 'react';
import { STACK_Y } from '../ui/styles';
import ExploreGrid from './ExploreGrid';
import CompareShowdown from './CompareShowdown';
import StageNav from '../ui/StageNav';
import { COMPARE_STAGE_BINDINGS, useFilterBindings } from '../../hooks/useStoreBindings';
import { resultId } from '../../lib/ids';
import type { Camera, Result } from '../../types';

export default function CompareStage({ camera, resultsForGrid, results }: { camera: Camera | undefined; resultsForGrid: Result[]; results: Result[]; }) {
  const { compareList, continueTo } = useFilterBindings(COMPARE_STAGE_BINDINGS);
  return (
    <div className={STACK_Y}>
      <div className="mb-1 text-lg font-semibold text-[var(--text-color)]">Candidates to compare</div>
      <div className="text-sm text-[var(--text-muted)] mb-2">Add up to 3 to compare side‑by‑side.</div>
      <ExploreGrid items={resultsForGrid} />
      {compareList.length >= 2 && (
        <CompareShowdown
          camera={camera}
          selected={results.filter(r => compareList.includes(resultId(r)))}
        />
      )}
      <StageNav className="mt-2" onBack={() => continueTo(2)} onContinue={() => continueTo(4)} continueLabel="View Report" />
    </div>
  );
}


