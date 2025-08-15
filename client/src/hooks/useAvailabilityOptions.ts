import React from 'react';
import { useFilterStore } from '../stores/filterStore';
import { getCachedSnapshot } from '../lib/data';
import { makeAvailabilitySelector } from '../lib/selectors';
import type { Camera, Lens } from '../types';

export function useAvailabilityOptions(args: { cameras: Camera[] }) {
	const { cameraName, brand, lensType, sealed, isMacro, coverage } = useFilterStore(s => ({
		cameraName: s.cameraName,
		brand: s.brand,
		lensType: s.lensType,
		sealed: s.sealed,
		isMacro: s.isMacro,
		coverage: s.proCoverage,
	}));
	const lenses = (getCachedSnapshot().lenses || []) as Lens[];
	const camera = React.useMemo(() => (cameraName === 'Any' ? undefined : args.cameras.find(c => c.name === cameraName)), [args.cameras, cameraName]);
	const availabilitySelector = React.useMemo(() => makeAvailabilitySelector(), []);
	const dynamicAvail = React.useMemo(() => availabilitySelector(
		cameraName,
		camera as Camera | undefined,
		lenses,
		{
			cameraName,
			brand,
			lensType,
			sealed,
			isMacro,
			priceRange: { min: 0, max: 1_000_000 },
			weightRange: { min: 0, max: 100_000 },
			proCoverage: coverage,
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
		}
	), [availabilitySelector, cameraName, camera, lenses, brand, lensType, sealed, isMacro, coverage]);
	return { camera, dynamicAvail, lenses } as const;
}


