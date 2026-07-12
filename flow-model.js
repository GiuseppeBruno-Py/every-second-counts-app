(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.CompassoFlowModel=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const LEVEL={low:1,medium:2,high:3};
  const WEIGHTS={focus:30,priorityHigh:20,priorityMedium:10,dueSoon:15,dueWeek:8,energyExact:12,timeFit:10,staleMax:10,missing:-5};
  function daysUntil(date,now=new Date()){
    if(!date)return null;
    const target=new Date(date+'T23:59:59');
    if(Number.isNaN(target.getTime()))return null;
    return Math.ceil((target-now)/86400000);
  }
  function normalizeInputs(input={}){
    return{energy:LEVEL[input.energy]?input.energy:'medium',minutes:Math.max(1,Number(input.minutes)||30),context:input.context||'',concentration:input.concentration!==false,now:input.now?new Date(input.now):new Date()};
  }
  function evaluate(entry,input,options={}){
    const item=entry.item||entry,domain=entry.domain||item.domain||'';
    const data=normalizeInputs(input),reasons=[],missing=[];
    if(!['active','planned'].includes(item.status))return{eligible:false,code:'inactive'};
    if(item.estimatedMinutes&&Number(item.estimatedMinutes)>data.minutes)return{eligible:false,code:'insufficient_time'};
    if(item.requiredEnergy&&LEVEL[item.requiredEnergy]>LEVEL[data.energy])return{eligible:false,code:'insufficient_energy'};
    if(data.context&&item.workContext&&item.workContext!==data.context)return{eligible:false,code:'context_mismatch'};
    if(item.workType==='deep'&&!data.concentration)return{eligible:false,code:'concentration_required'};
    let score=0;
    if(options.focusTitles?.has(item.title)){score+=WEIGHTS.focus;reasons.push('weekly_focus');}
    if(item.priority==='high'){score+=WEIGHTS.priorityHigh;reasons.push('high_priority');}
    else if(item.priority==='medium'){score+=WEIGHTS.priorityMedium;reasons.push('medium_priority');}
    const due=daysUntil(item.dueDate,data.now);
    if(due!==null&&due<=2){score+=WEIGHTS.dueSoon;reasons.push(due<0?'overdue':'due_soon');}
    else if(due!==null&&due<=7){score+=WEIGHTS.dueWeek;reasons.push('due_this_week');}
    if(item.requiredEnergy===data.energy){score+=WEIGHTS.energyExact;reasons.push('energy_match');}
    if(item.estimatedMinutes){const ratio=Number(item.estimatedMinutes)/data.minutes;if(ratio>=.5&&ratio<=1){score+=WEIGHTS.timeFit;reasons.push('time_fit');}}
    const last=options.lastActivity?.[item.id];
    if(last){const stale=Math.min(WEIGHTS.staleMax,Math.max(0,Math.floor((data.now-new Date(last))/86400000)));score+=stale;if(stale>=3)reasons.push('stale_action');}
    else{score+=WEIGHTS.staleMax;reasons.push('not_started_recently');}
    for(const [field,value] of [['profile',item.workType],['energy',item.requiredEnergy],['duration',item.estimatedMinutes],['context',item.workContext]]){
      if(!value){score+=WEIGHTS.missing;missing.push(field);}
    }
    if(item.workType==='deep'&&data.concentration){score+=5;reasons.push('deep_window');}
    if(item.cognitiveDemand===data.energy){score+=5;reasons.push('cognitive_match');}
    return{eligible:true,item,domain,score,reasons,missing,dueDays:due,key:`${domain}:${item.id}`};
  }
  function recommend(entries,input,options={}){
    const rejected=new Set(options.rejectedIds||[]);
    return entries.map(entry=>evaluate(entry,input,options)).filter(result=>result.eligible&&!rejected.has(result.item.id)).sort((a,b)=>b.score-a.score||a.key.localeCompare(b.key)).slice(0,options.limit||3);
  }
  return{LEVEL,WEIGHTS,daysUntil,normalizeInputs,evaluate,recommend};
});

