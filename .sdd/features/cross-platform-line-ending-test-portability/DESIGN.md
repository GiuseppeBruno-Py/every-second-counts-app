# Cross-Platform Line-Ending Test Portability — Technical Design

**Status:** Complete (Built)
**Feature:** `cross-platform-line-ending-test-portability`
**Design revision:** 1
**Authoritative Define:** `.sdd/features/cross-platform-line-ending-test-portability/DEFINE.md`
**Baseline:** `87d1755d5be20bbda77eec0ac8451ef8cedb04b7`
**Branch:** `fix/cross-platform-line-ending-test-portability`
**Feature type:** Repository maintenance / test infrastructure

## 1. Scope and design gate

This Design implements all 12 requirements and maps all 12 acceptance criteria from the authoritative Define. The Define clarity score is 15/15 and no assumption proved materially wrong during repository inspection.

The implementation remains test-only. The single implementation file is `tests/cognitive-profile.test.js`. Runtime/product files are frozen. No SDD Iterate is required.

The installed Design skill references `templates/DESIGN_TEMPLATE.md`, but that template is absent from the installed skill directory. This artifact follows the repository's existing numbered technical-design convention and contains every section required by the skill: current and target states, exact logic, alternatives, interfaces, flows, closed manifest, dependency order, AC traceability, validation, compatibility, impacts, rollback, and gate.

## 2. Repository inspection and current state

### Worktree and architecture

- Worktree: `C:\Users\Giuse\OneDrive\Documentos\Every Second Counts\every-second-counts-app-line-ending-portability`
- Branch: `fix/cross-platform-line-ending-test-portability`
- HEAD/base: `87d1755d5be20bbda77eec0ac8451ef8cedb04b7`
- The worktree contains only the new maintenance SDD feature as untracked work before Design.
- `.codegraph/` is absent in this worktree, so direct source, test, package, and CI inspection is authoritative.
- Root `AGENTS.md` confirms that Node is test infrastructure, product source must not be changed for test convenience, commands come from `package.json`, and Git/publication actions require separate authorization.

### Exact current test behavior

`tests/cognitive-profile.test.js`:

1. reads `../index.html` synchronously as UTF-8 through `fs.readFileSync`;
2. computes `inlineScript` once at module load with:

   ```js
   /<script type="module">\n([\s\S]*?)<\/script>\n<\/body>/
   ```

3. requires one literal LF immediately after `<script type="module">`;
4. keeps the existing non-greedy `([\s\S]*?)` script-content capture;
5. requires one literal LF between `</script>` and `</body>`;
6. asserts that a capture exists;
7. obtains the `AsyncFunction` constructor and asserts that compiling the captured script does not throw.

Five preceding cognitive-profile tests inspect the full HTML directly and do not reuse `inlineScript` or its locator. No other test file imports this locator. `scripts/compose-test-app.js` has a separate composition assertion that requires exactly one inline module script, but it is not exported and has different responsibilities; reusing it would require unjustified cross-file changes.

### Reproduced gap

The clean Windows checkout has `core.autocrlf=true`, 1,290 CRLF boundaries in `index.html`, and no LF-only boundaries. The current locator returns no capture. A probe that changes only the two physical newline tokens from `\n` to `\r?\n`:

- matches the clean CRLF checkout;
- matches a deterministic LF representation;
- matches the equivalent deterministic CRLF representation;
- rejects a representation without the required closing-script/body boundary.

The focused current test count is 6: 5 pass and 1 fails. The full current Node reference is 161 discovered: 160 pass, 1 fail, 0 skip.

## 3. Intended semantic contract

### Incidental representation

The physical line boundary may be:

- LF: `\n`; or
- CRLF: `\r\n`.

### Required semantics

The test must continue to require:

1. the exact `<script type="module">` opening token;
2. a recognized physical line boundary immediately after that token;
3. captured inline JavaScript content;
4. the exact `</script>` closing token;
5. a recognized physical line boundary immediately after the closing script;
6. the exact terminal relationship to `</body>`;
7. JavaScript that compiles through the existing `AsyncFunction` mechanism.

Portability changes only items 2 and 5. It does not weaken token identity, content capture behavior, terminal placement, or syntax validation.

## 4. Alternatives

| Alternative | Design | Advantages | Risks/costs | Decision |
| --- | --- | --- | --- | --- |
| A — newline-portable regex | Change only the two structural newline tokens to accept LF or CRLF and expose the pattern through a local extractor. | Smallest semantic change; no preprocessing; preserves exact current tokens, non-greedy capture, and terminal relation; deterministic negative tests are straightforward. | `\r?\n` must be limited to actual physical boundaries and explained. | **Selected.** |
| B — normalize source inside the test | Convert CRLF to LF in a test-local copy, then use the current regex. | Keeps the visible structural regex unchanged. | Adds a preprocessing step; can obscure which boundaries are under test; makes malformed CRLF evidence less direct; risks normalizing content beyond the two relevant boundaries. | Rejected as less direct. |
| C — structure-oriented extraction without newline dependence | Replace the locator with broader delimiter parsing or a new structural algorithm. | Could avoid explicit newline syntax. | Disproportionate rewrite; greater false-positive risk; likely changes current semantics; could require shared helpers or dependencies. | Rejected as unnecessary. |

## 5. Selected locator and helper design

Build must make the following exact logical change inside `tests/cognitive-profile.test.js`:

```js
const inlineApplicationScriptPattern = /<script type="module">\r?\n([\s\S]*?)<\/script>\r?\n<\/body>/;

function extractInlineApplicationScript(source) {
  return source.match(inlineApplicationScriptPattern)?.[1] ?? null;
}

const inlineScript = extractInlineApplicationScript(html);
```

The names may be adjusted only for the file's existing concise style, but the implementation semantics are closed:

- exactly two `\n` tokens become `\r?\n`;
- `([\s\S]*?)` remains unchanged;
- opening, closing, and terminal body tokens remain unchanged;
- extraction returns the captured script or `null`;
- no normalization, platform branch, Git inspection, skip, dependency, or production utility is introduced.

### Helper decision

A small test-local pure extractor is required. It makes deterministic strings independently testable while preserving the real-source assertion. It is not exported and does not belong in application or shared test infrastructure.

## 6. Deterministic evidence design

### Fixture construction

The existing test file will define one minimal valid LF string using escaped `\n` sequences rather than physical source-file newlines. The CRLF form will be derived in memory by replacing those LF tokens with `\r\n`. Because the newline characters are escaped data, checkout line endings cannot change the cases.

The minimal valid structure will contain:

```text
<script type="module"><newline>
const value = 1;<newline>
</script><newline>
</body>
```

No fixture file and no on-disk rewrite is allowed.

### New deterministic contract test

Add one focused Node test, bringing `tests/cognitive-profile.test.js` from 6 to an expected 7 tests. Inside that test:

1. extract from valid LF and assert a non-null capture;
2. compile the LF capture with `AsyncFunction` and assert no throw;
3. extract from equivalent CRLF and assert a non-null capture;
4. compile the CRLF capture and assert no throw;
5. assert extraction returns `null` for a table of malformed structures;
6. extract a structurally valid script containing invalid JavaScript and assert `AsyncFunction` throws.

The exact actual focused and full-suite totals remain authoritative during Build. With one additional test and no removals, the expected references are 7 focused tests and 162 full Node tests.

### Malformed table

The deterministic negative table must cover:

- missing line boundary after the opening module-script token;
- missing line boundary between `</script>` and `</body>`;
- an intervening element between `</script>` and `</body>`;
- no matching inline module script;
- arbitrary whitespace after `</script>` instead of the recognized LF/CRLF boundary.

One parameterized loop in the new test is preferred over five separate tests.

### Existing real-source test

Retain `inline application script is valid JavaScript` and change only its `inlineScript` source to the local extractor. It must still:

- assert that the real `index.html` target was found;
- compile the captured source with `AsyncFunction`;
- fail if the real structure is absent or the JavaScript is invalid.

## 7. False-positive and boundary analysis

| Case | Expected behavior | Reason |
| --- | --- | --- |
| LF at both structural boundaries | Accept | Required valid representation. |
| CRLF at both structural boundaries | Accept | Required equivalent representation. |
| Mixed LF/CRLF at the two exact boundaries | Accept | Each boundary is independently valid; no platform assumption is introduced. A separate mixed test is not required. |
| Lone carriage return | Reject | `\r?\n` still requires LF. |
| Space, tab, or arbitrary whitespace instead of newline | Reject | No `\s*` or other broadening is introduced. |
| Generic `<script>` without `type="module"` | Reject | Exact opening token is unchanged. |
| Exact module script not terminal to `</body>` | Reject | Exact closing-script/newline/body relationship is unchanged. |
| Arbitrary text merely containing `<script>` | Reject unless it contains the complete exact target structure | The locator is not replaced with substring presence. |
| Multiple module scripts | Overall validation must fail if the captured content is not valid JavaScript; `npm run build:test` independently requires exactly one inline module script. | Multiplicity is not a newline-portability responsibility and the current non-greedy capture is unchanged. |
| Additional document content after `</body>` | Existing behavior retained | This Design preserves the present pattern and does not add a new end-of-document assertion. |

## 8. Interfaces and flow

### Test-local interface

`extractInlineApplicationScript(source: string) -> string | null`

- Input: an HTML source string.
- Output: the current pattern's captured inline script string, or `null` when the required structure does not match.
- Side effects: none.
- Errors: none from extraction; structural absence is represented by `null` and asserted by tests.

### Validation flow

```text
HTML string
  → exact newline-portable structural pattern
  → script capture or null
  → structural existence assertion
  → AsyncFunction compilation assertion
```

There is no runtime state, persistence, migration, network, browser, or PWA flow.

## 9. Closed file manifest

The closed Design manifest contains **4 exact paths: 1 implementation file and 3 SDD lifecycle/evidence files**.

| # | Path | Action | Purpose | Dependencies | AC coverage |
| --- | --- | --- | --- | --- | --- |
| 1 | `tests/cognitive-profile.test.js` | Modify | Add the test-local extractor, portable structural pattern, deterministic LF/CRLF/malformed/invalid-JS evidence, and retain the real-source syntax assertion. | Node built-ins already imported; current `index.html` read contract | AC-01–AC-11 |
| 2 | `.sdd/features/cross-platform-line-ending-test-portability/DEFINE.md` | Modify metadata only | Record `Complete (Designed)` now and later Build lifecycle status only when evidence passes. | This Design and installed SDD workflow | AC-12 |
| 3 | `.sdd/features/cross-platform-line-ending-test-portability/DESIGN.md` | Create, then metadata-only Build update | Close architecture/manifest and later record truthful Build lifecycle status. | Authoritative Define | AC-09–AC-12 |
| 4 | `.sdd/reports/cross-platform-line-ending-test-portability/BUILD_REPORT.md` | Create during Build | Record exact implementation, command results, diff audit, AC evidence, deviations, and readiness. | Implemented test and validation results | AC-01–AC-12 |

No wildcard entry is authorized. No other implementation, test, fixture, product, configuration, package, workflow, snapshot, or Learning Loop artifact may change. If another tracked path becomes necessary, Build must stop and return through `$sdd-iterate` before expanding scope.

## 10. Frozen files and domains

All files outside the four-path manifest are frozen. In particular:

- `index.html` and every application JavaScript/CSS file;
- `app-manifest.js`, `service-worker.js`, storage/persistence/state files;
- Learning Outcomes implementation and all `learning-loop-redesign` SDD artifacts;
- `.gitattributes` and all Git configuration;
- `package.json`, lockfiles, dependencies;
- Playwright configuration, browser tests, snapshots, CI workflows;
- PWA generation `compasso-pages-v71` and logical state `compasso.state.v3`.

The test adapts to valid checkout representation; the product does not adapt to the test.

## 11. Dependency-ordered Build sequence

1. Reconfirm branch `fix/cross-platform-line-ending-test-portability`, base ancestry from `87d1755`, and current worktree scope.
2. Modify only `tests/cognitive-profile.test.js` with the exact helper/pattern/evidence design in Sections 5–7.
3. Inspect the focused diff immediately; reject any line-ending mass rewrite or unrelated reformat.
4. Run `node --test tests/cognitive-profile.test.js`; require zero failures/skips and report actual total (expected 7).
5. Run `npm test`; require zero failures/skips and report actual total (expected 162 if one test was added).
6. Run `npm run build:test`; require exit 0.
7. Run the static platform-bypass and frozen-path audits.
8. Run `git diff --check`, inspect `git diff --numstat`, `git status --short`, and exact changed paths.
9. Create the Build report and update Define/Design Build statuses only if all mandatory evidence passes.

No browser suite is required because runtime/browser behavior and browser test sources are frozen. `npm run test:all` is optional additional confidence, not a mandatory acceptance gate for this test-only correction.

## 12. Acceptance traceability

| AC | Implementation logic | Exact file | Evidence method | Command/check |
| --- | --- | --- | --- | --- |
| AC-01 | Portable extractor captures escaped LF fixture and compiles it. | `tests/cognitive-profile.test.js` | Deterministic positive assertion | `node --test tests/cognitive-profile.test.js` |
| AC-02 | Same extractor captures in-memory CRLF equivalent and compiles it. | `tests/cognitive-profile.test.js` | Deterministic positive assertion | `node --test tests/cognitive-profile.test.js` |
| AC-03 | Malformed table includes missing opening boundary and asserts `null`. | `tests/cognitive-profile.test.js` | Deterministic negative assertion | `node --test tests/cognitive-profile.test.js` |
| AC-04 | Malformed table includes missing closing boundary and intervening terminal content. | `tests/cognitive-profile.test.js` | Deterministic negative assertion | `node --test tests/cognitive-profile.test.js` |
| AC-05 | Structurally valid invalid JS capture is passed to `AsyncFunction` and must throw. | `tests/cognitive-profile.test.js` | Deterministic negative syntax assertion | `node --test tests/cognitive-profile.test.js` |
| AC-06 | Real CRLF `index.html` is extracted and compiled by retained current-source test. | `tests/cognitive-profile.test.js` | Focused clean-Windows run | `node --test tests/cognitive-profile.test.js` |
| AC-07 | All Node tests run with no failure or skip; actual counts recorded. | Test suite + Build report | Full Node regression | `npm test` |
| AC-08 | Existing fixture composition completes unchanged. | Existing composition source, unchanged | Build regression | `npm run build:test` |
| AC-09 | Manifest comparison proves sole implementation path. | Closed manifest + Build report | Exact-path and numstat audit | `git status --short`; `git diff --name-only`; `git diff --numstat` |
| AC-10 | No platform/Git/environment bypass is introduced. | `tests/cognitive-profile.test.js` | Static source audit | `rg -n "process\.platform|os\.EOL|core\.autocrlf|\.skip\(|environment" tests/cognitive-profile.test.js` plus review |
| AC-11 | Product, package, CI, Playwright, snapshot, and Git-config paths remain unchanged. | Repository | Frozen-path audit | `git diff --name-only`; manifest comparison |
| AC-12 | Learning Loop artifacts and shipped commit remain unchanged. | SDD/repository refs | Feature-isolation audit | `git diff --name-only -- .sdd/features/learning-loop-redesign .sdd/archive/learning-loop-redesign .sdd/reports/learning-loop-redesign`; `git merge-base`/`git rev-parse` |

**Traceability: 12/12 acceptance criteria covered.**

## 13. Validation commands and expected evidence

### Focused

```powershell
node --test tests/cognitive-profile.test.js
```

- Source: current Node test architecture and `package.json` test glob.
- Current baseline: 6 discovered, 5 pass, 1 fail, 0 skip.
- Designed result: 7 discovered, 7 pass, 0 fail, 0 skip, subject to reporting actual totals.

### Full Node regression

```powershell
npm test
```

- Source: `package.json`.
- Current baseline: 161 discovered, 160 pass, 1 fail, 0 skip.
- Designed result: zero failures and zero skips; expected 162 pass if exactly one test is added. Actual totals are authoritative.

### Composition regression

```powershell
npm run build:test
```

- Source: `package.json` and `scripts/compose-test-app.js`.
- Required result: exit 0.

### Diff integrity

```powershell
git diff --check
git diff --numstat
git diff --name-only
git status --short
```

Required result:

- no whitespace errors;
- `tests/cognitive-profile.test.js` has a small localized implementation diff, not a whole-file newline rewrite;
- only the four exact manifest paths appear across implementation and SDD evidence;
- no staged files;
- ignored `.test-dist/` output may exist after composition but must not enter the release unit.

## 14. Migration, compatibility, rollout, and rollback

### Migration

Not applicable. There is no runtime state, schema, storage, backup, cache, or user-data change.

### Compatibility

- LF checkout: supported deterministically.
- CRLF checkout: supported deterministically.
- Git configuration: no dependency.
- Windows/Linux: same test logic and fixtures.
- Product/PWA: unchanged at `compasso.state.v3` and `compasso-pages-v71`.

No PWA generation bump is required.

### Rollout

This feature must independently complete Build and Ship as a test-maintenance successor to `87d1755`. It does not update `main`, deploy, or publish. After Ship, the previously blocked integration validation is rerun against the linear candidate.

### Rollback

Revert the single future test-only maintenance commit. No migration reversal, data recovery, backup operation, cache action, or forward PWA generation is required.

## 15. Security, privacy, observability, performance, and operations

| Area | Impact |
| --- | --- |
| Security/privacy | None; no data handling or external communication changes. |
| Observability | Node failure becomes more accurate across checkout formats; no telemetry/logging added. |
| Performance | Negligible test-only in-memory matching over small deterministic strings; runtime unaffected. |
| Accessibility/UX | None. |
| Persistence/backup | None. |
| Operations | Removes a false Windows integration failure after Build/Ship; main integration remains separately authorized. |

## 16. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Regex accepts arbitrary whitespace. | Use exactly `\r?\n`, never `\s*`; include arbitrary-whitespace negative evidence. |
| Helper changes current target semantics. | Keep every token and `([\s\S]*?)` unchanged except the two newline encodings. |
| Invalid JavaScript slips through. | Preserve real-source compilation and add deterministic invalid-JS rejection. |
| Newline transformation rewrites product source. | Generate only escaped in-memory strings; frozen-path and numstat audit. |
| Multiple module scripts are mishandled. | Preserve current locator semantics; retain independent exactly-one composition gate via `npm run build:test`. |
| Build expands scope. | Four-path closed manifest and mandatory Iterate stop condition. |

## 17. Explicitly rejected workarounds

- editing `index.html` or normalizing its line endings;
- adding `.gitattributes`;
- changing `core.autocrlf` or prescribing developer Git settings;
- using `process.platform`, `os.EOL`, environment variables, or OS-specific branches;
- skipping, disabling, or weakening the test;
- replacing structural matching with generic substring presence;
- changing CI, Playwright, package files, dependencies, snapshots, PWA code, or Learning Loop code;
- creating a production/shared utility for a local test concern.

## 18. Design gate

| Gate | Result |
| --- | --- |
| Exact failure mechanism established | Pass |
| Selected alternative | Pass — Alternative A |
| Exact regex/helper design closed | Pass |
| Deterministic LF evidence | Pass — designed |
| Deterministic CRLF evidence | Pass — designed |
| Malformed structure rejection | Pass — designed |
| Invalid JavaScript rejection | Pass — designed |
| Sole implementation file known | Pass |
| Product/Git/config freeze explicit | Pass |
| 12/12 AC traceability | Pass |
| Validation commands repository-backed | Pass |
| Migration/PWA impact addressed | Pass — none |
| Rollback defined | Pass |
| Build decisions remaining | None |

**Design result: PASS — Ready for Build.**

## 19. Phase handoff

Build must implement only the exact closed design in `tests/cognitive-profile.test.js`, run the mandatory focused/Node/composition/diff gates, create the Build report, and update lifecycle metadata only when evidence passes.

The next valid SDD skill is `$sdd-build`.

Design does not authorize staging, commit, push, merge, deployment, publication, main integration, or Learning Loop Slice 2 work.
