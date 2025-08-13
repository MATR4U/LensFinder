import React from 'react';
import { CARD_BASE, CARD_WARNING, CARD_ERROR, TEXT_SM, TEXT_MUTED, ACTION_ROW, STICKY_TOP, GLASS_CARD_SM, BADGE_ICON, SPINNER_SM } from './styles';

type Variant = 'warning' | 'error' | 'info';

type Props = {
  variant: Variant;
  title: string;
  message?: string;
  onRetry?: () => void;
  details?: string;
  pausedControls?: { isPaused: boolean; onPause: () => void; onResume: () => void };
  copyText?: string;
  etaStartSeconds?: number;
};

export default function StatusBanner({ variant, title, message, onRetry, details, pausedControls, copyText, etaStartSeconds }: Props) {
  const clsVariant = variant === 'warning' ? CARD_WARNING : (variant === 'error' ? CARD_ERROR : '');
  const [eta, setEta] = React.useState<number | undefined>(etaStartSeconds);
  React.useEffect(() => {
    setEta(etaStartSeconds);
  }, [etaStartSeconds]);
  React.useEffect(() => {
    if (!eta || eta <= 0) return;
    const t = setInterval(() => setEta((e) => (typeof e === 'number' ? Math.max(0, e - 1) : e)), 1000);
    return () => clearInterval(t);
  }, [eta]);
  const etaPct = typeof eta === 'number' && etaStartSeconds && etaStartSeconds > 0 ? Math.max(0, Math.min(100, Math.round(((etaStartSeconds - eta) / etaStartSeconds) * 100))) : undefined;
  return (
    <div className={STICKY_TOP}>
      <div className={`${CARD_BASE} ${clsVariant} ${GLASS_CARD_SM}`}>
        <div className="p-3 flex items-start gap-3">
          <div className={BADGE_ICON}>
            {variant === 'warning' ? '⚠️' : variant === 'error' ? '⛔' : 'ℹ️'}
          </div>
          <div className="flex-1">
            <div className="font-medium">{title}</div>
            {message && <div className={`${TEXT_SM} ${TEXT_MUTED} mt-0.5`}>{message}</div>}
            {details && (
              <pre className={`${TEXT_SM} ${TEXT_MUTED} mt-2 whitespace-pre-wrap`}>{details}</pre>
            )}
            {(onRetry || pausedControls || copyText) && (
              <div className={`${ACTION_ROW} mt-2`}>
                {onRetry && <button className="text-xs px-2 py-1 rounded bg-[var(--control-bg)] border border-[var(--control-border)]" onClick={onRetry}>Retry</button>}
                {pausedControls && !pausedControls.isPaused && <button className="text-xs px-2 py-1 rounded bg-[var(--control-bg)] border border-[var(--control-border)]" onClick={pausedControls.onPause}>Pause</button>}
                {pausedControls && pausedControls.isPaused && <button className="text-xs px-2 py-1 rounded bg-[var(--control-bg)] border border-[var(--control-border)]" onClick={pausedControls.onResume}>Resume</button>}
                {copyText && (
                  <button
                    className="text-xs px-2 py-1 rounded bg-[var(--control-bg)] border border-[var(--control-border)]"
                    onClick={async () => { try { await navigator.clipboard.writeText(copyText); } catch { } }}
                    title="Copy diagnostics"
                  >Copy diagnostics</button>
                )}
                <div className={SPINNER_SM} aria-hidden="true" />
              </div>
            )}
            {typeof etaPct === 'number' && (
              <div className="mt-2" onClick={onRetry} title="Retry now">
                <div className="h-1 w-full bg-[var(--control-border)]/60 rounded-full overflow-hidden">
                  <div className="h-1 bg-[var(--accent)]" style={{ width: `${etaPct}%` }} />
                </div>
                <div className={`${TEXT_SM} ${TEXT_MUTED} mt-1`}>Retrying in {eta}s</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


