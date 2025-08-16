import React from 'react';
import FocalRange from '../FocalRange';
import MetricRange from '../MetricRange';
import { useLastChangedDiff } from '../../../hooks/useLastChangedDiff';

export default function FocalAndMetrics({ resultsCount }: { resultsCount: number }) {
  const { getLabel: lastChangedLabel, getDetail: lastChangedDetail } = useLastChangedDiff();
  return (
    <>
      <div>
        <FocalRange
          warningTip={(resultsCount === 0 && lastChangedLabel() === 'Focal range' && lastChangedDetail()) ? `No matches after adjusting Focal range to ${lastChangedDetail()}.` : undefined}
          status={(resultsCount === 0 && lastChangedLabel() === 'Focal range') ? 'blocking' : undefined}
        />
      </div>
      <div className="space-y-3">
        <div>
          <MetricRange
            metric="price"
            warningTip={resultsCount === 0
              ? (lastChangedLabel() === 'Price range' && lastChangedDetail()
                ? `No matches after adjusting Price range to ${lastChangedDetail()}.`
                : 'No matches with current filters.')
              : undefined}
            status={resultsCount === 0 && lastChangedLabel() === 'Price range' ? 'blocking' : undefined}
          />
        </div>
        <div>
          <MetricRange metric="weight" warningTip={(resultsCount === 0 && lastChangedLabel() === 'Weight range' && lastChangedDetail()) ? `No matches after adjusting Weight range to ${lastChangedDetail()}.` : undefined} status={(resultsCount === 0 && lastChangedLabel() === 'Weight range') ? 'blocking' : undefined} />
        </div>
        <div>
          <MetricRange metric="distortion" warningTip={(resultsCount === 0 && lastChangedLabel() === 'Distortion max' && lastChangedDetail()) ? `No matches after adjusting Distortion max to ${lastChangedDetail()}.` : undefined} status={(resultsCount === 0 && lastChangedLabel() === 'Distortion max') ? 'blocking' : undefined} />
        </div>
        <div>
          <MetricRange metric="breathing" warningTip={(resultsCount === 0 && lastChangedLabel() === 'Breathing min score' && lastChangedDetail()) ? `No matches after adjusting Breathing min score to ${lastChangedDetail()}.` : undefined} status={(resultsCount === 0 && lastChangedLabel() === 'Breathing min score') ? 'blocking' : undefined} />
        </div>
      </div>
    </>
  );
}


