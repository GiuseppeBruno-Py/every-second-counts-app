# Local Data Safety — Truthful Notes Autosave and Safe JSON Restore — Shipped

## Metadata

| Field | Value |
| --- | --- |
| Feature | `local-data-safety` |
| Delivery | Truthful Notes autosave and safe full-state JSON restore |
| Closure date | `2026-09-04` |
| Status | `SHIP PASS` |
| Lifecycle state | `Shipped through SDD` |
| Archive mode | Copy-only; working feature/report artifacts retained |
| Branch | `codex/local-data-safety-brainstorm` |
| Baseline HEAD | `03f58900e2610e661b2aaf09209f54d1b019795b` |
| Baseline remote | `origin/main@03f58900e2610e661b2aaf09209f54d1b019795b` |
| Design | Revision 1.1; closed 6-product/docs + 6-test manifest |
| State contract | `compasso.state.v3`, unchanged |
| PWA generation | `compasso-pages-v78` |

## Closure decision

Local Data Safety is **Shipped through SDD**. Independent Ship inspection reconciled the current branch, HEAD, working tree, closed Design manifest, implementation diff, state/PWA contracts, and Build evidence. Fresh proportional verification of the storage contract, composed app, Local Data Safety browser flow, and PWA lifecycle also passed.

Ship found no blocking defect, accidental scope expansion, schema/store/key change, Service Worker architecture change, or unrelated product/test work. Ship changed no product code or product tests and performed no Git or remote release action.

The shipped contract is:

- `CompassoStorage.save()` remains `Promise<boolean>` and returns `true` only when IndexedDB or the exact durable `localStorage` fallback succeeds; memory-only retention is `false`.
- Notes uses runtime-only `saved`, `unsaved`, `saving`, and `failed` states. Only the current note revision and restore epoch may confirm `Salvo`; failed text remains editable and retry saves the latest revision.
- JSON restore parses, validates, normalizes, migrates, and sync-prepares a detached root candidate, asks for explicit destructive confirmation, then uses an exclusive replacement barrier to persist before promotion.
- Candidate or activation failure restores and verifies the prior checkpoint. An unverifiable compensation raises `storage-rollback-failed`, retains the barrier, and never claims recovery.

## Final scope reconciliation

### Product and documentation (6/6)

1. `storage.js`
2. `drive-sync-feature.js`
3. `index.html`
4. `design-system.css`
5. `app-manifest.js`
6. `docs/storage-foundation.md`

### Tests (6/6)

1. `tests/storage-quota.test.js`
2. `tests/app-manifest.test.js`
3. `tests/browser/local-data-safety-flows.spec.js`
4. `tests/browser/learning-outcome-flows.spec.js`
5. `tests/browser/critical-flows.spec.js`
6. `tests/browser/capability-context-flows.spec.js`

### SDD lifecycle evidence

1. `.sdd/features/local-data-safety/BRAINSTORM.md`
2. `.sdd/features/local-data-safety/DEFINE.md`
3. `.sdd/features/local-data-safety/DESIGN.md`
4. `.sdd/reports/local-data-safety/BUILD_REPORT.md`
5. `.sdd/archive/local-data-safety/BRAINSTORM.md`
6. `.sdd/archive/local-data-safety/DEFINE.md`
7. `.sdd/archive/local-data-safety/DESIGN.md`
8. `.sdd/archive/local-data-safety/BUILD_REPORT.md`
9. `.sdd/archive/local-data-safety/SHIPPED.md`

The changed product/docs/test paths match the closed Design manifest exactly. The new archive files are the expected Phase 4 lifecycle output. No unrelated path is included. Working artifacts were retained in copy-only mode for auditability and the separately authorized Git checkpoint.

## Requirement verification (16/16)

| Requirement | Status | Ship evidence |
| --- | --- | --- |
| R-001 | PASS | Public `save(): Promise<boolean>` contract retained; focused primary, fallback, total-failure and serialization tests pass. |
| R-002 | PASS | Durable union semantics verified: either backend is success; memory-only is failure. |
| R-003 | PASS | Full per-key attempt remains ordered; restore uses one exclusive key barrier and drains prior writes. |
| R-004 | PASS | Four Notes states live only in the per-note runtime map; no persistence/schema field added. |
| R-005 | PASS | Note ID, revision and epoch guards reject stale completions; deterministic deferred-save browser scenario passes. |
| R-006 | PASS | Editing stays enabled, failed text remains in place, and retry persists the latest revision. |
| R-007 | PASS | Polite atomic status and native retry control are keyboard operable and announce no note content. |
| R-008 | PASS | Parse and root/core-array validation occur before confirmation, persistence, or active-state mutation. |
| R-009 | PASS | Candidate normalization/migration and sync preparation operate on clones without network/global-state side effects. |
| R-010 | PASS | Destructive confirmation is explicit; Cancel, Escape and focus return are covered. |
| R-011 | PASS | Replacement persistence succeeds before activation/promotion callback. |
| R-012 | PASS | Memory, IndexedDB and localStorage checkpoint compensation/verification are covered, including locked rollback failure. |
| R-013 | PASS | Promotion, sync-baseline activation and one render occur only after durable candidate persistence. |
| R-014 | PASS | Current and legacy root backups, tolerant optional collections, and compatible unknown fields remain supported. |
| R-015 | PASS | Offline, keyboard, 360–390 px, coarse pointer and 200% zoom evidence is green. |
| R-016 | PASS | `compasso.state.v3`, DB version, stores, collections, key, local-first behavior and protected domains are unchanged. |

## Acceptance verification (19/19)

| Scenario | Status | Evidence reconciled at Ship |
| --- | --- | --- |
| AT-01 | PASS | IndexedDB success remains true despite mirror failure; Notes confirms only current durable revision. |
| AT-02 | PASS | IndexedDB-unavailable exact fallback survives reload, including large fallback state. |
| AT-03 | PASS | Total durable failure returns false and exposes intact editable text plus retry. |
| AT-04 | PASS | Keyboard retry saves the latest revision and survives reload. |
| AT-05 | PASS | FIFO storage and deferred stale-completion scenarios protect newer edits. |
| AT-06 | PASS | Confirmed Note title/body reload with truthful initial saved status. |
| AT-07 | PASS | Offline autosave/reload and v78 offline PWA lifecycle pass. |
| AT-08 | PASS | Malformed JSON changes neither active nor durable state and reports an accessible parse error. |
| AT-09 | PASS | Primitive, array, invalid-core and unsupported envelope roots are rejected before storage. |
| AT-10 | PASS | Escape and pointer cancellation discard the candidate, reset input and return focus. |
| AT-11 | PASS | Candidate persistence failure never promotes or announces success and remains retryable. |
| AT-12 | PASS | Activation/partial-touch failure restores exact prior canaries and survives reload. |
| AT-13 | PASS | Current backup persists before one activation/render and produces no Drive request. |
| AT-14 | PASS | Legacy root backup with missing optional collections restores through current migrations. |
| AT-15 | PASS | Unknown root fields, Notes/tags/wikilinks/vault and learning/capture canaries survive restore/reload. |
| AT-16 | PASS | Retry, confirmation and cancellation are keyboard operable with deterministic focus. |
| AT-17 | PASS | 360/390 px and coarse-pointer targets pass without horizontal overflow. |
| AT-18 | PASS | 200% zoom reflows dialog, actions and status without overflow. |
| AT-19 | PASS | Fixed polite/atomic status text contains no note content and makes no stale success claim. |

## Error and boundary verification (17/17)

| Scenario | Status | Evidence reconciled at Ship |
| --- | --- | --- |
| ER-01 | PASS | Cyclic and undefined candidates fail before memory/backend mutation. |
| ER-02 | PASS | Primary commit plus mirror quota failure remains successful. |
| ER-03 | PASS | Primary failure plus exact local fallback remains successful. |
| ER-04 | PASS | Dual durable failure preserves prior durable copy and reports memory-only failure. |
| ER-05 | PASS | Older completion has no visible effect after a newer edit/failure. |
| ER-06 | PASS | Failed runtime text/status survives Notes rerender/revisit. |
| ER-07 | PASS | Reload after failed save exposes only the last durably confirmed content. |
| ER-08 | PASS | Unsupported root/core shape is rejected before dialog and replacement. |
| ER-09 | PASS | Missing optional legacy collections remain tolerated. |
| ER-10 | PASS | Existing normalizers isolate invalid optional records without strict state allow-listing. |
| ER-11 | PASS | Sync preparation clones the candidate, preserves active state/baseline and performs no network request. |
| ER-12 | PASS | Cancellation discards prepared runtime while active/durable state remains exact. |
| ER-13 | PASS | Either durable backend may commit a replacement despite peer failure. |
| ER-14 | PASS | Activation throw compensates/verifies storage and restores active state. |
| ER-15 | PASS | Queue drain and Notes epoch prevent a pre-restore write from landing afterward. |
| ER-16 | PASS | Synchronous key ownership prevents concurrent replacement/write interleaving. |
| ER-17 | PASS | Connected, disconnected and offline preparation/restore make no automatic Drive request. |

## Validation evidence

### Build evidence retained

- Focused Node storage/manifest: **26 passed, 0 failed**.
- Dedicated Local Data Safety browser matrix: **18 passed, 0 failed**.
- PWA lifecycle Chromium: **10 passed, 0 failed**.
- Canonical Node: **213 passed, 0 failed, 0 skipped**.
- Canonical Browser: **201 passed, 0 failed, 19 expected conditional skips**.
- Canonical total: **414 passes, 0 failures**.
- `git diff --check`: **PASS**.

### Fresh Ship verification

- `node --test tests/storage-quota.test.js tests/app-manifest.test.js`: **26 passed, 0 failed**.
- `npm run build:test`: **PASS**; current composed application is syntactically valid.
- Local Data Safety browser suite, Chromium: **9 passed, 0 failed**.
- PWA lifecycle browser suite, Chromium: **10 passed, 0 failed**.
- Fresh focused browser total: **19 passed, 0 failed**.
- `git diff --check`: **PASS**.

The full canonical suites were not repeated because the Build evidence belongs to the same unchanged diff and exact `origin/main` baseline. Fresh Ship verification targeted the highest-risk storage, restore, Notes and PWA contracts. As in Build, browser verification reused the matching Playwright 1.55.0 installation from a sibling Compasso worktree; no package file changed.

## Compatibility statement

- No state-schema version change: `compasso.state.v3` remains authoritative.
- No new collection, IndexedDB object store, DB version, or storage key.
- Current root backups and repository-evidenced legacy root backups remain supported.
- The unsupported `{ data: ... }` envelope remains rejected as designed.
- Compatible unknown fields remain preserved through normalization, persistence, restore and reload.
- Notes, tags, wikilinks/vault data, Journal, learning outcomes/signals, Sessions and Evidence remain compatible.
- IndexedDB-primary, durable localStorage fallback, offline operation, JSON backup/restore and Service Worker composition remain intact.
- `service-worker.js` and its install/activate/fetch architecture are unchanged.

## PWA and state versions

- PWA cache generation: `compasso-pages-v78`.
- State contract: `compasso.state.v3`.
- Service Worker architecture: unchanged.

## Deviations and known limitations

- Product/docs/test manifest deviation: **none**.
- DEFINE/DESIGN contract deviation: **none**.
- The Ship skill's referenced `templates/SHIPPED_TEMPLATE.md` was absent from the installed skill directory. This artifact therefore follows the established Compasso archive structure and records the adaptation explicitly.
- The selected browser-journey fixture omits the production Drive module; its restore suites install a deterministic no-network adapter. The real pure Drive preparation/activation contract is independently exercised by the storage VM test.
- The repository has no configured lint or static-type command; composition plus Node/browser suites remain its canonical gates.
- Remote Linux behavior and a physical installed-PWA update are external evidence, not claimed by this Ship.

## Remaining external release gates

### Remote Linux CI — PENDING

The exact tree is still uncommitted, so GitHub cannot yet attribute Linux CI to it. After a separately authorized scoped commit and push, the pull-request workflow must run successfully against the exact head SHA.

### Human installed-PWA v77 → v78 smoke — PENDING

Using a same-origin installed v77 PWA without clearing local data, verify update to v78, existing Notes and backup data, confirmed autosave, failed-save recovery, current and legacy restore confirmation/cancel/failure, close/reopen, and offline behavior. This is non-blocking for documentary SDD closure but remains a release/merge gate.

## Rollback

Before release, the scoped delivery can be reverted as one closed checkpoint. After v78 exposure, prefer a forward corrective cache generation that preserves `compasso.state.v3`, all current stores/keys and tolerant backup normalization. Never clear IndexedDB, localStorage, Notes, backup/vault data, learning history, or unrelated caches as rollback.

At runtime, a recoverable restore failure must continue to compensate and verify the prior memory/IndexedDB/localStorage checkpoint. A `storage-rollback-failed` condition must keep the barrier and avoid any recovery-success claim; it is not safe to resume ordinary writes until the durable state is reconciled.

## Lessons retained

1. In a local-first product, an attempted write and an in-memory copy are not a saved result. Boolean compatibility can be preserved by defining success as the union of confirmed durable backends.
2. Destructive restore crosses both persistence and activation boundaries. Persist-before-promote needs an exclusive write barrier plus exact compensation when post-commit activation fails.
3. Autosave truthfulness is a versioning problem as much as a storage problem. Per-note revision and restore-epoch guards prevent an older completion from describing newer text.
4. Narrow root validation plus established tolerant normalizers protects legacy and unknown compatible data better than introducing a new strict backup schema.

## Archived artifacts

- `.sdd/archive/local-data-safety/BRAINSTORM.md`
- `.sdd/archive/local-data-safety/DEFINE.md`
- `.sdd/archive/local-data-safety/DESIGN.md`
- `.sdd/archive/local-data-safety/BUILD_REPORT.md`
- `.sdd/archive/local-data-safety/SHIPPED.md`

Archival used copy-only mode. Working artifacts remain under `.sdd/features/local-data-safety/` and `.sdd/reports/local-data-safety/` for auditability and a separately authorized Git checkpoint.

## Exact recommended Git checkpoint scope

Stage only the 21 paths listed in Final scope reconciliation: 6 product/documentation files, 6 test files, 4 retained working SDD artifacts, and 5 archived SDD artifacts. Exclude generated `.test-dist` content, Playwright output, dependencies, and every unrelated path.

Suggested checkpoint message: `fix: make local persistence outcomes truthful`

## Release actions

No staging, commit, push, pull request, merge, rebase, deployment, publication, installed-PWA mutation, permission change, or other remote release action occurred during Ship.

**Final lifecycle state:** Local Data Safety — Truthful Notes Autosave and Safe JSON Restore is **Shipped through SDD**.

**Recommended next action:** create a separately authorized scoped Git checkpoint, push it for remote Linux CI, and complete the human installed-PWA v77 → v78 smoke before merge or publication.
