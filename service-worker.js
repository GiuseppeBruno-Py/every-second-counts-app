const CACHE_NAME = 'compasso-pages-v34';
const APP_SHELL = [
  './',
  './index.html',
  './storage.js',
  './today-feature.js',
  './sessions-feature.js',
  './contingency-model.js',
  './contingency-feature.js',
  './deep-work-model.js',
  './deep-work-feature.js',
  './ritual-model.js',
  './ritual-feature.js',
  './ux-consolidation-model.js',
  './ux-consolidation-feature.js',
  './energy-model.js',
  './energy-feature.js',
  './flow-model.js',
  './flow-feature.js',
  './evidence-feature.js',
  './recall-feature.js',
  './weakness-feature.js',
  './outcomes-feature.js',
  './drive-sync-feature.js',
  './drive-reconcile-feature.js',
  './weekly-review-feature.js',
  './weekly-plan-model.js',
  './weekly-plan-feature.js',
  './analytics-feature.js',
  './dictionary-relations-feature.js',
  './knowledge-graph-feature.js',
  './knowledge-graph-lifecycle.js',
  './markdown-vault-feature.js',
  './markdown-vault-hardening.js',
  './anki-obsidian-feature.js',
  './manifest.webmanifest',
  './compasso-icon.svg',
  './compasso.ico',
  './compasso-icon-192.png',
  './compasso-icon-512.png'
];

const STORAGE_KEY = 'compasso.app.v1';
const SESSIONS_MARKER = '/* Compasso · Sessões de leitura e estudo';
const CONTINGENCY_MODEL_MARKER = 'CompassoContingencyModel';
const CONTINGENCY_MARKER = '/* Compasso · Contingências Se X então Y e versão mínima';
const DEEP_WORK_MODEL_MARKER = 'CompassoDeepWorkModel';
const DEEP_WORK_MARKER = '/* Compasso · Modo Deep Work para sessões focadas';
const RITUAL_MODEL_MARKER = 'CompassoRitualModel';
const RITUAL_MARKER = '/* Compasso · Rituais e arquitetura de ação reutilizáveis';
const ENERGY_MODEL_MARKER = 'CompassoEnergyModel';
const ENERGY_MARKER = '/* Compasso · Energia percebida e mapa pessoal por horario';
const FLOW_MODEL_MARKER = 'CompassoFlowModel';
const FLOW_MARKER = '/* Compasso · Flow Matching deterministico';
const TODAY_MARKER = '/* Compasso · Hoje e próximas ações';
const EVIDENCE_MARKER = '/* Compasso · Evidências de sessão';
const RECALL_MARKER = '/* Compasso · Active Recall a partir de evidências e notas';
const WEAKNESS_MARKER = '/* Compasso · Assuntos fracos e caderno de erros';
const OUTCOMES_MARKER = '/* Compasso · Planejado vs. realizado e síntese orientada de livros';
const DRIVE_SYNC_MARKER = '/* Compasso · OAuth Google Drive e base de sincronização';
const DRIVE_RECONCILE_MARKER = '/* Compasso · Conciliacao visual do Google Drive';
const WEEKLY_REVIEW_MARKER = '/* Compasso · Revisão semanal guiada por evidências';
const WEEKLY_PLAN_MODEL_MARKER = 'CompassoWeeklyPlanModel';
const WEEKLY_PLAN_MARKER = '/* Compasso · Planejamento semanal guiado por resultados';
const ANALYTICS_MARKER = '/* Compasso · Métricas de consistência e histórico global de sessões';
const DICTIONARY_MARKER = '/* Compasso · Dicionário visual de relações';
const KNOWLEDGE_GRAPH_MARKER = '/* Compasso · Grafo interativo de conhecimento';
const KNOWLEDGE_GRAPH_LIFECYCLE_MARKER = '/* Compasso · Ciclo de vida do grafo interativo';
const MARKDOWN_VAULT_MARKER = '/* Compasso · Importação e exportação do vault em Markdown';
const MARKDOWN_VAULT_HARDENING_MARKER = '/* Compasso · Compatibilidade do vault Markdown';
const ANKI_OBSIDIAN_MARKER = '/* Compasso · Exportacao Anki e refinamento Obsidian';
const UX_MODEL_MARKER = 'CompassoUxModel';
const UX_MARKER = '/* Compasso · Consolidação da experiência e hierarquia visual';
const CONTEXT_RAG_MARKER = '/* Compasso · RAG local sobre dados do usuario';
const CONTEXT_LEARNING_MARKER = '/* Compasso · Perguntas contextuais e avaliacao de explicacoes';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function integrateIndexedDb(html) {
  if (html.includes('src="./storage.js"') || !html.includes(`const STORAGE_KEY = '${STORAGE_KEY}'`)) {
    return html;
  }

  let integrated = html.replace(
    `  <script>\n    const STORAGE_KEY = '${STORAGE_KEY}';`,
    `  <script src="./storage.js"></script>\n  <script type="module">\n    await window.CompassoStorage.ready('${STORAGE_KEY}');\n    const STORAGE_KEY = '${STORAGE_KEY}';`
  );

  integrated = integrated.replace(
    'const saved = localStorage.getItem(STORAGE_KEY);',
    'const saved = window.CompassoStorage.getSerialized(STORAGE_KEY);'
  );

  integrated = integrated.replaceAll(
    'localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));',
    'window.CompassoStorage.save(STORAGE_KEY, state.data);'
  );

  return integrated;
}

function integrateFeature(html, featureCode, marker) {
  if (!featureCode || html.includes(marker)) return html;
  const bootstrapPoint = '    renderAll();\n    const requestedView';
  if (!html.includes(bootstrapPoint)) return html;
  return html.replace(
    bootstrapPoint,
    `    ${featureCode}\n\n    renderAll();\n    const requestedView`
  );
}

async function readCachedText(path) {
  const cached = await caches.match(path, { ignoreSearch: true });
  if (cached) return cached.text();
  try {
    const response = await fetch(path);
    if (!response.ok) return '';
    const copy = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(path, copy));
    return response.text();
  } catch {
    return '';
  }
}

async function enhanceHtmlResponse(response) {
  if (!response) return response;

  const [html, todayCode, sessionsCode, contingencyModelCode, contingencyCode, deepWorkModelCode, deepWorkCode, ritualModelCode, ritualCode, energyModelCode, energyCode, flowModelCode, flowCode, evidenceCode, recallCode, weaknessCode, outcomesCode, driveSyncCode, driveReconcileCode, weeklyReviewCode, weeklyPlanModelCode, weeklyPlanCode, analyticsCode, dictionaryCode, knowledgeGraphCode, knowledgeGraphLifecycleCode, markdownVaultCode, markdownVaultHardeningCode, ankiObsidianCode, uxModelCode, uxCode] = await Promise.all([
    response.text(),
    readCachedText('./today-feature.js'),
    readCachedText('./sessions-feature.js'),
    readCachedText('./contingency-model.js'),
    readCachedText('./contingency-feature.js'),
    readCachedText('./deep-work-model.js'),
    readCachedText('./deep-work-feature.js'),
    readCachedText('./ritual-model.js'),
    readCachedText('./ritual-feature.js'),
    readCachedText('./energy-model.js'),
    readCachedText('./energy-feature.js'),
    readCachedText('./flow-model.js'),
    readCachedText('./flow-feature.js'),
    readCachedText('./evidence-feature.js'),
    readCachedText('./recall-feature.js'),
    readCachedText('./weakness-feature.js'),
    readCachedText('./outcomes-feature.js'),
    readCachedText('./drive-sync-feature.js'),
    readCachedText('./drive-reconcile-feature.js'),
    readCachedText('./weekly-review-feature.js'),
    readCachedText('./weekly-plan-model.js'),
    readCachedText('./weekly-plan-feature.js'),
    readCachedText('./analytics-feature.js'),
    readCachedText('./dictionary-relations-feature.js'),
    readCachedText('./knowledge-graph-feature.js'),
    readCachedText('./knowledge-graph-lifecycle.js'),
    readCachedText('./markdown-vault-feature.js'),
    readCachedText('./markdown-vault-hardening.js'),
    readCachedText('./anki-obsidian-feature.js'),
    readCachedText('./ux-consolidation-model.js'),
    readCachedText('./ux-consolidation-feature.js')
  ]);
  const headers = new Headers(response.headers);
  headers.set('content-type', 'text/html; charset=utf-8');
  headers.set('x-compasso-storage', 'indexeddb-v1');
  headers.set('x-compasso-today', 'v1');
  headers.set('x-compasso-sessions', 'v1');
  headers.set('x-compasso-contingencies', 'v1');
  headers.set('x-compasso-deep-work', 'v1');
  headers.set('x-compasso-rituals', 'v1');
  headers.set('x-compasso-energy', 'v1');
  headers.set('x-compasso-flow-matching', 'v1');
  headers.set('x-compasso-evidence', 'v1');
  headers.set('x-compasso-recall', 'v1');
  headers.set('x-compasso-weakness', 'v1');
  headers.set('x-compasso-outcomes', 'v1');
  headers.set('x-compasso-drive-sync', 'drive-merge-v2');
  headers.set('x-compasso-drive-reconcile', 'v1');
  headers.set('x-compasso-weekly-review', 'v1');
  headers.set('x-compasso-weekly-plan', 'v1');
  headers.set('x-compasso-analytics', 'v1');
  headers.set('x-compasso-dictionary', 'v1');
  headers.set('x-compasso-knowledge-graph', 'v1');
  headers.set('x-compasso-markdown-vault', 'v1');
  headers.set('x-compasso-anki-obsidian', 'v1');
  headers.set('x-compasso-ux-consolidation', 'v1');

  const withStorage = integrateIndexedDb(html);
  const withToday = integrateFeature(withStorage, todayCode, TODAY_MARKER);
  const withSessions = integrateFeature(withToday, sessionsCode, SESSIONS_MARKER);
  const withContingencyModel = integrateFeature(withSessions, contingencyModelCode, CONTINGENCY_MODEL_MARKER);
  const withContingencies = integrateFeature(withContingencyModel, contingencyCode, CONTINGENCY_MARKER);
  const withDeepWorkModel = integrateFeature(withContingencies, deepWorkModelCode, DEEP_WORK_MODEL_MARKER);
  const withDeepWork = integrateFeature(withDeepWorkModel, deepWorkCode, DEEP_WORK_MARKER);
  const withRitualModel = integrateFeature(withDeepWork, ritualModelCode, RITUAL_MODEL_MARKER);
  const withRitual = integrateFeature(withRitualModel, ritualCode, RITUAL_MARKER);
  const withEnergyModel = integrateFeature(withRitual, energyModelCode, ENERGY_MODEL_MARKER);
  const withEnergy = integrateFeature(withEnergyModel, energyCode, ENERGY_MARKER);
  const withFlowModel = integrateFeature(withEnergy, flowModelCode, FLOW_MODEL_MARKER);
  const withFlow = integrateFeature(withFlowModel, flowCode, FLOW_MARKER);
  const withEvidence = integrateFeature(withFlow, evidenceCode, EVIDENCE_MARKER);
  const withRecall = integrateFeature(withEvidence, recallCode, RECALL_MARKER);
  const withWeakness = integrateFeature(withRecall, weaknessCode, WEAKNESS_MARKER);
  const withOutcomes = integrateFeature(withWeakness, outcomesCode, OUTCOMES_MARKER);
  const withDriveSync = integrateFeature(withOutcomes, driveSyncCode, DRIVE_SYNC_MARKER);
  const withDriveReconcile = integrateFeature(withDriveSync, driveReconcileCode, DRIVE_RECONCILE_MARKER);
  const withWeeklyReview = integrateFeature(withDriveReconcile, weeklyReviewCode, WEEKLY_REVIEW_MARKER);
  const withWeeklyPlanModel = integrateFeature(withWeeklyReview, weeklyPlanModelCode, WEEKLY_PLAN_MODEL_MARKER);
  const withWeeklyPlan = integrateFeature(withWeeklyPlanModel, weeklyPlanCode, WEEKLY_PLAN_MARKER);
  const withAnalytics = integrateFeature(withWeeklyPlan, analyticsCode, ANALYTICS_MARKER);
  const withDictionary = integrateFeature(withAnalytics, dictionaryCode, DICTIONARY_MARKER);
  const withKnowledgeGraph = integrateFeature(withDictionary, knowledgeGraphCode, KNOWLEDGE_GRAPH_MARKER);
  const withKnowledgeGraphLifecycle = integrateFeature(withKnowledgeGraph, knowledgeGraphLifecycleCode, KNOWLEDGE_GRAPH_LIFECYCLE_MARKER);
  const withMarkdownVault = integrateFeature(withKnowledgeGraphLifecycle, markdownVaultCode, MARKDOWN_VAULT_MARKER);
  const withMarkdownVaultHardening = integrateFeature(withMarkdownVault, markdownVaultHardeningCode, MARKDOWN_VAULT_HARDENING_MARKER);
  const withAnkiObsidian = integrateFeature(withMarkdownVaultHardening, ankiObsidianCode, ANKI_OBSIDIAN_MARKER);
  const withUxModel = integrateFeature(withAnkiObsidian, uxModelCode, UX_MODEL_MARKER);
  const enhanced = integrateFeature(withUxModel, uxCode, UX_MARKER);

  return new Response(enhanced, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

async function appShellResponse(request) {
  const cached = await caches.match(request, { ignoreSearch: true })
    || await caches.match('./index.html');

  if (cached) return enhanceHtmlResponse(cached);

  try {
    const network = await fetch(request);
    if (network.ok) {
      const copy = network.clone();
      caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
    }
    return enhanceHtmlResponse(network);
  } catch {
    return Response.error();
  }
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isDocument = event.request.mode === 'navigate'
    || (isSameOrigin && (url.pathname.endsWith('/') || url.pathname.endsWith('/index.html')));

  if (isDocument) {
    event.respondWith(appShellResponse(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        if (response.ok && isSameOrigin) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => Response.error());
    })
  );
});
