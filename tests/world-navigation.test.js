const test = require('node:test');
const assert = require('node:assert/strict');
const navigation = require('../world-navigation.js');

test('máquina de estados cobre vila, sala e sessão', () => {
  const now = () => '2026-07-13T12:00:00.000Z';
  let state = navigation.create();
  state = navigation.transition(state, 'moving', { locationId:'study' }, now);
  state = navigation.transition(state, 'entering-room', {}, now);
  state = navigation.transition(state, 'room', {}, now);
  state = navigation.transition(state, 'session-starting', {}, now);
  state = navigation.transition(state, 'session-active', {}, now);
  state = navigation.transition(state, 'session-paused', {}, now);
  state = navigation.transition(state, 'session-finishing', {}, now);
  state = navigation.transition(state, 'returning-to-village', {}, now);
  state = navigation.transition(state, 'village', { locationId:'plaza' }, now);
  assert.equal(state.status, 'village');
  assert.equal(state.locationId, 'plaza');
  assert.equal(state.updatedAt, now());
});

test('transições inválidas não criam estados impossíveis', () => {
  assert.equal(navigation.canTransition('village', 'session-active'), false);
  assert.throws(() => navigation.transition(navigation.create(), 'session-active'), /Transição inválida/);
  assert.throws(() => navigation.transition(navigation.create(), 'teleporting'), /inválido/);
});

test('sessão já ativa ao recarregar reconstrói a sala', () => {
  const state = navigation.syncSession(navigation.create(), { active:true, paused:false, locationId:'reading' });
  assert.equal(state.status, 'session-active');
  assert.equal(state.locationId, 'reading');
  assert.equal(navigation.syncSession(state, { active:true, paused:true }).status, 'session-paused');
});
