# Weekly Review positiva + KEEP — Define

**Delivery:** 4 — Weekly Review positiva + KEEP
**Status:** Shipped
**Design gate:** PASS — `.sdd/features/weekly-review-positive/DESIGN.md` is Ready for Build with a closed nine-path manifest.
**Build gate:** PASS — 19/19 acceptance criteria and the canonical local regression passed; see `.sdd/reports/weekly-review-positive/BUILD_REPORT.md`.
**Roadmap:** Psicocibernética → Compasso
**Priority:** P0
**Date:** 2026-09-20
**Baseline:** `origin/main@2c67b2ba40a54e84842daa18674ad45c0683e636`
**Predecessor:** Delivery 3 — Ensaio da Próxima Tentativa, merged by PR #84

## 1. Purpose

Evolve the existing Weekly Review so it captures not only gaps and changes, but also successful responses that deserve repetition and factual Evidence that changed the learner's perception of what they can do.

The delivery must preserve the review as a decision surface. It must not become a positivity diary, confidence dashboard, personality analysis, or motivational score.

## 2. Problem and user

The current Weekly Review already consolidates activity, Evidence, capability context, general reflection, priorities, and explicit `keep` or `revise` decisions. Its general questions, however, do not explicitly ask the learner to identify a behavior that worked and deserves repetition or to record whether concrete Evidence changed their perception of their own capability.

The target user is the same local-first learner who closes a week by examining real activity and deciding what to maintain or revise. The user needs positive learning to remain grounded in verifiable experience and under explicit control.

## 3. Desired outcome

For a new or editable Weekly Review, the learner can optionally answer:

1. **O que funcionou esta semana e merece ser repetido?**
2. **Alguma evidência mudou sua percepção sobre o que você consegue fazer?**

The answers support, but never infer, the learner's explicit decisions:

```text
FUNCIONOU
→ KEEP

NÃO FUNCIONOU
→ REVISE
```

`KEEP` continues to mean preserving the current attempt. `REVISE` continues to mean explicitly defining a changed next attempt. Free text must never automatically classify, change, or create either decision.

## 4. Prioritized goals

### P0

1. Add the two exact optional reflection prompts to the Weekly Review flow.
2. Preserve explicit learner ownership of every `keep` or `revise` decision.
3. Preserve the established semantics and atomic persistence behavior of capability decisions.
4. Keep historical reviews readable without automatically reclassifying old answers as responses to the new prompts.
5. Preserve local-first durability, offline use, backup/restore, accessibility, and small-viewport behavior.

### Success measures

- Both prompts are present and unambiguous in a new review.
- A review can still be concluded when either or both new answers are empty, subject only to pre-existing required capability decisions.
- Non-empty answers survive save, reload, offline reopen, edit, JSON export, and JSON restore.
- Old reviews open with their original content and meaning intact.
- No answer selects, changes, or fabricates `keep`, `revise`, Capability, next attempt, Evidence, learningSignal, or identity attribute.
- No new happiness, confidence, self-esteem, or capability score appears.
- Existing Weekly Review, Session, Evidence, Today focus, and Capability regressions remain green.

## 5. Scope

### In scope

- The current Weekly Review route and form.
- The two exact optional prompts.
- Creation, update, reload, and historical rendering of the responses.
- Existing explicit `keep` and `revise` decisions for Capability reflections.
- Compatibility with old `weeklyReviews` records.
- JSON backup/restore and existing local persistence paths.
- Offline/PWA operation with the already cached application shell.
- Keyboard, focus, labels, touch targets, 360–390 px layout, and 200% zoom.
- Documentation and proportional automated tests.

### Out of scope

- A new route, dashboard, journal, or review system.
- Automatic classification of free text as `keep` or `revise`.
- Automatic creation or mutation of Capability, nextAttempt, Evidence, calibration, or learningSignal from either answer.
- Happiness, confidence, self-esteem, capability, or psychological scores.
- AI analysis, generated motivational language, embeddings, similarity search, or personality inference.
- Gamification, badges, streaks, notifications, or positivity analytics.
- Changes to Session, rehearsal, Evidence Recall ranking, Caderno de Erros, Behavioral Experiments, or Pressure Simulation.
- Backend, login, cloud sync, external integration, framework, or dependency changes.
- Broad visual redesign or unrelated refactoring.
- Removal or reinterpretation of the existing weekly quality field.

## 6. Requirements

### R-01 — Successful pattern prompt

The Weekly Review must ask exactly: **“O que funcionou esta semana e merece ser repetido?”**

### R-02 — Evidence-based perception prompt

The Weekly Review must ask exactly: **“Alguma evidência mudou sua percepção sobre o que você consegue fazer?”**

### R-03 — Optional completion

Each new answer must be optional. Empty answers must not introduce a new blocker to creating or updating a review.

### R-04 — Explicit save only

An answer becomes durable only through the existing explicit Weekly Review save/update action and a confirmed durable write.

### R-05 — KEEP semantics

`keep` must continue to preserve the current attempt text, identity, `futureUse`, and applicable timestamps according to the existing contract.

### R-06 — REVISE semantics

`revise` must continue to require an explicit new attempt and update it through the existing atomic candidate-state flow.

### R-07 — No inference

Neither new answer may select, suggest as already selected, or automatically change `keep` or `revise`. The application must not infer a decision from positive or negative wording.

### R-08 — Historical meaning

Existing reviews must keep their original text and field meaning. The application must not automatically treat a historical answer to another prompt as an answer to either new prompt.

### R-09 — Evidence remains factual context

Existing Evidence may continue to inform the review, but the new perception answer must remain learner-authored. The application must not generate a conclusion about capability or identity.

### R-10 — Durable compatibility

New answers must follow the existing IndexedDB-first persistence, exact localStorage fallback, JSON backup/restore, merge, and offline contracts. Old backups must remain restorable.

### R-11 — Failure recovery

If persistence fails, the last durable state must remain authoritative, related Capability/attempt data must remain unchanged, and the unsaved review draft must remain available for retry.

### R-12 — Existing review behavior

Week calculation, historical navigation, activity/Evidence summaries, priorities, Today focus integration, existing general content, quality field, and editable Capability decisions must continue to work.

### R-13 — Accessible responsive use

The two prompts must have explicit labels, logical focus order, visible focus, usable touch targets, and no global horizontal overflow on supported mobile and zoom conditions.

### R-14 — No new score or psychological label

The delivery must not add or derive a numerical/qualitative happiness, confidence, self-esteem, capability, or psychological classification.

## 7. Business rules

1. The learner is the sole owner of `keep` and `revise` decisions.
2. “Worked” means something the learner explicitly records as worth repeating; the application does not judge it.
3. An Evidence-based perception response is a reflection on concrete history, not a permanent personality trait.
4. Empty new answers are valid and remain distinguishable from answers that were never part of an older review version.
5. Saving a review must remain atomic with any explicit Capability decision performed in that save.
6. An old review must never acquire synthesized answers during normalization, restore, render, or export.
7. Reopening and editing a review must not silently change old fields, Capability decisions, or next attempts.
8. Existing required Capability decisions remain required where the current contract already requires them; optionality applies to the two new reflection answers.
9. The existing weekly quality selection is preserved as-is and must not be renamed or interpreted as confidence/happiness by this delivery.

## 8. Constraints

- Static vanilla-JavaScript PWA; no production framework or backend.
- Local-first and fully usable from a complete offline cache.
- Reuse the existing Weekly Review route, save action, persistence owner, and design system.
- No runtime-injected feature styles may be added; durable presentation belongs to the existing static design-system architecture if styling changes are required.
- No top-level state schema change is authorized by this Define.
- Design must first evaluate reuse of the existing `weeklyReviews` record and its per-record versioning.
- A migration may be proposed only if historical semantic separation cannot be achieved safely without it.
- Any proposed migration must be idempotent, preserve old data, keep old backup restore valid, define forward rollback, and receive explicit Design approval before Build.
- Service Worker architecture must remain unchanged unless Design proves a cache-composition requirement; generation remains manifest-owned.
- No new runtime dependency or external service.

## 9. Dependencies

- `weekly-review-feature.js` — current review UI, rendering, save/update, rollback, priorities, and Capability decisions.
- `capability-context-model.js` — canonical `keep`/`revise` reflection semantics.
- `learning-outcome-model.js` — next-attempt update semantics.
- `storage.js`, `state-foundation.js`, and current save/restore contracts.
- `app-manifest.js` and existing PWA composition/cache generation.
- `docs/weekly-review-feature.md` and `docs/capability-first-compasso.md`.
- Current Node and Playwright regression suites.

## 10. Assumptions

- The current Weekly Review remains the only owner of weekly closure records.
- The two prompts apply to the review as a whole, not once per Capability, unless Design evidence demonstrates that the current product contract requires another placement.
- Existing Evidence display is sufficient context for the MVP; no new recall ranking or Evidence picker is required.
- Existing `keep`/`revise` controls already satisfy the intended decision vocabulary and should be preserved rather than duplicated.
- Historical semantic preservation is more important than minimizing the number of optional record properties.
- The existing quality field is unrelated legacy behavior and remains outside this delivery.

## 11. Open design decisions

These do not block requirements clarity but must be resolved by repository-grounded Design:

1. Whether the current general fields can represent the new prompts without reclassifying historical answers.
2. If not, whether additive optional properties plus the existing per-review `schemaVersion` are sufficient without a top-level state migration.
3. The exact placement and visual grouping that best expresses `FUNCIONOU → KEEP` and `NÃO FUNCIONOU → REVISE` without adding a competing decision system.
4. The minimum manifest of source, documentation, and tests needed for the slice.

## 12. Acceptance scenarios

### AC-01 — Successful-pattern question is present

**Given** a learner opens a new Weekly Review, **when** the form renders, **then** the exact question “O que funcionou esta semana e merece ser repetido?” is available with an explicit label.

### AC-02 — Evidence-perception question is present

**Given** a learner opens a new Weekly Review, **when** the form renders, **then** the exact question “Alguma evidência mudou sua percepção sobre o que você consegue fazer?” is available with an explicit label.

### AC-03 — Empty answers do not block closure

**Given** both new answers are empty and every pre-existing required Capability decision is valid, **when** the learner saves, **then** the review can be created or updated successfully.

### AC-04 — One or both answers can be saved

**Given** the learner fills either or both new answers, **when** durable save succeeds, **then** only the entered answers are stored on that review and render identically when reopened.

### AC-05 — KEEP remains explicit

**Given** a current Capability reflection, **when** the learner explicitly selects `keep` and saves successfully, **then** the current attempt and its established metadata remain unchanged and the decision is recorded as `keep`.

### AC-06 — REVISE remains explicit

**Given** a current Capability reflection, **when** the learner explicitly selects `revise`, provides a valid new attempt, and saves successfully, **then** the attempt changes through the existing atomic flow and the decision is recorded as `revise`.

### AC-07 — Reflection text never infers a decision

**Given** a new answer contains clearly positive or negative wording, **when** the form is rendered, edited, saved, restored, or reopened, **then** no `keep` or `revise` decision is selected or changed because of that wording.

### AC-08 — Historical reviews keep original meaning

**Given** a review created before Delivery 4, **when** it is opened in the new application, **then** all original text remains readable under its original meaning and neither new question is populated by automatic reinterpretation.

### AC-09 — Historical update is explicit

**Given** an old review is open, **when** the learner explicitly answers a new question and saves, **then** the new answer becomes durable without rewriting unrelated historical fields or decisions.

### AC-10 — Existing fields remain stable

**Given** a current or historical review with priorities, quality, blockers, decisions, and Capability reflections, **when** it is opened and saved without changing those values, **then** their stored meaning and values remain intact.

### AC-11 — Persistence failure rolls back

**Given** the learner has entered new answers and durable save fails, **when** failure is reported, **then** no partial review or Capability mutation becomes authoritative, the last durable state remains intact, and the draft is available for retry with accessible error focus.

### AC-12 — Reload and edit

**Given** a successful review containing one or both new answers, **when** the page reloads and the learner returns to the same week, **then** the exact saved answers are present and can be updated explicitly.

### AC-13 — Backup and restore

**Given** a state containing the new answers, **when** it is exported to JSON, cleared through the existing supported test workflow, restored, and exported again, **then** the answers and all unrelated review/Capability data round-trip unchanged.

### AC-14 — Old backup compatibility

**Given** a valid backup created before Delivery 4, **when** the new application restores it, **then** the review remains valid, no synthetic new answer appears, and a subsequent backup remains restorable.

### AC-15 — Offline use

**Given** the complete application shell is cached and the device is offline, **when** the learner opens, saves, reloads, and reopens the Weekly Review, **then** the new answers and existing decisions behave according to the same local durability contract.

### AC-16 — Mobile and zoom

**Given** a 360 px or 390 px viewport, coarse pointer, or 200% zoom, **when** the new prompts are used, **then** labels, text areas, decisions, and save action remain readable and operable without global horizontal overflow.

### AC-17 — Keyboard and focus

**Given** keyboard-only interaction, **when** the learner moves through the review, saves, or encounters a persistence error, **then** focus order is logical, focus remains visible, and success/error focus follows the established review contract.

### AC-18 — No score or identity classification

**Given** any combination of new answers and Evidence, **when** the review is rendered or saved, **then** no new happiness/confidence/capability score, identity trait, motivational message, or psychological classification is produced.

### AC-19 — No unrelated owner is mutated

**Given** the learner saves or edits the new answers, **when** the operation succeeds, **then** Session, Evidence, learningSignals, rehearsal data, unrelated Capabilities, Notes/vault data, and other protected domains remain unchanged except for already-authorized explicit review effects.

## 13. Error and recovery scenarios

- Missing or malformed optional new properties must degrade to empty answers without invalidating the review.
- Invalid historical review content must remain isolated by existing normalization rules; the delivery must not delete unrelated data.
- Failed IndexedDB write may succeed only through the existing exact localStorage fallback contract; if both fail, the operation fails and rolls back.
- Interrupted or repeated save must not duplicate a weekly review or apply Capability changes twice.
- Restore of a pre-delivery backup must not fabricate answers or silently upgrade their meaning.
- A deleted, archived, or changed Capability continues to follow existing read-only/stale-context behavior.
- Offline cache failure must use existing PWA recovery behavior and must not clear user data.

## 14. Current-state evidence

Repository inspection at `2c67b2ba40a54e84842daa18674ad45c0683e636` found:

- `weeklyReviews` is already a manifest-owned collection.
- `weekly-review-feature.js` already owns general fields, create/update, draft restoration, priorities, and atomic candidate-state save.
- `weeklyReviews[].capabilityReflections` already records explicit `keep` or `revise` decisions.
- `capability-context-model.js` already validates decision vocabulary and requires explicit revised text.
- The current general fields are `wins`, `lessons`, `blockers`, `decision`, `quality`, and `priorities`.
- Existing documentation and browser coverage already protect historical navigation, Evidence context, `keep`/`revise`, failure rollback, PWA offline use, and Today focus integration.
- `.codegraph/` is absent in this clean worktree, so source, tests, documentation, and manifest are authoritative.

Baseline on 2026-09-20:

- `npm test` — 218 passed, 0 failed, 0 skipped.
- `npm run build:test` — PASS.
- Focused Weekly Review browser flow — 1 passed, 0 failed.
- The first browser attempt did not start because the isolated worktree lacked `@playwright/test`; `npm ci` installed only the three lockfile-defined test packages, after which the focused test passed.
- `npm audit` reports two pre-existing high-severity development dependency findings; remediation is outside this frozen-dependency delivery.

## 15. Migration assessment

No top-level schema migration is justified at Define.

The current record already has a per-review `schemaVersion`, and the existing state/backup system preserves additive properties. However, direct reuse of existing fields is not automatically approved because AC-08 forbids reclassifying old answers. Design must compare:

1. safe reuse with unambiguous historical rendering;
2. additive optional fields on the existing review record;
3. only if unavoidable, an explicit per-record version transition with idempotent handling.

Any option must keep old backups valid, avoid synthetic content, and define rollback without clearing local data.

## 16. Verification strategy expected from Design

- Node contract tests for record semantics, compatibility, and no inference.
- Browser tests for new/old review, empty/partial/full answers, explicit `keep`/`revise`, edit, save failure, reload, and focus.
- Persistence tests for IndexedDB, exact localStorage fallback, interrupted write, and duplicate prevention.
- JSON old-backup and new round-trip coverage.
- Offline cached-shell review save/reload coverage.
- Mobile 360/390 px, 200% zoom, keyboard, labels, focus, and touch targets.
- Regression of Today focus, Capability reflection, Evidence display, historical weeks, Session/Evidence ownership, and protected data.
- Manifest/cache generation test only if a production asset changes.

## 17. Clarity score

| Dimension | Score | Evidence |
|---|---:|---|
| Problem | 3/3 | The missing positive/evidence-based reflection is explicit and bounded within the existing review. |
| Users | 3/3 | The local-first learner and weekly decision context are explicit. |
| Goals | 3/3 | Two exact prompts, optionality, and preserved decision semantics are specified. |
| Success | 3/3 | Nineteen measurable happy, boundary, failure, compatibility, offline, and accessibility scenarios are defined. |
| Scope | 3/3 | In-scope, non-scope, schema boundary, data owners, and prohibited expansions are explicit. |

**Total:** 15/15 — Ready for Design.

## 18. Gate result

**PASS — Define met the Design entry gate. Current lifecycle status: Complete (Built).**

No production code, persisted schema, Service Worker, runtime dependency, commit, push, merge, deployment, or publication was changed by this phase.

The Design and Build are complete. The next valid phase is `$sdd-ship` using `.sdd/features/weekly-review-positive/DESIGN.md` and `.sdd/reports/weekly-review-positive/BUILD_REPORT.md` as the verification contract.
