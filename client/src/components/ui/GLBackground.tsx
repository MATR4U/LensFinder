import React from 'react';
import * as THREE from 'three';
import { createGL, disposeGL } from './gl/engine';
import { vertexShader, fragmentShader } from './gl/shaders';
import { useGLCapabilities } from './gl/useGLCapabilities';
import { attachGLBackground } from './gl/loop';

type Props = { seed?: number; intensity?: number };

export default function GLBackground(_props: Props) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const rafRef = React.useRef<number>(0);
  const rendererRef = React.useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = React.useRef<THREE.Scene | null>(null);
  const cameraRef = React.useRef<THREE.OrthographicCamera | null>(null);
  const meshRef = React.useRef<THREE.Mesh | null>(null);
  // TODO: timeRef and mouseRef now live in loop.ts; remove if not repurposed locally
  // const timeRef = React.useRef<number>(0);
  // const mouseRef = React.useRef<{ x: number; y: number; px: number; py: number }>({ x: 0, y: 0, px: 0, py: 0 });
  const { reduced, supportsWebGL, enabled } = useGLCapabilities();

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduce = reduced;
    if (!enabled) return;

    const { renderer, scene, camera, mesh, uniforms } = createGL(canvas, vertexShader, fragmentShader, { seed: _props.seed, intensity: _props.intensity });
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(rafRef.current);
    };
    const handleContextRestored = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);
      renderer.setSize(window.innerWidth, window.innerHeight, false);
    };
    canvas.addEventListener('webglcontextlost', handleContextLost as any, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored as any, false);
    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;
    meshRef.current = mesh;

    const detach = attachGLBackground({ renderer, scene, camera, uniforms, reduce, rafRef });

    return () => {
      detach();
      canvas.removeEventListener('webglcontextlost', handleContextLost as any);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored as any);
      disposeGL({ renderer, scene, camera, mesh, uniforms });
    };
  }, [enabled, reduced]);

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


