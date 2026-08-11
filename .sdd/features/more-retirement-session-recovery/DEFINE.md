# DEFINE: Retirada de Mais e recuperacao do encerramento de sessoes

## Metadata

- Feature: `more-retirement-session-recovery`
- Phase: Define
- Status: `Complete (Built)`
- Date: 2026-08-11
- Source: confirmed user requests to remove every section shown on `Mais`, remove the `Mais` navigation entry, publish through a new branch/PR, and fix sessions that cannot be completed
- Baseline: `origin/main` at `f15c4573cfd0f9b2ce7ae4ceadd075cab598bc61`

## Problem statement

The primary navigation still exposes `Mais`, a hub that groups Notes, Relations, Contextual AI, settings, backup, Drive, and vault shortcuts. The learner explicitly wants that hub and its navigation entry removed to reduce interface surface. Removing the hub must not delete, migrate, or invalidate the underlying knowledge, configuration, backup, or vault capabilities.

Separately, the current Session and Deep Work completion flows depend on the source item still existing. A regular Session whose source disappears remains active because `Encerrar sessão` refuses to open the completion form. Deep Work recovery has the same dependency when reopening an active session. An unavailable source must not trap an execution record indefinitely.

## Target users

- The existing Compasso learner using the local-first PWA.
- Learners with legacy, deleted, archived, unavailable, or partially restored source records behind an active Session or Deep Work record.
- Keyboard, screen-reader, mobile, zoomed, offline, and installed-PWA users.

## Goals and measurable requirements

| ID | Priority | Requirement | Observable result |
| --- | --- | --- | --- |
| R-001 | MUST | The primary navigation SHALL contain only `Hoje`, `Frentes`, `Journal`, and `Revisão`. | No visible or focusable `Mais` navigation control exists. |
| R-002 | MUST | The application SHALL stop composing the `Mais` hub and every section shown inside it. | The `Mais` hero, Notes/Relations/Contextual AI cards, system-action panel, and hub vault container do not exist in the rendered DOM. |
| R-003 | MUST | A legacy request for the retired `more` route SHALL degrade to `Hoje`. | The learner sees `Hoje`; history is normalized to the supported route and no blank view appears. |
| R-004 | MUST | Notes, Relations/graph, Contextual AI, settings, Drive, JSON import/export, and vault behavior SHALL remain intact outside the retired hub. | Existing direct routes and global/settings controls continue to work without data loss. |
| R-005 | MUST | A regular Session SHALL remain completable when its source item is unavailable. | The completion form opens, explains the unavailable origin, and saves the Session and canonical Evidence without recreating or updating the missing source. |
| R-006 | MUST | An active or finishing Deep Work Session SHALL remain resumable and completable when its source item is unavailable. | The existing Deep Work completion UI opens and saves the terminal record/Evidence without recreating the source. |
| R-007 | MUST | Normal Session and Deep Work completion behavior SHALL remain unchanged when the source exists. | Existing resource progress, Evidence, capability context, persistence, and continuation behavior remain valid. |
| R-008 | MUST | Persistence failure SHALL remain recoverable. | The last valid active/finishing record remains available for retry and no false completion is shown. |
| R-009 | MUST | The change SHALL preserve `compasso.state.v3` and all existing persistence/export contracts. | No schema, migration, collection, ownership, merge, tombstone, or backup format changes. |
| R-010 | MUST | Installed clients SHALL receive the corrected shell through the existing PWA architecture. | A forward cache generation is used; the Service Worker implementation and ownership rules are unchanged. |

## Scope

### In scope

- Remove the `Mais` primary-navigation entry.
- Stop composing the complete `Mais` hub and its visible sections.
- Route retired `?view=more` requests safely to `Hoje`.
- Preserve direct access to `notes`, `dictionary`, and `context` routes.
- Preserve top-level settings, JSON backup/restore, Drive, and vault controls.
- Permit regular Session completion without an available source record.
- Permit Deep Work recovery/completion without an available source record.
- Focused model, browser, accessibility, offline/PWA, and regression tests.
- Forward PWA generation required by changed cached runtime assets.

### Out of scope

- Deleting Notes, Relations, graph, Contextual AI, Drive, backup, or vault data or code.
- Removing or renaming their direct routes.
- Relocating those advanced surfaces to a new hub.
- Changing experience-level preferences.
- Changing Session/Evidence ownership, `sessionId` provenance, progress semantics, or `learningSignals` behavior.
- Schema changes, migrations, new collections, dependencies, frameworks, backends, or external AI.
- Visual redesign outside the removed hub and the unavailable-source completion state.
- Deployment, merge, or GitHub Pages publication.

## Business rules

1. Removing a navigation surface is not authorization to remove its data domain.
2. `Mais` is retired as both a primary area and a rendered hub; it must not remain as an empty destination.
3. A direct legacy `more` URL resolves to `Hoje`; protected advanced deep links retain their own routes.
4. No unrelated primary navigation item may be marked current while a protected advanced deep link is open.
5. Missing source records never trigger inference, recreation, reassociation, or progress updates.
6. Session and Evidence remain owned by their existing records and canonical `sessionId` relationship.
7. Evidence remains explicitly entered for regular Session completion under the existing contract.
8. Deep Work retains its existing derived Evidence behavior.
9. Failure to persist completion must preserve the retryable record and learner input.

## Constraints and dependencies

- Static vanilla-JavaScript PWA; no production build framework.
- Local-first IndexedDB with existing localStorage compatibility.
- Existing runtime, information-architecture, Session, Deep Work, Evidence, manifest, and Service Worker contracts.
- `compasso.state.v3` remains unchanged.
- `app-manifest.js` remains the single PWA-generation source.
- `.codegraph/` is absent in the clean worktree; current source and tests are authoritative.

## Acceptance scenarios

### AT-01 — Four primary areas

**Given** the application starts in any experience mode
**When** primary navigation is rendered
**Then** it exposes exactly `Hoje`, `Frentes`, `Journal`, and `Revisão` in that order and exposes no `Mais` control.

### AT-02 — Mais hub retired

**Given** the application has finished booting
**Then** no `moreView`, `Mais` hero, advanced shortcut grid, system-action panel, or `iaMoreVault` container is composed.

### AT-03 — Legacy Mais fallback

**Given** a bookmark opens `?view=more`
**When** information architecture resolves the route
**Then** `Hoje` is visible, `Hoje` is current, and the URL is replaced with the supported `today` route.

### AT-04 — Protected deep links remain valid

**Given** the learner opens `notes`, `dictionary`, or `context` directly at the required experience level
**Then** the requested existing surface loads, its route remains stable across reload, and no unrelated primary item is announced as current.

### AT-05 — System controls remain available

**Given** `Mais` is absent
**When** the learner opens the existing settings/global controls
**Then** settings, Drive, JSON export/import, and vault entry points remain operable.

### AT-06 — Existing-source Session regression

**Given** a normal resource or capability Session has an available source
**When** the learner completes it with valid Evidence
**Then** the existing Session, resource-progress where applicable, Evidence, capability provenance, and continuation behavior are preserved.

### AT-07 — Missing-source regular Session recovery

**Given** an active regular Session references a source item that is unavailable
**When** the learner chooses `Encerrar sessão`, enters valid Evidence, and saves
**Then** the Session becomes completed, canonical Evidence retains the Session `sessionId`, no source is recreated or updated, and the normal continuation appears.

### AT-08 — Missing-source Deep Work recovery

**Given** an active or finishing Deep Work record references an unavailable source
**When** the learner resumes and saves its completion
**Then** the record becomes completed, its existing Evidence behavior is preserved, and no source is recreated or updated.

### AT-09 — Explicit Evidence validation

**Given** a regular Session source is unavailable
**When** the learner attempts to save without the required Evidence summary
**Then** completion is blocked at the Evidence field and the Session remains retryable.

### AT-10 — Persistence failure recovery

**Given** storage rejects a completion save
**When** a missing-source Session or Deep Work completion is submitted
**Then** the prior active/finishing record and entered draft remain available, focus moves to the existing error target, and no false terminal record or Evidence remains.

### AT-11 — Accessibility and responsive behavior

**Given** keyboard navigation, screen reader use, 360–390 px mobile, 200% zoom, coarse pointer, or reduced motion
**When** the learner uses primary navigation or completes a missing-source Session
**Then** controls retain meaningful names, logical focus, usable touch targets, and no new horizontal overflow or motion dependency.

### AT-12 — Offline/PWA and data compatibility

**Given** existing or legacy user data and a fully cached app shell
**When** the updated generation starts offline
**Then** the application boots with the same state version and protected data/contracts intact, using the unchanged Service Worker architecture.

## Error and boundary scenarios

- A missing regular source removes resource-progress projection only; it does not block Session/Evidence persistence.
- A source that disappears between opening and submitting completion is treated as unavailable at commit time.
- A missing capability still uses the Session's stored attempt/context text for display without inferring a new association.
- An unknown route other than protected deep links continues to fall back to `Hoje`.
- A stale `more` history entry cannot produce an empty view on startup or popstate.
- Storage rejection preserves the previous record and draft under the existing rollback behavior.
- Existing unlinked legacy Sessions and Evidence remain valid and receive no inferred links.

## Compatibility invariants

- `compasso.state.v3` and every collection remain unchanged.
- IndexedDB/localStorage behavior and state normalization remain unchanged.
- JSON backup/restore and Drive reconciliation remain unchanged.
- Markdown/vault portability, Notes CRUD/search/source links, wikilinks, Relations, and graph derivation remain unchanged.
- Contextual AI routes and persisted `explanationEvaluations`, error records, references, and Active Recall questions remain unchanged.
- Session, Deep Work, Execution Session, Evidence, and `learningSignals` contracts remain unchanged.
- No inferred legacy associations and no automatic capability progress or next-attempt changes.
- Service Worker architecture and cache ownership remain unchanged.

## Assumptions and risks

- The observed user failure is addressed by the reproducible unavailable-source trap: fresh-source Session and Deep Work completion tests pass, while removing the active Session's source reproduces a blocked close with `O item desta sessão não existe mais`.
- Protected advanced surfaces may have no primary-navigation item announced current after `Mais` retirement; this is preferable to falsely announcing an unrelated area.
- Removing the hub reduces discoverability of protected advanced routes. Relocation is intentionally deferred rather than invented in this scope.

## Clarity score

| Dimension | Score | Evidence |
| --- | --- | --- |
| Problem | 3/3 | The user identified both unwanted UI and inability to conclude a Session; the latter is reproduced in current source. |
| Users | 3/3 | Existing Compasso learners, including legacy/missing-reference and accessibility contexts, are explicit. |
| Goals | 3/3 | Ten measurable requirements define removal, safe fallback, recovery, and preservation. |
| Success | 3/3 | Twelve observable acceptance scenarios cover happy, failure, legacy, responsive, and offline behavior. |
| Scope | 3/3 | UI retirement and completion recovery are bounded; protected domains and incompatible changes are explicit non-goals. |

**Total: 15/15 — PASS.**

## Open questions

None blocking Design. Exact integration points, unavailable-source presentation text, forward cache generation, closed manifest, and focused test allocation are Design decisions.

## Revision history

| Revision | Date | Author | Change |
| --- | --- | --- | --- |
| 1.0 | 2026-08-11 | Codex | Initial Define for the confirmed navigation retirement and reproduced Session/Deep Work recovery defect. |

## Define gate

`Complete (Built)`

## Next skill

`$sdd-design`
