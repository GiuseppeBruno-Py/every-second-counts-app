/* Compasso · Runtime central de features e eventos */
(function(root){
  const features=new Map(),listeners=new Map(),actions=[];let installed=false,sequence=0;
  function register(name,hooks={}){if(!name)throw Error('Feature name required');features.set(name,{name,order:Number(hooks.order)||100,...hooks});return()=>features.delete(name)}
  function on(event,handler){if(!listeners.has(event))listeners.set(event,new Set());listeners.get(event).add(handler);return()=>listeners.get(event)?.delete(handler)}
  function emit(event,payload){for(const handler of listeners.get(event)||[])handler(payload)}
  function action(selector,handler,options={}){const entry={id:++sequence,selector,handler,order:Number(options.order)||100};actions.push(entry);actions.sort((a,b)=>a.order-b.order);return()=>{const i=actions.indexOf(entry);if(i>=0)actions.splice(i,1)}}
  function hooks(name){return Array.from(features.values()).filter(x=>typeof x[name]==='function').sort((a,b)=>a.order-b.order)}
  function install(){if(installed)return;installed=true;const baseRenderAll=renderAll,baseRenderGrid=renderGrid;
    renderGrid=function(domain){baseRenderGrid(domain);for(const feature of hooks('afterGrid'))feature.afterGrid(domain);emit('grid:rendered',{domain})};
    renderAll=function(){emit('render:before',{});baseRenderAll();for(const feature of hooks('afterRender'))feature.afterRender();emit('render:after',{})};
    document.addEventListener('click',event=>{for(const entry of actions){const target=event.target.closest(entry.selector);if(target){entry.handler({event,target});if(event.cancelBubble)break}}});emit('runtime:installed',{features:Array.from(features.keys())});
  }
  root.CompassoFeatures={register,on,emit,action,install,list:()=>Array.from(features.keys()),get installed(){return installed}};
})(globalThis);
