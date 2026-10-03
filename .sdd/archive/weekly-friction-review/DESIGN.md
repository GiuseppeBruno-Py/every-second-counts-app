# Revisão semanal de fricção — Design

**Status:** Shipped
**Revisão:** 3
**Data:** 2026-10-03
**Define:** DEFINE.md validado15/15
**Branch/base:** codex/weekly-friction-review / origin/main@e842fe2
**Worktree:** C:/Users/Giuse/.codex/worktrees/anti-procrastination-discovery/every-second-counts-app

## Inspeção e estado atual

AGENTS raiz, sem .codegraph, checkout limpo antes dos artefatos. README, manifesto, package, Playwright/CI, docs de Weekly Review/Experiments/Discovery/Gate1 e SDD weekly-review-positive inspecionados. weekly-review-feature.js é proprietário de revisão v2, campos blockers/decision e save atômico junto a learningOutcomes/capabilityReflections. Capabilities entram por execução, sinais ou reflexão anterior; uma tentativa evitada sem atividade não entra sozinha. Modelos de contexto/outcome preservam nextAttempt.id nas edições. Baseline npm test255 PASS/0 FAIL (1.19s).

## Arquitetura e fluxo

Modelo puro weekly-friction-model.js: catálogo das sete dificuldades, compose(input) com validação/apêndice idempotente dos textos em blockers/decision (600 caracteres), e currentTarget(ref,outcomes) para identidade/texto/estado sem ambiguidade. Nenhum registro persistido novo. Export global + CommonJS conforme modelos existentes; carregar antes de weekly-review-feature.js e declarar browserJourney/asset pelo manifesto, geração v94.

No fechamento existente, details nativo “Rever uma dificuldade de início (opcional)” com task240, reason enum opcional, adjustment600 e destino opcional entre capacidades ativas. Após task não vazia revelar razão/ajuste/destino/Aplicar. Texto explícito explica que aplicar preenche revisão e que concluir salva. Limpar descarta só auxiliar. Nenhuma gravação ao abrir, preencher ou aplicar. Aplicar preenche blockers/decision e, se houver destino, injeta referência transitória em weeklyCapabilityGroups, rotulada como seleção da revisão (não execução), preserva todos os rascunhos de cards, seleciona revise e preenche o ajuste no campo existente de nova tentativa; foco nesse campo. Sem alvo: foco em weeklyDecision.

weeklyReviewRuntime guarda range da ajuda, refs de capacidades adicionadas, alvos apresentados e assinatura aplicada. Não serializar runtime. Antes de mudar semana, resetar auxiliar/refs. Rerender na mesma semana mantém campos da ajuda; save falho repõe draft completo de revisão/cartões pelo contrato atual. Extrair captura/restauração de cards para reutilizar na inclusão de alvo e rollback. Uma assinatura pendente bloqueia Concluir com foco/mensagem até Aplicar ou Limpar. Revalidar alvo na aplicação e refs selecionadas no save para impedir edição stale. Erro não altera rascunhos de destino nem estado.

O save atual continua único proprietário de persistência e timestamps; nextAttempt e reflexão são atualizados no mesmo candidato. Revisões históricas não ganham respostas inferidas. Legacy v1/v2 preservado; nenhuma migração, nova entidade, token de rastreamento, contador, analytics ou Markdown novo. Nova CSS estática e específica, sem expandir a injeção legada de styles.

## Manifesto fechado e dependências

| Arquivo | Ação e propósito | Dependência | AC |
|---|---|---|---|
| weekly-friction-model.js | Criar composição pura/validação/catálogo | Define | 02–05 |
| weekly-review-feature.js | Modificar ajuda e integração com rascunho/save existentes | modelo | 01–08 |
| design-system.css | Modificar estilos do auxiliar/foco/mobile | UI | 08 |
| app-manifest.js | Modificar ordem, journey e geração94 | modelo/UI/CSS | 09 |
| tests/weekly-friction-model.test.js | Criar contratos de composição, limites, idempotência, stale, manifesto | modelo | 02–05,09 |
| tests/browser/weekly-friction-flows.spec.js | Criar fluxos dados/decisão/cancelamento/falha/backup/offline/a11y | runtime | 01–09 |
| docs/weekly-review-feature.md | Modificar uso, compatibilidade e limites | implementação | 01–09 |
| .sdd/features/weekly-friction-review/DEFINE.md | Criar/atualizar requisitos/status | roadmap | 01–10 |
| .sdd/features/weekly-friction-review/DESIGN.md | Criar/atualizar desenho/status | Define | 01–10 |
| .sdd/reports/weekly-friction-review/BUILD_REPORT.md | Criar evidência exata/matriz | validação | 01–10 |
| .sdd/archive/weekly-friction-review/DEFINE.md | Criar cópia preservando fonte | Ship | 01–10 |
| .sdd/archive/weekly-friction-review/DESIGN.md | Criar cópia preservando fonte | Ship | 01–10 |
| .sdd/archive/weekly-friction-review/BUILD_REPORT.md | Criar cópia preservando fonte | Ship | 01–10 |
| .sdd/archive/weekly-friction-review/SHIPPED.md | Criar fechamento/limites/lições | Ship | 01–10 |
| .sdd/reports/anti-procrastination/GATE_2.md | Criar avaliação de utilidade/continuidade | entrega6 | 10 |

## Ordem, testes e revisão

Define -> Design -> modelo/Node -> UI/CSS/manifesto -> browser/docs -> regressão -> Gate2 -> Build/Ship -> commit/push/PR -> CI canônico. Aprovação atual autoriza esta entrega até PR. Não começar7/8.

Node: vazio/malformed, sete razões, preservar texto, limites exatos, sem truncar, reapply sem duplicar, alvo alterado/arquivado/removido/duplicado, sem mutação, ordem/asset/cache. Browser: vazios/legado sem gravação; helper geral; target sem execução e persistência atômica; outros drafts preservados; descartar e semana/reload; erro de limite e stale; falha/retry; backup/restore e offline em ambos backends; teclado, foco, labels,44px,contraste,360px/200%,reduced motion e capturas. Rodar também weekly-review-positive e regressão canônica para fluxos existentes. Fontes largas em zoom são risco conhecido do CI; conferir palavras/controles, não só scrollWidth com clip.

Comandos de package.json: npm test; npm run build:test + npx playwright test focado; npm run test:all. node --check e git diff --check auxiliares. Sem lint/typecheck configurados. CI Ubuntu/Node22 da nova PR será validado no head publicado; nenhuma instalação física PWA alegada. Testes SW existentes cobrem composição/lifecycle/cache e novo módulo offline.

## Compatibilidade, segurança, rollout e rollback

Sem migração: apenas texto/reflexão nos campos existentes, normalização/tombstones/merge/backup intactos. Campos auxiliares nunca entram no JSON. v94 invalida shell v93 pelo proprietário atual; assets existentes + modelo local. Rollback após exposição exige geração futura, mantendo revisões/reflexões já salvas. Nenhum conteúdo pessoal enviado à rede. Escape HTML na UI; comprimento validado no modelo e campos. Custo linear nas capacidades da revisão, sem varrer histórico para diagnóstico. Gate2 distinguirá prova técnica de evidência de uso pessoal ausente; não alegar eficácia.

## Iteração R2 — revisão do estado transitório

2026-10-03, Modifying dentro do manifesto. saveData chama renderAll antes de aguardar persistência; outros renders também recompõem campos. Preservar draft completo da semana (geral e cartões) durante rerender da mesma semana somente quando a ajuda tem conteúdo ou refs aplicadas e não há save em andamento. O candidato durável continua proprietário ao salvar; rollback repõe draft como antes. Troca de semana limpa auxiliar e não restaura draft anterior.

A escolha explícita de capacidade deve selecionar a referência atual mesmo se o grupo semanal veio de outra identidade de tentativa histórica; conservar Evidence/executions como históricos, sem fabricar eventos. Revalidar refs no save e preservar drafts dos demais cartões. Em stale, atualizar opções de destino para permitir reaplicar à versão atual sem exigir sair da semana. Adicionar bloqueio transitório de save e controles da revisão enquanto persistência aguarda; impedir navegação/reentrada até concluir, sem novo campo persistido.

DEFINE e arquivos previstos intactos. Testes R1 locais parciais não fecham AC-04/05/07; acrescentar casos de rerender, tentativa histórica distinta e keep explícito, além dos casos existentes. Revalidar focused e regressão antes de Ship.

Ao apagar a resposta inicial, limpar também as respostas auxiliares ocultas; conservar textos já aplicados no fechamento. Isso permite novamente o fluxo opcional vazio sem bloquear foco em campo escondido. Cobrir no caso progressivo existente.

Correção final de acessibilidade R2: limpar aria-invalid também nos campos gerais de bloqueios/decisão ao resolver/descartar erro da ajuda. Validar foco/erro no browser após a correção; evidência de regressão dos demais fluxos permanece aplicável. CI canônico validará o head completo publicado.

## Iteração R3 — prontidão do fixture revelada pelo CI

2026-10-03, Refining de evidência AC08, sem mudança de requisitos, produção, manifesto ou cache. CI37152295244 no head5592c69: Node262 pass; browser448 pass,24 skips,1 flaky desktop e1 fail mobile no Enter inicial. Artefatos mostram app-shell hidden/inert após focus; CompassoFeatures.installed não garante shell interativo. O fixture deve aguardar CompassoPwaLifecycle.snapshot().coherent antes de preparar os dados e afirmar foco no summary antes das teclas nativas. Não definir open para substituir teste de teclado, não aumentar timeout/retries nem remover asserções. Evidência anterior de teclado não fecha Linux; manter os demais contratos verificados. Revalidar focused sem retries e CI canônico no novo head. Build/Ship local revalidado pelo focused38 pass/0 fail, sem retries (55.2s). CI canônico do novo head permanece gate obrigatório do handoff da PR, conforme ordem original Ship local -> commit/PR -> CI. Não alegar Linux verde antes desse resultado. Histórico R2 permanece no commit5592c69.
