import React from 'react';
import { LINK_HOVER_ACCENT } from '../ui/styles';
import { clientConfig } from '../../config';

export default function FinalVerdict({ topPerformer, bestValue, lightest }: { topPerformer?: any; bestValue?: any; lightest?: any }) {
  if (!topPerformer && !bestValue && !lightest) return null;
  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold text-[var(--text-color)]">Final Verdict</h3>
      <ul className="list-disc list-inside">
        {topPerformer && (<li><span className="font-semibold">Top Performer:</span> <a className={LINK_HOVER_ACCENT} href={`${clientConfig.searchUrlBase}${encodeURIComponent(topPerformer.name)}`} target="_blank" rel="noopener noreferrer">{topPerformer.name}</a></li>)}
        {bestValue && (<li><span className="font-semibold">Best Value (Score ÷ Price):</span> <a className={LINK_HOVER_ACCENT} href={`${clientConfig.searchUrlBase}${encodeURIComponent(bestValue.name)}`} target="_blank" rel="noopener noreferrer">{bestValue.name}</a></li>)}
        {lightest && (<li><span className="font-semibold">Best Portability (Lightest):</span> <a className={LINK_HOVER_ACCENT} href={`${clientConfig.searchUrlBase}${encodeURIComponent(lightest.name)}`} target="_blank" rel="noopener noreferrer">{lightest.name}</a></li>)}
      </ul>
    </div>
  );
}


