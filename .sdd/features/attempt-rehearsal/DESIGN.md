# Ensaio da Próxima Tentativa — Design

**Delivery:** 3 — Ensaio da Próxima Tentativa
**Status:** Complete (Built)
**Build gate:** PASS — section 21 corrected and validated locally 2026-09-16; repeated Ship pending.
**Roadmap:** Psicocibernética → Compasso
**Priority:** P0
**Date:** 2026-09-15
**Baseline:** `origin/main@b7246f48ba8177860041892bbdebd97ac15df7c9`
**DEFINE:** `.sdd/features/attempt-rehearsal/DEFINE.md` — clarity 15/15

## 1. Propósito

Transformar o DEFINE aprovado em um plano implementável para adicionar um preflight comportamental opcional antes da Session da próxima tentativa principal em Hoje.

O desenho preserva a fronteira central da entrega: as quatro respostas existem apenas na interface aberta, não atravessam reload e nunca entram no estado persistido. O início direto, o ajuste de Session e o modelo de dados permanecem válidos.

Nenhum código de produção é alterado nesta fase.

## 2. Estado atual

### Hoje

- `todayPrimaryState()` escolhe, nesta ordem, execução ativa, primeira tentativa atual de Capability, outra ação e planejamento.
- `renderTodayPrimary()` renderiza `Iniciar agora`, `Ajustar sessão`, acesso à Capability, conclusão/remoção e o Evidence Recall subordinado.
- `todayStartCapability()` cria um `learningContext` atual e delega para `session.startDefault` ou `session.openConfiguration`.
- `today.executePrimary` e o controle global Executar continuam usando `session.startDefault` diretamente.
- O foco primário é `[data-today-primary-start]`.

### Sessions

- `openSessionStartCore()` valida ausência de execução ativa, resolve o item, configura defaults e prepara o formulário compartilhado.
- `session.startDefault` usa esse mesmo formulário oculto, força modo `quick`, dispara o submit e retorna imediatamente.
- `createSession()` constrói um candidato, sincroniza a execução canônica, chama `saveData()` e só confirma sucesso após persistência.
- Em falha, `createSession()` restaura o estado anterior, compensa a persistência, repõe o draft do formulário e abre `#sessionStartDialog` com erro.
- Em sucesso, a Session e a Execution canônica ficam duráveis e o foco segue para Companion/banner.

### Interface, persistência e PWA

- Os diálogos são injetados pelos feature modules e aprimorados por `design-system-feature.js`, que adiciona semântica modal, contenção de Tab e retorno de foco.
- `design-system.css` já contém o contrato responsivo de `.session-dialog`, botões, campos, 360–390 px, ponteiro grosso e visual notebook.
- IndexedDB/localStorage, backup/restore e Markdown serializam `state.data`, não o DOM.
- `app-manifest.js` inclui Hoje, Sessions e CSS no shell e atualmente possui `cacheName: 'compasso-pages-v82'`.

## 3. Gap concreto

Hoje não existe uma ação ou estado intermediário entre decidir executar a `nextAttempt` e iniciar a Session. Também não existe um retorno assíncrono público que permita a uma interface chamadora distinguir:

- início apenas solicitado;
- Session realmente persistida;
- escrita revertida.

Usar `session.startDefault` diretamente no ensaio descartaria o rascunho cedo demais, porque o comando atual retorna antes do resultado de `saveData()`. Alterar a semântica desse comando colocaria o início direto e outros chamadores em risco.

## 4. Estado-alvo e responsabilidades

### 4.1 `today-feature.js` — dono do preflight

Hoje continuará sendo o dono da elegibilidade e ganhará:

```js
todayRehearsalRuntime
todayOpenRehearsal(outcomeId, trigger) → boolean
todayCurrentRehearsalPayload() → payload | null
todayStartFromRehearsal({ skip }) → Promise<boolean>
todayDiscardRehearsal({ close, restoreFocus }) → void
```

`todayRehearsalRuntime` conterá somente metadados efêmeros:

```js
{
  outcomeId,
  attemptId,
  refKey,
  trigger,
  starting
}
```

As respostas permanecerão exclusivamente nos quatro controles do diálogo. Elas não serão copiadas para `todayRehearsalRuntime`, `state`, Session ou logs.

`todayInstallUi()` criará `#todayRehearsalDialog` como uma única `.session-dialog`, com:

- título `Ensaiar tentativa`;
- contexto factual da Capability e tentativa, preenchido via `textContent`;
- quatro `textarea` com labels exatos do DEFINE e `maxlength="280"`;
- `#todayRehearsalError` com `role="alert"`, `tabindex="-1"` e estado inicialmente oculto;
- ações `Cancelar`, `Pular ensaio e começar` e `Começar sessão`.

O formulário não terá submit nativo para armazenamento. Seu handler sempre chama `preventDefault()`.

No card principal, a ordem visual será:

1. `Iniciar agora` — `primary-btn`;
2. `Ensaiar tentativa` — `secondary-btn`;
3. `Ajustar sessão` — `quiet-btn`;
4. ações auxiliares existentes.

Essa alteração muda apenas a hierarquia visual de `Ajustar sessão`; sua semântica e comando permanecem intactos. Evidence Recall continua depois do bloco de ações.

### 4.2 `sessions-feature.js` — confirmação assíncrona sem mudar o comando atual

Extrair a preparação comum para:

```js
sessionPrepareDefault(payload) → boolean
```

Ela chamará `openSessionStartCore(..., { show:false, trigger })`, forçará `sessionMode = 'quick'` e não persistirá nada.

O comando atual manterá sua assinatura e semântica:

```js
session.startDefault(payload) → boolean
```

Ele continuará preparando o default, disparando `requestSubmit()` e retornando imediatamente.

Adicionar um comando estritamente complementar:

```js
session.startDefaultConfirmed(payload) → Promise<boolean>
```

Ele usará a mesma preparação, chamará `createSession({ failurePresentation:'caller' })` diretamente e resolverá:

- `true` somente depois da persistência bem-sucedida;
- `false` se preparação, validação ou persistência falhar.

`createSession()` receberá um argumento opcional com default compatível:

```js
createSession({ failurePresentation = 'session-dialog' } = {})
```

Em `session-dialog`, o comportamento de falha atual permanece idêntico. Em `caller`, o rollback e a restauração do formulário continuam obrigatórios, mas `#sessionStartDialog` não abre e não toma o foco; o chamador apresenta o erro em sua própria superfície.

O comando não recebe nem conhece as quatro respostas. Portanto, nenhuma delas pode entrar no objeto Session.

### 4.3 Revalidação antes do início

`todayCurrentRehearsalPayload()` deve recalcular `todayPrimaryState()` e exigir simultaneamente:

- `state.view === 'today'`;
- primary `kind === 'capability'`;
- mesmo `outcomeId`;
- mesmo `attemptId` atual;
- mesmo `refKey` do plano;
- Capability ativa e tentativa atual, já garantidas pelo resolvedor;
- nenhuma execução ativa, garantida novamente pelo contrato de Session.

Somente depois disso o payload é reconstruído com `todayCapabilitySessionOptions()` a partir do estado atual. Não se reutilizam options ou textos capturados na abertura.

Se a revalidação falhar, o diálogo é descartado e fechado, Hoje renderiza o estado atual, o foco vai para a ação primária disponível e um aviso neutro informa que a tentativa mudou ou não está mais disponível.

### 4.4 Ciclo de vida do draft

- Abrir: limpar quatro campos e erro; capturar apenas IDs/refKey/opener; abrir modal; focar a primeira pergunta.
- Digitar: nenhuma função de persistência, evento de domínio ou log é chamado.
- Começar: desabilitar ações concorrentes, revalidar e aguardar `session.startDefaultConfirmed`.
- Sucesso: limpar runtime/campos, fechar o diálogo e deixar Sessions focar Companion/banner.
- Falha de escrita: manter o diálogo e as respostas, reabilitar ações, exibir/focar erro local.
- Pular: limpar as respostas antes de iniciar; uma falha deixa o diálogo aberto e vazio, porque o abandono foi explícito.
- Cancelar/Escape/close: limpar runtime/campos/erro, fechar e devolver foco pelo contrato de diálogo.
- Reload: o DOM e o runtime são reconstruídos vazios; nenhuma restauração é tentada.

O evento nativo `cancel` será interceptado para executar a mesma limpeza do botão `Cancelar`. O evento `close` fará uma limpeza idempotente para cobrir fechamento programático ou desmontagem.

### 4.5 Apresentação em `design-system.css`

Reutilizar `.session-dialog`, `.session-dialog-head/body/foot`, `.field`, botões e o aprimoramento de foco atual. Adicionar apenas regras escopadas para:

- `.attempt-rehearsal-context`;
- `.attempt-rehearsal-grid`;
- `.attempt-rehearsal-grid textarea`;
- `.attempt-rehearsal-actions`.

O grid terá uma coluna por padrão. As textareas terão altura inicial compacta, resize vertical e quebra segura, sem altura fixa obrigatória. O próprio diálogo manterá `max-height` e overflow vertical existentes.

Adicionar `#todayRehearsalDialog` aos seletores pilot que hoje abrangem `#todayDialog`, `#sessionStartDialog` e `#sessionFinishDialog`, garantindo inputs, padding, footer, backdrop, forced-colors e viewport mobile coerentes.

Em ponteiro grosso, todas as ações terão pelo menos 44×44 px. Em até 390 px, o footer ficará em uma coluna e os três botões usarão a largura disponível. Não alterar estilos globais de Hoje ou de outros diálogos.

### 4.6 Documentação e PWA

- `docs/today-feature.md`: ação, hierarquia, elegibilidade, perguntas, revalidação e ausência fora do primary.
- `docs/sessions-feature.md`: equivalência do default confirmado, rollback e proibição de transportar respostas.
- `docs/capability-first-compasso.md`: ciclo Capability → tentativa → ensaio opcional → execução e fronteira efêmera.
- `app-manifest.js`: avançar exatamente uma vez de `compasso-pages-v82` para `compasso-pages-v83`; módulos, collections, contracts e Service Worker permanecem iguais.

## 5. Interfaces

### Payload compartilhado de início

```js
{
  domain: 'learningOutcome',
  itemId: outcomeId,
  options: {
    learningContext,
    resources
  },
  trigger
}
```

O payload é reconstruído no clique de início e não contém `result`, `firstAction`, `difficulty`, `response` ou qualquer chave equivalente.

### Seletores DOM estáveis

```text
[data-today-primary-rehearse]
#todayRehearsalDialog
#todayRehearsalForm
#todayRehearsalResult
#todayRehearsalFirstAction
#todayRehearsalDifficulty
#todayRehearsalResponse
#todayRehearsalError
[data-today-rehearsal-cancel]
[data-today-rehearsal-skip]
#todayRehearsalSubmit
```

Esses seletores pertencem apenas à UI e aos testes. Não se tornam contrato persistido.

### Retornos e erros

| Interface | Sucesso | Falha |
| --- | --- | --- |
| `todayOpenRehearsal` | abre e retorna `true` | não abre, feedback neutro, `false` |
| `todayCurrentRehearsalPayload` | payload atual destacado acima | `null`; nunca substitui alvo |
| `sessionPrepareDefault` | formulário default pronto, `true` | `false`; sem escrita |
| `session.startDefaultConfirmed` | Promise resolve `true` após save | Promise resolve `false` após rollback/validação |
| `todayStartFromRehearsal` | limpa e fecha após confirmação | mantém draft em erro de escrita; descarta em alvo obsoleto |

## 6. Estados e transições

```text
CLOSED
  └─ abrir alvo válido ─→ OPEN_EMPTY
                           ├─ digitar ─→ OPEN_DRAFT
                           ├─ cancelar/Escape/reload ─→ CLOSED + descarte
                           ├─ alvo obsoleto ao iniciar ─→ CLOSED + descarte + Hoje atual
                           └─ iniciar ─→ STARTING
                                         ├─ persistiu ─→ CLOSED + Session ativa
                                         └─ falhou ─→ OPEN_ERROR + draft preservado
```

`Pular ensaio e começar` passa por `STARTING`, mas limpa o draft antes da tentativa de persistência.

## 7. Fluxos importantes

### Início direto inalterado

```text
Iniciar agora
→ todayStartCapability(immediate:true)
→ session.startDefault
→ requestSubmit existente
→ createSession default
```

### Ensaio e sucesso

```text
Ensaiar tentativa
→ Today valida primary e abre diálogo vazio
→ usuário prepara respostas localmente
→ Começar sessão
→ Today revalida outcome + attempt + plan ref
→ session.startDefaultConfirmed com payload fresco e sem respostas
→ createSession persiste Session + Execution
→ true
→ diálogo e draft são descartados
→ Companion/banner recebe foco
```

### Falha de persistência

```text
Começar sessão
→ candidato criado pelo fluxo existente
→ saveData retorna false
→ estado anterior restaurado + compensação existente
→ session.startDefaultConfirmed retorna false sem abrir configuração
→ Today mantém as quatro respostas
→ erro local recebe foco
```

### Tentativa obsoleta

```text
diálogo aberto para tentativa A
→ estado atual passa a B / Capability some / plan ref muda
→ usuário tenta começar
→ Today reprova igualdade exata
→ nenhum comando de persistência
→ draft descartado
→ Hoje atualiza e focaliza a ação válida
```

### Offline e reload

```text
shell v83 controlado e cacheado
→ diálogo funciona somente no DOM
→ reload offline antes de iniciar: diálogo/draft somem, zero Session
→ novo ensaio inicia Session pelo storage local
→ reload offline depois do save: Session é retomada pelo fluxo atual
```

## 8. Decisões significativas

| Decisão | Justificativa | Alternativas rejeitadas |
| --- | --- | --- |
| Today é dono do preflight | Só Hoje conhece o primary e consegue revalidar outcome, attempt e plan ref sem inferência | Colocar ensaio genericamente em todas as Sessions; nova rota |
| Diálogo único | Quatro perguntas cabem no padrão existente com semântica/foco responsivos | Wizard, carousel, quatro modais |
| Respostas apenas em controles DOM | Menor estado possível e impossível de entrar no backup por acidente | Novo model, collection, localStorage/sessionStorage |
| Metadados mínimos no runtime | Permite vínculo exato e controle de concorrência sem conteúdo pessoal | Guardar respostas ou snapshot completo no runtime |
| Novo comando confirmado | Permite aguardar persistência sem quebrar `session.startDefault` | Tornar comando atual assíncrono; polling da Session; observar toast |
| `createSession` com apresentação de falha opcional | Reutiliza transação/rollback e evita dois modais concorrentes | Duplicar criação de Session em Hoje; callback com conteúdo |
| Payload fresco no início | Evita Session para tentativa antiga ou alvo substituído | Reusar `learningContext` capturado ao abrir |
| `Ajustar sessão` passa a quiet | Mantém uma ação primária e uma secundária clara no card | Três botões com peso alto; esconder configuração |
| Erro de escrita mantém draft | Session não começou; preservar trabalho local na página melhora recovery | Descartar ao clique ou persistir para retry |
| Skip descarta antes do start | A ação expressa abandono explícito do ensaio | Transportar draft ocultamente ou preservá-lo após skip |
| Geração v83 | JS/CSS novo precisa de shell coerente instalado | Reusar v82; editar Service Worker |
| Sem migration | Nenhum dado novo é durável | Campo em Session, Capability ou dailyPlan |

## 9. Privacidade, segurança, desempenho e operação

- **Privacidade:** as quatro respostas não saem do DOM, não são enviadas, serializadas, exportadas ou registradas.
- **Segurança de saída:** Capability e tentativa entram no diálogo por `textContent`; IDs usados em HTML seguem `escapeHtml` e seletores usam `CSS.escape` quando necessário.
- **Logs:** nenhum texto do ensaio entra em `console`, toast, runtime diagnostics ou mensagens de erro.
- **Concorrência:** `starting` e os controles desabilitados evitam duplo início; `executionCanStart()` permanece a autoridade final.
- **Desempenho:** quatro controles e um runtime pequeno; sem scan adicional de Evidence, worker, timer, listener periódico ou rede.
- **Operação:** mudança estática em JS/CSS/docs/testes e uma geração do manifesto; sem pacote, lockfile, CI, permissão ou ambiente novo.
- **Publicação:** commit, push, PR, merge, Pages e release permanecem fora da autorização desta fase.

## 10. Manifesto fechado para Build

O manifesto de produto, documentação e testes está fechado em **13 caminhos exatos**.

| # | Ação | Caminho exato | Propósito | Dependências | Cobertura |
| ---: | --- | --- | --- | --- | --- |
| 1 | Modify | `today-feature.js` | Ação secundária, diálogo, runtime efêmero, revalidação, descarte e orquestração | `todayPrimaryState`, Today UI, comando confirmado | AC-01–AC-16, AC-18–AC-21 |
| 2 | Modify | `sessions-feature.js` | Preparação default comum, comando confirmado e apresentação de falha ao caller | `openSessionStartCore`, `createSession`, `saveData` | AC-01, AC-04–AC-06, AC-10–AC-14, AC-18 |
| 3 | Modify | `design-system.css` | Estilo escopado, dialog pilot, reflow, foco, toque e zoom | 1; design system existente | AC-02, AC-07–AC-08, AC-16, AC-19–AC-20 |
| 4 | Modify | `app-manifest.js` | Avançar v82→v83 sem alterar módulos/collections/contracts | 1–3 | AC-17–AC-18, AC-21 |
| 5 | Modify | `docs/today-feature.md` | Documentar ação, perguntas, hierarquia, descarte e elegibilidade | 1 | AC-01–AC-16, AC-21 |
| 6 | Modify | `docs/sessions-feature.md` | Documentar equivalência, confirmação, rollback e ausência de payload pessoal | 2 | AC-01, AC-05–AC-06, AC-10–AC-11 |
| 7 | Modify | `docs/capability-first-compasso.md` | Registrar o novo passo do ciclo e a fronteira efêmera | 1–2 | AC-01–AC-06, AC-16–AC-18 |
| 8 | Modify | `tests/today-central-contract.test.js` | Fixar elegibilidade, hierarquia e quatro prompts sem novo domínio | 1 | AC-01–AC-05, AC-16, AC-21 |
| 9 | Modify | `tests/execution-session-contract.test.js` | Fixar comando atual e confirmado sobre preparação comum | 2 | AC-01, AC-05–AC-06, AC-10–AC-11 |
| 10 | Modify | `tests/app-manifest.test.js` | Exigir v83 e estado v3/collections inalterados | 4 | AC-17–AC-18 |
| 11 | Create | `tests/browser/attempt-rehearsal-flows.spec.js` | Happy path, skip, cancel, no-write, falha, stale, concorrência, reload e exclusões | 1–3 | AC-01–AC-17, AC-19–AC-21 |
| 12 | Modify | `tests/browser/design-system-flows.spec.js` | Teclado, foco, Escape, toque, 360–390 px e 200% zoom | 1–3 | AC-02, AC-07–AC-08, AC-15–AC-16, AC-19–AC-20 |
| 13 | Modify | `tests/browser/pwa-lifecycle-flows.spec.js` | Preflight efêmero e Session durável em refresh offline | 1–4 | AC-09–AC-10, AC-13, AC-17–AC-18 |

O Build report poderá criar `.sdd/reports/attempt-rehearsal/BUILD_REPORT.md`; isso não amplia o manifesto de produto.

### Caminhos congelados

Build não deve modificar `index.html`, `storage.js`, `state-foundation.js`, `learning-outcome-model.js`, `capability-context-model.js`, `execution-session-model.js`, `execution-session-feature.js`, `service-worker.js`, `app-composition.js`, `design-system-feature.js`, Evidence/learningSignals/Weekly Review/Errors/Ritual/Deep Work/backup/vault/Notes/Relations/Journal/Contextual AI, packages, lockfile, Playwright config, CI, snapshots, dependências, outras deliveries ou artefatos SDD arquivados.

Qualquer necessidade de caminho não listado exige `$sdd-iterate` antes da implementação.

## 11. Ordem de implementação

1. Adicionar assertions Node falhando para a hierarquia de Hoje, prompts e contratos de início.
2. Criar o spec browser dedicado com início direto, diálogo, no-write, cancel/skip e equivalência.
3. Implementar runtime, markup, limpeza e revalidação em Hoje.
4. Extrair `sessionPrepareDefault`, manter `session.startDefault` e adicionar `session.startDefaultConfirmed`.
5. Parametrizar somente a apresentação de falha de `createSession`, preservando rollback.
6. Fechar sucesso, falha, stale target, concorrência, reload e reabertura limpa no spec dedicado.
7. Adicionar CSS estritamente escopado e validar desktop/mobile/zoom/teclado.
8. Avançar o manifesto/teste para v83.
9. Adicionar o cenário offline controlado.
10. Atualizar os três documentos proprietários.
11. Executar regressões focadas, validação canônica completa, checks sintáticos e `git diff --check`.
12. Criar o Build report e parar antes de Ship ou ações Git/publicação.

## 12. Plano de testes e comandos

### Contratos Node

```powershell
node --test tests/today-central-contract.test.js tests/execution-session-contract.test.js tests/app-manifest.test.js
```

Verificar ação primária antes do ensaio, quatro prompts, novo comando complementar, comando antigo preservado, preparação compartilhada, v83 e ausência de collection/schema novo.

### Fluxo funcional do ensaio

```powershell
npm run build:test
npx playwright test tests/browser/attempt-rehearsal-flows.spec.js --project=chromium --project=mobile --retries=0
```

Cobrir início direto, abertura vazia, quatro respostas, parcial/vazio, skip, cancel, Escape, reabertura limpa, ausência de escrita, equivalência da Session, ausência dos textos no estado, falha de persistência/retry, tentativa alterada, Capability ausente, execução concorrente, reload antes/depois e exclusão de outros domínios.

### Acessibilidade e regressão de contexto

```powershell
npx playwright test tests/browser/design-system-flows.spec.js tests/browser/capability-context-flows.spec.js --project=chromium --project=mobile --retries=0
```

Verificar foco inicial/retorno/contenção, labels, Escape, ordem, 44 px, 360/390 px, 200% zoom, Evidence Recall, start/configure, Evidence e calibração.

### Persistência, backup e fallback

```powershell
npx playwright test tests/browser/local-data-safety-flows.spec.js --project=chromium --retries=0
node --test tests/state-foundation.test.js tests/storage-quota.test.js
```

O spec browser existente cobre backup/restore e os contratos Node reais cobrem normalização e quota/fallback. Não modificar storage ou fixtures para acomodar o ensaio.

### Offline/PWA

```powershell
node --test tests/app-manifest.test.js tests/service-worker-composition.test.js tests/bootstrap-recovery.test.js
npx playwright test tests/browser/pwa-lifecycle-flows.spec.js --project=chromium --grep "rehearsal|ensaio|controlled complete cache" --retries=0
```

Verificar abertura/typing/cancelamento sem rede, reload pré-início sem draft/Session, início local confirmado, reload pós-início com retomada e geração v83 coerente.

### Gate canônico

```powershell
node --check today-feature.js
node --check sessions-feature.js
node --check tests/browser/attempt-rehearsal-flows.spec.js
npm run test:all
git diff --check
```

Não regenerar snapshots Linux no Windows. Mudança visual intencional deve ser inspecionada em 360, 390, 768 e 1280 px; snapshot canônico Linux só poderá mudar por execução Linux explícita e revisão visual.

## 13. Rastreabilidade de aceitação

| AC | Dono principal | Evidência determinística |
| --- | --- | --- |
| AC-01 início imediato | Today + Sessions | Browser compara caminho direto; contrato mantém `session.startDefault` |
| AC-02 preflight vazio | Today + CSS | Diálogo único, quatro campos e zero writes |
| AC-03 respostas completas | Today | Estado serializado idêntico durante digitação |
| AC-04 parcial/vazio | Today + Sessions | Browser inicia sem validação de conteúdo |
| AC-05 skip | Today + Sessions | Draft limpo e Session default confirmada |
| AC-06 respostas não persistidas | Sessions | Busca por textos em todo `state.data`, backup e projeção retorna zero |
| AC-07 cancelar | Today + design system | Sem Session/mutação e foco no opener |
| AC-08 Escape | Today + design system | Mesmo descarte e retorno de foco |
| AC-09 reload pré-início | Today + PWA | Diálogo fechado, campos vazios, zero Session |
| AC-10 reload pós-início | Sessions + PWA | Session/Execution retomáveis; sem draft |
| AC-11 falha de persistência | Sessions + Today | Rollback, draft preservado, erro focado, retry bem-sucedido |
| AC-12 tentativa alterada | Today | Igualdade outcome/attempt/ref falha e nenhum start |
| AC-13 Capability indisponível | Today | Falha fechada sem alvo substituto |
| AC-14 execução concorrente | Today + Sessions | Active execution mantém precedência |
| AC-15 reabertura limpa | Today | Quatro campos vazios após cada descarte |
| AC-16 hierarquia/Recall | Today + CSS | Classes/ordem/foco e Recall existente preservados |
| AC-17 legado/backup | Manifest + regressões existentes | state v3/collections iguais e round-trip verde |
| AC-18 offline | Manifest + PWA | Fluxo completo no shell controlado sem rede |
| AC-19 mobile | CSS + browser | 360/390 px, 200% zoom, 44 px, sem overflow |
| AC-20 teclado/foco | Today + design system | Labels, Tab, Escape, erro e retorno de foco |
| AC-21 outros domínios | Today + regressão | Nenhum seletor de ensaio fora do primary Capability |

**Rastreabilidade: 21/21 cenários têm dono e evidência definida.**

## 14. Migration e compatibilidade

### Migration

**Not applicable.** Não existe campo, collection, object store, chave, envelope, versão de banco ou associação durável nova.

### Compatibilidade

- `compasso.state.v3` permanece autoritativo.
- IndexedDB primário e localStorage fallback recebem apenas a Session normal já existente.
- Backups antigos continuam restauráveis; backups novos não contêm ensaio.
- Markdown/vault não recebe novo bloco ou frontmatter.
- Sessions e Evidence legadas permanecem válidas.
- Today, Evidence Recall, calibração, Weekly Review, Errors, Rituals e Deep Work preservam semântica.
- `session.startDefault` mantém retorno e comportamento atuais; o novo comando é aditivo.

## 15. Rollout e rollback

Build produzirá apenas um candidato local estático v83. Ship e publicação continuam gates separados.

Antes de qualquer publicação, rollback consiste em reverter os treze caminhos do manifesto como uma unidade. Depois de v83 alcançar clientes, rollback operacional exige uma geração futura — no mínimo v84 — contendo a reversão. Não reutilizar v82/v83 e nunca limpar IndexedDB, localStorage, backups ou caches não pertencentes ao Compasso.

Como o ensaio não grava dados, não existe rollback de dados. Sessions iniciadas por ele são Sessions normais e permanecem válidas mesmo que a UI seja revertida.

## 16. Riscos e mitigação

| Risco | Mitigação |
| --- | --- |
| Draft entrar na Session | Novo comando recebe somente payload canônico; respostas ficam no DOM; busca de vazamento no estado |
| Comando atual mudar | Helper comum, mas assinatura/retorno de `session.startDefault` congelados e testados |
| Draft descartado antes do save | Await do comando confirmado; limpeza apenas após `true` |
| Dois modais em falha | `failurePresentation:'caller'` impede abertura de `#sessionStartDialog` |
| Start para tentativa nova | Revalidar outcomeId + attemptId + refKey imediatamente antes do comando |
| Duplo clique criar duplicata | Runtime `starting`, botões desabilitados e `sessionRuntime.creating` existente |
| Foco voltar para botão removido | Design system tenta opener; Sessions move foco final para Companion/banner; fallback de Hoje em stale |
| Quatro campos estourarem mobile | Grid único, textareas compactas, dialog scrollável e testes 360/390/zoom |
| CSS afetar outros diálogos | Novas classes escopadas e apenas inclusão explícita nos seletores pilot |
| Cache misturar JS antigo/novo | Avanço único v83 e teste PWA controlado |
| Backup/schema sofrer mudança acidental | Manifest collections/contracts congelados e regressão local-data-safety |
| Main mudar antes do Build | Revalidar HEAD, geração e owners; usar `$sdd-iterate` se houver drift material |

## 17. Condições de parada do Build

Parar e usar `$sdd-iterate` se a implementação exigir:

- persistência, sessionStorage, novo schema/collection/field ou conteúdo do ensaio em Session;
- rota, wizard, carousel, múltiplos modais ou ensaio fora do primary Capability;
- mudança assíncrona de `session.startDefault`;
- novo model, dependency, framework, backend, integração, analytics ou IA;
- alteração em storage, state foundation, backup, Markdown, Service Worker, Deep Work, Evidence ou Weekly Review;
- arquivo fora do manifesto fechado;
- snapshot atualizado sem revisão Linux apropriada;
- alteração de requisitos, hierarquia primária ou baseline materialmente divergente.

## 18. Evidência de baseline e do Design

- Worktree: `C:\Users\Giuse\OneDrive\Documentos\Every Second Counts\every-second-counts-app-attempt-rehearsal`.
- Branch: `codex/attempt-rehearsal`, rastreando `origin/main`.
- HEAD e `origin/main`: `b7246f48ba8177860041892bbdebd97ac15df7c9`.
- `.codegraph/`: ausente; inspeção direta das fontes, testes, documentação, manifesto e CI foi usada como fallback autorizado.
- Owners inspecionados: `today-feature.js`, `sessions-feature.js`, `design-system.css`, `design-system-feature.js`, `feature-runtime.js`, `app-manifest.js`, `index.html`, documentação e specs relacionados.
- Comandos reais confirmados em `package.json`: `npm test`, `npm run build:test`, `npm run test:browser`, `npm run test:all`.
- Validação Node fresca em 2026-09-15 (`npm test`): **216 passed, 0 failed, 0 skipped**.
- Baseline browser focado registrado no DEFINE: **50 passed, 0 failed, 14 skips condicionais**.
- Manifesto atual: `compasso-pages-v82`; estado: `compasso.state.v3`.
- O `npm ci` anterior passou; duas vulnerabilidades high reportadas pelo audit permanecem fora deste slice sem dependências, e nenhum fix automático foi executado.
- Alterações desta fase: somente `DEFINE.md` e `DESIGN.md`; nenhum código de produção, teste, pacote ou configuração foi modificado.

## 19. Gate de qualidade do Design

- DEFINE ≥12/15: PASS — 15/15.
- Repositório, owners, testes, CI e manifesto inspecionados: PASS.
- Estado atual, gap e estado-alvo: PASS.
- Interfaces, erros e transições: PASS.
- Decisões e alternativas rejeitadas: PASS.
- Manifesto fechado: 13 caminhos.
- Rastreabilidade: 21/21.
- Migration/compatibilidade/rollback: PASS — sem migration.
- Privacidade, segurança, performance, offline, mobile e acessibilidade: PASS.
- Comandos de validação fundamentados no repositório: PASS.
- Código de produção alterado nesta fase: não.
- Bloqueador aberto: nenhum.

**Design readiness: PASS — manifesto e arquitetura preservados. Build corretiva da seção 21: PASS local conforme `BUILD_REPORT.md`; Ship permanece pendente de repetição.**

## 20. Histórico de revisão

| Revisão | Data | Mudança |
| --- | --- | --- |
| 1.0 | 2026-09-15 | Design inicial baseado no baseline v82 e nos contratos atuais de Hoje, Sessions, persistência e PWA. |
| 1.1 | 2026-09-15 | Build concluída conforme manifesto fechado, com 21/21 cenários aceitos e relatório de evidências. |
| 1.2 | 2026-09-16 | Iterate de evidência após Ship: aceitação completa invalidada, correção de lifecycle/rodapé e testes especificada sem ampliar o manifesto ou alterar requisitos. |
| 1.3 | 2026-09-16 | Correção da seção 21 concluída e validada: 21/21 cenários locais, 218 Node + 272 browser passed, 24 skips condicionais. Sem nova decisão de schema ou ampliação de escopo; repetir Ship. |

## 21. Correção escopada após revisão de Ship — 2026-09-16

Classificação: **modifying**, refinamento de integração e evidência. DEFINE, usuários, requisitos, arquitetura, schema e os 13 caminhos permanecem os mesmos. Nenhuma correção de produção foi aplicada durante Ship.

### Lifecycle de navegação — Today

O evento existente `view:changed` deve invalidar o preflight quando o destino não for Hoje, limpar as quatro respostas e fechar a superfície. Voltar a Hoje não pode ressuscitar o diálogo ou rascunho. Não depender do clique em Começar para limpar um contexto que já foi abandonado.

Se uma criação já estiver aguardando persistência, a mudança de rota não deve cancelar/duplicar a transação, liberar indevidamente `starting` ou desfazer uma Session confirmada. A UI abandonada deve ser limpa sem reabrir erro ou deslocar foco para um botão oculto depois do resultado assíncrono. O controle necessário permanece metadado efêmero em Today, sem respostas no runtime, novo modelo ou alteração do motor de persistência.

### Rodapé móvel — CSS

Em até 390 px, o seletor escopado ao diálogo deve prevalecer sobre os seletores pilot posteriores. Exigir rodapé efetivamente em uma coluna, botões com largura disponível e texto legível. Não alterar o rodapé de outros diálogos. Testar o estilo computado e as posições dos botões, além de overflow e tamanho de toque.

### Evidência corretiva — testes do manifesto

1. Navegar com preflight preenchido, inclusive pelo caminho usado por `popstate`; confirmar fechamento, limpeza, nenhuma Session, retorno estável e reabertura vazia.
2. Navegar durante um save controladamente pendente; confirmar sem duplicação, sem rollback de sucesso, sem erro/foco reaberto na rota abandonada.
3. Acionar realmente `Pular ensaio e começar`, com texto e sem texto; em falha, exigir draft vazio; em sucesso, exigir a Session normal.
4. Renomear o teste de retry atual para descrever o que ele realmente verifica; cobrir submissão vazia/parcial explicitamente.
5. Promover os probes de Capability arquivada/excluída a testes de regressão.
6. Verificar os marcadores também no JSON exportado e na exportação Markdown existente, e completar start → refresh → resume → finish → Evidence após ensaio.
7. Fixar coluna do rodapé em 360 e 390 px; manter zoom, teclado, targets e inspeção 768/1280.

Retornar por `sdd-build` nos mesmos caminhos; repetir testes relevantes e o gate canônico, atualizar o Build report e repetir Ship. O candidato local ainda não publicado permanece v83; nenhuma geração exposta deve ser reutilizada se publicação vier a ser confirmada. Git/publicação continuam gates separados.
