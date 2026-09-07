const {test,expect}=require('@playwright/test');

async function openNotes(page){
  await page.route(/^https?:\/(?!\/127\.0\.0\.1)/,route=>route.abort());
  await page.addInitScript(()=>localStorage.setItem('compasso.ux.mode.v1','advanced'));
  await page.goto('/?view=notes',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>globalThis.CompassoFeatures?.installed);
  await page.evaluate(()=>{
    globalThis.CompassoDriveSync||={
      prepareLocalState(input){return{data:structuredClone(input),baseline:new Map()}},
      activateLocalState(){}
    };
  });
  await expect(page.locator('#notesView')).toBeVisible();
  await expect(page.locator('#markdownInput')).toBeVisible();
}

function backup(overrides={}){
  return{
    reading:[],study:[],goal:[],focus:[],folders:[],notes:[],captures:[],
    ...overrides
  };
}

async function chooseBackup(page,data,name='backup.json'){
  await page.locator('#importInput').setInputFiles({
    name,mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))
  });
}

test('Notes só anuncia Salvo após durabilidade offline e a revisão confirmada sobrevive ao reload',async({page,context})=>{
  await openNotes(page);
  await context.setOffline(true);
  const title=page.locator('#noteTitleInput');
  await title.focus();
  await title.fill('Nota durável confirmada');
  await expect(page.locator('#noteSaveState')).toHaveText('Alterações não salvas');
  await expect(title).toBeFocused();
  await expect(page.locator('#noteSaveState')).toHaveText('Salvo',{timeout:5000});
  await expect(title).toBeEnabled();

  await context.setOffline(false);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>globalThis.CompassoFeatures?.installed);
  await expect(page.locator('#noteTitleInput')).toHaveValue('Nota durável confirmada');
  await expect(page.locator('#noteSaveState')).toHaveText('Salvo');
});

test('fallback local durável confirma o autosave e recupera a nota após reload',async({page})=>{
  await page.addInitScript(()=>Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined}));
  await openNotes(page);
  await page.locator('#noteTitleInput').fill('Nota no fallback local');
  await expect(page.locator('#noteSaveState')).toHaveText('Salvo',{timeout:5000});
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('compasso.app.v1')).notes.some(note=>note.title==='Nota no fallback local'))).toBe(true);

  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>globalThis.CompassoFeatures?.installed);
  await expect(page.locator('#noteTitleInput')).toHaveValue('Nota no fallback local');
  await expect(page.locator('#noteSaveState')).toHaveText('Salvo');
});

test('falha de autosave mantém o texto e retry por teclado salva a revisão mais recente',async({page})=>{
  await openNotes(page);
  await page.evaluate(()=>{
    const original=window.CompassoStorage;
    window.__localDataSafetyStorage=original;
    window.__allowNoteSave=false;
    window.CompassoStorage={...original,save:(...args)=>window.__allowNoteSave?original.save(...args):Promise.resolve(false)};
  });
  const editor=page.locator('#markdownInput');
  await editor.focus();
  await editor.fill('# Texto mais recente\n\nContinua editável.');
  await expect(page.locator('#noteSaveState')).toHaveText('Não foi possível salvar',{timeout:4000});
  await expect(editor).toBeFocused();
  await expect(editor).toBeEnabled();
  await expect(editor).toHaveValue(/Texto mais recente/);
  await expect(page.locator('#noteSaveRetry')).toBeVisible();

  await page.evaluate(()=>CompassoInformationArchitecture.open('overview'));
  await page.evaluate(()=>CompassoInformationArchitecture.open('notes'));
  await expect(page.locator('#noteSaveState')).toHaveText('Não foi possível salvar');
  await expect(page.locator('#markdownInput')).toHaveValue(/Texto mais recente/);

  await page.evaluate(()=>{window.__allowNoteSave=true;});
  await page.locator('#noteSaveRetry').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#noteSaveState')).toHaveText('Salvo',{timeout:5000});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>globalThis.CompassoFeatures?.installed);
  await expect(page.locator('#markdownInput')).toHaveValue(/Texto mais recente/);
});

test('conclusões antigas não descrevem uma edição mais nova',async({page})=>{
  await openNotes(page);
  await page.evaluate(()=>{
    const original=window.CompassoStorage;
    window.__saveResolvers=[];
    window.CompassoStorage={...original,save:()=>new Promise(resolve=>window.__saveResolvers.push(resolve))};
  });
  const editor=page.locator('#markdownInput');
  await editor.fill('Revisão A');
  await expect.poll(()=>page.evaluate(()=>window.__saveResolvers.length)).toBe(1);
  await expect(page.locator('#noteSaveState')).toHaveText('Salvando…');
  await editor.fill('Revisão B mais nova');
  await expect(page.locator('#noteSaveState')).toHaveText('Alterações não salvas');
  await expect.poll(()=>page.evaluate(()=>window.__saveResolvers.length)).toBe(2);

  await page.evaluate(()=>window.__saveResolvers[0](true));
  await expect(page.locator('#noteSaveState')).not.toHaveText('Salvo');
  await page.evaluate(()=>window.__saveResolvers[1](false));
  await expect(page.locator('#noteSaveState')).toHaveText('Não foi possível salvar');
  await expect(editor).toHaveValue('Revisão B mais nova');
});

test('JSON malformado, estrutura inválida e cancelamento preservam o estado atual',async({page})=>{
  await openNotes(page);
  await page.evaluate(async()=>{
    state.data.untouched={canary:'atual'};
    await CompassoStorage.save('compasso.app.v1',state.data);
  });

  await page.locator('#importInput').setInputFiles({name:'malformado.json',mimeType:'application/json',buffer:Buffer.from('{')});
  await expect(page.locator('#importStatus')).toHaveText('Arquivo JSON inválido.');
  await expect(page.locator('#restoreDialog')).not.toBeVisible();
  expect(await page.evaluate(()=>state.data.untouched)).toEqual({canary:'atual'});

  await page.locator('#importInput').setInputFiles({name:'invalido.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({reading:{},study:[],goal:[]}))});
  await expect(page.locator('#importStatus')).toHaveText('Backup do Compasso inválido.');
  expect(await page.evaluate(()=>state.data.untouched)).toEqual({canary:'atual'});

  for(const [name,value] of [['primitivo.json',42],['array.json',[]],['envelope.json',{data:backup()}]]){
    await page.locator('#importInput').setInputFiles({name,mimeType:'application/json',buffer:Buffer.from(JSON.stringify(value))});
    await expect(page.locator('#importStatus')).toHaveText('Backup do Compasso inválido.');
    await expect(page.locator('#restoreDialog')).not.toBeVisible();
    expect(await page.evaluate(()=>state.data.untouched)).toEqual({canary:'atual'});
  }

  await page.locator('#settingsBtn').click();
  await expect(page.locator('#importBtn')).toBeVisible();
  await chooseBackup(page,backup({untouched:{canary:'importado'}}));
  await expect(page.locator('#restoreDialog')).toBeVisible();
  await expect(page.locator('#restoreCancelBtn')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#restoreDialog')).not.toBeVisible();
  await expect(page.locator('#importBtn')).toBeFocused();
  await expect(page.locator('#importStatus')).toHaveText('Restauração cancelada.');
  expect(await page.evaluate(()=>state.data.untouched)).toEqual({canary:'atual'});

  await chooseBackup(page,backup({untouched:{canary:'importado-por-clique'}}));
  await page.locator('#restoreCancelBtn').click();
  await expect(page.locator('#restoreDialog')).not.toBeVisible();
  expect(await page.evaluate(()=>state.data.untouched)).toEqual({canary:'atual'});
});

test('falha de persistência do candidato não promove nem anuncia sucesso',async({page})=>{
  await openNotes(page);
  await page.evaluate(async()=>{
    state.data.untouched={canary:'atual'};
    await CompassoStorage.save('compasso.app.v1',state.data);
    const original=window.CompassoStorage;
    window.CompassoStorage={...original,replace:async()=>false};
  });
  await chooseBackup(page,backup({untouched:{canary:'importado'}}));
  await page.locator('#restoreConfirmBtn').click();

  await expect(page.locator('#restoreDialog')).toBeVisible();
  await expect(page.locator('#restoreStatus')).toHaveText('Não foi possível restaurar. Seus dados atuais foram preservados.');
  await expect(page.locator('#restoreConfirmBtn')).toHaveText('Tentar novamente');
  expect(await page.evaluate(()=>state.data.untouched)).toEqual({canary:'atual'});
  await expect(page.locator('#toast')).not.toContainText('Backup restaurado');
});

test('falha de ativação após commit restaura estado ativo e durável anterior',async({page})=>{
  await openNotes(page);
  await page.evaluate(async()=>{
    state.data.untouched={canary:'atual'};
    await CompassoStorage.save('compasso.app.v1',state.data);
    const original=CompassoDriveSync.activateLocalState;
    let calls=0;
    CompassoDriveSync.activateLocalState=prepared=>{
      calls+=1;
      if(calls===1)throw new Error('activation-test');
      return original(prepared);
    };
  });
  await chooseBackup(page,backup({untouched:{canary:'importado'}}));
  await page.locator('#restoreConfirmBtn').click();
  await expect(page.locator('#restoreStatus')).toContainText('dados atuais foram preservados');
  expect(await page.evaluate(()=>state.data.untouched)).toEqual({canary:'atual'});
  expect(await page.evaluate(()=>CompassoStorage.load('compasso.app.v1').untouched)).toEqual({canary:'atual'});

  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>globalThis.CompassoFeatures?.installed);
  expect(await page.evaluate(()=>state.data.untouched)).toEqual({canary:'atual'});
});

test('backup atual preserva campos desconhecidos, Notes e wikilinks após restore e reload',async({page})=>{
  await openNotes(page);
  const candidate=backup({
    folders:[{id:'f-inbox',name:'Inbox',parent:null,domain:'inbox'}],
    notes:[{id:'canary-note',title:'Canário',folder:'f-inbox',domain:'inbox',linkedItemId:null,tags:['seguro'],updated:'2026-08-29',content:'# Canário\n\n[[Outra nota]]'}],
    untouched:{keep:true},
    learningOutcomes:[],learningSignals:[],sessions:[],evidence:[],ritualTemplates:[],journalEntries:[]
  });
  await chooseBackup(page,candidate);
  await page.locator('#restoreConfirmBtn').click();
  await expect(page.locator('#restoreDialog')).not.toBeVisible();
  expect(await page.evaluate(()=>({untouched:state.data.untouched,note:state.data.notes[0]}))).toMatchObject({
    untouched:{keep:true},
    note:{id:'canary-note',tags:['seguro'],content:expect.stringContaining('[[Outra nota]]')}
  });

  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>globalThis.CompassoFeatures?.installed);
  expect(await page.evaluate(()=>state.data.untouched)).toEqual({keep:true});
  await expect(page.locator('#markdownInput')).toHaveValue(/\[\[Outra nota\]\]/);
});

test('status, retry e confirmação preservam semântica, mobile, coarse pointer e zoom de 200%',async({page},testInfo)=>{
  await openNotes(page);
  const semantics=await page.evaluate(()=>({
    role:document.getElementById('noteSaveState').getAttribute('role'),
    live:document.getElementById('noteSaveState').getAttribute('aria-live'),
    atomic:document.getElementById('noteSaveState').getAttribute('aria-atomic'),
    described:document.getElementById('markdownInput').getAttribute('aria-describedby')
  }));
  expect(semantics).toEqual({role:'status',live:'polite',atomic:'true',described:'noteSaveState'});

  await chooseBackup(page,backup());
  await expect(page.locator('#restoreCancelBtn')).toBeFocused();
  await page.setViewportSize({width:360,height:800});
  let geometry=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth,dialog:document.getElementById('restoreDialog').getBoundingClientRect().width}));
  expect(geometry.scroll).toBeLessThanOrEqual(geometry.client+1);
  expect(geometry.dialog).toBeLessThanOrEqual(geometry.client);
  await page.setViewportSize({width:390,height:844});
  geometry=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
  expect(geometry.scroll).toBeLessThanOrEqual(geometry.client+1);

  await page.evaluate(()=>{document.documentElement.style.zoom='2';});
  geometry=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
  expect(geometry.scroll).toBeLessThanOrEqual(geometry.client+1);
  await page.evaluate(()=>{document.documentElement.style.zoom='';});

  if(testInfo.project.name==='mobile'){
    expect(await page.evaluate(()=>matchMedia('(pointer: coarse)').matches)).toBe(true);
    const targets=await page.locator('#restoreDialog button').evaluateAll(buttons=>buttons.map(button=>{const box=button.getBoundingClientRect();return{width:box.width,height:box.height}}));
    expect(targets.every(target=>target.width>=44&&target.height>=44)).toBe(true);
  }
});
