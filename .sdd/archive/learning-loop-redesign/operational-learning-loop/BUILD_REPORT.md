# Learning Loop Redesign — Build Report

**Delivery:** 2 — Operational Learning Loop
**Status:** SHIP PASS — Ready for Git integration
**Baseline:** `7b1196c819fe2375346ceb803143125f8fd4c25c`
**Branch:** `codex/operational-learning-loop-define`
**Build date:** 2026-08-09
**Design:** Revision 1, closed 20-path implementation/evidence manifest

## Outcome

The approved operational loop is implemented through the existing regular Session, Deep Work, canonical Execution Session, and Evidence systems. Outcome-originated sessions persist nullable `{ outcomeId, attemptId, attemptText }` provenance, including an immutable start-time attempt snapshot. Evidence stores no copied provenance and resolves it through `sessionId`.

Outcome-only execution uses `domain: "learningOutcome"` and bypasses every resource metric/progress write. Optional Study/Reading-backed outcome execution continues through the existing metric path without creating capability progress. Completion returns to the capability and shows the relevant attempt, execution result, resource availability, and Evidence summaries.

State remains `compasso.state.v3`; IndexedDB/storage schemas and object stores are unchanged. Legacy sessions/Evidence remain valid and unlinked. The PWA cache generation advances only from v71 to v72.

## Files changed

All **20/20** Design-authorized implementation/evidence paths were changed:

- Models: `learning-outcome-model.js`, `execution-session-model.js`, `deep-work-model.js`, `history-evidence-model.js`.
- Runtime: `sessions-feature.js`, `deep-work-feature.js`, `session-companion-feature.js`, `evidence-feature.js`, `learning-outcome-feature.js`.
- PWA/UI: `app-manifest.js`, `design-system.css`.
- Node evidence: `tests/learning-outcome-model.test.js`, `tests/execution-session-model.test.js`, `tests/deep-work-model.test.js`, `tests/history-evidence-model.test.js`, `tests/state-foundation.test.js`, `tests/app-manifest.test.js`.
- Browser evidence: `tests/browser/learning-outcome-flows.spec.js`, `tests/browser/critical-flows.spec.js`, `tests/browser/pwa-lifecycle-flows.spec.js`.

This report and required Define/Design lifecycle status updates are SDD artifacts outside the implementation count. No frozen implementation file changed.

## Implementation decisions

- `CompassoLearningOutcomeModel` creates and validates the exact context shape.
- Raw regular/Deep sessions persist the context; canonical execution normalization and history preserve it idempotently.
- Existing decorators discard extra `openSessionStart`/`deepOpen` arguments. Test-local diagnosis led to bounded core adapters inside the already-authorized session files; legacy decorated entry points remain unchanged.
- Evidence accepts the neutral target discriminator but has no `learningContext` property.
- Only final `completed`/`interrupted` executions appear as return context.

## Validation

| Command | Exit | Result |
| --- | ---: | --- |
| `node --test tests/learning-outcome-model.test.js tests/execution-session-model.test.js tests/deep-work-model.test.js tests/history-evidence-model.test.js tests/state-foundation.test.js tests/app-manifest.test.js` | 0 | 57 passed, 0 failed, 0 skipped |
| `npm run build:test` | 0 | v72 browser fixture composed successfully |
| `npx playwright test tests/browser/learning-outcome-flows.spec.js --project=chromium` | 0 | 9 passed, 0 failed, 0 skipped |
| `npx playwright test tests/browser/critical-flows.spec.js --project=chromium --grep "sessão rápida\|histórico e evidência\|sessão de Estudo\|sessão de Leitura"` | 0 | 4 passed, 0 failed, 0 skipped |
| `npx playwright test tests/browser/pwa-lifecycle-flows.spec.js --project=chromium --grep "controlled complete cache reopens offline"` | 0 | 1 passed, 0 failed, 0 skipped |
| `git diff --check` | 0 | No whitespace errors |

The first attempted browser command did not execute tests because this isolated worktree lacked declared dev dependencies. `npm ci` installed the lockfile-defined packages without modifying package files; the focused commands then passed. Full Node/browser/canonical suites were deliberately not run during Build and remain the Ship gate.

## Acceptance reconciliation

| AC | Status | Evidence |
| --- | --- | --- |
| AC-01 | Pass | Active capability starts existing quick and Deep Work flows. |
| AC-02 | Pass | Model lifecycle and reload preserve both stable IDs and attempt snapshot. |
| AC-03 | Pass | Archived card has no execution entry; reactivation restores it. |
| AC-04 | Pass | Focused Study/Reading start, metric, Evidence, correction, and progress regressions pass. |
| AC-05 | Pass | No-resource and unavailable-resource outcomes execute without recreation or crash. |
| AC-06 | Pass | Evidence retains identity and resolves context through its session; no copied provenance exists. |
| AC-07 | Pass | Completion returns focus to the capability with execution/Evidence context. |
| AC-08 | Pass | Session/resource completion leaves outcome and current attempt unchanged. |
| AC-09 | Pass | Legacy records repeatedly normalize with null context and no inferred link. |
| AC-10 | Pass | JSON-shaped round-trip/merge preserves context and unrelated domains. |
| AC-11 | Pass | Controlled cached offline reload preserves session context and Evidence. |
| AC-12 | Pass | Labeled controls, focus return, mobile wrapping, and no-overflow evidence pass. |

**Totals:** 12 Pass, 0 Partial, 0 Fail, 0 Not run.

## Deviations and residual risks

No Design, schema, domain, manifest, or acceptance deviation occurred. No 21st implementation/test file was required.

Residual risks:

- Full repository suites and the complete browser matrix are intentionally deferred to independent Ship verification.
- No physical installed-PWA observation or remote Linux CI run occurred during Build; automated controlled offline evidence passed.
- `npm ci` reported two pre-existing high-severity dependency audit findings; dependencies and lockfiles were not changed.

No commit, staging, push, merge, deployment, or publication occurred.

**Build gate: PASS — Ready for Ship.**
