const test=require('node:test');
const assert=require('node:assert/strict');
const model=require('../weekly-friction-model.js');
const manifest=require('../app-manifest.js');
const input={task:'Comparar planos',reason:'unclear',adjustment:'Ler um plano',blockers:'Texto antigo',decision:'Decisão antiga'};
test('fricção compõe apenas texto declarado e mantém conteúdo anterior',()=>{
 const before=structuredClone(input),result=model.compose(input);
 assert.equal(result.blockers,'Texto antigo\n\nTentativa: Comparar planos\nDificuldade: Primeiro passo pouco claro');
 assert.equal(result.decision,'Decisão antiga\n\nAjuste a testar: Ler um plano');assert.equal(result.adjustment,'Ler um plano');assert.deepEqual(input,before);
});
test('sete razões opcionais, inclusive Outro, sem classificação inferida',()=>{
 assert.equal(Object.keys(model.REASONS).length,7);
 for(const reason of ['',...Object.keys(model.REASONS)]){const result=model.compose({...input,reason});assert.equal(result.blockers.includes('Dificuldade:'),Boolean(reason));}
 assert.throws(()=>model.compose({...input,reason:'diagnosis'}),error=>error.field==='reason');
});
test('vazio e dados malformados não produzem decisão',()=>{
 for(const value of [undefined,null,{},[],42,'  ']){assert.throws(()=>model.compose({...input,task:value}),error=>error.field==='task');assert.throws(()=>model.compose({...input,adjustment:value}),error=>error.field==='adjustment');}
});
test('reaplicar o mesmo relato e ajuste não duplica os parágrafos',()=>{
 const once=model.compose(input),twice=model.compose({...input,...once});assert.deepEqual(twice,once);
});
test('limites completos são inclusivos e nunca truncam texto anterior',()=>{
 assert.equal(model.compose({task:'x',adjustment:'a'.repeat(583)}).decision.length,600);
 assert.throws(()=>model.compose({task:'x',adjustment:'a'.repeat(584)}),error=>error.field==='decision');
 assert.throws(()=>model.compose({...input,blockers:'b'.repeat(600)}),error=>error.field==='blockers');
 assert.throws(()=>model.compose({...input,task:'t'.repeat(241)}),error=>error.field==='task');
});
const outcome={id:'cap1',status:'active',nextAttempt:{id:'attempt1',text:'Comparar planos',updatedAt:'2026-10-03T10:00:00Z'}};
const ref={outcomeId:'cap1',attemptId:'attempt1',attemptText:'Comparar planos',updatedAt:outcome.nextAttempt.updatedAt};
test('alvo exige identidade, versão textual e estado atuais sem ambiguidade',()=>{
 assert.equal(model.currentTarget(ref,[outcome]),outcome);
 for(const item of [{...outcome,status:'archived'},{...outcome,metadata:{conflictOf:'old'}},{...outcome,nextAttempt:{...outcome.nextAttempt,id:'new'}},{...outcome,nextAttempt:{...outcome.nextAttempt,text:'Outro plano'}},{...outcome,nextAttempt:{...outcome.nextAttempt,updatedAt:'2026-10-04T10:00:00Z'}}])assert.equal(model.currentTarget(ref,[item]),null);
 assert.equal(model.currentTarget(ref,[]),null);assert.equal(model.currentTarget(ref,[outcome,outcome]),null);assert.equal(model.currentTarget(null,[outcome]),null);
});
test('modelo de fricção compõe offline antes da revisão e mantém contrato de dados',()=>{
 const files=manifest.modules.map(item=>item.file);assert.ok(files.indexOf('weekly-friction-model.js')<files.indexOf('weekly-review-feature.js'));
 assert.ok(manifest.modules.find(item=>item.file==='weekly-friction-model.js').browserJourney);assert.ok(manifest.assets.includes('./weekly-friction-model.js'));
 assert.equal(manifest.contracts.state,'compasso.state.v3');assert.ok(!manifest.collections.some(item=>/friction|procrastination/i.test(item.name)));
});
