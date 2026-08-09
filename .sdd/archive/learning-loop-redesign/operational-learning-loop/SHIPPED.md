# Operational Learning Loop — Shipped

**Initiative:** `learning-loop-redesign`
**Delivery:** 2 — Operational Learning Loop
**Status:** SHIP PASS — Ready for Git integration
**Shipped through SDD:** 2026-08-09
**Baseline:** `7b1196c819fe2375346ceb803143125f8fd4c25c`
**Branch:** `codex/operational-learning-loop-define`
**Design:** Revision 1, closed 20-path implementation/evidence manifest

## Closure boundary

This archive closes only Delivery 2, `Operational Learning Loop`. It does not close the umbrella `learning-loop-redesign`, implement another learning-loop delivery, integrate Git history, deploy, or publish. Slice 1 remains independently archived and unchanged in the parent archive directory.

## Shipped behavior

An active capability can start the existing quick-session or Deep Work execution flow from its current attempt. Existing session records retain nullable, normalized provenance:

```js
learningContext: {
  outcomeId,
  attemptId,
  attemptText
} | null
```

The canonical execution projection preserves that snapshot. Evidence remains session-owned and resolves capability context through its existing `sessionId`; Evidence does not duplicate outcome provenance. After a completed or interrupted execution, the application returns to and focuses the originating capability with the attempt, execution result, resource availability, and Evidence context.

Outcome-only execution uses the metric-neutral `learningOutcome` target. It does not write Study/Reading metrics and never creates capability completion, percentage, mastery, confidence, or score. Explicit Study/Reading-backed execution keeps its existing resource metric behavior without turning activity into capability progress.

## Compatibility and data contracts

- State remains `compasso.state.v3`.
- IndexedDB database/schema versions and object stores are unchanged.
- Session context is an additive, nullable record field; legacy sessions and Evidence remain valid and unlinked, with no inferred provenance.
- Backup/restore-shaped normalization and merge preserve the snapshot and unrelated user domains.
- Missing or deleted supporting resources do not invalidate the capability, session, or Evidence context.
- Existing local-first persistence and cached offline reopen remain intact.
- PWA cache generation advances from `compasso-pages-v71` to `compasso-pages-v72`; the current manifest remains the composition and cache owner.

## Independent Ship validation

| Gate | Result |
| --- | --- |
| `npm run test:all` | Exit 0 |
| Full Node suite | 167 passed, 0 failed, 0 skipped |
| Full browser suite | 124 passed, 18 intentional project/platform skips, 0 failed |
| Build composition | Included in canonical browser gate; v72 composed successfully |
| `git diff --check` before archive | Exit 0 |
| Closed-manifest audit | All 20 approved implementation/evidence paths present; no unauthorized implementation path |
| Frozen-file audit | Product/state/storage/CI/package/Playwright/snapshot files outside the manifest unchanged |

## Acceptance reconciliation

| AC | Status | Independent Ship evidence |
| --- | --- | --- |
| AC-01 | Pass | Full browser flows start quick and Deep Work execution from an active capability. |
| AC-02 | Pass | Model/state and browser lifecycle evidence preserve outcome ID, attempt ID, and start-time text snapshot. |
| AC-03 | Pass | Archived capabilities suppress execution entry; reactivation restores it. |
| AC-04 | Pass | Full Study/Reading regression flows preserve legacy metrics and behavior. |
| AC-05 | Pass | Outcome-only and unavailable-resource flows execute without resource recreation or failure. |
| AC-06 | Pass | Evidence derives capability context through session identity; source audit confirms no copied provenance. |
| AC-07 | Pass | Browser flows return focus and execution/Evidence context to the originating capability. |
| AC-08 | Pass | Outcome-only execution and resource completion do not change capability lifecycle or current attempt. |
| AC-09 | Pass | Legacy normalization remains valid, nullable, idempotent, and does not infer links. |
| AC-10 | Pass | State round-trip and merge preserve context and unrelated domains under v3. |
| AC-11 | Pass | Controlled cached offline/reload flow preserves session context and Evidence. |
| AC-12 | Pass | Full browser evidence covers labels, focus return, mobile wrapping, and overflow constraints. |

**Totals:** 12 Pass, 0 Partial, 0 Fail, 0 Not run.

## Residual risks

- Remote Linux CI has not yet run against the uncommitted delivery; the local canonical Windows gate passed, and Linux verification remains part of Git integration.
- No physical installed-PWA observation was performed; automated controlled Service Worker and offline/reopen coverage passed.
- `npm ci` reported two pre-existing high-severity dependency audit findings. No dependency or lockfile changed in this delivery.

None of these is an unresolved mandatory acceptance failure.

## Rollback and data preservation

Before publication, the delivery can be reverted as one release unit. After users persist outcome-linked session context, recovery must move forward with a PWA generation that continues preserving `compasso.state.v3`, nullable session provenance, session/Evidence identity, and backup/export behavior. Rollback must not delete user data or reinterpret resource activity as capability progress.

## Lessons retained

1. Provenance belongs on the durable execution record, while Evidence can remain normalized through `sessionId`; this avoids duplicated context and divergent edits.
2. Resource progress safety is clearest as an explicit positive allowlist for Study/Reading metrics, leaving `learningOutcome` execution metric-neutral by construction.
3. Decorated public session starters can discard added options; bounded internal cores preserved legacy entry-point contracts while allowing the approved provenance to reach existing execution systems.

## Operational state

- Git staging/commit/push/merge: not performed during Ship.
- Deployment/publication: not performed; Ship is not deploy.
- Next delivery: not started.
- Working SDD artifacts are retained; this directory is the delivery-specific archival copy and does not overwrite the prior Slice 1 archive.

**Next safe step:** create a scoped post-Ship Git checkpoint for this delivery, then perform controlled integration validation before any main-branch or publication decision.
