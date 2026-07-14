/* Compasso · Comportamento acessível do design system */
(function (root) {
  const model = root.CompassoDesignSystemModel,
    runtime = root.CompassoFeatures;
  if (!model || !runtime) return;
  const focusable =
    'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  const cardSelector =
    ".item-card,.ia-card,.today-panel,.journal-panel,.weekly-panel,.analytics-panel,.capture-card";
  const menuSelector = '.ux-menu,.journal-menu,[role="menu"]';
  const tabsSelector =
    '.ux-mode-tabs,.capture-atlas-tabs,.journal-tabs,[role="tablist"]';
  let sequence = 0,
    observer;
  function text(button) {
    return String(button.textContent || "")
      .replace(/\s+/g, " ")
      .trim();
  }
  function enhanceButton(button) {
    if (button.dataset.dsComponent) return;
    const iconOnly =
      !text(button) ||
      Boolean(
        button.getAttribute("aria-label") &&
          button.querySelector("svg") &&
          text(button).length < 2,
      );
    button.dataset.dsComponent = iconOnly ? "icon-button" : "button";
    button.dataset.dsRole = model.inferButton(button);
    if (iconOnly && !button.getAttribute("aria-label"))
      button.setAttribute("aria-label", "Ação");
    if (button.matches("[data-ux-more]")) {
      button.setAttribute("aria-haspopup", "menu");
      button.setAttribute(
        "aria-expanded",
        String(Boolean(button.parentElement?.querySelector(".ux-menu.open"))),
      );
    }
  }
  function enhanceField(field) {
    field.dataset.dsComponent = field.tagName === "SELECT" ? "select" : "field";
    if (field.required) field.setAttribute("aria-required", "true");
  }
  function enhanceTabs(list) {
    list.dataset.dsComponent = "tabs";
    list.setAttribute("role", "tablist");
    const tabs = [...list.querySelectorAll('button,[role="tab"]')];
    tabs.forEach((tab, index) => {
      tab.setAttribute("role", "tab");
      const selected =
        tab.classList.contains("active") ||
        tab.getAttribute("aria-selected") === "true";
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected
        ? 0
        : tabs.some((item) => item.classList.contains("active"))
          ? -1
          : index
            ? -1
            : 0;
    });
  }
  function enhanceMenu(menu) {
    menu.dataset.dsComponent = "menu";
    menu.setAttribute("role", "menu");
    menu.querySelectorAll("button,a").forEach((item) => {
      item.setAttribute("role", "menuitem");
      if (!item.hasAttribute("tabindex")) item.tabIndex = -1;
    });
  }
  function enhanceDialog(dialog) {
    if (dialog.dataset.dsComponent) return;
    dialog.dataset.dsComponent = matchMedia("(max-width: 767px)").matches
      ? "drawer"
      : "dialog";
    dialog.setAttribute("aria-modal", "true");
    const heading = dialog.querySelector("h1,h2,h3");
    if (heading && !dialog.getAttribute("aria-labelledby")) {
      heading.id ||= `ds-dialog-title-${++sequence}`;
      dialog.setAttribute("aria-labelledby", heading.id);
    }
    dialog.addEventListener("close", () => {
      const opener = dialog._dsOpener;
      delete dialog._dsOpener;
      opener?.focus?.();
    });
  }
  function enhance(rootNode = document) {
    const query = (selector) => [
      ...(rootNode.matches?.(selector) ? [rootNode] : []),
      ...(rootNode.querySelectorAll?.(selector) || []),
    ];
    query("button").forEach(enhanceButton);
    query("input,select,textarea").forEach(enhanceField);
    query(cardSelector).forEach((card) => (card.dataset.dsComponent = "card"));
    query(".journal-empty,.ux-empty,.ia-empty").forEach(
      (empty) => (empty.dataset.dsComponent = "empty-state"),
    );
    query(".nav-badge,.capture-count,.journal-chip").forEach(
      (badge) => (badge.dataset.dsComponent = "badge"),
    );
    query(".toast").forEach((toast) => (toast.dataset.dsComponent = "toast"));
    query("dialog").forEach(enhanceDialog);
    query(tabsSelector).forEach(enhanceTabs);
    query(menuSelector).forEach(enhanceMenu);
  }
  function items(container) {
    return [...container.querySelectorAll(focusable)].filter(
      (item) => !item.hidden && item.getClientRects().length,
    );
  }
  function cycle(container, event) {
    const available = items(container);
    if (!available.length) return;
    const first = available[0],
      last = available.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  function move(container, event) {
    const available = [
      ...container.querySelectorAll('[role="tab"],[role="menuitem"]'),
    ].filter((item) => !item.disabled && item.getClientRects().length);
    if (!available.length) return;
    const horizontal = container.getAttribute("role") === "tablist";
    const keys = horizontal
      ? ["ArrowLeft", "ArrowRight"]
      : ["ArrowUp", "ArrowDown"];
    if (![...keys, "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let index = available.indexOf(document.activeElement);
    if (event.key === "Home") index = 0;
    else if (event.key === "End") index = available.length - 1;
    else
      index =
        (index + (event.key === keys[1] ? 1 : -1) + available.length) %
        available.length;
    available[index].focus();
    if (horizontal) available[index].click();
  }
  function setLoading(button, loading, label = "Carregando") {
    if (!button) return;
    if (loading) {
      button.dataset.dsPreviousLabel = button.getAttribute("aria-label") || "";
      button.setAttribute("aria-busy", "true");
      button.setAttribute("aria-label", label);
      button.disabled = true;
    } else {
      button.removeAttribute("aria-busy");
      button.disabled = false;
      const previous = button.dataset.dsPreviousLabel;
      if (previous) button.setAttribute("aria-label", previous);
      else button.removeAttribute("aria-label");
      delete button.dataset.dsPreviousLabel;
    }
  }
  function toast(message, tone = "neutral") {
    const target = document.getElementById("toast");
    if (target)
      target.dataset.tone = ["success", "error", "warning"].includes(tone)
        ? tone
        : "neutral";
    root.showToast?.(message);
  }
  function install() {
    document.body.classList.add("ds-installed");
    enhance();
    observer = new MutationObserver((records) =>
      records.forEach((record) =>
        record.addedNodes.forEach((node) => {
          if (node.nodeType === 1) enhance(node);
        }),
      ),
    );
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      const tabs = button.closest(tabsSelector);
      if (tabs) queueMicrotask(() => enhanceTabs(tabs));
      if (button.matches("[data-ux-more]"))
        queueMicrotask(() => {
          const menu = button.parentElement?.querySelector(".ux-menu");
          const open = Boolean(menu?.classList.contains("open"));
          button.setAttribute("aria-expanded", String(open));
          if (open) items(menu)[0]?.focus();
        });
      queueMicrotask(() =>
        document.querySelectorAll("dialog[open]").forEach((dialog) => {
          dialog._dsOpener ||= button;
          enhanceDialog(dialog);
        }),
      );
    });
    document.addEventListener("keydown", (event) => {
      const dialog = event.target.closest("dialog[open]");
      if (event.key === "Tab" && dialog) return cycle(dialog, event);
      const group = event.target.closest('[role="tablist"],[role="menu"]');
      if (group) move(group, event);
      if (event.key === "Escape")
        document
          .querySelectorAll("details[open]")
          .forEach((detail) => detail.removeAttribute("open"));
    });
  }
  install();
  runtime.on("view:changed", () => queueMicrotask(() => enhance()));
  runtime.register("design-system", {
    order: 1400,
    afterRender: enhance,
    afterGrid: enhance,
  });
  root.CompassoDesignSystem = Object.freeze({
    model,
    enhance,
    setLoading,
    toast,
    components: model.components,
    breakpoints: model.breakpoints,
  });
})(globalThis);
