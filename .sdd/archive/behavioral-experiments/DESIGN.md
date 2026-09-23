# Behavioral Experiments — Design

**Delivery:** 6
**Status:** Shipped
**DEFINE clarity:** 15/15
**Baseline:** `origin/main` `4f8c1b2938987fa50696a25ae2396d8e365e4f6f`

## Inspection and decision

The isolated branch `codex/behavioral-experiments` began clean. `.codegraph/` is absent, so source, tests, manifest, docs, and AGENTS.md were inspected directly. `npm test` baseline: **223 pass, 0 fail, 0 skip**. The installed SDD skill templates are absent; the artifacts follow the required sections and repository examples.

`learningOutcomes` own Capability and nextAttempt, `learningSignals` own short contextual observations, `ritualTemplates` own reusable execution preparation, and `weeklyReviews` own weekly decisions. None owns a dated, repeatable hypothesis and its later observation/decision. Putting experiments inside a Capability would make independent sync/merge/delete unsafe; putting them in a signal or Ritual would overload those contracts. Choose one additive `behavioralExperiments` collection, not a parallel persistence service.

## Target and interfaces

- `CompassoBehavioralExperimentModel` is pure and owns `normalizeCollection`, `create`, `update`, `review`, `deleteFromState`, `reviewDateForPreset`. Record schema **v1**: `id`, `schemaVersion`, `capabilityRef` snapshot, `hypothesis`, `practice`, `expectedOutcome`, `evidencePlan`, `startDate`, `reviewDate`, `decision` (`null|keep|adjust|abandon`), `resultNote`, `reviewedAt`, `createdAt`, `updatedAt`. Only explicit create/review writes a record. Edit keeps identity. Delete creates `_sync.tombstones['behavioralExperiments:<id>']`.
- `state-foundation.js` normalizes the additive collection on migrate; missing legacy data becomes `[]`, malformed records are isolated. No top-level state or IndexedDB version change.
- `app-manifest.js` registers model before feature, feature after `learning-outcome-feature.js`, collection in sync catalog and both modules in offline browser journey/assets. Cache generation advances v85→v86.
- `index.html` adds `behavioralExperiments: []` to default state and uses model normalization during legacy/restore normalization. Existing JSON export serializes full state unchanged.
- `behavioral-experiment-feature.js` installs a compact section below the Capability list and a native dialog. Feature hooks render after Capability, delegated actions handle create/edit/review/delete. Candidate-state `saveData` is awaited; failure restores previous state, preserves dialog fields, and shows a retryable error. Cancel/Escape discards unsaved edits. Focus returns to invoking control.
- The UI selects only active Capability for new plans, but reads existing records by their immutable `capabilityRef` snapshot even if the source changes or disappears. Review never mutates the source. A date preset computes review date; custom choice permits manual date. The 21-day label carries no scientific claim.

## State flow and error behavior

`open → input/validate → detached candidate → saveData → close on success`. On invalid input: no candidate, visible field error, focus. On failed save: restore prior `state.data`, best-effort re-save prior snapshot, keep dialog/input, retry. `open experiment → review dialog → observed result + decision → explicit save → reviewed record`. Reviewed experiments are immutable in this MVP; learner may create a new experiment to adjust practice. Delete requires `confirm`, then tombstone plus removal in one candidate. No timer or automatic overdue transition.

## Compatibility, migration, rollback

Migration is idempotent and additive: old JSON without collection obtains `[]`; valid v1 records survive; unknown state fields survive. Existing object-store version remains 1 and state contract v3. Fallback localStorage stores the same state. Forward rollback after exposure must use a later cache generation and retain `behavioralExperiments` in state/backup even if UI is disabled; never clear storage. Manifest sync uses timestamp-record merge and tombstones, with conflict copies tested.

## File manifest (closed)

| Path | Action | Purpose / dependency | Acceptance |
| --- | --- | --- | --- |
| `behavioral-experiment-model.js` | create | Pure v1 record, validation, presets, deletion; uses Capability ref model | 01–08 |
| `behavioral-experiment-feature.js` | create | Capability-view UI, explicit lifecycle, failure/focus behavior; uses model and runtime | 01–07, 09–10 |
| `app-manifest.js` | modify | module/cache/collection/offline catalog | 08–09 |
| `state-foundation.js` | modify | additive idempotent normalization | 08 |
| `index.html` | modify | initial state and restore normalization | 08–09 |
| `design-system.css` | modify | compact cards/date controls/responsive/focus | 10 |
| `tests/behavioral-experiment-model.test.js` | create | model validation, dates, lifecycle, migration/deletion | 01–08 |
| `tests/state-foundation.test.js` | modify | legacy, merge, tombstone, JSON round-trip | 07–08 |
| `tests/app-manifest.test.js` | modify | ordering, assets, collection, cache | 08–09 |
| `tests/browser/behavioral-experiment-flows.spec.js` | create | user lifecycle, persistence, backup/offline/failure/mobile/keyboard | 01–10 |
| `docs/behavioral-experiments.md` | create | learner usage and data/rollback contract | 01–10 |
| `.sdd/features/behavioral-experiments/{DEFINE,DESIGN}.md` | create | SDD decisions and traceability | all |
| `.sdd/reports/behavioral-experiments/BUILD_REPORT.md` | create | exact build/verification evidence | all |
| `.sdd/archive/behavioral-experiments/{DEFINE,DESIGN,BUILD_REPORT,SHIPPED}.md` | create | copy-only SDD Ship record | all |

No file moves/deletions, framework, dependency, route, service, or backend.

## Verification order

1. Model and migration tests (`npm test`) for every record invariant and old-state path.
2. Manifest/composition (`npm run build:test`) and focused Playwright spec.
3. Full `npm run test:browser` (Chromium + mobile) including existing Session, Evidence, Review, restore, and PWA regressions.
4. Git diff/status, verify no unrelated paths, archive copy-only Ship, then scoped commit/push and open a Draft PR. Remote CI is reported separately, not inferred from local checks. No merge/deploy.

## Nonfunctional impacts

Text only; no external service or telemetry. Experiments may contain sensitive learner notes, so only the existing local state/backup path is used. Rendering is linear in experiment count. Native dialog gives modal semantics/Escape; labels, live errors, visible focus, and mobile scroll are required. No automatic analytics or score.
