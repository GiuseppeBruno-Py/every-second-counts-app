# Behavioral Experiments — Define

**Delivery:** 6 — Behavioral Experiments
**Status:** Shipped
**Roadmap:** Psicocibernética → Compasso
**Baseline:** `origin/main` `4f8c1b2938987fa50696a25ae2396d8e365e4f6f`
**Date:** 2026-09-23

## Problem, user, and outcome

The Compasso learner can preserve Capability, nextAttempt, Session Evidence, and weekly decisions, but cannot define a repeatable behavioral practice with a testable hypothesis, planned observation, review date, and explicit decision. The intended outcome is a small, local-first experiment attached to one Capability. This is practice and evidence-based review, not a promise that visualization or a fixed duration changes behavior.

## Goals and success

1. A learner explicitly creates an experiment with hypothesis, repeated practice, expected observable result, evidence plan, start date, and review date.
2. Presets of 7, 14, 21, and 30 days and a custom period are available. No preset is described as scientifically necessary.
3. A learner can edit an open plan, explicitly review it with observed result and Keep/Adjust/Abandon, and delete it with confirmation.
4. No experiment automatically modifies Capability, nextAttempt, Session, Evidence, or Weekly Review.
5. A successful save survives refresh, IndexedDB or localStorage fallback, JSON export/restore, and offline use. A failed save leaves the previous durable state and editable draft intact.
6. Existing data and backups load; existing regressions remain green; small viewport and keyboard operation remain usable.

## Scope and rules

- In scope: a discreet Experiments section in the existing Capability view; active Capability selection; explicit create/edit/review/delete; local persistence, sync merge, backup/restore, offline cache, tests, and documentation.
- Experiments remain historical when their Capability is archived, deleted, or its nextAttempt changes. New experiments require an active Capability; existing plans may still be reviewed.
- Review is a learner decision, not an inferred score. Review date is a prompt for manual reflection, not an automatic status transition or notification.
- Evidence plan says how the learner will know; the observed-result field records what happened. No automatic Evidence copy or semantic matching in this slice.
- Out of scope: route/dashboard, automatic scheduling, reminders, analytics, AI, embeddings, 21-day scientific claim, gamification, backend, dependencies, or Pressure Simulation.

## Acceptance scenarios

| ID | Given / When / Then |
| --- | --- |
| AC-01 | Given an active Capability, when the learner saves a complete valid experiment, then exactly one experiment is durable and the source Capability and nextAttempt are unchanged. |
| AC-02 | Given required text missing, invalid dates, or review before start, when submitted, then the dialog stays open, identifies the error, and writes nothing. |
| AC-03 | Given a preset of 7/14/21/30 days, when selected, then the review date is calculated from start; custom dates remain editable; no duration claim is shown. |
| AC-04 | Given an open experiment, when edited and explicitly saved, then the same record identity remains with updated plan and no implicit review. |
| AC-05 | Given an open experiment, when reviewed with an observed result and Keep/Adjust/Abandon decision, then the decision is durable and does not alter Capability or nextAttempt. |
| AC-06 | Given a cancelled dialog, Escape, refresh, or failed save, when returning, then no partial durable change exists; failed-save input remains available for retry. |
| AC-07 | Given a confirmed deletion, when saved, then the experiment disappears and its sync tombstone prevents resurrection; cancel leaves it intact. |
| AC-08 | Given a legacy state or backup without experiments, when loaded/restored, then existing data works and experiments default to an empty collection; a new backup round-trips the collection. |
| AC-09 | Given offline cached app or localStorage fallback, when creating/reviewing an experiment, then normal durability and refresh behavior work without network. |
| AC-10 | Given 360px mobile viewport or keyboard navigation, when using the dialogs, then labels, focus, Escape/cancel, and scrollable content allow completion without losing the primary Capability actions. |

## Constraints, risks, and assumptions

- Use the existing local-first state, `saveData`, manifest collection/sync machinery, and native dialog conventions. One additive collection is permissible only because existing Ritual and signal shapes lack a structured hypothesis/period/review lifecycle.
- Top-level `compasso.state.v3` and IndexedDB object stores stay unchanged. New records need an explicit schema version and idempotent normalization. A legacy backup must restore safely.
- The user authorizes iteration through a PR, not merge or deployment. Existing unrelated checkout work is untouched in an isolated worktree.
- Risks: sync conflict/tombstone handling, accidental silent state mutation, and dialog density on mobile. Tests must target those.

## Clarity gate

Problem 3/3; users 3/3; goals 3/3; success 3/3; scope 3/3. **15/15 — Ready for Design.** The user supplied the conceptual model, presets, constraints, and sequential delivery boundary; no unanswered product choice blocks this MVP.
