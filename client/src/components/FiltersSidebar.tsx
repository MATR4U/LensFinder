import React from 'react';
import type { Camera } from '../types';

type Props = {
  cameras: Camera[];
  cameraName: string;
  setCameraName: (v: string) => void;
  isPro: boolean;
  setIsPro: (v: boolean) => void;
};

export default function FiltersSidebar({ cameras, cameraName, setCameraName, isPro, setIsPro }: Props) {
  return (
    <aside className="bg-gray-900/60 rounded-xl border border-gray-800 p-4 space-y-4">
      <div className="flex items-center justify-center space-x-4 p-2 bg-gray-800 rounded-lg">
        <span className={!isPro ? 'text-white text-sm' : 'text-gray-400 text-sm'}>Beginner</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" checked={isPro} onChange={(e) => setIsPro(e.target.checked)} />
          <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-800"></div>
        </label>
        <span className={isPro ? 'text-white text-sm' : 'text-gray-400 text-sm'}>Professional</span>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Camera Body</label>
        <select value={cameraName} onChange={(e) => setCameraName(e.target.value)} className="w-full bg-gray-800 border border-gray-700 text-white rounded-md p-2">
          {cameras.map((c) => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>
    </aside>
  );
}


