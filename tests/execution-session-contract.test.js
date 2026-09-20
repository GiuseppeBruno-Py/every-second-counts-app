const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');

test('todos os modos começam pelo fluxo Executar',()=>{
  const sessions=read('sessions-feature.js');
  const deep=read('deep-work-feature.js');
  assert.match(sessions,/'Executar'/);
  assert.match(sessions,/id="sessionMode"/);
  assert.match(sessions,/Sessão rápida/);
  assert.match(sessions,/Deep Work/);
  assert.match(sessions,/Versão mínima/);
  assert.match(sessions,/Plano B/);
  assert.match(deep,/function deepEnhanceGrid\(\)\{\}/);
});

test('companion e relatórios usam a execução canônica',()=>{
  assert.match(read('session-companion-feature.js'),/executionActive\(\)/);
  assert.match(read('execution-session-feature.js'),/executionSessionModel\.history/);
  assert.doesNotMatch(read('deep-work-feature.js'),/function completedExecutionSessions/);
  assert.match(read('history-edit-feature.js'),/executionSyncAll\(\)/);
});

test('início confirmado compartilha o default sem alterar o comando imediato',()=>{
  const sessions=read('sessions-feature.js');
  assert.match(sessions,/function sessionPrepareDefault/);
  assert.match(sessions,/function sessionStartDefaultConfirmed/);
  assert.match(sessions,/CompassoFeatures\.command\('session\.startDefault',sessionStartDefault\)/);
  assert.match(sessions,/CompassoFeatures\.command\('session\.startDefaultConfirmed',sessionStartDefaultConfirmed\)/);
  assert.match(sessions,/failurePresentation\s*=\s*'session-dialog'/);
});
