import React from 'react';
import { STICKY_BOTTOM, TRAY } from '../ui/styles';
import { COMPARE_TRAY_BINDINGS, useFilterBindings } from '../../hooks/useStoreBindings';
import { useCompareGate } from '../../hooks/useCompareGate';

export default function CompareTray() {
  const { continueTo } = useFilterBindings(COMPARE_TRAY_BINDINGS);
  const { selectedCount, canCompare } = useCompareGate();
  return (
    <div className={`${STICKY_BOTTOM}`}>
      <div className={`${TRAY} flex items-center gap-3`}>
        <span className="text-xs text-[var(--text-muted)]">{selectedCount}/3 selected</span>
        <button className="px-3 py-1 rounded bg-[var(--accent)] text-[var(--accent-contrast)] text-xs hover:bg-[var(--accent-hover)] disabled:opacity-50" onClick={() => continueTo(3)} disabled={!canCompare}>Compare now</button>
        <button className="px-3 py-1 rounded border border-[var(--control-border)] text-[var(--text-color)] text-xs hover:bg-[color-mix(in_oklab,var(--control-bg),white_6%)] disabled:opacity-50" onClick={() => continueTo(4)} disabled={!canCompare}>View Report</button>
      </div>
    </div>
  );
}


