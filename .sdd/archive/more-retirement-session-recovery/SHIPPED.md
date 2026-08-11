# Retirada de Mais e recuperacao do encerramento de sessoes — Shipped

## Metadata

- Feature: `more-retirement-session-recovery`
- Lifecycle state: `Shipped through SDD`
- Ship status: `PASS`
- Date: 2026-08-11
- Branch at verification: `codex/retire-more-navigation`
- Baseline HEAD: `f15c4573cfd0f9b2ce7ae4ceadd075cab598bc61`
- Build manifest: 13 exact paths
- Acceptance: 12/12 PASS
- PWA generation: `compasso-pages-v75`
- State contract: `compasso.state.v3`

## Closure boundary

This Ship closes the user-approved removal of the `Mais` primary-navigation entry and every section composed by its hub, plus the correction that lets regular Session and Deep Work records finish when their source item is unavailable.

The closure does not delete or redesign Notes, Relations/graph, Contextual AI, Drive, JSON backup/restore, Markdown/vault, Studies, Readings, capabilities, Session/Evidence, or `learningSignals`. Their existing data, direct routes, owners, and compatibility contracts remain preserved.

## Shipped behavior

- Primary navigation contains exactly Hoje, Frentes, Journal, and Revisão.
- No `moreView`, `Mais` hero, Notes/Relations/Context cards, system panel, or hub vault container is composed.
- Legacy `?view=more` resolves to Hoje and replaces the stale route.
- Notes, dictionary/graph, and contextual routes remain valid direct surfaces without a false primary-current announcement.
- Settings and JSON controls remain global; Drive/vault/protected modules remain in the app shell.
- A regular Session can open and save completion/Evidence when its source is missing; resource progress is simply not projected.
- Active/finishing Deep Work can reopen and complete from persisted execution data when its source is missing.
- Missing sources are never recreated, inferred, reassociated, or updated.
- Existing persistence rejection and retry behavior remains intact.

## Independent Ship verification

- Actual pre-archive Build diff matched the closed 13-path manifest exactly: no missing or extra paths.
- No staged changes existed.
- No file deletion existed.
- `service-worker.js` had no diff.
- `app-manifest.js` retained `compasso.state.v3` and advanced to `compasso-pages-v75`.
- `git diff --check` exited 0; only repository-configured LF-to-CRLF working-copy warnings were emitted.
- Fresh canonical evidence remained valid because no product/test change occurred after it.

## Validation summary

| Validation | Result |
| --- | --- |
| Focused Node contracts | 29 passed |
| New unavailable-source Chromium flows | 2 passed |
| IA Chromium | 10 passed, 1 mobile-only skip |
| IA mobile | 11 passed |
| Normal/missing-source mobile completion | 4 passed |
| Capability/design-system Chromium + mobile | 34 passed, 4 conditional skips |
| PWA lifecycle Chromium | 10 passed |
| Canonical `npm run test:all` | 183 Node passed; 163 browser passed; 19 conditional skips; 0 failed |
| `git diff --check` | PASS |

## Acceptance reconciliation

| AC | Result | Ship conclusion |
| --- | --- | --- |
| AT-01 | PASS | Four ordered primary areas; no `Mais` control. |
| AT-02 | PASS | All `Mais` hub sections absent from rendered composition. |
| AT-03 | PASS | Stale `more` route normalizes to Hoje without blank UI. |
| AT-04 | PASS | Protected routes/modules/assets remain and no false primary area is current. |
| AT-05 | PASS | Global settings/JSON controls and protected Drive/vault contracts remain. |
| AT-06 | PASS | Existing-source Session/Deep Work behavior remains green. |
| AT-07 | PASS | Missing-source regular Session completes with canonical Evidence and no source recreation. |
| AT-08 | PASS | Missing-source Deep Work reopens/completes with existing Evidence behavior. |
| AT-09 | PASS | Evidence remains explicit and required for regular Session completion. |
| AT-10 | PASS | Existing rollback and retry path remains valid on storage rejection. |
| AT-11 | PASS | Keyboard, focus, mobile, zoom, coarse-pointer, and reduced-motion regressions pass. |
| AT-12 | PASS | Offline/PWA/state compatibility passes under v75 and unchanged Service Worker architecture. |

**Final reconciliation: 12/12 PASS.**

## Compatibility verification

- No schema, migration, collection, merge, tombstone, backup, or restore change.
- IndexedDB/localStorage and JSON round-trip remain unchanged.
- Canonical Session/Deep Work/Execution Session/Evidence ownership remains unchanged.
- Notes CRUD/search/source links, Markdown/vault, wikilinks, Relations, graph derivation, Contextual AI data, Studies, Readings, Today isolation, and all protected routes are retained.
- Existing legacy unlinked records receive no inferred association.
- `learningSignals` consent and durable semantics are untouched.
- Service Worker install/activate/fetch/composition/cache-ownership architecture is unchanged.

## Residual risks and release gates

### Physical installed-PWA human smoke — non-blocking for SDD Ship; required operational follow-up

Automation validated controlled/offline lifecycle behavior, but Codex did not and cannot attribute a physical installed-PWA close/reopen observation. A human should verify v75 update, four-item navigation, regular completion, and offline reopen on an installed client.

### Remote Linux CI — non-blocking for SDD Ship; blocking merge gate

Local canonical validation is complete. The new PR requested by the user must run the repository's Ubuntu/Chromium Browser Tests workflow before merge. No remote result is claimed in this artifact.

### Protected-route discoverability — accepted product trade-off

The protected direct routes remain valid but are intentionally not relocated in this scope. Their reduced discoverability follows the explicit request to remove `Mais`; future placement needs a separate approved delivery.

## Lessons retained

1. Execution completion must be owned by the execution record. A missing source may suppress progress projection, but it must not trap a Session in a non-terminal state.
2. Removing an IA parent should remove it from the declarative model as well as the DOM; otherwise stale routes and accessibility state can expose an empty destination.
3. Source-dependent expressions must all be guarded after a missing-source path is introduced; the Study suggestion calculation demonstrated how one leftover metric access can fail between state freeze and dialog presentation.
4. Fast browser fixtures intentionally omit heavy protected modules. Route behavior belongs in the journey fixture, while module/cache preservation belongs in the full manifest/composition contract.

## Archived artifacts

- `.sdd/archive/more-retirement-session-recovery/DEFINE.md`
- `.sdd/archive/more-retirement-session-recovery/DESIGN.md`
- `.sdd/archive/more-retirement-session-recovery/BUILD_REPORT.md`
- `.sdd/archive/more-retirement-session-recovery/SHIPPED.md`

Archival used copy-only mode. Working artifacts remain under `.sdd/features/` and `.sdd/reports/` for the scoped PR and audit trail.

## Release actions

No commit, push, PR, merge, deployment, GitHub Pages publication, or staging modification occurred during Ship. The user's separate publication authorization is handled after this closure.
