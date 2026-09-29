# Compasso — redução de fricção: Delivery 0 / Discovery

## Status e escopo

**Status: PASS. Nenhuma feature implementada.** Este relatório diagnostica o produto presente no commit verificado e propõe apenas a próxima Delivery. Delivery 1 requer DEFINE e DESIGN antes de Build, conforme `AGENTS.md`. O roadmap deve ser reavaliado após cada gate, pois parte de suas hipóteses já coincide com recursos existentes.

## Proveniência e trabalho preservado

| Local | Branch / HEAD | Estado observado |
|---|---|---|
| Checkout compartilhado `C:\Users\Giuse\OneDrive\Documentos\Every Second Counts\every-second-counts-app` | `main` / `a8db92647282d560ed31d5b6286fbe52764c44d9` | `main...origin/main [ahead 2, behind 169]`; `.codegraph/` e `.sdd/reports/evidence-calibration/` não rastreados. |
| Worktree isolado `C:\Users\Giuse\.codex\worktrees\anti-procrastination-discovery\every-second-counts-app` | HEAD destacado / `52ab72ce2580cc0b0a8de4d4b99fbbf17ba601a1` (`origin/main` local verificado) | Limpo antes da Discovery. Base deste diagnóstico. |

O CodeGraph foi consultado primeiro no checkout compartilhado, onde existe `.codegraph/`; seu índice descreve o código antigo e não foi usado para atribuir comportamento ao commit novo. O worktree do commit `52ab72c` não contém `.codegraph/`, então a inspeção ali usou fonte, documentação e testes diretamente. Não houve pull, merge, rebase, reset, commit, push ou alteração dos arquivos não rastreados do checkout compartilhado.

**Continuação da Delivery 1:** um `git fetch` posterior revelou `origin/main@e8c778d` (PR #89, persistência do plano semanal). O worktree foi colocado em `codex/executable-next-attempt` a partir desse commit. A mudança não toca Capability, Today nem a composição da tentativa; avança o cache para v88. DEFINE, DESIGN e Build usam esse novo baseline. A tabela acima preserva a proveniência histórica da Discovery.

## Arquitetura e fluxo atual

O aplicativo é uma PWA estática em HTML, CSS e JavaScript puros. `index.html` inicia estado, renderização e backup/restore; `app-manifest.js` ordena módulos, declara coleções e assets; `service-worker.js` compõe e serve o shell offline. O ciclo relevante é:

1. `learning-outcome-feature.js` edita `learningOutcomes[].nextAttempt` pela interface de Capacidades; `learning-outcome-model.js` valida e normaliza.
2. `capability-context-model.js` cria uma referência com `outcomeId`, `attemptId`, `attemptText`; `today-feature.js` a adiciona ao `dailyPlans` do dia, exibe a tentativa principal e inicia a execução.
3. `sessions-feature.js` inicia Session normal, guarda `learningContext` e persiste antes de ativar; `execution-session-feature.js` mantém a projeção canônica. Deep Work é outra modalidade da infraestrutura de execução.
4. `evidence-feature.js` registra Evidence vinculada por `sessionId`; `capability-context-model.js` resolve a origem canônica para Capability. Hoje pode mostrar uma Evidence recente, derivada sem novo estado.
5. `weekly-review-feature.js` apresenta Evidence e sinais, registra reflexão e decisão explícita `keep`/`revise`; a revisão chama o mesmo `learningOutcomeModel.updateOutcome()` para ajustar a tentativa.

| Área | Pontos de extensão reais | Observação para o roadmap |
|---|---|---|
| Capability e tentativa | `learning-outcome-feature.js` `outcomeInstallShell()`, `outcomeOpen()`, `outcomeSubmit()`; `learning-outcome-model.js` `normalizeAttempt()`, `createOutcome()`, `updateOutcome()` | O editor já tem textarea obrigatória de tentativa e um painel opcional que compõe texto para simulação de pressão. |
| Hoje / plano | `today-feature.js` `todayPlan()`, `renderTodayPrimary()`, `todayStartCapability()`, `todaySaveCapabilityChange()`; `capability-context-model.js` `addTodayItem()` | Uma tentativa atual é referência do plano; início direto é primário, ensaio e configuração são secundários. |
| Session / tempo | `sessions-feature.js` `openSessionStartCore()`, criação, pausa e fechamento; `session-timer-model.js`; `execution-session-model.js` | A Session normal mede tempo decorrido e recupera estado; Deep Work possui `plannedMinutes`. Não há marco de 5 minutos na Session rápida. |
| Ambiente | `ritual-model.js` `defaults()`, `suggest()`, `snapshot()`; `ritual-feature.js` `ritualPrepareExecution()`, `ritualExecutionSnapshot()` | Há cinco templates padrão com preparação e remoção de distrações; Ritual é opcional na configuração. Checklist de execução aparece em Deep Work. |
| Ensaio | `today-feature.js` `todayOpenRehearsal()`, `todayStartFromRehearsal()` | Quatro respostas, incluindo primeira ação, ficam só no DOM e somem no cancelamento, Escape, navegação ou reload. |
| Experimentos | `behavioral-experiment-model.js` `create()`, `normalize()`, `review()`; `behavioral-experiment-feature.js` formulário | Um template pode preencher hipótese, prática, resultado esperado e plano de Evidence sem subclasse. |
| Revisão | `weekly-review-feature.js` `renderWeeklyCapabilities()`, `saveWeeklyReview()` | Já há bloqueios e dispersões, prática repetível, reflexão e decisão de manter/revisar. Evitar outro questionário obrigatório. |

Documentação consultada: `README.md`, `docs/capability-first-compasso.md`, `docs/today-feature.md`, `docs/behavioral-experiments.md`, `docs/pressure-simulation.md` e os artefatos SDD relacionados a ensaio, experimentos e simulação. `AGENTS.md` no worktree estabelece a ordem SDD e os contratos de compatibilidade. O relatório não rastreado de Evidence Calibration no checkout antigo foi lido apenas como contexto de proveniência; descreve um commit remoto anterior e não substitui a fonte atual.

## Schemas e compatibilidade observados

```text
learningOutcomes[] = {
  id, capability, proofCriterion: string|null, resourceRefs[],
  nextAttempt: { id, text, futureUse?, createdAt, updatedAt },
  status, archivedAt, createdAt, updatedAt
}

dailyPlans[] = {
  id, schemaVersion: 2, date, updatedAt,
  items: [{ id, type: 'capability-attempt',
            capabilityRef: { outcomeId, attemptId, attemptText },
            completedAt: string|null, createdAt }, ...]
}

sessions[] = {
  id, schemaVersion, domain, itemId, learningContext,
  intent, executionVariant, contingencySnapshot,
  ritualSnapshot, ritualChecklist, startedAt, endedAt,
  pausedMs, pauseStartedAt, durationMs, status, ...
}

behavioralExperiments[] = {
  id, schemaVersion: 1, capabilityRef,
  hypothesis, practice, expectedOutcome, evidencePlan,
  startDate, reviewDate, decision, resultNote,
  reviewedAt, createdAt, updatedAt
}
```

`nextAttempt` **não é só texto livre**: tem identidade e timestamps, além do enum opcional `futureUse` (`remember`, `explain`, `solve`, `build`, `decide`, `simulate`, `integrate`). O texto em si permanece livre. O critério `proofCriterion` responde como reconhecer a capacidade; `futureUse` descreve como usá-la. Nenhum deles armazena um resultado pessoal que a capacidade “destrava”. O modelo de Capability normaliza campos conhecidos, de modo que um campo novo exigiria alteração explícita de normalização e testes.

O ID da tentativa é preservado ao editar seu texto. Hoje usa o texto atual quando o ID da referência ainda coincide; Sessions guardam o snapshot de execução. Uma futura detecção de adiamento não pode tratar apenas o ID estável como prova de que o texto da tentativa nunca mudou.

Estado lógico `compasso.state.v3`, `_schema.version = 3`, chave `compasso.app.v1`. `storage.js` usa IndexedDB `compasso-db` versão física 1 / store `appState`; o espelho em `localStorage` tem limite de 256 KiB e também funciona como fallback. `state-foundation.js` normaliza coleções, faz merge por timestamps, conserva conflitos e aplica `_sync.tombstones`. `app-manifest.js` inclui `learningOutcomes`, `dailyPlans`, `sessions`, `executionSessions`, `evidence`, `weeklyReviews`, `ritualTemplates` e `behavioralExperiments` no catálogo.

O backup JSON exporta `state.data` (com preparo do Journal); o restore valida raiz, normaliza Capability e Experiments, prepara Rituals e execução canônica, e usa `CompassoStorage.replace()` com persistência antes de ativar o novo estado. Portanto, uma Delivery 1 que altere apenas `nextAttempt.text` permanece dentro do backup/restore existente. A exportação Markdown/vault é um contrato distinto, centrado em notas e vínculos; o texto da tentativa não precisa ganhar um campo separado ali.

O cache atual é `compasso-pages-v87`, declarado em `app-manifest.js`, junto com os módulos e assets. `service-worker.js` instala o shell, remove somente caches Compasso antigos e serve a composição offline. `manifest.webmanifest` declara identidade, ícones, escopo e atalhos, mas não a lista de módulos. Qualquer Delivery que altere JS/CSS/HTML precisará revisar a lista e avançar a geração do cache, com teste de update e abertura offline. Não há razão identificada para mudar as propriedades do webmanifest na Delivery 1.

## Respostas às perguntas da Discovery

1. **`nextAttempt` livre ou estruturado?** Objeto com `id`, `text`, `futureUse?` e timestamps; a ação é escrita livremente em `text`.
2. **Primeiro passo existente?** Sim: “Qual é a primeira ação concreta?” no ensaio de Hoje, mas a resposta é efêmera. A `minimumVersion` de ações de leitura/estudo/meta também descreve menor passo útil. Nenhum campo persistido de primeiro passo existe para Capability.
3. **Ritual para ambiente?** Sim. Templates já incluem abrir material, silenciar notificações e fechar abas; há seleção opcional e snapshot por Session. O checklist detalhado é específico da superfície Deep Work, portanto a integração em Today exigiria análise de UX, não nova entidade.
4. **Session curta reutilizável?** A Session normal já aceita encerramento cedo, cronômetro recuperável, Evidence e pausa. Deep Work tem duração planejada; “versão mínima” descreve escopo de uma ação, não um gatilho automático aos 5 minutos. Delivery 2 exigiria um marco e decisão explícita no mesmo motor, caso se prove útil.
5. **Propósito/resultado na Capability?** `proofCriterion` é critério de prova; `futureUse` é uso pretendido da tentativa. Não há frase de benefício pessoal equivalente a “O que isso destrava?”.
6. **Histórico confiável para detectar adiamentos?** Parcial. `dailyPlans` conserva referências por data e `completedAt`, mas não há evento de adiamento nem distinção entre “não feito”, “não marcado” e “removido”. Ausência de Session não basta. Delivery 5 deve aguardar evidência melhor ou limitar muito a inferência.
7. **Adiado/removido/reagendado?** Hoje alterna `completedAt` para concluir/reabrir e remove a referência por filtro de `items`; não há comando de adiar/reagendar a referência de Capability nem tombstone de item de plano nessa operação. Um item pode ser novamente adicionado em outro dia, mas não há evento que ligue as duas decisões.
8. **Templates de Experiments sem schema?** Sim. O modelo existente aceita campos de texto e datas; templates podem preencher o formulário antes de confirmação. `capabilityRef` válida continua obrigatória.
9. **Dados no backup?** O estado local integral preparado para exportação, incluindo as coleções acima, metadados de schema/sync e conteúdo local. Restore de backup legado normaliza coleções ausentes; formatos Markdown/vault têm escopo próprio.
10. **Impacto no Service Worker?** Mudar código de UI exige adicionar qualquer asset novo ao manifesto se houver, manter composição e avançar `cacheName`. Delivery 1 pode limitar-se a módulos/estilos já declarados, mas ainda requer geração nova para PWA instalada.

## Duplicações e riscos de produto

- **Próximo Passo Executável × ensaio:** o editor deve ajudar a definir *o que e quando tentar* antes de salvar; o ensaio de Hoje prepara *como agir* antes da Session. Colocar ambos como novos botões em Hoje aumentaria decisões na tela principal.
- **Próximo Passo Executável × simulação de pressão:** ambos atuam no rascunho de `nextAttempt.text`; precisam compartilhar um contrato de composição que não apague texto, duplique sufixos nem ultrapasse 1000 caracteres. A simulação existente hoje só é aplicada a uma Capability ativa em edição.
- **Ritual × ensaio × preparo Deep Work:** Ritual prepara recursos e ambiente; ensaio trata resultado, primeira ação, dificuldade e resposta; Deep Work já pergunta por notificações, materiais e ambiente. Um novo checklist de ambiente em Today provavelmente duplicaria o fluxo.
- **Start Small × versão mínima:** a versão mínima atual é uma variante de *escopo* em ações comuns, com `estimatedMinutes` apenas como estimativa; Session quick mede tempo decorrido. Os conceitos não são idênticos, mas a apresentação pode parecer concorrente.
- **Valor percebido × `futureUse`:** uso pretendido não substitui benefício pessoal. Qualquer Delivery 4 precisa primeiro provar que o valor adicional merece um campo persistido.
- **Detecção de adiamento:** planos antigos e remoções sem evento deixam falsos positivos possíveis. Texto editado conserva `attemptId`.
- **Restrição “sem cloud”:** o produto atual já tem sincronização opcional com Google Drive. Este roadmap não precisa ampliá-la, mas não se deve descrever o código verificado como sem qualquer integração cloud.

## Baseline e limites da evidência

- `npm ci`: PASS; 3 pacotes instalados. npm reportou 2 vulnerabilidades altas em dependências de teste; nenhuma dependência foi alterada.
- `npm test`: PASS, 232 testes, 0 falhas, 0 ignorados.
- `npm run build:test`: PASS; fixture composta para Playwright.
- `npx playwright test tests/browser/learning-outcome-flows.spec.js tests/browser/capability-context-flows.spec.js tests/browser/attempt-rehearsal-flows.spec.js tests/browser/pressure-simulation-flows.spec.js tests/browser/behavioral-experiment-flows.spec.js tests/browser/weekly-review-positive-flows.spec.js`: PASS, 111 aprovados, 0 falhas, 1 ignorado pela própria suíte; Chromium desktop e mobile, 4,6 minutos. Cobre Capacidades, contexto, ensaio, simulação, experimentos, revisão, backup, fallback, offline e foco.
- `npx playwright test tests/browser/critical-flows.spec.js tests/browser/pwa-lifecycle-flows.spec.js --grep 'Executar reúne sessão, Deep Work, variante e ritual|controlled complete cache reopens offline'`: PASS, 3 aprovados, 0 falhas, 1 ignorado pela própria suíte; entrada Executar em desktop/mobile e reabertura offline do cache em desktop.
- `git diff --check`: PASS, sem saída. O relatório novo não rastreado foi verificado separadamente por leitura; esse comando não o inclui.
- Não houve teste manual de PWA instalada nesta Discovery; os testes automatizados e a inspeção de código não provam reinício físico de uma instalação.

## Proposta concreta para Delivery 1

**Implementável sem mudança de schema: sim.** Usar o `nextAttempt.text` existente. No diálogo de criar/editar Capability, inserir uma ação secundária “Tornar mais fácil de começar” junto à textarea da tentativa; um disclosure curto e separado da simulação de pressão deve pedir no máximo (1) menor começo útil e (2) gatilho contextual opcional (“Depois de ___”). O percurso deve caber em menos de 30 segundos. Mostrar a frase resultante no próprio textarea, editável, e persistir somente pelo botão atual de salvar. O usuário deve poder fechar, pressionar Escape ou salvar a tentativa normal sem passar pela ajuda. Não criar rota, entidade, motor de timer ou campos `minimumDose`/`trigger`.

O DESIGN deve resolver a coexistência com “Simulação deliberada”: aplicar sobre o rascunho, nunca sobre estado persistido; não acumular prefixos duplicados ao reabrir a ajuda; preservar o limite de 1000 caracteres, o texto livre e o foco. A ação secundária não deve aparecer em Hoje nesta Delivery. Padrão de teste: criar, editar, usar ajuda, salvar, recarregar, voltar a editar; texto sem ajuda; Escape/cancelamento; simulação no mesmo rascunho; mobile/teclado; backup antigo e novo; fallback; atualização e uso offline. O DESIGN também deve decidir se a ajuda será oferecida no caminho `revise` da Weekly Review, que usa o mesmo modelo mas outro formulário.

**Próxima fase válida:** Delivery 1 / DEFINE, depois DESIGN. A implementação aguarda aprovação explícita do usuário, como solicitado no roadmap.
