import { test, expect } from '@playwright/test';

test('price and weight slider bounds match dataset min/max', async ({ page, request }) => {
  const resp = await request.get('/api/lenses');
  expect(resp.ok()).toBeTruthy();
  const lenses = (await resp.json()) as Array<{ price_chf?: number; weight_g?: number }>;
  const prices = lenses.map(l => l.price_chf).filter((v): v is number => Number.isFinite(v as number));
  const weights = lenses.map(l => l.weight_g).filter((v): v is number => Number.isFinite(v as number));
  const expectedPriceMin = Math.floor(Math.max(0, Math.min(...prices)));
  const expectedPriceMax = Math.ceil(Math.max(...prices));
  const expectedWeightMin = Math.floor(Math.max(0, Math.min(...weights)));
  const expectedWeightMax = Math.ceil(Math.max(...weights));

  await page.goto('/');
  await page.getByRole('button', { name: 'Pro' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();

  // Price slider thumbs expose aria-valuemin/aria-valuemax
  const priceThumbs = page.getByLabel('Price (CHF)').getByRole('slider');
  await expect(priceThumbs.first()).toBeVisible();
  const pMin = parseFloat(await priceThumbs.first().getAttribute('aria-valuemin') || 'NaN');
  const pMax = parseFloat(await priceThumbs.last().getAttribute('aria-valuemax') || 'NaN');
  expect(pMin).toBe(expectedPriceMin);
  expect(pMax).toBe(expectedPriceMax);

  // Weight slider
  const weightThumbs = page.getByLabel('Weight (g)').getByRole('slider');
  await expect(weightThumbs.first()).toBeVisible();
  const wMin = parseFloat(await weightThumbs.first().getAttribute('aria-valuemin') || 'NaN');
  const wMax = parseFloat(await weightThumbs.last().getAttribute('aria-valuemax') || 'NaN');
  expect(wMin).toBe(expectedWeightMin);
  expect(wMax).toBe(expectedWeightMax);
});


