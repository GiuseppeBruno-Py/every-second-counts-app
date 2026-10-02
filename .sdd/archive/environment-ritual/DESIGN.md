# Preparação do ambiente — Design

**Delivery:** 3
**Status:** Shipped
**Revisão:** 2
**DEFINE:** `.sdd/features/environment-ritual/DEFINE.md`, 15/15
**Base:** `origin/main@58512ff`, `codex/environment-ritual`, cache v90

## Inspeção e estado atual

Worktree gerenciado `C:/Users/Giuse/.codex/worktrees/anti-procrastination-discovery/every-second-counts-app`, limpo na criação da branch. PR #91 mesclada com CI verde; `origin/main` contém esse merge. O checkout compartilhado não foi modificado. Não há `.codegraph/` no worktree; inspeção direta de AGENTS, README, Discovery, documentação de Sessions, modelos/features de Ritual/Session/Deep Work/UX, manifesto, package, Playwright e CI. `npm test` baseline: 238/238; fixture recomposto; baseline browser dirigido para E1/Attempt Rehearsal: 44/44 antes de alterar produto.

`ritual-model.js` normaliza templates com cinco categorias de itens; cinco defaults só são criados quando falta coleção. `ritual-feature.js` seleciona vínculo/sugestão/escolha explícita e captura snapshot. A Session rápida guarda checklist vazio; Deep Work tem checklist opcional próprio. O seletor rápido fica em Ajustar sessão. Hoje já tem sete ações na tentativa principal; nenhuma nova será adicionada. O contexto de início e a persistência transacional são de `sessions-feature.js`.

## Estado alvo e interfaces

1. `ritualModel.environmentTemplate()` retorna template puro, normalizado, v1, ID estável `ritual-preset-environment`, nome **Começar sem fuga**. Seus seis itens em `preparation` têm IDs próprios e `required:false`; demais categorias vazias; sem E1.
2. `ritualModel.executionTemplates(saved)` retorna catálogo de seleção com rituais ativos salvos e o preset, sem mutar a coleção nem substituir um registro salvo com mesmo ID. O preset não entra em `defaults()` e não é usado pela sugestão automática. Não há seeding/migração.
3. `ritual-feature.js` usa esse catálogo para seleção e snapshot nas superfícies Session/Deep. Vínculo e sugestão continuam baseados na coleção salva. O seletor atual inclui o preset nominalmente, apenas por escolha explícita.
4. Na Session rápida, a preparação fica em disclosure nativo **Preparar condições (opcional)** logo após Ajustar sessão, como seu irmão no DOM, com orientação, checkboxes de Ritual e **Pular e começar**. O seletor permanece na configuração existente. Aparece quando há Ritual selecionado; começa recolhido em cada abertura. Marcações têm labels nativas e não são usadas na validação nem em `ritualExecutionSnapshot('session')`, mantendo `ritualChecklist: []`.
5. Pular chama `ritualSetExecutionChoice('session','')`, limpa o seletor e submete `sessionStartForm.requestSubmit()`. O guard `sessionRuntime.creating` impede mutação durante gravação. A decisão de dispensa ganha apenas flag efêmera `dismissed:true` no runtime; `ritualPrepareExecution` respeita a flag quando recebe a seleção na transferência para Deep Work. Nenhuma flag vai para snapshot/coleções. O `none` inicial do seletor global Executar continua permitindo a sugestão anterior; não equivale à dispensa explícita.
6. Preparar/reabrir/trocar seleção reseta os controles. Evento `close` do diálogo limpa a seleção de Session e o disclosure, sem afetar seleção Deep capturada antes da transferência. Falha de criação usa rollback/foco existentes e não re-renderiza o checklist, preservando a abertura para retry. Início direto/Start Small/ensaio continuam a preparar o mesmo formulário sem mostrar preparação obrigatória.

## Decisões e fronteiras

- Preset disponível em apresentação evita inserir dados silenciosos em coleções antigas ou recriar templates excluídos.
- Checklist rápido é transitório: o snapshot da escolha já tem função histórica; marcas de preparação não sustentam decisão futura e não justificam dado novo.
- Preparação de condições permanece separada das respostas de ensaio. Confirmar o primeiro movimento é uma marcação opcional, não outro campo para reescrever a tentativa.
- Deep Work reutiliza seu checklist; não ganha segunda seção. Nenhum vínculo é modificado automaticamente.
- CSS novo fica em `design-system.css`; não ampliar o bloco legado de estilos injetados de Ritual.

## Manifesto fechado e ordem

| Arquivo | Ação / propósito / dependência | AC |
|---|---|---|
| `.sdd/features/environment-ritual/DEFINE.md` | Criar e atualizar status; requisitos | todos |
| `.sdd/features/environment-ritual/DESIGN.md` | Criar e atualizar status; arquitetura e escopo | todos |
| `ritual-model.js` | Modificar; preset e catálogo puro, primeiro | 01, 02, 06–09 |
| `tests/ritual-model.test.js` | Modificar; formato, estabilidade, catálogo e não mutação | 02, 06–09 |
| `ritual-feature.js` | Modificar; catálogo de execução, disclosure rápido, skip, reset e dispensa entre modos; depende do modelo | 01–10 |
| `design-system.css` | Modificar; layout, checkboxes, labels, foco e touch estáticos | 10 |
| `app-manifest.js` | Modificar; cache v90→v91, assets atuais já incluem módulos/CSS | 09, 11 |
| `tests/browser/environment-ritual-flows.spec.js` | Criar; fluxo Hoje, checklist, skip, cancel, falha, Deep, legado/backup, fallback/offline e acesso | 01–11 |
| `docs/environment-ritual.md` | Criar; uso, estados transitórios, contratos e limites | todos |
| `docs/sessions-feature.md` | Modificar; preparação rápida opcional e snapshot | 01–09 |
| `.sdd/reports/anti-procrastination/GATE_1.md` | Criar após validação; auditoria das três entregas e parada antes de Delivery 4 | 12 |
| `.sdd/reports/environment-ritual/BUILD_REPORT.md` | Criar; evidência e desvios | todos |
| `.sdd/archive/environment-ritual/{DEFINE,DESIGN,BUILD_REPORT,SHIPPED}.md` | Criar por cópia após Ship; preservar originais | todos |

Sem move/delete. Outro arquivo exige Iterate antes de edição.

## Validação

| Critérios | Evidência planejada |
|---|---|
| 01–03 | Browser Hoje→Ajustar→template→marcar/iniciar/pular; quantidade de ações e Session/snapshot. |
| 04–05 | Browser cancelar/Escape/reopen/troca/reload; falha de save, foco e retry. |
| 06–07 | Node catálogo e snapshot; E1/Attempt Rehearsal/Start Small existentes; browser transferência para Deep com preset/dispensa. |
| 08–09 | Node coleção vazia/custom; browser backup novo/antigo, coleção preservada, fallback e reload offline. |
| 10 | Browser desktop/mobile, teclado, foco, 360 px e zoom 200%. |
| 11 | Testes Node de manifesto e testes existentes de ciclo PWA/cache completo/offline. |
| 12 | Leitura/review de Gate 1 com fontes e comparação das Deliveries 1–3. |

Comandos de `package.json`: `npm test`, `npm run build:test`, spec Playwright dirigida e `npm run test:browser` integral. Lint/typecheck não configurados. Inspecionar diff e `git diff --check` incluindo novos arquivos staged. `manifest.webmanifest` será revisado; não muda identidade/atalhos/ícones.

## Compatibilidade e operação

Schema e persistência não mudam. Snapshot do preset usa o formato atual, mesmo que o template não esteja na coleção; backup transporta a Session autossuficiente. Registros antigos continuam suportados e a normalização é a mesma. Sem dependência, rede, permissão, telemetria ou novo processamento em tick. Custo linear no catálogo apenas ao preparar/trocar Ritual.

Rollback do shell após v91 exige geração posterior que preserve armazenamento. Atualização/abertura offline automatizadas serão testadas; instalação física não observada deve ser registrada como limite. Gate 1 audita complexidade e não afirma melhora comportamental sem evidência de uso.

## Gate

DEFINE 15/15, fonte/contratos inspecionados, interface e arquivo manifest definidos, critérios mapeados, compatibilidade/rollback tratados. **Ready for Build.**

## Histórico de revisão

| Data | Classificação e impacto |
|---|---|
| 2026-10-02 | Revisão 2, ajuste de apresentação: a inspeção durante Build encontrou seletores existentes que assumem um único summary em Ajustar sessão. Preparar condições será irmão desse disclosure, evitando aninhamento e mantendo preparo acessível ao recolher configuração. DEFINE, modelo, schema e manifesto não mudam; revalidar UI e regressão após recompôr o fixture. |
