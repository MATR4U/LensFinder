import React from 'react';
import LensCard from './LensCard';
import { GRID_AUTOFILL_4 } from '../ui/styles';
import type { Camera } from '../../types';

type LensItem = { name: string; score: number; price_chf: number; weight_g: number; rank: number; type?: string };

type Props = {
  camera?: Camera | null;
  items: LensItem[];
  bars: Record<string, { lowLight: number; video: number; portability: number; value: number }>;
};

export default function Recommendations({ camera, items, bars }: Props) {
  return (
    <div className={GRID_AUTOFILL_4}>
      {items.map((t, idx) => (
        <LensCard
          key={t.name}
          lens={t}
          camera={camera}
          lowLightBar={bars[t.name]?.lowLight ?? 0}
          videoBar={bars[t.name]?.video ?? 0}
          portabilityBar={bars[t.name]?.portability ?? 0}
          valueBar={bars[t.name]?.value ?? 0}
          isTop={idx === 0}
        />
      ))}
    </div>
  );
}


