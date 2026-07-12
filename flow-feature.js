/* Compasso · Flow Matching deterministico para a fila inteligente */

const FLOW_FEATURE_VERSION=1;
const FLOW_REASON_LABELS={weekly_focus:'alinhada ao foco semanal',high_priority:'prioridade alta',medium_priority:'prioridade média',overdue:'prazo vencido',due_soon:'prazo próximo',due_this_week:'vence nesta semana',energy_match:'energia compatível',time_fit:'cabe bem no tempo',stale_action:'sem avanço recente',not_started_recently:'ainda sem sessão recente',deep_window:'janela de concentração',cognitive_match:'demanda compatível'};
const FLOW_CONTEXT_LABELS={computer:'Computador',phone:'Celular',home:'Casa',work:'Trabalho'};
state.data.flowEvents=Array.isArray(state.data.flowEvents)?state.data.flowEvents:[];
['reading','study','goal'].forEach(domain=>(state.data[domain]||[]).forEach(item=>{
  item.workContext=['computer','phone','home','work'].includes(item.workContext)?item.workContext:null;
  item.priority=['low','medium','high'].includes(item.priority)?item.priority:null;
  item.dueDate=/^\d{4}-\d{2}-\d{2}$/.test(item.dueDate||'')?item.dueDate:null;
}));

const flowRuntime={results:[],rejected:new Set(),formTarget:null};
function flowEvent(type,itemId=null,metadata={}){state.data.flowEvents.unshift({id:`fe${Date.now()}${Math.random().toString(36).slice(2,6)}`,type,itemId,metadata,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});}
function flowInputs(){return{energy:document.getElementById('flowEnergy').value,minutes:Number(document.getElementById('flowMinutes').value),context:document.getElementById('flowContext').value,concentration:document.getElementById('flowConcentration').checked};}
function flowCandidates(){return ['reading','study','goal'].flatMap(domain=>(state.data[domain]||[]).map(item=>({item,domain})));}
function flowLastActivity(){return Object.fromEntries((state.data.sessions||[]).slice().sort((a,b)=>new Date(b.startedAt)-new Date(a.startedAt)).map(session=>[session.itemId,session.endedAt||session.startedAt]));}
function flowLatestEnergy(){const recent=(state.data.energyCheckins||[]).filter(record=>record.energyBefore&&Date.now()-new Date(record.startedAt)<21600000).sort((a,b)=>new Date(b.startedAt)-new Date(a.startedAt))[0];return recent?.energyBefore||'medium';}

function installFlowStyles(){
  if(document.getElementById('compassoFlowStyles'))return;
  const style=document.createElement('style');style.id='compassoFlowStyles';style.textContent=`
    .flow-box{border:1px solid var(--line);border-radius:15px;padding:15px;margin-bottom:16px;background:#f8f7f3}.flow-box h4{margin:4px 0 5px;font:800 14px Manrope,sans-serif}.flow-box>p{margin:0 0 12px;color:var(--muted);font-size:10px;line-height:1.5}.flow-inputs{display:grid;grid-template-columns:1fr 1fr;gap:8px}.flow-inputs label{font-size:9px;font-weight:800;color:var(--muted)}.flow-inputs select,.flow-inputs input{width:100%;height:36px;border:1px solid var(--line);border-radius:9px;background:#fff;padding:0 9px;font-size:10px}.flow-check{display:flex;align-items:center;gap:8px;border:1px solid var(--line);border-radius:9px;background:#fff;padding:0 10px;min-height:36px}.flow-check input{width:auto}.flow-run{width:100%;justify-content:center;margin-top:9px}.flow-results{display:grid;gap:9px;margin-top:12px}.flow-result{border:1px solid var(--line);border-radius:12px;background:#fff;padding:12px}.flow-result.primary{border-color:var(--violet);box-shadow:0 0 0 2px rgba(97,86,201,.08)}.flow-result-head{display:flex;justify-content:space-between;gap:10px}.flow-result strong{font-size:11px}.flow-score{color:var(--violet);font-size:9px;font-weight:800}.flow-reasons{display:flex;flex-wrap:wrap;gap:5px;margin:8px 0}.flow-reason{border-radius:999px;background:var(--violet-soft);color:var(--violet);padding:4px 7px;font-size:8px;font-weight:700}.flow-reason.missing{background:#efeee9;color:var(--muted)}.flow-result-actions{display:flex;gap:6px;flex-wrap:wrap}.flow-result-actions button{border:1px solid var(--line);border-radius:8px;background:#fff;min-height:30px;padding:0 9px;font-size:9px;font-weight:800;cursor:pointer}.flow-result-actions .primary{background:var(--ink);border-color:var(--ink);color:#fff}.flow-no-results{font-size:10px;color:var(--muted);line-height:1.55;padding:12px;border:1px dashed var(--line);border-radius:11px}.flow-profile-fields{display:grid;gap:12px;padding-top:12px;border-top:1px solid var(--line)}
    @media(max-width:620px){.flow-inputs{grid-template-columns:1fr}.flow-result-head{display:block}.flow-score{display:block;margin-top:4px}.flow-result-actions button{flex:1}.flow-box{padding:13px}}
  `;document.head.appendChild(style);
}

function installFlowProfileFields(){
  const details=document.getElementById('cognitiveFields');
  if(details&&!document.getElementById('workContextField'))details.insertAdjacentHTML('beforeend',`<div class="flow-profile-fields"><div class="field-row"><div class="field"><label for="workContextField">Contexto</label><select id="workContextField"><option value="">Não definido</option><option value="computer">Computador</option><option value="phone">Celular</option><option value="home">Casa</option><option value="work">Trabalho</option></select></div><div class="field"><label for="priorityField">Prioridade</label><select id="priorityField"><option value="">Não definida</option><option value="low">Baixa</option><option value="medium">Média</option><option value="high">Alta</option></select></div></div><div class="field"><label for="dueDateField">Prazo opcional</label><input id="dueDateField" type="date"></div></div>`);
}

function installFlowUi(){
  const candidates=document.getElementById('todayCandidates');
  if(!candidates||document.getElementById('flowBox'))return;
  candidates.insertAdjacentHTML('beforebegin',`<section class="flow-box" id="flowBox"><div class="eyebrow">Flow Matching</div><h4>O que consigo fazer agora?</h4><p>Combine sua energia, tempo, contexto e concentração. As regras são locais e explicáveis.</p><div class="flow-inputs"><label>Energia atual<select id="flowEnergy"><option value="low">Baixa</option><option value="medium">Média</option><option value="high">Alta</option></select></label><label>Minutos disponíveis<input id="flowMinutes" type="number" min="5" max="720" step="5" value="30"></label><label>Contexto<select id="flowContext"><option value="">Qualquer contexto</option><option value="computer">Computador</option><option value="phone">Celular</option><option value="home">Casa</option><option value="work">Trabalho</option></select></label><label class="flow-check"><input id="flowConcentration" type="checkbox" checked>Posso me concentrar</label></div><button class="primary-btn flow-run" type="button" id="flowRunBtn">${icon('spark')}Encontrar ações</button><div class="flow-results" id="flowResults"></div></section>`);
  document.getElementById('flowEnergy').value=flowLatestEnergy();
}

function flowReasonHtml(result){
  const reasons=result.reasons.slice(0,3).map(code=>`<span class="flow-reason">${FLOW_REASON_LABELS[code]||code}</span>`);
  if(result.missing.length)reasons.push(`<span class="flow-reason missing">dados ausentes: ${result.missing.join(', ')}</span>`);
  return reasons.join('');
}
function renderFlowResults(){
  const box=document.getElementById('flowResults');if(!box)return;
  if(!flowRuntime.results.length){box.innerHTML='<div class="flow-no-results">Nenhuma ação combina com todos os filtros. Tente aumentar o tempo, escolher outro contexto, elevar a energia disponível ou permitir concentração. A fila manual continua disponível abaixo.</div>';return;}
  box.innerHTML=flowRuntime.results.map((result,index)=>`<article class="flow-result ${index===0?'primary':''}"><div class="flow-result-head"><strong>${escapeHtml(result.item.note||result.item.expectedOutcome||result.item.title)}</strong><span class="flow-score">${index===0?'Principal':'Alternativa'} · ${result.score} pts</span></div><div class="flow-reasons">${flowReasonHtml(result)}</div><div class="flow-result-actions">${['reading','study'].includes(result.domain)?`<button class="primary" data-flow-start="${result.domain}:${result.item.id}">Iniciar</button>`:''}<button data-flow-add="${result.domain}:${result.item.id}">Adicionar ao dia</button><button data-flow-reject="${result.item.id}">Agora não</button></div></article>`).join('');
}
function runFlow(){
  flowRuntime.rejected.clear();
  flowRuntime.results=window.CompassoFlowModel.recommend(flowCandidates(),flowInputs(),{focusTitles:new Set(state.data.focus||[]),lastActivity:flowLastActivity(),limit:3});
  flowRuntime.results.forEach(result=>flowEvent('shown',result.item.id,{score:result.score,reasons:result.reasons}));
  saveData('Recomendações atualizadas');renderFlowResults();
}
function rerunFlowAfterReject(){
  flowRuntime.results=window.CompassoFlowModel.recommend(flowCandidates(),flowInputs(),{focusTitles:new Set(state.data.focus||[]),lastActivity:flowLastActivity(),rejectedIds:[...flowRuntime.rejected],limit:3});renderFlowResults();
}

installFlowStyles();
installFlowProfileFields();
installFlowUi();

const openDialogWithoutFlow=openDialog;
openDialog=function(domain,itemId=null){openDialogWithoutFlow(domain,itemId);const item=itemId?state.data[domain].find(entry=>entry.id===itemId):null;document.getElementById('workContextField').value=item?.workContext||'';document.getElementById('priorityField').value=item?.priority||'';document.getElementById('dueDateField').value=item?.dueDate||'';if(item?.workContext||item?.priority||item?.dueDate)document.getElementById('cognitiveFields').open=true;};

const finishSessionWithoutFlow=finishSession;
finishSession=function(){const session=sessionActive();finishSessionWithoutFlow();if(session?.status==='completed'){flowEvent('completed',session.itemId,{source:'session'});saveData('Sessão concluída');}};

document.getElementById('itemForm').addEventListener('submit',()=>{flowRuntime.formTarget={editing:state.editingId,domain:document.getElementById('domainField').value,workContext:document.getElementById('workContextField').value||null,priority:document.getElementById('priorityField').value||null,dueDate:document.getElementById('dueDateField').value||null};},true);
document.getElementById('itemForm').addEventListener('submit',()=>{queueMicrotask(()=>{const target=flowRuntime.formTarget;if(!target)return;let item;if(target.editing){const [domain,id]=target.editing.split(':');item=state.data[domain].find(entry=>entry.id===id);}else item=state.data[target.domain]?.[0];if(!item)return;item.workContext=target.workContext;item.priority=target.priority;item.dueDate=target.dueDate;item.updatedAt=new Date().toISOString();saveData('Perfil de execução atualizado');});});

document.addEventListener('click',event=>{
  if(event.target.closest('#flowRunBtn'))runFlow();
  const add=event.target.closest('[data-flow-add]');if(add){const[domain,itemId]=add.dataset.flowAdd.split(':');const plan=todayPlan();if(!plan.items.some(ref=>ref.type!=='custom'&&ref.domain===domain&&ref.itemId===itemId))plan.items.push({domain,itemId,completedAt:null});flowEvent('added',itemId);todaySave('Ação adicionada ao dia');renderFlowResults();}
  const start=event.target.closest('[data-flow-start]');if(start){const[domain,itemId]=start.dataset.flowStart.split(':');flowEvent('started',itemId);saveData('Recomendação iniciada');openSessionStart(domain,itemId);}
  const reject=event.target.closest('[data-flow-reject]');if(reject){flowRuntime.rejected.add(reject.dataset.flowReject);flowEvent('rejected',reject.dataset.flowReject);saveData('Recomendação trocada');rerunFlowAfterReject();}
  const toggle=event.target.closest('[data-today-toggle]');if(toggle){const ref=todayPlan().items.find(item=>todayRefKey(item)===toggle.dataset.todayToggle);if(ref?.completedAt&&ref.itemId){flowEvent('completed',ref.itemId,{source:'today'});saveData('Ação concluída');}}
});
