# Evidence Recall em Hoje — Shipped

**Delivery:** 2 — Recall contextual de evidências
**Status:** Shipped
**Date:** 2026-09-14
**Branch:** `codex/evidence-recall-today`
**Implementation baseline:** `33891da518b78fa28dc6881267c35bbadad6066e`
**Release state:** not committed, pushed, merged, published, or deployed

## Accepted outcome

Hoje derives at most one factual historical Evidence for the Capability behind the current primary next attempt. Selection follows exact canonical Session provenance, chooses the latest eligible occurrence deterministically, and lets the learner open and focus that exact Evidence inside the existing Capability context.

The delivery adds no schema, migration, collection, backend, dependency, route, modal, AI, similarity search, score, analytics, durable read state, or Service Worker behavior.

## Acceptance result

| Acceptance criteria | Result | Accepted evidence |
| --- | --- | --- |
| AC-01–AC-05 | PASS | Pure selector and browser tests prove absence, exact Capability isolation, latest `createdAt`, and deterministic ID tie-break. |
| AC-06 | PASS | `Ver evidência` promotes, expands, scrolls to, and focuses the exact Evidence ID. |
| AC-07 | PASS | `Iniciar agora` retains primary styling, DOM/focus precedence, and existing execution behavior. |
| AC-08 | PASS | Model immutability and browser deep equality prove recall/open writes no product state. |
| AC-09 | PASS | Stale-click revalidation excludes a removed record, selects the next eligible record, and omits the block when none remains. |
| AC-10 | PASS | Missing execution, incomplete provenance, malformed/future records, and resemblance-only legacy fields fail closed. |
| AC-11–AC-12 | PASS | Existing unavailable/historical Today and active-execution precedence tests remain green. |
| AC-13 | PASS | Existing legacy/current backup-restore and protected-data journeys remain green; no persisted format changed. |
| AC-14 | PASS | Controlled complete-cache PWA journey re-renders and opens exact recall after an offline refresh. |
| AC-15 | PASS | Desktop/mobile automation covers accessible naming, deterministic focus, 44 px target, wrapping, and no horizontal overflow. |
| AC-16 | PASS | Calibration, signals, Evidence CRUD, Today, Session, storage, backup, and PWA regressions remain green. |

**Acceptance:** PASS — 16/16.

## Validation evidence

- Fresh Ship Node regression: `npm test` → **216 passed, 0 failed, 0 skipped**.
- Fresh Ship proportional browser checks → **3 passed, 0 failed, 1 expected conditional skip**.
- Still-valid full browser regression from Build, with no subsequent production-code changes: `npm run test:browser` → **239 passed, 0 failed, 23 existing conditional skips**.
- Current full evidence: **455 tests passed, 0 failed**; baseline was **450 passed, 0 failed**.
- `git diff --check`: PASS; Git emitted line-ending advisories only.
- Closed manifest comparison: **12 changed product/test/doc paths expected, 12 present, 0 extra, 0 missing**.
- Guarded paths unchanged: `service-worker.js`, `state-foundation.js`, `history-evidence-model.js`, `package.json`, `package-lock.json`, and `index.html`.

## Design comparison

- Pure selector, exact canonical provenance, eligibility rules, ranking, and detached DTO: conformant.
- Primary-only Today projection and subordinate action hierarchy: conformant.
- Click-time revalidation and exact existing Capability destination: conformant.
- Ephemeral promotion within the existing four-item Evidence window: conformant.
- Responsive/accessibility rules and v81→v82 generation advance: conformant.
- No path outside the closed twelve-file implementation manifest: conformant.

No material deviation from the approved Design was found. During Build, the browser harness first returned 404 because `.test-dist` had not been composed; the canonical `npm run build:test` prerequisite corrected it. An incomplete synthetic execution fixture was also corrected to the repository's real canonical execution shape. Neither event changed production scope or behavior.

## Compatibility and rollback

- State remains `compasso.state.v3`; no data migration or rollback exists.
- IndexedDB, exact localStorage fallback, JSON backup/restore, Markdown/vault data, Evidence ownership, and offline architecture remain intact.
- Candidate PWA generation is `compasso-pages-v82`; Service Worker implementation is unchanged.
- Before publication, rollback is the complete twelve-path implementation unit. After v82 exposure, use a later forward generation containing the reverted projection. Never reuse v81/v82 or clear user data/caches.

## Residual risks and follow-ups

- Recall intentionally excludes legacy Evidence without canonical execution provenance and never attempts repair or similarity matching.
- Only the primary current Capability attempt and one related Evidence are supported.
- Chromium desktop/mobile emulation and the controlled offline origin are verified; a separately installed physical-device PWA remains a human release check.
- Two pre-existing high-severity dependency audit findings remain outside this frozen-dependency delivery.
- Commit, push, PR, merge, publication, deployment, and production verification require separate explicit authorization.

## Lessons

1. Evidence recall stays trustworthy when association and ranking remain separate: canonical execution provenance answers “related to what?”, while Evidence `createdAt` answers “which occurrence is most recent?”.
2. Exact-record navigation needs a stable source target and ephemeral promotion; generic card focus is insufficient when the selected Evidence falls outside the default summary window.
3. Revalidating on activation prevents stale UI from silently substituting another Evidence after deletion or concurrent state change.
4. A derived-only feature can extend the learning loop without adding schema, provided offline and restore journeys prove the projection is recomputed from durable owners.

## Archive contents

- `DEFINE.md`
- `DESIGN.md`
- `BUILD_REPORT.md`
- `SHIPPED.md`

Working copies were removed only after archive readability and completeness verification.

**Delivery 2 SDD Ship: PASS.**
