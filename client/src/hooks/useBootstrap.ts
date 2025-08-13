import { useEffect, useRef, useState } from 'react';
import type { Camera, Lens } from '../types';
// Do not block on health; fetch data directly with backoff
import { getCamerasCached, getLensesCached, onDataInvalidated, getCacheMeta, getCachedSnapshot } from '../lib/data';

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
  const [offline, setOffline] = useState<boolean>(typeof navigator !== 'undefined' ? !navigator.onLine : false);
  const [health, setHealth] = useState<Record<string, string> | null>(null);
  const [lastError, setLastError] = useState<{ code?: number; message: string; ts: number; cid: string } | null>(null);
  const [etaSeconds, setEtaSeconds] = useState<number>(0);
  const retryTimer = useRef<number | null>(null);
  const startedAt = useRef<number>(Date.now());
  const pausedRef = useRef<boolean>(false);
  const attemptRef = useRef<null | ((delayMs?: number) => Promise<void>)>(null);
  // CameraName is now in the global store; keep only data/error here

  useEffect(() => {
    function handleOnline() { setOffline(false); }
    function handleOffline() { setOffline(true); }
    try {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    } catch {}
    return () => {
      try {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      } catch {}
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const attempt = async (delayMs = 0) => {
      if (cancelled) return;
      if (pausedRef.current) return; // do not schedule further when paused
      if (offline) { setDegraded("You're offline. We'll retry once you're back online."); return; }
      if (delayMs > 0) await new Promise(r => setTimeout(r, delayMs));
      try {
        // Soft readiness check to set degraded banner when dependencies are not ready yet
        try {
          const ready = await fetch('/ready', { method: 'GET' });
          if (!ready.ok) setDegraded('Service starting… some features may be unavailable');
          else setDegraded(null);
          // Health components breakdown (best-effort)
          try {
            const hc = await fetch('/api/health/components');
            if (hc.ok) {
              const comp = await hc.json();
              setHealth(comp || null);
            }
          } catch {}
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
        setLastError(null);
      } catch (_) {
        // Do not block UI; retry with backoff until ready
        const elapsed = Date.now() - startedAt.current;
        // After 8s, surface a non-blocking message; still keep retrying
        if (elapsed > 8000) {
          setFatalError('Service warming up… retrying connection');
        }
        const nextDelay = Math.min(8000, Math.max(1000, Math.floor(elapsed / 2))); // smoother backoff
        setEtaSeconds(Math.ceil(nextDelay / 1000));
        setLastError({ message: 'Retry scheduled', ts: Date.now(), cid: Math.random().toString(36).slice(2, 8) });
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

  return {
    cameras,
    lenses,
    fatalError,
    setFatalError,
    degraded,
    isPaused,
    pauseRetries,
    resumeRetries,
    retryNow,
    offline,
    health,
    lastError,
    etaSeconds,
    cacheMeta: getCacheMeta(),
    cachedSnapshot: getCachedSnapshot()
  } as const;
}


