/* Compasso · Experimentos comportamentais na área de Capacidades */
const behavioralExperimentModel=globalThis.CompassoBehavioralExperimentModel;
if(!behavioralExperimentModel)throw new Error('CompassoBehavioralExperimentModel não foi carregado.');
const behavioralExperimentRuntime={mode:'create',id:null,returnFocus:null,busy:false};
const behavioralExperimentElement=id=>document.getElementById(id);
const behavioralExperimentClone=value=>typeof structuredClone==='function'?structuredClone(value):JSON.parse(JSON.stringify(value));
const behavioralExperimentItems=()=>behavioralExperimentModel.normalizeCollection(state.data.behavioralExperiments)
  .sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)||a.id.localeCompare(b.id));
const behavioralExperimentFind=id=>behavioralExperimentItems().find(item=>item.id===id)||null;
function behavioralExperimentDate(value){
  if(!value)return'';
  const [year,month,day]=value.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(year,month-1,day)));
}
function behavioralExperimentInstall(){
  const view=behavioralExperimentElement('capabilitiesView');
  if(view&&!behavioralExperimentElement('behavioralExperimentSection'))view.insertAdjacentHTML('beforeend',`
    <section class="behavioral-experiment-section" id="behavioralExperimentSection" aria-labelledby="behavioralExperimentHeading">
      <div class="behavioral-experiment-heading"><div><h3 id="behavioralExperimentHeading">Experimentos comportamentais</h3><p>Teste uma prática repetida e revise o que observou. A decisão é sua.</p></div><button class="secondary-btn" type="button" data-experiment-new>Novo experimento</button></div>
      <div id="behavioralExperimentList" class="behavioral-experiment-list"></div>
    </section>`);
  if(!behavioralExperimentElement('behavioralExperimentDialog'))document.body.insertAdjacentHTML('beforeend',`
    <dialog class="learning-outcome-dialog behavioral-experiment-dialog" id="behavioralExperimentDialog" aria-labelledby="behavioralExperimentDialogTitle">
      <form id="behavioralExperimentForm" novalidate>
        <div class="learning-outcome-dialog-head"><div><div class="eyebrow">Prática e evidência</div><h2 id="behavioralExperimentDialogTitle">Novo experimento</h2></div><button class="icon-btn" type="button" data-experiment-cancel aria-label="Fechar">${icon('x')}</button></div>
        <div class="learning-outcome-form" id="behavioralExperimentPlanFields">
          <label for="behavioralExperimentCapability">Capacidade</label><select id="behavioralExperimentCapability" name="capabilityId"></select>
          <label for="behavioralExperimentHypothesis">Hipótese: se eu fizer X…</label><textarea id="behavioralExperimentHypothesis" name="hypothesis" maxlength="1000"></textarea>
          <label for="behavioralExperimentPractice">Prática: o que será repetido?</label><textarea id="behavioralExperimentPractice" name="practice" maxlength="1000"></textarea>
          <label for="behavioralExperimentExpected">Resultado esperado: o que espero observar?</label><textarea id="behavioralExperimentExpected" name="expectedOutcome" maxlength="1000"></textarea>
          <label for="behavioralExperimentEvidence">Evidência: como saberei se aconteceu?</label><textarea id="behavioralExperimentEvidence" name="evidencePlan" maxlength="1000"></textarea>
          <label for="behavioralExperimentStart">Início</label><input id="behavioralExperimentStart" name="startDate" type="date">
          <label for="behavioralExperimentPreset">Período até a revisão</label><select id="behavioralExperimentPreset" name="preset"><option value="7">7 dias</option><option value="14">14 dias</option><option value="21">21 dias</option><option value="30">30 dias</option><option value="custom">Personalizado</option></select>
          <p class="learning-outcome-hint">Os períodos são opções de planejamento; 21 dias não são uma duração necessária.</p>
          <label for="behavioralExperimentReviewDate">Revisar em</label><input id="behavioralExperimentReviewDate" name="reviewDate" type="date">
        </div>
        <div class="learning-outcome-form" id="behavioralExperimentReviewFields" hidden>
          <p id="behavioralExperimentReviewSummary"></p>
          <label for="behavioralExperimentResult">O que aconteceu? Que evidência você observou?</label><textarea id="behavioralExperimentResult" name="resultNote" maxlength="1000"></textarea>
          <label for="behavioralExperimentDecision">Decisão</label><select id="behavioralExperimentDecision" name="decision"><option value="">Selecione</option><option value="keep">Manter</option><option value="adjust">Ajustar</option><option value="abandon">Abandonar</option></select>
          <p class="learning-outcome-hint">A decisão não altera automaticamente sua capacidade nem sua próxima tentativa.</p>
        </div>
        <p class="learning-outcome-error behavioral-experiment-error" id="behavioralExperimentError" role="alert" hidden></p>
        <div class="learning-outcome-dialog-foot"><span></span><button class="secondary-btn" type="button" data-experiment-cancel>Cancelar</button><button class="primary-btn" type="submit" id="behavioralExperimentSubmit">Salvar experimento</button></div>
      </form>
    </dialog>`);
  const form=behavioralExperimentElement('behavioralExperimentForm');
  form?.addEventListener('submit',behavioralExperimentSubmit);
  form?.elements.startDate.addEventListener('change',behavioralExperimentUpdateDate);
  form?.elements.preset.addEventListener('change',behavioralExperimentUpdateDate);
  form?.elements.reviewDate.addEventListener('change',()=>{form.elements.preset.value='custom'});
  behavioralExperimentElement('behavioralExperimentDialog')?.addEventListener('cancel',event=>{event.preventDefault();behavioralExperimentClose()});
  behavioralExperimentElement('behavioralExperimentDialog')?.addEventListener('click',event=>{if(event.target===event.currentTarget)behavioralExperimentClose()});
}
function behavioralExperimentRender(){
  const list=behavioralExperimentElement('behavioralExperimentList');
  if(!list)return;
  const outcomes=new Map((state.data.learningOutcomes||[]).map(item=>[item.id,item]));
  const items=behavioralExperimentItems();
  list.innerHTML=items.length?items.map(item=>{
    const outcome=outcomes.get(item.capabilityRef.outcomeId);
    const label=outcome?.capability||'Capacidade removida';
    const decision={keep:'Manter',adjust:'Ajustar',abandon:'Abandonar'}[item.decision];
    return `<article class="behavioral-experiment-card" data-experiment-card="${escapeHtml(item.id)}">
      <div class="behavioral-experiment-card-head"><strong>${escapeHtml(label)}</strong><span>${decision?`Revisado · ${decision}`:'Em prática'}</span></div>
      <p><b>Hipótese:</b> ${escapeHtml(item.hypothesis)}</p><p><b>Prática:</b> ${escapeHtml(item.practice)}</p>
      <details><summary>Plano e observação</summary><p><b>Resultado esperado:</b> ${escapeHtml(item.expectedOutcome)}</p><p><b>Como observar:</b> ${escapeHtml(item.evidencePlan)}</p><p><b>Próxima tentativa ao criar:</b> ${escapeHtml(item.capabilityRef.attemptText)}</p>${decision?`<p><b>Observado:</b> ${escapeHtml(item.resultNote)}</p>`:''}</details>
      <p class="behavioral-experiment-period">${escapeHtml(behavioralExperimentDate(item.startDate))} → ${escapeHtml(behavioralExperimentDate(item.reviewDate))}</p>
      <div class="behavioral-experiment-actions">${decision?'':`<button class="secondary-btn" type="button" data-experiment-edit="${escapeHtml(item.id)}">Editar</button><button class="primary-btn" type="button" data-experiment-review="${escapeHtml(item.id)}">Revisar</button>`}<button class="quiet-btn" type="button" data-experiment-delete="${escapeHtml(item.id)}">Excluir</button></div>
    </article>`;
  }).join(''):'<p class="learning-outcome-hint">Nenhum experimento registrado. Comece com uma hipótese observável.</p>';
  const create=behavioralExperimentElement('behavioralExperimentSection')?.querySelector('[data-experiment-new]');
  if(create)create.disabled=!(state.data.learningOutcomes||[]).some(item=>item.status==='active');
}
function behavioralExperimentError(message='',field){
  const target=behavioralExperimentElement('behavioralExperimentError');
  if(target){target.textContent=message;target.hidden=!message}
  if(field){field.setAttribute('aria-invalid','true');field.focus()}
}
function behavioralExperimentBusy(value){
  behavioralExperimentRuntime.busy=Boolean(value);
  behavioralExperimentElement('behavioralExperimentForm')?.querySelectorAll('button,input,select,textarea').forEach(control=>{control.disabled=Boolean(value)});
}
function behavioralExperimentUpdateDate(){
  const form=behavioralExperimentElement('behavioralExperimentForm');
  if(!form||form.elements.preset.value==='custom')return;
  try{form.elements.reviewDate.value=behavioralExperimentModel.reviewDateForPreset(form.elements.startDate.value,form.elements.preset.value)}catch{form.elements.reviewDate.value=''}
}
function behavioralExperimentOpen(mode,id,trigger){
  const item=id?behavioralExperimentFind(id):null;
  if(id&&!item)return;
  if(item?.decision&&mode!=='review')return;
  const form=behavioralExperimentElement('behavioralExperimentForm'),dialog=behavioralExperimentElement('behavioralExperimentDialog');
  if(!form||!dialog)return;
  form.reset();form.querySelectorAll('[aria-invalid]').forEach(field=>field.removeAttribute('aria-invalid'));
  behavioralExperimentError();
  behavioralExperimentRuntime.mode=mode;behavioralExperimentRuntime.id=id||null;behavioralExperimentRuntime.returnFocus=trigger||null;
  const plan=mode!=='review';
  behavioralExperimentElement('behavioralExperimentPlanFields').hidden=!plan;
  behavioralExperimentElement('behavioralExperimentReviewFields').hidden=plan;
  behavioralExperimentElement('behavioralExperimentDialogTitle').textContent=mode==='create'?'Novo experimento':mode==='edit'?'Editar experimento':'Revisar experimento';
  behavioralExperimentElement('behavioralExperimentSubmit').textContent=mode==='review'?'Salvar revisão':mode==='edit'?'Salvar alterações':'Salvar experimento';
  const options=(state.data.learningOutcomes||[]).filter(outcome=>outcome.status==='active');
  form.elements.capabilityId.innerHTML=options.map(outcome=>`<option value="${escapeHtml(outcome.id)}">${escapeHtml(outcome.capability)}</option>`).join('');
  if(mode==='create'&&!options.length)return;
  if(item){
    if(!options.some(outcome=>outcome.id===item.capabilityRef.outcomeId))form.elements.capabilityId.insertAdjacentHTML('beforeend',`<option value="${escapeHtml(item.capabilityRef.outcomeId)}">Capacidade anterior</option>`);
    form.elements.capabilityId.value=item.capabilityRef.outcomeId;
    form.elements.capabilityId.disabled=true;
    for(const name of ['hypothesis','practice','expectedOutcome','evidencePlan','startDate','reviewDate'])form.elements[name].value=item[name];
    form.elements.preset.value='custom';
    behavioralExperimentElement('behavioralExperimentReviewSummary').textContent=`Hipótese: ${item.hypothesis} · Evidência planejada: ${item.evidencePlan}`;
  }else{
    form.elements.capabilityId.disabled=false;
    form.elements.startDate.value=new Date().toISOString().slice(0,10);
    form.elements.preset.value='7';behavioralExperimentUpdateDate();
  }
  dialog.showModal();
  (plan?form.elements.capabilityId:form.elements.resultNote).focus();
}
function behavioralExperimentClose(force=false){
  if(behavioralExperimentRuntime.busy&&!force)return;
  const dialog=behavioralExperimentElement('behavioralExperimentDialog');
  if(dialog?.open)dialog.close();
  const focus=behavioralExperimentRuntime.returnFocus;
  behavioralExperimentRuntime.returnFocus=null;behavioralExperimentRuntime.id=null;
  if(focus?.isConnected)focus.focus();
  else behavioralExperimentElement('behavioralExperimentSection')?.querySelector('[data-experiment-new]')?.focus();
}
async function behavioralExperimentPersist(candidate,message){
  if(behavioralExperimentRuntime.busy)return false;
  const previous=state.data;
  behavioralExperimentBusy(true);behavioralExperimentError();
  state.data=candidate;
  const saved=await saveData(message);
  if(saved){behavioralExperimentBusy(false);behavioralExperimentClose(true);return true}
  state.data=previous;
  try{await window.CompassoStorage.save(STORAGE_KEY,previous)}catch{}
  renderAll();behavioralExperimentBusy(false);
  behavioralExperimentError('Não foi possível salvar. Seus campos foram preservados; tente novamente.');
  return false;
}
async function behavioralExperimentSubmit(event){
  event.preventDefault();
  if(behavioralExperimentRuntime.busy)return;
  const form=event.currentTarget,mode=behavioralExperimentRuntime.mode,item=behavioralExperimentFind(behavioralExperimentRuntime.id);
  form.querySelectorAll('[aria-invalid]').forEach(field=>field.removeAttribute('aria-invalid'));
  try{
    let next;
    if(mode==='review'){
      next=behavioralExperimentModel.review(item,{resultNote:form.elements.resultNote.value,decision:form.elements.decision.value});
    }else{
      const input={hypothesis:form.elements.hypothesis.value,practice:form.elements.practice.value,expectedOutcome:form.elements.expectedOutcome.value,evidencePlan:form.elements.evidencePlan.value,startDate:form.elements.startDate.value,reviewDate:form.elements.reviewDate.value};
      if(mode==='edit')next=behavioralExperimentModel.update(item,input);
      else{
        const outcome=(state.data.learningOutcomes||[]).find(value=>value.id===form.elements.capabilityId.value&&value.status==='active');
        next=behavioralExperimentModel.create({...input,capabilityRef:globalThis.CompassoCapabilityContextModel.createCapabilityRef(outcome)});
      }
    }
    const candidate=behavioralExperimentClone(state.data);
    candidate.behavioralExperiments=mode==='create'?[next,...(candidate.behavioralExperiments||[])]:candidate.behavioralExperiments.map(value=>value.id===next.id?next:value);
    await behavioralExperimentPersist(candidate,mode==='review'?'Experimento revisado':mode==='edit'?'Experimento atualizado':'Experimento criado');
  }catch(error){
    const field={
      'capability-required':form.elements.capabilityId,'hypothesis-required':form.elements.hypothesis,'practice-required':form.elements.practice,
      'expected-outcome-required':form.elements.expectedOutcome,'evidence-plan-required':form.elements.evidencePlan,'start-date-invalid':form.elements.startDate,
      'review-date-invalid':form.elements.reviewDate,'decision-invalid':form.elements.decision,'result-required':form.elements.resultNote
    }[error.code];
    behavioralExperimentError(error.message||'Revise os campos.',field);
  }
}
async function behavioralExperimentDelete(id){
  const item=behavioralExperimentFind(id);
  if(!item||!confirm('Excluir este experimento? A capacidade e as evidências serão preservadas.'))return;
  const candidate=behavioralExperimentModel.deleteFromState(state.data,id);
  const previous=state.data;
  state.data=candidate;
  if(await saveData('Experimento excluído'))return;
  state.data=previous;
  try{await window.CompassoStorage.save(STORAGE_KEY,previous)}catch{}
  renderAll();
}
CompassoFeatures.register('behavioral-experiments',{order:69,install:behavioralExperimentInstall,afterRender:behavioralExperimentRender});
CompassoFeatures.action('[data-experiment-new]',({target})=>behavioralExperimentOpen('create',null,target));
CompassoFeatures.action('[data-experiment-edit]',({target})=>behavioralExperimentOpen('edit',target.dataset.experimentEdit,target));
CompassoFeatures.action('[data-experiment-review]',({target})=>behavioralExperimentOpen('review',target.dataset.experimentReview,target));
CompassoFeatures.action('[data-experiment-delete]',({target})=>behavioralExperimentDelete(target.dataset.experimentDelete));
CompassoFeatures.action('[data-experiment-cancel]',()=>behavioralExperimentClose());
