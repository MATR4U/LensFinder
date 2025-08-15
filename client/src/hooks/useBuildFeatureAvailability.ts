import React from 'react';
import { useFilterStore } from '../stores/filterStore';
import { coverageMatches } from '../lib/availability';
import type { Camera, Lens } from '../types';

export function useBuildFeatureAvailability(args: { lenses: Lens[]; camera?: Camera }) {
  const { cameraName, brand, lensType, sealed, isMacro, isPro, coverage, requireOIS } = useFilterStore();

  const baseFilter = React.useCallback((l: Lens) => {
    if (brand !== 'Any' && l.brand !== brand) return false;
    const type = (l.focal_min_mm === l.focal_max_mm) ? 'Prime' : 'Zoom';
    if (lensType !== 'Any' && type !== lensType) return false;
    if (sealed && !l.weather_sealed) return false;
    if (isMacro && !l.is_macro) return false;
    if (isPro && !coverageMatches(l.coverage, coverage)) return false;
    if (requireOIS && !l.ois) return false;
    if (cameraName !== 'Any' && args.camera && l.mount !== args.camera.mount) return false;
    return true;
  }, [brand, lensType, sealed, isMacro, isPro, coverage, requireOIS, cameraName, args.camera]);

  const canRequireSealed = React.useMemo(() => args.lenses.filter((l) => baseFilter(l) && !!l.weather_sealed).length > 0, [args.lenses, baseFilter]);
  const canRequireMacro = React.useMemo(() => args.lenses.filter((l) => baseFilter(l) && !!l.is_macro).length > 0, [args.lenses, baseFilter]);
  const canRequireOIS = React.useMemo(() => args.lenses.filter((l) => baseFilter(l) && !!l.ois).length > 0, [args.lenses, baseFilter]);

  return { canRequireSealed, canRequireMacro, canRequireOIS } as const;
}


