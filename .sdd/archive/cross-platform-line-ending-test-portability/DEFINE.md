# Cross-Platform Line-Ending Test Portability — Define

**Status:** Shipped
**Feature:** `cross-platform-line-ending-test-portability`
**Feature type:** Repository maintenance / test infrastructure
**Baseline inspected:** shipped commit `87d1755d5be20bbda77eec0ac8451ef8cedb04b7`
**Branch:** `fix/cross-platform-line-ending-test-portability`
**Brainstorm:** Intentionally skipped because the problem, root cause, expected behavior, and scope are verified and concrete

## 1. Definition purpose

This document defines a narrowly scoped correction to make the existing cognitive-profile inline-application-script assertion behave consistently when the checked-out HTML uses either LF or CRLF line endings. It defines test behavior only. It does not change application behavior, reopen `learning-loop-redesign`, or authorize implementation.

The completed `Slice 1 — Actionable Outcome Foundation` remains formally shipped at `87d1755d5be20bbda77eec0ac8451ef8cedb04b7`. This maintenance feature is a prospective linear successor to that immutable checkpoint.

## 2. Problem and target users

### Problem

`tests/cognitive-profile.test.js` locates the inline application module by matching a structural boundary that currently requires literal LF characters after the opening module-script tag and after the closing script tag. On a clean Windows checkout with system Git configuration `core.autocrlf=true`, `index.html` is checked out with CRLF boundaries, so the locator returns no match even though the intended script and structure are present and unchanged.

The post-Ship integration candidate was byte-equivalent at the Git tree level to the shipped feature. `npm test` nevertheless reported 160 passed, 1 failed, and 0 skipped because this single test made a checkout-format assumption. No product defect was identified.

### Verified evidence

- The clean maintenance worktree contains 1,290 CRLF boundaries and no LF-only boundaries in `index.html`.
- The current locator does not match that checkout.
- An equivalent line-boundary probe that accepts LF and CRLF matches the current checkout.
- The same probe matches deterministic LF and CRLF representations of the same HTML.
- The probe rejects a representation where the required closing-script/body boundary is removed.
- The focused test currently reports 5 passed and 1 failed; only `inline application script is valid JavaScript` fails.

### Target users

The direct users are repository contributors and automation running the same Node test suite from valid checkouts on Windows, Linux, or other environments that preserve LF or use CRLF. Indirectly, maintainers benefit from a reliable integration gate that distinguishes product failures from checkout-format differences.

## 3. Goals and measurable success

| Priority | Goal | Measurable success criterion |
| --- | --- | --- |
| P0 | Make the structural locator line-ending portable. | Equivalent valid LF and CRLF representations both locate the intended inline application script. |
| P0 | Preserve structural sensitivity. | Missing or malformed required script/body boundaries still fail rather than being accepted through a broad substring search. |
| P0 | Restore the clean Windows Node gate. | The focused cognitive-profile test and full `npm test` complete with zero failures on the reproduced Windows checkout. |
| P0 | Preserve all runtime and product behavior. | No runtime/product file, dependency, Git configuration, Playwright configuration, or CI workflow changes. |
| P1 | Keep direct evidence deterministic. | LF, CRLF, and malformed cases are exercised without rewriting the real product source file. |
| P1 | Preserve composition coverage. | `npm run build:test` continues to complete successfully. |

## 4. Requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| REQ-01 | The cognitive-profile test must locate the same intended terminal inline module-script boundary when the source uses valid LF or valid CRLF line endings. | P0 |
| REQ-02 | LF and CRLF must be treated as equivalent line-boundary encodings; no operating-system, Git-setting, or checkout-specific branch may decide the result. | P0 |
| REQ-03 | The locator must remain structurally specific to the intended module-script opening, script content, closing script, following line boundary, and closing body relationship. | P0 |
| REQ-04 | The assertion must continue to fail when the required boundary is absent, malformed, misplaced relative to the closing body, or does not yield a valid inline application script. | P0 |
| REQ-05 | The existing JavaScript-validity assertion must remain effective after the script is located; portability must not bypass or weaken syntax validation. | P0 |
| REQ-06 | Direct deterministic evidence must cover an LF representation, an equivalent CRLF representation, and at least one malformed structural representation. | P0 |
| REQ-07 | Evidence generation must operate on in-memory strings or equivalent isolated test data and must not rewrite `index.html` or any product source file. | P0 |
| REQ-08 | The reproduced clean Windows checkout must pass `tests/cognitive-profile.test.js` without changing `core.autocrlf`, `.gitattributes`, or developer Git configuration. | P0 |
| REQ-09 | The full Node suite must complete with zero failures and report its actual discovered, passed, failed, and skipped totals; the current reference is 161 discovered tests. | P0 |
| REQ-10 | Browser-test application composition must remain valid under the existing `npm run build:test` command. | P0 |
| REQ-11 | The implementation scope is test infrastructure only and is expected to modify only `tests/cognitive-profile.test.js`; Design must not authorize another implementation path without new concrete repository evidence. | P0 |
| REQ-12 | The correction must add no dependency, platform skip, conditional bypass, product behavior, schema change, PWA-generation change, CI change, or Playwright change. | P0 |

**Requirement count: 12.**

## 5. Scope

### In scope

- The line-ending-sensitive inline application-script locator in `tests/cognitive-profile.test.js`.
- Deterministic test evidence for LF, CRLF, and malformed structural boundaries.
- Preservation of the existing assertion that the captured inline script is valid JavaScript.
- Focused verification of `tests/cognitive-profile.test.js`.
- Full Node regression through `npm test`.
- Composition regression through `npm run build:test`.
- The SDD artifacts required for this new maintenance feature.

### Out of scope

- Any change to `index.html`, application JavaScript, CSS, persistence, storage, Service Worker, app manifest, information architecture, Learning Outcomes, or other runtime/product behavior.
- Any change to package dependencies, `package.json`, lockfiles, Playwright configuration, snapshots, or CI workflows.
- `.gitattributes`, global or repository Git configuration, `core.autocrlf`, or checkout normalization policy.
- Windows-only skips, `process.platform` branches, environment-variable bypasses, conditional disabling, or removal of the assertion.
- A generic substring-presence check that no longer validates the intended structural boundary.
- Reopening or modifying any `learning-loop-redesign` Brainstorm, Define, Design, Build report, or Ship archive.
- Integration into `main`, pushing, deployment, publication, or any Learning Loop Slice 2 work.

## 6. Business and maintenance rules

1. LF and CRLF are both valid encodings of the same required line boundaries.
2. A valid recognized boundary is a line feed optionally preceded by a carriage return; arbitrary whitespace, a lone carriage return, or a missing boundary is not equivalent.
3. Portability applies to boundary encoding, not to script placement or JavaScript validity.
4. The test must fail loudly when the target structure cannot be located; absence must not silently produce an empty or skipped assertion.
5. Product source remains authoritative and unmodified. Test evidence may derive deterministic in-memory variants from the source or an isolated minimal representation.
6. The change must work without knowledge of `process.platform`, Git configuration, or checkout environment.
7. Existing cognitive-profile assertions unrelated to line endings retain their present strength and meaning.
8. The shipped Learning Loop commit remains immutable; this maintenance work follows it as a distinct SDD feature.

## 7. Constraints and prohibited solutions

The solution must not:

- change or normalize `index.html` line endings;
- add `.gitattributes` for this defect;
- force LF globally or require a different `core.autocrlf` value;
- skip or disable the test on Windows;
- use platform detection or environment-specific bypass logic;
- broaden the locator to arbitrary whitespace or generic script-text presence;
- remove the boundary assertion or JavaScript-validity assertion;
- add fixtures unless Design proves the existing test file cannot hold deterministic evidence cleanly;
- add dependencies or alter CI, Playwright, package, runtime, or PWA configuration.

The preferred behavior is equivalent to recognizing `LF` or `CRLF` at the two existing structural line boundaries. Design owns the exact implementation expression and test organization.

## 8. Acceptance criteria

| ID | Given | When | Then | Evidence class |
| --- | --- | --- | --- | --- |
| AC-01 | A valid representation of the target HTML using LF line endings | The cognitive-profile structural locator evaluates it | The intended inline module script is captured and the assertion passes | Deterministic Node test |
| AC-02 | Semantically identical valid content using CRLF line endings | The same locator evaluates it | The same intended inline module script is captured and the assertion passes | Deterministic Node test |
| AC-03 | Content without the required opening-script line boundary | The locator evaluates it | No valid capture is produced and the structural assertion fails | Negative Node test |
| AC-04 | Content without the required closing-script/body line boundary, or with the target script misplaced relative to `</body>` | The locator evaluates it | No valid capture is produced and the structural assertion fails | Negative Node test |
| AC-05 | A structurally captured inline script containing invalid JavaScript | The existing validity assertion evaluates it | The test fails for invalid JavaScript rather than treating structural capture as sufficient | Negative Node test |
| AC-06 | The clean Windows worktree using CRLF checkout boundaries | `node --test tests/cognitive-profile.test.js` runs | All focused cognitive-profile tests pass with zero failures and zero skips | Focused current-environment test |
| AC-07 | The corrected maintenance candidate | `npm test` runs | Zero tests fail; actual discovered/pass/skip totals are reported and no unexplained test-count regression occurs relative to the current 161-test reference | Full Node regression |
| AC-08 | The corrected maintenance candidate | `npm run build:test` runs | Composition succeeds with exit 0 and no source or manifest regression | Composition regression |
| AC-09 | The final implementation diff is inspected | Changed implementation paths are compared with the closed Design manifest | Only `tests/cognitive-profile.test.js` is modified unless a separately justified Design decision explicitly changes the closed manifest | Diff/manifest audit |
| AC-10 | The corrected test source is inspected | Platform and environment dependencies are searched | No `process.platform`, Git-config inspection, environment bypass, skip, or conditional disable controls portability | Static audit |
| AC-11 | The maintenance diff and validation are complete | Product/runtime paths, package files, CI, Playwright, and Git configuration are inspected | None are changed | Repository audit |
| AC-12 | The maintenance SDD feature advances independently | Learning Loop artifacts and shipped commit are inspected | Slice 1 remains shipped and unchanged; this feature neither reopens it nor starts Slice 2 | SDD isolation audit |

**Acceptance-criterion count: 12.**

## 9. Scenario and error matrix

| Scenario | Expected result | Must not happen |
| --- | --- | --- |
| Valid LF document | Target script is captured and syntax-checked. | Failure solely because the checkout uses LF. |
| Valid CRLF document | Same target script is captured and syntax-checked. | Failure solely because the checkout uses CRLF. |
| Missing opening boundary | Structural capture fails. | Locator searches generically elsewhere for similar text. |
| Missing closing-script/body boundary | Structural capture fails. | Locator accepts adjacent or arbitrary whitespace without the required relationship. |
| Invalid captured JavaScript | Syntax assertion fails. | Structural success bypasses JavaScript validation. |
| Clean Windows checkout | Focused test and full Node suite pass after correction. | Git settings or product files are changed to obtain a pass. |
| Composition regression | `npm run build:test` exposes the failure. | The maintenance feature changes composition to accommodate the test. |

## 10. Evidence strategy for Design

Design must map the requirements to direct, deterministic evidence in the existing test architecture. The preferred evidence shape is contained within `tests/cognitive-profile.test.js` and exercises:

1. an LF representation;
2. the semantically identical CRLF representation;
3. malformed opening or closing structural boundaries;
4. invalid JavaScript after a structurally valid capture;
5. the real clean Windows checkout;
6. the full Node suite and composition command.

The deterministic newline cases must not modify the on-disk `index.html`. Design may select a small pure locator/helper or equivalent local test organization, but must retain the current semantic target and closed one-file implementation expectation.

Repository-supported validation commands confirmed from `package.json` are:

- `node --test tests/cognitive-profile.test.js`
- `npm test`
- `npm run build:test`

`npm run test:all` is not mandatory for this test-only Define unless Design identifies a browser-composition risk beyond the required `build:test` gate. It remains available as a broader optional confidence gate.

## 11. Compatibility and impact

| Area | Impact |
| --- | --- |
| Product/runtime behavior | None |
| Persistence or logical state | None |
| IndexedDB/localStorage schema | None |
| Backup/restore or export | None |
| Service Worker/PWA generation | None |
| App manifest/composition source | None; composition is regression-tested only |
| UX/accessibility | None |
| Privacy/security | None |
| Dependencies | None |
| CI/Playwright/snapshots | None |
| Learning Loop Slice 1 | Remains shipped and unchanged |

## 12. Dependencies and assumptions

### Dependencies

- Node's built-in test runner and strict assertions already used by the repository.
- The existing terminal inline module-script structure in `index.html`.
- The current cognitive-profile test's JavaScript syntax validation through `AsyncFunction`.
- Existing repository commands in `package.json`.

### Assumptions

1. The intended semantic target remains the terminal inline `<script type="module">` block immediately preceding the closing body boundary.
2. LF and CRLF are the only required valid newline encodings for this maintenance scope.
3. The current 161-test Node total is a reference, not a substitute for reporting actual Build results.
4. Deterministic variants can be tested without a new fixture file; Design must record evidence if this assumption proves false before expanding the manifest.

## 13. Risks and mitigations

| Risk | Required mitigation |
| --- | --- |
| Locator becomes too permissive and captures the wrong script. | Retain the exact module-script and closing-body relationship; add malformed negative cases. |
| Test passes structure but no longer validates JavaScript. | Preserve explicit `AsyncFunction` syntax validation and add invalid-script evidence. |
| Fix depends on the current machine. | Exercise deterministic LF and CRLF strings and prohibit platform/Git-config branches. |
| Product source is reformatted to satisfy infrastructure. | Closed test-only implementation scope and no-product-diff AC. |
| Maintenance feature accidentally reopens shipped Slice 1. | Separate slug/worktree/branch and explicit SDD-isolation AC. |

## 14. Rollback and operational sequence

Rollback is trivial and data-free: revert the future test-only maintenance commit. No runtime, user data, schema, backup, cache, or deployment recovery is involved.

After this maintenance feature separately completes Define, Design, Build, and Ship, the intended operational sequence is:

1. preserve shipped Learning Loop commit `87d1755d5be20bbda77eec0ac8451ef8cedb04b7`;
2. add the shipped maintenance correction as a subsequent commit;
3. rerun the complete post-Ship integration validation gate;
4. only after that gate passes, request explicit authorization to advance `main`;
5. keep publication as a later independent decision.

No integration or publication operation is authorized by this Define.

## 15. Open decisions for Design

No user decision blocks Design. Design must make only these bounded technical decisions:

1. the exact line-boundary expression or equivalent small locator implementation;
2. how to expose deterministic LF, CRLF, malformed-boundary, and invalid-JavaScript cases inside the existing test file without weakening the real-source assertion;
3. whether `npm run test:all` adds proportionate confidence beyond the mandatory focused, Node, and composition gates.

Any need for another tracked implementation/test path is not authorized here and must be justified before the Design manifest is closed.

## 16. Clarity score

| Dimension | Score (0–3) | Explicit evidence |
| --- | --- | --- |
| Problem | 3 | The failing test, clean-checkout conditions, line-ending assumption, exact failed assertion, and non-product classification are reproduced and documented. |
| Users | 3 | Cross-platform repository contributors and Linux/Windows automation are explicitly identified. |
| Goals | 3 | Equivalent LF/CRLF behavior, retained structural sensitivity, restored Node gate, and product immutability are explicit. |
| Success | 3 | Twelve binary ACs cover LF, CRLF, malformed structure, invalid syntax, the reproduced checkout, regression commands, and diff isolation. |
| Scope | 3 | One expected test implementation path and comprehensive product, configuration, dependency, SDD, integration, and publication exclusions are explicit. |

**Total: 15/15 — PASS — Ready for Design.**

## 17. Phase handoff

This Define captures requirements only. It creates no Design and authorizes no product or test implementation. Brainstorm remains intentionally skipped, and `learning-loop-redesign` remains formally shipped and untouched.

The next valid SDD skill is `$sdd-design`, using:

`.sdd/features/cross-platform-line-ending-test-portability/DEFINE.md`
