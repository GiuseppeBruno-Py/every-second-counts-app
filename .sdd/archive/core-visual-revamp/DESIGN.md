# Archive status: Shipped

Closed 2026-09-07. Copy-only archive; original phase record follows unchanged. See SHIPPED.md for final verification and release boundaries.

---

# DESIGN: Compasso — Core Visual Revamp

## Metadata

| Field | Value |
|---|---|
| Feature slug | `core-visual-revamp` |
| Define | `./DEFINE.md` — clarity 14/15 |
| Visual reference | `./BRAINSTORM.md` — Direction A, Caderno de trabalho |
| Date | 2026-09-05 |
| Status | **Complete (Built)** |
| Worktree | `C:\Users\Giuse\OneDrive\Documentos\Every Second Counts\every-second-counts-app-core-visual-revamp` |
| Branch | `codex/core-visual-revamp` |
| HEAD | `5c7fb210ac5c240f46f0987913fb488bbd3108db` |
| Initial changes | Only this feature's untracked BRAINSTORM.md and DEFINE.md; no staged/product/test changes |
| Repository inspection | Source, AGENTS.md, docs, manifest, Playwright configuration and CI inspected; `.codegraph/` absent in this worktree, so direct source inspection used |
| Phase boundary | Documentation only in Design; no implementation, tests executed, commit, push or release implied |

Direction A continues the disclosed Define premise. This Design does not fabricate a separate explicit A/B vote. The user requested this Design after that premise was stated. A change to B requires Iterate before Build.

## Current state and gap

The application composes ordered vanilla modules through the existing manifest and Service Worker. `index.html` loads `app-ui.css`, then `design-system.css`, then contains legacy document styles. Several feature modules append additional CSS after document startup. The pilot therefore has both shared static selectors and later injected declarations.

| Owner and source location at baseline | Current behavior / gap | Design consequence |
|---|---|---|
| `today-feature.js:66,132,145,167,198` | State precedence is already correct; generated primary card uses text plus auto-width actions, compact type and nested borders | Preserve state/commands; change layout and remove redundant decoration |
| `design-system.css:1004–1065` | Primary has gradient, shadow and a two-column card; details summary uses .72rem | Replace pilot presentation, retain native details |
| `journal-feature.js:213` | On every render, moves `#journalTodayPanel` before first `.today-grid` | Give remaining plan its own explicit anchor, then place Journal after it |
| `sessions-feature.js:73,88` | Injects CSS shared by start, finish and history; form fields/summary use small fonts | Migrate owned stylesheet as a compatibility step, then apply ID-scoped pilot rules |
| `evidence-feature.js:38,52,68` | Appends to `compassoSessionStyles`; Evidence grid puts type beside required summary; saved panel is in normal content flow | Migrate append together with session styles; summary gets full row; preserve saved panel location and focus |
| `design-system.css:245–355` and `session-companion-feature.js:136` | Companion is fixed with drag support; 8/11 px copy and 29/31 px buttons; title ellipsis | Enlarge/wrap within fixed Companion, preserving drag and handlers |
| `design-system-feature.js:72` | Enhances native dialogs, focus return and semantics | Reuse without a new modal controller |
| `index.html:6` | Explicit light color scheme; no theme preference found in visual system | Ship only light Direction A in this pilot |
| `tests/browser/design-system-flows.spec.js:293,327` | Existing zoom checks set CSS `style.zoom` | Keep as reflow tests; add distinct actual browser-zoom observation |

The discovery's measured widths and mockup contrast figures remain historical observations, not proof of implemented styles. Existing `html/body overflow-x:clip` means document width alone can hide clipping; tests must also inspect descendant bounds and reachability.

## Target state

Keep the same component ownership and public interfaces. Use one static pilot section in `design-system.css`, scoped to existing root IDs, with semantic custom properties. No extra stylesheet, component runtime, data model, network request or font download is added.

```text
Today header (compact, existing date/count)
  -> primary attempt OR active execution OR existing planning fallback
  -> remaining plan and its existing controls
  -> Journal intention/context
  -> weekly direction, suggestions and decisions (all existing controls retained)

Existing immediate-start command OR optional native start dialog
  -> existing active/paused execution + fixed Companion
  -> existing native finish dialog + full-width Evidence summary
  -> existing durable save / existing error recovery
  -> existing saved continuation panel
```

No new state transition is introduced by visual rendering.

## Components and interfaces

| Component | Responsibility | Inputs | Outputs and errors | Dependencies |
|---|---|---|---|---|
| Today renderer | Preserve precedence and project plan; expose stable presentation anchors | Existing `todayPrimaryState()` discriminants: execution/capability/action/planning | Same IDs, `data-today-*`, text and commands; same unavailable-reference fallback | Current capability/execution models |
| Journal integration | Place existing panel after remaining plan | Existing Today root and new plan anchor | Same panel and controls, one idempotent DOM move; guard absent root | Today installed before Journal |
| Session UI | Native start/finish forms with scoped classes | Existing session draft/options and snapshots | Same submit/close handlers, constraints, role=alert and errors | Energy, ritual, contingency, Journal integrations |
| Evidence UI | Full-width fields and readable continuation | Existing type, summary, details and save outcome | Existing required/maxlength, canonical identity, persisted result and failure | Session lifecycle and existing persistence |
| Companion | Readable fixed execution surface | Existing activity/timer, active/paused/finishing/deep, E1 state | Same open/pause/finish/float actions, drag coordinates and hidden eligibility | Existing runtime; no JS layout controller |
| Pilot CSS | Scoped typography, semantic colors and reflow | Existing DOM plus local token definitions | Computed styles only; no data writes | Existing static design system and native browser layout |

Public signatures, registration order, command names, selectors used by handlers, form IDs, data attributes and persistence APIs remain unchanged. New Today IDs below are presentation anchors, never persisted identifiers.

## Flows and state transitions

1. `renderToday()` still derives `todayPrimaryState()`. The primary attempt remains excluded from the lower list by existing logic. No sorting, status or filtering change.
2. Immediate start still invokes `session.startDefault`; configuration still uses its current optional route. The visual delivery adds no mandatory stop.
3. Expanded start fields keep their current owners: `#sessionOptionalConfigBody`, `#ritualQuickSelect`, `#energyBeforeBlock`, Journal intent and existing contingency/variant controls. Do not relocate optional fields across forms or change defaults.
4. Pause/resume and refresh retain stored state. Finishing freezes time through existing logic; cancel restores the existing active/paused semantics.
5. Finish validation stays native plus existing application error handling. Required Evidence summary remains maxlength 180; details 500; reflection 300; intent 220. No new field or required validation.
6. Save follows the existing transactional path. Rejection exposes existing errors and recovery; success renders `#executionCompletionPanel`. Its text and focus are unchanged; no automatic nextAttempt, signal or plan mutation.
7. Existing floating/PiP behavior remains callable. The separate Picture-in-Picture document and full Deep Work screen are compatibility surfaces, not redesigned surfaces. The in-page Companion is the pilot component.

## Decisions

### D-001 — Local tokens, light theme

Define tokens on `:is(#todayView,#todayDialog,#sessionStartDialog,#sessionFinishDialog,#executionCompletionPanel,#sessionCompanion)` only. `#todayDialog` is the verified existing manual-action dialog (`today-feature.js:162`), opened by Today's empty/planning CTA; apply the same form/control primitives to its `.today-dialog-head/body/foot` without changing fields, validation or actions. Do not change `:root`, global `.field`, global button roles or browser theme settings.

| Semantic token (`--pilot-` prefix) | Value |
|---|---|
| canvas / surface / subtle | `#f5f3ed` / `#fffef9` / `#e7ecdf` |
| text / muted / border | `#252b27` / `#596259` / `#868e80` |
| accent / on-accent | `#315a46` / `#ffffff` |
| success / warning / danger / focus | `#26613d` / `#76520b` / `#a32630` / `#6b3eb5` |
| font / heading-font | `system-ui, sans-serif` / `Georgia, serif` |
| body / secondary / input | `1.0625rem` / `.875rem` / `1rem` |
| heading / subheading / line | `clamp(1.5rem,2vw,1.75rem)` / `1.25rem` / `1.55` |
| space-1,2,3,4,6,8,12 | `.25rem,.5rem,.75rem,1rem,1.5rem,2rem,3rem` |
| radius-control / border-width | `.75rem` / `1px` |
| control-min / input-min | `2.75rem` / `3rem` |
| reading-width / dialog-width | `65ch` / `40rem` |
| focus-width / overlay-shadow | `3px` / `0 8px 24px rgb(25 35 29 / 12%)` |

Bridge local `--ds-color-*` roles (text, muted, raised, border, accent, success, warning, danger, focus) to these tokens, and apply explicit root-scoped rules to remaining hardcoded colors/fonts. Use local legacy color aliases only if every inheriting pilot descendant is checked; aliases alone are insufficient. No body/sidebar theme change, dark preference or external font dependency. Forced-colors uses system colors and visible native outlines.

Rejected: a global palette replacement would recolor unrelated screens; loading the mockup as production would replace business behavior; adding dark mode would add a preference outside scope.

### D-002 — Migrate owned legacy CSS before restyling

Move CSS owned by `todayInstallStyles()`, `installSessionStyles()` and `installEvidenceStyles()` to clearly labeled static sections. Remove those three functions and their calls after confirming no remaining references. Source search at this baseline found only Evidence reading `compassoSessionStyles`, so session/Evidence migration is one atomic implementation step.

Retain original generic history/banner/Evidence-history declarations and media rules verbatim in a compatibility section. Move it after the existing static legacy sections and before the new pilot section. Because original injected rules ran later, verify computed non-pilot styles before and after migration, especially `#sessionHistoryDialog`, `#historySessionDialog` (history-edit-feature.js), `#energyMapDialog`, session card buttons and Evidence history. Capture font-size, line-height, foreground/background, border, padding and dimensions for headings, summaries and controls at 390 and 1280 px. If document inline styles or other later injections change precedence, narrow compensating static selectors to those same consumers and original values. Do not restyle them. If compatibility requires broader work, stop and Iterate the manifest.

Other legacy injections (Journal, energy, ritual, contingency and PiP) are not removed in this delivery. No new injection is added. Root IDs allow the static pilot section to beat ordinary later class selectors. For existing `!important` rules, use local token bridges first; only use narrowly scoped `!important` when an existing important declaration cannot otherwise be overridden. Explain those cases in comments. Preserve `[hidden]`, busy/disabled semantics and reduced-motion priority.

Rejected: retaining old pilot rules and appending another runtime style block compounds the current problem; migrating every feature's styles expands the delivery.

### D-003 — Explicit Today reading order

Build inspection correction (2026-09-06): `todayInstallUi()` renames the original hero to `journalTodayPanel` and intention to `journalTodayIntention`. Separate the existing date, Hoje heading and score into a compact header, keeping their IDs. Keep the existing intention/edit control in the Journal panel, then move that panel after the plan. This is a modifying Iterate within the existing markup manifest, not a new business requirement. DEFINE and BRAINSTORM remain unchanged. Initial CSS/DOM assumptions are superseded by this correction; no completed Build evidence exists yet. The full-module PWA fixture on port 4174 is required to measure history/energy canaries, since the reduced journey fixture excludes them.

In `todayInstallUi()` markup, preserve `.today-shell`, all existing IDs and `data-today-*`. Add `id="todayRemainingPlan"` to the existing plan section; lift it out of the first two-column `.today-grid` so it occupies a full row. Add `id="todaySecondaryContext"` to a wrapper containing existing weekly direction, suggestions and decisions. Keep existing `.today-grid` wrappers within secondary content as needed. Change only markup structure, not rendered item content or business functions.

In `renderJournalIntegrations()`, replace the first-grid insertion with `todayRemainingPlan.after(todayPanel)` guarded by the root and anchor. Repeat rendering must keep a single panel in that position. Do not use CSS `order` to create a different screen-reader order. Preserve the other Journal integration statements verbatim.

Remove primary gradients/shadows and nested borders; use space and one semantic separator for plan rows. `.today-primary-card` becomes one column at all widths; `.today-primary-actions` wraps below text and is left-aligned. At 1280 px, measure `.today-primary-copy` against 40 times the computed font's `ch` advance, using a temporary test measurement element, not a hardcoded pixel approximation. Use `max-inline-size:65ch` and `min-inline-size:0`, never a 40ch minimum that overflows mobile.

Keep date, counts, optional progress, Journal statistics and suggestions; render them at least 14 px without decorative tiles. The compact header remains before the primary action but does not regain banner styling. At narrow widths plan row actions follow the copy and wrap; controls retain their labels and order.

### D-004 — Dialog and completion presentation

Scope to `#sessionStartDialog` and `#sessionFinishDialog`, not `.session-dialog` alone. Style `.session-dialog-head/body/foot`, `.field`, `.session-summary`, `.session-options` and their text/input/select/textarea descendants. Start and finish use a 40rem maximum width, 1–1.5rem padding and native document scrolling inside a viewport-bounded dialog. At <=767 px retain the existing sheet model; explicitly reconcile its important width/margin/radius rules. Use `max-block-size:92dvh` with `vh` fallback, overflow-y:auto and no sticky submit footer.

Full-width Evidence rows in existing DOM order (type, summary, details). Remove `.evidence-box` background/border nesting, keep its semantic section and headings. Keep error role, required markers and native labels. Conditional `.energy-block`, `.energy-choices`, ritual/checkpoint and Journal summaries receive the same local text/control scale without hiding, moving or changing their semantics. Checkbox input retains native size; its associated label/wrapper receives the 44px target.

Saved continuation stays in normal flow where Evidence currently inserts it. Reduce its shadow to none; use a subtle success cue plus existing success text. No toast repositioning or changes to global navigation. Verify focused continuation controls are reachable above/around the fixed Companion; use local scroll margin and content padding if necessary, not a new visibility rule.

### D-005 — Companion retains interaction and gains readable rows

Modify existing static `.session-companion` rules using `#sessionCompanion` scope. Use a single-column outer layout: activity button above action buttons. Title and futureUse wrap normally without ellipsis; timer uses the actual `#sessionCompanionTime` ID (markup does not provide the similarly named CSS class). Body/title 17px, label/context 14px, controls at least 44px. Width up to 26rem bounded by viewport minus 24px. Preserve fixed position, z-index, inline drag coordinates and 520px drag breakpoint.

Do not change JS drag bounds: they already measure element height and visualViewport. Respect E1's `.encoding-open` position overrides; constrain overflow inside its existing content region if necessary, keeping main actions reachable. Preserve pointer/touch behaviors. Validate resized content and short-height cases; a drag algorithm defect is an explicit separate finding, not permission to change session behavior.

### D-006 — Minimal motion and observable states

No new animation. Pilot hover uses color/border only and suppresses the global translate/shadow treatment locally. Focus uses solid 3px focus color, not a diluted alpha outline. Existing aria-invalid, role=alert/status, required markers and loading labels remain authoritative. Disabled remains semantically disabled. Preserve existing loading spinner and accessible label; ensure local text colors do not accidentally reveal hidden busy text or render the spinner invisible. Do not create loading state where none exists.

## File manifest

All paths are relative to the worktree above. This is the complete Build edit boundary; every additional file requires Iterate first. No delete/move of files, no snapshot update authorized. Removing obsolete functions in listed files is the CSS migration described above.

| # | Path | Action | Purpose | Dependencies | Acceptance coverage |
|---:|---|---|---|---|---|
| 1 | `design-system.css` | Modify | Static compatibility migration, local tokens, Today/dialog/Companion/completion styling | Baseline captures; D-001–D-006 | AT-001–AT-016 |
| 2 | `today-feature.js` | Modify | Remove owned style injector/call; add structural plan/context anchors only | 1, atomic CSS move | AT-001–AT-004, AT-010, AT-015 |
| 3 | `sessions-feature.js` | Modify | Remove owned style injector/call only; preserve forms and lifecycle | 1 and 4 atomically | AT-004–AT-009, AT-014 |
| 4 | `evidence-feature.js` | Modify | Remove style append function/call only; retain fields/save/render logic | 1 and 3 atomically | AT-007–AT-009, AT-014 |
| 5 | `journal-feature.js` | Modify | Only Today panel placement from first-grid to remaining-plan anchor | 2 | AT-001–AT-003, AT-014–AT-015 |
| 6 | `tests/browser/core-visual-revamp-flows.spec.js` | Create | Pilot state/layout/keyboard/contrast and non-pilot computed-style regressions; no new runner | 1–5; existing test patterns | AT-001–AT-012, AT-014–AT-016 |
| 7 | `app-manifest.js` | Modify | Forward cache generation only, based on rechecked Build baseline | 1–5 | AT-013 |
| 8 | `tests/app-manifest.test.js` | Modify | Remove existing exact v78 assertion in favor of manifest-derived visible-version contract; keep generation ownership/state checks | 7 | AT-013–AT-014 |
| 9 | `docs/design-system.md` | Modify | Pilot token/selector boundaries, migration and evidence instructions | 1–8 | AT-015–AT-016 |
| 10 | `.sdd/features/core-visual-revamp/DEFINE.md` | Modify | Build phase status/evidence reference only | Validated Build | All |
| 11 | `.sdd/features/core-visual-revamp/DESIGN.md` | Modify | Build status/evidence references; substantive amendments require Iterate | Validated Build | All |
| 12 | `.sdd/reports/core-visual-revamp/BUILD_REPORT.md` | Create | Actual results per requirement/AT/ER, file diff, risks and external gates | 1–11 | All |

Read-only canaries/exclusions: `index.html`, `app-ui.css`, `design-system-model.js`, `design-system-feature.js`, `session-companion-feature.js`, energy/ritual/contingency/flow modules, storage/sync/models, `service-worker.js`, all existing browser specs and snapshot PNGs. CSS may style descendants of pilot roots owned by these modules; their source and business behavior remain unchanged.

Test screenshots/traces/reports and `.test-dist` are generated evidence outside the checkpoint, not additional authorized source files. Record paths/hashes in Build report. Existing study snapshots should remain unchanged; a failure there triggers investigation, not automatic baseline replacement.

## Implementation order

1. Recheck path, branch, HEAD, staged/unstaged/untracked diff and generation. Preserve this feature's existing docs. If product baseline differs, reconcile explicitly before editing; do not silently rebase or merge.
2. Capture baseline six states plus computed non-pilot canaries using isolated local test data. Record exact browser/platform and viewport. Establish tests in file 6 with explicit baseline contract values; do not compare a modified page to itself.
3. Atomically migrate Today/session/Evidence CSS with functions/calls removed (1–4). Confirm compatibility canaries before visual changes, so cascade regressions are distinguishable.
4. Implement pilot tokens and Today anchors/Journal positioning (1,2,5). Validate reading order, full width and all existing controls.
5. Apply native dialog, conditional-field, Evidence and Companion styles (1). Validate keyboard and error cases before broad snapshots.
6. Complete new browser coverage, then update generation and manifest assertion (6–8). If baseline remains v78, v79 is the expected forward generation; do not blindly reuse it after a changed baseline.
7. Run focused and full checks, inspect actual visual artifacts, complete real-zoom procedure. Update docs and evidence (9–12). Do not mark acceptance passed for unavailable checks.

## Validation command discovery

| Category | Command | Evidence source | Use |
|---|---|---|---|
| Node | `npm test` | package.json | Full contract/model suite |
| Composition | `npm run build:test` | package.json; scripts/compose-test-app.js | Browser fixture composition |
| Focused pilot | `npm run test:browser -- tests/browser/core-visual-revamp-flows.spec.js` | Existing npm script forwards Playwright file filter | Both configured projects |
| Behavioral/PWA | `npm run test:browser -- tests/browser/design-system-flows.spec.js tests/browser/capability-context-flows.spec.js tests/browser/critical-flows.spec.js tests/browser/journal-flows.spec.js tests/browser/encoding-e1-flows.spec.js tests/browser/local-data-safety-flows.spec.js tests/browser/pwa-lifecycle-flows.spec.js` | Existing specs + package script | Focused integration before full gate |
| Full gate | `npm run test:all` | package.json; Ubuntu CI workflow | Final Node + browser matrix |
| Whitespace | `git diff --check` | Git/repository process | Tracked diff; also inspect new test/docs whitespace directly |
| Lint/type check | Not configured | package.json | Do not invent commands |

`playwright.config.js` defines chromium and mobile (Pixel 7), one worker, retries=1, .test-dist on 4173 and PWA server on 4174. It invokes `python3`; if that executable is missing on Windows, document environment failure and use an equivalent local fixture-server setup through the supported APP_URL override, with the separate PWA server when needed. Do not edit config/dependencies merely to obtain a pass. Never count a retry/skipped/project-conditioned check as stronger coverage than actually executed.

## Test strategy

New spec uses local generic capability/plan data, real UI actions and existing fixture boot patterns. Reuse patterns from capability-context locally in the new spec without editing unrelated helpers. Intercept external requests as existing tests do. Baseline screenshots are reviewed evidence, not new automatic golden files.

| Acceptance ID | Level | Test path / procedure | Command or evidence |
|---|---|---|---|
| AT-001 | Browser/visual | New spec: empty Today, DOM section order and existing CTA | Focused pilot + screenshot |
| AT-002 | Browser | New spec: current SQL attempt, other actions, text width and no duplicate | Focused pilot + capability-context |
| AT-003 | Browser | New spec active/paused Today; existing precedence contracts | Focused pilot + capability-context |
| AT-004 | Browser | Immediate start versus optional configuration; same draft behavior | Focused pilot + critical/capability-context |
| AT-005 | Browser | Expanded configuration with ritual, energy and Journal fields; target sizes | Focused pilot + journal/encoding-e1 |
| AT-006 | Browser | Active session pause/resume/reload; Companion layout and drag | Existing design-system + capability-context; new layout assertions |
| AT-007 | Browser | Valid finish, saved continuation, refresh and exact Evidence identity | Existing capability-context + new visual flow |
| AT-008 | Browser | Cancel active/paused finishing and focus return | Existing critical/capability-context + new keyboard case |
| AT-009 | Browser | Tab/Shift+Tab boundaries, Escape/Cancel, Enter/Space, visible target bounds | New spec and design-system suite |
| AT-010 | Browser/visual | Six states at 360,390,768,1280; short height 480; descendant bounds | New spec, both projects; actual screenshots |
| AT-011 | Manual browser | Real browser zoom procedure below | Separate observed evidence, not CSS zoom |
| AT-012 | Browser | Existing disabled/busy/error and hover/focus computed styles | New spec + existing design-system |
| AT-013 | Browser/PWA | Existing raw/controlled lifecycle and complete-cache offline session/state paths | PWA lifecycle suite + full gate |
| AT-014 | Browser/visual | Notes, Journal, capabilities, review, session history, history correction and energy map computed-style/behavior canaries | New spec + existing local-data-safety/journal/capability-context; existing study snapshots unchanged |
| AT-015 | Visual/computed | Before/after six states, foreground/background contrast, declared fonts and grouping | New spec + reviewed artifacts in Build report |
| AT-016 | Browser | Reduced motion preference and computed duration/focus | New spec + existing design-system |

### Error coverage

| Error IDs | Verification |
|---|---|
| ER-001–ER-003 | Existing transactional/duplicate tests plus new readable validation and busy-state assertions |
| ER-004 | New spec long accented title, multiline Evidence and 200-character unbroken URL; check bounds inside containers |
| ER-005–ER-006 | Existing capability-context legacy/unavailable scenarios; new presentation assertions where visible |
| ER-007 | New spec 360x480 and focus/scroll reachability; real software keyboard is a separately attributed observation if available |
| ER-008 | Existing drag/E1 tests plus new Companion dimensions and short-height case |
| ER-009 | Existing interrupted completion/refresh contracts; verify error surface remains operable |
| ER-010 | New forced-colors and system-font fallback checks; zoom procedure |
| ER-011 | Reproduction and scope decision in report; no silent flow redesign |
| ER-012 | Evidence audit: exact command/observer/platform, separate pass/skip/fail/pending |

Contrast checks resolve actual computed ancestor backgrounds, alpha and role colors; test normal text >=4.5, large text >=3, focus/boundaries >=3. Disabled text exemption must not excuse enabled muted metadata. Test visible hidden-state toggles without forcing hidden controls to render. For all layout checks, inspect text/control bounds and ability to scroll focused elements into view, not only `scrollWidth`.

### Actual 200% browser zoom procedure

Use a real headed browser on a dedicated local origin. Set zoom through the browser's own menu to 200% and record that menu value, platform, initial window size and screenshot. Inspect Today planned/active and start/finish expanded dialogs, traverse keyboard controls, scroll to errors and submit/cancel. Record clipping/focus/overlap findings and return zoom to 100%. Viewport resizing, deviceScaleFactor, CSS zoom and pinch scale alone do not satisfy AT-011. If browser chrome is unavailable to automation, leave this specific check pending for a human; Ready for Build does not imply Ready for Ship.

## Migration and compatibility

No stored-data migration: the change is CSS plus minimal markup placement. `compasso.state.v3`, collections, JSON roots, unknown compatible fields, Markdown and sync contracts remain identical. No clearing of storage or caches as a validation shortcut on user origins. Tests use dedicated origins/contexts and generic fixtures.

Cache generation advances via `app-manifest.js` only after the Build baseline is checked. Existing asset list and composition order are unchanged because no production asset is added. Keep Service Worker architecture and lifecycle code untouched. Product is still usable without external fonts; existing global font import outside pilot is not removed as unrelated cleanup.

Branch is based on Local Data Safety's checkpoint, not verified merged main. No remote freshness/CI conclusion is made in this Design. Integration and the prior installed-PWA gate remain separately reviewed actions.

## Rollout and rollback

Build and Ship verification precede any separately authorized commit/push/PR/release. Compare six pilot states and non-pilot canaries before accepting visual changes. Remote Linux CI is a later gate when a PR is explicitly authorized.

Rollback trigger: data/behavior regression, unreadable/unreachable primary control, persistent non-pilot cascade regression or broken cached startup. Before publication, reverse only this delivery's verified diff in an authorized recovery operation, preserving unrelated work. After an installed generation activates, restore previous presentation through a NEW forward manifest generation and repeat lifecycle validation; Git revert alone does not update installed caches. Never downgrade schema, clear user data or purge unrelated caches. Rollback deployment still requires explicit authorization.

## Security, privacy, operations, and observability

| Area | Impact and mitigation |
|---|---|
| Security | No new input parsing or HTML data interpolation; preserve current escaping and native form controls |
| Privacy | No telemetry, uploads or external dependencies; generic local visual fixtures only |
| Performance | Static CSS and one guarded Journal DOM move per render; no new observers, timers or measurement loops in runtime |
| Observability | Existing errors/statuses preserved; Build report holds test commands, screenshots, measured values and failures |
| Operations | Forward cache generation, existing offline update flow; no deployment in Design/Build by implication |

## Risks and open decisions

| Risk | Impact | Mitigation |
|---|---|---|
| Static CSS relocation changes cascade | Unrelated history/energy components drift | Baseline computed canaries before visual work; original values and scoped compensation |
| Fixed Companion grows | May cover content or exceed short viewport | Single-column body, bounded dimensions, E1/drag and short-height tests |
| Font metrics vary | Wrap and 40ch measurement vary | System fallback; measure actual font and screenshot on target platforms |
| Actual zoom unavailable to tools | Acceptance evidence incomplete | Explicit manual procedure and pending gate; no proxy pass |
| Later baseline differs | Cache/selectors/expected snapshots stale | Recheck before Build and reconcile through Iterate |

No open architecture choice prevents Build. Physical installed-PWA evidence and real zoom remain validation tasks, not invented Design results.

## Design verification and revision history

Design inspection covers applicable root AGENTS, README, docs/design-system, Today/session contracts, current source owners, shared CSS/ARIA, app manifest, package scripts, Playwright projects, existing tests and CI. No product validation suite executed for this documentation change. Requirement and acceptance coverage is specified above; implementation evidence belongs to Build.

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-09-05 | Codex | Repository-grounded Direction A pilot, explicit CSS migration, complete Build boundary and validation/rollback plan |
| 1.1 | 2026-09-06 | Codex | Iterate: reconcile reused Today/Journal hero and full-fixture baseline capture; same requirements and file manifest; gate revalidated |

| 1.2 | 2026-09-07 | Codex | Additive human AT-011 evidence; Complete (Built); no architecture, requirement or implementation changes |

Build evidence: `.sdd/reports/core-visual-revamp/BUILD_REPORT.md`. Automated validation passed; the user confirmed actual 200% validation, including the pending start/finish dialogs, on 2026-09-07. AT-011 is Pass (human), not an additional Codex-observed run. Build is complete; Ship remains a separate phase.
