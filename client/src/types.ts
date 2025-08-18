export type Sensor = {
  name: string;
  width_mm: number;
  height_mm: number;
  coc_mm: number;
  crop: number;
};

export type Camera = {
  name: string;
  brand: string;
  mount: string;
  sensor: Sensor;
  ibis: boolean;
  price_chf: number;
  weight_g: number;
  source_url: string;
};

export type Lens = {
  name: string;
  brand: string;
  mount: string;
  coverage: string;
  focal_min_mm: number;
  focal_max_mm: number;
  aperture_min: number;
  aperture_max: number;
  weight_g: number;
  ois: boolean;
  price_chf: number;
  weather_sealed: boolean;
  is_macro: boolean;
  distortion_pct: number;
  focus_breathing_score: number;
  source_url: string;
};

export type GoalWeights = Record<string, number>;

export type Result = Lens & {
  focal_used_mm: number;
  max_aperture_at_focal: number;
  eq_focal_ff_mm: number;
  fov_h_deg: number;
  dof_total_m: number;
  stabilization: string;
  score_total: number;
  why_recommended?: { key: string; label: string; weight: number }[];
};


