import React from 'react';

type Props = {
  checked: boolean;
  onChange: (v: boolean) => void;
  className?: string;
  disabled?: boolean;
  ariaLabelledBy?: string;
};

export default function Toggle({ checked, onChange, className = '', disabled = false, ariaLabelledBy }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      aria-labelledby={ariaLabelledBy}
      disabled={disabled}
      onClick={() => { if (!disabled) onChange(!checked); }}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-[var(--accent)]' : 'bg-[var(--control-border)]'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-[var(--slider-thumb-bg)] transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`}
      />
    </button>
  );
}



