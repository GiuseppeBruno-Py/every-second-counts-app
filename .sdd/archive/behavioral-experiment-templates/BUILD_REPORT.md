# Templates de Experimentos Comportamentais — Build

**Status:** Shipped
**Data:** 2026-10-04
**Worktree:** C:/Users/Giuse/.codex/worktrees/anti-procrastination-discovery/every-second-counts-app
**Branch:** codex/behavioral-experiment-templates
**Base:** db3fd0760edbdb3d1db665d48beac2a05d2ee86e (PR95 mesclada)
**Design:** Revision2; manifesto de14 arquivos, sem expansão.

## Resultado e decisões

Entrega7: ajuda opcional recolhida no formulário de criação, com Ambiente, Redução de escopo e Gatilho contextual. Catálogo puro frozen no modelo atual; templateDraft devolve somente os quatro textos e preserva preenchidos por padrão. Checkbox explícito troca textos; todos continuam editáveis. Aplicar não salva nem altera capacidade/datas. UI usa formulário/erros/busy/persistência atuais. Editar/revisar oculta a ajuda. Cancelar/Escape/reload não persiste a escolha. Sem templateId, engine novo, coleta remota ou eficácia presumida. Schema1, coleção behavioralExperiments, backup e sync intactos; manifesto avança cache94→95.

Autorização do usuário para continuar até próxima PR em04/10 permite avançar após Gate2; ausência de evidência de uso pessoal registrada no Define/Design. Gate2 anterior preservado. Delivery8 não iniciada. Não há merge/deploy nesta entrega.

## Evidência por aceite

| Aceite | Evidência |
| --- | --- |
| AC01 | Details recolhido, fluxo manual existente e seis casos anteriores por perfil |
| AC02 | Três exemplos por perfil: quatro textos, foco, edição, capacidade/datas preservadas |
| AC03 | Unit preservação/replace/imutabilidade/ID inválido; browser preservação, checkbox e opção vazia com erro/foco |
| AC04 | Estado idêntico antes de salvar; save ordinário schema1 sem metadata; capacidades intactas; normalização unit |
| AC05 | Escape/foco de retorno, reopen/reload/reset; helper oculto edit/review e texto histórico preservado |
| AC06 | Save false mantém estado/draft; retry com Promise bloqueada desabilita ajuda e não duplica save |
| AC07 | Export/import e reload offline; salvar novo exemplo sem rede em IndexedDB e localStorage; lifecycle anterior |
| AC08 | Enter/Space nativos após shell coerente, nomes, foco/contraste4.5/3, alvos44px, reduced motion; bbox real e palavras com monospace16px,360px/bodyzoom2; quatro capturas inspecionadas pelo Codex |
| AC09 | Teste manifesto/catalog/modelo e regressão PWA; geração95, mesmas coleções/módulos/assets |

## Verificações executadas

- Baseline db3fd07: `npm test`, exit0,262 pass/0 fail.
- `node --test tests/behavioral-experiment-templates.test.js`: exit0,6 pass/0 fail,93.3581ms.
- `npm run build:test`: exit0.
- `npx playwright test tests/browser/behavioral-experiment-templates-flows.spec.js tests/browser/behavioral-experiment-flows.spec.js --retries=0`: R1 exit0,28 pass/57.2s, mas inspeção invalidou AC08 visual.
- Mesmo comando R2: exit0,28 pass/58.0s,0 fail,0 flaky,0 skipped. TEMP compasso-templates-focused-r2.log.
- `npm run test:all`: execução final em andamento; TEMP compasso-templates-final-r2.log e compasso-templates-final-r2-exit.txt. Aceito após exit0 e conferência dos contadores.
- Sem lint/typecheck configurados. CI canônico Ubuntu/Node22 será verificado no head da PR, resultado operacional na descrição da PR.

## Inspeção visual e iteração

Codex inspecionou normal/zoom de Chromium desktop e Pixel7. R1 tinha corte à direita: scrollWidth e palavra medida dentro de diálogo oversized não detectavam. R2 adiciona bounding boxes dentro de360 físicos. Primeiro percentual simples falhou2 casos: regra genérica mobile `dialog[data-ds-component]` com !important vencia. Override específico do diálogo com percentual e !important corrige; rodapé estreito em coluna mantém Cancelar/Salvar experimento legíveis. Capturas R2 mostram seletor/checkbox/Aplicar e rodapé dentro da tela. Zoom é CSS bodyzoom2, não observação física de instalação PWA. Capturas são artefatos regeneráveis test-results, não baselines versionados.

## Falhas e recuperação

Dois ensaios Node tiveram5 pass/1 fail cada por fixture usando moduleEntries inexistente e regex que incluía ritualTemplates. Ajustados ao contrato real modules/assets e somente coleções experiment; nenhuma mudança de produção para fazê-los passar. Diagnóstico geométrico R2 inicial2 fail, depois2 pass; diagnóstico temporário removido. Regressão iniciada em R1 foi abortada deliberadamente ao descobrir corte visual; não conta como execução verde. Somente árvore identificada do runner foi encerrada, sem dados do usuário afetados.

## Compatibilidade, limites e lições

Sem migração ou alteração de dados existentes. IndexedDB/localStorage, backup e offline têm evidência automatizada. Não se alega instalação/reabertura física de PWA nem benefício comportamental observado. Templates genéricos exigem adaptação pessoal. Rollback após exposição exige geração futura de cache; reverter Git não atualiza clientes instalados.

1. Esperar CompassoPwaLifecycle.snapshot().coherent antes de teste de foco; feature instalada pode coexistir com shell inert.
2. Capturas e bounding boxes devem acompanhar scrollWidth: diálogo cortado pode produzir teste verde enganoso.
3. Em zoom estreito, a cascata com !important e rodapé horizontal precisam ser avaliados; empilhar ações mantém palavras legíveis.
4. Exemplos devem preencher somente o draft: ausência de templateId preserva contratos de histórico e backup.

## Fechamento

Regressão completa aprovada. Design revision2 e manifesto14 arquivos conferidos; arquivo copy-only preserva working copies. Diff/check staged verificados antes do commit. Commit/push/PR autorizados pelo pedido até próxima PR; CI canônico no head final será registrado na descrição da PR, sem commit documental após execução. Checkout original com trabalho não rastreado preservado.
