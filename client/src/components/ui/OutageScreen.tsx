import React from 'react';
import { GLASS_PANEL, AURA_ACCENT, SPINNER_SM, TEXT_MUTED, TEXT_SM, ACTION_ROW } from './styles';

type Props = {
  title?: string;
  message?: string;
  details?: string;
};

export default function OutageScreen({ title = 'Service temporarily unavailable', message = "We're reconnecting…", details }: Props) {
  const [eta, setEta] = React.useState<number>(0);
  React.useEffect(() => {
    // simple 10s loop for visual feedback; real ETA passed via banner not used here
    setEta(10);
    const t = setInterval(() => setEta((e) => (e > 0 ? e - 1 : 10)), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center pointer-events-auto" aria-modal="true" role="dialog" aria-live="polite">
      {/* Backdrop: use subtle on-brand tint over existing app background (keeps theme) */}
      <div className="absolute inset-0 bg-[color-mix(in_oklab,var(--bg-from),black_20%)]/60 backdrop-blur-sm pointer-events-auto" />
      <div className="relative max-w-xl w-[min(92vw,40rem)] pointer-events-auto">
        <div className={AURA_ACCENT} />
        <div className={`${GLASS_PANEL} p-8 text-center select-none`} role="document">
          <div className="mx-auto h-12 w-12 rounded-xl grid place-items-center bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)] text-2xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-[var(--text-color)] mb-1">{title}</h2>
          <p className="text-sm text-[var(--text-muted)] mb-4" aria-live="polite">{message}</p>
          {details && <pre className="text-xs text-[var(--text-muted)] whitespace-pre-wrap mb-4">{details}</pre>}
          <div className={`mx-auto mt-2 ${SPINNER_SM}`} aria-label="loading" />
          <div className="mt-4" aria-live="polite">
            <div className="h-1 w-full bg-[var(--control-border)]/60 rounded-full overflow-hidden">
              <div className="h-1 bg-[var(--accent)] transition-all" style={{ width: `${Math.max(0, (10 - eta) * 10)}%` }} />
            </div>
            <div className={`${TEXT_SM} ${TEXT_MUTED} mt-1`}>Retrying in {eta}s. Tap to retry now.</div>
            <div className={`${ACTION_ROW} mt-2 justify-center`}>
              <button className="text-xs px-3 py-1 rounded bg-[var(--control-bg)] border border-[var(--control-border)]" onClick={() => window.location.reload()}>Retry now</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


