# Archive status: Shipped

Closed 2026-09-07. Copy-only archive; original phase record follows unchanged. See SHIPPED.md for final verification and release boundaries.

---

# BUILD REPORT: Compasso — Core Visual Revamp

## Metadata

| Field | Value |
|---|---|
| Feature | `core-visual-revamp` |
| Date | 2026-09-07 |
| Status | **Complete (Built) — AT-011 validated by the user** |
| Define | `.sdd/features/core-visual-revamp/DEFINE.md` |
| Design | `.sdd/features/core-visual-revamp/DESIGN.md`, revision 1.2 |
| Worktree | `C:\Users\Giuse\OneDrive\Documentos\Every Second Counts\every-second-counts-app-core-visual-revamp` |
| Branch / baseline | `codex/core-visual-revamp` / `5c7fb210ac5c240f46f0987913fb488bbd3108db` |
| PWA / state | `compasso-pages-v79` / unchanged `compasso.state.v3` |

## Summary and manifest execution

Direction A is implemented with local static CSS tokens, readable type and controls,
full-width primary content, plan-before-context reading order, native dialog reflow
and a larger wrapping Companion. Existing session, Evidence and storage behavior
is unchanged. This is not Ship, merge or deployment.

| # | Manifest path | Result / purpose |
|---:|---|---|
| 1 | `design-system.css` | Implemented: legacy compatibility migration, local pilot tokens and responsive presentation |
| 2 | `today-feature.js` | Implemented: remove style injector; separate compact heading and Journal context; add plan/context anchors |
| 3 | `sessions-feature.js` | Implemented: remove style injector/call only; lifecycle/forms unchanged |
| 4 | `evidence-feature.js` | Implemented: remove style append/call only; fields/save behavior unchanged |
| 5 | `journal-feature.js` | Implemented: guarded placement after remaining plan |
| 6 | `tests/browser/core-visual-revamp-flows.spec.js` | Implemented: compatibility, six states, keyboard/contrast/persistence checks |
| 7 | `app-manifest.js` | Implemented: forward v78 to v79, no asset-list/order/schema change |
| 8 | `tests/app-manifest.test.js` | Implemented: exact v78 assumptions replaced with owned manifest-generation checks |
| 9 | `docs/design-system.md` | Documented pilot ownership and test procedures |
| 10 | Feature `DEFINE.md` | Requirements unchanged; marked Complete (Built) with human AT-011 evidence |
| 11 | Feature `DESIGN.md` | Revision 1.2 records Complete (Built); architecture unchanged |
| 12 | This report | Automated and human evidence recorded; Build complete |

## Validation evidence

| Command/procedure | Result |
|---|---|
| `npm ci` | Exit 0; existing locked test dependencies installed; lockfile unchanged. npm reported two existing high-severity dependency findings; no upgrade attempted in visual scope |
| Unchanged baseline capture on full PWA fixture | 1 Chromium test passed before CSS migration; computed-style reference stored outside repo |
| Compatibility check after CSS migration | Initially detected field padding/background drift; scoped original values restored; then passed |
| `npm run test:all` first attempt | Node 213 passed; browser attempt interrupted after stale 4173 server returned empty responses. Not counted as a passing run |
| `npm run test:all` clean server retry | **213 Node + 204 browser passed; 20 conditional browser skips; zero failures**. Browser duration 6.4m |
| `npm run test:browser -- tests/browser/core-visual-revamp-flows.spec.js` after keyboard/contrast additions | **5 passed, 1 conditional skip**, exit 0, 34.6s |
| Final extension: planned and saved states at all four widths | 5 passed, 1 expected conditional skip; exit 0 (final focused matrix) |
| `git diff --check` | Passed for tracked diff; new source/docs separately inspected |
| Lint / type checker | Not configured in package.json |
| Remote Linux CI | Not triggered for this branch; no new push/PR |
| Real browser zoom | Pass (human): user confirmed the 200% check, including the pending start/finish dialogs, on 2026-09-07. Earlier Codex observation covered Today only |

The full suite preceded the final test-only additions; production code was unchanged
after that passing suite. Focused reruns validate the additional assertions. Counts
from separate overlapping runs must not be added together. The extra conditional
skip is the desktop-only compatibility capture, in addition to 19 baseline skips.

## Acceptance and boundary evidence

| ID | Result | Evidence |
|---|---|---|
| AT-001–AT-003 | Pass | Existing precedence contracts plus new empty/planned/active visual flow and DOM order |
| AT-004–AT-006 | Pass | Immediate/configured start, optional integrations, pause/resume/reload, Companion; existing critical/E1 suites |
| AT-007–AT-008 | Pass | Durable Evidence round trip and unchanged capability; cancellation and existing transactional regressions |
| AT-009 | Pass | New Tab/Shift+Tab containment, Escape/focus return and required-field focus; existing keyboard suites |
| AT-010 | Pass | Six states at 360/390/768/1280px in both projects; finish additionally at 360x480 |
| AT-011 | Pass (human) | User confirmed 200% validation on 2026-09-07; confirmation recorded below |
| AT-012 | Pass | Existing loading/disabled suite; pilot invalid-field/focus/contrast assertions |
| AT-013 | Pass (automated) | Existing complete-cache offline, composition and PWA lifecycle Chromium tests in full suite |
| AT-014 | Pass | Existing Notes/Journal/capability/review regressions and unchanged study snapshots; new history/energy computed canaries |
| AT-015 | Pass within observed states | Real screenshots inspected: planned, start, mobile finish; readable attempt/control hierarchy and removed nested surfaces |
| AT-016 | Pass | Reduced-motion suite plus new pilot reduced-motion/forced-colors assertions |

ER-001–ER-003 and ER-005–ER-006/ER-009 use existing transactional, duplicate,
legacy and interrupted-session tests; new pilot validation retains errors and focus.
ER-004 includes long URL/details and existing long capability references. ER-007
includes 360x480 short-height layout; no physical software-keyboard claim. ER-008
uses existing drag and E1 tests. ER-010 includes forced colors/system-font use;
real zoom qualification remains under AT-011. ER-011 had no required business-flow
fix. ER-012 requires honest evidence/status attribution and is satisfied by this report.

## Decisions, deviations and evidence provenance

- Iterate 1.1 corrects the Design's original assumption: Today renamed its hero
  to the Journal panel. The compact date/heading/count is now separate while
  intention/edit stays in the same contextual panel. Requirements and manifest
  stayed unchanged; no downstream completed evidence was reused.
- Full PWA fixture is necessary for history/energy canaries; reduced fixture
  omitted them. The initial missing-dialog capture was a test-fixture error.
- CSS relocation exposed original late-injected input padding/background priority.
  ID-scoped compatibility restores original values on non-pilot dialogs.
- Baseline reference captures widths, but permanent equality excludes widths
  because native font metrics differ by OS; other computed properties are compared.
- One server from an interrupted run accepted TCP but returned empty responses.
  Only the identified test-server process was stopped; no user storage was cleared.
- Existing screenshots and native UI observations are Codex-observed; final AT-011 completion is user-attested. Physical installed-PWA
  close/reopen and v77-to-v78 smoke are not claimed. Computer Use was stopped by
  physical Escape on the prior attempt; no UI work continued in that interrupted turn.

## Human validation update — 2026-09-07

The user explicitly confirmed: “dê os 200% como já validado por mim”. This closes the pending real-browser 200% check (AT-011), including start/finish dialogs, as human validation. Codex did not rerun or independently observe those final checks; no additional browser, device or screenshot details were supplied. The earlier Computer Use URL-policy stop remains historical evidence, not an open Build blocker. This confirmation does not attest installed-PWA upgrade smoke or remote CI.

This is an additive evidence update only. Requirements, architecture, product code, tests and BRAINSTORM remain unchanged; DEFINE and DESIGN receive Build status/reference updates.

## Compatibility, risks and rollback

No storage/sync/schema/backup/Markdown changes. Service Worker source and architecture
are unchanged. No new runtime dependencies, theme preference or external font fetch
for the pilot. Existing global font imports remain outside scope. Companion's
separate Picture-in-Picture document is not redesigned.

No commit, push, new PR, merge, deploy or publication performed. The baseline is
the Local Data Safety checkpoint; this report does not infer its remote merge state.
For rollback before publication, review and reverse only this delivery's diff.
After installation, restoring old presentation requires a forward cache generation
and lifecycle validation, never deleting user data or downgrading the state contract.

## Remaining work

Build has no remaining acceptance blocker. Ship verification is the next separate phase, followed by separately authorized Git/release actions.

## Revision history

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-09-07 | Implemented pilot and recorded obtained evidence plus remaining gates |
| 1.1 | 2026-09-07 | User confirmed AT-011 at 200%; recorded human provenance and completed Build; no code/test changes |
