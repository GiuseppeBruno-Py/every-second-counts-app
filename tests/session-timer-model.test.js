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
