# DESIGN: Retirada de Mais e recuperacao do encerramento de sessoes

## Metadata

- Feature: `more-retirement-session-recovery`
- Phase: Design
- Status: `Complete (Built)`
- Revision: 1.0
- Date: 2026-08-11
- Authoritative acceptance contract: `.sdd/features/more-retirement-session-recovery/DEFINE.md`
- Baseline: `origin/main` at `f15c4573cfd0f9b2ce7ae4ceadd075cab598bc61`

## Design status

`Complete (Built)`

The repository was inspected directly because `.codegraph/` is absent in the clean worktree. The Design covers all 12 acceptance scenarios, closes the implementation and test manifest, preserves every persistence contract, and requires no migration or deletion.

## Current implementation evidence inspected

- `AGENTS.md`: SDD, local-first, PWA, accessibility, scope, validation, and Git boundaries.
- `README.md` and `docs/application-foundation.md`: product, navigation, local-first, protected knowledge, test, and PWA contracts.
- `information-architecture-model.js`: five primary areas, including `more`; Notes, dictionary/graph, and context are modeled as `more` subviews.
- `information-architecture-feature.js`: composes the primary navigation, the `Mais` hero/cards/system panel, and moves `.vault-explorer` into `iaMoreVault`.
- `index.html`: settings, JSON export/import, and the original sidebar `.vault-explorer` exist independently of the `Mais` hub.
- `markdown-vault-feature.js`, `anki-obsidian-feature.js`, and Drive features: vault and Drive entry points remain attached to existing global/settings controls.
- `sessions-feature.js`: `openSessionFinish()` and `finishSession()` return early when `sessionItem()` is unavailable; the browser reproduction leaves the Session active and shows `O item desta sessão não existe mais`.
- `deep-work-feature.js`: active recovery uses the current source lookup, and `deepShowFinish()` does not itself guarantee the dialog is open.
- `session-companion-feature.js`: regular completion delegates to `openSessionFinish`; Deep Work completion invokes `deepComplete` directly.
- `evidence-feature.js`: canonical regular Evidence uses the existing Session `id`; explicit Evidence validation and completion continuation are already implemented.
- `app-manifest.js` and `service-worker.js`: generation is `compasso-pages-v74`; manifest owns cache identity and the Service Worker architecture requires no change.
- Node/browser/PWA tests and `.github/workflows/browser-tests.yml`: canonical validation is `npm run test:all` on Ubuntu/Chromium.
- Baseline focused validation: existing-source quick Session and Deep Work completion passed 2/2 in Chromium. A direct unavailable-source reproduction produced `{dialogOpen:false,status:"active",toast:"O item desta sessão não existe mais"}`.

## Target architecture

### Information architecture

`information-architecture-model.js` remains the declarative source of truth but exposes four primary areas:

`today → fronts → journal → review`

The `more` area record is removed. The existing protected views remain registered with `area:null`, so route resolution can continue to recognize `notes`, `dictionary`, and `context` without assigning them to a false primary navigation parent. `areaFor()` returns `null` for these detached protected views; `setActive()` consequently removes `aria-current` from all primary items.

`model.resolve('more')` naturally returns the existing fallback `today` because `more` is no longer an area or view. Startup and popstate use the existing `open(..., {replace:true})`/history flow to normalize stale URLs without a blank destination.

`information-architecture-feature.js` removes `more` from `hubs`, removes its action markup and vault relocation, and leaves the existing `fronts`/`review` hub composition unchanged. The original `.vault-explorer` remains in the sidebar; settings, Drive, JSON import/export, and vault controls remain owned by their current modules.

### Regular Session completion

`sessionItem()` remains the source resolver. Completion separates source-dependent work from execution-owned work:

1. `openSessionFinish()` resolves the source.
2. If available, it preserves the existing resource metric and title behavior.
3. If unavailable, it opens the same completion dialog with a stable fallback title and an explicit message that the Session/Evidence can be saved without altering the source.
4. `finishSession()` computes a resource metric only when the source exists.
5. The cloned Session transitions to `completed` and Evidence is inserted exactly as today.
6. Resource progress is updated only when both the metric and cloned source exist.
7. Persistence, rollback, error focus, canonical execution sync, and `execution:recorded` continuation remain unchanged.

If the source disappears between dialog open and submit, commit-time resolution wins: no resource mutation is attempted, while execution-owned completion remains valid.

### Deep Work completion

`deepOpenCore()` distinguishes a missing new-start source from a missing active-session source. A new Deep Work still cannot start without a source. An existing active/finishing Deep Work can populate the dialog from its own persisted fields and fallback title.

`deepShowFinish()` ensures `deepDialog` is open before exposing the existing finish region and focusing the first completion control. This fixes direct companion completion and recovery paths without a timeout or parallel UI. `deepCommitFinish()` and `deepWorkRegisterEvidence()` remain the existing persistence path and do not require source recreation.

## Interfaces and state transitions

### Route resolution

| Input | Resolution | Primary current state |
| --- | --- | --- |
| `today`, `fronts`, `journal`, `review` | Existing area/hub | Matching `aria-current=page` |
| `more` | `today` fallback, URL replaced | `Hoje` current |
| `notes`, `dictionary`, `context` | Existing direct view | No unrelated primary item current |
| Unknown route | Existing `today` fallback | `Hoje` current |

### Regular Session state

| Source | Before | Submit result |
| --- | --- | --- |
| Available | `active/paused → finishing` | `completed`; existing metric update where applicable; Evidence saved |
| Unavailable | `active/paused → finishing` | `completed`; no metric/source update; Evidence saved |
| Any + invalid Evidence | `finishing` | Remains `finishing`; Evidence field owns focus |
| Any + persistence rejection | Candidate discarded | Previous `finishing` state and draft restored for retry |

### Deep Work state

| Source | Before | Interaction/result |
| --- | --- | --- |
| Available | `running/paused` | Existing dialog and finish behavior |
| Unavailable active | `running/paused/finishing` | Existing dialog opens from persisted record; completion remains possible |
| Unavailable new start | No active record | Start remains blocked because there is no valid subject |
| Persistence rejection | `finishing` candidate | Existing rollback and draft restoration |

## Accessibility and responsive design

- Four primary controls retain semantic buttons, labels, order, focus visibility, and native keyboard activation.
- Retiring `Mais` removes it from both tab order and accessibility tree; no hidden duplicate is introduced.
- Protected direct views do not falsely announce `Hoje`, `Frentes`, `Journal`, or `Revisão` as current.
- Missing-source regular completion uses the existing modal, labels, required Evidence semantics, Cancel/Escape behavior, and error focus.
- Deep Work completion opens its modal synchronously before scroll/focus orchestration; no arbitrary delay is introduced.
- Existing 360–390 px, 200% zoom, coarse-pointer, reduced-motion, and overflow contracts are exercised through browser regressions.

## Persistence, compatibility, and migration

### Durable impact

None. No collection, field, state version, schema, migration, normalization, merge, tombstone, backup, or restore change.

### Protected contracts

- State remains `compasso.state.v3`.
- Session/Deep Work/Execution Session/Evidence ownership and canonical `sessionId` provenance remain unchanged.
- Missing sources remain missing; no inference, reassociation, progress update, or recreation occurs.
- Existing unlinked legacy Session/Evidence records remain valid.
- `learningSignals` consent/merge/tombstone semantics remain untouched.
- Today isolation, Studies, Readings, Notes, Markdown/vault, wikilinks, Relations, graph derivation, Contextual AI, IndexedDB/localStorage, Drive, and JSON backup/restore remain unchanged.
- All existing direct protected routes remain registered.

### Migration

Not applicable. Route fallback is runtime-only and record completion uses existing fields.

## PWA and cache generation

`app-manifest.js` advances from `compasso-pages-v74` to `compasso-pages-v75` because cached runtime modules change. `service-worker.js`, cache-prefix ownership, install/activate/fetch/composition behavior, and storage independence remain unchanged.

## Significant decisions

1. **Detach protected routes instead of relocating them.** This satisfies removal without inventing a new hub. Rejected: assigning them to an unrelated primary area, which would misrepresent navigation state.
2. **Remove `more` from the model, not merely from markup.** This guarantees stale URLs fall back and prevents an empty internal destination. Rejected: CSS hiding, which leaves focus/routes and accessibility semantics behind.
3. **Treat source progress as optional at completion, not Session/Evidence.** Execution records own their completion; unavailable resources only remove the progress projection. Rejected: recreating or inferring missing source records.
4. **Reuse the existing dialogs and persistence rollback.** Rejected: a parallel recovery form, schema field, or coordinator.
5. **Forward PWA generation.** Rejected: retaining v74, which could leave installed clients on the obsolete cached modules.

## Closed implementation manifest

| # | Path | Action | Purpose | Dependencies | Acceptance |
| --- | --- | --- | --- | --- | --- |
| 1 | `.sdd/features/more-retirement-session-recovery/DEFINE.md` | Modify status only | Mark designed after this contract closes | Design completion | All |
| 2 | `.sdd/features/more-retirement-session-recovery/DESIGN.md` | Create | Authoritative technical contract | DEFINE | All |
| 3 | `information-architecture-model.js` | Modify | Four primary areas, detached protected routes, stale `more` fallback | Existing model | AT-01–AT-04 |
| 4 | `information-architecture-feature.js` | Modify | Stop composing `Mais`; preserve existing hubs/global controls | Model | AT-01–AT-05, AT-11 |
| 5 | `sessions-feature.js` | Modify | Complete regular Sessions without source mutation when unavailable | Existing Session/Evidence contracts | AT-06, AT-07, AT-09, AT-10, AT-12 |
| 6 | `deep-work-feature.js` | Modify | Recover/open/complete active Deep Work without available source | Existing Deep Work model | AT-08, AT-10–AT-12 |
| 7 | `app-manifest.js` | Modify | Advance cache generation to v75 | Changed cached modules | AT-12 |
| 8 | `tests/information-architecture-model.test.js` | Modify | Assert four-area registry, detached routes, and `more` fallback | Model | AT-01, AT-03, AT-04 |
| 9 | `tests/browser/information-architecture-flows.spec.js` | Modify | Assert retired UI, fallback, direct routes, system controls, mobile/accessibility | IA model/feature | AT-01–AT-05, AT-11 |
| 10 | `tests/browser/critical-flows.spec.js` | Modify | Add missing-source regular/Deep Work recovery and retain normal regressions | Session/Deep Work/Evidence | AT-06–AT-11 |
| 11 | `tests/app-manifest.test.js` | Modify | Assert v75 and unchanged manifest contracts | Manifest | AT-12 |
| 12 | `docs/application-foundation.md` | Modify | Document four-area IA, detached protected routes, and completion recovery | Shipped behavior | AT-01–AT-08, AT-12 |
| 13 | `.sdd/reports/more-retirement-session-recovery/BUILD_REPORT.md` | Create | Record implementation, diff, tests, AC evidence, and risks | Build completion | All |

No files may be deleted. Build may modify only these 13 paths. Ship archival artifacts are lifecycle output, not Build authorization.

## Dependency-ordered implementation plan

1. Update pure IA model and Node assertions.
2. Update IA feature composition and browser expectations.
3. Correct regular Session unavailable-source completion and add regression coverage.
4. Correct Deep Work dialog/recovery behavior and add regression coverage.
5. Update documentation and forward cache generation/assertion.
6. Run focused Node/browser validation in Chromium and mobile.
7. Run PWA/offline regressions, canonical `npm run test:all`, and `git diff --check`.
8. Produce BUILD_REPORT and verify the closed manifest.

## Closed test manifest and AC traceability

| Acceptance | Evidence location |
| --- | --- |
| AT-01 | `tests/information-architecture-model.test.js`; `tests/browser/information-architecture-flows.spec.js` desktop/mobile |
| AT-02 | `tests/browser/information-architecture-flows.spec.js` DOM absence assertions |
| AT-03 | Model resolve assertion plus browser direct-load/history assertion |
| AT-04 | Browser direct routes and reload; no false `aria-current` |
| AT-05 | Browser settings, export/import presence, Drive/vault entry assertions plus existing backup/vault regressions |
| AT-06 | Existing quick Session, resource, capability, and Deep Work regression tests |
| AT-07 | New critical-flow unavailable-source regular Session test |
| AT-08 | New critical-flow unavailable-source Deep Work test |
| AT-09 | New regular recovery test retains required Evidence validation before valid submit |
| AT-10 | Existing capability-context storage rejection tests plus new paths through unchanged rollback |
| AT-11 | IA/critical flows in Chromium/mobile; existing design-system accessibility checks |
| AT-12 | Manifest/Service Worker Node tests, PWA lifecycle browser suite, canonical suite, and contract inspection |

### Focused commands

- `npm test -- --test-name-pattern="information architecture|manifest|session|deep work"` where supported; otherwise run the named Node files with `node --test`.
- `npx playwright test tests/browser/information-architecture-flows.spec.js tests/browser/critical-flows.spec.js --project=chromium`
- `npx playwright test tests/browser/information-architecture-flows.spec.js tests/browser/critical-flows.spec.js --project=mobile`
- `npx playwright test tests/browser/capability-context-flows.spec.js tests/browser/design-system-flows.spec.js tests/browser/pwa-lifecycle-flows.spec.js`
- `npm run test:all`
- `git diff --check`

Browser commands must use an isolated local server/`APP_URL` if port 4173 is occupied by another worktree; `ERR_EMPTY_RESPONSE` before navigation assertions is infrastructure failure, not product evidence.

## Security, privacy, performance, and operations

- No network, telemetry, permission, credential, or personal-data flow changes.
- Removing hub composition slightly reduces DOM work.
- Completion continues using local persistence and existing transactional rollback.
- Remote Linux CI remains a PR gate; physical installed-PWA smoke remains human evidence after CI.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Protected routes become undiscoverable | Explicitly accepted in this removal scope; preserve routes/data and defer relocation. |
| Stale `more` history opens blank content | Remove model record and test startup/history fallback. |
| Missing source accidentally changes progress | Compute/update metrics only with an available cloned source; assert source is not recreated. |
| Direct Deep Work completion remains hidden | Make `deepShowFinish()` synchronously open the existing dialog before focus. |
| Installed PWA retains old modules | Advance to v75 and run PWA/offline regression tests. |

## Rollback

Before publication, revert the complete product/test/docs unit. No data rollback or migration is required. If v75 is ever activated in installed clients, any correction must ship under a new forward generation (v76 or later); never clear IndexedDB, localStorage, backups, vaults, or unrelated caches.

## Remaining unresolved questions

None blocking Build.

## Design gate

- DEFINE clarity: 15/15
- Current source/tests/docs/CI inspected: Yes
- Architecture and error flows closed: Yes
- Exact Build manifest closed at 13 paths: Yes
- 12/12 acceptance traceability: Yes
- Migration/compatibility/rollback addressed: Yes

`PASS — Ready for Build`

## Revision history

| Revision | Date | Author | Change |
| --- | --- | --- | --- |
| 1.0 | 2026-08-11 | Codex | Initial repository-grounded Design for `Mais` retirement and unavailable-source Session recovery. |

## Recommended next skill

`$sdd-build`
