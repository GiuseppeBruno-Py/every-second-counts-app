# SHIPPED: Learning Loop Redesign — Slice 1

## Metadata

| Field | Value |
|---|---|
| Feature slug | `learning-loop-redesign` |
| Formally closed scope | `Slice 1 — Actionable Outcome Foundation` |
| Umbrella initiative | Remains open; later Learning Loop slices are not implemented or shipped |
| Closure date | `2026-08-08` |
| Status | `SHIP PASS` |
| Archive mode | Copy-only; working feature/report artifacts retained |
| Branch | `codex/learning-loop-redesign` |
| Baseline HEAD | `934d7bad50d3a72d534d14890457e44e34e772ac` |
| Final approved Design | Revision 2 |
| Current logical state contract | `compasso.state.v3` |
| IndexedDB database/storage schema | Version 1, unchanged |
| Current application/PWA generation | `compasso-pages-v71` |

## Outcome

Slice 1 changes Compasso's learning organization from primarily tracking content and activity toward a durable capability objective and its next useful attempt. Content remains a supporting resource, capability is the objective, and future evidence can demonstrate progress without fabricating a competence percentage.

The shipped domain adds a local-first `learningOutcomes` collection and a natural pt-BR **Capacidades** peer under **Frentes**. It does not complete the full `learning-loop-redesign` initiative. Direct Evidence integration, outcome-aware execution, feedback/gaps, retrieval, review redesign, and later conceptual slices remain unimplemented.

## Final architecture and domain contract

The implementation uses a dedicated pure model (`learning-outcome-model.js`) and product surface (`learning-outcome-feature.js`) integrated through the existing manifest, state foundation, static design system, feature runtime, and Frentes information architecture.

A canonical outcome contains:

```js
{
  id,
  capability,
  proofCriterion: string | null,
  resourceRefs: [{ type: "study" | "reading", id }],
  nextAttempt: { id, text, createdAt, updatedAt },
  status: "active" | "archived",
  archivedAt,
  createdAt,
  updatedAt
}
```

- Capability and current next-attempt text are required and non-blank.
- The embedded next attempt has stable identity across edits and no completion, session, evidence, Today, or history lifecycle.
- Proof is a single optional string, canonically `null` when absent.
- Study/Reading references are typed, outcome-owned, deduplicated, many-to-many support links. They are never progress inputs.
- Lifecycle is only `active ⇄ archived`; archive means not currently being worked on, not learned/mastered/completed.
- Deletion removes only the selected outcome and records a `learningOutcomes:<id>` tombstone. It does not mutate any resource or legacy domain.

## Information architecture

The internal route is `capabilities`, the user-facing label is **Capacidades**, and the existing `compass` icon is reused. Capacidades is the first essential Frentes peer. Primary application areas remain exactly Hoje, Frentes, Journal, Revisão, and Mais; no sixth destination or generic progress-bearing Front abstraction was added.

## Independent acceptance verification

| AC | Independent Ship result | Evidence class and reconciliation |
|---|---|---|
| AC-01 | Pass | Fresh Node/browser evidence: minimal outcomes exist independently from Studies, Readings, Goals, weekly outcomes, and `expectedOutcome`. |
| AC-02 | Pass | Fresh Chromium validation rejects blank capability and creates no record. |
| AC-03 | Pass | Fresh Chromium create/edit/reload plus still-valid current JSON round-trip evidence preserve meaningful text. |
| AC-04 | Pass | Fresh responsive geometry plus canonical long-content evidence show wrapping and preserved stored content. |
| AC-05 | Pass | Fresh Node/browser evidence persists the minimal form with `proofCriterion:null`. |
| AC-06 | Pass | Fresh Node/browser source and flow coverage support add/edit/remove of the sole proof without collateral changes. |
| AC-07 | Pass | Source inspection and fresh Node test confirm scalar/null proof and no score, rating, or mastery representation. |
| AC-08 | Pass | Model normalization and still-valid browser coverage support zero, multiple, and mixed Study/Reading refs. |
| AC-09 | Pass | Fresh Node normalization deduplicates identical typed references. |
| AC-10 | Pass | Fresh browser resource snapshots and Node isolation show shared refs do not mutate resources. |
| AC-11 | Pass | Source has no outcome progress field/calculation; fresh browser flow explicitly verifies resource activity is not capability advancement. |
| AC-12 | Pass | Fresh Chromium flow removes a Study, preserves the reference/outcome, shows `Recurso indisponível`, permits unlink, and does not recreate/cascade. |
| AC-13 | Pass | Fresh browser validation blocks a blank attempt and preserves/focuses the draft field. |
| AC-14 | Pass | Fresh Node and browser evidence preserve one stable embedded attempt identity across edits/reload/round-trip. |
| AC-15 | Pass | Source-shape inspection and fresh tests confirm no completion, session, evidence, result/history, or daily-plan artifact. |
| AC-16 | Pass | Fresh Node/Chromium lifecycle checks preserve fields and resources across active/archive/reactivate. |
| AC-17 | Pass | Fresh Chromium destructive flow and Node state checks preserve unrelated domains and add a tombstone only on confirmation. |
| AC-18 | Pass | Fresh Node IA test confirms Capacidades under Frentes and exactly five primary areas; canonical navigation evidence remains valid. |
| AC-19 | Pass | Diff/source audit and regression suites show Reading, Study, and Goal progress/order/behavior remain independent. |
| AC-20 | Pass | Fresh Node ordering tests plus browser active/archive modes confirm deterministic recent-first display and archive discoverability. |
| AC-21 | Pass | Source/UI inspection shows capability and next attempt primary, with no percent, bar, mastery, confidence, streak, or gamification. |
| AC-22 | Pass | Fresh browser surface retains capability-oriented empty copy and permits zero-resource creation. |
| AC-23 | Pass | Direct form inventory exposes only capability/attempt plus optional proof/resources. |
| AC-24 | Pass | Fresh Chromium keyboard/focus path plus still-valid design-system dialog evidence cover correction, cancel, focus return, and semantic controls. |
| AC-25 | Pass | Node isolation and fresh browser snapshots confirm full outcome operations leave all frozen legacy domains unchanged. |
| AC-26 | Pass | Fresh Node migration and fresh legacy-import browser flow initialize `[]` while preserving unrelated legacy content. |
| AC-27 | Pass | Direct storage path inspection, fresh reload, and still-valid controlled PWA evidence confirm existing local-first persistence is used. |
| AC-28 | Pass | Fresh Node tests confirm repeated normalization/migration is deep-equal with no duplicate outcomes, refs, or attempts. |
| AC-29 | Pass | Fresh Node merge tests cover identity, newer `updatedAt`, deterministic equal-time conflict handling, parent-owned attempt conflict, and resource isolation. |
| AC-30 | Pass | Fresh Chromium backup flow and current model round-trip evidence preserve all canonical fields and valid refs. |
| AC-31 | Pass | Fresh legacy-backup import creates no fabricated outcomes and leaves unrelated data/vault behavior intact. |
| AC-32 | Pass | Fresh Node malformed-entry isolation preserves valid outcomes and unrelated records. |
| AC-33 | Pass | Still-valid canonical controlled-cache evidence proves outcome creation and display after offline reload; source audit finds no remote dependency. |
| AC-34 | Pass | Fresh keyboard/form checks, CSS inspection for `:focus-visible` and coarse-pointer 44px targets, and canonical design-system evidence cover the accessibility contract. |
| AC-35 | Pass | Fresh Slice-1 360/768/1024 geometry, reviewed 360/768/1280 Win32/Linux baselines, and recent focused/canonical snapshot passes cover reflow without weakening the 2% threshold. The 360 CSS viewport is the approved zoom-equivalent reflow evidence; no physical manual 200% observation is claimed. |
| AC-36 | Pass | Fresh Chromium save-failure injection keeps the modal/draft, restores state, and reports failure without false success. |

**Final independent totals: 36 Pass, 0 Partial, 0 Fail, 0 Not run.**

## Validation summary

| Evidence freshness | Check | Result | Evidence location |
|---|---|---|---|
| Fresh Ship | `npm test` | Exit 0; 161 passed, 0 failed, 0 skipped | Ship session and this record |
| Fresh Ship | `npm run build:test` | Exit 0; v71 fixture composition succeeded | Ship session and this record |
| Fresh Ship | `npx playwright test tests/browser/learning-outcome-flows.spec.js --project=chromium` | Exit 0; 6 passed, 0 failed, 0 skipped | Ship session and this record |
| Fresh Ship | Source/manifest/diff/hash inspection | Pass; no unauthorized product file or later-slice semantic integration | This record, Design Revision 2 |
| Fresh Ship | Visual inspection of all six tracked platform baselines | Pass; expected host differences, no hidden layout/content regression | This record, Build report section 11 |
| Fresh Ship | `git diff --check` | Exit 0 before archival | Ship session |
| Fresh Ship residual-risk check | `npm audit --json` | Exit 1; exactly two pre-existing high findings in Playwright 1.55.0 | Residual-risk section below |
| Reused recent Build | `npm run test:all` | Exit 0; Node 161 passed; browser 114 passed, 18 intentional skips, 0 failed | `BUILD_REPORT.md` sections 5 and 11 |
| Reused recent Build | Focused responsive snapshot assertion | Exit 0; 1/1 passed for 360, 768, and 1280 | `BUILD_REPORT.md` section 11 |
| Reused recent Build | Controlled PWA offline/reopen flow | Pass within canonical browser total | `BUILD_REPORT.md` and browser PWA spec |

The full canonical suite was not mechanically rerun during Ship because it had just passed during Build, product/test/config hashes were unchanged, and the fresh Node, fixture, and six-case primary flow all passed. Remote Linux CI was not executed during Build or Ship.

## Migration, persistence, merge, and recovery

### Migration classification

This is an **additive logical-state migration** to `compasso.state.v3`. `storage.js` remains unchanged at IndexedDB `DB_VERSION = 1` and `SCHEMA_VERSION = 1`; no new object store or storage architecture exists. A missing collection becomes `[]`, normalization is deterministic/idempotent, malformed records are isolated, and unknown legacy top-level data survives.

### Backup and restore

- Legacy backup → current app: restores successfully, creates no outcome, initializes `learningOutcomes: []`, and preserves unrelated fields.
- Current Slice-1 backup → current app: preserves capability, proof, typed refs, embedded attempt identity/timestamps, lifecycle, and outcome timestamps.
- Missing resource after restore: the typed reference remains stored and is rendered unavailable until explicitly unlinked.
- Older app binaries are not claimed to understand or expose v3 outcome semantics.

### Tombstones and merge

The manifest catalogs `learningOutcomes` as an ID/timestamp-merged sync array. Newer parent `updatedAt` wins; equal-time differences use existing conflict preservation; the embedded attempt follows the parent record. Deletion records a collection tombstone, older remote records cannot resurrect it, unrelated outcomes survive, repeated merge with the same clock is idempotent, and Study/Reading records remain unchanged.

### Rollback and data-preservation strategy

Before publication, the complete feature unit can be reverted because no user outcome data has been published through that build.

After users persist `learningOutcomes`, rollback must be a **forward PWA recovery generation** retaining the v3 compatibility spine, collection preservation, and whole-state backup/export behavior. Baseline normalization returns the original object and ordinary whole-state serialization preserves unknown top-level keys, but an older generation cannot safely expose or guarantee all v3 sync/restore behavior. Therefore an old incompatible generation, state reset, data deletion, or restoration of an older backup is not an approved rollback.

The recovery principle is: preserve the user's outcome data first; repair application-shell behavior with a forward compatible generation.

## Offline, privacy, and security

Outcome CRUD uses the existing local state and `CompassoStorage`; controlled cached reopen displays persisted outcomes offline. The feature introduces no API, backend, account, cloud service, telemetry, remote processing, AI dependency, or external transmission. JSON export remains user-initiated and protected by the existing privacy confirmation.

## Accessibility, mobile, and visual regression

Evidence covers labeled native controls, keyboard submission/correction/cancel, initial/returned focus, visible `:focus-visible` styling, `role="alert"` validation, explicit destructive confirmation, text lifecycle labels, coarse-pointer minimum 44px targets, responsive geometry, long-text wrapping, and no global overflow. Automated evidence covers CSS viewports and zoom-equivalent reflow; no separate physical/manual assistive-technology or installed-PWA observation is claimed.

Design Revision 2 added exactly these three reviewed Windows baselines:

- `design-system-360-chromium-win32.png`
- `design-system-768-chromium-win32.png`
- `design-system-1280-chromium-win32.png`

They do not replace Linux evidence. The three Linux references, `maxDiffPixelRatio: 0.02`, Playwright configuration, visual-test source, and Ubuntu CI workflow remain unchanged. Linux CI continues to select `*-chromium-linux.png`; it was not remotely executed in this Ship session.

## No-progress and later-slice audit

The production model/feature contains no outcome-level percentage, progress, progress bar, mastery, confidence, demonstrated, learned, completed, score, streak, or resource-derived capability state. Study/Reading progress can change while the outcome remains only active or archived.

No new Evidence association, outcome-aware session, Today/daily-plan task, Active Recall/spaced-repetition behavior, Notes/Relations removal, Weekly Review/Consistency/Results redesign, PACER, retrieval-intent, GRINDE, RAIL, AI, backend, or cloud semantic integration was found. Existing shared module names in the application manifest are incidental infrastructure, not Slice-1 leakage.

## Design and manifest comparison

- Manifest matched: Yes. All 19 exact Design Revision-2 paths exist.
- Product/test/snapshot changed-file set: 17 authorized implementation/evidence paths only.
- SDD Build paths: the authorized `DESIGN.md` and `BUILD_REPORT.md` complete the 19-file manifest.
- Lifecycle artifacts: BRAINSTORM/DEFINE working copies and this copy-only Ship archive are normal SDD records, not implementation-manifest additions.
- Technical deviations: None.
- Product changes during Ship: None.
- Current generation: `compasso-pages-v71`; Ship did not bump it.

## Repository hygiene

The branch and HEAD remained `codex/learning-loop-redesign` at `934d7bad50d3a72d534d14890457e44e34e772ac`. No staged paths existed. Package and lock files were unchanged. `.codegraph/` and `test-results/` are ignored; the latter contained only Playwright's `.last-run.json` at audit time, not a release artifact. No temporary screenshot, secret, cache, dependency change, or unrelated user file entered the archive. Working SDD copies were retained in copy-only mode.

## Residual risks and follow-ups

| Item | Severity | Owner or trigger |
|---|---|---|
| Two high-severity npm audit entries: direct `@playwright/test` and transitive `playwright` 1.55.0, both representing GHSA-7mvr-c777-76hp | Repository-level High; not introduced by Slice 1 and not a runtime dependency | Separate dependency-maintenance request; do not alter under this slice |
| Remote Ubuntu CI was not freshly executed | Low operational evidence limitation; local canonical Build was green and Linux inputs are unchanged | Verify in a separately authorized PR/CI workflow |
| Platform-specific baselines can multiply with additional supported hosts/viewports | Low maintenance risk | Add only with explicit Design evidence and visual review |
| No separate physical installed-PWA, screen-reader, or manual browser-zoom session was performed | Low evidence limitation; controlled automated contracts passed and Design did not require physical observation | Add manual QA if release policy later requires it |

No residual risk is an unresolved mandatory Slice-1 acceptance failure.

## Lessons learned

1. Platform-generated snapshots are evidence candidates, not truth. Host suffixes, CI operating system, pixel thresholds, and explicit baseline paths must be part of the closed Design manifest before acceptance.
2. Preventing fabricated capability progress is strongest when enforced by canonical domain shape and normalization, then reinforced by UI and tests; UI copy alone is insufficient.
3. Local-first rollback after a new durable collection has user data must be a forward-compatible application generation. A raw code revert can hide data even when unknown-key preservation reduces immediate loss risk.
4. An SDD archive for a slice inside an umbrella initiative must name the closed slice explicitly so archival does not falsely claim later conceptual work is shipped.

## Non-goals and later slices

This archive does not ship direct Evidence links, outcome-aware attempts/sessions, feedback/gaps, Today planning, Goals integration, retrieval intent, Active Recall changes, PACER, GRINDE, RAIL, Notes/Relations changes, Weekly Review/Results/Consistency redesign, AI, backend, or any later Learning Loop slice.

The next product slice must begin a new SDD cycle or use the framework's approved slice-artifact convention; it must not treat this archive as authorization to extend Slice 1 silently.

## Archived artifacts

| Artifact | Path |
|---|---|
| BRAINSTORM | `./BRAINSTORM.md` — umbrella retained as open beyond Slice 1 |
| DEFINE | `./DEFINE.md` |
| DESIGN | `./DESIGN.md` — Revision 2 |
| BUILD_REPORT | `./BUILD_REPORT.md` |
| SHIPPED | `./SHIPPED.md` |

## Release boundary and next safe step

**Ship != deploy.** This archive records SDD verification and closure only. No staging, commit, push, merge, rebase, deployment, GitHub Pages update, publication, release, permission change, Today work, PWA-foundation redesign, or later Learning Loop implementation occurred.

The next safe operational step is human review of this copy-only archive. Any staging/commit/PR/CI/publication action requires a separate explicit request. Any later product slice requires its own approved SDD cycle.
