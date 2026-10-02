# Preparação do ambiente — Build Report

**Delivery:** 3
**Status:** Shipped
**Branch:** `codex/environment-ritual`
**Base:** `origin/main@58512ff`
**DEFINE:** `.sdd/features/environment-ritual/DEFINE.md` — 15/15
**DESIGN:** `.sdd/features/environment-ritual/DESIGN.md` — revisão 2

## Entendimento e resultado

Antes, a Session rápida permitia selecionar um Ritual, mas não mostrava seu checklist antes de começar. Deep Work já possuía checklist de Ritual e preparação própria. A Delivery 3 disponibiliza **Começar sem fuga** no seletor atual e uma preparação recolhida no formulário existente. O início aceita zero, parte ou todos os itens marcados. **Pular e começar** dispensa o Ritual da execução sem alterar vínculos salvos.

O Ritual prepara condições; Attempt Rehearsal mantém suas perguntas sobre como agir. Hoje não recebe outra ação. A entrega inclui Gate 1, que compara as três primeiras mudanças e recomenda observar uso antes de Delivery 4.

## Escopo técnico e implementação

| Arquivo | Mudança e propósito |
|---|---|
| `ritual-model.js` | `environmentTemplate()` puro com seis itens opcionais, IDs estáveis e sem E1; `executionTemplates()` oferece o preset sem semear/substituir coleção. |
| `ritual-feature.js` | Usa catálogo para seleção/snapshot; mantém sugestão apenas sobre templates salvos; adiciona disclosure de preparação rápida e skip; limpa marcas ao trocar/reabrir/fechar; respeita dispensa transitória na transferência para Deep Work. |
| `design-system.css` | Estilos estáticos do checklist, labels, foco, quebra de texto e alvos de 44 px. O bloco legado de CSS injetado de Ritual não foi ampliado. |
| `app-manifest.js` | Geração de cache v90→v91; assets alterados já pertencem à composição atual. |
| `tests/ritual-model.test.js` | Dois testes novos de schema/IDs/snapshot e catálogo sem mutação, sugestão ou substituição. |
| `tests/browser/environment-ritual-flows.spec.js` | Onze cenários em desktop e mobile: preparação, skip, cancelamento, falha, transferência, backups, fallback, offline e acesso. |
| `docs/environment-ritual.md`, `docs/sessions-feature.md` | Uso e contratos de preparação, snapshots e dispensa. |
| `.sdd/reports/anti-procrastination/GATE_1.md` | Auditoria das Deliveries 1–3; sete ações na tentativa principal, sobreposições, impacto de schema e decisão de parada. |

DEFINE e DESIGN foram criados antes das mudanças de produto. O diff permanece no manifesto fechado da revisão 2. `manifest.webmanifest` foi revisado: identidade, atalhos e ícones não mudam. Não houve nova dependência, rota, timer, coleção, telemetria ou permissão.

## Decisões e iteração

- O preset fica no catálogo de apresentação para estar disponível em instalações antigas sem inserir/recriar dados silenciosamente. Um registro salvo com o mesmo ID tem precedência, inclusive quando arquivado.
- A preparação rápida é transitória: o snapshot da escolha tem função histórica, enquanto as marcas não têm uso decisório futuro. `ritualChecklist` rápido permanece vazio; Deep Work mantém o checklist existente.
- A flag `dismissed` existe somente no runtime. Ela distingue a dispensa explícita do `none` inicial do seletor global, preservando o contrato anterior de sugestão e permitindo pular também na transferência de modo.
- Na primeira spec, um fixture colocou `ritualId` em Capability, que não possui esse campo persistido. O cenário foi corrigido para Estudo, domínio que suporta o vínculo.
- A primeira posição do disclosure era aninhada em Ajustar sessão e tornou um seletor de summary ambíguo. SDD Iterate produziu revisão 2 antes de mudar a apresentação: preparação agora é irmã da configuração, permanecendo acessível ao recolhê-la. DEFINE e manifesto não mudaram; fixture e testes foram reexecutados.

## Testes e evidência

| Comando / fonte | Resultado observado |
|---|---|
| `npm test` na base, antes de editar | PASS, 238/238. |
| `npm run build:test` | PASS; fixture recomposto antes das execuções após mudanças de produto. |
| `npx playwright test tests/browser/encoding-e1-flows.spec.js tests/browser/attempt-rehearsal-flows.spec.js` baseline | PASS, 44/44. |
| `node --check ritual-model.js`, `node --check ritual-feature.js`, `node --check tests/browser/environment-ritual-flows.spec.js` | PASS. |
| `node --test tests/ritual-model.test.js` | PASS, 11/11. |
| Primeira spec dirigida de ambiente | 20 passaram e 2 falharam no fixture de vínculo; não tratada como PASS. A reexecução focada encontrou a ambiguidade de summary, resolvida pela revisão 2. |
| `npx playwright test tests/browser/environment-ritual-flows.spec.js --grep 'pular descarta\|teclado'` após correção | PASS, 4/4. |
| `npx playwright test tests/browser/environment-ritual-flows.spec.js` após revisão 2 | PASS, 22/22. |
| `npm run test:all` (`package.json` e CI) | PASS, 240/240 Node; 384 aprovados e 24 skips configurados em 408 casos browser, 14,1 min, sem falhas. |
| `git diff --check` e verificação final staged | PASS, sem erros. |

O Codex inspecionou as imagens `test-results/environment-ritual-chromium.png` e `test-results/environment-ritual-mobile.png`: checklist legível, seis itens opcionais e skip distinguível, sem cortes de texto no painel. A automação também verificou teclado, foco, 360 px e zoom 200%. Nenhum snapshot existente foi atualizado. Lint/typecheck não têm comando configurado.

## Aceitação

| AC | Evidência |
|---|---|
| 01 | Browser Hoje→Ajustar→template→preparação; asserção das sete ações de Hoje e disclosure inicialmente recolhido. |
| 02 | Três cenários com zero, dois e seis itens marcados confirmam uma Session, contexto estável, snapshot/canônico equivalentes e checklist rápido vazio; reload preserva snapshot. |
| 03 | Browser skip com vínculo salvo em Estudo confirma Session sem Ritual/checklist, vínculo intacto e foco no companion. |
| 04 | Browser cancelar, Escape, trocar Ritual, reabrir e refresh confirmam descarte de marcas, ausência de Session e foco no acionador. |
| 05 | Falha simulada de gravação mantém marcas/seleção, mostra erro focado e permite retry com uma única Session. |
| 06 | Regressão completa passa para E1, ensaio, início direto e Start Small; modelo confirma preset sem E1 e sem sugestão automática. |
| 07 | Dois cenários browser confirmam template ou dispensa no seletor/checklist já existente de Deep Work e no snapshot iniciado. |
| 08 | Node catálogo sem mutação; browser coleção vazia, export/restore novo com snapshot autossuficiente e restore legado sem semear preset, preservando leitura. |
| 09 | Browser fallback localStorage, início offline e reload confirmam snapshot recuperado sem marcas persistidas; demais contratos de IndexedDB passam na regressão. |
| 10 | Browser teclado, Enter/Space, labels nativas, foco, alvos de 44 px, 360 px e zoom 200%; imagens inspecionadas. |
| 11 | Geração v91, testes de manifesto e suíte PWA existente passam em composição, atualização real de Service Worker e reabertura offline. |
| 12 | Gate 1 responde às seis questões obrigatórias e registra ausência de evidência de uso; Delivery 4 não foi implementada. |

## Compatibilidade, review e limites

Schema, versão global v3, coleções, chaves, stores, sync e backup não mudam. O template produz snapshot no formato atual, autossuficiente para Session/Deep Work e backup. O diff foi revisado contra o DESIGN e não expande outros arquivos de produto. Terminações de linha existentes foram preservadas.

Não foi observada uma PWA instalada fisicamente; automação valida o ciclo de Service Worker e reabertura offline. Depois da exposição de v91, rollback precisa de geração posterior que preserve dados locais. A análise técnica não demonstra redução de adiamento nem uso real: Gate 1 recomenda colher observações antes de prosseguir. **Build PASS — Ready for Ship.** A PR é o limite autorizado desta execução; merge e deploy não foram realizados.
