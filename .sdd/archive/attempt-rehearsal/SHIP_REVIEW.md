# Delivery 3 — Ship Review

**Date:** 2026-09-16
**Result:** NEEDS REVISION — closure blocked
**Worktree:** `C:\Users\Giuse\OneDrive\Documentos\Every Second Counts\every-second-counts-app-attempt-rehearsal`
**Branch / HEAD:** `codex/attempt-rehearsal` / `b7246f48ba8177860041892bbdebd97ac15df7c9`

## Findings

### SR-01 — Draft survives navigation — blocking

R-009/R-012 and the approved discard contract require leaving the context to discard the draft. Reproduction in an isolated Chromium context:

1. Create Capability and nextAttempt, add to Today and open rehearsal.
2. Fill the result with a unique marker.
3. Call the existing route owner `CompassoInformationArchitecture.open('study')` (the same open path invoked by history navigation).
4. Read current view, dialog and field after navigation.

Observed:

```json
{"view":"study","open":true,"result":"draft deve ser descartado 9031","sessions":0}
```

The modal and draft remain in a departed context. `todayCurrentRehearsalPayload` checks the route only when starting; no Today listener clears the draft on `view:changed`. The existing reload test navigates only after reload has already discarded the draft, so it does not cover this failure.

### SR-02 — Mobile footer contradicts Design — blocking conformance

DESIGN §4.5 requires one column and available-width buttons at ≤390 px. The early `.attempt-rehearsal-actions { display:grid }` is overridden by the later, more specific pilot footer `display:flex`.

At 360×900, computed output:

```json
{"display":"flex","buttons":[
 {"text":"Cancelar","x":17,"y":853.25,"width":98,"height":81},
 {"text":"Pular ensaio e começar","x":131,"y":853.25,"width":98,"height":81},
 {"text":"Começar sessão","x":245,"y":853.25,"width":98,"height":81}
]}
```

Touch sizes pass, but all buttons share the same row and their labels wrap in narrow columns. The existing geometry test checks overflow/targets, not the approved column layout. This is a Design deviation, not evidence of failed storage.

### SR-03 — Acceptance evidence overstated — corrective tests required

The test named `skip aceita respostas vazias...` fills all fields and clicks `#todayRehearsalSubmit` twice. It verifies retry, not skip or empty submit. The earlier report also grouped Capability unavailability with stale attempt without a dedicated unavailable-Capability test.

Fresh observational probes confirm skip itself currently behaves correctly:

```json
{"probe":"skip failure","open":true,"result":"","sessions":0}
{"probe":"skip success","open":false,"sessions":1,"intent":"Tentativa do Ship"}
{"probe":"archive","open":false,"sessions":0}
{"probe":"delete","open":false,"sessions":0}
```

Promote these observations into maintained tests; explicitly check empty/partial submit, JSON/Markdown marker absence and completed Session/Evidence continuity after rehearsal. Do not infer all acceptance from a green test count.

## Individual acceptance map

Evidence keys: A = fresh dedicated desktop/mobile spec; D = fresh design-system rehearsal test; P = fresh PWA tests; H = still-valid 2026-09-15 full regression; O = fresh isolated observational probe; S = source/manifest comparison.

| AC | Evidence / result |
| --- | --- |
| 01 | A/S — PASS, direct start unchanged. |
| 02 | A/S — PASS, one dialog/four optional fields, state unchanged. |
| 03 | A — PASS, state and storage mirror unchanged while filling. |
| 04 | P/S supports partial submit; empty submit lacks explicit maintained coverage — NEEDS REVISION evidence. |
| 05 | O — skip works, including failed write; maintained skip test absent — NEEDS REVISION evidence. |
| 06 | A/S — no answer in state/Session/canonical projection; direct JSON/Markdown marker checks absent — NEEDS REVISION evidence completeness. |
| 07 | A — PASS for explicit Cancel; navigation part of R-012 fails under SR-01. |
| 08 | A/D — PASS, Escape closes and returns focus. |
| 09 | A/P — PASS, reload removes draft, zero Session. |
| 10 | P — PASS, confirmed Session survives offline reload. |
| 11 | A/O — PASS, rollback/retry and skip abandonment on failure. |
| 12 | A — PASS, changed attempt cannot silently substitute target. |
| 13 | O/S — archive/delete block creation; maintained test needed (SR-03). |
| 14 | A/S — PASS for concurrent Session; existing canonical exclusion protects other modes. |
| 15 | A passes Cancel/reopen; route exit does not discard — NEEDS REVISION (SR-01). |
| 16 | A/H/S — PASS, start primary, rehearsal secondary, Recall preserved. |
| 17 | H/S — schemas/stores/keys/export owners unchanged; normal backup/restore regression remains valid. |
| 18 | P — PASS, cached-shell offline rehearsal/start/reload. |
| 19 | D passes targets/overflow/zoom; approved mobile column layout fails — NEEDS REVISION Design conformance (SR-02). |
| 20 | A/D — PASS for tested focus/labels/Tab/Escape; abandoned-route focus belongs to SR-01 corrective test. |
| 21 | A/H/S — no new rehearsal control in other domain surfaces; modal remains across navigation under SR-01. |

## Verification

Fresh commands (2026-09-16):

- `npm test`: exit 0, **218 passed, 0 failed, 0 skipped**.
- `npm run build:test`: exit 0.
- `npx playwright test tests/browser/attempt-rehearsal-flows.spec.js tests/browser/design-system-flows.spec.js --grep "ensaio|preflight|Session ensaiada|skip aceita|tentativa obsoleta|reload pré-início|início direto" --retries=0`: exit 0, **14 passed**, desktop/mobile.
- `npx playwright test tests/browser/pwa-lifecycle-flows.spec.js --project=chromium --grep "attempt rehearsal|controlled complete cache" --retries=0`: exit 0, **2 passed**.
- Isolated Playwright probes served from `.test-dist` by an inline Node HTTP server: exit 0; observations above. These are diagnostics, not maintained regression tests.
- `git diff --check`: exit 0, Windows LF/CRLF warnings only.

Two preliminary attempts to connect the diagnostic browser to temporary servers failed before assertions (`ERR_CONNECTION_REFUSED`, `ERR_EMPTY_RESPONSE`). The final inline server avoided that environment issue and produced the recorded observations. No product success was inferred from failed attempts.

The full regression from 2026-09-15 (**218 Node + 254 browser passed, 24 conditional skips**) is still-valid execution evidence for unchanged production files, but does not cover SR-01/SR-02. It was not rerun in full today because the demonstrated blockers already prevent closure.

## Design and data comparison

- Changed product/docs/tests are exactly the 13 Design paths, including the new untracked rehearsal spec. No unrelated work was overwritten.
- No schema, migration, store, backup/restore or Markdown contract change; Service Worker unchanged, local candidate v83.
- Stable Session form reference differs from the literal mutable `createSession` call in Design, but follows the same existing transaction and is documented in Build; not a new persistence owner.
- Local `origin/main` remains at the feature baseline. The saved local `main` branch is a divergent legacy integration checkout, not the feature baseline; it was not changed. No fetch or current remote-state claim was made.

## Iterate cascade and stop condition

Classification: **modifying evidence/integration**, not new product scope. Requirements and clarity remain valid; DEFINE returns to `Complete (Designed)`, DESIGN to `Ready for Build` with corrective §21, and BUILD_REPORT to `NEEDS REVISION`. Historical test counts remain preserved. Working documents and existing product changes are retained.

No archive or `SHIPPED.md` was created: the Ship skill forbids closure with failed acceptance or unapproved implementation deviation. No production/test correction was applied in this review. The next authorized phase is corrective `sdd-build`, followed by a repeated Ship gate; Delivery 4 remains gated.

## Residual risks and lessons

- Installed-PWA physical-device smoke and remote CI/publication are separate, unperformed gates. No runtime dependencies or schema were added.
- Mobile short heights require native dialog scrolling; CSS must also satisfy the approved button layout.
- Lesson 1: a test name is not evidence of its actions. Check the actual clicked selector, submitted values and assertions before mapping acceptance.
- Lesson 2: early mobile CSS can lose to later pilot selectors. Assert computed display/positions and inspect settled visual state, not only touch geometry.
- Lesson 3: reload cleanup does not prove navigation cleanup. Test route/history invalidation while the draft still exists, including a pending asynchronous start.

No commit, push, PR, merge, release, deploy, permission change or destructive cleanup occurred.
