export const FIELD_HELP = {
  cameraBody: 'Pick your camera body. We use its mount to filter compatible lenses and its sensor to compute field‑of‑view.',
  coverage: 'Sensor coverage to target. Full‑frame lenses are compatible with APS‑C, but APS‑C lenses can vignette on full‑frame bodies.',
  price: 'Budget range in CHF. Lower caps results to cheaper lenses; higher allows premium lenses.',
  weight: 'Weight range in grams. Lower favors lighter, more portable lenses; higher allows heavier pro glass.',
  focalRange: 'Desired focal range in mm. Lower minimum adds ultra‑wide; higher maximum adds more tele reach. Leaving full range avoids restricting focal lengths.',
  maxAperture: 'Require at least this maximum aperture (speed). Lower f‑numbers are faster (more light and background blur); higher numbers allow slower lenses.',
  distortionMax: 'Maximum geometric distortion (barrel/pincushion). Lower keeps straighter lines; higher permits more distortion to widen options.',
  breathingMin: 'Minimum focus breathing score (0–10). Higher values mean less breathing—better for video and focus pulls.',
  requireOIS: 'Optical Image Stabilization requirement. When enabled, only lenses with OIS are included—useful for low light or bodies without IBIS.',
  goalPreset: 'High‑level preference profile (e.g., Portrait, Travel). It sets scoring weights behind the scenes. Choose Custom to fine‑tune each weight.',
};

export const GOAL_WEIGHT_HELP: Record<string, string> = {
  low_light: 'Preference for low‑light performance. Higher favors faster lenses and stabilization; lower deprioritizes light gathering.',
  background_blur: 'Preference for strong background blur (bokeh). Higher favors large apertures at your chosen focal length.',
  reach: 'Preference for telephoto reach. Higher favors longer focal lengths; lower won’t bias toward tele.',
  wide: 'Preference for wide‑angle capability. Higher favors shorter focal lengths; lower won’t bias wide.',
  portability: 'Preference for compact/light lenses. Higher prioritizes lighter options; lower allows heavier glass.',
  value: 'Preference for price‑performance. Higher prioritizes affordable lenses; lower tolerates higher prices.',
  distortion_control: 'Preference for well‑corrected geometry. Higher favors lenses with low distortion; lower allows more distortion.',
  video_excellence: 'Preference for video behavior (e.g., focus breathing). Higher favors video‑friendly lenses.',
};


