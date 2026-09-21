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

test('ensaio permanece opcional, efêmero e restrito à tentativa principal',()=>{
  const today=read('today-feature.js');
  assert.match(today,/data-today-primary-rehearse/);
  assert.ok(today.indexOf('data-today-primary-start')<today.indexOf('data-today-primary-rehearse'));
  for(const prompt of [
    'Qual resultado você quer produzir nesta tentativa?',
    'Qual é a primeira ação concreta?',
    'Qual dificuldade provavelmente aparecerá?',
    'Como você pretende responder quando ela aparecer?'
  ])assert.match(today,new RegExp(prompt.replace(/[?]/g,'\\?')));
  assert.match(today,/function todayCurrentRehearsalPayload/);
  assert.match(today,/session\.startDefaultConfirmed/);
  assert.doesNotMatch(today,/state\.data\.(?:rehearsal|attemptRehearsal|rehearsals)/);
});

test('Revisão semanal e Consistência mostram Deep Work e Normal', () => {
  const weekly = read('weekly-review-feature.js');
  const analytics = read('analytics-feature.js');
  assert.match(weekly, /Deep Work.*Normal/);
  assert.match(analytics, /analyticsSessionKindModel\.label/);
  assert.match(analytics, /tipo_sessao/);
});

test('Revisão semanal positiva mantém respostas distintas e decisões explícitas', () => {
  const weekly = read('weekly-review-feature.js');
  assert.match(weekly, /WEEKLY_REVIEW_VERSION\s*=\s*2/);
  assert.match(weekly, /O que funcionou esta semana e merece ser repetido\?/);
  assert.match(weekly, /Alguma evidência mudou sua percepção sobre o que você consegue fazer\?/);
  for (const id of ['weeklyRepeatablePractice', 'weeklyEvidenceReflection']) assert.match(weekly, new RegExp(`id="${id}"`));
  for (const field of ['repeatablePractice', 'evidenceReflection']) assert.match(weekly, new RegExp(`${field}:`));
  assert.match(weekly, /function weeklyOptionalText/);
  assert.match(weekly, /review\?\.wins \|\| ''/);
  assert.match(weekly, /review\?\.lessons \|\| ''/);
  assert.doesNotMatch(weekly, /state\.data\.(?:positiveReviews|confidence|selfEsteem|weeklyCalibration)/);
});
