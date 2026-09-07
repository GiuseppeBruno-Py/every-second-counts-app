# Archive status: Shipped

Closed 2026-09-07. Copy-only archive; original phase record follows unchanged. See SHIPPED.md for final verification and release boundaries.

---

# DEFINE: Compasso — Core Visual Revamp

## Metadata

| Field | Value |
|---|---|
| Feature slug | `core-visual-revamp` |
| Date | 2026-09-05 |
| Status | **Complete (Built)** |
| Clarity score | **14/15** |
| Delivery | 1 — visual pilot only |
| Inputs | `BRAINSTORM.md`; user's Prompt 1B and request to execute the next step |
| Working direction | A — Caderno de trabalho; continuation of the recommendation, not an explicit A/B vote |
| Worktree | `C:\Users\Giuse\OneDrive\Documentos\Every Second Counts\every-second-counts-app-core-visual-revamp` |
| Branch | `codex/core-visual-revamp` |
| Baseline | `5c7fb210ac5c240f46f0987913fb488bbd3108db` |
| Initial Git status | clean; no staged, modified or untracked files |
| PWA/state baseline | `compasso-pages-v78` / `compasso.state.v3` |

This artifact specifies outcomes. The implementation manifest and next-phase plan are in `DESIGN.md`. Build is complete; automated evidence and user-confirmed AT-011 (200% zoom, 2026-09-07) are recorded in `.sdd/reports/core-visual-revamp/BUILD_REPORT.md`. Ship remains separate. No product or test file changes were made in Define or Design.

## Problem statement

The current pilot flow makes the action harder to read than its surrounding controls. Prompt 1A observed a 170.56 px primary-copy area beside 654.44 px of actions on desktop, a four-line attempt heading, nested containers and prominent secondary Journal context. Completion fields used 12 px text and 11 px labels at 360 px. These are discovery observations at the baseline, not measurements of an implemented redesign.

The learner needs to recognize the next action, execute it and record evidence comfortably. The visual delivery must improve hierarchy and readability without changing the decisions, navigation, session semantics or data contracts.

## Target users

| User or role | Need | Current pain |
|---|---|---|
| Individual learner planning and executing | Read the attempt and recognize its existing primary action | Controls compete with the attempt; excessive grouping |
| Learner recording evidence | Read labels and preserve the existing short completion flow | Small labels, helpers and fields; nested form surfaces |
| Mobile, keyboard and zoom user | Reach all actions with readable text and visible focus | Narrow content and long dialogs require deliberate reflow |
| Offline or returning user | Continue the same execution and retrieve persisted evidence | A visual change must not weaken recovery or storage behavior |

## Goals and measurable requirements

Thresholds below operationalize Prompt 1B and Direction A; they are acceptance targets, not results already obtained.

| ID | Priority | Requirement | Measure |
|---|---|---|---|
| R-001 | MUST | Apply one coherent Direction A system to empty, planned and active Today, session start, completion and saved continuation | All six states use the documented pilot typography, semantic colors, spacing and controls |
| R-002 | MUST | Make reading comfortable at default zoom | Main body 17 px equivalent; labels/helpers/metadata at least 14 px; editable text at least 16 px; prose line-height at least 1.5; user font scaling remains effective |
| R-003 | MUST | Prioritize next action, remaining plan, then secondary context | Visual and DOM reading order agree; no duplicate primary attempt; existing action precedence unchanged |
| R-004 | MUST | Give the primary attempt room independent of action count | Controls wrap onto their own row when needed; at 1280 px the primary reading area is at least 40ch; at all target widths text stays readable without truncation or horizontal clipping |
| R-005 | MUST | Reduce redundant container treatment | No bordered card nested solely for decoration inside the primary action, session summary or Evidence group; Journal context no longer appears as an oversized banner above the next action |
| R-006 | MUST | Preserve all existing actionable controls and information | Immediate start, optional configuration, pause/resume, finish, cancel, secondary actions and conditional fields remain available under their existing rules |
| R-007 | MUST | Keep dialogs semantic and keyboard-operable | Initial focus, Tab/Shift+Tab containment, native Enter/Space, Escape/cancel and focus return work; focused controls and errors are visible |
| R-008 | MUST | Support mobile and zoom | No document horizontal overflow at 360, 390, 768 and 1280 CSS px; every dialog action reachable; validate real browser zoom at 200% separately from viewport emulation |
| R-009 | MUST | Provide usable controls and contrast | Touch targets at least 44 by 44 CSS px, including associated checkbox labels; normal text 4.5:1, large text 3:1, focus and meaningful boundaries 3:1 |
| R-010 | MUST | Distinguish existing states without color alone | Empty, active/paused, disabled, focus, validation error, success and existing loading states retain text/semantics; essential actions never require hover |
| R-011 | MUST | Preserve session and Evidence behavior | Existing persistence, cancellation, recovery and duplicate-prevention scenarios pass; refreshing during execution or after Evidence save restores the expected baseline state |
| R-012 | MUST | Preserve local data and portability | No schema/key/collection/backup/Markdown changes; Local Data Safety canaries pass; no CSS or presentation failure becomes a claimed durable success |
| R-013 | MUST | Keep the app offline-capable | Controlled startup and offline reload from a complete cache work with pilot assets; a changed cached asset set uses a forward manifest generation determined at Build |
| R-014 | MUST | Contain migration to the pilot | Non-pilot navigation and screens retain existing behavior and shared style contracts; Notes, Journal outside its Today insertion, capability screen and review are regression canaries |
| R-015 | MUST | Keep the implementation maintainable | Static CSS, semantic tokens and existing native architecture; no new runtime style injection, dependencies, external fonts/services or parallel theme preference |
| R-016 | MUST | Provide evidence proportional to the visual change | Tests, observed visual comparison, computed styles, keyboard, long text, responsive/zoom and offline results recorded individually; skipped or unavailable checks are not passes |

## Scope

### In scope

- Today empty, planned and active presentation, including existing remaining-plan and contextual sections.
- Existing start/configuration and completion/Evidence dialogs, including optional fields already inserted by other features.
- Session Companion typography and controls, preserving its floating behavior, drag, timer and optional E1 checkpoint.
- Existing saved-Evidence continuation panel.
- Pilot-scoped tokens and primitives, minimal presentational markup and Today Journal insertion ordering when necessary.
- Relevant regression tests, reviewed visual evidence, design-system documentation and forward cache generation at Build.

### Out of scope

- Delivery 2 navigation simplification, new menus, hidden energy suggestions, renamed domain terminology or new routes.
- Deliveries 3–6, learning-continuity changes, new recall/gap workflows, mastery scores, planning behavior and integrations.
- New session/Evidence rules, changed validation limits or required fields, automatic nextAttempt updates, altered scheduling or capability state.
- Storage implementation, schema migration, backup format, Markdown/vault contracts, sync behavior and Service Worker architecture.
- Global redesign of Notes, Journal, Frentes, review, settings, full Deep Work screen or history.
- A new persisted theme setting; the prototype's dark palette alone does not authorize one.
- Commit, push, merge, deployment, publication or changing the existing PR's readiness.

## Business rules

| ID | Rule | Rationale or source |
|---|---|---|
| BR-001 | Active/paused execution precedes current capability attempt, then other incomplete action, then planning fallback | `docs/today-feature.md`; no visual ranking algorithm |
| BR-002 | Immediate start remains immediate; configuration stays optional | Existing Today and session entry contracts |
| BR-003 | Reference completion/removal changes only the current supported plan behavior | No automatic capability/nextAttempt mutation |
| BR-004 | Evidence validation, save ordering and canonical identity remain unchanged | `evidence-feature.js`; existing transactional tests |
| BR-005 | Canceling completion retains the baseline active/paused behavior and excludes time spent in the form | `docs/sessions-feature.md` |
| BR-006 | Optional ritual, contingency, energy, futureUse and E1 context stay optional with current eligibility | No new questions or inferred links |
| BR-007 | Existing non-pilot navigation remains discoverable in the same routes and order | Delivery 1 hard boundary |
| BR-008 | Persistence failure must retain existing recovery and observable error behavior | Local Data Safety baseline |

## Constraints and dependencies

| ID | Type | Constraint or dependency | Impact |
|---|---|---|---|
| C-001 | Technical | Static vanilla HTML/CSS/JS PWA | No framework, build architecture, external service or runtime dependency |
| C-002 | Architecture | Existing CSS has shared rules and injected legacy styles | Design must trace specificity, injection order and non-pilot consumers before migration |
| C-003 | Data | `compasso.state.v3` and existing collections/exports | Zero migration; storage/SW architecture excluded |
| C-004 | Baseline | Branch starts at Local Data Safety checkpoint 5c7fb21 | This is a dependent worktree; no assumption that checkpoint is merged into main |
| C-005 | Validation | `npm test`, `npm run build:test`, `npm run test:browser`, `npm run test:all` in package.json | Select exact checks in Design; record actual commands and results in Build |
| C-006 | CI | `.github/workflows/browser-tests.yml` runs test:all on Ubuntu with Chromium | Local results do not imply remote CI for the new delivery |
| C-007 | Release | Existing human installed-PWA v77 to v78 gate is external | Do not close it through prototype evidence or automated viewport checks |
| C-008 | Process | AGENTS requires Define, Design, Build evidence and Ship | Build file scope comes from the subsequent complete Design manifest |

## Assumptions and risks

| ID | Assumption | Impact if false | Validation |
|---|---|---|---|
| A-001 | Request to continue after recommendation permits using A as working direction | Choosing B changes tokens and visual targets | Explicitly disclosed in this session; preserve as assumption, not a fabricated user vote |
| A-002 | Local Data Safety checkpoint is the intended reference for the pilot | New base may alter selectors/contracts | Recheck branch, HEAD, diff and manifest before Design/Build; reconcile openly |
| A-003 | System Georgia fallback provides the intended readable heading | Windows/mobile wrapping may differ | Inspect actual rendered text at target widths; no webfont dependency |
| A-004 | Presentational changes can satisfy hierarchy without behavior changes | Requires separate scope decision if false | Document UX defect separately; do not silently change flow |
| A-005 | Shared controls can be scoped safely | Style leakage into other screens | Explicit selectors and non-pilot canaries in Design |

## Acceptance scenarios

| ID | Given | When | Then | Covers |
|---|---|---|---|---|
| AT-001 | Empty Today | Open the screen | Existing first action is readable and dominant, with secondary context following it | R-001–R-003, R-005 |
| AT-002 | Current capability attempt plus other plan items | Open Today | Primary attempt appears once before remaining plan; realistic SQL attempt is legible and actions do not compress it | R-003–R-006 |
| AT-003 | Active or paused session and other planned work | Open Today | Current execution takes precedence and existing resume/finish controls remain available | R-001, R-006, R-011 |
| AT-004 | Executable planned attempt | Use immediate start, then separately optional configuration | Existing initiation semantics remain; configuration fields use pilot typography and controls | R-002, R-006, R-011 |
| AT-005 | Open start dialog with optional integrations | Expand settings and traverse fields | Existing ritual/energy/contingency/context are readable and available without new required steps | R-006–R-010 |
| AT-006 | Active session | Pause, resume and refresh | State, context and timer follow existing contracts; Companion controls remain reachable | R-006, R-011 |
| AT-007 | Finishing session | Enter valid Evidence and save | Existing durable result and one canonical Evidence are retained after refresh; continuation uses the same visual system | R-001, R-010–R-012 |
| AT-008 | Session active or paused before finish | Cancel the completion dialog | Baseline restoration behavior is preserved; focus returns appropriately | R-007, R-011 |
| AT-009 | Any modal in the pilot | Use Tab, Shift+Tab, Enter/Space and Escape | Focus stays visible and contained while open; close returns focus to the logical trigger | R-007, R-009 |
| AT-010 | Six pilot states and realistic content | Inspect at 360, 390, 768 and 1280 CSS px | No document overflow, clipped actions or overlapping fixed controls; typography and touch targets meet thresholds | R-002, R-004, R-008–R-009 |
| AT-011 | Today and open start/finish dialogs on desktop | Set actual browser zoom to 200% | Text and controls reflow; all actions and focused fields remain usable | R-007–R-009 |
| AT-012 | Hover-capable and keyboard environments | Hover, focus and disable controls through existing state | Distinct visible states preserve text/semantics; no essential action depends on hover | R-009–R-010 |
| AT-013 | Fully cached application with persisted plan/session | Reload offline and resume/finish | Local flow and assets work; persisted Evidence is available after refresh | R-011–R-013 |
| AT-014 | Non-pilot Notes, Journal, capability and review screens | Open and operate regression canaries | Routes, shared controls and supported data behavior remain consistent with baseline | R-012, R-014 |
| AT-015 | Implemented pilot | Review actual styles and visual artifacts alongside baseline | Semantic palette, type hierarchy and reduced grouping are evidenced; snapshots are not accepted blindly | R-001–R-005, R-009, R-015–R-016 |
| AT-016 | Reduced-motion preference | Operate pilot controls and dialogs | Nonessential motion is suppressed without hiding state or blocking interaction | R-007, R-010, R-016 |

## Error and boundary scenarios

| ID | Condition | Expected behavior | Covers |
|---|---|---|---|
| ER-001 | Missing or invalid required Evidence | Existing validation blocks invalid completion; error is legible and associated with its field | R-007, R-010–R-011 |
| ER-002 | Persistence rejection at completion | Existing recovery and error remain reachable; no false success or style-dependent retry path | R-010–R-012 |
| ER-003 | Repeated save/start activation | Existing duplicate prevention preserved; loading/disabled appearance does not bypass it | R-010–R-011 |
| ER-004 | Long title, accented text, multiline Evidence or unbroken URL | Wrap without losing text, causing document overflow or hiding controls | R-002, R-004, R-008 |
| ER-005 | Missing/archived/historical capability reference | Existing non-executable fallback retained; presentation creates no inferred association | R-003, R-006, R-012 |
| ER-006 | Legacy session without optional context | Remains valid without fake placeholder questions or extra requirements | R-006, R-011–R-012 |
| ER-007 | Short viewport or software-keyboard viewport reduction | Dialog scroll exposes active field and submit/cancel; fixed Companion/navigation do not cover focused controls | R-007–R-009 |
| ER-008 | Floating Companion and optional E1 checkpoint | Existing interaction, drag and checkpoint behavior preserved; no hidden essential controls | R-006–R-008 |
| ER-009 | Browser refresh while finishing | Existing interrupted-session recovery preserved; visual migration adds no new recovery state | R-011–R-012 |
| ER-010 | Font unavailable, high contrast or increased text size | System fallback, meaningful borders and focus retain operation and readable hierarchy | R-002, R-007–R-009 |
| ER-011 | Existing UX defect prevents a target | Record separately with reproduction; do not silently extend Delivery 1 | R-014, R-016 |
| ER-012 | Missing physical PWA/zoom/accessibility evidence | Mark check pending or limited, never passed by proxy | R-016 |

## Technical context for Design

Ownership confirmed at the baseline: `today-feature.js` (`todayPrimaryState`, `renderTodayPrimary`, `renderToday`), `sessions-feature.js` (`installSessionUi`, `openSessionStartCore`, `openSessionFinish`), `evidence-feature.js` (`installEvidenceFields`, `installEvidenceCompletion`), `session-companion-feature.js` (`installUi`) and `journal-feature.js` (`renderJournalIntegrations`). Global visual ownership is `design-system.css`, `design-system-model.js` and `design-system-feature.js`.

Design must inspect conditional integrations in energy, ritual and contingency and distinguish CSS used by pilot dialogs from history or full Deep Work. The BRAINSTORM selector inventory is input, not an automatically approved file manifest. New cached-asset generation is chosen only against the actual Build baseline.

Available browser coverage includes design-system, capability-context, critical, journal, encoding-e1, local-data-safety and PWA lifecycle flows. Node and composition scripts are declared in package.json. No suite was executed in this documentation-only Define step; historical test counts do not validate the future implementation.

## Clarity score

| Dimension | Score (0–3) | Explicit evidence |
|---|---:|---|
| Problem | 3 | Prompt 1A and observed primary width, typography and nested grouping |
| Users | 3 | Personal learner, mobile/keyboard/zoom and offline use in prompt and product docs |
| Goals | 3 | Prompt 1B pilot and preservation objectives |
| Success | 3 | Quantified requirements and acceptance/error scenarios above |
| Scope | 2 | Pilot and exclusions explicit; Direction A remains a disclosed continuation assumption |
| **Total** | **14/15** | Meets 12/15 threshold for Design, not implementation completion |

## Open questions

- No blocking requirements question for Design. Direction A is the working premise disclosed to the user; an explicit alternative choice requires updating the visual requirements before Build.
- `DESIGN.md` resolves cascade migration, file manifest, light-only pilot behavior and evidence capture for actual 200% browser zoom. Execution of those checks belongs to Build.
- No new remote status is claimed. Baseline PR lifecycle and eventual integration are separate from this Define step.

## Revision history

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-09-05 | Codex | Defined Delivery 1 pilot from completed visual discovery and next-step request; isolated new worktree; no production changes |
| 1.1 | 2026-09-05 | Codex | Design completed; requirements unchanged; next phase Build under DESIGN.md manifest |
| 1.2 | 2026-09-07 | Codex | Build complete after user-confirmed AT-011; requirements unchanged; evidence in BUILD_REPORT.md |
