import React from 'react';
import Message from './Message';
import { TEXT_SM } from './styles';

type Props = {
  leftTitle: string;
  rightTitle: string;
  left: React.ReactNode;
  right: React.ReactNode;
  variant?: 'info' | 'neutral' | 'warning' | 'success' | 'error';
  className?: string;
  bare?: boolean;
};

export default function MessageTwoColumn({ leftTitle, rightTitle, left, right, variant = 'info', className = '', bare = false }: Props) {
  const content = (
    <div className="flex flex-col lg:flex-row lg:divide-x lg:divide-[var(--border-default)]">
      <section className="lg:flex-1 lg:pr-4">
        <h4 className="font-semibold mb-1">{leftTitle}</h4>
        <div className={TEXT_SM}>{left}</div>
      </section>
      <section className="lg:flex-1 lg:pl-4 mt-4 lg:mt-0">
        <h4 className="font-semibold mb-1">{rightTitle}</h4>
        <div className={TEXT_SM}>{right}</div>
      </section>
    </div>
  );
  if (bare) return content;
  return (
    <Message variant={variant} className={`p-4 ${className}`}>
      {content}
    </Message>
  );
}


