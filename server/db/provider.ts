export type Camera = {
  id: number;
  name: string;
  brand: string;
  mount: string;
  sensor_name: string | null;
  sensor_width_mm: number | null;
  sensor_height_mm: number | null;
  sensor_coc_mm: number | null;
  sensor_crop: number | null;
  ibis: boolean | number;
  price_chf: number | null;
  weight_g: number | null;
  source_url: string | null;
};

export type Lens = {
  id: number;
  name: string;
  brand: string;
  mount: string;
  coverage: string;
  focal_min_mm: number | null;
  focal_max_mm: number | null;
  aperture_min: number | null;
  aperture_max: number | null;
  weight_g: number | null;
  ois: boolean | number;
  price_chf: number | null;
  weather_sealed: boolean | number;
  is_macro: boolean | number;
  distortion_pct: number | null;
  focus_breathing_score: number | null;
  source_url: string | null;
};

const useFileRepo = (process.env.VITEST === '1' || process.env.VITEST === 'true' || process.env.NODE_ENV === 'test');

let implPromise: Promise<{
  getAllCameras: (limit?: number, offset?: number) => Promise<Camera[]>;
  getAllLenses: (limit?: number, offset?: number) => Promise<Lens[]>;
  getCounts: () => Promise<{ cameras: number; lenses: number }>;
}>;

if (useFileRepo) {
  implPromise = import('./fileRepo.js') as any;
} else {
  implPromise = (async () => {
    const { pgFindAllCameras, pgFindAllLenses, pgCountCameras, pgCountLenses } = await import('./pg.js');
    return {
      getAllCameras: (limit?: number, offset?: number) => pgFindAllCameras(limit, offset),
      getAllLenses: (limit?: number, offset?: number) => pgFindAllLenses(limit, offset),
      getCounts: async () => {
        const [cameras, lenses] = await Promise.all([pgCountCameras(), pgCountLenses()]);
        return { cameras, lenses };
      }
    };
  })();
}

export async function getAllCameras(limit?: number, offset?: number): Promise<Camera[]> {
  const impl = await implPromise;
  return impl.getAllCameras(limit, offset);
}

export async function getAllLenses(limit?: number, offset?: number): Promise<Lens[]> {
  const impl = await implPromise;
  return impl.getAllLenses(limit, offset);
}

export async function getCounts(): Promise<{ cameras: number; lenses: number }> {
  const impl = await implPromise;
  return impl.getCounts();
}


