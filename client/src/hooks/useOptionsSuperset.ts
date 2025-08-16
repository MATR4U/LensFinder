// NOTE: no React/hooks used here; keep pure TS
import { ANY } from '../lib/constants';

type Caps = {
  brands?: string[];
  lensTypes?: string[];
  coverage?: string[];
};

export function useOptionsSuperset(args: { caps: Caps | undefined; brandsForCamera?: string[] }) {
  const supBrands = args.caps?.brands || args.brandsForCamera || [ANY];
  const supLensTypes = args.caps?.lensTypes || [ANY, 'Prime', 'Zoom'];
  const supCoverage = args.caps?.coverage || [ANY, 'Full Frame', 'APS-C'];
  return { supBrands, supLensTypes, supCoverage } as const;
}


