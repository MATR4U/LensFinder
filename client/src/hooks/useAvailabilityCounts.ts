import React from 'react';
import type { Camera } from '../types';
import { useAvailabilityOptions } from './useAvailabilityOptions';

type Args = {
  cameras: Camera[];
  supBrands: string[];
  supLensTypes: string[];
  supCoverage: string[];
};

export function useAvailabilityCounts({ cameras, supBrands, supLensTypes, supCoverage }: Args) {
  const { dynamicAvail } = useAvailabilityOptions({ cameras });

  return React.useMemo(() => {
    const brandCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};
    const coverageCounts: Record<string, number> = {};
    const cameraCounts: Record<string, number> = {};
    for (const b of supBrands) brandCounts[b] = dynamicAvail.brands.includes(b) ? 1 : 0;
    for (const t of supLensTypes) typeCounts[t] = dynamicAvail.lensTypes.includes(t) ? 1 : 0;
    for (const c of supCoverage) coverageCounts[c] = dynamicAvail.coverage.includes(c) ? 1 : 0;
    for (const cam of cameras) cameraCounts[cam.name] = 1;
    return { brandCounts, typeCounts, coverageCounts, cameraCounts } as const;
  }, [dynamicAvail.brands, dynamicAvail.lensTypes, dynamicAvail.coverage, supBrands, supLensTypes, supCoverage, cameras]);
}


