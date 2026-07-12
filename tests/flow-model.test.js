const test=require('node:test');
const assert=require('node:assert/strict');
const flow=require('../flow-model.js');

const input={energy:'medium',minutes:45,context:'computer',concentration:true,now:'2026-07-12T12:00:00Z'};
const action=(id,overrides={})=>({domain:'study',item:{id,title:id,status:'active',workType:'shallow',requiredEnergy:'medium',estimatedMinutes:30,workContext:'computer',priority:'medium',...overrides}});

test('filters incompatible time, energy, context and concentration',()=>{
  assert.equal(flow.evaluate(action('time',{estimatedMinutes:60}),input).code,'insufficient_time');
  assert.equal(flow.evaluate(action('energy',{requiredEnergy:'high'}),input).code,'insufficient_energy');
  assert.equal(flow.evaluate(action('context',{workContext:'home'}),input).code,'context_mismatch');
  assert.equal(flow.evaluate(action('deep',{workType:'deep'}),{...input,concentration:false}).code,'concentration_required');
});

test('returns at most three deterministic recommendations',()=>{
  const entries=[action('d'),action('b'),action('a'),action('c')];
  const first=flow.recommend(entries,input,{limit:3}).map(x=>x.key);
  const second=flow.recommend(entries,input,{limit:3}).map(x=>x.key);
  assert.deepEqual(first,second);
  assert.equal(first.length,3);
  assert.equal(first[0],'study:a');
});

test('manual rejection hides only the current recommendation',()=>{
  const entries=[action('a'),action('b')];
  assert.deepEqual(flow.recommend(entries,input,{rejectedIds:['a']}).map(x=>x.item.id),['b']);
  assert.equal(entries.length,2);
});

test('missing legacy fields stay eligible with explicit penalties',()=>{
  const result=flow.evaluate(action('legacy',{workType:null,requiredEnergy:null,estimatedMinutes:null,workContext:null}),input);
  assert.equal(result.eligible,true);
  assert.deepEqual(result.missing.sort(),['context','duration','energy','profile']);
  assert.equal(result.score<=0,true);
});

test('deadline weight is capped below weekly focus',()=>{
  const focused=action('focus',{dueDate:null,priority:null});
  const urgent=action('urgent',{dueDate:'2026-07-12',priority:null});
  const ranked=flow.recommend([urgent,focused],input,{focusTitles:new Set(['focus'])});
  assert.equal(ranked[0].item.id,'focus');
  assert.equal(flow.WEIGHTS.dueSoon,15);
  assert.equal(flow.WEIGHTS.focus,30);
});

test('no candidates returns an empty list',()=>{
  assert.deepEqual(flow.recommend([action('x',{status:'done'})],input),[]);
});

