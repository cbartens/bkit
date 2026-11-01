Verdict: PASS
Failures: 0
Fixable: false
Tasks: 12, 13

<!-- verdict:end -->

# Plan Verification

## Scope

Group 6

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-6-1.md` (attempt 1): FAIL, 7 test-first gaps; fixed in `build-plan-gaps-remediate-6-1-log.md` and accepted by the owner in `build-decision-1-3.md`.
- `build-plan-verify-6-2.md` (attempt 2): PASS, Tasks 12, 13. The group gate then failed on `comply-gate-wiring.test.ts` (build has two close lines) and a load timeout in `instructions.test.ts`; fixed or explained in `build-plan-gaps-remediate-6-2-log.md` (commit `ae15562ca`).

## Notes

- Test-first audit `build-tests-green-6-3.md`: `Enforced: true`, `Verdict: PASS`, `Gaps: 0`. TASK 12's eight `workflow-shape.test.ts` rows have recorded reds, `Changed since red` = `outside the test only`; the six `no-red` rows are cleared by the TASK 12 / 13 TEST EXCEPTION blocks and `build-decision-1-3.md` (owner `Decision: Accept`, not assumed).
- Code changed since attempt 2 (`git diff b710474b7 HEAD` outside `docs/plans`): only `.bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts` and `package.json` (`build.verify.maxAttempts` 2 → 3, the owner's decision, not a gap). TASK 12 / 13 code and tests are unchanged since the attempt-2 PASS.
- `comply-gate-wiring.test.ts` fix (commit `ae15562ca`) is correct and is not a weakening. `bkit-build.md` now has two mutually exclusive close lines (held close line 893, publish close line 944), so "exactly 1" became an exact count per phase: build 2, with exactly one carrying `--ending=held`; every other phase stays 1. The `--message` / `--flush`, `--outbox="{OUTBOX}"` and telemetry-embed assertions changed from `closeLines[0]` to every close line, so they are stricter. `never runs the grader itself` is unchanged. Each run takes one of the two paths, so one grader run per close still holds.
- Targeted run: `pnpm vitest run comply-gate-wiring.test.ts workflow-shape.test.ts` → 2 files, 269 tests passed, 15.5s.
- `instructions.test.ts` alone: 94 passed, 2 failed, both `Test timed out in 60000ms` (`has no findings` 220.6s, `sync has nothing left to rewrite` 78.9s), with no failed assertion, at load average 40-59 on 10 cores. Content check: `tsx .bkit/core/engine/tools/instructions.ts` (read-only mode: clause findings, block findings, coverage, store sync) → exit 0, no output, 1m04s. The corpus and `.bkit/instructions.md` agree; the failures come only from run time. This file is in no group-6 DONE WHEN, so it is not a gap.
- Advisory, not a gap (pre-existing test, outside this group's scope): those two tests pass `{ timeout: 60_000 }` explicitly, so the `[test-timeout-budget]` load scaling (x4-x5.5 here) does not reach them. At this load the group gate will hit the same timeout again. Re-run the gate at lower load, or the owner decides on the timeout separately; raising it is a gate change that needs the owner's confirmation.
- TASK 12 DONE WHEN still met: `workflow-shape.test.ts` passes now, and `trackers.test.ts` / `instructions-coverage.test.ts` passed in attempt 2 with no change since to `bkit-build.md`, the baseline or `.bkit/instructions.md`. TASK 13 DONE WHEN still met: `close-squash.integration.test.ts` / `ship-verdict.integration.test.ts` passed in attempt 2 (5 files, 395 tests) and neither the tests nor the engine / `dist/` have changed since. Not re-run, per the caller's targeted-test instruction.
- Earlier advisory still open (proposed separately): the Gate 16 sentence at `bkit-build.md` "the held close commits and pushes nothing" contradicts the held fence's `--message="chore({FID}): close-workflow held"` commit.

## Identified Gaps Log

None
