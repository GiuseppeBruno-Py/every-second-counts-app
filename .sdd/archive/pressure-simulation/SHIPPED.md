# Pressure Simulation — Shipped record

**Delivery:** 7 — Difficulty / Pressure Simulation
**Date:** 2026-09-24
**Status:** PASS, archived copy-only; Draft PR pending
**Base:** `982fc8477f880bf619b737b09d889a64ca767bbf`

## Accepted scope

All ten DEFINE acceptance criteria passed locally. An active Capability can prepare a more realistic next attempt in its existing editor, apply a learner-authored condition to the visible draft, and explicitly save through the current durable path. Archived/missing capabilities cannot start it. No new schema, route, collection, Ritual link, scoring, AI, backend, or automatic difficulty progression was added. The actual changed-file set matches the DESIGN manifest.

## Evidence

`npm test`: 232 passed, 0 failed. `npm run test:browser`: 326 passed, 24 project-configured skips, 0 failed across Chromium and mobile. The new focused browser spec: 14 passed, 0 failed. Build composition and syntax passed. Production dependency audit found zero vulnerabilities. See `BUILD_REPORT.md` for the criterion-by-criterion map and test caveats.

## Residual risks and follow-up

- The feature has automated mobile/offline checks but has not been exercised on a physical phone or a separately installed PWA. Review the Draft PR and, if desired, verify the installed update before merging.
- User-authored conditions are ordinary attempt text. There is intentionally no parser, pressure scale, or automatic success inference; subsequent Evidence must be interpreted by the learner.
- An installed cache already advanced to v87 should be rolled back through a later forward cache generation, never by clearing learner storage.
- The two existing high-severity dev-dependency audit notices were not changed in this feature; production-only audit reports zero.

## Lessons

1. Keeping the pressure condition inside the existing attempt draft preserved Session provenance and JSON compatibility without adding a second persistence owner.
2. A transient Apply step plus explicit Save made draft versus durable state visible and testable, including cancellation, stale action, and write-failure retry.
3. Synthetic browser controls used to exercise stale actions should be invoked programmatically when they are intentionally not part of the visible layout; otherwise clickability timeouts test fixture geometry rather than product behavior.

Working DEFINE, DESIGN, and BUILD_REPORT copies are retained. The archive is copy-only; no feature files or unrelated work were deleted. This Ship record is documentation closure, not authorization to merge or deploy.
