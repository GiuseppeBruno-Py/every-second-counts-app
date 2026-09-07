# DEFINE: Local Data Safety — Truthful Notes Autosave and Safe JSON Restore

## Metadata

| Field | Value |
|---|---|
| Feature slug | `local-data-safety` |
| Initiative | Reliability and local-data protection |
| Delivery | Truthful Notes autosave and safe full-state JSON restore |
| Date | `2026-08-18` |
| Status | **Shipped** |
| Clarity score | `15/15` |
| Authoritative input | `.sdd/features/local-data-safety/BRAINSTORM.md` |
| Repository baseline | `origin/main` at `03f58900e2610e661b2aaf09209f54d1b019795b` |
| Approved direction | Backward-compatible durable save result, revision-safe Notes autosave, and isolated persist-before-promote JSON restore |

## Problem statement

Compasso is local-first and presents browser persistence as the durable home of the learner's data. Current Notes autosave and full-state JSON restore do not consistently honor that promise:

- Notes shows `Salvo agora` immediately after starting a storage call, before the call confirms durable persistence.
- `CompassoStorage.save()` currently returns only the IndexedDB write result even when the same serialized state was durably accepted by the `localStorage` fallback.
- memory-only retention can contain the latest attempted value but is not durable and must not be presented as saved.
- JSON restore accepts an insufficiently validated object, assigns it to `state.data`, and starts an unobserved save without destructive confirmation or rollback.

The delivery must make save success truthful without replacing the existing persistence architecture. Notes must expose the durability state of the latest edit. Restore must keep the current state active until a detached, compatible candidate is validated, normalized, sync-prepared, confirmed, and durably persisted.

## Target users

| User or context | Need | Observable improvement |
|---|---|---|
| Learner editing an Atlas Note | Know whether the latest title, tags, and body are durably saved | `Salvo` appears only for the latest confirmed revision; failure retains the text and exposes retry |
| Learner working during a storage outage or quota failure | Continue editing without a false guarantee | Editor remains usable and memory-only retention is visibly unsaved |
| Learner using the documented browser fallback | Receive correct success when IndexedDB is unavailable but `localStorage` persisted the state | Save succeeds and survives supported reload/reopen behavior without implementation jargon |
| Learner restoring a JSON backup | Replace current local data only after validation, explicit consent, and confirmed persistence | Cancel or failure leaves the previous state active and recoverable |
| Learner with current, legacy, or partially populated backups | Restore valid data without unnecessary schema rejection or field loss | Tested legacy roots, optional collections, and compatible unknown fields remain supported |
| Keyboard, screen-reader, zoom, mobile, and offline user | Understand and operate save, retry, confirmation, and error recovery | Status is announced politely; controls remain reachable and usable at 360–390 px and 200% zoom without network access |

## Goals

1. Make `CompassoStorage.save()` truthfully report durable success across the existing primary and fallback backends.
2. Give Notes an explicit, latest-revision state machine: `unsaved`, `saving`, `saved`, and `failed`.
3. Make full-state JSON restore validate and prepare a detached candidate before consent or persistence.
4. Persist the candidate before promoting it to active `state.data`.
5. Guarantee that a failed or cancelled restore leaves the previous state active and recoverable from durable storage.
6. Preserve current and evidenced legacy backup compatibility, local-first operation, and `compasso.state.v3`.

## In scope

- caller-observed durability semantics of the existing application-state save operation;
- IndexedDB-primary and `localStorage`-fallback result reconciliation;
- Notes title, tags, and Markdown body autosave status, race handling, and retry;
- transient per-note save status needed to avoid false `saved` after rerender/navigation in the same application lifetime;
- full-state JSON import parsing, supported-shape validation, candidate normalization/migration, sync-metadata preparation, confirmation, persistence, promotion, rendering, and failure recovery;
- coordination barriers needed so earlier Notes/state writes cannot overwrite a successful restore;
- current/legacy JSON compatibility and protected data canaries;
- focused Node and browser validation for storage, Notes, restore, accessibility, responsive, reload, and offline behavior;
- proportional documentation of the clarified persistence and restore contract during a later Build.

## Out of scope

- `compasso.state.v3` change or any new application-state schema version;
- IndexedDB database-version change, new object store, collection, storage key, or backup envelope;
- global persistence coordinator or migration of every save caller;
- transactional hardening of unrelated Note create/delete/duplicate/link/folder operations; if Design proves one is required to satisfy an explicit autosave/restore requirement, return through SDD Iterate before expanding scope;
- persistent unsaved-draft history, note versioning, browser-unload recovery, or cross-device draft recovery;
- Notes/Atlas information-architecture or editor redesign;
- cloud backup, Drive-sync redesign, backend, account, or new integration work;
- encryption, compression, telemetry, analytics, or diagnostics containing user content;
- Service Worker architecture change;
- learning, Encoding, Retrieval, AI, Kindle, or calendar functionality;
- automatic repair of arbitrary corrupt JSON;
- PWA version modification during Define.

## Exact storage success semantics

### Public result contract

For the existing application-state key, the caller-observed contract remains:

```text
CompassoStorage.save(key, value) → Promise<boolean>
```

`true` means the exact serialized candidate was confirmed written to at least one existing durable local backend before the promise resolved. `false` means no durable backend confirmed that serialized candidate. Expected serialization, IndexedDB, and `localStorage` failures must not escape as success; an unexpected rejection is treated by callers as failure.

### Result table

| Serialization | IndexedDB transaction | `localStorage` mirror/fallback | Result | Meaning |
|---|---|---|---|---|
| Fails | Not attempted | Not attempted | `false` | No candidate exists durably |
| Succeeds | Commits | Succeeds or fails/not required | `true` | Primary durable success |
| Succeeds | Unavailable/fails | Writes exact candidate | `true` | Durable fallback success |
| Succeeds | Unavailable/fails | Unavailable/fails/quota rejected | `false` | Memory-only retention is not durable |

Additional rules:

1. Optional mirror failure cannot turn a committed IndexedDB write into failure.
2. A successful fallback cannot be reported as failure merely because IndexedDB was unavailable or rejected the write.
3. A backend counts only after its own successful commit/write signal for the exact serialized candidate.
4. Existing per-key invocation ordering remains authoritative; the last successfully queued candidate is the last durable application state.
5. Backend identity may be available to internal diagnostics, but product success copy depends only on the boolean and must not expose storage jargon.
6. Updating only the storage layer's memory map never satisfies durability.

## Notes autosave state machine

### Canonical transient states

| State | Entry condition | Required presentation | Allowed transitions |
|---|---|---|---|
| `saved` | The displayed latest revision is loaded from a valid durable/bundled baseline or its save resolved `true` while still latest | Saved status; no retry | `unsaved` after any covered edit |
| `unsaved` | Title, tags, or body creates a revision newer than the last confirmed revision | Clearly not yet saved; debounce may run | `saving` when that latest revision starts; remains/re-enters `unsaved` on newer edit |
| `saving` | A persistence attempt for the latest revision is in flight | Saving status; editor remains enabled | `saved` on current-revision `true`; `failed` on current-revision failure; `unsaved` on newer edit |
| `failed` | The latest revision's attempt resolves `false` or rejects | Text states it is not saved and exposes semantic retry | `saving` on retry; `unsaved` on a newer edit |

### Revision rules

1. Every covered edit advances a monotonic transient revision for that Note.
2. Each persistence attempt captures the revision and candidate it is saving.
3. A completion may change the visible state only when its captured revision is still the latest revision for that Note.
4. A completion for an older revision must not mark newer text `saved`, overwrite a newer failure, remove retry, steal focus, or rerender the editor.
5. A new edit during `saving` immediately represents the latest revision as `unsaved`; the older attempt may finish durably but cannot describe the newer editor value.
6. Retry always attempts the latest current title, tags, and body, not a failed historical snapshot.
7. Pending/failed status must not reset to `saved` solely because the Notes surface rerenders or the learner navigates away and back during the same application lifetime.
8. The editor, caret, selection, and focus remain usable and stable in every state.
9. Failed text is guaranteed available for edit/retry while the current application runtime remains open. Persistent failed-draft recovery after reload is outside scope; confirmed saves must survive reload.

## Restore state transition contract

```text
idle
→ reading
→ validating isolated input
→ normalizing/migrating isolated candidate
→ preparing isolated sync metadata
→ awaiting destructive confirmation
   → cancelled → idle with previous state unchanged
→ persisting candidate
   → failed → rollback/reassert previous state → idle with error
→ candidate durably confirmed
→ promote candidate to state.data
→ rerender current application surfaces
→ completed
```

Rules:

1. File reading, parsing, validation, normalization, migration, and sync preparation operate on detached values and must not mutate `state.data`, current sync baseline, current Note runtime, or current durable state.
2. Only one full-state restore may own the transition at a time; overlapping selections cannot interleave candidates.
3. Before candidate persistence, all earlier writes for the application-state key must be settled, cancelled safely, or ordered behind a restore barrier so they cannot land after the candidate.
4. Explicit confirmation occurs after the candidate is validated/prepared and before its first durable write.
5. Candidate persistence uses the exact boolean durability contract above.
6. `state.data` remains the previous active state throughout candidate persistence.
7. Promotion, render, success status/toast, and completion occur only after `true` for the candidate.
8. Any pre-restore Notes completion that arrives later cannot overwrite restored data or announce a stale Notes status.
9. Successful restore is local-only and must not automatically upload, merge, or contact Drive or another service.

## Restore rollback contract

The restore operation captures the previous active state and previous serialized application-state value before attempting the candidate. A restore reported as failed must end with:

- previous `state.data` active and deep-equivalent to its pre-restore value;
- previous UI still representing that state;
- storage memory cache resolving to the previous serialized value;
- IndexedDB containing the previous valid state, not the candidate;
- `localStorage` mirror/fallback containing the previous valid value or retaining its valid pre-restore absence according to the established size policy;
- no success toast/status/event for the candidate.

Exact partial-touch rules:

| Candidate effect | Restore classification and required end state |
|---|---|
| Only storage memory cache was updated | Failure; reassert the previous serialized value in memory before returning |
| IndexedDB transaction aborted/rejected | No IndexedDB candidate commit exists; previous IndexedDB record remains |
| `localStorage.setItem` threw/rejected | No fallback success exists; previous valid value/absence must remain or be re-established |
| IndexedDB committed candidate | Durable success exists; storage result must be `true`, even if mirror failed |
| `localStorage` wrote candidate while IndexedDB failed | Durable success exists; storage result must be `true` and candidate may be promoted |
| A later restore step fails after any durable candidate commit | The restore is not allowed to report failure until the candidate has been replaced by the previous value in every durable backend that accepted it and previous recovery is confirmed |

Therefore, “candidate durably committed but `false` returned” is an invalid storage implementation. If no durable backend committed, rollback must not depend on a failing new durable write; the previous durable record should still be present. Design must provide a bounded staging/compensation mechanism that satisfies these outcomes without a global persistence refactor.

## Supported backup and compatibility rules

### Supported full-state JSON shape

Repository export and browser fixtures establish one supported envelope:

- a JSON object at the document root;
- root properties `reading`, `study`, and `goal` are arrays, including empty arrays;
- `folders` and `notes` may be absent and receive the existing compatible defaults;
- other current registered collections may be present or absent and remain subject to their existing tolerant normalizers/migrations;
- root unknown compatible fields are retained, as demonstrated by the existing `untouched` canary.

A nested `{ data: { ... } }` object is recognized inside `normalizeData()` for another tolerant input path but is not emitted by current JSON export and is not covered by restore fixtures. It is not added to the full-state JSON restore contract by this delivery. Supporting it later requires repository evidence or an explicit SDD change.

### Compatibility rules

1. Invalid JSON, arrays/primitives at the document root, or non-array core `reading`/`study`/`goal` properties are rejected before confirmation.
2. Validation does not require every current optional collection and does not rebuild the state from a strict allow-list.
3. Existing canonical normalizers remain authoritative for malformed optional records and model-owned fields.
4. Unknown compatible means a field that the current normalization pipeline already preserves; it does not promise preservation of fields intentionally canonicalized away by a model.
5. Current Notes content, tags, folders, metadata, wikilinks, and Markdown/vault inputs remain intact.
6. Journal data remains intact when present; a current export that intentionally omits Journal data remains structurally valid and restores with current compatible defaults.
7. `learningOutcomes`, `learningSignals`, Sessions, Deep Work, canonical execution history, Evidence, Reviews, Rituals, captures, distillation, and protected canaries remain governed by their current normalizers and ownership.
8. No import step invents links, IDs, tombstones, signals, or fields absent from the current migration rules.
9. JSON export shape and privacy warning remain unchanged.

## Measurable requirements

### R-001 — Backward-compatible durable result

**Priority:** MUST

The existing `CompassoStorage.save(key, value)` caller contract remains `Promise<boolean>`. It resolves `true` only after at least one supported durable backend confirms the exact serialized candidate and resolves `false` when neither does. Existing truthy/false caller checks require no object-result migration.

**Acceptance evidence:** AT-01 through AT-03, AT-06, AT-07.

### R-002 — Primary/fallback union semantics

**Priority:** MUST

IndexedDB commit is sufficient even if the optional mirror fails; successful `localStorage` fallback is sufficient when IndexedDB fails; memory-only retention is always failure. Expected storage/quota/serialization errors create no silent success.

**Acceptance evidence:** AT-01 through AT-03, AT-07, AT-19.

### R-003 — Ordered writes and restore barrier

**Priority:** MUST

Existing per-key order remains intact. Restore establishes a boundary under which no earlier debounce, in-flight Note save, or state write can durably overwrite a successfully restored candidate or publish stale success afterward.

**Acceptance evidence:** AT-05, AT-11 through AT-13.

### R-004 — Four-state Notes autosave

**Priority:** MUST

Title, tags, and body autosave expose exactly the semantic states `unsaved`, `saving`, `saved`, and `failed` according to the state table. `saved` is reachable only from a `true` result for the latest revision.

**Acceptance evidence:** AT-01 through AT-05, AT-19.

### R-005 — Revision-safe Notes completion

**Priority:** MUST

Each covered edit advances revision identity. Older completions cannot describe, overwrite, or clear the status/retry of a newer revision, including after rerender or internal navigation.

**Acceptance evidence:** AT-05, AT-06, AT-19.

### R-006 — Editable failure and explicit retry

**Priority:** MUST

Slow or failed persistence never disables the editor. Latest text, caret, and focus remain intact in the active runtime. Failure exposes an explicit semantic retry that saves the latest revision and reaches `saved` only on confirmed durability.

**Acceptance evidence:** AT-03, AT-04, AT-16 through AT-19.

### R-007 — Accessible Notes status

**Priority:** MUST

Save-state changes use concise Portuguese text, are programmatically available through a polite atomic status, avoid per-keystroke announcement noise, and communicate failure without color alone. Retry is keyboard and touch operable.

**Acceptance evidence:** AT-16 through AT-19.

### R-008 — Isolated parse and structural validation

**Priority:** MUST

JSON restore reads/parses into a detached value and validates the supported root/core-array shape before confirmation, persistence, global mutation, or success messaging. Invalid input leaves active and durable state unchanged.

**Acceptance evidence:** AT-08, AT-09, AT-11, AT-12.

### R-009 — Isolated canonical preparation

**Priority:** MUST

A structurally supported candidate is cloned and passed through the current compatible normalization/migration boundaries plus required sync-metadata preparation without mutating `state.data`, the current sync baseline, or current records.

**Acceptance evidence:** AT-11 through AT-15.

### R-010 — Explicit destructive confirmation

**Priority:** MUST

After validation/preparation and before persistence, restore explicitly tells the learner that current local data will be replaced and offers confirm/cancel. Cancel changes no active, transient, or durable product data and returns focus predictably.

**Acceptance evidence:** AT-10, AT-16, AT-19.

### R-011 — Persist before promote

**Priority:** MUST

The prepared candidate is persisted and awaited while previous `state.data` remains active. Only a `true` durable result permits candidate promotion, render, and success announcement.

**Acceptance evidence:** AT-11 through AT-14.

### R-012 — Complete restore rollback

**Priority:** MUST

Cancel, validation failure, preparation failure, persistence failure, or any failed post-persistence transition leaves/re-establishes the previous state across active memory, storage memory cache, IndexedDB, and `localStorage` according to the rollback table. No partial candidate remains visible or durable.

**Acceptance evidence:** AT-08 through AT-12.

### R-013 — Successful restore activation

**Priority:** MUST

After confirmed candidate durability, the same prepared candidate becomes `state.data`, current surfaces rerender through existing application behavior, success is announced once, and the restored data survives reload/reopen without an automatic remote effect.

**Acceptance evidence:** AT-13 through AT-15, AT-19.

### R-014 — Current, legacy, and protected-data compatibility

**Priority:** MUST

Current exports, the evidenced legacy root fixture, missing optional collections already supported, root unknown compatible fields, and protected Notes/knowledge/learning/execution/reflection data survive the canonical restore pipeline without a stricter invented schema.

**Acceptance evidence:** AT-13 through AT-15.

### R-015 — Accessibility, responsive, and offline operation

**Priority:** MUST

Notes status/retry and restore validation/confirmation/error/success remain fully operable by keyboard and touch, understandable to assistive technology, free of global horizontal overflow at 360–390 px and 200% zoom, and functional with network disabled.

**Acceptance evidence:** AT-07, AT-16 through AT-19.

### R-016 — Existing contracts and scope preservation

**Priority:** MUST

The delivery preserves `compasso.state.v3`, current JSON shape, IndexedDB schema, storage key, Service Worker architecture, privacy, local-first ownership, and unrelated product behavior. It adds no collection, backend, dependency, telemetry, cloud effect, learning concept, or global persistence rewrite.

**Acceptance evidence:** AT-01 through AT-19.

## Business rules

| ID | Rule | Rationale |
|---|---|---|
| BR-001 | “Saved” means at least one durable local backend confirmed the exact latest candidate. | Makes UI success truthful. |
| BR-002 | IndexedDB is primary; `localStorage` is a valid fallback, not a required duplicate when primary succeeds. | Preserves current documented architecture. |
| BR-003 | Memory-only retention is useful for continued editing but never durable success. | Separates availability from durability. |
| BR-004 | Notes status belongs to the latest Note revision, not to the latest promise that happened to settle. | Prevents stale-completion lies. |
| BR-005 | Retry saves the current latest text. | Avoids restoring an obsolete failed snapshot. |
| BR-006 | Restore candidate preparation never uses temporary global-state replacement. | Keeps failure/cancel non-destructive. |
| BR-007 | Destructive confirmation follows validation and precedes persistence. | Avoids asking consent for invalid files or writing before consent. |
| BR-008 | Any durable candidate commit is storage success; a failed restore may not leave that candidate committed. | Makes rollback semantics internally consistent. |
| BR-009 | Current tolerant normalizers define compatibility after the minimum core shape gate. | Avoids strict-schema data loss and unsupported widening. |
| BR-010 | Restore is local-only; it does not imply Drive synchronization or upload. | Preserves privacy and explicit integration boundaries. |

## Acceptance scenarios

| ID | Given | When | Then | Covers |
|---|---|---|---|---|
| AT-01 | IndexedDB is available and the optional `localStorage` mirror may succeed or fail | The latest Note revision is autosaved and the IndexedDB transaction completes | `save()` resolves `true`; only that latest revision becomes `saved`; the editor remains usable | R-001, R-002, R-004, R-006, R-016 |
| AT-02 | IndexedDB is unavailable or its candidate write fails and `localStorage` accepts the exact serialized state | Notes saves the latest revision | `save()` resolves `true`, Notes becomes `saved`, and the fallback value is the value recovered by the supported reopen path | R-001, R-002, R-004, R-016 |
| AT-03 | Serialization or both durable backends fail while the Note exists in active memory | Autosave settles | `save()` is false/failure; Notes is `failed`, never says saved, keeps the latest text editable, and shows retry | R-001, R-002, R-004, R-006, R-007 |
| AT-04 | Notes is `failed` with latest text still present and durable storage later becomes available | The learner activates retry by keyboard or pointer | The same latest revision enters `saving`; on `true` it becomes `saved` and persists; on failure it returns to `failed` without text loss | R-004, R-006, R-007, R-015 |
| AT-05 | Save A is in flight and edit B creates a newer revision, with completions resolving in any timing | A and the later attempt settle | A cannot mark B saved or overwrite B's state; only a successful latest-revision result may show saved, and the newest confirmed candidate is last durable | R-003 through R-006 |
| AT-06 | A latest Note revision reached `saved` through confirmed durability | The page reloads or the application reopens normally | The same title, tags, and body reload and the initial status does not claim an unconfirmed newer revision | R-001, R-005, R-013 |
| AT-07 | The supported application shell is available with network disabled and a durable local backend is writable | The learner edits, autosaves, and reopens the Note offline | The confirmed latest revision survives and no network request is required for status, save, retry, or load | R-001, R-002, R-015, R-016 |
| AT-08 | Current active/durable state contains a canary and the selected file is malformed JSON | Restore reads the file | Parsing fails before confirmation; active state, storage memory, IndexedDB, and fallback retain the canary; an accessible invalid-file error appears | R-008, R-012, R-015 |
| AT-09 | Current state contains a canary and parsed JSON has a primitive/array root or non-array `reading`, `study`, or `goal` | Restore validates the candidate | Validation rejects before confirmation/persistence; no current data changes and the error distinguishes invalid backup | R-008, R-012, R-014 |
| AT-10 | A valid candidate has been prepared and current local data exists | The destructive confirmation appears and the learner cancels by keyboard, Escape-supported dialog behavior, or pointer | No candidate write/promotion occurs, current state remains exact, the input resets safely, and focus returns predictably | R-010, R-012, R-015 |
| AT-11 | A valid isolated candidate is confirmed but neither durable backend can persist it | Restore attempts persistence | The candidate is never promoted or shown; previous UI/state remains active; error/retry guidance appears; no success is announced | R-003, R-008, R-009, R-011, R-012 |
| AT-12 | Candidate persistence touched storage memory or a backend attempt before the restore failed | Failure handling completes and the app reloads | Active state and every readable durable source resolve to the exact previous canary state; no imported field remains visible or durable | R-003, R-008, R-011, R-012 |
| AT-13 | A current export contains Notes, Journal, learning data, Sessions/Evidence, Reviews, Rituals, captures, and sync metadata | The learner validates, confirms, and durably restores it | The prepared candidate is promoted only after `true`, renders once through current behavior, survives reload/offline, and triggers no automatic remote effect | R-003, R-009, R-011, R-013, R-014 |
| AT-14 | The evidenced legacy root backup contains array `reading`/`study`/`goal`, optional/missing newer collections, Notes/folders as available, and no current-only fields | The learner confirms restore | Existing tolerant defaults/migrations produce a valid current state without rejecting the file, inventing data, or requiring a schema change | R-009, R-011, R-013, R-014 |
| AT-15 | A supported backup contains root `untouched` plus protected Notes content/tags/wikilinks and model-supported additive canaries | The candidate is normalized, persisted, promoted, exported again, and reloaded | Compatible unknown/protected canaries remain intact while intentionally canonical model rules remain authoritative | R-009, R-013, R-014, R-016 |
| AT-16 | The learner uses only keyboard with Notes or restore | They edit, wait, retry, open confirmation, cancel/confirm, and recover from an error | All actions use semantic controls and native activation; focus is visible, deterministic, and never stolen by autosave | R-006, R-007, R-010, R-015 |
| AT-17 | Viewport width is 360–390 px with coarse pointer | The learner edits a Note, observes/retries failure, and completes/cancels restore confirmation | Status and controls remain readable/tappable with no global horizontal overflow or obscured primary action | R-006, R-007, R-010, R-015 |
| AT-18 | The application is displayed at 200% zoom | Notes status/retry and restore confirmation/error are used | Content reflows without global horizontal overflow; focus and all actions remain visible and operable | R-006, R-007, R-010, R-015 |
| AT-19 | A screen reader or status observer is active | Notes transitions among the four states or restore reports invalid/cancelled/failed/success | Meaningful transitions are announced politely and atomically without per-keystroke noise, false success, color-only meaning, duplicate success, or user-content disclosure | R-001, R-002, R-004, R-007, R-010, R-013, R-015 |

## Error and boundary scenarios

| ID | Condition | Required behavior | Covers |
|---|---|---|---|
| ER-01 | `JSON.stringify` fails | `save()` resolves/behaves as false; no backend attempt or success UI | R-001, R-002 |
| ER-02 | IndexedDB commits while the optional mirror throws quota | Overall result is true; primary state is authoritative; mirror failure is not shown as total failure | R-001, R-002 |
| ER-03 | IndexedDB fails and fallback accepts the candidate, including fallback-mode size handling | Overall result is true; fallback survives supported recovery | R-001, R-002 |
| ER-04 | Both durable backends fail after memory cache receives the candidate | Overall result is false; Notes remains retryable; restore reasserts previous storage-visible memory | R-002, R-006, R-012 |
| ER-05 | Older Note success arrives after newer edit/failure | Older completion has no visible effect on the newer state | R-003, R-005 |
| ER-06 | Note surface rerenders or is revisited while latest revision is pending/failed | It does not reset to `saved`; latest text/status/retry remain coherent in the active runtime | R-004 through R-007 |
| ER-07 | Reload occurs after a failed unconfirmed Note save | No claim is made that failed text is durable; last confirmed state reloads | R-001, R-004, R-006 |
| ER-08 | Restore root is valid JSON but not a supported root object/core-array shape | Reject without confirmation or mutation | R-008, R-014 |
| ER-09 | An optional collection is missing | Apply current tolerant default/migration; do not reject solely for absence | R-009, R-014 |
| ER-10 | A canonical normalizer rejects/drops an invalid optional record | Isolate the effect according to that existing model; do not reconstruct a strict allow-listed state or mutate current state during preparation | R-009, R-014 |
| ER-11 | Sync metadata preparation would mutate global state/baseline | Candidate preparation must use an isolated path; global mutation before commit is prohibited | R-009, R-011 |
| ER-12 | Restore is cancelled after preparation | Discard candidate/runtime operation state; current active/durable data remains exact | R-010, R-012 |
| ER-13 | Candidate commits to either durable backend | Storage result is true; it cannot be classified as failed because the other backend failed | R-001, R-002, R-011, R-012 |
| ER-14 | A later restore step fails after candidate commit | Compensate every durable candidate copy and re-confirm previous recovery before reporting failure; never leave mixed old/imported durable sources | R-012, R-013 |
| ER-15 | A Note/state write predating restore is still debounced or queued | Restore ordering prevents it from landing after the committed candidate or changing post-restore status | R-003, R-005, R-011, R-012 |
| ER-16 | A second restore selection occurs while one restore is active | It cannot interleave persistence/promotion; only one candidate owns the operation and the other is ignored or safely deferred | R-003, R-008, R-011, R-012 |
| ER-17 | Network is absent or Drive is connected/disconnected | Local restore behavior is identical and produces no automatic remote request | R-013, R-015, R-016 |

## Accessibility, mobile, and offline requirements

- Notes status has a programmatic polite/atomic status relationship; copy must distinguish not yet saved, saving, saved, and failed.
- Keystrokes do not each enqueue a spoken announcement; only meaningful state transitions are announced.
- Failure and retry remain visible without relying on toast duration, color, icon, hover, or pointer.
- Retry is a semantic button with a meaningful accessible name and current design-system touch target.
- Autosave never disables inputs, steals focus, resets selection/caret, or rerenders the textarea solely to show progress.
- Restore confirmation names the destructive replacement, has explicit confirm/cancel actions, supports existing dialog keyboard/Escape behavior where applicable, and returns focus to the import control or stable equivalent.
- Invalid and persistence errors are programmatically exposed, concise, non-color-only, and contain no imported/user content.
- At 360–390 px and 200% zoom, status, retry, confirmation, and error actions reflow without global horizontal overflow or hidden controls.
- All feature behavior, tests, and recovery paths work after the app shell is available offline and require no new permission or network request.

## Constraints, assumptions, and dependencies

| ID | Type | Statement | Design consequence or invalidation condition |
|---|---|---|---|
| C-001 | State | `compasso.state.v3`, current storage key, IndexedDB schema, and JSON root shape remain unchanged. | No migration/store/key/envelope work is permitted. |
| C-002 | API | Existing callers consume a promised boolean from `CompassoStorage.save`. | Design preserves `Promise<boolean>` and corrects its semantics rather than returning an object. |
| C-003 | Persistence | One whole-state record and per-key queue already exist. | Design reuses them; a global transaction coordinator is prohibited. |
| C-004 | Compatibility | Current export and tested legacy fixture use a root object with array `reading`/`study`/`goal`. | This is the minimum supported restore shape; optional collections remain tolerant. |
| C-005 | Sync | Existing sync metadata preparation mutates its argument and current baseline; `saveData` wraps global state. | Design must extract/reuse a candidate-safe preparation path without adding integration behavior. |
| C-006 | Notes | Current title/tags/body inputs mutate the active Note before debounce. | Failed text can remain in current runtime; revision state is ephemeral and per Note. |
| C-007 | Accessibility | Current design-system and native status/dialog patterns are available. | Design must reuse them rather than create a UI framework or runtime styles. |
| C-008 | PWA | `storage.js` and `index.html` are cached shell assets under manifest generation `compasso-pages-v77`. | Define does not bump it; Design must specify the next forward generation if Build changes cached assets, with unchanged Service Worker architecture. |
| A-001 | Assumption | A boolean can be computed from primary and fallback outcomes without changing database schema. | If false, return through SDD Iterate; do not start a global rewrite. |
| A-002 | Assumption | Current normalizers can be applied to a detached candidate without needing active-state assignment. | If any model requires global mutation, Design must isolate the minimal adapter or report a blocker. |
| A-003 | Assumption | Pending state writes can be drained/cancelled/ordered around restore using the existing queue boundary. | If not, Design must return through Iterate before adding a new coordinator. |
| A-004 | Assumption | Assignment and current rerender after validated durable commit are deterministic under supported data. | Any fallible post-commit step requires explicit compensation satisfying R-012. |
| A-005 | Assumption | Failed Note text need only survive in the current open application runtime; confirmed text must survive reload/reopen. | Persistent drafts or unload warnings require separate scope approval. |

## Repository evidence inspected

- `AGENTS.md` for local-first, compatibility, accessibility, SDD, testing, and publication boundaries.
- `.sdd/features/local-data-safety/BRAINSTORM.md` as the approved direction and problem evidence.
- `index.html` for `loadData`, `saveData`, `normalizeData`, Notes rendering/autosave, JSON export, and JSON import.
- `storage.js` for IndexedDB transaction completion, memory cache, bounded mirror/fallback, quota handling, per-key queue, boolean result, load, flush, and diagnostics.
- `state-foundation.js` for v3 collection normalization, unknown top-level handling, merge, conflicts, and tombstones.
- `drive-sync-feature.js` for argument/global sync metadata mutation, baseline capture, `saveData` wrapping, and remote sync boundary.
- `journal-model.js` / `journal-feature.js` for tolerant Journal migration and the export option that can omit Journal collections.
- `learning-outcome-model.js` and `capability-context-model.js` for current model-owned normalization and Signals preservation behavior.
- `app-manifest.js` for `compasso-pages-v77`, `compasso.state.v3`, collection catalog, cached assets, and module order.
- `docs/storage-foundation.md`, `docs/markdown-vault-io.md`, `docs/journaling-feature.md`, `docs/sessions-feature.md`, and `README.md` for primary/fallback, backup, vault, legacy, local-first, and offline contracts.
- `tests/storage-quota.test.js` for current quota/memory behavior and storage ownership.
- `tests/browser/learning-outcome-flows.spec.js` for current JSON round-trip, the legacy root fixture, root `untouched`, and forced persistence failure precedent.
- `tests/browser/critical-flows.spec.js` for capture/distillation JSON round-trip and mobile conventions.
- `tests/browser/capability-context-flows.spec.js` for Signals, Notes/vault/Relations canaries, keyboard, mobile, and 200% zoom conventions.
- Recent Session/Today/Weekly Review source and SDD archives for candidate persistence and rollback precedent.

No `.codegraph/` directory exists in the isolated authoritative worktree. The stale index in the unrelated original checkout was not used as current source; direct source and tests are authoritative.

## Clarity score

| Dimension | Score | Explicit evidence |
|---|---:|---|
| Problem | 3/3 | Current source directly demonstrates false Notes success, fallback-result mismatch, and restore mutation before persistence. |
| Users | 3/3 | Note editor, outage/fallback user, backup restorer, legacy-data user, and accessibility/mobile/offline contexts have observable needs. |
| Goals | 3/3 | Durable boolean semantics, four-state autosave, isolated restore sequence, rollback, and protected compatibility are explicit and prioritized. |
| Success | 3/3 | Nineteen Given/When/Then scenarios cover every requested primary, fallback, failure, retry, race, restore, compatibility, responsive, offline, and accessibility outcome. |
| Scope | 3/3 | Direction B is bounded against schema, global rewrite, cloud, backend, integrations, Notes redesign, and learning features. |
| **Total** | **15/15** | **Ready for Design** |

## Design questions

No product-direction decision remains. Design must resolve these implementation details without weakening the requirements:

1. The smallest internal result aggregation that preserves public `Promise<boolean>` while capturing both IndexedDB and mirror/fallback outcomes for the exact serialized value.
2. How to preserve queue ordering when mirror outcome is synchronous and IndexedDB completion is asynchronous, including large fallback values and quota exceptions.
3. The minimal ephemeral per-note revision/status representation and lifecycle across render, navigation, retry, and restore invalidation.
4. The exact status markup, Portuguese copy, announcement throttling, retry placement, focus behavior, and durable CSS owner.
5. The pure candidate preparation boundary and exact order for core normalization, State Foundation, feature migrations, Journal migration, and sync metadata without changing global baseline.
6. The restore persistence barrier for debounce timers, queued writes, storage memory, and overlapping restore attempts.
7. The bounded staging/compensation API that guarantees the rollback table if storage memory was touched or a later step fails after a durable candidate commit.
8. The smallest accessible destructive-confirmation pattern and focus-return path using current design-system conventions.
9. Exact Node/browser fixtures for deterministic IndexedDB success, mirror-only success, total failure, reordered completions, rollback backend inspection, current/legacy/unknown canaries, offline, 360–390 px, 200% zoom, and status announcements.
10. The closed product/test/docs file manifest, dependency order, validation commands, and next forward PWA generation for changed cached assets.

## Traceability matrix

| Requirement | Acceptance criteria |
|---|---|
| R-001 | AT-01, AT-02, AT-03, AT-06, AT-07, AT-19 |
| R-002 | AT-01, AT-02, AT-03, AT-07, AT-19 |
| R-003 | AT-05, AT-11, AT-12, AT-13 |
| R-004 | AT-01, AT-02, AT-03, AT-04, AT-05, AT-19 |
| R-005 | AT-05, AT-06, AT-19 |
| R-006 | AT-03, AT-04, AT-16, AT-17, AT-18, AT-19 |
| R-007 | AT-16, AT-17, AT-18, AT-19 |
| R-008 | AT-08, AT-09, AT-11, AT-12 |
| R-009 | AT-11, AT-12, AT-13, AT-14, AT-15 |
| R-010 | AT-10, AT-16, AT-19 |
| R-011 | AT-11, AT-12, AT-13, AT-14 |
| R-012 | AT-08, AT-09, AT-10, AT-11, AT-12 |
| R-013 | AT-13, AT-14, AT-15, AT-19 |
| R-014 | AT-13, AT-14, AT-15 |
| R-015 | AT-07, AT-16, AT-17, AT-18, AT-19 |
| R-016 | AT-01 through AT-19 |

## Readiness

- Requirements: **16**
- Acceptance scenarios: **19**
- Error/boundary scenarios: **17**
- Clarity: **15/15**
- Blocking product decisions: **None**
- Define status: **PASS — Shipped through SDD**
- Design artifact: `.sdd/features/local-data-safety/DESIGN.md`
- Build evidence: `.sdd/reports/local-data-safety/BUILD_REPORT.md`
- Recommended next skill: None; documentary SDD closure is complete.
