/* Compasso · Modelo puro de Journaling */
(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CompassoJournalModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const SCHEMA_VERSION = 1;
  const ENTRY_TYPES = Object.freeze(['task', 'event', 'note', 'learning', 'reflection', 'gratitude', 'question', 'decision']);
  const TASK_STATUSES = Object.freeze(['open', 'completed', 'migrated', 'scheduled', 'delegated', 'cancelled', 'archived']);
  const SIGNIFIERS = Object.freeze(['priority', 'important', 'urgent', 'inspiration', 'blocked', 'follow_up', 'waiting', 'high_energy', 'low_energy']);
  const REF_TYPES = Object.freeze(['goal', 'study', 'reading', 'action', 'session', 'note', 'capture', 'evidence', 'recall', 'project']);
  const SOURCE_TYPES = Object.freeze(['manual', 'session', 'review', 'capture', 'migration', 'integration']);
  const FUTURE_SCHEDULES = Object.freeze(['month', 'quarter', 'date', 'someday', 'undated']);
  const COLLECTION_STATUSES = Object.freeze(['active', 'completed', 'archived']);

  function clone(value) {
    if (value == null) return value;
    return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));
  }

  function iso(options = {}) {
    const supplied = typeof options.now === 'function' ? options.now() : options.now;
    const date = supplied ? new Date(supplied) : new Date();
    if (Number.isNaN(date.getTime())) throw new TypeError('Data inválida.');
    return date.toISOString();
  }

  function dateKey(value, options = {}) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return String(value);
    const date = value ? new Date(value) : new Date(typeof options.now === 'function' ? options.now() : options.now || Date.now());
    if (Number.isNaN(date.getTime())) throw new TypeError('Data inválida.');
    const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return shifted.toISOString().slice(0, 10);
  }

  function id(prefix, options = {}) {
    if (options.id) return String(options.id);
    const value = typeof options.idFactory === 'function'
      ? options.idFactory()
      : globalThis.crypto?.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    return `${prefix}_${value}`;
  }

  function text(value, max = 5000) {
    return typeof value === 'string' ? value.trim().slice(0, max) : '';
  }

  function unique(values, allowed = null) {
    return [...new Set((Array.isArray(values) ? values : []).map(value => String(value).trim()).filter(value => value && (!allowed || allowed.includes(value))))];
  }

  function ref(value) {
    if (!value || !REF_TYPES.includes(value.type) || value.id == null || !String(value.id).trim()) return null;
    return { type: value.type, id: String(value.id).trim() };
  }

  function refs(values) {
    const seen = new Set();
    return (Array.isArray(values) ? values : []).map(ref).filter(value => {
      if (!value) return false;
      const key = `${value.type}:${value.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function source(value) {
    return {
      type: SOURCE_TYPES.includes(value?.type) ? value.type : 'manual',
      id: value?.id == null ? null : String(value.id)
    };
  }

  function mood(value) {
    return ['very_low', 'low', 'neutral', 'good', 'great'].includes(value) ? value : null;
  }

  function energy(value) {
    const number = Number(value);
    return Number.isInteger(number) && number >= 1 && number <= 5 ? number : null;
  }

  function createEntry(content, options = {}) {
    const normalized = text(content);
    if (!normalized) throw new TypeError('O conteúdo da entrada é obrigatório.');
    const timestamp = iso(options);
    const entryType = ENTRY_TYPES.includes(options.entryType) ? options.entryType : 'note';
    return {
      id: id('journal', options),
      schemaVersion: SCHEMA_VERSION,
      content: normalized,
      entryType,
      taskStatus: entryType === 'task' ? (TASK_STATUSES.includes(options.taskStatus) ? options.taskStatus : 'open') : null,
      date: dateKey(options.date, options),
      createdAt: timestamp,
      updatedAt: timestamp,
      completedAt: null,
      cancelledAt: null,
      archivedAt: null,
      scheduledFor: options.scheduledFor || null,
      migratedFromEntryId: options.migratedFromEntryId || null,
      migrationHistory: [],
      signifiers: unique(options.signifiers, SIGNIFIERS),
      tags: unique(options.tags),
      mood: mood(options.mood),
      energy: energy(options.energy),
      collectionIds: unique(options.collectionIds),
      linkedRefs: refs(options.linkedRefs),
      source: source(options.source),
      resultRef: ref(options.resultRef),
      comments: [],
      metadata: {
        migrationCount: 0,
        isPinned: Boolean(options.isPinned),
        isPrivate: options.isPrivate !== false,
        futureBucket: options.futureBucket || null
      }
    };
  }

  function migrateEntry(record, options = {}) {
    if (!record || typeof record !== 'object' || Array.isArray(record) || !text(record.content)) return null;
    const entryType = ENTRY_TYPES.includes(record.entryType) ? record.entryType : 'note';
    const createdAt = Number.isNaN(Date.parse(record.createdAt)) ? iso(options) : new Date(record.createdAt).toISOString();
    const updatedAt = Number.isNaN(Date.parse(record.updatedAt)) ? createdAt : new Date(record.updatedAt).toISOString();
    const history = (Array.isArray(record.migrationHistory) ? record.migrationHistory : []).map(item => ({
      fromDate: dateKey(item.fromDate || record.date, options),
      toDate: dateKey(item.toDate || record.date, options),
      reason: text(item.reason, 80) || null,
      migratedAt: Number.isNaN(Date.parse(item.migratedAt)) ? updatedAt : new Date(item.migratedAt).toISOString()
    }));
    return {
      ...clone(record),
      id: String(record.id || id('journal', options)),
      schemaVersion: SCHEMA_VERSION,
      content: text(record.content),
      entryType,
      taskStatus: entryType === 'task' ? (TASK_STATUSES.includes(record.taskStatus) ? record.taskStatus : 'open') : null,
      date: dateKey(record.date || createdAt, options),
      createdAt,
      updatedAt,
      completedAt: record.completedAt || null,
      cancelledAt: record.cancelledAt || null,
      archivedAt: record.archivedAt || null,
      scheduledFor: record.scheduledFor || null,
      migratedFromEntryId: record.migratedFromEntryId || null,
      migrationHistory: history,
      signifiers: unique(record.signifiers, SIGNIFIERS),
      tags: unique(record.tags),
      mood: mood(record.mood),
      energy: energy(record.energy),
      collectionIds: unique(record.collectionIds),
      linkedRefs: refs(record.linkedRefs),
      source: source(record.source),
      resultRef: ref(record.resultRef),
      comments: (Array.isArray(record.comments) ? record.comments : []).map(item => ({ id: String(item.id || id('comment', options)), content: text(item.content, 1000), createdAt: item.createdAt || updatedAt })).filter(item => item.content),
      metadata: {
        ...record.metadata,
        migrationCount: history.length,
        isPinned: Boolean(record.metadata?.isPinned),
        isPrivate: record.metadata?.isPrivate !== false,
        futureBucket: record.metadata?.futureBucket || null
      }
    };
  }

  function updateEntry(record, patch = {}, options = {}) {
    const current = migrateEntry(record, options);
    if (!current) throw new TypeError('Entrada inválida.');
    const next = { ...current, metadata: { ...current.metadata } };
    if (Object.prototype.hasOwnProperty.call(patch, 'content')) {
      next.content = text(patch.content);
      if (!next.content) throw new TypeError('O conteúdo da entrada é obrigatório.');
    }
    if (ENTRY_TYPES.includes(patch.entryType)) {
      next.entryType = patch.entryType;
      next.taskStatus = patch.entryType === 'task' ? (TASK_STATUSES.includes(patch.taskStatus) ? patch.taskStatus : current.taskStatus || 'open') : null;
    }
    if (TASK_STATUSES.includes(patch.taskStatus) && next.entryType === 'task') next.taskStatus = patch.taskStatus;
    if (patch.date) next.date = dateKey(patch.date, options);
    if (Object.prototype.hasOwnProperty.call(patch, 'scheduledFor')) next.scheduledFor = patch.scheduledFor || null;
    if (Object.prototype.hasOwnProperty.call(patch, 'signifiers')) next.signifiers = unique(patch.signifiers, SIGNIFIERS);
    if (Object.prototype.hasOwnProperty.call(patch, 'tags')) next.tags = unique(patch.tags);
    if (Object.prototype.hasOwnProperty.call(patch, 'mood')) next.mood = mood(patch.mood);
    if (Object.prototype.hasOwnProperty.call(patch, 'energy')) next.energy = energy(patch.energy);
    if (Object.prototype.hasOwnProperty.call(patch, 'collectionIds')) next.collectionIds = unique(patch.collectionIds);
    if (Object.prototype.hasOwnProperty.call(patch, 'linkedRefs')) next.linkedRefs = refs(patch.linkedRefs);
    if (Object.prototype.hasOwnProperty.call(patch, 'isPinned')) next.metadata.isPinned = Boolean(patch.isPinned);
    if (Object.prototype.hasOwnProperty.call(patch, 'isPrivate')) next.metadata.isPrivate = patch.isPrivate !== false;
    next.updatedAt = iso(options);
    return next;
  }

  function setTaskStatus(record, status, options = {}) {
    if (!TASK_STATUSES.includes(status)) throw new TypeError('Estado de tarefa inválido.');
    const current = migrateEntry(record, options);
    if (!current || current.entryType !== 'task') throw new TypeError('A entrada não é uma tarefa.');
    const timestamp = iso(options);
    return {
      ...current,
      taskStatus: status,
      completedAt: status === 'completed' ? timestamp : null,
      cancelledAt: status === 'cancelled' ? timestamp : null,
      archivedAt: status === 'archived' ? timestamp : null,
      updatedAt: timestamp
    };
  }

  function migrateTask(record, targetDate, options = {}) {
    const current = migrateEntry(record, options);
    if (!current || current.entryType !== 'task') throw new TypeError('A entrada não é uma tarefa.');
    if (!['open', 'scheduled', 'delegated'].includes(current.taskStatus)) throw new TypeError('Somente tarefas pendentes podem ser migradas.');
    const toDate = dateKey(targetDate, options);
    if (toDate === current.date) throw new TypeError('Escolha outra data para migrar.');
    const timestamp = iso(options);
    const movement = { fromDate: current.date, toDate, reason: text(options.reason, 80) || null, migratedAt: timestamp };
    const history = [...current.migrationHistory, movement];
    const original = { ...current, taskStatus: 'migrated', migrationHistory: history, updatedAt: timestamp, metadata: { ...current.metadata, migrationCount: history.length } };
    const destination = {
      ...clone(current),
      id: id('journal', { ...options, id: options.newId }),
      taskStatus: 'open',
      date: toDate,
      createdAt: timestamp,
      updatedAt: timestamp,
      completedAt: null,
      cancelledAt: null,
      archivedAt: null,
      scheduledFor: toDate,
      migratedFromEntryId: current.id,
      migrationHistory: history,
      source: { type: 'migration', id: current.id },
      resultRef: null,
      metadata: { ...current.metadata, migrationCount: history.length }
    };
    return { original, destination, movement };
  }

  function migrateEntryToDate(record, targetDate, options = {}) {
    const current = migrateEntry(record, options);
    if (!current) throw new TypeError('Entrada inválida.');
    if (current.entryType === 'task') return migrateTask(current, targetDate, options);
    if (current.archivedAt) throw new TypeError('Entradas arquivadas não podem ser migradas.');
    const toDate = dateKey(targetDate, options);
    if (toDate === current.date) throw new TypeError('Escolha outra data para migrar.');
    const timestamp = iso(options);
    const movement = { fromDate: current.date, toDate, reason: text(options.reason, 80) || null, migratedAt: timestamp };
    const history = [...current.migrationHistory, movement];
    const original = {
      ...current,
      archivedAt: timestamp,
      migrationHistory: history,
      updatedAt: timestamp,
      metadata: { ...current.metadata, migrationCount: history.length }
    };
    const destination = {
      ...clone(current),
      id: id('journal', { ...options, id: options.newId }),
      entryType: current.entryType,
      taskStatus: null,
      date: toDate,
      createdAt: timestamp,
      updatedAt: timestamp,
      archivedAt: null,
      scheduledFor: toDate,
      migratedFromEntryId: current.id,
      migrationHistory: history,
      source: { type: 'migration', id: current.id },
      resultRef: null,
      metadata: { ...current.metadata, migrationCount: history.length }
    };
    return { original, destination, movement };
  }

  function addComment(record, content, options = {}) {
    const current = migrateEntry(record, options);
    const normalized = text(content, 1000);
    if (!current || !normalized) throw new TypeError('Comentário inválido.');
    const timestamp = iso(options);
    return { ...current, comments: [...current.comments, { id: id('comment', options), content: normalized, createdAt: timestamp }], updatedAt: timestamp };
  }

  function dailyJournal(value, date, options = {}) {
    const key = dateKey(date, options);
    const timestamp = iso(options);
    const record = value && typeof value === 'object' ? value : {};
    return {
      date: key,
      intention: text(record.intention, 500),
      intentionRef: ref(record.intentionRef),
      closingReflection: record.closingReflection && typeof record.closingReflection === 'object' ? clone(record.closingReflection) : {},
      mood: mood(record.mood),
      energy: energy(record.energy),
      entryIds: unique(record.entryIds),
      createdAt: record.createdAt || timestamp,
      updatedAt: record.updatedAt || timestamp,
      closedAt: record.closedAt || null
    };
  }

  function upsertDailyJournal(state, date, patch = {}, options = {}) {
    const next = migrateState(state, options);
    const key = dateKey(date, options);
    const timestamp = iso(options);
    const current = dailyJournal(next.dailyJournals[key], key, options);
    next.dailyJournals[key] = dailyJournal({ ...current, ...patch, updatedAt: timestamp }, key, options);
    return next;
  }

  function closeDay(state, date, reflection = {}, options = {}) {
    const timestamp = iso(options);
    return upsertDailyJournal(state, date, {
      closingReflection: Object.fromEntries(Object.entries(reflection || {}).map(([key, value]) => [key, text(value, 1200)]).filter(([, value]) => value)),
      closedAt: timestamp,
      updatedAt: timestamp
    }, options);
  }

  function createCollection(title, options = {}) {
    const normalized = text(title, 120);
    if (!normalized) throw new TypeError('O título da coleção é obrigatório.');
    const timestamp = iso(options);
    return {
      id: id('journal_collection', options),
      schemaVersion: SCHEMA_VERSION,
      title: normalized,
      description: text(options.description, 1000),
      icon: text(options.icon, 12) || 'folder',
      status: COLLECTION_STATUSES.includes(options.status) ? options.status : 'active',
      linkedRefs: refs(options.linkedRefs),
      entryIds: unique(options.entryIds),
      createdAt: timestamp,
      updatedAt: timestamp,
      archivedAt: null
    };
  }

  function migrateCollection(record, options = {}) {
    if (!record || typeof record !== 'object' || !text(record.title, 120)) return null;
    const createdAt = record.createdAt || iso(options);
    return {
      ...clone(record), id: String(record.id || id('journal_collection', options)), schemaVersion: SCHEMA_VERSION,
      title: text(record.title, 120), description: text(record.description, 1000), icon: text(record.icon, 12) || 'folder',
      status: COLLECTION_STATUSES.includes(record.status) ? record.status : 'active', linkedRefs: refs(record.linkedRefs),
      entryIds: unique(record.entryIds), createdAt, updatedAt: record.updatedAt || createdAt, archivedAt: record.archivedAt || null
    };
  }

  function createFutureItem(content, options = {}) {
    const normalized = text(content);
    if (!normalized) throw new TypeError('O conteúdo é obrigatório.');
    const timestamp = iso(options);
    const scheduleType = FUTURE_SCHEDULES.includes(options.scheduleType) ? options.scheduleType : 'undated';
    return {
      id: id('journal_future', options), schemaVersion: SCHEMA_VERSION, content: normalized,
      entryType: ['task', 'event', 'note'].includes(options.entryType) ? options.entryType : 'task',
      scheduleType, scheduledFor: text(options.scheduledFor, 20) || null, status: 'planned', linkedRefs: refs(options.linkedRefs),
      createdAt: timestamp, updatedAt: timestamp, archivedAt: null
    };
  }

  function migrateFutureItem(record, options = {}) {
    if (!record || typeof record !== 'object' || !text(record.content)) return null;
    const createdAt = record.createdAt || iso(options);
    return { ...clone(record), id: String(record.id || id('journal_future', options)), schemaVersion: SCHEMA_VERSION,
      content: text(record.content), entryType: ['task', 'event', 'note'].includes(record.entryType) ? record.entryType : 'task',
      scheduleType: FUTURE_SCHEDULES.includes(record.scheduleType) ? record.scheduleType : 'undated', scheduledFor: text(record.scheduledFor, 20) || null,
      status: ['planned', 'moved', 'cancelled', 'archived'].includes(record.status) ? record.status : 'planned', linkedRefs: refs(record.linkedRefs),
      createdAt, updatedAt: record.updatedAt || createdAt, archivedAt: record.archivedAt || null };
  }

  function migrateMonthlyPlan(record, options = {}) {
    if (!record || typeof record !== 'object' || !/^\d{4}-\d{2}$/.test(String(record.month || ''))) return null;
    const createdAt = record.createdAt || iso(options);
    return { ...clone(record), id: String(record.id || `journal_month_${record.month}`), schemaVersion: SCHEMA_VERSION, month: record.month,
      intention: text(record.intention, 500), priorities: (Array.isArray(record.priorities) ? record.priorities : []).map(item => ({
        id: String(item.id || id('priority', options)), content: text(item.content, 500), status: ['open', 'completed', 'cancelled'].includes(item.status) ? item.status : 'open', linkedRefs: refs(item.linkedRefs), createdAt: item.createdAt || createdAt, updatedAt: item.updatedAt || createdAt
      })).filter(item => item.content), review: record.review && typeof record.review === 'object' ? clone(record.review) : {}, reviewedAt: record.reviewedAt || null,
      createdAt, updatedAt: record.updatedAt || createdAt };
  }

  function migrateState(data, options = {}) {
    const next = data && typeof data === 'object' && !Array.isArray(data) ? clone(data) : {};
    next.journalSchemaVersion = SCHEMA_VERSION;
    next.journalEntries = (Array.isArray(next.journalEntries) ? next.journalEntries : []).map(item => migrateEntry(item, options)).filter(Boolean);
    next.dailyJournals = next.dailyJournals && typeof next.dailyJournals === 'object' && !Array.isArray(next.dailyJournals) ? next.dailyJournals : {};
    next.dailyJournals = Object.fromEntries(Object.entries(next.dailyJournals).map(([key, value]) => [dateKey(key, options), dailyJournal(value, key, options)]));
    next.journalCollections = (Array.isArray(next.journalCollections) ? next.journalCollections : []).map(item => migrateCollection(item, options)).filter(Boolean);
    next.journalFutureItems = (Array.isArray(next.journalFutureItems) ? next.journalFutureItems : []).map(item => migrateFutureItem(item, options)).filter(Boolean);
    next.journalMonthlyPlans = (Array.isArray(next.journalMonthlyPlans) ? next.journalMonthlyPlans : []).map(item => migrateMonthlyPlan(item, options)).filter(Boolean);
    next.journalConflicts = Array.isArray(next.journalConflicts) ? next.journalConflicts : [];
    return next;
  }

  function entriesForDate(state, date) {
    const key = dateKey(date);
    return (state?.journalEntries || []).filter(item => item.date === key && !item.archivedAt && item.taskStatus !== 'archived').sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
  }

  function filterEntries(entries, filters = {}) {
    const query = text(filters.query, 500).toLocaleLowerCase('pt-BR');
    return (Array.isArray(entries) ? entries : []).filter(item => {
      if (filters.entryType && item.entryType !== filters.entryType) return false;
      if (filters.taskStatus && item.taskStatus !== filters.taskStatus) return false;
      if (filters.signifier && !item.signifiers.includes(filters.signifier)) return false;
      if (filters.collectionId && !item.collectionIds.includes(filters.collectionId)) return false;
      if (filters.linked === 'yes' && !item.linkedRefs.length) return false;
      if (filters.linked === 'no' && item.linkedRefs.length) return false;
      if (Number(filters.migrations) > 0 && item.metadata.migrationCount < Number(filters.migrations)) return false;
      if (!query) return true;
      const haystack = [item.content, ...item.tags, ...(item.comments || []).map(comment => comment.content)].join(' ').toLocaleLowerCase('pt-BR');
      return haystack.includes(query);
    });
  }

  function metrics(entries, options = {}) {
    const items = Array.isArray(entries) ? entries : [];
    const tasks = items.filter(item => item.entryType === 'task');
    const completed = tasks.filter(item => item.taskStatus === 'completed');
    const durations = completed.map(item => Math.max(0, new Date(item.completedAt).getTime() - new Date(item.createdAt).getTime())).filter(Number.isFinite);
    return {
      entries: items.length, tasks: tasks.length, completed: completed.length,
      completionRate: tasks.length ? Math.round(completed.length / tasks.length * 100) : 0,
      migrations: items.reduce((sum, item) => sum + Number(item.metadata?.migrationCount || 0), 0),
      repeatedlyMigrated: items.filter(item => Number(item.metadata?.migrationCount || 0) >= 3).length,
      learnings: items.filter(item => item.entryType === 'learning').length,
      questions: items.filter(item => item.entryType === 'question').length,
      averageCompletionMs: durations.length ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length) : null,
      generatedAt: iso(options)
    };
  }

  return Object.freeze({
    SCHEMA_VERSION, ENTRY_TYPES, TASK_STATUSES, SIGNIFIERS, REF_TYPES, SOURCE_TYPES, FUTURE_SCHEDULES,
    dateKey, createEntry, migrateEntry, updateEntry, setTaskStatus, migrateTask, migrateEntryToDate, addComment,
    dailyJournal, upsertDailyJournal, closeDay, createCollection, migrateCollection,
    createFutureItem, migrateFutureItem, migrateMonthlyPlan, migrateState, entriesForDate, filterEntries, metrics, refs
  });
});
