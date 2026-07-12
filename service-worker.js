const CACHE_NAME = 'compasso-pages-v6';
const APP_SHELL = [
  './',
  './index.html',
  './storage.js',
  './sessions-feature.js',
  './evidence-feature.js',
  './manifest.webmanifest',
  './compasso-icon.svg',
  './compasso.ico',
  './compasso-icon-192.png',
  './compasso-icon-512.png'
];

const STORAGE_KEY = 'compasso.app.v1';
const SESSIONS_MARKER = '/* Compasso · Sessões de leitura e estudo';
const EVIDENCE_MARKER = '/* Compasso · Evidências de sessão';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function integrateIndexedDb(html) {
  if (html.includes('src="./storage.js"') || !html.includes(`const STORAGE_KEY = '${STORAGE_KEY}'`)) {
    return html;
  }

  let integrated = html.replace(
    `  <script>\n    const STORAGE_KEY = '${STORAGE_KEY}';`,
    `  <script src="./storage.js"></script>\n  <script type="module">\n    await window.CompassoStorage.ready('${STORAGE_KEY}');\n    const STORAGE_KEY = '${STORAGE_KEY}';`
  );

  integrated = integrated.replace(
    'const saved = localStorage.getItem(STORAGE_KEY);',
    'const saved = window.CompassoStorage.getSerialized(STORAGE_KEY);'
  );

  integrated = integrated.replaceAll(
    'localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));',
    'window.CompassoStorage.save(STORAGE_KEY, state.data);'
  );

  return integrated;
}

function integrateFeature(html, featureCode, marker) {
  if (!featureCode || html.includes(marker)) return html;
  const bootstrapPoint = '    renderAll();\n    const requestedView';
  if (!html.includes(bootstrapPoint)) return html;
  return html.replace(
    bootstrapPoint,
    `    ${featureCode}\n\n    renderAll();\n    const requestedView`
  );
}

async function readCachedText(path) {
  const cached = await caches.match(path, { ignoreSearch: true });
  if (cached) return cached.text();
  try {
    const response = await fetch(path);
    if (!response.ok) return '';
    const copy = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(path, copy));
    return response.text();
  } catch {
    return '';
  }
}

async function enhanceHtmlResponse(response) {
  if (!response) return response;

  const [html, sessionsCode, evidenceCode] = await Promise.all([
    response.text(),
    readCachedText('./sessions-feature.js'),
    readCachedText('./evidence-feature.js')
  ]);
  const headers = new Headers(response.headers);
  headers.set('content-type', 'text/html; charset=utf-8');
  headers.set('x-compasso-storage', 'indexeddb-v1');
  headers.set('x-compasso-sessions', 'v1');
  headers.set('x-compasso-evidence', 'v1');

  const withStorage = integrateIndexedDb(html);
  const withSessions = integrateFeature(withStorage, sessionsCode, SESSIONS_MARKER);
  const enhanced = integrateFeature(withSessions, evidenceCode, EVIDENCE_MARKER);

  return new Response(enhanced, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

async function appShellResponse(request) {
  const cached = await caches.match(request, { ignoreSearch: true })
    || await caches.match('./index.html');

  if (cached) return enhanceHtmlResponse(cached);

  try {
    const network = await fetch(request);
    if (network.ok) {
      const copy = network.clone();
      caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
    }
    return enhanceHtmlResponse(network);
  } catch {
    return Response.error();
  }
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isDocument = event.request.mode === 'navigate'
    || (isSameOrigin && (url.pathname.endsWith('/') || url.pathname.endsWith('/index.html')));

  if (isDocument) {
    event.respondWith(appShellResponse(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        if (response.ok && isSameOrigin) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => Response.error());
    })
  );
});
