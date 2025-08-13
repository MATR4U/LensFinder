import React from 'react';
import { clientConfig } from '../../config';
import { TEXT_XS_MUTED, CARD_BASE, CARD_NEUTRAL, ROW_BETWEEN, BADGE_SHAPE_XS } from '../ui/styles';
import type { Camera, Result } from '../../types';

type Props = {
  lens: { name: string; score: number; price_chf: number; weight_g: number; rank: number; type?: string };
  camera?: Camera | null;
  lowLightBar?: number; // 0..10
  videoBar?: number; // 0..10
  portabilityBar?: number; // 0..10
  valueBar?: number; // 0..10
  isTop?: boolean;
};

function chf(n: number | null | undefined) {
  return `CHF ${Math.round(Number(n || 0))}`;
}

function bestFor(name: string, type?: string) {
  if (/macro/i.test(name)) return 'Best for macro and close-ups';
  if (/70-200|100-400|100-500|200-600/i.test(name)) return 'Best for sports, wildlife, and events';
  if (/85mm|90mm/i.test(name)) return 'Best for portraits and low light';
  if (/50mm|35mm|24-70/i.test(name)) return 'Best everyday and travel lens';
  if (/14-24|14mm|16mm|8-16/i.test(name)) return 'Best for landscapes and astro';
  if (type && /tele/i.test(type)) return 'Best for reach and action';
  if (type && /wide/i.test(type)) return 'Best for landscapes and interiors';
  return 'Versatile all-round option';
}

export default function LensCard({ lens, camera, lowLightBar = 0, videoBar = 0, portabilityBar = 0, valueBar = 0, isTop }: Props) {
  const comboPrice = (camera?.price_chf || 0) + (lens.price_chf || 0);
  const comboWeight = (camera?.weight_g || 0) + (lens.weight_g || 0);
  return (
    <div className={`${CARD_BASE} ${CARD_NEUTRAL} p-3 ${isTop ? 'ring-1 ring-[var(--accent)]/40' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="text-[var(--text-color)] font-semibold">{lens.name}</h4>
          <div className={TEXT_XS_MUTED}>{bestFor(lens.name, lens.type)}</div>
        </div>
        <div className={`${BADGE_SHAPE_XS} ${isTop ? 'bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30' : 'bg-[var(--control-bg)] text-[var(--text-color)] border border-[var(--control-border)]'}`}>{isTop ? '⭐ Top Pick' : `#${lens.rank}`}</div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-[var(--text-muted)]">Total Price</div>
          <div className="text-[var(--text-color)] font-medium">{chf(comboPrice)}</div>
          <div className="text-[var(--text-muted)] mt-1">Breakdown</div>
          <div className="text-[var(--text-color)] text-xs">{chf(camera?.price_chf)} + {chf(lens.price_chf)}</div>
        </div>
        <div>
          <div className="text-[var(--text-muted)]">Total Weight</div>
          <div className="text-[var(--text-color)] font-medium">{comboWeight} g</div>
          <div className="text-[var(--text-muted)] mt-1">Breakdown</div>
          <div className="text-[var(--text-color)] text-xs">{(camera?.weight_g || 0)} g + {(lens.weight_g || 0)} g</div>
        </div>
      </div>

      <div className="mt-3">
        <div className="text-xs font-semibold text-[var(--text-color)] mb-1">Performance breakdown</div>
        <div className="space-y-1.5">
          {[
            { label: 'Low Light', v: lowLightBar },
            { label: 'Video', v: videoBar },
            { label: 'Portability', v: portabilityBar },
            { label: 'Value', v: valueBar }
          ].map(b => (
            <div key={b.label} className="text-xs">
              <div className={ROW_BETWEEN}><span className="text-[var(--text-color)]">{b.label}</span><span className="text-[var(--text-muted)]">{Math.round(b.v)}/10</span></div>
              <div className="h-2 bg-[var(--control-border)]/40 rounded">
                <div className="h-2 bg-[var(--accent)] rounded" style={{ width: `${Math.min(100, (b.v * 10))}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`mt-3 ${ROW_BETWEEN}`}>
        <div className={TEXT_XS_MUTED}>Score: <span className="text-[var(--text-color)] font-medium">{lens.score}</span></div>
        <a className="px-2 py-1 rounded bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-contrast)] text-xs" href={`${clientConfig.searchUrlBase}${encodeURIComponent(lens.name)}`} target="_blank" rel="noopener noreferrer">View Details & Prices</a>
      </div>
    </div>
  );
}


