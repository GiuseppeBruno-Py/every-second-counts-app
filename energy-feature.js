/* Compasso · Energia percebida e mapa pessoal por horario
 * Injetado depois de sessions-feature.js para complementar o ciclo das sessoes.
 */

const ENERGY_FEATURE_VERSION = 1;
const ENERGY_MIN_SAMPLE = 3;
const { ENERGY_VALUES, valid:energyValid, hourAt:energyHourAt, period:energyPeriod, mode:energyMode, aggregate:energyAggregate } = window.CompassoEnergyModel;
const ENERGY_LABELS = { low:'Baixa', medium:'Média', high:'Alta' };
state.data.energyCheckins = Array.isArray(state.data.energyCheckins) ? state.data.energyCheckins : [];

const energyRuntime = { before:'', after:'', difficulty:'', editingId:null };

function energyNowIso() { return new Date().toISOString(); }
function energyNewId() { return `ec${Date.now()}${Math.random().toString(36).slice(2,7)}`; }
function energyTimezone() { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; }
function energyHour(record) {
  return energyHourAt(record.startedAt, record.timezone || 'UTC');
}
function energyNormalizeRecord(record) {
  const now = energyNowIso();
  return {
    id: record.id || energyNewId(), schemaVersion:ENERGY_FEATURE_VERSION,
    actionId: record.actionId || record.itemId || null, sessionId:record.sessionId || null,
    startedAt: record.startedAt || now, endedAt:record.endedAt || null,
    timezone:record.timezone || 'UTC', energyBefore:energyValid(record.energyBefore),
    energyAfter:energyValid(record.energyAfter), perceivedDifficulty:['easier','expected','harder'].includes(record.perceivedDifficulty) ? record.perceivedDifficulty : null,
    createdAt:record.createdAt || now, updatedAt:record.updatedAt || now
  };
}
state.data.energyCheckins = state.data.energyCheckins.map(energyNormalizeRecord);

function energyChoice(name, value, label) {
  return `<button type="button" class="energy-choice" data-energy-choice="${name}:${value}">${label}</button>`;
}

function installEnergyStyles() {
  if (document.getElementById('compassoEnergyStyles')) return;
  const style = document.createElement('style'); style.id = 'compassoEnergyStyles';
  style.textContent = `
    .energy-block{border:1px solid var(--line);border-radius:13px;padding:14px;background:#f8f7f3}.energy-block strong{display:block;font-size:11px;margin-bottom:4px}.energy-block p{margin:0 0 10px;color:var(--muted);font-size:10px;line-height:1.5}.energy-choices{display:flex;gap:7px;flex-wrap:wrap}.energy-choice{border:1px solid var(--line);background:#fff;border-radius:999px;min-height:34px;padding:0 12px;font-size:10px;font-weight:700;cursor:pointer}.energy-choice.selected{border-color:var(--violet);background:var(--violet-soft);color:var(--violet)}
    .energy-open-btn{white-space:nowrap}.energy-map{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}.energy-period{border:1px solid var(--line);border-radius:13px;padding:13px;min-width:0}.energy-period strong{font-size:11px}.energy-period b{display:block;font:800 17px Manrope,sans-serif;margin:8px 0 3px}.energy-period span{font-size:9px;color:var(--muted)}.energy-history{display:grid;gap:9px;max-height:42vh;overflow:auto}.energy-row{border:1px solid var(--line);border-radius:12px;padding:12px;display:grid;grid-template-columns:1fr auto;gap:10px}.energy-row strong{font-size:11px}.energy-row span{display:block;font-size:9px;color:var(--muted);margin-top:4px}.energy-row-actions{display:flex;gap:5px}.energy-row-actions button{border:0;background:transparent;font-size:9px;font-weight:800;cursor:pointer;color:var(--violet)}.energy-row-actions .danger{color:var(--red)}.energy-edit{display:none;border-top:1px solid var(--line);padding-top:14px}.energy-edit.show{display:grid;gap:10px}
    @media(max-width:720px){.energy-map{grid-template-columns:1fr 1fr}.energy-open-btn{width:39px;padding:0;justify-content:center}.energy-open-btn span{display:none}.energy-row{grid-template-columns:1fr}.energy-row-actions{justify-content:flex-start}}
    @media(max-width:420px){.energy-map{grid-template-columns:1fr}}
  `; document.head.appendChild(style);
}

function installEnergyUi() {
  const startBody = document.querySelector('#sessionStartDialog .session-dialog-body');
  if (startBody && !document.getElementById('energyBeforeBlock')) startBody.insertAdjacentHTML('beforeend', `<div class="energy-block" id="energyBeforeBlock"><strong>Como está sua energia agora?</strong><p>Opcional. Um toque ajuda a descobrir seus melhores horários sem bloquear a sessão.</p><div class="energy-choices">${energyChoice('before','low','Baixa')}${energyChoice('before','medium','Média')}${energyChoice('before','high','Alta')}<button type="button" class="energy-choice selected" data-energy-choice="before:">Pular</button></div></div>`);
  const finishBody = document.querySelector('#sessionFinishDialog .session-dialog-body');
  if (finishBody && !document.getElementById('energyAfterBlock')) finishBody.insertAdjacentHTML('beforeend', `<div class="energy-block" id="energyAfterBlock"><strong>Check-in final</strong><p>Opcional: energia ao terminar e dificuldade percebida.</p><div class="energy-choices">${energyChoice('after','low','Energia baixa')}${energyChoice('after','medium','Energia média')}${energyChoice('after','high','Energia alta')}<button type="button" class="energy-choice selected" data-energy-choice="after:">Pular</button></div><div class="energy-choices" style="margin-top:9px">${energyChoice('difficulty','easier','Mais fácil')}${energyChoice('difficulty','expected','Como esperado')}${energyChoice('difficulty','harder','Mais difícil')}<button type="button" class="energy-choice selected" data-energy-choice="difficulty:">Pular</button></div></div>`);
  const top = document.querySelector('.top-actions');
  if (top && !document.getElementById('energyMapBtn')) top.insertAdjacentHTML('afterbegin', `<button class="secondary-btn energy-open-btn" id="energyMapBtn" type="button" title="Mapa de energia">${icon('spark')}<span>Energia</span></button>`);
  if (!document.getElementById('energyMapDialog')) document.body.insertAdjacentHTML('beforeend', `
    <dialog class="session-dialog" id="energyMapDialog"><div class="session-dialog-head"><div><div class="eyebrow">Padrões reais</div><h2>Mapa pessoal de energia</h2></div><button class="close-btn" type="button" data-energy-close>${icon('x')}</button></div>
    <div class="session-dialog-body"><p class="session-summary">O mapa usa apenas seus check-ins e mostra o tamanho da amostra. Não representa diagnóstico nem prova causalidade.</p><div class="energy-map" id="energyMap"></div><div><div class="eyebrow">Histórico</div><div class="energy-history" id="energyHistory"></div></div>
    <form class="energy-edit" id="energyEditForm"><input type="hidden" id="energyEditId"><div class="field-row"><div class="field"><label for="energyEditBefore">Energia inicial</label><select id="energyEditBefore"><option value="">Não informada</option><option value="low">Baixa</option><option value="medium">Média</option><option value="high">Alta</option></select></div><div class="field"><label for="energyEditAfter">Energia final</label><select id="energyEditAfter"><option value="">Não informada</option><option value="low">Baixa</option><option value="medium">Média</option><option value="high">Alta</option></select></div></div><div class="field"><label for="energyEditDifficulty">Dificuldade</label><select id="energyEditDifficulty"><option value="">Não informada</option><option value="easier">Mais fácil</option><option value="expected">Como esperado</option><option value="harder">Mais difícil</option></select></div><div class="session-dialog-foot" style="padding:10px 0 0"><button type="button" class="quiet-btn" data-energy-cancel>Cancelar</button><button class="primary-btn" type="submit">Salvar alteração</button></div></form></div>
    <div class="session-dialog-foot"><button type="button" class="secondary-btn" data-energy-close>Fechar</button></div></dialog>`);
}

function energyResetChoices(group) {
  energyRuntime[group] = '';
  document.querySelectorAll(`[data-energy-choice^="${group}:"]`).forEach(button => button.classList.toggle('selected', button.dataset.energyChoice === `${group}:`));
}
function energySelect(group, value) {
  energyRuntime[group] = value;
  document.querySelectorAll(`[data-energy-choice^="${group}:"]`).forEach(button => button.classList.toggle('selected', button.dataset.energyChoice === `${group}:${value}`));
}
function energyCheckinForSession(sessionId) { return state.data.energyCheckins.find(record => record.sessionId === sessionId) || null; }
function energyCreateForSession(session) {
  if (!energyRuntime.before) return;
  const now = energyNowIso();
  state.data.energyCheckins.unshift(energyNormalizeRecord({ id:energyNewId(), sessionId:session.id, actionId:session.itemId, startedAt:session.startedAt, timezone:energyTimezone(), energyBefore:energyRuntime.before, createdAt:now, updatedAt:now }));
}
function energyFinishForSession(session) {
  if (!energyRuntime.after && !energyRuntime.difficulty) return;
  let record = energyCheckinForSession(session.id);
  if (!record) { const now=energyNowIso(); record=energyNormalizeRecord({id:energyNewId(),sessionId:session.id,actionId:session.itemId,startedAt:session.startedAt,timezone:energyTimezone(),createdAt:now,updatedAt:now}); state.data.energyCheckins.unshift(record); }
  record.endedAt = session.endedAt || energyNowIso(); record.energyAfter=energyValid(energyRuntime.after); record.perceivedDifficulty=['easier','expected','harder'].includes(energyRuntime.difficulty) ? energyRuntime.difficulty : null; record.updatedAt=energyNowIso();
}

function renderEnergyMap() {
  const map = document.getElementById('energyMap'), history = document.getElementById('energyHistory');
  if (!map || !history) return;
  const periods=[['morning','Manhã'],['afternoon','Tarde'],['evening','Noite'],['dawn','Madrugada']];
  map.innerHTML=periods.map(([key,label])=>{const rows=state.data.energyCheckins.filter(r=>r.energyBefore && energyPeriod(energyHour(r))===key);const mode=energyMode(rows);return `<article class="energy-period"><strong>${label}</strong><b>${rows.length<ENERGY_MIN_SAMPLE?'Dados insuficientes':(mode?ENERGY_LABELS[mode]:'Sem padrão claro')}</b><span>${rows.length} check-in${rows.length===1?'':'s'} · mínimo ${ENERGY_MIN_SAMPLE}</span></article>`}).join('');
  const rows=state.data.energyCheckins.slice().sort((a,b)=>new Date(b.startedAt)-new Date(a.startedAt));
  history.innerHTML=rows.length?rows.map(record=>{const date=new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short',timeZone:record.timezone||'UTC'}).format(new Date(record.startedAt));const difficulty={easier:'mais fácil',expected:'como esperado',harder:'mais difícil'}[record.perceivedDifficulty]||'não informada';return `<article class="energy-row"><div><strong>${date}</strong><span>Inicial: ${ENERGY_LABELS[record.energyBefore]||'não informada'} · Final: ${ENERGY_LABELS[record.energyAfter]||'não informada'} · ${difficulty}</span><span>${escapeHtml(record.timezone||'UTC')}</span></div><div class="energy-row-actions"><button type="button" data-energy-edit="${record.id}">Editar</button><button type="button" class="danger" data-energy-delete="${record.id}">Excluir</button></div></article>`}).join(''):'<div class="session-empty">Nenhum check-in registrado. Você pode pular sempre que quiser.</div>';
}

const openSessionStartWithoutEnergy = openSessionStart;
openSessionStart = function(domain,itemId){ energyResetChoices('before'); openSessionStartWithoutEnergy(domain,itemId); };
const createSessionWithoutEnergy = createSession;
createSession = function(){ createSessionWithoutEnergy(); const session=sessionActive(); if(session){energyCreateForSession(session); if(energyRuntime.before) saveData('Sessão iniciada com check-in de energia');} };
const openSessionFinishWithoutEnergy = openSessionFinish;
openSessionFinish = function(){ energyResetChoices('after'); energyResetChoices('difficulty'); openSessionFinishWithoutEnergy(); };
const finishSessionWithoutEnergy = finishSession;
finishSession = function(){ const session=sessionActive(); if(!session)return; finishSessionWithoutEnergy(); if(session.status==='completed'){energyFinishForSession(session); if(energyRuntime.after||energyRuntime.difficulty) saveData('Sessão e energia registradas');} };

installEnergyStyles();
installEnergyUi();
document.addEventListener('click',event=>{
  const choice=event.target.closest('[data-energy-choice]'); if(choice){const [group,value]=choice.dataset.energyChoice.split(':');energySelect(group,value);}
  if(event.target.closest('#energyMapBtn')){renderEnergyMap();document.getElementById('energyMapDialog').showModal();}
  if(event.target.closest('[data-energy-close]'))document.getElementById('energyMapDialog').close();
  if(event.target.closest('[data-energy-cancel]'))document.getElementById('energyEditForm').classList.remove('show');
  const edit=event.target.closest('[data-energy-edit]'); if(edit){const record=state.data.energyCheckins.find(r=>r.id===edit.dataset.energyEdit);if(record){document.getElementById('energyEditId').value=record.id;document.getElementById('energyEditBefore').value=record.energyBefore||'';document.getElementById('energyEditAfter').value=record.energyAfter||'';document.getElementById('energyEditDifficulty').value=record.perceivedDifficulty||'';document.getElementById('energyEditForm').classList.add('show');}}
  const remove=event.target.closest('[data-energy-delete]'); if(remove&&confirm('Excluir este check-in de energia?')){state.data.energyCheckins=state.data.energyCheckins.filter(r=>r.id!==remove.dataset.energyDelete);saveData('Check-in excluído');renderEnergyMap();}
});
document.getElementById('energyEditForm').addEventListener('submit',event=>{event.preventDefault();const record=state.data.energyCheckins.find(r=>r.id===document.getElementById('energyEditId').value);if(!record)return;record.energyBefore=energyValid(document.getElementById('energyEditBefore').value);record.energyAfter=energyValid(document.getElementById('energyEditAfter').value);record.perceivedDifficulty=['easier','expected','harder'].includes(document.getElementById('energyEditDifficulty').value)?document.getElementById('energyEditDifficulty').value:null;record.updatedAt=energyNowIso();saveData('Check-in atualizado');document.getElementById('energyEditForm').classList.remove('show');renderEnergyMap();});
