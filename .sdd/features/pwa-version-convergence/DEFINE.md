# Define: PWA version convergence

**Feature:** `pwa-version-convergence`
**Phase:** 1 — Define
**Revision:** 1
**Status:** Complete (Designed)
**Baseline:** `origin/main@922b6c8dc12046a5bc3524ef9aee042411c933ab`
**Branch:** `codex/pwa-version-convergence`
**Source:** `.sdd/features/pwa-version-convergence/BRAINSTORM.md`
**Selected direction constraint:** Alternative B — raw bootstrap guard plus lifecycle convergence

> The installed skill's referenced `templates/DEFINE_TEMPLATE.md` is absent. This artifact follows the required Define structure and clarity gate supplied for this feature.

## 1. Problem and target users

The current Compasso baseline can present two materially different applications under the same visible cache-version label and over the same local data. Raw, uncontrolled `index.html` exposes a usable legacy Overview, while a Service Worker-controlled navigation attempts to produce the current manifest-composed application. Composition and update behavior also have confirmed line-ending, module-identity, success-signalling, reload-ownership, recovery, and cache-cleanup defects.

The primary user is a person using Compasso through:

- Google Chrome or Microsoft Edge;
- a normal Chromium browser tab;
- a Chromium-based installed PWA where installation is supported;
- online startup/update paths;
- previously complete cached offline startup;
- keyboard, touch, zoom, reduced-motion, and 360px mobile contexts.

The feature must ensure that supported application-owned paths reach one coherent current application when the necessary resources exist, or a bounded accessible retry state when they do not. It must not change user data, application features, or product behavior outside delivery and lifecycle convergence.

## 2. Prioritized goals and success measures

### P0 — Coherent application generation

A stable application must have a fully composed document, active controller, and application/cache generation that mutually agree using manifest-owned, non-sensitive identity.

### P0 — No persistent raw legacy application

Raw HTML is bootstrap/recovery infrastructure only. Before coherence is established, the legacy shell is not visible, focusable, operable, or announced as the current application.

### P0 — Complete, line-ending-independent composition

Successful composition reflects the current production module set and support requirements declared by the manifest, exactly once and in order, for both LF and CRLF source. Ambiguous, missing, duplicated, or malformed composition never receives a success identity.

### P0 — Deterministic lifecycle convergence

One coordinator owns application-requested convergence reloads. A single attempt performs no more than one automatic recovery navigation/reload for the same expected generation and path, then becomes a readable manual-retry state.

### P0 — Data-safe cache and recovery behavior

Ordinary recovery is non-destructive. Automatic cleanup affects only unambiguously Compasso-owned application caches and never affects user persistence. Last-resort shell reset is explicit, confirmed, narrowly scoped, and optional.

### P1 — Current application preservation

Today, Journal, sessions, weekly planning, Drive UI/integration contracts, routes, design system, storage, backup/restore, and offline local-first behavior remain functionally compatible.

### P1 — Evidence-bearing validation

Current Node, Playwright, and CI infrastructure proves static/composition and browser-runtime contracts; installed-PWA-only behavior may use explicitly attributed manual evidence.

## 3. Definitions and convergence invariant

### 3.1 Manifest-owned application generation

An **application generation** is the non-sensitive delivery identity owned by the current application manifest and used to distinguish one coherent cached/composed release from another. It must not contain user content, personal identifiers, storage values, or remote-service credentials. Historical literal values such as v20 or v21 are not part of this contract.

### 3.2 Complete production composition

A **complete production composition** contains:

- the production module set currently declared by the manifest, not a hardcoded count;
- each declared production module exactly once;
- those modules in manifest order;
- every support asset or bootstrap prerequisite designated as required for the current application;
- an unambiguous success identity emitted only after those conditions are satisfied.

The manifest's bootstrap-critical `required` subset may govern fallback/recovery policy, but it does not authorize a document to claim the complete current product while another production-declared module is silently absent. If Design proves that manifest semantics intentionally support a degraded successful product, this assumption requires `$sdd-iterate`.

### 3.3 Coherent stable application

A **coherent stable application** exists only when all of the following are true for generation **G**:

1. the document carries a valid complete-composition identity for G;
2. the active controlling Service Worker identifies itself as G;
3. the application/cache generation serving the required manifest package is G;
4. no required production module/support condition is missing, duplicated, ambiguous, or out of manifest order;
5. the current application runtime has not been replaced by the raw legacy shell.

### 3.4 Convergence attempt

A **convergence attempt** begins when application code starts raw bootstrap recovery or an explicit update operation for an expected generation/path. It ends when coherence is proven or the automatic budget is exhausted and a stable failure/retry state is shown. A user may explicitly start a new manual retry attempt.

### 3.5 Product convergence invariant

> Whenever a valid current Compasso worker and complete current application resources are available from the network or a Compasso-owned cache, every supported application-owned entry or update path converges to exactly one complete, manifest-ordered application whose document, active controller, and application/cache generation agree. Raw `index.html` remains hidden and inert as bootstrap/recovery infrastructure and never persists as an alternative current application.

### 3.6 Bounded-failure invariant

> For the same expected generation and recovery path, one convergence attempt may perform at most one application-owned automatic navigation/reload. If coherence still cannot be established, Compasso preserves an already coherent usable application where available; otherwise it shows a readable keyboard-usable manual-retry state without automatically clearing registrations, caches, or user data.

## 4. In scope

- Manifest-owned application-generation identity and coherence contract.
- Raw-document bootstrap/recovery behavior.
- Complete production composition success/failure semantics.
- LF and CRLF equivalence.
- Collision-safe module identity and exactly-once/order outcomes.
- One lifecycle coordinator and one final reload owner.
- Bounded first-visit, hard-bypass, update, controller-transition, and recovery behavior.
- No-update, real-update, and update-failure outcomes.
- Controlled cached offline and recoverable raw/offline behavior.
- Composition diagnostics that exclude user content.
- Compasso-only automatic cache cleanup.
- Explicit confirmed last-resort shell reset.
- Bootstrap/update/failure/recovery accessibility.
- Chrome, Edge, and supported Chromium installed-PWA evidence.
- Extensions to existing Node/Playwright validation and current CI usage.
- Durable application-foundation documentation where Design proves it necessary.
- Independent Build and Ship readiness without Today reconciliation.

## 5. Out of scope and non-goals

- Today readability redesign, typography, CTA hierarchy, or card layout.
- Defining, designing, or implementing `today-readability-baseline-reconciliation`.
- Reopening or modifying historical `today-readability-pass`.
- Notes/Learning Loop work.
- Navigation or design-system redesign.
- Today, Journal, session, weekly-planning, recommendation, Drive, OAuth, or remote-write redesign.
- IndexedDB, localStorage, `dailyPlans`, notes, Journal, sessions, backup, or Markdown schema changes.
- Data migration or normalization changes.
- Backend, account system, analytics, telemetry, AI, or new remote services.
- Replacing the current static/no-build architecture.
- A generic Service Worker rewrite unrelated to the demonstrated defects.
- Defeating browser hard-reload/bypass semantics.
- Firefox or Safari as mandatory acceptance targets for this feature.
- Restoring historical v20/v21 cache names, module lists, storage injection, or lifecycle source.
- Creating a new test framework or blindly regenerating visual snapshots.
- Commit, push, deployment, publication, or release authorization.

## 6. Numbered requirements

| Requirement | Priority | Measurable outcome |
| --- | --- | --- |
| RQ-01 — Application-generation identity | P0 | A non-sensitive manifest-owned generation identity permits document, active controller, and application/cache generation to be compared; a stable app is current only when all three agree. |
| RQ-02 — Raw document contract | P0 | Before coherence, raw legacy content is hidden/inert and a readable application-owned bootstrap/recovery state is the only exposed application UI. |
| RQ-03 — Complete composition | P0 | Success requires the manifest-declared production module set exactly once in order plus required support prerequisites; no hardcoded module count defines the product contract. |
| RQ-04 — Line-ending independence | P0 | Identical semantic source represented with LF or CRLF yields equivalent anchor resolution, module identity resolution, complete composition, and success/failure outcome. |
| RQ-05 — Module identity correctness | P0 | Actual composition identity is distinguishable from incidental substring/global-name references; similarly named modules cannot cause skip, duplicate, or false success. |
| RQ-06 — One reload owner | P0 | At most one lifecycle coordinator owns application-requested final navigation/reload; all other lifecycle actors only signal state or request coordination. |
| RQ-07 — Bounded automatic recovery | P0 | One attempt performs no more than one automatic convergence navigation/reload for the same expected generation/path; exhaustion leaves manual retry without a loop. |
| RQ-08 — First visit | P0 | A pristine supported online origin reaches the coherent current application with no persistent legacy shell and no more than one application-owned convergence reload when resources are available. |
| RQ-09 — Controlled startup | P0 | Current controlled browser reload, browser reopen, and installed-PWA reopen open the coherent app directly with zero unnecessary application-owned recovery reloads. |
| RQ-10 — Hard-bypass/uncontrolled recovery | P0 | After a raw/uncontrolled document executes, one bounded ordinary recovery attempt reaches the coherent app when a valid worker/cache can serve it, without attempting to override browser bypass semantics. |
| RQ-11 — No-update behavior | P0 | Checking when no newer generation exists keeps the current app coherent and usable, reports current status, and causes zero application-owned reloads. |
| RQ-12 — Real-update behavior | P0 | Discovery, install, activation, controller transition, and final document convergence follow actual lifecycle state; at most one coordinator-owned final reload yields matching new generation. |
| RQ-13 — Update failure | P0 | Failed discovery/install/activation retains the current coherent app, performs no destructive cleanup or loop, preserves data, and provides clear retry status. |
| RQ-14 — Controller-change semantics | P0 | `controllerchange` is a coordinator input across browser tab, installed PWA, update, and bootstrap contexts; it is not an unconditional or standalone-only reload command. |
| RQ-15 — Controlled offline startup | P0 | A complete current controlled cache opens the full composed app offline with manifest assets/modules and local data available, without unnecessary recovery/reset UI. |
| RQ-16 — Recoverable raw/offline state | P0 | An executing raw document with a usable active/cached worker performs one bounded normal recovery; success opens the coherent app and failure leaves non-destructive retry UX. |
| RQ-17 — No-resource offline boundary | P0 | No document + no worker + no cache + no network is explicitly browser-owned and is not counted as a Compasso acceptance failure. |
| RQ-18 — Composition failure | P0 | Missing/ambiguous anchors, missing/duplicate modules, order failure, missing support, or malformed composition never claims success or exposes an invalid partial app as current; diagnostics remain data-safe. |
| RQ-19 — Cache ownership and cleanup | P0 | Automatic cleanup removes only unambiguously Compasso-owned stale application caches; unrelated same-origin caches and every user-persistence store remain untouched. |
| RQ-20 — Last-resort shell reset | P0 | Shell reset is manually invoked, clearly separate from retry, explicitly confirmed, limited to same-application registration and Compasso-owned shell caches, cancellable, and never deletes user data. |
| RQ-21 — Data compatibility | P0 | IndexedDB, localStorage, `dailyPlans`, notes, Journal, sessions, JSON backup/restore, Markdown portability, and local-first behavior require no schema or migration change. |
| RQ-22 — Accessibility | P0 | Bootstrap/update/failure/recovery states meet current Compasso keyboard, focus, status, contrast, target, 360px, reduced-motion, and inert-background contracts. |
| RQ-23 — Browser scope | P1 | Mandatory acceptance covers Chrome, Edge, and supported Chromium installed-PWA behavior; Firefox/Safari are outside this feature matrix without a global support judgment. |
| RQ-24 — Evidence model | P0 | Source/static, Node, Playwright/browser, and explicitly attributed manual installed-PWA evidence collectively make every acceptance criterion verifiable using current infrastructure. |
| RQ-25 — Existing behavior preservation | P0 | Manifest module set/order/support, routes, Today, Journal, sessions, weekly planning, Drive UI/integration, design system, storage, backup/restore, and offline local-first operation remain compatible. |
| RQ-26 — Proportional complexity | P1 | No framework, backend, remote service, new build architecture, new test framework, generic rewrite, or large parsing dependency is introduced without a future Iterate/Design justification. |

## 7. Business rules

1. The manifest is the source of truth for application generation, production modules, ordering, assets, and current package contracts.
2. A visible version label alone is not coherence evidence.
3. The raw base document is never a stable product mode.
4. Composition success is all-or-nothing for the manifest-declared production application.
5. Incidental source text is not evidence that a module was composed.
6. One coordinator owns automatic convergence navigation/reload.
7. One attempt has a maximum automatic budget of one convergence reload for the same expected generation/path.
8. A manual retry starts only by explicit user action and does not authorize destructive recovery.
9. No-update is a successful check with zero reload.
10. A real update is complete only after the final document/controller/application-cache generation agrees.
11. A failed update does not invalidate or erase the currently coherent app.
12. Automatic cleanup and last-resort reset are application-shell operations, never user-data operations.
13. Last-resort reset requires confirmation and cancel must be lossless.
14. No-resource offline is browser-owned because Compasso code cannot execute.
15. Ship proves SDD completion but never authorizes publication.

## 8. Constraints

- Static GitHub Pages architecture remains.
- No framework, backend, account system, or new external service.
- No new production build architecture.
- No user-data/schema migration.
- No remote OAuth or Drive write is required for acceptance.
- No generic Service Worker rewrite beyond convergence/composition/cache-safety needs.
- Use standard web APIs where they satisfy the current Chromium target.
- Existing Node and Playwright infrastructure must be extended rather than replaced.
- No large HTML/parser dependency is allowed without `$sdd-iterate` and Design evidence.
- Existing visual snapshots may not be updated without inspection and scoped justification.
- Cache generation remains manifest-owned; no historical cache number is restored.
- Direct `storage.js` loading remains independent of Service Worker composition.
- Product files cannot be selected until Design closes the implementation manifest.

## 9. Assumptions and dependencies

### Assumptions Design must verify

1. `app-manifest.js` remains the authoritative application-generation and package source.
2. Every module in the manifest's production module list is required for a document claiming the complete current application, even if only a subset is bootstrap-critical for network fallback.
3. `index.html` continues loading and awaiting `storage.js` directly.
4. Current `skipWaiting()` immediate-activation policy remains unless Design finds a contradiction with atomic replacement or recovery.
5. Current Node/Playwright/CI infrastructure can be extended to produce the required evidence.
6. No data schema or migration is necessary.
7. A non-sensitive generation/coherence signal can be exposed using standard APIs in the current Chromium scope.
8. Hard-bypass recovery can be validated without attempting to override the bypassing navigation itself.
9. A complete current cache can continue supporting offline composition without external services.

If any assumption is disproven, use `$sdd-iterate` before Design silently changes scope or requirements.

### Dependencies

- Current `app-manifest.js`, `service-worker.js`, `index.html`, and bootstrap diagnostics contracts.
- Existing application foundation, feature runtime, storage foundation, and design-system conventions.
- Current Node composition/bootstrap tests, Playwright Chromium projects, and CI workflow.
- Later `today-readability-baseline-reconciliation`, which consumes this foundation but is not required for this feature's closure.

### Open decisions

No unresolved decision blocks Design. Exact technical signal shape, coordinator placement, semantic anchor form, reset wording, and test-file manifest belong to Design. Any future publication still requires explicit authorization.

## 10. Numbered acceptance criteria

| AC | Given / When / Then | Requirements | Evidence class |
| --- | --- | --- | --- |
| AC-01 | **Given** manifest generation G, **when** a document is declared stable, **then** its complete-composition identity, active controller identity, and application/cache identity all equal G and contain no user content or personal identifier. | RQ-01 | Source/static + Node + browser |
| AC-02 | **Given** any mismatch among document, controller, and application/cache generation, **when** application convergence executes and valid G resources are available, **then** the state reaches matching G within the reload budget rather than declaring the mismatched state current. | RQ-01, RQ-06, RQ-07 | Browser |
| AC-03 | **Given** a stale document, stale controller, or stale cache/application generation that cannot converge, **when** the budget is exhausted, **then** no success identity is exposed and the user receives a stable retryable state while any already coherent app remains usable. | RQ-01, RQ-07, RQ-18 | Node + browser |
| AC-04 | **Given** raw `index.html` before coherence, **when** it renders, **then** legacy application content is hidden/inert, cannot receive focus or pointer activation, and is not exposed as the current application. | RQ-02, RQ-22 | Browser |
| AC-05 | **Given** raw bootstrap/recovery is executing, **when** convergence is pending or fails, **then** an application-owned readable status and a meaningful next action are exposed without presenting the legacy Overview as stable. | RQ-02, RQ-22 | Playwright/browser + user-observed manual validation |
| AC-06 | **Given** no document, no worker, no cache, and no network, **when** navigation fails before Compasso code can execute, **then** the browser's failure surface is not recorded as a Compasso acceptance failure. | RQ-17 | Source/static boundary |
| AC-07 | **Given** the current manifest production module list, **when** composition succeeds, **then** every declared production module is present exactly once and in manifest order; the assertion derives its count from the manifest. | RQ-03, RQ-25 | Node |
| AC-08 | **Given** current required support/bootstrap assets, **when** composition succeeds, **then** each required support prerequisite is present exactly as required and direct storage bootstrap is neither removed nor duplicated. | RQ-03, RQ-21, RQ-25 | Node |
| AC-09 | **Given** any missing, duplicated, ambiguous, out-of-order, or malformed production composition condition, **when** the response/document is produced, **then** it has no complete-success identity or false per-module success declaration. | RQ-03, RQ-18 | Node |
| AC-10 | **Given** semantically identical base source encoded with LF and CRLF, **when** production composition runs, **then** anchor resolution, module identity resolution, exact module/support result, order, and success/failure identity are equivalent. | RQ-04 | Node |
| AC-11 | **Given** an earlier module that merely mentions a later module's global/name marker, **when** composition runs, **then** the later module is still composed exactly once and success is valid. | RQ-05 | Node |
| AC-12 | **Given** a module already composed with its actual identity, **when** composition is attempted again, **then** it is not duplicated; incidental overlapping text cannot cause either duplication or false presence. | RQ-05 | Node |
| AC-13 | **Given** bootstrap, update action, activation, `controllerchange`, or retry emits lifecycle state for one attempt, **when** final navigation is needed, **then** only the lifecycle coordinator initiates it and no other actor independently reloads. | RQ-06, RQ-14 | Source/static + browser |
| AC-14 | **Given** one expected generation and recovery path, **when** automatic convergence repeats, **then** application code performs at most one automatic navigation/reload before ending the attempt. | RQ-07 | Node/state + browser |
| AC-15 | **Given** automatic recovery has used its one-reload budget without coherence, **when** the resulting page stabilizes, **then** no reload loop continues and an explicit manual retry remains available. | RQ-07, RQ-22 | Browser |
| AC-16 | **Given** a pristine supported online origin with required resources available, **when** the first raw document registers, installs, activates, and is claimed, **then** at most one application-owned convergence reload yields the coherent current app and the raw legacy shell never becomes stable. | RQ-08 | Playwright/browser |
| AC-17 | **Given** first-visit registration/install/activation cannot complete, **when** convergence ends, **then** the result is a bounded accessible retry state with zero data deletion and no persistent legacy shell. | RQ-08, RQ-13, RQ-22 | Browser |
| AC-18 | **Given** a current complete worker/cache already controls the client, **when** the user performs a normal browser reload, **then** the coherent app opens directly with zero additional application-owned recovery reloads. | RQ-09 | Playwright/browser |
| AC-19 | **Given** a current complete worker/cache, **when** a normal Chromium browser is closed and reopened to Compasso, **then** the coherent app opens without an additional application-owned recovery reload and local state remains available. | RQ-09, RQ-21 | Playwright/browser |
| AC-20 | **Given** a current complete installed Chromium PWA, **when** it is closed and reopened online and from a complete offline cache, **then** the coherent app opens, local state remains available, and no legacy shell/reset state replaces it. | RQ-09, RQ-15, RQ-23 | Manual installed-PWA, explicitly attributed |
| AC-21 | **Given** a browser hard/bypass navigation returns an executing raw uncontrolled document while a valid current worker/cache can serve the app, **when** application recovery runs, **then** it performs at most one ordinary recovery navigation and ends coherent or in non-destructive retry without trying to prevent the bypass itself. | RQ-10, RQ-07 | Playwright/browser + user-observed manual validation where browser semantics require |
| AC-22 | **Given** a coherent current app and no newer application generation, **when** the user selects “Verificar atualização”, **then** the app reports that it is current, remains usable and coherent, and performs zero application-owned reloads. | RQ-11 | Playwright/browser |
| AC-23 | **Given** a newer generation is discovered, **when** it installs or passes through a transient waiting state, **then** status is derived from actual worker lifecycle, competing update attempts are coalesced/prevented, and elapsed time alone is not treated as completion. | RQ-12, RQ-22 | Node/state + browser |
| AC-24 | **Given** a valid replacement activates and becomes the expected controller, **when** the lifecycle coordinator completes the update, **then** at most one coordinator-owned final reload produces matching new document/controller/application-cache generation. | RQ-12, RQ-06, RQ-14 | Playwright/browser + manual installed-PWA where required |
| AC-25 | **Given** update discovery, installation, or activation fails while the current app is coherent, **when** failure is reported, **then** the current app remains usable, zero failure-triggered reload loop occurs, no registration/cache/data is automatically cleared, and retry is available. | RQ-13 | Node/state + browser |
| AC-26 | **Given** `controllerchange` in a browser tab or installed PWA during bootstrap or update, **when** it occurs, **then** it is handled as coordinator input; it does not independently reload and does not depend on standalone mode for correctness. | RQ-14, RQ-06 | Source/static + browser + manual installed-PWA |
| AC-27 | **Given** a complete current cache and controlling worker with network unavailable, **when** Compasso starts or reloads, **then** the full manifest-composed app opens, required static assets/modules and local data remain available, and no unnecessary recovery/reset UI replaces it. | RQ-15, RQ-21, RQ-25 | Playwright offline + manual installed-PWA |
| AC-28 | **Given** raw application code is executing offline and a usable active/cached worker can serve current resources, **when** recovery runs, **then** no more than one ordinary navigation yields the coherent cached app. | RQ-16, RQ-07 | Playwright/browser |
| AC-29 | **Given** raw application code is executing offline but cannot establish a usable controlled path, **when** its recovery attempt ends, **then** a readable application-owned retry/offline state remains and no automatic worker/cache/data reset occurs. | RQ-16, RQ-22 | Browser |
| AC-30 | **Given** a missing composition anchor or required support insertion point, **when** composition is attempted, **then** success is absent, diagnostics identify the non-sensitive condition, and the partial legacy/current document is not exposed as coherent. | RQ-18 | Node |
| AC-31 | **Given** an ambiguous anchor, missing required production module, duplicate module, manifest-order violation, or malformed result, **when** composition is evaluated, **then** success is absent and the exact failure class is test-observable without user content. | RQ-18, RQ-03, RQ-05 | Node |
| AC-32 | **Given** a composition failure during update while a valid current generation remains usable, **when** the failure occurs, **then** the last valid app remains available and no user data is deleted; on a raw entry with no valid app, bounded neutral retry is shown. | RQ-18, RQ-13 | Browser + Node |
| AC-33 | **Given** current and unrelated same-origin caches, **when** automatic activation cleanup runs, **then** only caches unambiguously owned by stale Compasso application generations are eligible for deletion and unrelated caches remain byte-for-byte present. | RQ-19 | Node/service-worker + browser cache inspection |
| AC-34 | **Given** automatic cache cleanup, **when** it completes or fails, **then** IndexedDB, localStorage, JSON/Markdown files, application state, and the active replacement shell are untouched; cleanup is not described as user-data deletion. | RQ-19, RQ-21 | Source/static + browser |
| AC-35 | **Given** ordinary retry has not repaired the shell and the user chooses last-resort reset, **when** reset is offered, **then** it is visibly distinct from retry, explains its shell-only scope, and requires explicit confirmation before unregistering the application worker or deleting Compasso-owned shell caches. | RQ-20, RQ-22 | Playwright/browser + user-observed manual validation |
| AC-36 | **Given** the reset confirmation, **when** the user cancels, **then** registration, caches, IndexedDB, localStorage, application state, backups, and vault data remain unchanged. | RQ-20, RQ-21 | Browser |
| AC-37 | **Given** confirmed reset executes or partially fails, **when** it completes, **then** only the same application registration and Compasso-owned shell caches were targeted, user persistence remains unchanged, result status is clear, and normal bootstrap can be retried. | RQ-20, RQ-21 | Node/static + browser |
| AC-38 | **Given** existing or legacy local data and backup/vault formats, **when** the feature is built and exercised, **then** no IndexedDB version/store, localStorage schema/key, `dailyPlans`, notes, Journal, sessions, JSON backup, Markdown vault, or migration contract changes. | RQ-21 | Source diff + existing Node/browser regression |
| AC-39 | **Given** bootstrap/update/failure/recovery UI, **when** operated with keyboard, **then** every actionable control is reachable in logical order, activatable with native keyboard semantics, has visible focus, does not trap focus, and exposes meaningful accessible status/name. | RQ-22 | Playwright keyboard + manual installed-PWA where needed |
| AC-40 | **Given** bootstrap/update/failure/recovery at 360px, 200% zoom, reduced motion, or increased contrast, **when** displayed, **then** it has no horizontal overflow, provides at least 44px by 44px mobile/coarse targets, preserves at least 4.5:1 normal-text contrast and 3:1 large-text/focus/meaningful-boundary contrast, avoids color-only meaning and motion dependence, and keeps the legacy shell inert underneath. | RQ-22 | Playwright/browser + user-observed manual validation |
| AC-41 | **Given** the feature acceptance matrix, **when** evidence is reconciled, **then** Chrome, Edge, and supported Chromium installed-PWA behavior are covered; absence of Firefox/Safari evidence does not fail this feature or assert global non-support. | RQ-23 | Evidence report inspection |
| AC-42 | **Given** repository validation, **when** Build reports results, **then** it uses only verified commands (`npm test`, `npm run build:test`, `npm run test:browser`, `npm run test:all`) and explicitly distinguishes source/static, Node, browser, manual installed-PWA, and user-observed evidence. | RQ-24 | Build report + command output |
| AC-43 | **Given** the current manifest and user flows, **when** convergence work passes, **then** current production modules/order/support, routes, Today, Journal, sessions, weekly planning, Drive UI contracts, design system, storage, backup/restore, and local-first offline flows retain their existing observable behavior. | RQ-25 | Existing Node + Playwright regression suites |
| AC-44 | **Given** acceptance validation, **when** Drive-related modules compose, **then** their existing UI/integration contracts are preserved but no remote OAuth authentication or write operation is required to prove PWA convergence. | RQ-25 | Source/static + local browser smoke |
| AC-45 | **Given** the final Design/Build scope, **when** dependencies and architecture are reviewed, **then** no framework, backend, remote service, new build architecture, test framework, generic Service Worker rewrite, or large parser dependency was introduced without prior `$sdd-iterate` justification. | RQ-26 | Manifest/diff review |
| AC-46 | **Given** all feature criteria pass and Ship closes the SDD feature, **when** closure is recorded, **then** Today reconciliation is not required for closure and no deployment/publication is inferred; foundation-only publication remains a separate explicitly authorized operation. | RQ-24, RQ-25 | Ship artifact inspection |

## 11. Scenario matrix

Automatic counts below exclude the user's initial navigation, explicit browser reload, close/reopen, or explicit manual retry click. They count only extra application-owned convergence navigation/reload.

| Scenario | Expected stable result | Maximum automatic reload/recovery | Failure behavior | Evidence type |
| --- | --- | ---: | --- | --- |
| First visit | Current coherent composed generation | 1 | Neutral accessible retry; no legacy shell/data deletion | Playwright/browser |
| Controlled reload | Current coherent composed generation directly | 0 | Retain/report failure without destructive reset | Playwright/browser |
| Browser reopen | Current coherent composed generation and local data | 0 | Retryable status if resources unexpectedly unavailable | Playwright/browser |
| Installed PWA reopen | Current coherent composed generation online/offline and local data | 0 | Explicitly attributed manual failure evidence | Manual installed-PWA |
| Hard bypass/raw | One subsequent normal navigation reaches coherent generation | 1 | Bounded non-destructive retry; legacy shell remains inert | Playwright/browser + user-observed manual validation where needed |
| Active worker, uncontrolled document | Coherent generation after ordinary recovery | 1 | Bounded retry | Browser |
| No update | Same coherent generation; informative current status | 0 | Current app remains usable | Browser |
| Real update | Coherent replacement generation after controller transition | 1 | Current valid generation retained where possible | Browser + installed-PWA manual where needed |
| Update failure | Existing coherent generation remains usable | 0 | Clear retry; no cache/registration/data reset | Node/state + browser |
| Controlled offline | Complete coherent cached generation and local data | 0 | No unnecessary reset UI | Playwright offline + manual PWA |
| Recoverable raw offline | Coherent cached generation | 1 | Stable offline/retry; no destructive action | Browser |
| Composition failure during current-app update | Last valid coherent generation remains | 0 | Diagnostic retry; no false success | Node + browser |
| Composition failure on raw entry | No partial current app exposed | At most 1 within the existing raw attempt | Neutral bounded retry | Node + browser |
| No-resource offline | Browser-owned network failure | Not applicable | Not a Compasso acceptance failure | Boundary review |

## 12. Error and recovery scenarios

| Error | Required stable behavior |
| --- | --- |
| Service Worker unsupported/unavailable | If raw Compasso code executes, legacy shell stays inert and a readable supported-environment/retry status appears; local user data is not modified. |
| Registration failure | No persistent legacy shell, no automatic destructive reset, bounded retry, diagnostics without user content. |
| Install failure | Current coherent app remains if already open; raw entry ends in retry state; no false generation success. |
| Activation failure | Current coherent generation remains where possible; no timer-based success/reload; retry available. |
| Composition failure | No success identity; no partial app exposed; last valid generation preferred; data preserved. |
| Stale document | Coordinator uses at most one reload to reach matching generation; otherwise retry state. |
| Stale controller | Mismatch is not declared current; coordinator converges within budget or fails bounded. |
| Cache/application mismatch | No coherent success until identity matches; do not clear user data or unrelated caches. |
| Reload budget exhausted | No further automatic reload; persistent accessible manual retry. |
| Offline recoverable state | One normal recovery attempt through usable cache/worker; success or non-destructive offline retry. |
| Update failure | Existing coherent app remains; no automatic cache/registration/data clearing; retryable status. |
| Reset declined | No registration, cache, or persistence change. |
| Reset failure | Report partial/failed shell operation accurately, preserve user persistence, and offer safe retry without claiming success. |

Unsupported browser/API behavior must never be treated as permission to alter or delete local user data.

## 13. Evidence and validation model

### Evidence categories

- **Source/static:** file manifest, manifest ownership, absence/presence of forbidden mechanisms, semantic markup, data-schema diff, cache-cleanup scope, and complexity review.
- **Node test:** LF/CRLF fixtures, manifest-derived exact composition/order, collision/duplication/idempotency, composition failure, lifecycle state logic, cache ownership, and data-safe reset contracts.
- **Playwright/browser:** raw first visit, controlled startup, hard-bypass recovery where automation can reproduce it, no-update, real update/controller convergence, reload count, update failure, controlled offline, recoverable raw/offline, keyboard, focus, 360px, zoom, reduced motion, and current-flow regressions.
- **Manual installed-PWA:** real Chrome/Edge installation, online/offline close/reopen, installed controller transition, and installed-window lifecycle that browser automation cannot faithfully represent.
- **User-observed manual validation:** valid evidence only when explicitly attributed as such; Codex must not claim it executed the observation.

### Verified repository commands

- `npm test`
- `npm run build:test`
- `npm run test:browser`
- `npm run test:all`

The current Windows CRLF baseline is known to fail the targeted Service Worker composition test; correcting and proving that defect is feature work, not a reason to invent another command or runner.

### Evidence allocation

| Requirement class | Minimum evidence |
| --- | --- |
| Generation/composition/line endings/module identity | Source/static + Node |
| Reload owner/budget/update/controller paths | Node/state where separable + Playwright/browser |
| Raw/controlled/first-visit/hard-bypass | Playwright production-like raw origin; manual only for irreducible browser behavior |
| Controlled/recoverable offline | Playwright offline; installed-PWA manual for real reopen |
| Cache cleanup/reset/data safety | Source/static + Node + browser storage/cache inspection |
| Accessibility | Playwright keyboard/geometry/media emulation + inspected visual/manual evidence where needed |
| Installed-PWA close/reopen | Manual installed-PWA, explicitly attributed |
| Current feature preservation | Existing Node/Playwright suites plus scoped smoke evidence |

No criterion is permanently unverifiable merely because Codex cannot physically operate an installed PWA. Manual evidence is acceptable when its source, setup, observation, limitation, and result are recorded.

## 14. Compatibility and migration contract

- IndexedDB database/schema/store version: unchanged.
- localStorage keys and serialized formats: unchanged.
- `dailyPlans`, notes, Journal, session, weekly plan, Drive, and feature state: unchanged.
- JSON backup/export/import format: unchanged.
- Markdown vault/import/export contract: unchanged.
- State-foundation migration behavior: unchanged.
- Remote backend/service requirement: none.
- Historical Service Worker storage injection: must not return.

If Design discovers a required schema, migration, or data-format change, the feature is not permitted to proceed silently and must return through `$sdd-iterate`.

## 15. Browser and accessibility boundary

Mandatory acceptance scope is Google Chrome, Microsoft Edge, and Chromium-based installed PWA behavior where current application support permits. Playwright Chromium is the automated browser baseline. Firefox and Safari are outside this feature's mandatory matrix; this does not state that Compasso globally rejects them.

The current Compasso design-system conventions remain authoritative. Bootstrap, update, recovery, and failure UI must preserve:

- programmatic status and meaningful accessible names;
- logical keyboard navigation and native activation;
- visible focus with current contrast treatment;
- current minimum 44px coarse/mobile interactive targets;
- no global horizontal overflow at 360px or 200% zoom;
- at least 4.5:1 normal-text contrast and 3:1 large-text, focus-indicator, and meaningful-boundary contrast;
- no color-only state;
- reduced-motion behavior;
- no interactive/focusable legacy shell beneath the bootstrap state.

## 16. Publication and dependency boundary

- Define, Design, Build, and Ship prove and close this feature independently.
- Today reconciliation is not a prerequisite for `pwa-version-convergence` SDD closure.
- `today-readability-baseline-reconciliation` remains the subsequent feature and must consume the shipped foundation.
- Ship does not authorize deployment or publication.
- A foundation-only production publication may be selected after successful Build and Ship, but only through a separate explicit user authorization.
- Publication is not an acceptance criterion and is not performed by this phase.

## 17. Requirement-to-acceptance traceability

| Requirement | Acceptance criteria |
| --- | --- |
| RQ-01 | AC-01–AC-03 |
| RQ-02 | AC-04–AC-05 |
| RQ-03 | AC-07–AC-09, AC-31 |
| RQ-04 | AC-10 |
| RQ-05 | AC-11–AC-12, AC-31 |
| RQ-06 | AC-02, AC-13–AC-14, AC-24, AC-26 |
| RQ-07 | AC-02–AC-03, AC-14–AC-16, AC-21, AC-28 |
| RQ-08 | AC-16–AC-17 |
| RQ-09 | AC-18–AC-20 |
| RQ-10 | AC-21 |
| RQ-11 | AC-22 |
| RQ-12 | AC-23–AC-24 |
| RQ-13 | AC-17, AC-25, AC-32 |
| RQ-14 | AC-13, AC-24, AC-26 |
| RQ-15 | AC-20, AC-27 |
| RQ-16 | AC-28–AC-29 |
| RQ-17 | AC-06 |
| RQ-18 | AC-03, AC-09, AC-30–AC-32 |
| RQ-19 | AC-33–AC-34 |
| RQ-20 | AC-35–AC-37 |
| RQ-21 | AC-08, AC-17, AC-19–AC-20, AC-27, AC-32, AC-34, AC-36–AC-38 |
| RQ-22 | AC-04–AC-05, AC-15, AC-17, AC-23, AC-29, AC-35, AC-39–AC-40 |
| RQ-23 | AC-20, AC-41 |
| RQ-24 | AC-42, AC-46 |
| RQ-25 | AC-07–AC-08, AC-27, AC-43–AC-44, AC-46 |
| RQ-26 | AC-45 |

All 26 requirements have at least one acceptance criterion. All 46 acceptance criteria identify an evidence class.

## 18. Clarity score

| Dimension | Score | Explicit evidence |
| --- | ---: | --- |
| Problem | 3/3 | Current raw/composed divergence, CRLF zero-module composition, marker collision, timer update, reload race, false success, destructive recovery, and broad cache cleanup are verified. |
| Users | 3/3 | Chrome, Edge, Chromium browser/PWA, online/offline, keyboard/touch/mobile contexts are explicitly bounded. |
| Goals | 3/3 | Manifest-owned coherence, neutral raw bootstrap, complete composition, one reload owner, bounded recovery, data safety, preservation, and independent Ship are prioritized. |
| Success | 3/3 | Forty-six binary Given/When/Then criteria, explicit reload counts, scenario/error matrices, and evidence categories define observable completion. |
| Scope | 3/3 | In-scope, non-goals, current-feature preservation, browser boundary, migration prohibition, complexity constraints, publication boundary, and Iterate triggers are explicit. |

**Total:** 15/15

**Clarity result:** PASS — Ready for Design.

No critical lifecycle requirement remains ambiguous. Exact implementation mechanisms and file manifest belong to Design. If a recorded assumption is disproven, use `$sdd-iterate` rather than weakening a requirement.

## 19. Define quality gate

| Required gate | Result |
| --- | --- |
| 1. Measurable convergence invariant | Pass — Sections 3.5–3.6 and AC-01–AC-03 define identity, convergence, and bounded failure. |
| 2. Coherent generation defined | Pass — Sections 3.1–3.3 require matching document, controller, and application/cache generation. |
| 3. Raw-document behavior explicit | Pass — RQ-02 and AC-04–AC-05 make raw content hidden/inert and bootstrap-only. |
| 4. Complete composition defined | Pass — RQ-03 and AC-07–AC-09 derive exact presence/order from the manifest. |
| 5. LF and CRLF explicit | Pass — RQ-04 and AC-10 require equivalent semantic outcomes. |
| 6. Module identity unambiguous | Pass — RQ-05 and AC-11–AC-12 cover false presence and duplication. |
| 7. Reload ownership explicit | Pass — RQ-06 and AC-13 establish one coordinator. |
| 8. Reload budget explicit | Pass — RQ-07, AC-14–AC-15, and the scenario matrix set the maximum to one per attempt/path/generation. |
| 9. No-update behavior explicit | Pass — RQ-11 and AC-22 require informative status and zero reload. |
| 10. Real-update behavior explicit | Pass — RQ-12 and AC-23–AC-24 cover discovery through final matching generation. |
| 11. Failure behavior explicit | Pass — RQ-13/RQ-18 and AC-25/AC-30–AC-32 preserve the current app or show bounded retry. |
| 12. Offline states correctly separated | Pass — RQ-15–RQ-17, AC-06/AC-27–AC-29, and the scenario matrix distinguish all three states. |
| 13. Cache cleanup ownership explicit | Pass — RQ-19 and AC-33–AC-34 protect unrelated caches and persistence. |
| 14. Last-resort reset data-safe | Pass — RQ-20 and AC-35–AC-37 require explicit confirmation, narrow scope, cancellation, and persistence protection. |
| 15. Browser scope explicit | Pass — RQ-23 and AC-41 define Chrome/Edge/Chromium PWA and exclude Firefox/Safari only from this matrix. |
| 16. Test/evidence categories explicit | Pass — Section 13 and AC-42 define real commands and five evidence categories. |
| 17. Data compatibility explicit | Pass — RQ-21, AC-38, and Section 14 prohibit schema/migration changes. |
| 18. Publication boundary explicit | Pass — Section 16 and AC-46 separate Ship from optional authorized publication. |

**Gate result:** PASS — Ready for Design. No critical lifecycle ambiguity overrides the 15/15 clarity score.

## 20. Handoff

The exact next valid skill is `$sdd-design` using:

`.sdd/features/pwa-version-convergence/DEFINE.md`

Design must preserve all 26 requirements and map all AC-01 through AC-46. Do not proceed automatically to Design, Build, Ship, commit, push, deployment, or publication.
