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

test('registro do service worker muda com a versão e recarrega após ativação',()=>{
  const html=read('index.html');assert.match(html,/service-worker\.js\?version=/);assert.match(html,/controllerchange/);assert.match(html,/registration\.update\(\)/);
});
