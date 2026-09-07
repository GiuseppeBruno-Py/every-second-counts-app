const { test, expect } = require('@playwright/test');

async function open(page, view = 'today') {
  await page.route(/^https?:\/(?!\/127\.0\.0\.1)/, route => route.abort());
  await page.addInitScript(() => { globalThis.CompassoDriveSync ||= {prepareLocalState(input) {return {data: structuredClone(input), baseline: new Map()};}, activateLocalState() {}}; });
  await page.goto(`http://127.0.0.1:4174/?view=${view}`, {waitUntil: 'domcontentloaded'});
  await page.waitForFunction(() => globalThis.CompassoFeatures?.installed && globalThis.CompassoDesignSystem);
}

test('shared non-pilot dialog styles remain compatible', async ({page}, info) => {
  test.skip(info.project.name !== 'chromium', 'controlled desktop viewport');
  const result = {};
  for (const width of [390, 1280]) {
    await page.setViewportSize({width, height: 800});
    await open(page, 'study');
    result[width] = await page.evaluate(() => {
      const result = {};
      for (const id of ['sessionHistoryDialog', 'historySessionDialog', 'energyMapDialog']) {
        const dialog = document.getElementById(id);
        dialog.showModal();
        result[id] = [...dialog.querySelectorAll('h2,.session-summary,button,input,select')].map(node => {
          const style = getComputedStyle(node);
          return [node.tagName, style.fontSize, style.lineHeight, style.color, style.backgroundColor, style.borderTopWidth, style.borderTopColor, style.padding, style.width];
        });
        dialog.close();
      }
      return result;
    });
  }
  // Widths were captured as evidence, but native/font metrics vary by OS.
  const stylesOnly = value => JSON.parse(JSON.stringify(value), (key, item) =>
    Array.isArray(item) && typeof item[0] === 'string' ? item.slice(0, 8) : item);
  expect(stylesOnly(result)).toEqual(stylesOnly(BASELINE));
});

async function capabilityPlan(page) {
  await page.evaluate(() => CompassoInformationArchitecture.open('capabilities'));
  await page.locator('[data-outcome-new]').first().click();
  await page.locator('[name="capability"]').fill('Diagnosticar uma consulta SQL lenta');
  await page.locator('[name="nextAttempt"]').fill('Comparar EXPLAIN antes e depois de criar um índice');
  await page.locator('#learningOutcomeForm [type="submit"]').click();
  await page.locator('[data-outcome-card]').first().locator('[data-outcome-today]').click();
  await expect(page.locator('#todayView')).toBeVisible();
}

async function layout(page, root) {
  const result = await page.locator(root).evaluate(element => {
    const failures = [];
    const viewport = document.documentElement.clientWidth;
    for (const node of element.querySelectorAll('button,input,select,textarea,p,label,h2,h3,summary')) {
      if (!node.checkVisibility() || node.closest('[hidden]')) continue;
      const rect = node.getBoundingClientRect(), style = getComputedStyle(node);
      if (rect.width && (rect.left < -1 || rect.right > viewport + 1)) failures.push(`${node.id || node.className}: bounds`);
      if (parseFloat(style.fontSize) < 14) failures.push(`${node.id || node.className}: font ${style.fontSize}`);
      if (node.matches('button') && (rect.width < 43.9 || rect.height < 43.9)) failures.push(`${node.id || node.className}: target`);
      if (node.matches('input:not([type=checkbox]),select,textarea') && parseFloat(style.fontSize) < 16) failures.push(`${node.id}: input font`);
    }
    return failures;
  });
  expect(result).toEqual([]);
}

test('six pilot states preserve readable layout and Evidence through refresh', async ({page}, info) => {
  test.setTimeout(120000);
  await open(page);
  for (const width of [360, 390, 768, 1280]) {
    await page.setViewportSize({width, height: 800});
    await layout(page, '#todayView');
  }
  await page.screenshot({path: info.outputPath('empty.png'), fullPage: true});
  await capabilityPlan(page);
  const before = await page.evaluate(() => structuredClone(state.data.learningOutcomes[0]));
  const order = await page.evaluate(() => ['todayPrimaryAction', 'todayRemainingPlan', 'journalTodayPanel', 'todaySecondaryContext'].map(id => [...document.querySelector('.today-shell').children].indexOf(document.getElementById(id))));
  expect(order).toEqual([...order].sort((a,b) => a-b));
  expect(new Set(order).size).toBe(4);
  await expect(page.locator('#todayPrimaryAction')).toContainText(before.nextAttempt.text);
  const width = await page.locator('.today-primary-copy').evaluate(node => {
    const measure = document.createElement('span'); measure.style.cssText = 'position:absolute;width:40ch'; measure.style.font = getComputedStyle(node).font;
    node.append(measure); const result = {actual: node.getBoundingClientRect().width, minimum: measure.getBoundingClientRect().width}; measure.remove(); return result;
  });
  expect(width.actual).toBeGreaterThanOrEqual(width.minimum);
  for (const width of [360, 390, 768, 1280]) {
    await page.setViewportSize({width, height:800});
    await layout(page, '#todayView');
  }
  await page.screenshot({path: info.outputPath('planned.png'), fullPage: true});
  await page.locator('[data-today-primary-configure]').click();
  await expect(page.locator('#sessionStartDialog')).toBeVisible();
  await page.locator('#sessionOptionalConfig').evaluate(node => {node.open = true;});
  for (const width of [360, 390, 768, 1280]) {
    await page.setViewportSize({width, height: 800});
    await layout(page, '#sessionStartDialog');
  }
  await page.screenshot({path: info.outputPath('start.png'), fullPage: true});
  await page.locator('#sessionStartSubmit').click();
  await expect(page.locator('#sessionCompanion')).toBeVisible();
  await page.locator('#sessionCompanionPause').click();
  await page.reload();
  await page.waitForFunction(() => globalThis.CompassoFeatures?.installed);
  await expect(page.locator('#sessionCompanion')).toHaveClass(/paused/);
  await page.locator('#sessionCompanionPause').click();
  for (const width of [360, 390, 768, 1280]) {
    await page.setViewportSize({width, height: 800});
    await layout(page, '#todayView'); await layout(page, '#sessionCompanion');
  }
  await page.screenshot({path: info.outputPath('active.png'), fullPage: true});
  await page.locator('#sessionCompanionFinish').click();
  await expect(page.locator('#sessionFinishDialog')).toBeVisible();
  for (const width of [360, 390, 768, 1280]) {
    await page.setViewportSize({width, height: 800});
    await layout(page, '#sessionFinishDialog');
  }
  await page.setViewportSize({width:360,height:480});
  await layout(page, '#sessionFinishDialog');
  await page.locator('#sessionEvidenceSummary').fill('O índice reduziu a leitura de linhas; comparei os dois planos.');
  await page.locator('#sessionEvidenceDetails').fill('Referência: https://example.invalid/' + 'x'.repeat(200));
  await page.screenshot({path: info.outputPath('finish-mobile.png'), fullPage:true});
  await page.locator('#sessionFinishForm [type="submit"]').click();
  await expect(page.locator('#executionCompletionPanel')).toBeVisible();
  await layout(page, '#executionCompletionPanel');
  await page.screenshot({path: info.outputPath('saved-mobile.png'), fullPage:true});
  for (const width of [360, 390, 768, 1280]) {
    await page.setViewportSize({width, height:800});
    await layout(page, '#executionCompletionPanel');
  }
  const evidence = await page.evaluate(() => structuredClone(state.data.evidence));
  expect(evidence).toHaveLength(1);
  await page.reload();
  await page.waitForFunction(() => globalThis.CompassoFeatures?.installed);
  expect(await page.evaluate(() => state.data.evidence)).toEqual(evidence);
  expect(await page.evaluate(() => state.data.learningOutcomes[0])).toEqual(before);
});

test('pilot keyboard, validation, contrast and reduced motion remain usable', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await open(page);
  await capabilityPlan(page);
  const trigger = page.locator('[data-today-primary-configure]');
  await trigger.focus(); await page.keyboard.press('Enter');
  const dialog = page.locator('#sessionStartDialog');
  await expect(dialog).toBeVisible();
  await page.locator('#sessionStartSubmit').focus(); await page.keyboard.press('Tab');
  await expect(dialog.locator('.close-btn')).toBeFocused();
  await page.keyboard.press('Shift+Tab'); await expect(page.locator('#sessionStartSubmit')).toBeFocused();
  await page.keyboard.press('Escape'); await expect(trigger).toBeFocused();
  await page.locator('[data-today-primary-start]').click();
  await page.locator('#sessionCompanionFinish').click();
  await page.locator('#sessionFinishForm [type="submit"]').click();
  await expect(page.locator('#sessionFinishDialog')).toBeVisible();
  await expect(page.locator('#sessionEvidenceSummary')).toBeFocused();
  await expect(page.locator('#executionCompletionPanel')).toBeHidden();
  const checks = await page.evaluate(() => {
    const luminance = color => {
      const [r,g,b] = color.match(/[\d.]+/g).slice(0,3).map(Number).map(c => {const x=c/255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});
      return .2126*r+.7152*g+.0722*b;
    };
    const ratio = (a,b) => {const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
    const background = node => {for(let n=node;n;n=n.parentElement){const c=getComputedStyle(n).backgroundColor;if(!c.startsWith('rgba') || !c.endsWith(', 0)'))return c;}return 'rgb(255,255,255)';};
    const nodes = [...document.querySelectorAll('#sessionFinishDialog label,#sessionFinishDialog p,#sessionFinishDialog button,#sessionFinishDialog input,#sessionFinishDialog textarea')].filter(n=>n.checkVisibility()&&!n.closest('[hidden]')&&!n.disabled);
    const text = nodes.map(n=>({id:n.id||n.className,ratio:ratio(getComputedStyle(n).color,background(n))}));
    const field=document.getElementById('sessionEvidenceSummary'),style=getComputedStyle(field);
    return {text,focus:ratio(style.outlineColor,background(field)),outline:style.outlineWidth,transition:parseFloat(style.transitionDuration)};
  });
  expect(checks.text.filter(x=>x.ratio<4.5)).toEqual([]);
  expect(checks.focus).toBeGreaterThanOrEqual(3);
  expect(checks.outline).toBe('3px');
  expect(checks.transition).toBeLessThanOrEqual(.00001);
  await page.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});
  await expect(page.locator('#sessionEvidenceSummary')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#sessionFinishDialog')).toBeHidden();
  await expect(page.locator('#sessionCompanion')).toBeVisible();
});

// Captured from unchanged 5c7fb21, Chromium/Windows, 390 and 1280px.
const BASELINE = {"390": {"sessionHistoryDialog": [["H2", "20px", "24px", "rgb(32, 32, 30)", "rgba(0, 0, 0, 0)", "0px", "rgb(32, 32, 30)", "0px", "86.2188px"], ["BUTTON", "16px", "normal", "rgb(32, 32, 30)", "rgb(241, 240, 235)", "0px", "rgb(32, 32, 30)", "1px 6px", "44px"], ["BUTTON", "13px", "normal", "rgb(32, 32, 30)", "rgb(255, 255, 255)", "1px", "rgb(223, 221, 214)", "0px 13px", "356px"]], "historySessionDialog": [["H2", "20px", "24px", "rgb(32, 32, 30)", "rgba(0, 0, 0, 0)", "0px", "rgb(32, 32, 30)", "0px", "245.641px"], ["BUTTON", "16px", "normal", "rgb(32, 32, 30)", "rgb(241, 240, 235)", "0px", "rgb(32, 32, 30)", "1px 6px", "44px"], ["SELECT", "12px", "normal", "rgb(32, 32, 30)", "rgb(255, 255, 255)", "1px", "rgb(223, 221, 214)", "11px 12px", "356px"], ["SELECT", "12px", "normal", "rgb(32, 32, 30)", "rgb(255, 255, 255)", "1px", "rgb(223, 221, 214)", "11px 12px", "356px"], ["INPUT", "12px", "normal", "rgb(32, 32, 30)", "rgb(255, 255, 255)", "1px", "rgb(223, 221, 214)", "11px 12px", "356px"], ["INPUT", "12px", "normal", "rgb(32, 32, 30)", "rgb(255, 255, 255)", "1px", "rgb(223, 221, 214)", "11px 12px", "356px"], ["INPUT", "12px", "normal", "rgb(32, 32, 30)", "rgb(255, 255, 255)", "1px", "rgb(223, 221, 214)", "11px 12px", "356px"], ["SELECT", "12px", "normal", "rgb(32, 32, 30)", "rgb(255, 255, 255)", "1px", "rgb(223, 221, 214)", "11px 12px", "356px"], ["INPUT", "12px", "normal", "rgb(32, 32, 30)", "rgb(255, 255, 255)", "1px", "rgb(223, 221, 214)", "11px 12px", "356px"], ["INPUT", "12px", "normal", "rgb(32, 32, 30)", "rgb(255, 255, 255)", "1px", "rgb(223, 221, 214)", "11px 12px", "356px"], ["BUTTON", "12px", "normal", "rgb(32, 32, 30)", "rgb(255, 255, 255)", "1px", "rgb(223, 221, 214)", "0px 13px", "171.5px"], ["BUTTON", "13px", "normal", "rgb(255, 255, 255)", "rgb(97, 86, 201)", "1px", "rgb(97, 86, 201)", "0px 15px", "175.5px"]], "energyMapDialog": [["H2", "20px", "24px", "rgb(32, 32, 30)", "rgba(0, 0, 0, 0)", "0px", "rgb(32, 32, 30)", "0px", "256.875px"], ["BUTTON", "16px", "normal", "rgb(32, 32, 30)", "rgb(241, 240, 235)", "0px", "rgb(32, 32, 30)", "1px 6px", "44px"], ["P", "12px", "18.6px", "rgb(97, 86, 201)", "rgb(235, 233, 251)", "0px", "rgb(97, 86, 201)", "13px 14px", "356px"], ["INPUT", "16px", "normal", "rgb(32, 32, 30)", "rgb(255, 255, 255)", "1px", "rgb(223, 221, 214)", "11px 12px", "100%"], ["SELECT", "12px", "normal", "rgb(32, 32, 30)", "rgb(255, 255, 255)", "1px", "rgb(223, 221, 214)", "11px 12px", "100%"], ["SELECT", "12px", "normal", "rgb(32, 32, 30)", "rgb(255, 255, 255)", "1px", "rgb(223, 221, 214)", "11px 12px", "100%"], ["SELECT", "12px", "normal", "rgb(32, 32, 30)", "rgb(255, 255, 255)", "1px", "rgb(223, 221, 214)", "11px 12px", "100%"], ["BUTTON", "12px", "normal", "rgb(32, 32, 30)", "rgb(255, 255, 255)", "1px", "rgb(223, 221, 214)", "0px 13px", "auto"], ["BUTTON", "13px", "normal", "rgb(255, 255, 255)", "rgb(97, 86, 201)", "1px", "rgb(97, 86, 201)", "0px 15px", "auto"], ["BUTTON", "13px", "normal", "rgb(32, 32, 30)", "rgb(255, 255, 255)", "1px", "rgb(223, 221, 214)", "0px 13px", "356px"]]}, "1280": {"sessionHistoryDialog": [["H2", "20px", "24px", "rgb(32, 32, 30)", "rgba(0, 0, 0, 0)", "0px", "rgb(32, 32, 30)", "0px", "86.2188px"], ["BUTTON", "16px", "normal", "rgb(32, 32, 30)", "rgb(241, 240, 235)", "0px", "rgb(32, 32, 30)", "1px 6px", "44px"], ["BUTTON", "13px", "normal", "rgb(32, 32, 30)", "rgb(255, 255, 255)", "1px", "rgb(223, 221, 214)", "0px 13px", "66.7188px"]], "historySessionDialog": [["H2", "20px", "24px", "rgb(32, 32, 30)", "rgba(0, 0, 0, 0)", "0px", "rgb(32, 32, 30)", "0px", "245.641px"], ["BUTTON", "16px", "normal", "rgb(32, 32, 30)", "rgb(241, 240, 235)", "0px", "rgb(32, 32, 30)", "1px 6px", "44px"], ["SELECT", "12px", "normal", "rgb(32, 32, 30)", "rgb(255, 255, 255)", "1px", "rgb(223, 221, 214)", "11px 12px", "280.5px"], ["SELECT", "12px", "normal", "rgb(32, 32, 30)", "rgb(255, 255, 255)", "1px", "rgb(223, 221, 214)", "11px 12px", "280.5px"], ["INPUT", "12px", "normal", "rgb(32, 32, 30)", "rgb(255, 255, 255)", "1px", "rgb(223, 221, 214)", "11px 12px", "280.5px"], ["INPUT", "12px", "normal", "rgb(32, 32, 30)", "rgb(255, 255, 255)", "1px", "rgb(223, 221, 214)", "11px 12px", "280.5px"], ["INPUT", "12px", "normal", "rgb(32, 32, 30)", "rgb(255, 255, 255)", "1px", "rgb(223, 221, 214)", "11px 12px", "280.5px"], ["SELECT", "12px", "normal", "rgb(32, 32, 30)", "rgb(255, 255, 255)", "1px", "rgb(223, 221, 214)", "11px 12px", "280.5px"], ["INPUT", "12px", "normal", "rgb(32, 32, 30)", "rgb(255, 255, 255)", "1px", "rgb(223, 221, 214)", "11px 12px", "280.5px"], ["INPUT", "12px", "normal", "rgb(32, 32, 30)", "rgb(255, 255, 255)", "1px", "rgb(223, 221, 214)", "11px 12px", "280.5px"], ["BUTTON", "12px", "normal", "rgb(32, 32, 30)", "rgb(255, 255, 255)", "1px", "rgb(223, 221, 214)", "0px 13px", "74.5781px"], ["BUTTON", "13px", "normal", "rgb(255, 255, 255)", "rgb(97, 86, 201)", "1px", "rgb(97, 86, 201)", "0px 15px", "125.281px"]], "energyMapDialog": [["H2", "20px", "24px", "rgb(32, 32, 30)", "rgba(0, 0, 0, 0)", "0px", "rgb(32, 32, 30)", "0px", "256.875px"], ["BUTTON", "16px", "normal", "rgb(32, 32, 30)", "rgb(241, 240, 235)", "0px", "rgb(32, 32, 30)", "1px 6px", "44px"], ["P", "12px", "18.6px", "rgb(97, 86, 201)", "rgb(235, 233, 251)", "0px", "rgb(97, 86, 201)", "13px 14px", "574px"], ["INPUT", "16px", "normal", "rgb(32, 32, 30)", "rgb(255, 255, 255)", "1px", "rgb(223, 221, 214)", "11px 12px", "100%"], ["SELECT", "12px", "normal", "rgb(32, 32, 30)", "rgb(255, 255, 255)", "1px", "rgb(223, 221, 214)", "11px 12px", "100%"], ["SELECT", "12px", "normal", "rgb(32, 32, 30)", "rgb(255, 255, 255)", "1px", "rgb(223, 221, 214)", "11px 12px", "100%"], ["SELECT", "12px", "normal", "rgb(32, 32, 30)", "rgb(255, 255, 255)", "1px", "rgb(223, 221, 214)", "11px 12px", "100%"], ["BUTTON", "12px", "normal", "rgb(32, 32, 30)", "rgb(255, 255, 255)", "1px", "rgb(223, 221, 214)", "0px 13px", "auto"], ["BUTTON", "13px", "normal", "rgb(255, 255, 255)", "rgb(97, 86, 201)", "1px", "rgb(97, 86, 201)", "0px 15px", "auto"], ["BUTTON", "13px", "normal", "rgb(32, 32, 30)", "rgb(255, 255, 255)", "1px", "rgb(223, 221, 214)", "0px 13px", "66.7188px"]]}};
