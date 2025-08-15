import React, { useEffect, useMemo, useState } from 'react';
import { Camera, Lens, Result } from '../types';
import Report from '../components/Report';
import { useDebouncedReport } from '../hooks/useDebouncedReport';
import type { Availability } from '../lib/availability';
import { computeGlobalAvailability } from '../lib/availability';
import { applyFilters } from '../lib/filters';
import { makeBrandsForCamera, makeAvailabilitySelector, makeResultsSelector } from '../lib/selectors';
import Card from '../components/ui/Card';
import CompareShowdown from '../components/flow/CompareShowdown';
import ExploreGrid from '../components/flow/ExploreGrid';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
const LazyProRequirements = React.lazy(() => import('../components/flow/ProRequirements'));
const LazySimpleRequirements = React.lazy(() => import('../components/flow/SimpleRequirements'));
import ModeSelect from '../components/flow/ModeSelect';
import ModeCard from '../components/flow/ModeCard';
import { shallow } from 'zustand/shallow';
import { useBootstrap } from '../hooks/useBootstrap';
import { resultId } from '../lib/ids';
import { computeDebugCounts, computeDebugDistributions, computeDebugPerCameraCounts } from '../lib/debugCounts';
import { useFilterStore } from '../stores/filterStore';
import { APP_BACKGROUND, PAGE_CONTAINER, SECTION_STACK, CARD_BASE, CARD_ERROR, CARD_WARNING, TITLE_H1, TITLE_H2, TEXT_SM, TEXT_XS_MUTED, SECTION_TITLE, ROW_BETWEEN, ROW_END, STACK_Y, BADGE_COUNT, STICKY_BOTTOM, TRAY } from '../components/ui/styles';
import Section from '../components/ui/Section';
import Modal from '../components/ui/Modal';
import PageBase from '../components/pages/PageBase';
import Loading from '../components/ui/Loading';
import Button from '../components/ui/Button';
import CollapsibleMessage from '../components/ui/CollapsibleMessage';
import StatusBanner from '../components/ui/StatusBanner';
import OutageScreen from '../components/ui/OutageScreen';
import DebugFilterPanel from '../components/DebugFilterPanel';
import BuildCapabilities from '../components/flow/BuildCapabilities';
import MessageTwoColumn from '../components/ui/MessageTwoColumn';

export default function App() {
  const { cameras, lenses, fatalError, setFatalError, degraded, isPaused, pauseRetries, resumeRetries, retryNow, offline, health } = useBootstrap();
  const cameraName = useFilterStore(s => s.cameraName);
  const isPro = useFilterStore(s => s.isPro);
  const goalPreset = useFilterStore(s => s.goalPreset);
  const goalWeights = useFilterStore(s => s.goalWeights, shallow);
  const focalChoice = useFilterStore(s => s.focalChoice);
  const subjectDistanceM = useFilterStore(s => s.subjectDistanceM);
  const brand = useFilterStore(s => s.brand);
  const lensType = useFilterStore(s => s.lensType);
  const sealed = useFilterStore(s => s.sealed);
  const isMacro = useFilterStore(s => s.isMacro);
  const priceRange = useFilterStore(s => s.priceRange, shallow);
  const weightRange = useFilterStore(s => s.weightRange, shallow);
  const proCoverage = useFilterStore(s => s.proCoverage);
  const proFocalMin = useFilterStore(s => s.proFocalMin);
  const proFocalMax = useFilterStore(s => s.proFocalMax);
  const proMaxApertureF = useFilterStore(s => s.proMaxApertureF);
  const proRequireOIS = useFilterStore(s => s.proRequireOIS);
  const proRequireSealed = useFilterStore(s => s.proRequireSealed);
  const proRequireMacro = useFilterStore(s => s.proRequireMacro);
  const proPriceMax = useFilterStore(s => s.proPriceMax);
  const proWeightMax = useFilterStore(s => s.proWeightMax);
  const proDistortionMaxPct = useFilterStore(s => s.proDistortionMaxPct);
  const proBreathingMinScore = useFilterStore(s => s.proBreathingMinScore);
  const softPrice = useFilterStore(s => s.softPrice);
  const softWeight = useFilterStore(s => s.softWeight);
  const softDistortion = useFilterStore(s => s.softDistortion);
  const softBreathing = useFilterStore(s => s.softBreathing);
  const enablePrice = useFilterStore(s => s.enablePrice);
  const enableWeight = useFilterStore(s => s.enableWeight);
  const enableDistortion = useFilterStore(s => s.enableDistortion);
  const enableBreathing = useFilterStore(s => s.enableBreathing);
  const compareList = useFilterStore(s => s.compareList);
  const selected = useFilterStore(s => s.selected);
  const report = useFilterStore(s => s.report);
  const setReport = useFilterStore(s => s.setReport);
  const pushHistory = useFilterStore(s => s.pushHistory);
  const [priceOverrides, setPriceOverrides] = useState<Record<string, string>>({});
  // History now lives in the store

  // Journey state: 0 mode, 1 build/capabilities, 2 requirements, 3 compare/top, 4 report
  const stage = useFilterStore(s => s.stage);
  const continueTo = useFilterStore(s => s.continueTo);
  const captureStageBaseline = useFilterStore(s => s.captureStageBaseline);
  const resetToStageBaseline = useFilterStore(s => s.resetToStageBaseline);
  const modeRef = React.useRef<HTMLDivElement | null>(null);
  const reqRef = React.useRef<HTMLDivElement | null>(null);
  const compareRef = React.useRef<HTMLDivElement | null>(null);
  const reportRef = React.useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const [helpOpen, setHelpOpen] = useState(false);

  // Pro hard spec filters now come from store

  // bootstrap handled by useBootstrap

  const camera = useMemo(() => (cameraName === 'Any' ? undefined : cameras.find((c) => c.name === cameraName)), [cameras, cameraName]);
  const brandsSelector = useMemo(() => makeBrandsForCamera(), []);
  const brandsForCamera = useMemo(() => brandsSelector(lenses, camera), [brandsSelector, lenses, camera]);

  // Use global/static availability for slider min/max and ticks to avoid dynamic snapping
  const availability = useMemo<Availability | null>(() => {
    if (lenses.length === 0) return null;
    return computeGlobalAvailability(lenses);
  }, [lenses]);

  // reset handled by store.resetFilters

  // Event bus removed in favor of direct handlers passed to children

  // Provide availability caps to the store for clamping and auto-bounds
  const lastCapsSigRef = React.useRef<string | null>(null);
  const capsSyncTimerRef = React.useRef<number | null>(null);
  useEffect(() => {
    if (!availability) return;
    const nextCaps = {
      brands: availability.brands,
      lensTypes: availability.lensTypes,
      coverage: availability.coverage,
      priceBounds: availability.priceBounds,
      priceTicks: availability.priceTicks,
      weightBounds: availability.weightBounds,
      weightTicks: availability.weightTicks,
      focalBounds: availability.focalBounds,
      apertureMaxMax: availability.apertureMaxMax,
      distortionMaxMax: availability.distortionMaxMax,
      breathingMinMin: availability.breathingMinMin,
    } as const;
    // Set once per availability change; we won't auto-clamp user ranges further
    lastCapsSigRef.current = JSON.stringify(nextCaps);
    useFilterStore.getState().setBoundsFromAvailability(nextCaps);
  }, [availability]);

  // Keep explicit guided flow: do not auto-advance from mode selection.

  const resultsSelector = useMemo(() => makeResultsSelector(), []);
  // Count that ignores step-2 Requirements constraints for the Build & capabilities screen
  const buildResultsCount = useMemo(() => {
    if (lenses.length === 0) return 0;
    const filtered = applyFilters({
      lenses,
      cameraName,
      cameraMount: camera?.mount,
      brand, lensType, sealed, isMacro,
      // Use current coverage and OIS/sealed/macro hard flags only; ignore step-2 ranges
      proCoverage,
      proFocalMin: 0,
      proFocalMax: 9999,
      proMaxApertureF: 99,
      proRequireOIS,
      proRequireSealed,
      proRequireMacro,
      // Max caps to avoid constraining
      proPriceMax: 1_000_000,
      proWeightMax: 100_000,
      proDistortionMaxPct: 100,
      proBreathingMinScore: 0,
      // Do not apply ranges/preferences in this stage
      softPrice: true,
      softWeight: true,
      softDistortion: true,
      softBreathing: true,
      enablePrice: false,
      enableWeight: false,
      enableDistortion: false,
      enableBreathing: false,
      priceRange,
      weightRange,
    });
    return filtered.length;
  }, [lenses, camera, cameraName, brand, lensType, sealed, isMacro, proCoverage, proRequireOIS, proRequireSealed, proRequireMacro, priceRange, weightRange]);
  const resultsCount = useMemo(() => {
    if (lenses.length === 0) return 0;
    const filters = {
      brand, lensType, sealed, isMacro, priceRange, weightRange,
      proCoverage, proFocalMin, proFocalMax, proMaxApertureF,
      proRequireOIS, proRequireSealed, proRequireMacro,
      proPriceMax, proWeightMax, proDistortionMaxPct, proBreathingMinScore,
    };
    const filtered = applyFilters({
      lenses,
      cameraName,
      cameraMount: camera?.mount,
      ...filters,
      softPrice,
      softWeight,
      softDistortion,
      softBreathing,
      enablePrice,
      enableWeight,
      enableDistortion,
      enableBreathing,
    });
    return filtered.length;
  }, [lenses, camera, cameraName, brand, lensType, sealed, isMacro, priceRange, weightRange, proCoverage, proFocalMin, proFocalMax, proMaxApertureF, proRequireOIS, proRequireSealed, proRequireMacro, proPriceMax, proWeightMax, proDistortionMaxPct, proBreathingMinScore, softPrice, softWeight, softDistortion, softBreathing, enablePrice, enableWeight, enableDistortion, enableBreathing]);
  const results: Result[] = useMemo(() => {
    const filters = {
      cameraName,
      brand, lensType, sealed, isMacro, priceRange, weightRange,
      proCoverage, proFocalMin, proFocalMax, proMaxApertureF,
      proRequireOIS, proRequireSealed, proRequireMacro,
      proPriceMax, proWeightMax, proDistortionMaxPct, proBreathingMinScore,
      goalWeights: goalWeights || { low_light: 0.5, background_blur: 0.5, reach: 0.5, wide: 0.5, portability: 0.5, value: 0.5, distortion_control: 0.3, video_excellence: 0.3 },
      focalChoice: focalChoice || 50,
      isPro: !!isPro,
      subjectDistanceM: subjectDistanceM || 3.0,
      softPrice, softWeight,
      softDistortion, softBreathing,
    };
    const res = resultsSelector(lenses, camera, {
      ...filters,
      enablePrice,
      enableWeight,
      enableDistortion,
      enableBreathing,
    } as any);
    return res;
  }, [resultsSelector, lenses, camera, cameraName, brand, lensType, sealed, isMacro, priceRange, weightRange, proCoverage, proFocalMin, proFocalMax, proMaxApertureF, proRequireOIS, proRequireSealed, proRequireMacro, proPriceMax, proWeightMax, proDistortionMaxPct, proBreathingMinScore, goalWeights, focalChoice, isPro, subjectDistanceM, softPrice, softWeight, softDistortion, softBreathing, enablePrice, enableWeight, enableDistortion, enableBreathing]);

  // History is pushed inside store setters; no post-render push needed here

  const debugCounts = useMemo(() => {
    if (!camera || import.meta.env.PROD) return null as null | Record<string, number>;
    return computeDebugCounts({
      cameraMount: camera.mount,
      lenses,
      brand,
      lensType,
      sealed,
      isMacro,
      priceRange,
      weightRange,
      proCoverage,
      proFocalMin,
      proFocalMax,
      proMaxApertureF,
      proRequireOIS,
      proRequireSealed,
      proRequireMacro,
      proPriceMax,
      proWeightMax,
      proDistortionMaxPct,
      proBreathingMinScore,
    });
  }, [camera, lenses, brand, lensType, sealed, isMacro, priceRange, weightRange, proCoverage, proFocalMin, proFocalMax, proMaxApertureF, proRequireOIS, proRequireSealed, proRequireMacro, proPriceMax, proWeightMax, proDistortionMaxPct, proBreathingMinScore]);

  const [showDebug, setShowDebug] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return import.meta.env.DEV && params.get('debug') === '1';
  });
  const debugDist = useMemo(() => {
    if (!camera || import.meta.env.PROD) return null as null | ReturnType<typeof computeDebugDistributions>;
    return computeDebugDistributions({
      cameraName,
      cameraMount: camera.mount,
      lenses,
      brand,
      lensType,
      sealed,
      isMacro,
      priceRange,
      weightRange,
      proCoverage,
      proFocalMin,
      proFocalMax,
      proMaxApertureF,
      proRequireOIS,
      proRequireSealed,
      proRequireMacro,
      proPriceMax,
      proWeightMax,
      proDistortionMaxPct,
      proBreathingMinScore,
      softDistortion,
      softBreathing,
    });
  }, [camera, cameraName, lenses, brand, lensType, sealed, isMacro, priceRange, weightRange, proCoverage, proFocalMin, proFocalMax, proMaxApertureF, proRequireOIS, proRequireSealed, proRequireMacro, proPriceMax, proWeightMax, proDistortionMaxPct, proBreathingMinScore, softDistortion, softBreathing]);
  const debugPerCam = useMemo(() => {
    if (import.meta.env.PROD) return null as null | Record<string, number>;
    return computeDebugPerCameraCounts({
      cameras,
      lenses,
      brand,
      lensType,
      sealed,
      isMacro,
      priceRange,
      weightRange,
      proCoverage,
      proFocalMin,
      proFocalMax,
      proMaxApertureF,
      proRequireOIS,
      proRequireSealed,
      proRequireMacro,
      proPriceMax,
      proWeightMax,
      proDistortionMaxPct,
      proBreathingMinScore,
      softDistortion,
      softBreathing,
    });
  }, [cameras, lenses, brand, lensType, sealed, isMacro, priceRange, weightRange, proCoverage, proFocalMin, proFocalMax, proMaxApertureF, proRequireOIS, proRequireSealed, proRequireMacro, proPriceMax, proWeightMax, proDistortionMaxPct, proBreathingMinScore, softDistortion, softBreathing]);

  // Auto-generate report whenever inputs/results change (debounced)
  useDebouncedReport({ camera, results, isPro, goalPreset, setReport });

  // CSV export now imported from lib/csv

  // Keep rendering the app background/theme and show a fixed overlay when unavailable

  const appReady = cameras.length > 0 && lenses.length > 0;
  // Vite define injects a global at build time; safe-guard for type
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const forceOutage = (typeof window !== 'undefined' && typeof window.__FORCE_OUTAGE__ !== 'undefined') ? (window as any).__FORCE_OUTAGE__ : false;

  return (
    <PageBase
      title="Camera System Builder"
      metaDescription="Find your perfect lens setup—fast."
      headerSlot={(
        <div className={STACK_Y}>
          <p className={TEXT_XS_MUTED}>Find your perfect lens setup—fast.</p>
          {/* One-column, collapsible intro to reduce cognitive load */}
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
                <li>Visualizes trade‑offs (price, weight, performance)</li>
                <li>Helps shortlist and compare up to three picks</li>
              </ul>
            )}
            right={(
              <ol className="list-decimal pl-5 text-sm space-y-1">
                <li>Choose your mode</li>
                <li>Set build & capabilities</li>
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

      {/* No main-app retry or recovered banners; overlay handles outage UX */}

      {/* Header actions moved to PageBase actionsSlot */}

      {/* Flow content with animated transitions - render only current stage to avoid duplicates */}
      <div className={SECTION_STACK}>
        {import.meta.env.DEV && showDebug && debugCounts && (
          <DebugFilterPanel
            counts={debugCounts}
            cameraMount={camera?.mount}
            brand={brand}
            lensType={lensType}
            sealed={sealed}
            isMacro={isMacro}
            priceRange={priceRange}
            weightRange={weightRange}
            proCoverage={proCoverage}
            proFocalMin={proFocalMin}
            proFocalMax={proFocalMax}
            proMaxApertureF={proMaxApertureF}
            proRequireOIS={proRequireOIS}
            proRequireSealed={proRequireSealed}
            proRequireMacro={proRequireMacro}
            proPriceMax={proPriceMax}
            proWeightMax={proWeightMax}
            proDistortionMaxPct={proDistortionMaxPct}
            proBreathingMinScore={proBreathingMinScore}
            softDistortion={softDistortion}
            softBreathing={softBreathing}
            distributions={debugDist || undefined}
            perCameraCounts={debugPerCam || undefined}
          />
        )}
        <AnimatePresence initial={false} mode="wait">
          {stage === 0 && (
            <motion.div key="mode-section" ref={modeRef} initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
              <Section title="Choose your mode">
                <ModeSelect onContinue={() => {
                  // Entering stage 1: reset filters to defaults once and capture a clean baseline for stage 1
                  useFilterStore.getState().captureStageBaseline(1, { resetOnEntry: true });
                  continueTo(1);
                }} />
              </Section>
            </motion.div>
          )}

          {stage === 1 && (
            <motion.div key="build-capabilities" initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
              <Section title="Build and Capabilities">
                <BuildCapabilities
                  cameras={cameras}
                  brandsForCamera={brandsForCamera}
                  resultsCount={buildResultsCount}
                  onContinue={() => {
                    // Capture a baseline for stage 2 on entry, without resetting
                    useFilterStore.getState().captureStageBaseline(2);
                    continueTo(buildResultsCount <= 5 ? 3 : 2);
                  }}
                />
              </Section>
            </motion.div>
          )}

          {stage === 2 && (
            <motion.div key="requirements-section" ref={reqRef} initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
              <Section title="Set your filters" actions={(
                <div className="flex items-center gap-2">
                  <span className={BADGE_COUNT}>Showing {resultsCount} matches</span>
                  <Button variant="secondary" size="sm" onClick={() => {
                    // Reset only this stage back to its baseline
                    useFilterStore.getState().resetToStageBaseline(2);
                  }}>Reset filters</Button>
                  <Button variant="secondary" size="sm" onClick={() => setHelpOpen(true)} title="How to use hard specs">?</Button>
                </div>
              )}>
                <React.Suspense fallback={<Loading text="Loading requirements…" />}>
                  {/* Always show mode card here so user can switch modes within the Requirements step */}
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
              </Section>
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
            </motion.div>
          )}

          {stage === 3 && (
            <motion.div key="compare-or-top" ref={compareRef} initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }} transition={{ duration: 0.18, ease: 'easeOut' }} className={STACK_Y}>
              <div className="mb-1 text-lg font-semibold text-[var(--text-color)]">Compare candidates</div>
              <div className="text-sm text-[var(--text-muted)] mb-2">Add up to 3 to compare side‑by‑side.</div>
              <ExploreGrid items={results} />
              <CompareTray />
              {compareList.length >= 2 && (
                <CompareShowdown
                  camera={camera}
                  selected={results.filter(r => compareList.includes(resultId(r)))}
                />
              )}
            </motion.div>
          )}

          {stage === 4 && (
            <motion.div key="report-section" ref={reportRef} initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }} transition={{ duration: 0.18, ease: 'easeOut' }} className={STACK_Y}>
              <div className="mb-1 text-lg font-semibold text-[var(--text-color)]">Summary & decision</div>
              <CollapsibleMessage variant="info" title="How to make the call" defaultOpen={false}>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li><strong>Start</strong>: Note Top Performer, Best Value, and Best Portability badges.</li>
                  <li><strong>Chart</strong>: Prefer lenses near the top‑left (more Score for less CHF). Stay within budget.</li>
                  <li><strong>Break ties</strong>: Use Low Light, Video, Portability, and Value bars on each card.</li>
                  <li><strong>Total kit</strong>: Check combined price and weight with your camera are acceptable.</li>
                  <li><strong>Refine</strong>: Adjust weights/filters or revisit Compare to inspect candidates side‑by‑side.</li>
                </ul>
              </CollapsibleMessage>
              <Card title="Report" subtitle="Generated summary">
                <Report
                  report={report}
                  camera={camera}
                  selected={selected}
                  goalWeights={goalWeights}
                  topResults={results.slice(0, 3)}
                  onEditPreferences={() => { continueTo(2); }}
                />
              </Card>
              <div className={ROW_END}>
                <Button onClick={() => continueTo(0)}>Start Over</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Report moved into step 4 */}
      </div>
    </PageBase>
  );
}

function CompareTray() {
  const compareList = useFilterStore(s => s.compareList);
  if (compareList.length === 0) return null;
  return (
    <div className={`${STICKY_BOTTOM}`}>
      <div className={`${TRAY} flex items-center gap-3`}>
        <span className="text-xs text-[var(--text-muted)]">{compareList.length}/3 selected</span>
        <button className="px-3 py-1 rounded bg-[var(--accent)] text-[var(--accent-contrast)] text-xs hover:bg-[var(--accent-hover)] disabled:opacity-50" onClick={() => useFilterStore.getState().continueTo(3)} disabled={compareList.length < 2}>Compare</button>
        <button className="px-3 py-1 rounded border border-[var(--control-border)] text-[var(--text-color)] text-xs hover:bg-[color-mix(in_oklab,var(--control-bg),white_6%)]" onClick={() => useFilterStore.getState().continueTo(4)} disabled={compareList.length < 2}>View Report</button>
      </div>
    </div>
  );
}


