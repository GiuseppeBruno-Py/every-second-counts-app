# O que isso destrava? — Design

**Status:** Shipped
**Revisão:** 2
**Data:** 2026-10-02
**Define:** DEFINE.md, clareza 15/15
**Base:** origin/main@3b86fe5; codex/capability-benefit

## Inspeção e estado atual

Worktree C:/Users/Giuse/.codex/worktrees/anti-procrastination-discovery/every-second-counts-app, inicialmente limpo. AGENTS.md raiz aplica; nenhuma instrução aninhada. Sem .codegraph neste checkout, usado rg e leitura dirigida. README, docs/capability-first-compasso.md, docs/today-feature.md, Gate 1, manifesto, package.json, CI, modelos, editor, foundation, restore e testes inspecionados.

Capability ainda não possui versão própria. Normalização reconstrói cada registro. proofCriterion descreve evidência; futureUse é enum da tentativa com snapshot de execução. O diálogo já tem seções details e salvamento candidate-state. Hoje renderiza uma única tentativa principal atual, com sete ações. Nenhum contrato existente recebe benefício pessoal em frase livre.

## Estado alvo e decisões

1. Adicionar `schemaVersion: 1` ao registro Capability, explicitando a evolução do formato legado não versionado (versão 0) para v1. Exportar `SCHEMA_VERSION=1` e `BENEFIT_MAX_LENGTH=240` no modelo. Schema global continua v3; nenhum store/coleção novo.
2. Uma única propriedade opcional `benefit`, string trim não vazia. `normalizeBenefit` conserva texto válido inclusive acima do limite importado; entrada malformada/vazia omite propriedade. Comandos explícitos create/update que recebem benefit acima de 240 lançam `benefit-too-long` sem mutar entrada. Updates que omitem benefit conservam conteúdo, inclusive imports longos. Limpar remove propriedade.
3. `normalizeOutcome` migra legado para v1 sem mudar IDs/timestamps, idempotentemente; create e update usam a mesma representação. Archive/reactivate/unlink/revisão preservam benefit via normalização/update. Execution context fica no contrato atual: nenhum snapshot de benefício.
4. No editor existente, details `outcomeBenefitPanel` depois da próxima tentativa e antes dos auxiliares, summary “O que isso destrava? Opcional”, label “O que conseguir fazer isso destrava?”, textarea 2 linhas/maxlength 240, hint com limite e benefício pessoal/profissional. Criação recolhida; edição com benefício aberta. Incluir no draft signature, carregar/resetar ao abrir, enviar no input e abrir/focar o campo quando exceder limite.
5. Card de Capability exibe frase secundária após tentativa. Hoje exibe `<p class="capability-benefit">Isso ajuda a: …</p>` só no ramo principal atual de Capability; nenhum botão, cópia na lista, persistência, ranking ou interpretação. Todos os trechos usam escapeHtml; wrap sem corte.
6. CSS estático para details, summary/label/textarea, texto secundário com cor muted e quebra; sem style injection. Reutilizar geometria e foco nativo do editor. Geração do manifesto v91 → v92; Service Worker/assets existentes.

## Fluxos, erro e compatibilidade

Editor → comandos puros → candidate state → saveData existente → renderAll. Failed save usa rollback atual, conserva textarea e modal. Excesso abre details, aria-invalid, foco e erro; nada grava. Cancel/Escape detecta alteração do benefício via assinatura existente.

Bootstrap/restore/foundation já chamam normalizeCollection; não precisam de novo branch. JSON backup genérico conserva registro inteiro. Merge usa updatedAt do proprietário, versões concorrentes e tombstone existentes. Não alterar contratos de Session/Today refs ou portabilidade Atlas.

Migração aditiva de v0 para v1 em memória/normalização, sem relógio novo. Conteúdo de benefício importado longo não é truncado. Rollback pré-publicação reverte unidade; após exposição exige geração futura preservando normalização de benefit/schemaVersion. Reverter só o modelo antigo poderia descartar benefit: manter leitor compatível no rollback. Nunca limpar storage/cache não pertencente ao app. Dois clientes antigos/novos podem perder campo ao editar no cliente antigo; atualizar clientes antes de editar e conservar backup JSON. Não há migração irreversível.

## Manifesto fechado

| Arquivo | Ação | Propósito / dependência | AC |
|---|---|---|---|
| learning-outcome-model.js | Modificar | Versão, normalizeBenefit, create/update; primeiro | 01–08 |
| learning-outcome-feature.js | Modificar | Campo, signature, exibição, erro; modelo | 01–07,10 |
| today-feature.js | Modificar | Contexto somente principal; modelo | 03–04,09–10 |
| design-system.css | Modificar | Details e frase secundária; markup | 03,10 |
| app-manifest.js | Modificar | Geração futura; assets atuais | 09 |
| tests/learning-outcome-model.test.js | Modificar | Forma v1, limites, preservação, contexto; modelo | 01–05,07 |
| tests/state-foundation.test.js | Modificar | Migração/merge/conflito/tombstone; modelo | 07–08 |
| tests/browser/learning-outcome-flows.spec.js | Modificar | Expectativa de forma v1, regressão | 01,07 |
| tests/browser/pressure-simulation-flows.spec.js | Modificar | Expectativa explícita v1 em backup de simulação; modelo | 04,07 |
| tests/browser/capability-benefit-flows.spec.js | Criar | Fluxos, backup, falha, teclado, offline/visual | 01–10 |
| docs/capability-first-compasso.md | Modificar | Semântica, versão, migração, rollback | 01–09 |
| docs/today-feature.md | Modificar | Frase secundária derivada | 03–04 |
| .sdd/features/capability-benefit/DEFINE.md | Criar/atualizar | Requisitos e status | Todos |
| .sdd/features/capability-benefit/DESIGN.md | Criar/atualizar | Manifesto, decisões e status | Todos |
| .sdd/reports/capability-benefit/BUILD_REPORT.md | Criar | Evidências exatas e revisão | Todos |
| .sdd/archive/capability-benefit/DEFINE.md | Criar | Cópia preservada, status Shipped | Todos |
| .sdd/archive/capability-benefit/DESIGN.md | Criar | Cópia preservada, status Shipped | Todos |
| .sdd/archive/capability-benefit/BUILD_REPORT.md | Criar | Cópia preservada, status Shipped | Todos |
| .sdd/archive/capability-benefit/SHIPPED.md | Criar | Verificação, riscos, lições | Todos |

## Ordem e verificação

1. Define validado; Design completo; comandos autorizados pela continuação do roadmap até próxima PR.
2. Modelo/versionamento e Node tests; depois editor/Hoje/CSS/manifesto.
3. Browser tests novos e expectativa mínima v1; documentação.
4. Checks focados; resolver defeitos; suite completa; inspeção visual das imagens desktop/mobile; revisão diff vs manifesto.
5. Build/Ship com matriz de AC; cópia do arquivo; commit/push/PR autorizados pelo pedido atual. Merge/deploy não fazem parte desta ação.

| Cenário | Evidência planejada |
|---|---|
| AC-01–02 | Node CRUD e browser criar/editar/limpar + regressão da forma mínima |
| AC-03–04 | Browser Hoje derivado, ausência/arquivamento e início sem snapshot; Node update/contexts |
| AC-05 | Node limites, tipos, migração preserva longo; browser requestSubmit com excesso programático e foco |
| AC-06 | Browser cancel/Escape, gravação falha e retry + persistência real |
| AC-07 | Node migração idempotente; browser export download → restore → reload e backup antigo |
| AC-08 | Foundation merge mais novo/remoção/conflito/tombstone |
| AC-09 | Browser cache controlado/offline edição/reload em IndexedDB/fallback; suite PWA lifecycle existente |
| AC-10 | Browser teclado/labels/44px/360–390px/zoom, contraste de texto/foco e screenshots inspecionados |

Comandos package.json/CI: npm test (base: 240/240 PASS), npm run build:test, npm run test:all. Playwright direcionado usa a configuração existente e fixture recém-composta. node --check e git diff --check são verificações auxiliares de sintaxe/diff. Lint/typecheck não configurados. Instalação física PWA não é requisito automatizado e não será alegada.

## Impactos

Local-first, sem rede/telemetria/dependências. Um texto curto por capacidade e render condicional de um parágrafo. Não acrescenta cálculo ou busca global. Sem dados copiados para snapshots. Eficácia de uso requer observação futura; Gate 1 continua evidência técnica.

## Histórico

- R1 — 2026-10-02: modelo legado inspecionado; uma frase com proprietário Capability, versão local explícita e preservação sem truncar import. Plano fechado para Delivery 4.
- R2 — 2026-10-02 (sdd-iterate, aditiva em verificação): a suite completa revelou mais uma expectativa exata de Capability no teste de simulação. Manifesto ampliado somente para atualizar esse contrato v1, preservando assertions de Session/Evidence/backup. Acrescentar contraste explícito no teste novo. Define/produção inalterados; Build permanece Incomplete e a primeira suite completa interrompida não é evidência de aprovação. Gate de Design revalidado: arquivos, cobertura e migração permanecem completos.
