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
async function create(page,text='Estudar Spark'){
  await page.locator('[data-outcome-new]').first().click();
  await page.locator('#learningOutcomeCapability').fill('Diagnosticar gargalos em Spark');
  await page.locator('#learningOutcomeAttempt').fill(text);
  await page.locator('#learningOutcomeForm [type="submit"]').click();
  await expect(page.locator('#learningOutcomeDialog')).toBeHidden();
  return page.evaluate(()=>structuredClone(state.data.learningOutcomes[0]));
}
async function easier(page,start='ler 5 páginas',cue='tomar café da manhã'){
  const panel=page.locator('#outcomeExecutablePanel');
  await panel.locator('summary').click();
  await page.locator('#outcomeSmallStart').fill(start);
  await page.locator('#outcomeStartCue').fill(cue);
  await page.locator('[data-outcome-executable-apply]').click();
}

test('ajuda opcional edita a tentativa existente e segue Hoje, Session e refresh',async({page})=>{
  await open(page);const before=await create(page);
  expect(before.nextAttempt.text).toBe('Estudar Spark');
  expect(Object.keys(before.nextAttempt).sort()).toEqual(['createdAt','id','text','updatedAt']);
  await page.locator('[data-outcome-edit]').first().click();
  await expect(page.locator('#outcomeExecutablePanel')).not.toHaveAttribute('open','');
  await easier(page);
  const sentence='Depois de tomar café da manhã, vou ler 5 páginas.';
  await expect(page.locator('#learningOutcomeAttempt')).toHaveValue(sentence);
  expect(await page.evaluate(()=>state.data.learningOutcomes[0].nextAttempt.text)).toBe('Estudar Spark');
  await page.locator('#learningOutcomeForm [type="submit"]').click();
  await expect(page.locator('#learningOutcomeDialog')).toBeHidden();
  expect(await page.evaluate(()=>state.data.learningOutcomes[0].nextAttempt.id)).toBe(before.nextAttempt.id);
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('[data-outcome-card]')).toContainText(sentence);
  await page.locator('[data-outcome-today]').first().click();
  await expect(page.locator('#todayPrimaryHeading')).toHaveText(sentence);
  await page.locator('[data-today-primary-start]').click();
  await expect.poll(()=>page.evaluate(()=>state.data.sessions[0]?.learningContext?.attemptText)).toBe(sentence);
  expect(await page.evaluate(()=>state.data.learningOutcomes[0].nextAttempt.id)).toBe(before.nextAttempt.id);
});

test('criação com começo sem gatilho, reaplicação e texto final livre',async({page})=>{
  await open(page);
  await page.locator('[data-outcome-new]').first().click();
  await page.locator('#learningOutcomeCapability').fill('Escrever um relatório técnico');
  await easier(page,'escrever o primeiro parágrafo.','');
  await expect(page.locator('#learningOutcomeAttempt')).toHaveValue('escrever o primeiro parágrafo.');
  await page.locator('[data-outcome-executable-apply]').click();
  await expect(page.locator('#learningOutcomeAttempt')).toHaveValue('escrever o primeiro parágrafo.');
  await page.locator('#learningOutcomeAttempt').fill('Escrever um parágrafo sobre o problema observado.');
  await page.locator('#learningOutcomeForm [type="submit"]').click();
  await expect(page.locator('#learningOutcomeDialog')).toBeHidden();
  expect(await page.evaluate(()=>state.data.learningOutcomes[0].nextAttempt.text)).toBe('Escrever um parágrafo sobre o problema observado.');
});

test('valida começo ausente, campos não aplicados e limite sem escrita',async({page})=>{
  await open(page);const before=await create(page);
  await page.locator('[data-outcome-edit]').first().click();
  await page.locator('#outcomeExecutablePanel summary').click();
  await page.locator('[data-outcome-executable-apply]').click();
  await expect(page.locator('#learningOutcomeError')).toContainText('menor começo');
  await expect(page.locator('#outcomeSmallStart')).toBeFocused();
  await page.locator('#outcomeSmallStart').fill('ler 5 páginas');
  await page.locator('#learningOutcomeForm [type="submit"]').click();
  await expect(page.locator('#learningOutcomeError')).toContainText('limpe os campos auxiliares');
  expect(await page.evaluate(()=>state.data.learningOutcomes[0])).toEqual(before);
  await page.locator('#outcomeStartCue').fill('tomar café da manhã');
  await page.locator('[data-outcome-executable-apply]').click();
  await page.locator('#outcomeStartCue').fill('abrir o livro');
  await page.locator('#learningOutcomeForm [type="submit"]').click();
  await expect(page.locator('#learningOutcomeError')).toContainText('limpe os campos auxiliares');
  expect(await page.evaluate(()=>state.data.learningOutcomes[0])).toEqual(before);
  await page.locator('#outcomeSmallStart').fill('');
  await page.locator('#outcomeStartCue').fill('');
  await page.locator('#learningOutcomeForm [type="submit"]').click();
  await expect(page.locator('#learningOutcomeDialog')).toBeHidden();
  const saved=await page.evaluate(()=>state.data.learningOutcomes[0]);
  expect(saved.nextAttempt.text).toBe('Depois de tomar café da manhã, vou ler 5 páginas.');
});

test('ajuda e simulação coexistem nas duas ordens sem duplicar sufixo',async({page})=>{
  await open(page);await create(page);
  await page.locator('[data-outcome-edit]').first().click();
  await page.locator('#outcomePressurePanel summary').click();
  await page.locator('#outcomePressureCondition').fill('com duas perguntas');
  await page.locator('[data-outcome-pressure-apply]').click();
  await easier(page,'analisar 1 query plan','abrir o notebook');
  const combined='Depois de abrir o notebook, vou analisar 1 query plan.\nCondição de simulação: com duas perguntas';
  await expect(page.locator('#learningOutcomeAttempt')).toHaveValue(combined);
  await page.locator('[data-outcome-executable-apply]').click();
  await expect(page.locator('#learningOutcomeAttempt')).toHaveValue(combined);
  await page.locator('#learningOutcomeForm [type="submit"]').click();
  await expect(page.locator('#learningOutcomeDialog')).toBeHidden();
  await page.locator('[data-outcome-edit]').first().click();
  await easier(page,'revisar 1 slide','abrir a apresentação');
  await page.locator('#outcomePressurePanel summary').click();
  await page.locator('#outcomePressureCondition').fill('em cinco minutos');
  await page.locator('[data-outcome-pressure-apply]').click();
  await expect(page.locator('#learningOutcomeAttempt')).toHaveValue('Depois de abrir a apresentação, vou revisar 1 slide.\nCondição de simulação: em cinco minutos');
  await page.locator('#learningOutcomeForm [type="submit"]').click();
  await expect(page.locator('#learningOutcomeDialog')).toBeHidden();
});

test('cancelamento, Escape e falha de persistência conservam o último estado',async({page})=>{
  await open(page);const before=await create(page);
  await page.locator('[data-outcome-edit]').first().click();
  await easier(page);
  page.once('dialog',dialog=>dialog.accept());
  await page.keyboard.press('Escape');
  await expect(page.locator('#learningOutcomeDialog')).toBeHidden();
  await expect(page.locator('[data-outcome-edit]').first()).toBeFocused();
  expect(await page.evaluate(()=>state.data.learningOutcomes[0])).toEqual(before);
  await page.locator('[data-outcome-edit]').first().click();
  await easier(page);
  await page.evaluate(()=>{window.__easyStorage=window.CompassoStorage;window.CompassoStorage={...window.CompassoStorage,save:async()=>false}});
  await page.locator('#learningOutcomeForm [type="submit"]').click();
  await expect(page.locator('#learningOutcomeError')).toContainText('Não foi possível salvar');
  await expect(page.locator('#learningOutcomeAttempt')).toHaveValue(/Depois de tomar café/);
  expect(await page.evaluate(()=>state.data.learningOutcomes[0])).toEqual(before);
  await page.evaluate(()=>{window.CompassoStorage=window.__easyStorage});
  await page.locator('#learningOutcomeForm [type="submit"]').click();
  await expect(page.locator('#learningOutcomeDialog')).toBeHidden();
  await page.locator('[data-outcome-edit]').first().click();
  await easier(page,'revisar 1 página','abrir o livro');
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('[data-outcome-card]')).toContainText('Depois de tomar café');
});

test('backup JSON e fallback localStorage carregam texto antigo e novo offline',async({page,context})=>{
  await page.addInitScript(()=>Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined}));
  await open(page);await create(page);
  await context.setOffline(true);
  await page.locator('[data-outcome-edit]').first().click();
  await easier(page,'resolver 1 exercício','abrir o caderno');
  await page.locator('#learningOutcomeForm [type="submit"]').click();
  await expect(page.locator('#learningOutcomeDialog')).toBeHidden();
  const sentence='Depois de abrir o caderno, vou resolver 1 exercício.';
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('compasso.app.v1')).learningOutcomes[0].nextAttempt.text)).toBe(sentence);
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('[data-outcome-card]')).toContainText(sentence);
  await context.setOffline(false);
  page.once('dialog',dialog=>dialog.accept());
  const [download]=await Promise.all([page.waitForEvent('download'),page.evaluate(()=>document.getElementById('exportBtn').click())]);
  const backup=JSON.parse(fs.readFileSync(await download.path(),'utf8'));
  expect(backup.learningOutcomes[0].nextAttempt.text).toBe(sentence);
  expect(Object.keys(backup.learningOutcomes[0].nextAttempt).sort()).toEqual(['createdAt','id','text','updatedAt']);
  const legacy=structuredClone(backup);legacy.learningOutcomes[0].nextAttempt.text='Estudar Spark';
  await page.locator('#importInput').setInputFiles({name:'legacy.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(legacy))});
  await page.locator('#restoreConfirmBtn').click();
  await expect(page.locator('#restoreDialog')).toBeHidden();
  await expect(page.locator('[data-outcome-card]')).toContainText('Estudar Spark');
});

test('mobile, teclado, zoom e Capability arquivada preservam acesso e foco',async({page},testInfo)=>{
  await open(page);await create(page);
  if(testInfo.project.name==='chromium')await page.setViewportSize({width:360,height:640});
  await page.locator('[data-outcome-edit]').first().focus();
  await page.keyboard.press('Enter');
  await page.locator('#outcomeExecutablePanel summary').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#outcomeExecutablePanel')).toHaveAttribute('open','');
  await expect(page.locator('#outcomeSmallStart')).toHaveAccessibleName(/menor começo/);
  await expect(page.locator('#outcomeStartCue')).toHaveAccessibleName(/Depois de qual evento/);
  const size=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth,button:document.querySelector('[data-outcome-executable-apply]').getBoundingClientRect().height}));
  expect(size.width).toBeLessThanOrEqual(size.viewport+1);
  expect(size.button).toBeGreaterThanOrEqual(44);
  await page.evaluate(()=>{document.documentElement.style.zoom='2'});
  const zoom=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}));
  expect(zoom.width).toBeLessThanOrEqual(zoom.viewport+1);
  await page.evaluate(()=>{document.documentElement.style.zoom=''});
  await page.keyboard.press('Escape');
  await expect(page.locator('#learningOutcomeDialog')).toBeHidden();
  await page.locator('[data-outcome-status]').first().click();
  await page.locator('[data-outcome-mode="archived"]').click();
  await page.locator('[data-outcome-edit]').first().click();
  await expect(page.locator('#outcomeExecutablePanel')).toBeHidden();
});
