# Start Small — Shipped record

**Delivery:** 2 — compromisso inicial de cinco minutos
**Data:** 2026-09-29
**Status:** PASS, arquivado por cópia
**Base:** `origin/main@da02a7a`

## Escopo aceito

Os 12 critérios do DEFINE têm evidência. A tentativa principal atual em Hoje oferece **Começar por 5 min** e inicia a Session normal. O tempo efetivo fica em cinco minutos até a pessoa escolher continuar, encerrar com Evidence ou pausar para ajustar a tentativa. A decisão e o marcador sobrevivem a refresh, offline e backup. A Session direta, registros v1, versão global de estado e fluxos de Evidence permanecem nos contratos anteriores.

O conjunto de arquivos corresponde ao manifesto fechado do DESIGN, incluindo a revisão 2 que acrescentou a asserção do teste de Attempt Rehearsal. Não há mudança funcional fora desse escopo.

## Evidência de aceitação

| Critérios | Evidência |
|---|---|
| AC-01–02 | Browser confirma ação secundária, revalidação, uma Session normal, mesmo vínculo e projeção canônica de cinco minutos; Node confirma projeção idempotente. |
| AC-03–05 | Node e browser confirmam tempo efetivo, pausa, limite, refresh, escolha persistida e continuidade do mesmo ID a partir do marco. |
| AC-06–08 | Browser confirma encerramento/Evidence, cancelamento, editor/snapshot, Capability indisponível, rollback e retry com foco de erro. |
| AC-09–10 | Node e browser confirmam Session direta e v1 ilimitadas, fallback localStorage, reload offline e backup; regressão completa cobre restore legado. |
| AC-11 | Browser desktop/mobile, teclado, nomes acessíveis, foco, alvos de 44 px, 360 px e zoom de 200%. |
| AC-12 | Manifesto v90 e testes de Service Worker, atualização, composição do cache e reabertura offline. |

`npm test`: 238/238. `npm run test:browser`: 362 aprovados, 24 skips configurados, nenhuma falha. Sintaxe JS, composição do fixture e `git diff --check`: PASS. O BUILD_REPORT registra os comandos, os incidentes corrigidos durante a iteração e os limites de cada critério.

## Riscos e lições

- Uma PWA instalada fisicamente não foi observada. A automação cobre o ciclo de Service Worker e a reabertura offline.
- Depois da exposição de v90, rollback exige uma geração de cache posterior sem descartar dados locais.
- Limitar a duração no modelo puro e descontar a espera após o marco preservou o cronômetro e o ID existentes sem depender de timers em background.
- Guardar a escolha na Session fonte e projetar `plannedMinutes` evitou uma segunda modalidade de execução e manteve backup, Evidence e histórico no caminho atual.
- A spec de navegador usa o aplicativo composto em `.test-dist`; mudanças na fonte exigem `npm run build:test` antes de reexecutar Playwright.

DEFINE, DESIGN e BUILD_REPORT permanecem em seus caminhos de trabalho. O arquivo usa cópia, sem remover os originais. Este fechamento documenta o aceite técnico; merge e deploy não foram realizados.
