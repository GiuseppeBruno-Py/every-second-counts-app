const {test,expect}=require('@playwright/test');
const fs=require('node:fs');

async function open(page){
  await page.route(/^https?:\/(?!\/127\.0\.0\.1)/,route=>route.abort());
  await page.addInitScript(()=>localStorage.setItem('compasso.ux.mode.v1','essential'));
  await page.addInitScript(()=>{globalThis.CompassoDriveSync||={prepareLocalState(input){return{data:structuredClone(input),baseline:new Map()}},activateLocalState(){}}});
  await page.goto('/?view=capabilities',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>globalThis.CompassoFeatures?.installed&&globalThis.CompassoBehavioralExperimentModel);
  await expect(page.locator('#behavioralExperimentSection')).toBeVisible();
}
async function capability(page){
  await page.locator('[data-outcome-new]').first().click();
  await page.locator('#learningOutcomeCapability').fill('Apresentar arquitetura técnica');
  await page.locator('#learningOutcomeAttempt').fill('Explicar o desenho em voz alta');
  await page.locator('#learningOutcomeForm [type="submit"]').click();
  await expect(page.locator('#learningOutcomeDialog')).toBeHidden();
  return page.evaluate(()=>structuredClone(state.data.learningOutcomes[0]));
}
async function fillPlan(page){
  const dialog=page.locator('#behavioralExperimentDialog');
  await dialog.locator('[name="hypothesis"]').fill('Ensaiar antes reduz perda de raciocínio');
  await dialog.locator('[name="practice"]').fill('Ensaiar cinco minutos antes de apresentar');
  await dialog.locator('[name="expectedOutcome"]').fill('Menos interrupções na explicação');
  await dialog.locator('[name="evidencePlan"]').fill('Anotar quantas vezes perdi a sequência');
  await dialog.locator('[name="startDate"]').fill('2026-09-23');
  await dialog.locator('[name="preset"]').selectOption('21');
  await expect(dialog.locator('[name="reviewDate"]')).toHaveValue('2026-10-14');
}
test('cria, edita, revisa e exclui experimento sem alterar Capability',async({page})=>{
  await open(page);const original=await capability(page);
  await page.locator('[data-experiment-new]').click();
  const dialog=page.locator('#behavioralExperimentDialog');
  await expect(dialog).toBeVisible();
  await fillPlan(page);
  await dialog.locator('[type="submit"]').click();
  await expect(dialog).toBeHidden();
  let saved=await page.evaluate(()=>structuredClone(state.data.behavioralExperiments[0]));
  expect(saved.capabilityRef.outcomeId).toBe(original.id);expect(saved.capabilityRef.attemptId).toBe(original.nextAttempt.id);
  expect(saved.schemaVersion).toBe(1);expect(saved.decision).toBeNull();
  expect(await page.evaluate(()=>state.data.learningOutcomes[0])).toEqual(original);
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('[data-experiment-card]')).toContainText('Ensaiar antes reduz perda');
  await page.locator('[data-experiment-edit]').click();
  await dialog.locator('[name="practice"]').fill('Ensaiar duas vezes');
  await dialog.locator('[type="submit"]').click();
  await expect(dialog).toBeHidden();
  expect(await page.evaluate(()=>state.data.behavioralExperiments[0].id)).toBe(saved.id);
  await page.locator('[data-experiment-review]').click();
  await expect(dialog.locator('[name="resultNote"]')).toBeVisible();
  await dialog.locator('[name="resultNote"]').fill('Perdi a sequência apenas uma vez');
  await dialog.locator('[name="decision"]').selectOption('adjust');
  await dialog.locator('[type="submit"]').click();
  await expect(dialog).toBeHidden();
  await expect(page.locator('[data-experiment-card]')).toContainText('Revisado · Ajustar');
  expect(await page.evaluate(()=>state.data.learningOutcomes[0])).toEqual(original);
  page.once('dialog',confirm=>confirm.accept());
  await page.locator('[data-experiment-delete]').click();
  await expect(page.locator('[data-experiment-card]')).toHaveCount(0);
  expect(await page.evaluate(id=>state.data._sync.tombstones[`behavioralExperiments:${id}`],saved.id)).toBeTruthy();
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('[data-experiment-card]')).toHaveCount(0);
});

test('cancelar, Escape, validação e falha de save não promovem rascunho',async({page})=>{
  await open(page);await capability(page);
  await page.locator('[data-experiment-new]').click();
  const dialog=page.locator('#behavioralExperimentDialog');
  await dialog.locator('[name="hypothesis"]').fill('Rascunho');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  expect(await page.evaluate(()=>state.data.behavioralExperiments.length)).toBe(0);
  await page.locator('[data-experiment-new]').click();
  await dialog.locator('[type="submit"]').click();
  await expect(page.locator('#behavioralExperimentError')).toContainText('hipótese');
  await fillPlan(page);
  await page.evaluate(()=>{window.__experimentStorage=window.CompassoStorage;window.CompassoStorage={...window.CompassoStorage,save:async()=>false}});
  await dialog.locator('[type="submit"]').click();
  await expect(page.locator('#behavioralExperimentError')).toContainText('Não foi possível salvar');
  await expect(dialog.locator('[name="hypothesis"]')).toHaveValue('Ensaiar antes reduz perda de raciocínio');
  expect(await page.evaluate(()=>state.data.behavioralExperiments.length)).toBe(0);
  await page.evaluate(()=>{window.CompassoStorage=window.__experimentStorage});
  await dialog.locator('[type="submit"]').click();
  await expect(dialog).toBeHidden();
  expect(await page.evaluate(()=>state.data.behavioralExperiments.length)).toBe(1);
});

test('diálogo mantém labels, foco, Escape e rolagem no mobile',async({page},testInfo)=>{
  await open(page);await capability(page);
  if(testInfo.project.name==='chromium')await page.setViewportSize({width:360,height:640});
  await page.locator('[data-experiment-new]').click();
  const dialog=page.locator('#behavioralExperimentDialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[name="hypothesis"]')).toHaveAccessibleName(/Hipótese/);
  await expect(dialog.locator('[name="evidencePlan"]')).toHaveAccessibleName(/Evidência/);
  await expect(dialog.locator('[name="reviewDate"]')).toHaveAccessibleName(/Revisar em/);
  const bounds=await dialog.evaluate(element=>({scrollHeight:element.scrollHeight,clientHeight:element.clientHeight,width:element.getBoundingClientRect().width,viewport:innerWidth}));
  expect(bounds.width).toBeLessThanOrEqual(bounds.viewport);
  expect(bounds.scrollHeight).toBeGreaterThan(bounds.clientHeight);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page.locator('[data-experiment-new]')).toBeFocused();
});

test('backup JSON atual restaura experimento e backup legado permanece válido',async({page})=>{
  await open(page);await capability(page);
  await page.locator('[data-experiment-new]').click();await fillPlan(page);
  await page.locator('#behavioralExperimentForm [type="submit"]').click();
  await expect(page.locator('[data-experiment-card]')).toHaveCount(1);
  page.once('dialog',dialog=>dialog.accept());
  const [download]=await Promise.all([page.waitForEvent('download'),page.evaluate(()=>document.getElementById('exportBtn').click())]);
  const exported=JSON.parse(fs.readFileSync(await download.path(),'utf8'));
  expect(exported.behavioralExperiments).toHaveLength(1);
  page.once('dialog',dialog=>dialog.accept());
  await page.evaluate(()=>document.getElementById('resetBtn').click());
  await expect(page.locator('[data-experiment-card]')).toHaveCount(0);
  await page.evaluate(()=>CompassoStorage.flush('compasso.app.v1'));
  await page.locator('#importInput').setInputFiles({name:'experiments.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});
  await page.locator('#restoreConfirmBtn').click();
  await expect(page.locator('#restoreDialog')).toBeHidden();
  await expect(page.locator('[data-experiment-card]')).toHaveCount(1);
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('[data-experiment-card]')).toContainText('Ensaiar antes reduz');
  const legacy={...exported};delete legacy.behavioralExperiments;
  await page.locator('#importInput').setInputFiles({name:'legacy.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(legacy))});
  await page.locator('#restoreConfirmBtn').click();
  await expect(page.locator('#restoreDialog')).toBeHidden();
  await expect(page.locator('[data-experiment-card]')).toHaveCount(0);
  expect(await page.evaluate(()=>state.data.behavioralExperiments)).toEqual([]);
});

test('experimento salva sem rede e recupera no fallback localStorage',async({page,context})=>{
  await page.addInitScript(()=>Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined}));
  await open(page);await capability(page);
  await context.setOffline(true);
  await page.locator('[data-experiment-new]').click();await fillPlan(page);
  await page.locator('#behavioralExperimentForm [type="submit"]').click();
  await expect(page.locator('[data-experiment-card]')).toHaveCount(1);
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('compasso.app.v1')).behavioralExperiments.length)).toBe(1);
  await context.setOffline(false);
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('[data-experiment-card]')).toContainText('Ensaiar antes reduz');
});

test('histórico permanece revisável após arquivar e excluir a capacidade',async({page})=>{
  await open(page);await capability(page);
  await page.locator('[data-experiment-new]').click();await fillPlan(page);
  await page.locator('#behavioralExperimentForm [type="submit"]').click();
  await page.locator('[data-outcome-status]').first().click();
  await expect(page.locator('[data-experiment-card]')).toHaveCount(1);
  await expect(page.locator('[data-experiment-new]')).toBeDisabled();
  await page.locator('[data-outcome-mode="archived"]').click();
  await page.locator('[data-outcome-edit]').first().click();
  page.once('dialog',dialog=>dialog.accept());
  await page.locator('[data-outcome-delete]').click();
  await expect(page.locator('[data-experiment-card]')).toContainText('Capacidade removida');
  await page.locator('[data-experiment-review]').click();
  await page.locator('#behavioralExperimentResult').fill('A apresentação foi concluída sem interrupção');
  await page.locator('#behavioralExperimentDecision').selectOption('keep');
  await page.locator('#behavioralExperimentForm [type="submit"]').click();
  await expect(page.locator('[data-experiment-card]')).toContainText('Revisado · Manter');
});
