/* Compasso · Manifesto declarativo da aplicação */
(function(root){
  const modules = [
    ['state-foundation.js','/* Compasso · Fundação central de estado'],
    ['feature-runtime.js','/* Compasso · Runtime central de features e eventos'],
    ['app-services.js','/* Compasso · Serviços de domínio'],
    ['design-system-model.js','/* Compasso · Contrato declarativo do design system'],
    ['today-feature.js','/* Compasso · Hoje e próximas ações'],
    ['session-timer-model.js','CompassoSessionTimerModel'],
    ['sessions-feature.js','/* Compasso · Sessões de leitura e estudo'],
    ['goal-links-feature.js','/* Compasso · Metas conectadas a leituras e estudos'],
    ['contingency-model.js','CompassoContingencyModel'],
    ['contingency-feature.js','/* Compasso · Contingências Se X então Y e versão mínima'],
    ['deep-work-model.js','CompassoDeepWorkModel'],
    ['deep-work-feature.js','/* Compasso · Modo Deep Work para sessões focadas'],
    ['session-companion-feature.js','/* Compasso · Companheiro compacto de sessão e Deep Work'],
    ['ritual-model.js','CompassoRitualModel'],
    ['ritual-feature.js','/* Compasso · Rituais e arquitetura de ação reutilizáveis'],
    ['energy-model.js','CompassoEnergyModel'],
    ['energy-feature.js','/* Compasso · Energia percebida e mapa pessoal por horario'],
    ['flow-model.js','CompassoFlowModel'],
    ['flow-feature.js','/* Compasso · Flow Matching deterministico'],
    ['evidence-feature.js','/* Compasso · Evidências de sessão'],
    ['recall-feature.js','/* Compasso · Active Recall a partir de evidências e notas'],
    ['weakness-feature.js','/* Compasso · Assuntos fracos e caderno de erros'],
    ['outcomes-feature.js','/* Compasso · Planejado vs. realizado e síntese orientada de livros'],
    ['drive-sync-feature.js','/* Compasso · OAuth Google Drive e base de sincronização'],
    ['drive-reconcile-feature.js','/* Compasso · Conciliacao visual do Google Drive'],
    ['weekly-review-feature.js','/* Compasso · Revisão semanal guiada por evidências'],
    ['weekly-plan-model.js','CompassoWeeklyPlanModel'],
    ['weekly-plan-feature.js','/* Compasso · Planejamento semanal guiado por resultados'],
    ['analytics-feature.js','/* Compasso · Métricas de consistência e histórico global de sessões'],
    ['dictionary-relations-feature.js','/* Compasso · Dicionário visual de relações'],
    ['knowledge-graph-feature.js','/* Compasso · Grafo interativo de conhecimento'],
    ['knowledge-graph-lifecycle.js','/* Compasso · Ciclo de vida do grafo interativo'],
    ['markdown-vault-feature.js','/* Compasso · Importação e exportação do vault em Markdown'],
    ['markdown-vault-hardening.js','/* Compasso · Compatibilidade do vault Markdown'],
    ['anki-obsidian-feature.js','/* Compasso · Exportacao Anki e refinamento Obsidian'],
    ['context-rag-feature.js','/* Compasso · RAG local sobre dados do usuario'],
    ['context-learning-feature.js','/* Compasso · Perguntas contextuais e avaliacao de explicacoes'],
    ['capture-model.js','/* Compasso · Modelo puro da caixa de entrada de capturas */'],
    ['capture-feature.js','/* Compasso · Capturas, caixa de entrada e destilacao de notas'],
    ['journal-model.js','/* Compasso · Modelo puro de Journaling */'],
    ['journal-feature.js','/* Compasso · Journaling integrado'],
    ['ux-consolidation-model.js','CompassoUxModel'],
    ['ux-consolidation-feature.js','/* Compasso · Consolidação da experiência e hierarquia visual'],
    ['information-architecture-model.js','CompassoInformationArchitectureModel'],
    ['information-architecture-feature.js','/* Compasso · Navegação central por áreas'],
    ['design-system-feature.js','/* Compasso · Comportamento acessível do design system']
  ];
  const browserJourneyModules=new Set([
    'state-foundation.js','feature-runtime.js','app-services.js','design-system-model.js','today-feature.js','session-timer-model.js','sessions-feature.js','goal-links-feature.js',
    'contingency-model.js','contingency-feature.js','deep-work-model.js','deep-work-feature.js','session-companion-feature.js',
    'ritual-model.js','ritual-feature.js','evidence-feature.js','recall-feature.js','weakness-feature.js','outcomes-feature.js',
    'weekly-review-feature.js','analytics-feature.js','capture-model.js','capture-feature.js','journal-model.js','journal-feature.js',
    'ux-consolidation-model.js','ux-consolidation-feature.js','information-architecture-model.js','information-architecture-feature.js','design-system-feature.js'
  ]);
  const moduleEntries = modules.map(([file,marker],order)=>({file,marker,order,required:order<3,browserJourney:browserJourneyModules.has(file)}));

  const arrayCollections = [
    'reading','study','goal','focus','folders','notes','captures','sessions','deepWorkSessions','dailyPlans',
    'energyCheckins','flowEvents','evidence','reviewItems','weeklyReviews','weeklyPlans',
    'bookSyntheses','errorEntries','errorNotebook','ritualTemplates','explanationEvaluations',
    'journalEntries','journalCollections','journalFutureItems','journalMonthlyPlans','journalConflicts'
  ];
  const collections = [
    ...arrayCollections.map(name=>({name,type:'array',identity:'id',merge:'record-timestamp',sync:true})),
    {name:'dailyJournals',type:'keyed-map',identity:'date',merge:'entry-timestamp',sync:true}
  ];
  const assets = [
    './','./index.html','./app-manifest.js','./bootstrap-diagnostics.js','./app-ui.css','./design-system.css','./service-worker.js','./storage.js',
    ...moduleEntries.map(item=>`./${item.file}`),
    './manifest.webmanifest','./compasso-icon.svg','./compasso.ico','./compasso-icon-192.png','./compasso-icon-512.png'
  ];
  const api = Object.freeze({
    version:1,
    cacheName:'compasso-pages-v52',
    bootstrapScript:'bootstrap-diagnostics.js',
    modules:Object.freeze(moduleEntries),
    collections:Object.freeze(collections),
    assets:Object.freeze([...new Set(assets)]),
    contracts:Object.freeze({routes:'compasso.route.v1',events:'compasso.event.v1',commands:'compasso.command.v1',services:'compasso.service.v1',state:'compasso.state.v2'})
  });
  root.CompassoAppManifest=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof self!=='undefined'?self:globalThis);
