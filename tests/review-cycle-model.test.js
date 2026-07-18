const test=require('node:test');
const assert=require('node:assert/strict');
const model=require('../review-cycle-model.js');

test('calcula segunda-feira e respeita a data local do timezone',()=>{
  assert.equal(model.weekKey('2026-07-20T01:00:00.000Z','America/Recife'),'2026-07-13');
  assert.equal(model.weekKey('2026-07-20T03:30:00.000Z','America/Recife'),'2026-07-20');
  assert.equal(model.inWeek('2026-07-20T01:00:00.000Z','2026-07-13','America/Recife'),true);
});

test('retoma observar quando não existe amostra e não mostra zero enganoso',()=>{
  const result=model.snapshot({},'2026-07-18T12:00:00.000Z','America/Recife');
  assert.equal(result.resume,'observe');assert.equal(result.sampleSufficient,false);
  assert.equal(model.metric(result.sessions,result.sampleSufficient),'Amostra insuficiente');
});

test('retoma decidir, planejar e histórico conforme o ciclo avança',()=>{
  const now='2026-07-18T12:00:00.000Z',session={id:'x',status:'completed',endedAt:'2026-07-17T12:00:00.000Z'};
  const observed={executionSessions:[session]};assert.equal(model.snapshot(observed,now,'America/Recife').resume,'decide');
  const decided={...observed,weeklyReviews:[{id:'r',weekStart:'2026-07-13'}]};assert.equal(model.snapshot(decided,now,'America/Recife').resume,'plan');
  const planned={...decided,weeklyPlans:[{id:'p',weekStart:'2026-07-20',status:'confirmed'}]};assert.equal(model.snapshot(planned,now,'America/Recife').resume,'history');
});

test('resultados usam identidade estável e não são contados duas vezes',()=>{
  const data={evidence:[{id:'e1',createdAt:'2026-07-17T12:00:00.000Z'},{id:'e1',createdAt:'2026-07-17T12:00:00.000Z'}],weeklyPlans:[{id:'p1',weekStart:'2026-07-13',outcomes:[{id:'o1',description:'Entrega'},{id:'o1',description:'Entrega'}]}]};
  assert.equal(model.uniqueResults(data,'2026-07-13','America/Recife').length,2);
});

test('snapshot é determinístico e não altera coleções legadas',()=>{
  const data={weeklyReviews:[{id:'r1',weekStart:'2026-07-13'}],weeklyPlans:[],bookSyntheses:[{id:'b1'}]};const before=JSON.stringify(data);
  assert.deepEqual(model.snapshot(data,'2026-07-18T12:00:00.000Z','America/Recife'),model.snapshot(data,'2026-07-18T12:00:00.000Z','America/Recife'));
  assert.equal(JSON.stringify(data),before);
});
