# Revisão mínima de importância — Design

**Status:** Shipped
**Revisão:**2
**Data:**2026-10-04
**Worktree:**C:/Users/Giuse/.codex/worktrees/anti-procrastination-discovery/every-second-counts-app
**Branch/base:**codex/capability-importance-review /386072d40970980c7d85f259cf8be4734d64a03e
**Define:**15/15

## Inspeção e arquitetura

Worktree limpo, root AGENTS aplicável, sem .codegraph neste worktree. Checkout original preservado com índice/trabalho não rastreado. README, docs capability/weekly, modelo e feature learning-outcome, weekly renderer, manifesto/package/CI e SDD anteriores inspecionados. Sem feature8 existente. Baseline npm test268 pass/0fail,1682.7705ms. Vanilla PWA, persistência/saveData/rollback/busy atuais. Modelo schema1 já possui archive/reactivate; semanal só KEEP/REVISE. Menor integração: ajuda no editor existente de capacidade ativa, sem mudança no semanal ou modelo.

## Target e contratos

Details outcomeImportancePanel após campo da capacidade, summary Rever importância (opcional). Label Isso continua importante para você? select vazio/yes/partial/no sem name; p role=status aria-live=polite e button type=button oculto no vazio. Mapa estático local de orientação/label. Responder só muda orientação; sem salvar ou registrar metadado. Guard busy/ativo/ID válido em cada ação. Abrir reseta select/summary/status/ação e oculta criação/arquivada. Não entra em outcomeDraftSignature/payload Save.

Continuar chama outcomeClose() existente, preservando timestamps e confirm de discard se draft mudou. Ajustar apenas foco em nextAttempt, nada escrito ou selecionado automaticamente. Arquivar confirma explicitamente; se draft mudou, mensagem informa que mudanças não salvas serão descartadas. Revalidar alvo ativo, chamar outcomeToggleStatus(id) atual e fechar force somente se persistiu. outcomeToggleStatus retorna o boolean de outcomePersist, sem alterar comportamento dos callers existentes. Falha mantém diálogo/draft/resposta e rollback; busy atual desabilita controles e bloqueia cancel/reentrada. Histórico e tentativa preservados pelo modelo existente; reativação permanece card atual.

CSS estática específica: details/grid/minwidth0/wrap/44px/foco3px/cores existentes. Diálogo tem regra genérica mobile !important width100vw; override id com largura percentual !important para respeitar zoom; rodapé estreito empilhado para palavras legíveis. Reusar padrão validado na entrega7. Geração96 somente cacheName; mesma ordem/assets/coleções.

Alternativas rejeitadas: schema de importância (sem necessidade), módulo valores/ranking (fora roadmap), nova tela/novo botão no card (mais escolhas), inferir archive a partir de resposta (remove decisão explícita), adicionar ARCHIVE ao semanal (muda contrato). Sem migração/rede/telemetry/dependências; custo constante3 opções. Rollback após exposição usa geração futura sem apagar conteúdo.

## Manifesto fechado

| Arquivo | Ação/propósito | Aceite | Dependência |
| --- | --- | --- | --- |
| learning-outcome-feature.js | Modificar ajuda/ações/reset e retorno boolean archive | AC01–07 | DEFINE |
| design-system.css | Modificar ajuda/foco/geometria do editor | AC08 | UI |
| app-manifest.js | Modificar cache96 | AC09 | UI/CSS |
| tests/browser/capability-importance-flows.spec.js | Criar testes de aceitação | AC01–08 | UI/CSS/cache |
| docs/capability-first-compasso.md | Modificar uso/limites | AC01–09 | UI |
| .sdd/features/capability-importance-review/DEFINE.md | Criar requisitos/status | todos | roadmap |
| .sdd/features/capability-importance-review/DESIGN.md | Criar design/status | todos | DEFINE |
| .sdd/reports/capability-importance-review/BUILD_REPORT.md | Criar evidência | todos | validação |
| .sdd/archive/capability-importance-review/DEFINE.md | Criar arquivo copy-only | todos | Build concluído |
| .sdd/archive/capability-importance-review/DESIGN.md | Criar arquivo copy-only | todos | Build concluído |
| .sdd/archive/capability-importance-review/BUILD_REPORT.md | Criar arquivo copy-only | todos | Build concluído |
| .sdd/archive/capability-importance-review/SHIPPED.md | Criar arquivo copy-only | todos | Build concluído |

## Ordem e validação

Define→Design→UI/CSS/cache/docs→browser focused novo+learning-outcome anterior→npm run test:all→Build/Ship copy-only→commit/push/novaPR→CI canônico Ubuntu/Node22 no head final. Usuário autoriza processo completo até PR; sem merge/deploy. Sem outras features após8.

AC01–02: fluxo opcional/respostas sem mutação; AC03–05: continue/adjust/archive explícitos e histórico; AC06: falha/retry/busy/alvo obsoleto; AC07: reset/backup/offline IDB/fallback; AC08: native keyboard após CompassoPwaLifecycle.snapshot().coherent, focusassert antes Enter, contraste/targets/bbox/palavras/capturas; AC09: Node manifesto/regressão PWA. Commands reais package npm test/build:test/test:browser/test:all. Focused npx playwright usa dependência existente, --retries=0. Sem lint/typecheck configurados. Baselines não mudam; imagens regeneráveis test-results inspecionadas. CI operacional registrada na descrição da PR para não criar commit após gate. Fontes/arquivo copy-only retidos. Sem promessa de eficácia nem validação física de PWA.

## Ajustes de Build dentro do manifesto

2026-10-04: primeiro focused encontrou4 falhas (dois cenários em cada perfil). CSS genérica tornava visível botão com hidden; regra específica preserva hidden. Design-system classificava botão inicialmente vazio como ícone e acrescentava label Ação: declarar componente button e manter aria-label igual à ação visível. Teste busy chamava função encapsulada indisponível no global; simular reentrada por dispatchEvent de click no controle desabilitado para testar o guard real, sem alterar ativação normal. Nenhuma alteração de escopo/schema. Revalidar focused/capturas após ajustes.

## Iteração R2 — altura em zoom

2026-10-04, Modifying AC08 dentro do manifesto. Captura desktop bodyzoom2 expõe diálogo com altura física maior que viewport; scrollIntoView não apresenta pergunta completa. Aceite visual R1/R2 inicial invalidado. Ajustar max-height do editor para percentual do containing block com id!important, mantendo overflow existente; validar top/bottom e foco do select/ação dentro do viewport com scroll. Reinspecionar quatro capturas e refazer focused após ajuste. DEFINE, dados e demais AC inalterados.

R2 adicional: rodapé sticky cobria parte da ajuda em zoom. Em editor estreito, manter ações em coluna e position static permite scroll/foco sem overlay. Teste usa elementFromPoint no centro do controle focado para provar ausência de obstrução, além de bounding boxes top/bottom; captura zoom registra ação focada, normal registra pergunta completa. Nenhuma dependência/arquivo adicionado.

Revisão final do catálogo de respostas: lookup exige own property, evitando chaves inválidas de Object.prototype; fixture inclui constructor/__proto__. Mesmos AC02/manifesto, sem mudança de produto legítimo. Regressão iniciada foi abortada antes de usar como gate e será executada fresca.
