# Capability-first Compasso — Shipped

**Initiative:** `learning-loop-redesign`
**Delivery:** 3 — Capability-first Compasso
**Status:** SHIP PASS — Ready for Git integration
**Shipped through SDD:** 2026-08-09
**Baseline:** `f00e7c1eeeb07ffa9960d20f07b12ab20f22e37c`
**Branch:** `codex/operational-learning-loop-define`
**Design:** Revision 1, closed 20-path implementation/evidence manifest
**Archive mode:** Copy-only; working feature/report artifacts retained

## Closure boundary

This archive closes only Delivery 3, **Capability-first Compasso**. It does not close the remaining `learning-loop-redesign` roadmap, reopen either shipped delivery, commit or integrate Git history, run remote CI, deploy, publish, or release the PWA. Slice 1 and Delivery 2 remain unchanged in their existing archives.

The installed `sdd-ship` package did not contain its referenced `templates/SHIPPED_TEMPLATE.md`. This record therefore follows the repository's established shipped-delivery structure while retaining every required Ship section.

## Shipped behavior

Capability is now an optional cross-cutting learning context across Capacidades, Hoje, Estudos, Leituras, existing quick/Deep Work sessions, Evidence, Weekly Review, Results, and Consistency:

```text
Capability → next attempt → supporting resources → Hoje → session →
Evidence → learner-approved signal → reflection → explicit next decision
```

- Hoje owns only its planning reference and completion state.
- `learningOutcomes` continues to own the capability, current next attempt, lifecycle, and Study/Reading `resourceRefs`.
- Existing Session, Deep Work, and canonical Execution Session records continue to own execution provenance through `learningContext`.
- Evidence remains unchanged and resolves capability context only through `sessionId` to the canonical execution.
- Study/Reading metrics remain resource facts and never become capability progress.
- Weekly Review owns historical reflection/decision snapshots; keep/revise remains explicit.
- Results separates Evidence and decisions from supporting activity.
- Consistency filters explicit provenance without describing cadence, streak, duration, or volume as capability progress.

No capability percentage, mastery, confidence, completion, demonstrated score, ranking, or streak was introduced.

## Durable data and merge contract

`learningSignals` is the only new durable collection. State remains `compasso.state.v3`, with no new object store, storage key, migration job, or schema-version bump.

- Valid kinds: `feedback`, `gap`, `question`, and `insight`.
- Durable origin: learner-authored or explicitly confirmed suggestion only.
- Association: complete `{ outcomeId, attemptId, attemptText }`; partial references are rejected.
- Provenance: optional execution, Evidence, or Weekly Review `sourceRef`.
- Update: record timestamp; compatible unknown metadata remains preserved.
- Delete: `_sync.tombstones['learningSignals:<id>']` prevents resurrection.
- Equal-clock divergence: existing state-foundation conflict copies retain audit evidence.
- Missing source/capability/resource: snapshot or unavailable state remains valid; nothing is inferred or recreated.
- Signals never modify capability lifecycle, resource progress, or the current next attempt.

## Independent Ship validation

| Gate | Result |
| --- | --- |
| `npm run test:all` | Exit 0 in the Ship turn |
| Full Node suite | 181 passed, 0 failed, 0 skipped |
| Full browser suite | 144 passed, 0 failed, 18 intentional project/viewport skips |
| Browser projects | Chromium and mobile capability, compatibility, and accessibility flows passed |
| PWA lifecycle | Controlled install/update/reload/offline/reopen paths passed; v73 composed successfully |
| `git diff --check` before archive | Exit 0; no whitespace errors |
| Closed-manifest audit | Exact 20/20 product/evidence paths; 0 additional paths; 0 deletions |
| Frozen-file audit | Service Worker, storage, shipped Session/Evidence owners, Contextual AI, Notes/Relations/vault/graph, package/lock, CI, and prior archives unchanged |
| Git state | Expected branch/HEAD; 0 staged paths |

## Acceptance reconciliation

| AC | Status | Independent Ship evidence |
| --- | --- | --- |
| AC-01 Optional association | Pass | Resource/session paths default to no capability; full legacy flows remain valid and no model projection infers a link. |
| AC-02 Capability summary | Pass | Browser summary projects available Today, resource, finalized execution, Evidence, signal, and review data without prohibited capability metrics. |
| AC-03 Today opt-in and isolation | Pass | Chromium/mobile tests add, open, start, complete, reopen, and remove the reference while asserting the capability is unchanged; save failure rolls back. |
| AC-04 Resource-side association | Pass | Study association/link/unlink updates outcome `resourceRefs` only; resource metrics and both records remain intact. |
| AC-05 Resource deletion boundary | Pass | Outcome-model missing-resource regression and capability projection fallback retain an unavailable reference without recreation. |
| AC-06 Resource-origin session | Pass | Optional quick/Deep selection preserves Study metrics, canonical provenance, Evidence normalization, and unchanged capability state. |
| AC-07 Legacy execution compatibility | Pass | Existing Study/Reading, Session, Deep Work, Evidence edit/delete, history, review, backup, and canonical normalization tests remain green and unlinked. |
| AC-08 Learning signals | Pass | Explicit create/edit/delete browser flow plus pure-model tests cover all kinds, provenance, isolation, and tombstones. |
| AC-09 Suggested-signal consent | Pass | Runtime-only suggestion is not normalizable as durable state; only explicit confirmation creates a signal. Escape without save leaves the collection empty. |
| AC-10 Deliberate next attempt | Pass | Keep leaves the capability byte-equivalent; revise requires explicit text and preserves attempt ID and creation timestamp. |
| AC-11 Weekly Review | Pass | Linked finalized attempts, Evidence, signals, reflection, and decision coexist with existing unlinked/general review activity. |
| AC-12 Results | Pass | `Evidências e decisões` is separated from `Atividade de apoio`; supporting metrics are not presented as proof. |
| AC-13 Consistency | Pass | All/unlinked/explicit capability filters restore the expected history and label outcome-only activity `Sem métrica de recurso`. |
| AC-14 Archived or unavailable capability | Pass | Historical snapshots remain readable, invalid navigation/start is disabled, and new selection requires an active current capability. |
| AC-15 Backup and offline round-trip | Pass | State v3 normalization/merge, JSON export/import, refresh, tombstone/conflict behavior, and controlled cached offline reopen passed. |
| AC-16 Contextual AI isolation | Pass | Capability-first sources contain no Contextual AI/external service dependency; blocked-network flows work and existing Context data remains unchanged. |
| AC-17 Future retirement safety | Pass | Delivery 3 preserves Contextual AI data/assets/routes and documents `capabilities` as the later fallback; actual retirement remains correctly outside this delivery. |
| AC-18 Notes and Relations contracts | Pass | State/browser/manifest canaries preserve notes, folders, source links, Markdown metadata, wikilinks, vault, dictionary/relations, and graph derivation. |
| AC-19 Accessible cross-surface behavior | Pass | Chromium/mobile tests cover keyboard/focus return, semantic labels, 44px touch targets, long text, missing states, 200% zoom, and overflow. |

**Totals:** 19 Pass, 0 Partial, 0 Fail, 0 Not run.

## Compatibility verification

- PWA generation is `compasso-pages-v73`; `service-worker.js` and the manifest-owned composition/update architecture are unchanged.
- IndexedDB, localStorage compatibility, storage keys, JSON backup/restore, and state v3 remain authoritative.
- Legacy Session and Evidence records without `learningContext` remain valid and receive no inferred links.
- Evidence has no duplicated capability field; projection remains `evidence.sessionId → execution.learningContext`.
- Contextual AI modules, `explanationEvaluations`, `errorNotebook`, legacy errors, Active Recall, and references remain present and isolated.
- Notes CRUD/access, source links, folders, Markdown/vault metadata, wikilinks, dictionary/relations, and graph assets remain present.
- No external AI, backend, remote endpoint, framework, dependency, permission, telemetry, or migration was added.

## Residual-risk disposition

### Physical installed-PWA observation — Non-blocking

No person performed and recorded a physical installed-PWA close/reopen observation for this uncommitted delivery. This is non-blocking for SDD closure because no acceptance criterion or Design Ship gate makes that human observation mandatory, and the repository's real Service Worker lifecycle suite passed controlled install, update, browser reopen, offline reload, shell completeness, and local-state preservation for v73. A human installed-PWA smoke remains recommended before publication and must be attributed to the person who performs it.

### Remote Linux CI validation — Non-blocking

Remote Linux CI has not run because no commit/push/remote release action was authorized. This is non-blocking for SDD closure because the approved Ship gate is the canonical repository suite plus `git diff --check`; both passed locally. The changed runtime remains static HTML/CSS/JavaScript, package/lock/CI are unchanged, and LF/CRLF composition coverage passed. Remote CI remains a required integration confidence check once a separately authorized branch checkpoint exists and before publication.

## Design comparison and deviations

- Product/evidence changes match the closed 20-path manifest exactly.
- No frozen source or archived prior-delivery artifact changed.
- No implementation, schema, ownership, acceptance, migration, or PWA architecture deviation was found.
- The only process variance was using the repository's established Ship record format because the installed skill template was absent; this changed no product or acceptance contract.
- No blocker remains.

## Lessons retained

1. One complete capability-attempt reference can serve planning, execution, signals, and review while each domain keeps its own fact ownership; this avoids both generic relation infrastructure and divergent copies.
2. Evidence context stays safest when normalized through canonical `sessionId` rather than copied onto Evidence, which preserves legacy editing, deletion, and backup contracts.
3. Durable derived learning signals need a visible confirmation boundary plus tombstone/conflict behavior; treating a runtime suggestion as a record would silently convert inference into a learner decision.
4. PWA compatibility is easiest to verify when generation and asset order remain manifest-owned and the Service Worker stays unchanged; v73 then becomes a bounded forward shell update.

## Archived artifacts

- `BRAINSTORM.md` — roadmap amendment and preserved prior-delivery boundary.
- `DEFINE.md` — 16 requirements and 19 acceptance criteria.
- `DESIGN.md` — approved ownership, persistence, PWA, compatibility, and 20-path manifest contract.
- `BUILD_REPORT.md` — implementation evidence and Build reconciliation.
- `SHIPPED.md` — independent Ship evidence, residual-risk classification, and closure decision.

Working copies are retained in copy-only mode. No feature/report directory was removed.

## Release and operational state

- Git staging, commit, push, merge, and rebase: not performed.
- Remote Linux CI: not triggered.
- Deployment, GitHub Pages publication, PWA publication, and staging changes: not performed.
- Production/user data and caches: not touched.

**Final lifecycle state:** Delivery 3 — Capability-first Compasso is **Shipped through SDD** and ready for a separately authorized Git integration checkpoint.

**Next safe step:** review and create a scoped Delivery 3 Git checkpoint if authorized, run remote CI on that checkpoint, and obtain a human installed-PWA smoke before any publication decision.
