importScripts('./app-manifest.js', './app-composition.js');

const MANIFEST = self.CompassoAppManifest;
const COMPOSITION = self.CompassoAppComposition;
const CACHE_NAME = MANIFEST.cacheName;
const APP_SHELL = MANIFEST.assets;

async function cachedText(cache, path) {
  const response = await cache.match(path, { ignoreSearch: true });
  return response ? response.text() : '';
}

async function cachedModules(cache) {
  return Promise.all(
    MANIFEST.modules.map(async (module) => ({
      file: module.file,
      source: await cachedText(cache, `./${module.file}`),
    })),
  );
}

async function composeFromCache(html, cache) {
  return COMPOSITION.composeDocument({
    html,
    manifest: MANIFEST,
    modules: await cachedModules(cache),
  });
}

async function validateInstalledPackage(cache) {
  const raw = await cachedText(cache, './index.html') || await cachedText(cache, './');
  if (!raw) return { ok: false, code: 'missing-index' };
  return composeFromCache(raw, cache);
}

self.addEventListener('install', (event) => event.waitUntil((async () => {
  const cache = await caches.open(CACHE_NAME);
  try {
    await cache.addAll(APP_SHELL);
    const validation = await validateInstalledPackage(cache);
    if (!validation.ok) throw new Error(`composition:${validation.code}`);
    await self.skipWaiting();
  } catch (error) {
    await caches.delete(CACHE_NAME);
    throw error;
  }
})()));

self.addEventListener('activate', (event) => event.waitUntil((async () => {
  const keys = await caches.keys();
  await Promise.all(
    keys
      .filter((key) => MANIFEST.isOwnedCacheName(key) && key !== CACHE_NAME)
      .map((key) => caches.delete(key)),
  );
  await self.clients.claim();
})()));

function responseHeaders(response, result) {
  const headers = new Headers(response.headers);
  headers.set('content-type', 'text/html; charset=utf-8');
  headers.set('x-compasso-storage', 'indexeddb-v1');
  headers.set('x-compasso-composition', result.ok ? 'complete' : 'failed');
  if (result.ok) {
    headers.set('x-compasso-generation', CACHE_NAME);
    headers.delete('x-compasso-composition-error');
  } else {
    headers.delete('x-compasso-generation');
    headers.set('x-compasso-composition-error', result.code || 'unknown');
  }
  return headers;
}

async function enhanceHtmlResponse(response) {
  if (!response) return response;
  const html = await response.text();
  const cache = await caches.open(CACHE_NAME);
  const result = await composeFromCache(html, cache);
  return new Response(result.ok ? result.html : html, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders(response, result),
  });
}

async function appShellResponse(request) {
  const cache = await caches.open(CACHE_NAME);
  let raw = await cache.match('./index.html', { ignoreSearch: true }) || await cache.match('./', { ignoreSearch: true });
  if (!raw) {
    try {
      raw = await fetch(request);
    } catch {
      return Response.error();
    }
  }
  return enhanceHtmlResponse(raw);
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const sameOrigin = url.origin === self.location.origin;
  if (!sameOrigin) return;
  const documentRequest = event.request.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html');
  if (documentRequest) {
    event.respondWith(appShellResponse(event.request));
    return;
  }
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(event.request, { ignoreSearch: true });
    if (cached) return cached;
    try {
      return await fetch(event.request);
    } catch {
      return Response.error();
    }
  })());
});

self.addEventListener('message', (event) => {
  const message = event.data;
  const port = event.ports?.[0];
  if (!port || message?.type !== 'compasso:generation:query') return;
  port.postMessage({
    type: 'compasso:generation:response',
    requestId: message.requestId,
    generation: CACHE_NAME,
  });
});

self.addEventListener('notificationclick', (event) => {
  const target = event.notification?.data?.url || './';
  event.notification?.close();
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
    const visible = windows.find((client) => 'focus' in client);
    if (visible) {
      visible.navigate?.(target);
      return visible.focus();
    }
    return clients.openWindow ? clients.openWindow(target) : null;
  }));
});

if (typeof module === 'object' && module.exports) {
  module.exports = { cachedText, cachedModules, composeFromCache, validateInstalledPackage, enhanceHtmlResponse, appShellResponse };
}
