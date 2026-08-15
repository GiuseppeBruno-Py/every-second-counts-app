# BUILD REPORT: Retrieval R1 — Match retrieval to future use

## Metadata

| Field | Value |
|---|---|
| Feature | `retrieval-r1` |
| Date | `2026-08-12` |
| Branch | `codex/retrieval-r1-brainstorm` |
| Baseline HEAD | `6047c5fb32aad66ff2892ca4fdbbc7ca5f28ba65` |
| Build status | **PASS** |
| Define | `.sdd/features/retrieval-r1/DEFINE.md` — Complete (Built) |
| Design | `.sdd/features/retrieval-r1/DESIGN.md` revision 1.1 — Complete (Built) |
| State contract | `compasso.state.v3` unchanged |
| PWA generation | `compasso-pages-v76` |

## Summary

Retrieval R1 is implemented inside the closed Design manifest. The current Next Attempt optionally owns `futureUse`; an execution takes an immutable copy through the existing `learningContext`; Hoje, Session/Deep Work, Session Companion, Evidence, and Weekly Review project current or historical intent from the appropriate owner. Absence remains canonical omission. No collection, migration, route, persistence envelope, external dependency, Active Recall behavior, or Service Worker architecture was added.

The first canonical run exposed a real initialization-order defect in the authorized Deep Work projection: an active-session reload invoked `deepRender()` before the lexical `learningOutcomeModel` binding initialized. The projection was changed to the already-published optional global model API. The two affected recovery flows then passed in Chromium and mobile, and the full canonical rerun passed.

The skill's referenced Build-report template was not present in this checkout. This report follows the established repository Build-report sections and evidence conventions instead.

## Manifest execution

### Product files changed (10/10)

| Path | Implemented responsibility |
|---|---|
| `learning-outcome-model.js` | Seven frozen values/presentations, tolerant load normalization, strict command validation, atomic attempt update/clear, execution snapshot |
| `learning-outcome-feature.js` | Optional native select/help, draft/error behavior, current/historical labels, nested command payload |
| `today-feature.js` | Current-value projection and shared execution-context creation without ranking changes |
| `sessions-feature.js` | Shared snapshot for capability/resource starts and read-only start context |
| `deep-work-feature.js` | Stored snapshot projection across setup, execution, reload, and recovery |
| `session-companion-feature.js` | Read-only label from the active stored execution snapshot |
| `evidence-feature.js` | Historical projection through canonical `sessionId`; Evidence shape unchanged |
| `weekly-review-feature.js` | Separate historical/current labels and atomic revise select; keep unchanged |
| `design-system.css` | Durable responsive, focus, select, and wrapping styles |
| `app-manifest.js` | Forward cache generation `compasso-pages-v76` |

### Test files changed (10/10)

- `tests/learning-outcome-model.test.js`
- `tests/execution-session-model.test.js`
- `tests/deep-work-model.test.js`
- `tests/state-foundation.test.js`
- `tests/app-manifest.test.js`
- `tests/browser/learning-outcome-flows.spec.js`
- `tests/browser/capability-context-flows.spec.js`
- `tests/browser/information-architecture-flows.spec.js`
- `tests/browser/design-system-flows.spec.js`
- `tests/browser/pwa-lifecycle-flows.spec.js`

### Documentation changed (6/6)

- `docs/capability-first-compasso.md`
- `docs/today-feature.md`
- `docs/sessions-feature.md`
- `docs/evidence-feature.md`
- `docs/weekly-review-feature.md`
- `docs/active-recall-feature.md`

### SDD artifacts

- `.sdd/features/retrieval-r1/BRAINSTORM.md` — preserved unchanged from the pre-existing user work.
- `.sdd/features/retrieval-r1/DEFINE.md` — status advanced to Complete (Built); acceptance contract unchanged.
- `.sdd/features/retrieval-r1/DESIGN.md` — status/revision advanced to Complete (Built); manifests unchanged.
- `.sdd/reports/retrieval-r1/BUILD_REPORT.md` — created as Build evidence.

No product or test path outside the exact 10 + 10 closed manifests changed. No file was deleted, staged, committed, pushed, deployed, or published.

## Implemented contract

### Representation and validation

- Current owner: `learningOutcome.nextAttempt.futureUse?`.
- Historical owner: `executionSession.learningContext.futureUse?`.
- Supported values: `remember`, `explain`, `solve`, `build`, `decide`, `simulate`, `integrate`.
- Absence is an omitted property; `null`, empty string, `unspecified`, and translated labels are not persisted.
- Loaded unknown values degrade only the optional field to absence and normalize idempotently.
- Explicit invalid create/update input throws `future-use-invalid` before candidate persistence.
- Legacy string updates preserve an existing value; object commands preserve, replace, or explicitly clear it under existing attempt identity/timestamp rules.

### Snapshot and historical integrity

`createExecutionContext()` copies `outcomeId`, `attemptId`, `attemptText`, and optional `futureUse`. Normal Session and Deep Work reuse the existing source-to-canonical synchronization. Edits, clears, archiving/deletion, review decisions, reload, interruption, and missing-source completion do not re-resolve or rewrite stored snapshots.

### Surface behavior

- Hoje shows the current `Uso pretendido` as secondary context without duplicating the action or changing precedence/fallback.
- Global Executar retains resume → valid attempt → other action → planning fallback. Values never route to Active Recall or another mode.
- Session and Deep Work start with existing defaults/configuration and show only the stored snapshot; no extra classification step exists.
- Session Companion reads the active stored execution context and owns no data.
- Evidence remains unchanged and projects historical intent only through `Evidence.sessionId` → canonical execution.
- Weekly Review distinguishes `Uso nas execuções` from `Uso da tentativa atual`. Keep does not mutate; revise atomically updates/clears the current attempt only.
- Active Recall, Weakness/Error Notebook, Contextual AI, Notes/vault/wikilinks, Relations/graph, Studies, and Readings remain non-owning and behaviorally unchanged.

## Validation evidence

### Focused validation

| Command/scope | Result |
|---|---|
| `node --test` on the five closed Node suites | **62 passed, 0 failed** |
| Four affected browser suites, Chromium | **36 passed, 4 skipped, 0 failed** |
| Four affected browser suites, mobile | **38 passed, 2 skipped, 0 failed** |
| PWA lifecycle suite, both configured projects | **10 passed, 10 expected mobile skips, 0 failed** |
| Deep Work reload/missing-source regression after correction, Chromium + mobile | **4 passed, 0 failed** |
| `npm run build:test` | **PASS**; manifest composition succeeded |

### Canonical validation

`npm run test:all` final rerun:

- Node: **191 passed, 0 failed, 0 skipped**.
- Browser: **165 passed, 0 failed, 19 skipped**.
- Total executed passes: **356**.
- Final exit code: **0**.

The earlier canonical attempt had 191 Node passes and four browser failures in two Deep Work recovery tests across Chromium/mobile. Evidence showed `Cannot access 'learningOutcomeModel' before initialization`. That product defect was corrected within `deep-work-feature.js`, an authorized manifest path; the tests were not weakened or modified.

## Acceptance evidence (25/25)

| Scenario | Status | Implemented/evidence |
|---|---|---|
| AT-01 | PASS | Create/select/reload persists `solve` and label only on the attempt |
| AT-02 | PASS | Empty choice omits the property and remains executable |
| AT-03 | PASS | `explain` → `build` updates atomically under the same attempt ID |
| AT-04 | PASS | Explicit clear returns to canonical omission without inference |
| AT-05 | PASS | Unknown loaded value is isolated; repeated normalization is identical |
| AT-06 | PASS | Hoje projects one `decide` secondary label without duplicated action |
| AT-07 | PASS | Resume/order/completed/stale precedence is unchanged with or without value |
| AT-08 | PASS | Global Execute destination/focus remains unchanged; no automatic routing |
| AT-09 | PASS | Immediate normal Session uses defaults and stored `build` snapshot |
| AT-10 | PASS | Deep Work uses existing configuration and stored `simulate` snapshot |
| AT-11 | PASS | Source/canonical contexts contain the exact four-field snapshot |
| AT-12 | PASS | Edit/clear/archive/delete/review never rewrites historical snapshot |
| AT-13 | PASS | Evidence projects historical `explain` through canonical execution |
| AT-14 | PASS | Evidence has no duplicated context field; `sessionId` survives round-trip |
| AT-15 | PASS | Weekly Review separates historical executions from current attempt intent |
| AT-16 | PASS | Keep preserves text, value, identity, timestamps, and history |
| AT-17 | PASS | Revise changes/clears current text/value atomically and preserves history |
| AT-18 | PASS | Active Recall/Weakness records, schedules, histories, and routes unchanged |
| AT-19 | PASS | Legacy unclassified outcomes/executions remain valid without backfill |
| AT-20 | PASS | Old backup restores capabilities, execution/Evidence, and protected data |
| AT-21 | PASS | New backup round-trip preserves current/history/absence/provenance |
| AT-22 | PASS | Whole-record winner, equal-time conflict, and tombstone behavior retained |
| AT-23 | PASS | v76 shell reopens offline with R1 state and existing local lifecycle |
| AT-24 | PASS | Native selection, help/error semantics, keyboard, and focus contracts pass |
| AT-25 | PASS | Mobile/zoom/coarse-pointer/reduced-motion/overflow contracts pass |

## Error and boundary evidence (10/10)

| Scenario | Status | Implemented/evidence |
|---|---|---|
| ER-01 | PASS | Invalid explicit command throws atomically and targets the form control |
| ER-02 | PASS | Forced capability save failure retains last stored state and draft |
| ER-03 | PASS | Stale/completed/archived/missing Today references remain safe and uninferred |
| ER-04 | PASS | Failed Session/Deep start reports no active source/canonical record |
| ER-05 | PASS | Missing/invalid/legacy/unlinked Evidence context remains readable |
| ER-06 | PASS | Weekly blank/invalid/save-failure paths retain current/history and retry |
| ER-07 | PASS | Equal-time conflict and tombstone semantics remain record-level |
| ER-08 | PASS | Legacy core execution context without value remains valid through reload |
| ER-09 | PASS | Recall, Weakness/Error Notebook, and Contextual AI data/routes stay isolated |
| ER-10 | PASS | Protected knowledge domains, compatible unknown state, and offline data persist |

## Compatibility and non-regression evidence

- `compasso.state.v3` remains the only state contract; no migration/store/key/envelope/collection was introduced.
- IndexedDB/localStorage and JSON backup/restore use existing whole-state paths.
- Merge keeps whole-record timestamp winners, equal-time audit conflicts, and collection tombstones; no field tombstone exists.
- Evidence ownership and canonical `sessionId` provenance are unchanged.
- Legacy unlinked Session/Evidence and missing sources receive no inferred association or value.
- All protected knowledge-domain canaries and canonical regressions passed.
- `app-manifest.js` owns `compasso-pages-v76`; module/catalog/cache ownership and Service Worker architecture tests passed.

## Accessibility, responsive, and offline evidence

The optional control is a labeled native select with associated guidance, focus-visible styling, error focus, and explicit clear. Browser checks cover keyboard operation and focus, 360–390 px, 200% zoom, coarse pointer touch geometry, reduced motion, long labels, and horizontal overflow. PWA lifecycle checks cover generation convergence, offline reopen, local-state continuity, update failure, and non-destructive shell reset.

## Deviations and autonomous decisions

- **Manifest deviation:** None.
- **Acceptance/Design deviation:** None.
- **Implementation correction:** The direct lexical model read in initial Deep Work hydration was replaced with the existing optional global model API to avoid temporal-dead-zone failure before final model initialization. This preserves the Design and requires no new coordinator or timing delay.
- **Environment preparation:** `npm ci` restored the lockfile-defined local Playwright dependency after the first browser invocation reported a missing `@playwright/test`; package/lock files remained unchanged. npm reported two pre-existing high-severity audit findings; no out-of-scope dependency update was attempted.

## Remaining risks and manual gates

- Physical installed-PWA human smoke is not performed during Build; automated shell/offline lifecycle is green.
- Remote Linux CI has not validated this uncommitted tree; local Chromium/mobile validation is green.
- The repository's existing runtime-injected Deep Work CSS remains; all new durable R1 CSS was placed in `design-system.css` as designed.

These are non-blocking for Build and must be reassessed during Ship/release validation.

## Final checklist

- Closed 10-product-file manifest: **PASS**
- Closed 10-test-file manifest: **PASS**
- No unexpected deletions or generated snapshots: **PASS**
- 25/25 acceptance scenarios: **PASS**
- 10/10 error/boundary scenarios: **PASS**
- Canonical validation: **PASS**
- `compasso.state.v3`: **preserved**
- `compasso-pages-v76`: **verified**
- Service Worker architecture: **unchanged**
- Commit/push/merge/deploy/publish/staging: **none**
- Ready for `$sdd-ship`: **Yes**

## Revision history

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-08-12 | Codex | Initial Retrieval R1 Build PASS report with exact manifests, implementation evidence, 25/25 acceptance, 10/10 error/boundary, canonical validation, and residual gates. |
