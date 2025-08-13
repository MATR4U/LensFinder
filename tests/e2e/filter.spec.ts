import { test, expect } from '@playwright/test';
// Using webServer from playwright.config and global-setup for DB; no manual spawning here

test.describe('End-to-end filters', () => {
  test('filters produce non-zero results and compare flow works', async ({ page }) => {
      await page.goto('/');

      // Step 1: choose Pro or Beginner explicitly, then continue
      await page.getByRole('button', { name: 'Pro' }).click();
      await page.getByRole('button', { name: 'Continue' }).click();

      // Step 2: wait for requirements UI and data
      await expect(page.getByText('Your requirements')).toBeVisible();
      const selects = page.locator('select');
      await expect(selects.first()).toBeVisible();

      // Choose a specific camera (first non-Any option) to exercise mount filtering
      const cameraSelect = page.locator('label:has-text("Camera Body") + select');
      if (await cameraSelect.count()) {
        const options = cameraSelect.locator('option');
        const optionCount = await options.count();
        if (optionCount > 1) {
          const value = await options.nth(1).getAttribute('value');
          if (value) await cameraSelect.selectOption(value);
        }
      }

      // Adjust price slider by moving the first thumb (role=slider)
      const firstThumb = page.getByRole('slider').first();
      await firstThumb.focus();
      await page.keyboard.press('ArrowRight');

      // Continue to results/compare step
      await page.getByRole('button', { name: /See results/i }).click();

      // Ensure results are rendered in grid (presence of 'Select' buttons) and click one
      const firstSelect = page.getByRole('button', { name: 'Select' }).first();
      await expect(firstSelect).toBeVisible();
      await firstSelect.click();

      // Proceed to report
      await page.getByRole('button', { name: 'View Report' }).click();
      await expect(page.getByText('Summary & decision')).toBeVisible();
    
  });
});


