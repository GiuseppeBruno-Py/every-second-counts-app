const test = require('node:test');
const assert = require('node:assert/strict');
const model = require('../history-evidence-model.js');
const foundation = require('../state-foundation.js');

const regularSession = {
  id: 's1',
  status: 'completed',
  domain: 'study',
  itemId: 'study-1',
  startedAt: '2026-07-15T10:00:00.000Z',
  endedAt: '2026-07-15T10:30:00.000Z',
  durationMs: 1800000,
  startValue: 10,
  endValue: 20,
  intent: 'Revisar',
  reflection: 'Revisado',
  updatedAt: '2026-07-15T10:30:00.000Z'
};

const evidence = {
  id: 'e1',
  schemaVersion: 1,
  sessionId: 's1',
  itemId: 'study-1',
  domain: 'study',
  type: 'insight',
  summary: 'Síntese original',
  details: '',
  createdAt: '2026-07-15T10:30:00.000Z',
  updatedAt: '2026-07-15T10:30:00.000Z'
};

test('edita evidência preservando identidade e registrando auditoria', () => {
  const updated = model.updateEvidence(evidence, {
    type: 'deliverable',
    summary: 'Síntese corrigida',
    details: 'Referência atualizada',
    createdAt: '2026-07-14T08:00:00.000Z'
  }, { now: '2026-07-17T12:00:00.000Z' });
  assert.equal(updated.id, evidence.id);
  assert.equal(updated.schemaVersion, 2);
  assert.equal(updated.type, 'deliverable');
  assert.equal(updated.createdAt, '2026-07-14T08:00:00.000Z');
  assert.equal(updated.updatedAt, '2026-07-17T12:00:00.000Z');
  assert.equal(updated.editedAt, updated.updatedAt);
  assert.throws(() => model.updateEvidence(evidence, { summary: 'x' }), /3 caracteres/);
});

test('corrige sessão e recalcula métricas sem trocar id nem mutar a origem', () => {
  const updated = model.updateSession(regularSession, {
    durationMs: 5400000,
    startValue: 8,
    endValue: 28,
    reflection: 'Resultado corrigido',
    executionVariant: { kind: 'minimum', contingencyId: null }
  }, { now: '2026-07-17T12:00:00.000Z' });
  const before = model.summarize([regularSession], [evidence]);
  const after = model.summarize([updated], [evidence]);
  assert.equal(updated.id, regularSession.id);
  assert.equal(regularSession.durationMs, 1800000);
  assert.equal(after.durationMs, 5400000);
  assert.equal(before.sessions, after.sessions);
  assert.equal(updated.executionVariant.kind, 'minimum');
  assert.equal(updated.editedAt, '2026-07-17T12:00:00.000Z');
});

test('rejeita duração negativa e ordem temporal impossível', () => {
  assert.throws(() => model.updateSession(regularSession, { durationMs: -1 }), /não negativo/);
  assert.throws(() => model.updateSession(regularSession, { startValue: 20, endValue: 10 }), /menor que o inicial/);
  assert.throws(() => model.updateSession(regularSession, {
    startedAt: '2026-07-15T11:00:00.000Z',
    endedAt: '2026-07-15T10:00:00.000Z'
  }), /anterior ao início/);
});

test('corrige Deep Work no registro existente sem duplicar a sessão', () => {
  const source = {
    id: 'dw1',
    state: 'completed',
    domain: 'reading',
    actionId: 'book-1',
    startedAt: '2026-07-15T09:00:00.000Z',
    endedAt: '2026-07-15T09:45:00.000Z',
    actualMinutes: 45,
    expectedOutcome: 'Ler',
    completionNote: 'Lido'
  };
  const updated = model.updateDeepWork(source, {
    durationMs: 3600000,
    reflection: 'Nota corrigida'
  }, { now: '2026-07-17T12:00:00.000Z' });
  const records = [source].map(item => item.id === updated.id ? updated : item);
  assert.equal(records.length, 1);
  assert.equal(updated.id, 'dw1');
  assert.equal(updated.actualMinutes, 60);
  assert.equal(model.summarize(records, []).durationMs, 3600000);
});

test('excluir evidência cria tombstone, preserva sessão e impede ressurreição no merge', () => {
  const local = model.deleteEvidence({ sessions: [regularSession], evidence: [evidence] }, evidence.id, { now: '2026-07-17T12:00:00.000Z' });
  assert.equal(local.sessions.length, 1);
  assert.equal(local.evidence.length, 0);
  assert.equal(local._sync.tombstones['evidence:e1'], '2026-07-17T12:00:00.000Z');
  const remote = { evidence: [{ ...evidence, updatedAt: '2026-07-16T12:00:00.000Z' }] };
  const merged = foundation.merge(local, remote, { now: '2026-07-17T13:00:00.000Z' });
  assert.equal(merged.evidence.length, 0);
  assert.equal(merged.sessions.length, 1);
});

test('round-trip JSON mantém correções e marca de edição', () => {
  const updatedSession = model.updateSession(regularSession, { reflection: 'Corrigido' }, { now: '2026-07-17T12:00:00.000Z' });
  const updatedEvidence = model.updateEvidence(evidence, { summary: 'Evidência corrigida' }, { now: '2026-07-17T12:01:00.000Z' });
  const roundTrip = JSON.parse(JSON.stringify({ sessions: [updatedSession], evidence: [updatedEvidence] }));
  assert.equal(roundTrip.sessions[0].id, 's1');
  assert.equal(roundTrip.sessions[0].editedAt, '2026-07-17T12:00:00.000Z');
  assert.equal(roundTrip.evidence[0].editedAt, '2026-07-17T12:01:00.000Z');
});
