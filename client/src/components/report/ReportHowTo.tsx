import React from 'react';
import CollapsibleMessage from '../ui/CollapsibleMessage';

export default function ReportHowTo() {
  return (
    <CollapsibleMessage variant="info" title="How to read this report" defaultOpen={false} className="mb-4">
      <ul>
        <li><strong>Score</strong>: Overall utility aligned to your preferences. Higher is better.</li>
        <li><strong>Badges</strong>: Top Performer = highest Score; Best Value = best Score÷Price; Best Portability = lightest.</li>
        <li><strong>Bars</strong>: Low Light, Video, Portability, Value are normalized 0–10 within your top picks to highlight strengths.</li>
        <li><strong>Chart</strong>: Each dot is a lens (X = Price, Y = Score). The green line marks the Pareto frontier—prefer options near the top‑left.</li>
        <li><strong>Decide</strong>: If torn, pick the best value on the frontier, then consider portability and your shooting style.</li>
      </ul>
    </CollapsibleMessage>
  );
}


