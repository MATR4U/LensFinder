import React from 'react';
import Card from './ui/Card';
import { TEXT_XS_MUTED, TEXT_SM, STACK_Y } from './ui/styles';
import PerCameraTable from './PerCameraTable';

type DebugCounts = Record<string, number>;

type Distros = {
  base: { byBrand: Record<string, number>; byType: Record<string, number> };
  final: { byBrand: Record<string, number>; byType: Record<string, number> };
};

type Props = {
  counts: DebugCounts;
  cameraMount?: string;
  cameras?: { name: string }[];
  brand: string;
  lensType: string;
  sealed: boolean;
  isMacro: boolean;
  priceRange: { min: number; max: number };
  weightRange: { min: number; max: number };
  proCoverage: string;
  proFocalMin: number;
  proFocalMax: number;
  proMaxApertureF: number;
  proRequireOIS: boolean;
  proRequireSealed: boolean;
  proRequireMacro: boolean;
  proPriceMax: number;
  proWeightMax: number;
  proDistortionMaxPct: number;
  proBreathingMinScore: number;
  softDistortion?: boolean;
  softBreathing?: boolean;
  distributions?: Distros;
  perCameraCounts?: Record<string, number>;
};

function StepTable({ steps, counts, base }: { steps: Array<{ key: keyof DebugCounts; label: string; detail: string }>; counts: DebugCounts; base: number }) {
  let previous = base;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="text-[var(--text-muted)]">
            <th className="py-1 pr-3 font-medium">Step</th>
            <th className="py-1 pr-3 font-medium">Criteria</th>
            <th className="py-1 pr-3 font-medium">Count</th>
            <th className="py-1 pr-3 font-medium">Δ</th>
          </tr>
        </thead>
        <tbody>
          {steps.map((s) => {
            const value = counts[s.key] ?? previous;
            const delta = value - previous;
            const row = (
              <tr key={String(s.key)} className="border-t border-[var(--divider)]/60">
                <td className="py-1 pr-3 whitespace-nowrap">{s.label}</td>
                <td className="py-1 pr-3 text-[var(--text-muted)]">{s.detail}</td>
                <td className="py-1 pr-3">{value}</td>
                <td className={`py-1 pr-3 ${delta === 0 ? 'text-[var(--text-muted)]' : delta < 0 ? 'text-[var(--error-text)]' : 'text-[var(--success-text)]'}`}>{delta >= 0 ? `+${delta}` : `${delta}`}</td>
              </tr>
            );
            previous = value;
            return row;
          })}
        </tbody>
      </table>
    </div>
  );
}

function DistributionTable({ title, rows }: { title: string; rows: Array<{ key: string; base: number; final: number }> }) {
  return (
    <div>
      <div className="text-sm font-medium mb-1">{title}</div>
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="text-[var(--text-muted)]">
            <th className="py-1 pr-3 font-medium">Key</th>
            <th className="py-1 pr-3 font-medium">Base</th>
            <th className="py-1 pr-3 font-medium">Final</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-t border-[var(--divider)]/60">
              <td className="py-1 pr-3">{r.key}</td>
              <td className="py-1 pr-3">{r.base}</td>
              <td className="py-1 pr-3">{r.final}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DebugFilterPanel(props: Props) {
  const {
    counts,
    cameraMount,
    brand,
    lensType,
    sealed,
    isMacro,
    priceRange,
    weightRange,
    proCoverage,
    proFocalMin,
    proFocalMax,
    proMaxApertureF,
    proRequireOIS,
    proRequireSealed,
    proRequireMacro,
    proPriceMax,
    proWeightMax,
    proDistortionMaxPct,
    proBreathingMinScore,
    softDistortion,
    softBreathing,
    distributions,
    perCameraCounts
  } = props;

  const steps: Array<{ key: keyof DebugCounts; label: string; detail: string }> = [
    { key: 'mount', label: 'Mount', detail: cameraMount || 'Any' },
    { key: 'brand', label: 'Brand', detail: brand },
    { key: 'type', label: 'Type', detail: lensType },
    { key: 'sealed', label: 'Weather sealed', detail: sealed ? 'On' : 'Off' },
    { key: 'macro', label: 'Macro', detail: isMacro ? 'On' : 'Off' },
    { key: 'priceRange', label: 'Price range', detail: `CHF ${priceRange.min}–${priceRange.max}` },
    { key: 'weightRange', label: 'Weight range', detail: `${weightRange.min}–${weightRange.max} g` },
    { key: 'coverage', label: 'Coverage', detail: proCoverage },
    { key: 'focal', label: 'Focal range', detail: proFocalMin === 0 && proFocalMax >= 9999 ? 'Any' : `${proFocalMin}–${proFocalMax} mm` },
    { key: 'aperture', label: 'Max aperture', detail: `≤ f/${proMaxApertureF}` },
    { key: 'ois', label: 'OIS required', detail: proRequireOIS ? 'Required' : 'Any' },
    { key: 'proSealed', label: 'Hard sealed', detail: proRequireSealed ? 'Required' : 'Any' },
    { key: 'proMacro', label: 'Hard macro', detail: proRequireMacro ? 'Required' : 'Any' },
    { key: 'proPriceMax', label: 'Price max', detail: `≤ CHF ${proPriceMax}` },
    { key: 'proWeightMax', label: 'Weight max', detail: `≤ ${proWeightMax} g` },
    { key: 'distortion', label: `Distortion ${softDistortion ? '(soft)' : '(hard)'}`, detail: `≤ ${proDistortionMaxPct}%` },
    { key: 'breathing', label: `Breathing ${softBreathing ? '(soft)' : '(hard)'}`, detail: `≥ ${proBreathingMinScore}` }
  ];

  return (
    <Card title="Filter debug" subtitle="Counts after each step">
      <div className={STACK_Y}>
        <div className={TEXT_XS_MUTED}>Base: {counts.mount ?? 0} lenses (mount {cameraMount || 'Any'})</div>
        <StepTable steps={steps} counts={counts} base={counts.mount ?? 0} />
        {distributions && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DistributionTable
              title="Brand distribution"
              rows={Array.from(new Set([...Object.keys(distributions.base.byBrand), ...Object.keys(distributions.final.byBrand)])).sort().map((b) => ({ key: b, base: distributions.base.byBrand[b] || 0, final: distributions.final.byBrand[b] || 0 }))}
            />
            <DistributionTable
              title="Type distribution"
              rows={Array.from(new Set([...Object.keys(distributions.base.byType), ...Object.keys(distributions.final.byType)])).sort().map((t) => ({ key: t, base: distributions.base.byType[t] || 0, final: distributions.final.byType[t] || 0 }))}
            />
          </div>
        )}
        {perCameraCounts && (
          <div>
            <div className="text-sm font-medium mb-1">Per-camera results (current filters)</div>
            <PerCameraTable counts={perCameraCounts} />
          </div>
        )}
        <div className={TEXT_SM}>
          <span className={TEXT_XS_MUTED}>Hint:</span> Steps with the largest negative Δ are most constraining.
        </div>
      </div>
    </Card>
  );
}


