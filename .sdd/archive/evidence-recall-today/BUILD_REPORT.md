# Evidence Recall em Hoje — Build Report

**Delivery:** 2 — Recall contextual de evidências
**Status:** Shipped
**Date:** 2026-09-14
**Branch:** `codex/evidence-recall-today`
**Baseline:** `33891da518b78fa28dc6881267c35bbadad6066e`
**DEFINE:** `.sdd/features/evidence-recall-today/DEFINE.md`
**DESIGN:** `.sdd/features/evidence-recall-today/DESIGN.md`

## Outcome

Hoje now derives at most one historical Evidence for the Capability behind the current primary next attempt. The recall is factual and read-only: it uses exact canonical Session provenance, displays the latest eligible occurrence, and opens and focuses that exact Evidence inside the existing Capability context.

No schema, collection, migration, backend, dependency, route, modal, Service Worker behavior, score, AI, text similarity, or durable read state was added.

## Preflight and scope control

- Worktree: `C:\Users\Giuse\OneDrive\Documentos\Every Second Counts\every-second-counts-app-evidence-recall-today`.
- Branch/HEAD matched the approved Design baseline.
- Initial worktree changes were limited to the untracked DEFINE and DESIGN artifacts.
- `.codegraph/` was absent; direct source/tests/docs inspection was used as required.
- The optional Build report template referenced by the skill was absent; this report follows the complete skill contract and repository convention.
- Product/test/documentation diff is exactly the twelve paths approved by the closed Design manifest.
- No unrelated work was overwritten.

## Implemented manifest

| Path | Implemented behavior |
| --- | --- |
| `capability-context-model.js` | Added pure `selectRecentEvidence()` eligibility, exact-provenance, recency, tie-break, detached DTO, and no-mutation contract. |
| `today-feature.js` | Added age/date presentation, optional recall projection only for the primary current Capability attempt, click-time revalidation, and exact-source command invocation. |
| `learning-outcome-feature.js` | Added ephemeral exact-Evidence promotion into the four-item context window, stable Evidence targets, context expansion, scroll/focus, and `capability.openEvidence`. |
| `design-system.css` | Added scoped subordinate hierarchy, wrapping, 620/390 px behavior, and existing coarse-pointer compatibility. |
| `app-manifest.js` | Advanced the owned candidate cache generation once from `compasso-pages-v81` to `compasso-pages-v82`. |
| `docs/today-feature.md` | Documented eligibility, ranking, hierarchy, stale handling, navigation, offline use, and absence behavior. |
| `docs/evidence-feature.md` | Documented read-only recall and retained Evidence ownership. |
| `docs/capability-first-compasso.md` | Extended the continuity cycle and PWA generation contract without new ownership. |
| `tests/capability-context-model.test.js` | Added three tests for provenance, terminal eligibility, invalid/future/orphan exclusion, tie-break, prebuilt indexes, DTO detachment, and state immutability. |
| `tests/app-manifest.test.js` | Asserted exact v82 ownership. |
| `tests/browser/capability-context-flows.spec.js` | Added desktop/mobile journey for absence, non-inference, recency, exact focus, promotion outside the default window, hierarchy, stale deletion, touch size, overflow, and no state writes. |
| `tests/browser/pwa-lifecycle-flows.spec.js` | Extended the controlled cached-offline journey through recall render, exact open/focus, and refresh. |

## Data and compatibility

- `compasso.state.v3` remains unchanged.
- IndexedDB and exact localStorage fallback owners remain unchanged.
- JSON backup/restore and Markdown export formats remain unchanged.
- Evidence remains unchanged and carries no Capability field or recall metadata.
- Legacy/malformed/unlinked Evidence remains valid but ineligible for recall.
- Selection path is exclusively `Evidence.sessionId → executionSessions.id → learningContext.outcomeId`.
- Eligible executions are terminal (`completed` or `interrupted`); eligible Evidence has a non-empty ID/session ID, a trimmed summary of at least three characters, and a valid non-future `createdAt`.
- Ranking is Evidence `createdAt` descending, then Evidence ID ascending. Edit timestamps do not promote an older occurrence.

## Acceptance evidence

| Acceptance group | Result | Evidence |
| --- | --- | --- |
| AC-01–AC-05 selection/absence/isolation/ranking | PASS | Pure model matrix plus desktop/mobile browser journey. |
| AC-06 exact original Evidence | PASS | Exact `data-capability-evidence` target is promoted, expanded, visible, and focused. |
| AC-07 hierarchy | PASS | `Iniciar agora` and primary action DOM order remain ahead of the subordinate recall aside. |
| AC-08 read-only | PASS | Browser deep equality of `state.data` before/after open; model input immutability. |
| AC-09 deletion/stale click | PASS | Click-time revalidation rejects removed source, re-renders the next eligible source, then omits the block when none remains. |
| AC-10 broken/legacy provenance | PASS | Orphan and resemblance-only records are excluded; invalid/future/broken fixtures return `null`. |
| AC-11–AC-12 precedence/unavailable states | PASS | Existing Today unavailable/reference and active-execution suites remain green. |
| AC-13 backup/restore | PASS | Existing current/legacy JSON round-trip and protected-data browser suites remain green; no format changed. |
| AC-14 offline/refresh | PASS | Controlled complete-cache PWA journey renders and opens exact recall while offline after reload. |
| AC-15 mobile/accessibility | PASS | Mobile journey verifies 44 px action, no horizontal overflow, accessible aside/button text, expanded context, and deterministic focus. Existing keyboard/zoom/coarse-pointer suites remain green. |
| AC-16 regressions | PASS | Full Node and Playwright matrices passed. |

## Verification

| Command | Result |
| --- | --- |
| `node --test tests/capability-context-model.test.js tests/app-manifest.test.js` before implementation | Expected RED: 4 failures (missing selector and v82), 20 passes. |
| Same focused Node command after implementation | PASS: 24/24. |
| Targeted model/manifest/composition/bootstrap suite | PASS: 41/41. |
| Targeted recall + controlled offline Playwright | PASS: 3 applicable, 1 conditional mobile lifecycle skip. |
| `npm test` | PASS: 216 passed, 0 failed, 0 skipped. Baseline was 213 passed. |
| `npm run test:browser` | PASS: 239 passed, 0 failed, 23 existing conditional skips. Baseline was 237 passed with the same 23 skips. |
| Combined current total | PASS: 455 passed, 0 failed; five net-new passing tests over baseline. |
| `git diff --check` | PASS; only Git line-ending advisories, no whitespace error. |

The first isolated Playwright attempt returned 404 because `.test-dist` had not yet been composed. Running the repository's required `npm run build:test` resolved the harness condition. A first synthetic execution fixture was also intentionally corrected to the real canonical execution shape after the existing migration hook rejected its incomplete source metadata; no production relaxation was introduced.

## Known limitations and residual risks

- Recall is deliberately limited to the primary current Capability attempt in Hoje and one exact same-Capability Evidence.
- Historical records without canonical execution provenance are not inferred or repaired.
- There is no cross-Capability semantic matching, importance score, confidence score, analytics, or durable read state.
- Browser automation verifies Chromium desktop/mobile emulation and the controlled PWA origin; no claim is made about a separately installed physical-device PWA.
- `npm ci` reported two pre-existing high-severity audit findings during Design; dependencies were frozen and no automatic fix was run.

## Rollback

Before publication, revert the twelve manifest paths as one release unit. After v82 has been exposed, publish a later forward generation containing the reverted projection; do not reuse v81/v82 and do not clear IndexedDB, localStorage, backups, vault data, or unrelated caches. No data rollback is required because recall writes no state.

## Final gate

- Expected behavior implemented: PASS.
- Acceptance criteria: PASS, 16/16.
- New tests proportional to risk: PASS.
- Previous tests: PASS.
- IndexedDB/localStorage/backup/offline compatibility: PASS through unchanged owners and full regression.
- Mobile and critical accessibility: PASS through desktop/mobile automation.
- Schema migration/rollback: no migration; forward cache rollback documented.
- Unrelated work preserved: PASS.

**Delivery 2 Build: PASS.**
