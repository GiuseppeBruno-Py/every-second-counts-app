# Learning Loop Redesign — Technical Design

**Delivery:** 3 — Capability-first Compasso
**Status:** Shipped — Capability-first Compasso
**Revision:** 1 — 2026-08-09
**Worktree baseline:** `f00e7c1eeeb07ffa9960d20f07b12ab20f22e37c` on `codex/operational-learning-loop-define`
**Integrated equivalent:** `origin/main` at `bc08ac12f93053b9a5193976258e503096853efe`; `git diff HEAD..origin/main` is empty
**Authoritative requirements:** `DEFINE.md`, clarity 15/15, 16 requirements, 19 acceptance criteria
**Prior deliveries:** Actionable Outcome Foundation and Operational Learning Loop remain shipped, archived, and behaviorally frozen
**Phase boundary:** Design only. No product code, migration, Build, Git staging/commit/push, deployment, or publication is authorized by this artifact.

## 1. Design gate and inspection evidence

The Design gate passes. The exact requested worktree, branch, and HEAD were verified before inspection. The only pre-existing worktree changes were the declared amendments to `BRAINSTORM.md` and `DEFINE.md`. The local `origin/main` ref is the user-supplied `bc08ac1…`, and its tree is identical to this worktree's HEAD, so Design is grounded in the current integrated product without rebasing or modifying history.

No `.codegraph/` directory exists in this worktree. CodeGraph was therefore not available, and the required fallback was direct inspection of:

- `AGENTS.md`, `README.md`, `package.json`, `playwright.config.js`, the browser-tests workflow, and the composition script;
- the current retained Learning Loop artifacts and the current source for Capacidades, Hoje, Studies/Readings, regular Sessions, Deep Work, canonical execution sessions, Evidence, Weekly Review, Results, and Consistency;
- `app-manifest.js`, `state-foundation.js`, `storage.js`, `index.html`, `service-worker.js`, and the existing model/browser/PWA tests;
- the Contextual AI, Active Recall, weakness/error, Notes, Markdown/vault, wikilink, dictionary, and graph sources only to establish preservation and dependency boundaries.

The installed `sdd-design` package does not contain its referenced `templates/DESIGN_TEMPLATE.md`. This document therefore follows the complete repository Design structure already used by the initiative while retaining every section required by the skill.

No blocking requirement or architecture decision remains. The delivery does not require a parallel Session or Evidence domain, a generic relation platform, a new IndexedDB object store, a state-contract bump, a destructive migration, or an external dependency. No Iterate is required.

## 2. Current state and concrete gap

The two shipped deliveries already provide:

- `learningOutcomes` with stable IDs, active/archived lifecycle, one stable current `nextAttempt`, optional `resourceRefs`, record-level merge, and outcome tombstones;
- outcome-originated quick and Deep Work execution through the existing Session systems;
- immutable execution provenance under `learningContext: { outcomeId, attemptId, attemptText }` on source and canonical execution records;
- Evidence owned by its existing record and associated to execution through `sessionId`, without copied capability context;
- local-first state v3 persistence, JSON backup/restore, manifest-owned composition, and the v72 PWA shell.

The current gap is cross-surface ownership and projection:

| Surface | Current behavior | Gap for Delivery 3 |
| --- | --- | --- |
| Capacidades | Current attempt, linked resources, latest execution/Evidence | No Today state, resource-side management, signal history, weekly reflection, or complete loop summary |
| Hoje | Resource/custom daily-plan items | Cannot reference a capability attempt or start it while isolating planning completion |
| Estudos / Leituras | Resource cards and resource progress | Capability support links are not visible or manageable from the resource side |
| Sessions / Deep Work | Capability-origin provenance works | Resource-origin starts cannot opt into an active capability/current attempt |
| Evidence | Existing Evidence contract and session association | Capability context is not consistently projected or navigable across Evidence renderers |
| Weekly Review | Completed activity, Evidence, general reflection | No capability-linked finalized attempt context, capability reflection, or explicit keep/revise decision |
| Results | Planned/completed actions, sessions, time, Evidence totals | Activity and capability evidence/decisions are not separated |
| Consistency | Completed-session cadence and history | No optional capability filter or capability label; outcome-only metric fallback is unsafe |

## 3. Target architecture

Capability-first Compasso is a set of bounded projections over existing owners plus one minimal durable signal concept:

```text
learningOutcomes (capability + canonical current attempt + resourceRefs)
        │
        ├── dailyPlans.items[].capabilityRef        Hoje planning fact
        ├── sessions/deepWork/execution.learningContext
        │                                           execution provenance fact
        ├── evidence.sessionId ──> execution        Evidence projection; no copied link
        ├── learningSignals[].capabilityRef         learner-approved signal fact
        └── weeklyReviews[].capabilityReflections   historical reflection/decision snapshot

Derived per render:
Capability summary / resource-side reverse links / Evidence context /
Weekly capability context / Results interpretation / Consistency filter
```

There is no reverse-link array on Study or Reading, no capability-owned copy of a Today item/session/Evidence/review, no signal IDs stored on a capability, and no generic relation table. The current source record always remains authoritative.

The end-to-end user flow is:

```text
Capability
  → current next attempt
  → optional supporting Study/Reading
  → optional Hoje reference
  → existing quick or Deep Work session
  → existing Evidence
  → source projections and/or learner-approved signal
  → Weekly reflection and explicit keep/revise choice
  → same canonical next-attempt owner
```

## 4. Data representation and ownership

### 4.1 Minimum additive association value

All newly persisted capability-attempt references use one exact normalized value:

```js
capabilityRef: {
  outcomeId: "<learningOutcomes.id>",
  attemptId: "<learningOutcomes.nextAttempt.id>",
  attemptText: "<reference-time nextAttempt.text snapshot>"
}
```

All three strings are required and trimmed. A partial value is invalid. The text snapshot provides an understandable historical fallback when the capability becomes archived, deleted, or otherwise unavailable. When a live outcome with the same outcome/attempt IDs exists, non-historical surfaces render its current attempt text; the snapshot never becomes a competing current-attempt owner.

The shipped session property remains named `learningContext` and remains execution provenance only. It is shape-compatible with `capabilityRef`, but this delivery does not rename, rewrite, infer, or broaden the meaning of existing session records.

### 4.2 Complete ownership matrix

| Fact / association | Durable owner | Representation | Other surfaces |
| --- | --- | --- | --- |
| Capability identity/lifecycle | `learningOutcomes` | existing record, `active` / `archived` only | Read-only projection |
| Current next attempt | `learningOutcomes.nextAttempt` | existing stable ID/text/timestamps | Live reference or historical snapshot |
| Study/Reading support | `learningOutcomes.resourceRefs` | existing `{ type, id }[]` | Reverse-derived on resource cards |
| Hoje planning state | current `dailyPlans` record | one `type: 'capability-attempt'` item with `capabilityRef`, `completedAt`, and item timestamps | Capability card shows derived current-day presence |
| Execution provenance | existing `sessions`, `deepWorkSessions`, `executionSessions` | shipped `learningContext` | Capability/Evidence/review/results/consistency derive from canonical execution |
| Evidence | existing `evidence` record | existing `sessionId`, `domain`, `itemId`, type/text/timestamps | Capability context resolves through the canonical session only |
| Learner-approved feedback/gap/question/insight | new `learningSignals` collection | record in section 4.3 | Capability, Review, and Results project it |
| Weekly capability reflection/decision | owning `weeklyReviews` record | nested `capabilityReflections[]` snapshot | Capability and Results derive latest/history |
| Resource progress/status | Study or Reading record | existing metric fields | Never read as capability progress |
| Cadence/streak/time | existing canonical execution history | derived analytics | Never stored or labeled as capability state |

### 4.3 One minimal additive concept: `learningSignals`

The single new collection is:

```js
{
  id: "<stable local id>",
  schemaVersion: 1,
  capabilityRef: { outcomeId, attemptId, attemptText },
  kind: "feedback" | "gap" | "question" | "insight",
  text: "<learner-approved text>",
  sourceRef: null | {
    type: "execution" | "evidence" | "weekly-review",
    id: "<source record id>"
  },
  origin: "learner" | "confirmed-suggestion",
  createdAt: "<ISO timestamp>",
  updatedAt: "<ISO timestamp>"
}
```

`gap` is the stored term for both a learning gap and a weak topic. It is not failure, progress, or lifecycle. The signal's text is the learner's durable decision-support record; `sourceRef` is optional provenance and never owns or cascades to the source.

Only learner-authored form submission or explicit suggestion confirmation may create a durable record. This delivery introduces no automatic signal generator. Any future deterministic suggestion remains runtime-only until confirmation; there is no persisted `suggested`, `pending`, confidence, or score state.

Existing source records are reused as projections instead of copied:

- a finalized session result/reflection can be presented as feedback;
- Evidence with `type: 'question'` or `type: 'insight'` is presented with that source meaning;
- all Evidence remains Evidence and is never copied into `learningSignals` automatically;
- `reviewItems`, `errorNotebook`, legacy error records, and `explanationEvaluations` remain untouched and are never inferred into a capability link.

The new collection is necessary because an unresolved gap/question/insight may be a learner decision without satisfying the required shape or lifecycle of Evidence, Active Recall, or the error notebook. Nesting signals inside `learningOutcomes` was rejected because outcome deletion would destroy them and record-level concurrent edits would couple unrelated signals to capability edits.

### 4.4 Weekly reflection snapshot

Each existing weekly review may add zero or more entries, unique by outcome ID inside that review:

```js
capabilityReflections: [{
  capabilityRef: { outcomeId, attemptId, attemptText },
  reflection: "<optional learner text>",
  decision: "keep" | "revise",
  decidedAttemptText: "<post-decision attempt text>",
  decidedAt: "<ISO timestamp>"
}]
```

The weekly review owns this historical snapshot. `decision: 'keep'` records the choice but performs no capability mutation. `decision: 'revise'` requires a nonblank explicit new value and calls the existing `learningOutcomeModel.updateOutcome`; the shipped attempt identity/created timestamp remain stable and only the canonical text/update timestamp change. The review records the post-decision text for history but is never consulted as the current owner.

The parent review gains `updatedAt` while retaining `reviewedAt`, allowing the existing record-timestamp merge strategy to choose the newest whole review. Reflections are not a second collection and therefore need no independent tombstones.

## 5. Normalization, merge, tombstones, and missing references

### 5.1 Normalization

`capability-context-model.js` is the pure owner of:

- `normalizeCapabilityRef` and creation from a live active outcome;
- capability-attempt Today item normalization without touching legacy/custom/resource items;
- signal create/update/normalize/delete and collection deduplication;
- weekly reflection normalization;
- indexed, deterministic projections for capability summaries and cross-surface filtering.

Normalization is idempotent and preserves compatible unknown fields on valid records. It never resolves associations by title, text, resource ID, time proximity, Evidence domain, or other inference.

Legacy state behavior:

- missing `learningSignals` becomes `[]` under state v3;
- missing `capabilityReflections` becomes `[]` when a weekly review is rendered/saved;
- legacy Today items, sessions, Evidence, reviews, notes, and unknown compatible data are preserved;
- malformed new records are isolated from valid records and never cause another domain to be cleared.

### 5.2 Merge and tombstones

| Data | Existing merge unit | Delete/unlink behavior |
| --- | --- | --- |
| Resource support | whole `learningOutcomes` record by `updatedAt` | Unlink updates the outcome; no relation tombstone or resource deletion |
| Hoje capability item | whole `dailyPlans` parent by `updatedAt` | Remove updates the plan; existing parent-record conflict behavior remains authoritative |
| Execution context | existing source/canonical Session records | Existing session deletion rules; no new cascade |
| Evidence context | derived through `sessionId` | Existing Evidence/session tombstones and cascade rules only |
| Learning signal | `learningSignals` record by `updatedAt` | Delete writes `_sync.tombstones['learningSignals:<id>']` |
| Weekly reflection | whole `weeklyReviews` record by `updatedAt` | Removing/replacing an entry updates the parent review; no separate tombstone |

The manifest catalogs `learningSignals` as an array collection with identity `id`, `record-timestamp` merge, and sync enabled. Equal-timestamp divergent records follow the existing state-foundation conflict-copy contract. Signal normalization retains conflict metadata. Repeated normalization and repeated merge are idempotent; a newer signal tombstone prevents resurrection.

### 5.3 Missing-reference matrix

| Missing/unavailable record | Required projection |
| --- | --- |
| Capability referenced by Hoje | Keep the Today item and snapshot text, label capability unavailable, allow complete/reopen/remove, disable start/open-to-record |
| Archived capability referenced by Hoje | Keep/open historical context, disable new start/association until reactivated |
| Study/Reading referenced by capability | Keep the capability ref, render `Recurso indisponível`, allow explicit unlink, never recreate the resource |
| Capability referenced by execution | Keep immutable `learningContext`; render snapshot and unavailable label; never recreate |
| Session referenced by Evidence | Keep Evidence valid; no capability projection is fabricated from Evidence `domain`/`itemId` |
| Source referenced by signal | Keep independently valid signal, show source unavailable, allow signal edit/delete |
| Capability referenced by signal/review | Keep historical snapshot and record; show capability unavailable; no new association |
| Old/unknown compatible field | Preserve through current normalization, save, merge, and backup paths |

## 6. Exact surface flows

### 6.1 Capacidades summary and next useful action

Each active or archived capability card keeps its shipped header, proof criterion, current next attempt, lifecycle controls, and execution action. A compact, progressively disclosed learning-context section is derived once per render from indexed state and contains only sections that have data:

1. current-day Hoje reference and its planning status;
2. supporting Studies/Readings, including unavailable references;
3. recent finalized completed/interrupted execution snapshots;
4. Evidence resolved by canonical execution `sessionId`;
5. source projections and durable learner-approved signals;
6. latest weekly capability reflection and keep/revise decision.

The primary active-card actions are **Adicionar a Hoje** (or **Abrir em Hoje** when already present), **Executar tentativa**, and **Registrar sinal**. Archived cards remain readable but cannot create new Today, session, resource, or signal associations. No section renders percentage, mastery, confidence, completion, demonstrated score, ranking, or streak.

### 6.2 Exact Hoje flow

1. The user chooses **Adicionar a Hoje** on an active capability.
2. The feature resolves the live current attempt and adds one item to today's existing `dailyPlans` record:

   ```js
   {
     id: "<daily item id>",
     type: "capability-attempt",
     capabilityRef: { outcomeId, attemptId, attemptText },
     completedAt: null,
     createdAt: "<ISO timestamp>"
   }
   ```

3. The same outcome/attempt is deduplicated within that day. Adding it does not remove or rewrite a resource/custom Today item.
4. Hoje renders the live current attempt when the IDs still resolve and uses the snapshot only as missing-reference fallback.
5. **Abrir capacidade** routes to `capabilities` and focuses the card. **Iniciar sessão** revalidates that the capability is active and the attempt is still current, then calls the shipped capability-origin session adapter. Starting never checks the Today item automatically.
6. Completing/reopening changes only that item's `completedAt`. Removing changes only the plan's `items`. Both update the plan `updatedAt` and leave the outcome, attempt, resources, sessions, Evidence, signals, and reviews byte-for-byte unchanged.
7. If the capability is archived/deleted after planning, the row remains understandable from its snapshot. Completion/reopen/removal remain available; new execution is disabled and no record is recreated.

Capability-specific Today mutations use a candidate-state save with rollback on persistence failure so the UI does not announce success for an unsaved operation. Existing resource/custom semantics remain unchanged.

### 6.3 Study/Reading-side association

`learning-outcome-feature.js` registers an `afterGrid` enhancement for Study and Reading cards. Each card receives one semantic **Capacidades · N** action. A shared modal/disclosure:

- shows active capabilities as optional checkboxes;
- shows already linked archived capabilities as historical links with an explicit unlink action, but never as new selectable targets;
- updates only the selected outcomes' `resourceRefs` through the existing outcome model and candidate-state persistence;
- derives the resource-side count/list from all `learningOutcomes.resourceRefs` and stores no reverse link on the resource;
- does not change the resource's status, metric, progress, completion, note, or expected outcome.

Deleting a Study/Reading continues to leave its outcome-side reference unavailable. Restoring the same resource ID makes it resolvable again; no auto-recreation occurs.

### 6.4 Resource-originated quick/Deep Work session

The existing session-start dialog for Study/Reading adds **Capacidade e tentativa (opcional)** with **Sem capacidade** as the default. Active capabilities already linked to the resource appear first; other active capabilities remain available in a second group. Choosing context for a session does not create a durable resource support link.

At submit:

1. no selection follows the exact legacy path with `learningContext: null`;
2. a selection is revalidated against the live active outcome/current attempt;
3. the existing `createExecutionContext` produces the shipped immutable execution snapshot;
4. quick execution stores it on the existing regular session and canonical execution session;
5. Deep Work receives the same context through the shipped `deepOpenOutcome` adapter even though the target remains Study/Reading;
6. Study/Reading metric start/end/progress behavior remains unchanged;
7. capability state/current attempt remains unchanged.

If the capability becomes archived/unavailable while the dialog is open, submission is rejected with a readable status and the user may continue with **Sem capacidade**. Direct legacy starts, minimum/contingency modes, active-session guards, recovery, pause, finish/cancel, and companion behavior remain under the shipped systems.

### 6.5 Evidence projection

Evidence never gains `capabilityRef` or `learningContext`. Every renderer uses:

```text
evidence.sessionId
  → canonical executionSessions.id
  → execution.learningContext
  → live learningOutcome when available, otherwise immutable attempt snapshot
```

Session history, Weekly Review, Results, and the capability summary render an accessible capability/attempt label and navigation when resolvable. If the session is missing, Evidence remains valid and unlinked. If only the capability is missing, the session snapshot remains readable and navigation is disabled. Editing/rebinding/deleting Evidence keeps existing identity, source, tombstone, and cascade rules.

### 6.6 Feedback, gap/weak topic, question, and insight

The capability summary and finalized execution/Evidence context expose **Registrar sinal**. The user selects the kind, edits the proposed/manual text, and explicitly saves. A source-aware launch supplies a `sourceRef`; a capability-level launch stores `null`.

Source projections remain source-owned and immediately reflect source edits. A durable `learningSignals` record is independently learner-owned and editable/removable under the signal model. Deleting a source never deletes the signal; deleting a signal never edits the source. Neither action mutates the outcome or current attempt.

No automatic derivation is persisted in this delivery. The confirmation boundary is enforced by API and UI: only the explicit save/confirm command creates a record. Signals may inform the learner's later decision but never trigger lifecycle, progress, or next-attempt mutation.

### 6.7 Weekly Review

The current weekly stats, unlinked activity, Evidence timeline, general reflection, quality, priorities, and Hoje focus integration remain. A new **Capacidades da semana** section derives capability-linked completed/interrupted canonical executions, their Evidence, and signals inside the selected week.

For any listed active capability, the learner may add a reflection and explicitly choose:

- **Manter tentativa:** persist the review snapshot only; do not call outcome update;
- **Revisar tentativa:** require the new text, persist the review snapshot, and call the existing outcome update in the same candidate state.

Saving general review data without capability decisions remains valid. Archived/missing capability context remains visible but cannot receive a new revise decision. Save is one candidate-state persistence operation; failure restores the prior review/outcome state and retains the form/error context.

Existing activity stats continue to count completed executions under their current contract. Interrupted attempts appear only in the capability context as finalized history and are not silently promoted into completion/session KPIs.

### 6.8 Results

Results retains planned-vs-completed Today activity and book synthesis. It adds one derived capability-results panel for the selected week:

- capability and attempt snapshot;
- associated Evidence summaries;
- learner-approved signals;
- recorded weekly keep/revise decision.

The existing action completion percentage, session count, elapsed time, and resource activity remain visibly grouped and labeled **Atividade de apoio**. The capability panel is labeled **Evidências e decisões**. No Today checkmark, resource completion, elapsed time, or session count is described as proof of capability.

### 6.9 Consistency

Consistency keeps its existing period/domain filters, completed-session KPIs, trend, ranking, CSV, and global history. It adds a capability filter with:

- **Todas** — existing linked and unlinked completed history;
- **Sem capacidade** — records with no valid `learningContext`;
- one option for each referenced live or unavailable capability ID.

The filter intersects the existing period/domain filters and uses only explicit canonical `learningContext`; it never infers from resource associations. Outcome-only executions receive **Sem métrica de recurso** rather than falling through the Goal metric configuration. History rows show attempt context when present. An explicit description states that cadence, streak, frequency, duration, and volume are execution rhythm, not capability progress/mastery/completion. Returning to **Todas** always restores the full existing history.

## 7. Interfaces, transitions, and errors

### 7.1 Pure model interface

`CompassoCapabilityContextModel` exposes pure functions in these groups:

- references: normalize/create/resolve `capabilityRef`;
- Today: normalize/create/deduplicate capability-attempt items;
- signals: create/update/delete/normalize/sort;
- weekly: normalize capability reflections and apply explicit keep/revise candidate changes;
- projections: build indexed joins for Today, resources, finalized execution, Evidence, signals, and reviews;
- filters: explicit linked/unlinked capability filtering for analytics.

Mutating feature handlers build a cloned candidate state, call pure model operations, and persist through existing `saveData`. They do not replace `renderAll`, `saveData`, storage, runtime commands, or session engines.

### 7.2 State transitions

```text
Hoje item: absent ↔ planned ↔ completed
            remove returns to absent
            none of these transitions touches learningOutcomes

Signal: absent → learner/confirmed durable → edited → tombstoned
        no transition changes capability lifecycle/current attempt

Weekly decision: no decision → keep | revise
                 revise is valid only after explicit text submission

Capability: active ↔ archived (existing only)
            no new lifecycle state is introduced
```

### 7.3 Errors and recovery

| Error | Required behavior |
| --- | --- |
| Save/quota failure | Roll back new capability-context mutation, keep dialog/form usable, show existing non-content diagnostic/toast, never announce success |
| Partial/malformed `capabilityRef` | Isolate the new item/signal/reflection; preserve unrelated state; infer nothing |
| Archived/unavailable selection at submit | Reject new association, explain, offer no-capability continuation where applicable |
| Missing source | Render unavailable provenance; keep valid signal/Evidence/review |
| Equal-timestamp signal conflict | Preserve conflict through existing state-foundation conflict copy; do not silently choose by content |
| Legacy backup | Default new collection/fields only; preserve legacy/unknown data and unlinked behavior |
| New backup with missing live references | Preserve valid snapshots and records; do not recreate source records |

## 8. Accessibility, mobile, and offline behavior

All new controls are native buttons, checkboxes, selects, textareas, or dialogs with visible labels and accessible names. New dialogs reuse the repository's modal contract: initial focus on the first meaningful control, Escape/Cancel without silent data loss, contained modal focus, and focus return to the triggering capability/resource/Evidence control.

Required UI evidence includes:

- logical keyboard order and Enter/Space activation;
- visible focus and non-color labels for active, archived, unavailable, completed, and source-missing states;
- status/error text through existing live/alert patterns;
- long capability, attempt, signal, Evidence, and reflection text wrapping without clipping;
- no document-level horizontal overflow at 360 px, the mobile project, and 200% zoom;
- existing coarse-pointer minimum target behavior and reduced-motion rules;
- no automatic smooth-scroll dependency when reduced motion is requested.

No new runtime `<style>` element is introduced. Durable cross-surface styles are added to `design-system.css`; the delivery does not migrate or rewrite pre-existing feature style blocks.

All models and features use in-memory local state and existing persistence. After the app shell is loaded, creation, linking, planning, execution, Evidence, signals, reflection, filtering, save/reload, and backup/restore require no network. No external AI, API, account, backend, telemetry, or remote content processing is introduced.

## 9. Backup, storage, compatibility, and PWA

### 9.1 State and backup

This is additive logical normalization within `compasso.state.v3`, not a migration job:

- `index.html` adds `learningSignals: []` to new initial state and normalizes it during load/import when the model is available;
- `state-foundation.js` defaults and normalizes the collection idempotently while keeping `_schema.version = 3`;
- JSON export already serializes the full state; import keeps the same envelope behavior and normalizes the new records;
- IndexedDB database version, object stores, storage key, and localStorage mirror remain unchanged;
- `storage.js` is frozen;
- existing backups without the collection remain valid and unlinked;
- current clients preserve compatible unknown fields and all preserved domains.

Focused round-trip evidence seeds valid and missing references plus canaries for `explanationEvaluations`, `errorNotebook`, `reviewItems`, notes, folders, Markdown metadata, wikilinks, source links, and unknown fields. Repeated normalize/export/import/merge must not duplicate or infer links.

### 9.2 PWA generation

`app-manifest.js` adds `capability-context-model.js` to composition/cache and `learningSignals` to the collection catalog. It advances only the app-shell generation from `compasso-pages-v72` to `compasso-pages-v73`.

The manifest API, state contract, cache ownership predicate, Service Worker source, controlled-update behavior, and persistence boundary remain unchanged. Contextual AI, Notes, Markdown/vault, dictionary, and graph modules remain in module order and cached assets. `service-worker.js` requires no modification.

### 9.3 Contextual AI boundary

Capability-first files do not import, call, route through, or require `context-rag-feature.js`, `context-learning-feature.js`, the `context` route, platform detection, `fetch`, or an AI service. This delivery does not remove or modify those modules or their stored collections.

For the later UX Simplification delivery, the pre-decided retirement fallback is the stable `capabilities` destination with an understandable status that the standalone IA surface was retired and user data remains preserved. That later delivery must retain/export `explanationEvaluations`, `errorNotebook` and legacy error data, generated Active Recall questions, and source references; it must remove assets only in a new forward generation with controlled online/offline validation. None of that retirement behavior is implemented here.

### 9.4 Notes and Relations boundary

This delivery leaves Notes, Relations, graph, Markdown/vault, folders, metadata, `linkedItemId`, wikilinks, CRUD/search, and JSON backup behavior untouched. A browser preservation canary uses capability-first behavior and then verifies that:

- note/folder/source-link records are unchanged;
- `vaultBuildExportModel()` retains Markdown content, metadata, folders, and links;
- `dictionaryBuildModel()` still derives wikilink/source relationships;
- Notes, dictionary/relations, and Contextual AI routes remain discoverable at their existing experience levels.

Any later navigation simplification must keep legacy `notes` and `dictionary` deep links recoverable and provide contextual access from surviving source records; it receives no deletion authority from this Design.

## 10. Significant decisions and rejected alternatives

| Decision | Rationale | Rejected alternative |
| --- | --- | --- |
| One `learningSignals` collection | Supports learner-owned gaps/questions/insights with independent history, merge, and tombstones | Force signals into Evidence, Active Recall, error notebook, notes, or outcome nested arrays |
| One normalized `capabilityRef` for new records | Stable historical fallback without changing the shipped session property | IDs only (unreadable when missing) or copied capability records (divergence) |
| Keep `resourceRefs` one-sided on outcome | Already shipped; resource view can derive reverse links consistently | Duplicate arrays on Study/Reading or generic relation store |
| Hoje owns only its planning item | Completion/removal remain daily facts and merge with the existing parent plan | Add Today state to the capability or make a Today checkmark update the attempt |
| Evidence derives through `sessionId` | Preserves shipped Evidence identity/source and avoids divergence | Copy `capabilityRef` to Evidence or create capability Evidence domain |
| Weekly review owns reflection snapshot | Reflection is historical review data; whole-record merge is sufficient | Treat reflection as capability state or add a second reflection collection |
| Resource-origin context is selected per session | Makes association optional and preserves resource metric ownership | Infer from resource links or automatically create a resource link |
| Derived Results/Consistency projections | No new analytics persistence or competence score | Capability percentage, confidence, ranking, streak, or demonstrated state |
| Keep state v3 and current IndexedDB store | Additive arrays/fields work in existing full-state persistence | State v4, object-store upgrade, data rewrite, or background migration |
| Forward PWA v73, unchanged Service Worker | New cached module requires a generation; lifecycle architecture already suffices | Reuse v72, hand-edit cache lists, or add competing version source |

## 11. Security, privacy, performance, observability, and operations

- **Security/privacy:** All text remains local. No new permissions, credentials, remote endpoints, analytics, or content-bearing logs are added. Export keeps its existing privacy confirmation.
- **Performance:** The pure model builds maps by outcome, session, Evidence, signal, Today item, and weekly review once per render. Capability summaries are therefore `O(C + P + S + E + L + W)` rather than repeated full-array scans per card. UI lists use bounded recent sections and existing history pagination.
- **Observability:** Existing runtime error isolation, health diagnostics, save status, and toasts are reused. Diagnostics record module/operation failure only, never user text.
- **Operational impact:** Static files only. No backend, environment variable, dependency, package/lock, CI, account, or deployment change.
- **Data recovery:** Before publication the release can be reverted as one unit. After a client has saved `learningSignals`, rollback must be a forward generation that preserves unknown state v3 data; no rollback may clear caches and user storage together.

## 12. Closed Build file manifest

The Build manifest is closed at **20 exact paths**. Every implementation, documentation, and focused evidence change is listed. No wildcard or additional file is authorized.

| # | Action | Exact path | Purpose | Dependencies | AC coverage |
| ---: | --- | --- | --- | --- | --- |
| 1 | Create | `capability-context-model.js` | Pure `capabilityRef`, Today item, learning signal, reflection, projection, missing-ref, and filter contracts | `learning-outcome-model.js` existing contract | AC-01–AC-15, AC-19 |
| 2 | Modify | `learning-outcome-feature.js` | Capability summary, Hoje action, resource-side reverse association UI, signal CRUD, navigation/focus | 1; existing outcome/session runtime | AC-02–AC-05, AC-08–AC-10, AC-14, AC-19 |
| 3 | Modify | `today-feature.js` | Capability-attempt item render/add/open/start/toggle/remove and isolation/error behavior | 1, 2; existing dailyPlans/session adapters | AC-01, AC-03, AC-14, AC-19 |
| 4 | Modify | `sessions-feature.js` | Optional active capability/current-attempt selector for Study/Reading quick and Deep Work starts | 1; shipped session/Deep Work adapters | AC-01, AC-06, AC-07, AC-10, AC-14, AC-19 |
| 5 | Modify | `evidence-feature.js` | Derived capability/attempt label and navigation through canonical `sessionId` | 1; shipped Evidence/session contracts | AC-02, AC-06–AC-08, AC-14, AC-19 |
| 6 | Modify | `weekly-review-feature.js` | Capability-period projection, reflection, keep/revise candidate save, legacy activity preservation | 1; existing weeklyReviews and outcome update | AC-01, AC-07–AC-11, AC-14, AC-19 |
| 7 | Modify | `outcomes-feature.js` | Evidence/decision capability panel and explicit supporting-activity labels | 1, 6; existing Results week data | AC-01, AC-07, AC-08, AC-10, AC-12, AC-14, AC-19 |
| 8 | Modify | `analytics-feature.js` | Explicit capability/unlinked filter, attempt labels, no-resource metric guard, interpretation copy | 1; existing canonical completed history | AC-01, AC-07, AC-13, AC-14, AC-19 |
| 9 | Modify | `index.html` | Initial collection default plus load/import normalization; preserve all existing backup entry points | 1 | AC-07, AC-15, AC-16, AC-18 |
| 10 | Modify | `state-foundation.js` | Idempotent signal default/normalization under state v3; merge/tombstone compatibility | 1, 11 | AC-05, AC-07–AC-09, AC-14, AC-15, AC-18 |
| 11 | Modify | `app-manifest.js` | Add model/asset/collection, preserve modules/contracts, advance v72→v73 | 1; current manifest architecture | AC-15–AC-18 |
| 12 | Modify | `design-system.css` | Static responsive, focus, unavailable, signal, summary, review, Results, and filter styles | 2–8 | AC-02–AC-04, AC-08, AC-11–AC-14, AC-19 |
| 13 | Create | `docs/capability-first-compasso.md` | Durable owner/shape/flow/compatibility contract for future maintenance | 1–12 | AC-01–AC-19 |
| 14 | Create | `tests/capability-context-model.test.js` | Pure normalization, dedupe, projections, no inference/progress, signals, refs, reflections, missing refs | 1 | AC-01–AC-15 |
| 15 | Modify | `tests/state-foundation.test.js` | State v3 idempotence, signal merge/conflict/tombstone, legacy/unknown data and JSON canaries | 1, 10, 11 | AC-05, AC-07–AC-09, AC-14–AC-18 |
| 16 | Modify | `tests/app-manifest.test.js` | Module order, collection contract, v73, unchanged state v3, Context/Notes/Relations assets | 11 | AC-15–AC-18 |
| 17 | Modify | `tests/service-worker-composition.test.js` | Complete composition/cache failure behavior with new module and preserved legacy assets | 11 | AC-15–AC-18 |
| 18 | Create | `tests/browser/capability-context-flows.spec.js` | Cross-surface happy paths, legacy opt-out, missing refs, signals/consent, review/results/consistency, backup, a11y/mobile | 1–12 | AC-01–AC-16, AC-18, AC-19 |
| 19 | Modify | `tests/browser/information-architecture-flows.spec.js` | Assert Notes, Relations, and Context remain available and current deep links survive | 11; existing IA | AC-16–AC-18, AC-19 |
| 20 | Modify | `tests/browser/pwa-lifecycle-flows.spec.js` | v73 controlled complete-cache offline reopen with Today/signal/reflection context and preserved data | 1–12, 16, 17 | AC-03, AC-07–AC-09, AC-14–AC-18 |

Build may create the standard phase report at `.sdd/reports/learning-loop-redesign/BUILD_REPORT.md`. That SDD artifact is not a product/evidence path and does not expand this 20-path closed manifest.

### 12.1 Frozen implementation areas

The following remain frozen for this delivery:

- `learning-outcome-model.js`, `execution-session-model.js`, `execution-session-feature.js`, `deep-work-model.js`, `deep-work-feature.js`, `history-evidence-model.js`, `history-edit-feature.js`, and `session-companion-feature.js` — shipped Delivery 1/2 contracts are reused, not reopened;
- `storage.js`, `service-worker.js`, `app-composition.js`, bootstrap/PWA lifecycle sources, manifest API/state contract, and IndexedDB schema;
- `context-rag-feature.js`, `context-learning-feature.js`, `recall-feature.js`, `weakness-feature.js`, Contextual AI data, and platform detection;
- Notes, Markdown/vault, dictionary/relations, graph, capture, journal, information-architecture source, and all existing user data contracts;
- `package.json`, lockfile, Playwright configuration, CI workflow, snapshots, dependencies, and generated test fixtures;
- both archived Learning Loop delivery directories.

If Build proves any frozen implementation file necessary, or needs a path outside the manifest, stop and use `$sdd-iterate` before editing.

## 13. Dependency-ordered implementation sequence

1. Add the pure capability-context model and Node tests for exact shapes, state transitions, projections, missing references, and no-inference invariants.
2. Add manifest collection/composition, index/state normalization, v73, and state/manifest/composition tests.
3. Add capability summary, reverse resource management, signals, and exact Hoje item behavior.
4. Add resource-origin session selection and Evidence projection without changing shipped provenance owners.
5. Add Weekly Review reflection/decision, then Results and Consistency derived integrations.
6. Add static design-system styles and the durable feature documentation.
7. Add the focused browser cross-surface, compatibility, IA, and PWA flows.
8. Run focused validation, inspect failures/visual state, and produce the Build report. Do not advance to Ship automatically.

## 14. Focused test plan and validation commands

The repository supports `npm test`, `npm run build:test`, `npm run test:browser`, and `npm run test:all`. `playwright.config.js` defines `chromium` and `mobile` projects and requires the composed `.test-dist` fixture unless `APP_URL` is supplied.

### 14.1 Build-focused commands

```powershell
node --test tests/capability-context-model.test.js tests/state-foundation.test.js tests/app-manifest.test.js tests/service-worker-composition.test.js
npm run build:test
npx playwright test tests/browser/capability-context-flows.spec.js --project=chromium
npx playwright test tests/browser/capability-context-flows.spec.js --project=mobile
npx playwright test tests/browser/critical-flows.spec.js --project=chromium --grep "sessão de Estudo|sessão de Leitura|Deep Work concluído"
npx playwright test tests/browser/learning-outcome-flows.spec.js --project=chromium
npx playwright test tests/browser/information-architecture-flows.spec.js --project=chromium --project=mobile
npx playwright test tests/browser/pwa-lifecycle-flows.spec.js --project=chromium --grep "controlled complete cache reopens offline"
git diff --check
```

The new browser spec includes a 360/768/1024 matrix, the configured mobile project, a 200% zoom geometry check, keyboard/focus-return checks, long text, missing references, save failure, no external request dependency, and JSON/vault/relations preservation canaries. Snapshot files are neither required nor authorized.

### 14.2 Ship gate

Ship later runs the canonical full validation:

```powershell
npm run test:all
git diff --check
```

Any physical installed-PWA close/reopen observation remains human-attributed evidence and is not fabricated by browser automation.

## 15. Acceptance-criterion traceability

| AC | Implementation owner | Test level/location | Deterministic proof |
| --- | --- | --- | --- |
| AC-01 Optional association | model, Today, sessions, Review/Results/Analytics | Node model; new browser; existing critical regressions | All legacy paths succeed with null/absent refs; no association inferred |
| AC-02 Capability summary | capability feature + projection model | New browser | Linked resources, Today, finalized attempts, Evidence, signals, reflection navigate; prohibited metrics absent |
| AC-03 Today opt-in/isolation | Today + capability feature | Node + new browser + PWA | Add/open/start/toggle/remove changes only daily plan; outcome/resources/Evidence unchanged |
| AC-04 Resource-side association | capability feature | Node projection + new browser | Link/unlink from Study/Reading updates one outcome ref and reverse view, no progress/deletion |
| AC-05 Resource deletion boundary | model/state/capability feature | Node state + new browser + backup | Missing ref remains unavailable and unlinkable; no resource recreation |
| AC-06 Resource-origin session | sessions + Evidence projection | New browser quick/Deep; existing metric regressions | Optional active context becomes shipped provenance while resource metrics remain authoritative |
| AC-07 Legacy execution compatibility | existing owners + projections | Node/state; existing learning-outcome/critical; new browser | Legacy sessions/Evidence stay valid/unlinked through view/edit/backup/review/history |
| AC-08 Learning signals | signal model + capability/Review/Results | Node + new browser | Learner records each kind with provenance; edit/delete works; no lifecycle/progress/attempt mutation |
| AC-09 Suggested-signal consent | signal API/UI | Node + new browser | Runtime suggestion/no submit produces no record; explicit confirmation produces one tombstoned record |
| AC-10 Deliberate next attempt | weekly review + existing outcome update | Node + new browser | Keep does not mutate; revise requires explicit text and preserves attempt identity/timestamp rules |
| AC-11 Weekly Review | weekly feature | New browser | Linked finalized context and reflection/decision appear; unlinked activity and general review remain |
| AC-12 Results | outcomes feature | New browser | Evidence/decisions are separated from clearly labeled supporting activity |
| AC-13 Consistency | analytics feature | Node filter + new browser | Capability/unlinked/all filters restore history; cadence labels never claim competence |
| AC-14 Archived/unavailable capability | model + all renderers | Node + new browser + PWA | Historical snapshots render safely; new association/start disabled; no recreation/crash |
| AC-15 Backup/offline round-trip | index/state/manifest/PWA | Node state/composition; new browser backup; PWA offline | Repeated normalize/merge/export/import/reopen preserves refs/signals and legacy data without duplication/inference |
| AC-16 Contextual AI isolated | manifest boundary + capability files | Manifest/composition; new browser blocked-network flow; IA | Capability flow works offline without context route/modules/services; current Context data untouched |
| AC-17 Future retirement safety | preserved manifest/data + documented future fallback | Manifest/state/composition/PWA/IA | Delivery 3 proves non-removal and preserved data/assets; actual retirement remains explicitly gated to UX Simplification and is not falsely claimed |
| AC-18 Notes/Relations contracts | frozen modules + preservation canary | State + new browser vault/dictionary + IA | Capability use leaves note/folder/Markdown/wikilink/source-link/derived relations and routes intact |
| AC-19 Accessible cross-surface behavior | features + design-system CSS | New browser chromium/mobile/200% + IA mobile | Labels, focus, return, non-color status, long text, touch sizing, wrapping, and no overflow |

**Traceability result:** 19/19 acceptance criteria have named implementation owners, exact evidence locations, and deterministic proof. AC-17 is deliberately split: this Build proves the required preservation boundary and records the future fallback, while the later retirement scenario remains outside this delivery and cannot be claimed as executed.

## 16. Migration, rollout, rollback, and residual risks

### 16.1 Migration

No migration script, background rewrite, IndexedDB upgrade, state-version bump, or legacy-link inference is needed. Additive idempotent normalization supplies empty new collections/fields and preserves valid new records. This is the smallest compatible strategy under the current full-state architecture.

### 16.2 Rollout

Build produces static v73 assets only. Ship must verify the full acceptance matrix and complete cached-shell offline behavior. Commit, push, merge, deployment, and GitHub Pages publication remain separate explicit authorizations.

### 16.3 Rollback

Before publication, revert the 20-path product/evidence release unit. After any client saves new signal/reflection/Today data, use a new forward PWA generation that keeps `compasso.state.v3` and preserves unknown `learningSignals`/nested fields. Never clear IndexedDB, localStorage, backups, vault data, or unrelated caches as rollback.

### 16.4 Main risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Activity accidentally becomes capability progress | No capability numeric fields; byte-for-byte no-mutation browser assertions; explicit Results/Consistency copy |
| Resource association inferred into session context | Selector defaults none; only explicit submit creates shipped context; no inference tests |
| Divergent reverse links | One-sided outcome ownership and derived resource projection |
| Evidence/provenance duplication | Strict `sessionId → canonical execution` resolution; no Evidence context field |
| Nested Today/review merge ambiguity | Existing parent `updatedAt` merge, candidate saves, equal-time conflict preservation, focused merge tests |
| Missing records crash metric/render paths | Explicit type guards, snapshot fallback, unavailable states, outcome-only no-metric test |
| Signal suggestion silently becomes decision | No durable suggestion state; create API reachable only by explicit learner/confirm action |
| PWA partial shell after adding module | Manifest-owned asset, v73, composition failure tests, controlled offline reopen |
| Context/Notes/Relations collateral damage | Frozen files, manifest/state preservation assertions, vault/dictionary/IA canaries |

## 17. Build stop conditions

Stop and use `$sdd-iterate` if implementation requires any of the following:

- a parallel Session, Deep Work, Execution Session, Evidence, Notes, Relations, question, or feedback platform;
- a generic relation datastore or reverse-link persistence on Study/Reading;
- a second new durable collection beyond `learningSignals`;
- a capability percentage, completion, mastery, confidence, demonstrated score, ranking, or streak;
- inferred associations for legacy data or from resource/text/time similarity;
- a new IndexedDB object store, storage key, state v4, migration job, destructive rewrite, or unknown-field removal;
- `context` route/module removal, external AI/service dependency, or changes to preserved Contextual AI/Recall/error data;
- removal or weakening of Notes, Markdown/vault, wikilinks, graph derivation, or source links;
- a `service-worker.js`, package/lock, CI, snapshot, archived artifact, or out-of-manifest change.

## 18. Design quality gate

- Minimum additive association representation: resolved with exact `capabilityRef`.
- Ownership of every association/signal: resolved in section 4.2.
- Existing records versus one additive concept: resolved; only `learningSignals` is new.
- Normalization, merge, tombstones, missing refs: resolved in section 5.
- Exact Hoje flow: resolved in section 6.2.
- Study/Reading-side behavior: resolved in section 6.3.
- Resource-origin session behavior: resolved in section 6.4.
- Evidence projection: resolved in section 6.5.
- Feedback/gap/question/insight and consent: resolved in section 6.6.
- Weekly Review, Results, Consistency minimum: resolved in sections 6.7–6.9.
- Accessibility, mobile, offline: resolved in section 8.
- Backup/restore, state, PWA, rollback: resolved in sections 9 and 16.
- Focused validation: evidence-backed commands in section 14.
- Acceptance traceability: 19/19 in section 15.
- Closed manifest: 20 exact paths; no deletions or moves.
- Unresolved blocking decisions: none.

**PASS — Complete (Built) — Ready for Ship.**
