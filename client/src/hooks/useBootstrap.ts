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
  const retryTimer = useRef<number | null>(null);
  const startedAt = useRef<number>(Date.now());
  // CameraName is now in the global store; keep only data/error here

  useEffect(() => {
    let cancelled = false;
    const attempt = async (delayMs = 0) => {
      if (cancelled) return;
      if (delayMs > 0) await new Promise(r => setTimeout(r, delayMs));
      try {
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
        // After 20s, surface a non-blocking message; still keep retrying
        if (elapsed > 20000) {
          setFatalError('Service warming up… retrying connection');
        }
        const nextDelay = Math.min(2000, Math.max(200, Math.floor(elapsed / 5)));
        // schedule next attempt
        if (!cancelled) {
          retryTimer.current = window.setTimeout(() => attempt(), nextDelay);
        }
      }
    };
    attempt();
    return () => {
      cancelled = true;
      if (retryTimer.current) {
        clearTimeout(retryTimer.current);
        retryTimer.current = null;
      }
    };
  }, []);

  return { cameras, lenses, fatalError, setFatalError } as const;
}


