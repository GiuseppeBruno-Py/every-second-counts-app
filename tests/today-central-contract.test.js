const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('Hoje reúne direção, execução e decisões sem Visão geral concorrente', () => {
  const today = read('today-feature.js');
  const navigation = require('../information-architecture-model.js');
  for (const id of ['todayActiveSession', 'todayDirections', 'todayList', 'todayDecisions', 'todayProgress']) {
    assert.match(today, new RegExp(`id="${id}"`));
  }
  assert.match(today, /journalTodayIntention/);
  assert.equal(navigation.resolve('overview'), 'today');
  assert.equal(navigation.views.some(item => item.id === 'overview'), false);
});

test('Revisão semanal e Consistência mostram Deep Work e Normal', () => {
  const weekly = read('weekly-review-feature.js');
  const analytics = read('analytics-feature.js');
  assert.match(weekly, /Deep Work.*Normal/);
  assert.match(analytics, /analyticsSessionKindModel\.label/);
  assert.match(analytics, /tipo_sessao/);
});
