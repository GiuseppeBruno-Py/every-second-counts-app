const { test, expect } = require('@playwright/test');
const fs = require('node:fs/promises');

async function open(page, view = 'capabilities') {
  const external = [];
  await page.route(/^https?:\/(?!\/127\.0\.0\.1)/, route => {
    external.push(route.request().url());
    return route.abort();
  });
  await page.addInitScript(() => localStorage.setItem('compasso.ux.mode.v1', 'advanced'));
  await page.addInitScript(() => {
    globalThis.CompassoDriveSync ||= {
      prepareLocalState(input) { return { data: structuredClone(input), baseline: new Map() }; },
      activateLocalState() {}
    };
  });
  await page.goto(`/?view=${view}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => globalThis.CompassoFeatures?.installed && globalThis.CompassoLearningOutcomeModel);
  return external;
}

async function createPrimaryCapability(page, values = {}) {
  await page.locator('[data-outcome-new]').first().click();
  await page.locator('[name="capability"]').fill(values.capability || 'Explicar uma escolha técnica');
  await page.locator('[name="nextAttempt"]').fill(values.attempt || 'Comparar duas alternativas com um exemplo');
  await page.locator('#learningOutcomeForm').evaluate(form => form.requestSubmit());
  await expect(page.locator('#learningOutcomeDialog')).toBeHidden();
  await page.locator('[data-outcome-card]').first().locator('[data-outcome-today]').click();
  await expect(page.locator('#todayView')).toBeVisible();
  return page.locator('#todayPrimaryAction');
}

async function fillRehearsal(page, suffix = '') {
  const values = {
    result: `Produzir uma explicação verificável ${suffix}`.trim(),
    firstAction: `Começar pela definição simples ${suffix}`.trim(),
    difficulty: `Confundir conceitos próximos ${suffix}`.trim(),
    response: `Comparar os conceitos com um exemplo ${suffix}`.trim()
  };
  await page.locator('#todayRehearsalResult').fill(values.result);
  await page.locator('#todayRehearsalFirstAction').fill(values.firstAction);
  await page.locator('#todayRehearsalDifficulty').fill(values.difficulty);
  await page.locator('#todayRehearsalResponse').fill(values.response);
  return values;
}

test('início direto continua primário e não abre o ensaio', async ({ page }) => {
  await open(page);
  const primary = await createPrimaryCapability(page);
  const start = primary.locator('[data-today-primary-start]');
  const rehearse = primary.locator('[data-today-primary-rehearse]');
  await expect(start).toHaveClass(/primary-btn/);
  await expect(rehearse).toHaveClass(/secondary-btn/);
  expect(await primary.locator('.today-primary-actions button').allTextContents()).toEqual([
    'Iniciar agora', 'Ensaiar tentativa', 'Ajustar sessão', 'Abrir capacidade', 'Concluir no plano', 'Remover do plano'
  ]);
  await start.click();
  await expect(page.locator('#todayRehearsalDialog')).toBeHidden();
  await expect.poll(() => page.evaluate(() => state.data.sessions.length)).toBe(1);
  await expect(page.locator('#sessionCompanionOpen')).toBeFocused();
});

test('preflight mantém quatro respostas somente no DOM e descarta em cancelar ou Escape', async ({ page }) => {
  await open(page);
  const primary = await createPrimaryCapability(page);
  const trigger = primary.locator('[data-today-primary-rehearse]');
  const before = await page.evaluate(() => ({ state: JSON.stringify(state.data), stored: CompassoStorage.getSerialized('compasso.app.v1') }));
  await trigger.click();
  const dialog = page.locator('#todayRehearsalDialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
  await expect(page.locator('#todayRehearsalResult')).toBeFocused();
  for (const label of [
    'Qual resultado você quer produzir nesta tentativa?',
    'Qual é a primeira ação concreta?',
    'Qual dificuldade provavelmente aparecerá?',
    'Como você pretende responder quando ela aparecer?'
  ]) await expect(dialog.getByLabel(label)).toBeVisible();
  await fillRehearsal(page, 'cancelar');
  expect(await page.evaluate(() => ({ state: JSON.stringify(state.data), stored: CompassoStorage.getSerialized('compasso.app.v1') }))).toEqual(before);
  await page.getByRole('button', { name: 'Cancelar', exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => state.data.sessions.length)).toBe(0);
  await trigger.click();
  for (const id of ['todayRehearsalResult', 'todayRehearsalFirstAction', 'todayRehearsalDifficulty', 'todayRehearsalResponse']) await expect(page.locator(`#${id}`)).toHaveValue('');
  await fillRehearsal(page, 'escape');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => JSON.stringify(state.data))).toBe(before.state);
});

test('Session ensaiada usa o mesmo default sem persistir respostas', async ({ page }) => {
  test.setTimeout(60000); // Complete lifecycle plus two real filesystem downloads.
  await open(page);
  const primary = await createPrimaryCapability(page, { attempt: 'Explicar broadcast join claramente' });
  await primary.locator('[data-today-primary-rehearse]').click();
  const values = await fillRehearsal(page, 'não persistir 8472');
  await page.locator('#todayRehearsalSubmit').click();
  await expect(page.locator('#todayRehearsalDialog')).toBeHidden();
  await expect.poll(() => page.evaluate(() => state.data.sessions.length)).toBe(1);
  const started = await page.evaluate(() => ({
    session: state.data.sessions[0],
    execution: state.data.executionSessions.find(item => item.id === state.data.sessions[0].id),
    serialized: JSON.stringify(state.data)
  }));
  expect(started.session.domain).toBe('learningOutcome');
  expect(started.session.intent).toBe('Explicar broadcast join claramente');
  expect(started.execution.learningContext).toEqual(started.session.learningContext);
  for (const value of Object.values(values)) expect(started.serialized).not.toContain(value);
  await page.reload();
  await page.waitForFunction(() => globalThis.CompassoFeatures?.installed);
  await page.locator('[data-today-resume]').click();
  await expect(page.locator('#sessionCompanionOpen')).toBeFocused();
  await page.locator('#sessionCompanionFinish').click();
  await page.locator('#sessionEvidenceSummary').fill('Expliquei broadcast join usando um exemplo verificável');
  await page.locator('#sessionFinishForm').evaluate(form => form.requestSubmit());
  await expect(page.locator('#executionCompletionPanel')).toBeVisible();
  const completed = await page.evaluate(() => ({ session: state.data.sessions[0], evidence: state.data.evidence[0], data: JSON.stringify(state.data) }));
  expect(completed.session.status).toBe('completed');
  expect(completed.evidence.sessionId).toBe(completed.session.id);
  expect(completed.evidence.summary).toBe('Expliquei broadcast join usando um exemplo verificável');
  for (const value of Object.values(values)) expect(completed.data).not.toContain(value);
  await page.locator('[data-completion-today]').click();
  await page.locator('#settingsBtn').click();
  page.once('dialog', dialog => dialog.accept());
  const backupEvent = page.waitForEvent('download');
  await page.locator('#exportBtn').click();
  const backup = await backupEvent;
  const json = await fs.readFile(await backup.path(), 'utf8');
  expect(JSON.parse(json)).toBeTruthy();
  expect(json).toContain(completed.session.id);
  for (const value of Object.values(values)) expect(json).not.toContain(value);
  await page.keyboard.press('Escape');
  await page.evaluate(() => CompassoInformationArchitecture.open('notes'));
  await page.locator('[data-open-note]').first().evaluate(button => button.click());
  const markdownEvent = page.waitForEvent('download');
  await page.locator('[data-export-note]').evaluate(button => button.click());
  const markdown = await markdownEvent;
  const text = await fs.readFile(await markdown.path(), 'utf8');
  expect(text).toBe(await page.evaluate(() => state.data.notes.find(note => note.id === state.selectedNoteId).content));
  for (const value of Object.values(values)) expect(text).not.toContain(value);
});

test('falha de escrita preserva draft para retry confirmado', async ({ page }) => {
  await open(page);
  const primary = await createPrimaryCapability(page, { attempt: 'Validar o início confirmado' });
  const trigger = primary.locator('[data-today-primary-rehearse]');
  await trigger.click();
  await page.evaluate(() => { window.__rehearsalStorage = CompassoStorage; window.CompassoStorage = Object.freeze({ ...CompassoStorage, save: async () => false }); });
  const values = await fillRehearsal(page, 'retry 5129');
  await page.locator('#todayRehearsalSubmit').click();
  await expect(page.locator('#todayRehearsalDialog')).toBeVisible();
  await expect(page.locator('#todayRehearsalError')).toBeVisible();
  await expect(page.locator('#todayRehearsalError')).toBeFocused();
  await expect(page.locator('#todayRehearsalResult')).toHaveValue(values.result);
  expect(await page.evaluate(() => state.data.sessions.length)).toBe(0);
  await page.evaluate(() => { window.CompassoStorage = window.__rehearsalStorage; });
  await page.locator('#todayRehearsalSubmit').click();
  await expect.poll(() => page.evaluate(() => state.data.sessions.length)).toBe(1);
  await expect(page.locator('#todayRehearsalDialog')).toBeHidden();
});

for (const filled of [false, true]) {
  test(`skip real descarta draft ${filled ? 'preenchido' : 'vazio'} mesmo em falha e permite retry`, async ({ page }) => {
    await open(page);
    const primary = await createPrimaryCapability(page);
    await primary.locator('[data-today-primary-rehearse]').click();
    if (filled) await fillRehearsal(page, 'skip');
    await page.evaluate(() => { window.__storage = CompassoStorage; window.CompassoStorage = Object.freeze({ ...CompassoStorage, save: async () => false }); });
    await page.locator('[data-today-rehearsal-skip]').click();
    await expect(page.locator('#todayRehearsalError')).toBeVisible();
    for (const field of await page.locator('#todayRehearsalDialog textarea').all()) await expect(field).toHaveValue('');
    expect(await page.evaluate(() => state.data.sessions.length)).toBe(0);
    await page.evaluate(() => { window.CompassoStorage = window.__storage; });
    await page.locator('[data-today-rehearsal-skip]').click();
    await expect(page.locator('#todayRehearsalDialog')).toBeHidden();
    await expect.poll(() => page.evaluate(() => state.data.sessions.length)).toBe(1);
    expect(await page.evaluate(() => state.data.sessions[0].intent)).toBe('Comparar duas alternativas com um exemplo');
  });
  test(`submissão ${filled ? 'parcial' : 'vazia'} inicia sem validação de conteúdo`, async ({ page }) => {
    await open(page);
    const primary = await createPrimaryCapability(page);
    await primary.locator('[data-today-primary-rehearse]').click();
    if (filled) await page.locator('#todayRehearsalDifficulty').fill('Uma dificuldade opcional');
    await page.locator('#todayRehearsalSubmit').click();
    await expect(page.locator('#todayRehearsalDialog')).toBeHidden();
    await expect.poll(() => page.evaluate(() => state.data.sessions.length)).toBe(1);
  });
}

test('navegação e popstate descartam preflight sem escrita ou foco oculto', async ({ page }) => {
  await open(page);
  const primary = await createPrimaryCapability(page);
  const before = await page.evaluate(() => JSON.stringify(state.data));
  for (const history of [false, true]) {
    await primary.locator('[data-today-primary-rehearse]').click();
    await fillRehearsal(page, 'navegação');
    await page.evaluate(history => {
      if (history) { window.history.pushState({}, '', '?view=study'); window.dispatchEvent(new PopStateEvent('popstate')); }
      else CompassoInformationArchitecture.open('study');
    }, history);
    await expect(page.locator('#studyView')).toBeVisible();
    await expect(page.locator('#todayRehearsalDialog')).toBeHidden();
    expect(await page.evaluate(() => JSON.stringify(state.data))).toBe(before);
    expect(await page.evaluate(() => document.activeElement.closest('#todayView,#todayRehearsalDialog') !== null)).toBe(false);
    await page.evaluate(() => CompassoInformationArchitecture.open('today'));
    await expect(page.locator('#todayRehearsalDialog')).toBeHidden();
    await primary.locator('[data-today-primary-rehearse]').click();
    for (const field of await page.locator('#todayRehearsalDialog textarea').all()) await expect(field).toHaveValue('');
    await page.keyboard.press('Escape');
  }
});

for (const success of [false, true]) {
  test(`navegação durante gravação pendente não reabre preflight após ${success ? 'sucesso' : 'falha'}`, async ({ page }) => {
    await open(page);
    const primary = await createPrimaryCapability(page);
    await primary.locator('[data-today-primary-rehearse]').click();
    await fillRehearsal(page, 'pendente');
    await page.evaluate(() => {
      const storage = CompassoStorage;
      window.__saveCalls = 0;
      window.CompassoStorage = Object.freeze({ ...storage, save: async (...args) => {
        window.__saveCalls++;
        if (window.__saveCalls > 1) return storage.save(...args);
        return new Promise(resolve => { window.__releaseSave = async success => resolve(success ? await storage.save(...args) : false); });
      } });
    });
    await page.locator('#todayRehearsalSubmit').click();
    await page.waitForFunction(() => window.__releaseSave);
    await page.evaluate(() => CompassoInformationArchitecture.open('study'));
    await expect(page.locator('#todayRehearsalDialog')).toBeHidden();
    await expect(page.locator('#todayRehearsalSubmit')).toBeDisabled();
    await page.evaluate(() => CompassoInformationArchitecture.open('today'));
    await page.locator('#todayRehearsalForm').evaluate(form => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(await page.evaluate(() => window.__saveCalls)).toBe(1);
    await expect(page.locator('#todayRehearsalDialog')).toBeHidden();
    await page.evaluate(() => CompassoInformationArchitecture.open('study'));
    await page.evaluate(success => window.__releaseSave(success), success);
    await expect(page.locator('#todayRehearsalSubmit')).toBeEnabled();
    await expect(page.locator('#studyView')).toBeVisible();
    await expect(page.locator('#todayRehearsalDialog')).toBeHidden();
    await expect(page.locator('#todayRehearsalError')).toBeHidden();
    expect(await page.evaluate(() => state.data.sessions.length)).toBe(success ? 1 : 0);
    expect(await page.evaluate(() => document.activeElement.closest('#todayView,#todayRehearsalDialog') !== null)).toBe(false);
    expect(await page.evaluate(() => window.__saveCalls)).toBe(success ? 1 : 2);
    await page.reload();
    await page.waitForFunction(() => globalThis.CompassoFeatures?.installed);
    expect(await page.evaluate(() => state.data.sessions.length)).toBe(success ? 1 : 0);
  });
}

for (const deleted of [false, true]) {
  test(`Capability ${deleted ? 'excluída' : 'arquivada'} invalida o ensaio sem criar Session`, async ({ page }) => {
    await open(page);
    const primary = await createPrimaryCapability(page);
    await primary.locator('[data-today-primary-rehearse]').click();
    await fillRehearsal(page);
    await page.evaluate(deleted => {
      if (deleted) state.data.learningOutcomes = [];
      else state.data.learningOutcomes[0].status = 'archived';
      renderAll();
    }, deleted);
    await page.locator('#todayRehearsalSubmit').click();
    await expect(page.locator('#todayRehearsalDialog')).toBeHidden();
    expect(await page.evaluate(() => state.data.sessions.length)).toBe(0);
    await expect(page.locator('#todayPrimaryAction')).toContainText('Comece pelo plano');
  });
}

test('tentativa obsoleta e execução concorrente nunca criam uma segunda Session', async ({ page }) => {
  await open(page);
  const primary = await createPrimaryCapability(page, { attempt: 'Tentativa A' });
  await primary.locator('[data-today-primary-rehearse]').click();
  await fillRehearsal(page, 'stale');
  await page.evaluate(() => {
    const outcome = state.data.learningOutcomes[0];
    outcome.nextAttempt = { ...outcome.nextAttempt, id: 'attempt-replacement', text: 'Tentativa B', updatedAt: new Date().toISOString() };
    outcome.updatedAt = new Date().toISOString();
    renderAll();
  });
  await page.locator('#todayRehearsalSubmit').click();
  await expect(page.locator('#todayRehearsalDialog')).toBeHidden();
  await expect(page.locator('#todayPrimaryAction')).toContainText('Comece pelo plano');
  await expect(page.locator('#toast')).toContainText(/mudou|não está mais disponível/);
  expect(await page.evaluate(() => state.data.sessions.length)).toBe(0);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => globalThis.CompassoFeatures?.installed);
  await page.locator('[data-today-primary-rehearse]').click();
  await page.evaluate(() => {
    const outcome = state.data.learningOutcomes[0];
    const context = CompassoLearningOutcomeModel.createExecutionContext(outcome);
    CompassoFeatures.execute('session.startDefault', { domain: 'learningOutcome', itemId: outcome.id, options: { learningContext: context, resources: [] } });
  });
  await expect.poll(() => page.evaluate(() => state.data.sessions.length)).toBe(1);
  await page.locator('#todayRehearsalSubmit').click();
  await expect(page.locator('#todayRehearsalDialog')).toBeHidden();
  expect(await page.evaluate(() => state.data.sessions.length)).toBe(1);
});

test('reload pré-início elimina o draft e outros domínios não recebem ensaio', async ({ page }) => {
  await open(page);
  const primary = await createPrimaryCapability(page);
  await primary.locator('[data-today-primary-rehearse]').click();
  await fillRehearsal(page, 'reload 2931');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => globalThis.CompassoFeatures?.installed);
  await expect(page.locator('#todayRehearsalDialog')).toBeHidden();
  expect(await page.evaluate(() => state.data.sessions.length)).toBe(0);
  await page.evaluate(() => CompassoInformationArchitecture.open('study'));
  await expect(page.locator('#studyView')).toBeVisible();
  await expect(page.locator('#studyView [data-today-primary-rehearse]')).toHaveCount(0);
  await expect(page.locator('[data-today-primary-rehearse]')).toBeHidden();
  await expect(page.locator('#studyGrid [data-start-session], #studyGrid .ux-execute').first()).toBeVisible();
});
