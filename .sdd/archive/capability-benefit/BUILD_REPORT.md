# O que isso destrava? — Build report

**Status:** Shipped
**Data:** 2026-10-02
**Base:** origin/main@3b86fe5, codex/capability-benefit
**Worktree:** C:/Users/Giuse/.codex/worktrees/anti-procrastination-discovery/every-second-counts-app
**Design:** revisão 2; Define 15/15
**Observador:** Codex, Node e Playwright locais em Windows; nenhuma observação física de PWA ou de uso pessoal.

## Resultado implementado

Delivery 4 oferece uma frase opcional de até 240 caracteres no editor existente. Criação começa recolhida; edição com conteúdo abre a seção. O texto aparece secundário no card e na tentativa principal atual de Hoje. Nenhuma ação nova em Hoje ou nova entidade/snapshot.

Capability migra do formato legado não versionado para schemaVersion 1. benefit ausente/vazio/malformado é omitido; conteúdo válido importado longo não é cortado. Comandos explícitos acima do limite falham antes de alterar estado. Prova, futureUse, próxima tentativa, IDs e lifecycle mantêm contratos.

## Manifesto e decisões

- Modelo puro: versão, normalização e create/update; updates que omitem benefit preservam conteúdo.
- Editor: native details, textarea, draft signature, load/reset, erro focado e salvamento candidate-state existente.
- Hoje: projeção no ramo principal atual, escapeHtml, sem persistência/ações.
- CSS estático: wrap, foco e summary com mínimo 44px.
- Manifesto: geração v91 → v92; nenhuma mudança de Service Worker, asset ou coleção.
- Testes: três novos Node de modelo, um de foundation, nove browser em dois projetos; expectativas da forma mínima e do backup de simulação atualizadas para versão explícita.
- Documentação: semântica, proprietário, migração, backup, limites e rollback.
- SDD Define/Design presentes antes de produção; Build/Ship e arquivo copy-only conforme manifesto.

Decisões autônomas dentro do roadmap: limite 240; um único benefit no proprietário Capability; versão local v1 em vez de alterar schema global v3; preservar import longo sem truncar; mostrar somente a tentativa principal atual em Hoje. Gate 1 foi registrado na PR #92 e continuação solicitada depois; não se inventou evidência de eficácia.

## Validação

| Comando / origem | Resultado |
|---|---|
| npm test / package.json, base antes de produção | exit 0; 240 aprovados |
| node --test tests/learning-outcome-model.test.js tests/state-foundation.test.js / testes existentes | exit 0; 42 aprovados |
| npm test / package.json, após implementação | exit 0; 244 aprovados |
| npm run build:test / package.json | exit 0; aplicação recomposta |
| npx playwright test tests/browser/capability-benefit-flows.spec.js tests/browser/learning-outcome-flows.spec.js / config existente | execução final exit 0; 37 aprovados, 1 skip configurado; 38 total |
| npx playwright test tests/browser/capability-benefit-flows.spec.js tests/browser/pressure-simulation-flows.spec.js --grep "teclado, disclosure\|Session, Evidence" / config existente | exit 0; 4 aprovados em desktop/mobile; inclui contraste e contrato v1 corrigido |
| npm run test:all / package.json e CI | execução final exit 0; 244 Node aprovados; 402 browser aprovados, 24 skips configurados, 426 total; browser 16.3 min |
| node --check learning-outcome-model.js, learning-outcome-feature.js, today-feature.js, tests/browser/capability-benefit-flows.spec.js | exit 0 em cada arquivo |
| git diff --check | exit 0; checagem após stage inclui também os arquivos SDD novos |
| Lint/typecheck | Não configurados no repositório |

### Falhas intermediárias e correção

Primeira rodada direcionada interrompida após detectar suposições erradas no teste novo: todayDateKey é privado ao módulo composto, storage.load retorna valor síncrono e DOM de ação principal oculto conserva markup. O teste passou a localizar o plano por referência, aguardar load sem presumir Promise e verificar elementos visíveis. Também substituído settingsDialog inexistente pelo menu real. Nenhuma destas correções mudou comportamento de produção.

A rodada seguinte falhou antes das assertions com net::ERR_EMPTY_RESPONSE: servidor Python residual em 4173 após interrupção. Identificado processo com comando exato de fixture, encerrado somente esse servidor, recomposta a fixture e retomada a configuração oficial. A rodada final direcionada passou. Não se consideram as rodadas interrompidas aprovação.

A captura inicial do editor não incluía o novo campo: ajustado scroll/foco antes da imagem. Codex inspecionou test-results/capability-benefit-editor-chromium.png, capability-benefit-today-chromium.png, capability-benefit-editor-mobile.png e capability-benefit-today-mobile.png: campo/hint/foco legíveis, benefício secundário, sem clipping do texto novo. Imagens locais ignoradas, sem atualização de baselines.

Primeira suíte completa interrompida após falha repetida em pressure-simulation-flows.spec.js: expectativa exata omitia o schemaVersion 1 aprovado. Design iterado para R2 antes de editar esse arquivo; requisitos e produção não mudaram. A evidência dessa rodada não aprova a suite. A retomada completa passou sobre os testes corrigidos, incluindo contraste, com exit 0 e nenhuma falha ou flaky.

## Matriz de aceitação

| AC | Resultado | Evidência |
|---|---|---|
| 01 | PASS | Browser opção cria/edita/limpa e regressão cria forma mínima; modelo mínimo sem benefit |
| 02 | PASS | Browser CRUD preserva tentativa/prova/uso/IDs e escapa markup; Node CRUD/limpeza/arquivo |
| 03 | PASS | Browser Hoje mantém título, sete ações e omite após limpeza; imagem Hoje secundária |
| 04 | PASS | Browser início direto sem cópia em Session/canônico/plano e ausência em estados indisponíveis; Node updates e createExecutionContext |
| 05 | PASS | Node tipos/240/241/atomicidade e texto longo preservado; browser limite/foco e import longo |
| 06 | PASS | Browser Escape detecta draft, confirma descarte/retorna foco; save falho conserva estado real e draft, retry sem duplicação |
| 07 | PASS | Browser export real/restore/reload, backup antigo e import longo; Node v0→v1/idempotência/IDs/timestamps |
| 08 | PASS | Foundation registro vencedor, limpeza explícita, duas frases em conflito e tombstone sem ressurreição |
| 09 | PASS | Browser edição/reload offline em IndexedDB e fallback localStorage; suite PWA completa de install/update/reopen/offline aprovada |
| 10 | PASS | Browser Enter/Tab, label, 44px, 360/390px, zoom 200%, texto ≥4.5:1 e foco ≥3:1; quatro capturas inspecionadas |

## Revisão, limitações e Git

Mudanças de produção revisadas contra manifesto: modelo, editor, Hoje, CSS e geração. Sem alteração de storage/foundation/backup handlers/Session/Recall/Review; contratos genéricos usam normalizador. Sem atualização de snapshots esperados, dependências, AI, rede ou telemetria. CRLF preservado nos arquivos tocados.

Riscos: eficácia não observada; cliente anterior pode descartar campo em edição (atualizar clientes e conservar backup); rollback após exposição precisa de geração futura e leitor compatível; conteúdo importado longo precisa ser encurtado antes de salvar edição explícita de benefit. Instalação física não executada; automação do SW não é essa observação.

Git no momento de fechamento SDD: fetch e criação de branch sobre main mesclada; nenhuma operação no checkout original, commit/push/merge/deploy ainda não realizados. Pedido “até a próxima PR” autoriza commit/push/PR na etapa seguinte. Todos os critérios e a suite completa aprovados; sem bloqueadores. Ship usa arquivo copy-only, conservando documentos de trabalho.
