#!/usr/bin/env node

// Fetch and validate lens specs from their source_url pages, then optionally update db/data/lenses.json
// Usage:
//   node db/data/scripts/fetch-lens-specs.mjs            # dry-run (no writes)
//   node db/data/scripts/fetch-lens-specs.mjs --write    # write updates to JSON
//   node db/data/scripts/fetch-lens-specs.mjs --brand Sony --write

import fs from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const shouldWrite = args.includes('--write');
const brandFilterIdx = args.indexOf('--brand');
const brandFilter = brandFilterIdx !== -1 ? (args[brandFilterIdx + 1] || '') : '';
const concurrency = 4;

const monoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const lensesPath = path.join(monoRoot, 'data', 'lenses.json');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Extract numbers following f/ patterns and also from common spec labels.
 * Returns { minFastestF, maxSmallestApertureF }
 */
function extractApertures(html) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ');
  const fMatches = Array.from(text.matchAll(/\bf\s*\/?\s*(\d+(?:\.\d+)?)(?:\s*[–-]\s*(\d+(?:\.\d+)?))?/gi));
  const values = [];
  for (const m of fMatches) {
    const a = Number(m[1]);
    if (Number.isFinite(a)) values.push(a);
    const b = Number(m[2]);
    if (Number.isFinite(b)) values.push(b);
  }
  // Heuristic: fastest f is min value <= 10; smallest aperture f is max value between 10 and 64
  const minFastestF = values.filter((v) => v > 0 && v <= 10).reduce((a, b) => Math.min(a, b), Infinity);
  const maxSmallestF = values.filter((v) => v >= 10 && v <= 64).reduce((a, b) => Math.max(a, b), -Infinity);
  return {
    minFastestF: Number.isFinite(minFastestF) ? minFastestF : null,
    maxSmallestF: Number.isFinite(maxSmallestF) ? maxSmallestF : null
  };
}

function extractWeight(html) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ');
  // Match like 935 g, 1,295 g, 935g, 935 grams
  const m = /\b(\d{2,4}(?:[.,]\d{3})*|\d{2,4})\s*(?:g|grams)\b/i.exec(text);
  if (!m) return null;
  const raw = m[1].replace(/\./g, '').replace(/,/g, '');
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function extractOIS(html) {
  const text = html.toLowerCase();
  // Flag stabilization keywords; avoid false positives like "no image stabilization" if preceded by 'no '
  const hasNeg = /no\s+(?:image\s+)?stabilization|without\s+stabilization/.test(text);
  if (hasNeg) return false;
  return /(image\s+stabilization|stabilization\b|\boss\b|\bois\b|\bvr\b|\bvc\b)/.test(text);
}

function extractSealing(html) {
  const text = html.toLowerCase();
  return /(weather\s*(?:sealed|resistant)|dust\s+and\s+splash|wr\b|weather-resistant)/.test(text);
}

function extractMacro(html) {
  const text = html.toLowerCase();
  return /\bmacro\b/.test(text);
}

async function fetchWithUA(url) {
  const res = await fetch(url, {
    headers: {
      'user-agent': 'LensFinderSpecBot/1.0 (+https://example.com)'
    }
  });
  if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
  return await res.text();
}

function maybeUpdateNumber(current, next, field) {
  if (!Number.isFinite(next)) return { changed: false, value: current };
  if (!Number.isFinite(current)) return { changed: true, value: next };
  // Avoid wild deviations; allow if within reasonable range or clearly better
  if (field === 'aperture_min') {
    // accept smaller (faster) or slight corrections
    if (next < current || Math.abs(next - current) <= 0.1) return { changed: next !== current, value: next };
    return { changed: false, value: current };
  }
  if (field === 'aperture_max') {
    // accept larger (smaller aperture) or minor corrections
    if (next > current || Math.abs(next - current) <= 0.5) return { changed: next !== current, value: next };
    return { changed: false, value: current };
  }
  if (field === 'weight_g') {
    // accept if within 10% or exactly different known rounding
    if (Math.abs((next - current) / Math.max(1, current)) <= 0.15) return { changed: next !== current, value: next };
    return { changed: false, value: current };
  }
  return { changed: next !== current, value: next };
}

function maybeUpdateBoolean(current, next) {
  if (typeof next !== 'boolean') return { changed: false, value: current };
  if (typeof current !== 'boolean') return { changed: true, value: next };
  return { changed: current !== next, value: next };
}

async function main() {
  const raw = await fs.readFile(lensesPath, 'utf-8');
  /** @type {Array<any>} */
  const lenses = JSON.parse(raw);

  const toProcess = lenses.filter(l => l.source_url && (!brandFilter || (l.brand || '').toLowerCase() === brandFilter.toLowerCase()));
  console.log(`Found ${lenses.length} lenses; processing ${toProcess.length}${brandFilter ? ` for brand=${brandFilter}` : ''}.`);

  const updates = [];
  let active = 0;
  let idx = 0;
  await new Promise((resolve) => {
    const next = async () => {
      if (idx >= toProcess.length && active === 0) return resolve();
      while (active < concurrency && idx < toProcess.length) {
        const lens = toProcess[idx++];
        active += 1;
        (async () => {
          const label = `${lens.brand} | ${lens.name} | ${lens.mount}`;
          try {
            const html = await fetchWithUA(lens.source_url);
            const { minFastestF, maxSmallestF } = extractApertures(html);
            const weight = extractWeight(html);
            const ois = extractOIS(html);
            const sealed = extractSealing(html);
            const macro = extractMacro(html);

            const fields = {};
            let changed = false;

            if (minFastestF) {
              const up = maybeUpdateNumber(lens.aperture_min ?? NaN, minFastestF, 'aperture_min');
              if (up.changed) changed = true;
              fields.aperture_min = up.value;
            }
            if (maxSmallestF) {
              const up = maybeUpdateNumber(lens.aperture_max ?? NaN, maxSmallestF, 'aperture_max');
              if (up.changed) changed = true;
              fields.aperture_max = up.value;
            }
            if (Number.isFinite(weight)) {
              const up = maybeUpdateNumber(lens.weight_g ?? NaN, weight, 'weight_g');
              if (up.changed) changed = true;
              fields.weight_g = up.value;
            }
            const upOis = maybeUpdateBoolean(!!lens.ois, !!ois);
            if (upOis.changed) { changed = true; fields.ois = upOis.value; }
            const upSeal = maybeUpdateBoolean(!!lens.weather_sealed, !!sealed);
            if (upSeal.changed) { changed = true; fields.weather_sealed = upSeal.value; }
            // Only set macro true; avoid auto-clearing if page lacks the term
            if (macro && !lens.is_macro) { changed = true; fields.is_macro = true; }

            if (changed) {
              updates.push({ idx: lenses.indexOf(lens), label, fields });
              console.log(`UPDATE: ${label}`, fields);
            } else {
              console.log(`OK: ${label}`);
            }
          } catch (e) {
            console.warn(`WARN: Failed ${label}: ${e.message}`);
          } finally {
            active -= 1;
            // politeness delay between requests start
            await sleep(100);
            next();
          }
        })();
      }
    };
    next();
  });

  if (updates.length === 0) {
    console.log('No updates.');
    return;
  }

  if (!shouldWrite) {
    console.log(`Dry-run: ${updates.length} lenses would be updated. Re-run with --write to persist.`);
    return;
  }

  for (const u of updates) {
    Object.assign(lenses[u.idx], u.fields);
  }
  await fs.writeFile(lensesPath, JSON.stringify(lenses, null, 2) + '\n', 'utf-8');
  console.log(`Wrote ${updates.length} updates to ${lensesPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


