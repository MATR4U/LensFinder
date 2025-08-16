import * as THREE from 'three';
import { createUniforms, type UniformMap } from './uniforms';

export type GLHandles = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  mesh: THREE.Mesh;
  uniforms: UniformMap;
};

export function createGL(canvas: HTMLCanvasElement, vertexShader: string, fragmentShader: string, options?: { seed?: number; intensity?: number }): GLHandles {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance', premultipliedAlpha: true, preserveDrawingBuffer: false });
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 10);
  camera.position.z = 1;

  const geometry = new THREE.PlaneGeometry(2, 2);
  const uniforms = createUniforms(options?.seed, options?.intensity ?? 0.55);
  const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, depthWrite: false, depthTest: false });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  return { renderer, scene, camera, mesh, uniforms };
}

export function disposeGL(handles: GLHandles) {
  const { renderer, scene: _scene, mesh } = handles; // TODO: scene disposed via GC; avoid unused var
  mesh.geometry.dispose();
  (mesh.material as THREE.Material).dispose();
  renderer.dispose();
  // scene and camera GC'd
}


