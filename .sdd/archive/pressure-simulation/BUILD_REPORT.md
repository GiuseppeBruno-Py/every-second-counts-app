# Pressure Simulation — Build Report

**Delivery:** 7 — Difficulty / Pressure Simulation
**Status:** Shipped locally; Draft PR pending
**Date:** 2026-09-24
**Base:** `origin/main` `982fc8477f880bf619b737b09d889a64ca767bbf`
**Branch:** `codex/pressure-simulation`

## Outcome and Design comparison

The existing active Capability card now offers **Preparar simulação**. It opens the existing edit dialog at an optional disclosure. A learner-authored condition is applied to the visible `nextAttempt` draft and becomes durable only through the existing Save action. Repeated Apply replaces the generated suffix when intact. `futureUse: simulate` remains optional context. There is no automatic level, Ritual selection, score, route, domain collection, schema migration, backend, dependency, or Service Worker source change. Implementation matches the closed Design manifest; the Apply label was aligned in Design with the final UI text.

The changed production paths are `learning-outcome-feature.js`, `design-system.css`, and `app-manifest.js` (cache generation v86→v87). `tests/app-manifest.test.js`, `tests/browser/pressure-simulation-flows.spec.js`, and `docs/pressure-simulation.md` complete the functional slice. No unrelated checkout or data was changed.

## Acceptance evidence

| Criterion | Evidence | Result |
| --- | --- | --- |
| AC-01 | New browser spec opens the active card's existing dialog, expands guidance, focuses the condition, and checks unchanged storage. | PASS |
| AC-02 | Browser spec checks the visible composed draft and `simulate` draft context before explicit Save. | PASS |
| AC-03 | Browser spec checks empty/unapplied/overlength cases, alert/focus, and no durable write. | PASS |
| AC-04 | Browser spec applies the same and a changed condition, confirms one suffix, and checks later manual editing. | PASS |
| AC-05 | Browser spec checks Cancel, Escape, refresh, and original durable attempt/context. | PASS |
| AC-06 | Browser spec checks explicit Save, refresh, stable attempt ID, and isolation from other domains. | PASS |
| AC-07 | Browser spec injects a durable storage failure, checks rollback and retained draft, then retries successfully. | PASS |
| AC-08 | Browser spec checks Today/Session/Evidence snapshot, JSON export/reset/restore and legacy backup; existing regressions cover IndexedDB and Markdown. | PASS |
| AC-09 | Browser spec checks archived card and stale synthetic action; no simulation opens. | PASS |
| AC-10 | New browser spec checks 360px, 200% zoom, labels, focus, 44px touch targets and scrolling; existing layout and dialog tests also pass. | PASS |

## Validation

- Before changes: `npm test` — **232 pass, 0 fail, 0 skip**.
- Focused: `npx playwright test tests/browser/pressure-simulation-flows.spec.js --retries=0` — **14 pass, 0 fail** across Chromium and mobile. First run had two test-fixture click timeouts for an offscreen synthetic stale-action button; fixture was corrected and the full focused spec reran green, without a production-code fix.
- Final: `npm test` — **232 pass, 0 fail, 0 skip**.
- Final: `npm run test:browser` — **326 pass, 24 pre-existing/configured skip, 0 fail** out of 350 across Chromium and mobile; includes PWA lifecycle, offline, fallback, backup, Session, Evidence, Weekly Review and visual regressions.
- `npm run build:test` and `node --check learning-outcome-feature.js` — exit 0.
- `npm audit --omit=dev --audit-level=high` — **0 production vulnerabilities**. `npm ci` reported two existing high-severity development-tree advisories; no dependency changed.
- `git diff --check` — no whitespace errors. Git emits only local LF→CRLF checkout warnings.

## Compatibility, rollback, and limitations

No IndexedDB schema or `compasso.state.v3` change was required. The text and context use existing normalization, JSON backup/restore, and localStorage fallback. Existing Markdown export remains unchanged. The cache generation advances to v87 so an offline client receives the new assets; rollback after an installed PWA sees v87 should use a later forward generation without clearing learner storage.

Automated browser coverage is not a physical-device or installed-PWA usability study. The simulation condition is deliberately free text and does not enforce a fixed difficulty ladder or decide whether the learner succeeded; that judgment belongs to later Evidence and reflection. The 24 browser skips are existing project configuration, not new failures. No remote CI or deployment result is claimed in this local report.

**Delivery verdict:** PASS for the defined functional slice and local checks. Publication remains a separate Draft PR step; no merge or deployment is part of this report.
