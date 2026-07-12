/* Compasso · Evidências de sessão
 * Injetado após sessions-feature.js no mesmo módulo principal.
 */

const EVIDENCE_FEATURE_VERSION = 1;
state.data.evidence = Array.isArray(state.data.evidence) ? state.data.evidence : [];

const evidenceTypeLabels = {
  insight: 'Insight',
  note: 'Nota produzida',
  exercise: 'Exercício ou prática',
  decision: 'Decisão',
  question: 'Pergunta aberta',
  deliverable: 'Entrega concreta'
};

function evidenceId() {
  return `e${Date.now()}${Math.random().toString(36).slice(2,7)}`;
}

function evidenceForSession(sessionId) {
  return state.data.evidence.filter(item => item.sessionId === sessionId);
}

function installEvidenceStyles() {
  const style = document.getElementById('compassoSessionStyles');
  if (!style || style.textContent.includes('.evidence-box')) return;
  style.textContent += `
    .evidence-box{border:1px solid var(--line);border-radius:14px;padding:15px;background:#fbfaf7;display:grid;gap:13px}
    .evidence-box-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.evidence-box-head strong{font:800 13px/1.35 Manrope,sans-serif}.evidence-box-head span{display:block;color:var(--muted);font-size:10px;margin-top:4px;line-height:1.45}
    .evidence-grid{display:grid;grid-template-columns:180px 1fr;gap:12px}.session-dialog select{width:100%;border:1px solid var(--line);border-radius:10px;padding:11px 12px;background:#fff;color:var(--ink)}
    .evidence-help{color:var(--muted);font-size:10px;line-height:1.45;margin:0}.evidence-required{color:var(--red)}
    .evidence-history{margin-top:10px;padding:11px 12px;border-radius:11px;background:var(--green-soft);color:#245f51}.evidence-history b{display:inline-block;font-size:9px;text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px}.evidence-history strong{display:block;font-size:11px;line-height:1.45}.evidence-history span{color:#3d7164!important;margin-top:5px!important}
    .evidence-count{display:inline-flex;align-items:center;padding:3px 7px;border-radius:999px;background:var(--green-soft);color:var(--green);font-size:9px;font-weight:800;margin-left:5px}
    @media(max-width:620px){.evidence-grid{grid-template-columns:1fr}}
  `;
}

function installEvidenceFields() {
  const reflectionField = document.getElementById('sessionReflection')?.closest('.field');
  if (!reflectionField || document.getElementById('sessionEvidenceSummary')) return;
  reflectionField.insertAdjacentHTML('afterend', `
    <section class="evidence-box">
      <div class="evidence-box-head"><div><strong>Evidência desta sessão</strong><span>Registre algo verificável que permaneceu depois do tempo investido.</span></div></div>
      <div class="evidence-grid">
        <div class="field"><label for="sessionEvidenceType">Tipo</label><select id="sessionEvidenceType">${Object.entries(evidenceTypeLabels).map(([value,label]) => `<option value="${value}">${label}</option>`).join('')}</select></div>
        <div class="field"><label for="sessionEvidenceSummary">O que ficou desta sessão? <span class="evidence-required">*</span></label><input id="sessionEvidenceSummary" maxlength="180" placeholder="Ex.: reconstruí o argumento central do capítulo em três premissas." required></div>
      </div>
      <div class="field"><label for="sessionEvidenceDetails">Detalhe ou referência</label><textarea id="sessionEvidenceDetails" maxlength="500" placeholder="Ex.: nota criada, exercício concluído, pergunta que surgiu ou decisão tomada."></textarea></div>
      <p class="evidence-help">A evidência será vinculada à sessão e incluída no backup do Compasso.</p>
    </section>
  `);
}

const openSessionFinishWithoutEvidence = openSessionFinish;
openSessionFinish = function() {
  openSessionFinishWithoutEvidence();
  if (!document.getElementById('sessionFinishDialog').open) return;
  document.getElementById('sessionEvidenceType').value = 'insight';
  document.getElementById('sessionEvidenceSummary').value = '';
  document.getElementById('sessionEvidenceDetails').value = '';
};

const finishSessionWithoutEvidence = finishSession;
finishSession = function() {
  const session = sessionActive();
  if (!session) return;
  const summaryInput = document.getElementById('sessionEvidenceSummary');
  const summary = summaryInput.value.trim();
  if (summary.length < 3) {
    summaryInput.focus();
    showToast('Registre uma evidência curta antes de concluir');
    return;
  }

  const evidence = {
    id: evidenceId(),
    schemaVersion: EVIDENCE_FEATURE_VERSION,
    sessionId: session.id,
    itemId: session.itemId,
    domain: session.domain,
    type: document.getElementById('sessionEvidenceType').value,
    summary,
    details: document.getElementById('sessionEvidenceDetails').value.trim(),
    createdAt: new Date().toISOString()
  };

  const previousStatus = session.status;
  finishSessionWithoutEvidence();
  if (previousStatus !== 'completed' && session.status === 'completed') {
    state.data.evidence.unshift(evidence);
    window.CompassoStorage.save(STORAGE_KEY, state.data);
  }
};

function renderEvidenceForSession(session) {
  const items = evidenceForSession(session.id);
  if (!items.length) return '';
  return items.map(item => `<div class="evidence-history"><b>${escapeHtml(evidenceTypeLabels[item.type] || 'Evidência')}</b><strong>${escapeHtml(item.summary)}</strong>${item.details ? `<span>${escapeHtml(item.details)}</span>` : ''}</div>`).join('');
}

const renderSessionHistoryWithoutEvidence = renderSessionHistory;
renderSessionHistory = function() {
  renderSessionHistoryWithoutEvidence();
  const selected = sessionRuntime.historyItem;
  const list = document.getElementById('sessionHistoryList');
  if (!selected || !list) return;
  const sessions = state.data.sessions
    .filter(session => session.domain === selected.domain && session.itemId === selected.itemId)
    .sort((a,b) => new Date(b.startedAt) - new Date(a.startedAt));
  const rows = list.querySelectorAll('.session-history-row');
  rows.forEach((row,index) => {
    const session = sessions[index];
    if (!session) return;
    const body = row.firstElementChild;
    const evidenceHtml = renderEvidenceForSession(session);
    if (evidenceHtml) body.insertAdjacentHTML('beforeend', evidenceHtml);
  });
};

const enhanceSessionCardsWithoutEvidence = enhanceSessionCards;
enhanceSessionCards = function(domain) {
  enhanceSessionCardsWithoutEvidence(domain);
  if (!['reading','study'].includes(domain)) return;
  document.querySelectorAll(`#${domain}Grid .item-card`).forEach(card => {
    const edit = card.querySelector('[data-edit]');
    const history = card.querySelector('[data-session-history]');
    if (!edit || !history || history.querySelector('.evidence-count')) return;
    const [itemDomain,itemId] = edit.dataset.edit.split(':');
    const count = state.data.evidence.filter(item => item.domain === itemDomain && item.itemId === itemId).length;
    if (count) history.insertAdjacentHTML('beforeend', `<span class="evidence-count">${count}</span>`);
  });
};

const deleteSessionWithoutEvidence = deleteSession;
deleteSession = function(id) {
  const before = state.data.sessions.some(session => session.id === id);
  deleteSessionWithoutEvidence(id);
  const after = state.data.sessions.some(session => session.id === id);
  if (before && !after) {
    state.data.evidence = state.data.evidence.filter(item => item.sessionId !== id);
    window.CompassoStorage.save(STORAGE_KEY, state.data);
  }
};

installEvidenceStyles();
installEvidenceFields();
