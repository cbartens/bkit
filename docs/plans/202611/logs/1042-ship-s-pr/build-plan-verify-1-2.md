Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `docs/plans/202611/logs/1042-ship-s-pr/build-plan-verify-1-1.md`: `CONCERNS`, 2 gaps at `Fixable: true` (TASK 1 test `--flush refused by dev does not merge a leftover tip that changes code` not green for a missing setup write; TASK 2 file-level run failing on that same test).
- `docs/plans/202611/logs/1042-ship-s-pr/build-plan-gaps-remediate-1-1-log.md`: both gaps fixed by a setup-only addition to that test (commit `6422b197e`).

## Notes

- Both earlier gaps are closed. `pnpm vitest run .bkit/core/engine/commands/workflow/workflows.test.ts .bkit/core/engine/commands/workflow/branches.test.ts`, run here: 2 files, 531/531 passed.
- TASK 1: satisfied. All six TEST FIRST tests pass, and the existing tests `closePr with base dev still merges`, `closePr refuses when the PR base is unknown` and `--flush refused by dev publishes the FAILED record through a PR` pass, untouched by the diff. `closePr` reads the tip, fetches it, refuses on `minPushOutside(...).outside` naming the branch and paths, runs `merge --no-ff --no-commit -X ours`, calls the exported `restoreBranchRows` while `MERGE_HEAD` is set, commits, takes `head` after the merge, reuses an open PR through `probePr` and names the branch when `gh pr create` fails. `ghStub` has options with unchanged defaults. `dist/commands/workflow/{workflows,branches}.js` carry the change. The `...-1509` deferral has a `CLOSED` row referencing `1042`. The plain `ls-remote` in place of `ls-remote --exit-code` gives the same behaviour (empty answer = no branch, failed run = `cannot read origin's {branch}`), as attempt 1 judged; no gap.
- TASK 2: satisfied. Both TEST FIRST tests and `--flush refused by dev links the handover comment at dev once the PR merged` pass; `closePr` returns `sha: head` and `landFailedRecord` links `close-pr-open` at it; `dist/` refreshed; the `...-830` deferral has a `CLOSED` row.
- TASK 3: satisfied (already ticked after attempt 1). Lines 131-132, 150, 825, 1128 and 1354 of `.bkit/core/.bkit/workflows.md` and lines 138 and 357 of `docs/deployments.md` carry the clause, the `docs/testing.md` row is updated, `811-leftover-...` has a `SUPERSEDED` row, and `.bkit/workflows.md` and `.bkit/version` are re-rendered.
- Test-first audit (`build-tests-green-1-2.md`): `Enforced: true`, `Gaps: 0`, `Unproven: 0`. Changed by a code step: TASK 1 `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev does not merge a leftover tip that changes code`, reason "setup-only addition: the test never wrote the ship FAILED record into `wt`". Its added lines are one `write(wt, ...status.jsonl...)` setup call; no expectation is removed or loosened, so no gap. No `Taken over`, `Unproven`, `Updated tests` or `Already landed` sections.
- `.bkit/instructions.md` (a file the brief's Deviations say not to change) changed in the remediation commit `6422b197e`, together with `DETAILS.md` and `docs/capabilities.md`. The change is the byte-identical copy of the `Ship exception` paragraph TASK 3 edited in `.bkit/core/.bkit/workflows.md`; the file's header says `pnpm instructions:sync` rewrites catalog copies, and `bkit:generate` runs that sync. Judged generated output of TASK 3's planned edit, not a hand edit; no gap.
- Word ceiling: `pnpm bkit:text:ceiling check` reports `ok — prompts 83837, workflows 57977`, as the Deviations require.
- Derived Test Matrix: all 8 rows sit in their task's TEST FIRST and pass. Documentation Updates: all 4 rows done. `docs/observability.md` is present; the new failures go through the existing `ctx.log` / `stop` paths.
- No decision records (`build-decision-*.md`) and no `build-plan-current.md` were present.

## Identified Gaps Log

None
