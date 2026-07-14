const { test, expect } = require("@playwright/test");

async function open(page) {
  await page.route(/^https?:\/(?!\/127\.0\.0\.1)/, (route) => route.abort());
  await page.goto("/?view=study", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () =>
      globalThis.CompassoFeatures?.installed &&
      globalThis.CompassoDesignSystem &&
      document.body.classList.contains("ds-installed"),
  );
  await page.waitForSelector("#studyGrid .item-card");
}

test("contrato central aprimora componentes dinâmicos sem CSS injetado", async ({
  page,
}) => {
  await open(page);
  const result = await page.evaluate(() => ({
    components: globalThis.CompassoDesignSystem.components,
    breakpoints: globalThis.CompassoDesignSystem.breakpoints,
    card: document.querySelector("#studyGrid .item-card")?.dataset.dsComponent,
    execute: document.querySelector("#studyGrid .ux-execute")?.dataset.dsRole,
    runtimeUxCss: [...document.head.querySelectorAll("style")].some((style) =>
      style.textContent.includes(".ux-card-actions"),
    ),
  }));
  expect(result.components).toContain("drawer");
  expect(result.breakpoints).toEqual({
    mobile: 360,
    tablet: 768,
    desktop: 1280,
  });
  expect(result.card).toBe("card");
  expect(result.execute).toBe("primary");
  expect(result.runtimeUxCss).toBe(false);
});

test("tabs, menu e diálogo oferecem navegação completa por teclado", async ({
  page,
}) => {
  await open(page);
  await page.locator("#settingsBtn").click();
  await page.locator('[data-ux-mode="essential"]').focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator('[data-ux-mode="knowledge"]')).toBeFocused();
  await expect(page.locator('[data-ux-mode="knowledge"]')).toHaveAttribute(
    "aria-selected",
    "true",
  );

  const trigger = page.locator("#studyGrid [data-ux-more]").first();
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.locator('#studyGrid .ux-menu.open [role="menuitem"]').first(),
  ).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(
    page.locator('#studyGrid .ux-menu.open [role="menuitem"]').nth(1),
  ).toBeFocused();

  await page.locator("#studyGrid .ux-execute").first().click();
  const dialog = page.locator("#uxExecutionDialog");
  await expect(dialog).toHaveAttribute("aria-modal", "true");
  await expect(dialog).toHaveAttribute("aria-labelledby", "uxExecutionTitle");
  await dialog.locator("button").last().focus();
  await page.keyboard.press("Tab");
  await expect(dialog.locator("button").first()).toBeFocused();
});

test("estados de carregamento e redução de movimento são acessíveis", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page);
  const state = await page.evaluate(() => {
    const button = document.querySelector("#studyGrid .ux-execute");
    const transition = getComputedStyle(button).transitionDuration;
    globalThis.CompassoDesignSystem.setLoading(
      button,
      true,
      "Iniciando sessão",
    );
    const loading = {
      busy: button.getAttribute("aria-busy"),
      label: button.getAttribute("aria-label"),
      disabled: button.disabled,
    };
    globalThis.CompassoDesignSystem.setLoading(button, false);
    return {
      transition,
      loading,
      restored: !button.disabled && !button.hasAttribute("aria-busy"),
    };
  });
  expect(Number.parseFloat(state.transition)).toBeLessThanOrEqual(0.00001);
  expect(state.loading).toEqual({
    busy: "true",
    label: "Iniciando sessão",
    disabled: true,
  });
  expect(state.restored).toBe(true);
});

test("snapshots responsivos de 360, 768 e 1280 px não têm overflow", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "snapshots do viewport desktop controlado",
  );
  for (const width of [360, 768, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    await open(page);
    const layout = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth,
      cards: getComputedStyle(
        document.querySelector("#studyGrid"),
      ).gridTemplateColumns.split(" ").length,
      dialogMode:
        document.querySelector("#uxExecutionDialog")?.dataset.dsComponent,
    }));
    expect(layout.viewport).toBe(width);
    expect(layout.document).toBeLessThanOrEqual(width + 1);
    expect(layout.dialogMode).toBe(width < 768 ? "drawer" : "dialog");
    await expect(page).toHaveScreenshot(`design-system-${width}.png`, {
      animations: "disabled",
      caret: "hide",
      fullPage: false,
      maxDiffPixelRatio: 0.02,
    });
  }
});

test("botões escuros mantêm contraste e ações globais têm hierarquia distinta", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "validação do tema móvel");
  await open(page);
  const result = await page.evaluate(() => {
    const rgb = (value) =>
      (value.match(/[\d.]+/g) || [0, 0, 0]).slice(0, 3).map(Number);
    const luminance = (value) => {
      const channel = (item) => {
        const normalized = item / 255;
        return normalized <= 0.04045
          ? normalized / 12.92
          : ((normalized + 0.055) / 1.055) ** 2.4;
      };
      const [red, green, blue] = rgb(value).map(channel);
      return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    };
    const contrast = (foreground, background) => {
      const light = Math.max(luminance(foreground), luminance(background));
      const dark = Math.min(luminance(foreground), luminance(background));
      return (light + 0.05) / (dark + 0.05);
    };
    const sidebar = getComputedStyle(document.querySelector(".sidebar"));
    const navContrast = [
      ...document.querySelectorAll(".ia-primary-nav .nav-item"),
    ].map((button) =>
      contrast(getComputedStyle(button).color, sidebar.backgroundColor),
    );
    const register = getComputedStyle(
      document.getElementById("captureGlobalBtn"),
    );
    const execute = getComputedStyle(document.getElementById("iaExecuteBtn"));
    return {
      navContrast,
      register: { background: register.backgroundColor, color: register.color },
      execute: { background: execute.backgroundColor, color: execute.color },
    };
  });
  expect(Math.min(...result.navContrast)).toBeGreaterThanOrEqual(4.5);
  expect(result.register.background).not.toBe(result.execute.background);
  expect(result.register.color).not.toBe(result.execute.color);
});

test("timer móvel nasce acima da navegação e pode ser arrastado com segurança", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "interação móvel");
  await open(page);
  await page.locator("#studyGrid .ux-execute").first().click();
  await page.locator('[data-ux-run="ideal"]').click();
  await page
    .locator("#sessionStartForm")
    .evaluate((form) => form.requestSubmit());
  const companion = page.locator("#sessionCompanion");
  await expect(companion).toBeVisible();
  const initial = await page.evaluate(() => {
    const timer = document
      .getElementById("sessionCompanion")
      .getBoundingClientRect();
    const nav = document.querySelector(".sidebar").getBoundingClientRect();
    return { top: timer.top, bottom: timer.bottom, navTop: nav.top };
  });
  expect(initial.bottom).toBeLessThanOrEqual(initial.navTop - 8);
  const handle = await page.locator("#sessionCompanionOpen").boundingBox();
  await page.mouse.move(
    handle.x + handle.width / 2,
    handle.y + handle.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(handle.x + handle.width / 2, handle.y - 110, {
    steps: 5,
  });
  await page.mouse.up();
  const moved = await companion.boundingBox();
  expect(moved.y).toBeLessThan(initial.top - 80);
  const navTop = await page
    .locator(".sidebar")
    .evaluate((nav) => nav.getBoundingClientRect().top);
  expect(moved.y + moved.height).toBeLessThanOrEqual(navTop - 8);
});
