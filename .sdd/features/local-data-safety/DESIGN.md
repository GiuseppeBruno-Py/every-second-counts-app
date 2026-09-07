# DESIGN: Local Data Safety — Truthful Notes Autosave and Safe JSON Restore

## Metadata

| Field | Value |
|---|---|
| Feature slug | `local-data-safety` |
| Date | `2026-08-18` |
| Revision | `1.1` |
| Status | **Complete (Built)** |
| Normative contract | `.sdd/features/local-data-safety/DEFINE.md` |
| Supporting rationale | `.sdd/features/local-data-safety/BRAINSTORM.md` |
| Repository baseline | `origin/main@03f58900e2610e661b2aaf09209f54d1b019795b` |
| Current state contract | `compasso.state.v3` — unchanged |
| Current PWA generation | `compasso-pages-v77` |
| Required Build generation | `compasso-pages-v78` |

## Design status

**PASS — Complete (Built) — Ready for `$sdd-ship`.**

The 16 requirements, 19 acceptance scenarios, and 17 boundary/error scenarios have a closed implementation path. The design changes no data schema, collection, object store, storage key, framework, or remote behavior. It strengthens the existing whole-state persistence boundary, adds revision-aware ephemeral Notes status, and makes JSON restore an exclusive persist-before-promote operation with compensating rollback.

## Current implementation evidence inspected

The isolated worktree is clean except for the untracked Local Data Safety SDD artifacts and is based exactly on `origin/main@03f5890`. `.codegraph/` is absent in this authoritative worktree, so current source, tests, documentation, manifest, and CI are the evidence source.

| Area | Current evidence | Design consequence |
|---|---|---|
| Storage | `storage.js` keeps an in-memory `Map`, serializes per-key IndexedDB writes through `writeQueues`, and writes the optional local mirror outside that queue. `save()` currently returns only the IndexedDB outcome. | Put the entire primary/fallback attempt inside the existing per-key queue. Preserve `Promise<boolean>` and ordered writes. |
| Fallback | `mirrorLocally()` catches localStorage errors. `ready()` can recover from a local value when IndexedDB is absent or older. | An IndexedDB failure must attempt exact-candidate localStorage inside the same queued operation. A successful fallback is durable success. |
| Notes | `index.html` mutates the active Note immediately, shows `Salvando`, starts a 450 ms debounce, calls `saveData()` without awaiting it, then shows `Salvo agora`. | Add an ephemeral per-note revision record and await the boolean result. Never rerender the editor to communicate status. |
| JSON import | The current file handler parses, checks the three core arrays, assigns `state.data`, and calls `saveData()` without awaiting persistence. | Replace it with detached preparation, accessible confirmation, exclusive replacement, and post-persistence promotion. |
| Normalization | `normalizeData()` preserves unrelated root fields while normalizing core and newer collections. Feature/model startup migrations complete current defaults and canonicalization. | Run those same current normalizers against a clone, never against global `state.data`. Keep root-shape validation intentionally narrow. |
| Sync metadata | `drive-sync-feature.js` can prepare sync metadata but its existing helper also mutates the global Drive baseline. | Split candidate preparation from baseline activation. Preparation must have no global or network side effect. |
| Accessibility | Native dialogs and the design-system focus manager already provide focus containment/return. Current import is a hidden file input inside a label, and Notes exposes only plain status text. | Use a real button for file selection, a native confirmation dialog, a polite atomic status, and a semantic retry button. |
| PWA | `app-manifest.js` owns `compasso-pages-v77`; `service-worker.js` consumes the manifest. | Build advances only the manifest generation to `compasso-pages-v78`; no Service Worker architecture change. |
| Tests/CI | Node tests cover storage quota/manifest. Browser suites cover backup canaries, offline PWA, keyboard, mobile, and zoom patterns. PR CI runs `npm run test:all` on Ubuntu/Chromium. | Add deterministic storage seams and one focused browser suite; update existing import flows for the new confirmation step. |

## Architecture and data flow

### Durable save flow

```text
caller candidate
    │ JSON.stringify (failure => false, no backend attempt)
    ▼
CompassoStorage.save(key, value)
    │ reject with false if restore owns key; do not mutate memory
    │ otherwise update memory cache and enqueue exact serialized value
    ▼
per-key write queue — one complete durable attempt at a time
    ├─ IndexedDB transaction commits
    │    ├─ optional bounded local mirror succeeds or fails
    │    └─ result true regardless of mirror outcome
    └─ IndexedDB unavailable/fails
         ├─ exact localStorage fallback succeeds → true
         └─ fallback fails → false; memory-only retention is not success
```

The fallback belongs inside the queued task. This is required to prevent an older IndexedDB failure from writing its fallback after a newer candidate has already completed.

### Notes autosave flow

```text
input event → mutate current in-memory Note → revision + 1 → unsaved
       │ 450 ms debounce, editor remains active
       ▼
capture { noteId, revision, restoreEpoch } → saving → await saveData()
       ├─ same revision/epoch and true  → saved
       ├─ same revision/epoch and false → failed + retry
       └─ stale revision/epoch          → no visible state change
```

### Restore flow

```text
file bytes
  → detached parse
  → supported root-object/core-array validation
  → detached canonical normalization/migration
  → detached sync metadata preparation
  → destructive confirmation dialog
  → pause Notes timers + acquire storage replacement barrier
  → drain preceding writes
  → capture memory/IndexedDB/localStorage checkpoint
  → persist candidate through normal union semantics
  → activate candidate in state.data and render once
  → release barrier and announce success
```

On a pre-commit failure, activation never runs. On a post-commit activation failure, the storage checkpoint and previous active state are restored before an ordinary failure is reported.

## Storage design

### Public contracts

| API | Contract |
|---|---|
| `CompassoStorage.save(key, value): Promise<boolean>` | Unchanged public shape. Resolves `true` only when the serialized candidate commits to IndexedDB or exact localStorage fallback. Serialization failure, barrier rejection, and memory-only retention resolve `false`. |
| `CompassoStorage.flush(key?): Promise<void>` | Existing behavior retained; it observes the expanded whole-attempt queue. |
| `CompassoStorage.replace(key, value, activate): Promise<boolean>` | New bounded restore primitive. Exclusively replaces one existing key, persists before calling `activate`, and compensates the captured storage checkpoint if candidate persistence or activation fails. It adds no store/key/schema. |

`replace()` is intentionally not a general transaction framework. Its only Build caller is JSON restore for the existing application-state key.

### Backend-result aggregation

Introduce small storage-local helpers with these responsibilities:

| Helper | Responsibility |
|---|---|
| `persistSerialized(key, serialized)` | Run primary-first persistence and return one boolean union result. It is invoked only from a per-key queued task. |
| `writeLocalValue(key, serialized, options)` | Attempt local mirror/fallback with explicit `enforceMirrorLimit` and `preservePreviousOnFailure` behavior. |
| `removeLocalValue(key)` | Remove a stale mirror after primary success when the candidate is too large or mirror writing failed. Failure to clean an inaccessible mirror does not negate a committed IndexedDB transaction. |
| `enqueueWrite(key, task)` | Preserve the current promise chain, but queue a task closure rather than only an IndexedDB record write. Normal-save errors resolve that task as `false` without breaking later queue entries. |
| `enqueueReplacement(key, task)` | Append the exclusive restore task to the same per-key chain and expose its result/error while retaining a settled tail for later `flush()`/writes. It calls `persistSerialized()` directly inside its queue entry and never recursively queues itself. |

Aggregation rules are fixed:

| IndexedDB | localStorage | Result | Mode |
|---|---|---:|---|
| Commit | Success or failure/not attempted | `true` | `indexeddb` |
| Failure/unavailable | Exact candidate written | `true` | `localstorage-fallback` |
| Failure/unavailable | Failure/unavailable | `false` | `memory-fallback` |

On primary success, the bounded mirror is attempted after the IndexedDB commit in the same queue entry. If it fails, stale local content is removed when possible so `ready()` cannot prefer an older mirror. On primary failure, fallback writing does not delete a previously recoverable local value if the new candidate write fails.

### Serialization and memory

- `JSON.stringify` occurs before memory mutation or queueing. A thrown serialization error resolves `false`.
- Normal `save()` retains its current immediate memory-cache update after successful serialization so the active app remains responsive.
- If both durable backends fail, that memory value remains available for normal use, but the result is `false` and callers must not claim durability.
- While `replace()` owns a key, new normal `save()` calls for that key resolve `false` before changing the storage memory cache. Other keys remain unaffected.

### Exclusive replacement and checkpoint

`replace()` uses a `replacementLocks` map keyed by storage key:

1. Claim the key synchronously before awaiting any existing work. A second replacement resolves `false` without mutation.
2. Append one replacement task to the existing per-key queue. This makes every pre-barrier write settle first, exposes replacement work to `flush()`, and blocks later ordinary saves at the lock.
3. Inside that queue entry, capture a checkpoint with presence plus value for:
   - memory cache;
   - IndexedDB state record;
   - localStorage entry.
4. Serialize the candidate and place its memory value only after the checkpoint exists.
5. Persist it directly through `persistSerialized()` inside the same queue entry while retaining the lock; do not enqueue a nested write.
6. If the result is `false`, restore all touched layers to the checkpoint, verify every readable layer, then release the lock and resolve `false`.
7. If persistence is `true`, call `await activate(candidate)` while retaining the lock.
8. If activation succeeds, release the lock and resolve `true`.
9. If activation throws, restore/verify the checkpoint, then release and resolve `false`.

Checkpoint restore uses the same exact prior serialized values; it does not normalize them again. IndexedDB restoration uses one `put` or `delete` transaction, localStorage restoration uses `setItem` or `removeItem`, and memory restoration reinstates the prior presence/value.

If compensation cannot re-establish and verify a previous durable source, `replace()` throws an error with `code = "storage-rollback-failed"`, retains the replacement lock, and does not report an ordinary completed failure. The UI presents a recovery-blocked state and keeps the previous active `state.data`; Build must not silently unlock into a mixed durable state.

## Notes autosave implementation

### Ephemeral state representation

Add one runtime object in `index.html`; it is never persisted or exported:

```js
const noteSaveRuntime = {
  epoch: 0,
  byId: new Map()
};

// per note
{
  revision: 0,
  confirmedRevision: 0,
  status: "saved", // saved | unsaved | saving | failed
  timerId: null,
  epoch: 0
}
```

The currently loaded durable Note begins as `saved`. Title, tags, and body share one Note revision because the persistence unit remains whole application state. A Note surface rerender or revisit reads the same runtime entry; it must not manufacture `saved`.

### Transition rules

| Event | From | To | Side effect |
|---|---|---|---|
| Edit title/tags/body | Any | `unsaved` | Mutate current in-memory Note, increment revision, reset one 450 ms timer. |
| Debounce fires | `unsaved` | `saving` | Capture `noteId`, `revision`, and `epoch`; await `saveData()`. |
| Current completion `true` | `saving` | `saved` | Set `confirmedRevision` to captured revision. Optional file-tree refresh occurs after status change without replacing editor inputs. |
| Current completion `false`/throws | `saving` | `failed` | Keep latest in-memory fields, expose retry. |
| Edit while saving | `saving` | `unsaved` | Create a newer revision and timer; older completion becomes stale. |
| Retry | `failed` or `unsaved` | `saving` | Cancel debounce and save the latest revision immediately. |
| Stale completion | Any | unchanged | No text, status, focus, timer, or announcement change. |

Completion is current only when note ID, captured revision, and captured epoch still match the runtime entry. This guards both ordinary overlap and restore invalidation.

### Exact DOM and messages

`renderNotes()` renders this feedback group adjacent to the editor controls:

```html
<div class="note-save-feedback" data-state="saved">
  <span id="noteSaveState" role="status" aria-live="polite" aria-atomic="true">Salvo</span>
  <button id="noteSaveRetry" type="button" hidden>Tentar novamente</button>
</div>
```

Exact visible states:

| State | Status text | Retry |
|---|---|---|
| `saved` | `Salvo` | Hidden |
| `unsaved` | `Alterações não salvas` | Hidden |
| `saving` | `Salvando…` | Hidden |
| `failed` | `Não foi possível salvar` | Visible |

Editor fields use `aria-describedby="noteSaveState"`. The status node is updated only when the semantic state changes, not for every keystroke; user Note content is never included in announcements. Retry uses native keyboard/pointer activation. Status changes do not focus, disable, replace, or rerender title/tags/body, preserving caret and composition input.

### Restore interaction

At restore confirmation, `pauseNoteAutosavesForRestore()` clears pending debounce timers, snapshots each entry, and increments the epoch. Already queued persistence is drained by `replace()`. On successful restore, the old map is discarded and the imported Notes start from a new `saved` runtime baseline. On ordinary restore failure/cancellation after confirmation, the snapshot is restored: `unsaved` entries receive one new debounce, `failed` entries remain explicitly retryable, and stale promises from the prior epoch cannot update status.

## Detached candidate preparation

### Structural validation

`isSupportedBackupRoot(value)` accepts only a non-array object whose root properties `reading`, `study`, and `goal` are arrays. It rejects primitives, arrays, nested `{ data: ... }` envelopes, and non-array core collections. It does not require optional newer collections and does not introduce an allow-list.

Malformed JSON is reported as `Arquivo JSON inválido.`; a parsed but unsupported shape is reported as `Backup do Compasso inválido.` Both failures occur before confirmation, storage access, or global mutation.

### Pure normalization path

`prepareRestoreCandidate(raw)` performs these operations against a `structuredClone`/JSON-safe clone only:

1. `normalizeData(clone)` for current core, Notes/folders, capture, learning-outcome, and learning-signal rules while preserving compatible unknown root fields.
2. `CompassoStateFoundation.migrate(candidate)` for the current state-foundation contract.
3. Normalize/default `ritualTemplates` with `CompassoRitualModel` exactly as current boot does.
4. Set `executionSessions = CompassoExecutionSessionModel.migrate(candidate)` to preserve canonical Session/Deep Work provenance.
5. Normalize/default `weeklyPlans` with `CompassoWeeklyPlanModel` exactly as current boot does.
6. Run `CompassoCaptureModel.migrateState(candidate)` and `CompassoJournalModel.migrateState(candidate)` for their existing tolerant current forms.
7. Pass the result to `CompassoDriveSync.prepareLocalState(candidate)`.

No step reads or writes global `state.data`. Canonical model behavior remains authoritative for invalid optional records; the restore layer does not reconstruct a strict allow-listed object or infer missing learner data.

### Pure sync preparation

Refactor the existing sync helper in `drive-sync-feature.js` into two explicit local-only operations:

| Contract | Behavior |
|---|---|
| `CompassoDriveSync.prepareLocalState(input)` | Clone/prepare sync metadata on the supplied candidate, calculate the future baseline, and return `{ data, baseline }`. It does not mutate `state.data`, current Drive baseline, connection state, or network. |
| `CompassoDriveSync.activateLocalState(prepared)` | Install only the already calculated local baseline after `state.data = prepared.data` has been promoted. It performs no network request. |

The existing `ensureSyncMetadata`/normal save and explicit Drive sync behaviors remain as compatibility adapters over the same internal pure metadata function. A restore must never invoke upload, download, authorization, or conflict resolution.

## Restore UI, promotion, and rollback

### Import trigger and confirmation

Replace the non-focusable label interaction with a semantic `#importBtn` button that activates the existing hidden `#importInput`. Add a static native `<dialog id="restoreDialog">` containing:

- heading `Substituir dados locais?`;
- a concise destructive warning that current local data will be replaced;
- `#restoreStatus` with `role="status"`, `aria-live="polite"`, and `aria-atomic="true"`;
- secondary `Cancelar` button;
- primary destructive `Substituir dados` button.

The dialog opens only after detached preparation succeeds. Initial focus goes to `Cancelar`, the safe choice. Before persistence, Cancel, Escape, and pointer cancellation discard the candidate, reset the file input, close the dialog, and return focus to `#importBtn`. During the exclusive replacement both controls are disabled and native cancel is prevented. A second file selection is ignored while an operation owns the dialog.

### Runtime coordinator

`index.html` owns an ephemeral `restoreRuntime`:

```js
{
  operationId: 0,
  prepared: null,
  busy: false,
  returnFocus: null
}
```

The confirm handler captures `previousState = state.data`, pauses Note timers, then invokes:

```js
CompassoStorage.replace(STORAGE_KEY, prepared.data, async persistedCandidate => {
  state.data = persistedCandidate;
  try {
    CompassoDriveSync.activateLocalState(prepared);
    resetNoteSaveRuntime();
    renderAll();
  } catch (error) {
    state.data = previousState;
    renderAll();
    throw error;
  }
});
```

The callback cannot run before durable success. It renders exactly once on success. A successful result closes the dialog, resets file/runtime state, restores focus to `#importBtn`, and announces `Backup restaurado.` once.

If candidate persistence returns `false`, the candidate was not activated; the current page remains on `previousState`. The dialog stays open, displays `Não foi possível restaurar. Seus dados atuais foram preservados.`, changes the primary action to `Tentar novamente`, re-enables controls, and focuses the status/error target without duplicating announcements.

If activation throws, the callback first reinstates and rerenders `previousState`; storage then compensates its checkpoint. Only after both are restored does the same ordinary failure UI appear. A `storage-rollback-failed` error instead displays `A recuperação local não pôde ser confirmada. Mantenha esta tela aberta e tente novamente.` and leaves the dialog/barrier locked; it never claims that rollback or restore succeeded.

## Race-condition handling and invariants

1. **FIFO durability:** the full primary/fallback cycle is one queue entry; no older fallback can land after a newer write.
2. **Revision ownership:** only the current Note revision and epoch can change its status.
3. **Persist before promote:** storage calls restore activation only after at least one durable backend commits the exact candidate.
4. **One restore owner:** a synchronous per-key lock prevents two restores and rejects late ordinary saves without memory mutation.
5. **Pre-barrier drain:** writes already queued before restore complete before checkpoint capture.
6. **Timer invalidation:** pending Note timers are paused and their old epochs are invalidated before replacement.
7. **Rollback before failure:** a post-commit failure is ordinary only after previous active and durable recovery are re-established.
8. **Evidence preservation:** checkpoint values are restored byte-for-byte; rollback does not re-normalize them.
9. **No remote side effect:** preparation and activation are local-only regardless of Drive connection or network state.
10. **No false success:** toast and Notes `saved` copy are downstream of `true`, never of an attempted write.

## Accessibility, mobile, and offline behavior

- All actions are semantic buttons with visible `:focus-visible` styling inherited from the design system.
- Native dialog focus trapping/return is reused; safe cancellation is the initial focus.
- Notes status and restore status use polite, atomic live regions. They announce state meaning without Note content and without per-keystroke churn.
- Saving does not disable the editor or move selection/caret.
- Failure meaning is conveyed by text and retry control, never color alone.
- `.note-save-feedback` wraps at 360–390 px; retry meets the existing coarse-pointer minimum target.
- Restore actions stack when necessary and remain visible at 200% zoom without fixed dimensions or global horizontal overflow.
- Parse, validation, normalization, save, rollback, status, and retry require no network. Existing cached shell and local backends remain sufficient offline.

## Closed implementation manifest

Build may modify or create only these paths. SDD phase artifacts are listed separately from the product implementation unit.

### Product and documentation files

| # | Exact path | Action | Function-level change | Depends on | Coverage |
|---:|---|---|---|---|---|
| 1 | `storage.js` | Modify | Queue the full backend attempt; add boolean aggregation, replacement locks, checkpoint capture/restore/verification, and `replace()`. Preserve `save()` signature and existing DB/store/key. | None | R-001–R-003, R-011–R-012; AT-01–AT-03, AT-05, AT-11–AT-12; ER-01–ER-04, ER-13–ER-16 |
| 2 | `drive-sync-feature.js` | Modify | Split pure candidate metadata preparation from post-promotion baseline activation; preserve explicit Drive behavior. | Existing sync helpers | R-009, R-013, R-016; AT-13; ER-11, ER-17 |
| 3 | `index.html` | Modify | Implement Note runtime/state transitions/retry; detached restore preparation; semantic import trigger/dialog; barrier orchestration; promotion and active-state rollback. | Paths 1–2 | R-004–R-015; AT-01–AT-19; ER-05–ER-17 |
| 4 | `design-system.css` | Modify | Add durable Notes feedback and restore dialog responsive/focus/error presentation. | Path 3 hooks | R-007, R-010, R-015; AT-16–AT-19 |
| 5 | `app-manifest.js` | Modify | Advance only cache generation from `compasso-pages-v77` to `compasso-pages-v78`; preserve state contract, assets, module order, and collections. | Paths 1–4 | R-015–R-016; AT-07 |
| 6 | `docs/storage-foundation.md` | Modify | Document exact boolean union semantics, queue ordering, memory-only failure, restore replacement/rollback, and unchanged compatibility. | Final paths 1–3 | R-001–R-003, R-011–R-016 |

### Test files

| # | Exact path | Action | Purpose | Coverage |
|---:|---|---|---|---|
| 7 | `tests/storage-quota.test.js` | Modify | Deterministic fake IndexedDB/localStorage outcomes, delayed write ordering, replacement barrier, partial-touch compensation, activation failure, and rollback-failure seam. | AT-01–AT-03, AT-05, AT-11–AT-12; ER-01–ER-04, ER-13–ER-16 |
| 8 | `tests/app-manifest.test.js` | Modify | Assert `compasso-pages-v78`, unchanged `compasso.state.v3`, and unchanged composition. | R-016; AT-07 |
| 9 | `tests/browser/local-data-safety-flows.spec.js` | Create | Focused Notes/restore success, failure, retry, race, reload/offline, keyboard, mobile, zoom, and live-region coverage with deterministic browser seams. | AT-01–AT-19; ER-05–ER-17 |
| 10 | `tests/browser/learning-outcome-flows.spec.js` | Modify | Add confirmation to current/legacy restore flow while retaining learningOutcome and unknown-field canaries. | AT-13–AT-15; ER-09–ER-10 |
| 11 | `tests/browser/critical-flows.spec.js` | Modify | Add confirmation to existing capture/distillation backup round trip; preserve canonical restore assertions. | AT-13–AT-15 |
| 12 | `tests/browser/capability-context-flows.spec.js` | Modify | Add confirmation to protected Notes/wikilink/vault/signals restore canaries. | AT-13, AT-15 |

### SDD lifecycle files

| # | Exact path | Action | Purpose |
|---:|---|---|---|
| 13 | `.sdd/features/local-data-safety/DEFINE.md` | Modify in Design | Mark the normative contract `Complete (Designed)` after this Design passes. |
| 14 | `.sdd/features/local-data-safety/DESIGN.md` | Create in Design | Record this approved implementation contract. |
| 15 | `.sdd/reports/local-data-safety/BUILD_REPORT.md` | Create in Build | Record implementation, deviations, and validation evidence. |

No other product, test, documentation, manifest, schema, dependency, or generated snapshot path is authorized. If Build evidence requires another path or conflicts with DEFINE, stop and return to `$sdd-design`/`$sdd-iterate` rather than expanding scope silently.

## Dependency-ordered Build plan

1. Implement and unit-test queued backend aggregation and deterministic storage seams in `storage.js`/`tests/storage-quota.test.js`.
2. Add and unit-test the exclusive replacement/checkpoint/compensation path in the same files.
3. Split pure sync preparation/activation in `drive-sync-feature.js` without changing explicit sync behavior.
4. Implement the per-note runtime, state transitions, accessible status, and retry in `index.html`.
5. Implement detached validation/normalization, semantic import trigger/dialog, restore orchestration, promotion, and active rollback in `index.html`.
6. Add responsive/focus/error styles in `design-system.css`.
7. Add the focused browser suite and update the three existing restore flows.
8. Advance `app-manifest.js` and its assertion to `compasso-pages-v78` only after cached behavior changes exist.
9. Update `docs/storage-foundation.md`, run focused checks, then canonical validation, and write the Build Report.

## Deterministic test seams

### Storage-level seams

`tests/storage-quota.test.js` loads `storage.js` in an isolated VM/browser-like context and supplies explicit fake backends. Build extends that established seam with controllable promises and operation logs; no production debug flag is added.

The fake IndexedDB supports transaction completion/failure, delayed completion, record read/put/delete, and failure on checkpoint restore. Fake localStorage supports independent get/set/remove failures and preserves exact strings. This makes primary-only, fallback-only, total failure, stale ordering, partial touch, compensation, and rollback-failure deterministic.

### Browser-level seams

The focused Playwright suite replaces `window.CompassoStorage` before the relevant action with a delegating object whose `save`/`replace` methods can resolve, reject, or remain deferred. Existing real-storage tests remain responsible for reload/offline durability. Test-only globals are injected by Playwright; product code receives no test hook.

## Test manifest and AT/ER mapping

### Requirement traceability

| Requirement | Design realization | Primary files | Acceptance/error evidence |
|---|---|---|---|
| R-001 | Preserve `save(): Promise<boolean>` and make the result durable-only. | `storage.js`, storage tests | AT-01, AT-02, AT-03, AT-06, AT-07, AT-19; ER-01, ER-02 |
| R-002 | Aggregate IndexedDB and exact fallback as a union; memory alone is false. | `storage.js`, storage tests | AT-01, AT-02, AT-03, AT-07, AT-19; ER-02, ER-03, ER-04, ER-13 |
| R-003 | Queue the full attempt and use one exclusive restore barrier. | `storage.js`, `index.html`, focused tests | AT-05, AT-11, AT-12, AT-13; ER-05, ER-15, ER-16 |
| R-004 | Keep the four Notes states in per-note runtime only. | `index.html`, focused browser suite | AT-01–AT-05, AT-19; ER-06, ER-07 |
| R-005 | Gate completions by Note ID, revision, and epoch. | `index.html`, focused browser suite | AT-05, AT-06, AT-19; ER-05, ER-06 |
| R-006 | Keep fields editable and expose explicit latest-revision retry. | `index.html`, `design-system.css` | AT-03, AT-04, AT-16–AT-19; ER-04, ER-07 |
| R-007 | Use semantic, polite, atomic status and keyboard-operable retry. | `index.html`, `design-system.css` | AT-16–AT-19; ER-06 |
| R-008 | Parse and narrowly validate detached root backups before confirmation. | `index.html`, focused browser suite | AT-08, AT-09, AT-11, AT-12; ER-08 |
| R-009 | Clone and run current canonical normalizers plus pure sync preparation. | `index.html`, `drive-sync-feature.js` | AT-11–AT-15; ER-09, ER-10, ER-11 |
| R-010 | Require an explicit native destructive confirmation with safe focus. | `index.html`, `design-system.css` | AT-10, AT-16, AT-19; ER-12 |
| R-011 | Make candidate durability a prerequisite for the activation callback. | `storage.js`, `index.html` | AT-11–AT-14; ER-13, ER-15 |
| R-012 | Restore/verify memory and both durable layers before ordinary failure. | `storage.js`, `index.html`, storage tests | AT-08–AT-12; ER-04, ER-12, ER-14–ER-16 |
| R-013 | Promote, activate sync baseline, and render once after confirmed durability. | `index.html`, `drive-sync-feature.js` | AT-13–AT-15, AT-19; ER-13, ER-17 |
| R-014 | Preserve current/legacy root compatibility and unknown compatible fields. | `index.html`, three existing backup suites | AT-13, AT-14, AT-15; ER-08, ER-09, ER-10 |
| R-015 | Preserve keyboard, 360–390 px, 200% zoom, and offline operation. | `index.html`, `design-system.css`, focused/PWA suites | AT-07, AT-16–AT-19; ER-17 |
| R-016 | Preserve state v3, current stores/keys, local-first behavior, and protected domains. | All closed paths, canonical suite | AT-01–AT-19; ER-17 |

### Acceptance scenarios

| Scenario | Primary automated evidence | Additional evidence |
|---|---|---|
| AT-01 | storage Node primary-success/mirror-failure case; Notes successful autosave | Editor remains enabled and current revision alone becomes saved |
| AT-02 | storage Node fallback-only case | Browser fallback save then reload |
| AT-03 | storage Node total failure; Notes forced failure | No saved copy; text and retry remain |
| AT-04 | Browser failure then keyboard/pointer retry | Latest fields persist after recovery |
| AT-05 | Node delayed queue ordering; browser deferred A/newer B completions | Stale completion cannot affect status or newest durable value |
| AT-06 | Browser confirmed save and reload/reopen | Title, tags, body and initial truthful status |
| AT-07 | Focused offline browser save/reopen plus existing PWA lifecycle suite | No network dependency; v78 shell |
| AT-08 | Browser malformed JSON with active/storage canary | No confirmation or mutation; accessible parse error |
| AT-09 | Browser primitive, array, and invalid core-collection roots | Distinct invalid-backup error; no storage call |
| AT-10 | Browser prepared candidate cancelled by Escape, keyboard, pointer | No write; reset input; deterministic focus return |
| AT-11 | Browser forced replacement false; Node total candidate failure | Candidate never active/visible; retryable restore error |
| AT-12 | Node partial-touch compensation and browser reload canary | Memory and readable durable sources return exact previous state |
| AT-13 | Updated current backup suites plus focused restore/reload/offline | One post-commit render; no Drive request |
| AT-14 | Updated legacy root backup flow | Missing optional collections tolerated through current migrations |
| AT-15 | Learning/capability/critical canary suites | Unknown root, Notes/tags/wikilinks/vault/model canaries survive re-export/reload |
| AT-16 | Focused keyboard browser flow | Semantic retry/confirm/cancel, focus visible and stable |
| AT-17 | Focused mobile projects at 360 and 390 px/coarse pointer | No global overflow; actions readable and tappable |
| AT-18 | Focused Chromium 200% zoom flow | Reflow, focus, status, and dialog actions remain usable |
| AT-19 | Focused live-region assertions | Polite atomic semantic changes, no per-keystroke/content/duplicate success |

### Error and boundary scenarios

| Scenario | Automated evidence |
|---|---|
| ER-01 | Node non-serializable/cyclic candidate: false, zero backend attempts |
| ER-02 | Node IndexedDB commit plus mirror quota failure: true and primary reload |
| ER-03 | Node IndexedDB failure plus large exact fallback success: true and fallback recovery |
| ER-04 | Node both backends fail after memory update: false; Notes/restore failure behavior |
| ER-05 | Browser old success after newer edit/failure has no visible effect |
| ER-06 | Browser Note rerender/revisit preserves unsaved/failed runtime |
| ER-07 | Browser reload after failed Note save loads last confirmed content without saved claim for failed text |
| ER-08 | Browser valid JSON with unsupported root/core shape rejected before dialog/storage |
| ER-09 | Browser legacy backup missing optional collections accepted |
| ER-10 | Existing model-canary tests plus invalid optional record canonicalization |
| ER-11 | Browser spy proves preparation does not mutate active state/baseline or call network |
| ER-12 | Browser cancellation discards prepared runtime and leaves exact canary |
| ER-13 | Node either-backend candidate commit returns true despite peer failure |
| ER-14 | Node activation throw after durable commit restores/verifies checkpoint; browser active-state rollback |
| ER-15 | Node queued write/barrier order and browser paused Note debounce cannot land after restore |
| ER-16 | Node/browser second replacement/selection cannot interleave |
| ER-17 | Browser connected/disconnected/offline variants make zero automatic Drive requests |

### Focused validation commands

```powershell
node --test tests/storage-quota.test.js tests/app-manifest.test.js
npm run build:test
npx playwright test tests/browser/local-data-safety-flows.spec.js tests/browser/learning-outcome-flows.spec.js tests/browser/critical-flows.spec.js tests/browser/capability-context-flows.spec.js --project=chromium
npx playwright test tests/browser/local-data-safety-flows.spec.js --project=mobile
npx playwright test tests/browser/pwa-lifecycle-flows.spec.js --project=chromium
```

### Canonical validation commands

```powershell
npm test
npm run test:browser
npm run test:all
git diff --check
```

The Build Report records exact counts, conditional skips, failures, host limitations, and the final diff. It must not claim installed-PWA human smoke from automated evidence.

## PWA and cache implications

Build changes cached `index.html`, `storage.js`, `drive-sync-feature.js`, and `design-system.css`, so `app-manifest.js` must advance from `compasso-pages-v77` to **`compasso-pages-v78`** in the Build. `compasso.state.v3`, manifest assets, ordered modules, collections, and storage compatibility remain unchanged.

`service-worker.js` is not modified. Existing lifecycle automation must prove controlled update/offline shell behavior. A human same-origin installed-PWA update/reopen/offline smoke from v77 to v78 remains a Ship/release gate, not a Build implementation task.

## Rollback strategy

### Runtime rollback

- Normal Note save failure keeps current text in active memory, marks it failed, and permits retry; reload returns the last confirmed durable state.
- Restore pre-commit failure never changes active state.
- Restore post-commit activation failure reinstates `previousState`, rerenders it, restores exact memory/IndexedDB/local checkpoint values, verifies recovery, and only then reports failure.
- Unverifiable compensation locks further writes to that key and surfaces recovery-blocked status; it never silently proceeds.

### Delivery rollback

The delivery is reversible by reverting the closed manifest paths together. Because state/store/key/schema remain unchanged, no data migration rollback is required. Reverting `app-manifest.js` must be coordinated with the product rollback; a later forward cache generation is preferred operationally to reusing v77 after v78 has been published.

## Risks and mitigations

| Risk | Mitigation/invariant |
|---|---|
| Older fallback overwrites newer candidate | Whole primary/fallback operation is FIFO in the per-key queue. |
| Stale Note completion says saved | Revision plus epoch ownership check. |
| Editor becomes frustrating during slow storage | No field disabling/rerender/focus movement; only status changes. |
| Restore races debounced/queued saves | Pause timers, invalidate epochs, synchronous replacement lock, then queue drain/checkpoint. |
| Candidate becomes visible before durability | Activation callback is unreachable until union persistence returns true. |
| Partial durable candidate remains after failure | Exact checkpoint compensation and verification precede ordinary failure. |
| Rollback itself fails | Typed recovery-blocked state retains lock and avoids a false preservation claim. |
| Valid legacy backup is over-rejected | Validate only root object plus three evidenced core arrays; use current tolerant model migrations. |
| Unknown compatible fields disappear | Clone/spread current normalizers; no restore allow-list; canary round trips. |
| Restore triggers Drive behavior | Pure local prepare/activate split and network spies. |
| Mirror failure causes false total failure | IndexedDB commit is independently sufficient for `true`. |
| Inaccessible stale mirror masks primary later | Attempt stale-mirror cleanup after primary success; keep current primary recovery tests. |
| Cache ships stale product code | Mandatory v78 manifest bump and lifecycle/offline validation. |

## Explicit non-goals

- No schema or `compasso.state.v3` change.
- No new collection, IndexedDB object store, database version, or storage key.
- No global persistence rewrite or generic transaction framework.
- No cloud backup, backend/account, encryption, compression, or telemetry.
- No Notes information-architecture/editor redesign.
- No Atlas, learning, AI, calendar, Kindle, or other integration work.
- No nested `{ data: ... }` backup envelope support.
- No stricter validation of optional legacy collections.
- No automatic Drive sync, conflict resolution, or remote recovery.

## Resolved Design questions

| # | Question | Resolution |
|---:|---|---|
| 1 | Backend-result aggregation | Primary-first union inside `persistSerialized`; either durable backend yields `true`. |
| 2 | Existing queue | Queue the complete primary/mirror/fallback attempt; retain per-key FIFO and `flush`. |
| 3 | Note representation | Ephemeral `Map` entry with revision, confirmed revision, status, timer, and epoch. |
| 4 | DOM/status/retry | Polite atomic text status plus native hidden/visible retry; no editor rerender. |
| 5 | Pure normalization | Clone, narrow root validation, current normalizers/migrations in boot-compatible order. |
| 6 | Pure sync preparation | `prepareLocalState` returns data/baseline; `activateLocalState` commits baseline only post-promotion. |
| 7 | Restore barrier | New bounded `CompassoStorage.replace()` with synchronous per-key lock and queue drain. |
| 8 | Compensation | Exact three-layer checkpoint restore and verification; typed locked error if recovery cannot be confirmed. |
| 9 | Confirmation/focus | Native dialog, initial Cancel focus, disabled during write, predictable return/error focus. |
| 10 | Failure injection | VM fake IDB/localStorage and Playwright method delegation/deferred promises; no production flag. |
| 11 | Files | Closed 12-file product/test/documentation manifest plus 3 SDD lifecycle paths. |
| 12 | PWA bump | Build advances manifest-owned generation exactly once to `compasso-pages-v78`. |

## Remaining unresolved questions

None that blocks Build. Implementation may choose private helper names inside `storage.js`, but the public `save()`, `replace()`, `prepareLocalState()`, `activateLocalState()`, DOM IDs, messages, invariants, and manifest are fixed by this Design. A material contract/path change requires `$sdd-iterate`.

## Design gate

- DEFINE status/clarity: PASS, 15/15.
- Requirements mapped: 16/16.
- Acceptance scenarios mapped: 19/19.
- Boundary/error scenarios mapped: 17/17.
- Product/test/documentation paths closed: yes.
- Persistence/schema migration: none.
- Accessibility/mobile/offline plan: complete.
- Rollback/compensation plan: complete.
- Forward cache generation: `compasso-pages-v78`, Build only.

**Readiness: PASS — Build complete; run `$sdd-ship`.**

## Revision history

| Revision | Date | Change |
|---|---|---|
| 1.0 | 2026-08-18 | Initial repository-grounded Design for truthful Notes durability and exclusive safe JSON restore. |
| 1.1 | 2026-08-29 | Closed manifest implemented and validated; Define and Design advanced to Complete (Built) without changing the normative contract. |
