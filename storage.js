(() => {
  'use strict';

  const DB_NAME = 'compasso-db';
  const DB_VERSION = 1;
  const STATE_STORE = 'appState';
  const SCHEMA_VERSION = 1;

  let databasePromise = null;
  const memory = new Map();
  const writeQueues = new Map();
  let persistenceMode = 'indexeddb';

  function clone(value) {
    if (value == null) return value;
    return typeof structuredClone === 'function'
      ? structuredClone(value)
      : JSON.parse(JSON.stringify(value));
  }

  function openDatabase() {
    if (databasePromise) return databasePromise;

    databasePromise = new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        persistenceMode = 'localstorage-fallback';
        reject(new Error('IndexedDB indisponível'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = event => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains(STATE_STORE)) {
          db.createObjectStore(STATE_STORE, { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains('sessions')) {
          const sessions = db.createObjectStore('sessions', { keyPath: 'id' });
          sessions.createIndex('itemId', 'itemId', { unique: false });
          sessions.createIndex('domain', 'domain', { unique: false });
          sessions.createIndex('startedAt', 'startedAt', { unique: false });
          sessions.createIndex('status', 'status', { unique: false });
        }

        if (!db.objectStoreNames.contains('evidence')) {
          const evidence = db.createObjectStore('evidence', { keyPath: 'id' });
          evidence.createIndex('sessionId', 'sessionId', { unique: false });
          evidence.createIndex('itemId', 'itemId', { unique: false });
          evidence.createIndex('createdAt', 'createdAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('reviewItems')) {
          const reviews = db.createObjectStore('reviewItems', { keyPath: 'id' });
          reviews.createIndex('dueAt', 'dueAt', { unique: false });
          reviews.createIndex('sourceId', 'sourceId', { unique: false });
          reviews.createIndex('status', 'status', { unique: false });
        }

        if (!db.objectStoreNames.contains('weeklyReviews')) {
          const weekly = db.createObjectStore('weeklyReviews', { keyPath: 'id' });
          weekly.createIndex('weekStart', 'weekStart', { unique: true });
        }

        if (!db.objectStoreNames.contains('attachments')) {
          const attachments = db.createObjectStore('attachments', { keyPath: 'id' });
          attachments.createIndex('ownerId', 'ownerId', { unique: false });
          attachments.createIndex('createdAt', 'createdAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'key' });
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => db.close();
        resolve(db);
      };
      request.onerror = () => reject(request.error || new Error('Falha ao abrir IndexedDB'));
      request.onblocked = () => console.warn('[CompassoStorage] Atualização do banco bloqueada por outra aba.');
    }).catch(error => {
      persistenceMode = 'localstorage-fallback';
      console.warn('[CompassoStorage] Usando localStorage como contingência.', error);
      return null;
    });

    return databasePromise;
  }

  async function readStateRecord(key) {
    const db = await openDatabase();
    if (!db) return null;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STATE_STORE, 'readonly');
      const request = transaction.objectStore(STATE_STORE).get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error || new Error('Falha ao ler o estado'));
    });
  }

  async function writeStateRecord(key, serialized) {
    const db = await openDatabase();
    if (!db) return;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STATE_STORE, 'meta'], 'readwrite');
      transaction.objectStore(STATE_STORE).put({
        key,
        serialized,
        schemaVersion: SCHEMA_VERSION,
        updatedAt: new Date().toISOString()
      });
      transaction.objectStore('meta').put({
        key: 'storage',
        mode: 'indexeddb',
        schemaVersion: SCHEMA_VERSION,
        updatedAt: new Date().toISOString()
      });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error('Falha ao persistir o estado'));
      transaction.onabort = () => reject(transaction.error || new Error('Persistência cancelada'));
    });
  }

  function enqueueWrite(key, serialized) {
    const previous = writeQueues.get(key) || Promise.resolve();
    const next = previous
      .catch(() => undefined)
      .then(() => writeStateRecord(key, serialized))
      .catch(error => {
        persistenceMode = 'localstorage-fallback';
        console.error('[CompassoStorage] Falha ao gravar no IndexedDB.', error);
      });

    writeQueues.set(key, next);
    return next;
  }

  function announceReady(migrated) {
    window.dispatchEvent(new CustomEvent('compasso:storage-ready', {
      detail: { mode: persistenceMode, migrated }
    }));
  }

  async function ready(key) {
    const legacySerialized = localStorage.getItem(key);
    let record = null;

    try {
      record = await readStateRecord(key);
    } catch (error) {
      persistenceMode = 'localstorage-fallback';
      console.warn('[CompassoStorage] Falha ao ler o IndexedDB; preservando o estado legado.', error);
    }

    // Se o app legado alterou o localStorage depois da última sincronização,
    // essa versão visível ao usuário tem precedência e é migrada para o IndexedDB.
    if (legacySerialized && (!record || legacySerialized !== record.serialized)) {
      memory.set(key, legacySerialized);
      await enqueueWrite(key, legacySerialized);
      announceReady(true);
      return;
    }

    if (record?.serialized) {
      memory.set(key, record.serialized);
      localStorage.setItem(key, record.serialized);
    } else if (legacySerialized) {
      memory.set(key, legacySerialized);
    }

    announceReady(Boolean(legacySerialized && !record));
  }

  function getSerialized(key) {
    return memory.get(key) ?? localStorage.getItem(key);
  }

  function load(key, fallback = null) {
    const serialized = getSerialized(key);
    if (!serialized) return clone(fallback);

    try {
      return JSON.parse(serialized);
    } catch (error) {
      console.error('[CompassoStorage] Estado inválido; usando fallback.', error);
      return clone(fallback);
    }
  }

  function save(key, value) {
    const serialized = JSON.stringify(value);
    memory.set(key, serialized);

    // Espelho temporário para rollback, compatibilidade com backups antigos
    // e primeiras visitas ainda não controladas pelo service worker.
    localStorage.setItem(key, serialized);
    return enqueueWrite(key, serialized);
  }

  async function flush(key) {
    await (writeQueues.get(key) || Promise.resolve());
  }

  async function diagnostics() {
    const db = await openDatabase();
    return {
      database: DB_NAME,
      version: DB_VERSION,
      schemaVersion: SCHEMA_VERSION,
      mode: db ? 'indexeddb' : 'localstorage-fallback',
      stores: db ? Array.from(db.objectStoreNames) : []
    };
  }

  window.CompassoStorage = Object.freeze({
    ready,
    getSerialized,
    load,
    save,
    flush,
    diagnostics,
    DB_NAME,
    DB_VERSION,
    SCHEMA_VERSION
  });
})();
