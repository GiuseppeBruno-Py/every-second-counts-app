const { test, expect } = require('@playwright/test');

async function open(page, view = 'weekly') {
  await page.route(/^https?:\/(?!\/127\.0\.0\.1)/, route => route.abort());
  await page.addInitScript(() => localStorage.setItem('compasso.ux.mode.v1', 'advanced'));
  await page.addInitScript(() => {
    globalThis.CompassoDriveSync ||= {
      prepareLocalState(input) { return { data: structuredClone(input), baseline: new Map() }; },
      activateLocalState() {}
    };
  });
  await page.goto(`/?view=${view}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => globalThis.CompassoFeatures?.installed && globalThis.CompassoCapabilityContextModel);
  await expect(page.locator(`#${view}View`)).toBeVisible();
}

async function resetWeeklyContext(page) {
  await page.evaluate(async () => {
    state.data.weeklyReviews = [];
    state.data.learningOutcomes = [];
    state.data.learningSignals = [];
    state.data.executionSessions = [];
    state.data.evidence = [];
    await CompassoStorage.save('compasso.app.v1', state.data);
    renderAll();
  });
}

async function submit(page) {
  await page.locator('#weeklyReviewForm').evaluate(form => form.requestSubmit());
}

test('perguntas positivas são opcionais, distintas e persistem apenas ao salvar', async ({ page }) => {
  await open(page);
  await resetWeeklyContext(page);
  const repeatable = page.getByLabel('O que funcionou esta semana e merece ser repetido?');
  const evidence = page.getByLabel('Alguma evidência mudou sua percepção sobre o que você consegue fazer?');
  await expect(repeatable).toHaveValue('');
  await expect(evidence).toHaveValue('');
  expect(await page.evaluate(() => state.data.weeklyReviews.length)).toBe(0);
  await submit(page);
  await expect.poll(() => page.evaluate(() => state.data.weeklyReviews.length)).toBe(1);
  expect(await page.evaluate(() => state.data.weeklyReviews[0])).toMatchObject({
    schemaVersion: 2,
    repeatablePractice: '',
    evidenceReflection: ''
  });

  await repeatable.fill('Começar pela definição simples merece ser repetido');
  await evidence.fill('A Evidence mostrou que já consigo explicar com um exemplo');
  expect(await page.evaluate(() => state.data.weeklyReviews[0].repeatablePractice)).toBe('');
  await submit(page);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => globalThis.CompassoFeatures?.installed);
  await expect(repeatable).toHaveValue('Começar pela definição simples merece ser repetido');
  await expect(evidence).toHaveValue('A Evidence mostrou que já consigo explicar com um exemplo');
});

test('texto positivo ou negativo nunca infere KEEP ou REVISE', async ({ page }) => {
  await open(page, 'capabilities');
  await page.locator('[data-outcome-new]').first().click();
  await page.locator('[name="capability"]').fill('Explicar índices');
  await page.locator('[name="nextAttempt"]').fill('Comparar dois índices');
  await page.locator('#learningOutcomeForm').evaluate(form => form.requestSubmit());
  const before = await page.evaluate(() => structuredClone(state.data.learningOutcomes[0]));
  await page.evaluate(async () => {
    const outcome = state.data.learningOutcomes[0];
    const now = new Date().toISOString();
    state.data.executionSessions = [{
      id: 'weekly-positive-execution', source: { collection: 'sessions', id: 'weekly-positive-execution' },
      mode: 'quick', status: 'completed', domain: 'learningOutcome', itemId: outcome.id,
      learningContext: CompassoLearningOutcomeModel.createExecutionContext(outcome),
      startedAt: now, endedAt: now, durationMs: 60000, updatedAt: now
    }];
    await CompassoStorage.save('compasso.app.v1', state.data);
    CompassoInformationArchitecture.open('weekly');
    renderAll();
  });
  const card = page.locator('[data-weekly-capability]').first();
  const decision = card.locator('[data-weekly-decision]');
  await page.locator('#weeklyRepeatablePractice').fill('Funcionou muito bem e quero repetir');
  await page.locator('#weeklyEvidenceReflection').fill('Ainda não funcionou e preciso mudar');
  await expect(decision).toHaveValue('');
  await decision.selectOption('keep');
  await submit(page);
  expect(await page.evaluate(() => state.data.learningOutcomes[0])).toEqual(before);
  expect(await page.evaluate(() => state.data.weeklyReviews[0].capabilityReflections[0].decision)).toBe('keep');

  await decision.selectOption('revise');
  await card.locator('[data-weekly-attempt]').fill('Testar seletividade em dados reais');
  await submit(page);
  const revised = await page.evaluate(() => state.data.learningOutcomes[0]);
  expect(revised.nextAttempt.id).toBe(before.nextAttempt.id);
  expect(revised.nextAttempt.text).toBe('Testar seletividade em dados reais');
  expect(await page.evaluate(() => state.data.weeklyReviews[0].capabilityReflections[0].decision)).toBe('revise');
});

test('revisão v1 mantém significado histórico e só vira v2 por ação explícita', async ({ page }) => {
  await open(page);
  await resetWeeklyContext(page);
  const legacy = await page.evaluate(async () => {
    const dateKey = value => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() + (startDate.getDay() === 0 ? -6 : 1 - startDate.getDay()));
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    const start = dateKey(startDate);
    const end = dateKey(endDate);
    const review = {
      id: 'legacy-weekly-review', schemaVersion: 1, weekStart: start, weekEnd: end,
      wins: 'Principal avanço legado', lessons: 'Aprendizado legado', blockers: 'Bloqueio legado',
      decision: 'Decisão legada', quality: 4, priorities: [], capabilityReflections: [],
      reviewedAt: '2026-09-19T10:00:00.000Z', updatedAt: '2026-09-19T10:00:00.000Z'
    };
    state.data.weeklyReviews = [review];
    await CompassoStorage.save('compasso.app.v1', state.data);
    renderAll();
    return JSON.stringify(state.data.weeklyReviews[0]);
  });
  await expect(page.locator('#weeklyWins')).toHaveValue('Principal avanço legado');
  await expect(page.locator('#weeklyLessons')).toHaveValue('Aprendizado legado');
  await expect(page.locator('#weeklyRepeatablePractice')).toHaveValue('');
  await expect(page.locator('#weeklyEvidenceReflection')).toHaveValue('');
  expect(await page.evaluate(() => JSON.stringify(state.data.weeklyReviews[0]))).toBe(legacy);

  await page.locator('#weeklyRepeatablePractice').fill('Repetir a comparação por exemplos');
  await submit(page);
  expect(await page.evaluate(() => state.data.weeklyReviews[0])).toMatchObject({
    id: 'legacy-weekly-review', schemaVersion: 2, wins: 'Principal avanço legado',
    lessons: 'Aprendizado legado', blockers: 'Bloqueio legado', decision: 'Decisão legada', quality: 4,
    repeatablePractice: 'Repetir a comparação por exemplos', evidenceReflection: ''
  });
});

test('falha durável preserva estado anterior, draft completo e retry', async ({ page }) => {
  await open(page);
  await resetWeeklyContext(page);
  await page.locator('#weeklyRepeatablePractice').fill('Repetir o roteiro curto');
  await page.locator('#weeklyEvidenceReflection').fill('A Evidence tornou o progresso verificável');
  await page.evaluate(() => {
    window.__weeklyStorage = CompassoStorage;
    window.CompassoStorage = Object.freeze({ ...CompassoStorage, save: async () => false });
  });
  await submit(page);
  await expect(page.locator('#weeklyReviewMeta')).toBeVisible();
  await expect(page.locator('#weeklyReviewMeta')).toBeFocused();
  await expect(page.locator('#weeklyRepeatablePractice')).toHaveValue('Repetir o roteiro curto');
  await expect(page.locator('#weeklyEvidenceReflection')).toHaveValue('A Evidence tornou o progresso verificável');
  expect(await page.evaluate(() => state.data.weeklyReviews.length)).toBe(0);
  await page.evaluate(() => { window.CompassoStorage = window.__weeklyStorage; });
  await submit(page);
  await expect.poll(() => page.evaluate(() => state.data.weeklyReviews.length)).toBe(1);
});

test('backup novo faz round-trip e backup v1 não fabrica respostas', async ({ page }) => {
  await open(page);
  await resetWeeklyContext(page);
  await page.locator('#weeklyRepeatablePractice').fill('Manter revisão baseada em fatos');
  await page.locator('#weeklyEvidenceReflection').fill('A evidência confirmou uma capacidade específica');
  await submit(page);
  await page.locator('#settingsBtn').click();
  page.once('dialog', dialog => dialog.accept());
  const downloadEvent = page.waitForEvent('download');
  await page.locator('#exportBtn').click();
  const download = await downloadEvent;
  const path = await download.path();
  await page.evaluate(async () => {
    state.data.weeklyReviews = [];
    await CompassoStorage.save('compasso.app.v1', state.data);
    renderAll();
  });
  await page.locator('#importInput').setInputFiles(path);
  await expect(page.locator('#restoreDialog')).toBeVisible();
  await page.locator('#restoreConfirmBtn').click();
  await expect(page.locator('#restoreDialog')).toBeHidden();
  expect(await page.evaluate(() => state.data.weeklyReviews[0])).toMatchObject({
    repeatablePractice: 'Manter revisão baseada em fatos',
    evidenceReflection: 'A evidência confirmou uma capacidade específica'
  });

  const legacy = await page.evaluate(() => {
    const dateKey = value => `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() + (start.getDay() === 0 ? -6 : 1 - start.getDay()));
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return {
      ...structuredClone(state.data),
      weeklyReviews: [{
        id: 'restored-v1', schemaVersion: 1, weekStart: dateKey(start), weekEnd: dateKey(end),
        wins: 'Avanço antigo', lessons: 'Lição antiga', blockers: '', decision: '', quality: null,
        priorities: [], capabilityReflections: [], reviewedAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      }]
    };
  });
  await page.locator('#importInput').setInputFiles({
    name: 'weekly-v1.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(legacy))
  });
  await page.locator('#restoreConfirmBtn').click();
  await expect(page.locator('#restoreDialog')).toBeHidden();
  const restored = await page.evaluate(() => state.data.weeklyReviews[0]);
  expect(restored).not.toHaveProperty('repeatablePractice');
  expect(restored).not.toHaveProperty('evidenceReflection');
});
