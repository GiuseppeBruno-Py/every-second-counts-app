# Evidence-Based Calibration — Define

**Delivery:** 1 — Evidence-Based Calibration
**Status:** Complete (Built)
**Roadmap:** Psicocibernética → Compasso
**Priority:** P0
**Date:** 2026-09-14
**Baseline:** `main` at `bc53712eb105ac02b525ffaec8b42d58d1feea14`

## 1. Definition purpose

Define the smallest functional slice that lets a learner explicitly record what a newly saved Evidence demonstrates they can already do, without turning the statement into a score, identity label, automatic capability state, or mandatory Session step.

This document defines observable behavior and constraints. It does not authorize production implementation or select private helper names.

## 2. Problem and user

The target user is a person using Compasso locally to plan a next attempt, execute it in a Session, and preserve verifiable Evidence.

The current product can already record an optional learning signal after Evidence, but the prompt is generic and may start from a suggested copy of the Evidence summary. That does not clearly distinguish:

- the event that happened, owned by Evidence; and
- the learner's explicit, contextual conclusion about a capability.

The user needs a lightweight way to make that distinction immediately after a successful Session, while retaining control over whether any reflection is written or saved.

## 3. Target outcome

After a Session and its Evidence are durably saved, a learner with valid active Capability context may optionally answer:

> O que esta evidência demonstra que você já consegue fazer?

The answer becomes a learner-authored insight with verifiable provenance to the Evidence. Ignoring, canceling, or failing to save the answer does not affect Session completion, Evidence, Today, Capability, or nextAttempt.

The resulting cycle is advanced by one incremental link:

```text
CAPACIDADE
→ PRÓXIMA TENTATIVA
→ EXECUÇÃO
→ EVIDÊNCIA
→ CALIBRAÇÃO OPCIONAL
```

Recall, rehearsal, Weekly Review changes, Error Notebook changes, experiments, and pressure simulation remain later deliveries.

## 4. Prioritized goals

### P0 goals

1. Present the calibration question only after Session and Evidence persistence succeeds.
2. Keep calibration entirely optional and non-blocking.
3. Persist an answer only after an explicit learner save action.
4. Preserve the Evidence record exactly under its existing contract.
5. Associate a saved answer only through valid existing Capability/Evidence provenance.
6. Preserve local-first, offline, legacy-data, backup/restore, mobile, and critical accessibility behavior.

### Success measures

- A Session can still complete without opening calibration.
- No durable calibration exists before explicit submit.
- An explicit valid submit creates exactly one learner-authored insight associated with the correct Capability and Evidence.
- Cancel, Escape, missing context, and save failure create no signal and change no source record.
- Existing baseline suites remain green with proportional new coverage.
- No state, database, Evidence, or signal schema version changes.

## 5. Scope

### In scope

- The immediate post-Evidence continuation for completed quick Session and Deep Work flows already using `execution:recorded`.
- A discreet optional action that introduces the exact calibration question.
- Reuse of the existing learning-signal interaction and durable ownership when compatible.
- Explicit provenance from a saved calibration to its source Evidence and Capability attempt.
- Empty learner-authored input, explicit submit, Cancel, Escape, focus return, retry after failure, and non-blocking dismissal.
- Compatibility with active, archived, missing, legacy, and malformed references.
- Existing IndexedDB/localStorage durability, JSON backup/restore, offline cache, responsive layout, keyboard, focus, and touch contracts.
- Documentation and proportional Node/browser/PWA regression evidence.

### Out of scope

- Evidence Recall in Hoje.
- Rehearsal or preflight for nextAttempt.
- Weekly Review positive questions or semantic changes.
- Error Notebook restructuring.
- Behavioral Experiments or pressure simulation.
- Scores for confidence, self-esteem, happiness, capability, mastery, or progress.
- Psychological classification, personality analysis, motivational text generation, AI, embeddings, or inferred associations.
- Backend, account, login, cloud sync, external integration, telemetry, notifications, streaks, badges, or gamification.
- A new journal/editor, route, dashboard, modal system, persistence layer, collection, schema, dependency, framework, or service.
- Broad redesign, structural refactor, or unrelated copy cleanup.
- Automatic mutation of Capability lifecycle, nextAttempt, Today, resource progress, Session, Evidence, Weekly Review, Results, or Consistency.

## 6. Requirements

### R-01 — Post-durability presentation

The system SHALL offer calibration only after the originating Session, canonical execution, and Evidence have been durably accepted by the existing completion contract. It SHALL NOT render a successful continuation when Session/Evidence persistence fails.

### R-02 — Optional completion

The calibration action SHALL be optional. A learner SHALL be able to return to Today, open the Capability when available, dismiss the continuation, or otherwise complete the Session flow without answering.

### R-03 — Exact neutral question

When calibration is opened, the primary field SHALL be labeled exactly:

`O que esta evidência demonstra que você já consegue fazer?`

The surrounding copy SHALL describe evidence-based reflection without motivational claims, identity conclusions, psychological advice, or generated praise.

### R-04 — Learner authorship

The calibration response SHALL begin empty. The system SHALL NOT copy, transform, summarize, or infer the response from Evidence or other records.

### R-05 — Explicit persistence

No calibration record SHALL become durable until the learner explicitly submits a non-empty valid response. Opening, focusing, typing, canceling, pressing Escape, navigating away, or refreshing before submit SHALL NOT create a record or tombstone.

### R-06 — Provenance

A saved response SHALL retain the existing stable reference to the active Capability/current attempt and the exact source Evidence. Association SHALL be derived only from canonical execution context, never from matching words, item identity, time, domain, or other heuristics.

### R-07 — Reflection semantics

A saved response SHALL be represented as a learner-authored insight. It SHALL NOT be classified as a permanent user characteristic, proof of mastery, completion, confidence, or a calculated capability state.

### R-08 — Source isolation

Creating, canceling, editing, retrying, or deleting the calibration insight SHALL NOT mutate or duplicate the source Evidence, Session, canonical execution, Capability, nextAttempt, Today item, resource progress, or review.

### R-09 — Missing or inactive context

The system SHALL offer a new calibration only when the Evidence resolves through its canonical execution to an active Capability and valid attempt context. Archived, deleted, unavailable, malformed, or legacy-unlinked context SHALL remain readable under existing behavior and SHALL NOT receive an inferred link or a new calibration action.

### R-10 — Save failure and retry

If calibration persistence fails, the already-saved Session and Evidence SHALL remain intact, no new insight SHALL appear in active state, the typed response SHALL remain available for retry, and the failure SHALL be announced without false success.

### R-11 — Existing signal compatibility

Existing generic learning-signal creation, editing, deletion, provenance, tombstone, and source behavior outside this specific post-Evidence calibration SHALL remain unchanged.

### R-12 — Data compatibility

The delivery SHALL use the compatible existing durable model discovered for learning signals. It SHALL NOT change `compasso.state.v3`, the IndexedDB version, the storage key, Evidence schema, learning-signal schema, backup root, collection catalog, or Markdown/vault contract.

### R-13 — Local-first and offline

After a complete application shell has been cached, the full Session → Evidence → optional calibration flow SHALL operate without network access and remain correct after refresh/reopen under existing persistence behavior.

### R-14 — Interaction quality

The flow SHALL be keyboard operable, expose an unambiguous label and accessible name, move focus predictably, support Escape/Cancel, restore focus to the invoking action, preserve visible focus and modal semantics, maintain coarse-pointer touch targets, and avoid horizontal overflow at small mobile widths and 200% zoom.

### R-15 — Visual hierarchy

The optional calibration action SHALL NOT compete visually with the primary continuation to Today. It SHALL reuse existing completion/dialog/design-system primitives unless repository evidence proves a minimal additional style is necessary.

### R-16 — Cache coherence

If a cached production asset changes, the delivery SHALL advance the manifest-owned cache generation once and validate composition, controlled update, and offline startup without changing Service Worker ownership or user data.

## 7. Business rules

1. Evidence remains the factual source record; calibration is a separate learner-authored interpretation.
2. The Evidence summary is visible context, never default answer content.
3. Calibration is available only for a newly saved Evidence with valid active Capability provenance.
4. The learner may decline without explanation.
5. The answer is not an identity statement and creates no score or lifecycle transition.
6. Exactly one submitted action produces exactly one new insight; ordinary UI retries must not duplicate a confirmed record.
7. A failed insight save does not roll back the already-durable Session/Evidence transaction.
8. Legacy and unrelated records remain valid and unlinked.
9. Existing generic signal behavior remains authoritative outside the specialized entry point.
10. No new schema is permitted for this delivery unless the requirements change and SDD Iterate reopens the decision.

## 8. Acceptance scenarios

### AC-01 — Session completion without calibration

**Given** a learner completes a Session with valid Evidence, **when** the learner does not open calibration and returns to Today or dismisses the continuation, **then** Session and Evidence remain saved exactly as before and no learning signal is created.

### AC-02 — Calibration action eligibility

**Given** a newly saved Evidence resolves through its canonical execution to an active Capability/current attempt, **when** the post-completion continuation renders, **then** it offers a secondary calibration action without displacing the primary Today action.

### AC-03 — Exact question and empty response

**Given** an eligible post-Evidence continuation, **when** the learner opens calibration, **then** the field receives focus, uses the exact required question as its label, starts empty, and shows no generated answer or Evidence copy.

### AC-04 — No persistence before confirmation

**Given** calibration is open, **when** the learner types but has not submitted, **then** the durable and active learning-signal collections remain unchanged.

### AC-05 — Cancel and Escape

**Given** calibration is open with or without typed text, **when** the learner cancels or presses Escape, **then** the dialog closes, no signal or tombstone is created, source records remain unchanged, and focus returns to the calibration trigger.

### AC-06 — Explicit save

**Given** an eligible Evidence and a non-empty response, **when** the learner explicitly saves, **then** exactly one learner-authored insight is saved with the correct Capability attempt and source Evidence references.

### AC-07 — Source isolation

**Given** a successful calibration save, **when** pre-save and post-save source records are compared, **then** Capability, nextAttempt, Today item, Session, canonical execution, Evidence, and resource progress are unchanged.

### AC-08 — Persistence failure

**Given** a valid typed calibration and unavailable durable storage, **when** save is attempted, **then** the dialog remains available with its text, an accessible failure is shown, no signal is promoted, and the saved Session/Evidence remain unchanged.

### AC-09 — Retry after failure

**Given** a failed calibration save whose text remains present, **when** persistence becomes available and the learner submits again, **then** one insight is saved and the UI does not duplicate it.

### AC-10 — Ineligible context

**Given** Evidence without canonical Capability provenance or with archived/missing/malformed Capability context, **when** completion or history renders, **then** existing Evidence behavior remains usable, no calibration action appears, and no association is inferred.

### AC-11 — Legacy data

**Given** legacy state without learning signals or with unlinked Session/Evidence, **when** it loads, normalizes, renders, saves, and reloads, **then** it remains valid with no fabricated calibration.

### AC-12 — Backup compatibility

**Given** an old valid JSON backup, **when** it is restored in the new app, **then** restore succeeds under the existing contract. **Given** state containing a saved calibration insight, **when** it is exported, cleared through the supported test fixture, restored, and compared, **then** the insight and all unrelated compatible data round-trip without reclassification.

### AC-13 — Offline flow

**Given** the complete current shell is already cached and the browser is offline, **when** the learner starts/resumes a Session, finishes it with Evidence, optionally saves calibration, and refreshes, **then** all confirmed records remain available and no network service is required.

### AC-14 — Mobile and keyboard

**Given** a 360–390px viewport, coarse pointer, keyboard navigation, or 200% zoom, **when** the completion and calibration controls are used, **then** controls remain reachable, focus visible and ordered, touch targets meet the current design-system contract, dialog Escape/Cancel works, and no global horizontal overflow occurs.

### AC-15 — Existing signal regression

**Given** a learner opens the generic signal action from a Capability or another existing source, **when** that flow is used, **then** its current types, suggestion/provenance behavior, edit/delete behavior, and persistence contract remain available.

### AC-16 — PWA generation

**Given** production JavaScript changes in the delivery, **when** the new shell installs and activates, **then** the manifest reports one coherent forward generation, all required assets compose, offline controlled startup succeeds, and unrelated caches/user persistence remain untouched.

## 9. Error and recovery scenarios

| Scenario | Required behavior |
|---|---|
| Session/Evidence persistence fails | No completion/calibration success UI; retain existing finishing recovery behavior. |
| Capability becomes archived or unavailable before action | Revalidate at activation; omit/refresh the action without creating a record. |
| Evidence or execution is missing before action | Preserve existing completion/history fallback; do not infer a source. |
| Empty or whitespace response | Keep dialog open, focus the field, and create no record. |
| IndexedDB fails but exact localStorage fallback succeeds | Treat save as durable under the existing storage contract. |
| All durable backends fail | Report failure, preserve typed text for retry, and create no active signal. |
| Cancel/Escape/navigation before submit | Discard ephemeral response only; preserve all persisted data. |
| Refresh while dialog is open | Discard ephemeral text; load the last durable state without corruption. |
| Duplicate UI activation | Existing action/runtime safeguards must prevent accidental duplicate confirmed records. |
| Old backup omits `learningSignals` | Normalize to the existing empty collection without migration failure. |
| Saved signal source later disappears | Preserve independently owned signal under existing missing-source behavior. |
| Cache install/composition fails | Keep the prior working generation and do not affect user storage. |

## 10. Constraints and invariants

- Static vanilla-JavaScript PWA; no runtime dependency or build framework.
- Local-first; no network processing of learner content.
- IndexedDB primary and exact localStorage fallback remain authoritative.
- Durable success cannot mean memory-only retention.
- JSON backup/restore, Markdown/vault, notes, wikilinks, and graph derivation remain compatible.
- Capability association is canonical and explicit; no text inference.
- Evidence, Session, Capability, Today, and nextAttempt ownership do not move.
- No schema/version migration.
- No new route or persistent analytics.
- No Service Worker architecture change.
- No user work, unrelated feature, or existing completed SDD artifact may be overwritten.

## 11. Assumptions and dependencies

1. The shipped `execution:recorded` handoff continues to fire only after successful Session/Evidence persistence.
2. Existing active-Capability resolution and learning-signal persistence remain valid integration points.
3. Existing dialog semantics support contextual presentation without changing the durable signal record.
4. The current design system can accommodate the copy and action hierarchy without new layout primitives; Design must prove or conditionally include minimal CSS.
5. Browser tests can inject storage failure and inspect active state, as existing tests already do.
6. The baseline at `bc53712` is the implementation base unless revalidated `main` changes before Build.

## 12. Dependencies on other roadmap deliveries

- Delivery 1 depends only on shipped Capability-first Compasso, Sessions, Evidence, storage, backup/restore, and PWA contracts.
- It does not depend on Deliveries 2–7.
- Delivery 2 may later consume the saved insight, but Delivery 1 must remain useful and complete without recall UI.
- A future change to Evidence or learning-signal ownership requires SDD Iterate before Build or later deliveries.

## 13. Open questions

None block Design. Exact secondary action text and contextual dialog title/help may be selected in Design if they preserve the exact field label, optionality, hierarchy, and neutral tone defined here.

## 14. Clarity score

| Dimension | Score | Evidence |
|---|---:|---|
| Problem | 3/3 | Current generic signal behavior and the factual Evidence versus learner interpretation gap are explicit. |
| Users | 3/3 | The local-first self-directed learner and the post-Session context are explicit. |
| Goals | 3/3 | Six prioritized P0 goals and an incremental single-slice outcome are defined. |
| Success | 3/3 | Six measurable success statements and sixteen Given/When/Then scenarios cover success, boundaries, and recovery. |
| Scope | 3/3 | In-scope behavior, extensive non-goals, data boundaries, and later roadmap deliveries are explicit. |
| **Total** | **15/15** | **Ready for Design.** |

## 15. Gate result

- Measurable requirements: PASS.
- In/out scope: PASS.
- Business rules and constraints: PASS.
- Happy, boundary, error, recovery, legacy, offline, mobile, and accessibility scenarios: PASS.
- Clarity: 15/15.

**Readiness: PASS — Build completed; proceed to `$sdd-ship` only on explicit continuation.**

## 16. Revision history

| Revision | Date | Change |
|---|---|---|
| 1.0 | 2026-09-14 | Initial DEFINE for the first P0 roadmap slice, grounded in remote-main discovery and baseline. |
| 1.1 | 2026-09-14 | Design gate passed at 15/15; status advanced to Complete (Designed). |
| 1.2 | 2026-09-14 | Build completed with 16/16 acceptance scenarios and canonical regression passing. |
