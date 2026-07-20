const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');

test('falha oferece recuperação de cache sem apagar dados locais',()=>{
  const diagnostic=read('bootstrap-diagnostics.js');
  assert.match(diagnostic,/compasso-pages-/);assert.match(diagnostic,/registration\.unregister/);
  assert.doesNotMatch(diagnostic,/localStorage\.(clear|removeItem)/);assert.doesNotMatch(diagnostic,/indexedDB\.deleteDatabase/);
  assert.match(diagnostic,/Atualizar e tentar novamente/);assert.match(diagnostic,/Detalhe:/);
});

test('registro muda com a versão e só recarrega automaticamente o PWA instalado',()=>{
  const html=read('index.html');assert.match(html,/service-worker\.js\?version=/);assert.match(html,/controllerchange/);assert.match(html,/display-mode: standalone/);assert.match(html,/compasso\.sw\.reload/);assert.match(html,/registration\.update\(\)/);
});

test('nova versão só ativa um pacote completo e não mistura caches antigos',()=>{
  const worker=read('service-worker.js');
  assert.match(worker,/cache\.addAll\(APP_SHELL\)/);
  assert.match(worker,/cache\.match\(path,/);
  assert.doesNotMatch(worker,/módulo opcional/);
});

test('planejamento não derruba o bootstrap quando o modelo ainda não chegou',()=>{
  const feature=read('weekly-plan-feature.js');
  assert.match(feature,/CompassoWeeklyPlanModel\?\.normalizeCollection/);
});
