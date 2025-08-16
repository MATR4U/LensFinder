import React from 'react';
import CollapsibleMessage from '../../ui/CollapsibleMessage';
import { FIELD_HELP } from '../../ui/fieldHelp';

export default function HowTo() {
  return (
    <CollapsibleMessage variant="neutral" title="Tune your requirements" defaultOpen={false} className="max-w-3xl">
      <ul className="list-disc pl-5 text-sm space-y-1">
        <li><strong>Coverage</strong>: {FIELD_HELP.coverage}</li>
        <li><strong>Focal range</strong>: {FIELD_HELP.focalRange}</li>
        <li><strong>Max aperture</strong>: {FIELD_HELP.maxAperture}</li>
        <li><strong>Price/Weight</strong>: {FIELD_HELP.price} {FIELD_HELP.weight}</li>
        <li><strong>Video constraints</strong>: {FIELD_HELP.distortionMax} {FIELD_HELP.breathingMin}</li>
        <li><strong>Tip</strong>: If results hit zero, use the quick reset suggestions shown above the fields.</li>
      </ul>
    </CollapsibleMessage>
  );
}


