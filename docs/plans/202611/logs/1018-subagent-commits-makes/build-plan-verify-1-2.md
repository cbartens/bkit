Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3
Loosened: none
Fingerprint: 225cf53efa42ade286ee9ac4d904b68a65780f6424334e039db44d3e1d54765e
<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-1-1.md`: PASS, Tasks 1, 2, 3, no gaps.
- `build-plan-gaps-remediate-1-1-log.md`: the group gate failed on `.bkit/core/engine/commands/conventions.test.ts`, because it read `step-base.ts` as a command file that exports no command. The fix added `step-base.ts` to `HELPER_SOURCES`, and the gate then exited 0.

## Notes

- Judged against `build-diff-1-2.md`. The brief's `Deviations` section is `publish=false` only and names no task.
- TASK 1: `.bkit/core/engine/commands/workflow/step-base.ts` exports `stepBase`. It imports only `../lib.js` and `./status.js`, and neither of those imports `tests-changed.ts` or `branches.ts` (checked with grep). The 3 `step-base.test.ts` tests pass. They run against a real-git scratch repo with a committed `status.jsonl`.
- TASK 2: with no `--base`, `testsChangedVerb` takes its base from `stepBase({ cwd: top })`. An explicit `--base` still wins. With no run it logs `no active run with a step-done row — measuring from HEAD` and uses `HEAD`. The help text now names the run's last step-done commit. No `.bkit/core/prompts/*` file changed. The 3 new `tests changed default base` cases pass.
- TASK 3: `scanDiffVerb` declares `--since-step` and `--file` in the verb spec. Passing both `--since-step` and `--base` is a usage error. A base that cannot be resolved exits `EXIT_DIFF_FAILED` with a log line. The 3 `branches scan-diff --since-step` cases pass: exit 0 for the committed fix, exit 0 for the uncommitted fix, exit 1 for the logs-only step.
- Remediation change: `conventions.test.ts` adds `step-base.ts` to `HELPER_SOURCES`, with a comment naming the two verbs that read it. This adds an allowlist entry for a real helper module. No assertion is removed or loosened.
- Verifier run: `pnpm exec vitest run` on `step-base.test.ts`, `tests-changed.test.ts`, `branches.test.ts` and `conventions.test.ts` gave 4 files and 329 tests passing (exit 0).
- Test-first audit (`build-tests-green-1-2.md`): `Enforced: true`, `Gaps: 0`, `Unproven: 0`. The 3 TASK 1 tests are `red-not-loaded` because the module did not exist yet. That is accepted, not a gap.
- Already landed: TASK 2 `.bkit/core/engine/commands/workflow/tests-changed.test.ts` "lists the same file when it is left uncommitted". The tests step's reason: the old `HEAD` default already listed an uncommitted edit, and the test guards that the result stays equal to the committed case. No gap.
- Derived Test Matrix: each of the 9 group 1 rows (TASK 1-3) has its test in that task's `TEST FIRST` / `DONE WHEN`. The `workflow-shape.test.ts` row belongs to TASK 4 in group 2.
- Error logging (`docs/observability.md`): the new failure paths report through `ctx.log` on stderr, the same way the code next to them does.
- No decision records (`build-decision-*.md`) were supplied.
- Outside the group's tasks, but generated and harmless: `.bkit/instructions.md` re-synced the `plan-task-ticking-owned-by-verify` entry. The `scan-diff` row in `.bkit/core/.bkit/cli.md` and `.bkit/cli.md` already lists the new flags (part of a TASK 5 Documentation Updates row). `dist/`, `.bkit/version`, `DETAILS.md` and `docs/capabilities.md` moved along with these files.
- Out-of-scope observation, not a gap, carried from attempt 1: the `stepBase` docstring says "a step with no row yet counts the whole run". The code actually measures from the run's last step-done row. Worth a wording check in group 2.

## Identified Gaps Log

None
