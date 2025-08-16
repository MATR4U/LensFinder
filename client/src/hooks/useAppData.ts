import { useMemo } from 'react';
import { shallow } from 'zustand/shallow';
import { useFilterStore } from '../stores/filterStore';
import { selectPrimaryAndPro } from '../stores/selectors';
import { makeBrandsForCamera, makeResultsSelector } from '../lib/selectors';
import { computeDebugCounts, computeDebugDistributions, computeDebugPerCameraCounts } from '../lib/debugCounts';
import { useAvailabilityCapsSync } from './useAvailabilityCapsSync';
import { useBuildResultsCount, useResultsCount } from './useResultsCount';
import type { Camera, Lens, Result } from '../types';

export function useAppData(cameras: Camera[], lenses: Lens[]) {
  const {
    cameraName,
    isPro,
    goalPreset,
    goalWeights,
    focalChoice,
    subjectDistanceM,
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
    compareList,
    selected,
    report,
    setReport,
  } = useFilterStore(selectPrimaryAndPro, shallow);

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


