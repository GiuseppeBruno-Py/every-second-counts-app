const test = require('node:test');
const assert = require('node:assert/strict');
const journal = require('../journal-model');

const day = '2026-07-13';
const now = '2026-07-13T12:00:00.000Z';
const options = { date: day, now, id: 'journal_1' };

test('cria uma entrada privada com tipo e data explícitos', () => {
  const entry = journal.createEntry('Preparar testes', { ...options, entryType:'task', signifiers:['priority','invalid'], tags:['spark','spark'] });
  assert.equal(entry.id, 'journal_1');
  assert.equal(entry.taskStatus, 'open');
  assert.deepEqual(entry.signifiers, ['priority']);
  assert.deepEqual(entry.tags, ['spark']);
  assert.equal(entry.metadata.isPrivate, true);
});

test('edita conteúdo, tipo, estado, vínculos e marcadores', () => {
  const original = journal.createEntry('Ideia', options);
  const updated = journal.updateEntry(original, { content:'Executar ideia', entryType:'task', taskStatus:'delegated', linkedRefs:[{type:'study',id:'s1'}], signifiers:['waiting'] }, { now:'2026-07-13T13:00:00Z' });
  assert.equal(updated.entryType, 'task');
  assert.equal(updated.taskStatus, 'delegated');
  assert.deepEqual(updated.linkedRefs, [{type:'study',id:'s1'}]);
  assert.deepEqual(updated.signifiers, ['waiting']);
});

test('atualização parcial ou categoria inválida preserva a categoria explícita', () => {
  const reflection = journal.createEntry('Refletir', { ...options, entryType:'reflection' });
  const edited = journal.updateEntry(reflection, { content:'Refletir com contexto', entryType:undefined, linkedRefs:[{type:'study',id:'s1'}] }, { now:'2026-07-13T13:00:00Z' });
  const empty = journal.updateEntry(edited, { entryType:'' }, { now:'2026-07-13T14:00:00Z' });
  const invalid = journal.updateEntry(empty, { entryType:'unknown', tags:['preservada'] }, { now:'2026-07-13T15:00:00Z' });
  assert.equal(edited.entryType, 'reflection');
  assert.equal(empty.entryType, 'reflection');
  assert.equal(invalid.entryType, 'reflection');
  assert.deepEqual(invalid.linkedRefs, [{type:'study',id:'s1'}]);
});

test('concluir tarefa registra timestamp e reabrir o remove', () => {
  const task = journal.createEntry('Concluir', { ...options, entryType:'task' });
  const completed = journal.setTaskStatus(task, 'completed', { now:'2026-07-13T14:00:00Z' });
  assert.equal(completed.completedAt, '2026-07-13T14:00:00.000Z');
  assert.equal(journal.setTaskStatus(completed, 'open', { now:'2026-07-13T15:00:00Z' }).completedAt, null);
});

test('arquivamento e cancelamento têm estados e datas acessíveis', () => {
  const task = journal.createEntry('Decidir', { ...options, entryType:'task' });
  assert.equal(journal.setTaskStatus(task, 'archived', {now}).archivedAt, now);
  assert.equal(journal.setTaskStatus(task, 'cancelled', {now}).cancelledAt, now);
});

test('migração preserva origem, cria destino aberto e incrementa histórico', () => {
  const task = journal.createEntry('Migrar', { ...options, entryType:'task' });
  const result = journal.migrateTask(task, '2026-07-14', { now:'2026-07-13T18:00:00Z', newId:'journal_2', reason:'lack_of_time' });
  assert.equal(result.original.taskStatus, 'migrated');
  assert.equal(result.destination.taskStatus, 'open');
  assert.equal(result.destination.date, '2026-07-14');
  assert.equal(result.destination.migratedFromEntryId, task.id);
  assert.equal(result.destination.metadata.migrationCount, 1);
  assert.equal(result.destination.migrationHistory[0].reason, 'lack_of_time');
});

test('migrações repetidas mantêm a cadeia completa', () => {
  const first = journal.migrateTask(journal.createEntry('Persistente', { ...options, entryType:'task' }), '2026-07-14', { now:'2026-07-13T18:00:00Z', newId:'journal_2' }).destination;
  const second = journal.migrateTask(first, '2026-07-17', { now:'2026-07-14T18:00:00Z', newId:'journal_3' }).destination;
  assert.deepEqual(second.migrationHistory.map(item => item.toDate), ['2026-07-14','2026-07-17']);
  assert.equal(second.metadata.migrationCount, 2);
});

test('migração de reflexão preserva categoria, vínculos e origem', () => {
  const reflection = journal.createEntry('Aprendizado do dia', { ...options, entryType:'reflection', linkedRefs:[{type:'goal',id:'g1'}] });
  const result = journal.migrateEntryToDate(reflection, '2026-07-14', { now:'2026-07-13T18:00:00Z', newId:'journal_2' });
  assert.equal(result.original.archivedAt, '2026-07-13T18:00:00.000Z');
  assert.equal(result.destination.entryType, 'reflection');
  assert.equal(result.destination.taskStatus, null);
  assert.equal(result.destination.migratedFromEntryId, reflection.id);
  assert.deepEqual(result.destination.linkedRefs, [{type:'goal',id:'g1'}]);
});

test('não migra para a mesma data nem tarefas encerradas', () => {
  const task = journal.createEntry('Inválida', { ...options, entryType:'task' });
  assert.throws(() => journal.migrateTask(task, day), /outra data/);
  assert.throws(() => journal.migrateTask(journal.setTaskStatus(task,'completed',{now}), '2026-07-14'), /pendentes/);
});

test('cria diário automaticamente e salva intenção', () => {
  const state = journal.upsertDailyJournal({}, day, { intention:'Finalizar a fundação', intentionRef:{type:'goal',id:'g1'} }, { now });
  assert.equal(state.dailyJournals[day].intention, 'Finalizar a fundação');
  assert.deepEqual(state.dailyJournals[day].intentionRef, {type:'goal',id:'g1'});
});

test('encerramento diário é parcial e opcional', () => {
  const state = journal.closeDay({}, day, { important:'Entrega concluída', learned:'', tomorrow:'Testar no celular' }, { now });
  assert.equal(state.dailyJournals[day].closedAt, now);
  assert.deepEqual(state.dailyJournals[day].closingReflection, { important:'Entrega concluída', tomorrow:'Testar no celular' });
});

test('cria coleção simples com referências e entradas', () => {
  const collection = journal.createCollection('Decisões do projeto', { now, id:'collection_1', entryIds:['journal_1'], linkedRefs:[{type:'goal',id:'g1'}] });
  assert.equal(collection.status, 'active');
  assert.deepEqual(collection.entryIds, ['journal_1']);
  assert.deepEqual(collection.linkedRefs, [{type:'goal',id:'g1'}]);
});

test('cria item futuro por mês, trimestre, data ou algum dia', () => {
  const item = journal.createFutureItem('Certificação', { now, id:'future_1', scheduleType:'quarter', scheduledFor:'2026-T4' });
  assert.equal(item.scheduleType, 'quarter');
  assert.equal(item.scheduledFor, '2026-T4');
});

test('migração de schema é segura, idempotente e preserva campos externos', () => {
  const legacy = { reading:[{id:'r1'}], journalEntries:[{id:'legacy',content:'Registro antigo',entryType:'unknown',date:day}], dailyJournals:null };
  const once = journal.migrateState(legacy, { now });
  const twice = journal.migrateState(once, { now });
  assert.deepEqual(twice, once);
  assert.equal(twice.reading[0].id, 'r1');
  assert.equal(twice.journalEntries[0].entryType, 'note');
  assert.deepEqual(twice.dailyJournals, {});
});

test('serialização JSON preserva histórico, vínculos e privacidade', () => {
  const task = journal.createEntry('Round-trip', { ...options, entryType:'task', linkedRefs:[{type:'study',id:'s1'}] });
  const migrated = journal.migrateTask(task, '2026-07-14', { now, newId:'journal_2' }).destination;
  const restored = journal.migrateState(JSON.parse(JSON.stringify({journalEntries:[migrated]})), {now});
  assert.equal(restored.journalEntries[0].migrationHistory.length, 1);
  assert.equal(restored.journalEntries[0].metadata.isPrivate, true);
  assert.deepEqual(restored.journalEntries[0].linkedRefs, [{type:'study',id:'s1'}]);
});

test('round-trip JSON preserva reflexão após edição e migração', () => {
  const reflection = journal.updateEntry(journal.createEntry('Original', { ...options, entryType:'reflection' }), { content:'Editada' }, { now:'2026-07-13T13:00:00Z' });
  const moved = journal.migrateEntryToDate(reflection, '2026-07-14', { now:'2026-07-13T18:00:00Z', newId:'journal_2' }).destination;
  const [restored] = journal.migrateState(JSON.parse(JSON.stringify({journalEntries:[moved]})), {now}).journalEntries;
  assert.equal(restored.entryType, 'reflection');
  assert.equal(restored.content, 'Editada');
  assert.equal(restored.date, '2026-07-14');
});

test('busca e filtros combinam tipo, estado, marcador, coleção e vínculo', () => {
  const one = journal.createEntry('Pipeline Spark', { ...options, entryType:'task', signifiers:['priority'], collectionIds:['c1'], linkedRefs:[{type:'study',id:'s1'}] });
  const two = journal.createEntry('Outra nota', { ...options, id:'journal_2' });
  const found = journal.filterEntries([one,two], { query:'spark', entryType:'task', taskStatus:'open', signifier:'priority', collectionId:'c1', linked:'yes' });
  assert.deepEqual(found.map(item => item.id), ['journal_1']);
});

test('métricas são descritivas e calculadas localmente', () => {
  const task = journal.createEntry('Tarefa', { ...options, entryType:'task' });
  const completed = journal.setTaskStatus(task,'completed',{now:'2026-07-13T13:00:00Z'});
  const learning = journal.createEntry('Aprendi', { ...options, id:'journal_2', entryType:'learning' });
  const metrics = journal.metrics([completed,learning], {now});
  assert.equal(metrics.entries, 2);
  assert.equal(metrics.completionRate, 100);
  assert.equal(metrics.learnings, 1);
  assert.equal(metrics.averageCompletionMs, 3600000);
});

test('comentários ficam pesquisáveis e preservam a entrada', () => {
  const entry = journal.createEntry('Base', options);
  const commented = journal.addComment(entry,'Dependência externa confirmada',{now,id:'comment_1'});
  assert.equal(commented.comments[0].content, 'Dependência externa confirmada');
  assert.equal(journal.filterEntries([commented],{query:'externa'}).length,1);
});
