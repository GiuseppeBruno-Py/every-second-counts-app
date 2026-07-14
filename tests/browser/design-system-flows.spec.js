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
