import React from 'react';
import { GLASS_PANEL, AURA_ACCENT, SPINNER_SM } from './styles';

type Props = {
  title?: string;
  message?: string;
  details?: string;
};

export default function OutageScreen({ title = 'Service temporarily unavailable', message = "We're reconnecting…", details }: Props) {
  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center pointer-events-auto" aria-modal="true" role="dialog">
      {/* Backdrop: use subtle on-brand tint over existing app background (keeps theme) */}
      <div className="absolute inset-0 bg-[color-mix(in_oklab,var(--bg-from),black_20%)]/60 backdrop-blur-sm pointer-events-auto" />
      <div className="relative max-w-xl w-[min(92vw,40rem)] pointer-events-auto">
        <div className={AURA_ACCENT} />
        <div className={`${GLASS_PANEL} p-8 text-center select-none`}>
          <div className="mx-auto h-12 w-12 rounded-xl grid place-items-center bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)] text-2xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-[var(--text-color)] mb-1">{title}</h2>
          <p className="text-sm text-[var(--text-muted)] mb-4">{message}</p>
          {details && <pre className="text-xs text-[var(--text-muted)] whitespace-pre-wrap mb-4">{details}</pre>}
          <div className={`mx-auto mt-2 ${SPINNER_SM}`} aria-label="loading" />
        </div>
      </div>
    </div>
  );
}


