(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.CompassoRitualModel=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const clean=(v,n=240)=>typeof v==='string'?v.trim().slice(0,n):'';
  const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
  const hasOwn=(value,key)=>Object.prototype.hasOwnProperty.call(value||{},key);
  const TYPES=['study','programming','reading','writing','planning'];
  function items(v){return(Array.isArray(v)?v:[]).map((x,i)=>({id:clean(x?.id,80)||`i${i}`,text:clean(x?.text||x),required:x?.required!==false,order:Number.isFinite(Number(x?.order))?Number(x.order):i})).filter(x=>x.text).sort((a,b)=>a.order-b.order).map((x,i)=>({...x,order:i}));}
  function encodingCheckpointCommand(value){
    if(value===true)return true;
    if(value===false||value==null||(typeof value==='string'&&!value.trim()))return undefined;
    const error=new Error('encoding-checkpoint-invalid');error.code='encoding-checkpoint-invalid';throw error;
  }
  function normalize(v,now=new Date().toISOString()){
    if(!v||typeof v!=='object')return null;
    const normalized={id:clean(v.id,90),version:Math.max(1,Math.round(Number(v.version)||1)),name:clean(v.name,100)||'Ritual sem nome',context:clean(v.context,160),actionType:TYPES.includes(v.actionType)?v.actionType:'study',preparation:items(v.preparation),resources:items(v.resources),cues:items(v.cues),distractions:items(v.distractions),closing:items(v.closing),archived:v.archived===true,isDefault:v.isDefault===true,createdAt:v.createdAt||now,updatedAt:v.updatedAt||now};
    if(v.encodingCheckpoint===true)normalized.encodingCheckpoint=true;
    return normalized;
  }
  function create(v,now=new Date().toISOString()){
    if(!v||typeof v!=='object')return null;
    const candidate={...v};
    if(hasOwn(v,'encodingCheckpoint')){
      const marker=encodingCheckpointCommand(v.encodingCheckpoint);
      if(marker===true)candidate.encodingCheckpoint=true;else delete candidate.encodingCheckpoint;
    }
    return normalize(candidate,now);
  }
  function snapshot(v,options={}){
    const x=normalize(v);if(!x)return null;
    const result={ritualId:x.id,version:x.version,name:x.name,context:x.context,actionType:x.actionType,preparation:x.preparation,resources:x.resources,cues:x.cues,distractions:x.distractions,closing:x.closing};
    if(options.includeEncodingCheckpoint===true&&x.encodingCheckpoint===true)result.encodingCheckpoint=true;
    return clone(result);
  }
  function normalizeSnapshot(v){
    if(!v||typeof v!=='object'||Array.isArray(v))return null;
    const result=clone(v),validIdentity=Boolean(clean(result.ritualId,90))&&Number.isFinite(Number(result.version))&&Number(result.version)>=1;
    if(result.encodingCheckpoint!==true||!validIdentity)delete result.encodingCheckpoint;
    return result;
  }
  function isEncodingCheckpointSnapshot(v){return normalizeSnapshot(v)?.encodingCheckpoint===true;}
  function duplicate(v,id,now=new Date().toISOString()){const x=normalize(v,now);return{...x,id,name:`${x.name} · cópia`,version:1,isDefault:false,archived:false,createdAt:now,updatedAt:now};}
  function update(v,patch,now=new Date().toISOString()){
    const old=normalize(v,now),candidate={...old,...patch,id:old.id,version:old.version+1,createdAt:old.createdAt,updatedAt:now};
    if(hasOwn(patch,'encodingCheckpoint')){
      const marker=encodingCheckpointCommand(patch.encodingCheckpoint);
      if(marker===true)candidate.encodingCheckpoint=true;else delete candidate.encodingCheckpoint;
    }
    return normalize(candidate,now);
  }
  function suggest(templates,item){const type=item?.ritualType||({reading:'reading',study:'study',goal:'planning'})[item?.domain]||null;const ritual=(Array.isArray(templates)?templates:[]).map(normalize).find(x=>x&&!x.archived&&x.actionType===type);return ritual?{ritual,reason:`Sugerido porque o tipo da ação é ${type}. Aplicação opcional.`}:null;}
  function defaults(now='2026-01-01T00:00:00.000Z'){const data={study:['Estudo','Abrir material|Definir pergunta central','Livro ou notas','Sentar no local de estudo','Silenciar notificações','Registrar próxima revisão'],programming:['Programação','Abrir projeto|Definir entrega verificável','Editor e documentação','Executar ambiente local','Fechar abas não relacionadas','Registrar commit ou próximo passo'],reading:['Leitura','Separar livro|Definir trecho','Livro e marcador','Sentar no local de leitura','Afastar notificações','Anotar ideia principal'],writing:['Escrita','Abrir rascunho|Definir seção','Notas de referência','Escrever a primeira frase','Fechar fontes não essenciais','Registrar ponto de retomada'],planning:['Planejamento','Abrir revisão|Listar decisões','Agenda e dados da semana','Começar pelo resultado desejado','Fechar entradas paralelas','Confirmar próximas ações']};return Object.entries(data).map(([type,x])=>normalize({id:`ritual-default-${type}`,name:x[0],actionType:type,context:`Template inicial editável de ${x[0].toLowerCase()}`,preparation:x[1].split('|'),resources:[x[2]],cues:[x[3]],distractions:[x[4]],closing:[x[5]],isDefault:true,createdAt:now,updatedAt:now},now));}
  return{TYPES,items,normalize,create,snapshot,normalizeSnapshot,isEncodingCheckpointSnapshot,duplicate,update,suggest,defaults};
});
