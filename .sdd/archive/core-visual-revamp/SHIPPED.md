# SHIPPED: Compasso — Core Visual Revamp

## Metadata

| Field | Value |
|---|---|
| Feature slug | `core-visual-revamp` |
| Closure date | 2026-09-07 |
| Status | **Shipped — PASS (SDD closure)** |
| Archive mode | Copy-only; working artifacts retained |
| Branch | `codex/core-visual-revamp` |
| HEAD / baseline | `5c7fb210ac5c240f46f0987913fb488bbd3108db` |
| Design | Revision 1.2 |
| PWA / state | `compasso-pages-v79` / unchanged `compasso.state.v3` |

Worktree: `C:\Users\Giuse\OneDrive\Documentos\Every Second Counts\every-second-counts-app-core-visual-revamp`.

## Outcome

Direction A, Caderno de trabalho, completes the Today → start/resume → active → finish/Evidence visual pilot. Static local tokens, larger typography and controls, primary reading space, plan-before-context order and native dialog reflow improve readability while retaining existing session and persistence behavior.

## Acceptance verification

All AT-001–AT-016 are accepted within the documented evidence scope. Requirements R-001–R-016 map through the unchanged DEFINE Covers column to the acceptance evidence below. ER-001–ER-012 retain their documented boundary coverage. No unresolved Build blocker was found.

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

## Validation summary

| Check | Command or procedure | Result | Evidence location |
|---|---|---|---|
| Fresh storage/manifest | `node --test tests/app-manifest.test.js tests/storage-quota.test.js` | 26 passed, zero failures | `%TEMP%/compasso-visual-ship-node.log` |
| Fresh composition and pilot | `npm run test:browser -- tests/browser/core-visual-revamp-flows.spec.js` | Exit 0; 5 passed, 1 expected conditional skip; 27.3s | `%TEMP%/compasso-visual-ship.log` |
| Still-valid full Build suite | `npm run test:all` clean-server retry | 213 Node + 204 browser passed, 20 expected skips, zero failures | BUILD_REPORT.md; `%TEMP%/compasso-visual-all-retry.log` |
| Real browser zoom | User confirmed on 2026-09-07: “dê os 200% como já validado por mim” | AT-011 Pass (human) | BUILD_REPORT.md human validation update |
| Diff and scope | `git diff --check`; exact path-set/protected-file comparisons | PASS; index empty; protected files unchanged | Ship inspection |

The full suite preceded final test-only additions. Fresh focused tests cover those additions; overlapping runs are not summed. The focused conditional skip is the desktop-only compatibility canary excluded from the mobile project. Windows results do not claim remote Ubuntu CI. The prior Computer Use stop remains historical evidence; Codex did not independently observe the final dialog zoom check.

## Design comparison

- Manifest matched: yes. Eight tracked paths, the new browser test and the working SDD documents match the approved Build scope. BRAINSTORM predates Build. Ship adds only five archive documents.
- Approved revision 1.1 corrected the reused Today/Journal hero and full-PWA fixture baseline; revision 1.2 recorded human zoom evidence. No new architecture or scope change.
- Session/Evidence diffs equal removal of style installers/calls and adjacent blank lines. Remaining nonblank source lines compare exactly to the baseline. Journal changes only Today placement. Static CSS migration preserves non-pilot field precedence, checked by fresh computed-style canaries.
- `storage.js`, `service-worker.js` and `index.html` have no diff. State, schema, collections, backup/Markdown and Service Worker architecture remain unchanged. Cache generation advances v78 to v79.
- Rollback: review and reverse only this delivery's diff before publication. Installed clients require a forward cache generation and lifecycle validation; never clear user data as rollback.

## Residual risks and follow-ups

| Item | Severity | Owner or trigger |
|---|---|---|
| Remote Linux CI not run for this visual branch | Release gate | Separately authorized push/Draft PR; inspect exact remote head |
| Physical installed-PWA update/reopen/offline smoke | Release gate | Human review before release; v77→v78 is not closed by zoom approval; exercise v79 from its intended installed baseline |
| Zoom confirmation has no extra device/screenshot details | Evidence limitation | Retain explicit human attribution |
| Short-height tests do not prove physical software-keyboard behavior | Evidence limitation | Human device review when applicable |
| Existing two high-severity npm dependency findings | Existing maintenance risk | Separate assessment; no dependency update in this delivery |
| Native control/font metrics vary by platform | Low | Remote CI and installed-client review; no blind snapshot replacement |

## Lessons learned

1. Moving identical CSS from runtime injection to a static file changes cascade precedence. Capture non-pilot computed styles first and preserve field precedence with narrow selectors.
2. Today reused its apparent hero as the Journal panel. Trace runtime ownership before rearranging markup and reconcile discoveries through Design before implementation.
3. Real browser zoom and viewport emulation are different evidence. Attribute human confirmation explicitly; a tool policy stop is not a pass.

## Archived artifacts

| Artifact | Path |
|---|---|
| BRAINSTORM | `./BRAINSTORM.md` |
| DEFINE | `./DEFINE.md` |
| DESIGN | `./DESIGN.md` |
| BUILD_REPORT | `./BUILD_REPORT.md` |
| SHIPPED | `./SHIPPED.md` |

Copied artifacts carry a Shipped archive header and preserve the complete original phase record below it. Content was verified after writing. Working artifacts remain intact as historical phase records.

## Checkpoint content fingerprints

SHA-256 identifies reviewed product/test/documentation content for a later exact Git checkpoint. Generated fixtures, screenshots, test output and dependencies are excluded.

| Path | SHA-256 |
|---|---|
| `app-manifest.js` | `1802c0924b7bdba6d9e6d4fc1fbfb1c323db40a6d4295f3950dd20e6082d0c14` |
| `design-system.css` | `3f67025bbe7286690c444f43a52b8d1cf63565ca09b5d59ba1480cdf5a5c7347` |
| `docs/design-system.md` | `42abc758a41633eaa9331f5967704a979473988542e743b063626e4f5df4ebfd` |
| `evidence-feature.js` | `1f505c65a05dd50dd82e8e192bc35bd23455d6e22fbb435af338d7685831befc` |
| `journal-feature.js` | `0f8f334f234f8b0dedba18045dc4c573ec2cf2350fedfa588d32210a6e0f1818` |
| `sessions-feature.js` | `51ff853fb11a943cce88fae67bfc4ee5749d10f7c6c56fd3deefa8041ff782f2` |
| `tests/app-manifest.test.js` | `e6ff3827cb798dbcecef0b4ee6a770d8cd0eebd3df6180b20f19d04245e2d496` |
| `tests/browser/core-visual-revamp-flows.spec.js` | `2a9d2b213658e33163c616309929f2be10ec30a37d8cda6d034ed617337b1bd3` |
| `today-feature.js` | `0cb9de88488df1095d4f99d620448134989f2cb3c21bc89113f082b8696c7238` |

## Release boundary

No product or test changes during Ship. No staging, commit, push, new PR, merge, deployment or publication performed. SDD closure is complete. The next operational step is a separately authorized exact Git checkpoint and Draft PR for remote CI.
