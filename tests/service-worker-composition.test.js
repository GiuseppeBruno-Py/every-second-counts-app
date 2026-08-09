const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const manifest = require(path.join(root, 'app-manifest.js'));
const composition = require(path.join(root, 'app-composition.js'));
const rawHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const sources = manifest.modules.map((module) => ({
  file: module.file,
  source: fs.readFileSync(path.join(root, module.file), 'utf8'),
}));

function compose(html = rawHtml, modules = sources, selectedManifest = manifest) {
  return composition.composeDocument({ html, manifest: selectedManifest, modules });
}

function facts(result) {
  assert.equal(result.ok, true, result.code);
  return {
    files: result.files,
    marker: composition.count(result.html, composition.generationMarker(manifest.cacheName)),
    support: manifest.composition.supportPrerequisites.map((item) => composition.count(result.html, item.token)),
    starts: manifest.modules.map((module) => result.html.indexOf(composition.startSentinel(module.file))),
  };
}

test('LF e CRLF produzem a mesma composição completa derivada do manifesto', () => {
  const lf = rawHtml.replace(/\r\n/g, '\n');
  const crlf = lf.replace(/\n/g, '\r\n');
  const lfFacts = facts(compose(lf));
  const crlfFacts = facts(compose(crlf));
  assert.deepEqual(lfFacts.files, manifest.modules.map((module) => module.file));
  assert.deepEqual(crlfFacts.files, lfFacts.files);
  assert.equal(lfFacts.marker, 1);
  assert.equal(crlfFacts.marker, 1);
  assert.deepEqual(lfFacts.support, crlfFacts.support);
  assert.ok(lfFacts.starts.every((position, index, all) => position >= 0 && (!index || position > all[index - 1])));
  assert.ok(crlfFacts.starts.every((position, index, all) => position >= 0 && (!index || position > all[index - 1])));
});

test('identidade exata não confunde menção anterior a weekly-plan-model.js', () => {
  assert.match(sources.find((module) => module.file === 'today-feature.js').source, /CompassoWeeklyPlanModel/);
  const result = compose();
  assert.equal(result.ok, true, result.code);
  assert.equal(composition.count(result.html, composition.startSentinel('weekly-plan-model.js')), 1);
  assert.equal(composition.count(result.html, composition.endSentinel('weekly-plan-model.js')), 1);
});

test('recomposição válida é idempotente e não duplica módulos', () => {
  const first = compose();
  const second = compose(first.html);
  assert.equal(first.ok, true);
  assert.equal(second.ok, true, second.code);
  assert.equal(second.html, first.html);
  for (const module of manifest.modules) {
    assert.equal(composition.count(second.html, composition.startSentinel(module.file)), 1);
    assert.equal(composition.count(second.html, composition.endSentinel(module.file)), 1);
  }
});

test('âncoras ausentes ou ambíguas nunca recebem identidade de sucesso', () => {
  const slot = manifest.composition.moduleSlot;
  const missing = compose(rawHtml.replace(slot, ''));
  const ambiguous = compose(rawHtml.replace(slot, `${slot}\n${slot}`));
  assert.equal(missing.ok, false);
  assert.equal(missing.code, 'missing-module-slot');
  assert.equal(ambiguous.ok, false);
  assert.equal(ambiguous.code, 'ambiguous-module-slot');
  assert.doesNotMatch(missing.html, /name="compasso-application-generation"/);
  assert.doesNotMatch(ambiguous.html, /name="compasso-application-generation"/);
});

test('suporte ou módulo ausente falha sem sucesso parcial', () => {
  const supportToken = manifest.composition.supportPrerequisites[0].token;
  const missingSupport = compose(rawHtml.replace(supportToken, 'href="./missing-app-ui.css"'));
  const missingModules = sources.map((module) => module.file === 'capture-model.js' ? { ...module, source: '' } : module);
  const missingModule = compose(rawHtml, missingModules);
  assert.equal(missingSupport.ok, false);
  assert.equal(missingSupport.code, 'missing-support');
  assert.equal(missingModule.ok, false);
  assert.equal(missingModule.code, 'missing-module');
  assert.equal(missingModule.details.file, 'capture-model.js');
  assert.doesNotMatch(missingModule.html, /data-composition="complete"/);
});

test('duplicação, ordem errada e sentinela reservada são rejeitadas', () => {
  const complete = compose();
  assert.equal(complete.ok, true);
  const duplicate = complete.html.replace(
    composition.BLOCK_END,
    `${composition.startSentinel('weekly-plan-model.js')}\n${composition.BLOCK_END}`,
  );
  const wrongOrder = complete.html
    .replace(composition.startSentinel('state-foundation.js'), '__FIRST__')
    .replace(composition.startSentinel('feature-runtime.js'), composition.startSentinel('state-foundation.js'))
    .replace('__FIRST__', composition.startSentinel('feature-runtime.js'));
  const reserved = sources.map((module) => module.file === 'capture-model.js'
    ? { ...module, source: `${module.source}\n${composition.SENTINEL_PREFIX}fake:START */` }
    : module);
  assert.equal(compose(duplicate).ok, false);
  assert.equal(compose(wrongOrder).code, 'module-order');
  assert.equal(compose(rawHtml, reserved).code, 'reserved-module-sentinel');
});

function serviceWorkerContext(options = {}) {
  const handlers = new Map();
  const cacheEntries = new Map();
  for (const asset of manifest.assets) {
    const relative = asset.replace(/^\.\//, '') || 'index.html';
    const file = path.join(root, relative);
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      cacheEntries.set(asset, new Response(fs.readFileSync(file)));
      cacheEntries.set(`./${relative}`, new Response(fs.readFileSync(file)));
    }
  }
  if (options.missing) cacheEntries.delete(`./${options.missing}`);
  const deleted = [];
  const context = {
    Response,
    Headers,
    Request,
    URL,
    Promise,
    setTimeout,
    clearTimeout,
    console,
    self: {
      CompassoAppManifest: manifest,
      CompassoAppComposition: composition,
      location: { origin: 'https://example.test' },
      addEventListener(type, handler) { handlers.set(type, handler); },
      clients: { claim: async () => {}, matchAll: async () => [], openWindow: async () => null },
      skipWaiting: async () => {},
    },
    caches: {
      async open() {
        return {
          async addAll() {},
          async match(request) {
            const raw = typeof request === 'string' ? request : request.url;
            const key = raw.replace('https://example.test/', './');
            const found = cacheEntries.get(key);
            return found?.clone();
          },
        };
      },
      async keys() { return options.keys || [manifest.cacheName]; },
      async delete(key) { deleted.push(key); return true; },
    },
    async fetch() { return new Response('', { status: 404 }); },
  };
  context.importScripts = (...scripts) => scripts.forEach((script) => {
    if (script.endsWith('app-manifest.js')) context.self.CompassoAppManifest = manifest;
    else if (script.endsWith('app-composition.js')) context.self.CompassoAppComposition = composition;
  });
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8'), context);
  return { context, handlers, deleted };
}

test('Service Worker usa a composição compartilhada e só sinaliza sucesso completo', async () => {
  const { context } = serviceWorkerContext();
  const response = await context.enhanceHtmlResponse(new Response(rawHtml));
  const html = await response.text();
  assert.equal(response.headers.get('x-compasso-composition'), 'complete');
  assert.equal(response.headers.get('x-compasso-generation'), manifest.cacheName);
  assert.equal(composition.count(html, composition.startSentinel('capture-model.js')), 1);
  assert.equal(composition.count(html, composition.startSentinel('journal-feature.js')), 1);
  assert.equal(composition.count(html, composition.startSentinel('capability-context-model.js')), 1);
  for (const preserved of ['context-rag-feature.js','context-learning-feature.js','markdown-vault-feature.js','dictionary-relations-feature.js']) {
    assert.equal(composition.count(html, composition.startSentinel(preserved)), 1);
  }

  const missing = serviceWorkerContext({ missing: 'capture-model.js' });
  const failed = await missing.context.enhanceHtmlResponse(new Response(rawHtml));
  assert.equal(failed.headers.get('x-compasso-composition'), 'failed');
  assert.equal(failed.headers.get('x-compasso-generation'), null);
  assert.equal(failed.headers.get('x-compasso-composition-error'), 'missing-module');
  assert.doesNotMatch(await failed.text(), /data-composition="complete"/);
});

test('Service Worker responde geração técnica sem dados do usuário', () => {
  const { handlers } = serviceWorkerContext();
  let reply;
  handlers.get('message')({
    data: { type: 'compasso:generation:query', requestId: 'request-1', ignored: { user: 'secret' } },
    ports: [{ postMessage(message) { reply = message; } }],
  });
  assert.equal(reply.type, 'compasso:generation:response');
  assert.equal(reply.requestId, 'request-1');
  assert.equal(reply.generation, manifest.cacheName);
  assert.deepEqual(Object.keys(reply).sort(), ['generation', 'requestId', 'type']);
});

test('ativação remove apenas caches Compasso antigos inequivocamente pertencentes', async () => {
  const { handlers, deleted } = serviceWorkerContext({
    keys: [manifest.cacheName, 'compasso-pages-v68', 'compasso-pages-v69-backup', 'unrelated-cache'],
  });
  let work;
  handlers.get('activate')({ waitUntil(promise) { work = promise; } });
  await work;
  assert.deepEqual(deleted, ['compasso-pages-v68']);
});
