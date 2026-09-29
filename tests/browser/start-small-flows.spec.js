const {test,expect}=require('@playwright/test');
const fs=require('node:fs/promises');

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
  await page.locator('#learningOutcomeAttempt').fill('Analisar um query plan');
  await page.locator('#learningOutcomeForm').evaluate(form=>form.requestSubmit());
  await expect(page.locator('#learningOutcomeDialog')).toBeHidden();
  await page.locator('[data-outcome-today]').first().click();
  await expect(page.locator('#todayPrimaryAction')).toBeVisible();
  return page.locator('#todayPrimaryAction');
}
async function shortSession(page){
  await page.locator('[data-today-primary-small]').click();
  await expect.poll(()=>page.evaluate(()=>state.data.sessions.length)).toBe(1);
  await expect(page.locator('#sessionCompanion')).toBeVisible();
  return page.evaluate(()=>structuredClone(state.data.sessions[0]));
}
async function moveElapsed(page,minutes){
  await page.evaluate(async minutes=>{
    const session=state.data.sessions[0];
    session.startedAt=new Date(Date.now()-minutes*60000).toISOString();
    state.data.executionSessions=CompassoExecutionSessionModel.migrate(state.data);
    await CompassoStorage.save('compasso.app.v1',state.data);
    renderAll();
  },minutes);
}

test('atalho inicia Session normal e continua do marco após refresh, sem perder Evidence',async({page})=>{
  await open(page);const card=await primary(page);
  await expect(card.locator('[data-today-primary-start]')).toBeVisible();
  await expect(card.locator('[data-today-primary-small]')).toHaveClass(/secondary-btn/);
  await expect(card.locator('[data-today-primary-rehearse]')).toBeVisible();
  const started=await shortSession(page);
  expect(started.schemaVersion).toBe(2);
  expect(started.startSmall).toEqual({minutes:5,choice:null,decidedAt:null});
  expect(started.executionVariant.kind).toBe('ideal');
  expect(started.learningContext.attemptText).toBe('Analisar um query plan');
  expect(await page.evaluate(()=>state.data.executionSessions[0].plannedMinutes)).toBe(5);
  await moveElapsed(page,4);
  await expect(page.locator('#sessionStartSmallDecision')).toBeHidden();
  await moveElapsed(page,7);
  await expect(page.locator('#sessionStartSmallDecision')).toBeVisible();
  await expect(page.locator('#sessionCompanionTime')).toHaveText('05:00');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>globalThis.CompassoFeatures?.installed);
  await expect(page.locator('#sessionStartSmallDecision')).toBeVisible();
  await expect(page.locator('#sessionCompanionTime')).toHaveText('05:00');
  await page.getByRole('button',{name:'Continuar sessão',exact:true}).click();
  await expect(page.locator('#sessionStartSmallDecision')).toBeHidden();
  await expect.poll(()=>page.evaluate(()=>CompassoSessionTimerModel.elapsed(state.data.sessions[0]))).toBeGreaterThan(300000);
  const resumed=await page.evaluate(()=>state.data.sessions[0]);
  expect(resumed.id).toBe(started.id);expect(resumed.startSmall.choice).toBe('continue');
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('#sessionStartSmallDecision')).toBeHidden();
  await page.locator('#sessionCompanionFinish').click();
  await page.locator('#sessionEvidenceSummary').fill('Identifiquei um gargalo verificável no plano');
  await page.locator('#sessionFinishForm').evaluate(form=>form.requestSubmit());
  await expect(page.locator('#executionCompletionPanel')).toBeVisible();
  expect(await page.evaluate(()=>({id:state.data.sessions[0].id,status:state.data.sessions[0].status,evidence:state.data.evidence[0].sessionId}))).toEqual({id:started.id,status:'completed',evidence:started.id});
});

test('encerrar congela cinco minutos, aceita Evidence e cancelar devolve decisão',async({page})=>{
  await open(page);await primary(page);const started=await shortSession(page);
  await moveElapsed(page,8);
  await page.getByRole('button',{name:'Encerrar e registrar'}).click();
  await expect(page.locator('#sessionFinishDialog')).toBeVisible();
  expect(await page.evaluate(()=>state.data.sessions[0].frozenDurationMs)).toBe(300000);
  await page.locator('#sessionFinishDialog .quiet-btn').click();
  await expect(page.locator('#sessionStartSmallDecision')).toBeVisible();
  await page.getByRole('button',{name:'Encerrar e registrar'}).click();
  await page.locator('#sessionEvidenceSummary').fill('Revisei o primeiro gargalo');
  await page.locator('#sessionFinishForm').evaluate(form=>form.requestSubmit());
  await expect(page.locator('#executionCompletionPanel')).toBeVisible();
  expect(await page.evaluate(()=>({id:state.data.sessions[0].id,duration:state.data.sessions[0].durationMs,evidence:state.data.evidence[0].sessionId}))).toEqual({id:started.id,duration:300000,evidence:started.id});
});

test('ajustar pausa a Session e abre editor mantendo snapshot original',async({page})=>{
  await open(page);await primary(page);const started=await shortSession(page);
  await moveElapsed(page,7);
  await page.getByRole('button',{name:'Ajustar tentativa'}).click();
  await expect(page.locator('#learningOutcomeDialog')).toBeVisible();
  expect(await page.evaluate(()=>({status:state.data.sessions[0].status,choice:state.data.sessions[0].startSmall.choice,context:state.data.sessions[0].learningContext.attemptText}))).toEqual({status:'paused',choice:'adjust',context:'Analisar um query plan'});
  await page.locator('#learningOutcomeAttempt').fill('Analisar apenas o primeiro operador');
  await page.locator('#learningOutcomeForm').evaluate(form=>form.requestSubmit());
  await expect(page.locator('#learningOutcomeDialog')).toBeHidden();
  expect(await page.evaluate(()=>state.data.sessions[0].learningContext.attemptText)).toBe(started.learningContext.attemptText);
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('#sessionStartSmallDecision')).toBeHidden();
  expect(await page.evaluate(()=>state.data.sessions[0].status)).toBe('paused');
});

test('Capability indisponível impede ajuste e mantém outras decisões',async({page})=>{
  await open(page);await primary(page);await shortSession(page);
  await moveElapsed(page,7);
  await page.evaluate(async()=>{
    const outcome=state.data.learningOutcomes.find(item=>item.id===state.data.sessions[0].learningContext.outcomeId);
    outcome.status='archived';
    await CompassoStorage.save('compasso.app.v1',state.data);
    renderAll();
  });
  await page.getByRole('button',{name:'Ajustar tentativa'}).click();
  await expect(page.locator('#sessionStartSmallError')).toContainText('não está disponível');
  await expect(page.locator('#sessionStartSmallError')).toBeFocused();
  expect(await page.evaluate(()=>state.data.sessions[0].startSmall.choice)).toBeNull();
  await page.getByRole('button',{name:'Continuar sessão',exact:true}).click();
  await expect(page.locator('#sessionStartSmallDecision')).toBeHidden();
});

test('falha ao iniciar ou decidir conserva estado durável e permite retry',async({page})=>{
  await open(page);await primary(page);
  await page.evaluate(()=>{window.__smallStorage=CompassoStorage;window.CompassoStorage=Object.freeze({...CompassoStorage,save:async()=>false})});
  await page.locator('[data-today-primary-small]').click();
  await expect(page.locator('#todayStartSmallError')).toBeVisible();
  await expect(page.locator('#todayStartSmallError')).toBeFocused();
  expect(await page.evaluate(()=>state.data.sessions.length)).toBe(0);
  await page.evaluate(()=>{window.CompassoStorage=window.__smallStorage});
  await shortSession(page);
  await moveElapsed(page,7);
  const before=await page.evaluate(()=>structuredClone(state.data.sessions[0]));
  await page.evaluate(()=>{window.CompassoStorage=Object.freeze({...window.__smallStorage,save:async()=>false})});
  await page.getByRole('button',{name:'Continuar sessão',exact:true}).click();
  await expect(page.locator('#sessionStartSmallError')).toBeVisible();
  await expect(page.locator('#sessionStartSmallError')).toBeFocused();
  expect(await page.evaluate(()=>state.data.sessions[0])).toEqual(before);
  await page.evaluate(()=>{window.CompassoStorage=window.__smallStorage});
  await page.getByRole('button',{name:'Continuar sessão',exact:true}).click();
  await expect(page.locator('#sessionStartSmallDecision')).toBeHidden();
});

test('Session direta e legado v1 continuam ilimitados',async({page})=>{
  await open(page);await primary(page);
  await page.locator('[data-today-primary-start]').click();
  await expect.poll(()=>page.evaluate(()=>state.data.sessions.length)).toBe(1);
  await moveElapsed(page,8);
  await expect(page.locator('#sessionStartSmallDecision')).toBeHidden();
  expect(await page.evaluate(()=>CompassoSessionTimerModel.elapsed(state.data.sessions[0]))).toBeGreaterThan(300000);
  await page.evaluate(async()=>{const session=state.data.sessions[0];session.schemaVersion=1;delete session.startSmall;await CompassoStorage.save('compasso.app.v1',state.data)});
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('#sessionStartSmallDecision')).toBeHidden();
  expect(await page.evaluate(()=>state.data.sessions[0].schemaVersion)).toBe(1);
});

test('fallback localStorage recupera decisão offline e backup mantém o marcador',async({page,context})=>{
  await open(page,{fallback:true});await primary(page);await shortSession(page);
  await context.setOffline(true);
  await moveElapsed(page,6);
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('#sessionStartSmallDecision')).toBeVisible();
  await page.getByRole('button',{name:'Continuar sessão',exact:true}).click();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('compasso.app.v1')).sessions[0].startSmall.choice)).toBe('continue');
  await context.setOffline(false);
  await page.locator('#settingsBtn').click();
  page.once('dialog',dialog=>dialog.accept());
  const downloadEvent=page.waitForEvent('download');
  await page.locator('#exportBtn').click();
  const backup=JSON.parse(await fs.readFile(await (await downloadEvent).path(),'utf8'));
  expect(backup.sessions[0].startSmall.choice).toBe('continue');
  expect(backup.executionSessions.find(item=>item.source?.id===backup.sessions[0].id).plannedMinutes).toBe(5);
});

test('marco e decisões são operáveis por teclado e não causam overflow no mobile',async({page},testInfo)=>{
  await open(page);await primary(page);
  if(testInfo.project.name==='chromium')await page.setViewportSize({width:360,height:640});
  await shortSession(page);await moveElapsed(page,6);
  const panel=page.locator('#sessionStartSmallDecision');await expect(panel).toBeVisible();
  for(const label of ['Continuar sessão','Encerrar e registrar','Ajustar tentativa'])await expect(panel.getByRole('button',{name:label})).toHaveAccessibleName(label);
  const size=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth,buttons:[...document.querySelectorAll('#sessionStartSmallDecision button')].map(button=>button.getBoundingClientRect().height)}));
  expect(size.width).toBeLessThanOrEqual(size.viewport+1);expect(size.buttons.every(height=>height>=44)).toBe(true);
  await page.evaluate(()=>{document.documentElement.style.zoom='2'});
  const zoom=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}));
  expect(zoom.width).toBeLessThanOrEqual(zoom.viewport+1);
  await page.evaluate(()=>{document.documentElement.style.zoom=''});
  await panel.getByRole('button',{name:'Continuar sessão'}).focus();
  await page.keyboard.press('Enter');
  await expect(panel).toBeHidden();
  await expect(page.locator('#sessionCompanionOpen')).toBeFocused();
});
