const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('Hoje reúne direção, execução e decisões sem Visão geral concorrente', () => {
  const today = read('today-feature.js');
  const navigation = require('../information-architecture-model.js');
  for (const id of ['todayPrimaryAction', 'todayActiveSession', 'todayDirections', 'todayList', 'todayDecisions', 'todayProgress']) {
    assert.match(today, new RegExp(`id="${id}"`));
  }
  assert.match(today, /journalTodayIntention/);
  assert.equal(navigation.resolve('overview'), 'today');
  assert.equal(navigation.views.some(item => item.id === 'overview'), false);
});

test('Hoje deriva uma única prioridade em ordem armazenada e expõe comandos de continuidade',()=>{
  const today=read('today-feature.js'),information=read('information-architecture-feature.js'),weekly=read('weekly-review-feature.js');
  assert.match(today,/function todayPrimaryState/);
  assert.ok(today.indexOf("kind:'execution'")<today.indexOf("kind:'capability'")&&today.indexOf("kind:'capability'")<today.indexOf("kind:'action'"));
  assert.match(today,/resolved\.active && resolved\.current/);
  assert.match(today,/CompassoFeatures\.selector\('today\.primaryState'/);
  assert.match(today,/CompassoFeatures\.command\('today\.executePrimary'/);
  assert.match(today,/CompassoFeatures\.command\('today\.openPrimary'/);
  assert.match(information,/id="iaExecuteBtn" aria-label="Executar"/);
  assert.match(information,/today\.executePrimary/);
  assert.match(weekly,/id="weeklyDecisionRegion"/);
  assert.match(weekly,/CompassoFeatures\.command\('weekly\.openDecision'/);
});

test('estados de capacidade indisponíveis permanecem informativos e não executáveis',()=>{
  const today=read('today-feature.js');
  for(const label of ['Concluída no plano','Tentativa histórica','Capacidade arquivada','Capacidade indisponível'])assert.match(today,new RegExp(label));
  assert.match(today,/resolved\.active&&resolved\.current&&!normalized\.completedAt/);
  assert.match(today,/unavailable\|\|archived\|\|stale/);
});

test('Revisão semanal e Consistência mostram Deep Work e Normal', () => {
  const weekly = read('weekly-review-feature.js');
  const analytics = read('analytics-feature.js');
  assert.match(weekly, /Deep Work.*Normal/);
  assert.match(analytics, /analyticsSessionKindModel\.label/);
  assert.match(analytics, /tipo_sessao/);
});
