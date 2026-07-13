/* Compasso · Modelo puro da caixa de entrada de capturas */
(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CompassoCaptureModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const STATUSES = Object.freeze(['inbox', 'processed', 'archived', 'deleted']);
  const SOURCE_TYPES = Object.freeze(['manual', 'session', 'note', 'evidence', 'action', 'reading', 'study', 'goal']);
  const REF_TYPES = Object.freeze(['reading', 'study', 'goal', 'action', 'session', 'note']);
  const DECISIONS = Object.freeze(['note', 'recall', 'action', 'evidence', 'archive', 'discard']);
  const RESULT_TYPES = Object.freeze(['note', 'recall', 'action', 'evidence']);

  function clone(value) {
    if (value == null) return value;
    return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));
  }

  function nowIso(options = {}) {
    const value = typeof options.now === 'function' ? options.now() : options.now;
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) throw new TypeError('Data inválida.');
    return date.toISOString();
  }

  function permanentId(options = {}) {
    if (options.id) return String(options.id);
    const uuid = typeof options.idFactory === 'function'
      ? options.idFactory()
      : globalThis.crypto?.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    return `capture_${uuid}`;
  }

  function normalizeContent(value) {
    return typeof value === 'string' ? value.trim() : '';
  }

  function normalizeSource(source) {
    const type = SOURCE_TYPES.includes(source?.type) ? source.type : 'manual';
    return { type, id: source?.id == null ? null : String(source.id) };
  }

  function normalizeRef(ref) {
    if (!ref || !REF_TYPES.includes(ref.type) || ref.id == null || !String(ref.id).trim()) return null;
    return { type: ref.type, id: String(ref.id).trim() };
  }

  function uniqueRefs(refs) {
    const seen = new Set();
    return (Array.isArray(refs) ? refs : []).map(normalizeRef).filter(ref => {
      if (!ref) return false;
      const key = `${ref.type}:${ref.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function normalizeResultRef(resultRef) {
    if (!resultRef || !RESULT_TYPES.includes(resultRef.type) || resultRef.id == null || !String(resultRef.id).trim()) return null;
    return { type: resultRef.type, id: String(resultRef.id).trim() };
  }

  function validate(capture) {
    const errors = [];
    if (!capture || typeof capture !== 'object' || Array.isArray(capture)) errors.push('capture');
    if (!normalizeContent(capture?.content)) errors.push('content');
    if (!capture?.id || !String(capture.id).startsWith('capture_')) errors.push('id');
    if (!STATUSES.includes(capture?.status)) errors.push('status');
    if (!SOURCE_TYPES.includes(capture?.source?.type)) errors.push('source');
    if (!Array.isArray(capture?.linkedRefs) || capture.linkedRefs.some(ref => !normalizeRef(ref))) errors.push('linkedRefs');
    if (capture?.processingDecision != null && !DECISIONS.includes(capture.processingDecision)) errors.push('processingDecision');
    if (capture?.resultRef != null && !normalizeResultRef(capture.resultRef)) errors.push('resultRef');
    if (!capture?.createdAt || Number.isNaN(Date.parse(capture.createdAt))) errors.push('createdAt');
    if (!capture?.updatedAt || Number.isNaN(Date.parse(capture.updatedAt))) errors.push('updatedAt');
    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  function create(content, options = {}) {
    const normalized = normalizeContent(content);
    if (!normalized) throw new TypeError('O conteúdo da captura é obrigatório.');
    if (normalized.length > 5000) throw new RangeError('A captura deve ter no máximo 5.000 caracteres.');
    const timestamp = nowIso(options);
    return {
      id: permanentId(options),
      content: normalized,
      status: 'inbox',
      source: normalizeSource(options.source),
      linkedRefs: uniqueRefs(options.linkedRefs),
      resultRef: null,
      processingDecision: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      processedAt: null,
      archivedAt: null,
      deletedAt: null
    };
  }

  function migrateCapture(record, options = {}) {
    if (!record || typeof record !== 'object' || Array.isArray(record)) return null;
    const content = normalizeContent(record.content);
    if (!content) return null;
    const createdAt = !Number.isNaN(Date.parse(record.createdAt)) ? new Date(record.createdAt).toISOString() : nowIso(options);
    const updatedAt = !Number.isNaN(Date.parse(record.updatedAt)) ? new Date(record.updatedAt).toISOString() : createdAt;
    const status = STATUSES.includes(record.status) ? record.status : 'inbox';
    const decision = DECISIONS.includes(record.processingDecision) ? record.processingDecision : null;
    return {
      ...clone(record),
      id: String(record.id || permanentId(options)),
      content,
      status,
      source: normalizeSource(record.source),
      linkedRefs: uniqueRefs(record.linkedRefs),
      resultRef: normalizeResultRef(record.resultRef),
      processingDecision: decision,
      createdAt,
      updatedAt,
      processedAt: record.processedAt || null,
      archivedAt: record.archivedAt || null,
      deletedAt: record.deletedAt || null
    };
  }

  function migrateState(data, options = {}) {
    const next = data && typeof data === 'object' && !Array.isArray(data) ? clone(data) : {};
    next.captures = (Array.isArray(next.captures) ? next.captures : [])
      .map((record, index) => migrateCapture(record, { ...options, id: record?.id || undefined, idFactory: options.idFactory ? () => options.idFactory(index) : undefined }))
      .filter(Boolean);
    next.notes = Array.isArray(next.notes) ? next.notes : [];
    return next;
  }

  function update(capture, patch = {}, options = {}) {
    const current = migrateCapture(capture, options);
    if (!current) throw new TypeError('Captura inválida.');
    const next = { ...current };
    if (Object.prototype.hasOwnProperty.call(patch, 'content')) {
      const content = normalizeContent(patch.content);
      if (!content) throw new TypeError('O conteúdo da captura é obrigatório.');
      if (content.length > 5000) throw new RangeError('A captura deve ter no máximo 5.000 caracteres.');
      next.content = content;
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'linkedRefs')) next.linkedRefs = uniqueRefs(patch.linkedRefs);
    if (Object.prototype.hasOwnProperty.call(patch, 'source')) next.source = normalizeSource(patch.source);
    next.updatedAt = nowIso(options);
    return next;
  }

  function linkRef(capture, ref, options = {}) {
    const normalized = normalizeRef(ref);
    if (!normalized) throw new TypeError('Referência inválida.');
    const current = migrateCapture(capture, options);
    if (!current) throw new TypeError('Captura inválida.');
    return update(current, { linkedRefs: [...current.linkedRefs, normalized] }, options);
  }

  function removeRef(capture, ref, options = {}) {
    const normalized = normalizeRef(ref);
    if (!normalized) throw new TypeError('Referência inválida.');
    const current = migrateCapture(capture, options);
    if (!current) throw new TypeError('Captura inválida.');
    return update(current, { linkedRefs: current.linkedRefs.filter(item => item.type !== normalized.type || item.id !== normalized.id) }, options);
  }

  function markProcessed(capture, decision, resultRef = null, options = {}) {
    if (!DECISIONS.includes(decision)) throw new TypeError('Decisão de processamento inválida.');
    if (decision === 'archive') return archive(capture, options);
    const current = migrateCapture(capture, options);
    if (!current) throw new TypeError('Captura inválida.');
    const result = normalizeResultRef(resultRef);
    if (RESULT_TYPES.includes(decision) && (!result || result.type !== decision)) throw new TypeError('O resultado do processamento é obrigatório e deve corresponder à decisão.');
    const timestamp = nowIso(options);
    return {
      ...current,
      status: decision === 'discard' ? 'deleted' : 'processed',
      processingDecision: decision,
      resultRef: result,
      processedAt: timestamp,
      archivedAt: null,
      deletedAt: decision === 'discard' ? timestamp : null,
      updatedAt: timestamp
    };
  }

  function archive(capture, options = {}) {
    const current = migrateCapture(capture, options);
    if (!current) throw new TypeError('Captura inválida.');
    const timestamp = nowIso(options);
    return { ...current, status: 'archived', processingDecision: 'archive', resultRef: null, processedAt: timestamp, archivedAt: timestamp, deletedAt: null, updatedAt: timestamp };
  }

  function markDeleted(capture, options = {}) {
    const current = migrateCapture(capture, options);
    if (!current) throw new TypeError('Captura inválida.');
    const timestamp = nowIso(options);
    return { ...current, status: 'deleted', deletedAt: timestamp, updatedAt: timestamp };
  }

  function sortByDate(records, order = 'oldest') {
    const direction = order === 'newest' ? -1 : 1;
    return (Array.isArray(records) ? records : []).slice().sort((a, b) => direction * (Date.parse(a?.createdAt) - Date.parse(b?.createdAt)) || String(a?.id || '').localeCompare(String(b?.id || '')));
  }

  function inbox(records, order = 'oldest') {
    return sortByDate((Array.isArray(records) ? records : []).filter(record => record?.status === 'inbox'), order);
  }

  function pendingCount(records) {
    return inbox(records).length;
  }

  return Object.freeze({
    STATUSES, SOURCE_TYPES, REF_TYPES, DECISIONS, RESULT_TYPES,
    create, validate, update, linkRef, removeRef, markProcessed, archive, markDeleted,
    migrateCapture, migrateState, inbox, sortByDate, pendingCount, normalizeRef
  });
});
