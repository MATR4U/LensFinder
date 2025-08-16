import React from 'react';
import FocalRange from '../FocalRange';
import { useLastChangedDiff } from '../../../hooks/useLastChangedDiff';

export default function FocalOnly({ resultsCount }: { resultsCount: number }) {
  const { getLabel: lastChangedLabel, getDetail: lastChangedDetail } = useLastChangedDiff();
  return (
    <div>
      <FocalRange
        warningTip={(resultsCount === 0 && lastChangedLabel() === 'Focal range' && lastChangedDetail()) ? `No matches after adjusting Focal range to ${lastChangedDetail()}.` : undefined}
        status={(resultsCount === 0 && lastChangedLabel() === 'Focal range') ? 'blocking' : undefined}
      />
    </div>
  );
}


