import { test, expect } from '@playwright/test';

test('negative: report should be visible without navigating (intentional fail)', async ({ page }) => {
  // Mark this as expected to fail. If the assertion fails, the test is considered passing.
  test.fail(true, 'Report should NOT be visible without navigation; failure is expected');
  await page.goto('/');
  // Without selecting mode or continuing, this should not be visible.
  await expect(page.getByText('Summary & decision')).toBeVisible();
});


