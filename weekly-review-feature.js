/* Compasso · Revisão semanal guiada por evidências
 * Injetado após sessions-feature.js e evidence-feature.js no módulo principal.
 */

const WEEKLY_REVIEW_VERSION = 1;
const weeklySessionKindModel = globalThis.CompassoSessionKindModel;
state.data.weeklyReviews = Array.isArray(state.data.weeklyReviews) ? state.data.weeklyReviews : [];
labels.weekly = { title: 'Revisão semanal', kicker: 'Evidências e direção' };

const weeklyReviewRuntime = { offset: 0, renderedRange:null };

function weeklyStartOfWeek(reference = new Date()) {
  const date = new Date(reference);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay();
  const distance = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + distance);
  return date;
}

function weeklyAddDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function weeklyDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function weeklyRange(offset = weeklyReviewRuntime.offset) {
  const current = weeklyStartOfWeek(new Date());
  const start = weeklyAddDays(current, offset * 7);
  const end = weeklyAddDays(start, 7);
  return { start, end, key: weeklyDateKey(start), offset };
}

function weeklyDateInRange(value, range) {
  if (!value) return false;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) && timestamp >= range.start.getTime() && timestamp < range.end.getTime();
}

function weeklyCompletedSessions(range) {
  return completedExecutionSessions()
    .filter(session => weeklyDateInRange(session.endedAt || session.startedAt, range))
    .sort((a, b) => new Date(b.endedAt || b.startedAt) - new Date(a.endedAt || a.startedAt));
}

function weeklyEvidence(range, sessions) {
  const sessionIds = new Set(sessions.map(session => session.id));
  return state.data.evidence
    .filter(item => sessionIds.has(item.sessionId) || weeklyDateInRange(item.createdAt, range))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function weeklyReviewFor(range) {
  return state.data.weeklyReviews.find(review => review.weekStart === range.key) || null;
}

function weeklyItemRef(session) {
  return `${session.domain}:${session.itemId}`;
}

function weeklyItemFor(domain, itemId) {
  return state.data[domain]?.find(item => item.id === itemId) || null;
}

function weeklyFormatDuration(ms) {
  const minutes = Math.max(0, Math.round(positiveNumber(ms) / 60000));
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (!hours) return `${remaining} min`;
  return `${hours}h ${String(remaining).padStart(2, '0')}min`;
}

function weeklyRangeLabel(range) {
  const formatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });
  const endInclusive = weeklyAddDays(range.end, -1);
  return `${formatter.format(range.start)} — ${formatter.format(endInclusive)}`;
}

function weeklyLongRangeLabel(range) {
  const formatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const endInclusive = weeklyAddDays(range.end, -1);
  return `${formatter.format(range.start)} a ${formatter.format(endInclusive)}`;
}

function weeklyAggregateItems(sessions) {
  const groups = new Map();
  sessions.slice().reverse().forEach(session => {
    const key = weeklyItemRef(session);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(session);
  });

  return [...groups.entries()].map(([key, itemSessions]) => {
    const [domain, itemId] = key.split(':');
    const item = weeklyItemFor(domain, itemId);
    const first = itemSessions[0];
    const last = itemSessions[itemSessions.length - 1];
    const durationMs = itemSessions.reduce((sum, session) => sum + positiveNumber(session.durationMs), 0);
    const delta = Math.max(0, positiveNumber(last.endValue) - positiveNumber(first.startValue));
    const outcomeOnly=domain==='learningOutcome';
    const config = outcomeOnly?{unit:''}:metricConfig(domain, domain === 'study' ? item?.studyUnit || last.studyUnit : item?.readingFormat || last.readingFormat || 'physical');
    return {
      key,
      domain,
      itemId,
      item,
      title: item?.title || (outcomeOnly?(state.data.learningOutcomes||[]).find(candidate=>candidate.id===itemId)?.capability||last.learningContext?.attemptText:'Item removido'),
      sessions: itemSessions.length,
      durationMs,
      delta:outcomeOnly?null:delta,
      unit: config.unit,
      progress: item&&!outcomeOnly ? metricInfo(item, domain).progress : null,
      sessionKinds: weeklySessionKindModel.breakdown(itemSessions)
    };
  }).sort((a, b) => b.durationMs - a.durationMs);
}

function weeklyActiveOptions(selectedRefs = []) {
  const selected = new Set(selectedRefs.filter(Boolean));
  const items = ['reading', 'study', 'goal'].flatMap(domain => state.data[domain].map(item => ({ ...item, domain })));
  return items
    .filter(item => item.status !== 'done' || selected.has(`${item.domain}:${item.id}`))
    .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
}

function installWeeklyReviewStyles() {
  if (document.getElementById('compassoWeeklyReviewStyles')) return;
  const style = document.createElement('style');
  style.id = 'compassoWeeklyReviewStyles';
  style.textContent = `
    .weekly-shell{display:grid;gap:18px}.weekly-hero{background:#302f2a;color:#fff;border-radius:22px;padding:27px 29px;display:flex;align-items:flex-end;justify-content:space-between;gap:24px;box-shadow:var(--shadow);overflow:hidden;position:relative}.weekly-hero::after{content:"";position:absolute;width:230px;height:230px;border:42px solid rgba(184,176,255,.1);border-radius:50%;right:-65px;top:-105px}.weekly-hero>*{position:relative;z-index:1}.weekly-hero .eyebrow{color:#aaa79f}.weekly-hero h2{margin:8px 0 7px;font:800 clamp(24px,3vw,36px)/1.15 Manrope,sans-serif;letter-spacing:-.05em}.weekly-hero p{margin:0;color:#bbb8b0;font-size:12px;line-height:1.6}.weekly-navigation{display:flex;align-items:center;gap:7px;flex-wrap:wrap;justify-content:flex-end}.weekly-navigation button{border:1px solid #4b4a44;background:#3a3934;color:#fff;border-radius:9px;min-height:37px;padding:0 12px;font-size:11px;font-weight:700;cursor:pointer}.weekly-navigation button:disabled{opacity:.35;cursor:not-allowed}.weekly-navigation button.current{background:#f8f6f0;color:#252521;border-color:#f8f6f0}
    .weekly-status{display:inline-flex;margin-top:13px;padding:5px 9px;border-radius:999px;background:rgba(255,255,255,.1);font-size:10px;font-weight:800}.weekly-status.done{background:rgba(91,198,164,.17);color:#a6e5d0}
    .weekly-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.weekly-stat{background:var(--surface-strong);border:1px solid var(--line);border-radius:16px;padding:17px;box-shadow:var(--shadow)}.weekly-stat span{display:block;color:var(--muted);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em}.weekly-stat strong{display:block;margin-top:8px;font:800 24px/1 Manrope,sans-serif;letter-spacing:-.04em}.weekly-stat small{display:block;color:var(--muted);font-size:10px;margin-top:7px}
    .weekly-columns{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(320px,.8fr);gap:18px}.weekly-panel{background:var(--surface-strong);border:1px solid var(--line);border-radius:18px;padding:21px;box-shadow:var(--shadow)}.weekly-panel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:15px;margin-bottom:15px}.weekly-panel-head h3{margin:4px 0 0;font:800 17px/1.25 Manrope,sans-serif;letter-spacing:-.025em}.weekly-panel-head p{margin:5px 0 0;color:var(--muted);font-size:11px}.weekly-panel-badge{padding:5px 8px;border-radius:999px;background:var(--violet-soft);color:var(--violet);font-size:9px;font-weight:800}
    .weekly-evidence-list,.weekly-item-list{display:grid;gap:9px}.weekly-evidence-card{border:1px solid var(--line);border-radius:12px;padding:13px;background:#fbfaf7}.weekly-evidence-card header{display:flex;align-items:center;justify-content:space-between;gap:10px}.weekly-evidence-card b{color:var(--green);font-size:9px;text-transform:uppercase;letter-spacing:.1em}.weekly-evidence-card time{color:var(--muted);font-size:9px}.weekly-evidence-card strong{display:block;font-size:12px;line-height:1.45;margin-top:7px}.weekly-evidence-card p{margin:5px 0 0;color:var(--muted);font-size:10px;line-height:1.5}.weekly-evidence-card footer{margin-top:8px;color:var(--muted);font-size:9px}.weekly-evidence-actions{display:flex;align-items:center;gap:8px;justify-content:flex-end;margin-top:10px}.weekly-evidence-actions button{border:0;background:transparent;color:var(--blue);font-size:9px;font-weight:800;cursor:pointer;padding:3px 0}.weekly-evidence-actions button.danger{color:var(--red)}
    .weekly-item-row{display:grid;grid-template-columns:36px minmax(0,1fr) auto;gap:11px;align-items:center;border-top:1px solid var(--line);padding:12px 0}.weekly-item-row:first-child{border-top:0;padding-top:0}.weekly-item-icon{width:36px;height:36px;border-radius:10px;display:grid;place-items:center}.weekly-item-icon svg{width:17px;height:17px}.weekly-item-row strong{display:block;font-size:11px}.weekly-item-row span{display:block;color:var(--muted);font-size:9px;margin-top:4px}.weekly-item-row>em{font-style:normal;text-align:right;font-size:10px;font-weight:800}.weekly-item-row>em small{display:block;color:var(--muted);font-size:8px;font-weight:500;margin-top:3px}
    .weekly-empty{border:1px dashed var(--line);border-radius:12px;padding:25px;text-align:center;color:var(--muted);font-size:11px;line-height:1.55}
    .weekly-review-form{display:grid;gap:16px}.weekly-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:13px}.weekly-review-form .field label{display:block;font-size:10px;font-weight:800;margin-bottom:7px}.weekly-review-form textarea,.weekly-review-form select{width:100%;border:1px solid var(--line);border-radius:10px;background:#fff;color:var(--ink);padding:11px 12px}.weekly-review-form textarea{min-height:95px;resize:vertical}.weekly-priorities{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.weekly-review-actions{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:2px}.weekly-review-actions p{margin:0;color:var(--muted);font-size:10px;line-height:1.45}.weekly-review-actions button{flex:0 0 auto}.weekly-review-meta{padding:11px 12px;border-radius:11px;background:var(--green-soft);color:#2e6f5d;font-size:10px;line-height:1.5}
    @media(max-width:980px){.weekly-stats{grid-template-columns:repeat(2,1fr)}.weekly-columns{grid-template-columns:1fr}.weekly-hero{align-items:flex-start;flex-direction:column}.weekly-navigation{justify-content:flex-start}.weekly-priorities{grid-template-columns:1fr}}
    @media(max-width:620px){.weekly-stats{grid-template-columns:1fr 1fr}.weekly-form-grid{grid-template-columns:1fr}.weekly-hero{padding:22px 20px}.weekly-panel{padding:17px}.weekly-review-actions{align-items:stretch;flex-direction:column}.weekly-review-actions button{width:100%;justify-content:center}.weekly-item-row{grid-template-columns:36px minmax(0,1fr)}}
  `;
  document.head.appendChild(style);
}

function installWeeklyReviewUi() {
  if (!document.querySelector('[data-view="weekly"]')) {
    const notesNav = document.querySelector('[data-view="notes"]');
    notesNav?.insertAdjacentHTML('beforebegin', `<button class="nav-item" data-view="weekly">${icon('calendar')}<span>Revisão semanal</span><span class="nav-badge" id="weeklyBadge"></span></button>`);
  }

  if (!document.getElementById('weeklyView')) {
    document.querySelector('.content')?.insertAdjacentHTML('beforeend', `
      <section class="view" id="weeklyView">
        <div class="weekly-shell">
          <section class="weekly-hero">
            <div><div class="eyebrow">Revisão semanal</div><h2 id="weeklyRangeTitle"></h2><p id="weeklyRangeSubtitle"></p><span class="weekly-status" id="weeklyStatus"></span></div>
            <div class="weekly-navigation"><button type="button" data-week-nav="-1">← Semana anterior</button><button type="button" class="current" data-week-current>Semana atual</button><button type="button" id="weeklyNextBtn" data-week-nav="1">Próxima semana →</button></div>
          </section>
          <section class="weekly-panel capability-week-panel" id="weeklyDecisionRegion" tabindex="-1" aria-labelledby="weeklyDecisionHeading"><div class="weekly-panel-head"><div><div class="eyebrow">Decisão principal</div><h3 id="weeklyDecisionHeading">Reflita e escolha a próxima tentativa</h3><p>Evidence e sinais informam sua decisão; nada muda automaticamente.</p></div></div><p class="weekly-decision-error" id="weeklyDecisionError" role="alert" tabindex="-1" hidden></p><div id="weeklyCapabilities" class="weekly-capability-list"></div></section>
          <section class="weekly-panel weekly-closure"><div class="weekly-panel-head"><div><div class="eyebrow">Fechamento</div><h3>Interprete antes de planejar</h3><p>Transforme a decisão de aprendizagem em direção para a próxima semana.</p></div></div>
            <form class="weekly-review-form" id="weeklyReviewForm">
              <div class="weekly-form-grid">
                <div class="field"><label for="weeklyWins">Principal avanço</label><textarea id="weeklyWins" maxlength="600" placeholder="O que avançou de forma concreta?"></textarea></div>
                <div class="field"><label for="weeklyLessons">Aprendizado mais importante</label><textarea id="weeklyLessons" maxlength="600" placeholder="O que esta semana ensinou sobre o conteúdo ou sobre sua forma de executar?"></textarea></div>
                <div class="field"><label for="weeklyBlockers">Bloqueios e dispersões</label><textarea id="weeklyBlockers" maxlength="600" placeholder="O que atrapalhou, atrasou ou recebeu atenção sem merecer?"></textarea></div>
                <div class="field"><label for="weeklyDecision">Decisão para a próxima semana</label><textarea id="weeklyDecision" maxlength="600" placeholder="O que deve continuar, parar ou mudar?"></textarea></div>
              </div>
              <div><div class="eyebrow" style="margin-bottom:9px">Três prioridades da próxima semana</div><div class="weekly-priorities"><select id="weeklyPriority1" aria-label="Prioridade 1"></select><select id="weeklyPriority2" aria-label="Prioridade 2"></select><select id="weeklyPriority3" aria-label="Prioridade 3"></select></div></div>
              <div class="field"><label for="weeklyQuality">Qualidade da semana</label><select id="weeklyQuality"><option value="">Selecione</option><option value="1">1 · Semana reativa</option><option value="2">2 · Pouco avanço real</option><option value="3">3 · Avanço razoável</option><option value="4">4 · Boa execução</option><option value="5">5 · Semana excelente</option></select></div>
              <div class="weekly-review-meta" id="weeklyReviewMeta" tabindex="-1" hidden></div>
              <div class="weekly-review-actions"><p>Ao salvar, as prioridades escolhidas também atualizam o bloco <strong>Foco da semana</strong> da visão geral.</p><button class="primary-btn" type="submit">${icon('check')}<span id="weeklySaveLabel">Concluir revisão</span></button></div>
            </form>
          </section>
          <section class="weekly-secondary" aria-labelledby="weeklySecondaryHeading"><div class="weekly-panel-head"><div><div class="eyebrow">Apoio à decisão</div><h3 id="weeklySecondaryHeading">Detalhes da semana</h3><p>Expanda somente o que ajudar sua revisão.</p></div></div>
            <details class="weekly-support" id="weeklyStatsDetails"><summary>Resumo de atividade <span id="weeklyStatsSummary"></span></summary><div class="weekly-support-body"><div class="weekly-stats" id="weeklyStats"></div></div></details>
            <details class="weekly-support" id="weeklyEvidenceDetails"><summary>Evidence da semana <span id="weeklyEvidenceSummary"></span></summary><div class="weekly-support-body"><section class="weekly-panel"><div class="weekly-panel-head"><div><div class="eyebrow">Evidências</div><h3>O que a semana produziu</h3><p>Resultados verificáveis registrados ao encerrar sessões.</p></div><span class="weekly-panel-badge" id="weeklyEvidenceBadge"></span></div><div class="weekly-evidence-list" id="weeklyEvidenceList"></div></section></div></details>
            <details class="weekly-support" id="weeklyItemsDetails"><summary>Itens e atividade sem capacidade <span id="weeklyItemsSummary"></span></summary><div class="weekly-support-body"><section class="weekly-panel"><div class="weekly-panel-head"><div><div class="eyebrow">Execução</div><h3>Itens trabalhados</h3><p>Tempo, sessões e avanço por frente, incluindo atividade sem capacidade.</p></div></div><div class="weekly-item-list" id="weeklyItemList"></div></section></div></details>
            <details class="weekly-support" id="weeklyJournalDetails"><summary>Journal e atenção <span id="weeklyJournalCount">0 entradas</span></summary><div class="weekly-support-body" id="weeklyJournalSlot"></div></details>
          </section>
        </div>
      </section>
    `);
  }

  const sidebarButton = document.querySelector('[data-action="weekly"]');
  if (sidebarButton) sidebarButton.textContent = 'Abrir revisão semanal →';
}

function renderWeeklyStats(sessions, evidence, itemSummaries) {
  const durationMs = sessions.reduce((sum, session) => sum + positiveNumber(session.durationMs), 0);
  const sessionKinds = weeklySessionKindModel.breakdown(sessions);
  const stats = [
    { label: 'Sessões concluídas', value: sessions.length, note: `${sessionKinds.deep} Deep Work · ${sessionKinds.normal} Normal` },
    { label: 'Tempo focado', value: weeklyFormatDuration(durationMs), note: 'tempo efetivo, sem pausas' },
    { label: 'Evidências', value: evidence.length, note: 'resultados verificáveis' },
    { label: 'Itens trabalhados', value: itemSummaries.length, note: 'leituras e estudos tocados' }
  ];
  document.getElementById('weeklyStats').innerHTML = stats.map(stat => `<article class="weekly-stat"><span>${stat.label}</span><strong>${stat.value}</strong><small>${stat.note}</small></article>`).join('');
}

function renderWeeklyEvidence(evidence) {
  const list = document.getElementById('weeklyEvidenceList');
  document.getElementById('weeklyEvidenceBadge').textContent = `${evidence.length} ${evidence.length === 1 ? 'registro' : 'registros'}`;
  if (!evidence.length) {
    list.innerHTML = '<div class="weekly-empty">Nenhuma evidência foi registrada nesta semana. As próximas sessões concluídas aparecerão aqui.</div>';
    return;
  }
  const typeLabels = typeof evidenceTypeLabels === 'object' ? evidenceTypeLabels : {};
  list.innerHTML = evidence.map(item => {
    const linked = weeklyItemFor(item.domain, item.itemId);
    const capabilityRef=capabilityContextModel.evidenceContext(item,state.data.executionSessions||[]),resolved=capabilityContextModel.resolveCapabilityRef(capabilityRef,state.data.learningOutcomes||[]);
    const date = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).format(new Date(item.createdAt));
    const edited = item.editedAt ? '<span class="history-edited">Editado</span>' : '';
    return `<article class="weekly-evidence-card"><header><b>${escapeHtml(typeLabels[item.type] || 'Evidência')}</b><span>${edited}<time>${escapeHtml(date)}</time></span></header><strong>${escapeHtml(item.summary)}</strong>${item.details ? `<p>${escapeHtml(item.details)}</p>` : ''}<footer>${escapeHtml(linked?.title || (resolved.outcome?.capability) || 'Item removido')} · ${escapeHtml(domainLabels[item.domain] || item.domain)}</footer>${capabilityRef?`<p><b>${resolved.available?`Capacidade: ${escapeHtml(resolved.outcome.capability)}`:'Capacidade indisponível'}</b><br>Tentativa: ${escapeHtml(resolved.attemptText)}</p>`:''}<div class="weekly-evidence-actions">${resolved.available?`<button type="button" data-weekly-open-capability="${escapeHtml(capabilityRef.outcomeId)}">Abrir capacidade</button>`:''}<button type="button" data-evidence-edit="${escapeHtml(item.id)}">Editar</button><button type="button" class="danger" data-evidence-delete="${escapeHtml(item.id)}">Excluir</button></div></article>`;
  }).join('');
}

function renderWeeklyItems(itemSummaries) {
  const list = document.getElementById('weeklyItemList');
  if (!itemSummaries.length) {
    list.innerHTML = '<div class="weekly-empty">Nenhum item teve sessão concluída neste período.</div>';
    return;
  }
  list.innerHTML = itemSummaries.map(summary => {
    const color = domainColors[summary.domain] || 'violet';
    const iconName = domainIcons[summary.domain] || 'target';
    const delta = summary.delta==null ? 'Sem métrica de recurso' : summary.delta > 0 ? `+${formatNumber(summary.delta)} ${summary.unit}` : 'sem avanço informado';
    const progress = summary.progress == null ? '' : `${summary.progress}% atual`;
    return `<article class="weekly-item-row"><div class="weekly-item-icon ${color}">${icon(iconName)}</div><div><strong>${escapeHtml(summary.title)}</strong><span>${summary.sessions} ${summary.sessions === 1 ? 'sessão' : 'sessões'} · ${weeklyFormatDuration(summary.durationMs)}</span><span>${summary.sessionKinds.deep} Deep Work · ${summary.sessionKinds.normal} Normal</span></div><em>${escapeHtml(delta)}${progress ? `<small>${progress}</small>` : ''}</em></article>`;
  }).join('');
}

function weeklyCapabilityGroups(range,review){
  if(typeof executionSyncAll==='function')executionSyncAll();
  const executions=(state.data.executionSessions||[]).filter(session=>['completed','interrupted'].includes(session.status)&&weeklyDateInRange(session.endedAt||session.startedAt||session.createdAt,range)&&capabilityContextModel.executionContext(session));
  const byId=new Map();
  const ensure=ref=>{const id=ref.outcomeId;if(!byId.has(id))byId.set(id,{capabilityRef:ref,executions:[],evidence:[],signals:[]});return byId.get(id)};
  for(const execution of executions){const ref=capabilityContextModel.executionContext(execution);ensure(ref).executions.push(execution)}
  for(const group of byId.values()){const ids=new Set(group.executions.map(item=>item.id));group.evidence=(state.data.evidence||[]).filter(item=>ids.has(item.sessionId))}
  for(const signal of capabilityContextModel.normalizeSignalCollection(state.data.learningSignals)){if(weeklyDateInRange(signal.createdAt,range))ensure(signal.capabilityRef).signals.push(signal)}
  for(const reflection of capabilityContextModel.normalizeReflections(review?.capabilityReflections)){if(!byId.has(reflection.capabilityRef.outcomeId))byId.set(reflection.capabilityRef.outcomeId,{capabilityRef:reflection.capabilityRef,executions:[],evidence:[],signals:[]})}
  return[...byId.values()].sort((a,b)=>a.capabilityRef.attemptText.localeCompare(b.capabilityRef.attemptText,'pt-BR'));
}
function renderWeeklyCapabilities(range,review){
  const list=document.getElementById('weeklyCapabilities'),groups=weeklyCapabilityGroups(range,review),existing=new Map(capabilityContextModel.normalizeReflections(review?.capabilityReflections).map(item=>[item.capabilityRef.outcomeId,item]));
  if(!groups.length){list.innerHTML='<div class="weekly-empty">Nenhuma decisão de capacidade neste período. Faça o fechamento geral abaixo; a atividade sem capacidade continua nos detalhes.</div>';return}
  list.innerHTML=groups.map(group=>{
    const resolved=capabilityContextModel.resolveCapabilityRef(group.capabilityRef,state.data.learningOutcomes||[]),reflection=existing.get(group.capabilityRef.outcomeId),editable=resolved.active&&resolved.current;
    const evidence=group.evidence.map(item=>escapeHtml(item.summary)).join(' · '),signals=group.signals.map(item=>`${outcomeSignalLabel(item.kind)}: ${escapeHtml(item.text)}`).join(' · ');
    const revise=reflection?.decision==='revise';
    return `<article class="weekly-capability-card${editable?'':' unavailable'}" data-weekly-capability="${escapeHtml(group.capabilityRef.outcomeId)}" data-attempt-id="${escapeHtml(group.capabilityRef.attemptId)}" data-attempt-text="${escapeHtml(group.capabilityRef.attemptText)}"><header><div><strong>${escapeHtml(resolved.outcome?.capability||'Capacidade indisponível')}</strong><span>Tentativa atual: ${escapeHtml(resolved.attemptText)}</span></div><span>${group.executions.length} tentativas finalizadas</span></header>${evidence?`<p><b>Evidence:</b> ${evidence}</p>`:''}${signals?`<p><b>Sinais:</b> ${signals}</p>`:''}${editable?`<div class="weekly-capability-fields"><label>Reflexão<textarea data-weekly-reflection maxlength="1000">${escapeHtml(reflection?.reflection||'')}</textarea></label><label>Decisão explícita<select data-weekly-decision aria-describedby="weeklyDecisionError"><option value="">Escolha manter ou revisar</option><option value="keep" ${reflection?.decision==='keep'?'selected':''}>Manter tentativa atual</option><option value="revise" ${revise?'selected':''}>Revisar tentativa</option></select></label><label data-weekly-attempt-wrap ${revise?'':'hidden'}>Nova tentativa<input data-weekly-attempt maxlength="1000" value="${escapeHtml(revise?reflection.decidedAttemptText:resolved.attemptText)}" aria-describedby="weeklyDecisionError"></label></div>`:`<p>${reflection?`${reflection.decision==='revise'?'Tentativa revisada':'Tentativa mantida'}: ${escapeHtml(reflection.decidedAttemptText)}`:'Contexto histórico; novas decisões exigem uma capacidade ativa com a tentativa atual.'}</p>`}</article>`;
  }).join('');
}

function weeklySetDecisionError(message='',target=null){const error=document.getElementById('weeklyDecisionError');if(error){error.textContent=message;error.hidden=!message}document.querySelectorAll('#weeklyDecisionRegion [aria-invalid="true"]').forEach(field=>field.removeAttribute('aria-invalid'));if(target){target.setAttribute('aria-invalid','true');requestAnimationFrame(()=>target.focus())}}
function weeklyUpdateDecisionCard(card,{focusAttempt=false}={}){const decision=card?.querySelector('[data-weekly-decision]'),wrap=card?.querySelector('[data-weekly-attempt-wrap]'),attempt=card?.querySelector('[data-weekly-attempt]');if(!decision||!wrap)return;const revise=decision.value==='revise';wrap.hidden=!revise;if(!revise&&attempt)attempt.value=card.dataset.attemptText||attempt.value;if(revise&&focusAttempt)requestAnimationFrame(()=>attempt?.focus())}

function renderWeeklyDisclosureSummaries(range,sessions,evidence,itemSummaries){
  document.getElementById('weeklyStatsSummary').textContent=`${sessions.length} sessões`;
  document.getElementById('weeklyEvidenceSummary').textContent=`${evidence.length} ${evidence.length===1?'registro':'registros'}`;
  document.getElementById('weeklyItemsSummary').textContent=`${itemSummaries.length} ${itemSummaries.length===1?'item':'itens'}`;
  if(weeklyReviewRuntime.renderedRange!==range.key){document.querySelectorAll('#weeklyView .weekly-support').forEach(detail=>detail.open=false);weeklyReviewRuntime.renderedRange=range.key}
}

function renderWeeklyPriorityOptions(review) {
  const selected = Array.isArray(review?.priorities) ? review.priorities : [];
  const selectedRefs = selected.map(priority => `${priority.domain}:${priority.itemId}`);
  const items = weeklyActiveOptions(selectedRefs);
  const options = `<option value="">Sem prioridade</option>` + items.map(item => `<option value="${item.domain}:${item.id}">${escapeHtml(domainLabels[item.domain])} · ${escapeHtml(item.title)}</option>`).join('');
  ['weeklyPriority1', 'weeklyPriority2', 'weeklyPriority3'].forEach((id, index) => {
    const select = document.getElementById(id);
    select.innerHTML = options;
    select.value = selectedRefs[index] || '';
  });
}

function renderWeeklyForm(review) {
  document.getElementById('weeklyWins').value = review?.wins || '';
  document.getElementById('weeklyLessons').value = review?.lessons || '';
  document.getElementById('weeklyBlockers').value = review?.blockers || '';
  document.getElementById('weeklyDecision').value = review?.decision || '';
  document.getElementById('weeklyQuality').value = review?.quality ? String(review.quality) : '';
  document.getElementById('weeklySaveLabel').textContent = review ? 'Atualizar revisão' : 'Concluir revisão';
  renderWeeklyPriorityOptions(review);
  const meta = document.getElementById('weeklyReviewMeta');
  meta.hidden = !review;
  if (review) {
    const date = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(review.reviewedAt));
    meta.textContent = `Revisão registrada em ${date}. Você pode atualizá-la enquanto precisar.`;
  }
}

function renderWeeklyReview() {
  const view = document.getElementById('weeklyView');
  if (!view) return;
  const range = weeklyRange();
  const sessions = weeklyCompletedSessions(range);
  const evidence = weeklyEvidence(range, sessions);
  const itemSummaries = weeklyAggregateItems(sessions);
  const review = weeklyReviewFor(range);

  document.getElementById('weeklyRangeTitle').textContent = weeklyRangeLabel(range);
  document.getElementById('weeklyRangeSubtitle').textContent = weeklyLongRangeLabel(range);
  const status = document.getElementById('weeklyStatus');
  status.textContent = review ? 'Revisão concluída' : (range.offset === 0 ? 'Revisão pendente' : 'Sem revisão registrada');
  status.classList.toggle('done', Boolean(review));
  document.getElementById('weeklyNextBtn').disabled = range.offset >= 0;

  renderWeeklyStats(sessions, evidence, itemSummaries);
  renderWeeklyEvidence(evidence);
  renderWeeklyItems(itemSummaries);
  renderWeeklyCapabilities(range,review);
  renderWeeklyForm(review);
  renderWeeklyDisclosureSummaries(range,sessions,evidence,itemSummaries);
  weeklySetDecisionError('');

  const currentReview = weeklyReviewFor(weeklyRange(0));
  const badge = document.getElementById('weeklyBadge');
  if (badge) badge.textContent = currentReview ? '✓' : '•';
}

async function saveWeeklyReview() {
  const range = weeklyRange();
  const draft={fields:Object.fromEntries(['weeklyWins','weeklyLessons','weeklyBlockers','weeklyDecision','weeklyQuality','weeklyPriority1','weeklyPriority2','weeklyPriority3'].map(id=>[id,document.getElementById(id).value])),capabilities:[...document.querySelectorAll('[data-weekly-capability]')].map(card=>({id:card.dataset.weeklyCapability,reflection:card.querySelector('[data-weekly-reflection]')?.value||'',decision:card.querySelector('[data-weekly-decision]')?.value||'',attempt:card.querySelector('[data-weekly-attempt]')?.value||''}))};
  weeklySetDecisionError('');
  for(const card of document.querySelectorAll('[data-weekly-capability]')){
    const decision=card.querySelector('[data-weekly-decision]');if(!decision)continue;
    if(!decision.value){weeklySetDecisionError('Escolha manter ou revisar para cada capacidade antes de salvar.',decision);return false}
    const attempt=card.querySelector('[data-weekly-attempt]');if(decision.value==='revise'&&!attempt?.value.trim()){weeklySetDecisionError('Descreva a nova tentativa antes de salvar a revisão.',attempt);return false}
  }
  const values = ['weeklyPriority1', 'weeklyPriority2', 'weeklyPriority3'].map(id => document.getElementById(id).value).filter(Boolean);
  const uniqueValues = [...new Set(values)];
  const priorities = uniqueValues.map(value => {
    const [domain, itemId] = value.split(':');
    return { domain, itemId };
  });

  const existing=weeklyReviewFor(range),now=new Date().toISOString();
  let outcomes=(state.data.learningOutcomes||[]).map(item=>({...item}));
  const reflections=capabilityContextModel.normalizeReflections(existing?.capabilityReflections);
  const reflectionById=new Map(reflections.map(item=>[item.capabilityRef.outcomeId,item]));
  for(const card of document.querySelectorAll('[data-weekly-capability]')){
    const decision=card.querySelector('[data-weekly-decision]')?.value;if(!decision)continue;
    const outcomeId=card.dataset.weeklyCapability,outcome=outcomes.find(item=>item.id===outcomeId),capabilityRef=capabilityContextModel.createCapabilityRef(outcome);
    if(!capabilityRef)continue;
    const reflection=card.querySelector('[data-weekly-reflection]').value.trim(),decidedAttemptText=card.querySelector('[data-weekly-attempt]').value.trim();
    if(decision==='revise'&&!decidedAttemptText){weeklySetDecisionError('Descreva a nova tentativa antes de salvar a revisão.',card.querySelector('[data-weekly-attempt]'));return false}
    const current=reflectionById.get(outcomeId);
    if(current&&current.decision===decision&&current.reflection===reflection&&current.decidedAttemptText===(decision==='keep'?capabilityRef.attemptText:decidedAttemptText))continue;
    if(decision==='revise')outcomes=outcomes.map(item=>item.id===outcomeId?learningOutcomeModel.updateOutcome(item,{nextAttempt:decidedAttemptText},{now}):item);
    const post=outcomes.find(item=>item.id===outcomeId),entry=capabilityContextModel.createReflection({capabilityRef,reflection,decision,decidedAttemptText:decision==='revise'?post.nextAttempt.text:capabilityRef.attemptText},{now});reflectionById.set(outcomeId,entry);
  }
  const payload = {
    ...(existing||{}),
    id: existing?.id || `wr${Date.now()}`,
    schemaVersion: WEEKLY_REVIEW_VERSION,
    weekStart: range.key,
    weekEnd: weeklyDateKey(weeklyAddDays(range.end, -1)),
    wins: document.getElementById('weeklyWins').value.trim(),
    lessons: document.getElementById('weeklyLessons').value.trim(),
    blockers: document.getElementById('weeklyBlockers').value.trim(),
    decision: document.getElementById('weeklyDecision').value.trim(),
    quality: positiveNumber(document.getElementById('weeklyQuality').value) || null,
    priorities,
    capabilityReflections:capabilityContextModel.normalizeReflections([...reflectionById.values()]),
    reviewedAt: now,
    updatedAt:now
  };
  const previous=state.data,candidate=typeof structuredClone==='function'?structuredClone(state.data):JSON.parse(JSON.stringify(state.data));candidate.learningOutcomes=outcomes;
  const existingIndex=candidate.weeklyReviews.findIndex(review=>review.weekStart===range.key);if(existingIndex>=0)candidate.weeklyReviews[existingIndex]=payload;else candidate.weeklyReviews.unshift(payload);
  const focusTitles=priorities.map(priority=>candidate[priority.domain]?.find(item=>item.id===priority.itemId)?.title).filter(Boolean);if(focusTitles.length)candidate.focus=focusTitles;
  state.data=candidate;if(await saveData(existingIndex>=0?'Revisão semanal atualizada':'Revisão semanal concluída')){requestAnimationFrame(()=>{const target=document.getElementById('weeklyReviewMeta')||document.getElementById('weeklyDecisionRegion');target?.focus?.()});return true}
  state.data=previous;try{await window.CompassoStorage.save(STORAGE_KEY,previous)}catch{}renderAll();showToast('Não foi possível salvar a revisão. Suas capacidades não foram alteradas.');
  Object.entries(draft.fields).forEach(([id,value])=>{const field=document.getElementById(id);if(field)field.value=value});draft.capabilities.forEach(item=>{const card=document.querySelector(`[data-weekly-capability="${CSS.escape(item.id)}"]`);if(!card)return;const reflection=card.querySelector('[data-weekly-reflection]'),decision=card.querySelector('[data-weekly-decision]'),attempt=card.querySelector('[data-weekly-attempt]');if(reflection)reflection.value=item.reflection;if(decision)decision.value=item.decision;if(attempt)attempt.value=item.attempt;weeklyUpdateDecisionCard(card)});const meta=document.getElementById('weeklyReviewMeta');meta.hidden=false;meta.textContent='Não foi possível salvar. Revise e tente novamente.';requestAnimationFrame(()=>meta.focus());return false;
}

function weeklyOpenDecision(){weeklyReviewRuntime.offset=0;switchView('weekly');renderWeeklyReview();requestAnimationFrame(()=>{const unresolved=[...document.querySelectorAll('#weeklyDecisionRegion [data-weekly-decision]')].find(select=>!select.value);const target=unresolved||document.getElementById('weeklyWins')||document.getElementById('weeklyDecisionRegion')||document.getElementById('weeklyRangeTitle');target?.scrollIntoView?.({block:'nearest'});target?.focus?.()});return true}

installWeeklyReviewStyles();
installWeeklyReviewUi();

CompassoFeatures.command('weekly.openDecision',weeklyOpenDecision);
CompassoFeatures.register('weekly-review',{order:60,afterRender:renderWeeklyReview});

document.getElementById('weeklyReviewForm').addEventListener('submit', event => {
  event.preventDefault();
  saveWeeklyReview();
});

document.addEventListener('click', event => {
  const capability=event.target.closest('[data-weekly-open-capability]');if(capability){const outcome=(state.data.learningOutcomes||[]).find(item=>item.id===capability.dataset.weeklyOpenCapability);if(outcome){learningOutcomeRuntime.mode=outcome.status==='archived'?'archived':'active';switchView('capabilities');outcomeRender();requestAnimationFrame(()=>document.querySelector(`[data-outcome-card="${CSS.escape(outcome.id)}"]`)?.focus?.())}}
  const weeklyAction = event.target.closest('[data-action="weekly"]');
  if (weeklyAction) switchView('weekly');
  const navigation = event.target.closest('[data-week-nav]');
  if (navigation) {
    weeklyReviewRuntime.offset = Math.min(0, weeklyReviewRuntime.offset + Number(navigation.dataset.weekNav));
    renderWeeklyReview();
  }
  if (event.target.closest('[data-week-current]')) {
    weeklyReviewRuntime.offset = 0;
    renderWeeklyReview();
  }
});
document.addEventListener('change',event=>{const decision=event.target.closest?.('[data-weekly-decision]');if(!decision)return;weeklySetDecisionError('');weeklyUpdateDecisionCard(decision.closest('[data-weekly-capability]'),{focusAttempt:decision.value==='revise'})});
