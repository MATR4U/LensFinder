import React from 'react';
import { SECTION_TITLE, ROW_BETWEEN, STACK_Y } from './styles';

type Props = {
  title?: string;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export default function Section({ title, actions, className = '', children }: Props) {
  return (
    <section className={`${STACK_Y} ${className}`}>
      {(title || actions) && (
        <div className={ROW_BETWEEN}>
          {title && <h2 className={SECTION_TITLE}>{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}


