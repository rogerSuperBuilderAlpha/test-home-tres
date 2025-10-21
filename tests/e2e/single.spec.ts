import { test, expect } from '@playwright/test';

// Mock the /api/verify route to avoid real OpenAI calls
test.beforeEach(async ({ page }) => {
  await page.route('**/api/verify', async route => {
    const request = route.request();
    if (request.method() === 'POST') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          result: {
            success: true,
            overallMatch: true,
            details: {
              brandName: { match: true, expected: 'Old Tom Distillery', found: 'Old Tom Distillery', confidence: 100 },
              productType: { match: true, expected: 'Kentucky Straight Bourbon Whiskey', found: 'Kentucky Straight Bourbon Whiskey', confidence: 100 },
              alcoholContent: { match: true, expected: '45%', found: '45%', confidence: 100 },
              netContents: { match: true, expected: '750 mL', found: '750 mL', confidence: 100 },
              governmentWarning: { present: true, confidence: 100, exact: true, text: 'Exact TTB-compliant warning text detected' },
            },
            discrepancies: [],
          },
        }),
      });
    }
    return route.continue();
  });
});

test('single verification happy path', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByTestId('app-title')).toBeVisible({ timeout: 30000 });
  await expect(page.getByLabel(/Brand Name/i)).toBeVisible();

  await page.getByLabel(/Brand Name/i).fill('Old Tom Distillery');
  await page.getByLabel(/Product Class\/Type/i).click();
  await page.selectOption('#productType', { label: 'Kentucky Straight Bourbon Whiskey' });
  await page.getByLabel(/Alcohol Content \(ABV\)/i).fill('45');
  await page.getByLabel(/Net Contents/i).fill('750 mL');

  // Upload a tiny image via setInputFiles
  const imageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==', 'base64');
  await page.locator('input[type="file"][accept*="image"]').first().setInputFiles({
    name: 'tiny.png',
    mimeType: 'image/png',
    buffer: imageBuffer,
  });

  await page.getByRole('button', { name: 'Verify Label' }).click();

  await expect(page.getByText('Label Verified Successfully')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('Verification Details')).toBeVisible();
});


