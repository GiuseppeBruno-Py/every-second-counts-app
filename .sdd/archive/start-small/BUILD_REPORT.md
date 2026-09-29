# Start Small — Build Report

**Delivery:** 2 — compromisso inicial de cinco minutos
**Status:** Shipped
**Branch:** `codex/start-small`
**Base:** `origin/main@da02a7a`
**DEFINE:** `.sdd/features/start-small/DEFINE.md` (15/15)
**DESIGN:** `.sdd/features/start-small/DESIGN.md` (revisão 2)

## Implementação

Hoje oferece **Começar por 5 min** somente na tentativa principal atual de Capability. O comando reutiliza a criação e a persistência da Session normal; apenas a fonte escolhida recebe `startSmall` e a projeção canônica existente recebe `plannedMinutes: 5`. Não há outro cronômetro, rota ou coleção.

O modelo de timer limita o tempo efetivo a 300.000 ms enquanto a decisão está pendente, inclusive após suspensão, refresh e reabertura. Continuar remove do tempo contabilizado a espera após o marco e preserva o ID. Encerrar usa o fluxo normal de Evidence; cancelar devolve a decisão. Ajustar pausa de forma durável e abre o editor atual, sem reescrever o snapshot da Session. Quando a Capability não está disponível, o painel explica a falha e mantém continuar/encerrar. Erros de gravação restauram o estado anterior e permitem retry.

Arquivos de produção alterados: `session-timer-model.js`, `sessions-feature.js`, `execution-session-model.js`, `today-feature.js`, `session-companion-feature.js`, `design-system.css` e `app-manifest.js`. A geração de cache avançou de v89 para v90; a lista existente já inclui os assets alterados. `manifest.webmanifest` foi revisado e não exige alteração. Testes Node e browser, documentação e SDD completam o manifesto fechado do DESIGN. A revisão 2 do DESIGN incluiu a atualização necessária da asserção de ações de Hoje no teste de Attempt Rehearsal; nenhum outro arquivo de produto foi acrescentado.

## Validação executada

| Comando | Resultado |
|---|---|
| `npm test` na base, antes da edição | PASS, 234/234. |
| `node --check` nos cinco módulos JS alterados e na nova spec | PASS. |
| `npm test` após a edição | PASS, 238/238. |
| `npm run build:test` | PASS; fixture de navegador recomposto após alterações no produto. |
| `npx playwright test tests/browser/start-small-flows.spec.js tests/browser/attempt-rehearsal-flows.spec.js` | PASS, 44/44 nas duas configurações antes de adicionar o caso de Capability indisponível. |
| `npx playwright test tests/browser/start-small-flows.spec.js --grep 'Capability indisponível'` | PASS, 2/2 em desktop e mobile. |
| `npm run test:browser` | PASS, 362 aprovados e 24 skips configurados, 386 casos no total, 13,2 min. Inclui os 16 casos Start Small, regressão de Attempt Rehearsal, fluxos existentes de Session/Evidence e ciclo PWA em Chromium. |
| `git diff --check` | PASS, sem erros. |

Na primeira execução dirigida da nova spec, o fixture de teste estava desatualizado e o helper chamava uma função privada. O helper passou a usar a migração pública do modelo canônico; o fixture foi recomposto antes da reexecução. Dois casos ainda apontaram um erro real de foco no painel e um botão de exportação oculto no teste. O painel foi corrigido e o teste passou a abrir Configurações antes de exportar. Todos os casos afetados passaram na execução dirigida e na suíte integral posterior. Não há comando de lint ou typecheck configurado em `package.json`.

## Aceitação

| Critério | Evidência observada |
|---|---|
| AC-01 | Spec browser verifica ação secundária junto de início, ensaio e configuração; regressão de Attempt Rehearsal confirma ordem e início direto. A ação aparece apenas na tentativa principal válida. |
| AC-02 | Browser confirma uma Session v2, ID, vínculo da tentativa, `startSmall` e projeção canônica de cinco minutos; erro de criação não promove estado. Teste Node confirma projeção idempotente. |
| AC-03 | Teste puro verifica avanço antes do marco e pausa que adia a decisão; browser verifica painel ausente aos quatro minutos. |
| AC-04 | Teste puro verifica limite de cinco minutos; browser mostra decisão e `05:00` após simulação de sete minutos e depois de refresh. |
| AC-05 | Browser confirma escolha persistida, mesmo ID, tempo crescente após o marco e ausência do painel após refresh; Node verifica compensação do excesso. |
| AC-06 | Browser confirma congelamento em 300.000 ms, cancelamento com retorno do painel, conclusão e Evidence ligada à mesma Session. |
| AC-07 | Browser confirma pausa durável, abertura do editor, salvamento explícito e snapshot original; outro caso cobre Capability indisponível e continuidade possível. |
| AC-08 | Browser simula falha de gravação no início e na decisão, verifica erro/foco, estado anterior e retry. |
| AC-09 | Node e browser verificam Session direta e registro v1 sem limite ou decisão; regressão completa preserva fluxos existentes. |
| AC-10 | Browser verifica marcador e decisão em fallback localStorage, reload offline e backup JSON; testes existentes de backup/restore e estado legado passam na suíte completa. |
| AC-11 | Browser desktop/mobile verifica nomes acessíveis, teclado, foco, alvos de 44 px, 360 px e zoom de 200% sem overflow. |
| AC-12 | `app-manifest.js` usa v90; testes de manifesto, composição, atualização real de Service Worker e reabertura offline passaram na suíte completa. |

## Revisão, compatibilidade e limites

O diff segue o manifesto do DESIGN revisado. A fonte `sessions[]` adiciona um marcador opcional; v1 e v2 sem marcador continuam ilimitadas. Estado global `compasso.state.v3`, IndexedDB, fallback, backup, sincronização, tombstones, score e Evidence permanecem nos contratos existentes. O fechamento por SDD será por cópia, mantendo os arquivos de trabalho.

Os testes automatizados verificam o ciclo de Service Worker e reabertura offline, mas não observam uma PWA fisicamente instalada em dispositivo do usuário. Depois que v90 for distribuído, um rollback do shell exigirá uma geração de cache posterior que preserve os dados locais. Não houve deploy nem merge neste Build. **Build PASS — Ready for Ship.**
