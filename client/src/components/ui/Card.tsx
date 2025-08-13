import React from 'react';
import { CARD_BASE, CARD_NEUTRAL, TITLE_H2, TEXT_XS_MUTED, ROW_BETWEEN } from './styles';

type Props = {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export default function Card({ title, subtitle, right, className = '', children }: Props) {
  return (
    <section className={`${CARD_BASE} ${CARD_NEUTRAL} shadow-elevated ${className}`}>
      {(title || right) && (
        <div className={`${ROW_BETWEEN} mb-3`}>
          <div>
            {title && <h3 className={TITLE_H2}>{title}</h3>}
            {subtitle && <p className={`${TEXT_XS_MUTED} mt-0.5`}>{subtitle}</p>}
          </div>
          {right}
        </div>
      )}
      <div className="prose-content space-y-3">
        {children}
      </div>
    </section>
  );
}


