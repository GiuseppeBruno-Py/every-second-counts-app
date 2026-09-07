# Local Data Safety — Truthful Notes Autosave and Safe JSON Restore

**Initiative:** Reliability and local-data protection

**Delivery candidate:** Truthful Notes autosave and safe full-state JSON restore

**Status:** **Complete (Defined)**

**Date:** 2026-08-18

**Baseline:** `origin/main` at `03f58900e2610e661b2aaf09209f54d1b019795b`

**Selected direction:** **B — a small persistence-contract improvement plus focused Notes and restore orchestration**

**Phase boundary:** Product discovery is complete and the approved direction is defined in `.sdd/features/local-data-safety/DEFINE.md`. This artifact does not authorize product-code or test changes, a schema/state-version change, a PWA generation change, commit, push, PR, merge, deployment, or publication.

## 1. Final problem statement

Compasso promises that personal data remains useful and recoverable locally, including offline. Two current flows violate the truthful-success part of that contract:

1. Notes changes the status to `Salvo agora` immediately after starting `CompassoStorage.save(...)`, without awaiting or checking durable persistence.
2. Full-state JSON restore assigns the imported candidate to `state.data` before the candidate has been adequately validated, explicitly confirmed, or durably persisted.

The problem is not the absence of storage infrastructure. Compasso already has IndexedDB as the primary store, a bounded `localStorage` mirror/fallback, an in-memory copy, per-key write queues, whole-state JSON backup, and tolerant normalization. The remaining gap is that UI and destructive replacement flows do not consistently distinguish an attempted write from a confirmed durable write.

The smallest coherent delivery is therefore:

> Make local save success mean that at least one supported durable browser backend confirmed the exact serialized candidate; let Notes expose that truth without losing the editable draft; and let JSON restore validate and persist an isolated candidate before promoting it to active application state.

## 2. Current-state diagnosis from inspected code

The repository root contains a CodeGraph index for a stale local checkout. It was consulted first as required, then treated only as orientation. An isolated clean worktree at the exact current `origin/main` checkpoint has no `.codegraph/`, so current source, tests, documentation, and SDD archives are authoritative for this diagnosis.

| Concern | Current implementation evidence | Consequence |
| --- | --- | --- |
| Notes autosave | `index.html` `renderNotes()` mutates the active note, sets `Salvando…`, schedules a 450 ms callback, calls `CompassoStorage.save(...)` without awaiting it, then unconditionally sets `Salvo agora`. | A rejected write can be reported as saved. An older completion can also announce success after newer edits exist. |
| Other direct Note writes | Linked-note creation and folder movement also call storage without checking the result; folder movement announces `Nota movida` immediately. | The focused Notes boundary contains more than the text debounce and must be inventoried in Define, without expanding into a global save rewrite. |
| General save coordinator | `saveData()` normalizes/renders, awaits `CompassoStorage.save(...)`, returns a boolean, and shows failure when the result is false. Drive sync wraps it to add `_sync` metadata. | Candidate-based flows can already await success, but full restore cannot safely use the wrapper without first assigning the candidate to global `state.data`. |
| Storage serialization | `CompassoStorage.save()` serializes synchronously, updates its in-memory map, queues an IndexedDB write, and may write a `localStorage` mirror. | Serialization failure is detected, but the returned value does not express all durable outcomes. |
| IndexedDB | `writeStateRecord()` uses one read/write transaction for the `appState` record and storage metadata, resolving only on transaction completion. | A successful primary write is already a durable confirmation; no new global transaction system is needed. |
| Fallback | Small states are mirrored to `localStorage`; when IndexedDB is unavailable, fallback permits a larger mirror. Quota failures are caught. | A successful fallback is durable even when IndexedDB fails, but the current return value can still be false. |
| Memory-only degradation | Failed IndexedDB writes set `persistenceMode` to `memory-fallback`; `save()` has already updated the in-memory map. | Memory-only state must never be called saved. Restore failure also needs to re-establish the previous storage-visible snapshot, not only leave `state.data` unchanged. |
| Write ordering | `writeQueues` serializes writes per storage key in invocation order. Each call serializes its value before entering the queue. | An older IndexedDB write should not land after a newer queued write, but UI status still needs an edit revision/generation guard. |
| Restore | The import handler parses JSON, checks only truthiness of `reading`, `study`, and `goal`, fills missing Notes defaults, assigns `state.data`, then calls `saveData()` without awaiting it. | Non-array core fields can pass, cancellation is absent, validation is too weak, and failed persistence can leave active/in-memory views inconsistent. |
| Normalization | `normalizeData()` mutates and returns the candidate object; it accepts a plain root and contains envelope-selection logic, normalizes core collections, and retains unrelated top-level keys. Feature models add further tolerant migrations. | Restore can normalize a clone in isolation, but Define must specify the supported pipeline and legacy shapes rather than duplicate a strict schema validator. |
| Backup compatibility | Browser tests cover current round-trip, a legacy root backup, root field `untouched`, Learning Outcomes, Signals, Notes/vault/Relations canaries, captures, and distillation. | Current and legacy success paths are protected; malformed, cancelled, and persistence-rejected full restore are not currently covered. |
| State/PWA contracts | `app-manifest.js` declares `compasso.state.v3` and `compasso-pages-v77`. Storage docs keep JSON format unchanged and identify IndexedDB as primary. | No state-version or backup-format change is justified. Any later cached runtime change follows the normal forward PWA-generation process during delivery, not during Brainstorm. |

## 3. Exact failure modes

### 3.1 Notes

1. **False success:** the 450 ms callback changes the label to `Salvo agora` before the returned promise settles.
2. **Rejected persistence hidden:** serialization, IndexedDB, or complete durable-storage failure does not reach the Notes status.
3. **Fallback misclassified:** an IndexedDB failure can return false even when `localStorage` successfully persisted the same serialized state.
4. **Status race:** save A can settle after edit B has occurred and make B appear saved even though B is pending or later fails.
5. **Detached status:** re-rendering or navigating between notes can detach the status element while a write is pending; reopening currently defaults to `Salvo` without consulting pending/failed runtime status.
6. **Related premature success:** moving a Note announces success without durable confirmation.

### 3.2 JSON restore

1. **Weak structural gate:** truthy non-array `reading`, `study`, or `goal` values pass and are later normalized to empty arrays, enabling destructive data loss from a malformed file.
2. **Mutation before consent:** selecting a file immediately replaces the current in-memory state; there is no explicit destructive confirmation.
3. **Mutation before durable commit:** `state.data` is promoted before the save result exists.
4. **Unobserved rejection:** the async `saveData()` result is not awaited, so the import path can neither roll back nor give precise failure feedback.
5. **Storage-memory divergence:** `CompassoStorage.save()` updates its memory map before its durable result; on total failure, merely retaining the old `state.data` is insufficient unless the previous storage-visible snapshot is restored.
6. **Normalization side effects:** calling mutating normalizers on the parsed object is safe only when the object is a detached clone, never the active state.
7. **Over-validation risk:** replacing current tolerant migration with an exact current-schema validator would reject valid legacy or partial exports and strip forward-compatible fields.

## 4. Existing storage guarantees

A confirmed durable save should mean:

> The exact serialized candidate was successfully written to at least one supported durable local backend before success was exposed to the caller.

Applied to the current architecture:

- IndexedDB transaction completion is confirmed durable success, regardless of whether the optional small `localStorage` mirror succeeds.
- If IndexedDB is unavailable or its write fails, successful `localStorage` fallback is confirmed durable success.
- Serialization failure, IndexedDB failure plus fallback failure, or memory-only retention is not durable success.
- The backend used is diagnostic information; Notes and restore need the durable yes/no result, not a storage-technology choice.
- Writes for the application state remain whole-state and ordered by the existing per-key queue.
- A successful imported candidate is already committed under the same application-state key before `state.data` is promoted.
- A failed imported candidate must leave the previous active state and the previous storage-visible snapshot intact, even if the attempted save temporarily touched the storage layer's memory cache.

The current boolean returned by `save()` is close but insufficient because it currently represents the IndexedDB result rather than the union of supported durable results.

## 5. Viable directions considered

### A — UI-only changes using the existing storage contract

**Mechanism:** await the existing boolean in Notes and restore; show saved only when it is true; clone and validate the restore candidate before assignment.

**Advantages**

- smallest source change;
- no public storage API change;
- existing tests that stub `save()` remain simple.

**Why it is insufficient**

- a successful `localStorage` fallback can still produce false, so the UI would report a durable save as failed;
- restore cannot distinguish memory-only state from a valid fallback;
- it does not fully satisfy the repository's documented fallback guarantee.

**Decision:** Rejected as the final direction. Its UI patterns remain useful after the contract is corrected.

### B — Small persistence-contract improvement and focused flow orchestration

**Mechanism:** make the storage result explicitly mean durable success across IndexedDB and fallback, while retaining a backward-compatible caller shape; use that result in Notes and in an isolated restore candidate flow.

**Notes behavior:** debounce edits, await persistence, guard status by the latest edit revision, keep the editor usable, and expose a keyboard/touch retry after failure.

**Restore behavior:** parse and structurally validate a detached candidate, run existing tolerant normalization/migration on that candidate, request explicit destructive confirmation, durably save it, then and only then assign it to `state.data` and render success. If persistence fails, restore the previous storage-visible snapshot and keep the current state active.

**Advantages**

- truthful in both primary and fallback modes;
- reuses the existing single-key transaction and write queue;
- no schema, backup envelope, or global architecture change;
- benefits existing boolean-based callers if the boolean semantics are corrected compatibly;
- directly covers all verified failure modes.

**Costs and constraints**

- Define/Design must freeze the exact backward-compatible result contract and forced-failure test seams;
- restore preparation must account for current normalizers and Drive sync metadata without temporarily replacing global state;
- Note status requires an ephemeral revision/pending state, but no persisted field.

**Decision:** Selected.

### C — Larger transactional persistence refactor

**Mechanism:** introduce a new persistence coordinator, staged records or versioned commit protocol, and migrate all save callers to transactional candidates.

**Potential advantage:** one generalized commit/rollback abstraction for every feature.

**Why it is not justified**

- the application state is already one serialized record;
- IndexedDB already commits the state and metadata in one transaction;
- `localStorage.setItem` replaces one key atomically;
- the queue already orders writes;
- recent Session, Today, and Weekly Review flows already demonstrate local candidate/rollback patterns without a new subsystem;
- the verified problem is limited to truthful result reporting and two focused flows.

**Decision:** Rejected by YAGNI unless Define uncovers a concrete storage invariant impossible to meet with Direction B.

## 6. Recommended smallest direction

Proceed with Direction B, bounded as follows:

1. Correct or add a backward-compatible storage result whose success means IndexedDB **or** fallback durably stored the serialized candidate; memory-only is failure.
2. Make Notes status driven by the latest edit revision and the awaited durable result, with an explicit retry path and no editor lock.
3. Build JSON restore as an isolated candidate pipeline: parse → validate supported shape → clone/normalize/migrate → confirm replacement → durable save → promote/render.
4. On restore failure, keep the prior `state.data`, prior UI, and prior storage-visible snapshot; show a focused retryable error.
5. Add focused storage and browser coverage for failure, fallback success, races, legacy/current backups, unknown-field canaries, cancellation, reload/offline survival, mobile, keyboard, and announcements.

Do not generalize this into a global persistence rewrite or migrate every feature save call.

## 7. Notes autosave — before and after

### Before

```text
Edit title/tags/body
→ mutate active Note
→ show “Salvando…”
→ after debounce, start save without awaiting
→ immediately show “Salvo agora”
```

### After

```text
Edit title/tags/body
→ keep latest text editable in the active Note/editor
→ mark latest revision “Alterações não salvas”
→ after debounce, mark that revision “Salvando…”
→ await confirmed durable result
   → success + still latest revision: “Salvo agora”
   → failure + still latest revision: “Não salvo” + retry action
   → any older completion: do not overwrite the latest revision's status
```

Expected status semantics:

| State | Meaning | Interaction |
| --- | --- | --- |
| Unsaved/debouncing | The editor contains a revision not yet durably attempted. | Editing remains available. |
| Saving | The latest identified revision has a durable write in progress. | Editing remains available; a new edit creates a newer revision. |
| Saved | The displayed latest revision is confirmed in IndexedDB or durable fallback. | No action required. |
| Failed/unsaved | The latest revision is still editable but is not confirmed durable. | A visible, focused-as-needed retry control is available. |

No mastery state, note history, cloud draft, editor blocking, or mandatory manual save is introduced.

## 8. JSON restore — before and after

### Before

```text
Choose file
→ parse
→ truthiness-check three fields
→ mutate defaults on import object
→ replace state.data
→ start save without awaiting
```

### After

```text
Choose file
→ parse into detached value
→ validate supported current/legacy structure
→ clone and run tolerant normalization/migration in isolation
→ present explicit destructive-replacement confirmation
   → cancel: clear file input; change nothing
→ persist exact normalized candidate and await durable confirmation
   → failure: retain/reassert previous active and storage-visible state; show error
   → success: promote candidate to state.data; render; announce completion
```

Validation should reject malformed structure before any state mutation while continuing to accept documented current exports and tested legacy backups. It should use existing normalization/migration boundaries rather than require every current optional collection or strip unrecognized compatible keys.

## 9. Persistence and rollback contract

### Notes

- The editor's latest text remains the retry source after failure.
- A failed write does not produce `Salvo`, a success toast, or a stale success announcement.
- A successful fallback is treated as saved because it survives reopening under the documented fallback path.
- Revision identity, pending promises, and failure status are ephemeral UI state and do not change `compasso.state.v3`.

### Restore

- Capture a deep previous-state snapshot and its serialized storage-visible value before attempting the candidate.
- Validation and normalization operate only on a detached candidate.
- Explicit confirmation occurs after validation and before persistence.
- Promotion to global `state.data`, rendering, success toast, and any success event occur only after durable success.
- If persistence returns failure or throws, keep the previous `state.data` object graph active and re-establish the previous serialized value in the storage layer's memory/fallback view as required by the final storage contract.
- Rollback failure must not be disguised as success; the UI should retain the old active state and communicate that the imported backup was not applied.
- No new database, object store, storage key, two-phase journal, or schema version is introduced.

## 10. Legacy, backup, and unknown-field compatibility

The delivery must preserve:

- the current plain whole-state JSON export shape;
- current PWA v77 backups;
- tested legacy root backups containing core `reading`, `study`, and `goal` arrays and older/missing optional collections;
- defaulting for missing `folders`/`notes` where that compatibility is already intentional;
- existing tolerant model migrations for Learning Outcomes, Signals, Journal, Sessions, Evidence, Rituals, and other registered collections;
- root-level unknown compatible fields such as the existing `untouched` canary;
- model-supported additive fields preserved by their current normalizers;
- Notes content, tags, folders, wikilinks, Relations/graph derivation inputs, and Markdown/vault import/export compatibility;
- the Journal export choice that may intentionally omit Journal collections;
- current backup privacy warning and offline behavior.

The delivery must not claim that every malformed unknown record survives. Existing canonical normalizers remain authoritative and may reject invalid records or remove unsupported fields. Define should identify concrete canaries rather than promise unrestricted forward-schema acceptance.

## 11. Accessibility, mobile, offline, and privacy impact

- Notes save status should be a polite, atomic status announcement. Repeated keystrokes must not produce noisy announcements; transition announcements should correspond to meaningful state changes.
- Failure must be conveyed with text, not color alone.
- Retry must be a semantic button reachable by keyboard, visible at 200% zoom, and usable with touch at the supported small viewport.
- Autosave must not disable the textarea, steal focus, move the caret, or block typing during slow storage.
- Restore confirmation must be keyboard-operable, identify that local data will be replaced, keep Cancel safe, and restore focus predictably.
- Invalid-file and persistence-failure messages should use existing accessible status/error patterns and must not close the recovery path prematurely.
- All validation, normalization, saving, retry, and restore behavior remains local and works offline; no network call, account, telemetry, or external processing is added.
- Backup contents and the existing privacy warning remain unchanged.

## 12. Explicit non-goals

- global persistence rewrite or migration of all save callers;
- new `compasso.state` version, IndexedDB version, object store, or backup envelope;
- cloud backup, backend, account, sync redesign, or new integration;
- encryption, compression, telemetry, or analytics;
- Atlas/Notes redesign, note version history, conflict editor, or cross-device draft recovery;
- mandatory manual-save workflow or editor lock;
- Service Worker architecture redesign;
- new learning, Encoding, Retrieval, AI, Kindle, or calendar functionality;
- automatic repair of arbitrary corrupt backups;
- treating optional `localStorage` mirror failure as total failure when IndexedDB succeeded;
- treating memory-only retention as durable success.

## 13. Risks and race conditions

| Risk | Failure mode | Required mitigation boundary |
| --- | --- | --- |
| Older Notes completion | Save A reports success after edit/save B exists. | Monotonic edit revision; only the latest revision may change current status. |
| Older failure after newer success | Save A failure overwrites B's confirmed success. | Completion handlers compare captured revision before rendering. |
| Re-render/navigation | Pending state element is detached and reopening defaults to false `Salvo`. | Keep minimal ephemeral per-note status or define a safe render rule; do not persist it. |
| Slow storage | Editor is blocked or caret moves. | Never disable/re-render the editor solely for save progress. |
| IndexedDB failure with mirror success | Durable fallback is shown as failure. | Storage result is the union of durable backends. |
| IndexedDB success with mirror failure | Valid primary save is shown as failure. | Primary success remains sufficient. |
| Total storage failure | Memory-only candidate is shown as saved. | Explicit false durable result and visible retry. |
| Restore candidate touches global state | Current data changes before confirmation or persistence. | Clone and normalize off-state; no temporary global assignment. |
| Restore save touches storage memory then fails | `state.data` is old but storage-visible memory contains candidate. | Reassert previous serialized state on failure or provide staging semantics in the small contract. |
| Over-validation | Valid legacy/partial backup is rejected. | Validate a minimum supported shape, then delegate to tolerant migrations. |
| Under-validation | Truthy invalid fields normalize to empty collections and wipe data. | Require structurally valid core collections for the selected supported shape. |
| Unknown-field loss | Restore reconstructs an allow-listed object. | Normalize the cloned candidate in place/through spread-preserving model boundaries and test canaries. |
| Drive metadata side effects | Current `saveData` wrapper mutates global `_sync` state during candidate preparation. | Define a candidate-safe preparation path; do not assign global state to invoke the wrapper. |
| Rollback write also fails | Previous durable storage cannot be rewritten during an outage. | Do not promote candidate; keep old active state; ensure the failed attempt did not replace the last durable record; report retryable failure. |

## 14. Acceptance outline

1. **Forced Notes total persistence failure:** after an edit and settled save attempt, Notes never shows `Salvo`; the latest text remains editable; failure and retry are visible and accessible.
2. **Notes retry:** after storage becomes available, retry persists the latest revision and only then shows saved.
3. **Notes race:** overlapping writes cannot let an older success or failure overwrite the latest revision's status; the newest confirmed value survives reload.
4. **Primary success:** IndexedDB success counts as saved even if the optional mirror fails.
5. **Fallback success:** IndexedDB unavailable/failing plus successful `localStorage` fallback counts as saved and survives reopen/offline.
6. **Memory-only failure:** failure of all durable backends returns failure and never produces success UI.
7. **Malformed backup:** invalid JSON, non-object root, or invalid required core collection shape changes neither active nor stored state.
8. **Cancelled restore:** declining destructive replacement changes neither active nor stored state and leaves focus in a predictable place.
9. **Failed restore persistence:** a valid candidate whose durable save fails leaves the previous state exactly active and reloadable, with no success announcement.
10. **Valid current backup:** full current export restores and survives reload/offline.
11. **Valid legacy backup:** the existing legacy fixture and older missing optional collections restore through tolerant defaults without destructive migration.
12. **Unknown compatible fields:** root and selected model-supported canaries survive restore.
13. **Protected data:** Notes/vault/wikilinks, Relations inputs, Learning Outcomes, Signals, Sessions, Evidence, Reviews, Rituals, Journal choice, and existing backup semantics remain compatible.
14. **Accessibility/mobile:** statuses are announced politely, failure is non-color-only, retry/confirm/cancel are keyboard and touch operable, focus is managed, and no horizontal overflow appears at the supported mobile width or 200% zoom.
15. **Offline/PWA:** save, retry, import, confirmation, persistence, reload, and reopen do not require network access.
16. **Contracts:** `compasso.state.v3`, backup JSON shape, IndexedDB schema, and storage keys remain unchanged.

## 15. Open questions for Define

These questions do not block the selected direction; Define must turn them into exact requirements:

1. Should `CompassoStorage.save()` retain a boolean and redefine `true` as “any durable backend succeeded,” or should an additive detailed operation expose `{ durable, backend }` while preserving the legacy boolean method? The smallest compatible contract is preferred.
2. How should a forced storage failure be injected consistently when tests currently replace only `CompassoStorage.save` with `async () => false`?
3. Does the supported legacy JSON set include the envelope shape already recognized by `normalizeData()`, or is that logic for another ingestion path? Repository fixtures should decide.
4. What minimum structural fields identify a Compasso full-state backup without requiring every optional collection?
5. Which candidate migration sequence is canonical at restore time: core `normalizeData`, State Foundation migration, Journal migration, feature normalizers, and sync metadata preparation, and in what order?
6. How should sync metadata be prepared for an isolated candidate without using the current global-state `saveData` wrapper?
7. Should Notes keep pending/failed status per note across internal navigation/re-render, or is the open editor the only guaranteed retry surface?
8. What exact Portuguese status copy and retry label best distinguish “not yet saved,” “saving,” “saved,” and “failed” without excessive screen-reader chatter?
9. Is retry manual only after failure, or may a subsequent edit schedule another automatic attempt while the explicit retry remains available?
10. Must leaving/reloading with a failed Note save trigger a warning, or is that a separate product decision outside this smallest delivery?
11. Should moving/creating/deleting/duplicating Notes adopt the same confirmed-result UI in this delivery, and which of those paths are required to avoid a contradictory Notes contract?
12. What exact previous serialized snapshot must be restored if candidate persistence fails after the storage memory cache was updated?
13. How should a successful fallback be communicated diagnostically, if at all, without alarming the user or exposing implementation jargon?

## 16. Readiness for Define

The Brainstorm is ready for `$sdd-define` because:

- the failure is reproduced directly in current source rather than inferred from a learning taxonomy;
- the user-visible decision is clear: whether data is durably saved and whether destructive restore may replace current data;
- Direction A is disproven by the existing fallback result mismatch;
- Direction C is unnecessary because whole-state transactional persistence and ordered writes already exist;
- Direction B has a bounded product outcome, compatibility boundary, failure semantics, and acceptance outline;
- remaining questions concern precise requirements and interface contracts, not competing product directions.

**Brainstorm result:** **Complete (Defined) — Direction B is specified in `.sdd/features/local-data-safety/DEFINE.md`.**
