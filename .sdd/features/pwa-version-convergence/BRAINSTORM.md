# Brainstorm: PWA version convergence

**Feature:** `pwa-version-convergence`
**Phase:** 0 — Brainstorm
**Status:** Complete (Defined)
**Baseline:** `origin/main@922b6c8dc12046a5bc3524ef9aee042411c933ab`
**Branch:** `codex/pwa-version-convergence`
**Selected direction:** Alternative B — raw bootstrap guard plus lifecycle convergence
**Composition direction:** stable semantic anchor and dedicated composition sentinels
**Publication recommendation:** foundation-only publication is technically preferable after independent Build and Ship, but remains unauthorized pending an explicit user decision

> The skill's referenced `templates/BRAINSTORM_TEMPLATE.md` is absent. This artifact uses the 38-section structure mandated for this initiative and preserves the same Brainstorm quality gate.

## 1. Problem statement

The current Compasso delivery path does not guarantee that every supported entry or update path reaches the same application structure and version. A raw, uncontrolled `index.html` can remain visible and usable as an older base application, while a Service Worker-controlled navigation receives a much larger manifest-composed application. The two documents use the same local data but expose materially different navigation, features, styling, diagnostics, and behavior.

The problem is therefore broader than cache invalidation. Compasso needs a bounded convergence contract across document composition, Service Worker control, cache generation, update lifecycle, failure handling, and offline recovery. The current local-first data model must remain independent of that delivery correction.

The primary user is a person opening Compasso in a normal browser tab or installed PWA, online or from a previously complete offline cache. Success means that supported paths reveal one coherent current application, or a readable retryable bootstrap/failure surface when convergence cannot safely complete. A raw legacy shell must not persist as a competing current application.

The user supplied complete discovery inputs for problem, users, constraints, observable success, strategic sequence, and architectural principle. No redundant discovery question is required before selecting a direction.

## 2. User-visible failure modes

Verified or directly implied current failure modes are:

- a first visit in a normal browser can remain on the raw “Visão geral” shell until a later navigation or reload;
- a hard/bypass navigation can display that same raw shell even when a valid active worker and cache exist;
- the raw shell labels itself `Compasso v69`, so the visible version label does not reveal that the current modules were never composed;
- the raw shell exposes five legacy destinations (`Visão geral`, `Leituras`, `Estudos`, `Metas`, `Notas`) instead of the current five-area information architecture (`Hoje`, `Frentes`, `Journal`, `Revisão`, `Mais`);
- raw mode lacks the 51 manifest modules, current feature runtime, support CSS, design-system CSS, bootstrap diagnostics, Today central, current IA, and the other composed features;
- raw mode can still read and mutate the same local state, increasing the risk that a user interprets the incomplete interface as the current product;
- “Verificar atualização” always announces a reload and schedules one after about 900 ms, including when no update exists;
- an update may reload before a candidate becomes the controller, while an installed-PWA `controllerchange` can schedule another reload;
- composition failures can return an incomplete document while response headers still claim successful composition and per-module presence;
- a current Windows checkout can fail to compose every feature because literal LF-only anchors do not match CRLF source;
- even on LF input, the current loose marker check skips `weekly-plan-model.js` after `today-feature.js` mentions `CompassoWeeklyPlanModel`.

## 3. Current architecture

The exact baseline is `922b6c8dc12046a5bc3524ef9aee042411c933ab`. It is static, framework-free, local-first, hosted by GitHub Pages, and has no production build process.

Current layer responsibilities are:

- `app-manifest.js`: authoritative cache name, 64 shell assets, 51 ordered modules, required/browser-journey metadata, 28 collections, and application contracts;
- `service-worker.js`: install, activation, cache-first assets, navigation interception, support-asset insertion, manifest-module text composition, and offline navigation responses;
- raw `index.html`: legacy/base markup and CSS, direct storage bootstrap, base render/state behavior, Service Worker registration, install/update controls, and the current `controllerchange` handler;
- `bootstrap-diagnostics.js`: composed-document module diagnostics and an error recovery action;
- `storage.js`: IndexedDB version 1 plus bounded localStorage compatibility/fallback;
- `state-foundation.js`: schema version 2 normalization and collection merge behavior;
- `feature-runtime.js`: ordered hooks, commands, selectors, routes, services, delegated actions, render wrapping, and feature health after modules have been composed;
- `app-services.js`: current domain-service adapters after the runtime exists.

The feature runtime and state foundation are consumers of a successfully composed document. They do not currently decide whether the raw document, controller, or cache generation is coherent.

The clean worktree contains no `.codegraph/` directory. Repository instructions therefore require normal source inspection; no CodeGraph index was generated.

## 4. Manifest and cache ownership

`app-manifest.js` is the single source of truth for the application package:

- `cacheName`: `compasso-pages-v69`;
- manifest API `version`: `1`;
- 51 ordered modules, with only `state-foundation.js`, `feature-runtime.js`, and `app-services.js` flagged `required`;
- 37 browser-journey modules used by the current test composer;
- 64 unique application-shell assets;
- 28 state collections.

`service-worker.js` correctly imports this manifest and derives both `CACHE_NAME` and `APP_SHELL`; historical Service Worker-owned cache constants or hardcoded module lists are obsolete.

Installation opens the current named cache, runs `cache.addAll(APP_SHELL)`, and only then calls `skipWaiting()`. Activation deletes every origin cache whose name is not the current cache, then calls `clients.claim()`. The installation ordering prevents activation after a rejected shell fetch, but activation's deletion filter is broader than Compasso-owned caches and old application caches are not retained for automatic rollback.

The response header `x-compasso-composition: manifest-v1` reflects the manifest API version, not cache generation v69. Per-module response headers are always set to `v1`, even if injection was skipped. These headers therefore do not prove document/controller/cache coherence.

## 5. Raw document behavior

Raw `index.html` contains a complete-looking legacy/base application rather than a neutral bootstrap:

- inline legacy CSS and markup render immediately;
- the initial route is `overview`, with the “Visão geral” hero and legacy sidebar;
- `storage.js` is loaded directly and awaited before base state initializes;
- base CRUD, JSON backup/restore, and local state behavior can operate without the manifest features;
- `app-manifest.js`, `bootstrap-diagnostics.js`, `app-ui.css`, and `design-system.css` are absent from raw HTML;
- the manifest modules are absent;
- the displayed version falls back to the hardcoded v69 string when the manifest is absent;
- the page registers the worker only near the end of its module script, after the legacy shell is already present and rendered.

Consequently, raw mode is not merely a loading state. It is a materially different usable application operating over the same user data.

## 6. Controlled composed behavior

For a controlled navigation, `service-worker.js` obtains cached or network `index.html`, injects support assets before `</head>`, and attempts to inject every manifest module before the base `renderAll()` bootstrap point. Each injected source is wrapped with bootstrap diagnostic start/done calls.

On Git's LF-normalized blob, the current process inserts code for 50 of the 51 manifest modules. `weekly-plan-model.js` is skipped because `today-feature.js`, which appears earlier, contains the same global identifier used as the later model's loose presence marker. The feature module contains a fallback builder, so the omission can be masked at runtime, but the manifest order/composition contract is not actually satisfied.

When the remaining modules run, `feature-runtime.js` installs ordered feature hooks and the current information-architecture and design-system modules transform the base shell into the current application. This is the only path that yields the full current product.

Current composition is not atomic in semantic terms:

- missing anchors silently return unchanged HTML;
- optional missing module code is silently omitted;
- a missing required module inserts a diagnostic statement instead of the module;
- support insertion can fail silently if its text anchor is absent;
- success/per-module headers are applied regardless of those outcomes;
- there is no DOM marker that becomes visible only after complete, ordered composition.

## 7. Current update lifecycle

The settings action “Verificar atualização” currently:

1. checks Service Worker and HTTP(S) availability;
2. obtains the current registration;
3. calls `registration.update()` if a registration exists;
4. announces “Atualização verificada · recarregando”;
5. schedules `location.reload()` after 900 ms.

It does not distinguish no update, installing, transient waiting, activating, controller transition, or failure. It neither observes `updatefound`/worker `statechange` nor waits for the expected controller. An exception can leave the action without clear failure feedback. Repeated clicks can initiate overlapping operations.

Page startup also calls `registration.update()` after registration and silently catches failure. This background check has no user-visible lifecycle state.

The selected direction is lifecycle-derived behavior: no update must not reload; installation/activation remains pending based on actual worker state; successful convergence ends only after the expected controller is active; and failure keeps the current coherent app usable with a clear retry.

## 8. Current `controllerchange` behavior

`index.html` registers one `controllerchange` listener, but reload behavior is restricted to standalone/installed-PWA display mode. It uses:

- an in-memory `refreshing` flag;
- `sessionStorage['compasso.sw.reload']` keyed to the document's expected cache string;
- direct `location.reload()`.

Normal browser tabs do not reload when a new worker claims them. In installed mode, the listener can reload independently of the update button's 900 ms timer. If the timer reloads before controller transition, the new page can later receive `controllerchange` and reload again. The current session guard does not coordinate first-visit, hard-bypass, update-action, bootstrap-recovery, and controller-transition paths under one owner.

## 9. First-visit behavior

On a pristine online origin, the current sequence is:

1. the network returns raw `index.html` because no worker controls the navigation;
2. direct storage and the legacy base application initialize;
3. the raw page renders “Visão geral”;
4. the page registers `service-worker.js?version=compasso-pages-v69`;
5. the worker caches the manifest shell, calls `skipWaiting()`, activates, deletes non-current caches, and calls `clients.claim()`;
6. `controllerchange` can occur on the open page;
7. a normal browser tab ignores it because the handler reloads only standalone mode.

The raw page can therefore remain indefinitely until the user performs another navigation/reload or closes and reopens. First visit does not currently guarantee convergence.

Desired direction: the raw document starts as a neutral hidden/inert bootstrap, registers and observes the worker, then the single coordinator performs at most one normal recovery navigation after control is available. It reveals the current application only when composition and controller/cache identity agree, otherwise it ends in a bounded retryable state.

## 10. Hard-bypass behavior

A navigation that deliberately bypasses Service Worker interception receives raw `index.html`. Application code should not attempt to defeat the browser's bypass semantics for that navigation.

Current raw code finds or registers the existing worker and requests an update, but an already-active worker may not transition state, so no `controllerchange` event is guaranteed. The page has no composed marker check and no raw bootstrap guard. It can therefore remain on the legacy shell even though the next normal navigation would be controlled and composed.

Desired direction: keep the raw shell unavailable, detect the absence of a valid composition marker/control relationship, locate a usable registration/cache through supported APIs, and request one ordinary controlled recovery navigation. A repeat for the same expected version must stop at a readable retry state rather than loop.

## 11. Offline behavior

Three cases must remain distinct:

### A. Controlled cached offline startup

Current behavior is supported when the complete v69 shell exists: the active worker serves cached raw HTML, composes it from cached modules, and the local storage layer remains available. The current Journal browser test proves an already controlled, precomposed test application can create state offline and retain it after reload. It does not prove first-visit or raw recovery lifecycle behavior.

Desired behavior is a complete composed application with matching document/controller/cache signal and no extra recovery reload.

### B. Raw document executing, then network unavailable

If an active registration and complete cache can serve the current version, the neutral raw bootstrap may attempt one normal controlled reload. If it cannot establish a usable controlled path, it must preserve local data and show an explicit offline/retry state. It must not expose the incomplete legacy shell or delete the worker/cache by default.

### C. No document, worker, cache, or network resource

No Compasso code can execute. The browser's own network failure surface is authoritative. Application-owned UI is not required in a state where no application resource can be delivered.

## 12. Recovery and data-safety behavior

`bootstrap-diagnostics.js` currently offers “Atualizar e tentar novamente.” When online, that action unregisters same-scope Service Workers, deletes every cache whose name starts with `compasso-pages-`, and reloads. Offline, it skips deletion/unregistration and reloads.

The recovery path does not clear IndexedDB, localStorage, or the JSON/Markdown data model. Nevertheless, removing the only offline-capable application shell can appear destructive and can leave the next navigation on the raw legacy application. There is no confirmation or explanation of what is and is not removed.

Selected direction:

- normal retry is non-destructive and lifecycle-aware;
- cache/registration removal is not a default automatic recovery step;
- any retained last-resort shell reset must be explicit, confirmed, scoped only to Compasso application caches/registration, online-aware, and state clearly that user data is preserved;
- activation and recovery must not delete unrelated same-origin caches;
- no recovery path touches IndexedDB, localStorage, JSON backups, Markdown data, or Drive state.

## 13. Composition and line-ending behavior

CRLF sensitivity is a confirmed current defect.

Measured evidence from the exact baseline:

| Source form | CRLF | Bare LF | Current feature anchor | Result |
| --- | ---: | ---: | --- | --- |
| Git blob | 0 | 1,254 | LF matches | Support assets plus 50 actual module wrappers; one model skipped by marker collision |
| Windows checkout (`core.autocrlf=true`) | 1,254 | 0 | LF does not match | Support assets inserted; zero manifest modules inserted |

The targeted current composition test fails on the Windows checkout because `capture-model.js` is absent from the result. `scripts/compose-test-app.js` duplicates the same LF-only bootstrap point, so local browser-test composition has the same fragility.

`integrateIndexedDb()` also contains historical LF-specific replacement strings, but current `index.html` already loads and awaits `storage.js`; the function returns immediately and does not own current storage startup. The obsolete injection mechanism must not be revived.

Loose module markers are a separate defect from line endings. The current `html.includes(module.marker)` test searches the whole progressively composed document; an earlier consumer can mention a later module's global identifier. This currently skips `weekly-plan-model.js`. Success headers still claim completion.

## 14. Existing test coverage

Verified repository commands are:

- `npm test` → `node --test tests/*.test.js`;
- `npm run build:test` → `node scripts/compose-test-app.js`;
- `npm run test:browser` → compose `.test-dist`, then run Playwright;
- `npm run test:all` → Node tests followed by Playwright.

Playwright uses current `@playwright/test` infrastructure with desktop Chromium and Pixel 7 projects, one worker, retained traces on failure, and a static test server. CI runs `npm run test:all` on pull requests and manual dispatch.

Existing relevant evidence includes:

- manifest module/asset uniqueness and selected order constraints;
- cache ownership fixed to current v69;
- one Service Worker composition test for capture and Journal ordering;
- source-pattern checks for worker registration, standalone `controllerchange`, session reload key, `registration.update()`, cache `addAll`, and recovery's non-deletion of local user storage;
- feature-runtime installation/health browser coverage;
- current composed UI and 360px overflow coverage;
- a controlled cached offline Journal create/reload path;
- backup/restore, IndexedDB/localStorage resilience, and state-foundation compatibility.

The browser suite runs against `.test-dist/index.html`, which is precomposed with 37 journey modules before the server starts. It therefore validates the application after composition, not production-like raw first visit or the full 51-module Service Worker composition lifecycle.

## 15. Missing test coverage

Current tests do not prove:

- raw versus controlled visible structure;
- first visit from a pristine origin;
- hard/bypass recovery;
- an active worker with an uncontrolled document;
- no-update without reload;
- real install/activate/controller transition;
- one shared reload owner and bounded loops;
- normal-browser `controllerchange` convergence;
- LF and CRLF composition parity;
- all 51 production modules exactly once in manifest order;
- stable distinction between module code and an incidental marker reference;
- success-marker absence when support/anchor/module composition fails;
- partial required or nominally optional module failure behavior;
- controlled full-production offline startup rather than the precomposed 37-module journey fixture;
- raw recoverable offline and bounded raw failure UX;
- safe non-destructive retry;
- update/bootstrap accessibility states.

No second test runner is needed. Node composition fixtures and production-like Playwright lifecycle journeys can extend the existing infrastructure.

## 16. Historical outcome mapping

The closed `today-readability-pass` v20 evidence remains useful only at the outcome level:

| Historical outcome | Current status | Reconciliation direction |
| --- | --- | --- |
| LF/CRLF-safe composition | Missing; confirmed current defect | Re-establish against 51 manifest modules and current support assets. |
| Raw/composed convergence | Missing | Re-establish under current raw/base and manifest architecture. |
| Neutral uncontrolled bootstrap | Missing | Re-establish without restoring old inline mechanism blindly. |
| Hard-bypass recovery | Missing | Re-establish with bounded normal navigation. |
| Lifecycle-derived update action | Missing | Replace current arbitrary timer semantics. |
| One reload owner and loop bound | Partial and standalone-only | Generalize across current browser/PWA paths. |
| First-visit convergence | Missing in normal browser | Re-establish with current `skipWaiting`/`clients.claim`. |
| Document/controller/cache coherence | Missing | Add current manifest-owned technical evidence. |
| Controlled cached offline startup | Partially covered | Preserve and prove using production-like current composition. |
| Data-safe failure/retry | Partial | Preserve storage; remove destructive reset from the default path. |

The historical feature remains formally closed. Its 13-feature, 21-asset, v20/v21, inline-CSS, and manual-only validation assumptions are not current specifications.

## 17. Stale historical implementation mechanisms

The following must not be ported:

- hardcoded 13/14-feature lists in `service-worker.js`;
- literal cache names `compasso-pages-v20` or `v21`;
- Service Worker ownership of the cache constant;
- Service Worker injection of `storage.js` or IndexedDB readiness into the document;
- old storage load/save text replacements;
- historical raw-navigation anchors copied verbatim;
- replacement/wrapping of global application behavior outside the current runtime contract;
- assumptions that there is no manifest, feature runtime, design system, Node suite, Playwright suite, snapshots, or CI;
- historical Service Worker lifecycle source copied without reassessing browser/current-module behavior.

## 18. Alternatives A, B, C, and D

### Alternative A — lifecycle-only correction

**Mechanism:** Keep raw HTML as a usable application; improve update state observation, `controllerchange`, timers, and reload guards.

**Advantages:**

- smallest source change;
- lower immediate composition risk;
- directly removes the 900 ms success assumption and double-reload race.

**Disadvantages and risks:**

- cannot make raw and composed structures equivalent;
- first visit and hard bypass can still expose a competing legacy application;
- does not solve CRLF, marker collisions, false success headers, or partial composition;
- a visible v69 label remains misleading.

**Assessment:** Insufficient for the confirmed product inconsistency.

### Alternative B — raw bootstrap guard plus lifecycle convergence

**Mechanism:** Treat raw `index.html` as a neutral bootstrap/recovery surface until a fully composed document and expected controller/cache generation agree. Use one lifecycle coordinator for registration, update state, controller transition, bounded recovery, status UX, and the final reload. Preserve Service Worker manifest composition but replace fragile anchors/sentinels and validate success.

**Advantages:**

- directly satisfies the user-confirmed architectural principle;
- fits the existing static, manifest-owned, Service Worker-composed architecture;
- bounds scope to delivery/bootstrap without reworking 51 feature modules;
- supports explicit failure UX while preserving current usable apps and local data;
- can reuse existing Node and Playwright infrastructure;
- enables independent rollback and a foundation-only release.

**Disadvantages and risks:**

- lifecycle coordination spans raw HTML, diagnostics/bootstrap code, and worker behavior;
- a guard defect could hide an otherwise usable app;
- immediate activation makes update and rollback validation operationally sensitive;
- production-like lifecycle tests require stricter origin/cache cleanup than current precomposed journeys.

**Assessment:** Selected. It is the smallest alternative that can close every confirmed root cause without changing the module delivery architecture wholesale. The user's accepted raw-bootstrap principle, convergence objective, and PWA-first sequence explicitly support this selection.

### Alternative C — client/runtime composition

**Mechanism:** Make normal client bootstrap load/compose the manifest modules so raw and controlled documents share structure; reduce the worker to caching and response delivery.

**Advantages:**

- removes server-side HTML text injection from navigation;
- can make network and cached documents structurally identical;
- potentially simplifies composition observability.

**Disadvantages and risks:**

- changes how 51 ordered classic scripts share globals and lexical bindings;
- risks startup ordering, CSP/module semantics, offline fetch waterfalls, and current feature bootstrap assumptions;
- substantially expands application-foundation and test scope;
- approaches an architectural migration rather than a bounded reconciliation.

**Assessment:** Architecturally plausible but disproportionate for the demonstrated defect. Defer unless Alternative B is invalidated.

### Alternative D — static-complete document

**Mechanism:** Put enough of the current 51-module application into the base static document that the worker no longer produces a materially different structure.

**Advantages:**

- raw and controlled HTML can be equivalent;
- removes runtime text injection and its line-ending anchors;
- simple browser loading model if generated reliably.

**Disadvantages and risks:**

- duplicates or expands a very large static document;
- conflicts with manifest source ownership and no-build-process maintenance unless a new generation step becomes production-critical;
- makes feature ordering and cache review harder;
- increases merge, performance, and maintainability risk on GitHub Pages.

**Assessment:** Rejected for current scope.

## 19. Composition-anchor alternatives

### Narrow `\r?\n` matching

This is the smallest correction for current Windows line endings. It would make the existing anchor accept LF and CRLF.

**Limit:** It still depends on exact indentation and adjacent source text, duplicates logic in the test composer, does not solve module-marker collision, and cannot prove complete composition. It is acceptable only as a tactical component, not the complete solution.

### Stable semantic anchor plus dedicated sentinels

Use an explicit, repository-owned bootstrap insertion point whose identity does not depend on newline style, and use module-specific composition sentinels that cannot be confused with globals mentioned by other source files. Composition success is emitted only after support assets and every production manifest module are present exactly once in order.

**Advantages:** Fits current text-composition architecture, avoids a parser dependency, supports idempotency and exact tests, and removes both confirmed anchor defects.

**Risks:** The base document and both production/test composition paths must share the contract; careless sentinel placement can still drift.

**Selection:** Recommended with Alternative B.

### Remove text-injection dependency

Client/runtime or static-complete composition eliminates the anchor class entirely.

**Limit:** It entails Alternatives C or D and is not proportionate unless the stable semantic anchor cannot satisfy the invariant.

No HTML parser dependency is justified by current evidence.

## 20. Selected recommendation

Select Alternative B with these Brainstorm-level responsibilities:

- the base document bootstrap layer owns raw-shell guarding and convergence status before legacy UI can become accessible;
- a single application lifecycle coordinator owns registration/update observation, controller transition, bounded recovery, and the only final reload;
- the Service Worker continues to own manifest-derived caching and controlled document composition;
- composition uses a stable semantic anchor and dedicated module/support sentinels, not loose global-identifier search;
- a technical composition signal includes current cache identity and complete-composition success;
- a minimal same-origin controller handshake exposes the active worker's manifest/cache identity so it can be compared with the document signal;
- the feature runtime installs only after a complete document is composed and does not own PWA convergence;
- recovery is non-destructive by default and never mutates user data.

Exact function names, markup, event protocol, and file manifest remain Design decisions.

## 21. Product convergence invariant

Proposed invariant for Define:

> When a valid current Compasso worker and complete current application resources are available from network or a Compasso cache, every supported entry or update path converges to exactly one fully composed, manifest-ordered application whose document composition identity agrees with its controlling worker and cache generation. Raw `index.html` remains hidden and inert as a neutral bootstrap/recovery surface, never as an alternative current application.

And the bounded-failure clause:

> For one expected application generation, automatic recovery may request at most one ordinary convergence reload per tab/session path. If coherence still cannot be established, Compasso preserves the current usable coherent application when one exists, otherwise shows a readable keyboard-usable retry state without clearing application data or caches by default.

## 22. State and lifecycle model

| Scenario | Desired observable state and transition |
| --- | --- |
| 1. First visit | Neutral raw bootstrap; register/install/cache/activate/claim; one controlled reload; reveal coherent app or bounded retry. |
| 2. Normal controlled reload | Marker/controller/cache agree; reveal composed app directly; no extra reload. |
| 3. Browser close/reopen | Controlled navigation reaches coherent cached/network app; preserve data. |
| 4. Installed-PWA close/reopen | Same convergence contract as browser, online or from complete cache; no standalone-only semantics. |
| 5. Hard-bypass/raw navigation | Respect bypass; keep raw shell hidden/inert; one subsequent normal recovery navigation; otherwise retry. |
| 6. Active worker, uncontrolled document | Discover usable registration/controller path; request one controlled navigation; do not wait indefinitely for an event that may not occur. |
| 7. No update | Keep current app; report current; zero reload. |
| 8. Update installing | Show persistent progress derived from worker state; keep current coherent app usable; prevent competing operations. |
| 9. Update waiting/transient | Observe if present; account for immediate `skipWaiting`; do not require a durable waiting state. |
| 10. Update activating | Continue progress; do not reload merely because elapsed time passed. |
| 11. Controller changed | Coordinator verifies expected controller identity and owns one final reload if document identity is stale. |
| 12. Update failure | Keep current coherent app; announce failure; enable retry; no cache/data reset. |
| 13. Controlled cached offline | Serve complete composed app; verify marker/controller/cache; zero automatic recovery reload. |
| 14. Raw recoverable offline | With usable active registration/cache, attempt one controlled reload; otherwise show offline retry. |
| 15. No-resource offline | Browser failure surface; no impossible requirement for application code that cannot execute. |
| 16. Composition anchor failure | Do not claim success or expose legacy shell; retain current coherent app during update or return bounded neutral failure on entry. |
| 17. Partial module/support failure | Do not stamp complete marker; identify failure without user content; do not present a partially current app as successful. |

## 23. Reload ownership model

One lifecycle coordinator in the application bootstrap layer owns every application-requested `location.reload()` used for version convergence.

- the update button initiates/checks and reports; it never schedules its own independent timer reload;
- `controllerchange` notifies the coordinator; it does not directly reload outside that policy;
- raw bootstrap requests recovery through the same coordinator;
- diagnostic retry re-enters the coordinator rather than unconditionally clearing and reloading;
- a session-scoped guard includes the expected cache/composition identity and allows at most one automatic reload for the same path/version;
- manual retry remains available after the automatic bound is reached;
- normal user-requested browser reloads are not counted as coordinator loops.

This model prevents standalone/browser divergence and timer/controller double reloads.

## 24. Update-button semantics

### No update

- complete the check using actual registration/worker state;
- announce that Compasso is current;
- keep the application usable;
- do not reload.

### Installing

- observe `updatefound`, `registration.installing`, and worker `statechange` as applicable;
- expose an in-progress accessible state;
- ignore or coalesce competing clicks;
- do not infer completion from a timeout.

### Waiting

- handle the state if observed;
- preserve the current immediate `skipWaiting()` policy unless Design proves it unsafe;
- do not require waiting to be stable.

### Activated/controller transition

- verify that the active/controlling worker is the expected generation;
- hand the sole final reload decision to the lifecycle coordinator;
- end with matching document/controller/cache identity.

### Failure

- keep the current coherent app usable;
- announce the failure and provide retry;
- do not unregister, clear caches, or clear user data as the normal response.

## 25. Failure and retry semantics

Failure UX must distinguish at least:

- transient registration/update failure while a coherent current app remains usable;
- raw bootstrap unable to establish control;
- incomplete composition;
- offline state with a potentially recoverable cache;
- unsupported or unavailable Service Worker capability;
- bounded recovery exhausted.

The user-facing message should explain the outcome and next safe action without exposing module source, URLs containing user data, cache inventories, or internal stack details. Retry must be keyboard accessible and idempotent. A last-resort shell reset, if retained, must be separated from normal retry and require explicit confirmation.

Diagnostics may record module name, lifecycle state, and non-sensitive version identifiers locally. They must not record application content.

## 26. Offline semantics

- Previously complete controlled caches are first-class supported startup paths.
- Offline startup must never depend on Drive or any external service.
- A current coherent document remains usable during an update-check network failure.
- A raw document with a usable current worker/cache receives one ordinary recovery attempt.
- A raw document without a usable application path shows bounded offline/retry UX if enough application code is already executing.
- No automatic recovery removes the only cached shell.
- No requirement is placed on the impossible no-document/no-worker/no-cache/no-network state.

## 27. Accessibility requirements direction

Bootstrap, update, recovery, composition-failure, and offline states must:

- prevent the legacy application shell from being focusable or announced before convergence;
- be non-blank and readable at 360px without horizontal overflow;
- use meaningful heading, status, progress, and error semantics;
- announce lifecycle changes without repeatedly disrupting focus;
- provide native keyboard-operable retry/update controls with visible focus;
- avoid focus traps and return focus predictably after transient status changes;
- remain understandable without color alone;
- meet current design-system contrast and target-size contracts;
- respect `prefers-reduced-motion` and avoid flashing/animated convergence;
- keep status available long enough to read rather than relying only on a short toast.

## 28. Data and privacy implications

No application-data change is required:

- no schema or collection change;
- no `CompassoStorage` database/store/version change;
- no localStorage key/format change;
- no state-foundation migration;
- no JSON backup or restoration change;
- no Markdown import/export change;
- no Drive synchronization shape or behavior change;
- no external service, analytics, or telemetry.

`index.html` already loads `storage.js` directly and awaits `CompassoStorage.ready('compasso.app.v1')`. Historical Service Worker storage injection is obsolete. The PWA feature must preserve this direct bootstrap and never convert cache/worker recovery into application-data recovery.

## 29. Likely files, not a Design manifest

Evidence-based candidates are:

- `app-manifest.js` for cache generation and any durable coherence contract owned by the manifest;
- `service-worker.js` for composition validation, stable anchors/sentinels, controller identity, install/activate/cache scope, and navigation failure behavior;
- `index.html` for the earliest raw guard, lifecycle coordinator integration, update-button semantics, and reload ownership;
- `bootstrap-diagnostics.js` for safe status/failure/retry behavior and removal of default destructive recovery;
- `scripts/compose-test-app.js` because it duplicates the current LF-only composition anchor and should consume the same stable contract;
- `tests/service-worker-composition.test.js` for LF/CRLF, uniqueness/order, idempotency, and failure composition;
- `tests/bootstrap-recovery.test.js` for lifecycle/reload/recovery source and behavior contracts;
- existing Playwright foundation or focused lifecycle specifications using the current runner;
- `playwright.config.js` only if a production-like raw origin cannot be exercised through the existing server configuration;
- `docs/application-foundation.md` for the durable convergence/reload/composition contract;
- `docs/storage-foundation.md` only if recovery documentation must explicitly distinguish app-shell reset from user data.

This is not a closed Design manifest. `today-feature.js`, Today documentation, visual snapshots, data models, Drive modules, and storage/state implementations have no demonstrated reason to change.

## 30. Test strategy direction

Reuse the current commands and tools.

### Node composition evidence

- run the same composition contract against explicit LF and CRLF fixtures independent of checkout normalization;
- prove support assets and all 51 production modules are inserted exactly once in manifest order using dedicated sentinels;
- prove `weekly-plan-model.js` is not skipped by an earlier identifier reference;
- prove idempotent recomposition;
- prove missing semantic anchor, missing support anchor, and missing module do not receive a success marker;
- prove a successful marker carries current cache/composition identity rather than only manifest API version 1;
- prove cache ownership remains in `app-manifest.js`;
- preserve direct storage loading exactly once.

### Bootstrap/lifecycle evidence

- replace source-only 900 ms/standalone checks with state-model or browser-observable assertions for no-update, installing, activation, controller transition, failure, one reload owner, and loop bound;
- prove retry does not clear IndexedDB/localStorage and does not clear caches/registration by default;
- prove cache cleanup is scoped to Compasso-owned generations.

### Existing Playwright evidence

- add production-like raw-origin journeys within the existing Playwright runner rather than relying only on precomposed `.test-dist`;
- isolate registration/cache state per scenario and clean up only the test origin;
- cover pristine first visit, normal reload/reopen, hard bypass followed by normal recovery, active-worker/uncontrolled document, no-update, actual update transition, controllerchange ownership, failure, controlled offline startup, raw recoverable offline, 360px status UX, keyboard retry, and bounded reload count;
- retain existing Journal offline, foundation health, IA, design-system, backup, and storage regression coverage;
- do not regenerate existing visual snapshots blindly.

## 31. Foundation-only publication analysis

### Option 1 — publish the foundation after its own Build and Ship

**Benefits:**

- resolves an application-wide delivery/lifecycle defect sooner;
- gives Today reconciliation a stable real-world baseline;
- reduces the chance of validating Today against a document path users do not consistently receive;
- isolates PWA rollback and monitoring from visual changes.

**Risks:**

- Today readability gaps remain temporarily;
- immediate activation and forward-only cache rollback require especially strong PWA evidence;
- publication still requires separate explicit authorization.

### Option 2 — wait for Today reconciliation

**Benefits:**

- one combined publication event;
- users receive lifecycle and Today visual improvements together.

**Risks:**

- prolongs confirmed raw/composed, CRLF, marker, and update-lifecycle defects;
- couples application-foundation operational risk to unrelated Today presentation work;
- makes root-cause attribution and rollback harder.

**Recommendation:** Option 1 is technically preferable after this feature independently passes Define, Design, Build, Ship, production-like lifecycle evidence, and explicit publication authorization. Until the user makes that authorization, the accepted default sequence remains PWA foundation → Today reconciliation → publication. No publication occurs in this phase.

## 32. Dependencies on Today reconciliation

`pwa-version-convergence` is a prerequisite for representative final Today validation, but it does not depend on Today visual changes.

It must preserve:

- current Today module order and behavior;
- `dailyPlans`, recommendations, sessions, Journal/weekly integration, persistence, backup, and legacy data;
- current design-system and information-architecture composition;
- all 51 manifest modules and 64 shell assets unless a later Design proves an intentional manifest change.

After PWA Ship, `today-readability-baseline-reconciliation` may proceed to Define against the resulting foundation. If the PWA implementation changes relevant bootstrap, test server, cache, or accessibility contracts, the Today Brainstorm evidence must be rechecked, not reopened historically.

## 33. Non-goals

- Today typography, CTA hierarchy, card alignment, or visual redesign.
- Reopening or rewriting `today-readability-pass`.
- Defining Today reconciliation now.
- Notes/Learning Loop work.
- Navigation or global design-system redesign.
- Feature behavior, recommendation, session, Journal, Drive, or backup redesign.
- Data schema, migration, IndexedDB, localStorage, JSON, or Markdown changes.
- Backend, account system, framework, dependency, build-system replacement, analytics, telemetry, or AI.
- Defeating browser hard-reload/bypass semantics.
- A generic Service Worker rewrite beyond demonstrated convergence/composition problems.
- A new testing framework or blind snapshot updates.
- Commit, push, deployment, or publication.

## 34. Risks

| Risk | Likelihood | Impact | Directional mitigation |
| --- | --- | --- | --- |
| Raw guard hides a usable coherent app due to false mismatch | Medium | Critical | Explicit marker/controller contract, bounded failure, production-like browser evidence. |
| Competing lifecycle actors cause double reload | Confirmed | High | One coordinator owns every convergence reload. |
| Reload guard blocks a legitimate later update | Medium | High | Key the bound to expected cache/composition generation and reset only on proven coherence. |
| CRLF or source drift breaks composition | Confirmed | Critical | Stable semantic anchor and explicit LF/CRLF fixtures. |
| Loose markers skip or duplicate modules | Confirmed | Critical | Dedicated sentinels and all-51 exact-order validation. |
| Partial composition is falsely marked current | Confirmed | Critical | Stamp success only after complete validation; fail closed. |
| Immediate activation removes rollback cache | High | High | Validate replacement before activation; use forward cache correction for rollback. |
| Activation deletes unrelated origin caches | Medium | High | Scope deletion to Compasso-owned cache names. |
| Non-destructive retry cannot repair corrupted shell | Medium | Medium | Keep a separately confirmed, explicit last-resort reset if justified. |
| Update failure makes current app unavailable | Medium | High | Keep current coherent app active during checks; no default cache reset. |
| Production-like Service Worker tests are flaky | Medium | High | Isolated origin/state, lifecycle predicates, no arbitrary timers. |
| Precomposed browser fixture masks production defect | Confirmed | High | Add raw-origin lifecycle journeys in the existing runner. |
| Bootstrap status is inaccessible or flashes legacy UI | Medium | High | Pre-paint guard, inert shell, semantic persistent status, 360px/keyboard/reduced-motion checks. |
| PWA work changes data behavior accidentally | Low | Critical | Closed Design manifest; storage/state files remain out unless evidence changes. |
| Foundation publication leaves Today readability debt | High | Medium | Make temporary limitation explicit; continue Today sequence. |
| Unrelated worktree or historical artifacts are modified | Low | High | Keep all work in isolated PWA worktree and verify all statuses. |

## 35. Rollback considerations

No data migration means code rollback requires no data recovery. Before publication, each candidate product file can be reverted independently within a future approved Design, provided the raw guard, composition marker, and lifecycle coordinator remain internally coherent as a set.

After a new immediate-activation worker deletes old caches, rollback is not automatic. Recovery is forward-only:

1. correct the defect under a later manifest-owned cache generation;
2. ensure the corrected shell and composition contract are complete before activation;
3. allow the current usable coherent app to remain available during the update where possible;
4. use the coordinator to converge once the corrected controller owns the client;
5. preserve IndexedDB, localStorage, JSON backup, Markdown, and Drive data throughout.

Re-publishing the old source under a new cache generation could restore behavior but would also restore the known convergence defects; it is an emergency fallback, not a preferred rollback. Installed PWA and offline recovery must be explicitly validated because closed tabs cannot receive a correction until they next obtain network access.

## 36. Invalidation conditions

Alternative B must be revisited if:

- `origin/main` advances and changes manifest, worker, raw bootstrap, storage, diagnostics, or test contracts before Define;
- repository architecture moves composition to the client or a static-complete document before this feature proceeds;
- current browser support requirements mandate the full current app in environments without Service Worker capability, making a neutral raw-only fallback unacceptable;
- a stable semantic anchor and sentinels cannot prove all-module exactness without an HTML parser or broader architecture change;
- a production-like performance check shows current Service Worker composition itself is no longer viable;
- manifest semantics intentionally permit a successful current product with missing optional modules, requiring a defined degraded-composition contract rather than all-module completeness;
- the user explicitly chooses client/runtime or static-complete composition despite the wider scope;
- foundation-only publication is prohibited regardless of independent acceptance, changing release sequencing but not necessarily implementation.

## 37. Open questions genuinely requiring user input

No question blocks Define. The user has already confirmed the PWA-first sequence, raw-bootstrap principle, local-first constraints, supported scenario set, and prohibition on blind historical porting.

Explicit user decisions still required later are:

1. whether a PWA foundation that independently passes Ship may be published before Today reconciliation;
2. whether a last-resort confirmed “reset application shell” control should remain available after non-destructive retry is exhausted;
3. whether supported browser scope extends beyond the repository's documented Chrome/Edge installation target and Chromium Playwright evidence;
4. authorization for any future commit, push, publication, or deployment.

Define can proceed using the repository's current documented browser/PWA scope unless the user broadens it.

## 38. Recommended next SDD skill

### Quality-gate answers

| Gate question | Result |
| --- | --- |
| Exact current inconsistency | Raw legacy/base Overview can persist while controlled navigation yields the current 51-module application; both can display v69 and use the same data. |
| Product convergence invariant | One fully composed manifest-ordered document matching its controller/cache, or bounded neutral failure. |
| Raw bootstrap owner | The earliest base-document bootstrap layer, with reusable coordination in the bootstrap/diagnostics layer. |
| Update lifecycle owner | One application lifecycle coordinator observing registration and worker state. |
| One final reload owner | The same coordinator; update, controllerchange, raw guard, and retry only signal it. |
| Loop bound | At most one automatic convergence reload per expected generation/path in the tab/session, then explicit retry. |
| First visit | Neutral raw bootstrap → install/activate/claim → one controlled navigation → coherent app or retry. |
| Hard bypass | Respect bypass, hide/inert raw shell, then one ordinary controlled recovery navigation. |
| Offline | Complete controlled cache opens directly; recoverable raw gets one reload; no-resource state remains browser-owned. |
| Composition failure | No success marker or partial current app; retain existing coherent app or show bounded neutral failure. |
| CRLF current defect | Yes; checkout has 1,254 CRLF lines and zero modules are inserted by the current LF-only feature anchor. |
| Existing proof infrastructure | Current Node manifest/composition/bootstrap/storage tests and Playwright/CI, extended in place with raw lifecycle journeys. |
| Foundation-only publication | Technically safe and preferred only after independent Ship and explicit user authorization; default sequence otherwise waits for Today. |
| Historical mechanisms excluded | Hardcoded modules/cache v20-v21, storage injection, old anchors/lifecycle source, and obsolete no-test/no-manifest assumptions. |

**Quality result:** PASS — the problem, users, success outcomes, root causes, selected architecture, composition strategy, lifecycle model, reload ownership, offline/failure behavior, test direction, risks, non-goals, rollback, publication implication, and dependency boundary are sufficient for Define.

The exact next valid skill is `$sdd-define` using:

`.sdd/features/pwa-version-convergence/BRAINSTORM.md`

Do not proceed automatically to Define, Today reconciliation, Build, Ship, commit, push, deployment, or publication.
