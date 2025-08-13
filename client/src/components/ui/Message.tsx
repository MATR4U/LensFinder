import React from 'react';
import { CARD_BASE, CARD_NEUTRAL, CARD_ERROR, CARD_WARNING, CARD_SUCCESS, CARD_INFO, ROW_BETWEEN } from './styles';

type Variant = 'neutral' | 'error' | 'warning' | 'success' | 'info';

type Props = {
  variant?: Variant;
  title?: string;
  children?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
};

const byVariant: Record<Variant, string> = {
  neutral: CARD_NEUTRAL,
  error: CARD_ERROR,
  warning: CARD_WARNING,
  success: CARD_SUCCESS,
  info: CARD_INFO,
};

export default function Message({ variant = 'neutral', title, children, right, className = '' }: Props) {
  return (
    <div className={`${CARD_BASE} ${byVariant[variant]} ${className}`} role="status" aria-live="polite">
      {(title || right) && (
        <div className={`${ROW_BETWEEN} mb-2`}>
          {title && <h4 className="font-semibold">{title}</h4>}
          {right}
        </div>
      )}
      <div className="message-prose">
        {children}
      </div>
    </div>
  );
}


