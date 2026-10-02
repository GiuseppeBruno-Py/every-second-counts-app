const {test,expect}=require('@playwright/test');
const fs=require('node:fs/promises');

const BENEFIT='Resolver incidentes com mais autonomia';
async function contrast(locator,property='color'){
  return locator.evaluate((node,property)=>{
    const luminance=color=>{
      const [r,g,b]=color.match(/[\d.]+/g).slice(0,3).map(Number).map(c=>{const x=c/255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4});
      return .2126*r+.7152*g+.0722*b;
    };
    let background='rgb(255,255,255)';
    for(let element=node;element;element=element.parentElement){
      const color=getComputedStyle(element).backgroundColor;
      if(!color.startsWith('rgba')||!color.endsWith(', 0)')){background=color;break}
    }
    const x=luminance(getComputedStyle(node)[property]),y=luminance(background);
    return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
  },property);
}
async function open(page,{fallback=false}={}){
  await page.route(/^https?:\/(?!\/127\.0\.0\.1)/,route=>route.abort());
  await page.addInitScript(()=>localStorage.setItem('compasso.ux.mode.v1','essential'));
  await page.addInitScript(()=>{globalThis.CompassoDriveSync||={prepareLocalState(input){return{data:structuredClone(input),baseline:new Map()}},activateLocalState(){}}});
  if(fallback)await page.addInitScript(()=>Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined}));
  await page.goto('/?view=capabilities',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>globalThis.CompassoFeatures?.installed);
}
async function create(page,benefit){
  await page.locator('[data-outcome-new]').first().click();
  await expect(page.locator('#outcomeBenefitPanel')).not.toHaveAttribute('open','');
  await page.locator('#learningOutcomeCapability').fill('Diagnosticar gargalos em Spark');
  await page.locator('#learningOutcomeAttempt').fill('Analisar dois query plans');
  await page.locator('#learningOutcomeProof').fill('Explicar o gargalo e verificar a correção');
  await page.locator('#learningOutcomeFutureUse').selectOption('solve');
  if(benefit!==undefined){
    await page.locator('#outcomeBenefitPanel > summary').click();
    await page.locator('#learningOutcomeBenefit').fill(benefit);
  }
  await submit(page);
  return page.evaluate(()=>structuredClone(state.data.learningOutcomes[0]));
}
async function submit(page){
  await page.locator('#learningOutcomeForm').evaluate(form=>form.requestSubmit());
  await expect(page.locator('#learningOutcomeDialog')).toBeHidden();
}
async function today(page){
  await page.locator('[data-outcome-today]').first().click();
  await expect(page.locator('#todayPrimaryAction')).toBeVisible();
  return page.locator('#todayPrimaryAction');
}
async function editFromToday(page){
  await page.locator('[data-today-open-capability]').first().click();
  await page.locator('[data-outcome-edit]').first().click();
}
async function restore(page,data){
  if(!await page.locator('#settingsMenu').evaluate(menu=>menu.classList.contains('open')))await page.locator('#settingsBtn').click();
  await page.locator('#importInput').setInputFiles({name:'capability.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});
  await page.locator('#restoreConfirmBtn').click();
  await expect(page.locator('#restoreDialog')).toBeHidden();
  if(await page.locator('#settingsMenu').evaluate(menu=>menu.classList.contains('open')))await page.locator('#settingsBtn').click();
}

test('opção cria, edita e limpa sem competir com tentativa, prova ou uso',async({page})=>{
  await open(page);const base=await create(page);
  expect('benefit' in base).toBe(false);expect(base.schemaVersion).toBe(1);
  await expect(page.locator('.learning-outcome-card .capability-benefit')).toHaveCount(0);
  await page.locator('[data-outcome-edit]').first().click();
  await page.locator('#outcomeBenefitPanel > summary').click();
  const phrase='Resolver incidentes <img src=x onerror=alert(1)> com autonomia';
  await page.locator('#learningOutcomeBenefit').fill(phrase);await submit(page);
  await expect(page.locator('.learning-outcome-card .capability-benefit')).toHaveText('Isso ajuda a: '+phrase);
  await expect(page.locator('.capability-benefit img')).toHaveCount(0);
  const card=await today(page);
  await expect(card.locator('h3')).toHaveText(base.nextAttempt.text);
  await expect(card.locator('.capability-benefit')).toHaveText('Isso ajuda a: '+phrase);
  await expect(card.locator('.today-primary-actions button')).toHaveCount(7);
  const updated=await page.evaluate(()=>state.data.learningOutcomes[0]);
  expect(updated.nextAttempt).toEqual(base.nextAttempt);expect(updated.proofCriterion).toBe(base.proofCriterion);expect(updated.id).toBe(base.id);
  await editFromToday(page);await expect(page.locator('#outcomeBenefitPanel')).toHaveAttribute('open','');
  await page.locator('#learningOutcomeBenefit').fill(BENEFIT);await submit(page);await today(page);
  await expect(card.locator('.capability-benefit')).toHaveText('Isso ajuda a: '+BENEFIT);
  await editFromToday(page);await page.locator('#learningOutcomeBenefit').fill('  ');await submit(page);await today(page);
  await expect(card.locator('.capability-benefit')).toHaveCount(0);
  expect(await page.evaluate(()=>'benefit' in state.data.learningOutcomes[0])).toBe(false);
});

test('projeção não usa benefício atual em referência histórica, arquivada, ausente ou concluída',async({page})=>{
  await open(page);await create(page,BENEFIT);await today(page);
  const initial=await page.evaluate(()=>structuredClone(state.data));
  for(const mode of ['archived','stale','missing','completed','common']){
    await page.evaluate(({initial,mode})=>{
      state.data=structuredClone(initial);
      const outcome=state.data.learningOutcomes[0],plan=state.data.dailyPlans.find(p=>p.items.some(item=>item.capabilityRef?.outcomeId===outcome.id));
      if(mode==='archived')outcome.status='archived';
      if(mode==='stale')outcome.nextAttempt.id='a-new-attempt';
      if(mode==='missing')state.data.learningOutcomes=[];
      if(mode==='completed')plan.items.forEach(item=>item.completedAt=new Date().toISOString());
      if(mode==='common')plan.items=[{id:'manual',type:'custom',text:'Organizar material',completedAt:null}];
      renderAll();
    },{initial,mode});
    await expect(page.locator('#todayView .capability-benefit:visible')).toHaveCount(0);
  }
});

test('início direto conserva benefício apenas na Capability e sem novos snapshots',async({page})=>{
  await open(page);const base=await create(page,BENEFIT);await today(page);
  await page.locator('[data-today-primary-start]').click();
  await expect.poll(()=>page.evaluate(()=>state.data.sessions.length)).toBe(1);
  const stored=await page.evaluate(()=>({outcome:state.data.learningOutcomes[0],session:state.data.sessions[0],execution:state.data.executionSessions[0],plan:state.data.dailyPlans}));
  expect(stored.outcome.benefit).toBe(BENEFIT);expect(stored.outcome.nextAttempt).toEqual(base.nextAttempt);
  expect(stored.session.learningContext.attemptText).toBe(base.nextAttempt.text);
  expect(stored.session.learningContext.futureUse).toBe('solve');
  expect(JSON.stringify([stored.session,stored.execution,stored.plan])).not.toContain(BENEFIT);
  await expect(page.locator('#todayView .capability-benefit:visible')).toHaveCount(0);
});

test('limite conserva rascunho, abre campo e não grava conteúdo parcial',async({page})=>{
  await open(page);const base=await create(page,BENEFIT);
  await page.locator('[data-outcome-edit]').first().click();
  await expect(page.locator('#learningOutcomeBenefit')).toHaveAttribute('maxlength','240');
  await page.locator('#learningOutcomeBenefit').evaluate(field=>field.value='x'.repeat(241));
  await page.locator('#outcomeBenefitPanel > summary').click();
  await page.locator('#learningOutcomeForm').evaluate(form=>form.requestSubmit());
  await expect(page.locator('#learningOutcomeError')).toContainText('até 240 caracteres');
  await expect(page.locator('#learningOutcomeBenefit')).toBeFocused();
  await expect(page.locator('#learningOutcomeBenefit')).toHaveAttribute('aria-invalid','true');
  await expect(page.locator('#learningOutcomeBenefit')).toHaveValue('x'.repeat(241));
  expect(await page.evaluate(()=>state.data.learningOutcomes[0])).toEqual(base);
  await page.locator('#learningOutcomeBenefit').fill('x'.repeat(240));await submit(page);
  expect(await page.evaluate(()=>state.data.learningOutcomes[0].benefit.length)).toBe(240);
});

test('Escape detecta benefício alterado; falha conserva rascunho e retry único',async({page})=>{
  await open(page);const base=await create(page,BENEFIT);
  const trigger=page.locator('[data-outcome-edit]').first();await trigger.click();
  await page.locator('#learningOutcomeBenefit').fill('Rascunho descartável');
  page.once('dialog',dialog=>dialog.accept());await page.keyboard.press('Escape');
  await expect(page.locator('#learningOutcomeDialog')).toBeHidden();await expect(trigger).toBeFocused();
  expect(await page.evaluate(()=>state.data.learningOutcomes[0])).toEqual(base);
  await trigger.click();await expect(page.locator('#learningOutcomeBenefit')).toHaveValue(BENEFIT);
  await page.locator('#learningOutcomeBenefit').fill('Decidir com mais autonomia');
  await page.evaluate(()=>{
    window.__benefitStorage=CompassoStorage;
    window.CompassoStorage=Object.freeze({...CompassoStorage,save:async()=>false});
  });
  await page.locator('#learningOutcomeForm').evaluate(form=>form.requestSubmit());
  await expect(page.locator('#learningOutcomeError')).toContainText('Não foi possível salvar');
  await expect(page.locator('#learningOutcomeBenefit')).toHaveValue('Decidir com mais autonomia');
  expect(await page.evaluate(()=>state.data.learningOutcomes[0])).toEqual(base);
  expect(await page.evaluate(async()=>(await window.__benefitStorage.load('compasso.app.v1')).learningOutcomes[0])).toEqual(base);
  await page.evaluate(()=>window.CompassoStorage=window.__benefitStorage);await submit(page);
  expect(await page.evaluate(()=>state.data.learningOutcomes.length)).toBe(1);
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('.learning-outcome-card .capability-benefit')).toContainText('Decidir com mais autonomia');
});

test('backup antigo migra sem inferir e novo faz round-trip, preservando texto importado longo',async({page})=>{
  await open(page);const base=await create(page,BENEFIT);
  await page.locator('#settingsBtn').click();page.once('dialog',dialog=>dialog.accept());
  const downloaded=page.waitForEvent('download');await page.locator('#exportBtn').click();
  const backup=JSON.parse(await fs.readFile(await (await downloaded).path(),'utf8'));
  expect(backup.learningOutcomes[0]).toEqual(base);
  await restore(page,backup);await page.reload({waitUntil:'domcontentloaded'});
  expect(await page.evaluate(()=>state.data.learningOutcomes[0])).toEqual(base);
  const legacy=structuredClone(backup);delete legacy.learningOutcomes[0].benefit;delete legacy.learningOutcomes[0].schemaVersion;
  legacy.untouched={keep:true};await restore(page,legacy);
  const migrated=await page.evaluate(()=>structuredClone(state.data));
  expect(migrated.learningOutcomes[0].schemaVersion).toBe(1);expect('benefit' in migrated.learningOutcomes[0]).toBe(false);
  expect(migrated.learningOutcomes[0].nextAttempt).toEqual(base.nextAttempt);expect(migrated.untouched).toEqual({keep:true});
  for(const key of ['notes','reading','study','goal'])expect(migrated[key]).toEqual(backup[key]);
  const longBackup=structuredClone(backup);longBackup.learningOutcomes[0].benefit='y'.repeat(260);
  await restore(page,longBackup);await page.reload({waitUntil:'domcontentloaded'});
  expect(await page.evaluate(()=>state.data.learningOutcomes[0].benefit)).toBe('y'.repeat(260));
  await page.locator('[data-outcome-edit]').first().click();
  await expect(page.locator('#learningOutcomeBenefit')).toHaveValue('y'.repeat(260));
});

for(const fallback of [false,true]){
  test(`benefício edita e reabre offline em ${fallback?'fallback localStorage':'IndexedDB'}`,async({page,context})=>{
    await open(page,{fallback});await create(page,BENEFIT);await today(page);
    await page.evaluate(()=>navigator.serviceWorker.ready);
    await expect.poll(()=>page.evaluate(()=>Boolean(navigator.serviceWorker.controller))).toBe(true);
    await context.setOffline(true);await page.reload({waitUntil:'domcontentloaded'});
    await expect(page.locator('#todayPrimaryAction .capability-benefit')).toContainText(BENEFIT);
    await editFromToday(page);await page.locator('#learningOutcomeBenefit').fill('Resolver incidentes sem ajuda');await submit(page);await today(page);
    await page.reload({waitUntil:'domcontentloaded'});
    await expect(page.locator('#todayPrimaryAction .capability-benefit')).toContainText('Resolver incidentes sem ajuda');
    expect(await page.evaluate(()=>CompassoAppManifest.cacheName)).toBe(require('../../app-manifest.js').cacheName);
    if(fallback)expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('compasso.app.v1')).learningOutcomes[0].benefit)).toBe('Resolver incidentes sem ajuda');
  });
}

test('teclado, disclosure, frase longa e zoom permanecem legíveis em mobile',async({page},testInfo)=>{
  await open(page);await page.locator('[data-outcome-new]').first().click();
  const summary=page.locator('#outcomeBenefitPanel > summary'),field=page.locator('#learningOutcomeBenefit');
  await expect(page.locator('#learningOutcomeCapability')).toBeFocused();
  await summary.focus();await page.keyboard.press('Enter');await page.keyboard.press('Tab');
  await expect(field).toBeFocused();await expect(field).toHaveAccessibleName('O que conseguir fazer isso destrava?');
  expect(await summary.evaluate(el=>el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
  await field.fill(BENEFIT);await page.locator('#learningOutcomeCapability').fill('Diagnosticar gargalos em Spark');
  await page.locator('#learningOutcomeAttempt').fill('Analisar dois query plans');
  await fs.mkdir('test-results',{recursive:true});
  await field.scrollIntoViewIfNeeded();await field.focus();
  expect(await contrast(field,'outlineColor')).toBeGreaterThanOrEqual(3);
  for(const label of ['#outcomeBenefitPanel > summary','#outcomeBenefitPanel > label','#learningOutcomeBenefitHint']){
    expect(await contrast(page.locator(label))).toBeGreaterThanOrEqual(4.5);
  }
  await page.screenshot({path:`test-results/capability-benefit-editor-${testInfo.project.name}.png`});
  await submit(page);await today(page);
  expect(await contrast(page.locator('#todayPrimaryAction .capability-benefit'))).toBeGreaterThanOrEqual(4.5);
  await page.screenshot({path:`test-results/capability-benefit-today-${testInfo.project.name}.png`});
  await editFromToday(page);await field.fill('z'.repeat(240));await submit(page);await today(page);
  for(const width of [360,390]){
    await page.setViewportSize({width,height:800});
    await page.evaluate(()=>document.body.style.zoom='2');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
    await expect(page.locator('#todayPrimaryAction .capability-benefit')).toContainText('z'.repeat(240));
    await editFromToday(page);await expect(field).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
    await page.keyboard.press('Escape');await today(page);
    await page.evaluate(()=>document.body.style.zoom='1');
  }
});
