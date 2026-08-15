/* Compasso · Capacidades: resultado durável, próxima tentativa e recursos opcionais */
const learningOutcomeModel = globalThis.CompassoLearningOutcomeModel;
if (!learningOutcomeModel) throw new Error('CompassoLearningOutcomeModel não foi carregado.');
const capabilityContextModel = globalThis.CompassoCapabilityContextModel;
if (!capabilityContextModel) throw new Error('CompassoCapabilityContextModel não foi carregado.');

labels.capabilities = { title:'Capacidades', kicker:'Aprender para conseguir fazer' };

const learningOutcomeRuntime = {
  mode:'active',
  editingId:null,
  initialDraft:'',
  returnFocus:null,
  busy:false,
  resourceTarget:null,
  signalId:null,
  signalOutcomeId:null,
  signalSourceRef:null,
  signalOrigin:'learner'
};

function outcomeElement(id) { return document.getElementById(id); }
function outcomeClone(value) { return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value)); }
function outcomeItems() { return learningOutcomeModel.sortOutcomes(state.data.learningOutcomes || []); }
function outcomeFind(id) { return (state.data.learningOutcomes || []).find(item => item.id === id) || null; }
function outcomeResources() { return { study:state.data.study || [], reading:state.data.reading || [] }; }
function outcomeFutureUse(value) { return learningOutcomeModel.futureUsePresentation(value); }
function outcomeFutureUseText(value, prefix = 'Uso pretendido') { const presentation=outcomeFutureUse(value);return presentation?`${prefix}: ${presentation.label}`:''; }
function outcomeFutureUseOptions() { return `<option value="">Não especificado</option>${learningOutcomeModel.FUTURE_USES.map(value=>`<option value="${value}">${escapeHtml(outcomeFutureUse(value).label)}</option>`).join('')}`; }
function outcomeDate(value) {
  try { return new Intl.DateTimeFormat('pt-BR', { day:'2-digit', month:'short', year:'numeric' }).format(new Date(value)); }
  catch { return ''; }
}
function outcomeCandidate(outcomes) {
  const candidate = outcomeClone(state.data);
  candidate.learningOutcomes = outcomes;
  return candidate;
}
function outcomeSetError(message = '') {
  const target = outcomeElement('learningOutcomeError');
  if (!target) return;
  target.textContent = message;
  target.hidden = !message;
}
function outcomeSetBusy(value) {
  learningOutcomeRuntime.busy = Boolean(value);
  const form = outcomeElement('learningOutcomeForm');
  form?.querySelectorAll('button, input, textarea, select').forEach(control => { control.disabled = learningOutcomeRuntime.busy; });
  const submit = outcomeElement('learningOutcomeSubmit');
  if (submit) submit.textContent = value ? 'Salvando…' : (learningOutcomeRuntime.editingId ? 'Salvar alterações' : 'Criar capacidade');
}

function outcomeInstallShell() {
  if (!outcomeElement('capabilitiesView')) {
    document.querySelector('.content')?.insertAdjacentHTML('beforeend', `
      <section class="view learning-outcome-view" id="capabilitiesView" aria-labelledby="learningOutcomeHeading">
        <div class="learning-outcome-hero">
          <div>
            <div class="eyebrow">Capacidades</div>
            <h2 id="learningOutcomeHeading">Aprenda para conseguir fazer</h2>
            <p>Defina o que quer conseguir fazer e mantenha uma próxima tentativa concreta.</p>
          </div>
          <button class="primary-btn" type="button" data-outcome-new>${icon('plus')} Nova capacidade</button>
        </div>
        <div class="learning-outcome-toolbar" role="tablist" aria-label="Estado das capacidades">
          <button type="button" role="tab" data-outcome-mode="active" aria-selected="true">Ativas</button>
          <button type="button" role="tab" data-outcome-mode="archived" aria-selected="false">Arquivadas</button>
        </div>
        <div class="learning-outcome-list" id="learningOutcomeList" aria-live="polite"></div>
      </section>`);
  }
  if (!outcomeElement('learningOutcomeDialog')) {
    document.body.insertAdjacentHTML('beforeend', `
      <dialog class="learning-outcome-dialog" id="learningOutcomeDialog" aria-labelledby="learningOutcomeDialogTitle">
        <form id="learningOutcomeForm" novalidate>
          <div class="learning-outcome-dialog-head">
            <div><div class="eyebrow">Capacidade</div><h2 id="learningOutcomeDialogTitle">Nova capacidade</h2></div>
            <button class="icon-btn" type="button" data-outcome-cancel aria-label="Fechar">${icon('x')}</button>
          </div>
          <div class="learning-outcome-form">
            <label for="learningOutcomeCapability">O que você quer conseguir fazer? <span aria-hidden="true">*</span></label>
            <textarea id="learningOutcomeCapability" name="capability" maxlength="1000" required></textarea>
            <p class="learning-outcome-hint">Descreva em linguagem natural. Não precisa usar termos pedagógicos.</p>
            <label for="learningOutcomeProof">Como você vai saber que conseguiu? <span class="learning-outcome-optional">Opcional</span></label>
            <textarea id="learningOutcomeProof" name="proofCriterion" maxlength="1000"></textarea>
            <details class="learning-outcome-resources">
              <summary>Vincular recursos <span>Opcional</span></summary>
              <p>Estudos e leituras ajudam na prática; eles não definem seu avanço.</p>
              <div id="learningOutcomeResourceOptions"></div>
            </details>
            <label for="learningOutcomeFutureUse">Como você precisará usar isso? <span class="learning-outcome-optional">Opcional</span></label>
            <select id="learningOutcomeFutureUse" name="futureUse" aria-describedby="learningOutcomeFutureUseHint">${outcomeFutureUseOptions()}</select>
            <p class="learning-outcome-hint" id="learningOutcomeFutureUseHint">Escolha somente se isso ajudar a orientar a próxima tentativa.</p>
            <label for="learningOutcomeAttempt">O que você vai tentar agora? <span aria-hidden="true">*</span></label>
            <textarea id="learningOutcomeAttempt" name="nextAttempt" maxlength="1000" required></textarea>
            <p class="learning-outcome-hint">Pode ser uma prática, exercício ou outra ação concreta.</p>
            <p class="learning-outcome-error" id="learningOutcomeError" role="alert" hidden></p>
          </div>
          <div class="learning-outcome-dialog-foot">
            <button class="quiet-btn learning-outcome-delete" id="learningOutcomeDelete" type="button" data-outcome-delete hidden>Excluir</button>
            <span></span>
            <button class="secondary-btn" type="button" data-outcome-cancel>Cancelar</button>
            <button class="primary-btn" id="learningOutcomeSubmit" type="submit">Criar capacidade</button>
          </div>
        </form>
      </dialog>`);
  }
  if (!outcomeElement('capabilityResourceDialog')) {
    document.body.insertAdjacentHTML('beforeend', `
      <dialog class="learning-outcome-dialog capability-resource-dialog" id="capabilityResourceDialog" aria-labelledby="capabilityResourceTitle">
        <form id="capabilityResourceForm">
          <div class="learning-outcome-dialog-head"><div><div class="eyebrow">Recurso de apoio</div><h2 id="capabilityResourceTitle">Capacidades deste recurso</h2></div><button class="icon-btn" type="button" data-capability-resource-close aria-label="Fechar">${icon('x')}</button></div>
          <div class="learning-outcome-form"><p>O vínculo é opcional e não altera o progresso do recurso nem da capacidade.</p><div id="capabilityResourceOptions"></div><p class="learning-outcome-error" id="capabilityResourceError" role="alert" hidden></p></div>
          <div class="learning-outcome-dialog-foot"><span></span><button class="secondary-btn" type="button" data-capability-resource-close>Cancelar</button><button class="primary-btn" type="submit">Salvar vínculos</button></div>
        </form>
      </dialog>`);
  }
  if (!outcomeElement('learningSignalDialog')) {
    document.body.insertAdjacentHTML('beforeend', `
      <dialog class="learning-outcome-dialog learning-signal-dialog" id="learningSignalDialog" aria-labelledby="learningSignalTitle">
        <form id="learningSignalForm">
          <div class="learning-outcome-dialog-head"><div><div class="eyebrow">Decisão do aprendiz</div><h2 id="learningSignalTitle">Registrar sinal</h2></div><button class="icon-btn" type="button" data-signal-close aria-label="Fechar">${icon('x')}</button></div>
          <div class="learning-outcome-form"><label for="learningSignalKind">Tipo</label><select id="learningSignalKind"><option value="feedback">Feedback</option><option value="gap">Lacuna ou assunto fraco</option><option value="question">Pergunta</option><option value="insight">Insight</option></select><label for="learningSignalText">O que deve informar sua próxima decisão?</label><textarea id="learningSignalText" maxlength="1000" required aria-describedby="learningSignalProvenance learningSignalConsent"></textarea><p class="learning-signal-provenance" id="learningSignalProvenance" hidden></p><p id="learningSignalConsent">O sinal só será salvo após sua confirmação e nunca mudará a tentativa automaticamente.</p><p class="learning-outcome-error" id="learningSignalError" role="alert" hidden></p></div>
          <div class="learning-outcome-dialog-foot"><button class="quiet-btn learning-outcome-delete" id="learningSignalDelete" type="button" data-signal-delete hidden>Excluir</button><span></span><button class="secondary-btn" type="button" data-signal-close>Cancelar</button><button class="primary-btn" type="submit">Salvar sinal</button></div>
        </form>
      </dialog>`);
  }
}

function outcomeResolved(outcome) { return learningOutcomeModel.resolveRefs(outcome, outcomeResources()); }
function outcomeUpdateFutureUseHint() {
  const select=outcomeElement('learningOutcomeFutureUse'),hint=outcomeElement('learningOutcomeFutureUseHint'),presentation=outcomeFutureUse(select?.value);
  if(hint)hint.textContent=presentation?.guidance||'Escolha somente se isso ajudar a orientar a próxima tentativa.';
}
function outcomeResourceLabel(ref) {
  const prefix = ref.type === 'study' ? 'Estudo' : 'Leitura';
  return ref.available ? `${prefix}: ${ref.title}` : `${prefix}: Recurso indisponível`;
}
function outcomeExecutions(id) {
  return (state.data.executionSessions || []).filter(session => session.learningContext?.outcomeId === id && ['completed','interrupted'].includes(session.status))
    .sort((left,right) => String(right.endedAt || right.startedAt || right.createdAt).localeCompare(String(left.endedAt || left.startedAt || left.createdAt)));
}
function outcomeExecutionContext(outcome) {
  const session = outcomeExecutions(outcome.id)[0];
  if (!session) return '';
  const evidence = (state.data.evidence || []).filter(item => item.sessionId === session.id);
  const minutes = Math.max(0,Math.round(Number(session.durationMs || 0) / 60000));
  let resource = '';
  if (['study','reading'].includes(session.domain)) {
    const item = state.data[session.domain]?.find(candidate => candidate.id === session.itemId);
    resource = item ? `${session.domain === 'study' ? 'Estudo' : 'Leitura'}: ${item.title || item.id}` : 'Recurso indisponível';
  }
  return `<section class="learning-outcome-execution" aria-label="Última execução desta capacidade">
    <span>Última execução</span><strong>${escapeHtml(session.learningContext.attemptText)}</strong>
    ${session.learningContext?.futureUse?`<p class="future-use-context">${escapeHtml(outcomeFutureUseText(session.learningContext.futureUse,'Uso na execução'))}</p>`:''}
    <p>${escapeHtml(outcomeDate(session.endedAt || session.startedAt || session.createdAt))}${minutes ? ` · ${minutes} min` : ''}${resource ? ` · ${escapeHtml(resource)}` : ''}</p>
    ${session.result ? `<p>Registro: ${escapeHtml(session.result)}</p>` : ''}
    ${evidence.length ? `<div class="learning-outcome-evidence">${evidence.map(item => `<p><b>Evidência:</b> ${escapeHtml(item.summary)}</p>`).join('')}</div>` : '<p>Nenhuma evidência vinculada.</p>'}
  </section>`;
}
function outcomeSignalLabel(kind) { return {feedback:'Feedback',gap:'Lacuna',question:'Pergunta',insight:'Insight'}[kind] || 'Sinal'; }
function outcomeContextSummary(outcome, indexes) {
  const summary = capabilityContextModel.capabilitySummary(outcome.id, state.data, indexes);
  const today = summary.today.find(entry => entry.plan?.date === todayDateKey());
  const executions = summary.executions.slice(0, 3);
  const evidence = summary.evidence.slice(0, 4);
  const projected = [];
  executions.forEach(session => { if (String(session.result || session.reflection || '').trim()) projected.push({kind:'feedback',text:session.result || session.reflection,sourceRef:{type:'execution',id:session.id}}); });
  evidence.forEach(item => { if (['question','insight'].includes(item.type)) projected.push({kind:item.type,text:item.summary,sourceRef:{type:'evidence',id:item.id}}); });
  const reflection = summary.latestReflection;
  const sections = [];
  if (today) sections.push(`<div class="capability-context-block"><h4>Hoje</h4><p>${today.item.completedAt ? 'Planejada e concluída no dia' : 'Pronta no plano do dia'} · ${escapeHtml(capabilityContextModel.resolveCapabilityRef(today.item.capabilityRef,[outcome]).attemptText)}</p><button type="button" data-outcome-open-today="${escapeHtml(outcome.id)}">Abrir em Hoje</button></div>`);
  if (executions.length) sections.push(`<div class="capability-context-block"><h4>Última execução e tentativas finalizadas</h4>${executions.map(session=>`<article><strong>${escapeHtml(session.learningContext?.attemptText || outcome.nextAttempt.text)}</strong><span>${escapeHtml(outcomeDate(session.endedAt || session.startedAt))} · ${session.status === 'interrupted' ? 'Interrompida' : 'Concluída'}</span>${session.learningContext?.futureUse?`<p class="future-use-context">${escapeHtml(outcomeFutureUseText(session.learningContext.futureUse,'Uso na execução'))}</p>`:''}${session.result || session.reflection ? `<p>${escapeHtml(session.result || session.reflection)}</p>` : ''}<button type="button" data-signal-new="${escapeHtml(outcome.id)}" data-signal-source-type="execution" data-signal-source-id="${escapeHtml(session.id)}" data-signal-kind="feedback" data-signal-text="${escapeHtml(session.result || session.reflection || '')}">Registrar sinal desta tentativa</button></article>`).join('')}</div>`);
  if (evidence.length) sections.push(`<div class="capability-context-block"><h4>Evidence</h4>${evidence.map(item=>`<article><strong>${escapeHtml(item.summary)}</strong><span>${escapeHtml((typeof evidenceTypeLabels==='object'&&evidenceTypeLabels[item.type])||'Evidência')}</span>${['question','insight'].includes(item.type)?`<button type="button" data-signal-new="${escapeHtml(outcome.id)}" data-signal-source-type="evidence" data-signal-source-id="${escapeHtml(item.id)}" data-signal-kind="${item.type}" data-signal-text="${escapeHtml(item.summary)}">Registrar como sinal</button>`:''}</article>`).join('')}</div>`);
  if (projected.length) sections.push(`<div class="capability-context-block capability-source-signals"><h4>Sinais nas fontes</h4><p>${projected.length} ${projected.length===1?'registro permanece em sua fonte':'registros permanecem em suas fontes'}; nada é copiado automaticamente.</p></div>`);
  if (summary.signals.length) sections.push(`<div class="capability-context-block"><h4>Sinais confirmados</h4>${summary.signals.map(signal=>`<article class="learning-signal-row"><span>${escapeHtml(outcomeSignalLabel(signal.kind))}${signal.sourceRef?' · com origem':' · sem origem'}</span><strong>${escapeHtml(signal.text)}</strong><button type="button" data-signal-edit="${escapeHtml(signal.id)}">Editar</button></article>`).join('')}</div>`);
  if (reflection) sections.push(`<div class="capability-context-block"><h4>Reflexão mais recente</h4>${reflection.reflection?`<p>${escapeHtml(reflection.reflection)}</p>`:''}<strong>${reflection.decision==='revise'?'Tentativa revisada':'Tentativa mantida'}: ${escapeHtml(reflection.decidedAttemptText)}</strong><span>${escapeHtml(outcomeDate(reflection.decidedAt))}</span></div>`);
  return sections.length ? `<details class="capability-context-summary"><summary>Contexto de aprendizagem</summary><div class="capability-context-grid">${sections.join('')}</div></details>` : '';
}
function outcomeCard(outcome, indexes) {
  const resources = outcomeResolved(outcome);
  const archived = outcome.status === 'archived';
  return `<article class="learning-outcome-card${archived ? ' is-archived' : ''}" data-outcome-card="${escapeHtml(outcome.id)}" tabindex="-1">
    <div class="learning-outcome-card-head">
      <div><span class="learning-outcome-status">${archived ? 'Arquivada' : 'Ativa'}</span><h3>${escapeHtml(outcome.capability)}</h3></div>
      <button class="secondary-btn" type="button" data-outcome-edit="${escapeHtml(outcome.id)}">Editar</button>
    </div>
    ${outcome.proofCriterion ? `<div class="learning-outcome-proof"><span>Como vou saber</span><p>${escapeHtml(outcome.proofCriterion)}</p></div>` : ''}
    <div class="learning-outcome-attempt"><span>Próxima tentativa</span><strong>${escapeHtml(outcome.nextAttempt.text)}</strong>${outcome.nextAttempt.futureUse?`<small class="future-use-context">${escapeHtml(outcomeFutureUseText(outcome.nextAttempt.futureUse))}</small>`:''}</div>
    ${outcomeContextSummary(outcome,indexes)}
    ${resources.length ? `<div class="learning-outcome-chips" aria-label="Recursos vinculados">${resources.map(ref => `<span class="learning-outcome-chip${ref.available ? '' : ' unavailable'}">${escapeHtml(outcomeResourceLabel(ref))}<button type="button" data-outcome-unlink="${escapeHtml(outcome.id)}" data-resource-type="${ref.type}" data-resource-id="${escapeHtml(ref.id)}" aria-label="Desvincular ${escapeHtml(outcomeResourceLabel(ref))}">×</button></span>`).join('')}</div>` : ''}
    <div class="learning-outcome-card-foot"><span>Atualizada em ${outcomeDate(outcome.updatedAt)}</span><div>${archived ? '' : `<button class="secondary-btn" type="button" data-outcome-today="${escapeHtml(outcome.id)}">${capabilityContextModel.capabilitySummary(outcome.id,state.data,indexes).today.some(entry=>entry.plan?.date===todayDateKey())?'Abrir em Hoje':'Adicionar a Hoje'}</button><button class="secondary-btn" type="button" data-signal-new="${escapeHtml(outcome.id)}">Registrar sinal</button><button class="primary-btn" type="button" data-outcome-execute="${escapeHtml(outcome.id)}">Executar tentativa</button>`}<button class="quiet-btn" type="button" data-outcome-status="${escapeHtml(outcome.id)}">${archived ? 'Reativar' : 'Arquivar'}</button></div></div>
  </article>`;
}
function outcomeRender() {
  const list = outcomeElement('learningOutcomeList');
  if (!list) return;
  const indexes = capabilityContextModel.buildIndexes(state.data);
  const visible = outcomeItems().filter(item => item.status === learningOutcomeRuntime.mode);
  document.querySelectorAll('[data-outcome-mode]').forEach(button => {
    const selected = button.dataset.outcomeMode === learningOutcomeRuntime.mode;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-selected', String(selected));
  });
  list.innerHTML = visible.length
    ? visible.map(outcome => outcomeCard(outcome,indexes)).join('')
    : `<div class="learning-outcome-empty"><strong>${learningOutcomeRuntime.mode === 'active' ? 'Nenhuma capacidade ativa' : 'Nenhuma capacidade arquivada'}</strong><p>${learningOutcomeRuntime.mode === 'active' ? 'Comece pelo que você quer conseguir fazer.' : 'Capacidades arquivadas ficam preservadas aqui.'}</p>${learningOutcomeRuntime.mode === 'active' ? '<button class="primary-btn" type="button" data-outcome-new>Nova capacidade</button>' : ''}</div>`;
}

function outcomeResourceOptions(selected = []) {
  const selectedKeys = new Set(selected.map(ref => `${ref.type}:${ref.id}`));
  const groups = [
    ['study','Estudos',state.data.study || []],
    ['reading','Leituras',state.data.reading || []]
  ];
  const known = new Set(groups.flatMap(([type,,items]) => items.map(item => `${type}:${item.id}`)));
  const html = groups.map(([type,label,items]) => `<fieldset><legend>${label}</legend>${items.length ? items.map(item => {
    const key = `${type}:${item.id}`;
    return `<label><input type="checkbox" name="outcomeResource" data-resource-type="${type}" data-resource-id="${escapeHtml(item.id)}" ${selectedKeys.has(key) ? 'checked' : ''}> <span>${escapeHtml(item.title || item.id)}</span></label>`;
  }).join('') : '<p>Nenhum recurso disponível.</p>'}</fieldset>`).join('');
  const missing = selected.filter(ref => !known.has(`${ref.type}:${ref.id}`));
  return html + (missing.length ? `<fieldset><legend>Indisponíveis</legend>${missing.map(ref => `<label class="unavailable"><input type="checkbox" name="outcomeResource" data-resource-type="${ref.type}" data-resource-id="${escapeHtml(ref.id)}" checked> <span>${ref.type === 'study' ? 'Estudo' : 'Leitura'}: Recurso indisponível</span></label>`).join('')}</fieldset>` : '');
}
function outcomeDraftSignature() {
  const form = outcomeElement('learningOutcomeForm');
  if (!form) return '';
  return JSON.stringify({
    capability:form.elements.capability.value,
    proofCriterion:form.elements.proofCriterion.value,
    futureUse:form.elements.futureUse.value,
    nextAttempt:form.elements.nextAttempt.value,
    refs:[...form.querySelectorAll('[name="outcomeResource"]:checked')].map(input => `${input.dataset.resourceType}:${input.dataset.resourceId}`).sort()
  });
}
function outcomeOpen(outcome, trigger) {
  const dialog = outcomeElement('learningOutcomeDialog');
  const form = outcomeElement('learningOutcomeForm');
  if (!dialog || !form) return;
  learningOutcomeRuntime.editingId = outcome?.id || null;
  learningOutcomeRuntime.returnFocus = trigger || document.activeElement;
  outcomeElement('learningOutcomeDialogTitle').textContent = outcome ? 'Editar capacidade' : 'Nova capacidade';
  form.elements.capability.value = outcome?.capability || '';
  form.elements.proofCriterion.value = outcome?.proofCriterion || '';
  form.elements.futureUse.value = outcome?.nextAttempt?.futureUse || '';
  form.elements.nextAttempt.value = outcome?.nextAttempt?.text || '';
  outcomeUpdateFutureUseHint();
  form.querySelectorAll('[aria-invalid="true"]').forEach(field => field.removeAttribute('aria-invalid'));
  outcomeElement('learningOutcomeResourceOptions').innerHTML = outcomeResourceOptions(outcome?.resourceRefs || []);
  outcomeElement('learningOutcomeDelete').hidden = !outcome;
  outcomeSetError('');
  outcomeSetBusy(false);
  learningOutcomeRuntime.initialDraft = outcomeDraftSignature();
  dialog.showModal();
  queueMicrotask(() => form.elements.capability.focus());
}
function outcomeClose(force = false) {
  const dialog = outcomeElement('learningOutcomeDialog');
  if (!dialog?.open) return true;
  if (!force && outcomeDraftSignature() !== learningOutcomeRuntime.initialDraft && !confirm('Descartar alterações não salvas?')) return false;
  dialog.close();
  learningOutcomeRuntime.returnFocus?.focus?.();
  learningOutcomeRuntime.editingId = null;
  return true;
}
function outcomeFormRefs() {
  return [...outcomeElement('learningOutcomeForm').querySelectorAll('[name="outcomeResource"]:checked')]
    .map(input => ({ type:input.dataset.resourceType, id:input.dataset.resourceId }));
}

async function outcomePersist(candidate, successMessage, failureMessage = 'Não foi possível salvar esta capacidade.') {
  if (learningOutcomeRuntime.busy) return false;
  const previous = state.data;
  outcomeSetBusy(true);
  outcomeSetError('');
  state.data = candidate;
  const persisted = await saveData(successMessage);
  if (persisted) {
    outcomeSetBusy(false);
    return true;
  }
  state.data = previous;
  try { await window.CompassoStorage.save(STORAGE_KEY, previous); } catch {}
  renderAll();
  outcomeSetBusy(false);
  outcomeSetError(failureMessage);
  return false;
}
async function outcomeSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  form.querySelectorAll('[aria-invalid="true"]').forEach(field => field.removeAttribute('aria-invalid'));
  const input = {
    capability:form.elements.capability.value,
    proofCriterion:form.elements.proofCriterion.value,
    resourceRefs:outcomeFormRefs(),
    nextAttempt:{text:form.elements.nextAttempt.value,futureUse:form.elements.futureUse.value||null}
  };
  try {
    const current = learningOutcomeRuntime.editingId ? outcomeFind(learningOutcomeRuntime.editingId) : null;
    const outcome = current ? learningOutcomeModel.updateOutcome(current, input) : learningOutcomeModel.createOutcome(input);
    const outcomes = current
      ? (state.data.learningOutcomes || []).map(item => item.id === outcome.id ? outcome : item)
      : [outcome, ...(state.data.learningOutcomes || [])];
    if (await outcomePersist(outcomeCandidate(outcomes), current ? 'Capacidade atualizada' : 'Capacidade criada')) outcomeClose(true);
  } catch (error) {
    const field = error.code === 'capability-required' ? form.elements.capability : error.code === 'future-use-invalid' ? form.elements.futureUse : form.elements.nextAttempt;
    field?.focus();
    field?.setAttribute('aria-invalid','true');
    outcomeSetError(error.message || 'Revise os campos obrigatórios.');
  }
}
async function outcomeToggleStatus(id) {
  const current = outcomeFind(id);
  if (!current) return;
  const updated = current.status === 'archived' ? learningOutcomeModel.reactivateOutcome(current) : learningOutcomeModel.archiveOutcome(current);
  const outcomes = (state.data.learningOutcomes || []).map(item => item.id === id ? updated : item);
  await outcomePersist(outcomeCandidate(outcomes), current.status === 'archived' ? 'Capacidade reativada' : 'Capacidade arquivada');
}
async function outcomeUnlink(id, type, resourceId) {
  const current = outcomeFind(id);
  if (!current) return;
  const refs = current.resourceRefs.filter(ref => ref.type !== type || ref.id !== resourceId);
  const updated = learningOutcomeModel.updateOutcome(current, { resourceRefs:refs });
  const outcomes = state.data.learningOutcomes.map(item => item.id === id ? updated : item);
  await outcomePersist(outcomeCandidate(outcomes), 'Recurso desvinculado');
}
async function outcomeDelete(id = learningOutcomeRuntime.editingId) {
  const current = outcomeFind(id);
  if (!current || !confirm(`Excluir a capacidade “${current.capability}”? Os recursos vinculados serão preservados.`)) return;
  const candidate = learningOutcomeModel.deleteOutcome(outcomeClone(state.data), id);
  if (await outcomePersist(candidate, 'Capacidade excluída')) outcomeClose(true);
}
function outcomeEnhanceResourceCards(domain) {
  if (!['study','reading'].includes(domain)) return;
  const outcomes = outcomeItems();
  document.querySelectorAll(`#${domain}Grid .item-card`).forEach(card => {
    const edit = card.querySelector('[data-edit]');
    const actions = card.querySelector('.card-actions');
    if (!edit || !actions || actions.querySelector('[data-capability-resource]')) return;
    const [,itemId] = edit.dataset.edit.split(':');
    const count = capabilityContextModel.capabilitiesForResource(domain,itemId,outcomes).length;
    actions.insertAdjacentHTML('beforeend',`<button type="button" data-capability-resource="${domain}:${escapeHtml(itemId)}">Capacidades · ${count}</button>`);
  });
}
function outcomeOpenResourceManager(domain,itemId,trigger) {
  const resource=state.data[domain]?.find(item=>item.id===itemId);
  if(!resource)return;
  learningOutcomeRuntime.resourceTarget={domain,itemId};learningOutcomeRuntime.returnFocus=trigger||document.activeElement;
  outcomeElement('capabilityResourceTitle').textContent=`Capacidades · ${resource.title||itemId}`;
  const options=outcomeItems().filter(item=>item.status==='active'||item.resourceRefs.some(ref=>ref.type===domain&&ref.id===itemId));
  outcomeElement('capabilityResourceOptions').innerHTML=options.length?options.map(item=>{
    const linked=item.resourceRefs.some(ref=>ref.type===domain&&ref.id===itemId),archived=item.status==='archived';
    return `<label class="capability-resource-option${archived?' is-archived':''}"><input type="checkbox" name="capabilityResourceOutcome" value="${escapeHtml(item.id)}" ${linked?'checked':''} ${archived&&!linked?'disabled':''}><span><strong>${escapeHtml(item.capability)}</strong><small>${archived?'Arquivada · desmarque para desvincular':'Tentativa: '+escapeHtml(item.nextAttempt.text)}</small></span></label>`;
  }).join(''):'<p>Nenhuma capacidade ativa disponível.</p>';
  const error=outcomeElement('capabilityResourceError');error.hidden=true;error.textContent='';
  outcomeElement('capabilityResourceDialog').showModal();queueMicrotask(()=>outcomeElement('capabilityResourceOptions').querySelector('input:not(:disabled)')?.focus?.());
}
function outcomeCloseResourceManager(){const dialog=outcomeElement('capabilityResourceDialog');if(dialog?.open)dialog.close();learningOutcomeRuntime.returnFocus?.focus?.();learningOutcomeRuntime.resourceTarget=null;}
async function outcomeSaveResourceLinks(event){
  event.preventDefault();const target=learningOutcomeRuntime.resourceTarget;if(!target)return;
  const resource=state.data[target.domain]?.find(item=>item.id===target.itemId),error=outcomeElement('capabilityResourceError');
  if(!resource){error.textContent='O recurso não está mais disponível.';error.hidden=false;return}
  const selected=new Set([...outcomeElement('capabilityResourceForm').querySelectorAll('[name="capabilityResourceOutcome"]:checked')].map(input=>input.value));
  let changed=false;
  const outcomes=(state.data.learningOutcomes||[]).map(item=>{
    const linked=item.resourceRefs.some(ref=>ref.type===target.domain&&ref.id===target.itemId);
    const shouldLink=item.status==='active'?selected.has(item.id):(linked&&selected.has(item.id));
    if(linked===shouldLink)return item;
    changed=true;const refs=shouldLink?[...item.resourceRefs,{type:target.domain,id:target.itemId}]:item.resourceRefs.filter(ref=>ref.type!==target.domain||ref.id!==target.itemId);
    return learningOutcomeModel.updateOutcome(item,{resourceRefs:refs});
  });
  if(!changed){outcomeCloseResourceManager();return}
  if(await outcomePersist(outcomeCandidate(outcomes),'Vínculos de capacidades atualizados','Não foi possível salvar os vínculos.'))outcomeCloseResourceManager();
  else{error.textContent='Não foi possível salvar os vínculos.';error.hidden=false}
}

function outcomeTodayPlanCandidate(outcome){
  const candidate=outcomeClone(state.data),date=todayDateKey();candidate.dailyPlans=Array.isArray(candidate.dailyPlans)?candidate.dailyPlans:[];
  let index=candidate.dailyPlans.findIndex(plan=>plan?.date===date);
  const base=index>=0?candidate.dailyPlans[index]:{id:`day-${date}`,schemaVersion:TODAY_FEATURE_VERSION,date,items:[],updatedAt:new Date().toISOString()};
  const updated=capabilityContextModel.addTodayItem(base,outcome);
  if(index>=0)candidate.dailyPlans[index]=updated;else candidate.dailyPlans.unshift(updated);
  return candidate;
}
function outcomeOpenInToday(outcomeId){
  CompassoFeatures.execute('today.openPrimary',{outcomeId});
}
async function outcomeAddToToday(id){
  const outcome=outcomeFind(id);if(!outcome||outcome.status!=='active')return;
  const current=(state.data.dailyPlans||[]).find(plan=>plan?.date===todayDateKey())?.items?.some(item=>item.type==='capability-attempt'&&item.capabilityRef?.outcomeId===id&&item.capabilityRef?.attemptId===outcome.nextAttempt.id);
  if(current)return outcomeOpenInToday(id);
  if(await outcomePersist(outcomeTodayPlanCandidate(outcome),'Tentativa adicionada a Hoje','Não foi possível salvar o plano de Hoje.'))outcomeOpenInToday(id);
}

function outcomeSignalFind(id){return(state.data.learningSignals||[]).find(item=>item.id===id)||null}
function outcomeOpenSignal({outcomeId,signalId=null,sourceRef=null,kind='feedback',text='',origin='learner',provenance=''},trigger){
  const signal=signalId?outcomeSignalFind(signalId):null,outcome=outcomeFind(outcomeId||signal?.capabilityRef?.outcomeId);
  if(!signal&&(!outcome||outcome.status!=='active'))return;
  learningOutcomeRuntime.signalId=signal?.id||null;learningOutcomeRuntime.signalOutcomeId=outcome?.id||signal?.capabilityRef?.outcomeId;learningOutcomeRuntime.signalSourceRef=sourceRef||signal?.sourceRef||null;learningOutcomeRuntime.signalOrigin=signal?.origin||(origin==='confirmed-suggestion'?'confirmed-suggestion':'learner');learningOutcomeRuntime.returnFocus=trigger||document.activeElement;
  outcomeElement('learningSignalTitle').textContent=signal?'Editar sinal':'Registrar sinal';outcomeElement('learningSignalKind').value=signal?.kind||kind;outcomeElement('learningSignalText').value=signal?.text||text;
  const sourceHelp=outcomeElement('learningSignalProvenance');sourceHelp.textContent=provenance||(learningOutcomeRuntime.signalOrigin==='confirmed-suggestion'?'Este texto veio de uma fonte vinculada e só permanece como sinal depois da sua confirmação.':'');sourceHelp.hidden=!sourceHelp.textContent;
  outcomeElement('learningSignalDelete').hidden=!signal;const error=outcomeElement('learningSignalError');error.hidden=true;error.textContent='';outcomeElement('learningSignalDialog').showModal();queueMicrotask(()=>outcomeElement('learningSignalText').focus());
}
function outcomeCloseSignal(){const dialog=outcomeElement('learningSignalDialog');if(dialog?.open)dialog.close();learningOutcomeRuntime.returnFocus?.focus?.();learningOutcomeRuntime.signalId=null;learningOutcomeRuntime.signalOutcomeId=null;learningOutcomeRuntime.signalSourceRef=null;learningOutcomeRuntime.signalOrigin='learner'}
async function outcomeSaveSignal(event){
  event.preventDefault();const current=outcomeSignalFind(learningOutcomeRuntime.signalId),outcome=outcomeFind(learningOutcomeRuntime.signalOutcomeId),error=outcomeElement('learningSignalError');
  try{
    const input={kind:outcomeElement('learningSignalKind').value,text:outcomeElement('learningSignalText').value,sourceRef:learningOutcomeRuntime.signalSourceRef,origin:learningOutcomeRuntime.signalOrigin};
    const signal=current?capabilityContextModel.updateSignal(current,input):capabilityContextModel.createSignal({...input,capabilityRef:capabilityContextModel.createCapabilityRef(outcome)});
    const candidate=outcomeClone(state.data);candidate.learningSignals=current?(candidate.learningSignals||[]).map(item=>item.id===signal.id?signal:item):[signal,...(candidate.learningSignals||[])];
    if(await outcomePersist(candidate,current?'Sinal atualizado':'Sinal registrado','Não foi possível salvar o sinal.')){const payload={signalId:signal.id,outcomeId:signal.capabilityRef.outcomeId,sourceRef:signal.sourceRef};outcomeCloseSignal();CompassoFeatures.emit('learning-signal:saved',payload)}else{error.textContent='Não foi possível salvar o sinal.';error.hidden=false;outcomeElement('learningSignalText').focus()}
  }catch(problem){error.textContent=problem.message||'Revise o sinal.';error.hidden=false;outcomeElement('learningSignalText').focus()}
}
async function outcomeDeleteSignal(){
  const signal=outcomeSignalFind(learningOutcomeRuntime.signalId);if(!signal||!confirm('Excluir este sinal de aprendizagem? A fonte será preservada.'))return;
  const candidate=capabilityContextModel.deleteSignal(state.data,signal.id);
  if(await outcomePersist(candidate,'Sinal excluído','Não foi possível excluir o sinal.'))outcomeCloseSignal();
}

function outcomeStartExecution(id, trigger) {
  const outcome = outcomeFind(id);
  if (!outcome || outcome.status !== 'active') return;
  const learningContext = learningOutcomeModel.createExecutionContext(outcome);
  if (!learningContext) return showToast('A tentativa atual não está disponível');
  learningOutcomeRuntime.returnFocus = trigger || document.activeElement;
  openOutcomeSessionStart(outcome.id,{learningContext,resources:outcomeResolved(outcome)});
}

CompassoFeatures.command('learningSignal.open',payload=>outcomeOpenSignal(payload||{},payload?.trigger));

CompassoFeatures.register('learning-outcomes', {
  order:68,
  install() {
    outcomeInstallShell();
    outcomeElement('learningOutcomeForm')?.addEventListener('submit', outcomeSubmit);
    outcomeElement('learningOutcomeFutureUse')?.addEventListener('change', outcomeUpdateFutureUseHint);
    outcomeElement('capabilityResourceForm')?.addEventListener('submit', outcomeSaveResourceLinks);
    outcomeElement('learningSignalForm')?.addEventListener('submit', outcomeSaveSignal);
    outcomeElement('learningOutcomeDialog')?.addEventListener('cancel', event => { event.preventDefault(); outcomeClose(); });
    outcomeElement('learningOutcomeDialog')?.addEventListener('click', event => { if (event.target === event.currentTarget) outcomeClose(); });
    outcomeElement('capabilityResourceDialog')?.addEventListener('cancel', event => { event.preventDefault(); outcomeCloseResourceManager(); });
    outcomeElement('learningSignalDialog')?.addEventListener('cancel', event => { event.preventDefault(); outcomeCloseSignal(); });
  },
  afterGrid:outcomeEnhanceResourceCards,
  afterRender:outcomeRender
});
CompassoFeatures.action('[data-outcome-new]', ({ target }) => outcomeOpen(null, target));
CompassoFeatures.action('[data-outcome-edit]', ({ target }) => outcomeOpen(outcomeFind(target.dataset.outcomeEdit), target));
CompassoFeatures.action('[data-outcome-execute]', ({ target }) => outcomeStartExecution(target.dataset.outcomeExecute,target));
CompassoFeatures.action('[data-outcome-today]', ({ target }) => outcomeAddToToday(target.dataset.outcomeToday));
CompassoFeatures.action('[data-outcome-open-today]', ({ target }) => outcomeOpenInToday(target.dataset.outcomeOpenToday));
CompassoFeatures.action('[data-outcome-cancel]', () => outcomeClose());
CompassoFeatures.action('[data-outcome-mode]', ({ target }) => { learningOutcomeRuntime.mode = target.dataset.outcomeMode; outcomeRender(); });
CompassoFeatures.action('[data-outcome-status]', ({ target }) => outcomeToggleStatus(target.dataset.outcomeStatus));
CompassoFeatures.action('[data-outcome-unlink]', ({ target }) => outcomeUnlink(target.dataset.outcomeUnlink, target.dataset.resourceType, target.dataset.resourceId));
CompassoFeatures.action('[data-outcome-delete]', () => outcomeDelete());
CompassoFeatures.action('[data-capability-resource]', ({ target }) => { const [domain,itemId]=target.dataset.capabilityResource.split(':');outcomeOpenResourceManager(domain,itemId,target); });
CompassoFeatures.action('[data-capability-resource-close]', () => outcomeCloseResourceManager());
CompassoFeatures.action('[data-signal-new]', ({ target }) => {const text=target.dataset.signalText||'';outcomeOpenSignal({outcomeId:target.dataset.signalNew,sourceRef:target.dataset.signalSourceType?{type:target.dataset.signalSourceType,id:target.dataset.signalSourceId}:null,kind:target.dataset.signalKind||'feedback',text,origin:text?'confirmed-suggestion':'learner',provenance:text?'Sugestão baseada no registro de origem. Revise antes de confirmar.':''},target)});
CompassoFeatures.action('[data-signal-edit]', ({ target }) => outcomeOpenSignal({signalId:target.dataset.signalEdit},target));
CompassoFeatures.action('[data-signal-close]', () => outcomeCloseSignal());
CompassoFeatures.action('[data-signal-delete]', () => outcomeDeleteSignal());
