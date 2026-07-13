/* Compasso · RAG local sobre dados do usuario
 * Fase 4.1: indexacao no navegador, recuperacao contextual e fontes rastreaveis.
 */

const CONTEXT_RAG_VERSION = 1;
const contextRagRuntime = { query: '', type: 'all', results: [], indexedAt: null };

function contextRagPlainText(value = '') {
  return String(value)
    .replace(/^---[\s\S]*?---\s*/m, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_`~>#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function contextRagNormalize(value = '') {
  return contextRagPlainText(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function contextRagTokens(value = '') {
  const stop = new Set(['a','as','ao','aos','com','como','da','das','de','do','dos','e','em','esta','este','eu','o','os','ou','para','por','que','se','sem','um','uma']);
  return contextRagNormalize(value).split(/[^a-z0-9]+/).filter(token => token.length > 1 && !stop.has(token));
}

function contextRagSource(type, id, title, text, meta = '', target = {}) {
  return { type, id, title: String(title || 'Sem titulo'), text: contextRagPlainText(text), meta: String(meta || ''), target };
}

function buildContextRagIndex() {
  const documents = [];
  ['reading', 'study', 'goal'].forEach(domain => (state.data[domain] || []).forEach(item => {
    documents.push(contextRagSource('item', item.id, item.title, [item.meta, item.note, item.status].filter(Boolean).join('. '), domainLabels[domain], { view: domain, domain, id: item.id }));
  }));
  (state.data.notes || []).forEach(note => {
    const distillation = note.distillation && typeof note.distillation === 'object' ? note.distillation : {};
    const text = [distillation.essence, distillation.application, note.title, note.content, distillation.question].filter(Boolean).join('. ');
    documents.push(contextRagSource('note', note.id, note.title, text, 'Nota do Atlas', { view: 'notes', id: note.id }));
  });
  (state.data.evidence || []).forEach(item => {
    const linked = state.data[item.domain]?.find(source => source.id === item.itemId);
    documents.push(contextRagSource('evidence', item.id, item.summary || linked?.title || 'Evidencia', [item.summary, item.details, item.output, item.nextStep].filter(Boolean).join('. '), linked?.title || 'Sessao registrada', { view: item.domain || 'overview', domain: item.domain, id: item.itemId }));
  });
  (state.data.reviewItems || []).forEach(card => documents.push(contextRagSource('recall', card.id, card.prompt, card.answer, 'Active Recall', { view: 'recall', id: card.id })));
  (state.data.errorNotebook || state.data.errorEntries || []).forEach(entry => documents.push(contextRagSource('error', entry.id, entry.topic || entry.title || 'Caderno de erros', [entry.cause, entry.correction, entry.nextAction].filter(Boolean).join('. '), 'Caderno de erros', { view: 'weakness', id: entry.id })));
  contextRagRuntime.indexedAt = new Date().toISOString();
  return documents.filter(document => document.text || document.title);
}

function searchContextRag(query, type = 'all', limit = 12) {
  const terms = [...new Set(contextRagTokens(query))];
  if (!terms.length) return [];
  const phrase = contextRagNormalize(query);
  const documents = buildContextRagIndex().filter(document => type === 'all' || document.type === type);
  return documents.map(document => {
    const title = contextRagNormalize(document.title);
    const text = contextRagNormalize(`${document.meta} ${document.text}`);
    let score = text.includes(phrase) || title.includes(phrase) ? 10 : 0;
    terms.forEach(term => {
      if (title.includes(term)) score += 5;
      const matches = text.match(new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g'));
      score += Math.min(matches?.length || 0, 4) * 1.5;
    });
    score += terms.every(term => `${title} ${text}`.includes(term)) ? 4 : 0;
    return { ...document, score };
  }).filter(document => document.score > 0).sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, 'pt-BR')).slice(0, limit);
}

function contextRagTypeLabel(type) {
  return { item: 'Frente', note: 'Nota', evidence: 'Evidencia', recall: 'Active Recall', error: 'Erro' }[type] || type;
}

function contextRagExcerpt(document, query) {
  const text = document.text || document.title;
  const term = contextRagTokens(query)[0];
  const normalized = contextRagNormalize(text);
  const index = term ? normalized.indexOf(term) : 0;
  const start = Math.max(0, index - 90);
  return `${start ? '...' : ''}${text.slice(start, start + 280)}${text.length > start + 280 ? '...' : ''}`;
}

function renderContextRag() {
  const results = document.getElementById('contextRagResults');
  const count = document.getElementById('contextRagCount');
  const indexed = document.getElementById('contextRagIndexed');
  if (!results || !count || !indexed) return;
  const total = buildContextRagIndex().length;
  count.textContent = String(total);
  indexed.textContent = `${total} fontes indexadas somente neste dispositivo`;
  if (!contextRagRuntime.query) {
    results.innerHTML = '<div class="context-rag-empty"><strong>Consulte seu proprio acervo.</strong><span>Busque um conceito, projeto, livro ou duvida para recuperar contexto com fontes.</span></div>';
    return;
  }
  results.innerHTML = contextRagRuntime.results.length ? contextRagRuntime.results.map((result, index) => `
    <article class="context-rag-result">
      <div class="context-rag-rank">${String(index + 1).padStart(2, '0')}</div>
      <div><div class="context-rag-meta"><span>${escapeHtml(contextRagTypeLabel(result.type))}</span>${escapeHtml(result.meta)}</div><h3>${escapeHtml(result.title)}</h3><p>${escapeHtml(contextRagExcerpt(result, contextRagRuntime.query))}</p></div>
      <button class="quiet-btn" type="button" data-context-source="${escapeHtml(result.type)}:${escapeHtml(result.id)}">Abrir fonte</button>
    </article>`).join('') : '<div class="context-rag-empty"><strong>Nenhuma fonte relevante encontrada.</strong><span>Tente termos presentes nas suas notas, evidencias ou frentes.</span></div>';
}

function runContextRagSearch() {
  const input = document.getElementById('contextRagQuery');
  contextRagRuntime.query = input?.value.trim() || '';
  contextRagRuntime.type = document.getElementById('contextRagType')?.value || 'all';
  contextRagRuntime.results = searchContextRag(contextRagRuntime.query, contextRagRuntime.type);
  renderContextRag();
}

function openContextRagSource(type, id) {
  const result = contextRagRuntime.results.find(item => item.type === type && item.id === id);
  if (!result) return;
  if (type === 'note') {
    state.selectedNoteId = id;
    const note = state.data.notes.find(item => item.id === id);
    if (note) state.selectedFolderId = note.folder;
  }
  switchView(result.target.view || 'overview');
  if (type === 'item' && result.target.domain && typeof openDialog === 'function') openDialog(result.target.domain, id);
}

function installContextRagStyles() {
  if (document.getElementById('contextRagStyles')) return;
  const style = document.createElement('style');
  style.id = 'contextRagStyles';
  style.textContent = `
    .context-rag-shell{display:grid;gap:18px}.context-rag-hero{background:#302f2a;color:#fff;border-radius:18px;padding:26px 28px;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:end;gap:24px}.context-rag-hero h2{margin:7px 0 7px;font:800 31px/1.18 Manrope,sans-serif}.context-rag-hero p{margin:0;color:#c4c1b8;font-size:11px;line-height:1.6;max-width:610px}.context-rag-stat{text-align:right}.context-rag-stat strong{display:block;font:800 30px/1 Manrope,sans-serif}.context-rag-stat span{display:block;color:#aaa79f;font-size:9px;margin-top:6px}.context-rag-panel{background:var(--surface-strong);border:1px solid var(--line);border-radius:16px;padding:20px;box-shadow:var(--shadow)}.context-rag-form{display:grid;grid-template-columns:minmax(0,1fr) 180px auto;gap:9px}.context-rag-form input,.context-rag-form select{width:100%;min-height:43px;border:1px solid var(--line);border-radius:9px;background:#fff;padding:0 12px;font-size:11px}.context-rag-privacy{margin:10px 0 0;color:var(--muted);font-size:9px}.context-rag-results{display:grid;gap:9px;margin-top:18px}.context-rag-result{display:grid;grid-template-columns:36px minmax(0,1fr) auto;align-items:start;gap:13px;border-top:1px solid var(--line);padding:15px 0}.context-rag-result:first-child{border-top:0}.context-rag-rank{width:34px;height:34px;border-radius:8px;background:var(--violet-soft);color:var(--violet);display:grid;place-items:center;font:800 10px Manrope,sans-serif}.context-rag-meta{display:flex;gap:8px;color:var(--muted);font-size:9px}.context-rag-meta span{color:var(--violet);font-weight:800;text-transform:uppercase;letter-spacing:.08em}.context-rag-result h3{margin:5px 0 5px;font:800 13px/1.35 Manrope,sans-serif}.context-rag-result p{margin:0;color:var(--muted);font-size:10px;line-height:1.55}.context-rag-empty{border:1px dashed var(--line);border-radius:12px;padding:34px;text-align:center;color:var(--muted)}.context-rag-empty strong,.context-rag-empty span{display:block}.context-rag-empty strong{color:var(--ink);font-size:12px;margin-bottom:6px}.context-rag-empty span{font-size:10px}
    @media(max-width:700px){.context-rag-hero{grid-template-columns:1fr}.context-rag-stat{text-align:left}.context-rag-form{grid-template-columns:1fr}.context-rag-result{grid-template-columns:36px minmax(0,1fr)}.context-rag-result>button{grid-column:2;width:max-content}.context-rag-panel{padding:16px}}
  `;
  document.head.appendChild(style);
}

function installContextRagUi() {
  labels.context = { title: 'IA contextual', kicker: 'Recuperacao local com fontes' };
  if (!document.querySelector('[data-view="context"]')) {
    const anchor = document.querySelector('[data-view="recall"]') || document.querySelector('[data-view="notes"]');
    anchor?.insertAdjacentHTML('beforebegin', `<button class="nav-item" data-view="context">${icon('brain')}<span>IA contextual</span></button>`);
  }
  if (!document.getElementById('contextView')) document.querySelector('.content')?.insertAdjacentHTML('beforeend', `
    <section class="view" id="contextView"><div class="context-rag-shell">
      <section class="context-rag-hero"><div><div class="eyebrow">Fase 4.1 · RAG local</div><h2>Encontre contexto<br>antes de responder.</h2><p>O Compasso recupera trechos relevantes do seu acervo e preserva a origem de cada resultado.</p></div><div class="context-rag-stat"><strong id="contextRagCount">0</strong><span>fontes disponiveis</span></div></section>
      <section class="context-rag-panel"><form class="context-rag-form" id="contextRagForm"><input id="contextRagQuery" type="search" maxlength="180" placeholder="Ex.: o que anotei sobre arquitetura de dados?" aria-label="Consultar acervo"><select id="contextRagType" aria-label="Filtrar fonte"><option value="all">Todas as fontes</option><option value="note">Notas</option><option value="evidence">Evidencias</option><option value="item">Frentes</option><option value="recall">Active Recall</option><option value="error">Caderno de erros</option></select><button class="primary-btn" type="submit">${icon('search')}Buscar</button></form><p class="context-rag-privacy" id="contextRagIndexed"></p><div class="context-rag-results" id="contextRagResults"></div></section>
    </div></section>`);
}

installContextRagStyles();
installContextRagUi();
const renderAllWithoutContextRag = renderAll;
renderAll = function() { renderAllWithoutContextRag(); renderContextRag(); };
document.getElementById('contextRagForm')?.addEventListener('submit', event => { event.preventDefault(); runContextRagSearch(); });
document.getElementById('contextRagType')?.addEventListener('change', () => { if (contextRagRuntime.query) runContextRagSearch(); });
document.addEventListener('click', event => {
  const source = event.target.closest('[data-context-source]');
  if (!source) return;
  const [type, ...idParts] = source.dataset.contextSource.split(':');
  openContextRagSource(type, idParts.join(':'));
});
