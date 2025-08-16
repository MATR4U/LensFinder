import * as THREE from 'three';

export type UniformMap = Record<string, THREE.IUniform>;

export function createUniforms(seed?: number, intensity = 0.55): UniformMap {
  return {
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2(1, 1) },
    u_mouse: { value: new THREE.Vector2(0, 0) },
    u_seed: { value: typeof seed === 'number' ? seed : Math.random() * 1000.0 },
    u_intensity: { value: intensity },
  };
}


