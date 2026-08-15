/* Compasso · Sessões de leitura e estudo
 * Este arquivo é injetado pelo service worker dentro do módulo principal,
 * portanto usa diretamente state, saveData, metricConfig e renderGrid.
 */

const SESSIONS_FEATURE_VERSION = 1;
const sessionTimerModel = globalThis.CompassoSessionTimerModel;
state.data.sessions = Array.isArray(state.data.sessions) ? state.data.sessions : [];

const sessionRuntime = {
  tick: null,
  selectedItem: null,
  historyItem: null,
  returnFocus: null,
  creating: false,
  finishing: false,
  finish: null
};

function sessionNow() { return Date.now(); }
function sessionId() { return `s${Date.now()}${Math.random().toString(36).slice(2,7)}`; }
function sessionClone(value) { return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value)); }
function sessionSetError(id,message='') { const target=document.getElementById(id);if(!target)return;target.textContent=message;target.hidden=!message; }
function sessionActive() { return state.data.sessions.find(session => sessionTimerModel.isCurrent(session)) || null; }
function sessionSourceItem(session,data=state.data) {
  if (!session) return null;
  if (session.domain === 'learningOutcome') return data.learningOutcomes?.find(item => item.id === session.learningContext?.outcomeId || item.id === session.itemId) || null;
  return data[session.domain]?.find(item => item.id === session.itemId) || null;
}
function sessionItem(session) {
  if (!session) return null;
  if (session.domain === 'learningOutcome') {
    const outcome = sessionSourceItem(session);
    return outcome ? {...outcome,title:outcome.capability} : session.learningContext ? {id:session.itemId,title:session.learningContext.attemptText} : null;
  }
  return sessionSourceItem(session);
}
function sessionUsesResourceMetric(session) { return ['study','reading'].includes(session?.domain); }
function sessionElapsedMs(session, at = sessionNow()) {
  return sessionTimerModel.elapsed(session, at);
}
function formatDuration(ms) {
  const totalMinutes = Math.max(0, Math.round(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours ? `${hours}h ${String(minutes).padStart(2,'0')}min` : `${minutes} min`;
}
function formatClock(ms) {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
function sessionMetric(item, domain) {
  const config = metricConfig(domain, domain === 'study' ? item?.studyUnit : item?.readingFormat || 'physical');
  return { config, value: positiveNumber(item?.[config.currentKey]) };
}
function sessionMetricLabel(session) {
  if (!sessionUsesResourceMetric(session)) return 'Sem métrica de recurso';
  const item = sessionItem(session);
  const config = metricConfig(session.domain, session.domain === 'study' ? item?.studyUnit || session.studyUnit : item?.readingFormat || session.readingFormat || 'physical');
  const start = positiveNumber(session.startValue);
  const end = session.endValue == null ? null : positiveNumber(session.endValue);
  if (end == null) return `${formatNumber(start)} ${config.unit}`;
  const delta = Math.max(0, end - start);
  return `${formatNumber(start)} → ${formatNumber(end)} ${config.unit} · +${formatNumber(delta)}`;
}

function installSessionStyles() {
  if (document.getElementById('compassoSessionStyles')) return;
  const style = document.createElement('style');
  style.id = 'compassoSessionStyles';
  style.textContent = `
    .session-banner{position:fixed;right:22px;bottom:22px;z-index:45;width:min(420px,calc(100vw - 32px));background:#252521;color:#fff;border:1px solid #45443e;border-radius:17px;padding:16px;box-shadow:0 18px 50px rgba(20,20,17,.25)}
    .session-banner[hidden]{display:none}.session-banner-top{display:flex;gap:12px;align-items:flex-start}.session-pulse{width:10px;height:10px;border-radius:50%;margin-top:6px;background:#8e82ff;box-shadow:0 0 0 5px rgba(142,130,255,.15)}.session-banner.paused .session-pulse{background:#dc7e3f;box-shadow:0 0 0 5px rgba(220,126,63,.16)}
    .session-banner-main{min-width:0;flex:1}.session-banner-label{font-size:9px;text-transform:uppercase;letter-spacing:.15em;color:#aaa79f;font-weight:800}.session-banner-title{display:block;font:700 14px/1.35 Manrope,sans-serif;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.session-timer{font:800 25px/1 Manrope,sans-serif;letter-spacing:-.04em;margin:14px 0 12px}.session-banner-actions{display:flex;gap:8px;flex-wrap:wrap}.session-banner-actions button{min-height:36px;border-radius:9px;padding:0 12px;border:1px solid #4c4b45;background:#34342f;color:#fff;font-size:11px;font-weight:700;cursor:pointer}.session-banner-actions button.primary{background:#f8f6f0;color:#252521;border-color:#f8f6f0}
    .session-card-button{font-weight:800!important;color:var(--violet)!important}.session-card-button[disabled]{opacity:.45;cursor:not-allowed}.session-history-button{color:var(--muted)!important}
    .session-dialog{width:min(620px,calc(100vw - 28px));border:0;border-radius:20px;padding:0;background:var(--surface-strong);color:var(--ink);box-shadow:0 24px 80px rgba(25,23,18,.25)}.session-dialog::backdrop{background:rgba(31,30,27,.55);backdrop-filter:blur(4px)}.session-dialog-head{padding:21px 23px 16px;border-bottom:1px solid var(--line);display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.session-dialog-head h2{margin:3px 0 0;font:800 20px/1.2 Manrope,sans-serif;letter-spacing:-.035em}.session-dialog-body{padding:22px 23px;display:grid;gap:16px}.session-dialog-foot{padding:15px 23px;border-top:1px solid var(--line);display:flex;justify-content:flex-end;gap:9px}.session-dialog .field label{display:block;font-size:11px;font-weight:700;margin-bottom:7px}.session-dialog input,.session-dialog textarea{width:100%;border:1px solid var(--line);border-radius:10px;padding:11px 12px;background:#fff;color:var(--ink)}.session-dialog textarea{min-height:88px;resize:vertical}.session-summary{padding:13px 14px;border-radius:12px;background:var(--violet-soft);color:var(--violet);font-size:12px;line-height:1.55}.session-history-list{display:grid;gap:10px;max-height:55vh;overflow:auto}.session-history-row{border:1px solid var(--line);border-radius:13px;padding:13px;display:grid;grid-template-columns:1fr auto;gap:10px}.session-history-row strong{font-size:12px}.session-history-row span{display:block;color:var(--muted);font-size:10px;margin-top:4px}.session-history-row button{border:0;background:transparent;color:var(--red);font-size:10px;font-weight:700;cursor:pointer}.session-empty{padding:28px;text-align:center;color:var(--muted);font-size:12px;border:1px dashed var(--line);border-radius:13px}
    @media(max-width:720px){.session-banner{right:16px;bottom:16px}.session-dialog-head,.session-dialog-body,.session-dialog-foot{padding-left:17px;padding-right:17px}.session-dialog-foot{flex-wrap:wrap}.session-dialog-foot button{flex:1}.session-history-row{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);
}

function installSessionUi() {
  if (document.getElementById('sessionBanner')) return;
  document.body.insertAdjacentHTML('beforeend', `
    <section class="session-banner" id="sessionBanner" hidden aria-live="polite" tabindex="-1">
      <div class="session-banner-top"><span class="session-pulse"></span><div class="session-banner-main"><div class="session-banner-label" id="sessionBannerLabel">Sessão em andamento</div><strong class="session-banner-title" id="sessionBannerTitle"></strong></div></div>
      <div class="session-timer" id="sessionTimer">00:00:00</div>
      <div class="session-banner-actions"><button type="button" id="sessionPauseBtn">Pausar</button><button type="button" class="primary" id="sessionFinishBtn">Encerrar sessão</button></div>
    </section>
    <dialog class="session-dialog" id="sessionStartDialog">
      <form method="dialog" id="sessionStartForm">
        <div class="session-dialog-head"><div><div class="eyebrow">Nova sessão</div><h2 id="sessionStartTitle">Iniciar sessão</h2></div><button class="close-btn" type="button" data-session-close="sessionStartDialog">${icon('x')}</button></div>
        <div class="session-dialog-body"><div class="session-summary" id="sessionStartSummary"></div><details class="session-options" id="sessionOptionalConfig"><summary>Ajustar sessão (opcional)</summary><div class="session-options-body" id="sessionOptionalConfigBody"><div class="field" id="sessionOutcomeResourceField" hidden><label for="sessionOutcomeResource">Apoio nesta sessão</label><select id="sessionOutcomeResource"></select><small>Opcional. A capacidade continua sendo o objetivo.</small></div><div class="field" id="sessionCapabilityField" hidden><label for="sessionCapability">Capacidade e tentativa (opcional)</label><select id="sessionCapability"><option value="">Sem capacidade</option></select><small id="sessionCapabilityStatus">A escolha registra contexto na sessão; não altera vínculos nem progresso.</small></div><div class="field"><label for="sessionMode">Modo de execução</label><select id="sessionMode"><option value="quick">Sessão rápida</option><option value="deep">Deep Work</option></select><small id="sessionModeHelp">Cronômetro simples com registro de progresso.</small></div><div class="field"><label for="sessionIntent">Objetivo desta sessão</label><textarea id="sessionIntent" maxlength="220" placeholder="Ex.: ler o capítulo 4 e identificar o argumento central."></textarea></div></div></details><p class="session-error" id="sessionStartError" role="alert" tabindex="-1" hidden></p></div>
        <div class="session-dialog-foot"><button type="button" class="quiet-btn" data-session-close="sessionStartDialog">Cancelar</button><button type="submit" class="primary-btn" id="sessionStartSubmit">Iniciar sessão</button></div>
      </form>
    </dialog>
    <dialog class="session-dialog" id="sessionFinishDialog">
      <form method="dialog" id="sessionFinishForm">
        <div class="session-dialog-head"><div><div class="eyebrow">Encerrar sessão</div><h2 id="sessionFinishTitle">Registrar progresso</h2></div><button class="close-btn" type="button" data-session-close="sessionFinishDialog">${icon('x')}</button></div>
        <div class="session-dialog-body"><div class="session-summary" id="sessionFinishSummary"></div><div class="field" id="sessionEndValueField"><label id="sessionEndValueLabel" for="sessionEndValue">Valor final</label><input id="sessionEndValue" type="number" min="0" inputmode="decimal" required></div><div class="field"><label for="sessionReflection">Observação da sessão</label><textarea id="sessionReflection" maxlength="300" placeholder="O que avançou, onde parou ou o que precisa retomar?"></textarea></div><p class="session-error" id="sessionFinishError" role="alert" tabindex="-1" hidden></p></div>
        <div class="session-dialog-foot"><button type="button" class="quiet-btn" data-session-close="sessionFinishDialog">Cancelar</button><button type="submit" class="primary-btn">${icon('check')}Salvar sessão</button></div>
      </form>
    </dialog>
    <dialog class="session-dialog" id="sessionHistoryDialog">
      <div class="session-dialog-head"><div><div class="eyebrow">Histórico</div><h2 id="sessionHistoryTitle">Sessões</h2></div><button class="close-btn" type="button" data-session-close="sessionHistoryDialog">${icon('x')}</button></div>
      <div class="session-dialog-body"><div class="session-history-list" id="sessionHistoryList"></div></div>
      <div class="session-dialog-foot"><button type="button" class="secondary-btn" data-session-close="sessionHistoryDialog">Fechar</button></div>
    </dialog>
  `);
}

function renderSessionBanner() {
  const session = sessionActive();
  const banner = document.getElementById('sessionBanner');
  if (!banner) return;
  banner.hidden = !session;
  if (!session) { clearInterval(sessionRuntime.tick); sessionRuntime.tick = null; return; }
  const item = sessionItem(session);
  banner.classList.toggle('paused', session.status === 'paused' || session.status === 'finishing');
  document.getElementById('sessionBannerLabel').textContent = session.status === 'finishing' ? 'Concluindo sessão' : session.status === 'paused' ? 'Sessão pausada' : 'Sessão em andamento';
  document.getElementById('sessionBannerTitle').textContent = item?.title || 'Item removido';
  document.getElementById('sessionPauseBtn').textContent = session.status === 'finishing' ? 'Tempo congelado' : session.status === 'paused' ? 'Retomar' : 'Pausar';
  document.getElementById('sessionPauseBtn').disabled = session.status === 'finishing';
  document.getElementById('sessionFinishBtn').disabled = session.status === 'finishing';
  const tick = () => { document.getElementById('sessionTimer').textContent = formatClock(sessionElapsedMs(session)); };
  tick(); clearInterval(sessionRuntime.tick); sessionRuntime.tick = session.status === 'finishing' ? null : setInterval(tick, 1000);
}

function enhanceSessionCards(domain) {
  if (!['reading','study','goal'].includes(domain)) return;
  const active = sessionActive();
  const anyActive = executionActive();
  document.querySelectorAll(`#${domain}Grid .item-card`).forEach(card => {
    const edit = card.querySelector('[data-edit]');
    if (!edit) return;
    const [itemDomain,itemId] = edit.dataset.edit.split(':');
    const actions = card.querySelector('.card-actions');
    if (!actions || actions.querySelector('[data-start-session]')) return;
    const blocked = anyActive && !(active?.domain === itemDomain && active?.itemId === itemId);
    const ownActive = active && active.domain === itemDomain && active.itemId === itemId;
    actions.insertAdjacentHTML('afterbegin', `<button class="session-card-button" data-start-session="${itemDomain}:${itemId}" ${blocked || ownActive ? 'disabled' : ''}>${ownActive ? 'Sessão ativa' : 'Executar'}</button><button class="session-history-button" data-session-history="${itemDomain}:${itemId}">Histórico</button>`);
  });
}

CompassoFeatures.register('sessions',{order:20,afterGrid:enhanceSessionCards,afterRender:renderSessionBanner});

function sessionStartDraft() {
  const form=document.getElementById('sessionStartForm');if(!form)return{};
  return Object.fromEntries([...form.querySelectorAll('input,textarea,select')].filter(control=>control.id).map(control=>[control.id,control.type==='checkbox'?control.checked:control.value]));
}
function sessionRestoreStartDraft(draft={}) {
  for(const [id,value] of Object.entries(draft)){const control=document.getElementById(id);if(!control)continue;if(control.type==='checkbox')control.checked=Boolean(value);else control.value=value;}
  document.getElementById('sessionMode')?.dispatchEvent(new Event('change'));
}
function sessionPrepareRitual(item,domain) {
  const select=document.getElementById('ritualQuickSelect');if(!select)return;
  const templates=(state.data.ritualTemplates||[]).filter(candidate=>!candidate.archived);
  const suggestion=globalThis.CompassoRitualModel?.suggest?.(templates,{...item,domain});
  const selected=item?.ritualId||suggestion?.ritual?.id||'';
  select.innerHTML=`<option value="">Sem ritual</option>${templates.map(candidate=>`<option value="${escapeHtml(candidate.id)}">${escapeHtml(candidate.name)}</option>`).join('')}`;
  select.value=templates.some(candidate=>candidate.id===selected)?selected:'';
}

function openSessionStartCore(domain, itemId, options = {}, presentation = {}) {
  const active = executionActive();
  if(typeof energyResetChoices==='function')energyResetChoices('before');
  if (active) { showToast('Encerre a sessão atual antes de iniciar outra'); return false; }
  const context = learningOutcomeModel.normalizeExecutionContext(options.learningContext);
  const item = domain === 'learningOutcome'
    ? state.data.learningOutcomes?.find(candidate => candidate.id === itemId)
    : state.data[domain]?.find(candidate => candidate.id === itemId);
  if (!item) return false;
  sessionRuntime.selectedItem = { domain, itemId, learningContext:context };
  sessionRuntime.returnFocus = presentation.trigger || document.activeElement;
  sessionSetError('sessionStartError','');
  const neutral = domain === 'learningOutcome';
  const metric = neutral ? null : sessionMetric(item, domain);
  const futureUse=learningOutcomeModel.futureUsePresentation(context?.futureUse);
  document.getElementById('sessionStartTitle').textContent = item.title || item.capability;
  document.getElementById('sessionStartSummary').textContent = neutral
    ? `Tentativa: ${context?.attemptText || item.nextAttempt?.text}.${futureUse?` Uso pretendido: ${futureUse.label}.`:''} O cronômetro continuará mesmo se o aplicativo for fechado.`
    : `Início registrado em ${formatNumber(metric.value)} ${metric.config.unit}. O cronômetro continuará mesmo se o aplicativo for fechado.`;
  document.getElementById('sessionIntent').value = context?.attemptText || item.note || '';
  const resourceField = document.getElementById('sessionOutcomeResourceField');
  const resourceSelect = document.getElementById('sessionOutcomeResource');
  resourceField.hidden = !neutral;
  resourceSelect.innerHTML = '<option value="">Sem recurso</option>' + (options.resources || []).map(ref => `<option value="${escapeHtml(ref.type)}:${escapeHtml(ref.id)}"${ref.available ? '' : ' disabled'}>${escapeHtml(ref.available ? `${ref.type === 'study' ? 'Estudo' : 'Leitura'}: ${ref.title}` : `${ref.type === 'study' ? 'Estudo' : 'Leitura'} indisponível`)}</option>`).join('');
  const capabilityField=document.getElementById('sessionCapabilityField'),capabilitySelect=document.getElementById('sessionCapability'),capabilityStatus=document.getElementById('sessionCapabilityStatus');
  capabilityField.hidden=neutral||!['study','reading'].includes(domain);capabilityStatus.textContent='A escolha registra contexto na sessão; não altera vínculos nem progresso.';
  if(!capabilityField.hidden){
    const active=(state.data.learningOutcomes||[]).filter(candidate=>candidate.status==='active');
    const linked=active.filter(candidate=>candidate.resourceRefs?.some(ref=>ref.type===domain&&ref.id===itemId));
    const linkedIds=new Set(linked.map(candidate=>candidate.id)),other=active.filter(candidate=>!linkedIds.has(candidate.id));
    const optionsFor=list=>list.map(candidate=>`<option value="${escapeHtml(candidate.id)}">${escapeHtml(candidate.capability)} · ${escapeHtml(candidate.nextAttempt.text)}</option>`).join('');
    capabilitySelect.innerHTML='<option value="">Sem capacidade</option>'+(linked.length?`<optgroup label="Vinculadas a este recurso">${optionsFor(linked)}</optgroup>`:'')+(other.length?`<optgroup label="Outras capacidades ativas">${optionsFor(other)}</optgroup>`:'');capabilitySelect.value='';
  }
  const mode = document.getElementById('sessionMode');
  const contingencies = Array.isArray(item.contingencies) ? item.contingencies.filter(option => option?.enabled !== false) : [];
  mode.innerHTML = `<option value="quick">Sessão rápida</option><option value="deep">Deep Work</option>${item.minimumVersion ? '<option value="minimum">Versão mínima</option>' : ''}${contingencies.length ? '<option value="contingency">Plano B</option>' : ''}`;
  mode.value = 'quick';
  const explain = () => { document.getElementById('sessionModeHelp').textContent = mode.value === 'deep' ? 'Tela focada, preparação, distrações e resultado.' : mode.value === 'minimum' ? 'Executa o menor passo útil sem concluir toda a ação por padrão.' : mode.value === 'contingency' ? 'Aplica uma contingência preservando o plano original.' : 'Cronômetro simples com registro de progresso.'; };
  mode.onchange = explain; explain();
  const journalIntent=document.getElementById('journalSessionIntent');if(journalIntent)journalIntent.value='';
  const variantSelect=document.getElementById('sessionVariant');if(variantSelect&&neutral){variantSelect.innerHTML='<option value="ideal">Versão ideal</option>';variantSelect.value='ideal';document.getElementById('sessionVariantHelp').textContent='Execução da tentativa atual.'}
  sessionPrepareRitual(item,domain);
  const disclosure=document.getElementById('sessionOptionalConfig');if(disclosure)disclosure.open=Boolean(presentation.expanded);
  const dialog=document.getElementById('sessionStartDialog');
  if(presentation.show!==false&&!dialog.open){dialog.showModal();requestAnimationFrame(()=>presentation.expanded?disclosure?.querySelector('select,textarea,input,button')?.focus?.():document.getElementById('sessionStartSubmit')?.focus?.())}
  return true;
}
function openSessionStart(domain,itemId) { return openSessionStartCore(domain,itemId); }
function openOutcomeSessionStart(itemId,options) { return openSessionStartCore('learningOutcome',itemId,options); }

function sessionStartDefault(payload={}) {
  if(!openSessionStartCore(payload.domain,payload.itemId,payload.options||{},{show:false,trigger:payload.trigger}))return false;
  document.getElementById('sessionMode').value='quick';
  document.getElementById('sessionStartForm').requestSubmit();
  return true;
}
function sessionOpenConfiguration(payload={}) {
  return openSessionStartCore(payload.domain,payload.itemId,payload.options||{},{show:true,expanded:Boolean(payload.expanded),trigger:payload.trigger});
}

async function createSession() {
  if(sessionRuntime.creating)return false;
  const selected = sessionRuntime.selectedItem;
  if (!selected || !executionCanStart()) return false;
  const draft=sessionStartDraft();
  sessionSetError('sessionStartError','');
  let target = {...selected};
  const selectedResource = selected.domain === 'learningOutcome' ? document.getElementById('sessionOutcomeResource')?.value : '';
  if (selectedResource) {
    const [domain,itemId] = selectedResource.split(':');
    target = {...selected,domain,itemId};
  }
  if(['study','reading'].includes(selected.domain)){
    const outcomeId=document.getElementById('sessionCapability')?.value;
    if(outcomeId){
      const outcome=(state.data.learningOutcomes||[]).find(candidate=>candidate.id===outcomeId),context=learningOutcomeModel.createExecutionContext(outcome);
      if(!context){const status=document.getElementById('sessionCapabilityStatus');status.textContent='A capacidade mudou ou não está mais ativa. Escolha Sem capacidade para continuar.';document.getElementById('sessionCapability').focus();return false}
      target.learningContext=context;
    }else target.learningContext=null;
  }
  const item = target.domain === 'learningOutcome'
    ? state.data.learningOutcomes?.find(candidate => candidate.id === target.itemId)
    : state.data[target.domain]?.find(candidate => candidate.id === target.itemId);
  if (!item) return false;
  const mode = document.getElementById('sessionMode')?.value || 'quick';
  if (mode === 'deep') {
    document.getElementById('sessionStartDialog').close();
    if (target.learningContext && typeof deepOpenOutcome === 'function') deepOpenOutcome(target.domain,target.itemId,{learningContext:target.learningContext});
    else if (typeof deepOpen === 'function') deepOpen(target.domain,target.itemId);
    return true;
  }
  const metric = sessionUsesResourceMetric(target) ? sessionMetric(item, target.domain) : null;
  const selectedVariant=document.getElementById('sessionVariant')?.value||'ideal';
  const effectiveMode=mode==='quick'&&selectedVariant==='minimum'?'minimum':mode==='quick'&&selectedVariant.startsWith('contingency:')?'contingency':mode;
  const selectedContingencyId=selectedVariant.startsWith('contingency:')?selectedVariant.split(':')[1]:null;
  const contingency = effectiveMode === 'contingency' ? (item.contingencies || []).find(option => option?.enabled !== false&&(!selectedContingencyId||option.id===selectedContingencyId)) : null;
  const uxRitualId=typeof uxRuntime==='object'&&uxRuntime?.selected?.domain===target.domain&&uxRuntime?.selected?.itemId===target.itemId&&uxRuntime?.ritualId?uxRuntime.ritualId:'';
  const ritual = state.data.ritualTemplates?.find(candidate => candidate.id === (uxRitualId||document.getElementById('ritualQuickSelect')?.value));
  const journalEntryId=document.getElementById('journalSessionIntent')?.value||null;
  const journalEntry=(state.data.journalEntries||[]).find(candidate=>candidate.id===journalEntryId);
  const session = {
    id: sessionId(),
    schemaVersion: SESSIONS_FEATURE_VERSION,
    domain: target.domain,
    itemId: target.itemId,
    learningContext: target.learningContext,
    readingFormat: item.readingFormat || null,
    studyUnit: item.studyUnit || null,
    intent: document.getElementById('sessionIntent').value.trim() || journalEntry?.content || '',
    ...(journalEntry?{journalEntryId:journalEntry.id}:{}),
    executionVariant: { kind: effectiveMode === 'minimum' ? 'minimum' : effectiveMode === 'contingency' ? 'contingency' : 'ideal', contingencyId: contingency?.id || null },
    contingencySnapshot: contingency ? JSON.parse(JSON.stringify(contingency)) : null,
    ritualSnapshot: ritual && globalThis.CompassoRitualModel ? globalThis.CompassoRitualModel.snapshot(ritual) : null,
    reflection: '',
    startValue: metric?.value ?? null,
    endValue: null,
    startedAt: new Date().toISOString(),
    endedAt: null,
    pausedMs: 0,
    pauseStartedAt: null,
    durationMs: null,
    status: 'active'
  };
  const previous=state.data,candidate=sessionClone(state.data);
  candidate.sessions=Array.isArray(candidate.sessions)?candidate.sessions:[];
  candidate.sessions.unshift(session);
  state.data=candidate;
  executionSyncRegular(session);
  if(typeof energyCreateForSession==='function')energyCreateForSession(session);
  sessionRuntime.creating=true;
  const submit=document.getElementById('sessionStartSubmit');if(submit)submit.disabled=true;
  const persisted=await saveData('Sessão iniciada');
  sessionRuntime.creating=false;
  if(submit)submit.disabled=false;
  if(persisted){const dialog=document.getElementById('sessionStartDialog');if(dialog.open)dialog.close();requestAnimationFrame(()=>{const activeSurface=document.getElementById('sessionCompanionOpen')||document.getElementById('sessionBanner');activeSurface?.scrollIntoView?.({block:'nearest'});activeSurface?.focus?.()});return true}
  state.data=previous;try{await window.CompassoStorage.save(STORAGE_KEY,previous)}catch{}
  renderAll();sessionRestoreStartDraft(draft);
  const dialog=document.getElementById('sessionStartDialog');if(!dialog.open)dialog.showModal();
  sessionSetError('sessionStartError','Não foi possível iniciar a sessão. Revise as opções e tente novamente.');
  requestAnimationFrame(()=>document.getElementById('sessionStartError')?.focus());
  return false;
}

function toggleSessionPause() {
  const session = sessionActive();
  if (!session || session.status === 'finishing') return;
  if (session.status === 'active') {
    session.status = 'paused';
    session.pauseStartedAt = new Date().toISOString();
    executionSyncRegular(session);
    saveData('Sessão pausada');
  } else {
    session.pausedMs = positiveNumber(session.pausedMs) + Math.max(0, sessionNow() - new Date(session.pauseStartedAt).getTime());
    session.pauseStartedAt = null;
    session.status = 'active';
    executionSyncRegular(session);
    saveData('Sessão retomada');
  }
}

function openSessionFinish() {
  if(typeof energyResetChoices==='function'){energyResetChoices('after');energyResetChoices('difficulty')}
  let session = sessionActive();
  if (!session) return;
  const item = sessionItem(session);
  const source = sessionSourceItem(session);
  if (session.status !== 'finishing') {
    Object.assign(session, sessionTimerModel.begin(session, sessionNow()));
    executionSyncRegular(session);
    clearInterval(sessionRuntime.tick);
    sessionRuntime.tick = null;
    saveData();
  }
  const metric = source && sessionUsesResourceMetric(session) ? sessionMetric(source, session.domain) : null;
  let suggested = metric?.value ?? null;
  if (metric && session.domain === 'study') suggested = Math.round((metric.value + sessionElapsedMs(session) / 3600000) * 10) / 10;
  document.getElementById('sessionFinishTitle').textContent = item?.title || session.intent || 'Sessão sem origem disponível';
  document.getElementById('sessionFinishSummary').textContent = metric ? `${formatDuration(sessionElapsedMs(session))} de atividade · início em ${formatNumber(session.startValue)} ${metric.config.unit}.` : source ? `${formatDuration(sessionElapsedMs(session))} de atividade na tentativa registrada.` : `${formatDuration(sessionElapsedMs(session))} de atividade. A origem não está mais disponível; a sessão e a Evidence serão salvas sem alterar o item.`;
  const metricField = document.getElementById('sessionEndValueField');
  metricField.hidden = !metric;
  document.getElementById('sessionEndValueLabel').textContent = metric?.config.currentLabel || 'Valor final';
  const input = document.getElementById('sessionEndValue');
  input.required = Boolean(metric);
  input.step = metric?.config.step || '1';
  input.max = metric?.config.isPercent ? '100' : '';
  input.value = metric ? suggested : '';
  document.getElementById('sessionReflection').value = '';
  const dialog = document.getElementById('sessionFinishDialog');
  if (!dialog.open) dialog.showModal();
  renderSessionBanner();
}

function cancelSessionFinish() {
  const session = sessionActive();
  const dialog = document.getElementById('sessionFinishDialog');
  if (!session || session.status !== 'finishing') { if (dialog?.open) dialog.close(); return; }
  Object.assign(session, sessionTimerModel.cancel(session, sessionNow()));
  executionSyncRegular(session);
  if (dialog?.open) dialog.close();
  saveData(session.status === 'paused' ? 'Encerramento cancelado; sessão continua pausada' : 'Encerramento cancelado; sessão retomada');
}

async function finishSession({evidence=null}={}) {
  if(sessionRuntime.finishing)return false;
  const current = sessionActive();
  if (!current || current.status !== 'finishing') return false;
  const source = sessionSourceItem(current);
  const metric = source && sessionUsesResourceMetric(current) ? sessionMetric(source, current.domain) : null;
  const endValue = metric ? (metric.config.isPercent ? clamp(document.getElementById('sessionEndValue').value) : positiveNumber(document.getElementById('sessionEndValue').value)) : null;
  if (metric && endValue < positiveNumber(current.startValue)) { showToast('O valor final não pode ser menor que o inicial');document.getElementById('sessionEndValue')?.focus();return false; }
  const draft={endValue:document.getElementById('sessionEndValue').value,reflection:document.getElementById('sessionReflection').value,evidenceType:document.getElementById('sessionEvidenceType')?.value||'',evidenceSummary:document.getElementById('sessionEvidenceSummary')?.value||'',evidenceDetails:document.getElementById('sessionEvidenceDetails')?.value||''};
  const previous=state.data,candidate=sessionClone(state.data),session=candidate.sessions.find(item=>item.id===current.id);
  if(!session)return false;
  const candidateItem=sessionSourceItem(session,candidate);
  const frozen = sessionTimerModel.finish(session);
  if (session.statusBeforeFinishing === 'paused' && session.pauseStartedAt) {
    session.pausedMs = positiveNumber(session.pausedMs) + Math.max(0, new Date(frozen.endedAt).getTime() - new Date(session.pauseStartedAt).getTime());
  }
  session.endValue = endValue;
  session.endedAt = frozen.endedAt;
  session.durationMs = frozen.durationMs;
  session.status = 'completed';
  session.pauseStartedAt = null;
  session.statusBeforeFinishing = null;
  session.finishingStartedAt = null;
  session.frozenDurationMs = null;
  session.updatedAt = new Date().toISOString();
  session.reflection = document.getElementById('sessionReflection').value.trim();
  if (metric) {
    candidateItem[metric.config.currentKey] = endValue;
    if (metric.config.isPercent) candidateItem[metric.config.totalKey] = 100;
    const total = positiveNumber(candidateItem[metric.config.totalKey]);
    if (total > 0) candidateItem.progress = clamp(Math.round((Math.min(endValue,total) / total) * 100));
    if (candidateItem.progress >= 100) candidateItem.status = 'done';
  }
  if(evidence){candidate.evidence=Array.isArray(candidate.evidence)?candidate.evidence:[];candidate.evidence.unshift(evidence)}
  state.data=candidate;executionSyncRegular(session);
  if(typeof energyFinishForSession==='function')energyFinishForSession(session);
  if(typeof flowEvent==='function')flowEvent('completed',session.itemId,{source:'session'});
  sessionRuntime.finishing=true;sessionSetError('sessionFinishError','');
  const persisted=await saveData(evidence?'Sessão concluída com evidência':metric?'Sessão concluída e progresso atualizado':'Sessão concluída sem alterar progresso de recurso');
  sessionRuntime.finishing=false;
  if(persisted){document.getElementById('sessionFinishDialog').close();return{sessionId:session.id,evidenceId:evidence?.id||null,status:'completed',source:'normal'}}
  state.data=previous;try{await window.CompassoStorage.save(STORAGE_KEY,previous)}catch{}
  renderAll();document.getElementById('sessionEndValue').value=draft.endValue;document.getElementById('sessionReflection').value=draft.reflection;
  if(document.getElementById('sessionEvidenceType'))document.getElementById('sessionEvidenceType').value=draft.evidenceType;
  if(document.getElementById('sessionEvidenceSummary'))document.getElementById('sessionEvidenceSummary').value=draft.evidenceSummary;
  if(document.getElementById('sessionEvidenceDetails'))document.getElementById('sessionEvidenceDetails').value=draft.evidenceDetails;
  const dialog=document.getElementById('sessionFinishDialog');if(!dialog.open)dialog.showModal();
  sessionSetError('sessionFinishError','Não foi possível salvar o encerramento. A sessão e a Evidence continuam prontas para nova tentativa.');
  requestAnimationFrame(()=>document.getElementById('sessionFinishError')?.focus());
  return false;
}

function openSessionHistory(domain, itemId) {
  const item = state.data[domain].find(candidate => candidate.id === itemId);
  if (!item) return;
  sessionRuntime.historyItem = { domain, itemId };
  document.getElementById('sessionHistoryTitle').textContent = item.title;
  renderSessionHistory();
  document.getElementById('sessionHistoryDialog').showModal();
}

function renderSessionHistory() {
  const selected = sessionRuntime.historyItem;
  const list = document.getElementById('sessionHistoryList');
  if (!selected || !list) return;
  const sessions = state.data.sessions
    .filter(session => session.domain === selected.domain && session.itemId === selected.itemId)
    .sort((a,b) => new Date(b.startedAt) - new Date(a.startedAt));
  if (!sessions.length) { list.innerHTML = '<div class="session-empty">Nenhuma sessão registrada para este item.</div>'; return; }
  list.innerHTML = sessions.map(session => {
    const date = new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(session.startedAt));
    const status = session.status === 'completed' ? 'Concluída' : session.status === 'paused' ? 'Pausada' : 'Em andamento';
    return `<article class="session-history-row"><div><strong>${date} · ${formatDuration(session.durationMs ?? sessionElapsedMs(session))}</strong><span>${status} · ${escapeHtml(sessionMetricLabel(session))}</span>${session.intent ? `<span>Objetivo: ${escapeHtml(session.intent)}</span>` : ''}${session.reflection ? `<span>Observação: ${escapeHtml(session.reflection)}</span>` : ''}</div>${session.status === 'completed' ? `<button type="button" data-delete-session="${session.id}">Excluir</button>` : ''}</article>`;
  }).join('');
}

function deleteSession(id) {
  const session = state.data.sessions.find(candidate => candidate.id === id);
  if (!session || session.status !== 'completed' || !confirm('Excluir esta sessão do histórico? O progresso atual do item não será alterado.')) return;
  state.data.sessions = state.data.sessions.filter(candidate => candidate.id !== id);
  state.data.executionSessions = state.data.executionSessions.filter(candidate => !(candidate.source?.collection === 'sessions' && candidate.source?.id === id));
  saveData('Sessão excluída');
  renderSessionHistory();
}

function resumeSession() {
  const session=sessionActive();if(!session)return false;
  if(session.status==='finishing')openSessionFinish();
  else if(session.status==='paused')toggleSessionPause();
  requestAnimationFrame(()=>{const activeSurface=document.getElementById('sessionCompanionOpen')||document.getElementById('sessionPauseBtn')||document.getElementById('sessionBanner');activeSurface?.scrollIntoView?.({block:'nearest'});activeSurface?.focus?.()});
  return true;
}

installSessionStyles();
installSessionUi();
CompassoFeatures.command('session.startDefault',sessionStartDefault);
CompassoFeatures.command('session.openConfiguration',sessionOpenConfiguration);
CompassoFeatures.command('session.resume',resumeSession);
const sessionCreateFromForm=createSession;
sessionRuntime.commitFinish=finishSession;

document.getElementById('sessionStartForm').addEventListener('submit', event => { event.preventDefault();void sessionCreateFromForm(); });
sessionRuntime.finish=finishSession;
document.getElementById('sessionFinishForm').addEventListener('submit', event => { event.preventDefault();void sessionRuntime.finish(); });
document.getElementById('sessionPauseBtn').addEventListener('click', toggleSessionPause);
document.getElementById('sessionFinishBtn').addEventListener('click', openSessionFinish);
document.addEventListener('click', event => {
  const start = event.target.closest('[data-start-session]');
  if (start && !start.disabled) { const [domain,itemId] = start.dataset.startSession.split(':'); openSessionStart(domain,itemId); }
  const history = event.target.closest('[data-session-history]');
  if (history) { const [domain,itemId] = history.dataset.sessionHistory.split(':'); openSessionHistory(domain,itemId); }
  const close = event.target.closest('[data-session-close]');
  if (close && close.dataset.sessionClose === 'sessionFinishDialog') cancelSessionFinish();
  else if (close) document.getElementById(close.dataset.sessionClose)?.close();
  const remove = event.target.closest('[data-delete-session]');
  if (remove) deleteSession(remove.dataset.deleteSession);
});

window.addEventListener('beforeunload', () => window.CompassoStorage?.flush?.(STORAGE_KEY));
document.getElementById('sessionFinishDialog').addEventListener('cancel', event => { event.preventDefault(); cancelSessionFinish(); });
if (sessionActive()?.status === 'finishing') queueMicrotask(openSessionFinish);
