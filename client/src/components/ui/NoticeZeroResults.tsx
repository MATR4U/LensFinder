import React from 'react';
import Message from './Message';
import Button from './Button';
import { INLINE_CHIPS_ROW } from './styles';

export type Suggestion = { count: number; apply: () => void; label: string };

type Props = {
  changedLabel?: string;
  changedDetail?: string;
  suggestions: Record<string, Suggestion>;
};

export default function NoticeZeroResults({ changedLabel, changedDetail, suggestions }: Props) {
  const entries = Object.entries(suggestions).sort((a, b) => b[1].count - a[1].count).slice(0, 3);
  return (
    <Message variant="warning" title="No matches">
      <div className="text-sm">
        {changedLabel ? (
          <div>
            After adjusting <strong>{changedLabel}</strong>{changedDetail ? ` to ${changedDetail}` : ''}, no lenses match.
          </div>
        ) : (
          <div>Current filters result in zero matches.</div>
        )}
        {entries.length > 0 && (
          <div className="mt-2">
            <div className="mb-1">Try one of these quick resets:</div>
            <div className={INLINE_CHIPS_ROW}>
              {entries.map(([key, s]) => (
                <Button key={key} variant="warning" size="xs" onClick={s.apply}>
                  {key}: {s.label} → {s.count}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Message>
  );
}


