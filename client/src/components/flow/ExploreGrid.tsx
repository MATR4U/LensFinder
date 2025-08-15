import React from 'react';
import { TEXT_XS_MUTED, CARD_BASE, CARD_NEUTRAL, TEXT_MUTED, GRID_AUTOFILL, CARD_BODY, ROW_BETWEEN, TEXT_SM, ROW_END } from '../ui/styles';
import type { Result } from '../../types';
import { motion } from 'framer-motion';
import { useFilterStore } from '../../stores/filterStore';
import Button from '../ui/Button';
import { resultId } from '../../lib/ids';

type Props = {
  items: Result[];
};

export default function ExploreGrid({ items }: Props) {
  const compareList = useFilterStore(s => s.compareList);
  const toggleCompare = useFilterStore(s => s.toggleCompare);
  const setSelected = useFilterStore(s => s.setSelected);
  const setCompareList = useFilterStore(s => s.setCompareList);
  const [openDetailsId, setOpenDetailsId] = React.useState<string | null>(null);
  const MAX_COMPARE = 3;
  return (
    <div className={GRID_AUTOFILL}>
      {items.map((r) => {
        const id = resultId(r);
        const selectedIndex = compareList.indexOf(id);
        const isSelected = selectedIndex >= 0;
        const atCapacity = !isSelected && compareList.length >= MAX_COMPARE;
        const cta = isSelected ? 'Remove from comparison' : (atCapacity ? `Replace #${MAX_COMPARE} with this` : 'Add to comparison');
        return (
          <motion.div
            layout
            key={id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            whileHover={{ scale: 1.01 }}
            data-testid="lens-card"
            data-name={r.name}
            className={`relative ${CARD_BASE} ${CARD_NEUTRAL} ${CARD_BODY} ${isSelected ? 'ring-2 ring-[var(--accent)] border-[color-mix(in_oklab,var(--accent),black_30%)] bg-[color-mix(in_oklab,var(--accent),transparent_88%)]' : ''}`}
          >
            {isSelected && (
              <div className="absolute -top-2 -right-2 h-6 min-w-6 px-2 rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] text-xs grid place-items-center border border-[color-mix(in_oklab,var(--accent),white_40%)] shadow">
                {selectedIndex + 1}
              </div>
            )}
            <div className="text-[var(--text-color)] font-medium truncate" title={r.name}>{r.name}</div>
            {/* Quick badges */}
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--control-bg)] border border-[var(--control-border)] text-[var(--text-muted)]">{tagFromBestFor(bestFor(r.name, r.focal_min_mm === r.focal_max_mm ? 'Prime' : 'Zoom'))}</span>
              {r.ois && <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--control-bg)] border border-[var(--control-border)] text-[var(--text-muted)]">OIS</span>}
              {r.weather_sealed && <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--control-bg)] border border-[var(--control-border)] text-[var(--text-muted)]">Sealed</span>}
            </div>
            <div className={`mt-2 ${ROW_BETWEEN} ${TEXT_SM}`}>
              <div className="text-[var(--text-color)]">CHF {r.price_chf}</div>
              <button
                type="button"
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-color)]"
                onClick={() => setOpenDetailsId(openDetailsId === id ? null : id)}
                aria-expanded={openDetailsId === id}
                aria-controls={`details-${id}`}
                title={openDetailsId === id ? 'Hide details' : 'Show details'}
              >
                {openDetailsId === id ? '⌄' : '›'}
              </button>
            </div>
            {/* Compare toggle */}
            <div className={`mt-3 ${ROW_END}`}>
              <Button
                size="xs"
                onClick={() => {
                  if (isSelected) {
                    toggleCompare(id);
                  } else if (compareList.length >= MAX_COMPARE) {
                    const next = [...compareList];
                    next[MAX_COMPARE - 1] = id;
                    setCompareList(next);
                  } else {
                    toggleCompare(id);
                  }
                }}
                data-testid="compare-toggle"
              >{isSelected ? 'Remove' : (atCapacity ? `Replace #${MAX_COMPARE}` : 'Select')}</Button>
            </div>
            {openDetailsId === id && (
              <div id={`details-${id}`} className="mt-2 text-xs text-[var(--text-muted)] space-y-1">
                <div>Coverage: {r.coverage || '—'}</div>
                <div>Focal: {r.focal_min_mm === r.focal_max_mm ? `${r.focal_min_mm}mm` : `${r.focal_min_mm}–${r.focal_max_mm}mm`}</div>
                <div>Max aperture: f/{Number(r.aperture_min).toFixed(1)}</div>
                <div>Stabilization: {r.ois ? 'OIS' : '—'} • Sealed: {r.weather_sealed ? 'Yes' : 'No'} • Macro: {r.is_macro ? 'Yes' : 'No'}</div>
                <div>Distortion ≤ {r.distortion_pct ?? 0}% • Breathing score ≥ {r.focus_breathing_score ?? 0}</div>
              </div>
            )}
            {/* Click anywhere on card (except buttons) toggles selection */}
            <div
              className="absolute inset-0"
              aria-hidden
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest('[data-testid=compare-toggle]') || target.closest('button')) return;
                if (isSelected) {
                  toggleCompare(id);
                } else if (compareList.length >= MAX_COMPARE) {
                  const next = [...compareList];
                  next[MAX_COMPARE - 1] = id;
                  setCompareList(next);
                } else {
                  toggleCompare(id);
                }
              }}
              style={{ pointerEvents: 'auto' }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}

function bestFor(name: string, type?: string) {
  if (/macro/i.test(name)) return 'Macro & close-ups';
  if (/70-200|100-400|100-500|200-600/i.test(name)) return 'Sports & wildlife';
  if (/85mm|90mm/i.test(name)) return 'Portraits & low light';
  if (/50mm|35mm|24-70/i.test(name)) return 'Everyday & travel';
  if (/14-24|14mm|16mm|8-16/i.test(name)) return 'Landscapes & astro';
  if (type && /tele/i.test(type)) return 'Reach & action';
  if (type && /wide/i.test(type)) return 'Landscapes & interiors';
  return 'All‑round';
}

function tagFromBestFor(label: string) {
  if (/macro/i.test(label)) return 'Macro';
  if (/wildlife|sports/i.test(label)) return 'Action';
  if (/portrait/i.test(label)) return 'Portrait';
  if (/travel|everyday/i.test(label)) return 'Travel';
  if (/landscapes|astro/i.test(label)) return 'Landscape';
  return 'General';
}


