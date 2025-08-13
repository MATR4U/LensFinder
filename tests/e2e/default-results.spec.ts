import { test, expect } from '@playwright/test';

test('default filters yield all database results', async ({ page, request }) => {
  // Get total lenses from API
  const resp = await request.get('/api/lenses');
  expect(resp.ok()).toBeTruthy();
  const lenses = (await resp.json()) as Array<{ name: string }>;
  const apiUnique = new Set(lenses.map(l => l.name)).size;

  await page.goto('/');
  // Choose Pro (doesn't matter which), go to requirements
  await page.getByRole('button', { name: 'Pro' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  // Click Reset to ensure ranges expand to caps
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  // Proceed to results
  await page.getByRole('button', { name: /See results/i }).click();

  // Count unique lens cards by data-name to avoid duplicates
  const cards = page.locator('[data-testid="lens-card"]');
  await expect(cards.first()).toBeVisible();
  const names = await cards.evaluateAll((els) => Array.from(new Set(els.map((e) => e.getAttribute('data-name') || ''))));
  expect(names.length).toBe(apiUnique);
});


