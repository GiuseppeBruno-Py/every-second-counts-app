# Evidence Recall em Hoje — Define

**Delivery:** 2 — Recall contextual de evidências
**Status:** Shipped
**Roadmap:** Psicocibernética → Compasso
**Priority:** P0
**Date:** 2026-09-14
**Baseline:** `main` at `33891da518b78fa28dc6881267c35bbadad6066e`
**Predecessor:** Delivery 1 — Evidence-Based Calibration, merged by PR #82

## 1. Definition purpose

Define the smallest functional slice that lets Hoje surface one recent, verifiable Evidence related to the Capability of the current next attempt, without motivational inference, semantic similarity, scoring, or new persistence.

This document defines observable behavior and constraints. It does not authorize production implementation or select private helper names.

## 2. Problem and user

The target user is a self-directed learner who uses a Capability and its current nextAttempt to decide what to execute in Hoje.

The product already preserves historical Evidence and resolves its Capability provenance through the canonical Session/Execution context. However, Hoje currently shows the upcoming attempt without bringing a relevant prior Evidence into that moment of decision. The learner must leave the flow, open the Capability, expand its context, and search the history manually.

The missing link is factual recall, not encouragement: immediately before a difficult attempt, the learner should be able to see one concrete thing previously demonstrated in the same Capability and open the original record.

## 3. Target outcome

When the primary next attempt in Hoje belongs to an active Capability with at least one eligible historical Evidence, the same primary card discreetly presents:

> Uma evidência relacionada

followed by the Evidence age/date, its original summary, and an action to open the original Evidence.

The resulting cycle advances by one incremental projection:

```text
CAPACIDADE
→ PRÓXIMA TENTATIVA
→ RECALL DE EVIDÊNCIA RELACIONADA
→ EXECUÇÃO
```

The Evidence remains the source of truth. Recall creates no record, does not change the attempt, and does not claim that the learner will succeed again.

## 4. Prioritized goals

### P0 goals

1. Surface at most one eligible Evidence for the Capability of the current primary next attempt in Hoje.
2. Select the most recent eligible Evidence deterministically, without AI, embeddings, keyword similarity, or cross-Capability inference.
3. Let the learner open the exact original Evidence from the recall card.
4. Keep `Iniciar agora` as the visually and operationally primary action.
5. Show no placeholder, empty card, score, confidence estimate, or motivational assertion when no eligible Evidence exists.
6. Preserve local-first, offline, legacy-data, backup/restore, mobile, and critical accessibility behavior.

### Success measures

- A Capability with no eligible Evidence renders Hoje exactly without a recall card.
- A Capability with eligible Evidence renders one recall card whose source resolves to that same Capability ID.
- With multiple eligible Evidence records, the card chooses the record with the latest occurrence timestamp and remains deterministic on ties.
- `Ver evidência` opens the exact selected record, not merely a text copy or a generic Capability landing state.
- Rendering and opening recall mutate no Capability, nextAttempt, Today item, Session, execution, Evidence, learningSignal, or other persisted record.
- Existing baseline suites remain green with proportional new Node/browser/offline/mobile coverage.

## 5. Scope

### In scope

- The existing primary `Próxima tentativa` card in Hoje when its planned item resolves to an active Capability and current attempt.
- A compact, secondary Evidence recall block inside that context.
- Eligibility based only on an Evidence record, its canonical Session/Execution relationship, and the resolved Capability ID.
- Deterministic selection of one most recent eligible Evidence.
- Readable Evidence summary and age/date presentation.
- An action that opens and focuses the exact original Evidence in an existing history/context surface.
- Immediate re-render behavior after Evidence edit, deletion, restore, Capability archival/removal, or provenance becoming unavailable.
- Existing IndexedDB/localStorage durability, JSON backup/restore, offline cache, responsive layout, keyboard, focus, and touch contracts.
- Documentation and proportional Node/browser/PWA regression evidence.

### Out of scope

- Evidence-Based Calibration changes beyond consuming the already shipped records.
- Rehearsal or preflight for nextAttempt.
- Weekly Review positive questions or semantic changes.
- Error Notebook restructuring.
- Behavioral Experiments or pressure simulation.
- Recall cards for secondary Today rows, arbitrary plan items, Studies, Readings, Goals, Notes, or another Capability.
- Keyword similarity, text matching, fuzzy matching, AI, embeddings, vector storage, or cross-Capability recommendations.
- Importance, quality, confidence, mastery, happiness, self-esteem, capability, progress, or success scoring.
- Motivational copy such as `Você consegue!` or assertions that past performance guarantees future performance.
- Automatic creation of Evidence, learningSignals, nextAttempt changes, Today changes, or analytics.
- A new route, dashboard, collection, schema, migration, storage key, backend, account, cloud sync, dependency, framework, or external service.
- Large redesign of Hoje, Capability, Evidence, navigation, or the Service Worker.

## 6. Requirements

| ID | Priority | Requirement | Measurable result |
| --- | --- | --- | --- |
| R-001 | MUST | Recall SHALL be evaluated only for the current primary `capability-attempt` in Hoje whose Capability is active and whose referenced attempt is current. | No recall block appears for an active Session, planning fallback, ordinary action, completed item, archived/missing Capability, or stale attempt. |
| R-002 | MUST | An eligible Evidence SHALL have a non-empty ID, non-empty summary, valid occurrence timestamp, existing canonical execution identified by `sessionId`, and a complete execution Capability context whose `outcomeId` equals the primary Capability ID. | Malformed, deleted, unlinked, or cross-Capability records cannot appear. |
| R-003 | MUST | Eligibility SHALL NOT use Evidence `domain`, `itemId`, type, title/summary text, linked resources, timestamps alone, learningSignals, or another inferred relationship. | A similar Evidence from another Capability is excluded even when its text is identical. |
| R-004 | MUST | When multiple Evidence records are eligible, recall SHALL choose the latest Evidence occurrence by `createdAt`; equal timestamps SHALL use a stable ID tie-break. | Repeated renders and reloads choose the same single record. Editing an older record does not make its historical occurrence newer. |
| R-005 | MUST | Hoje SHALL render no recall container when zero eligible records exist and exactly one compact block when one or more exist. | No empty-state card, placeholder, carousel, list, or duplicated Evidence appears. |
| R-006 | MUST | The block SHALL identify itself as `Uma evidência relacionada`, show the original Evidence summary and a readable occurrence age/date, and avoid motivational or predictive language. | The UI presents a factual source record without score, percentage, promise, or identity conclusion. |
| R-007 | MUST | `Iniciar agora` SHALL remain the primary action and first execution choice; recall SHALL remain secondary and visually subordinate inside the current card. | Existing Today execution precedence and primary action are unchanged. |
| R-008 | MUST | `Ver evidência` SHALL open and focus the exact selected Evidence in an existing Evidence/history/Capability context without creating a new route. | The learner can distinguish and inspect the source record by its stable ID. |
| R-009 | MUST | Recall SHALL be a read-only derivation and SHALL NOT mutate any persisted collection or completion state. | Deep comparison before/after render and open shows no source or unrelated data change. |
| R-010 | MUST | Evidence deletion or loss of canonical provenance SHALL remove the card on the next render; restoration of valid data SHALL make it eligible again under the same rules. | No deleted/tombstoned or orphaned Evidence remains visible as recall. |
| R-011 | MUST | Legacy data SHALL remain valid and SHALL receive no inferred Capability association. | Old backups and unlinked Session/Evidence load, render, save, and restore without recall fabrication. |
| R-012 | MUST | The feature SHALL require no state-schema, IndexedDB, object-store, localStorage-key, Evidence-shape, Session-shape, Capability-shape, or backup-format change. | `compasso.state.v3` and existing storage/backup contracts remain authoritative. |
| R-013 | MUST | The already-cached PWA SHALL render, open, refresh, and re-resolve recall while offline. | No network request or external service is required for selection or navigation. |
| R-014 | MUST | The recall block and exact-record action SHALL remain usable by keyboard, retain visible focus, expose an accessible name/relationship, meet current touch-target rules, reflow at 360–390 px and 200% zoom, and create no global horizontal overflow. | Existing design-system accessibility contracts and targeted browser checks pass. |
| R-015 | MUST | The generic Capability Evidence and learningSignal surfaces SHALL remain available and semantically unchanged. | Calibration, generic signal CRUD, Evidence edit/delete, and Capability context regressions remain green. |
| R-016 | MUST | Any production JavaScript change SHALL advance the manifest-owned PWA cache generation exactly once while preserving Service Worker architecture and cache ownership. | Manifest/composition/update/offline lifecycle checks pass with one coherent forward generation. |

## 7. Business rules

1. Same Capability means exact equality of the canonical execution context `outcomeId`; it does not require the historical `attemptId` to equal the current attempt ID.
2. Evidence provenance remains `Evidence.sessionId → executionSessions.id → execution.learningContext → outcomeId`.
3. `createdAt` represents when the Evidence occurred and owns recency. `updatedAt` and `editedAt` represent later correction and do not reorder historical recall.
4. Evidence type does not imply quality. All existing Evidence types may be eligible when the factual/provenance requirements pass.
5. The MVP has no reliable importance or quality field, so recency is the sole ranking signal before the deterministic ID tie-break.
6. Only the top executable Capability attempt in Today receives recall. The remaining ordered plan stays compact and unchanged.
7. An active or finishing Session continues to replace the primary next-attempt card; recall does not compete with resume/finish behavior.
8. Recall is a projection, not a new event, read receipt, analytics datum, notification, or learningSignal.
9. The original Evidence remains independently editable/deletable under its existing contract.
10. Missing or malformed references fail closed: the app keeps the underlying legacy record usable but shows no recall.

## 8. Constraints

- Local-first and fully usable offline after the existing shell is cached.
- No AI, embeddings, vector database, backend, account, cloud sync, or external API.
- No new dependency, framework, route, collection, field, schema version, IndexedDB upgrade, or storage key.
- No automatic Evidence, signal, attempt, Capability, Today, review, metric, or score mutation.
- Reuse current Today, Capability, Evidence, navigation, focus, persistence, backup, and PWA abstractions where they satisfy the contract.
- Preserve protected Notes, folders, tags, wikilinks, vault metadata, Relations/graph data, Journal, Active Recall, errors, Contextual AI data, Sessions, Evidence, and learningSignals.
- Preserve the existing primary-action hierarchy and small-viewport layout.
- Do not change Service Worker architecture; production asset changes use manifest-owned generation.

## 9. Dependencies

- Shipped Capability and nextAttempt model in `learningOutcomes`.
- Existing `dailyPlans[].items[].type === 'capability-attempt'` references.
- Canonical execution context in `executionSessions[].learningContext`.
- Existing Evidence records and `sessionId` provenance.
- Existing Today primary-state and render behavior.
- Existing Capability context/history and Evidence navigation surfaces.
- Existing state v3 normalization/merge/tombstone behavior.
- Existing IndexedDB/localStorage, JSON backup/restore, app manifest, composition, and PWA lifecycle.
- Delivery 1 is merged and provides the current v81 baseline; its calibration behavior is preserved, not required for recall eligibility.

## 10. Assumptions

1. `origin/main@33891da518b78fa28dc6881267c35bbadad6066e` is the implementation baseline and has the same product tree verified in Delivery 1.
2. The current primary Today resolver remains authoritative for deciding which attempt can execute next.
3. A canonical execution with a complete Capability reference is stronger provenance than Evidence `domain` or `itemId`.
4. Existing valid Evidence created by Session and Deep Work includes a stable ID, summary, `sessionId`, and ISO `createdAt`.
5. Exact-record navigation can be composed from an existing history or Capability context surface; Design must prove the least disruptive route and focus target.
6. There is no trustworthy persisted Evidence importance/quality signal in the current model.
7. Relative age copy may use the user's local calendar, but ranking remains timestamp-based and timezone-independent after ISO normalization.

## 11. Open questions

No product decision blocks Design.

Design must inspect and choose the smallest existing exact-record navigation target. It must not weaken R-008 into merely opening the Capability or showing a copied summary.

## 12. Acceptance scenarios

### AC-01 — No related Evidence

**Given** the primary next attempt belongs to an active Capability with no eligible Evidence, **when** Hoje renders, **then** the next-attempt card remains usable and contains no recall block or empty placeholder.

### AC-02 — One related Evidence

**Given** one valid Evidence resolves canonically to the primary Capability, **when** Hoje renders, **then** one secondary block shows `Uma evidência relacionada`, the original summary, occurrence age/date, and `Ver evidência`.

### AC-03 — Correct Capability isolation

**Given** Evidence records with identical or similar text belong to different Capabilities, **when** one Capability is primary in Hoje, **then** only Evidence whose canonical execution `outcomeId` matches that Capability is eligible.

### AC-04 — Most recent selection

**Given** several eligible Evidence records for the same Capability have different `createdAt` values, **when** Hoje renders, **then** exactly the latest occurrence is shown regardless of array order or later edits to older records.

### AC-05 — Deterministic tie

**Given** two eligible Evidence records have the same `createdAt`, **when** Hoje renders repeatedly and after reload, **then** one stable ID tie-break selects the same exact record every time.

### AC-06 — Exact original Evidence

**Given** a recall block is visible, **when** the learner activates `Ver evidência`, **then** an existing context/history surface opens, the exact Evidence identified by the selected ID is visible and focused or announced, and no unrelated Evidence is substituted.

### AC-07 — Primary action hierarchy

**Given** a recall block is visible, **when** the learner navigates the primary card by pointer or keyboard, **then** `Iniciar agora` remains the primary execution action and recall does not alter Today ordering, start behavior, or global Executar precedence.

### AC-08 — Read-only behavior

**Given** a valid recall source, **when** Hoje renders and the learner opens the original Evidence, **then** Capability, nextAttempt, daily plan, Session, execution, Evidence, learningSignals, and protected domains are deeply unchanged.

### AC-09 — Evidence removed

**Given** the currently recalled Evidence is deleted through the existing supported flow, **when** Hoje renders again, **then** that record is absent and the next eligible recent Evidence is shown, or no block appears when none remains.

### AC-10 — Broken or legacy provenance

**Given** Evidence has a missing Session/execution, incomplete Capability reference, malformed timestamp/summary, or only legacy `domain`/`itemId` resemblance, **when** Hoje renders, **then** the app remains usable and shows no recall derived from that record.

### AC-11 — Archived, missing, stale, or completed attempt

**Given** the Today reference resolves to an archived/missing Capability, historical attempt, or completed plan item, **when** Hoje renders, **then** existing unavailable/historical behavior remains and no recall block appears.

### AC-12 — Active execution precedence

**Given** a Session or Deep Work execution is active, paused, or finishing, **when** Hoje renders, **then** the existing resume/finish card remains primary and no next-attempt recall displaces it.

### AC-13 — Backup and restore

**Given** an old valid backup or a current backup containing several linked and unlinked Evidence records, **when** it is restored and Hoje renders, **then** restore remains valid and recall is derived only from the eligible canonical records without modifying the restored state.

### AC-14 — Offline and refresh

**Given** the complete shell is already cached and the browser is offline, **when** Hoje renders, `Ver evidência` is used, and the page refreshes, **then** the same eligible original Evidence remains available without a network request.

### AC-15 — Mobile and accessibility

**Given** a 360–390 px viewport, coarse pointer, keyboard navigation, or 200% zoom, **when** recall is rendered and opened, **then** content reflows without global overflow, the exact-record action has a visible focus and accessible name, touch targets meet the current contract, and focus moves predictably to the source.

### AC-16 — Existing flow regression

**Given** the learner uses Delivery 1 calibration, generic learning signals, Evidence edit/delete, Capability context, Today start/configure, JSON backup/restore, or PWA update/offline behavior, **when** those flows execute, **then** their existing semantics remain unchanged and all confirmed persistence remains durable.

## 13. Error and recovery scenarios

- If Evidence normalization or timestamp parsing fails, exclude only that record and continue rendering Hoje.
- If its execution or complete Capability reference is absent, keep the historical data untouched and exclude it from recall.
- If the selected Evidence disappears between render and activation, fail closed, return to a stable existing context, and do not open a different Evidence silently.
- If the Capability becomes archived, deleted, or changes attempt before activation, revalidate the current primary context and do not infer eligibility.
- If Evidence is edited, re-render its current summary while preserving ranking by original `createdAt`.
- If all eligible records are removed, remove the recall block rather than rendering an empty state.
- If an old backup lacks linked execution context, restore it normally without fabricating recall.
- If offline navigation cannot resolve the exact source, keep Hoje usable and expose no false success state.

## 14. Baseline evidence

- Branch: `codex/evidence-recall-today`.
- Worktree: `C:\Users\Giuse\OneDrive\Documentos\Every Second Counts\every-second-counts-app-evidence-recall-today`.
- Baseline: `origin/main@33891da518b78fa28dc6881267c35bbadad6066e`.
- Delivery 1 merge: PR #82, merge commit `33891da518b78fa28dc6881267c35bbadad6066e`.
- Remote checks on merged source tree: Browser tests PASS; GitGuardian PASS.
- Tree equality with verified Delivery 1 head `73dc077bc1e58d866f408790a88dc57fde49a731`: PASS.
- Fresh local command: `npm test`.
- Fresh local result: **213 passed, 0 failed, 0 skipped**.
- `.codegraph/`: absent; direct source, tests, docs, and archived SDD artifacts were authoritative.
- `npm ci`: PASS; two high-severity audit findings remain outside this no-dependency delivery and no automatic fix was run.

## 15. Clarity score

| Dimension | Score | Evidence |
| --- | ---: | --- |
| Problem | 3/3 | The missing contextual bridge between a planned attempt and verifiable historical Evidence is explicit. |
| Users | 3/3 | The existing local-first learner using Capability, Hoje, Session, and Evidence is explicit. |
| Goals | 3/3 | Six P0 goals define selection, navigation, hierarchy, absence, and compatibility. |
| Success | 3/3 | Six measurable outcomes and sixteen Given/When/Then scenarios cover happy, boundary, error, recovery, offline, and accessibility behavior. |
| Scope | 3/3 | In-scope projection, ranking rules, exact non-goals, data boundaries, and later deliveries are explicit. |
| **Total** | **15/15** | **Ready for Design.** |

## 16. Gate result

- Measurable requirements: PASS.
- In/out scope: PASS.
- Business rules and constraints: PASS.
- Happy, boundary, error, recovery, legacy, offline, mobile, and accessibility scenarios: PASS.
- Clarity: 15/15.
- Production implementation: complete within the approved 12-path manifest; verification is recorded in `.sdd/reports/evidence-recall-today/BUILD_REPORT.md`.

**Readiness: PASS — Build completed and ready for independent review/Ship on explicit continuation.**

## 17. Revision history

| Revision | Date | Change |
| --- | --- | --- |
| 1.0 | 2026-09-14 | Initial DEFINE for Delivery 2, grounded in merged Delivery 1 and the current Today/Evidence contracts. |
| 1.1 | 2026-09-14 | Design gate passed at 15/15; exact-record navigation and the closed Build manifest were approved. |
| 1.2 | 2026-09-14 | Build completed within the approved manifest; 216 Node and 239 browser tests passed. |
| 1.3 | 2026-09-14 | Phase 4 verification passed and the accepted artifacts were archived. |
