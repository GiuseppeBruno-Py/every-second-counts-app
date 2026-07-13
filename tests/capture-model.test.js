const test = require('node:test');
const assert = require('node:assert/strict');
const model = require('../capture-model.js');

const T1 = '2026-07-13T12:00:00.000Z';
const T2 = '2026-07-13T13:00:00.000Z';
const make = (content = 'Uma ideia') => model.create(content, { id: 'capture_test', now: T1 });

test('cria captura válida, remove espaços e preserva quebras de linha', () => {
  const capture = model.create('  Linha um\nLinha dois  ', { id: 'capture_fixed', now: T1 });
  assert.equal(capture.id, 'capture_fixed');
  assert.equal(capture.content, 'Linha um\nLinha dois');
  assert.equal(capture.status, 'inbox');
  assert.equal(capture.createdAt, T1);
  assert.equal(capture.updatedAt, T1);
  assert.equal(model.validate(capture).valid, true);
});

test('gera id permanente e rejeita conteúdo vazio', () => {
  const capture = model.create('Ideia', { idFactory: () => 'uuid', now: T1 });
  assert.equal(capture.id, 'capture_uuid');
  assert.throws(() => model.create(' \n ', { now: T1 }), /obrigatório/i);
});

test('adiciona referência sem duplicidade e remove referência', () => {
  const linked = model.linkRef(make(), { type: 'study', id: 'study_1' }, { now: T2 });
  const duplicate = model.linkRef(linked, { type: 'study', id: 'study_1' }, { now: T2 });
  assert.deepEqual(duplicate.linkedRefs, [{ type: 'study', id: 'study_1' }]);
  assert.deepEqual(model.removeRef(duplicate, { type: 'study', id: 'study_1' }, { now: T2 }).linkedRefs, []);
  assert.throws(() => model.linkRef(make(), { type: 'area', id: 'x' }, { now: T2 }), /inválida/i);
});

test('processa com decisão e resultado, preservando conteúdo original', () => {
  const original = make('Conteúdo original');
  const processed = model.markProcessed(original, 'note', { type: 'note', id: 'note_1' }, { now: T2 });
  assert.equal(processed.status, 'processed');
  assert.equal(processed.processingDecision, 'note');
  assert.deepEqual(processed.resultRef, { type: 'note', id: 'note_1' });
  assert.equal(processed.processedAt, T2);
  assert.equal(processed.content, 'Conteúdo original');
  assert.throws(() => model.markProcessed(original, 'note', null, { now: T2 }), /resultado/i);
  assert.throws(() => model.markProcessed(original, 'note', { type: 'action', id: 'a1' }, { now: T2 }), /corresponder/i);
});

test('arquiva e descarta com datas e status compatíveis', () => {
  const archived = model.markProcessed(make(), 'archive', null, { now: T2 });
  assert.equal(archived.status, 'archived');
  assert.equal(archived.archivedAt, T2);
  const discarded = model.markProcessed(make(), 'discard', null, { now: T2 });
  assert.equal(discarded.status, 'deleted');
  assert.equal(discarded.deletedAt, T2);
});

test('migra estado antigo sem capturas e registros parciais sem destruir notas', () => {
  const old = { reading: [], notes: [{ id: 'n1', title: 'Legada', content: 'Texto' }] };
  const migrated = model.migrateState(old, { now: T1 });
  assert.deepEqual(migrated.captures, []);
  assert.deepEqual(migrated.notes[0], old.notes[0]);
  assert.equal('distillation' in migrated.notes[0], false);

  const partial = model.migrateCapture({ id: 'capture_old', content: ' antiga ', createdAt: T1 }, { now: T2 });
  assert.equal(partial.status, 'inbox');
  assert.deepEqual(partial.linkedRefs, []);
  assert.equal(partial.content, 'antiga');
});

test('filtra somente inbox, ordena e conta pendências', () => {
  const older = model.create('Antiga', { id: 'capture_older', now: T1 });
  const newer = model.create('Nova', { id: 'capture_newer', now: T2 });
  const deleted = model.markDeleted(model.create('Excluída', { id: 'capture_deleted', now: T1 }), { now: T2 });
  assert.deepEqual(model.inbox([newer, deleted, older]).map(item => item.id), ['capture_older', 'capture_newer']);
  assert.deepEqual(model.inbox([older, newer], 'newest').map(item => item.id), ['capture_newer', 'capture_older']);
  assert.equal(model.pendingCount([newer, deleted, older]), 2);
});
