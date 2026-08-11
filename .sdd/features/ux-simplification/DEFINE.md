# DEFINE: UX Simplification — Continuity-first learning journey

## Metadata

| Field | Value |
|---|---|
| Feature slug | `ux-simplification` |
| Initiative | `learning-loop-redesign` |
| Delivery | `4 — Continuity-first learning journey` |
| Date | `2026-08-11` |
| Status | `Complete (Built)` |
| Clarity score | `15/15` |
| Authoritative input | `.sdd/features/ux-simplification/BRAINSTORM.md` |
| Shipped baseline | Capability-first Compasso — Delivery 3 at `b26f98416f277d60b1ee563c4d68f27261699bbb` |

## Problem statement

Compasso already preserves capability context across planning, execution, Evidence, learner-approved learning signals, reflection, and the explicit next-attempt decision. The durable model is complete, but the everyday interface fragments that loop across competing actions and secondary information.

A learner must currently identify the relevant attempt among multiple Hoje sections, configure a Session before using ordinary defaults, leave the completion flow to record an optional learning signal, and pass activity summaries before reaching the decision that changes the next attempt. On mobile, these costs are amplified by long pages and an icon-only global Execute control whose purpose and fallback are not sufficiently clear.

This Delivery must make the existing loop perceptibly continuous:

`Hoje → Session → Evidence / learningSignal → Weekly Review → explicit next-attempt decision`

It must do so through prioritization, progressive disclosure, direct continuation, and coherent interaction states. It must not add a domain, change durable ownership, infer legacy context, or remove advanced surfaces.

## Target users

| User or role | Need | Current pain |
|---|---|---|
| Self-directed learner using Compasso day to day | See and begin the most relevant current learning action with minimal deliberation | Hoje presents several actions and summaries with insufficient priority differentiation |
| Learner beginning or resuming focused work | Start immediately with trusted defaults while retaining optional control | Ordinary Session configuration is presented before the learner can execute |
| Learner completing a Session | Preserve Evidence and optionally capture what the attempt revealed without navigating away to rediscover context | Evidence and learning-signal capture are separate destinations |
| Learner reflecting weekly | Evaluate capability Evidence and make an explicit keep/revise decision before reviewing secondary activity detail | Activity summaries precede the principal learning decision |
| Mobile, keyboard, screen-reader, or zoom user | Reach, understand, operate, and recover from every primary action | Long mobile paths, unclear Execute naming, and inconsistent focus risk obscuring the next action |

## Goals and measurable requirements

| ID | Priority | Requirement | Measure |
|---|---|---|---|
| R-001 | MUST | The system SHALL present a continuous primary path from Hoje through Session completion, Evidence, optional learner-confirmed learning-signal capture, Weekly Review, and an explicit next-attempt decision. | Every transition in the path has one identifiable primary action and does not require an unrelated top-level route detour. |
| R-002 | MUST | Hoje SHALL use the state precedence in BR-001 and SHALL make the highest-precedence available action visually and semantically primary. | Exactly one state owns the primary action; lower-precedence content remains reachable without competing at the same hierarchy. |
| R-003 | MUST | A planned capability attempt is executable only when its Today reference resolves to an active capability and that capability's current next-attempt identity; the Today item must also be incomplete. | Archived, missing, stale, and completed references are never offered as startable current attempts. |
| R-004 | MUST | When more than one valid planned current attempt exists, Hoje SHALL use the learner's stored daily-plan order to choose the primary attempt and SHALL keep the remaining attempts accessible in that same order. | Selection is deterministic and introduces no score, inferred priority, ranking, or automatic reordering. |
| R-005 | MUST | The global Execute control SHALL have a clear accessible name and SHALL follow the deterministic context and fallback behavior in BR-002. | Its result can be predicted from active Session state and Hoje state; it never silently chooses or starts an unplanned learning context. |
| R-006 | MUST | From a valid capability-attempt action, the learner SHALL be able to start the existing Session flow immediately with the defaults already used by that entry point. | One activation from the primary action creates or opens the same kind of Session and provenance that accepting the existing default configuration would create. |
| R-007 | MUST | Optional Session configuration SHALL remain available through progressive disclosure and SHALL not block the default start. | The learner can reveal, change, and confirm every currently supported option before starting, while the collapsed state offers immediate start. |
| R-008 | MUST | Starting from a capability-aware action SHALL preserve the shipped capability/outcome and current-attempt provenance; resource-originated behavior SHALL retain its existing resource ownership and optional capability context. | Session, Deep Work, Execution Session, resource metrics, and provenance behave under their existing contracts. |
| R-009 | MUST | Session completion SHALL continue through the existing Evidence contract, and capability context shown by Evidence SHALL be derived only through the canonical `sessionId` relationship. | No separate Evidence-to-capability owner, duplicate association, or inferred legacy link is created. |
| R-010 | MUST | After Evidence is saved successfully for a capability-linked Session, the system SHALL present a compact success and continuation state with an optional, neutrally worded `Registrar sinal` affordance. | The learner can create a signal or leave without one from the completion context; no route search is required. |
| R-011 | MUST | Any signal suggestion SHALL be visibly identified as a suggestion derived from the just-completed Session or its Evidence, SHALL remain editable, and SHALL remain non-durable until the learner explicitly confirms saving it. | Dismissing or bypassing the suggestion creates no `learningSignal`; confirmation uses the shipped signal provenance and consent rules. |
| R-012 | MUST | The normal successful post-session continuation SHALL return the learner to Hoje; a valid capability-linked completion MAY also expose a secondary route to that capability. | No automatic redirect occurs before Evidence success; the completion state makes Hoje the primary continuation and capability detail secondary. |
| R-013 | MUST | Returning to Hoje after Session completion SHALL NOT complete, reopen, remove, or otherwise mutate the referenced Today item or the capability's current next attempt. | Today state and capability state change only through their existing explicit user actions. |
| R-014 | MUST | Weekly Review SHALL place capability reflection and explicit keep/revise decisions before secondary activity summaries, following BR-006. | On initial review entry, the first substantive section is the capability decision region when relevant capability context exists. |
| R-015 | MUST | A keep/revise choice SHALL be explicit for each relevant capability; choosing keep preserves the current next attempt, while choosing revise reveals and requires the replacement attempt before that decision can be saved. | Neither Evidence, a signal, review entry, nor review completion changes the next attempt without the learner's valid revise submission. |
| R-016 | MUST | Hoje's pending-weekly-decision action SHALL open the current Weekly Review directly at its decision-first context. | Focus lands on the first unresolved capability decision, or on general weekly closure when no capability decision exists. |
| R-017 | MUST | Secondary Weekly Review detail SHALL remain available through labelled progressive disclosure and SHALL provide an understandable collapsed summary. | Activity totals, plan-item detail, Evidence detail, unlinked activity, and Journal/attention detail remain discoverable and operable; no data is hidden or removed. |
| R-018 | MUST | Primary actions, progressive disclosures, completion states, and recovery states SHALL be coherent on mobile, by keyboard, with a screen reader, and at 200% zoom. | Requirements in BR-008 and acceptance scenarios AT-19 through AT-21 are satisfied without horizontal page overflow. |
| R-019 | MUST | The Delivery SHALL preserve all compatibility invariants in this document and SHALL introduce no new persistence concept, schema version, object store, route, backend, or external dependency. | State remains `compasso.state.v3`; existing and legacy data round-trip without inferred associations or destructive changes. |
| R-020 | MUST | Because the Delivery changes cached runtime UI behavior, its release SHALL advance the existing PWA application generation through the current manifest-owned mechanism without changing Service Worker architecture. | Updated and freshly installed clients receive one coherent forward generation and retain supported controlled and offline behavior; the exact generation identifier is decided in Design. |

## Scope

### In scope

- Hoje hierarchy, state presentation, valid-current-attempt prioritization, and direct actions.
- Deterministic behavior and accessibility of the global Execute control.
- Immediate start for capability-aware Sessions using existing defaults.
- Progressive disclosure of the existing optional Session configuration.
- Session completion continuity through Evidence and optional, learner-confirmed `learningSignal` capture.
- A compact post-session success state whose primary continuation is Hoje.
- Weekly Review ordering, capability reflection, keep/revise interaction, direct entry from Hoje, and progressive disclosure of secondary activity details.
- Mobile and one-handed use, keyboard order and activation, focus placement and return, accessible names, touch targets, 200% zoom, and no horizontal overflow.
- Coherent loading, empty, completed, unavailable, validation-error, persistence-error, and offline states for the affected journey.
- Compatibility validation for existing and legacy state, JSON backup/restore, offline startup, installed-PWA updating, and protected adjacent domains.

### Out of scope

- Consolidating Results and Consistency or changing their interpretation.
- Relocating book synthesis.
- Retiring, hiding, replacing, or redesigning the routes for Notes, Relations, or Contextual AI.
- Removing or consolidating any existing route or advanced surface.
- Changing Studies or Readings ownership, progress, status, or association semantics.
- Changing Session, Deep Work, Execution Session, Evidence, Today, capability, or Weekly Review durable ownership.
- A schema redesign, a new persistence model, a new collection, a new object store, a migration, or a state-version increment.
- Automatically creating a learning signal, inferring a legacy association, or automatically changing a next attempt.
- Capability percentage, mastery, confidence, completion, demonstrated score, ranking, streak, or any activity-derived competence measure.
- A new framework, backend, external AI dependency, telemetry system, or remote content processing.
- Service Worker architecture changes.
- Broad visual restyling, navigation consolidation, or information-architecture work unrelated to continuity.

## Business rules

| ID | Rule | Rationale or source |
|---|---|---|
| BR-001 | Hoje primary-state precedence is: (1) resumable active or paused Session; (2) first valid, incomplete planned current capability attempt; (3) first other incomplete planned action; (4) a planning action when no executable planned action exists. Completed, stale, archived, or missing capability references are informative/unavailable states and never displace an executable action. | Continuity requires resuming work already underway, then honoring the learner's explicit plan without inventing priority. |
| BR-002 | Global Execute SHALL resume a resumable Session; otherwise start the first valid planned current capability attempt in stored Today order; otherwise open or retain Hoje and move focus to its highest-precedence available planned action, or to its planning/next-action affordance when none exists. It does not automatically start a non-capability fallback action. | Gives Execute deterministic context and a safe fallback without choosing an unplanned capability or returning to a broader Frentes chooser. |
| BR-003 | A valid planned current attempt resolves to an active capability and the same canonical current-attempt identity recorded by the Today reference. A stale snapshot may remain visible as history/context but cannot start and is never relinked automatically. | Preserves stable attempt identity, archived/missing-reference safety, and no-inference behavior. |
| BR-004 | Immediate start uses the same values and semantics that the existing Session start would apply if the learner accepted its defaults. Progressive configuration may change only options already supported by that flow. | Simplifies initiation without silently changing execution semantics or adding configuration. |
| BR-005 | The post-Evidence signal entry uses neutral optional intent: `Registrar sinal`. A source-derived suggestion, when available, is labelled as based on the just-saved Evidence or Session, is editable, and is saved only through an explicit `Salvar sinal` action. An empty signal form remains available when no useful suggestion exists. | Keeps signals learner-authored or learner-confirmed and makes suggestion provenance understandable. |
| BR-006 | Weekly Review order is: compact week context/status; capability reflection and keep/revise decisions; general weekly reflection, learning-quality and priority/closure inputs; then secondary activity summaries collapsed by default. Historical navigation and completion status remain available without preceding the decision region. | Makes the learning adjustment the primary review job while preserving closure and all supporting detail. |
| BR-007 | Collapsed Weekly Review summaries SHALL identify their content and expose a useful count or state where available. Expanding them SHALL retain access to activity statistics, plan completion detail, Evidence, unlinked Sessions/activity, Journal/attention material, and existing record actions. | Progressive disclosure must reduce density without hiding or deleting evidence. |
| BR-008 | Critical controls require meaningful accessible names, native keyboard activation, visible focus, deterministic initial/returned focus, and touch targets consistent with the existing coarse-pointer contract. Dialog-like disclosure must support Escape/Cancel and restore focus. Status, error, disabled, stale, and success meaning cannot rely on color alone. | Repository accessibility contract and the identified mobile Execute defect. |
| BR-009 | Evidence success precedes any signal affordance. If the learner skips signal capture or confirms a signal, the primary continuation is Hoje. A capability-detail continuation is shown only when its reference remains valid. | Preserves Evidence ownership and creates an understandable end to execution. |
| BR-010 | A Today completion marker remains only a planning fact; Session state remains an execution fact; Evidence remains an evidence fact; `learningSignals` remain learner-controlled decision support; Weekly Review owns reflection and the explicit keep/revise decision. | Shipped Capability-first ownership boundaries. |
| BR-011 | Legacy unlinked Sessions and Evidence remain valid and unlinked. Missing, archived, or deleted references degrade safely and never cause automatic association, recreation, or data deletion. | Mandatory backward compatibility. |
| BR-012 | No signal, activity metric, Evidence item, Session result, Today action, or review event automatically changes capability lifecycle, progress, or the next attempt. | Learner control and metric-neutral capability semantics. |

## Constraints and dependencies

| ID | Type | Constraint or dependency | Impact |
|---|---|---|---|
| C-001 | Data | `compasso.state.v3` remains authoritative; no schema, collection, key, or migration is added. | UX state must be represented with existing durable records or ephemeral interface state. |
| C-002 | Persistence | Existing `learningSignals` consent, source snapshot, normalization, merge, conflict-preservation, and tombstone semantics remain unchanged. | The handoff can create, update, or dismiss signals only through the shipped contract. |
| C-003 | Ownership | Evidence capability context derives through canonical `sessionId`; Session/Evidence identities and Today ownership isolation remain unchanged. | No direct Evidence capability owner or Today-to-capability mutation may be introduced. |
| C-004 | Legacy compatibility | Existing unlinked Sessions/Evidence and unavailable references remain first-class valid data. | Simplified flows must handle absence of capability context without inference or failure. |
| C-005 | Local operation | IndexedDB remains primary persistence; the bounded localStorage compatibility mirror/fallback, local-first use, offline use, and refresh/reopen behavior remain supported. | Every affected primary flow must work without a network after the app shell is available. |
| C-006 | Portability | JSON backup/restore and preservation of compatible unknown state remain unchanged. | New UI behavior cannot require export-format changes or discard fields during round-trip. |
| C-007 | Knowledge compatibility | Notes CRUD/access/search/source links, Markdown/vault folders and metadata, wikilinks, Relations, contextual traversal, and graph derivation remain intact. | No simplification may remove routes, data, parsing, traversal, or portability behavior. |
| C-008 | Contextual AI | Contextual AI routes and data, including `explanationEvaluations`, `errorNotebook`, legacy error records, Active Recall questions, and references, remain preserved and isolated from this Delivery. | The journey cannot depend on, replace, retire, or mutate Contextual AI. |
| C-009 | Resource compatibility | Studies and Readings retain their data, progress, status, associations, backup behavior, and resource-origin Session semantics. | Immediate start cannot promote resource progress to capability progress or drop resource context. |
| C-010 | PWA | The existing manifest-owned generation and Service Worker install/activate/update/cache/composition architecture remains authoritative. | Release uses a forward generation but no competing version source or Service Worker redesign. |
| C-011 | Routes | All current routes, deep links, and advanced surfaces remain available with their existing safe fallback behavior. | This Delivery changes contextual priority and transitions, not the route inventory. |
| C-012 | Privacy | No backend, external AI, telemetry, or remote content processing is introduced. | User learning content remains local-first. |

## Assumptions and risks

| ID | Assumption | Impact if false | Validation |
|---|---|---|---|
| A-001 | The existing Session entry point has deterministic defaults that can be invoked without first displaying optional configuration. | Design would need to revisit immediate start without changing semantics. | Design traces the current default-submit behavior and resulting Session record. |
| A-002 | Existing Today order is durable and sufficient to select among multiple valid planned attempts. | A new prioritization rule would be required, which is outside this Delivery. | Design identifies and tests the existing ordering source; no ranking model may be added. |
| A-003 | Existing Session completion distinguishes successful Evidence persistence from subsequent optional actions. | Signal failure could become coupled to Evidence completion. | Design proves independent success/failure boundaries and recovery behavior. |
| A-004 | Existing Weekly Review data can be reordered and disclosed without changing review persistence. | A persistence redesign would contradict scope and require Iterate. | Design maps existing review inputs and saved outcomes to the new presentation order. |
| A-005 | A current-review entry can carry an ephemeral focus target without adding a route or durable state. | Direct decision-first focus may need a different existing navigation mechanism. | Design chooses an existing compatible route/focus mechanism and tests refresh fallback. |
| A-006 | Updating cached UI assets requires a forward PWA generation under the current lifecycle. | Installed clients might retain incompatible mixed assets. | Design identifies the exact generation change and PWA validation required by its manifest. |
| A-007 | The isolated shipped baseline accurately represents Delivery 3 contracts. | Requirements could conflict with a newer integration change. | Design re-verifies the current target base and reports any concrete contradiction before expanding scope. |

## Acceptance scenarios

| ID | Given | When | Then | Covers |
|---|---|---|---|---|
| AT-01 | Hoje has a resumable active or paused Session and also has planned actions | Hoje renders or global Execute is activated | Resume is the single primary action; planned items remain accessible but do not displace it | R-002, R-005 |
| AT-02 | Hoje has no resumable Session and has one valid incomplete planned current capability attempt | Hoje renders | That attempt's meaning and current next-attempt text are primary, with direct immediate Session start and capability access | R-002, R-003, R-006 |
| AT-03 | Hoje has multiple valid incomplete planned current capability attempts | Hoje renders or global Execute is activated | The first item in stored daily-plan order is primary or starts, and the others remain in stored order without computed ranking | R-004, R-005 |
| AT-04 | Hoje has no resumable Session or valid current capability attempt but has another incomplete planned action | Hoje renders | The first such planned action becomes primary and no capability association is inferred | R-002, R-019 |
| AT-05 | Hoje has no executable planned action | The learner activates global Execute | Hoje opens or remains open, focus moves to the planning/next-action affordance, and no capability or resource is selected automatically | R-005 |
| AT-06 | A valid planned current capability attempt is primary | The learner activates immediate start | A Session begins using the existing defaults and preserves the current capability/outcome and attempt provenance | R-006, R-008 |
| AT-07 | The immediate-start option is available | The learner opens optional configuration | All currently supported choices are revealed, keyboard-accessible, editable, and can be cancelled with focus returned or confirmed to start the configured existing Session | R-007, R-018 |
| AT-08 | A Study- or Reading-originated Session has optional capability context | The learner uses immediate/default or disclosed configuration and completes work | Existing resource ownership and metrics remain intact, optional capability provenance is preserved when selected, and no capability progress is calculated | R-008, R-019 |
| AT-09 | A capability-linked Session reaches completion | The learner successfully saves Evidence under the existing validation rules | Evidence resolves context through `sessionId`, a compact completion state receives focus, and optional `Registrar sinal` plus primary Hoje continuation are available | R-009, R-010, R-012 |
| AT-10 | The completion state has no useful source-derived suggestion | The learner chooses `Registrar sinal` | An empty, editable signal form opens; nothing is saved until explicit confirmation | R-010, R-011 |
| AT-11 | The completion state can derive suggested signal text from the just-saved Session or Evidence | The learner chooses `Registrar sinal` | The suggestion is labelled with its source intent, remains editable, and creates no durable record until `Salvar sinal` is activated | R-011 |
| AT-12 | A learner sees the optional signal handoff | The learner skips it | No `learningSignal` is created, and the learner can continue to Hoje without penalty or repeated blocking prompt | R-010, R-012 |
| AT-13 | A learner explicitly saves a valid signal | The save succeeds | Exactly the confirmed signal is durable under existing provenance semantics, and the learner can continue to Hoje with an understandable success state | R-011, R-012, R-019 |
| AT-14 | A capability-linked Session has completed successfully | The learner follows the secondary capability continuation while the capability is still valid | The existing capability detail opens without changing Today completion or the next attempt | R-012, R-013 |
| AT-15 | The learner returns to Hoje after Session completion | Hoje renders | The Today reference retains its prior completed/incomplete state until the learner explicitly changes it, and the next attempt remains unchanged | R-013 |
| AT-16 | The current week contains capability-linked executions, Evidence, signals, or reflection context | Weekly Review opens | Compact week context is followed by capability reflection and keep/revise decisions before general closure and collapsed secondary activity summaries | R-014, R-017 |
| AT-17 | A capability decision is shown in Weekly Review | The learner chooses keep | The current next attempt remains unchanged and the explicit decision can be saved without a replacement attempt | R-015 |
| AT-18 | A capability decision is shown in Weekly Review | The learner chooses revise | A replacement-attempt input is revealed and required; only a successful explicit save changes the current next attempt | R-015 |
| AT-19 | Hoje shows a pending weekly decision | The learner activates its action | The current Weekly Review opens with focus on the first unresolved capability decision, or on general weekly closure if there is no capability decision | R-016, R-018 |
| AT-20 | A secondary Weekly Review section is collapsed | A keyboard, pointer, or touch user inspects and expands it | Its label, count/state summary, expanded content, focus indication, and collapse action are understandable and all existing detail remains reachable | R-017, R-018 |
| AT-21 | The affected journey is used at 360–390 px width or 200% zoom | The learner navigates, starts/configures/completes a Session, handles a signal, and reviews the week | The primary action remains reachable, touch targets meet the existing coarse-pointer contract, content has no global horizontal overflow, and status meaning is not color-only | R-018 |
| AT-22 | A keyboard or screen-reader user uses the mobile or desktop global Execute control | The control receives focus and is activated | Its accessible name communicates `Executar`, native activation works, and resulting focus follows the same deterministic resume/start/fallback behavior | R-005, R-018 |
| AT-23 | Existing state contains unlinked Sessions/Evidence and linked Capability-first records | The affected surfaces render, refresh, export, restore, normalize, or reopen offline | All valid records survive, legacy records remain unlinked, associations are not inferred, and `compasso.state.v3` remains unchanged | R-019 |
| AT-24 | A release includes this Delivery's cached UI changes | A current or newly installed PWA updates or starts offline through the existing lifecycle | One forward application generation supplies a coherent shell without a Service Worker architecture change or user-data loss | R-020 |
| AT-25 | Hoje has no resumable Session or valid current capability attempt but has another incomplete planned action | The learner activates global Execute | Hoje opens or remains open, focus moves to that planned action, and the action is not started automatically | R-005 |

## Error and boundary scenarios

| ID | Condition | Expected behavior | Covers |
|---|---|---|---|
| ER-001 | A planned capability reference is completed, stale, archived, missing, or no longer matches the canonical current attempt | It remains understandable as completed/unavailable historical context where possible, is not executable or primary, is not recreated or relinked, and another valid state receives precedence | R-002, R-003 |
| ER-002 | Global Execute encounters a stale candidate while resolving Hoje | It skips that candidate as executable, preserves it visibly under safe missing-reference behavior, and applies the fallback deterministically | R-003, R-005 |
| ER-003 | Immediate Session creation fails because validation or local persistence is unavailable | No partial or falsely active Session is reported; the originating context and user choices remain available with an announced error and a retry path | R-006, R-007, R-018 |
| ER-004 | Evidence validation or persistence fails during completion | The Session remains in its recoverable finishing state, entered Evidence remains available where the existing contract permits, no success/signal state appears, and retry or safe exit is clear | R-009, R-018 |
| ER-005 | Evidence succeeds but optional signal persistence fails | The completed Session and Evidence remain successful and unchanged; no false signal success is shown; the learner can retry or skip and continue to Hoje | R-010, R-011, R-012 |
| ER-006 | The learner dismisses or cancels an unconfirmed suggested signal | No durable signal or tombstone is created, and focus returns to the completion continuation control | R-011, R-018 |
| ER-007 | The linked capability becomes unavailable after Evidence succeeds | The optional signal/capability action becomes safely unavailable, historical Session/Evidence context is retained, and Hoje continuation remains usable | R-010, R-012, R-019 |
| ER-008 | An unlinked legacy Session completes | Existing Evidence completion continues without a fabricated capability signal suggestion or capability route; Hoje continuation remains coherent | R-009, R-010, R-019 |
| ER-009 | Weekly Review has no capability-linked context for the period | It shows a clear non-error empty state for capability decisions, then presents general weekly closure before collapsed secondary summaries | R-014, R-017 |
| ER-010 | Weekly Review contains unlinked activity alongside capability-linked activity | Capability decisions remain first and unlinked activity remains accessible in the labelled secondary summaries without inferred association | R-014, R-017, R-019 |
| ER-011 | The learner chooses revise but submits a blank or invalid replacement attempt | Save is blocked, the current attempt is unchanged, an accessible validation message is announced, and focus moves to the replacement field | R-015, R-018 |
| ER-012 | A Weekly Review decision or closure save fails | No partial success or next-attempt change is reported; entered review values remain available where feasible, the last valid state is preserved, and retry is offered | R-015, R-018, R-019 |
| ER-013 | The direct Hoje-to-review focus target is missing or already resolved | Weekly Review opens safely and focuses general weekly closure or the review heading without a blank/broken state | R-016, R-018 |
| ER-014 | The app is offline after its supported shell has loaded | Hoje, Session start/completion, Evidence, optional signal capture, Weekly Review decisions, and local navigation continue through existing local persistence; errors do not falsely imply network dependence | R-019, R-020 |
| ER-015 | A JSON backup or restored state contains signal conflicts, tombstones, unknown compatible data, or legacy records | Existing normalization, merge, conflict, tombstone, and preservation rules apply unchanged, without duplicate signals, revived deletions, or inferred associations | R-019 |
| ER-016 | Notes, Relations, Markdown/vault, wikilinks, graph data, or Contextual AI records coexist with the new UI behavior | Their data, routes, backup/restore, parsing, traversal, and existing behavior remain present and unaffected | R-019 |
| ER-017 | The interface is used with coarse pointer, reduced motion, keyboard only, screen reader, or constrained viewport | All primary and recovery actions remain named, operable, visible, focus-safe, and understandable without motion or color dependence | R-018 |

## Compatibility invariants

- The state contract remains `compasso.state.v3`; there is no new persistence concept, schema change, collection, store, key, or migration.
- `learningSignals` is the only shipped durable signal concept. Its explicit consent, source snapshot, normalization, merge, conflict-preservation, unlink/delete, and tombstone behavior remain unchanged.
- No suggestion becomes durable automatically. No signal automatically changes capability lifecycle, progress, or the next attempt.
- Capability lifecycle remains only `active` or `archived`; no percentage, mastery, confidence, completion, demonstrated score, ranking, or streak is introduced.
- Today references the canonical current attempt but does not own it. Completing, reopening, or removing a Today action never mutates the capability or attempt.
- Existing Session, Deep Work, Execution Session, and Evidence identities and ownership remain authoritative. Evidence capability context is derived through the canonical `sessionId` path.
- Legacy unlinked Sessions and Evidence remain valid and receive no inferred associations.
- Studies and Readings remain supporting resources. Their progress/status and resource-origin Session behavior do not become capability progress.
- Weekly Review may change the next attempt only through the learner's explicit valid revise decision; keep and all passive review activity leave it unchanged.
- IndexedDB, the bounded localStorage mirror/fallback, local-first use, refresh/reopen behavior, and offline operation remain supported.
- JSON backup/restore preserves existing domains, `learningSignals`, tombstones, conflicts, and compatible unknown data.
- Notes CRUD/access/search/source links, Markdown/vault portability, folders, metadata, wikilinks, Relations, contextual traversal, and graph derivation remain intact.
- Contextual AI routes and data remain intact and isolated, including `explanationEvaluations`, `errorNotebook`, legacy error records, Active Recall questions, and references.
- All existing routes and advanced surfaces remain available; Results and Consistency are not consolidated and book synthesis is not relocated.
- The release advances the existing manifest-owned PWA generation because cached runtime UI behavior changes, while preserving Service Worker architecture and user-data independence from cache replacement.
- Missing references degrade safely without crashes, fabricated links, silent deletion, or automatic recreation.
- No framework, backend, external AI dependency, telemetry, or remote processing is added.

## Decisions resolved from Brainstorm

| Decision | Resolution |
|---|---|
| Exact Hoje ranking/state precedence | Resumable Session, then first valid incomplete planned current capability attempt, then first other incomplete planned action, then planning fallback. Stored plan order resolves ties; completed/stale/archived/missing references are non-executable context. |
| Execute fallback with no valid attempt | Open or retain Hoje and focus its planning/next-action affordance. Never choose an unplanned capability/resource or fall back to the broader Frentes route. |
| Signal affordance, wording, and provenance | Use neutral optional `Registrar sinal`; offer editable source-derived text when useful and label it as based on the just-saved Evidence/Session; require explicit `Salvar sinal`; create nothing when skipped. |
| Post-session destination and continuation | Evidence success first presents a compact completion state. Hoje is the primary continuation; capability detail is secondary only when valid. Evidence or signal failure never causes premature navigation. |
| Weekly Review primary and disclosed sections | Capability reflection and keep/revise decisions lead. General reflection, learning quality, and priorities/closure follow. Activity statistics/detail, Evidence detail, unlinked activity, and Journal/attention detail are labelled and collapsed by default. |
| Direct Hoje link to decision-first review | Included. It targets the first unresolved capability decision, otherwise general weekly closure, with a safe heading fallback. |
| PWA generation impact | Required for release because cached runtime UI behavior changes. Exact forward generation and manifest impact are Design decisions; Service Worker architecture is unchanged. |

## Design questions

No unresolved product or scope decision blocks Design. Design must determine, without changing these requirements:

1. The exact presentation pattern for Hoje hierarchy, progressive Session configuration, the completion handoff, and collapsed review summaries using existing design-system behavior.
2. The existing selectors/services/events that provide resumable Session state, stored Today order, current-attempt validation, and safe navigation/focus targeting.
3. The orchestration and focus-restoration boundaries that keep Session, Evidence, signal, Today, and Weekly Review persistence independent.
4. The exact responsive layout and accessible announcement strategy that meets the mobile, keyboard, screen-reader, reduced-motion, and zoom requirements.
5. The closed implementation manifest and focused regression plan, including protected-domain canaries and installed-PWA evidence.
6. The exact next PWA generation identifier and affected cached asset manifest under the existing architecture.

## Clarity score

| Dimension | Score (0-3) | Explicit evidence |
|---|---:|---|
| Problem | 3 | The navigation, hierarchy, configuration, completion, review-order, and mobile-accessibility discontinuities are concrete and tied to the shipped learning loop. |
| Users | 3 | The self-directed learner and the affected execution, completion, review, mobile, keyboard, screen-reader, and zoom needs are explicit. |
| Goals | 3 | Twenty prioritized requirements define the exact continuity, precedence, fallback, consent, review, accessibility, compatibility, and PWA outcomes. |
| Success | 3 | Twenty-five acceptance scenarios and seventeen error/boundary scenarios specify observable results, recovery, and compatibility behavior. |
| Scope | 3 | In-scope surfaces, deferred IA work, explicit non-goals, ownership boundaries, and protected data/routes are unambiguous. |
| **Total** | **15/15** | Minimum for Design: 12. No blocking product decision remains. |

## Open questions

None — ready for Design. The six items in `Design questions` are implementation choices and evidence-planning tasks, not missing product requirements.

## Revision history

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-08-10 | Codex | Defined the approved continuity-first Delivery, resolved all seven Brainstorm decisions, and established testable behavior and compatibility boundaries. |
| 1.1 | 2026-08-10 | Codex | Design completed with the current implementation mapped to a closed 20-path manifest, `compasso-pages-v74`, and 25/25 acceptance traceability. |
| 1.2 | 2026-08-11 | Codex | Build completed after the approved test-manifest Iterate; all 25 acceptance scenarios and canonical repository validation pass without behavioral changes. |

## Define gate

**Define status: PASS — Complete (Built).**

## Next skill

Use `$sdd-ship` for **UX Simplification — Continuity-first learning journey**, treating this Define, DESIGN revision 1.2, and BUILD_REPORT revision 0.3 as the authoritative SDD chain.
