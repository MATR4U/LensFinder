import type { Camera, Lens } from '../types';
import type { paths as OpenApiPaths } from '../types/openapi';
import { clientConfig } from '../config';

function joinUrl(base: string | undefined, path: string): string {
  const trimmedBase = (base || '').replace(/\/$/, '');
  if (!trimmedBase) return path;
  return `${trimmedBase}${path.startsWith('/') ? '' : '/'}${path}`;
}

const API_BASE = clientConfig.apiBaseUrl || '';
const API_KEY = (import.meta as any).env?.VITE_API_KEY || '';
const authHeaders = API_KEY ? { 'x-api-key': API_KEY } : undefined;

export async function getHealth(): Promise<'ok'> {
  const res = await fetch(joinUrl(API_BASE, '/api/health'), { headers: authHeaders });
  if (!res.ok) throw new Error('Health check failed');
  const data = await res.json();
  if (data?.status === 'ok') return 'ok';
  throw new Error('Service unavailable');
}

export type GetCamerasResponse = OpenApiPaths['/api/cameras']['get']['responses']['200']['content']['application/json'];
export async function getCameras(): Promise<Camera[] | GetCamerasResponse> {
  const res = await fetch(joinUrl(API_BASE, '/api/cameras'), { headers: authHeaders });
  if (!res.ok) throw new Error('Failed to load cameras');
  return res.json();
}

export type GetLensesResponse = OpenApiPaths['/api/lenses']['get']['responses']['200']['content']['application/json'];
export async function getLenses(): Promise<Lens[] | GetLensesResponse> {
  const res = await fetch(joinUrl(API_BASE, '/api/lenses'), { headers: authHeaders });
  if (!res.ok) throw new Error('Failed to load lenses');
  return res.json();
}

export async function getPrice(sourceUrl: string): Promise<string | null> {
  const res = await fetch(joinUrl(API_BASE, `/api/price?url=${encodeURIComponent(sourceUrl)}`), { headers: authHeaders });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.price ?? null;
}

export type ReportResponse = {
  cameraName: string;
  goal: string;
  items: Array<{ rank: number; name: string; score: number; type: string; weight_g: number; price_chf: number }>;
  verdicts: Array<{ label: string; name: string }>;
  summary?: string;
};

export async function postReport(payload: { cameraName: string; goal: string; top: Array<{ name: string; total: number; weight_g: number; price_chf: number; type: string }>; }): Promise<ReportResponse> {
  const res = await fetch(joinUrl(API_BASE, '/api/report'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(authHeaders || {}) },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to generate report');
  const data = await res.json();
  return data as ReportResponse;
}


