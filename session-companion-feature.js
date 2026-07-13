/* Compasso · Companheiro compacto de sessão e Deep Work */
(function installSessionCompanion() {
  const originalTitle = document.title;
  const runtime = { timer:null, notificationKey:null, pipWindow:null, permissionAsked:false };

  function activity() {
    const deep = typeof deepActive === 'function' ? deepActive() : null;
    if (deep) {
      const item = typeof deepItem === 'function' ? deepItem(deep) : null;
      return { id:`deep:${deep.id}`, kind:'deep', label:deep.state === 'paused' ? 'Deep Work pausado' : 'Deep Work', title:item?.title || 'Sessão focada', status:deep.state, elapsedMs:deepModel.elapsedMs(deep), domain:deep.domain };
    }
    const session = typeof sessionActive === 'function' ? sessionActive() : null;
    if (!session) return null;
    const item = typeof sessionItem === 'function' ? sessionItem(session) : null;
    return { id:`session:${session.id}`, kind:'session', label:session.status === 'paused' ? 'Sessão pausada' : 'Sessão em andamento', title:item?.title || 'Item removido', status:session.status, elapsedMs:sessionElapsedMs(session), domain:session.domain };
  }
  function clock(ms) {
    const seconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(seconds / 3600), minutes = Math.floor((seconds % 3600) / 60), rest = seconds % 60;
    return hours ? `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(rest).padStart(2,'0')}` : `${String(minutes).padStart(2,'0')}:${String(rest).padStart(2,'0')}`;
  }
  function installUi() {
    if (document.getElementById('sessionCompanion')) return;
    const style = document.createElement('style');
    style.id = 'sessionCompanionStyles';
    style.textContent = `
      #sessionBanner{display:none!important}.session-companion{position:fixed;right:16px;bottom:16px;z-index:70;width:min(316px,calc(100vw - 24px));min-height:62px;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:7px;padding:8px;background:#252521;color:#fff;border:1px solid #45443e;border-radius:15px;box-shadow:0 14px 38px rgba(20,20,17,.24)}.session-companion[hidden]{display:none}.session-companion-main{min-width:0;border:0;background:transparent;color:inherit;display:grid;grid-template-columns:10px minmax(0,1fr) auto;align-items:center;gap:9px;padding:5px 4px;text-align:left;cursor:pointer}.session-companion-dot{width:8px;height:8px;border-radius:50%;background:#8e82ff;box-shadow:0 0 0 4px rgba(142,130,255,.14)}.session-companion.paused .session-companion-dot{background:#dc7e3f;box-shadow:0 0 0 4px rgba(220,126,63,.14)}.session-companion.deep .session-companion-dot{background:#76d4b8;box-shadow:0 0 0 4px rgba(118,212,184,.14)}.session-companion-copy{min-width:0}.session-companion-copy small,.session-companion-copy strong{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.session-companion-copy small{color:#aaa79f;font-size:8px;text-transform:uppercase;letter-spacing:.1em;font-weight:800}.session-companion-copy strong{margin-top:3px;font:700 11px/1.25 Manrope,sans-serif}.session-companion-time{font:800 16px/1 Manrope,sans-serif;letter-spacing:-.04em}.session-companion-actions{display:flex;gap:4px}.session-companion-actions button{width:31px;height:31px;border:1px solid #4c4b45;border-radius:8px;background:#34342f;color:#fff;display:grid;place-items:center;cursor:pointer;font-size:12px;font-weight:800}.session-companion-actions button:hover{background:#42413b}.session-companion-actions button[hidden]{display:none}@media(max-width:520px){.session-companion{right:12px;bottom:12px;width:calc(100vw - 24px)}.session-companion-main{grid-template-columns:9px minmax(0,1fr) auto}.session-companion-actions button{width:29px;height:29px}}
    `;
    document.head.appendChild(style);
    document.body.insertAdjacentHTML('beforeend', `<aside id="sessionCompanion" class="session-companion" hidden aria-live="polite"><button type="button" class="session-companion-main" id="sessionCompanionOpen" title="Voltar à sessão"><span class="session-companion-dot"></span><span class="session-companion-copy"><small id="sessionCompanionLabel">Sessão em andamento</small><strong id="sessionCompanionTitle"></strong></span><time id="sessionCompanionTime">00:00</time></button><div class="session-companion-actions"><button type="button" id="sessionCompanionPause" aria-label="Pausar sessão" title="Pausar ou retomar">Ⅱ</button><button type="button" id="sessionCompanionFloat" aria-label="Abrir janela flutuante" title="Manter sobre outras janelas">▣</button></div></aside>`);
    sessionCompanionOpen.addEventListener('click', openActivity);
    sessionCompanionPause.addEventListener('click', togglePause);
    sessionCompanionFloat.addEventListener('click', openPictureInPicture);
    sessionCompanionFloat.hidden = !('documentPictureInPicture' in window);
  }
  function openActivity() {
    const current = activity();
    if (!current) return;
    if (current.kind === 'deep') {
      if (!deepDialog.open) deepDialog.showModal();
      deepTick();
      return;
    }
    if (labels[current.domain]) switchView(current.domain);
  }
  function togglePause() {
    const current = activity();
    if (!current) return;
    if (current.kind === 'deep') deepPause.click();
    else toggleSessionPause();
    queueMicrotask(render);
  }
  function pipMarkup(current) {
    return `<main><span></span><div><small>${escapeHtml(current.label)}</small><strong>${escapeHtml(current.title)}</strong></div><time id="pipClock">${clock(current.elapsedMs)}</time></main><button id="pipReturn">Voltar ao Compasso</button>`;
  }
  function updatePip(current) {
    const pip = runtime.pipWindow;
    if (!pip || pip.closed) { runtime.pipWindow = null; return; }
    if (!current) { pip.close(); runtime.pipWindow = null; return; }
    const label = pip.document.querySelector('small'), title = pip.document.querySelector('strong'), time = pip.document.getElementById('pipClock');
    if (label) label.textContent = current.label;
    if (title) title.textContent = current.title;
    if (time) time.textContent = clock(current.elapsedMs);
  }
  async function openPictureInPicture() {
    const current = activity();
    if (!current || !('documentPictureInPicture' in window)) return showToast('Janela flutuante indisponível neste navegador');
    try {
      if (runtime.pipWindow && !runtime.pipWindow.closed) return runtime.pipWindow.focus();
      const pip = await window.documentPictureInPicture.requestWindow({ width:320, height:132 });
      runtime.pipWindow = pip;
      const doc = pip.document;
      doc.head.innerHTML = `<title>Compasso · sessão ativa</title><style>*{box-sizing:border-box}body{margin:0;padding:12px;background:#252521;color:#fff;font-family:system-ui,sans-serif}main{display:grid;grid-template-columns:9px minmax(0,1fr) auto;gap:9px;align-items:center}main>span{width:8px;height:8px;border-radius:50%;background:#8e82ff;box-shadow:0 0 0 4px #8e82ff24}small,strong{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}small{color:#aaa79f;font-size:8px;text-transform:uppercase;letter-spacing:.1em}strong{font-size:12px;margin-top:4px}time{font-size:18px;font-weight:800}button{width:100%;margin-top:12px;height:32px;border:1px solid #55544d;border-radius:8px;background:#34342f;color:#fff;font-weight:700}</style>`;
      doc.body.innerHTML = pipMarkup(current);
      doc.getElementById('pipReturn').onclick = () => { window.focus(); openActivity(); };
      pip.addEventListener('pagehide', () => { runtime.pipWindow = null; });
    } catch { showToast('Não foi possível abrir a janela flutuante'); }
  }
  async function closeNotifications() {
    if (!('serviceWorker' in navigator)) return;
    try { const registration = await navigator.serviceWorker.getRegistration(); const notifications = await registration?.getNotifications?.({tag:'compasso-active-session'}); notifications?.forEach(item => item.close()); } catch {}
    runtime.notificationKey = null;
  }
  async function showNotification(current, force = false) {
    if (!current || !('Notification' in window) || Notification.permission !== 'granted' || !('serviceWorker' in navigator)) return;
    const key = `${current.id}:${current.status}`;
    if (!force && runtime.notificationKey === key) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(current.label, { body:`${current.title} · volte ao Compasso quando concluir.`, icon:'./compasso-icon-192.png', badge:'./compasso-icon-192.png', tag:'compasso-active-session', renotify:false, requireInteraction:true, silent:true, data:{url:'./'} });
      runtime.notificationKey = key;
    } catch {}
  }
  async function requestReminderPermission() {
    if (runtime.permissionAsked || !('Notification' in window) || Notification.permission !== 'default') return;
    runtime.permissionAsked = true;
    try { if (await Notification.requestPermission() === 'granted') showNotification(activity(), true); } catch {}
  }
  function updateBadge(current) {
    if (!('setAppBadge' in navigator)) return;
    if (current) navigator.setAppBadge(1).catch(()=>{});
    else if ('clearAppBadge' in navigator) navigator.clearAppBadge().catch(()=>{});
  }
  function render() {
    installUi();
    const current = activity(), companion = document.getElementById('sessionCompanion');
    companion.hidden = !current;
    if (!current) {
      document.title = originalTitle;
      clearInterval(runtime.timer); runtime.timer = null;
      updatePip(null); updateBadge(null); closeNotifications();
      return;
    }
    companion.classList.toggle('paused', current.status === 'paused');
    companion.classList.toggle('deep', current.kind === 'deep');
    sessionCompanionLabel.textContent = current.label;
    sessionCompanionTitle.textContent = current.title;
    sessionCompanionTime.textContent = clock(current.elapsedMs);
    sessionCompanionPause.textContent = current.status === 'paused' ? '▶' : 'Ⅱ';
    sessionCompanionPause.setAttribute('aria-label', current.status === 'paused' ? 'Retomar sessão' : 'Pausar sessão');
    document.title = `● ${current.kind === 'deep' ? 'Deep Work' : 'Sessão'} · ${current.title}`;
    updatePip(current); updateBadge(current); showNotification(current);
    if (!runtime.timer) runtime.timer = setInterval(render, 1000);
  }

  installUi();
  CompassoFeatures.register('session-companion',{order:45,afterRender:render});
  sessionStartForm.addEventListener('submit', requestReminderPermission);
  deepStart.addEventListener('click', requestReminderPermission);
  document.addEventListener('visibilitychange', () => { const current = activity(); if (document.hidden && current) showNotification(current, true); });
  window.addEventListener('storage', event => { if (event.key === STORAGE_KEY) queueMicrotask(render); });
  render();
})();
