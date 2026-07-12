(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.CompassoUxModel=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const modes=['essential','knowledge','advanced'];
  function mode(value){return modes.includes(value)?value:'essential'}
  function navLevel(label=''){const x=String(label).toLowerCase();if(/nota|atlas|recall|revisão espaçada|assunto fraco|erro|síntese|dicionário|grafo|contexto|rag|explica/.test(x))return'knowledge';if(/analytics|métrica|histórico global|drive|markdown|anki|obsidian|integra/.test(x))return'advanced';return'essential'}
  function visible(level,current){current=mode(current);return current==='advanced'||level==='essential'||(current==='knowledge'&&level==='knowledge')}
  function actionRole(dataset={}){if(dataset.note!==undefined)return'note';if(dataset.edit!==undefined)return'progress';if(dataset.complete!==undefined||dataset.reopen!==undefined)return'complete';if(dataset.startSession!==undefined||dataset.deep!==undefined)return'execute';return'more'}
  return{modes,mode,navLevel,visible,actionRole};
});
