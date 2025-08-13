import React from 'react';
import Button from '../ui/Button';
import { TEXT_SM } from '../ui/styles';

type Props = {
  cameraName: string;
  goal: string;
  onEditPreferences?: () => void;
};

export default function SummaryHeader({ cameraName, goal, onEditPreferences }: Props) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h3 className="text-xl font-bold text-[var(--text-color)]">Your personalized summary</h3>
        <p className={`${TEXT_SM} text-[var(--text-muted)]`}>
          Camera: <span className="font-medium text-[var(--text-color)]">{cameraName}</span> · Goal: <span className="font-medium text-[var(--text-color)]">{goal}</span>
        </p>
      </div>
      <div>
        <Button size="sm" onClick={onEditPreferences}>Edit Preferences</Button>
      </div>
    </div>
  );
}


