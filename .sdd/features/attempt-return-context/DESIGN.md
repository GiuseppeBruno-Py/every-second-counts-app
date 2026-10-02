# Retornos da tentativa ao plano — Design

**Status:** Complete (Built)
**Revisão:** 4
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
