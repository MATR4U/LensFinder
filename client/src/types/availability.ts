export type Availability = {
  brands: string[];
  lensTypes: string[];
  coverage: string[];
};

export type Coverage = 'Any' | 'Full Frame' | 'APS-C';

export enum Stage {
  Mode = 0,
  Build = 1,
  Requirements = 2,
  Compare = 3,
  Report = 4,
}


