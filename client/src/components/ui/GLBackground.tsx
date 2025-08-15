import React from 'react';
import * as THREE from 'three';

export default function GLBackground() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const rafRef = React.useRef<number>(0);
  const rendererRef = React.useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = React.useRef<THREE.Scene | null>(null);
  const cameraRef = React.useRef<THREE.OrthographicCamera | null>(null);
  const meshRef = React.useRef<THREE.Mesh | null>(null);
  const timeRef = React.useRef<number>(0);
  const mouseRef = React.useRef<{ x: number; y: number; px: number; py: number }>({ x: 0, y: 0, px: 0, py: 0 });
  const [enabled, setEnabled] = React.useState(false);
  const [reduced, setReduced] = React.useState(false);
  const [supportsWebGL, setSupportsWebGL] = React.useState(false);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReduced(reduce);
    const hasWebGL = typeof window !== 'undefined' && (('WebGL2RenderingContext' in window) || ('WebGLRenderingContext' in window));
    setSupportsWebGL(!!hasWebGL);

    if (reduce || !hasWebGL) {
      setEnabled(false);
      return;
    }
    setEnabled(true);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance', premultipliedAlpha: true, preserveDrawingBuffer: false });
    renderer.setClearColor(0x000000, 0);
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(rafRef.current);
    };
    const handleContextRestored = () => {
      // Re-init size and resume loop
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      rafRef.current = requestAnimationFrame(loop);
    };
    canvas.addEventListener('webglcontextlost', handleContextLost as any, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored as any, false);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 10);
    camera.position.z = 1;
    cameraRef.current = camera;

    const geometry = new THREE.PlaneGeometry(2, 2);
    const uniforms: Record<string, THREE.IUniform> = {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(1, 1) },
      u_mouse: { value: new THREE.Vector2(0, 0) },
      u_seed: { value: Math.random() * 1000.0 },
      u_intensity: { value: 0.55 },
    };

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      precision highp float;
      varying vec2 vUv;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_time;
      uniform float u_seed;
      uniform float u_intensity;

      // Hash and value noise
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

      // Periodic time (seamless loop)
      const float PI = 3.141592653589793;
      const float PERIOD = 60.0; // seconds (slower overall motion)

      // Sophisticated caustic light field with subtle dual-tone drift
      const vec3 TONE_A = vec3(0.17, 0.22, 0.42); // indigo
      const vec3 TONE_B = vec3(0.10, 0.30, 0.38); // teal
      const vec3 BASE_DARK = vec3(0.06, 0.07, 0.12);

      void main() {
        vec2 uv = vUv;
        vec2 res = u_resolution;
        vec2 p = (uv * res - 0.5 * res) / min(res.x, res.y);
        vec2 m = u_mouse * 0.6; // mouse in scene coords for highlight only

        // Looping time via sin/cos circle so start == end
        float t = mod(u_time, PERIOD);
        float ang1 = (t / PERIOD) * 2.0 * PI;
        float ang2 = (t / PERIOD) * 2.0 * PI * 0.5; // second layer with half-speed, still periodic

        vec2 warp1 = vec2(cos(ang1), sin(ang1));
        vec2 warp2 = vec2(cos(ang2), sin(ang2));

        // Multi-layer domain-warped FBM to create caustic-like filaments
        vec2 q = p * 1.15 + 0.25 * warp1;
        float f1 = fbm(q * 2.2 + vec2(0.3 * t, -0.2 * t));
        float f2 = fbm(q * 3.4 + vec2(-0.15 * t, 0.22 * t) + 2.0 * f1);
        float ridged = 1.0 - abs(2.0 * f1 - 1.0);
        float caustics = pow(smoothstep(0.65, 0.93, ridged) * 0.6 + smoothstep(0.68, 0.92, f2) * 0.4, 1.6);

        // Slow tonal drift between two hues
        float hueMix = 0.5 + 0.5 * cos(2.0 * PI * (t / PERIOD) + 1.2);
        vec3 tint = mix(TONE_A, TONE_B, hueMix);

        vec3 col = BASE_DARK + (0.18 * tint) * (0.55 + 0.45 * caustics);

        // Mouse-driven shine: anchored radial bloom + faint halo (no directional bias)
        float dm = length(p - m);
        float bloom = exp(-12.0 * dm * dm);              // soft center glow
        float halo = exp(-48.0 * (dm - 0.18) * (dm - 0.18)); // subtle ring around cursor
        col += 0.05 * bloom + 0.02 * halo;

        // Intensity control and gentle vignette
        float vign = smoothstep(0.95, 0.35, length(p));
        col *= mix(1.0, vign, 0.28);
        col = mix(col, vec3(dot(col, vec3(0.333))), 0.06);
        col *= (0.70 + 0.20 * u_intensity);

        gl_FragColor = vec4(col, 0.78);
      }
    `;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      depthWrite: false,
      depthTest: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    const setSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      (uniforms.u_resolution.value as THREE.Vector2).set(width, height);
    };
    setSize();
    window.addEventListener('resize', setSize);

    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth * 0.5;
      const cy = window.innerHeight * 0.5;
      mouseRef.current.x = (e.clientX - cx) / Math.max(1, cx);
      // Invert Y so positive is up in shader space
      mouseRef.current.y = -(e.clientY - cy) / Math.max(1, cy);
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    let last = performance.now();
    const loop = () => {
      const now = performance.now();
      const dt = Math.max(0, (now - last) / 1000);
      last = now;
      const SPEED = 0.35; // global speed scale (lower = slower)
      if (!reduce) timeRef.current += dt * SPEED;
      const PERIOD = 60.0;
      const t = timeRef.current % PERIOD;
      (uniforms.u_time as THREE.IUniform).value = t;

      // Smooth mouse
      const alpha = 0.06;
      const mm = mouseRef.current;
      mm.px += (mm.x - mm.px) * alpha;
      mm.py += (mm.y - mm.py) * alpha;
      (uniforms.u_mouse as THREE.IUniform).value.set(mm.px, mm.py);

      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener('webglcontextlost', handleContextLost as any);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored as any);
      window.removeEventListener('resize', setSize);
      window.removeEventListener('mousemove', onMove);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} aria-hidden="true" style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />
      {(!supportsWebGL || reduced) && (
        <div className="fx-shimmer" aria-hidden style={{ zIndex: 0 }}>
          <div className="fx-blob fx-blob-1" />
          <div className="fx-blob fx-blob-2" />
          <div className="fx-blob fx-blob-3" />
          <div className="fx-sheen" />
        </div>
      )}
    </>
  );
}


