# UX Simplification — Compasso

**Initiative:** `learning-loop-redesign`
**Delivery candidate:** 4 — Continuity-first learning journey
**Status:** **Shipped**
**Date:** 2026-08-10
**Baseline:** Capability-first Compasso Delivery 3, shipped at `b26f98416f277d60b1ee563c4d68f27261699bbb`
**Phase boundary:** Product/UX discovery only; no production implementation is authorized by this artifact.

## 1. Product problem

Capability-first Compasso now preserves an optional learning context across planning, execution, Evidence, learner-approved signals, reflection, and the explicit next-attempt decision. The model is sound, but the visible journey still makes the learner navigate and make decisions that are not useful at the current moment.

The desired everyday loop is:

```text
Hoje → Session → Evidence / learningSignal → Weekly Review → next-attempt decision
```

Today currently mixes a large day hero, generic creation, the capability attempt, weekly direction, suggestions, pending decisions, and progress. Starting a capability session opens resource, mode, flow, ritual, objective, and Journal choices before the learner can use the normal default. Closing a session collects Evidence but then returns to Capacidades; registering a learning signal requires opening contextual detail first. Weekly Review shows activity and Evidence summaries before the capability reflection and keep/revise decision. On mobile, the primary decision is often below a large amount of secondary content.

The next delivery must simplify that continuity without replacing existing domains, changing durable ownership, or turning activity into proof of capability progress.

## 2. Product thesis

The primary surface should reveal the next useful learner decision, not the full system. A learner should be able to start the current next attempt immediately, capture what remained after execution with minimal interruption, and defer deeper interpretation until Weekly Review. Configuration, analytics, knowledge-management tools, and historical exploration should remain available when useful but should not compete with the next action.

## 3. Discovery evidence

### 3.1 Current navigation and information architecture

The current `information-architecture-model.js` exposes five fixed primary areas: **Hoje, Frentes, Journal, Revisão,** and **Mais**. Capacidades, Studies, Readings, Goals, Weekly Review, Results, Consistency, Active Recall, weakness/error tools, Notes, Relations, and Contextual AI are subviews. Essential/knowledge/advanced visibility levels already reduce what is shown by default.

The live v73 core UI showed that:

- Hoje is already the initial route and supports a `capability-attempt` plan reference, but generic **Nova ação** is visually prominent before the current next attempt.
- The global **Executar** action opens Frentes rather than the current execution context. On mobile, its icon-only control has no clear accessible name in the observed accessibility tree.
- Revisão is a hub before the learner reaches Weekly Review, Results, or Consistency. The fixed five-item mobile navigation itself is compact and should remain intact.
- Essential mode hides Notes, Relations, and Contextual AI. Knowledge and advanced modes retain access to them, so route retirement would not produce the largest immediate simplification benefit.

### 3.2 Capability-first journey

Delivery 3 established these visible and durable behaviors:

- Capacidades owns the capability, current next attempt, lifecycle, and supporting resources.
- Hoje owns only its reference/completion state. Adding a next attempt to Hoje opens the plan and does not modify the capability.
- Sessions and canonical execution own execution provenance through `learningContext`; Evidence resolves capability context through its existing `sessionId` contract.
- `learningSignals` is the only new durable concept. A signal requires learner submission or confirmation and never changes the next attempt automatically.
- Weekly Review owns the explicit keep/revise decision. Results and Consistency derive context without making capability-progress claims.

These are preserved constraints, not redesign targets.

### 3.3 Current flow observations

| Moment | Observed current behavior | Learner cost |
| --- | --- | --- |
| Hoje | The planned capability attempt is one row among a hero, generic creation, weekly focus, suggestions, decisions, and progress. | The intended next attempt is not consistently the first decision or strongest action. |
| Start session | A capability-aware start dialog preselects safe defaults but displays optional resource, execution mode, flow, ritual, session objective, and Journal intention before the start control. | Unnecessary setup and scrolling, especially one-handed on mobile. |
| Finish session | Evidence is captured in the established completion dialog; the learner then returns to Capacidades. | The optional signal decision is separated from the fresh execution moment. |
| Capture signal | Capability context exposes source projections and a short confirmation dialog. | The contract is good, but the entry point is not adjacent to session completion. |
| Weekly Review | Evidence and activity panels precede the capability reflection and keep/revise controls; general Journal and closing fields extend the page further. | The cycle-adjustment decision is visually and physically delayed. |
| Results / Consistency | Both repeat activity, session, time, and Evidence interpretation. Results also contains book synthesis. | The overlap is real but a broad consolidation would be a separate information-architecture delivery. |
| Notes / Relations / Contextual AI | Notes provide Markdown authoring, vault export, folders, links, and source access. Relations provides derived graph/dictionary exploration; Contextual AI provides local source-based retrieval. | They are advanced/contextual tools, not evidence that their contracts or routes can be removed now. |

### 3.4 Responsive and accessibility evidence

At a 390×844 mobile viewport:

- the five-area bottom navigation remained usable and within the viewport;
- Hoje required scrolling past the day hero and generic creation to reach the capability attempt;
- capability-row actions wrapped onto multiple lines;
- the session-start dialog placed the normal start action below multiple optional choices;
- Weekly Review placed its capability decision far below its hero, date controls, stats, Evidence, and activity sections;
- capability dialogs retained labelled controls and focusable close/cancel paths, while the icon-only global Execute control lacked a clear accessible name in the observed tree.

Existing Delivery 3 browser coverage already protects focus return, semantic labels, touch-target geometry, long text, 200% zoom, mobile overflow, route fallback, Notes/Relations/Context compatibility, and PWA lifecycle. This delivery must extend—not bypass—those protections.

## 4. Discovery questions and resolved answers

| Question | Answer / evidence | Resulting direction |
| --- | --- | --- |
| What should lead Hoje when a current capability attempt is planned? | User confirmed that the current next attempt is the primary state/action. | Present the current executable attempt before generic planning creation and use it as the primary action when it is valid. |
| Must every normal session expose full setup before starting? | User confirmed immediate start using existing defaults, with optional configuration progressively disclosed. | Keep resource, Deep Work, ritual, flow, objective, and Journal choices available behind an explicit adjustment path; retain all existing defaults and validation. |
| Where should Evidence and learning signals occur after execution? | User confirmed direct continuity from session completion to Evidence and optional `learningSignal` capture. | Keep existing Evidence ownership and consent, then offer a short optional signal decision while the execution context is fresh. |
| Where should the learner evaluate and adjust the next attempt? | User confirmed Weekly Review as the destination and asked that capability reflection/keep/revise appear before secondary activity summaries. | Reorder/reveal Weekly Review around explicit capability decisions; retain the existing weekly record as owner. |
| Should this delivery retire routes or consolidate analytical surfaces? | User explicitly deferred Results/Consistency consolidation, book-synthesis relocation, and retirement of Notes, Relations, and Contextual AI. | Preserve routes and advanced surfaces; record their eventual IA consolidation as later work only. |
| Is the mobile Execute accessibility issue in scope? | User explicitly included it where it belongs to affected navigation/UI. | Correct its accessible name and ensure the action has an unambiguous contextual destination if changed. |

## 5. Viable approaches

### A. Continuity-first learning journey — selected

**Mechanism:** Make Hoje state-led when a valid current capability attempt is planned; make normal session start immediate with existing defaults; disclose optional configuration deliberately; make post-session Evidence lead to optional signal capture; place Weekly Review capability reflection and keep/revise decisions before supporting activity summaries.

**Advantages:** Produces a noticeable end-to-end improvement in the highest-frequency journey, retains current ownership and routes, works for capability-linked and legacy/unlinked records, and limits the delivery to interaction hierarchy rather than data or IA replacement.

**Drawbacks:** The primary loop spans several existing surfaces and must preserve their different persistence/failure boundaries. Activity-rich secondary content remains available, so this is not a total visual reduction of every screen.

**Risk:** Medium. The affected flows are persisted and cross-domain, but no new durable concept, migration, dependency, or route retirement is required.

**Repository evidence:** Hoje already owns references; Session/Evidence/learningSignals/Weekly Review already have compatible ownership boundaries and Delivery 3 tests cover them.

### B. Information-architecture consolidation first — deferred

**Mechanism:** Combine or replace the Revisão, Resultados, and Consistência destinations; move book synthesis to Reading; replace standalone Notes, Relations, and Contextual AI with contextual entry points and route fallbacks.

**Advantages:** Could reduce navigation and duplicated analytics more aggressively.

**Drawbacks:** It mixes several independent user jobs, requires extensive route/deep-link, PWA, export, vault, graph, and contextual-AI audits, and does not make the next session easier quickly.

**Risk:** High. The Delivery 3 archive explicitly requires safe fallback/data access before any future retirement of Contextual AI, Notes, or Relations.

**Repository evidence:** Results contains both learning interpretation and book synthesis; Consistency contains global history/export; Notes and Relations retain portable and derived knowledge contracts; Contextual AI indexes several current domains.

### C. Hoje-only reordering — rejected for this delivery

**Mechanism:** Reorder Hoje and improve its primary call to action without changing session start, session finish, or Weekly Review.

**Advantages:** Lowest implementation surface.

**Drawbacks:** Leaves the most expensive choices before session start and the broken continuity from Evidence to signal/reflection intact.

**Risk:** Low, but the result would be too narrow to demonstrate the confirmed learning-cycle goal.

## 6. Selected delivery direction

**Delivery 4 — Continuity-first learning journey** will simplify the existing capability-first loop without changing its domain model:

```text
Hoje highlights the current attempt
  → one deliberate start action uses safe existing defaults
  → optional session configuration is available, not required
  → completion captures existing Evidence
  → learner may confirm an optional learning signal
  → Weekly Review leads with capability reflection and keep/revise
  → the next attempt changes only through that explicit decision
```

The delivery should use contextual capability information where it adds learning value and should keep generic/unlinked workflows fully available.

## 7. Expected before/after behavior

| Surface | Before | After | Trade-off | Compatibility risk | Delivery |
| --- | --- | --- | --- | --- | --- |
| Hoje | Generic creation and several supporting panels compete with the planned current attempt. | A valid current attempt has clear primary placement and a direct start action; generic planning stays available as secondary. | Less equal visual weight for every Today panel. | Low: Today remains reference owner only. | Now |
| Global execution control | Opens Frentes and is icon-only on mobile. | Has an accessible name and follows the chosen current execution context or a clearly labelled fallback. | Requires a defined fallback when no executable attempt exists. | Low: no route removed. | Now |
| Session start | Defaults exist but are mixed with optional choices in the first view. | Normal start is immediate; an explicit adjustment affordance reveals resource/Deep Work/ritual/flow/objective/Journal choices. | Advanced setup takes one intentional extra action. | Medium: preserve every session kind, validation, and provenance adapter. | Now |
| Session finish | Captures Evidence, then redirects to Capacidades. | Captures the same Evidence and offers a short optional signal action before returning the learner to a useful continuation state. | Adds a small optional post-save choice. | Medium: no automatic signal, no copied Evidence context. | Now |
| Weekly Review | Activity, Evidence, and Journal summaries precede capability decision controls. | Capability reflection and keep/revise are encountered before secondary summaries; supporting data stays available by progressive disclosure. | Activity diagnostics may require expansion/scroll. | Medium: preserve existing weekly fields, priorities, historical reviews, and unlinked activity. | Now |
| Results / Consistency | Separate analytics and synthesis surfaces. | Unchanged in this delivery; may receive only non-disruptive links if needed for continuity. | Navigation redundancy remains temporarily. | None from this delivery. | Later |
| Notes / Relations / Contextual AI | Advanced destinations and durable knowledge contracts. | Routes, data, exports, graph derivation, and contextual behavior remain intact. | No immediate simplification from retirement. | High if changed; therefore deferred. | Later |

## 8. In scope for Delivery 4

- Hoje’s primary capability-attempt state, priority, empty/unavailable/error presentation, and contextual action hierarchy.
- The global Execute control only where needed to make its label and destination accessible/unambiguous.
- Capability-aware normal Session start with immediate existing defaults and progressively disclosed existing configuration.
- Existing session completion’s continuity into Evidence and optional learner-confirmed `learningSignal` capture.
- Weekly Review ordering/progressive disclosure so the capability reflection and keep/revise decision precede secondary activity interpretation.
- Keyboard focus order/return, mobile and one-handed interaction, 44px target integrity, long text, 200% zoom, error/success/unavailable states in changed flows.
- Focused regression coverage for capability-linked and legacy/unlinked workflows, persisted refresh, backup/restore, offline/PWA behavior, and no-whitespace errors.

## 9. Explicit non-goals

- No new durable concept, collection, object store, storage key, schema bump, migration, backend, external AI service, framework, or dependency.
- No change to `compasso.state.v3`.
- No change to capability lifecycle or introduction of percentage, mastery, confidence, completion, score, ranking, or streak.
- No automatic learning-signal creation, automatic next-attempt change, automatic resource-progress change, or inferred association for legacy records.
- No retirement, removal, replacement, or route consolidation for Notes, Relations, Contextual AI, Results, or Consistency.
- No relocation of book synthesis from Results in this delivery.
- No change to Study/Reading progress semantics or their role as supporting resources.
- No rewrite of Session, Deep Work, Execution Session, Evidence, Active Recall, Journal, Weekly Review, Notes/vault, Relations/graph, or Contextual AI ownership.
- No PWA architecture redesign, deployment, publication, or unrelated visual refresh.

## 10. Compatibility and safety constraints

- Preserve local-first and offline operation, IndexedDB/localStorage behavior, JSON backup/restore, PWA cache/update architecture, and installed-PWA behavior.
- Preserve existing user data, including legacy unlinked Sessions and Evidence; never infer capability links.
- Preserve `learningSignals` normalization, merge, tombstones, conflict copies, source snapshots, explicit consent, and no-side-effect semantics.
- Preserve evidence projection strictly through `Evidence.sessionId → executionSessions.id → learningContext`.
- Preserve today-reference isolation: completing/removing a Hoje item must not alter a capability or next attempt.
- Preserve Notes CRUD/access, folders, Markdown/vault metadata, source links, wikilinks, graph derivation, search/contextual traversal, and JSON backup/restore.
- Preserve Contextual AI routes/modules/data, `explanationEvaluations`, `errorNotebook`, legacy error records, Active Recall questions, and references.
- Preserve deep links and safe route fallback; no legacy route can become an unhandled or blank surface.
- Preserve resource deletion/missing-reference behavior and graceful unavailable states.
- Keep the existing Service Worker architecture and manifest-owned composition. Any PWA generation change must be explicitly justified in Design rather than assumed in Brainstorm.

## 11. Success measures for Define

Define should make these observable acceptance targets precise:

1. With a valid planned current attempt, Hoje exposes it as the primary actionable state without requiring the learner to first navigate through Frentes or create a generic action.
2. A learner can start the normal capability-aware session using existing defaults without completing optional configuration; the advanced choices remain available and preserve their current effects.
3. Completing a session keeps existing Evidence capture intact and offers an optional, explicitly confirmed signal action while preserving no-signal completion.
4. Weekly Review presents each applicable capability’s reflection and keep/revise decision before secondary activity summaries, while unlinked/general activity remains reviewable.
5. An explicit revise decision remains the only behavior that changes the next attempt; keep is non-mutating.
6. The changed mobile path has labelled critical controls, usable touch targets, deterministic focus return, no horizontal overflow, and a reachable primary action at 360–390px widths.
7. Legacy Sessions/Evidence, missing/archived capability snapshots, resource-origin sessions, JSON backup/restore, Notes/vault/Relations/contextual-AI canaries, and offline/PWA lifecycle remain valid.

## 12. Define decision inputs (resolved in `DEFINE.md`)

These bounded product decisions were carried into Define and are resolved in `.sdd/features/ux-simplification/DEFINE.md`:

1. What exact Hoje ranking and visual treatment distinguishes an executable capability attempt from a paused, completed, archived, missing, or stale snapshot?
2. What is the global Execute fallback when there is no valid current attempt: open Hoje, open a compact chooser, or keep the existing Frentes route with clearer wording?
3. Does the optional post-Evidence signal affordance offer a single neutral “Registrar sinal” entry point, source-based suggested text, or both—while preserving the required confirmation boundary?
4. What is the best successful completion destination: return to Hoje, remain in a compact completion panel, or allow an explicit choice between Hoje and capability detail?
5. Which Weekly Review activity panels should be collapsed by default, and how should the ordered experience retain access to Evidence, unlinked sessions, Journal review, priorities, and quality without hiding data?
6. Should the Delivery include a small direct jump from Hoje’s pending weekly decision to the decision-first part of Weekly Review?
7. Is a PWA generation increment required by the final closed Design manifest, or can the changed existing cached assets remain on v73? This is a Design/Ship decision.

## 13. Deferred information-architecture consolidation

Later work may evaluate Results/Consistency consolidation, book-synthesis placement, and safe contextual replacements for Notes, Relations, and Contextual AI. It must begin with a separate Define/Design audit of routes, deep links, visible commands, persisted data, exports/backups, Markdown/vault portability, wikilinks, graph derivation, contextual traversal, manifest/cache composition, tests, and installed-PWA recovery.

No future simplification may silently delete data, parsing, graph derivation, backup content, or a recoverable route to user knowledge.

## 14. Quality gate

- [x] Current UI, navigation, responsive behavior, source, tests, and Delivery 3 shipped artifacts were inspected.
- [x] At least three missing product decisions were answered: Hoje priority, default session start, post-session signal continuity, Weekly Review order, route preservation, and mobile Execute accessibility.
- [x] Three viable approaches were compared with mechanism, trade-offs, risks, and repository evidence.
- [x] The user explicitly selected **A — Continuity-first learning journey**.
- [x] MVP scope, later work, non-goals, compatibility boundaries, and success measures are explicit.
- [x] No production code, persistence contract, migration, or implementation task was created.

**Brainstorm status: PASS — Complete (Defined).**

## 15. Next skill

The Brainstorm handoff is complete. Use `$sdd-design` with `.sdd/features/ux-simplification/DEFINE.md` as the authoritative behavioral contract.
