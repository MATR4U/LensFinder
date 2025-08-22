import React, { useState } from 'react';
import { useDebouncedReport } from '../hooks/useDebouncedReport';
import { PlotProvider } from '../context/PlotProvider';
// TODO: Re-introduce Card if we need additional container UI here
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
// const LazyProRequirements = React.lazy(() => import('../components/flow/ProRequirements')); // TODO: prefetch on hover
// const LazySimpleRequirements = React.lazy(() => import('../components/flow/SimpleRequirements')); // TODO: prefetch on hover
import { shallow } from 'zustand/shallow';
import { useBootstrap } from '../hooks/useBootstrap';
// import { resultId } from '../lib/ids';
import { useFilterStore } from '../stores/filterStore';
import { SECTION_STACK, TEXT_XS_MUTED, STACK_Y } from '../components/ui/styles';
import { PageShell } from '../layout';
// import Loading from '../components/ui/Loading';
import CollapsibleMessage from '../components/ui/CollapsibleMessage';
import OutageScreen from '../components/ui/OutageScreen';
const DebugInspector = React.lazy(() => import('../components/flow/DebugInspector'));
import MessageTwoColumn from '../components/ui/MessageTwoColumn';
import { useUrlFiltersSync } from '../hooks/useUrlFiltersSync';
import { useAppData } from '../hooks/useAppData';
import ModeStage from '../components/flow/ModeStage';
import EssentialsStep from '../components/flow/EssentialsStep';
import PrioritiesStep from '../components/flow/PrioritiesStep';
import CompareStage from '../components/flow/CompareStage';
import ReportStage from '../components/flow/ReportStage';
import CompareTray from '../components/flow/CompareTray';

export default function App() {
  useUrlFiltersSync();
  const { cameras, lenses, fatalError } = useBootstrap();
  const isPro = useFilterStore(s => s.isPro);
  const goalPreset = useFilterStore(s => s.goalPreset);
  const goalWeights = useFilterStore(s => s.goalWeights, shallow);
  // TODO: enable when needed in UI
  // const focalChoice = useFilterStore(s => s.focalChoice);
  // const subjectDistanceM = useFilterStore(s => s.subjectDistanceM);
  // const compareList = useFilterStore(s => s.compareList);
  // const selected = useFilterStore(s => s.selected);
  // const report = useFilterStore(s => s.report);
  const setReport = useFilterStore(s => s.setReport);

  // Journey state: 0 mode, 1 build/capabilities, 2 requirements, 3 compare/top, 4 report
  const stage = useFilterStore(s => s.stage);
  // const continueTo = useFilterStore(s => s.continueTo); // not used here directly
  // const captureStageBaseline = useFilterStore(s => s.captureStageBaseline);
  // const resetToStageBaseline = useFilterStore(s => s.resetToStageBaseline);
  const modeRef = React.useRef<HTMLDivElement | null>(null);
  const compareRef = React.useRef<HTMLDivElement | null>(null);
  const reportRef = React.useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const { camera: cam2, results, resultsForGrid, debugCounts, debugDist, debugPerCam } = useAppData(cameras, lenses);
  const camera = cam2;

  const [showDebug, setShowDebug] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return import.meta.env.DEV && params.get('debug') === '1';
  });

  // Auto-generate report whenever inputs/results change (debounced)
  useDebouncedReport({ camera, results, isPro, goalPreset, setReport });

  // const appReady = cameras.length > 0 && lenses.length > 0;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const forceOutage = (typeof window !== 'undefined' && typeof window.__FORCE_OUTAGE__ !== 'undefined') ? (window as any).__FORCE_OUTAGE__ : false;

  return (
    <PlotProvider>
      <PageShell
        title="Camera System Builder"
        metaDescription="Find your perfect lens setup—fast."
        headerSlot={(
          <div className={STACK_Y}>
            <p className={TEXT_XS_MUTED}>Find your perfect lens setup—fast.</p>
          </div>
        )}
        subheaderSlot={(
          <CollapsibleMessage variant="info" title="About this tool & how it works" defaultOpen={false} className="w-full">
            <MessageTwoColumn
              leftTitle="What this tool does"
              rightTitle="How it works"
              variant="info"
              bare
              left={(
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Evaluates lenses for your camera and goals</li>
                  <li>Visualizes trade-offs (price, weight, performance)</li>
                  <li>Helps shortlist and compare up to three picks</li>
                </ul>
              )}
              right={(
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>Choose your mode</li>
                  <li>Set build &amp; capabilities</li>
                  <li>Refine filters</li>
                  <li>Add up to 3 lenses to compare</li>
                  <li>View the report for a clear recommendation</li>
                </ol>
              )}
            />
          </CollapsibleMessage>
        )}
        actionsSlot={(
          showDebug ? (
            <div className="flex items-center gap-2">
              <button className="rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent text-xs px-2 py-1 bg-[var(--control-bg)] border border-[var(--control-border)] text-[var(--text-color)] hover:bg-[color-mix(in_oklab,var(--control-bg),white_8%)]" onClick={() => setShowDebug(v => !v)}>
                Hide debug
              </button>
            </div>
          ) : null
        )}
      >

        {(fatalError || forceOutage) && (
          <OutageScreen title="Service temporarily unavailable" message={fatalError || 'Reconnecting…'} />
        )}

        <div className={SECTION_STACK}>
          {import.meta.env.DEV && showDebug && debugCounts && (
            <React.Suspense fallback={null}>
              <DebugInspector
                open
                counts={debugCounts}
                cameraMount={camera?.mount}
                distributions={debugDist || undefined}
                perCameraCounts={debugPerCam || undefined}
              />
            </React.Suspense>
          )}
          <AnimatePresence initial={false} mode="wait">
            {stage === 0 && (
              <motion.div key="mode-section" ref={modeRef} initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
                <ModeStage />
              </motion.div>
            )}

            {stage === 1 && (
              <motion.div key="essentials-step" initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
                <EssentialsStep />
              </motion.div>
            )}

            {stage === 2 && (
              <motion.div key="priorities-step" initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
                <PrioritiesStep />
              </motion.div>
            )}

            {stage === 3 && (
              <motion.div key="compare-or-top" ref={compareRef} initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
                <CompareStage camera={camera} resultsForGrid={resultsForGrid} results={results} />
              </motion.div>
            )}

            {stage === 4 && (
              <motion.div key="report-section" ref={reportRef} initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
                <ReportStage camera={camera} goalWeights={goalWeights} results={results} />
              </motion.div>
            )}
          </AnimatePresence>

          {(stage === 3 || stage === 4) && <CompareTray />}
        </div>
      </PageShell>
    </PlotProvider>
  );
}

// Compare tray extracted into flow/CompareTray.tsx


