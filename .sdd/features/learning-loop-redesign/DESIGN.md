# Learning Loop Redesign — Technical Design

**Slice:** 1 — Actionable Outcome Foundation
**Status:** Complete (Built) — Revision 2
**Revision:** 2 — 2026-08-08 — Win32 visual-baseline manifest iteration
**Iteration classification:** Additive test-evidence architecture; no product requirement or acceptance-criterion change
**Baseline:** `934d7bad50d3a72d534d14890457e44e34e772ac` on `codex/learning-loop-redesign`
**Authoritative requirements:** `DEFINE.md`, clarity 15/15, 26 requirements, 36 acceptance criteria
**Phase boundary:** Design only. Revision 2 authorizes a snapshot-evidence Build continuation; it authorizes no product implementation or test-configuration change.

## 1. Scope and design gate

This design implements only the first independently shippable learning-loop slice. It adds a durable capability-oriented object with a required current next attempt, optional proof criterion, optional Study/Reading references, and active/archive lifecycle. Evidence, sessions, Today, Goals, Notes, Relations, Review, Results, Consistency, retrieval, RAIL, and GRINDE remain frozen.

Revision 2 resolves a post-Build validation-manifest gap. Product behavior and all 36 acceptance criteria remain unchanged. The only new Build work is the controlled review and possible promotion of three host-specific Win32 screenshot baselines already produced as disposable evidence candidates. A candidate is not truth: Build must visually inspect it, compare it with the accepted Linux baseline and current design semantics, confirm that differences are expected, and only then place it at the exact authorized path.

The current worktree has no `.codegraph/` index, so architecture and blast radius were verified directly from current source, tests, documentation, manifest, and CI. The installed Design skill's referenced template is not packaged; this artifact follows the skill's complete required section contract directly.

## 2. Current architecture and concrete gap

| Concern | Current owner and exact behavior | Slice-1 gap |
| --- | --- | --- |
| Base/default state | `index.html` `initialData`, `loadData()`, `normalizeData()` | No `learningOutcomes` default or record normalization. |
| State catalog and merge | `app-manifest.js` `collections`; `state-foundation.js` `migrate()`/`merge()` | No collection identity, merge, tombstone, or logical schema v3 contract. |
| Persistence | `storage.js`; serialized full state in IndexedDB `compasso-db/appState`, DB and storage schema version 1; bounded localStorage mirror/fallback | The new collection can use the existing record; no object-store support is needed. |
| Save/error path | `index.html` `saveData()` calls `CompassoStorage.save()` but does not await its existing `Promise<boolean>` and always emits success | Outcome writes need reliable success/failure feedback and reversible staged mutation. |
| JSON backup | `index.html` exports `state.data`; import parses and replaces `state.data` through `normalizeData()` | Collection will export automatically, but restore normalization must understand it. |
| Drive merge | Manifest catalog plus `drive-sync-feature.js`/`state-foundation.js` merge record arrays by stable `id` and `updatedAt`; tombstones prevent resurrection | Collection must enter the catalog and every nested change must touch the parent outcome timestamp. |
| Frentes | `information-architecture-model.js` view descriptors; `information-architecture-feature.js` renders hub cards and routes through `switchView()` | No neutral outcome peer view. Frentes is navigation, not a domain superclass. |
| Legacy front UI | `index.html` `renderGrid()`, `metricInfo()`, `statusLabels`, item dialog | These paths automatically imply progress/status and must not be reused. |
| Feature composition | `app-manifest.js` ordered modules/assets; `feature-runtime.js` hooks/actions/routes; `ux-consolidation-feature.js` installs the runtime | A dedicated model/feature pair must register before runtime installation and IA ownership. |
| UI system | `design-system.css`, model, and feature; existing dialogs are enhanced centrally | Outcome styles must be static in `design-system.css`; no runtime `<style>` injection. |
| Tests and CI | Node `tests/*.test.js`; Playwright `tests/browser`; CI runs `npm run test:all` | New files are automatically discovered; no workflow change is needed. |

## 3. Target architecture

The selected design has four responsibilities:

1. **Pure domain model — `learning-outcome-model.js`:** owns exact record shape, validation, normalization, deterministic ordering, resource-reference deduplication, lifecycle transitions, deletion/tombstone behavior, and isolation-preserving immutable operations.
2. **Dedicated UI feature — `learning-outcome-feature.js`:** owns the Capabilities surface, dialog, form draft, resource resolution, list/archive modes, commands/actions, staged asynchronous persistence, and recovery messages.
3. **Shared compatibility spine:** `app-manifest.js`, `state-foundation.js`, and `index.html` add the collection, logical schema v3, default/restore normalization, asynchronous save result, module/PWA generation, and backup pass-through.
4. **Existing IA/design system:** `information-architecture-model.js` adds one peer descriptor; `design-system.css` supplies static responsive/accessibility styling. Existing IA and design-system feature code remains unchanged.

No new framework, database, object store, service, dependency, generic Front abstraction, or cross-domain relation store is introduced.

## 4. Architecture alternatives

| Alternative | Assessment | Decision |
| --- | --- | --- |
| A. Extend generic/front logic | Fewer files, but inherits `progress`, `done`, metric, and resource-container semantics. | Rejected. |
| B. Dedicated outcome model/feature integrated as a Frentes peer | Two focused files, clean domain ownership, testable normalization, and a future attempt/evidence seam. | **Selected.** |
| C. Put domain logic inside Frentes/IA | Superficially simple, but couples navigation rendering to durable learning data and future loop behavior. | Rejected. |

Alternative B is the smallest architecture that prevents capability objects from inheriting legacy front progress semantics.

## 5. Domain boundaries

- `learningOutcomes` owns the outcome, proof, resource references, current next attempt, lifecycle, and timestamps.
- `study` and `reading` remain independent source collections. The outcome stores one-way references; reverse links are derived by scanning outcomes if ever needed.
- `goal`, `dailyPlans`, sessions, Evidence, Notes, Journal, weekly plans, recall, and analytics are neither read nor written by domain transitions, except that the UI reads Study/Reading identity/title to render optional resource choices.
- Relations/wikilinks are not used. An outcome resource reference is a dedicated typed local identifier, not a relationship UI record.
- No property named `progress`, `percentage`, `mastery`, `confidence`, `completedAt`, `demonstratedAt`, `evidenceIds`, or `sessionId` is accepted in the normalized Slice-1 record.

## 6. Exact durable outcome representation

```js
{
  id: "<crypto.randomUUID()>",
  capability: "Identificar quando uma operação PySpark provoca shuffle.",
  proofCriterion: "Explicar a causa em um plano desconhecido." | null,
  resourceRefs: [
    { type: "study", id: "example-study" },
    { type: "reading", id: "example-reading" }
  ],
  nextAttempt: {
    id: "<crypto.randomUUID()>",
    text: "Analisar um execution plan sem consultar as anotações.",
    createdAt: "<ISO-8601>",
    updatedAt: "<ISO-8601>"
  },
  status: "active" | "archived",
  archivedAt: null | "<ISO-8601>",
  createdAt: "<ISO-8601>",
  updatedAt: "<ISO-8601>"
}
```

New records use `crypto.randomUUID()` for both durable identities. Model functions accept injected `idFactory` and `now` values for deterministic tests. User-authored fields trim outer whitespace while preserving internal whitespace, line breaks, Unicode, and punctuation. The UI limits capability, proof, and attempt fields to 1,000 characters, consistent with current 800–1,200 character narrative-field conventions; the model rejects blank required text and truncates no valid stored content silently.

`proofCriterion: null` is the canonical absent representation. `resourceRefs` is always an array. `archivedAt` is null for active records. No speculative future fields are stored.

## 7. Embedded next-attempt representation

The next attempt is a small object, not a string, because stable identity and timestamps provide a non-destructive future extraction seam. Its `id` identifies the single current embedded attempt object, not an immutable history event.

- Creating an outcome creates exactly one attempt object.
- Editing/replacing its text preserves the nested `id` and `createdAt`, and updates both `nextAttempt.updatedAt` and parent `updatedAt`.
- Clearing it makes the draft invalid. The UI keeps the draft open, focuses the attempt field, and requires replacement before save.
- There is no separate remove action that can persist an outcome without an attempt.
- There is no completion control, history, result, evidence, session, Today, or `completedAt` field.
- A future migration can copy this object once into an attempts collection with `outcomeId`, retaining identity/text/timestamps; Slice 1 creates no such collection or pointer.

Parent-record timestamp merge is authoritative: any attempt edit touches the outcome `updatedAt`, so the newest whole outcome wins. Equal parent timestamps with different content use the existing conflict-preservation behavior rather than attempting a speculative nested merge.

## 8. Proof criterion representation

The proof criterion is `string | null`, never an array or rubric. Missing, undefined, non-string, empty, and whitespace-only values normalize to null. Add/edit/remove changes only this field and parent `updatedAt`. The list/detail surface renders it as secondary text only when non-null. JSON backup uses null for absence and preserves valid text on round-trip.

## 9. Resource-reference representation

`resourceRefs` contains only `{type, id}` objects where `type` is exactly `study` or `reading` and `id` is a non-blank string. It is owned only by the outcome.

- Normalization removes malformed refs and duplicates by `${type}:${id}`, preserving the first valid occurrence.
- It does not check target existence, so valid-but-missing references remain durable.
- Checkbox selection order is normalized to Study source order followed by Reading source order, giving stable backup and display behavior without manual sorting.
- One source record can appear in any number of outcomes; no reverse-reference field is added to Study/Reading.
- Link/unlink creates a new outcome value and never mutates, copies, archives, deletes, or recalculates the resource.
- Display resolution builds local maps from current Study/Reading arrays and is linear in personal dataset size.

## 10. Missing-resource behavior

A valid typed reference whose target cannot be found remains persisted until the user removes it. The card/dialog renders its type plus a non-color-only “Recurso indisponível” state and an accessible unlink control. The rest of the outcome remains fully readable/editable. Normalization never prunes the reference merely because a current source collection lacks the target, and no resource is recreated.

This preserves user intent and allows restore/merge order to resolve a temporarily missing target later.

## 11. Normalization and idempotence

`CompassoLearningOutcomeModel.normalizeCollection(value)` returns a new canonical array and never mutates unrelated state.

| Input condition | Exact behavior |
| --- | --- |
| Missing/non-array collection | Normalize to `[]`. |
| Non-object entry | Reject that entry only. |
| Missing/blank outcome `id` | Reject entry; do not invent durable identity during restore. |
| Missing/blank capability | Reject entry; do not fabricate user meaning. |
| Missing/blank next-attempt text | Reject entry; a persisted outcome cannot be made valid synthetically. |
| String next attempt or object missing nested ID | Preserve valid text; derive deterministic nested ID `${outcome.id}:next` and deterministic timestamps from the outcome. |
| Invalid/missing timestamps | Use the other valid record timestamp, else the fixed epoch; never use current time during normalization. |
| Invalid status | Normalize to `active`; preserve content rather than discard it. |
| Archived with missing invalid `archivedAt` | Use canonical `updatedAt`; active always normalizes it to null. |
| Missing/blank/non-string proof | Normalize to null. |
| Malformed/duplicate refs | Drop malformed refs and retain first unique typed ID. |
| Duplicate outcome IDs | Retain the valid record with the newest `updatedAt`; equal timestamp retains the first valid record. |
| Forbidden/speculative fields | Omit them from the canonical returned object. |

Running normalization repeatedly yields deep-equal output. Invalid entries are isolated; they do not invalidate the surrounding backup/state or unrelated collections.

## 12. Lifecycle and state transitions

```text
create → active ⇄ archived
                  ↘ delete
active ────────────↗
```

- `create`: capability and attempt required; status active; `archivedAt` null.
- `archive`: reversible, no confirmation; status archived; `archivedAt` and parent `updatedAt` set to now.
- `reactivate`: reversible; status active; `archivedAt` null; parent `updatedAt` set to now.
- `delete`: permitted from active or archived state after explicit confirmation; outcome removed and a `learningOutcomes:<id>` tombstone recorded through the current sync convention. Nothing else is deleted.
- There is no completed/demonstrated/mastered transition.

## 13. Persistence integration and migration classification

**Classification: Additive logical-state migration.**

The implementation will:

1. Add `learningOutcomes` as a sync-enabled timestamp-merged array collection in `app-manifest.js`.
2. Advance the application state contract from `compasso.state.v2` to `compasso.state.v3`.
3. Advance `state-foundation.js` `_schema.version` and `_sync.schemaVersion` from 2 to 3 and always initialize a missing/invalid `learningOutcomes` collection to `[]`.
4. Add `learningOutcomes: []` to `index.html` `initialData` and invoke model normalization from `normalizeData()` whenever the model is loaded.
5. Let the model normalize `state.data.learningOutcomes` once when its composed module executes, covering startup because `state` is constructed before composed modules run.

`storage.js` remains unchanged: `DB_VERSION = 1`, `SCHEMA_VERSION = 1`, and the existing `appState` object store already serializes the whole state. There is no IndexedDB schema migration, new object store, or data-copy pass.

`app-manifest.js` adds both new modules to ordered assets/browser journeys and advances the PWA generation from `compasso-pages-v70` to `compasso-pages-v71` only after the feature and tests are complete. Manifest API `version: 1` remains unchanged.

## 14. Save, mutation, and error contract

`index.html` `saveData()` will return/await the existing `CompassoStorage.save()` `Promise<boolean>` and emit success only when it resolves true. Existing callers may ignore the returned promise without breaking their call sites.

The outcome feature stages immutable candidate state:

1. Preserve the previous outcome collection and relevant `_sync` metadata.
2. Apply the model transition to `state.data` and call `await saveData(...)` with controls disabled/loading.
3. On success, close the dialog if applicable, announce success, and render.
4. On false/rejection, restore the prior collection/sync metadata, best-effort re-save the last valid state, re-render, keep form draft/dialog open when applicable, and show an inline `role="alert"` recovery message. Archive/delete failures restore the card and announce that the change was not saved.

This avoids false success and prevents a failed outcome write from leaking changes into unrelated domains. Concurrent submission is prevented while the promise is pending.

## 15. Backup, restore, and merge

### JSON export

The existing export serializes the whole `state.data`, so a catalogued `learningOutcomes` array is included without a new format or export branch. All canonical fields round-trip. Markdown vault code is unchanged.

### JSON restore

The existing import is a **replace**, not a merge: after top-level backup validation, `state.data = normalizeData(imported)` and the full state is saved.

- Legacy backup without the key: model/state migration adds `learningOutcomes: []`; no outcomes are fabricated.
- New backup: valid records normalize and replace the current collection once; valid resource refs remain even if targets are missing.
- Malformed record: only that record is rejected/normalized; other outcomes and unrelated imported domains remain.
- Duplicate IDs/refs: deterministic normalization prevents duplicates.
- Re-import repeats the existing replace contract; it does not append or create a feature-specific merge mode.

### Sync/merge

The collection participates in current manifest-driven record merge using `id`, parent `updatedAt`, tombstones, and conflict preservation. Nested attempt/proof/ref changes always update the parent timestamp. No bidirectional link merge or independent nested-attempt merge is introduced.

Supported compatibility is current app ← legacy backup and current app ← Slice-1 backup. Older historical app ← newer backup is not promised.

## 16. Rollback and data-preservation analysis

### Source proof

The baseline `normalizeData()` mutates/returns the input object while normalizing known domains; it does not reconstruct a whitelist object. `loadData()` returns that normalized object, and `saveData()` serializes all of `state.data`. Baseline `state-foundation.migrate()` also retains unknown top-level keys. Therefore a local rollback to the baseline hides but does not silently discard an existing `learningOutcomes` array during ordinary load/edit/save/export.

### Before publication

Revert the complete feature unit, tests, manifest generation, and logical schema changes. No user outcome data exists from the unpublished build.

### After persisted outcomes exist

A published rollback must be a **forward PWA generation**, not a reused v70/v71 cache or a raw Git revert. It must retain the v3 compatibility spine: `learningOutcomes` collection catalog, state normalization/pass-through, JSON backup preservation, and unknown-field-safe saving. The outcome UI/route may be disabled if necessary, but durable data must remain stored/exportable. Do not instruct users to reset state or restore an older backup as rollback.

Even though the current baseline locally preserves the unknown key, it cannot use the feature and does not guarantee newer-backup or remote-sync behavior; therefore it is a diagnostic fallback, not the supported post-publication rollback package.

## 17. Frentes integration and naming

| Decision | Value | Rationale |
| --- | --- | --- |
| Collection/domain key | `learningOutcomes` | Explicit durable concept, distinct from existing `outcomes` weekly-results route. |
| Route/view key | `capabilities` | Avoids collision with current Review `outcomes` and keeps URL concise. |
| Display label | **Capacidades** | Natural and concise pt-BR, low jargon, useful as a peer label, and does not say mastered. |
| Description | “Defina o que quer conseguir fazer e sua próxima tentativa.” | Explains capability and action without pedagogy terminology. |
| Existing icon | `compass` | Reuses current SVG vocabulary and conveys direction rather than completion. |
| Frentes order | 10 | Places capability before Reading 20, Study 30, Goal 40 while preserving their relative order. |
| IA level | `essential` | The organizing unit is a core Slice-1 surface. |

`information-architecture-model.js` adds the peer descriptor. The feature creates `#capabilitiesView`, registers `labels.capabilities`, and owns its rendering. Existing IA automatically renders the Frentes card, URL `?view=capabilities`, history, deep-link, reload, and five-primary-area highlighting. `information-architecture-feature.js` needs no change.

## 18. List and empty-state UX

The Capabilities surface uses a compact responsive card list, not a dashboard.

- Header: “Capacidades” plus primary “Nova capacidade” action.
- Mode control: semantic two-option tabs/buttons “Ativas” (default) and “Arquivadas”, with count-free labels and accessible selected state.
- Empty active state: “O que você quer conseguir fazer?” plus creation action.
- Empty archived state: explains that archived capabilities remain preserved and can be reactivated.
- Card primary text: capability.
- Secondary blocks: proof criterion only when present; resource chips/links or “Sem recursos vinculados”; “Próxima tentativa” text always present.
- Actions: Editar, Arquivar/Reativar, and destructive Excluir in the secondary action area.
- Active and archived lists sort by `updatedAt` descending, then `createdAt` descending, then `id` ascending.
- Long text wraps with `overflow-wrap:anywhere`; no fixed-height truncation hides content.
- No percentage, bar, status score, confidence, streak, badge, count metric, complete button, or resource-completion value appears.

## 19. Creation and editing UX

A single existing-style `<dialog>` is used because Compasso already centralizes modal focus enhancement and responsive dialog-to-drawer behavior.

Form order:

1. Required textarea “O que você quer conseguir fazer?” (`maxlength=1000`).
2. Collapsible optional section containing “Como você vai saber que conseguiu?” and Study/Reading checkbox groups.
3. Required textarea “O que você vai tentar agora?” (`maxlength=1000`) with short examples that guide but do not validate semantics.

The optional resource area lists current active/planned Studies and Readings; existing linked paused/done resources remain selectable/displayable during edit so links are not silently lost. If none exist, the form states that resources can be linked later. It does not create resources.

Create and edit use the same dialog. Opening edit copies the canonical outcome into a feature-owned draft; cancel never mutates persisted state. If a dirty creation/edit is cancelled by button, Escape, or backdrop, an explicit discard confirmation is required. Validation errors retain every draft field, apply `aria-invalid`/`aria-describedby`, populate an inline alert, and focus the first invalid required field. Successful save returns focus to the opener/card action.

## 20. Archive, reactivate, and delete UX

- Archive is a one-click reversible secondary action with no confirmation. Success moves the card from active view; failure restores it and reports recovery.
- Reactivate is available in the archived view and returns the outcome to active ordering.
- Archive language never says completed, learned, or mastered.
- Delete is available from edit/secondary actions for both states, uses the current native explicit-confirmation convention, and names that only the capability record will be permanently removed.
- Cancelling delete performs no mutation/write and returns focus to the trigger.
- Confirmed deletion removes only the outcome and records its tombstone; linked resources and all other domains remain byte/deep-equal.

## 21. Offline and PWA behavior

All domain/UI operations read and write local state only. The new JS files are manifest modules/assets and browser-journey assets, so the existing composer and Service Worker include them in the complete app shell. `design-system.css` is already cached. No Service Worker lifecycle code changes.

The cache generation advances to v71 so installed clients cannot mix the new manifest with an older complete cache. PWA evidence must create an outcome, flush storage, reload/reopen offline under the controlled composed shell, and verify the capability/attempt remain available.

## 22. Accessibility and responsive behavior

- Semantic heading/list/article structure; native buttons, checkbox groups, dialog, form, and labels.
- Visible focus and existing design-system focus trap/return behavior.
- Required errors linked with `aria-describedby`; persistence errors in `role="alert"`; lifecycle meaning appears in text, not color only.
- All interactive controls meet the current 44px coarse-pointer contract.
- Dialog becomes the existing drawer treatment below 768px and remains scrollable within viewport.
- Geometry is tested at 360, 768, and 1280px; 200% zoom is tested by a viewport/scale-equivalent layout assertion where browser zoom automation is reliable.
- Long capability/proof/attempt and many resource chips wrap without page overflow.
- No feature animation is required; any inherited transition obeys existing `prefers-reduced-motion` rules.

## 23. Data-isolation and no-progress protection

Every create/update/archive/reactivate operation replaces only one record in `state.data.learningOutcomes`. Delete additionally changes only its tombstone entry and sync timestamp. Study/Reading are lookup inputs and are never assigned to.

The dedicated feature never calls `renderGrid()`, `metricInfo()`, generic item `openDialog()`, `data-complete`, Today commands, session services, evidence services, or goal-link functions. The record shape and canonical normalizer omit legacy `progress`, metric, `done`, and completion fields. Static/model/browser tests assert the absence of forbidden fields and UI.

## 24. Future attempt/evidence seam

A later approved migration may enumerate outcomes, copy each current `nextAttempt` to a new attempts collection with `outcomeId`, retain its nested identity/text/timestamps, and replace the embedded field with an approved reference. That future migration must be versioned and idempotent. Slice 1 neither creates the future collection nor stores evidence/session placeholders.

## 25. Closed Build file manifest

Exactly **19 files** are authorized for Build Revision 2: 7 production files, 10 test/evidence files, and 2 SDD evidence/metadata files. There are no moves or deletes. The first 16 entries preserve the approved Revision-1 implementation manifest; the final three entries are the only additive authorization from this Iterate.

| Action | Exact path | Responsibility/purpose | Dependencies | Requirement / AC coverage |
| --- | --- | --- | --- | --- |
| Create | `learning-outcome-model.js` | Exact schema, validation, normalization, ordering, refs, lifecycle, isolated transitions, tombstone deletion. | `app-manifest.js` contract only; Node-compatible UMD pattern. | REQ-01–10, 15–21; AC-01–17, 25–32 |
| Create | `learning-outcome-feature.js` | Capabilities surface/dialog/actions, draft, resource resolution, staged persistence, errors, focus, lifecycle UI. | Model, runtime, global state/save, existing design system. | REQ-02–17, 22–25; AC-02–25, 27, 30, 33–36 |
| Modify | `app-manifest.js` | Register model/feature modules, browser journey/assets, `learningOutcomes` collection, state v3, cache v71. | New JS files; existing composition. | REQ-18–22, 26; AC-18, 26–33 |
| Modify | `state-foundation.js` | Logical schema v3, empty collection initialization, record merge/tombstone/conflict compatibility. | Manifest collection. | REQ-18–21; AC-26, 28, 29, 31, 32 |
| Modify | `index.html` | Default collection, model-aware normalize/restore, awaited save result/rollback support, label/surface compatibility, visible version fallback. | Model and storage existing API. | REQ-01, 18–22, 25; AC-01, 03, 26–33, 36 |
| Modify | `information-architecture-model.js` | Add essential Frentes peer `capabilities`, label, order, description, existing icon. | Feature-created view. | REQ-11–13; AC-18–22 |
| Modify | `design-system.css` | Static outcome list/dialog/resource/error/archive responsive and accessible styles. | Existing tokens/primitives. | REQ-12–14, 23–25; AC-04, 20–24, 34–36 |
| Create | `tests/learning-outcome-model.test.js` | Unit/data contract, normalization/idempotence, refs, lifecycle, deletion, isolation, backup round-trip representation. | New model. | AC-01–17, 25–32 |
| Modify | `tests/app-manifest.test.js` | Module order/assets, collection sync contract, state v3, v71 visible generation. | Manifest/new modules. | AC-18, 26–29, 33 |
| Modify | `tests/state-foundation.test.js` | v3 initialization/idempotence, outcome merge/conflict/tombstone, legacy field preservation. | Manifest/model fixtures. | AC-26, 28, 29, 32 |
| Modify | `tests/information-architecture-model.test.js` | Frentes peer/essential order and fixed five areas. | IA model. | AC-18–20 |
| Create | `tests/browser/learning-outcome-flows.spec.js` | Full CRUD, validation, resources, missing refs, backup, failure, responsive/a11y/no-progress/isolation. | Journey fixture and new feature. | AC-01–25, 27, 30–36 |
| Modify | `tests/browser/information-architecture-flows.spec.js` | Frentes card, `?view=capabilities`, reload/back and five-area preservation. | IA/new feature. | AC-18–20, 33 |
| Modify | `tests/browser/pwa-lifecycle-flows.spec.js` | Outcome persistence across controlled offline reload/reopen and v71 asset composition. | Full PWA fixture. | AC-27, 30, 33 |
| Create after visual acceptance | `tests/browser/design-system-flows.spec.js-snapshots/design-system-360-chromium-win32.png` | Windows Chromium baseline for the existing 360px visual assertion. | Reviewed candidate from `test-results/generated-win32-snapshots/`; existing visual test and 2% threshold. | REQ-23, 24, 26; AC-34, 35 |
| Create after visual acceptance | `tests/browser/design-system-flows.spec.js-snapshots/design-system-768-chromium-win32.png` | Windows Chromium baseline for the existing 768px visual assertion. | Reviewed candidate from `test-results/generated-win32-snapshots/`; existing visual test and 2% threshold. | REQ-23, 24, 26; AC-34, 35 |
| Create after visual acceptance | `tests/browser/design-system-flows.spec.js-snapshots/design-system-1280-chromium-win32.png` | Windows Chromium baseline for the existing 1280px visual assertion. | Reviewed candidate from `test-results/generated-win32-snapshots/`; existing visual test and 2% threshold. | REQ-23, 24, 26; AC-34, 35 |
| Create | `.sdd/reports/learning-loop-redesign/BUILD_REPORT.md` | Record exact implementation diff, commands/results, 36-AC evidence, limitations, rollback and Build gate. | All Build work/evidence. | REQ-26; AC-01–36 |
| Modify (metadata only) | `.sdd/features/learning-loop-redesign/DESIGN.md` | Build may update status/revision metadata and append conformance note only; architecture changes require Iterate. | `$sdd-build` lifecycle. | Workflow gate; AC-01–36 |

### Frozen files and domains

`storage.js`, `service-worker.js`, `app-composition.js`, `information-architecture-feature.js`, `design-system-feature.js`, `app-services.js`, Studies/Readings/Goals feature logic, Today, sessions, Evidence, Notes, Relations, Journal, weekly planning, recall, analytics, Markdown vault, Drive feature code, CI workflows, dependencies, and all later-slice SDD artifacts are frozen. During the Revision-2 Build continuation, product implementation is additionally frozen: `learning-outcome-model.js`, `learning-outcome-feature.js`, `state-foundation.js`, `information-architecture-model.js`, `design-system.css`, `app-manifest.js` product behavior, and `index.html` product behavior must not change merely to close the snapshot gate. `playwright.config.js`, `tests/browser/design-system-flows.spec.js`, and the three tracked Linux baselines remain frozen. Any genuine product regression found during visual review requires a separate Iterate decision before code changes.

## 26. Dependency-ordered implementation sequence

1. Create model and its focused Node tests; close canonical shape, normalization, transitions, isolation, and round-trip behavior.
2. Add manifest collection/modules/state contract and state-foundation logical v3; extend manifest/state tests. Do not bump cache generation yet.
3. Update `index.html` default/normalization/save-result path; validate legacy state, new state, restore replacement, and rollback preservation before UI.
4. Add IA peer descriptor and IA tests; confirm exactly five primary areas and existing peer relative order.
5. Create feature surface/dialog/list/actions with staged persistence and no generic-front calls.
6. Add static CSS and verify keyboard, focus, long content, 360/768/1280, 200% zoom, and 44px behavior.
7. Add browser CRUD/backup/failure/isolation tests and IA deep-link tests.
8. Extend PWA lifecycle evidence for local outcome offline reload/reopen.
9. Run focused Node/browser commands; fix only within manifest.
10. Advance cache generation once to v71, update exact assertions, recompose fixtures, and run complete validation.
11. Create `BUILD_REPORT.md`, reconcile 36/36 ACs, inspect diff/status, and stop at the Build gate.

### Revision-2 Build continuation sequence

12. Reinspect all three Win32 candidates at original resolution and compare each with the corresponding tracked Linux image, current UI semantics, dimensions, and pixel-difference evidence. Confirm no unexpected clipping, overflow, missing content, unreadable control, or unintended layout/theme regression.
13. Only after that review, promote the three candidates to the exact authorized paths. Do not regenerate or update Linux baselines, change thresholds, alter snapshot naming, or change product/test configuration under this revision.
14. Run the focused Windows screenshot test and then canonical `npm run test:all`. Record exact results in `BUILD_REPORT.md`. If either product behavior or snapshot comparison fails, stop; do not update a baseline to manufacture a pass.

## 27. Test design by file

| File | Action | Planned scenarios | Why current coverage is insufficient |
| --- | --- | --- | --- |
| `tests/learning-outcome-model.test.js` | Create | Minimal/full records; 1,000-char text; null proof; typed/deduped/missing refs; invalid entries; duplicate IDs; deterministic timestamps; attempt identity; lifecycle; tombstone delete; unrelated-state equality; JSON round-trip; forbidden-field removal. | No current model represents capability outcomes. |
| `tests/app-manifest.test.js` | Modify | New module order/assets/browser journey; sync collection; state v3; v71 identity. | Current assertions end at v70 and do not know the collection. |
| `tests/state-foundation.test.js` | Modify | Legacy missing collection → empty; double migration; malformed collection; newest/tie conflict; tombstone prevents resurrection; unknown fields preserved. | Existing tests assert schema v2 and no outcome collection. |
| `tests/information-architecture-model.test.js` | Modify | `capabilities` is first essential Frentes peer; five areas unchanged; route resolves. | Current Frentes only has Reading/Study/Goal. |
| `tests/browser/learning-outcome-flows.spec.js` | Create | Empty/minimal/full/create/edit/proof/Study/Reading/dedupe/unlink/missing/attempt validation/archive/reactivate/delete cancel+confirm/reload/backup/failure/keyboard/touch/long text/viewports/zoom/no progress/isolation. | No browser surface exists. |
| `tests/browser/information-architecture-flows.spec.js` | Modify | Frentes discovery, deep link/reload/history and five-nav mobile containment. | Generic current test cannot prove new peer integration. |
| `tests/browser/pwa-lifecycle-flows.spec.js` | Modify | Create outcome online, flush, controlled offline reload/reopen, confirm capability/attempt and composed feature asset. | Current offline test preserves only a synthetic localStorage key. |
| `tests/browser/design-system-flows.spec.js-snapshots/design-system-360-chromium-win32.png` | Create after review | Existing 360px screenshot assertion on Windows Chromium. | Default Playwright naming is host-specific and only the Linux baseline is tracked. |
| `tests/browser/design-system-flows.spec.js-snapshots/design-system-768-chromium-win32.png` | Create after review | Existing 768px screenshot assertion on Windows Chromium. | Default Playwright naming is host-specific and only the Linux baseline is tracked. |
| `tests/browser/design-system-flows.spec.js-snapshots/design-system-1280-chromium-win32.png` | Create after review | Existing 1280px screenshot assertion on Windows Chromium. | Default Playwright naming is host-specific and only the Linux baseline is tracked. |

Manual evidence is limited to visual inspection of responsive browser output/traces if assertion failures or intended layout changes require it. Installed-PWA physical observation is not required because this slice changes no lifecycle behavior; controlled Service Worker browser evidence is required.

## 28. Acceptance traceability matrix

| AC | Implementation component/files | Exact planned evidence |
| --- | --- | --- |
| AC-01 | Model/feature; `learning-outcome-model.js`, browser spec | Create without resources/legacy conversion; deep-equal legacy snapshot. |
| AC-02 | Feature dialog/model | Submit blank/whitespace capability; inline associated error; no record. |
| AC-03 | Model/feature/backup | Create/edit Unicode text, reload, export/import equality. |
| AC-04 | CSS/browser spec | 1,000-char capability at 360/768/1280 and zoom; stored value unchanged, no overflow. |
| AC-05 | Model/feature | Minimal create with `proofCriterion:null`. |
| AC-06 | Model/feature | Add/edit/remove proof; snapshot all other fields/domains. |
| AC-07 | Model/browser | Canonical scalar/null proof; assert no second criterion or score controls/fields. |
| AC-08 | Model/browser | Zero, multiple Study, multiple Reading, and mixed refs. |
| AC-09 | Model/browser | Duplicate checkbox/input ref normalizes once. |
| AC-10 | Model/browser | Same resource on two outcomes; link/unlink leaves resource deep-equal. |
| AC-11 | Model/browser | Change resource progress; outcome object/UI has no derived value. |
| AC-12 | Model/feature/browser | Remove referenced source; unavailable state renders, unlink works, no crash/recreate. |
| AC-13 | Feature/browser | Blank attempt blocks create/edit, preserves full draft, focuses attempt. |
| AC-14 | Model/feature/backup | Edit current attempt with stable ID; reload/round-trip exactly one. |
| AC-15 | Model/browser/static inspection | Assert forbidden attempt fields and absence of Today/session/evidence/complete controls/records. |
| AC-16 | Model/feature/browser | Create active, archive/reactivate, field/resource snapshots unchanged. |
| AC-17 | Model/feature/browser | Cancel delete no write; confirm tombstone/removal only; unrelated snapshot equality. |
| AC-18 | IA model/feature/browser | Frentes card/view and primary nav exact five labels. |
| AC-19 | Dedicated feature/browser regression | Reading/Study/Goal order, records, cards, progress unchanged after full outcome flow. |
| AC-20 | Model/list/browser | Updated/created/id tie-break; active default and archived mode. |
| AC-21 | Feature/CSS/browser | Capability and attempt visible; query/assert no banned metric/score UI. |
| AC-22 | Feature/browser | Capability-centered empty state; no-resource form saves valid record. |
| AC-23 | Feature/browser | Form control inventory contains only Slice-1 fields. |
| AC-24 | Feature/design system/browser | Keyboard submit/correction/cancel, trap/Escape/discard confirmation/focus return. |
| AC-25 | Model/feature/browser | Full flow with deep snapshots of every frozen domain and progress values. |
| AC-26 | Manifest/foundation/model Node tests | Legacy state migrates to empty collection; legacy/unknown fields preserved. |
| AC-27 | Index save/feature/browser/PWA | Await successful `CompassoStorage.save`, flush, reload/reopen; no bypass. |
| AC-28 | Model/foundation Node tests | Double normalize/migrate deep-equal; no duplicate outcome/ref/attempt. |
| AC-29 | Foundation/model Node tests | Newest parent record wins; equal differing record conflict deterministic; nested attempt follows parent. |
| AC-30 | Index/model/browser | Export file includes canonical record; import replacement round-trip with refs. |
| AC-31 | Index/foundation/browser | Legacy backup restore creates empty outcomes and leaves vault behavior/source untouched. |
| AC-32 | Model/foundation Node/browser | Malformed outcome rejected/normalized record-wise; valid unrelated backup data remains. |
| AC-33 | Manifest/PWA browser | Composed v71 cache opens offline; outcome survives reload/reopen. |
| AC-34 | Feature/CSS/design-system browser | Names, focus, errors, text lifecycle, keyboard, 44px target geometry. |
| AC-35 | CSS/browser/platform-specific baselines | 360/768/1280, zoom-equivalent check, long text/many refs/archive/dialog; no global overflow; reviewed Linux and Win32 Chromium baselines retain meaningful visual-regression coverage. |
| AC-36 | Index/feature/browser | Replace global storage facade with `save:async()=>false`; dialog remains, draft preserved, state restored, failure announced, no success. |

**Traceability result: 36/36 acceptance criteria have named implementation files and automated evidence.**

## 29. Validation commands

All commands are supported by the current repository/tooling:

```powershell
node --test tests/learning-outcome-model.test.js tests/state-foundation.test.js tests/app-manifest.test.js tests/information-architecture-model.test.js
npm run build:test
npx playwright test tests/browser/learning-outcome-flows.spec.js tests/browser/information-architecture-flows.spec.js --project=chromium
npx playwright test tests/browser/learning-outcome-flows.spec.js --project=mobile
npx playwright test tests/browser/pwa-lifecycle-flows.spec.js --project=chromium
npm test
npm run test:browser
npm run test:all
```

Revision-2 Build must additionally run the existing focused assertion on Windows before the full gate:

```powershell
npx playwright test tests/browser/design-system-flows.spec.js --project=chromium --grep "snapshots responsivos"
```

Build must record command, exit code, counts, failures/skips, and environment limitations. The three exact Win32 snapshot additions are planned evidence changes, but promotion is conditional on visual inspection and comparison. `--update-snapshots`, blind copy, threshold relaxation, `--ignore-snapshots`, and accepting a newly generated image solely because it exists are not completion evidence.

## 30. CI impact

No CI workflow or Playwright configuration change. `.github/workflows/browser-tests.yml` runs `ubuntu-latest`, Node 22, installs Playwright Chromium, and executes `npm run test:all`. Playwright 1.55 sets `testInfo.snapshotSuffix = process.platform`; the unchanged legacy snapshot template therefore selects `*-chromium-linux.png` in CI and `*-chromium-win32.png` on the current workstation. Adding Win32 baselines cannot redirect or replace Linux CI evidence. The tracked Linux baselines and 2% comparison threshold remain authoritative for CI, while the reviewed Win32 baselines close the equivalent local host contract.

## 31. Privacy, security, observability, performance, and operations

### Privacy/security

All new content stays in existing local state and user-initiated backup/sync. No remote service, telemetry, AI, account, credential, permission, or unnecessary resource-content copy is added. References contain only local type/ID. Existing backup privacy confirmation remains.

### Observability

Use existing inline errors, toast/status messages, `CompassoFeatures` error capture, storage console diagnostics, and Build test evidence. No analytics events or user-content logging.

### Performance

Normalization is O(outcomes + refs); list sorting is O(outcomes log outcomes); resource resolution is O(studies + readings + refs). Rendering only the selected active/archive list is adequate for a personal local-first dataset. Backups grow by the compact user-authored records only. No index/cache/pagination is justified.

### Operational impact

One new PWA generation and two cached JS assets. No database upgrade, deployment procedure change, dependency, CI change, or background job.

## 32. Risks and mitigations

| Risk | Mitigation/design proof |
| --- | --- |
| Capability inherits front percentage/completion | Dedicated model/feature and forbidden-field/UI assertions. |
| Failed async write shows success or loses draft | Await boolean save, staged state rollback, dialog retained, AC-36 browser injection. |
| Old/malformed state loses unrelated data | Record-level canonical normalization, logical v3 tests, unknown-field preservation. |
| Missing refs are pruned | Existence-independent reference normalization and missing-resource browser flow. |
| Sync resurrects a deleted outcome | Manifest sync collection plus tombstone transition/test. |
| Installed PWA mixes assets | Single v71 bump after implementation and composition/PWA evidence. |
| Published rollback hides and later loses data | Compatibility-spine forward generation and JSON preservation; never reset/old-backup rollback. |
| Required attempt increases friction | Only two fields required; proof/resources collapsed and optional. |
| “Capacidades” implies mastery | Active/archived wording and “próxima tentativa” context; no achieved/mastered state. |

## 33. Explicit non-goals

No Evidence association, outcome-aware sessions, attempt results/history, feedback/gaps, Today/dailyPlans, Goals, PACER, retrieval intent, Active Recall/spaced repetition change, GRINDE, RAIL, Notes/Relations change, Weekly Review/Results/Consistency redesign, AI, backend, new sync semantics, Markdown export, manual ordering, mastery, confidence, score, or numerical progress.

## 34. Iterate triggers

Build must stop and use `$sdd-iterate` if any of the following becomes necessary:

- Editing a file outside the 19-file Revision-2 manifest.
- Adding an IndexedDB object store or changing `storage.js` DB/storage schema version.
- Making next attempt optional or adding completed/demonstrated/mastered lifecycle.
- Adding Goal, Evidence, session, Today, Notes, Relations, or reverse resource fields.
- Changing JSON restore from current replace semantics or changing Markdown vault format.
- Adding a dependency/framework/backend/telemetry/AI or sixth primary navigation area.
- Discovering that v3/unknown-key rollback cannot preserve stored outcomes.
- Deferring any AC to an unspecified manual check or leaving a critical design choice to Build.

## 35. Design quality gate

| Gate | Result |
| --- | --- |
| Exact outcome/attempt/proof/ref shape | Pass |
| Collection ownership and normalization | Pass |
| Additive logical migration; no IndexedDB migration | Pass |
| JSON backup/replace restore and merge | Pass |
| Post-data rollback preservation | Pass |
| Frentes route/key/label/icon | Pass |
| Lifecycle/delete/missing resource | Pass |
| No-progress inheritance protection | Pass |
| Closed 19-file manifest | Pass |
| Win32 root cause and exact paths established | Pass |
| Candidate inspection and cross-platform comparison completed | Pass |
| Snapshot acceptance rule prevents blind promotion | Pass |
| Product code/config/CI/Linux baselines explicitly frozen | Pass |
| 36/36 AC traceability | Pass |
| Evidence-backed commands and zero CI change | Pass |
| No critical decision deferred to Build | Pass |

**Design result: Complete (Built) — Revision 2.**

The Revision-2 Build continuation completed within the closed manifest. The next valid skill is `$sdd-ship`; Ship must not start automatically from Build.

## 36. Revision history

| Revision | Date | Classification | Change | Upstream/downstream impact |
| --- | --- | --- | --- | --- |
| 1 | 2026-08-08 | Initial technical design | Approved the 16-file product implementation and evidence manifest for Slice 1. | DEFINE 15/15 and AC-01–36 mapped to Build. |
| 2 | 2026-08-08 | Additive test-evidence architecture | Established the Playwright host-suffix root cause; inspected stable Win32 candidates; compared A/B/C; selected three explicit platform-specific baselines; expanded the closed manifest to 19; defined visual acceptance, canonical validation, CI compatibility, and product-code freeze. | Brainstorm and Define unchanged. Product implementation evidence remains valid. Canonical Build completion remains invalid until the three files are reviewed/promoted and the full gate passes. BUILD_REPORT records the interruption. |

### Revision-2 alternative decision

- **Alternative A — selected:** explicit Win32 baselines match Playwright's existing platform-specific naming and preserve the current 2% regression threshold. Candidate files total 145,822 bytes, a proportionate one-time repository cost for the only desktop screenshot project currently exercised.
- **Alternative B — rejected:** one shared baseline is not reliable with the current test. External font loading is intentionally aborted, so host fallback rendering changes wrapping and geometry. Win32-versus-tracked-Linux pixel differences substantially exceed the current threshold; sharing would require weaker thresholds/masking or product/font work outside this Slice.
- **Alternative C — rejected:** AC-35 and the approved evidence model explicitly allocate responsive snapshot evidence. Removing it would weaken acceptance and is unnecessary because a bounded platform-specific solution exists.

## 37. Build conformance note

On 2026-08-08, the three exact Win32 baselines authorized by Revision 2 were individually inspected, matched the stable candidate hashes, and were promoted without changing product code, JavaScript tests, Playwright configuration, CI, comparison thresholds, or Linux baselines. The focused responsive assertion passed 1/1. Canonical `npm run test:all` passed with 161/161 Node tests and 114 browser tests passed, 18 intentional project/platform skips, and zero failures. All 36 acceptance criteria reconcile to Pass. No technical Design decision changed; this note advances lifecycle status only.
