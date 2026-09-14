# Evidence Recall em Hoje — Design

**Delivery:** 2 — Recall contextual de evidências
**Status:** Shipped
**Roadmap:** Psicocibernética → Compasso
**Date:** 2026-09-14
**DEFINE:** `.sdd/features/evidence-recall-today/DEFINE.md`
**Implementation baseline:** `33891da518b78fa28dc6881267c35bbadad6066e`
**Branch:** `codex/evidence-recall-today`

## 1. Design gate and inspection evidence

The DEFINE has clarity **15/15**, sixteen measurable requirements, sixteen acceptance scenarios, explicit failure boundaries, and no unresolved product decision.

Repository inspection was performed in `C:\Users\Giuse\OneDrive\Documentos\Every Second Counts\every-second-counts-app-evidence-recall-today`.

- Branch/HEAD: `codex/evidence-recall-today` at `33891da518b78fa28dc6881267c35bbadad6066e`.
- Delivery 1 PR #82: merged; Browser tests PASS; GitGuardian PASS.
- `.codegraph/`: absent; direct source, tests, docs, manifest, CI, and archived SDD artifacts were authoritative.
- Fresh `npm test`: **213 passed, 0 failed, 0 skipped**.
- Canonical command evidenced by `package.json` and `.github/workflows/browser-tests.yml`: `npm run test:all`.
- `npm ci`: PASS; two high-severity audit findings remain outside this no-dependency scope.
- Production/test changes during Design: none.

The installed skill references `templates/DESIGN_TEMPLATE.md`, but that file is absent. This document follows the full skill contract and established repository structure.

## 2. Current state and gap

`today-feature.js` owns the current-day plan and this primary precedence:

1. active/paused/finishing execution;
2. first incomplete current active `capability-attempt` in stored order;
3. first ordinary action;
4. planning fallback.

The Capability primary card renders its attempt, optional `futureUse`, and actions, but derives no Evidence.

`capability-context-model.js` already owns canonical provenance:

```text
Evidence.sessionId
→ executionSessions.id
→ execution.learningContext
→ normalized capabilityRef
```

`evidenceContext()` resolves that path; `buildIndexes()` and `capabilitySummary()` expose related records. There is no strict recall-validity filter or deterministic occurrence-time selector.

`learning-outcome-feature.js` renders up to four Evidence records under `Contexto de aprendizagem → Evidence`, but its Evidence articles have neither stable DOM IDs nor focus targets. The generic Session-history dialog cannot serve Capability-domain executions because it resolves source collections by resource `domain/itemId`.

The gap is therefore a read-only selector, a subordinate Today projection, click-time revalidation, and exact-ID navigation into the existing Capability context.

## 3. Target architecture

```text
todayPrimaryState()
        │ active/current Capability
        ▼
CompassoCapabilityContextModel.selectRecentEvidence()
        │ detached DTO or null
        ▼
renderTodayPrimary()
        │ one compact recall block after primary actions
        ▼
[Ver evidência]
        │ click-time revalidation
        ▼
CompassoFeatures.execute('capability.openEvidence')
        │
        ├─ open existing Capabilities view
        ├─ render correct active Capability
        ├─ expand Contexto de aprendizagem
        └─ focus exact Evidence article by stable ID
```

No step writes product state. No route, modal, collection, schema, or persistence owner is added.

## 4. Component responsibilities and interfaces

### 4.1 Pure selection — `capability-context-model.js`

Add one exported selector:

```js
selectRecentEvidence(outcomeId, data, options = {})
  → null
  | {
      evidenceId,
      sessionId,
      outcomeId,
      summary,
      type,
      createdAt
    }
```

Responsibilities:

- trim/validate `outcomeId`;
- reuse `buildIndexes(data)` or optional `options.indexes`;
- require non-empty Evidence ID/session ID and trimmed summary of at least three characters;
- accept only parseable ISO `createdAt` at or before `options.now || current time`;
- require an existing execution with `status` `completed` or `interrupted`;
- resolve provenance only through `evidenceContext()`;
- require exact canonical `outcomeId` equality;
- ignore Evidence `domain`, `itemId`, type, text, resources, signals, `updatedAt`, and `editedAt` for selection;
- choose normalized `createdAt` descending, then Evidence ID ascending on ties;
- return a detached DTO, never a live state record.

Historical `attemptId` may differ from the current attempt because recall is Capability-wide. Today separately proves that the destination Capability and current attempt are active/current.

### 4.2 Today projection — `today-feature.js`

Add:

```js
todayRelatedEvidence(primary) → selector DTO | null
todayEvidenceAge(createdAt, now = new Date()) → localized string
```

`todayRelatedEvidence` delegates to the pure selector only for a primary active/current Capability attempt.

`todayEvidenceAge` affects presentation only:

- same local calendar day: `Hoje`;
- previous day: `Ontem`;
- 2–30 days: `{N} dias atrás`;
- older: localized `dd MMM yyyy`.

Render one `<aside class="today-evidence-recall">` only when the DTO exists. It contains `Uma evidência relacionada`, age/date, escaped original summary, and a quiet `Ver evidência` button with Evidence and outcome IDs.

The aside comes after `.today-primary-actions` in DOM order and spans the existing grid. `Iniciar agora` therefore remains the first execution/focus choice and primary visual action.

The `[data-today-related-evidence]` handler must:

1. recompute the current primary state and selected DTO;
2. require exact payload equality for current outcome and selected Evidence IDs;
3. on mismatch, re-render/focus Today and show neutral source-unavailable feedback;
4. otherwise execute `capability.openEvidence`;
5. if the command returns false, keep Today stable and never silently open another Evidence.

It must call no save function.

### 4.3 Exact source navigation — `learning-outcome-feature.js`

Extend ephemeral `learningOutcomeRuntime` with `focusEvidenceId:null`.

When set for the rendered Capability, `outcomeContextSummary()` builds its four-item Evidence window with the exact selected Evidence first, then other current summary Evidence, deduplicated by ID. This only affects that render and never reorders `state.data.evidence`.

Each Evidence article gains:

```html
<article
  data-capability-evidence="evidenceId"
  tabindex="-1"
  aria-label="Evidence: resumo">
```

Register:

```js
CompassoFeatures.command(
  'capability.openEvidence',
  ({ outcomeId, evidenceId, trigger }) => boolean
)
```

The command validates exact canonical ownership, selects the active Capability view, sets the ephemeral focus ID, switches to `capabilities`, renders, expands `.capability-context-summary`, focuses/scrolls the exact escaped-ID article, clears the runtime ID, and returns true only after exact resolution. Missing/stale source clears runtime state and returns false without substitution.

This command keeps Today independent of Capability rendering internals.

### 4.4 Presentation — `design-system.css`

Add only scoped `.today-evidence-recall` rules:

- `grid-column:1/-1` inside the primary card;
- subtle separator and neutral surface;
- compact copy/action grid with safe wrapping and no fixed height;
- lower visual weight than the attempt heading and primary actions;
- inherited global focus-visible behavior;
- at least 44×44 px under coarse pointer;
- stacked layout at ≤620 px and optional full-width action at ≤390 px.

No general Today, Capability, button, typography, or navigation redesign is allowed.

### 4.5 Documentation and PWA

- `docs/today-feature.md`: eligibility, ranking, hierarchy, absence, and exact navigation.
- `docs/evidence-feature.md`: read-only recall provenance plus edit/delete behavior.
- `docs/capability-first-compasso.md`: continuity cycle and no-inference/schema boundary.
- `app-manifest.js`: advance exactly once from `compasso-pages-v81` to `compasso-pages-v82`; no module, asset, collection, or Service Worker logic change.

## 5. Eligibility and ranking algorithm

For requested Capability `C` and current instant `N`:

1. Build or receive current indexes.
2. For every Evidence `E`, require valid ID, session ID, summary, and non-future ISO `createdAt`.
3. Resolve `X = executionById.get(E.sessionId)` and require terminal `completed|interrupted` status.
4. Resolve `R = evidenceContext(E, executionById)` and require `R.outcomeId === C`.
5. Compare eligible records by `createdAt` descending and Evidence ID ascending.
6. Return a detached DTO for the winner or `null`.

A single-pass winner comparison is preferred, yielding O(E) time and O(1) selection memory. The number of Evidence records is local; no persisted index, worker, polling, or background task is justified.

There is no quality/importance secondary criterion because the current model has no trustworthy field. Evidence type is not a quality proxy.

## 6. Important flows

### Happy path

```text
Hoje resolves current Capability attempt
→ selector returns latest canonical Evidence
→ subordinate recall renders
→ learner chooses Ver evidência
→ click revalidates source
→ existing Capability context opens
→ exact Evidence article receives focus
→ zero persistence calls
```

### No source

```text
selector returns null
→ no recall DOM node or placeholder
→ Today behavior is otherwise unchanged
```

### Source changes before click

```text
button rendered
→ Evidence/primary context changes
→ handler recomputes selection
→ IDs differ
→ Today refreshes with neutral feedback
→ no substitute opens silently
```

### Exact Evidence outside current four

```text
command sets focusEvidenceId
→ Capability render promotes exact source into ephemeral four-item window
→ details opens and target receives focus
→ runtime focus ID clears
```

### Offline refresh

```text
v82 shell controlled and cached
→ offline state loads locally
→ selector derives recall
→ exact navigation remains in-app
→ refresh derives the same source again
```

## 7. State and failure behavior

| Event | Runtime/UI effect | Durable effect |
| --- | --- | --- |
| Eligible Today render | One recall block | None |
| Ineligible Today render | No recall node | None |
| Valid `Ver evidência` | View switch, details expansion, exact focus | None |
| Stale `Ver evidência` | Today re-render/focus and neutral feedback | None |
| Evidence edit | Corrected summary on next render; original occurrence rank | Existing Evidence edit only |
| Evidence deletion | Next eligible source or no block | Existing deletion/tombstone only |
| Backup restore | Recall re-derived from restored canonical state | Existing restore only |
| Refresh | Ephemeral focus ID clears; recall re-derived | None |

Boundary rules:

- malformed/future Evidence, empty/short summary, missing/non-terminal execution, or incomplete reference excludes only that record;
- archived/missing Capability, stale/completed Today reference, ordinary action, planning fallback, or active execution renders no recall;
- long/multiline summary is escaped and wraps;
- missing exact DOM target returns false and claims no success;
- deleted Evidence is absent through its existing collection/tombstone owner.

## 8. Significant decisions

| Decision | Rationale | Rejected alternatives |
| --- | --- | --- |
| Pure selector in Capability context model | One canonical provenance/ranking owner with Node coverage | Inline Today scan and duplicated inference logic |
| Exact outcome ID, not current attempt ID | Capability-wide historical recall matches roadmap | Only same-attempt Evidence; text similarity |
| Rank by original `createdAt` | Edit must not fabricate recent success | Array order, `updatedAt`, type, signal presence |
| Detached DTO | Prevents accidental mutation and minimizes exposed data | Return live Evidence record |
| Recall after primary actions | Keeps `Iniciar agora` first and dominant | Separate dashboard; recall before execution actions |
| Existing Capability context | Already owns Capability Evidence and works offline | New route/modal; resource Session history; copied text only |
| Command-owned navigation | Encapsulates internal render/focus behavior | Direct Today access to Capability runtime |
| Ephemeral selected-ID promotion | Exact target without rendering unlimited history | Render all Evidence or persist display order |
| Scoped CSS | Preserves deliberate hierarchy/mobile behavior | JS-injected CSS or unrelated class reuse |
| Manifest v82 | Coherent cached JS/CSS update | Reuse v81 or change Service Worker logic |
| No migration | Feature is fully derived | Persist read state or duplicate Capability on Evidence |

## 9. Security, privacy, performance, operations

- **Privacy:** Evidence text stays local; no request, telemetry, AI, or content log.
- **Output safety:** escape all text/IDs and use `CSS.escape` for selectors.
- **Performance:** one local O(E) scan for the one primary Capability per Today render.
- **Observability:** existing runtime diagnostics and neutral toast only; no Evidence text in logs.
- **Data safety:** render/navigation call no persistence API; source owners remain unchanged.
- **Operations:** static JS/CSS/docs/tests and one manifest generation advance; no package, lockfile, CI, backend, permission, or environment change.
- **Publication:** commit, push, PR, merge, Pages, and release remain outside Build authorization.

## 10. Closed Build file manifest

The product/test/documentation manifest is closed at **12 exact paths**.

| # | Action | Exact path | Purpose | Dependencies | Acceptance coverage |
| ---: | --- | --- | --- | --- | --- |
| 1 | Modify | `capability-context-model.js` | Pure eligibility/provenance/recency selector | Existing indexes and Evidence context | AC-01–AC-05, AC-08–AC-14 |
| 2 | Modify | `today-feature.js` | Recall rendering, age, revalidation, command invocation | 1; primary-state contract | AC-01–AC-08, AC-10–AC-15 |
| 3 | Modify | `learning-outcome-feature.js` | Stable source targets, ephemeral promotion, exact-open command/focus | 1–2; Capability context | AC-06, AC-08–AC-10, AC-13–AC-16 |
| 4 | Modify | `design-system.css` | Scoped hierarchy, wrapping, focus/touch/mobile behavior | 2–3 | AC-07, AC-15 |
| 5 | Modify | `app-manifest.js` | Advance v81→v82 only | 1–4 | AC-14, AC-16 |
| 6 | Modify | `docs/today-feature.md` | Document eligibility, ranking, hierarchy, and navigation | 1–4 | AC-01–AC-12, AC-15 |
| 7 | Modify | `docs/evidence-feature.md` | Document read-only provenance/edit/delete behavior | 1–3 | AC-02–AC-10, AC-13 |
| 8 | Modify | `docs/capability-first-compasso.md` | Extend continuity cycle without score/schema | 1–3 | AC-02, AC-03, AC-07–AC-13 |
| 9 | Modify | `tests/capability-context-model.test.js` | Eligibility/ranking/no-mutation matrix | 1 | AC-01–AC-05, AC-08–AC-12 |
| 10 | Modify | `tests/app-manifest.test.js` | Assert exact v82 and unchanged ownership | 5 | AC-13, AC-16 |
| 11 | Modify | `tests/browser/capability-context-flows.spec.js` | UI, exact focus, hierarchy, stale/deletion/legacy/backup/mobile regressions | 1–4 | AC-01–AC-13, AC-15, AC-16 |
| 12 | Modify | `tests/browser/pwa-lifecycle-flows.spec.js` | Cached offline recall/open/refresh and state invariance | 1–5 | AC-13, AC-14, AC-16 |

The Build report may create `.sdd/reports/evidence-recall-today/BUILD_REPORT.md`; this does not expand the product manifest.

### Frozen paths

Build must not modify `history-evidence-model.js`, `learning-outcome-model.js`, `state-foundation.js`, `storage.js`, Session/Execution/Deep Work owners, `evidence-feature.js`, `index.html`, `service-worker.js`, `app-composition.js`, backup/vault/Notes/Relations/Journal/Active Recall/error/review/context files, packages, lockfile, Playwright config, CI, snapshots, dependencies, other roadmap deliveries, or archived SDD artifacts.

Any necessary unlisted path requires `$sdd-iterate` before implementation.

## 11. Dependency-ordered implementation

1. Add failing model tests for eligibility, isolation, occurrence ranking, tie, malformed/future/orphaned/non-terminal exclusion, and immutability.
2. Add failing browser assertions for absent/present recall, hierarchy, exact source/focus, and read-only behavior.
3. Implement the pure selector and run focused Node tests.
4. Add stable Evidence targets, ephemeral promotion, and `capability.openEvidence`.
5. Render/revalidate recall in Today.
6. Add only scoped CSS and run Chromium/mobile Capability tests.
7. Extend deletion, stale, legacy, and backup browser cases.
8. Advance manifest/test to v82.
9. Extend the controlled offline PWA scenario.
10. Update the three documentation owners.
11. Run focused shared regressions, full canonical validation, and `git diff --check`.
12. Write the Build report and stop before Ship or Git/publication actions.

## 12. Test plan and commands

### Pure selector and state

```powershell
node --test tests/capability-context-model.test.js tests/state-foundation.test.js tests/history-evidence-model.test.js
```

Cover no/one/many sources, cross-Capability isolation, shuffled/edit order, stable tie, future/invalid/short/orphaned/non-terminal records, previous attempt under same Capability, and deep input equality.

### Today and exact source

```powershell
npm run build:test
npx playwright test tests/browser/capability-context-flows.spec.js --project=chromium
npx playwright test tests/browser/capability-context-flows.spec.js --project=mobile
```

Assert exact copy, one/no block, correct source/date, primary class and focus order, exact Evidence ID visibility/focus, source outside first four, no state mutation, deletion/stale handling, unavailable contexts, calibration regression, 360–390 px, 200% zoom, and 44 px targets.

### Manifest and offline PWA

```powershell
node --test tests/app-manifest.test.js tests/service-worker-composition.test.js tests/bootstrap-recovery.test.js
npx playwright test tests/browser/pwa-lifecycle-flows.spec.js --project=chromium --grep "controlled complete cache reopens offline"
```

The PWA test must render/open/refresh the same canonical Evidence offline while preserving Session, Evidence, calibration insight, weekly reflection, daily plan, and local canaries.

### Shared regressions and full gate

```powershell
npx playwright test tests/browser/local-data-safety-flows.spec.js --project=chromium
npx playwright test tests/browser/design-system-flows.spec.js --project=chromium --project=mobile
npm run test:all
git diff --check
```

Do not regenerate Linux visual snapshots on Windows. Run `node --check` for changed JavaScript/spec files. No lint, formatter, or typecheck command is configured.

## 13. Acceptance traceability

| AC | Owner | Evidence |
| --- | --- | --- |
| AC-01 no Evidence | model + Today | Model null; browser no recall node |
| AC-02 one Evidence | model + Today | Exact DTO and one complete block |
| AC-03 Capability isolation | model | Identical cross-Capability fixture excluded |
| AC-04 latest occurrence | model + browser | `createdAt` wins independent of array/edit order |
| AC-05 stable tie | model + browser | ID tie result across render/reload |
| AC-06 exact source | Capability command | Exact data ID visible and focused |
| AC-07 hierarchy | Today + CSS | Primary class/DOM/focus order unchanged |
| AC-08 read-only | all JS owners | Deep equality before/after render/open |
| AC-09 deletion | model + browser | Next eligible/null after supported delete |
| AC-10 broken/legacy | model + browser | Boundary matrix and no-inference UI |
| AC-11 unavailable attempt | Today | Archived/missing/stale/completed cases no card |
| AC-12 active execution | Today | Resume/finish primary with no recall |
| AC-13 backup | Capability browser | Old/current restore and derived-only result |
| AC-14 offline | PWA + manifest | Controlled offline render/open/reload at v82 |
| AC-15 accessibility/mobile | CSS + browser | Keyboard/focus/name/touch/zoom/overflow |
| AC-16 regressions | existing suites | Calibration/signal/Evidence/Today/PWA green |

**Traceability: 16/16 scenarios have an implementation owner and deterministic evidence.**

## 14. Migration, compatibility, rollout, rollback

### Migration

Not applicable. No field, collection, schema/database version, object store, storage key, backup envelope, or persisted association is added.

### Compatibility

- `compasso.state.v3`, IndexedDB-primary, exact localStorage fallback, and JSON restore remain unchanged.
- Evidence shape/provenance and existing tombstones remain authoritative.
- Legacy unlinked records remain valid without inferred recall.
- Delivery 1 calibration and learningSignals remain readable/editable/removable.
- Protected Notes/vault/Relations/Journal/Active Recall/error/context data remain untouched.

### Rollout and rollback

Build creates a local static v82 candidate only. Ship later separates local evidence, remote CI, installed-PWA smoke, and publication.

Before publication, revert the twelve manifest paths as one unit. After v82 exposure, use a later forward generation containing the reverted projection. Never reuse v81/v82 or clear user data/caches as rollback. Recall writes no state, so no data rollback exists.

## 15. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Wrong Capability Evidence | Exact canonical outcome ID and cross-Capability tests |
| Edited old Evidence appears recent | Rank only by original `createdAt` |
| Array order changes winner | Pure deterministic selector and shuffled fixtures |
| Source changes before click | Revalidate exact IDs; no silent substitute |
| Source outside four-item window | Ephemeral promotion/dedupe/focus |
| Recall competes with execution | DOM after actions and subordinate styling |
| Mobile overflow | Scoped wrapping/stacking and geometry tests |
| Focus lands only on card | Stable Evidence target and exact focus assertion |
| Accidental state write | Detached DTO, no save call, deep equality |
| Legacy association fabrication | No domain/item/text/resource fallback |
| CSS disturbs notebook layout | Strict class scope and design-system regression |
| Cached v81 partial behavior | One v82 advance and PWA lifecycle tests |
| Main drifts before Build | Revalidate owners/generation and use Iterate if invalidated |

## 16. Build stop conditions

Stop and use `$sdd-iterate` if Build requires a new route/modal/dashboard, schema/collection/read state/score, AI or similarity, a path outside the manifest, storage/backup/Session/Evidence/Service Worker changes, multiple recall sources, secondary-row recall, weaker generic navigation, changed primary precedence, dependencies/CI/snapshots, or a drifted baseline.

## 17. Design quality gate

- DEFINE clarity: 15/15.
- Repository inspected: PASS.
- Current/target state and interfaces: PASS.
- Exact source navigation: PASS.
- Closed manifest: 12 exact paths.
- Acceptance mapping: 16/16.
- Migration/compatibility/offline/rollback: PASS; no migration.
- Accessibility/mobile/security/privacy/performance: PASS.
- Validation commands: repository-evidenced.
- Production implementation: complete within this Design; evidence is recorded in `.sdd/reports/evidence-recall-today/BUILD_REPORT.md`.
- Open blocker: none.

**Readiness: PASS — Build completed and ready for independent review/Ship on explicit continuation.**

## 18. Revision history

| Revision | Date | Change |
| --- | --- | --- |
| 1.0 | 2026-09-14 | Initial repository-grounded Design for deterministic Evidence Recall in Hoje. |
| 1.1 | 2026-09-14 | Build completed on the exact 12-path manifest with full Node/browser regression green. |
| 1.2 | 2026-09-14 | Phase 4 verification confirmed Design conformance and archived the accepted delivery. |
