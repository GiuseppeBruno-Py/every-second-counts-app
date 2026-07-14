/* Compasso · Fundação central de estado, schema e merge */
(function(root){
  const manifest=root.CompassoAppManifest||(typeof require==='function'?require('./app-manifest.js'):null);
  const catalog=new Map((manifest?.collections||[]).map(item=>[item.name,item]));
  const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
  const iso=value=>String(value||'');
  function fingerprint(value){
    if(Array.isArray(value))return`[${value.map(fingerprint).join(',')}]`;
    if(value&&typeof value==='object')return`{${Object.keys(value).sort().map(key=>`${JSON.stringify(key)}:${fingerprint(value[key])}`).join(',')}}`;
    return JSON.stringify(value);
  }
  function stableSuffix(value){let hash=2166136261;for(const char of JSON.stringify(value)){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619)}return(hash>>>0).toString(36)}
  function migrate(input){
    const data=input&&typeof input==='object'&&!Array.isArray(input)?input:{};
    for(const spec of catalog.values()){
      if(data[spec.name]==null)continue;
      if(spec.type==='array'&&!Array.isArray(data[spec.name]))data[spec.name]=[];
      else if(spec.type==='keyed-map'&&(typeof data[spec.name]!=='object'||Array.isArray(data[spec.name])))data[spec.name]={};
    }
    data._schema=data._schema&&typeof data._schema==='object'?data._schema:{};
    data._schema.version=2;
    data._schema.migratedAt=data._schema.migratedAt||new Date(0).toISOString();
    return data;
  }
  function newest(left,right){return iso(right?.updatedAt||right?.updated)>iso(left?.updatedAt||left?.updated)?right:left}
  function merge(localInput,remoteInput,options={}){
    const local=migrate(clone(localInput)||{}),remote=migrate(clone(remoteInput)||{}),merged={...local};
    const now=options.now||new Date().toISOString(),conflicts=[];
    const tombstones={...(local._sync?.tombstones||{}),...(remote._sync?.tombstones||{})};
    for(const [key,value] of Object.entries(local._sync?.tombstones||{}))if(iso(value)>iso(tombstones[key]))tombstones[key]=value;
    for(const spec of catalog.values()){
      if(spec.type==='array'){
        const byId=new Map();
        for(const record of [...(remote[spec.name]||[]),...(local[spec.name]||[])]){
          if(!record||typeof record!=='object')continue;
          const id=String(record[spec.identity]||'');if(!id)continue;
          const current=byId.get(id);
          if(current&&iso(current.updatedAt)===iso(record.updatedAt)&&fingerprint(current)!==fingerprint(record)){
            const conflictId=`${id}-conflict-${stableSuffix(record)}`;
            byId.set(conflictId,{...record,[spec.identity]:conflictId,metadata:{...(record.metadata||{}),conflictOf:id}});
            conflicts.push({collection:spec.name,key:id,preservedAs:conflictId,detectedAt:now});
          }else if(!current||iso(record.updatedAt)>=iso(current.updatedAt))byId.set(id,record);
        }
        merged[spec.name]=[...byId.values()].filter(record=>{const deleted=tombstones[`${spec.name}:${record[spec.identity]}`];return!deleted||iso(record.updatedAt)>iso(deleted)});
      }else{
        const result={};
        for(const key of new Set([...Object.keys(remote[spec.name]||{}),...Object.keys(local[spec.name]||{})])){
          const left=local[spec.name]?.[key],right=remote[spec.name]?.[key];
          if(left==null){result[key]=right;continue}if(right==null){result[key]=left;continue}
          if(iso(left.updatedAt)===iso(right.updatedAt)&&fingerprint(left)!==fingerprint(right))conflicts.push({collection:spec.name,key,local:clone(left),remote:clone(right),detectedAt:now});
          result[key]=newest(left,right);
        }
        merged[spec.name]=result;
      }
    }
    const latest=iso(remote._sync?.updatedAt)>iso(local._sync?.updatedAt)?remote:local;
    for(const [key,value] of Object.entries(latest))if(!catalog.has(key)&&key!=='_sync'&&key!=='_schema')merged[key]=value;
    merged._sync={...(local._sync||{}),...(remote._sync||{}),schemaVersion:2,updatedAt:now,tombstones,conflicts:[...(local._sync?.conflicts||[]),...(remote._sync?.conflicts||[]),...conflicts]};
    return migrate(merged);
  }
  const api={catalog:()=>[...catalog.values()].map(clone),collection:n=>catalog.get(n),collectionNames:type=>[...catalog.values()].filter(x=>!type||x.type===type).map(x=>x.name),migrate,merge};
  root.CompassoStateFoundation=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(globalThis);
if(typeof state!=='undefined'&&state?.data)state.data=globalThis.CompassoStateFoundation.migrate(state.data);
