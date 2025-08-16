import React from 'react';
import { CARD_BASE, CARD_NEUTRAL, TEXT_SM } from './ui/styles';
import type { Camera } from '../types';
import Toggle from './ui/Toggle';
import Select from './ui/Select';

type Props = {
  cameras: Camera[];
  cameraName: string;
  setCameraName: (v: string) => void;
  isPro: boolean;
  setIsPro: (v: boolean) => void;
};

export default function FiltersSidebar({ cameras, cameraName, setCameraName, isPro, setIsPro }: Props) {
  return (
    <aside className={`${CARD_BASE} ${CARD_NEUTRAL} space-y-4`}>
      <div className="flex items-center justify-center space-x-4 p-2 bg-[var(--control-bg)] rounded-lg border border-[var(--control-border)]">
        <span className={!isPro ? `${TEXT_SM}` : `${TEXT_SM} text-[var(--text-muted)]`}>Beginner</span>
        <Toggle checked={isPro} onChange={setIsPro} />
        <span className={isPro ? `${TEXT_SM}` : `${TEXT_SM} text-[var(--text-muted)]`}>Professional</span>
      </div>

      <div>
        <label className={`block ${TEXT_SM} font-medium text-[var(--text-muted)] mb-1`}>Camera Body</label>
        <Select value={cameraName} onChange={setCameraName}>
          {cameras.map((c) => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
        </Select>
      </div>
    </aside>
  );
}


