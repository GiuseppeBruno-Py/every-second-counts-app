# BUILD REPORT: Local Data Safety — Truthful Notes Autosave and Safe JSON Restore

## Metadata

| Field | Value |
|---|---|
| Feature | `local-data-safety` |
| Date | `2026-08-29` |
| Branch | `codex/local-data-safety-brainstorm` |
| Baseline HEAD | `03f58900e2610e661b2aaf09209f54d1b019795b` |
| Baseline remote | `origin/main@03f58900e2610e661b2aaf09209f54d1b019795b` |
| Build status | **PASS** |
| Define | `.sdd/features/local-data-safety/DEFINE.md` — Complete (Built) |
| Design | `.sdd/features/local-data-safety/DESIGN.md` revision 1.1 — Complete (Built) |
| State contract | `compasso.state.v3` unchanged |
| PWA generation | `compasso-pages-v78` |

## Summary

The Build makes local persistence outcomes truthful without changing the state schema or replacing the storage architecture. `CompassoStorage.save()` now resolves `true` only when the exact serialized state reaches IndexedDB or the durable `localStorage` fallback. Notes exposes revision-aware `saved`, `unsaved`, `saving`, and `failed` states, keeps failed text editable, and retries the latest revision.

JSON restore now parses, validates, normalizes, migrates, and sync-prepares a detached candidate before confirmation. `CompassoStorage.replace()` drains prior writes, owns an exclusive state-key barrier, checkpoints memory/IndexedDB/localStorage, persists before activation, and compensates the exact previous checkpoint when activation fails. An unverifiable compensation raises `storage-rollback-failed` and retains the barrier.

The referenced skill template was absent in this checkout. This report follows the established repository BUILD_REPORT structure.

## Closed manifest execution

### Product and documentation files (6/6)

| Path | Implemented responsibility |
|---|---|
| `storage.js` | Durable boolean aggregation, full-attempt FIFO writes, exclusive `replace()`, checkpoint compensation and verification |
| `drive-sync-feature.js` | Pure detached `prepareLocalState()` and post-promotion `activateLocalState()` |
| `index.html` | Notes autosave state machine, semantic retry/status UI, detached restore preparation, confirmation and activation orchestration |
| `design-system.css` | Durable status/error/dialog/focus/coarse-pointer/360–390 px styling |
| `app-manifest.js` | Forward cache generation `compasso-pages-v78` only |
| `docs/storage-foundation.md` | Durable success, fallback, replace barrier and rollback contract |

### Test files (6/6)

| Path | Coverage |
|---|---|
| `tests/storage-quota.test.js` | Backend union, serialization, FIFO, replace barrier, compensation, locked rollback failure, pure sync preparation |
| `tests/app-manifest.test.js` | v78 generation and unchanged state v3 contract |
| `tests/browser/local-data-safety-flows.spec.js` | Notes durability/failure/retry/races; restore validation/cancel/failure/rollback/current backup; accessibility/mobile/offline |
| `tests/browser/learning-outcome-flows.spec.js` | Current and legacy restore through explicit confirmation |
| `tests/browser/critical-flows.spec.js` | Capture/distillation JSON round-trip through safe restore |
| `tests/browser/capability-context-flows.spec.js` | Notes/vault/Relations/model canaries through safe restore |

### SDD evidence

- `.sdd/features/local-data-safety/BRAINSTORM.md` — approved rationale preserved.
- `.sdd/features/local-data-safety/DEFINE.md` — normative requirements unchanged; status advanced to Complete (Built).
- `.sdd/features/local-data-safety/DESIGN.md` — architecture and closed manifest unchanged; revision/status advanced to 1.1 / Complete (Built).
- `.sdd/reports/local-data-safety/BUILD_REPORT.md` — this evidence record.

No file outside the authorized product/docs/test manifest and required SDD lifecycle paths was changed. No file was deleted, staged, committed, pushed, published, merged, or deployed.

## Implemented contracts

### Storage durability

- `CompassoStorage.save()` remains `Promise<boolean>`.
- Serialization completes before memory or backend mutation; cyclic and non-representable values return `false`.
- Each per-key queue entry includes IndexedDB and the exact mirror/fallback attempt.
- IndexedDB success returns `true` even if the optional mirror fails.
- IndexedDB failure plus exact `localStorage` fallback success returns `true`, including a large fallback value.
- Failure of both durable backends returns `false`; the candidate may remain in memory for retry but is never called saved.
- FIFO ordering and `flush()` remain intact.

### Notes autosave

- Runtime-only per-note entries track `revision`, `confirmedRevision`, `status`, timer and restore epoch.
- The visible lifecycle is `saved → unsaved → saving → saved | failed`.
- Completion updates the UI only when note entry, revision and epoch still match.
- Editing never disables or rerenders the title, tags or body, preserving caret and focus.
- Failure keeps the latest in-memory text and exposes native `Tentar novamente`; retry always serializes the latest state.
- The polite atomic status uses only `Salvo`, `Alterações não salvas`, `Salvando…`, and `Não foi possível salvar`; it never announces note content.

### Safe JSON restore and rollback

- Accepted input remains a root object with `reading`, `study`, and `goal` arrays. Primitive, array, malformed, invalid-core, and `{ data: ... }` envelope inputs are rejected before confirmation or storage.
- Optional legacy collections remain tolerant, while current normalizers/migrations preserve Notes, wikilinks, Journal, learning outcomes/signals, sessions/Evidence, and compatible unknown fields.
- Candidate preparation clones the input and creates sync metadata/baseline without changing global state or making a network request.
- Confirmation is explicit and destructive; Cancel, Escape, and invalid files change nothing.
- `replace()` synchronously reserves the key, drains earlier writes, snapshots all readable layers, persists the candidate, then invokes activation.
- Candidate persistence failure restores/verifies the checkpoint and never promotes the candidate.
- Activation failure restores active state and sync baseline; storage compensates and verifies memory, IndexedDB and localStorage before returning recoverable failure.
- If compensation cannot be verified, `storage-rollback-failed` retains the barrier and the UI does not claim recovery.

## Validation evidence

### Focused validation

| Command or scope | Result |
|---|---|
| `node --test tests/storage-quota.test.js tests/app-manifest.test.js` | **26 passed, 0 failed** |
| `npm run build:test` | **PASS**; composed application syntax valid |
| Four related browser suites, Chromium | **58 passed, 2 expected conditional skips, 0 failed** before the final added focused fallback case; all are included in canonical validation |
| Dedicated Local Data Safety suite, final Chromium + mobile | **18 passed, 0 failed** |
| `tests/browser/pwa-lifecycle-flows.spec.js --project=chromium` | **10 passed, 0 failed** |

The first focused PWA attempt used the journey server without the required lifecycle control server and failed with `ECONNREFUSED 127.0.0.1:4174`. After starting the repository's prescribed `scripts/pwa-test-server.js`, the unchanged 10-test PWA suite passed. This was an environment setup correction, not a product or test change.

### Canonical validation

Final `npm run test:all` on the current tree:

- Node: **213 passed, 0 failed, 0 skipped**.
- Browser: **201 passed, 0 failed, 19 expected conditional skips** across Chromium and mobile.
- Total executed passes: **414**.
- Exit code: **0**.

The worktree did not contain local `node_modules`; the commands reused the matching Playwright 1.55.0 dependency already installed in a sibling Compasso worktree. Package manifests and lockfiles were not changed.

### Acceptance scenarios (19/19)

| Scenario | Status | Evidence |
|---|---|---|
| AT-01 | PASS | IndexedDB commit is successful even with mirror failure; Notes remains editable and reports only confirmed latest revision |
| AT-02 | PASS | IDB-unavailable large fallback and browser fallback-only reload both retain the exact state |
| AT-03 | PASS | Total durable failure returns false and Notes shows failure with text/retry intact |
| AT-04 | PASS | Keyboard retry persists the latest failed text and survives reload |
| AT-05 | PASS | Full FIFO attempt and deferred stale completions cannot mark newer text saved |
| AT-06 | PASS | Confirmed Note save reloads with title/body and truthful initial saved status |
| AT-07 | PASS | Autosave succeeds while browser is offline; PWA offline lifecycle passes on v78 |
| AT-08 | PASS | Malformed JSON leaves active/durable canary untouched and announces parse error |
| AT-09 | PASS | Primitive, array, invalid core and unsupported envelope roots are rejected before storage |
| AT-10 | PASS | Escape and pointer Cancel discard the candidate, reset input and return focus deterministically |
| AT-11 | PASS | Forced replacement failure never promotes or announces success and remains retryable |
| AT-12 | PASS | Partial-touch/activation failure restores exact memory/IDB/local canaries and survives reload |
| AT-13 | PASS | Current backup persists before one activation/render and performs no Drive request |
| AT-14 | PASS | Legacy root backup with missing optional collections restores through current migrations |
| AT-15 | PASS | Unknown root fields, Notes/tags/wikilinks/vault/model/capture canaries survive restore/reload |
| AT-16 | PASS | Retry, confirmation and cancellation are keyboard-operable with deterministic focus |
| AT-17 | PASS | 360/390 px and coarse-pointer touch targets pass without horizontal overflow |
| AT-18 | PASS | 200% zoom reflows dialog, actions and status without overflow |
| AT-19 | PASS | Polite atomic status uses fixed state text, never note contents or duplicate success claims |

### Error and boundary scenarios (17/17)

| Scenario | Status | Evidence |
|---|---|---|
| ER-01 | PASS | Cyclic/undefined values return false before memory/backend attempts |
| ER-02 | PASS | Primary commit plus mirror quota failure returns true and retains primary record |
| ER-03 | PASS | Primary failure/unavailability plus exact large local fallback returns true |
| ER-04 | PASS | Both backends failing leaves prior durable copy and reports memory-only false |
| ER-05 | PASS | Old success after newer edit/failure has no visible effect |
| ER-06 | PASS | Failed runtime state/text survives Notes rerender/revisit |
| ER-07 | PASS | Reload after failed save loads only the last durably confirmed content |
| ER-08 | PASS | Unsupported root/core shapes are rejected before dialog and replace |
| ER-09 | PASS | Legacy backup omitting optional collections remains accepted |
| ER-10 | PASS | Current model normalizers preserve valid canaries and isolate optional invalid records |
| ER-11 | PASS | Real sync preparation clones candidate, leaves active state untouched and makes zero network calls |
| ER-12 | PASS | Cancellation discards prepared runtime and leaves exact active canary |
| ER-13 | PASS | Either durable backend can commit a replacement despite peer failure |
| ER-14 | PASS | Activation throw restores/verifies checkpoint and rolls back active state |
| ER-15 | PASS | Queue drain plus Notes epoch prevents older debounce/save from landing after restore |
| ER-16 | PASS | Synchronous key lock rejects concurrent save/second replacement |
| ER-17 | PASS | Connected/disconnected/offline preparation and restore make no automatic Drive request |

## PWA, state, accessibility and offline evidence

- `app-manifest.js` advances exactly `compasso-pages-v77` → `compasso-pages-v78`.
- `compasso.state.v3`, DB version, object stores, collections and storage key are unchanged.
- `service-worker.js`, cache ownership, install/activate/fetch and composition architecture are unchanged.
- Update convergence, failure, coherent offline reopen, raw recovery and non-destructive shell reset pass.
- Status and errors use native controls, visible focus, polite/atomic announcements and no content disclosure.
- 360–390 px, Pixel 7/coarse pointer, 200% zoom and offline save/reopen pass.

## Implementation corrections and deviations

- **Manifest deviation:** None.
- **Requirements/Design deviation:** None.
- The selected browser-journey fixture intentionally omits `drive-sync-feature.js`; authorized restore suites install a deterministic no-network test adapter before page startup, including reloads. The production module's pure preparation/activation implementation is covered separately by a VM test using the actual file.
- During focused validation, the success path revealed that `restoreRuntime.busy` was cleared without re-enabling dialog buttons. The success transition now uses the shared busy-state setter, and consecutive current + legacy restores pass.
- A transient `Salvando…` assertion was moved to the deterministic deferred-save scenario because a real IndexedDB write can complete before Playwright observes that intermediate frame. Durable outcome assertions were retained and expanded.

## Remaining gates and limitations

- A human same-origin installed-PWA update/reopen/offline smoke from v77 to v78 was not performed during Build and remains a Ship/release gate.
- Remote Linux CI has not run against this uncommitted worktree.
- No lint or static type command exists in `package.json`; syntax/composition, Node and browser suites are the repository's canonical gates.

## Final checklist

- Authorized product/docs manifest: **PASS (6/6)**
- Authorized test manifest: **PASS (6/6)**
- Requirements: **PASS (16/16)**
- Acceptance scenarios: **PASS (19/19)**
- Error/boundary scenarios: **PASS (17/17)**
- Canonical validation: **PASS**
- `git diff --check`: **PASS**
- `compasso.state.v3`: **preserved**
- `compasso-pages-v78`: **verified**
- Service Worker architecture: **unchanged**
- Commit/push/PR/merge/deploy/publish: **none**
- Ready for `$sdd-ship`: **Yes**

## Revision history

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-08-29 | Codex | Build PASS report with exact closed manifest, 16/16 requirements, 19/19 acceptance, 17/17 boundary/error, and canonical evidence. |
