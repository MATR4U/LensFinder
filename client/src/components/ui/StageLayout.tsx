import React from 'react';
import StageHeader from './StageHeader';
import StageNav from './StageNav';
import { CARD_PADDED } from './styles';

type Props = {
  title: string;
  resultsCount?: number;
  children: React.ReactNode;
  onBack: () => void;
  onReset?: () => void;
  onContinue: () => void;
  stageNumber: number;
  headerRight?: React.ReactNode;
  className?: string;
};

export default function StageLayout({ title, resultsCount, children, onBack, onReset, onContinue, stageNumber, headerRight, className = '' }: Props) {
  return (
    <div className={`${CARD_PADDED} ${className}`}>
      <StageHeader title={title} resultsCount={resultsCount} right={headerRight} />
      {children}
      <StageNav className="mt-2" onBack={onBack} onReset={onReset} onContinue={onContinue} stageNumber={stageNumber} />
    </div>
  );
}


