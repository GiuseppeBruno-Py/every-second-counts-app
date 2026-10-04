# Revisão semanal de fricção — Shipped

**Status:** Shipped
**Data:** 2026-10-03
**Entrega:** Delivery 6 e Gate2
**Base:** origin/main@e842fe2dfb493b0b01051d5d2b42af1d68977626
**Branch:** codex/weekly-friction-review
**Worktree:** C:/Users/Giuse/.codex/worktrees/anti-procrastination-discovery/every-second-counts-app

## Aceitação e Design

AC01–10 aceitos conforme matriz e evidência do BUILD_REPORT. Manifesto15/15 arquivos, sem desvio externo; DESIGN R3 registra proteção de rascunhos/reentrada/referência atual e correção final de acessibilidade. Fontes mantidas, arquivo copy-only com DEFINE/DESIGN/BUILD_REPORT legíveis. Nenhuma limpeza de outras features/worktrees.

Regressão local `npm run test:all`: Node262 pass, browser450 pass,24 skips existentes,0 fail,exit0 (16.7m). Após correção estreita de aria-invalid, fixture recomposto e focused38 pass/0 fail, sem retries (59.2s). Demais evidências permanecem aplicáveis. Codex executou testes e inspecionou capturas desktop/mobile/zoom; nenhuma instalação física PWA nem eficácia pessoal é alegada.

## Impacto e limites

Autorrelato opcional no fechamento atual, saída em bloqueios/decisão e revisão explícita de nextAttempt. Sem entidade/schema/coleção/dependência nova; backup/IndexedDB/fallback/offline preservados. Cache pertence ao manifesto com geração94; rollback exposto precisa de geração futura. Cabecalho/navegação global ampliados em zoom são comportamento preexistente; esta entrega valida controles da ajuda, não uma auditoria visual integral.

Gate2 recomenda observar utilidade e complexidade em uso real antes de Delivery7/8. Nenhuma dessas entregas iniciada. Próximo passo: PR e CI canônico do head publicado, depois revisão/observação. SDD Ship não significa merge/deploy; autorização do usuário cobre commit/push/PR, não merge/deploy.

## Lições

1. saveData renderiza o candidato antes de aguardar armazenamento; capturar draft completo e travar reentrada antes de persistir, deixando rollback recuperar o rascunho.
2. Uma capacidade pode aparecer por tentativa histórica; seleção explícita deve usar identidade atual sem reescrever o evento antigo.
3. Em zoom, scrollWidth com clip não prova legibilidade: testar palavras com fonte larga e inspecionar capturas nos dois projetos.
4. Após interromper Playwright, um servidor órfão pode continuar como listener sem responder. Validar o erro de navegação e encerrar somente o processo identificado antes de repetir a suite.

## Revalidação R3

CI37152295244 de5592c69: Node262 pass, browser448 pass,24 skips,1 flaky desktop e1 fail mobile; não é gate remoto verde. Trace prova que o shell ainda hidden/inert recebeu tentativa de foco antes do estado coerente. Corrigido somente fixture: aguardar lifecycle coherent e afirmar foco real no summary antes das teclas. Sem mudança de produção, cache, retries, timeouts ou asserções de ativação. Focused local fresco38 pass/0 fail, sem retries (55.2s). Ship local revalidado, com CI canônico do novo head obrigatório para encerrar handoff da PR; seu resultado ficará na PR. Nenhuma alegação antecipada de Linux verde.

5. Módulos instalados não significam shell interativo: testes de foco precisam aguardar o estado coerente do lifecycle, além de confirmar document.activeElement pelo locator.
