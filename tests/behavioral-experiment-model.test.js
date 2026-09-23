const test=require('node:test');
const assert=require('node:assert/strict');
require('../learning-outcome-model.js');
const context=require('../capability-context-model.js');
const model=require('../behavioral-experiment-model.js');
const ref={outcomeId:'o1',attemptId:'a1',attemptText:'Apresentar arquitetura'};
const input={capabilityRef:ref,hypothesis:' Se eu ensaiar ',practice:' Ensaiar 5 minutos ',expectedOutcome:' Menos perda de raciocínio ',evidencePlan:' Anotar interrupções ',startDate:'2026-09-23',reviewDate:'2026-10-14'};
const now='2026-09-23T12:00:00.000Z';
test('cria plano v1 sem score nem mutação da capacidade',()=>{
  const before=structuredClone(ref),created=model.create(input,{id:'e1',now});
  assert.deepEqual(created,{id:'e1',schemaVersion:1,capabilityRef:ref,hypothesis:'Se eu ensaiar',practice:'Ensaiar 5 minutos',expectedOutcome:'Menos perda de raciocínio',evidencePlan:'Anotar interrupções',startDate:'2026-09-23',reviewDate:'2026-10-14',decision:null,resultNote:'',reviewedAt:null,createdAt:now,updatedAt:now});
  assert.deepEqual(ref,before);assert.doesNotMatch(JSON.stringify(created),/score|confidence|happiness|mastery/i);
});
test('presets cruzam mês e ano; 21 é apenas opção',()=>{
  assert.deepEqual(model.PRESETS,[7,14,21,30]);
  assert.equal(model.reviewDateForPreset('2026-12-20',14),'2027-01-03');
  assert.equal(model.reviewDateForPreset('2026-09-23',21),'2026-10-14');
  assert.throws(()=>model.reviewDateForPreset('2026-02-30',21),error=>error.code==='start-date-invalid');
  assert.throws(()=>model.reviewDateForPreset('2026-09-23',22),error=>error.code==='preset-invalid');
});
test('campos e datas inválidos não criam registro',()=>{
  for(const [field,code] of [['hypothesis','hypothesis-required'],['practice','practice-required'],['expectedOutcome','expected-outcome-required'],['evidencePlan','evidence-plan-required']])assert.throws(()=>model.create({...input,[field]:'  '}),error=>error.code===code);
  assert.throws(()=>model.create({...input,capabilityRef:null}),error=>error.code==='capability-required');
  assert.throws(()=>model.create({...input,reviewDate:'2026-09-23'}),error=>error.code==='review-date-invalid');
  assert.throws(()=>model.create({...input,startDate:'2026-02-30'}),error=>error.code==='start-date-invalid');
});
test('edição conserva identidade e revisão explícita fixa resultado e decisão',()=>{
  const first=model.create(input,{id:'e1',now});
  const edited=model.update(first,{...input,practice:'Dois ensaios'},{now:'2026-09-24T12:00:00Z'});
  assert.equal(edited.id,first.id);assert.equal(edited.capabilityRef.attemptId,'a1');assert.equal(first.practice,'Ensaiar 5 minutos');assert.equal(edited.decision,null);
  assert.throws(()=>model.review(edited,{decision:'keep',resultNote:' '}),error=>error.code==='result-required');
  assert.throws(()=>model.review(edited,{decision:'unknown',resultNote:'Funcionou'}),error=>error.code==='decision-invalid');
  const reviewed=model.review(edited,{decision:'adjust',resultNote:' Perdi a sequência uma vez '},{now:'2026-10-14T12:00:00Z'});
  assert.equal(reviewed.resultNote,'Perdi a sequência uma vez');assert.equal(reviewed.decision,'adjust');assert.equal(reviewed.reviewedAt,'2026-10-14T12:00:00Z');
  assert.throws(()=>model.update(reviewed,input),error=>error.code==='experiment-reviewed');
  assert.throws(()=>model.review(reviewed,{decision:'keep',resultNote:'x'}),error=>error.code==='experiment-reviewed');
});
test('normalização aditiva é idempotente, isola inválidos e preserva metadados de conflito',()=>{
  const item=model.create(input,{id:'e1',now});item.metadata={conflictOf:'other'};
  const once=model.normalizeCollection([item,{id:'bad'},null]);
  assert.deepEqual(once,[item]);assert.deepEqual(model.normalizeCollection(once),once);
  assert.deepEqual(model.normalizeCollection(undefined),[]);
  assert.deepEqual(context.normalizeCapabilityRef(once[0].capabilityRef),ref);
});
test('exclusão grava tombstone sem apagar capacidade nem dados legados',()=>{
  const item=model.create(input,{id:'e1',now});
  const state={behavioralExperiments:[item],learningOutcomes:[{id:'o1'}],notes:[{id:'n1'}]};
  const deleted=model.deleteFromState(state,'e1',{now:'2026-10-15T12:00:00Z'});
  assert.deepEqual(deleted.behavioralExperiments,[]);assert.equal(deleted._sync.tombstones['behavioralExperiments:e1'],'2026-10-15T12:00:00Z');
  assert.deepEqual(deleted.learningOutcomes,state.learningOutcomes);assert.deepEqual(deleted.notes,state.notes);assert.equal(state._sync,undefined);
});
