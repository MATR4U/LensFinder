import React from 'react';
import AvailabilitySelect from '../../ui/AvailabilitySelect';

export default function BrandTypeSelectors({
  brand,
  setBrand,
  lensType,
  setLensType,
  brandsOptions,
  lensTypeOptions,
}: {
  brand: string;
  setBrand: (v: string) => void;
  lensType: string;
  setLensType: (v: string) => void;
  brandsOptions: Array<{ value: string; label: string; count?: number; disabled?: boolean }>;
  lensTypeOptions: Array<{ value: string; label: string; count?: number; disabled?: boolean }>;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <AvailabilitySelect label="Lens Brand" value={brand} onChange={setBrand} options={brandsOptions} />
      <AvailabilitySelect label="Lens Type" value={lensType} onChange={setLensType} options={lensTypeOptions} />
    </div>
  );
}


