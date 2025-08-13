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
import { computeDebugCounts, computeDebugDistributions, computeDebugPerCameraCounts } from '../lib/debugCounts';
import { useFilterStore } from '../stores/filterStore';
import { APP_BACKGROUND, PAGE_CONTAINER, SECTION_STACK, CARD_BASE, CARD_ERROR, CARD_WARNING, TITLE_H1, TITLE_H2, TEXT_SM, TEXT_XS_MUTED, SECTION_TITLE, ROW_BETWEEN, ROW_END, STACK_Y, BADGE_COUNT } from '../components/ui/styles';
import PageBase from '../components/pages/PageBase';
import Loading from '../components/ui/Loading';
import Button from '../components/ui/Button';
import CollapsibleMessage from '../components/ui/CollapsibleMessage';
import StatusBanner from '../components/ui/StatusBanner';
import OutageScreen from '../components/ui/OutageScreen';
import DebugFilterPanel from '../components/DebugFilterPanel';

export default function App() {
  const { cameras, lenses, fatalError, setFatalError, degraded, isPaused, pauseRetries, resumeRetries, retryNow } = useBootstrap();
  const [showRecovered, setShowRecovered] = React.useState(false);
  const prevDegradedRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    const prev = prevDegradedRef.current;
    if (prev && !degraded) {
      setShowRecovered(true);
      const t = setTimeout(() => setShowRecovered(false), 2000);
      return () => clearTimeout(t);
    }
    prevDegradedRef.current = degraded || null;
  }, [degraded]);
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
  const compareList = useFilterStore(s => s.compareList);
  const selected = useFilterStore(s => s.selected);
  const report = useFilterStore(s => s.report);
  const setReport = useFilterStore(s => s.setReport);
  const pushHistory = useFilterStore(s => s.pushHistory);
  const [priceOverrides, setPriceOverrides] = useState<Record<string, string>>({});
  // History now lives in the store

  // Journey state: 0 mode, 1 requirements, 2 compare/top, 3 report
  const stage = useFilterStore(s => s.stage);
  const continueTo = useFilterStore(s => s.continueTo);
  const modeRef = React.useRef<HTMLDivElement | null>(null);
  const reqRef = React.useRef<HTMLDivElement | null>(null);
  const compareRef = React.useRef<HTMLDivElement | null>(null);
  const reportRef = React.useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

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
    });
    return filtered.length;
  }, [lenses, camera, cameraName, brand, lensType, sealed, isMacro, priceRange, weightRange, proCoverage, proFocalMin, proFocalMax, proMaxApertureF, proRequireOIS, proRequireSealed, proRequireMacro, proPriceMax, proWeightMax, proDistortionMaxPct, proBreathingMinScore, softPrice, softWeight, softDistortion, softBreathing]);
  const results: Result[] = useMemo(() => {
    const filters = {
      cameraName,
      brand, lensType, sealed, isMacro, priceRange, weightRange,
      proCoverage, proFocalMin, proFocalMax, proMaxApertureF,
      proRequireOIS, proRequireSealed, proRequireMacro,
      proPriceMax, proWeightMax, proDistortionMaxPct, proBreathingMinScore,
      goalWeights, focalChoice, isPro, subjectDistanceM,
      softPrice, softWeight,
      softDistortion, softBreathing,
    };
    const res = resultsSelector(lenses, camera, filters);
    return res;
  }, [resultsSelector, lenses, camera, cameraName, brand, lensType, sealed, isMacro, priceRange, weightRange, proCoverage, proFocalMin, proFocalMax, proMaxApertureF, proRequireOIS, proRequireSealed, proRequireMacro, proPriceMax, proWeightMax, proDistortionMaxPct, proBreathingMinScore, goalWeights, focalChoice, isPro, subjectDistanceM, softPrice, softWeight, softDistortion, softBreathing]);

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
    <PageBase title="Camera System Builder" metaDescription="Find your perfect lens setup—fast.">
        <header className={`${ROW_BETWEEN} mb-8`}>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[var(--accent)]/20 border border-[var(--accent)]/30 grid place-items-center text-[var(--accent)] font-bold">CF</div>
            <div>
              <h1 className={TITLE_H1}>Camera System Builder</h1>
              <p className={TEXT_XS_MUTED}>Find your perfect lens setup—fast.</p>
            </div>
          </div>
          {/* Minimal header; journey uses section titles */}
        </header>

        {(fatalError || forceOutage) && (
          <OutageScreen title="Service temporarily unavailable" message={fatalError || 'Reconnecting…'} />
        )}

        {showRecovered && (
          <div className="mb-4">
            <StatusBanner variant="info" title="Recovered" message="All services are available again." />
          </div>
        )}

        {degraded && (
          <div className="mb-4">
            <StatusBanner
              variant="warning"
              title="Limited availability"
              message={degraded}
              onRetry={() => retryNow()}
              pausedControls={{ isPaused, onPause: pauseRetries, onResume: resumeRetries }}
              copyText={`cameraName=${cameraName}; isPro=${isPro}; brand=${brand}; lensType=${lensType}; sealed=${sealed}; macro=${isMacro}; p=${priceRange.min}-${priceRange.max}; w=${weightRange.min}-${weightRange.max}; coverage=${proCoverage}; focal=${proFocalMin}-${proFocalMax}; ap<=${proMaxApertureF}; ois=${proRequireOIS}; wsealed=${proRequireSealed}; macroReq=${proRequireMacro}; pmax=${proPriceMax}; wmax=${proWeightMax}; dist<=${proDistortionMaxPct}; breath>=${proBreathingMinScore}`}
            />
          </div>
        )}

        <div className={`${ROW_BETWEEN} mb-4`}>
          <span className={BADGE_COUNT}>{resultsCount} results</span>
          {import.meta.env.DEV && (
            <div className="flex items-center gap-2">
              {debugCounts && (
                <span className="text-[10px] text-[var(--text-muted)]">
                  m:{debugCounts.mount} b:{debugCounts.brand} t:{debugCounts.type} s:{debugCounts.sealed} m:{debugCounts.macro} pr:{debugCounts.priceRange} w:{debugCounts.weightRange} cov:{debugCounts.coverage} f:{debugCounts.focal} ap:{debugCounts.aperture} ois:{debugCounts.ois} ws:{debugCounts.proSealed} mc:{debugCounts.proMacro} pmax:{debugCounts.proPriceMax} wmax:{debugCounts.proWeightMax} dist:{debugCounts.distortion} br:{debugCounts.breathing}
                </span>
              )}
              <Button variant="secondary" size="xs" onClick={() => setShowDebug(v => !v)}>
                {showDebug ? 'Hide debug' : 'Show debug'}
              </Button>
            </div>
          )}
        </div>

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
                <div className={SECTION_TITLE}>Choose your mode</div>
                <ModeSelect onContinue={() => continueTo(1)} />
              </motion.div>
            )}

            {stage === 1 && (
              <motion.div key="requirements-section" ref={reqRef} initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
                <div className={SECTION_TITLE}>Set your filters</div>
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
                      onContinue={() => continueTo(2)}
                    />
                  ) : (
                    <LazySimpleRequirements
                      cameras={cameras}
                      brandsForCamera={brandsForCamera}
                      camera={camera}
                      cameraName={cameraName}
                      lenses={lenses}
                      resultsCount={resultsCount}
                      onContinue={() => continueTo(2)}
                    />
                  )}
                </React.Suspense>
              </motion.div>
            )}

            {(stage === 2 || stage > 2) && (
              <motion.div key="compare-or-top" ref={compareRef} initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }} transition={{ duration: 0.18, ease: 'easeOut' }} className={STACK_Y}>
                <div className="mb-1 text-lg font-semibold text-[var(--text-color)]">Compare</div>
                <ExploreGrid items={results} />
                <CompareShowdown
                  camera={camera}
                  selected={results.filter(r => compareList.includes(r.name))}
                />
                <div className={ROW_END}>
                  <Button onClick={() => continueTo(3)}>View Report</Button>
                </div>
              </motion.div>
            )}

            {stage === 3 && (
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
                    onEditPreferences={() => { continueTo(1); }}
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


