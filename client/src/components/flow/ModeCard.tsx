import React from 'react';
import { CARD_PADDED, GRID_TWO_GAP3 } from '../ui/styles';
import { useFilterStore } from '../../stores/filterStore';
import SelectableCard from '../ui/SelectableCard';

export default function ModeCard() {
  const isPro = useFilterStore(s => s.isPro);
  const setIsPro = useFilterStore(s => s.setIsPro);
  return (
    <div className={CARD_PADDED}>
      {/* Title handled by parent Section; avoid duplicate headings */}

      <p className="text-sm text-[var(--text-muted)] mb-2">Pick a mode to continue.</p>
      <div className={GRID_TWO_GAP3}>
        <SelectableCard
          title="Beginner"
          subtitle="Guided"
          description="Simpler filters with smart defaults. Great starting point to get quick recommendations."
          bullets={['Mid‑focal assumption for scoring', 'Preset-driven priorities', 'Fast path to top picks']}
          selected={!isPro}
          onSelect={() => setIsPro(false)}
          ariaLabel="Beginner"
        />
        <SelectableCard
          title="Pro"
          subtitle="Advanced"
          description="Full control and strict filters. Fine‑tune focal range, aperture, stabilization, and more."
          bullets={['Uses chosen focal for scoring', 'Hard spec constraints', 'Video-focused controls (distortion, breathing)']}
          selected={isPro}
          onSelect={() => setIsPro(true)}
          ariaLabel="Pro"
        />
      </div>
    </div>
  );
}



