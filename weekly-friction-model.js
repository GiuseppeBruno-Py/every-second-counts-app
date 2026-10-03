/* Compasso · Composição opcional da revisão de fricção */
(function(root,factory){
  const api=factory();root.CompassoWeeklyFrictionModel=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const REASONS=Object.freeze({large:'Parecia grande demais',unclear:'Primeiro passo pouco claro',benefit:'Benefício pouco claro',environment:'Ambiente facilitou distrações',discomfort:'Senti desconforto durante a execução',context:'Contexto/horário não funcionou',other:'Outro'});
  const clean=value=>typeof value==='string'?value.trim():'';
  function failure(field,message){const error=new TypeError(message);error.field=field;return error}
  function append(previous,addition,field){
    const before=clean(previous);
    const value=before.split('\n\n').includes(addition)?before:[before,addition].filter(Boolean).join('\n\n');
    if(value.length>600)throw failure(field,'O texto completo passa de 600 caracteres. Encurte o rascunho antes de aplicar; nenhum texto foi apagado.');
    return value;
  }
  function compose(input={}){
    const task=clean(input.task),reason=clean(input.reason),adjustment=clean(input.adjustment);
    if(!task||task.length>240)throw failure('task','Descreva uma tarefa ou tentativa em até 240 caracteres.');
    if(reason&&!Object.hasOwn(REASONS,reason))throw failure('reason','Escolha uma das dificuldades disponíveis.');
    if(!adjustment||adjustment.length>600)throw failure('adjustment','Descreva o ajuste que quer testar em até 600 caracteres.');
    const observation=`Tentativa: ${task}${reason?`\nDificuldade: ${REASONS[reason]}`:''}`;
    return {blockers:append(input.blockers,observation,'blockers'),decision:append(input.decision,`Ajuste a testar: ${adjustment}`,'decision'),adjustment};
  }
  function currentTarget(ref,outcomes=[]){
    if(!ref||!clean(ref.outcomeId)||!clean(ref.attemptId)||!clean(ref.attemptText))return null;
    const matches=(Array.isArray(outcomes)?outcomes:[]).filter(item=>item?.id===ref.outcomeId);
    if(matches.length!==1)return null;
    const item=matches[0];
    return item.status==='active'&&!item.metadata?.conflictOf&&item.nextAttempt?.id===ref.attemptId&&clean(item.nextAttempt.text)===clean(ref.attemptText)&&(!ref.updatedAt||item.nextAttempt.updatedAt===ref.updatedAt)?item:null;
  }
  return Object.freeze({REASONS,compose,currentTarget});
});
