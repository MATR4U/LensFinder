import React from 'react';
import Section from '../ui/Section';
import BuildCapabilities from './BuildCapabilities';
import { useFilterStore } from '../../stores/filterStore';
import { BUILD_STAGE_BINDINGS, useFilterBindings } from '../../hooks/useStoreBindings';
import type { Camera, Lens } from '../../types';

export default function BuildStage({
  cameras,
  brandsForCamera,
  resultsCount,
}: {
  cameras: Camera[];
  brandsForCamera: string[];
  resultsCount: number;
}) {
  const { continueTo, captureStageBaseline } = useFilterBindings(BUILD_STAGE_BINDINGS);
  return (
    <Section title="Build and Capabilities">
      <BuildCapabilities
        cameras={cameras}
        brandsForCamera={brandsForCamera}
        resultsCount={resultsCount}
        onContinue={() => {
          captureStageBaseline(2);
          continueTo(2);
        }}
      />
    </Section>
  );
}


