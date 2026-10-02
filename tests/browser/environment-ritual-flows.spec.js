const {test,expect}=require('@playwright/test');
const fs=require('node:fs/promises');
const PRESET='ritual-preset-environment';

async function open(page,{fallback=false}={}){
  await page.route(/^https?:\/(?!\/127\.0\.0\.1)/,route=>route.abort());
  await page.addInitScript(()=>localStorage.setItem('compasso.ux.mode.v1','essential'));
  await page.addInitScript(()=>{globalThis.CompassoDriveSync||={prepareLocalState(input){return{data:structuredClone(input),baseline:new Map()}},activateLocalState(){}}});
  if(fallback)await page.addInitScript(()=>Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined}));
  await page.goto('/?view=capabilities',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>globalThis.CompassoFeatures?.installed);
}
async function primary(page){
  await page.locator('[data-outcome-new]').first().click();
  await page.locator('#learningOutcomeCapability').fill('Diagnosticar gargalos em Spark');
  await page.locator('#learningOutcomeAttempt').fill('Analisar o primeiro operador do plano');
  await page.locator('#learningOutcomeForm').evaluate(form=>form.requestSubmit());
  await expect(page.locator('#learningOutcomeDialog')).toBeHidden();
  await page.locator('[data-outcome-today]').first().click();
  await expect(page.locator('#todayPrimaryAction')).toBeVisible();
}
async function configure(page){
  await page.locator('[data-today-primary-configure]').click();
  await expect(page.locator('#sessionStartDialog')).toBeVisible();
}
async function environment(page){
  await page.locator('#ritualQuickSelect').selectOption(PRESET);
  const preparation=page.locator('#ritualQuickPreparation');
  await expect(preparation).toBeVisible();
  await expect(preparation).not.toHaveAttribute('open','');
  await preparation.locator('summary').click();
  return preparation;
}
async function started(page){
  await expect.poll(()=>page.evaluate(()=>state.data.sessions.length)).toBe(1);
  await expect(page.locator('#sessionCompanion')).toBeVisible();
  return page.evaluate(()=>structuredClone(state.data.sessions[0]));
}

for(const checked of [0,2,6])test(`preparação com ${checked} itens marcados inicia a mesma Session sem salvar marcas`,async({page})=>{
  await open(page);await primary(page);
  const actions=await page.locator('#todayPrimaryAction .today-primary-actions button').allTextContents();
  expect(actions).toEqual(['Iniciar agora','Começar por 5 min','Ensaiar tentativa','Ajustar sessão','Abrir capacidade','Concluir no plano','Remover do plano']);
  const templates=await page.evaluate(()=>structuredClone(state.data.ritualTemplates));
  await configure(page);await environment(page);
  const checks=page.locator('#ritualQuickChecks input');await expect(checks).toHaveCount(6);
  expect(await checks.evaluateAll(items=>items.every(item=>!item.required))).toBe(true);
  for(let i=0;i<checked;i++)await checks.nth(i).check();
  await page.locator('#sessionStartSubmit').click();
  const session=await started(page);
  expect(session.ritualSnapshot.ritualId).toBe(PRESET);
  expect(session.ritualSnapshot.preparation).toHaveLength(6);
  expect(session.ritualChecklist).toEqual([]);
  expect(session.learningContext.attemptText).toBe('Analisar o primeiro operador do plano');
  expect(session.ritualSnapshot.encodingCheckpoint).toBeUndefined();
  expect(await page.evaluate(()=>state.data.ritualTemplates)).toEqual(templates);
  expect(await page.evaluate(()=>state.data.executionSessions[0].ritualSnapshot)).toEqual(session.ritualSnapshot);
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('#sessionCompanion')).toBeVisible();
  expect(await page.evaluate(()=>state.data.sessions[0].ritualSnapshot)).toEqual(session.ritualSnapshot);
});

test('pular descarta o ritual desta execução e preserva o vínculo salvo',async({page})=>{
  await open(page);
  const linked=await page.evaluate(async()=>{
    const id=state.data.ritualTemplates[0].id;state.data.study[0].ritualId=id;
    await CompassoStorage.save('compasso.app.v1',state.data);return id;
  });
  await page.evaluate(()=>CompassoInformationArchitecture.open('study'));
  await page.locator('#studyGrid .ux-execute').first().click();
  await page.locator('[data-ux-run="ideal"]').click();
  await page.locator('#sessionOptionalConfig summary').click();await environment(page);
  await page.locator('#ritualQuickChecks input').first().check();
  await page.getByRole('button',{name:'Pular e começar',exact:true}).click();
  const session=await started(page);expect(session.ritualSnapshot).toBeNull();expect(session.ritualChecklist).toEqual([]);
  expect(await page.evaluate(()=>state.data.study[0].ritualId)).toBe(linked);
  await expect(page.locator('#sessionCompanionOpen')).toBeFocused();
});

test('cancelar, Escape, troca e refresh descartam marcas e devolvem foco',async({page})=>{
  await open(page);await primary(page);await configure(page);await environment(page);
  await page.locator('#ritualQuickChecks input').first().check();
  await page.locator('#sessionStartDialog .session-dialog-foot [data-session-close]').click();
  await expect(page.locator('[data-today-primary-configure]')).toBeFocused();
  await configure(page);await environment(page);
  await expect(page.locator('#ritualQuickChecks input').first()).not.toBeChecked();
  await page.locator('#ritualQuickChecks input').first().check();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-today-primary-configure]')).toBeFocused();
  await configure(page);await environment(page);
  await page.locator('#ritualQuickChecks input').first().check();
  await page.locator('#ritualQuickSelect').selectOption('ritual-default-study');
  await expect(page.locator('#ritualQuickPreparation')).not.toHaveAttribute('open','');
  expect(await page.locator('#ritualQuickChecks input:checked').count()).toBe(0);
  await page.locator('#ritualQuickSelect').selectOption(PRESET);
  expect(await page.locator('#ritualQuickChecks input:checked').count()).toBe(0);
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('#sessionStartDialog')).toBeHidden();
  expect(await page.evaluate(()=>state.data.sessions.length)).toBe(0);
  await configure(page);await environment(page);
  expect(await page.locator('#ritualQuickChecks input:checked').count()).toBe(0);
});

test('falha de gravação conserva preparo e permite retry sem duplicação',async({page})=>{
  await open(page);await primary(page);await configure(page);await environment(page);
  await page.locator('#ritualQuickChecks input').first().check();
  await page.evaluate(()=>{window.__ritualStorage=CompassoStorage;window.CompassoStorage=Object.freeze({...CompassoStorage,save:async()=>false})});
  await page.locator('#sessionStartSubmit').click();
  await expect(page.locator('#sessionStartError')).toBeVisible();await expect(page.locator('#sessionStartError')).toBeFocused();
  expect(await page.evaluate(()=>state.data.sessions.length)).toBe(0);
  await expect(page.locator('#ritualQuickChecks input').first()).toBeChecked();
  await expect(page.locator('#ritualQuickSelect')).toHaveValue(PRESET);
  await page.evaluate(()=>{window.CompassoStorage=window.__ritualStorage});
  await page.locator('#sessionStartSubmit').click();const session=await started(page);
  expect(session.ritualSnapshot.ritualId).toBe(PRESET);expect(session.ritualChecklist).toEqual([]);
});

for(const skip of [false,true])test(`transferência para Deep Work respeita ${skip?'dispensa':'template'} sem outro checklist`,async({page})=>{
  await open(page);await primary(page);await configure(page);await environment(page);
  await page.locator('#sessionMode').selectOption('deep');
  if(skip)await page.getByRole('button',{name:'Pular e começar',exact:true}).click();
  else await page.locator('#sessionStartSubmit').click();
  await expect(page.locator('#deepDialog')).toBeVisible();
  await expect(page.locator('#ritualSessionSelect')).toHaveValue(skip?'':PRESET);
  await expect(page.locator('#ritualSessionChecks input')).toHaveCount(skip?0:6);
  await page.locator('#deepStart').click();
  expect(await page.evaluate(()=>state.data.deepWorkSessions[0].ritualSnapshot?.ritualId||null)).toBe(skip?null:PRESET);
});

test('coleção vazia e backups antigo/novo preservam dados e snapshot autossuficiente',async({page})=>{
  await open(page);await primary(page);
  await page.evaluate(async()=>{state.data.ritualTemplates=[];await CompassoStorage.save('compasso.app.v1',state.data)});
  await configure(page);await expect(page.locator('#ritualQuickSelect')).toHaveValue('');
  await environment(page);await page.locator('#sessionStartSubmit').click();const session=await started(page);
  await page.locator('#settingsBtn').click();page.once('dialog',dialog=>dialog.accept());
  const downloaded=page.waitForEvent('download');await page.locator('#exportBtn').click();
  const backup=JSON.parse(await fs.readFile(await (await downloaded).path(),'utf8'));
  expect(backup.ritualTemplates).toEqual([]);expect(backup.sessions[0].ritualSnapshot).toEqual(session.ritualSnapshot);
  await page.locator('#importInput').setInputFiles({name:'ritual.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});
  await page.locator('#restoreConfirmBtn').click();await expect(page.locator('#restoreDialog')).toBeHidden();
  await page.reload({waitUntil:'domcontentloaded'});
  expect(await page.evaluate(()=>state.data.ritualTemplates)).toEqual([]);
  expect(await page.evaluate(()=>state.data.sessions[0].ritualSnapshot)).toEqual(session.ritualSnapshot);
  const legacy={...backup,sessions:[],executionSessions:[]};delete legacy.ritualTemplates;
  await page.locator('#settingsBtn').click();
  await page.locator('#importInput').setInputFiles({name:'legacy.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(legacy))});
  await page.locator('#restoreConfirmBtn').click();await expect(page.locator('#restoreDialog')).toBeHidden();
  expect(await page.evaluate(()=>state.data.ritualTemplates.some(item=>item.id==='ritual-preset-environment'))).toBe(false);
  expect(await page.evaluate(()=>state.data.reading)).toEqual(backup.reading);
});

test('fallback localStorage inicia offline e recupera somente snapshot da Session',async({page,context})=>{
  await open(page,{fallback:true});await primary(page);
  await page.evaluate(()=>navigator.serviceWorker.ready);await expect.poll(()=>page.evaluate(()=>Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);await configure(page);await environment(page);
  await page.locator('#ritualQuickChecks input').first().check();await page.locator('#sessionStartSubmit').click();const session=await started(page);
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('compasso.app.v1')).sessions[0].ritualChecklist)).toEqual([]);
  await page.reload({waitUntil:'domcontentloaded'});await expect(page.locator('#sessionCompanion')).toBeVisible();
  expect(await page.evaluate(()=>state.data.sessions[0].ritualSnapshot)).toEqual(session.ritualSnapshot);
});

test('teclado, labels, alvos e zoom mantêm preparo utilizável no mobile',async({page},testInfo)=>{
  await open(page);await primary(page);await configure(page);
  if(testInfo.project.name==='chromium')await page.setViewportSize({width:360,height:740});
  await page.locator('#ritualQuickSelect').selectOption(PRESET);
  await page.locator('#ritualQuickPreparation summary').focus();await page.keyboard.press('Enter');await page.keyboard.press('Tab');
  await expect(page.getByRole('checkbox',{name:'Celular fora do alcance',exact:true})).toBeFocused();
  await page.keyboard.press('Space');await expect(page.getByRole('checkbox',{name:'Celular fora do alcance',exact:true})).toBeChecked();
  await page.locator('#sessionOptionalConfig > summary').click();
  await page.locator('#ritualQuickPreparation').screenshot({path:`test-results/environment-ritual-${testInfo.project.name}.png`});
  const geometry=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth,targets:[...document.querySelectorAll('#ritualQuickPreparation label,#ritualQuickPreparation summary,#ritualQuickSkip')].map(item=>item.getBoundingClientRect().height)}));
  expect(geometry.width).toBeLessThanOrEqual(geometry.viewport+1);expect(geometry.targets.every(height=>height>=44)).toBe(true);
  await page.evaluate(()=>document.documentElement.style.zoom='2');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1)).toBe(true);
  await page.evaluate(()=>document.documentElement.style.zoom='');
  await page.getByRole('button',{name:'Pular e começar',exact:true}).focus();await page.keyboard.press('Enter');
  await started(page);await expect(page.locator('#sessionCompanionOpen')).toBeFocused();
});
