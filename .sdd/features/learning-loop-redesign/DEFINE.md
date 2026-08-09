# Learning Loop Redesign — Define

**Slice:** 1 — Actionable Outcome Foundation
**Status:** Complete (Built)
**Initiative:** `learning-loop-redesign`
**Baseline inspected:** `origin/main` at `934d7bad50d3a72d534d14890457e44e34e772ac`
**Source artifact:** `BRAINSTORM.md` (umbrella initiative)

## 1. Definition purpose

This document defines only the first independently shippable slice of the learning-loop redesign: **Actionable Outcome Foundation**. It introduces a new durable, capability-centered learning outcome so a learner can organize learning around what they want to be able to do, rather than primarily around material to consume.

The product principle is:

> Content is a resource. Capability is the objective. Evidence is progress.

Direct evidence integration is deliberately deferred. This slice must still be useful on its own: a user can state a capability, optionally state how success could be recognized, attach supporting material, define the next meaningful attempt, and return to that outcome later.

## 2. Problem and target users

### Problem

Current Readings and Studies represent content, courses, certification, time, and structured practice containers. Goals represent broader direction and inherit completion/activity-oriented progress. Existing `expectedOutcome` text and weekly-plan outcomes are not durable evidence-linked capability units. A user can therefore finish material or log time without a durable answer to what capability they are pursuing or what they should try next.

### Target users

The target user is a Compasso learner who organizes personal learning locally and wants a lightweight, Portuguese-language way to keep a capability objective actionable across sessions. They may use zero, one, or many existing Readings and Studies. They are not assumed to know learning-science terminology or to want to maintain rubrics, levels, tags, or scores.

## 3. Slice value proposition

After this slice, a learner can do all of the following without using a session, Evidence, Review, or Today:

1. State what they want to be able to do.
2. Optionally state how they would recognize success.
3. Identify existing Studies and Readings that may support the capability.
4. Define one next meaningful attempt.
5. Reopen, update, archive, or reactivate the outcome later.

This is valuable independently because it changes the organizing question from “what will I watch/read?” to “what do I want to be able to do, and what will I try next?” without falsely claiming that the capability is complete.

## 4. Goals and measurable success criteria

| Priority | Goal | Measurable success criterion |
| --- | --- | --- |
| P0 | Establish a durable capability-centered unit. | A user can create, persist, reopen, edit, archive/reactivate, and deliberately delete a learning outcome without converting any legacy entity. |
| P0 | Make an outcome actionable without making it pedagogically burdensome. | Creation requires only a non-blank capability statement and one non-blank next attempt; proof and resources remain optional. |
| P0 | Preserve resource semantics. | Studies/Readings can be linked as support only; no outcome operation changes their content, status, or progress. |
| P0 | Preserve local user data and recovery contracts. | Legacy state/backups load with zero fabricated outcomes; new JSON backups round-trip valid outcome data; reload/offline reopen preserves it. |
| P0 | Avoid fabricated capability progress. | The Slice-1 surface and model expose no percentage, mastery, confidence, completion, evidence count, or derived capability-progress value. |
| P1 | Fit the current information architecture and responsive contract. | Outcomes are reachable as a Frentes peer subview without adding a sixth primary area or horizontal overflow at 360px. |

## 5. Scope

### In scope

- A new additive durable learning-outcome domain/collection.
- Required capability statement.
- One optional proof criterion.
- Typed, stable references to existing Studies and Readings as supporting resources.
- Exactly one embedded lightweight next attempt per outcome.
- Active and archived lifecycle, with reactivation.
- Destructive outcome deletion using the repository’s explicit-confirmation convention.
- Neutral peer subview under Frentes.
- Deterministic active/archived listing, empty state, creation/editing, persistence, JSON backup/restore, offline/reopen, responsive, and accessibility behavior.

### Explicitly out of scope

- Evidence links, evidence counts, demonstrated status, feedback, gaps, or capability completion.
- Outcome-aware sessions, starting a session from an outcome, or linking session completion to an attempt.
- Standalone attempts, attempt history/results, `completedAt`, or generic Today/daily-action semantics.
- PACER, retrieval-intent routing, GRINDE, RAIL, Active Recall redesign, or automatic spaced repetition.
- Any Notes/Relations removal, relocation, migration, or new Notes dependency.
- Weekly Review, Results, Consistency, Today, daily plans, or Goal redesign/integration.
- Percentage progress, mastery, confidence, scoring, gamification, badges, streaks, or inferred competence.
- AI validation, semantic policing, backend/API/account/sync redesign, navigation redesign, Markdown-vault export change, or legacy entity conversion.

## 6. Required semantic data contract

This section specifies durable semantics, not a final JavaScript object shape, IndexedDB schema number, module name, route identifier, or UI copy.

### Required semantic fields

| Semantic field | Requirement |
| --- | --- |
| Stable outcome identity | Each outcome has a stable unique identity for persistence, resource references, merge/import, and future association. |
| Capability statement | Required user-authored text describing a capability or observable ability. Meaningful user text is retained for reuse; whitespace-only input is invalid. |
| Proof criterion | One optional user-authored text criterion. Its absence is valid. |
| Supporting resource references | Zero or more typed references to existing Study or Reading identities. Each reference denotes support only. |
| Next attempt | Exactly one embedded lightweight attempt with stable nested identity and user-authored text. It is required for a valid Slice-1 outcome. |
| Lifecycle state | `active` or `archived`; a newly created outcome is active. |
| Timestamps | Creation and update timestamps consistent with current collection/merge conventions; archive timestamp when archived if the current pattern requires it. |

### Deferred fields

The Slice-1 contract must not add or derive any of the following:

- Evidence IDs, counters, evidence types, or evidence completion.
- Attempt history, attempt result, feedback, gap, session ID, Today ID, or `completedAt`.
- Progress, mastery, confidence, score, level, rank, streak, or capability percentage.
- PACER type, retrieval intent, review schedule, RAIL state, skill type, difficulty, category, tag, or rubric.

## 7. Business rules

1. A learning outcome is semantically distinct from a Study, Reading, Goal, weekly-plan outcome, and `expectedOutcome` field.
2. Existing user objects are never converted into learning outcomes. Creating, editing, archiving, or deleting an outcome must not mutate an existing Study, Reading, Goal, Note, relation, Evidence, session, Journal item, weekly plan, daily plan, or existing progress calculation.
3. The capability statement and next attempt are required for a valid created or edited outcome. Proof criterion and supporting resources are optional.
4. Input guidance may encourage observable capability and active practice, but must not reject language as insufficiently pedagogical or invoke AI/automatic semantic validation. For example, “Assistir aula 3” may be guided away from as an attempt but is not blocked.
5. One outcome has no more than one proof criterion and exactly one current embedded next attempt. Replacing the attempt changes the current embedded attempt; it must not create a Slice-1 history or completion record.
6. Resource links are typed stable references to Study/Reading identity. They are many-to-many, referential only, and unique within an outcome by type plus identity.
7. Resource completion, resource progress, number of resources, next-attempt presence, session count, days active, or streaks must never derive or display capability progress.
8. An unavailable linked resource does not invalidate, delete, archive, or hide the outcome. The outcome remains usable, identifies the reference as unavailable in a recoverable way, and permits unlinking it.
9. Active and archived are the only Slice-1 lifecycle states. Archive preserves all outcome data and never affects linked resources. Archived outcomes can be reactivated.
10. A completed, learned, mastered, or demonstrated lifecycle state is prohibited in Slice 1.
11. Delete is a separate destructive action. It requires explicit user confirmation, affects only the outcome, never cascades to linked resources or other domains, and follows the current collection/synchronization deletion convention when applicable.
12. Frentes is a navigation container, not a shared domain type. A learning-outcome subview is a peer of Reading, Study, and Goal, and must not inherit their progress semantics.
13. Outcome order is deterministic: active outcomes are shown by most recently updated first; archived outcomes are discoverable separately and must not dominate the default active list. No drag-and-drop/manual ordering is introduced.
14. The outcome user-facing label may be selected during Design/copy work. The domain term “learning outcome” is not required product terminology.
15. The product remains local-first and fully usable for Slice-1 core operations without a network connection, account, backend, API, or AI.

## 8. Numbered requirements

### REQ-01 — Additive learning-outcome domain

The product shall provide a durable, additive learning-outcome domain that is independent from existing Studies, Readings, Goals, Notes, weekly outcomes, and generic `expectedOutcome` fields.

### REQ-02 — Capability statement

The product shall require a non-blank capability statement to create or save an outcome. It shall support editing and preserve user-authored content sufficiently for meaningful reuse, including reasonable long text. It shall not impose automatic semantic or AI validation.

### REQ-03 — Optional proof criterion

The product shall support zero or one lightweight proof criterion per outcome. A user may omit it at creation, add it later, edit it, or remove it without changing the capability, attempt, resources, lifecycle, or other domains.

### REQ-04 — Supporting Study/Reading references

The product shall allow an outcome to hold zero, one, or multiple supporting references to existing Studies and Readings. References shall use the target records’ stable identities conceptually, must be unique per resource type/identity within an outcome, and must not copy resource content into the outcome.

### REQ-05 — Referential resource semantics

The product shall treat a resource link as “outcome uses resource,” not as outcome progress input. Linking or unlinking must not mutate the referenced resource, and the same resource may support multiple outcomes.

### REQ-06 — Missing-resource resilience

The product shall preserve and render an outcome safely when a previously linked Study or Reading is no longer available. The capability, proof criterion, and next attempt remain accessible; the unavailable reference can be removed; no missing resource is recreated automatically.

### REQ-07 — Required embedded next attempt

The product shall require exactly one current, embedded next attempt for a valid Slice-1 outcome. The attempt shall describe what the learner will try next to practice or demonstrate the capability. It shall be creatable, editable, replaceable, removable only while replaced by another valid attempt, and durable across reload/restore.

### REQ-08 — Attempt boundary

The next attempt shall not be a generic Today/daily-plan task, standalone Attempt entity, session, evidence, result, or completion lifecycle. Slice 1 shall not provide attempt completion, `completedAt`, session linkage, evidence linkage, attempt history, or progress derivation.

### REQ-09 — Active/archive lifecycle

New outcomes shall be active. A user shall be able to archive an active outcome and reactivate an archived one. Both transitions preserve capability, optional proof, resource references, next attempt, identity, and applicable timestamps.

### REQ-10 — Safe outcome deletion

The product shall offer destructive deletion separately from archive only through an explicit user action and confirmation consistent with current item deletion UX. Deletion shall affect only the selected outcome and preserve all linked/unrelated records. If the collection participates in existing sync/merge behavior, deletion must honor that collection’s compatible deletion/tombstone contract.

### REQ-11 — Frentes peer placement

The product shall make outcomes discoverable through a neutral learning-outcome subview in Frentes. It shall retain exactly the existing five primary application areas and preserve existing Reading, Study, and Goal ordering/behavior except for the minimal peer-view addition.

### REQ-12 — Minimal list and detail behavior

The default surface shall show active outcomes in deterministic most-recently-updated-first order. Capability is primary, proof is secondary when present, resources are secondary context, and next attempt is visibly actionable. Archived outcomes are discoverable without replacing the default active list. No capability progress visual, score, badge, or gamification element may be displayed.

### REQ-13 — Empty and no-resource states

When no outcomes exist, the subview shall offer a recoverable empty state centered on the question equivalent to “O que você quer conseguir fazer?”. When no Studies or Readings are available, outcome creation/editing remains possible and explains that resources can be added later.

### REQ-14 — Low-friction creation and editing

The creation/editing flow shall present capability first, optional proof second, optional supporting resources third, and required next attempt fourth, using progressive disclosure as appropriate. It shall not require pedagogical metadata, tags, categories, confidence, mastery, difficulty, review scheduling, evidence type, or skill classification. Cancel and validation-error paths must not silently lose already-entered draft input.

### REQ-15 — Domain isolation

Outcome operations shall be referential and isolated. They must not create, remove, alter, re-order, or recalculate existing Studies, Readings, Goals, Notes, Relations, Evidence, sessions, Journal, weekly plans, daily plans, Today recommendations, or existing resource/Goal progress.

### REQ-16 — No fabricated capability progress

The Slice-1 model and UI shall not calculate, store, or display a numeric capability-progress value or equivalent inference from resource completion, linked-resource count, next attempt, time, sessions, active days, or streaks.

### REQ-17 — Goal, Evidence, session, and Today boundaries

The product shall not require Goal links or alter Goal semantics. It shall not add evidence fields, evidence counters, outcome-aware execution, session starts, daily-plan items, or Today behavior. The embedded attempt must remain owned by its outcome and only be displayed, not executed/completed, in Slice 1.

### REQ-18 — Additive persistence contract

The product shall persist outcomes as a new versioned/additive collection under the existing local-first state contract. Existing user data loads normally; a missing outcome collection initializes safely; IndexedDB remains primary; and current bounded localStorage mirror/fallback behavior remains applicable without bypassing `CompassoStorage`.

### REQ-19 — Idempotent migration and merge

The product shall introduce explicit, idempotent state normalization/migration for the collection. Repeated initialization, migration, merge, or restore must not duplicate outcomes, resource links, or nested attempts, and must preserve unrelated legacy fields. Merge/conflict handling shall use the existing collection identity/timestamp conventions, with a defined deterministic rule for the embedded attempt.

### REQ-20 — JSON backup and restore

The product shall include outcomes in the existing full-state JSON backup contract. A new backup shall preserve valid outcome capability, proof, references, next attempt, lifecycle, identity, and timestamps. A legacy backup without outcomes shall restore successfully without fabricating outcomes. Markdown-vault import/export remains unchanged in this slice.

### REQ-21 — Restore compatibility and recovery

The current app shall restore both legacy backups and backups that contain valid Slice-1 outcomes. Malformed outcome entries shall be handled through the existing normalization/recovery conventions so that one malformed entry does not unnecessarily destroy unrelated valid restored data. Older released app versions are not required to understand newer outcome backups; Design must define safe current-version messaging/recovery rather than claim backward feature support.

### REQ-22 — Offline and reopen behavior

Create, read, edit, link/unlink, set/replace a next attempt, archive/reactivate, delete, reload/reopen, and currently supported local backup operations shall work without network access. Refresh/reopen shall retain successfully persisted outcomes.

### REQ-23 — Accessibility

The outcome experience shall meet current Compasso design-system contracts: semantic controls, meaningful labels, keyboard activation and order, visible focus, associated validation errors, dialog focus/cancel/Escape/focus-return behavior where dialogs are used, non-color-only lifecycle indication, reduced-motion compatibility where motion exists, and coarse-pointer targets of at least 44px.

### REQ-24 — Responsive behavior

At the current 360px, 768px, and 1280px responsive contracts, the experience shall retain CRUD access. Long capability, proof, and attempt text must wrap/read without global horizontal overflow; resource links and active/archive controls remain operable; and forms/dialogs fit the mobile viewport and remain usable at 200% zoom.

### REQ-25 — Failure and recovery behavior

The product shall provide recovery-oriented feedback for required-field validation, unavailable linked resources, no available resources, persistence write failure, legacy restore, malformed outcome input/restore data, and cancelled destructive deletion. A failed persistence write must not falsely report that data was durably saved and must preserve the last valid in-memory/user-entered state to the extent supported by the current storage fallback contract.

### REQ-26 — Verification evidence

Implementation shall produce focused evidence using the existing Node and Playwright infrastructure for data contract, migration/idempotence, backup/restore, CRUD, Frentes routing, missing resources, reload/offline behavior, responsive layout, dialogs/keyboard/focus, and regression boundaries. It shall use repository-supported commands from `package.json` only.

## 9. Numbered acceptance criteria

| ID | Requirement(s) | Acceptance criterion | Evidence class |
| --- | --- | --- | --- |
| AC-01 | REQ-01 | A new outcome can exist without converting, changing, or requiring a Study, Reading, Goal, weekly outcome, or `expectedOutcome`. | Node model/state + browser flow |
| AC-02 | REQ-02 | Saving with an empty or whitespace-only capability is rejected with an associated error and does not create/update an outcome. | Browser validation flow |
| AC-03 | REQ-02 | A non-empty capability can be created and later edited; its meaningful user text survives reload and JSON round-trip. | Browser + backup/reload |
| AC-04 | REQ-02 | A reasonable long capability remains readable and operable at the supported responsive sizes without truncating its stored value. | Browser responsive flow |
| AC-05 | REQ-03 | An outcome saves without a proof criterion. | Browser CRUD flow |
| AC-06 | REQ-03 | A user can add, edit, and remove the sole proof criterion after creation without changing capability, resources, attempt, or lifecycle. | Browser CRUD + state assertion |
| AC-07 | REQ-03 | The model/UI permits no second simultaneous proof criterion and exposes no score/rating/mastery for it. | Node contract + browser inspection |
| AC-08 | REQ-04 | A user can save an outcome with zero resources, multiple Studies, multiple Readings, or both types. | Browser CRUD flow |
| AC-09 | REQ-04 | Adding the same resource type/identity twice to one outcome results in one reference only. | Node contract + browser flow |
| AC-10 | REQ-04, REQ-05 | One Study/Reading can support two outcomes, and adding/removing either link does not modify the linked resource object. | Node isolation + browser flow |
| AC-11 | REQ-05, REQ-16 | Resource completion/progress changes do not create or alter an outcome progress/mastery value or visual. | Node isolation + browser regression |
| AC-12 | REQ-06 | If a linked resource is unavailable, the outcome still renders its capability, proof, and attempt; the unavailable link can be removed; no crash or automatic resource recreation occurs. | Browser error-state flow |
| AC-13 | REQ-07 | A new outcome cannot save without a non-blank next attempt, and the error preserves entered capability/proof/resource draft data. | Browser validation flow |
| AC-14 | REQ-07 | A user can edit or replace the current next attempt; reload and JSON round-trip preserve exactly one current attempt. | Browser + Node/backup |
| AC-15 | REQ-08 | The attempt has no complete control, `completedAt`, session link, evidence link, result/history list, or Today/daily-plan item created by the outcome flow. | Node contract + browser regression |
| AC-16 | REQ-09 | Newly created outcomes are active; archive and reactivate preserve all Slice-1 fields and do not affect linked resources. | Browser lifecycle flow |
| AC-17 | REQ-10 | Delete requires explicit confirmation; cancelling leaves the outcome unchanged; confirming removes only the selected outcome and preserves all linked/unrelated data. | Browser destructive-flow + state assertion |
| AC-18 | REQ-11 | Outcomes are reachable from Frentes as a peer view, and the primary navigation remains exactly Hoje, Frentes, Journal, Revisão, and Mais. | IA model + browser navigation |
| AC-19 | REQ-11, REQ-15 | Existing Reading, Study, and Goal view ordering/behavior and their progress calculations are unchanged by outcome operations. | Regression Node/browser |
| AC-20 | REQ-12 | Active outcomes are default-visible in deterministic most-recently-updated-first order; archived outcomes are discoverable without dominating the list. | Browser list flow |
| AC-21 | REQ-12, REQ-16 | Each list/detail outcome prioritizes capability and makes the next attempt visible while presenting no percent/progress bar, mastery, confidence badge, gamification, or resource-derived capability inference. | Browser visual/semantic inspection |
| AC-22 | REQ-13 | The no-outcome empty state asks the capability-oriented question, and no-resource creation permits saving with resources omitted. | Browser empty-state flow |
| AC-23 | REQ-14 | Creation/editing exposes only the required capability and next attempt plus optional proof/resources; it requires none of the explicitly out-of-scope pedagogical metadata. | Browser form contract |
| AC-24 | REQ-14, REQ-23 | Keyboard users can create, correct validation, cancel, and return focus predictably; dialog behavior follows the existing design-system contract when a dialog is used. | Playwright keyboard/focus flow |
| AC-25 | REQ-15, REQ-17 | A complete sequence of outcome CRUD/link/lifecycle actions leaves Goals, Evidence, sessions, Journal, weekly plans, daily plans, Today, Notes, Relations, and legacy progress values unchanged. | Node isolation + browser regression |
| AC-26 | REQ-18 | Legacy persisted state lacking the collection loads with an empty outcome collection and preserves unrelated legacy content. | Node migration test |
| AC-27 | REQ-18, REQ-22 | Successful outcome writes use the current local-first storage path and survive reload/reopen; the current mirror/fallback behavior is not bypassed. | Storage contract + browser reload |
| AC-28 | REQ-19 | Running normalization/migration twice produces no duplicate outcomes, resource links, or embedded attempts and preserves unknown legacy fields. | Node idempotence test |
| AC-29 | REQ-19 | Merge/import of different valid outcome records follows collection identity/timestamp rules; the selected embedded-attempt conflict behavior is deterministic and test-covered. | Node merge test |
| AC-30 | REQ-20 | Exported JSON contains valid outcomes; importing it into the current app preserves their Slice-1 fields and valid resource references. | Browser backup round-trip |
| AC-31 | REQ-20, REQ-21 | A legacy backup without outcomes restores successfully with no fabricated outcomes and no Markdown-vault behavior change. | Browser/Node restore regression |
| AC-32 | REQ-21 | A malformed outcome entry is rejected/normalized according to the shared recovery contract without unnecessarily discarding unrelated valid restored data. | Node malformed-state test |
| AC-33 | REQ-22 | Core Slice-1 CRUD, lifecycle, and local backup operations remain usable after offline startup/reopen using the existing PWA contract. | Browser offline/reopen evidence |
| AC-34 | REQ-23 | Controls have accessible names, visible focus, keyboard operation, associated errors, non-color-only lifecycle meaning, and at least 44px coarse-pointer targets. | Playwright/design-system evidence |
| AC-35 | REQ-24 | At 360px, 768px, 1280px, and 200% zoom, long text wraps and no global horizontal overflow is introduced; all CRUD/resource/lifecycle controls remain reachable. | Playwright responsive/snapshot evidence |
| AC-36 | REQ-25 | Persistence failure communicates unsaved/recovery state rather than a false durable-save success, retaining the last valid data as supported by current storage behavior. | Storage failure test |

## 10. Scenario matrix

| Scenario | Expected result | Persistence effect | Related data effect | Evidence |
| --- | --- | --- | --- | --- |
| Create minimal outcome | Valid capability plus next attempt creates an active outcome with no proof/resources. | New outcome persists locally. | No legacy domain changes. | Browser CRUD + reload |
| Create full Slice-1 outcome | Capability, proof, Study/Reading links, and next attempt create one active outcome. | All valid Slice-1 fields persist. | Resources remain unchanged. | Browser CRUD + JSON round-trip |
| Edit capability | Valid edited capability replaces prior text. | `updatedAt`/equivalent updates once. | No linked data changes. | Browser edit + state test |
| Add/remove proof criterion | Optional proof can be added, changed, and removed. | Outcome persists the one criterion or absence. | No other field/domain changes. | Browser CRUD |
| Link Study | A Study reference is added once. | Typed stable reference persists. | Study content/progress/status unchanged. | Node isolation + browser |
| Link Reading | A Reading reference is added once. | Typed stable reference persists. | Reading content/progress/status unchanged. | Node isolation + browser |
| Remove resource link | Selected reference is removed. | Outcome persists without that reference. | Referenced resource remains intact. | Browser CRUD |
| Linked resource missing | Outcome renders with an unavailable reference and remove option. | Outcome remains stored; no recreation. | No cascade/delete. | Browser resilience |
| Set/replace/remove next attempt | Required attempt is set or replaced; removal is only valid when replaced by another valid attempt. | One current embedded attempt persists. | No task/session/evidence/history record. | Browser validation + reload |
| Archive | Active outcome becomes archived. | Lifecycle/timestamp persist. | Resources untouched. | Browser lifecycle |
| Reactivate | Archived outcome becomes active. | Lifecycle/timestamp persist. | Resources untouched. | Browser lifecycle |
| Delete/cancel delete | Cancel changes nothing; confirm deletes only outcome. | Confirm follows current deletion/merge contract. | Resources and all unrelated data untouched. | Browser destructive-flow |
| Reload | Current active/archive/list state and fields return. | No duplicate initialization. | No unrelated change. | Browser reload + Node idempotence |
| Offline reopen | Core outcome operations work after offline reopen. | Current local-first store is used. | No network/account dependency. | Browser offline evidence |
| Old backup restore | Backup lacking outcomes loads normally. | Empty outcome collection initializes. | Existing backup data preserved. | Restore regression |
| New backup round-trip | Backup with outcomes restores all valid Slice-1 fields. | Valid outcomes retained once. | Valid resource refs survive; missing ones degrade safely. | Browser export/import |
| Persistence write failure | User receives recovery-oriented unsaved failure state. | No false persisted-success claim. | Last valid data remains per storage fallback. | Storage failure test |

## 11. Persistence, migration, and compatibility contract

### Current architecture evidence

- `storage.js` stores the serialized full app state in the `compasso-db` IndexedDB `appState` record; IndexedDB database version is currently 1. It also maintains a bounded localStorage compatibility mirror/fallback.
- `app-manifest.js` owns the state collection catalog and PWA/module composition. Catalogued arrays participate in timestamp/identity merge behavior.
- `state-foundation.js` performs catalog-based normalization, merge, tombstones, conflict preservation, and currently writes a state schema version 2.
- `index.html` owns legacy initial state and JSON backup/export/import entry points.

### Required direction

The implementation must add an additive collection to the shared state/collection contract and introduce explicit versioned, idempotent normalization/migration. The collection must use existing identity/timestamp/merge practices and preserve unknown legacy content. Because the primary persistence is a serialized state record, this Define does **not** require a new IndexedDB object store or prescribe an IndexedDB database version. Design must verify whether a storage database upgrade is unnecessary and avoid one unless a concrete need emerges.

### Backup direction

JSON full-state export/import is the Slice-1 portability contract. New backups include outcomes; legacy backups restore with an empty initialized collection. Current-version restore of a new backup is required. Backward feature compatibility with older released app binaries is not required or claimed. Markdown-vault compatibility is preserved by leaving that format untouched.

### Resource deletion direction

If a linked Study/Reading is later unavailable, retain the outcome and reference context as unavailable. Do not recreate the resource, mutate the outcome’s other fields, or cascade-delete it. The user can remove that unavailable link.

## 12. Information architecture, accessibility, and responsive contract

The learning-outcome subview belongs under Frentes as a neutral peer navigation view. Current fixed primary areas remain exactly Hoje, Frentes, Journal, Revisão, and Mais. The peer placement is not a type relationship with Reading, Study, or Goal.

Existing design-system evidence establishes 360px, 768px, and 1280px responsive checks, 44px mobile targets, dialog focus behavior, visible focus, keyboard support, reduced-motion treatment, and no global horizontal overflow. Design must reuse these standards and repository primitives rather than introduce a separate UI framework or runtime styles.

## 13. Evidence and test model

| Requirement area | Existing evidence class to reuse | Expected verification |
| --- | --- | --- |
| Catalog, migration, merge, tombstones | Node tests such as `state-foundation.test.js` and manifest contracts | New collection defaults, repeated migration, merge, deletion compatibility |
| Storage/recovery | `storage-quota.test.js`, bootstrap recovery patterns | IndexedDB primary/mirror/fallback and write-failure recovery |
| Navigation | `information-architecture-model.test.js`, IA browser flows | Five primary areas retained; Frentes peer route/discovery |
| CRUD and backup | Browser critical/foundation flows | Create/edit/archive/delete, JSON export/import, reload |
| Missing resources and isolation | Focused Node model/state and browser flows | No crash/cascade; resources/unrelated domains unchanged |
| Accessibility/responsiveness | `design-system-model.test.js`, `design-system-flows.spec.js` | Focus, dialog, keyboard, 360/768/1280 snapshots, no overflow |
| Offline/PWA | Existing browser fixture and Service Worker composition/offline contracts | Offline startup/reopen and manifest asset composition as implementation risk requires |

Repository-supported commands are `npm test`, `npm run build:test`, `npm run test:browser`, and `npm run test:all`. This Define authorizes no test changes or test execution; Design must select a proportional implementation verification plan.

## 14. Dependencies and assumptions

### Dependencies

- Existing Frentes information-architecture model/hub and fixed five-area primary navigation.
- Existing `app-manifest.js`, `state-foundation.js`, `storage.js`, `index.html`, feature runtime, and service-worker composition contracts.
- Existing Studies/Readings stable IDs and local JSON backup/export/import behavior.
- Existing design system and browser-test fixture.

### Assumptions

1. Stable Study/Reading IDs continue to identify link targets.
2. A current embedded attempt can carry its own stable identity and timestamps without becoming a standalone Slice-1 collection.
3. Current generic item deletion’s explicit confirmation is the appropriate destructive-action convention; archive is the preferred reversible lifecycle action.
4. New outcome data can be represented in the serialized app state without creating a distinct IndexedDB object store; Design will validate this against final composition needs.
5. The actual pt-BR user-facing label can be chosen in Design without altering the outcome semantics or Frentes placement.

## 15. Risks and mitigations

| Risk | Mitigation requirement |
| --- | --- |
| Users treat supporting material completion as capability proof. | Capability/attempt remain primary; no resource-derived progress or completion display. |
| Required attempt makes creation feel too heavy. | Keep only capability and attempt required; proof/resources optional, progressive, and no pedagogical metadata. |
| Embedded attempt becomes difficult to evolve. | Require stable nested identity/timestamps and explicit future migration compatibility. |
| Broken resource references crash or erase context. | Preserve outcome; render unavailable reference; allow unlink; no cascade. |
| Collection change loses or duplicates user data. | Explicit catalog/normalization/merge/backup/idempotence requirements and focused evidence. |
| New view becomes a sixth primary destination or subtype of a resource. | Peer Frentes contract and IA regression criteria. |
| Capability UI invents confidence/mastery. | Explicit prohibited fields, calculations, states, and visuals. |
| New UI regresses mobile/focus behavior. | Existing design-system responsive/accessibility test classes are required evidence. |

## 16. Open decisions for Design

No user decision blocks this Define. The following are Design/copy decisions bounded by the requirements above:

1. Exact pt-BR label, description, icon, route identifier, and visual copy for the Frentes peer.
2. Exact final field names, storage representation, maximum lengths if existing conventions justify them, and nested attempt merge rule.
3. Exact unavailable-resource copy and whether the UI offers a repair affordance in addition to unlink.
4. Exact archive discoverability control and UI composition, provided active is default and archived is reachable.
5. Exact dialog/drawer/inline form composition, provided the existing accessibility contract is met.
6. Exact deletion implementation mechanics/tombstone invocation consistent with the existing collection/sync contract.
7. Exact user-facing messaging for restoring a newer backup in a current versus older app version.

## 17. Clarity score

| Dimension | Score (0–3) | Explicit evidence |
| --- | --- | --- |
| Problem | 3 | Brainstorm and this request identify resource/activity-centered learning as the problem and durable capability objective as the target. |
| Users | 3 | A local-first Compasso learner, their low-friction needs, and pt-BR context are explicitly described. |
| Goals | 3 | Durable outcome, capability/action framing, resource semantics, preservation, and no fabricated progress are explicit. |
| Success | 3 | The five user abilities, 26 requirements, 36 binary/testable ACs, and scenario matrix define observable success. |
| Scope | 3 | Slice-1 inclusions, broad redesign exclusions, lifecycle, attempt, evidence/session/Today boundaries, and compatibility constraints are explicit. |

**Total: 15/15 — PASS — Ready for Design.**

## 18. Phase handoff

This defines the first slice only. It does not authorize implementation or create a technical design. The next valid SDD skill is `$sdd-design`, using this DEFINE and the existing umbrella Brainstorm as input.

The umbrella `BRAINSTORM.md` is intentionally not edited here because the requested mutation scope permits only `DEFINE.md`; it remains the record for later slices. This DEFINE is the completed requirements record for Slice 1.

## 19. Build completion metadata

On 2026-08-08, Design Revision 2 and the completed Build evidence satisfied all 36 acceptance criteria. Canonical `npm run test:all` passed with 161/161 Node tests and 114 browser tests passed; 18 browser cases were intentionally skipped by project/platform applicability and no test failed. This status update changes no requirement, scope, acceptance criterion, or product decision. The next valid SDD skill is `$sdd-ship`.
