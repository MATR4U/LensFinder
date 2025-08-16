import React from 'react';
import type { Camera } from '../../../types';
import AvailabilitySelect from '../../ui/AvailabilitySelect';

export default function CameraSelect({
  cameras,
  cameraName,
  setCameraName,
  counts,
  availableBodies,
}: {
  cameras: Camera[];
  cameraName: string;
  setCameraName: (name: string) => void;
  counts: Record<string, number>;
  availableBodies: Record<string, boolean>;
}) {
  return (
    <AvailabilitySelect
      label="Camera Body"
      value={cameraName}
      onChange={setCameraName}
      options={[
        { value: 'Any', label: 'Any', count: counts['Any'] },
        ...cameras.map((c) => ({
          value: c.name,
          label: c.name,
          count: counts[c.name] ?? 0,
          disabled: availableBodies[c.name] === false,
        })),
      ]}
    />
  );
}


