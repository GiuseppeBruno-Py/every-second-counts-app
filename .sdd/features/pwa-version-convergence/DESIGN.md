# Design: PWA version convergence

**Feature:** `pwa-version-convergence`
**Phase:** 2 — Design
**Revision:** 1
**Status:** Ready for Build
**Baseline:** `origin/main@922b6c8dc12046a5bc3524ef9aee042411c933ab`
**Branch:** `codex/pwa-version-convergence`
**Inputs:** `BRAINSTORM.md` (Alternative B selected) and `DEFINE.md` revision 1 (26 requirements, AC-01–AC-46, 15/15 clarity)

> The installed skill's referenced `templates/DESIGN_TEMPLATE.md` is absent. This artifact uses the complete repository-grounded structure required for this initiative. The local checkout is authoritative. No historical v20/v21 mechanism is reused.

## 1. Current-state architecture

The baseline is a static, framework-free, local-first GitHub Pages application with no production build step.

| Component | Current responsibility | Verified problem relevant to this feature |
| --- | --- | --- |
| `app-manifest.js` | Exposes manifest API `version: 1`, cache name `compasso-pages-v69`, 51 ordered production modules, 64 assets, 28 collections, and contracts. | The API version is not a release generation. `cacheName` is the only existing release identity. Module `marker` values are loose global-name substrings. |
| `service-worker.js` | Imports the manifest; precaches `assets`; calls `skipWaiting()` after `cache.addAll`; deletes all caches except current on activation; claims clients; composes navigations by injecting support assets and module source. | LF-only string anchors fail on the CRLF checkout; loose marker matching skips `weekly-plan-model.js`; partial results still receive success headers; nominally optional modules can be absent; cleanup can delete unrelated caches. |
| Raw `index.html` | Contains visible legacy Overview shell, direct `storage.js` loading, base state/render/CRUD, backup/restore, update button, Service Worker registration, a 900 ms update reload, and standalone-only `controllerchange` reload. | It is a usable alternate application before control. Three actors can cause uncoordinated lifecycle work: update timer, controller listener, and diagnostic recovery. |
| `bootstrap-diagnostics.js` | Records module start/done/error entries, creates an alert on failures, unregisters the same-scope worker, removes prefix-matching caches, and reloads. | It is injected only into composed HTML, so it cannot guard the first raw paint. Recovery is destructive to the shell by default and is another direct reload owner. |
| `app-ui.css` / `design-system.css` | Provide shared UI variables, focus styling, dialog/button primitives, coarse target sizing, responsive and reduced-motion contracts. | They are currently injected only during Service Worker composition and are unavailable to the raw bootstrap. |
| `storage.js` | Loads `compasso-db` IndexedDB version 1 with localStorage compatibility/fallback; is loaded directly by `index.html`. | It is not a lifecycle problem and must remain directly loaded exactly once. |
| `state-foundation.js` / `feature-runtime.js` | Normalize application state and install the 51-module feature runtime after composition. | They consume a valid composed document; they must not become lifecycle coordinators. `CompassoFeatures.install()` is invoked by the last module, `ux-consolidation-feature.js`. |
| `scripts/compose-test-app.js` | Precomposes 37 browser-journey modules into `.test-dist` and syntax-checks the inline application script. | It duplicates the same LF-only anchor and does not exercise the production raw-to-controlled lifecycle or all 51 modules. |
| Node/Playwright/CI | `npm test`, `npm run build:test`, `npm run test:browser`, and `npm run test:all`; CI runs `npm run test:all` with Chromium. | Existing tests cover composed feature behavior and one controlled offline journey, but not production-like first visit, update transition, generation handshake, or reset behavior. |

Current exact execution order is: raw HTML parses and exposes the legacy shell; direct storage initializes; base application code renders; the page registers `service-worker.js?version=<cacheName>`; the worker precaches and claims; only a later controlled navigation is intercepted and text-composed. Support tags are inserted before `</head>` and modules are inserted before an LF-specific `renderAll()` text sequence. `ux-consolidation-feature.js`, the last manifest module, calls `CompassoFeatures.install()` before base `renderAll()` continues.

The obsolete `integrateIndexedDb()` path in the worker returns without modifying the current HTML because `storage.js` is already direct. It has no future responsibility and will be removed rather than revived.

## 2. Desired-state architecture

Alternative B is implemented with the existing local `bootstrap-diagnostics.js` file expanded into the dedicated document lifecycle coordinator. No additional lifecycle file is created.

The target flow has four layers:

1. **Manifest contract:** `app-manifest.js` owns the canonical generation (`cacheName`), exact semantic composition tokens, support prerequisites, ordered modules, assets, and cache ownership predicate.
2. **Atomic composition:** new local pure helper `app-composition.js` is shared by `service-worker.js` and `scripts/compose-test-app.js`. It builds and validates a candidate in memory and returns success only after exact support, module identity, count, order, and generation checks pass.
3. **Worker package owner:** `service-worker.js` installs only a complete package, composes controlled navigations from that generation's cache, reports its generation through a local message protocol, and deletes only unambiguously owned stale Compasso caches.
4. **Document lifecycle owner:** statically loaded `bootstrap-diagnostics.js` guards the raw shell, owns all application-requested reloads, compares the composed document marker with the controlling worker generation, coordinates first visit/update/retry/reset, and reveals application content only after coherence.

Stable success is the conjunction:

`document data-composition="complete" generation G` + `navigator.serviceWorker.controller reports G` + `the successful document was composed only from cache G`.

The last term follows from the worker contract: a complete document marker is added only after all sources are read from `CACHE_NAME` and the candidate validates. A marker alone, a controller alone, or a timer is never sufficient.

## 3. Responsibility boundaries

| Responsibility | Single owner | Signals/consumers | Explicit exclusions |
| --- | --- | --- | --- |
| Release/application generation | `app-manifest.js` `cacheName` | Worker, coordinator, composer, tests, visible version labels | Manifest API `version` remains schema/API version 1 and is not a release counter. |
| Composition grammar and validation | `app-composition.js` | Worker and test composer | No module executes in the helper; no DOM parser or dependency is introduced. |
| Package install/activate/fetch/message | `service-worker.js` | Coordinator receives lifecycle/controller generation | Worker never calls page reload/navigation and never accesses user persistence. |
| Raw guard, handshake, update UI, retry, reset, reload budget | `bootstrap-diagnostics.js` | Existing update button and worker events signal it | Feature runtime, Today, storage, and design-system feature do not coordinate PWA lifecycle. |
| Neutral bootstrap markup and guarded app container | `index.html` | Coordinator updates semantic state and inert/hidden attributes | Raw Overview cannot be a stable alternative app. |
| Bootstrap presentation | `app-ui.css` using existing design-system variables/primitives | Raw and composed documents | No separate theme or design system. |
| User state | Existing `storage.js`, state and feature code | Unchanged application | No lifecycle guard in IndexedDB; no schema, backup, or vault change. |

## 4. Selected lifecycle-coordinator location

### Decision

Use **Option B**, implemented by statically loading and expanding the existing `bootstrap-diagnostics.js` into a dedicated local bootstrap/lifecycle coordinator. It retains the public `CompassoBootstrapDiagnostic` recording API used by module wrappers, while adding a separately named `CompassoPwaLifecycle` API for `start`, `checkForUpdate`, `retry`, and reset-dialog actions.

### Comparison

| Option | Result |
| --- | --- |
| A — keep coordination in the existing bottom `index.html` application script | Rejected. It executes after the body and direct application bootstrap, cannot reliably prevent a usable legacy first paint, is tightly coupled to base state/render globals, and is difficult to exercise independently in Node. |
| B — statically loaded dedicated local coordinator | Selected. Reusing `bootstrap-diagnostics.js` avoids a second bootstrap file, runs before body/application code, is manifest-cached, works offline, centralizes reloads and diagnostics, and is VM/browser testable without a dependency. |
| C — split responsibility between worker and document | Rejected. A worker cannot own visible focus/status or directly reload a client safely; splitting final navigation would preserve the current race and duplicate attempt state. |

`index.html` loads `app-manifest.js` and `bootstrap-diagnostics.js` as ordinary local scripts in `<head>`, and links `app-ui.css` and `design-system.css` there. The coordinator registers one `DOMContentLoaded` entry point. Static `hidden`, `inert`, and `aria-hidden` attributes on the application shell make correctness independent of script execution timing. The file is already in the application asset list, so only its load location and responsibilities change; no new coordinator asset or dependency is added.

## 5. Generation identity design

### Canonical identity

`CompassoAppManifest.cacheName` is the canonical application generation. The current verified value is `compasso-pages-v69`; the completed implementation will advance once to `compasso-pages-v70` only at the final cache-bump step in Section 25. Manifest `version: 1` remains the manifest contract/API version.

No second release number is introduced. Visible version text, worker script query, composition marker, cache name, message response, tests, and documentation all derive from `cacheName`.

### Hybrid handshake

The minimum mechanism that proves the invariant is a hybrid:

- successful composition replaces the exact generation slot with one marker: `<meta name="compasso-application-generation" content="G" data-composition="complete">`;
- the document queries the current controller via `MessageChannel`.

Protocol:

- request to `navigator.serviceWorker.controller.postMessage`: `{ type: "compasso:generation:query", requestId }`, with one transferred reply port;
- reply on the transferred port: `{ type: "compasso:generation:response", requestId, generation: CACHE_NAME }`;
- `requestId` is an in-memory random UUID when `crypto.randomUUID` exists, otherwise a monotonically increasing page-local value. It is not persisted and contains no user data;
- a 5,000 ms deadline is failure detection only. Expiry enters a retryable state and never declares success or triggers time-based update success;
- responses with a mismatched type/request ID or missing/unknown generation are rejected.

During first install, the coordinator may query `registration.active` through a transferred port to learn that a worker is active before the client is controlled, but that never declares the document coherent. Stable success always queries `navigator.serviceWorker.controller` and requires equality with the document marker.

The cache identity is not separately enumerated during routine startup. A valid complete marker proves that the worker composed the document from its own exact named cache; install and navigation composition both use `CACHE_NAME` and reject missing entries. This avoids repeated cache enumeration and a redundant third protocol.

## 6. Composition identity and sentinel design

`app-composition.js` is a small UMD/CommonJS-compatible pure module so the worker can use `importScripts()` and Node can `require()` the same implementation.

The raw HTML has two exact, newline-independent semantic tokens, each required exactly once:

- `<!-- COMPASSO:COMPOSITION:SLOT -->` in `<head>`;
- `/* COMPASSO:MODULES:SLOT */` immediately before the existing base `renderAll()` call.

Composition identity is derived from the normalized manifest file path, not `module.marker`, registration names, globals, or module source text. For each file, the helper emits exact generated sentinels:

- `/* COMPASSO:MODULE:<encodeURIComponent(file)>:START */`
- `/* COMPASSO:MODULE:<encodeURIComponent(file)>:END */`

The generated module block is bounded by `/* COMPASSO:MODULES:START */` and `/* COMPASSO:MODULES:END */`. Each source remains wrapped in the existing diagnostic `start(file)` / `done(file)` calls. `module.marker` may remain as compatibility metadata in the manifest, but composition code and success validation are forbidden from consulting it.

Before composition, the helper rejects any source containing the reserved `COMPASSO:MODULE:` sentinel prefix. This prevents source content from impersonating a generated identity. File names are taken only from the manifest, normalized to the repository-relative form already used there, and encoded before inclusion.

Idempotency is explicit:

- a raw document must have exactly one slot and no generated block/complete marker;
- a previously composed document with one complete marker for G and a fully valid exact block for the same manifest returns unchanged;
- any mixture (slot plus block, incomplete block, wrong generation, duplicate sentinel, or extra sentinel) fails instead of being repaired or appended.

No edits to the 51 module files are needed.

## 7. Complete-composition validation

Validation occurs twice using the same helper:

1. **Install probe:** after `cache.addAll(APP_SHELL)`, the installing worker reads cached `index.html` and every manifest production module from the newly populated current cache, composes in memory, and validates. Only a successful probe permits `skipWaiting()`. On failure the incomplete current cache is deleted, install rejects, and the previous active worker/cache remains.
2. **Navigation response:** the active worker reads raw `index.html` and all 51 production module sources from its own `CACHE_NAME`, builds one candidate, validates it, then adds the generation marker last and returns the response.

The validation result must prove:

- the composition slot and generation slot each resolve exactly once;
- each manifest-declared support prerequisite exists exactly once;
- direct `<script src="./storage.js">` exists exactly once and the direct storage-ready await remains present;
- every `manifest.modules` file has non-empty cached source;
- every generated start/end identity appears exactly once;
- module identities appear in `manifest.modules` order;
- no unknown generated identity appears;
- the module block boundaries and candidate syntax structure are complete;
- the complete marker contains exactly `CACHE_NAME` and is inserted only after all prior checks pass.

On success, response headers are `x-compasso-composition: complete` and `x-compasso-generation: G`. The misleading per-module `x-compasso-*` success headers are removed; tests inspect the manifest-derived DOM/sentinels instead.

On failure, the worker returns the untouched raw document with `x-compasso-composition: failed` and one allow-listed non-sensitive `x-compasso-composition-error` code. It omits `x-compasso-generation` and the DOM complete marker. Error details may include a manifest file path but never source text, local data, URLs containing queries, or user content. Because the raw application container is statically hidden and inert, neither a partial current app nor the legacy Overview is exposed as coherent.

The worker no longer fetches an individual missing module from the network while composing a navigation. All sources for a successful generation come from the one completed current cache; a missing cache entry is a package/composition failure, not permission to mix generations.

## 8. LF/CRLF solution

All insertion and identity operations use exact semantic tokens that contain no newline. No production or test path matches `renderAll()` together with surrounding whitespace or line terminators. The shared helper receives JavaScript source as opaque text and generates its own consistent delimiters; source line endings do not participate in identity.

Node fixtures create semantically identical raw HTML and module inputs in LF and CRLF forms and assert identical normalized composition facts: token resolution, support count, manifest-derived module count, exact identities, order, generation marker, and success/failure code. The test also converts only line endings, proving that a Windows checkout and Git LF source produce equivalent outcomes.

`integrateIndexedDb()` and its historical newline-based replacement are removed. `scripts/compose-test-app.js` uses the same helper, eliminating the second LF-sensitive implementation.

## 9. Reload ownership

`bootstrap-diagnostics.js` / `CompassoPwaLifecycle` is the **only** code allowed to invoke application-owned `location.reload()`.

| Current direct reload | Build action |
| --- | --- |
| Update button `setTimeout(..., 900)` | Remove. The button calls `CompassoPwaLifecycle.checkForUpdate()` and receives state-driven status. |
| Standalone-only `controllerchange` handler | Remove direct reload and display-mode branch. One coordinator listener receives the event and decides whether coherence requires its single reload. |
| Diagnostic `recover()` `finally { reload() }` | Replace with non-destructive coordinator `retry()`; confirmed shell reset also requests navigation only through the same guarded coordinator. |

The browser's own user-initiated navigation/reload is not application-owned and is outside this limit. No worker code calls `Client.navigate`, `WindowClient.focus` for convergence, or sends a “reload now” command. Worker lifecycle events only change registration/controller state; the coordinator observes them.

An in-memory `reloadInFlight` latch is set synchronously before the sole call. Thus simultaneous update, `controllerchange`, retry, or activation signals cannot each pass the gate before unload.

## 10. Reload/recovery guard design

Use `sessionStorage`, not IndexedDB or product localStorage state.

- key: `compasso.pwa.reload-budget.v1`;
- value: a bounded JSON object containing used attempt keys only; invalid/unavailable storage falls back to an in-memory map for the page and fails closed after one call;
- attempt key: `${generation}|${reason}|${location.pathname}`;
- allow-listed reasons: `first-visit`, `raw-recovery`, `controller-change`, `update`, `shell-reset`;
- no query string, hash, user identifier, or state content is stored.

For one expected generation/path/reason, `requestReload()` atomically checks and records use before calling `location.reload()`. A used key enters `budget-exhausted`; it never reloads again automatically and exposes Retry. In-memory `reloadInFlight` also coalesces different signals within the same page.

On a coherent handshake, the coordinator removes only budget entries for the now-coherent generation and current pathname. It does not clear all session storage. Manual Retry starts a new explicit attempt by removing only the applicable failed attempt key, resetting transient coordinator state, and rerunning discovery. The click itself authorizes one new attempt; Retry never unregisters a worker or deletes a cache. Repeated automatic signals without a click do not reset the budget.

Confirmed shell reset has its own `shell-reset` reason and still receives at most one coordinator-owned post-reset navigation.

## 11. First-visit state machine

| State | Visible UI | Coordinator action | Exit/reload budget |
| --- | --- | --- | --- |
| `booting` | Neutral “Abrindo o Compasso” status; app shell hidden/inert/aria-hidden. | Read document marker and manifest generation; attach the one controller listener. | None. |
| `registering` | Registration status and non-destructive Retry if it fails. | Register `service-worker.js?version=G` at the existing application scope. | None. |
| `installing` | Progress status derived from `installing.state`. | Observe `updatefound`/`statechange`; no elapsed-time success. | None. |
| `awaiting-controller` | “Preparando a versão atual.” | After active/claim, query active/controller generation. | None. |
| `reload-requested` | Status remains; controls disabled only for the imminent navigation. | Coordinator records `first-visit` budget and performs one normal reload. | Maximum one. |
| `coherent` after controlled navigation | Bootstrap hidden; app shell has `hidden`, `inert`, and `aria-hidden` removed; normal application starts/continues. | Marker G equals controller response G; clear matching guard. | Zero further reloads. |
| `failure` / `budget-exhausted` | Persistent readable reason, Retry, and conditionally last-resort reset; legacy shell stays inert. | Record non-sensitive diagnostic. | Zero automatic reloads. |

Static app-shell guard attributes exist in source, so the raw legacy shell cannot become stable during slow script/network execution. The coordinator reveals only after the hybrid handshake. Direct storage may initialize behind the inert shell exactly as today, preserving state without making raw UI usable.

## 12. Controlled-startup fast path

For a current controlled navigation, the worker returns a complete document marked G. On `DOMContentLoaded`, the coordinator queries `navigator.serviceWorker.controller` once. If it reports G, the coordinator immediately reveals the application shell, clears the matching budget, and performs no registration update, cache enumeration, or reload.

This is the path for normal reload, browser reopen, installed-PWA reopen, and complete cached offline reopen. Registration may be read with `getRegistration()` for update/reset APIs, but startup does not call `registration.update()` explicitly. The browser's standard registration update algorithm remains available; the explicit settings action owns user-requested checks.

If the composed feature runtime has not installed within the existing five-second diagnostic window, that is reported as a runtime bootstrap failure while the composed document identity remains known. The timeout is disabled for raw lifecycle states so it does not mislabel normal first-install latency.

## 13. Hard-bypass flow

A hard/bypass navigation may return the raw source and is not intercepted. Static guards still prevent the legacy shell from becoming usable.

After raw code executes, the coordinator:

1. reads the absent complete marker and discovers the same-scope registration;
2. queries the active worker without treating it as document coherence;
3. if a usable worker reports G, requests one ordinary `raw-recovery` reload, allowing the next normal navigation to be controlled;
4. if the active worker is stale and online, observes one normal registration update lifecycle before deciding the expected generation;
5. if no usable path exists, or the one reload returns raw again, ends in the neutral retry/offline state.

It does not intercept keyboard/browser hard-refresh commands, replace navigation APIs, or claim that the bypassed response itself is current. Manual Retry creates a new explicit attempt; no automatic loop or destructive reset follows.

## 14. Update state machine

The existing settings button remains the entry point and delegates to `CompassoPwaLifecycle.checkForUpdate(openerButton)`.

| State/event | Behavior | Reload |
| --- | --- | ---: |
| `checking-update` | Disable/coalesce the same action; attach `updatefound` and candidate `statechange` observers before calling `registration.update()`. Current coherent app remains usable; expose polite status. | 0 |
| Update completes with no new candidate/controller generation | Re-query controller; if unchanged G, report “Compasso está atualizado,” re-enable action. Elapsed time alone never decides this. | 0 |
| `installing` / `installed` / transient `waiting` | Report actual worker state. `skipWaiting()` can make waiting transient; no stable waiting state is required. | 0 |
| `activating` | Continue observing. Do not declare success. | 0 |
| `controllerchange` to G2 | Query the new controller. Record G2 as the expected replacement and signal the coordinator. If the current document marker is G1, the coordinator uses the `update` budget and reloads once. | ≤1 |
| Final controlled document | Marker G2 and controller G2 match; reveal/coherent, clear guard, report completion. | 0 additional |
| Discovery/install/activation/query failure | Keep the already coherent G1 application visible and usable; show persistent retry status; re-enable action; do not unregister/delete/reload. | 0 |

Overlapping clicks return the current in-flight promise/state rather than starting a second `registration.update()`. An update initiated by another tab is handled by the same global controller signal (Section 15).

## 15. `controllerchange` behavior

Exactly one `navigator.serviceWorker.addEventListener('controllerchange', ...)` listener exists, registered by the coordinator for all display modes.

The listener never reloads. It increments an in-memory controller epoch and asks the new controller for its generation. The coordinator then applies these rules:

- if document marker and controller generation already agree, mark/retain coherent and do nothing;
- if an update attempt is active, request the guarded `update` reload;
- if raw first-install is active, request the guarded `first-visit` reload;
- if the change is unsolicited (another tab, browser update, external activation) and makes a coherent visible document stale, request the guarded `controller-change` reload;
- if generation query fails, retain any already coherent visible app, report failure, and do not reload blindly;
- no branch depends on `display-mode: standalone`.

The same in-flight latch and session budget structurally prevent a controller signal from racing the update path into a second reload.

## 16. Offline flows

| Offline state | Implementation path | Stable result |
| --- | --- | --- |
| Controlled complete cache | Worker reads cached raw index, support assets already referenced statically, and all manifest modules from `CACHE_NAME`; composition validates; marker/controller match. | Full current app and local data, zero recovery reload/reset UI. |
| Executing raw document plus usable active/cached worker | Coordinator queries the active worker locally and performs one ordinary `raw-recovery` reload. No network generation lookup is required. | Coherent cached app or bounded retry. |
| Executing raw document without usable controlled path | Registration/query/update failure is classified as offline/unavailable; legacy shell remains hidden/inert. | Readable Retry and optional last-resort action only when eligible; no automatic unregister/cache/data action. |
| No document, worker, cache, or network resource | No Compasso code executes. | Browser-owned network failure, explicitly outside application acceptance per AC-06. |

All generation checks are local. Google Fonts may remain subject to current external availability, but current local application assets and design-system CSS remain manifest-cached; this feature adds no network dependency.

## 17. Failure taxonomy

| Failure code/state | Detection | User behavior | Automatic action |
| --- | --- | --- | --- |
| `registration-failed` | `register()` rejects | Neutral error + Retry; shell inert | None |
| `install-failed` | candidate becomes `redundant` or install probe rejects | Current coherent app retained, otherwise neutral Retry | None |
| `activation-failed` | candidate/registration fails to reach active/controller within lifecycle event/deadline | Same as above | None |
| `controller-query-failed` | message timeout/malformed response | Retain coherent app or raw Retry | None |
| `controller-mismatch` | marker G ≠ controller G2 | Coordinator attempts convergence if budget unused | At most one reload |
| `stale-document` | marker absent/old while usable current worker exists | Raw bootstrap or existing coherent app status | At most one reason-specific reload |
| `stale-cache-generation` | worker generation cannot produce a valid G document | No success marker; Retry | None after budget |
| `missing-composition-slot` | slot count zero | Non-sensitive composition failure | Install fails or raw failure response |
| `ambiguous-composition-slot` | slot count >1 or raw/composed mixture | Same | Same |
| `missing-support` | manifest support selector/token count !=1 | Same | Same |
| `missing-module` | cached source absent/empty or identity absent | Same | Same |
| `duplicate-module` | identity count >1 | Same | Same |
| `module-order` | sentinel order differs from manifest | Same | Same |
| `malformed-composition` | block/marker/sentinel structure invalid | Same | Same |
| `reload-budget-exhausted` | attempt key already used | Persistent Retry; reset only as last resort | None |
| `offline-recovery-failed` | no usable worker/cache while offline | Explicit offline Retry | None |
| `update-failed` | update/candidate failure while G1 coherent | G1 remains usable; Retry update | None |
| `reset-partial-failure` | any unregister/delete/register step rejects | Accurate partial-failure status; persistence untouched | No false success/reload |

Diagnostics use allow-listed codes and module file names only. One generic destructive fallback is not used.

## 18. Cache ownership and cleanup

`app-manifest.js` adds a manifest-owned cache prefix and pure predicate while keeping `cacheName` canonical:

- prefix: `compasso-pages-v`;
- owned name: exact regular expression `^compasso-pages-v\d+$`;
- current cache: exact equality to `manifest.cacheName`;
- stale eligible cache: predicate true and name not current;
- ambiguous names such as `compasso-pages-v69-backup`, `compasso-pages-other`, and any unrelated name are preserved.

Activation enumerates cache names once and deletes only stale eligible names after the install probe has proved the replacement package complete. It never deletes the current cache. Failure deleting one stale owned cache does not cause unrelated deletion or a user-data reset; the worker can record/report the shell cleanup failure without claiming that user data was affected.

The same exported predicate is used by confirmed shell reset, preventing recovery and activation from drifting. Neither path opens/deletes IndexedDB, reads/removes localStorage, touches files/backups/vault data, or changes state.

## 19. Last-resort shell reset

Ordinary Retry is always the first recovery and only restarts coordinator discovery after resetting the one explicit attempt key. The last-resort action becomes visible only after retry/budget exhaustion or a persistent shell/registration failure.

The reset flow is:

1. User activates “Redefinir somente o aplicativo offline”; a native `<dialog>` explains that Service Worker registration and Compasso-owned shell caches will be replaced, while local data/backups are not erased.
2. Cancel or Escape closes the dialog, returns focus to the opener, and performs no API call or storage/cache/registration mutation.
3. Confirm requires online status, disables only reset controls, unregisters registrations whose scope exactly equals `new URL('.', location.href).href`, and deletes only names passing `manifest.isOwnedCacheName`.
4. The still-executing static bootstrap document registers the current worker again, observes successful install/activation, and asks the sole coordinator for one `shell-reset` reload.
5. Any partial failure reports which shell operation class failed without claiming success. It does not reload, clear additional resources, or expose raw application UI. Retry remains available.

This is not a factory reset. The existing application data/example reset remains unrelated and unchanged.

## 20. Accessibility behavior

Raw `index.html` contains one neutral bootstrap region before the guarded application shell:

- `<section id="compassoBootstrap" role="status" aria-live="polite" aria-atomic="true">` with a real heading, status text, detail text, Retry button, and initially hidden last-resort reset button;
- failures switch the message container to assertive alert semantics without repeatedly announcing progress;
- Retry/reset controls are native `<button type="button">` elements with visible text and existing design-system component attributes;
- reset is a native `<dialog aria-labelledby=...>` with Cancel and Confirm. Because the design-system feature is not available in raw mode, the coordinator explicitly sets initial focus, handles close/Cancel/Escape, and restores focus to the opener;
- successful coherence moves focus only if focus is still within bootstrap; it targets the existing application heading/main landmark, avoiding unexpected focus theft from an already interactive coherent app;
- after Retry failure, focus moves to the updated status heading or Retry control; after reset failure it moves to the reset status; after a confirmed successful reset, navigation owns the next focus state.

The legacy `.app-shell` has `hidden`, `inert`, and `aria-hidden="true"` until coherence; therefore it is excluded from reading, tab, pointer, and assistive-technology interaction. All three are removed together on success.

`app-ui.css` adds only scoped `.compasso-bootstrap-*` rules using current colors/variables and existing `:focus-visible` treatment. Controls use minimum `44px` block/inline target on coarse/mobile contexts. At 360px and 200% zoom, actions wrap/stack without horizontal overflow. Status is not conveyed by color alone. No lifecycle animation is required; any transition is disabled by `prefers-reduced-motion`. Existing `prefers-contrast`/design-system boundary treatment is reused. Build verifies actual color pairs at 4.5:1 normal text and 3:1 large text/focus/meaningful boundaries without adding a dependency.

## 21. Data and persistence analysis

Inspection supports **Migration: none**.

`storage.js` remains a direct, single static load in `index.html`; `await window.CompassoStorage.ready('compasso.app.v1')` remains in place. `compasso-db` remains version 1 with its existing stores. `state-foundation.js`, base normalization, `dailyPlans`, sessions, Journal, Notes, JSON export/import, Markdown export/vault behavior, localStorage compatibility keys, and Drive modules are unchanged.

No lifecycle operation uses `indexedDB.deleteDatabase`, `localStorage.clear`, `localStorage.removeItem` for product state, or application save APIs. The only new sessionStorage key is isolated bootstrap attempt metadata and contains no product/user content. It is not exported or restored.

Data-sensitive files inspected and explicitly Frozen are `storage.js`, `state-foundation.js`, current feature modules, persistence tests, and backup/vault paths in `index.html`. `index.html` is in the writable manifest only for static bootstrap/support/lifecycle wiring; its state, CRUD, backup, import, and Markdown code blocks are frozen by responsibility and must be unchanged in review.

If Build finds any need to change an IndexedDB version/store, product localStorage key/value, collection normalization, backup schema, Markdown format, or Drive persistence, it must stop and use `$sdd-iterate`.

## 22. Performance analysis

- Static loading adds no new network asset for lifecycle coordination because `bootstrap-diagnostics.js`, `app-ui.css`, `design-system.css`, and `app-manifest.js` are already in the shell asset list. New `app-composition.js` is one small cached local asset used by the worker/Node, not the page.
- The raw DOM adds one compact bootstrap region and dialog. The hidden legacy shell already exists; no duplicate application DOM is created.
- Controlled fast path uses one `MessageChannel` round trip and no polling, cache enumeration, explicit update check, or reload.
- Worker navigation still reads the manifest module set, as today, but uses one pure candidate build and validation pass. Exact sentinel scans are linear in composed HTML size. No parser dependency is added.
- Cache enumeration occurs only at activation and confirmed shell reset, not startup or update-button interaction.
- First visit/raw recovery and actual update use at most one application-owned reload; stable controlled startup/no-update use zero.
- Offline startup has no generation network call. All required support and composition assets remain precached.
- Browser lifecycle tests remain sequential (`workers: 1`) to avoid origin/cache-generation races.

## 23. Security and privacy analysis

- No telemetry, remote service, backend, credential, OAuth, account, or cross-origin data flow is added.
- The generation handshake contains only allow-listed message types, an ephemeral request ID, and manifest cache generation. It carries no user data or source text.
- Worker message handling replies only through the transferred port and does not expose cache contents.
- Composition diagnostics use allow-listed codes and manifest-relative file names; response headers never include local state or raw source.
- Reset targets exact same-scope registrations and cache names passing the strict predicate. Ambiguous/unrelated caches are preserved.
- Existing Google Drive UI/integration modules compose unchanged; validation requires no remote authentication or write.
- The bootstrap guard reduces accidental interaction with an incomplete legacy UI over live local data.

## 24. Exact closed file manifest

Build is authorized to touch only the 14 implementation/test/document files below plus its required Build report and status-only metadata in this Design. Every other repository file is Frozen. No deletes are planned.

### 24.1 Product and durable documentation

| Classification | Path | Exact purpose/responsibility | Requirements / ACs |
| --- | --- | --- | --- |
| Modify | `app-manifest.js` | Keep `cacheName` canonical; add semantic composition/support contract and strict cache-ownership predicate; add `app-composition.js` asset; final v69→v70 bump last. | RQ-01, 03, 05, 19, 25; AC-01, 07–12, 33, 43 |
| Create | `app-composition.js` | Pure shared slot/sentinel composition, exact validation, idempotency, structured failure codes; UMD/CommonJS. | RQ-03–05, 18, 26; AC-07–12, 30–32, 45 |
| Modify | `service-worker.js` | Import helper; install probe; cache-only atomic navigation composition; handshake response; strict cleanup; remove obsolete storage/support/loose-marker paths and misleading headers. | RQ-01, 03–05, 12–19, 21, 25; AC-01–03, 07–12, 23–34, 38, 43–45 |
| Modify | `index.html` | Static support/coordinator loads; exact slots; neutral bootstrap/reset markup; static guard attributes; delegate update action; remove timer/direct controller reload; preserve direct storage and all product behavior. | RQ-01–02, 06–17, 20–22, 25; AC-01–06, 13–29, 35–40, 43–45 |
| Modify | `bootstrap-diagnostics.js` | Become dedicated lifecycle coordinator while preserving diagnostic API; hybrid handshake; state machines; one reload owner/budget; retry/reset/focus/status behavior. | RQ-01–02, 06–17, 20, 22–23; AC-01–05, 13–29, 35–41 |
| Modify | `app-ui.css` | Scoped neutral bootstrap, status, actions, dialog, guard and responsive/accessibility presentation using existing primitives. | RQ-02, 22; AC-04–05, 15, 17, 29, 35, 39–40 |
| Modify | `docs/application-foundation.md` | Document canonical generation, composition/handshake contract, raw bootstrap invariant, reload owner, cache ownership, reset/offline behavior, and verified lifecycle commands. | RQ-24–26; AC-42–46 |

### 24.2 Test infrastructure and tests

| Classification | Path | Exact purpose/responsibility | Requirements / ACs |
| --- | --- | --- | --- |
| Modify | `scripts/compose-test-app.js` | Use shared composer; preserve journey fixture; generate full raw previous/current PWA fixtures with distinct manifest-derived test generations and byte-distinct workers. | RQ-03–05, 12, 18, 24–26; AC-07–12, 16–32, 42–45 |
| Create | `scripts/pwa-test-server.js` | Built-in Node loopback server for sequential production-like generation switching; test-only previous/current control endpoint; no dependency. | RQ-08–16, 24, 26; AC-16–29, 41–45 |
| Modify | `playwright.config.js` | Start existing journey server and the test-only lifecycle server; keep current projects/worker/retry behavior. | RQ-08–16, 22–24; AC-16–29, 35–43 |
| Modify | `tests/app-manifest.test.js` | Assert generation/API distinction, ownership predicate cases, composition contract/assets, and final v70 visible derivation. | RQ-01, 03, 19, 24–26; AC-01, 07–08, 33, 42–45 |
| Modify | `tests/service-worker-composition.test.js` | Replace narrow loose-marker expectation with LF/CRLF, 51-module exact/order/idempotency/collision/failure/header/install/cache-cleanup/message tests using manifest-derived counts. | RQ-01, 03–05, 18–19, 24–26; AC-01, 07–12, 30–34, 42–45 |
| Modify | `tests/bootstrap-recovery.test.js` | VM/static lifecycle tests for one reload owner, guard semantics, no-update/update states, retry/reset scope, and persistence-prohibited APIs. | RQ-06–14, 19–22, 24–26; AC-13–26, 33–40, 42–45 |
| Create | `tests/browser/pwa-lifecycle-flows.spec.js` | Production-like raw/controlled/update/offline/recovery/reset/accessibility evidence on the lifecycle origin. | RQ-01–25; AC-01–05, 13–44 |

### 24.3 SDD workflow output

| Classification | Path | Exact purpose/responsibility | Requirements / ACs |
| --- | --- | --- | --- |
| Create | `.sdd/reports/pwa-version-convergence/BUILD_REPORT.md` | Record command output, source/Node/browser/manual evidence attribution, all 46 results, diff scope, residual risks, and Build gate. | RQ-24; AC-41–46 |
| Modify (metadata only) | `.sdd/features/pwa-version-convergence/DESIGN.md` | Build may update phase/status/revision metadata and append a design-conformance note only as required by `$sdd-build`; architecture/content changes require Iterate. | Workflow gate; AC-42, 45–46 |

### 24.4 Explicit Frozen guardrails

The following inspected files are explicitly Frozen during Build; they are exercised by validation but not edited:

| Classification | Paths | Reason |
| --- | --- | --- |
| Frozen | `.sdd/features/pwa-version-convergence/BRAINSTORM.md`, `.sdd/features/pwa-version-convergence/DEFINE.md` | Authoritative upstream artifacts after this Design status update. |
| Frozen | `storage.js`, `state-foundation.js`, `feature-runtime.js`, `app-services.js` | Direct storage, schema/state normalization, and runtime contracts remain unchanged. |
| Frozen | `today-feature.js`, `drive-sync-feature.js`, `drive-reconcile-feature.js`, `design-system-feature.js`, `design-system.css` | No Today, Drive, or design-system redesign. |
| Frozen | `docs/storage-foundation.md`, `docs/today-feature.md`, `docs/markdown-vault-io.md` | No storage, Today, or vault contract changes. |
| Frozen | `package.json`, `package-lock.json`, `.github/workflows/browser-tests.yml` | No dependency/script/test-framework/CI change is required. |
| Frozen | `tests/storage-quota.test.js`, `tests/state-foundation.test.js`, `tests/feature-runtime.test.js` | Existing data/runtime regression evidence is reused unchanged. |
| Frozen | `tests/browser/foundation-flows.spec.js`, `tests/browser/journal-flows.spec.js`, `tests/browser/critical-flows.spec.js`, `tests/browser/design-system-flows.spec.js`, `tests/browser/information-architecture-flows.spec.js` and existing snapshot PNGs | Existing product regression and snapshot evidence is reused; snapshots are not updated blindly. |

**Closed-manifest count:** 16 authorized Build-touched files: 7 product/durable-documentation files, 7 test/infrastructure files, 1 Build report, and 1 status-only Design metadata file. There are 0 deletes. The explicitly listed Frozen groups are guardrails; all unlisted files are also Frozen by default. If another file becomes necessary, Build must stop and invoke `$sdd-iterate` before editing it.

## 25. Implementation sequence

1. Add `app-composition.js`, semantic contract fields/tokens in the manifest, and raw slots in `index.html`, without changing the cache generation.
2. Convert `service-worker.js` composition to the shared helper; add install probe and structured success/failure; remove loose markers, network mixing, obsolete storage/support injection, and false headers.
3. Extend composition/manifest Node tests for LF/CRLF, all manifest modules, sentinels, collision, idempotency, failures, worker message, and cache predicate. Run `npm test` and `npm run build:test` at this non-release checkpoint.
4. Constrain activation cleanup with the manifest predicate and prove unrelated cache/persistence preservation in Node.
5. Add static support loads, guarded raw markup, and bootstrap CSS. Expand `bootstrap-diagnostics.js` into the coordinator with hybrid handshake and controlled fast path.
6. Replace update timer/startup forced check, direct `controllerchange` reload, and destructive diagnostic Retry with coordinator signals and the shared session guard.
7. Add confirmed last-resort reset, precise focus/status behavior, and failure taxonomy tests.
8. Refactor `compose-test-app.js`, add production-like two-generation fixtures/server, configure the second Playwright server, and add lifecycle browser scenarios.
9. Run lifecycle browser validation including first visit, update/no-update, races/budget, hard-bypass where automatable, controlled/raw offline, persistence, reset, keyboard, viewport, zoom, and media behavior. Inspect failures/traces; do not update snapshots blindly.
10. Run existing product regression suites through `npm run test:all`; confirm direct storage, all features, Drive UI, backup/restore, and offline local-first behavior.
11. Only after steps 1–10 pass, bump the canonical product generation once from `compasso-pages-v69` to `compasso-pages-v70`, update exact assertions/documentation, and regenerate fixtures. No product lifecycle evidence from a shared installed origin is accepted before this bump because same-name cache replacement could mix evidence.
12. Run `npm test`, `npm run build:test`, `npm run test:browser`, and `npm run test:all` against the final v70 sources; perform required installed-PWA manual validation with explicit observer attribution; reconcile all ACs in `BUILD_REPORT.md`.

Intermediate states before Step 11 are development-only and not releasable: the new worker/HTML/helper must never be published under v69. A candidate is not runnable/release-valid until composition, lifecycle, offline, and regression evidence passes with the final generation.

## 26. AC-01–AC-46 traceability

This table maps every unchanged acceptance criterion from DEFINE revision 1. “Rollback” identifies the safe component boundary; it does not weaken the criterion.

| AC | Implementation component and planned file(s) | Validation method / evidence | Rollback relevance |
| --- | --- | --- | --- |
| AC-01 | Manifest `cacheName`; composition meta; worker message in `app-manifest.js`, `app-composition.js`, `service-worker.js`, `bootstrap-diagnostics.js` | Node identity tests + browser marker/controller/cache-generation assertion | Revert handshake/coordinator together; never leave marker-only success. |
| AC-02 | Coordinator mismatch transition and guarded reload in `bootstrap-diagnostics.js` | Browser stale document/controller fixture reaches matching G within count | Revert lifecycle as one unit; mismatch must fail closed. |
| AC-03 | Composition failure and budget-exhausted states in helper/worker/coordinator | Node malformed/missing cases + browser exhausted guard/current-app retention | Roll back failed generation forward; preserve last valid app/data. |
| AC-04 | Static `hidden inert aria-hidden` app shell and bootstrap guard in `index.html`/`app-ui.css` | Browser raw DOM, focus, pointer and accessibility checks | Guard attributes and reveal code revert together. |
| AC-05 | Semantic bootstrap status/Retry in index/coordinator/CSS | Playwright readable raw pending/failure + explicitly attributed manual observation | Keep raw shell inert if UI styling/logic regresses. |
| AC-06 | Boundary documented in Design/Build report | Source/static evidence that no app code can run in no-resource state | No code rollback; prevent false failure accounting. |
| AC-07 | Manifest-derived sentinel block in helper/worker | Node count from `manifest.modules` = every module once/in order | Revert helper/worker together, not individual module files. |
| AC-08 | Manifest support prerequisites/static loads/direct storage validation | Node exact support/storage counts + existing storage regressions | Static support/validation revert together; storage stays direct. |
| AC-09 | Candidate validation and success-marker/header gating | Node missing/duplicate/order/malformed tests assert no success identity | Failed candidate never activates; forward-fix generation if published. |
| AC-10 | Newline-independent exact tokens/shared helper | Paired LF/CRLF Node fixtures with equal semantic result | Helper is single rollback boundary. |
| AC-11 | File-path sentinels ignoring loose markers | Node fixture where earlier source mentions later global/path name | Never restore `html.includes(module.marker)`. |
| AC-12 | Exact idempotency validation | Node valid second composition unchanged; overlap text not presence | Revert composer atomically. |
| AC-13 | Sole `requestReload`; update/controller/retry delegation in coordinator/index | Static search for one reload call + browser concurrent-signal count | Remove all direct callers together on rollback. |
| AC-14 | Session guard keyed G/reason/path + in-memory latch | VM guard unit cases + browser navigation counter ≤1 | Guard and state machine are coupled rollback boundary. |
| AC-15 | Budget-exhausted persistent Retry | Browser forced repeat proves no loop and keyboard-accessible Retry | Failure must remain inert even if auto-recovery disabled. |
| AC-16 | First-visit state machine, install probe, claim, one reload | Pristine lifecycle-origin Playwright test | Disable candidate/forward fix if published; never reveal raw. |
| AC-17 | Registration/install failure states and non-destructive Retry | Browser server failure + storage snapshots unchanged | Current coherent app/raw guard remain safe fallback. |
| AC-18 | Controlled handshake fast path | Browser controlled reload counter 0 | Coordinator can be reduced to fail-closed guard during rollback. |
| AC-19 | Persistent browser context reopen/local marker state | Playwright context/page reopen with stored state, reload counter 0 | User storage unchanged across code rollback. |
| AC-20 | Same fast path/offline cache for installed Chromium PWA | Explicitly attributed Chrome/Edge installed-PWA online/offline close/reopen | Manual gap blocks Ship; no claim from Playwright alone. |
| AC-21 | Raw recovery state and reason budget | Chromium bypass simulation where supported + user-observed attribution where required | No bypass interception; failure remains Retry. |
| AC-22 | Update action no-candidate branch | Browser `registration.update()` no-update test, 0 reload, app usable | Revert UI delegation only with coordinator/update tests. |
| AC-23 | `updatefound`/worker states/in-flight coalescing | VM lifecycle tests + browser delayed install/waiting transition; no timer success | Keep current G visible on rollback/failure. |
| AC-24 | Controller G2 signal and one update reload | Two-generation browser fixture + installed-PWA manual where necessary | Published rollback requires forward G, not old cache reuse. |
| AC-25 | Update error state retains coherent G1 | Server-induced update/install failure; caches/state/app remain | Old active worker/cache are recovery boundary. |
| AC-26 | One display-mode-independent controller listener | Static assertion + browser tab + explicitly attributed installed-PWA observation | Never reinstate standalone direct reload. |
| AC-27 | Current-cache-only full composition/offline fast path | Full-production Playwright offline reload + installed-PWA manual; existing Journal offline regression | Forward-fix broken published cache; data stores remain independent. |
| AC-28 | Offline raw query and one controlled recovery | Lifecycle browser origin offline-after-cache raw fixture, count ≤1 | Raw Retry remains if recovery disabled. |
| AC-29 | Offline raw unavailable failure UI | Browser no-usable-path fixture; no unregister/cache/data calls | No destructive rollback required. |
| AC-30 | Exact slot/support checks and failure headers | Node missing slot/support fixtures; no marker/generation header | Install rejection retains prior generation. |
| AC-31 | Structured failure codes for ambiguity/module/order/malformed cases | Table-driven Node tests inspect exact allow-listed codes | Helper rollback atomic; no partial repair. |
| AC-32 | Install probe and coordinator current-app/raw failure branches | Node install failure + browser update/current G retained and raw neutral case | Prior cache/worker is explicit rollback anchor. |
| AC-33 | Strict manifest cache predicate used by activation | Node predicate matrix + browser unrelated-cache byte comparison | Preserve ambiguous caches; forward fix over broad cleanup. |
| AC-34 | Cleanup contains no persistence APIs and retains current cache | Static source checks + browser IDB/localStorage/cache state before/after | Data needs no recovery/migration. |
| AC-35 | Separate reset action/dialog/confirmation in index/coordinator/CSS | Playwright visibility, copy, initial focus, no API before confirm + user observation | Hide/disable reset if shell logic regresses; Retry remains. |
| AC-36 | Dialog cancel/Escape no-op | Browser registration/cache/IDB/localStorage snapshots and focus return | No mutation means no rollback work. |
| AC-37 | Exact-scope unregister + predicate deletion + rebootstrap | VM/static scope tests + browser success/partial-failure/storage snapshots | Re-register/forward generation; persistence untouched. |
| AC-38 | Frozen storage/state/feature contracts; index data blocks unchanged | Complete diff review + existing storage/state/backup/Journal regressions | Migration none; code rollback cannot require data recovery. |
| AC-39 | Native controls/status/dialog/focus management | Playwright Tab/Shift+Tab/Enter/Space/Escape, names, live status, focus return + installed manual if needed | Bootstrap remains operable even if enhanced feature UI absent. |
| AC-40 | Scoped CSS, guard, responsive/zoom/media/contrast targets | Playwright 360, 200% zoom, coarse geometry, reduced motion/contrast media plus inspected visual/manual evidence | Revert scoped CSS without touching global design system; keep guard. |
| AC-41 | Evidence matrix covers Chrome/Edge/Chromium PWA and bounded exclusions | Build report evidence-category review | Missing mandatory manual evidence blocks Ship, not code safety. |
| AC-42 | Existing verified commands and attributed evidence report | Command output in Build report; explicit Codex/manual/user-observed labels | No invented command; incomplete evidence returns to Build. |
| AC-43 | Existing manifest/features/routes/product regressions | `npm run test:all`, 51-module Node test, current browser suites, diff review | Roll back foundation files only; feature/data files Frozen. |
| AC-44 | Drive modules unchanged and composed once | 51-module source/static/Node proof + local Drive UI smoke; no OAuth/write | Drive files Frozen. |
| AC-45 | Closed manifest/no dependencies/generic rewrite | Diff/manifest review; package/CI Frozen | Out-of-manifest need triggers Iterate. |
| AC-46 | Independent feature/Ship/publication boundary | Build and future Ship artifact review | No code coupling to Today; publication remains separate authorization. |

**Traceability result:** 46/46 criteria mapped; 0 unmapped, 0 weakened.

## 27. Existing tests reused

| Existing file/command | Evidence retained |
| --- | --- |
| `tests/storage-quota.test.js`, `tests/state-foundation.test.js` | IndexedDB/localStorage/state compatibility and no migration regression. |
| `tests/feature-runtime.test.js` | Ordered feature installation/health remains compatible. |
| `tests/today-central-contract.test.js` and model tests discovered by `tests/*.test.js` | Existing Today and domain contracts remain unchanged. |
| `tests/browser/foundation-flows.spec.js` | Composed runtime/services/diagnostics and 360px foundation health. |
| `tests/browser/information-architecture-flows.spec.js` | Current routes/navigation remain. |
| `tests/browser/journal-flows.spec.js` | Journal and existing offline local-state flow. |
| `tests/browser/critical-flows.spec.js` | Current critical flows, backup/restore and persistence behavior. |
| `tests/browser/design-system-flows.spec.js` | Existing visual/component/focus contracts and snapshots; snapshots are inspected, not blindly regenerated. |
| `npm run test:all` | Full Node plus Playwright regression on CI and locally. |

These tests do not replace new lifecycle evidence; they prove preservation.

## 28. Tests created or modified

### Modified Node/static tests

- `tests/app-manifest.test.js`: generation/API distinction, strict owned/unowned cache cases, semantic contract/support entries, asset uniqueness, helper inclusion, v70 visible version derivation.
- `tests/service-worker-composition.test.js`: table-driven pure composition and worker VM coverage for LF, CRLF, exact 51-module manifest-derived count/order, similarly named/mentioned modules, duplicate/idempotent behavior, missing/ambiguous slot, missing support/module, wrong order/malformed result, no false success headers/marker, install rejection, message response, and unrelated-cache preservation. The existing test cannot prove these because it asserts only capture/Journal source positions and one header.
- `tests/bootstrap-recovery.test.js`: VM/static coordinator coverage for one reload call site, attempt-key construction/reset/exhaustion, no-update, lifecycle state transitions/coalescing, controller signaling, retry/reset scope/cancel/failure, and forbidden persistence APIs. Existing regex tests encode the old standalone/timer/destructive design and must be replaced.

### New browser test

`tests/browser/pwa-lifecycle-flows.spec.js` uses the second loopback origin and generated full-production generations. Scenarios are:

1. pristine first visit: raw bootstrap inert, install/claim, ≤1 reload, coherent marker/controller;
2. raw failure/registration failure: readable Retry, no legacy interaction/data deletion;
3. controlled reload and persistent-context reopen: direct coherent/0 reload/local state;
4. no update: current status/0 reload/app usable;
5. previous→current actual update: real updatefound/states/controller transition/≤1 reload/G2 coherence;
6. competing clicks and controllerchange race: one update operation/one reload;
7. forced reload-budget exhaustion: stable Retry/no loop;
8. hard-bypass/uncontrolled raw path where Chromium DevTools routing can reproduce it, with explicit limitation if the browser owns irreducible behavior;
9. controlled full-production offline reload;
10. raw recoverable offline and raw unavailable offline paths;
11. update/install failure while G1 remains coherent;
12. unrelated cache preservation through activation;
13. shell reset hidden/offer, dialog confirmation, Cancel/Escape no-op, exact-scope success and partial failure;
14. IDB/localStorage/backup-relevant state snapshots before/after retry/reset;
15. keyboard/focus/live-region semantics, 360px/no overflow, 200% zoom, coarse targets, reduced motion/increased contrast, and inert legacy shell.

The test-only server is necessary because the existing static precomposed fixture cannot switch worker/manifest generations or induce lifecycle failures. It uses only Node core APIs and remains isolated under `.test-dist`, which is already ignored.

### Manual evidence

Build must request/record, without claiming Codex performed it:

- installed local Chrome PWA close/reopen online on final v70;
- the same installed PWA close/reopen offline from a confirmed complete cache;
- installed Microsoft Edge/Chromium PWA update/controller behavior where Playwright cannot faithfully reproduce installation chrome/window lifecycle;
- any hard-bypass or increased-contrast observation that automation cannot genuinely establish.

Each record must name the evidence source as manual installed-PWA or user-observed manual validation and include setup, observed result, and limitation. No screenshot, browser version, OS, device, or timestamp may be invented.

## 29. Exact validation commands

Only repository-supported commands are normative:

```text
npm test
npm run build:test
npm run test:browser
npm run test:all
```

Their definitions remain unchanged in `package.json`. Narrow development execution may use the existing underlying runner with a real file, for example `node --test tests/service-worker-composition.test.js` or `npx playwright test tests/browser/pwa-lifecycle-flows.spec.js --project=chromium`; these are direct invocations of already installed/configured tools, not new npm scripts. Final evidence must include the four normative commands, with `npm run test:all` passing after the v70 bump.

Repository hygiene checks for Build are `git diff --check`, `git status --short`, and complete diff review. They are checks, not invented application validation scripts.

## 30. CI impact

No CI file change is required. `.github/workflows/browser-tests.yml` already installs Node 22 dependencies, installs Chromium, and runs `npm run test:all` for pull requests and manual dispatch. Node discovers modified `tests/*.test.js`; Playwright discovers the new `tests/browser/*.spec.js`; the updated config starts both local servers. `workers: 1` remains important for deterministic shared generation switching. `package.json` and lockfile stay Frozen.

## 31. Migration status

**Migration: none.**

No database version/store, persistence schema, user collection, localStorage product key, backup/restore shape, Markdown format, Drive data, normalization, or legacy-data contract changes. The v69→v70 change is an application shell/cache generation only.

## 32. Rollback strategy

### Before publication

All product changes can be reverted together to baseline without data migration. The new helper/test files can be removed, and the six modified product files plus documentation/tests restored. Because user persistence is untouched, no data recovery is needed. A partial revert that restores the old worker while leaving guarded raw markup or restores old raw markup while leaving the new coordinator is prohibited; manifest, helper, worker, index, coordinator, and bootstrap CSS are one release unit.

### After a worker has activated

Rollback is a **forward fix**, not reuse of v69. Reverting source to an older cache name can confuse clients already controlled by v70, cause the older name to be treated as stale, and cannot reconstruct caches already deleted on activation. The recovery release must:

1. restore known-good code behavior in source;
2. advance to a new owned generation (normally v71 or later, selected from then-current source of truth);
3. precache and pass the install composition probe before activation;
4. let current clients receive the lifecycle-derived controller transition and at most one guarded reload;
5. retain user IndexedDB/localStorage/backup/vault data throughout.

If v70 visually/composition-fails after activation, users with an already coherent document keep it where possible; raw/next navigation receives neutral retry rather than a partial app. A separately authorized emergency publication of the forward generation is required—code rollback in Git alone does not update installed clients.

Shell reset is not the normal rollback mechanism. It is an explicit user recovery for a persistently broken registration/cache and still preserves data.

## 33. Foundation-only publication checks

After Build passes and independent `$sdd-ship` closes this feature, a separately authorized foundation-only publication requires:

- final v70 manifest/worker/index/helper asset consistency;
- 46/46 Ship reconciliation with clearly attributed installed-PWA/manual evidence;
- `npm run test:all`, diff hygiene, and closed-manifest confirmation;
- local Chrome and Edge/Chromium installed-PWA online/offline close/reopen;
- first-visit, no-update, real-update, hard-bypass recovery, reload-budget, and rollback readiness evidence;
- hosting asset/cache headers checked against the static architecture;
- an explicit publication authorization and scope.

Today reconciliation is not a prerequisite and is not included. Ship itself does not deploy or publish.

## 34. Risks and mitigations

| Risk | Likelihood | Impact | Mitigation/evidence |
| --- | --- | --- | --- |
| Raw guard is not removed after valid coherence | Medium | High | Hybrid fast-path browser tests, fail-readable bootstrap, exact reveal operation. |
| Raw legacy shell becomes focusable/interactive | Low | High | Static triple guard, raw pointer/tab/accessibility tests at first paint and failure. |
| Composition helper accepts partial/duplicate/order-invalid source | Low | Critical | Exact slots/sentinels, install probe, table-driven failure tests, marker added last. |
| Worker/cache/document generation falsely match | Low | Critical | Cache-only composition plus hybrid query; no marker/header on failure. |
| Update/controller signals cause double reload | Medium | High | One call site, synchronous in-memory latch, reason/generation/path session guard, race test. |
| `skipWaiting()` transition is too fast for waiting-state assumptions | High | Medium | Observe all actual worker states; never require stable waiting; controller identity ends update. |
| New activation deletes unrelated caches | Low | High | Strict regex predicate, ambiguous preserve default, Node/browser cache matrix. |
| Install probe deletes/replaces last valid package | Low | High | Probe current candidate before `skipWaiting`; failed candidate cache cleanup only; previous worker remains. |
| Same v69 name used during development yields mixed evidence | Medium | High | Fixture generations until final bump; v70 bump only after pre-bump validation; rerun all final commands. |
| Reset harms persistence or scope | Low | Critical | Exact registration scope/predicate, explicit confirmation, forbidden API tests, before/after browser snapshots. |
| Bootstrap UI accessibility/contrast regression | Medium | Medium | Existing primitives, keyboard/geometry/media/contrast checks and manual visual inspection. |
| Lifecycle server becomes production architecture | Low | Medium | Test-only `scripts/`, Node core, `.test-dist`, no manifest/production reference. |
| Existing precomposed browser journeys behave differently after guard | Medium | Medium | Shared helper, journey fixture lifecycle compatibility, full existing Playwright regression. |
| Missing automated installed-PWA fidelity | High | Medium | Explicit manual installed-PWA evidence required; attribution prevents false automation claims. |
| Service Worker rollback assumed automatic | Medium | High | Forward-generation rollback documented and tested through two-generation fixture. |
| Accidental Today/Drive/storage change | Low | High | Closed manifest, explicit Frozen files, complete diff review, regressions. |

## 35. Non-goals

- Today typography/readability, CTA hierarchy, card layout, or `today-readability-pass` history;
- Notes/Learning Loop or navigation redesign;
- schema/data migration, storage redesign, backup/vault format change, or user-data reset;
- Drive integration/OAuth redesign or remote authentication/write validation;
- global design-system redesign;
- backend, account system, telemetry, remote service, framework, dependency, production build architecture, or new test framework;
- generic Service Worker rewrite or restoration/copying of historical v20/v21 mechanisms;
- Firefox/Safari acceptance expansion;
- deployment, publication, commit, push, merge, or upstream alignment.

## 36. Design assumptions

Verified assumptions:

- local branch/baseline are `codex/pwa-version-convergence` at `922b6c8dc12046a5bc3524ef9aee042411c933ab`;
- current generation is v69 and exact owned naming can safely distinguish numeric Compasso caches;
- manifest owns all 51 production modules/assets/order;
- raw index directly loads storage and no worker storage injection is required;
- current browser/Node/CI infrastructure can host a second local server without dependency/script changes;
- static support files are already assets and can be referenced by raw index;
- current state/persistence/backup contracts require no change;
- Chrome/Edge/Chromium support the required Service Worker, MessageChannel, sessionStorage, inert, and dialog mechanisms in the defined scope.

Bounded assumptions for Build validation:

- the existing journey fixture can continue to run after it adopts shared composition and handshake; full `test:all` must prove this before the bump;
- Chromium automation can reproduce most hard-bypass/uncontrolled cases; any irreducible browser-chrome behavior receives explicitly attributed manual evidence rather than an invented automated claim;
- actual color pairs in scoped bootstrap CSS can meet existing contrast requirements without changing global tokens.

None is a blocking open decision.

## 37. Iterate triggers

Build must stop and invoke `$sdd-iterate` before editing if any of these becomes true:

- `cacheName` cannot reliably serve as canonical generation or a second version identity is required;
- a reliable controller/cache handshake requires user data, network access, polling, or a second lifecycle owner;
- exact composition requires modifying any of the 51 feature modules;
- direct storage loading cannot remain exactly once or any storage/schema/backup/vault change is required;
- the strict cache predicate cannot distinguish application caches without risking unrelated caches;
- raw bootstrap cannot be made inaccessible with static guard plus current browser support;
- a new dependency, backend, production build architecture, test framework, CI workflow change, or unlisted file is required;
- current Drive/Today/product behavior must change to satisfy convergence;
- Playwright cannot provide required non-installed-browser evidence and no valid manual evidence class exists;
- final cache bump cannot be isolated after composition/lifecycle validation;
- rollback cannot proceed through a new forward generation without data risk;
- any DEFINE requirement/AC would need reinterpretation, omission, or weakening.

## 38. Design quality gate

| Gate | Result |
| --- | --- |
| All 26 requirements implemented in the plan | Pass |
| AC-01–AC-46 mapped with component, file, evidence, rollback | Pass — 46/46 |
| One reload owner selected | Pass — `CompassoPwaLifecycle` in `bootstrap-diagnostics.js` |
| Coordinator location selected | Pass — Option B, existing diagnostic file statically loaded |
| Generation and controller verification concrete | Pass — manifest `cacheName`, DOM marker, MessageChannel query |
| Composition identity/success concrete | Pass — manifest-file sentinels, exact slots, install/navigation validation |
| LF/CRLF solution concrete | Pass — newline-independent semantic tokens/shared helper |
| Cache predicate/reset scope concrete | Pass — exact numeric owned-name regex and exact registration scope |
| Closed files/tests/commands known | Pass — 16 authorized Build-touched files; four verified commands |
| Migration and rollback viable | Pass — none; unpublished revert or published forward generation |
| Unresolved critical decision | None |
| Requirement weakened | None |

**Design result: PASS — Ready for Build.**

## 39. Build handoff

The exact next valid skill is `$sdd-build` for `pwa-version-convergence` using this Design revision 1 and DEFINE revision 1. Build must honor the 16-file closed manifest, preserve all Frozen files, perform the v70 bump only after pre-bump composition/lifecycle/offline/regression validation, and stop for Iterate if any Section 37 trigger occurs.

Design does not authorize implementation, commit, staging, push, deployment, publication, upstream alignment, Today work, or historical SDD modification.
