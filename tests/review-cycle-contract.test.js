const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');

test('uma rota reúne Observar, Decidir, Planejar e Histórico',()=>{
  const feature=read('review-cycle-feature.js'),architecture=read('information-architecture-model.js');
  for(const label of ['Observar','Decidir','Planejar','Histórico'])assert.match(feature,new RegExp(label));
  assert.match(feature,/id=\"reviewCycleView\"/);assert.match(feature,/weeklyView/);assert.match(feature,/analyticsView/);assert.match(read('review-cycle-model.js'),/weeklyPlans/);
  assert.match(architecture,/reviewAliases/);assert.doesNotMatch(architecture,/id:'weekly',area:'review'/);
});

test('layout móvel não cria navegação horizontal global',()=>{
  const feature=read('review-cycle-feature.js');assert.match(feature,/@media\(max-width:720px\)/);assert.match(feature,/grid-template-columns:1fr 1fr/);assert.match(feature,/min-width:0/);
});
