/* Compasso · Serviços de domínio */
(function(root){
  const runtime=root.CompassoFeatures;if(!runtime)return;
  function openView(view){document.querySelector(`[data-view="${view}"]`)?.click();return view}
  const services={
    register:{open:()=>openView('capture'),capture(payload){runtime.emit('register:capture',payload);return runtime.execute('register.capture',payload)}},
    execute:{open:payload=>runtime.execute('execute.open',payload),quick:payload=>runtime.execute('execute.quick',payload),deep:payload=>runtime.execute('execute.deep',payload)},
    review:{openWeekly:()=>openView('review'),complete:payload=>runtime.execute('review.complete',payload)},
    knowledge:{openAtlas:()=>openView('notes'),open:payload=>runtime.execute('knowledge.open',payload)},
    learning:{openRecall:()=>openView('recall'),exportAnki:payload=>runtime.execute('learning.exportAnki',payload)}
  };
  for(const [name,service] of Object.entries(services))runtime.service(name,service);
  root.CompassoServices=Object.freeze(services);
})(globalThis);
