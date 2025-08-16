import { useMemo } from 'react';
import { shallow } from 'zustand/shallow';
import { useFilterStore } from '../stores/filterStore';
import { makeBrandsForCamera, makeResultsSelector } from '../lib/selectors';
import { computeDebugCounts, computeDebugDistributions, computeDebugPerCameraCounts } from '../lib/debugCounts';
import { useAvailabilityCapsSync } from './useAvailabilityCapsSync';
import { useBuildResultsCount, useResultsCount } from './useResultsCount';
import type { Camera, Lens, Result } from '../types';

export function useAppData(cameras: Camera[], lenses: Lens[]) {
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

  const camera = useMemo(() => (cameraName === 'Any' ? undefined : cameras.find((c) => c.name === cameraName)), [cameras, cameraName]);
  const brandsSelector = useMemo(() => makeBrandsForCamera(), []);
  const brandsForCamera = useMemo(() => brandsSelector(lenses, camera), [brandsSelector, lenses, camera]);

  useAvailabilityCapsSync(lenses);

  const resultsSelector = useMemo(() => makeResultsSelector(), []);

  const buildResultsCount = useBuildResultsCount({
    lenses,
    camera,
    s: { cameraName, brand, lensType, sealed, isMacro, priceRange, weightRange, proCoverage, proRequireOIS, proRequireSealed, proRequireMacro },
  });

  const resultsCount = useResultsCount({
    lenses,
    camera,
    s: {
      cameraName,
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
      softPrice,
      softWeight,
      softDistortion,
      softBreathing,
      enablePrice,
      enableWeight,
      enableDistortion,
      enableBreathing,
    },
  });

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
      enablePrice, enableWeight, enableDistortion, enableBreathing,
    } as any;
    return resultsSelector(lenses, camera, filters);
  }, [resultsSelector, lenses, camera, cameraName, brand, lensType, sealed, isMacro, priceRange, weightRange, proCoverage, proFocalMin, proFocalMax, proMaxApertureF, proRequireOIS, proRequireSealed, proRequireMacro, proPriceMax, proWeightMax, proDistortionMaxPct, proBreathingMinScore, goalWeights, focalChoice, isPro, subjectDistanceM, softPrice, softWeight, softDistortion, softBreathing, enablePrice, enableWeight, enableDistortion, enableBreathing]);

  const resultsForGrid: Result[] = useMemo(() => {
    const smoke = (import.meta as any)?.env?.VITE_E2E_SMOKE === '1' || (import.meta as any)?.env?.VITE_E2E_SMOKE === 'true';
    if (!smoke || results.length > 0) return results;
    const relaxed = resultsSelector(lenses, camera, {
      cameraName,
      brand: 'Any',
      lensType: 'Any',
      sealed: false,
      isMacro: false,
      priceRange: { min: 0, max: 1_000_000 },
      weightRange: { min: 0, max: 100_000 },
      proCoverage: 'Any',
      proFocalMin: 0,
      proFocalMax: 9999,
      proMaxApertureF: 99,
      proRequireOIS: false,
      proRequireSealed: false,
      proRequireMacro: false,
      proPriceMax: 1_000_000,
      proWeightMax: 100_000,
      proDistortionMaxPct: 100,
      proBreathingMinScore: 0,
      goalWeights: goalWeights || { low_light: 0.5, background_blur: 0.5, reach: 0.5, wide: 0.5, portability: 0.5, value: 0.5, distortion_control: 0.3, video_excellence: 0.3 },
      focalChoice: focalChoice || 50,
      isPro: !!isPro,
      subjectDistanceM: subjectDistanceM || 3.0,
      softPrice: true,
      softWeight: true,
      softDistortion: true,
      softBreathing: true,
      enablePrice: false,
      enableWeight: false,
      enableDistortion: false,
      enableBreathing: false,
    } as any);
    return relaxed.slice(0, 12);
  }, [results, resultsSelector, lenses, camera, cameraName, goalWeights, focalChoice, isPro, subjectDistanceM]);

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

  return {
    cameraName,
    isPro,
    goalPreset,
    goalWeights,
    focalChoice,
    subjectDistanceM,
    compareList,
    selected,
    report,
    setReport,
    camera,
    brandsForCamera,
    buildResultsCount,
    resultsCount,
    results,
    resultsForGrid,
    debugCounts,
    debugDist,
    debugPerCam,
  } as const;
}


