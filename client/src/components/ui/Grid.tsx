import React from 'react';
import { GRID_AUTOFILL, GRID_AUTOFILL_4 } from './styles';

type Props = {
  variant?: 'auto3' | 'auto4';
  className?: string;
  children: React.ReactNode;
};

export default function Grid({ variant = 'auto3', className = '', children }: Props) {
  const base = variant === 'auto4' ? GRID_AUTOFILL_4 : GRID_AUTOFILL;
  return <div className={`${base} ${className}`}>{children}</div>;
}


