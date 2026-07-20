/* Compasso · Diagnóstico resiliente de bootstrap */
(function(root){
  const entries=[],started=new Map();let current='document';
  const now=()=>new Date().toISOString();
  const clean=value=>String(value||'').replace(/[<>&]/g,'').slice(0,240);
  function record(type,details={}){const entry={type,module:details.module||current,message:String(details.message||'').slice(0,240),at:now()};entries.push(entry);if(entries.length>50)entries.shift();return entry}
  async function recover(button){
    if(button){button.disabled=true;button.textContent='Atualizando…'}
    try{
      if(root.navigator?.onLine!==false){
        const base=new URL('.',root.location.href).href,registrations=await root.navigator?.serviceWorker?.getRegistrations?.()||[];
        await Promise.all(registrations.filter(registration=>registration.scope===base).map(registration=>registration.unregister()));
        if(root.caches){const keys=await root.caches.keys();await Promise.all(keys.filter(key=>key.startsWith('compasso-pages-')).map(key=>root.caches.delete(key)))}
      }
    }finally{root.location?.reload()}
  }
  function show(entry){
    if(!root.document?.body||root.document.getElementById('compassoBootstrapAlert'))return;
    const box=root.document.createElement('aside');box.id='compassoBootstrapAlert';box.className='compasso-bootstrap-alert';box.setAttribute('role','alert');
    const title=root.document.createElement('strong'),context=root.document.createElement('span'),detail=root.document.createElement('small'),button=root.document.createElement('button');
    title.textContent='O Compasso encontrou uma falha ao iniciar.';context.textContent=`Módulo: ${clean(entry.module||'desconhecido')}`;detail.textContent=entry.message?`Detalhe: ${clean(entry.message)}`:'';button.type='button';button.textContent='Atualizar e tentar novamente';
    box.append(title,context,detail,button);button.addEventListener('click',()=>recover(button));root.document.body.prepend(box);
  }
  function start(module){current=module;started.set(module,Date.now())}
  function done(module){record('module:ready',{module,message:`${Math.max(0,Date.now()-(started.get(module)||Date.now()))}ms`});current='bootstrap'}
  root.addEventListener?.('error',event=>{const entry=record('error',{message:event.message});show(entry)});
  root.addEventListener?.('unhandledrejection',event=>{const entry=record('rejection',{message:event.reason?.message||event.reason});show(entry)});
  root.setTimeout?.(()=>{if(!root.CompassoFeatures?.installed)show(record('bootstrap:timeout',{message:'runtime não instalado'}))},5000);
  function fail(module,error){return show(record('error',{module,message:error?.message||error}))}
  root.CompassoBootstrapDiagnostic={start,done,fail,recover,record,report:()=>entries.map(item=>({...item})),get currentModule(){return current}};
})(globalThis);
