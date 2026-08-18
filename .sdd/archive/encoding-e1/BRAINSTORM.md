# Encoding E1 — Learn-to-Learn Study Ritual

**Initiative:** Encoding aligned to active processing

**Delivery candidate:** E1 — Contextual manual checkpoint during execution

**Status:** **Shipped through SDD**

**Date:** 2026-08-16

**Baseline:** `origin/main` at `cb7e8baf9b3df4c08269610e9c4a3e032668a4f8`

**Selected direction:** **B — contextual manual checkpoint during an existing Session/Deep Work execution**

**Phase boundary:** Product discovery only. This artifact does not authorize implementation, product-test changes, persistence/schema changes, a PWA generation change, or release actions.

## 1. Final problem statement

Compasso already supports a strong learner-controlled cycle:

```text
Capability → Next Attempt → Hoje / Execute → Session / Deep Work
→ Evidence → optional learningSignal → Weekly Review → keep/revise
```

Retrieval R1 also lets the learner state how the current Next Attempt will eventually need to be used through the optional `futureUse` context.

The remaining Encoding gap is narrower: while consuming study or reading material during execution, the learner has no lightweight, deliberate way to stop and actively reconstruct, relate, or organize what was just consumed before continuing. The current journey can therefore remain passive until completion:

```text
Open material → consume → consume → finish → Evidence
```

Preview is partially supported by existing Ritual preparation, and Evidence already asks what remained or was produced at completion. Neither creates an intentional processing pause at the moment the learner chooses to stop consuming.

E1 should test the smallest useful intervention:

> When the learner explicitly chooses an eligible Learn-to-Learn Ritual, make an optional manual “Pausa para processar” available inside the existing Session/Deep Work execution so the learner can reconstruct first and then perform one cognitive operation before resuming the same execution.

The product must help the learner think about the material, not administer another form.

## 2. Intended learner and observable outcome

The primary user is an existing Compasso learner who deliberately attaches/selects a suitable Ritual before knowledge-work execution.

E1 succeeds when this learner can:

1. orient attention through the selected Ritual's reusable Preview instruction;
2. consume a self-defined bounded chunk of material;
3. manually open a semantically named processing checkpoint during the same Session or Deep Work;
4. reconstruct the main idea without consulting the material;
5. choose exactly one of **Conectar**, **Contrastar**, or **Organizar** for that checkpoint;
6. resume the same execution without a separate timer, session mode, durable response, or generated artifact;
7. finish normally through canonical Evidence.

Success is the availability and usability of deliberate processing, not the number of checkpoints, written answers, notes, signals, cards, scores, or minutes spent encoding.

## 3. Current-state diagnosis and repository evidence

The isolated worktree does not contain `.codegraph/`; current source, tests, documentation, and the shipped Retrieval R1 artifacts were inspected directly.

### 3.1 Existing infrastructure

| Concern | Current owner/evidence | Consequence for E1 |
| --- | --- | --- |
| Reusable Ritual instructions | `ritual-model.js`, `ritual-feature.js` | Ritual templates already own preparation, resources, cues, distractions, and closing instructions. |
| Ritual continuity | Session/Deep Work records and execution context | Existing `ritualSnapshot` preserves the selected instructions at execution time. |
| Normal Session execution | `sessions-feature.js`, `session-companion-feature.js` | Session owns its active presentation and lifecycle, but currently has no mid-execution cognitive checkpoint. |
| Deep Work execution | `deep-work-model.js`, `deep-work-feature.js` | Deep Work presents preparation/checklist context and owns active focus execution, but has no Digest pause. |
| Evidence | `evidence-feature.js` | Evidence is the canonical durable end-of-session record and must not become an Encoding worksheet. |
| Notes/Capture | `capture-feature.js`, Notes/Atlas flows | Existing durable destinations are available by separate learner action; they are not evidence that encoding occurred. |
| Current future-use intent | `learning-outcome-model.js` and Retrieval R1 contracts | `learningOutcome.nextAttempt.futureUse?` answers intended use, not current cognitive phase. |
| Historical future-use intent | `executionSession.learningContext.futureUse?` | Execution can show read-only context without letting it activate or route E1. |
| Persistence and compatibility | `state-foundation.js`, `storage.js`, `app-manifest.js` | State remains `compasso.state.v3`; existing normalization, merge, backup, local-first, and offline contracts are protected. |

### 3.2 What Rituals already solve

The Ritual domain already supports optional reusable templates and execution-time snapshots. Its study and reading patterns can orient attention through instructions such as a central question or a bounded reading section. It therefore partially addresses Preview and provides the appropriate home for reusable learning instructions.

Rituals do not currently provide the whole E1 behavior:

- normal Session does not present a reusable mid-execution processing step;
- Deep Work renders preparation-oriented checklist content but not a deliberate Digest checkpoint;
- Ritual `closing` data exists but is not a reliable active-session interruption and arrives conceptually too late;
- selecting a Ritual does not currently create an inline reconstruct/connect/contrast/organize interaction.

### 3.3 Exact gap still present

The smallest real product gap is **the absence of a learner-triggered processing pause during consumption**.

It is not primarily:

- a total absence of Preview;
- a lack of post-session Evidence;
- a need for more detailed Notes;
- a lack of durable reflection data;
- a need to classify every Session by cognitive phase;
- a need to infer the correct learning method from `futureUse`.

The missing behavior is a low-friction transition from passive consumption into active reconstruction before consumption continues.

## 4. Viable directions considered

### A — Learn-to-Learn Ritual template only

**Mechanism:** provide a reusable study Ritual whose preparation/closing/checklist instructions describe Preview, bounded consumption, and Digest.

**Cognitive problem solved:** helps the learner remember a preferred study sequence.

**Learner journey:** select Ritual → review static instructions → execute normally → finish.

**Advantages**

- minimal architectural and maintenance cost;
- entirely optional and learner-controlled;
- reuses current template and snapshot behavior;
- no new persistence concept.

**Weaknesses**

- current normal Session does not surface a mid-execution Ritual checklist;
- static instructions do not reliably create a deliberate pause at the chosen consumption boundary;
- closing content arrives after too much uninterrupted consumption may already have occurred;
- risks becoming a checklist that is acknowledged without cognitive work.

**Failure mode:** E1 appears present in configuration while the execution experience remains effectively unchanged.

**Evidence that would justify it:** current runtime would need to show that Ritual steps alone are already visible and actionable at the exact moment of consumption. Repository evidence does not support that conclusion.

### B — Contextual manual checkpoint during execution — selected

**Mechanism:** only when the learner explicitly selects an eligible Learn-to-Learn Ritual/context, Session and Deep Work make an optional manual “Pausa para processar” available during the active execution.

**Cognitive problem solved:** interrupts passive consumption at a learner-chosen boundary and elicits reconstruction plus one higher-order operation before continuing.

**Learner journey:** Preview/orient → consume a bounded chunk → manually trigger checkpoint → reconstruct without consulting → choose one operation → resume the same execution.

**Advantages**

- intervenes where the gap occurs rather than only before or after it;
- uses the existing Ritual as explicit opt-in and reusable instruction owner;
- avoids automatic timers, inference, routing, or interruption;
- requires no durable checkpoint answer or new response domain;
- works for programming, reading, study, and other deliberate knowledge work without treating every execution identically.

**Trade-offs**

- Session and Deep Work need consistent contextual presentation;
- eligibility must be identified without silently inventing a new persisted type/flag;
- a manual action can be ignored, so value depends on learner intent and Ritual selection;
- the checkpoint must remain cognitively useful without expanding into a wizard.

**Failure modes**

- the affordance is too hidden to be used;
- the checkpoint becomes a form or multiple required questions;
- eligibility leaks into unrelated Sessions;
- opening/closing it disrupts focus or mobile execution;
- the UI implies that merely selecting an operation proves learning.

**Evidence supporting selection:** existing Ritual snapshots provide opt-in contextual instructions, while active Session/Deep Work lack the actual processing pause. The intervention fills that precise boundary without adding another learning subsystem.

### C — Optional post-consumption Digest continuation

**Mechanism:** offer “Processar o que você consumiu” near completion, before canonical Evidence.

**Cognitive problem solved:** encourages synthesis before the learner records the session outcome.

**Learner journey:** consume → request completion → optional Digest → Evidence.

**Advantages**

- simpler active-session impact;
- clear placement in an existing completion transition;
- can remain optional and ephemeral.

**Weaknesses**

- arrives after the learner may already have consumed too much;
- overlaps conceptually with the existing Evidence prompt;
- can add completion friction and produce “fill form → fill form” behavior;
- does not help the learner define or repeat useful consumption boundaries.

**Failure mode:** Digest becomes a second Evidence screen rather than changing how the learner processes material.

**Evidence that would justify it:** user evidence would need to show that mid-execution control is disruptive while a completion-only prompt reliably changes consumption behavior. Current repository evidence does not establish that.

## 5. Selected direction and rationale

The user explicitly selected **B — contextual manual checkpoint during execution**.

It is the smallest coherent direction that actually addresses the diagnosed gap. Direction A reuses more infrastructure but does not reliably interrupt passive consumption. Direction C is easier to place but intervenes too late and risks duplicating Evidence.

Direction B is not a hybrid feature. It uses one existing contextual mechanism (Ritual selection/snapshot) to expose one optional execution affordance. It does not add automatic checkpoints, persisted answers, a new Session mode, or an Encoding subsystem.

## 6. Ownership boundaries

### Ritual owns

- the learner's explicit selection of a reusable Learn-to-Learn context;
- reusable Preview/Digest instructions;
- any existing template lifecycle, versioning, and selection behavior;
- the execution-time instruction snapshot through the existing `ritualSnapshot` boundary.

Ritual does **not** own an execution response, timer, Evidence record, Note, signal, score, or completion state for the checkpoint.

### Session / Deep Work owns

- whether and how the checkpoint affordance is presented during an active eligible execution;
- the ephemeral open/closed/operation-selection interaction;
- deterministic focus while entering, using, closing, and returning from the checkpoint;
- resuming the same existing execution lifecycle.

Session/Deep Work does **not** create another execution mode, timer, durable response, or alternative Evidence path.

### Evidence owns

- the existing canonical durable result of completed execution;
- its existing provenance through `sessionId` and established contracts.

Evidence does not own or duplicate the checkpoint.

### Notes / Atlas / Capture own

- their existing optional durable writing and knowledge workflows when the learner deliberately opens them.

They are not required to use or complete the checkpoint and receive no automatic content from it.

## 7. Exact checkpoint journey

```text
Explicitly select eligible Learn-to-Learn Ritual/context
→ Preview / orient attention using reusable instruction
→ start or continue the existing Session / Deep Work
→ consume a learner-defined chunk
   (section, concept, problem, passage, or another suitable boundary)
→ manually activate “Pausa para processar”
→ “Sem consultar, reconstrua a ideia principal com suas palavras.”
→ select exactly one operation for this checkpoint:
   • Conectar — relate it to something already known
   • Contrastar — compare it with a related or opposing idea
   • Organizar — identify structure, grouping, or hierarchy
→ close the checkpoint with deterministic focus restoration
→ resume the same Session / Deep Work
→ optionally repeat by explicit learner choice
→ finish through the existing canonical Evidence flow
```

The checkpoint does not require a textarea or in-product scratchpad. Reconstruction may be mental, verbal, on paper, or supported separately by existing Capture/Notes if the learner explicitly chooses that workflow.

Session time continues normally while processing unless Define/Design discovers an existing execution invariant that requires a different treatment. E1 adds no encoding timer or duration field.

## 8. Preview, consumption boundary, and Digest roles

### Preview

Preview orients attention before deeper consumption. The reusable instruction should help the learner establish a small purpose, such as the question to understand or the structure to look for. It must not become a mandatory questionnaire, and E1 does not require persisted Preview answers.

### Learner-defined consumption boundary

The learner—not a timer, heuristic, material type, `futureUse`, or automatic router—decides when a meaningful chunk has been consumed. Suitable boundaries vary across reading, programming, problem solving, and other knowledge work.

### Digest checkpoint

Digest begins with reconstruction without consultation. Only after that does the learner choose one operation: connect, contrast, or organize. This order protects the cognitive act from becoming a menu-first classification task.

The operation is an instruction for thinking, not an assessment and not proof that processing succeeded.

## 9. Eligibility through Rituals

Eligibility is explicit and contextual:

- the checkpoint appears only when the learner has selected the appropriate Learn-to-Learn Ritual/context;
- no activation is inferred from `futureUse`, Session type, capability, Evidence, Notes, Studies, Readings, or content;
- legacy and unlinked Sessions remain unchanged;
- unrelated execution is never interrupted or reclassified.

Current repository evidence confirms that Ritual templates and snapshots exist, but it does not establish a canonical persisted discriminator that safely means “eligible for E1”. Brainstorm therefore does **not** introduce a new Ritual type, flag, schema field, title convention, or text inference.

Define must specify the observable eligibility rule. Design must then verify how that rule maps to the existing Ritual model and snapshot. If no existing distinction can express eligibility safely, that is an explicit Design finding requiring controlled reconsideration—not permission to add a hidden field by assumption.

This is a technical/contract question, not an unresolved product-direction blocker: explicit Ritual selection is the confirmed activation boundary.

## 10. Persistence implications

E1 introduces **no new persisted checkpoint data** in the selected direction.

- no Preview response;
- no Digest response;
- no selected cognitive-operation history;
- no checkpoint count/status;
- no timer or encoding duration;
- no new collection, store, localStorage key, schema, migration, tombstone, merge rule, or response model;
- no automatic Evidence, Note, Capture, learningSignal, or Active Recall card.

The existing Ritual template and `ritualSnapshot` remain the only durable/contextual instruction mechanisms assumed by Brainstorm.

If Design later finds a transient text field essential, it must explicitly resolve accidental close, reload, clear/discard semantics, the user's understanding that content is not durable, and explicit transfer to an existing durable destination. E1 currently assumes none of this is necessary.

## 11. Evidence and Notes boundary

Evidence remains the canonical end-of-session surface for what remained or was produced. The checkpoint must not automatically create or prefill Evidence and must not bypass canonical Session/Evidence provenance.

Notes/Atlas and Capture remain optional downstream tools. The learner may independently choose to write, distill, organize, or preserve something, but E1 never equates Digest with detailed note-taking and never requires a Note to complete the checkpoint.

This protects the learning principle that reconstructing or relating an idea is cognitive work in its own right; durable writing is useful only when it serves a separate future purpose.

## 12. Retrieval R1 and current learning phase

Retrieval R1 answers:

> Como precisarei usar este conhecimento?

Encoding E1 asks the learner to perform cognitive processing now:

> Depois deste trecho, consigo reconstruir e trabalhar a ideia antes de continuar consumindo?

`futureUse` remains optional read-only context. It must not:

- activate the checkpoint;
- choose or recommend a prompt;
- choose Conectar, Contrastar, or Organizar;
- select a Ritual;
- route the learner;
- prove that encoding or retrieval occurred.

The execution snapshot may display `futureUse` under the shipped R1 contract, but E1 adds no second owner and no duplicate future-use question.

## 13. PACER, Ladder, GRINDE, and mind mapping

- **PACER** remains a prompt-design heuristic only. E1 adds no persisted procedural/analogous/conceptual/evidence/reference taxonomy.
- **Ladder** informs prompt order: first reconstruct structure, then consider relationships, then details if useful. E1 adds no Ladder model or separate feature.
- **GRINDE/mind mapping** motivates active grouping and relationship decisions, not a drawing tool. E1 adds no mind-map editor, automatic graph generation, or knowledge-graph mutation.
- Existing Relations and graph derivation remain independent, protected knowledge capabilities.

## 14. Accessibility, mobile, and interaction direction

Any viable implementation must provide:

- a semantically named “Pausa para processar” trigger;
- inline or non-modal presentation unless later evidence proves a modal materially safer;
- deterministic focus on opening and return focus to the triggering control on close/resume;
- logical keyboard order and full keyboard operation;
- clear screen-reader names, instructions, selection state, and completion/cancel behavior;
- visible focus without color-only meaning;
- usable layout at 360–390 px and 200% zoom with no horizontal overflow;
- coarse-pointer touch targets and practical one-hand access;
- reduced-motion behavior that does not rely on animation;
- coherent unavailable/stale/closed execution behavior;
- no loss or unexpected reset of the active Session/Deep Work state.

Because no text answer is required, E1 avoids autosave, ephemeral-draft warnings, reload recovery ambiguity, and destructive discard interactions.

## 15. State, offline, backup, and protected-domain implications

The selected direction preserves:

- `compasso.state.v3`;
- IndexedDB as primary persistence and localStorage compatibility/recovery behavior;
- JSON backup/restore;
- current Ritual templates and snapshots;
- Session/Deep Work recovery and execution ownership;
- canonical Session/Evidence `sessionId` provenance;
- legacy unlinked Sessions and Evidence;
- local-first and fully offline operation;
- installed-PWA behavior and current Service Worker architecture;
- Notes, Markdown/vault portability, folders, metadata, and wikilinks;
- Relations and graph derivation;
- Studies and Readings;
- Retrieval R1 and `futureUse` ownership;
- Active Recall, learningSignals, error/gap records, and Contextual AI data/routes.

E1 requires no backend, framework, cloud database, external service, AI dependency, telemetry, account, or network access. Brainstorm does not bump the PWA generation.

## 16. Explicit non-goals

- Retrieval R2 or adaptation decisions;
- consultation provenance;
- encoding, mastery, confidence, competence, completion, or progress scores;
- learning analytics or checkpoint counts;
- automatic prompt recommendation;
- automatic Ritual selection or activation;
- timers, automatic interruptions, or encoding duration;
- persisted PACER classification;
- a Ladder model;
- mind-map editor, automatic map, graph generation, or graph mutation;
- mandatory Notes, Capture, Evidence, learningSignal, or Active Recall creation;
- a new universal learning/session-purpose taxonomy;
- a new Session mode or broad Session/Deep Work redesign;
- Active Recall redesign;
- Theory Overload intervention;
- AI-generated explanations, summaries, prompts, or maps;
- backend, framework, remote database, account, or external dependency.

## 17. Theory Overload boundary

E1 deliberately avoids classifying every Session as consume/encode/retrieve/practice. Theory Overload remains a later evidence-driven increment only if real use repeatedly shows that learners cannot choose useful cognitive work even with the simple manual checkpoint.

Evidence that could justify reconsideration later includes recurring abandonment because the three operations are still confusing, repeated inability to decide what to do after reconstruction, or consistent use of a checkpoint that does not change passive-consumption behavior. Preference for a richer taxonomy by itself is insufficient.

## 18. Main risks, mitigations, and abandonment criteria

| Risk | Failure mode | Directional mitigation | Abandon or reconsider when |
| --- | --- | --- | --- |
| Hidden affordance | Eligible learners never notice or use the checkpoint. | Contextual placement inside active execution with a clear semantic label. | Repeated real use shows negligible discovery even after appropriate placement. |
| Form administration | Learner manages Compasso instead of thinking. | No textarea, no persisted response, one reconstruction instruction, one selected operation. | Completion requires multiple fields, saves, or explanation of data semantics. |
| Ritual ambiguity | Eligibility depends on title/text guesses or leaks into unrelated Sessions. | Explicit selection boundary; Define/Design must map it to a canonical existing distinction or surface a contradiction. | Safe eligibility requires fragile inference or a disproportionate schema subsystem. |
| Intrusion | The checkpoint interrupts unrelated work. | Manual invocation only; no inference or timer. | Implementation cannot isolate the affordance to explicit eligible context. |
| False evidence | Selection is treated as proof of learning. | No durable operation/result and no automatic Evidence/signal. | Product decisions start depending on checkpoint use as outcome evidence. |
| Evidence duplication | Digest becomes another completion worksheet. | Mid-execution cognitive pause; canonical Evidence unchanged. | The only feasible implementation is a second required completion form. |
| Accessibility/focus loss | Opening or resuming disrupts keyboard/screen-reader execution. | Deterministic lifecycle and return focus, inline/non-modal preference. | Existing lifecycle cannot restore stable focus without broad architectural redesign. |
| Cross-surface divergence | Session and Deep Work implement different meanings. | Same conceptual instruction/snapshot boundary and shared acceptance semantics. | Consistency would require a parallel execution coordinator or new mode. |
| Manual checkpoint ignored | Optional control does not change behavior. | Treat E1 as a hypothesis and observe real learner use before expanding. | Learners repeatedly consume uninterrupted despite understanding and selecting the Ritual. |

The feature should be abandoned or reduced rather than expanded if meaningful processing requires mandatory data entry, automatic interruption, inferred classification, or a new persisted response domain before the manual-checkpoint hypothesis is validated.

## 19. Questions Define must close

1. What exact observable condition makes an explicitly selected Ritual eligible, without assuming a new persisted type/flag?
2. What learner-facing Preview instruction is minimally sufficient, and where is it encountered before execution?
3. What exact label, description, and unavailable state identify the manual checkpoint in Session and Deep Work?
4. What does “select one operation” mean behaviorally when no response is stored: must the learner actively choose before resuming, or may they cancel without choosing?
5. Can the learner repeat the checkpoint freely within the same execution, and what ephemeral state resets on close?
6. Does opening the checkpoint leave execution time running under both current Session and Deep Work semantics?
7. What exact resume/cancel/focus behavior applies on keyboard, mobile, execution completion, stale snapshots, and reload?
8. How is the checkpoint presented consistently in Session Companion and Deep Work without creating a new session mode or coordinator?
9. What exact compatibility/error behavior applies when an eligible Ritual snapshot is missing, malformed, legacy, or unavailable?
10. What acceptance evidence demonstrates opt-in isolation, no automatic persistence/output, canonical Evidence continuation, offline behavior, 360–390 px, 200% zoom, coarse pointer, reduced motion, and screen-reader semantics?

No unresolved product-direction decision blocks Define. The remaining questions specify observable behavior and validate how the confirmed explicit-Ritual boundary fits existing contracts.

## 20. Readiness and handoff

### Brainstorm quality gate

- The current product gap was verified against current source and shipped Retrieval R1 boundaries.
- Existing Ritual, Session, Deep Work, Evidence, Notes, persistence, backup, offline, accessibility, and test infrastructure were inspected.
- Three viable directions were compared with cognitive effect, learner journey, load, reuse, persistence, compatibility, complexity, risks, and failure modes.
- The user explicitly selected direction B.
- Ritual and active-execution ownership are separated.
- YAGNI boundaries and abandonment criteria are explicit.
- No new persisted data or schema is assumed.
- Remaining questions are requirement/design questions, not unresolved product-direction blockers.

**Brainstorm status:** **Complete (Defined)**

**Ready for `$sdd-define`:** **Completed**

**Recommended next skill:** `$sdd-design .sdd/features/encoding-e1/DEFINE.md`
