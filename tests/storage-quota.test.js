const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {webcrypto}=require('node:crypto');

const root=path.resolve(__dirname,'..');
const stateKey='compasso.app.v1';

function createFakeIndexedDB({initial=null,writePlan=[]}={}){
  const stateRecords=new Map();
  const metaRecords=new Map();
  const writes=[];
  let writeIndex=0;

  if(initial!==null){
    stateRecords.set(stateKey,{
      key:stateKey,
      serialized:typeof initial==='string'?initial:JSON.stringify(initial),
      schemaVersion:1,
      updatedAt:'2026-08-18T00:00:00.000Z'
    });
  }

  const storeNames=['appState','sessions','evidence','reviewItems','weeklyReviews','attachments','settings','meta'];
  storeNames.contains=name=>storeNames.includes(name);

  function collection(name){return name==='meta'?metaRecords:stateRecords;}

  const db={
    objectStoreNames:storeNames,
    close(){},
    transaction(names,mode){
      const list=Array.isArray(names)?names:[names];
      const pending=[];
      const transaction={
        error:null,
        oncomplete:null,
        onerror:null,
        onabort:null,
        objectStore(name){
          assert.ok(list.includes(name));
          return{
            get(key){
              const request={result:null,error:null,onsuccess:null,onerror:null};
              queueMicrotask(()=>{
                request.result=collection(name).get(key)||undefined;
                request.onsuccess?.();
              });
              return request;
            },
            put(value){pending.push({type:'put',name,value:structuredClone(value)});},
            delete(key){pending.push({type:'delete',name,key});}
          };
        }
      };

      if(mode==='readwrite'){
        const plan=writePlan[writeIndex]||{};
        const currentIndex=writeIndex++;
        setTimeout(()=>{
          writes.push({index:currentIndex,failed:Boolean(plan.fail),pending:structuredClone(pending)});
          if(plan.fail){
            transaction.error=new Error(`idb-write-${currentIndex}`);
            transaction.onerror?.();
            return;
          }
          for(const operation of pending){
            const target=collection(operation.name);
            if(operation.type==='put') target.set(operation.value.key,operation.value);
            else target.delete(operation.key);
          }
          transaction.oncomplete?.();
        },plan.delay||0);
      }

      return transaction;
    }
  };

  return{
    indexedDB:{
      open(){
        const request={result:db,error:null,onupgradeneeded:null,onsuccess:null,onerror:null,onblocked:null};
        queueMicrotask(()=>request.onsuccess?.());
        return request;
      }
    },
    stateRecords,
    writes
  };
}

function storageContext({
  indexedDB=true,
  idbInitial=null,
  idbWritePlan=[],
  localInitial=null,
  failLocalSet=false,
  failLocalGet=false,
  failLocalRemove=false
}={}){
  const values=new Map(localInitial!==null?[[stateKey,typeof localInitial==='string'?localInitial:JSON.stringify(localInitial)]]:[]);
  const localWrites=[];
  const removed=[];
  const controls={failLocalSet,failLocalGet,failLocalRemove};
  const localStorage={
    getItem(key){if(controls.failLocalGet)throw new Error('local-get');return values.has(key)?values.get(key):null;},
    setItem(key,value){
      localWrites.push({key,value:String(value)});
      if(controls.failLocalSet)throw new Error('local-set');
      values.set(key,String(value));
    },
    removeItem(key){
      removed.push(key);
      if(controls.failLocalRemove)throw new Error('local-remove');
      values.delete(key);
    }
  };
  const fake=indexedDB?createFakeIndexedDB({initial:idbInitial,writePlan:idbWritePlan}):null;
  const window={dispatchEvent(){},localStorage};
  if(fake)window.indexedDB=fake.indexedDB;
  const context={
    window,localStorage,indexedDB:fake?.indexedDB,
    CustomEvent:function(type,options){this.type=type;this.detail=options?.detail;},
    console:{warn(){},error(){}},Promise,Map,Date,JSON,Error,
    setTimeout,clearTimeout,queueMicrotask,structuredClone
  };
  context.globalThis=context;vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root,'storage.js'),'utf8'),context);
  return{api:context.window.CompassoStorage,controls,localWrites,removed,values,idb:fake};
}

function driveSyncContext(activeData){
  let fetchCalls=0;
  const document={
    hidden:false,
    getElementById(){return null;},
    querySelector(){return null;},
    createElement(){return{dataset:{},style:{},addEventListener(){}};},
    head:{appendChild(){}}
  };
  const context={
    document,state:{data:structuredClone(activeData)},STORAGE_KEY:stateKey,
    saveData:()=>true,showToast(){},escapeHtml:value=>String(value),
    crypto:webcrypto,structuredClone,JSON,Map,Date,Promise,Error,
    setInterval:()=>1,clearInterval(){},setTimeout,clearTimeout,
    fetch:async()=>{fetchCalls+=1;throw new Error('network-not-allowed');},
    console:{warn(){},error(){}},Blob,FormData,URLSearchParams
  };
  context.window=context;context.globalThis=context;vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root,'drive-sync-feature.js'),'utf8'),context);
  return{api:context.CompassoDriveSync,state:context.state,fetchCalls:()=>fetchCalls};
}

test('IndexedDB confirmado retorna true mesmo quando o espelho local falha',async()=>{
  const state={notes:[{id:'n1',content:'durável'}]};
  const {api,controls,idb,values,removed}=storageContext();
  await api.ready(stateKey);
  controls.failLocalSet=true;

  assert.equal(await api.save(stateKey,state),true);
  assert.equal(idb.stateRecords.get(stateKey).serialized,JSON.stringify(state));
  assert.equal(values.has(stateKey),false);
  assert.ok(removed.includes(stateKey));
});

test('falha do IndexedDB com fallback exato retorna true inclusive para estado grande',async()=>{
  const state={notes:[{id:'n1',content:'x'.repeat(300000)}]};
  const {api,values}=storageContext({indexedDB:false});
  await api.ready(stateKey);

  assert.equal(await api.save(stateKey,state),true);
  assert.equal(values.get(stateKey),JSON.stringify(state));
  assert.deepEqual(api.load(stateKey),state);
});

test('falha dos dois backends retorna false, preserva fallback anterior e retém candidato só em memória',async()=>{
  const previous={notes:[{content:'anterior'}]};
  const candidate={notes:[{content:'x'.repeat(300000)}]};
  const {api,controls,values}=storageContext({indexedDB:false,localInitial:previous});
  await api.ready(stateKey);
  controls.failLocalSet=true;

  assert.equal(await api.save(stateKey,candidate),false);
  assert.equal(values.get(stateKey),JSON.stringify(previous));
  assert.deepEqual(api.load(stateKey),candidate);
});

test('falha de serialização retorna false sem tentar backend nem alterar memória',async()=>{
  const previous={notes:[{content:'anterior'}]};
  const {api,idb,localWrites}=storageContext({idbInitial:previous,localInitial:previous});
  await api.ready(stateKey);
  idb.writes.length=0;
  localWrites.length=0;
  const cyclic={};cyclic.self=cyclic;

  assert.equal(await api.save(stateKey,cyclic),false);
  assert.equal(idb.writes.length,0);
  assert.equal(localWrites.length,0);
  assert.deepEqual(api.load(stateKey),previous);
});

test('valor sem representação JSON retorna false sem tocar memória ou backends',async()=>{
  const previous={notes:[{content:'anterior'}]};
  const {api,idb,localWrites}=storageContext({idbInitial:previous,localInitial:previous});
  await api.ready(stateKey);
  idb.writes.length=0;
  localWrites.length=0;

  assert.equal(await api.save(stateKey,undefined),false);
  assert.equal(await api.replace(stateKey,undefined,async()=>{}),false);
  assert.equal(idb.writes.length,0);
  assert.equal(localWrites.length,0);
  assert.deepEqual(api.load(stateKey),previous);
});

test('preparação de sync clona o candidato sem mutar estado ativo, baseline ou rede',()=>{
  const active={reading:[],study:[],goal:[],notes:[{id:'active-note',title:'Ativa'}],unknown:{keep:'active'}};
  const {api,state,fetchCalls}=driveSyncContext(active);
  const activeBefore=JSON.parse(JSON.stringify(state.data));
  const candidate={reading:[],study:[],goal:[],notes:[{id:'candidate-note',title:'Importada'}],unknown:{keep:'candidate'}};
  const candidateBefore=structuredClone(candidate);

  const prepared=api.prepareLocalState(candidate);
  assert.deepEqual(candidate,candidateBefore);
  assert.deepEqual(JSON.parse(JSON.stringify(state.data)),activeBefore);
  assert.notEqual(prepared.data,candidate);
  assert.deepEqual(prepared.data.unknown,{keep:'candidate'});
  assert.equal(prepared.baseline instanceof Map,true);
  assert.equal(fetchCalls(),0);

  api.activateLocalState(prepared);
  assert.deepEqual(JSON.parse(JSON.stringify(state.data)),activeBefore);
  assert.equal(fetchCalls(),0);
  assert.throws(()=>api.activateLocalState({data:prepared.data,baseline:{}}),/preparado inválido/);
});

test('a fila inclui falha primária e fallback antes de iniciar a gravação seguinte',async()=>{
  const first={value:'primeiro'};
  const second={value:'segundo'};
  const {api,idb,values,localWrites}=storageContext({
    idbWritePlan:[{fail:true,delay:30},{fail:true,delay:0}]
  });

  const saveA=api.save(stateKey,first);
  const saveB=api.save(stateKey,second);
  assert.deepEqual(await Promise.all([saveA,saveB]),[true,true]);
  assert.equal(values.get(stateKey),JSON.stringify(second));
  assert.deepEqual(localWrites.map(entry=>JSON.parse(entry.value).value),['primeiro','segundo']);
  assert.deepEqual(idb.writes.map(entry=>entry.index),[0,1]);
});

test('replace drena gravação anterior, bloqueia gravações tardias e ativa só após persistir',async()=>{
  const previous={value:'anterior'};
  const queued={value:'na-fila'};
  const candidate={value:'restaurado'};
  const {api,idb}=storageContext({
    idbInitial:previous,
    localInitial:previous,
    idbWritePlan:[{delay:30},{}]
  });
  await api.ready(stateKey);
  const queuedSave=api.save(stateKey,queued);
  let activatedRecord=null;
  const replacement=api.replace(stateKey,candidate,async value=>{
    activatedRecord=idb.stateRecords.get(stateKey).serialized;
    assert.deepEqual(value,candidate);
  });

  assert.equal(await api.save(stateKey,{value:'tardio'}),false);
  assert.equal(await queuedSave,true);
  assert.equal(await replacement,true);
  assert.equal(activatedRecord,JSON.stringify(candidate));
  assert.deepEqual(api.load(stateKey),candidate);
});

test('replace sem backend durável não ativa e restaura checkpoint exato',async()=>{
  const previous={canary:'anterior'};
  const candidate={canary:'importado'};
  const {api,controls,idb,values}=storageContext({
    idbInitial:previous,
    localInitial:previous,
    idbWritePlan:[{fail:true}]
  });
  await api.ready(stateKey);
  controls.failLocalSet=true;
  let activated=false;

  assert.equal(await api.replace(stateKey,candidate,async()=>{activated=true;}),false);
  assert.equal(activated,false);
  assert.deepEqual(api.load(stateKey),previous);
  assert.equal(idb.stateRecords.get(stateKey).serialized,JSON.stringify(previous));
  assert.equal(values.get(stateKey),JSON.stringify(previous));
});

test('falha de ativação após commit compensa memória, IndexedDB e localStorage',async()=>{
  const previous={canary:'anterior'};
  const candidate={canary:'importado'};
  const {api,idb,values}=storageContext({idbInitial:previous,localInitial:previous});
  await api.ready(stateKey);

  assert.equal(await api.replace(stateKey,candidate,async()=>{throw new Error('render');}),false);
  assert.deepEqual(api.load(stateKey),previous);
  assert.equal(idb.stateRecords.get(stateKey).serialized,JSON.stringify(previous));
  assert.equal(values.get(stateKey),JSON.stringify(previous));
});

test('falha de compensação lança storage-rollback-failed e mantém a barreira',async()=>{
  const previous={canary:'anterior'};
  const candidate={canary:'importado'};
  const {api}=storageContext({
    idbInitial:previous,
    localInitial:previous,
    idbWritePlan:[{}, {fail:true}]
  });
  await api.ready(stateKey);

  await assert.rejects(
    api.replace(stateKey,candidate,async()=>{throw new Error('render');}),
    error=>error?.code==='storage-rollback-failed'
  );
  assert.equal(await api.save(stateKey,{value:'bloqueado'}),false);
  assert.equal(await api.replace(stateKey,previous,async()=>{}),false);
});

test('somente um replace pode possuir a chave por vez',async()=>{
  const previous={value:'anterior'};
  const candidate={value:'primeiro'};
  const {api}=storageContext({idbInitial:previous,localInitial:previous});
  await api.ready(stateKey);
  let release;
  const gate=new Promise(resolve=>{release=resolve;});
  const first=api.replace(stateKey,candidate,async()=>gate);

  await new Promise(resolve=>setTimeout(resolve,10));
  assert.equal(await api.replace(stateKey,{value:'segundo'},async()=>{}),false);
  release();
  assert.equal(await first,true);
});

test('replace usa localStorage como fallback durável quando IndexedDB não existe',async()=>{
  const previous={value:'anterior'};
  const candidate={value:'restaurado'};
  const {api,values}=storageContext({indexedDB:false,localInitial:previous});
  await api.ready(stateKey);
  let activated=false;

  assert.equal(await api.replace(stateKey,candidate,async()=>{activated=true;}),true);
  assert.equal(activated,true);
  assert.equal(values.get(stateKey),JSON.stringify(candidate));
});

test('documento usa IndexedDB diretamente e não grava o estado principal por fora da camada',()=>{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const deep=fs.readFileSync(path.join(root,'deep-work-feature.js'),'utf8');
  const ritual=fs.readFileSync(path.join(root,'ritual-feature.js'),'utf8');
  assert.match(html,/<script src="\.\/storage\.js"><\/script>\s*<script type="module">\s*await window\.CompassoStorage\.ready/);
  assert.doesNotMatch([html,deep,ritual].join('\n'),/localStorage\.setItem\(STORAGE_KEY/);
});

test('carregamento modular preserva os hooks públicos usados pelas extensões',()=>{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.match(html,/globalThis\.state\s*=\s*state/);
  assert.match(html,/Object\.defineProperty\(globalThis, 'renderAll'/);
  assert.match(html,/get:\s*\(\)\s*=>\s*renderAll/);
});
