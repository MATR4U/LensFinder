import { test, expect } from '@playwright/test';

test('Mode→Build→Tune→Compare→Report smoke with tray gating', async ({ page }) => {
  await page.goto('/');

  // Mode
  await page.getByRole('heading', { name: 'Choose your mode' }).isVisible();
  if (test.info().project.name.includes('webkit')) {
    // Safari/WebKit path: skip toggling, continue directly
    const modeContinue = page.getByRole('button', { name: 'Continue' });
    await expect(modeContinue).toBeVisible();
    await modeContinue.click({ force: true });
  } else {
    const beginner = page.getByTestId('mode-beginner');
    await expect(beginner).toBeVisible();
    await beginner.click();
    const modeContinue = page.getByRole('button', { name: 'Continue' });
    await expect(modeContinue).toBeVisible();
    await modeContinue.click();
  }

  // Build (caps) — just continue
  await page.getByRole('heading', { name: 'Build and capabilities' }).isVisible();
  const buildContinue = page.getByRole('button', { name: /Continue|See results/i });
  await expect(buildContinue).toBeVisible();
  await buildContinue.click({ force: true });

  // Tune requirements — proceed to results
  await page.getByRole('heading', { name: 'Your requirements' }).isVisible();
  const reqContinue = page.getByRole('button', { name: /See results/i });
  await expect(reqContinue).toBeVisible();
  await reqContinue.click({ force: true });

  // Results grid — verify tray gating: need 2 selections
  const compareBtn = page.getByRole('button', { name: 'Compare now' });
  const reportBtn = page.getByRole('button', { name: 'View Report' });
  await expect(compareBtn).toBeDisabled();
  await expect(reportBtn).toBeDisabled();

  // Select two items
  await page.getByTestId('compare-toggle').first().click();
  await page.getByTestId('compare-toggle').nth(1).click();
  await expect(compareBtn).toBeEnabled();
  await expect(reportBtn).toBeEnabled();

  // Go to Compare
  await compareBtn.click();
  await expect(page.getByRole('heading', { name: 'Compare' })).toBeVisible();

  // Go to Report
  await reportBtn.click();
  await expect(page.getByText('Summary & decision')).toBeVisible();
});


