import { useEffect, useRef, useState } from 'react';
import type { Camera, Lens } from '../types';
// Do not block on health; fetch data directly with backoff
import { getCamerasCached, getLensesCached, onDataInvalidated } from '../lib/data';

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export function useBootstrap() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [lenses, setLenses] = useState<Lens[]>([]);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [degraded, setDegraded] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const retryTimer = useRef<number | null>(null);
  const startedAt = useRef<number>(Date.now());
  const pausedRef = useRef<boolean>(false);
  const attemptRef = useRef<null | ((delayMs?: number) => Promise<void>)>(null);
  // CameraName is now in the global store; keep only data/error here

  useEffect(() => {
    let cancelled = false;
    const attempt = async (delayMs = 0) => {
      if (cancelled) return;
      if (pausedRef.current) return; // do not schedule further when paused
      if (delayMs > 0) await new Promise(r => setTimeout(r, delayMs));
      try {
        // Soft readiness check to set degraded banner when dependencies are not ready yet
        try {
          const ready = await fetch('/ready', { method: 'GET' });
          if (!ready.ok) setDegraded('Service starting… some features may be unavailable');
          else setDegraded(null);
        } catch { setDegraded('Service starting… some features may be unavailable'); }
        const [cams, lens] = await Promise.all([
          getCamerasCached(),
          getLensesCached()
        ]);
        if (cancelled) return;
        setCameras(cams);
        setLenses(lens);
        // subscribe for periodic revalidation
        onDataInvalidated(async () => {
          try {
            const [nc, nl] = await Promise.all([getCamerasCached(), getLensesCached()]);
            if (cancelled) return;
            setCameras(nc);
            setLenses(nl);
          } catch (_) { /* ignore */ }
        });
        setFatalError(null);
      } catch (_) {
        // Do not block UI; retry with backoff until ready
        const elapsed = Date.now() - startedAt.current;
        // After 8s, surface a non-blocking message; still keep retrying
        if (elapsed > 8000) {
          setFatalError('Service warming up… retrying connection');
        }
        const nextDelay = Math.min(5000, Math.max(500, Math.floor(elapsed / 3))); // slower backoff to reduce noise
        // schedule next attempt
        if (!cancelled && !pausedRef.current) {
          retryTimer.current = window.setTimeout(() => attempt(), nextDelay);
        }
      }
    };
    attemptRef.current = attempt;
    attempt();
    return () => {
      cancelled = true;
      if (retryTimer.current) {
        clearTimeout(retryTimer.current);
        retryTimer.current = null;
      }
    };
  }, []);

  const pauseRetries = () => {
    setIsPaused(true);
    pausedRef.current = true;
    if (retryTimer.current) { clearTimeout(retryTimer.current); retryTimer.current = null; }
  };
  const resumeRetries = () => {
    if (!pausedRef.current) return;
    setIsPaused(false);
    pausedRef.current = false;
    startedAt.current = Date.now();
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => { await attemptRef.current?.(0); })();
  };
  const retryNow = () => {
    if (retryTimer.current) { clearTimeout(retryTimer.current); retryTimer.current = null; }
    startedAt.current = Date.now();
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => { await attemptRef.current?.(0); })();
  };

  return { cameras, lenses, fatalError, setFatalError, degraded, isPaused, pauseRetries, resumeRetries, retryNow } as const;
}


