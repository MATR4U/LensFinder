import React from 'react';
import FieldContainer, { type FieldStatus } from './FieldContainer';
import Info from '../Info';
import Toggle from '../Toggle';

type Item = {
  key: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  id?: string; // stable id for e2e and aria
  infoText?: string;
  disabled?: boolean;
};

type Props = {
  label: string;
  infoText?: string;
  items: Item[];
  layout?: 'row' | 'col';
  hint?: string;
  status?: FieldStatus;
  showItemLabels?: boolean; // hide when single-item to avoid duplication
};

export default function CheckboxGroup({ label, infoText, items, layout = 'row', hint, status, showItemLabels = true }: Props) {
  const groupLabelId = React.useId();
  return (
    <FieldContainer label={label} info={infoText ? <Info text={infoText} /> : undefined} hint={hint} status={status} labelId={groupLabelId}>
      <div className={layout === 'row' ? 'flex flex-wrap items-center divide-x divide-[var(--border-default)]' : 'flex flex-col gap-2'} aria-labelledby={groupLabelId}>
        {items.map((item) => {
          const checkboxId = item.id ?? `${item.key}-${groupLabelId}`;
          // roleLabel and ariaChecked are implicit via Toggle; avoid unused vars
          const hideText = !showItemLabels && items.length === 1;
          return (
            <div key={item.key} className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] px-4 first:pl-0">
              <label htmlFor={checkboxId} className="inline-flex items-center gap-2 cursor-pointer select-none">
                <Toggle checked={item.checked} onChange={item.onChange} disabled={!!item.disabled && !item.checked} className="focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" />
                {!hideText && <span>{item.label}</span>}
              </label>
              {item.infoText && (
                <Info text={item.infoText} />
              )}
            </div>
          );
        })}
      </div>
    </FieldContainer>
  );
}


