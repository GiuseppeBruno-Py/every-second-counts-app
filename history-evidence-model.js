/* Compasso · Contratos puros para correção de histórico e evidências */
(function(root,factory){
  const api=factory();
  root.CompassoHistoryEvidenceModel=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(globalThis,function(){
  const EVIDENCE_TYPES=Object.freeze(['insight','note','exercise','decision','question','deliverable']);
  const DOMAINS=Object.freeze(['reading','study']);
  const clone=value=>JSON.parse(JSON.stringify(value));
  const text=(value,max=500)=>String(value??'').trim().slice(0,max);
  const timestamp=value=>{
    const date=new Date(value);
    if(Number.isNaN(date.getTime()))throw new TypeError('Data ou horário inválido.');
    return date.toISOString();
  };
  const now=options=>timestamp(options?.now||new Date());
  const nonNegative=(value,label)=>{
    const number=Number(value);
    if(!Number.isFinite(number)||number<0)throw new TypeError(`${label} deve ser um número não negativo.`);
    return number;
  };
  const executionVariant=(patch,current)=>{
    const value=patch&&typeof patch==='object'?patch:current&&typeof current==='object'?current:null;
    if(!value)return null;
    const kind=['ideal','minimum','contingency'].includes(value.kind)?value.kind:'ideal';
    return {kind,contingencyId:kind==='contingency'?String(value.contingencyId||'')||null:null};
  };

  function normalizeEvidence(record,options={}){
    if(!record||typeof record!=='object'||Array.isArray(record)||!record.id)return null;
    const createdAt=timestamp(record.createdAt||options.now||new Date());
    return {
      ...clone(record),
      id:String(record.id),
      schemaVersion:Math.max(2,Number(record.schemaVersion)||1),
      sessionId:String(record.sessionId||''),
      itemId:String(record.itemId||''),
      domain:DOMAINS.includes(record.domain)?record.domain:'study',
      type:EVIDENCE_TYPES.includes(record.type)?record.type:'insight',
      summary:text(record.summary,180),
      details:text(record.details,500),
      createdAt,
      updatedAt:timestamp(record.updatedAt||createdAt),
      editedAt:record.editedAt?timestamp(record.editedAt):null
    };
  }

  function updateEvidence(record,patch={},options={}){
    const current=normalizeEvidence(record,options);
    if(!current)throw new TypeError('Evidência inválida.');
    const summary=Object.prototype.hasOwnProperty.call(patch,'summary')?text(patch.summary,180):current.summary;
    if(summary.length<3)throw new TypeError('A síntese da evidência precisa ter ao menos 3 caracteres.');
    const changedAt=now(options);
    return {
      ...current,
      sessionId:Object.prototype.hasOwnProperty.call(patch,'sessionId')?String(patch.sessionId||''):current.sessionId,
      itemId:Object.prototype.hasOwnProperty.call(patch,'itemId')?String(patch.itemId||''):current.itemId,
      domain:DOMAINS.includes(patch.domain)?patch.domain:current.domain,
      type:EVIDENCE_TYPES.includes(patch.type)?patch.type:current.type,
      summary,
      details:Object.prototype.hasOwnProperty.call(patch,'details')?text(patch.details,500):current.details,
      createdAt:Object.prototype.hasOwnProperty.call(patch,'createdAt')?timestamp(patch.createdAt):current.createdAt,
      updatedAt:changedAt,
      editedAt:changedAt
    };
  }

  function updateSession(record,patch={},options={}){
    if(!record||typeof record!=='object'||!record.id)throw new TypeError('Sessão inválida.');
    const startedAt=timestamp(patch.startedAt||record.startedAt);
    const endedAt=timestamp(patch.endedAt||record.endedAt||startedAt);
    if(new Date(endedAt)<new Date(startedAt))throw new TypeError('O fim da sessão não pode ser anterior ao início.');
    const changedAt=now(options);
    const durationMs=Object.prototype.hasOwnProperty.call(patch,'durationMs')?nonNegative(patch.durationMs,'Duração'):nonNegative(record.durationMs||0,'Duração');
    const startValue=Object.prototype.hasOwnProperty.call(patch,'startValue')?nonNegative(patch.startValue,'Valor inicial'):nonNegative(record.startValue||0,'Valor inicial');
    const endValue=Object.prototype.hasOwnProperty.call(patch,'endValue')?nonNegative(patch.endValue,'Valor final'):record.endValue==null?null:nonNegative(record.endValue,'Valor final');
    if(endValue!=null&&endValue<startValue)throw new TypeError('O progresso final não pode ser menor que o inicial.');
    return {
      ...clone(record),
      domain:DOMAINS.includes(patch.domain)?patch.domain:record.domain,
      itemId:Object.prototype.hasOwnProperty.call(patch,'itemId')?String(patch.itemId||''):record.itemId,
      intent:Object.prototype.hasOwnProperty.call(patch,'intent')?text(patch.intent,220):text(record.intent,220),
      reflection:Object.prototype.hasOwnProperty.call(patch,'reflection')?text(patch.reflection,500):text(record.reflection,500),
      nextAction:Object.prototype.hasOwnProperty.call(patch,'nextAction')?text(patch.nextAction,500):text(record.nextAction,500),
      startValue,endValue,startedAt,endedAt,durationMs,
      executionVariant:executionVariant(patch.executionVariant,record.executionVariant),
      updatedAt:changedAt,
      editedAt:changedAt
    };
  }

  function updateDeepWork(record,patch={},options={}){
    if(!record||typeof record!=='object'||!record.id)throw new TypeError('Deep Work inválido.');
    const startedAt=timestamp(patch.startedAt||record.startedAt);
    const endedAt=timestamp(patch.endedAt||record.endedAt||startedAt);
    if(new Date(endedAt)<new Date(startedAt))throw new TypeError('O fim da sessão não pode ser anterior ao início.');
    const changedAt=now(options);
    return {
      ...clone(record),
      domain:DOMAINS.includes(patch.domain)?patch.domain:record.domain,
      actionId:Object.prototype.hasOwnProperty.call(patch,'itemId')?String(patch.itemId||''):record.actionId,
      expectedOutcome:Object.prototype.hasOwnProperty.call(patch,'intent')?text(patch.intent,500):text(record.expectedOutcome,500),
      completionNote:Object.prototype.hasOwnProperty.call(patch,'reflection')?text(patch.reflection,1000):text(record.completionNote,1000),
      nextAction:Object.prototype.hasOwnProperty.call(patch,'nextAction')?text(patch.nextAction,500):text(record.nextAction,500),
      startedAt,endedAt,
      actualMinutes:Math.round(nonNegative(patch.durationMs??Number(record.actualMinutes||0)*60000,'Duração')/60000),
      updatedAt:changedAt,
      editedAt:changedAt
    };
  }

  function deleteEvidence(state,id,options={}){
    const next=clone(state||{});
    const key=String(id||'');
    if(!(next.evidence||[]).some(item=>item.id===key))throw new TypeError('Evidência não encontrada.');
    const deletedAt=now(options);
    next.evidence=(next.evidence||[]).filter(item=>item.id!==key);
    next._sync=next._sync&&typeof next._sync==='object'?next._sync:{};
    next._sync.tombstones=next._sync.tombstones&&typeof next._sync.tombstones==='object'?next._sync.tombstones:{};
    next._sync.tombstones[`evidence:${key}`]=deletedAt;
    next._sync.updatedAt=deletedAt;
    return next;
  }

  function summarize(sessions,evidence){
    const completed=(Array.isArray(sessions)?sessions:[]).filter(item=>item?.status==='completed'||item?.state==='completed');
    const ids=new Set(completed.map(item=>item.id));
    return {
      sessions:completed.length,
      durationMs:completed.reduce((sum,item)=>sum+nonNegative(item.durationMs??Number(item.actualMinutes||0)*60000,'Duração'),0),
      activeDays:new Set(completed.map(item=>timestamp(item.endedAt||item.startedAt).slice(0,10))).size,
      evidence:(Array.isArray(evidence)?evidence:[]).filter(item=>ids.has(String(item.sessionId||'').replace(/^deep:/,''))||ids.has(item.sessionId)).length
    };
  }

  return Object.freeze({EVIDENCE_TYPES,DOMAINS,normalizeEvidence,updateEvidence,updateSession,updateDeepWork,deleteEvidence,summarize});
});
