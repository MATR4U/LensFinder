import React from 'react';
import { type FieldStatus } from './FieldContainer';
import BaseLabeledSlider from './BaseLabeledSlider';
import type { FilterMode } from '../FilterModeSwitch';
import { useFilterStore } from '../../../stores/filterStore';
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
  metric?: 'price' | 'weight' | 'distortion' | 'breathing';
};

export default function LabeledRange({ label, infoText, min, max, step, value, onChange, ticks, snap, format, trackStyle, right, hint, status, id, warningTip, softPreference, mode, idPrefix, disabled, histogramValues, histogramTotalValues, metric }: Props) {
  const atAnyEdge = value.min <= min || value.max >= max;
  const fieldStatus = atAnyEdge ? (status ?? 'warning') : status;
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

  const auto = React.useMemo((): null | { mode: { value: FilterMode; onChange: (m: FilterMode) => void }; disabled: boolean } => {
    if (!metric || mode || typeof disabled === 'boolean') return null;
    if (metric === 'price') {
      const enable = enableSoftSlice.enablePrice;
      const soft = enableSoftSlice.softPrice;
      return {
        mode: {
          value: (enable ? (soft ? 'preferred' : 'required') : 'off') as FilterMode,
          onChange: (m: FilterMode) => {
            const { setEnablePrice, setSoftPrice } = useFilterStore.getState();
            if (m === 'off') setEnablePrice(false); else { setEnablePrice(true); setSoftPrice(m === 'preferred'); }
          },
        },
        disabled: !enable,
      };
    }
    if (metric === 'weight') {
      const enable = enableSoftSlice.enableWeight;
      const soft = enableSoftSlice.softWeight;
      return {
        mode: {
          value: (enable ? (soft ? 'preferred' : 'required') : 'off') as FilterMode,
          onChange: (m: FilterMode) => {
            const { setEnableWeight, setSoftWeight } = useFilterStore.getState();
            if (m === 'off') setEnableWeight(false); else { setEnableWeight(true); setSoftWeight(m === 'preferred'); }
          },
        },
        disabled: !enable,
      };
    }
    if (metric === 'distortion') {
      const enable = enableSoftSlice.enableDistortion;
      const soft = enableSoftSlice.softDistortion;
      return {
        mode: {
          value: (enable ? (soft ? 'preferred' : 'required') : 'off') as FilterMode,
          onChange: (m: FilterMode) => {
            const { setEnableDistortion, setSoftDistortion } = useFilterStore.getState();
            if (m === 'off') setEnableDistortion(false); else { setEnableDistortion(true); setSoftDistortion(m === 'preferred'); }
          },
        },
        disabled: !enable,
      };
    }
    if (metric === 'breathing') {
      const enable = enableSoftSlice.enableBreathing;
      const soft = enableSoftSlice.softBreathing;
      return {
        mode: {
          value: (enable ? (soft ? 'preferred' : 'required') : 'off') as FilterMode,
          onChange: (m: FilterMode) => {
            const { setEnableBreathing, setSoftBreathing } = useFilterStore.getState();
            if (m === 'off') setEnableBreathing(false); else { setEnableBreathing(true); setSoftBreathing(m === 'preferred'); }
          },
        },
        disabled: !enable,
      };
    }
    return null;
  }, [metric, mode, disabled, enableSoftSlice]);
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
    />
  );
}


