# Error → Feedback → Correction — Define

**Delivery:** 5 — Error → Feedback → Correction
**Status:** Shipped
**Design gate:** PASS — `.sdd/features/error-feedback-correction/DESIGN.md` is Ready for Build with a closed 10-path manifest.
**Roadmap:** Psicocibernética → Compasso
**Priority:** P1
**Date:** 2026-09-20
**Baseline:** `origin/main@5e3d8d2ce2e988e94f1b057adf42382b45152def`
**Predecessor:** Delivery 4 — Weekly Review positiva + KEEP, merged by PR #85

## 1. Purpose

Evolve the existing Caderno de Erros from a loose description of a difficulty into a factual, testable correction loop:

```text
FATO OBSERVADO
→ INTERPRETAÇÃO
→ HIPÓTESE
→ CORREÇÃO
→ PRÓXIMA TENTATIVA
```

The delivery must help the learner separate what happened from the conclusion they are drawing about themselves, then formulate a specific explanation and a next test. It must not classify personality, rewrite the learner's words, or create a psychological score.

## 2. Problem and user

The current Caderno de Erros already supports a title, `context`, `correction`, `nextAction`, an optional linked front, origin card, and open/resolved lifecycle. Its form asks “Erro ou dificuldade”, “O que aconteceu?”, “Qual é a correção?” and “Próxima ação”.

This captures the event and response but has no distinct place for:

- the interpretation the learner is making about the event;
- a specific hypothesis that can be tested.

Without those distinctions, a factual observation and a broad identity conclusion can be mixed into the same text. The target user is the local-first learner who reviews a concrete error and needs to decide what to test next.

## 3. Desired outcome

A manually created or edited error record presents five explicit stages:

1. **Fato observado — O que aconteceu objetivamente?**
2. **Interpretação — Que conclusão você está tirando disso?**
3. **Hipótese — Qual explicação específica pode ser testada?**
4. **Correção — O que deveria acontecer diferente?**
5. **Próxima tentativa — O que você fará?**

The existing record remains the owner. Current properties are reused where their meaning fits:

- `context` → observed fact;
- `correction` → correction;
- `nextAction` → next attempt.

Repository inspection proves that no existing property can hold interpretation and hypothesis separately without conflation or a brittle encoded string. Therefore the existing record may receive only two additive optional strings: `interpretation` and `hypothesis`.

## 4. Prioritized goals

### P0

1. Expose the exact five-stage cognitive structure in create, edit, and record display.
2. Preserve existing record identity, links, source provenance, status, timestamps, and CRUD behavior.
3. Keep legacy v1 records and backups valid without startup migration, backfill, or automatic reinterpretation.
4. Persist learner-authored interpretation and hypothesis only after the existing explicit save action succeeds.
5. Preserve local-first, offline, backup/restore, mobile, and keyboard behavior.

### Success measures

- A learner can record an objective fact, interpretation, hypothesis, correction, and next attempt as distinct content.
- Reload and edit reproduce the exact saved content.
- Missing new properties render as empty controls and do not mutate a legacy record.
- Existing validation remains unchanged; the two new responses do not introduce a new mandatory blocker.
- Existing contextual-evaluation entries remain valid and are not automatically given an interpretation or hypothesis.
- No identity trait, diagnostic label, confidence score, AI output, Capability, or nextAttempt is inferred.

## 5. Scope

### In scope

- Existing Caderno de Erros route, dialog, list, and `errorNotebook` records.
- Exact five-stage labels and short factual guidance.
- Additive optional `interpretation` and `hypothesis` strings on explicitly saved records.
- Creation, rendering, editing, resolution, reopening, deletion, and reload.
- Existing optional links to reading, study, or goal.
- Existing records created from weak-topic cards or contextual explanation gaps.
- IndexedDB-first persistence, exact localStorage fallback, JSON backup/restore, and controlled offline use.
- Keyboard order, dialog semantics, visible focus, Escape/cancel, touch targets, 360–390 px, and 200% zoom.
- Documentation and proportional automated tests.

### Out of scope

- A new route, notebook, collection, model, dashboard, or journal.
- Automatic rewriting of “sou ruim” or any other learner-authored text.
- Psychological diagnosis, personality classification, confidence/self-esteem/happiness scoring, sentiment analysis, or motivational messages.
- AI, embeddings, similarity search, backend, account, cloud sync, or external integration.
- Automatic creation or mutation of Capability, nextAttempt, Evidence, learningSignal, Session, Weekly Review, or Ritual.
- Changing weak-topic ranking, spaced-repetition ratings, Contextual AI evaluation logic, or source generation.
- Behavioral Experiments or Pressure Simulation.
- Broad visual redesign, runtime dependency, framework, or unrelated refactor.

## 6. Requirements

### R-01 — Observed fact

The form must label the existing `context` field as **“Fato observado — O que aconteceu objetivamente?”** and the record display must identify non-empty content as **Fato observado**.

### R-02 — Interpretation

The form must provide a distinct learner-authored field labelled **“Interpretação — Que conclusão você está tirando disso?”** and persist it as `interpretation` only after explicit save.

### R-03 — Testable hypothesis

The form must provide a distinct learner-authored field labelled **“Hipótese — Qual explicação específica pode ser testada?”** and persist it as `hypothesis` only after explicit save.

### R-04 — Correction

The existing `correction` field must be labelled **“Correção — O que deveria acontecer diferente?”** without changing its ownership or validation semantics.

### R-05 — Next attempt

The existing `nextAction` field must be labelled **“Próxima tentativa — O que você fará?”** without changing any Capability or `nextAttempt` record.

### R-06 — Factual summary

The existing title remains the record summary and must use neutral event-oriented guidance. The application must not reject, rewrite, or classify the learner's wording.

### R-07 — Existing validation

The current required fields and save trigger remain authoritative. `interpretation` and `hypothesis` are optional in this slice so historical and quick-capture flows do not gain a new blocker.

### R-08 — Explicit persistence

New content becomes durable only through the existing explicit form submission and existing local save path. Opening, rendering, canceling, or closing the dialog must not write it.

### R-09 — Historical compatibility

A v1 record without new properties must remain readable, editable, resolvable, reopenable, deletable, backup-compatible, and valid. Missing or malformed new properties render empty and are not written until explicit save.

### R-10 — Source compatibility

Entries created by a weak-topic card or contextual explanation gap remain valid. Prefilled factual/correction content stays under its established fields; the application must not synthesize interpretation or hypothesis.

### R-11 — CRUD stability

Editing must preserve `id`, `createdAt`, status, source card, links, and unrelated unknown properties. Resolve/reopen must not change the five text values. Delete must remove only the selected record through the existing behavior.

### R-12 — Data portability

The two additive strings must follow the existing `errorNotebook` record through IndexedDB, exact localStorage fallback, JSON export/restore, merge, and offline reload. Old backups remain restorable.

### R-13 — No cross-domain mutation

Saving or editing the five stages must not mutate `errorEntries`, review cards, Capability, next attempt, Evidence, signals, Session, Notes/vault, or other protected domains except existing explicit link/status behavior.

### R-14 — Accessible responsive use

The dialog must expose an accessible name, meaningful labels, logical focus order, visible focus, native Escape/cancel behavior, and usable controls without global horizontal overflow at 360–390 px and 200% zoom.

### R-15 — Offline/PWA update

If a cached production module changes, the manifest-owned cache generation must advance once. Service Worker behavior must remain unchanged unless Design proves otherwise.

## 7. Business rules

1. A fact describes an observable event; the application provides guidance but does not police semantics.
2. An interpretation is the learner's conclusion, not an application-generated trait.
3. A hypothesis is a testable explanation, not a diagnosis asserted as truth.
4. A correction states what should differ; the next attempt states what the learner will do.
5. The Caderno de Erros owns these fields. They do not become a Capability or Behavioral Experiment automatically.
6. Empty optional interpretation/hypothesis values are valid and distinguishable from automatically generated content because no content is synthesized.
7. Historical `context`, `correction`, and `nextAction` keep their stored values and record identity.
8. Open/resolved remains an explicit lifecycle control, not a judgment about the learner.

## 8. Constraints

- Static vanilla-JavaScript PWA with no production framework or backend.
- Reuse the existing `errorNotebook` collection, route, dialog, and CRUD flow.
- No top-level state schema change, new collection, storage key, index, or migration runner.
- A per-record version change may occur only on explicit save and must not be required for reading valid properties.
- No runtime-injected style may be added. Existing feature styles may be reused; any required durable new style belongs to static design-system CSS.
- Service Worker implementation and ownership remain unchanged unless repository evidence invalidates this assumption.
- No package or runtime dependency changes.
- User content remains local and must not be logged or sent externally.

## 9. Dependencies

- `weakness-feature.js` — record UI, CRUD, weak-topic source, lifecycle, and current per-record version.
- `context-learning-feature.js` — existing v1 contextual-gap writer that must remain compatible.
- `context-rag-feature.js` — existing reader of error records; behavior must remain valid without requiring new fields.
- `state-foundation.js`, `storage.js`, and `index.html` — unchanged state, persistence, backup, and restore owners.
- `app-manifest.js` and `service-worker.js` — cache composition and offline delivery.
- `docs/weakness-error-notebook-feature.md`.
- Node contracts and Playwright browser/PWA/data-safety suites.

## 10. Assumptions

- `context` already represents “O que aconteceu?” closely enough to serve as observed fact without copying or migrating data.
- `correction` and `nextAction` already match correction and next attempt closely enough to reuse.
- Separating interpretation and hypothesis requires distinct optional properties; encoding both into `context` would be ambiguous and brittle.
- Contextual evaluation may continue creating a valid v1 entry. Completing the new fields is a later explicit learner action.
- Current whole-record persistence and JSON serialization preserve additive properties.
- No change to local RAG indexing is required for the MVP; the Caderno itself is the authoritative reading surface.

## 11. Acceptance scenarios

### AC-01 — Exact five-stage structure

**Given** the learner opens a new manual error record, **when** the dialog renders, **then** the five exact stages appear as distinct labelled controls in fact, interpretation, hypothesis, correction, and next-attempt order.

### AC-02 — Create structured record

**Given** valid current required content and one or both new responses, **when** explicit save succeeds, **then** one record contains the existing fields plus the exact learner-authored `interpretation` and `hypothesis` strings.

### AC-03 — Optional new responses

**Given** interpretation and hypothesis are empty and existing required fields are valid, **when** the learner saves, **then** the record is accepted without a new validation blocker.

### AC-04 — No write before save

**Given** the learner types in either new field, **when** they cancel, press Escape, or close without submitting, **then** no `errorNotebook` record or property changes.

### AC-05 — Reload and edit

**Given** a saved structured record, **when** the page reloads and the learner edits it, **then** all five values reappear exactly, the same `id` and `createdAt` are preserved, and explicit save updates `updatedAt`.

### AC-06 — Legacy v1 rendering

**Given** a v1 record without `interpretation` or `hypothesis`, **when** the Caderno and edit dialog render, **then** historical fields retain their exact values, new fields are empty, and no state write occurs.

### AC-07 — Legacy explicit update

**Given** a v1 record, **when** the learner explicitly adds a new response and saves, **then** the same record receives the additive properties and current per-record version without rewriting unrelated fields.

### AC-08 — Contextual-gap compatibility

**Given** an entry created by the existing contextual evaluation flow, **when** it appears in the Caderno, **then** its generated fact/correction/next action remain visible and interpretation/hypothesis remain absent until learner save.

### AC-09 — Weak-topic source compatibility

**Given** a weak-topic card, **when** the learner starts a record from it, **then** existing source, link, and prefilled content remain intact while the two new controls start empty.

### AC-10 — Resolve and reopen

**Given** a structured record, **when** it is resolved and later reopened, **then** all five text values and provenance remain unchanged.

### AC-11 — Delete isolation

**Given** multiple error records and protected-domain data, **when** the learner confirms deletion of one record, **then** only that record is removed and protected domains remain unchanged.

### AC-12 — Current backup round-trip

**Given** a state containing interpretation and hypothesis, **when** JSON export, supported clearing, restore, reload, and re-export occur, **then** the complete record and unrelated data round-trip unchanged.

### AC-13 — Old backup compatibility

**Given** a valid backup containing only v1 error records or no `errorNotebook`, **when** it is restored, **then** the application remains valid and no interpretation or hypothesis is fabricated.

### AC-14 — Persistence failure safety

**Given** both durable backends reject a save, **when** the learner submits a structured record, **then** the application must not claim durable success or corrupt the last valid persisted state; behavior follows the existing save contract and is reported accurately.

### AC-15 — Offline use

**Given** a complete controlled cache and offline device, **when** the learner creates, reloads, edits, resolves, and reopens a structured record, **then** the values remain locally available under the same durability contract.

### AC-16 — Keyboard and dialog semantics

**Given** keyboard-only use, **when** the learner opens, traverses, cancels, or submits the dialog, **then** it has an accessible name, logical focus order, visible focus, native Escape behavior, and safe focus return.

### AC-17 — Mobile and zoom

**Given** 360 px, 390 px, coarse pointer, or 200% zoom, **when** the learner uses all five stages, **then** labels and controls remain readable and operable without global horizontal overflow.

### AC-18 — No inference or psychological output

**Given** any text including “sou ruim”, **when** the record is rendered or saved, **then** the application does not rewrite it, derive an identity trait, produce a score/message, or infer a Capability, signal, Evidence, or nextAttempt.

### AC-19 — Existing behavior remains stable

**Given** legacy/current records and weak-topic analytics, **when** canonical regressions run, **then** ranking, CRUD, links, context search, backup, state v3, fallback, offline composition, and unrelated owners remain compatible.

## 12. Error and recovery scenarios

- Missing, null, object, array, or other malformed new values render as empty controls without mutating the record.
- A canceled or escaped dialog discards the unsaved DOM draft and creates no record.
- Existing native required-field validation remains visible and does not close the dialog.
- A missing linked item degrades to the established independent-record label without recreating the item.
- A missing source card does not invalidate the error record.
- Repeated save must update the selected record rather than duplicate it.
- Old backup restore must not backfill new strings or upgrade record versions silently.
- Offline shell recovery must never clear IndexedDB, localStorage, backups, or unrelated caches.

## 13. Current-state evidence

Repository inspection at `5e3d8d2ce2e988e94f1b057adf42382b45152def` found:

- `errorNotebook` is already a manifest-owned array collection under `compasso.state.v3`.
- `weakness-feature.js` owns manual create/edit/render/resolve/reopen/delete and uses record version 1.
- Current fields are `title`, `context`, `correction`, `nextAction`, link/source metadata, status, and timestamps.
- `context-learning-feature.js` is a second valid writer for contextual gaps and writes v1 records.
- State normalization and backup preserve unknown record properties.
- No dedicated functional Caderno browser spec exists; current coverage is visual-state oriented plus protected-data canaries.
- `.codegraph/` is absent, so source, docs, tests, manifest, and current Git state are authoritative.

Baseline on 2026-09-20:

- branch: `codex/error-feedback-correction`;
- HEAD and `origin/main`: `5e3d8d2ce2e988e94f1b057adf42382b45152def`;
- clean isolated worktree;
- `npm test`: 219 passed, 0 failed, 0 skipped;
- `npm run build:test`: PASS;
- browser dependencies are not installed in this fresh worktree and must be installed from the lockfile before browser validation.

## 14. Migration assessment

A top-level migration is not justified.

The existing collection and whole-record persistence already preserve additive properties. The preferred Design direction is:

1. reuse `context`, `correction`, and `nextAction`;
2. add optional `interpretation` and `hypothesis` to the same record;
3. advance the per-record version only on explicit save;
4. read valid properties by presence rather than requiring a version;
5. do not backfill or rewrite v1 records.

Design must confirm forward rollback, contextual-gap compatibility, exact test seams, and whether the cached module requires one manifest generation advance.

## 15. Verification strategy expected from Design

- Node source contracts for exact labels, additive properties, version, absence of a new domain/score, and manifest generation if changed.
- Dedicated browser flows for create, optional empties, cancel/Escape, reload/edit, v1 render/update, contextual/weak-card sources, resolve/reopen, delete isolation, backup/restore, and failure behavior.
- Controlled PWA offline create/reload/edit lifecycle.
- Existing state foundation, local data safety, context, visual, and critical regressions.
- Keyboard, dialog name/focus, 360/390 px, coarse pointer, and 200% zoom checks.
- Canonical `npm run test:all` gate with exact pass/fail/skip counts.

## 16. Clarity score

| Dimension | Score | Evidence |
| --- | ---: | --- |
| Problem | 3/3 | The missing distinction between fact, interpretation, and hypothesis is explicit and repository-confirmed. |
| Users | 3/3 | The local-first learner reviewing a concrete error is explicit. |
| Goals | 3/3 | Five exact stages, learner control, compatibility, and no inference are bounded. |
| Success | 3/3 | Nineteen measurable happy, legacy, failure, offline, and accessibility scenarios are defined. |
| Scope | 3/3 | Existing owners, two-field boundary, non-scope, migration limits, and protected domains are explicit. |

**Total:** 15/15 — Ready for Design.

## 17. Gate result

**PASS — Define is ready for Design.**

No production code, schema owner, Service Worker, package, commit, push, deployment, or publication changed during Define.

The Design is complete. The next valid phase is `$sdd-build` using `.sdd/features/error-feedback-correction/DESIGN.md` as the sole implementation scope.
