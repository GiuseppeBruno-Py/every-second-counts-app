/* Compasso · Rituais e arquitetura de ação reutilizáveis */
const ritualModel=globalThis.CompassoRitualModel;
state.data.ritualTemplates=Array.isArray(state.data.ritualTemplates)?state.data.ritualTemplates.map(x=>ritualModel.normalize(x)).filter(Boolean):ritualModel.defaults(new Date().toISOString());
const ritualRuntime={action:null,editing:null,executionSelections:{session:null,deep:null}};
const RITUAL_PROVENANCE=new Set(['linked','explicit','suggested','none']);

function ritualCurrent(){return state.data.ritualTemplates.find(x=>x.id===ritualRuntime.editing)||null}
function ritualLines(v){return ritualModel.items(String(v||'').split('\n').map((text,i)=>({text,required:true,order:i})))}
function ritualContextKey(domain,itemId){return`${domain}:${itemId}`}
function ritualSourceItem(domain,itemId){return domain==='learningOutcome'?state.data.learningOutcomes?.find(item=>item.id===itemId):state.data[domain]?.find(item=>item.id===itemId)}
function ritualActiveTemplates(){return(state.data.ritualTemplates||[]).filter(candidate=>!candidate.archived)}
function ritualSelection(surface){return ritualRuntime.executionSelections[surface]||null}
function ritualSelectionElements(surface){return surface==='deep'?{select:document.getElementById('ritualSessionSelect'),reason:document.getElementById('ritualSessionReason'),checks:document.getElementById('ritualSessionChecks')}:{select:document.getElementById('ritualQuickSelect'),reason:document.getElementById('ritualQuickReason'),checks:null}}
function ritualSelectionReason(choice,ritual){
  if(choice?.provenance==='linked')return'Ritual vinculado à ação; você pode dispensá-lo nesta execução.';
  if(choice?.provenance==='explicit')return'Ritual escolhido para esta execução.';
  if(choice?.provenance==='suggested')return`Sugestão automática: ${ritual?.name||'ritual'}. Escolha o ritual nominalmente para confirmar o uso de Pausa para processar.`;
  return'Nenhum ritual selecionado.';
}
function ritualRenderExecutionChoice(surface){
  const choice=ritualSelection(surface),elements=ritualSelectionElements(surface),ritual=state.data.ritualTemplates.find(item=>item.id===choice?.ritualId);
  if(elements.reason)elements.reason.textContent=ritualSelectionReason(choice,ritual);
  if(elements.checks){
    const list=ritual?[...ritual.preparation,...ritual.resources,...ritual.cues,...ritual.distractions]:[];
    elements.checks.innerHTML=list.map(item=>`<label><input type="checkbox" data-ritual-check="${escapeHtml(item.id)}"> ${escapeHtml(item.text)}${item.required?' *':''}</label>`).join('');
  }
}
function ritualSetExecutionChoice(surface,controlValue){
  const current=ritualSelection(surface);if(!current)return null;
  const templates=ritualActiveTemplates();let ritualId='',provenance='none';
  if(String(controlValue||'').startsWith('suggested:')){
    const suggestedId=String(controlValue).slice('suggested:'.length);
    if(templates.some(item=>item.id===suggestedId)){ritualId=suggestedId;provenance='suggested'}
  }else if(templates.some(item=>item.id===controlValue)){ritualId=controlValue;provenance='explicit'}
  const next={...current,ritualId,provenance};ritualRuntime.executionSelections[surface]=next;ritualRenderExecutionChoice(surface);return next;
}
function ritualPrepareExecution(surface,domain,itemId,requestedChoice=null){
  if(!['session','deep'].includes(surface))return null;
  const item=ritualSourceItem(domain,itemId),templates=ritualActiveTemplates(),contextKey=ritualContextKey(domain,itemId),linkedId=templates.some(candidate=>candidate.id===item?.ritualId)?item.ritualId:'';
  const requestedId=templates.some(candidate=>candidate.id===requestedChoice?.ritualId)?requestedChoice.ritualId:'';
  const requestedProvenance=RITUAL_PROVENANCE.has(requestedChoice?.provenance)?requestedChoice.provenance:null;
  const suggestion=ritualModel.suggest(templates,{...item,domain});
  let ritualId='',provenance='none';
  if(requestedId&&requestedProvenance==='explicit'){ritualId=requestedId;provenance='explicit'}
  else if(requestedId&&requestedProvenance==='linked'&&requestedId===linkedId){ritualId=requestedId;provenance='linked'}
  else if(requestedId&&requestedProvenance==='suggested'){ritualId=requestedId;provenance='suggested'}
  else if(linkedId){ritualId=linkedId;provenance='linked'}
  else if(suggestion?.ritual?.id){ritualId=suggestion.ritual.id;provenance='suggested'}
  const choice={contextKey,ritualId,provenance};ritualRuntime.executionSelections[surface]=choice;
  const elements=ritualSelectionElements(surface);
  if(elements.select){
    const sentinel=provenance==='suggested'&&ritualId?`suggested:${ritualId}`:'';
    const suggestionOption=sentinel?`<option value="${escapeHtml(sentinel)}">Sugestão automática: ${escapeHtml(suggestion.ritual.name)}</option>`:'';
    elements.select.innerHTML=`<option value="">Sem ritual</option>${suggestionOption}${templates.map(candidate=>`<option value="${escapeHtml(candidate.id)}">${escapeHtml(candidate.name)}</option>`).join('')}`;
    elements.select.value=sentinel||(ritualId||'');
    elements.select.onchange=()=>ritualSetExecutionChoice(surface,elements.select.value);
  }
  ritualRenderExecutionChoice(surface);return choice;
}
function ritualExecutionSnapshot(surface){
  const choice=ritualSelection(surface),ritual=state.data.ritualTemplates.find(item=>item.id===choice?.ritualId&&!item.archived);
  if(!choice||!ritual)return{ritualSnapshot:null,ritualChecklist:[]};
  const includeEncodingCheckpoint=['linked','explicit'].includes(choice.provenance);
  const ritualSnapshot=ritualModel.snapshot(ritual,{includeEncodingCheckpoint});
  const ritualChecklist=surface==='deep'?Array.from(document.querySelectorAll('#ritualSessionChecks [data-ritual-check]')).map(control=>({itemId:control.dataset.ritualCheck,completed:control.checked})):[];
  return{ritualSnapshot,ritualChecklist};
}
function ritualClearExecution(surface){if(['session','deep'].includes(surface))ritualRuntime.executionSelections[surface]=null}
function ritualSessionRender(domain,itemId,requestedChoice=null){return ritualPrepareExecution('deep',domain,itemId,requestedChoice)}

function ritualInstall(){
  const style=document.createElement('style');style.textContent=`.ritual-dialog{width:min(860px,calc(100vw - 24px));border:0;border-radius:20px;padding:0}.ritual-dialog::backdrop{background:#1f1e1b99}.ritual-body{padding:18px;display:grid;grid-template-columns:260px minmax(0,1fr);gap:16px;max-height:75vh;overflow:auto}.ritual-list{display:grid;gap:7px;align-content:start}.ritual-list button{border:1px solid var(--line);border-radius:9px;background:#fff;padding:10px;text-align:left}.ritual-list button.active{border-color:var(--violet);background:var(--violet-soft)}.ritual-list span{display:block;font-size:9px;color:var(--muted);margin-top:3px}.ritual-editor{display:grid;gap:10px}.ritual-editor input,.ritual-editor textarea,.ritual-editor select{width:100%;border:1px solid var(--line);border-radius:9px;padding:10px;background:#fff}.ritual-pair{display:grid;grid-template-columns:1fr 1fr;gap:9px}.ritual-actions{display:flex;gap:7px;flex-wrap:wrap}.ritual-actions button{min-height:35px}.ritual-session{border:1px solid #55544c;border-radius:11px;padding:11px;display:grid;gap:8px}.ritual-session label{display:flex!important;align-items:center;gap:7px!important;font-weight:500!important}.ritual-session input{width:auto!important}.ritual-suggestion{font-size:9px;color:#bbb8b0}@media(max-width:650px){.ritual-body{grid-template-columns:1fr}.ritual-pair{grid-template-columns:1fr}.ritual-list{max-height:180px;overflow:auto}.ritual-actions button{flex:1}}`;document.head.appendChild(style);
  document.body.insertAdjacentHTML('beforeend',`<dialog id="ritualDialog" class="ritual-dialog"><form method="dialog"><div class="today-dialog-head"><div><div class="eyebrow">Arquitetura de ação</div><h2>Rituais</h2></div><button class="quiet-btn" value="cancel">Fechar</button></div><div class="ritual-body"><aside><button id="ritualNew" type="button" class="secondary-btn">Novo ritual</button><div id="ritualList" class="ritual-list"></div></aside><section class="ritual-editor"><div class="ritual-pair"><label>Nome<input id="ritualName"></label><label>Tipo<select id="ritualType"><option value="study">Estudo</option><option value="programming">Programação</option><option value="reading">Leitura</option><option value="writing">Escrita</option><option value="planning">Planejamento</option></select></label></div><label>Contexto<input id="ritualContext"></label><label class="ritual-encoding-option"><input id="ritualEncodingCheckpoint" type="checkbox"><span><strong>Pausa para processar</strong><small>Permite uma pausa manual para reconstruir e relacionar o que foi consumido.</small></span></label><div class="ritual-pair"><label>Preparação, um por linha<textarea id="ritualPreparation"></textarea></label><label>Recursos necessários<textarea id="ritualResources"></textarea></label><label>Sinais positivos para iniciar<textarea id="ritualCues"></textarea></label><label>Distrações a remover<textarea id="ritualDistractions"></textarea></label></div><label>Encerramento opcional<textarea id="ritualClosing"></textarea></label><p id="ritualError" class="ritual-error" role="alert" tabindex="-1" hidden></p><div class="ritual-actions"><button id="ritualSave" type="button" class="primary-btn">Salvar</button><button id="ritualLink" type="button">Vincular à ação</button><button id="ritualUnlink" type="button">Desvincular</button><button id="ritualDuplicate" type="button">Duplicar</button><button id="ritualArchive" type="button">Arquivar</button><button id="ritualDelete" type="button">Excluir</button></div><small id="ritualHelp"></small></section></div></form></dialog>`);
  const checks=document.querySelector('.deep-checks');checks?.insertAdjacentHTML('afterend',`<section id="ritualSession" class="ritual-session"><strong>Ritual da sessão</strong><select id="ritualSessionSelect"><option value="">Sem ritual</option></select><div id="ritualSessionReason" class="ritual-suggestion"></div><div id="ritualSessionChecks"></div></section>`);
  document.getElementById('sessionIntent')?.closest('.field')?.insertAdjacentHTML('beforebegin','<div class="field"><label for="ritualQuickSelect">Ritual opcional</label><select id="ritualQuickSelect"><option value="">Sem ritual</option></select><small id="ritualQuickReason">Nenhum ritual selecionado.</small></div>');
}
function ritualSetError(message=''){const target=document.getElementById('ritualError');if(!target)return;target.textContent=message;target.hidden=!message}
function ritualRender(){
  const action=ritualRuntime.action,item=action&&state.data[action.domain]?.find(x=>x.id===action.itemId);
  ritualList.innerHTML=state.data.ritualTemplates.map(r=>`<button type="button" class="${r.id===ritualRuntime.editing?'active':''}" data-ritual-select="${escapeHtml(r.id)}"><strong>${escapeHtml(r.name)}</strong><span>${r.actionType} · v${r.version}${r.encodingCheckpoint===true?' · pausa para processar':''}${r.archived?' · arquivado':''}${item?.ritualId===r.id?' · vinculado':''}</span></button>`).join('');
  const r=ritualCurrent();ritualName.value=r?.name||'';ritualType.value=r?.actionType||'study';ritualContext.value=r?.context||'';ritualEncodingCheckpoint.checked=r?.encodingCheckpoint===true;ritualPreparation.value=(r?.preparation||[]).map(x=>x.text).join('\n');ritualResources.value=(r?.resources||[]).map(x=>x.text).join('\n');ritualCues.value=(r?.cues||[]).map(x=>x.text).join('\n');ritualDistractions.value=(r?.distractions||[]).map(x=>x.text).join('\n');ritualClosing.value=(r?.closing||[]).map(x=>x.text).join('\n');ritualArchive.textContent=r?.archived?'Reativar':'Arquivar';ritualHelp.textContent=item?`Ação: ${item.title}. O vínculo só muda após confirmação explícita.`:'Gerencie templates reutilizáveis.';ritualSetError('');
}
function ritualOpen(domain,itemId){ritualRuntime.action={domain,itemId};const item=state.data[domain]?.find(x=>x.id===itemId),suggestion=ritualModel.suggest(state.data.ritualTemplates,{...item,domain});ritualRuntime.editing=item?.ritualId||suggestion?.ritual.id||state.data.ritualTemplates[0]?.id||null;ritualRender();ritualDialog.showModal()}
function ritualEnhanceGrid(domain){document.querySelectorAll(`#${domain}Grid .item-card`).forEach(card=>{const edit=card.querySelector('[data-edit]'),actions=card.querySelector('.card-actions');if(edit&&actions&&!actions.querySelector('[data-ritual]'))actions.insertAdjacentHTML('beforeend',`<button data-ritual="${edit.dataset.edit}">Ritual</button>`)})}
CompassoFeatures.register('rituals',{order:50,afterGrid:ritualEnhanceGrid});

ritualInstall();
ritualNew.onclick=()=>{ritualRuntime.editing=null;ritualRender();ritualName.focus()};
ritualSave.onclick=()=>{
  const existing=ritualCurrent(),now=new Date().toISOString(),patch={name:ritualName.value,actionType:ritualType.value,context:ritualContext.value,encodingCheckpoint:ritualEncodingCheckpoint.checked,preparation:ritualLines(ritualPreparation.value),resources:ritualLines(ritualResources.value),cues:ritualLines(ritualCues.value),distractions:ritualLines(ritualDistractions.value),closing:ritualLines(ritualClosing.value)};
  try{
    if(existing){const updated=ritualModel.update(existing,patch,now),index=state.data.ritualTemplates.findIndex(item=>item.id===existing.id);state.data.ritualTemplates[index]=updated}
    else{const ritual=ritualModel.create({id:`ritual-${Date.now()}`,...patch,createdAt:now,updatedAt:now},now);state.data.ritualTemplates.push(ritual);ritualRuntime.editing=ritual.id}
    saveData('Ritual salvo');ritualRender();
  }catch(error){if(error?.code!=='encoding-checkpoint-invalid')throw error;ritualSetError('A configuração de Pausa para processar é inválida. Revise e tente novamente.');requestAnimationFrame(()=>ritualError.focus())}
};
ritualDuplicate.onclick=()=>{const r=ritualCurrent();if(!r)return;const copy=ritualModel.duplicate(r,`ritual-${Date.now()}`);state.data.ritualTemplates.push(copy);ritualRuntime.editing=copy.id;saveData('Ritual duplicado');ritualRender()};
ritualArchive.onclick=()=>{const r=ritualCurrent();if(!r)return;r.archived=!r.archived;r.updatedAt=new Date().toISOString();saveData(r.archived?'Ritual arquivado':'Ritual reativado');ritualRender()};
ritualDelete.onclick=()=>{const r=ritualCurrent();if(!r||!confirm('Excluir este ritual? Snapshots de sessões concluídas serão preservados.'))return;state.data.ritualTemplates=state.data.ritualTemplates.filter(x=>x.id!==r.id);['reading','study','goal'].forEach(domain=>state.data[domain].forEach(item=>{if(item.ritualId===r.id)item.ritualId=null}));ritualRuntime.editing=state.data.ritualTemplates[0]?.id||null;saveData('Ritual excluído');ritualRender()};
ritualLink.onclick=()=>{const action=ritualRuntime.action,ritual=ritualCurrent(),item=action&&state.data[action.domain]?.find(x=>x.id===action.itemId);if(!item||!ritual)return;item.ritualId=ritual.id;item.updatedAt=new Date().toISOString();saveData('Ritual vinculado explicitamente');ritualRender()};
ritualUnlink.onclick=()=>{const action=ritualRuntime.action,item=action&&state.data[action.domain]?.find(x=>x.id===action.itemId);if(!item)return;item.ritualId=null;item.updatedAt=new Date().toISOString();saveData('Ritual desvinculado');ritualRender()};
document.addEventListener('click',event=>{const trigger=event.target.closest('[data-ritual]');if(trigger){const[domain,id]=trigger.dataset.ritual.split(':');ritualOpen(domain,id)}const select=event.target.closest('[data-ritual-select]');if(select){ritualRuntime.editing=select.dataset.ritualSelect;ritualRender()}});
