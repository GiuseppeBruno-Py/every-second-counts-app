/* Compasso · Capturas, caixa de entrada e destilacao de notas */
const captureModel = globalThis.CompassoCaptureModel;
if (!captureModel) throw new Error('CompassoCaptureModel não foi carregado.');

state.data = captureModel.migrateState(state.data);

const captureRuntime = {
  atlasMode: 'notes',
  search: '',
  order: 'oldest',
  editingId: null,
  processingId: null,
  processingStep: 1,
  decision: null,
  linkedRefs: [],
  returnFocus: null,
  weeklyDismissed: false
};

const captureTypeLabels = Object.freeze({
  reading: 'Leitura', study: 'Estudo', goal: 'Meta', action: 'Ação', session: 'Sessão', note: 'Nota',
  manual: 'Manual', evidence: 'Evidência', recall: 'Active Recall'
});

const captureDecisionLabels = Object.freeze({
  note: 'Nota', recall: 'Pergunta de revisão', action: 'Próxima ação', evidence: 'Evidência', archive: 'Arquivar', discard: 'Descartar'
});

function captureNow() { return new Date().toISOString(); }
function capturePermanentId(prefix) { return `${prefix}_${crypto.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`}`; }
function captureItems() { state.data.captures = Array.isArray(state.data.captures) ? state.data.captures : []; return state.data.captures; }
function capturePending() { return captureModel.inbox(captureItems(), captureRuntime.order); }
function captureFind(id) { return captureItems().find(item => item.id === id) || null; }
function captureReplace(next) { const index = captureItems().findIndex(item => item.id === next.id); if (index < 0) throw new Error('Captura não encontrada.'); state.data.captures[index] = next; }
function captureExperienceMode() { return localStorage.getItem('compasso.ux.mode.v1') || 'essential'; }
function captureKnowledgeVisible() { return captureExperienceMode() !== 'essential'; }
function captureEmit(event, capture, resultRef = capture?.resultRef || null) {
  CompassoFeatures.emit(event, { id: capture?.id || null, source: capture?.source || null, resultRef, timestamp: captureNow() });
}

function captureShortTitle(content) {
  const firstLine = String(content || '').split(/\r?\n/).map(line => line.trim()).find(Boolean) || 'Nova nota';
  return firstLine.length <= 80 ? firstLine : `${firstLine.slice(0, 77).trimEnd()}…`;
}

function captureDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'data desconhecida' : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function captureContexts() {
  const contexts = [];
  ['reading', 'study', 'goal'].forEach(type => (state.data[type] || []).forEach(item => contexts.push({ type, id: item.id, title: item.title, detail: captureTypeLabels[type] })));
  (state.data.dailyPlans || []).forEach(plan => (plan.items || []).filter(item => item.id).forEach(item => {
    const linked = item.domain && item.itemId ? state.data[item.domain]?.find(source => source.id === item.itemId) : null;
    contexts.push({ type: 'action', id: item.id, title: item.title || linked?.note || linked?.title || 'Ação', detail: `Ação · ${plan.date || 'Hoje'}` });
  }));
  (state.data.sessions || []).slice().sort((a, b) => String(b.startedAt || '').localeCompare(String(a.startedAt || ''))).slice(0, 20).forEach(session => {
    const item = state.data[session.domain]?.find(source => source.id === session.itemId);
    contexts.push({ type: 'session', id: session.id, title: item?.title || 'Sessão', detail: `Sessão · ${captureDate(session.startedAt)}` });
  });
  (state.data.notes || []).forEach(note => contexts.push({ type: 'note', id: note.id, title: note.title, detail: 'Nota do Atlas' }));
  const seen = new Set();
  return contexts.filter(item => { const key = `${item.type}:${item.id}`; if (seen.has(key)) return false; seen.add(key); return true; });
}

function captureContext(ref) { return captureContexts().find(item => item.type === ref?.type && item.id === ref?.id) || null; }
function captureRefLabel(ref) { const context = captureContext(ref); return context ? `${captureTypeLabels[ref.type] || ref.type} · ${context.title}` : `${captureTypeLabels[ref?.type] || ref?.type || 'Item'} removido`; }

function captureRefsMarkup(selected = [], prefix = 'capture') {
  const checked = new Set((selected || []).map(ref => `${ref.type}:${ref.id}`));
  const groups = captureContexts().reduce((map, item) => { if (!map.has(item.type)) map.set(item.type, []); map.get(item.type).push(item); return map; }, new Map());
  const rows = [...groups.entries()].map(([type, items]) => `<fieldset class="capture-ref-group"><legend>${escapeHtml(captureTypeLabels[type] || type)}</legend>${items.map(item => {
    const key = `${item.type}:${item.id}`;
    return `<label class="capture-ref-option" data-capture-ref-text="${escapeHtml(`${item.title} ${item.detail}`.toLowerCase())}"><input type="checkbox" name="${prefix}" value="${escapeHtml(key)}" ${checked.has(key) ? 'checked' : ''}><span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.detail)}</small></span></label>`;
  }).join('')}</fieldset>`).join('');
  return rows || '<p class="capture-empty-inline">Ainda não existem itens para vincular.</p>';
}

function captureReadRefs(root, name) {
  return [...root.querySelectorAll(`input[name="${name}"]:checked`)].map(input => {
    const [type, ...id] = input.value.split(':');
    return { type, id: id.join(':') };
  });
}

function captureFilterRefs(root, query) {
  const normalized = String(query || '').trim().toLowerCase();
  root.querySelectorAll('.capture-ref-option').forEach(row => { row.hidden = Boolean(normalized) && !row.dataset.captureRefText.includes(normalized); });
  root.querySelectorAll('.capture-ref-group').forEach(group => { group.hidden = ![...group.querySelectorAll('.capture-ref-option')].some(row => !row.hidden); });
}

function captureInstallStyles() {
  if (document.getElementById('compassoCaptureStyles')) return;
  const style = document.createElement('style');
  style.id = 'compassoCaptureStyles';
  style.textContent = `
    .capture-inbox[hidden],#notesShell[hidden],#captureAtlasTabs[hidden]{display:none!important}.capture-global{background:var(--ink)!important;color:#fff!important;border-color:var(--ink)!important}.capture-atlas-tabs{display:flex;gap:6px;margin-right:auto}.capture-atlas-tabs button{min-height:38px;border:1px solid var(--line);border-radius:9px;background:#fff;padding:0 12px;font-size:10px;font-weight:800;cursor:pointer}.capture-atlas-tabs button.active{background:var(--ink);border-color:var(--ink);color:#fff}.capture-count{display:inline-grid;place-items:center;min-width:19px;height:19px;margin-left:5px;padding:0 5px;border-radius:999px;background:var(--violet-soft);color:var(--violet);font-size:8px}.capture-atlas-tabs button.active .capture-count{background:#ffffff24;color:#fff}
    .capture-inbox{display:grid;gap:15px}.capture-inbox-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px}.capture-inbox-head h3{margin:5px 0 0;font:800 20px/1.25 Manrope,sans-serif}.capture-inbox-head p{margin:6px 0 0;color:var(--muted);font-size:10px}.capture-inbox-tools{display:flex;gap:8px;min-width:0}.capture-inbox-tools input,.capture-inbox-tools select{min-height:40px;border:1px solid var(--line);border-radius:9px;background:#fff;padding:0 11px;font-size:10px;min-width:0}.capture-inbox-tools input{width:min(260px,42vw)}.capture-list{display:grid;gap:10px}.capture-card{border:1px solid var(--line);border-radius:15px;background:var(--surface-strong);padding:16px;box-shadow:var(--shadow);display:grid;grid-template-columns:minmax(0,1fr) auto;gap:16px}.capture-card-content{white-space:pre-wrap;overflow-wrap:anywhere;font-size:12px;line-height:1.6}.capture-card-meta,.capture-card-links{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;color:var(--muted);font-size:9px}.capture-chip{padding:4px 7px;border-radius:999px;background:var(--violet-soft);color:var(--violet);font-weight:700}.capture-card-actions{display:flex;align-items:flex-start;gap:7px;isolation:isolate}.capture-card-actions>.primary-btn{position:relative;z-index:2;min-width:88px}.capture-card-actions details{position:relative;z-index:1}.capture-card-actions details[open]{z-index:5}.capture-card-actions summary{list-style:none;width:36px;height:36px;display:grid;place-items:center;border:1px solid var(--line);border-radius:9px;background:#fff;cursor:pointer}.capture-card-actions summary svg{width:16px;height:16px}.capture-card-actions summary::-webkit-details-marker{display:none}.capture-card-menu{position:absolute;right:0;top:42px;z-index:15;width:145px;padding:6px;border:1px solid var(--line);border-radius:10px;background:#fff;box-shadow:0 14px 36px #1917122b;display:grid;gap:3px}.capture-card-menu button{border:0;background:#fff;text-align:left;min-height:33px;border-radius:7px;padding:0 9px;font-size:9px;font-weight:750;cursor:pointer}.capture-card-menu button:hover{background:var(--canvas)}.capture-card-menu .danger{color:var(--red)}.capture-empty{border:1px dashed var(--line);border-radius:14px;padding:38px;text-align:center;color:var(--muted);font-size:11px;line-height:1.6}.capture-empty strong{display:block;color:var(--ink);font-size:13px;margin-bottom:4px}
    .capture-dialog{width:min(720px,calc(100vw - 24px));max-width:100%;border:0;border-radius:20px;padding:0;background:var(--surface-strong);box-shadow:0 24px 80px #19171240}.capture-dialog::backdrop{background:#1f1e1b99;backdrop-filter:blur(3px)}.capture-dialog-head{padding:20px 22px 15px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;gap:14px}.capture-dialog-head h2{margin:4px 0 0;font:800 20px/1.2 Manrope,sans-serif}.capture-dialog-body{padding:20px 22px;display:grid;gap:15px;max-height:68vh;overflow:auto}.capture-dialog-foot{padding:14px 22px;border-top:1px solid var(--line);display:flex;justify-content:flex-end;gap:8px}.capture-dialog .field label{display:block;font-size:10px;font-weight:800;margin-bottom:7px}.capture-dialog textarea,.capture-dialog input[type="text"],.capture-dialog input[type="search"],.capture-dialog select{width:100%;border:1px solid var(--line);border-radius:10px;background:#fff;padding:10px 11px;font:inherit}.capture-dialog textarea{min-height:150px;resize:vertical}.capture-link-details{border:1px solid var(--line);border-radius:11px;padding:0 12px}.capture-link-details>summary{cursor:pointer;padding:12px 0;font-size:10px;font-weight:800}.capture-ref-search{margin-bottom:9px}.capture-ref-list{display:grid;gap:11px;max-height:260px;overflow:auto;padding:0 2px 12px}.capture-ref-group{border:0;padding:0;margin:0;display:grid;gap:5px}.capture-ref-group legend{padding:0;margin:0 0 4px;color:var(--muted);font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:.1em}.capture-ref-option{display:flex;gap:9px;align-items:flex-start;padding:8px;border-radius:8px;cursor:pointer}.capture-ref-option:hover{background:var(--canvas)}.capture-ref-option input{margin-top:2px}.capture-ref-option strong,.capture-ref-option small{display:block}.capture-ref-option strong{font-size:10px}.capture-ref-option small{color:var(--muted);font-size:8px;margin-top:2px}.capture-counter{color:var(--muted);font-size:9px;text-align:right}.capture-error{color:var(--red);font-size:10px;min-height:14px}
    .capture-steps{display:flex;gap:7px}.capture-step{height:4px;flex:1;border-radius:99px;background:var(--line)}.capture-step.active{background:var(--violet)}.capture-decisions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.capture-decision{border:1px solid var(--line);border-radius:12px;padding:12px;display:flex;gap:9px;cursor:pointer}.capture-decision:has(input:checked){border-color:var(--violet);background:var(--violet-soft)}.capture-decision input{margin-top:2px}.capture-decision strong,.capture-decision span{display:block}.capture-decision strong{font-size:11px}.capture-decision span{margin-top:4px;color:var(--muted);font-size:9px;line-height:1.45}.capture-preview{padding:12px;border-radius:11px;background:var(--canvas);font-size:10px;line-height:1.6}.capture-preview strong{color:var(--violet)}.capture-result-fields{display:grid;gap:13px}.capture-result-fields textarea{min-height:90px}.capture-warning{padding:11px 12px;border-radius:10px;background:var(--orange-soft);color:#805124;font-size:10px;line-height:1.5}
    .capture-weekly{border-left:4px solid var(--violet)}.capture-weekly-list{display:grid;gap:7px;margin:12px 0}.capture-weekly-item{padding:9px 10px;border-radius:9px;background:var(--canvas);font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.capture-weekly-actions{display:flex;gap:8px}.capture-origin-card,.capture-essence{margin:0 20px 14px;padding:11px 13px;border-radius:11px;background:var(--violet-soft);color:var(--violet);font-size:10px;line-height:1.55}.capture-origin-card button{margin-top:7px}.capture-essence strong{display:block;margin-bottom:4px}.capture-distill-dialog textarea{min-height:92px}
    @media(max-width:700px){.capture-inbox-head{display:grid}.capture-inbox-tools{display:grid;grid-template-columns:minmax(0,1fr) 125px;width:100%}.capture-inbox-tools input{width:100%}.capture-card{grid-template-columns:1fr}.capture-card-actions{justify-content:space-between}.capture-card-actions>.primary-btn{flex:1;justify-content:center}.capture-decisions{grid-template-columns:1fr}.capture-dialog-head,.capture-dialog-body,.capture-dialog-foot{padding-left:16px;padding-right:16px}.capture-dialog-foot{align-items:stretch}.capture-dialog-foot button{flex:1;justify-content:center}.capture-weekly-actions{display:grid}.capture-atlas-tabs{width:100%}.capture-atlas-tabs button{flex:1}.top-actions .capture-global{width:auto;max-width:42px;padding:0 11px}.top-actions .capture-global span{display:none}}
    @media(prefers-reduced-motion:reduce){.capture-dialog::backdrop{backdrop-filter:none}.capture-card,.capture-dialog{scroll-behavior:auto}}
  `;
  document.head.appendChild(style);
}

function captureInstallUi() {
  if (!document.getElementById('captureGlobalBtn')) {
    document.getElementById('quickAdd')?.insertAdjacentHTML('beforebegin', `<button class="secondary-btn capture-global" id="captureGlobalBtn" type="button" aria-label="Capturar ideia">${icon('lightbulb')}<span>Capturar</span></button>`);
  }
  const notesTools = document.querySelector('#notesView .view-intro .tabs-tools');
  if (notesTools && !document.getElementById('captureAtlasTabs')) notesTools.insertAdjacentHTML('afterbegin', `<div class="capture-atlas-tabs" id="captureAtlasTabs" role="tablist" aria-label="Atlas"><button type="button" class="active" data-capture-atlas="notes" role="tab" aria-selected="true">Notas</button><button type="button" data-capture-atlas="inbox" role="tab" aria-selected="false">Caixa de entrada <span class="capture-count" id="captureInboxCount" hidden></span></button></div>`);
  if (!document.getElementById('captureInboxView')) document.getElementById('notesShell')?.insertAdjacentHTML('afterend', `<section class="capture-inbox" id="captureInboxView" hidden aria-label="Caixa de entrada de capturas"></section>`);

  if (!document.getElementById('captureDialog')) document.body.insertAdjacentHTML('beforeend', `
    <dialog class="capture-dialog" id="captureDialog" aria-labelledby="captureDialogTitle"><form id="captureForm"><div class="capture-dialog-head"><div><div class="eyebrow">Captura rápida</div><h2 id="captureDialogTitle">O que você quer guardar?</h2></div><button class="close-btn" type="button" data-capture-close aria-label="Fechar">${icon('x')}</button></div><div class="capture-dialog-body"><div class="field"><label for="captureContent">O que você quer guardar?</label><textarea id="captureContent" maxlength="5000" required></textarea><div class="capture-counter"><span id="captureCharCount">0</span>/5.000</div></div><details class="capture-link-details" id="captureLinkDetails"><summary>Vincular a... <span aria-hidden="true">(opcional)</span></summary><input class="capture-ref-search" id="captureRefSearch" type="search" placeholder="Pesquisar leituras, estudos, metas, ações, sessões e notas" aria-label="Pesquisar itens para vincular"><div class="capture-ref-list" id="captureRefList"></div></details><div class="capture-error" id="captureError" role="alert"></div></div><div class="capture-dialog-foot"><button class="quiet-btn" type="button" data-capture-close>Cancelar</button><button class="primary-btn" type="submit">${icon('check')}<span id="captureSaveLabel">Salvar na caixa de entrada</span></button></div></form></dialog>`);

  if (!document.getElementById('captureProcessDialog')) document.body.insertAdjacentHTML('beforeend', `
    <dialog class="capture-dialog" id="captureProcessDialog" aria-labelledby="captureProcessTitle"><form id="captureProcessForm"><div class="capture-dialog-head"><div><div class="eyebrow">Processar captura</div><h2 id="captureProcessTitle">O que esta captura deve se tornar?</h2></div><button class="close-btn" type="button" data-capture-process-close aria-label="Fechar">${icon('x')}</button></div><div class="capture-dialog-body"><div class="capture-steps" aria-label="Etapa do processamento"><span class="capture-step" data-capture-step="1"></span><span class="capture-step" data-capture-step="2"></span><span class="capture-step" data-capture-step="3"></span></div><div id="captureProcessBody"></div><div class="capture-error" id="captureProcessError" role="alert"></div></div><div class="capture-dialog-foot"><button class="quiet-btn" id="captureProcessBack" type="button" data-capture-process-back>Voltar</button><button class="primary-btn" id="captureProcessNext" type="button" data-capture-process-next>Continuar</button><button class="primary-btn" id="captureProcessConfirm" type="submit" hidden>Confirmar</button></div></form></dialog>`);

  if (!document.getElementById('captureDistillDialog')) document.body.insertAdjacentHTML('beforeend', `
    <dialog class="capture-dialog capture-distill-dialog" id="captureDistillDialog" aria-labelledby="captureDistillTitle"><form id="captureDistillForm"><div class="capture-dialog-head"><div><div class="eyebrow">Destilar nota</div><h2 id="captureDistillTitle">Extraia o que merece reaparecer</h2></div><button class="close-btn" type="button" data-capture-distill-close aria-label="Fechar">${icon('x')}</button></div><div class="capture-dialog-body"><div class="field"><label for="captureEssence">Essência</label><textarea id="captureEssence" maxlength="800" placeholder="Qual é a ideia principal em uma frase?"></textarea></div><div class="field"><label for="captureApplication">Aplicação</label><textarea id="captureApplication" maxlength="1200" placeholder="Onde isso pode ser usado?"></textarea></div><div class="field"><label for="captureQuestion">Pergunta</label><textarea id="captureQuestion" maxlength="800" placeholder="Que pergunta testa se você realmente entendeu?"></textarea></div></div><div class="capture-dialog-foot"><button class="quiet-btn" type="button" data-capture-distill-close>Cancelar</button><button class="primary-btn" type="submit">Salvar destilação</button></div></form></dialog>`);

  if (!document.getElementById('captureSourceDialog')) document.body.insertAdjacentHTML('beforeend', `<dialog class="capture-dialog" id="captureSourceDialog" aria-labelledby="captureSourceTitle"><div class="capture-dialog-head"><div><div class="eyebrow">Origem da nota</div><h2 id="captureSourceTitle">Captura original</h2></div><button class="close-btn" type="button" data-capture-source-close aria-label="Fechar">${icon('x')}</button></div><div class="capture-dialog-body" id="captureSourceBody"></div><div class="capture-dialog-foot"><button class="primary-btn" type="button" data-capture-source-close>Fechar</button></div></dialog>`);

  const weeklyShell = document.querySelector('#weeklyView .weekly-shell');
  if (weeklyShell && !document.getElementById('captureWeeklyPanel')) weeklyShell.querySelector('.weekly-panel:last-child')?.insertAdjacentHTML('beforebegin', `<section class="weekly-panel capture-weekly" id="captureWeeklyPanel" hidden><div class="weekly-panel-head"><div><div class="eyebrow">Organização</div><h3>Processar caixa de entrada</h3><p id="captureWeeklySummary"></p></div><span class="weekly-panel-badge" id="captureWeeklyCount"></span></div><div class="capture-weekly-list" id="captureWeeklyList"></div><div class="capture-weekly-actions"><button class="primary-btn" type="button" data-capture-weekly-process>Processar agora</button><button class="quiet-btn" type="button" data-capture-weekly-later>Deixar para depois</button></div></section>`);
}

function captureOpenDialog(editingId = null) {
  const dialog = document.getElementById('captureDialog');
  const existing = editingId ? captureFind(editingId) : null;
  captureRuntime.returnFocus = document.activeElement;
  captureRuntime.editingId = existing?.id || null;
  document.getElementById('captureDialogTitle').textContent = existing ? 'Editar captura' : 'O que você quer guardar?';
  document.getElementById('captureSaveLabel').textContent = existing ? 'Salvar alterações' : 'Salvar na caixa de entrada';
  document.getElementById('captureContent').value = existing?.content || '';
  document.getElementById('captureCharCount').textContent = String(existing?.content?.length || 0);
  document.getElementById('captureRefSearch').value = '';
  document.getElementById('captureRefList').innerHTML = captureRefsMarkup(existing?.linkedRefs || [], 'captureRef');
  document.getElementById('captureLinkDetails').open = Boolean(existing?.linkedRefs?.length);
  document.getElementById('captureError').textContent = '';
  dialog.showModal();
  setTimeout(() => document.getElementById('captureContent').focus(), 30);
}

function captureCloseDialog(id) {
  document.getElementById(id)?.close();
}

function captureRestoreFocus() {
  const target = captureRuntime.returnFocus;
  captureRuntime.returnFocus = null;
  if (target?.isConnected) setTimeout(() => target.focus(), 0);
}

function captureSaveQuick() {
  const content = document.getElementById('captureContent').value;
  const refs = captureReadRefs(document.getElementById('captureForm'), 'captureRef');
  try {
    if (captureRuntime.editingId) {
      const current = captureFind(captureRuntime.editingId);
      const next = captureModel.update(current, { content, linkedRefs: refs });
      captureReplace(next);
      captureEmit('capture:updated', next);
      if (JSON.stringify(current.linkedRefs) !== JSON.stringify(next.linkedRefs)) captureEmit('capture:linked', next);
      captureCloseDialog('captureDialog');
      saveData('Captura atualizada');
    } else {
      const next = captureModel.create(content, { source: { type: 'manual', id: null }, linkedRefs: refs });
      captureItems().push(next);
      captureEmit('capture:created', next);
      if (refs.length) captureEmit('capture:linked', next);
      captureCloseDialog('captureDialog');
      saveData('Salvo na caixa de entrada');
    }
  } catch (error) {
    document.getElementById('captureError').textContent = error.message || 'Não foi possível salvar a captura.';
    document.getElementById('captureContent').focus();
  }
}

function captureRenderInbox() {
  const container = document.getElementById('captureInboxView');
  if (!container) return;
  const query = captureRuntime.search.trim().toLowerCase();
  const items = capturePending().filter(item => !query || item.content.toLowerCase().includes(query) || item.linkedRefs.some(ref => captureRefLabel(ref).toLowerCase().includes(query)));
  container.innerHTML = `<div class="capture-inbox-head"><div><div class="eyebrow">Atlas pessoal</div><h3>Caixa de entrada</h3><p>Decida o que merece virar conhecimento, ação ou evidência.</p></div><div class="capture-inbox-tools"><input id="captureInboxSearch" type="search" value="${escapeHtml(captureRuntime.search)}" placeholder="Buscar capturas..." aria-label="Buscar na caixa de entrada"><select id="captureInboxOrder" aria-label="Ordenar capturas"><option value="oldest" ${captureRuntime.order === 'oldest' ? 'selected' : ''}>Mais antigas</option><option value="newest" ${captureRuntime.order === 'newest' ? 'selected' : ''}>Mais recentes</option></select></div></div><div class="capture-list">${items.length ? items.map(item => `<article class="capture-card" data-capture-card="${escapeHtml(item.id)}"><div><div class="capture-card-content">${escapeHtml(item.content)}</div><div class="capture-card-meta"><span>${escapeHtml(captureDate(item.createdAt))}</span>${item.source?.type !== 'manual' ? `<span>Origem: ${escapeHtml(captureTypeLabels[item.source.type] || item.source.type)}</span>` : ''}</div>${item.linkedRefs.length ? `<div class="capture-card-links">${item.linkedRefs.map(ref => `<span class="capture-chip">${escapeHtml(captureRefLabel(ref))}</span>`).join('')}</div>` : ''}</div><div class="capture-card-actions"><button class="primary-btn" type="button" data-capture-process="${escapeHtml(item.id)}">Processar</button><details><summary aria-label="Mais opções">${icon('more')}</summary><div class="capture-card-menu"><button type="button" data-capture-edit="${escapeHtml(item.id)}">Editar</button><button type="button" data-capture-archive="${escapeHtml(item.id)}">Arquivar</button><button class="danger" type="button" data-capture-delete="${escapeHtml(item.id)}">Excluir</button></div></details></div></article>`).join('') : `<div class="capture-empty"><strong>Nenhuma captura aguardando processamento.</strong>As ideias que você guardar aparecerão aqui.</div>`}</div>`;
  document.getElementById('captureInboxSearch')?.addEventListener('input', event => { captureRuntime.search = event.target.value; captureRenderInbox(); document.getElementById('captureInboxSearch')?.focus(); });
  document.getElementById('captureInboxOrder')?.addEventListener('change', event => { captureRuntime.order = event.target.value; captureRenderInbox(); });
}

function captureRenderAtlasSurface() {
  const pending = captureModel.pendingCount(captureItems());
  const count = document.getElementById('captureInboxCount');
  if (count) { count.textContent = String(pending); count.hidden = pending === 0; }
  const tabs = document.getElementById('captureAtlasTabs');
  const available = captureKnowledgeVisible();
  if (tabs) tabs.hidden = !available;
  if (!available) captureRuntime.atlasMode = 'notes';
  document.querySelectorAll('[data-capture-atlas]').forEach(button => { const active = button.dataset.captureAtlas === captureRuntime.atlasMode; button.classList.toggle('active', active); button.setAttribute('aria-selected', String(active)); });
  const shell = document.getElementById('notesShell');
  const inbox = document.getElementById('captureInboxView');
  if (shell) shell.hidden = captureRuntime.atlasMode === 'inbox';
  if (inbox) inbox.hidden = captureRuntime.atlasMode !== 'inbox';
  if (captureRuntime.atlasMode === 'inbox') captureRenderInbox();
}

function captureDecisionMarkup() {
  const options = [
    ['note', 'Nota', 'Desenvolver ou reutilizar a informação.'],
    ['recall', 'Pergunta de revisão', 'Lembrar e testar o conhecimento.'],
    ['action', 'Próxima ação', 'Executar algo concreto.'],
    ['evidence', 'Evidência', 'Comprovar avanço, resultado ou aprendizado.'],
    ['archive', 'Arquivar', 'Guardar sem exigir ação agora.'],
    ['discard', 'Descartar', 'Remover algo sem valor posterior.']
  ];
  return `<div class="capture-decisions">${options.map(([value, label, detail]) => `<label class="capture-decision"><input type="radio" name="captureDecision" value="${value}" ${captureRuntime.decision === value ? 'checked' : ''}><span><strong>${label}</strong><span>${detail}</span></span></label>`).join('')}</div>`;
}

function captureResultFields(capture) {
  const primary = captureRuntime.linkedRefs.find(ref => ['reading', 'study', 'goal'].includes(ref.type));
  if (captureRuntime.decision === 'note') return `<div class="capture-result-fields"><div class="field"><label for="captureResultTitle">Título da nota</label><input id="captureResultTitle" type="text" maxlength="100" value="${escapeHtml(captureShortTitle(capture.content))}" required></div></div>`;
  if (captureRuntime.decision === 'recall') return `<div class="capture-result-fields"><div class="field"><label for="captureRecallPrompt">Pergunta</label><textarea id="captureRecallPrompt" maxlength="700" required placeholder="Que pergunta você quer conseguir responder?"></textarea></div><div class="field"><label for="captureRecallAnswer">Resposta</label><textarea id="captureRecallAnswer" maxlength="1800" required>${escapeHtml(capture.content.slice(0, 1800))}</textarea></div></div>`;
  if (captureRuntime.decision === 'action') return `<div class="capture-result-fields"><div class="field"><label for="captureActionTitle">Título</label><input id="captureActionTitle" type="text" maxlength="180" value="${escapeHtml(captureShortTitle(capture.content))}" required></div><div class="field"><label for="captureActionOutcome">Resultado esperado</label><input id="captureActionOutcome" type="text" maxlength="180" placeholder="Como saberei que a ação terminou?"></div>${!primary ? '<div class="capture-warning">Você pode criar uma ação independente. Para conectá-la a uma frente, volte e selecione uma leitura, estudo ou meta.</div>' : ''}</div>`;
  if (captureRuntime.decision === 'evidence') return `<div class="capture-result-fields"><div class="field"><label for="captureEvidenceSummary">Descrição</label><input id="captureEvidenceSummary" type="text" maxlength="180" value="${escapeHtml(captureShortTitle(capture.content))}" required></div><div class="field"><label for="captureEvidenceType">Tipo de evidência</label><select id="captureEvidenceType">${Object.entries(typeof evidenceTypeLabels === 'object' ? evidenceTypeLabels : { insight: 'Insight', note: 'Nota produzida', exercise: 'Exercício ou prática', decision: 'Decisão', question: 'Pergunta aberta', deliverable: 'Entrega concreta' }).map(([value, label]) => `<option value="${value}">${escapeHtml(label)}</option>`).join('')}</select></div><div class="field"><label for="captureEvidenceDetails">Detalhes</label><textarea id="captureEvidenceDetails" maxlength="500">${escapeHtml(capture.content)}</textarea></div><div class="capture-warning">Uma evidência exige uma leitura, estudo, meta ou sessão válida como contexto.</div></div>`;
  if (captureRuntime.decision === 'archive') return '<div class="capture-warning">A captura sairá da caixa de entrada e continuará preservada no histórico interno.</div>';
  return '<div class="capture-warning">A captura será marcada como descartada e sairá da caixa de entrada.</div>';
}

function captureRenderProcess() {
  const capture = captureFind(captureRuntime.processingId);
  if (!capture) return;
  const step = captureRuntime.processingStep;
  document.querySelectorAll('[data-capture-step]').forEach(marker => marker.classList.toggle('active', Number(marker.dataset.captureStep) <= step));
  document.getElementById('captureProcessBack').hidden = step === 1;
  document.getElementById('captureProcessNext').hidden = step === 3;
  document.getElementById('captureProcessConfirm').hidden = step !== 3;
  document.getElementById('captureProcessTitle').textContent = step === 1 ? 'O que esta captura deve se tornar?' : step === 2 ? 'A que isso está relacionado?' : 'Confirmar transformação';
  const body = document.getElementById('captureProcessBody');
  if (step === 1) body.innerHTML = `${captureDecisionMarkup()}<div class="capture-preview" style="margin-top:14px"><strong>Captura</strong><br>${escapeHtml(capture.content.slice(0, 320))}${capture.content.length > 320 ? '…' : ''}</div>`;
  if (step === 2) body.innerHTML = `<p style="margin:0 0 12px;color:var(--muted);font-size:10px">Os vínculos atuais foram reaproveitados. O contexto é opcional, exceto para evidências.</p><input class="capture-ref-search" id="captureProcessRefSearch" type="search" placeholder="Pesquisar contextos" aria-label="Pesquisar contextos"><div class="capture-ref-list" id="captureProcessRefList">${captureRefsMarkup(captureRuntime.linkedRefs, 'captureProcessRef')}</div>`;
  if (step === 3) {
    const relation = captureRuntime.linkedRefs.length ? captureRuntime.linkedRefs.map(captureRefLabel).join(', ') : 'Sem contexto';
    body.innerHTML = `<div class="capture-preview"><strong>Transformar em:</strong> ${escapeHtml(captureDecisionLabels[captureRuntime.decision])}<br><strong>Relacionado a:</strong> ${escapeHtml(relation)}</div>${captureResultFields(capture)}`;
    document.getElementById('captureProcessConfirm').textContent = captureRuntime.decision === 'note' ? 'Criar nota' : captureRuntime.decision === 'recall' ? 'Criar pergunta' : captureRuntime.decision === 'action' ? 'Criar ação' : captureRuntime.decision === 'evidence' ? 'Criar evidência' : captureRuntime.decision === 'archive' ? 'Arquivar' : 'Descartar';
  }
  document.getElementById('captureProcessError').textContent = '';
}

function captureOpenProcess(id) {
  const capture = captureFind(id);
  if (!capture || capture.status !== 'inbox') return;
  captureRuntime.returnFocus = document.activeElement;
  captureRuntime.processingId = id;
  captureRuntime.processingStep = 1;
  captureRuntime.decision = null;
  captureRuntime.linkedRefs = capture.linkedRefs.map(ref => ({ ...ref }));
  captureEmit('capture:processing-started', capture);
  captureRenderProcess();
  document.getElementById('captureProcessDialog').showModal();
}

function captureProcessNext() {
  if (captureRuntime.processingStep === 1) {
    const decision = document.querySelector('input[name="captureDecision"]:checked')?.value;
    if (!decision) { document.getElementById('captureProcessError').textContent = 'Escolha o destino da captura.'; return; }
    captureRuntime.decision = decision;
    captureRuntime.processingStep = 2;
  } else if (captureRuntime.processingStep === 2) {
    captureRuntime.linkedRefs = captureReadRefs(document.getElementById('captureProcessForm'), 'captureProcessRef');
    captureRuntime.processingStep = 3;
  }
  captureRenderProcess();
}

function capturePrimaryFront(refs) { return refs.find(ref => ['reading', 'study', 'goal'].includes(ref.type)) || null; }
function captureSessionContext(refs) {
  const ref = refs.find(item => item.type === 'session');
  return ref ? state.data.sessions?.find(item => item.id === ref.id) || null : null;
}

function captureCreateNote(capture) {
  const title = document.getElementById('captureResultTitle').value.trim();
  if (!title) throw new Error('Informe o título da nota.');
  const primary = capturePrimaryFront(captureRuntime.linkedRefs);
  const item = primary ? state.data[primary.type]?.find(source => source.id === primary.id) : null;
  const folderId = primary ? defaultFolderFor(primary.type, item) : (state.data.folders.find(folder => folder.id === 'f-inbox')?.id || state.data.folders[0]?.id);
  const now = captureNow();
  const note = {
    id: capturePermanentId('note'), title, folder: folderId, domain: primary?.type || 'inbox', linkedItemId: primary?.id || null,
    linkedRefs: captureRuntime.linkedRefs.map(ref => ({ ...ref })), tags: [], updated: now.slice(0, 10), createdAt: now, updatedAt: now,
    content: capture.content, sourceCaptureId: capture.id,
    distillation: { essence: '', application: '', question: '', updatedAt: null }
  };
  state.data.notes.push(note);
  return { resultRef: { type: 'note', id: note.id }, open: () => { captureRuntime.atlasMode = 'notes'; openNote(note.id); captureRender(); } };
}

function captureCreateRecall(capture) {
  const prompt = document.getElementById('captureRecallPrompt').value.trim();
  const answer = document.getElementById('captureRecallAnswer').value.trim();
  if (!prompt || !answer) throw new Error('Revise e preencha a pergunta e a resposta.');
  const primary = capturePrimaryFront(captureRuntime.linkedRefs);
  const now = captureNow();
  const card = { id: capturePermanentId('recall'), schemaVersion: typeof RECALL_FEATURE_VERSION === 'number' ? RECALL_FEATURE_VERSION : 2, sourceType: 'capture', sourceId: capture.id, domain: primary?.type || null, itemId: primary?.id || null, prompt, answer, reviewCount: 0, intervalDays: 0, dueAt: now, lastReviewedAt: null, lastRating: null, reviewHistory: [], createdAt: now, updatedAt: now };
  state.data.reviewItems = Array.isArray(state.data.reviewItems) ? state.data.reviewItems : [];
  state.data.reviewItems.unshift(card);
  return { resultRef: { type: 'recall', id: card.id }, open: () => switchView('recall') };
}

function captureCreateAction(capture) {
  const title = document.getElementById('captureActionTitle').value.trim();
  if (!title) throw new Error('Informe o título da ação.');
  const primary = capturePrimaryFront(captureRuntime.linkedRefs);
  const now = captureNow();
  const action = { id: capturePermanentId('action'), type: 'custom', title, expectedOutcome: document.getElementById('captureActionOutcome').value.trim(), domain: primary?.type || null, itemId: primary?.id || null, completedAt: null, createdAt: now, updatedAt: now, sourceCaptureId: capture.id };
  todayPlan().items.push(action);
  return { resultRef: { type: 'action', id: action.id }, open: () => switchView('today') };
}

function captureCreateEvidence(capture) {
  const session = captureSessionContext(captureRuntime.linkedRefs);
  const primary = capturePrimaryFront(captureRuntime.linkedRefs);
  const domain = session?.domain || primary?.type;
  const itemId = session?.itemId || primary?.id;
  if (!domain || !itemId || !state.data[domain]?.some(item => item.id === itemId)) throw new Error('Selecione uma leitura, estudo, meta ou sessão válida para criar a evidência.');
  const summary = document.getElementById('captureEvidenceSummary').value.trim();
  if (!summary) throw new Error('Informe a descrição da evidência.');
  const now = captureNow();
  const evidence = { id: capturePermanentId('evidence'), schemaVersion: typeof EVIDENCE_FEATURE_VERSION === 'number' ? EVIDENCE_FEATURE_VERSION : 1, sessionId: session?.id || null, itemId, domain, type: document.getElementById('captureEvidenceType').value, summary, details: document.getElementById('captureEvidenceDetails').value.trim(), sourceCaptureId: capture.id, createdAt: now, updatedAt: now };
  state.data.evidence = Array.isArray(state.data.evidence) ? state.data.evidence : [];
  state.data.evidence.unshift(evidence);
  return { resultRef: { type: 'evidence', id: evidence.id }, open: () => switchView(domain) };
}

function captureConfirmProcess() {
  const capture = captureFind(captureRuntime.processingId);
  if (!capture) return;
  try {
    let result = { resultRef: null, open: null };
    if (captureRuntime.decision === 'note') result = captureCreateNote(capture);
    if (captureRuntime.decision === 'recall') result = captureCreateRecall(capture);
    if (captureRuntime.decision === 'action') result = captureCreateAction(capture);
    if (captureRuntime.decision === 'evidence') result = captureCreateEvidence(capture);
    const next = captureModel.markProcessed(captureModel.update(capture, { linkedRefs: captureRuntime.linkedRefs }), captureRuntime.decision, result.resultRef);
    captureReplace(next);
    captureEmit(captureRuntime.decision === 'archive' ? 'capture:archived' : captureRuntime.decision === 'discard' ? 'capture:deleted' : 'capture:processed', next, result.resultRef);
    captureCloseDialog('captureProcessDialog');
    saveData(captureRuntime.decision === 'archive' ? 'Captura arquivada' : captureRuntime.decision === 'discard' ? 'Captura descartada' : `${captureDecisionLabels[captureRuntime.decision]} criada`);
    result.open?.();
  } catch (error) {
    document.getElementById('captureProcessError').textContent = error.message || 'Não foi possível processar a captura.';
  }
}

function captureArchive(id) {
  const current = captureFind(id); if (!current) return;
  const next = captureModel.archive(current); captureReplace(next); captureEmit('capture:archived', next); saveData('Captura arquivada');
}

function captureDelete(id) {
  const current = captureFind(id); if (!current) return;
  const next = captureModel.markDeleted(current); captureReplace(next); captureEmit('capture:deleted', next); saveData('Captura excluída');
}

function captureDistillation(note) {
  const current = note?.distillation && typeof note.distillation === 'object' ? note.distillation : {};
  return { essence: String(current.essence || ''), application: String(current.application || ''), question: String(current.question || ''), updatedAt: current.updatedAt || null };
}

function captureMarkdownForNote(note) {
  let markdown = String(note?.content || '');
  const distillation = captureDistillation(note);
  const sections = [
    ['Essência', distillation.essence], ['Aplicação', distillation.application], ['Pergunta para revisão', distillation.question]
  ];
  sections.forEach(([heading, value]) => {
    if (!value || new RegExp(`(^|\\n)##\\s+${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(\\n|$)`, 'i').test(markdown)) return;
    markdown = `${markdown.trimEnd()}\n\n## ${heading}\n\n${value}\n`;
  });
  return markdown;
}

function captureEnhanceNote() {
  if (captureRuntime.atlasMode !== 'notes' || !captureKnowledgeVisible()) return;
  const note = state.data.notes.find(item => item.id === state.selectedNoteId);
  if (!note) return;
  const actions = document.querySelector('#notesShell .note-actions');
  if (actions && !actions.querySelector('[data-capture-distill]')) actions.insertAdjacentHTML('afterbegin', `<button type="button" data-capture-distill="${escapeHtml(note.id)}">Destilar</button>`);
  const workspace = document.querySelector('#notesShell .note-workspace');
  const distillation = captureDistillation(note);
  if (workspace && distillation.essence && !workspace.querySelector('.capture-essence')) workspace.querySelector('.note-header')?.insertAdjacentHTML('afterend', `<div class="capture-essence"><strong>Essência</strong>${escapeHtml(distillation.essence)}</div>`);
  const context = document.querySelector('#notesShell .note-context');
  if (context && note.sourceCaptureId && !context.querySelector('.capture-origin-card')) context.insertAdjacentHTML('afterbegin', `<section class="capture-origin-card"><strong>Origem</strong><br>Esta nota foi criada a partir de uma captura.<br><button class="quiet-btn" type="button" data-capture-source="${escapeHtml(note.sourceCaptureId)}">Ver captura original</button></section>`);
}

function captureOpenDistill(noteId) {
  const note = state.data.notes.find(item => item.id === noteId); if (!note) return;
  captureRuntime.returnFocus = document.activeElement;
  const distillation = captureDistillation(note);
  document.getElementById('captureDistillForm').dataset.noteId = note.id;
  document.getElementById('captureEssence').value = distillation.essence;
  document.getElementById('captureApplication').value = distillation.application;
  document.getElementById('captureQuestion').value = distillation.question;
  document.getElementById('captureDistillDialog').showModal();
  document.getElementById('captureEssence').focus();
}

function captureSaveDistill() {
  const note = state.data.notes.find(item => item.id === document.getElementById('captureDistillForm').dataset.noteId); if (!note) return;
  const now = captureNow();
  note.distillation = { essence: document.getElementById('captureEssence').value.trim(), application: document.getElementById('captureApplication').value.trim(), question: document.getElementById('captureQuestion').value.trim(), updatedAt: now };
  note.updated = now.slice(0, 10); note.updatedAt = now;
  captureCloseDialog('captureDistillDialog');
  CompassoFeatures.emit('note:distilled', { id: note.id, source: note.sourceCaptureId ? { type: 'capture', id: note.sourceCaptureId } : null, resultRef: null, timestamp: now });
  saveData('Destilação salva');
}

function captureOpenSource(id) {
  const capture = captureFind(id); if (!capture) return;
  captureRuntime.returnFocus = document.activeElement;
  document.getElementById('captureSourceBody').innerHTML = `<div class="capture-card-content">${escapeHtml(capture.content)}</div><div class="capture-card-meta"><span>${escapeHtml(captureDate(capture.createdAt))}</span><span>${escapeHtml(captureDecisionLabels[capture.processingDecision] || 'Captura')}</span></div>${capture.linkedRefs.length ? `<div class="capture-card-links">${capture.linkedRefs.map(ref => `<span class="capture-chip">${escapeHtml(captureRefLabel(ref))}</span>`).join('')}</div>` : ''}`;
  document.getElementById('captureSourceDialog').showModal();
}

function captureRenderWeekly() {
  const panel = document.getElementById('captureWeeklyPanel'); if (!panel) return;
  const items = captureModel.inbox(captureItems(), 'oldest');
  panel.hidden = !items.length || captureRuntime.weeklyDismissed;
  if (panel.hidden) return;
  document.getElementById('captureWeeklyCount').textContent = `${items.length} ${items.length === 1 ? 'captura' : 'capturas'}`;
  document.getElementById('captureWeeklySummary').textContent = 'Revise as ideias mais antigas sem precisar zerar a caixa de entrada.';
  document.getElementById('captureWeeklyList').innerHTML = items.slice(0, 3).map(item => `<div class="capture-weekly-item">${escapeHtml(item.content.replace(/\s+/g, ' ').slice(0, 150))}</div>`).join('');
}

function captureRender() {
  captureRenderAtlasSurface();
  captureEnhanceNote();
  captureRenderWeekly();
}

captureInstallStyles();
captureInstallUi();

CompassoFeatures.register('captures', { order: 700, afterRender: captureRender });
CompassoFeatures.action('#captureGlobalBtn', () => captureOpenDialog());
CompassoFeatures.action('[data-capture-atlas]', ({ target }) => { captureRuntime.atlasMode = target.dataset.captureAtlas; captureRenderAtlasSurface(); });
CompassoFeatures.action('[data-capture-process]', ({ target }) => captureOpenProcess(target.dataset.captureProcess));
CompassoFeatures.action('[data-capture-edit]', ({ target }) => captureOpenDialog(target.dataset.captureEdit));
CompassoFeatures.action('[data-capture-archive]', ({ target }) => captureArchive(target.dataset.captureArchive));
CompassoFeatures.action('[data-capture-delete]', ({ target }) => { if (confirm('Excluir esta captura?')) captureDelete(target.dataset.captureDelete); });
CompassoFeatures.action('[data-capture-close]', () => captureCloseDialog('captureDialog'));
CompassoFeatures.action('[data-capture-process-close]', () => captureCloseDialog('captureProcessDialog'));
CompassoFeatures.action('[data-capture-process-next]', () => captureProcessNext());
CompassoFeatures.action('[data-capture-process-back]', () => { captureRuntime.processingStep = Math.max(1, captureRuntime.processingStep - 1); captureRenderProcess(); });
CompassoFeatures.action('[data-capture-distill]', ({ target }) => captureOpenDistill(target.dataset.captureDistill));
CompassoFeatures.action('[data-capture-distill-close]', () => captureCloseDialog('captureDistillDialog'));
CompassoFeatures.action('[data-capture-source]', ({ target }) => captureOpenSource(target.dataset.captureSource));
CompassoFeatures.action('[data-capture-source-close]', () => captureCloseDialog('captureSourceDialog'));
CompassoFeatures.action('[data-capture-weekly-process]', () => { const oldest = captureModel.inbox(captureItems(), 'oldest')[0]; if (oldest) captureOpenProcess(oldest.id); });
CompassoFeatures.action('[data-capture-weekly-later]', () => { captureRuntime.weeklyDismissed = true; captureRenderWeekly(); });
CompassoFeatures.action('[data-ux-mode]', () => queueMicrotask(captureRender), { order: 1100 });

document.getElementById('captureForm').addEventListener('submit', event => { event.preventDefault(); captureSaveQuick(); });
document.getElementById('captureContent').addEventListener('input', event => { document.getElementById('captureCharCount').textContent = String(event.target.value.length); });
document.getElementById('captureRefSearch').addEventListener('input', event => captureFilterRefs(document.getElementById('captureRefList'), event.target.value));
document.getElementById('captureProcessForm').addEventListener('submit', event => { event.preventDefault(); if (captureRuntime.processingStep === 3) captureConfirmProcess(); });
document.getElementById('captureProcessBody').addEventListener('input', event => { if (event.target.id === 'captureProcessRefSearch') captureFilterRefs(document.getElementById('captureProcessRefList'), event.target.value); });
document.getElementById('captureDistillForm').addEventListener('submit', event => { event.preventDefault(); captureSaveDistill(); });
['captureDialog', 'captureProcessDialog', 'captureDistillDialog', 'captureSourceDialog'].forEach(id => document.getElementById(id)?.addEventListener('close', captureRestoreFocus));

globalThis.CompassoCaptureFeature = Object.freeze({
  open: captureOpenDialog,
  openInbox() { captureRuntime.atlasMode = 'inbox'; switchView('notes'); captureRenderAtlasSurface(); },
  noteMarkdown: captureMarkdownForNote,
  pendingCount: () => captureModel.pendingCount(captureItems())
});
