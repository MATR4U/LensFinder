import React from 'react';
import { ROW_BETWEEN, TITLE_H2, BADGE_COUNT } from './styles';

type Props = {
  title: string;
  resultsCount?: number;
  right?: React.ReactNode;
  className?: string;
};

export default function StageHeader({ title, resultsCount, right, className = '' }: Props) {
  return (
    <div className={`${ROW_BETWEEN} ${className}`}>
      <div className="flex items-center gap-3">
        <h2 className={TITLE_H2}>{title}</h2>
        {typeof resultsCount === 'number' && (
          <span className={BADGE_COUNT}>Showing {resultsCount} matches</span>
        )}
      </div>
      {right}
    </div>
  );
}



