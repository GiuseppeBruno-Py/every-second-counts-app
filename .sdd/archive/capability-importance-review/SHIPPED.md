# Revisão mínima de importância — Shipped

**Status:** Shipped
**Data:**2026-10-04
**Entrega:**8 (última do roadmap original)
**Branch/base:**codex/capability-importance-review /386072d40970980c7d85f259cf8be4734d64a03e

## Aceite e validação

AC01–09 satisfeitos na matriz do BUILD_REPORT. Define15/15 e Design Revision2, manifesto12 arquivos conferidos sem desvios. `npm run test:all` exit0:268 Node pass/0 fail,787.251ms;482 browser pass/24 skips preexistentes/0 fail/0 flaky,19.1m. Focused final35 pass/1 skip preexistente/1.1m sem retries; testes pontuais2+2 passaram após correções de geometria e resposta inválida. Quatro capturas desktop/mobile/zoom inspecionadas por Codex; layout não mudou após guard own-property final. CI canônico Ubuntu/Node22 no head da PR é gate operacional; resultado final e link na descrição/Checks, sem commit documental após CI.

## Escopo, dados e limites

Ajuda opcional recolhida apenas em edição ativa. Sim/Parcialmente/Não não persistem nem inferem decisão; continuar/ajustar/arquivar exigem ação explícita. Continue/discard, save, archive/reactivate e rollback existentes reutilizados. Sem nova entidade/campo/schema/modelo/tela/ranking/score. Capacidade schema1/nextAttempt/history/Session/Evidence intactos; backup/restore/offline IDB e fallback verificados. Manifesto cache96, mesma lista de módulos/assets/coleções. Rollback após exposição exige geração futura sem apagar dados.

Entrega8 autorizada pelo usuário após escopo apresentado; Gate2 preservado, sem nova evidência pessoal de utilidade ou eficácia. Não se alega instalação física de PWA. Implementação do roadmap termina nesta entrega; observação real pode indicar simplificações, não nova feature automática. Original checkout com trabalho não rastreado preservado. Nenhum merge/deploy autorizado ou realizado.

## Lições

1. Botão vazio pode ser inferido como icon-button; metadata e nome acessível explícitos preservam significado após troca de texto.
2. Atributo hidden exige validação da visibilidade real quando CSS de componentes define display.
3. Zoom deve verificar largura, altura e foco sem overlay; sticky footer estreito ocultava controles apesar de scrollWidth válido.
4. Resposta deve orientar, nunca substituir confirmação de decisão; isso permite manter schema e comportamento histórico.

## Arquivo e próximo passo

Copy-only: Define/Design/Build legíveis copiados com status Shipped, fontes mantidas. Pedido até próxima PR autoriza commit/push/PR/CI; Ship não implica merge/deploy. Próximo passo válido: revisar a PR após CI final aprovado. Sem outras entregas de implementação no roadmap original.
