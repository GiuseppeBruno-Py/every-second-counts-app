# Pressure Simulation — Define

**Delivery:** 7 — Difficulty / Pressure Simulation
**Status:** Shipped
**Roadmap:** Psicocibernética → Compasso
**Baseline:** `origin/main` `982fc8477f880bf619b737b09d889a64ca767bbf`
**Date:** 2026-09-24

## Problem and user

A learner can already edit a Capability's `nextAttempt` and optionally mark its intended future use as simulation. The existing controls do not help the learner turn an ordinary attempt into one performed under a concrete condition resembling the real setting. The target user is the same person planning a next attempt in Capacidades and carrying it through Hoje, Session, Evidence, and reflection.

The roadmap asks for a progressively more realistic attempt (for example, explaining alone, then timed, then while answering questions), without a new route or unjustified schema. This delivery adds one optional and explicit way to formulate such a condition, without assessing competence or automatically advancing a level.

## Goals and success

1. From an active Capability, a learner can open the existing editor directly at an optional simulation aid.
2. The learner writes a concrete real-world condition and explicitly applies it to the visible `nextAttempt` draft; the draft remains editable before save.
3. A repeated Apply in the same edit does not duplicate the condition; changing the condition replaces the previously applied suffix when still present.
4. An unapplied condition is never silently discarded as though it were saved.
5. Only the existing explicit Capability save persists the revised attempt and optional `futureUse: simulate`; Cancel/Escape/refresh before save write nothing. Existing attempt identity remains stable.
6. The saved attempt uses the existing Today/Session/Evidence and backup/offline paths; old data and backups remain valid.
7. Mobile, keyboard, labels, focus, scroll, and save-failure recovery remain usable.

## Rules, scope, and boundaries

- In scope: a secondary action on active Capability cards; a brief optional simulation disclosure in the existing Capability editor; learner-authored condition text; deterministic draft composition; validation/retry; existing persistence and offline regressions; documentation.
- The condition is plain text in the existing `nextAttempt.text`. No pressure level, ladder state, confidence score, due date, completion state, automatic difficulty progression, or new collection is persisted.
- Examples may suggest timing, interruptions/questions, observers, or a full rehearsal, but no example is asserted as a universal sequence or therapeutic intervention.
- `futureUse: simulate` is set in the form only after Apply; the learner may still change it before save. It is context, not progress.
- Rituals may still be chosen explicitly in the existing Session configuration. No new Ritual template or Capability↔Ritual link is required; the current Ritual model does not provide a safe outcome-owned link.
- Out of scope: new route, dashboard, wizard, new schema, backend, AI, automatic Evidence inference, psychological classification, motivational messaging, notifications, or unrelated redesign.

## Acceptance scenarios

| ID | Given / When / Then |
| --- | --- |
| AC-01 | Given an active Capability, when selecting Prepare simulation, then the existing edit dialog opens, simulation guidance is expanded, and stored data is unchanged. |
| AC-02 | Given a condition, when Apply is selected, then the current draft visibly contains the original attempt and condition, and `futureUse` becomes simulation in the draft only. |
| AC-03 | Given an empty condition, overlong composed attempt, or a typed but unapplied condition, when Apply/Save is attempted, then an accessible error appears and nothing is persisted. |
| AC-04 | Given an already applied condition, when Apply is repeated or the condition is changed, then the suffix is not duplicated and the visible draft remains learner-editable. |
| AC-05 | Given a prepared draft, when Cancel, Escape, or refresh occurs before save, then the original attempt and `futureUse` remain unchanged. |
| AC-06 | Given a valid applied draft, when the learner saves and persistence succeeds, then the existing Capability record and attempt ID remain, the new text/context survive refresh, and other domains are not mutated. |
| AC-07 | Given persistence failure, when Save is attempted, then prior durable state remains, the draft stays available for retry, and no success is announced. |
| AC-08 | Given a saved simulation attempt, when using Today/Session/Evidence or JSON export/restore, then existing provenance and backup contracts carry the ordinary attempt text/context without a new schema. |
| AC-09 | Given an archived/missing Capability, when viewing cards or a stale action, then no new simulation can be initiated by that action. |
| AC-10 | Given 360px mobile, 200% zoom, and keyboard use, when opening/applying/canceling, then labels, visible focus, touch targets, and dialog scrolling remain functional without horizontal overflow. |

## Risks and recovery

The main risk is accidentally treating ephemeral helper text as durable, or replacing the learner's attempt without clear preview. The form therefore requires explicit Apply and then explicit Save. Existing candidate-state persistence/rollback handles write failure. No migration, IndexedDB upgrade, new collection, or backup format change is needed. Rollback after PWA exposure requires a forward cache generation; stored `nextAttempt.text` and `futureUse` already belong to the existing contract.

## Clarity gate

Problem 3/3 (gap and intended transformation explicit); users 3/3 (existing Capability learner); goals 3/3 (observable optional action and durability boundary); success 3/3 (10 testable scenarios); scope 3/3 (nextAttempt owner, no schema/route, out-of-scope stated). **15/15 — Ready for Design.** The original roadmap and repository inspection supply the approach without an unresolved product choice; optional Brainstorm is not needed.
