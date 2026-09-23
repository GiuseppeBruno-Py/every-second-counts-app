/* Compasso · Experimentos comportamentais verificáveis */
(function(root,factory){
  const context=root.CompassoCapabilityContextModel||(typeof require==='function'?require('./capability-context-model.js'):null);
  const api=factory(context);
  root.CompassoBehavioralExperimentModel=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(context){
  const DECISIONS=Object.freeze(['keep','adjust','abandon']);
  const PRESETS=Object.freeze([7,14,21,30]);
  const clean=value=>typeof value==='string'?value.trim():'';
  const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
  const iso=value=>typeof value==='string'&&!Number.isNaN(Date.parse(value))?value:'';
  const timestamp=options=>iso(options?.now)||new Date().toISOString();
  function failure(code,message){const error=new TypeError(message);error.code=code;return error}
  function date(value){
    const text=clean(value);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(text))return'';
    const parsed=new Date(`${text}T00:00:00.000Z`);
    return Number.isNaN(parsed.getTime())||parsed.toISOString().slice(0,10)!==text?'':text;
  }
  function required(value,code,message){const text=clean(value);if(!text)throw failure(code,message);if(text.length>1000)throw failure(code,`${message} Use até 1000 caracteres.`);return text}
  function period(startDate,reviewDate){
    const start=date(startDate),review=date(reviewDate);
    if(!start)throw failure('start-date-invalid','Informe uma data de início válida.');
    if(!review||review<=start)throw failure('review-date-invalid','A revisão deve acontecer depois do início.');
    return{startDate:start,reviewDate:review};
  }
  function reviewDateForPreset(startDate,days){
    const start=date(startDate);
    if(!start)throw failure('start-date-invalid','Informe uma data de início válida.');
    if(!PRESETS.includes(Number(days)))throw failure('preset-invalid','Escolha um período válido.');
    const result=new Date(`${start}T00:00:00.000Z`);
    result.setUTCDate(result.getUTCDate()+Number(days));
    return result.toISOString().slice(0,10);
  }
  function normalize(value){
    if(!value||typeof value!=='object'||Array.isArray(value))return null;
    const id=clean(value.id),capabilityRef=context?.normalizeCapabilityRef?.(value.capabilityRef);
    const hypothesis=clean(value.hypothesis),practice=clean(value.practice),expectedOutcome=clean(value.expectedOutcome),evidencePlan=clean(value.evidencePlan);
    const startDate=date(value.startDate),reviewDate=date(value.reviewDate);
    if(!id||!capabilityRef||![hypothesis,practice,expectedOutcome,evidencePlan].every(text=>text&&text.length<=1000)||!startDate||!reviewDate||reviewDate<=startDate)return null;
    const decision=DECISIONS.includes(value.decision)?value.decision:null;
    const resultNote=decision?clean(value.resultNote):'';
    if(decision&&!resultNote)return null;
    const createdAt=iso(value.createdAt)||iso(value.updatedAt)||new Date(0).toISOString();
    const updatedAt=iso(value.updatedAt)||createdAt;
    return{...clone(value),id,schemaVersion:1,capabilityRef,hypothesis,practice,expectedOutcome,evidencePlan,startDate,reviewDate,decision,resultNote,reviewedAt:decision?(iso(value.reviewedAt)||updatedAt):null,createdAt,updatedAt};
  }
  function normalizeCollection(value){return(Array.isArray(value)?value:[]).map(normalize).filter(Boolean)}
  function fields(input){return{
    hypothesis:required(input?.hypothesis,'hypothesis-required','Descreva a hipótese.'),
    practice:required(input?.practice,'practice-required','Descreva a prática que será repetida.'),
    expectedOutcome:required(input?.expectedOutcome,'expected-outcome-required','Descreva o resultado esperado.'),
    evidencePlan:required(input?.evidencePlan,'evidence-plan-required','Descreva como observará o resultado.'),
    ...period(input?.startDate,input?.reviewDate)
  }}
  function create(input,options={}){
    const capabilityRef=context?.normalizeCapabilityRef?.(input?.capabilityRef);
    if(!capabilityRef)throw failure('capability-required','Selecione uma capacidade ativa.');
    const now=timestamp(options);
    return{id:clean(options.id)||clean(options.idFactory?.('behavioral-experiment'))||globalThis.crypto?.randomUUID?.()||`behavioral-experiment-${Date.now()}-${Math.random().toString(36).slice(2,9)}`,
      schemaVersion:1,capabilityRef,...fields(input),decision:null,resultNote:'',reviewedAt:null,createdAt:now,updatedAt:now};
  }
  function update(value,input,options={}){
    const current=normalize(value);
    if(!current)throw failure('experiment-invalid','Experimento inválido.');
    if(current.decision)throw failure('experiment-reviewed','Um experimento revisado não pode ser editado.');
    return{...current,...fields(input),updatedAt:timestamp(options)};
  }
  function review(value,input,options={}){
    const current=normalize(value);
    if(!current)throw failure('experiment-invalid','Experimento inválido.');
    if(current.decision)throw failure('experiment-reviewed','Este experimento já foi revisado.');
    const decision=clean(input?.decision);
    if(!DECISIONS.includes(decision))throw failure('decision-invalid','Escolha manter, ajustar ou abandonar.');
    const resultNote=required(input?.resultNote,'result-required','Descreva o que observou.');
    const now=timestamp(options);
    return{...current,decision,resultNote,reviewedAt:now,updatedAt:now};
  }
  function deleteFromState(input,id,options={}){
    const state=clone(input)||{},key=clean(id),items=normalizeCollection(state.behavioralExperiments);
    if(!key||!items.some(item=>item.id===key))throw failure('experiment-not-found','Experimento não encontrado.');
    const now=timestamp(options),sync=state._sync&&typeof state._sync==='object'?state._sync:{};
    sync.tombstones=sync.tombstones&&typeof sync.tombstones==='object'?sync.tombstones:{};
    sync.tombstones[`behavioralExperiments:${key}`]=now;
    sync.updatedAt=now;
    return{...state,behavioralExperiments:items.filter(item=>item.id!==key),_sync:sync};
  }
  return Object.freeze({DECISIONS,PRESETS,date,reviewDateForPreset,normalize,normalizeCollection,create,update,review,deleteFromState});
});
