const { test, expect } = require('@playwright/test');

async function open(page) {
  await page.route(/^https?:\/(?!\/127\.0\.0\.1)/, route => route.abort());
  await page.goto('/?view=study', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => globalThis.CompassoFeatures?.installed && globalThis.CompassoInformationArchitecture);
  await page.waitForSelector('#studyGrid .item-card');
}

async function enableStudyRitual(page, { link = false, preparation = true } = {}) {
  return page.evaluate(async ({ link, preparation }) => {
    const index = state.data.ritualTemplates.findIndex(item => item.actionType === 'study' && !item.archived);
    const current = state.data.ritualTemplates[index];
    const updated = CompassoRitualModel.update(current, {
      encodingCheckpoint: true,
      preparation: preparation ? [{ id: 'preview-question', text: 'Defina a pergunta central', required: true, order: 0 }] : [],
    }, new Date(Date.now() + 1000).toISOString());
    state.data.ritualTemplates[index] = updated;
    if (link) state.data.study.find(item => item.id === 'example-study').ritualId = updated.id;
    await CompassoStorage.save('compasso.app.v1', state.data);
    renderAll();
    return updated.id;
  }, { link, preparation });
}

async function startQuick(page, { ritualId = null } = {}) {
  await page.evaluate(() => CompassoInformationArchitecture.open('study'));
  await expect(page.locator('#studyGrid .ux-execute').first()).toBeVisible();
  await page.locator('#studyGrid .ux-execute').first().click();
  await page.locator('[data-ux-run="ideal"]').click();
  if (ritualId) {
    await page.locator('#sessionOptionalConfig summary').click();
    await page.locator('#ritualQuickSelect').selectOption(ritualId);
  }
  await page.locator('#sessionStartForm').evaluate(form => form.requestSubmit());
  await expect(page.locator('#sessionCompanion')).toBeVisible();
}

async function finishQuick(page, summary = 'Aprendizado registrado') {
  await page.locator('#sessionCompanionFinish').click();
  await page.locator('#sessionEvidenceSummary').fill(summary);
  await page.locator('#sessionFinishForm').evaluate(form => form.requestSubmit());
  await expect(page.locator('#sessionFinishDialog')).toBeHidden();
  const today = page.locator('[data-completion-today]');
  if (await today.isVisible()) await today.click();
}

test('Ritual habilita, limpa e rejeita E1 atomicamente pelo editor existente', async ({ page }) => {
  await open(page);
  const card = page.locator('#studyGrid .item-card').first();
  await card.locator('[data-ux-more]').click();
  await card.locator('[data-ritual]').click();
  const ritualId = await page.locator('[data-ritual-select].active').getAttribute('data-ritual-select');
  const version = await page.evaluate(id => state.data.ritualTemplates.find(item => item.id === id).version, ritualId);
  await page.locator('#ritualEncodingCheckpoint').check();
  await page.locator('#ritualSave').click();
  await expect.poll(() => page.evaluate(id => ({ marker: state.data.ritualTemplates.find(item => item.id === id).encodingCheckpoint, version: state.data.ritualTemplates.find(item => item.id === id).version }), ritualId)).toEqual({ marker: true, version: version + 1 });

  const beforeInvalid = await page.evaluate(id => structuredClone(state.data.ritualTemplates.find(item => item.id === id)), ritualId);
  await page.evaluate(() => {
    const original = CompassoRitualModel.update;
    CompassoRitualModel.update = (...args) => {
      CompassoRitualModel.update = original;
      return original(args[0], { ...args[1], encodingCheckpoint: 'unsupported' }, args[2]);
    };
  });
  await page.locator('#ritualSave').click();
  await expect(page.locator('#ritualError')).toBeVisible();
  await expect(page.locator('#ritualError')).toBeFocused();
  expect(await page.evaluate(id => state.data.ritualTemplates.find(item => item.id === id), ritualId)).toEqual(beforeInvalid);
  await expect(page.locator('#ritualEncodingCheckpoint')).toBeChecked();

  await page.locator('#ritualSave').click();
  await page.locator('#ritualEncodingCheckpoint').uncheck();
  await page.locator('#ritualSave').click();
  expect(await page.evaluate(id => Object.hasOwn(state.data.ritualTemplates.find(item => item.id === id), 'encodingCheckpoint'), ritualId)).toBe(false);
});

test('vínculo e escolha explícita criam snapshot elegível; sugestão automática falha fechada', async ({ page }) => {
  await open(page);
  const linkedId = await enableStudyRitual(page, { link: true });
  await startQuick(page);
  await expect(page.locator('#sessionEncodingTrigger')).toHaveCount(1);
  await expect(page.locator('#sessionEncodingTrigger')).toBeVisible();
  await expect(page.locator('#sessionEncodingOrientation')).toBeVisible();
  await expect(page.locator('#sessionEncodingOrientation')).toContainText('Defina a pergunta central');
  const linked = await page.evaluate(() => {
    const source = state.data.sessions[0];
    const canonical = state.data.executionSessions.find(item => item.id === source.id);
    return { source: source.ritualSnapshot, canonical: canonical.ritualSnapshot, link: state.data.study.find(item => item.id === 'example-study').ritualId };
  });
  expect(linked.source.encodingCheckpoint).toBe(true);
  expect(linked.canonical).toEqual(linked.source);
  expect(linked.link).toBe(linkedId);
  await finishQuick(page);

  await page.evaluate(async () => {
    state.data.study.find(item => item.id === 'example-study').ritualId = null;
    await CompassoStorage.save('compasso.app.v1', state.data);
    renderAll();
  });
  await startQuick(page, { ritualId: linkedId });
  const explicit = await page.evaluate(() => ({ source: state.data.sessions[0].ritualSnapshot, link: state.data.study.find(item => item.id === 'example-study').ritualId }));
  expect(explicit.source.encodingCheckpoint).toBe(true);
  expect(explicit.link).toBeNull();
  await finishQuick(page);

  await page.evaluate(() => CompassoInformationArchitecture.open('study'));
  await page.locator('#studyGrid .ux-execute').first().click();
  await page.locator('[data-ux-run="ideal"]').click();
  await page.locator('#sessionOptionalConfig summary').click();
  await expect(page.locator('#ritualQuickSelect')).toHaveValue(`suggested:${linkedId}`);
  await page.locator('#sessionStartForm').evaluate(form => form.requestSubmit());
  const suggested = await page.evaluate(() => state.data.sessions[0].ritualSnapshot);
  expect(suggested.ritualId).toBe(linkedId);
  expect(suggested).not.toHaveProperty('encodingCheckpoint');
  await expect(page.locator('#sessionEncodingTrigger')).toBeHidden();
});

test('seletor global preserva escolha explícita ao abrir a configuração de Session', async ({ page }) => {
  await open(page);
  const ritualId = await enableStudyRitual(page);
  await page.locator('#studyGrid .ux-execute').first().click();
  await page.locator('#uxExecutionRitual').selectOption(ritualId);
  await page.locator('[data-ux-run="ideal"]').click();
  await expect(page.locator('#ritualQuickReason')).toContainText('escolhido para esta execução');
  await page.locator('#sessionStartForm').evaluate(form => form.requestSubmit());
  expect(await page.evaluate(() => state.data.sessions[0].ritualSnapshot.encodingCheckpoint)).toBe(true);
  expect(await page.evaluate(() => state.data.study.find(item => item.id === 'example-study').ritualId ?? null)).toBeNull();
});

test('Deep Work usa seleção explícita, snapshot canônico e o mesmo checkpoint', async ({ page }) => {
  await open(page);
  const ritualId = await enableStudyRitual(page);
  await page.locator('#studyGrid .ux-execute').first().click();
  await page.locator('#uxExecutionRitual').selectOption(ritualId);
  await page.locator('[data-ux-run="deep"]').click();
  await page.locator('#deepStart').click();
  await expect(page.locator('#deepEncodingTrigger')).toBeVisible();
  const snapshots = await page.evaluate(() => {
    const source = state.data.deepWorkSessions[0];
    const canonical = state.data.executionSessions.find(item => item.source?.id === source.id);
    return { source: source.ritualSnapshot, canonical: canonical.ritualSnapshot, state: source.state };
  });
  expect(snapshots.state).toBe('running');
  expect(snapshots.source.encodingCheckpoint).toBe(true);
  expect(snapshots.canonical).toEqual(snapshots.source);

  page.once('dialog', dialog => dialog.accept());
  await page.keyboard.press('Escape');
  await expect(page.locator('#sessionEncodingTrigger')).toBeVisible();
  await page.locator('#sessionEncodingTrigger').click();
  await expect(page.locator('#deepDialog')).toBeVisible();
  await expect(page.locator('#deepEncodingReconstructHeading')).toBeFocused();
  await page.locator('[data-encoding-close="deep"]:visible').click();
  await expect(page.locator('#deepEncodingTrigger')).toBeFocused();
});

test('checkpoint é manual, reconstruction-first, transitório e repetível sem escrever estado', async ({ page }) => {
  await open(page);
  await enableStudyRitual(page, { link: true, preparation: false });
  await startQuick(page);
  const trigger = page.locator('#sessionEncodingTrigger');
  const panel = page.locator('#sessionEncodingPanel');
  await expect(panel).toBeHidden();
  const before = await page.evaluate(() => JSON.stringify(state.data));
  const beforeElapsed = await page.evaluate(() => CompassoSessionTimerModel.elapsed(state.data.sessions[0]));
  await page.waitForTimeout(1050);
  await expect(panel).toBeHidden();
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#sessionEncodingReconstructHeading')).toBeFocused();
  await expect(page.locator('#sessionEncodingReconstruct')).toContainText('Sem consultar, reconstrua a ideia principal com suas palavras.');
  await expect(page.locator('#sessionEncodingOperation')).toBeHidden();
  expect(await panel.locator('textarea,[contenteditable="true"]').count()).toBe(0);
  await page.locator('[data-encoding-next="session"]').click();
  await expect(page.locator('#sessionEncodingOperationHeading')).toBeFocused();
  const operations = [
    ['connect', 'Relacione a ideia'],
    ['contrast', 'Compare com uma ideia'],
    ['organize', 'Identifique a estrutura'],
  ];
  for (const [value, instruction] of operations) {
    await page.locator(`[data-encoding-choice="session"][value="${value}"]`).check();
    await expect(page.locator(`[data-encoding-choice="session"][value="${value}"]`)).toBeChecked();
    await expect(page.locator('#sessionEncodingInstruction')).toContainText(instruction);
    await expect(page.locator('#sessionEncodingReturn')).toBeEnabled();
    expect(await panel.locator('[data-encoding-choice="session"]:checked').count()).toBe(1);
  }
  await page.locator('#sessionEncodingReturn').click();
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => JSON.stringify(state.data))).toBe(before);
  const afterElapsed = await page.evaluate(() => CompassoSessionTimerModel.elapsed(state.data.sessions[0]));
  expect(afterElapsed).toBeGreaterThan(beforeElapsed);

  await trigger.click();
  await expect(page.locator('#sessionEncodingReconstruct')).toBeVisible();
  await page.locator('[data-encoding-next="session"]').click();
  expect(await panel.locator('[data-encoding-choice="session"]:checked').count()).toBe(0);
  await page.locator('[data-encoding-close="session"]:visible').click();
  await expect(trigger).toBeFocused();
});

test('snapshot vivo é imutável e pausa, reload, fonte ausente e Evidence preservam proprietários', async ({ page }) => {
  await open(page);
  await enableStudyRitual(page, { link: true });
  await startQuick(page);
  const original = await page.evaluate(() => structuredClone(state.data.sessions[0]));
  await page.evaluate(async () => {
    state.data.ritualTemplates = [];
    state.data.study = [];
    await CompassoStorage.save('compasso.app.v1', state.data);
    renderAll();
  });
  await expect(page.locator('#sessionEncodingTrigger')).toBeVisible();
  await page.locator('#sessionCompanionPause').click();
  await expect.poll(() => page.evaluate(() => state.data.sessions[0].status)).toBe('paused');
  await page.locator('#sessionEncodingTrigger').click();
  await page.locator('[data-encoding-close="session"]:visible').click();
  expect(await page.evaluate(() => state.data.sessions[0].status)).toBe('paused');
  await page.locator('#sessionEncodingTrigger').click();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => globalThis.CompassoFeatures?.installed);
  await expect(page.locator('#sessionEncodingPanel')).toBeHidden();
  await expect(page.locator('#sessionEncodingTrigger')).toBeVisible();
  const recovered = await page.evaluate(() => state.data.sessions[0]);
  expect(recovered.id).toBe(original.id);
  expect(recovered.ritualSnapshot).toEqual(original.ritualSnapshot);
  expect(recovered.status).toBe('paused');
  await page.locator('#sessionCompanionPause').click();
  await finishQuick(page, 'Evidence sem worksheet de encoding');
  const evidence = await page.evaluate(() => state.data.evidence.find(item => item.sessionId === state.data.sessions[0].id));
  expect(evidence).toBeTruthy();
  expect(evidence).not.toHaveProperty('encodingCheckpoint');
  expect(evidence).not.toHaveProperty('encodingOperation');
  expect(evidence.sessionId).toBe(original.id);
});

test('legado e snapshot malformado continuam executáveis, sem inferência ou mutação protegida', async ({ page }) => {
  await open(page);
  const protectedBefore = await page.evaluate(async () => {
    state.data.notes = [{ id: 'note-e1', title: 'Mapa', content: '[[Conexão]]' }];
    state.data.reviewItems = [{ id: 'recall-e1', question: 'Pergunta preservada', dueAt: '2026-08-20T10:00:00.000Z', intervalDays: 1, reviewHistory: [] }];
    state.data.errorNotebook = [{ id: 'error-e1', text: 'Erro preservado' }];
    state.data.legacyEncoding = { keep: true };
    const now = new Date().toISOString();
    state.data.sessions = [{ id: 'legacy-session', schemaVersion: 1, domain: 'study', itemId: 'example-study', ritualSnapshot: { ritualId: 'missing', version: 'invalid', encodingCheckpoint: true }, startedAt: now, status: 'active', pausedMs: 0 }];
    state.data.executionSessions = [CompassoExecutionSessionModel.fromRegular(state.data.sessions[0])];
    await CompassoStorage.save('compasso.app.v1', state.data);
    renderAll();
    return structuredClone({ notes: state.data.notes, reviewItems: state.data.reviewItems, errorNotebook: state.data.errorNotebook, legacyEncoding: state.data.legacyEncoding });
  });
  await expect(page.locator('#sessionCompanion')).toBeVisible();
  await expect(page.locator('#sessionEncodingTrigger')).toBeHidden();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => globalThis.CompassoFeatures?.installed);
  const protectedAfter = await page.evaluate(() => ({ notes: state.data.notes, reviewItems: state.data.reviewItems, errorNotebook: state.data.errorNotebook, legacyEncoding: state.data.legacyEncoding, status: state.data.sessions[0].status, marker: state.data.sessions[0].ritualSnapshot.encodingCheckpoint }));
  expect({ notes: protectedAfter.notes, reviewItems: protectedAfter.reviewItems, errorNotebook: protectedAfter.errorNotebook, legacyEncoding: protectedAfter.legacyEncoding }).toEqual(protectedBefore);
  expect(protectedAfter.status).toBe('active');
  expect(protectedAfter.marker).toBeUndefined();
  await expect(page.locator('#sessionCompanionFinish')).toBeEnabled();
});
