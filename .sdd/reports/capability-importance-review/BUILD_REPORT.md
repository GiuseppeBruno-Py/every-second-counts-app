# Revisão mínima de importância — Build

**Status:** Complete (Built; operational CI pending)
**Data:**2026-10-04
**Worktree:**C:/Users/Giuse/.codex/worktrees/anti-procrastination-discovery/every-second-counts-app
**Branch/base:**codex/capability-importance-review /386072d40970980c7d85f259cf8be4734d64a03e (PR96 mesclada)
**Design:**Revision3, manifesto12 arquivos. Sem mudanças fora do manifesto.

## Entendimento e implementação

Entrega8: revisão opcional no editor de capacidade ativa. Details recolhido pergunta Isso continua importante para você? com Sim/Parcialmente/Não e orientações. Seleção transitória, sem name no payload, sem nova coleção/schema/modelo/tela. Não há importância inferida ou persistida. Criar/arquivada ocultam ajuda, reabrir/reload limpa resposta. Continuar usa outcomeClose/discard existente, sem timestamps alterados; Ajustar focaliza nextAttempt sem alterar valor; Arquivar exige confirmação explícita, informa descarte do draft e usa outcomeToggleStatus/archive atual. A função de status agora devolve boolean persistido para só fechar no sucesso. Falha mantém modal/draft/resposta para retry; busy atual e guards impedem reentrada e ação em alvo ausente/arquivado. Reativar permanece no card existente.

CSS específica e estática, hidden respeitado, botão identificado como button no design system e aria-label corresponde ao texto atual. Largura e altura percentuais do editor superam regra mobile !important com vw/dvh; rodapé estreito em coluna/static evita overlay em zoom. Manifesto somente cache95→96, módulos/assets/coleções intactos. docs capability-first explicam uso, compatibilidade e limites.

## Aceite e evidência

| Aceite | Evidência |
| --- | --- |
|AC01|Ajuda recolhida em edição ativa, oculta criar/arquivada; arquivo learning-outcome anterior valida edição mínima e fluxos convencionais|
|AC02|Três respostas produzem ação/nome acessível e orientação sem mutar estado; vazio/ID inválido não habilitam ação|
|AC03|Continuar sem mudança preserva registro completo/timestamps; draft alterado pede descarte e dismiss mantém formulário|
|AC04|Ajustar só foco/valor intacto; edição/save atual schema1 sem metadata; Session/Evidence inalterados|
|AC05|Confirmação dismiss nada grava; aceitar informa discard e preserva tentativa antiga; archive/reactivate existentes|
|AC06|Persistência false conserva estado/resposta; Promise save em voo bloqueia Escape/ação; dispatch reentrada não duplica save; alvo archived/removido não reativa/cria|
|AC07|Reopen/reload reset; backup export/import e offline adjustment/archive/reload em IDB e fallback; testes antigos validam referência/histórico|
|AC08|Enter/Space nativos após shell coherent e foco confirmado, labels, contraste4.5/foco3/44px/reduced motion; bbox x/y/dialog e palavras monospace16 em360/bodyzoom2; elementFromPoint prova foco não coberto;4 capturas finais inspecionadas por Codex|
|AC09|Manifesto atual e regressão Node/PWA, geração96; docs registram escopo8 e falta de evidência pessoal|

## Testes e falhas

- Baseline `npm test`: exit0,268 pass/0 fail,1682.7705ms.
- `npm run build:test`: exit0.
- Primeiro `npx playwright test tests/browser/capability-importance-flows.spec.js tests/browser/learning-outcome-flows.spec.js --retries=0`:4 falhas,31 pass,1 skip preexistente,1.4m. CSS hidden foi vencido pela classe de botão e fixture invocou função encapsulada não global. Corrigidos dentro do manifesto; sem suppress/timeout/retry adicional. Turno interrompido pela mensagem continue; processo terminou com os contadores acima, mas exit do primeiro processo não foi preservado. Não usar como gate.
- Segundo focused: exit0,35 pass/1 skip preexistente,1.2m. Inspeção invalidou AC08 por altura cortada em zoom; implementação/evidência alteradas durante fim da rodada, usar focused final fresco.
- A11y isolado após Design R2/altura e footer static: `npx playwright test tests/browser/capability-importance-flows.spec.js --grep "native keyboard" --retries=0`, exit0,2 pass/0 fail,7.0s.
- Focused final exit0:35 pass/1 skip preexistente/0 fail/0 flaky,1.1m; TEMP compasso-importance-focused-r3.log/exit.txt.
- `npm run test:all`: exit0,268 Node pass/0 fail (787.251ms),482 browser pass/24 skips preexistentes/0 fail/0 flaky (19.1m) (TEMP compasso-importance-final-r4.log/exit.txt). Sem lint/typecheck configurados; commands do package.json e CI .github/workflows/browser-tests.yml inspecionados.
- CI canônico Ubuntu/Node22 será verificado no head final e registrado na PR, sem commit documental após gate.

## Compatibilidade e limitações

Sem migração/schema novo ou coleta remota. Arquivamento preserva nextAttempt/history e pode ser revertido por reativação. Resposta não é decisão gravada ou score. Dados do checkout original preservados; worktree reutilizado isolado e limpo na base. Arquivo copy-only mantém working artifacts. Nenhuma instalação física PWA ou eficácia comportamental observada; fontes são automação/capturas Codex, não relatos pessoais. Delivery8 completa implementação do roadmap original; utilidade real/simplificação continuam dependentes de observação. Gate2 anterior preservado; usuário explicitamente autorizou esta entrega até PR, não merge/deploy.

## Lições

1. Botão inicialmente vazio precisa metadata explícita; design system podia inferir ícone/label Ação e manter nome errado após texto mudar.
2. hidden pode perder para CSS de componentes; verificar visibilidade real, não só atributo.
3. Geometria x não basta: altura dvh herdada em zoom e sticky footer ocultam controles. Bounding boxes y e elementFromPoint detectam obstrução.
4. Testar reentrada por evento do controle, sem depender de função global que o módulo encapsula.

## Fechamento

AC01–09 satisfeitos, Define15/15, Design Revision2/manifesto12 arquivos comparados ao diff; evidência final-r4 aprovada. Build/Ship copy-only conserva fontes. Diff/staged check e arquivos UTF8/CRLF conferidos antes de commit. Pedido autoriza commit/push/PR e CI canônico no head final; resultado operacional será registrado na PR. Sem merge/deploy.

Revisão final: lookup das respostas exige own property; fixture verifica invalid/constructor/__proto__. Ensaio específico `npx playwright test tests/browser/capability-importance-flows.spec.js --grep "optional answers" --retries=0` exit0,2 pass/0 fail,8.2s. Regressão inicial iniciada após focused foi abortada antes do gate para executar esta correção; runner/log/exit final-r4 são novos. Somente árvore do processo de teste identificado encerrada; sem limpeza de dados.

## Reabertura por CI — 2026-10-05

CI37241665144 em dfbba31 falhou:268 Node pass/0 fail;480 browser pass/24 skips/2 fail,22.3m; AC08 largura em zoom falhou nos dois perfis e retries (94px disponíveis versus96.328125px exigidos). Fechamento anterior e evidência AC08 Linux invalidados. Design R3 limita correção ao padding interno da ajuda em tela estreita; focused/capturas/CI final pendentes. Requisitos e demais evidências preservados como histórico, sem falsa conclusão verde.

## Validação R3 e fechamento local

2026-10-05: correção exclusiva do padding-inline da body da ajuda, .25rem em max-width480px; preservados teste/assertion, fonte, alvo44 e demais fluxos. `npm run build:test` exit0; `npx playwright test tests/browser/capability-importance-flows.spec.js tests/browser/learning-outcome-flows.spec.js --retries=0` exit0:35 pass/1 skip preexistente/0 fail/0 flaky,1.2m. AC08 local revalidado; quatro capturas regeneradas inspecionadas por Codex. AC01–07/09 permanecem cobertos pelo focused fresco e contratos de full-r4; full-r4 é histórico do head anterior, não suíte completa desta correção. A única mudança de produto após dfbba31 é uma regra CSS no manifesto. CI canônico `npm run test:all` Linux no novo head continua gate operacional da PR, com resultado/link na descrição/Checks; nenhuma alegação de CI aprovada antes do resultado. Fechamento SDD local copy-only, sem merge/deploy. Lição adicional: métricas de fonte variam entre Windows e Linux; manter assertion de palavra e corrigir espaço real, não aumentar tolerância.
