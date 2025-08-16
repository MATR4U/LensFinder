import React from 'react';
import GoalPresetWeights from '../../ui/fields/GoalPresetWeights';
import LabeledPresetCombiner from '../../ui/fields/LabeledPresetCombiner';
import { PRESETS } from '../../../lib/recommender';
import { useFilterBindings, PRO_REQ_BINDINGS } from '../../../hooks/useStoreBindings';

export default function GoalsHeader() {
  const { goalPreset, setGoalPreset, goalWeights, setGoalWeights } = useFilterBindings(PRO_REQ_BINDINGS);
  return (
    <div className="mb-2">
      <GoalPresetWeights
        preset={goalPreset}
        onChangePreset={setGoalPreset}
        weights={goalWeights}
        onChangeWeights={setGoalWeights}
        presets={PRESETS}
        showWeights={true}
        optionSuffixMap={undefined}
      />
      <div className="mt-2">
        <LabeledPresetCombiner
          presets={PRESETS}
          onApplyBlend={(w) => {
            setGoalPreset('Custom');
            setGoalWeights(w);
          }}
          infoText="Blend multiple presets and apply the averaged weights."
        />
      </div>
    </div>
  );
}


