import React from 'react';

export default function PerCameraTable({ counts }: { counts: Record<string, number> }) {
  const rows = Object.keys(counts).sort();
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="text-[var(--text-muted)]">
            <th className="py-1 pr-3 font-medium">Camera</th>
            <th className="py-1 pr-3 font-medium">Count</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((name) => (
            <tr key={name} className="border-t border-[var(--divider)]/60">
              <td className="py-1 pr-3">{name}</td>
              <td className="py-1 pr-3">{counts[name]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


