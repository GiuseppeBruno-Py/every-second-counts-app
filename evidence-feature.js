/* Compasso · Evidências de sessão
 * Injetado após sessions-feature.js no mesmo módulo principal.
 */

const EVIDENCE_FEATURE_VERSION = 2;
const historyEvidenceModel = globalThis.CompassoHistoryEvidenceModel;
state.data.evidence = (Array.isArray(state.data.evidence) ? state.data.evidence : []).map(item => historyEvidenceModel.normalizeEvidence(item)).filter(Boolean);

const evidenceTypeLabels = {
  insight: 'Insight',
  note: 'Nota produzida',
  exercise: 'Exercício ou prática',
  decision: 'Decisão',
  question: 'Pergunta aberta',
  deliverable: 'Entrega concreta'
};
const evidenceCompletionRuntime = { sessionId:null, evidenceId:null, signalSaved:false };

function evidenceId() {
  return `e${Date.now()}${Math.random().toString(36).slice(2,7)}`;
}

function evidenceForSession(sessionId) {
  return state.data.evidence.filter(item => item.sessionId === sessionId);
}

function evidenceCapabilityProjection(evidence) {
  const execution=(state.data.executionSessions||[]).find(item=>item.id===evidence.sessionId);
  const capabilityRef=capabilityContextModel.evidenceContext(evidence,execution?[execution]:[]);
  if(!capabilityRef)return'';
  const resolved=capabilityContextModel.resolveCapabilityRef(capabilityRef,state.data.learningOutcomes||[]);
  return resolved.available
    ? `<div class="evidence-capability"><span>Capacidade · ${escapeHtml(resolved.outcome.capability)}</span><strong>Tentativa: ${escapeHtml(resolved.attemptText)}</strong><button type="button" data-evidence-capability="${escapeHtml(capabilityRef.outcomeId)}">Abrir capacidade</button></div>`
    : `<div class="evidence-capability unavailable"><span>Capacidade indisponível</span><strong>Tentativa registrada: ${escapeHtml(resolved.attemptText)}</strong></div>`;
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

function installEvidenceCompletion() {
  if(document.getElementById('executionCompletionPanel'))return;
  document.querySelector('.content')?.insertAdjacentHTML('beforeend',`
    <section class="execution-completion" id="executionCompletionPanel" tabindex="-1" aria-labelledby="executionCompletionTitle" hidden>
      <div class="execution-completion-head"><div><div class="eyebrow">Sessão registrada</div><h2 id="executionCompletionTitle">Evidence salva</h2></div><button type="button" class="icon-btn" data-completion-dismiss aria-label="Fechar continuação">${icon('x')}</button></div>
      <p id="executionCompletionSummary"></p><p class="execution-completion-status" id="executionCompletionStatus" role="status"></p>
      <div class="execution-completion-actions" id="executionCompletionActions"></div>
    </section>`);
}

function evidenceCompletionContext() {
  if(typeof executionSyncAll==='function')executionSyncAll();
  const execution=(state.data.executionSessions||[]).find(item=>item.id===evidenceCompletionRuntime.sessionId)||null;
  const evidence=(state.data.evidence||[]).find(item=>item.id===evidenceCompletionRuntime.evidenceId)||null;
  const capabilityRef=execution?capabilityContextModel.executionContext(execution):null;
  const resolved=capabilityContextModel.resolveCapabilityRef(capabilityRef,state.data.learningOutcomes||[]);
  return{execution,evidence,capabilityRef,resolved};
}

function renderEvidenceCompletion(payload={}) {
  evidenceCompletionRuntime.sessionId=payload.sessionId||evidenceCompletionRuntime.sessionId;
  evidenceCompletionRuntime.evidenceId=payload.evidenceId||null;
  evidenceCompletionRuntime.signalSaved=false;
  const panel=document.getElementById('executionCompletionPanel');if(!panel)return;
  const {execution,evidence,resolved}=evidenceCompletionContext();
  document.getElementById('executionCompletionTitle').textContent=evidence?'Evidence salva':'Sessão registrada';
  document.getElementById('executionCompletionSummary').textContent=evidence?.summary||execution?.result||execution?.reflection||'O encerramento foi salvo. Escolha como continuar.';
  document.getElementById('executionCompletionStatus').textContent='A ação de Hoje e a próxima tentativa permanecem como estavam.';
  document.getElementById('executionCompletionActions').innerHTML=`<button type="button" class="primary-btn" data-completion-today>Voltar para Hoje</button>${resolved.active?'<button type="button" class="secondary-btn" data-completion-signal>Registrar sinal</button>':''}${resolved.available?'<button type="button" class="quiet-btn" data-completion-capability>Abrir capacidade</button>':''}`;
  panel.hidden=false;
  requestAnimationFrame(()=>{panel.scrollIntoView?.({block:'nearest'});panel.focus()});
}

function dismissEvidenceCompletion() {
  const panel=document.getElementById('executionCompletionPanel');if(panel)panel.hidden=true;
}

const openSessionFinishWithoutEvidence = openSessionFinish;
openSessionFinish = function() {
  openSessionFinishWithoutEvidence();
  if (!document.getElementById('sessionFinishDialog').open) return;
  document.getElementById('sessionEvidenceType').value = 'insight';
  document.getElementById('sessionEvidenceSummary').value = '';
  document.getElementById('sessionEvidenceDetails').value = '';
};

const finishSessionWithoutEvidence = sessionRuntime.commitFinish||finishSession;
finishSession = async function() {
  const session = sessionActive();
  if (!session) return false;
  const summaryInput = document.getElementById('sessionEvidenceSummary');
  const summary = summaryInput.value.trim();
  if (summary.length < 3) {
    summaryInput.focus();
    showToast('Registre uma evidência curta antes de concluir');
    return false;
  }

  const evidenceCreatedAt = new Date().toISOString();
  const evidence = {
    id: evidenceId(),
    schemaVersion: EVIDENCE_FEATURE_VERSION,
    sessionId: session.id,
    itemId: session.itemId,
    domain: session.domain,
    type: document.getElementById('sessionEvidenceType').value,
    summary,
    details: document.getElementById('sessionEvidenceDetails').value.trim(),
    createdAt: evidenceCreatedAt,
    updatedAt: evidenceCreatedAt,
    editedAt: null
  };

  const result=await finishSessionWithoutEvidence({evidence});
  if(result)CompassoFeatures.emit('execution:recorded',result);
  return result;
};
sessionRuntime.finish=finishSession;

function renderEvidenceForSession(session) {
  const items = evidenceForSession(session.id);
  if (!items.length) return '';
  return items.map(item => `<div class="evidence-history"><b>${escapeHtml(evidenceTypeLabels[item.type] || 'Evidência')}</b><strong>${escapeHtml(item.summary)}</strong>${item.details ? `<span>${escapeHtml(item.details)}</span>` : ''}${evidenceCapabilityProjection(item)}</div>`).join('');
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
    saveData('Sessão e evidência excluídas');
  }
};

installEvidenceStyles();
installEvidenceFields();
installEvidenceCompletion();
CompassoFeatures.on('execution:recorded',payload=>renderEvidenceCompletion(payload));
CompassoFeatures.on('view:changed',()=>{const panel=document.getElementById('executionCompletionPanel');if(panel&&!panel.hidden)dismissEvidenceCompletion()});
CompassoFeatures.on('learning-signal:saved',payload=>{
  if(!payload||payload.sourceRef?.id!==evidenceCompletionRuntime.evidenceId&&payload.sourceRef?.id!==evidenceCompletionRuntime.sessionId)return;
  evidenceCompletionRuntime.signalSaved=true;
  const status=document.getElementById('executionCompletionStatus');if(status)status.textContent='Sinal salvo após sua confirmação. A próxima tentativa não foi alterada.';
  requestAnimationFrame(()=>document.querySelector('[data-completion-today]')?.focus?.());
});
CompassoFeatures.action('[data-evidence-capability]',({target})=>{
  const outcome=(state.data.learningOutcomes||[]).find(item=>item.id===target.dataset.evidenceCapability);if(!outcome)return;
  learningOutcomeRuntime.mode=outcome.status==='archived'?'archived':'active';switchView('capabilities');outcomeRender();requestAnimationFrame(()=>document.querySelector(`[data-outcome-card="${CSS.escape(outcome.id)}"]`)?.focus?.());
});
CompassoFeatures.action('[data-completion-dismiss]',()=>dismissEvidenceCompletion());
CompassoFeatures.action('[data-completion-today]',()=>{dismissEvidenceCompletion();CompassoFeatures.execute('today.openPrimary')});
CompassoFeatures.action('[data-completion-capability]',()=>{
  const {resolved}=evidenceCompletionContext();if(!resolved.available)return;
  dismissEvidenceCompletion();learningOutcomeRuntime.mode=resolved.outcome.status==='archived'?'archived':'active';switchView('capabilities');outcomeRender();requestAnimationFrame(()=>document.querySelector(`[data-outcome-card="${CSS.escape(resolved.outcome.id)}"]`)?.focus?.());
});
CompassoFeatures.action('[data-completion-signal]',({target})=>{
  const {execution,evidence,resolved}=evidenceCompletionContext();if(!execution||!resolved.active)return renderEvidenceCompletion({sessionId:evidenceCompletionRuntime.sessionId,evidenceId:evidenceCompletionRuntime.evidenceId});
  const suggestion=(evidence?.summary||'').trim(),sourceRef=evidence?{type:'evidence',id:evidence.id}:{type:'execution',id:execution.id};
  CompassoFeatures.execute('learningSignal.open',{outcomeId:resolved.outcome.id,sourceRef,kind:['question','insight'].includes(evidence?.type)?evidence.type:'feedback',text:suggestion,origin:suggestion?'confirmed-suggestion':'learner',provenance:suggestion?'Sugestão baseada na Evidence que acabou de ser salva. Revise antes de confirmar.':'Escreva apenas se este registro ajudar sua próxima decisão.',trigger:target});
});
