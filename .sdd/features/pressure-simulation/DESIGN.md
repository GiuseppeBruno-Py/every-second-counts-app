# Pressure Simulation — Design

**Delivery:** 7
**Status:** Shipped
**DEFINE clarity:** 15/15
**Baseline:** `origin/main` `982fc8477f880bf619b737b09d889a64ca767bbf`
**Branch:** `codex/pressure-simulation`

## Inspection and gap

The isolated worktree began clean at the current remote `main`. `.codegraph/` is absent here; direct source, documentation, tests, manifest, and CI are authoritative. `npm test` baseline: **232 passed, 0 failed, 0 skipped**. The installed SDD skill packages reference templates that are absent, so these artifacts follow the required contracts and repository format directly.

`learning-outcome-feature.js` already owns the native Capability dialog, `nextAttempt` textarea, `futureUse` select, candidate-save rollback, and active cards. `learning-outcome-model.js` preserves attempt identity while changing its text/context. `today-feature.js` and Session adapters already carry the attempt and `futureUse: simulate` as a snapshot. `ritual-model.js` supports preparation templates but has no durable Capability link in the present outcome schema; adding one solely for pressure simulation would expand schema/sync scope. The gap is a discoverable, explicit way to formulate a realistic condition in the existing next attempt.

## Target behavior and responsibilities

- An active Capability card gets a secondary **Preparar simulação** action next to its attempt, not beside the primary execution action. Archived cards do not show it.
- That action opens the existing Capability dialog with a **Simulação deliberada (opcional)** disclosure expanded and its single condition field focused. Ordinary Edit keeps the disclosure closed.
- The learner may type a concrete condition such as “com 8 minutos e perguntas durante a explicação”. A secondary **Adicionar à próxima tentativa** action transforms only the visible draft to `base + '\nCondição de simulação: ' + condition`, and selects existing `futureUse: simulate` in the draft. It never calls persistence.
- Reapplying an unchanged condition replaces the exact previously generated suffix rather than duplicating it. A changed condition replaces the same suffix while it remains intact; manual edits to the attempt stay under learner control. Empty input or a result exceeding the textarea's 1000-character limit fails visibly without mutation.
- `outcomeDraftSignature()` includes transient condition text. Save rejects a nonempty condition that has not been applied, preventing silent data loss. Existing explicit Capability save is the only durable step. Cancel/Escape confirm discarding a changed draft, then restore focus. While save is pending, Escape/cancel cannot close the dialog. On failed save, existing detached-candidate rollback keeps the draft and error visible.
- No independent pressure level, analytics, Ritual link, or domain record is created. Old records and backups continue to normalize through the same `learningOutcomes` contract; `futureUse: simulate` already exists.

## Data flow and interface

`card action → outcomeOpen(existing, trigger, {pressure:true}) → condition text → Apply to visible nextAttempt draft → optional learner edit → existing outcomeSubmit → learningOutcomeModel.updateOutcome → detached state candidate → saveData → close on success or restore and retry on failure`.

`outcomePressureApply()` is a UI helper, not a persistent model or new service. It tracks only the last condition applied during the current dialog opening to make repeated Apply idempotent. The persisted value is still plain `learningOutcomes[].nextAttempt.text`, with optional `nextAttempt.futureUse: 'simulate'`. `nextAttempt.id` and historical Session snapshots remain unchanged. A normal Edit/Save without using the aid retains the existing flow.

## File manifest (closed)

| Path | Action | Purpose / dependencies | AC |
| --- | --- | --- | --- |
| `learning-outcome-feature.js` | modify | Active-card action, existing dialog disclosure, draft composition/validation/focus/retry; uses existing model/runtime | 01–10 |
| `design-system.css` | modify | Secondary trigger and disclosure layout/focus/mobile rules, no injected style | 01, 10 |
| `app-manifest.js` | modify | Advance complete-cache generation v86→v87; same module catalog and state contract | 06, 08 |
| `tests/app-manifest.test.js` | modify | Assert v87 identity and no collection/schema addition | 06, 08 |
| `tests/browser/pressure-simulation-flows.spec.js` | create | End-to-end draft/save/cancel/reapply/failure/legacy/backup/offline/mobile/Session scenarios | 01–10 |
| `docs/pressure-simulation.md` | create | Usage, limits, compatibility, forward rollback | 01–10 |
| `.sdd/features/pressure-simulation/{DEFINE,DESIGN}.md` | create | Requirements and design | all |
| `.sdd/reports/pressure-simulation/BUILD_REPORT.md` | create | Exact validation and acceptance evidence | all |
| `.sdd/archive/pressure-simulation/{DEFINE,DESIGN,BUILD_REPORT,SHIPPED}.md` | create | Copy-only Ship closure | all |

No moves or deletions. No new module, manifest collection, route, IndexedDB object store, schema version, dependency, backend, or Service Worker source change.

## Acceptance-to-test mapping and commands

- AC-01/02/04: browser card/dialog/apply/overwrite assertions in new spec.
- AC-03: browser blank, overlength, unapplied and error-focus assertions.
- AC-05/07: browser Cancel/Escape/refresh, frozen-storage failure injection, rollback/retry.
- AC-06/08: browser attempt ID, Today/Session snapshot, JSON backup/restore, legacy record; existing Node model/state tests.
- AC-09: browser archived Capability and stale-action behavior.
- AC-10: Chromium/mobile tests at 360px and 200% zoom, label/focus/touch/scroll, plus existing design-system regressions.
- `npm test`, `npm run build:test`, `npm run test:browser`, and focused `npx playwright test` are supported by `package.json` and Playwright configuration. Lint/typecheck scripts are not configured.

## Migration, rollback, and nonfunctional impact

Schema migration: **not applicable**. Only current `nextAttempt.text` and optional existing `futureUse` are saved. Legacy JSON and localStorage/IndexedDB normalization remain unchanged. Offline asset lists are manifest-derived; only the generation changes. Rollback after an installed PWA has seen v87 requires a later forward generation and must not clear learner storage. User-authored condition stays local under existing privacy/sync choices. No telemetry or AI. Render cost is one secondary action per active card; dialog work is constant. Native dialog semantics and static CSS preserve accessible and mobile behavior.

## Gate

DEFINE 15/15; repository inspected; current/target flow, decision, closed manifest, AC mapping, compatibility and rollback recorded. **Ready for Build.**
