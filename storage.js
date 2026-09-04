(() => {
  'use strict';

  const DB_NAME = 'compasso-db';
  const DB_VERSION = 1;
  const STATE_STORE = 'appState';
  const SCHEMA_VERSION = 1;
  const LOCAL_MIRROR_LIMIT = 256 * 1024;

  let databasePromise = null;
  const memory = new Map();
  const writeQueues = new Map();
  const replacementLocks = new Map();
  let persistenceMode = 'indexeddb';

  function readLocalSnapshot(key) {
    try {
      const serialized = localStorage.getItem(key);
      return { readable: true, present: serialized !== null, serialized };
    }
    catch (error) {
      console.warn('[CompassoStorage] localStorage indisponível para leitura.', error);
      return { readable: false, present: false, serialized: null };
    }
  }

  function readLocal(key) {
    return readLocalSnapshot(key).serialized;
  }

  function removeLocalValue(key) {
    try { localStorage.removeItem(key); return true; }
    catch (error) {
      console.warn('[CompassoStorage] Não foi possível remover o espelho local.', error);
      return false;
    }
  }

  function writeLocalValue(key, serialized, {
    allowLarge = false,
    preservePreviousOnFailure = false
  } = {}) {
    if (!allowLarge && serialized.length > LOCAL_MIRROR_LIMIT) {
      if (!preservePreviousOnFailure) removeLocalValue(key);
      return false;
    }
    try {
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      // O IndexedDB é a fonte de verdade. Um espelho cheio nunca pode impedir
      // o bootstrap nem uma gravação válida no banco principal.
      if (!preservePreviousOnFailure) removeLocalValue(key);
      console.warn('[CompassoStorage] Espelho local ignorado por falta de espaço.', error);
      return false;
    }
  }

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

  async function readStateSnapshot(key) {
    const db = await openDatabase();
    if (!db) return { readable: false, present: false, record: null };
    const record = await readStateRecord(key);
    return { readable: true, present: Boolean(record), record: clone(record) };
  }

  async function writeStateRecord(key, serialized) {
    const db = await openDatabase();
    if (!db) return false;

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
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error || new Error('Falha ao persistir o estado'));
      transaction.onabort = () => reject(transaction.error || new Error('Persistência cancelada'));
    });
  }

  async function deleteStateRecord(key) {
    const db = await openDatabase();
    if (!db) throw new Error('IndexedDB indisponível para restauração');

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STATE_STORE, 'readwrite');
      transaction.objectStore(STATE_STORE).delete(key);
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error || new Error('Falha ao remover o estado'));
      transaction.onabort = () => reject(transaction.error || new Error('Remoção cancelada'));
    });
  }

  async function restoreStateRecord(snapshot, key) {
    if (!snapshot.readable) return;
    const current = await readStateSnapshot(key);
    if (!current.readable) throw new Error('IndexedDB indisponível durante a compensação');

    const sameRecord = current.present === snapshot.present
      && JSON.stringify(current.record) === JSON.stringify(snapshot.record);
    if (sameRecord) return;

    if (!snapshot.present) {
      await deleteStateRecord(key);
      return;
    }

    const db = await openDatabase();
    if (!db) throw new Error('IndexedDB indisponível durante a compensação');
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(STATE_STORE, 'readwrite');
      transaction.objectStore(STATE_STORE).put(clone(snapshot.record));
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error || new Error('Falha ao restaurar o estado'));
      transaction.onabort = () => reject(transaction.error || new Error('Restauração cancelada'));
    });
  }

  function restoreLocalValue(snapshot, key) {
    if (!snapshot.readable) return;
    const current = readLocalSnapshot(key);
    if (!current.readable) throw new Error('localStorage indisponível durante a compensação');
    if (current.present === snapshot.present && current.serialized === snapshot.serialized) return;
    if (snapshot.present) localStorage.setItem(key, snapshot.serialized);
    else localStorage.removeItem(key);
  }

  function snapshotsMatch(left, right, valueField) {
    if (!left.readable || !right.readable) return left.readable === right.readable;
    return left.present === right.present
      && JSON.stringify(left[valueField]) === JSON.stringify(right[valueField]);
  }

  async function captureCheckpoint(key) {
    return {
      memory: {
        present: memory.has(key),
        serialized: memory.has(key) ? memory.get(key) : null
      },
      indexedDB: await readStateSnapshot(key),
      localStorage: readLocalSnapshot(key),
      persistenceMode
    };
  }

  async function restoreCheckpoint(key, checkpoint) {
    try {
      await restoreStateRecord(checkpoint.indexedDB, key);
      restoreLocalValue(checkpoint.localStorage, key);

      if (checkpoint.memory.present) memory.set(key, checkpoint.memory.serialized);
      else memory.delete(key);
      persistenceMode = checkpoint.persistenceMode;

      const currentIndexedDB = await readStateSnapshot(key);
      const currentLocal = readLocalSnapshot(key);
      const memoryMatches = memory.has(key) === checkpoint.memory.present
        && (!checkpoint.memory.present || memory.get(key) === checkpoint.memory.serialized);
      const indexedDBMatches = snapshotsMatch(
        currentIndexedDB,
        checkpoint.indexedDB,
        'record'
      );
      const localMatches = snapshotsMatch(
        currentLocal,
        checkpoint.localStorage,
        'serialized'
      );

      if (!memoryMatches || !indexedDBMatches || !localMatches) {
        throw new Error('A compensação não corresponde ao checkpoint anterior');
      }
    } catch (cause) {
      const error = new Error('Não foi possível confirmar a recuperação do estado anterior.');
      error.code = 'storage-rollback-failed';
      error.cause = cause;
      throw error;
    }
  }

  async function persistSerialized(key, serialized, { allowLocal = true } = {}) {
    let primaryPersisted = false;
    try {
      primaryPersisted = await writeStateRecord(key, serialized);
    } catch (error) {
      console.error('[CompassoStorage] Falha ao gravar no IndexedDB.', error);
    }

    if (primaryPersisted) {
      persistenceMode = 'indexeddb';
      if (allowLocal) {
        writeLocalValue(key, serialized, {
          allowLarge: false,
          preservePreviousOnFailure: false
        });
      }
      return true;
    }

    const fallbackPersisted = allowLocal && writeLocalValue(key, serialized, {
      allowLarge: true,
      preservePreviousOnFailure: true
    });
    if (fallbackPersisted) {
      persistenceMode = 'localstorage-fallback';
      return true;
    }

    persistenceMode = 'memory-fallback';
    return false;
  }

  function enqueueTask(key, task, { propagate = false } = {}) {
    const previous = writeQueues.get(key) || Promise.resolve();
    const operation = previous
      .catch(() => undefined)
      .then(task);
    const tail = operation.catch(() => undefined);

    writeQueues.set(key, tail);
    if (propagate) return operation;
    return operation.catch(error => {
      persistenceMode = 'memory-fallback';
      console.error('[CompassoStorage] Falha inesperada ao persistir.', error);
      return false;
    });
  }

  function enqueueWrite(key, serialized) {
    return enqueueTask(key, () => persistSerialized(key, serialized));
  }

  function enqueueReplacement(key, task) {
    return enqueueTask(key, task, { propagate: true });
  }

  function announceReady(migrated) {
    window.dispatchEvent(new CustomEvent('compasso:storage-ready', {
      detail: { mode: persistenceMode, migrated }
    }));
  }

  async function ready(key) {
    const legacySerialized = readLocal(key);
    let record = null;

    try {
      record = await readStateRecord(key);
    } catch (error) {
      persistenceMode = 'localstorage-fallback';
      console.warn('[CompassoStorage] Falha ao ler o IndexedDB; preservando o estado legado.', error);
    }

    // Um espelho legado diferente pode conter a última gravação síncrona feita
    // antes de a fila do IndexedDB terminar. Migre-o uma vez e, se for grande,
    // remova-o somente depois de confirmar a escrita no banco principal.
    if (legacySerialized && (!record || legacySerialized !== record.serialized)) {
      memory.set(key, legacySerialized);
      const migrated = await enqueueWrite(key, legacySerialized);
      announceReady(Boolean(migrated));
      return;
    }

    if (record?.serialized) {
      memory.set(key, record.serialized);
      writeLocalValue(key, record.serialized);
    }

    announceReady(false);
  }

  function getSerialized(key) {
    return memory.get(key) ?? readLocal(key);
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
    if (replacementLocks.has(key)) return Promise.resolve(false);

    let serialized;
    try { serialized = JSON.stringify(value); }
    catch (error) {
      console.error('[CompassoStorage] Estado não serializável; gravação ignorada.', error);
      return Promise.resolve(false);
    }
    if (typeof serialized !== 'string') return Promise.resolve(false);
    memory.set(key, serialized);
    return enqueueWrite(key, serialized);
  }

  function replace(key, value, activate) {
    if (replacementLocks.has(key)) return Promise.resolve(false);

    let serialized;
    try { serialized = JSON.stringify(value); }
    catch (error) {
      console.error('[CompassoStorage] Candidato de restauração não serializável.', error);
      return Promise.resolve(false);
    }
    if (typeof serialized !== 'string') return Promise.resolve(false);

    const persistedCandidate = JSON.parse(serialized);
    replacementLocks.set(key, true);

    const operation = enqueueReplacement(key, async () => {
      let checkpoint;
      let candidateTouchedMemory = false;

      try {
        checkpoint = await captureCheckpoint(key);
        memory.set(key, serialized);
        candidateTouchedMemory = true;

        const persisted = await persistSerialized(key, serialized, {
          allowLocal: checkpoint.localStorage.readable
        });
        if (!persisted) {
          await restoreCheckpoint(key, checkpoint);
          return false;
        }

        try {
          await activate(persistedCandidate);
          return true;
        } catch (error) {
          console.error('[CompassoStorage] Falha ao ativar a restauração; compensando.', error);
          await restoreCheckpoint(key, checkpoint);
          return false;
        }
      } catch (error) {
        if (error?.code === 'storage-rollback-failed') throw error;
        if (checkpoint && candidateTouchedMemory) {
          await restoreCheckpoint(key, checkpoint);
        }
        console.error('[CompassoStorage] Restauração local interrompida.', error);
        return false;
      }
    });

    return operation.then(
      result => {
        replacementLocks.delete(key);
        return result;
      },
      error => {
        if (error?.code !== 'storage-rollback-failed') replacementLocks.delete(key);
        throw error;
      }
    );
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
      localMirrorLimit: LOCAL_MIRROR_LIMIT,
      stores: db ? Array.from(db.objectStoreNames) : []
    };
  }

  window.CompassoStorage = Object.freeze({
    ready,
    getSerialized,
    load,
    save,
    replace,
    flush,
    diagnostics,
    DB_NAME,
    DB_VERSION,
    SCHEMA_VERSION
  });
})();
