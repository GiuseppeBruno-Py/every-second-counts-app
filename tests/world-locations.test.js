const test = require('node:test');
const assert = require('node:assert/strict');
const world = require('../world-locations.js');

test('topologia do mundo é original, estável e ligada às views existentes', () => {
  assert.equal(Object.isFrozen(world), true);
  assert.equal(Object.isFrozen(world.locations), true);
  assert.equal(world.locations.length, 15);
  assert.deepEqual([...new Set(world.locations.map(item => item.id))].length, 15);
  assert.equal(world.byId('reading').view, 'reading');
  assert.equal(world.byId('notes').view, 'notes');
  assert.equal(world.byId('settings').action, 'settings');
});

test('métricas são projeções puras do estado atual', () => {
  const data = {
    reading:[{ progress:20 }, { progress:80 }], study:[{ progress:40 }], goal:[{ progress:60 }],
    dailyPlans:[{ items:[{ completedAt:null }, { completedAt:'2026-01-01' }] }],
    captures:[{ status:'inbox' }, { status:'processed' }, { status:'inbox', deletedAt:'2026-01-01' }],
    reviewItems:[{ dueAt:'2020-01-01' }, { dueAt:'2099-01-01' }],
    sessions:[{ status:'completed' }], deepWorkSessions:[{ state:'completed' }], notes:[{},{}], evidence:[{}]
  };
  const snapshot = structuredClone(data);
  const metrics = world.metrics(data, Date.parse('2026-07-13'));
  assert.equal(metrics.reading, 50);
  assert.equal(metrics.today, 1);
  assert.equal(metrics.notes, 1);
  assert.equal(metrics.recall, 1);
  assert.equal(metrics.analytics, 2);
  assert.equal(metrics.context, 3);
  assert.deepEqual(data, snapshot);
});
