# BUILD REPORT: Retirada de Mais e recuperacao do encerramento de sessoes

## Metadata

- Feature: `more-retirement-session-recovery`
- Phase: Build
- Status: `Shipped`
- Date: 2026-08-11
- Branch: `codex/retire-more-navigation`
- Baseline HEAD: `f15c4573cfd0f9b2ce7ae4ceadd075cab598bc61`
- Define: `.sdd/features/more-retirement-session-recovery/DEFINE.md`
- Design: `.sdd/features/more-retirement-session-recovery/DESIGN.md` revision 1.1
- Closed Build manifest: 14 paths

## Summary

The Build removes the `Mais` primary navigation area and stops composing its hero, advanced shortcut cards, system panel, and hub vault container. The protected Notes, Relations/graph, Contextual AI, Drive, JSON backup/restore, and Markdown vault modules/data/routes remain in the application shell and retain their existing owners.

The Build also corrects the reproduced completion trap for regular Session and Deep Work records whose source item is unavailable. Completion now derives presentation from the execution record, skips only source-progress projection, preserves canonical Evidence provenance, and never recreates or infers a missing source.

## Root cause and correction

### Regular Session

Before Build, `openSessionFinish()` returned immediately when `sessionItem()` was unavailable, leaving the Session active. After separating source resolution from presentation, a second source-dependent expression still accessed `metric.value` for a missing Study metric. That exception happened after the Session entered `finishing` and before the dialog opened.

Correction:

- `sessionSourceItem()` resolves only a real source record.
- `sessionItem()` may still provide existing capability-context presentation without claiming source availability.
- The completion dialog always opens for an active Session.
- Study metric suggestion and progress updates execute only when a source/metric exists.
- Session transition, Evidence, execution sync, persistence, rollback, and continuation reuse the existing path.

### Deep Work

Before Build, active recovery depended on source lookup, and `deepShowFinish()` could expose the finish region while its dialog remained closed when invoked directly from the companion.

Correction:

- `deepOpenCore()` permits an existing active/finishing record to populate the dialog from its persisted fields when the source is absent; new starts still require a source.
- `deepShowFinish()` synchronously opens the existing dialog before scroll/focus orchestration.
- `deepCommitFinish()` and canonical derived Evidence remain unchanged.

## Manifest task execution

| Path | Result | Acceptance coverage |
| --- | --- | --- |
| `.sdd/features/more-retirement-session-recovery/DEFINE.md` | Complete (Built) | All |
| `.sdd/features/more-retirement-session-recovery/DESIGN.md` | Complete (Built) | All |
| `information-architecture-model.js` | Four areas; protected views detached; `more` falls back | AT-01–AT-04 |
| `information-architecture-feature.js` | `Mais` hub/actions/vault relocation removed | AT-01–AT-05, AT-11 |
| `sessions-feature.js` | Missing-source completion and metric guard | AT-06, AT-07, AT-09, AT-10, AT-12 |
| `deep-work-feature.js` | Missing-source recovery and deterministic dialog opening | AT-08, AT-10–AT-12 |
| `app-manifest.js` | Forward generation `compasso-pages-v75` | AT-12 |
| `tests/information-architecture-model.test.js` | Four-area/detached-route/fallback contracts | AT-01, AT-03, AT-04 |
| `tests/browser/information-architecture-flows.spec.js` | Retired UI, routes, controls, desktop/mobile | AT-01–AT-05, AT-11 |
| `tests/browser/critical-flows.spec.js` | Missing-source regular/Deep Work regressions | AT-06–AT-11 |
| `tests/app-manifest.test.js` | v75, state v3, protected app-shell modules/assets | AT-04, AT-05, AT-12 |
| `docs/application-foundation.md` | Current IA and resilient completion contract | AT-01–AT-08, AT-12 |
| `tests/browser/design-system-flows.spec.js-snapshots/design-system-1280-chromium-linux.png` | Exact runner baseline for the approved four-item navigation and contextual Atlas | AT-01, AT-02, AT-11 |
| `.sdd/reports/more-retirement-session-recovery/BUILD_REPORT.md` | This evidence | All |

No file was deleted. No path outside the closed 14-path Build manifest changed.

## Validation evidence

| Command/evidence | Exit | Result |
| --- | --- | --- |
| Baseline existing-source Chromium quick Session + Deep Work | 0 | 2 passed |
| Direct unavailable-source reproduction before correction | 0 | Dialog closed; Session active; toast `O item desta sessão não existe mais` |
| `node --test tests/information-architecture-model.test.js tests/app-manifest.test.js tests/session-timer-model.test.js tests/deep-work-model.test.js` | 0 | 29 passed |
| New missing-source Chromium tests | 0 | 2 passed |
| Information architecture Chromium | 0 | 10 passed, 1 mobile-only skip |
| Information architecture mobile | 0 | 11 passed |
| Normal + missing-source completion mobile | 0 | 4 passed |
| Capability-context + design-system Chromium/mobile | 0 | 34 passed, 4 conditional skips |
| PWA lifecycle Chromium | 0 | 10 passed |
| `npm run test:all` | 0 | 183 Node passed; 163 browser passed; 19 conditional skips; 0 failed |
| `git diff --check` | 0 | PASS; only configured LF-to-CRLF working-copy warnings |

The first attempted focused browser run reused an unrelated server on port 4173 and failed before assertions with `ERR_EMPTY_RESPONSE`; it is classified as local test infrastructure and was replaced by isolated `APP_URL` servers. A later combined command exceeded the tool timeout and produced no result; it was discarded. All reported pass evidence comes from completed commands.

## Acceptance evidence

| AC | Result | Evidence |
| --- | --- | --- |
| AT-01 | PASS | Model and desktop/mobile browser assert exactly four ordered primary areas and no `Mais`. |
| AT-02 | PASS | Browser asserts absence of `moreView`, `iaMoreVault`, and `.ia-system`; feature no longer composes them. |
| AT-03 | PASS | Model resolves `more` to `today`; browser verifies Hoje, current state, URL replacement, and no blank hub. |
| AT-04 | PASS | Notes/dictionary/context routes remain registered and stable across reload with no false primary current item; manifest retains protected modules/assets. |
| AT-05 | PASS | Existing settings and JSON controls remain visible; manifest retains Drive/vault modules; capability backup/vault/Relations canaries pass. |
| AT-06 | PASS | Existing-source quick Session, resource metrics, capability provenance, Deep Work, Evidence, and continuation regressions pass. |
| AT-07 | PASS | New regular unavailable-source test completes, saves Evidence by Session id, and leaves source absent. |
| AT-08 | PASS | New Deep Work unavailable-source recovery test reopens from the companion, completes, saves derived Evidence, and leaves source absent. |
| AT-09 | PASS | New regular test submits empty Evidence first, retains `finishing`, and focuses the required field before valid completion. |
| AT-10 | PASS | Existing storage-rejection tests pass; changed flows retain the same rollback/error implementation. |
| AT-11 | PASS | Chromium/mobile IA and completion tests plus design-system keyboard, focus, 360–390 px, zoom, coarse-pointer, and reduced-motion regressions pass. |
| AT-12 | PASS | State remains v3; v75 asserted; Service Worker file unchanged; 10/10 PWA lifecycle and canonical suites pass. |

**Acceptance reconciliation: 12/12 PASS.**

## Compatibility verification

- `compasso.state.v3`: unchanged and asserted.
- Schema/migration/collections: unchanged; no migration.
- Session/Evidence `sessionId`: preserved and asserted for missing-source records.
- Missing source: not recreated, inferred, reassociated, or updated.
- Legacy unlinked Session/Evidence: existing regressions pass.
- `learningSignals`: no implementation change; capability-context suite passes.
- Today ownership and Execute precedence: no implementation change; IA/continuity regressions pass.
- JSON backup/restore, Notes, vault, Relations, graph canaries: pass.
- Contextual AI, Drive, Markdown/vault, graph modules/assets: retained in manifest.
- IndexedDB/localStorage/offline: unchanged; canonical and PWA lifecycle pass.
- Service Worker architecture: `service-worker.js` has no diff.

## Autonomous decisions

1. Protected routes use `area:null` rather than being falsely assigned to another primary area.
2. The browser journey fixture does not compose Drive/vault/dictionary/context modules; preservation is asserted in the full manifest Node contract, while browser route state is tested in the reduced fixture.
3. Isolated ports were used because another worktree owned 4173; no unrelated process or worktree was modified.
4. PWA generation advanced to v75 as required by the Design and cached runtime changes.

## Deviations from Design

None in product behavior or manifest. Test evidence for Drive/vault module presence is at the manifest-contract level because the repository's fast browser fixture intentionally excludes those modules; their existing backup/vault/Relations browser canaries still pass in the applicable suite.

## Residual risks

- No physical installed-PWA human smoke was performed by Codex.
- Initial PR Linux CI exposed the superseded 1280 px navigation baseline. The stable runner image was captured twice with the same SHA-256, visually inspected, and used to refresh only that approved snapshot; final checkpoint CI remains the merge gate.
- Protected advanced routes are intentionally less discoverable after removing `Mais`; relocation was an explicit non-goal.
- `npm ci` reported two high-severity dependency audit findings in the existing test dependency tree; no dependency was changed and automated forced remediation is outside scope.

## Final checklist

- [x] Closed 14-path Build manifest respected
- [x] No deletion, schema, migration, route removal, or persistence concept
- [x] Product behavior implements 12/12 acceptance scenarios
- [x] `compasso.state.v3`
- [x] `compasso-pages-v75`
- [x] Service Worker architecture unchanged
- [x] Focused and canonical validation PASS
- [x] `git diff --check` PASS
- [x] Ready for Ship

## Revision history

| Revision | Date | Author | Change |
| --- | --- | --- | --- |
| 1.0 | 2026-08-11 | Codex | Completed Build with root-cause correction, closed-manifest evidence, and canonical validation. |
| 1.1 | 2026-08-11 | Codex | Recorded contextual Atlas correction and refreshed the exact stale Linux visual baseline revealed by PR CI. |

## Recommended next skill

`$sdd-ship`
