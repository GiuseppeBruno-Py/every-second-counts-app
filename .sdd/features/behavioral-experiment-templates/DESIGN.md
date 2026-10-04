# Templates de Experimentos Comportamentais — Design

**Status:** Complete (Built)
**Revisão:** 3
**Data:** 2026-10-04
**Define:** clareza15/15
**Worktree:** C:/Users/Giuse/.codex/worktrees/anti-procrastination-discovery/every-second-counts-app
**Branch/base:** codex/behavioral-experiment-templates / origin/main@db3fd0760edbdb3d1db665d48beac2a05d2ee86e

## Inspeção e decisões

Worktree limpo; AGENTS root, README, docs behavioral-experiments, modelos/UI, package.json, CI e SDD anteriores lidos. Sem .codegraph no worktree (checkout original tem índice não rastreado e trabalho próprio, preservados). Modelo schema1 e coleção atual possuem quatro textos obrigatórios até1000 caracteres e datas. UI atual já captura/salva/rollback/busy e edição/revisão. Gap: exemplos opcionais para criação. Baseline npm test262 pass/0 fail. CI anterior PR95 verde. npm scripts test/build:test/test:browser/test:all; sem lint/typecheck configurados.

Catálogo TEMPLATES frozen no modelo existente: IDs environment/scope/context, label e quatro textos frozen. templateDraft(id,draft,{replace=false}) devolve somente quatro campos sem mutar input; mantém texto não vazio integralmente por padrão, escolhe exemplo em campos vazios, replace troca os quatro. ID inválido TypeError code template-invalid. Textos genéricos do roadmap, expectedOutcome derivado da intenção da hipótese, sem eficácia presumida. Não retornar ou persistir templateId. Não adicionar módulo/engine/schema.

Details nativo recolhido em behavioralExperimentPlanFields após capacidade: seletor com vazio, checkbox de substituição explícita e button type=button Aplicar exemplo. Hint pede adaptar hipótese/prática/contexto/evidência (X/Y). Status aria-live e erro atual com foco no seletor. Só create, não edit/review. Aplicar usa modelo e quatro controles; preserva capacidade/datas; foco na hipótese, status informa preservação/uso da opção para trocar. Abrir reseta helper/checkbox/details/status. Cancel/reload descarta porque nunca entrou no estado. Busy atual desabilita controles e apply tem guard. Save proprietário intacto. Nova CSS estática e específica, alvos/foco/wrap, sem injetar styles. Cache95 via manifesto, ordem/assets/coleções intactos.

Alternativas rejeitadas: nova entidade/engine (duplica dono), substituição automática (perde draft), aplicar ao revisar resultado (altera significado histórico), ligar template a Weekly Review (amplia escopo). Custo constante3 exemplos, sem rede/telemetry. Segurança: labels escapados, dados pessoais não enviados. Sem migração; backup/merge/tombstones schema1 preservados. Rollback após exposição exige geração futura e não apaga dados. Template escolhido não é preferência persistida.

## Manifesto fechado

| Arquivo | Ação/propósito | Aceite |
| --- | --- | --- | --- |
| behavioral-experiment-model.js | Modificar catálogo puro/templateDraft | AC02–04 | DEFINE |
| behavioral-experiment-feature.js | Modificar ajuda no create/apply/reset/busy | AC01–06,08 | modelo |
| design-system.css | Modificar CSS estática específica | AC08 | UI |
| app-manifest.js | Modificar geração95 | AC09 | modelo/UI/CSS |
| tests/behavioral-experiment-templates.test.js | Criar contratos puros e schema | AC02–04,09 | modelo/manifesto |
| tests/browser/behavioral-experiment-templates-flows.spec.js | Criar fluxos e evidência visual/offline | AC01–08 | modelo/UI/CSS/manifesto |
| tests/browser/capability-context-flows.spec.js | Modificar espera do shell/foco nativo após falha intermitente CI | AC08, regressão | lifecycle existente |
| docs/behavioral-experiments.md | Modificar uso/compatibilidade | AC01–09 | modelo/UI |
| .sdd/features/behavioral-experiment-templates/DEFINE.md | Criar requisitos/status | AC01–09 | demanda/roadmap |
| .sdd/features/behavioral-experiment-templates/DESIGN.md | Criar design/status | AC01–09 | DEFINE |
| .sdd/reports/behavioral-experiment-templates/BUILD_REPORT.md | Criar evidÃªncia/matriz | AC01â€“09 | Design/validação |
| .sdd/archive/behavioral-experiment-templates/DEFINE.md | Criar arquivo copy-only | AC01â€“09 | Define/Build concluído |
| .sdd/archive/behavioral-experiment-templates/DESIGN.md | Criar arquivo copy-only | AC01â€“09 | Design/Build concluído |
| .sdd/archive/behavioral-experiment-templates/BUILD_REPORT.md | Criar arquivo copy-only | AC01â€“09 | BUILD_REPORT concluído |
| .sdd/archive/behavioral-experiment-templates/SHIPPED.md | Criar arquivo copy-only | AC01â€“09 | três cópias verificadas |

## Dependências, ordem e evidência

Define -> Design -> catálogo/modelo/Node -> UI/CSS/cache/docs -> focused -> regressão -> Build/Ship copy-only -> commit/push/PR -> CI canônico Ubuntu/Node22 no head final. Autorização do usuário cobre esta entrega; nenhuma aprovação redundante. Delivery8 não iniciada. Gate2 prévio preservado, continuação explicitamente autorizada sem inventar uso.

Node: três catálogos/editabilidade/immutability/limites/unknown/preserve/replace/resultado schema normal/cachecoleções. Browser:3 templates, manual/preserve/replace/cancel/edit/review, ausência de escrita e dados estranhos, falha/retry/busy, backup/offline IndexedDB/fallback, a11y/capturas. Reusar specs behavioral-experiment-flows para lifecycle anterior e regressão test:all para SW/composição/contratos. Fixture deve aguardar CompassoPwaLifecycle.snapshot().coherent antes de foco: instalado não significa shell interativo (lição PR95). Verificar palavras com fonte larga em zoom, além de scrollWidth com clip. Não alegar instalação física PWA nem utilidade pessoal.

## Iteração R2 — zoom revelado pela inspeção

2026-10-04, Modifying em CSS/evidência AC08 dentro do manifesto. Capturas R1 mostram diálogo cortado à direita em body zoom2 apesar de scrollWidth do documento e medida interna de palavras passarem. Invalidar aceite visual R1 e interromper regressão iniciada. Ajustar somente largura/max-width do behavioralExperimentDialog usando percentual do containing block, não vw que ignora zoom herdado. Reforçar browser com bounding boxes do diálogo/controle dentro do viewport físico e reinspecionar capturas. DEFINE intacto; outros AC/testes R1 continuam válidos, focused e regressão serão refeitos após correção. Sem novos arquivos/schema/runtime styles.

## Iteração R3 — foco intermitente da regressão CI

2026-10-04, Modifying em evidência/fixture AC08. CI37188422409 teve exit0 e268 Node,465 browser pass/24 skips/1 flaky (21.2m): teste existente capability-context-flows:149 recebeu textarea inactive no primeiro Enter e passou no retry. Não aceitar retry como estabilidade demonstrada. Expandir manifesto14→15 apenas para fixture existente. Aguardar lifecycle coherent em open, scroll/foco/assert antes de Enter; preservar ativação nativa, sem timeout maior ou click substituto. DEFINE e produto inalterados; Build/Ship reabertos para evidência final. Reusar Node/full local válidos (produção não mudou); rodar arquivo completo afetado sem retries e foco repetido3 vezes por perfil. CI canônico completo no novo head. Arquivos de archive atualizados após validação, working copies retidos.
