import * as THREE from 'three';

export function attachGLBackground({
  renderer,
  scene,
  camera,
  uniforms,
  reduce,
  rafRef,
}: {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.Camera;
  uniforms: Record<string, THREE.IUniform>;
  reduce: boolean;
  rafRef: { current: number };
}) {
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

  const mouseRef = { px: 0, py: 0, x: 0, y: 0 };
  const onMove = (e: MouseEvent) => {
    const cx = window.innerWidth * 0.5;
    const cy = window.innerHeight * 0.5;
    mouseRef.x = (e.clientX - cx) / Math.max(1, cx);
    mouseRef.y = -(e.clientY - cy) / Math.max(1, cy);
  };
  window.addEventListener('mousemove', onMove, { passive: true });

  let last = performance.now();
  const timeRef = { t: 0 };
  const loop = () => {
    const now = performance.now();
    const dt = Math.max(0, (now - last) / 1000);
    last = now;
    const SPEED = 0.35;
    if (!reduce) timeRef.t += dt * SPEED;
    const PERIOD = 60.0;
    const t = timeRef.t % PERIOD;
    (uniforms.u_time as THREE.IUniform).value = t;

    // Smooth mouse
    const alpha = 0.06;
    mouseRef.px += (mouseRef.x - mouseRef.px) * alpha;
    mouseRef.py += (mouseRef.y - mouseRef.py) * alpha;
    (uniforms.u_mouse as THREE.IUniform).value.set(mouseRef.px, mouseRef.py);

    renderer.render(scene, camera);
    rafRef.current = requestAnimationFrame(loop);
  };
  rafRef.current = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(rafRef.current);
    window.removeEventListener('resize', setSize);
    window.removeEventListener('mousemove', onMove);
  };
}


