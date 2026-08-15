# Retrieval R1 — Match retrieval to future use

**Initiative:** Retrieval aligned to future use

**Delivery candidate:** R1 — Match retrieval to future use

**Status:** **Shipped through SDD**

**Date:** 2026-08-12

**Baseline:** `origin/main` at `6047c5fb32aad66ff2892ca4fdbbc7ca5f28ba65`

**Selected direction:** **B — optional future-use intent owned by the current Next Attempt and snapshotted into capability-aware execution**

**Phase boundary:** Product discovery only. This artifact does not authorize implementation, tests, persistence changes, PWA changes, or release actions.

## 1. Product problem

Compasso already supports the full learner-controlled loop:

```text
Capability → Next Attempt → Hoje / Execute → Session / Deep Work
→ Evidence → optional learningSignal → Weekly Review → keep/revise Next Attempt
```

It also provides Active Recall with question/answer cards and spaced repetition. The missing decision is not whether the learner should “review” something, but how the knowledge must eventually be used. A free-text Next Attempt can describe an exercise, explanation, implementation, case, simulation, or other practice, yet the product offers no explicit prompt connecting that action to its future use.

This makes question/card retrieval appear broader than it is. Flashcards can be appropriate when precise recall is the future demand, but they are a poor default representation of programming, problem solving, explanation, decision-making, exam simulation, or integration across concepts.

R1 should help the learner make one clearer decision before formulating or revising the current Next Attempt:

> **Como você precisará usar isso?**

The selected answer should guide a practice action that resembles that use without adding a recommendation engine, forcing every Session into a retrieval taxonomy, or allowing the system to change the Next Attempt automatically.

## 2. Intended learner and observable outcome

The primary user is the existing individual learner who plans capabilities, starts work from Hoje or Executar, records Evidence, and makes keep/revise decisions in Weekly Review.

R1 succeeds when that learner can:

1. optionally identify the intended future use while creating or revising a Next Attempt;
2. write an attempt whose practice resembles that use;
3. retain this context across Hoje and capability-aware execution without another required setup decision;
4. see the same intent when reflecting on Evidence and deciding whether to keep or revise the attempt;
5. continue using every existing legacy or unclassified flow unchanged when no intent exists.

Success is behavioral clarity, not an increase in cards, sessions, time, streaks, or scores.

## 3. Current-state diagnosis and repository evidence

The authoritative clean worktree does not contain `.codegraph/`; current source, documentation, SDD archives, and tests were inspected directly.

### 3.1 Ownership and continuity

| Current concern | Current owner/evidence | Consequence for R1 |
| --- | --- | --- |
| Capability and current attempt | `learning-outcome-model.js`; `learningOutcomes[].nextAttempt` currently contains identity, text, and timestamps | The attempt is already the durable unit describing what the learner will try now. |
| Today planning | `today-feature.js`; `dailyPlans` holds a `capability-attempt` reference | Hoje must continue referencing rather than owning or mutating the attempt. |
| Global execution | `today.primaryState` / `today.executePrimary`; tested in `information-architecture-flows.spec.js` | Execute precedence and fallback are already deterministic and do not need a new routing engine. |
| Normal execution | `sessions-feature.js`; immediate start uses existing defaults and copies `learningContext` | A capability-aware Session can receive contextual intent without another required configuration field. |
| Deep Work | `deep-work-feature.js`; reuses the same `learningContext` provenance | The same snapshot can be displayed without creating a Deep Work-specific model. |
| Canonical execution | `executionSessions[].learningContext` | This is the appropriate historical snapshot boundary for the intent used during an execution. |
| Evidence | `evidence-feature.js`; Evidence resolves capability context through canonical `sessionId` | Evidence must not duplicate future-use context. |
| Learner-confirmed signals | `capability-context-model.js`; `learningSignals` requires explicit save | Future-use intent must not create a signal or change one automatically. |
| Weekly decisions | `weekly-review-feature.js`; `capabilityReflections` records explicit keep/revise | Future-use context should inform the existing decision rather than add another lifecycle. |

### 3.2 Retrieval-related surfaces

- `recall-feature.js` models Active Recall as a reviewed question and hidden answer, followed by learner rating and spaced scheduling in `reviewItems`.
- `weakness-feature.js` derives weak-topic indicators from Active Recall history and maintains the independent `errorNotebook` correction workflow.
- Active Recall cards currently relate to Evidence, Notes, Captures, or front-domain items; they are not a canonical capability-wide retrieval engine.
- `sessions-feature.js` already has a free-text session objective, but this is an execution detail and cannot reliably preserve the reason a Next Attempt was chosen across planning and review.
- A Session may represent consumption, encoding, organization, retrieval, application, or another kind of work. No current contract says every Session is retrieval.

### 3.3 Persistence, backup, and compatibility

- `app-manifest.js` declares `compasso.state.v3`, the current array collections, and PWA generation `compasso-pages-v75`.
- `state-foundation.js` normalizes `learningOutcomes` and `learningSignals` and owns record-level merge, tombstone, and conflict behavior.
- `learning-outcome-model.js` currently drops unknown nested attempt fields during normalization; durable future-use context therefore cannot be added as an informal UI-only property.
- JSON export writes the current state, and import normalizes the restored state.
- IndexedDB remains primary, with localStorage as bounded mirror/fallback. No backend or external service is involved.
- `state-foundation.test.js`, `app-manifest.test.js`, `learning-outcome-flows.spec.js`, `capability-context-flows.spec.js`, `critical-flows.spec.js`, `information-architecture-flows.spec.js`, and `pwa-lifecycle-flows.spec.js` provide representative compatibility and journey coverage for a later Design.

## 4. Exact retrieval problem being solved

R1 is solving a decision-alignment problem:

```text
Future performance demand
        ↓
Current practice choice
```

Today, that relationship may exist only in the learner's head or be partially embedded in free text. Compasso should make it explicit enough to guide the current attempt and subsequent reflection, while keeping the learner in control.

R1 is not solving scheduling, mastery estimation, automatic recommendations, exercise generation, or cross-mode weakness analytics.

## 5. Discovery questions and confirmed answers

| Question | Answer | Status |
| --- | --- | --- |
| Where should intended future use be expressed? | Alongside creation or revision of the current Next Attempt, after the capability is understood and before practice is chosen. | Confirmed through direction B. |
| Who owns it? | The current Next Attempt. Capability is too broad; Session is too late; ephemeral state loses continuity. | Confirmed. |
| Must it persist? | Yes, when explicitly selected, because it must survive planning, delayed execution, refresh/offline use, and Weekly Review. | Confirmed. |
| Is it mandatory? | No. Absence remains valid for legacy records and for attempts where the choice adds no value. | Confirmed. |
| Does Execute choose a route automatically? | No. Execute keeps current precedence and starts the learner's explicit attempt through existing behavior. | Confirmed product direction. |
| Does every Session become retrieval? | No. Only an explicitly classified capability attempt carries this future-use context; the context is an intention, not proof retrieval occurred. | Confirmed boundary. |
| Should Evidence ask about consultation in R1? | No. “Sem consulta / consulta posterior / com consulta” is deferred because it adds completion friction before R2 has a defined use for it. | Recommended R1 boundary. |
| Does Active Recall become the universal execution engine? | No. It remains the specialized question/card and spaced-repetition modality. | Confirmed boundary. |
| Can the system infer a category from text or legacy records? | No. The learner chooses explicitly or leaves it unspecified. | Confirmed compatibility principle. |

## 6. Viable directions considered

### A — Ephemeral guidance while writing the attempt

**Mechanism:** ask about future use only in the editor and use the answer to provide examples or prompts; persist only the resulting free-text attempt.

**Advantages**

- no durable contract change;
- smallest implementation and compatibility surface;
- no stored taxonomy.

**Drawbacks**

- intent disappears after save;
- Hoje, Session, Evidence context, and Weekly Review cannot reliably present it;
- later R2/R3 evidence would depend on brittle text inference, which is prohibited for legacy associations.

**Primary risk:** the product appears helpful at entry time but cannot maintain the promised continuity.

### B — Optional intent on the current Next Attempt — selected

**Mechanism:** store one optional future-use value with the current Next Attempt. When a capability-aware Session or Deep Work starts, copy that value into the existing execution-context snapshot. All other surfaces resolve or project the value from their existing canonical relationships.

**Advantages**

- matches the decision's real lifetime: it may change when the attempt changes;
- remains visible from planning through reflection;
- does not add a collection, route, coordinator, or Session taxonomy;
- preserves the historical intent used for a completed execution;
- creates minimal trustworthy input for later R2/R3 without building analytics now.

**Drawbacks**

- changes a durable normalized shape and therefore requires explicit compatibility/version treatment;
- UI categories can become administrative if labels or explanations are too academic;
- the future-use value can conflict with an ambiguously written attempt unless the editor helps the learner reconcile them.

**Primary risk:** treating the selected category as a prescriptive recommendation instead of learner-owned context.

### C — Stable intent on the Capability

**Mechanism:** store one future-use value on the capability and reuse it for all attempts and executions.

**Advantages**

- the learner chooses once;
- stable capability-level framing is easy to display;
- fewer repeated selections during revision.

**Drawbacks**

- a capability may require different modes across successive attempts;
- encourages a false one-capability/one-modality rule;
- changing it would reinterpret future work while historical attempts require separate snapshots anyway.

**Primary risk:** oversimplifying a changing learning strategy into permanent capability metadata.

## 7. Confirmed direction and rationale

The user explicitly selected **B — optional future-use intent owned by the current Next Attempt**.

The direction is preferred because the current Next Attempt already owns the explicit learner decision about what to try now. Intended future use shapes that decision but does not redefine the capability, own the Session, or prove that retrieval occurred.

The conceptual durable representation is one optional bounded value on the attempt, provisionally called `futureUse` in this Brainstorm. A capability-aware execution receives the value only as part of its existing `learningContext` snapshot. The exact property name, allowed values, normalization, version treatment, and merge behavior belong to Define and Design.

No new top-level collection, persistence service, relationship graph, or journey record is justified.

## 8. Plain-language future-use vocabulary

The working vocabulary is explicit learner choice, not inference:

| Concept | Candidate learner-facing language | Practice resemblance |
| --- | --- | --- |
| Remember | **Lembrar com precisão** | Produce an answer from memory; questions/cards may fit. |
| Explain | **Explicar com suas palavras** | Give a free explanation, teach, or reconstruct reasoning. |
| Solve | **Resolver um problema** | Work an unfamiliar exercise or diagnose a problem. |
| Build | **Construir ou produzir** | Implement, write, design, or create the real artifact. |
| Decide | **Decidir entre alternativas** | Analyze a case, trade-offs, and commit to a justified choice. |
| Exam/simulation | **Simular uma situação ou prova** | Reproduce the constraints, format, pressure, or sequence of future performance. |
| Integrate | **Conectar ideias** | Solve or explain a multi-concept situation rather than recall isolated fragments. |

This is a single optional decision. It must not expand into fields for difficulty, confidence, consultation, score, frequency, or automatic method selection.

Define must validate whether seven visible choices remain understandable on mobile or whether presentation should progressively disclose examples without collapsing distinct stored meanings.

## 9. Proposed journey before and after

### Before

```text
Capability
→ write a free-text Next Attempt
→ Execute
→ Session / Deep Work
→ Evidence
→ reflect and keep/revise
```

The learner may choose suitable practice, but Compasso does not help maintain the relationship between practice and expected future use.

### After R1

```text
Capability
→ optionally answer “Como você precisará usar isso?”
→ write a Next Attempt that resembles that use
→ Hoje / Execute keeps the same precedence
→ Session / Deep Work shows the intent without another required choice
→ Evidence remains canonical and resolves context through sessionId
→ Weekly Review presents the intended use beside reflection
→ learner explicitly keeps or revises the attempt and may revise its future use
```

The choice guides the learner; it does not route, grade, infer success, or mutate another record.

## 10. Conceptual surface behavior

### Capacidades and Next Attempt

- Ask the optional future-use question when creating a capability's initial attempt and when explicitly revising the current attempt.
- Pair each plain-language choice with a short practice example, helping the learner write the attempt rather than choosing a category for its own sake.
- Never infer the choice from capability text, proof criterion, resources, Notes, Evidence, Active Recall cards, errors, or prior Sessions.
- A blank choice is valid and must not block save.

### Hoje and global Executar

- Hoje may project a compact plain-language label beside a valid planned attempt.
- Today retains planning ownership only and never writes the future-use value.
- Global Executar retains the shipped precedence: resume a valid Session, start the first valid planned capability attempt, otherwise use the established Hoje fallback.
- Future use does not auto-start Active Recall, Deep Work, a resource, or any unrelated action.

### Session and Deep Work

- Immediate capability-aware start remains immediate and uses existing defaults.
- The current future-use intent appears as context in the stable Session/Deep Work presentation, not as a second mandatory setup step.
- Optional Session configuration remains progressively disclosed.
- Resource-backed and unlinked Sessions remain unchanged unless the learner explicitly selects a current capability context through existing behavior.
- The presence of future-use context states what the practice is meant to resemble; it does not assert that retrieval occurred.

### Evidence and learningSignals

- Evidence receives no duplicate future-use property. It continues to derive context through `Evidence.sessionId → executionSessions.learningContext`.
- R1 does not add a required consultation-state question at completion.
- Existing Evidence types and learner-confirmed `learningSignals` remain unchanged.
- A gap, question, insight, or feedback signal may inform later reflection but never changes future use or the Next Attempt automatically.

### Weekly Review

- Present the selected future use with the attempt and its Evidence/signals before the existing keep/revise decision.
- Use the existing reflection field to invite the learner to consider whether the practice resembled the required use; R1 does not require a new scored answer.
- **Keep** preserves both current attempt and current future-use intent.
- **Revise** gives the learner explicit control to keep, change, or clear the future-use choice while changing the attempt.
- Historical, stale, missing, archived, or legacy contexts remain readable and non-blocking.

## 11. Active Recall's role after R1

Active Recall remains:

- a specialized question/answer retrieval surface;
- an appropriate candidate when future use is precise remembering;
- potentially useful within an explanation attempt when the learner deliberately writes a generative question;
- the owner of its existing reveal, self-rating, spacing, and card-history behavior.

Active Recall does not become:

- the universal meaning of retrieval;
- the default route for every future-use choice;
- a source of automatic capability progress;
- a generator of attempts, Evidence, signals, or weakness records without learner action;
- the execution mechanism for coding, building, open explanation, cases, decisions, or exam simulation.

R1 avoids inappropriate flashcard recommendations by not implementing an automatic recommender at all. The future-use chooser supplies modality-specific examples while the learner writes the actual Next Attempt. Question/card language appears only with a remembering-oriented choice or through the existing explicit Active Recall workflow.

## 12. Persistence and schema implications

### Direction A

- No stored field and no state-contract impact.
- Insufficient continuity and no trustworthy historical intent for R2/R3.

### Direction B — selected

- One optional bounded value associated with `nextAttempt`.
- The value is copied to the existing `learningContext` only when an explicitly linked capability attempt starts.
- No new collection, migration job, persistence backend, session record type, Evidence field, learning signal kind, or relationship edge.
- Changes to future use participate in the existing parent `learningOutcome` update/merge boundary; historical execution snapshots remain immutable facts of what was intended at start.
- Capability deletion uses the existing outcome tombstone; no field-specific tombstone exists.
- Because current normalization drops unknown attempt fields, this is a real durable-contract extension, not harmless UI metadata. Define must state the compatibility behavior; Design must determine whether the repository's state-version policy requires a forward state version or explicitly permits this additive optional extension within `compasso.state.v3`.

### Direction C

- One optional capability-level value plus an execution snapshot.
- Similar compatibility cost to B but poorer ownership fit and greater risk of stale categorization.

## 13. Legacy, missing-reference, and conflict behavior

- Legacy capabilities, attempts, Today references, Sessions, Execution Sessions, Deep Work records, Evidence, and Weekly Reviews without future-use intent remain valid.
- Missing intent is rendered as absence, not “remember”, “general”, “unknown”, or another inferred category.
- No backfill or text classification occurs.
- A stale Today reference cannot acquire future-use data from another attempt; existing stale/non-executable behavior remains authoritative.
- A capability-aware legacy execution without the snapshot remains readable and unclassified.
- Evidence never derives future use by matching title, time, domain, resource, or text; it uses only canonical `sessionId` and whatever valid snapshot exists there.
- Missing/deleted capabilities do not invalidate historical execution or Evidence.
- Concurrent updates follow the existing parent-record timestamp, conflict, and tombstone model. Define/Design must specify how future-use changes compose with simultaneous Next Attempt edits without adding field-level conflict machinery.

## 14. UX, mobile, and accessibility implications

- Present one optional decision, not a learning-science configuration form.
- Use plain Brazilian Portuguese labels with short concrete examples; technical category keys must not be the accessible name.
- The initial and revised attempt remain understandable when the optional choice is skipped.
- On 360–390 px and at 200% zoom, choices must not force horizontal scrolling or hide the attempt field/save action.
- A native single-choice pattern or an equivalently semantic control must expose selected, unselected, required/optional, disabled, and error states to assistive technology.
- Keyboard order should follow question → choices/examples → Next Attempt → save, with no focus trap.
- Revealing examples or explanations must not reset typed attempt text or selected intent.
- Touch targets must preserve the existing coarse-pointer sizing contract.
- Reduced-motion behavior must not depend on animation to reveal the selected context.
- Long capability and attempt text, missing context, offline state, save failure, and stale references must remain readable.
- Save failure must preserve the learner's draft and selected intent and must not announce success.

## 15. Offline, backup, and restore implications

- Selection and projection must operate entirely locally and offline.
- The optional value must round-trip through IndexedDB, the localStorage compatibility path, JSON export/import, refresh, and installed-PWA reopen.
- Older backups without the value restore normally without inferred defaults.
- A backup containing the value must not lose it during normalization or merge.
- Markdown/vault exports remain unchanged because future-use intent belongs to structured learning state, not Notes metadata.
- Notes, folders, wikilinks, Relations, graph derivation, Contextual AI data, Active Recall cards, `explanationEvaluations`, `errorNotebook`, Studies, Readings, Sessions, Evidence, and `learningSignals` remain preserved.
- R1 requires no external service, telemetry, remote content, or network availability.
- PWA generation and cache composition are Design/Build concerns only if runtime assets change; Brainstorm changes neither.

## 16. Risks and failure modes

| Risk | Failure mode | R1 mitigation direction |
| --- | --- | --- |
| Taxonomy burden | Learner manages labels instead of planning practice. | One optional question, plain examples, no secondary scoring/configuration. |
| False prescription | Product implies one modality is always correct. | Learner selects; choice can change with the Next Attempt; no automatic routing. |
| Category/attempt mismatch | Selected intent says “resolver”, attempt says “reler”. | Use examples and gentle consistency guidance, never silent rewriting or save blocking solely from text analysis. |
| Active Recall overreach | Cards remain visually implied for every kind of learning. | Restrict card-oriented language to its specialized context. |
| Setup friction | Session start asks the question again. | Reuse the stored snapshot and retain immediate-start defaults. |
| False evidence | Stored intent is interpreted as proof retrieval occurred. | Treat it only as planned future use; Evidence remains the execution fact. |
| Legacy inference | Old records acquire incorrect categories. | Missing means absent; never infer. |
| Data loss | Normalizer strips the new field during reload/import. | Make normalization and round-trip behavior an explicit later acceptance requirement. |
| Merge ambiguity | Simultaneous attempt text and intent edits produce inconsistent pairs. | Keep one parent outcome merge boundary and define atomic update behavior. |
| State-version ambiguity | Additive field is introduced without honoring schema policy. | Resolve state contract explicitly in Define/Design before Build. |

## 17. R1 scope, non-goals, and deferred work

### In scope for the candidate delivery

- one optional explicit future-use decision tied to the current Next Attempt;
- guidance that helps write a practice attempt resembling that use;
- contextual projection through Hoje, capability-aware Session/Deep Work, Evidence provenance, and Weekly Review;
- explicit keep/change/clear behavior when revising the attempt;
- backward-compatible local persistence if Define confirms the durable representation;
- focused accessibility, responsive, offline, backup/restore, normalization, legacy, merge, and PWA regression coverage.

### Explicit non-goals

- mastery, confidence, competence, completion, percentage, ranking, score, streak, XP, or gamification;
- automatic capability scoring or progress;
- automatic Next Attempt creation or modification;
- AI-generated exercises or any external AI dependency;
- recommendation engine or modality ranking;
- full cross-mode analytics;
- automatic weakness inference across retrieval modes;
- anti-grind Active Recall redesign;
- redesign of Weakness/Error Notebook;
- consultation-state capture in Evidence;
- treating all Sessions as retrieval;
- new backend, framework, telemetry, remote service, route, top-level module, or persistence collection;
- R2 or R3 behavior.

### Deferred to later increments

- measuring whether retrieval occurred without or with consultation;
- comparing intended use with completed practice across time;
- cross-mode gap derivation with learner confirmation;
- modality-specific exercise generation or recommendation;
- broader Active Recall scheduling or anti-grind changes;
- analytics proving which practice forms transfer to later performance.

## 18. Evidence R1 may safely create for R2/R3

R1 should preserve only the minimum trustworthy facts:

1. the learner's explicit future-use choice on the current Next Attempt;
2. the immutable snapshot of that choice on a capability-aware execution;
3. existing canonical Evidence linked through `sessionId`;
4. existing learner-confirmed signals and Weekly Review decisions.

This permits later research to compare intention, execution, Evidence, gaps, and revision without inventing historical associations. R1 must not compute conclusions from those facts yet.

## 19. Questions Define must close

1. What are the exact canonical values and Brazilian Portuguese labels for the future-use choice?
2. Are all seven working meanings shown directly, or are examples progressively disclosed while preserving distinct meanings?
3. Where exactly in initial capability creation and Next Attempt revision is the optional question presented?
4. What observable guidance helps align the written attempt without inferring, rewriting, or blocking it?
5. What is the exact empty, clear, edit, stale-reference, and unavailable behavior?
6. Which surfaces must show the value, and which should remain untouched to avoid visual noise?
7. What exact context does Session/Deep Work display while retaining immediate start?
8. How does Weekly Review let the learner keep, change, or clear the value atomically with the existing keep/revise decision?
9. Does the durable optional extension require a forward state-contract version under repository policy, or can `compasso.state.v3` formally support it? What migration and rollback behavior follows?
10. What are the exact merge/conflict semantics when attempt text and future-use intent are edited concurrently?
11. What acceptance evidence proves legacy, JSON round-trip, IndexedDB/localStorage, offline/PWA, missing references, keyboard, mobile, 200% zoom, coarse pointer, and reduced motion remain safe?
12. Does R1 expose any direct Active Recall affordance for “Lembrar com precisão”, or is contextual guidance sufficient until a capability/card relationship is explicitly designed later?

No unresolved Brainstorm question blocks entry into Define. These are requirement-level decisions that can be made without reopening the selected ownership direction.

## 20. Readiness and handoff

### Brainstorm quality gate

- Current product problem, user, constraints, and observable success are documented.
- Current source, flows, persistence boundaries, backup behavior, and representative tests were inspected.
- Three viable directions were compared with mechanisms, benefits, drawbacks, and risks.
- YAGNI boundaries and deferred work are explicit.
- The user explicitly selected direction B.
- The proposed direction is sufficiently bounded for measurable requirements.

**Brainstorm status:** **PASS — Complete (Defined)**

**Ready for `$sdd-define`:** **Completed**

**Recommended next skill:** `$sdd-design .sdd/features/retrieval-r1/DEFINE.md`
