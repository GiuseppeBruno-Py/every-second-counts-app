# Learning Loop Redesign — Define

**Delivery:** 3 — Capability-first Compasso
**Status:** Shipped — Capability-first Compasso
**Initiative:** `learning-loop-redesign`
**Baseline inspected:** shipped Operational Learning Loop tree at `f00e7c1eeeb07ffa9960d20f07b12ab20f22e37c`; product-equivalent integration is on `main`
**Primary source:** `BRAINSTORM.md`, Amendment 1 — future roadmap consolidation
**Prior deliveries:** `Actionable Outcome Foundation` and `Operational Learning Loop` are shipped, archived, and unchanged

## 1. Definition purpose

Define the smallest coherent delivery that makes a capability the optional learning context across Compasso instead of leaving it mainly inside the `Capacidades` view. A learner should be able to carry a capability and its current next attempt through planning, resources, execution, evidence, learning signals, reflection, and the next decision without turning activity into a competence score.

This document defines observable product behavior. It does not select record shapes, migrations, rendering architecture, or implementation files.

## 2. Problem and user

The target user is a person managing self-directed learning locally in Compasso. The shipped capability and operational-execution foundations already answer what the learner wants to do, what they will try next, and which completed/interrupted sessions and Evidence came from that attempt.

The remaining gap is fragmentation. Hoje, resource views, reviews, Results, and Consistency still present planning or activity with little capability context. Feedback, gaps, weak topics, questions, and insights exist in separate forms or are not carried back into the next-attempt decision. The user must reconstruct the learning loop manually.

## 3. Target outcome

After this delivery, a learner can optionally use a capability as shared context across the relevant learning workflow:

`Capability → next attempt → supporting resources → planning/Hoje → session → Evidence → feedback/gap → reflection → next attempt`

The capability remains the objective; resources and activity remain supporting context; Evidence and learner-approved feedback inform decisions without producing percentage, mastery, confidence, completion, or automatic competence state.

## 4. Scope

### In scope

- Capability-aware behavior in `Capacidades`, Hoje, Estudos, Leituras, existing Sessions, Evidence, Weekly Review, Results, and Consistency.
- Optional associations between capabilities and relevant planning, resources, executions, Evidence, and learning signals.
- A minimal capability-centered view of recent attempts, Evidence, feedback/gaps, reflection, and the current next attempt.
- Learner-controlled use of feedback, learning gaps, weak topics, questions, and insights to inform the next attempt.
- Compatibility constraints that prevent this delivery from depending on standalone Contextual AI and govern its later retirement.
- Explicit preservation requirements for Notes, Markdown/vault, wikilinks, and derived Relations capabilities.
- Legacy, missing-reference, backup/restore, local-first, offline, responsive, and accessibility behavior.

### Out of scope

- Removing IA contextual, Notes, or Relations from navigation; that belongs to the later `UX Simplification` delivery.
- A new AI service, external inference, account, backend, telemetry, or remote content processing.
- A new parallel Session, Evidence, Notes, Relations, feedback, question, or insight platform.
- Final record shapes, field names, collection ownership, schema versions, migrations, or file manifests.
- Automatic capability completion, mastery, demonstrated state, percentage, confidence, score, ranking, or streak.
- Converting existing Studies, Readings, sessions, Evidence, notes, weak-topic/error records, questions, or insights into capabilities.
- Replacing existing resource progress, Today completion, review history, Results, or Consistency history.
- Retiring Active Recall, spaced repetition, Markdown/vault, graph derivation, or legacy routes.
- PACER, GRINDE, RAIL, a broad knowledge-management redesign, or another Learning Loop delivery.

## 5. Minimum useful behavior by surface

| Surface | Required capability-first behavior | Boundary |
| --- | --- | --- |
| Capacidades | Show the current next attempt plus relevant linked resources, planned use, finalized executions, Evidence, learner-approved signals, and latest reflection; offer the next useful action. | It is not a percentage dashboard or a replacement for the source records. |
| Hoje | Let the user intentionally bring a capability's current next attempt into today's plan, open its capability, and start the existing execution flow. | A Today checkmark affects only the daily-plan item; removing it does not delete or complete the capability or attempt. |
| Estudos / Leituras | Show which capabilities a resource supports and allow the user to manage the optional association from a discoverable resource context. | Resource progress/status never updates capability state; deletion keeps the existing unavailable-reference behavior. |
| Sessions | Preserve the shipped capability/attempt snapshot; a Study/Reading-originated session may optionally select an active capability/current attempt. | Existing resource metrics continue only for Study/Reading targets; unlinked legacy sessions remain valid. |
| Evidence | Make derived capability context visible and navigable wherever the linked session provides it; include that Evidence in the capability context. | Evidence identity and source ownership remain intact; no inferred legacy link or duplicated capability score. |
| Weekly Review | Let the learner review capability-linked attempts, Evidence, and signals for the period, record a reflection, and deliberately keep or revise the current next attempt. | Review does not declare the capability complete and does not hide unlinked legacy activity. |
| Results | Present capability-linked Evidence and learner decisions as learning results while labeling time, sessions, and resource completion as supporting activity. | No activity metric is promoted to proof of capability. |
| Consistency | Allow capability-linked execution cadence/history to be inspected when useful, alongside unlinked history. | Cadence, streak, frequency, or volume is not capability progress or mastery. |

## 6. Requirements

### R-01 — Optional cross-cutting context

The system SHALL allow capability association only where the user is performing a learning-relevant action. Except when execution is explicitly started from a capability, lack of an association SHALL NOT block planning, resources, sessions, Evidence, reviews, Results, or Consistency.

### R-02 — Capability context summary

For an active or archived capability, the system SHALL present its current next attempt and the available related resources, planned Today reference, finalized executions, Evidence, learner-approved learning signals, and latest relevant reflection without copying or replacing their source records.

### R-03 — Today reference behavior

An active capability's current next attempt SHALL be addable to Hoje by explicit user action. The Today representation SHALL let the user open the capability or begin the existing session flow. Completing, reopening, or removing that Today item SHALL affect only daily planning state and SHALL NOT mutate capability lifecycle, next-attempt identity/text, Evidence, or resource progress.

### R-04 — Resource association behavior

Study/Reading support associations SHALL be consistently visible from both the capability and the resource context. The user SHALL be able to add or remove an optional association without deleting either record, altering resource progress, or fabricating capability progress.

### R-05 — Resource-origin execution context

When beginning an existing Study/Reading-backed session, the user MAY select an active capability and its current next attempt as learning context. The session SHALL retain the same stable outcome/attempt provenance guaranteed by Operational Learning Loop while preserving the resource's existing metric behavior.

### R-06 — Existing execution and Evidence continuity

Sessions begun from a capability SHALL continue to use the shipped Session/Deep Work/Execution Session/Evidence contracts. Evidence SHALL expose and navigate to capability context through its durable execution association. Legacy or unrelated sessions/Evidence SHALL remain valid and unlinked unless the user explicitly associates them through an approved behavior.

### R-07 — Learning-signal semantics

The product SHALL treat feedback, learning gaps, weak topics, questions, and insights as decision-supporting learning signals:

- **feedback** records what the learner or an existing local evaluation observed about an attempt or Evidence;
- **gap / weak topic** identifies something unresolved or insufficiently understood, not a failed capability state;
- **question** preserves an unresolved inquiry that may guide learning or retrieval;
- **insight** preserves a learner-approved conclusion or connection worth carrying forward.

These terms MAY share or reuse compatible existing records; this Define does not require separate entities.

### R-08 — Signal control and provenance

A learning signal SHALL be optional, attributable to its available source context, editable/removable under the source domain's existing rules, and visible from the associated capability. Automatically derived suggestions SHALL require user confirmation before becoming durable learning decisions. Missing source records SHALL not crash or delete the capability.

### R-09 — Next-attempt decision

Feedback, gaps, weak topics, questions, insights, Evidence, or review activity SHALL NOT automatically replace or complete the current next attempt. The learner SHALL explicitly keep or revise the attempt, and any revision SHALL preserve the shipped stable-identity and compatibility rules.

### R-10 — Weekly reflection

Weekly Review SHALL expose the relevant capability-linked attempts, finalized execution, Evidence, and signals for the review period and let the learner record a reflection plus a deliberate next-attempt decision. Existing review history and unlinked activity SHALL remain available.

### R-11 — Results interpretation

Results SHALL distinguish evidence-backed capability context from supporting activity. It SHALL show what was attempted/evidenced and which learner decision followed, while resource completion, elapsed time, and session totals remain explicitly labeled as activity rather than proof.

### R-12 — Consistency interpretation

Consistency SHALL allow the learner to inspect cadence/history for capability-linked executions when present. It SHALL preserve all legacy/unlinked execution history and SHALL not turn frequency, streak, duration, or volume into capability status.

### R-13 — Lifecycle and missing references

Only active capabilities MAY be newly selected for Today, resource-origin execution, or a new learning-signal association. Existing references to an archived or deleted/unavailable capability SHALL degrade safely, retain non-destructive historical context where available, and offer a valid route forward without recreating deleted data.

### R-14 — Contextual AI compatibility boundary

Capability-first Compasso SHALL NOT depend on the standalone `context` route, `context-rag-feature.js`, `context-learning-feature.js`, or an external AI service. This delivery SHALL NOT remove them or alter their persisted data.

The later retirement of the IA contextual destination MUST:

- preserve any `explanationEvaluations`, `errorNotebook`/legacy error entries, generated Active Recall questions, and other user data found by the required dependency audit;
- preserve JSON backup/restore and references to surviving source records;
- route old `context` links/bookmarks to a safe, understandable surviving destination rather than a blank or broken screen;
- remove manifest/cache dependencies only through a forward PWA generation with controlled-update and offline validation;
- add no substitute external AI dependency.

### R-15 — Notes and Relations preservation boundary

Capability-first Compasso SHALL NOT remove the Notes or Relations destinations. Any later UX Simplification MAY remove their standalone navigation only if users retain contextual access to:

- existing note creation, viewing, editing, search, links to source items, and JSON backup/restore;
- Markdown/vault import and export, folders and metadata needed for round-trip portability;
- wikilink parsing and traversal;
- derived relationship/graph information where it remains useful;
- notes, links, and graph derivation after legacy route or missing-reference recovery.

No migration may silently delete note data or introduce a mandatory relation datastore.

### R-16 — Data, offline, and interaction compatibility

All new behavior SHALL remain local-first after the PWA is loaded, survive save/reload and JSON backup/restore, preserve existing user domains and unknown compatible data, and require no new IndexedDB object store unless a later approved Design proves it unavoidable. Relevant controls SHALL remain keyboard-operable, labeled, focus-safe, readable at mobile widths and 200% zoom, and free of horizontal overflow.

## 7. Business rules

1. Capability association is opt-in unless the user started the action from a capability, in which case preserving that origin is mandatory.
2. The capability remains active/archived only; no signal, review, session, Today action, Study, Reading, or Evidence changes that lifecycle automatically.
3. One current next attempt remains canonical. Other surfaces reference or snapshot it according to their durability need; they do not become competing owners.
4. Study/Reading completion and progress remain resource facts. Today completion remains a planning fact. Sessions remain execution facts. Evidence remains an evidence fact.
5. Only finalized completed/interrupted executions count as historical attempt context; active/paused execution follows existing session behavior.
6. Learner-authored or learner-approved signals may influence the next decision but are not mathematical progress inputs.
7. Unlinked legacy records remain first-class and visible in their existing surfaces.
8. Removal of a surface is never authorization to delete its user data or portability contracts.

## 8. Acceptance criteria

### AC-01 — Optional association

**Given** a user creates or uses a Study, Reading, session, Evidence item, review, Results view, or Consistency view without selecting a capability, **when** the action is completed, **then** it behaves successfully under its existing legacy contract and no capability link is inferred.

### AC-02 — Capability summary

**Given** a capability has linked resources, a Today reference, finalized executions, Evidence, signals, or reflection, **when** the capability is opened, **then** each available context is understandable and navigable without displaying a capability percentage, mastery, confidence, completion, or score.

### AC-03 — Today opt-in and isolation

**Given** an active capability, **when** its current next attempt is intentionally added to Hoje, completed/reopened, opened, started, or removed, **then** Hoje reflects those planning actions while the capability lifecycle, next attempt, resource progress, and Evidence remain unchanged.

### AC-04 — Resource-side association

**Given** a Study or Reading and an active capability, **when** the user links or unlinks them from a supported resource context, **then** the same relationship is reflected in the capability context, neither record is deleted, and neither capability nor resource progress is fabricated.

### AC-05 — Resource deletion boundary

**Given** a linked Study or Reading becomes missing or is deleted, **when** either side is reopened or restored from backup, **then** the capability remains valid, the reference is represented safely as unavailable until explicitly removed, and no resource is recreated automatically.

### AC-06 — Resource-origin session

**Given** a Study/Reading-backed session start, **when** the user optionally selects an active capability/current attempt and completes the session, **then** resource metrics behave as before, the execution retains stable capability/attempt context, Evidence resolves that context, and capability progress/state remains unchanged.

### AC-07 — Legacy execution compatibility

**Given** existing sessions or Evidence without capability provenance, **when** they are normalized, viewed, edited, backed up/restored, or included in review/history, **then** they remain valid and unlinked with no inferred association or data loss.

### AC-08 — Learning signals

**Given** finalized execution or Evidence in capability context, **when** the learner records or confirms feedback, a gap/weak topic, a question, or an insight, **then** the signal is visible with its available provenance in the capability context and does not change lifecycle, progress, or the current attempt automatically.

### AC-09 — Suggested-signal consent

**Given** the application can derive a possible gap, weak topic, question, or insight, **when** the learner does not confirm it, **then** it is not persisted as a learner decision or used to change the next attempt.

### AC-10 — Deliberate next attempt

**Given** capability-linked Evidence, signals, or weekly reflection, **when** the learner chooses to keep or revise the current next attempt, **then** only the explicit choice changes it and the shipped identity/timestamp rules remain valid.

### AC-11 — Weekly Review

**Given** a review period containing linked and unlinked activity, **when** Weekly Review opens, **then** it exposes relevant capability-linked attempts/Evidence/signals, preserves unlinked activity, accepts a reflection, and records no automatic capability completion or progress.

### AC-12 — Results

**Given** capability-linked Evidence and execution activity, **when** Results is viewed, **then** Evidence/learner decisions and supporting activity are distinguishable and no time, session, resource completion, or Today checkmark is presented as capability proof.

### AC-13 — Consistency

**Given** linked and unlinked execution history, **when** Consistency is viewed or filtered by a capability, **then** all relevant history remains accessible and cadence/streak/duration is not labeled as capability progress, mastery, or completion.

### AC-14 — Archived or unavailable capability

**Given** a capability is archived, deleted, or otherwise unavailable, **when** a surviving Today/session/Evidence/signal/review reference is rendered, **then** the app does not crash or recreate the capability, preserves safe historical context where available, and prevents new association to a non-active capability.

### AC-15 — Backup and offline round-trip

**Given** legacy state and state containing capability associations/signals, **when** data is saved, reopened offline, exported, restored, normalized repeatedly, or merged under existing compatibility rules, **then** existing domains and valid associations survive without duplication, inference, or destructive migration.

### AC-16 — Contextual AI remains isolated in this delivery

**Given** Capability-first Compasso is implemented, **when** its flows are used online or offline, **then** they do not require the `context` route, Contextual AI modules, platform detection, an external AI service, or remote processing; existing Contextual AI data remains untouched.

### AC-17 — Future Contextual AI retirement safety

**Given** a future app generation retires the standalone Contextual AI destination, **when** a legacy backup or old `context` route contains evaluations, error/weak-topic entries, generated questions, or source references, **then** user data remains preserved/exportable, surviving records remain accessible, the route recovers safely, and the complete offline shell starts without stale Contextual AI asset failures.

### AC-18 — Notes and Relations contracts

**Given** existing notes, folders, Markdown metadata, wikilinks, source links, or derived graph relations, **when** Capability-first behavior is used or a later standalone destination is removed, **then** note CRUD/access, JSON and Markdown/vault round-trip, wikilink traversal, and relationship derivation remain available through a discoverable contextual path with no silent data deletion.

### AC-19 — Accessible cross-surface behavior

**Given** keyboard use, 360px/mobile presentation, 200% zoom, long capability/signal text, or a missing reference, **when** the new controls and context are used, **then** labels, focus order/return, status meaning, wrapping, touch targets, and overflow satisfy the repository's existing accessibility and responsive contracts.

## 9. Error and recovery scenarios

| Scenario | Required behavior |
| --- | --- |
| Capability is missing after a Today/session/Evidence reference survives | Show unavailable historical context safely; do not crash, infer, or recreate. |
| Capability is archived while referenced | Retain the reference/history; prohibit new selection until reactivated. |
| Resource is missing | Preserve the capability and unavailable resource reference; allow unlinking. |
| Evidence's session is missing | Evidence remains valid under its existing contract; capability context is unavailable rather than fabricated. |
| Signal source is missing | Keep any independently valid learner-authored signal and mark source unavailable; do not delete the capability. |
| Save/quota failure | Preserve the last valid in-memory/persisted state, report failure, and avoid false success. |
| Legacy backup lacks capability context | Restore without fabricated outcomes or links. |
| New backup contains associations unknown to an older surface | Current app preserves them and unrelated data; no destructive downgrade is assumed. |
| Old `context` route is opened after future retirement | Recover to a documented surviving destination with an understandable message. |
| Contextual AI cached asset is absent after future retirement | Forward PWA generation remains complete and starts online/offline without requesting the retired asset. |

## 10. Compatibility invariants

- `learningOutcomes`, active/archived lifecycle, one current next attempt, and shipped session provenance remain valid.
- Existing Study/Reading IDs, progress, status, deletion, and backup behavior remain authoritative for resources.
- Existing Session, Deep Work, Execution Session, and Evidence identities/history remain authoritative.
- Existing Today, Weekly Review, Results, Consistency, weak-topic/error, Active Recall, Notes, and Relations data remains valid.
- JSON backup/restore and state normalization preserve known and compatible unknown data.
- IndexedDB/localStorage and offline/PWA behavior remain local-first; no external content transmission is added.
- Note data, folders, Markdown/vault, wikilinks, source links, and graph derivation remain portable and recoverable.
- No capability association becomes a percentage, score, completion, mastery, demonstrated, confidence, ranking, or streak state.

## 11. Assumptions and dependencies

- The two shipped Learning Loop deliveries remain the starting contract and are not reopened.
- Current source shows that capability resource links and outcome-aware execution already exist and can be extended behaviorally without defining a parallel domain here.
- Current Contextual AI reads existing sources locally, stores `explanationEvaluations` and error/weak-topic records, and may create Active Recall questions; its retrieval index itself is not assumed to be durable without Design verification.
- Current Notes and Relations behavior depends on note/folder data, Markdown/vault metadata, `linkedItemId`, wikilinks, and derived graph infrastructure.
- Design must inspect actual ownership, normalization, backup, rendering, route, cache, and test contracts before choosing any additive representation.

## 12. Validation expectations for Design

Design should allocate proportionate evidence rather than one browser test per sentence:

- focused model/state tests for association normalization, legacy records, missing references, idempotence, merge, and backup round-trip;
- focused browser flows for Hoje, resource-side association, resource-origin session/Evidence, capability summary, Weekly Review, Results, and Consistency;
- explicit no-progress/no-inference regressions;
- local-first save/reload and controlled offline/PWA evidence;
- compatibility tests for Contextual AI data isolation and Notes/Relations/Markdown/vault contracts;
- responsive/accessibility evidence for the new cross-surface controls;
- canonical full repository validation at Ship.

## 13. Decisions resolved

1. The minimum surface behavior is defined in section 5; capability association is optional outside explicit capability-origin execution.
2. Feedback, gaps, weak topics, questions, and insights are behaviorally defined as learner-controlled signals, without mandating separate schemas.
3. Signals never change lifecycle/progress or replace the next attempt automatically; the learner makes the decision.
4. Contextual AI removal is not part of this delivery, but its later data/route/backup/cache/no-external-AI compatibility rule is fixed.
5. Notes retain CRUD/access, search/source linking, JSON and Markdown/vault portability; Relations retain wikilink traversal and derived graph value even after future navigation simplification.

## 14. Remaining Design decisions

These are implementation choices, not missing product requirements:

1. Exact record ownership and representation for Today association, signals, and reflection.
2. Whether existing signal-bearing domains can satisfy all cases or one minimal additive concept is required.
3. Exact UI placement, filtering, density, and navigation between surfaces.
4. Conflict/tombstone rules for any newly persisted association or signal.
5. Exact future fallback destination for a retired `context` route and contextual access points for Notes/Relations.
6. Exact PWA generation/file manifest required by the approved implementation.

## 15. Clarity score

| Dimension | Score | Evidence |
| --- | ---: | --- |
| Problem | 3/3 | Fragmentation after the two shipped foundations is explicit and repository-grounded. |
| Users | 3/3 | Self-directed local-first learner and their cross-surface decisions are explicit. |
| Goals | 3/3 | Eight surface behaviors, signal behavior, next-attempt decision, and compatibility goals are bounded. |
| Success | 3/3 | Nineteen observable acceptance scenarios cover happy paths, boundaries, recovery, and non-regression. |
| Scope | 3/3 | In/out scope, later UX Simplification boundary, no-AI rule, and preserved contracts are explicit. |

**Total:** 15/15.

**Define gate: PASS — Complete (Built).**

## 16. Next skill

Use `$sdd-ship` for **Capability-first Compasso**. Ship must independently verify all 19 acceptance criteria, the closed manifest, `compasso.state.v3`, `learningSignals`, existing Session/Evidence ownership, and the offline/PWA/backup/Markdown/graph/Contextual-AI compatibility contracts.
