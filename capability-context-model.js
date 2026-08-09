/* Compasso · Modelo puro de contexto transversal de capacidades */
(function(root,factory){
  const learningOutcomeModel=root.CompassoLearningOutcomeModel||(typeof require==='function'?require('./learning-outcome-model.js'):null);
  const api=factory(learningOutcomeModel);
  root.CompassoCapabilityContextModel=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(typeof state!=='undefined'&&state?.data)state.data.learningSignals=api.normalizeSignalCollection(state.data.learningSignals);
})(typeof globalThis!=='undefined'?globalThis:this,function(learningOutcomeModel){
  const EPOCH='1970-01-01T00:00:00.000Z';
  const SIGNAL_KINDS=Object.freeze(['feedback','gap','question','insight']);
  const SIGNAL_ORIGINS=Object.freeze(['learner','confirmed-suggestion']);
  const SOURCE_TYPES=Object.freeze(['execution','evidence','weekly-review']);
  const DECISIONS=Object.freeze(['keep','revise']);
  const clean=value=>typeof value==='string'?value.trim():'';
  const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
  const validIso=value=>typeof value==='string'&&value.trim()&&!Number.isNaN(Date.parse(value))?value:'';
  const timestamp=options=>validIso(options?.now)||new Date().toISOString();
  const makeId=(prefix,options={})=>clean(options.id)||clean(options.idFactory?.(prefix))||globalThis.crypto?.randomUUID?.()||`${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,9)}`;
  function failure(code,message){const error=new TypeError(message);error.code=code;return error}

  function normalizeCapabilityRef(value){
    if(!value||typeof value!=='object'||Array.isArray(value))return null;
    const outcomeId=clean(value.outcomeId),attemptId=clean(value.attemptId),attemptText=clean(value.attemptText);
    return outcomeId&&attemptId&&attemptText?{outcomeId,attemptId,attemptText}:null;
  }

  function createCapabilityRef(outcome,{allowArchived=false}={}){
    const normalized=learningOutcomeModel?.normalizeOutcome?.(outcome);
    if(!normalized||(!allowArchived&&normalized.status!=='active'))return null;
    return normalizeCapabilityRef({outcomeId:normalized.id,attemptId:normalized.nextAttempt.id,attemptText:normalized.nextAttempt.text});
  }

  function resolveCapabilityRef(value,outcomes=[]){
    const capabilityRef=normalizeCapabilityRef(value);
    if(!capabilityRef)return{capabilityRef:null,outcome:null,available:false,active:false,current:false,attemptText:''};
    const outcome=(Array.isArray(outcomes)?outcomes:[]).map(item=>learningOutcomeModel?.normalizeOutcome?.(item)).find(item=>item?.id===capabilityRef.outcomeId)||null;
    const current=Boolean(outcome&&outcome.nextAttempt.id===capabilityRef.attemptId);
    return{
      capabilityRef,
      outcome,
      available:Boolean(outcome),
      active:Boolean(outcome?.status==='active'),
      current,
      attemptText:current?outcome.nextAttempt.text:capabilityRef.attemptText
    };
  }

  const refKey=value=>{const ref=normalizeCapabilityRef(value);return ref?`${ref.outcomeId}:${ref.attemptId}`:''};

  function normalizeTodayItem(value){
    if(!value||typeof value!=='object'||Array.isArray(value)||value.type!=='capability-attempt')return null;
    const id=clean(value.id),capabilityRef=normalizeCapabilityRef(value.capabilityRef);
    if(!id||!capabilityRef)return null;
    const createdAt=validIso(value.createdAt)||EPOCH;
    return{...clone(value),id,type:'capability-attempt',capabilityRef,completedAt:validIso(value.completedAt)||null,createdAt};
  }

  function createTodayItem(outcome,options={}){
    const capabilityRef=createCapabilityRef(outcome);
    if(!capabilityRef)throw failure('capability-unavailable','A capacidade precisa estar ativa e ter uma tentativa atual.');
    return{id:makeId('capability-today',options),type:'capability-attempt',capabilityRef,completedAt:null,createdAt:timestamp(options)};
  }

  function addTodayItem(planInput,outcome,options={}){
    const plan=planInput&&typeof planInput==='object'&&!Array.isArray(planInput)?clone(planInput):{};
    plan.items=Array.isArray(plan.items)?plan.items:[];
    const next=createTodayItem(outcome,options),key=refKey(next.capabilityRef);
    if(!plan.items.some(item=>item?.type==='capability-attempt'&&refKey(item.capabilityRef)===key))plan.items.push(next);
    plan.updatedAt=timestamp(options);
    return plan;
  }

  function normalizeSourceRef(value){
    if(value==null)return null;
    if(!value||typeof value!=='object'||Array.isArray(value))return null;
    const type=clean(value.type),id=clean(value.id);
    return SOURCE_TYPES.includes(type)&&id?{type,id}:null;
  }

  function normalizeSignal(value){
    if(!value||typeof value!=='object'||Array.isArray(value))return null;
    const id=clean(value.id),capabilityRef=normalizeCapabilityRef(value.capabilityRef),kind=clean(value.kind),text=clean(value.text);
    if(!id||!capabilityRef||!SIGNAL_KINDS.includes(kind)||!text)return null;
    const createdAt=validIso(value.createdAt)||validIso(value.updatedAt)||EPOCH;
    const updatedAt=validIso(value.updatedAt)||createdAt;
    const origin=SIGNAL_ORIGINS.includes(value.origin)?value.origin:'learner';
    return{...clone(value),id,schemaVersion:1,capabilityRef,kind,text,sourceRef:normalizeSourceRef(value.sourceRef),origin,createdAt,updatedAt};
  }

  function normalizeSignalCollection(value){
    if(!Array.isArray(value))return[];
    const records=new Map();
    for(const candidate of value){
      const signal=normalizeSignal(candidate);if(!signal)continue;
      const current=records.get(signal.id);
      if(!current||signal.updatedAt>current.updatedAt)records.set(signal.id,signal);
    }
    return[...records.values()].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)||b.createdAt.localeCompare(a.createdAt)||a.id.localeCompare(b.id));
  }

  function createSignal(input={},options={}){
    const capabilityRef=normalizeCapabilityRef(input.capabilityRef),kind=clean(input.kind),text=clean(input.text);
    if(!capabilityRef)throw failure('capability-ref-required','Selecione uma capacidade e tentativa válidas.');
    if(!SIGNAL_KINDS.includes(kind))throw failure('signal-kind-invalid','Selecione um tipo de sinal válido.');
    if(!text)throw failure('signal-text-required','Descreva o sinal de aprendizagem.');
    const now=timestamp(options);
    return{id:makeId('learning-signal',options),schemaVersion:1,capabilityRef,kind,text,sourceRef:normalizeSourceRef(input.sourceRef),origin:input.origin==='confirmed-suggestion'?'confirmed-suggestion':'learner',createdAt:now,updatedAt:now};
  }

  function updateSignal(value,input={},options={}){
    const current=normalizeSignal(value);if(!current)throw failure('signal-invalid','Sinal de aprendizagem inválido.');
    const has=key=>Object.prototype.hasOwnProperty.call(input,key);
    const kind=has('kind')?clean(input.kind):current.kind,text=has('text')?clean(input.text):current.text;
    if(!SIGNAL_KINDS.includes(kind))throw failure('signal-kind-invalid','Selecione um tipo de sinal válido.');
    if(!text)throw failure('signal-text-required','Descreva o sinal de aprendizagem.');
    return{...current,kind,text,sourceRef:has('sourceRef')?normalizeSourceRef(input.sourceRef):current.sourceRef,updatedAt:timestamp(options)};
  }

  function deleteSignal(stateInput,id,options={}){
    const source=stateInput&&typeof stateInput==='object'&&!Array.isArray(stateInput)?clone(stateInput):{};
    const key=clean(id),signals=normalizeSignalCollection(source.learningSignals);
    if(!key||!signals.some(item=>item.id===key))throw failure('signal-not-found','Sinal de aprendizagem não encontrado.');
    const now=timestamp(options),sync=source._sync&&typeof source._sync==='object'&&!Array.isArray(source._sync)?source._sync:{};
    sync.tombstones=sync.tombstones&&typeof sync.tombstones==='object'&&!Array.isArray(sync.tombstones)?sync.tombstones:{};
    sync.tombstones[`learningSignals:${key}`]=now;sync.updatedAt=now;
    return{...source,learningSignals:signals.filter(item=>item.id!==key),_sync:sync};
  }

  function normalizeReflection(value){
    if(!value||typeof value!=='object'||Array.isArray(value))return null;
    const capabilityRef=normalizeCapabilityRef(value.capabilityRef),decision=clean(value.decision),decidedAttemptText=clean(value.decidedAttemptText),decidedAt=validIso(value.decidedAt);
    if(!capabilityRef||!DECISIONS.includes(decision)||!decidedAttemptText||!decidedAt)return null;
    return{...clone(value),capabilityRef,reflection:clean(value.reflection),decision,decidedAttemptText,decidedAt};
  }

  function createReflection(input={},options={}){
    const capabilityRef=normalizeCapabilityRef(input.capabilityRef),decision=clean(input.decision);
    const decidedAttemptText=clean(input.decidedAttemptText)||(decision==='keep'?capabilityRef?.attemptText:'');
    if(!capabilityRef)throw failure('capability-ref-required','Selecione uma capacidade e tentativa válidas.');
    if(!DECISIONS.includes(decision))throw failure('decision-required','Escolha manter ou revisar a tentativa.');
    if(!decidedAttemptText)throw failure('attempt-required','Informe a tentativa revisada.');
    return{capabilityRef,reflection:clean(input.reflection),decision,decidedAttemptText,decidedAt:timestamp(options)};
  }

  function normalizeReflections(value){
    if(!Array.isArray(value))return[];
    const byOutcome=new Map();
    for(const candidate of value){
      const item=normalizeReflection(candidate);if(!item)continue;
      const current=byOutcome.get(item.capabilityRef.outcomeId);
      if(!current||item.decidedAt>=current.decidedAt)byOutcome.set(item.capabilityRef.outcomeId,item);
    }
    return[...byOutcome.values()].sort((a,b)=>b.decidedAt.localeCompare(a.decidedAt)||a.capabilityRef.outcomeId.localeCompare(b.capabilityRef.outcomeId));
  }

  function upsertReflection(reviewInput,reflectionInput,options={}){
    const review=reviewInput&&typeof reviewInput==='object'&&!Array.isArray(reviewInput)?clone(reviewInput):{};
    const reflection=createReflection(reflectionInput,options);
    review.capabilityReflections=normalizeReflections([...(review.capabilityReflections||[]),reflection]);
    review.updatedAt=timestamp(options);
    return review;
  }

  function executionContext(value){return learningOutcomeModel?.normalizeExecutionContext?.(value?.learningContext)||normalizeCapabilityRef(value?.learningContext)}
  function evidenceContext(evidence,executionById){
    if(!evidence?.sessionId)return null;
    const execution=executionById instanceof Map?executionById.get(evidence.sessionId):(Array.isArray(executionById)?executionById.find(item=>item?.id===evidence.sessionId):null);
    return executionContext(execution);
  }

  function buildIndexes(data={}){
    const outcomes=learningOutcomeModel?.normalizeCollection?.(data.learningOutcomes)||[];
    const outcomeById=new Map(outcomes.map(item=>[item.id,item]));
    const executions=(Array.isArray(data.executionSessions)?data.executionSessions:[]).filter(item=>item&&typeof item==='object');
    const executionById=new Map(executions.map(item=>[String(item.id||''),item]));
    const evidence=(Array.isArray(data.evidence)?data.evidence:[]).filter(item=>item&&typeof item==='object');
    const evidenceBySession=new Map();
    for(const item of evidence){if(!evidenceBySession.has(item.sessionId))evidenceBySession.set(item.sessionId,[]);evidenceBySession.get(item.sessionId).push(item)}
    const signals=normalizeSignalCollection(data.learningSignals),signalsByOutcome=new Map();
    for(const item of signals){const id=item.capabilityRef.outcomeId;if(!signalsByOutcome.has(id))signalsByOutcome.set(id,[]);signalsByOutcome.get(id).push(item)}
    const todayItems=(Array.isArray(data.dailyPlans)?data.dailyPlans:[]).flatMap(plan=>(Array.isArray(plan?.items)?plan.items:[]).map(item=>({plan,item:normalizeTodayItem(item)}))).filter(entry=>entry.item);
    const reflections=(Array.isArray(data.weeklyReviews)?data.weeklyReviews:[]).flatMap(review=>normalizeReflections(review?.capabilityReflections).map(item=>({review,item})));
    return{outcomes,outcomeById,executions,executionById,evidence,evidenceBySession,signals,signalsByOutcome,todayItems,reflections};
  }

  function capabilitySummary(outcomeId,data={},indexes=buildIndexes(data)){
    const id=clean(outcomeId),outcome=indexes.outcomeById.get(id)||null;
    const executions=indexes.executions.filter(item=>executionContext(item)?.outcomeId===id&&['completed','interrupted'].includes(item.status)).sort((a,b)=>String(b.endedAt||b.startedAt||b.createdAt||'').localeCompare(String(a.endedAt||a.startedAt||a.createdAt||'')));
    const evidence=executions.flatMap(item=>indexes.evidenceBySession.get(item.id)||[]);
    const today=indexes.todayItems.filter(entry=>entry.item.capabilityRef.outcomeId===id);
    const reflections=indexes.reflections.filter(entry=>entry.item.capabilityRef.outcomeId===id).sort((a,b)=>b.item.decidedAt.localeCompare(a.item.decidedAt));
    return{outcome,today,executions,evidence,signals:indexes.signalsByOutcome.get(id)||[],reflections,latestReflection:reflections[0]?.item||null};
  }

  function capabilitiesForResource(type,id,outcomes=[]){
    const resourceType=clean(type),resourceId=clean(id);
    return(learningOutcomeModel?.normalizeCollection?.(outcomes)||[]).filter(outcome=>outcome.resourceRefs.some(ref=>ref.type===resourceType&&ref.id===resourceId));
  }

  function filterExecutionsByCapability(executions=[],filter='all'){
    const items=Array.isArray(executions)?executions:[];
    if(filter==='all')return items.slice();
    if(filter==='unlinked')return items.filter(item=>!executionContext(item));
    return items.filter(item=>executionContext(item)?.outcomeId===filter);
  }

  return Object.freeze({
    EPOCH,SIGNAL_KINDS,SIGNAL_ORIGINS,SOURCE_TYPES,DECISIONS,
    normalizeCapabilityRef,createCapabilityRef,resolveCapabilityRef,refKey,
    normalizeTodayItem,createTodayItem,addTodayItem,
    normalizeSourceRef,normalizeSignal,normalizeSignalCollection,createSignal,updateSignal,deleteSignal,
    normalizeReflection,createReflection,normalizeReflections,upsertReflection,
    executionContext,evidenceContext,buildIndexes,capabilitySummary,capabilitiesForResource,filterExecutionsByCapability
  });
});
