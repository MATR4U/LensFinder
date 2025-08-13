import { test, expect } from '@playwright/test';

test('compare selection and URL sync smoke', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Pro' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();

  // Open requirements, toggle Macro and Weather sealed
  await expect(page.getByText('Your requirements')).toBeVisible();
  const sealed = page.getByLabel('Weather sealed');
  const macro = page.getByLabel('Macro');
  await sealed.click();
  await macro.click();

  // Move price min up
  const firstThumb = page.getByRole('slider').first();
  await firstThumb.focus();
  await page.keyboard.press('ArrowRight');

  await page.getByRole('button', { name: /See results/i }).click();
  await expect(page.getByRole('button', { name: 'Select' }).first()).toBeVisible();

  // Select at least one item for comparison via data-testid for stability
  const addButtons = page.locator('[data-testid="compare-toggle"]');
  const addCount = await addButtons.count();
  if (addCount > 0) {
    await addButtons.nth(0).scrollIntoViewIfNeeded();
    await addButtons.nth(0).click();
    // Allow UI/store to update
    await page.waitForTimeout(100);
    await expect(page.getByRole('button', { name: 'Remove' }).first()).toBeVisible();
  }

  // URL should reflect store (cameraName, isPro, ranges etc.)
  const url = new URL(page.url());
  expect(url.searchParams.get('isPro')).toBe('1');

  await page.getByRole('button', { name: 'View Report' }).click();
  await expect(page.getByText('Summary & decision')).toBeVisible();
});


