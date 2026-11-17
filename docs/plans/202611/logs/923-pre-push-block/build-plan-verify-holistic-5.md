Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14
Loosened: none
Fingerprint: 8ae04fcef73373bae1dbbe756c2bc50629f3f3d643a285f9c018efb3862be3d8
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

4 of 4 (group 1 Tasks 1-4, group 2 Tasks 5-9, group 3 Tasks 10-12, group 4 Tasks 13-14).

## Integration Gaps

1.

- The § Git hooks — Husky `PR conflict check` bullet (`.bkit/core/.bkit/templates.md:328`, rendered `.bkit/templates.md:328`), written by Tasks 3 and 9, says "The lookup keeps only same-repo PRs". Group 4 changed that lookup. Task 13 also keeps a cross-repository PR whose head repository is the push target parsed from `$2`. Task 14 queries with `--limit 1000`, and a full page with no match makes the conflict check warn and the CI-suppressor guard block a `[skip ci]` head. Neither case is in the bullet or its warn-only list. The fix is a text change to both copies (source, then `bkit upgrade`), so the plan makes no open choice.

Checked and consistent:

- The shared open-PR lookup (Tasks 1, 9, 13, 14) feeds the CI-suppressor guard (`OPEN_PR`, `PR_LOOKUP`, `PR_LOOKUP_FULL`) and the `PR conflict` block (`PR_LOOKUP = ok`, `OPEN_PR`, `PR_BASE`). The `PR conflict` block holds the switch (Task 5), the shallow-clone skip (Task 12), the explicit refspec and tree-OID check (Task 7) and the empty attribute source (Task 6), in that order. The added and removed lines of `.bkit/templates/.husky/pre-push` and `.husky/pre-push` against `origin/dev` are identical.
- Ship (Tasks 5, 10): all 6 `branches push` lines in `.bkit/core/workflows/bkit-ship.md` carry `BKIT_PR_CONFLICT_CHECK=false`, and so do the `none` render snapshot and the `.claude`, `.cursor`, `.opencode`, `.agents/skills` and `.agents/plugins` copies (6 of 6 each).
- Debug (Task 11): the 4 `branches push --mode=feature` lines carry the switch in the source, the snapshot and every host copy (4 of 4 each). The `--mode=dev` close push (line 763) is unchanged.
- Tip (Tasks 2, 8): `fires` returns true when `merge-tree` or `PUSH_BRANCH_SHA=` is missing. bkit's own `.husky/pre-push` has both, so the tip stays quiet there. `dist/checks/tips/catalogue.js` carries the tip.

## Previously Attempted

- `build-plan-verify-holistic-4.md`: `PASS`, Tasks 1-12, 3 groups. Group 4 (Tasks 13, 14) did not exist yet. Its full gate did not run, because of the tests lock and machine load.
- `build-plan-verify-holistic-3.md`: `CONCERNS` (Task 11 broke `workflow-shape.test.ts` `pushFences`), closed by `build-plan-gaps-remediate-holistic-3-log.md`.
- `build-plan-verify-holistic-2.md`: `PASS`, Tasks 1-9. `build-plan-verify-holistic-1.md`: `CONCERNS`, a stale ship snapshot, closed by `build-plan-gaps-remediate-holistic-1-log.md`. `build-plan-gaps-remediate-holistic-2-log.md` fixed `ship-verdict.integration.test.ts`.
- Group 4: `build-plan-verify-4-1.md` `CONCERNS` (Task 14's guard read a full page as no open PR), closed by `build-plan-gaps-remediate-4-1-log.md`. `build-plan-verify-4-2.md` `PASS`, Tasks 13-14. It deferred the stale `templates.md:328` line to this holistic check.

## Notes

- All 14 tasks are satisfied. Each `DONE WHEN` behaviour is present in the hooks, workflows, snapshots, host copies, tip and doc, and each named test exists and passes. The one gap is a cross-group doc mismatch, not a task's `DONE WHEN`.
- Full gate: `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exited 0 with `verdict: PASS`. Related batch: 136 files and 6563 tests passed (2 skipped). Named batch: 158 files and 8387 tests passed (2 skipped), including `husky-pre-push.integration.test.ts`, `dogfood-templates.test.ts`, `catalogue.test.ts`, `ship-invariants.test.ts`, `debug-ci-evidence.integration.test.ts`, `workflow-shape.test.ts` and `render/trackers.test.ts`. The node tests, oxlint and prettier also passed. Cloud-setup reported `db` and `cli` unavailable (non-blocking, low disk).
- Every Derived Test Matrix row has its test in its task's `DONE WHEN` or `TEST FIRST`, and every test exists in its target file. Task 10's row supersedes the Task 5 ship row, as Task 10's `DONE WHEN` says. The remediation also added `full page of fork PRs with a skip-ci head → CI-suppressor guard does not read it as no open PR`. The plan has no `Documentation Updates` section.
- No test-first audit report was supplied to this step, so Step 8 decided nothing.
- Decision records: `build-decision-1-1.md` (fix Task 4), `build-decision-1-2.md` (Task 5 switch) and `build-decision-2-1.md` (Tasks 10, 11). None accepts the gap above.
- Docs: `.agents/docs.md`, `docs/testing.md` and `docs/observability.md` § Scope were read. The hook's new lines report on stderr with the existing `[pre-push]` prefix.
- Out of scope, for the owner:
  - `docs/deployments.md` § Pre-push checklist (line 560) describes the CI-suppressor guard's cases but not the full-page block, and does not list the PR conflict check. No task names this file.
  - `build-decision-2-1.md` answers "fix all with flag that require it". The feature-branch pushes in `bkit-build`, `bkit-plan` and `bkit-design` do not set `BKIT_PR_CONFLICT_CHECK=false`, and the plan makes no choice about them.
  - The BLOCKED `Fix:` line `git fetch origin $PR_BASE && git merge origin/$PR_BASE` leaves no `origin/<base>` in a single-branch clone.
  - The branch carries `d8cee96cf` and `7b6a5e636`, which are not this feature's work. They appear in the feature diff.

## Identified Gaps Log

1 gap.


INTEGRATION: Tasks 3 and 9 (groups 1-2) wrote the `PR conflict check` bullet of `.bkit/core/.bkit/templates.md:328` and the rendered `.bkit/templates.md:328` as "The lookup keeps only same-repo PRs, so a fork PR with the same head branch name is ignored", but Tasks 13 and 14 (group 4) changed that lookup: it now also keeps a cross-repository PR whose head repository is the push target from `$2`, and a full 1000-PR page with no match makes the conflict check warn and the CI-suppressor guard block a `[skip ci]` head; the bullet and its warn-only list name neither, so the doc no longer describes what the hook does — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** PR conflict check doc bullet does not describe the group 4 lookup
  **Severity:** MEDIUM · **Class:** integration · **Fixable:** true · **Location:** `.bkit/core/.bkit/templates.md:328` · **Round:** 1
  - **DONE WHEN:** The `PR conflict check` bullet of § Git hooks — Husky in `.bkit/core/.bkit/templates.md` and the rendered `.bkit/templates.md` (regenerated by `bkit upgrade`) say the open-PR lookup keeps same-repo PRs plus a cross-repository PR whose head repository is the push target, and name the full-page case (1000 open PRs share the head branch name, none matches): the conflict check warns and the CI-suppressor guard blocks a `[skip ci]` head; both copies match.
  - **TEST FIRST:**
<!-- bkit:task 1 end -->
