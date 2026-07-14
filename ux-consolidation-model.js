(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.CompassoUxModel=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const modes=['essential','knowledge','advanced'];
  function mode(value){return modes.includes(value)?value:'essential'}
  const navigationLevels=Object.freeze({'Hoje':'essential','Visão geral':'essential','Leituras':'essential','Estudos':'essential','Metas':'essential','Revisão semanal':'essential','Resultados':'essential','Consistência':'essential','Notas':'knowledge','Atlas pessoal':'knowledge','Active Recall':'knowledge','Pontos fracos':'knowledge','Dicionário':'advanced','Relações':'advanced','IA contextual':'advanced','Analytics':'advanced'});
  function navLevel(id=''){return navigationLevels[String(id)]||'essential'}
  function visible(level,current){current=mode(current);return current==='advanced'||level==='essential'||(current==='knowledge'&&level==='knowledge')}
  function actionRole(dataset={}){if(dataset.note!==undefined)return'note';if(dataset.edit!==undefined)return'progress';if(dataset.complete!==undefined||dataset.reopen!==undefined)return'complete';if(dataset.startSession!==undefined||dataset.deep!==undefined)return'execute';return'more'}
  return{modes,mode,navLevel,visible,actionRole};
});
