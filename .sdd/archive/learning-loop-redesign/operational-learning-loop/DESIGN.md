# Learning Loop Redesign — Technical Design

**Delivery:** 2 — Operational Learning Loop
**Status:** Shipped — Operational Learning Loop
**Revision:** 1 — 2026-08-09
**Baseline:** `7b1196c819fe2375346ceb803143125f8fd4c25c` on `codex/operational-learning-loop-define`
**Authoritative requirements:** `DEFINE.md`, clarity 15/15, 12 requirements, 12 acceptance criteria
**Prior delivery:** Slice 1 remains shipped and unchanged under `.sdd/archive/learning-loop-redesign/`
**Phase boundary:** Build and independent Ship verification completed within the closed manifest.

## 1. Design gate

Current source confirms that the delivery fits the approved requirements without a new domain or persistence architecture. Existing regular sessions, Deep Work sessions, canonical execution sessions, and Evidence remain the owners of execution. The only schema work is additive record context and one resource-neutral session target. No Iterate is required.

The worktree has no `.codegraph/` index, so the current source, tests, manifest, and shipped SDD archive were inspected directly.

## 2. Selected architecture

An outcome-originated execution stores one normalized provenance snapshot on each existing session representation:

```js
learningContext: {
  outcomeId: "<stable learningOutcomes.id>",
  attemptId: "<stable learningOutcomes.nextAttempt.id>",
  attemptText: "<start-time nextAttempt.text snapshot>"
} | null
```

`learningContext` is execution provenance only. It never contains status, completion, confidence, evidence IDs, score, or progress. The start-time text is immutable for that execution, so later outcome edits or deletion do not make the historical action unintelligible.

`CompassoLearningOutcomeModel` owns creation and normalization of this exact value. Regular `sessions` and `deepWorkSessions` persist it; canonical `executionSessions` copies the normalized value from its source record. The canonical record is the read projection used to return context to the capability.

Legacy records normalize with `learningContext: null` in model projections and remain unlinked. No link is inferred from resource IDs, text, timestamps, or evidence.

## 3. Session integration

### 3.1 Entry

An active capability card adds one labeled **Executar tentativa** action. Archived cards have no execution action. The action opens the existing session-start dialog with:

- the current attempt text prefilled as session intent;
- the existing quick/Deep Work choices;
- a context-only support selector containing **Sem recurso** plus currently available linked Studies/Readings.

The selector defaults to **Sem recurso** so the capability, not content, remains the objective. Missing retained resource references are shown as unavailable and cannot be selected; they do not block execution.

### 3.2 Resource-backed execution

When an available Study or Reading is selected, existing `domain`/`itemId`, metric, progress-update, evidence, history, and deletion behavior remains unchanged. `learningContext` records why the resource session was started. Resource progress is not read by the capability.

### 3.3 Outcome-only execution

When **Sem recurso** is selected, the existing session uses:

```js
domain: "learningOutcome"
itemId: learningContext.outcomeId
```

`learningOutcome` is an execution-target discriminator, not a new collection and not a progress-bearing resource domain. All metric reads/writes are positively gated to `study` or `reading`. The outcome-only finish UI omits start/end metric controls and finishes with reflection/evidence only. It must never call `metricConfig`, write resource progress/status, or mutate the outcome.

Regular and Deep Work starts both receive the same `learningContext`. The existing one-active-execution guard, timers, pause, finish/cancel, recovery, and canonical synchronization remain authoritative. Existing resource starts pass `learningContext: null` and follow their old path.

## 4. Evidence integration

Evidence does **not** store a copied `learningContext`. Its existing stable `sessionId` resolves the owning canonical execution session, whose `learningContext` is authoritative. This avoids divergence after Evidence editing and is durable under the current contract because deleting a session already deletes its session-owned Evidence.

Evidence continues to store its existing `domain` and `itemId` target fields. For resource-backed outcome executions they remain the Study/Reading target. For outcome-only executions they are `learningOutcome` and the outcome ID; `history-evidence-model.js` accepts that additive discriminator instead of coercing it to `study`. Attempt identity/text is always derived from the session, never from those target fields.

Evidence identity, types, text, update behavior, deletion tombstones, and session association are unchanged. Rebinding Evidence to another session resolves the context of the newly selected session; it does not copy or edit provenance.

## 5. Return flow

After a regular-session Evidence save or Deep Work completion/interruption, the existing runtime emits one execution-recorded event containing only the session ID. When the resolved session has `learningContext`, the capability feature routes to `capabilities`, renders the matching card, and returns focus to it.

The card shows a compact latest-execution block for the current outcome:

- attempt snapshot;
- execution date and duration/state;
- existing reflection/result when present;
- Evidence summaries resolved by `sessionId`;
- selected resource title, or **Recurso indisponível**, when applicable.

The block reads canonical execution sessions and Evidence; it creates no attempt-history collection or reverse-link list. If the outcome was deleted, session/evidence remain governed by their existing lifecycle and no outcome is recreated. If the current attempt changed, the old snapshot remains visible as historical execution context while the current next attempt remains learner-controlled.

## 6. Normalization, persistence, and migration

Migration classification: **additive logical record-shape normalization within `compasso.state.v3`**.

- `CompassoLearningOutcomeModel.normalizeExecutionContext()` accepts only a nonblank outcome ID, attempt ID, and attempt text; invalid/partial input becomes `null`.
- Regular session creation stores a normalized context or omits it for legacy/resource-only starts.
- `CompassoDeepWorkModel.normalize()` preserves the normalized context.
- `CompassoExecutionSessionModel.normalize()`, `fromRegular()`, `fromDeep()`, `migrate()`, and `history()` preserve it idempotently.
- Missing context remains unlinked; no historical conversion runs.
- The full-state save/export/import paths already preserve additive fields. Focused state tests prove merge and JSON round-trip without changing unrelated domains.
- IndexedDB database version, storage schema version, object stores, state version, and collection catalog remain unchanged.
- Because cached runtime assets change, `app-manifest.js` advances only the cache generation from `compasso-pages-v71` to `compasso-pages-v72`. Manifest API version, state contract, asset architecture, and Service Worker source remain unchanged.

## 7. Compatibility and invariants

- Existing Study/Reading sessions and Evidence with no context remain valid and behaviorally unchanged.
- Existing outcome, session, evidence, resource, and tombstone identities are preserved.
- Missing Study/Reading references never invalidate an outcome or historical execution.
- Capability lifecycle remains only `active` / `archived`; execution cannot change it.
- No percentage, mastery, confidence, demonstrated/completed state, score, streak, or resource-derived capability progress is stored or displayed.
- No Today, Evidence redesign, attempt-history system, Notes/Relations, Review, Results/Consistency, recall, PACER, GRINDE, RAIL, AI, account, backend, or cloud behavior is introduced.
- Offline behavior continues through the current cached shell and local full-state persistence.

## 8. Accessibility and bounded presentation

The entry action is a semantic button. The support selector has a visible label and unavailable options include text, not color alone. Existing dialog focus/cancel behavior is reused. Return navigation focuses the originating card without trapping focus. The compact context wraps long attempt/evidence text, retains 44px touch actions, and adds no horizontal scrolling at 360, 768, or 1280 px.

## 9. Closed Build file manifest

The Build manifest is closed at **20 exact paths**. No wildcard or additional implementation file is authorized.

| Action | Exact path | Responsibility |
| --- | --- | --- |
| Modify | `learning-outcome-model.js` | Create/normalize the exact execution-context value. |
| Modify | `execution-session-model.js` | Preserve context in canonical normalization, projections, migration, and history. |
| Modify | `deep-work-model.js` | Preserve context in raw Deep Work normalization. |
| Modify | `sessions-feature.js` | Context-aware start, neutral target, metric-free finish, and existing-session compatibility. |
| Modify | `deep-work-feature.js` | Context-aware Deep Work start/title/evidence event without resource assumptions. |
| Modify | `session-companion-feature.js` | Resolve outcome titles/routes for active outcome executions. |
| Modify | `history-evidence-model.js` | Accept the additive `learningOutcome` target without changing Evidence provenance ownership. |
| Modify | `evidence-feature.js` | Emit the recorded-session event only after successful Evidence persistence. |
| Modify | `learning-outcome-feature.js` | Entry selector, launch adapter, event return, and derived latest context. |
| Modify | `design-system.css` | Static responsive/accessibility styles for entry and return context. |
| Modify | `app-manifest.js` | Advance v71→v72 cache generation; module/collection/state contracts unchanged. |
| Modify | `tests/learning-outcome-model.test.js` | Context shape, validation, and snapshot immutability. |
| Modify | `tests/execution-session-model.test.js` | Regular/Deep/canonical preservation, legacy null, idempotence. |
| Modify | `tests/deep-work-model.test.js` | Deep normalization with and without context. |
| Modify | `tests/history-evidence-model.test.js` | Outcome target acceptance and legacy Evidence compatibility. |
| Modify | `tests/state-foundation.test.js` | Merge/backup-shaped round-trip and unrelated-domain preservation. |
| Modify | `tests/app-manifest.test.js` | v72 generation with unchanged state/storage composition contracts. |
| Modify | `tests/browser/learning-outcome-flows.spec.js` | Capability→session→Evidence→return, archive/missing-resource/no-progress/mobile. |
| Modify | `tests/browser/critical-flows.spec.js` | Existing Study/Reading session/Evidence/progress regression. |
| Modify | `tests/browser/pwa-lifecycle-flows.spec.js` | Offline/reopen persistence of execution context under v72. |

Build may create the standard lifecycle report at `.sdd/reports/learning-loop-redesign/BUILD_REPORT.md`; that SDD artifact is not an implementation path and does not expand this 20-path closed product/evidence manifest.

### Frozen implementation areas

`index.html`, `state-foundation.js`, `storage.js`, `service-worker.js`, `execution-session-feature.js`, `history-edit-feature.js`, IA files, package/lock files, Playwright configuration, CI, snapshots, and every later-slice domain remain frozen. If Build proves any frozen implementation file necessary, stop and use `$sdd-iterate`.

## 10. Dependency order

1. Add context creation/normalization to the outcome, execution-session, and Deep Work models.
2. Add the Evidence target discriminator and model tests.
3. Integrate regular/Deep session starts and neutral completion without resource progress.
4. Add Evidence completion event, companion routing, and capability return context.
5. Add static UI styles and v72 generation.
6. Add browser/state regressions, then run the proportional Build gate.

## 11. Test plan and AC traceability

| AC | Implementation/evidence path | Required proof |
| --- | --- | --- |
| AC-01 | `learning-outcome-feature.js`, `sessions-feature.js`; learning-outcome browser | Active card starts the existing quick/Deep flow with current attempt context. |
| AC-02 | outcome/execution/Deep models; model tests + browser reload | IDs and immutable attempt snapshot survive normalization/reload. |
| AC-03 | learning-outcome feature/browser | Archived card has no start action; reactivation restores it. |
| AC-04 | session/Deep/Evidence integration; critical browser regression | Study/Reading progress, history, correction, evidence, and deletion remain unchanged. |
| AC-05 | session/outcome features; learning-outcome browser | No-resource and unavailable-resource starts use neutral target without crash/recreation. |
| AC-06 | Evidence/history models and features; model + browser | Evidence resolves the same context through session ID and keeps identity/edit/delete behavior. |
| AC-07 | canonical model/outcome feature; learning-outcome browser | Completion returns focus to the card with attempt, execution, Evidence, and missing-resource context. |
| AC-08 | session/outcome models/features; model + browser | Finish/resource progress does not replace attempt, archive outcome, or create capability progress. |
| AC-09 | all three model tests + state test | Legacy sessions/Evidence normalize repeatedly with no fabricated context. |
| AC-10 | state test + learning-outcome browser backup fixture | Current context round-trips; unrelated legacy domains are unchanged. |
| AC-11 | PWA browser flow + manifest test | v72 cached shell starts/finishes/reopens locally with no remote dependency. |
| AC-12 | learning-outcome browser at 360/768/1280 | Labels, keyboard/focus return, unavailable text, touch target, wrapping, and no overflow. |

**Traceability result: 12/12 acceptance criteria have named implementation files and deterministic evidence.**

## 12. Validation commands

Build runs focused evidence only:

```powershell
node --test tests/learning-outcome-model.test.js tests/execution-session-model.test.js tests/deep-work-model.test.js tests/history-evidence-model.test.js tests/state-foundation.test.js tests/app-manifest.test.js
npx playwright test tests/browser/learning-outcome-flows.spec.js --project=chromium
npx playwright test tests/browser/critical-flows.spec.js --project=chromium --grep "sessão rápida|histórico e evidência"
npx playwright test tests/browser/pwa-lifecycle-flows.spec.js --project=chromium --grep "offline"
npm run build:test
git diff --check
```

Build must use the repository-supported commands exactly as discovered; if a filter title changes, it may select the equivalent named test without expanding product scope. Full `npm test`, the browser matrix, and `npm run test:all` are deferred to Ship as required by Define.

## 13. Rollback and operational impact

Before publication, revert the delivery as one release unit. After users persist session context, recovery must move forward with a generation that continues to preserve unknown/additive session fields and `compasso.state.v3`; rollback must not delete sessions, Evidence, or outcomes. Legacy clients already preserve unknown top-level/record fields where their normalization does not rebuild a record, but a forward v3-compatible recovery generation is the supported path.

No data migration job, backup action, IndexedDB upgrade, telemetry, account, remote processing, or dependency is introduced. Runtime cost is bounded to filtering existing local execution/Evidence arrays when capability cards render.

## 14. Main risk and Build stop conditions

The main risk is accidentally sending `learningOutcome` through resource metric/edit paths. Mitigation is a positive `study`/`reading` progress allowlist plus focused no-progress and legacy regression tests.

Build must stop for Iterate if it requires a new collection/domain, direct duplicated Evidence provenance, a state/IndexedDB version change, a frozen implementation file, or broader history/review/analytics redesign.

## 15. Design quality gate

- Exact context representation and owner: resolved.
- Evidence direct-versus-derived decision: resolved through `sessionId`.
- Legacy and missing-resource behavior: resolved.
- Outcome-only progress isolation: resolved.
- Migration/PWA behavior: resolved.
- Minimal entry/return UX: resolved.
- Closed manifest: 20 exact implementation/evidence paths.
- Traceability: 12/12.
- Unresolved decisions: none.

**PASS — Ready for Build.**
