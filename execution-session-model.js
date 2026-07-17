/* Compasso · Domínio canônico de execução */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.CompassoExecutionSessionModel=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const MODES=new Set(['quick','deep','minimum','contingency']);
  const ACTIVE=new Set(['running','paused','finishing']);
  const FINAL=new Set(['completed','interrupted']);
  const iso=value=>typeof value==='string'&&!Number.isNaN(Date.parse(value))?value:null;
  const text=(value,max=600)=>typeof value==='string'?value.trim().slice(0,max):'';
  const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
  const number=value=>Number.isFinite(Number(value))?Math.max(0,Number(value)):0;

  function normalize(input,now=new Date().toISOString()){
    if(!input||typeof input!=='object')return null;
    const mode=MODES.has(input.mode)?input.mode:'quick';
    const status=[...ACTIVE,...FINAL,'idle'].includes(input.status)?input.status:'idle';
    const sourceCollection=input.source?.collection==='deepWorkSessions'?'deepWorkSessions':'sessions';
    const sourceId=text(input.source?.id||input.legacyId,90);
    const id=text(input.id,120)||(sourceCollection==='deepWorkSessions'?`deep:${sourceId}`:sourceId);
    if(!id||!sourceId)return null;
    return {
      id,schemaVersion:1,mode,status,
      source:{collection:sourceCollection,id:sourceId},
      domain:text(input.domain,30),itemId:text(input.itemId||input.actionId,90),
      expectedOutcome:text(input.expectedOutcome||input.intent),completionCriterion:text(input.completionCriterion),
      ritualSnapshot:clone(input.ritualSnapshot)||null,ritualChecklist:clone(input.ritualChecklist)||[],
      contingencySnapshot:clone(input.contingencySnapshot)||null,
      executionVariant:clone(input.executionVariant)||{kind:mode==='minimum'?'minimum':mode==='contingency'?'contingency':'ideal',contingencyId:null},
      startedAt:iso(input.startedAt),endedAt:iso(input.endedAt),createdAt:iso(input.createdAt)||iso(input.startedAt)||now,
      pausedMs:number(input.pausedMs),pauseStartedAt:iso(input.pauseStartedAt||input.pausedAt),
      finishingStartedAt:iso(input.finishingStartedAt),frozenDurationMs:input.frozenDurationMs==null?null:number(input.frozenDurationMs),
      durationMs:input.durationMs==null?null:number(input.durationMs),plannedMinutes:number(input.plannedMinutes),
      captures:clone(input.captures||input.capturedDistractions)||[],result:text(input.result||input.completionNote||input.reflection),nextAction:text(input.nextAction),
      energyBefore:input.energyBefore==null?null:number(input.energyBefore),energyAfter:input.energyAfter==null?null:number(input.energyAfter),
      startValue:input.startValue==null?null:number(input.startValue),endValue:input.endValue==null?null:number(input.endValue),
      readingFormat:input.readingFormat||null,studyUnit:input.studyUnit||null,
      updatedAt:iso(input.updatedAt)||iso(input.endedAt)||iso(input.startedAt)||now,editedAt:iso(input.editedAt)
    };
  }

  function modeFromRegular(session){
    if(session?.executionVariant?.kind==='minimum')return'minimum';
    if(session?.executionVariant?.kind==='contingency')return'contingency';
    return'quick';
  }
  function statusFromRegular(status){return status==='active'?'running':status;}
  function fromRegular(session,now){
    if(!session?.id)return null;
    return normalize({...session,id:session.id,source:{collection:'sessions',id:session.id},mode:modeFromRegular(session),status:statusFromRegular(session.status),expectedOutcome:session.intent,result:session.reflection},now);
  }
  function fromDeep(session,now){
    if(!session?.id)return null;
    return normalize({...session,id:`deep:${session.id}`,source:{collection:'deepWorkSessions',id:session.id},mode:'deep',status:session.state,itemId:session.actionId,durationMs:session.actualMinutes==null?null:number(session.actualMinutes)*60000,result:session.completionNote,captures:session.capturedDistractions,pauseStartedAt:session.pausedAt},now);
  }
  function sourceKey(session){return`${session?.source?.collection||''}:${session?.source?.id||''}`;}
  function migrate(data,now=new Date().toISOString()){
    const current=Array.isArray(data?.executionSessions)?data.executionSessions:[];
    const bySource=new Map();
    for(const candidate of current){const session=normalize(candidate,now);if(session)bySource.set(sourceKey(session),session);}
    for(const candidate of Array.isArray(data?.sessions)?data.sessions:[]){const session=fromRegular(candidate,now);if(session)bySource.set(sourceKey(session),session);}
    for(const candidate of Array.isArray(data?.deepWorkSessions)?data.deepWorkSessions:[]){const session=fromDeep(candidate,now);if(session)bySource.set(sourceKey(session),session);}
    return [...bySource.values()].sort((a,b)=>String(b.startedAt||b.createdAt).localeCompare(String(a.startedAt||a.createdAt)));
  }
  function upsert(list,input,now=new Date().toISOString()){
    const session=normalize(input,now);if(!session)return migrate({executionSessions:list},now);
    const key=sourceKey(session),next=(Array.isArray(list)?list:[]).map(item=>normalize(item,now)).filter(Boolean).filter(item=>sourceKey(item)!==key);
    next.unshift(session);return next.sort((a,b)=>String(b.startedAt||b.createdAt).localeCompare(String(a.startedAt||a.createdAt)));
  }
  function active(list){return(Array.isArray(list)?list:[]).map(normalize).filter(Boolean).find(session=>ACTIVE.has(session.status))||null;}
  function activeConflicts(list){return(Array.isArray(list)?list:[]).map(normalize).filter(session=>session&&ACTIVE.has(session.status));}
  function canStart(list){return activeConflicts(list).length===0;}
  function leaseAvailable(lease,tabId,now=Date.now(),ttlMs=15000){return !lease?.tabId||lease.tabId===tabId||now-number(lease.updatedAt)>=ttlMs;}
  function history(list,domain='all'){
    return(Array.isArray(list)?list:[]).map(normalize).filter(session=>session&&session.status==='completed'&&(domain==='all'||session.domain===domain)).map(session=>({
      id:session.id,source:session.mode==='deep'?'deep-work':'execution',executionMode:session.mode,status:'completed',domain:session.domain,itemId:session.itemId,
      startedAt:session.startedAt,endedAt:session.endedAt||session.startedAt,durationMs:number(session.durationMs),intent:session.expectedOutcome,reflection:session.result,nextAction:session.nextAction,
      completionCriterion:session.completionCriterion,readingFormat:session.readingFormat,studyUnit:session.studyUnit,startValue:session.startValue,endValue:session.endValue,
      updatedAt:session.updatedAt,editedAt:session.editedAt
    })).sort((a,b)=>String(b.endedAt||b.startedAt).localeCompare(String(a.endedAt||a.startedAt)));
  }
  function transition(input,event,at=new Date().toISOString()){
    const session=normalize(input,at);if(!session)throw Error('invalid session');
    const allowed={idle:['start'],running:['pause','beginFinish','complete','interrupt'],paused:['resume','beginFinish','complete','interrupt'],finishing:['cancelFinish','complete','interrupt'],completed:[],interrupted:[]};
    if(!allowed[session.status].includes(event))throw Error(`invalid transition ${session.status}:${event}`);
    if(event==='start'){session.status='running';session.startedAt=at;}
    if(event==='pause'){session.status='paused';session.pauseStartedAt=at;}
    if(event==='resume'){session.pausedMs+=Math.max(0,Date.parse(at)-Date.parse(session.pauseStartedAt));session.pauseStartedAt=null;session.status='running';}
    if(event==='beginFinish'){session.finishingStartedAt=at;session.status='finishing';}
    if(event==='cancelFinish'){session.finishingStartedAt=null;session.status=session.pauseStartedAt?'paused':'running';}
    if(event==='complete'||event==='interrupt'){session.status=event==='complete'?'completed':'interrupted';session.endedAt=session.finishingStartedAt||at;session.finishingStartedAt=null;}
    session.updatedAt=at;return session;
  }
  return {normalize,fromRegular,fromDeep,migrate,upsert,active,activeConflicts,canStart,leaseAvailable,history,transition,isActive:session=>ACTIVE.has(session?.status),isFinal:session=>FINAL.has(session?.status)};
});
