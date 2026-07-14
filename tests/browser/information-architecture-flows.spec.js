const {test,expect}=require('@playwright/test');
async function open(page,path='/',mode='essential'){
  await page.route(/^https?:\/(?!\/127\.0\.0\.1)/,route=>route.abort());
  await page.addInitScript(value=>localStorage.setItem('compasso.ux.mode.v1',value),mode);
  await page.goto(path,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>globalThis.CompassoFeatures?.installed&&globalThis.CompassoInformationArchitecture);
}
test('navegação primária tem cinco áreas declarativas e estado anunciado',async({page})=>{
  await open(page);const nav=page.locator('.ia-primary-nav');
  await expect(nav.locator(':scope > .nav-item')).toHaveCount(5);
  await expect(nav.locator(':scope > .nav-item')).toHaveText(['Hoje','Frentes','Journal','Revisão','Mais']);
  await expect(nav.locator('[data-ia-area="today"]')).toHaveAttribute('aria-current','page');
  await nav.locator('[data-ia-area="fronts"]').click();
  await expect(page.locator('#frontsView')).toBeVisible();
  await page.locator('[data-ia-view="study"]').click();
  await expect(page.locator('#studyView')).toBeVisible();
  await expect(nav.locator('[data-ia-area="fronts"]')).toHaveAttribute('aria-current','page');
});
test('níveis alteram subvisões sem alterar as cinco áreas',async({page})=>{
  await open(page,'/','essential');await page.locator('[data-ia-area="more"]').click();
  await expect(page.locator('#moreView [data-ia-view="notes"]')).toHaveCount(0);
  await page.locator('#settingsBtn').click();await page.locator('[data-ux-mode="knowledge"]').click();
  await expect(page.locator('#moreView [data-ia-view="notes"]')).toBeVisible();
  await expect(page.locator('#moreView [data-ia-view="dictionary"]')).toHaveCount(0);
  await page.locator('[data-ux-mode="advanced"]').click();
  await expect(page.locator('#moreView [data-ia-view="dictionary"]')).toBeVisible();
  await expect(page.locator('.ia-primary-nav > .nav-item')).toHaveCount(5);
});
test('deep link abre subvisão e reload preserva contexto',async({page})=>{
  await open(page,'/?view=goal');await expect(page.locator('#goalView')).toBeVisible();
  await expect(page.locator('[data-ia-area="fronts"]')).toHaveAttribute('aria-current','page');
  await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>globalThis.CompassoInformationArchitecture);
  await expect(page.locator('#goalView')).toBeVisible();
  await expect(page.locator('[data-ia-area="fronts"]')).toHaveAttribute('aria-current','page');
});
test('preferência inválida e rota antiga indisponível voltam para área válida',async({page})=>{
  await open(page,'/?view=unknown','legacy-invalid');
  await expect(page.locator('#todayView')).toBeVisible();
  await expect(page.locator('[data-ia-area="today"]')).toHaveAttribute('aria-current','page');
  await expect.poll(()=>page.evaluate(()=>localStorage.getItem('compasso.ux.mode.v1'))).toBe('essential');
});
test('mobile mantém cinco itens e não cria overflow',async({page},testInfo)=>{
  test.skip(testInfo.project.name!=='mobile','mobile only');await open(page);
  const dimensions=await page.evaluate(()=>({page:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth,nav:document.querySelector('.ia-primary-nav').scrollWidth,navClient:document.querySelector('.ia-primary-nav').clientWidth}));
  expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport+1);expect(dimensions.nav).toBeLessThanOrEqual(dimensions.navClient+1);
});
