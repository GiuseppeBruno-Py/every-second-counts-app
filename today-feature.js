/* Compasso · Hoje e próximas ações
 * Planejamento diário com sugestões inteligentes e ações manuais.
 * Injetado pelo service worker dentro do módulo principal.
 */

const TODAY_FEATURE_VERSION = 2;
state.data.dailyPlans = Array.isArray(state.data.dailyPlans) ? state.data.dailyPlans : [];
labels.today = { title: 'Hoje', kicker: 'Próximas ações' };

function todayDateKey(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function todayPlan() {
  const date = todayDateKey();
  const plans = state.data.dailyPlans = Array.isArray(state.data.dailyPlans) ? state.data.dailyPlans : [];
  let plan = plans.find(candidate => candidate.date === date);
  if (!plan) {
    plan = { id: `day-${date}`, schemaVersion: TODAY_FEATURE_VERSION, date, items: [], updatedAt: new Date().toISOString() };
    plans.unshift(plan);
  }
  plan.items = Array.isArray(plan.items) ? plan.items : [];
  return plan;
}

function todayItem(ref) {
  return ref?.domain && ref?.itemId ? state.data[ref.domain]?.find(item => item.id === ref.itemId) || null : null;
}

function todayRefKey(ref) {
  return ref.type === 'custom' ? `custom:${ref.id}` : `${ref.domain}:${ref.itemId}`;
}

function todayAllCandidates() {
  const focus = new Set(state.data.focus || []);
  return ['reading', 'study', 'goal']
    .flatMap(domain => state.data[domain].map(item => ({ item, domain })))
    .filter(entry => ['active', 'planned'].includes(entry.item.status))
    .sort((a, b) => Number(focus.has(b.item.title)) - Number(focus.has(a.item.title)) || b.item.progress - a.item.progress);
}

function todayInstallStyles() {
  if (document.getElementById('compassoTodayStyles')) return;
  const style = document.createElement('style');
  style.id = 'compassoTodayStyles';
  style.textContent = `
    .today-shell{display:grid;gap:18px}.today-hero{background:#302f2a;color:#fff;border-radius:22px;padding:27px 29px;display:flex;align-items:flex-end;justify-content:space-between;gap:24px;box-shadow:var(--shadow);overflow:hidden;position:relative}.today-hero::after{content:"";position:absolute;width:225px;height:225px;border:42px solid rgba(184,176,255,.1);border-radius:50%;right:-60px;top:-105px}.today-hero>*{position:relative;z-index:1}.today-hero .eyebrow{color:#aaa79f}.today-hero h2{margin:8px 0 7px;font:800 clamp(24px,3vw,36px)/1.15 Manrope,sans-serif;letter-spacing:-.05em}.today-hero p{margin:0;color:#bbb8b0;font-size:12px;line-height:1.6}.today-score{min-width:150px;text-align:right}.today-score strong{display:block;font:800 34px/1 Manrope,sans-serif}.today-score span{display:block;margin-top:7px;color:#bbb8b0;font-size:10px}.today-grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(300px,.75fr);gap:18px}.today-panel{background:var(--surface-strong);border:1px solid var(--line);border-radius:18px;padding:21px;box-shadow:var(--shadow)}.today-panel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:15px}.today-panel-head h3{margin:4px 0 0;font:800 17px/1.25 Manrope,sans-serif}.today-panel-head p{margin:5px 0 0;color:var(--muted);font-size:10px;line-height:1.5}.today-list,.today-candidates{display:grid;gap:9px}.today-row{border:1px solid var(--line);border-radius:13px;padding:13px;display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:11px}.today-row.done{background:var(--green-soft);border-color:#cce6dd}.today-row.custom{border-left:3px solid var(--violet)}.today-check{width:24px;height:24px;border:1px solid var(--line);border-radius:7px;background:#fff;display:grid;place-items:center;color:var(--green);cursor:pointer}.today-check svg{width:15px;height:15px}.today-row-main strong{display:block;font-size:11px}.today-row-main span{display:block;color:var(--muted);font-size:9px;margin-top:4px;line-height:1.45}.today-row.done .today-row-main strong{text-decoration:line-through;color:var(--muted)}.today-actions{display:flex;gap:6px}.today-actions button,.today-candidate button{border:1px solid var(--line);border-radius:8px;background:#fff;min-height:31px;padding:0 9px;color:var(--ink);font-size:9px;font-weight:800;cursor:pointer}.today-actions button.primary{background:var(--ink);border-color:var(--ink);color:#fff}.today-actions button.remove{color:var(--red)}.today-candidate{border-top:1px solid var(--line);padding:11px 0;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center}.today-candidate:first-child{border-top:0;padding-top:0}.today-candidate strong{display:block;font-size:11px}.today-candidate span{display:block;color:var(--muted);font-size:9px;margin-top:4px}.today-empty{border:1px dashed var(--line);border-radius:12px;padding:26px;text-align:center;color:var(--muted);font-size:11px;line-height:1.55}.today-note{margin-top:14px;padding:12px;border-radius:11px;background:var(--violet-soft);color:var(--violet);font-size:10px;line-height:1.55}.today-dialog{width:min(560px,calc(100vw - 28px));border:0;border-radius:20px;padding:0;background:var(--surface-strong);box-shadow:0 24px 80px rgba(25,23,18,.25)}.today-dialog::backdrop{background:rgba(31,30,27,.55);backdrop-filter:blur(4px)}.today-dialog-head{padding:21px 23px 16px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;gap:15px}.today-dialog-head h2{margin:3px 0 0;font:800 20px/1.2 Manrope,sans-serif}.today-dialog-body{padding:22px 23px;display:grid;gap:15px}.today-dialog-body .field label{display:block;font-size:10px;font-weight:800;margin-bottom:7px}.today-dialog-body input,.today-dialog-body select{width:100%;border:1px solid var(--line);border-radius:10px;background:#fff;padding:11px 12px}.today-dialog-body p{margin:0;color:var(--muted);font-size:10px;line-height:1.5}.today-dialog-foot{padding:15px 23px;border-top:1px solid var(--line);display:flex;justify-content:flex-end;gap:9px}
    @media(max-width:920px){.today-grid{grid-template-columns:1fr}.today-hero{align-items:flex-start;flex-direction:column}.today-score{text-align:left}}
    @media(max-width:620px){.today-hero{padding:22px 20px}.today-panel{padding:17px}.today-row{grid-template-columns:auto minmax(0,1fr)}.today-actions{grid-column:2;flex-wrap:wrap}.today-panel-head{align-items:stretch;flex-direction:column}.today-panel-head>button{width:100%;justify-content:center}.today-dialog-head,.today-dialog-body,.today-dialog-foot{padding-left:17px;padding-right:17px}}
  `;
  document.head.appendChild(style);
}

function todayInstallUi() {
  if (!document.querySelector('[data-view="today"]')) {
    const overviewNav = document.querySelector('[data-view="overview"]');
    overviewNav?.insertAdjacentHTML('beforebegin', `<button class="nav-item" data-view="today">${icon('calendar')}<span>Hoje</span><span class="nav-badge" id="todayBadge"></span></button>`);
  }
  if (!document.getElementById('todayView')) {
    document.querySelector('.content')?.insertAdjacentHTML('afterbegin', `
      <section class="view" id="todayView"><div class="today-shell"><section class="today-hero"><div><div class="eyebrow" id="todayDateHeading"></div><h2>Escolha pouco.<br>Conclua o que importa.</h2><p>Transforme o foco da semana em próximas ações executáveis para hoje.</p></div><div class="today-score"><strong id="todayScore">0/0</strong><span>ações concluídas hoje</span></div></section><div class="today-grid"><section class="today-panel"><div class="today-panel-head"><div><div class="eyebrow">Plano do dia</div><h3>Próximas ações</h3><p>Adicione uma ação livre ou escolha uma sugestão conectada ao sistema.</p></div><button class="primary-btn" type="button" data-today-custom>${icon('plus')}Nova ação</button></div><div class="today-list" id="todayList"></div></section><section class="today-panel"><div class="today-panel-head"><div><div class="eyebrow">Fila inteligente</div><h3>Sugestões para hoje</h3><p>Prioriza o foco semanal e as frentes ativas.</p></div></div><div class="today-candidates" id="todayCandidates"></div><div class="today-note">A fila sugere; você decide. Ações manuais podem ser independentes ou vinculadas a uma frente existente.</div></section></div></div></section>
    `);
  }
  if (!document.getElementById('todayDialog')) {
    document.body.insertAdjacentHTML('beforeend', `
      <dialog class="today-dialog" id="todayDialog"><form id="todayForm" method="dialog"><div class="today-dialog-head"><div><div class="eyebrow">Próximas ações</div><h2>Nova ação</h2></div><button class="close-btn" type="button" data-today-close>${icon('x')}</button></div><div class="today-dialog-body"><div class="field"><label for="todayActionTitle">O que precisa ser feito?</label><input id="todayActionTitle" maxlength="180" required placeholder="Ex.: revisar os testes unitários por 30 minutos"></div><div class="field"><label for="todayActionLink">Vincular a uma frente (opcional)</label><select id="todayActionLink"></select></div><p>O vínculo permite abrir o item e iniciar uma sessão quando a frente for uma leitura ou estudo.</p></div><div class="today-dialog-foot"><button class="quiet-btn" type="button" data-today-close>Cancelar</button><button class="primary-btn" type="submit">${icon('check')}Adicionar ao dia</button></div></form></dialog>
    `);
  }
}

function renderToday() {
  const plan = todayPlan();
  plan.items = plan.items.filter(ref => ref.type === 'custom' || todayItem(ref));
  const completed = plan.items.filter(ref => ref.completedAt).length;
  document.getElementById('todayDateHeading').textContent = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(new Date());
  document.getElementById('todayScore').textContent = `${completed}/${plan.items.length}`;
  document.getElementById('todayBadge').textContent = Math.max(0, plan.items.length - completed) || '';

  document.getElementById('todayList').innerHTML = plan.items.length ? plan.items.map(ref => {
    const item = todayItem(ref);
    const custom = ref.type === 'custom';
    const action = custom ? ref.title : item.note?.trim() || `Avançar em ${item.title}`;
    const detail = custom ? (item ? `Ação manual · ${item.title} · ${domainLabels[ref.domain]}` : 'Ação manual independente') : `${item.title} · ${domainLabels[ref.domain]} · ${clamp(item.progress)}%`;
    const canStart = item && ['reading', 'study'].includes(ref.domain) && !ref.completedAt;
    const key = todayRefKey(ref);
    return `<article class="today-row ${ref.completedAt ? 'done' : ''} ${custom ? 'custom' : ''}"><button class="today-check" data-today-toggle="${escapeHtml(key)}" aria-label="${ref.completedAt ? 'Reabrir' : 'Concluir'} ação">${ref.completedAt ? icon('check') : ''}</button><div class="today-row-main"><strong>${escapeHtml(action)}</strong><span>${escapeHtml(detail)}</span></div><div class="today-actions">${canStart ? `<button class="primary" data-start-session="${ref.domain}:${ref.itemId}">Iniciar sessão</button>` : ''}${item ? `<button data-today-open="${ref.domain}:${ref.itemId}">Abrir</button>` : ''}<button class="remove" data-today-remove="${escapeHtml(key)}">Remover</button></div></article>`;
  }).join('') : '<div class="today-empty"><strong>Nenhuma ação planejada.</strong><br>Crie uma ação livre ou escolha uma sugestão da fila.</div>';

  const selected = new Set(plan.items.filter(ref => ref.type !== 'custom').map(ref => `${ref.domain}:${ref.itemId}`));
  const candidates = todayAllCandidates().filter(entry => !selected.has(`${entry.domain}:${entry.item.id}`)).slice(0, 6);
  document.getElementById('todayCandidates').innerHTML = candidates.length ? candidates.map(({ item, domain }) => `<article class="today-candidate"><div><strong>${escapeHtml(item.note || item.title)}</strong><span>${escapeHtml(item.title)} · ${escapeHtml(domainLabels[domain])}</span></div><button data-today-add="${domain}:${item.id}">Adicionar</button></article>`).join('') : '<div class="today-empty">Todas as frentes disponíveis já estão no plano.</div>';
}

function openTodayDialog() {
  const options = todayAllCandidates().map(({ item, domain }) => `<option value="${domain}:${item.id}">${escapeHtml(domainLabels[domain])} · ${escapeHtml(item.title)}</option>`).join('');
  document.getElementById('todayActionLink').innerHTML = `<option value="">Sem vínculo</option>${options}`;
  document.getElementById('todayActionTitle').value = '';
  document.getElementById('todayDialog').showModal();
  document.getElementById('todayActionTitle').focus();
}

function saveTodayCustomAction() {
  const title = document.getElementById('todayActionTitle').value.trim();
  if (!title) return;
  const link = document.getElementById('todayActionLink').value;
  const [domain, itemId] = link ? link.split(':') : [null, null];
  todayPlan().items.push({ id: `a${Date.now()}${Math.random().toString(36).slice(2, 6)}`, type: 'custom', title, domain, itemId, completedAt: null, createdAt: new Date().toISOString() });
  document.getElementById('todayDialog').close();
  todaySave('Ação adicionada ao dia');
}

function todaySave(message) {
  todayPlan().updatedAt = new Date().toISOString();
  saveData(message);
}

todayInstallStyles();
todayInstallUi();
const renderAllWithoutToday = renderAll;
renderAll = function() { renderAllWithoutToday(); renderToday(); };

document.getElementById('todayForm').addEventListener('submit', event => { event.preventDefault(); saveTodayCustomAction(); });
document.addEventListener('click', event => {
  if (event.target.closest('[data-today-custom]')) openTodayDialog();
  if (event.target.closest('[data-today-close]')) document.getElementById('todayDialog').close();
  const add = event.target.closest('[data-today-add]');
  if (add) {
    const [domain, itemId] = add.dataset.todayAdd.split(':');
    const plan = todayPlan();
    if (!plan.items.some(ref => ref.type !== 'custom' && ref.domain === domain && ref.itemId === itemId)) plan.items.push({ domain, itemId, completedAt: null });
    todaySave('Ação adicionada ao dia');
  }
  const toggle = event.target.closest('[data-today-toggle]');
  if (toggle) {
    const ref = todayPlan().items.find(candidate => todayRefKey(candidate) === toggle.dataset.todayToggle);
    if (ref) ref.completedAt = ref.completedAt ? null : new Date().toISOString();
    todaySave(ref?.completedAt ? 'Ação concluída' : 'Ação reaberta');
  }
  const remove = event.target.closest('[data-today-remove]');
  if (remove) {
    const plan = todayPlan();
    plan.items = plan.items.filter(ref => todayRefKey(ref) !== remove.dataset.todayRemove);
    todaySave('Ação removida do dia');
  }
  const open = event.target.closest('[data-today-open]');
  if (open) {
    const [domain, itemId] = open.dataset.todayOpen.split(':');
    switchView(domain);
    setTimeout(() => document.querySelector(`[data-edit="${domain}:${itemId}"]`)?.closest('.item-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
  }
});
