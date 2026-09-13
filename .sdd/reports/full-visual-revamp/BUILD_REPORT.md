# BUILD REPORT: Full Visual Revamp

## Metadata

| Field | Value |
|---|---|
| Date | 2026-09-12 |
| Status | **Local Build complete — remote Linux CI and production update evidence pending** |
| Branch | codex/full-visual-revamp |
| Baseline | f19c55cb99186330d918e96cb940f1a7a5ae8182 |
| Design | .sdd/features/full-visual-revamp/DESIGN.md revision 1.0 |

## Implemented

Shared static notebook palette/type, shell, controls, surface/dialog typography,
responsive filters, Notes editor/tree treatment and PiP static stylesheet linkage.
No domain or persistence logic changed. index.html only gains the visual marker.
Storage and service-worker.js have no diff. The state contract remains compasso.state.v3;
only the cache generation advances from v79 to v80.
Old pilot history/energy style equality is replaced because those dialogs now
enter visual scope; the existing six-state and keyboard assertions are retained.

## Manifest progress

- design-system.css, index.html, session-companion-feature.js: implemented; validation ongoing.
- knowledge-graph-feature.js: unchanged; optional domain color edits not yet needed.
- app-manifest.js: advanced to v80 after fetch confirmed origin/main remains f19c55c/v79.
- docs/design-system.md: updated with ownership and limitations.
- full-visual browser spec: route/dialog geometry plus actual-entry high-variance workflow matrix implemented and passing in Chromium/mobile.
- core-visual browser spec: superseded non-pilot visual expectation updated; behavior retained.
- design-system browser spec: menu overlay explicitly closed with its trigger using Enter before activating a control behind it; arrow navigation and dialog focus assertions retained.
- app-manifest tests: generation guard added; existing shared CSS cache-asset/state tests retained.
- Windows snapshots: generated and reviewed; Linux snapshots remain unchanged/pending actual Linux render.
- SDD: Define/Design remain uncompleted Build; coverage and report record progress.

## Validation evidence

| Command/procedure | Result |
|---|---|
| npm ci | Exit 0; 3 packages; lockfile unchanged; 2 existing high-severity audit findings |
| Baseline full-visual spec with COMPASSO_VISUAL_BASELINE=1 | 2 capture procedures passed; deliberately no notebook assertion, not product acceptance |
| Initial post-change full-visual matrix | Failed: 8px mobile legacy actions and radio input misclassified as text input |
| Corrected full-visual + core-visual --project=chromium | 5 passed, exit 0, 39.3s; later visual polish requires final verification |
| design-system spec --project=chromium --update-snapshots after polish | 6 passed, 3 expected skips, exit 0, 9.0s; Windows snapshots reviewed |
| Initial npm run test:all | Exit 1: 213 Node passed; 207 browser passed, 22 skipped, 1 mobile menu test failed; %TEMP%/compasso-full-all.log |
| Corrected focused matrix | Exit 0: 25 passed, 7 expected skips, 1.3m; %TEMP%/compasso-full-focused-corrected.log; subsequent visual corrections require final validation |
| Expanded text/contrast route-dialog matrix | Exit 0: 2 passed, 30.1s; %TEMP%/compasso-visual-text-fixed.log |
| Exact Windows screenshot refresh | Exit 0: 1 passed; --update-snapshots=all; all 360/768/1280 images inspected |
| Final product full suite before generation bump | Exit 0: 213 Node + 212 browser passed, 22 conditional skips, 0 failures; browser 6.6m; %TEMP%/compasso-full-all-corrected.log |
| npm test after v80 bump | Exit 0: 213 passed, 0 failures; %TEMP%/compasso-v80-node.log |
| v80 Chromium visual/design-system/PWA lifecycle | Exit 0: 20 passed, 3 conditional skips, 54.9s; %TEMP%/compasso-v80-final.log |
| Final Node after variant closure | Exit 0: 213 passed, 0 failures; %TEMP%/compasso-variants-closed-node.log |
| Final Browser after variant closure | Exit 0: 236 passed, 22 expected conditional skips, 0 failures, 8.8m; %TEMP%/compasso-variants-closed-browser.log |
| Final canonical total | 449 passes, 22 expected conditional skips, 0 failures |
| Post-cleanup affected visual checks | Exit 0: 4 passed in Chromium/mobile, 0 failures; %TEMP%/compasso-post-cleanup-visual.log |
| Desktop-board focused visual matrix | Exit 0: 36 passed, 4 expected conditional skips, 0 failures, 3.0m; core and full-visual specs |
| Desktop-board final Node | Exit 0: 213 passed, 0 failures |
| Desktop-board final Browser | Exit 0: 237 passed, 23 expected conditional skips, 0 failures, 8.6m; `%TEMP%/compasso-desktop-board-browser.log` |
| Desktop-board final canonical total | 450 passes, 23 expected conditional skips, 0 failures |
| git diff --check | PASS |
| Lint/typecheck | Not configured |

## Acceptance and limitations

AT-001–AT-007, AT-009, AT-011 and AT-013 now have local automated and reviewed visual
evidence; high-variance actual-entry workflows are recorded in the reconciled
coverage ledger. AT-008 has the user's recorded physical 200% acceptance. AT-010 has
local generation/offline and simulated same-origin PiP evidence, while the
installed update and actual document-PiP observation remain external. AT-012 is
locally reconciled and retains those environment-specific qualifications. Old
pilot human approval is not reused.

## Decisions and corrections

Scoped important rules override preexisting important mobile/action colors.
Radio inputs are excluded from editable text-size assertions, like checkboxes.
Windows Python default decoding briefly altered non-ASCII comments/test fixtures;
UTF-8 was restored before final validation and source diff was checked.

## Remaining work

Perform actual PiP verification; render/review Linux snapshots on Linux; obtain
expanded human zoom/installed-client evidence. WSL inventory did not return
and was interrupted; no Linux environment is claimed available.

No commit, push, PR, merge, deployment, publication or user-data cleanup performed.

## Follow-up corrections — 2026-09-07

The first focused rerun failed on an unsupported Escape assumption added to the
menu test and on a pending stylesheet request in the about:blank PiP mock.
The existing trigger closes by keyboard Enter. The PiP fixture now opens a
same-origin isolated empty HTML document and awaits load; shared CSS and return
control pass in both projects. This is document-construction evidence, not an
actual document-PiP platform pass. No production behavior change was needed.

Manual screenshot inspection additionally caught dark Context/Weakness hero
backgrounds with dark text, legacy pale Deep Work labels, and small direct div
text omitted by the initial geometry audit. Static scoped rules correct them;
the audit now covers direct div/span/time text and contrast for hero text and
visible dialog labels, small text, headings and paragraphs. Graph labels use
14px SVG text without changing node data or layout logic. The expanded audit passed; final v80 focused verification is recorded in the table.

The complete suite used the final product/test changes before the isolated v80
manifest bump. Node and relevant Chromium checks are repeated after that bump;
this distinction is intentional. PWA lifecycle fixtures use synthetic generations,
so they do not constitute human same-origin installed v79-to-v80 smoke evidence.

## Conditional coverage continuation — 2026-09-08

Added real-entry capture inbox/long-content/missing-context validation coverage
in the authorized full-visual spec. Fixed five legacy capture text selectors from
10–12px to the 14px minimum; persistence/navigation handlers remain unchanged.
Full visual suite: 8 passed, 2 conditional skips, 43.2s, exit 0
(%TEMP%/compasso-visual-expanded-sep08.log). The previous 425-pass full-suite
record predates these scoped changes and is not relabeled as a new full run.
Capture functional regressions: 15 passed, 1 expected skip, 36.0s, exit 0
(%TEMP%/compasso-capture-regression-sep08.log).
Final explicit scroll-reachability checks for error and confirmation at 480px
height: 2 passed, 10.6s, exit 0 (%TEMP%/compasso-capture-scroll-sep08.log).
Captured inbox and error-dialog images were inspected; dialog overflow remains
scrollable and both error and confirmation fit fully after scrolling.
git diff --check passed.
Docker CLI is installed; the Linux engine named pipe is unavailable. Linux
screenshots remain pending. No Git publication actions performed.

## Deep Work, contextual results and selected graph — 2026-09-08

Added actual-entry tests for running/finishing Deep Work with long outcome and
captured distraction, populated contextual evaluation, and graph search/Enter
selection. Checks cover four widths and 480px viewport height in both projects.
Screenshots of completion, evaluation and selected-node details were inspected.
Graph review found metadata-label word splitting and low-contrast isolated/type
text; four scoped CSS rules correct these without changing graph/domain behavior.
Final expanded visual spec: 14 passed, 2 expected skips, 52.1s, exit 0
(%TEMP%/compasso-final-states-sep08.log). git diff --check passed.
The full-suite 425-pass record remains historical; it was not rerun or relabeled
for these additions. Remaining conditional states and external/manual evidence
remain explicit in SURFACE_COVERAGE. Build remains Incomplete; no Git publication.

## Automated variant closure — 2026-09-12

Added actual-entry visual coverage for capability validation/resources/archive;
all enabled Journal edit, migration and transform selections plus day closure;
all capture decisions and contextual question modes; Notes editor/split/preview
and persistence failure/retry; Weaknesses empty/open/resolved/edit; Vault empty
and populated previews with merge/copies/replace selected; completed session and
Evidence history editing; settings malformed-import/restore/reset safeguards.
Every scenario audits 360/390/768/1280px in Chromium and the mobile project.

The focused variant matrix passed 16/16 in 2.0m. The complete visual spec passed
30 tests with 2 expected project skips in 3.3m. Screenshot review then caught and
corrected mid-word wrapping in the Weakness source label and missing separation
between Analytics domain names and counts; the four affected Chromium/mobile
checks passed after correction. Final canonical validation passed 213 Node and
236 Browser tests, with 22 expected conditional skips and 0 failures: 449 passes
in total. No earlier count is reused for these changes.

## Desktop composition iteration — 2026-09-12

User review of the live desktop Today view found that the flat presentation left
related information visually detached and created unclear responsive behavior.
DEFINE 1.1 and DESIGN 1.1 add AT-013 and replace that presentation with bounded
semantic modules and an explicit work/support grid. The layout pairs primary
action/intention, plan/weekly focus and recommendations/decisions at desktop
widths, and returns to one column below 1200px. Flow Matching uses a bounded
result grid with the principal recommendation spanning the module.

The focused core/full-visual matrix passed 36 tests with 4 expected conditional
skips. The final canonical run passed 213 Node and 237 Browser tests with 23
expected conditional skips: 450 passes and 0 failures. The dedicated AT-013 test
checks module boundaries and proportions at 1280/1600px, single-column order at
1024/390px, recommendation hierarchy, hover feedback and global overflow. The
generated 1600/1024/390 captures were inspected; an initially stretched empty
intention module was corrected before the final run.

## Remote Linux reconciliation — 2026-09-13

PR #81 run 34784166655 completed 213 Node tests and 236 Browser tests before
failing only the obsolete `design-system-360-chromium-linux.png` comparison
(50,503 pixels, ratio 0.18). No product, layout, overflow or behavior assertion
failed. DESIGN 1.2 adds failure-artifact retention to the Browser workflow so
the actual Ubuntu-rendered image can be downloaded, reviewed and used as the
Linux baseline. A Windows image will not be copied into the Linux baseline.
The first retained artifact confirmed only the first-loop 360px mismatch because
Playwright stops that test at the first failed expectation. DESIGN 1.3 therefore
uses the existing manual workflow dispatch as a focused native-Linux renderer for
all 360/768/1280 baselines, uploads those files for review, and leaves pull-request
runs on the unchanged canonical `npm run test:all` gate.

Workflow-dispatch run 34785347051 generated all three Linux baselines in 51s and
passed the focused snapshot procedure. The downloaded 360/768/1280 PNGs were
visually reviewed before replacing their matching Linux files. They show readable
controls, bounded cards and contained navigation at each viewport. The subsequent
pull-request run remains the authoritative remote canonical gate.
