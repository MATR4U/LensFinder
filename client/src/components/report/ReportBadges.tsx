import React from 'react';

export default function ReportBadges({
  topPerformer,
  bestValue,
  lightest,
}: {
  topPerformer?: { name: string } | null;
  bestValue?: { name: string } | null;
  lightest?: { name: string } | null;
}) {
  if (!topPerformer && !bestValue && !lightest) return null;
  return (
    <div className="mb-3 flex flex-wrap gap-2 text-xs">
      {topPerformer && (
        <span className="px-2 py-0.5 rounded bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30">Top performer: {topPerformer.name}</span>
      )}
      {bestValue && (
        <span className="px-2 py-0.5 rounded bg-[var(--badge-success-bg)] text-[var(--badge-success-text)] border border-[var(--badge-success-border)]">Best value: {bestValue.name}</span>
      )}
      {lightest && (
        <span className="px-2 py-0.5 rounded bg-[var(--badge-warning-bg)] text-[var(--badge-warning-text)] border border-[var(--badge-warning-border)]">Best portability: {lightest.name}</span>
      )}
    </div>
  );
}


