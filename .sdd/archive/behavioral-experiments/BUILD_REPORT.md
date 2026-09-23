# Behavioral Experiments — Build Report

**Delivery:** 6
**Status:** Shipped — Build PASS
**Branch:** `codex/behavioral-experiments`
**Base:** `origin/main` `4f8c1b2938987fa50696a25ae2396d8e365e4f6f`
**Date:** 2026-09-23

## Outcome

One functional slice in the existing Capacidades view: the learner creates a dated experiment with hypothesis, repeated practice, expected outcome, and evidence plan; edits an open plan; records an observed result and explicit Keep/Adjust/Abandon decision; or deletes with confirmation. No automatic Capability, nextAttempt, Session, Evidence, or Weekly Review mutation. No score, AI, backend, route, framework, or new dependency.

## Manifest completion

All Design paths were created or modified as specified: pure model; Capability-view feature; manifest/catalog/cache; state and restore normalization; static responsive CSS; Node and browser tests; user docs; SDD artifacts. No paths were moved or deleted. The main checkout and its untracked `.codegraph/`/report files were not touched; all work occurred in the isolated managed worktree.

Autonomous details within Design: use a separate small section beneath Capability cards to preserve primary actions; native dialog and existing `saveData`/rollback contract; snapshot `capabilityRef` so historical plans remain reviewable after source deletion; custom date selection after editing a review date. A minor typography refinement followed the first full browser run and was rechecked by the final focused suite.

## Acceptance evidence

| Criterion | Evidence | Result |
| --- | --- | --- |
| AC-01 | Node create invariant; browser create and unchanged Capability in both projects | PASS |
| AC-02 | Node required/date boundary tests; browser validation with no record | PASS |
| AC-03 | Node preset/year rollover; browser 21-day date and custom control; no scientific claim in UI/docs | PASS |
| AC-04 | Node identity-preserving edit; browser edit/refresh | PASS |
| AC-05 | Node review invariants; browser explicit Adjust/Keep and unchanged Capability | PASS |
| AC-06 | Browser Cancel/Escape, failed save, retained draft and retry; storage regression | PASS |
| AC-07 | Node tombstone; browser confirmed delete and refresh; state merge tombstone | PASS |
| AC-08 | State migration/round-trip Node; browser actual JSON download/reset/restore and legacy restore | PASS |
| AC-09 | Browser offline save with localStorage fallback, reload; full PWA controlled-cache offline regression; manifest assets | PASS |
| AC-10 | Browser desktop/mobile 360px scroll/labels/focus/Escape; full design-system regressions | PASS |

## Validation commands and results

Commands came from `package.json` and repository test setup.

- Before changes: `npm test` — **223 passed, 0 failed, 0 skipped**.
- After implementation: `npm test` — **232 passed, 0 failed, 0 skipped**.
- `npm run build:test` — exit 0; composition includes both new modules.
- `npm run test:browser` — **310 passed, 24 project-conditional skips, 0 failed** (334 total). Includes Session, Evidence, Weekly Review, backup/restore, storage failure, localStorage, Service Worker update, and controlled complete-cache offline regressions.
- Final focused after typography and source-deletion test: `npm run build:test; npx playwright test tests/browser/behavioral-experiment-flows.spec.js --retries=0` — **12 passed, 0 failed**, Chromium and mobile.
- `node --check` for both new JS modules — exit 0; `git diff --check` — exit 0 (Windows LF/CRLF notices only).
- `npm audit --omit=dev --audit-level=high` — 0 production dependency vulnerabilities. `npm ci` reported two high advisories in the existing development dependency tree; no dependency or lockfile was changed.
- Lint/typecheck: not configured in `package.json`.

## Compatibility and rollback

`behavioralExperiments` is an additive v1 record collection in top-level `compasso.state.v3`. Existing IndexedDB database version remains 1; fallback and backup paths are unchanged. Migration is idempotent, missing legacy collection becomes `[]`, invalid records are isolated, merge uses timestamp and tombstones, and JSON backup round-trip is tested. Cache generation moved v85→v86 so the Service Worker gets the new modules. After release exposure, rollback must be forward-only and retain the collection in storage/backups; never clear learner data.

## Limits and risks

- An experiment's evidence plan and observed result are learner-authored text; this MVP does not automatically link Evidence records or count outcomes. This is intentional and avoids inference.
- A reviewed experiment is immutable; a changed hypothesis/practice is a new experiment.
- Controlled browser PWA tests passed locally; an installed physical-device PWA, production Pages deployment, remote CI, and actual learner usefulness remain separate gates. None is claimed here.
- The two existing dev dependency audit advisories were not remediated in this scoped delivery.

**Build verdict: PASS.**
