import React from 'react';
import MetricRange from '../MetricRange';
import { useLastChangedDiff } from '../../../hooks/useLastChangedDiff';

export default function PriceAndWeight({ resultsCount }: { resultsCount: number }) {
  const { getLabel: lastChangedLabel, getDetail: lastChangedDetail } = useLastChangedDiff();
  return (
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
        <MetricRange
          metric="weight"
          warningTip={(resultsCount === 0 && lastChangedLabel() === 'Weight range' && lastChangedDetail()) ? `No matches after adjusting Weight range to ${lastChangedDetail()}.` : undefined}
          status={(resultsCount === 0 && lastChangedLabel() === 'Weight range') ? 'blocking' : undefined}
        />
      </div>
    </div>
  );
}


