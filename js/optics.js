export const optics = {
  fovDeg(sensor, focal_mm) {
    const h = 2 * (180 / Math.PI) * Math.atan(sensor.width_mm / (2 * focal_mm));
    const v = 2 * (180 / Math.PI) * Math.atan(sensor.height_mm / (2 * focal_mm));
    const d = 2 * (180 / Math.PI) * Math.atan(Math.hypot(sensor.width_mm, sensor.height_mm) / (2 * focal_mm));
    return { h, v, d };
  },
  hyperfocalMm(focal_mm, f_number, coc_mm) {
    return (focal_mm * focal_mm) / (f_number * coc_mm) + focal_mm;
  },
  depthOfFieldMm(focal_mm, f_number, coc_mm, subject_distance_mm) {
    const H = this.hyperfocalMm(focal_mm, f_number, coc_mm);
    const s = subject_distance_mm;
    const f = focal_mm;
    if (s <= f) return { near: 0, far: 0, total: 0 };
    const near = (H * s) / (H + (s - f));
    const far = H > s - f ? (H * s) / (H - (s - f)) : Infinity;
    const total = far !== Infinity ? far - near : Infinity;
    return { near, far, total };
  },
  equivFocalFf(focal_mm, sensor) {
    return focal_mm * sensor.crop;
  },
  lightGatheringScore(focal_mm, f_number) {
    if (f_number <= 0) return 0;
    const diameter = focal_mm / f_number;
    return Math.PI * Math.pow(diameter / 2, 2);
  },
  stabilizationBonus(stops) {
    return 1.0 + (Math.pow(2, stops) - 1.0) * 0.2;
  }
};


