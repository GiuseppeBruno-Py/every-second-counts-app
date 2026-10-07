const {test, expect} = require('@playwright/test');
const routes = ['today','fronts','capabilities','reading','study','goal','journal','review','weekly','outcomes','analytics','recall','weakness','notes','dictionary','context'];
async function open(page) {
  await page.route(/^https?:\/(?!\/127\.0\.0\.1)/, route => route.abort());
  await page.addInitScript(() => {
    localStorage.setItem('compasso.ux.mode.v1','advanced');
    globalThis.CompassoDriveSync ||= {prepareLocalState(input){return {data:structuredClone(input),baseline:new Map()};},activateLocalState(){}};
  });
  await page.goto('http://127.0.0.1:4174/?view=today');
  await page.waitForFunction(() => globalThis.CompassoInformationArchitecture && globalThis.CompassoDesignSystem);
  await expect(page.locator('#todayView')).toBeVisible();
}
async function preference(page, value) {
  await page.locator('#settingsBtn').click();
  await page.locator('#themePreference').selectOption(value);
  expect(await audit(page,'#settingsMenu')).toEqual([]);
  await page.locator('#settingsBtn').click();
}
async function audit(page, root) {
  return page.locator(root).evaluate(element => {
    const rgb = value => {
      const channels=(value.match(/[\d.]+/g)||[]).map(Number);
      return value.startsWith('color(srgb') ? channels.map((v,i)=>i<3?v*255:v) : channels;
    };
    const luminance = color => rgb(color).slice(0,3).map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
    const ratio = (a,b) => (Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);
    const background = node => {
      for(let parent=node;parent;parent=parent.parentElement){
        const color=getComputedStyle(parent).backgroundColor, channels=rgb(color);
        if(channels.length===3 || channels[3]===1)return color;
      }
      return getComputedStyle(document.body).backgroundColor;
    };
    const failures=[];
    for(const node of element.querySelectorAll('button,input,textarea,select,label,p,small,h1,h2,h3,summary,span,div')){
      if(!node.checkVisibility() || node.closest('[hidden]') || node.matches(':disabled,input[type=hidden]') || ![...node.childNodes].some(n=>n.nodeType===3 && n.textContent.trim()))continue;
      const style=getComputedStyle(node), id=node.id||node.className||node.tagName;
      if(parseFloat(style.opacity)<1)continue;
      if(ratio(style.color,background(node))<4.5)failures.push(id+': '+node.textContent.trim().slice(0,35)+' contrast '+ratio(style.color,background(node)).toFixed(2)+' '+style.color+' / '+background(node));
    }
    if(document.documentElement.scrollWidth>document.documentElement.clientWidth+1) failures.push('document overflow');
    return [...new Set(failures)];
  });
}
test.beforeEach(async ({request}) => {
  const response=await request.post('http://127.0.0.1:4174/__compasso_test__/generation',{data:'current',headers:{'content-type':'text/plain'}});
  expect(response.ok()).toBe(true);
});
test('theme keyboard choice persists, synchronizes tabs and follows system only when selected', async ({page, context}) => {
  await page.emulateMedia({colorScheme:'light'});
  await open(page);
  const html=page.locator('html'),toggle=page.locator('#themeToggle');
  await expect(html).toHaveAttribute('data-theme','light');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(html).toHaveAttribute('data-theme','dark');
  await expect(toggle).toHaveAccessibleName('Ativar tema claro');
  const other=await context.newPage();
  await other.emulateMedia({colorScheme:'light'});
  await open(other);
  await expect(other.locator('html')).toHaveAttribute('data-theme','dark');
  await toggle.focus();
  await page.keyboard.press('Space');
  await expect(other.locator('html')).toHaveAttribute('data-theme','light');
  await page.reload();
  await expect(html).toHaveAttribute('data-theme','light');
  await page.emulateMedia({colorScheme:'dark'});
  await expect(html).toHaveAttribute('data-theme','light');
  await preference(page,'system');
  await expect(html).toHaveAttribute('data-theme','dark');
  await page.emulateMedia({colorScheme:'light'});
  await expect(html).toHaveAttribute('data-theme','light');
  expect(await page.evaluate(()=>localStorage.getItem('compasso.theme.v1'))).toBeNull();
  await other.close();
});
test('appearance works with unavailable storage', async ({page}) => {
  await page.emulateMedia({colorScheme:'dark'});
  await page.addInitScript(() => Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked');}}));
  await page.route('**/appearance-probe',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html data-visual-system="notebook"><head><meta name="theme-color" content=""><script src="./theme.js"></script></head><body><button id="themeToggle">Tema</button><select id="themePreference"><option value="system">Sistema</option><option value="light">Claro</option><option value="dark">Escuro</option></select></body></html>'}));
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:4174/appearance-probe');
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.locator('#themeToggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await page.locator('#themePreference').selectOption('system');
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  expect(errors).toEqual([]);
});
test('both themes preserve route readability, touch geometry and opaque reading surfaces', async ({page},info) => {
  test.setTimeout(180000);
  test.skip(info.project.name!=='chromium','fixed viewport matrix includes mobile');
  await open(page);
  const failures={};
  for(const theme of ['light','dark']){
    await preference(page,theme);
    for(const route of routes){
      await page.evaluate(route=>CompassoInformationArchitecture.open(route),route);
      await expect(page.locator('#'+route+'View')).toBeVisible();
      for(const width of [360,768,1280]){
        await page.setViewportSize({width,height:900});
        const issues=await audit(page,'#'+route+'View');
        if(issues.length)failures[theme+' '+route+' '+width]=issues;
        if(route==='today'){
          for(const shell of ['.topbar','.sidebar']){
            const shellIssues=await audit(page,shell);
            if(shellIssues.length)failures[theme+' '+shell+' '+width]=shellIssues;
          }
        }
      }
    }
    const reading = await page.locator('.markdown-input').evaluate(node => ({background:getComputedStyle(node).backgroundColor,image:getComputedStyle(node).backgroundImage}));
    expect(reading.background).not.toBe('rgba(0, 0, 0, 0)');
    expect(reading.image).toBe('none');
    await page.evaluate(()=>CompassoInformationArchitecture.open('today'));
    await page.screenshot({path:info.outputPath('today-'+theme+'.png'),fullPage:false});
  }
  await page.setViewportSize({width:360,height:900});
  const toggle=await page.locator('#themeToggle').boundingBox();
  expect(toggle.width).toBeGreaterThanOrEqual(44);expect(toggle.height).toBeGreaterThanOrEqual(44);
  await page.locator('#themeToggle').focus();
  expect(await page.locator('#themeToggle').evaluate(n=>getComputedStyle(n).outlineWidth)).toBe('3px');
  await page.evaluate(()=>{document.documentElement.style.zoom='2'});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1)).toBe(true);
  await page.evaluate(()=>{document.documentElement.style.zoom=''});
  await page.emulateMedia({reducedMotion:'reduce',forcedColors:'active'});
  expect(await page.locator('.main').evaluate(n=>getComputedStyle(n,'::before').display)).toBe('none');
  expect(failures).toEqual({});
});
test('appearance and brand assets remain available after offline controlled reload', async ({page, context}) => {
  await open(page);
  await preference(page,'dark');
  await page.evaluate(()=>navigator.serviceWorker.ready);
  const cached=await page.evaluate(async () => {
    const keys=await caches.keys(),cache=await caches.open(keys.find(key=>CompassoAppManifest.isOwnedCacheName(key)));
    return Promise.all(['theme.js','compasso-pattern.svg','compasso-icon.svg'].map(async name=>Boolean(await cache.match('./'+name))));
  });
  expect(cached).toEqual([true,true,true]);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('#todayView')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.locator('#themeToggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await context.setOffline(false);
});
test('invalid stored appearance falls back to system before boot', async ({page}) => {
  await page.emulateMedia({colorScheme:'dark'});
  await page.addInitScript(() => {
    if(!sessionStorage.getItem('invalid-theme-tested')){
      localStorage.setItem('compasso.theme.v1','unknown');
      sessionStorage.setItem('invalid-theme-tested','1');
    }
  });
  await open(page);
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.emulateMedia({colorScheme:'light'});
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
});
test('session floating document mirrors appearance using existing updates', async ({page,context}) => {
  await open(page);
  await preference(page,'dark');
  await context.route('**/__pip_theme_test__',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html><head></head><body></body></html>'}));
  await page.evaluate(() => Object.defineProperty(window,'documentPictureInPicture',{configurable:true,value:{requestWindow:async()=>{
    const target=window.open('/__pip_theme_test__','compasso-pip-theme','width=360,height=240');
    await new Promise(resolve=>target.addEventListener('load',resolve,{once:true}));
    return target;
  }}}));
  await page.evaluate(()=>CompassoInformationArchitecture.open('study'));
  await page.locator('#studyGrid .ux-execute').first().click();
  await page.locator('[data-ux-run="ideal"]').click();
  expect(await audit(page,'#sessionStartDialog')).toEqual([]);
  await page.locator('#sessionStartForm').evaluate(form=>form.requestSubmit());
  const popupEvent=context.waitForEvent('page');
  await page.locator('#sessionCompanionFloat').click();
  const popup=await popupEvent;
  await expect(popup.locator('html')).toHaveAttribute('data-theme','dark');
  await expect(popup.locator('#pipReturn')).toBeVisible();
  await page.locator('#themeToggle').click();
  await expect(popup.locator('html')).toHaveAttribute('data-theme','light');
  await popup.close();
  await preference(page,'dark');
  await page.locator('#sessionCompanionFinish').click();
  expect(await audit(page,'#sessionFinishDialog')).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(page.locator('#sessionCompanion')).toBeVisible();
});
