/* Compasso · Modelo declarativo da arquitetura de informação */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.CompassoInformationArchitectureModel=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const modes=Object.freeze(['essential','knowledge','advanced']);
  const rank=Object.freeze({essential:0,knowledge:1,advanced:2});
  const areas=Object.freeze([
    {id:'today',label:'Hoje',icon:'calendar',level:'essential',order:10,route:'today'},
    {id:'fronts',label:'Frentes',icon:'briefcase',level:'essential',order:20,route:'fronts'},
    {id:'journal',label:'Journal',icon:'note',level:'essential',order:30,route:'journal'},
    {id:'review',label:'Revisão',icon:'spark',level:'essential',order:40,route:'review'},
    {id:'more',label:'Mais',icon:'more',level:'essential',order:50,route:'more'}
  ]);
  const views=Object.freeze([
    {id:'reading',area:'fronts',label:'Leituras',description:'Livros físicos e digitais em progresso.',icon:'book',level:'essential',order:20,route:'reading'},
    {id:'study',area:'fronts',label:'Estudos',description:'Cursos, certificações e prática deliberada.',icon:'study',level:'essential',order:30,route:'study'},
    {id:'goal',area:'fronts',label:'Metas',description:'Resultados conectados à execução.',icon:'target',level:'essential',order:40,route:'goal'},
    {id:'weekly',area:'review',label:'Revisão semanal',description:'Feche a semana com evidências e decisões.',icon:'calendar',level:'essential',order:10,route:'weekly'},
    {id:'outcomes',area:'review',label:'Resultados',description:'Compare o planejado com o realizado.',icon:'target',level:'essential',order:20,route:'outcomes'},
    {id:'analytics',area:'review',label:'Consistência',description:'Ritmo, sessões e histórico de execução.',icon:'spark',level:'essential',order:30,route:'analytics'},
    {id:'recall',area:'review',label:'Active Recall',description:'Recupere antes de consultar.',icon:'brain',level:'knowledge',order:40,route:'recall'},
    {id:'weakness',area:'review',label:'Caderno de erros',description:'Transforme dificuldades em próximas ações.',icon:'target',level:'knowledge',order:50,route:'weakness'},
    {id:'notes',area:'more',label:'Notas e Atlas',description:'Conhecimento destilado e conectado.',icon:'note',level:'knowledge',order:10,route:'notes'},
    {id:'dictionary',area:'more',label:'Relações e grafo',description:'Explore conexões entre ideias.',icon:'link',level:'advanced',order:20,route:'dictionary'},
    {id:'context',area:'more',label:'IA contextual',description:'Consulte seus próprios dados com fontes.',icon:'brain',level:'advanced',order:30,route:'context'}
  ]);
  const aliases=Object.freeze({core:'essential',simple:'essential',learning:'knowledge',expert:'advanced'});
  function mode(value){const normalized=aliases[value]||value;return modes.includes(normalized)?normalized:'essential'}
  function area(id){return areas.find(item=>item.id===id)||null}
  function view(id){return views.find(item=>item.id===id)||null}
  function areaFor(route){if(route==='overview')return'today';return area(route)?.id||view(route)?.area||'today'}
  function visible(level,current){return rank[level]<=rank[mode(current)]}
  function viewsFor(areaId,current,{includeHidden=false}={}){return views.filter(item=>item.area===areaId&&(includeHidden||visible(item.level,current))).sort((a,b)=>a.order-b.order)}
  function resolve(route,{fallback='today'}={}){if(route==='overview')return'today';return area(route)?.route||view(route)?.route||fallback}
  function migratePreference(value){return mode(value)}
  return Object.freeze({modes,areas,views,mode,area,view,areaFor,visible,viewsFor,resolve,migratePreference});
});
