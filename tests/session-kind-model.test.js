const test = require('node:test');
const assert = require('node:assert/strict');
const model = require('../session-kind-model.js');

test('classifica sessão profunda e sessão normal de forma explícita', () => {
  assert.equal(model.kind({ id: 'deep:dw1', source: 'deep-work' }), 'deep');
  assert.equal(model.label({ id: 'deep:dw1' }), 'Deep Work');
  assert.equal(model.kind({ id: 's1' }), 'normal');
  assert.equal(model.label({ id: 's1' }), 'Normal');
});

test('dados legados sem tipo permanecem como sessões normais', () => {
  assert.deepEqual(model.breakdown([{ id: 's1' }, { id: 'deep:dw1' }, {}]), { deep: 1, normal: 2 });
});
