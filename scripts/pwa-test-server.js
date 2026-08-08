const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '.test-dist');
const port = Number(process.env.PWA_TEST_PORT || 4174);
let mode = 'current';

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
};

function reply(response, status, body, contentType = 'text/plain; charset=utf-8') {
  response.writeHead(status, {
    'content-type': contentType,
    'cache-control': 'no-store, max-age=0',
    'service-worker-allowed': '/',
  });
  response.end(body);
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  if (url.pathname === '/__compasso_test__/generation') {
    if (request.method === 'GET') return reply(response, 200, JSON.stringify({ mode }), 'application/json');
    if (request.method !== 'POST') return reply(response, 405, 'method not allowed');
    let body = '';
    request.on('data', (chunk) => { body += chunk; });
    request.on('end', () => {
      const next = String(body || '').trim();
      if (!['previous', 'current', 'fail-worker'].includes(next)) return reply(response, 400, 'invalid mode');
      mode = next;
      reply(response, 200, JSON.stringify({ mode }), 'application/json');
    });
    return;
  }

  if (mode === 'fail-worker' && url.pathname === '/service-worker.js') {
    return reply(response, 503, 'test worker failure');
  }
  const selected = mode === 'previous' ? 'previous' : 'current';
  const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
  const base = path.join(root, `pwa-${selected}`);
  const file = path.resolve(base, relative);
  if (!file.startsWith(`${base}${path.sep}`) && file !== path.join(base, 'index.html')) return reply(response, 403, 'forbidden');
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return reply(response, 404, 'not found');
  const type = types[path.extname(file).toLowerCase()] || 'application/octet-stream';
  response.writeHead(200, {
    'content-type': type,
    'cache-control': 'no-store, max-age=0',
    'service-worker-allowed': '/',
  });
  fs.createReadStream(file).pipe(response);
});

server.listen(port, '127.0.0.1', () => {
  process.stdout.write(`Compasso PWA lifecycle server listening on ${port}\n`);
});
