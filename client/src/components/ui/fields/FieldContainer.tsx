import React from 'react';
import { FIELD_CONTAINER_BASE, FIELD_CONTAINER_BG_BLOCKING, FIELD_CONTAINER_BG_LIMIT, FIELD_CONTAINER_BG_NORMAL, FIELD_CONTAINER_BG_WARNING, ROW_BETWEEN, FORM_LABEL } from '../styles';

export type FieldStatus = 'normal' | 'limit' | 'blocking' | 'warning';

type Props = {
  label: string;
  info?: React.ReactNode;
  status?: FieldStatus;
  hint?: string;
  action?: React.ReactNode; // e.g., button chip to apply suggestion
  right?: React.ReactNode; // optional right-side adornment
  children: React.ReactNode;
  // Optional id to associate the visible label with an input/control via aria-labelledby
  labelId?: string;
  // Optional for associating label with a specific input via htmlFor
  htmlFor?: string;
  // Optional inline warning with hover tooltip (exclamation icon)
  warningTip?: string;
};

export default function FieldContainer({ label, info, status = 'normal', hint, action, right, children, labelId, htmlFor, warningTip }: Props) {
  const bgCls = status === 'blocking' ? FIELD_CONTAINER_BG_BLOCKING : status === 'limit' ? FIELD_CONTAINER_BG_LIMIT : status === 'warning' ? FIELD_CONTAINER_BG_WARNING : FIELD_CONTAINER_BG_NORMAL;
  return (
    <div className={`${FIELD_CONTAINER_BASE} ${bgCls}`} role="group" aria-labelledby={labelId}>
      <div className={`${ROW_BETWEEN} mb-1.5`}>
        <label id={labelId} htmlFor={htmlFor} className={`${FORM_LABEL} flex items-center gap-2`}>
          <span>{label}</span>
          {info}
          {warningTip && (
            <span className="relative inline-flex items-center group">
              <span className="h-5 w-5 rounded-full bg-[var(--notice-warning-bg)] border border-[var(--notice-warning-border)] text-[var(--notice-warning-text)] grid place-items-center text-[11px]/[11px] cursor-help">!</span>
              <span className="pointer-events-none absolute z-20 top-full mt-2 hidden w-80 rounded-md border border-[var(--control-border)] bg-[var(--control-bg)] p-3 text-xs text-[var(--text-color)] shadow-xl group-hover:block">
                {warningTip}
              </span>
            </span>
          )}
        </label>
        {right}
      </div>
      <div className="space-y-1">
        {children}
        {(hint || action) && (
          <div className={`${ROW_BETWEEN} text-[11px] mt-0.5`}>
            <div className="text-[var(--notice-warning-text)]">{hint}</div>
            {action}
          </div>
        )}
      </div>
    </div>
  );
}


