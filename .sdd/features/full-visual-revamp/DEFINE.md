# DEFINE: Compasso — Full Visual Revamp

## Metadata

| Field | Value |
|---|---|
| Feature slug | `full-visual-revamp` |
| Date | 2026-09-07 |
| Status | **Iterated — desktop composition correction in Build** |
| Clarity score | **14/15** |
| Direction | Caderno de trabalho, approved and implemented by Core Visual Revamp |
| Branch | `codex/full-visual-revamp` |
| HEAD / origin-main baseline | `f19c55cb99186330d918e96cb940f1a7a5ae8182` |
| PWA / state baseline | `compasso-pages-v79` / `compasso.state.v3` |
| Input | User accepted expanding the approved visual system across the rest of the application before UI/UX Simplification |
| Repository check | Isolated clean worktree; root AGENTS applies; no CodeGraph directory |
| Phase boundary | Define only; no product/test changes or test execution |

Worktree: `C:\Users\Giuse\OneDrive\Documentos\Every Second Counts\every-second-counts-app-full-visual-revamp`.

The visual direction is settled; no new A/B discovery is required. Core Visual Revamp remains a closed historical pilot. This is its explicitly authorized scope expansion, not a claim that the original pilot included all screens. Delivery 2 UI/UX Simplification is deferred; its separate worktree and uncommitted DEFINE remain preserved. Navigation simplification resumes only after this visual delivery.

## Problem statement

The user sees the new design in Today and session dialogs but the rest of Compasso retains the old presentation. The application feels inconsistent across routine work. Apply the same readable, calm visual language to all supported application surfaces while preserving their information, routes, actions and durable behavior.

## Target users

| User | Need | Current pain |
|---|---|---|
| Learner moving between planning, execution and reflection | Consistent hierarchy and controls | Visual language changes when leaving the pilot |
| Notes/Journal and review user | Comfortable reading, editing and forms | Legacy dense typography and container treatment |
| Mobile, keyboard and zoom user | Reachable controls across all screens | Pilot improvements are not app-wide |
| Existing data owner | Presentation improvement without workflow/data changes | Broad CSS changes could hide recovery or editing controls |

## Authoritative context

Inspected root AGENTS, README, docs/design-system.md, information-architecture-model.js, base view/dialog markup in index.html, package.json and the Core Visual Revamp artifacts. The route model currently declares Hoje, Frentes, Journal and Revisão, with capability, reading, study, goal, weekly, outcomes, analytics, recall, weakness, notes, dictionary and context destinations. Route declaration is not proof that a retired surface should be restored: Design must reconcile actual reachability and retirement contracts. No fresh live UI review is claimed by this Define.

## Coverage boundary

| Family | Required coverage |
|---|---|
| Application shell | Sidebar, header, mobile navigation, global controls, current-route indicator, existing drawers/menus and notifications |
| Frentes | Hub, Capacidades, Leituras, Estudos, Metas; lists, details, creation/edit dialogs and supported contextual panels |
| Journal | Day navigation, entries, editor, intention and existing completion/closure dialogs |
| Knowledge | Supported Notes/vault/editor/preview/search and relationship surfaces; preserve formatting, wikilinks and graph readability where supported |
| Review | Hub, weekly review, Results, Consistency, Active Recall, Caderno de erros; existing filters, charts, lists, forms and empty states |
| Settings and safety | Settings controls, mode selection, backup/import/restore confirmations, update/recovery UI, errors and status messages |
| Execution beyond pilot | Full Deep Work, history/edit history, energy/ritual/context dialogs, supported floating and Picture-in-Picture controls |
| Existing pilot | Today, start, active Companion, finish/Evidence and saved continuation remain visually and behaviorally consistent |

Design must enumerate every reachable screen, dialog and separate document into a coverage checklist with owner, states, visual decision and verification. App-wide completion cannot be declared from Today screenshots alone. Dormant/retired UI is not revived. Any surface excluded after inventory must have an explicit reason; omissions cannot silently redefine “full”.

## Goals and measurable requirements

| ID | Priority | Requirement | Measure |
|---|---|---|---|
| R-001 | MUST | Apply Caderno de trabalho across the complete supported surface inventory | Every inventory row has implementation and reviewed verification evidence; no unexplained legacy island |
| R-002 | MUST | Unify shell and content | Same semantic palette, type, spacing and control roles in desktop/mobile shell and all families |
| R-003 | MUST | Preserve the approved readable type hierarchy | Main reading text 17px equivalent, UI labels/helpers at least 14px, editable text at least 16px; prose line-height at least 1.5; user font scaling preserved |
| R-004 | MUST | Reduce redundant decorative grouping | No border/card nested solely for decoration; retain semantic lists, editor boundaries, chart legends and meaningful grouping |
| R-005 | MUST | Make controls and feedback consistent | Primary/secondary/destructive, disabled/loading/error/success and focus states use shared visual roles; meaning not conveyed by color alone |
| R-006 | MUST | Support small screens and zoom everywhere | No global horizontal overflow at 360/390/768/1280px and real 200% browser zoom; all controls reachable; intentional table/code/graph scrolling confined to its region |
| R-007 | MUST | Preserve accessibility | 44px touch targets or associated label target; contrast 4.5:1 normal text, 3:1 large text/focus/meaningful boundaries; keyboard, modal focus, reduced motion and forced colors work |
| R-008 | MUST | Preserve existing workflows and information | Same routes, order, visibility modes, CTA meanings, conditional fields and actions; no menu regrouping or feature hiding as a visual shortcut |
| R-009 | MUST | Preserve editing and durable data outcomes | Notes caret/focus/selection, autosave status, Journal editing, Evidence, backup/restore and Markdown behavior unchanged; no schema/key/collection changes |
| R-010 | MUST | Preserve offline and update lifecycle | Complete-cache application works offline; forward generation selected at Build; Service Worker architecture unchanged |
| R-011 | MUST | Keep the visual system maintainable | Shared static tokens/primitives in existing architecture; no framework, external fonts/services, new theme preference or additional runtime style injection |
| R-012 | MUST | Validate state and coverage, not just happy-path screenshots | Each family checked empty/populated, long content and relevant error/loading/disabled states; snapshots reviewed; automated and human evidence separately attributed |
| R-013 | MUST | Give desktop planning information a coherent spatial hierarchy | At desktop widths, Today uses bounded semantic modules, a clear primary-work column and a supporting-context column; actions remain attached to their content and no section creates excessive unowned whitespace |

Code, user-authored Markdown headings and chart labels may need domain-specific typography. Design must document any specific justified exception to R-003 rather than shrinking general UI text. The light palette is the approved direction; no new dark theme is included.

## Scope

### In scope

All supported surface families above; static CSS/token consolidation and only necessary presentational markup; existing icon/visual chart treatment; responsive forms/overlays; proportional test updates, reviewed screenshots, design-system documentation and forward cache generation.

### Out of scope

Navigation architecture, route or terminology redesign; Delivery 2 label/menu/discovery work; business/scheduling/scoring/recall rules; deletion of features/data; new content/AI/graph capabilities; schema, sync, storage or backup formats; new persisted theme; framework or dependencies; merge/deployment/publication. No Git commit/push is authorized by this Define.

## Business rules

| ID | Rule | Source |
|---|---|---|
| BR-001 | Visual changes must not change ranking, session precedence, plan ownership or next-attempt decisions | Existing pilot and Today contracts |
| BR-002 | Existing confirmations, validation, durability and recovery remain authoritative | Local Data Safety and repository data contracts |
| BR-003 | Notes, wikilinks/vault, Journal, capabilities and Evidence retain identity and content | User compatibility constraints |
| BR-004 | User modes and supported route accessibility are preserved; retired surfaces stay retired | Existing information architecture |
| BR-005 | Charts/graphs may change presentation only, not values, interpretation or links | Visual-only scope |
| BR-006 | Previous 200% confirmation validates the pilot only; expanded surfaces need new evidence | Evidence attribution |

## Constraints and dependencies

| ID | Type | Constraint | Impact |
|---|---|---|---|
| C-001 | Baseline | PR #80 merged; origin/main f19c55c, v79 | Start from integrated visual system; recheck before Build |
| C-002 | CSS | Legacy base, static and feature-injected styles coexist | Trace cascade and owner before migration; avoid blanket overrides |
| C-003 | Architecture | Vanilla static PWA and existing design-system framework | No new runtime stack; separate PiP document needs explicit handling |
| C-004 | Data | compasso.state.v3; IndexedDB/localStorage/JSON/Markdown | No migration; regression protection mandatory |
| C-005 | Verification | npm test; npm run build:test; npm run test:browser; npm run test:all | Choose focused checks per slice, full suite before closure; no blind snapshots |
| C-006 | Sequencing | UI/UX Simplification deferred | Preserve its artifact; revisit against new baseline after visual completion |

## Assumptions and risks

| ID | Assumption | Impact if false | Validation |
|---|---|---|---|
| A-001 | Approved direction extends coherently to editors and dense review data | Specialized layouts required, not another style direction | Live Design inventory and representative previews |
| A-002 | Shared tokens can replace narrow pilot ownership without regressions | Need explicit incremental migration boundaries | Cascade and feature-owner audit |
| A-003 | All supported separate surfaces can be exercised | Coverage gaps block full closure or require an explicit exclusion decision | Route/dialog/PiP inventory |

## Acceptance scenarios

| ID | Given | When | Then | Covers |
|---|---|---|---|---|
| AT-001 | Shell and every supported route/mode | Navigate across families | Coherent system, unchanged destinations/order/visibility and content | R-001,R-002,R-008 |
| AT-002 | Frentes items and capability contexts | Read/create/edit/cancel | Readable lists/forms; same actions, validation and durable results | R-003–R-005,R-008,R-009 |
| AT-003 | Journal populated and empty | Edit entries and traverse dates | Consistent presentation; focus/content and save behavior retained | R-001,R-003,R-009 |
| AT-004 | Notes/vault with long Markdown and links | Edit, preview, search and follow links | Editor selection/caret/autosave and supported navigation preserved | R-003,R-006,R-009 |
| AT-005 | Review families with real data and empty queues | Inspect and perform existing reviews | Legible controls/charts; same values, decisions and scheduling | R-001,R-004,R-008 |
| AT-006 | Settings and recovery/restore dialogs | Open, validate, cancel and exercise failure | Warnings/status/actions readable; confirmations and data safety unchanged | R-005,R-007,R-009 |
| AT-007 | Execution, history and supported PiP | Start/resume/finish and inspect history | Shared visual language without timer, focus or Evidence regression | R-001,R-008,R-009 |
| AT-008 | Each inventory family at target widths and real zoom | Traverse visible and expanded states | No global overflow/clipping; confined scrolling for dense regions; reachable actions | R-006,R-007 |
| AT-009 | Keyboard/reduced motion/forced colors | Operate controls, menus and dialogs | Focus visible and returned correctly; semantics retained | R-005,R-007 |
| AT-010 | Fully cached app with existing content | Reopen offline and refresh | All relevant routes/assets available, durable content unchanged | R-009,R-010 |
| AT-011 | Existing Today/session pilot fixtures | Run visual and behavioral canaries | Approved hierarchy, controls and flows preserved | R-002,R-008,R-012 |
| AT-012 | Completed inventory and reviewed evidence | Audit coverage | Every supported surface accounted for; no unverified whole-app claim | R-001,R-011,R-012 |
| AT-013 | Today at 1280–1600px and responsive breakpoints | Inspect empty and populated plan/recommendation states | Primary work, intention, plan, suggestions and decisions form a coherent desktop board; cards group semantic content without decorative nesting; the layout collapses without overflow or reordered interaction | R-002,R-004,R-006,R-008,R-013 |

## Error and boundary scenarios

| ID | Condition | Expected behavior | Covers |
|---|---|---|---|
| ER-001 | Quota/persistence or restore failure | Honest error, intact text/state and reachable recovery | R-005,R-009 |
| ER-002 | Long labels, code, unbroken URLs or wide tables | Wrap or contained scroll without global overflow | R-003,R-006 |
| ER-003 | Empty results, archived items and legacy references | Existing valid fallback, no invented content or linkage | R-008,R-009 |
| ER-004 | Short viewport/software keyboard reduction | Focused field and submit/cancel can be reached by scrolling | R-006,R-007 |
| ER-005 | Rerender while dialog/editor active | No focus loss, cursor reset or duplicate event actions | R-007,R-009 |
| ER-006 | Fonts unavailable or forced colors | System fallback and meaningful boundaries preserve operation | R-003,R-007 |
| ER-007 | PiP unavailable in browser | Existing fallback retained; no unsupported success claim | R-008,R-012 |
| ER-008 | Missing manual/installed-PWA evidence | Report pending explicitly; old pilot approval is not reused | R-010,R-012 |

## Clarity score

| Dimension | Score (0–3) | Evidence |
|---|---:|---|
| Problem | 3 | User identified visible mismatch after pilot |
| Users | 3 | Same learner and device/editing contexts as approved system |
| Goals | 3 | Explicit expansion of Caderno de trabalho across app |
| Success | 3 | Full inventory and measurable type, layout, accessibility and preservation targets |
| Scope | 2 | Whole supported app bounded; exact ownership/coverage needs Design audit |
| **Total** | **14/15** | Ready for Design |

## Open questions

No blocking direction choice. Design must enumerate all live surfaces, document any specialized typography and separate-document constraints, and define an ordered file manifest. It must not reduce scope to another pilot. Implementation may proceed in slices, but the final status must distinguish completed slices from whole-app completion.

## Revision history

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-09-07 | Codex | Authorized full visual expansion on integrated v79; deferred navigation simplification; requirements only |
| 1.1 | 2026-09-12 | Codex | Added desktop information-composition requirement after user review found Today too loose and its responsive hierarchy unclear |

Design handoff: `DESIGN.md` revision 1.1 governs the desktop composition correction; `SURFACE_COVERAGE.md` tracks every source-inventoried surface and additional dynamic families.
