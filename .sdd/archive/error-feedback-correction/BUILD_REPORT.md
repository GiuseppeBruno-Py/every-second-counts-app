# Error → Feedback → Correction — Build Report

**Delivery:** 5 — Error → Feedback → Correction
**Status:** SHIP PASS — Ready for Git integration
**Baseline:** `origin/main@5e3d8d2ce2e988e94f1b057adf42382b45152def`
**Branch:** `codex/error-feedback-correction`
**Build date:** 2026-09-21
**Design:** closed 10-path implementation/test manifest

## Outcome

The existing Caderno de Erros now separates five meanings without creating a new route or data owner: observed fact, optional learner interpretation, optional testable hypothesis, correction, and next attempt. Existing `context`, `correction`, and `nextAction` properties retain ownership; only optional `interpretation` and `hypothesis` strings were added on explicit version-2 saves.

Version-1 and contextual-gap records remain valid and are not rewritten while being read. Weak-topic capture keeps its existing factual prefill, link, and source-card provenance while leaving the two learner-authored fields empty. Resolve, reopen, and delete preserve or remove only the selected record.

Manual save now uses a detached candidate, waits for the existing local persistence contract, and closes only after durable success. A failed IndexedDB/localStorage attempt restores the previous state, keeps the complete draft visible, prevents duplicate submission, and allows retry. State remains `compasso.state.v3`; no store, storage key, top-level collection, migration runner, dependency, backend, or Service Worker implementation changed. The manifest generation advances from v84 to v85.

## Manifest completion

All **10/10** Design-authorized implementation/test paths were completed:

1. `weakness-feature.js` — v2 fields, exact five-stage UI/rendering, candidate save/rollback, duplicate guard, and dialog focus/accessibility.
2. `app-manifest.js` — cache generation v84 → v85 only.
3. `docs/weakness-error-notebook-feature.md` — structure, compatibility, failure, backup/offline, and non-inference contract.
4. `docs/capability-first-compasso.md` — correction loop integrated without automatic Capability mutation.
5. `tests/weakness-contract.test.js` — exact labels/fields, candidate durability, contextual writer compatibility, and prohibited-domain guards.
6. `tests/app-manifest.test.js` — v85 ownership assertion.
7. `tests/browser/error-feedback-correction-flows.spec.js` — create/edit/reload, optional/cancel, legacy, weak-card source, CRUD isolation, failure/retry, and backup compatibility.
8. `tests/browser/full-visual-revamp-flows.spec.js` — populated five-stage visual variants.
9. `tests/browser/design-system-flows.spec.js` — dialog semantics, focus, Escape, mobile targets, viewport, and 200% zoom.
10. `tests/browser/pwa-lifecycle-flows.spec.js` — structured record across controlled cached offline reload.

This report and Define/Design lifecycle status updates are SDD evidence outside the ten-path implementation count. No frozen implementation path changed.

## Meaningful implementation decisions

- Reused `context`, `correction`, and `nextAction`; no parallel error model was introduced.
- Added `interpretation` and `hypothesis` as optional per-record properties rather than a global state migration.
- Reads are presence-based and non-mutating, so valid forward-preserved properties remain visible even on older record versions.
- Kept `context-learning-feature.js` as an unchanged version-1 writer; it never synthesizes a learner interpretation or hypothesis.
- Used the existing `saveData()` boolean durability result and a detached clone inside the feature owner instead of changing shared storage infrastructure.
- Added no CSS; the existing global notebook-dialog contract handles bounded scrolling and responsive layout.
- A test audit added explicit weak-card provenance and resolve/reopen/delete scenarios after the canonical run. Production code was unchanged by that audit; the expanded dedicated suite and Node suite were rerun green.

## Validation evidence

| Command | Exit | Result |
| --- | ---: | --- |
| `node --test tests/weakness-contract.test.js tests/app-manifest.test.js` before implementation | 1 | Expected red: 12 passed, 3 failed for v85, v2 fields, and durable candidate save |
| `node --test tests/weakness-contract.test.js tests/app-manifest.test.js` | 0 | 15 passed, 0 failed |
| `npx playwright test tests/browser/error-feedback-correction-flows.spec.js --retries=0` | 0 | Expanded final suite: 14 passed across desktop/mobile |
| `npx playwright test tests/browser/design-system-flows.spec.js -g "Caderno de erros" --retries=0` | 0 | 2 passed across desktop/mobile |
| `npx playwright test tests/browser/full-visual-revamp-flows.spec.js -g "weakness validation" --project=chromium --retries=0` | 0 | 1 passed |
| `npx playwright test tests/browser/pwa-lifecycle-flows.spec.js -g "controlled complete cache" --project=chromium --retries=0` | 0 | 1 passed, including cached offline persistence |
| `npm test` | 0 | 223 passed, 0 failed, 0 skipped after final test audit |
| `npm run test:browser` | 0 | 296 passed, 24 project-conditional skips, 0 failed; full desktop/mobile regression |
| `npm run build:test` | 0 | v85 fixture composed successfully (also run by the canonical browser command) |
| `git diff --check` | 0 | No whitespace errors; only line-ending conversion notices |

No standalone lint, formatter, type-check, or production bundle command is configured. `npm ci` installed only lockfile-declared development packages and did not change package files; npm reported two pre-existing high-severity audit findings, which were not modified or auto-fixed.

The first browser red run left its temporary Python server orphaned after interruption and returned `ERR_EMPTY_RESPONSE`. The exact temporary process was stopped, and all subsequent focused and canonical browser runs completed normally. This was test infrastructure, not a product failure.

## Acceptance reconciliation

| AC | Status | Evidence |
| --- | --- | --- |
| AC-01 | Pass | Exact labels and DOM order protected by Node and browser tests. |
| AC-02 | Pass | v2 create stores all five stage values. |
| AC-03 | Pass | Empty interpretation/hypothesis explicitly persist as valid strings. |
| AC-04 | Pass | Cancel and Escape create no record and return focus. |
| AC-05 | Pass | Reload/edit preserves id, creation timestamp, and stored values. |
| AC-06 | Pass | v1 renders empty optional fields without mutation. |
| AC-07 | Pass | Explicit edit upgrades the same legacy record to v2 and preserves unknown fields. |
| AC-08 | Pass | Contextual writer remains v1 and cannot fabricate the new meanings. |
| AC-09 | Pass | Weak-card prefill, link, source-card provenance, and empty optional fields verified. |
| AC-10 | Pass | Resolve/reopen changes only status timestamps and preserves structured content. |
| AC-11 | Pass | Confirmed delete removes one record and preserves protected Notes/Evidence state. |
| AC-12 | Pass | Current v2 JSON export/restore round-trip preserves both new fields. |
| AC-13 | Pass | v1 backup restores without fabricating properties; broader restore regressions pass. |
| AC-14 | Pass | Double-submit guard, prior-state rollback, exact draft retention, accessible error, and retry verified. |
| AC-15 | Pass | Controlled complete-cache offline reload retains and renders the structured record; manifest v85 verified. |
| AC-16 | Pass | Dialog naming, labels, focus order, initial focus, Escape, and focus return pass. |
| AC-17 | Pass | 360/390 px, 200% zoom, scroll bounds, and mobile touch target pass. |
| AC-18 | Pass | No score, trait, psychological domain, inference, signal creation, or Capability mutation exists. |
| AC-19 | Pass | Full Node/browser regression passes; shared owners, ranking, state v3, storage, and Service Worker remain unchanged. |

**Totals:** 19 Pass, 0 Partial, 0 Fail, 0 Not run.

## Deviations, blockers, and residual risks

No requirement, architecture, data, schema, dependency, file-manifest, or product-scope deviation occurred. No blocker remains.

Residual limits:

- Automated Chromium desktop/mobile and controlled PWA-offline evidence passed; installed-PWA behavior on a physical device remains a human platform observation, not an automated Build gate.
- Remote GitHub CI has not run yet because no commit or PR exists at Build time.
- Forward rollback must use a later cache generation and preserve unknown `errorNotebook` properties; clearing local storage is not an acceptable rollback.

No staging, commit, push, merge, deployment, or publication occurred during Build.

**Build gate: PASS — Ready for Ship.**
