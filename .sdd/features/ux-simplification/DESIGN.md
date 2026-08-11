# DESIGN: UX Simplification — Continuity-first learning journey

## Metadata

| Field | Value |
|---|---|
| Feature slug | `ux-simplification` |
| Initiative | `learning-loop-redesign` |
| Delivery | `4 — Continuity-first learning journey` |
| Date | `2026-08-11` |
| Revision | `1.2` |
| Status | `Complete (Built)` |
| Authoritative contract | `.sdd/features/ux-simplification/DEFINE.md` |
| Supporting rationale | `.sdd/features/ux-simplification/BRAINSTORM.md` |
| Shipped baseline | `b26f98416f277d60b1ee563c4d68f27261699bbb` |
| State contract | `compasso.state.v3` — unchanged |
| Forward PWA generation | `compasso-pages-v74` |

## Design status

**PASS — Complete (Built).**

The current implementation supports the Delivery without a new domain, schema, route, configuration model, or persistence abstraction. The change is a closed composition of existing Today, Session, Deep Work, Evidence, `learningSignals`, Weekly Review, Journal, information-architecture, and design-system behavior.

## Current implementation evidence inspected

`.codegraph/` is absent in the isolated worktree, so the current source, tests, documentation, manifest, and CI workflow are authoritative.

| Area | Current evidence | Design consequence |
|---|---|---|
| Application composition | `app-manifest.js` owns module order, cached assets, state collections, and generation `compasso-pages-v73`; `service-worker.js` consumes that manifest rather than defining a second cache version. | Advance only the manifest generation to `compasso-pages-v74`; preserve module order, assets, collections, composition, and Service Worker architecture. |
| Today | `today-feature.js` preserves stored plan order, resolves `capability-attempt` items through the capability-context model, and distinguishes current, stale, archived, missing, and completed references. Active Deep Work and normal Sessions are already discoverable. | Add one derived primary-state selector and presentation. Do not persist ranking or duplicate a Today item. Reuse current reference validation and stored order. |
| Global Execute | `information-architecture-feature.js` creates `#iaExecuteBtn`; its current command opens `fronts`. At mobile widths the visible label is hidden by existing responsive CSS. | Give the control a permanent accessible name and delegate deterministic behavior to Today. Preserve all routes and the navigation model. |
| Session start | `sessions-feature.js` prepares the existing start form and its current defaults before creating normal or Deep Work execution. Resource and capability context are already represented by the shipped fields and canonical Execution Session record. | Use the same form as the only configuration source. Add default start and configured start entry modes; do not create a parallel draft or settings model. |
| Journal Session intent | `journal-feature.js` injects the existing Journal intent selector, then currently attaches it to a newly created Session in a queued second write. | Place that existing selector inside optional configuration and fold its chosen value into the same Session creation candidate commit. |
| Session completion | `sessions-feature.js` owns Session/resource/execution completion, while `evidence-feature.js` extends the finish form and currently appends Evidence in a subsequent save. | Preserve the two durable owners, but commit their already-defined record changes as one candidate-state persistence operation before announcing success. |
| Deep Work completion | `deep-work-feature.js` creates canonical `deep:<id>` execution identity, optionally records Evidence, saves, emits `execution:recorded`, and closes. | Make completion/interruption await the same candidate-state success boundary and emit the enriched event only after persistence succeeds. Preserve canonical IDs and Deep Work transitions. |
| Evidence projection | `evidence-feature.js` resolves capability context from `Evidence.sessionId` to `executionSessions.learningContext`. | The completion handoff carries IDs only and resolves current display context through the same canonical path; no Evidence association is added. |
| Learning signals | `learning-outcome-feature.js` already provides the signal dialog and candidate-state save, and `state-foundation.js` already normalizes/merges/tombstones `learningSignals`. A current `execution:recorded` listener redirects to Capabilities. | Reuse the dialog and persistence unchanged, add ephemeral suggestion provenance, and replace the automatic redirect with an explicit completion handoff. |
| Weekly Review | `weekly-review-feature.js` already aggregates Sessions, Evidence, signals, and capability reflections. Its save is a candidate commit with rollback, but activity summaries precede capability decisions and blank decisions are skipped. | Reorder existing sections, require explicit decisions for editable capability groups, and use native disclosure for secondary detail. Add no review data. |
| Journal Weekly content | `journal-feature.js` inserts Journal/attention material into Weekly Review. | Move the existing material into the secondary-detail slot without changing Journal records or actions. |
| Accessibility system | `design-system-feature.js` already enhances dialogs, traps focus, returns focus, and handles dynamic additions; `design-system.css` already defines coarse-pointer targets and reduced-motion behavior. | Reuse native dialogs and `<details>`. Add only journey-specific focus targets and responsive CSS; no new focus manager. |
| Persistence and portability | `state-foundation.js`, `index.html`, storage documentation, and existing tests establish state v3 normalization, whole-state JSON backup/restore, IndexedDB primary storage, bounded localStorage compatibility, and unknown-data preservation. | UI state is ephemeral. No migration, export change, object store, key, collection, or state-version change. |
| CI | `.github/workflows/browser-tests.yml` uses Node 22 and runs `npm run test:all`; package scripts expose Node, composition, browser, and combined validation. | Build runs focused checks during implementation and the unchanged canonical `npm run test:all` before handoff. |

## Proposed UX architecture

The Delivery adds a presentation/orchestration layer across existing owners. It does not introduce a journey controller or durable workflow record.

```text
existing Today plan + active execution
            │ derive, never persist
            ▼
       Today primary state
       ├─ resume existing execution
       ├─ start current capability attempt with existing defaults
       └─ focus safe Today fallback
            │
            ▼
 existing Session / Deep Work + canonical Execution Session
            │ one candidate-state completion commit
            ├─ existing Session/resource mutations
            └─ existing Evidence record, when valid
            ▼
 ephemeral completion panel
       ├─ Voltar para Hoje (primary)
       ├─ Registrar sinal (optional, explicit consent)
       └─ Abrir capacidade (secondary, only when valid)
            │
            ▼
 existing learningSignals persistence / existing Today state unchanged
            │
            ▼
 Today pending review → existing Weekly Review
            │ focus only, no new route state
            ▼
 capability decisions → general closure → disclosed supporting detail
            │
            ▼
 existing explicit keep/revise candidate commit
```

### Runtime contracts

The existing `CompassoFeatures` runtime remains the integration mechanism. Commands and emitted events below are internal UI contracts, not persistence APIs.

| Contract | Owner | Input/output | Purpose |
|---|---|---|---|
| `today.primaryState` | Today | No input; returns a fresh derived descriptor with `kind`, target identity, executability, and focus target. | Single source for Today rendering and global Execute precedence. No descriptor is persisted. |
| `today.executePrimary` | Today | Optional trigger; returns after resume/start/navigation has been initiated or safely rejected. | Global Execute and the Today primary action share deterministic behavior. |
| `today.openPrimary` | Today | Optional preferred focus; opens/retains Today, renders, then focuses the derived primary/fallback target. | Primary completion continuation and safe fallback. |
| `session.startDefault` | Sessions | Existing domain/item/capability context plus trigger. | Prepare the existing form with current defaults and submit its normal quick-session path without showing optional controls. |
| `session.openConfiguration` | Sessions | Same existing context plus trigger. | Open the same start form, expand optional configuration, and focus its first optional control. |
| `session.resume` | Sessions | Existing Session identity. | Resume or focus the current normal Session through its existing transition. |
| `deep-work.resume` | Deep Work | Existing Deep Work identity. | Resume or open the current Deep Work record through its existing transition. |
| `learningSignal.open` | Learning Outcome | Existing capability reference, existing source reference, optional editable suggestion, ephemeral origin label, trigger. | Reuse the shipped signal dialog and save semantics from the completion panel. |
| `weekly.openDecision` | Weekly Review | Current week; optional trigger. | Open the existing `weekly` route and focus the first unresolved editable capability decision, then general closure, then heading. |
| `execution:recorded` | Session/Deep Work completion | `{ sessionId, evidenceId, status, source }`; `evidenceId` may be absent only where the existing completion contract produces no Evidence. | Announce a successfully persisted execution boundary. Never emitted before save succeeds. |
| `learning-signal:saved` | Learning Outcome | `{ signalId, outcomeId, sourceRef }`. | Let the ephemeral completion panel acknowledge success and offer the primary Hoje continuation. |

Commands must fail safely when a feature is unavailable: open/retain Today, place focus on the Today heading or planning action, and do not fabricate or mutate context.

## Detailed interaction design

### 1. Hoje precedence and presentation

`today.primaryState` derives exactly one state on every render using DEFINE BR-001:

1. A resumable active or paused Deep Work or normal Session. If both historical systems expose a record, the already established active-record selectors decide; no new cross-domain scoring is introduced.
2. The first incomplete `capability-attempt` in stored Today order whose reference resolves to an active capability and the exact canonical current-attempt identity.
3. The first other incomplete, resolvable planned action in stored Today order.
4. The existing Today planning action when nothing executable is planned.

Completed, stale, archived, and missing capability references never become primary. They remain in the plan as explicit, non-executable context with text such as `Concluída no plano`, `Tentativa histórica`, `Capacidade arquivada`, or `Capacidade indisponível`; meaning does not rely on color.

Today gains a dedicated semantic `#todayPrimaryAction` region immediately below the hero. It has a programmatically focusable heading and exactly one visually primary action:

- Active/paused execution: `Retomar sessão`.
- Valid capability attempt: the capability name and current next-attempt text, `Iniciar agora` as primary, `Ajustar sessão` as secondary, and existing capability access as tertiary.
- Other planned action: the action title and its existing open/start affordance where applicable; global Execute focuses it but does not activate it.
- Empty plan: concise empty guidance and the existing `Nova ação` planning action.

The selected plan item is projected into the primary region and omitted from the lower active list to prevent duplicate competing actions; it remains the same underlying Today reference. All remaining items preserve stored order. An active Session does not remove any plan row.

The Today weekly-pending action calls `weekly.openDecision`. Missing command/target fallback opens the existing Weekly route and focuses its heading. Today completion toggles and removal continue using their current candidate-state behavior and never mutate a capability.

### 2. Global Execute fallback

`#iaExecuteBtn` receives `aria-label="Executar"` at creation, independent of whether its visible `<span>` is hidden. Its handler calls `today.executePrimary`:

- Resume state: call the matching existing normal/Deep Work resume command and focus the resumed surface.
- Valid capability attempt: start the normal quick Session immediately with current defaults.
- Other planned action: open/retain Today, scroll the primary region into view, and focus that action; do not activate it.
- No planned action: open/retain Today and focus `Nova ação`.
- Stale/missing state encountered during resolution: skip it as executable, retain it as explanatory context, then continue the same precedence.

The handler never opens Frentes as a fallback, never selects an unplanned capability/resource, and never infers context. The information-architecture route inventory and URLs remain unchanged.

### 3. Immediate Session start and progressive disclosure

The current Session start form remains the only source of defaults and configuration. `sessions-feature.js` separates its existing private preparation from presentation:

1. Resolve the same domain/item/capability/resource context now used by `openSessionStartCore`.
2. Reset every field, including fields injected by Journal or ritual features, to the same safe default used for a newly opened form. This prevents a hidden direct start from reusing stale DOM values.
3. Immediate start selects the existing quick/default mode and submits the same form path within the activation event. The existing submit event remains the user-gesture boundary for companion behavior such as reminder permission.
4. Configured start opens the same dialog. The context summary and `Iniciar sessão` are immediately visible; all currently supported optional controls appear inside one native `<details>` labelled `Ajustar sessão (opcional)`, collapsed by default. The explicit `Ajustar sessão` entry opens it expanded.
5. Resource, optional capability context, mode, ritual, objective, Journal intention, Deep Work minimum/contingency, and other existing choices remain available. Deep Work configuration continues into the existing Deep Work setup; immediate default start remains a normal quick Session.

Session creation becomes an awaited candidate-state operation. The candidate contains the existing Session record, canonical Execution Session record, resource association, and chosen existing Journal intent/entry reference. Only a successful `saveData` may close configuration and expose an active Session. On validation or persistence failure, restore the previous state, retain the form values, announce the error, and focus the invalid field or retry action. No partial Session is reported.

The Journal extension stops its queued second persistence write and supplies its already supported `journalEntryId`/intent to the Session candidate instead. This changes orchestration only, not Journal or Session schema.

### 4. Session completion, Evidence, and learning-signal handoff

Normal Session completion uses one candidate-state transaction at the UI orchestration boundary:

- Sessions still define Session status/timing, resource metric updates, and the canonical Execution Session update.
- Evidence still validates and constructs the existing Evidence record and remains its durable owner.
- The Evidence extension passes its validated record into the Session completion candidate. It does not add a direct capability reference.
- The candidate is assigned only for the existing `saveData` call; failure restores the previous state and keeps the finish dialog and Evidence draft available.
- Success closes the finish dialog, then emits enriched `execution:recorded`. There is no success event or completion panel before persistence.

Deep Work applies the same success boundary to its existing transition, canonical `deep:<id>` execution record, and existing Evidence creation. An interrupted execution or an existing valid completion path without Evidence may emit `evidenceId: null`; this does not create Evidence or infer context.

`evidence-feature.js` owns one ephemeral, nonmodal completion panel injected into the current shell. On successful `execution:recorded`, it resolves the canonical Execution Session and any Evidence by ID, renders a compact success state, scrolls it into view, and focuses its heading. It is not restored on refresh; the durable Session/Evidence remains authoritative.

The panel actions are:

- `Voltar para Hoje` — primary; calls `today.openPrimary`.
- `Registrar sinal` — optional; shown only while a usable active capability reference can be resolved from the canonical execution. It opens the existing signal dialog.
- `Abrir capacidade` — secondary; shown only while the capability record remains valid.

For a saved Evidence record, `Registrar sinal` uses source `{ type: 'evidence', id }`. When Evidence kind is `question` or `insight`, that kind is preserved; other useful Evidence text maps to neutral `feedback`. A useful summary may prefill editable text with visible wording that it is a suggestion based on the just-saved Evidence. Its ephemeral origin is `confirmed-suggestion` only after explicit save. If no useful source text exists, an empty form opens. For a completed capability execution without Evidence, the form may use the canonical execution source and empty learner-authored text; no Evidence is fabricated.

The existing signal dialog receives a visible provenance/help region and an ephemeral `signalOrigin`. Manual or empty entry retains origin `learner`; a reviewed source suggestion saves through the shipped `confirmed-suggestion` provenance. `Salvar sinal` remains the only creation action. Cancel creates neither record nor tombstone. Persistence failure leaves the dialog open with its edited text, announces the error, and leaves the successful Session/Evidence untouched. Successful save emits `learning-signal:saved`, closes through the existing dialog contract, and returns the learner to the completion panel with `Voltar para Hoje` focused.

The existing automatic `execution:recorded` redirect to Capabilities is removed. No completion path toggles a Today item, completes a capability, updates lifecycle, changes progress, or changes the next attempt.

### 5. Weekly Review composition and disclosure

The existing `weekly` route and existing review record remain unchanged. Its DOM is composed in this order:

1. Compact week range, previous/next navigation, status, and historical context.
2. `#weeklyDecisionRegion`: capability Evidence/signals/reflection and explicit keep/revise controls. This is the first substantive section when capability groups exist. A clear non-error empty state appears when none exist.
3. General reflection and closure: wins, lessons, blockers, general decision, quality, priorities, and the existing save action.
4. Secondary details, collapsed by default using native `<details>`:
   - activity totals/status;
   - Evidence details;
   - planned-item and unlinked activity details;
   - Journal/attention material.

Each `<summary>` includes a content label and available count/state. Existing record actions and information remain in their current owner; only their placement changes. Disclosure `open` state is ephemeral, is not exported, and resets closed when the week changes. A stored review may render its decision inputs, but secondary sections still start collapsed.

For every editable active/current capability group, an explicit decision is required before review save:

- `keep` hides the replacement input, persists the current attempt text in the existing reflection, and does not update the capability.
- `revise` reveals the existing replacement-attempt input and requires nonblank valid text. Only the successful existing candidate commit updates the capability and review together.
- No selection blocks save, announces the requirement, and focuses the first missing decision.
- Stale, archived, missing, and historical groups remain read-only and never block save.

The existing candidate-state rollback remains authoritative. On save failure, the last valid state is restored, all entered review fields/decisions are repopulated, keep/revise visibility is recalculated, and focus moves to the announced error/retry context. No partial next-attempt change is reported.

`weekly.openDecision` selects the current week, opens the existing route, renders, then focuses: first unresolved editable capability decision; otherwise the general closure starting field; otherwise the Weekly Review heading. Today uses this command; no query parameter, route, or durable focus state is introduced.

## Focus and accessibility orchestration

| Transition | Focus behavior |
|---|---|
| Global Execute → resume | Existing resumed Session/Deep Work primary control or heading receives focus. |
| Global Execute → valid attempt | Successful immediate start focuses the active Session surface; failure returns to the originating primary action or the invalid/retry control. |
| Global Execute → other/empty fallback | Today opens and its projected action or `Nova ação` receives focus. |
| Today → configured Session | Dialog opens under the existing focus trap; `Ajustar sessão` opens the native disclosure and focuses its first optional control. Cancel/Escape returns to the opener. |
| Completion success | Nonmodal completion heading with `tabindex="-1"` receives focus only after persistence. |
| Completion → signal | Existing dialog opens and focuses the signal text field. Provenance/help is programmatically associated with the field. |
| Signal cancel | Focus returns to the panel's `Registrar sinal` control; no durable change. |
| Signal save | Dialog closes using existing return-focus behavior, the panel acknowledges success, and `Voltar para Hoje` receives focus. |
| Today → Weekly decision | First unresolved editable decision receives focus; fallback is general closure, then review heading. |
| Weekly validation failure | The first missing decision or invalid revised-attempt field receives focus and an `aria-live`/alert message identifies the problem. |
| Persistence failure | Draft remains available; an alert is announced and focus moves to the relevant retry/error context. |

All new actions use native buttons; disclosures use native `<details>/<summary>` and retain Enter/Space behavior. Programmatic focus happens after render with `requestAnimationFrame`. Scrolling uses `scrollIntoView` without forced smooth motion. The existing dialog enhancer, focus trap, Escape behavior, focus return, visible focus styling, coarse-pointer contract, and reduced-motion styles remain in force. Disabled, stale, missing, success, and error states include text and do not rely on color alone.

## Responsive and mobile behavior

Journey-specific rules are added to `design-system.css`, not new runtime style tags:

- Primary and completion layouts use `minmax(0, 1fr)`, `min-width: 0`, and `overflow-wrap: anywhere` for long attempt, Evidence, and signal text.
- At `<= 620px`, Today primary, Session start, completion, and Weekly Review sections use one column and maintain document order matching visual order.
- At `360–390px`, action groups stack to full-width primary controls; secondary actions wrap below without covering content or the bottom navigation.
- The nonmodal completion panel is placed in normal flow on larger screens and as a safe, dismissible bottom continuation surface above the existing mobile navigation at `<= 760px`; it respects safe-area inset and never traps focus.
- At 200% zoom, no journey container uses a fixed content width or non-wrapping text that creates global horizontal overflow. Internal data tables, if any existing secondary detail requires them, may scroll within their labelled container rather than the page.
- Existing coarse-pointer media rules continue to enforce at least 44 px critical touch targets.
- Reduced-motion mode disables inherited decorative transitions; focus and state changes remain explicit without relying on animation.

The changed browser tests cover 360 px and 390 px viewport behavior, an equivalent 200% zoom constraint, coarse pointer, reduced motion, keyboard order, disclosure operation, and the icon-only mobile Execute accessible name.

## Persistence, data, and compatibility impact

### Durable impact

None beyond writes already defined by existing records:

- Session/Deep Work and canonical Execution Session records keep existing shapes and identities.
- Evidence keeps its existing shape and canonical `sessionId` provenance.
- `learningSignals` keeps the shipped shape, source snapshots, explicit consent, merge, conflict, unlink/delete, and tombstone semantics.
- Weekly Review and capability reflections keep existing shapes; revise updates the current next attempt only within the existing explicit successful transaction.
- Today items keep existing ownership and completion state.

The UI primary descriptor, disclosure state, completion panel, suggestion provenance label, focus target, and journey continuation are ephemeral. No new state collection, state key, IndexedDB object store, localStorage key, schema, migration, or backup field is introduced.

### Transaction boundaries

- Session start: one candidate commit for existing Session, Execution Session, resource, and optional Journal reference changes.
- Normal completion: one candidate commit for existing Session/resource/Execution Session changes plus an existing Evidence record.
- Deep Work completion: one candidate commit for existing Deep Work/Execution Session changes plus existing Evidence when applicable.
- Signal save: a subsequent independent existing `learningSignals` candidate commit. Its failure cannot roll back successful Session/Evidence.
- Weekly Review: the existing candidate commit remains the only place an explicit revise may update a next attempt.

### Protected compatibility

Normalization, refresh/reopen, JSON export/restore, IndexedDB/localStorage behavior, legacy unlinked Session/Evidence validity, unknown compatible data, Notes, Markdown/vault folders and metadata, wikilinks, Relations, graph derivation/traversal, Studies, Readings, Contextual AI data/routes, Active Recall questions, references, Results, Consistency, and all route fallbacks remain unchanged. No legacy association is inferred. Missing references degrade to labelled unavailable states.

## PWA and cache generation

The exact forward identifier is **`compasso-pages-v74`** because this Delivery changes cached JavaScript and CSS behavior. `app-manifest.js` remains the sole generation source. Its asset list, ordered module composition, collection catalog, and `compasso.state.v3` declaration do not change.

`service-worker.js`, `app-composition.js`, bootstrap behavior, install/activate/fetch strategy, cache cleanup model, and data storage are not modified. Automated validation proves manifest composition, controlled update behavior, and offline shell behavior. A human installed-PWA smoke remains a Ship release gate for close/reopen/update/offline observation; it is not replaced by browser automation.

## Closed implementation manifest

Build may modify only these 22 paths. Paths 1–20 are the unchanged approved product, documentation, and focused-test implementation unit. Paths 21–22 are test-only additions authorized by Iterate after canonical validation proved that the existing suites encoded superseded interactions. Every action is additive or in-place modification; no file may be created, deleted, moved, or renamed. SDD lifecycle artifacts are phase records and are not part of this product implementation manifest.

| # | Exact path | Action | Purpose | Depends on | Acceptance coverage |
|---:|---|---|---|---|---|
| 1 | `app-manifest.js` | Modify | Advance manifest-owned generation to `compasso-pages-v74`; preserve state contract, assets, modules, and collections. | None | AT-23, AT-24 |
| 2 | `today-feature.js` | Modify | Derive/render the single primary state, expose Today runtime commands, present unavailable states, connect immediate/configured start and decision-first review. | Existing capability-context, Session, Deep Work, Weekly runtime contracts | AT-01–AT-05, AT-15, AT-19, AT-25 |
| 3 | `sessions-feature.js` | Modify | Reuse the existing form for immediate defaults and optional disclosure; add resume command and candidate-state start/completion orchestration. | `today-feature.js` command use; existing runtime/model/storage | AT-01, AT-06–AT-09 |
| 4 | `evidence-feature.js` | Modify | Preserve canonical Evidence projection, join normal completion candidate, emit success after save, and render the ephemeral completion handoff. | Session completion seam; Today and signal commands | AT-09–AT-15 |
| 5 | `deep-work-feature.js` | Modify | Add deterministic resume and candidate-state completion/interruption with enriched post-save event. | Evidence handoff event contract | AT-01, AT-09–AT-12 |
| 6 | `learning-outcome-feature.js` | Modify | Reuse signal dialog for optional handoff, expose provenance/help, emit save acknowledgement, and remove automatic capability redirect. | Evidence completion panel | AT-10–AT-14, AT-23 |
| 7 | `weekly-review-feature.js` | Modify | Recompose decision-first order, require explicit decisions, implement native secondary disclosures and direct-focus command. | Existing capability-context and review models | AT-16–AT-20 |
| 8 | `journal-feature.js` | Modify | Place existing Session/Weekly Journal integrations inside optional/secondary disclosure and join Session candidate instead of a second write. | Session and Weekly DOM slots | AT-07, AT-16, AT-20, AT-23 |
| 9 | `information-architecture-feature.js` | Modify | Give global Execute a permanent accessible name and delegate to deterministic Today execution/fallback. | `today.executePrimary` | AT-01, AT-03–AT-05, AT-22, AT-25 |
| 10 | `design-system.css` | Modify | Add journey hierarchy, disclosure, completion, responsive, zoom, coarse-pointer, focus, and reduced-motion-safe presentation. | New semantic hooks from affected features | AT-02, AT-07, AT-09, AT-16, AT-20–AT-22 |
| 11 | `docs/today-feature.md` | Modify | Document primary precedence, runtime contracts, fallback, unavailable states, and ownership isolation. | Final Today implementation | AT-01–AT-05, AT-15, AT-19, AT-25 |
| 12 | `docs/sessions-feature.md` | Modify | Document default/configured start, resume, candidate commits, Journal integration, and failure behavior. | Final Session/Deep Work implementation | AT-01, AT-06–AT-09 |
| 13 | `docs/evidence-feature.md` | Modify | Document canonical projection, completion transaction, handoff, signal independence, and legacy behavior. | Final Evidence/signal implementation | AT-09–AT-14, AT-23 |
| 14 | `docs/weekly-review-feature.md` | Modify | Document decision-first composition, disclosure, focus command, explicit decisions, and rollback. | Final Weekly implementation | AT-16–AT-20 |
| 15 | `docs/capability-first-compasso.md` | Modify | Record continuity composition while reaffirming shipped ownership and compatibility boundaries. | All final runtime contracts | AT-06, AT-08–AT-19, AT-23 |
| 16 | `tests/today-central-contract.test.js` | Modify | Assert primary-state hooks/commands, stored-order/non-executable contracts, and decision-first link contracts. | Paths 2, 7, 9 | AT-01–AT-05, AT-15, AT-19, AT-25 |
| 17 | `tests/app-manifest.test.js` | Modify | Assert `compasso-pages-v74`, state v3, and unchanged manifest composition. | Path 1 | AT-23, AT-24 |
| 18 | `tests/browser/capability-context-flows.spec.js` | Modify | Exercise the full capability-aware journey, transactions/failures, signal consent, Weekly decisions, legacy/backup/offline canaries. | Paths 2–8, 10 | AT-02–AT-21, AT-23–AT-25 |
| 19 | `tests/browser/information-architecture-flows.spec.js` | Modify | Exercise Execute accessible name, resume/start/fallback precedence, direct review navigation, and unchanged routes. | Paths 2, 7, 9 | AT-01, AT-03–AT-05, AT-19, AT-22, AT-25 |
| 20 | `tests/browser/design-system-flows.spec.js` | Modify | Exercise keyboard/focus/disclosures and 360–390 px, 200% zoom, coarse-pointer, reduced-motion layout. | Paths 2–10 | AT-07, AT-09–AT-13, AT-16–AT-22 |
| 21 | `tests/browser/critical-flows.spec.js` | Modify | Update only the Hoje primary-placement and Weekly Evidence disclosure interactions while preserving capture persistence and Evidence edit/delete Session-isolation coverage. | Paths 2, 7 | AT-04, AT-17, AT-20, AT-23, AT-25 |
| 22 | `tests/browser/learning-outcome-flows.spec.js` | Modify | Update only progressive Session configuration, explicit completion continuation, and mobile settings-menu sequencing while preserving capability provenance, resource metrics, Evidence, and JSON backup/restore coverage. | Paths 3–6, 10 | AT-06–AT-15, AT-20, AT-23 |

If implementation evidence requires a path outside this manifest or conflicts with a durable contract, Build stops that area and returns to `$sdd-design` or `$sdd-iterate`; it must not expand the manifest silently.

## Dependency-ordered implementation plan

1. Update manifest generation and its static assertion (`app-manifest.js`, `tests/app-manifest.test.js`).
2. Establish Today derived-primary/runtime contracts and information-architecture delegation (`today-feature.js`, `information-architecture-feature.js`).
3. Refactor existing Session/Deep Work start, resume, and candidate transaction seams without changing record shapes (`sessions-feature.js`, `deep-work-feature.js`, `journal-feature.js`).
4. Join Evidence to the existing completion candidate and add the ephemeral completion panel (`evidence-feature.js`).
5. Adapt the existing signal dialog and event handoff (`learning-outcome-feature.js`).
6. Recompose Weekly Review, native disclosures, explicit decision validation, and focus command (`weekly-review-feature.js`, `journal-feature.js`).
7. Add durable journey presentation in `design-system.css`.
8. Update the five affected documentation contracts.
9. Implement the seven closed test-file changes, including the two Iterate-authorized regression suites, run focused validation, then the canonical suite.

## Closed test manifest and validation plan

### Test paths modified

Only these seven test paths are modified:

1. `tests/today-central-contract.test.js`
2. `tests/app-manifest.test.js`
3. `tests/browser/capability-context-flows.spec.js`
4. `tests/browser/information-architecture-flows.spec.js`
5. `tests/browser/design-system-flows.spec.js`
6. `tests/browser/critical-flows.spec.js`
7. `tests/browser/learning-outcome-flows.spec.js`

No screenshot baseline is expected to change: the current design-system reference surface is outside the opened journey state. If a snapshot changes, Build must inspect it and report the reason rather than regenerate it blindly.

### Existing regression tests executed unchanged

- `tests/capability-context-model.test.js`
- `tests/state-foundation.test.js`
- `tests/execution-session-model.test.js`
- `tests/session-timer-model.test.js`
- `tests/history-evidence-model.test.js`
- `tests/deep-work-model.test.js`
- `tests/browser/pwa-lifecycle-flows.spec.js`
- `tests/service-worker-composition.test.js`

The canonical suite also preserves the existing Notes, Relations, Contextual AI, Markdown/vault, wikilink, graph, JSON backup/restore, storage, route, and PWA canaries already present across repository tests.

### Commands

Focused Build validation:

```powershell
node --test tests/today-central-contract.test.js tests/app-manifest.test.js tests/capability-context-model.test.js tests/state-foundation.test.js tests/execution-session-model.test.js tests/session-timer-model.test.js tests/history-evidence-model.test.js tests/deep-work-model.test.js
npm run build:test
npx playwright test tests/browser/capability-context-flows.spec.js tests/browser/information-architecture-flows.spec.js tests/browser/design-system-flows.spec.js tests/browser/critical-flows.spec.js tests/browser/learning-outcome-flows.spec.js
```

### Iterate 1 — authorized regression-test interaction updates

Canonical Build validation produced 11 failures across desktop/mobile in the two newly authorized files. Source inspection, focused reproduction, and comparison with DEFINE R-002, R-007, R-012, R-014, R-017 and BR-006–BR-009 confirm that the product behavior is approved and the failing interactions are obsolete or incomplete. Build must preserve each test's semantic regression purpose as follows; it may not remove coverage or refactor unrelated cases.

| File and regression purpose | Obsolete expectation | Approved interaction and retained assertion | Classification |
|---|---|---|---|
| `critical-flows.spec.js` — Weekly Evidence edit/delete without deleting its Session | Evidence actions are visible immediately when Weekly Review opens. | Assert `#weeklyEvidenceDetails` is collapsed with an understandable summary, explicitly expand it, then perform the existing edit/delete assertions and prove the Session remains. | Superseded by decision-first Weekly Review and BR-006/BR-007. |
| `critical-flows.spec.js` — processed capture becomes a linked Hoje action | The created primary action must be duplicated inside `#todayList`. | Assert the action appears once in `#todayPrimaryAction`, remains persisted in `dailyPlans` with its source/link/outcome, and is not duplicated as a competing lower-list action. | Superseded by R-002 and the single-primary projection in this Design. |
| `learning-outcome-flows.spec.js` — capability Session preserves provenance/Evidence and no progress | Completion automatically returns to Capabilities and focuses the capability card. | Assert successful Evidence exposes and focuses `#executionCompletionPanel`; retain the provenance/no-progress assertions; explicitly activate `Abrir capacidade` before checking capability-card focus and projected Evidence. | Superseded by R-010–R-014 and removal of automatic redirection. |
| `learning-outcome-flows.spec.js` — Deep Work preserves attempt provenance | `#sessionMode` is directly visible, and completion automatically returns to the capability. | Open `#sessionOptionalConfig`, choose Deep Work, retain canonical provenance assertions, then assert the completion handoff and explicitly choose capability continuation before checking capability detail. | Superseded by R-007 and R-012. |
| `learning-outcome-flows.spec.js` — supporting resource retains its metric without capability progress | `#sessionOutcomeResource` is directly visible. | Open `#sessionOptionalConfig`, select the resource, and retain all Session resource-metric, capability-context, and no-capability-progress assertions. | Superseded by R-007; semantic coverage is unchanged. |
| `learning-outcome-flows.spec.js` — JSON backup/restore on mobile | After import, the test clicks the archived-capability tab while the existing settings menu still overlays it. | After import succeeds, explicitly close the existing settings menu through its normal control/outside interaction, then select the archived tab and retain the full/legacy JSON round-trip assertions. | Test interaction sequencing defect; reproduced data restoration succeeds and no persistence regression is indicated. |

The two files may change only at these interactions and their immediately necessary assertions/helpers. Unrelated test cleanup, timeout masking, coverage deletion, selector rewrites, or product changes are not authorized.

Cascade disposition: `BRAINSTORM.md` and `DEFINE.md` are deliberately unchanged because product direction, requirements, and all 25 acceptance scenarios remain valid. The original 20-path implementation is deliberately unchanged. `BUILD_REPORT.md` is updated only to record DESIGN v1.1 authorization and remains blocked until the two test files are changed and canonical validation passes in `$sdd-build`.

Canonical handoff validation:

```powershell
npm run test:all
git diff --check
```

Ship additionally performs the human installed-PWA smoke for v74: update an existing install, close/reopen, verify the v74 journey, and verify supported offline start without data loss.

### Acceptance-criteria traceability

| AC | Implementation evidence | Primary automated evidence | Additional evidence |
|---|---|---|---|
| AT-01 | Today primary resolver; normal/Deep resume commands; Execute delegation | `capability-context-flows.spec.js`, `information-architecture-flows.spec.js` | Session/Deep model regressions |
| AT-02 | Today primary capability projection/actions | `capability-context-flows.spec.js`, `today-central-contract.test.js` | Keyboard hierarchy check |
| AT-03 | Stored-plan-order resolver | `capability-context-flows.spec.js`, `information-architecture-flows.spec.js` | No ranking field in state diff |
| AT-04 | Other planned-action fallback with no inferred context | `capability-context-flows.spec.js`, `information-architecture-flows.spec.js` | State v3 regression |
| AT-05 | Empty Execute fallback to Today planning action | `information-architecture-flows.spec.js` | Focus assertion |
| AT-06 | Existing-form default submission and canonical provenance | `capability-context-flows.spec.js` | Execution/session model tests |
| AT-07 | Native optional Session disclosure and focus return | `capability-context-flows.spec.js`, `design-system-flows.spec.js` | Critical-flow regression |
| AT-08 | Resource ownership and optional capability context | `capability-context-flows.spec.js`, `critical-flows.spec.js` | Execution model regression |
| AT-09 | Atomic completion, canonical Evidence projection, focused panel | `capability-context-flows.spec.js`, `design-system-flows.spec.js` | Evidence/execution model tests |
| AT-10 | Empty optional signal form | `capability-context-flows.spec.js` | No record before submit assertion |
| AT-11 | Labelled editable suggestion and explicit confirmation | `capability-context-flows.spec.js`, `learning-outcome-flows.spec.js` | Provenance record assertion |
| AT-12 | Skip signal; no record; Hoje continuation | `capability-context-flows.spec.js` | State diff assertion |
| AT-13 | Exactly one confirmed durable signal | `capability-context-flows.spec.js`, `state-foundation.test.js` | Merge/tombstone regression |
| AT-14 | Secondary valid capability route with no mutation | `capability-context-flows.spec.js` | Today/capability state assertion |
| AT-15 | Today item and next attempt unchanged after return | `capability-context-flows.spec.js`, `today-central-contract.test.js` | Refresh persistence assertion |
| AT-16 | Decision-first Weekly composition | `capability-context-flows.spec.js`, `design-system-flows.spec.js` | DOM-order assertion |
| AT-17 | Explicit keep preserves attempt | `capability-context-flows.spec.js` | Persist/reopen assertion |
| AT-18 | Revise disclosure, validation, explicit update | `capability-context-flows.spec.js`, `design-system-flows.spec.js` | Failure rollback assertion |
| AT-19 | Today direct review focus/fallback | `capability-context-flows.spec.js`, `information-architecture-flows.spec.js` | Keyboard focus assertion |
| AT-20 | Labelled native secondary disclosures | `design-system-flows.spec.js`, `capability-context-flows.spec.js` | Existing detail/action reachability |
| AT-21 | 360/390 px, 200% zoom, coarse pointer, no overflow | `design-system-flows.spec.js`, `capability-context-flows.spec.js` | Reduced-motion assertion |
| AT-22 | Execute accessible name and native activation | `information-architecture-flows.spec.js`, `design-system-flows.spec.js` | Desktop/mobile focus assertion |
| AT-23 | State v3, legacy, backup/restore, refresh/offline, protected domains | `capability-context-flows.spec.js`, `state-foundation.test.js`, `critical-flows.spec.js`, canonical suite | Manual diff review |
| AT-24 | v74 manifest, unchanged SW lifecycle, offline update | `app-manifest.test.js`, `service-worker-composition.test.js`, `pwa-lifecycle-flows.spec.js` | Human installed-PWA Ship smoke |
| AT-25 | Other action focused but not auto-started | `information-architecture-flows.spec.js`, `capability-context-flows.spec.js` | State/session absence assertion |

All 25 acceptance scenarios are covered. Error scenarios ER-003 through ER-006 and ER-011 through ER-012 require explicit mocked persistence-failure browser cases; ER-001, ER-002, ER-007 through ER-010, and ER-013 through ER-017 are covered by the stale/missing/legacy, focus-fallback, responsive, offline, backup, and protected-domain cases above.

## Security, privacy, and operational impact

- No network call, backend, external AI, telemetry, permission expansion, or remote content processing is added.
- User-authored Session, Evidence, signal, review, Note, Journal, and Contextual AI content stays under current local storage and export controls.
- Dynamic text continues through existing escaping/safe DOM patterns; suggestion text is treated as editable user content, not executable markup.
- Offline operation does not depend on a network success state.
- Logging and analytics are unchanged; the implementation must not log learning content to the console.
- Build and Ship record exact test evidence. Release publication, deployment, commit, merge, or push remains separately authorized.

## Risks and mitigations

| Risk | Impact | Mitigation/evidence |
|---|---|---|
| Load-order extensions for Evidence, Journal, rituals, and Sessions could diverge between immediate and configured start. | Hidden defaults or duplicate writes. | Use the existing form as the single configuration source; reset injected fields; test both paths and resource origins. |
| Joining Session and Evidence mutations could accidentally blur ownership. | Duplicate Evidence or inconsistent Session state. | Keep record constructors/IDs in their existing owners; combine only the candidate persistence boundary; test failure before/after commit. |
| Render cycles could discard the intended focus target. | Keyboard/screen-reader discontinuity. | Centralize runtime focus commands, focus after render, and assert every transition/fallback. |
| The completion panel is ephemeral and disappears on refresh. | The convenience handoff is lost, though data is safe. | Intentional: durable Session/Evidence is already saved; Today and capability routes remain available. Do not add persistence for UI continuation. |
| Weekly disclosure could hide data or injected Journal content. | Compatibility regression. | Use labelled native disclosure, keep counts and all existing actions, and run protected detail reachability tests. |
| Installed PWA could temporarily serve mixed cached assets if generation is not advanced. | Incoherent UI. | Forward v74 manifest generation; unchanged composition/PWA tests; human installed-PWA Ship smoke. |
| Remote Linux/browser environment could expose focus/layout differences. | CI failure after local validation. | Preserve canonical Playwright suite and require remote CI before integration; classify rather than silently alter scope. |

## Rollback

Before publication, revert the exact 20-path implementation unit. Because no durable contract changes, existing state needs no down-migration.

After v74 has activated in installed clients, rollback must be forward-only: publish a subsequent manifest generation (for example v75) containing the reverted runtime behavior. Never reuse v73/v74, clear IndexedDB/localStorage, delete backups/vault files, or broadly purge user data. Existing v3 state, unknown compatible fields, `learningSignals`, Evidence, Sessions, reviews, Notes, Relations, and Contextual AI data remain valid in either UI version.

## Remaining unresolved questions

None. Source inspection revealed no contradiction with DEFINE. The Build phase must stop and report evidence if the closed manifest, existing record contracts, or candidate-state orchestration proves insufficient; it must not add a persistence concept or redesign the journey silently.

## Design gate

- Requirements are implementation-independent and unchanged: **Yes**
- Current implementation and test evidence inspected: **Yes**
- Persistence and ownership boundaries preserved: **Yes**
- Exact forward PWA generation selected: **Yes — `compasso-pages-v74`**
- Closed implementation manifest: **Yes — 22 paths; original 20 unchanged plus 2 test-only additions**
- Closed modified-test manifest: **Yes — 7 paths**
- Acceptance traceability: **25/25 scenarios**
- Canonical validation: **Pass — 183 Node tests and 157 browser tests; 19 intentional project skips**
- Migration required: **No**
- Blocking questions: **None**

**Build complete: Yes.**

## Revision history

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-08-10 | Codex | Created the implementation-ready continuity-first Design with a closed 20-path manifest and five modified test paths. |
| 1.1 | 2026-08-11 | Codex | Additive Iterate: authorized only `critical-flows.spec.js` and `learning-outcome-flows.spec.js`, mapped all 11 canonical failures to approved interactions, and returned canonical validation to Build without changing product behavior or acceptance criteria. |
| 1.2 | 2026-08-11 | Codex | Resumed Build updated only the two Iterate-authorized suites; focused, closed-manifest, PWA, Service Worker, and canonical validation passed with 25/25 acceptance coverage. |

## Recommended next skill

Use `$sdd-ship` for **UX Simplification — Continuity-first learning journey**, treating DEFINE, this Design revision 1.2, and BUILD_REPORT revision 0.3 as the authoritative SDD chain.
