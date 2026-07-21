const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const root=path.resolve(__dirname,'..');

function storageContext({quota=false,initial=null}={}){
  const values=new Map(initial?[['compasso.app.v1',initial]]:[]),removed=[];
  const localStorage={
    getItem:key=>values.get(key)||null,
    setItem(key,value){if(quota){const error=new Error('quota');error.name='QuotaExceededError';throw error;}values.set(key,String(value));},
    removeItem(key){removed.push(key);values.delete(key);}
  };
  const context={
    window:{dispatchEvent(){},localStorage},localStorage,
    CustomEvent:function(type,options){this.type=type;this.detail=options?.detail;},
    console:{warn(){},error(){}},Promise,Map,Date,JSON,Error
  };
  context.globalThis=context;vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root,'storage.js'),'utf8'),context);
  return{api:context.window.CompassoStorage,removed,values};
}

test('quota cheia não escapa do armazenamento nem perde o estado em memória',async()=>{
  const {api,removed}=storageContext({quota:true});
  await api.ready('compasso.app.v1');
  const state={notes:[{content:'x'.repeat(300000)}]};
  await assert.doesNotReject(()=>api.save('compasso.app.v1',state));
  assert.deepEqual(api.load('compasso.app.v1'),state);
  assert.ok(removed.includes('compasso.app.v1'));
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
  assert.match(html,/globalThis\.renderAll\s*=\s*renderAll/);
});
