# Ensaio da Próxima Tentativa — Build Report

**Delivery:** 3 — Ensaio da Próxima Tentativa
**Status:** PASS — corrective Build (local)
**Review history:** `SHIP_REVIEW.md` invalidated the 2026-09-15 acceptance claim. Sections 9–11 record fresh corrective evidence; repeated Ship remains pending.
**Date:** 2026-09-16
**Branch:** `codex/attempt-rehearsal`
**Baseline:** `origin/main@b7246f48ba8177860041892bbdebd97ac15df7c9`
**Design:** `.sdd/features/attempt-rehearsal/DESIGN.md`

## 1. Resultado

A próxima tentativa principal de uma Capability em Hoje agora oferece **Ensaiar tentativa** como ação secundária, mantendo **Iniciar agora** como ação primária e imediata. Um único diálogo apresenta as quatro perguntas aprovadas e permite cancelar, pular ou começar a Session.

As respostas ficam exclusivamente nos quatro controles DOM. Nenhuma resposta é copiada para `state.data`, Session, execução canônica, Evidence, learningSignal, Capability, nextAttempt, backup JSON, Markdown, logs ou analytics. O rascunho é descartado após sucesso, cancelamento, Escape, reload ou alvo obsoleto; uma falha de persistência conserva o texto apenas na página para retry e restaura o estado anterior.

A Session iniciada pelo ensaio usa o mesmo preparo rápido e o mesmo `learningContext` do início direto. `session.startDefault` permaneceu com seu comportamento anterior; o comando aditivo `session.startDefaultConfirmed` fornece ao caller o resultado transacional necessário para limpar o diálogo somente depois de persistência confirmada.

## 2. Implementação por manifesto

| Caminho | Resultado |
| --- | --- |
| `today-feature.js` | Ação secundária, diálogo único, runtime sem conteúdo pessoal, revalidação outcome/attempt/plan ref, descarte e retry. |
| `sessions-feature.js` | Preparo default compartilhado e comando confirmado sem alterar o comando imediato. |
| `design-system.css` | Integração completa com o tema caderno, foco, drawer móvel, targets e reflow. |
| `app-manifest.js` | Geração avançada uma vez, de v82 para `compasso-pages-v83`. |
| `docs/today-feature.md` | Uso, efemeridade, hierarquia e falhas documentados. |
| `docs/sessions-feature.md` | Equivalência e limite transacional do comando confirmado documentados. |
| `docs/capability-first-compasso.md` | Ensaio incorporado ao ciclo sem novo proprietário durável. |
| `tests/today-central-contract.test.js` | Hierarquia, quatro prompts e ausência de domínio persistido fixados. |
| `tests/execution-session-contract.test.js` | Contratos antigo e confirmado fixados. |
| `tests/app-manifest.test.js` | Geração v83 exigida. |
| `tests/browser/attempt-rehearsal-flows.spec.js` | 6 cenários funcionais em desktop e mobile. |
| `tests/browser/design-system-flows.spec.js` | Semântica, foco, Escape, contenção, toque e zoom. |
| `tests/browser/pwa-lifecycle-flows.spec.js` | Preflight efêmero e Session canônica durável offline. |

Manifesto fechado: **13/13 caminhos de produto/documentação/teste**, sem arquivo extra. Este relatório e as atualizações de status SDD são os únicos artefatos adicionais permitidos pelo Design.

## 3. Decisões e compatibilidade

- Schema permanece `compasso.state.v3`; nenhuma migration, collection, store ou chave foi criada.
- IndexedDB primário e fallback localStorage continuam recebendo apenas a Session normal existente.
- Backup/restore JSON e Markdown/vault não conhecem o ensaio, por construção.
- Service Worker não foi alterado; o manifesto continua sendo o proprietário da geração e dos assets.
- Outros domínios e itens secundários de Hoje não recebem a ação de ensaio.
- Uma execução ativa mantém precedência e impede criação concorrente.
- Capability/tentativa/plano são revalidados imediatamente antes do início; nenhum alvo semelhante é inferido.
- O Evidence Recall permanece abaixo das ações e independente do conteúdo ensaiado.

Durante a implementação, módulos legados que reatribuem `createSession` mostraram que a referência global mutável perde argumentos e retorno assíncrono. O comando confirmado foi ligado à mesma referência estável já usada pelo formulário de Session. Isso preserva o caminho existente e evita refatoração fora do manifesto.

## 4. Critérios de aceitação históricos — invalidados por Ship

| Grupo | Cenários | Evidência | Resultado |
| --- | --- | --- | --- |
| Início e hierarquia | AC-01, AC-02, AC-04, AC-05, AC-16 | Início direto, ação secundária, quatro prompts, vazio/parcial e skip nos specs dedicado e de design system. | PASS |
| Efemeridade e privacidade | AC-03, AC-06, AC-09, AC-15 | Comparação de estado/storage, busca dos marcadores em todo `state.data`, reload e reabertura vazia. | PASS |
| Cancelamento e falhas | AC-07, AC-08, AC-11 | Cancelar/Escape com retorno de foco; storage duplamente falho com rollback, erro focado e retry. | PASS |
| Revalidação e concorrência | AC-12, AC-13, AC-14 | Tentativa obsoleta/indisponível e Session concorrente não criam novo registro nem substituem alvo. | PASS |
| Durabilidade normal | AC-10, AC-17 | Session confirmada sobrevive a reload; suites de estado, backup/restore e storage permanecem verdes. | PASS |
| Offline/PWA | AC-18 | Shell controlado abre, descarta preflight em reload, inicia Session offline e a retoma após reload. | PASS |
| Mobile e acessibilidade | AC-19, AC-20 | 360–390 px, 200% zoom, targets de 44 px, labels, Tab, foco visível, Escape e inspeção visual. | PASS |
| Limite de escopo | AC-21 | Ausência do controle em Study e demais estados; suites de regressão completas. | PASS |

**Aceitação completa anterior (21/21 PASS) invalidada em 2026-09-16.** O descarte ao navegar falha, o rodapé não segue o Design mobile e algumas afirmações de cobertura não correspondem às ações executadas pelo spec. Ver matriz individual em `SHIP_REVIEW.md`.

## 5. Evidência de testes histórica — Build de 2026-09-15

### Baseline antes da Build

- `npm test`: **216 passed, 0 failed, 0 skipped**.
- Browser focado do DEFINE: **50 passed, 0 failed, 14 skips condicionais**.

### Red-green e checks focados

- Contratos inicialmente adicionados antes da produção: **16 passed, 3 failed**, confirmando os gaps esperados.
- Contratos após implementação: **19 passed, 0 failed**.
- Spec funcional dedicado em Chromium: **6 passed**.
- Spec funcional + acessibilidade em Chromium/mobile: **14 passed**.
- PWA offline dedicado: **1 passed**.
- Checks `node --check` de Today, Sessions e specs modificados: PASS.
- `git diff --check`: PASS; apenas avisos de conversão LF/CRLF do ambiente Windows.

### Gate canônico completo

Comando: `npm run test:all`

- Node: **218 passed, 0 failed, 0 skipped**.
- Browser: **254 passed, 0 failed, 24 skips condicionais**.
- Total executado com sucesso: **472 testes**.

Depois da correção visual estritamente escopada, foram repetidos:

- `npm test`: **218 passed, 0 failed**.
- Fluxo dedicado + contrato visual em desktop/mobile: **14 passed, 0 failed**.
- `git diff --check`: PASS.

### Inspeção visual

O diálogo foi inspecionado em Chromium nas larguras **360, 390, 768 e 1280 px**. A primeira inspeção encontrou herança incompleta dos tokens do tema caderno; o CSS foi corrigido e as quatro larguras foram reinspecionadas. Resultado final: superfície opaca, hierarquia legível, foco visível, sem overflow horizontal e ações alcançáveis. Em 360 px, o diálogo usa a rolagem interna nativa prevista pelo componente.

## 6. Riscos residuais e limitações conhecidas

- As respostas desaparecem em reload por decisão explícita do produto; não há recuperação de rascunho entre páginas.
- Viewports móveis baixos podem exigir rolagem interna para alcançar as ações, porque as quatro perguntas permanecem em uma única superfície; a rolagem é nativa e testada sem overflow horizontal.
- A validação foi local em Chromium desktop/mobile emulado e no servidor PWA controlado. CI remoto, PWA instalado em dispositivo físico e publicação não foram executados nem reivindicados.
- `npm ci` já havia reportado duas vulnerabilidades high de dependências de desenvolvimento; esta entrega não adiciona dependências e nenhum fix automático fora de escopo foi aplicado.

## 7. Git e publicação

- Nenhum trabalho anterior não relacionado foi sobrescrito.
- Nenhum commit, push, PR, merge, release ou deploy foi realizado.
- Worktree permanece deliberadamente não commitada para o próximo gate humano.

## 8. Conclusão histórica após Ship

**NEEDS REVISION — revisão de Ship encontrou falhas não exercitadas pela suíte anterior.**

Próximo passo: Build corretiva conforme seção 21 do DESIGN, seguida de novo gate de Ship. Delivery 4 (Weekly Review positiva + KEEP) não está liberada.

### Histórico de revisão

- 2026-09-15: relatório inicial e resultados de testes acima.
- 2026-09-16: status e aceitação completa invalidados por Ship; números históricos não foram apagados nem reinterpretados como cobertura dos caminhos ausentes.

## 9. Build corretiva — 2026-09-16

**Validation: PASS — local corrective Build.** A seção 21 do DESIGN foi implementada e a regressão canônica terminou com exit 0. A matriz abaixo substitui a aceitação histórica invalidada somente para Build. O Ship anterior permanece como evidência histórica e exige repetição independente.

### Correção implementada

- `today-feature.js`: invalida e limpa o preflight em `view:changed` fora de Hoje; exclui o opener oculto antes do fechamento. O metadado efêmero `abandoned` conserva a trava de início enquanto a transação pendente resolve, sem respostas no runtime. Sucesso permanece durável; falha não reabre o diálogo ou erro na rota abandonada. O evento `close` conserva a trava pendente, e abrir/submeter novamente não libera um segundo início.
- `design-system.css`: seletor exclusivo de `#todayRehearsalDialog` vence a regra pilot posterior em até 390 px. Footer efetivamente grid de uma coluna, botões na largura interna disponível; outros diálogos não mudam.
- `docs/today-feature.md`: explica navegação/histórico, save pendente e abandono explícito no skip.
- `tests/browser/attempt-rehearsal-flows.spec.js`: 15 cenários por projeto, incluindo navegação/popstate, save pendente com sucesso/falha, skip realmente acionado cheio/vazio com falha/retry, submit vazio/parcial, Capability arquivada/excluída e Session → refresh → retomada → conclusão → Evidence. JSON e Markdown individuais baixados são inspecionados por marcadores.
- `tests/browser/design-system-flows.spec.js`: estilo computado, largura interna descontando padding, posições verticais, labels sem overflow e targets em 360/390; screenshots locais em 360/390/768/1280, mantendo Tab/Escape/zoom.
- `tests/browser/pwa-lifecycle-flows.spec.js`: completa retomada/conclusão/Evidence offline e inspeciona o ZIP Markdown baixado da composição PWA completa.

### Decisões e ajustes de validação

- Nenhuma mudança de requisitos, schema, persistência, Session engine, Service Worker ou manifesto adicional. Candidato local continua v83; não houve consulta ou afirmação de estado remoto.
- A navegação abandona somente a UI. Não cancela o save canônico, não remove uma Session confirmada e não interfere no rollback existente. A apresentação de erro local é suprimida se a superfície tiver sido abandonada.
- A composição browserJourney reduzida não inclui o Vault. O teste individual usa o exportador Markdown existente; o ZIP é exercitado na composição PWA completa. Nenhum módulo foi acrescentado ao manifesto para acomodar o teste.
- Runs intermediários falharam por acesso indevido a símbolos privados no teste, tentativa de usar Vault ausente na fixture reduzida e comparação da largura externa do footer com sua área interna. A ligação dos testes foi corrigida; esses runs não contam como validação aceita.
- A primeira regressão canônica corretiva foi interrompida sem resumo final após reportar o caso browser 145 (exit `1073807364`, sinal de interrupção). Os 218 testes Node haviam passado e nenhum caso browser reportado falhara, mas essa execução não comprova o gate completo; a suíte foi reiniciada integralmente.
- O cenário ponta a ponta com refresh e dois downloads reais recebe timeout local de 60 segundos, sem retry adicionado ou aumento global de timeout.
- O template `templates/BUILD_REPORT_TEMPLATE.md` referenciado pela skill está ausente na instalação local. Este relatório preserva a estrutura existente e os campos exigidos pela skill, sem bloquear a implementação.

### Gates preservados

Sem migration: `compasso.state.v3`, IndexedDB, fallback localStorage, backup/restore e Markdown permanecem nos owners anteriores. Os 13 caminhos do Design continuam sendo o manifesto completo; nenhum arquivo congelado foi modificado. Não houve sobrescrita de trabalho não relacionado, commit, push, PR, merge, archive, release ou deploy.

PWA instalado em aparelho físico, CI remoto/publicação e a repetição de Ship permanecem não executados. Em mobile baixo, o diálogo continua exigindo rolagem interna nativa para acessar todas as quatro perguntas e o footer; não há promessa de que tudo caiba simultaneamente.

## 10. Aceitação corretiva individual

Evidência: A = spec de ensaio Chromium/mobile; D = spec design system; P = composição PWA completa/offline em Chromium; R = regressões existentes executadas no gate canônico; N = contratos Node/source.

| AC | Evidência fresca | Resultado local |
| --- | --- | --- |
| 01 | A/N: início direto primário, sem preflight. | PASS |
| 02 | A/D: um diálogo, quatro labels, campos opcionais. | PASS |
| 03 | A: estado e serialização de storage iguais durante digitação. | PASS |
| 04 | A: submit realmente vazio e parcial, sem validação bloqueante. | PASS |
| 05 | A: botão skip realmente acionado, cheio/vazio, falha com draft vazio e retry. | PASS |
| 06 | A/P: marcadores ausentes em Session/Execution/estado, Evidence, JSON baixado, Markdown individual e ZIP do Vault. | PASS |
| 07 | A: Cancel sem escrita; navegação/histórico fecham e limpam sem foco oculto. | PASS |
| 08 | A/D: Escape descarta e devolve foco. | PASS |
| 09 | A/P: reload pré-início elimina draft e não cria Session. | PASS |
| 10 | A/P: Session confirmada sobrevive a refresh e permite retomada/conclusão/Evidence. | PASS |
| 11 | A/R: rollback/retry preserva draft normal; abandono durante save não reabre erro e sucesso permanece durável. | PASS |
| 12 | A: tentativa substituída não inicia alvo novo. | PASS |
| 13 | A: Capability arquivada e excluída têm cenários próprios. | PASS |
| 14 | A/R/N: concorrência com Session e exclusão canônica dos demais modos; submit durante save não duplica. | PASS |
| 15 | A: reabertura vazia após Cancel/navegação/histórico/reload; preflight não ressuscita. | PASS |
| 16 | A/R: hierarquia mantida e Recall abre Evidence exata sem escrever. | PASS |
| 17 | R/N: backup antigo e round-trip, campos desconhecidos e legado; state v3 inalterado. | PASS |
| 18 | P: shell completo offline, ensaio/start/refresh/retomada/finish/Evidence e ZIP local. | PASS |
| 19 | D: grid computado/posições/largura/toque em 360/390 e zoom; imagens 360/390/768/1280 inspecionadas. | PASS |
| 20 | A/D: labels/semântica/foco/Tab/Escape/erro e saída segura da rota abandonada. | PASS |
| 21 | A/R/N: sem ensaio em Study ou outros estados não elegíveis; navegação não mantém o modal. | PASS |

**21/21 cenários: PASS para Build local.** Não equivale a Ship, CI remoto, PWA físico ou publicação.

## 11. Validação corretiva e handoff

Comandos descobertos em `package.json` e no plano do DESIGN:

| Comando / verificação | Exit / evidência |
| --- | --- |
| `npm test` | 0 — 218 passed, 0 failed, 0 skipped. |
| `npm run build:test` | 0 — composição e checagem do módulo inline. Repetido pelo gate canônico. |
| Spec dedicado com `--grep 'Session ensaiada'`, Chromium/mobile, `--retries=0` | 0 — 2 passed; ciclo completo, JSON e Markdown individuais reais. |
| `npm run test:all` — segunda execução completa | 0 — 218 Node passed + 272 browser passed, 0 failed, 24 conditional skips; browser 12.2 min. |
| `node --check` em Today, Sessions e três specs browser modificados | 0 — parse válido. |
| `git diff --check` | 0 — sem erro de whitespace; avisos LF/CRLF do Windows. |
| Inspeção visual 360/390/768/1280 | PASS — labels legíveis, superfície opaca, footer mobile em coluna, controles alcançáveis por rolagem nativa. |
| Verificação do manifesto de caminhos | 12 caminhos tracked + novo spec = 13/13; somente artefatos SDD adicionais previstos. |
| Lint / typecheck / formatter | Not configured — nenhum comando dessas categorias no pacote. |

Total executado com sucesso no gate final: **490 testes**. Os 24 skips seguem as condições de projeto/viewport existentes; não são testes aprovados. PWA completo é exercitado em Chromium, não no projeto mobile. Nenhum snapshot Linux foi regenerado em Windows.

SR-01/SR-02 foram corrigidos e SR-03 recebeu cobertura mantida. DEFINE e DESIGN passam a `Complete (Built)`; `SHIP_REVIEW.md` não foi alterado nem convertido em aprovação.

**Próximo passo: repetir Ship da Delivery 3, começando pela matriz acima e pelo diff do manifesto.** Delivery 4 segue bloqueada até esse gate. Sem commit/push/PR/merge/publicação nesta Build.
