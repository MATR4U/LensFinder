import React from 'react';
import { CARD_BASE, CARD_NEUTRAL, ROW_BETWEEN } from './styles';
import Button from './Button';

type ModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function Modal({ open, title, onClose, children, footer }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-[color-mix(in_oklab,black,transparent_40%)]" onClick={onClose} />
      <div className={`absolute inset-x-0 bottom-0 md:inset-0 md:m-auto md:h-[80vh] ${CARD_BASE} ${CARD_NEUTRAL} rounded-t-2xl md:rounded-2xl shadow-xl overflow-hidden`}>
        <div className={`${ROW_BETWEEN} p-3 border-b border-[var(--card-border)]`}>
          <h3 className="font-semibold text-sm">{title}</h3>
          <Button variant="ghost" size="sm" onClick={onClose} title="Close">✕</Button>
        </div>
        <div className="p-4 max-h-[70vh] md:max-h-[calc(80vh-100px)] overflow-y-auto prose-content">
          {children}
        </div>
        <div className="p-3 border-t border-[var(--card-border)] bg-[var(--card-bg)]/70">
          {footer}
        </div>
      </div>
    </div>
  );
}


