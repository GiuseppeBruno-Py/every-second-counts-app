/* Compasso · Runtime central de features e eventos */
(function(root){
  const features=new Map(),listeners=new Map(),actions=[],commands=new Map(),selectors=new Map(),routes=new Map(),services=new Map();
  const errors=[],metrics={renders:{count:0,totalMs:0,lastMs:0,maxMs:0,slow:0}};let installed=false,sequence=0;
  const clock=()=>root.performance?.now?.()||Date.now();
  function report(error,context){const entry={context,message:String(error?.message||error).slice(0,240),at:new Date().toISOString()};errors.push(entry);if(errors.length>50)errors.shift();try{emit('runtime:error',entry)}catch{}return entry}
  function safe(context,handler,args=[]){try{return handler(...args)}catch(error){report(error,context);return undefined}}
  function register(name,hooks={}){if(!name)throw Error('Feature name required');if(features.has(name))throw Error(`Feature already registered: ${name}`);features.set(name,{name,order:Number(hooks.order)||100,dependsOn:hooks.dependsOn||[],...hooks});return()=>features.delete(name)}
  function on(event,handler){if(!listeners.has(event))listeners.set(event,new Set());listeners.get(event).add(handler);return()=>listeners.get(event)?.delete(handler)}
  function emit(event,payload){for(const handler of [...(listeners.get(event)||[])])safe(`event:${event}`,handler,[payload])}
  function action(selector,handler,options={}){if(!selector||typeof handler!=='function')throw Error('Action selector and handler required');const entry={id:++sequence,selector,handler,order:Number(options.order)||100};actions.push(entry);actions.sort((a,b)=>a.order-b.order);return()=>{const i=actions.indexOf(entry);if(i>=0)actions.splice(i,1)}}
  function command(name,handler){if(commands.has(name))throw Error(`Command already registered: ${name}`);commands.set(name,handler);return()=>commands.delete(name)}
  function execute(name,payload){const handler=commands.get(name);if(!handler){report(Error(`Unknown command: ${name}`),`command:${name}`);return undefined}return safe(`command:${name}`,handler,[payload])}
  function selector(name,reader){if(arguments.length>1){selectors.set(name,reader);return()=>selectors.delete(name)}const value=selectors.get(name);return typeof value==='function'?safe(`selector:${name}`,value):value}
  function route(name,handler){if(arguments.length>1){routes.set(name,handler);return()=>routes.delete(name)}const target=routes.get(name);return target?safe(`route:${name}`,target):undefined}
  function service(name,value){if(arguments.length>1){if(services.has(name))throw Error(`Service already registered: ${name}`);services.set(name,value);return()=>services.delete(name)}return services.get(name)}
  function hooks(name){return Array.from(features.values()).filter(x=>typeof x[name]==='function').sort((a,b)=>a.order-b.order)}
  function runHooks(name,args=[]){for(const feature of hooks(name))safe(`feature:${feature.name}:${name}`,feature[name],args)}
  function install(){if(installed)return;installed=true;const baseRenderAll=renderAll,baseRenderGrid=renderGrid;
    renderGrid=function(domain){safe('core:renderGrid',baseRenderGrid,[domain]);runHooks('afterGrid',[domain]);emit('grid:rendered',{domain})};
    renderAll=function(){const start=clock();emit('render:before',{});safe('core:renderAll',baseRenderAll);runHooks('afterRender');const elapsed=Math.max(0,clock()-start),m=metrics.renders;m.count++;m.totalMs+=elapsed;m.lastMs=elapsed;m.maxMs=Math.max(m.maxMs,elapsed);if(elapsed>50)m.slow++;emit('render:after',{durationMs:elapsed,slow:elapsed>50})};
    document.addEventListener('click',event=>{for(const entry of actions){const target=event.target?.closest?.(entry.selector);if(target){safe(`action:${entry.selector}`,entry.handler,[{event,target}]);if(event.cancelBubble)break}}});
    runHooks('install');emit('runtime:installed',{features:Array.from(features.keys())});
  }
  function health(){return{installed,features:[...features.keys()],commands:[...commands.keys()],services:[...services.keys()],errors:errors.map(x=>({...x})),renders:{...metrics.renders,averageMs:metrics.renders.count?metrics.renders.totalMs/metrics.renders.count:0}}}
  root.CompassoFeatures={register,on,emit,action,command,execute,selector,route,service,install,health,list:()=>Array.from(features.keys()),get installed(){return installed}};
})(globalThis);
