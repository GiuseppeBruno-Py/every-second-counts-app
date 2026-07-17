const test=require('node:test');
const assert=require('node:assert/strict');
const model=require('../execution-session-model.js');

const regular={id:'s1',domain:'study',itemId:'a1',status:'completed',startedAt:'2026-07-17T10:00:00.000Z',endedAt:'2026-07-17T10:30:00.000Z',durationMs:1800000,intent:'Entregar módulo',reflection:'Entregue',executionVariant:{kind:'minimum',contingencyId:null},ritualSnapshot:{id:'r1',version:2}};
const deep={id:'dw1',domain:'study',actionId:'a1',state:'completed',startedAt:'2026-07-17T11:00:00.000Z',endedAt:'2026-07-17T12:00:00.000Z',actualMinutes:60,expectedOutcome:'Fechar PR',completionNote:'PR aberta',capturedDistractions:[],ritualSnapshot:{id:'r2',version:1}};

test('migra sessões legadas sem apagar fontes nem duplicar registros',()=>{
  const data={sessions:[regular],deepWorkSessions:[deep],executionSessions:[]};
  const first=model.migrate(data,'2026-07-17T13:00:00.000Z');
  const second=model.migrate({...data,executionSessions:first},'2026-07-17T14:00:00.000Z');
  assert.equal(first.length,2);assert.deepEqual(second,first);
  assert.equal(first.find(x=>x.id==='s1').mode,'minimum');
  assert.equal(first.find(x=>x.id==='deep:dw1').mode,'deep');
  assert.equal(data.sessions[0].id,'s1');assert.equal(data.deepWorkSessions[0].id,'dw1');
});

test('preserva snapshots e produz histórico canônico sem dupla contagem',()=>{
  const migrated=model.migrate({sessions:[regular],deepWorkSessions:[deep]});
  assert.equal(migrated.find(x=>x.id==='s1').ritualSnapshot.version,2);
  assert.equal(migrated.find(x=>x.id==='deep:dw1').ritualSnapshot.version,1);
  const history=model.history(migrated);
  assert.equal(history.length,2);assert.equal(history[0].durationMs,3600000);assert.equal(history[1].durationMs,1800000);
});

test('impede novo início enquanto qualquer modo estiver ativo',()=>{
  const running=model.fromRegular({...regular,id:'s2',status:'active',endedAt:null,durationMs:null});
  const paused=model.fromDeep({...deep,id:'dw2',state:'paused',endedAt:null,actualMinutes:0});
  assert.equal(model.canStart([running]),false);assert.equal(model.active([running]).id,'s2');
  assert.equal(model.activeConflicts([running,paused]).length,2);
  assert.equal(model.canStart([{...running,status:'completed'}]),true);
});

test('máquina central rejeita transições inválidas e restaura pausa por timestamp',()=>{
  const idle=model.normalize({id:'s3',source:{collection:'sessions',id:'s3'},status:'idle'});
  assert.throws(()=>model.transition(idle,'complete'),/invalid transition/);
  const running=model.transition(idle,'start','2026-07-17T10:00:00.000Z');
  const paused=model.transition(running,'pause','2026-07-17T10:05:00.000Z');
  const resumed=model.transition(paused,'resume','2026-07-17T10:08:00.000Z');
  assert.equal(resumed.status,'running');assert.equal(resumed.pausedMs,180000);
});

test('finalização canônica é terminal e não pode ser reaplicada',()=>{
  const running=model.transition(model.normalize({id:'s4',source:{collection:'sessions',id:'s4'},status:'idle'}),'start','2026-07-17T10:00:00.000Z');
  const done=model.transition(running,'complete','2026-07-17T10:10:00.000Z');
  assert.equal(done.status,'completed');assert.throws(()=>model.transition(done,'complete'),/invalid transition/);
});

test('concessão entre abas expira e nunca bloqueia a própria aba',()=>{
  const lease={tabId:'tab-a',updatedAt:1000};
  assert.equal(model.leaseAvailable(lease,'tab-a',2000),true);
  assert.equal(model.leaseAvailable(lease,'tab-b',2000),false);
  assert.equal(model.leaseAvailable(lease,'tab-b',16000),true);
});
