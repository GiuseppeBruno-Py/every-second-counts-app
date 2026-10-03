const {test,expect}=require('@playwright/test');
const fs=require('node:fs/promises');
const panel=page=>page.locator('.today-attempt-return:visible');
async function open(page,{fallback=false}={}){
  await page.route(/^https?:\/(?!\/127\.0\.0\.1)/,route=>route.abort());
  await page.addInitScript(()=>localStorage.setItem('compasso.ux.mode.v1','essential'));
  await page.addInitScript(()=>{globalThis.CompassoDriveSync||={prepareLocalState(input){return{data:structuredClone(input),baseline:new Map()}},activateLocalState(){}}});
  if(fallback)await page.addInitScript(()=>Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined}));
  await page.goto('/?view=capabilities',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>globalThis.CompassoFeatures?.installed);
  await page.locator('[data-outcome-new]').first().click();
  await page.locator('#learningOutcomeCapability').fill('Explicar gargalos em Spark');
  await page.locator('#learningOutcomeAttempt').fill('Comparar dois query plans');
  await page.locator('#learningOutcomeForm').evaluate(form=>form.requestSubmit());
  await expect(page.locator('#learningOutcomeDialog')).toBeHidden();
  await page.locator('[data-outcome-today]').first().click();
  await expect(page.locator('#todayPrimaryAction')).toBeVisible();
}
async function seed(page){
  await page.evaluate(async()=>{
    const outcome=state.data.learningOutcomes[0],old=new Date();old.setDate(old.getDate()-20);old.setHours(12,0,0,0);
    outcome.createdAt=old.toISOString();outcome.nextAttempt.createdAt=old.toISOString();outcome.nextAttempt.updatedAt=old.toISOString();
    for(let offset=1;offset<=3;offset++){
      const time=new Date();time.setDate(time.getDate()-offset);time.setHours(12,0,0,0);
      const date=new Date(time.getTime()-time.getTimezoneOffset()*60000).toISOString().slice(0,10);
      state.data.dailyPlans.push({id:'day-'+date,schemaVersion:2,date,items:[CompassoCapabilityContextModel.createTodayItem(outcome,{id:'return-'+offset,now:time.toISOString()})],updatedAt:time.toISOString()});
    }
    await CompassoStorage.save('compasso.app.v1',state.data);renderAll();
  });
  await expect(panel(page)).toBeVisible();
}
const snapshot=page=>page.evaluate(()=>structuredClone(state.data));
async function expand(page){await panel(page).locator('summary').click();await expect(panel(page)).toHaveAttribute('open','')}
async function cancel(page){await page.locator('[data-outcome-cancel]').last().click();await expect(page.locator('#learningOutcomeDialog')).toBeHidden()}
async function contrast(locator,property='color'){
  return locator.evaluate((node,property)=>{
    const lum=c=>{const [r,g,b]=c.match(/[\d.]+/g).slice(0,3).map(Number).map(n=>{const x=n/255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4});return .2126*r+.7152*g+.0722*b};
    let background='rgb(255,255,255)';for(let e=node;e;e=e.parentElement){const c=getComputedStyle(e).backgroundColor;if(!c.startsWith('rgba')||!c.endsWith(', 0)')){background=c;break}}
    const x=lum(getComputedStyle(node)[property]),y=lum(background);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05);
  },property);
}

test('contexto depende de retornos registrados; leitura factual não grava nem acrescenta ações principais',async({page})=>{
  await open(page);await expect(panel(page)).toHaveCount(0);await seed(page);
  const initial=await snapshot(page);await expect(panel(page)).not.toHaveAttribute('open','');await expand(page);
  await expect(panel(page).locator('p')).toContainText('continua sem conclusão marcada');
  await expect(panel(page).locator('button')).toHaveCount(6);await expect(page.locator('.today-primary-actions button')).toHaveCount(7);
  expect(await panel(page).innerText()).not.toMatch(/procrastin|score|alerta|\d+ vezes/i);
  await page.evaluate(()=>renderAll());await expect(panel(page)).toHaveAttribute('open','');expect(await snapshot(page)).toEqual(initial);
});

test('quatro atalhos abrem o campo certo; Cancelar e Escape preservam dados e foco',async({page})=>{
  await open(page);await seed(page);await expand(page);const initial=await snapshot(page);
  for(const [action,field] of [['smaller','outcomeSmallStart'],['firstStep','outcomeSmallStart'],['context','outcomeStartCue'],['benefit','learningOutcomeBenefit']]){
    const trigger=panel(page).locator(`[data-today-attempt-adjust="${action}"]`);await trigger.click();await expect(page.locator('#'+field)).toBeFocused();
    expect(await snapshot(page)).toEqual(initial);await cancel(page);await expect(trigger).toBeFocused();
  }
  const trigger=panel(page).locator('[data-today-attempt-adjust="smaller"]');await trigger.click();await page.locator('#outcomeSmallStart').fill('Ler um plano');
  expect(await page.evaluate(()=>CompassoFeatures.execute('capability.openAdjustment',{capabilityRef:CompassoCapabilityContextModel.createCapabilityRef(state.data.learningOutcomes[0]),target:'benefit'}))).toBe(false);await expect(page.locator('#outcomeSmallStart')).toHaveValue('Ler um plano');
  page.once('dialog',dialog=>dialog.accept());await page.keyboard.press('Escape');await expect(trigger).toBeFocused();expect(await snapshot(page)).toEqual(initial);
});

test('menor e contexto só alteram tentativa após aplicar e salvar',async({page})=>{
  await open(page);await seed(page);await expand(page);const initial=await snapshot(page);
  await panel(page).locator('[data-today-attempt-adjust="context"]').click();await page.locator('#outcomeSmallStart').fill('Comparar só o primeiro join');await page.locator('#outcomeStartCue').fill('Depois do café');
  expect(await snapshot(page)).toEqual(initial);await page.locator('[data-outcome-executable-apply]').click();expect(await snapshot(page)).toEqual(initial);
  await page.locator('#learningOutcomeForm').evaluate(form=>form.requestSubmit());await expect(page.locator('#learningOutcomeDialog')).toBeHidden();
  const current=await snapshot(page);expect(current.learningOutcomes[0].nextAttempt.id).toBe(initial.learningOutcomes[0].nextAttempt.id);
  expect(current.learningOutcomes[0].nextAttempt.text).toContain('Comparar só o primeiro join');expect(current.learningOutcomes[0].nextAttempt.text).toContain('Depois do café');
  expect(current.dailyPlans).toEqual(initial.dailyPlans);await expect(panel(page)).toHaveCount(0);
});

test('benefício conserva rascunho e rollback em falha; retry usa confirmação existente',async({page})=>{
  await open(page);await seed(page);await expand(page);const initial=await snapshot(page);
  await panel(page).locator('[data-today-attempt-adjust="benefit"]').click();await page.locator('#learningOutcomeBenefit').fill('Explicar decisões com autonomia');
  await page.evaluate(()=>{window.__returnStorage=CompassoStorage;window.CompassoStorage=Object.freeze({...CompassoStorage,save:async()=>false})});
  await page.locator('#learningOutcomeForm').evaluate(form=>form.requestSubmit());await expect(page.locator('#learningOutcomeError')).toBeVisible();
  await expect(page.locator('#learningOutcomeBenefit')).toHaveValue('Explicar decisões com autonomia');expect(await snapshot(page)).toEqual(initial);
  await page.evaluate(()=>window.CompassoStorage=window.__returnStorage);
  await page.locator('#learningOutcomeForm').evaluate(form=>form.requestSubmit());await expect(page.locator('#learningOutcomeDialog')).toBeHidden();
  const current=await snapshot(page);expect(current.learningOutcomes[0].benefit).toBe('Explicar decisões com autonomia');expect(current.learningOutcomes[0].nextAttempt).toEqual(initial.learningOutcomes[0].nextAttempt);
});

test('preparar ambiente abre Ritual sem gravar; iniciar confirmado registra execução e suprime contexto',async({page})=>{
  await open(page);await seed(page);await expand(page);const initial=await snapshot(page);
  const trigger=panel(page).locator('[data-today-attempt-adjust="environment"]');await trigger.click();await expect(page.locator('#sessionOptionalConfig')).toHaveAttribute('open','');await expect(page.locator('#ritualQuickSelect')).toBeFocused();expect(await snapshot(page)).toEqual(initial);
  await page.locator('#ritualQuickSelect').selectOption('ritual-preset-environment');await page.locator('#ritualQuickPreparation > summary').click();await page.locator('#ritualQuickChecks input').first().check();expect(await snapshot(page)).toEqual(initial);
  await page.locator('[data-session-close="sessionStartDialog"]').last().click();await expect(trigger).toBeFocused();expect(await snapshot(page)).toEqual(initial);
  await trigger.click();await page.locator('#ritualQuickSelect').selectOption('ritual-preset-environment');await page.locator('#sessionStartSubmit').click();
  await expect.poll(()=>page.evaluate(()=>state.data.sessions.length)).toBe(1);await expect(panel(page)).toHaveCount(0);
  const current=await snapshot(page);expect(current.learningOutcomes).toEqual(initial.learningOutcomes);expect(current.sessions[0].learningContext.attemptText).toBe(initial.learningOutcomes[0].nextAttempt.text);
});

test('manter ignora por visita; rerender mantém foco e ações stale não abrem editor',async({page})=>{
  await open(page);await seed(page);await expand(page);const initial=await snapshot(page);
  const keep=panel(page).locator('[data-today-attempt-adjust="keep"]');await keep.focus();await page.evaluate(()=>renderAll());await expect(keep).toBeFocused();await keep.click();await expect(panel(page)).toHaveCount(0);await expect(page.locator('[data-today-primary-start]')).toBeFocused();expect(await snapshot(page)).toEqual(initial);
  await page.locator('[data-ia-area=fronts]').first().click();await page.locator('[data-ia-area=today]').first().click();await expect(panel(page)).toBeVisible();await expand(page);
  await page.evaluate(()=>{state.data.dailyPlans.find(p=>p.id.startsWith('day-')&&p.items[0]?.id==='return-1').items[0].completedAt=new Date().toISOString()});
  await panel(page).locator('[data-today-attempt-adjust="smaller"]').click();await expect(page.locator('#learningOutcomeDialog')).toBeHidden();await expect(panel(page)).toHaveCount(0);
});

test('malformação, cópia, conclusão, execução e edição suprimem sem associação por título',async({page})=>{
  await open(page);await seed(page);const initial=await snapshot(page);
  for(const mode of ['few','malformed','copied','completed','edited','reverted','archived','execution','legacyExecution','deepExecution','conflict']){
    await page.evaluate(({initial,mode})=>{
      state.data=structuredClone(initial);const outcome=state.data.learningOutcomes[0],history=state.data.dailyPlans.filter(p=>p.items[0]?.id?.startsWith('return-'));
      if(mode==='few')state.data.dailyPlans=state.data.dailyPlans.filter(p=>p!==history[0]);
      if(mode==='malformed')delete history[0].items[0].createdAt;
      if(mode==='copied')history[0].items[0].id=history[1].items[0].id;
      if(mode==='completed')history[0].items[0].completedAt=new Date().toISOString();
      if(mode==='edited')outcome.nextAttempt.text='Um plano';
      if(mode==='reverted')outcome.nextAttempt.updatedAt=new Date().toISOString();
      if(mode==='archived')outcome.status='archived';
      const collection={execution:'executionSessions',legacyExecution:'sessions',deepExecution:'deepWorkSessions'}[mode];
      if(collection)state.data[collection]=[{id:'started',source:{collection:'sessions',id:'started'},status:'interrupted',state:'interrupted',learningContext:CompassoCapabilityContextModel.createCapabilityRef(outcome),startedAt:new Date().toISOString()}];
      if(mode==='conflict')state.data._sync={...(state.data._sync||{}),conflicts:[{collection:'dailyPlans',key:history[0].id}]};
      renderAll();
    },{initial,mode});await expect(panel(page),mode).toHaveCount(0);
  }
});

for(const fallback of [false,true])test(`registros sobrevivem backup/restore e offline reload em ${fallback?'fallback':'IndexedDB'}`,async({page,context})=>{
  await open(page,{fallback});await seed(page);const initial=await snapshot(page);
  await page.locator('#settingsBtn').click();page.once('dialog',dialog=>dialog.accept());const downloadPromise=page.waitForEvent('download');await page.locator('#exportBtn').click();const download=await downloadPromise;const saved=JSON.parse(await fs.readFile(await download.path(),'utf8'));
  expect(saved.dailyPlans).toEqual(initial.dailyPlans);expect(saved.learningOutcomes).toEqual(initial.learningOutcomes);
  await page.locator('#importInput').setInputFiles({name:'returns.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(saved))});await page.locator('#restoreConfirmBtn').click();await expect(page.locator('#restoreDialog')).toBeHidden();
  if(await page.locator('#settingsMenu').evaluate(menu=>menu.classList.contains('open')))await page.locator('#settingsBtn').click();
  await page.evaluate(()=>CompassoFeatures.execute('today.openPrimary',{}));await expect(panel(page)).toBeVisible();await expand(page);await panel(page).locator('[data-today-attempt-adjust="keep"]').click();
  await page.evaluate(()=>navigator.serviceWorker.ready);await expect.poll(()=>page.evaluate(()=>Boolean(navigator.serviceWorker.controller))).toBe(true);await context.setOffline(true);await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>globalThis.CompassoFeatures?.installed);await page.evaluate(()=>CompassoFeatures.execute('today.openPrimary',{}));await expect(panel(page)).toBeVisible();
  const current=await snapshot(page);expect(current.dailyPlans).toEqual(initial.dailyPlans);expect(current.learningOutcomes).toEqual(initial.learningOutcomes);
});

test('teclado, foco, contraste, 360px e zoom 200% com movimento reduzido',async({page},testInfo)=>{
  await open(page);await seed(page);await page.emulateMedia({reducedMotion:'reduce'});
  const summary=panel(page).locator('summary');await summary.focus();await page.keyboard.press('Enter');await expect(panel(page)).toHaveAttribute('open','');await page.keyboard.press('Space');await expect(panel(page)).not.toHaveAttribute('open','');await page.keyboard.press('Enter');
  expect(await contrast(summary)).toBeGreaterThanOrEqual(4.5);expect(await contrast(summary,'outlineColor')).toBeGreaterThanOrEqual(3);
  expect(await summary.evaluate(e=>parseFloat(getComputedStyle(e).outlineWidth))).toBeGreaterThanOrEqual(3);
  for(const button of await panel(page).locator('button').all()){expect((await button.boundingBox()).height).toBeGreaterThanOrEqual(44);expect(await contrast(button)).toBeGreaterThanOrEqual(4.5)}
  await fs.mkdir('test-results',{recursive:true});await panel(page).scrollIntoViewIfNeeded();await page.screenshot({path:`test-results/attempt-return-${testInfo.project.name}.png`});
  await page.setViewportSize({width:360,height:900});await page.evaluate(()=>document.body.style.zoom='2');await summary.scrollIntoViewIfNeeded();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  async function expectReadableWords(){
    const spaces=await panel(page).locator('button').evaluateAll(buttons=>buttons.map(button=>{
      const style=getComputedStyle(button),context=document.createElement('canvas').getContext('2d');context.font=style.font;
      return {label:button.textContent,available:button.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight),required:Math.max(...button.textContent.trim().split(/\s+/).map(word=>context.measureText(word).width))};
    }));
    for(const space of spaces)expect(space.available,space.label).toBeGreaterThanOrEqual(space.required);
  }
  await expectReadableWords();
  // Stress at least the wider Ubuntu glyph width, including on Windows.
  await panel(page).locator('button').evaluateAll(buttons=>buttons.forEach(button=>{
    button.style.fontFamily='monospace';button.style.fontSize='16px';
    const context=document.createElement('canvas').getContext('2d');context.font=getComputedStyle(button).font;
    button.style.fontSize=`${Math.max(16,16*97/context.measureText('Esclarecer').width)}px`;
  }));
  await expectReadableWords();
  await panel(page).locator('[data-today-attempt-adjust="firstStep"]').scrollIntoViewIfNeeded();
  await page.screenshot({path:`test-results/attempt-return-zoom-${testInfo.project.name}.png`});
  await page.evaluate(()=>document.body.style.zoom='1');const trigger=panel(page).locator('[data-today-attempt-adjust="firstStep"]');await trigger.focus();await page.keyboard.press('Enter');await expect(page.locator('#outcomeSmallStart')).toBeFocused();await page.keyboard.press('Escape');await expect(trigger).toBeFocused();
});
