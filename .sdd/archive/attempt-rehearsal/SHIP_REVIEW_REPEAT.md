# Delivery 3 — Repeat Ship Review

**Feature:** Ensaio da Próxima Tentativa
**Date:** 2026-09-20
**Result:** PASS
**Baseline:** `b7246f48ba8177860041892bbdebd97ac15df7c9` (`origin/main`)
**Branch:** `codex/attempt-rehearsal`

## Outcome

The corrective Build resolves all three findings from the 2026-09-16 Ship review. The implementation now satisfies all 21 acceptance criteria, matches the approved 13-path product/test/documentation manifest, preserves the local-first data contracts, and is ready for SDD closure.

This review authorizes only SDD archival. It does not authorize commit, push, pull request, merge, deployment, publication, or release.

## Previous findings

| Finding | Corrective evidence | Result |
|---|---|---|
| SR-01 — draft survived navigation | Browser tests cover regular navigation and `popstate`, both pending-save outcomes, no hidden focus, no reopen, and no duplicate write. | CLOSED |
| SR-02 — mobile footer contradicted Design | The scoped mobile rule produces a one-column grid; browser coverage checks the computed layout at small viewports and the current 360/390 screenshots were inspected during the corrective Build. | CLOSED |
| SR-03 — acceptance evidence was overstated | The dedicated suite now exercises real skip, empty/partial submit, archive/delete, JSON/Markdown absence, and the complete Session → reload → resume → finish → Evidence journey. | CLOSED |

## Individual acceptance map

| Criterion | Evidence | Result |
|---|---|---|
| AC-01 — immediate start | Direct primary action starts without opening rehearsal; legacy command contract remains stable. | PASS |
| AC-02 — empty preflight | One dialog opens with exactly four unambiguous labelled questions and no write. | PASS |
| AC-03 — complete responses | Filled answers remain only in DOM/runtime memory and do not mutate serialized state. | PASS |
| AC-04 — partial or empty responses | Empty and partial form submission both start the canonical Session. | PASS |
| AC-05 — skip | Real skip clears empty/filled drafts, including failure and retry paths, then uses the default start. | PASS |
| AC-06 — Session receives no answers | Unique rehearsal markers are absent from Session, Execution, state, JSON backup, and Markdown export. | PASS |
| AC-07 — explicit cancel | Cancel closes, clears, creates no Session, performs no write, and returns focus. | PASS |
| AC-08 — Escape | Escape follows the same discard and focus-return contract. | PASS |
| AC-09 — reload before start | Reload closes the preflight, removes the draft, and creates no Session. | PASS |
| AC-10 — reload after start | The confirmed Session survives reload, resumes, finishes, and produces Evidence. | PASS |
| AC-11 — persistence failure | Failed save rolls back, preserves the submit draft for explicit retry, focuses the error, and succeeds after recovery. | PASS |
| AC-12 — changed attempt | Exact target revalidation rejects a replaced attempt without starting a Session. | PASS |
| AC-13 — unavailable Capability | Archived and deleted capabilities invalidate the rehearsal without target substitution. | PASS |
| AC-14 — concurrent execution | An already active execution prevents a second Session. | PASS |
| AC-15 — clean reopen | Cancel, Escape, navigation, and reload paths reopen with all four fields empty. | PASS |
| AC-16 — Today hierarchy and Recall | Start remains primary, rehearsal secondary, existing actions and Evidence Recall remain intact. | PASS |
| AC-17 — legacy data and backup | State remains v3, collections are unchanged, durability/restore regressions pass, and exports contain no rehearsal payload. | PASS |
| AC-18 — offline/PWA | Cached-shell offline test starts the canonical Session, reloads, resumes, and preserves local state without a network dependency. | PASS |
| AC-19 — mobile, zoom, touch | Rehearsal reflows without horizontal overflow, keeps 44 px targets, and passes 200% zoom/mobile checks. | PASS |
| AC-20 — keyboard and focus | Labels, tab order, visible focus, Escape, error focus, opener return, and hidden-focus prevention are covered. | PASS |
| AC-21 — other domains | Rehearsal is absent outside the primary active Capability path. | PASS |

## Verification

Fresh repeat-Ship checks on 2026-09-20:

- `npm test` — 218 passed, 0 failed, 0 skipped.
- `npm run build:test` — PASS.
- `node --check today-feature.js` — PASS.
- `node --check sessions-feature.js` — PASS.
- `node --check tests/browser/attempt-rehearsal-flows.spec.js` — PASS.
- `npx playwright test tests/browser/attempt-rehearsal-flows.spec.js tests/browser/design-system-flows.spec.js --project=chromium --project=mobile --retries=0` — 46 passed, 4 conditional project skips, 0 failed.
- `npx playwright test tests/browser/pwa-lifecycle-flows.spec.js tests/browser/capability-context-flows.spec.js tests/browser/local-data-safety-flows.spec.js --project=chromium --retries=0` — 33 passed, 0 failed.
- `git diff --check` — PASS.
- Closed-manifest guard — exact 13 of 13 product/test/documentation paths, no missing or extra path.

Still-valid corrective Build evidence, with the same baseline and exact manifest scope:

- `npm run test:all` — 218 Node + 272 browser = 490 passed; 24 conditional skips; 0 failed.
- Visual inspection — 360, 390, 768, and 1280 px.

The four fresh skips are declared project-specific branches in the design-system suite; each corresponding behavior runs in its applicable Chromium or mobile project. They are not failures or missing rehearsal scenarios.

## Design, data, and operational comparison

- Product/test/documentation diff matches every path in the approved manifest: 13/13.
- No schema, state version, collection, migration, backend, dependency, route, or Service Worker architecture was added.
- `compasso.state.v3`, IndexedDB, exact localStorage fallback, JSON backup/restore, Markdown/vault, Evidence Recall, and existing Session semantics remain compatible.
- `app-manifest.js` advances the visible/cache generation to v83; cache ownership remains manifest-driven.
- The old immediate `session.startDefault` command remains available; the rehearsal uses the additive confirmed-start path.
- Rehearsal answers are deliberately ephemeral and are discarded at start, cancel, navigation, or reload.

## Deviations and residual risks

- No functional deviation from the approved Design remains.
- Installed-PWA behavior in a physically installed standalone window remains a human platform check; the controlled cached-shell offline browser contract passes.
- Remote CI and deployment state were not checked and are not claimed.
- Commit, push, PR, merge, deployment, publication, and release were not performed.

## Lessons captured

1. Acceptance evidence must execute the user action named by the criterion; exercising a nearby submit path is not evidence for skip.
2. Responsive conformance needs computed-layout or positional proof because selector specificity can silently override an apparently correct rule.
3. Reload coverage does not substitute for SPA navigation, especially while a durable write is pending; both success and failure completion must be tested after abandonment.

## Gate

**PASS.** Delivery 3 may be archived as Shipped. Working SDD copies are retained for review; the archive is the immutable closure record.
