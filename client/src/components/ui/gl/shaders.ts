export const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

export const fragmentShader = `
  precision highp float;
  varying vec2 vUv;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_time;
  uniform float u_seed;
  uniform float u_intensity;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = m * p + 0.01 * u_seed;
      a *= 0.5;
    }
    return v;
  }

  const float PI = 3.141592653589793;
  const float PERIOD = 60.0;

  const vec3 TONE_A = vec3(0.17, 0.22, 0.42);
  const vec3 TONE_B = vec3(0.10, 0.30, 0.38);
  const vec3 BASE_DARK = vec3(0.06, 0.07, 0.12);

  void main() {
    vec2 uv = vUv;
    vec2 res = u_resolution;
    vec2 p = (uv * res - 0.5 * res) / min(res.x, res.y);
    vec2 m = u_mouse * 0.6;

    float t = mod(u_time, PERIOD);
    float ang1 = (t / PERIOD) * 2.0 * PI;
    float ang2 = (t / PERIOD) * 2.0 * PI * 0.5;

    vec2 warp1 = vec2(cos(ang1), sin(ang1));
    vec2 warp2 = vec2(cos(ang2), sin(ang2));

    vec2 q = p * 1.15 + 0.25 * warp1;
    float f1 = fbm(q * 2.2 + vec2(0.3 * t, -0.2 * t));
    float f2 = fbm(q * 3.4 + vec2(-0.15 * t, 0.22 * t) + 2.0 * f1);
    float ridged = 1.0 - abs(2.0 * f1 - 1.0);
    float caustics = pow(smoothstep(0.65, 0.93, ridged) * 0.6 + smoothstep(0.68, 0.92, f2) * 0.4, 1.6);

    float hueMix = 0.5 + 0.5 * cos(2.0 * PI * (t / PERIOD) + 1.2);
    vec3 tint = mix(TONE_A, TONE_B, hueMix);

    vec3 col = BASE_DARK + (0.18 * tint) * (0.55 + 0.45 * caustics);

    float dm = length(p - m);
    float bloom = exp(-12.0 * dm * dm);
    float halo = exp(-48.0 * (dm - 0.18) * (dm - 0.18));
    col += 0.05 * bloom + 0.02 * halo;

    float vign = smoothstep(0.95, 0.35, length(p));
    col *= mix(1.0, vign, 0.28);
    col = mix(col, vec3(dot(col, vec3(0.333))), 0.06);
    col *= (0.70 + 0.20 * u_intensity);

    gl_FragColor = vec4(col, 0.78);
  }
`;


