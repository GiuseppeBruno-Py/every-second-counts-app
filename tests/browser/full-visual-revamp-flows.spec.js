const {test, expect} = require('@playwright/test');
const fs = require('node:fs');
const baseline = process.env.COMPASSO_VISUAL_BASELINE === '1';
const routes = ['today','fronts','capabilities','reading','study','goal','journal','review','weekly','outcomes','analytics','recall','weakness','notes','dictionary','context'];
async function open(page) {
  await page.route(/^https?:\/(?!\/127\.0\.0\.1)/, route => route.abort());
  await page.addInitScript(() => {
    localStorage.setItem('compasso.ux.mode.v1', 'advanced');
    globalThis.CompassoDriveSync ||= {prepareLocalState(input){return {data:structuredClone(input),baseline:new Map()};},activateLocalState(){}};
  });
  await page.goto('http://127.0.0.1:4174/?view=today');
  await page.waitForFunction(() => globalThis.CompassoFeatures?.installed && globalThis.CompassoDesignSystem);
}
async function audit(page, root) {
  return page.locator(root).evaluate(element => {
    const failures=[];
    const vw=document.documentElement.clientWidth;
    for(const node of element.querySelectorAll('button,input,textarea,select,label,p,small,h1,h2,h3,summary')) {
      if(!node.checkVisibility() || node.closest('[hidden]') || node.matches('input[type=hidden]'))continue;
      const r=node.getBoundingClientRect(),s=getComputedStyle(node);
      const id=node.id || node.className || node.tagName;
      if(parseFloat(s.fontSize)<13.9) failures.push(`${id}: font ${s.fontSize}`);
      if(node.matches('input:not([type=checkbox]):not([type=radio]):not([type=range]),textarea,select') && parseFloat(s.fontSize)<15.9) failures.push(`${id}: editable ${s.fontSize}`);
      if(node.matches('button') && (r.width<43.9 || r.height<43.9)) failures.push(`${id}: target ${Math.round(r.width)}x${Math.round(r.height)}`);
      if(r.width && (r.left < -1 || r.right > vw+1) && !node.closest('.markdown-preview pre,.graph-viewport'))failures.push(`${id}: bounds ${Math.round(r.left)}..${Math.round(r.right)}`);
    }
    for (const node of element.querySelectorAll('div,span,time')) {
      if (!node.checkVisibility() || node.closest('[hidden]') || ![...node.childNodes].some(n=>n.nodeType===3 && n.textContent.trim())) continue;
      if (parseFloat(getComputedStyle(node).fontSize)<13.9) failures.push(`${node.id||node.className}: direct text ${getComputedStyle(node).fontSize}`);
    }
    const rgb = value => (value.match(/[\d.]+/g)||[]).map(Number);
    const luminance = color => rgb(color).slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
    for(const node of element.querySelectorAll('[class$="-hero"] :is(h2,p),.weak-stats span,.recall-hero-stats span,dialog label,dialog small,dialog h2,dialog p')) {
      if(!node.checkVisibility()) continue;
      let parent=node,bg='rgb(255,255,255)';
      while(parent){const color=getComputedStyle(parent).backgroundColor;if(rgb(color).length===3 || rgb(color)[3]===1){bg=color;break;} parent=parent.parentElement;}
      const a=luminance(getComputedStyle(node).color),b=luminance(bg);
      if((Math.max(a,b)+.05)/(Math.min(a,b)+.05)<4.5) failures.push(`${node.id||node.className||node.tagName}: text contrast`);
    }
    if(document.documentElement.scrollWidth>vw+1) failures.push('document overflow');
    return [...new Set(failures)];
  });
}
test('all routed families have readable notebook layouts', async ({page}, info) => {
  test.setTimeout(180000);
  test.skip(info.project.name !== 'chromium', 'fixed viewport matrix includes mobile widths');
  await open(page);
  const results={};
  for(const route of routes){
    await page.evaluate(route => CompassoInformationArchitecture.open(route),route);
    await expect(page.locator(`#${route}View`)).toBeVisible();
    for(const width of [360,390,768,1280]){
      await page.setViewportSize({width,height:900});
      results[`${route}-${width}`]=await audit(page,`#${route}View`);
    }
    await page.screenshot({path:info.outputPath(`${route}.png`),fullPage:true});
  }
  fs.writeFileSync(info.outputPath('route-audit.json'),JSON.stringify(results,null,2));
  if(!baseline)expect(Object.fromEntries(Object.entries(results).filter(([,v])=>v.length))).toEqual({});
});

test('Today composes desktop work and context into bounded semantic modules', async ({page}, info) => {
  test.setTimeout(90000);
  test.skip(info.project.name !== 'chromium', 'fixed responsive matrix runs once');
  await open(page);

  for (const width of [1280, 1600]) {
    await page.setViewportSize({width, height: 1000});
    const layout = await page.locator('#todayView').evaluate(root => {
      const rect = selector => {
        const value = root.querySelector(selector).getBoundingClientRect();
        return {left:value.left, right:value.right, top:value.top, bottom:value.bottom, width:value.width};
      };
      const moduleStyle = [...root.querySelectorAll(':scope .today-primary, :scope .today-panel, :scope .today-hero')]
        .filter(node => node.checkVisibility())
        .map(node => {
          const style = getComputedStyle(node);
          return {background:style.backgroundColor, border:style.borderTopStyle, radius:parseFloat(style.borderTopLeftRadius)};
        });
      return {
        primary:rect('#todayPrimaryAction'),
        plan:rect('#todayRemainingPlan'),
        intention:rect('#journalTodayPanel'),
        focus:rect('#todaySecondaryContext > .today-grid:first-child > .today-panel'),
        suggestions:rect('#todaySecondaryContext > .today-grid:last-child > .today-panel:first-child'),
        decisions:rect('#todaySecondaryContext > .today-grid:last-child > .today-panel:last-child'),
        moduleStyle,
        overflow:document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    });
    expect(layout.primary.right).toBeLessThanOrEqual(layout.intention.left + 1);
    expect(layout.primary.width).toBeGreaterThan(layout.intention.width * 1.65);
    expect(Math.abs(layout.primary.left - layout.plan.left)).toBeLessThanOrEqual(1);
    expect(Math.abs(layout.primary.width - layout.plan.width)).toBeLessThanOrEqual(1);
    expect(layout.intention.top).toBeLessThanOrEqual(layout.primary.top + 1);
    expect(Math.abs(layout.intention.bottom - layout.primary.bottom)).toBeLessThanOrEqual(1);
    expect(layout.plan.right).toBeLessThanOrEqual(layout.focus.left + 1);
    expect(Math.abs(layout.focus.top - layout.plan.top)).toBeLessThanOrEqual(1);
    expect(layout.suggestions.right).toBeLessThanOrEqual(layout.decisions.left + 1);
    expect(Math.abs(layout.suggestions.top - layout.decisions.top)).toBeLessThanOrEqual(1);
    expect(layout.suggestions.width).toBeGreaterThan(layout.decisions.width * 1.65);
    expect(layout.moduleStyle.every(style => style.background !== 'rgba(0, 0, 0, 0)' && style.border === 'solid' && style.radius >= 15)).toBe(true);
    expect(layout.overflow).toBeLessThanOrEqual(1);
  }

  await page.locator('#flowRunBtn').click();
  await expect(page.locator('#flowResults .flow-result').first()).toBeVisible();
  const resultsLayout = await page.locator('#flowResults').evaluate(results => {
    const cards = [...results.children].map(node => node.getBoundingClientRect());
    return {count:cards.length, first:cards[0], second:cards[1], third:cards[2]};
  });
  expect(resultsLayout.count).toBeGreaterThanOrEqual(3);
  expect(resultsLayout.first.width).toBeGreaterThan(resultsLayout.second.width * 1.8);
  expect(Math.abs(resultsLayout.second.top - resultsLayout.third.top)).toBeLessThanOrEqual(1);
  const alternativeResult = page.locator('#flowResults .flow-result').nth(1);
  const beforeHover = await alternativeResult.evaluate(node => getComputedStyle(node).backgroundColor);
  await alternativeResult.hover();
  await expect.poll(() => alternativeResult.evaluate(node => getComputedStyle(node).backgroundColor)).not.toBe(beforeHover);
  await page.screenshot({path:info.outputPath('today-desktop-board-1600.png'), fullPage:true});

  for (const width of [1024, 390]) {
    await page.setViewportSize({width, height: 900});
    const compact = await page.locator('#todayView').evaluate(root => {
      const primary=root.querySelector('#todayPrimaryAction').getBoundingClientRect();
      const plan=root.querySelector('#todayRemainingPlan').getBoundingClientRect();
      const intention=root.querySelector('#journalTodayPanel').getBoundingClientRect();
      return {
        sameColumn:Math.abs(primary.left-plan.left)<=1 && Math.abs(primary.left-intention.left)<=1,
        ordered:primary.top < plan.top && plan.top < intention.top,
        overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
      };
    });
    expect(compact).toEqual({sameColumn:true, ordered:true, overflow:0});
    await page.screenshot({path:info.outputPath(`today-board-${width}.png`), fullPage:true});
  }
});
test('all installed dialogs retain readable scrollable controls', async ({page}, info) => {
  test.setTimeout(180000);
  test.skip(info.project.name !== 'chromium','fixed viewport dialog matrix');
  await open(page);
  const ids=await page.locator('dialog').evaluateAll(nodes=>nodes.map(n=>n.id));
  const results={};
  for(const id of ids){
    await page.locator(`#${id}`).evaluate(n=>n.showModal());
    for(const width of [360,390,768,1280]){
      await page.setViewportSize({width,height:800});
      results[`${id}-${width}`]=await audit(page,`#${id}`);
    }
    await page.screenshot({path:info.outputPath(`${id}.png`),fullPage:true});
    await page.locator(`#${id}`).evaluate(n=>n.close());
  }
  fs.writeFileSync(info.outputPath('dialog-audit.json'),JSON.stringify(results,null,2));
  if(!baseline)expect(Object.fromEntries(Object.entries(results).filter(([,v])=>v.length))).toEqual({});
});

test('notebook Notes preserves focused text selection through durable save', async ({page}) => {
  await open(page);
  await page.evaluate(() => CompassoInformationArchitecture.open('notes'));
  const editor=page.locator('#markdownInput');
  const text='# Registro de estudo\n\nComparar planos de consulta e preservar os resultados.';
  await editor.fill(text);
  await editor.evaluate(n=>{n.focus();n.setSelectionRange(3,11)});
  await expect(page.locator('#noteSaveState')).toHaveText('Salvo',{timeout:5000});
  await expect(editor).toBeFocused();
  expect(await editor.evaluate(n=>[n.selectionStart,n.selectionEnd])).toEqual([3,11]);
  await page.reload();
  await page.waitForFunction(()=>globalThis.CompassoFeatures?.installed);
  await expect(editor).toHaveValue(text);
});

test('PiP document loads shared static styling and retains return control', async ({page,context}) => {
  await open(page);
  await context.route('**/__pip_test__',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html><head></head><body></body></html>'}));
  await page.evaluate(() => {
    Object.defineProperty(window,'documentPictureInPicture',{configurable:true,value:{requestWindow:async()=>{
      const target=window.open('/__pip_test__','compasso-pip-test','width=360,height=240');
      await new Promise(resolve=>target.addEventListener('load',resolve,{once:true}));
      return target;
    }}});
  });
  await page.evaluate(()=>CompassoInformationArchitecture.open('study'));
  await page.locator('#studyGrid .ux-execute').first().click();
  await page.locator('[data-ux-run="ideal"]').click();
  await page.locator('#sessionStartForm').evaluate(form=>form.requestSubmit());
  await expect(page.locator('#sessionCompanion')).toBeVisible();
  const popupEvent=context.waitForEvent('page');
  await page.locator('#sessionCompanionFloat').click();
  const pip=await popupEvent;
  await expect(pip.locator('#pipReturn')).toBeVisible();
  await expect.poll(()=>pip.locator('#pipReturn').evaluate(n=>parseFloat(getComputedStyle(n).minHeight))).toBeGreaterThanOrEqual(44);
  expect(await pip.locator('link[rel=stylesheet]').getAttribute('href')).toBe('http://127.0.0.1:4174/design-system.css');
  await expect(pip.locator('head style')).toHaveCount(0);
  await pip.locator('#pipReturn').click();
  await expect(page.locator('#sessionCompanion')).toBeVisible();
  await pip.close();
});


test('capture inbox and validation states remain readable with long content', async ({page},info) => {
  test.setTimeout(90000);
  await open(page);
  await page.evaluate(()=>CompassoInformationArchitecture.open('notes'));
  await page.locator('[data-capture-atlas="inbox"]').click();
  await expect(page.locator('#captureInboxView')).toBeVisible();
  expect(await audit(page,'#captureInboxView')).toEqual([]);
  await page.locator('#captureGlobalBtn').click();
  await page.locator('#captureContent').fill('Analisar consultas e registrar o resultado verificável. '.repeat(12));
  await page.locator('#captureForm').evaluate(form=>form.requestSubmit());
  await page.locator('[data-capture-process]').click();
  await page.locator('[name="captureDecision"][value="evidence"]').check();
  await page.locator('[data-capture-process-next]').click();
  await page.locator('[data-capture-process-next]').click();
  await page.locator('#captureProcessConfirm').click();
  await expect(page.locator('#captureProcessError')).toContainText('Selecione');
  for(const width of [360,390,768,1280]) {
    await page.setViewportSize({width,height:480});
    expect(await audit(page,'#captureProcessDialog')).toEqual([]);
    for(const selector of ['#captureProcessConfirm','#captureProcessError']) {
      const control=page.locator(selector);
      await control.scrollIntoViewIfNeeded();
      const bounds=await control.boundingBox();
      expect(bounds.y).toBeGreaterThanOrEqual(0);
      expect(bounds.y+bounds.height).toBeLessThanOrEqual(480);
    }
  }
  await page.locator('#captureProcessDialog').screenshot({path:info.outputPath('capture-validation.png')});
  await page.keyboard.press('Escape');
  await expect(page.locator('#captureProcessDialog')).not.toBeVisible();
  for(const width of [360,390,768,1280]) {
    await page.setViewportSize({width,height:480});
    expect(await audit(page,'#captureInboxView')).toEqual([]);
  }
  await page.locator('#captureInboxView').screenshot({path:info.outputPath('capture-inbox.png')});
});


test('Deep Work running and finish states preserve readable long content',async({page},info)=>{
  test.setTimeout(90000);
  await open(page);
  await page.evaluate(()=>CompassoInformationArchitecture.open('study'));
  await page.locator('#studyGrid .ux-execute').first().click();
  await page.locator('[data-ux-run="deep"]').click();
  await page.locator('#deepOutcome').fill('Comparar planos de execução e explicar cada decisão. '.repeat(6));
  await page.locator('#deepStart').click();
  await expect(page.locator('#deepRunning')).toBeVisible();
  await page.locator('#deepDistraction').fill('Consultar a documentação depois da sessão.');
  await page.locator('#deepCapture').click();
  for(const width of [360,390,768,1280]){
    await page.setViewportSize({width,height:480});
    expect(await audit(page,'#deepDialog')).toEqual([]);
  }
  await page.locator('#deepComplete').click();
  await page.locator('#deepCompletionNote').fill('Comparei os planos e registrei a conclusão.');
  for(const width of [360,390,768,1280]){
    await page.setViewportSize({width,height:480});
    expect(await audit(page,'#deepDialog')).toEqual([]);
    await page.locator('#deepConfirmFinish').scrollIntoViewIfNeeded();
    const r=await page.locator('#deepConfirmFinish').boundingBox();
    expect(r.y).toBeGreaterThanOrEqual(0);
    expect(r.y+r.height).toBeLessThanOrEqual(480);
  }
  await page.locator('#deepDialog').screenshot({path:info.outputPath('deep-finish.png')});
  await page.locator('#deepConfirmFinish').click();
  await expect(page.locator('#deepDialog')).not.toBeVisible();
});

test('contextual evaluation results keep readable controls',async({page},info)=>{
  await open(page);
  await page.evaluate(()=>CompassoInformationArchitecture.open('context'));
  await page.locator('#contextExplanation').fill('A consulta usa fontes locais para justificar a resposta e comparar alternativas. '.repeat(5));
  await page.locator('[data-context-evaluate]').click();
  await expect(page.locator('#contextEvaluationResult .context-evaluation-card')).toBeVisible();
  for(const width of [360,390,768,1280]){
    await page.setViewportSize({width,height:480});
    expect(await audit(page,'#contextView')).toEqual([]);
  }
  await page.locator('#contextEvaluationResult').screenshot({path:info.outputPath('context-result.png')});
});


test('graph search opens readable selected-node details by keyboard',async({page},info)=>{
  await open(page);
  await page.evaluate(()=>CompassoInformationArchitecture.open('dictionary'));
  await page.locator('#graphSearch').fill('exemplo');
  await expect(page.locator('#graphSearchResults [data-graph-focus]').first()).toBeVisible();
  await page.locator('#graphSearch').press('Enter');
  await expect(page.locator('#graphInspector [data-graph-open]')).toBeVisible();
  for(const width of [360,390,768,1280]){
    await page.setViewportSize({width,height:480});
    expect(await audit(page,'#graphInspector')).toEqual([]);
  }
  await page.locator('#graphInspector').screenshot({path:info.outputPath('graph-selected.png')});
});


async function variant(page,root,name,info,findings,capture=true){
  await expect(page.locator(root)).toBeVisible();
  for(const width of [360,390,768,1280]){
    await page.setViewportSize({width,height:480});
    for(const issue of await audit(page,root))findings.push(`${name}/${width}: ${issue}`);
  }
  if(capture)await page.locator(root).screenshot({path:info.outputPath(`${name.replace(/[^a-zA-Z0-9_-]/g,"_")}.png`)});
}
function closeVariants(info,findings){
  fs.writeFileSync(info.outputPath('variants.json'),JSON.stringify(findings,null,2));
  expect(findings).toEqual([]);
}

test('variants: capability validation resources and archived cards',async({page},info)=>{
  test.setTimeout(120000);await open(page);const issues=[];
  await page.evaluate(()=>CompassoInformationArchitecture.open('capabilities'));
  await page.locator('[data-outcome-new]').first().click();
  await page.locator('#learningOutcomeForm [type=submit]').click();
  await variant(page,'#learningOutcomeDialog','capability-error',info,issues);
  await page.locator('#learningOutcomeDialog [name=capability]').fill('Explicar decisões e verificar resultados em um caso desconhecido. '.repeat(3));
  await page.locator('#learningOutcomeDialog [name=nextAttempt]').fill('Comparar duas soluções e registrar o resultado.');
  await page.locator('.learning-outcome-resources summary').click();
  await variant(page,'#learningOutcomeDialog','capability-resources',info,issues);
  await page.locator('#learningOutcomeForm [type=submit]').click();
  await variant(page,'#capabilitiesView','capability-populated',info,issues);
  await page.locator('[data-outcome-edit]').first().click();
  await variant(page,'#learningOutcomeDialog','capability-edit',info,issues);
  await page.keyboard.press('Escape');
  await page.locator('[data-outcome-status]').first().click();
  await page.locator('[data-outcome-mode="archived"]').click();
  await variant(page,'#capabilitiesView','capability-archived',info,issues);
  closeVariants(info,issues);
});

test('variants: Journal entry migration transformation and day closure',async({page},info)=>{
  test.setTimeout(120000);await open(page);const issues=[];
  await page.evaluate(()=>CompassoInformationArchitecture.open('journal'));
  await page.locator('#journalCaptureInput').fill('/tarefa Comparar as alternativas e registrar uma decisão justificada.');
  await page.locator('#journalCaptureInput').press('Enter');
  await page.locator('#journalIntention').fill('Concluir a revisão com exemplos e evidências.');
  await page.locator('#journalIntentionForm').evaluate(f=>f.requestSubmit());
  await variant(page,'#journalView','journal-populated',info,issues);
  for(const [action,root,name] of [['edit','#journalEntryDialog','journal-edit'],['migrate','#journalMigrationDialog','journal-migration'],['transform','#journalTransformDialog','journal-transform']]){
    const summary=page.locator('.journal-entry summary').first();
    if(!await page.locator(`[data-journal-${action}]`).first().isVisible())await summary.click();
    await page.locator(`[data-journal-${action}]`).first().click();
    for(const select of await page.locator(`${root} select`).all()){
      if(!await select.isVisible() || await select.isDisabled())continue;
      const values=await select.locator('option').evaluateAll(nodes=>nodes.filter(n=>!n.disabled).map(n=>n.value));
      for(const value of values){await select.selectOption(value);await variant(page,root,`${name}-${value||'none'}`,info,issues,false);}
    }
    await variant(page,root,`${name}-representative`,info,issues);
    await page.keyboard.press('Escape');
  }
  await page.locator('[data-journal-close-day]').click();
  await variant(page,'#journalCloseDialog','journal-close-populated',info,issues);
  await page.keyboard.press('Escape');
  closeVariants(info,issues);
});

test('variants: capture decisions and generated contextual questions',async({page},info)=>{
  test.setTimeout(180000);await open(page);const issues=[];
  await page.locator('#captureGlobalBtn').click();
  await page.locator('#captureContent').fill('Resultado verificável para comparar alternativas e explicar uma decisão.');
  await page.locator('#captureForm').evaluate(f=>f.requestSubmit());
  await page.evaluate(()=>CompassoInformationArchitecture.open('notes'));
  await page.locator('[data-capture-atlas=inbox]').click();
  for(const decision of ['note','recall','action','evidence','archive','discard']){
    await page.locator('[data-capture-process]').first().click();
    await page.locator(`[name=captureDecision][value=${decision}]`).check();
    await page.locator('[data-capture-process-next]').click();
    await variant(page,'#captureProcessDialog',`capture-${decision}-context`,info,issues);
    await page.locator('[data-capture-process-next]').click();
    await variant(page,'#captureProcessDialog',`capture-${decision}-fields`,info,issues);
    await page.keyboard.press('Escape');
  }
  await page.evaluate(()=>CompassoInformationArchitecture.open('context'));
  for(const mode of ['explain','apply','contrast']){
    await page.locator('#contextQuestionMode').selectOption(mode);
    await page.locator('[data-context-generate]').click();
    await variant(page,'#recallDialog',`question-${mode}`,info,issues);
    await page.keyboard.press('Escape');
  }
  closeVariants(info,issues);
});

test('variants: Notes modes and recoverable autosave failure',async({page},info)=>{
  test.setTimeout(120000);await open(page);const issues=[];
  await page.evaluate(()=>CompassoInformationArchitecture.open('notes'));
  await page.locator('#markdownInput').fill('# Consulta explicada\n\nComparar [[Exemplo de estudo]] com uma alternativa e registrar a evidência.\n\n```sql\nSELECT * FROM resultados WHERE confirmado = 1;\n```');
  await expect(page.locator('#noteSaveState')).toHaveText('Salvo',{timeout:5000});
  for(const mode of ['editor','split','preview']){
    await page.locator(`[data-mode="${mode}"]`).click();
    await variant(page,'#notesView',`notes-${mode}`,info,issues);
  }
  await page.locator('[data-mode="editor"]').click();
  await page.evaluate(()=>{
    const original=window.CompassoStorage;
    window.__visualOriginalStorage=original;
    window.__visualAllowNoteSave=false;
    window.CompassoStorage={...original,save:(...args)=>window.__visualAllowNoteSave?original.save(...args):Promise.resolve(false)};
  });
  await page.locator('#markdownInput').fill('# Revisão preservada\n\nO texto continua disponível após a falha local.');
  await expect(page.locator('#noteSaveState')).toHaveText('Não foi possível salvar',{timeout:5000});
  await variant(page,'#notesView','notes-save-failure',info,issues);
  await page.evaluate(()=>{window.__visualAllowNoteSave=true;});
  await page.locator('#noteSaveRetry').click();
  await expect(page.locator('#noteSaveState')).toHaveText('Salvo',{timeout:5000});
  await variant(page,'#notesView','notes-save-recovered',info,issues);
  closeVariants(info,issues);
});

test('variants: weakness validation open resolved and edit states',async({page},info)=>{
  test.setTimeout(120000);await open(page);const issues=[];
  await page.evaluate(()=>CompassoInformationArchitecture.open('weakness'));
  await variant(page,'#weaknessView','weakness-empty',info,issues);
  await page.locator('[data-error-new]').click();
  await page.locator('#weaknessForm [type=submit]').click();
  await variant(page,'#weaknessDialog','weakness-required',info,issues);
  await page.locator('#errorTitle').fill('Confundi o custo estimado com o custo real da consulta.');
  await page.locator('#errorContext').fill('A comparação usou somente o primeiro plano e ignorou a cardinalidade observada.');
  await page.locator('#errorCorrection').fill('Separar estimativa e medição, executar ambos os planos e registrar a diferença.');
  await page.locator('#errorNextAction').fill('Repetir a análise com dois conjuntos de dados.');
  await page.locator('#weaknessForm [type=submit]').click();
  await variant(page,'#weaknessView','weakness-open',info,issues);
  await page.locator('[data-error-toggle]').first().click();
  await variant(page,'#weaknessView','weakness-resolved',info,issues);
  await page.locator('[data-error-edit]').first().click();
  await variant(page,'#weaknessDialog','weakness-edit',info,issues);
  await page.keyboard.press('Escape');
  closeVariants(info,issues);
});

test('variants: vault empty preview populated preview and import strategies',async({page},info)=>{
  test.setTimeout(120000);await open(page);const issues=[];
  await page.evaluate(()=>CompassoInformationArchitecture.open('notes'));
  await page.locator('#vaultManagerBtn').click();
  await variant(page,'#vaultDialog','vault-empty',info,issues);
  await page.locator('#vaultFolderInput').evaluate(input=>input.removeAttribute('webkitdirectory'));
  await page.locator('#vaultFolderInput').setInputFiles({
    name:'consulta-explicada.md',mimeType:'text/markdown',
    buffer:Buffer.from('---\ntags: [consulta, evidencia]\n---\n# Consulta explicada\n\nComparar [[Plano alternativo]] e registrar a evidência.')
  });
  await expect(page.locator('#vaultApplyBtn')).toBeEnabled();
  for(const strategy of ['merge','copies','replace']){
    await page.locator(`[name="vaultStrategy"][value="${strategy}"]`).check();
    await variant(page,'#vaultDialog',`vault-${strategy}`,info,issues);
  }
  await page.keyboard.press('Escape');
  closeVariants(info,issues);
});

test('variants: completed session history and evidence correction dialogs',async({page},info)=>{
  test.setTimeout(120000);await open(page);const issues=[];
  await page.evaluate(()=>CompassoInformationArchitecture.open('study'));
  await page.locator('#studyGrid .ux-execute').first().click();
  await page.locator('[data-ux-run="ideal"]').click();
  await page.locator('#sessionStartForm').evaluate(form=>form.requestSubmit());
  await page.locator('#sessionCompanionFinish').click();
  await page.locator('#sessionEvidenceSummary').fill('Comparei os planos e registrei uma conclusão verificável.');
  await page.locator('#sessionFinishForm').evaluate(form=>form.requestSubmit());
  await page.evaluate(()=>CompassoInformationArchitecture.open('analytics'));
  await variant(page,'#analyticsView','history-populated',info,issues);
  await page.locator('[data-history-edit]:not([data-history-edit^="deep:"])').first().click();
  await variant(page,'#historySessionDialog','history-session-edit',info,issues);
  await page.keyboard.press('Escape');
  await page.locator('#analyticsHistory [data-evidence-edit]').first().click();
  await variant(page,'#historyEvidenceDialog','history-evidence-edit',info,issues);
  await page.keyboard.press('Escape');
  closeVariants(info,issues);
});

test('variants: settings restore cancellation and shell reset safeguards',async({page},info)=>{
  test.setTimeout(120000);await open(page);const issues=[];
  await page.locator('#settingsBtn').click();
  await variant(page,'#settingsMenu','settings-open',info,issues);
  await page.locator('#importInput').setInputFiles({name:'invalido.json',mimeType:'application/json',buffer:Buffer.from('{')});
  await expect(page.locator('#importStatus')).toHaveText('Arquivo JSON inválido.');
  await variant(page,'#settingsMenu','settings-import-error',info,issues);
  const backup=await page.evaluate(()=>JSON.stringify(state.data));
  await page.locator('#importInput').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(backup)});
  await variant(page,'#restoreDialog','restore-confirmation',info,issues);
  await page.keyboard.press('Escape');
  await page.evaluate(()=>CompassoPwaLifecycle.openResetDialog(document.getElementById('settingsBtn')));
  await variant(page,'#compassoShellResetDialog','shell-reset-confirmation',info,issues);
  await page.keyboard.press('Escape');
  closeVariants(info,issues);
});
