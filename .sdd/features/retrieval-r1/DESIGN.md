# DESIGN: Retrieval R1 — Match retrieval to future use

## Metadata

| Field | Value |
|---|---|
| Feature slug | `retrieval-r1` |
| Initiative | Retrieval aligned to future use |
| Delivery | R1 — Match retrieval to future use |
| Date | `2026-08-12` |
| Status | **Complete (Built)** |
| Authoritative contract | `.sdd/features/retrieval-r1/DEFINE.md` |
| Supporting rationale | `.sdd/features/retrieval-r1/BRAINSTORM.md` |
| Repository baseline | `origin/main` at `6047c5fb32aad66ff2892ca4fdbbc7ca5f28ba65` |
| State contract | `compasso.state.v3` |
| Current PWA generation | `compasso-pages-v75` |
| Forward Build generation | `compasso-pages-v76` |

## Design status

**Complete (Built).**

The approved behavior was implemented with one additive optional field, one shared normalizer/presentation contract, and projections through the existing learning and execution paths. No schema migration, new collection, new route, parallel execution model, or external dependency was introduced. The product direction and all 25 acceptance scenarios remain unchanged.

## Current implementation evidence inspected

`.codegraph/` is absent in the authoritative worktree, so current source and tests were inspected directly.

| Area | Current evidence | Design consequence |
|---|---|---|
| Capability owner | `learning-outcome-model.js` owns `nextAttempt`, outcome normalization, create/update commands, and `createExecutionContext()` | Add the seven-value contract here; do not create a new domain module or record. |
| UI owner | `learning-outcome-feature.js` owns create/edit, attempt cards, resource links, execution launch, transactional persistence, draft retention, and accessible error focus | Extend the existing modal and card; no screen or wizard. |
| Lightweight references | `capability-context-model.js` deliberately keeps `outcomeId`, `attemptId`, and `attemptText` for Hoje, signals, and reflections; its execution reader delegates to `learningOutcomeModel.normalizeExecutionContext()` | Keep lightweight durable references unchanged. Future use is not added to Today items, signals, or reflections. |
| Hoje | `todayPrimaryState()` enforces active execution → current capability attempt → other action → planning; Today starts capability work with a capability reference | Preserve ranking; use the current outcome only for display and use `createExecutionContext()` only at start. |
| Global Execute | `information-architecture-feature.js` delegates to existing execution and Today commands, including deterministic fallback focus | No product change. Future use never selects a route or mode. |
| Session | `sessions-feature.js` normalizes `options.learningContext`, supports immediate defaults and optional configuration, persists it on the source Session, and syncs canonical execution | Extend the shared context at its existing boundary; no second choice. |
| Deep Work | `deep-work-feature.js` passes the same normalized context into `deep-work-model.js`; lifecycle transitions retain it and `executionSyncDeep()` projects it canonically | Render the same snapshot; retain v75 interruption/reload/missing-source recovery. |
| Canonical execution | `execution-session-model.js` normalizes both normal Session and Deep Work through `CompassoLearningOutcomeModel.normalizeExecutionContext()`; `execution-session-feature.js` syncs source records | One shared propagation path already exists. No canonical model or adapter change is required. |
| Session companion | `session-companion-feature.js` reads active canonical execution and source `learningContext` for both execution modes | It is the stable, visible active-session projection point for the historical label. |
| Evidence | `evidence-feature.js` resolves `Evidence.sessionId` to canonical execution through `capabilityContextModel.evidenceContext()`; Evidence persistence has no learning-context field | Add read-only projection only; keep Evidence shape unchanged. |
| Weekly Review | `weekly-review-feature.js` already groups canonical executions, resolves current attempts, and applies explicit keep/revise transactionally | Show historical snapshots separately from the current owner; revise updates the current attempt object, while keep does not. |
| Active Recall | `recall-feature.js`, review items, scheduling, ratings, history, and `weakness-feature.js` are independent of capability execution context | Protected non-owner; no change. |
| State and merge | `state-foundation.js` migrates in place to v3, calls outcome normalization, merges whole records by `updatedAt`, preserves equal-time conflicts, honors collection tombstones, and retains compatible unknown top-level state | Keep record-level merge and v3. No field-level merge/tombstone. |
| Storage and backup | `storage.js` stores the whole state in IndexedDB with localStorage fallback; `index.html` exports/imports JSON and normalizes on import | Nested optional fields round-trip naturally; no store, key, or envelope change. |
| PWA | `app-manifest.js` owns cached composition and currently declares `compasso-pages-v75`; `service-worker.js` consumes the manifest-owned asset/cache contract | Cached product assets change, so Build advances only the generation to v76. Service Worker architecture remains unchanged. |
| Validation | Existing Node, Playwright Chromium/mobile, PWA, accessibility, backup, merge, and protected-domain suites cover the affected boundaries | Extend canonical suites rather than add parallel test infrastructure. |

## Target architecture

### Durable ownership

```text
learningOutcome.nextAttempt.futureUse?          canonical current owner
                   │ explicit start snapshot
                   ▼
source Session/Deep Work learningContext        lifecycle/recovery copy
                   │ existing canonical sync
                   ▼
executionSession.learningContext.futureUse?     canonical historical owner
                   │
                   ├── Session / Deep Work presentation
                   ├── Evidence projection through Evidence.sessionId
                   └── Weekly Review historical context
```

No other record receives `futureUse`. In particular, `dailyPlans.items[].capabilityRef`, `learningSignals[].capabilityRef`, `weeklyReviews[].capabilityReflections[].capabilityRef`, Evidence, review items, Notes, Studies, and Readings remain structurally unchanged. The source Session/Deep Work copy is the already-established recovery/provenance representation of the same immutable execution snapshot, not an independent semantic owner.

### Canonical representation

The normalized representation is an omitted optional property:

```js
nextAttempt = {
  id,
  text,
  // futureUse is present only for one supported key
  futureUse?,
  createdAt,
  updatedAt
}

learningContext = {
  outcomeId,
  attemptId,
  attemptText,
  // copied at start; present only for one supported key
  futureUse?
}
```

`null`, empty text, missing property, and unknown loaded values normalize to property omission. There is no persisted `unspecified` value. Omission is the only canonical absence, matching current optional-field conventions and making repeated normalization idempotent.

### Stable domain and presentation contract

`learning-outcome-model.js` exports one frozen domain list and one read-only presentation lookup:

| Key | pt-BR label | Progressive guidance intent |
|---|---|---|
| `remember` | Lembrar com precisão | Recordar fatos, termos, passos ou relações com precisão. |
| `explain` | Explicar com suas palavras | Reconstruir e comunicar a ideia sem depender do texto original. |
| `solve` | Resolver problemas | Aplicar a ideia em questões ou casos diferentes dos exemplos. |
| `build` | Construir ou produzir | Criar uma entrega, modelo, texto, código ou artefato usando a ideia. |
| `decide` | Decidir e justificar | Usar a ideia para escolher e sustentar uma decisão. |
| `simulate` | Praticar em condições reais ou de prova | Executar sob condições próximas às de uso, avaliação ou pressão real. |
| `integrate` | Conectar e combinar ideias | Relacionar esta capacidade a outras ideias para formar uma explicação ou solução maior. |

The model exposes:

- `FUTURE_USES`: frozen stable keys;
- `normalizeFutureUse(value)`: tolerant read normalizer returning a supported key or `null`;
- `futureUsePresentation(value)`: read-only `{ value, label, guidance }` or `null`;
- an internal explicit-command parser that accepts missing/blank/`null` as clear and throws `future-use-invalid` for unsupported non-empty input.

UI modules consume these exports for labels and guidance. They do not duplicate the allowed-value set or validation.

## LearningOutcome model design

### `normalizeAttempt`

After the existing required text and timestamps are normalized, call the tolerant future-use normalizer. Build the returned attempt with a conditional property spread. Unknown optional input is discarded without rejecting the attempt. Existing ID, text, and timestamp fallback behavior is unchanged.

### `normalizeOutcome` and `normalizeCollection`

No new branching is required beyond the widened `normalizeAttempt()`. Legacy string attempts remain valid and omit future use. Duplicate-record selection still uses the parent outcome `updatedAt`; normalization remains idempotent.

### `createOutcome`

- A string `nextAttempt` remains accepted and creates no future-use field.
- An object `nextAttempt` reads `{ text, futureUse? }`.
- Missing/blank/`null` future use produces omission.
- Unsupported non-empty explicit input throws `future-use-invalid` before a candidate is returned.
- The optional property is included only when valid.

### `updateOutcome`

The command distinguishes compatibility callers from explicit field ownership:

| Input | Result |
|---|---|
| `nextAttempt` absent | Preserve text and future use. |
| legacy `nextAttempt: "text"` | Update text and preserve current future use. |
| object with `text`, no own `futureUse` | Update text and preserve current future use. |
| object with valid own `futureUse` | Update text/value atomically. |
| object with blank or `null` own `futureUse` | Update text and explicitly omit current future use. |
| object with unsupported non-empty own `futureUse` | Throw `future-use-invalid`; return no candidate. |

The current attempt ID and `createdAt` are preserved. `nextAttempt.updatedAt` advances when either normalized text or normalized future use changes; unrelated outcome edits preserve the attempt timestamp. The parent `updatedAt` retains its current command behavior. Because the feature persists a cloned candidate only after validation, text and future use cannot partially commit.

### `normalizeExecutionContext` and `createExecutionContext`

`normalizeExecutionContext()` retains its three required core fields. It conditionally includes only a supported `futureUse`; an unsupported loaded optional value is omitted while the core context remains valid. `createExecutionContext(outcome)` normalizes the outcome once and copies the four-field snapshot when present. It never returns a live reference to `nextAttempt`.

## Capability editor and capability projections

### Semantic control

Add a native `<select name="futureUse">` immediately before the existing Next Attempt text area:

- visible label: **Como você precisará usar isso?**;
- optional qualifier in label/help text;
- first option: **Não especificado**, value `""`;
- seven options from the central model presentation contract;
- a nearby descriptive hint updated from the selected option's `guidance`;
- the select is associated with its label and hint using current form semantics.

A native select is the smallest fitting control for seven mutually exclusive optional choices. It provides platform keyboard/type-ahead behavior, compact one-column mobile layout, predictable 200% zoom behavior, and a clear reversible empty option without eight always-visible radio rows. It adds no modal step or blocking question.

### Draft and persistence behavior

`outcomeDraftSignature()` includes the selected value so unsaved-change protection covers it. `outcomeOpen()` populates the current key or the empty option. Submit sends `nextAttempt: { text, futureUse: selected || null }`. On `future-use-invalid`, existing accessible form error handling focuses the select. On persistence rejection, the cloned candidate is discarded, the dialog remains open, and capability, attempt, resources, and future-use drafts remain available.

### Capability card/history

The current capability card shows a secondary plain-text line **Uso pretendido: {label}** within the existing Next Attempt block. The detail/history projection labels execution snapshots as **Uso na execução: {label}** and reads only the stored execution context. Missing values produce no placeholder. Current and historical values are never substituted for one another.

## Hoje and global Execute

### Hoje presentation

For both the primary capability action and any existing secondary capability row, the resolved current outcome may add one secondary line after the attempt text:

**Uso pretendido: Decidir e justificar**

The line uses ordinary text, not a dominant badge, separate task, live region, button, or ranking token. It wraps within the existing minimum-width-zero content column. If the reference is stale, archived, completed, missing, or not the current attempt, Hoje keeps its current stale/informational treatment and does not obtain future use from another attempt.

Today records remain three-field `capabilityRef` snapshots. At execution start only, `todayCapabilitySessionOptions()` and the direct capability-start command resolve the current outcome and call `learningOutcomeModel.createExecutionContext(outcome)`. That produces the immutable start snapshot without changing Today ownership.

### Exact precedence and Execute behavior

`todayPrimaryState()` and global `Executar` remain unchanged:

1. active/paused execution;
2. valid current planned capability attempt;
3. other incomplete planned action;
4. planning/fallback.

`futureUse` is neither an input to this selection nor a route/mode selector. The value never opens Active Recall, Deep Work, Notes, AI, Studies, Readings, or an exercise automatically. Existing Today fallback and render-stable focus restoration are preserved. No change to `information-architecture-feature.js` is authorized.

## Session, Deep Work, and canonical execution

### Single propagation path

```text
current normalized LearningOutcome
  └─ learningOutcomeModel.createExecutionContext()
       └─ openSessionStartCore() / deepOpenOutcome()
            └─ learningOutcomeModel.normalizeExecutionContext()
                 ├─ source Session.learningContext
                 └─ source DeepWorkSession.learningContext
                      └─ existing executionSyncRegular()/executionSyncDeep()
                           └─ executionSessionModel.fromRegular()/fromDeep()
                                └─ canonical ExecutionSession.learningContext
```

The canonical model already delegates its normalization to the widened `normalizeExecutionContext()`, so it and `execution-session-feature.js` require no product changes. Lifecycle transitions clone/spread the existing record and cannot re-resolve the current capability. Later capability, attempt, future-use, or resource edits therefore cannot rewrite a source or canonical historical snapshot.

### Session

- Capability starts retain immediate existing defaults; there is no new required field or classification step.
- `sessionStartSummary` adds the optional label to the existing context summary when configuration is opened.
- Resource-originated optional capability selection creates the same four-field execution context through `createExecutionContext()` rather than a lightweight capability reference.
- The compact Session companion adds a secondary context line using the active stored snapshot. It is hidden when absent, including legacy sessions.
- Completion, awaited persistence, Evidence capture, optional signal continuation, pause/resume, and recovery behavior do not change.

### Deep Work

Deep Work uses the same start context and adds one read-only context line in its existing full-screen shell, visible in setup/running/recovered states when present. It reads `deepRuntime.selected.learningContext` before start and the persisted active record after start. Interruption, finishing recovery, reload, multi-tab locking, missing-source fallback, and canonical sync retain the snapshot. No Deep Work-specific future-use owner, field, selector, or normalizer is introduced.

### Stable active-session rendering

`session-companion-feature.js` obtains the label from the active stored context returned by `activity()`. Its new text is present in DOM reading order beside the existing activity label/title, hidden when absent, and never changes title, timer, pause/finish controls, notifications, Picture-in-Picture ownership, or navigation behavior.

## Evidence read-only projection

The only permitted read path is:

```text
Evidence.sessionId
  → matching canonical executionSession.id
  → capabilityContextModel.evidenceContext()
  → learningOutcomeModel.normalizeExecutionContext()
  → learningContext.futureUse?
```

`evidenceCapabilityProjection()` and the completion continuation may render **Uso na execução: {label}** from that result. Capability name/access may still use the existing safe resolution, but the historical label never comes from the live outcome. If the canonical execution is missing, invalid, legacy, or unlinked, Evidence remains readable and no label is rendered. Evidence create/edit/export/import retains its existing schema and canonical `sessionId`; no `futureUse` or `learningContext` property is written to Evidence.

## Weekly Review design

### Historical versus current values

Each capability decision card presents two explicitly labeled sources:

1. **Uso da tentativa atual: {label}** — read live from the actionable current `learningOutcome.nextAttempt.futureUse`, directly before reflection/keep/revise controls;
2. **Uso nas execuções: {labels}** — derived only from canonical execution snapshots in the review range, in the existing supporting context. Distinct values may be summarized without changing execution identity.

Expanded weekly Evidence rows show **Uso na execução: {label}** through each Evidence `sessionId`. Thus an old `solve` execution and a current `explain` attempt remain visibly distinct. Missing values omit their line; they are never filled from the other source.

### Keep

**Manter tentativa atual** records the existing reflection decision but does not call `updateOutcome()`. Text, future use, attempt identity, timestamps, source snapshots, and canonical snapshots remain unchanged.

### Revise

The existing revealed revise region gains the same optional native select and model-owned labels. It is prefilled from the current attempt, not historical execution or an earlier reflection. The learner may change text, change future use, or clear it. Save calls:

```js
learningOutcomeModel.updateOutcome(outcome, {
  nextAttempt: { text: decidedAttemptText, futureUse: selectedFutureUse || null }
}, { now })
```

The review candidate, current outcome update, and reflection remain in the existing single persistence transaction. Reflections keep their current lightweight capability reference and decided text; they do not own future use. On validation or persistence failure, stored current/historical data remains unchanged and the draft includes the future-use selection for restoration and retry.

### Focus and decision behavior

Switching to revise reveals text and future-use controls and retains the current focus transition to the attempt text. The future-use select follows it in DOM order. Switching back to keep resets both draft text and draft future use to the card's current values. Error association remains in the existing decision error region; an invalid future-use error targets its select. No mandatory future-use decision is added.

## Active Recall and protected boundaries

Active Recall is a protected non-owner. `recall-feature.js`, `weakness-feature.js`, review item records, schedules, ratings, histories, Error Notebook, and routes remain unchanged. R1 does not create cards, route to Recall, attach future use to cards, alter spaced repetition, or derive weakness from the new value.

The same no-change boundary applies to Studies, Readings, learning signals, Notes, folders, Markdown/vault metadata, wikilinks, Relations, graph derivation, Contextual AI records/routes, Results, Consistency, Drive sync architecture, and all existing routes. Future use provides context only.

## Persistence, merge, backup, and compatibility

### State v3

The state contract remains `compasso.state.v3` because R1 adds only an optional nested property to two already-versioned record shapes. It adds no IndexedDB store, localStorage key, collection, manifest collection, envelope, identity, association, or migration step. `state-foundation.migrate()` continues invoking the model normalizer in place. Legacy absence remains valid; there is no backfill.

### Merge and conflicts

Existing whole-record merge is authoritative:

- `learningOutcomes` and `executionSessions` remain record-timestamp collections;
- a newer outcome wins with its matched `nextAttempt.text`/`futureUse` pair;
- a newer canonical execution wins with its complete stored snapshot;
- equal-timestamp divergent records retain the current audit/conflict-copy behavior;
- learning-outcome and execution tombstones continue applying at record scope;
- no field tombstone, field-level merge, or automatic reconstruction is introduced.

The attempt timestamp advances when text or future use changes, and the parent update command advances the outcome timestamp, so the existing merge winner is deterministic. A deleted outcome is not resurrected because a remote copy contains future use. Historical execution records remain independent of later outcome edits/deletion.

### JSON backup and restore

The current whole-state JSON pipeline naturally includes valid optional fields. Import normalization provides these outcomes:

- old backups without future use restore unchanged and remain executable;
- new current and historical values survive export/import/reload;
- unknown optional values are omitted without dropping their containing attempt/execution;
- Evidence retains only `sessionId` provenance;
- identities, timestamps, associations, protected data, and compatible unknown top-level state are preserved;
- no inference, backfill, duplication, or destructive migration runs.

### Save failure boundaries

Capability editing, Session/Deep Work start/completion, and Weekly Review retain their existing candidate-copy/awaited-save boundaries. Validation happens before candidate commit. Persistence failure restores the last valid `state.data`, keeps the relevant draft where current behavior supports retry, does not announce success, and never rewrites historical snapshots.

## Accessibility and responsive design

- Native selects have explicit visible labels, empty-state wording, programmatic descriptions, platform keyboard/type-ahead behavior, and visible focus from the existing design system.
- Guidance and errors are textual and associated; meaning never relies only on color, icons, or placement.
- Future-use display text is ordinary contextual content, not a live announcement or interactive badge.
- Dialog save/cancel and focus-return behavior remain owned by the existing capability and Weekly Review flows. Invalid explicit input focuses the responsible select through existing error orchestration.
- New form/context rows use the existing one-column/minimum-width-zero patterns and wrap long pt-BR labels. They cannot impose fixed widths.
- At 360–390 px and 200% zoom, selects and text wrap within their container, primary Session/Deep Work/Weekly actions remain visible, and no global horizontal overflow is introduced.
- Existing minimum control heights and native selection affordances serve coarse pointers.
- No animation, timed reveal, scrolling dependency, or motion-only cue is added; existing reduced-motion behavior remains sufficient.
- Session companion context must truncate/wrap without covering the mobile navigation or hiding pause/finish actions.

## PWA and cache generation

The changed model, features, CSS, and manifest are current cached app-shell assets. Build therefore changes only `CompassoAppManifest.cacheName` from `compasso-pages-v75` to **`compasso-pages-v76`** after all runtime changes are present. `contracts.state` remains `compasso.state.v3`; module order, collection catalog, asset ownership, composition slots, install/activate/fetch strategy, cache cleanup, `service-worker.js`, and storage are unchanged.

Automated validation covers manifest composition, current-generation visibility, update convergence, and offline reopen with R1 state. A physical installed-PWA update/close/reopen/offline observation remains an external Ship/release gate, not a substitute for automated checks.

## Closed implementation manifest

### A. Product files expected to change (10)

| # | Path | Action | Responsibility added | Must remain untouched |
|---:|---|---|---|---|
| 1 | `learning-outcome-model.js` | Modify | Central values/presentation, tolerant load normalization, strict command validation, atomic attempt updates, optional execution snapshot | Outcome identity/status/resources/delete semantics; no new collection |
| 2 | `learning-outcome-feature.js` | Modify | Optional editor select/guidance; current and historical labels; nested create/update payload and draft/error support | Capability CRUD, resource ownership, signal consent, transactional save, routes |
| 3 | `today-feature.js` | Modify | Secondary current projection and execution-time `createExecutionContext()` | Today records, precedence/order/completion, Execute fallback and focus |
| 4 | `sessions-feature.js` | Modify | Optional start summary and shared snapshot for resource-originated capability context | Defaults, progressive disclosure, awaited creation/completion, Session/Evidence ownership |
| 5 | `deep-work-feature.js` | Modify | Read-only snapshot context in setup/running/recovery | Deep Work lifecycle, lock, timers, completion/Evidence, recovery architecture |
| 6 | `session-companion-feature.js` | Modify | Read-only active Session/Deep Work snapshot label | Canonical activity selection, controls, notification/PiP/navigation behavior |
| 7 | `evidence-feature.js` | Modify | Historical label projected through canonical `sessionId` | Evidence shape, CRUD, provenance, completion, optional signal handoff |
| 8 | `weekly-review-feature.js` | Modify | Current/historical labels; optional revise select; atomic revise draft/save | Decision-first ordering, keep semantics, reflection shape, collapsed support, save transaction |
| 9 | `design-system.css` | Modify | Durable styles for editor/context/companion/deep/weekly rows and responsive wrapping | Existing tokens, focus, reduced motion, navigation, unrelated surfaces |
| 10 | `app-manifest.js` | Modify | Forward cache generation `compasso-pages-v76` | State v3, module order, collections, assets, Service Worker architecture |

No other product file is authorized. A contradiction discovered during Build must stop that area and return to `$sdd-iterate`; it must not be solved by manifest expansion without an audited Design revision.

### B. Test files expected to change (10)

| # | Path | Coverage responsibility |
|---:|---|---|
| 1 | `tests/learning-outcome-model.test.js` | Domain, absence, tolerant/strict validation, create/edit/clear, idempotence, timestamp, execution snapshot, immutable copies |
| 2 | `tests/execution-session-model.test.js` | Normal and Deep source-to-canonical four-field context, legacy context, history immutability |
| 3 | `tests/deep-work-model.test.js` | Deep normalization, interruption/reload snapshot retention, legacy/malformed optional value |
| 4 | `tests/state-foundation.test.js` | State v3 normalization, whole-record winner, equal-time conflict, tombstone, protected-state and JSON preservation |
| 5 | `tests/app-manifest.test.js` | v76 cache, unchanged state v3/catalog/module/SW ownership contract |
| 6 | `tests/browser/learning-outcome-flows.spec.js` | Editor create/edit/clear/failure, capability labels, Session/Deep snapshot, old/new backup |
| 7 | `tests/browser/capability-context-flows.spec.js` | Hoje, resource Session, Evidence `sessionId`, Weekly keep/revise/history, Active Recall/protected-domain isolation |
| 8 | `tests/browser/information-architecture-flows.spec.js` | Execute precedence/fallback/focus is identical with and without future use |
| 9 | `tests/browser/design-system-flows.spec.js` | Keyboard, labels, errors, focus, 360–390 px, 200% zoom, coarse pointer, reduced motion, overflow |
| 10 | `tests/browser/pwa-lifecycle-flows.spec.js` | v76 update/offline reopen and R1 state continuity without data reset |

No new test file or snapshot update is planned. Existing assertions must be extended semantically, not removed merely to obtain green validation.

### C. Documentation and SDD artifacts (8)

| Path | Action | Purpose |
|---|---|---|
| `.sdd/features/retrieval-r1/DESIGN.md` | Create | Authoritative Build contract |
| `.sdd/features/retrieval-r1/DEFINE.md` | Modify during Design | Mark Define complete/designed; acceptance contract unchanged |
| `docs/capability-first-compasso.md` | Modify during Build | Document optional current owner, historical snapshot, and no inferred progress |
| `docs/today-feature.md` | Modify during Build | Document secondary projection and unchanged precedence/ownership |
| `docs/sessions-feature.md` | Modify during Build | Document shared Session/Deep Work snapshot and recovery |
| `docs/evidence-feature.md` | Modify during Build | Document read-only canonical projection and unchanged Evidence shape |
| `docs/weekly-review-feature.md` | Modify during Build | Document current/historical distinction and keep/revise semantics |
| `docs/active-recall-feature.md` | Modify during Build | Document protected non-owner boundary; no behavioral change |

### D. Inspected and explicitly unchanged

`AGENTS.md`, `capability-context-model.js`, `execution-session-model.js`, `execution-session-feature.js`, `deep-work-model.js`, `history-evidence-model.js`, `recall-feature.js`, `weakness-feature.js`, `state-foundation.js`, `storage.js`, `index.html`, `information-architecture-feature.js`, `app-composition.js`, `service-worker.js`, `outcomes-feature.js`, `analytics-feature.js`, `context-rag-feature.js`, `context-learning-feature.js`, `markdown-vault-feature.js`, `markdown-vault-hardening.js`, `dictionary-relations-feature.js`, `knowledge-graph-feature.js`, `drive-sync-feature.js`, `tests/execution-session-contract.test.js`, `tests/browser/critical-flows.spec.js`, `tests/browser/foundation-flows.spec.js`, and unchanged design-system snapshots.

These files are validation evidence or downstream consumers, not implementation owners. Canonical validation executes their existing regression coverage where included by repository scripts.

## Dependency-ordered Build plan

1. Extend `learning-outcome-model.js` and its unit tests first; freeze representation and command semantics.
2. Extend execution/deep/state tests to prove the shared context and compatibility contract before UI wiring.
3. Add capability editor/card behavior and transactional error/draft handling.
4. Change Today and Session start adapters to create the four-field snapshot at the existing boundary.
5. Add Session companion and Deep Work read-only projections.
6. Add Evidence canonical projection and Weekly Review current/historical/revise behavior.
7. Add durable responsive/accessibility CSS only in `design-system.css`.
8. Extend browser integration, backup, isolation, accessibility, and offline suites.
9. Update feature documentation to match the implemented contract.
10. Advance `app-manifest.js` to v76 only after cached assets are finalized; run focused then canonical validation.

## Closed test plan

### Focused commands

```powershell
node --test tests/learning-outcome-model.test.js tests/execution-session-model.test.js tests/deep-work-model.test.js tests/state-foundation.test.js tests/app-manifest.test.js
npm run build:test
npx playwright test tests/browser/learning-outcome-flows.spec.js tests/browser/capability-context-flows.spec.js tests/browser/information-architecture-flows.spec.js tests/browser/design-system-flows.spec.js tests/browser/pwa-lifecycle-flows.spec.js --project=chromium --project=mobile
npm run test:all
git diff --check
```

Build must also confirm the complete diff is limited to the closed manifest and that no generated snapshot changes, deletions, new persistence fields outside the two owners, or Evidence-owned future-use fields appear.

### Acceptance traceability (25/25)

| Scenario | Concrete evidence |
|---|---|
| AT-01 | Model create-valid test plus capability browser create/select/reload asserts `solve`, label, and no other-domain record |
| AT-02 | Model absent/create-string tests plus editor empty-option execution test asserts property omission and executability |
| AT-03 | Model atomic edit/timestamp test plus capability edit/reload asserts `explain` → `build` under same attempt ID |
| AT-04 | Model explicit-clear test plus editor clear/reload asserts property omission and no inferred label |
| AT-05 | Model attempt/context unknown-value idempotence tests and state-foundation repeated migration fixture retain containing records |
| AT-06 | Capability-context browser Hoje primary projection asserts one action and secondary `decide` label |
| AT-07 | Capability-context Today matrix repeats resume/order/completed/stale cases with/without value; IA precedence regression remains green |
| AT-08 | IA browser Execute matrix asserts identical destination/focus for resume, attempt, other action, and empty fallback |
| AT-09 | Learning-outcome browser immediate Session start asserts defaults, no new question, and snapshotted `build` companion context |
| AT-10 | Learning-outcome browser Deep Work start asserts optional config only, no new question, and `simulate` context |
| AT-11 | Execution/deep unit tests and browser state inspection assert four exact fields in source and canonical records |
| AT-12 | Execution unit immutability plus browser edit/clear/archive/delete/Weekly sequence asserts original source/canonical snapshot |
| AT-13 | Capability-context Evidence test changes live attempt then asserts historical `explain` label via canonical execution |
| AT-14 | Evidence browser state/export/restore assertions prove no direct `futureUse`/`learningContext` field and stable `sessionId` |
| AT-15 | Weekly browser fixture with differing historical/current values asserts separately labeled values before keep/revise |
| AT-16 | Weekly keep browser/state assertion proves text, future use, attempt ID/timestamps, and snapshots unchanged |
| AT-17 | Weekly revise browser test changes/clears value and optional text; model/state assertions prove atomic current update and history retention |
| AT-18 | Capability-context protected-domain fixture exercises Active Recall and asserts cards/schedules/ratings/weakness/history/routes unchanged |
| AT-19 | Model/execution/deep legacy fixtures plus browser legacy journey assert normalize/render/execute/complete/review without backfill |
| AT-20 | Learning-outcome old-backup browser fixture asserts capabilities, execution/Evidence, cards, errors, Notes and associations restore unchanged |
| AT-21 | New-backup browser round-trip and state tests assert current/historical values, omission, identity, timestamps, provenance, and protected data |
| AT-22 | State-foundation newer-winner, equal-time conflict-copy, execution winner, and tombstone fixtures assert whole-record semantics |
| AT-23 | PWA lifecycle offline reopen fixture persists R1 state and completes execution/Evidence/Weekly flow with no network dependency |
| AT-24 | Editor/Weekly keyboard and failure tests assert accessible names/help/errors, native activation, focus target/return, save/cancel |
| AT-25 | Design-system browser matrix covers 360/390 px, 200% zoom, coarse pointer, reduced motion, long labels, touch geometry, and overflow |

### Error/boundary traceability (10/10)

| Scenario | Concrete evidence |
|---|---|
| ER-01 | Model create/update invalid-command tests assert `future-use-invalid`, unchanged input, and feature error-focus test |
| ER-02 | Capability browser forced-save rejection asserts last stored state, retained modal/draft, and no success message |
| ER-03 | Capability-context stale/completed/archived/missing Today matrix asserts no label, execution, or fallback change |
| ER-04 | Session and Deep Work forced-persistence rejection tests assert no active source/canonical record and recoverable origin |
| ER-05 | Evidence browser fixtures for missing/invalid/legacy/unlinked canonical context remain readable without live lookup/label |
| ER-06 | Weekly blank attempt, invalid explicit value, and forced-save rejection retain current/history and accessible draft/error/retry |
| ER-07 | State-foundation equal-time/tombstone tests preserve audit copies/tombstones and prevent resurrection |
| ER-08 | Execution/deep unit and browser reload fixtures accept complete legacy core context with no classification |
| ER-09 | Protected-domain browser/state canaries assert Recall, Weakness/Error Notebook, Contextual AI records/routes/backup unchanged |
| ER-10 | Old/new backup and PWA fixtures plus canonical regressions preserve Notes/vault/wikilinks/Relations/graph, Studies/Readings, unknown state, and offline availability |

## Security, privacy, performance, and observability

- The learner makes the only current-value decision. No external AI, network request, analytics event, inference, recommendation, or automatic mutation is introduced.
- Data remains within the existing local-first storage/backup boundary and follows existing backup privacy warnings.
- Validation is allow-list based and rendering continues escaping user text. Stable labels come from frozen application metadata.
- Label lookup is constant time. Today and capability projections use already-resolved records; Weekly Review reuses existing groups and adds only linear mapping over executions already in range.
- No new telemetry or logs are needed. Existing accessible validation messages, save toasts, persistence failure surfaces, and PWA diagnostics remain the operational signals.

## Failure behavior and rollback

| Condition | Required behavior |
|---|---|
| Missing future use | Omit property and UI line; all current flow remains valid. |
| Unknown persisted/imported future use | Omit only that optional field; retain attempt/execution core and normalize idempotently. |
| Invalid explicit command | Throw before candidate persistence; target the responsible control and retain draft. |
| Persistence rejection | Restore last valid state; no partial text/value change, false success, or historical rewrite. |
| Interrupted/reloaded execution | Source and canonical stored snapshot remains available through existing recovery; no live re-resolution. |
| Capability/source deleted after start | Canonical execution and Evidence remain valid; historical text/value render when available, otherwise degrade safely. |
| Current attempt changes with history present | Only the current owner changes; historical source/canonical snapshots and Evidence projections remain unchanged. |

Before any v76 exposure, rollback is a single revert of the closed runtime/test/docs change set. After valid R1 data has been exposed, rollback must be forward-compatible: issue a later cache generation while retaining the widened tolerant normalizers and optional-field preservation, then revert presentation/entry points if necessary. Do not redeploy v75 code that can strip a valid field during subsequent normalization/save. Never clear IndexedDB, localStorage, backups, caches outside normal owned-shell cleanup, or user data as rollback.

## Risks and mitigations

| Risk | Impact | Mitigation/evidence |
|---|---|---|
| A UI start path still creates a three-field capability reference | Future use disappears for that execution mode | Closed search of all `createCapabilityRef` start uses; source/canonical four-field browser assertions for capability, resource Session, and Deep Work |
| Historical UI accidentally resolves live outcome value | Evidence/Weekly history becomes misleading | Historical labels accept only normalized canonical execution context; tests mutate/delete current capability before projection |
| Legacy string update clears a new value | Unrelated edits lose learner intent | Explicit compatibility matrix preserves future use unless an object owns `futureUse` |
| Record-level merge pairs mismatched text/value | Corrupted attempt intent | Keep both fields nested in the same whole outcome; winner/conflict tests inspect the pair |
| New labels increase mobile density | Overflow or obscured actions | Native select, secondary wrapping text, min-width-zero CSS, 360/390/zoom/coarse-pointer tests |
| Cached mixed assets | Installed PWA runs incompatible model/UI versions | Forward v76 generation, unchanged manifest/SW lifecycle tests, later human installed-PWA smoke |
| Existing runtime-injected feature CSS gains more divergence | Styling ownership becomes harder | Add all new durable styles only to `design-system.css`; do not add a new runtime style block |

## R2/R3 boundary

This Design adds no consultation tracking, retrieval-quality metric, mastery, modality analytics, cross-mode weakness, recommendation, automatic selection, exercise generation, anti-grind behavior, card graduation/combination, automatic next-attempt change, external AI dependency, or speculative future hook. Active Recall remains one specialized tool, not the definition of retrieval.

## Remaining unresolved questions

None. All product and implementation decisions needed for Build are closed against the current repository. A concrete contradiction found during implementation requires `$sdd-iterate`; it does not authorize silent redesign or manifest expansion.

## Design gate

- Define clarity at least 12/15: **Yes — 15/15**
- Repository and current tests inspected: **Yes**
- Canonical optional representation selected: **Yes — omitted property**
- Central normalization/validation owner selected: **Yes — `learning-outcome-model.js`**
- Current/historical ownership separated: **Yes**
- Session/Deep Work canonical path closed: **Yes**
- State v3/merge/backup/offline behavior closed: **Yes**
- Exact product/test/docs manifests closed: **Yes**
- 25/25 acceptance and 10/10 error scenarios traced: **Yes**
- Forward PWA generation selected without changing Service Worker architecture: **Yes — v76**
- No implementation blocker: **Yes**

**Ready for Build: Yes.**

## Revision history

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-08-12 | Codex | Repository-grounded Design for the optional current future-use owner, immutable execution snapshot, contextual projections, state-v3 compatibility, v76 cache generation, exact manifests, and full acceptance/error traceability. |
| 1.1 | 2026-08-12 | Codex | Build completed against the exact product/test manifests; canonical validation passed after correcting an initialization-order defect within the authorized Deep Work projection. |

## Recommended next skill

Use `$sdd-ship .sdd/features/retrieval-r1/`.
