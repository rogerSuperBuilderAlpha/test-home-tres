import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/bulk-verify', async route => {
    const request = route.request();
    if (request.method() === 'POST') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          results: [
            {
              formIndex: 0,
              imageIndex: 0,
              brandName: 'Old Tom Distillery',
              matchedBy: 'filename match: old_tom.png',
              result: {
                success: true,
                overallMatch: true,
                details: {
                  brandName: { match: true, expected: 'Old Tom Distillery', found: 'Old Tom Distillery' },
                  productType: { match: true, expected: 'Kentucky Straight Bourbon Whiskey', found: 'Kentucky Straight Bourbon Whiskey' },
                  alcoholContent: { match: true, expected: '45%', found: '45%' },
                  netContents: { match: true, expected: '750 mL', found: '750 mL' },
                  governmentWarning: { present: true },
                },
                discrepancies: [],
              },
            },
          ],
        }),
      });
    }
    return route.continue();
  });
});

test('bulk verification basic flow', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByTestId('app-title')).toBeVisible({ timeout: 30000 });

  await page.getByRole('button', { name: /Bulk Upload/i }).click();

  // Upload CSV via setInputFiles
  const csv = 'brand name,product type,alcohol content,net contents\nOld Tom Distillery,Kentucky Straight Bourbon Whiskey,45,750 mL\n';
  await page.locator('input[type="file"][accept*=".csv"]').setInputFiles({
    name: 'forms.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(csv, 'utf8'),
  });

  // Upload an image via setInputFiles
  const imageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==', 'base64');
  await page.locator('input[type="file"][accept*="image"]').nth(1).setInputFiles({
    name: 'old_tom.png',
    mimeType: 'image/png',
    buffer: imageBuffer,
  });

  await page.getByRole('button', { name: /Verify 1 Label/ }).click();

  await expect(page.getByText('Bulk Verification Results')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText('✓ Passed')).toBeVisible();
});


