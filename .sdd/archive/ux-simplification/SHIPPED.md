# UX Simplification — Continuity-first learning journey — Shipped

## Metadata

| Field | Value |
| --- | --- |
| Feature | `ux-simplification` |
| Delivery | Continuity-first learning journey |
| Closure date | `2026-08-11` |
| Ship revision | `1.1` — AT-05/AT-22 correction reverified |
| Status | `SHIP PASS` |
| Archive mode | Copy-only; working feature/report artifacts retained |
| Branch | `codex/ux-simplification-brainstorm` |
| Baseline HEAD | `b26f98416f277d60b1ee563c4d68f27261699bbb` |
| Corrected checkpoint parent | `5d5c7a6c28bfa563132c99371288330c1c7c9984` |
| Design | Revision 1.2; closed 22-path Build manifest |
| Build report | Revision 0.4; Build correction PASS |
| State contract | `compasso.state.v3`, unchanged |
| PWA generation | `compasso-pages-v74` |

## Closure boundary

This archive closes the incremental UX Simplification delivery that makes the existing Capability-first loop perceptibly continuous:

```text
Hoje → Session → Evidence / learningSignal → Weekly Review → explicit next-attempt decision
```

The delivery reorders and composes existing behavior. It does not add a persistence concept, change ownership, alter routes, consolidate Results and Consistency, relocate book synthesis, retire Notes, Relations, or Contextual AI, change the Service Worker architecture, or perform a broad visual redesign.

Ship performed independent verification and archival only. No product code or tests were changed during Ship, and no Git integration, remote release, staging change, deployment, or publication was performed.

## Shipped behavior

- Hoje presents one valid planned current attempt as its primary state, respects stored Today order, and keeps stale or missing references non-executable.
- The global `Executar` control has the stable accessible name `Executar`, resumes active work first, otherwise starts the valid Today primary action, and falls back to Hoje with deterministic focus when no executable action exists. Hoje preserves that semantic primary focus through a subsequent complete render while Hoje remains active.
- Capability-aware Sessions start immediately with existing defaults. Existing optional configuration remains available through progressive disclosure rather than a parallel configuration model.
- Session and Deep Work completion await canonical Evidence persistence through `sessionId` before presenting completion continuation.
- Completion provides `Voltar para Hoje`, optional `Registrar sinal`, and capability access when valid. Signal suggestions remain ephemeral until an explicit learner save creates one durable `learningSignal`.
- Weekly Review places capability reflection and explicit keep/revise decisions before secondary activity summaries. Supporting Evidence and activity detail use accessible collapsed disclosures.
- Hoje can open the first unresolved capability decision in Weekly Review and focus it directly.

## Closed-manifest verification

The corrected tracked implementation/evidence diff against the Delivery baseline matches the approved Design revision 1.2 manifest exactly: the same 22 paths, 812 insertions, 128 deletions, and no deleted files. Relative to the existing shipped checkpoint, the correction changes only `today-feature.js` and `tests/browser/information-architecture-flows.spec.js`; the live Build report is the only additional working SDD artifact.

1. `app-manifest.js`
2. `today-feature.js`
3. `sessions-feature.js`
4. `evidence-feature.js`
5. `deep-work-feature.js`
6. `learning-outcome-feature.js`
7. `weekly-review-feature.js`
8. `journal-feature.js`
9. `information-architecture-feature.js`
10. `design-system.css`
11. `docs/today-feature.md`
12. `docs/sessions-feature.md`
13. `docs/evidence-feature.md`
14. `docs/weekly-review-feature.md`
15. `docs/capability-first-compasso.md`
16. `tests/today-central-contract.test.js`
17. `tests/app-manifest.test.js`
18. `tests/browser/capability-context-flows.spec.js`
19. `tests/browser/information-architecture-flows.spec.js`
20. `tests/browser/design-system-flows.spec.js`
21. `tests/browser/critical-flows.spec.js`
22. `tests/browser/learning-outcome-flows.spec.js`

The final two browser suites were added by the approved Design revisions 1.1 and 1.2 after Iterate established that their prior interactions asserted intentionally superseded presentation behavior. Their semantic regression coverage remains intact. No unrelated tracked modification or staged path was present.

## AT-05 / AT-22 correction verification

PR #74 remote run `31484989313` established the defect boundary: 183 Node tests passed, 155 browser tests passed, 19 browser cases were intentionally skipped, and the same Execute fallback focus assertion failed in desktop Chromium and mobile Chromium, including retries. GitGuardian passed, and no merge or release followed.

Independent source and runtime inspection confirmed that `renderTodayPrimary()` replaces the projected primary node. The former one-shot focus could therefore remain attached to a removed node after a later `renderAll()`. The cold-start composed fixture also demonstrated that feature-runtime availability precedes removal of `hidden`/`inert` from the PWA shell; the acceptance test now waits for that existing interactive boundary before exercising keyboard activation.

The correction is ephemeral and local to Today: when the currently focused element is the projected primary action, Hoje records a transient restoration intent before rendering and consumes it on the existing `render:after` event only if Hoje remains active. The initial requestAnimationFrame handoff remains unchanged. There is no timeout, persisted focus state, route, schema, coordinator, or ownership change. The regression test retains native Enter activation, forces a second `renderAll()`, and verifies that `Nova ação` remains focused.

## Independent Ship validation

| Gate | Result |
| --- | --- |
| `APP_URL=http://127.0.0.1:4174 npm run test:all` | Exit 0 during Ship |
| Full Node suite | 183 passed, 0 failed, 0 skipped |
| Full browser suite | 157 passed, 0 failed, 19 intentional project/viewport skips |
| AT-05/AT-22 repeated cold-start focus | 20 passed across Chromium/mobile, 0 failed; 10 repetitions per project with forced rerender |
| Focused continuity/accessibility matrix | 53 passed, 0 failed, 5 intentional project-conditional skips |
| Focused PWA lifecycle | 10 passed, 0 failed, 10 intentional project-conditional skips |
| Focus/state/manifest/Service Worker contracts | 45 passed, 0 failed |
| `git diff --check` | Pass after archival; no whitespace errors |
| Closed-manifest audit | Exact 22/22 Delivery paths; correction limited to 2 authorized paths plus Build/Ship evidence; 0 unrelated paths; 0 deletions |
| Git state | Expected branch/HEAD; 0 staged paths |

## Acceptance reconciliation

| AC | Status | Independent Ship evidence |
| --- | --- | --- |
| AT-01 | Pass | Active normal Session resumes before a new Today execution; Deep Work uses the matching resume command. |
| AT-02 | Pass | The current planned attempt appears once in `todayPrimaryAction` with immediate execution and capability access. |
| AT-03 | Pass | Stored Today order deterministically selects between multiple valid capability attempts. |
| AT-04 | Pass | A normal planned Today action remains executable without inferred capability context. |
| AT-05 | Pass | Empty global Execute opens Hoje, starts no Session, focuses `Nova ação`, and retains that focus through an explicit full rerender. |
| AT-06 | Pass | Immediate start uses existing defaults and preserves identical canonical `learningContext` in Session and execution. |
| AT-07 | Pass | Existing optional controls are exposed by native disclosure with keyboard, Escape, and focus-return behavior. |
| AT-08 | Pass | Study/Reading resource metrics remain independent from optional capability context and capability progress. |
| AT-09 | Pass | Completion appears only after awaited canonical Evidence persistence by `sessionId`. |
| AT-10 | Pass | Interrupted capability-aware Deep Work can open an empty signal form without creating a record. |
| AT-11 | Pass | Evidence-derived suggestions identify their provenance, remain editable, and remain non-durable before save. |
| AT-12 | Pass | Cancel and unlinked completion create no signal and retain a usable Hoje continuation. |
| AT-13 | Pass | Explicit save creates exactly one `confirmed-suggestion` signal with the Evidence source. |
| AT-14 | Pass | Explicit capability continuation opens the capability without changing capability or Today state. |
| AT-15 | Pass | `Voltar para Hoje` preserves the incomplete Today reference and unchanged next attempt. |
| AT-16 | Pass | Weekly capability decisions precede closure and supporting activity summaries. |
| AT-17 | Pass | Explicit keep records reflection while preserving the capability outcome byte-for-byte. |
| AT-18 | Pass | Revise reveals and validates replacement input; only successful save changes the next attempt. |
| AT-19 | Pass | Hoje opens and focuses the first unresolved Weekly capability decision. |
| AT-20 | Pass | Native Weekly disclosures expose labels/counts, keyboard toggling, and the existing underlying content. |
| AT-21 | Pass | Browser coverage verifies 360/390 px, 200% zoom, coarse-pointer targets, long text, and no global overflow. |
| AT-22 | Pass | Global Execute exposes `Executar`; native Enter activation passes after cold-start shell coherence, and deterministic focus survives rerender in desktop and mobile Chromium. |
| AT-23 | Pass | State v3, merge behavior, legacy unlinked data, backup, Notes/vault/Relations/Context data, and no-inference constraints remain intact. |
| AT-24 | Pass | Manifest generation is v74; controlled lifecycle tests verify update, offline reopen, persistence, and the existing Service Worker architecture. |
| AT-25 | Pass | Global Execute focuses but does not auto-start an executable non-capability Today action. |

**Totals: 25 Pass, 0 Partial, 0 Fail, 0 Not run.**

## Compatibility verification

- `compasso.state.v3` remains authoritative; there is no schema, migration, storage-key, object-store, route, or new persistence concept.
- Session and Evidence ownership remains unchanged. Evidence derives context only through canonical `sessionId`; legacy unlinked records remain valid and receive no inferred association.
- `learningSignals` retains the shipped explicit-consent, merge, conflict, and tombstone behavior. Completion handoff state is ephemeral and no signal exists before explicit save.
- Today owns only its planning reference and completion state; completing or navigating from Today does not modify the capability or current next attempt.
- JSON backup/restore, IndexedDB/localStorage behavior, refresh persistence, offline operation, and installed-PWA update composition remain covered.
- Studies, Readings, Notes, Markdown/vault metadata, wikilinks, Relations, graph derivation, Contextual AI data/assets/routes, and every existing route remain present.
- No framework, backend, external AI dependency, telemetry, permission, or Service Worker architecture change was introduced.

## Accessibility and responsive verification

- Stable accessible naming and deterministic focus were verified for global Execute, cold-start fallback, post-render restoration, completion, signal save/cancel, optional Session configuration, and Weekly Review navigation/disclosures.
- Native disclosure and control semantics retain keyboard operation and focus return.
- Automated viewport checks cover 360 px and 390 px widths, 200% zoom, long next-attempt content, coarse-pointer minimum targets, and horizontal-overflow prevention.
- Reduced-motion rules retain deterministic state and focus changes without depending on animation.

## PWA verification

`app-manifest.js` identifies `compasso-pages-v74` while the current Service Worker file and manifest-owned architecture remain unchanged. The focused PWA lifecycle suite passed controlled install/update, controller transition, reload, offline reopen, shell completeness, and local-state persistence scenarios. No cache reset, remote publication, or installed application mutation was performed during Ship.

## Residual-risk disposition

### Physical installed-PWA human smoke — Non-blocking for SDD Ship

No person has yet recorded a physical installed-PWA close/reopen observation for this uncommitted delivery. This does not block SDD documentary closure because the automated lifecycle suite passed and the Service Worker architecture is unchanged. It remains a required human release-confidence gate before publication or rollout; Ship does not represent that observation as complete.

### Corrected-tree remote Linux CI validation — Non-blocking for SDD Ship; blocking integration gate

Remote Linux CI ran against the previous checkpoint and exposed the AT-05/AT-22 defect; it has not yet run against this corrected working tree because Ship is not authorized to commit or push it. This does not block documentary SDD closure because the same cold-start composed fixture now passes 20/20 repeated desktop/mobile focus runs, the focused accessibility/PWA suites pass, and canonical validation is green. It remains mandatory before merge or release, and Ship does not claim the corrected tree has remote validation.

## Deviations and blockers

- No product, persistence, ownership, acceptance, route, accessibility, responsive, or PWA architecture deviation from Design revision 1.2 was found. The focus correction implements the Design's existing render/focus risk mitigation inside an already authorized path.
- The approved Iterate changed only the test manifest and stale interactions in two existing browser suites; it did not change the 25 acceptance scenarios or product behavior.
- No blocker remains for SDD closure.

## Lessons retained

1. A continuity improvement can remain additive and ephemeral at transition points: awaited canonical Evidence provides the handoff boundary, while durable `learningSignals` still require explicit learner consent.
2. When a primary projection removes deliberate duplication or introduces progressive disclosure, regression suites must update their interaction path without losing the state, persistence, and ownership assertions they were designed to protect.
3. Native disclosure controls reduce custom accessibility risk, but test flows must explicitly expand them before manipulating secondary configuration or supporting detail.
4. PWA change risk stays bounded when the generation advances through the existing manifest and the Service Worker architecture remains untouched.
5. Runtime installation is not the same as PWA-shell interactivity: keyboard acceptance flows must wait for the existing coherent-shell boundary rather than attempt focus inside an inert application.
6. A focused DOM node is not durable when a projection is recreated; restoration should retain semantic intent and resolve the current target at the established render-completion boundary.

## Archived artifacts

- `BRAINSTORM.md` — approved continuity-first direction and later-IA boundary.
- `DEFINE.md` — behavioral requirements and 25 acceptance scenarios.
- `DESIGN.md` — revision 1.2 implementation, accessibility, PWA, and 22-path manifest contract.
- `BUILD_REPORT.md` — revision 0.4 Build-correction PASS evidence with the PR #74 defect, root cause, correction, and validation.
- `SHIPPED.md` — revision 1.1 independent correction reconciliation, compatibility evidence, risk disposition, and closure decision.

Working copies remain in their feature/report directories in copy-only archive mode. No existing feature/report artifact was deleted.

## Release and operational state

- Git staging, commit, push, merge, rebase, and force-push: not performed.
- Remote CI: not triggered.
- Deployment, GitHub Pages publication, PWA publication, and staging changes: not performed.
- Product code and tests during Ship: unchanged.
- Production/user data and caches: untouched.

**Final lifecycle state:** UX Simplification — Continuity-first learning journey is **Shipped through SDD** and ready for a separately authorized scoped Git checkpoint.

**Recommended next action:** create one scoped correction checkpoint containing only the two authorized product/test changes and updated Build/Ship evidence, push the existing branch to update PR #74 for remote Linux CI, and obtain a human installed-PWA smoke before any merge or publication decision.
