# Attempt rehearsal — controlled changes

## 2026-09-16 — Iterate after Ship review

- Type: modifying integration/evidence; no change to problem, users, scope, schema or the 13-path product manifest.
- Cause: navigation preserves an abandoned draft; computed mobile footer contradicts Design; maintained tests do not exercise all claimed acceptance.
- Affected: R-009/R-012, AC-04/05/06/13/15 evidence, AC-19 Design conformance; navigation-related portions of AC-07/20/21.
- Updated: DEFINE revision 1.3 (requirements valid, completed Build claim invalidated); DESIGN revision 1.2 (corrective section 21); BUILD_REPORT acceptance/status; new SHIP_REVIEW evidence.
- Deliberately untouched: production code, browser/Node tests, manifest generation, docs, storage/schema, other features, archived deliveries and Git history.
- Gate: NEEDS REVISION. Corrective Build and repeated Ship required; no archive/publication.

## 2026-09-16 — Corrective Build

- Same requirements, architecture, schema and 13-path product manifest.
- Fixed navigation/history discard and pending-save lifecycle in Today; scoped CSS now enforces the approved mobile footer column.
- Added maintained skip/empty/partial/archive/delete/navigation/pending-save cases, actual JSON/Markdown/ZIP marker inspection and full rehearsed Session/Evidence continuity, including offline.
- Final canonical gate: exit 0, 218 Node + 272 browser passed, 0 failed, 24 conditional skips. First canonical run was interrupted and does not count as a completed gate.
- DEFINE/DESIGN: Complete (Built). BUILD_REPORT: local corrective PASS with individual 21/21 matrix; historical findings/results retained.
- SHIP_REVIEW untouched; repeated Ship, physical installed-PWA and remote/publication gates remain separate. Delivery 4 not released. No Git/publication mutation.
