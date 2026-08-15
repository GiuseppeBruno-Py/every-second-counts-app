const {test,expect}=require('@playwright/test');
async function open(page,path='/',mode='essential'){
  await page.route(/^https?:\/(?!\/127\.0\.0\.1)/,route=>route.abort());
  await page.addInitScript(value=>localStorage.setItem('compasso.ux.mode.v1',value),mode);
  await page.goto(path,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>globalThis.CompassoFeatures?.installed&&globalThis.CompassoInformationArchitecture);
  await expect(page.locator('.app-shell')).toBeVisible();
  await expect(page.locator('.app-shell')).not.toHaveAttribute('inert','');
}
test('navegação primária tem quatro áreas declarativas sem Mais e estado anunciado',async({page})=>{
  await open(page);const nav=page.locator('.ia-primary-nav');
  await expect(nav.locator(':scope > .nav-item')).toHaveCount(4);
  await expect(nav.locator(':scope > .nav-item')).toHaveText(['Hoje','Frentes','Journal','Revisão']);
  await expect(nav.locator('[data-ia-area="more"]')).toHaveCount(0);
  await expect(nav.locator('[data-ia-area="today"]')).toHaveAttribute('aria-current','page');
  await nav.locator('[data-ia-area="fronts"]').click();
  await expect(page.locator('#frontsView')).toBeVisible();
  await expect(page.locator('#frontsView [data-ia-view]').first()).toHaveAttribute('data-ia-view','capabilities');
  await page.locator('[data-ia-view="capabilities"]').click();
  await expect(page.locator('#capabilitiesView')).toBeVisible();
  await nav.locator('[data-ia-area="fronts"]').click();
  await page.locator('[data-ia-view="study"]').click();
  await expect(page.locator('#studyView')).toBeVisible();
  await expect(nav.locator('[data-ia-area="fronts"]')).toHaveAttribute('aria-current','page');
});
test('níveis persistem sem recriar Mais e controles de sistema permanecem disponíveis',async({page})=>{
  await open(page,'/','essential');
  await expect(page.locator('#moreView, #iaMoreVault, .ia-system')).toHaveCount(0);
  await expect(page.locator('.vault-explorer')).toBeHidden();
  await page.locator('#settingsBtn').click();await page.locator('[data-ux-mode="knowledge"]').click();
  await expect(page.locator('#exportBtn')).toBeVisible();await expect(page.locator('#importInput')).toHaveCount(1);
  await page.evaluate(()=>CompassoInformationArchitecture.open('notes'));await expect(page.locator('#notesView')).toBeVisible();
  if(page.viewportSize().width>1020)await expect(page.locator('.vault-explorer')).toBeVisible();else await expect(page.locator('.vault-explorer')).toBeHidden();
  await page.evaluate(()=>CompassoInformationArchitecture.open('fronts'));await expect(page.locator('.vault-explorer')).toBeHidden();
  await page.locator('[data-ux-mode="advanced"]').click();
  await expect(page.locator('.ia-primary-nav > .nav-item')).toHaveCount(4);
});
test('deep link abre subvisão e reload preserva contexto',async({page})=>{
  await open(page,'/?view=goal');await expect(page.locator('#goalView')).toBeVisible();
  await expect(page.locator('[data-ia-area="fronts"]')).toHaveAttribute('aria-current','page');
  await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>globalThis.CompassoInformationArchitecture);
  await expect(page.locator('#goalView')).toBeVisible();
  await expect(page.locator('[data-ia-area="fronts"]')).toHaveAttribute('aria-current','page');
});
test('deep link de Capacidades abre a primeira subvisão essencial de Frentes',async({page})=>{
  await open(page,'/?view=capabilities');
  await expect(page.locator('#capabilitiesView')).toBeVisible();
  await expect(page.locator('[data-ia-area="fronts"]')).toHaveAttribute('aria-current','page');
  await expect(page.locator('#frontsView [data-ia-view]').first()).toHaveAttribute('data-ia-view','capabilities');
});
test('deep links preservam Notes, Relações e IA contextual sem anunciar área incorreta',async({page})=>{
  await open(page,'/?view=notes','advanced');await expect(page.locator('#notesView')).toBeVisible();await expect(page.locator('[data-ia-area][aria-current="page"]')).toHaveCount(0);
  for(const route of ['dictionary','context']){await page.goto(`/?view=${route}`,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>globalThis.CompassoInformationArchitecture?.current().view===new URLSearchParams(location.search).get('view'));await expect(page.locator('[data-ia-area][aria-current="page"]')).toHaveCount(0);expect(await page.evaluate(()=>CompassoInformationArchitecture.current().view)).toBe(route);expect(new URL(page.url()).searchParams.get('view')).toBe(route);await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(value=>globalThis.CompassoInformationArchitecture?.current().view===value,route);expect(await page.evaluate(()=>CompassoInformationArchitecture.current().view)).toBe(route)}
});
test('rota Mais aposentada volta para Hoje sem produzir hub vazio',async({page})=>{
  await open(page,'/?view=more','advanced');await expect(page.locator('#todayView')).toBeVisible();await expect(page.locator('[data-ia-area="today"]')).toHaveAttribute('aria-current','page');await expect(page.locator('#moreView')).toHaveCount(0);await expect.poll(()=>new URL(page.url()).searchParams.get('view')).toBe('today');
});
test('preferência inválida e rota antiga indisponível voltam para área válida',async({page})=>{
  await open(page,'/?view=unknown','legacy-invalid');
  await expect(page.locator('#todayView')).toBeVisible();
  await expect(page.locator('[data-ia-area="today"]')).toHaveAttribute('aria-current','page');
  await expect.poll(()=>page.evaluate(()=>localStorage.getItem('compasso.ux.mode.v1'))).toBe('essential');
});
test('Executar tem nome acessível e usa fallback determinístico sem iniciar ação comum',async({page})=>{
  await open(page,'/','advanced');const execute=page.locator('#iaExecuteBtn');await expect(execute).toHaveAttribute('aria-label','Executar');await execute.focus();await page.keyboard.press('Enter');await expect(page.locator('#todayView')).toBeVisible();await expect(page.locator('#todayPrimaryAction [data-today-primary-action]')).toBeFocused();
  await page.evaluate(()=>renderAll());await expect(page.locator('#todayPrimaryAction [data-today-primary-action]')).toBeFocused();
  await page.locator('#todayPrimaryAction [data-today-custom]').click();await page.locator('#todayActionTitle').fill('Organizar os materiais da semana');await page.locator('#todayForm').evaluate(form=>form.requestSubmit());await page.locator('[data-ia-area="review"]').click();await execute.click();await expect(page.locator('#todayPrimaryAction [data-today-primary-action]')).toBeFocused();await expect(page.locator('#todayPrimaryAction')).toContainText('Organizar os materiais');expect(await page.evaluate(()=>state.data.sessions.length)).toBe(0);
});
test('Executar respeita a ordem armazenada entre tentativas planejadas',async({page})=>{
  await open(page,'/?view=capabilities','advanced');
  for(const [capability,attempt] of [['Primeira capacidade','Primeira tentativa planejada'],['Segunda capacidade','Segunda tentativa planejada']]){await page.locator('[data-outcome-new]').first().click();await page.locator('[name="capability"]').fill(capability);await page.locator('[name="nextAttempt"]').fill(attempt);await page.locator('#learningOutcomeForm').evaluate(form=>form.requestSubmit());await page.locator('[data-outcome-card]').filter({hasText:capability}).locator('[data-outcome-today]').click();await page.evaluate(()=>CompassoInformationArchitecture.open('capabilities'))}
  await page.evaluate(()=>CompassoInformationArchitecture.open('today'));await expect(page.locator('#todayPrimaryAction')).toContainText('Primeira tentativa planejada');const stored=await page.evaluate(()=>state.data.dailyPlans[0].items.map(item=>item.capabilityRef.attemptText));expect(stored).toEqual(['Primeira tentativa planejada','Segunda tentativa planejada']);await page.locator('#iaExecuteBtn').click();await expect.poll(()=>page.evaluate(()=>state.data.sessions.length)).toBe(1);expect(await page.evaluate(()=>state.data.sessions[0].learningContext.attemptText)).toBe('Primeira tentativa planejada');
});
test('Executar inicia a primeira tentativa atual e depois retoma a sessão pausada',async({page})=>{
  await open(page,'/?view=capabilities','advanced');await page.locator('[data-outcome-new]').first().click();await page.locator('[name="capability"]').fill('Explicar uma arquitetura');await page.locator('[name="futureUse"]').selectOption('remember');await page.locator('[name="nextAttempt"]').fill('Desenhar o fluxo principal');await page.locator('#learningOutcomeForm').evaluate(form=>form.requestSubmit());await page.locator('[data-outcome-card] [data-outcome-today]').click();await page.locator('[data-ia-area="review"]').click();
  await page.locator('#iaExecuteBtn').click();await expect.poll(()=>page.evaluate(()=>state.data.sessions.length)).toBe(1);expect(await page.evaluate(()=>state.data.sessions[0].learningContext)).toMatchObject({attemptText:'Desenhar o fluxo principal',futureUse:'remember'});expect(await page.evaluate(()=>CompassoInformationArchitecture.current().view)).not.toBe('recall');await page.locator('#sessionCompanionPause').click();await expect.poll(()=>page.evaluate(()=>state.data.sessions[0].status)).toBe('paused');await page.locator('[data-ia-area="review"]').click();await page.locator('#iaExecuteBtn').click();await expect.poll(()=>page.evaluate(()=>state.data.sessions[0].status)).toBe('active');await expect(page.locator('#sessionCompanionOpen')).toBeFocused();
});
test('mobile mantém quatro itens e não cria overflow',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='mobile','mobile only');await open(page);
  const dimensions=await page.evaluate(()=>({page:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth,nav:document.querySelector('.ia-primary-nav').scrollWidth,navClient:document.querySelector('.ia-primary-nav').clientWidth}));
  await expect(page.locator('.ia-primary-nav > .nav-item')).toHaveCount(4);
  expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport+1);expect(dimensions.nav).toBeLessThanOrEqual(dimensions.navClient+1);
});
