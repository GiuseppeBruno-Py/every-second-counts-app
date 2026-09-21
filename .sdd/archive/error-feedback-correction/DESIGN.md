# Error → Feedback → Correction — Design

**Delivery:** 5 — Error → Feedback → Correction
**Status:** Shipped
**Roadmap:** Psicocibernética → Compasso
**Priority:** P1
**Date:** 2026-09-20
**Baseline:** `origin/main@5e3d8d2ce2e988e94f1b057adf42382b45152def`
**DEFINE:** `.sdd/features/error-feedback-correction/DEFINE.md` — clarity 15/15

## 1. Purpose

Implement the five-stage error-correction structure inside the existing Caderno de Erros, adding only the two meanings the current record cannot represent independently: learner-authored interpretation and testable hypothesis.

The change remains local-first and additive. It introduces no new route, collection, model, top-level schema, migration runner, backend, dependency, score, inference, or automatic Capability action.

## 2. Repository-grounded current state

### Owner and record

`weakness-feature.js` owns:

- weak-topic derivation from spaced-repetition history;
- manual and weak-card-origin record creation;
- render, edit, resolve, reopen, and delete;
- optional reading/study/goal link;
- `errorNotebook` initialization and record version 1;
- the existing dialog and feature-local presentation.

The current record already contains:

```javascript
{
  id,
  schemaVersion: 1,
  status: "open" | "resolved",
  title,
  context,
  correction,
  nextAction,
  domain,
  itemId,
  sourceCardId,
  createdAt,
  updatedAt,
  resolvedAt
}
```

`context` comes from the exact existing prompt “O que aconteceu?”, so it is the safe owner for observed fact. `correction` and `nextAction` already match correction and next attempt.

### Second writer

`context-learning-feature.js` creates a valid v1 error record from a contextual explanation gap. It writes factual coverage context, a correction, and a next action. It does not have learner-authored interpretation or hypothesis and must not synthesize them.

### Persistence and portability

`errorNotebook` is a manifest-owned record-timestamp array collection in `compasso.state.v3`. State normalization preserves unknown record properties. IndexedDB/localStorage persistence and JSON backup/restore serialize complete records.

Therefore additive string properties travel through existing persistence, merge, backup, restore, and rollback without a new state owner.

### Save gap

The existing manual save mutates active `state.data`, closes the dialog, and invokes asynchronous `saveData()` without awaiting its boolean result. If both durable backends fail, the candidate remains active in memory and the learner loses the editable dialog even though the toast reports failure.

This does not satisfy AC-14 for the new structured record. The same owner can use the candidate-state/rollback pattern already established in Weekly Review without changing storage infrastructure.

### UI and responsive contract

The dialog already uses labelled native controls and the global notebook dialog rule in `design-system.css`, which provides viewport-bounded `max-height` and scrolling. Adding two fields requires no new style. Existing feature-local runtime style is historical and must not be expanded.

### Validation baseline

- `npm test`: 219 passed, 0 failed, 0 skipped.
- `npm run build:test`: PASS.
- No dedicated functional Caderno browser suite exists.
- Full Visual Revamp has one weakness-state visual scenario.
- `.codegraph/` is absent; source, tests, docs, manifest, and CI are authoritative.

## 3. Concrete gap

The existing shape cannot preserve interpretation and hypothesis as distinct learner-authored content:

- putting both into `context` would conflate fact with conclusion and require a brittle text encoding;
- putting hypothesis into `correction` would state an explanation as a decided correction;
- putting it into `nextAction` would conflate explanation with behavior;
- deriving either value would violate learner control.

The current save behavior also cannot truthfully guarantee that an explicit structured save becomes durable before the dialog closes.

## 4. Target state

An explicitly saved manual or edited record may be:

```javascript
{
  // existing fields preserved
  schemaVersion: 2,
  context: "Fato observado",
  interpretation: "Conclusão do aprendiz",
  hypothesis: "Explicação específica testável",
  correction: "O que deveria acontecer diferente",
  nextAction: "Próxima tentativa concreta"
}
```

- `interpretation` and `hypothesis` are optional strings.
- Empty strings are valid on an explicit v2 save.
- v1 records render the new controls empty without mutation.
- Valid new properties are read by presence, not gated by version.
- `context-learning-feature.js` continues producing v1 entries with no synthetic new values.
- Save promotes the candidate and closes only after `saveData()` returns true.
- Save failure restores the previous state, keeps the dialog/draft open, exposes an accessible error, and permits retry.

## 5. Component responsibilities

### 5.1 `weakness-feature.js`

1. Advance `WEAKNESS_FEATURE_VERSION` from 1 to 2.
2. Add `weaknessOptionalText(value)` for safe rendering only.
3. Rename the title guidance to neutral event-oriented language without enforcing semantics.
4. Relabel `context`, `correction`, and `nextAction` to the approved stage wording.
5. Add `#errorInterpretation` and `#errorHypothesis` textareas in exact focus order.
6. Render only valid stored strings; missing/malformed values produce empty controls without state mutation.
7. Display non-empty fact, interpretation, hypothesis, correction, and next attempt as separate labelled paragraphs.
8. Preserve all unknown/existing record properties through spread-based update.
9. Save v2 only on explicit successful form submission.
10. Use detached candidate state, await `saveData()`, and restore prior state plus draft on failure.
11. Prevent duplicate submit and dialog cancellation while a durable write is pending.
12. Add an accessible dialog name, close-button name, error status, initial focus, and safe focus return.
13. Keep weak-topic ranking and resolve/reopen/delete behavior semantically unchanged.

### 5.2 `app-manifest.js`

Advance only `cacheName` from `compasso-pages-v84` to `compasso-pages-v85`. No module, asset, collection, order, route, or shared state contract changes.

### 5.3 Documentation

`docs/weakness-error-notebook-feature.md` documents the five stages, v2 additive properties, explicit save, v1/contextual compatibility, failure behavior, backup/offline, and non-inference.

`docs/capability-first-compasso.md` records the error-feedback-correction loop while clarifying that no Capability or next attempt changes automatically.

### 5.4 Tests

Node source contracts protect the exact labels, field ownership, v2, candidate rollback, and absence of a new domain/score. Browser coverage proves the user flows, compatibility, persistence, offline, responsive, and accessibility contracts.

## 6. Interfaces and data contract

### 6.1 DOM controls

```text
#errorContext
  label: Fato observado — O que aconteceu objetivamente?
  existing textarea, maxlength 700

#errorInterpretation
  label: Interpretação — Que conclusão você está tirando disso?
  new textarea, maxlength 700, optional

#errorHypothesis
  label: Hipótese — Qual explicação específica pode ser testada?
  new textarea, maxlength 700, optional

#errorCorrection
  label: Correção — O que deveria acontecer diferente?
  existing textarea, maxlength 900, required

#errorNextAction
  label: Próxima tentativa — O que você fará?
  existing input, maxlength 220, required
```

`#weaknessDialog` receives `aria-labelledby="weaknessDialogTitle"` and `aria-describedby="weaknessError"`. `#weaknessError` is a hidden `role="alert"`, `tabindex="-1"` status focused after failure.

### 6.2 Safe read

```javascript
function weaknessOptionalText(value) {
  return typeof value === 'string' ? value : '';
}
```

It never writes or normalizes the record.

### 6.3 Candidate save

```text
capture current DOM values
→ clone state.data
→ create/update one candidate error record
→ state.data = candidate
→ await saveData(message)
  → true: close dialog, reset runtime, return focus
  → false: state.data = previous, best-effort restore previous durable state,
           render previous state, restore/focus error, keep draft and dialog open
```

`weaknessRuntime.saving` blocks duplicate submissions. Close controls and native cancel are disabled/prevented only during the pending durable write.

### 6.4 Per-record compatibility

- v1 with no new properties: valid, empty controls, no write.
- v1 with valid forward-preserved properties: values render by presence.
- v2 with strings: exact values render.
- malformed new property: empty presentation only; no background normalization.
- explicit save: schemaVersion 2 and explicit trimmed strings, including empty strings.

## 7. State transitions

### New save success

```text
dialog draft
→ candidate v2 record
→ durable save true
→ candidate remains active
→ dialog closes
→ saved record edit action receives focus when available
```

### Save failure

```text
dialog draft
→ candidate active only during save attempt
→ durable save false
→ previous state restored
→ dialog remains open with exact draft
→ error status receives focus
→ retry enabled
```

### Legacy render/update

```text
v1 record opens
→ historical fields unchanged, new fields empty
→ no write
→ optional learner edit + explicit save
→ same id/createdAt/status/provenance, schemaVersion 2
```

### Contextual gap

```text
existing context evaluation action
→ unchanged v1 record writer
→ Caderno renders generated factual/correction fields
→ interpretation/hypothesis absent
→ only learner edit may add them
```

### Resolve/reopen/delete

Existing explicit controls retain their behavior. Resolve/reopen changes only status timestamps. Delete removes only the selected error record after confirmation.

## 8. Important flows

### 8.1 Structure without semantic policing

The UI labels guide the distinction but do not analyze or reject text such as “sou ruim”. No keyword rules, sentiment logic, score, or automatic rewrite is introduced.

### 8.2 Source-prefilled entries

Weak-card entries keep their current prefilled `context`, `correction`, `nextAction`, link, and source card. The new controls start empty. Contextual-gap records remain v1 until an explicit Caderno edit.

### 8.3 Failure and retry

The dialog is not closed before durability. A double submit cannot create duplicates. On failure, the last valid state remains authoritative and the exact DOM draft remains available.

### 8.4 Backup and offline

Whole-record JSON serialization carries additive properties. Controlled v85 cache supplies the modified module offline; storage remains independent from the Service Worker.

## 9. Significant decisions

### D-01 — Reuse three fields; add only two

**Decision:** reuse `context`, `correction`, and `nextAction`; add `interpretation` and `hypothesis`.

**Rejected:** five new duplicate properties. It would create parallel meanings and migration pressure.

### D-02 — Do not encode into `context`

**Decision:** distinct additive properties.

**Rejected:** labelled concatenation/parsing inside `context`. It is brittle, ambiguous for historical free text, and harms search/export readability.

### D-03 — Optional new responses

**Decision:** preserve existing validation and allow empty new values.

**Rationale:** the structure guides reflection without blocking quick capture, contextual records, or legacy edits.

### D-04 — Explicit per-record v2, no migration

**Decision:** write v2 only through explicit Caderno save; read properties by presence.

**Rejected:** global `compasso.state.v4`, startup backfill, or changing the contextual writer. None is necessary.

### D-05 — Candidate save inside existing owner

**Decision:** await existing `saveData()` and roll back within `weakness-feature.js`.

**Rejected:** new persistence service or storage API. Existing contracts are sufficient.

### D-06 — No new CSS

**Decision:** reuse current fields and the stronger global notebook dialog constraint.

**Rejected:** expanding historical runtime-injected feature CSS or redesigning the route.

### D-07 — Manifest generation advances; Service Worker does not

**Decision:** v84 → v85 in `app-manifest.js` only.

## 10. Closed file manifest for Build

| # | Action | Exact path | Purpose | Dependencies | Acceptance coverage |
| ---: | --- | --- | --- | --- | --- |
| 1 | Modify | `weakness-feature.js` | Five-stage UI/render, v2 fields, candidate save/rollback, duplicate guard, dialog accessibility/focus | Existing Weakness and save contracts | AC-01–AC-11, AC-14, AC-16–AC-19 |
| 2 | Modify | `app-manifest.js` | Advance candidate generation v84→v85 only | Production module change | AC-15, AC-19 |
| 3 | Modify | `docs/weakness-error-notebook-feature.md` | Document structure, data shape, legacy, failure, backup, offline, no inference | 1 | AC-01–AC-19 |
| 4 | Modify | `docs/capability-first-compasso.md` | Place correction loop in the learning cycle without automatic Capability mutation | 1 | AC-13, AC-18–AC-19 |
| 5 | Create | `tests/weakness-contract.test.js` | Protect exact labels, fields, v2, candidate rollback, no score/domain, contextual v1 compatibility | 1 | AC-01–AC-09, AC-14, AC-18–AC-19 |
| 6 | Modify | `tests/app-manifest.test.js` | Require v85 while state v3/collection/assets remain stable | 2 | AC-12–AC-15, AC-19 |
| 7 | Create | `tests/browser/error-feedback-correction-flows.spec.js` | Functional CRUD, cancel, failure/retry, legacy/source, backup, protected domains | 1 | AC-01–AC-14, AC-18–AC-19 |
| 8 | Modify | `tests/browser/full-visual-revamp-flows.spec.js` | Populate and scan new dialog/list stages in existing weakness variants | 1 | AC-01–AC-05, AC-17 |
| 9 | Modify | `tests/browser/design-system-flows.spec.js` | Prove dialog name, focus order/return, Escape, 360/390, touch, and zoom | 1 | AC-16–AC-17 |
| 10 | Modify | `tests/browser/pwa-lifecycle-flows.spec.js` | Create/reload/edit/resolve structured error in controlled offline shell | 1–2 | AC-12, AC-15, AC-19 |

No other production, model, storage, foundation, route, CSS, Service Worker, package, or test file is authorized.

### Frozen paths

- `context-learning-feature.js`;
- `context-rag-feature.js`;
- `state-foundation.js`;
- `storage.js`;
- `index.html`;
- `design-system.css`;
- `service-worker.js`;
- `package.json` and `package-lock.json`;
- Session, Evidence, Capability, Today, Weekly Review, Journal, Ritual, Notes/vault, sync, and integration owners.

If Build needs any frozen or unlisted path, stop and use Iterate before editing.

## 11. Dependency-ordered implementation sequence

1. Add failing Node contracts for exact stages, two fields, v2, candidate save, and v85.
2. Add the dedicated failing browser flows.
3. Add focused visual, accessibility, and PWA assertions.
4. Implement the minimal `weakness-feature.js` change.
5. Advance `app-manifest.js` to v85.
6. Run focused Node/browser tests to green.
7. Update the two docs to verified behavior.
8. Run persistence, state, PWA, visual, accessibility, and protected-domain regressions.
9. Run `npm run test:all` and the exact 10-path scope guard.
10. Produce `.sdd/reports/error-feedback-correction/BUILD_REPORT.md`.

## 12. Acceptance-to-test mapping

| Criterion | Primary evidence | Test location |
| --- | --- | --- |
| AC-01 | Exact labels/order | Node contract + dedicated browser |
| AC-02 | Create with both new strings | Dedicated browser |
| AC-03 | Empty new strings accepted | Dedicated browser |
| AC-04 | Cancel/Escape no write | Dedicated + design-system browser |
| AC-05 | Reload/edit identity/timestamps | Dedicated browser |
| AC-06 | v1 render empty/no write | Dedicated browser |
| AC-07 | v1 explicit update to v2 | Dedicated browser |
| AC-08 | Contextual v1 remains unsynthesized | Node contract + dedicated browser |
| AC-09 | Weak-card provenance/prefill | Dedicated browser |
| AC-10 | Resolve/reopen preserves five values | Dedicated + PWA browser |
| AC-11 | Delete isolation | Dedicated browser |
| AC-12 | Current backup round-trip | Dedicated browser |
| AC-13 | Old backup/no collection compatibility | Dedicated + local-data-safety regression |
| AC-14 | Durable failure rollback/draft/retry | Dedicated browser + storage regressions |
| AC-15 | Controlled offline lifecycle | PWA browser |
| AC-16 | Name/focus/order/Escape/return | Design-system + dedicated browser |
| AC-17 | 360/390/zoom/touch/scroll | Design-system + visual browser |
| AC-18 | No inference/score/cross-domain record | Node + dedicated browser |
| AC-19 | Existing owners/ranking/CRUD remain stable | Canonical regression + scope guard |

## 13. Validation commands

### Focused Node

```powershell
node --test tests/weakness-contract.test.js tests/app-manifest.test.js
```

### Build fixture and functional browser

```powershell
npm run build:test
npx playwright test tests/browser/error-feedback-correction-flows.spec.js --project=chromium --project=mobile --retries=0
```

### Visual/accessibility

```powershell
npx playwright test tests/browser/full-visual-revamp-flows.spec.js --project=chromium --project=mobile --grep "weakness validation" --retries=0
npx playwright test tests/browser/design-system-flows.spec.js --project=chromium --project=mobile --grep "Caderno de erros" --retries=0
```

### Offline and persistence

```powershell
npx playwright test tests/browser/pwa-lifecycle-flows.spec.js --project=chromium --grep "controlled complete cache" --retries=0
npx playwright test tests/browser/local-data-safety-flows.spec.js tests/browser/capability-context-flows.spec.js --project=chromium --retries=0
```

### Canonical gate

```powershell
npm run test:all
```

### Static and scope

```powershell
node --check weakness-feature.js
node --check tests/browser/error-feedback-correction-flows.spec.js
git diff --check
```

Exact passed, failed, and skipped counts must be reported. Conditional skips are not passes.

## 14. Migration and compatibility

### Top-level migration

Not applicable. State remains `compasso.state.v3`; `errorNotebook` already exists.

### Per-record compatibility

- v1 without new fields: valid/readable/editable.
- v1 with valid forward-preserved fields: values render.
- v2 with empty strings: valid explicit save.
- v2 with strings: exact render/edit/backup.
- malformed new fields: empty UI only; no background write.
- contextual v1 writer: unchanged and valid.
- old backup with no `errorNotebook`: existing normalization supplies the established empty collection.

### Forward rollback

The v84 editor uses `Object.assign(existing, payload)` and does not delete unknown properties, so valid v85 fields survive an explicit edit in the older app even if `schemaVersion` becomes 1. v85 therefore reads by property presence rather than numeric version alone.

## 15. Rollout and rollback

Before publication, rollback is the complete 10-path implementation unit.

After v85 exposure, rollback uses a later forward generation containing the reverted presentation/behavior. Never reuse v84/v85 or clear IndexedDB, localStorage, caches, backups, or vault data. Additive fields may remain preserved for a later corrected reader.

Release gates are local canonical tests, separately observed remote Linux CI, and a physical installed-PWA check only if required by release acceptance.

## 16. Security, privacy, performance, and operation

- All text remains local user content in the existing record.
- Rendering uses `escapeHtml`; no HTML interpretation or network transmission is added.
- Bounded strings add negligible storage/render cost.
- No telemetry or logging of user content is added.
- Accessible error status and existing toast are the only failure observability.
- Candidate cloning is proportional to the already-small local state and follows existing feature patterns.

## 17. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Historical `context` is reinterpreted | Its original prompt was “O que aconteceu?”; stored value is unchanged and no migration occurs. |
| New text silently becomes identity judgment | No analysis/rewrite/inference; exact text remains learner-owned. |
| Duplicate save creates two errors | Pending-save guard and functional double-submit test. |
| Failed save leaves false in-memory success | Detached candidate, await, rollback, error focus, retry test. |
| Contextual writer fabricates fields | Frozen owner plus source/behavior compatibility assertions. |
| Longer dialog becomes unusable on mobile | Existing global scroll contract plus 360/390/zoom/touch tests. |
| Rollback hides preserved fields | Presence-based read and forward-rollback documentation. |

## 18. Build stop conditions

Stop and use Iterate if implementation requires:

- new collection/model/route or top-level schema version;
- modification of contextual evaluation/RAG semantics;
- changing weak-topic ranking;
- automatic text rewrite, inference, score, or cross-domain creation;
- CSS, Service Worker, package, storage, foundation, or frozen-owner edits;
- a path outside the 10-path manifest.

## 19. Design gate

- Define clarity 15/15: PASS.
- Repository owners and both writers inspected: PASS.
- Current/target state and save failure path specified: PASS.
- Closed file manifest: PASS — 10 paths.
- All 19 acceptance criteria mapped: PASS.
- Migration, compatibility, forward rollback, offline, accessibility, privacy, and operation addressed: PASS.
- Production code unchanged during Design: PASS.

**Result: Ready for Build.**

The next valid phase is `$sdd-build` using this Design as the sole implementation scope.
