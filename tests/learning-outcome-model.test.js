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
  const full=model.archiveOutcome(model.createOutcome({capability:'Diagnosticar plano',proofCriterion:'Justificar o gargalo',nextAttempt:'Analisar caso novo',resourceRefs:[{type:'study',id:'s1'},{type:'reading',id:'r1'}]},{now:T1,idFactory:ids(['o1','a1'])}),{now:T2});
  assert.deepEqual(model.normalizeCollection(JSON.parse(JSON.stringify([full]))),[full]);
});
