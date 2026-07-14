/* Compasso · Diagnóstico resiliente de bootstrap */
(function(root){
  const entries=[],started=new Map();let current='document';
  const now=()=>new Date().toISOString();
  function record(type,details={}){const entry={type,module:details.module||current,message:String(details.message||'').slice(0,240),at:now()};entries.push(entry);if(entries.length>50)entries.shift();return entry}
  function show(entry){
    if(!root.document?.body||root.document.getElementById('compassoBootstrapAlert'))return;
    const box=root.document.createElement('aside');box.id='compassoBootstrapAlert';box.className='compasso-bootstrap-alert';box.setAttribute('role','alert');
    box.innerHTML=`<strong>O Compasso encontrou uma falha ao iniciar.</strong><span>Módulo: ${String(entry.module||'desconhecido').replace(/[<>&]/g,'')}</span><button type="button">Tentar novamente</button>`;
    box.querySelector('button').addEventListener('click',()=>root.location?.reload());root.document.body.prepend(box);
  }
  function start(module){current=module;started.set(module,Date.now())}
  function done(module){record('module:ready',{module,message:`${Math.max(0,Date.now()-(started.get(module)||Date.now()))}ms`});current='bootstrap'}
  root.addEventListener?.('error',event=>{const entry=record('error',{message:event.message});show(entry)});
  root.addEventListener?.('unhandledrejection',event=>{const entry=record('rejection',{message:event.reason?.message||event.reason});show(entry)});
  root.setTimeout?.(()=>{if(!root.CompassoFeatures?.installed)show(record('bootstrap:timeout',{message:'runtime não instalado'}))},5000);
  root.CompassoBootstrapDiagnostic={start,done,record,report:()=>entries.map(item=>({...item})),get currentModule(){return current}};
})(globalThis);
