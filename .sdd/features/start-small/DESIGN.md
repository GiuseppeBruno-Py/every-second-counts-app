# Start Small — Design

**Delivery:** 2
**Status:** Complete (Built)
**DEFINE:** `.sdd/features/start-small/DEFINE.md` — 15/15
**Baseline:** `origin/main@da02a7a`, branch `codex/start-small`, cache `compasso-pages-v89`
**Revisão:** 2

## Inspeção e estado atual

O worktree gerenciado estava limpo em `codex/executable-next-attempt@fd4e6aa`; a PR #90 está mesclada. `origin/main@da02a7a` contém apenas esse merge desde a Delivery 1. O checkout compartilhado em OneDrive continua divergente e possui `.codegraph/` e relatório não rastreados; não foi alterado. O worktree atual não contém `.codegraph/`, então a inspeção usou fonte, `AGENTS.md`, `README.md`, docs de Hoje/Sessions, manifesto, testes e CI. Baseline: `npm test` passou 234/234; Playwright dirigido para ensaio, Capability e ciclo PWA passou 60 casos, com 12 skips configurados.

Hoje mostra a tentativa atual como ação principal e inicia a Session normal por `session.startDefault`; ensaio e configuração são alternativas existentes. `sessions-feature.js` cria uma fonte em `sessions[]`, a projeta em `executionSessions[]` e persiste ambas antes de anunciar o início. `session-timer-model.js` calcula duração efetiva e congela o encerramento. O companheiro compacto é a superfície visível durante execução; `#sessionBanner` permanece oculto pelo design system. Não há escolha inicial de cinco minutos. `minimumVersion` reduz escopo de ação e não será reaproveitada como duração.

## Estado alvo e interfaces

Na tentativa principal válida em Hoje, inserir um botão secundário **Começar por 5 min** junto às ações atuais. O handler revalida a tentativa principal e seu `attemptId` no momento do clique e chama `session.startSmallConfirmed` com o mesmo contexto/recurso da Session padrão. O comando reutiliza preparação e criação da Session normal, solicita um compromisso curto fixo de cinco minutos e retorna o resultado da persistência; falha mantém Hoje e apresenta erro acessível para retry. Outras entradas de Session continuam no caminho atual.

Uma Session nova usa `schemaVersion: 2`. Somente a escolha curta recebe:

```js
startSmall: { minutes: 5, choice: null, decidedAt: null }
```

`choice` torna-se `continue` ou `adjust` após salvamento explícito. Encerrar usa `status: finishing` e o encerramento normal; se cancelado, a decisão curta volta a ficar disponível. A projeção `executionSessions[]` usa seu campo já existente `plannedMinutes: 5`, derivado da fonte, sem segundo registro ou versão global nova. Sessions v1 e v2 sem `startSmall` mantêm tempo ilimitado. Leitura de marcador malformado falha fechada, sem inventar compromisso curto; o normalizador é idempotente.

`session-timer-model.js` separa duração bruta da duração apresentada. Com compromisso pendente, `elapsed()` limita a duração efetiva a 300.000 ms, mesmo se o aplicativo estiver fechado ou a aba tiver ficado suspensa. Pausa anterior ao marco continua excluída. `startSmallDue()` só é verdadeiro para Session ativa/pausada, com marcador válido, escolha pendente e cinco minutos efetivos. `resolveStartSmall(session, choice, at)` é puro: desconta de `pausedMs` o tempo bruto acima do marco, registra `decidedAt` e mantém o mesmo `id`. Para `continue`, retoma se necessário e o cronômetro avança a partir de cinco minutos. Para `adjust`, fixa `status: paused` e abre o editor da Capability após persistência. Um encerramento pendente usa `begin()` atual, que congela a duração limitada, e `finish()`/Evidence existentes.

O companheiro mostra, ao atingir o marco, um painel inline com `role=status`/erro acessível e três ações: **Continuar sessão**, **Encerrar e registrar**, **Ajustar tentativa**. O painel não rouba foco nem abre modal; o relógio fica limitado até decisão. Os três controles usam o mesmo cronômetro e fluxos existentes. **Ajustar tentativa** valida que a Capability da Session ainda está ativa; após gravar a pausa e a escolha, navega para o editor existente. Seu `learningContext` histórico nunca é reescrito. Se a Capability não estiver disponível, o erro permanece no painel e as outras decisões funcionam.

## Estados e falhas

| Estado | Evento | Efeito |
|---|---|---|
| Sem marcador | Tempo passa | Session normal permanece ilimitada; painel ausente. |
| Curta, antes do marco | Tick/pausa/reload | Tempo efetivo avança ou fica pausado; painel ausente. |
| Curta, marco atingido | Tick/reload/offline | Tempo apresentado limita-se a 5 min; painel aparece sem criar outro timer. |
| Pendente | Continuar | Candidato persiste escolha, remove excesso de tempo e retoma a mesma Session. |
| Pendente | Encerrar | Encerramento existente congela duração; Evidence pode ser salva; cancelar devolve painel. |
| Pendente | Ajustar | Candidato persiste escolha e pausa; editor existente abre após sucesso. |
| Início/decisão | Escrita falha | Estado anterior é restaurado, sem anúncio de sucesso; controle/erro permanecem disponíveis. |
| Sessão finalizada | Reload/backup | Duração e Evidence existentes permanecem; painel ausente. |

## Decisões e alternativas rejeitadas

- Não usar `executionVariant.minimum`: ela descreve escopo, enquanto Start Small descreve tempo inicial.
- Não criar timer, Session paralela, rota ou modal: o cronômetro, o salvamento e o companheiro existentes já assumem essas responsabilidades.
- Não iniciar uma extensão após cinco minutos. Limitar `elapsed()` e descontar o excesso ao decidir produz o mesmo marco após suspensão/reabertura, sem depender de `setTimeout` em background.
- Não inferir que cinco minutos geraram progresso ou Evidence; o registro continua explícito no encerramento.
- Não alterar Deep Work ou Session aberta fora da tentativa principal; isso preserva o contrato da configuração atual e reduz decisões em outras telas.

## Manifesto de arquivos fechado

| Caminho | Ação | Propósito / dependência | AC |
|---|---|---|---|
| `.sdd/features/start-small/DEFINE.md` | criar/atualizar status | Requisitos e gate | todos |
| `.sdd/features/start-small/DESIGN.md` | criar/atualizar status | Plano e gate | todos |
| `session-timer-model.js` | modificar | Normalização do marcador, duração limitada e resolução pura | 03–06, 09–10 |
| `tests/session-timer-model.test.js` | modificar | Limite, pausas, refresh, decisão e legado | 03–06, 09–10 |
| `sessions-feature.js` | modificar | Comando de início, fonte v2, decisão transacional e integração com fim/editor | 02, 05–10 |
| `execution-session-model.js` | modificar | Projetar 5 min no `plannedMinutes` canônico existente | 02, 10 |
| `tests/execution-session-model.test.js` | modificar | Projeção e legado sem duplicação | 02, 09–10 |
| `today-feature.js` | modificar | Ação secundária e revalidação da tentativa | 01–02, 08, 11 |
| `session-companion-feature.js` | modificar | Painel de decisão no companheiro atual, erro/foco | 04–08, 11 |
| `design-system.css` | modificar | Painel responsivo, foco visível, 44 px e sem overflow | 11 |
| `app-manifest.js` | modificar | Geração v89→v90; lista atual já contém módulos/CSS alterados | 10, 12 |
| `tests/browser/start-small-flows.spec.js` | criar | Fluxos de início, marco, continuação, fim/Evidence, ajuste, rollback, backup/offline e acesso | 01–12 |
| `tests/browser/attempt-rehearsal-flows.spec.js` | modificar | Atualizar asserção da ordem exata de ações de Hoje sem alterar o contrato do ensaio | 01 |
| `docs/start-small.md` | criar | Uso e limites de dados/PWA | todos |
| `docs/today-feature.md` | modificar | Contrato da ação principal | 01, 11 |
| `docs/sessions-feature.md` | modificar | Contrato temporal, persistência e recuperação | 02–10, 12 |
| `.sdd/reports/start-small/BUILD_REPORT.md` | criar | Evidências reais do Build | todos |
| `.sdd/archive/start-small/{DEFINE,DESIGN,BUILD_REPORT,SHIPPED}.md` | criar | Fechamento por cópia se Ship passar | todos |

Nenhum move/delete. Alterar outro arquivo exige Iterate/Design antes de Build.

## Ordem e validação

1. Modelo de timer e testes puros, depois projeção canônica e teste.
2. Fonte/comandos de Session e ação de Hoje.
3. Painel do companheiro, CSS estático, docs e testes browser.
4. Revisar `manifest.webmanifest` e assets de `app-manifest.js`; avançar uma vez a geração para v90.
5. Rodar `npm test`, `npm run build:test`, spec Playwright dirigido, `npm run test:browser` ou projetos completos, `git diff --check` e revisão do diff/AC. Lint/typecheck não têm comando configurado.

| AC | Verificação planejada |
|---|---|
| 01–02 | Browser Today/start e Node projeção canônica. |
| 03–05 | Node tempo efetivo, pausa, limite e continuidade; browser refresh/continuação. |
| 06–08 | Browser Evidence/cancel, editor/pause e falha de escrita. |
| 09–10 | Node legado, browser sessão comum, backup/restore, localStorage e offline. |
| 11 | Browser desktop/mobile, teclado, 360 px, 200% zoom, foco e touch. |
| 12 | Testes existentes de manifesto, update e reabertura PWA offline. |

## Migração, rollback e impactos

**Migração aditiva:** novos registros usam Session v2; registros v1 não são reescritos. O normalizador opcional aceita apenas `{minutes:5,choice:null|continue|adjust,decidedAt}` coerente. Backups antigos continuam válidos; export/restore novo usa a coleção `sessions` e a projeção `executionSessions` atuais. A sincronização e tombstones de coleções não mudam. Sem dados sensíveis novos, rede, telemetria ou permissão. O custo de tick é constante e usa o intervalo já existente do companheiro.

Rollback do código após exposição de PWA v90 requer geração futura para substituir o cache instalado; preservar dados locais. Um cliente antigo pode ignorar `startSmall` desconhecido enquanto mantém o restante da Session, mas não saberá limitar os cinco minutos; por isso a atualização do shell deve convergir antes de considerar instalada. Testes automatizados não substituem observação física da PWA.

## Gate

DEFINE 15/15; documentação, fonte, testes, CI e manifesto inspecionados; AC mapeados, modelo de tempo e migração definidos, manifesto fechado. **Ready for Build.**

## Histórico de revisão

| Data | Classificação | Motivo e impacto |
|---|---|---|
| 2026-09-29 | Revisão 2, aditiva | A inspeção durante Build encontrou em `attempt-rehearsal-flows.spec.js` uma asserção da lista completa de botões de Hoje. O manifesto passa a incluir apenas a atualização dessa expectativa para AC-01. DEFINE, modelo temporal e demais evidências permanecem válidos; o teste de navegador ainda precisa ser reexecutado. |
