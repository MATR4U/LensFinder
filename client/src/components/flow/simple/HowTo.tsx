import React from 'react';
import CollapsibleMessage from '../../ui/CollapsibleMessage';
import { FIELD_HELP } from '../../ui/fieldHelp';

export default function HowTo() {
  return (
    <CollapsibleMessage variant="info" title="How to use these filters" defaultOpen={false}>
      <ul className="list-disc pl-5 text-sm space-y-1">
        <li><strong>Camera</strong>: {FIELD_HELP.cameraBody}</li>
        <li><strong>Brand/Type</strong>: Filter by maker and choose Prime (single focal length) or Zoom (range).</li>
        <li><strong>Price/Weight</strong>: {FIELD_HELP.price} {FIELD_HELP.weight}</li>
        <li><strong>Priorities</strong>: {FIELD_HELP.goalPreset}</li>
      </ul>
    </CollapsibleMessage>
  );
}


