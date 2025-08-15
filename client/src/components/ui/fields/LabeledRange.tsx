import React from 'react';
import { type FieldStatus } from './FieldContainer';
import { atBoundsStatus } from './status';
import BaseLabeledSlider from './BaseLabeledSlider';
import type { FilterMode } from '../FilterModeSwitch';
import { useFilterStore } from '../../../stores/filterStore';
import { useFilterMode } from '../../../hooks/useFilterMode';
import { shallow } from 'zustand/shallow';
import { getCachedSnapshot } from '../../../lib/data';
import { applyFilters } from '../../../lib/filters';

type Range = { min: number; max: number };

type Props = {
  label: string;
  infoText?: string;
  min: number;
  max: number;
  step?: number;
  value: Range;
  onChange: (r: Range) => void;
  ticks?: number[];
  snap?: boolean;
  format?: (v: number) => string;
  tickFormatter?: (v: number) => string;
  parse?: (s: string) => number;
  trackStyle?: React.CSSProperties;
  right?: React.ReactNode;
  hint?: string;
  status?: FieldStatus;
  // optional override id for label; otherwise auto-generated
  id?: string;
  warningTip?: string;
  softPreference?: { checked: boolean; onChange: (v: boolean) => void; id?: string; label?: string };
  mode?: { value: FilterMode; onChange: (m: FilterMode) => void };
  idPrefix?: string;
  disabled?: boolean;
  histogramValues?: number[];
  histogramTotalValues?: number[];
  metric?: 'price' | 'weight' | 'distortion' | 'breathing' | 'focal';
  histogramShowMaxLabel?: boolean;
};

export default function LabeledRange({ label, infoText, min, max, step, value, onChange, ticks, snap, format, tickFormatter, parse, trackStyle, right, hint, status, id, warningTip, softPreference, mode, idPrefix, disabled, histogramValues, histogramTotalValues, metric, histogramShowMaxLabel }: Props) {
  const fieldStatus = atBoundsStatus({ value, min, max, currentStatus: status });
  // Auto-compute histogram data from store + cached lenses if not provided
  const storeSlice = useFilterStore((s) => ({
    cameraName: s.cameraName,
    brand: s.brand,
    lensType: s.lensType,
    sealed: s.sealed,
    isMacro: s.isMacro,
    priceRange: s.priceRange,
    weightRange: s.weightRange,
    proCoverage: s.proCoverage,
    proFocalMin: s.proFocalMin,
    proFocalMax: s.proFocalMax,
    proMaxApertureF: s.proMaxApertureF,
    proRequireOIS: s.proRequireOIS,
    proRequireSealed: s.proRequireSealed,
    proRequireMacro: s.proRequireMacro,
    proPriceMax: s.proPriceMax,
    proWeightMax: s.proWeightMax,
    proDistortionMaxPct: s.proDistortionMaxPct,
    proBreathingMinScore: s.proBreathingMinScore,
    softPrice: s.softPrice,
    softWeight: s.softWeight,
    softDistortion: s.softDistortion,
    softBreathing: s.softBreathing,
    enablePrice: s.enablePrice,
    enableWeight: s.enableWeight,
    enableDistortion: s.enableDistortion,
    enableBreathing: s.enableBreathing,
  }), shallow);

  const autoHist = React.useMemo((): { values: number[]; total: number[] } | null => {
    if (!metric) return null;
    if (Array.isArray(histogramValues) || Array.isArray(histogramTotalValues)) return null;
    const snap = getCachedSnapshot();
    const all = Array.isArray(snap.lenses) ? snap.lenses : [];
    if (all.length === 0) return null;
    const s = storeSlice;
    const filtered = applyFilters({
      lenses: all,
      cameraName: s.cameraName,
      cameraMount: undefined,
      brand: s.brand,
      lensType: s.lensType,
      sealed: s.sealed,
      isMacro: s.isMacro,
      priceRange: s.priceRange,
      weightRange: s.weightRange,
      proCoverage: s.proCoverage,
      proFocalMin: s.proFocalMin,
      proFocalMax: s.proFocalMax,
      proMaxApertureF: s.proMaxApertureF,
      proRequireOIS: s.proRequireOIS,
      proRequireSealed: s.proRequireSealed,
      proRequireMacro: s.proRequireMacro,
      proPriceMax: s.proPriceMax,
      proWeightMax: s.proWeightMax,
      proDistortionMaxPct: s.proDistortionMaxPct,
      proBreathingMinScore: s.proBreathingMinScore,
      softPrice: s.softPrice,
      softWeight: s.softWeight,
      softDistortion: s.softDistortion,
      softBreathing: s.softBreathing,
      enablePrice: s.enablePrice,
      enableWeight: s.enableWeight,
      enableDistortion: s.enableDistortion,
      enableBreathing: s.enableBreathing,
    });
    const pick = (obj: any): number | null => {
      switch (metric) {
        case 'price': return Number(obj?.price_chf ?? 0);
        case 'weight': return Number(obj?.weight_g ?? 0);
        case 'distortion': return Number(obj?.distortion_pct ?? 0);
        case 'breathing': return Number(obj?.focus_breathing_score ?? 0);
        case 'focal': {
          const a = Number(obj?.focal_min_mm);
          const b = Number(obj?.focal_max_mm);
          if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
          return (a + b) / 2;
        }
        default: return null;
      }
    };
    const total = all.map(pick).filter((n): n is number => Number.isFinite(n));
    const values = filtered.map(pick).filter((n): n is number => Number.isFinite(n));
    return { values, total };
  }, [metric, histogramValues, histogramTotalValues, storeSlice]);
  const enableSoftSlice = useFilterStore((s) => ({
    enablePrice: s.enablePrice,
    enableWeight: s.enableWeight,
    enableDistortion: s.enableDistortion,
    enableBreathing: s.enableBreathing,
    softPrice: s.softPrice,
    softWeight: s.softWeight,
    softDistortion: s.softDistortion,
    softBreathing: s.softBreathing,
  }), shallow);

  const auto = React.useMemo(() => {
    if (!metric || mode || typeof disabled === 'boolean') return null;
    const m = useFilterMode(metric as any);
    return m ? { mode: { value: m.value, onChange: m.onChange }, disabled: m.disabled } : null;
  }, [metric, mode, disabled]);
  return (
    <BaseLabeledSlider
      label={label}
      infoText={infoText}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      ticks={ticks}
      snap={snap}
      format={format}
      tickFormatter={tickFormatter}
      parse={parse}
      trackStyle={trackStyle}
      right={right}
      hint={hint}
      status={fieldStatus}
      id={id}
      warningTip={warningTip}
      softPreference={softPreference}
      mode={mode ?? auto?.mode}
      idPrefix={idPrefix}
      disabled={typeof disabled === 'boolean' ? disabled : (auto?.disabled ?? false)}
      histogramValues={histogramValues ?? autoHist?.values}
      histogramTotalValues={histogramTotalValues ?? autoHist?.total}
      histogramShowMaxLabel={typeof histogramShowMaxLabel === 'boolean' ? histogramShowMaxLabel : (metric === 'price' || metric === 'weight')}
    />
  );
}


