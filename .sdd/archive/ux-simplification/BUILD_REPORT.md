# BUILD REPORT: UX Simplification — Continuity-first learning journey

## Metadata

| Field | Value |
|---|---|
| Feature slug | `ux-simplification` |
| Date | `2026-08-10` |
| Last iterated | `2026-08-11` |
| Revision | `0.4` |
| Status | `Shipped` |
| Define | `.sdd/features/ux-simplification/DEFINE.md` |
| Design | `.sdd/features/ux-simplification/DESIGN.md` |

## Summary

The approved 22-path manifest is complete: the original 20-path product, documentation, and focused-test implementation plus the two test-only paths authorized by DESIGN revision 1.1. Hoje derives one stored-order primary state; global Execute delegates to it; capability Sessions use existing defaults and optional configuration disclosure; Session and Deep Work completion persist canonical Evidence before exposing an ephemeral continuation; optional learning-signal capture retains explicit consent; and Weekly Review is decision-first with collapsed supporting detail. State remains `compasso.state.v3`, the Service Worker architecture is unchanged, and the manifest-owned generation is `compasso-pages-v74`.

The resumed Build changed only `tests/browser/critical-flows.spec.js` and `tests/browser/learning-outcome-flows.spec.js`. Their persistence, ownership, CRUD, provenance, resource-metric, Evidence, focus, and JSON round-trip assertions remain active while the interactions now follow the approved primary placement, progressive disclosure, and explicit completion continuation. Focused and canonical validation pass, and all 25 acceptance scenarios remain satisfied.

Build correction 0.4 addresses the AT-05/AT-22 focus defect exposed by PR #74 on remote Linux CI. Hoje now preserves semantic focus on its current projected primary action across a complete render cycle and restores it only after the existing `render:after` boundary. The affected acceptance test also waits for the existing PWA shell-coherence boundary before simulating keyboard input, then deliberately invokes `renderAll()` and proves the projected `Nova ação` control retains focus. The correction adds no durable state and changes no precedence, fallback, persistence, route, ownership, or PWA contract.

## Build correction 0.4 — remote CI AT-05 / AT-22

Remote run `31484989313` passed all 183 Node tests and 155 browser tests, skipped 19 project-conditional cases, and failed the same Execute fallback focus assertion in desktop Chromium and mobile Chromium, including retries. GitGuardian passed. No merge or release action occurred.

Source and runtime diagnostics found two related ordering hazards:

1. `todayOpenPrimary()` applied a one-shot focus request, while `renderTodayPrimary()` replaces the projected action node through `innerHTML`; a subsequent `renderAll()` therefore detached the focused node and left `document.activeElement` on `body`.
2. The browser helper considered the feature runtime ready before the existing PWA lifecycle had removed `hidden`/`inert` from `.app-shell`. On a cold or slower host, programmatic focus on global Execute was therefore a no-op even though the runtime object already existed. A keyboard user cannot reach this control until that existing coherence boundary completes.

The correction keeps the approved requestAnimationFrame handoff for the initial view change, records only an ephemeral focus-restoration flag when the currently focused element is the projected primary action, and consumes that flag on the existing `render:after` event if Hoje is still the active view. The test retains native keyboard activation, adds the real PWA-interactive precondition, and strengthens AT-05/AT-22 by forcing a full rerender before reasserting focus.

## Manifest task execution

| # | Manifest path | Action | Status | Acceptance coverage | Notes |
|---:|---|---|---|---|---|
| 1 | `app-manifest.js` | Modify | Complete | AT-23, AT-24 | Generation advanced to v74; state and composition preserved. |
| 2 | `today-feature.js` | Modify | Complete | AT-01–AT-05, AT-15, AT-19, AT-25 | One derived primary state, safe unavailable states, continuity commands, and post-render semantic focus restoration. |
| 3 | `sessions-feature.js` | Modify | Complete | AT-01, AT-06–AT-09 | Existing form/defaults, disclosure, resume, and awaited candidate commits. |
| 4 | `evidence-feature.js` | Modify | Complete | AT-09–AT-15 | Canonical Evidence join and ephemeral completion handoff. |
| 5 | `deep-work-feature.js` | Modify | Complete | AT-01, AT-09–AT-12 | Awaited completion/interruption and deterministic resume. |
| 6 | `learning-outcome-feature.js` | Modify | Complete | AT-10–AT-14, AT-23 | Signal provenance/consent handoff; automatic redirect removed. |
| 7 | `weekly-review-feature.js` | Modify | Complete | AT-16–AT-20 | Decision-first order, explicit validation, disclosures, and focus command. |
| 8 | `journal-feature.js` | Modify | Complete | AT-07, AT-16, AT-20, AT-23 | Existing Session and Weekly content composed into disclosures without a second Session write. |
| 9 | `information-architecture-feature.js` | Modify | Complete | AT-01, AT-03–AT-05, AT-19, AT-22, AT-25 | Accessible global Execute delegates to Today. |
| 10 | `design-system.css` | Modify | Complete | AT-02, AT-07, AT-09, AT-16, AT-20–AT-22 | Static journey, responsive, coarse-pointer, focus, and reduced-motion styles. |
| 11 | `docs/today-feature.md` | Modify | Complete | AT-01–AT-05, AT-15, AT-19, AT-25 | Primary precedence and ownership documented. |
| 12 | `docs/sessions-feature.md` | Modify | Complete | AT-01, AT-06–AT-09 | Default/configured starts and transaction limits documented. |
| 13 | `docs/evidence-feature.md` | Modify | Complete | AT-09–AT-14, AT-23 | Completion/signal handoff and canonical provenance documented. |
| 14 | `docs/weekly-review-feature.md` | Modify | Complete | AT-16–AT-20 | Decision-first composition and rollback documented. |
| 15 | `docs/capability-first-compasso.md` | Modify | Complete | AT-06, AT-08–AT-19, AT-23 | Continuity composition and v74 boundaries documented. |
| 16 | `tests/today-central-contract.test.js` | Modify | Complete | AT-01–AT-05, AT-15, AT-19, AT-25 | Static primary/fallback/unavailable contracts. |
| 17 | `tests/app-manifest.test.js` | Modify | Complete | AT-23, AT-24 | v74 and state-v3 assertions. |
| 18 | `tests/browser/capability-context-flows.spec.js` | Modify | Complete | AT-02–AT-21, AT-23–AT-25 | Journey, persistence failures, legacy, backup, and responsive coverage. |
| 19 | `tests/browser/information-architecture-flows.spec.js` | Modify | Complete | AT-01, AT-03–AT-05, AT-19, AT-22, AT-25 | Execute name, stored order, fallback, rerender focus retention, PWA-ready keyboard activation, start, and resume coverage. |
| 20 | `tests/browser/design-system-flows.spec.js` | Modify | Complete | AT-07, AT-09–AT-13, AT-16–AT-22 | Keyboard, disclosure, 360/390 px, zoom, pointer, and motion coverage. |

### Iterate-authorized test paths

| # | Manifest path | Action | Status | Acceptance coverage | Constraint |
|---:|---|---|---|---|---|
| 21 | `tests/browser/critical-flows.spec.js` | Modify | Complete | AT-04, AT-17, AT-20, AT-23, AT-25 | Primary Hoje placement and Weekly Evidence disclosure updated; persistence and CRUD/Session-isolation assertions preserved. |
| 22 | `tests/browser/learning-outcome-flows.spec.js` | Modify | Complete | AT-06–AT-15, AT-20, AT-23 | Optional configuration, explicit continuation, and mobile settings sequencing updated; provenance, resource, Evidence, and backup assertions preserved. |

## Files changed

| Path | Purpose | Matches Design |
|---|---|---|
| `app-manifest.js` | PWA v74 generation | Yes |
| `today-feature.js` | Hoje primary state, commands, and deterministic post-render focus restoration | Yes |
| `sessions-feature.js` | Default/configured start and awaited Session transactions | Yes |
| `evidence-feature.js` | Evidence transaction and completion continuation | Yes |
| `deep-work-feature.js` | Awaited Deep Work completion and resume | Yes |
| `learning-outcome-feature.js` | Explicit signal handoff and provenance | Yes |
| `weekly-review-feature.js` | Decision-first Weekly Review | Yes |
| `journal-feature.js` | Existing Journal content placement and Session candidate input | Yes |
| `information-architecture-feature.js` | Accessible deterministic Execute | Yes |
| `design-system.css` | Journey layout and accessibility | Yes |
| `docs/today-feature.md` | Today contract documentation | Yes |
| `docs/sessions-feature.md` | Session contract documentation | Yes |
| `docs/evidence-feature.md` | Evidence contract documentation | Yes |
| `docs/weekly-review-feature.md` | Weekly Review documentation | Yes |
| `docs/capability-first-compasso.md` | Cross-surface compatibility documentation | Yes |
| `tests/today-central-contract.test.js` | Today static contracts | Yes |
| `tests/app-manifest.test.js` | PWA/state contracts | Yes |
| `tests/browser/capability-context-flows.spec.js` | End-to-end journey and compatibility | Yes |
| `tests/browser/information-architecture-flows.spec.js` | Navigation/Execute behavior, coherent-shell precondition, and rerender focus retention | Yes |
| `tests/browser/design-system-flows.spec.js` | Accessibility/responsive behavior | Yes |
| `tests/browser/critical-flows.spec.js` | Hoje projection and Weekly Evidence disclosure regression | Yes |
| `tests/browser/learning-outcome-flows.spec.js` | Capability execution, configuration, continuation, resource, and backup regression | Yes |
| `.sdd/reports/ux-simplification/BUILD_REPORT.md` | Build evidence and completion record | SDD-required artifact |

## Validation evidence

| Category | Evidence source | Command or procedure | Exit | Result |
|---|---|---|---:|---|
| Lint | Repository scripts | `Not configured` | N/A | N/A |
| Type check | Repository scripts | `Not configured` | N/A | N/A |
| Test composition | `package.json` | `npm run build:test` | 0 | Pass |
| Focused Node | Design validation plan | `node --test tests/today-central-contract.test.js tests/app-manifest.test.js tests/capability-context-model.test.js tests/state-foundation.test.js tests/execution-session-model.test.js tests/session-timer-model.test.js tests/history-evidence-model.test.js tests/deep-work-model.test.js` | 0 | Pass — 64/64 |
| AT-05/AT-22 repeated focus | Remote-defect correction | `APP_URL=http://127.0.0.1:4183 npx playwright test tests/browser/information-architecture-flows.spec.js --grep "Executar tem nome acessível" --repeat-each=10 --retries=0` | 0 | Pass — 20/20 across Chromium and mobile, including an explicit post-focus `renderAll()` |
| Affected IA suite | Remote-defect correction | `APP_URL=http://127.0.0.1:4183 npx playwright test tests/browser/information-architecture-flows.spec.js --retries=0` | 0 | Pass — 19 pass, 1 project-conditional skip |
| Full Node | `package.json` through canonical command | `npm test` | 0 | Pass — 183/183 |
| Iterate-authorized suites | DESIGN revision 1.1 | `APP_URL=http://127.0.0.1:4174 npx playwright test tests/browser/critical-flows.spec.js tests/browser/learning-outcome-flows.spec.js --retries=0` | 0 | Pass — 71 pass, 3 project-conditional skip |
| In-manifest browser matrix | Design closed test manifest | `APP_URL=http://127.0.0.1:4183 npx playwright test tests/browser/capability-context-flows.spec.js tests/browser/information-architecture-flows.spec.js tests/browser/design-system-flows.spec.js tests/browser/critical-flows.spec.js tests/browser/learning-outcome-flows.spec.js` | 0 | Pass — 124 pass, 8 project-conditional skip |
| Service Worker composition | Design PWA regression plan | `node --test tests/service-worker-composition.test.js` | 0 | Pass — 9/9 |
| Focused PWA lifecycle | Repository PWA suite | `APP_URL=http://127.0.0.1:4174 npx playwright test tests/browser/pwa-lifecycle-flows.spec.js --retries=0` | 0 | Pass — 10 pass, 10 project-conditional skip |
| Canonical | `package.json` and CI workflow | `APP_URL=http://127.0.0.1:4174 npm run test:all` | 0 | Pass — Node 183 pass; browser 157 pass, 19 intentional project skips |
| Diff integrity | Git | `git diff --check` | 0 | Pass |
| Service Worker architecture | Git diff and PWA suite | `git diff --quiet -- service-worker.js` plus PWA lifecycle tests | 0 | Pass — no Service Worker change |

`APP_URL=http://127.0.0.1:4183` points Playwright at a temporary validation-only Node static server rooted at `.test-dist`, matching the composed journey fixture used by remote CI. `APP_URL=http://127.0.0.1:4174` points at the repository's own `scripts/pwa-test-server.js` for PWA lifecycle and canonical Windows validation because the default `python3` web-server command is unavailable on this host. No product or test configuration was changed for either host adaptation.

## Acceptance evidence

| ID | Result | Evidence |
|---|---|---|
| AT-01 | Pass | Capability-context and information-architecture browser tests verify resume precedence for normal Session; Deep Work uses the matching command. |
| AT-02 | Pass | Full journey test verifies the planned current attempt is the single primary state with immediate start and capability access. |
| AT-03 | Pass | Information-architecture test creates two attempts and verifies stored daily-plan order controls the primary/start. |
| AT-04 | Pass | Execute fallback test verifies a normal planned action is primary without inferred capability context. |
| AT-05 | Pass | Empty Execute fallback opens Today, focuses `Nova ação`, retains focus through a forced full rerender, and starts no Session. |
| AT-06 | Pass | Immediate-start journey verifies current defaults and identical Session/Execution `learningContext`. |
| AT-07 | Pass | Capability and design-system tests verify native optional disclosure, editable existing controls, Escape, and focus return. |
| AT-08 | Pass | Study/Reading tests verify resource metrics and explicit optional context without capability progress. |
| AT-09 | Pass | Awaited completion test verifies canonical Evidence by `sessionId` and focused completion panel only after persistence. |
| AT-10 | Pass | Interrupted capability-aware Deep Work opens an empty signal form and creates no record. |
| AT-11 | Pass | Evidence-derived suggestion is labelled, editable, and non-durable before save. |
| AT-12 | Pass | Signal cancel and unlinked completion paths create no signal and preserve usable Hoje continuation. |
| AT-13 | Pass | Explicit save creates exactly one `confirmed-suggestion` signal with the Evidence source. |
| AT-14 | Pass | Secondary completion action opens the capability without changing outcome or Today state. |
| AT-15 | Pass | Return to Hoje preserves the incomplete daily reference and unchanged next attempt. |
| AT-16 | Pass | Weekly test asserts capability decisions precede closure and collapsed summaries. |
| AT-17 | Pass | Explicit keep persists the reflection while preserving the outcome byte-for-byte. |
| AT-18 | Pass | Revise reveals/validates the replacement field; only successful save updates the attempt. |
| AT-19 | Pass | Hoje pending-review action focuses the first unresolved Weekly capability decision. |
| AT-20 | Pass | Native Weekly disclosures expose label/count, keyboard expand/collapse, and existing content. |
| AT-21 | Pass | Browser tests cover 360/390 px, 200% zoom, coarse pointer targets, long text, and no global overflow. |
| AT-22 | Pass | Global Execute has permanent accessible name `Executar`; native keyboard activation is exercised after the existing coherent-shell boundary and focus remains deterministic across rerender. |
| AT-23 | Pass | State/merge tests and browser backup canaries preserve state v3, unlinked legacy records, Notes/vault/Relations/Context data, JSON round-trip, and no inference. |
| AT-24 | Pass | Manifest tests verify v74; PWA lifecycle suite verifies coherent update, offline reopen, persistence, and unchanged architecture. |
| AT-25 | Pass | Other-action Execute test focuses but does not start the planned action. |

## Autonomous decisions

| # | Decision | Options | Choice | Why reversible and in scope |
|---:|---|---|---|---|
| 1 | Visible Session focus target | Hidden legacy banner or existing compact companion | Focus `sessionCompanionOpen`, with banner fallback | The design requires the active Session surface; the companion is the current visible owner. |
| 2 | Legacy energy/Flow Session wrappers | Preserve non-awaited wrapper chain or join side effects to candidate | Join existing energy/Flow side effects to the same candidate and route the form through the awaited base commit | Preserves existing records while satisfying the approved atomic Evidence boundary; no schema or owner changes. |
| 3 | Completion panel after explicit navigation | Keep fixed panel over destination or dismiss | Dismiss on `view:changed` | Ephemeral and reversible; prevents mobile obstruction while retaining all explicit continuation actions. |
| 4 | Windows browser host | Change Playwright config or use repository server via environment | Use existing PWA lifecycle server at port 4174 | Validation-only adaptation; no manifest expansion or repository change. |
| 5 | Cold-start acceptance readiness | Treat an inert PWA shell as interactive or wait for the existing coherence boundary | Wait until `.app-shell` is visible and no longer inert before keyboard activation, then force a full rerender | Matches real keyboard reachability, preserves PWA safety, and strengthens rather than removes the focus assertion. |

## Deviations from Design

| Deviation | Reason | Approval or follow-up | Impact |
|---|---|---|---|
| None in product implementation | The correction uses the Design's existing Today focus owner and runtime `render:after` boundary inside an already authorized path. | N/A | No product-scope deviation. |
| Canonical test manifest was insufficient in DESIGN v1.0 | Two existing test files asserted behavior deliberately superseded by the Design but were not authorized modification paths. | Resolved by additive Iterate 1 and the resumed Build's two test-only changes. | No remaining Build blocker; canonical validation passes. |

## Issues, blockers, and residual risks

| Type | Item | Owner or next action |
|---|---|---|
| Risk | No physical installed-PWA observation was performed during Build. | Retain as a Ship/manual smoke gate after canonical validation passes. |
| Risk | The correction has not yet been rerun in remote Linux CI. | Re-run Ship, create a scoped checkpoint, and update PR #74 so remote CI validates the corrected tree. |

## Final checklist

- [x] Every Design manifest item is implemented.
- [x] Every acceptance scenario has implementation and focused evidence.
- [x] All applicable repository validation commands pass.
- [x] Deviations and autonomous decisions are recorded.
- [x] No unauthorized release or destructive action occurred.

## Revision history

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-08-10 | Codex | Implemented the 20-path manifest; recorded canonical test-manifest blocker. |
| 0.2 | 2026-08-11 | Codex | Iterate 1 confirmed all 11 failures as superseded or invalid test interactions, recorded DESIGN v1.1 authorization for two test-only paths, and preserved the blocked status pending Build validation. |
| 0.3 | 2026-08-11 | Codex | Resumed Build updated only the two authorized suites; focused, closed-manifest, PWA, Service Worker, and canonical validation passed with 25/25 acceptance evidence. |
| 0.4 | 2026-08-11 | Codex | Reopened Build for PR #74 AT-05/AT-22: preserved Today primary focus across render completion, hardened the existing acceptance precondition against an inert PWA shell, and passed repeated focused, closed-manifest, PWA, Service Worker, and canonical validation. |
