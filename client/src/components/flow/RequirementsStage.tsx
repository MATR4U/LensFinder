import React from 'react';
import { Section, Modal, BADGE_COUNT } from '../../layout';
import ModeCard from './ModeCard';
import Button from '../ui/Button';
import Loading from '../ui/Loading';
import { useFilterStore } from '../../stores/filterStore';
import { REQ_STAGE_BINDINGS, useFilterBindings } from '../../hooks/useStoreBindings';
import type { Camera, Lens } from '../../types';

const LazyProRequirements = React.lazy(() => import('./ProRequirements'));
const LazySimpleRequirements = React.lazy(() => import('./SimpleRequirements'));

export default function RequirementsStage({
  cameras,
  brandsForCamera,
  camera,
  cameraName,
  lenses,
  resultsCount,
}: {
  cameras: any[];
  brandsForCamera: string[];
  camera: Camera | undefined;
  cameraName: string;
  lenses: Lens[];
  resultsCount: number;
}) {
  const [helpOpen, setHelpOpen] = React.useState(false);
  const { isPro, continueTo } = useFilterBindings(REQ_STAGE_BINDINGS);
  return (
    <Section title="Your requirements" actions={(
      <div className="flex items-center gap-2">
        <span className={BADGE_COUNT}>Showing {resultsCount} matches</span>
        <Button variant="secondary" size="sm" onClick={() => { useFilterStore.getState().resetToStageBaseline(2); }}>Reset filters</Button>
        <Button variant="secondary" size="sm" onClick={() => setHelpOpen(true)} title="How to use hard specs">?</Button>
      </div>
    )}>
      <React.Suspense fallback={<Loading text="Loading requirements…" />}>
        <ModeCard />
        {isPro ? (
          <LazyProRequirements
            cameras={cameras}
            brandsForCamera={brandsForCamera}
            camera={camera}
            cameraName={cameraName}
            lenses={lenses}
            resultsCount={resultsCount}
            onContinue={() => continueTo(3)}
          />
        ) : (
          <LazySimpleRequirements
            cameras={cameras}
            brandsForCamera={brandsForCamera}
            camera={camera}
            cameraName={cameraName}
            lenses={lenses}
            resultsCount={resultsCount}
            onContinue={() => continueTo(3)}
          />
        )}
      </React.Suspense>
      <Modal open={helpOpen} title="How to use hard specs" onClose={() => setHelpOpen(false)}>
        <ul>
          <li><strong>Coverage</strong>: Choose FF/APS‑C/Any to match your camera’s sensor.</li>
          <li><strong>Focal range</strong>: Set the range you need. Results must cover your min..max.</li>
          <li><strong>Max aperture</strong>: Pick the fastest f‑stop you’re comfortable with.</li>
          <li><strong>Price/Weight</strong>: Use ranges to fit budget and portability. Soft mode treats them as preferences.</li>
          <li><strong>Video constraints</strong>: Limit distortion and set a minimum focus‑breathing score.</li>
          <li><strong>Modes</strong>: Off disables a filter; Soft prefers but doesn’t exclude; Req filters strictly.</li>
        </ul>
      </Modal>
    </Section>
  );
}


