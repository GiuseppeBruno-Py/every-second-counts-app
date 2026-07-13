const { test, expect } = require('@playwright/test');

async function worldReady(page, mode = null) {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route(/^https?:\/(?!\/127\.0\.0\.1)/, route => route.abort());
  if (mode) await page.addInitScript(value => localStorage.setItem('compasso.world.quality.v1', value), mode);
  await page.goto('/', { waitUntil:'domcontentloaded' });
  await page.waitForFunction(() => globalThis.CompassoFeatures?.installed === true);
  await page.waitForSelector('#worldShell[data-renderer]:not([data-renderer="loading"])');
  if (errors.length) throw new Error(`App bootstrap failed: ${errors.join(' | ')}`);
}

test('14 · mundo é a entrada visual e mantém uma única feature no runtime', async ({ page }) => {
  await worldReady(page);
  await expect(page.locator('#worldTitle')).toHaveText('O Mundo do Compasso');
  await expect(page.locator('#worldHomeBtn')).toBeVisible();
  await expect(page.locator('#worldMapGrid [data-world-location="reading"]')).toBeVisible();
  const result = await page.evaluate(() => ({
    renderer:document.getElementById('worldShell').dataset.renderer,
    registrations:CompassoFeatures.list().filter(name => name === 'world-3d').length,
    api:Boolean(globalThis.CompassoWorld?.openLocation),
    dashboard:Boolean(document.querySelector('#overviewView .hero-grid'))
  }));
  expect(['3d','2d']).toContain(result.renderer);
  expect(result).toMatchObject({ registrations:1, api:true, dashboard:true });
});

test('15 · mapa acessível abre um local existente e retorna à praça', async ({ page }) => {
  await worldReady(page, '2d');
  await page.locator('#worldMapGrid [data-world-location="reading"]').click();
  await expect(page.locator('#readingView')).toHaveClass(/active/);
  await expect(page.locator('#worldRoomBar')).toBeVisible();
  await expect(page.locator('#worldRoomTitle')).toHaveText('Biblioteca das Histórias');
  await page.locator('#worldRoomBar [data-world-home]').click();
  await expect(page.locator('#overviewView')).toHaveClass(/active/);
  await expect(page.locator('#worldRoomBar')).toBeHidden();
  await expect.poll(() => page.evaluate(() => CompassoWorld.state.status)).toBe('village');
});

test('16 · modo 2D explícito não carrega o renderizador WebGL', async ({ page }) => {
  await worldReady(page, '2d');
  await expect(page.locator('#worldShell')).toHaveAttribute('data-renderer', '2d');
  await expect(page.locator('.world-fallback-scene')).toBeVisible();
  await expect(page.locator('#worldCanvas')).toBeHidden();
  expect(await page.evaluate(() => CompassoWorld.quality)).toBe('2d');
});

test('17 · teclado no canvas seleciona e abre um edifício', async ({ page }) => {
  await worldReady(page);
  const renderer = await page.locator('#worldShell').getAttribute('data-renderer');
  if (renderer === '3d') {
    await page.locator('#worldCanvas').focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await expect(page.locator('#todayView')).toHaveClass(/active/);
  } else {
    await page.locator('#worldMapGrid [data-world-location="reading"]').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#readingView')).toHaveClass(/active/);
  }
  await expect(page.locator('#worldRoomBar')).toBeVisible();
});

test('18 · sessão usa o estado real e ganha ambiente visual sem duplicar dados', async ({ page }) => {
  await worldReady(page, '2d');
  await page.locator('[data-view="study"]').click();
  await page.locator('#studyGrid .ux-execute').first().click();
  await page.locator('[data-ux-run="ideal"]').click();
  await page.locator('#sessionStartForm').evaluate(form => form.requestSubmit());
  await expect.poll(() => page.evaluate(() => document.body.dataset.worldSession)).toBe('active');
  await expect(page.locator('#worldRoomBar')).toBeVisible();
  await expect(page.locator('#worldRoomStatus')).toHaveText('Sessão em andamento');
  const data = await page.evaluate(() => JSON.parse(localStorage.getItem('compasso.app.v1') || '{}'));
  expect(data.sessions.filter(item => item.status === 'active')).toHaveLength(1);
  expect(data.world).toBeUndefined();
});

test('19 · mundo móvel não cria overflow horizontal', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile only');
  await worldReady(page, '2d');
  const size = await page.evaluate(() => ({
    scroll:document.documentElement.scrollWidth,
    client:document.documentElement.clientWidth,
    stage:document.getElementById('worldStage').scrollWidth,
    stageClient:document.getElementById('worldStage').clientWidth
  }));
  expect(size.scroll).toBeLessThanOrEqual(size.client + 1);
  expect(size.stage).toBeLessThanOrEqual(size.stageClient + 1);
  await expect(page.locator('#worldHomeBtn')).toBeVisible();
});

test('20 · preferência por movimento reduzido conserva a navegação', async ({ page }) => {
  await page.emulateMedia({ reducedMotion:'reduce' });
  await worldReady(page);
  await page.locator('#worldMapGrid [data-world-location="study"]').click();
  await expect(page.locator('#studyView')).toHaveClass(/active/);
  await page.locator('#worldHomeBtn').click();
  await expect(page.locator('#overviewView')).toHaveClass(/active/);
});
