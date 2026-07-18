/* Compasso · Modelo puro da jornada unificada de revisão */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.CompassoReviewCycleModel=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const validDate=value=>{const date=value instanceof Date?new Date(value):new Date(value);return Number.isNaN(date.getTime())?new Date(0):date};
  function localParts(value,timeZone='UTC'){const parts=new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(validDate(value));const read=type=>Number(parts.find(part=>part.type===type)?.value);return{year:read('year'),month:read('month'),day:read('day')}}
  function weekKey(value=new Date(),timeZone='UTC'){const part=localParts(value,timeZone),wall=new Date(Date.UTC(part.year,part.month-1,part.day)),day=wall.getUTCDay(),diff=day===0?6:day-1;wall.setUTCDate(wall.getUTCDate()-diff);return wall.toISOString().slice(0,10)}
  function addDays(key,days){const date=new Date(`${key}T12:00:00.000Z`);date.setUTCDate(date.getUTCDate()+days);return date.toISOString().slice(0,10)}
  function inWeek(value,key,timeZone='UTC'){if(!value)return false;const part=localParts(value,timeZone),day=`${part.year}-${String(part.month).padStart(2,'0')}-${String(part.day).padStart(2,'0')}`;return day>=key&&day<addDays(key,7)}
  function completedSessions(data,key,timeZone){return(Array.isArray(data?.executionSessions)?data.executionSessions:[]).filter(session=>session?.status==='completed'&&inWeek(session.endedAt||session.startedAt,key,timeZone))}
  function evidence(data,key,timeZone){return(Array.isArray(data?.evidence)?data.evidence:[]).filter(item=>inWeek(item.createdAt,key,timeZone))}
  function uniqueResults(data,key,timeZone='UTC'){const seen=new Set(),results=[];for(const item of evidence(data,key,timeZone)){const id=`evidence:${item.id||item.sessionId||item.summary}`;if(!seen.has(id)){seen.add(id);results.push({id,kind:'evidence',sourceId:item.id||null});}}for(const plan of Array.isArray(data?.weeklyPlans)?data.weeklyPlans:[]){if(plan.weekStart!==key)continue;for(const outcome of Array.isArray(plan.outcomes)?plan.outcomes:[]){const id=`outcome:${plan.id||plan.weekStart}:${outcome.id||outcome.description}`;if(!seen.has(id)){seen.add(id);results.push({id,kind:'outcome',sourceId:plan.id||null});}}}return results}
  function snapshot(data,now=new Date(),timeZone='UTC'){
    const current=weekKey(now,timeZone),next=addDays(current,7),sessions=completedSessions(data,current,timeZone),items=evidence(data,current,timeZone),results=uniqueResults(data,current,timeZone);
    const review=(data?.weeklyReviews||[]).find(item=>item.weekStart===current)||null;
    const plan=(data?.weeklyPlans||[]).find(item=>item.weekStart===next)||null;
    const sample=sessions.length||items.length;
    const stages={observe:sample>0,decide:Boolean(review),plan:plan?.status==='confirmed',history:sample>0||Boolean(review)||Boolean(plan)};
    const resume=!stages.observe?'observe':!stages.decide?'decide':!stages.plan?'plan':'history';
    return{weekStart:current,nextWeekStart:next,sessions:sessions.length,evidence:items.length,results:results.length,sampleSufficient:sample>0,review,plan,stages,resume};
  }
  function metric(value,sufficient){return sufficient?String(value):'Amostra insuficiente'}
  return Object.freeze({weekKey,addDays,inWeek,uniqueResults,snapshot,metric});
});
