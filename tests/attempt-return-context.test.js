const test=require('node:test');
const assert=require('node:assert/strict');
const outcomeModel=require('../learning-outcome-model.js');
const model=require('../capability-context-model.js');
const TODAY='2026-10-02';
const localTime=day=>{const [y,m,d]=day.split('-').map(Number);return new Date(y,m-1,d,12).toISOString()};
function fixture(days=['2026-09-29','2026-09-30','2026-10-01',TODAY]){
  const outcome=outcomeModel.createOutcome({capability:'Explicar joins',nextAttempt:'Comparar dois planos'},{now:localTime('2026-09-01'),idFactory:p=>p==='outcome'?'o1':'a1'});
  return{learningOutcomes:[outcome],dailyPlans:days.map(day=>({id:'day-'+day,date:day,items:[model.createTodayItem(outcome,{id:'item-'+day,now:localTime(day)})]})),executionSessions:[],sessions:[],deepWorkSessions:[]};
}
const select=data=>model.selectAttemptReturnContext('o1',data,{today:TODAY});
test('retornos explícitos em três dias anteriores e hoje produzem contexto puro e determinístico',()=>{
  const data=fixture(),before=structuredClone(data),result=select(data);
  assert.deepEqual(result.dates,['2026-09-29','2026-09-30','2026-10-01']);
  assert.deepEqual(result.capabilityRef,{outcomeId:'o1',attemptId:'a1',attemptText:'Comparar dois planos'});
  assert.deepEqual(select(data),result);assert.deepEqual(data,before);
  result.dates.push('changed');result.capabilityRef.attemptText='changed';assert.equal(select(data).dates.length,3);
});
test('ausência de sessões não prova retorno e hoje não conta no limiar',()=>{
  assert.equal(select(fixture([])),null);assert.equal(select(fixture(['2026-09-30','2026-10-01',TODAY])),null);
  assert.equal(select(fixture(['2026-09-29','2026-09-30','2026-10-01'])),null);
});
test('janela de 14 dias aceita borda; planos antigos e futuros não contam',()=>{
  assert.ok(select(fixture(['2026-09-18','2026-09-20','2026-10-01',TODAY])));
  assert.equal(select(fixture(['2026-09-17','2026-09-20','2026-10-01',TODAY])),null);
  assert.equal(select(fixture(['2026-09-30','2026-10-01','2026-10-03',TODAY])),null);
  for(const today of ['',null,'2026-02-30','2026-1-02','invalid'])assert.equal(model.selectAttemptReturnContext('o1',fixture(),{today}),null);
});
test('IDs copiados, dias duplicados e metadados de conflito não geram ocasiões',()=>{
  for(const change of [d=>d.dailyPlans[1].items[0].id=d.dailyPlans[0].items[0].id,d=>d.dailyPlans.push(structuredClone(d.dailyPlans[0])),d=>d.dailyPlans[0].metadata={conflictOf:'another'},d=>d.dailyPlans[0].items[0].metadata={conflictOf:'another'},d=>d.dailyPlans[1].id=d.dailyPlans[0].id]){
    const d=fixture();change(d);assert.equal(select(d),null);
  }
  const d=fixture();d.dailyPlans[0].items.push({...d.dailyPlans[0].items[0],id:'other-same-day'});assert.equal(select(d).dates.length,3);
});
test('campos incompletos e datas incoerentes não são normalizados em evidência',()=>{
  for(const change of [d=>delete d.dailyPlans[0].items[0].createdAt,d=>delete d.dailyPlans[0].items[0].completedAt,d=>d.dailyPlans[0].items[0].completedAt=false,d=>d.dailyPlans[0].items[0].createdAt='bad',d=>d.dailyPlans[0].items[0].createdAt=localTime('2026-09-28'),d=>d.dailyPlans[0].date='2026-02-30',d=>delete d.dailyPlans[0].id,d=>delete d.dailyPlans[0].items[0].capabilityRef.attemptText,d=>delete d.learningOutcomes[0].nextAttempt.updatedAt]){
    const d=fixture();change(d);assert.equal(select(d),null);
  }
});
test('mudança textual com mesmo ID e edição seguida de reversão invalidam versões anteriores',()=>{
  const d=fixture();d.learningOutcomes[0]=outcomeModel.updateOutcome(d.learningOutcomes[0],{nextAttempt:'Comparar um plano'},{now:localTime('2026-10-01')});assert.equal(select(d),null);
  d.learningOutcomes[0]=outcomeModel.updateOutcome(d.learningOutcomes[0],{nextAttempt:'Comparar dois planos'},{now:localTime(TODAY)});assert.equal(select(d),null);
  const benefit=fixture();benefit.learningOutcomes[0]=outcomeModel.updateOutcome(benefit.learningOutcomes[0],{benefit:'Autonomia'},{now:localTime(TODAY)});assert.ok(select(benefit));
});
test('versão revisada pode construir três novas ocasiões sem reaproveitar as antigas',()=>{
  const d=fixture(['2026-09-20','2026-09-29','2026-09-30','2026-10-01',TODAY]);
  d.learningOutcomes[0].nextAttempt.updatedAt=localTime('2026-09-25');assert.equal(select(d).dates.length,3);
});
test('conclusão em qualquer plano da identidade suprime, mesmo fora da janela ou texto anterior',()=>{
  for(const completion of ['2026-09-29','2026-09-01']){const d=fixture();const old=fixture([completion]).dailyPlans[0];old.items[0].completedAt=localTime(completion);old.items[0].capabilityRef.attemptText='Texto antigo';d.dailyPlans.push(old);assert.equal(select(d),null)}
});
test('qualquer execução vinculada suprime; sem vínculo ou outra tentativa não são inferidas',()=>{
  for(const name of ['executionSessions','sessions','deepWorkSessions'])for(const status of ['running','paused','interrupted','completed']){
    const d=fixture();d[name]=[{id:'execution',status,learningContext:model.createCapabilityRef(d.learningOutcomes[0]),startedAt:localTime('2026-09-29')}];assert.equal(select(d),null);
  }
  const d=fixture();d.executionSessions=[{id:'unlinked',title:'Comparar dois planos'},{id:'other',learningContext:{outcomeId:'o1',attemptId:'other'}}];assert.ok(select(d));
});
test('capacidade ausente, arquivada ou duplicada e referência diferente suprimem',()=>{
  for(const change of [d=>d.learningOutcomes=[],d=>d.learningOutcomes[0].status='archived',d=>d.learningOutcomes.push(structuredClone(d.learningOutcomes[0])),d=>d.learningOutcomes[0].nextAttempt.id='new',d=>d.dailyPlans[3].items[0].capabilityRef.attemptText='old']){const d=fixture();change(d);assert.equal(select(d),null)}
});
test('conflitos de sync relevantes bloqueiam; conflitos de recurso alheio não',()=>{
  for(const conflict of [{collection:'learningOutcomes',key:'o1'},{collection:'dailyPlans',key:'day-2026-09-29'},{collection:'dailyPlans',key:'other',preservedAs:'day-2026-09-29'}]){const d=fixture();d._sync={conflicts:[conflict]};assert.equal(select(d),null)}
  const d=fixture();d._sync={conflicts:[{collection:'study',key:'s1'}]};assert.ok(select(d));
});
