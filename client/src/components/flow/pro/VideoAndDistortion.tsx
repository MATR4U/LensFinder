import React from 'react';
import MetricRange from '../MetricRange';
import { useLastChangedDiff } from '../../../hooks/useLastChangedDiff';

export default function VideoAndDistortion({ resultsCount }: { resultsCount: number }) {
  const { getLabel: lastChangedLabel, getDetail: lastChangedDetail } = useLastChangedDiff();
  return (
    <div className="space-y-3">
      <div>
        <MetricRange
          metric="distortion"
          warningTip={(resultsCount === 0 && lastChangedLabel() === 'Distortion max' && lastChangedDetail()) ? `No matches after adjusting Distortion max to ${lastChangedDetail()}.` : undefined}
          status={(resultsCount === 0 && lastChangedLabel() === 'Distortion max') ? 'blocking' : undefined}
        />
      </div>
      <div>
        <MetricRange
          metric="breathing"
          warningTip={(resultsCount === 0 && lastChangedLabel() === 'Breathing min score' && lastChangedDetail()) ? `No matches after adjusting Breathing min score to ${lastChangedDetail()}.` : undefined}
          status={(resultsCount === 0 && lastChangedLabel() === 'Breathing min score') ? 'blocking' : undefined}
        />
      </div>
    </div>
  );
}


