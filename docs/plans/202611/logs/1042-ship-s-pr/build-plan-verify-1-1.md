Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 3
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

None

## Notes

- Test-first audit (`build-tests-green-1-1.md`): `Enforced: true`, one `not-green` gap at `Fixable: true`, which stands as logged above. No `Taken over`, `Unproven`, `Changed by a code step`, `Updated tests` or `Already landed` sections, so no test was loosened.
- TASK 1: the engine work is all in the diff. `closePr` reads the tip with `git ls-remote`, fetches it, refuses on `minPushOutside(...).outside`, runs `merge --no-ff --no-commit -X ours`, calls the now-exported `restoreBranchRows` while `MERGE_HEAD` is set, commits, takes `head` after the merge, reuses an open PR through `probePr` and names the branch when `gh pr create` fails. `ghStub` has options and its defaults are unchanged. `dist/` is refreshed, and `...-1509` has a `CLOSED` row referencing `1042`. `branches.test.ts` passes (306/306, run here). In `workflows.test.ts`, 5 of the 6 TASK 1 tests pass, along with the three existing tests named unchanged. The task is held back only by the test-setup gap logged above.
- TASK 1 deviation, judged no gap: the plan asks for `ls-remote --exit-code` (exit 2 = no branch). The code runs a plain `ls-remote` and treats empty output as no branch and any failed run as `cannot read origin's {branch}`. That is the same behaviour.
- TASK 2: the code, both planned tests, the unchanged merged-PR test, `dist/` and the `...-830` `CLOSED` row are all in place. It is held back only because its DONE WHEN runs the whole `workflows.test.ts` file, which TASK 1's test still fails.
- TASK 3: satisfied. Every listed line in `.bkit/core/.bkit/workflows.md` (131-132, 150, 825, 1128, 1354) and `docs/deployments.md` (138, 357) carries the leftover-branch clause, and no line says a refused close or flush fails on a branch already on origin. The `docs/testing.md` row covers flush and close and the unmerged handover link at the pushed commit. `811-leftover-...` has a `SUPERSEDED` row naming `1042`, and `.bkit/workflows.md` and `.bkit/version` are re-rendered.
- Derived Test Matrix: all 8 rows sit in their task's TEST FIRST and exist in `workflows.test.ts`; 7 pass. Documentation Updates: all 4 rows are done. `docs/observability.md` is present; the new failures go through the existing `ctx.log` / `stop` paths, as the code around them does.
- No decision records (`build-decision-*.md`), no earlier verify reports and no remediation logs were supplied.

## Identified Gaps Log

Gaps: 2
TASK 1: `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev does not merge a leftover tip that changes code` — not-green: the test exits 0 with `skipped: "nothing-to-commit"` because, unlike `devOnlyRefused()` and the sibling leftover-branch tests, it never writes a ship FAILED record (`write(wt, `${REL}/status.jsonl`, ...)`) into `wt` after `refusedAfter(...)`, so the flush never reaches `closePr`; the engine side (`closePr` refusing on `minPushOutside(...).outside`, the reason passed into the exit-10 log by `landFailedRecord`) is in place. The fix is a setup-only addition to the test, which leaves its expectations as planned; the BLOCKED line's claim that the engine would have to fail a flush with nothing to land is wrong — Fixable: true
TASK 2: `pnpm vitest run .bkit/core/engine/commands/workflow/workflows.test.ts` does not pass (1 failed, 224 passed), so the DONE WHEN's file-level run is not met; both TASK 2 tests and `--flush refused by dev links the handover comment at dev once the PR merged` pass, and the only failure is the TASK 1 test above (same root cause, closed by the same setup fix) — Fixable: true
