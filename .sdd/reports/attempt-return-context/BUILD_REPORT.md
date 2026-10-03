# Retornos da tentativa ao plano — Build report

**Status:** R5 locally verified; remote closure tracked in PR #94
**Data:** 2026-10-02
**Design:** revisão 5 (R4 histórica preservada)
**Repository:** GiuseppeBruno-Py/every-second-counts-app
**Worktree:** C:/Users/Giuse/.codex/worktrees/anti-procrastination-discovery/every-second-counts-app
**Inspeção:** AGENTS.md raiz, README, docs Today/Capability, Gate 1, modelos/editor/Session/Ritual/foundation, manifesto/package/CI e testes. Sem .codegraph no checkout.
**Branch/base:** codex/attempt-return-context / origin/main@9bb97c3

## Implementação e revisão

Selector puro no modelo de contexto; native details condicional em Hoje; roteamento revalidado para os auxiliares, benefício e configuração/Ritual existentes; dismissal e foco por visita. CSS estático, geração de cache v93, docs e testes específicos. Nenhum schema, coleção, snapshot, algoritmo de merge ou salvamento novo. Sem dependencia/telemetria/rede. Revisão confrontou diff com manifesto e critérios, sem arquivos extras.

Os registros sustentam apenas retorno ao plano sem conclusão marcada. Exigir dias, IDs e versão da tentativa evita união de edições e cópias. Conclusões ou execuções vinculadas suprimem conservadoramente, mesmo antigas; conflitos históricos relevantes também. Dados fora do app são desconhecidos. Limiar de três dias/14 dias é opção reversível de produto, sem validação comportamental.

## Evidência já obtida

- Baseline npm test: 244 PASS, 0 FAIL.
- node --test tests/attempt-return-context.test.js: 11 PASS, 0 FAIL. Dias/IDs/janela, timestamps, mudanças/reversão, conclusão, três coleções de execução, conflitos e imutabilidade.
- npm run build:test seguido de npx playwright test tests/browser/attempt-return-context-flows.spec.js --retries=0: 20 PASS (10 cenários x desktop/mobile), 0 FAIL, 52.2s.
- node --check capability-context-model.js, today-feature.js, learning-outcome-feature.js e app-manifest.js: PASS.
- Inspeção Codex das capturas desktop/mobile e zoom200% R4: hierarquia, disclosure aberto, copy e botões legíveis; foco visível. Checks browser de labels/campo correto, 44px, contraste texto >=4.5/foco >=3, 360px/zoom 200% e reduced motion passam. Capturas são artefatos ignorados em test-results/; instalação física PWA e experiência pessoal não alegadas.

## Defeitos resolvidos, sem ocultar runs falhos

Primeira rodada browser: 20 FAIL no setup por chamada privada saveData. Fixture corrigida para CompassoStorage.save. Rodada desktop seguinte: 5 PASS/5 FAIL (seletor Cancelar ambíguo, foco Session, navegação com seletor legado, registro canônico incompleto, foco Escape); fixture e R2 corrigiram contratos. Próxima: 8 PASS/2 FAIL (seletor nav e _sync ausente na fixture). Rodada desktop/mobile seguinte: 18 PASS/2 FAIL revelando vista sem rerender; Design R3 e Today corrigidos. Rodada focada R3: 20 PASS/0 FAIL (52.2s). Inspeção posterior em zoom detectou legibilidade insuficiente, apesar de overflow passar. Run npm run test:all inicial interrompido (exit 1) após Node 255 PASS, durante browser, para recompor R4; não é evidência de aprovação final. R4 inicial: 18 PASS/2 FAIL no novo check de largura; padding condicional do cartão resolveu. Checagem focada de teclado/visual final: 2 PASS/0 FAIL (7.1s), com novas capturas ampliadas inspecionadas por Codex; rótulos quebram por palavras. Suite canônica reiniciada integralmente. Nenhuma rodada parcial foi tratada como suite completa aprovada.

## Matriz de aceitação

| AC | Evidência |
|---|---|
| 01 | Node contexto determinístico/imutável; browser leitura/copy/disclosure/seis opções/sete ações |
| 02 | Node limiar/janela/dias/IDs/campos/conflitos; browser few/malformed/copied/conflict |
| 03 | Node edição/reversão/versão nova/conclusão/execuções/arquivamento; browser supressão e início confirmado |
| 04 | Browser quatro atalhos/foco/Cancelar/Escape/modal ocupado, aplicar+salvar, benefício rollback+retry |
| 05 | Browser Ritual focado/seleção/check/cancel sem writes, início cria uma execução e suprime |
| 06 | Browser manter/rerender/foco/retorno de vista/stale, offline reload reavalia |
| 07 | Browser desktop/mobile teclado, foco, 44px, contraste, viewport360, zoom200%, reduced motion; capturas Codex |
| 08 | Browser download backup -> restore -> offline reload IndexedDB/fallback; suites existentes de merge/restore/PWA também PASS no run completo |

## Validação R4 local (histórica)

npm run test:all: **exit 0**. Node: **255 PASS, 0 FAIL, 0 SKIP**. Browser: **422 PASS, 0 FAIL, 24 SKIP configurados**, 446 casos desktop/mobile, 16.1m. Inclui os 20 cenários novos na versão final R4. Nenhum skip novo ou exceção de aprovação. Todos os AC acima satisfeitos. git diff --check PASS; revisão de manifesto: 16 arquivos previstos, nenhum extra. Log de execução no diretório TEMP do host: compasso-attempt-return-test-all.log. Sem lint/typecheck configurados.

## Impactos, limites e próxima fase

Sem migração/perda de dados; export/restore/offline continuam proprietários. Falsos negativos por registros insuficientes, execução anterior/conflitos/fuso são intencionais. Não classificar procrastinação nem inferir eficácia. Rollback usa geração futura sem apagar dados. Gate 1 intacto; Delivery 6/7 fora desta PR. Ship técnico verificado e arquivos copiados para archive, preservando fontes. Commit/push/PR autorizados pelo pedido e executados depois deste gate; estado Git final informado no handoff. Próxima etapa: revisão da PR. Nenhum merge/deploy neste fluxo.

## R5 — CI invalida o fechamento global

GitHub run 37051428940: Node 255 PASS; browser 420 PASS/2 FAIL/24 SKIP, 19.0m. Falhas de legibilidade desktop/mobile em Ubuntu: esperado >=81.5390625px, recebido72px. O PASS local R4 permanece observação verdadeira do Windows, mas não fecha AC-07/08 no CI. Status reaberto; Design R5 autoriza correção CSS e teste de métricas mais largas. Novo resultado local e execução canônica no commit exato serão registrados; dados/contratos inalterados.

## Correção R5 e evidência do checkpoint antes do push

Causa: o seletor global :is(#todayView, ...) button tem maior prioridade que .today-attempt-return-actions button. O padding efetivo era 12px por lado, ignorando os 4px previstos na regra mobile. #todayView .today-attempt-return-actions button aplica os 4px somente ao componente em <=480px e recupera 16px de espaço textual. Nenhuma redução de fonte, tolerância nova, skip, workflow ou dependência alterados. A proposta inicial de zerar padding da vista foi removida: notebook já tinha padding zero e essa mudança era redundante.

- Reprodução com monospace16px: 2 FAIL (palavra 87.96875px, espaço72px), antes da correção.
- Primeiro ajuste da vista: 18 PASS/2 FAIL (55.5s). Diagnóstico de estilos computados confirmou padding12px dos botões; nenhuma evidência parcial foi aceita como fechamento.
- npm test: exit0, 255 PASS/0 FAIL/0 SKIP, 1.25s. Módulos JS de produção inalterados.
- npm run build:test + Playwright somente teclado após correção: exit0, 2 PASS, 7.6s.
- npx playwright test tests/browser/attempt-return-context-flows.spec.js --retries=0: exit0, 20 PASS/0 FAIL, 1.0m. Todos os seis rótulos medidos com fonte computada e monospace16px; foco, contraste, 44px, 360px/zoom200%, cancelamento, stale, backup/restore/offline em IndexedDB e fallback preservados.
- Capturas R5 desktop/mobile e zoom200% inspecionadas por Codex em test-results/: rótulos quebram por palavras, inclusive com fonte mais larga. Sem alegação de instalação física PWA.
- Diff de produção: um seletor CSS; teste reforçado e documentação SDD R5 dentro do manifesto original. Schema, cache candidato v93, dados e requisitos intactos. Sem lint/typecheck configurados.

AC-01–06: evidência Node e browser local válida. AC-07/08: nova evidência focada local válida; aprovação canônica externa exige npm run test:all no Ubuntu/Node22 do GitHub no novo head. Este é o checkpoint antes do push. O link do run, SHA e resultado canônico serão registrados na [PR #94](https://github.com/GiuseppeBruno-Py/every-second-counts-app/pull/94) após conclusão, evitando registrar execução futura como PASS. Fontes preservadas e cópias atualizadas; sem merge/deploy. Próxima ação: publicar a correção na mesma branch e concluir esse gate remoto antes do handoff.
