import React from 'react';
import AvailabilitySelect from '../../ui/AvailabilitySelect';

export default function CoverageSelect({
  coverage,
  setCoverage,
  options,
}: {
  coverage: string;
  setCoverage: (v: string) => void;
  options: Array<{ value: string; label: string; count?: number; disabled?: boolean }>;
}) {
  return (
    <AvailabilitySelect label="Sensor Coverage" value={coverage} onChange={setCoverage} options={options} />
  );
}


