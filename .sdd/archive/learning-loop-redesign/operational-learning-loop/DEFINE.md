# Learning Loop Redesign — Define

**Delivery:** 2 — Operational Learning Loop
**Status:** Shipped — Operational Learning Loop
**Initiative:** `learning-loop-redesign`
**Baseline inspected:** `origin/main` at `7b1196c819fe2375346ceb803143125f8fd4c25c`
**Prior delivery:** [Slice 1 archive](../../archive/learning-loop-redesign/SHIPPED.md) — `Actionable Outcome Foundation`, shipped and unchanged
**Brainstorm relationship:** The archived umbrella Brainstorm’s Slice-2/3 direction is narrowed here into one independently useful operational delivery. No new Brainstorm is required because the capability model, problem, user, constraints, and delivery direction are already explicit and shipped.

## 1. Definition purpose

Define the next useful learning-loop delivery: a learner can begin real learning execution from an active capability’s current next attempt, retain that origin through the existing Session and Evidence domains, and return to the capability with concise execution context.

This delivery connects the shipped capability foundation to existing execution. It does not redefine capability lifecycle or infer competence from activity.

## 2. Current evidence and gap

Slice 1 provides durable `learningOutcomes`, an active/archive lifecycle, an embedded current `nextAttempt` with stable identity, optional proof, and optional Study/Reading support references. It deliberately deferred session and evidence association.

The current application already has local-first `sessions`, `deepWorkSessions`, canonical `executionSessions`, and `evidence` collections. Existing session/evidence records are resource-oriented: sessions use `domain` and `itemId`; Evidence stores `sessionId`, `domain`, and `itemId`, and its current normalized domain set is Study/Reading. The current execution flow also assumes a resource metric when beginning and finishing an ordinary session.

Therefore reuse is the required direction, but an outcome-origin execution context is needed. The product must not create a parallel session or evidence system, nor reinterpret resource progress as capability progress.

## 3. Target outcome

For an active capability, the learner can choose its current attempt and start a compatible existing execution flow. The resulting session keeps a stable reference to the originating outcome and attempt. Evidence captured for that session is associated with the same outcome context. Returning to the capability shows what was attempted and the relevant evidence, while the learner remains responsible for choosing or editing the next attempt.

> Content is a resource. Capability is the objective. Evidence is contextual evidence, not an automatic score.

## 4. In scope

- Start existing learning execution from an active capability/current attempt.
- Preserve stable outcome and attempt origin context on the execution record.
- Associate session-created evidence with that same outcome context.
- Show minimal, readable execution/evidence context when returning to a capability.
- Preserve Study/Reading session behavior and resource progress exactly where it already applies.
- Preserve local-first persistence, JSON backup/restore, state normalization/merge, offline reopen, and legacy data.

## 5. Out of scope

- A standalone attempt collection or broad attempt-history product.
- Feedback/gap workflow beyond the minimal session reflection/evidence already required to close existing execution.
- Capability completion, mastery, demonstrated lifecycle, confidence, score, percentage, streak, or automatic next-attempt replacement.
- Today/daily-plan integration, Notes/Relations retirement, Weekly Review or Results/Consistency redesign.
- Active Recall redesign, PACER, GRINDE, RAIL, AI, account, backend, cloud, or sync redesign.
- Converting or migrating Studies, Readings, Goals, legacy sessions, or legacy evidence into outcomes.

## 6. Requirements

### REQ-01 — Active capability execution entry

An active capability with a valid current next attempt shall offer a clear execution entry that starts the existing learning-execution experience in that outcome/attempt context. An archived capability shall not start new execution until reactivated.

### REQ-02 — Stable session origin

An outcome-started session shall retain a stable reference to the originating learning-outcome ID and current-attempt ID, plus enough start-time human-readable context to explain what was attempted after later edits. This context is execution provenance, not attempt completion or attempt history.

### REQ-03 — Reuse, not parallel execution

Outcome execution shall use the existing Session/Deep Work/Execution Session lifecycle, one-active-execution guard, timer recovery, pause/finish/cancel behavior, and local persistence. No parallel outcome-session collection, timer, or completion lifecycle shall be introduced.

### REQ-04 — Existing resource sessions remain compatible

Existing Study- and Reading-backed session starts, history, progress updates, evidence, correction, deletion, and backup behavior shall continue unchanged. Starting from a capability must not require converting its supporting resources or alter their ownership.

### REQ-05 — Resource-neutral capability execution

An active capability remains executable even when it has no linked Study/Reading, or when a retained support reference is unavailable. Design may offer compatible resource context where present, but resource availability shall not erase the capability, attempt, or prior execution context.

### REQ-06 — Evidence association

Evidence created through an outcome-originated session shall be associated with the same stable outcome/attempt context. Existing Evidence identity, type, text, session association, editing, deletion/tombstone, and resource evidence behavior shall remain intact.

### REQ-07 — Return context

After an outcome-originated execution is completed or otherwise recorded, returning to the capability shall show concise, safe context for the relevant attempt and associated session/evidence. Missing or deleted linked resources must render as unavailable rather than crash, recreate data, or remove historical execution/evidence.

### REQ-08 — Learner-controlled next action

Execution or evidence shall not automatically mark an attempt complete, replace the current attempt, archive the capability, or change its lifecycle. The learner remains able to edit the current next attempt using the existing capability rules.

### REQ-09 — No fabricated capability progress

Session duration, resource completion, Study/Reading progress, evidence count/type, or the presence of execution context shall not calculate, display, or store capability percentage, mastery, confidence, demonstrated state, completion, score, or streak.

### REQ-10 — Additive compatibility contract

Existing state and backups lacking outcome execution context shall normalize safely and idempotently with no fabricated links. Existing sessions/evidence remain valid. Current backups shall round-trip outcome-origin context without changing unrelated legacy domains. No new IndexedDB object store, storage rewrite, or legacy-entity conversion is permitted.

### REQ-11 — Offline/local-first behavior

Once the PWA shell is available, outcome-originated session start, finish, evidence association, reload/reopen, and return-to-capability context shall remain local-first and require no account, API, backend, remote processing, telemetry, or AI.

### REQ-12 — Accessible, bounded UX

The new entry and return context shall be keyboard-operable, labeled, focus-safe, readable at supported mobile widths, and distinguish unavailable context without relying only on color. It shall add only the controls needed to execute or understand the current attempt.

## 7. Business rules and data boundary

1. Capability lifecycle remains exactly `active` / `archived`.
2. The outcome remains the owner of capability wording and current next attempt; a session and evidence record execution provenance only.
3. A stable attempt ID refers to the attempt that originated the execution. It is not a result, completion marker, or standalone attempt record.
4. Existing resource progress may continue to change according to the pre-existing Study/Reading session contract. That change must never propagate into capability progress or lifecycle.
5. Deleting an outcome, session, evidence, Study, or Reading must preserve the other existing domains according to their current deletion contracts. A stale outcome/resource reference is displayed safely; it is not silently recreated.
6. Existing evidence remains resource/session-compatible. New outcome association is additive and must not make a legacy evidence record invalid.

## 8. Expected schema impact and migration expectation

**Affected concept:** an additive outcome-execution context containing stable learning-outcome ID, current-attempt ID, and a start-time attempt/context snapshot.

**Affected records:** existing session projections (`sessions`, `deepWorkSessions`, and canonical `executionSessions`) and session-created `evidence` where the evidence must retain or resolve the same outcome context.

**Compatibility requirement:** legacy records without this context remain valid and behaviorally unchanged; existing Study/Reading `domain`/`itemId` semantics must continue to work. The new context must not overload resource completion/progress fields or change Evidence identity/tombstone behavior.

**Migration expectation:** additive logical-state normalization only, idempotent on repeated load/merge/restore. Missing context is treated as unlinked, not inferred. No IndexedDB schema/object-store change and no conversion of legacy resources, sessions, or evidence is expected.

The exact field names, whether Evidence persists a copied context or resolves it through its session, and the safe representation of an outcome-only execution remain Design decisions. They must satisfy all requirements above without adding a parallel domain.

## 9. Acceptance criteria

| AC | Given / When / Then | Evidence class |
|---|---|---|
| AC-01 | Given an active valid capability, when the learner chooses its current attempt to execute, then an existing session flow starts with that outcome/attempt as origin. | Focused browser flow |
| AC-02 | Given an outcome-originated session, when it is persisted/reloaded, then its stable outcome ID, attempt ID, and start-time context remain available. | Focused model/state test + browser reload |
| AC-03 | Given an archived capability, when viewed, then no new execution can start until it is reactivated. | Focused browser flow |
| AC-04 | Given existing Study/Reading sessions, when they are started, finished, edited, or deleted, then their current resource behavior remains unchanged. | Existing-session regression gate |
| AC-05 | Given an active capability with no resource or an unavailable support reference, when execution context is opened, then capability/attempt context remains usable or safely explained without data recreation or crash. | Focused browser flow |
| AC-06 | Given an outcome-originated session with required existing evidence capture, when it completes, then the evidence is associated with the same outcome/attempt context and preserves session/Evidence identity. | Focused browser + model test |
| AC-07 | Given a completed or recorded outcome-originated execution, when the learner returns to the capability, then they can see what was attempted and the relevant evidence/session context. | Focused browser flow |
| AC-08 | Given session completion, evidence creation, Study/Reading completion, or resource progress, when the capability is revisited, then its state remains only active/archived with no automatic attempt replacement or capability progress value. | Focused model/browser test |
| AC-09 | Given legacy state or backup without outcome execution context, when loaded/restored repeatedly, then legacy sessions/evidence remain valid and no outcome link is fabricated. | Focused state/backup test |
| AC-10 | Given a current backup with outcome-originated session/evidence context, when exported and restored, then that context round-trips while unrelated domains remain unchanged. | Focused backup/restore test |
| AC-11 | Given local/offline use after shell availability, when an outcome session is started, finished, reopened, and revisited, then its local context remains available without a remote dependency. | Focused PWA/browser flow |
| AC-12 | Given keyboard and supported mobile use, when the learner starts execution and returns to the capability, then controls are labeled, focus-safe, readable, and do not introduce horizontal overflow. | Focused browser accessibility/responsive flow |

## 10. Validation expectations

Design must map each AC to repository-supported evidence. The expected proportional gate is:

- focused Session/Evidence/outcome-model and state-foundation tests;
- one focused browser journey from capability → execution → evidence → capability;
- one existing Study/Reading session-and-evidence regression gate;
- focused PWA/offline evidence for local persistence;
- full `npm test`, browser matrix, and `npm run test:all` deferred to Build/Ship according to the approved Design.

## 11. Constraints, assumptions, and risks

- Preserve the architecture and compatibility contracts in `AGENTS.md`; this Define does not restate them.
- Reuse existing execution and Evidence domains unless Design demonstrates a concrete safety incompatibility. Current source evidence favors reuse with additive context.
- The main compatibility risk is extending resource-oriented session/evidence assumptions without causing legacy Study/Reading behavior to interpret an outcome as a resource or capability as a progress-bearing item.
- A new PWA generation may be required only if Design changes manifest-composed runtime assets; this Define does not authorize one.
- No unresolved product decision blocks Design. Exact field encoding, compatible outcome-only session presentation, and direct-versus-derived Evidence context are bounded technical design decisions.

## 12. Clarity score

| Dimension | Score | Evidence |
|---|---:|---|
| Problem | 3/3 | Shipped capability foundation has no execution/evidence bridge; current source confirms resource-only context. |
| Users | 3/3 | Local-first Compasso learners need to act on a durable capability across sessions. |
| Goals | 3/3 | Outcome → current attempt → existing session/evidence → return context is explicit. |
| Success | 3/3 | Twelve binary acceptance criteria cover execution, provenance, evidence, compatibility, offline, and no-progress boundaries. |
| Scope | 3/3 | Reuse, additive compatibility, exclusions, and proportional validation are explicit. |

**Total: 15/15 — PASS — Ready for Design.**

## 13. Delivery boundary

This document supersedes only the retained working Define for the next delivery. Slice 1 remains formally shipped in `.sdd/archive/learning-loop-redesign/`; its Brainstorm, Define, Design, Build report, and Ship archive are historical evidence and are not rewritten by this Define.
