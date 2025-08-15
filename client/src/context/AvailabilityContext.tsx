import React from 'react';
import type { Camera } from '../types';
import type { Availability } from '../types/availability';
import { useAvailabilityOptions } from '../hooks/useAvailabilityOptions';
import { useAvailabilityCounts } from '../hooks/useAvailabilityCounts';
import { useOptionsSuperset } from '../hooks/useOptionsSuperset';

type Props = {
  cameras: Camera[];
  caps?: { brands?: string[]; lensTypes?: string[]; coverage?: string[] };
  brandsForCamera?: string[];
  children: React.ReactNode;
};

type Ctx = {
  dynamicAvail: Availability;
  counts: {
    brandCounts: Record<string, number>;
    typeCounts: Record<string, number>;
    coverageCounts: Record<string, number>;
    cameraCounts: Record<string, number>;
  };
  supBrands: string[];
  supLensTypes: string[];
  supCoverage: string[];
};

const AvailabilityContext = React.createContext<Ctx | null>(null);

export function AvailabilityProvider({ cameras, caps, brandsForCamera, children }: Props) {
  const { dynamicAvail } = useAvailabilityOptions({ cameras });
  const { supBrands, supLensTypes, supCoverage } = useOptionsSuperset({ caps, brandsForCamera });
  const counts = useAvailabilityCounts({ cameras, supBrands, supLensTypes, supCoverage });
  const value = React.useMemo(() => ({ dynamicAvail: dynamicAvail as any, counts, supBrands, supLensTypes, supCoverage }), [dynamicAvail, counts, supBrands, supLensTypes, supCoverage]);
  return (
    <AvailabilityContext.Provider value={value}>
      {children}
    </AvailabilityContext.Provider>
  );
}

export function useAvailability() {
  const ctx = React.useContext(AvailabilityContext);
  if (!ctx) throw new Error('useAvailability must be used within AvailabilityProvider');
  return ctx;
}


