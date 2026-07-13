/* Compasso · Topologia original do Mundo do Compasso */
(function(root, factory) {
  const api = Object.freeze(factory());
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CompassoWorldLocations = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';

  const locations = Object.freeze([
    { id:'plaza', name:'Praça do Compasso', short:'Praça', view:'overview', icon:'◆', kind:'plaza', color:0x8b83d9, position:[0,0], description:'Visão geral, prioridades e equilíbrio da jornada.', level:'essential' },
    { id:'today', name:'Quadro de Missões', short:'Hoje', view:'today', icon:'✓', kind:'board', color:0xd9895b, position:[-4,1], description:'Ações que merecem atenção agora.', level:'essential' },
    { id:'flow', name:'Fonte da Direção', short:'Flow Matching', view:'today', icon:'≈', kind:'fountain', color:0x6aaea1, position:[1,4], description:'Escolha o próximo passo de acordo com seu contexto.', level:'essential', focus:'#flowPanel' },
    { id:'reading', name:'Biblioteca das Histórias', short:'Leituras', view:'reading', icon:'▤', kind:'library', color:0xb87555, position:[-8,-3], description:'Livros físicos e digitais e seu progresso.', level:'essential' },
    { id:'study', name:'Academia do Conhecimento', short:'Estudos', view:'study', icon:'△', kind:'academy', color:0x5f8f9d, position:[-3,-7], description:'Trilhas, cursos e práticas em andamento.', level:'essential' },
    { id:'goal', name:'Torre do Horizonte', short:'Metas', view:'goal', icon:'⌁', kind:'tower', color:0xc28f4a, position:[5,-7], description:'Destinos de longo prazo e frentes conectadas.', level:'essential' },
    { id:'notes', name:'Casa do Cartógrafo', short:'Atlas', view:'notes', icon:'⌑', kind:'atlas', color:0x6f75ad, position:[9,-2], description:'Notas, mapas, capturas e conhecimento acumulado.', level:'knowledge' },
    { id:'recall', name:'Campo da Memória', short:'Active Recall', view:'recall', icon:'?', kind:'training', color:0xb86675, position:[8,4], description:'Recuperação ativa e revisão espaçada.', level:'knowledge' },
    { id:'weakness', name:'Oficina de Reparos', short:'Pontos fracos', view:'weakness', icon:'✦', kind:'workshop', color:0xa97552, position:[4,8], description:'Erros transformados em correções e próximos passos.', level:'knowledge' },
    { id:'weekly', name:'Mirante da Reflexão', short:'Revisão semanal', view:'weekly', icon:'◒', kind:'lookout', color:0x667d68, position:[-2,8], description:'Evidências, aprendizados e ajustes da semana.', level:'essential' },
    { id:'planning', name:'Sala do Conselho', short:'Planejamento', view:'weekly', icon:'◇', kind:'council', color:0x836da8, position:[-7,6], description:'Resultados, prioridades, riscos e contingências.', level:'essential', action:'weekly-plan' },
    { id:'analytics', name:'Torre do Relógio', short:'Consistência', view:'analytics', icon:'◷', kind:'clock', color:0x5c7c86, position:[-10,2], description:'Tempo investido, ritmo e histórico de sessões.', level:'essential' },
    { id:'dictionary', name:'Jardim das Conexões', short:'Grafo e Dicionário', view:'dictionary', icon:'⌘', kind:'garden', color:0x5f956c, position:[0,-11], description:'Nós, caminhos e relações do conhecimento.', level:'advanced' },
    { id:'context', name:'Observatório do Contexto', short:'Busca contextual', view:'context', icon:'◎', kind:'observatory', color:0x6b77a3, position:[10,8], description:'Consulte seu acervo local com fontes rastreáveis.', level:'advanced' },
    { id:'settings', name:'Oficina do Compasso', short:'Configurações', view:null, icon:'⚙', kind:'settings', color:0x7f7466, position:[-11,-7], description:'Backup, Drive, exportações e preferências.', level:'advanced', action:'settings' }
  ]);

  function byId(id) { return locations.find(location => location.id === id) || locations[0]; }
  function clamp(value) { return Math.max(0, Math.min(100, Number(value) || 0)); }
  function average(items) { return items.length ? Math.round(items.reduce((sum, item) => sum + clamp(item.progress), 0) / items.length) : 0; }
  function isDue(card, now = Date.now()) { const due = new Date(card?.dueAt || 0).getTime(); return Number.isFinite(due) && due <= now; }
  function metrics(data = {}, now = Date.now()) {
    const completedSessions = (data.sessions || []).filter(item => item.status === 'completed').length + (data.deepWorkSessions || []).filter(item => item.state === 'completed').length;
    return Object.freeze({
      plaza: (data.reading || []).length + (data.study || []).length + (data.goal || []).length,
      today: (data.dailyPlans || []).flatMap(plan => plan.items || []).filter(item => !item.completedAt).length,
      flow: (data.dailyPlans || []).flatMap(plan => plan.items || []).filter(item => !item.completedAt).length,
      reading: average(data.reading || []),
      study: average(data.study || []),
      goal: average(data.goal || []),
      notes: (data.captures || []).filter(item => item.status === 'inbox' && !item.deletedAt).length,
      recall: (data.reviewItems || []).filter(card => isDue(card, now)).length,
      weakness: (data.errorNotebook || []).filter(item => item.status !== 'resolved' && !item.deletedAt).length,
      weekly: (data.weeklyReviews || []).length,
      planning: (data.weeklyPlans || []).filter(item => item.status === 'draft').length,
      analytics: completedSessions,
      dictionary: (data.notes || []).length,
      context: (data.notes || []).length + (data.evidence || []).length,
      settings: data._sync?.lastSyncAt ? 1 : 0
    });
  }

  function metricLabel(location, value) {
    if (['reading','study','goal'].includes(location.id)) return `${value}%`;
    if (location.id === 'notes') return value ? `${value} captura${value === 1 ? '' : 's'}` : 'Inbox limpa';
    if (location.id === 'recall') return value ? `${value} revisão${value === 1 ? '' : 'ões'}` : 'Em dia';
    if (location.id === 'analytics') return `${value} sessão${value === 1 ? '' : 'ões'}`;
    return value ? String(value) : '—';
  }

  return { locations, byId, metrics, metricLabel };
});
