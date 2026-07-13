const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');

function createWorkerContext(missing = new Set()) {
  return {
    Response, Headers, Request, URL, Promise, setTimeout, clearTimeout,
    self:{ addEventListener() {}, clients:{ claim() {} }, skipWaiting() {} },
    caches:{
      async match(request) {
        const raw = typeof request === 'string' ? request : request.url;
        if (missing.has(raw)) return undefined;
        const file = path.join(root, raw.replace(/^\.\//, '') || 'index.html');
        return fs.existsSync(file) ? new Response(fs.readFileSync(file)) : undefined;
      },
      async open() { return { put() {} }; },
      async keys() { return []; },
      async delete() { return true; }
    },
    async fetch(request) {
      const raw = typeof request === 'string' ? request : request.url;
      if (missing.has(raw)) return new Response('', { status:404 });
      const file = path.join(root, raw.replace(/^\.\//, '') || 'index.html');
      return fs.existsSync(file) ? new Response(fs.readFileSync(file), { status:200 }) : new Response('', { status:404 });
    }
  };
}

test('service worker compõe capturas e mundo 3D na ordem segura do HTML de produção', async () => {
  const context = createWorkerContext();

  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8'), context);
  const appShell = vm.runInContext('APP_SHELL', context);
  for (const asset of appShell.filter(item => item !== './')) {
    assert.equal(fs.existsSync(path.join(root, asset.replace(/^\.\//, ''))), true, `${asset} deve existir para o uso offline`);
  }
  const response = await context.enhanceHtmlResponse(new Response(fs.readFileSync(path.join(root, 'index.html'))));
  const html = await response.text();
  const modelIndex = html.indexOf('/* Compasso · Modelo puro da caixa de entrada de capturas */');
  const featureIndex = html.indexOf('/* Compasso · Capturas, caixa de entrada e destilacao de notas */');

  assert.ok(modelIndex >= 0, 'capture-model.js deve participar do HTML composto');
  assert.ok(featureIndex > modelIndex, 'o modelo deve carregar antes da feature');
  assert.match(html, /root\.CompassoCaptureModel = api/);
  const locationsIndex = html.indexOf('/* Compasso · Topologia original do Mundo do Compasso */');
  const sceneIndex = html.indexOf('/* Compasso · Cena Three.js procedural do Mundo do Compasso */');
  const worldIndex = html.indexOf('/* Compasso · Mundo 3D navegável com adaptação visual progressiva */');
  assert.ok(locationsIndex > featureIndex, 'topologia deve carregar depois das capturas existentes');
  assert.ok(sceneIndex > locationsIndex, 'cena deve carregar depois dos modelos do mundo');
  assert.ok(worldIndex > sceneIndex, 'feature deve carregar depois da cena');
  assert.equal(response.headers.get('x-compasso-world'), 'three-v1');
  const worker = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');
  assert.match(worker, /vendor\/three\/three\.module\.min\.js/);
  assert.match(worker, /vendor\/three\/three\.core\.min\.js/);
  assert.match(worker, /compasso-pages-v43/);
});

test('atualização parcial do mundo não impede o restante do Compasso de abrir', async () => {
  const context = createWorkerContext(new Set(['./world-navigation.js']));
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8'), context);
  const response = await context.enhanceHtmlResponse(new Response(fs.readFileSync(path.join(root, 'index.html'))));
  const html = await response.text();
  assert.equal(response.headers.get('x-compasso-world'), 'unavailable');
  assert.doesNotMatch(html, /Mundo 3D navegável com adaptação visual progressiva/);
  assert.match(html, /Consolidação da experiência e hierarquia visual/);
  assert.match(html, /Capturas, caixa de entrada e destilacao de notas/);
});
