/* Compasso · Companheiro compacto de sessão e Deep Work */
(function installSessionCompanion() {
  const originalTitle = document.title;
  const runtime = {
    timer: null,
    notificationKey: null,
    pipWindow: null,
    permissionAsked: false,
    drag: null,
    position: null,
    suppressOpen: false,
  };

  function activity() {
    const canonical = typeof executionActive === "function" ? executionActive() : null;
    if (!canonical) return null;
    if (canonical.source?.collection === "deepWorkSessions") {
      const deep = state.data.deepWorkSessions?.find(session => session.id === canonical.source.id);
      if (!deep) return null;
      const item = typeof deepItem === "function" ? deepItem(deep) : null;
      return {
        id: `deep:${deep.id}`,
        kind: "deep",
        label: deep.state === "finishing" ? "Deep Work · tempo congelado" : deep.state === "paused" ? "Deep Work pausado" : "Deep Work",
        title: item?.title || "Sessão focada",
        status: deep.state,
        elapsedMs: deepModel.elapsedMs(deep),
        domain: deep.domain,
      };
    }
    const session = state.data.sessions?.find(candidate => candidate.id === canonical.source?.id);
    if (!session) return null;
    const item =
      typeof sessionItem === "function" ? sessionItem(session) : null;
    return {
      id: `session:${session.id}`,
      kind: "session",
      label:
        session.status === "finishing" ? "Sessão · tempo congelado" : session.status === "paused" ? "Sessão pausada" : "Sessão em andamento",
      title: item?.title || "Item removido",
      status: session.status,
      elapsedMs: sessionElapsedMs(session),
      domain: session.domain,
    };
  }
  function clock(ms) {
    const seconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(seconds / 3600),
      minutes = Math.floor((seconds % 3600) / 60),
      rest = seconds % 60;
    return hours
      ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`
      : `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
  }
  function installUi() {
    if (document.getElementById("sessionCompanion")) return;
    document.body.insertAdjacentHTML(
      "beforeend",
      `<aside id="sessionCompanion" class="session-companion" hidden aria-live="polite"><button type="button" class="session-companion-main" id="sessionCompanionOpen" title="Toque para abrir; arraste para mover" aria-description="No celular, arraste para reposicionar sem cobrir a navegação"><span class="session-companion-dot"></span><span class="session-companion-copy"><small id="sessionCompanionLabel">Sessão em andamento</small><strong id="sessionCompanionTitle"></strong></span><time id="sessionCompanionTime">00:00</time></button><div class="session-companion-actions"><button type="button" id="sessionCompanionPause" aria-label="Pausar sessão" title="Pausar ou retomar">Ⅱ</button><button type="button" id="sessionCompanionFinish" aria-label="Concluir sessão" title="Concluir sessão">✓</button><button type="button" id="sessionCompanionFloat" aria-label="Abrir janela flutuante" title="Manter sobre outras janelas">▣</button></div></aside>`,
    );
    sessionCompanionOpen.addEventListener("click", (event) => {
      if (runtime.suppressOpen) {
        runtime.suppressOpen = false;
        event.preventDefault();
        return;
      }
      openActivity();
    });
    sessionCompanionOpen.addEventListener("pointerdown", startDrag);
    sessionCompanionPause.addEventListener("click", togglePause);
    sessionCompanionFinish.addEventListener("click", finishActivity);
    sessionCompanionFloat.addEventListener("click", openPictureInPicture);
    sessionCompanionFloat.hidden = !("documentPictureInPicture" in window);
  }
  function dragBounds(companion) {
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight =
      window.visualViewport?.height || document.documentElement.clientHeight;
    const nav = document.querySelector(".sidebar");
    const navRect = nav?.getBoundingClientRect();
    const margin = 12,
      gap = 10;
    const safeBottom =
      navRect && navRect.top > 0 && navRect.top < viewportHeight
        ? navRect.top - gap
        : viewportHeight - margin;
    return {
      minX: margin,
      maxX: Math.max(margin, viewportWidth - companion.offsetWidth - margin),
      minY: margin,
      maxY: Math.max(margin, safeBottom - companion.offsetHeight),
    };
  }
  function applyDragPosition(x, y) {
    const companion = document.getElementById("sessionCompanion");
    if (!companion || matchMedia("(min-width: 521px)").matches) return;
    const bounds = dragBounds(companion);
    runtime.position = {
      x: Math.min(bounds.maxX, Math.max(bounds.minX, x)),
      y: Math.min(bounds.maxY, Math.max(bounds.minY, y)),
    };
    companion.style.left = `${runtime.position.x}px`;
    companion.style.top = `${runtime.position.y}px`;
    companion.style.right = "auto";
    companion.style.bottom = "auto";
  }
  function finishDrag(event) {
    const companion = document.getElementById("sessionCompanion");
    if (!runtime.drag || event.pointerId !== runtime.drag.pointerId) return;
    if (runtime.drag.moved) runtime.suppressOpen = true;
    companion?.classList.remove("dragging");
    runtime.drag = null;
  }
  function startDrag(event) {
    if (matchMedia("(min-width: 521px)").matches || event.button > 0) return;
    const handle = event.currentTarget,
      companion = document.getElementById("sessionCompanion"),
      rect = companion.getBoundingClientRect();
    runtime.drag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      left: rect.left,
      top: rect.top,
      moved: false,
    };
    handle.setPointerCapture?.(event.pointerId);
    const move = (moveEvent) => {
      if (!runtime.drag || moveEvent.pointerId !== runtime.drag.pointerId)
        return;
      const dx = moveEvent.clientX - runtime.drag.startX,
        dy = moveEvent.clientY - runtime.drag.startY;
      if (!runtime.drag.moved && Math.hypot(dx, dy) < 5) return;
      runtime.drag.moved = true;
      companion.classList.add("dragging");
      applyDragPosition(runtime.drag.left + dx, runtime.drag.top + dy);
    };
    const end = (endEvent) => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", end);
      handle.removeEventListener("pointercancel", end);
      finishDrag(endEvent);
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
  }
  function openActivity() {
    const current = activity();
    if (!current) return;
    if (current.kind === "deep") {
      if (!deepDialog.open) deepDialog.showModal();
      deepTick();
      const session = deepActive();
      if (session?.state === "finishing") deepShowFinish(session.finishingKind || "complete");
      return;
    }
    if (labels[current.domain]) switchView(current.domain);
  }
  function togglePause() {
    const current = activity();
    if (!current) return;
    if (current.kind === "deep") deepPause.click();
    else toggleSessionPause();
    queueMicrotask(render);
  }
  function finishActivity() {
    const current = activity();
    if (!current) return;
    if (current.kind === "deep") {
      deepComplete.click();
      return;
    }
    openSessionFinish();
  }
  function pipMarkup(current) {
    return `<main><span></span><div><small>${escapeHtml(current.label)}</small><strong>${escapeHtml(current.title)}</strong></div><time id="pipClock">${clock(current.elapsedMs)}</time></main><button id="pipReturn">Voltar ao Compasso</button>`;
  }
  function updatePip(current) {
    const pip = runtime.pipWindow;
    if (!pip || pip.closed) {
      runtime.pipWindow = null;
      return;
    }
    if (!current) {
      pip.close();
      runtime.pipWindow = null;
      return;
    }
    const label = pip.document.querySelector("small"),
      title = pip.document.querySelector("strong"),
      time = pip.document.getElementById("pipClock");
    if (label) label.textContent = current.label;
    if (title) title.textContent = current.title;
    if (time) time.textContent = clock(current.elapsedMs);
  }
  async function openPictureInPicture() {
    const current = activity();
    if (!current || !("documentPictureInPicture" in window))
      return showToast("Janela flutuante indisponível neste navegador");
    try {
      if (runtime.pipWindow && !runtime.pipWindow.closed)
        return runtime.pipWindow.focus();
      const pip = await window.documentPictureInPicture.requestWindow({
        width: 320,
        height: 132,
      });
      runtime.pipWindow = pip;
      const doc = pip.document;
      doc.head.innerHTML = `<title>Compasso · sessão ativa</title><style>*{box-sizing:border-box}body{margin:0;padding:12px;background:#252521;color:#fff;font-family:system-ui,sans-serif}main{display:grid;grid-template-columns:9px minmax(0,1fr) auto;gap:9px;align-items:center}main>span{width:8px;height:8px;border-radius:50%;background:#8e82ff;box-shadow:0 0 0 4px #8e82ff24}small,strong{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}small{color:#aaa79f;font-size:8px;text-transform:uppercase;letter-spacing:.1em}strong{font-size:12px;margin-top:4px}time{font-size:18px;font-weight:800}button{width:100%;margin-top:12px;height:32px;border:1px solid #55544d;border-radius:8px;background:#34342f;color:#fff;font-weight:700}</style>`;
      doc.body.innerHTML = pipMarkup(current);
      doc.getElementById("pipReturn").onclick = () => {
        window.focus();
        openActivity();
      };
      pip.addEventListener("pagehide", () => {
        runtime.pipWindow = null;
      });
    } catch {
      showToast("Não foi possível abrir a janela flutuante");
    }
  }
  async function closeNotifications() {
    if (!("serviceWorker" in navigator)) return;
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const notifications = await registration?.getNotifications?.({
        tag: "compasso-active-session",
      });
      notifications?.forEach((item) => item.close());
    } catch {}
    runtime.notificationKey = null;
  }
  async function showNotification(current, force = false) {
    if (
      !current ||
      !("Notification" in window) ||
      Notification.permission !== "granted" ||
      !("serviceWorker" in navigator)
    )
      return;
    const key = `${current.id}:${current.status}`;
    if (!force && runtime.notificationKey === key) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(current.label, {
        body: `${current.title} · volte ao Compasso quando concluir.`,
        icon: "./compasso-icon-192.png",
        badge: "./compasso-icon-192.png",
        tag: "compasso-active-session",
        renotify: false,
        requireInteraction: true,
        silent: true,
        data: { url: "./" },
      });
      runtime.notificationKey = key;
    } catch {}
  }
  async function requestReminderPermission() {
    if (
      runtime.permissionAsked ||
      !("Notification" in window) ||
      Notification.permission !== "default"
    )
      return;
    runtime.permissionAsked = true;
    try {
      if ((await Notification.requestPermission()) === "granted")
        showNotification(activity(), true);
    } catch {}
  }
  function updateBadge(current) {
    if (!("setAppBadge" in navigator)) return;
    if (current) navigator.setAppBadge(1).catch(() => {});
    else if ("clearAppBadge" in navigator)
      navigator.clearAppBadge().catch(() => {});
  }
  function render() {
    installUi();
    const current = activity(),
      companion = document.getElementById("sessionCompanion");
    companion.hidden = !current;
    if (!current) {
      document.title = originalTitle;
      clearInterval(runtime.timer);
      runtime.timer = null;
      updatePip(null);
      updateBadge(null);
      closeNotifications();
      return;
    }
    companion.classList.toggle("paused", current.status === "paused");
    companion.classList.toggle("deep", current.kind === "deep");
    sessionCompanionLabel.textContent = current.label;
    sessionCompanionTitle.textContent = current.title;
    sessionCompanionTime.textContent = clock(current.elapsedMs);
    sessionCompanionPause.textContent =
      current.status === "finishing" ? "■" : current.status === "paused" ? "▶" : "Ⅱ";
    sessionCompanionPause.disabled = current.status === "finishing";
    sessionCompanionPause.setAttribute(
      "aria-label",
      current.status === "paused" ? "Retomar sessão" : "Pausar sessão",
    );
    sessionCompanionFinish.hidden = false;
    sessionCompanionFinish.setAttribute(
      "aria-label",
      current.kind === "deep" ? "Concluir Deep Work" : "Concluir sessão",
    );
    sessionCompanionFinish.setAttribute(
      "title",
      current.kind === "deep" ? "Concluir Deep Work" : "Concluir sessão",
    );
    document.title = `● ${current.kind === "deep" ? "Deep Work" : "Sessão"} · ${current.title}`;
    updatePip(current);
    updateBadge(current);
    showNotification(current);
    if (["paused", "finishing"].includes(current.status)) {
      clearInterval(runtime.timer);
      runtime.timer = null;
    } else if (!runtime.timer) runtime.timer = setInterval(render, 1000);
  }

  installUi();
  CompassoFeatures.register("session-companion", {
    order: 45,
    afterRender: render,
  });
  sessionStartForm.addEventListener("submit", requestReminderPermission);
  deepStart.addEventListener("click", requestReminderPermission);
  document.addEventListener("visibilitychange", () => {
    const current = activity();
    if (document.hidden && current) showNotification(current, true);
  });
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) queueMicrotask(render);
  });
  window.addEventListener("resize", () => {
    if (runtime.position)
      applyDragPosition(runtime.position.x, runtime.position.y);
  });
  render();
})();
