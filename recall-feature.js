/* Compasso · Active Recall a partir de evidências e notas
 * Fase 2.1: transforma registros do sistema em perguntas praticáveis.
 * Injetado pelo service worker após sessões e evidências.
 */

const RECALL_FEATURE_VERSION = 1;
state.data.reviewItems = Array.isArray(state.data.reviewItems) ? state.data.reviewItems : [];
labels.recall = { title: 'Active Recall', kicker: 'Recuperação ativa' };

const recallRuntime = {
  currentId: null,
  revealed: false,
  editingId: null,
  source: null
};

function recallItems() {
  state.data.reviewItems = Array.isArray(state.data.reviewItems) ? state.data.reviewItems : [];
  return state.data.reviewItems;
}

function recallEvidence() {
  state.data.evidence = Array.isArray(state.data.evidence) ? state.data.evidence : [];
  return state.data.evidence;
}

function recallId() {
  return `r${Date.now()}${Math.random().toString(36).slice(2, 7)}`;
}

function recallLinkedItem(domain, itemId) {
  return state.data[domain]?.find(item => item.id === itemId) || null;
}

function recallPlainText(markdown = '') {
  return markdown
    .replace(/^---[\s\S]*?---\s*/m, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!?(\[([^\]]*)\])\([^)]*\)/g, '$2')
    .replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*>\d.\s]+/gm, '')
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function recallSourceLabel(card) {
  if (card.sourceType === 'evidence') {
    const evidence = recallEvidence().find(item => item.id === card.sourceId);
    const linked = evidence && recallLinkedItem(evidence.domain, evidence.itemId);
    return linked ? `Evidência · ${linked.title}` : 'Evidência';
  }
  if (card.sourceType === 'note') {
    const note = state.data.notes.find(item => item.id === card.sourceId);
    return note ? `Nota · ${note.title}` : 'Nota';
  }
  return 'Pergunta manual';
}

function recallDraftFromEvidence(evidence) {
  const linked = recallLinkedItem(evidence.domain, evidence.itemId);
  const context = linked?.title || domainLabels[evidence.domain] || 'esta sessão';
  return {
    sourceType: 'evidence',
    sourceId: evidence.id,
    domain: evidence.domain || null,
    itemId: evidence.itemId || null,
    prompt: `Sem consultar, explique o que você compreendeu ou produziu em “${context}”.`,
    answer: [evidence.summary, evidence.details].filter(Boolean).join('\n\n')
  };
}

function recallDraftFromNote(note) {
  const plain = recallPlainText(note.content).slice(0, 900);
  return {
    sourceType: 'note',
    sourceId: note.id,
    domain: note.domain || null,
    itemId: note.linkedItemId || null,
    prompt: `Qual é a ideia central de “${note.title}” e como você a explicaria com suas palavras?`,
    answer: plain
  };
}

function recallInstallStyles() {
  if (document.getElementById('compassoRecallStyles')) return;
  const style = document.createElement('style');
  style.id = 'compassoRecallStyles';
  style.textContent = `
    .recall-shell{display:grid;gap:18px}.recall-hero{background:#302f2a;color:#fff;border-radius:22px;padding:27px 29px;display:flex;align-items:flex-end;justify-content:space-between;gap:24px;box-shadow:var(--shadow);overflow:hidden;position:relative}.recall-hero::after{content:"";position:absolute;width:230px;height:230px;border:42px solid rgba(184,176,255,.1);border-radius:50%;right:-65px;top:-105px}.recall-hero>*{position:relative;z-index:1}.recall-hero .eyebrow{color:#aaa79f}.recall-hero h2{margin:8px 0 7px;font:800 clamp(24px,3vw,36px)/1.15 Manrope,sans-serif;letter-spacing:-.05em}.recall-hero p{margin:0;color:#bbb8b0;font-size:12px;line-height:1.6}.recall-hero-stats{display:flex;gap:24px;text-align:right}.recall-hero-stats strong{display:block;font:800 28px/1 Manrope,sans-serif}.recall-hero-stats span{display:block;margin-top:6px;color:#bbb8b0;font-size:9px}.recall-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(310px,.8fr);gap:18px}.recall-panel{background:var(--surface-strong);border:1px solid var(--line);border-radius:18px;padding:21px;box-shadow:var(--shadow)}.recall-panel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:15px}.recall-panel-head h3{margin:4px 0 0;font:800 17px/1.25 Manrope,sans-serif}.recall-panel-head p{margin:5px 0 0;color:var(--muted);font-size:10px;line-height:1.5}.recall-card{min-height:310px;border:1px solid var(--line);border-radius:17px;padding:24px;display:flex;flex-direction:column;justify-content:space-between;background:#fbfaf7}.recall-source{color:var(--violet);font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.1em}.recall-question{margin:23px 0;font:800 clamp(19px,2.3vw,27px)/1.38 Manrope,sans-serif;letter-spacing:-.035em}.recall-answer{border-top:1px solid var(--line);padding-top:17px;color:#3c3a35;font-size:12px;line-height:1.65;white-space:pre-wrap}.recall-answer.is-hidden{color:var(--muted);font-style:italic}.recall-practice-actions{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:20px}.recall-practice-actions>div{display:flex;gap:8px}.recall-list,.recall-sources{display:grid;gap:9px}.recall-list-row{border:1px solid var(--line);border-radius:12px;padding:13px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:11px}.recall-list-row strong{display:block;font-size:11px;line-height:1.45}.recall-list-row span{display:block;color:var(--muted);font-size:9px;margin-top:5px}.recall-list-actions{display:flex;gap:6px}.recall-list-actions button,.recall-source-row button{border:1px solid var(--line);background:#fff;border-radius:8px;min-height:31px;padding:0 9px;font-size:9px;font-weight:800;cursor:pointer}.recall-list-actions .danger{color:var(--red)}.recall-source-row{border-top:1px solid var(--line);padding:11px 0;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:10px}.recall-source-row:first-child{border-top:0;padding-top:0}.recall-source-row strong{display:block;font-size:11px}.recall-source-row span{display:block;color:var(--muted);font-size:9px;margin-top:4px;line-height:1.45}.recall-empty{border:1px dashed var(--line);border-radius:12px;padding:26px;text-align:center;color:var(--muted);font-size:11px;line-height:1.55}.recall-dialog{width:min(650px,calc(100vw - 28px));border:0;border-radius:20px;padding:0;background:var(--surface-strong);box-shadow:0 24px 80px rgba(25,23,18,.25)}.recall-dialog::backdrop{background:rgba(31,30,27,.55);backdrop-filter:blur(4px)}.recall-dialog-head{padding:21px 23px 16px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;gap:15px}.recall-dialog-head h2{margin:3px 0 0;font:800 20px/1.2 Manrope,sans-serif}.recall-dialog-body{padding:22px 23px;display:grid;gap:15px}.recall-dialog-body .field label{display:block;font-size:10px;font-weight:800;margin-bottom:7px}.recall-dialog-body textarea{width:100%;border:1px solid var(--line);border-radius:10px;background:#fff;padding:11px 12px;resize:vertical}.recall-dialog-body textarea:first-of-type{min-height:92px}.recall-dialog-body textarea:last-of-type{min-height:145px}.recall-dialog-source{padding:10px 12px;border-radius:10px;background:var(--violet-soft);color:var(--violet);font-size:10px}.recall-dialog-foot{padding:15px 23px;border-top:1px solid var(--line);display:flex;justify-content:flex-end;gap:9px}
    @media(max-width:980px){.recall-grid{grid-template-columns:1fr}.recall-hero{align-items:flex-start;flex-direction:column}.recall-hero-stats{text-align:left}}
    @media(max-width:620px){.recall-hero{padding:22px 20px}.recall-panel{padding:17px}.recall-card{padding:19px;min-height:280px}.recall-practice-actions{align-items:stretch;flex-direction:column}.recall-practice-actions>div{width:100%}.recall-practice-actions button{flex:1}.recall-list-row{grid-template-columns:1fr}.recall-dialog-head,.recall-dialog-body,.recall-dialog-foot{padding-left:17px;padding-right:17px}}
  `;
  document.head.appendChild(style);
}

function recallInstallUi() {
  if (!document.querySelector('[data-view="recall"]')) {
    const analyticsNav = document.querySelector('[data-view="analytics"]') || document.querySelector('[data-view="weekly"]') || document.querySelector('[data-view="notes"]');
    analyticsNav?.insertAdjacentHTML('beforebegin', `<button class="nav-item" data-view="recall">${icon('brain')}<span>Active Recall</span><span class="nav-badge" id="recallBadge"></span></button>`);
  }
  if (!document.getElementById('recallView')) {
    document.querySelector('.content')?.insertAdjacentHTML('beforeend', `
      <section class="view" id="recallView">
        <div class="recall-shell">
          <section class="recall-hero"><div><div class="eyebrow">Active Recall</div><h2>Lembre antes<br>de consultar.</h2><p>Transforme evidências e notas em perguntas que exigem recuperação ativa, não apenas releitura.</p></div><div class="recall-hero-stats"><div><strong id="recallTotal">0</strong><span>perguntas</span></div><div><strong id="recallPracticed">0</strong><span>praticadas</span></div></div></section>
          <div class="recall-grid"><section class="recall-panel"><div class="recall-panel-head"><div><div class="eyebrow">Modo de prática</div><h3>Responda sem olhar</h3><p>Tente explicar em voz alta ou por escrito antes de revelar.</p></div><button class="secondary-btn" type="button" data-recall-custom>${icon('plus')}Nova pergunta</button></div><div id="recallPractice"></div></section><section class="recall-panel"><div class="recall-panel-head"><div><div class="eyebrow">Fontes recentes</div><h3>Transformar em pergunta</h3><p>Revise o texto sugerido antes de salvar.</p></div></div><div class="recall-sources" id="recallSources"></div></section></div>
          <section class="recall-panel"><div class="recall-panel-head"><div><div class="eyebrow">Banco de perguntas</div><h3>Conteúdo preparado para recuperar</h3><p>A edição manual mantém cada pergunta específica, clara e útil.</p></div></div><div class="recall-list" id="recallList"></div></section>
        </div>
      </section>
    `);
  }
  if (!document.getElementById('recallDialog')) {
    document.body.insertAdjacentHTML('beforeend', `
      <dialog class="recall-dialog" id="recallDialog"><form id="recallForm" method="dialog"><div class="recall-dialog-head"><div><div class="eyebrow">Pergunta de recuperação</div><h2 id="recallDialogTitle">Nova pergunta</h2></div><button class="close-btn" type="button" data-recall-close>${icon('x')}</button></div><div class="recall-dialog-body"><div class="recall-dialog-source" id="recallDialogSource"></div><div class="field"><label for="recallPrompt">Pergunta</label><textarea id="recallPrompt" maxlength="700" required placeholder="O que você precisa conseguir recuperar sem consultar?"></textarea></div><div class="field"><label for="recallAnswer">Resposta de referência</label><textarea id="recallAnswer" maxlength="1800" required placeholder="Uma resposta curta e precisa para comparar depois da tentativa."></textarea></div></div><div class="recall-dialog-foot"><button class="quiet-btn" type="button" data-recall-close>Cancelar</button><button class="primary-btn" type="submit">${icon('check')}Salvar pergunta</button></div></form></dialog>
    `);
  }
}

function recallSortedCards() {
  return recallItems().slice().sort((a, b) => {
    const aTime = a.lastReviewedAt ? new Date(a.lastReviewedAt).getTime() : 0;
    const bTime = b.lastReviewedAt ? new Date(b.lastReviewedAt).getTime() : 0;
    return aTime - bTime || new Date(b.createdAt) - new Date(a.createdAt);
  });
}

function renderRecallPractice() {
  const cards = recallSortedCards();
  const container = document.getElementById('recallPractice');
  if (!cards.length) {
    recallRuntime.currentId = null;
    container.innerHTML = '<div class="recall-empty"><strong>Nenhuma pergunta criada.</strong><br>Use uma evidência, uma nota ou crie uma pergunta manual.</div>';
    return;
  }
  let card = cards.find(item => item.id === recallRuntime.currentId);
  if (!card) { card = cards[0]; recallRuntime.currentId = card.id; recallRuntime.revealed = false; }
  container.innerHTML = `<article class="recall-card"><div><span class="recall-source">${escapeHtml(recallSourceLabel(card))}</span><h3 class="recall-question">${escapeHtml(card.prompt)}</h3><div class="recall-answer ${recallRuntime.revealed ? '' : 'is-hidden'}">${recallRuntime.revealed ? escapeHtml(card.answer) : 'Formule sua resposta antes de revelar a referência.'}</div></div><div class="recall-practice-actions"><button class="quiet-btn" type="button" data-recall-next>Próxima</button><div>${recallRuntime.revealed ? `<button class="primary-btn" type="button" data-recall-practiced>${icon('check')}Concluir prática</button>` : `<button class="primary-btn" type="button" data-recall-reveal>Revelar resposta</button>`}</div></div></article>`;
}

function renderRecallSources() {
  const used = new Set(recallItems().filter(item => item.sourceId).map(item => `${item.sourceType}:${item.sourceId}`));
  const evidence = recallEvidence().filter(item => !used.has(`evidence:${item.id}`)).slice(0, 4).map(item => ({ type: 'evidence', source: item, title: item.summary, detail: recallLinkedItem(item.domain, item.itemId)?.title || 'Sessão registrada' }));
  const notes = state.data.notes.filter(item => !used.has(`note:${item.id}`) && recallPlainText(item.content)).slice().sort((a, b) => String(b.updated).localeCompare(String(a.updated))).slice(0, 4).map(item => ({ type: 'note', source: item, title: item.title, detail: 'Nota do Atlas' }));
  const rows = [...evidence, ...notes].slice(0, 6);
  document.getElementById('recallSources').innerHTML = rows.length ? rows.map(row => `<article class="recall-source-row"><div><strong>${escapeHtml(row.title)}</strong><span>${escapeHtml(row.detail)}</span></div><button data-recall-source="${row.type}:${row.source.id}">Criar</button></article>`).join('') : '<div class="recall-empty">Não há novas evidências ou notas disponíveis.</div>';
}

function renderRecallList() {
  const cards = recallItems();
  document.getElementById('recallList').innerHTML = cards.length ? cards.map(card => `<article class="recall-list-row"><div><strong>${escapeHtml(card.prompt)}</strong><span>${escapeHtml(recallSourceLabel(card))} · ${positiveNumber(card.reviewCount)} práticas</span></div><div class="recall-list-actions"><button data-recall-edit="${card.id}">Editar</button><button class="danger" data-recall-delete="${card.id}">Excluir</button></div></article>`).join('') : '<div class="recall-empty">Seu banco de perguntas ainda está vazio.</div>';
}

function renderRecall() {
  const cards = recallItems();
  document.getElementById('recallTotal').textContent = cards.length;
  document.getElementById('recallPracticed').textContent = cards.filter(card => positiveNumber(card.reviewCount) > 0).length;
  document.getElementById('recallBadge').textContent = cards.length || '';
  renderRecallPractice();
  renderRecallSources();
  renderRecallList();
}

function openRecallDialog(draft = null, editingId = null) {
  recallRuntime.editingId = editingId;
  const existing = editingId ? recallItems().find(item => item.id === editingId) : null;
  recallRuntime.source = existing || draft || { sourceType: 'manual', sourceId: null, domain: null, itemId: null };
  document.getElementById('recallDialogTitle').textContent = existing ? 'Editar pergunta' : 'Nova pergunta';
  document.getElementById('recallDialogSource').textContent = existing ? recallSourceLabel(existing) : draft ? (draft.sourceType === 'note' ? 'Criada a partir de uma nota' : 'Criada a partir de uma evidência') : 'Pergunta manual';
  document.getElementById('recallPrompt').value = existing?.prompt || draft?.prompt || '';
  document.getElementById('recallAnswer').value = existing?.answer || draft?.answer || '';
  document.getElementById('recallDialog').showModal();
}

function saveRecallCard() {
  const prompt = document.getElementById('recallPrompt').value.trim();
  const answer = document.getElementById('recallAnswer').value.trim();
  if (!prompt || !answer) return;
  const existing = recallRuntime.editingId ? recallItems().find(item => item.id === recallRuntime.editingId) : null;
  if (existing) {
    existing.prompt = prompt;
    existing.answer = answer;
    existing.updatedAt = new Date().toISOString();
  } else {
    const source = recallRuntime.source || {};
    recallItems().unshift({ id: recallId(), schemaVersion: RECALL_FEATURE_VERSION, sourceType: source.sourceType || 'manual', sourceId: source.sourceId || null, domain: source.domain || null, itemId: source.itemId || null, prompt, answer, reviewCount: 0, lastReviewedAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  document.getElementById('recallDialog').close();
  recallRuntime.editingId = null;
  recallRuntime.source = null;
  recallRuntime.currentId = null;
  saveData(existing ? 'Pergunta atualizada' : 'Pergunta criada');
}

function recallNext() {
  const cards = recallSortedCards();
  if (cards.length < 2) return;
  const index = Math.max(0, cards.findIndex(item => item.id === recallRuntime.currentId));
  recallRuntime.currentId = cards[(index + 1) % cards.length].id;
  recallRuntime.revealed = false;
  renderRecallPractice();
}

recallInstallStyles();
recallInstallUi();

const renderAllWithoutRecall = renderAll;
renderAll = function() {
  renderAllWithoutRecall();
  renderRecall();
};

document.getElementById('recallForm').addEventListener('submit', event => { event.preventDefault(); saveRecallCard(); });
document.addEventListener('click', event => {
  if (event.target.closest('[data-recall-close]')) document.getElementById('recallDialog').close();
  if (event.target.closest('[data-recall-custom]')) openRecallDialog();
  const sourceButton = event.target.closest('[data-recall-source]');
  if (sourceButton) {
    const [type, id] = sourceButton.dataset.recallSource.split(':');
    const source = type === 'evidence' ? recallEvidence().find(item => item.id === id) : state.data.notes.find(item => item.id === id);
    if (source) openRecallDialog(type === 'evidence' ? recallDraftFromEvidence(source) : recallDraftFromNote(source));
  }
  const edit = event.target.closest('[data-recall-edit]');
  if (edit) openRecallDialog(null, edit.dataset.recallEdit);
  const remove = event.target.closest('[data-recall-delete]');
  if (remove && confirm('Excluir esta pergunta de recuperação?')) {
    state.data.reviewItems = recallItems().filter(item => item.id !== remove.dataset.recallDelete);
    if (recallRuntime.currentId === remove.dataset.recallDelete) recallRuntime.currentId = null;
    saveData('Pergunta excluída');
  }
  if (event.target.closest('[data-recall-reveal]')) { recallRuntime.revealed = true; renderRecallPractice(); }
  if (event.target.closest('[data-recall-next]')) recallNext();
  if (event.target.closest('[data-recall-practiced]')) {
    const card = recallItems().find(item => item.id === recallRuntime.currentId);
    if (card) { card.reviewCount = positiveNumber(card.reviewCount) + 1; card.lastReviewedAt = new Date().toISOString(); }
    recallRuntime.currentId = null;
    recallRuntime.revealed = false;
    saveData('Prática registrada');
  }
});
