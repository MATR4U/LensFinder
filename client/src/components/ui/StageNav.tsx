import React from 'react';
import { useFlow } from '../../hooks/useFlow';
import { useStageBaseline } from '../../hooks/useStageBaseline';
import { ACTION_ROW, ROW_BETWEEN } from './styles';

type Props = {
  onBack?: () => void;
  onReset?: () => void;
  onContinue?: () => void;
  continueLabel?: string;
  className?: string;
  stageNumber?: number;
  onAfterReset?: () => void;
  useFlowState?: boolean;
};

export default function StageNav({ onBack, onReset, onContinue, continueLabel = 'Continue', className = '', stageNumber, onAfterReset, useFlowState = true }: Props) {
  const flow = useFlow();
  const label = useFlowState ? flow.continueLabel : continueLabel;
  const canFwd = useFlowState ? flow.canForward : true;
  const baseline = typeof stageNumber === 'number' ? useStageBaseline(stageNumber) : null;
  return (
    <div className={`${ROW_BETWEEN} ${className}`}>
      <div className={ACTION_ROW}>
        {onBack && (
          <button className="px-3 py-1.5 rounded border border-[var(--control-border)] text-sm" onClick={onBack}>
            Back
          </button>
        )}
        {onReset && (
          <button className="px-3 py-1.5 rounded border border-[var(--control-border)] text-sm" onClick={() => { if (baseline?.hasBaseline) baseline.reset(); else onReset?.(); onAfterReset?.(); }}>
            Reset
          </button>
        )}
      </div>
      {onContinue && (
        <button
          className="px-3 py-1.5 rounded bg-[var(--accent)] text-[var(--accent-contrast)] text-sm hover:bg-[var(--accent-hover)] disabled:opacity-50"
          onClick={onContinue}
          disabled={!canFwd}
        >
          {label}
        </button>
      )}
    </div>
  );
}



