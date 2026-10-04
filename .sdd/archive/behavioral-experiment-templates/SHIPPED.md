# Templates de Experimentos Comportamentais — Shipped

**Status:** Shipped
**Data:** 2026-10-04
**Entrega:** 7
**Branch/base:** codex/behavioral-experiment-templates / db3fd0760edbdb3d1db665d48beac2a05d2ee86e

## Aceite e evidências

AC01–09 satisfeitos conforme matriz do BUILD_REPORT. Define15/15, Design revision3 e15 arquivos; sem desvios de escopo. `npm run test:all` exit0:268 Node pass/0 fail;466 browser pass,24 skips preexistentes,0 fail/0 flaky,16.8m. Focused28 pass/58.0s sem retries. Capturas desktop/mobile/zoom inspecionadas por Codex; correção geométrica R2 remove corte e mantém rodapé legível. Sem snapshots alterados. CI Ubuntu/Node22 no head final é gate operacional da PR; consultar descrição/Checks para resultado final.

## Dados e limites

Exemplos opcionais só preenchem quatro textos editáveis, sem persistir escolha; salvar continua no modelo/schema1. Capacidade/datas/Session/Evidence intactos. Backup/restore/offline IDB e fallback verificados. Cache95 pelo manifesto, sem novos módulos/dependências/coleções. Não há evidência pessoal nova, eficácia demonstrada ou instalação física PWA observada; autorização explícita do usuário permite entrega7 após Gate2, que foi preservado. Entrega8 excluída.

## Lições

- Aguardar shell coerente antes de afirmar foco/Enter/Space nativos: installed pode coexistir com inert.
- Combinar captura, bounding boxes e medida de palavras; scrollWidth sozinho ocultou corte de diálogo.
- Checar cascata mobile com !important e empilhar rodapé estreito para preservar palavras em zoom.
- Templates limitados ao draft evitam introduzir metadados em histórico/backup.

## Arquivo e próximo passo

Copy-only: Define, Design e Build copiados, statuses Shipped; fontes conservadas. Cópias UTF8 legíveis verificadas. Ship é fechamento SDD; pedido autoriza commit/push/nova PR e verificação CI, sem merge/deploy. Próximo passo válido: revisão da PR após CI canônico verde. Checkout original preservado. Rollback após exposição exige geração posterior e preservação de dados.

## Revalidação R3

CI anterior37188422409 teve268 Node pass e465 browser pass/24 skips/1 flaky,21.2m. O retry em capability-context-flows:149 invalidou estabilidade do aceite de regressão. Iteração R3 adicionou apenas esta fixture ao manifesto: shell coherent, scroll e foco confirmado antes do Enter nativo. Arquivo completo26 pass/1.1m e cenário repetido3 vezes por perfil6 pass/11.9s, ambos sem retries. Produto/schema/DEFINE inalterados; evidência local268/466 continua válida para código inalterado. Novo CI completo no head final é gate operacional, com contadores reais na PR; nenhum sucesso sem retry é presumido antes da conclusão.
