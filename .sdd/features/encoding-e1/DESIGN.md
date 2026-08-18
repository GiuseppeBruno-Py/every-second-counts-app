# DESIGN: Encoding E1 — Learn-to-Learn Study Ritual

## Metadata

| Field | Value |
|---|---|
| Feature slug | `encoding-e1` |
| Delivery | E1 — Contextual manual checkpoint during execution |
| Date | `2026-08-16` |
| Revision | `1.1` |
| Status | **Complete (Built)** |
| Product contract | `.sdd/features/encoding-e1/DEFINE.md` |
| Supporting rationale | `.sdd/features/encoding-e1/BRAINSTORM.md` |
| Repository baseline | `origin/main` at `cb7e8baf9b3df4c08269610e9c4a3e032668a4f8` |
| State contract | `compasso.state.v3` |
| Current / planned PWA generation | `compasso-pages-v76` / `compasso-pages-v77` during Build |

## Design status

**PASS — Complete (Built).** All 18 requirements, 30 acceptance scenarios, and 10 error/boundary scenarios are implemented and verified through the closed product, test, and documentation manifests. No new persistent domain, route, collection, store, storage key, execution mode, timer, framework, backend, external service, or Service Worker architecture was introduced.

The critical Design gate is resolved: execution-time selection provenance remains ephemeral in the existing `ritualRuntime`; the existing confirmed `item.ritualId` link is the only durable provenance; automatic suggestions use a UI-only sentinel distinct from a deliberately selected Ritual ID; and eligibility is converted into immutable snapshot data before the source execution and canonical execution are synchronized.

## Current implementation evidence inspected

`.codegraph/` is absent in the isolated authoritative worktree, so current source and tests were inspected directly.

### Repository and lifecycle evidence

- Worktree: `every-second-counts-app-encoding-e1-brainstorm`.
- Branch: `codex/encoding-e1-brainstorm`.
- `HEAD` and `origin/main`: `cb7e8baf9b3df4c08269610e9c4a3e032668a4f8`.
- No tracked or staged changes existed at the Design gate; only the Encoding E1 Brainstorm/Define artifacts were untracked.
- `DEFINE.md` is authoritative, with 18 requirements, 30 acceptance scenarios, 10 error/boundary scenarios, 15/15 clarity, and no blocking product decision.
- Shipped Retrieval R1 artifacts were inspected to preserve `futureUse` ownership and the repository's state-v3, snapshot, validation, manifest, PWA, and SDD conventions.

### Current product evidence

| Area | Current evidence | Design consequence |
|---|---|---|
| Ritual model | `ritual-model.js` has `normalize`, `snapshot`, `duplicate`, `update`, `suggest`, and stable defaults. `normalize` allow-lists fields; `snapshot` copies the reusable Ritual context. | Add the optional marker directly to the Ritual and widen snapshot helpers; do not add a Ritual type or another object owner. |
| Ritual management | `ritual-feature.js` owns create/edit/archive/delete/version UI, `item.ritualId` link/unlink, type-based suggestions, Session/Deep selectors, and checklist rendering. | The existing confirmed link qualifies. Selection provenance belongs in the existing transient `ritualRuntime`, not persisted state. |
| Current suggestion ambiguity | `sessionPrepareRitual()` and `ritualSessionRender()` place a type-based suggestion directly into a select. Current creation cannot tell an untouched suggestion from deliberate selection. | Render suggestions through a UI-only sentinel and keep actual Ritual options distinct. This is the deterministic consent boundary. |
| Current Session snapshot | `createSession()` resolves a Ritual from `uxRuntime` or `#ritualQuickSelect`, snapshots it, adds the source Session to a cloned candidate, calls `executionSyncRegular()`, and awaits the existing save. | Compute the eligible snapshot before candidate insertion/sync. Preserve the awaited transaction and failure restoration. |
| Current Deep snapshot | `deepStart.onclick` creates/syncs/saves Deep Work first; a later `ritual-feature.js` click listener adds the Ritual snapshot and saves again. | Move snapshot/checklist creation into `deepStart.onclick` before source insertion and `executionSyncDeep()`; remove only the late E1-relevant listener. |
| UX execution dialog | `ux-consolidation-feature.js` already displays an execution-only Ritual selector and records `uxRuntime.ritualId`, but later patches a Session snapshot in a microtask. | Record linked/explicit/none provenance in the existing UX runtime, pass it into the start flow, and remove the late snapshot patch. |
| Source normalization | `sessions-feature.js` has no separate Session model; `deep-work-model.js` clones any Ritual snapshot. | Normalize only the optional snapshot marker at the existing load boundaries; preserve all other legacy snapshot content. |
| Canonical execution | `execution-session-model.js` clones source `ritualSnapshot` in `normalize`, `fromRegular`, `fromDeep`, `migrate`, and `upsert`. It loads after `ritual-model.js`; `deep-work-model.js` currently loads before it. | Use the Ritual model's tolerant snapshot helper in both models and move `ritual-model.js` before `deep-work-model.js` in the manifest. |
| Active execution UI | `session-companion-feature.js` resolves the active canonical execution back to its Session/Deep source and owns stable controls, timer projection, focus/navigation, notifications, PiP, and after-render behavior. | It owns the one transient E1 state machine and shared renderer. Mode-specific mount points are adapters only. |
| Hidden legacy banner | `#sessionBanner` is forced hidden by `design-system.css`. | Do not revive it or create a second Session surface. |
| Deep focused UI | `deep-work-feature.js` owns the full-screen dialog, running/paused/finishing views, timer, lock/recovery, distraction Capture, and completion/Evidence transaction. | Add only a mount/trigger adapter to the running view; lifecycle behavior remains owned by Deep Work. |
| Timers | Session elapsed time comes from `session-timer-model.js`; Deep elapsed time comes from timestamp/status calculations in `deep-work-model.js`. | E1 emits no transition and owns no timer. Running time includes the checkpoint; paused time remains paused. |
| Recovery | Session/Deep source records and canonical execution are persisted; transient feature runtimes are rebuilt on load. | Persist only the Ritual/snapshot marker. Reload closes E1 and keeps execution/snapshot recovery. |
| Evidence | Session and Deep completion create Evidence under existing source/canonical `sessionId` provenance. | Do not change Evidence code, shape, transaction, or continuation. |
| Notes/Capture/Recall/signals | Durable outputs are already learner-triggered in their own features. Deep has a generic distraction Capture. | E1 creates no output and does not add an E1-specific save action. |
| Retrieval R1 | `learningContext.futureUse` is optional historical/current read-only context and already renders in Session Companion/Deep. | Leave it orthogonal; no eligibility, prompt, operation, Ritual, or route mapping. |
| Persistence | `storage.js` serializes the whole state to IndexedDB with localStorage compatibility; `index.html` exports/imports JSON; `state-foundation.js` uses record-level `updatedAt`, conflicts, and collection tombstones. | Optional nested fields round-trip without schema work. Existing whole-record semantics remain authoritative. |
| PWA | `app-manifest.js` owns module order, assets, `compasso.state.v3`, and `compasso-pages-v76`; CI runs `npm run test:all` on Ubuntu Chromium. | Cached assets change, so Build advances only the generation to v77; Service Worker logic remains unchanged. |

## Target architecture

### Ownership

| Concern | Owner | Durable? |
|---|---|---:|
| E1 capability of a reusable Ritual | `ritualTemplates[].encodingCheckpoint?: true` | Yes, optional |
| Existing Preview/orientation | `ritualTemplates[].preparation` and the copied `ritualSnapshot.preparation` | Yes, existing |
| Link chosen earlier by the learner | Existing source `item.ritualId` | Yes, existing |
| Selection provenance before start | Existing `ritualRuntime.executionSelections[session|deep]` | No |
| E1 eligibility after start | Existing source/canonical `ritualSnapshot.encodingCheckpoint?: true` | Yes, immutable snapshot |
| Reconstruction stage and chosen operation | Session Companion runtime | No |
| Execution status, timer, pause, recovery, completion | Existing Session/Deep Work owners | Yes, unchanged |
| Durable result | Existing Evidence through canonical `sessionId` | Yes, unchanged |

No checkpoint response, stage, operation, invocation, count, duration, result, or completion flag is persisted.

### End-to-end flow

```text
Ritual editor
  -> tolerant/strict Ritual model
  -> explicit source link OR deliberate execution selection
  -> transient provenance in ritualRuntime
  -> ritualExecutionSnapshot(surface)
  -> source Session/Deep Work already contains ritualSnapshot
  -> executionSyncRegular()/executionSyncDeep()
  -> canonical execution contains the same normalized snapshot
  -> Session Companion reads the active source snapshot
  -> manual checkpoint: closed -> reconstruct -> operation -> closed
  -> normal Session/Deep Work completion -> unchanged Evidence
```

### Non-architecture

E1 does not create an Encoding module, controller, route, model, collection, Session mode, execution record, timer, prompt taxonomy, PACER/Ladder/GRINDE schema, Note/Capture adapter, or analytics event. The implementation extends existing owners only.

## Ritual model and canonical representation

### Direct optional property

The canonical property belongs directly to the existing Ritual template object:

```js
encodingCheckpoint: true
```

Disabled state is property absence. `false`, `null`, blank text, labels, and unsupported values are never canonical persisted representations. Defaults remain absent. A duplicate retains a valid marker because it is a new version-independent copy of the learner's explicit Ritual configuration.

### Exact `ritual-model.js` API design

Existing APIs remain. The following changes/helpers are closed:

| API | Design |
|---|---|
| `normalize(value, now)` | Tolerant persisted-data boundary. Include `encodingCheckpoint: true` only when the raw value is exactly boolean `true`; otherwise omit only that property. Preserve current Ritual normalization and idempotence. |
| `create(value, now)` | New strict command boundary used by the editor for a new Ritual. If an own `encodingCheckpoint` property is present, validate it before returning a normalized record. The caller still supplies the existing ID/timestamps. |
| `update(current, patch, now)` | Existing command boundary becomes strict only when `patch` owns `encodingCheckpoint`. `true` enables; `false`, `null`, `undefined`, or blank string clears to absence; any other non-empty value throws `Error` with `code === 'encoding-checkpoint-invalid'` before a candidate is returned. A patch without the property preserves the current valid marker. Existing ID/version/timestamp rules remain. |
| `duplicate(value, id, now)` | Continue to normalize/copy the whole valid Ritual, including the optional marker; reset only existing duplicate-owned fields. |
| `snapshot(value, options = {})` | Keep the current snapshot shape. Add the marker only when `options.includeEncodingCheckpoint === true` **and** the normalized Ritual is capable. Default false makes old/direct callers fail closed. |
| `normalizeSnapshot(value)` | New tolerant nested-data helper. Return `null` for a non-object. Deep-clone otherwise, preserving existing/legacy snapshot content; retain the marker only when it is exactly `true` and the snapshot has a non-empty `ritualId` plus a valid positive version. Omit malformed marker only. |
| `isEncodingCheckpointSnapshot(value)` | New pure predicate over `normalizeSnapshot(value)`; true only for a structurally valid snapshot with the strict marker. It never consults a live Ritual. |

Strict command validation and tolerant load normalization remain deliberately separate. No truthiness or string matching enables E1.

### Editor behavior

`ritual-feature.js` adds one native checkbox labeled **Pausa para processar** with concise helper text. `ritualRender()` sets it from strict normalized state. `ritualSave.onclick` always owns this editor field and passes boolean true/false to `create()`/`update()`; unchecked therefore clears to canonical absence. A caught `encoding-checkpoint-invalid` error leaves the Ritual collection, current record, and draft controls untouched, exposes an accessible inline error, and focuses that error. No new route or Ritual type appears.

Archive/reactivate preserves the marker. Delete removes only the live Ritual under current behavior; source links are cleared as today, while stored snapshots remain untouched. Versioned update and duplicate use model APIs and retain the defined semantics.

## Explicit selection and linkage provenance

### Existing durable link

`item.ritualId`, written only by the current confirmed **Vincular à ação** action in `ritual-feature.js`, is the existing deliberate durable linkage contract. It qualifies as provenance `linked` when it resolves to a currently selectable, normalized Ritual at execution setup. E1 adds no association and does not infer links for capabilities, resources, names, types, or legacy records.

An archived/missing linked Ritual cannot be newly selected at start and fails to `none`/normal behavior. If it had already been snapshotted, the stored snapshot remains authoritative.

### Transient provenance owner

Extend the existing `ritualRuntime` with:

```text
executionSelections = {
  session: { contextKey, ritualId, provenance },
  deep:    { contextKey, ritualId, provenance }
}

provenance = linked | explicit | suggested | none
contextKey = "<domain>:<itemId>"
```

These values exist only until start/cancel/new setup and are never copied into state or backup.

### Deterministic suggestion versus choice

Add these small helpers to the existing `ritual-feature.js` owner:

| Helper | Signature and invariant |
|---|---|
| `ritualPrepareExecution(surface, domain, itemId, requestedChoice = null)` | Resolve active templates, an existing valid link, an explicitly passed choice, and the existing type suggestion in that order; initialize the relevant selector/checklist and runtime provenance for the exact `contextKey`. |
| `ritualSetExecutionChoice(surface, controlValue)` | Convert empty to `none`, a real Ritual ID chosen through the control to `explicit`, and the suggestion sentinel to `suggested`; update helper text/checklist without persistence. |
| `ritualExecutionSnapshot(surface)` | For the matching setup context, resolve the normalized Ritual, compute `includeEncodingCheckpoint` only for `linked` or `explicit`, and return the existing `{ ritualSnapshot, ritualChecklist }` data. It never returns provenance. |
| `ritualClearExecution(surface)` | Clear setup-only state after successful start, cancel/new context, or invalidation. |

When no durable link/request exists but `ritualModel.suggest()` returns a Ritual, the select shows a UI-only option such as `suggested:<ritualId>` labeled as an automatic suggestion. The same Ritual also remains available as a normal real-ID option. Therefore:

- untouched sentinel -> provenance `suggested`, snapshot keeps existing Ritual context but omits the E1 marker;
- choosing the real-ID option, even for the same suggested Ritual -> provenance `explicit`;
- an existing real-ID link -> provenance `linked` without another confirmation;
- programmatic initialization never calls the deliberate-choice handler;
- `suggested:*` never reaches state, source records, canonical records, or backup.

The UX execution dialog records `{ritualId, provenance}` in its existing `uxRuntime`: a current source link starts as `linked`; a user control change is `explicit`; empty is `none`. It passes this object to Session/Deep setup instead of patching a record later.

This answers the critical gate: execution creation knows consent from the runtime provenance, not from the selected DOM value alone.

## Snapshot creation and propagation

### Exact eligibility computation point

`ritualExecutionSnapshot(surface)` is the only feature-level eligibility computation point. It evaluates:

```text
matching current setup context
AND normalized live Ritual has encodingCheckpoint === true
AND provenance is linked OR explicit
```

It then calls `ritualModel.snapshot(ritual, { includeEncodingCheckpoint: true })`. Suggested/none paths call the same snapshot API with false or return no snapshot. The runtime after start uses only `ritualModel.isEncodingCheckpointSnapshot(storedSnapshot)`.

### Normal Session path

1. `openSessionStartCore()` calls `ritualPrepareExecution('session', domain, itemId, options.ritualSelection)` after the current target is valid.
2. `sessionPrepareRitual()` delegates selector population to that helper; it no longer independently loses provenance.
3. `createSession()` calls `ritualExecutionSnapshot('session')` before constructing the source record.
4. The returned snapshot/checklist are placed directly in the source Session object.
5. The existing cloned candidate receives that complete source record.
6. `executionSyncRegular(session)` copies the already-complete snapshot into the canonical execution.
7. The existing awaited `saveData()` transaction commits both or restores the previous state/draft.
8. On success, `ritualClearExecution('session')`; on failure, retain the choice for retry.

When Session mode changes to Deep Work, the current Session choice/provenance is passed into `deepOpenOutcome()`/`deepOpen()`; it is not converted to persistence or silently upgraded.

### Deep Work path

1. `deepOpenCore()` accepts `options.ritualSelection` and calls `ritualPrepareExecution('deep', ...)` for a new setup. Recovery of an already-running Deep Work does not reselect or recompute eligibility.
2. `deepStart.onclick` obtains `ritualExecutionSnapshot('deep')` before `deepModel.normalize()`/`transition('start')`.
3. The complete snapshot/checklist are included in the new Deep source record.
4. The source is added and `executionSyncDeep(session)` creates the canonical copy from the same data.
5. The existing `deepSave()` path remains the start persistence owner; no second late save is introduced.
6. The current `ritual-feature.js` post-`deepStart` listener and the `ux-consolidation-feature.js` post-submit microtask snapshot patch are removed.
7. Clear setup provenance after the source/canonical pair has been created.

### Load and canonical normalization

- `sessions-feature.js` widens its initial Session-array normalization only for `ritualSnapshot` through `ritualModel.normalizeSnapshot()`; all other fields remain untouched.
- `deep-work-model.js` receives the existing Ritual model dependency and uses the same helper in `normalize()`.
- `execution-session-model.js` receives the existing Ritual model dependency and uses the same helper in `normalize()`; `fromRegular`, `fromDeep`, migration, and upsert therefore preserve the same strict marker.
- `app-manifest.js` moves `ritual-model.js` before `deep-work-model.js` so the browser dependency is deterministic. Node CommonJS dependencies remain explicit.

Malformed marker data disappears from the normalized snapshot; the containing Session/Deep/canonical record remains valid. No live lookup repairs or enables it.

## Historical immutability

After start, only the source/canonical snapshot is consulted. Editing, disabling, renaming, versioning, archiving, deleting, merging, or relinking the live Ritual cannot change a running or historical execution. The checkpoint remains available when the stored snapshot is valid, even if the Ritual or source action later disappears. A malformed/legacy snapshot fails closed with no trigger but does not block execution recovery, pause, completion, or Evidence.

Source and canonical records continue to be selected/merged as whole records by existing timestamps. E1 never recalculates a snapshot from a winning live Ritual record.

## Shared runtime presentation

### Owner and adapters

`session-companion-feature.js` owns the checkpoint state machine, wording, eligibility predicate, render helpers, event handling, and focus lifecycle for both modes. This is the existing canonical active-execution presentation owner.

Mode-specific code is limited to mounts:

- normal Session: an eligible textual trigger and inline region in the existing Session Companion;
- Deep Work: an eligible textual trigger and inline region in `#deepRunning`; when the Deep dialog is closed, the Companion trigger reopens that same existing dialog and then opens/focuses the Deep region.

Only one trigger is reachable in the active visual context. No new route/dialog/execution surface is created. Both mounts call the same state transitions and renderer.

### Activity projection

Extend `activity()` to return `ritualSnapshot` from the source Session/Deep record. It continues to use the canonical execution only to choose the active source. Eligibility is:

```text
status is active/running or paused
AND ritualModel.isEncodingCheckpointSnapshot(activity.ritualSnapshot)
```

`finishing`, `completed`, `interrupted`, absent source, or malformed marker render no trigger/panel. No live Ritual or `futureUse` lookup participates.

### Transient state machine

Extend the existing companion runtime with one state object:

```text
encoding = {
  executionId: null | canonical activity id,
  stage: closed | reconstruct | operation,
  operation: null | connect | contrast | organize,
  origin: null | stable trigger element/id
}
```

Transitions:

```text
closed --manual trigger--> reconstruct
reconstruct --Escolher uma operação--> operation(operation=null)
operation --choose--> operation(exactly one value)
operation --choose another--> operation(replacement value)
reconstruct/operation --Fechar--> closed
operation(selected) --Voltar à execução--> closed
closed --new invocation--> reconstruct with no prior value
any open state --execution changes/finishing/disappears--> closed without focus theft
```

No `selected-operation` state is necessary because `operation` plus a nullable single value expresses it without duplicating UI state. No state is serialized.

### Product wording

- Trigger: **Pausa para processar**.
- Reconstruction: **Sem consultar, reconstrua a ideia principal com suas palavras.**
- Stage action: **Escolher uma operação**.
- **Conectar** — “Relacione a ideia a algo que você já conhece.”
- **Contrastar** — “Compare com uma ideia relacionada, diferente ou oposta.”
- **Organizar** — “Identifique a estrutura: partes, grupos, níveis ou relações.”
- Close/cancel: **Fechar**.
- Guided return: **Voltar à execução**. This wording deliberately does not imply changing a paused lifecycle to running.

The UI contains no text input, scratchpad, save, success, mastery, proof, score, count, or completion claim.

### Preview/orientation

When an eligible stored snapshot has non-empty existing `preparation`, the active surface exposes a collapsed `<details>` labeled **Orientação do ritual** containing those copied instructions. It has no acknowledgement or response.

- Normal Session: appears with the Companion's E1 affordance early in execution.
- Deep Work: setup already displays current Ritual preparation/checklist. After start that setup is hidden; the snapshot-backed collapsed orientation is then available in the running surface, so no simultaneous duplicate is shown.
- Empty preparation: render no details/placeholder.

The snapshot, not the live Ritual, supplies the text.

## Timer, pause, completion, and reload semantics

- Opening/staging/closing E1 emits no Session/Deep transition and calls no save.
- A running execution continues its current timestamp-derived elapsed time while E1 is open.
- An already paused execution remains paused. **Voltar à execução** only closes E1; it does not click resume.
- Existing pause/resume controls remain usable while the inline panel is open. Their current transition is authoritative; the E1 region rerenders status without resetting its stage unless execution enters `finishing`/terminal.
- Starting finish/interruption closes E1 without restoring focus, allowing the existing completion owner to focus its form.
- E1 never blocks or gates pause, interruption, completion, Evidence, or missing-source recovery.
- Reload creates a fresh feature runtime: the panel is closed and operation absent. Persisted execution status/timestamps/snapshot recover normally, so the trigger reappears if eligible.
- Reopening after reload or later in the same execution begins at reconstruction.
- Session Companion's one-second render updates clock/status without rebuilding an open E1 subtree, preventing focus loss. The E1 renderer runs only for E1 state/activity/eligibility changes.

## Focus and accessibility orchestration

### Semantic structure

- Native `<button type="button">` triggers with visible text and `aria-controls`/`aria-expanded`.
- Inline `<section role="region" aria-labelledby="...">`; no dialog and no focus trap.
- Reconstruction and operation headings use `tabindex="-1"` as deterministic programmatic focus targets.
- Operation choices are a native single-choice radio group with a semantic `fieldset`/`legend`; one checked value is programmatically exposed.
- The selected operation instruction uses a targeted polite status region; timer updates do not share it.
- Close and guided-return buttons remain available in logical DOM order.

### Deterministic focus

1. Save the stable triggering control/id in `runtime.encoding.origin`.
2. Mutate/open the inline region synchronously.
3. On the next animation frame, after the region exists in its final mount, focus the reconstruction heading.
4. Advancing stages focuses the operation heading; selecting a radio leaves focus on that radio and announces only the instruction/status change.
5. Close/guided return synchronously hides the region, then on the next animation frame focuses the original trigger or its stable eligible equivalent after a rerender.
6. Lifecycle-driven cleanup never steals focus from pause/finish/recovery owners.

No arbitrary delay is used. Timer/`renderAll()` rerenders do not replace the open region. Enter/Space and native radio arrow keys work without custom keyboard simulation.

### Responsive/mobile behavior

- At 360–390 px and 200% zoom, the Companion's open E1 state expands to a viewport-safe single column above the existing bottom navigation; Deep uses the existing centered single-column main area.
- Operation choices stack; text wraps with `min-width: 0`/`overflow-wrap`; no fixed content width or horizontal scrolling.
- Pause/finish controls remain reachable and precede/follow the inline region in a predictable reading order.
- When the Companion panel is open, drag initiation from its main button is suppressed so cognitive controls are not moved accidentally; closing restores existing drag behavior.
- Coarse-pointer controls satisfy the current 44 px contract; no gesture is required.
- No state depends on color. Existing visible-focus tokens are reused.
- No new essential animation is introduced; existing reduced-motion rules cover any inherited transition.

## Persistence, state, backup, merge, and compatibility

### State v3

`compasso.state.v3` remains safe because E1 widens only two existing object owners:

```text
ritualTemplates[].encodingCheckpoint?: true
sessions/deepWorkSessions/executionSessions[].ritualSnapshot.encodingCheckpoint?: true
```

No collection, IndexedDB store, localStorage key, envelope, migration job, backfill, response record, field-level timestamp, or tombstone is added. IndexedDB/localStorage whole-state persistence naturally serializes the marker.

### Backup/restore matrix

| Input | Result |
|---|---|
| Legacy Ritual/snapshot without marker | Valid, disabled, no placeholder/backfill/warning |
| Enabled Ritual | JSON round-trip retains strict `true` |
| Eligible historical source/canonical snapshot | JSON round-trip retains strict `true` independent of live Ritual |
| Disabled field | Remains absent, not `false`/`null` |
| Malformed persisted Ritual marker | Omit marker only; retain valid Ritual fields |
| Malformed persisted snapshot marker | Omit marker only; retain execution and other snapshot content |
| Unknown compatible state/protected domains | Preserve under existing serializers/normalizers |

Export/import code does not change. Tests exercise existing UI backup flows and direct JSON/state normalization.

### Merge/conflict/tombstone behavior

- A Ritual remains a record-timestamp collection item. The existing newer whole-record winner carries its internally consistent marker and other Ritual fields together.
- Equal timestamps retain existing auditable conflict behavior; E1 adds no field merge.
- Existing `ritualTemplates:<id>` tombstones prevent record resurrection; there is no E1 tombstone.
- Source/canonical Session/Deep records keep their own whole-record snapshot. A later live Ritual winner/delete never rewrites snapshots.
- Repeated normalization/merge remains idempotent.

### Protected domains

Evidence, `learningSignals`, Notes/Atlas, Capture, Markdown/vault, folders, metadata, wikilinks, Relations, graph derivation, Studies, Readings, Active Recall, Weakness/Error Notebook, Contextual AI, Retrieval R1, Weekly Review, Results, Consistency, routes, and legacy/unknown state are unchanged. E1 performs no automatic durable action or navigation.

## Failure-safe behavior

| Condition | Required implementation behavior |
|---|---|
| Invalid explicit Ritual command | Model throws `encoding-checkpoint-invalid` before candidate mutation; editor keeps draft/state and focuses an accessible error. |
| Malformed persisted Ritual marker | Tolerant normalization omits marker only; Ritual remains usable and disabled. |
| Malformed/missing snapshot | Source/canonical execution remains usable; no E1 trigger; no lookup/inference. |
| Untouched suggestion/default | Existing non-E1 Ritual snapshot context may be retained, but marker is omitted and no trigger appears. |
| Missing/archived Ritual before start | It cannot newly qualify; ordinary start remains available. |
| Ritual edited/archived/deleted after start | Valid stored snapshot remains authoritative and E1 availability does not change. |
| Missing action/material after start | Existing title fallback/completion recovery remains; valid snapshot still enables E1. |
| Session start save failure | Existing previous-state rollback and draft restoration include the still-transient Ritual choice; no source/canonical partial record. |
| Deep start persistence degradation | No extra E1 write or false checkpoint output is created; E1 follows the existing Deep start status/error boundary and never masks it. |
| Reload with open checkpoint | Discard transient UI only; recover execution/snapshot and show the closed trigger. |
| Pause/finish while open | Pause remains authoritative; finishing/terminal closes E1 without blocking or focus theft. |
| Repeated invocation | Fresh reconstruction, no history/count/record. |
| E1 UI/render failure | Ordinary Session/Deep controls and Evidence remain operable; eligibility data is harmless optional snapshot content. |

## PWA/cache generation

Current `app-manifest.js` declares `compasso-pages-v76`. The closed Build changes cached JavaScript/CSS plus manifest module order, so Build must advance only `cacheName` to **`compasso-pages-v77`** after the runtime assets are finalized.

`contracts.state` remains `compasso.state.v3`. `service-worker.js`, install/activate/fetch strategy, cache prefix/ownership, asset composition architecture, manifest/webmanifest, and storage are unchanged. Automated tests cover manifest composition, generation, update convergence, offline reopen, and E1 state. A physical installed-PWA v76 -> v77 update/reopen/offline smoke remains an external Ship/release gate.

No PWA file is changed during Design.

## Closed implementation manifest

### A. Product files expected to change (10)

| # | Path | Action | Exact responsibility change | Must remain untouched |
|---:|---|---|---|---|
| 1 | `ritual-model.js` | Modify | Optional marker normalization; strict create/update command boundary; duplicate preservation; eligible snapshot/normalizer/predicate APIs | Ritual types/default identities, list normalization, suggestion logic, other fields |
| 2 | `ritual-feature.js` | Modify | Editor checkbox/error; centralized transient selection provenance; suggestion sentinel; selector/checklist setup; remove late Deep snapshot patch | Existing CRUD/link/unlink/archive/delete ownership and routes; no persisted provenance |
| 3 | `sessions-feature.js` | Modify | Tolerant source snapshot load; delegate Ritual setup; include snapshot before candidate/canonical sync; pass provenance into Deep | Defaults, progressive disclosure, timer, Today isolation, awaited start/completion, Evidence transaction |
| 4 | `deep-work-model.js` | Modify | Depend on Ritual model and tolerate/retain valid snapshot marker through normalize/transitions/reload | State machine, timer math, metrics, learning context, schemaVersion |
| 5 | `deep-work-feature.js` | Modify | Accept transient Ritual choice; snapshot/checklist before source/canonical creation; E1 running mount; remove dependence on late patch | Lock, timer, preparation, distraction Capture, pause/finish/recovery, Evidence transaction |
| 6 | `execution-session-model.js` | Modify | Depend on Ritual model; normalize marker in canonical source migration/upsert copies | Canonical identity/status/modes, learning context, history/counting, transitions/lease |
| 7 | `session-companion-feature.js` | Modify | Project source snapshot; own shared E1 state machine, triggers, regions, Preview, rendering, focus and cleanup | Active selection, timer, pause/finish, navigation, PiP/notification/badge behavior |
| 8 | `ux-consolidation-feature.js` | Modify | Track linked/explicit/none execution choice and pass it into starts; remove post-submit snapshot microtask | UX modes, execution options, source link ownership, unrelated card actions |
| 9 | `design-system.css` | Modify | Durable Ritual control/error and shared E1 inline/Deep/companion responsive, focus, touch, zoom, reduced-motion styles | Tokens, unrelated layouts, navigation, existing Session/Weekly behavior; no snapshot churn |
| 10 | `app-manifest.js` | Modify | Load Ritual model before Deep model and advance cache generation to v77 | State v3, collections, assets, composition/SW ownership architecture |

No other product file is authorized. A concrete contradiction during Build must stop that area and return through `$sdd-iterate`; it must not silently expand this manifest.

### B. Test files expected to change/add (10)

| # | Path | Action | Coverage responsibility |
|---:|---|---|---|
| 1 | `tests/ritual-model.test.js` | Modify | Enable/absence/clear, strict invalid command, tolerant malformed load, idempotence, unrelated update, duplicate, snapshot eligibility, invalid/legacy snapshot |
| 2 | `tests/deep-work-model.test.js` | Modify | Eligible/ineligible snapshot normalization, transitions/reload/interruption immutability, malformed marker fail-closed |
| 3 | `tests/execution-session-model.test.js` | Modify | Source-to-canonical Session/Deep snapshot parity, migration/upsert, legacy/malformed marker, live-source independence |
| 4 | `tests/state-foundation.test.js` | Modify | State-v3 JSON round-trip, newer winner, equal-time conflict, tombstone, protected data, no field-level E1 merge/backfill |
| 5 | `tests/app-manifest.test.js` | Modify | v77, Ritual-before-Deep/canonical dependency, unchanged state/catalog/assets/SW ownership |
| 6 | `tests/browser/encoding-e1-flows.spec.js` | Add | Dedicated end-to-end eligible/ineligible Session/Deep, editor, provenance, sequence, repetition, timer, pause/reload, source mutation/missing, backup, isolation, focus |
| 7 | `tests/browser/critical-flows.spec.js` | Modify | Preserve canonical Session/Deep completion/Evidence, missing-source, edit/delete, and resource metrics with/without E1 |
| 8 | `tests/browser/capability-context-flows.spec.js` | Modify | `futureUse`, learningSignals, protected knowledge-domain and legacy unlinked isolation alongside E1 |
| 9 | `tests/browser/design-system-flows.spec.js` | Modify | Keyboard/screen-reader semantics, focus open/return/rerender, 360/390 px, 200% zoom, coarse pointer, reduced motion, no overflow |
| 10 | `tests/browser/pwa-lifecycle-flows.spec.js` | Modify | v77 update/offline reopen with eligible snapshot and unchanged shell/storage architecture |

Existing semantic assertions are extended, not removed. No reference image update is planned because E1 is validated structurally/responsively; an unexpected snapshot diff requires review, not automatic regeneration.

### C. SDD/documentation artifacts

| Path | Action | Purpose |
|---|---|---|
| `.sdd/features/encoding-e1/BRAINSTORM.md` | Preserve | Approved rationale/lifecycle evidence; no Design or Build content change authorized |
| `.sdd/features/encoding-e1/DEFINE.md` | Modify during Design only | Mark Complete (Designed); requirements/AT/ER remain unchanged |
| `.sdd/features/encoding-e1/DESIGN.md` | Create | Authoritative implementation/test contract |
| `docs/sessions-feature.md` | Modify during Build | Document optional Ritual marker, explicit selection rule, immutable source/canonical snapshot, shared ephemeral checkpoint, and protected boundaries |

### D. Inspected and explicitly unchanged

`AGENTS.md`, `session-timer-model.js`, `execution-session-feature.js`, `state-foundation.js`, `storage.js`, `index.html`, `app-composition.js`, `service-worker.js`, `manifest.webmanifest`, `learning-outcome-model.js`, `learning-outcome-feature.js`, `today-feature.js`, `evidence-feature.js`, `capture-model.js`, `capture-feature.js`, `recall-feature.js`, `weakness-feature.js`, `weekly-review-feature.js`, `information-architecture-feature.js`, `markdown-vault-feature.js`, `markdown-vault-hardening.js`, `dictionary-relations-feature.js`, `knowledge-graph-feature.js`, `context-rag-feature.js`, `context-learning-feature.js`, `drive-sync-feature.js`, `docs/evidence-feature.md`, `docs/active-recall-feature.md`, `tests/session-timer-model.test.js`, `tests/execution-session-contract.test.js`, `tests/browser/information-architecture-flows.spec.js`, `tests/browser/foundation-flows.spec.js`, and existing visual snapshot files.

These remain canonical regression evidence or protected consumers. They are not implementation owners for E1.

## Dependency-ordered Build plan

1. Extend `ritual-model.js` and `tests/ritual-model.test.js`; freeze strict/tolerant command and snapshot semantics.
2. Reorder the Ritual/Deep model dependency in `app-manifest.js`; update manifest tests without changing architecture.
3. Use `normalizeSnapshot()` in Deep/canonical/source load boundaries and prove source-to-canonical/legacy behavior in Node tests.
4. Add the Ritual editor field/error and replace ambiguous selector setup with transient provenance/sentinel helpers.
5. Wire normal Session creation to compute the snapshot before candidate/canonical sync and retain existing rollback.
6. Wire Deep Work creation to include the snapshot before sync; remove the two late snapshot patches and pass choices from UX/Session-to-Deep flows.
7. Add the shared Session Companion state machine, normal/Deep mounts, Preview projection, eligibility cleanup, and focus lifecycle.
8. Add durable responsive/accessibility styling only in `design-system.css`.
9. Add/extend the closed browser suites for 30 ATs, 10 ERs, protected domains, backup, PWA, and accessibility.
10. Update `docs/sessions-feature.md`, advance to v77 only after cached assets are final, then run focused and canonical validation.

## Closed validation plan

### Commands

```powershell
node --test tests/ritual-model.test.js tests/deep-work-model.test.js tests/execution-session-model.test.js tests/state-foundation.test.js tests/app-manifest.test.js
npm run build:test
npx playwright test tests/browser/encoding-e1-flows.spec.js tests/browser/critical-flows.spec.js tests/browser/capability-context-flows.spec.js tests/browser/design-system-flows.spec.js tests/browser/pwa-lifecycle-flows.spec.js --project=chromium --project=mobile
npm run test:all
git diff --check
```

Build must additionally prove the diff is limited to the closed manifest, there are no deletions/new storage concepts, and `service-worker.js`, Evidence, Notes/vault/graph, Retrieval R1, Recall/signals, routes, and state contract remain unchanged.

### Requirement traceability (18/18)

| Requirement | Implementation evidence | Test evidence |
|---|---|---|
| R-001 | Ritual model marker + editor checkbox/clear | Ritual model enable/clear; encoding editor round-trip |
| R-002 | Strict `create/update`; tolerant `normalize/normalizeSnapshot` | Invalid atomic command, malformed/idempotent model/state/browser fixtures |
| R-003 | Existing link + runtime provenance + suggestion sentinel | Linked/explicit/suggested Session/Deep matrices |
| R-004 | Snapshot before source/canonical sync; snapshot-only runtime | Deep/canonical Node parity; live Ritual edit/archive/delete browser flow |
| R-005 | Snapshot `preparation` in optional details | Eligible with/without preparation browser assertions |
| R-006 | Session Companion trigger/region | Normal Session eligible/ineligible/rerender tests |
| R-007 | Deep mount using the shared companion runtime | Deep running/paused/reload/interruption tests |
| R-008 | Trigger-only transition; no timers/auto-open | Idle wall-clock/no-action and manual activation tests |
| R-009 | Shared reconstruction-first wording and operations | DOM order, focus, approved labels/instructions |
| R-010 | Single radio value; reset on close/reinvoke | Replace selection/repeat/reload assertions |
| R-011 | No authored control/persistence | DOM/state diff and protected-output canaries |
| R-012 | No lifecycle transition; same source/timer | Timer, pause, close, repeat, source/canonical identity tests |
| R-013 | Snapshot-backed recovery; transient reset | Session/Deep reload, missing action/Ritual, malformed snapshot |
| R-014 | Unchanged completion/Evidence transaction | Critical Session/Deep completion and canonical `sessionId` regressions |
| R-015 | No Notes/Capture/signal/Recall/graph mutation | Capability-context/protected-domain before-after fixtures |
| R-016 | No `futureUse` input to E1 | Present/absent/invalid/changed futureUse matrix |
| R-017 | State v3 and existing whole-record semantics | State/backup/merge/conflict/tombstone/manifest tests |
| R-018 | Shared semantic UI, responsive/offline/protected compatibility | Design-system matrix and PWA offline lifecycle |

### Acceptance traceability (30/30)

| Scenario | Concrete automated evidence |
|---|---|
| AT-01 | Ritual model create-enable plus editor save/reload asserts one existing record with strict true/version update |
| AT-02 | Model/editor clear asserts property absence and future ineligibility |
| AT-03 | Encoding browser links through existing Ritual action, starts Session, inspects source/canonical marker and trigger |
| AT-04 | Session optional config changes sentinel/empty to real ID, starts, and proves no association persisted |
| AT-05 | Deep explicit selection asserts identical source/canonical marker and focused trigger |
| AT-06 | Session and Deep untouched `suggested:*` fixtures retain valid Ritual context without marker/trigger |
| AT-07 | Eligible normal Session render and forced `renderAll()` assert exactly one reachable named trigger |
| AT-08 | Eligible Deep running/paused render and rerender assert same sequence and unchanged state |
| AT-09 | After start, edit/disable/version/archive/delete/relink live Ritual; source/canonical snapshot and trigger remain |
| AT-10 | Eligible snapshot preparation appears in optional orientation; empty preparation renders no placeholder/response |
| AT-11 | Let timer advance without activation and assert closed region/no automatic focus/status change |
| AT-12 | Keyboard/pointer trigger asserts reconstruction is first, operation controls initially unavailable, and focus target |
| AT-13 | Select Conectar and assert only it plus relationship instruction and guided return |
| AT-14 | Select Contrastar and assert only it plus comparison instruction and guided return |
| AT-15 | Select Organizar and assert only it plus structure instruction and guided return |
| AT-16 | Change operation and assert one checked radio/new instruction/no old selected state |
| AT-17 | DOM audit across stages asserts no textarea/contenteditable/save/score/required response/preview acknowledgement |
| AT-18 | Close before selection in Session and Deep; assert same running ID/status, no state diff, focus return |
| AT-19 | Guided return after choice asserts same execution, cleared runtime, no new record/action/completion |
| AT-20 | Timestamp-based elapsed assertions before/during/after open prove interval included and no second timer |
| AT-21 | Open/close while paused and assert paused status/timestamps/elapsed semantics unchanged |
| AT-22 | Reinvoke in same execution and assert reconstruction, null operation, no count/history/state write |
| AT-23 | Reload open Session and Deep fixtures; assert closed panel, preserved status/timestamps/snapshot, trigger restored |
| AT-24 | Critical flow runs pause/resume/interruption/completion/Evidence with/without checkpoint; Evidence shape/sessionId unchanged |
| AT-25 | Capability-context fixture varies `futureUse` before/after start and asserts identical E1 eligibility/wording/operation/routing |
| AT-26 | Protected-domain seeded fixture diffs Notes/Capture/signals/Recall/Weakness/Relations/graph/routes after repeat use |
| AT-27 | Legacy backup import/normalize/save/reload/execute/complete asserts no marker/backfill/warning and protected data intact |
| AT-28 | Node state/model plus browser new-backup round-trip assert enabled/absent markers, source/canonical history, merge/conflict/tombstone owners |
| AT-29 | PWA lifecycle v77 update/reopen offline resumes eligible execution, invokes E1, completes, and records Evidence without network |
| AT-30 | Design-system + E1 browser matrix covers keyboard semantics, announced labels/state, focus/rerender, 360/390 px, 200% zoom, coarse pointer, reduced motion, touch geometry, and overflow |

### Error/boundary traceability (10/10)

| Scenario | Concrete automated evidence |
|---|---|
| ER-01 | Ritual model create/update unsupported values throw `encoding-checkpoint-invalid`; feature stub/error test retains record/draft and focuses alert |
| ER-02 | Ritual model/state/browser import fixtures for string/object/number omit marker only and remain idempotent |
| ER-03 | Deep/canonical/source malformed/legacy snapshot fixtures remain executable with no trigger/live lookup/crash |
| ER-04 | Untouched suggestion/default plus present `futureUse` remains ineligible and ordinary execution starts without warning |
| ER-05 | Live Ritual edit/disable/archive/delete/conflict/unavailable after start leaves stored snapshot/trigger/history intact |
| ER-06 | Cancel, lifecycle cleanup, and reload at reconstruct/operation stages clear only transient state with no unsaved warning |
| ER-07 | Missing action/material plus forced unrelated persistence/recovery failure preserves current safe execution/error behavior and creates no output |
| ER-08 | Pause/resume/finish/complete/interrupt with E1 available asserts terminal trigger suppression, panel cleanup, and unchanged Evidence transaction |
| ER-09 | State-foundation newer/equal/tombstoned Ritual fixtures prove whole-record winner/conflict/tombstone and no snapshot recomputation |
| ER-10 | Protected-domain, legacy/unknown state, JSON, vault/graph, Retrieval, Recall/signals, offline fixtures remain byte/semantic compatible |

## Security, privacy, performance, and observability

- The learner alone enables a Ritual, links/selects it, opens the checkpoint, and chooses an operation.
- No content or activity leaves the device; no AI, network, telemetry, account, or external dependency is introduced.
- Stable application wording is static; existing user text continues through `escapeHtml`/textContent rendering.
- Eligibility and rendering are constant-time over the selected Ritual/current execution. No history scan or background scheduler is introduced.
- Timer renders do not rebuild the checkpoint subtree, limiting DOM churn and focus instability.
- Existing accessible errors, save failures, browser tests, and PWA diagnostics remain the operational evidence. E1 adds no production log or analytics event.

## Rollback

Before any v77 exposure, rollback is a single revert of the closed product/test/docs change set.

After a user may have saved `encodingCheckpoint: true`, do **not** deploy v76 code that would strip the new Ritual field during allow-list normalization. Use a later forward generation that keeps tolerant Ritual/snapshot preservation while hiding/removing the E1 editor and presentation if rollback is necessary. Preserve source/canonical snapshots, IndexedDB/localStorage, JSON backups, caches outside normal owned-generation cleanup, and all protected data. Never clear user storage or backfill/erase the marker as rollback.

## Risks and mitigations

| Risk | Impact | Mitigation/evidence |
|---|---|---|
| Programmatic preselection becomes false consent | E1 appears unexpectedly | UI-only suggestion sentinel; explicit real ID/link provenance; direct source/canonical assertions |
| One start path still patches snapshot late | Source/canonical divergence or lost marker | Remove both known late patches; closed search/test of Session, Session-to-Deep, UX, direct Deep paths |
| Deep model loads before Ritual dependency | Snapshot helper unavailable in browser | Manifest reorder and model-order test |
| Companion timer rerender replaces focused panel | Focus loss, especially Linux/mobile | Stable subtree and E1-only render; forced rerender/focus browser regression |
| “Resume” accidentally unpauses | Lifecycle mutation | Neutral “Voltar à execução”; tests assert paused remains paused |
| Live Ritual edit changes history | Historical inconsistency | Snapshot-only predicate; edit/delete/merge tests |
| Inline Companion obscures mobile controls | One-hand/accessibility regression | Viewport-safe expansion, stacked controls, drag suppression, zoom/coarse/no-overflow tests |
| v76 rollback strips live marker | Data loss | Forward-compatible rollback retaining widened normalizers |

## Design acceptance gate A–H

| Gate | Answer |
|---|---|
| A. Representation | Direct optional `ritualTemplate.encodingCheckpoint?: true`; absence disabled. |
| B. Deliberate choice | Existing `item.ritualId` gives `linked`; choosing a real ID gives `explicit`; UI-only suggestion sentinel stays `suggested`. Provenance lives in `ritualRuntime` only. |
| C. Eligibility to snapshot | `ritualExecutionSnapshot(surface)` immediately before source construction; source then reaches `executionSyncRegular/Deep`. |
| D. Shared runtime surface | `session-companion-feature.js`, with normal Companion and Deep running-view mounts. |
| E. Transient state | Execution ID, closed/reconstruct/operation stage, one operation, and return-focus origin. No authored data exists, so reload loss is safe. |
| F. Source edited/deleted | Stored source/canonical snapshot remains the sole authority; no live re-resolution. |
| G. No persistent domain | Existing Ritual holds capability, existing snapshot holds history, existing execution holds lifecycle, existing Evidence holds durable result. Nothing else has future decision value. |
| H. State v3 safety | Only optional nested fields in existing record-timestamp collections; serializers/merge already preserve whole records; no store/key/schema migration. |

All gates are unambiguous and PASS.

## Explicit non-goals

- persisted checkpoint responses, stages, operations, history, counts, timers, completion, analytics, scores, confidence, mastery, progress, or streaks;
- automatic interruptions, timer thresholds, notifications, suggestions that activate E1, or `futureUse` mappings;
- PACER persistence, Ladder state, GRINDE UI, mind-map editor, graph mutation, or Theory Overload intervention;
- mandatory or automatic Evidence, Notes, Capture, learningSignals, Active Recall, Weakness/Error Notebook, wikilinks, Relations, or routes;
- Retrieval R2, Active Recall redesign, broad Session/Deep redesign, new execution mode, generic capability/plugin framework;
- new state version, migration, collection, backend, framework, cloud database, AI, external service, account, telemetry, or Service Worker architecture change.

## Remaining unresolved questions

None blocking Build. Product wording, provenance, snapshot point, runtime owner, focus lifecycle, state compatibility, cache generation, manifests, tests, and rollback are closed. Physical installed-PWA update observation and remote Linux CI are release evidence to collect after an exact checkpoint exists; they do not alter this Design.

## Revision history

| Revision | Date | Change | Downstream impact |
|---|---|---|---|
| 1.0 | `2026-08-16` | Initial repository-grounded Design for Encoding E1 | Defines the closed Build/test/docs manifest and marks Define Complete (Designed) |
| 1.1 | `2026-08-16` | Build completed inside the closed manifest with canonical validation PASS | Marks Define and Design Complete (Built); product and acceptance contracts unchanged |

## Recommended next skill

`$sdd-ship .sdd/reports/encoding-e1/BUILD_REPORT.md`
