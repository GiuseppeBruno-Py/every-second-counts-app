(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.CompassoDeepWorkModel=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const ACTIVE=new Set(['running','paused','finishing']);
  const FINAL=new Set(['completed','interrupted']);
  const iso=value=>typeof value==='string'&&!Number.isNaN(Date.parse(value))?value:null;
  const text=(value,max=500)=>typeof value==='string'?value.trim().slice(0,max):'';

  function normalize(session,now=new Date().toISOString()){
    if(!session||typeof session!=='object')return null;
    const state=['idle','running','paused','finishing','completed','interrupted'].includes(session.state)?session.state:'idle';
    return {
      id:text(session.id,90),schemaVersion:2,actionId:text(session.actionId,90),domain:text(session.domain,30),
      plannedMinutes:Math.max(1,Math.min(1440,Math.round(Number(session.plannedMinutes)||25))),
      actualMinutes:Math.max(0,Number(session.actualMinutes)||0),state,
      createdAt:iso(session.createdAt)||now,startedAt:iso(session.startedAt),pausedAt:iso(session.pausedAt),endedAt:iso(session.endedAt),
      pausedMs:Math.max(0,Number(session.pausedMs)||0),
      finishingStartedAt:iso(session.finishingStartedAt),
      frozenDurationMs:Number.isFinite(Number(session.frozenDurationMs))?Math.max(0,Number(session.frozenDurationMs)):null,
      stateBeforeFinishing:['running','paused'].includes(session.stateBeforeFinishing)?session.stateBeforeFinishing:null,
      finishingKind:['complete','interrupt'].includes(session.finishingKind)?session.finishingKind:null,
      expectedOutcome:text(session.expectedOutcome),completionCriterion:text(session.completionCriterion),completionNote:text(session.completionNote),nextAction:text(session.nextAction),
      energyBefore:Number.isFinite(Number(session.energyBefore))?Math.max(1,Math.min(5,Number(session.energyBefore))):null,
      energyAfter:Number.isFinite(Number(session.energyAfter))?Math.max(1,Math.min(5,Number(session.energyAfter))):null,
      interruptionReasons:(Array.isArray(session.interruptionReasons)?session.interruptionReasons:[]).map(item=>({reason:text(item?.reason||item),at:iso(item?.at)||now})).filter(item=>item.reason),
      capturedDistractions:(Array.isArray(session.capturedDistractions)?session.capturedDistractions:[]).map(item=>({id:text(item?.id,90)||`d${Date.now()}`,text:text(item?.text||item),capturedAt:iso(item?.capturedAt)||now,resolved:item?.resolved===true})).filter(item=>item.text),
      preparation:{notifications:session.preparation?.notifications===true,materials:session.preparation?.materials===true,environment:session.preparation?.environment===true},
      updatedAt:iso(session.updatedAt)||now
    };
  }

  function elapsedMs(session,now=Date.now()){
    const current=normalize(session);
    if(!current?.startedAt)return 0;
    if(current.state==='finishing'&&current.frozenDurationMs!=null)return current.frozenDurationMs;
    const end=current.endedAt?Date.parse(current.endedAt):now;
    const currentPause=current.state==='paused'&&current.pausedAt?Math.max(0,end-Date.parse(current.pausedAt)):0;
    return Math.max(0,end-Date.parse(current.startedAt)-current.pausedMs-currentPause);
  }

  function transition(session,event,at=new Date().toISOString(),payload={}){
    const current=normalize(session,at);
    if(!current)throw Error('invalid session');
    const allowed={idle:['start'],running:['pause','beginFinish','complete','interrupt'],paused:['resume','beginFinish','complete','interrupt'],finishing:['cancelFinish','complete','interrupt'],completed:[],interrupted:[]};
    if(!allowed[current.state].includes(event))throw Error(`invalid transition ${current.state}:${event}`);
    if(event==='start'){current.state='running';current.startedAt=at;}
    if(event==='pause'){
      current.state='paused';current.pausedAt=at;
      if(text(payload.reason))current.interruptionReasons.push({reason:text(payload.reason),at});
    }
    if(event==='resume'){
      current.pausedMs+=Math.max(0,Date.parse(at)-Date.parse(current.pausedAt));
      current.pausedAt=null;current.state='running';
    }
    if(event==='beginFinish'){
      current.stateBeforeFinishing=current.state;
      current.finishingStartedAt=at;
      current.frozenDurationMs=elapsedMs(current,Date.parse(at));
      current.finishingKind=payload.kind==='interrupt'?'interrupt':'complete';
      current.state='finishing';
    }
    if(event==='cancelFinish'){
      const previous=current.stateBeforeFinishing==='paused'?'paused':'running';
      if(previous==='running')current.pausedMs+=Math.max(0,Date.parse(at)-Date.parse(current.finishingStartedAt));
      current.state=previous;
      current.pausedAt=previous==='paused'?(current.pausedAt||current.finishingStartedAt):null;
      current.finishingStartedAt=null;current.frozenDurationMs=null;current.stateBeforeFinishing=null;current.finishingKind=null;
    }
    if(event==='complete'||event==='interrupt'){
      const wasFinishing=current.state==='finishing';
      const endedAt=wasFinishing?current.finishingStartedAt:at;
      const duration=wasFinishing?current.frozenDurationMs:elapsedMs(current,Date.parse(at));
      if(!wasFinishing&&current.state==='paused'&&current.pausedAt)current.pausedMs+=Math.max(0,Date.parse(at)-Date.parse(current.pausedAt));
      current.pausedAt=null;
      current.state=event==='complete'?'completed':'interrupted';
      current.endedAt=endedAt;
      current.actualMinutes=Math.round(Math.max(0,duration||0)/600)/100;
      current.completionNote=text(payload.completionNote);current.nextAction=text(payload.nextAction);current.energyAfter=Number(payload.energyAfter)||null;
      if(event==='interrupt'&&text(payload.reason))current.interruptionReasons.push({reason:text(payload.reason),at:endedAt});
      current.finishingStartedAt=null;current.frozenDurationMs=null;current.stateBeforeFinishing=null;current.finishingKind=null;
    }
    current.updatedAt=at;
    return current;
  }

  function active(sessions){return(Array.isArray(sessions)?sessions:[]).map(normalize).find(session=>session&&ACTIVE.has(session.state))||null;}
  function addDistraction(session,value,at=new Date().toISOString()){
    const current=normalize(session,at),content=text(value);
    if(content)current.capturedDistractions.push({id:`d${Date.parse(at)}${current.capturedDistractions.length}`,text:content,capturedAt:at,resolved:false});
    current.updatedAt=at;return current;
  }
  function metrics(sessions){
    const done=(Array.isArray(sessions)?sessions:[]).map(normalize).filter(session=>session&&FINAL.has(session.state));
    const completed=done.filter(session=>session.state==='completed');
    const actual=done.reduce((sum,session)=>sum+session.actualMinutes,0),planned=done.reduce((sum,session)=>sum+session.plannedMinutes,0);
    return {sessions:done.length,completed:completed.length,interrupted:done.length-completed.length,deepMinutes:Math.round(actual*10)/10,results:completed.filter(session=>session.completionNote).length,estimateAccuracy:planned?Math.round((1-Math.min(1,Math.abs(actual-planned)/planned))*100):null};
  }
  return {normalize,elapsedMs,transition,active,addDistraction,metrics,isActive:session=>ACTIVE.has(session?.state)};
});
