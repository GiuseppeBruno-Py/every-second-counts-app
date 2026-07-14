/* Compasso · Consolidação da experiência e hierarquia visual */
const uxModel = globalThis.CompassoUxModel;
const UX_MODE_KEY = "compasso.ux.mode.v1";
let uxMode = uxModel.mode(localStorage.getItem(UX_MODE_KEY));
const uxRuntime = { selected: null, ritualId: null };
function uxInstall() {
  settingsMenu.insertAdjacentHTML(
    "beforeend",
    `<div class="ux-mode-row"><strong>Nível da interface</strong><div class="ux-mode-tabs"><button type="button" data-ux-mode="essential">Essencial</button><button type="button" data-ux-mode="knowledge">Conhecimento</button><button type="button" data-ux-mode="advanced">Avançado</button></div></div>`,
  );
  document.body.insertAdjacentHTML(
    "beforeend",
    `<dialog id="uxExecutionDialog" class="ux-execution-dialog"><form method="dialog"><div class="today-dialog-head"><div><div class="eyebrow">Uma entrada para executar</div><h2 id="uxExecutionTitle">Como você quer começar?</h2></div><button class="quiet-btn" value="cancel">Fechar</button></div><div id="uxExecutionBody" class="ux-execution-body"></div></form></dialog>`,
  );
}
function uxApplyMode() {
  document
    .querySelectorAll("[data-ux-mode]")
    .forEach((b) => b.classList.toggle("active", b.dataset.uxMode === uxMode));
  document.querySelectorAll(".sidebar .nav-item").forEach((b) => {
    const level = b.dataset.uxLevel || "essential";
    b.classList.toggle("ux-nav-hidden", !uxModel.visible(level, uxMode));
  });
}
function uxEnhanceCard(card) {
  const actions = card.querySelector(".card-actions");
  if (!actions || actions.classList.contains("ux-card-actions")) return;
  const edit = card.querySelector("[data-edit]");
  if (!edit) return;
  const ref = edit.dataset.edit;
  const existing = Array.from(actions.querySelectorAll(":scope > button"));
  const pick = (role) =>
    existing.find((b) => uxModel.actionRole(b.dataset) === role);
  const note = pick("note"),
    progress = pick("progress"),
    complete = pick("complete");
  const menu = document.createElement("div");
  menu.className = "ux-menu";
  existing
    .filter(
      (b) =>
        ![note, progress, complete].includes(b) &&
        uxModel.actionRole(b.dataset) !== "execute",
    )
    .forEach((b) => menu.appendChild(b));
  actions.innerHTML = "";
  actions.classList.add("ux-card-actions");
  actions.insertAdjacentHTML(
    "beforeend",
    `<button type="button" class="ux-btn ux-execute" data-ux-execute="${ref}">▶ Executar</button>`,
  );
  if (note) {
    note.className = "ux-btn ux-note";
    note.textContent = "Nota";
    actions.appendChild(note);
  }
  if (progress) {
    progress.className = "ux-btn ux-progress";
    progress.textContent = "Progresso";
    actions.appendChild(progress);
  }
  if (complete) {
    complete.className = "ux-btn ux-complete";
    complete.textContent =
      complete.dataset.reopen !== undefined ? "Reabrir" : "Concluir";
    actions.appendChild(complete);
  }
  actions.insertAdjacentHTML(
    "beforeend",
    '<button type="button" class="ux-btn ux-more" data-ux-more aria-label="Mais opções">•••</button>',
  );
  if (!menu.children.length)
    menu.innerHTML = '<div class="ux-empty">Nenhuma opção adicional.</div>';
  actions.appendChild(menu);
}
function uxEnhance() {
  ["reading", "study", "goal"].forEach((d) =>
    document.querySelectorAll(`#${d}Grid .item-card`).forEach(uxEnhanceCard),
  );
  uxApplyMode();
}
CompassoFeatures.register("ux-consolidation", {
  order: 1000,
  afterRender: uxEnhance,
});
function uxOpenExecution(domain, itemId) {
  const item = state.data[domain]?.find((x) => x.id === itemId);
  if (!item) return;
  uxRuntime.selected = { domain, itemId };
  uxRuntime.ritualId = item.ritualId || "";
  uxExecutionTitle.textContent = item.title;
  const canSession = ["reading", "study"].includes(domain);
  const minimum = item.minimumVersion;
  const contingencies = (item.contingencies || []).filter((x) => x.enabled);
  const rituals = (state.data.ritualTemplates || []).filter((x) => !x.archived);
  uxExecutionBody.innerHTML = `<label class="ux-empty"><strong>Ritual desta execução</strong><select id="uxExecutionRitual"><option value="">Sem ritual</option>${rituals.map((r) => `<option value="${r.id}" ${r.id === uxRuntime.ritualId ? "selected" : ""}>${escapeHtml(r.name)}</option>`).join("")}</select><span>Aplicado apenas a esta sessão; não altera a ação silenciosamente.</span></label>${canSession ? `<button type="button" class="ux-execution-option ux-ideal" data-ux-run="ideal"><span class="mark">▶</span><span><strong>Sessão rápida</strong><span>Cronômetro e progresso, seguindo o plano original.</span></span></button>` : ""}${minimum && canSession ? `<button type="button" class="ux-execution-option ux-minimum" data-ux-run="minimum"><span class="mark">M</span><span><strong>Versão mínima</strong><span>${escapeHtml(minimum.description || "Executar o menor passo útil")}${minimum.estimatedMinutes ? ` · ${minimum.estimatedMinutes} min` : ""}.</span></span></button>` : ""}${contingencies.map((c) => `<button type="button" class="ux-execution-option ux-planb" data-ux-run="contingency:${c.id}"><span class="mark">B</span><span><strong>Contingência aplicável</strong><span>Se ${escapeHtml(c.condition)}, então ${escapeHtml(c.response)}.</span></span></button>`).join("")}<button type="button" class="ux-execution-option ux-deep" data-ux-run="deep"><span class="mark">D</span><span><strong>Deep Work</strong><span>Tela focada, objetivo, ritual, distrações e encerramento.</span></span></button>`;
  uxExecutionRitual.onchange = () =>
    (uxRuntime.ritualId = uxExecutionRitual.value);
  uxExecutionDialog.showModal();
}
function uxRun(value) {
  const s = uxRuntime.selected;
  if (!s) return;
  uxExecutionDialog.close();
  if (value === "deep") {
    deepOpen(s.domain, s.itemId);
    requestAnimationFrame(() => {
      if (globalThis.ritualSessionSelect) {
        ritualSessionSelect.value = uxRuntime.ritualId;
        ritualSessionSelect.dispatchEvent(new Event("change"));
      }
    });
    return;
  }
  if (!["reading", "study"].includes(s.domain))
    return showToast("Use Deep Work para esta ação");
  openSessionStart(s.domain, s.itemId);
  requestAnimationFrame(() => {
    const select = document.getElementById("sessionVariant");
    if (select) {
      select.value = value;
      select.dispatchEvent(new Event("change"));
    }
  });
}
uxInstall();
CompassoFeatures.action("[data-ux-mode]", ({ target }) => {
  uxMode = uxModel.mode(target.dataset.uxMode);
  localStorage.setItem(UX_MODE_KEY, uxMode);
  uxApplyMode();
  showToast(`Interface: ${target.textContent}`);
});
CompassoFeatures.action("[data-ux-execute]", ({ target }) => {
  const [d, id] = target.dataset.uxExecute.split(":");
  uxOpenExecution(d, id);
});
CompassoFeatures.action("[data-ux-more]", ({ target }) => {
  const menu = target.parentElement.querySelector(".ux-menu");
  document.querySelectorAll(".ux-menu.open").forEach((x) => {
    if (x !== menu) x.classList.remove("open");
  });
  menu?.classList.toggle("open");
});
CompassoFeatures.action("[data-ux-run]", ({ target }) =>
  uxRun(target.dataset.uxRun),
);
sessionStartForm.addEventListener("submit", () =>
  queueMicrotask(() => {
    const session = sessionActive(),
      ritual = (state.data.ritualTemplates || []).find(
        (x) => x.id === uxRuntime.ritualId,
      );
    if (session && ritual && !session.ritualSnapshot) {
      session.ritualSnapshot = ritualModel.snapshot(ritual);
      session.updatedAt = new Date().toISOString();
      window.CompassoStorage?.save?.(STORAGE_KEY, state.data);
    }
  }),
);
CompassoFeatures.install();
