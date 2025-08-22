import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Camera, Lens } from './provider.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getFixturesDir() {
  const override = process.env.FILE_REPO_FIXTURES_DIR && process.env.FILE_REPO_FIXTURES_DIR.trim();
  if (override) return path.resolve(override);
  return path.resolve(__dirname, '../tests/fixtures');
}

async function readJson<T = any>(filename: string): Promise<T> {
  const file = path.join(getFixturesDir(), filename);
  const buf = await readFile(file, 'utf-8');
  return JSON.parse(buf) as T;
}

export async function getAllCameras(limit?: number, offset?: number): Promise<Camera[]> {
  const all = await readJson<Camera[]>('cameras.json');
  const start = Math.max(0, Math.floor(offset ?? 0));
  const end = typeof limit === 'number' ? start + Math.max(0, Math.floor(limit)) : undefined;
  return all.slice(start, end);
}

export async function getAllLenses(limit?: number, offset?: number): Promise<Lens[]> {
  const all = await readJson<Lens[]>('lenses.json');
  const start = Math.max(0, Math.floor(offset ?? 0));
  const end = typeof limit === 'number' ? start + Math.max(0, Math.floor(limit)) : undefined;
  return all.slice(start, end);
}

export async function getCounts(): Promise<{ cameras: number; lenses: number }> {
  const [cams, lens] = await Promise.all([
    readJson<Camera[]>('cameras.json'),
    readJson<Lens[]>('lenses.json'),
  ]);
  return { cameras: cams.length, lenses: lens.length };
}
