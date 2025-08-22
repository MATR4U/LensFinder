import React from 'react';
import { Section } from '../../layout';
import BuildCapabilities from './BuildCapabilities';
import { BUILD_STAGE_BINDINGS, useFilterBindings } from '../../hooks/useStoreBindings';
import type { Camera } from '../../types';

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


