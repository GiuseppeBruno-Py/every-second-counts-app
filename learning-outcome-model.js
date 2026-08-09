/* Compasso · Modelo puro de capacidades e próximas tentativas */
(function(root,factory){
  const api=factory();
  root.CompassoLearningOutcomeModel=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(typeof state!=='undefined'&&state?.data)state.data.learningOutcomes=api.normalizeCollection(state.data.learningOutcomes);
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const EPOCH='1970-01-01T00:00:00.000Z';
  const STATUSES=Object.freeze(['active','archived']);
  const RESOURCE_TYPES=Object.freeze(['study','reading']);

  const cleanText=value=>typeof value==='string'?value.trim():'';
  const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
  const validIso=value=>typeof value==='string'&&value.trim()&&!Number.isNaN(Date.parse(value))?value:'';
  const nowIso=options=>validIso(options?.now)||new Date().toISOString();
  const defaultId=prefix=>globalThis.crypto?.randomUUID?.()||`${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,10)}`;
  const idFrom=(options,prefix)=>cleanText(options?.[`${prefix}Id`])||cleanText(options?.idFactory?.(prefix))||defaultId(prefix);

  function error(code,message){const value=new TypeError(message);value.code=code;return value}
  function required(value,code,message){const normalized=cleanText(value);if(!normalized)throw error(code,message);return normalized}

  function normalizeProof(value){const normalized=cleanText(value);return normalized||null}

  function normalizeRefs(value){
    if(!Array.isArray(value))return[];
    const seen=new Set(),refs=[];
    for(const candidate of value){
      if(!candidate||typeof candidate!=='object'||Array.isArray(candidate))continue;
      const type=cleanText(candidate.type),id=cleanText(candidate.id),key=`${type}:${id}`;
      if(!RESOURCE_TYPES.includes(type)||!id||seen.has(key))continue;
      seen.add(key);refs.push({type,id});
    }
    return refs;
  }

  function normalizeAttempt(value,{outcomeId,createdAt,updatedAt}){
    const candidate=typeof value==='string'?{text:value}:value;
    if(!candidate||typeof candidate!=='object'||Array.isArray(candidate))return null;
    const text=cleanText(candidate.text);if(!text)return null;
    const attemptCreated=validIso(candidate.createdAt)||validIso(candidate.updatedAt)||createdAt;
    const attemptUpdated=validIso(candidate.updatedAt)||attemptCreated||updatedAt;
    return{
      id:cleanText(candidate.id)||`${outcomeId}:next`,
      text,
      createdAt:attemptCreated||EPOCH,
      updatedAt:attemptUpdated||attemptCreated||EPOCH
    };
  }

  function normalizeExecutionContext(value){
    if(!value||typeof value!=='object'||Array.isArray(value))return null;
    const outcomeId=cleanText(value.outcomeId),attemptId=cleanText(value.attemptId),attemptText=cleanText(value.attemptText);
    return outcomeId&&attemptId&&attemptText?{outcomeId,attemptId,attemptText}:null;
  }

  function createExecutionContext(value){
    const outcome=normalizeOutcome(value);
    return outcome?{outcomeId:outcome.id,attemptId:outcome.nextAttempt.id,attemptText:outcome.nextAttempt.text}:null;
  }

  function normalizeOutcome(value){
    if(!value||typeof value!=='object'||Array.isArray(value))return null;
    const id=cleanText(value.id),capability=cleanText(value.capability);
    if(!id||!capability)return null;
    const createdAt=validIso(value.createdAt)||validIso(value.updatedAt)||EPOCH;
    const updatedAt=validIso(value.updatedAt)||createdAt;
    const nextAttempt=normalizeAttempt(value.nextAttempt,{outcomeId:id,createdAt,updatedAt});
    if(!nextAttempt)return null;
    const status=STATUSES.includes(value.status)?value.status:'active';
    return{
      id,
      capability,
      proofCriterion:normalizeProof(value.proofCriterion),
      resourceRefs:normalizeRefs(value.resourceRefs),
      nextAttempt,
      status,
      archivedAt:status==='archived'?(validIso(value.archivedAt)||updatedAt):null,
      createdAt,
      updatedAt
    };
  }

  function normalizeCollection(value){
    if(!Array.isArray(value))return[];
    const byId=new Map();
    for(const candidate of value){
      const outcome=normalizeOutcome(candidate);if(!outcome)continue;
      const current=byId.get(outcome.id);
      if(!current||outcome.updatedAt>current.updatedAt)byId.set(outcome.id,outcome);
    }
    return[...byId.values()];
  }

  function createOutcome(input={},options={}){
    const timestamp=nowIso(options),id=idFrom(options,'outcome');
    const capability=required(input.capability,'capability-required','Informe o que você quer conseguir fazer.');
    const attemptText=required(typeof input.nextAttempt==='object'?input.nextAttempt?.text:input.nextAttempt,'attempt-required','Informe o que você vai tentar agora.');
    return{
      id,
      capability,
      proofCriterion:normalizeProof(input.proofCriterion),
      resourceRefs:normalizeRefs(input.resourceRefs),
      nextAttempt:{id:idFrom(options,'attempt'),text:attemptText,createdAt:timestamp,updatedAt:timestamp},
      status:'active',
      archivedAt:null,
      createdAt:timestamp,
      updatedAt:timestamp
    };
  }

  function updateOutcome(value,input={},options={}){
    const current=normalizeOutcome(value);if(!current)throw error('outcome-invalid','Capacidade inválida.');
    const timestamp=nowIso(options);
    const has=(key)=>Object.prototype.hasOwnProperty.call(input,key);
    const attemptInput=has('nextAttempt')?input.nextAttempt:current.nextAttempt.text;
    const attemptText=required(typeof attemptInput==='object'?attemptInput?.text:attemptInput,'attempt-required','Informe o que você vai tentar agora.');
    return{
      ...current,
      capability:required(has('capability')?input.capability:current.capability,'capability-required','Informe o que você quer conseguir fazer.'),
      proofCriterion:has('proofCriterion')?normalizeProof(input.proofCriterion):current.proofCriterion,
      resourceRefs:has('resourceRefs')?normalizeRefs(input.resourceRefs):current.resourceRefs.map(ref=>({...ref})),
      nextAttempt:{...current.nextAttempt,text:attemptText,updatedAt:has('nextAttempt')&&attemptText!==current.nextAttempt.text?timestamp:current.nextAttempt.updatedAt},
      updatedAt:timestamp
    };
  }

  function setStatus(value,status,options={}){
    const current=normalizeOutcome(value);if(!current)throw error('outcome-invalid','Capacidade inválida.');
    if(!STATUSES.includes(status))throw error('status-invalid','Estado de capacidade inválido.');
    const timestamp=nowIso(options);
    return{...current,status,archivedAt:status==='archived'?timestamp:null,updatedAt:timestamp};
  }

  const archiveOutcome=(value,options)=>setStatus(value,'archived',options);
  const reactivateOutcome=(value,options)=>setStatus(value,'active',options);

  function deleteOutcome(stateValue,id,options={}){
    const state=stateValue&&typeof stateValue==='object'&&!Array.isArray(stateValue)?stateValue:{};
    const key=cleanText(id),outcomes=normalizeCollection(state.learningOutcomes);
    if(!key||!outcomes.some(item=>item.id===key))throw error('outcome-not-found','Capacidade não encontrada.');
    const timestamp=nowIso(options);
    const sync=state._sync&&typeof state._sync==='object'?clone(state._sync):{};
    sync.tombstones=sync.tombstones&&typeof sync.tombstones==='object'?sync.tombstones:{};
    sync.tombstones[`learningOutcomes:${key}`]=timestamp;
    sync.updatedAt=timestamp;
    return{...state,learningOutcomes:outcomes.filter(item=>item.id!==key),_sync:sync};
  }

  function sortOutcomes(value,status=null){
    return normalizeCollection(value).filter(item=>!status||item.status===status).sort((left,right)=>
      right.updatedAt.localeCompare(left.updatedAt)||right.createdAt.localeCompare(left.createdAt)||left.id.localeCompare(right.id)
    );
  }

  function resolveRefs(outcome,resources={}){
    const studies=new Map((Array.isArray(resources.study)?resources.study:[]).filter(Boolean).map(item=>[String(item.id||''),item]));
    const readings=new Map((Array.isArray(resources.reading)?resources.reading:[]).filter(Boolean).map(item=>[String(item.id||''),item]));
    return normalizeRefs(outcome?.resourceRefs).map(ref=>{
      const item=(ref.type==='study'?studies:readings).get(ref.id)||null;
      return{...ref,available:Boolean(item),title:item?String(item.title||'').trim()||ref.id:null};
    });
  }

  return Object.freeze({
    EPOCH,STATUSES,RESOURCE_TYPES,normalizeProof,normalizeRefs,normalizeAttempt,normalizeExecutionContext,createExecutionContext,normalizeOutcome,normalizeCollection,
    createOutcome,updateOutcome,archiveOutcome,reactivateOutcome,deleteOutcome,sortOutcomes,resolveRefs
  });
});
