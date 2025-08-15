import React from 'react';

type Args = {
  dynamicAvail: { brands: string[]; lensTypes: string[]; coverage: string[] };
  brand: string;
  setBrand: (v: string) => void;
  lensType: string;
  setLensType: (v: string) => void;
  coverage: string;
  setCoverage: (v: string) => void;
};

export function useAutoCorrectSelections({ dynamicAvail, brand, setBrand, lensType, setLensType, coverage, setCoverage }: Args) {
  React.useEffect(() => {
    if (brand !== 'Any' && !dynamicAvail.brands.includes(brand)) setBrand('Any');
    if (lensType !== 'Any' && !dynamicAvail.lensTypes.includes(lensType)) setLensType('Any');
    if (coverage !== 'Any' && !dynamicAvail.coverage.includes(coverage)) setCoverage('Any');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dynamicAvail.brands.join(','), dynamicAvail.lensTypes.join(','), dynamicAvail.coverage.join(','), brand, lensType, coverage]);
}


