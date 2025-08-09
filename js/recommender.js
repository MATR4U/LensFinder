import { optics } from './optics.js';

export const recommender = {
  DEFAULT_STOPS_IF_OIS: 3.5,
  PRESETS: {
    Balanced: { low_light: 0.5, background_blur: 0.5, reach: 0.5, wide: 0.5, portability: 0.5, value: 0.5, distortion_control: 0.3, video_excellence: 0.3 },
    Portrait: { low_light: 0.8, background_blur: 1.0, reach: 0.2, wide: 0.0, portability: 0.2, value: 0.2, distortion_control: 0.4, video_excellence: 0.1 },
    Landscape: { low_light: 0.2, background_blur: 0.1, reach: 0.0, wide: 1.0, portability: 0.3, value: 0.3, distortion_control: 0.8, video_excellence: 0.1 },
    Architecture: { low_light: 0.2, background_blur: 0.0, reach: 0.0, wide: 1.0, portability: 0.2, value: 0.2, distortion_control: 1.0, video_excellence: 0.1 },
    Sports: { low_light: 0.5, background_blur: 0.5, reach: 1.0, wide: 0.0, portability: 0.1, value: 0.2, distortion_control: 0.2, video_excellence: 0.4 },
    Travel: { low_light: 0.4, background_blur: 0.3, reach: 0.4, wide: 0.4, portability: 1.0, value: 0.5, distortion_control: 0.5, video_excellence: 0.3 },
    Street: { low_light: 0.7, background_blur: 0.5, reach: 0.1, wide: 0.5, portability: 1.0, value: 0.4, distortion_control: 0.6, video_excellence: 0.2 },
    'Video/Vlog': { low_light: 0.4, background_blur: 0.3, reach: 0.1, wide: 1.0, portability: 0.8, value: 0.4, distortion_control: 0.5, video_excellence: 1.0 },
    Astrophotography: { low_light: 1.0, background_blur: 0.1, reach: 0.0, wide: 1.0, portability: 0.1, value: 0.3, distortion_control: 0.7, video_excellence: 0.0 },
    'Low Light': { low_light: 1.0, background_blur: 0.7, reach: 0.1, wide: 0.1, portability: 0.2, value: 0.2, distortion_control: 0.3, video_excellence: 0.1 }
  },
  isZoom(lens) { return lens.focal_min_mm !== lens.focal_max_mm; },
  maxApertureAt(lens, focal_mm) {
    if (!this.isZoom(lens) || Math.abs(lens.aperture_min - lens.aperture_max) < 1e-6) return lens.aperture_min;
    const ratio = (focal_mm - lens.focal_min_mm) / (lens.focal_max_mm - lens.focal_min_mm);
    const clampedRatio = Math.min(Math.max(ratio, 0.0), 1.0);
    return lens.aperture_min + clampedRatio * (lens.aperture_max - lens.aperture_min);
  },
  scoreLens(lens, camera, goal_weights, focal_choice_mm) {
    const maxAperture = this.maxApertureAt(lens, focal_choice_mm);
    let low_light = optics.lightGatheringScore(focal_choice_mm, maxAperture);
    if (lens.ois || camera.ibis) low_light *= optics.stabilizationBonus(this.DEFAULT_STOPS_IF_OIS);
    const background_blur = optics.lightGatheringScore(focal_choice_mm, maxAperture);
    const equiv_wide = optics.equivFocalFf(lens.focal_min_mm, camera.sensor);
    const equiv_tele = optics.equivFocalFf(lens.focal_max_mm, camera.sensor);
    const reach = Math.max(0.0, equiv_tele - 100);
    const wide = Math.max(0.0, 35 - equiv_wide);
    const portability = 1000 / (lens.weight_g + 100);
    const value = 5000 / (lens.price_chf + 200);
    const distortion_control = 10 / (Math.abs(lens.distortion_pct) + 1);
    const video_excellence = lens.focus_breathing_score;
    const raw = { low_light, background_blur, reach, wide, portability, value, distortion_control, video_excellence };
    let total = 0;
    for (const key in raw) total += (raw[key] || 0) * (goal_weights[key] || 0.0);
    raw.total = total;
    return raw;
  }
};


