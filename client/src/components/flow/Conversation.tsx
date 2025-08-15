import React from 'react';
import Button from '../ui/Button';
import RangeSlider from '../ui/RangeSlider';
import { TEXT_XS_MUTED } from '../ui/styles';
import { formatCurrencyCHF } from '../../lib/formatters';

export default function Conversation({ goalWeights, onSetWeights, priceMax, onSetBudgetMax, onContinue }: any) {
  return (
    <div>
      <div className="mb-4">
        <div className="text-sm font-medium text-[var(--text-color)] mb-1">How important is low-light performance?</div>
        <RangeSlider
          min={0}
          max={1}
          step={0.05}
          singleValue={goalWeights.low_light ?? 0}
          onChangeSingle={(v) => onSetWeights({ ...goalWeights, low_light: v })}
          showTickLabels={false}
        />
        <div className={`${TEXT_XS_MUTED} mt-1`}>{Math.round((goalWeights.low_light ?? 0) * 100)}%</div>
      </div>

      <div className="mb-4">
        <div className="text-sm font-medium text-[var(--text-color)] mb-1">What is your lens budget?</div>
        <RangeSlider
          min={200}
          max={8000}
          step={50}
          singleValue={priceMax}
          onChangeSingle={(v) => onSetBudgetMax(Math.round(v))}
          format={formatCurrencyCHF}
          showTickLabels={false}
        />
        <div className={`${TEXT_XS_MUTED} mt-1`}>Up to {formatCurrencyCHF(priceMax)}</div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onContinue}>See recommendations</Button>
      </div>
    </div>
  );
}


