const { test, expect } = require('@playwright/test');

async function openCapabilities(page) {
  await page.route(/^https?:\/(?!\/127\.0\.0\.1)/, route => route.abort());
  await page.addInitScript(() => localStorage.setItem('compasso.ux.mode.v1', 'essential'));
  await page.addInitScript(()=>{globalThis.CompassoDriveSync||={prepareLocalState(input){return{data:structuredClone(input),baseline:new Map()}},activateLocalState(){}};});
  await page.goto('/?view=capabilities', { waitUntil:'domcontentloaded' });
  await page.waitForFunction(() => globalThis.CompassoFeatures?.installed && globalThis.CompassoLearningOutcomeModel);
  await expect(page.locator('#capabilitiesView')).toBeVisible();
}

async function createOutcome(page, values = {}) {
  await page.locator('[data-outcome-new]').first().click();
  const dialog = page.locator('#learningOutcomeDialog');
  await expect(dialog).toBeVisible();
  await dialog.locator('[name="capability"]').fill(values.capability || 'Explicar uma closure com um exemplo próprio');
  if (values.proofCriterion) await dialog.locator('[name="proofCriterion"]').fill(values.proofCriterion);
  if (values.futureUse !== undefined) await dialog.locator('[name="futureUse"]').selectOption(values.futureUse);
  await dialog.locator('[name="nextAttempt"]').fill(values.nextAttempt || 'Escrever e executar um exemplo mínimo');
  if (values.resources?.length) {
    await dialog.locator('.learning-outcome-resources summary').click();
    for (const resource of values.resources) {
      await dialog.locator(`[name="outcomeResource"][data-resource-type="${resource.type}"][data-resource-id="${resource.id}"]`).check();
    }
  }
  await dialog.locator('[type="submit"]').click();
  await expect(dialog).toBeHidden();
  return page.locator('.learning-outcome-card').first();
}

test('cria a forma mínima, valida obrigatórios e persiste após reload', async ({ page }) => {
  await openCapabilities(page);
  await page.locator('[data-outcome-new]').first().click();
  const dialog = page.locator('#learningOutcomeDialog');
  await dialog.locator('[type="submit"]').click();
  await expect(page.locator('#learningOutcomeError')).toContainText('quer conseguir fazer');
  await dialog.locator('[name="capability"]').fill('Explicar uma closure com um exemplo próprio');
  await dialog.locator('[type="submit"]').click();
  await expect(page.locator('#learningOutcomeError')).toContainText('tentar agora');
  await dialog.locator('[name="nextAttempt"]').fill('Escrever e executar um exemplo mínimo');
  await dialog.locator('[type="submit"]').click();
  await expect(dialog).toBeHidden();
  await expect(page.locator('.learning-outcome-card')).toContainText('Explicar uma closure');

  const shape = await page.evaluate(() => state.data.learningOutcomes[0]);
  expect(Object.keys(shape).sort()).toEqual(['archivedAt','capability','createdAt','id','nextAttempt','proofCriterion','resourceRefs','status','updatedAt']);
  expect(shape.proofCriterion).toBeNull();
  expect(shape.resourceRefs).toEqual([]);
  expect(shape.status).toBe('active');
  expect(JSON.stringify(shape)).not.toMatch(/progress|score|mastery|competenc/i);

  await page.reload({ waitUntil:'domcontentloaded' });
  await page.waitForFunction(() => globalThis.CompassoFeatures?.installed);
  await expect(page.locator('.learning-outcome-card')).toContainText('Explicar uma closure');
});

test('futureUse opcional cria, orienta, edita e limpa sem mudar a identidade', async ({ page }) => {
  await openCapabilities(page);
  const card=await createOutcome(page,{capability:'Resolver consultas desconhecidas',futureUse:'solve',nextAttempt:'Resolver uma consulta sem exemplo'});
  await expect(card).toContainText('Uso pretendido: Resolver problemas');
  let stored=await page.evaluate(()=>state.data.learningOutcomes[0]);
  expect(stored.nextAttempt.futureUse).toBe('solve');
  const attemptId=stored.nextAttempt.id;
  await card.locator('[data-outcome-edit]').click();
  const select=page.locator('#learningOutcomeFutureUse');
  await expect(select).toHaveAccessibleName(/Como você precisará usar isso/);
  await select.selectOption('simulate');
  await expect(page.locator('#learningOutcomeFutureUseHint')).toContainText('condições próximas');
  await page.locator('#learningOutcomeForm [type="submit"]').click();
  await expect(card).toContainText('Praticar em condições reais ou de prova');
  stored=await page.evaluate(()=>state.data.learningOutcomes[0]);
  expect(stored.nextAttempt.id).toBe(attemptId);expect(stored.nextAttempt.futureUse).toBe('simulate');
  await card.locator('[data-outcome-edit]').click();
  await select.selectOption('');
  await page.locator('#learningOutcomeForm [type="submit"]').click();
  await expect(card).not.toContainText('Uso pretendido:');
  expect(await page.evaluate(()=>'futureUse' in state.data.learningOutcomes[0].nextAttempt)).toBe(false);
});

test('edita conteúdo, tentativa e recursos sem converter atividade em avanço', async ({ page }) => {
  await openCapabilities(page);
  const beforeResources = await page.evaluate(() => structuredClone({ study:state.data.study, reading:state.data.reading }));
  const card = await createOutcome(page, {
    capability:'Aplicar groupBy em dados reais',
    proofCriterion:'Resolver sem consultar um exemplo pronto',
    nextAttempt:'Prever o resultado antes de executar',
    resources:[{type:'study',id:'example-study'},{type:'reading',id:'example-reading'}]
  });
  await expect(card).toContainText('Resolver sem consultar');
  await expect(card).toContainText('Estudo: Curso de exemplo');
  await expect(card).toContainText('Leitura: Exemplo de leitura');
  await expect(card).not.toContainText('%');

  await card.locator('[data-outcome-edit]').click();
  const dialog = page.locator('#learningOutcomeDialog');
  const attemptId = await page.evaluate(() => state.data.learningOutcomes[0].nextAttempt.id);
  await dialog.locator('[name="capability"]').fill('Aplicar groupBy e explicar a escolha');
  await dialog.locator('[name="proofCriterion"]').fill('');
  await dialog.locator('[name="nextAttempt"]').fill('Comparar duas implementações');
  await dialog.locator('[type="submit"]').click();
  await expect(dialog).toBeHidden();
  await expect(card).toContainText('Comparar duas implementações');
  await expect(card).not.toContainText('Como vou saber');
  expect(await page.evaluate(() => state.data.learningOutcomes[0].nextAttempt.id)).toBe(attemptId);
  expect(await page.evaluate(() => ({ study:state.data.study, reading:state.data.reading }))).toEqual(beforeResources);

  await card.locator('[data-outcome-unlink][data-resource-type="reading"]').click();
  await expect(card).not.toContainText('Leitura: Exemplo de leitura');
  expect(await page.evaluate(() => state.data.reading[0].id)).toBe('example-reading');
});

test('arquiva, reativa, preserva referência ausente e exclui apenas a capacidade', async ({ page }) => {
  await openCapabilities(page);
  let card = await createOutcome(page, { resources:[{type:'study',id:'example-study'}] });
  await card.locator('[data-outcome-status]').click();
  await expect.poll(() => page.evaluate(() => state.data.learningOutcomes[0]?.status)).toBe('archived');
  await expect(page.locator('.learning-outcome-card')).toHaveCount(0);
  await page.locator('[data-outcome-mode="archived"]').click();
  card = page.locator('.learning-outcome-card');
  await expect(card).toContainText('Arquivada');
  await card.locator('[data-outcome-status]').click();
  await expect.poll(() => page.evaluate(() => state.data.learningOutcomes[0]?.status)).toBe('active');
  await page.locator('[data-outcome-mode="active"]').click();
  await expect(page.locator('.learning-outcome-card')).toContainText('Ativa');

  await page.evaluate(async () => {
    state.data.study = state.data.study.filter(item => item.id !== 'example-study');
    await window.CompassoStorage.save('compasso.app.v1', state.data);
    renderAll();
  });
  card = page.locator('.learning-outcome-card');
  await expect(card).toContainText('Recurso indisponível');
  await card.locator('[data-outcome-edit]').click();
  await page.locator('.learning-outcome-resources summary').click();
  await expect(page.locator('#learningOutcomeResourceOptions .unavailable input')).toBeChecked();
  await page.locator('[data-outcome-cancel]').last().click();
  await expect(page.locator('#learningOutcomeDialog')).toBeHidden();

  await card.locator('[data-outcome-edit]').click();
  page.once('dialog', prompt => prompt.accept());
  await page.locator('[data-outcome-delete]').click();
  await expect(page.locator('#learningOutcomeDialog')).toBeHidden();
  await expect(page.locator('.learning-outcome-card')).toHaveCount(0);
  const deletion = await page.evaluate(() => ({ outcomes:state.data.learningOutcomes, tombstones:state.data._sync?.tombstones || {}, reading:state.data.reading }));
  expect(deletion.outcomes).toEqual([]);
  expect(Object.keys(deletion.tombstones).some(key => key.startsWith('learningOutcomes:'))).toBe(true);
  expect(deletion.reading).toHaveLength(1);
});

test('backup JSON preserva forma completa e backup legado abre sem migração destrutiva', async ({ page }) => {
  await openCapabilities(page);
  await createOutcome(page, {
    capability:'Diagnosticar uma consulta lenta',
    proofCriterion:'Explicar o plano e propor um índice',
    futureUse:'decide',
    nextAttempt:'Analisar uma consulta de exemplo',
    resources:[{type:'reading',id:'example-reading'}]
  });
  await page.locator('.learning-outcome-card [data-outcome-status]').click();
  await expect.poll(() => page.evaluate(() => state.data.learningOutcomes[0]?.status)).toBe('archived');
  await page.locator('#settingsBtn').click();
  page.once('dialog', prompt => prompt.accept());
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#exportBtn').click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();

  await page.locator('#importInput').setInputFiles(path);
  await expect(page.locator('#restoreDialog')).toBeVisible();
  await page.locator('#restoreConfirmBtn').click();
  await expect(page.locator('#restoreDialog')).not.toBeVisible();
  await expect.poll(() => page.evaluate(() => state.data.learningOutcomes[0]?.status)).toBe('archived');
  if (await page.locator('#settingsMenu').evaluate(menu => menu.classList.contains('open'))) {
    await page.locator('#settingsBtn').click();
  }
  await expect(page.locator('#settingsMenu')).not.toHaveClass(/open/);
  await page.locator('[data-outcome-mode="archived"]').click();
  await expect(page.locator('.learning-outcome-card')).toContainText('Diagnosticar uma consulta lenta');
  const restored = await page.evaluate(() => state.data.learningOutcomes[0]);
  expect(restored.proofCriterion).toBe('Explicar o plano e propor um índice');
  expect(restored.resourceRefs).toEqual([{type:'reading',id:'example-reading'}]);
  expect(restored.status).toBe('archived');
  expect(restored.nextAttempt.futureUse).toBe('decide');

  const legacy = JSON.stringify({ reading:[{id:'legacy-reading',title:'Legado',progress:25,status:'active'}], study:[], goal:[], focus:[], folders:[], notes:[], captures:[], untouched:{keep:true} });
  await page.locator('#importInput').setInputFiles({ name:'legacy.json', mimeType:'application/json', buffer:Buffer.from(legacy) });
  await expect(page.locator('#restoreDialog')).toBeVisible();
  await page.locator('#restoreConfirmBtn').click();
  await expect(page.locator('#restoreDialog')).not.toBeVisible();
  expect(await page.evaluate(() => state.data.learningOutcomes)).toEqual([]);
  expect(await page.evaluate(() => state.data.untouched)).toEqual({keep:true});
  expect(await page.evaluate(() => state.data.reading[0].title)).toBe('Legado');
});

test('falha de persistência mantém o modal e não anuncia sucesso', async ({ page }) => {
  await openCapabilities(page);
  await page.evaluate(() => {
    window.__learningOutcomeOriginalStorage = window.CompassoStorage;
    window.CompassoStorage = Object.freeze({ ...window.CompassoStorage, save:async () => false });
  });
  await page.locator('[data-outcome-new]').first().click();
  const dialog = page.locator('#learningOutcomeDialog');
  await dialog.locator('[name="capability"]').fill('Explicar event loop');
  await dialog.locator('[name="nextAttempt"]').fill('Ordenar uma sequência de logs');
  await dialog.locator('[type="submit"]').click();
  await expect(dialog).toBeVisible();
  await expect(page.locator('#learningOutcomeError')).toContainText('Não foi possível salvar');
  await expect(page.locator('#toast')).toContainText('Não foi possível salvar');
  expect(await page.evaluate(() => state.data.learningOutcomes.length)).toBe(0);
  await page.evaluate(() => { window.CompassoStorage = window.__learningOutcomeOriginalStorage; });
});

test('layout não transborda em 360, 768 e 1024 px e o modal mantém navegação por teclado', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'explicit viewport matrix runs once');
  for (const width of [360, 768, 1024]) {
    await page.setViewportSize({ width, height:800 });
    await openCapabilities(page);
    const geometry = await page.evaluate(() => ({ viewport:document.documentElement.clientWidth, page:document.documentElement.scrollWidth }));
    expect(geometry.page).toBeLessThanOrEqual(geometry.viewport + 1);
  }
  await page.locator('[data-outcome-new]').first().focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[name="capability"]')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('[name="proofCriterion"]')).toBeFocused();
  const visibleText = await page.locator('#learningOutcomeDialog').innerText();
  expect(visibleText).not.toContain('Learning Outcome');
});

test('executa tentativa sem recurso, registra evidência pela sessão e retorna sem fabricar progresso', async ({ page }) => {
  await openCapabilities(page);
  const card=await createOutcome(page,{capability:'Explicar uma closure',futureUse:'explain',nextAttempt:'Implementar uma closure sem consulta'});
  const before=await page.evaluate(() => structuredClone({study:state.data.study,reading:state.data.reading,outcome:state.data.learningOutcomes[0]}));
  await card.locator('[data-outcome-execute]').click();
  await expect(page.locator('#sessionStartDialog')).toBeVisible();
  await expect(page.locator('#sessionOutcomeResource')).toHaveValue('');
  await expect(page.locator('#sessionIntent')).toHaveValue('Implementar uma closure sem consulta');
  await page.locator('#sessionStartForm').evaluate(form => form.requestSubmit());
  await expect(page.locator('#sessionCompanion')).toBeVisible();
  await expect(page.locator('#sessionCompanionFutureUse')).toHaveText('Uso pretendido: Explicar com suas palavras');
  const started=await page.evaluate(() => state.data.sessions[0]);
  expect(started.domain).toBe('learningOutcome');
  expect(started.learningContext).toEqual({outcomeId:before.outcome.id,attemptId:before.outcome.nextAttempt.id,attemptText:'Implementar uma closure sem consulta',futureUse:'explain'});
  await page.locator('#sessionCompanionFinish').click();
  await expect(page.locator('#sessionFinishDialog')).toBeVisible();
  await expect(page.locator('#sessionEndValueField')).toBeHidden();
  await page.locator('#sessionReflection').fill('Consegui explicar o fechamento léxico.');
  await page.locator('#sessionEvidenceSummary').fill('Exemplo executado e explicado');
  await page.locator('#sessionFinishForm').evaluate(form => form.requestSubmit());
  const completion=page.locator('#executionCompletionPanel');
  await expect(completion).toBeVisible();
  await expect(completion).toBeFocused();
  await expect(page.locator('#executionCompletionFutureUse')).toHaveText('Uso na execução: Explicar com suas palavras');
  await expect(completion.locator('[data-completion-today]')).toBeVisible();
  await expect(completion.locator('[data-completion-capability]')).toBeVisible();
  await completion.locator('[data-completion-capability]').click();
  await expect(page.locator('#capabilitiesView')).toBeVisible();
  await expect(card).toBeFocused();
  await expect(card).toContainText('Última execução');
  await expect(card).toContainText('Exemplo executado e explicado');
  const after=await page.evaluate(() => ({study:state.data.study,reading:state.data.reading,outcome:state.data.learningOutcomes[0],session:state.data.sessions[0],canonical:state.data.executionSessions.find(item=>item.source?.id===state.data.sessions[0].id),evidence:state.data.evidence[0]}));
  expect(after.study).toEqual(before.study);
  expect(after.reading).toEqual(before.reading);
  expect(after.outcome).toEqual(before.outcome);
  expect(after.session.endValue).toBeNull();
  expect(after.canonical.learningContext).toEqual(started.learningContext);
  expect(after.evidence.sessionId).toBe(after.session.id);
  expect(after.evidence.domain).toBe('learningOutcome');
  expect(after.evidence).not.toHaveProperty('learningContext');
  expect(after.evidence).not.toHaveProperty('futureUse');
  expect(JSON.stringify(after.outcome)).not.toMatch(/progress|mastery|confidence|completed|score|streak/i);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => globalThis.CompassoFeatures?.installed);
  await expect(page.locator('[data-outcome-card]')).toContainText('Exemplo executado e explicado');
});

test('Deep Work reutiliza a mesma proveniência de tentativa e retorna à capacidade',async({page})=>{
  await openCapabilities(page);
  const card=await createOutcome(page,{capability:'Diagnosticar um plano',futureUse:'simulate',nextAttempt:'Analisar um plano desconhecido'});
  await card.locator('[data-outcome-execute]').click();
  await page.locator('#sessionOptionalConfig summary').click();
  await expect(page.locator('#sessionOptionalConfig')).toHaveAttribute('open','');
  await page.locator('#sessionMode').selectOption('deep');
  await page.locator('#sessionStartForm').evaluate(form=>form.requestSubmit());
  await expect(page.locator('#deepDialog')).toBeVisible();
  await expect(page.locator('#deepFutureUse')).toHaveText('Uso pretendido: Praticar em condições reais ou de prova');
  await page.locator('#deepStart').click();
  const context=await page.evaluate(()=>state.data.deepWorkSessions[0].learningContext);
  expect(context.attemptText).toBe('Analisar um plano desconhecido');
  expect(context.futureUse).toBe('simulate');
  expect(await page.evaluate(()=>state.data.deepWorkSessions[0].domain)).toBe('learningOutcome');
  await page.locator('#deepComplete').click();
  await page.locator('#deepCompletionNote').fill('Plano analisado e explicado');
  await page.locator('#deepConfirmFinish').click();
  const completion=page.locator('#executionCompletionPanel');
  await expect(completion).toBeVisible();
  await expect(completion).toBeFocused();
  await completion.locator('[data-completion-capability]').click();
  await expect(page.locator('#capabilitiesView')).toBeVisible();
  await expect(card).toBeFocused();
  await expect(card).toContainText('Plano analisado e explicado');
  expect(await page.evaluate(()=>state.data.executionSessions.find(item=>item.mode==='deep')?.learningContext)).toEqual(context);
});

test('recurso escolhido mantém sua métrica sem transformar atividade em progresso da capacidade',async({page})=>{
  await openCapabilities(page);
  const card=await createOutcome(page,{capability:'Aplicar um operador',nextAttempt:'Resolver um exercício',resources:[{type:'study',id:'example-study'}]});
  const outcomeBefore=await page.evaluate(()=>structuredClone(state.data.learningOutcomes[0]));
  await card.locator('[data-outcome-execute]').click();
  await page.locator('#sessionOptionalConfig summary').click();
  await expect(page.locator('#sessionOptionalConfig')).toHaveAttribute('open','');
  await page.locator('#sessionOutcomeResource').selectOption('study:example-study');
  await page.locator('#sessionStartForm').evaluate(form=>form.requestSubmit());
  await page.locator('#sessionCompanionFinish').click();
  await expect(page.locator('#sessionEndValueField')).toBeVisible();
  const target=await page.evaluate(()=>Number(state.data.sessions[0].startValue)+1);
  await page.locator('#sessionEndValue').fill(String(target));
  await page.locator('#sessionEvidenceSummary').fill('Exercício resolvido');
  await page.locator('#sessionFinishForm').evaluate(form=>form.requestSubmit());
  const result=await page.evaluate(()=>({session:state.data.sessions[0],study:state.data.study.find(item=>item.id==='example-study'),outcome:state.data.learningOutcomes[0]}));
  expect(result.session.domain).toBe('study');
  expect(result.session.learningContext.outcomeId).toBe(outcomeBefore.id);
  expect(result.study.completedHours).toBe(target);
  expect(result.outcome).toEqual(outcomeBefore);
  expect(JSON.stringify(result.outcome)).not.toMatch(/progress|mastery|confidence|completed|score|streak/i);
});
