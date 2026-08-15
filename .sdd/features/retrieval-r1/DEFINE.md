# DEFINE: Retrieval R1 — Match retrieval to future use

## Metadata

| Field | Value |
|---|---|
| Feature slug | `retrieval-r1` |
| Initiative | Retrieval aligned to future use |
| Delivery | R1 — Match retrieval to future use |
| Date | `2026-08-12` |
| Status | **Complete (Built)** |
| Clarity score | `15/15` |
| Authoritative input | `.sdd/features/retrieval-r1/BRAINSTORM.md` |
| Repository baseline | `origin/main` at `6047c5fb32aad66ff2892ca4fdbbc7ca5f28ba65` |
| Approved direction | Optional future-use intent belongs to the current Next Attempt and is snapshotted into capability-aware execution |

## Problem statement

Compasso records what the learner wants to become capable of doing, the current Next Attempt, execution through Session or Deep Work, canonical Evidence, learner-confirmed signals, and the explicit Weekly Review decision to keep or revise the attempt. It also provides Active Recall as a question/answer and spaced-repetition mechanism.

The system does not structurally preserve how the learner expects to use the knowledge. The relationship between future performance and present practice may therefore remain implicit in free text. This can make question/card retrieval appear universal even when the capability requires explanation, problem solving, implementation, justified decisions, realistic simulation, or integration across concepts.

Retrieval R1 must add one optional learner-controlled intent to the current Next Attempt and make that intent visible across the existing loop:

```text
Capability
→ Next Attempt + optional futureUse
→ Hoje / Execute
→ Session / Deep Work
→ immutable execution learningContext
→ Evidence through canonical sessionId
→ Weekly Review
→ explicit keep/revise decision
```

R1 records and presents intent. It does not prove retrieval occurred, choose a learning method automatically, route the learner to another feature, grade performance, or turn every Session into retrieval.

## Target users

| User or role | Need | Observable improvement |
|---|---|---|
| Self-directed learner defining a capability | Connect the next practice action to the way knowledge will later be used | Can make one optional plain-language choice while writing the Next Attempt |
| Learner starting work from Hoje or Executar | Retain the intended practice form without repeating setup | Sees the chosen intent as context while existing execution precedence and defaults remain unchanged |
| Learner executing with Session or Deep Work | Remember the intended use during practice | Sees the snapshotted intent without another required classification step |
| Learner interpreting Evidence | Understand Evidence in the historical context in which the execution began | Evidence resolves the immutable execution snapshot through canonical `sessionId` |
| Learner reflecting in Weekly Review | Decide whether to keep or revise both the action and its intended future use | Sees the current intent before the existing explicit keep/revise decision |
| Legacy, offline, mobile, keyboard, zoom, or assistive-technology user | Continue using existing data and flows without new friction | Missing intent remains valid; controls remain local, responsive, named, focus-visible, and operable |

## Stable domain contract

### Canonical values

`futureUse`, when present, is exactly one of these stable internal values:

```text
remember
explain
solve
build
decide
simulate
integrate
```

The keys are persistence values and do not depend on interface language. The initial pt-BR presentation contract is:

| Value | Learner-facing label | Short practice example or guidance intent |
|---|---|---|
| `remember` | Lembrar com precisão | Responder ou reconstruir sem consultar |
| `explain` | Explicar com suas palavras | Explicar o raciocínio sem seguir um roteiro |
| `solve` | Resolver problemas | Resolver um problema novo ou diagnosticar uma falha |
| `build` | Construir ou produzir | Implementar, escrever, projetar ou criar o artefato real |
| `decide` | Decidir e justificar | Analisar alternativas e justificar uma escolha |
| `simulate` | Praticar em condições reais ou de prova | Reproduzir formato, restrições ou sequência da situação futura |
| `integrate` | Conectar e combinar ideias | Usar mais de um conceito em um caso ou problema complexo |

All seven meanings remain distinct in the domain. Presentation may use progressive disclosure for descriptions and examples, but it must not silently collapse, infer, rank, or translate one value into another.

### Ownership and shape

The only current-state owner is the current Next Attempt:

```text
learningOutcome.nextAttempt = {
  id,
  text,
  futureUse?,
  createdAt,
  updatedAt
}
```

The only required historical copy is the immutable execution snapshot:

```text
executionSession.learningContext = {
  outcomeId,
  attemptId,
  attemptText,
  futureUse?
}
```

`futureUse` is not independently owned or duplicated by the capability root, Today/daily plan, Evidence, `learningSignals`, Weekly Review, Active Recall, Weakness/Error Notebook, Studies, Readings, Notes, or Relations.

### Absence and invalid input

- An omitted, blank, or explicitly cleared value means **not specified**.
- Normalized unspecified records omit `futureUse`; they do not store a default such as `remember`, `general`, `unknown`, or Active Recall.
- Loading, importing, or normalizing an unknown value omits only `futureUse` and preserves the otherwise valid containing attempt or execution context.
- An explicit create/update command containing a non-empty unsupported value is rejected without mutating the last valid record.
- No text, resource, Evidence, Session, card, signal, error, history, or activity may be used to infer a value.

## Goals and measurable requirements

### R-001 — Optional learner-owned intent

**Priority:** MUST

**Trigger:** The learner creates or edits a capability's current Next Attempt.

**Expected behavior:** The system offers one optional future-use choice using the seven stable values and plain pt-BR labels. A valid choice persists with the Next Attempt; omission remains valid.

**Prohibited behavior:** No default, inference, score, recommendation, automatic Next Attempt rewrite, or required classification.

**Persistence and legacy:** The choice participates in the existing `learningOutcome` record; legacy attempts without it remain valid.

**Acceptance evidence:** AT-01 through AT-05, ER-01, ER-02.

### R-002 — Low-friction attempt composition

**Priority:** MUST

**Trigger:** The learner opens the existing initial or edit flow for a current Next Attempt.

**Expected behavior:** Future use is presented adjacent to the Next Attempt in the same flow, before or alongside the attempt text so its label/example can guide composition. Changing the choice may change guidance but never changes typed attempt text.

**Prohibited behavior:** No new screen, required wizard, jargon-only label, text classification, blocking consistency check, or automatic method selection.

**Persistence and legacy:** Cancel leaves the stored record unchanged; save failure retains the draft choice and attempt text for retry.

**Acceptance evidence:** AT-01 through AT-04, AT-24, AT-25, ER-02.

### R-003 — Atomic Next Attempt updates

**Priority:** MUST

**Trigger:** A valid future-use choice is added, changed, kept, or explicitly cleared.

**Expected behavior:** Attempt text and future use are validated and saved as one current Next Attempt update. Omitting the field from an internal update that is unrelated to the attempt preserves the current value; explicitly clearing it removes the value. A material text or future-use change advances the attempt and parent record update timestamps under the existing record boundary while preserving existing attempt identity/creation-time behavior.

**Prohibited behavior:** No independently persisted future-use record, field-level tombstone, partial save, or unrelated capability mutation.

**Persistence and legacy:** Existing whole-`learningOutcome` record timestamp merge and outcome tombstone ownership remain authoritative.

**Acceptance evidence:** AT-03, AT-04, AT-16, AT-17, AT-22, ER-01, ER-06, ER-07.

### R-004 — `compasso.state.v3` additive compatibility

**Priority:** MUST

**Trigger:** State is created, normalized, saved, loaded, merged, exported, imported, refreshed, or reopened.

**Expected behavior:** Valid optional `nextAttempt.futureUse` and `learningContext.futureUse` survive all current state-v3 paths; missing or invalid values normalize idempotently as specified without invalidating their containing records.

**Prohibited behavior:** No state-version increment, migration job, new collection, object store, storage key, persistence backend, or destructive rewrite.

**Persistence and legacy:** `compasso.state.v3` remains authoritative. Existing v3 records without the optional field require no migration or backfill.

**Acceptance evidence:** AT-05, AT-19 through AT-23, ER-01, ER-07 through ER-10.

### R-005 — Hoje projection and ownership isolation

**Priority:** MUST

**Trigger:** Hoje projects a valid, current, planned capability attempt whose Next Attempt has a valid future use.

**Expected behavior:** Hoje displays the matching pt-BR future-use context discreetly with that attempt, including when it is the primary action. If the value is absent, Hoje remains complete without a placeholder or inferred category.

**Prohibited behavior:** Future use must not affect Today precedence, stored ordering, completion, primary-state eligibility, task creation, or capability mutation. Today does not persist its own copy.

**Persistence and legacy:** Hoje resolves the value only from the canonical current outcome/attempt when its existing reference is valid; stale, missing, archived, or legacy references acquire no value.

**Acceptance evidence:** AT-06, AT-07, ER-03.

### R-006 — Global Executar remains deterministic

**Priority:** MUST

**Trigger:** The learner activates global `Executar` with or without a specified future use.

**Expected behavior:** Existing resume/start/fallback precedence and focus behavior remain authoritative. A valid planned capability attempt starts through its existing path regardless of whether future use is specified.

**Prohibited behavior:** Future use never routes automatically to Active Recall, exercises, Notes, Contextual AI, resources, Deep Work, or another feature; it never selects an unplanned action.

**Persistence and legacy:** Executar creates no future-use owner and infers nothing for old or unlinked records.

**Acceptance evidence:** AT-07, AT-08, ER-03.

### R-007 — Immediate capability-aware Session context

**Priority:** MUST

**Trigger:** A capability-aware normal Session starts from a current attempt.

**Expected behavior:** The current future use, when specified, is copied into `learningContext` at successful start and presented as contextual information with the attempt. Existing immediate-start defaults and progressively disclosed optional Session configuration remain available without asking the learner to classify again.

**Prohibited behavior:** No additional required setup, automatic mode change, automatic Active Recall start, Session taxonomy, or resource/progress ownership change.

**Persistence and legacy:** An unspecified attempt produces a valid context without `futureUse`; unlinked or resource-only Sessions remain valid and unclassified unless the learner explicitly uses existing capability association behavior.

**Acceptance evidence:** AT-09, AT-11, AT-19, ER-04, ER-08.

### R-008 — Deep Work context without new friction

**Priority:** MUST

**Trigger:** The learner chooses the existing Deep Work path for a capability-aware attempt.

**Expected behavior:** Deep Work receives and presents the same future-use snapshot as normal Session while preserving its current selection, preparation, start, recovery, completion, and canonical synchronization behavior.

**Prohibited behavior:** Future use adds no extra classification step, does not force Deep Work, and does not create a Deep Work-specific intent model.

**Persistence and legacy:** Existing Deep Work records without future use remain valid; canonical execution preserves a valid snapshot when supplied.

**Acceptance evidence:** AT-10, AT-11, AT-19, ER-04, ER-08.

### R-009 — Immutable historical execution snapshot

**Priority:** MUST

**Trigger:** A capability-aware Session or Deep Work execution starts successfully.

**Expected behavior:** Its source record and canonical Execution Session snapshot the current `outcomeId`, `attemptId`, `attemptText`, and optional `futureUse`. Later edits, clears, archive/delete actions, merges, reviews, or new attempts do not rewrite that historical snapshot.

**Prohibited behavior:** No late live lookup may replace the historical future-use value, and no missing current capability may erase it.

**Persistence and legacy:** Snapshot normalization preserves valid values and omits missing/invalid values while retaining a complete core context. Existing source/canonical ownership and synchronization remain unchanged.

**Acceptance evidence:** AT-11, AT-12, AT-13, AT-22, ER-05, ER-07, ER-08.

### R-010 — Evidence uses canonical provenance only

**Priority:** MUST

**Trigger:** Evidence is created or displayed for a completed execution.

**Expected behavior:** Evidence resolves historical future use only through `Evidence.sessionId → canonical execution record → learningContext`; when the path is valid, the historical label may be shown with the Evidence context.

**Prohibited behavior:** Evidence receives no `futureUse` field, direct capability lookup, title/text/time matching, inferred association, consultation-status field, or retrieval-quality score.

**Persistence and legacy:** Missing, invalid, or legacy `sessionId` paths leave Evidence valid and unclassified.

**Acceptance evidence:** AT-13, AT-14, ER-05.

### R-011 — Weekly Review exposes intended use before decision

**Priority:** MUST

**Trigger:** Weekly Review shows an actionable current capability reflection.

**Expected behavior:** The current Next Attempt's specified future-use label appears before its existing keep/revise decision. Supporting execution/Evidence context, when shown, uses each execution's historical snapshot and does not relabel history with the current value.

**Prohibited behavior:** No additional mandatory question, score, automatic conclusion, or replacement of the decision-first ordering.

**Persistence and legacy:** Weekly Review remains the owner of reflection and keep/revise decisions, not of future use; absent current or historical values remain non-blocking.

**Acceptance evidence:** AT-15 through AT-17, ER-05, ER-06.

### R-012 — Keep preserves current intent

**Priority:** MUST

**Trigger:** The learner selects and successfully saves **Manter tentativa atual**.

**Expected behavior:** Current attempt text, future use, identity, and creation/update semantics remain unchanged except for existing review-record behavior.

**Prohibited behavior:** Keep cannot add, infer, clear, or change future use and cannot rewrite historical execution.

**Persistence and legacy:** An unspecified current attempt remains unspecified.

**Acceptance evidence:** AT-16, ER-06.

### R-013 — Revise explicitly controls text and intent

**Priority:** MUST

**Trigger:** The learner selects **Revisar tentativa**.

**Expected behavior:** Weekly Review reveals the existing replacement-attempt input and the optional future-use choice, initialized from the current attempt. On successful explicit save, the learner may change the text, the future use, both, or clear the future use atomically under the existing current-attempt identity contract.

**Prohibited behavior:** No Evidence, signal, review text, or selected decision changes the attempt before successful save; historical execution snapshots remain unchanged.

**Persistence and legacy:** Failure preserves the last valid current attempt and the learner's review draft for retry; legacy unspecified intent can remain absent or be explicitly selected.

**Acceptance evidence:** AT-17, ER-06.

### R-014 — Active Recall remains specialized and independent

**Priority:** MUST

**Trigger:** A future-use value is selected or displayed, or the learner uses Active Recall.

**Expected behavior:** Active Recall retains its explicit question/answer, reveal, learner rating, and spaced-repetition contracts. `remember` guidance may cite questions/cards as an example; explanation prompts may still be deliberately created through existing Active Recall flows.

**Prohibited behavior:** No automatic card creation, route transition, card classification, history backfill, capability score, or claim that cards implement `solve`, `build`, `decide`, `simulate`, or `integrate`. R1 adds no direct future-use-to-Active-Recall action.

**Persistence and legacy:** Existing `reviewItems`, histories, schedules, and Weakness derivation remain unchanged and unclassified by future use.

**Acceptance evidence:** AT-18, ER-09.

### R-015 — Legacy and missing-reference safety

**Priority:** MUST

**Trigger:** Any affected surface receives legacy, absent, invalid, stale, archived, deleted, or unlinked data.

**Expected behavior:** Valid containing records render, execute, normalize, export, restore, and remain historically readable. Missing future use is simply not displayed; invalid future use is omitted safely.

**Prohibited behavior:** No backfill, inferred category, inferred association, destructive migration, blocked execution, crash, record deletion, or automatic relinking.

**Persistence and legacy:** All existing missing-reference and tombstone behavior remains authoritative.

**Acceptance evidence:** AT-05, AT-07, AT-13, AT-19 through AT-22, ER-01, ER-03, ER-05, ER-07 through ER-10.

### R-016 — Local persistence, backup, merge, and offline continuity

**Priority:** MUST

**Trigger:** The learner saves, refreshes, exports/imports JSON, merges state, operates offline, or reopens a supported PWA shell.

**Expected behavior:** Valid current and historical future-use values round-trip without loss through IndexedDB, localStorage compatibility, JSON, current record-level merge, and offline use. A whole-record winning version preserves the internally matched attempt text/future-use pair.

**Prohibited behavior:** No new collection, field-level merge engine, tombstone type, remote dependency, Service Worker redesign, or data clearing.

**Persistence and legacy:** Outcome deletion retains the existing outcome tombstone; execution records retain existing record merge behavior. Equal-timestamp conflicts use existing conflict preservation. A release increments the manifest-owned PWA generation only if Design/Build changes cached application-shell assets.

**Acceptance evidence:** AT-20 through AT-23, ER-07, ER-10.

### R-017 — Accessible and responsive choice and context

**Priority:** MUST

**Trigger:** A learner uses affected controls or context on desktop, at 360–390 px, at 200% zoom, with coarse pointer, reduced motion, keyboard only, or assistive technology.

**Expected behavior:** The optional nature, labels, selection state, guidance, focus, validation, clearing, and saved context are understandable and operable. Focus order follows future-use question/choice, Next Attempt, and save in a logical sequence; dialogs retain existing Escape/cancel and focus-return behavior.

**Prohibited behavior:** No meaning conveyed by color alone, global horizontal overflow, hidden primary action, inaccessible custom control, motion-dependent disclosure, focus loss, or text reset when guidance changes.

**Persistence and legacy:** Accessibility behavior does not create or mutate durable state until the existing explicit save action succeeds.

**Acceptance evidence:** AT-24, AT-25, ER-02, ER-04, ER-06.

### R-018 — Protected domains and ownership remain unchanged

**Priority:** MUST

**Trigger:** R1 data coexists with existing product domains and routes.

**Expected behavior:** Existing Studies, Readings, Sessions, Deep Work, Execution Sessions, Evidence, `learningSignals`, Weekly Review, Active Recall, Weakness/Error Notebook, Notes, Markdown/vault, wikilinks, Relations, graph derivation, Contextual AI, JSON backup/restore, and routes remain available under their existing ownership.

**Prohibited behavior:** No capability progress score, mastery/confidence/completion/ranking/streak, consultation tracking, recommendation engine, automatic weakness inference, automatic Next Attempt change, external AI dependency, backend, framework, telemetry, route retirement, or unrelated redesign.

**Persistence and legacy:** No protected record is reclassified, linked, deleted, or rewritten because future use exists.

**Acceptance evidence:** AT-08, AT-10, AT-14, AT-18 through AT-23, ER-09, ER-10.

## Scope

### In scope

- Stable optional `futureUse` semantics on the current Next Attempt.
- Explicit selection and clearing in existing initial/edit and Weekly Review revise flows.
- Plain pt-BR labels and short modality-specific writing guidance.
- Discreet current-intent projection in Capacidades and Hoje.
- Snapshot projection in capability-aware Session, Deep Work, and canonical Execution Session context.
- Evidence presentation through canonical `sessionId`, without Evidence duplication.
- Weekly Review presentation before keep/revise and atomic keep/revise behavior.
- State-v3 normalization, update, merge, tombstone-boundary, JSON, IndexedDB/localStorage, refresh/reopen, offline, and PWA compatibility.
- Legacy, invalid-value, missing-reference, accessibility, responsive, keyboard, focus, coarse-pointer, reduced-motion, and save-failure behavior.
- Focused regression protection for Active Recall and protected adjacent domains.

### Out of scope

- Recording whether retrieval occurred without consultation, after an initial attempt, or with consultation.
- Retrieval quality, mastery, confidence, competence, completion, percentage, ranking, score, streak, XP, or gamification.
- Modality analytics, transfer analytics, dashboards, or cross-mode weakness inference.
- Recommendation engine, automatic retrieval selection, automatic routing, automatic exercise/card creation, or automatic Next Attempt changes.
- AI-generated exercises or any external AI dependency.
- Anti-Anki-grind behavior, card graduation/combination, Active Recall scheduling redesign, or Weakness/Error Notebook redesign.
- Treating every Session as retrieval or adding a Session-kind taxonomy.
- Direct future-use ownership in Capability root, Today, Session outside `learningContext`, Evidence, Weekly Review, Active Recall, or another collection.
- New collection, object store, storage key, backend, framework, route, top-level module, migration job, or state-version increment.
- Service Worker architecture changes, route retirement, protected-domain redesign, or unrelated visual redesign.
- Retrieval R2 or R3.

## Business rules

| ID | Rule | Rationale |
|---|---|---|
| BR-001 | `futureUse` has exactly seven valid values: `remember`, `explain`, `solve`, `build`, `decide`, `simulate`, and `integrate`. | Stable storage keys must remain independent from labels. |
| BR-002 | Absence means “not specified”; no value is the default. | Preserves optionality and prevents Active Recall from becoming implicit retrieval. |
| BR-003 | The learner is the only source of a future-use value. Text and historical behavior are never classified automatically. | Learner control and no-inference compatibility. |
| BR-004 | The current Next Attempt owns future use; the execution `learningContext` is an immutable historical snapshot. | Matches the decision lifetime and canonical execution provenance. |
| BR-005 | Today, Evidence, learning signals, Weekly Review, cards, errors, resources, Notes, and Relations may project valid context but do not own or duplicate it. | Prevents parallel sources of truth. |
| BR-006 | Omitted update input preserves current future use; explicit blank/null clears it; a supported value replaces it; unsupported explicit commands fail without mutation. Persisted/imported unsupported values normalize to omission while preserving the containing record. | Separates deliberate clearing from malformed external data. |
| BR-007 | A text or future-use change is one atomic Next Attempt change under the existing attempt identity and parent outcome timestamp/merge boundary. | Prevents mismatched text/category pairs and avoids field-level conflict machinery. |
| BR-008 | Execute precedence and fallback do not inspect `futureUse`. | R1 is context, not routing. |
| BR-009 | Session/Deep Work asks no second future-use question. The value is snapshotted only after a valid capability-aware start succeeds. | Preserves immediate start and avoids duplicate decisions. |
| BR-010 | Historical context always wins for an execution and its Evidence; current outcome context always wins for the actionable current Next Attempt. | Prevents later edits from rewriting history. |
| BR-011 | Keep never changes future use. Revise may preserve, replace, or clear it only on successful explicit save. | Weekly Review remains learner-controlled. |
| BR-012 | Active Recall remains question/card retrieval. `remember` may use it as an example, but no value triggers it. | Retrieval is broader than cards. |
| BR-013 | R1 records intended future use, not whether unaided retrieval occurred and not the quality of performance. | Consultation and quality belong to later research. |
| BR-014 | Legacy absence, stale references, missing sources, archived capabilities, and unlinked executions remain valid and are never inferred or backfilled. | Mandatory backward compatibility. |
| BR-015 | Existing whole-record merge, conflicts, and outcome tombstones remain authoritative; R1 adds no field-specific sync behavior. | Smallest additive persistence model. |

## Formal `compasso.state.v3` decision

**Decision:** Preserve `compasso.state.v3`. No state-version increment or migration job is required.

### Repository evidence

1. `storage.js` serializes and stores the complete JSON value in IndexedDB and the bounded localStorage compatibility mirror; it does not impose a fixed field schema.
2. `index.html` exports the complete current state as JSON and normalizes imports; no export envelope or transport schema must change.
3. `app-manifest.js` already catalogs `learningOutcomes` and `executionSessions` as record-timestamp array collections. R1 adds no collection or identity.
4. `state-foundation.js` merges array entries as whole records by existing identity/update timestamps, applies existing collection tombstones, and then normalizes state.
5. `learning-outcome-model.js` and `execution-session-model.js` explicitly normalize nested attempts and `learningContext`. They currently omit unknown fields, so implementation must deliberately accept the seven valid optional values; this is a bounded normalizer extension, not evidence of a storage incompatibility.
6. Existing v3 tests already prove idempotent additive normalization, preservation of legacy domains, JSON round-trip, canonical context round-trip, record merge, conflicts, and tombstones.

### Consequences

- Old v3 data without `futureUse` loads as valid unspecified state.
- New v3 data with a valid value survives the updated normalizers and current storage/export/merge paths.
- Invalid values are isolated to the optional property rather than deleting the attempt, context, or containing record.
- `learningOutcomes` remains the merge/tombstone owner for the current value; execution collections remain owners of historical snapshots.
- A rollback after release must use a compatible forward application generation rather than intentionally running a normalizer known to strip the new optional field. Design must capture this release/rollback detail if cached runtime assets change.

## Constraints and dependencies

| ID | Type | Constraint or dependency | Impact |
|---|---|---|---|
| C-001 | State | `compasso.state.v3` remains authoritative. | Design extends existing normalizers and tests; no migration or version bump. |
| C-002 | Ownership | Current intent belongs only to `nextAttempt`; historical intent belongs only to execution `learningContext`. | No parallel record or duplicated Evidence field. |
| C-003 | Today | Existing primary-state precedence, stored order, reference validation, fallback, and focus behavior remain authoritative. | Projection cannot influence eligibility or execution choice. |
| C-004 | Execution | Existing Session/Deep Work source records and canonical Execution Session remain authoritative. | Snapshot must flow through current adapters and synchronization. |
| C-005 | Evidence | Capability context derives through canonical `sessionId`. | Evidence cannot directly persist or infer future use. |
| C-006 | Signals/review | `learningSignals` consent/merge/tombstone behavior and explicit Weekly Review keep/revise behavior remain unchanged. | Future use informs but never automates decisions. |
| C-007 | Persistence | IndexedDB is primary; localStorage is bounded mirror/fallback; JSON backup/restore and state-foundation merge remain supported. | All valid values and snapshots require round-trip evidence. |
| C-008 | Offline/PWA | App remains fully local-first; current manifest and Service Worker architecture remain authoritative. | Only a cached-asset implementation change justifies a forward generation. |
| C-009 | Accessibility | Existing keyboard, focus, dialog, 360 px, 200% zoom, coarse-pointer, reduced-motion, and color-independent contracts apply. | Selection and projections must fit the current design system. |
| C-010 | Privacy | No external service, AI dependency, telemetry, or remote content processing. | All intent remains local user data. |
| C-011 | Protected domains | Studies, Readings, Notes, vault, wikilinks, Relations, graph, Contextual AI, Active Recall, errors, and all routes remain intact. | R1 requires compatibility canaries, not redesign. |

## Assumptions and risks

| ID | Assumption or risk | Impact if false | Design validation |
|---|---|---|---|
| A-001 | The existing capability editor and Weekly Review revise region can host one optional semantic choice without a new screen. | Product flow would need Iterate before adding navigation. | Verify layout, focus order, and draft preservation in current markup/runtime. |
| A-002 | Current attempt identity remains stable across the shipped revise behavior. | Today reference and current/historical resolution rules would need reassessment. | Trace `updateOutcome`, `capabilityRef`, and Weekly Review save behavior. |
| A-003 | Existing Session and Deep Work adapters can carry an extended normalized `learningContext`. | A parallel context path would violate scope and block Design. | Trace source creation, canonical synchronization, recovery, history, and completion. |
| A-004 | Whole-record merge can preserve the atomic attempt text/future-use pair through existing timestamps. | Field-level merge would broaden persistence scope and require Iterate. | Test newer/older and equal-timestamp outcome/execution records. |
| A-005 | Seven visible choices remain understandable and usable on mobile when descriptions are progressively disclosed. | Define labels may require presentation refinement without changing stable values. | Design prototypes the smallest native/semantic choice pattern at 360–390 px. |
| A-006 | Projecting historical context in Weekly Review can reuse canonical execution/Evidence grouping. | Another durable copy would violate ownership. | Trace weekly grouping and missing-source fallback. |
| A-007 | R1 implementation will change cached runtime assets. | Installed clients require a forward manifest generation. | Design closes the file manifest first, then decides the exact generation identifier. |
| A-008 | Older application code could strip the new field if used as a downgrade normalizer. | A raw Git revert after exposure could lose R1 metadata. | Rollback must be a forward compatible generation that retains the widened normalizers. |

## Acceptance scenarios

| ID | Given | When | Then | Covers |
|---|---|---|---|---|
| AT-01 | The learner creates a capability and selects `solve` | The capability saves successfully | The current Next Attempt persists `futureUse: "solve"`, presents **Resolver problemas**, and no other domain record is created | R-001–R-004 |
| AT-02 | The learner creates a capability without choosing future use | The capability saves successfully | The attempt is valid with `futureUse` omitted, no default is shown or stored, and it remains executable | R-001, R-002, R-004 |
| AT-03 | A current attempt has `futureUse: "explain"` | The learner edits it to `build` and saves | Text and value persist atomically under the existing attempt identity; **Construir ou produzir** is shown | R-001–R-003 |
| AT-04 | A current attempt has a valid future use | The learner explicitly clears it and saves | `futureUse` is omitted, the attempt remains valid, and subsequent surfaces show no inferred category | R-001–R-003 |
| AT-05 | Persisted/imported data contains a valid attempt/context plus an unsupported non-empty future-use value | State normalizes repeatedly | Only the unsupported optional value is omitted; the containing records remain valid and the second normalization is identical to the first | R-004, R-015 |
| AT-06 | Hoje projects a valid current planned capability attempt with `futureUse: "decide"` | Hoje renders | The attempt shows **Decidir e justificar** discreetly in its current/primary context without duplicating the planned action | R-005 |
| AT-07 | Hoje contains resumable work, multiple planned items, completed items, or a stale capability reference | The same data is rendered with and without future use | Primary precedence, stored order, validity, completion, and safe fallback are unchanged; stale/legacy items acquire no inferred value | R-005, R-006, R-015 |
| AT-08 | Global Executar resolves any shipped resume, valid-attempt, other-action, or empty fallback state | The learner activates it | The result and focus match current precedence regardless of future use; no Active Recall, Deep Work, Notes, AI, or resource route is selected by the value | R-006 |
| AT-09 | A valid capability attempt has `futureUse: "build"` | The learner uses the existing immediate normal-Session start | No additional classification is requested; the Session starts with current defaults and shows **Construir ou produzir** as context | R-007 |
| AT-10 | A valid capability attempt has `futureUse: "simulate"` | The learner selects and starts the existing Deep Work mode | No additional future-use step appears; Deep Work starts normally and shows **Praticar em condições reais ou de prova** as context | R-008 |
| AT-11 | A capability attempt with a valid future use starts as Session or Deep Work | Start persistence succeeds | Source and canonical execution contexts contain the exact `outcomeId`, `attemptId`, `attemptText`, and `futureUse` snapshot | R-007–R-009 |
| AT-12 | An execution snapshot contains `futureUse: "solve"` | The learner later edits or clears the current attempt's future use, changes its text, archives/deletes the capability, or completes Weekly Review | The historical source and canonical contexts still contain the original text and `solve` value | R-009, R-015 |
| AT-13 | Evidence has a valid canonical `sessionId` whose execution snapshot contains `futureUse: "explain"` | Evidence is displayed after the current attempt has changed | Its learning context resolves **Explicar com suas palavras** from the historical execution rather than the live outcome | R-009, R-010 |
| AT-14 | Evidence is created for an execution with future-use context | The Evidence record is inspected, saved, exported, and restored | Evidence has no direct `futureUse` or duplicated learning-context field; resolution remains through `sessionId` | R-010, R-018 |
| AT-15 | Weekly Review contains an actionable current attempt and supporting executions whose historical intent may differ | Review opens | The current future use appears before keep/revise; supporting execution/Evidence context retains its own historical future-use label without replacing current intent | R-011 |
| AT-16 | Current attempt text and future use are valid | The learner saves **Manter tentativa atual** | Text, future use, attempt identity, and all historical snapshots remain unchanged | R-012 |
| AT-17 | Weekly Review shows a current attempt | The learner selects **Revisar tentativa**, changes or clears future use and optionally changes text, then saves successfully | The current attempt updates atomically under existing identity rules; prior execution snapshots remain unchanged | R-003, R-013 |
| AT-18 | Any future-use value exists and Active Recall has existing cards/history | Affected surfaces render and the learner uses Active Recall | Cards, schedules, ratings, Weakness derivation, and history remain unchanged and unclassified; no card or route is created automatically | R-014, R-018 |
| AT-19 | Legacy outcomes and execution contexts omit future use | They normalize, render, execute, complete, refresh, and enter Weekly Review | All remain valid and unclassified, with no backfill, blocked action, changed association, or fabricated label | R-004, R-007–R-009, R-015 |
| AT-20 | An old JSON backup contains valid capabilities, Sessions/Evidence, cards, errors, Notes, and no future use | The updated app imports it | All valid data restores; attempts and contexts remain unspecified; protected domains and existing associations are unchanged | R-004, R-015, R-016, R-018 |
| AT-21 | Current state contains valid current and historical future-use values | The app exports JSON, imports that backup, normalizes, saves, reloads, and exports again | Values, absence, execution snapshots, record identities, timestamps, protected data, and canonical Evidence provenance round-trip without loss or duplication | R-004, R-009, R-010, R-016, R-018 |
| AT-22 | Local and incoming state contain different timestamped versions of the same outcome or execution | Existing merge runs | The newer whole record wins with its matched text/future-use pair; tombstones and equal-timestamp conflict preservation behave under existing rules without a field-level mechanism | R-003, R-004, R-009, R-016 |
| AT-23 | A supported application shell is available and state contains R1 values | The learner works offline, refreshes/reopens, starts/completes execution, views Evidence, and reviews the week | The flow and valid values remain available through local persistence with no external dependency or Service Worker architecture change | R-004, R-016, R-018 |
| AT-24 | A keyboard or assistive-technology user creates, edits, clears, executes, and reviews future use | The learner navigates and activates controls | Optionality, names, selection, guidance, errors, focus, and save/cancel results are exposed; native activation works and deterministic focus is retained/restored | R-002, R-017 |
| AT-25 | The affected flow is used at 360–390 px, 200% zoom, coarse pointer, or reduced motion | The learner selects/clears intent, writes an attempt, starts Session/Deep Work, and reviews it | No global horizontal overflow or hidden primary action occurs; touch targets, labels, visible focus, and non-color meaning meet existing contracts without motion dependence | R-002, R-017 |

## Error and boundary scenarios

| ID | Condition | Expected behavior | Covers |
|---|---|---|---|
| ER-01 | A caller explicitly submits a non-empty value outside the seven-value domain during create/update | The command fails with an understandable validation error; no partial outcome change is persisted and focus/error handling follows the existing form contract | R-001, R-003, R-015, R-017 |
| ER-02 | Capability/attempt persistence fails after the learner selects or clears future use | Stored state remains at the last valid version; capability, choice, and attempt drafts remain available for retry; no success is announced | R-002, R-003, R-017 |
| ER-03 | A Today reference is stale, completed, archived, missing, or no longer resolves the canonical current attempt | It retains existing safe informational behavior, gains no future-use value from another attempt, is not made executable, and does not alter Execute fallback | R-005, R-006, R-015 |
| ER-04 | Session or Deep Work start validation/persistence fails | No new source/canonical execution or snapshot is reported as active; origin context remains recoverable and no extra future-use decision is requested | R-007–R-009, R-017 |
| ER-05 | Evidence points to a missing, invalid, legacy, or unlinked canonical execution context | Evidence remains valid and readable without a future-use label; no current capability lookup or inferred association is used | R-009, R-010, R-015 |
| ER-06 | Weekly Review revise has invalid/blank required attempt text or persistence fails | Current text/future use and all historical snapshots remain unchanged; entered review/intent draft is retained where feasible; an accessible error and retry path are provided | R-003, R-011–R-013, R-017 |
| ER-07 | Equal-timestamp or tombstoned records participate in state merge | Existing conflict copies/audit data and collection tombstones are preserved; no field tombstone is added and a deleted outcome is not resurrected because it contains future use | R-003, R-004, R-009, R-016 |
| ER-08 | A valid legacy Session/Deep Work record has a complete core `learningContext` but no future use | Canonical normalization and history preserve the core context as unclassified; the execution is not rejected or retroactively classified | R-007–R-009, R-015 |
| ER-09 | Existing Active Recall, Weakness/Error Notebook, or Contextual AI data coexists with any future-use value | Records, histories, schedules, errors, sources, routes, and backup behavior remain unchanged; no R1 classification or inference is applied | R-014, R-018 |
| ER-10 | Notes/vault/wikilinks/Relations/graph, Studies/Readings, legacy data, unknown compatible top-level state, or offline/PWA state coexists with R1 data | Existing content, routes, ownership, portability, merge, and local availability are preserved without deletion, relinking, or network requirement | R-004, R-015, R-016, R-018 |

## Backup, restore, merge, and tombstone rules

- **Old backup → new app:** missing `futureUse` normalizes to absence. No migration, default, inference, or warning is required for an otherwise valid record.
- **New backup → current app round-trip:** valid current intent and all historical execution snapshots survive export, import, normalization, save, reload, and re-export.
- **Malformed optional value:** the containing valid attempt/context survives; only the malformed optional property is omitted on normalization.
- **Outcome merge:** current attempt text and future use travel inside the whole `learningOutcome` record selected by existing `updatedAt` semantics.
- **Execution merge:** immutable snapshot travels inside the whole Session/Deep Work/canonical execution record; later lifecycle updates retain its original `learningContext`.
- **Equal timestamp:** existing conflict preservation applies; R1 defines no field-level reconciliation.
- **Deletion:** existing `learningOutcomes:<id>` tombstone owns deletion of the current intent with its outcome. Historical execution/Evidence facts remain under their own owners and are not deleted or rewritten.
- **Missing reference:** no title, text, date, resource, Note, Evidence, or card matching is allowed as fallback association.

## Compatibility invariants

- State contract remains `compasso.state.v3`.
- No new collection, IndexedDB object store/version, localStorage key, migration job, backend, or transport envelope.
- Future use is optional and learner-selected; missing means unspecified.
- Only the seven canonical values are valid.
- Current ownership is `learningOutcome.nextAttempt`; required historical ownership is execution `learningContext`.
- Today does not own or copy future use and its precedence/fallback remain unchanged.
- Session, Deep Work, and canonical Execution Session ownership/provenance remain unchanged.
- Evidence contains no future-use field and resolves context only through canonical `sessionId`.
- `learningSignals` consent, merge, conflict, tombstone, source, and lifecycle behavior remain unchanged.
- Weekly Review remains decision-first; only successful explicit revise can change current text/future use.
- Historical snapshots are never rewritten from the current outcome.
- Legacy unlinked Sessions/Evidence and missing references remain valid and unclassified.
- Active Recall remains question/card retrieval; cards and histories receive no future-use backfill.
- Weakness/Error Notebook remains based on its existing sources and contracts.
- No consultation state, quality scoring, mastery, progress, ranking, streak, recommendation, or automatic attempt change.
- IndexedDB, bounded localStorage mirror/fallback, JSON backup/restore, refresh/reopen, and offline operation remain supported.
- Studies, Readings, Notes, Markdown/vault, folders, metadata, wikilinks, Relations, graph derivation, Contextual AI data/routes, and all existing routes remain intact.
- No external service, external AI, telemetry, framework, or Service Worker architecture change.

## Explicit R2/R3 exclusions

The following are not requirements or acceptance criteria for R1:

- unaided/consulted/consulted-after-attempt retrieval state;
- retrieval quality or transfer scoring;
- mastery or confidence estimation;
- modality effectiveness analytics;
- cross-mode weakness inference;
- recommendation or routing engine;
- automatic retrieval selection;
- automatic exercise, case, simulation, or card generation;
- anti-grind scheduling, card graduation, or card combination;
- automatic changes to current or future Next Attempts;
- AI assistance as a dependency.

R1 may preserve future-use intent, execution snapshots, canonical Evidence, existing confirmed signals, and existing review decisions as trustworthy inputs for later research. It computes no R2/R3 conclusion from them.

## Repository evidence inspected

### Product contracts and current implementation

- `AGENTS.md`, `README.md`, and relevant documents under `docs/`.
- `learning-outcome-model.js` and `learning-outcome-feature.js` for attempt normalization, creation/update, identity, timestamps, form behavior, draft handling, and persistence rollback.
- `capability-context-model.js` for Today references, capability references, signals, reflection, legacy/missing-reference behavior, and explicit learner consent.
- `today-feature.js` and `information-architecture-feature.js` for primary-state precedence, global Execute, fallback, and focus.
- `sessions-feature.js`, `deep-work-feature.js`, `execution-session-model.js`, and `execution-session-feature.js` for immediate/default start, optional configuration, source/canonical records, synchronization, recovery, history, and `learningContext`.
- `evidence-feature.js` and `history-evidence-model.js` for completion, Evidence identity, canonical `sessionId`, and contextual projection.
- `recall-feature.js` and `weakness-feature.js` for question/answer cards, spaced review, histories, weak-topic derivation, and Error Notebook independence.
- `weekly-review-feature.js` for decision-first grouping, current-attempt resolution, keep/revise, Evidence/signals, and failed-save rollback.
- `app-manifest.js`, `state-foundation.js`, `storage.js`, `index.html`, and `journal-feature.js` for state v3, collection merge/tombstones/conflicts, IndexedDB/localStorage, JSON export/import, and protected backup data.
- `service-worker.js` and current manifest generation `compasso-pages-v75` for the unchanged PWA architecture boundary.

### Representative current tests

- `tests/learning-outcome-model.test.js`
- `tests/execution-session-model.test.js`
- `tests/state-foundation.test.js`
- `tests/app-manifest.test.js`
- `tests/browser/learning-outcome-flows.spec.js`
- `tests/browser/capability-context-flows.spec.js`
- `tests/browser/information-architecture-flows.spec.js`
- `tests/browser/critical-flows.spec.js`
- `tests/browser/design-system-flows.spec.js`
- `tests/browser/pwa-lifecycle-flows.spec.js`

No `.codegraph/` directory exists in the authoritative clean worktree, so current source and tests were used directly.

## Expected Design/Build validation surface

Design must close an exact manifest. Based on current ownership, it should assess at least:

- pure attempt and execution-context normalization, create/update/clear, idempotence, JSON round-trip, and invalid values;
- source and canonical Session/Deep Work snapshot propagation, recovery, completion, history, and immutability;
- capability create/edit and Weekly Review revise/keep behavior;
- Hoje projection with unchanged primary precedence and Execute fallback;
- Evidence projection through canonical `sessionId` and absence of duplicated fields;
- state-v3 storage, merge winner, equal-timestamp conflict, tombstone, legacy, and protected-domain preservation;
- old backup import and new backup round-trip;
- Active Recall/Weakness isolation and no automatic card or route;
- refresh/reopen and full offline PWA journey;
- keyboard order, accessible names/states, error announcements, focus preservation/return, 360–390 px, 200% zoom, coarse pointer, reduced motion, long text, and no horizontal overflow;
- canonical repository regression commands from `package.json`: focused Node/browser checks followed by `npm run test:all` during Build/Ship.

## Design questions

No product decision blocks Design. Design must determine, without changing this contract:

1. The smallest existing-model extension for the seven-value normalizer and atomic update semantics.
2. The exact semantic control and progressive guidance presentation in capability create/edit and Weekly Review revise flows.
3. The exact current projection points in capability cards, Hoje primary/list state, Session companion/Deep Work, Evidence context, and Weekly Review without visual duplication.
4. The existing adapters/events through which `learningContext.futureUse` reaches source and canonical execution and remains immutable through lifecycle updates.
5. The exact merge, conflict, import, missing-reference, and failed-save test fixtures.
6. The closed implementation/test file manifest and dependency order.
7. Whether the closed runtime manifest changes cached app-shell assets; if so, the exact forward generation after current `compasso-pages-v75`, with unchanged Service Worker architecture.
8. The forward-compatible rollback unit that preserves valid R1 fields after exposure.

## Clarity score

| Dimension | Score (0–3) | Explicit evidence |
|---|---:|---|
| Problem | 3 | The gap between future performance demand and current practice is explicit and grounded in current free-text attempts and specialized Active Recall behavior. |
| Users | 3 | Capability planning, execution, Evidence, reflection, legacy, offline, mobile, keyboard, zoom, and assistive-technology needs are identified. |
| Goals | 3 | Eighteen measurable requirements define ownership, optionality, values, projections, snapshots, decisions, compatibility, accessibility, and protected boundaries. |
| Success | 3 | Twenty-five acceptance scenarios and ten error/boundary scenarios specify observable happy paths, recovery, history, storage, offline, and accessibility evidence. |
| Scope | 3 | R1 scope, ownership exclusions, state-v3 decision, protected domains, and explicit R2/R3 deferrals are unambiguous. |
| **Total** | **15/15** | Minimum for Design: 12. No blocking requirement decision remains. |

## Revision history

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-08-12 | Codex | Defined Retrieval R1 from the confirmed direction B; established 18 requirements, 25 acceptance scenarios, 10 error/boundary scenarios, seven stable values, state-v3 compatibility, historical snapshot immutability, and R2/R3 exclusions. |
| 1.1 | 2026-08-12 | Codex | Design completed against the current repository; requirements and acceptance scenarios are unchanged and ready for Build under the closed DESIGN.md manifest. |
| 1.2 | 2026-08-12 | Codex | Build completed under the closed manifest; all 25 acceptance and 10 error/boundary scenarios are implemented and validated without changing the requirements contract. |

## Define gate

**Define status: Complete (Built).**

No unresolved blocker remains before Ship verification.

## Next skill

Use `$sdd-ship .sdd/features/retrieval-r1/`.
