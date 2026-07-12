/* Compasso · Hoje e próximas ações
 * Fecha a fase operacional do ciclo: planejar, executar e registrar evidência.
 * Injetado pelo service worker dentro do módulo principal.
 */

const TODAY_FEATURE_VERSION = 1;
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
  return state.data[ref.domain]?.find(item => item.id === ref.itemId) || null;
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
    .today-shell{display:grid;gap:18px}.today-hero{background:#302f2a;color:#fff;border-radius:22px;padding:27px 29px;display:flex;align-items:flex-end;justify-content:space-between;gap:24px;box-shadow:var(--shadow);overflow:hidden;position:relative}.today-hero::after{content:"";position:absolute;width:225px;height:225px;border:42px solid rgba(184,176,255,.1);border-radius:50%;right:-60px;top:-105px}.today-hero>*{position:relative;z-index:1}.today-hero .eyebrow{color:#aaa79f}.today-hero h2{margin:8px 0 7px;font:800 clamp(24px,3vw,36px)/1.15 Manrope,sans-serif;letter-spacing:-.05em}.today-hero p{margin:0;color:#bbb8b0;font-size:12px;line-height:1.6}.today-score{min-width:150px;text-align:right}.today-score strong{display:block;font:800 34px/1 Manrope,sans-serif}.today-score span{display:block;margin-top:7px;color:#bbb8b0;font-size:10px}.today-grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(300px,.75fr);gap:18px}.today-panel{background:var(--surface-strong);border:1px solid var(--line);border-radius:18px;padding:21px;box-shadow:var(--shadow)}.today-panel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:15px}.today-panel-head h3{margin:4px 0 0;font:800 17px/1.25 Manrope,sans-serif}.today-panel-head p{margin:5px 0 0;color:var(--muted);font-size:10px;line-height:1.5}.today-list,.today-candidates{display:grid;gap:9px}.today-row{border:1px solid var(--line);border-radius:13px;padding:13px;display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:11px}.today-row.done{background:var(--green-soft);border-color:#cce6dd}.today-check{width:24px;height:24px;border:1px solid var(--line);border-radius:7px;background:#fff;display:grid;place-items:center;color:var(--green);cursor:pointer}.today-check svg{width:15px;height:15px}.today-row-main strong{display:block;font-size:11px}.today-row-main span{display:block;color:var(--muted);font-size:9px;margin-top:4px;line-height:1.45}.today-row.done .today-row-main strong{text-decoration:line-through;color:var(--muted)}.today-actions{display:flex;gap:6px}.today-actions button,.today-candidate button{border:1px solid var(--line);border-radius:8px;background:#fff;min-height:31px;padding:0 9px;color:var(--ink);font-size:9px;font-weight:800;cursor:pointer}.today-actions button.primary{background:var(--ink);border-color:var(--ink);color:#fff}.today-actions button.remove{color:var(--red)}.today-candidate{border-top:1px solid var(--line);padding:11px 0;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center}.today-candidate:first-child{border-top:0;padding-top:0}.today-candidate strong{display:block;font-size:11px}.today-candidate span{display:block;color:var(--muted);font-size:9px;margin-top:4px}.today-empty{border:1px dashed var(--line);border-radius:12px;padding:26px;text-align:center;color:var(--muted);font-size:11px;line-height:1.55}.today-note{margin-top:14px;padding:12px;border-radius:11px;background:var(--violet-soft);color:var(--violet);font-size:10px;line-height:1.55}
    @media(max-width:920px){.today-grid{grid-template-columns:1fr}.today-hero{align-items:flex-start;flex-direction:column}.today-score{text-align:left}}
    @media(max-width:620px){.today-hero{padding:22px 20px}.today-panel{padding:17px}.today-row{grid-template-columns:auto minmax(0,1fr)}.today-actions{grid-column:2;flex-wrap:wrap}}
  `;
  document.head.appendChild(style);
}

function todayInstallUi() {
  if (!document.querySelector('[data-view="today"]')) {
    const overviewNav = document.querySelector('[data-view="overview"]');
    overviewNav?.insertAdjacentHTML('beforebegin', `<button class="nav-item" data-view="today">${icon('calendar')}<span>Hoje</span><span class="nav-badge" id="todayBadge"></span></button>`);
  }
  if (document.getElementById('todayView')) return;
  document.querySelector('.content')?.insertAdjacentHTML('afterbegin', `
    <section class="view" id="todayView">
      <div class="today-shell">
        <section class="today-hero">
          <div><div class="eyebrow" id="todayDateHeading"></div><h2>Escolha pouco.<br>Conclua o que importa.</h2><p>Transforme o foco da semana em próximas ações executáveis para hoje.</p></div>
          <div class="today-score"><strong id="todayScore">0/0</strong><span>ações concluídas hoje</span></div>
        </section>
        <div class="today-grid">
          <section class="today-panel"><div class="today-panel-head"><div><div class="eyebrow">Plano do dia</div><h3>Próximas ações</h3><p>Concluir marca a ação; iniciar uma sessão registra tempo, progresso e evidência.</p></div></div><div class="today-list" id="todayList"></div></section>
          <section class="today-panel"><div class="today-panel-head"><div><div class="eyebrow">Fila inteligente</div><h3>Adicionar ao dia</h3><p>Prioriza o foco semanal e as frentes ativas.</p></div></div><div class="today-candidates" id="todayCandidates"></div><div class="today-note">Mantenha de uma a três ações. Uma lista curta facilita escolher, executar e encerrar o ciclo com evidência.</div></section>
        </div>
      </div>
    </section>
  `);
}

function renderToday() {
  const plan = todayPlan();
  plan.items = plan.items.filter(ref => todayItem(ref));
  const completed = plan.items.filter(ref => ref.completedAt).length;
  const formatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
  document.getElementById('todayDateHeading').textContent = formatter.format(new Date());
  document.getElementById('todayScore').textContent = `${completed}/${plan.items.length}`;
  document.getElementById('todayBadge').textContent = Math.max(0, plan.items.length - completed) || '';

  const list = document.getElementById('todayList');
  list.innerHTML = plan.items.length ? plan.items.map(ref => {
    const item = todayItem(ref);
    const action = item.note?.trim() || `Avançar em ${item.title}`;
    const canStart = ['reading', 'study'].includes(ref.domain) && !ref.completedAt;
    return `<article class="today-row ${ref.completedAt ? 'done' : ''}"><button class="today-check" data-today-toggle="${ref.domain}:${ref.itemId}" aria-label="${ref.completedAt ? 'Reabrir' : 'Concluir'} ação">${ref.completedAt ? icon('check') : ''}</button><div class="today-row-main"><strong>${escapeHtml(action)}</strong><span>${escapeHtml(item.title)} · ${escapeHtml(domainLabels[ref.domain])} · ${clamp(item.progress)}%</span></div><div class="today-actions">${canStart ? `<button class="primary" data-start-session="${ref.domain}:${ref.itemId}">Iniciar sessão</button>` : ''}<button data-today-open="${ref.domain}:${ref.itemId}">Abrir</button><button class="remove" data-today-remove="${ref.domain}:${ref.itemId}">Remover</button></div></article>`;
  }).join('') : '<div class="today-empty"><strong>Nenhuma ação planejada.</strong><br>Escolha uma frente ao lado e defina um próximo movimento concreto.</div>';

  const selected = new Set(plan.items.map(ref => `${ref.domain}:${ref.itemId}`));
  const candidates = todayAllCandidates().filter(entry => !selected.has(`${entry.domain}:${entry.item.id}`)).slice(0, 6);
  document.getElementById('todayCandidates').innerHTML = candidates.length ? candidates.map(({ item, domain }) => `<article class="today-candidate"><div><strong>${escapeHtml(item.note || item.title)}</strong><span>${escapeHtml(item.title)} · ${escapeHtml(domainLabels[domain])}</span></div><button data-today-add="${domain}:${item.id}">Adicionar</button></article>`).join('') : '<div class="today-empty">Todas as frentes disponíveis já estão no plano.</div>';
}

function todaySave(message) {
  todayPlan().updatedAt = new Date().toISOString();
  saveData(message);
}

todayInstallStyles();
todayInstallUi();

const renderAllWithoutToday = renderAll;
renderAll = function() {
  renderAllWithoutToday();
  renderToday();
};

document.addEventListener('click', event => {
  const add = event.target.closest('[data-today-add]');
  if (add) {
    const [domain, itemId] = add.dataset.todayAdd.split(':');
    const plan = todayPlan();
    if (!plan.items.some(ref => ref.domain === domain && ref.itemId === itemId)) plan.items.push({ domain, itemId, completedAt: null });
    todaySave('Ação adicionada ao dia');
  }
  const toggle = event.target.closest('[data-today-toggle]');
  if (toggle) {
    const [domain, itemId] = toggle.dataset.todayToggle.split(':');
    const ref = todayPlan().items.find(candidate => candidate.domain === domain && candidate.itemId === itemId);
    if (ref) ref.completedAt = ref.completedAt ? null : new Date().toISOString();
    todaySave(ref?.completedAt ? 'Ação concluída' : 'Ação reaberta');
  }
  const remove = event.target.closest('[data-today-remove]');
  if (remove) {
    const [domain, itemId] = remove.dataset.todayRemove.split(':');
    const plan = todayPlan();
    plan.items = plan.items.filter(ref => ref.domain !== domain || ref.itemId !== itemId);
    todaySave('Ação removida do dia');
  }
  const open = event.target.closest('[data-today-open]');
  if (open) {
    const [domain, itemId] = open.dataset.todayOpen.split(':');
    switchView(domain);
    setTimeout(() => document.querySelector(`[data-edit="${domain}:${itemId}"]`)?.closest('.item-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
  }
});
