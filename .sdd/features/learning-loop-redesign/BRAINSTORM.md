# Learning Loop Redesign — Brainstorm

**Status:** Ready for Define
**Initiative:** `learning-loop-redesign`
**Baseline:** `origin/main` at `934d7bad50d3a72d534d14890457e44e34e772ac`
**Scope of this artifact:** Product discovery and slice architecture only. No production code, data migration, navigation change, test change, deployment, or commit is authorized by this Brainstorm.

## 1. Product problem

Compasso currently helps people organize learning *resources* and learning *activity*, but it does not give them a durable unit for the capability they are trying to acquire. A Study can be a course, certification, time target, structured practice container, or content container. A Reading is a resource. A Goal is broad direction whose progress inherits activity/completion semantics. As a result, a user can finish material or accumulate time without a clear answer to: “What can I now do, what proves it, and what should I try next?”

## 2. Product thesis

Content is a resource; capability is the objective; evidence makes progress trustworthy. Compasso should make the next useful learning action easier while keeping the product local-first, privacy-preserving, and lightweight. It should not require users to learn pedagogical terminology or manage a taxonomy before they can start.

## 3. Current learning model

The present model is resource- and activity-centered:

- Readings use page/Kindle completion.
- Studies use hours, days, or completion progress.
- Goals average or inherit linked-item progress.
- Today ranks and presents daily-plan resource actions.
- Sessions record time and resource progress; Evidence is normally attached to a session/resource.
- Weekly plans use temporary, weekly `outcomes` descriptions; Review and Results emphasize actions, sessions, evidence counts, and completion.

`expectedOutcome` exists on fronts, but it is optional descriptive metadata, not a durable evidence-linked learning entity. Weekly-plan outcomes are intentionally short-lived planning outputs. Neither is a substitute for a durable capability objective.

## 4. Desired learning model

The intended conceptual hierarchy is:

```text
Learning outcome
  → optional proof criterion
  → attempts / practice
  → resources such as Studies and Readings
  → evidence
  → gaps / feedback
  → next attempt
```

The hierarchy is directional, not a mandatory wizard. The first shippable slice introduces only the foundation that changes the framing from “what should I study?” to “what do I want to be able to do, and what will I try next?” Later slices add execution, evidence, feedback, reflection, retrieval, and review without forcing a competence percentage or a synthetic mastery score.

## 5. Current architecture and domain map

The application is a local-first static PWA. `index.html` remains the composition and legacy state/rendering surface; feature modules register through `feature-runtime.js`; `app-manifest.js` composes modules and shared state collections; `state-foundation.js` owns normalization, migration, merge, and conflict behavior; `storage.js` persists the serialized app state in IndexedDB with a bounded localStorage mirror.

| Product/domain area | Current durable data or runtime owner | Current learning role |
| --- | --- | --- |
| Readings | `reading` records in app state | Content/resource with completion progress |
| Studies | `study` records in app state | Course, certification, practice, or time container |
| Goals | `goal` records in app state | Broad direction, coupled to linked-item progress |
| Today | `dailyPlans`, `today-feature.js` | Daily resource/custom action selection |
| Sessions | `sessions`, `deepWorkSessions`, `executionSessions` | Activity/time and resource progress |
| Evidence | `evidence`, `evidence-feature.js` | Artifacts linked to sessions/resources |
| Recall | `reviewItems`, `recall-feature.js` | Retrieval scheduling for selected source material |
| Review and Results | `weeklyReviews`, `weeklyPlans`, feature modules | Weekly activity/reflection and planned-vs-actual reporting |
| Notes and relations | `notes`, `folders`, Markdown/link-derived graph | Knowledge processing and contextual links |

This architecture supports an additive collection if it is included in manifest, normalization, merge, backup, and PWA composition contracts. It does not provide a generic “front” entity that a new outcome should inherit.

## 6. Existing data and schema map

`app-manifest.js` declares array collections and their identity/timestamp merge contracts. `state-foundation.js` normalizes those catalogued collections idempotently and currently records schema version 2. `storage.js` stores the full app state, so a new top-level collection is normally serialized through the existing primary state record rather than requiring an IndexedDB object-store redesign.

Current front records include `id`, presentation fields, notes, status, and resource-oriented progress fields. They may include an optional `expectedOutcome`, but its generic text does not have stable identity, proof semantics, attempt history, or evidence association. `weeklyPlans.outcomes` is a versioned weekly planning list, not a durable cross-week learning object.

The likely future domain is a new collection, tentatively named `learningOutcomes` in technical discussion only. The final external shape and schema version are a Define/Design decision. Its expected minimum behavioral fields are a stable identifier, required capability statement, optional proof criterion, resource references, embedded next attempt, active/archive state, and timestamps. It must not add percent progress, mastery score, required pedagogical category, or a conversion of existing records.

## 7. Current navigation and information architecture

The information architecture has five fixed primary areas: Hoje, Frentes, Journal, Revisão, and Mais. `information-architecture-model.js` lists Reading, Study, and Goal as views inside Frentes. `information-architecture-feature.js` renders Frentes as a navigation hub from view descriptors; it does not impose a common resource/domain schema on every peer view. Desktop uses the fixed left navigation and mobile uses the fixed five-item bottom navigation.

This makes a neutral Frentes peer view compatible with the current architecture and the mobile navigation limit. Placement beside existing Frentes must not imply that a learning outcome is a subtype of Study, Reading, Goal, or a new generic “front.”

## 8. Notes dependency analysis

Notes are durable, exported through the Markdown vault, searchable in contextual assistance, and connected to captures, journal conversion, book synthesis, Active Recall sources, relations, and links to existing fronts. They are also included in JSON backup/restore and storage quota coverage.

**Recommendation:** eventually remove Notes as a primary learning-management destination, but preserve Notes data, Markdown vault compatibility, internal links, generated learning artifacts, and a contextual processing surface. No deletion or data conversion belongs in this initiative’s first slice. Any later retirement needs old-route compatibility, a discoverable access path, and explicit export/restore preservation.

## 9. Relations dependency analysis

Relations are derived rather than a separate durable collection. `dictionary-relations-feature.js` derives links from note `linkedItemId` values and Markdown wikilinks, while `knowledge-graph-feature.js` renders that model with runtime-only positioning. This means there is no relation database to migrate, but the note/link conventions are compatibility-critical.

**Recommendation:** remove Relations and the graph as primary destinations later, while preserving the derived infrastructure and exposing relationship help contextually where it improves learning. Do not remove link parsing, graph derivation, or note references in the first slice.

## 10. Weekly Review usefulness

Weekly Review already offers useful reflection fields (wins, lessons, blockers, decisions, quality, and priorities) and can draw automatically from sessions and evidence. Its present center of gravity is still activity: sessions, time, progress deltas, and generic weekly priorities.

**Recommendation:** keep and transform it after outcome-aware execution and evidence exist. The future review should ask what the learner tried, what evidence or feedback changed, what gap remains, whether effort was consumption or practice, and which next experiment deserves priority. It must not present activity totals as capability proof.

## 11. Consistency usefulness

The standalone analytics/consistency surface provides history, filters, exports, session distribution, resource ranking, active days, focus time, and streak-like signals. Its useful diagnostic value is separable from its vanity-prone framing.

**Recommendation:** remove the standalone Consistency primary subview later. Preserve globally searchable session history, CSV/export capability, and decision-useful diagnostics in Today or Review. De-emphasize streaks, active-day percentages, and counts as goals.

## 12. Results usefulness

The current Results surface is named as if it shows learning results, but it mainly compares weekly planned versus actual actions, sessions, evidence, and book-synthesis activity. Book synthesis also generates a durable Atlas note.

**Recommendation:** transform Results later into demonstrated outcomes and associated evidence/gaps. Preserve book-synthesis processing artifacts and their note compatibility, but do not use activity KPIs as a capability proxy.

## 13. Current Evidence model

Evidence is already a durable collection with types such as insight, note, exercise, decision, question, and deliverable. It normally references a session and an existing resource domain/item, and normal session closure expects evidence. Capture and Journal can also generate evidence-like material.

The first slice deliberately does **not** create a direct outcome-to-evidence association. A later additive association must permit evidence to demonstrate an outcome without changing or invalidating existing session/resource evidence. Evidence is a basis for demonstrated learning, not an arithmetic progress meter.

## 14. Studies, Readings, and Goals

Studies and Readings remain resources. Goals remain broad direction. No existing Study, Reading, Goal, `expectedOutcome`, or weekly-plan outcome is converted, renamed, or migrated into a learning outcome. A resource can support more than one outcome, and an outcome can use more than one resource. A Goal may later become a contextual direction for outcomes, but that is not part of Slice 1.

## 15. Active Recall and spaced repetition

Active Recall and spaced repetition remain valuable for retrieval-oriented learning, but not every capability or evidence item is a flashcard candidate. The current system schedules `reviewItems` from selected sources using four rating choices.

**Future direction:** let a user choose an intended use only when it is helpful. Factual recall can route toward review cards; conceptual understanding can favor explanation or connection; executional skill can favor a practice attempt; strategic judgment can favor a scenario or decision record. No automatic outcome-to-card creation, new scheduling rule, or recall schema change is in Slice 1.

## 16. Organizing-unit alternatives

| Alternative | Description | Decision |
| --- | --- | --- |
| A. New minimal learning outcome | Add a durable capability-centered entity with optional proof, resources, and next attempt. | **Selected** |
| B. Evolve Studies or Readings | Add capability semantics to content/time containers. | Rejected: retains content and outcome entanglement. |
| C. Evolve Goals | Turn broad directional goals into capability units. | Rejected: retains inherited completion/activity semantics. |
| D. Reuse `expectedOutcome` or weekly outcomes | Promote existing text fields/lists. | Rejected: generic/transient and not evidence-linked. |

The selected entity is a domain concept, not mandatory product terminology. The first creation prompt should use natural pt-BR language such as **“O que você quer conseguir fazer?”**, with optional **“Como você vai saber que conseguiu?”**.

## 17. Success-criterion alternatives

| Alternative | Trade-off | Decision |
| --- | --- | --- |
| One optional plain-language proof criterion | Low-friction and understandable; can evolve later. | **Selected for Slice 1** |
| Required success criterion | Improves structure but blocks lightweight creation. | Rejected for initial UX. |
| Rubric, levels, or multiple criteria | More precise but prematurely pedagogical and high-maintenance. | Deferred/rejected for Slice 1. |
| Automatic completion threshold | Appears objective but would produce false certainty. | Rejected. |

The criterion is editable and optional. Its presence does not create a percentage, automatic completion, or evidence requirement in Slice 1.

## 18. PACER mapping

PACER should be treated as a future set of processing modes, not vocabulary users must learn and not a mandatory flow. Its useful product translation is short, purpose-led choices such as “explain in my words,” “connect this idea,” “record the evidence,” or “save a reference,” surfaced only after a meaningful learning moment.

**Recommendation:** introduce PACER-derived processing progressively in a later learning-processing slice, after outcome-aware execution/evidence foundations. Preserve Notes as the compatibility substrate while the visible workflow becomes outcome-contextual.

## 19. Retrieval mapping

Retrieval should be prompted by what the learner needs to retain or perform, rather than by a blanket rule that all learning becomes cards. Later, an outcome’s intended use can guide a suggested practice mode: remember, explain, apply, decide, or execute. Existing Active Recall remains the mechanism for selected retrieval use cases.

## 20. GRINDE relationship model

GRINDE-like relationship work is valuable when it helps a learner connect concepts, evidence, prior knowledge, and practical use. The current graph is derived from Notes and links, not a stable relationship domain.

**Recommendation:** later present contextual connection prompts and lightweight relationship views near an outcome or evidence item. Do not make a generic graph, ontology, or manual relationship editor the default learning workflow.

## 21. RAIL skill loop

RAIL is appropriate only for skill-oriented outcomes, where repeated attempt, result, feedback, reflection, hypothesis, and a next attempt form a meaningful loop. It is not a universal lifecycle for a book, concept, or one-off informational goal.

**Recommendation:** defer RAIL to a later skill-loop slice, after standalone/embedded attempt and outcome-evidence associations are proven. Slice 1 merely protects this future by giving the next-attempt object stable identity and timestamps so it can migrate without destructive reinterpretation.

## 22. Post-session processing alternatives

| Alternative | Benefit | Risk |
| --- | --- | --- |
| A. Mandatory reflection at every session close | Captures context while fresh. | Friction causes shallow or skipped sessions. |
| B. Optional quick processing only | Low effort, preserves momentum. | Important reflection can be postponed indefinitely. |
| C. Deferred inbox only | Supports thoughtful processing later. | Weak connection to the original learning moment. |
| D. Hybrid immediate cue plus deferred inbox | Captures a concise cue now and permits richer work later. | Requires careful progressive disclosure. |

**Recommendation:** Alternative D in a future slice: an optional, fast post-session cue when appropriate, plus a reviewable processing inbox. It is out of scope for Actionable Foundation; no forced Notes flow or session-closing change is introduced now.

## 23. Resource-model implications

Slice 1 should use outcome-owned typed references to existing Reading and Study records. This is a many-to-many link: one outcome can cite several resources, and one resource can support several outcomes. A resource is supportive context, never the definition of outcome progress.

No generic Relations dependency is needed. The final representation should retain a broken/deleted resource reference as an unavailable marker rather than deleting the outcome, proof criterion, or next attempt. Removing a resource link from an outcome is non-destructive to the resource; deleting or archiving an outcome never changes its resources.

## 24. Planning implications

Weekly plans and Today remain compatible in Slice 1. The new outcome is not automatically scheduled, converted to a focus item, or counted as a weekly result. Later planning can select an outcome and surface its next attempt, but that must not overwrite daily-plan semantics or turn the attempt into a generic task record.

## 25. Today integration

The initial slice does not make the embedded next attempt a canonical `dailyPlans` item. Today currently has date-specific completion state and ranks resource/custom actions; reusing it would couple a durable learning attempt to task completion and the separate Today reconciliation work.

**Future direction:** a user may later intentionally bring an outcome’s next attempt into Today or start a session from it. The source outcome should remain the owner of capability framing; Today should reference it rather than absorb it.

## 26. Navigation recommendation

Add the outcome experience as a neutral peer subview inside **Frentes**, visible as its own hub card and route/view descriptor. Keep the five primary areas unchanged on desktop and mobile. The user-facing label is unresolved product language; it must be evaluated in pt-BR rather than exposing “Learning Outcome” by default.

The new peer must receive its own domain behavior and rendering. Its Frentes proximity is navigation only: it does not inherit Reading/Study/Goal fields, progress logic, or generic-front abstraction.

## 27. Data compatibility rules

- The change is additive. Existing Reading, Study, Goal, Notes, sessions, evidence, review, weekly plan, journal, and backup data stay intact.
- Existing backups without the new collection normalize to an empty outcome collection without prompting a migration of legacy fronts.
- New backups include the collection in the normal full-state JSON export; merge and restore need explicit idempotent rules for its records and nested next attempt.
- Resource references are typed/stable and never trigger cascading deletion.
- Older app versions must not be presented as a supported way to fully use a newer backup: they may not surface the new collection. Define/Design must specify safe warning, preservation, and rollback behavior rather than assume backwards feature compatibility.
- Any future extraction of embedded attempts into a standalone collection must preserve identifiers, parent association, timestamps, and history through an explicit, idempotent migration.

## 28. Privacy and local-first posture

Outcomes, proof criteria, resource references, and next attempts are local app state. They participate in the existing IndexedDB/localStorage persistence, JSON backup/restore, offline behavior, and any already-configured user-initiated sync/export model. No new network service, analytics collection, account requirement, or server-side capability scoring is proposed.

## 29. Mobile and accessibility posture

The first experience must work at 360px without horizontal overflow, retain the fixed five-item mobile navigation, use existing dialog/focus conventions, and provide at least 44px touch targets. Creation must be short and understandable in pt-BR: required capability statement first, optional proof second, with resource linking and next attempt progressively disclosed rather than a dense pedagogical form.

## 30. Overall delivery alternatives

| Alternative | Description | Decision |
| --- | --- | --- |
| 1. Modify existing fronts in place | Add fields to Studies/Readings/Goals and revise views together. | Rejected: semantic entanglement and legacy risk. |
| 2. Redesign the full learning loop at once | Replace Notes, Relations, Review, Results, execution, and navigation in one release. | Rejected: high migration risk and no independently learnable slice. |
| 3. Additive incremental slices | Introduce outcome foundation first, then attach behavior and retire surfaces only when replacements exist. | **Selected** |

Alternative 3 is confirmed by the selected Actionable Foundation as the first independently shippable slice and by the explicit constraint to preserve legacy data and defer removals.

## 31. Destination architecture

The destination is an outcome-centered learning loop in which an outcome is durable and capability-oriented, resources remain linked support, attempts capture what to try, evidence demonstrates progress, feedback exposes gaps, and the next attempt carries the loop forward. Notes, relations, recall, sessions, and review become contextual tools within that loop where useful; none needs to be deleted to establish the foundation.

“Demonstrated” is a future evidence-backed state or view, not a Slice-1 completion button. Completion is intentionally absent from the initial outcome lifecycle because the product cannot honestly infer it before evidence/feedback rules exist.

## 32. Incremental slice map

| Slice | Independently shippable outcome | Depends on | Explicitly avoids |
| --- | --- | --- | --- |
| 1. Actionable Outcome Foundation | Create/manage outcomes with optional proof, linked resources, and one next attempt. | Existing Frentes, state foundation, backup contracts. | Sessions, evidence linkage, Notes/Relations/Review/Results redesign. |
| 2. Outcome-aware execution | Start or record a meaningful practice/session in outcome context. | Slice 1. | Standalone attempt domain unless real usage demands it. |
| 3. Evidence and feedback association | Associate existing/new evidence and feedback to an outcome; show gaps. | Slices 1–2 and evidence compatibility. | Percentage mastery or auto-completion. |
| 4. Learning processing foundation | Optional immediate cue plus deferred processing inbox, with Notes compatibility. | Outcome context and evidence/feedback conventions. | Mandatory reflection or Notes data removal. |
| 5. Contextualize Notes and Relations | Retire them from primary learning navigation only after contextual replacements work. | Slice 4 and compatibility audit. | Deleting notes, wikilinks, Markdown vault, or graph derivation. |
| 6. Retrieval-intent routing | Offer recall/explanation/application choices where appropriate. | Outcome and processing context. | Auto-card creation for every outcome. |
| 7. Outcome-centered Weekly Review | Review attempts, evidence, gaps, hypotheses, and next experiments. | Slices 2–3. | Activity as primary proof. |
| 8. Results and consistency transformation | Reframe Results around demonstrated outcomes and retain useful diagnostics contextually. | Slices 3 and 7. | Streak/percentage competence goals or loss of history/CSV. |
| 9. Skill-loop support (RAIL) | Add richer attempt/result/feedback/reflection loops for skill-oriented outcomes. | Repeated use of Slice 1–3 concepts. | A universal pedagogical lifecycle. |
| 10. Relationship support (GRINDE) | Provide contextual connections among concepts, resources, evidence, and practice. | Processing and preserved link infrastructure. | A mandatory graph or manual ontology. |

## 33. Recommended first slice

**Actionable Outcome Foundation** is the first slice. It is the smallest useful change that creates the new organizing unit without pretending that capability can be measured before evidence exists.

It changes behavior immediately: a learner can state what they want to be able to do, optionally say how they will know, connect existing material as support, and define one concrete next attempt. It deliberately does not claim that resource completion, a checked task, or an elapsed session proves the outcome.

## 34. First MVP scope

The Actionable Outcome Foundation should include:

1. A new, additive durable outcome collection/domain.
2. Creation with a required natural-language capability statement and optional proof criterion.
3. List and detail management for active outcomes, with editing and archive/unarchive behavior.
4. Many-to-many links to existing Studies and Readings as supporting resources.
5. One embedded, lightweight, future-migratable next-attempt object per outcome.
6. A neutral Frentes peer subview/hub entry, preserving fixed primary navigation.
7. Existing JSON backup/restore, merge, local persistence, offline, accessibility, and responsive contracts for the new collection.

Recommended lifecycle for this slice: **active** and **archived** only. Archive is the normal way to retire an outcome while retaining its context. Destructive deletion, if exposed, requires explicit confirmation, never cascades to linked resources, and should be limited by a Define/Design safety rule. There is no “completed” or “mastered” state in Slice 1.

## 35. First-slice non-goals

- No conversion or migration of existing Studies, Readings, Goals, `expectedOutcome`, or weekly-plan outcomes.
- No direct evidence, session, feedback, note, capture, journal, or recall association to outcomes.
- No standalone attempt entity or reuse of Today’s generic daily-task model as the canonical attempt.
- No percentage progress, mastery score, streak, capability ranking, or automatic completion.
- No required taxonomy, teaching method, rubric, level, or pedagogical metadata.
- No removal/redesign of Notes, Relations, Review, Results, Consistency, Active Recall, or spaced repetition.
- No primary-navigation expansion, account change, backend service, sync redesign, deployment, or analytics change.

## 36. Likely files and domains for a later Design

This is a planning map, not authorization to edit:

| Area | Likely integration point | Why |
| --- | --- | --- |
| Collection contract | `app-manifest.js` | Add the new durable array collection to the shared catalog/module/PWA composition. |
| Normalization and merge | `state-foundation.js` | Explicit idempotent defaults, timestamps, tombstones, merge behavior, and schema migration. |
| Legacy app state/backup | `index.html` | Initial state/load normalization and JSON export/import compatibility. |
| New feature UI | A dedicated outcome feature module, name decided in Design | Owns outcome UI/commands without contaminating resource-front logic. |
| Frentes IA | `information-architecture-model.js`, `information-architecture-feature.js` | Add a peer view descriptor/hub card/route. |
| Persistence checks | `storage.js` and storage tests as needed | Confirm serialized-state persistence and restore behavior. |
| Tests | existing Node/browser suites | Cover migration, backup, IA, responsive UI, and no regression to current flows. |

No generic front abstraction, update to Reading/Study progress logic, or IndexedDB schema change is presumed necessary by this Brainstorm.

## 37. Migration expectation

The first release needs an explicit, versioned, idempotent additive state migration. On app state that lacks outcomes, it adds an empty collection and preserves every existing field. On repeated runs, it must not duplicate outcomes, resource links, or nested next attempts. On merge/import, record identity and timestamps must follow the existing state-foundation contract; final nested-object conflict rules need Design-level definition.

There is no legacy data conversion. Future migration from an embedded next attempt to a standalone attempt collection is anticipated but not implemented: it should copy the stable nested identifier, retain parent outcome association and timestamps, preserve records through backup/import, and leave a deterministic compatibility path for older serialized state.

## 38. Test strategy

Later implementation should reuse the repository’s existing test conventions rather than invent a parallel harness:

- Node tests for manifest composition/order, state migration idempotence, merge/tombstone behavior, and old/new backup normalization.
- Browser flows for creation, optional proof, resource link/unlink, next-attempt edit/replacement, archive/unarchive, and no resource cascade.
- IA tests proving Frentes route/hub behavior and unchanged five-area desktop/mobile navigation.
- Responsive/accessibility checks at 360px, 768px, and desktop for no overflow, focus return, dialog semantics, and touch target expectations.
- Regression coverage for Reading, Study, Goal, Today, session/evidence, backup/restore, Markdown vault, Journal conversion, and existing PWA/offline asset composition.
- Manual offline/restore smoke checks for a fresh state, a legacy backup, and a backup containing outcomes.

The current artifact-only change does not warrant running production test suites; no application behavior has changed.

## 39. Risks

| Risk | Mitigation |
| --- | --- |
| Users confuse resources with the capability objective. | Lead with capability wording, label resources as support, and avoid resource-derived progress. |
| The new view looks like a fourth legacy front subtype. | Use neutral IA wording and a dedicated domain/rendering module; document Frentes as navigation only. |
| A proof criterion feels like bureaucracy. | Keep it optional, one text field, and progressively disclose it. |
| Embedded attempt becomes hard to evolve. | Give it stable identity/timestamps now and define an explicit extraction migration later. |
| Broken resource references erase learning context. | Keep orphaned typed references visible as unavailable; never cascade deletion. |
| Outcome “completion” makes false claims. | Do not offer completed/mastered state until evidence/feedback policy exists. |
| Backup/import loses additive data. | Treat manifest, migration, export/import, and tests as one contract. |
| Notes/Relations retirement breaks valuable workflows. | Delay UI retirement, preserve data/export/link parsing/routes, and replace context before removal. |
| Mobile form becomes a pedagogical admin screen. | Require only capability statement; make all other inputs optional/progressive. |

## 40. Rollback and deprecation strategy

Slice 1 is additive and contains no legacy conversion, so rollback must preserve the serialized outcome collection rather than delete it. A newer app must keep it in normal backup/export/restore. An older app should not be assumed to expose or safely round-trip the feature; any release/rollback plan must specify version messaging and recovery through a current-version backup.

Later deprecations are UI deprecations first: preserve Notes data, folders, Markdown vault import/export, wikilinks, relations derivation, session/evidence history, and exports before removing primary destinations. Keep legacy routes or explicit redirects until usage and compatibility evidence supports their retirement.

## 41. Open questions and deferred decisions

The decisions below are intentionally deferred to Define or Design because they do not block the selected first-slice architecture:

1. Which natural pt-BR label best fits the new Frentes peer (for example, a capability-oriented phrase rather than the domain term “Learning Outcome”)?
2. Should Slice 1 show archived outcomes in a filter, separate list, or compact section by default?
3. What exact confirmation/eligibility rule should govern destructive outcome deletion versus archive-only behavior?
4. Which exact fields comprise the embedded next-attempt object beyond stable identity, text, and timestamps, and how are nested merge conflicts resolved?
5. Should an unavailable resource reference remain as a visible historical link, a repair prompt, or both?
6. When outcome-aware execution arrives, should a completed next attempt be replaced manually, retained as lightweight history, or immediately migrated into a new attempt collection?
7. What is the minimum evidence/feedback policy for a future “demonstrated” presentation without producing a score?
8. How should a later outcome relate to Goals without recreating inherited percentage semantics?
9. What migration/version warning is appropriate when a user restores a newer backup in an older app version?

## 42. Decision table

| Current area | Keep | Transform | Remove from primary UI | Preserve internally | Delete eventually | Rationale |
| --- | --- | --- | --- | --- | --- | --- |
| Notes | Yes, data and workflows | Into contextual learning processing later | Yes, later | Markdown vault, folders, links, generated artifacts, search | No data deletion planned | Broad dependency surface and durable user knowledge. |
| Relations | Derived link model | Into contextual relationship help later | Yes, later | Wikilinks, `linkedItemId`, graph derivation | No | There is no relations datastore; links remain compatibility-critical. |
| Weekly Review | Reflection value | Outcome/evidence/gap/next-experiment review | No immediate change | Existing reviews/history | No | Useful ritual, but activity-centered today. |
| Consistency | History/export diagnostics | Decision-useful diagnostics in context | Yes, later | Session history, filters, CSV/export | Streak-first framing may be retired | Avoid vanity behavior while retaining diagnostic value. |
| Results | Book-synthesis and reporting assets | Demonstrated outcomes/evidence view | Yes, later | Synthesis artifacts and notes | Activity-KPI framing may be retired | Current name overstates activity metrics as results. |
| Studies | Yes | Clarify as supporting resource where linked | No | All existing records/progress | No | Remain valid course/practice containers. |
| Readings | Yes | Clarify as supporting resource where linked | No | All existing records/progress | No | Remain valid content resources. |
| Active Recall | Yes | Route by retrieval intent when useful | No immediate change | Scheduling/history/source links | No | Valuable for some, not all, learning goals. |
| Spaced Repetition | Yes | Use selectively for retrieval | No immediate change | Existing review schedule | No | Mechanism, not the universal learning loop. |
| Evidence | Yes | Add outcome association and feedback later | No immediate change | Existing session/resource evidence | No | Future proof for demonstrated learning, without a score. |

## 43. Chronological decision log

1. The product problem was framed as content/activity progress lacking a durable capability objective.
2. Alternative A was selected: a new minimal durable learning-outcome entity, additive and distinct from Studies, Readings, Goals, `expectedOutcome`, and weekly outcomes.
3. The first independently shippable slice was selected as **Actionable Outcome Foundation**: desired capability, optional proof criterion, supporting Study/Reading resources, and one next attempt.
4. The next attempt was selected as **Alternative A**: a lightweight embedded object on the outcome, designed to migrate safely later; it is not a generic Today task and not a standalone Slice-1 domain.
5. Initial information architecture was selected as a neutral **Frentes peer subview**, preserving the five fixed primary areas and avoiding a generic-front abstraction.
6. The delivery strategy was selected as additive incremental slices; Notes, Relations, Review, Results, Consistency, evidence linkage, processing, retrieval, and skill loops remain sequenced future work.

## 44. Quality gate

| Gate | Result | Evidence |
| --- | --- | --- |
| Product problem and desired behavior understood | Pass | Sections 1–4 describe the shift from content/activity to capability/attempt. |
| Current repository architecture and data boundaries inspected | Pass | Sections 5–7 and 36 map manifest, state, storage, legacy UI, IA, and PWA constraints. |
| At least three discovery decisions answered sequentially | Pass | Organizing unit, first slice, attempt representation, and IA placement are recorded in section 43. |
| Multiple organizing-unit and delivery alternatives compared | Pass | Sections 16 and 30 compare and select alternatives. |
| Selected direction explicitly confirmed | Pass | Alternative A, Actionable Foundation, embedded attempt, Frentes peer, and incremental delivery are confirmed decisions. |
| First slice has value without later redesigns | Pass | Sections 33–35 define a useful foundation without session/evidence/Notes/Review changes. |
| Data preservation, backups, privacy, offline, mobile, and accessibility addressed | Pass | Sections 27–29, 37–40. |
| No misleading capability metric introduced | Pass | Rejected consistently throughout; no percentage/mastery/completion claim in Slice 1. |
| Remaining uncertainty is explicit and non-blocking | Pass | Section 41 defers naming and implementation-detail decisions to Define/Design. |

**Quality-gate result: PASS. This initiative is ready for a narrowly scoped Define phase for Slice 1 only.**

## 45. Next skill

Use `$sdd-define` next, scoped only to **Actionable Outcome Foundation**. Define should convert the selected Slice-1 behavior into measurable requirements and acceptance scenarios, resolve the explicitly deferred first-slice decisions needed for delivery, and leave all later learning-loop slices out of implementation scope.
