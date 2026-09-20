# Ensaio da Próxima Tentativa — Shipped

**Delivery:** 3 — Ensaio da Próxima Tentativa
**Status:** Shipped
**Date:** 2026-09-20
**Branch:** `codex/attempt-rehearsal`
**Implementation baseline:** `b7246f48ba8177860041892bbdebd97ac15df7c9`
**Release state:** not committed, pushed, merged, published, or deployed

## Accepted outcome

Hoje now offers an optional rehearsal immediately before the primary active Capability attempt. The learner can answer up to four practical preparation questions, skip them, or start immediately. Answers exist only in the current DOM/runtime, never become analytics or profile data, and are discarded on start, cancel, navigation, or reload.

The successful rehearsal path delegates to the same canonical default Session preparation as direct start, with an additive confirmed-persistence command. Existing Session, Evidence, Capability, Evidence Recall, backup, Markdown, IndexedDB/localStorage, and offline contracts remain intact.

## Acceptance result

| Acceptance criteria | Result | Accepted evidence |
|---|---|---|
| AC-01–AC-05 | PASS | Direct start, one four-question preflight, empty/partial submit, and real skip paths pass on desktop and mobile. |
| AC-06 | PASS | Unique answer markers are absent from Session, Execution, state, JSON backup, and Markdown export. |
| AC-07–AC-09 | PASS | Cancel, Escape, navigation, `popstate`, and pre-start reload discard the draft without a Session or hidden focus. |
| AC-10–AC-11 | PASS | Confirmed Session survives reload and completes to Evidence; persistence failure rolls back and supports explicit retry. |
| AC-12–AC-15 | PASS | Changed/deleted/archived targets, concurrent execution, pending writes, and clean reopen all fail safely. |
| AC-16 | PASS | Direct start remains visually and focus-wise primary; existing Today actions and Evidence Recall are preserved. |
| AC-17 | PASS | State remains v3; legacy, durability, fallback, backup/restore, and export regressions pass. |
| AC-18 | PASS | Controlled cached-shell offline journey starts, reloads, resumes, finishes, and preserves local state. |
| AC-19–AC-20 | PASS | 360–390 px, 200% zoom, touch targets, labels, keyboard order, Escape, and focus behavior pass. |
| AC-21 | PASS | No rehearsal control appears outside the primary active Capability attempt. |

**Acceptance:** PASS — 21/21.

## Validation evidence

Fresh repeat-Ship validation on 2026-09-20:

- `npm test` → **218 passed, 0 failed, 0 skipped**.
- `npm run build:test` → **PASS**.
- syntax checks for both implementation files and the dedicated browser spec → **PASS**.
- rehearsal + design-system browser suites, Chromium and mobile → **46 passed, 4 conditional project skips, 0 failed**.
- Capability context + local data safety + PWA suites, Chromium → **33 passed, 0 failed**.
- `git diff --check` → **PASS**.
- closed manifest → **13 expected, 13 present, 0 extra, 0 missing**.

Still-valid corrective Build evidence on the same baseline and exact manifest scope:

- `npm run test:all` → **218 Node + 272 browser = 490 passed, 24 conditional skips, 0 failed**.
- visual inspection → **360, 390, 768, and 1280 px**.

Conditional skips are project-specific branches in the existing design-system/browser matrix; the applicable counterpart runs in the other selected project. No rehearsal acceptance scenario is skipped in both projects.

## Corrective Ship history

The first Ship review correctly returned `NEEDS REVISION` for three reasons:

1. draft lifecycle did not cover leaving Today;
2. the mobile footer's computed layout did not match the intended grid;
3. some acceptance claims used adjacent paths instead of the named user actions.

The corrective Design/Build added navigation and pending-save abandonment behavior, a scoped mobile layout rule, and direct tests for real skip, empty/partial submit, archive/delete, exports, and the complete Session-to-Evidence journey. `SHIP_REVIEW_REPEAT.md` closes SR-01, SR-02, and SR-03 individually.

## Design comparison

- All 13 approved product/test/documentation paths are present and no extra path exists.
- Today owns the ephemeral preflight and exact target revalidation.
- Sessions owns shared default preparation, durable confirmation, and rollback.
- Styling remains scoped to the existing native-dialog/design-system structure.
- Manifest generation advances to v83 without changing state v3 or Service Worker ownership.
- No schema, migration, collection, route, backend, dependency, analytics, AI, or persistent rehearsal model was added.

No functional deviation from the corrected approved Design remains.

## Compatibility and rollback

- State remains `compasso.state.v3`; no data migration or data rollback is required.
- IndexedDB and the exact localStorage fallback keep their existing durability behavior.
- Old JSON backups remain valid; new backup and Markdown exports contain no rehearsal answers.
- Service Worker implementation is unchanged; cache composition continues to come from `app-manifest.js`.
- Before publication, rollback is the complete 13-path implementation unit. After v83 exposure, rollback must use a later forward generation containing the reverted unit; do not reuse an exposed generation or clear user data.

## Residual risks and follow-ups

- A physically installed standalone PWA remains a human platform check; automated cached-shell offline behavior passes.
- Remote CI, deployment, and production behavior were not checked and are not claimed.
- The rehearsal intentionally disappears on navigation/reload and does not help the learner recover unfinished answers.
- Commit, push, PR, merge, publication, deployment, and production verification require separate explicit authorization.

## Lessons

1. Acceptance proof must execute the exact named action; a submit path cannot stand in for skip.
2. CSS source inspection is insufficient for responsive contracts when selector specificity can change the computed layout.
3. Reload and SPA navigation are distinct lifecycle boundaries, especially while asynchronous durable writes are pending.
4. A preparation feature can remain privacy-preserving by keeping answers outside every durable owner and delegating only the unchanged target context to the canonical Session flow.

## Archive contents

- `DEFINE.md`
- `DESIGN.md`
- `CHANGELOG.md`
- `BUILD_REPORT.md`
- `SHIP_REVIEW.md` — original `NEEDS REVISION` evidence
- `SHIP_REVIEW_REPEAT.md` — closing PASS evidence
- `SHIPPED.md`

Working copies were intentionally retained in copy-only mode for review. Archive readability and completeness were verified after creation.

**Delivery 3 SDD Ship: PASS.**
