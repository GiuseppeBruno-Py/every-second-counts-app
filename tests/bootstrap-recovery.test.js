const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const manifest = require(path.join(root, 'app-manifest.js'));

class FakeMessageChannel {
  constructor() {
    const left = { onmessage: null, close() {} };
    const right = { onmessage: null, close() {} };
    left.postMessage = (data) => queueMicrotask(() => right.onmessage?.({ data }));
    right.postMessage = (data) => queueMicrotask(() => left.onmessage?.({ data }));
    this.port1 = left;
    this.port2 = right;
  }
}

function worker(generation = manifest.cacheName) {
  return {
    state: 'activated',
    postMessage(message, ports) {
      ports[0].postMessage({
        type: 'compasso:generation:response',
        requestId: message.requestId,
        generation,
      });
    },
    addEventListener() {},
    removeEventListener() {},
  };
}

function lifecycleContext(options = {}) {
  const storage = new Map();
  const events = new Map();
  let reloads = 0;
  const activeWorker = options.worker || worker();
  const registration = options.registration || {
    scope: 'https://example.test/app/',
    active: activeWorker,
    installing: null,
    waiting: null,
    async update() {},
    async unregister() { return true; },
    addEventListener() {},
    removeEventListener() {},
  };
  const context = {
    console,
    URL,
    Promise,
    Date,
    crypto: { randomUUID: () => 'request-id' },
    MessageChannel: FakeMessageChannel,
    setTimeout,
    clearTimeout,
    queueMicrotask,
    addEventListener(type, handler) { events.set(type, handler); },
    location: {
      href: 'https://example.test/app/index.html',
      pathname: '/app/index.html',
      protocol: 'https:',
      reload() { reloads += 1; },
    },
    sessionStorage: {
      getItem(key) { return storage.get(key) || null; },
      setItem(key, value) { storage.set(key, value); },
    },
    document: {
      readyState: 'loading',
      documentElement: { dataset: {} },
      addEventListener(type, handler) { events.set(type, handler); },
      querySelector(selector) {
        return selector.includes('compasso-application-generation') && options.documentGeneration
          ? { content: options.documentGeneration }
          : null;
      },
      getElementById() { return null; },
    },
    navigator: {
      onLine: options.online !== false,
      serviceWorker: {
        controller: activeWorker,
        async getRegistration() { return registration; },
        async getRegistrations() { return options.registrations || [registration]; },
        async register() { return registration; },
        addEventListener(type, handler) { events.set(`sw:${type}`, handler); },
      },
    },
    caches: {
      async keys() { return options.cacheKeys || [manifest.cacheName, 'compasso-pages-v68', 'unrelated']; },
      async delete(key) { options.deleted?.push(key); return options.deleteResult ?? true; },
    },
    CompassoAppManifest: manifest,
  };
  vm.createContext(context);
  vm.runInContext(read('bootstrap-diagnostics.js'), context);
  return { context, events, storage, get reloads() { return reloads; } };
}

test('há um único proprietário de location.reload e nenhum timer arbitrário', () => {
  const diagnostic = read('bootstrap-diagnostics.js');
  const html = read('index.html');
  const workerSource = read('service-worker.js');
  assert.equal((diagnostic.match(/location\?\.reload\?\.\(/g) || []).length, 1);
  assert.doesNotMatch(html, /location\.reload|setTimeout\(\(\) => location\.reload|display-mode: standalone|compasso\.sw\.reload/);
  assert.doesNotMatch(workerSource, /location\.reload|Client\.navigate|navigate\(.*reload/);
  assert.match(html, /CompassoPwaLifecycle/);
});

test('orçamento limita uma recarga por geração, motivo e caminho', () => {
  const fixture = lifecycleContext();
  const lifecycle = fixture.context.CompassoPwaLifecycle;
  assert.equal(lifecycle.requestReload('first-visit', manifest.cacheName), true);
  assert.equal(fixture.reloads, 1);
  assert.equal(lifecycle.requestReload('first-visit', manifest.cacheName), false);
  assert.equal(fixture.reloads, 1);
  assert.match(fixture.storage.get('compasso.pwa.reload-budget.v1'), /first-visit/);
  assert.match(fixture.storage.get('compasso.pwa.reload-budget.v1'), /app\/index\.html/);
});

test('consulta de geração é limitada ao protocolo técnico aprovado', async () => {
  const fixture = lifecycleContext();
  const generation = await fixture.context.CompassoPwaLifecycle.queryGeneration(worker('compasso-pages-v123'));
  assert.equal(generation, 'compasso-pages-v123');
});

test('verificação sem atualização mantém geração e produz zero recargas', async () => {
  const fixture = lifecycleContext({ documentGeneration: manifest.cacheName });
  const result = await fixture.context.CompassoPwaLifecycle.checkForUpdate();
  assert.equal(result.updated, false);
  assert.equal(result.generation, manifest.cacheName);
  assert.equal(result.reloads, 0);
  assert.equal(fixture.reloads, 0);
});

test('retry comum não contém limpeza de registro, cache ou persistência', () => {
  const diagnostic = read('bootstrap-diagnostics.js');
  const retryStart = diagnostic.indexOf('async function retry()');
  const retryEnd = diagnostic.indexOf('async function checkForUpdate', retryStart);
  const retry = diagnostic.slice(retryStart, retryEnd);
  assert.doesNotMatch(retry, /unregister|caches\.delete|localStorage|indexedDB/);
  assert.doesNotMatch(diagnostic, /localStorage\.(clear|removeItem)|indexedDB\.deleteDatabase/);
});

test('reset confirmado limita registro e caches e preserva dados do produto', async () => {
  const deleted = [];
  let unregisters = 0;
  const registration = {
    scope: 'https://example.test/app/',
    active: worker(),
    installing: null,
    waiting: null,
    async update() {},
    async unregister() { unregisters += 1; return true; },
    addEventListener() {},
    removeEventListener() {},
  };
  const unrelatedRegistration = { ...registration, scope: 'https://example.test/other/', async unregister() { throw new Error('must not run'); } };
  const fixture = lifecycleContext({
    worker: registration.active,
    registration,
    registrations: [registration, unrelatedRegistration],
    cacheKeys: [manifest.cacheName, 'compasso-pages-v68', 'compasso-pages-v69-backup', 'unrelated'],
    deleted,
  });
  const result = await fixture.context.CompassoPwaLifecycle.resetShell();
  assert.equal(result.ok, true);
  assert.equal(unregisters, 1);
  assert.deepEqual(deleted, [manifest.cacheName, 'compasso-pages-v68']);
  assert.equal(fixture.reloads, 1);
});

test('reset parcial não declara sucesso nem recarrega', async () => {
  const fixture = lifecycleContext({ deleteResult: false });
  const result = await fixture.context.CompassoPwaLifecycle.resetShell();
  assert.equal(result.ok, false);
  assert.equal(result.code, 'reset-partial-failure');
  assert.equal(fixture.reloads, 0);
});

test('documento cru expõe bootstrap neutro e mantém aplicação inerte', () => {
  const html = read('index.html');
  assert.match(html, /id="compassoBootstrap"[^>]+role="status"/);
  assert.match(html, /class="app-shell" hidden inert aria-hidden="true"/);
  assert.match(html, /id="compassoBootstrapRetry"[^>]+hidden/);
  assert.match(html, /id="compassoShellResetDialog"/);
  assert.match(html, /src="\.\/storage\.js"/);
  assert.match(html, /await window\.CompassoStorage\.ready\('compasso\.app\.v1'\)/);
});
