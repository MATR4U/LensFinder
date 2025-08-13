import React from 'react';
import { TEXT_XS_MUTED, CARD_BASE, CARD_NEUTRAL, TEXT_MUTED, GRID_AUTOFILL, CARD_BODY, ROW_BETWEEN, TEXT_SM, ROW_END } from '../ui/styles';
import type { Result } from '../../types';
import { motion } from 'framer-motion';
import { useFilterStore } from '../../stores/filterStore';
import Button from '../ui/Button';

type Props = {
  items: Result[];
};

export default function ExploreGrid({ items }: Props) {
  const compareList = useFilterStore(s => s.compareList);
  const toggleCompare = useFilterStore(s => s.toggleCompare);
  const setSelected = useFilterStore(s => s.setSelected);
  return (
    <div className={GRID_AUTOFILL}>
      {items.map((r) => {
        const selectedIndex = compareList.indexOf(r.name);
        const isSelected = selectedIndex >= 0;
        return (
          <motion.div
            layout
            key={r.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            whileHover={{ scale: 1.01 }}
            data-testid="lens-card"
            data-name={r.name}
            className={`relative ${CARD_BASE} ${CARD_NEUTRAL} ${CARD_BODY}`}
          >
            {isSelected && (
              <div className="absolute -top-2 -right-2 h-6 min-w-6 px-2 rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] text-xs grid place-items-center border border-[color-mix(in_oklab,var(--accent),white_40%)] shadow">
                {selectedIndex + 1}
              </div>
            )}
            <div className="text-[var(--text-color)] font-medium truncate" title={r.name}>{r.name}</div>
            <div className={TEXT_XS_MUTED}>Best for: {bestFor(r.name, r.focal_min_mm === r.focal_max_mm ? 'Prime' : 'Zoom')}</div>
            <div className={`mt-2 ${ROW_BETWEEN} ${TEXT_SM}`}>
              <div className="text-[var(--text-color)]">CHF {r.price_chf}</div>
              <div className={TEXT_MUTED}>{r.weight_g} g</div>
            </div>
            <div className={`mt-3 ${ROW_END} gap-2`}>
              <Button size="xs" variant="secondary" onClick={() => setSelected(r)} aria-label="Select">Select</Button>
              <Button size="xs" onClick={() => toggleCompare(r.name)} data-testid="compare-toggle">{isSelected ? 'Remove' : '+ Compare'}</Button>
            </div>
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


