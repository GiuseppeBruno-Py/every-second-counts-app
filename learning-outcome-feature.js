/* Compasso · Capacidades: resultado durável, próxima tentativa e recursos opcionais */
const learningOutcomeModel = globalThis.CompassoLearningOutcomeModel;
if (!learningOutcomeModel) throw new Error('CompassoLearningOutcomeModel não foi carregado.');

labels.capabilities = { title:'Capacidades', kicker:'Aprender para conseguir fazer' };

const learningOutcomeRuntime = {
  mode:'active',
  editingId:null,
  initialDraft:'',
  returnFocus:null,
  busy:false
};

function outcomeElement(id) { return document.getElementById(id); }
function outcomeClone(value) { return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value)); }
function outcomeItems() { return learningOutcomeModel.sortOutcomes(state.data.learningOutcomes || []); }
function outcomeFind(id) { return (state.data.learningOutcomes || []).find(item => item.id === id) || null; }
function outcomeResources() { return { study:state.data.study || [], reading:state.data.reading || [] }; }
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
  form?.querySelectorAll('button, input, textarea').forEach(control => { control.disabled = learningOutcomeRuntime.busy; });
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
}

function outcomeResolved(outcome) { return learningOutcomeModel.resolveRefs(outcome, outcomeResources()); }
function outcomeResourceLabel(ref) {
  const prefix = ref.type === 'study' ? 'Estudo' : 'Leitura';
  return ref.available ? `${prefix}: ${ref.title}` : `${prefix}: Recurso indisponível`;
}
function outcomeCard(outcome) {
  const resources = outcomeResolved(outcome);
  const archived = outcome.status === 'archived';
  return `<article class="learning-outcome-card${archived ? ' is-archived' : ''}" data-outcome-card="${escapeHtml(outcome.id)}">
    <div class="learning-outcome-card-head">
      <div><span class="learning-outcome-status">${archived ? 'Arquivada' : 'Ativa'}</span><h3>${escapeHtml(outcome.capability)}</h3></div>
      <button class="secondary-btn" type="button" data-outcome-edit="${escapeHtml(outcome.id)}">Editar</button>
    </div>
    ${outcome.proofCriterion ? `<div class="learning-outcome-proof"><span>Como vou saber</span><p>${escapeHtml(outcome.proofCriterion)}</p></div>` : ''}
    <div class="learning-outcome-attempt"><span>Próxima tentativa</span><strong>${escapeHtml(outcome.nextAttempt.text)}</strong></div>
    ${resources.length ? `<div class="learning-outcome-chips" aria-label="Recursos vinculados">${resources.map(ref => `<span class="learning-outcome-chip${ref.available ? '' : ' unavailable'}">${escapeHtml(outcomeResourceLabel(ref))}<button type="button" data-outcome-unlink="${escapeHtml(outcome.id)}" data-resource-type="${ref.type}" data-resource-id="${escapeHtml(ref.id)}" aria-label="Desvincular ${escapeHtml(outcomeResourceLabel(ref))}">×</button></span>`).join('')}</div>` : ''}
    <div class="learning-outcome-card-foot"><span>Atualizada em ${outcomeDate(outcome.updatedAt)}</span><button class="quiet-btn" type="button" data-outcome-status="${escapeHtml(outcome.id)}">${archived ? 'Reativar' : 'Arquivar'}</button></div>
  </article>`;
}
function outcomeRender() {
  const list = outcomeElement('learningOutcomeList');
  if (!list) return;
  const visible = outcomeItems().filter(item => item.status === learningOutcomeRuntime.mode);
  document.querySelectorAll('[data-outcome-mode]').forEach(button => {
    const selected = button.dataset.outcomeMode === learningOutcomeRuntime.mode;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-selected', String(selected));
  });
  list.innerHTML = visible.length
    ? visible.map(outcomeCard).join('')
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
  form.elements.nextAttempt.value = outcome?.nextAttempt?.text || '';
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
    nextAttempt:form.elements.nextAttempt.value
  };
  try {
    const current = learningOutcomeRuntime.editingId ? outcomeFind(learningOutcomeRuntime.editingId) : null;
    const outcome = current ? learningOutcomeModel.updateOutcome(current, input) : learningOutcomeModel.createOutcome(input);
    const outcomes = current
      ? (state.data.learningOutcomes || []).map(item => item.id === outcome.id ? outcome : item)
      : [outcome, ...(state.data.learningOutcomes || [])];
    if (await outcomePersist(outcomeCandidate(outcomes), current ? 'Capacidade atualizada' : 'Capacidade criada')) outcomeClose(true);
  } catch (error) {
    const field = error.code === 'capability-required' ? form.elements.capability : form.elements.nextAttempt;
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

CompassoFeatures.register('learning-outcomes', {
  order:68,
  install() {
    outcomeInstallShell();
    outcomeElement('learningOutcomeForm')?.addEventListener('submit', outcomeSubmit);
    outcomeElement('learningOutcomeDialog')?.addEventListener('cancel', event => { event.preventDefault(); outcomeClose(); });
    outcomeElement('learningOutcomeDialog')?.addEventListener('click', event => { if (event.target === event.currentTarget) outcomeClose(); });
  },
  afterRender:outcomeRender
});
CompassoFeatures.action('[data-outcome-new]', ({ target }) => outcomeOpen(null, target));
CompassoFeatures.action('[data-outcome-edit]', ({ target }) => outcomeOpen(outcomeFind(target.dataset.outcomeEdit), target));
CompassoFeatures.action('[data-outcome-cancel]', () => outcomeClose());
CompassoFeatures.action('[data-outcome-mode]', ({ target }) => { learningOutcomeRuntime.mode = target.dataset.outcomeMode; outcomeRender(); });
CompassoFeatures.action('[data-outcome-status]', ({ target }) => outcomeToggleStatus(target.dataset.outcomeStatus));
CompassoFeatures.action('[data-outcome-unlink]', ({ target }) => outcomeUnlink(target.dataset.outcomeUnlink, target.dataset.resourceType, target.dataset.resourceId));
CompassoFeatures.action('[data-outcome-delete]', () => outcomeDelete());
