# DEFINE: Encoding E1 — Learn-to-Learn Study Ritual

## Metadata

| Field | Value |
|---|---|
| Feature slug | `encoding-e1` |
| Initiative | Encoding aligned to active processing |
| Delivery | E1 — Contextual manual checkpoint during execution |
| Date | `2026-08-16` |
| Status | **Complete (Built)** |
| Clarity score | `15/15` |
| Authoritative input | `.sdd/features/encoding-e1/BRAINSTORM.md` |
| Repository baseline | `origin/main` at `cb7e8baf9b3df4c08269610e9c4a3e032668a4f8` |
| Approved direction | Explicitly Ritual-enabled, manually triggered cognitive checkpoint inside an existing Session/Deep Work execution |

## Problem statement

Compasso already supports preparation through Rituals, execution through Session and Deep Work, immutable execution snapshots, canonical Evidence, optional learner-confirmed signals, Active Recall, and explicit Weekly Review decisions. Retrieval R1 also preserves the optional way the current Next Attempt will eventually need to be used.

The remaining Encoding gap occurs during consumption: an execution can continue from material consumption directly to completion without a lightweight deliberate pause that asks the learner to reconstruct, relate, or organize what was just consumed.

Encoding E1 must add an optional, manually triggered checkpoint to an existing eligible execution:

```text
Reusable Ritual orientation
→ learner-defined consumption chunk
→ manual “Pausa para processar”
→ reconstruct without consulting
→ choose one operation: connect, contrast, or organize
→ resume the same Session / Deep Work
→ canonical Evidence at normal completion
```

E1 changes the available cognitive action, not the execution lifecycle. It does not create a new Session mode, automatic interruption, worksheet, durable response, proof of learning, or generated knowledge artifact.

## Target users

| User or role | Need | Observable improvement |
|---|---|---|
| Self-directed learner configuring a reusable Ritual | Deliberately opt a Ritual into active encoding behavior | Can enable or clear one explicit optional behavior without changing the Ritual's type or creating another domain |
| Learner starting Session or Deep Work | Decide explicitly whether the selected Ritual should shape this execution | A linked or deliberately chosen eligible Ritual is snapshotted; a mere automatic suggestion never activates E1 |
| Learner consuming material during execution | Interrupt passive consumption at a meaningful self-defined boundary | Can manually open the checkpoint, reconstruct first, choose one operation, and return to the same execution |
| Learner using keyboard, screen reader, zoom, or mobile | Perform the checkpoint without losing execution context or focus | Trigger, sequence, choices, close/resume, focus, and responsive behavior remain understandable and operable |
| Learner with legacy, missing-source, offline, or restored data | Continue current execution and Evidence behavior safely | Absence or malformed optional E1 data degrades to the normal Session/Deep Work flow without inference or data loss |

## Stable domain contract

### Canonical eligibility representation

Current repository evidence provides no explicit Ritual semantic for Encoding eligibility. `actionType` contains only `study`, `programming`, `reading`, `writing`, and `planning`; `suggest()` derives recommendations from action/domain type. Reusing either would infer E1 eligibility from the kind of work, which the approved direction prohibits.

E1 therefore requires one optional additive property on the existing Ritual record:

```text
ritualTemplate.encodingCheckpoint?: true
```

The canonical enabled value is the boolean `true`. Canonical disabled state is property absence.

| Input/context | Required result |
|---|---|
| Explicit enable command with `true` | Persist `encodingCheckpoint: true` on the existing Ritual record |
| Explicit clear command with `false`, `null`, blank, or omission from a full E1 editor save | Omit `encodingCheckpoint` from the normalized Ritual |
| Unrelated update that does not own the E1 setting | Preserve the current valid value |
| Explicit non-empty/non-boolean unsupported command | Reject atomically without mutating the last valid Ritual |
| Persisted/imported unsupported value | Omit only `encodingCheckpoint`; preserve and normalize the otherwise valid Ritual |
| Legacy Ritual with no property | Valid and E1-disabled; no backfill or warning |

E1 adds no prompt taxonomy, prompt ID, score, invocation count, response field, or new collection.

### Exact eligibility rule

An active execution is eligible if and only if all of these are true:

1. the source Session or Deep Work is in an existing active state where the current lifecycle permits interaction (`running`/`active` or `paused`, never `finishing`, `completed`, or `interrupted`);
2. before that execution started, the learner explicitly chose a Ritual either by an existing confirmed source-item link or through the existing Session/Deep Work configuration flow;
3. that chosen Ritual normalized with `encodingCheckpoint: true` at successful execution start; and
4. the execution's stored `ritualSnapshot` contains `encodingCheckpoint: true`.

Automatic suggestion, preselection based only on `actionType`/domain, Ritual name, Session type, Deep Work mode, resource type, capability, `futureUse`, Evidence, Notes, history, or content never satisfies explicit choice. If the current UI shows a suggestion, starting without a deliberate link/selection must snapshot the Ritual's existing non-E1 context without the E1 marker.

After successful start, the stored `ritualSnapshot` is the sole E1 authority. The current live Ritual is never consulted to enable, disable, or change an already-running or historical execution.

### Ritual and snapshot ownership

The Ritual owns:

- the optional `encodingCheckpoint: true` eligibility setting;
- its existing reusable `preparation` instructions used as optional Preview/orientation;
- existing name, context, action type, resources, cues, distractions, closing, version, archive, duplicate, and update behavior.

The fixed E1 reconstruction and operation wording is application behavior, not customizable persisted learner content in E1.

At successful start after an explicit eligible selection, the existing snapshot owner records:

```text
ritualSnapshot = {
  ...existing ritual snapshot fields,
  encodingCheckpoint: true
}
```

The source Session/Deep Work and its canonical Execution Session retain their existing ownership. `ritualSnapshot` owns immutable execution-time eligibility and reusable orientation context. It owns no response, invocation state, history, count, score, or Evidence.

## Goals and measurable requirements

### R-001 — Explicit optional Ritual eligibility

**Priority:** MUST

**Trigger:** The learner creates or edits a Ritual through its existing management flow.

**Expected behavior:** The learner can explicitly enable or clear **Pausa para processar** for that Ritual. A successful enable persists only `encodingCheckpoint: true`; a clear returns to canonical absence and advances existing Ritual version/update semantics.

**Prohibited behavior:** No inference from Ritual name, description, `actionType`, preparation text, linked source, content, or past execution; no default enablement or new Ritual type.

**Persistence and legacy:** The optional field belongs to the existing `ritualTemplates` record. Legacy absence remains valid and disabled.

**Acceptance evidence:** AT-01, AT-02, AT-06, ER-01, ER-02.

### R-002 — Tolerant load and strict command behavior

**Priority:** MUST

**Trigger:** Ritual data is created, explicitly updated, normalized, imported, merged, restored, or loaded.

**Expected behavior:** Explicit supported enable/clear commands are atomic; explicit unsupported commands fail without mutation. Persisted/imported unsupported values degrade only to omitted E1 eligibility, and repeated normalization is idempotent.

**Prohibited behavior:** No invalid value may enable the checkpoint, invalidate the containing Ritual, create a default, or be converted by truthiness/string matching.

**Persistence and legacy:** Existing Ritual identity, content, timestamps, version, archive state, and linked-item behavior remain intact.

**Acceptance evidence:** AT-01, AT-02, AT-06, AT-28, ER-01, ER-02, ER-09.

### R-003 — Explicit selection, not automatic suggestion

**Priority:** MUST

**Trigger:** An E1-enabled Ritual is linked, selected, suggested, or preselected before Session/Deep Work start.

**Expected behavior:** A prior explicit source-item link or a deliberate current start-flow choice qualifies; a type/domain suggestion alone does not. Successful eligible start copies the marker into the snapshot; non-explicit suggestion may preserve existing Ritual behavior but omits the E1 marker.

**Prohibited behavior:** No automatic suggestion, default type, untouched preselection, or content inference can activate E1.

**Persistence and legacy:** Explicit selection uses existing link/start ownership; E1 adds no association record or selection-history field.

**Acceptance evidence:** AT-03 through AT-06, ER-04.

### R-004 — Immutable execution-time Ritual snapshot

**Priority:** MUST

**Trigger:** An eligible Session or Deep Work begins successfully.

**Expected behavior:** Its source and canonical execution preserve the eligible Ritual snapshot. Later Ritual edits, version changes, archive, deletion, merge, renaming, relinking, or configuration changes do not change the running/historical snapshot.

**Prohibited behavior:** No live Ritual lookup may retroactively enable, disable, or rewrite E1 for an existing execution.

**Persistence and legacy:** Historical snapshots predating E1 remain valid and ineligible. Source deletion does not delete or recompute the snapshot.

**Acceptance evidence:** AT-07 through AT-09, AT-28, ER-03, ER-05, ER-09.

### R-005 — Reusable Preview orientation without response

**Priority:** SHOULD

**Trigger:** The learner explicitly chooses an eligible Ritual containing existing `preparation` instructions.

**Expected behavior:** The execution makes those existing instructions available as optional attention orientation before or at the beginning of work. Empty preparation remains valid and creates no placeholder or required step.

**Prohibited behavior:** No new Preview form, required acknowledgement, stored Preview answer, duplicated instruction owner, or generated orientation.

**Persistence and legacy:** Preview uses only existing Ritual preparation and its snapshot; E1 adds no Preview field.

**Acceptance evidence:** AT-10, AT-17, ER-03.

### R-006 — Normal Session presentation contract

**Priority:** MUST

**Trigger:** A normal Session is active or paused with an eligible `ritualSnapshot`.

**Expected behavior:** A stable active-execution surface exposes a semantically named **Pausa para processar** action. The checkpoint is available without navigating to another route or ending the Session.

**Prohibited behavior:** No new Session mode, setup requirement after start, parallel execution, automatic opening, or hidden dependency on a live Ritual/source.

**Persistence and legacy:** Normal Sessions without the snapshot marker render and behave exactly as before, with no placeholder or configuration warning.

**Acceptance evidence:** AT-07, AT-11, AT-18 through AT-23, ER-03, ER-06 through ER-08.

### R-007 — Deep Work presentation contract

**Priority:** MUST

**Trigger:** Deep Work is running or paused with an eligible `ritualSnapshot`.

**Expected behavior:** Its existing focused execution surface exposes the same **Pausa para processar** action and cognitive sequence as normal Session, while retaining Deep Work's existing preparation, lock, timer, distraction, pause, recovery, interruption, and completion behavior.

**Prohibited behavior:** No Deep Work-specific Encoding model, secondary timer, separate response shape, or semantic divergence from normal Session.

**Persistence and legacy:** Deep Work without the marker remains unchanged; canonical synchronization preserves the snapshot under existing ownership.

**Acceptance evidence:** AT-08, AT-12, AT-18 through AT-23, ER-03, ER-06 through ER-08.

### R-008 — Learner-controlled manual invocation

**Priority:** MUST

**Trigger:** An eligible execution remains active while the learner consumes a self-defined chunk.

**Expected behavior:** The checkpoint opens only when the learner activates **Pausa para processar**. The learner decides the boundary and may invoke it when useful.

**Prohibited behavior:** No timer, elapsed-time threshold, scroll trigger, content trigger, Session-type rule, mandatory interval, notification, automatic interruption, or auto-open.

**Persistence and legacy:** Invocation itself writes nothing and changes no execution lifecycle field.

**Acceptance evidence:** AT-11, AT-13, AT-21, ER-04, ER-08.

### R-009 — Reconstruction-first cognitive sequence

**Priority:** MUST

**Trigger:** The learner manually opens the checkpoint.

**Expected behavior:** The first actionable stage presents **“Sem consultar, reconstrua a ideia principal com suas palavras.”** Operation selection follows only after the learner advances from this instruction. The three stable learner-facing operations are:

- **Conectar** — relacione a ideia a algo que você já conhece;
- **Contrastar** — compare com uma ideia relacionada, diferente ou oposta;
- **Organizar** — identifique estrutura, grupos, níveis ou relações.

**Prohibited behavior:** Operations cannot replace or precede reconstruction; the learner is never required to perform all three; PACER/Ladder terminology is not exposed as a taxonomy.

**Persistence and legacy:** Prompt stage and operation selection are transient only.

**Acceptance evidence:** AT-12 through AT-16, AT-30, ER-06.

### R-010 — Exactly one transient operation per invocation

**Priority:** MUST

**Trigger:** The learner reaches the operation stage of one checkpoint invocation.

**Expected behavior:** At most one of Connect, Contrast, or Organize is selected at a time; changing the selection replaces the previous transient choice. Selecting one exposes its corresponding instruction and enables the guided return to execution.

**Prohibited behavior:** No multi-select requirement, completion metric, stored choice, score, operation history, or claim that selection proves learning.

**Persistence and legacy:** Closing, cancelling, reloading, or starting a later invocation clears the transient operation state.

**Acceptance evidence:** AT-13 through AT-17, AT-21, ER-06.

### R-011 — No required digital response

**Priority:** MUST

**Trigger:** The learner uses any checkpoint stage.

**Expected behavior:** The checkpoint can be completed mentally, verbally, on paper, or in another medium. No typed reconstruction is required. Existing Capture/Notes actions may remain independently available outside the checkpoint.

**Prohibited behavior:** No textarea, scratchpad, autosave, draft recovery, mandatory Note/Capture, response validation, “proof” field, or hidden durable response.

**Persistence and legacy:** E1 creates no learner-authored checkpoint content and therefore no response reload/discard contract.

**Acceptance evidence:** AT-17, AT-25, ER-06, ER-10.

### R-012 — Same execution, timer, close, resume, and repetition

**Priority:** MUST

**Trigger:** The learner opens, cancels, or completes a checkpoint during a running or paused execution.

**Expected behavior:** Running execution time continues under existing timestamp semantics; an already paused execution stays paused. Cancel/close returns to the same execution without requiring an operation. Guided resume after one operation also returns to the same execution. The learner may invoke another independent checkpoint later with no count or escalation.

**Prohibited behavior:** No automatic pause/resume, secondary timer, Session completion, new action, new execution, persisted invocation count, or forced checkpoint before pause/interruption/completion.

**Persistence and legacy:** Checkpoint open/stage/selection state remains in memory only; execution timestamps/status remain under existing Session/Deep Work owners.

**Acceptance evidence:** AT-18 through AT-23, ER-06 through ER-08.

### R-013 — Reload, interruption, and missing-source recovery

**Priority:** MUST

**Trigger:** The page reloads, execution is paused/resumed, the checkpoint was open, the source action disappears, or the live Ritual is unavailable.

**Expected behavior:** Existing Session/Deep Work recovery remains authoritative. A reload closes the transient checkpoint and discards only its stage/selection; the running or paused execution and eligible stored snapshot survive and can reopen the checkpoint. A missing source Ritual/action does not invalidate an otherwise recoverable snapshot-backed execution.

**Prohibited behavior:** No invented source association, live-name matching, persisted panel state, blocked recovery, automatic Evidence, or data clearing.

**Persistence and legacy:** Malformed/missing snapshot eligibility fails closed to normal execution behavior while preserving the valid execution record.

**Acceptance evidence:** AT-09, AT-22, AT-23, AT-27 through AT-29, ER-03, ER-05 through ER-07.

### R-014 — Canonical Evidence remains unchanged

**Priority:** MUST

**Trigger:** An eligible execution is paused, interrupted, completed, or enters its existing Evidence flow, whether or not the checkpoint was used.

**Expected behavior:** Existing completion and canonical Evidence behavior is identical. Evidence remains the learner's durable end-of-session result through canonical `sessionId` provenance.

**Prohibited behavior:** E1 never creates, prefills, mutates, completes, validates, or substitutes Evidence; checkpoint invocation/selection is not Evidence and cannot block completion.

**Persistence and legacy:** Evidence shape, ownership, create/edit/delete, backup, and historical context projection remain unchanged.

**Acceptance evidence:** AT-23, AT-24, AT-27 through AT-29, ER-07, ER-10.

### R-015 — Notes, Capture, signals, Recall, and knowledge-domain isolation

**Priority:** MUST

**Trigger:** The checkpoint is opened, cancelled, completed, repeated, or followed by normal execution completion.

**Expected behavior:** Existing optional Notes/Atlas, Capture, post-Evidence `learningSignal`, and Active Recall flows remain independently available only through their current explicit learner actions.

**Prohibited behavior:** No automatic Note, Capture, wikilink, Relation, graph edge, `learningSignal`, Evidence, Active Recall card, `reviewItem`, schedule, Weakness/Error Notebook change, or transition to another feature.

**Persistence and legacy:** Existing records, consent, merge, conflicts, tombstones, sources, routes, Markdown/vault portability, and graph derivation remain unchanged.

**Acceptance evidence:** AT-24 through AT-26, AT-27 through AT-29, ER-10.

### R-016 — Retrieval R1 orthogonality

**Priority:** MUST

**Trigger:** An execution has absent, present, invalid, or later-changed `futureUse` context.

**Expected behavior:** `futureUse` remains optional read-only context under Retrieval R1. E1 eligibility and operation choices depend only on the explicit eligible Ritual snapshot.

**Prohibited behavior:** `futureUse` cannot enable/disable E1, select a Ritual, choose wording/operation, trigger/open the checkpoint, route the learner, or create persistence.

**Persistence and legacy:** Historical `learningContext.futureUse` remains immutable and separate; E1 adds no second owner or inference.

**Acceptance evidence:** AT-25, AT-27 through AT-29, ER-04, ER-10.

### R-017 — `compasso.state.v3`, persistence, backup, merge, and tombstones

**Priority:** MUST

**Trigger:** Ritual/execution state is normalized, saved, loaded, exported, imported, merged, refreshed, reopened, conflicted, or tombstoned.

**Expected behavior:** Valid optional Ritual/snapshot eligibility survives current IndexedDB, localStorage compatibility, JSON, whole-record merge, and execution recovery paths. Existing Ritual record timestamp/version semantics own current configuration; source/canonical execution records own historical snapshots.

**Prohibited behavior:** No state-version bump, migration job, new collection, object store, localStorage key, field-level merge, field tombstone, response persistence, destructive rewrite, backfill, or snapshot recomputation.

**Persistence and legacy:** `compasso.state.v3` remains authoritative. Newer whole Ritual/session records win under existing timestamps; equal-time conflicts and existing collection tombstones remain authoritative; historical snapshots never update from merged live Rituals.

**Acceptance evidence:** AT-01, AT-02, AT-07 through AT-09, AT-27 through AT-29, ER-01 through ER-03, ER-05, ER-09, ER-10.

### R-018 — Accessibility, responsive, offline, privacy, and protected compatibility

**Priority:** MUST

**Trigger:** The learner uses E1 by keyboard, screen reader, touch, narrow viewport, zoom, reduced motion, installed/offline shell, or alongside protected existing domains.

**Expected behavior:** The trigger has a meaningful accessible name and expanded/collapsed state where applicable; opening moves focus deterministically to the reconstruction instruction/heading; stage progression and single selection are announced; close/cancel/guided resume return focus deterministically to the triggering control or the stable equivalent after rerender. The flow works at 360–390 px, 200% zoom, coarse pointer, reduced motion, and offline without horizontal overflow, color-only meaning, or network access.

**Prohibited behavior:** No focus loss/trap in a non-modal presentation, hidden primary control, motion-dependent meaning, small touch-only target, backend, external service, AI, telemetry, account, framework, or content transmission.

**Persistence and legacy:** Current PWA/Service Worker architecture, routes, Studies, Readings, Sessions, Evidence, Notes/vault/wikilinks, Relations/graph, Contextual AI, and all existing state remain preserved. Design decides the next manifest-owned generation only if cached runtime assets change.

**Acceptance evidence:** AT-29, AT-30, ER-07, ER-10.

## In scope

- one optional explicit E1 eligibility setting on an existing Ritual;
- enable/clear behavior in the existing Ritual create/edit lifecycle;
- explicit link/current-flow choice as the only activation source;
- eligible-marker propagation through existing Session/Deep Work `ritualSnapshot` ownership;
- optional existing Ritual preparation as Preview/orientation;
- one manually invoked, ephemeral reconstruction-first checkpoint;
- exactly one transient Connect/Contrast/Organize choice per invocation;
- repeated independent invocation without history/count;
- same-execution timer, pause, reload, recovery, completion, and Evidence continuity;
- legacy, invalid, missing-source, backup, merge, tombstone, offline, accessibility, responsive, and PWA compatibility;
- focused regression protection for Retrieval R1, Active Recall, learning signals, Evidence, Notes/Capture, vault, Relations, and graph.

## Out of scope

- Retrieval R2 or adaptation decisions;
- consultation provenance;
- persisted checkpoint responses, drafts, selected operations, counts, timestamps, or duration;
- encoding quality, completion, mastery, confidence, progress, score, ranking, streak, or analytics;
- automatic checkpoint timing, interruption, suggestion activation, prompt recommendation, or Ritual selection;
- mandatory Preview form, textarea, scratchpad, Note, Capture, Evidence, signal, or card;
- custom checkpoint prompt authoring in E1;
- PACER persistence or learner/content classification;
- Ladder model/state;
- mind-map editor, spatial organization tool, automatic map, graph generation, or graph mutation;
- new Session/Deep Work/Encoding mode, route, collection, coordinator, or response model;
- Active Recall or Weakness redesign;
- Theory Overload intervention or universal session-purpose taxonomy;
- AI, backend, framework, cloud database, account, external service, telemetry, or network dependency;
- unrelated visual/navigation redesign or PWA/Service Worker architecture change.

## Business rules

| ID | Rule | Rationale |
|---|---|---|
| BR-001 | An execution is E1-eligible only when a normalized enabled Ritual was explicitly linked/chosen and the successful start snapshot contains the marker. | Separates learner consent from automatic suggestion. |
| BR-002 | `actionType`, domain, mode, resource, capability, name, text, history, and `futureUse` never determine eligibility. | Prevents hidden inference and theory overload. |
| BR-003 | Live Ritual configuration stops being authoritative at execution start; stored snapshot behavior is immutable. | Preserves historical/recovery semantics. |
| BR-004 | Canonical enabled state is `encodingCheckpoint: true`; canonical disabled state is omission. | Smallest explicit additive contract. |
| BR-005 | Persisted malformed values degrade to absence; explicit invalid commands fail atomically. | Balances compatibility and command correctness. |
| BR-006 | Preview reuses existing Ritual preparation; no Preview response is owned or stored. | Avoids duplicating Ritual instructions or creating forms. |
| BR-007 | Reconstruction always precedes the single cognitive-operation stage. | Preserves the approved cognitive sequence. |
| BR-008 | Cancel is always non-destructive and may occur before operation selection; guided resume follows one transient selection. | Avoids completion coercion while keeping the intended path. |
| BR-009 | A checkpoint invocation neither pauses nor completes execution and records no outcome/history. | Keeps execution ownership and timer semantics intact. |
| BR-010 | Repeated invocations are independent and reset to reconstruction. | Supports learner-defined chunks without tracking. |
| BR-011 | Evidence remains the only canonical durable completion outcome; Notes/Capture/signals/cards remain separate explicit actions. | Prevents duplicate durable representations. |
| BR-012 | Reload may discard checkpoint UI state because E1 owns no authored content; Session/Deep Work and snapshots must remain recoverable. | Defines safe ephemeral recovery. |
| BR-013 | Missing or malformed E1 data fails closed to normal execution, never to blocked execution. | Protects legacy and unavailable-source flows. |
| BR-014 | `compasso.state.v3` and current whole-record merge/tombstone behavior remain authoritative. | One optional nested property requires no storage architecture change. |
| BR-015 | PACER, Ladder, and GRINDE influence prompt design only and create no state or knowledge graph artifact. | Keeps E1 proportional. |

## Formal `compasso.state.v3` decision

**Decision:** Preserve `compasso.state.v3`. E1 introduces one optional nested boolean on an existing Ritual record and its existing execution snapshot; no state-version increment or migration job is required.

### Repository evidence

1. `app-manifest.js` already catalogs `ritualTemplates`, `sessions`, `deepWorkSessions`, and `executionSessions` as existing record-timestamp array collections and declares `compasso.state.v3`.
2. `storage.js` serializes the complete state JSON into the existing IndexedDB `appState` store and bounded localStorage compatibility mirror; it imposes no nested Ritual field schema and needs no database/store/key change.
3. `index.html` exports the whole current state as JSON and imports through existing normalization; no backup envelope or transport format needs to change.
4. `state-foundation.js` merges `ritualTemplates` and execution collections as whole records by identity and `updatedAt`, preserves equal-timestamp conflicts, applies existing collection tombstones, and does not require a field-level mechanism.
5. `ritual-model.js` is the current normalization and snapshot boundary. It currently knows only existing Ritual fields, so Design/Build must explicitly allow the optional boolean and copy it into eligible snapshots; this bounded normalizer extension is necessary precisely because no existing semantic qualifies.
6. `sessions-feature.js` already creates a Ritual snapshot at successful normal-Session start. `deep-work-model.js` and `execution-session-model.js` clone existing `ritualSnapshot` values, and current adapters preserve snapshots in source/canonical execution.
7. Existing v3 Retrieval R1 established the repository-compatible precedent that an optional nested property with tolerant persisted-data normalization and strict explicit commands can remain inside state v3 when it adds no collection, identity, store, key, or migration.

### Consequences

- old v3 Rituals/snapshots without the marker remain valid and ineligible;
- valid new Ritual/snapshot markers survive updated normalizers, storage, JSON, merge, reload, and offline use;
- malformed optional values are isolated to the marker rather than deleting a Ritual/session;
- disabling the live Ritual never rewrites historical snapshots;
- rollback after exposure must preserve the widened tolerant normalizer in a forward application generation if older cached code would strip the valid property on save;
- no E1 interaction/response data is persisted.

## Acceptance scenarios

| ID | Given | When | Then | Covers |
|---|---|---|---|---|
| AT-01 | A valid existing or new Ritual has no E1 setting | The learner explicitly enables **Pausa para processar** and saves | The same Ritual persists `encodingCheckpoint: true`, its existing version/update semantics advance, and no new record/collection is created | R-001, R-002, R-017 |
| AT-02 | A Ritual has `encodingCheckpoint: true` | The learner explicitly clears the setting and saves | The normalized Ritual omits the property, remains otherwise unchanged, and future explicit selections are not E1-eligible | R-001, R-002, R-017 |
| AT-03 | An enabled Ritual is explicitly linked to a supported source item through existing confirmed linking | A Session starts successfully without changing that link | Its snapshot contains `encodingCheckpoint: true` and the running Session exposes the checkpoint | R-003, R-004, R-006 |
| AT-04 | An enabled Ritual is available but not linked | The learner deliberately chooses it in the Session start/configuration flow and start succeeds | The Session snapshot contains the marker and exposes the checkpoint without persisting another association | R-003, R-004, R-006 |
| AT-05 | An enabled Ritual is deliberately chosen for Deep Work | Deep Work starts successfully | Source and canonical snapshots contain the marker and the focused execution exposes the same checkpoint semantics | R-003, R-004, R-007 |
| AT-06 | An enabled Ritual is only suggested/preselected because of action/domain type and was neither linked nor deliberately chosen | Session/Deep Work starts | The execution is valid but its snapshot omits E1 eligibility and no checkpoint trigger appears | R-001–R-003 |
| AT-07 | A normal Session has a valid eligible snapshot | Its active surface renders or rerenders | One semantically named **Pausa para processar** trigger is available without changing route/mode | R-004, R-006, R-018 |
| AT-08 | Deep Work has a valid eligible snapshot | Its running or paused focused surface renders or rerenders | The same trigger and sequence are available without changing Deep Work lifecycle behavior | R-004, R-007, R-018 |
| AT-09 | An eligible execution has already started | The source Ritual is edited, versioned, archived, deleted, renamed, disabled, or its link changes | The stored execution snapshot and checkpoint availability remain as captured at start | R-004, R-013, R-017 |
| AT-10 | An explicitly selected eligible Ritual has existing preparation instructions | Start/setup or early execution presents its context | The existing instructions are available as optional Preview/orientation, with no response or acknowledgement requirement | R-005 |
| AT-11 | An eligible execution remains active while time passes and the learner does nothing | No checkpoint action is activated | The checkpoint never opens or interrupts automatically and execution continues normally | R-006–R-008 |
| AT-12 | The learner activates **Pausa para processar** by keyboard or pointer | The checkpoint opens | Focus moves deterministically to the reconstruction stage, which presents the approved no-consultation instruction before actionable operation choices | R-007–R-009, R-018 |
| AT-13 | The reconstruction stage is open | The learner advances to operations and selects **Conectar** | Only Conectar is selected, its relationship instruction is exposed, and guided resume becomes available | R-009, R-010 |
| AT-14 | The reconstruction stage is open | The learner advances and selects **Contrastar** | Only Contrastar is selected, its comparison instruction is exposed, and guided resume becomes available | R-009, R-010 |
| AT-15 | The reconstruction stage is open | The learner advances and selects **Organizar** | Only Organizar is selected, its structure/grouping instruction is exposed, and guided resume becomes available | R-009, R-010 |
| AT-16 | One operation is selected | The learner selects a different operation before resuming | The new operation replaces the prior transient selection; no invocation ever holds multiple selected operations | R-009, R-010 |
| AT-17 | Any checkpoint stage is visible | The learner inspects the interaction | No textarea, scratchpad, required typed response, autosave claim, persisted Preview answer, or completion score appears | R-005, R-010, R-011 |
| AT-18 | The checkpoint was triggered from a running Session or Deep Work | The learner cancels/closes before selecting an operation | The checkpoint closes without mutation and focus returns to the trigger/stable equivalent in the same still-running execution | R-006–R-008, R-012, R-018 |
| AT-19 | The learner selected one operation | The learner activates guided resume | The checkpoint closes, transient state clears, focus returns to the same execution, and no Session/action/record is created or completed | R-010–R-012, R-018 |
| AT-20 | A running execution opens and uses the checkpoint for a measurable wall-clock interval | The checkpoint closes | Existing elapsed-time calculation includes that interval; no secondary encoding timer or automatic pause exists | R-012 |
| AT-21 | An eligible execution is already paused | The learner opens and closes the checkpoint | The execution remains paused, its paused-time semantics remain unchanged, and the checkpoint writes no status transition | R-008, R-012 |
| AT-22 | One checkpoint invocation has closed | The learner manually invokes it again later in the same eligible execution | It restarts at reconstruction with no prior selection/count/history and the execution remains the same | R-010, R-012, R-013 |
| AT-23 | A running or paused eligible execution has the checkpoint open | The page reloads/reopens through supported recovery | Only panel/stage/selection state is lost; execution status/timestamps/snapshot survive, the panel starts closed, and the trigger is available again | R-006, R-007, R-012, R-013 |
| AT-24 | An eligible execution has or has not used the checkpoint | The learner pauses, resumes, interrupts, completes, and records Evidence through existing flows | No E1 completion is required; canonical Evidence behavior/provenance is unchanged and no checkpoint data appears in Evidence | R-012–R-015 |
| AT-25 | An execution contains any `futureUse` value and an eligible or ineligible Ritual snapshot | The execution renders and the learner uses E1 | `futureUse` remains read-only context and has no effect on eligibility, wording, selection, opening, persistence, or routing | R-011, R-015, R-016 |
| AT-26 | Existing Notes, Capture, `learningSignals`, Active Recall, Weakness/Error Notebook, Relations, or graph data is present | The checkpoint is opened, cancelled, completed, or repeated | No record, card, schedule, signal, Note, Capture, wikilink, edge, weakness, or route transition is created or mutated automatically | R-011, R-014–R-016 |
| AT-27 | A legacy backup contains Rituals, Sessions, Deep Work, Evidence, protected domains, and no E1 property | The app imports, normalizes, saves, reloads, and executes it | All valid data remains available; Rituals/snapshots are E1-ineligible with no backfill, placeholder, warning, or blocked execution | R-002, R-004, R-013–R-018 |
| AT-28 | Current state contains enabled and disabled Rituals plus eligible and ineligible source/canonical snapshots | JSON export/import, repeated normalization, save/reload, newer/older merge, equal-time conflict, and tombstone behavior run | Markers and canonical absence round-trip with owners intact; whole-record winners/conflicts/tombstones remain authoritative; snapshots are not recomputed | R-002–R-004, R-017 |
| AT-29 | A supported PWA shell and E1 state are available with network disabled | The learner reopens, resumes, invokes the checkpoint, completes execution, and records Evidence | The full flow works locally with state v3, no network/external service, and unchanged Service Worker architecture | R-013–R-018 |
| AT-30 | The learner uses keyboard/screen reader, 360–390 px, 200% zoom, coarse pointer, or reduced motion | The learner triggers, advances, selects one operation, cancels/resumes, and repeats | Names/states/instructions are announced, focus is visible and deterministic, touch targets remain usable, content does not horizontally overflow or depend on color/motion, and one-hand operation remains practical | R-009, R-010, R-018 |

## Error and boundary scenarios

| ID | Condition | Expected behavior | Covers |
|---|---|---|---|
| ER-01 | A caller explicitly submits an unsupported non-empty/non-boolean E1 value during Ritual create/update | The command rejects before mutation/persistence; the last valid Ritual and editor draft remain available and an accessible error/retry path is presented | R-001, R-002, R-017, R-018 |
| ER-02 | Persisted/imported Ritual data contains `encodingCheckpoint` as a string, object, number, or other unsupported value | Only the optional property is omitted; the valid Ritual survives, repeated normalization is identical, and E1 stays disabled | R-001, R-002, R-017 |
| ER-03 | A source or canonical execution has a missing, malformed, legacy, or internally inconsistent Ritual snapshot | The valid execution remains usable; no checkpoint trigger appears; no live lookup, inference, crash, record deletion, or completion block occurs | R-004, R-006, R-007, R-013 |
| ER-04 | An E1-enabled Ritual is merely suggested/preselected by action/domain type, or `futureUse`/content appears to imply encoding | E1 remains inactive unless the learner explicitly linked/chose it; normal Session/Deep Work continues with no error or prompt to configure Encoding | R-003, R-008, R-016 |
| ER-05 | The live Ritual is edited, disabled, archived, deleted, conflicted, or unavailable after an eligible execution starts | The stored valid snapshot remains authoritative; the active/historical execution retains E1 behavior and no source recovery/backfill is attempted | R-004, R-013, R-017 |
| ER-06 | The checkpoint closes unexpectedly, is cancelled before selection, or reload occurs while it is open | No warning about unsaved content is needed because none exists; transient state clears; the execution/snapshot remains intact and can reopen safely | R-009–R-013, R-018 |
| ER-07 | The execution source action/material is missing, persistence is unavailable for an unrelated operation, or normal recovery is degraded | E1 neither masks nor worsens the existing safe status/error behavior; a snapshot-backed active execution remains recoverable where current contracts permit, and no output or false success is created | R-006, R-007, R-013–R-018 |
| ER-08 | The execution enters `finishing`, `completed`, or `interrupted`, or the learner uses pause/resume/completion while E1 is available | The checkpoint cannot newly open in a terminal/finishing state, closes if necessary, never blocks lifecycle actions, and creates no completion/Evidence side effect | R-006–R-008, R-012–R-014 |
| ER-09 | Local/incoming Ritual records diverge, share timestamps, or are covered by an existing tombstone | Existing record-level winner/conflict/tombstone behavior applies to the whole Ritual; E1 adds no field merge/tombstone and never recomputes historical snapshots | R-002, R-004, R-017 |
| ER-10 | Notes/vault/wikilinks/Relations/graph, Studies/Readings, Retrieval R1, Active Recall, signals, Contextual AI, legacy/unknown compatible state, or offline/PWA data coexists with E1 | Existing content, routes, ownership, portability, consent, merge, backup, and local availability remain unchanged without deletion, relinking, inference, telemetry, or network access | R-011, R-014–R-018 |

## Backup, restore, merge, and tombstone rules

- **Old backup → E1 app:** Ritual/snapshot property absence remains valid and disabled; no backfill, title matching, type inference, warning, or migration job.
- **Current Ritual without E1:** remains unchanged and does not show an execution checkpoint.
- **Enabled Ritual:** `encodingCheckpoint: true` survives JSON, IndexedDB/localStorage, refresh/reopen, and whole-record merge when that Ritual record is the existing winner.
- **Eligible snapshot:** the marker survives source and canonical Session/Deep Work snapshot round-trip; live Ritual changes never rewrite it.
- **Invalid persisted value:** the containing valid Ritual/execution survives; only the optional E1 marker is ignored/omitted and execution fails closed to normal behavior.
- **Explicit invalid command:** reject before mutation; do not silently normalize a bad command into enable or clear.
- **Whole-record merge:** existing `updatedAt` winner applies to the Ritual with its internally consistent marker/content/version; no field-level reconciliation.
- **Equal timestamp:** existing conflict preservation applies; E1 defines no special resolution.
- **Tombstone/delete:** existing collection deletion semantics remain authoritative. Deleting a live Ritual removes no historical source/canonical snapshot and creates no E1 tombstone type.
- **Rollback:** before exposure, revert the closed implementation. After exposure, use a forward compatible application generation that retains tolerant marker preservation before removing presentation; never clear user storage/backups to roll back.

## Accessibility and mobile contract

- Trigger accessible name conveys **Pausa para processar**, not an icon-only meaning.
- The trigger exposes availability and expanded/collapsed state where the selected semantic pattern supports it.
- Native Enter/Space activation works; pointer-only gestures are not required.
- Opening focuses the reconstruction heading/instruction or first semantic control, not the document body.
- Stage change announces the operation choice context; exactly one selected state is programmatically exposed.
- Cancel/close and guided resume return focus to the originating trigger or its connected stable equivalent after rerender.
- A non-modal/inline pattern has no focus trap; if Design proves a modal necessary, current dialog containment, Escape/cancel, and return-focus contracts apply.
- Visible focus, labels, instructions, selected state, error/unavailable states, and meaning do not depend on color.
- At 360–390 px and 200% zoom, the flow uses a single-column-safe reading order, exposes all actions without global horizontal overflow, and does not obscure Session pause/finish controls.
- Coarse-pointer targets satisfy the current design-system touch contract and permit practical one-hand trigger/select/resume use.
- Reduced motion removes non-essential animation without hiding state changes or focus.

## Compatibility invariants

- `compasso.state.v3` remains authoritative.
- Only `ritualTemplates[].encodingCheckpoint?: true` and eligible existing `ritualSnapshot.encodingCheckpoint?: true` are added; no new collection/store/key.
- The live Ritual owns configuration; the stored source/canonical snapshot owns execution-time eligibility.
- Explicit selection is mandatory; automatic Ritual suggestions never activate E1.
- Session/Deep Work ownership, statuses, timers, locks, recovery, completion, and canonical synchronization remain unchanged.
- No checkpoint response, stage, operation, invocation, count, duration, or result persists.
- Evidence remains unchanged and canonical through existing `sessionId` provenance.
- `futureUse` remains optional read-only Retrieval R1 context and never influences E1.
- No automatic Note, Capture, signal, card, Weakness, Relation, graph, or route mutation.
- Existing Ritual preparation supplies optional Preview; no Preview response is stored.
- Legacy/unlinked/malformed/missing-source data remains valid and fails closed to normal execution.
- IndexedDB, localStorage compatibility/recovery, JSON backup/restore, merge/conflicts/tombstones, refresh/reopen, and offline behavior remain supported.
- Studies, Readings, Notes, Markdown/vault, folders, metadata, wikilinks, Relations, graph derivation, Contextual AI, Active Recall, learning signals, and all routes remain intact.
- No PWA/Service Worker architecture change, backend, framework, external service, AI, telemetry, account, or network requirement.

## Constraints, assumptions, and dependencies

| ID | Type | Statement | Design consequence or invalidation condition |
|---|---|---|---|
| C-001 | State | State remains `compasso.state.v3`; marker is optional additive data inside existing owners. | Design must widen existing Ritual/snapshot normalizers without store/key/version migration. |
| C-002 | Selection | Current type-based Ritual suggestion is not explicit learner consent. | Design must distinguish confirmed link/current choice from untouched suggestion when snapshotting E1 eligibility. |
| C-003 | Snapshot | Source and canonical execution already carry cloned Ritual snapshots. | Both modes must use the stored marker after start, never the live Ritual. |
| C-004 | Runtime | Session Companion/banner and Deep Work are existing active-execution surfaces. | Design selects the smallest stable trigger placement and one shared semantic interaction path. |
| C-005 | Timer | Current elapsed-time models depend on lifecycle status and timestamps. | E1 must not emit status transitions; running time continues and paused time stays paused. |
| C-006 | Recovery | Reload already reconstructs running/paused executions from persisted records. | Only transient E1 UI resets; no recovery field is justified. |
| C-007 | Evidence | Completion transactions own Session/Deep Work plus canonical Evidence persistence. | E1 cannot participate in or gate that transaction. |
| C-008 | Preview | Existing Ritual `preparation` is sufficient reusable orientation for E1. | If Design proves it cannot be presented without duplicating ownership, return through Iterate rather than create a new Preview model. |
| C-009 | Accessibility | Existing design-system focus, dialog, touch, zoom, and reduced-motion patterns are reusable. | A parallel UI framework/coordinator is out of scope. |
| C-010 | PWA | Runtime/source changes are cached application-shell assets. | Design must choose the next forward manifest generation if its closed implementation changes cached assets; Service Worker architecture stays unchanged. |
| A-001 | Assumption | An optional enable/clear control fits the existing Ritual editor without a new route. | If it cannot be made understandable/accessibly operable there, UX scope requires Iterate. |
| A-002 | Assumption | Start flows can identify whether selection came from an explicit link/interaction rather than suggestion. | If no deterministic representation is possible without a new association/coordinator, Design must report the contradiction. |
| A-003 | Assumption | Normal Session and Deep Work can expose equivalent checkpoint semantics through existing active surfaces. | If one mode needs a separate domain model, Design is blocked and must return to Iterate. |
| A-004 | Assumption | No authored checkpoint content means UI state may safely reset on reload. | Any later textarea/draft proposal requires Iterate and explicit recovery/discard contracts. |

## Repository evidence inspected

### Product contracts and implementation

- `AGENTS.md` and relevant session/evidence/storage documentation.
- `ritual-model.js` for `TYPES`, tolerant normalization, item lists, versioned update/duplicate, type-based suggestion, defaults, and snapshot shape.
- `ritual-feature.js` for create/edit/archive/delete, explicit action linking, automatic suggestion/preselection, quick/Deep Ritual selection, checklist rendering, and Deep snapshot capture.
- `sessions-feature.js` for default/configured start, Ritual selection, source snapshot creation, active/paused/finishing states, timer, reload-safe timestamps, missing-source completion, awaited persistence, and Evidence transaction.
- `deep-work-model.js` and `deep-work-feature.js` for state normalization/transitions, elapsed/paused/finishing semantics, snapshot cloning, lock/reload/recovery, distraction capture, interruption, and canonical Evidence completion.
- `execution-session-model.js` and `execution-session-feature.js` for source-to-canonical synchronization, snapshot cloning, active execution selection, history, transitions, and legacy migration.
- `session-companion-feature.js` for stable active Session/Deep Work controls, focus/navigation, pause/finish behavior, mobile placement, and Retrieval R1 context projection.
- `learning-outcome-model.js`, `learning-outcome-feature.js`, and shipped Retrieval R1 artifacts for `futureUse` ownership, normalization precedent, and domain isolation.
- `evidence-feature.js` and `docs/evidence-feature.md` for canonical completion, `sessionId` provenance, and optional post-Evidence signal continuation.
- `capture-model.js`, `capture-feature.js`, Notes/Atlas, Recall, and Weakness flows for explicit durable-output boundaries.
- `state-foundation.js`, `storage.js`, `index.html`, and `app-manifest.js` for state v3, whole-record merge/conflicts/tombstones, IndexedDB/localStorage, JSON backup/restore, collections, module order, PWA generation `compasso-pages-v76`, and unchanged Service Worker architecture.

### Representative tests and conventions

- `tests/ritual-model.test.js`
- `tests/deep-work-model.test.js`
- `tests/execution-session-model.test.js`
- `tests/execution-session-contract.test.js`
- `tests/session-timer-model.test.js`
- `tests/state-foundation.test.js`
- `tests/app-manifest.test.js`
- `tests/browser/critical-flows.spec.js`
- `tests/browser/capability-context-flows.spec.js`
- `tests/browser/information-architecture-flows.spec.js`
- `tests/browser/design-system-flows.spec.js`
- `tests/browser/pwa-lifecycle-flows.spec.js`

No `.codegraph/` directory exists in the isolated authoritative worktree, so current source and tests were inspected directly.

## Expected Design/Build implementation and validation surfaces

Design must close the exact manifest. Current ownership indicates it should assess at least:

- `ritual-model.js` and Ritual model tests for canonical marker, strict/tolerant validation, update/clear/version/duplicate, snapshot, legacy, and idempotence;
- `ritual-feature.js` for existing editor enable/clear and explicit-selection versus suggestion behavior;
- `sessions-feature.js` for explicit start selection, normal source snapshot, stable active trigger, timer/reload/completion isolation;
- `deep-work-model.js` / `deep-work-feature.js` for snapshot retention, active trigger, running/paused/reload/interruption/completion behavior;
- `execution-session-model.js` / canonical adapters for exact source/canonical snapshot propagation and immutability;
- `session-companion-feature.js` or the existing stable Session active surface for checkpoint access without a new route;
- `design-system.css` for durable inline/non-modal, focus, responsive, coarse-pointer, and reduced-motion presentation rather than runtime style injection;
- `state-foundation.js`, storage/backup flows, and their tests for state-v3 whole-record merge, conflict, tombstone, legacy, malformed value, protected-state, and round-trip behavior;
- `app-manifest.js` and PWA lifecycle tests only if cached runtime assets change, using the next forward generation with the same Service Worker architecture;
- browser coverage for explicit eligible/ineligible Session and Deep Work, no automatic trigger, sequence/three operations/single selection, repeat, timer, pause, reload, source edit/delete, Evidence/protected isolation, offline, keyboard/focus, 360–390 px, 200% zoom, coarse pointer, reduced motion, and no overflow;
- repository validation commands from `package.json`: focused Node/browser checks, then `npm run test:all` during Build/Ship.

No product code or product tests are changed during Define.

## Abandonment criteria

E1 is a hypothesis about a small manual interruption. If real use shows the checkpoint is mostly opened and immediately dismissed, ignored despite clear eligibility, or experienced as administrative overhead, the response is to reduce or abandon it—not add timers, automation, more prompts, mandatory fields, scores, or compliance tracking.

This criterion creates no analytics requirement in E1. Evaluation may use deliberate qualitative observation after release.

## Clarity score

| Dimension | Score | Explicit evidence |
|---|---:|---|
| Problem | 3/3 | The missing mid-consumption processing pause is distinguished from Preview, Evidence, Notes, Retrieval, and reflection. |
| Users | 3/3 | Ritual configurator, executing learner, accessibility/mobile user, and legacy/offline user have observable needs. |
| Goals | 3/3 | Explicit eligibility, snapshot authority, manual sequence, resume, and protected boundaries are prioritized and measurable. |
| Success | 3/3 | Thirty Given/When/Then scenarios plus ten error/boundary scenarios cover happy, legacy, recovery, data, offline, and accessibility behavior. |
| Scope | 3/3 | One optional marker and ephemeral interaction are bounded against comprehensive non-goals, owners, state, and abandonment criteria. |
| **Total** | **15/15** | **Ready for Design** |

## Design questions

No product-direction blocker remains. Design must determine, without changing this contract:

1. The exact pure-model API that separates tolerant persisted normalization from strict explicit enable/clear commands.
2. How existing Ritual editor semantics preserve the marker across unrelated updates, duplication, versioning, archive, and explicit clear.
3. How current source links and start controls deterministically distinguish explicit choice from untouched suggestion in both normal Session and Deep Work.
4. The exact snapshot-creation path that includes the marker only after explicit eligible selection and keeps source/canonical copies identical.
5. The smallest common ephemeral state machine for `closed → reconstruct → operation → closed` without a new architectural coordinator.
6. The stable normal-Session active surface and Deep Work placement, render hooks, focus targets, focus restoration, and finishing/reload cleanup.
7. The exact presentation of existing preparation orientation without a new Preview owner or required acknowledgement.
8. Focused fixtures for malformed markers/snapshots, source edit/archive/delete, missing action, start/save failure, reload, pause, completion, backup, merge/conflict/tombstone, and protected-domain isolation.
9. The closed product/test/docs manifest and dependency order.
10. The exact forward PWA generation after `compasso-pages-v76` if cached runtime assets change, with unchanged Service Worker architecture and forward-compatible rollback.

## Readiness

- Requirements: **18**
- Acceptance scenarios: **30**
- Error/boundary scenarios: **10**
- Clarity: **15/15**
- Blocking decisions: **None**
- Define status: **Complete (Built)**
- Recommended next skill: `$sdd-ship .sdd/reports/encoding-e1/BUILD_REPORT.md`
