# Weekly Review positiva + KEEP — Design

**Delivery:** 4 — Weekly Review positiva + KEEP
**Status:** Shipped
**Build gate:** PASS — closed nine-path manifest, 19/19 acceptance criteria, and canonical local regression; see `.sdd/reports/weekly-review-positive/BUILD_REPORT.md`.
**Roadmap:** Psicocibernética → Compasso
**Priority:** P0
**Date:** 2026-09-20
**Baseline:** `origin/main@2c67b2ba40a54e84842daa18674ad45c0683e636`
**DEFINE:** `.sdd/features/weekly-review-positive/DEFINE.md` — clarity 15/15

## 1. Purpose

Implement the two optional positive/evidence-based Weekly Review questions as an additive extension of the existing review record and save flow, while preserving historical meaning, explicit `keep`/`revise` decisions, local-first durability, and offline behavior.

This Design is intentionally a small slice. It adds no route, collection, model, migration runner, backend, dependency, score, inference, or automatic learning decision.

## 2. Repository-grounded current state

### Weekly Review owner

`weekly-review-feature.js` currently owns:

- week range and historical navigation;
- activity, Evidence, item, and Capability projections;
- general form fields `wins`, `lessons`, `blockers`, `decision`, `quality`, and `priorities`;
- explicit Capability `keep`/`revise` validation;
- atomic candidate-state save of `weeklyReviews` and related next-attempt changes;
- rollback and draft restoration after persistence failure;
- the `weekly.openDecision` command and success/error focus behavior.

The current per-record constant is `WEEKLY_REVIEW_VERSION = 1`.

### Decision semantics

`capability-context-model.js` owns canonical Capability reflections. It accepts only `keep` and `revise`; both require an explicit valid Capability reference and `decidedAttemptText`. The Weekly Review already keeps `keep` non-mutating and applies `revise` through `learning-outcome-model.js` in the same candidate save.

This owner remains unchanged.

### Persistence and compatibility

`weeklyReviews` is already an array collection in `app-manifest.js`, merged as a whole record by `id` and `updatedAt`. `state-foundation.js` clones and preserves unknown record properties. JSON backup/restore and IndexedDB/localStorage persistence serialize the complete state rather than a fixed Weekly Review field list.

Therefore, additive string properties on the existing record already travel through persistence, backup, restore, sync merge, and rollback without a new top-level schema owner.

### PWA and cache ownership

`app-manifest.js` owns the module list, cached assets, and generation. `service-worker.js` consumes that manifest and does not need a behavior change. Since a cached production module changes, the candidate generation must advance from v83 to v84.

### Existing validation

- `tests/today-central-contract.test.js` already contains a Weekly Review source contract.
- `tests/capability-context-model.test.js` protects `keep`/`revise` semantics.
- `tests/browser/capability-context-flows.spec.js` exercises explicit decisions, failed save rollback, Evidence context, and Results projection.
- `tests/browser/local-data-safety-flows.spec.js` protects restore and unknown-field preservation.
- `tests/browser/pwa-lifecycle-flows.spec.js` exercises a complete cached-shell Weekly Review flow offline.
- `tests/browser/design-system-flows.spec.js` owns keyboard, focus, zoom, touch, and responsive UI checks.

`.codegraph/` is absent in this worktree. Source, tests, documentation, manifest, and CI are authoritative.

## 3. Concrete gap

The current fields cannot safely stand in for the new questions:

- `wins` means “Principal avanço”, not “what worked and deserves repetition”;
- `lessons` means “Aprendizado mais importante”, not “whether Evidence changed perceived capability”.

Relabelling either field would present historical values as answers to questions the learner was never asked. That violates AC-08 and the explicit prohibition on automatic reclassification.

The current record has no distinct owner for the two new answers.

## 4. Target state

Each explicitly saved Delivery 4 review may contain two additional optional strings:

```javascript
{
  // existing fields preserved
  schemaVersion: 2,
  repeatablePractice: "",
  evidenceReflection: ""
}
```

- `repeatablePractice` answers “O que funcionou esta semana e merece ser repetido?”.
- `evidenceReflection` answers “Alguma evidência mudou sua percepção sobre o que você consegue fazer?”.
- Empty strings are valid for a v2 save.
- A historical v1 record without these properties renders both new controls empty.
- Rendering a v1 record performs no mutation and no durable write.
- Only explicit successful save creates or changes the properties and writes `schemaVersion: 2`.
- Neither property is read by Capability decision logic.

## 5. Component responsibilities

### 5.1 `weekly-review-feature.js`

This remains the only production owner changed for the behavior.

Responsibilities:

1. Advance `WEEKLY_REVIEW_VERSION` from 1 to 2.
2. Render a compact positive-reflection group at the beginning of the existing closure form.
3. Add two labelled textareas with stable IDs:
   - `weeklyRepeatablePractice`;
   - `weeklyEvidenceReflection`.
4. Use the exact labels required by R-01 and R-02.
5. Reuse the existing `.weekly-form-grid` and `.field` primitives; add no runtime style and require no CSS modification.
6. Render only valid stored strings; missing, null, array, object, or other malformed values become an empty control without mutating the record.
7. Include both controls in the existing failure-draft snapshot.
8. Trim and place both values into the existing review payload.
9. Keep capability validation and mutation loops completely independent from the new fields.
10. Preserve existing status, success focus, error focus, priorities, quality, and Today focus effects.

### 5.2 `app-manifest.js`

Advance only `cacheName` from `compasso-pages-v83` to `compasso-pages-v84` so controlled/installed clients receive the changed cached Weekly Review module.

No module, asset, collection, route, or state contract changes.

### 5.3 Documentation

`docs/weekly-review-feature.md` documents:

- the two exact optional prompts;
- the additive v2 properties;
- explicit-save behavior;
- v1 historical rendering;
- no inference between text and `keep`/`revise`;
- backup/offline compatibility.

`docs/capability-first-compasso.md` updates the shipped learning-cycle description to include positive Weekly Review consolidation while preserving explicit decisions.

### 5.4 Tests

Tests protect the new contract at source, browser, persistence, offline, responsive, and accessibility levels. Existing canonical suites remain the regression gate.

## 6. Interfaces and data contract

### 6.1 Review record v2

```javascript
{
  id: string,
  schemaVersion: 2,
  weekStart: "YYYY-MM-DD",
  weekEnd: "YYYY-MM-DD",
  wins: string,
  lessons: string,
  blockers: string,
  decision: string,
  quality: number | null,
  priorities: Array<{ domain: string, itemId: string }>,
  capabilityReflections: Array<CapabilityReflection>,
  repeatablePractice: string,
  evidenceReflection: string,
  reviewedAt: ISODateString,
  updatedAt: ISODateString
}
```

The two new properties are optional on input for compatibility and always explicit strings on a successful v2 save.

### 6.2 DOM interface

```text
#weeklyRepeatablePractice
  label: O que funcionou esta semana e merece ser repetido?
  type: textarea
  maxlength: 1000
  required: false

#weeklyEvidenceReflection
  label: Alguma evidência mudou sua percepção sobre o que você consegue fazer?
  type: textarea
  maxlength: 1000
  required: false
```

The 1000-character limit matches the established Capability reflection limit and allows a short concrete account without introducing analytics or long-form journaling.

### 6.3 Safe read helper

`weekly-review-feature.js` adds a local helper equivalent to:

```javascript
function weeklyOptionalText(value) {
  return typeof value === 'string' ? value : '';
}
```

It is used only when rendering the two new fields. It does not normalize or write historical records.

### 6.4 Save interface

The existing `saveWeeklyReview()` payload adds:

```javascript
repeatablePractice: document.getElementById('weeklyRepeatablePractice').value.trim(),
evidenceReflection: document.getElementById('weeklyEvidenceReflection').value.trim()
```

Both IDs are added to the existing `draft.fields` list so a failed write restores exactly what the learner typed.

### 6.5 Errors

No new validation error exists for empty content. Existing errors remain:

- missing explicit Capability decision;
- missing revised attempt;
- invalid `futureUse`;
- durable write failure.

Persistence failure uses the existing rollback, toast, review-meta message, draft restoration, and focus behavior.

## 7. State transitions

### Historical v1 render

```text
v1 review loaded
→ existing fields render unchanged
→ new fields render empty
→ no in-memory mutation
→ no durable write
```

### New v2 save with empty answers

```text
new review
→ new fields empty
→ existing capability validation passes
→ candidate receives schemaVersion 2 and two empty strings
→ durable save succeeds
→ candidate becomes active
```

### New v2 save with answers

```text
learner enters one or both answers
→ no decision is inferred
→ learner explicitly resolves required Capability decisions
→ one candidate contains review + any explicit attempt revision
→ durable save succeeds
→ candidate becomes active
```

### Explicitly editing a v1 review

```text
v1 review opens with empty new controls
→ learner types a new answer
→ explicit save
→ existing v1 content is spread into candidate unchanged
→ candidate writes schemaVersion 2 and new fields
```

### Failed save

```text
draft snapshot includes old and new controls
→ candidate constructed
→ durable save returns false
→ previous state restored and re-persisted where possible
→ form rerenders
→ entire draft restored
→ error status receives focus
```

## 8. Important flows

### 8.1 FUNCIONOU → KEEP remains guidance, not automation

The positive group appears before the established general closure fields. Its introductory copy may explain that successful practices can inform a decision to keep an attempt. It must not programmatically bind either textarea to `[data-weekly-decision]`.

The existing Capability cards above the closure form remain the only decision controls.

### 8.2 Evidence-based reflection

The learner can inspect Evidence already present in Capability cards or the existing Evidence disclosure, then author `evidenceReflection`. No Evidence picker, recall ranking, copy suggestion, identity statement, or generated text is added.

### 8.3 Old backup restore

The existing detached restore accepts a valid old state containing v1 Weekly Reviews. `state-foundation.js` preserves each record. When Weekly Review renders, absence of the two new properties yields empty controls. No migration or synthetic value is persisted.

### 8.4 New backup round-trip

Because JSON export serializes the whole state, the two strings remain on the review. Restore persists the complete candidate before activation, then the Weekly Review reads the same values.

### 8.5 Offline cached shell

v84 contains the changed module through existing manifest composition. With the shell controlled and offline, the existing storage layer persists the v2 review. Reload rehydrates it without network access.

## 9. Significant decisions

### D-01 — Add two fields; do not reuse `wins` or `lessons`

**Decision:** add `repeatablePractice` and `evidenceReflection`.

**Rationale:** historical content keeps its original meaning and AC-08 is satisfied without heuristics.

**Rejected:** relabel `wins` and `lessons`. It would automatically reinterpret old answers.

### D-02 — Per-record v2 on explicit save; no global migration

**Decision:** increment only `WEEKLY_REVIEW_VERSION` and write v2 during the existing explicit save.

**Rationale:** missing fields are already valid and additive properties are preserved by storage/merge. A bulk migration would create synthetic state without learner action.

**Rejected:** top-level `compasso.state.v4` or startup backfill. Neither is necessary and both increase data risk.

### D-03 — Property presence is authoritative for compatibility

**Decision:** read valid new properties regardless of the numeric record version; absent properties render empty.

**Rationale:** an older app preserves unknown properties but may rewrite `schemaVersion: 1` on a later explicit save. Depending solely on the version number would hide valid learner-authored text after a forward rollback.

### D-04 — No new model

**Decision:** keep the two strings in the existing Weekly Review feature and record.

**Rationale:** there is no independent domain logic, ranking, inference, or lifecycle requiring a model owner.

**Rejected:** a positive-learning collection or calibration model. It duplicates Weekly Review ownership and expands schema.

### D-05 — No decision coupling

**Decision:** the new fields do not read or write Capability decisions.

**Rationale:** learner control and semantic consistency require explicit controls.

**Rejected:** auto-select `keep` for positive text or `revise` for negative text.

### D-06 — Reuse current layout primitives

**Decision:** use the existing form grid and field styles without modifying CSS.

**Rationale:** two textareas fit the responsive contract; a new style surface or visual redesign is unnecessary.

### D-07 — Manifest generation advances; Service Worker code does not

**Decision:** v83 → v84 in `app-manifest.js` only.

**Rationale:** cached content changes, while cache ownership/lifecycle logic does not.

## 10. Closed file manifest for Build

| # | Action | Exact path | Purpose | Dependencies | Acceptance coverage |
|---:|---|---|---|---|---|
| 1 | Modify | `weekly-review-feature.js` | Add exact prompts, safe reads, draft capture, v2 payload, and preserve independent decisions | Existing review save/render contracts | AC-01–AC-12, AC-17–AC-19 |
| 2 | Modify | `app-manifest.js` | Advance candidate cache generation v83→v84 only | Production module change | AC-12, AC-15, AC-19 |
| 3 | Modify | `docs/weekly-review-feature.md` | Document prompts, v2 fields, explicit decisions, compatibility, failure, backup, and offline behavior | 1 | AC-01–AC-15, AC-18–AC-19 |
| 4 | Modify | `docs/capability-first-compasso.md` | Record positive consolidation in the existing learning cycle without inference | 1 | AC-05–AC-09, AC-18–AC-19 |
| 5 | Modify | `tests/today-central-contract.test.js` | Fix exact prompts, distinct field ownership, v2 contract, and absence of a parallel score/domain | 1 | AC-01–AC-03, AC-07–AC-10, AC-18–AC-19 |
| 6 | Modify | `tests/app-manifest.test.js` | Require v84 while keeping state v3, collection catalog, and assets unchanged | 2 | AC-10, AC-14–AC-15, AC-19 |
| 7 | Create | `tests/browser/weekly-review-positive-flows.spec.js` | Cover new/legacy review, empty/partial/full answers, no inference, KEEP/REVISE, edit, rollback, reload, backup/restore, and protected data | 1 | AC-01–AC-14, AC-18–AC-19 |
| 8 | Modify | `tests/browser/design-system-flows.spec.js` | Verify labels, keyboard order, visible focus, 360/390 px, touch, and 200% zoom | 1 | AC-16–AC-17 |
| 9 | Modify | `tests/browser/pwa-lifecycle-flows.spec.js` | Persist the new answers in the controlled cached-shell journey and verify them after offline reload | 1–2 | AC-12, AC-15, AC-19 |

No other production, data-foundation, storage, model, CSS, Service Worker, package, route, or test file is authorized by this Design.

### Frozen paths

Build must not modify:

- `state-foundation.js`;
- `storage.js`;
- `capability-context-model.js`;
- `learning-outcome-model.js`;
- `service-worker.js`;
- `index.html`;
- `design-system.css`;
- `package.json` or `package-lock.json`;
- any Session, Evidence, Today, journal, error notebook, sync, vault, or integration owner.

If implementation needs a frozen or unlisted path, stop and use Iterate before editing.

## 11. Dependency-ordered implementation sequence

1. Add failing Node source-contract assertions for the exact prompts, field names, v2, and manifest v84.
2. Add the dedicated failing browser scenarios for new, legacy, rollback, and backup behavior.
3. Add failing design-system and PWA assertions.
4. Modify `weekly-review-feature.js` with the minimal additive UI/data changes.
5. Advance `app-manifest.js` to v84.
6. Run focused Node and browser tests until green.
7. Update the two documentation files to the verified behavior.
8. Run persistence, PWA, accessibility, and compatibility regressions.
9. Run `npm run test:all` and inspect the final diff against the nine-path manifest.
10. Produce `.sdd/reports/weekly-review-positive/BUILD_REPORT.md`; the report is an SDD output and not a production manifest entry.

## 12. Acceptance-to-test mapping

| Criterion | Primary evidence | Test level/location |
|---|---|---|
| AC-01 | Exact first prompt and accessible label | Node contract + dedicated browser |
| AC-02 | Exact Evidence prompt and accessible label | Node contract + dedicated browser |
| AC-03 | Empty answers save when existing decisions are valid | Dedicated browser |
| AC-04 | One/both answers persist exactly | Dedicated browser |
| AC-05 | Explicit `keep` leaves attempt record unchanged | Dedicated browser + existing capability-context regression |
| AC-06 | Explicit `revise` retains current atomic update behavior | Dedicated browser + existing capability-context regression |
| AC-07 | Positive/negative text never changes decision controls | Dedicated browser |
| AC-08 | v1 review preserves old fields and renders new fields empty without writes | Dedicated browser |
| AC-09 | Explicit old-review edit writes v2/new property only with save | Dedicated browser |
| AC-10 | Existing values remain byte/structurally stable | Dedicated browser + manifest/state regressions |
| AC-11 | Failed save rolls back and restores full draft/focus | Dedicated browser |
| AC-12 | Reload and edit preserve values | Dedicated browser + PWA journey |
| AC-13 | Current backup export/restore round-trip | Dedicated browser |
| AC-14 | v1 backup restore creates no synthetic answer | Dedicated browser + existing local-data-safety regression |
| AC-15 | Controlled offline save/reload | PWA lifecycle spec |
| AC-16 | 360/390, 200% zoom, coarse pointer, no overflow | Design-system browser spec |
| AC-17 | Labels, keyboard order, success/error focus | Design-system + dedicated browser |
| AC-18 | No score, identity, AI, or motivational output | Node source contract + browser assertions |
| AC-19 | Protected owners unchanged except explicit existing effects | Dedicated browser deep comparison + canonical regression |

## 13. Validation commands

Commands are taken from `package.json`, Playwright config, AGENTS instructions, and existing CI:

### Focused Node

```powershell
node --test tests/today-central-contract.test.js tests/app-manifest.test.js
```

### Focused functional browser

```powershell
npm run build:test
npx playwright test tests/browser/weekly-review-positive-flows.spec.js --project=chromium --project=mobile --retries=0
```

### Accessibility and responsive regression

```powershell
npx playwright test tests/browser/design-system-flows.spec.js --project=chromium --project=mobile --grep "Weekly Review positiva|configuração opcional" --retries=0
```

### Offline/PWA

```powershell
npx playwright test tests/browser/pwa-lifecycle-flows.spec.js --project=chromium --grep "controlled complete cache" --retries=0
```

### Persistence and protected-data regressions

```powershell
npx playwright test tests/browser/local-data-safety-flows.spec.js tests/browser/capability-context-flows.spec.js --project=chromium --retries=0
```

### Canonical gate

```powershell
npm run test:all
```

### Static and scope checks

```powershell
node --check weekly-review-feature.js
node --check tests/browser/weekly-review-positive-flows.spec.js
git diff --check
```

Build must report exact passed, failed, and skipped counts. Conditional project skips are not passes and must be identified separately.

## 14. Migration and compatibility

### Top-level migration

Not applicable. `compasso.state.v3` and the collection catalog remain unchanged.

### Per-record compatibility

- v1 review without new properties: valid, unchanged, renders empty controls.
- v2 review with empty strings: valid explicit save, renders empty controls.
- v2 review with one/both strings: renders exact valid strings.
- malformed new property: renders empty and is not normalized into storage until explicit save.
- old JSON backup: remains valid; restore does not fabricate content.
- new JSON backup: contains additive properties and restores them.
- merge: whole-record timestamp semantics preserve the properties with the winning review; equal-timestamp divergence retains existing conflict behavior.

No startup migration, backfill, collection rewrite, or background write exists.

### Forward rollback compatibility

The v83 Weekly Review spreads an existing record into its next payload, so it preserves unknown additive fields even though it writes `schemaVersion: 1`. Therefore v84 reads properties by valid presence rather than requiring version 2. Learner-authored answers survive a temporary forward rollback and later forward upgrade.

## 15. Rollout and rollback

### Before publication

Rollback is the complete nine-path implementation unit. Reverting it requires no data action because no production client saw v84.

### After v84 exposure

Use a later forward generation, such as v85, containing the reverted presentation/behavior. Do not reuse v83/v84 and do not clear IndexedDB, localStorage, backups, vault data, or caches as a data-recovery strategy.

The additive fields may remain in records and backups; older code preserves them. A later corrected version may render them again.

### Release gates

- local canonical suite;
- remote Linux CI after a separately authorized PR;
- human installed-PWA close/reopen check if release acceptance requires physical standalone evidence;
- publication/production verification only after explicit authorization.

## 16. Security, privacy, performance, and operation

### Privacy

Both answers remain local user content inside the existing review record. No network request, telemetry, AI processing, log, or external service receives them.

### Security

Rendering uses existing escaped/form-value paths. The fields are plain strings with length bounds and no HTML interpretation.

### Performance

Two bounded strings and two textareas add negligible storage/render cost. No new index, scan, ranking, or background process exists.

### Observability

No telemetry is added. Existing review status, success focus, error status, test evidence, and PWA generation are sufficient.

### Accessibility

Native labelled textareas, current form order, existing status regions, and current responsive primitives are retained. Browser tests must prove focus/geometry rather than relying on markup inspection alone.

## 17. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Historical `wins` or `lessons` is shown under a new question | Separate additive properties; explicit legacy test |
| Text silently changes KEEP/REVISE | No code path connects new IDs/properties to decision controls; behavioral no-inference test |
| Failed save loses new draft | Add both IDs to the existing draft snapshot; failure/retry test |
| Old backup gains synthetic empty fields during restore | No migration/backfill; restore/render immutability test |
| Mobile form becomes too long or overflows | Reuse one-column breakpoint and test 360/390/zoom; no modal |
| Cached clients keep stale Weekly Review module | Manifest generation v84 and controlled offline test |
| Rollback hides valid fields because version is downgraded | Read by valid property presence, not version number alone |
| Scope grows into positive analytics or psychological scoring | Closed manifest and source/browser absence assertions |

## 18. Build stop conditions

Stop and return through Iterate if any of the following becomes necessary:

- reusing or relabelling `wins`/`lessons` for the new answers;
- adding a new collection, model, route, score, inferred decision, or background write;
- changing `compasso.state.v3`, storage, state foundation, merge semantics, or backup format;
- modifying CSS, Service Worker behavior, packages, or a frozen path;
- weakening explicit Capability decision validation;
- automatically migrating historical reviews;
- editing a path outside the nine-path manifest.

## 19. Baseline and design evidence

At Design start:

- worktree: `C:\Users\Giuse\.codex\worktrees\weekly-review-positive\every-second-counts-app`;
- branch: `codex/weekly-review-positive`;
- HEAD: `2c67b2ba40a54e84842daa18674ad45c0683e636`;
- working tree contained only the uncommitted Delivery 4 SDD feature directory;
- `.codegraph/` absent;
- `npm test`: 218 passed, 0 failed, 0 skipped;
- `npm run build:test`: PASS;
- focused existing Weekly Review browser flow: 1 passed, 0 failed;
- locked test dependencies installed with `npm ci`; no package or lockfile change;
- two pre-existing high-severity development dependency audit findings remain out of scope.

The GitHub PR #84 merge and both remote checks were verified before creating this worktree. Remote CI for Delivery 4 does not yet exist and is not claimed.

## 20. Design gate

- Validated Define at 15/15: PASS.
- Current repository and owners inspected: PASS.
- Current/target state and interfaces specified: PASS.
- Historical semantics decision resolved: PASS.
- Complete closed file manifest: PASS — nine paths.
- All 19 acceptance criteria mapped: PASS.
- Migration, compatibility, rollout, and rollback addressed: PASS.
- Security, privacy, performance, accessibility, and operation addressed: PASS.
- Production code unchanged during Design: PASS.

**Result: Complete (Built).**

The next valid phase is `$sdd-ship` using this Design and the Build Report as the verification contract. Ship does not authorize commit, push, PR, merge, release, deployment, or publication.
