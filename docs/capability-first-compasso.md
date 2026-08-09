# Capability-first Compasso

## Purpose

Capability-first Compasso carries an optional capability and its current next attempt through planning, supporting resources, execution, Evidence, learning signals, reflection, Results, and Consistency. A capability remains an `active` or `archived` learning objective. Activity is supporting context, never capability progress, completion, mastery, confidence, score, ranking, or streak.

The feature is local-first, works from the existing complete PWA cache, and has no dependency on the `context` route, Contextual AI modules, platform detection, external AI, a backend, or remote processing.

## Ownership

| Fact | Owner |
| --- | --- |
| Capability, lifecycle, next attempt, resource support | Existing `learningOutcomes` record |
| Today planning state | Existing current `dailyPlans` record |
| Execution provenance | Existing Session, Deep Work, and canonical Execution Session records through `learningContext` |
| Evidence | Existing Evidence record; capability context is resolved through `sessionId` |
| Learner-approved feedback, gap, question, or insight | New `learningSignals` record |
| Weekly reflection and keep/revise decision | Existing `weeklyReviews[].capabilityReflections` |
| Results and Consistency context | Derived at render time |

New references use a complete snapshot:

```js
capabilityRef: {
  outcomeId,
  attemptId,
  attemptText
}
```

All three trimmed strings are required. The live attempt text is shown only when the same capability and attempt IDs still resolve. Otherwise, the immutable snapshot remains readable. Associations are never inferred by title, resource, time, text, Evidence fields, Notes, questions, errors, or Contextual AI data.

## `learningSignals`

`learningSignals` is the delivery's only new durable concept and the only new manifest collection:

```js
{
  id,
  schemaVersion: 1,
  capabilityRef,
  kind: "feedback" | "gap" | "question" | "insight",
  text,
  sourceRef: null | { type: "execution" | "evidence" | "weekly-review", id },
  origin: "learner" | "confirmed-suggestion",
  createdAt,
  updatedAt
}
```

`gap` also represents a weak topic. Only explicit learner submission or confirmation creates a record. Source content may be projected as a possible signal but is not copied automatically. Editing or deleting a signal does not edit its source, capability, lifecycle, resource progress, or next attempt. Deletion writes `_sync.tombstones['learningSignals:<id>']`; record-timestamp merge and equal-timestamp conflict copies remain owned by `state-foundation.js`.

## Surface behavior

- **Capacidades:** derives today's reference, resources, finalized attempts, Evidence, source projections, confirmed signals, and the latest weekly decision. Active cards can add/open Hoje, execute, and register a signal. Archived cards remain historical.
- **Hoje:** owns one `type: 'capability-attempt'` item per outcome/attempt/day. Toggle and removal modify only the daily plan. Missing or archived capabilities retain snapshot text and cannot start a new session.
- **Estudos/Leituras:** derive reverse links from `learningOutcomes.resourceRefs`. The resource-side manager updates only outcome records. Missing resources remain unavailable until explicitly unlinked.
- **Sessions/Deep Work:** Study/Reading starts default to `Sem capacidade`. An explicit active/current choice is revalidated and passed through the shipped `learningContext` adapters; resource metrics remain authoritative.
- **Evidence:** stores no new capability field. Projection is strictly `Evidence.sessionId → executionSessions.id → learningContext`.
- **Weekly Review:** preserves general and unlinked activity, while `capabilityReflections` records an explicit `keep` or `revise`. `revise` uses the existing outcome update contract and preserves attempt identity/creation time.
- **Results:** separates `Atividade de apoio` from `Evidências e decisões` for capabilities.
- **Consistency:** intersects existing period/domain filters with `Todas`, `Sem capacidade`, or an explicit capability. Outcome-only history says `Sem métrica de recurso`.

## Persistence and failure behavior

State remains `compasso.state.v3`; no migration job, IndexedDB upgrade, object store, storage key, or destructive rewrite exists. Missing `learningSignals` normalizes to `[]`. Valid unknown fields survive normalization, merge, save, JSON backup, and restore. Malformed new records are isolated without clearing another domain.

Today capability mutations, resource association changes, signal operations, and Weekly Review decisions use candidate-state persistence. A failed save restores the prior in-memory and persisted state instead of announcing success. A newer signal tombstone prevents resurrection. Resource unlink and nested Today/Review changes continue to use their existing parent record merge boundary.

## Missing references and compatibility

- Missing capability: keep Today, Session, signal, and review snapshots; disable new start/association and never recreate it.
- Missing resource: keep the outcome-side reference, show it unavailable, and allow unlink.
- Missing Session: keep Evidence valid and do not infer a capability from Evidence domain/item fields.
- Missing signal source: keep the independently owned signal editable and removable.
- Legacy Sessions/Evidence: remain valid and unlinked.

Notes, folders, Markdown/vault metadata, wikilinks, source links, Relations/graph derivation, Active Recall, `explanationEvaluations`, `errorNotebook`, legacy errors, Contextual AI routes/modules/data, JSON backup/restore, IndexedDB/localStorage, and existing PWA architecture are preserved. A future UX Simplification delivery must provide safe route fallback and data access before retiring standalone surfaces; this delivery removes nothing.

## PWA and rollback

`app-manifest.js` owns generation `compasso-pages-v73`, includes `capability-context-model.js`, and keeps the Service Worker implementation unchanged. Before publication, rollback is the complete 20-path release unit. After any client saves v73 data, rollback must be a forward generation that preserves unknown `learningSignals` and nested reflection/Today fields. Never clear user storage, backups, vaults, or unrelated caches.
