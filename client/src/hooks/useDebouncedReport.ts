import { useEffect } from 'react';
import type { Camera, Result } from '../types';
import { postReport, type ReportResponse } from '../lib/api';

type UseDebouncedReportArgs = {
  camera?: Camera;
  results: Result[];
  isPro: boolean;
  goalPreset: string;
  setReport: (r: ReportResponse | null) => void;
  delayMs?: number;
};

export function useDebouncedReport({ camera, results, isPro, goalPreset, setReport, delayMs = 300 }: UseDebouncedReportArgs) {
  useEffect(() => {
    if (!camera || results.length === 0) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      if (controller.signal.aborted) return;
      try {
        const top = [...results]
          .sort((a, b) => b.score_total - a.score_total)
          .slice(0, 3)
          .map(r => ({
            name: r.name,
            total: r.score_total,
            weight_g: r.weight_g,
            price_chf: r.price_chf,
            type: r.focal_min_mm === r.focal_max_mm ? 'Prime' : 'Zoom'
          }));
        const goalDesc = isPro ? `${goalPreset} (Pro)` : `${goalPreset} (Beginner)`;
        const resp = await postReport({ cameraName: camera.name, goal: goalDesc, top });
        setReport(resp);
      } catch { /* ignore transient errors */ }
    }, delayMs);
    return () => { controller.abort(); window.clearTimeout(timeout); };
  }, [camera, results, isPro, goalPreset, setReport, delayMs]);
}


