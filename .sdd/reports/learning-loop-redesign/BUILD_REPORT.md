# Learning Loop Redesign — Build Report

**Slice:** 1 — Actionable Outcome Foundation
**Build status:** PASS — Ready for Ship
**Report revision:** 3 — 2026-08-08 — Post-Iterate Windows snapshot validation
**Initiative:** `learning-loop-redesign`
**Branch:** `codex/learning-loop-redesign`
**Baseline:** `934d7bad50d3a72d534d14890457e44e34e772ac`
**Build date:** 2026-08-08
**Authoritative artifacts:** `BRAINSTORM.md`, `DEFINE.md`, `DESIGN.md`

## 1. Outcome

The approved Slice-1 implementation is present within the closed production/test manifest. Compasso now has a minimal durable `learningOutcomes` collection, a Portuguese “Capacidades” surface under Frentes, a required embedded next attempt, optional proof criterion, optional Study/Reading references, active/archive lifecycle, deletion tombstones, JSON round-trip support, sync merge support, offline persistence, and failure-safe staged writes.

The implementation does not convert or migrate Studies, Readings, Goals, Notes, sessions, Evidence, Review, Results, or existing weekly outcomes. No capability percentage, score, mastery state, completion state, backend, dependency, database object store, or new primary navigation area was added.

Build completion was previously withheld because canonical Windows `npm run test:all` could not satisfy the existing screenshot test without three Win32 baselines. Design Revision 2 authorized those exact additions subject to individual visual acceptance. That continuation is now complete: all three stable candidates were accepted and promoted, the focused responsive assertion passed, canonical validation passed, and all 36 acceptance criteria reconcile to Pass.

## 2. Pre-build gate

| Check | Evidence | Result |
| --- | --- | --- |
| Repository/worktree | Exact isolated worktree `every-second-counts-app-learning-loop-redesign` | Pass |
| Branch | `codex/learning-loop-redesign` | Pass |
| Baseline | HEAD matched `934d7bad50d3a72d534d14890457e44e34e772ac` before implementation | Pass |
| Existing changes | Only the pre-existing untracked SDD artifacts were present | Pass |
| Design gate | `DESIGN.md`: `PASS — Ready for Build`, 36/36 AC traceability | Pass |
| Closed manifest | 16 planned files; no production/test file outside it changed | Pass |
| CodeGraph | Local ignored `.codegraph/` initialized; 91 files, 1,147 nodes, 3,904 edges; used before source exploration | Pass |
| Dependency install | `npm ci`: 3 declared packages installed; package/lock files unchanged | Pass with note: npm reported 2 pre-existing high-severity audit findings |

## 3. Implementation by responsibility

### Domain model

- Added canonical outcome and embedded-attempt normalization.
- Required nonblank `capability` and `nextAttempt.text`; accepted natural user text without semantic policing.
- Canonicalized absent proof to `null` and references to deduplicated `{type,id}` entries.
- Preserved missing resource references and resolved them as unavailable at presentation time.
- Added create, edit, archive, reactivate, delete/tombstone, deterministic sort, and reference resolution operations.
- Preserved next-attempt identity and creation time when text changes; capability-only edits preserve attempt timestamps.
- Excluded progress, score, mastery, evidence, session, and completion fields from normalized outcomes.

### State, persistence, backup, and sync

- Added `learningOutcomes: []` to initial/default state and normalization.
- Advanced the logical state/merge contract to v3 without changing IndexedDB DB/storage schema or `storage.js`.
- Registered `learningOutcomes` in the manifest collection catalog and PWA cache generation v71.
- Changed the shared save path to await the existing `Promise<boolean>`, report failure without false success, and return an explicit boolean.
- Staged outcome writes against a cloned state; failed persistence restores the previous in-memory state and keeps the draft/modal available.
- Preserved whole-state JSON export and replace-import semantics; legacy JSON without the collection normalizes to an empty collection.
- Added timestamp merge and tombstone coverage so newer outcomes win and deleted outcomes do not resurrect.

### Product surface

- Added “Capacidades” as the first essential peer inside the existing five-area Frentes architecture.
- Added natural pt-BR prompts: “O que você quer conseguir fazer?”, optional “Como você vai saber que conseguiu?”, and required “O que você vai tentar agora?”.
- Added create/edit, collapsed optional resources, active/archive tabs, archive/reactivate, unlink, missing-resource display, and confirmed deletion.
- Kept Studies/Readings as independent linked resources; the UI never derives capability progress from resource progress.
- Kept all new CSS static in `design-system.css`, including responsive 360/768/1024 behavior and dialog drawer behavior on narrow screens.

## 4. Closed-manifest accounting

| # | Planned file | Action | Build result |
| --- | --- | --- | --- |
| 1 | `learning-outcome-model.js` | Create | Implemented |
| 2 | `learning-outcome-feature.js` | Create | Implemented |
| 3 | `app-manifest.js` | Modify | Implemented |
| 4 | `state-foundation.js` | Modify | Implemented |
| 5 | `index.html` | Modify | Implemented |
| 6 | `information-architecture-model.js` | Modify | Implemented |
| 7 | `design-system.css` | Modify | Implemented |
| 8 | `tests/learning-outcome-model.test.js` | Create | Implemented |
| 9 | `tests/app-manifest.test.js` | Modify | Implemented |
| 10 | `tests/state-foundation.test.js` | Modify | Implemented |
| 11 | `tests/information-architecture-model.test.js` | Modify | Implemented |
| 12 | `tests/browser/learning-outcome-flows.spec.js` | Create | Implemented |
| 13 | `tests/browser/information-architecture-flows.spec.js` | Modify | Implemented |
| 14 | `tests/browser/pwa-lifecycle-flows.spec.js` | Modify | Implemented |
| 15 | `.sdd/reports/learning-loop-redesign/BUILD_REPORT.md` | Create | Implemented |
| 16 | `.sdd/features/learning-loop-redesign/DESIGN.md` | Design revision/status | Revised by Iterate; Build completion metadata still withheld |
| 17 | `tests/browser/design-system-flows.spec.js-snapshots/design-system-360-chromium-win32.png` | Create after visual review | Accepted and promoted; focused and canonical assertions passed |
| 18 | `tests/browser/design-system-flows.spec.js-snapshots/design-system-768-chromium-win32.png` | Create after visual review | Accepted and promoted; focused and canonical assertions passed |
| 19 | `tests/browser/design-system-flows.spec.js-snapshots/design-system-1280-chromium-win32.png` | Create after visual review | Accepted and promoted; focused and canonical assertions passed |

`BRAINSTORM.md` and `DEFINE.md` remain the pre-existing initiative artifacts and were not modified during Build or Iterate. The closed manifest is now 19 exact files. No snapshot, product code, Playwright configuration, CI workflow, or Linux baseline was changed during Iterate.

## 5. Validation evidence

| Command | Exit | Evidence |
| --- | ---: | --- |
| `node --test tests/learning-outcome-model.test.js tests/state-foundation.test.js tests/app-manifest.test.js tests/information-architecture-model.test.js` | 0 | 35/35 passed before UI implementation |
| `node --test tests/learning-outcome-model.test.js` | 0 | 14/14 passed after archived-sort regression fix |
| `npm run build:test` | 0 | Manifest composition succeeded with model/feature ordering and v71 assets |
| `npm exec -- playwright test tests/browser/learning-outcome-flows.spec.js --project=chromium` | 0 | 6/6 passed |
| `npm exec -- playwright test tests/browser/learning-outcome-flows.spec.js --project=mobile` | 0 | 5 passed, 1 intentional project skip |
| `npm exec -- playwright test tests/browser/information-architecture-flows.spec.js` | 0 | 11 passed, 1 intentional project skip |
| `npm exec -- playwright test tests/browser/information-architecture-flows.spec.js tests/browser/pwa-lifecycle-flows.spec.js --project=chromium` | 1 then corrected | PWA 10/10 passed; IA test navigation was corrected and rerun green |
| `npm test` | 1 then corrected | Initial failure was an existing LF-only inline-script regex against mixed line endings; authorized `index.html` module boundaries were normalized |
| `npm run test:all` | 1 | Unit: 161/161 passed. Browser: 113 passed, 18 skipped, 1 failed only because `design-system-*-chromium-win32.png` baselines do not exist |
| `npm exec -- playwright test --ignore-snapshots` | 0 | 114 passed, 18 intentional skips; all executable desktop/mobile browser behavior green |
| `npm exec -- playwright test tests/browser/design-system-flows.spec.js --project=chromium --grep "snapshots responsivos"` | 1 as expected during Iterate | Reproduced the single test and its three missing Win32 paths; generated disposable candidates for inspection without accepting them |
| `git diff --check` | 0 | No whitespace errors |

### Outcome scenario coverage

The browser and model suites cover minimal/full creation, blank validation, natural text acceptance, proof add/remove, resource linking/unlinking, 0%/100% resource independence, attempt identity, editing, active/archive/reactivate lifecycle, missing resources, deletion isolation/tombstone, reload persistence, full/archived JSON round-trip, legacy JSON import, deterministic ordering, malformed-record isolation, v3 idempotence, merge/no-resurrection, offline PWA reopening, save failure without false success, keyboard flow, no capability score UI, and 360/768/1024 overflow checks.

## 6. Defects found and resolved during Build

1. Capability-only edits initially advanced the embedded attempt timestamp. The model now advances attempt time only when attempt text changes; a regression test covers it.
2. `sortOutcomes()` initially defaulted to active-only, leaving the archived UI empty. The default now sorts all outcomes and optional explicit status filters remain tested.
3. Two browser tests raced asynchronous persistence. They now wait for the durable state transition rather than UI timing.
4. The export test initially omitted the existing backup privacy confirmation. It now exercises and accepts the real confirmation.
5. The save-failure test initially attempted to mutate the frozen storage API. It now replaces/restores the storage object at the supported global seam.
6. The IA integration test attempted to select a peer from a hidden hub after navigation. It now returns to Frentes before selecting Study.

## 7. Deviations and residual risks

### Approved-design deviations

None in production behavior, data shape, persistence architecture, or scope.

### Original validation blocker

The repository tracks Linux screenshot baselines only:

- `design-system-360-chromium-linux.png`
- `design-system-768-chromium-linux.png`
- `design-system-1280-chromium-linux.png`

On Windows, Playwright expects corresponding `*-chromium-win32.png` files and fails when they are absent. Accepting three new platform baselines or changing snapshot configuration would edit/add files outside the approved Design manifest. Per Design section 34, this requires `$sdd-iterate`; Build does not make that decision.

The behavioral snapshot case still executed its geometry assertions under `--ignore-snapshots`, and the separate Slice-1 browser test explicitly passed 360/768/1024 overflow checks. Visual regression approval itself remains unproven on Win32.

### Iterate diagnosis and resolution

- The single failing test is `tests/browser/design-system-flows.spec.js` “snapshots responsivos de 360, 768 e 1280 px não têm overflow”; its loop contains three `toHaveScreenshot()` assertions.
- With no custom `snapshotPathTemplate`, Playwright 1.55 uses `{arg}{-projectName}{-snapshotSuffix}{ext}`. The installed runner sets `snapshotSuffix = process.platform`, producing `design-system-{360|768|1280}-chromium-win32.png` on Windows and `*-chromium-linux.png` on Ubuntu.
- The repository tracks only Linux baselines. CI runs `ubuntu-latest`, so it continues selecting those Linux files.
- Disposable Win32 candidates were visually inspected at original resolution. They have correct dimensions, no global overflow or clipped primary controls, readable study/card content, and coherent current accent/secondary hierarchy.
- Candidate hashes were stable across two independent generations: 360 `DD7EF6780DB54A0BD48D3BE265905BF605E53103E1B120A3E1C80A4C7C983656`, 768 `7692F82A698B5EA8FAB0F7FF521F2CF18A3E8315EAD175FB1F3DF46C68C1CAF5`, 1280 `A5FA280F09654EDB12D00ACADEB046D972D201ABDB32FE950004FAEE3E4904BB`.
- Cross-host pixel comparison is materially above the existing 2% allowance: pixels with channel difference greater than 16 were 14.02% at 360, 7.40% at 768, and 7.76% at 1280. The 360/768 differences are primarily fallback-font metrics, wrapping, and rasterization because the test aborts external font loading. The 1280 comparison also exposes an older Linux baseline predating the later accent/contrast baseline refresh at that viewport; the candidate itself matches current violet primary/white secondary semantics.
- Alternative A was selected: retain the existing platform-specific convention and add only the three exact Win32 baselines after Build-time review. Alternative B would require weakening/masking the visual comparison or broader font/product work. Alternative C would remove evidence explicitly allocated to AC-35.
- Design Revision 2 expands the manifest from 16 to 19 files and freezes all product code, test/configuration logic, CI, and Linux baselines.

### Dependency audit note

`npm ci` reported two high-severity findings in the already-declared dependency tree. No package or lockfile change was authorized or made. This is not introduced by the Slice-1 source changes but remains a repository-level follow-up.

## 8. Compatibility and rollback

- No existing Study, Reading, Goal, Note, capture, session, Journal, weekly plan, or Evidence record is converted.
- Unknown top-level fields remain preserved by normalization and whole-state serialization.
- Legacy state/import without `learningOutcomes` opens with an empty collection.
- Deleting an outcome preserves linked resource records and emits a collection tombstone.
- A post-data rollback must retain the v3 compatibility spine (`learning-outcome-model.js`, manifest collection/v71 asset knowledge, state v3 normalization/merge, and `index.html` pass-through) or user-created outcomes can become invisible. Restoring an old backup remains destructive and is not an approved rollback.
- No deployment, publication, commit, push, staging, or merge was performed.

## 9. SDD status and next valid action

| Artifact | Current status after Build | Reason |
| --- | --- | --- |
| `BRAINSTORM.md` | Ready for Define | Umbrella artifact retained as authored |
| `DEFINE.md` | Complete (Built) | Requirements unchanged; all 36 ACs now have sufficient passing evidence |
| `DESIGN.md` | Complete (Built) — Revision 2 | Closed manifest completed and canonical validation passed |
| `BUILD_REPORT.md` | PASS — Ready for Ship | Snapshot gate and every mandatory Build check passed |

The next valid action is `$sdd-ship`. Ship is not invoked automatically and does not authorize commit, push, merge, deployment, or publication.

## 10. Iterate revision log

| Revision | Date | Classification | Artifacts changed | Evidence invalidated/preserved |
| --- | --- | --- | --- | --- |
| 1 | 2026-08-08 | Initial Build report | Build implementation and test evidence recorded. | Canonical completion blocked by absent Win32 baselines. |
| 2 | 2026-08-08 | Additive Design/test-evidence iteration | `DESIGN.md` and this report only. | Product behavior, 161/161 Node results, and 114 behavioral browser results preserved. Canonical completion remains invalid until snapshot review/promotion and full rerun. Brainstorm and Define deliberately unchanged. |
| 3 | 2026-08-08 | Bounded Build continuation | Three authorized Win32 baselines, SDD lifecycle metadata, and this report. | Focused responsive and canonical gates passed; 36/36 ACs now Pass; previous failure evidence preserved above. |

## 11. Post-Iterate Windows snapshot validation

### Reason and authoritative Design

The Iterate occurred because Playwright 1.55 appends `process.platform` to the default project-specific snapshot name. Windows therefore required three `*-chromium-win32.png` references that were absent from the original 16-file manifest. Design Revision 2 selected explicit reviewed Win32 baselines and expanded the closed manifest to 19 exact files without changing DEFINE, product behavior, tests, Playwright configuration, CI, thresholds, or Linux references.

### Candidate identity and individual acceptance

| Viewport | Candidate → destination | Dimensions | SHA-256 | Visual comparison and integrity | Decision |
| --- | --- | --- | --- | --- | --- |
| 360 | `test-results/generated-win32-snapshots/design-system-360-chromium-win32.png` → `tests/browser/design-system-flows.spec.js-snapshots/design-system-360-chromium-win32.png` | 360×800 | `DD7EF6780DB54A0BD48D3BE265905BF605E53103E1B120A3E1C80A4C7C983656` | No global overflow or clipped primary content; primary controls remain reachable; text is readable. The partially visible filter row is the existing intentional horizontal scroller. Differences from Linux are host fallback-font wrapping, metrics, and rasterization. Content is complete. | Accept |
| 768 | `test-results/generated-win32-snapshots/design-system-768-chromium-win32.png` → `tests/browser/design-system-flows.spec.js-snapshots/design-system-768-chromium-win32.png` | 768×800 | `7692F82A698B5EA8FAB0F7FF521F2CF18A3E8315EAD175FB1F3DF46C68C1CAF5` | Same application structure; no overflow, clipping, overlap, or disappearance; controls and text remain readable/usable. Differences are host-font wrapping/metrics and rasterization. Content is complete. | Accept |
| 1280 | `test-results/generated-win32-snapshots/design-system-1280-chromium-win32.png` → `tests/browser/design-system-flows.spec.js-snapshots/design-system-1280-chromium-win32.png` | 1280×800 | `A5FA280F09654EDB12D00ACADEB046D972D201ABDB32FE950004FAEE3E4904BB` | No overflow, clipping, overlap, missing controls, or content defect. The candidate represents current Compasso v71 and the accepted violet-primary/white-secondary hierarchy. The Linux reference retains older primary-button appearance at this viewport; that age does not make the current Win32 candidate a regression. | Accept |

All hashes exactly match the stable values observed across the two Iterate generations. Cross-host pixels with a maximum channel difference above 16 remain 14.02% at 360, 7.40% at 768, and 7.76% at 1280, confirming that a shared baseline would not preserve the existing 2% threshold. Promotion used exact file copies only; no broad snapshot update command was used.

### Promotion and frozen-file verification

Exactly the three authorized Win32 PNGs were added. Pre/post SHA-256 verification confirmed that the three Linux baselines, `playwright.config.js`, `tests/browser/design-system-flows.spec.js`, and `.github/workflows/browser-tests.yml` remained byte-for-byte unchanged. Product and JavaScript test hashes also remained unchanged throughout this continuation.

### Fresh validation

| Command | Exit | Result |
| --- | ---: | --- |
| `npx playwright test tests/browser/design-system-flows.spec.js --project=chromium --grep "snapshots responsivos"` | 0 | 1/1 focused test passed; the 360, 768, and 1280 assertions and geometry checks passed with no missing reference or threshold violation. |
| `npm run test:all` | 0 | Node 161/161 passed, 0 skipped, 0 failed. Browser 114 passed, 18 intentional project/platform skips, 0 failed. Total elapsed browser time 3.1 minutes. |

No environment failure occurred. The browser skips are the suite's explicit project/platform applicability controls; they are not passes and are recorded separately. Current CI uses Ubuntu and continues selecting the unchanged Linux baselines. CI was not executed remotely during this local Build continuation.

## 12. Final acceptance-criterion reconciliation

| AC | Status | Evidence class | Rationale |
| --- | --- | --- | --- |
| AC-01 | Pass | Node model/state + browser | Minimal outcome creation passed without requiring or converting any legacy front. |
| AC-02 | Pass | Browser validation | Blank/whitespace capability is rejected with associated feedback and no write. |
| AC-03 | Pass | Browser reload + JSON | Create/edit text survives reload and current-version round-trip. |
| AC-04 | Pass | Browser responsive | Long text remains stored/readable across the supported responsive checks without global overflow. |
| AC-05 | Pass | Node + browser CRUD | Minimal outcome persists with `proofCriterion:null`. |
| AC-06 | Pass | Node + browser state | Proof is added, edited, and removed while other fields/domains remain stable. |
| AC-07 | Pass | Node contract + browser semantics | Only one scalar/null proof exists; no rating, score, or mastery UI/field exists. |
| AC-08 | Pass | Node + browser CRUD | Zero and mixed/multiple Study/Reading references are accepted. |
| AC-09 | Pass | Node normalization + browser | Duplicate typed resource references normalize to one. |
| AC-10 | Pass | Node isolation + browser | Shared resources support multiple outcomes; link/unlink does not mutate resources. |
| AC-11 | Pass | Node isolation + browser regression | Resource progress changes produce no capability progress/mastery value or visual. |
| AC-12 | Pass | Browser resilience | Missing references remain visible/removable without crash, cascade, or recreation. |
| AC-13 | Pass | Browser validation | Blank attempt blocks save, retains the draft, and focuses the required field. |
| AC-14 | Pass | Node + browser reload/backup | Attempt replacement preserves one stable nested identity across reload/round-trip. |
| AC-15 | Pass | Node contract + browser regression | No completion, history, session, evidence, or Today artifact is created. |
| AC-16 | Pass | Node + browser lifecycle | Active/archive/reactivate preserves Slice-1 content and resources. |
| AC-17 | Pass | Browser destructive flow + state | Cancel preserves the outcome; confirm removes only it and writes a tombstone. |
| AC-18 | Pass | IA Node + browser | Capacidades is a Frentes peer and primary navigation remains exactly five areas. |
| AC-19 | Pass | Node/browser regression | Reading, Study, and Goal ordering, behavior, records, and progress remain isolated. |
| AC-20 | Pass | Node sort + browser list | Active default, archived discovery, and deterministic recent-first ordering passed. |
| AC-21 | Pass | Browser semantic/visual | Capability and next attempt are primary; no percent, mastery, confidence, or gamification appears. |
| AC-22 | Pass | Browser empty state | Capability-oriented empty state and zero-resource creation passed. |
| AC-23 | Pass | Browser form contract | Only capability/attempt plus optional proof/resources are exposed. |
| AC-24 | Pass | Playwright keyboard/focus | Keyboard create/correct/cancel and dialog focus behavior passed. |
| AC-25 | Pass | Node isolation + browser regression | Full outcome flow leaves every frozen legacy domain and progress value unchanged. |
| AC-26 | Pass | Node migration | Legacy state without the collection produces `[]` and preserves unrelated content. |
| AC-27 | Pass | Storage + browser reload/PWA | Writes use the existing local-first path and survive reload/reopen. |
| AC-28 | Pass | Node idempotence | Double normalization/migration is deep-equal with no duplicated records, refs, or attempts. |
| AC-29 | Pass | Node merge | Parent timestamp/tie behavior is deterministic and nested attempt follows the parent record. |
| AC-30 | Pass | Browser JSON round-trip | Current JSON export/import preserves canonical fields and valid references. |
| AC-31 | Pass | Browser/Node restore regression | Legacy backup restores with no fabricated outcomes and no vault change. |
| AC-32 | Pass | Node malformed-state isolation | Malformed entries are isolated while valid and unrelated restored data remains. |
| AC-33 | Pass | Playwright offline/PWA | Outcome CRUD/state survives controlled offline cache reopen using current storage/composition. |
| AC-34 | Pass | Playwright accessibility/design system | Names, focus, keyboard operation, associated errors, lifecycle text, and target geometry have passing evidence. |
| AC-35 | Pass | Focused + canonical responsive snapshots | Reviewed Win32 360/768/1280 baselines now provide local visual-regression evidence; focused geometry/snapshots passed without changing the criterion, threshold, or Linux CI evidence. |
| AC-36 | Pass | Browser storage-failure injection | Failed save keeps the dialog/draft, restores state, and reports failure without false success. |

**Final AC totals:** 36 Pass, 0 Partial, 0 Fail, 0 Not run.

## 13. Final invariants, risks, and readiness

- Outcome model remains minimal: durable `learningOutcomes`, required capability, exactly one current next attempt, optional proof, typed Study/Reading references, and active/archive lifecycle only.
- No percentage, mastery, demonstrated, confidence, resource-derived capability progress, or other vanity competence score exists.
- Migration remains an additive logical-state v3 migration. IndexedDB DB/storage schema stays version 1, no object store was added, normalization is idempotent, tombstones prevent resurrection, and unknown legacy state is preserved.
- Legacy and Slice-1 JSON backup/restore paths pass; no Markdown-vault format changed.
- Controlled offline/reopen evidence passes, and CRUD remains local-first.
- No legacy domain was converted or unintentionally mutated.

Residual risks are limited to: platform-specific screenshot maintenance if more host/viewport combinations are introduced; current Linux CI was not remotely rerun in this local continuation, although its unchanged host-specific references and configuration remain selected by design; and two pre-existing high-severity npm audit findings remain outside this manifest. None is a Slice-1 acceptance failure.

**Final Build gate: PASS — Ready for Ship.** The exact next SDD skill is `$sdd-ship`; it is not invoked automatically.
