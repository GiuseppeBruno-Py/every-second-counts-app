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
    encoding: { executionId: null, stage: "closed", operation: null, surface: null, originId: null },
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
        learningContext: deep.learningContext || null,
        ritualSnapshot: deep.ritualSnapshot || null,
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
      learningContext: session.learningContext || null,
      ritualSnapshot: session.ritualSnapshot || null,
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
  const encodingOperations = Object.freeze({
    connect: { label: "Conectar", instruction: "Relacione a ideia a algo que você já conhece." },
    contrast: { label: "Contrastar", instruction: "Compare com uma ideia relacionada, diferente ou oposta." },
    organize: { label: "Organizar", instruction: "Identifique a estrutura: partes, grupos, níveis ou relações." },
  });
  function encodingPrefix(surface) { return surface === "deep" ? "deepEncoding" : "sessionEncoding"; }
  function encodingElements(surface) {
    const prefix=encodingPrefix(surface);
    return { shell:document.getElementById(`${prefix}Shell`),trigger:document.getElementById(`${prefix}Trigger`),orientation:document.getElementById(`${prefix}Orientation`),orientationList:document.getElementById(`${prefix}OrientationList`),panel:document.getElementById(`${prefix}Panel`),reconstruct:document.getElementById(`${prefix}Reconstruct`),operation:document.getElementById(`${prefix}Operation`),reconstructHeading:document.getElementById(`${prefix}ReconstructHeading`),operationHeading:document.getElementById(`${prefix}OperationHeading`),instruction:document.getElementById(`${prefix}Instruction`),returnButton:document.getElementById(`${prefix}Return`) };
  }
  function encodingMarkup(surface) {
    const prefix=encodingPrefix(surface),name=`${prefix}Choice`;
    return `<div class="encoding-checkpoint ${surface==='deep'?'encoding-checkpoint-deep':''}" id="${prefix}Shell" hidden><button type="button" class="encoding-trigger" id="${prefix}Trigger" aria-controls="${prefix}Panel" aria-expanded="false">Pausa para processar</button><details class="encoding-orientation" id="${prefix}Orientation" hidden><summary>Orientação do ritual</summary><ul id="${prefix}OrientationList"></ul></details><section class="encoding-panel" id="${prefix}Panel" role="region" aria-labelledby="${prefix}ReconstructHeading" hidden><div id="${prefix}Reconstruct"><h3 id="${prefix}ReconstructHeading" tabindex="-1">Reconstrua antes de consultar</h3><p>Sem consultar, reconstrua a ideia principal com suas palavras.</p><div class="encoding-actions"><button type="button" data-encoding-close="${surface}">Fechar</button><button type="button" class="encoding-primary" data-encoding-next="${surface}">Escolher uma operação</button></div></div><div id="${prefix}Operation" hidden><fieldset aria-labelledby="${prefix}OperationHeading"><legend id="${prefix}OperationHeading" tabindex="-1">Escolha uma operação</legend>${Object.entries(encodingOperations).map(([value,content])=>`<label class="encoding-operation"><input type="radio" name="${name}" value="${value}" data-encoding-choice="${surface}"><span><strong>${content.label}</strong><small>${content.instruction}</small></span></label>`).join('')}</fieldset><p class="encoding-instruction" id="${prefix}Instruction" aria-live="polite">Escolha uma operação para orientar esta pausa.</p><div class="encoding-actions"><button type="button" data-encoding-close="${surface}">Fechar</button><button type="button" class="encoding-primary" id="${prefix}Return" data-encoding-return="${surface}" disabled>Voltar à execução</button></div></div></section></div>`;
  }
  function installEncodingUi() {
    const sessionMount=document.getElementById('sessionCompanionEncodingMount'),deepMount=document.getElementById('deepEncodingMount');
    if(sessionMount&&!document.getElementById('sessionEncodingShell'))sessionMount.innerHTML=encodingMarkup('session');
    if(deepMount&&!document.getElementById('deepEncodingShell'))deepMount.innerHTML=encodingMarkup('deep');
    for(const surface of ['session','deep']){
      const elements=encodingElements(surface);if(!elements.trigger||elements.trigger.dataset.encodingBound)continue;
      elements.trigger.dataset.encodingBound='true';elements.trigger.addEventListener('click',()=>openEncoding(surface,elements.trigger));
      document.querySelectorAll(`[data-encoding-next="${surface}"]`).forEach(button=>button.addEventListener('click',()=>setEncodingStage('operation')));
      document.querySelectorAll(`[data-encoding-close="${surface}"]`).forEach(button=>button.addEventListener('click',()=>closeEncoding(true)));
      document.querySelectorAll(`[data-encoding-return="${surface}"]`).forEach(button=>button.addEventListener('click',()=>closeEncoding(true)));
      document.querySelectorAll(`[data-encoding-choice="${surface}"]`).forEach(control=>control.addEventListener('change',()=>selectEncodingOperation(control.value)));
    }
  }
  function encodingEligible(current) {
    return Boolean(current&&['running','active','paused'].includes(current.status)&&globalThis.CompassoRitualModel?.isEncodingCheckpointSnapshot?.(current.ritualSnapshot));
  }
  function resetEncoding() { runtime.encoding={executionId:null,stage:'closed',operation:null,surface:null,originId:null}; }
  function renderEncodingOrientation(surface,current) {
    const elements=encodingElements(surface),preparation=Array.isArray(current?.ritualSnapshot?.preparation)?current.ritualSnapshot.preparation.filter(item=>item?.text):[],key=JSON.stringify(preparation.map(item=>item.text));
    if(!elements.orientation)return;elements.orientation.hidden=!preparation.length;
    if(preparation.length&&elements.orientationList?.dataset.key!==key){elements.orientationList.innerHTML=preparation.map(item=>`<li>${escapeHtml(item.text)}</li>`).join('');elements.orientationList.dataset.key=key}
  }
  function renderEncodingSurface(surface,current,visible) {
    const elements=encodingElements(surface);if(!elements.shell)return;
    elements.shell.hidden=!visible;if(!visible){elements.panel.hidden=true;elements.trigger?.setAttribute('aria-expanded','false');return}
    renderEncodingOrientation(surface,current);
    const open=runtime.encoding.executionId===current.id&&runtime.encoding.surface===surface&&runtime.encoding.stage!=='closed';
    elements.trigger.setAttribute('aria-expanded',String(open));elements.panel.hidden=!open;
    if(!open)return;
    const operationStage=runtime.encoding.stage==='operation';elements.reconstruct.hidden=operationStage;elements.operation.hidden=!operationStage;elements.panel.setAttribute('aria-labelledby',operationStage?elements.operationHeading.id:elements.reconstructHeading.id);
    elements.shell.closest('.session-companion')?.classList.toggle('encoding-open',surface==='session');
    if(operationStage){
      elements.operation.querySelectorAll('input[type="radio"]').forEach(control=>{control.checked=control.value===runtime.encoding.operation});
      const selected=encodingOperations[runtime.encoding.operation];elements.instruction.textContent=selected?.instruction||'Escolha uma operação para orientar esta pausa.';elements.returnButton.disabled=!selected;
    }
  }
  function renderEncoding(current=activity()) {
    installEncodingUi();const eligible=encodingEligible(current),deepOpen=Boolean(document.getElementById('deepDialog')?.open);
    if(!eligible||runtime.encoding.executionId&&runtime.encoding.executionId!==current.id){resetEncoding()}
    if(current?.status==='finishing')resetEncoding();
    const sessionVisible=eligible&&(current.kind==='session'||current.kind==='deep'&&!deepOpen),deepVisible=eligible&&current.kind==='deep'&&deepOpen;
    renderEncodingSurface('session',current,sessionVisible);renderEncodingSurface('deep',current,deepVisible);
    if(runtime.encoding.stage==='closed')document.getElementById('sessionCompanion')?.classList.remove('encoding-open');
  }
  function openEncoding(surface,origin) {
    const current=activity();if(!encodingEligible(current))return;
    if(current.kind==='deep'&&surface==='session'){
      const dialog=document.getElementById('deepDialog');if(!dialog?.open)dialog?.showModal();deepTick();renderEncoding(current);surface='deep';origin=encodingElements('deep').trigger;
    }
    runtime.encoding={executionId:current.id,stage:'reconstruct',operation:null,surface,originId:origin?.id||encodingElements(surface).trigger?.id||null};renderEncoding(current);
    requestAnimationFrame(()=>encodingElements(surface).reconstructHeading?.focus());
  }
  function setEncodingStage(stage) {
    if(runtime.encoding.stage==='closed'||stage!=='operation')return;runtime.encoding.stage='operation';runtime.encoding.operation=null;renderEncoding();requestAnimationFrame(()=>encodingElements(runtime.encoding.surface).operationHeading?.focus());
  }
  function selectEncodingOperation(operation) {
    if(runtime.encoding.stage!=='operation'||!encodingOperations[operation])return;runtime.encoding.operation=operation;renderEncoding();
  }
  function closeEncoding(restoreFocus=false) {
    const surface=runtime.encoding.surface,originId=runtime.encoding.originId;resetEncoding();renderEncoding();
    if(restoreFocus)requestAnimationFrame(()=>{const original=document.getElementById(originId),stable=encodingElements(surface).trigger;(original?.offsetParent!==null?original:stable)?.focus?.()});
  }
  function installUi() {
    if (document.getElementById("sessionCompanion")) return;
    document.body.insertAdjacentHTML(
      "beforeend",
      `<aside id="sessionCompanion" class="session-companion" hidden aria-live="polite"><button type="button" class="session-companion-main" id="sessionCompanionOpen" title="Toque para abrir; arraste para mover" aria-description="No celular, arraste para reposicionar sem cobrir a navegação"><span class="session-companion-dot"></span><span class="session-companion-copy"><small id="sessionCompanionLabel">Sessão em andamento</small><strong id="sessionCompanionTitle"></strong><small class="session-companion-future-use" id="sessionCompanionFutureUse" hidden></small></span><time id="sessionCompanionTime">00:00</time></button><div class="session-companion-actions"><button type="button" id="sessionCompanionPause" aria-label="Pausar sessão" title="Pausar ou retomar">Ⅱ</button><button type="button" id="sessionCompanionFinish" aria-label="Concluir sessão" title="Concluir sessão">✓</button><button type="button" id="sessionCompanionFloat" aria-label="Abrir janela flutuante" title="Manter sobre outras janelas">▣</button></div><div id="sessionCompanionEncodingMount" class="session-companion-encoding"></div></aside>`,
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
    installEncodingUi();
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
    if (matchMedia("(min-width: 521px)").matches || event.button > 0 || document.getElementById('sessionCompanion')?.classList.contains('encoding-open')) return;
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
    if (current.learningContext) switchView('capabilities');
    else if (labels[current.domain]) switchView(current.domain);
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
      renderEncoding(null);
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
    const futureUse=globalThis.CompassoLearningOutcomeModel?.futureUsePresentation?.(current.learningContext?.futureUse);
    sessionCompanionFutureUse.textContent=futureUse?`Uso pretendido: ${futureUse.label}`:'';
    sessionCompanionFutureUse.hidden=!futureUse;
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
    renderEncoding(current);
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
  document.getElementById("deepDialog")?.addEventListener("close", () => {
    if (runtime.encoding.surface === "deep") resetEncoding();
    renderEncoding();
  });
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
