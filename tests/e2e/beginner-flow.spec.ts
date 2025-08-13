import { test, expect } from '@playwright/test';

test('beginner journey: filters -> results -> report', async ({ page }) => {
  await page.goto('/');

  // Step 1: choose Beginner explicitly, then continue
  await page.getByRole('button', { name: 'Beginner' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();

  // Requirements visible (use heading to avoid strict mode violations)
  await expect(page.getByRole('heading', { name: 'Your requirements' })).toBeVisible();

  // Adjust price min a notch to exercise debounced setters
  const firstThumb = page.getByRole('slider').first();
  await firstThumb.focus();
  await page.keyboard.press('ArrowRight');

  // Continue to results/compare step
  await page.getByRole('button', { name: /See results/i }).click();

  // Grid should render selectable cards
  const firstSelect = page.getByRole('button', { name: 'Select' }).first();
  await expect(firstSelect).toBeVisible();
  await firstSelect.click();

  // Proceed to report and verify
  await page.getByRole('button', { name: 'View Report' }).click();
  await expect(page.getByText('Summary & decision')).toBeVisible();
});


