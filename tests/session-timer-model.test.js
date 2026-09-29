const test=require('node:test');
const assert=require('node:assert/strict');
const timer=require('../session-timer-model.js');

const active=()=>({id:'s1',status:'active',startedAt:'2026-07-17T10:00:00.000Z',pausedMs:0,pauseStartedAt:null});

test('congelar captura o clique e permanece idempotente',()=>{
  const finishing=timer.begin(active(),'2026-07-17T10:12:00.000Z');
  assert.equal(finishing.status,'finishing');
  assert.equal(finishing.frozenDurationMs,720000);
  assert.deepEqual(timer.finish(finishing),{endedAt:'2026-07-17T10:12:00.000Z',durationMs:720000});
  assert.deepEqual(timer.begin(finishing,'2026-07-17T10:13:00.000Z'),finishing);
});

test('cancelar sessão ativa não contabiliza o tempo do formulário',()=>{
  const finishing=timer.begin(active(),'2026-07-17T10:12:00.000Z');
  const resumed=timer.cancel(finishing,'2026-07-17T10:15:00.000Z');
  assert.equal(resumed.status,'active');
  assert.equal(resumed.pausedMs,180000);
  assert.equal(timer.elapsed(resumed,Date.parse('2026-07-17T10:16:00.000Z')),780000);
});

test('cancelar sessão previamente pausada mantém a pausa',()=>{
  const paused={...active(),status:'paused',pauseStartedAt:'2026-07-17T10:10:00.000Z'};
  const finishing=timer.begin(paused,'2026-07-17T10:12:00.000Z');
  assert.equal(finishing.frozenDurationMs,600000);
  const restored=timer.cancel(finishing,'2026-07-17T10:15:00.000Z');
  assert.equal(restored.status,'paused');
  assert.equal(restored.pauseStartedAt,'2026-07-17T10:10:00.000Z');
  assert.equal(timer.elapsed(restored,Date.parse('2026-07-17T10:20:00.000Z')),600000);
});

test('estado finishing sobrevive ao round-trip JSON',()=>{
  const restored=JSON.parse(JSON.stringify(timer.begin(active(),'2026-07-17T10:12:00.000Z')));
  assert.equal(timer.isCurrent(restored),true);
  assert.equal(timer.elapsed(restored,Date.parse('2026-07-17T11:00:00.000Z')),720000);
});

test('compromisso curto limita o tempo efetivo a cinco minutos até decisão',()=>{
  const short={...active(),schemaVersion:2,startSmall:{minutes:5,choice:null,decidedAt:null}};
  assert.equal(timer.elapsed(short,Date.parse('2026-07-17T10:04:00.000Z')),240000);
  assert.equal(timer.startSmallDue(short,Date.parse('2026-07-17T10:04:00.000Z')),false);
  assert.equal(timer.elapsed(short,Date.parse('2026-07-17T10:12:00.000Z')),300000);
  assert.equal(timer.startSmallDue(short,Date.parse('2026-07-17T10:12:00.000Z')),true);
  assert.equal(timer.begin(short,'2026-07-17T10:12:00.000Z').frozenDurationMs,300000);
  assert.equal(timer.elapsed(active(),Date.parse('2026-07-17T10:12:00.000Z')),720000);
  assert.equal(timer.normalizeStartSmall({minutes:5,choice:'continue',decidedAt:'bad'}).choice,null);
  assert.equal(timer.normalizeStartSmall({minutes:7,choice:null}),null);
});

test('continuar desconta espera além do marco sem reiniciar sessão',()=>{
  const short={...active(),schemaVersion:2,startSmall:{minutes:5,choice:null,decidedAt:null}};
  const continued=timer.resolveStartSmall(short,'continue','2026-07-17T10:12:00.000Z');
  assert.equal(continued.id,'s1');
  assert.equal(continued.pausedMs,420000);
  assert.equal(timer.elapsed(continued,Date.parse('2026-07-17T10:12:00.000Z')),300000);
  assert.equal(timer.elapsed(continued,Date.parse('2026-07-17T10:14:00.000Z')),420000);
  assert.equal(timer.startSmallDue(continued,Date.parse('2026-07-17T10:14:00.000Z')),false);
  assert.deepEqual(timer.resolveStartSmall(short,'continue','2026-07-17T10:12:00.000Z'),continued);
  assert.throws(()=>timer.resolveStartSmall(continued,'continue','2026-07-17T10:14:00.000Z'));
});

test('pausa anterior ao marco adia decisão; ajustar conserva cinco minutos e pausa',()=>{
  const short={...active(),schemaVersion:2,startSmall:{minutes:5,choice:null,decidedAt:null},status:'paused',pauseStartedAt:'2026-07-17T10:03:00.000Z'};
  assert.equal(timer.startSmallDue(short,Date.parse('2026-07-17T10:12:00.000Z')),false);
  const resumed={...short,status:'active',pauseStartedAt:null,pausedMs:540000};
  assert.equal(timer.startSmallDue(resumed,Date.parse('2026-07-17T10:14:00.000Z')),true);
  const adjusted=timer.resolveStartSmall(resumed,'adjust','2026-07-17T10:14:00.000Z');
  assert.equal(adjusted.status,'paused');
  assert.equal(adjusted.pauseStartedAt,'2026-07-17T10:14:00.000Z');
  assert.equal(timer.elapsed(adjusted,Date.parse('2026-07-17T11:00:00.000Z')),300000);
  const pausedAtEight={...short,pauseStartedAt:'2026-07-17T10:08:00.000Z'};
  const continued=timer.resolveStartSmall(pausedAtEight,'continue','2026-07-17T10:10:00.000Z');
  assert.equal(continued.status,'active');
  assert.equal(timer.elapsed(continued,Date.parse('2026-07-17T10:10:00.000Z')),300000);
});
