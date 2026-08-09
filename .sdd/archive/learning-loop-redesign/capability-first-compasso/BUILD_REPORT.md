# Learning Loop Redesign — Build Report

**Delivery:** 3 — Capability-first Compasso
**Status:** SHIP PASS — Ready for Git integration
**Baseline:** `f00e7c1eeeb07ffa9960d20f07b12ab20f22e37c`
**Branch:** `codex/operational-learning-loop-define`
**Build date:** 2026-08-09
**Design:** Delivery 3, closed 20-path implementation/evidence manifest

## Outcome

Capability-first Compasso is implemented as additive projections over the shipped capability, Today, Study, Reading, Session, Evidence, Weekly Review, Results, and Consistency owners. The only new durable collection is `learningSignals`; state remains `compasso.state.v3`, and the existing IndexedDB, JSON backup/restore, Markdown/vault, graph, Contextual AI, and Service Worker architectures remain in place.

Hoje stores an optional complete capability/attempt reference and never owns or mutates the capability. Study/Reading associations remain resource references owned by `learningOutcomes`; resource progress never becomes capability progress. Resource-originated quick and Deep Work sessions reuse the shipped session provenance. Evidence copies no capability context and projects it only through its canonical `sessionId`. Weekly keep/revise decisions are explicit, Results separates Evidence/decisions from supporting activity, and Consistency filters explicit provenance without presenting cadence as capability progress.

The PWA generation advances from `compasso-pages-v72` to `compasso-pages-v73` with no Service Worker architecture change. Legacy unlinked records stay valid and no association is inferred.

## Files changed

All **20/20** Design-authorized implementation/evidence paths were changed:

- New model and contract: `capability-context-model.js`, `docs/capability-first-compasso.md`.
- Runtime projections: `learning-outcome-feature.js`, `today-feature.js`, `sessions-feature.js`, `evidence-feature.js`, `weekly-review-feature.js`, `outcomes-feature.js`, `analytics-feature.js`.
- Persistence/PWA/UI: `index.html`, `state-foundation.js`, `app-manifest.js`, `design-system.css`.
- Node evidence: `tests/capability-context-model.test.js`, `tests/state-foundation.test.js`, `tests/app-manifest.test.js`, `tests/service-worker-composition.test.js`.
- Browser evidence: `tests/browser/capability-context-flows.spec.js`, `tests/browser/information-architecture-flows.spec.js`, `tests/browser/pwa-lifecycle-flows.spec.js`.

This report and the required DEFINE/DESIGN lifecycle status changes are SDD artifacts outside the implementation count. The pre-existing `BRAINSTORM.md` amendment was not edited. No frozen implementation file changed and no file was deleted.

## Persistence and ownership

- Complete references use `{ outcomeId, attemptId, attemptText }`; incomplete shapes normalize to no association.
- `learningOutcomes` remains the owner of the current attempt and Study/Reading `resourceRefs`; `dailyPlan` owns Today completion/removal; Session owners retain execution provenance; Evidence retains only `sessionId`.
- `learningSignals` owns learner-authored or explicitly confirmed `feedback`, `gap`, `question`, and `insight` records with source references, timestamps, conflict metadata, and tombstones.
- Signal creation, update, and deletion are explicit. Deletion writes a tombstone; suggestions do not persist until confirmed; signals never change lifecycle, resource progress, or the current attempt.
- Normalization preserves compatible unknown metadata. Merge selects the newest record, preserves equal-clock conflicts for audit, and prevents tombstone resurrection.
- Missing capability/resource references render safe snapshots or unavailable labels. They are neither inferred nor recreated, and new links require an active capability/current attempt.

## Validation

| Command | Exit | Result |
| --- | ---: | --- |
| `node --test tests/capability-context-model.test.js tests/state-foundation.test.js tests/app-manifest.test.js tests/service-worker-composition.test.js` | 0 | 41 passed, 0 failed, 0 skipped |
| `npm run build:test` | 0 | v73 browser fixture composed successfully |
| `npx playwright test tests/browser/capability-context-flows.spec.js --project=chromium` | 0 | 9 passed, 0 failed, 0 skipped |
| `npx playwright test tests/browser/information-architecture-flows.spec.js` | 0 | 13 passed, 0 failed, 1 intentional viewport skip |
| `npx playwright test tests/browser/pwa-lifecycle-flows.spec.js --project=chromium --grep "controlled complete cache reopens offline"` | 0 | 1 passed, 0 failed, 0 skipped |
| Focused existing Study/Reading/Deep Work browser regressions | 0 | 3 passed, 0 failed, 0 skipped |
| `npm test` | 0 | 181 passed, 0 failed, 0 skipped |
| `npm run test:all` | 0 | 181 Node passed; 144 browser passed; 18 intentional project/viewport skips; 0 failed |
| `git diff --check` | 0 | No whitespace errors |

During implementation, focused tests exposed and resolved three issues before the final green run: the composed-browser fixture needed the new module, an existing execution-summary copy assertion required preservation, and mobile capability buttons measured 39px before the 44px touch-target rule was added.

## Acceptance reconciliation

| AC | Status | Implementation and evidence |
| --- | --- | --- |
| AC-01 Optional association | Pass | Study/Reading/session flows default to no capability; legacy and explicit-unlinked records remain unlinked in model, browser, and full regression tests. |
| AC-02 Capability summary | Pass | Capability cards project Hoje, finalized execution, Evidence, resources, signals, and reflection without percentage/mastery/confidence/completion/score semantics. |
| AC-03 Today opt-in and isolation | Pass | Explicit add/open/start/complete/reopen/remove browser flow changes only `dailyPlan`; missing-reference and persistence rollback paths pass. |
| AC-04 Resource-side association | Pass | Study/Reading association manager updates only outcome `resourceRefs`, supports unlinking, and leaves both records and progress untouched. |
| AC-05 Resource deletion boundary | Pass | Missing references normalize and render as unavailable; model/browser backup evidence confirms no recreation or crash. |
| AC-06 Resource-origin session | Pass | Optional capability selection for quick/Deep sessions preserves resource metrics, canonical provenance, Evidence projection, and capability isolation. |
| AC-07 Legacy execution compatibility | Pass | Existing unlinked session/Evidence tests, canonical full suite, round-trip, editing, review, and history paths remain green with no inferred link. |
| AC-08 Learning signals | Pass | Explicit create/edit/tombstone-delete flows retain available provenance and leave capability, attempt, resources, session, and Evidence unchanged. |
| AC-09 Suggested-signal consent | Pass | Pure-model confirmation boundary and browser save behavior prove that an unconfirmed suggestion creates no durable record or next-attempt decision. |
| AC-10 Deliberate next attempt | Pass | Weekly keep leaves the attempt intact; revise uses the shipped outcome update contract and preserves stable attempt identity/timestamps according to that contract. |
| AC-11 Weekly Review | Pass | Linked executions/Evidence/signals plus unlinked activity remain visible; reflection and keep/revise persist explicitly with no automatic progress. |
| AC-12 Results | Pass | Capability Evidence/decision projection is visually separated from supporting resource activity; resource/time counts are labeled as non-capability metrics. |
| AC-13 Consistency | Pass | All, unlinked, linked, and unavailable filters use explicit session provenance; cadence/streak/duration carries a non-progress disclaimer. |
| AC-14 Archived or unavailable capability | Pass | Historical snapshots survive, unavailable state is safe, and candidate validation prevents new association to archived/missing capabilities. |
| AC-15 Backup and offline round-trip | Pass | State normalization/merge, JSON restore, refresh, and controlled cached-offline browser tests preserve legacy domains, references, signals, and tombstones. |
| AC-16 Contextual AI isolation | Pass | New code has no dependency on Contextual AI or external processing; preserved route/data/assets are covered by manifest/state/browser canaries. |
| AC-17 Future retirement safety | Pass | Contextual AI data/assets remain exportable and cached; documented route fallback is `capabilities`; invalid/missing routes degrade through existing routing. |
| AC-18 Notes and Relations contracts | Pass | Notes/source data, vault metadata, folders, wikilinks, graph derivation modules, JSON restore, and navigable destinations are preserved by canaries and regressions. |
| AC-19 Accessible cross-surface behavior | Pass | Chromium/mobile/200% checks cover labels, focus return, 44px targets, long wrapping, missing-reference meaning, and horizontal overflow. |

**Totals:** 19 Pass, 0 Partial, 0 Fail, 0 Not run.

## Deviations and residual risks

No Design, schema, owner, closed-manifest, or acceptance deviation occurred. No 21st implementation/test path was required.

Residual risks:

- No physical installed-PWA observation or remote Linux CI run occurred during Build; the repository's controlled Chromium offline/update lifecycle passed.
- Ship should independently re-run the 19-AC reconciliation and the canonical suite rather than relying only on this Build evidence.

No commit, staging, push, merge, deployment, publication, or staging modification occurred.

**Build gate: PASS — Ready for Ship.**
