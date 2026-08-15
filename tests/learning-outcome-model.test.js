const test=require('node:test');
const assert=require('node:assert/strict');
const model=require('../learning-outcome-model.js');

const T1='2026-08-08T10:00:00.000Z';
const T2='2026-08-08T11:00:00.000Z';
const ids=values=>{let index=0;return()=>values[index++]};
const minimal=()=>model.createOutcome({capability:'  Explicar shuffle  ',nextAttempt:'  Analisar um plano  '},{now:T1,idFactory:ids(['o1','a1'])});

test('cria capacidade mínima canônica sem progresso ou semântica futura',()=>{
  const outcome=minimal();
  assert.deepEqual(outcome,{
    id:'o1',capability:'Explicar shuffle',proofCriterion:null,resourceRefs:[],
    nextAttempt:{id:'a1',text:'Analisar um plano',createdAt:T1,updatedAt:T1},
    status:'active',archivedAt:null,createdAt:T1,updatedAt:T1
  });
  for(const forbidden of ['progress','percentage','mastery','confidence','completedAt','demonstratedAt','evidenceIds','sessionId'])assert.equal(forbidden in outcome,false);
});

test('capacidade e tentativa são obrigatórias sem policiamento semântico',()=>{
  assert.throws(()=>model.createOutcome({capability:'   ',nextAttempt:'x'}),error=>error.code==='capability-required');
  assert.throws(()=>model.createOutcome({capability:'x',nextAttempt:'   '}),error=>error.code==='attempt-required');
  assert.equal(model.createOutcome({capability:'x',nextAttempt:'Assistir aula 3'},{now:T1,idFactory:ids(['o','a'])}).nextAttempt.text,'Assistir aula 3');
});

test('futureUse centraliza os sete valores, rótulos e ausência canônica',()=>{
  assert.deepEqual(model.FUTURE_USES,['remember','explain','solve','build','decide','simulate','integrate']);
  assert.equal(model.futureUsePresentation('remember').label,'Lembrar com precisão');
  assert.equal(model.futureUsePresentation('simulate').label,'Praticar em condições reais ou de prova');
  assert.equal(model.normalizeFutureUse(' unknown '),null);
  assert.equal(model.futureUsePresentation(''),null);
  assert.ok(Object.isFrozen(model.FUTURE_USES));
  assert.ok(Object.isFrozen(model.FUTURE_USE_PRESENTATIONS));
});

test('cria, edita e limpa futureUse atomicamente sob a identidade da tentativa',()=>{
  const created=model.createOutcome({capability:'Aplicar joins',nextAttempt:{text:'Resolver caso novo',futureUse:'solve'}},{now:T1,idFactory:ids(['o1','a1'])});
  assert.equal(created.nextAttempt.futureUse,'solve');
  const edited=model.updateOutcome(created,{nextAttempt:{text:'Construir consulta',futureUse:'build'}},{now:T2});
  assert.equal(edited.nextAttempt.id,'a1');assert.equal(edited.nextAttempt.createdAt,T1);assert.equal(edited.nextAttempt.updatedAt,T2);
  assert.deepEqual({text:edited.nextAttempt.text,futureUse:edited.nextAttempt.futureUse},{text:'Construir consulta',futureUse:'build'});
  const cleared=model.updateOutcome(edited,{nextAttempt:{text:'Construir consulta',futureUse:null}},{now:'2026-08-08T12:00:00.000Z'});
  assert.equal('futureUse' in cleared.nextAttempt,false);assert.equal(cleared.nextAttempt.updatedAt,'2026-08-08T12:00:00.000Z');
});

test('updates legados preservam futureUse e comando inválido não muta entrada',()=>{
  const base=model.createOutcome({capability:'Explicar',nextAttempt:{text:'Ensaiar',futureUse:'explain'}},{now:T1,idFactory:ids(['o1','a1'])});
  assert.equal(model.updateOutcome(base,{nextAttempt:'Ensaiar melhor'},{now:T2}).nextAttempt.futureUse,'explain');
  assert.equal(model.updateOutcome(base,{nextAttempt:{text:'Ensaiar melhor'}},{now:T2}).nextAttempt.futureUse,'explain');
  assert.equal(model.updateOutcome(base,{capability:'Explicar com exemplo'},{now:T2}).nextAttempt.futureUse,'explain');
  const snapshot=JSON.parse(JSON.stringify(base));
  assert.throws(()=>model.updateOutcome(base,{nextAttempt:{text:'Outro texto',futureUse:'automatic'}},{now:T2}),error=>error.code==='future-use-invalid');
  assert.throws(()=>model.createOutcome({capability:'C',nextAttempt:{text:'T',futureUse:'automatic'}}),error=>error.code==='future-use-invalid');
  assert.deepEqual(base,snapshot);
});

test('valor persistido desconhecido degrada apenas para ausência e normaliza idempotentemente',()=>{
  const loaded={id:'o1',capability:'Resolver',nextAttempt:{id:'a1',text:'Caso',futureUse:'legacy-mode',createdAt:T1,updatedAt:T1},createdAt:T1,updatedAt:T1};
  const once=model.normalizeOutcome(loaded),twice=model.normalizeOutcome(once);
  assert.equal(once.id,'o1');assert.equal(once.nextAttempt.text,'Caso');assert.equal('futureUse' in once.nextAttempt,false);assert.deepEqual(twice,once);
  const context=model.normalizeExecutionContext({outcomeId:'o1',attemptId:'a1',attemptText:'Caso',futureUse:'legacy-mode'});
  assert.deepEqual(context,{outcomeId:'o1',attemptId:'a1',attemptText:'Caso'});
});

test('critério opcional normaliza para string ou null e pode ser removido',()=>{
  const base=minimal();
  const added=model.updateOutcome(base,{proofCriterion:'  Resolver sem consulta  '},{now:T2});
  assert.equal(added.proofCriterion,'Resolver sem consulta');
  const removed=model.updateOutcome(added,{proofCriterion:'   '},{now:'2026-08-08T12:00:00.000Z'});
  assert.equal(removed.proofCriterion,null);
});

test('referências tipadas deduplicam sem alterar recursos',()=>{
  const study={id:'s1',title:'Curso',progress:100};const reading={id:'r1',title:'Livro',progress:0};
  const before=JSON.parse(JSON.stringify({study,reading}));
  const outcome=model.createOutcome({capability:'Aplicar',nextAttempt:'Resolver',resourceRefs:[{type:'study',id:'s1'},{type:'study',id:'s1'},{type:'reading',id:'r1'},{type:'goal',id:'g1'},{type:'study',id:''}]},{now:T1,idFactory:ids(['o','a'])});
  assert.deepEqual(outcome.resourceRefs,[{type:'study',id:'s1'},{type:'reading',id:'r1'}]);
  assert.deepEqual({study,reading},before);
  assert.deepEqual(model.resolveRefs(outcome,{study:[study],reading:[reading]}).map(x=>[x.type,x.available]),[['study',true],['reading',true]]);
});

test('referência ausente é preservada e resolvida como indisponível',()=>{
  const outcome={...minimal(),resourceRefs:[{type:'study',id:'missing'}]};
  const normalized=model.normalizeOutcome(outcome);
  assert.deepEqual(normalized.resourceRefs,[{type:'study',id:'missing'}]);
  assert.deepEqual(model.resolveRefs(normalized,{study:[],reading:[]}),[{type:'study',id:'missing',available:false,title:null}]);
});

test('editar preserva identidade da tentativa e atualiza timestamps',()=>{
  const base=minimal();
  const updated=model.updateOutcome(base,{capability:'Explicar groupBy',nextAttempt:'Prever o plano'},{now:T2});
  assert.equal(updated.nextAttempt.id,'a1');
  assert.equal(updated.nextAttempt.createdAt,T1);
  assert.equal(updated.nextAttempt.updatedAt,T2);
  assert.equal(updated.updatedAt,T2);
  assert.throws(()=>model.updateOutcome(base,{nextAttempt:''},{now:T2}),error=>error.code==='attempt-required');
});

test('editar apenas a capacidade preserva timestamps da tentativa',()=>{
  const base=minimal();
  const updated=model.updateOutcome(base,{capability:'Explicar groupBy com exemplo'},{now:T2});
  assert.equal(updated.nextAttempt.updatedAt,T1);
  assert.equal(updated.updatedAt,T2);
});

test('arquiva e reativa sem tocar conteúdo ou recursos',()=>{
  const base={...minimal(),resourceRefs:[{type:'reading',id:'r1'}]};
  const archived=model.archiveOutcome(base,{now:T2});
  assert.equal(archived.status,'archived');assert.equal(archived.archivedAt,T2);
  assert.deepEqual(archived.resourceRefs,base.resourceRefs);assert.equal(archived.capability,base.capability);
  const active=model.reactivateOutcome(archived,{now:'2026-08-08T12:00:00.000Z'});
  assert.equal(active.status,'active');assert.equal(active.archivedAt,null);
});

test('exclusão cria tombstone e preserva todos os domínios não relacionados',()=>{
  const state={learningOutcomes:[minimal()],study:[{id:'s1'}],reading:[{id:'r1'}],goal:[{id:'g1'}],notes:[{id:'n1'}],evidence:[{id:'e1'}],sessions:[{id:'x'}],dailyPlans:[{id:'d'}],weeklyPlans:[{id:'w'}],journalEntries:[{id:'j'}],legacy:{keep:true}};
  const before=JSON.parse(JSON.stringify(state));
  const next=model.deleteOutcome(state,'o1',{now:T2});
  assert.deepEqual(next.learningOutcomes,[]);
  assert.equal(next._sync.tombstones['learningOutcomes:o1'],T2);
  for(const key of ['study','reading','goal','notes','evidence','sessions','dailyPlans','weeklyPlans','journalEntries','legacy'])assert.deepEqual(next[key],before[key]);
  assert.deepEqual(state,before);
});

test('normalização é idempotente, rejeita entradas inválidas e não fabrica conteúdo',()=>{
  const input=[
    null,{id:'bad',capability:'',nextAttempt:'x'},
    {id:'o1',capability:' Capacidade ',proofCriterion:' ',resourceRefs:[{type:'study',id:'s1'},{type:'study',id:'s1'}],nextAttempt:' Tentar ',status:'unexpected'},
    {id:'o1',capability:'Mais nova',nextAttempt:{text:'Outra'},updatedAt:T2,createdAt:T1}
  ];
  const once=model.normalizeCollection(input),twice=model.normalizeCollection(once);
  assert.deepEqual(twice,once);assert.equal(once.length,1);assert.equal(once[0].capability,'Mais nova');
  assert.equal(once[0].nextAttempt.id,'o1:next');assert.equal(once[0].status,'active');
  assert.deepEqual(model.normalizeCollection({}),[]);
});

test('normaliza datas deterministicamente e preserva registro arquivado',()=>{
  const value=model.normalizeOutcome({id:'o',capability:'C',nextAttempt:{text:'T'},status:'archived',createdAt:'bad',updatedAt:'bad'});
  assert.equal(value.createdAt,model.EPOCH);assert.equal(value.updatedAt,model.EPOCH);assert.equal(value.archivedAt,model.EPOCH);
  assert.deepEqual(model.normalizeOutcome(value),value);
});

test('ordenação é atualizada, criada e id em ordem determinística',()=>{
  const make=(id,updatedAt,createdAt)=>({id,capability:id,nextAttempt:{id:`${id}:a`,text:'x',createdAt,updatedAt},status:'active',archivedAt:null,createdAt,updatedAt});
  const sorted=model.sortOutcomes([make('b',T2,T1),make('a',T2,T1),make('c',T1,T1)]);
  assert.deepEqual(sorted.map(x=>x.id),['a','b','c']);
});

test('ordenação inclui arquivadas por padrão e permite filtro explícito',()=>{
  const active=minimal();
  const archived={...minimal(),id:'o2',status:'archived',archivedAt:T2,updatedAt:T2};
  assert.deepEqual(model.sortOutcomes([active,archived]).map(item=>item.id),['o2','o1']);
  assert.deepEqual(model.sortOutcomes([active,archived],'active').map(item=>item.id),['o1']);
  assert.deepEqual(model.sortOutcomes([active,archived],'archived').map(item=>item.id),['o2']);
});

test('round-trip JSON preserva capacidade completa, arquivo e referências',()=>{
  const full=model.archiveOutcome(model.createOutcome({capability:'Diagnosticar plano',proofCriterion:'Justificar o gargalo',nextAttempt:{text:'Analisar caso novo',futureUse:'decide'},resourceRefs:[{type:'study',id:'s1'},{type:'reading',id:'r1'}]},{now:T1,idFactory:ids(['o1','a1'])}),{now:T2});
  assert.deepEqual(model.normalizeCollection(JSON.parse(JSON.stringify([full]))),[full]);
});

test('contexto de execução captura a tentativa atual e normaliza apenas a forma completa',()=>{
  const outcome=model.createOutcome({capability:'Explicar shuffle',nextAttempt:{text:'Analisar um plano',futureUse:'explain'}},{now:T1,idFactory:ids(['o1','a1'])}),context=model.createExecutionContext(outcome);
  assert.deepEqual(context,{outcomeId:'o1',attemptId:'a1',attemptText:'Analisar um plano',futureUse:'explain'});
  model.updateOutcome(outcome,{nextAttempt:{text:'Outra tentativa',futureUse:'build'}},{now:T2});
  assert.deepEqual(context,{outcomeId:'o1',attemptId:'a1',attemptText:'Analisar um plano',futureUse:'explain'});
  assert.deepEqual(model.normalizeExecutionContext({...context,attemptText:'  Analisar um plano  '}),context);
  for(const value of [null,{}, {outcomeId:'o1',attemptId:'a1'}, {outcomeId:'o1',attemptId:'',attemptText:'x'}])assert.equal(model.normalizeExecutionContext(value),null);
});
