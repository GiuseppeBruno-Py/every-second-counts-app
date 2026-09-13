# DESIGN: Compasso — Full Visual Revamp

## Metadata

| Field | Value |
|---|---|
| Feature | `full-visual-revamp` |
| Define | `./DEFINE.md`, 14/15 |
| Date / revision | 2026-09-12 / 1.1 |
| Status | **Build in progress — desktop composition iteration; prior Today visual evidence invalidated** |
| Branch / baseline | `codex/full-visual-revamp` / `f19c55cb99186330d918e96cb940f1a7a5ae8182` |
| Repository inspection | Root AGENTS, README, design-system docs/CSS, route model, manifest/composition, feature root/style inventory, PiP source, existing tests and CI |
| CodeGraph | Absent; direct source inspection |
| Phase boundary | Documentation only; no production changes, test runs or fresh live visual observations claimed |

## Current state and gap

The v79 pilot is integrated into main. Its six roots have local --pilot tokens, while global --ds tokens still use smaller type and the old palette. index.html loads app-ui.css and design-system.css before its legacy inline style block. Feature installers subsequently inject further legacy CSS. Thus changing only :root values will not replace explicit feature font sizes, colors and grouping.

The information architecture declares four main areas and multiple subviews; route ownership must remain unchanged. Native dialogs are created by feature installers. Session Companion PiP creates an independent document with its own dark injected CSS and clipped 8/12px text. Graph domain colors are explicit constants. These need deliberate presentation coverage, not an assumption that main-document inheritance reaches them.

## Target state

Continue using the existing static design-system.css and runtime accessibility enhancement. Add a static `data-visual-system="notebook"` marker to the main html element; use it as an explicit styling boundary. No new runtime feature, stylesheet, route or stored theme preference. Promote the approved palette/type into shared tokens, and alias the existing pilot tokens to those values while preserving pilot layout rules.

Organize CSS in ordered sections: shared tokens, shell, common controls, Frentes, Journal, knowledge/editing, review/charts, safety/settings, execution/history, PiP, responsive/forced-colors. Use explicit root/class selectors for legacy overrides. Do not apply global `*` font/background resets, hide overflow to make a test pass, remove semantic panels, or assign 17px to all SVG/editor descendants.

## Components and interfaces

| Component | Responsibility | Inputs | Outputs/errors | Dependencies |
|---|---|---|---|---|
| Static token layer | Palette, type, space, borders and focus | html notebook marker | Shared CSS variables; browser fallback fonts | design-system.css |
| Existing component enhancer | Accessible roles, focus and loading | Existing semantic DOM/data-ds attributes | Unchanged behavior and state announcements | design-system-feature.js, read-only |
| Family rules | Layout/type for inventoried roots | Existing classes/IDs/states | Presentation only; native scroll where necessary | Shared layer and SURFACE_COVERAGE |
| PiP document | Readable independent session view | Existing activity snapshot and opener origin | Same return/timer behavior; existing unavailable/error toast | Existing Companion lifecycle |
| Coverage test | Verify supported UI families and boundaries | Isolated generic fixtures; local integrations mocked | Screenshots, computed metrics, pass/fail/skip | Full PWA test server |

## Flows and state transitions

Existing navigation → feature render → unchanged accessibility enhancement → static family CSS.
Existing form submit → existing validation/persistence → existing success/error state → new visual treatment.
PiP request → create document → link absolute same-origin design-system.css → set notebook/PiP markers → existing markup/callbacks → existing pagehide cleanup.

No new data state or event handler is introduced by the visual marker. Read-only inspection of storage/models verifies no accidental diff. CSS must respect hidden, open, aria-busy, aria-invalid, disabled, selected and existing visibility modes. Keep loading text masking and spinner contrast intact; do not override hidden display or graph geometry/transforms.

## Decisions

### D-001: Extend shared static ownership

Use `html[data-visual-system="notebook"]` plus the actual surface root to override legacy declarations even when injected later. For root variables use `:root[data-visual-system="notebook"]`, which outranks bare legacy :root. Map legacy palette aliases (--canvas/--surface/--surface-strong/--ink/--muted/--line/--violet) and --ds roles deliberately. Keep the known light pilot palette: canvas #f5f3ed, surface #fffef9, text #252b27, muted #596259, border #868e80, accent #315a46, focus #6b3eb5, success #26613d, warning #76520b, danger #a32630.

Do not mass-remove all legacy style installers in this delivery: that is a broad migration with different cascade risk. Add no new injector and do not change old injectors except PiP, whose local replacement is explicitly designed. New durable visual rules live in the static system. Use narrowly justified !important only to compete with an existing important declaration; preserve the existing data-ds primary/destructive role semantics.

Rejected: changing every feature renderer or introducing a parallel theme stylesheet/runtime. Both broaden behavioral or ownership risk without a user benefit.

### D-002: Readable controls with specialized content boundaries

Set UI body 1.0625rem/1.55 system-ui; secondary/labels .875rem; editable fields 1rem minimum; Georgia headings 1.25–2rem. Use 44px minimum control/associated-label targets and 48px form fields; small native checkboxes retain normal dimensions within labels. Use solid 3px focus outline and verify 3:1 contrast. No external font addition.

Keep prose near 65ch, content shell bounded but responsive, auto-fit lists with minimum columns that cannot exceed viewport. Use spacing/headings first; retain meaningful editor, item, chart and safety boundaries. Graph labels retain readable 14px equivalent at default view with zoom controls; code retains monospace and contained horizontal scrolling, never shrink-to-fit. Preserve user Markdown heading hierarchy rather than treating preview content as UI labels.

### D-003: Family layout decisions

- Shell: light canvas/sidebar, subdued separators, readable current-area indicator, same nav order and visibility. Preserve mobile navigation and reserved bottom space.
- Frentes/capabilities: readable titles and metadata, wrapping existing action rows, no feature/action regrouping. Item/detail forms use full available width with local field groups.
- Journal: day header compact, entry body dominant, toolbar wraps. No date/order/intention or entry semantics change.
- Notes/vault: preserve editor element identity and selection; style around the editor without replacing DOM. Keep preview, tree and search independently scrollable where appropriate; avoid stacking rules that hide a pane. Textarea scroll-height behavior remains unchanged.
- Review: charts retain their data/legend labels, tables scroll inside bounded regions; filters stay where they are. No new metrics or review logic.
- Settings/safety: readable update, Drive, backup and restore messages; native dialogs with bounded max-block-size and normal internal document scroll. Destructive confirmation remains explicit and no action is hidden.
- Execution/history: apply shared form/history typography while preserving pilot flows. No drag/fixed-position override; retain position runtime.

### D-004: Separate PiP document

Replace only the existing doc.head embedded style with a stylesheet link whose href is resolved using `new URL('./design-system.css', document.baseURI).href` from the opener. Set notebook marker on PiP html and a dedicated `data-compasso-pip` marker on its body. Static PiP rules use that marker, not main-page IDs. Use initial 360×240 requested size, wrapping text, normal document scrolling and a 44px return control; window resizing remains browser-controlled. Keep updatePip, return click, reuse/focus, pagehide and error handling unchanged. Same-origin cached CSS supports offline; check this explicitly. Browser-managed notification chrome is outside CSS control and remains unchanged.

### D-005: Preserve historical evidence, replace obsolete expectations

The pilot test's legacy history/energy computed-style equality is no longer the desired result because those dialogs now enter scope. Replace that equality with explicit notebook typography/contrast/geometry and behavior checks, retaining existing six pilot state assertions. Record the old evidence in the historical archive; do not rewrite it. Review existing study snapshots at 360/768/1280 per platform before updating; never bless failures automatically.

### D-006: Compose Today as a bounded desktop board

At viewport widths of 1200px and above, use the existing semantic Today roots as a 12-column board. Keep the heading full-width and form three paired rows: primary action with Journal intention, remaining plan with weekly direction, and suggestions/Flow Matching with decisions. The work module takes eight columns and its supporting context takes four. Below 1200px, return to a single reading column; existing 767px control stacking remains authoritative.

Each top-level semantic section receives one surface, boundary, radius and compact internal spacing. Do not add nested decorative cards around headings or controls. Recommendation results remain interactive records within their owning suggestions module, use a bounded two-column grid only when enough width exists, and return to one column before controls become cramped. Hover/focus treatment changes boundaries only and respects reduced motion. DOM order, tab order, ranking, action handlers, persistence and state are unchanged.

## Surface inventory

`SURFACE_COVERAGE.md` lists literal source roots plus dynamic shell, hubs, graph, editor, recovery and separate-document surfaces. Build first reconciles this list against the full composed app, then fills evidence per row. Source enumeration alone is not a visual pass. A supported surface requiring an additional code file triggers Iterate before editing; a retired surface gets a documented excluded classification without restoring it.

## File manifest

Paths relative to this worktree. No moves/deletes. Optional graph color changes remain restricted to presentation constants. All other feature/state/routing files are read-only.

| # | Path | Action | Purpose | Dependencies | Acceptance |
|---|---|---|---|---|---|
| 1 | `design-system.css` | Modify | Promote shared palette/type; explicit shell, family, dialog and PiP rules; consolidate pilot aliases | Baseline inventory | All |
| 2 | `index.html` | Modify | Static html data-visual-system marker only; minimal presentational wrappers/classes if required; no handlers/state changes | 1 | AT-001,AT-004,AT-006 |
| 3 | `session-companion-feature.js` | Modify | Replace PiP injected style with absolute same-origin static design-system link and pip root marker; enlarge initial window; retain callbacks/timer | 1 | AT-007,AT-009,AT-010 |
| 4 | `knowledge-graph-feature.js` | Modify | Only domain color constants if contrast adjustment is needed; glyphs, IDs, geometry and graph algorithms unchanged | 1 | AT-005,AT-009 |
| 5 | `app-manifest.js` | Modify | Advance generation from verified v79 to v80; existing asset list suffices | 1–4 | AT-010 |
| 6 | `docs/design-system.md` | Modify | Global visual ownership, tokens, cascade and specialized typography exceptions | 1–4 | AT-012 |
| 7 | `tests/browser/full-visual-revamp-flows.spec.js` | Create | Full-PWA surface, viewport, controls, editing, route and safety visual matrix, including desktop Today composition | 1–5 | All |
| 8 | `tests/browser/core-visual-revamp-flows.spec.js` | Modify | Replace obsolete legacy history/energy style equality with new approved shared-token/behavior contract; keep six-state pilot assertions | 1 | AT-007,AT-011 |
| 9 | `tests/browser/design-system-flows.spec.js` | Modify | Assert global style contract and reviewed screenshot expectations; preserve keyboard semantics | 1–2 | AT-001,AT-009 |
| 10 | `tests/app-manifest.test.js` | Modify | Derive generation ownership; assert static CSS available for main and PiP; no hardcoded generation | 3–5 | AT-010 |
| 11 | `tests/browser/design-system-flows.spec.js-snapshots/design-system-360-chromium-win32.png` | Modify | Reviewed rendered new visual baseline on matching OS only; never copy another platform image | 9 | AT-001,AT-012 |
| 12 | `tests/browser/design-system-flows.spec.js-snapshots/design-system-360-chromium-linux.png` | Modify | Reviewed rendered new visual baseline on matching OS only; never copy another platform image | 9 | AT-001,AT-012 |
| 13 | `tests/browser/design-system-flows.spec.js-snapshots/design-system-768-chromium-win32.png` | Modify | Reviewed rendered new visual baseline on matching OS only; never copy another platform image | 9 | AT-001,AT-012 |
| 14 | `tests/browser/design-system-flows.spec.js-snapshots/design-system-768-chromium-linux.png` | Modify | Reviewed rendered new visual baseline on matching OS only; never copy another platform image | 9 | AT-001,AT-012 |
| 15 | `tests/browser/design-system-flows.spec.js-snapshots/design-system-1280-chromium-win32.png` | Modify | Reviewed rendered new visual baseline on matching OS only; never copy another platform image | 9 | AT-001,AT-012 |
| 16 | `tests/browser/design-system-flows.spec.js-snapshots/design-system-1280-chromium-linux.png` | Modify | Reviewed rendered new visual baseline on matching OS only; never copy another platform image | 9 | AT-001,AT-012 |
| 17 | `.sdd/features/full-visual-revamp/DEFINE.md` | Modify | Build status/evidence only | All checks | All |
| 18 | `.sdd/features/full-visual-revamp/DESIGN.md` | Modify | Build status and controlled revisions | All checks | All |
| 19 | `.sdd/features/full-visual-revamp/SURFACE_COVERAGE.md` | Modify | Actual inventory reconciliation and per-surface evidence | 7 | AT-012 |
| 20 | `.sdd/reports/full-visual-revamp/BUILD_REPORT.md` | Create | Exact acceptance/boundary results, command outputs and residual gates | All checks | All |
| 21 | `.github/workflows/browser-tests.yml` | Modify | Retain Playwright failure evidence so platform-native Linux snapshots can be reviewed and updated without copying Windows output | Remote CI finding | AT-001,AT-008,AT-012 |

Generated .test-dist, node_modules, test-results, screenshots outside the named snapshot files and logs are not checkpoint source. Service-worker.js, storage.js, state models, domain handlers, route model and existing SDD archives have no authorized changes.

## Implementation order

1. Recheck branch/base/diff. Render full-app baseline with generic data; reconcile coverage and save before screenshots. Identify concrete specificity conflicts before editing shared rules.
2. Shared tokens and static marker; shell and controls. Run design-system keyboard/layout checks and existing pilot matrix immediately.
3. Frentes/capability and related forms, then Journal and Notes/editor. Verify save/selection/reload and ordinary routes after each family.
4. Review, charts/graph presentation, settings and safety dialogs. Check validation and disabled/loading states; never trigger external sync in tests.
5. Execution/history and separate PiP static styling. Check window lifecycle and main-pilot regressions.
6. Finish full surface matrix, update only reviewed matching-platform snapshots, verify offline composition, then advance manifest generation. Expected v80 only if baseline is still v79.
7. Full test suite, human real-zoom/installed-client evidence, complete coverage and Build report. A finished family is not whole-app completion.

## Validation command discovery

| Level | Command | Source |
|---|---|---|
| Node contracts | `npm test` | package.json |
| Fixture composition | `npm run build:test` | package.json / scripts/compose-test-app.js |
| Focused matrix | `npm run test:browser -- tests/browser/full-visual-revamp-flows.spec.js tests/browser/core-visual-revamp-flows.spec.js tests/browser/design-system-flows.spec.js` | Existing Playwright CLI via package script |
| Full verification | `npm run test:all` | package.json |
| Whitespace | `git diff --check` | Repository Git contract |
| Lint/type checker | Not configured | package.json |
| Remote CI | Browser tests workflow: Ubuntu/Node22 and test:all | .github/workflows/browser-tests.yml |

Playwright uses Chromium and Pixel7 projects, one worker, retry1. Reduced fixture on 4173 omits several modules; new all-surface matrix must use full-PWA server4174 and isolated generic state. Actual document PiP requires supported headed browser observation; a mocked window tests only document construction/fallback, not platform functionality. Capture Linux snapshots only on Linux and Windows snapshots only on Windows; lack of an environment remains explicit pending evidence.

## Test strategy

| AT | Level/location | Evidence |
|---|---|---|
| AT-001 | full-visual spec; existing information-architecture spec | Routes/modes and shell snapshots, same nav order |
| AT-002 | full-visual plus learning-outcome/critical specs | Item/capability read/edit/cancel and populated forms |
| AT-003 | full-visual plus journal-flows | Entry save/date selection/cancel and typography |
| AT-004 | full-visual plus local-data-safety/foundation specs | Caret/selection after editing, autosave failure, Markdown links and reload |
| AT-005 | full-visual plus capability-context/critical specs | Review/chart data unchanged, empty queues, controls readable |
| AT-006 | full-visual plus local-data-safety/pwa-lifecycle | Recovery/restore error/cancel controls; local mocked integration states |
| AT-007 | full-visual plus encoding-e1/critical/pilot specs | History/Deep Work and actual PiP observation with support recorded |
| AT-008 | full-visual matrix plus manual browser zoom | Four widths for all coverage rows; each family 200% using browser menu, expanded dialogs and keyboard scroll |
| AT-009 | full-visual/design-system specs | Tab/Shift+Tab/Escape, focus return/contrast, reduced-motion/forced-colors |
| AT-010 | full-visual and pwa-lifecycle | Static CSS main/PiP asset availability and complete-cache offline; human installed reopen/update gate |
| AT-011 | core-visual spec | Existing pilot six-state layout and persistence assertions |
| AT-012 | SURFACE_COVERAGE and report audit | Every live surface accounted for; reviewed image references; no proxy passes |

ER-001: existing durable failure tests plus new rendered error controls. ER-002/004: long content and 360×480 expanded dialogs. ER-003: legacy/archived/empty fixtures. ER-005: active editor/dialog rerender focus assertions. ER-006: system-font/forced-colors checks. ER-007: supported PiP/fallback observations separate. ER-008: evidence audit keeps unavailable manual checks pending.

For visual verification inspect computed font sizes, target rects and contrast on visible controls; assert document scrollWidth <= clientWidth rather than trusting overflow-x:clip. Inspect representative actual screenshots for every family and every distinct dialog type. Record zoom value, browser/platform, tested surfaces and observer; previous pilot approval does not carry over.

## Migration and compatibility

No schema, key, collection or content migration. CSS changes are presentation-only. Existing stylesheet is already an owned cached asset; no new cache/bootstrap architecture. v80 is a forward presentation generation, conditional on rechecked baseline. Do not rename persisted properties, mutate mode preferences, or make local success depend on styling.

## Rollback

Before publication, reverse only this delivery's reviewed changes. Do not use destructive resets on unrelated work. After installation, rollback needs a new forward cache generation containing restored presentation, followed by update/offline verification. Never downgrade compasso.state.v3 or clear user data/cache as a routine fix. Roll back if editing, recovery visibility, route accessibility or data parity fails.

## Security, privacy, operations and observability

| Area | Impact |
|---|---|
| Security/privacy | No external font/service/telemetry; use isolated generic fixtures and no real Drive writes |
| Performance | No new runtime observer, layout loop or library; measure large Notes/list/graph interactions for obvious regressions |
| Operations | Local Ship does not imply commit, push, main integration or Pages publication |
| Evidence | Per-surface screenshots/results and exact commands; separate automated/human and skip/fail/pending |

## Risks and open decisions

Legacy !important/inline rules may require narrowly scoped CSS; do not solve them with broad resets. Chart legibility must preserve data encoding. PiP stylesheet load and unsupported browsers need separate evidence. Native fonts differ across OS, so snapshots require matching environments. New supported roots found during Build extend the coverage ledger; additional implementation paths require controlled Iterate. No unresolved architecture decision blocks Build; actual validation remains pending implementation.

## Revision history

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-09-07 | Codex | Static shared-system expansion, separate PiP treatment, complete edit manifest and coverage/test plan |
| 1.1 | 2026-09-12 | Codex | Replaced Today’s flat full-width document treatment with a repository-grounded semantic desktop board and explicit responsive verification |
| 1.2 | 2026-09-13 | Codex | Added failure-artifact retention after remote Linux CI exposed an obsolete platform snapshot that cannot be regenerated safely on Windows |
| 1.3 | 2026-09-13 | Codex | Added a workflow-dispatch snapshot-render path so all three native Linux baselines can be reviewed together before the canonical rerun |
