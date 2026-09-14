# Evidence-Based Calibration — Shipped

## Metadata

| Field | Value |
| --- | --- |
| Feature | `evidence-based-calibration` |
| Delivery | 1 — Evidence-Based Calibration |
| Closure date | `2026-09-14` |
| Status | `SHIP PASS` |
| Lifecycle state | `Shipped through SDD` |
| Archive mode | Copy-only; working feature/report artifacts retained |
| Branch | `codex/evidence-based-calibration` |
| Baseline | `origin/main@bc53712eb105ac02b525ffaec8b42d58d1feea14` |
| State contract | `compasso.state.v3`, unchanged |
| PWA generation | `compasso-pages-v81` |

## Closure decision

Evidence-Based Calibration is **Shipped through SDD**. Ship reconciled the current worktree, approved Design, eight-path implementation manifest, 16 acceptance scenarios, data contracts, offline behavior, mobile/accessibility coverage, and fresh canonical regression.

No blocker, material Design deviation, schema migration, new collection, Service Worker architecture change, or unrelated product/test change remains. Ship changed only lifecycle documentation and performed no Git checkpoint or remote release action.

The accepted behavior is:

- a newly saved, canonically linked Evidence may expose a secondary optional action, `Refletir sobre esta evidência`;
- the reflection asks exactly `O que esta evidência demonstra que você já consegue fazer?`, begins empty, and is never generated or inferred;
- only explicit submit persists one learner-authored `insight` with exact Evidence and Capability provenance;
- Cancel, Escape, empty input, ineligible provenance, or persistence failure creates no promoted signal and never invalidates the already durable Session/Evidence;
- the existing generic learning-signal flow, state v3, IndexedDB/localStorage behavior, JSON backup/restore, offline shell, and protected data domains remain compatible.

## Final scope reconciliation

### Product and documentation (5/5)

1. `evidence-feature.js`
2. `learning-outcome-feature.js`
3. `app-manifest.js`
4. `docs/evidence-feature.md`
5. `docs/capability-first-compasso.md`

### Tests (3/3)

1. `tests/app-manifest.test.js`
2. `tests/browser/capability-context-flows.spec.js`
3. `tests/browser/pwa-lifecycle-flows.spec.js`

The changed product/docs/test set matches the closed Design manifest exactly. The archive files are the expected Phase 4 lifecycle output. No production or test path was added during Ship.

## Acceptance verification (16/16)

| Scenario | Status | Ship evidence |
| --- | --- | --- |
| AC-01 Session without calibration | PASS | Completion remains dismissible with durable Session/Evidence and zero signal. |
| AC-02 eligible secondary action | PASS | Action appears only for newly saved Evidence with canonical active Capability/current-attempt provenance and remains secondary to Today. |
| AC-03 exact question and empty response | PASS | Browser coverage verifies exact label, empty value, focus, and no copied/generated answer. |
| AC-04 no pre-submit persistence | PASS | Typed draft does not alter active or durable signal collections. |
| AC-05 Cancel and Escape | PASS | Both paths create no signal/tombstone, preserve source records, and restore focus. |
| AC-06 explicit save | PASS | One learner-authored `insight` is saved with exact Capability attempt and Evidence source. |
| AC-07 source isolation | PASS | Capability, next attempt, Today, Session, execution, Evidence, and resource data remain unchanged. |
| AC-08 persistence failure | PASS | Dialog, draft, and accessible error remain while no signal is promoted and Session/Evidence stay durable. |
| AC-09 retry | PASS | Retrying after restored storage creates exactly one signal. |
| AC-10 ineligible context | PASS | Missing, archived, malformed, or unlinked provenance produces no calibration action or inferred association. |
| AC-11 legacy data | PASS | Legacy normalization and browser flows remain valid without fabricated calibration. |
| AC-12 backup compatibility | PASS | Old backup restore remains valid; new Evidence-sourced insight and protected canaries round-trip. |
| AC-13 offline flow | PASS | Cached offline Session → Evidence → calibration → refresh retains confirmed records. |
| AC-14 mobile and keyboard | PASS | Focus, Escape, labels, 200% zoom, small viewport geometry, and touch targets pass. |
| AC-15 generic signal regression | PASS | Existing generic create/edit/delete presentation and persistence behavior remains available. |
| AC-16 PWA generation | PASS | Manifest v81, composition, cache ownership, update lifecycle, and offline startup pass. |

## Validation evidence

### Build evidence retained

- Baseline Node: **213 passed, 0 failed**.
- Focused Node/state/PWA: **67 passed, 0 failed**.
- Capability calibration Chromium + mobile: **24 passed, 0 failed**.
- Local Data Safety + Design System Chromium/mobile: **32 passed, 0 failed, 4 expected conditional skips**.
- Build canonical total: **450 passed, 0 failed, 23 expected conditional skips**.
- Build scope audit: **8/8 manifest paths, 0 unexpected**.

### Fresh Ship verification

- Command: `npm run test:all`.
- Node: **213 passed, 0 failed, 0 skipped**.
- Browser: **237 passed, 0 failed, 23 expected conditional skips**.
- Fresh canonical total: **450 passed, 0 failed**.
- `git diff --check`: **PASS**; only Git's Windows LF→CRLF notices were emitted.

## Design comparison

- Closed manifest: **8/8 implemented**.
- Acceptance traceability: **16/16 PASS**.
- Schema/migration decision: **no change required**, as designed.
- Persistence design: existing `learningSignals` candidate-save path reused.
- UI architecture: existing completion panel and signal dialog reused; no new route, modal owner, framework, dependency, or backend.
- PWA design: manifest generation advanced once from v80 to v81; `service-worker.js` logic unchanged.
- Material deviation from Design: **none**.

## Compatibility statement

- `compasso.state.v3`, IndexedDB version, object stores, storage key, and exact localStorage fallback are unchanged.
- Old valid JSON backups remain restorable, and backups containing calibration insights round-trip under the existing learning-signal contract.
- Existing Session, Evidence, Capability, nextAttempt, Today, Notes, wikilinks/vault, Relations, Journal, and resource data remain protected.
- Offline operation is local-only and introduces no backend, account, cloud sync, embeddings, or external service.
- Evidence is still saved before calibration is offered and remains independent of the optional reflection outcome.

## Deviations and known limitations

- Product/docs/test scope deviation: **none**.
- DEFINE/DESIGN behavioral deviation: **none**.
- The installed Ship skill references `templates/SHIPPED_TEMPLATE.md`, but that file is absent. This artifact follows the established Compasso archive structure and records the adaptation explicitly.
- Automated Chromium/mobile checks do not replace a human assistive-technology session or an observation of an already-installed production PWA updating v80→v81.
- npm reported two high-severity dependency audit findings during install; remediation was not attempted because dependency changes are outside this delivery.
- The repository has no configured lint, formatter, or static-type command; syntax, composition, Node, and browser suites are its available gates.
- The branch remains local and uncommitted, so no remote Linux CI evidence exists for this exact tree.

## Remaining external release gates

### Remote CI — PENDING

After a separately authorized scoped commit and push, GitHub must run its workflow against the exact head SHA. This Ship does not claim that evidence.

### Human installed-PWA v80 → v81 smoke — PENDING

Without clearing local data, observe update, close/reopen, offline refresh, Session completion, Evidence persistence, optional calibration, cancellation, failed-save retry, and backup/restore. This is non-blocking for documentary SDD closure but remains a release/merge confidence gate.

### Assistive-technology smoke — PENDING

Use a screen reader to confirm the question label, validation/failure announcements, dialog navigation, Cancel/Escape, and returned focus. Automated semantics and keyboard tests pass, but no manual AT claim is made.

## Rollback

Before release, revert the closed eight-path delivery as one checkpoint. After v81 exposure, prefer a forward corrective cache generation while preserving `compasso.state.v3`, IndexedDB, localStorage, learning signals, Evidence, Notes, backups, and unrelated caches. Never clear user data as rollback.

## Lessons retained

1. Calibration fits the existing learner-authored `learningSignals` contract when provenance and presentation are explicit; a new psychological field or schema would have duplicated meaning and increased migration risk.
2. Evidence eligibility must resolve through the canonical Session execution and Capability attempt. Inferring linkage from a Study resource would create false associations, as the corrected PWA fixture demonstrated.
3. Saving Session/Evidence before offering reflection keeps the optional step genuinely non-blocking and makes failure recovery local to the reflection dialog.
4. An ephemeral presentation mode can reuse one dialog safely only when every specialized label, hidden control, draft, and focus target is restored for the generic path.

## Archived artifacts

- `.sdd/archive/evidence-based-calibration/DEFINE.md`
- `.sdd/archive/evidence-based-calibration/DESIGN.md`
- `.sdd/archive/evidence-based-calibration/BUILD_REPORT.md`
- `.sdd/archive/evidence-based-calibration/SHIPPED.md`

Archival used copy-only mode to preserve the working feature/report artifacts for auditability. No unrelated SDD artifact was touched.

## Release actions

No staging, commit, push, pull request, merge, rebase, deployment, publication, Service Worker release, permission change, user-data mutation, or destructive cleanup occurred during Ship.

**Final lifecycle state:** Delivery 1 — Evidence-Based Calibration is **Shipped through SDD**.

**Recommended next action:** create a separately authorized scoped Git checkpoint, then obtain remote CI and human installed-PWA evidence before merge or publication.
