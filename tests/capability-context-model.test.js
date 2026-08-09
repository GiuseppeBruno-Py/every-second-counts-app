const test=require('node:test');
const assert=require('node:assert/strict');
const outcomeModel=require('../learning-outcome-model.js');
const model=require('../capability-context-model.js');

const T1='2026-08-09T10:00:00.000Z';
const T2='2026-08-09T11:00:00.000Z';
const T3='2026-08-09T12:00:00.000Z';
const outcome=(overrides={})=>({...outcomeModel.createOutcome({capability:'Explicar joins',nextAttempt:'Comparar dois planos',resourceRefs:[{type:'study',id:'s1'}]},{now:T1,idFactory:prefix=>prefix==='outcome'?'o1':'a1'}),...overrides});
const ref={outcomeId:'o1',attemptId:'a1',attemptText:'Comparar dois planos'};

test('capabilityRef exige as três partes e usa a tentativa atual de uma capacidade ativa',()=>{
  assert.deepEqual(model.createCapabilityRef(outcome()),ref);
  assert.equal(model.createCapabilityRef(outcome({status:'archived',archivedAt:T2})),null);
  assert.equal(model.normalizeCapabilityRef({outcomeId:'o1',attemptId:'a1'}),null);
  assert.deepEqual(model.normalizeCapabilityRef({...ref,attemptText:'  Comparar dois planos  '}),ref);
});

test('resolução usa texto vivo apenas para a mesma tentativa e preserva snapshot ausente',()=>{
  const live=outcomeModel.updateOutcome(outcome(),{nextAttempt:'Comparar três planos'},{now:T2});
  assert.equal(model.resolveCapabilityRef(ref,[live]).attemptText,'Comparar três planos');
  assert.equal(model.resolveCapabilityRef({...ref,attemptId:'old'},[live]).attemptText,'Comparar dois planos');
  assert.deepEqual(model.resolveCapabilityRef(ref,[]),{capabilityRef:ref,outcome:null,available:false,active:false,current:false,attemptText:'Comparar dois planos'});
});

test('item de Hoje é aditivo, deduplica por capacidade/tentativa e não toca itens legados',()=>{
  const legacy={domain:'study',itemId:'s1',completedAt:null};
  const plan={id:'day-1',items:[legacy],updatedAt:T1};
  const once=model.addTodayItem(plan,outcome(),{id:'t1',now:T2});
  const twice=model.addTodayItem(once,outcome(),{id:'t2',now:T3});
  assert.deepEqual(twice.items[0],legacy);
  assert.equal(twice.items.filter(item=>item.type==='capability-attempt').length,1);
  assert.deepEqual(model.normalizeTodayItem(twice.items[1]),{id:'t1',type:'capability-attempt',capabilityRef:ref,completedAt:null,createdAt:T2});
  assert.equal(model.normalizeTodayItem({id:'bad',type:'capability-attempt',capabilityRef:{outcomeId:'o1'}}),null);
});

test('learningSignals cria, atualiza, normaliza e preserva metadados compatíveis',()=>{
  const created=model.createSignal({capabilityRef:ref,kind:'gap',text:'  Confundo a ordem  ',sourceRef:{type:'evidence',id:'e1'}},{id:'sig1',now:T1});
  assert.deepEqual(created,{id:'sig1',schemaVersion:1,capabilityRef:ref,kind:'gap',text:'Confundo a ordem',sourceRef:{type:'evidence',id:'e1'},origin:'learner',createdAt:T1,updatedAt:T1});
  const updated=model.updateSignal({...created,metadata:{keep:true}},{kind:'insight',text:'Usar uma tabela'},{now:T2});
  assert.equal(updated.kind,'insight');assert.equal(updated.text,'Usar uma tabela');assert.deepEqual(updated.metadata,{keep:true});assert.equal(updated.createdAt,T1);assert.equal(updated.updatedAt,T2);
  assert.deepEqual(model.normalizeSignalCollection([created,updated,{id:'bad'}]),[updated]);
  assert.deepEqual(model.normalizeSignalCollection(model.normalizeSignalCollection([updated])),[updated]);
});

test('sugestão só se torna durável pela criação explícita confirmada',()=>{
  const runtimeSuggestion={capabilityRef:ref,kind:'question',text:'Por que o shuffle ocorre?'};
  assert.equal('id' in runtimeSuggestion,false);
  const confirmed=model.createSignal({...runtimeSuggestion,origin:'confirmed-suggestion'},{id:'sig-confirmed',now:T1});
  assert.equal(confirmed.origin,'confirmed-suggestion');
  assert.equal(model.normalizeSignalCollection([runtimeSuggestion]).length,0);
});

test('exclusão de sinal grava tombstone sem apagar fonte, capacidade ou domínios legados',()=>{
  const signal=model.createSignal({capabilityRef:ref,kind:'feedback',text:'Funcionou',sourceRef:{type:'execution',id:'x1'}},{id:'sig1',now:T1});
  const input={learningSignals:[signal],learningOutcomes:[outcome()],executionSessions:[{id:'x1'}],notes:[{id:'n1'}],legacy:{keep:true}};
  const next=model.deleteSignal(input,'sig1',{now:T2});
  assert.deepEqual(next.learningSignals,[]);assert.equal(next._sync.tombstones['learningSignals:sig1'],T2);
  for(const key of ['learningOutcomes','executionSessions','notes','legacy'])assert.deepEqual(next[key],input[key]);
});

test('reflexão semanal mantém uma entrada por capacidade e revisão exige texto explícito',()=>{
  const keep=model.createReflection({capabilityRef:ref,reflection:'A comparação ajudou',decision:'keep'},{now:T1});
  assert.equal(keep.decidedAttemptText,ref.attemptText);
  assert.throws(()=>model.createReflection({capabilityRef:ref,decision:'revise',decidedAttemptText:' '}),error=>error.code==='attempt-required');
  const review=model.upsertReflection({id:'wr1',capabilityReflections:[keep]}, {capabilityRef:ref,reflection:'Mudar o caso',decision:'revise',decidedAttemptText:'Comparar planos reais'},{now:T2});
  assert.equal(review.capabilityReflections.length,1);assert.equal(review.capabilityReflections[0].decision,'revise');assert.equal(review.updatedAt,T2);
});

test('Evidence resolve contexto somente por sessionId canônico e nunca por domínio ou item',()=>{
  const executions=new Map([['x1',{id:'x1',learningContext:ref}]]);
  assert.deepEqual(model.evidenceContext({id:'e1',sessionId:'x1',domain:'study',itemId:'s1'},executions),ref);
  assert.equal(model.evidenceContext({id:'legacy',sessionId:'missing',domain:'study',itemId:'s1'},executions),null);
  assert.equal(model.evidenceContext({id:'legacy',domain:'learningOutcome',itemId:'o1'},executions),null);
});

test('projeções indexadas mantêm atividade vinculada e não vinculada sem inferência por recurso',()=>{
  const linked={id:'x1',status:'completed',domain:'study',itemId:'s1',learningContext:ref,endedAt:T2};
  const unlinked={id:'x2',status:'completed',domain:'study',itemId:'s1',learningContext:null,endedAt:T2};
  const evidence={id:'e1',sessionId:'x1',domain:'study',itemId:'s1'};
  const signal=model.createSignal({capabilityRef:ref,kind:'question',text:'O que muda?',sourceRef:{type:'evidence',id:'e1'}},{id:'sig1',now:T2});
  const review={id:'wr1',capabilityReflections:[model.createReflection({capabilityRef:ref,decision:'keep'},{now:T3})]};
  const data={learningOutcomes:[outcome()],executionSessions:[linked,unlinked],evidence:[evidence],learningSignals:[signal],weeklyReviews:[review],dailyPlans:[]};
  const summary=model.capabilitySummary('o1',data);
  assert.deepEqual(summary.executions.map(item=>item.id),['x1']);assert.deepEqual(summary.evidence.map(item=>item.id),['e1']);assert.deepEqual(summary.signals.map(item=>item.id),['sig1']);assert.equal(summary.latestReflection.decision,'keep');
  assert.deepEqual(model.filterExecutionsByCapability([linked,unlinked],'unlinked').map(item=>item.id),['x2']);
  assert.deepEqual(model.filterExecutionsByCapability([linked,unlinked],'o1').map(item=>item.id),['x1']);
  assert.deepEqual(model.capabilitiesForResource('study','s1',[outcome()]).map(item=>item.id),['o1']);
});

test('modelo não introduz progresso, domínio paralelo nem inferência',()=>{
  const signal=model.createSignal({capabilityRef:ref,kind:'insight',text:'Usar amostra menor'},{id:'sig1',now:T1});
  for(const forbidden of ['progress','percentage','mastery','confidence','completion','score','ranking','streak','sessionId','evidenceId'])assert.equal(forbidden in signal,false);
  assert.equal(model.executionContext({domain:'learningOutcome',itemId:'o1'}),null);
});
