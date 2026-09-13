# Full Visual Revamp — Surface coverage

Status: Local automated visual coverage complete on Windows, including the desktop Today composition. Human installed-PWA, real document-PiP and remote Linux evidence remain release gates.

Extracted from literal view/dialog markup at f19c55c. This is source inventory, not proof of live reachability. Build must reconcile it against the full composed app. Use existing public actions to enter each state. Programmatic showModal can support layout checks but does not replace entry/focus/workflow tests.

| Root | Source owner | Kind | Build evidence |
|---|---|---|---|
| `#compassoShellResetDialog` | `index.html` | dialog | Four-width audit, actual lifecycle entry and cancellation passed in Chromium/mobile; confirmation/persistence remains covered by PWA lifecycle regression |
| `#overviewView` | `index.html` | section | Legacy root; IA model resolve(overview) returns today (information-architecture-model.js:32). Not reopened as a live route. |
| `#readingView` | `index.html` | section | Four-width route audit passed; populated/conditional coverage partial |
| `#studyView` | `index.html` | section | Four-width route audit passed; populated/conditional coverage partial |
| `#goalView` | `index.html` | section | Four-width route audit passed; populated/conditional coverage partial |
| `#notesView` | `index.html` | section | Editor/split/preview, long Markdown/wikilink, durable save, failure and retry passed at four widths in Chromium/mobile |
| `#itemDialog` | `index.html` | dialog | Four-width layout/text/selected contrast audit passed; entry and conditional states partial |
| `#restoreDialog` | `index.html` | dialog | Four-width audit plus valid restore confirmation, malformed JSON status and cancellation passed in Chromium/mobile; failure compensation remains covered by Local Data Safety regression |
| `#analyticsView` | `analytics-feature.js` | section | Four-width route audit plus completed session/Evidence history and edit entry passed in Chromium/mobile; populated capture reviewed |
| `#captureInboxView` | `capture-feature.js` | section | Empty and populated long-content inbox checked; all six processing decisions and validation states passed at four widths in Chromium/mobile |
| `#captureDialog` | `capture-feature.js` | dialog | Four-width layout/text/selected contrast audit passed; entry and conditional states partial |
| `#captureProcessDialog` | `capture-feature.js` | dialog | Real entry plus note/recall/action/evidence/archive/discard context and fields steps passed at four widths in Chromium/mobile |
| `#captureDistillDialog` | `capture-feature.js` | dialog | Four-width layout/text/selected contrast audit passed; entry and conditional states partial |
| `#captureSourceDialog` | `capture-feature.js` | dialog | Four-width layout/text/selected contrast audit passed; entry and conditional states partial |
| `#contextView` | `context-rag-feature.js` | section | Four-width route audit, populated evaluation and explain/apply/contrast question generation passed in Chromium/mobile |
| `#planbDialog` | `contingency-feature.js` | dialog | Four-width layout/text/selected contrast audit passed; entry and conditional states partial |
| `#deepDialog` | `deep-work-feature.js` | dialog | Real entry, long running state, distraction and completion form passed at four widths in Chromium/mobile |
| `#deepOutcomeView` | `deep-work-feature.js` | div | Long running outcome, distraction capture and finish form audited at four widths/480px; real entry and completion passed in both projects |
| `#dictionaryView` | `dictionary-relations-feature.js` | section | Four-width route audit passed; populated/conditional coverage partial |
| `#driveReconcileDialog` | `drive-reconcile-feature.js` | dialog | Four-width layout/text/selected contrast audit passed; entry and conditional states partial |
| `#energyMapDialog` | `energy-feature.js` | dialog | Four-width layout/text/selected contrast audit passed; entry and conditional states partial |
| `#historySessionDialog` | `history-edit-feature.js` | dialog | Real completed-session history entry and edit dialog passed at four widths in Chromium/mobile |
| `#historyEvidenceDialog` | `history-edit-feature.js` | dialog | Real Evidence entry and edit dialog passed at four widths in Chromium/mobile |
| `#journalView` | `journal-feature.js` | section | Empty route plus populated task/intention and close-day states passed at four widths in Chromium/mobile |
| `#journalEntryDialog` | `journal-feature.js` | dialog | Real edit entry and every enabled select option passed at four widths in Chromium/mobile |
| `#journalMigrationDialog` | `journal-feature.js` | dialog | Real entry and every migration decision/reason variant passed at four widths in Chromium/mobile |
| `#journalTransformDialog` | `journal-feature.js` | dialog | Real entry and every transform target passed at four widths in Chromium/mobile |
| `#journalCloseDialog` | `journal-feature.js` | dialog | Real populated day-closure entry passed at four widths in Chromium/mobile |
| `#capabilitiesView` | `learning-outcome-feature.js` | section | Validation, populated, archived and resource-expanded variants passed at four widths in Chromium/mobile |
| `#learningOutcomeDialog` | `learning-outcome-feature.js` | dialog | Real new/edit entry, required validation and expanded resource options passed at four widths in Chromium/mobile |
| `#capabilityResourceDialog` | `learning-outcome-feature.js` | dialog | Four-width layout/text/selected contrast audit passed; entry and conditional states partial |
| `#learningSignalDialog` | `learning-outcome-feature.js` | dialog | Four-width layout/text/selected contrast audit passed; entry and conditional states partial |
| `#vaultDialog` | `markdown-vault-feature.js` | dialog | Real Notes entry, empty and populated external-Markdown previews, warning/status, merge/copies/replace selection passed at four widths in Chromium/mobile |
| `#outcomesView` | `outcomes-feature.js` | section | Four-width route audit passed; populated/conditional coverage partial |
| `#recallView` | `recall-feature.js` | section | Four-width route audit passed; populated/conditional coverage partial |
| `#recallDialog` | `recall-feature.js` | dialog | Actual contextual generation entry for explain/apply/contrast passed at four widths in Chromium/mobile |
| `#ritualDialog` | `ritual-feature.js` | dialog | Four-width layout/text/selected contrast audit passed; entry and conditional states partial |
| `#sessionStartDialog` | `sessions-feature.js` | dialog | Four-width layout/text/selected contrast audit passed; entry and conditional states partial |
| `#sessionFinishDialog` | `sessions-feature.js` | dialog | Four-width layout/text/selected contrast audit passed; entry and conditional states partial |
| `#sessionHistoryDialog` | `sessions-feature.js` | dialog | Four-width layout/text/selected contrast audit passed; entry and conditional states partial |
| `#todayView` | `today-feature.js` | section | Empty/populated behavior and semantic modules passed; dedicated desktop board passed at 1280/1600px, collapsed order at 1024/390px, and Flow Matching result hierarchy/interaction with reviewed captures |
| `#todayDialog` | `today-feature.js` | dialog | Four-width layout/text/selected contrast audit passed; entry and conditional states partial |
| `#uxExecutionDialog` | `ux-consolidation-feature.js` | dialog | Four-width layout/text/selected contrast audit passed; entry and conditional states partial |
| `#weaknessView` | `weakness-feature.js` | section | Empty, populated open and resolved states passed at four widths in Chromium/mobile; corrected captures reviewed |
| `#weaknessDialog` | `weakness-feature.js` | dialog | Real new/edit entry and required-field validation passed at four widths in Chromium/mobile |
| `#weeklyPlanDialog` | `weekly-plan-feature.js` | dialog | Four-width layout/text/selected contrast audit passed; entry and conditional states partial |
| `#weeklyView` | `weekly-review-feature.js` | section | Four-width route audit passed; populated/conditional coverage partial |

## Additional dynamic and shared surfaces

| Surface | Owner | Evidence |
|---|---|---|
| Sidebar/header/mobile navigation/settingsMenu | index.html, information-architecture-feature.js, ux-consolidation-feature.js | Route matrix and existing keyboard navigation pass; settings open/error states and mode/Drive disabled controls audited at four widths in Chromium/mobile |
| Frentes/Revisão dynamic hubs | information-architecture-feature.js | Pending |
| Notes editor/preview, vault explorer, search/context panes | index.html, markdown-vault-feature.js, capture-feature.js | Editor/split/preview, autosave failure/retry, long Markdown/wikilink and Vault strategy variants pass in both projects |
| Graph modes, toolbar, node details and relation editor | dictionary-relations-feature.js, knowledge-graph-feature.js/lifecycle | Search/Enter selection and node details audited in both projects; relation editing variants remain partial |
| Contextual question/explanation controls | context-rag-feature.js, context-learning-feature.js | Populated evaluation and generated explain/apply/contrast variants pass in both projects/four widths |
| Journal intention, weekly panels and shared capability context | journal-feature.js, learning-outcome-feature.js | Journal intention/entry/migration/transform/closure and capability validation/resources/archive variants pass; canonical weekly/capability behavior retained |
| Deep Work controls and Companion/E1 panel | deep-work-feature.js, session-companion-feature.js | Running/distraction/finish and quick-session history/Evidence variants pass in both projects; E1 behavior retained by canonical regression |
| Picture-in-Picture separate document | session-companion-feature.js | Pending; support limitation separate from pass |
| Toasts/errors/loading/recovery/bootstrap and Drive dialogs | design-system-feature.js, bootstrap-diagnostics.js, drive-sync-feature.js, drive-reconcile-feature.js | Settings malformed-import status, restore/reset safeguards and disconnected Drive controls pass; bootstrap/update/reconcile behavior remains covered by canonical lifecycle and sync tests |

For each row record empty/populated and relevant error/disabled/loading states, entry action, actual route/mode, viewport, screenshot path and result. Cover 360/390/768/1280px; use at least one long-content fixture. Record manual 200% results by family separately. Historical/retired overviewView or unreachable elements must be classified with source evidence, not reopened for testing or silently omitted. Any newly discovered supported surface is added here; if its implementation requires a new file, Iterate the manifest first.


## Build progress — 2026-09-07

The first post-change Chromium matrix passed: 16 routes × 4 widths and 30
installed dialogs × 4 widths. Dialogs were opened through showModal for geometry,
not through all domain entry paths. Pilot six-state/keyboard checks also passed.
Additional visual polish followed; the final product full suite passed (213 Node + 212 browser, 22 conditional skips). These results do not
close all-state or manual coverage.

Reviewed screenshots: Frentes, Estudos, Notas, Journal, weekly review; Windows
study snapshots 360/768/1280. Review caught mobile filter word splitting, legacy
action colors, sidebar label duplication and low-contrast Notes tree backgrounds;
scoped corrections were applied. All remaining screenshot rows and populated
conditional states remain pending full visual review.

Baseline capture: `%TEMP%/compasso-full-visual-baseline/` (copied before new runs).
New captures/audits: `test-results/full-visual-revamp-*/` (regenerated by tests).

## Expanded audit — 2026-09-07

- Corrected focused suite: 25 passed, 7 conditional skips (Chromium and Pixel 7).
- After screenshot-driven fixes, route/dialog audit: 2 passed, 30.1s. This covers
  16 supported routes and 30 installed dialogs at 360/390/768/1280px; zero findings
  in measured text size, targets, geometry and selected text contrast.
- Notes focus, selection (3..11), durable save and reload passed in both projects.
- Same-origin simulated PiP document loaded static CSS, offered a 44px return
  button, and returned to the main companion in both projects. Real PiP pending.
- Additional screenshots inspected: Analytics, Relations/graph, Context, Reading,
  Recall, Weakness, Outcomes, Goals, Review; dialogs Deep Work, Restore and Vault.
  Findings corrected: dark hero contrast, pale Deep labels, small auxiliary text.
- Exact Windows snapshots were regenerated with --update-snapshots=all and all
  three inspected, avoiding retention of old pixels inside matcher tolerance.
- This audit is not every populated/error/loading state and does not verify text
  contrast over arbitrary images or translucent layers. Real 200%/installed PWA,
  matching Linux snapshots and remaining conditional surfaces remain pending.

Corrected Context, Weakness and Deep Work screenshots were re-opened after the fixes and visually confirmed readable.

Final local generation: compasso-pages-v80, with compasso.state.v3 unchanged.
After the generation bump: 213 Node passed; Chromium visual/design-system/PWA
checks 20 passed and 3 conditional skips, 54.9s. No Linux or installed-client
result is implied by these Windows/synthetic-generation checks.

## Conditional capture audit — 2026-09-08

Actual actions open the Notes inbox, create a long capture, select Evidence and
submit without a source. The existing validation remains visible; Escape closes
the dialog and preserves the inbox. Geometry/text checks cover the populated inbox
and error dialog at four widths with 480px height. This exposed legacy 10–12px
text in empty state, card body, preview, warning and error; scoped CSS raises it
to 14px. Full visual spec after correction: 8 passed, 2 expected skips, 43.2s.
Docker CLI exists but docker info cannot connect to DockerDesktopLinuxEngine;
no Linux render or CI result has been produced.

Capture regressions: 15 passed, 1 skip. Scroll-reachability checks: 2 passed; the error and confirmation each fit fully in a 480px viewport after scrolling. Inbox and dialog captures visually inspected.

## Running/contextual/graph states — 2026-09-08

Real-entry Deep Work running and completion with long outcome and distraction,
and populated contextual evaluation: 4 tests passed, 13.8s. The finish action
fits within the 480px viewport after scrolling. Images inspected.
Graph search using Enter selects a node and exposes its details: 2 passed,
4.8s, both projects, four-width audit. Screenshot review identified metadata
label splitting and low-contrast isolated-relation text; corrected with scoped static CSS (nonwrapping metadata labels, wrapping metadata rows, readable relation text and type label).

Final expanded visual spec after graph text corrections: 14 passed, 2 expected skips, 52.1s, exit 0 (%TEMP%/compasso-final-states-sep08.log). Corrected node-details image inspected.

## Automated variant closure — 2026-09-12

The high-variance visual workflows were exercised through their actual entry
actions at 360/390/768/1280px in Chromium and the mobile project. The matrix
covers capability required validation/resources/populated/edit/archived;
every enabled Journal edit/migration/transform option and populated day closure;
all six capture decisions and their context/field steps; explain/apply/contrast
question generation; Notes editor/split/preview plus durable failure/retry;
Weaknesses empty/open/resolved/edit; Vault empty/external preview plus all three
strategy selections; completed history/Evidence edit dialogs; and settings,
malformed import, restore cancellation and shell-reset confirmation.

- Focused variant matrix: 16 passed, 0 failed, 2.0m.
- Complete full-visual spec: 30 passed, 2 expected project skips, 0 failed,
  3.3m (`%TEMP%/compasso-full-visual-variants-closed.log`).
- Screenshot review corrected mid-word wrapping in the Weakness source label and
  missing separation between Analytics domain labels and counts. Both affected
  scenarios then passed in Chromium/mobile (4 passed, 0 failed).
- Automated visual variant coverage is closed. Real browser-menu 200% for the
  expanded families, an installed v79 to v80 update, actual document PiP and
  matching Linux snapshot review remain separately attributed external evidence.
