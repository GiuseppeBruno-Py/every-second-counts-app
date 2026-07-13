const { test, expect } = require('@playwright/test');

test('produção instala, compõe e reabre offline sem duplicar features', async ({ page, context }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route(/^https?:\/(?!\/127\.0\.0\.1)/, route => route.abort());
  await page.addInitScript(() => localStorage.setItem('compasso.world.quality.v1', '2d'));

  await page.goto('/', { waitUntil:'domcontentloaded' });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));

  const enhancedResponse = await page.reload({ waitUntil:'domcontentloaded' });
  expect(enhancedResponse.headers()['x-compasso-world']).toBe('three-v1');
  await page.waitForFunction(() => globalThis.CompassoFeatures?.installed === true);
  await expect(page.locator('#worldShell')).toHaveAttribute('data-renderer', '2d');
  await expect(page.locator('#studyGrid .item-card').first()).toBeAttached();
  expect(await page.evaluate(() => CompassoFeatures.list().filter(name => name === 'world-3d').length)).toBe(1);

  await context.setOffline(true);
  await page.reload({ waitUntil:'domcontentloaded' });
  await page.waitForFunction(() => globalThis.CompassoFeatures?.installed === true);
  await expect(page.locator('#worldTitle')).toHaveText('O Mundo do Compasso');
  await page.locator('#worldMapGrid [data-world-location="reading"]').click();
  await expect(page.locator('#readingView')).toHaveClass(/active/);
  await expect(page.locator('#readingGrid .item-card').first()).toBeVisible();
  expect(errors).toEqual([]);
});
