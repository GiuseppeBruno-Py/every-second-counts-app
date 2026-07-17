/* Compasso · Edição segura de histórico e evidências
 * As correções atuam nos registros-fonte. Painéis e revisões recalculam seus
 * totais no render seguinte, sem reaplicar progresso ao item vinculado.
 */

const historyEditModel = globalThis.CompassoHistoryEvidenceModel;
const historyEditRuntime = { sessionId: null, evidenceId: null };

function historyEditIsoLocal(value) {
  if (!value) return '';
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function historyEditSession(id) {
  return completedExecutionSessions().find(session => session.id === id) || null;
}

function historyEditSource(id) {
  if (String(id).startsWith('deep:')) {
    return state.data.deepWorkSessions.find(session => session.id === String(id).replace(/^deep:/, '')) || null;
  }
  return state.data.sessions.find(session => session.id === id) || null;
}

function historyEditItems(domain, selectedId = '') {
  return (state.data[domain] || []).map(item => `<option value="${escapeHtml(item.id)}"${item.id === selectedId ? ' selected' : ''}>${escapeHtml(item.title || 'Sem título')}</option>`).join('');
}

function historyEditRefreshItems(selectId, domain, selectedId = '') {
  const select = document.getElementById(selectId);
  if (!select) return;
  select.innerHTML = historyEditItems(domain, selectedId) || '<option value="">Nenhum item disponível</option>';
}

function historyEditVariant(record) {
  const kind = record?.executionVariant?.kind;
  if (kind === 'contingency' && record.executionVariant.contingencyId) return `contingency:${record.executionVariant.contingencyId}`;
  return ['ideal', 'minimum'].includes(kind) ? kind : 'ideal';
}

function historyEditRefreshVariants(domain, itemId, selected = 'ideal') {
  const select = document.getElementById('historySessionVariant');
  const item = state.data[domain]?.find(candidate => candidate.id === itemId);
  if (!select) return;
  select.innerHTML = `<option value="ideal">Versão ideal</option><option value="minimum">Versão mínima</option>${(item?.contingencies || []).map(entry => `<option value="contingency:${escapeHtml(entry.id)}">Contingência: ${escapeHtml(entry.condition || entry.response || 'alternativa')}</option>`).join('')}`;
  select.value = [...select.options].some(option => option.value === selected) ? selected : 'ideal';
}

function installHistoryEditUi() {
  if (document.getElementById('historySessionDialog')) return;
  const style = document.createElement('style');
  style.id = 'compassoHistoryEditStyles';
  style.textContent = `
    .history-edit-grid{display:grid;grid-template-columns:1fr 1fr;gap:13px}.history-edit-grid .wide{grid-column:1/-1}.history-edit-dialog select{width:100%;border:1px solid var(--line);border-radius:10px;padding:11px 12px;background:#fff;color:var(--ink)}
    .history-edit-note{margin:0;padding:11px 12px;border-radius:10px;background:var(--blue-soft);color:var(--blue);font-size:10px;line-height:1.5}.history-edit-error{color:var(--red);font-size:10px;min-height:15px;margin:0}.history-edited{display:inline-flex!important;margin-left:5px!important;padding:2px 6px!important;border-radius:999px!important;background:var(--blue-soft)!important;color:var(--blue)!important;font-size:8px!important;font-weight:800!important}
    .history-edit-actions{display:flex;gap:7px;justify-content:flex-end;flex-wrap:wrap}.history-edit-actions button{margin-top:7px!important;color:var(--blue)!important}.history-edit-actions .danger{color:var(--red)!important}.evidence-edit-actions{display:flex;gap:7px;align-items:center;margin-top:7px}.evidence-edit-actions button{border:0;background:transparent;color:#245f51;font-size:9px;font-weight:800;cursor:pointer}.evidence-edit-actions button.danger{color:var(--red)}
    @media(max-width:620px){.history-edit-grid{grid-template-columns:1fr}.history-edit-grid .wide{grid-column:auto}.history-edit-actions{justify-content:flex-start}}
  `;
  document.head.appendChild(style);
  document.body.insertAdjacentHTML('beforeend', `
    <dialog class="session-dialog history-edit-dialog" id="historySessionDialog">
      <form id="historySessionForm">
        <div class="session-dialog-head"><div><div class="eyebrow">Correção auditável</div><h2>Editar sessão concluída</h2></div><button class="close-btn" type="button" data-history-close="historySessionDialog">${icon('x')}</button></div>
        <div class="session-dialog-body">
          <p class="history-edit-note">A alteração preserva o ID da sessão e recalcula as métricas. O progresso atual do item não será aplicado novamente.</p>
          <div class="history-edit-grid">
            <div class="field"><label for="historySessionDomain">Domínio</label><select id="historySessionDomain"><option value="reading">Leitura</option><option value="study">Estudo</option></select></div>
            <div class="field"><label for="historySessionItem">Item vinculado</label><select id="historySessionItem" required></select></div>
            <div class="field"><label for="historySessionStart">Início</label><input id="historySessionStart" type="datetime-local" required></div>
            <div class="field"><label for="historySessionEnd">Fim</label><input id="historySessionEnd" type="datetime-local" required></div>
            <div class="field"><label for="historySessionDuration">Duração efetiva (min)</label><input id="historySessionDuration" type="number" min="0" step="1" required></div>
            <div class="field" id="historySessionVariantField"><label for="historySessionVariant">Variante</label><select id="historySessionVariant"></select></div>
            <div class="field" id="historySessionStartValueField"><label for="historySessionStartValue">Progresso inicial</label><input id="historySessionStartValue" type="number" min="0" step="any"></div>
            <div class="field" id="historySessionEndValueField"><label for="historySessionEndValue">Progresso final</label><input id="historySessionEndValue" type="number" min="0" step="any"></div>
            <div class="field wide"><label for="historySessionIntent">Objetivo</label><textarea id="historySessionIntent" maxlength="220"></textarea></div>
            <div class="field wide"><label for="historySessionReflection">Resultado / observação</label><textarea id="historySessionReflection" maxlength="500"></textarea></div>
            <div class="field wide"><label for="historySessionNextAction">Próxima ação</label><textarea id="historySessionNextAction" maxlength="500"></textarea></div>
          </div>
          <p class="history-edit-error" id="historySessionError" role="alert"></p>
        </div>
        <div class="session-dialog-foot"><button type="button" class="quiet-btn" data-history-close="historySessionDialog">Cancelar</button><button type="submit" class="primary-btn">Salvar correção</button></div>
      </form>
    </dialog>
    <dialog class="session-dialog history-edit-dialog" id="historyEvidenceDialog">
      <form id="historyEvidenceForm">
        <div class="session-dialog-head"><div><div class="eyebrow">Evidência vinculada</div><h2>Editar evidência</h2></div><button class="close-btn" type="button" data-history-close="historyEvidenceDialog">${icon('x')}</button></div>
        <div class="session-dialog-body">
          <div class="history-edit-grid">
            <div class="field"><label for="historyEvidenceType">Tipo</label><select id="historyEvidenceType">${Object.entries(evidenceTypeLabels).map(([value, label]) => `<option value="${value}">${escapeHtml(label)}</option>`).join('')}</select></div>
            <div class="field"><label for="historyEvidenceDate">Data</label><input id="historyEvidenceDate" type="datetime-local" required></div>
            <div class="field wide"><label for="historyEvidenceSession">Sessão vinculada</label><select id="historyEvidenceSession"></select></div>
            <div class="field wide"><label for="historyEvidenceSummary">Síntese</label><input id="historyEvidenceSummary" maxlength="180" required></div>
            <div class="field wide"><label for="historyEvidenceDetails">Detalhes</label><textarea id="historyEvidenceDetails" maxlength="500"></textarea></div>
          </div>
          <p class="history-edit-error" id="historyEvidenceError" role="alert"></p>
        </div>
        <div class="session-dialog-foot"><button type="button" class="quiet-btn danger" id="historyEvidenceDelete">Excluir evidência</button><button type="button" class="quiet-btn" data-history-close="historyEvidenceDialog">Cancelar</button><button type="submit" class="primary-btn">Salvar correção</button></div>
      </form>
    </dialog>
  `);
}

function openHistorySessionEdit(id) {
  const session = historyEditSession(id);
  const source = historyEditSource(id);
  if (!session || !source) return showToast('Sessão não encontrada');
  historyEditRuntime.sessionId = id;
  const deep = session.source === 'deep-work';
  document.getElementById('historySessionDomain').value = session.domain;
  historyEditRefreshItems('historySessionItem', session.domain, session.itemId);
  document.getElementById('historySessionStart').value = historyEditIsoLocal(session.startedAt);
  document.getElementById('historySessionEnd').value = historyEditIsoLocal(session.endedAt);
  document.getElementById('historySessionDuration').value = Math.max(0, Math.round(Number(session.durationMs || 0) / 60000));
  document.getElementById('historySessionIntent').value = session.intent || '';
  document.getElementById('historySessionReflection').value = session.reflection || '';
  document.getElementById('historySessionNextAction').value = session.nextAction || '';
  historyEditRefreshVariants(session.domain, session.itemId, historyEditVariant(source));
  document.getElementById('historySessionStartValue').value = deep ? '' : source.startValue ?? '';
  document.getElementById('historySessionEndValue').value = deep ? '' : source.endValue ?? '';
  ['historySessionVariantField', 'historySessionStartValueField', 'historySessionEndValueField'].forEach(field => document.getElementById(field).hidden = deep);
  document.getElementById('historySessionError').textContent = '';
  document.getElementById('historySessionDialog').showModal();
}

function historyEvidenceSessionOptions(selectedId) {
  return '<option value="">Sem sessão direta</option>' + completedExecutionSessions().map(session => {
    const item = state.data[session.domain]?.find(candidate => candidate.id === session.itemId);
    const date = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(session.endedAt || session.startedAt));
    return `<option value="${escapeHtml(session.id)}"${session.id === selectedId ? ' selected' : ''}>${escapeHtml(item?.title || 'Item removido')} · ${escapeHtml(date)}</option>`;
  }).join('');
}

function openHistoryEvidenceEdit(id) {
  const evidence = state.data.evidence.find(item => item.id === id);
  if (!evidence) return showToast('Evidência não encontrada');
  historyEditRuntime.evidenceId = id;
  document.getElementById('historyEvidenceType').value = evidence.type;
  document.getElementById('historyEvidenceDate').value = historyEditIsoLocal(evidence.createdAt);
  document.getElementById('historyEvidenceSession').innerHTML = historyEvidenceSessionOptions(evidence.sessionId);
  document.getElementById('historyEvidenceSession').value = evidence.sessionId;
  document.getElementById('historyEvidenceSummary').value = evidence.summary;
  document.getElementById('historyEvidenceDetails').value = evidence.details || '';
  document.getElementById('historyEvidenceError').textContent = '';
  document.getElementById('historyEvidenceDialog').showModal();
}

function historyEditSaveSession(event) {
  event.preventDefault();
  const id = historyEditRuntime.sessionId;
  const source = historyEditSource(id);
  if (!source) return;
  const deep = String(id).startsWith('deep:');
  const patch = {
    domain: document.getElementById('historySessionDomain').value,
    itemId: document.getElementById('historySessionItem').value,
    startedAt: document.getElementById('historySessionStart').value,
    endedAt: document.getElementById('historySessionEnd').value,
    durationMs: Number(document.getElementById('historySessionDuration').value) * 60000,
    intent: document.getElementById('historySessionIntent').value,
    reflection: document.getElementById('historySessionReflection').value,
    nextAction: document.getElementById('historySessionNextAction').value
  };
  if (!deep) {
    patch.startValue = document.getElementById('historySessionStartValue').value;
    patch.endValue = document.getElementById('historySessionEndValue').value;
    const [kind, contingencyId] = document.getElementById('historySessionVariant').value.split(':');
    patch.executionVariant = { kind, contingencyId: contingencyId || null };
  }
  try {
    const updated = deep ? historyEditModel.updateDeepWork(source, patch) : historyEditModel.updateSession(source, patch);
    const updatedEvidence = state.data.evidence.map(evidence => evidence.sessionId === id ? historyEditModel.updateEvidence(evidence, { domain: patch.domain, itemId: patch.itemId }) : evidence);
    Object.assign(source, updated);
    state.data.evidence = updatedEvidence;
    executionSyncAll();
    document.getElementById('historySessionDialog').close();
    CompassoFeatures.emit('session:history-updated', { id, source: deep ? 'deep-work' : 'session', updatedAt: updated.updatedAt });
    saveData('Histórico corrigido e métricas recalculadas');
    if (document.getElementById('sessionHistoryDialog')?.open) renderSessionHistory();
  } catch (error) {
    document.getElementById('historySessionError').textContent = error.message;
  }
}

function historyEditSaveEvidence(event) {
  event.preventDefault();
  const evidence = state.data.evidence.find(item => item.id === historyEditRuntime.evidenceId);
  const sessionId = document.getElementById('historyEvidenceSession').value;
  const session = historyEditSession(sessionId);
  if (!evidence) return;
  try {
    const updated = historyEditModel.updateEvidence(evidence, {
      sessionId,
      itemId: session?.itemId || evidence.itemId,
      domain: session?.domain || evidence.domain,
      type: document.getElementById('historyEvidenceType').value,
      summary: document.getElementById('historyEvidenceSummary').value,
      details: document.getElementById('historyEvidenceDetails').value,
      createdAt: document.getElementById('historyEvidenceDate').value
    });
    Object.assign(evidence, updated);
    document.getElementById('historyEvidenceDialog').close();
    CompassoFeatures.emit('evidence:history-updated', { id: evidence.id, sessionId, updatedAt: updated.updatedAt });
    saveData('Evidência corrigida e métricas recalculadas');
    if (document.getElementById('sessionHistoryDialog')?.open) renderSessionHistory();
  } catch (error) {
    document.getElementById('historyEvidenceError').textContent = error.message;
  }
}

function historyEditDeleteEvidence() {
  const id = historyEditRuntime.evidenceId;
  if (!id || !confirm('Excluir esta evidência? A sessão e seu tempo serão preservados.')) return;
  try {
    state.data = historyEditModel.deleteEvidence(state.data, id);
    document.getElementById('historyEvidenceDialog').close();
    CompassoFeatures.emit('evidence:history-deleted', { id, deletedAt: state.data._sync.tombstones[`evidence:${id}`] });
    saveData('Evidência excluída; sessão preservada');
    if (document.getElementById('sessionHistoryDialog')?.open) renderSessionHistory();
  } catch (error) {
    document.getElementById('historyEvidenceError').textContent = error.message;
  }
}

function historyEditDecorateAnalytics(historySessions) {
  const visible = historySessions.slice(0, analyticsRuntime.limit);
  document.querySelectorAll('#analyticsHistory .analytics-history-row').forEach((row, index) => {
    const session = visible[index];
    if (!session) return;
    if (session.editedAt) row.querySelector('header')?.insertAdjacentHTML('beforeend', '<span class="history-edited">Editado</span>');
    const aside = row.querySelector(':scope > aside');
    if (aside && !aside.querySelector('[data-history-edit]')) aside.insertAdjacentHTML('beforeend', `<div class="history-edit-actions"><button type="button" data-history-edit="${escapeHtml(session.id)}">Editar</button></div>`);
    const evidenceRows = row.querySelectorAll('.analytics-history-evidence');
    analyticsEvidenceForSession(session.id).forEach((evidence, evidenceIndex) => {
      const evidenceRow = evidenceRows[evidenceIndex];
      if (!evidenceRow) return;
      if (evidence.editedAt) evidenceRow.insertAdjacentHTML('beforeend', '<span class="history-edited">Editado</span>');
      evidenceRow.insertAdjacentHTML('beforeend', `<div class="evidence-edit-actions"><button type="button" data-evidence-edit="${escapeHtml(evidence.id)}">Editar</button><button type="button" class="danger" data-evidence-delete="${escapeHtml(evidence.id)}">Excluir</button></div>`);
    });
  });
}

const renderAnalyticsHistoryWithoutEditing = renderAnalyticsHistory;
renderAnalyticsHistory = function(historySessions) {
  renderAnalyticsHistoryWithoutEditing(historySessions);
  historyEditDecorateAnalytics(historySessions);
};

const renderWeeklyEvidenceWithoutEditing = renderWeeklyEvidence;
renderWeeklyEvidence = function(evidence) {
  renderWeeklyEvidenceWithoutEditing(evidence);
  document.querySelectorAll('#weeklyEvidenceList .weekly-evidence-card').forEach((card, index) => {
    const entry = evidence[index];
    if (!entry) return;
    if (entry.editedAt && !card.querySelector('.history-edited')) card.querySelector('header')?.insertAdjacentHTML('beforeend', '<span class="history-edited">Editado</span>');
    if (!card.querySelector('[data-evidence-edit]')) card.insertAdjacentHTML('beforeend', `<div class="evidence-edit-actions"><button type="button" data-evidence-edit="${escapeHtml(entry.id)}">Editar</button><button type="button" class="danger" data-evidence-delete="${escapeHtml(entry.id)}">Excluir</button></div>`);
  });
};

const renderSessionHistoryWithoutEditing = renderSessionHistory;
renderSessionHistory = function() {
  renderSessionHistoryWithoutEditing();
  const selected = sessionRuntime.historyItem;
  if (!selected) return;
  const sessions = state.data.sessions.filter(session => session.domain === selected.domain && session.itemId === selected.itemId).sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
  document.querySelectorAll('#sessionHistoryList .session-history-row').forEach((row, index) => {
    const session = sessions[index];
    if (!session) return;
    if (session.editedAt) row.querySelector('div')?.insertAdjacentHTML('beforeend', '<span class="history-edited">Editado</span>');
    const currentButton = row.querySelector('[data-delete-session]');
    const actions = document.createElement('div');
    actions.className = 'history-edit-actions';
    actions.innerHTML = `<button type="button" data-history-edit="${escapeHtml(session.id)}">Editar</button>`;
    if (currentButton) actions.appendChild(currentButton);
    row.appendChild(actions);
    row.querySelectorAll('.evidence-history').forEach((evidenceRow, evidenceIndex) => {
      const evidence = evidenceForSession(session.id)[evidenceIndex];
      if (!evidence) return;
      if (evidence.editedAt) evidenceRow.insertAdjacentHTML('beforeend', '<span class="history-edited">Editado</span>');
      evidenceRow.insertAdjacentHTML('beforeend', `<div class="evidence-edit-actions"><button type="button" data-evidence-edit="${escapeHtml(evidence.id)}">Editar</button><button type="button" class="danger" data-evidence-delete="${escapeHtml(evidence.id)}">Excluir</button></div>`);
    });
  });
};

installHistoryEditUi();
document.getElementById('historySessionForm').addEventListener('submit', historyEditSaveSession);
document.getElementById('historyEvidenceForm').addEventListener('submit', historyEditSaveEvidence);
document.getElementById('historyEvidenceDelete').addEventListener('click', historyEditDeleteEvidence);
document.getElementById('historySessionDomain').addEventListener('change', event => {
  historyEditRefreshItems('historySessionItem', event.target.value);
  historyEditRefreshVariants(event.target.value, document.getElementById('historySessionItem').value);
});
document.getElementById('historySessionItem').addEventListener('change', event => historyEditRefreshVariants(document.getElementById('historySessionDomain').value, event.target.value));
document.addEventListener('click', event => {
  const editSession = event.target.closest('[data-history-edit]');
  if (editSession) openHistorySessionEdit(editSession.dataset.historyEdit);
  const editEvidence = event.target.closest('[data-evidence-edit]');
  if (editEvidence) openHistoryEvidenceEdit(editEvidence.dataset.evidenceEdit);
  const deleteEvidence = event.target.closest('[data-evidence-delete]');
  if (deleteEvidence) {
    historyEditRuntime.evidenceId = deleteEvidence.dataset.evidenceDelete;
    historyEditDeleteEvidence();
  }
  const close = event.target.closest('[data-history-close]');
  if (close) document.getElementById(close.dataset.historyClose)?.close();
});
