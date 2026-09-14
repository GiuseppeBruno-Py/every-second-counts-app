# Evidence-Based Calibration — Build Report

**Delivery:** 1 — Evidence-Based Calibration
**Status:** PASS — Complete
**Date:** 2026-09-14
**DEFINE:** `.sdd/features/evidence-based-calibration/DEFINE.md`
**DESIGN:** `.sdd/features/evidence-based-calibration/DESIGN.md`
**Baseline:** `bc53712eb105ac02b525ffaec8b42d58d1feea14`
**Branch:** `codex/evidence-based-calibration`
**Worktree:** `C:\Users\Giuse\OneDrive\Documentos\Every Second Counts\every-second-counts-app-evidence-based-calibration`

## 1. Outcome

Delivery 1 was implemented within the approved eight-path manifest.

After a Session and its Evidence are durably saved, an eligible active Capability now offers **Refletir sobre esta evidência** as a secondary continuation. It opens the existing learning-signal dialog in an ephemeral calibration presentation and asks:

> O que esta evidência demonstra que você já consegue fazer?

The response starts empty and is persisted only after explicit **Salvar reflexão** as the existing signal shape:

- `kind: insight`;
- `origin: learner`;
- exact active Capability/attempt `capabilityRef`;
- `sourceRef: { type: 'evidence', id }`.

Cancel, Escape, navigation, refresh before save, and failed persistence create no calibration record. Session, canonical execution, Evidence, Today, Capability, nextAttempt, and resource progress keep their existing ownership.

## 2. Manifest completion

| # | Path | Result | Delivered behavior |
|---:|---|---|---|
| 1 | `evidence-feature.js` | PASS | Eligible Evidence branch, secondary calibration action, click-time revalidation, exact payload, neutral saved status; generic execution-only signal preserved |
| 2 | `learning-outcome-feature.js` | PASS | Strict ephemeral presentation mode, exact label, empty insight, hidden/restored type, learner origin, focus/reset, existing candidate persistence |
| 3 | `app-manifest.js` | PASS | Cache generation advanced exactly once from v80 to v81 |
| 4 | `docs/evidence-feature.md` | PASS | Optionality, authorship, provenance, cancellation/failure, and unchanged Evidence documented |
| 5 | `docs/capability-first-compasso.md` | PASS | Calibration documented as an existing learner insight, never score/state |
| 6 | `tests/app-manifest.test.js` | PASS | Exact v81 expectation and unchanged manifest/state contracts |
| 7 | `tests/browser/capability-context-flows.spec.js` | PASS | Happy path, optionality, empty input, Cancel/Escape, retry, source isolation, legacy, generic reset, backup, mobile/zoom/touch |
| 8 | `tests/browser/pwa-lifecycle-flows.spec.js` | PASS | Explicit capability Session, offline Evidence/calibration save, refresh, and durable recovery |

Scope audit after implementation:

- tracked product/test/doc paths changed: 8;
- unexpected tracked paths: 0;
- no frozen path changed;
- SDD lifecycle artifacts are the only additional untracked paths.

## 3. Implementation details

### 3.1 Completion branching

The post-execution panel now distinguishes:

1. Evidence with valid active Capability: calibration action;
2. execution-only completion with active Capability: existing generic signal action;
3. unlinked, missing, or inactive Capability context: no new signal/calibration action.

Every action re-resolves current execution, Evidence, and Capability state. No association is inferred from text, domain, resource, item, or time.

### 3.2 Dialog presentation

The existing `learningSignal.open` command accepts the non-durable marker:

`presentation: 'evidence-calibration'`

The mode is accepted only for a new, blank, learner-origin `insight` with an Evidence source and active Capability. Unknown/incompatible payloads use existing default behavior or existing invalid-context refusal.

Closing resets title, label, type visibility, submit copy, consent copy, runtime mode, and focus owner. A later generic signal therefore retains its original UI and behavior.

### 3.3 Persistence

No persistence owner changed. The existing candidate-state path still:

1. constructs the existing learning-signal record;
2. clones current state;
3. adds the signal only to the candidate;
4. calls the existing durable save;
5. promotes on success or restores prior state on failure.

The source Session/Evidence is already durable before this independent optional operation. Failed calibration save preserves the typed DOM draft and does not roll back the source.

## 4. Data, schema, backup, and offline impact

Unchanged:

- `compasso.state.v3`;
- storage key `compasso.app.v1`;
- IndexedDB `compasso-db` version 1;
- storage schema 1;
- Evidence schema 2;
- learning signal schema 1;
- collection catalog and merge/tombstone rules;
- JSON backup envelope and restore normalization;
- Markdown/vault, Notes, wikilinks, Relations, and graph contracts;
- `service-worker.js` and composition order.

No migration, background rewrite, object store, model, collection, Evidence field, or rollback data step exists.

Backup coverage now includes a learner-authored Evidence-sourced insight plus Notes/wikilink/Context canaries. Offline coverage explicitly saves calibration after going offline and verifies it after refresh.

The only PWA contract change is the manifest-owned forward generation `compasso-pages-v81`.

## 5. Acceptance results

| Acceptance | Result | Evidence |
|---|---|---|
| AC-01 Session without calibration | PASS | Completion can return/dismiss with zero new signal |
| AC-02 eligibility and hierarchy | PASS | Exact active Evidence branch; primary Today then secondary reflection |
| AC-03 exact question and empty input | PASS | Chromium/mobile assertions on label, focus, empty value, hidden kind |
| AC-04 no pre-submit persistence | PASS | Active state remains zero while dialog opens/types |
| AC-05 Cancel/Escape | PASS | No signal/tombstone; trigger focus restored |
| AC-06 explicit save | PASS | One `insight`, `learner`, exact Evidence source |
| AC-07 source isolation | PASS | Deep equality for outcome, Today, Sessions, executions, Evidence |
| AC-08 failed persistence | PASS | Dialog/draft/error remain; signal zero; Evidence unchanged |
| AC-09 retry | PASS | Failed submit followed by restored storage creates one signal |
| AC-10 ineligible context | PASS | Unlinked Evidence has neither action; execution-only generic path retained |
| AC-11 legacy compatibility | PASS | Existing normalization/no-inference Node/browser regressions |
| AC-12 backup compatibility | PASS | Evidence-sourced calibration and protected canaries survive restore |
| AC-13 offline | PASS | Cached offline Session → Evidence → calibration → refresh |
| AC-14 accessibility/mobile | PASS | Focus, Escape, labels, 200% geometry, mobile touch targets |
| AC-15 generic signal regression | PASS | Default title/label/type/submit restored; CRUD suite green |
| AC-16 PWA generation | PASS | v81 manifest, composition, cache ownership, offline lifecycle |

**Acceptance result: 16/16 PASS.**

## 6. Validation evidence

Environment:

- Node.js `v24.14.1`;
- npm `11.11.0`;
- Playwright `1.55.0`;
- Windows worktree, Chromium desktop and configured mobile project.

### 6.1 Test-first evidence

1. `node --test tests/app-manifest.test.js`
   - exit 1 as expected before implementation;
   - 10 passed, 1 failed only because actual v80 differed from required v81.
2. `npm run build:test` plus the Chromium journey grep
   - exit 1 as expected before implementation;
   - failure was the old **Registrar sinal** action instead of the required calibration action.

These failures established that the new behavior was not already passing accidentally.

### 6.2 Focused passing evidence

| Command | Exit | Result |
|---|---:|---|
| `node --test tests/app-manifest.test.js tests/service-worker-composition.test.js` | 0 | 20 passed |
| `node --test tests/capability-context-model.test.js tests/state-foundation.test.js tests/history-evidence-model.test.js tests/storage-quota.test.js tests/app-manifest.test.js tests/service-worker-composition.test.js` | 0 | 67 passed |
| `npx playwright test tests/browser/capability-context-flows.spec.js --project=chromium --project=mobile` | 0 | 24 passed |
| PWA controlled complete-cache grep, Chromium | 0 | 1 passed |
| Local Data Safety + Design System, Chromium/mobile | 0 | 32 passed, 4 conditional skips |
| `node --check` on both changed production modules and both changed browser specs | 0 | No syntax errors |

The first focused PWA attempt failed because the test's second Study Session had no Capability context. Product behavior correctly omitted calibration. The test was corrected to select the Capability explicitly; the rerun passed. No inference was added to product code.

### 6.3 Canonical full gate

`npm run test:all`

- exit: 0;
- Node: 213 passed, 0 failed, 0 skipped;
- browser: 237 passed, 0 failed, 23 project/viewport conditional skips;
- total passing: **450**;
- browser duration: approximately 8.1 minutes.

`git diff --check`

- exit: 0;
- no whitespace error;
- Git emitted existing Windows line-ending conversion warnings for the eight changed paths.

Formatting, lint, and type-check commands: **Not configured** by the repository. No substitute command was invented.

## 7. Autonomous decisions

1. Used a dedicated `data-completion-calibration` selector so the existing execution-only generic signal remains separate and testable.
2. Centralized all specialized dialog copy/state in `learning-outcome-feature.js`; `evidence-feature.js` sends only a semantic presentation marker and stable domain inputs.
3. Required a strict compatible payload before activating calibration mode; malformed presentation requests cannot silently create a calibration.
4. Kept the signal type control in the DOM but hidden from layout/accessibility only during calibration, with value fixed to `insight`; reset restores generic behavior.
5. Did not edit CSS because the existing design-system primitives passed desktop, mobile, coarse-pointer, and 200% checks.
6. Updated the existing PWA scenario to choose Capability explicitly rather than inferring it from a linked Study.
7. Advanced the manifest generation once, with no Service Worker logic change.
8. Did not run `npm audit fix`; npm reported two high-severity dependency findings, but dependency remediation is outside this delivery.

## 8. Deviations and defects encountered

- The installed `sdd-build` package references a BUILD_REPORT template that is absent. This report follows the complete skill contract and repository SDD conventions.
- A syntax error was briefly introduced while extending two backup assertions. `node --check` identified it before browser execution; it was corrected within the authorized test path.
- The first PWA calibration test used an unlinked Study Session. The missing action was correct product behavior, so the fixture was corrected to explicit association.
- No Design scope, file, schema, UI-architecture, or behavioral deviation remains.

## 9. Residual risks and limitations

- Automated Chromium/mobile tests do not constitute a human observation of an already-installed production PWA closing and reopening across v80→v81. That remains a later Ship/publication evidence item if required.
- No assistive-technology manual session was performed; critical semantics and keyboard/focus behavior are automated.
- The npm audit findings remain unresolved and explicitly outside scope.
- The build is local and uncommitted. No remote CI evidence exists for this branch.

## 10. Git and publication actions

Performed:

- created/used branch `codex/evidence-based-calibration` in its clean worktree;
- modified only the eight manifest paths;
- created/updated SDD artifacts and this Build report.

Not performed:

- commit;
- push;
- pull request;
- merge/rebase;
- deployment;
- GitHub Pages publication;
- Service Worker release;
- user-data cleanup or migration.

## 11. Build gate

- Manifest work: 8/8 complete.
- Acceptance scenarios: 16/16 PASS.
- Focused validation: PASS.
- Full validation: 450 passed, 0 failed, 23 conditional skips.
- Scope audit: PASS.
- Data/schema compatibility: PASS, no migration.
- Offline/PWA automation: PASS.
- Mobile/accessibility automation: PASS.
- Blockers: none.

**Build status: PASS — proceed to `$sdd-ship` only on explicit continuation.**

## 12. Revision history

| Revision | Date | Change |
|---|---|---|
| 1.0 | 2026-09-14 | Initial completed Build report for Evidence-Based Calibration. |
