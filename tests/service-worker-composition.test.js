const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');

test('service worker insere o modelo de capturas antes da feature no HTML de produção', async () => {
  const context = {
    Response,
    Headers,
    Request,
    URL,
    Promise,
    setTimeout,
    clearTimeout,
    self: {
      addEventListener() {},
      clients: { claim() {} },
      skipWaiting() {}
    },
    caches: {
      async match(request) {
        const raw = typeof request === 'string' ? request : request.url;
        const file = path.join(root, raw.replace(/^\.\//, '') || 'index.html');
        return fs.existsSync(file) ? new Response(fs.readFileSync(file)) : undefined;
      },
      async open() { return { put() {} }; },
      async keys() { return []; },
      async delete() { return true; }
    },
    async fetch(request) {
      const raw = typeof request === 'string' ? request : request.url;
      const file = path.join(root, raw.replace(/^\.\//, '') || 'index.html');
      return fs.existsSync(file)
        ? new Response(fs.readFileSync(file), { status: 200 })
        : new Response('', { status: 404 });
    }
  };

  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8'), context);
  const response = await context.enhanceHtmlResponse(new Response(fs.readFileSync(path.join(root, 'index.html'))));
  const html = await response.text();
  const modelIndex = html.indexOf('/* Compasso · Modelo puro da caixa de entrada de capturas */');
  const featureIndex = html.indexOf('/* Compasso · Capturas, caixa de entrada e destilacao de notas */');

  assert.ok(modelIndex >= 0, 'capture-model.js deve participar do HTML composto');
  assert.ok(featureIndex > modelIndex, 'o modelo deve carregar antes da feature');
  assert.match(html, /root\.CompassoCaptureModel = api/);
});
