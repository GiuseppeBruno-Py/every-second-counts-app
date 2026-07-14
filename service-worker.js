importScripts('./app-manifest.js');
const MANIFEST=self.CompassoAppManifest;
const CACHE_NAME=MANIFEST.cacheName;
const APP_SHELL=MANIFEST.assets;
const STORAGE_KEY='compasso.app.v1';

self.addEventListener('install',event=>event.waitUntil(
  caches.open(CACHE_NAME).then(cache=>Promise.all(APP_SHELL.map(async path=>{
    try{const response=await fetch(path);if(response.ok)await cache.put(path,response)}catch{/* módulo opcional */}
  }))).then(()=>self.skipWaiting())
));
self.addEventListener('activate',event=>event.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim())
));

function integrateIndexedDb(html){
  if(html.includes('src="./storage.js"')||!html.includes(`const STORAGE_KEY = '${STORAGE_KEY}'`))return html;
  let integrated=html.replace(
    `  <script>\n    const STORAGE_KEY = '${STORAGE_KEY}';`,
    `  <script src="./storage.js"></script>\n  <script type="module">\n    await window.CompassoStorage.ready('${STORAGE_KEY}');\n    const STORAGE_KEY = '${STORAGE_KEY}';`
  );
  integrated=integrated.replace('const saved = localStorage.getItem(STORAGE_KEY);','const saved = window.CompassoStorage.getSerialized(STORAGE_KEY);');
  integrated=integrated.replaceAll('localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));','window.CompassoStorage.save(STORAGE_KEY, state.data);');
  return integrated;
}
function integrateSupportAssets(html){
  let result=html;
  if(!result.includes('src="./bootstrap-diagnostics.js"'))result=result.replace('</head>','  <link rel="stylesheet" href="./app-ui.css">\n  <script src="./app-manifest.js"></script>\n  <script src="./bootstrap-diagnostics.js"></script>\n</head>');
  return result;
}
function integrateFeature(html,featureCode,module){
  if(html.includes(module.marker))return html;
  if(!featureCode&&!module.required)return html;
  const point='    renderAll();\n    const requestedView';if(!html.includes(point))return html;
  const diagnostic=`globalThis.CompassoBootstrapDiagnostic?.start('${module.file}');`;
  const finished=`globalThis.CompassoBootstrapDiagnostic?.done('${module.file}');`;
  const code=featureCode?`${diagnostic}\n${featureCode}\n${finished}`:`globalThis.CompassoBootstrapDiagnostic?.record('module:missing',{module:'${module.file}',message:'arquivo indisponível'});`;
  return html.replace(point,()=>`    ${code}\n\n    renderAll();\n    const requestedView`);
}
async function readCachedText(path,module){
  const cached=await caches.match(path,{ignoreSearch:true});if(cached)return cached.text();
  // Módulos opcionais entram no cache durante a instalação. Não prolongamos uma
  // navegação offline tentando descobrir arquivos que não pertencem ao pacote.
  if(!module?.required)return'';
  try{const response=await fetch(path);if(!response.ok)return'';const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(path,copy));return response.text()}catch{return''}
}
async function enhanceHtmlResponse(response){
  if(!response)return response;
  const [html,...codes]=await Promise.all([response.text(),...MANIFEST.modules.map(module=>readCachedText(`./${module.file}`,module))]);
  const headers=new Headers(response.headers);headers.set('content-type','text/html; charset=utf-8');headers.set('x-compasso-storage','indexeddb-v1');headers.set('x-compasso-composition',`manifest-v${MANIFEST.version}`);
  let enhanced=integrateSupportAssets(integrateIndexedDb(html));
  MANIFEST.modules.forEach((module,index)=>{enhanced=integrateFeature(enhanced,codes[index],module);const name=module.file.replace(/\.(js|css)$/,'').replace(/-(feature|model)$/,'').replace(/[^a-z0-9]+/g,'-');headers.set(`x-compasso-${name}`,'v1')});
  return new Response(enhanced,{status:response.status,statusText:response.statusText,headers});
}
async function appShellResponse(request){
  const cached=await caches.match(request,{ignoreSearch:true})||await caches.match('./index.html');if(cached)return enhanceHtmlResponse(cached);
  try{const network=await fetch(request);if(network.ok){const copy=network.clone();caches.open(CACHE_NAME).then(cache=>cache.put('./index.html',copy))}return enhanceHtmlResponse(network)}catch{return Response.error()}
}
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;const url=new URL(event.request.url),same=url.origin===self.location.origin;
  if(!same)return;
  const documentRequest=event.request.mode==='navigate'||(same&&(url.pathname.endsWith('/')||url.pathname.endsWith('/index.html')));
  if(documentRequest){event.respondWith(appShellResponse(event.request));return}
  event.respondWith(caches.match(event.request,{ignoreSearch:true}).then(cached=>cached||fetch(event.request).then(response=>{if(response.ok&&same){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy))}return response}).catch(()=>Response.error())));
});
self.addEventListener('notificationclick',event=>{
  const target=event.notification?.data?.url||'./';event.notification?.close();event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(windows=>{const visible=windows.find(client=>'focus'in client);if(visible){visible.navigate?.(target);return visible.focus()}return clients.openWindow?clients.openWindow(target):null}));
});
