# Retornos da tentativa ao plano — Design

**Status:** R6 built and verified locally; remote closure tracked in PR #94
**Revisão:** 6
**Data:** 2026-10-02
**Define:** DEFINE.md validado, 15/15
**Base:** origin/main@9bb97c3; codex/attempt-return-context

## Inspeção e decisões

Worktree gerenciado limpo, AGENTS raiz, sem .codegraph. Modelos, Today, editor, Ritual, Session, foundation, manifesto, package.json, Playwright/CI e Gate 1 inspecionados. Baseline npm test: 244 PASS. PR #93 mesclada com CI verde. Continuação do roadmap explicitamente autorizada pelo pedido atual; sem fabricar evidência de uso.

1. Selector puro selectAttemptReturnContext(outcomeId,data,{today}) no capability-context-model existente; nenhuma coleção, versão de registro ou armazenamento. today obrigatório YYYY-MM-DD real; cálculo de janela por dias civis UTC para evitar DST. Comparação createdAt ↔ date usa calendário local, como Today. Última edição precisa timestamp explícito não EPOCH. Não normalizar itens antes de verificar campos originais.
2. Referências positivas exigem type, id, createdAt válido, completedAt exatamente null, snapshot completo igual ao atual, data dentro de 14 dias e criação local naquele dia >= nextAttempt.updatedAt. Hoje obrigatório mas não conta. Deduplicar dias e exigir IDs distintos entre ocasiões. Repetições/planos duplicados com mesmo dia ou ID e registros conflitantes suprimem; metadata.conflictOf do plano/item ou conflito de sync relevante suprime. Qualquer conclusão explícita da mesma identidade e qualquer execução vinculada nas três coleções suprime conservadoramente, mesmo antiga; timestamps de execução não fabricados. Excluir dependência de ausência de Session como evidência positiva.
3. Retorno inclui capabilityRef, dates e signature serializada da versão + IDs/datas das ocasiões. Assinatura efêmera para revalidar cliques e dismissal; sem contagem pública.
4. Hoje acrescenta native details após ações/contexto existente, inicialmente fechado, copy factual: Esta tentativa voltou ao plano em dias diferentes e continua sem conclusão marcada. Quer ajustá-la? Seis botões dentro, nunca permanentes. Preservar disclosure aberto/foco em rerender da mesma assinatura. Manter como está oculta por visita via variável em memória, foco na ação principal. Limpar dismissal ao sair de Hoje. Reavaliar no clique; stale fecha e informa indisponibilidade, sem writes.
5. Comando capability.openAdjustment({capabilityRef,target,trigger}) valida capacidade ativa, identidade/texto, alvo e modal não ocupado. Reutiliza outcomeOpen com opção adjustment: smaller/firstStep -> outcomeSmallStart, context -> outcomeStartCue, benefit -> learningOutcomeBenefit. Abre details correto; microtask de foco; nenhuma aplicação/salvamento automático. Cancel/Escape/draft/save-failure atuais.
6. Environment -> todayStartCapability(expanded:true), foco requestAnimationFrame no ritualQuickSelect após o foco inicial do proprietário, usuário seleciona Ritual existente; preparação e confirmação atuais. Sem preset automático, mudança de prefs ou início.
7. CSS estático para disclosure/copy/wrap/foco/alvos. Manifesto cache v92 -> v93, sem assets novos. Docs descrevem limiar, conservadorismo e ignore. Rollback antes de publicação reverte unidade; depois usar geração futura do cache, sem perda de dados pois schema intacto.

## Fluxos e integridade

Leitura do selector não clona/muta o estado. IDs copiados não contam como novas ocasiões. Conflitos relevantes em _sync.conflicts (coleção learningOutcomes/id atual ou dailyPlans/id relevante) bloqueiam, aceitando falsos negativos por histórico de conflitos. Tombstones/processamento foundation permanecem proprietários. Sem busca por títulos ou alterações globais. Ações do contexto revalidam signature e primary atual; comando do editor valida novamente ref. Rerender não abandona foco do mesmo disclosure. Se contexto deixa de existir, foco retorna à ação principal quando veio de dentro dele.

## Manifesto fechado

| Arquivo | Ação / finalidade | AC |
|---|---|---|
| capability-context-model.js | Modificar runtime/docs | Contrato aplicável |
| learning-outcome-feature.js | Modificar runtime/docs | Contrato aplicável |
| today-feature.js | Modificar runtime/docs | Contrato aplicável |
| design-system.css | Modificar runtime/docs | Contrato aplicável |
| app-manifest.js | Modificar runtime/docs | Contrato aplicável |
| tests/attempt-return-context.test.js | Criar testes/artefato | Contrato aplicável |
| tests/browser/attempt-return-context-flows.spec.js | Criar testes/artefato | Contrato aplicável |
| docs/capability-first-compasso.md | Modificar runtime/docs | Contrato aplicável |
| docs/today-feature.md | Modificar runtime/docs | Contrato aplicável |
| .sdd/features/attempt-return-context/DEFINE.md | Criar testes/artefato | 01–08 |
| .sdd/features/attempt-return-context/DESIGN.md | Criar testes/artefato | 01–08 |
| .sdd/reports/attempt-return-context/BUILD_REPORT.md | Criar testes/artefato | 01–08 |
| .sdd/archive/attempt-return-context/DEFINE.md | Criar testes/artefato | 01–08 |
| .sdd/archive/attempt-return-context/DESIGN.md | Criar testes/artefato | 01–08 |
| .sdd/archive/attempt-return-context/BUILD_REPORT.md | Criar testes/artefato | 01–08 |
| .sdd/archive/attempt-return-context/SHIPPED.md | Criar testes/artefato | 01–08 |

## Ordem e verificação

Define -> Design -> selector/Node -> editor/Today/CSS/cache -> browser/docs -> Build -> Ship (copiar artefatos, sem remover fontes) -> commit/push/PR. Pedido autoriza esta unidade até PR; sem merge/deploy.

Node: limiar, dias/IDs, janela/bordas, timestamps, edição/reversão, conclusão, todas as execuções, conflitos, estado imutável. Browser: elegibilidade real com registros explícitos, todos os atalhos, confirmação/cancelamento/falha, stale, dismissal/rerender/retorno de foco, IndexedDB/fallback/reload/backup/offline, teclado/mobile/zoom/contraste e screenshots inspecionados. AC-08 também apoiado pela suite existente de restore/merge/PWA.

Comandos descobertos: npm test; npm run build:test antes de Playwright focado; npm run test:all (CI). node --check e git diff --check auxiliares. Sem lint/typecheck configurados. Instalação física de PWA não alegada. Evidência de eficácia futura fora do escopo.

## Iteração R2 — foco revelado pelos testes

2026-10-02: teste detectou foco padrão de Session sobrescrevendo microtask e Escape do design system recolhendo details de origem. Dentro do manifesto existente, Today agenda foco após o proprietário e restaura disclosure/foco no fechamento se mesma assinatura ainda elegível. Não altera design system global. Fixture usa API pública de storage e rotas de navegação reais. DEFINE intacto; Build em andamento, evidência anterior parcial não fecha AC.

## Iteração R3 — reavaliar ao retornar

2026-10-02: navegação mostra vistas sem chamar renderAll. Limpar dismissal na saída deixava markup oculto no retorno. Today agora renderiza na entrada de sua vista para cumprir AC-06 e atualizar evidência. Sem alterar roteador ou manifest. Demais 18/20 casos focados já passaram; esta evidência parcial não substitui rodada final.

## Iteração R4 — legibilidade no zoom

2026-10-02: captura ampliada mostrou rótulos partidos dentro do novo details apesar de scrollWidth passar (overflow global usa clip). Reduzir padding/borda interna do contexto e do cartão principal que o contém em <=480px, sem mudar layout global. Browser mede se a maior palavra do rótulo cabe no espaço textual em zoom200%; captura foca o summary. Run completo inicial interrompido para recompor antes do gate final. Mesmos arquivos; sem mudança de requisitos ou dados.

## Iteração R5 — correção de legibilidade no CI Ubuntu

2026-10-02. Modifying, sem novo escopo: run GitHub 37051428940 sobre 895b13e concluiu Node 255 PASS, browser 420 PASS/2 FAIL/24 SKIP. Ambos os FAIL são AC-07: em zoom200% a palavra Esclarecer mede 81.5390625px e o espaço disponível é 72px. A evidência local R4 não cobre essa combinação de métricas; reabertos AC-07/08 e Ship enquanto validação está pendente. DEFINE e sua cópia arquivada permanecem válidos/intactos.

Diagnóstico confirmado por estilos computados: o notebook já zera o padding de #todayView. A regra global do piloto com :is(#todayView, ...) button prevalecia sobre o seletor de classe do contexto e mantinha 12px de padding lateral. O primeiro ajuste da vista foi insuficiente e redundante. Correção dentro do manifesto: em <=480px, usar #todayView .today-attempt-return-actions button para aplicar efetivamente os 4px de padding lateral já previstos. Recuperar 16px no espaço textual do botão sem alterar os containers externos. Manter espaços de foco, tamanho da fonte e alvos existentes. Sem regra global, dados, navegação ou cache novo; v93 ainda candidata em PR aberta, não publicada.

Fortalecer o teste: em zoom200% verificar as palavras de todos os seis rótulos com suas fontes computadas e também com fonte genérica monospace16px (métrica mais larga que o caso CI). Manter comparação da largura real, sem reduzir expectativa ou aumentar tolerância. Capturas e controles existentes preservados. Verificação local focada e npm test; gate canônico adicional será npm run test:all no Ubuntu/Node22 do GitHub, no novo commit exato, antes do handoff. Nenhum workflow/dependência/snapshot novo.

Cascade: DESIGN R5 -> CSS/browser test -> BUILD_REPORT R5 -> archive Design/Build e SHIPPED. Revisar estados com resultados reais; conservar evidência histórica R4, runs falhos e links CI. Publicação autorizada pelo pedido de corrigir a PR existente; sem merge/deploy.

## Evidência R5 local e gate de publicação

Implementação limitada à prioridade do seletor mobile no CSS e ao teste de largura de todos os rótulos. npm test: 255 PASS/0 FAIL. Playwright focado: 20 PASS/0 FAIL (1.0m), incluindo os dois casos de zoom com fonte computada e fallback mais largo. Capturas desktop/mobile e zoom inspecionadas por Codex. Nenhum arquivo fora do manifesto. Este documento registra o checkpoint antes do push; fechamento remoto exige npm run test:all verde no novo head. A execução e o resultado finais serão registrados na [PR #94](https://github.com/GiuseppeBruno-Py/every-second-counts-app/pull/94), sem atribuir resultado futuro a esta evidência local.

## Iteração R6 — maior métrica da fonte genérica Ubuntu

Run37083591457 em315acb1: Node255 PASS, browser420 PASS/2 FAIL/24 SKIP, 18.9m. A comparação com a fonte padrão passou (linha149); ambas as falhas ocorreram no fallback da linha152: Esclarecer96.328125px > espaço88px. O CSS R5 corrigiu a causa original, mas a fonte genérica Ubuntu tem glifos mais largos que a genérica Windows (87.96875px). Status reaberto, sem alteração de DEFINE, dados ou fluxo.

Plano dentro dos mesmos arquivos: no cartão .today-primary que contém o contexto, em <=480px manter padding vertical .5rem e reduzir apenas horizontal para .125rem. Recuperar12px de espaço textual, chegando a100px em viewport360/zoom200%, conservando margens externas, gap dos botões, padding interno4px, fontes de produção e alvos44px. Nenhuma mudança de layout global.

Teste de stress mantém monospace com mínimo16px e aumenta proporcionalmente a fonte quando Esclarecer mede menos que97px. Isso reproduz no Windows o limite observado no CI; não reduz a fonte no Ubuntu nem relaxa expectativa. Todos os rótulos continuam medidos com fonte nativa e genérica. Primeiro exigir RED local em R5, depois GREEN R6 e os20 casos focados. Rodada completa Ubuntu no novo head continua obrigatória antes do handoff; publicar histórico e resultados reais na PR #94. Sem workflow/dependência/cache novos.

Evidência R6: RED local2 FAIL (95.99578857421875px >88px) antes do ajuste; após CSS e stress97px, npm run build:test + Playwright focado20 PASS/0 FAIL, exit0, 56.6s. Capturas zoom desktop/mobile inspecionadas por Codex; palavra Esclarecer inteira. Node255 PASS no run canônico R5, módulos de produção JS intactos. Gate remoto do novo commit será registrado na PR #94 depois da execução.
