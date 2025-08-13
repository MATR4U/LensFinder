import React from 'react';
import { CARD_BASE, CARD_NEUTRAL } from '../ui/styles';

type Props = {
  goalWeights?: Record<string, number>;
};

export default function RankingWeights({ goalWeights }: Props) {
  if (!goalWeights) return null;
  const sum = Object.values(goalWeights).reduce((a, b) => a + b, 0) || 1;
  const entries = Object.entries(goalWeights)
    .map(([k, v]) => [k, (v / sum) * 100] as [string, number])
    .sort((a, b) => b[1] - a[1]);
  return (
    <div className={`${CARD_BASE} ${CARD_NEUTRAL} mt-5 p-3`}>
      <h4 className="text-sm font-semibold text-[var(--text-color)] mb-2">How we ranked (weights)</h4>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
        {entries.map(([k, v]) => (
          <React.Fragment key={k}>
            <div className="capitalize">{k.replace(/_/g, ' ')}</div>
            <div className="text-right">{v.toFixed(0)}%</div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}


