# Compasso repository instructions

## Project

Compasso / Every Second Counts is a personal productivity, learning, and knowledge application.

Its core learning cycle is:

`Planejar → Executar → Registrar evidências → Recordar → Refletir → Ajustar`

- Prefer changes that improve meaningful learning, execution, evidence, reflection, or adjustment.
- Do not optimize for vanity metrics, dashboard noise, streak pressure, or empty gamification.
- Preserve the user's ability to understand the next decision or action.

## Architecture

- The production application is a static PWA delivered by GitHub Pages.
- Runtime code is HTML, CSS, and vanilla JavaScript. There is no production framework or required application build step.
- npm, Node, and Playwright are test and fixture infrastructure; they are not runtime dependencies.
- The application is local-first and must remain usable from a complete offline cache.
- `index.html` owns the base document, direct storage bootstrap, core state/render behavior, and JSON backup/restore entry points.
- `storage.js` owns browser persistence. IndexedDB is primary; localStorage is a bounded compatibility mirror and fallback where available.
- `app-manifest.js` is the source of truth for application modules, composition order, cached assets, cache generation, collections, and shared contracts.
- `service-worker.js` owns application-shell caching, controlled-navigation composition, update lifecycle behavior, and offline delivery.
- `feature-runtime.js` owns feature registration, ordered hooks, commands, selectors, routes, services, delegated actions, errors, and render metrics.
- `state-foundation.js` owns collection catalog use, idempotent state normalization, merge rules, tombstones, and conflict preservation.
- `app-services.js` exposes stable domain-service adapters through the feature runtime.
- `design-system.css`, `design-system-model.js`, and `design-system-feature.js` form the shared visual, responsive, and accessibility system.
- Feature modules should register through existing runtime contracts. Do not replace global render/save behavior or create parallel infrastructure without demonstrated need.
- Features must not inject runtime `<style>` tags. Put durable styles in the existing static design-system architecture.
- Read `README.md` and the relevant files under `docs/` before changing a durable contract.

## Data ownership and compatibility

- User content belongs to the user and is stored locally by default.
- Preserve IndexedDB data, localStorage compatibility, JSON backup/restore, Markdown/vault portability, and existing user content.
- Treat persistence, normalization, backup, restore, sync, and export formats as compatibility contracts.
- Schema changes require explicit versioning, migration design, acceptance criteria, and rollback.
- Migrations must be idempotent and safe to rerun.
- Old local data and exported files must remain supported unless an approved feature explicitly changes that contract.
- Recovery and fallback paths must preserve the last valid data whenever possible.
- Never clear IndexedDB, localStorage, caches, backups, or vault data as a casual recovery mechanism.
- Never equate application-shell recovery with user-data recovery.
- Keep example data generic and free of personal information.

## Offline and PWA

- Offline behavior is a first-class requirement, not a later enhancement.
- Service Worker changes require proportional install, activate, update, cache, composition, controlled-startup, and offline validation.
- Manage application generation through the current manifest architecture; do not introduce a competing version source.
- Do not hardcode a cache generation in repository instructions, tests, or recovery guidance when it can derive from the manifest.
- Cache cleanup must target only caches unambiguously owned by Compasso and must preserve unrelated same-origin caches.
- Keep user persistence independent from Service Worker cache replacement.
- A Service Worker already activated in an installed PWA generally requires a corrected forward generation for rollback; reverting Git alone does not update installed clients.
- A normal page reload does not prove installed-PWA close/reopen, controller transition, or offline-start behavior.
- Attribute physical installed-PWA observations to the person who performed them. Do not claim automation or Codex performed them.

## CodeGraph first

> If `.codegraph/` exists and is valid, use CodeGraph before broad source-code exploration.

- Use CodeGraph first to locate ownership, callers/callees, feature dependencies, persistence paths, blast radius, and affected tests.
- Prefer `codegraph explore`, `codegraph node`, `codegraph callers`, `codegraph callees`, `codegraph impact`, or the matching MCP interface supported by the installed tool.
- Confirm index health with the actual supported status command when freshness is uncertain.
- After CodeGraph narrows the area, inspect the current source files and documentation before editing.
- CodeGraph is a local generated index, not the source of truth.
- Source files, repository history, tests, and current worktree state remain authoritative.
- Do not commit `.codegraph/` unless the tool's contract and an explicit repository decision require it.
- Do not invent CodeGraph commands or install repository dependencies to obtain it.

## SDD workflow

Scoped product features follow:

`Brainstorm → Define → Design → Build → Ship`

- Brainstorm is optional only when problem, users, constraints, success, and approach are already clear.
- Define, Design, Build evidence, and Ship verification are mandatory for scoped product features.
- Use Iterate when requirements, scope, Design, or evidence assumptions change.
- Use `$sdd-workflow` when the correct phase is unclear.
- Inspect `.sdd/` before creating anything. Continue an existing relevant feature instead of creating a duplicate.
- Do not restart, overwrite, or weaken completed SDD work.
- Build may edit only files in the approved Design manifest.
- If Build needs another file or a material behavior change, return through the correct Iterate/Design process first.
- Treat the local checkout and current feature artifacts as authoritative over public-branch assumptions.
- Repository maintenance and agent-instruction changes do not require fake product-feature artifacts; route them through the smallest valid maintenance workflow.
- Ship is formal SDD closure. It does not mean commit, push, merge, deployment, or publication.
- Deployment and publication always require separate explicit authorization.

## Before editing

Before any modification, inspect and report:

- repository root and applicable `AGENTS.md` files;
- current worktree path, branch, and HEAD;
- `git status`, including staged, modified, and untracked files;
- relevant existing SDD features and reports;
- CodeGraph index and relevant graph paths when available;
- authoritative documentation, manifests, build/test definitions, and CI;
- the complete diff for any overlapping user work.

Rules:

- Never overwrite unrelated user work.
- Never reset, stash, restore, discard, or reformat user changes merely to obtain a clean tree without explicit authorization.
- Multiple worktrees may exist. Confirm the exact path and branch before every mutating operation.
- Do not copy feature changes between worktrees unless explicitly authorized and reviewed.
- Preserve line endings and generated/local artifacts according to repository contracts.

## Scope discipline

- Make the smallest coherent change that solves the approved problem.
- Preserve behavior, data, routes, and contracts outside scope.
- Avoid opportunistic refactoring, renaming, formatting, and dependency changes.
- Do not add a framework, backend, remote service, build architecture, or dependency for convenience.
- Do not perform a broad rewrite without evidence that a smaller change cannot satisfy the requirement.
- Do not change schemas, collection semantics, backup/export formats, sync behavior, or migration contracts unless explicitly approved.
- Keep models deterministic and UI-independent where the current architecture already separates them.
- Prefer existing runtime hooks, commands, selectors, events, services, and design-system primitives.

## Testing

Read commands from `package.json`; do not assume or invent validation commands.

Current repository-supported commands are:

- `npm test` — Node contract/model tests.
- `npm run build:test` — compose the browser-test application fixture.
- `npm run test:browser` — compose and run Playwright browser tests.
- `npm run test:all` — run Node and browser suites.

Validation rules:

- Run focused tests during implementation.
- Run broader suites proportionate to behavior, persistence, PWA, and UI risk.
- Record the exact command, exit status, result, and relevant environment limitation.
- Never claim a test passed if it was skipped, not run, or failed before its assertions.
- Distinguish product failures from environment-specific or missing-test-artifact failures with evidence.
- Do not call a suite green when any test failed, even if the failure is classified non-product.
- Do not create or update snapshots blindly.
- Visually inspect snapshot changes before accepting them, and document why the baseline changed.
- Existing passing tests do not replace missing manual installed-PWA or visual evidence when acceptance requires it.

## Critical test areas

Choose risk-proportionate coverage from these areas:

- create, read, update, delete, reopen, and duplicate prevention;
- IndexedDB/localStorage persistence and quota/fallback behavior;
- schema normalization, migrations, legacy data, tombstones, and merge conflicts;
- interrupted, paused, finishing, recovered, and completed sessions;
- reload, browser reopen, installed-PWA reopen, and controller changes;
- JSON backup/export/import and privacy options;
- Markdown/vault ZIP and directory import/export, merge, copy, replace, and round-trip portability;
- reviews, scheduling, progress calculations, evidence, and analytics;
- offline startup, raw/controlled navigation, Service Worker lifecycle, cache ownership, and composition;
- exact-once, ordering, idempotency, and collision behavior;
- keyboard, focus, dialogs, status/error handling, responsive layout, and accessibility.

Not every change requires every test. The test scope must match the risk and acceptance criteria.

## Accessibility and UX

For relevant UI changes, verify:

- logical keyboard order and native Enter/Space activation;
- visible focus and focus not hidden by layout;
- semantic controls and meaningful labels/accessibility names;
- dialog initial focus, Escape/Cancel behavior, focus containment where modal, and focus return;
- normal-text, large-text, focus, and meaningful-boundary contrast;
- no global horizontal overflow at 360px/mobile and 200% zoom;
- appropriate touch targets, including the current coarse-pointer contract;
- reduced-motion behavior;
- readable loading, empty, error, recovery, success, completed, and disabled states;
- no important meaning conveyed by color alone.

UI changes should improve a user decision or action rather than add dashboard noise.

## Security and privacy

- Keep user data local-first by default.
- Do not send personal content to external services without informed opt-in and an approved contract.
- Do not add telemetry casually.
- Never commit credentials, tokens, private keys, recovery values, personal backups, or `.env` contents.
- Integrations must use the minimum permissions required and make remote effects clear.
- Destructive actions require explicit confirmation and should be reversible where practical.
- Diagnostics and logs must not expose user content, credentials, or sensitive URLs.

## MCP direction

- MCP remains a separate local capability, not an insecure server embedded in the static PWA.
- Start read-only from backup JSON or Markdown explicitly selected by the user.
- Write or live access requires explicit permissions, confirmation, auditability, reversibility, and a secure bridge.

## Git and publication safety

- Obtain explicit authorization before commit when the user has not requested it.
- Obtain explicit authorization before push, merge, force push, deployment, GitHub Pages publication, or other publication.
- Obtain explicit authorization before destructive Git operations.
- Never push unfinished work to `main` merely as backup.
- A pushed feature/checkpoint branch does not imply Ship, merge, deployment, or publication.
- Do not rewrite or squash unrelated history.
- Preserve user-owned branches, worktrees, staged files, and uncommitted changes.
- Report every Git action actually performed and never imply an action occurred when it did not.

## Definition of done

A change is done only when:

- it solves the intended problem and satisfies its acceptance criteria;
- data compatibility and user content are preserved;
- offline/PWA behavior is preserved where applicable;
- relevant tests and required manual evidence pass;
- no out-of-scope regression or unauthorized file change remains;
- limitations, deviations, environment constraints, and residual risks are documented;
- the required SDD phase and evidence gate are complete.

## Agent response expectations

Every handoff should state:

- diagnosis and outcome;
- repository/worktree, branch, and relevant baseline;
- files and documentation inspected;
- files changed and why;
- data, schema, migration, backup, and offline impact;
- tests and checks actually run, with results;
- evidence source, especially Codex-observed versus user-observed manual validation;
- remaining limitations, blockers, and residual risks;
- Git, deployment, and publication actions actually performed;
- exact next valid SDD phase or skill when applicable.

Never fabricate success, evidence, visual inspection, installed-PWA behavior, or repository state.
