const { test, expect } = require('@playwright/test');
const fs = require('node:fs');

async function open(page) {
  await page.route(/^https?:\/(?!\/127\.0\.0\.1)/, route => route.abort());
  await page.addInitScript(() => localStorage.setItem('compasso.ux.mode.v1', 'advanced'));
  await page.addInitScript(() => {
    globalThis.CompassoDriveSync ||= {
      prepareLocalState(input) { return { data: structuredClone(input), baseline: new Map() }; },
      activateLocalState() {}
    };
  });
  await page.goto('/?view=weakness', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => globalThis.CompassoFeatures?.installed);
  await expect(page.locator('#weaknessView')).toBeVisible();
}

async function resetNotebook(page) {
  await page.evaluate(async () => {
    state.data.errorNotebook = [];
    state.data.reviewItems = [];
    await CompassoStorage.save('compasso.app.v1', state.data);
    renderAll();
  });
}

async function fillStructuredRecord(page, suffix = '') {
  await page.locator('#errorTitle').fill(`Apresentação técnica${suffix}`);
  await page.locator('#errorContext').fill('Falei rápido e perdi o raciocínio na segunda parte.');
  await page.locator('#errorInterpretation').fill('Talvez eu não seja bom apresentando.');
  await page.locator('#errorHypothesis').fill('Não ensaiei as transições entre os tópicos.');
  await page.locator('#errorCorrection').fill('As transições devem ser claras e verificáveis.');
  await page.locator('#errorNextAction').fill('Fazer dois ensaios completos cronometrados.');
}

test('registro v2 persiste os cinco estágios e mantém identidade ao editar', async ({ page }) => {
  await open(page);
  await resetNotebook(page);
  await page.locator('[data-error-new]').click();
  await fillStructuredRecord(page);
  await page.locator('#weaknessForm').evaluate(form => form.requestSubmit());
  await expect(page.locator('#weaknessDialog')).toBeHidden();
  const created = await page.evaluate(() => structuredClone(state.data.errorNotebook[0]));
  expect(created).toMatchObject({
    schemaVersion: 2,
    context: 'Falei rápido e perdi o raciocínio na segunda parte.',
    interpretation: 'Talvez eu não seja bom apresentando.',
    hypothesis: 'Não ensaiei as transições entre os tópicos.',
    correction: 'As transições devem ser claras e verificáveis.',
    nextAction: 'Fazer dois ensaios completos cronometrados.'
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => globalThis.CompassoFeatures?.installed);
  await expect(page.locator('#errorNotebookList')).toContainText('Hipótese:');
  await page.locator('[data-error-edit]').click();
  await expect(page.locator('#errorInterpretation')).toHaveValue(created.interpretation);
  await page.locator('#errorHypothesis').fill('As transições não foram praticadas em voz alta.');
  await page.locator('#weaknessForm').evaluate(form => form.requestSubmit());
  const edited = await page.evaluate(() => structuredClone(state.data.errorNotebook[0]));
  expect(edited.id).toBe(created.id);
  expect(edited.createdAt).toBe(created.createdAt);
  expect(edited.hypothesis).toBe('As transições não foram praticadas em voz alta.');
});

test('campos reflexivos são opcionais e cancelar ou Escape não grava', async ({ page }) => {
  await open(page);
  await resetNotebook(page);
  const trigger = page.locator('[data-error-new]');
  await trigger.click();
  await expect(page.locator('#errorTitle')).toBeFocused();
  await page.locator('#errorTitle').fill('Registro cancelado');
  await page.keyboard.press('Escape');
  await expect(page.locator('#weaknessDialog')).toBeHidden();
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => state.data.errorNotebook.length)).toBe(0);

  await trigger.click();
  await page.locator('#errorTitle').fill('Registro mínimo');
  await page.locator('#errorCorrection').fill('Definir uma correção específica.');
  await page.locator('#errorNextAction').fill('Executar a próxima tentativa.');
  await page.locator('#weaknessForm').evaluate(form => form.requestSubmit());
  expect(await page.evaluate(() => state.data.errorNotebook[0])).toMatchObject({
    schemaVersion: 2, interpretation: '', hypothesis: ''
  });
});

test('registro v1 abre sem mutação e só evolui por salvamento explícito', async ({ page }) => {
  await open(page);
  const before = await page.evaluate(async () => {
    const legacy = {
      id: 'legacy-error', schemaVersion: 1, title: 'Erro legado',
      context: 'Contexto preservado', correction: 'Correção preservada',
      nextAction: 'Ação preservada', status: 'open', createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z', resolvedAt: null, extensionCanary: 'preservar'
    };
    state.data.errorNotebook = [legacy];
    await CompassoStorage.save('compasso.app.v1', state.data);
    renderAll();
    return JSON.stringify(state.data.errorNotebook[0]);
  });
  await expect(page.locator('#errorNotebookList')).toContainText('Fato observado: Contexto preservado');
  expect(await page.evaluate(() => JSON.stringify(state.data.errorNotebook[0]))).toBe(before);
  await page.locator('[data-error-edit]').click();
  await expect(page.locator('#errorInterpretation')).toHaveValue('');
  await expect(page.locator('#errorHypothesis')).toHaveValue('');
  expect(await page.evaluate(() => JSON.stringify(state.data.errorNotebook[0]))).toBe(before);
  await page.locator('#errorInterpretation').fill('Interpretação adicionada conscientemente.');
  await page.locator('#weaknessForm').evaluate(form => form.requestSubmit());
  expect(await page.evaluate(() => state.data.errorNotebook[0])).toMatchObject({
    id: 'legacy-error', schemaVersion: 2, extensionCanary: 'preservar',
    interpretation: 'Interpretação adicionada conscientemente.', hypothesis: ''
  });
});

test('ponto fraco preserva prefill, vínculo e proveniência sem fabricar reflexão', async ({ page }) => {
  await open(page);
  await resetNotebook(page);
  const source = await page.evaluate(async () => {
    const study = state.data.study.find(item => item.id === 'example-study');
    const reviewedAt = new Date().toISOString();
    const card = {
      id: 'weak-source-card', schemaVersion: 2, sourceType: 'manual', sourceId: null,
      domain: 'study', itemId: study.id, prompt: 'Explique a diferença entre custo estimado e custo real.',
      answer: 'Comparar o plano estimado com as métricas observadas.', reviewCount: 1,
      intervalDays: 1, dueAt: reviewedAt, lastReviewedAt: reviewedAt, lastRating: 'again',
      reviewHistory: [{ reviewedAt, rating: 'again', intervalDays: 1, dueAt: reviewedAt }],
      createdAt: reviewedAt, updatedAt: reviewedAt
    };
    state.data.reviewItems = [card];
    await CompassoStorage.save('compasso.app.v1', state.data);
    renderAll();
    return { title: study.title, answer: card.answer };
  });
  await page.locator('[data-error-from-card="weak-source-card"]').click();
  await expect(page.locator('#errorTitle')).toHaveValue(`Dificuldade em ${source.title}`);
  await expect(page.locator('#errorContext')).toHaveValue('A recuperação foi avaliada como errei.');
  await expect(page.locator('#errorCorrection')).toHaveValue(source.answer);
  await expect(page.locator('#errorInterpretation')).toHaveValue('');
  await expect(page.locator('#errorHypothesis')).toHaveValue('');
  await expect(page.locator('#errorLink')).toHaveValue('study:example-study');
  await page.locator('#weaknessForm').evaluate(form => form.requestSubmit());
  expect(await page.evaluate(() => state.data.errorNotebook[0])).toMatchObject({
    schemaVersion: 2, sourceCardId: 'weak-source-card', domain: 'study', itemId: 'example-study',
    interpretation: '', hypothesis: ''
  });
});

test('resolver, reabrir e excluir preservam conteúdo e isolam outros registros', async ({ page }) => {
  await open(page);
  await resetNotebook(page);
  await page.locator('[data-error-new]').click();
  await fillStructuredRecord(page, ' para ciclo de status');
  await page.locator('#weaknessForm').evaluate(form => form.requestSubmit());
  const created = await page.evaluate(() => structuredClone(state.data.errorNotebook[0]));
  await page.locator(`[data-error-toggle="${created.id}"]`).click();
  const resolved = await page.evaluate(id => structuredClone(state.data.errorNotebook.find(item => item.id === id)), created.id);
  expect(resolved).toMatchObject({
    id: created.id, status: 'resolved', interpretation: created.interpretation,
    hypothesis: created.hypothesis, correction: created.correction, nextAction: created.nextAction
  });
  expect(resolved.resolvedAt).toBeTruthy();
  await page.locator(`[data-error-toggle="${created.id}"]`).click();
  const reopened = await page.evaluate(id => structuredClone(state.data.errorNotebook.find(item => item.id === id)), created.id);
  expect(reopened).toMatchObject({
    id: created.id, status: 'open', resolvedAt: null, interpretation: created.interpretation,
    hypothesis: created.hypothesis, correction: created.correction, nextAction: created.nextAction
  });
  const protectedBefore = await page.evaluate(() => JSON.stringify({ notes: state.data.notes, evidence: state.data.evidence }));
  page.once('dialog', dialog => dialog.accept());
  await page.locator(`[data-error-delete="${created.id}"]`).click();
  await expect.poll(() => page.evaluate(id => state.data.errorNotebook.some(item => item.id === id), created.id)).toBe(false);
  expect(await page.evaluate(() => JSON.stringify({ notes: state.data.notes, evidence: state.data.evidence }))).toBe(protectedBefore);
});

test('falha durável restaura estado, mantém draft e permite retry sem duplicar', async ({ page }) => {
  await open(page);
  await resetNotebook(page);
  await page.locator('[data-error-new]').click();
  await fillStructuredRecord(page, ' com retry');
  await page.evaluate(() => {
    window.__weaknessStorage = CompassoStorage;
    window.CompassoStorage = Object.freeze({ ...CompassoStorage, save: async () => false });
  });
  await page.locator('#weaknessForm').evaluate(form => {
    form.requestSubmit();
    form.requestSubmit();
  });
  await expect(page.locator('#weaknessError')).toBeVisible();
  await expect(page.locator('#weaknessError')).toBeFocused();
  await expect(page.locator('#errorHypothesis')).toHaveValue('Não ensaiei as transições entre os tópicos.');
  expect(await page.evaluate(() => state.data.errorNotebook.length)).toBe(0);
  await page.evaluate(() => { window.CompassoStorage = window.__weaknessStorage; });
  await page.locator('#weaknessForm').evaluate(form => form.requestSubmit());
  await expect(page.locator('#weaknessDialog')).toBeHidden();
  expect(await page.evaluate(() => state.data.errorNotebook.length)).toBe(1);
});

test('backup v2 faz round-trip e backup legado não fabrica novos campos', async ({ page }) => {
  await open(page);
  await resetNotebook(page);
  await page.locator('[data-error-new]').click();
  await fillStructuredRecord(page, ' no backup');
  await page.locator('#weaknessForm').evaluate(form => form.requestSubmit());
  await page.locator('#settingsBtn').click();
  page.once('dialog', dialog => dialog.accept());
  const downloadEvent = page.waitForEvent('download');
  await page.locator('#exportBtn').click();
  const backupPath = await (await downloadEvent).path();
  const backupBuffer = fs.readFileSync(backupPath);
  expect(JSON.parse(backupBuffer.toString('utf8')).errorNotebook[0].schemaVersion).toBe(2);
  await page.evaluate(async () => {
    state.data.errorNotebook = [];
    await CompassoStorage.save('compasso.app.v1', state.data);
    renderAll();
  });
  await page.locator('#importInput').setInputFiles({
    name: 'errors-v2.json', mimeType: 'application/json', buffer: backupBuffer
  });
  await expect(page.locator('#restoreDialog')).toBeVisible();
  await page.locator('#restoreConfirmBtn').click();
  await expect(page.locator('#restoreDialog')).toBeHidden();
  expect(await page.evaluate(() => state.data.errorNotebook[0])).toMatchObject({
    schemaVersion: 2,
    interpretation: 'Talvez eu não seja bom apresentando.',
    hypothesis: 'Não ensaiei as transições entre os tópicos.'
  });

  const legacy = await page.evaluate(() => ({
    ...structuredClone(state.data),
    errorNotebook: [{ id: 'restored-v1-error', schemaVersion: 1, title: 'Legado restaurado',
      context: 'Fato antigo', correction: 'Correção antiga', nextAction: 'Ação antiga',
      status: 'open', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]
  }));
  await page.locator('#importInput').setInputFiles({
    name: 'errors-v1.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(legacy))
  });
  await page.locator('#restoreConfirmBtn').click();
  await expect(page.locator('#restoreDialog')).toBeHidden();
  const restored = await page.evaluate(() => state.data.errorNotebook[0]);
  expect(restored).not.toHaveProperty('interpretation');
  expect(restored).not.toHaveProperty('hypothesis');
});
