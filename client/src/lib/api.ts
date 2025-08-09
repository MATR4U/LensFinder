import type { Camera, Lens } from '../types';

export async function getCameras(): Promise<Camera[]> {
  const res = await fetch('/api/cameras');
  if (!res.ok) throw new Error('Failed to load cameras');
  return res.json();
}

export async function getLenses(): Promise<Lens[]> {
  const res = await fetch('/api/lenses');
  if (!res.ok) throw new Error('Failed to load lenses');
  return res.json();
}

export async function getPrice(sourceUrl: string): Promise<string | null> {
  const res = await fetch(`/api/price?url=${encodeURIComponent(sourceUrl)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data?.price ?? null;
}

export async function postReport(payload: { cameraName: string; goal: string; top: Array<{ name: string; total: number; weight_g: number; price_chf: number; type: string }>; }): Promise<string> {
  const res = await fetch('/api/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to generate report');
  const data = await res.json();
  return data?.html ?? '<p>Error</p>';
}


