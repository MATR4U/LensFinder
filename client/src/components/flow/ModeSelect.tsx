import React from 'react';
import { TITLE_H2, TEXT_XS_MUTED, CARD_PADDED, GRID_TWO_GAP3, ROW_BETWEEN, BADGE_SHAPE_XS, SECTION_TITLE } from '../ui/styles';
import { useFilterStore } from '../../stores/filterStore';
import Message from '../ui/Message';

type Props = {
  onContinue: () => void;
};

export default function ModeSelect({ onContinue }: Props) {
  const isPro = useFilterStore(s => s.isPro);
  const setIsPro = useFilterStore(s => s.setIsPro);
  return (
    <div className={CARD_PADDED}>
      <h2 className={TITLE_H2}>Choose your mode</h2>

      <Message variant="info" title="Which mode should I choose?">
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li><strong>Beginner</strong>: Quick setup with essential filters and smart defaults. Great when you want fast, sensible picks.</li>
          <li><strong>Pro</strong>: Full control over hard specs (coverage, focal, aperture, distortion, breathing). Ideal for strict requirements.</li>
          <li><strong>Tip</strong>: You can switch modes anytime—your selections persist.</li>
        </ul>
      </Message>

      <div className={GRID_TWO_GAP3}>
        <button
          aria-label="Beginner"
          onClick={() => setIsPro(false)}
          className={`text-left rounded-lg border p-4 transition-colors ${!isPro ? 'border-[color-mix(in_oklab,var(--accent),black_40%)] bg-[color-mix(in_oklab,var(--accent),transparent_90%)]' : 'border-[var(--control-border)] bg-[var(--control-bg)] hover:bg-[color-mix(in_oklab,var(--control-bg),white_6%)]'}`}
        >
          <div className={ROW_BETWEEN}>
            <div className="text-[var(--text-color)] font-medium">Beginner</div>
            {!isPro && <span className={`${BADGE_SHAPE_XS} bg-[var(--accent)] text-[var(--accent-contrast)]`}>Selected</span>}
          </div>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Simpler filters with smart defaults. Great starting point to get quick recommendations.</p>
          <ul className={`mt-2 ${TEXT_XS_MUTED} list-disc list-inside space-y-1`}>
            <li>Mid‑focal assumption for scoring</li>
            <li>Preset-driven priorities</li>
            <li>Fast path to top picks</li>
          </ul>
        </button>

        <button
          aria-label="Pro"
          onClick={() => setIsPro(true)}
          className={`text-left rounded-lg border p-4 transition-colors ${isPro ? 'border-[color-mix(in_oklab,var(--accent),black_40%)] bg-[color-mix(in_oklab,var(--accent),transparent_90%)]' : 'border-[var(--control-border)] bg-[var(--control-bg)] hover:bg-[color-mix(in_oklab,var(--control-bg),white_6%)]'}`}
        >
          <div className={ROW_BETWEEN}>
            <div className="text-[var(--text-color)] font-medium">Pro</div>
            {isPro && <span className={`${BADGE_SHAPE_XS} bg-[var(--accent)] text-[var(--accent-contrast)]`}>Selected</span>}
          </div>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Full control and strict filters. Fine‑tune focal range, aperture, stabilization, and more.</p>
          <ul className={`mt-2 ${TEXT_XS_MUTED} list-disc list-inside space-y-1`}>
            <li>Uses chosen focal for scoring</li>
            <li>Hard spec constraints</li>
            <li>Video-focused controls (distortion, breathing)</li>
          </ul>
        </button>
      </div>

      <div className={ROW_BETWEEN}>
        <div className={TEXT_XS_MUTED}>
          Mode: <span className="text-[var(--text-color)] font-medium">{isPro ? 'Pro' : 'Beginner'}</span>
        </div>
        <button
          className="px-4 py-2 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-contrast)] text-sm"
          onClick={onContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
}


