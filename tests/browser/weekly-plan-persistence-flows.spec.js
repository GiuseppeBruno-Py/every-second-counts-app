const {test,expect}=require('@playwright/test');

async function open(page){
  await page.route(/^https?:\/(?!\/127\.0\.0\.1)/,route=>route.abort());
  await page.addInitScript(()=>{globalThis.CompassoDriveSync||={prepareLocalState(input){return{data:structuredClone(input),baseline:new Map()}},activateLocalState(){}}});
  await page.goto('/?view=weekly',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>globalThis.CompassoFeatures?.installed&&globalThis.CompassoWeeklyPlanModel);
}

async function seedDraft(page,step=10){
  await page.evaluate(async step=>{
    const now=new Date().toISOString();
    state.data.goal.push({id:'audit-weekly-goal',title:'Aprender o tema',status:'active',createdAt:now,updatedAt:now});
    state.data.study.push({id:'audit-weekly-study',title:'Praticar explicação',status:'active',studyUnit:'hours',createdAt:now,updatedAt:now});
    state.data.weeklyPlans=[CompassoWeeklyPlanModel.normalize({
      weekStart:CompassoWeeklyPlanModel.nextWeekKey(new Date(),Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC'),
      goalRefs:['audit-weekly-goal'],outcomes:[{id:'wo1',description:'Explicar o conceito'},{id:'wo2',description:'Dar um exemplo'}],
      actionRefs:['study:audit-weekly-study'],contingencies:'Plano B inicial',step,status:'draft'
    })];
    state.data.focus=['Foco anterior'];
    if(!await CompassoStorage.save('compasso.app.v1',state.data))throw new Error('fixture draft was not persisted');
  },step);
  await page.locator('#weeklyPlanLaunch').click();
  await expect(page.locator('#weeklyPlanDialog')).toBeVisible();
}

test('falha ao confirmar preserva rascunho e foco; retry persiste após refresh',async({page})=>{
  await open(page);await seedDraft(page);
  await page.evaluate(()=>{
    const original=CompassoStorage;
    window.CompassoStorage={...original,save:(key,value)=>value.weeklyPlans.some(plan=>plan.status==='confirmed')?Promise.resolve(false):original.save(key,value)};
  });
  await page.locator('#weeklyPlanNext').click();
  await expect(page.locator('#weeklyPlanDialog')).toBeVisible();
  await expect(page.locator('#weeklyPlanStatus')).toContainText('Não foi possível salvar');
  await expect(page.locator('#weeklyPlanNext')).toBeEnabled();
  await expect(page.locator('#weeklyPlanNext')).toBeFocused();
  expect(await page.evaluate(()=>({status:state.data.weeklyPlans[0].status,focus:state.data.focus,description:state.data.weeklyPlans[0].outcomes[0].description}))).toEqual({status:'draft',focus:['Foco anterior'],description:'Explicar o conceito'});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>globalThis.CompassoFeatures?.installed&&globalThis.CompassoWeeklyPlanModel);
  expect(await page.evaluate(()=>({status:state.data.weeklyPlans[0].status,focus:state.data.focus,description:state.data.weeklyPlans[0].outcomes[0].description}))).toEqual({status:'draft',focus:['Foco anterior'],description:'Explicar o conceito'});
  await page.locator('#weeklyPlanLaunch').click();
  await page.locator('#weeklyPlanNext').click();
  await expect(page.locator('#weeklyPlanDialog')).toBeHidden();
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>globalThis.CompassoFeatures?.installed&&globalThis.CompassoWeeklyPlanModel);
  expect(await page.evaluate(()=>({status:state.data.weeklyPlans[0].status,focus:state.data.focus}))).toEqual({status:'confirmed',focus:['Praticar explicação']});
});

test('confirmação aguarda gravação e bloqueia fechamento concorrente',async({page})=>{
  await open(page);await seedDraft(page);
  await page.evaluate(()=>{
    const original=CompassoStorage;
    window.CompassoStorage={...original,save:(key,value)=>{
      if(!value.weeklyPlans.some(plan=>plan.status==='confirmed'))return original.save(key,value);
      return new Promise(resolve=>{window.releaseWeeklyPlanSave=async()=>resolve(await original.save(key,value));});
    }};
  });
  await page.locator('#weeklyPlanNext').click();
  await expect(page.locator('#weeklyPlanDialog')).toBeVisible();
  await expect(page.locator('#weeklyPlanDialog')).toHaveAttribute('aria-busy','true');
  await expect(page.locator('#weeklyPlanNext')).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(page.locator('#weeklyPlanDialog')).toBeVisible();
  await page.evaluate(()=>releaseWeeklyPlanSave());
  await expect(page.locator('#weeklyPlanDialog')).toBeHidden();
  expect(await page.evaluate(()=>state.data.weeklyPlans[0].status)).toBe('confirmed');
});

test('falha de autosave sinaliza rascunho não salvo e mantém edição para retry',async({page})=>{
  await open(page);await seedDraft(page,8);
  await page.evaluate(()=>{window.originalWeeklyStorage=CompassoStorage;window.CompassoStorage={...CompassoStorage,save:async()=>false};});
  await page.locator('#weeklyPlanContingencies').fill('Se faltar tempo, farei uma revisão curta.');
  await expect(page.locator('#weeklyPlanStatus')).toContainText('Não foi possível salvar');
  await expect(page.locator('#weeklyPlanContingencies')).toHaveValue('Se faltar tempo, farei uma revisão curta.');
  await page.evaluate(()=>{window.CompassoStorage=window.originalWeeklyStorage;});
  await page.locator('#weeklyPlanContingencies').fill('Se faltar tempo, farei uma revisão de 10 minutos.');
  await expect(page.locator('#weeklyPlanStatus')).toContainText('Rascunho salvo automaticamente');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>globalThis.CompassoFeatures?.installed&&globalThis.CompassoWeeklyPlanModel);
  expect(await page.evaluate(()=>state.data.weeklyPlans[0].contingencies)).toBe('Se faltar tempo, farei uma revisão de 10 minutos.');
});
