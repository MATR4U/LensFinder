import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'warning';
export type ButtonSize = 'xs' | 'sm' | 'md';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export default function Button({ children, onClick, type = 'button', variant = 'primary', size = 'md', className = '', disabled = false, title, ...rest }: Props) {
  const base = 'rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent';
  const sizeCls = size === 'xs' ? 'text-xs px-2 py-1' : size === 'sm' ? 'text-sm px-3 py-1.5' : 'text-sm px-4 py-2';
  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-contrast)]',
    secondary: 'bg-[var(--control-bg)] border border-[var(--control-border)] text-[var(--text-color)] hover:bg-[color-mix(in_oklab,var(--control-bg),white_8%)]',
    ghost: 'bg-transparent text-[var(--text-muted)] hover:text-[var(--text-color)]',
    warning: 'bg-[var(--badge-warning-bg)] hover:bg-[color-mix(in_oklab,var(--badge-warning-bg),white_10%)] border border-[var(--badge-warning-border)] text-[var(--badge-warning-text)]'
  };
  const cls = `${base} ${sizeCls} ${variants[variant]} ${className}`;
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled} title={title} {...rest}>
      {children}
    </button>
  );
}


