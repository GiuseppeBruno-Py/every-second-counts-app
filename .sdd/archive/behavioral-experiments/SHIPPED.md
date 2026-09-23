# Behavioral Experiments — Shipped SDD record

**Delivery:** 6
**Status:** Shipped (documentation/verification closure, not deployed)
**Date:** 2026-09-23
**Branch:** `codex/behavioral-experiments`

## Acceptance and design comparison

AC-01 through AC-10: **PASS** by the exact Node/browser evidence in `BUILD_REPORT.md`. The implementation matches the closed Design file manifest: one additive v1 collection and two small modules integrated into the existing state, manifest, Capability view, backup/restore, and offline composition. There is no new route, backend, dependency, AI, score, or automatic source mutation. No deviation required an SDD redesign.

Baseline: 223 Node passed. Final: 232 Node passed. Full browser suite: 310 passed, 24 conditional skips, 0 failed. After a typography refinement and an additional historical-record test, focused browser suite: 12 passed on Chromium/mobile. Build and syntax checks passed. Production-dependency audit: 0 high vulnerabilities. Existing dev-only audit advisories remain outside scope.

## Residual risks and operational follow-up

- Controlled offline/PWA tests passed; installed-device and production deployment were not performed.
- Experiments use learner-authored evidence plans and observations, not automatic linkage to Evidence records or inferred progress.
- Keep `behavioralExperiments` in later-generation state/backup paths even if rolling back the UI. Never clear learner storage.
- Remote PR checks and review are separate from this local Ship status. No merge or deployment is authorized by this artifact.

## Lessons

1. A standalone collection is justified when a record has its own lifecycle and tombstone; embedding it in Capability would couple independent review history to Capability edits and sync conflicts.
2. Test failure injection must replace the frozen `CompassoStorage` facade, not assign to its frozen `save` property; otherwise the browser test falsely exercises a successful write.
3. The existing manifest simultaneously controls module order, offline asset inventory, sync catalog, and cache generation; changing only a script tag would leave the PWA contract incomplete.

Archive is copy-only. Working DEFINE, DESIGN, and BUILD_REPORT copies remain for review; no source or data was deleted.
