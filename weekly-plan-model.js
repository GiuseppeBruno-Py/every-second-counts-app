(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.CompassoWeeklyPlanModel=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const WEEKDAY={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6};
  function zonedParts(date,timezone){
    const parts=new Intl.DateTimeFormat('en-US',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit',weekday:'short'}).formatToParts(new Date(date));
    return Object.fromEntries(parts.map(part=>[part.type,part.value]));
  }
  function weekStartKey(date=new Date(),timezone='UTC'){
    const p=zonedParts(date,timezone),utc=new Date(Date.UTC(Number(p.year),Number(p.month)-1,Number(p.day)));
    const day=WEEKDAY[p.weekday],distance=day===0?-6:1-day;utc.setUTCDate(utc.getUTCDate()+distance);
    return utc.toISOString().slice(0,10);
  }
  function nextWeekKey(date=new Date(),timezone='UTC'){const start=new Date(weekStartKey(date,timezone)+'T00:00:00Z');start.setUTCDate(start.getUTCDate()+7);return start.toISOString().slice(0,10);}
  function normalize(plan={},fallback={}){
    if(!plan||typeof plan!=='object'||Array.isArray(plan))plan={};
    if(!fallback||typeof fallback!=='object'||Array.isArray(fallback))fallback={};
    const now=new Date().toISOString();
    return{id:plan.id||`wp-${fallback.weekStart||plan.weekStart||now.slice(0,10)}`,schemaVersion:1,weekStart:plan.weekStart||fallback.weekStart,timezone:plan.timezone||fallback.timezone||'UTC',goalRefs:Array.isArray(plan.goalRefs)?plan.goalRefs:[],outcomes:Array.isArray(plan.outcomes)?plan.outcomes.filter(x=>x&&x.description).slice(0,3):[],actionRefs:Array.isArray(plan.actionRefs)?plan.actionRefs:[],riskActionIds:Array.isArray(plan.riskActionIds)?plan.riskActionIds:[],contingencies:plan.contingencies||'',ritual:plan.ritual||'',distribution:Array.isArray(plan.distribution)?plan.distribution:[],snapshots:Array.isArray(plan.snapshots)?plan.snapshots:[],step:Math.min(10,Math.max(1,Number(plan.step)||1)),status:['draft','confirmed','closed'].includes(plan.status)?plan.status:'draft',createdAt:plan.createdAt||now,updatedAt:plan.updatedAt||now,confirmedAt:plan.confirmedAt||null};
  }
  function normalizeCollection(plans=[]){return(Array.isArray(plans)?plans:[]).filter(plan=>plan&&typeof plan==='object'&&!Array.isArray(plan)).map(plan=>normalize(plan));}
  function profileComplete(item){return Boolean(item.workType&&item.requiredEnergy&&item.estimatedMinutes);}
  function risk(item){const reasons=[];if(!profileComplete(item))reasons.push('perfil incompleto');if(item.requiredEnergy==='high')reasons.push('energia alta');if(Number(item.estimatedMinutes)>90)reasons.push('sessão longa');if(item.dueDate){const days=Math.ceil((new Date(item.dueDate+'T23:59:59')-new Date())/86400000);if(days<=3)reasons.push('prazo próximo');}return reasons;}
  function distribute(actions,energyMap={}){
    const periods=['morning','afternoon','evening','dawn'];
    return actions.map(entry=>{const item=entry.item||entry;let slot='flexible';const need=item.requiredEnergy;if(need){const match=periods.find(period=>energyMap[period]?.sufficient&&energyMap[period]?.mode===need);if(match)slot=match;else if(need==='high')slot='protected';}return{actionId:item.id,domain:entry.domain||item.domain||'',slot,reason:slot==='flexible'?'sem padrão suficiente':slot==='protected'?'proteger janela de alta energia':'compatível com o mapa de energia'};});
  }
  function canConfirm(plan){return plan.goalRefs.length>0&&plan.outcomes.length>=2&&plan.outcomes.length<=3&&plan.actionRefs.length>0;}
  return{weekStartKey,nextWeekKey,normalize,normalizeCollection,profileComplete,risk,distribute,canConfirm};
});
