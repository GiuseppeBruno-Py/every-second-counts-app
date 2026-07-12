/* Compasso · Sessões de leitura e estudo
 * Este arquivo é injetado pelo service worker dentro do módulo principal,
 * portanto usa diretamente state, saveData, metricConfig e renderGrid.
 */

const SESSIONS_FEATURE_VERSION = 1;
state.data.sessions = Array.isArray(state.data.sessions) ? state.data.sessions : [];

const sessionRuntime = {
  tick: null,
  selectedItem: null,
  historyItem: null
};

function sessionNow() { return Date.now(); }
function sessionId() { return `s${Date.now()}${Math.random().toString(36).slice(2,7)}`; }
function sessionActive() { return state.data.sessions.find(session => session.status === 'active' || session.status === 'paused') || null; }
function sessionItem(session) { return session ? state.data[session.domain]?.find(item => item.id === session.itemId) || null : null; }
function sessionElapsedMs(session, at = sessionNow()) {
  if (!session) return 0;
  const end = session.endedAt ? new Date(session.endedAt).getTime() : at;
  const pausedNow = session.status === 'paused' && session.pauseStartedAt
    ? Math.max(0, end - new Date(session.pauseStartedAt).getTime())
    : 0;
  return Math.max(0, end - new Date(session.startedAt).getTime() - positiveNumber(session.pausedMs) - pausedNow);
}
function formatDuration(ms) {
  const totalMinutes = Math.max(0, Math.round(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours ? `${hours}h ${String(minutes).padStart(2,'0')}min` : `${minutes} min`;
}
function formatClock(ms) {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
function sessionMetric(item, domain) {
  const config = metricConfig(domain, item?.readingFormat || 'physical');
  return { config, value: positiveNumber(item?.[config.currentKey]) };
}
function sessionMetricLabel(session) {
  const item = sessionItem(session);
  const config = metricConfig(session.domain, item?.readingFormat || session.readingFormat || 'physical');
  const start = positiveNumber(session.startValue);
  const end = session.endValue == null ? null : positiveNumber(session.endValue);
  if (end == null) return `${formatNumber(start)} ${config.unit}`;
  const delta = Math.max(0, end - start);
  return `${formatNumber(start)} → ${formatNumber(end)} ${config.unit} · +${formatNumber(delta)}`;
}

function installSessionStyles() {
  if (document.getElementById('compassoSessionStyles')) return;
  const style = document.createElement('style');
  style.id = 'compassoSessionStyles';
  style.textContent = `
    .session-banner{position:fixed;right:22px;bottom:22px;z-index:45;width:min(420px,calc(100vw - 32px));background:#252521;color:#fff;border:1px solid #45443e;border-radius:17px;padding:16px;box-shadow:0 18px 50px rgba(20,20,17,.25)}
    .session-banner[hidden]{display:none}.session-banner-top{display:flex;gap:12px;align-items:flex-start}.session-pulse{width:10px;height:10px;border-radius:50%;margin-top:6px;background:#8e82ff;box-shadow:0 0 0 5px rgba(142,130,255,.15)}.session-banner.paused .session-pulse{background:#dc7e3f;box-shadow:0 0 0 5px rgba(220,126,63,.16)}
    .session-banner-main{min-width:0;flex:1}.session-banner-label{font-size:9px;text-transform:uppercase;letter-spacing:.15em;color:#aaa79f;font-weight:800}.session-banner-title{display:block;font:700 14px/1.35 Manrope,sans-serif;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.session-timer{font:800 25px/1 Manrope,sans-serif;letter-spacing:-.04em;margin:14px 0 12px}.session-banner-actions{display:flex;gap:8px;flex-wrap:wrap}.session-banner-actions button{min-height:36px;border-radius:9px;padding:0 12px;border:1px solid #4c4b45;background:#34342f;color:#fff;font-size:11px;font-weight:700;cursor:pointer}.session-banner-actions button.primary{background:#f8f6f0;color:#252521;border-color:#f8f6f0}
    .session-card-button{font-weight:800!important;color:var(--violet)!important}.session-card-button[disabled]{opacity:.45;cursor:not-allowed}.session-history-button{color:var(--muted)!important}
    .session-dialog{width:min(620px,calc(100vw - 28px));border:0;border-radius:20px;padding:0;background:var(--surface-strong);color:var(--ink);box-shadow:0 24px 80px rgba(25,23,18,.25)}.session-dialog::backdrop{background:rgba(31,30,27,.55);backdrop-filter:blur(4px)}.session-dialog-head{padding:21px 23px 16px;border-bottom:1px solid var(--line);display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.session-dialog-head h2{margin:3px 0 0;font:800 20px/1.2 Manrope,sans-serif;letter-spacing:-.035em}.session-dialog-body{padding:22px 23px;display:grid;gap:16px}.session-dialog-foot{padding:15px 23px;border-top:1px solid var(--line);display:flex;justify-content:flex-end;gap:9px}.session-dialog .field label{display:block;font-size:11px;font-weight:700;margin-bottom:7px}.session-dialog input,.session-dialog textarea{width:100%;border:1px solid var(--line);border-radius:10px;padding:11px 12px;background:#fff;color:var(--ink)}.session-dialog textarea{min-height:88px;resize:vertical}.session-summary{padding:13px 14px;border-radius:12px;background:var(--violet-soft);color:var(--violet);font-size:12px;line-height:1.55}.session-history-list{display:grid;gap:10px;max-height:55vh;overflow:auto}.session-history-row{border:1px solid var(--line);border-radius:13px;padding:13px;display:grid;grid-template-columns:1fr auto;gap:10px}.session-history-row strong{font-size:12px}.session-history-row span{display:block;color:var(--muted);font-size:10px;margin-top:4px}.session-history-row button{border:0;background:transparent;color:var(--red);font-size:10px;font-weight:700;cursor:pointer}.session-empty{padding:28px;text-align:center;color:var(--muted);font-size:12px;border:1px dashed var(--line);border-radius:13px}
    @media(max-width:720px){.session-banner{right:16px;bottom:16px}.session-dialog-head,.session-dialog-body,.session-dialog-foot{padding-left:17px;padding-right:17px}.session-dialog-foot{flex-wrap:wrap}.session-dialog-foot button{flex:1}.session-history-row{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);
}

function installSessionUi() {
  if (document.getElementById('sessionBanner')) return;
  document.body.insertAdjacentHTML('beforeend', `
    <section class="session-banner" id="sessionBanner" hidden aria-live="polite">
      <div class="session-banner-top"><span class="session-pulse"></span><div class="session-banner-main"><div class="session-banner-label" id="sessionBannerLabel">Sessão em andamento</div><strong class="session-banner-title" id="sessionBannerTitle"></strong></div></div>
      <div class="session-timer" id="sessionTimer">00:00:00</div>
      <div class="session-banner-actions"><button type="button" id="sessionPauseBtn">Pausar</button><button type="button" class="primary" id="sessionFinishBtn">Encerrar sessão</button></div>
    </section>
    <dialog class="session-dialog" id="sessionStartDialog">
      <form method="dialog" id="sessionStartForm">
        <div class="session-dialog-head"><div><div class="eyebrow">Nova sessão</div><h2 id="sessionStartTitle">Iniciar sessão</h2></div><button class="close-btn" type="button" data-session-close="sessionStartDialog">${icon('x')}</button></div>
        <div class="session-dialog-body"><div class="session-summary" id="sessionStartSummary"></div><div class="field"><label for="sessionIntent">Objetivo desta sessão</label><textarea id="sessionIntent" maxlength="220" placeholder="Ex.: ler o capítulo 4 e identificar o argumento central."></textarea></div></div>
        <div class="session-dialog-foot"><button type="button" class="quiet-btn" data-session-close="sessionStartDialog">Cancelar</button><button type="submit" class="primary-btn">Iniciar</button></div>
      </form>
    </dialog>
    <dialog class="session-dialog" id="sessionFinishDialog">
      <form method="dialog" id="sessionFinishForm">
        <div class="session-dialog-head"><div><div class="eyebrow">Encerrar sessão</div><h2 id="sessionFinishTitle">Registrar progresso</h2></div><button class="close-btn" type="button" data-session-close="sessionFinishDialog">${icon('x')}</button></div>
        <div class="session-dialog-body"><div class="session-summary" id="sessionFinishSummary"></div><div class="field"><label id="sessionEndValueLabel" for="sessionEndValue">Valor final</label><input id="sessionEndValue" type="number" min="0" inputmode="decimal" required></div><div class="field"><label for="sessionReflection">Observação da sessão</label><textarea id="sessionReflection" maxlength="300" placeholder="O que avançou, onde parou ou o que precisa retomar?"></textarea></div></div>
        <div class="session-dialog-foot"><button type="button" class="quiet-btn" data-session-close="sessionFinishDialog">Cancelar</button><button type="submit" class="primary-btn">${icon('check')}Salvar sessão</button></div>
      </form>
    </dialog>
    <dialog class="session-dialog" id="sessionHistoryDialog">
      <div class="session-dialog-head"><div><div class="eyebrow">Histórico</div><h2 id="sessionHistoryTitle">Sessões</h2></div><button class="close-btn" type="button" data-session-close="sessionHistoryDialog">${icon('x')}</button></div>
      <div class="session-dialog-body"><div class="session-history-list" id="sessionHistoryList"></div></div>
      <div class="session-dialog-foot"><button type="button" class="secondary-btn" data-session-close="sessionHistoryDialog">Fechar</button></div>
    </dialog>
  `);
}

function renderSessionBanner() {
  const session = sessionActive();
  const banner = document.getElementById('sessionBanner');
  if (!banner) return;
  banner.hidden = !session;
  if (!session) { clearInterval(sessionRuntime.tick); sessionRuntime.tick = null; return; }
  const item = sessionItem(session);
  banner.classList.toggle('paused', session.status === 'paused');
  document.getElementById('sessionBannerLabel').textContent = session.status === 'paused' ? 'Sessão pausada' : 'Sessão em andamento';
  document.getElementById('sessionBannerTitle').textContent = item?.title || 'Item removido';
  document.getElementById('sessionPauseBtn').textContent = session.status === 'paused' ? 'Retomar' : 'Pausar';
  const tick = () => { document.getElementById('sessionTimer').textContent = formatClock(sessionElapsedMs(session)); };
  tick(); clearInterval(sessionRuntime.tick); sessionRuntime.tick = setInterval(tick, 1000);
}

function enhanceSessionCards(domain) {
  if (!['reading','study'].includes(domain)) return;
  const active = sessionActive();
  document.querySelectorAll(`#${domain}Grid .item-card`).forEach(card => {
    const edit = card.querySelector('[data-edit]');
    if (!edit) return;
    const [itemDomain,itemId] = edit.dataset.edit.split(':');
    const actions = card.querySelector('.card-actions');
    if (!actions || actions.querySelector('[data-start-session]')) return;
    const blocked = active && !(active.domain === itemDomain && active.itemId === itemId);
    const ownActive = active && active.domain === itemDomain && active.itemId === itemId;
    actions.insertAdjacentHTML('afterbegin', `<button class="session-card-button" data-start-session="${itemDomain}:${itemId}" ${blocked || ownActive ? 'disabled' : ''}>${ownActive ? 'Sessão ativa' : 'Iniciar sessão'}</button><button class="session-history-button" data-session-history="${itemDomain}:${itemId}">Histórico</button>`);
  });
}

const renderGridWithoutSessions = renderGrid;
renderGrid = function(domain) {
  renderGridWithoutSessions(domain);
  enhanceSessionCards(domain);
};

const renderAllWithoutSessions = renderAll;
renderAll = function() {
  renderAllWithoutSessions();
  renderSessionBanner();
};

function openSessionStart(domain, itemId) {
  const active = sessionActive();
  if (active) { showToast('Encerre a sessão atual antes de iniciar outra'); return; }
  const item = state.data[domain].find(candidate => candidate.id === itemId);
  if (!item) return;
  sessionRuntime.selectedItem = { domain, itemId };
  const metric = sessionMetric(item, domain);
  document.getElementById('sessionStartTitle').textContent = item.title;
  document.getElementById('sessionStartSummary').textContent = `Início registrado em ${formatNumber(metric.value)} ${metric.config.unit}. O cronômetro continuará mesmo se o aplicativo for fechado.`;
  document.getElementById('sessionIntent').value = item.note || '';
  document.getElementById('sessionStartDialog').showModal();
}

function createSession() {
  const selected = sessionRuntime.selectedItem;
  if (!selected || sessionActive()) return;
  const item = state.data[selected.domain].find(candidate => candidate.id === selected.itemId);
  if (!item) return;
  const metric = sessionMetric(item, selected.domain);
  state.data.sessions.unshift({
    id: sessionId(),
    schemaVersion: SESSIONS_FEATURE_VERSION,
    domain: selected.domain,
    itemId: selected.itemId,
    readingFormat: item.readingFormat || null,
    intent: document.getElementById('sessionIntent').value.trim(),
    reflection: '',
    startValue: metric.value,
    endValue: null,
    startedAt: new Date().toISOString(),
    endedAt: null,
    pausedMs: 0,
    pauseStartedAt: null,
    durationMs: null,
    status: 'active'
  });
  document.getElementById('sessionStartDialog').close();
  saveData('Sessão iniciada');
}

function toggleSessionPause() {
  const session = sessionActive();
  if (!session) return;
  if (session.status === 'active') {
    session.status = 'paused';
    session.pauseStartedAt = new Date().toISOString();
    saveData('Sessão pausada');
  } else {
    session.pausedMs = positiveNumber(session.pausedMs) + Math.max(0, sessionNow() - new Date(session.pauseStartedAt).getTime());
    session.pauseStartedAt = null;
    session.status = 'active';
    saveData('Sessão retomada');
  }
}

function openSessionFinish() {
  const session = sessionActive();
  if (!session) return;
  const item = sessionItem(session);
  if (!item) { showToast('O item desta sessão não existe mais'); return; }
  const metric = sessionMetric(item, session.domain);
  let suggested = metric.value;
  if (session.domain === 'study') suggested = Math.round((metric.value + sessionElapsedMs(session) / 3600000) * 10) / 10;
  document.getElementById('sessionFinishTitle').textContent = item.title;
  document.getElementById('sessionFinishSummary').textContent = `${formatDuration(sessionElapsedMs(session))} de atividade · início em ${formatNumber(session.startValue)} ${metric.config.unit}.`;
  document.getElementById('sessionEndValueLabel').textContent = metric.config.currentLabel;
  const input = document.getElementById('sessionEndValue');
  input.step = metric.config.step;
  input.max = metric.config.isPercent ? '100' : '';
  input.value = suggested;
  document.getElementById('sessionReflection').value = '';
  document.getElementById('sessionFinishDialog').showModal();
}

function finishSession() {
  const session = sessionActive();
  if (!session) return;
  const item = sessionItem(session);
  if (!item) return;
  const metric = sessionMetric(item, session.domain);
  const endValue = metric.config.isPercent ? clamp(document.getElementById('sessionEndValue').value) : positiveNumber(document.getElementById('sessionEndValue').value);
  if (endValue < positiveNumber(session.startValue)) { showToast('O valor final não pode ser menor que o inicial'); return; }
  const endedAt = new Date().toISOString();
  if (session.status === 'paused' && session.pauseStartedAt) {
    session.pausedMs = positiveNumber(session.pausedMs) + Math.max(0, new Date(endedAt).getTime() - new Date(session.pauseStartedAt).getTime());
    session.pauseStartedAt = null;
    session.status = 'active';
  }
  session.endValue = endValue;
  session.endedAt = endedAt;
  session.durationMs = sessionElapsedMs(session, new Date(endedAt).getTime());
  session.status = 'completed';
  session.reflection = document.getElementById('sessionReflection').value.trim();
  item[metric.config.currentKey] = endValue;
  if (metric.config.isPercent) item[metric.config.totalKey] = 100;
  const total = positiveNumber(item[metric.config.totalKey]);
  if (total > 0) item.progress = clamp(Math.round((Math.min(endValue,total) / total) * 100));
  if (item.progress >= 100) item.status = 'done';
  document.getElementById('sessionFinishDialog').close();
  saveData('Sessão concluída e progresso atualizado');
}

function openSessionHistory(domain, itemId) {
  const item = state.data[domain].find(candidate => candidate.id === itemId);
  if (!item) return;
  sessionRuntime.historyItem = { domain, itemId };
  document.getElementById('sessionHistoryTitle').textContent = item.title;
  renderSessionHistory();
  document.getElementById('sessionHistoryDialog').showModal();
}

function renderSessionHistory() {
  const selected = sessionRuntime.historyItem;
  const list = document.getElementById('sessionHistoryList');
  if (!selected || !list) return;
  const sessions = state.data.sessions
    .filter(session => session.domain === selected.domain && session.itemId === selected.itemId)
    .sort((a,b) => new Date(b.startedAt) - new Date(a.startedAt));
  if (!sessions.length) { list.innerHTML = '<div class="session-empty">Nenhuma sessão registrada para este item.</div>'; return; }
  list.innerHTML = sessions.map(session => {
    const date = new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(session.startedAt));
    const status = session.status === 'completed' ? 'Concluída' : session.status === 'paused' ? 'Pausada' : 'Em andamento';
    return `<article class="session-history-row"><div><strong>${date} · ${formatDuration(session.durationMs ?? sessionElapsedMs(session))}</strong><span>${status} · ${escapeHtml(sessionMetricLabel(session))}</span>${session.intent ? `<span>Objetivo: ${escapeHtml(session.intent)}</span>` : ''}${session.reflection ? `<span>Observação: ${escapeHtml(session.reflection)}</span>` : ''}</div>${session.status === 'completed' ? `<button type="button" data-delete-session="${session.id}">Excluir</button>` : ''}</article>`;
  }).join('');
}

function deleteSession(id) {
  const session = state.data.sessions.find(candidate => candidate.id === id);
  if (!session || session.status !== 'completed' || !confirm('Excluir esta sessão do histórico? O progresso atual do item não será alterado.')) return;
  state.data.sessions = state.data.sessions.filter(candidate => candidate.id !== id);
  saveData('Sessão excluída');
  renderSessionHistory();
}

installSessionStyles();
installSessionUi();

document.getElementById('sessionStartForm').addEventListener('submit', event => { event.preventDefault(); createSession(); });
document.getElementById('sessionFinishForm').addEventListener('submit', event => { event.preventDefault(); finishSession(); });
document.getElementById('sessionPauseBtn').addEventListener('click', toggleSessionPause);
document.getElementById('sessionFinishBtn').addEventListener('click', openSessionFinish);
document.addEventListener('click', event => {
  const start = event.target.closest('[data-start-session]');
  if (start && !start.disabled) { const [domain,itemId] = start.dataset.startSession.split(':'); openSessionStart(domain,itemId); }
  const history = event.target.closest('[data-session-history]');
  if (history) { const [domain,itemId] = history.dataset.sessionHistory.split(':'); openSessionHistory(domain,itemId); }
  const close = event.target.closest('[data-session-close]');
  if (close) document.getElementById(close.dataset.sessionClose)?.close();
  const remove = event.target.closest('[data-delete-session]');
  if (remove) deleteSession(remove.dataset.deleteSession);
});

window.addEventListener('beforeunload', () => window.CompassoStorage?.flush?.(STORAGE_KEY));
