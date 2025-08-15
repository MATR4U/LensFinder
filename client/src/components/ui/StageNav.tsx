import React from 'react';
import { ACTION_ROW, ROW_BETWEEN } from './styles';

type Props = {
  onBack?: () => void;
  onReset?: () => void;
  onContinue?: () => void;
  continueLabel?: string;
  className?: string;
  canForward?: boolean;
  stageNumber?: number;
};

export default function StageNav({ onBack, onReset, onContinue, continueLabel = 'Continue', className = '', canForward = true }: Props) {
  return (
    <div className={`${ROW_BETWEEN} ${className}`}>
      <div className={ACTION_ROW}>
        {onBack && (
          <button className="px-3 py-1.5 rounded border border-[var(--control-border)] text-sm" onClick={onBack}>
            Back
          </button>
        )}
        {onReset && (
          <button className="px-3 py-1.5 rounded border border-[var(--control-border)] text-sm" onClick={onReset}>
            Reset
          </button>
        )}
      </div>
      {onContinue && (
        <button
          className="px-3 py-1.5 rounded bg-[var(--accent)] text-[var(--accent-contrast)] text-sm hover:bg-[var(--accent-hover)] disabled:opacity-50"
          onClick={onContinue}
          disabled={!canForward}
        >
          {continueLabel}
        </button>
      )}
    </div>
  );
}



