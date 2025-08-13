export const FIELD_HELP = {
  cameraBody: 'Choose your camera body. We match its mount for compatibility and use its sensor size to compute field‑of‑view.',
  coverage: 'Match lens format to your sensor. Full‑frame lenses work on APS‑C; APS‑C lenses can vignette on full‑frame.',
  price: 'Budget in CHF. Start broad to explore; narrow when you see enough good options.',
  weight: 'Weight in grams. Lower prioritizes lightweight/portable lenses; higher includes heavier pro glass.',
  focalRange: 'Desired focal range (mm). Lower minimum adds ultra‑wide; higher maximum adds telephoto reach. Full range imposes no focal restriction.',
  maxAperture: 'Aperture speed requirement. Lower f‑numbers are faster (more light, more blur); higher allows slower lenses.',
  distortionMax: 'Upper limit on geometric distortion. Lower preserves straight lines; higher permits more distortion for wider options.',
  breathingMin: 'Minimum focus‑breathing score (0–10). Higher means less breathing—better for video focus pulls.',
  requireOIS: 'Only include lenses with Optical Image Stabilization. Helpful in low light or on bodies without IBIS.',
  goalPreset: 'High‑level preference profile (Portrait, Travel, etc.). It sets scoring weights. Choose Custom to fine‑tune.',
};

export const GOAL_WEIGHT_HELP: Record<string, string> = {
  low_light: 'Prefer performance in dim light. Higher favors faster glass and stabilization; lower deprioritizes light gathering.',
  background_blur: 'Prefer strong background blur (bokeh). Higher favors large apertures at your chosen focal length.',
  reach: 'Prefer telephoto reach. Higher favors longer focal lengths; lower avoids tele bias.',
  wide: 'Prefer wide‑angle capability. Higher favors shorter focal lengths; lower avoids wide bias.',
  portability: 'Prefer compact and light. Higher prioritizes lighter options; lower allows heavier glass.',
  value: 'Prefer price‑to‑performance. Higher prioritizes affordable lenses; lower tolerates higher prices.',
  distortion_control: 'Prefer straight‑line geometry. Higher favors lenses with low distortion; lower allows more distortion.',
  video_excellence: 'Prefer video behavior (focus breathing, etc.). Higher favors video‑friendly lenses.',
};


