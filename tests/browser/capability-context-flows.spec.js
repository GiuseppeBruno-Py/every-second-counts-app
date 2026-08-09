const {test,expect}=require('@playwright/test');

async function open(page,view='capabilities'){
  const external=[];
  await page.route(/^https?:\/(?!\/127\.0\.0\.1)/,route=>{external.push(route.request().url());return route.abort()});
  await page.addInitScript(()=>localStorage.setItem('compasso.ux.mode.v1','advanced'));
  await page.goto(`/?view=${view}`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>globalThis.CompassoFeatures?.installed&&globalThis.CompassoCapabilityContextModel);
  return external;
}
async function createCapability(page,values={}){
  await page.locator('[data-outcome-new]').first().click();
  await page.locator('[name="capability"]').fill(values.capability||'Explicar um plano de execução');
  await page.locator('[name="nextAttempt"]').fill(values.attempt||'Comparar dois planos com dados reais');
  await page.locator('#learningOutcomeForm [type="submit"]').click();
  await expect(page.locator('#learningOutcomeDialog')).toBeHidden();
  return page.locator('[data-outcome-card]').first();
}
async function showView(page,view){await page.evaluate(target=>CompassoInformationArchitecture.open(target),view);await expect(page.locator(`#${view}View`)).toBeVisible()}

test('Hoje referencia a tentativa atual e concluir, reabrir, abrir e remover não mutam a capacidade',async({page})=>{
  await open(page);const card=await createCapability(page);const before=await page.evaluate(()=>structuredClone(state.data.learningOutcomes[0]));
  await card.locator('[data-outcome-today]').click();await expect(page.locator('#todayView')).toBeVisible();
  const row=page.locator('[data-today-capability]');await expect(row).toContainText('Comparar dois planos');
  expect(await page.evaluate(()=>state.data.dailyPlans[0].items.filter(item=>item.type==='capability-attempt').length)).toBe(1);
  await row.locator('[data-today-toggle]').click();await expect.poll(()=>page.evaluate(()=>Boolean(state.data.dailyPlans[0].items.find(item=>item.type==='capability-attempt').completedAt))).toBe(true);
  await row.locator('[data-today-toggle]').click();await expect.poll(()=>page.evaluate(()=>state.data.dailyPlans[0].items.find(item=>item.type==='capability-attempt').completedAt)).toBeNull();
  await row.locator('[data-today-open-capability]').click();await expect(card).toBeFocused();
  await card.locator('[data-outcome-today]').click();await row.locator('[data-today-start-capability]').click();await expect(page.locator('#sessionStartDialog')).toBeVisible();await page.locator('[data-session-close="sessionStartDialog"]').first().click();
  await row.locator('[data-today-remove]').click();await expect(row).toHaveCount(0);
  expect(await page.evaluate(()=>state.data.learningOutcomes[0])).toEqual(before);
});

test('Hoje preserva snapshot quando a capacidade some e falha de gravação reverte a operação',async({page})=>{
  await open(page);const card=await createCapability(page,{attempt:'Uma tentativa histórica longa para permanecer legível'});await card.locator('[data-outcome-today]').click();
  await page.evaluate(async()=>{state.data=CompassoLearningOutcomeModel.deleteOutcome(state.data,state.data.learningOutcomes[0].id);await CompassoStorage.save('compasso.app.v1',state.data);renderAll()});
  const row=page.locator('[data-today-capability]');await expect(row).toContainText('Capacidade indisponível');await expect(row).toContainText('Uma tentativa histórica');await expect(row.locator('[data-today-start-capability]')).toHaveCount(0);await expect(row.locator('button[disabled]')).toBeDisabled();
  await row.locator('[data-today-toggle]').click();await expect.poll(()=>page.evaluate(()=>Boolean(state.data.dailyPlans[0].items[0].completedAt))).toBe(true);
  await page.evaluate(()=>{window.__storage=CompassoStorage;window.CompassoStorage=Object.freeze({...CompassoStorage,save:async()=>false})});
  await row.locator('[data-today-toggle]').click();await expect.poll(()=>page.evaluate(()=>Boolean(state.data.dailyPlans[0].items[0].completedAt))).toBe(true);
  await page.evaluate(()=>{window.CompassoStorage=window.__storage});
  await row.locator('[data-today-remove]').click();await expect(row).toHaveCount(0);
});

test('Estudo deriva vínculos e sessão quick opcional preserva métrica e proveniência',async({page})=>{
  await open(page);await createCapability(page,{capability:'Aplicar uma estratégia',attempt:'Resolver um exercício'});const id=await page.evaluate(()=>state.data.learningOutcomes[0].id),beforeOutcome=await page.evaluate(()=>structuredClone(state.data.learningOutcomes[0]));
  await showView(page,'study');const resource=page.locator('#studyGrid .item-card').first();await resource.locator('[data-ux-more]').click();await resource.locator('[data-capability-resource]').click();await page.locator(`[name="capabilityResourceOutcome"][value="${id}"]`).check();await page.locator('#capabilityResourceForm [type="submit"]').click();
  await expect(resource.locator('[data-capability-resource]')).toContainText('1');expect(await page.evaluate(()=>state.data.learningOutcomes[0].resourceRefs)).toContainEqual({type:'study',id:'example-study'});
  const linkedOutcome=await page.evaluate(()=>structuredClone(state.data.learningOutcomes[0])),start=await page.evaluate(()=>state.data.study[0].completedHours);
  await resource.locator('[data-ux-execute]').click();await page.locator('[data-ux-run="ideal"]').click();await expect(page.locator('#sessionCapability')).toHaveValue('');await page.locator('#sessionCapability').selectOption(id);await page.locator('#sessionStartForm').evaluate(form=>form.requestSubmit());
  await page.locator('#sessionCompanionFinish').click();await page.locator('#sessionEndValue').fill(String(start+1));await page.locator('#sessionEvidenceSummary').fill('Exercício resolvido com o recurso');await page.locator('#sessionFinishForm').evaluate(form=>form.requestSubmit());
  const result=await page.evaluate(()=>({study:state.data.study[0],outcome:state.data.learningOutcomes[0],session:state.data.sessions[0],execution:state.data.executionSessions.find(item=>item.id===state.data.sessions[0].id),evidence:state.data.evidence[0]}));
  expect(result.study.completedHours).toBe(start+1);expect(result.outcome).toEqual(linkedOutcome);expect(result.session.learningContext.outcomeId).toBe(id);expect(result.execution.learningContext).toEqual(result.session.learningContext);expect(result.evidence).not.toHaveProperty('learningContext');
  await showView(page,'study');await resource.locator('[data-ux-more]').click();await resource.locator('[data-capability-resource]').click();await page.locator(`[name="capabilityResourceOutcome"][value="${id}"]`).uncheck();await page.locator('#capabilityResourceForm [type="submit"]').click();expect(await page.evaluate(()=>state.data.learningOutcomes[0].resourceRefs)).toEqual([]);expect(beforeOutcome.resourceRefs).toEqual([]);
});

test('sessão de recurso sem seleção continua legada e Deep Work aceita contexto opcional',async({page})=>{
  await open(page);await createCapability(page,{capability:'Diagnosticar gargalos',attempt:'Analisar uma consulta'});const id=await page.evaluate(()=>state.data.learningOutcomes[0].id);await showView(page,'reading');const resource=page.locator('#readingGrid .item-card').first();
  await resource.locator('[data-ux-execute]').click();await page.locator('[data-ux-run="ideal"]').click();await page.locator('#sessionStartForm').evaluate(form=>form.requestSubmit());expect(await page.evaluate(()=>state.data.sessions[0].learningContext)).toBeNull();
  await page.evaluate(()=>{state.data.sessions=[];state.data.executionSessions=[];globalThis.renderAll()});
  await resource.locator('[data-ux-execute]').click();await page.locator('[data-ux-run="ideal"]').click();await page.locator('#sessionCapability').selectOption(id);await page.locator('#sessionMode').selectOption('deep');await page.locator('#sessionStartForm').evaluate(form=>form.requestSubmit());await expect(page.locator('#deepDialog')).toBeVisible();await page.locator('#deepStart').click();expect(await page.evaluate(()=>state.data.deepWorkSessions[0].learningContext.outcomeId)).toBe(id);
});

test('learningSignals exige salvar, permite editar/excluir e nunca altera tentativa ou fonte',async({page})=>{
  await open(page);const card=await createCapability(page);const before=await page.evaluate(()=>structuredClone(state.data.learningOutcomes[0]));await card.locator('[data-signal-new]').last().click();
  await page.locator('#learningSignalKind').selectOption('gap');await page.locator('#learningSignalText').fill('Preciso distinguir custo lógico e físico');await page.keyboard.press('Escape');expect(await page.evaluate(()=>state.data.learningSignals)).toEqual([]);
  await card.locator('[data-signal-new]').last().click();await page.locator('#learningSignalKind').selectOption('gap');await page.locator('#learningSignalText').fill('Preciso distinguir custo lógico e físico');await page.locator('#learningSignalForm [type="submit"]').click();await card.locator('.capability-context-summary summary').click();await expect(card).toContainText('Preciso distinguir');
  const sourceBefore=await page.evaluate(()=>structuredClone({sessions:state.data.sessions,evidence:state.data.evidence}));await card.locator('[data-signal-edit]').click();await expect(page.locator('#learningSignalText')).toBeFocused();await page.locator('#learningSignalText').fill('Comparar custo lógico e físico');await page.locator('#learningSignalForm [type="submit"]').click();await card.locator('.capability-context-summary summary').click();await expect(card).toContainText('Comparar custo lógico');
  await card.locator('[data-signal-edit]').click();page.once('dialog',dialog=>dialog.accept());await page.locator('[data-signal-delete]').click();await expect(page.locator('#learningSignalDialog')).toBeHidden();
  const after=await page.evaluate(()=>({outcome:state.data.learningOutcomes[0],signals:state.data.learningSignals,tombstones:state.data._sync.tombstones,sources:{sessions:state.data.sessions,evidence:state.data.evidence}}));expect(after.outcome).toEqual(before);expect(after.signals).toEqual([]);expect(Object.keys(after.tombstones).some(key=>key.startsWith('learningSignals:'))).toBe(true);expect(after.sources).toEqual(sourceBefore);
});

test('Revisão registra manter/revisar explicitamente e Results separa evidência de atividade',async({page})=>{
  await open(page);await createCapability(page,{capability:'Explicar índices',attempt:'Comparar dois índices'});const before=await page.evaluate(()=>structuredClone(state.data.learningOutcomes[0]));
  await page.evaluate(async()=>{const o=state.data.learningOutcomes[0],ref=CompassoCapabilityContextModel.createCapabilityRef(o),now=new Date().toISOString();state.data.executionSessions=[{id:'exec-week',source:{collection:'sessions',id:'exec-week'},mode:'quick',status:'completed',domain:'learningOutcome',itemId:o.id,learningContext:ref,startedAt:now,endedAt:now,durationMs:60000,updatedAt:now}];state.data.evidence=[{id:'ev-week',sessionId:'exec-week',domain:'learningOutcome',itemId:o.id,type:'insight',summary:'Índice composto validado',createdAt:now,updatedAt:now}];await CompassoStorage.save('compasso.app.v1',state.data);globalThis.renderAll()});await showView(page,'weekly');
  const capability=page.locator('[data-weekly-capability]').first();await expect(capability).toContainText('Índice composto validado');await capability.locator('[data-weekly-reflection]').fill('A ordem das colunas importa');await capability.locator('[data-weekly-decision]').selectOption('keep');await page.locator('#weeklyReviewForm').evaluate(form=>form.requestSubmit());
  expect(await page.evaluate(()=>state.data.learningOutcomes[0])).toEqual(before);expect(await page.evaluate(()=>state.data.weeklyReviews[0].capabilityReflections[0].decision)).toBe('keep');
  await capability.locator('[data-weekly-decision]').selectOption('revise');await capability.locator('[data-weekly-attempt]').fill('Testar seletividade em dados reais');await page.locator('#weeklyReviewForm').evaluate(form=>form.requestSubmit());
  const revised=await page.evaluate(()=>state.data.learningOutcomes[0]);expect(revised.nextAttempt.id).toBe(before.nextAttempt.id);expect(revised.nextAttempt.createdAt).toBe(before.nextAttempt.createdAt);expect(revised.nextAttempt.text).toBe('Testar seletividade em dados reais');
  await showView(page,'outcomes');await expect(page.locator('.outcomes-support')).toContainText('Atividade de apoio');await expect(page.locator('.capability-results-panel')).toContainText('Evidências e decisões');await expect(page.locator('.capability-results-panel')).toContainText('Índice composto validado');await expect(page.locator('.capability-results-panel')).not.toContainText(/%|mastery|confiança/i);
});

test('Consistência filtra Todas, Sem capacidade e capacidade explícita sem chamar isso de progresso',async({page})=>{
  await open(page);await createCapability(page,{capability:'Explicar cache',attempt:'Desenhar o ciclo'});await page.evaluate(()=>{const o=state.data.learningOutcomes[0],ref=CompassoCapabilityContextModel.createCapabilityRef(o),now=new Date().toISOString();state.data.executionSessions=[{id:'linked',source:{collection:'sessions',id:'linked'},mode:'quick',status:'completed',domain:'learningOutcome',itemId:o.id,learningContext:ref,startedAt:now,endedAt:now,durationMs:60000,updatedAt:now},{id:'plain',source:{collection:'sessions',id:'plain'},mode:'quick',status:'completed',domain:'study',itemId:'example-study',learningContext:null,startedAt:now,endedAt:now,durationMs:60000,updatedAt:now}];globalThis.renderAll()});await showView(page,'analytics');
  await expect(page.locator('#analyticsHistory .analytics-history-row')).toHaveCount(2);await expect(page.locator('#analyticsView')).toContainText('não progresso');
  await page.locator('#analyticsCapability').selectOption('unlinked');await expect(page.locator('#analyticsHistory .analytics-history-row')).toHaveCount(1);await expect(page.locator('#analyticsHistory')).toContainText('Sem capacidade associada');
  const id=await page.evaluate(()=>state.data.learningOutcomes[0].id);await page.locator('#analyticsCapability').selectOption(id);await expect(page.locator('#analyticsHistory .analytics-history-row')).toHaveCount(1);await expect(page.locator('#analyticsHistory')).toContainText('Sem métrica de recurso');
  await page.locator('#analyticsCapability').selectOption('all');await expect(page.locator('#analyticsHistory .analytics-history-row')).toHaveCount(2);
});

test('backup e canários de Notes/vault/Relations preservam dados sem dependência externa',async({page})=>{
  await open(page);const card=await createCapability(page,{capability:'Capacidade com texto '.repeat(18),attempt:'Tentativa com texto '.repeat(20)});await card.locator('[data-signal-new]').last().click();await page.locator('#learningSignalKind').selectOption('question');await page.locator('#learningSignalText').fill('Pergunta longa '.repeat(35));await page.locator('#learningSignalForm [type="submit"]').click();
  const canary=await page.evaluate(async()=>{state.data.notes.push({id:'capability-canary-note',title:'Canário',folder:'f-inbox',domain:'inbox',linkedItemId:null,tags:['teste'],updated:'2026-08-09',content:'# Canário\n\n[[Bem-vindo ao Compasso]]'});state.data.explanationEvaluations=[{id:'context-eval'}];state.data.errorNotebook=[{id:'legacy-error'}];await CompassoStorage.save('compasso.app.v1',state.data);return{note:state.data.notes.find(item=>item.id==='capability-canary-note'),context:{evaluations:state.data.explanationEvaluations,errors:state.data.errorNotebook},manifestSource:await(await fetch('/app-manifest.js')).text()}});expect(canary.note.content).toContain('[[Bem-vindo ao Compasso]]');expect(canary.note.tags).toEqual(['teste']);expect(canary.context.evaluations).toHaveLength(1);for(const asset of ['markdown-vault-feature.js','dictionary-relations-feature.js','knowledge-graph-feature.js','context-rag-feature.js','context-learning-feature.js'])expect(canary.manifestSource).toContain(asset);
  await page.locator('#settingsBtn').click();page.once('dialog',dialog=>dialog.accept());const downloadPromise=page.waitForEvent('download');await page.locator('#exportBtn').click();const download=await downloadPromise,path=await download.path();await page.locator('#importInput').setInputFiles(path);expect(await page.evaluate(()=>state.data.learningSignals.length)).toBe(1);expect(await page.evaluate(()=>state.data.notes.some(item=>item.id==='capability-canary-note'))).toBe(true);
});

test('controles críticos mantêm foco, toque e geometria em mobile e 200% zoom',async({page},testInfo)=>{
  await open(page);const card=await createCapability(page,{capability:'Uma capacidade '.repeat(30),attempt:'Uma tentativa '.repeat(35)});await card.locator('[data-signal-new]').last().focus();await page.keyboard.press('Enter');await expect(page.locator('#learningSignalText')).toBeFocused();await page.keyboard.press('Escape');await expect(card.locator('[data-signal-new]').last()).toBeFocused();
  await page.evaluate(()=>{document.documentElement.style.zoom='2'});const geometry=await page.evaluate(()=>({page:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}));expect(geometry.page).toBeLessThanOrEqual(geometry.viewport+1);await page.evaluate(()=>{document.documentElement.style.zoom=''});
  if(testInfo.project.name==='mobile'){const targets=await card.locator('button').evaluateAll(buttons=>buttons.filter(button=>button.offsetParent!==null).map(button=>{const box=button.getBoundingClientRect();return{name:button.textContent.trim()||button.getAttribute('aria-label'),w:box.width,h:box.height}}));expect(targets.length).toBeGreaterThan(0);expect(targets.filter(box=>box.w<44||box.h<44)).toEqual([])}
});
