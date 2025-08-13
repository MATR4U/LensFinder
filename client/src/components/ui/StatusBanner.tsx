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
};

export default function StatusBanner({ variant, title, message, onRetry, details, pausedControls, copyText }: Props) {
  const clsVariant = variant === 'warning' ? CARD_WARNING : (variant === 'error' ? CARD_ERROR : '');
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
                    onClick={async () => { try { await navigator.clipboard.writeText(copyText); } catch {} }}
                    title="Copy diagnostics"
                  >Copy diagnostics</button>
                )}
                <div className={SPINNER_SM} aria-hidden="true" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


