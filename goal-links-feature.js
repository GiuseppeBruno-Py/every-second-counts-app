/* Compasso · Metas conectadas a leituras e estudos
 * Uma meta com vínculos calcula seu avanço pela média do progresso dos itens ligados.
 * Metas sem vínculos preservam a medição manual original (dias planejados/executados).
 */

function goalLinksKey(link) { return `${link.domain}:${link.itemId}`; }
function goalLinksSources() {
  return ['reading','study'].flatMap(domain => (state.data[domain] || []).map(item => ({ domain, item })));
}
function normalizeGoalLinks(goal) {
  const valid = new Set(goalLinksSources().map(({domain,item}) => `${domain}:${item.id}`));
  const seen = new Set();
  goal.linkedItems = Array.isArray(goal.linkedItems) ? goal.linkedItems
    .filter(link => link && ['reading','study'].includes(link.domain) && typeof link.itemId === 'string')
    .filter(link => valid.has(goalLinksKey(link)) && !seen.has(goalLinksKey(link)) && Boolean(seen.add(goalLinksKey(link))))
    .map(link => ({ domain:link.domain, itemId:link.itemId })) : [];
  return goal.linkedItems;
}
function syncLinkedGoalProgress() {
  (state.data.goal || []).forEach(goal => {
    const links = normalizeGoalLinks(goal);
    if (!links.length) return;
    const progress = links.reduce((sum, link) => {
      const item = state.data[link.domain].find(candidate => candidate.id === link.itemId);
      return sum + clamp(item?.progress);
    }, 0) / links.length;
    goal.progress = clamp(Math.round(progress));
    if (goal.progress >= 100) goal.status = 'done';
    else if (goal.status === 'done') goal.status = 'active';
  });
}

const goalLinksSaveData = saveData;
saveData = function goalLinksSave(message = 'Progresso salvo') {
  syncLinkedGoalProgress();
  return goalLinksSaveData(message);
};

function goalLinksInstallUi() {
  if (document.getElementById('goalLinksField')) return;
  const metricField = document.getElementById('metricHeading')?.closest('.field');
  if (!metricField) return;
  metricField.insertAdjacentHTML('beforebegin', `<div class="field goal-links-field" id="goalLinksField"><label>Vincular progresso a estudos e leituras</label><p class="field-hint">Selecione um ou mais itens. O progresso da meta será atualizado automaticamente pela média dos estudos e leituras vinculados. Sem vínculos, a meta continua sendo medida manualmente por dias.</p><div class="goal-links-list" id="goalLinksList"></div></div>`);
  const style = document.createElement('style');
  style.id = 'goalLinksStyles';
  style.textContent = `.goal-links-field{display:none}.goal-links-field.show{display:grid}.goal-links-list{display:grid;gap:7px;max-height:205px;overflow:auto;padding:3px}.goal-link-option{display:flex;align-items:flex-start;gap:9px;border:1px solid var(--line);border-radius:10px;padding:9px 10px;background:#fff;cursor:pointer}.goal-link-option input{width:auto;margin-top:2px}.goal-link-option strong,.goal-link-option small{display:block}.goal-link-option strong{font-size:11px}.goal-link-option small{font-size:9px;color:var(--muted);margin-top:3px}.goal-link-domain{color:var(--violet);font-weight:800}.goal-link-empty{padding:11px;border:1px dashed var(--line);border-radius:10px;color:var(--muted);font-size:10px}.goal-linked-summary{margin:10px 0 0;padding:9px 10px;border-radius:9px;background:var(--green-soft);color:var(--green);font-size:9px;line-height:1.45}`;
  document.head.appendChild(style);
}
function renderGoalLinksEditor(goal) {
  goalLinksInstallUi();
  const field = document.getElementById('goalLinksField');
  const list = document.getElementById('goalLinksList');
  if (!field || !list) return;
  const isGoal = document.getElementById('domainField').value === 'goal';
  field.classList.toggle('show', isGoal);
  if (!isGoal) { list.innerHTML = ''; return; }
  const selected = new Set((goal?.linkedItems || []).map(goalLinksKey));
  const sources = goalLinksSources();
  list.innerHTML = sources.length ? sources.map(({domain,item}) => {
    const key = `${domain}:${item.id}`, label = domain === 'reading' ? 'Leitura' : 'Estudo';
    return `<label class="goal-link-option"><input type="checkbox" data-goal-link="${key}" ${selected.has(key) ? 'checked' : ''}><span><strong>${escapeHtml(item.title)}</strong><small><span class="goal-link-domain">${label}</span> · ${clamp(item.progress)}% concluído</small></span></label>`;
  }).join('') : '<div class="goal-link-empty">Adicione uma leitura ou estudo antes de vinculá-lo a uma meta.</div>';
}
function selectedGoalLinks() {
  return Array.from(document.querySelectorAll('[data-goal-link]:checked')).map(input => {
    const [domain,itemId] = input.dataset.goalLink.split(':');
    return { domain, itemId };
  });
}
function enhanceGoalCards(domain) {
  if (domain !== 'goal') return;
  document.querySelectorAll('#goalGrid .item-card').forEach(card => {
    const edit = card.querySelector('[data-edit]');
    const itemId = edit?.dataset.edit?.split(':')[1];
    const goal = state.data.goal.find(item => item.id === itemId);
    const links = goal ? normalizeGoalLinks(goal) : [];
    card.querySelector('.goal-linked-summary')?.remove();
    if (!links.length) return;
    const names = links.map(link => state.data[link.domain].find(item => item.id === link.itemId)?.title).filter(Boolean);
    card.querySelector('.item-metric')?.insertAdjacentHTML('afterend', `<p class="goal-linked-summary"><strong>Progresso automático</strong><br>${names.map(escapeHtml).join(' · ')}</p>`);
  });
}

const goalLinksOpenDialog = openDialog;
openDialog = function goalLinksOpenDialogWrapper(domain = 'reading', itemId = null) {
  goalLinksOpenDialog(domain, itemId);
  renderGoalLinksEditor(itemId ? state.data[domain].find(item => item.id === itemId) : null);
};

document.getElementById('domainField').addEventListener('change', () => renderGoalLinksEditor(null));
document.getElementById('itemForm').addEventListener('submit', event => {
  const domain = document.getElementById('domainField').value;
  if (domain !== 'goal') return;
  const links = selectedGoalLinks();
  const editedId = state.editingId?.split(':')[1] || null;
  const editedGoal = editedId ? state.data.goal.find(item => item.id === editedId) : null;
  const existingIds = new Set(state.data.goal.map(item => item.id));
  const title = document.getElementById('titleField').value.trim();

  // O listener principal do formulário fecha o modal e limpa state.editingId.
  // Preserve a referência antes disso para que qualquer meta editada receba os vínculos.
  if (editedGoal) {
    editedGoal.linkedItems = links;
    return;
  }

  queueMicrotask(() => {
    const goal = state.data.goal.find(item => !existingIds.has(item.id) && item.title === title);
    if (!goal) return;
    goal.linkedItems = links;
    saveData(links.length ? 'Meta vinculada e progresso atualizado' : 'Vínculos da meta atualizados');
  });
}, { capture:true });

CompassoFeatures.register('goal-links',{order:22,afterGrid:enhanceGoalCards});
syncLinkedGoalProgress();
