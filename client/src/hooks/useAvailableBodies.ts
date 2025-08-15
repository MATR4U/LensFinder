import React from 'react';
import type { Camera, Lens } from '../types';
import { lensTypeFromFocal } from '../lib/optics';
import { coverageMatches } from '../lib/availability';

type Args = {
  cameras: Camera[];
  lenses: Lens[];
  brand: string;
  lensType: 'Any' | 'Prime' | 'Zoom';
  isPro: boolean;
  coverage: string;
  isMacro: boolean;
  sealed: boolean;
  requireOIS: boolean;
};

export function useAvailableBodies({ cameras, lenses, brand, lensType, isPro, coverage, isMacro, sealed, requireOIS }: Args) {
  return React.useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const cam of cameras) {
      let arr = lenses.filter(l => l.mount === cam.mount);
      arr = arr
        .filter(l => (brand === 'Any' ? true : l.brand === brand))
        .filter(l => {
          const type = lensTypeFromFocal(l);
          return lensType === 'Any' ? true : type === lensType;
        })
        .filter(l => (sealed ? !!l.weather_sealed : true))
        .filter(l => (isMacro ? !!l.is_macro : true))
        .filter(l => (isPro ? coverageMatches(l.coverage, coverage) : true))
        .filter(l => (requireOIS ? !!l.ois : true));
      map[cam.name] = arr.length > 0;
    }
    return map;
  }, [cameras, lenses, brand, lensType, sealed, isMacro, isPro, coverage, requireOIS]);
}


