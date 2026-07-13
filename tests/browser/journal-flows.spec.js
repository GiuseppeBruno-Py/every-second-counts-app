const { test, expect } = require('@playwright/test');

async function journalReady(page) {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem('compasso.ux.mode.v1', 'essential'));
  await page.goto('/', { waitUntil:'domcontentloaded' });
  await page.waitForFunction(() => globalThis.CompassoFeatures?.installed === true);
  if (errors.length) throw new Error(`App bootstrap failed: ${errors.join(' | ')}`);
  await page.locator('[data-view="journal"]').click();
  await expect(page.locator('#journalView')).toBeVisible();
}

async function quickEntry(page, content) {
  await page.locator('#journalCaptureInput').fill(content);
  await page.locator('#journalCaptureInput').press('Enter');
}

test('Journal 1 · registro rápido persiste após recarregar', async ({ page }) => {
  await journalReady(page);
  await quickEntry(page, '/tarefa Preparar os testes do pipeline');
  await expect(page.locator('.journal-entry-content')).toContainText('Preparar os testes do pipeline');
  await page.reload();
  await page.waitForFunction(() => globalThis.CompassoFeatures?.installed);
  await page.locator('[data-view="journal"]').click();
  await expect(page.locator('.journal-entry-content')).toContainText('Preparar os testes do pipeline');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('compasso.app.v1') || '{}').journalEntries?.[0]?.taskStatus)).toBe('open');
});

test('Journal 2 · conclusão atualiza estado, métrica e persistência', async ({ page }) => {
  await journalReady(page);
  await quickEntry(page, '/tarefa Concluir fluxo de Journaling');
  await page.locator('[data-journal-complete]').click();
  await expect(page.locator('.journal-entry')).toHaveClass(/is-done/);
  await expect.poll(() => page.evaluate(() => ({
    status: JSON.parse(localStorage.getItem('compasso.app.v1') || '{}').journalEntries?.[0]?.taskStatus,
    rate: globalThis.CompassoJournalFeature.metrics().completionRate
  }))).toEqual({ status:'completed', rate:100 });
  await page.reload();
  await page.waitForFunction(() => globalThis.CompassoFeatures?.installed);
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('compasso.app.v1') || '{}').journalEntries?.[0]?.taskStatus)).toBe('completed');
});

test('Journal 3 · migração exige decisão e preserva histórico', async ({ page }) => {
  await journalReady(page);
  await quickEntry(page, '/tarefa Revisar arquitetura do sync');
  await page.locator('.journal-entry summary').click();
  await page.locator('[data-journal-migrate]').click();
  await expect(page.locator('#journalMigrationDialog')).toBeVisible();
  await page.locator('#journalMigrationDecision').selectOption('tomorrow');
  await page.locator('#journalMigrationReason').selectOption('lack_of_time');
  await page.locator('#journalMigrationForm').evaluate(form => form.requestSubmit());
  await expect.poll(() => page.evaluate(() => {
    const entries = JSON.parse(localStorage.getItem('compasso.app.v1') || '{}').journalEntries || [];
    return { origin:entries.find(item => item.taskStatus === 'migrated')?.taskStatus, destination:entries.find(item => item.taskStatus === 'open')?.migrationHistory?.[0]?.reason };
  })).toEqual({ origin:'migrated', destination:'lack_of_time' });
  await page.locator('[data-journal-date="1"]').click();
  await expect(page.locator('.journal-entry-content')).toContainText('Revisar arquitetura do sync');
});

test('Journal 4 · aprendizado vira nota e mantém referência de origem', async ({ page }) => {
  await journalReady(page);
  await quickEntry(page, '/aprendizado Coalesce evita shuffle completo quando reduz partições');
  await page.locator('.journal-entry summary').click();
  await page.locator('[data-journal-transform]').click();
  await page.locator('#journalTransformTarget').selectOption('note');
  await page.locator('#journalTransformForm').evaluate(form => form.requestSubmit());
  await expect.poll(() => page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('compasso.app.v1') || '{}');
    const entry = data.journalEntries?.find(item => item.entryType === 'learning');
    const note = data.notes?.find(item => item.sourceJournalEntryId === entry?.id);
    return { note:Boolean(note), result:entry?.resultRef?.id, noteId:note?.id, original:entry?.content };
  })).toMatchObject({ note:true, original:'Coalesce evita shuffle completo quando reduz partições' });
});

test('Journal 5 · encerramento diário decide pendências individualmente', async ({ page }) => {
  await journalReady(page);
  await quickEntry(page, '/tarefa Concluir uma tarefa');
  await quickEntry(page, '/tarefa Migrar uma tarefa');
  await quickEntry(page, '/tarefa Cancelar uma tarefa');
  await page.locator('[data-journal-close-day]').click();
  const decisions = page.locator('[data-journal-close-decision]');
  await decisions.nth(0).selectOption('complete');
  await decisions.nth(1).selectOption('tomorrow');
  await decisions.nth(2).selectOption('cancel');
  await page.locator('#journalCloseForm textarea[name="important"]').fill('Decidi cada pendência conscientemente.');
  await page.locator('#journalCloseForm').evaluate(form => form.requestSubmit());
  await expect.poll(() => page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('compasso.app.v1') || '{}');
    const statuses = (data.journalEntries || []).map(item => item.taskStatus);
    const closed = Object.values(data.dailyJournals || {}).some(day => Boolean(day.closedAt));
    return { completed:statuses.includes('completed'), migrated:statuses.includes('migrated'), cancelled:statuses.includes('cancelled'), open:statuses.includes('open'), closed };
  })).toEqual({ completed:true, migrated:true, cancelled:true, open:true, closed:true });
});

test('Journal 6 · fluxo móvel não cria overflow horizontal', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile only');
  await journalReady(page);
  await quickEntry(page, '/tarefa Validar o menu contextual no celular');
  await page.locator('.journal-entry summary').click();
  await expect(page.locator('.journal-menu')).toBeVisible();
  const size = await page.evaluate(() => ({ scroll:document.documentElement.scrollWidth, client:document.documentElement.clientWidth, menu:document.querySelector('.journal-menu').getBoundingClientRect() }));
  expect(size.scroll).toBeLessThanOrEqual(size.client + 1);
  expect(size.menu.left).toBeGreaterThanOrEqual(0);
  expect(size.menu.right).toBeLessThanOrEqual(size.client + 1);
});

test('Journal 7 · PWA cria e restaura entrada sem rede', async ({ page, context }) => {
  await journalReady(page);
  await page.evaluate(() => navigator.serviceWorker?.ready);
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker?.controller && globalThis.CompassoFeatures?.installed);
  await page.locator('[data-view="journal"]').click();
  await context.setOffline(true);
  await quickEntry(page, '/nota Registro criado offline');
  await page.reload({ waitUntil:'domcontentloaded' });
  await page.waitForFunction(() => globalThis.CompassoFeatures?.installed);
  await page.locator('[data-view="journal"]').click();
  await expect(page.locator('.journal-entry-content')).toContainText('Registro criado offline');
});
