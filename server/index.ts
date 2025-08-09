import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { load } from 'cheerio';

const app = express();
app.use(express.json());

const ROOT = path.resolve(path.join(process.cwd()));
const PUBLIC_DIR = ROOT;
const INDEX_HTML = path.join(ROOT, 'camera_builder.html');

// Serve main HTML at root
app.get('/', (_req: Request, res: Response) => {
  res.sendFile(INDEX_HTML);
});

// Quiet missing favicon requests
app.get('/favicon.ico', (_req: Request, res: Response) => {
  res.status(204).end();
});

// Serve static assets (css, js, data, etc.)
app.use('/', express.static(PUBLIC_DIR));

app.get('/api/cameras', async (_req: Request, res: Response) => {
  try {
    const p = path.join(ROOT, 'server', 'data', 'cameras.json');
    const data = await fs.readFile(p, 'utf-8');
    res.type('application/json').send(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to read cameras.json' });
  }
});

app.get('/api/lenses', async (_req: Request, res: Response) => {
  try {
    const p = path.join(ROOT, 'server', 'data', 'lenses.json');
    const data = await fs.readFile(p, 'utf-8');
    res.type('application/json').send(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to read lenses.json' });
  }
});

app.get('/api/price', async (req: Request, res: Response) => {
  try {
    const url = req.query.url as string;
    if (!url) return res.status(400).json({ error: 'Missing url' });
    const resp = await fetch(url);
    const html = await resp.text();
    const $ = load(html);
    // Heuristic selectors; can be extended per vendor
    const candidates = [
      $('[itemprop="price"]').attr('content'),
      $('[data-price]').attr('data-price'),
      $('[class*="price" i]').first().text(),
      $('meta[property="product:price:amount"]').attr('content')
    ].filter(Boolean) as string[];
    const raw = candidates.find(Boolean) || '';
    const match = raw.replace(/\s+/g, ' ').match(/([\d'.,]+)\s*(CHF|EUR|USD)?/i);
    const normalized = match ? `${match[2] ? match[2].toUpperCase() + ' ' : ''}${match[1]}` : null;
    res.json({ price: normalized });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch price' });
  }
});

app.post('/api/report', async (req: Request, res: Response) => {
  const { cameraName, goal, top } = req.body as {
    cameraName: string;
    goal: string;
    top: Array<{ name: string; total: number; weight_g: number; price_chf: number; type: string }>;
  };
  if (!top || top.length === 0) return res.json({ html: '<p class="text-yellow-400">No results to analyze.</p>' });
  const list = top
    .map((t, i) => `
      <div class="mb-4">
        <h4 class="text-white font-semibold">${i + 1}. ${t.name} (Score: ${t.total.toFixed(0)})</h4>
        <p class="text-gray-300 text-sm">Type: ${t.type} · Weight: ${t.weight_g}g · Price: CHF ${t.price_chf}</p>
      </div>`)
    .join('');
  const html = `
    <div>
      <h3 class="text-xl font-bold text-white mb-2">Top picks for ${cameraName}</h3>
      <p class="text-gray-300 text-sm mb-4">Goal: ${goal}</p>
      ${list}
      <div class="mt-6">
        <h3 class="text-lg font-bold text-white">Final Verdict</h3>
        <ul class="list-disc list-inside text-gray-300 text-sm mt-2">
          <li>Ultimate performance: ${top[0].name}</li>
          <li>Best all-rounder: ${top[1] ? top[1].name : top[0].name}</li>
          <li>Portability/value: ${top[2] ? top[2].name : top[0].name}</li>
        </ul>
      </div>
    </div>`;
  res.json({ html });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Client dev server (Vite) recommended: cd client && npm run dev`);
});


