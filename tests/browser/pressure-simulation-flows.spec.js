const {test,expect}=require('@playwright/test');
const fs=require('node:fs');

async function open(page){
  await page.route(/^https?:\/(?!\/127\.0\.0\.1)/,route=>route.abort());
  await page.addInitScript(()=>localStorage.setItem('compasso.ux.mode.v1','essential'));
  await page.addInitScript(()=>{globalThis.CompassoDriveSync||={prepareLocalState(input){return{data:structuredClone(input),baseline:new Map()}},activateLocalState(){}}});
  await page.goto('/?view=capabilities',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>globalThis.CompassoFeatures?.installed);
  await expect(page.locator('#capabilitiesView')).toBeVisible();
}
async function capability(page){
  await page.locator('[data-outcome-new]').first().click();
  await page.locator('#learningOutcomeCapability').fill('Apresentar arquitetura técnica com clareza');
  await page.locator('#learningOutcomeAttempt').fill('Explicar o desenho para a equipe');
  await page.locator('#learningOutcomeForm [type="submit"]').click();
  await expect(page.locator('#learningOutcomeDialog')).toBeHidden();
  return page.evaluate(()=>structuredClone(state.data.learningOutcomes[0]));
}
async function prepare(page,condition='em oito minutos, respondendo duas perguntas'){
  await page.locator('[data-outcome-pressure]').first().click();
  const dialog=page.locator('#learningOutcomeDialog');
  await expect(dialog).toBeVisible();
  await expect(page.locator('#outcomePressurePanel')).toHaveAttribute('open','');
  await expect(page.locator('#outcomePressureCondition')).toBeFocused();
  await page.locator('#outcomePressureCondition').fill(condition);
  await page.locator('[data-outcome-pressure-apply]').click();
  return dialog;
}

test('aplica condição ao rascunho, substitui sem duplicar e salva a tentativa existente',async({page})=>{
  await open(page);const original=await capability(page);
  const before=await page.evaluate(()=>structuredClone({study:state.data.study,reading:state.data.reading,evidence:state.data.evidence}));
  const dialog=await prepare(page);
  const attempt=page.locator('#learningOutcomeAttempt');
  await expect(attempt).toHaveValue('Explicar o desenho para a equipe\nCondição de simulação: em oito minutos, respondendo duas perguntas');
  await expect(page.locator('#learningOutcomeFutureUse')).toHaveValue('simulate');
  expect(await page.evaluate(()=>state.data.learningOutcomes[0])).toEqual(original);
  await page.locator('[data-outcome-pressure-apply]').click();
  await expect(attempt).toHaveValue('Explicar o desenho para a equipe\nCondição de simulação: em oito minutos, respondendo duas perguntas');
  await page.locator('#outcomePressureCondition').fill('com tempo e um observador');
  await page.locator('[data-outcome-pressure-apply]').click();
  await expect(attempt).toHaveValue('Explicar o desenho para a equipe\nCondição de simulação: com tempo e um observador');
  await attempt.fill('Explicar o desenho em 8 minutos com perguntas reais');
  await dialog.locator('[type="submit"]').click();
  await expect(dialog).toBeHidden();
  const saved=await page.evaluate(()=>structuredClone(state.data.learningOutcomes[0]));
  expect(saved.id).toBe(original.id);expect(saved.nextAttempt.id).toBe(original.nextAttempt.id);
  expect(saved.nextAttempt.text).toBe('Explicar o desenho em 8 minutos com perguntas reais');
  expect(saved.nextAttempt.futureUse).toBe('simulate');
  expect(await page.evaluate(()=>({study:state.data.study,reading:state.data.reading,evidence:state.data.evidence}))).toEqual(before);
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('[data-outcome-card]')).toContainText('Explicar o desenho em 8 minutos');
});

test('condição vazia, não aplicada ou texto longo não escrevem estado',async({page})=>{
  await open(page);const original=await capability(page);
  await page.locator('[data-outcome-pressure]').first().click();
  await page.locator('[data-outcome-pressure-apply]').click();
  await expect(page.locator('#learningOutcomeError')).toContainText('condição concreta');
  await expect(page.locator('#outcomePressureCondition')).toBeFocused();
  await page.locator('#outcomePressureCondition').fill('sob limite de tempo');
  await page.locator('#learningOutcomeForm [type="submit"]').click();
  await expect(page.locator('#learningOutcomeError')).toContainText('Adicione a condição');
  expect(await page.evaluate(()=>state.data.learningOutcomes[0])).toEqual(original);
  await page.locator('#learningOutcomeAttempt').fill('A'.repeat(990));
  await page.locator('[data-outcome-pressure-apply]').click();
  await expect(page.locator('#learningOutcomeError')).toContainText('até 1000 caracteres');
  await expect(page.locator('#learningOutcomeAttempt')).toHaveValue('A'.repeat(990));
  expect(await page.evaluate(()=>state.data.learningOutcomes[0])).toEqual(original);
  page.once('dialog',dialog=>dialog.accept());
  await page.keyboard.press('Escape');
  await expect(page.locator('#learningOutcomeDialog')).toBeHidden();
  expect(await page.evaluate(()=>state.data.learningOutcomes[0])).toEqual(original);
});

test('cancelar, Escape e refresh descartam preparação sem mudar a próxima tentativa',async({page})=>{
  await open(page);const original=await capability(page);
  await prepare(page);
  page.once('dialog',dialog=>dialog.dismiss());
  await page.locator('[data-outcome-cancel]').last().click();
  await expect(page.locator('#learningOutcomeDialog')).toBeVisible();
  page.once('dialog',dialog=>dialog.accept());
  await page.keyboard.press('Escape');
  await expect(page.locator('#learningOutcomeDialog')).toBeHidden();
  await expect(page.locator('[data-outcome-pressure]').first()).toBeFocused();
  expect(await page.evaluate(()=>state.data.learningOutcomes[0])).toEqual(original);
  await prepare(page,'cronometrado');
  await page.reload({waitUntil:'domcontentloaded'});
  expect(await page.evaluate(()=>state.data.learningOutcomes[0])).toEqual(original);
});

test('falha durável mantém rascunho, reverte estado e permite retry',async({page})=>{
  await open(page);const original=await capability(page);
  const dialog=await prepare(page);
  await page.evaluate(()=>{window.__pressureStorage=window.CompassoStorage;window.CompassoStorage={...window.CompassoStorage,save:async()=>false}});
  await dialog.locator('[type="submit"]').click();
  await expect(page.locator('#learningOutcomeError')).toContainText('Não foi possível salvar');
  await expect(page.locator('#learningOutcomeAttempt')).toHaveValue(/Condição de simulação/);
  expect(await page.evaluate(()=>state.data.learningOutcomes[0])).toEqual(original);
  await page.evaluate(()=>{window.CompassoStorage=window.__pressureStorage});
  await dialog.locator('[type="submit"]').click();
  await expect(dialog).toBeHidden();
  expect(await page.evaluate(()=>state.data.learningOutcomes[0].nextAttempt.futureUse)).toBe('simulate');
});

test('Session, Evidence e backup usam o snapshot normal sem novo schema',async({page})=>{
  await open(page);await capability(page);const dialog=await prepare(page);
  await dialog.locator('[type="submit"]').click();
  await page.locator('[data-outcome-execute]').first().click();
  await page.locator('#sessionStartForm').evaluate(form=>form.requestSubmit());
  await expect(page.locator('#sessionCompanionFutureUse')).toHaveText('Uso pretendido: Praticar em condições reais ou de prova');
  const started=await page.evaluate(()=>structuredClone(state.data.sessions[0].learningContext));
  expect(started.attemptText).toContain('Condição de simulação: em oito minutos');
  expect(started.futureUse).toBe('simulate');
  await page.locator('#sessionCompanionFinish').click();
  await page.locator('#sessionEvidenceSummary').fill('Respondi duas perguntas dentro do tempo');
  await page.locator('#sessionFinishForm').evaluate(form=>form.requestSubmit());
  expect(await page.evaluate(()=>state.data.evidence[0].summary)).toBe('Respondi duas perguntas dentro do tempo');
  expect(await page.evaluate(()=>state.data.executionSessions.find(item=>item.learningContext?.outcomeId===state.data.learningOutcomes[0].id)?.learningContext)).toEqual(started);
  expect(await page.evaluate(()=>Object.keys(state.data.learningOutcomes[0]).sort())).toEqual(['archivedAt','capability','createdAt','id','nextAttempt','proofCriterion','resourceRefs','status','updatedAt']);
  page.once('dialog',dialog=>dialog.accept());
  const [download]=await Promise.all([page.waitForEvent('download'),page.evaluate(()=>document.getElementById('exportBtn').click())]);
  const exported=JSON.parse(fs.readFileSync(await download.path(),'utf8'));
  expect(exported.learningOutcomes[0].nextAttempt.futureUse).toBe('simulate');
  page.once('dialog',dialog=>dialog.accept());
  await page.evaluate(()=>document.getElementById('resetBtn').click());
  await expect(page.locator('[data-outcome-card]')).toHaveCount(0);
  await page.evaluate(()=>CompassoStorage.flush('compasso.app.v1'));
  await page.locator('#importInput').setInputFiles({name:'simulation.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});
  await page.locator('#restoreConfirmBtn').click();
  await expect(page.locator('#restoreDialog')).toBeHidden();
  await expect(page.locator('[data-outcome-card]')).toContainText('Condição de simulação');
  const legacy={...exported,learningOutcomes:[{...exported.learningOutcomes[0],nextAttempt:{...exported.learningOutcomes[0].nextAttempt}}]};
  delete legacy.learningOutcomes[0].nextAttempt.futureUse;
  await page.locator('#importInput').setInputFiles({name:'legacy.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(legacy))});
  await page.locator('#restoreConfirmBtn').click();
  await expect(page.locator('#restoreDialog')).toBeHidden();
  expect(await page.evaluate(()=>'futureUse' in state.data.learningOutcomes[0].nextAttempt)).toBe(false);
});

test('arquivada não oferece simulação; mobile mantém foco, toque e rolagem',async({page},testInfo)=>{
  await open(page);await capability(page);
  await page.locator('[data-outcome-status]').first().click();
  await page.locator('[data-outcome-mode="archived"]').click();
  await expect(page.locator('[data-outcome-card] [data-outcome-pressure]')).toHaveCount(0);
  await page.evaluate(()=>{const button=document.createElement('button');button.dataset.outcomePressure=state.data.learningOutcomes[0].id;button.id='stalePressure';document.querySelector('#capabilitiesView').appendChild(button);button.click();button.remove()});
  await expect(page.locator('#learningOutcomeDialog')).toBeHidden();
  await page.locator('[data-outcome-status]').first().click();
  await page.locator('[data-outcome-mode="active"]').click();
  if(testInfo.project.name==='chromium')await page.setViewportSize({width:360,height:640});
  await page.locator('[data-outcome-pressure]').first().focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#outcomePressureCondition')).toBeFocused();
  await expect(page.locator('#outcomePressureCondition')).toHaveAccessibleName(/condição realista/);
  const geometry=await page.evaluate(()=>({page:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth,dialog:document.getElementById('learningOutcomeDialog').getBoundingClientRect().width,button:document.querySelector('[data-outcome-pressure-apply]').getBoundingClientRect().height}));
  expect(geometry.page).toBeLessThanOrEqual(geometry.viewport+1);
  expect(geometry.dialog).toBeLessThanOrEqual(geometry.viewport);
  expect(geometry.button).toBeGreaterThanOrEqual(44);
  await page.evaluate(()=>{document.documentElement.style.zoom='2'});
  const zoom=await page.evaluate(()=>({page:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}));
  expect(zoom.page).toBeLessThanOrEqual(zoom.viewport+1);
  await page.evaluate(()=>{document.documentElement.style.zoom=''});
  await page.keyboard.press('Escape');
  await expect(page.locator('#learningOutcomeDialog')).toBeHidden();
  await expect(page.locator('[data-outcome-pressure]').first()).toBeFocused();
});

test('simulação pode ser salva offline no fallback localStorage',async({page,context})=>{
  await page.addInitScript(()=>Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined}));
  await open(page);await capability(page);
  await context.setOffline(true);
  const dialog=await prepare(page,'com três minutos de tempo');
  await dialog.locator('[type="submit"]').click();
  await expect(dialog).toBeHidden();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('compasso.app.v1')).learningOutcomes[0].nextAttempt.futureUse)).toBe('simulate');
  await context.setOffline(false);
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('[data-outcome-card]')).toContainText('com três minutos de tempo');
});
