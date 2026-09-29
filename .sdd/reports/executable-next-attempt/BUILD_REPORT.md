# Próximo Passo Executável — Build Report

**Delivery:** 1
**Status:** PASS — Ready for Ship
**Branch:** `codex/executable-next-attempt`
**Base:** `origin/main@e8c778d`
**DEFINE:** `.sdd/features/executable-next-attempt/DEFINE.md` (15/15)
**DESIGN:** `.sdd/features/executable-next-attempt/DESIGN.md` (Ready for Build)

## Entendimento

Antes, `nextAttempt.text` podia ser uma intenção vaga. O ensaio em Hoje perguntava pela primeira ação, mas só no momento da execução e sem alterar o plano. A Delivery 1 adiciona uma ajuda opcional no próprio editor de Capability para formar uma ação pequena, com evento contextual opcional, e deixa a frase no campo canônico para revisão e salvamento explícito.

## Escopo técnico e implementação

| Arquivo | Mudança | Critérios |
|---|---|---|
| `learning-outcome-model.js` | `composeExecutableAttempt()` puro, com validação de começo e limite de 1000 caracteres; schema de `nextAttempt` intacto. | 03–05, 09 |
| `learning-outcome-feature.js` | Disclosure opcional no diálogo existente, dois campos, aplicação ao rascunho, proteção contra campos não aplicados, convivência com simulação, foco/erro e reset efêmero. | 01–09, 11 |
| `design-system.css` | Layout estático responsivo, foco visível e alvos de 44 px. | 02, 11 |
| `app-manifest.js` | Geração do cache de v88 para v89; módulos/assets e coleções inalterados. | 10, 12 |
| `tests/learning-outcome-model.test.js` | Composição contextual/sem evento, pontuação, idempotência, ausência de metadado e erros. | 03–05, 09 |
| `tests/browser/executable-next-attempt-flows.spec.js` | Fluxos completos de criação, edição, Today/Session, pressão, cancelamento, rollback, JSON, fallback, offline, mobile e teclado. | 01–12 |
| `docs/executable-next-attempt.md` | Uso, limites e compatibilidade. | 01–12 |

O Discovery recebeu uma nota de proveniência para o commit `e8c778d`. DEFINE e DESIGN foram criados antes do código; nenhum arquivo de produto fora do manifesto foi editado. O `manifest.webmanifest` foi revisado: identidade/atalhos/ícones não mudam. A lista de assets de `app-manifest.js` já inclui os três assets de produção alterados.

## Decisões

- O usuário continua dono da frase final: aplicar não salva e o texto pode ser editado livremente.
- Não há novo `trigger`, `minimumDose`, coleção, score, rota, timer, integração ou mudança de schema.
- A ajuda fica no editor, sem mais um botão em Hoje; ensaio e Ritual mantêm responsabilidades próprias.
- Campo auxiliar preenchido sem aplicação exige decisão explícita antes do salvamento.
- Uma condição de simulação aplicada no mesmo rascunho é preservada se o sufixo conhecido permanecer intacto. Se ele for editado, o fluxo existente exige reaplicar ou limpar a condição.
- O cache avança uma única vez para v89. Rollback após exposição de PWA instalada requer geração posterior e preservação de dados.

## Testes e evidências

| Comando / origem | Resultado observado |
|---|---|
| `npm test` (`package.json`) antes da edição em `e8c778d` | PASS, 232/232. |
| `node --check learning-outcome-model.js` e `node --check learning-outcome-feature.js` | PASS. |
| `node --test tests/learning-outcome-model.test.js` | PASS, 21/21. |
| `npm run build:test` (`package.json`) | PASS. |
| `npx playwright test tests/browser/executable-next-attempt-flows.spec.js` (Playwright configurado no repositório) | PASS, 14/14 em Chromium desktop/mobile. |
| `npm test` após edição | PASS, 234/234. |
| `npm run test:browser` | Interrompido após o caso 298/370 sem resumo do Playwright nem falha de teste reportada; não tratado como PASS. |
| `npx playwright test --project=chromium` | PASS, 178 aprovados e 7 skips configurados (185 casos, 6,5 min). |
| `npx playwright test --project=mobile` | PASS, 167 aprovados, 17 skips configurados e 1 caso intermitente de PiP que passou no retry (185 casos, 6,3 min). |
| `git diff --check` | PASS, sem erros. |

As verificações de navegador foram executadas pelo Codex contra o aplicativo composto pelo fixture do repositório. Nenhum teste físico em PWA instalada foi atribuído ao usuário. Lint/typecheck não têm comando configurado no repositório.

## Compatibilidade e acessibilidade

`nextAttempt.id` permanece estável ao editar. `state-foundation.js`, normalização de Capability, IndexedDB, fallback localStorage, backup/restore JSON, exportação Markdown, sincronização e tombstones usam os contratos existentes. Os testes direcionados cobriram backup antigo/novo, Session snapshot, refresh e reload offline. A interface reutiliza o diálogo nativo, a confirmação de descarte, `role=alert`, labels persistentes e retorno de foco. Os testes de browser verificaram teclado, Escape, 360 px, 200% zoom, toque e ausência de overflow.

## Aceitação e limites

| AC | Evidência |
|---|---|
| 01–04 | Browser criação normal, helper na criação/edição, com/sem gatilho, reapply e edição final; Node composição pura. |
| 05 | Node vazio/limite; browser vazio e helper não aplicado ou modificado após aplicação. |
| 06–08 | Browser Escape/refresh, Today/Session snapshot, rollback e retry. |
| 09 | Browser simulação antes/depois, reapply sem duplicação; limite puro de 1000. |
| 10 | Browser JSON antigo/novo, fallback localStorage e reload offline; testes existentes de estado. |
| 11 | Browser desktop/mobile, teclado, labels, foco, 360 px e zoom 200%. |
| 12 | Testes de manifesto/estado e ciclo PWA desktop, incluindo update real, composição do cache completo e reabertura offline, passaram. O teste de fallback localStorage da Delivery também passou offline em ambos os projetos. |

Limitação: a automação de navegador verifica Service Worker, composição e reabertura offline, mas não equivale a uma observação física de uma PWA instalada pelo usuário. As duas vulnerabilidades altas reportadas por `npm ci` na Discovery pertencem às dependências de teste existentes e não foram modificadas nesta Delivery.

## Review e status

Os 12 critérios possuem evidência válida. O diff revisado corresponde ao manifesto fechado do DESIGN: cinco arquivos de produção/teste alterados, teste browser novo, documentação e artefatos SDD; nenhum schema, chave, store, fluxo de Session/Evidence ou asset do manifesto foi expandido. `git diff --check` passou. O comando combinado de navegador não produziu resumo por encerramento do processo, por isso os dois projetos foram executados integralmente em separado, com saída 0. O retry intermitente ocorreu no teste preexistente de PiP mobile, fora da superfície modificada nesta Delivery; o resultado e o limite ficam registrados, sem atribuir uma causa não comprovada. **Build PASS — Ready for Ship.** Nenhum merge ou deploy faz parte deste fechamento.
