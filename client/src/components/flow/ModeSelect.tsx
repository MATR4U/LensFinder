import React from 'react';
import { CARD_PADDED, GRID_TWO_GAP3 } from '../ui/styles';
import { MODE_SELECT_BINDINGS, useFilterBindings } from '../../hooks/useStoreBindings';
import SelectableCard from '../ui/SelectableCard';
import StageNav from '../ui/StageNav';
import { useStageLifecycle } from '../../hooks/useStageLifecycle';

type Props = {
  onContinue: () => void;
};

export default function ModeSelect({ onContinue }: Props) {
  const { isPro, setIsPro, continueTo } = useFilterBindings(MODE_SELECT_BINDINGS);
  const { onEnter } = useStageLifecycle(0, { resetOnEntry: false });
  React.useEffect(() => { onEnter(); }, [onEnter]);
  return (
    <div className={`${CARD_PADDED} space-y-4`}>

      <p className="text-sm text-[var(--text-color)] opacity-90">Pick a mode to continue.</p>
      <div className={`${GRID_TWO_GAP3} items-stretch`}>
        <SelectableCard
          title="Beginner"
          subtitle="Guided"
          description="Simpler filters with smart defaults. Great starting point to get quick recommendations."
          bullets={['Mid‑focal assumption for scoring', 'Preset-driven priorities', 'Fast path to top picks']}
          selected={!isPro}
          onSelect={() => { setIsPro(false); }}
          ariaLabel="Beginner"
          testId="mode-beginner"
        />
        <SelectableCard
          title="Pro"
          subtitle="Advanced"
          description="Full control and strict filters. Fine‑tune focal range, aperture, stabilization, and more."
          bullets={['Uses chosen focal for scoring', 'Hard spec constraints', 'Video-focused controls (distortion, breathing)']}
          selected={isPro}
          onSelect={() => { setIsPro(true); }}
          ariaLabel="Pro"
          testId="mode-pro"
        />
      </div>
      <StageNav className="mt-2" onBack={() => continueTo(0)} onContinue={onContinue ?? (() => continueTo(1))} />
    </div>
  );
}


