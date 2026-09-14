# Evidence-Based Calibration — Design

**Delivery:** 1 — Evidence-Based Calibration
**Status:** Shipped
**Roadmap:** Psicocibernética → Compasso
**Date:** 2026-09-14
**DEFINE:** `.sdd/features/evidence-based-calibration/DEFINE.md`
**Implementation baseline:** `bc53712eb105ac02b525ffaec8b42d58d1feea14`
**Branch:** `codex/evidence-based-calibration`

## 1. Design gate and inspection evidence

The DEFINE has clarity **15/15**, sixteen measurable requirements, sixteen acceptance scenarios, explicit recovery behavior, and no unresolved product question.

Repository inspection was performed in the clean worktree:

`C:\Users\Giuse\OneDrive\Documentos\Every Second Counts\every-second-counts-app-evidence-based-calibration`

Evidence:

- branch `codex/evidence-based-calibration`, tracking `origin/main`;
- HEAD and revalidated remote `main`: `bc53712eb105ac02b525ffaec8b42d58d1feea14`;
- worktree clean before SDD artifact creation;
- `.codegraph/` absent, so direct source, docs, manifest, tests, workflow, and archived SDD artifacts are authoritative;
- baseline from the same SHA: 213 Node passed; 237 browser passed, 23 intentionally skipped; 0 failed;
- runtime/test commands are defined by `package.json` and `AGENTS.md`.

Inspected owners:

- `evidence-feature.js`;
- `learning-outcome-feature.js`;
- `capability-context-model.js`;
- `app-manifest.js`;
- `service-worker.js`;
- `state-foundation.js`;
- `storage.js`;
- `index.html`;
- `docs/evidence-feature.md`;
- `docs/capability-first-compasso.md`;
- `tests/app-manifest.test.js`;
- `tests/service-worker-composition.test.js`;
- `tests/browser/capability-context-flows.spec.js`;
- `tests/browser/pwa-lifecycle-flows.spec.js`;
- `tests/browser/design-system-flows.spec.js`;
- `tests/browser/local-data-safety-flows.spec.js`;
- shipped Capability-first Compasso DEFINE/DESIGN and repository Local Data Safety contracts.

The skill packages reference `templates/DEFINE_TEMPLATE.md` and `templates/DESIGN_TEMPLATE.md`, but those template files are absent from their installed directories. The artifacts use the complete skill contracts and the repository's shipped SDD structure.

## 2. Current state and concrete gap

### 2.1 Existing completion flow

`evidence-feature.js` already:

1. creates Evidence only through the existing Session finish candidate;
2. emits `execution:recorded` only when the finish operation succeeds;
3. opens an ephemeral nonmodal `#executionCompletionPanel`;
4. derives Capability context from canonical execution state;
5. offers Today, generic signal, and Capability actions;
6. opens the existing signal dialog through `learningSignal.open`;
7. keeps Session/Evidence intact when signal persistence fails.

### 2.2 Existing signal flow

`learning-outcome-feature.js` already owns:

- the modal signal dialog;
- active-Capability validation;
- focus entry and return;
- Cancel/Escape behavior;
- explicit submit;
- candidate-state persistence and rollback;
- `learning-signal:saved`;
- generic signal create/edit/delete behavior.

`capability-context-model.js` already supports the exact durable representation needed:

- `kind: 'insight'`;
- `origin: 'learner'`;
- `sourceRef: { type: 'evidence', id }`;
- stable `capabilityRef`;
- schema version 1 and current state-v3 merge/tombstone behavior.

### 2.3 Gap

The post-Evidence action currently opens the generic signal dialog with:

- `Registrar sinal`;
- `O que deve informar sua próxima decisão?`;
- Evidence summary prefilled;
- kind derived from Evidence type;
- `origin: 'confirmed-suggestion'`.

That behavior treats Evidence content as a suggested signal. Evidence-Based Calibration instead requires a blank, learner-authored insight answering one specific question. A new data concept would duplicate existing ownership; a presentation-only specialization closes the gap.

## 3. Target architecture

```text
Session finish candidate
  └─ persists Session + canonical execution + Evidence
       └─ emits execution:recorded
            └─ evidence-feature resolves active Capability
                 ├─ no Evidence: preserve generic execution signal action
                 ├─ ineligible Evidence: omit calibration
                 └─ eligible Evidence: show secondary calibration action
                      └─ learningSignal.open
                           presentation: evidence-calibration
                           kind: insight
                           text: empty
                           origin: learner
                           sourceRef: exact Evidence
                                ├─ cancel/Escape: discard runtime input
                                ├─ save failure: keep draft, no promotion
                                └─ explicit save: existing learningSignal record
```

Responsibilities remain with existing owners:

| Responsibility | Owner |
|---|---|
| Determine whether completion has an exact Evidence and active Capability | `evidence-feature.js` |
| Present the secondary action and create the command payload | `evidence-feature.js` |
| Own dialog mode, copy, fields, focus, submit, retry, and reset | `learning-outcome-feature.js` |
| Validate/create the durable insight and Capability reference | Existing `capability-context-model.js` |
| Persist/rollback candidate state | Existing `learning-outcome-feature.js` + storage service |
| Cache generation and composition identity | `app-manifest.js` |
| Offline install/activation behavior | Existing `service-worker.js` |
| Durable Evidence fact | Existing Evidence/Session owners, unchanged |

## 4. Interface design

### 4.1 Internal command

Extend the existing internal command payload without creating a second command:

```js
CompassoFeatures.execute('learningSignal.open', {
  outcomeId,
  sourceRef: { type: 'evidence', id: evidence.id },
  kind: 'insight',
  text: '',
  origin: 'learner',
  presentation: 'evidence-calibration',
  trigger
});
```

`presentation` is ephemeral UI configuration. It is never copied into state or the signal record. Missing/unknown values use the existing generic presentation.

The command remains responsible for revalidating the active outcome before opening. `evidence-feature.js` also revalidates execution, Evidence, and active Capability when the action is invoked.

### 4.2 Dialog presentation modes

`learning-outcome-feature.js` defines two internal modes:

| Mode | Use | Title | Field label | Type control | Submit label |
|---|---|---|---|---|---|
| `default` | Existing generic create/edit | Existing copy | Existing copy | Visible | Existing copy |
| `evidence-calibration` | New eligible post-Evidence create only | `Calibrar com evidência` | `O que esta evidência demonstra que você já consegue fazer?` | Hidden; value fixed to `insight` | `Salvar reflexão` |

The specialized mode shows neutral provenance/help equivalent to:

`Sua resposta será ligada à Evidence salva. Ela só existe depois de você confirmar e não altera a próxima tentativa.`

The textarea starts empty and receives initial focus. Evidence remains visible in the nonmodal completion panel behind the modal; the app does not duplicate Evidence text into the textarea.

Edit operations always use `default` mode. A previously saved insight remains an ordinary editable/removable learning signal; calibration is an entry context, not a new signal subtype.

### 4.3 Runtime state

Extend `learningOutcomeRuntime` with one non-durable field:

```js
signalPresentation: 'default'
```

`outcomeOpenSignal` selects the mode only for a new record with:

- `presentation === 'evidence-calibration'`;
- `sourceRef.type === 'evidence'`;
- `kind === 'insight'`;
- empty text;
- learner origin;
- active Capability.

If the payload does not satisfy the contract, it falls back to the generic mode or refuses to open under existing invalid-context rules.

`outcomeCloseSignal` resets all title, label, hidden/disabled state, button text, provenance, and `signalPresentation` to defaults. This prevents contextual copy leaking into later generic signal actions.

### 4.4 Completion actions

`renderEvidenceCompletion` uses three branches:

1. **Evidence + active Capability:** primary `Voltar para Hoje`, secondary `Refletir sobre esta evidência`, optional quiet `Abrir capacidade`.
2. **No Evidence + active Capability:** preserve existing generic `Registrar sinal` behavior for execution-only completion.
3. **Inactive/missing/unlinked Capability:** no new signal/calibration action; preserve Today and available historical navigation.

The Evidence branch uses a dedicated delegated action selector, `[data-completion-calibration]`. The existing `[data-completion-signal]` handler remains the generic execution path.

After `learning-signal:saved` for the current Evidence, the completion status becomes neutral confirmation such as:

`Reflexão salva após sua confirmação. A próxima tentativa não foi alterada.`

The event and source-reference matching remain unchanged.

## 5. State and data transitions

### 5.1 Successful transition

```text
S0 durable Session/Evidence, zero new signal
→ learner opens calibration
S1 ephemeral dialog draft, durable state unchanged
→ learner submits valid text
S2 candidate = clone(S0) + one existing learningSignal
→ durable save succeeds
S3 candidate promoted; dialog closes; saved event emitted
```

New record shape uses the existing contract:

```js
{
  id,
  schemaVersion: 1,
  capabilityRef: {
    outcomeId,
    attemptId,
    attemptText
  },
  kind: 'insight',
  text: learnerText,
  sourceRef: {
    type: 'evidence',
    id: evidence.id
  },
  origin: 'learner',
  createdAt,
  updatedAt
}
```

### 5.2 Cancel transition

```text
S0 durable Session/Evidence
→ open/type
→ Cancel or Escape
→ close and reset ephemeral mode/draft
→ S0 unchanged
```

No tombstone is created because no durable signal existed.

### 5.3 Save failure

```text
S0 durable Session/Evidence
→ construct candidate with signal
→ persistence fails
→ existing candidate rollback restores S0
→ modal remains open with typed DOM value and accessible error
```

No new compensation design is introduced. The existing candidate persistence owns rollback. Existing durable Session/Evidence are outside the failed signal candidate's promotion and remain intact.

### 5.4 Refresh

The dialog and text are intentionally runtime-only. Refresh closes/discards them and loads the last durable state. A successfully saved insight reloads through existing normalization.

## 6. Eligibility and missing-reference rules

Calibration eligibility is true only when all are true at action/render time:

1. `evidenceCompletionRuntime.evidenceId` resolves a current Evidence;
2. its completion Session resolves a canonical execution;
3. execution context resolves a complete `capabilityRef`;
4. the referenced outcome exists and is active;
5. the existing resolver recognizes the referenced attempt under its shipped rules.

No fallback uses Evidence `domain`, `itemId`, summary, timestamps, resource links, or string similarity.

| Condition | Result |
|---|---|
| Evidence missing | Preserve generic execution-only signal if otherwise eligible |
| Canonical execution missing | No calibration |
| Capability missing | No calibration; historical Evidence remains |
| Capability archived | No new calibration; existing navigation/history behavior remains |
| Attempt unavailable/stale | No calibration unless existing resolver still marks the reference active/current |
| Legacy unlinked Evidence | No calibration |
| Source disappears after a saved insight | Existing independently owned signal remains editable/removable |

## 7. UI, accessibility, and mobile

No new route, wizard, panel, or modal is created.

The delivery reuses:

- existing nonmodal completion section;
- existing modal signal dialog;
- existing primary/secondary/quiet button hierarchy;
- native dialog semantics and current Cancel/Escape listener;
- current focus-visible and coarse-pointer design-system rules.

Required checks:

- calibration action follows the primary Today action;
- exact textarea label is programmatically associated;
- initial focus lands in the empty textarea;
- Escape and Cancel return focus to the invoking calibration button;
- after successful save, focus moves to the existing Today action;
- hidden type label/control are removed from the accessibility tree in specialized mode and restored in generic mode;
- invalid/failed save focuses the textarea and exposes the existing alert;
- 360–390px, mobile project, long text, coarse pointer, and 200% zoom have no global horizontal overflow;
- no meaning depends on color or animation.

The current layout already passes generic completion/dialog mobile tests. Text, visibility, and button-label changes do not justify a CSS edit. If Build reveals a CSS need, it must stop and use SDD Iterate because `design-system.css` is not in the manifest.

## 8. Persistence and compatibility

### 8.1 Schema

No migration is applicable.

Unchanged:

- `compasso.state.v3`;
- `compasso.app.v1`;
- IndexedDB `compasso-db` version 1;
- storage schema 1;
- Evidence schema 2;
- learning signal schema 1;
- collection catalog;
- merge/tombstone rules;
- backup root and normalization;
- Markdown/vault format.

### 8.2 IndexedDB and localStorage

The existing save path remains the only authority:

- IndexedDB success is durable;
- exact localStorage fallback success is durable;
- memory-only retention is failure;
- failed candidate promotion restores prior state.

No storage code or object store changes are authorized.

### 8.3 Backup/restore

The saved calibration is an existing `learningSignals` record, already included in JSON state export and normalization. Tests must prove:

- an old backup with no `learningSignals` still restores;
- a saved calibration survives export/restore;
- unrelated Notes/vault/Relations canaries remain;
- no response is reclassified or inferred during restore.

### 8.4 Markdown/vault

Not applicable to the new reflection directly: the existing vault exporter does not own learning signals. All Markdown, note, folder, wikilink, source-link, and derived-graph behavior remains frozen and must be preserved by regression canaries.

## 9. PWA and cache design

Production modules `evidence-feature.js` and `learning-outcome-feature.js` change, so Build advances:

`compasso-pages-v80 → compasso-pages-v81`

`tests/app-manifest.test.js` must update its exact expected generation.

No module, asset, composition order, collection, manifest API version, or state contract changes. `service-worker.js` remains unchanged.

Existing composition and lifecycle tests prove:

- every cached asset is complete;
- candidate install fails atomically when composition/assets are incomplete;
- only owned old cache generations are removed;
- controlled offline startup reports the coherent generation;
- user storage is independent from cache replacement.

If the implementation base changes before Build, stop and revise the exact generation decision instead of reusing or skipping a published generation.

## 10. Significant decisions and rejected alternatives

| Decision | Rationale | Rejected alternative |
|---|---|---|
| Reuse existing learning signal | Exact durable semantics, provenance, merge, edit/delete, and backup already exist | New calibration field, collection, or Evidence property |
| Specialize one existing command with ephemeral mode | Smallest integration; no parallel dialog or persistence | New command/model/modal |
| Blank learner-authored text | Preserves event-versus-interpretation boundary and explicit authorship | Prefill/copy Evidence or generate motivational text |
| Fixed `insight` kind and learner origin | Matches the requested reflection without identity scoring | Derive kind from Evidence or mark as confirmed suggestion |
| Dedicated calibration action only with Evidence | Keeps generic execution signal behavior and avoids semantic overload | Rename every signal entry point |
| Exact canonical reference only | Preserves shipped no-inference contract | Link by domain, item, keywords, or timestamps |
| No CSS change | Existing primitives already satisfy the structural need | Unrelated redesign or new component system |
| Forward manifest generation v81 | Cached production JavaScript changes | Reuse v80 or modify Service Worker version logic |
| No schema migration | Existing model is sufficient | State v4, DB upgrade, or background rewrite |

## 11. Security, privacy, performance, and operations

- **Security/privacy:** learner text remains local; no external request, telemetry, analytics, permission, credential, or content-bearing log.
- **Performance:** only constant-time runtime fields and existing array lookups in a one-shot completion flow; no embeddings, index, polling, or background work.
- **Observability:** existing alert/status and feature-runtime error behavior; no learner text in diagnostics.
- **Operations:** static files only; no package, lockfile, dependency, CI, backend, environment, or deployment change.
- **Data safety:** no write occurs until explicit submit; source records remain separately owned.
- **Publication:** commit, push, merge, Pages, and release remain outside Build authorization.

## 12. Closed Build file manifest

The product/test/documentation manifest is closed at **8 exact paths**.

| # | Action | Exact path | Purpose | Dependencies | Acceptance coverage |
|---:|---|---|---|---|---|
| 1 | Modify | `evidence-feature.js` | Eligible completion branch, secondary calibration action, revalidation, specialized command payload, neutral saved status; preserve generic no-Evidence signal | Existing completion context and signal command | AC-01–AC-03, AC-06–AC-10, AC-15 |
| 2 | Modify | `learning-outcome-feature.js` | Ephemeral presentation mode, exact label, empty insight, hidden/restored type control, submit copy, focus/reset, existing persistence | 1; existing signal model and candidate save | AC-03–AC-09, AC-14, AC-15 |
| 3 | Modify | `app-manifest.js` | Advance cache generation v80→v81 only | 1–2; manifest ownership | AC-13, AC-16 |
| 4 | Modify | `docs/evidence-feature.md` | Document optional calibration, authorship, provenance, failure, and unchanged Evidence | 1–2 | AC-01–AC-12 |
| 5 | Modify | `docs/capability-first-compasso.md` | Document calibration as an existing learner insight, not a score/state | 1–2 | AC-06, AC-07, AC-11, AC-12 |
| 6 | Modify | `tests/app-manifest.test.js` | Assert exact v81 and unchanged manifest/state ownership | 3 | AC-16 |
| 7 | Modify | `tests/browser/capability-context-flows.spec.js` | Happy, cancel, failure/retry, source isolation, legacy, generic regression, mobile/a11y, backup | 1–2 | AC-01–AC-12, AC-14, AC-15 |
| 8 | Modify | `tests/browser/pwa-lifecycle-flows.spec.js` | Exercise cached offline Session → Evidence → calibration → refresh | 1–3 | AC-13, AC-16 |

Standard SDD Build evidence may create `.sdd/reports/evidence-based-calibration/BUILD_REPORT.md`. It does not expand the product manifest.

### 12.1 Frozen paths

Build must not modify:

- `capability-context-model.js`;
- `learning-outcome-model.js`;
- `history-evidence-model.js`;
- `sessions-feature.js`;
- `execution-session-model.js`;
- `execution-session-feature.js`;
- `deep-work-feature.js`;
- `state-foundation.js`;
- `storage.js`;
- `index.html`;
- `service-worker.js`;
- `app-composition.js`;
- `design-system.css`;
- backup/vault/Notes/Relations code;
- package/lock files, Playwright config, CI, snapshots, dependencies;
- other roadmap deliveries and archived SDD artifacts.

If any frozen or unlisted path becomes necessary, stop Build and use `$sdd-iterate`.

## 13. Dependency-ordered implementation sequence

1. Add/adjust browser assertions that describe the new post-Evidence semantics and generic regression; confirm they fail for the intended reason on v80.
2. Implement the specialized completion branch and command payload in `evidence-feature.js`.
3. Implement/reset the ephemeral dialog presentation in `learning-outcome-feature.js`.
4. Run focused capability browser tests in Chromium; resolve only in-manifest defects.
5. Advance manifest generation and its exact Node expectation to v81.
6. Update Evidence and Capability documentation.
7. Extend the PWA offline scenario and run focused Chromium/mobile/PWA checks.
8. Run the full canonical regression and write the Build report. Stop before Ship, commit, push, or publication.

## 14. Test plan and commands

### 14.1 Focused static/model safety

```powershell
node --test tests/capability-context-model.test.js tests/state-foundation.test.js tests/history-evidence-model.test.js tests/storage-quota.test.js tests/app-manifest.test.js tests/service-worker-composition.test.js
```

This proves unchanged signal validation/provenance, state-v3 normalization, Evidence shape, durable fallback, exact manifest generation, and composition/lifecycle contracts.

### 14.2 Focused browser behavior

```powershell
npm run build:test
npx playwright test tests/browser/capability-context-flows.spec.js --project=chromium
npx playwright test tests/browser/capability-context-flows.spec.js --project=mobile
```

Required deterministic assertions:

- completion is already durable before calibration;
- eligible action hierarchy and exact label;
- textarea initially empty;
- zero signals before submit;
- Cancel/Escape and focus return;
- one explicit learner insight with exact Evidence source;
- complete source-object equality before/after, excluding only learningSignals;
- persistence failure retains text and source durability;
- retry creates one record;
- missing/legacy/archived context has no action;
- generic signal entry retains current behavior;
- 200% zoom, long text, touch target, and no overflow.

### 14.3 Focused offline/PWA

```powershell
npx playwright test tests/browser/pwa-lifecycle-flows.spec.js --project=chromium --grep "controlled complete cache reopens offline"
node --test tests/app-manifest.test.js tests/service-worker-composition.test.js tests/bootstrap-recovery.test.js
```

The PWA case must begin from a complete cached shell, transition offline, finish a capability Session with Evidence, save calibration, refresh/reopen under control, and verify the insight, Evidence, Session, and unrelated local data.

### 14.4 Persistence/backup/accessibility regressions

```powershell
npx playwright test tests/browser/local-data-safety-flows.spec.js --project=chromium
npx playwright test tests/browser/design-system-flows.spec.js --project=chromium --project=mobile
```

The capability spec owns the exact calibration backup round-trip and focus checks; these suites guard the shared restore and design-system contracts.

### 14.5 Full gate

```powershell
npm run test:all
git diff --check
```

Automated tests do not substitute for a later human installed-PWA close/reopen observation if Ship or publication requires it.

## 15. Acceptance traceability

| AC | Implementation owner | Evidence |
|---|---|---|
| AC-01 no calibration | completion feature | Capability browser: finish, return/dismiss, zero signal |
| AC-02 eligibility | completion feature | Capability browser: active linked Evidence versus ineligible matrices |
| AC-03 exact/empty UI | both features | Browser label, focus, value, action order |
| AC-04 no pre-submit save | signal dialog owner | Active/durable state check while typed |
| AC-05 Cancel/Escape | signal dialog owner | Browser zero record/tombstone and focus return |
| AC-06 explicit save | existing model through dialog | Browser exact signal shape and source |
| AC-07 source isolation | both features | Deep equality of source domains |
| AC-08 failure | existing candidate persistence | Injected storage failure and retained DOM draft |
| AC-09 retry | dialog owner | Failed save then successful submit yields one signal |
| AC-10 ineligible context | completion resolver | Missing/archived/legacy browser fixtures |
| AC-11 legacy | frozen normalization + UI eligibility | Existing Node/state plus browser no-inference |
| AC-12 backup | existing JSON path | Capability backup export/restore canaries |
| AC-13 offline | PWA lifecycle spec | Cached offline finish/save/reload |
| AC-14 interaction | existing dialog/design system | Chromium/mobile keyboard, focus, zoom, targets, geometry |
| AC-15 generic signal | dialog default mode | Existing generic create/edit/delete tests remain and gain reset assertion |
| AC-16 PWA generation | manifest + existing SW | Exact v81 Node tests, composition, controlled offline test |

**Traceability: 16/16 acceptance scenarios have an implementation owner and deterministic evidence.**

## 16. Migration, rollout, and rollback

### 16.1 Migration

Not applicable. No new field, collection, schema, state version, database version, store, key, backup envelope, or derived legacy association exists.

### 16.2 Rollout

Build creates a static v81 candidate in the feature worktree. Build does not commit, push, merge, deploy, or publish. Ship later verifies all acceptance evidence and records any human PWA limitation separately.

### 16.3 Rollback

Before publication, revert the eight manifest paths as one coherent unit.

After v81 is exposed to clients, rollback is forward-only: publish a later coherent generation containing the reverted presentation. Do not reuse v80/v81, clear user persistence, or couple cache cleanup with data deletion.

Saved calibration insights remain readable by the baseline because they conform to the pre-existing learning signal schema.

## 17. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Specialized copy leaks into generic dialog | Central default presenter and complete reset on close |
| Evidence text becomes an implicit answer | Empty payload plus browser assertion |
| Archived/stale Capability receives new signal | Revalidate on render and click through existing resolver |
| Generic execution-only signal regresses | Separate selectors/branches and explicit regression |
| Signal failure appears to undo Evidence | Source deep-equality and injected failure tests |
| Extra action competes with Today | Existing secondary button after primary action |
| Small viewport overflows with long Portuguese copy | Existing wrapping plus mobile/200% geometry test |
| Cached v80 serves old behavior | Manifest-owned v81 and composition/PWA tests |
| New schema accidentally introduced | Frozen model/state/storage/index paths and manifest assertions |
| Main drifts before Build | Revalidate base; Iterate the Design if generation or owners changed |

## 18. Build stop conditions

Stop and use `$sdd-iterate` if Build requires:

- a new schema, collection, model, Evidence field, or migration;
- a file outside the eight exact manifest paths;
- CSS or a new modal/panel/route;
- changes to storage, backup/restore, Service Worker logic, or composition;
- an inferred Capability/Evidence association;
- a behavioral change to other roadmap deliveries;
- a dependency, framework, external service, AI, telemetry, or backend;
- a different cache generation because the implementation base changed;
- destructive Git/data action, commit, push, merge, deployment, or publication.

## 19. Design quality gate

- DEFINE clarity: 15/15.
- Repository inspected: PASS.
- Current gap and target responsibilities: PASS.
- Interfaces, transitions, errors, and missing references: PASS.
- Closed file manifest: 8 exact product/test/doc paths.
- Acceptance mapping: 16/16.
- Migration/compatibility/backup/offline: PASS; no migration.
- Accessibility/mobile plan: PASS.
- Rollout/rollback: PASS.
- Build order and commands: evidence-backed.
- Open blocker: none.

**Readiness: PASS — Shipped through SDD and archived.**

## 20. Revision history

| Revision | Date | Change |
|---|---|---|
| 1.0 | 2026-09-14 | Initial repository-grounded DESIGN for optional post-Evidence calibration. |
| 1.1 | 2026-09-14 | Build completed within the eight-path manifest; 16/16 acceptance scenarios and full regression passed. |
| 1.2 | 2026-09-14 | Ship reconciled the implementation with the closed manifest and archived this artifact. |
