const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const PWA_URL = process.env.PWA_APP_URL || 'http://127.0.0.1:4174/';
const CONTROL_URL = `${PWA_URL}__compasso_test__/generation`;
const CURRENT = 'compasso-pages-v900002';
const PREVIOUS = 'compasso-pages-v900001';
const rawHtml = fs.readFileSync(path.resolve(__dirname, '..', '..', 'index.html'), 'utf8');

async function mode(request, value) {
  const response = await request.post(CONTROL_URL, {
    data: value,
    headers: { 'content-type': 'text/plain' },
  });
  expect(response.ok()).toBeTruthy();
}

async function trackDocumentLoads(context) {
  await context.addInitScript(() => {
    const key = 'compasso.pwa.test.document-loads';
    sessionStorage.setItem(key, String(Number(sessionStorage.getItem(key) || 0) + 1));
  });
}

async function coherent(page, generation = CURRENT) {
  await expect(page.locator('html')).toHaveAttribute('data-pwa-state', 'coherent', { timeout: 15000 });
  await expect(page.locator('.app-shell')).toBeVisible();
  await expect(page.locator('#compassoBootstrap')).toBeHidden();
  await expect(page.locator('meta[name="compasso-application-generation"]')).toHaveAttribute('content', generation);
  const identity = await page.evaluate(async () => ({
    document: document.querySelector('meta[name="compasso-application-generation"]')?.content,
    controller: await CompassoPwaLifecycle.queryGeneration(navigator.serviceWorker.controller),
    lifecycle: CompassoPwaLifecycle.snapshot(),
  }));
  expect(identity.document).toBe(generation);
  expect(identity.controller).toBe(generation);
  expect(identity.lifecycle.coherent).toBe(true);
}

async function loads(page) {
  return Number(await page.evaluate(() => sessionStorage.getItem('compasso.pwa.test.document-loads')));
}

test.beforeEach(async ({ request, context }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'lifecycle origin runs once in desktop Chromium; mobile geometry is exercised explicitly');
  await mode(request, 'current');
  await trackDocumentLoads(context);
});

test('pristine first visit converges once and never stabilizes the legacy Overview', async ({ page }) => {
  await page.goto(PWA_URL);
  await coherent(page);
  expect(await loads(page)).toBe(2);
  await expect(page.locator('.ia-primary-nav [data-ia-area="today"]')).toBeVisible();
  await expect(page.locator('#overviewView')).toBeHidden();
});

test('raw registration failure keeps a neutral inert and keyboard-readable recovery surface', async ({ page, request }) => {
  await mode(request, 'fail-worker');
  await page.setViewportSize({ width: 360, height: 720 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(PWA_URL);
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.pwaState)).toBe('failure');
  await expect(page.locator('#compassoBootstrap')).toBeVisible();
  await expect(page.locator('.app-shell')).toBeHidden();
  await expect(page.locator('.app-shell')).toHaveAttribute('inert', '');
  await expect(page.locator('#compassoBootstrapRetry')).toBeVisible();
  const geometry = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    viewport: innerWidth,
    target: document.getElementById('compassoBootstrapRetry').getBoundingClientRect().toJSON(),
  }));
  expect(geometry.width).toBeLessThanOrEqual(geometry.viewport);
  expect(geometry.target.width).toBeGreaterThanOrEqual(44);
  expect(geometry.target.height).toBeGreaterThanOrEqual(44);
  await page.keyboard.press('Tab');
  await expect(page.locator('#compassoBootstrapRetry')).toBeFocused();
  await expect(page.locator('#compassoBootstrapRetry')).toHaveCSS('outline-width', '3px');
  const focusContrast = await page.locator('#compassoBootstrapRetry').evaluate((button) => {
    const channels = (value) => value.match(/[\d.]+/g).slice(0, 3).map(Number);
    const luminance = (value) => channels(value).map((channel) => {
      const normalized = channel / 255;
      return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    }).reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
    const foreground = luminance(getComputedStyle(button).outlineColor);
    const background = luminance(getComputedStyle(document.querySelector('.compasso-bootstrap-card')).backgroundColor);
    return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
  });
  expect(focusContrast).toBeGreaterThanOrEqual(3);
});

test('controlled reload and browser-page reopen use the zero-recovery fast path', async ({ page, context }) => {
  await page.goto(PWA_URL);
  await coherent(page);
  const firstLoads = await loads(page);
  await page.reload();
  await coherent(page);
  expect(await loads(page)).toBe(firstLoads + 1);
  const reopened = await context.newPage();
  await reopened.goto(PWA_URL);
  await coherent(reopened);
  expect(await loads(reopened)).toBe(1);
});

test('no-update check reports current and performs zero reloads', async ({ page }) => {
  await page.goto(PWA_URL);
  await coherent(page);
  const before = await loads(page);
  await page.locator('#settingsBtn').click();
  await page.locator('#updateAppBtn').click();
  await expect(page.locator('#compassoUpdateStatus')).toContainText('atualizado');
  expect(await loads(page)).toBe(before);
  await expect(page.locator('.app-shell')).toBeVisible();
});

test('real update follows worker lifecycle and converges with one reload despite competing signals', async ({ page, request }) => {
  await mode(request, 'previous');
  await page.goto(PWA_URL);
  await coherent(page, PREVIOUS);
  const before = await loads(page);
  await mode(request, 'current');
  await page.evaluate(() => {
    const first = CompassoPwaLifecycle.checkForUpdate(document.getElementById('updateAppBtn'));
    const second = CompassoPwaLifecycle.checkForUpdate(document.getElementById('updateAppBtn'));
    window.__sameUpdateAttempt = first === second;
  });
  await coherent(page, CURRENT);
  expect(await loads(page)).toBe(before + 1);
  const budget = await page.evaluate(() => sessionStorage.getItem('compasso.pwa.reload-budget.v1'));
  expect(budget === null || budget === '{}').toBeTruthy();
});

test('update failure preserves the current coherent app and causes zero reloads', async ({ page, request }) => {
  await mode(request, 'previous');
  await page.goto(PWA_URL);
  await coherent(page, PREVIOUS);
  const before = await loads(page);
  await mode(request, 'fail-worker');
  await page.locator('#settingsBtn').click();
  await page.locator('#updateAppBtn').click();
  await expect(page.locator('#compassoUpdateStatus')).toContainText('Não foi possível');
  expect(await loads(page)).toBe(before);
  await expect(page.locator('.app-shell')).toBeVisible();
  await expect(page.locator('meta[name="compasso-application-generation"]')).toHaveAttribute('content', PREVIOUS);
  const retained = await page.evaluate(async () => ({
    controller: await CompassoPwaLifecycle.queryGeneration(navigator.serviceWorker.controller),
    lifecycle: CompassoPwaLifecycle.snapshot(),
  }));
  expect(retained.controller).toBe(PREVIOUS);
  expect(retained.lifecycle.coherent).toBe(true);
});

test('hard-bypass raw execution exhausts a used budget without a loop or destructive reset', async ({ page }) => {
  await page.goto(PWA_URL);
  await coherent(page);
  const used = `${CURRENT}|raw-recovery|/`;
  await page.evaluate((key) => sessionStorage.setItem('compasso.pwa.reload-budget.v1', JSON.stringify({ [key]: 1 })), used);
  const before = await loads(page);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setBypassServiceWorker', { bypass: true });
  await page.goto(PWA_URL);
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.pwaState)).toBe('budget-exhausted');
  expect(await loads(page)).toBe(before + 1);
  await expect(page.locator('.app-shell')).toBeHidden();
  await expect(page.locator('#compassoBootstrapRetry')).toBeVisible();
  await cdp.send('Network.setBypassServiceWorker', { bypass: false });
});

test('controlled complete cache reopens offline with composition and local state', async ({ page, context }) => {
  await page.goto(PWA_URL);
  await coherent(page);
  await page.locator('[data-ia-area="fronts"]').click();
  await page.locator('[data-ia-view="capabilities"]').click();
  await page.locator('[data-outcome-new]').first().click();
  await page.locator('[name="capability"]').fill('Explicar o ciclo offline');
  await page.locator('[name="futureUse"]').selectOption('integrate');
  await page.locator('[name="nextAttempt"]').fill('Reabrir a capacidade sem rede');
  await page.locator('#learningOutcomeForm [type="submit"]').click();
  await expect(page.locator('#learningOutcomeDialog')).toBeHidden();
  await page.locator('[data-outcome-today]').click();
  await expect(page.locator('[data-today-capability]')).toContainText('Reabrir a capacidade sem rede');
  await page.locator('[data-today-open-capability]').click();
  await page.locator('[data-signal-new]').last().click();
  await page.locator('#learningSignalKind').selectOption('question');
  await page.locator('#learningSignalText').fill('O que precisa permanecer disponível offline?');
  await page.locator('#learningSignalForm [type="submit"]').click();
  await page.locator('[data-outcome-execute]').click();
  await page.locator('#sessionStartForm').evaluate(form => form.requestSubmit());
  await page.locator('#sessionCompanionFinish').click();
  await page.locator('#sessionEvidenceSummary').fill('Evidência preservada offline');
  await page.locator('#sessionFinishForm').evaluate(form => form.requestSubmit());
  await expect(page.locator('[data-outcome-card]')).toContainText('Evidência preservada offline');
  await page.evaluate(() => CompassoInformationArchitecture.open('weekly'));
  const weeklyCapability=page.locator('[data-weekly-capability]').first();
  await weeklyCapability.locator('[data-weekly-reflection]').fill('Manter a tentativa após validar o shell offline');
  await weeklyCapability.locator('[data-weekly-decision]').selectOption('keep');
  await page.locator('#weeklyReviewForm').evaluate(form=>form.requestSubmit());
  await page.evaluate(async () => { const index=state.data.ritualTemplates.findIndex(item=>item.actionType==='study'&&!item.archived),ritual=CompassoRitualModel.update(state.data.ritualTemplates[index],{encodingCheckpoint:true});state.data.ritualTemplates[index]=ritual;state.data.study.find(item=>item.id==='example-study').ritualId=ritual.id;await CompassoStorage.save('compasso.app.v1',state.data);CompassoInformationArchitecture.open('study');renderAll(); });
  await page.locator('#studyGrid .ux-execute').first().click();
  await page.locator('[data-ux-run="ideal"]').click();
  await page.locator('#sessionStartForm').evaluate(form=>form.requestSubmit());
  await expect(page.locator('#sessionEncodingTrigger')).toBeVisible();
  await page.evaluate(() => localStorage.setItem('compasso.test.offline', 'preserved'));
  const before = await loads(page);
  await context.setOffline(true);
  await page.reload();
  await coherent(page);
  expect(await loads(page)).toBe(before + 1);
  expect(await page.evaluate(() => localStorage.getItem('compasso.test.offline'))).toBe('preserved');
  await expect(page.locator('#sessionEncodingTrigger')).toBeVisible();
  await page.locator('#sessionEncodingTrigger').click();
  await page.locator('[data-encoding-next="session"]').click();
  await page.locator('[data-encoding-choice="session"][value="connect"]').check();
  await page.locator('#sessionEncodingReturn').click();
  await page.locator('#sessionCompanionFinish').click();
  await page.locator('#sessionEvidenceSummary').fill('Encoding e Evidence preservados offline');
  await page.locator('#sessionFinishForm').evaluate(form=>form.requestSubmit());
  await expect(page.locator('#executionCompletionPanel')).toBeVisible();
  await page.evaluate(() => CompassoInformationArchitecture.open('capabilities'));
  await expect(page.locator('[data-outcome-card]')).toContainText('Explicar o ciclo offline');
  await expect(page.locator('[data-outcome-card]')).toContainText('Evidência preservada offline');
  await expect(page.locator('[data-outcome-card]')).toContainText('Uso pretendido: Conectar e combinar ideias');
  expect(await page.evaluate(() => state.data.learningOutcomes[0].nextAttempt.futureUse)).toBe('integrate');
  expect(await page.evaluate(() => state.data.executionSessions.some(item => item.learningContext?.futureUse === 'integrate'))).toBe(true);
  expect(await page.evaluate(() => state.data.executionSessions.some(item => item.learningContext?.attemptText === 'Reabrir a capacidade sem rede'))).toBe(true);
  expect(await page.evaluate(() => state.data.dailyPlans.some(plan => plan.items?.some(item => item.type === 'capability-attempt')))).toBe(true);
  expect(await page.evaluate(() => state.data.learningSignals.some(item => item.text.includes('disponível offline')))).toBe(true);
  expect(await page.evaluate(() => state.data.weeklyReviews.some(review => review.capabilityReflections?.some(item => item.decision === 'keep')))).toBe(true);
  expect(await page.evaluate(() => state.data.evidence.some(item => item.summary === 'Encoding e Evidence preservados offline'))).toBe(true);
  await expect(page.locator('link[href="./design-system.css"]')).toHaveCount(1);
  await context.setOffline(false);
});

test('executing raw document with a cached worker recovers offline at most once', async ({ page, context }) => {
  await page.goto(PWA_URL);
  await coherent(page);
  const before = await loads(page);
  await context.setOffline(true);
  await page.setContent(rawHtml, { waitUntil: 'domcontentloaded' });
  await coherent(page);
  expect(await loads(page)).toBe(before + 1);
  await context.setOffline(false);
});

test('shell-reset cancellation changes nothing and confirmation preserves persistence', async ({ page }) => {
  await page.goto(PWA_URL);
  await coherent(page);
  await page.evaluate(() => localStorage.setItem('compasso.test.shell-reset', 'preserved'));
  const beforeState = await page.evaluate(() => CompassoStorage.getSerialized('compasso.app.v1'));
  const beforeCaches = await page.evaluate(() => caches.keys());
  const beforeRegistrations = await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length);

  await page.evaluate(() => CompassoPwaLifecycle.openResetDialog(document.getElementById('settingsBtn')));
  await expect(page.locator('#compassoShellResetDialog')).toBeVisible();
  await expect(page.locator('#compassoShellResetCancel')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#settingsBtn')).toBeFocused();
  expect(await page.evaluate(() => caches.keys())).toEqual(beforeCaches);
  expect(await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length)).toBe(beforeRegistrations);

  const beforeLoads = await loads(page);
  await page.evaluate(() => CompassoPwaLifecycle.openResetDialog(document.getElementById('settingsBtn')));
  const resetNavigation = page.waitForEvent('load');
  await page.locator('#compassoShellResetConfirm').click();
  await resetNavigation;
  await coherent(page);
  expect(await loads(page)).toBe(beforeLoads + 1);
  expect(await page.evaluate(() => localStorage.getItem('compasso.test.shell-reset'))).toBe('preserved');
  expect(await page.evaluate(() => CompassoStorage.getSerialized('compasso.app.v1'))).toBe(beforeState);
});
