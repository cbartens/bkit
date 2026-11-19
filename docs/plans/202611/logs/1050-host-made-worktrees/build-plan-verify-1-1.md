Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1
Loosened: none
Fingerprint: 937b7b3e2ba6bed202dcfa79ca87913ef4c50b4a3159d305428363e952cf4b24
<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- TASK 1 satisfied against the group diff (`.bkit/core/engine/commands/lib.ts`, `.bkit/core/engine/commands/lib.test.ts`, `dist/commands/lib.js`); every changed file is inside the brief's `Deviations` allow-list.
- `inLinkedWorktree(cwd)` and `sessionCheckout(cwd)` are exported beside `repoRoot` (`lib.ts:1164`, `lib.ts:1179`). `statusLocation` (`lib.ts:1222`) uses `sessionCheckout` for ship, and for non-ship returns `.worktrees/{fid}` holding the file, else the session's linked worktree when its log directory exists, else the main checkout.
- DONE WHEN grep: `grep -n "show-toplevel" .bkit/core/engine/commands/lib.ts` hits lines 589, 692, 705, 785 and 1180 (inside `sessionCheckout`); none falls inside `statusLocation` (lines 1222-1245).
- `pnpm exec vitest run .bkit/core/engine/commands/lib.test.ts`: 79 passed, including `a host-made linked worktree holds the run` (log-directory-only and status-file-present cases) and the existing statusLocation tests.
- Derived Test Matrix row 3 (`statusLocation` from a host-made linked worktree) maps to TASK 1's TEST FIRST test, which exists and passes.
- Callers checked: `lib.ts:577` (in-progress lookup), `status.ts:389` and `status.ts:448` (`status path` verb), `workflows.ts:297` and `workflows.ts:2042`. All pass through `statusLocation`; their result changes only when the session sits in a linked worktree that holds the run's log directory and `.worktrees/{fid}` has no status file.
- Test-first audit (`build-tests-green-1-1.md`): `Enforced: true`, `Verdict: PASS`, `Gaps: 0`, `Unproven: 0`; no Taken over, Changed by a code step, Updated tests or Already landed sections.
- No decision records and no earlier verify or remediation reports for group 1 were supplied. `docs/observability.md` present; the change adds no error path to log.

## Identified Gaps Log

None
