# Retrieval R1 — Match retrieval to future use — Shipped

## Metadata

| Field | Value |
| --- | --- |
| Feature | `retrieval-r1` |
| Initiative | Retrieval aligned to future use |
| Delivery | R1 — Match retrieval to future use |
| Closure date | `2026-08-15` |
| Status | `SHIP PASS` |
| Lifecycle state | `Shipped through SDD` |
| Archive mode | Copy-only; working feature/report artifacts retained |
| Branch | `codex/retrieval-r1-brainstorm` |
| Baseline HEAD | `6047c5fb32aad66ff2892ca4fdbbc7ca5f28ba65` |
| Design | Revision 1.1; closed 26-path Build manifest |
| State contract | `compasso.state.v3`, unchanged |
| PWA generation | `compasso-pages-v76` |

## Closure decision

Retrieval R1 is **Shipped through SDD**. Independent Ship inspection found the implementation aligned with DEFINE and DESIGN, the exact tracked diff aligned with the closed manifest, and fresh canonical validation passed. Ship changed no product code or tests and performed no Git or remote release action.

The current Next Attempt optionally owns `futureUse`. Capability-aware Session and Deep Work executions copy it into the existing immutable `learningContext` snapshot. Evidence owns no duplicate field and resolves historical intent only through canonical `sessionId` provenance. Hoje and Weekly Review project the current owner without changing execution precedence, Today ownership, or learner-controlled keep/revise behavior.

## Closed-manifest verification

The tracked Delivery diff contains exactly 26 paths: 10 product paths, 10 test paths, and 6 documentation paths. There are no unexpected deletions, staged paths, or unrelated tracked modifications.

### Product (10)

1. `learning-outcome-model.js`
2. `learning-outcome-feature.js`
3. `today-feature.js`
4. `sessions-feature.js`
5. `deep-work-feature.js`
6. `session-companion-feature.js`
7. `evidence-feature.js`
8. `weekly-review-feature.js`
9. `design-system.css`
10. `app-manifest.js`

### Tests (10)

1. `tests/learning-outcome-model.test.js`
2. `tests/execution-session-model.test.js`
3. `tests/deep-work-model.test.js`
4. `tests/state-foundation.test.js`
5. `tests/app-manifest.test.js`
6. `tests/browser/learning-outcome-flows.spec.js`
7. `tests/browser/capability-context-flows.spec.js`
8. `tests/browser/information-architecture-flows.spec.js`
9. `tests/browser/design-system-flows.spec.js`
10. `tests/browser/pwa-lifecycle-flows.spec.js`

### Documentation (6)

1. `docs/capability-first-compasso.md`
2. `docs/today-feature.md`
3. `docs/sessions-feature.md`
4. `docs/evidence-feature.md`
5. `docs/weekly-review-feature.md`
6. `docs/active-recall-feature.md`

## Independent validation

| Gate | Ship result |
| --- | --- |
| Five focused Node suites | 62 passed, 0 failed |
| Focused mobile browser rerun | 38 passed, 12 project-conditional skips, 0 failed |
| `npm run build:test` | PASS |
| Fresh canonical `npm run test:all` | 191 Node passed; 165 browser passed; 19 project-conditional skips; 0 failed |
| PWA lifecycle in canonical run | 10 Chromium scenarios passed; 10 configured mobile skips |
| `git diff --check` before archival | PASS; only configured LF-to-CRLF warnings |

An earlier overlapping focused Playwright invocation lost its local HTTP server and ended with `ERR_CONNECTION_REFUSED` in seven mobile cases. No assertion failed. A clean isolated mobile rerun passed 38/38 executable cases, and the subsequent single-session canonical run passed in full. This was a local test-infrastructure interruption, not a product or acceptance defect.

## Requirement reconciliation — 18/18

| Requirement | Status | Independent closure evidence |
| --- | --- | --- |
| R-001 | PASS | `learning-outcome-model.js` owns the seven-value optional domain; focused model and create/edit browser tests pass. |
| R-002 | PASS | Existing attempt composition exposes an optional native choice without adding a blocking step; design-system and mobile flows pass. |
| R-003 | PASS | Create/update/clear commands commit the attempt text and intent as one record; model, merge, and Weekly Review tests pass. |
| R-004 | PASS | Normalization is additive and idempotent under `compasso.state.v3`; state and backup round-trip tests pass. |
| R-005 | PASS | Hoje projects current intent as secondary context without duplicating or owning it; Hoje/IA browser flows pass. |
| R-006 | PASS | Global Executar precedence and fallback remain unchanged and do not route by intent; IA flows pass in desktop/mobile. |
| R-007 | PASS | Immediate normal Session start uses existing defaults and copies the current snapshot into existing execution context; execution tests pass. |
| R-008 | PASS | Deep Work uses existing configuration and context with no new classification step; model/reload browser regressions pass. |
| R-009 | PASS | Source and canonical execution records retain immutable text/intent snapshots across later edits, archive, deletion, review, and reload. |
| R-010 | PASS | Evidence contains no duplicate intent field and projects through canonical `sessionId`; state and browser provenance tests pass. |
| R-011 | PASS | Weekly Review presents current intended use before keep/revise and separates historical execution intent; capability flows pass. |
| R-012 | PASS | Keep preserves current text, intent, identity, timestamps, and historical snapshots; Weekly Review tests pass. |
| R-013 | PASS | Revise explicitly preserves/replaces/clears current intent atomically while retaining history; model and browser tests pass. |
| R-014 | PASS | Active Recall remains independent: no owner, routing, schedule, card, Weakness, or history behavior changed; isolation canaries pass. |
| R-015 | PASS | Unsupported optional values degrade to absence; legacy/missing/unlinked records remain valid and uninferred; normalization tests pass. |
| R-016 | PASS | Existing persistence, whole-record merge, tombstones, backup/restore, refresh, and offline lifecycle pass without a new schema. |
| R-017 | PASS | Labels, guidance, errors, focus, keyboard activation, 360–390 px, zoom, coarse pointer, and reduced-motion coverage pass. |
| R-018 | PASS | Studies, Readings, Notes/vault/wikilinks, Relations/graph, Contextual AI, Sessions/Evidence, and all routes remain protected. |

**Final requirement result: 18 PASS, 0 partial, 0 failed.**

## Acceptance reconciliation — 25/25

| AC | Status | Ship conclusion |
| --- | --- | --- |
| AT-01 | PASS | Create/select persists `solve` and presents its frozen label without creating another domain record. |
| AT-02 | PASS | Omitted choice remains canonical absence and the attempt remains executable. |
| AT-03 | PASS | `explain` to `build` updates atomically under the existing attempt identity. |
| AT-04 | PASS | Explicit clear omits the property without inference. |
| AT-05 | PASS | Unsupported loaded values are isolated and repeated normalization is identical. |
| AT-06 | PASS | Hoje shows one discreet `decide` label without duplicating the planned action. |
| AT-07 | PASS | Resume, stored order, completion, stale-reference, and fallback behavior is unchanged. |
| AT-08 | PASS | Global Executar destination and focus are unaffected; intent triggers no automatic mode or route. |
| AT-09 | PASS | Normal Session starts immediately with existing defaults and the stored `build` snapshot. |
| AT-10 | PASS | Deep Work uses existing configuration and the stored `simulate` snapshot. |
| AT-11 | PASS | Source and canonical contexts contain the exact four-field historical snapshot. |
| AT-12 | PASS | Later edit, clear, archive, delete, and review actions do not rewrite historical context. |
| AT-13 | PASS | Evidence presents historical `explain` through the canonical execution, not the live outcome. |
| AT-14 | PASS | Evidence has no duplicate learning-context field; `sessionId` round-trips. |
| AT-15 | PASS | Weekly Review separates historical execution use from current-attempt use. |
| AT-16 | PASS | Keep preserves text, intent, identity, timestamps, and history. |
| AT-17 | PASS | Revise atomically changes or clears only the current attempt and preserves prior snapshots. |
| AT-18 | PASS | Active Recall and Weakness records, schedules, histories, and routes remain unchanged. |
| AT-19 | PASS | Legacy unclassified outcomes and executions remain valid without backfill. |
| AT-20 | PASS | Old JSON backup restores capabilities, execution/Evidence, cards, errors, and protected domains unchanged. |
| AT-21 | PASS | New JSON round-trip preserves current/historical values, absence, identity, timestamps, and provenance. |
| AT-22 | PASS | Whole-record winner, equal-timestamp conflict copy, and tombstone behavior remain intact. |
| AT-23 | PASS | v76 shell, local persistence, refresh/reopen, execution, Evidence, review, and offline lifecycle pass. |
| AT-24 | PASS | Optionality, native naming, guidance, errors, keyboard, and deterministic focus behavior pass. |
| AT-25 | PASS | Mobile, 200% zoom, coarse pointer, reduced motion, and overflow contracts pass. |

**Final acceptance result: 25 PASS, 0 partial, 0 failed.**

## Error and boundary reconciliation — 10/10

| Error scenario | Status | Ship conclusion |
| --- | --- | --- |
| ER-01 | PASS | Invalid explicit commands fail atomically with `future-use-invalid`; no partial change persists. |
| ER-02 | PASS | Forced save failure retains the last stored record and the retryable draft. |
| ER-03 | PASS | Stale, completed, archived, missing, or non-current Today references remain safe and uninferred. |
| ER-04 | PASS | Failed Session/Deep Work start reports no active source/canonical record and asks no extra intent question. |
| ER-05 | PASS | Missing, invalid, legacy, or unlinked Evidence context remains readable without inferred intent. |
| ER-06 | PASS | Invalid/failed Weekly revise preserves current/historical records and retains an accessible retry path. |
| ER-07 | PASS | Equal-time conflicts and tombstones remain record-level; deleted outcomes are not resurrected. |
| ER-08 | PASS | Legacy complete execution context without intent stays valid through normalization and reload. |
| ER-09 | PASS | Active Recall, Weakness/Error Notebook, and Contextual AI data/routes remain isolated. |
| ER-10 | PASS | Protected knowledge domains, unknown compatible state, and offline/PWA data remain preserved. |

**Final error-scenario result: 10 PASS, 0 partial, 0 failed.**

## Compatibility verification

- `compasso.state.v3` remains authoritative; no schema version, collection, store, route, migration, or external dependency was added.
- `futureUse` is the only additive field. It is optional on the current Next Attempt and on existing execution `learningContext` snapshots.
- Existing whole-record normalization, merge, conflict-copy, and tombstone semantics remain unchanged; no field-level merge or tombstone exists.
- Today ownership and global Execute precedence are unchanged.
- Session, Deep Work, canonical Execution Session, and Evidence ownership remain unchanged. Evidence derives context only through `sessionId`.
- Legacy outcomes, Sessions, Deep Work, and Evidence remain valid and receive no inferred association or intent.
- JSON backup/restore, IndexedDB/localStorage, unknown compatible state, refresh, and offline operation remain covered.
- Studies, Readings, Notes, Markdown/vault metadata, wikilinks, Relations, graph derivation, Contextual AI data/routes, learningSignals, and all existing routes remain preserved.
- Active Recall behavior is unchanged; R1 does not create, classify, route to, schedule, or modify cards.

## PWA verification

`app-manifest.js` identifies `compasso-pages-v76` and retains `compasso.state.v3`. `service-worker.js` has no Delivery diff. The manifest still owns module composition and cache generation, and the Service Worker install/activate/fetch/update architecture is unchanged. Fresh Chromium lifecycle tests passed controlled install/update, coherent reopen, offline reopen, local-state persistence, bounded recovery, and reset-cancellation behavior.

## Residual risks and release gates

### Physical installed-PWA human smoke — non-blocking for SDD Ship; required operational follow-up

No physical installed-PWA close/reopen observation was performed or attributed during Ship. Automated PWA lifecycle coverage is green and the Service Worker architecture is unchanged, so this does not block documentary SDD closure. A human v76 installed-PWA smoke remains required before publication or rollout.

### Remote Linux CI — non-blocking for SDD Ship; blocking integration/release gate

The validated product/test tree is uncommitted at baseline HEAD `6047c5f`, so no remote run can be attributed to this exact tree. Local canonical validation is complete, but remote Linux CI remains mandatory after a separately authorized Git checkpoint and before merge or release. Ship does not claim a future result.

## Deviations and blockers

- No requirement, product-direction, persistence, ownership, route, accessibility, responsive, or PWA architecture deviation from DESIGN revision 1.1 was found.
- Build's initialization-order correction in `deep-work-feature.js` stayed within the authorized manifest and uses the already-published model API at the existing render boundary; it adds no coordinator, timer, or persistence behavior.
- No blocker remains for SDD closure.

## Lessons retained

1. In a composed vanilla-JavaScript application, lexical declaration order can differ from feature installation order. Early hydration should use an already-published optional API when the lexical binding is not yet initialized, and active-session reload must be tested explicitly.
2. Future-use intent is historical evidence only when captured at execution start. Readers should resolve it through the canonical execution snapshot, never by consulting the current capability and rewriting history.
3. Optional intent remains low-friction when absence is canonical omission and unknown imported values degrade only the optional field rather than invalidating the containing record.
4. Overlapping Playwright invocations that reuse one local server port can create misleading connection failures; a clean isolated rerun distinguishes infrastructure loss from assertion/product failure.

## Archived artifacts

- `.sdd/archive/retrieval-r1/BRAINSTORM.md`
- `.sdd/archive/retrieval-r1/DEFINE.md`
- `.sdd/archive/retrieval-r1/DESIGN.md`
- `.sdd/archive/retrieval-r1/BUILD_REPORT.md`
- `.sdd/archive/retrieval-r1/SHIPPED.md`

Archival used copy-only mode. Working artifacts remain under `.sdd/features/retrieval-r1/` and `.sdd/reports/retrieval-r1/` for auditability and a separately authorized Git checkpoint.

## Release actions

No staging, commit, push, pull request, merge, rebase, deployment, publication, installed-PWA mutation, or other remote release action occurred during Ship.

**Final lifecycle state:** Retrieval R1 — Match retrieval to future use is **Shipped through SDD**.

**Recommended next action:** create a separately authorized scoped Git checkpoint, push it for remote Linux CI, and complete a human installed-PWA smoke before merge or publication.
