const test=require('node:test');
const assert=require('node:assert/strict');
const plan=require('../weekly-plan-model.js');

test('calculates Monday and next week in the stored timezone',()=>{
  assert.equal(plan.weekStartKey('2026-07-12T23:30:00Z','America/Recife'),'2026-07-06');
  assert.equal(plan.nextWeekKey('2026-07-12T23:30:00Z','America/Recife'),'2026-07-13');
});

test('normalizes legacy drafts without losing identity or timestamps',()=>{
  const legacy={id:'wp-old',weekStart:'2026-07-13',goalRefs:['g1'],actionRefs:['goal:g1'],createdAt:'2026-07-01T00:00:00Z'};
  const normalized=plan.normalize(legacy,{timezone:'America/Recife'});
  assert.equal(normalized.id,'wp-old');
  assert.equal(normalized.status,'draft');
  assert.equal(normalized.createdAt,legacy.createdAt);
  assert.deepEqual(normalized.outcomes,[]);
});

test('requires goals, 2-3 outcomes and actions before confirmation',()=>{
  const base=plan.normalize({weekStart:'2026-07-13',goalRefs:['g1'],actionRefs:['goal:g1'],outcomes:[{description:'A'},{description:'B'}]});
  assert.equal(plan.canConfirm(base),true);
  assert.equal(plan.canConfirm({...base,outcomes:[{description:'A'}]}),false);
  assert.equal(plan.canConfirm({...base,actionRefs:[]}),false);
});

test('detects incomplete and demanding actions as risks',()=>{
  assert.deepEqual(plan.risk({}),['perfil incompleto']);
  const risks=plan.risk({workType:'deep',requiredEnergy:'high',estimatedMinutes:120});
  assert.ok(risks.includes('energia alta'));
  assert.ok(risks.includes('sessão longa'));
});

test('distribution uses only sufficient energy evidence',()=>{
  const actions=[{domain:'study',item:{id:'a',requiredEnergy:'high'}},{domain:'reading',item:{id:'b',requiredEnergy:'low'}}];
  const map={morning:{sufficient:true,mode:'high'},afternoon:{sufficient:false,mode:'low'}};
  const rows=plan.distribute(actions,map);
  assert.equal(rows[0].slot,'morning');
  assert.equal(rows[1].slot,'flexible');
});

test('confirmed snapshot fields are separate from action references',()=>{
  const normalized=plan.normalize({weekStart:'2026-07-13',actionRefs:['study:a'],snapshots:[{actionId:'a',title:'Original'}]});
  normalized.actionRefs.push('reading:b');
  assert.deepEqual(normalized.snapshots,[{actionId:'a',title:'Original'}]);
});

