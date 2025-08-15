import React from 'react';
import CheckboxGroup from './fields/CheckboxGroup';
import { FIELD_HELP } from './fieldHelp';

type Props = {
  sealed: boolean;
  setSealed: (v: boolean) => void;
  canRequireSealed: boolean;
  isMacro: boolean;
  setIsMacro: (v: boolean) => void;
  canRequireMacro: boolean;
  requireOIS?: boolean;
  setRequireOIS?: (v: boolean) => void;
  canRequireOIS?: boolean;
};

export default function BuildFeatures({ sealed, setSealed, canRequireSealed, isMacro, setIsMacro, canRequireMacro, requireOIS, setRequireOIS, canRequireOIS }: Props) {
  return (
    <CheckboxGroup
      label="Build features"
      infoText="Quick toggles for key build features."
      items={[
        { key: 'sealed', label: 'Weather sealed', checked: sealed, onChange: setSealed, id: 'opt-sealed', disabled: !sealed && !canRequireSealed },
        { key: 'macro', label: 'Macro', checked: isMacro, onChange: setIsMacro, id: 'opt-macro', disabled: !isMacro && !canRequireMacro },
        ...((typeof requireOIS === 'boolean' && setRequireOIS) ? [{ key: 'ois', label: 'Require OIS', checked: requireOIS, onChange: setRequireOIS, id: 'opt-ois', infoText: FIELD_HELP.requireOIS, disabled: !requireOIS && !canRequireOIS }] : [] as any[]),
      ]}
    />
  );
}


