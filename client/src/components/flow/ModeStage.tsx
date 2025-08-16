import React from 'react';
import Section from '../ui/Section';
import ModeSelect from './ModeSelect';
import { useFilterStore } from '../../stores/filterStore';
import { MODE_STAGE_BINDINGS, useFilterBindings } from '../../hooks/useStoreBindings';

export default function ModeStage() {
  const { continueTo, captureStageBaseline } = useFilterBindings(MODE_STAGE_BINDINGS);
  return (
    <Section title="Choose your mode">
      <ModeSelect onContinue={() => {
        captureStageBaseline(1, { resetOnEntry: true });
        continueTo(1);
      }} />
    </Section>
  );
}


