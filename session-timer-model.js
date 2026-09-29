/* Compasso · Contrato puro de encerramento de sessões */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.CompassoSessionTimerModel=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const CURRENT=new Set(['active','paused','finishing']);
  const START_SMALL_MS=5*60000;
  const iso=value=>{
    const date=value instanceof Date?value:new Date(value);
    if(Number.isNaN(date.getTime()))throw new TypeError('Instante inválido.');
    return date.toISOString();
  };
  const time=value=>new Date(value).getTime();
  const number=value=>Math.max(0,Number(value)||0);

  function normalizeStartSmall(value){
    if(!value||typeof value!=='object'||Number(value.minutes)!==5)return null;
    const choice=['continue','adjust'].includes(value.choice)?value.choice:null;
    const decidedAt=choice&&typeof value.decidedAt==='string'&&!Number.isNaN(Date.parse(value.decidedAt))?new Date(value.decidedAt).toISOString():null;
    return {minutes:5,choice:decidedAt?choice:null,decidedAt};
  }

  function rawElapsed(session,at=Date.now()){
    if(!session?.startedAt)return 0;
    if(session.status==='finishing'&&Number.isFinite(Number(session.frozenDurationMs)))return number(session.frozenDurationMs);
    const end=session.endedAt?time(session.endedAt):Number(at);
    const pausedNow=session.status==='paused'&&session.pauseStartedAt?Math.max(0,end-time(session.pauseStartedAt)):0;
    return Math.max(0,end-time(session.startedAt)-number(session.pausedMs)-pausedNow);
  }

  function elapsed(session,at=Date.now()){
    const duration=rawElapsed(session,at),small=normalizeStartSmall(session?.startSmall);
    return small&&!small.choice&&['active','paused'].includes(session?.status)?Math.min(duration,START_SMALL_MS):duration;
  }

  function startSmallDue(session,at=Date.now()){
    const small=normalizeStartSmall(session?.startSmall);
    return Boolean(small&&!small.choice&&['active','paused'].includes(session?.status)&&rawElapsed(session,at)>=START_SMALL_MS);
  }

  function resolveStartSmall(session,choice,at=Date.now()){
    const timestamp=iso(at),now=time(timestamp);
    if(!['continue','adjust'].includes(choice)||!startSmallDue(session,now))throw new TypeError('A decisão de cinco minutos não está disponível.');
    const overrun=Math.max(0,rawElapsed(session,now)-START_SMALL_MS);
    const pausedNow=session.status==='paused'&&session.pauseStartedAt?Math.max(0,now-time(session.pauseStartedAt))||0:0;
    return {
      ...session,
      pausedMs:number(session.pausedMs)+overrun+(choice==='continue'?pausedNow:0),
      pauseStartedAt:choice==='adjust'?(session.status==='paused'?session.pauseStartedAt:timestamp):null,
      status:choice==='adjust'?'paused':'active',
      startSmall:{minutes:5,choice,decidedAt:timestamp},
      updatedAt:timestamp
    };
  }

  function begin(session,at=Date.now()){
    if(!session||!CURRENT.has(session.status))throw new TypeError('Sessão não pode iniciar encerramento.');
    if(session.status==='finishing')return {...session};
    const timestamp=iso(at);
    return {
      ...session,
      statusBeforeFinishing:session.status,
      finishingStartedAt:timestamp,
      frozenDurationMs:elapsed(session,time(timestamp)),
      status:'finishing',
      updatedAt:timestamp
    };
  }

  function cancel(session,at=Date.now()){
    if(!session||session.status!=='finishing')throw new TypeError('Sessão não está em encerramento.');
    const timestamp=iso(at);
    const previous=session.statusBeforeFinishing==='paused'?'paused':'active';
    const modalMs=Math.max(0,time(timestamp)-time(session.finishingStartedAt));
    return {
      ...session,
      status:previous,
      pausedMs:previous==='active'?number(session.pausedMs)+modalMs:number(session.pausedMs),
      pauseStartedAt:previous==='paused'?(session.pauseStartedAt||session.finishingStartedAt):null,
      statusBeforeFinishing:null,
      finishingStartedAt:null,
      frozenDurationMs:null,
      updatedAt:timestamp
    };
  }

  function finish(session){
    if(!session||session.status!=='finishing')throw new TypeError('Sessão não está pronta para concluir.');
    return {
      endedAt:session.finishingStartedAt,
      durationMs:number(session.frozenDurationMs)
    };
  }

  return Object.freeze({elapsed,begin,cancel,finish,normalizeStartSmall,startSmallDue,resolveStartSmall,isCurrent:session=>CURRENT.has(session?.status)});
});
